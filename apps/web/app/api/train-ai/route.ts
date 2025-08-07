import { createClient } from '@/lib/supabase/server';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { parseGeminiResponse } from '@/lib/parseResponse';

export interface StyleAnalysis {
  style_analysis: string;
  tone: string;
  vocabulary_level: string;
  pacing: string;
  themes: string[];
  humor_style: string;
  narrative_structure: string;
  visual_style: string;
  audience_engagement: string[];
  recommendations: {
    script_generation: string;
    research_topics: string;
    thumbnails: string;
    subtitles: string;
    audio_conversion: string;
  };
}



export async function POST(request: Request) {
  const supabase = await createClient();
  const { userId, videoUrls } = await request.json();

  if (!userId || !videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 3) {
    return NextResponse.json({ error: 'Invalid input: userId and at least 3 video URLs are required' }, { status: 400 });
  }

  try {
    // Fetch channel details from youtube_channels
    const { data: channelData, error: channelError } = await supabase
      .from('youtube_channels')
      .select('channel_name, channel_id, provider_token, refresh_token, channel_description, custom_url, country, default_language, view_count, subscriber_count, video_count, topic_details')
      .eq('user_id', userId)
      .single();

    if (channelError || !channelData) {
      return NextResponse.json({ error: 'Channel data not found' }, { status: 404 });
    }

    // Validate provider_token
    let accessToken = channelData.provider_token;
    try {
      await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { access_token: accessToken },
      });
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.data?.error === 'invalid_token') {
        // Token expired, refresh it
        if (!channelData.refresh_token) {
          return NextResponse.json({ error: 'No refresh token available, please reconnect YouTube' }, { status: 401 });
        }

        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: channelData.refresh_token,
          grant_type: 'refresh_token',
        });

        accessToken = tokenResponse.data.access_token;

        // Update provider_token in youtube_channels
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({ provider_token: accessToken, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('channel_id', channelData.channel_id);

        if (updateError) {
          console.error('Error updating provider_token:', updateError);
          return NextResponse.json({ error: 'Failed to update access token' }, { status: 500 });
        }
      } else {
        throw error;
      }
    }

    // Extract video IDs from URLs
    const videoIds = videoUrls
      .map((url: string) => {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v') || url.split('/').pop();
      })
      .filter((id): id is string => Boolean(id));


    // Fetch video details from YouTube API
    const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,contentDetails,statistics,topicDetails',
        id: videoIds.join(','),
        mine: true
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });


    // Validate video ownership
    const videos = videoResponse.data.items;
    for (const video of videos) {
      if (video.snippet.channelId !== channelData.channel_id) {
        return NextResponse.json(
          { error: `Video ${video.snippet.title} does not belong to your channel` },
          { status: 403 }
        );
      }
    }

    // Map video data for Gemini prompt
    const videoData = videos.map((item: any) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      tags: item.snippet.tags || [],
      duration: item.contentDetails.duration,
      viewCount: parseInt(item.statistics.viewCount, 10),
      likeCount: parseInt(item.statistics.likeCount, 10),
      commentCount: parseInt(item.statistics.commentCount, 10),
      publishedAt: item.snippet.publishedAt,
      categoryId: item.snippet.categoryId,
      topicDetails: item.topicDetails || {},
    }));

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

    // Craft prompt for style analysis
    const prompt = `
Analyze the following YouTube channel and video data to extract the creator's content style, which will be used for generating scripts, research topics, thumbnails, subtitles, and audio conversions. Provide a detailed analysis of the following aspects: tone (e.g., conversational, formal), vocabulary level (e.g., simple, technical), pacing (e.g., fast, slow), themes (e.g., educational, entertainment), humor style (e.g., witty, sarcastic), narrative structure (e.g., storytelling, listicle), visual style (based on thumbnails and descriptions), and audience engagement techniques (e.g., calls to action, audience questions). Additionally, include a comprehensive narrative overview of the creator's overall content style in the style_analysis field, synthesizing all aspects into a cohesive summary. The analysis should be structured as a JSON object for easy reuse.

Channel Data:
- Name: ${channelData.channel_name}
- Description: ${channelData.channel_description || 'None'}
- Custom URL: ${channelData.custom_url || 'None'}
- Country: ${channelData.country || 'Unknown'}
- Default Language: ${channelData.default_language || 'Unknown'}
- View Count: ${channelData.view_count}
- Subscriber Count: ${channelData.subscriber_count}
- Video Count: ${channelData.video_count}
- Topic Details: ${JSON.stringify(channelData.topic_details)}

Video Data:
${videoData.map((video: any, index: number) => `
Video ${index + 1}:
- URL: ${videoUrls[index]}
- Title: ${video.title}
- Description: ${video.description}
- Tags: ${video.tags.join(', ') || 'None'}
- Duration: ${video.duration}
- View Count: ${video.viewCount}
- Like Count: ${video.likeCount}
- Comment Count: ${video.commentCount}
- Published At: ${video.publishedAt}
- Category ID: ${video.categoryId}
- Topic Details: ${JSON.stringify(video.topicDetails)}
`).join('\n')}

Provide the analysis in the following JSON format:
{
  "style_analysis": string,
  "tone": string,
  "vocabulary_level": string,
  "pacing": string,
  "themes": string[],
  "humor_style": string,
  "narrative_structure": string,
  "visual_style": string,
  "audience_engagement": string[],
  "recommendations": {
    "script_generation": string,
    "research_topics": string,
    "thumbnails": string,
    "subtitles": string,
    "audio_conversion": string
  }
}
`;


    // Call Gemini API
    const result: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    const styleAnalysis = parseGeminiResponse(result.text);
    if (!styleAnalysis) {
      return NextResponse.json({ error: 'Failed to parse or validate Gemini API response' }, { status: 500 });
    }
    console.log(styleAnalysis)


    // Update profiles table to mark AI as trained
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ai_trained: true })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating profiles:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Save style analysis and video URLs to user_style table
    const { error: styleError } = await supabase
      .from('user_style')
      .upsert({
        user_id: userId,
        tone: styleAnalysis.tone,
        vocabulary_level: styleAnalysis.vocabulary_level,
        pacing: styleAnalysis.pacing,
        themes: styleAnalysis.themes.join(', '),
        humor_style: styleAnalysis.humor_style,
        structure: styleAnalysis.narrative_structure,
        video_urls: videoUrls,
        style_analysis: styleAnalysis.style_analysis,
        recommendations: styleAnalysis.recommendations,
        updated_at: new Date().toISOString(),
      });

    if (styleError) {
      console.error('Error saving to user_style:', styleError);
      return NextResponse.json({ error: 'Failed to save style data' }, { status: 500 });
    }

    return NextResponse.json({ message: 'AI training completed successfully' });
  } catch (error: any) {
    console.error('Error in train-ai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}