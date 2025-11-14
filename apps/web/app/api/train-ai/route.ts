import { getSupabaseServer } from '@/lib/supabase/server';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { parseGeminiResponse } from '@/lib/parseResponse';
import { manageAccessToken, validateOAuthEnvironment } from '@/lib/token-manager';
import { createErrorResponse, logError, shouldRetry, calculateRetryDelay } from '@/lib/error-handler';

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
  const supabase = await getSupabaseServer();

  try {
    const { userId, videoUrls, isRetraining = false } = await request.json();

    // Input validation
    if (!userId || !videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 3) {
      return NextResponse.json({
        error: 'Invalid input: userId and at least 3 video URLs are required'
      }, { status: 400 });
    }

    // Environment variable validation
    const envValidation = validateOAuthEnvironment();
    if (!envValidation.isValid) {
      logError('train-ai', new Error(`Missing environment variables: ${envValidation.missing.join(', ')}`));
      return NextResponse.json({
        error: 'Server configuration error: Missing Google OAuth credentials'
      }, { status: 500 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      logError('train-ai', new Error('Missing Google Generative AI API key'));
      return NextResponse.json({
        error: 'Server configuration error: Missing AI API key'
      }, { status: 500 });
    }

    // Fetch channel details from youtube_channels
    const { data: channelData, error: channelError } = await supabase
      .from('youtube_channels')
      .select('channel_name, channel_id, provider_token, refresh_token, channel_description, custom_url, country, default_language, view_count, subscriber_count, video_count, topic_details')
      .eq('user_id', userId)
      .single();

    if (channelError || !channelData) {
      return NextResponse.json({
        error: 'YouTube channel not found. Please connect your YouTube channel first.'
      }, { status: 404 });
    }

    if (!channelData.provider_token) {
      return NextResponse.json({
        error: 'YouTube channel not properly connected. Please reconnect your YouTube channel.'
      }, { status: 400 });
    }

    // Enhanced token management with automatic refresh
    let accessToken = channelData.provider_token;
    let tokenRefreshed = false;

    try {
      const tokenResult = await manageAccessToken(
        channelData.provider_token,
        channelData.refresh_token || '',
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!
      );

      if (!tokenResult.isValid) {
        if (tokenResult.error === 'No refresh token available') {
          return NextResponse.json({
            error: 'Your YouTube connection has expired. Please reconnect your YouTube channel in the dashboard.'
          }, { status: 401 });
        }

        return NextResponse.json({
          error: 'Your YouTube connection has expired and could not be refreshed. Please reconnect your YouTube channel in the dashboard.'
        }, { status: 401 });
      }

      accessToken = tokenResult.accessToken!;
      tokenRefreshed = tokenResult.tokenRefreshed;

      // Update the token in the database if it was refreshed
      if (tokenRefreshed) {
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({
            provider_token: accessToken,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('channel_id', channelData.channel_id);

        if (updateError) {
          console.error('Error updating provider_token:', updateError);
        }
      }
    } catch (error: any) {
      logError('train-ai-token-management', error, { userId, channelId: channelData.channel_id });
      return NextResponse.json({
        error: 'Unable to validate YouTube connection. Please try again or reconnect your channel.'
      }, { status: 500 });
    }

    // Extract video IDs from URLs with better error handling
    // Support regular YouTube URLs and YouTube Shorts
    const videoIds = videoUrls
      .map((url: string) => {
        try {
          const urlObj = new URL(url);
          // Check for regular watch URL
          if (urlObj.searchParams.get('v')) {
            return urlObj.searchParams.get('v');
          }
          // Check for Shorts URL: youtube.com/shorts/VIDEO_ID
          if (urlObj.pathname.startsWith('/shorts/')) {
            return urlObj.pathname.split('/shorts/')[1]?.split('?')[0] || null;
          }
          // Fallback: extract from path (for youtu.be/VIDEO_ID or other formats)
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          const lastPart = pathParts[pathParts.length - 1];
          // YouTube video IDs are 11 characters
          if (lastPart && lastPart.length === 11 && /^[a-zA-Z0-9_-]+$/.test(lastPart)) {
            return lastPart;
          }
          return null;
        } catch (error) {
          console.error('Invalid URL format:', url);
          return null;
        }
      })
      .filter((id): id is string => Boolean(id));

    if (videoIds.length < 3) {
      return NextResponse.json({
        error: 'At least 3 valid YouTube video URLs are required'
      }, { status: 400 });
    }

    // Fetch video details from YouTube API with retry logic
    let videoResponse;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails,statistics,topicDetails',
            id: videoIds.join(',')
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'ScriptAI/1.0'
          },
          timeout: 30000, // 30 second timeout
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retryCount++;

        if (retryCount >= maxRetries || !shouldRetry(error, retryCount, maxRetries)) {
          logError('train-ai-youtube-api', error, { userId, videoIds, retryCount });
          return NextResponse.json({
            error: 'Failed to fetch video data from YouTube. Please check your video URLs and try again.'
          }, { status: 500 });
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, calculateRetryDelay(retryCount)));
      }
    }

    // Validate video ownership and existence
    const videos = videoResponse!.data.items;
    if (!videos || videos.length < 3) {
      return NextResponse.json({
        error: 'Could not find at least 3 videos from your channel. Please check the video URLs and ensure they belong to your connected YouTube channel.'
      }, { status: 400 });
    }

    for (const video of videos) {
      if (video.snippet.channelId !== channelData.channel_id) {
        return NextResponse.json({
          error: `Video "${video.snippet.title}" does not belong to your connected YouTube channel. Please only use videos from your own channel.`
        }, { status: 403 });
      }
    }

    // Map video data for Gemini prompt
    const videoData = videos.map((item: any) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      tags: item.snippet.tags || [],
      duration: item.contentDetails.duration,
      viewCount: parseInt(item.statistics.viewCount, 10) || 0,
      likeCount: parseInt(item.statistics.likeCount, 10) || 0,
      commentCount: parseInt(item.statistics.commentCount, 10) || 0,
      publishedAt: item.snippet.publishedAt,
      categoryId: item.snippet.categoryId,
      topicDetails: item.topicDetails || {},
    }));

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

    // Enhanced prompt for style analysis
    const prompt = `
Analyze the following YouTube channel and video data to extract the creator's content style, which will be used for generating scripts, research topics, thumbnails, subtitles, and audio conversions. Provide a detailed analysis of the following aspects: tone (e.g., conversational, formal), vocabulary level (e.g., simple, technical), pacing (e.g., fast, slow), themes (e.g., educational, entertainment), humor style (e.g., witty, sarcastic), narrative structure (e.g., storytelling, listicle), visual style, thumbnails and descriptions, and audience engagement techniques (e.g., calls to action, audience questions). Additionally, include a comprehensive narrative overview of the creator's overall content style in the style_analysis field, synthesizing all aspects into a cohesive summary. The analysis should be structured as a JSON object for easy reuse.

Channel Data:
- Name: ${channelData.channel_name}
- Description: ${channelData.channel_description || 'None'}
- Custom URL: ${channelData.custom_url || 'None'}
- Country: ${channelData.country || 'Unknown'}
- Default Language: ${channelData.default_language || 'Unknown'}
- View Count: ${channelData.view_count || 0}
- Subscriber Count: ${channelData.subscriber_count || 0}
- Video Count: ${channelData.video_count || 0}
- Topic Details: ${JSON.stringify(channelData.topic_details || {})}

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
  "style_analysis": "A comprehensive narrative overview of the creator's overall content style",
  "tone": "string describing the tone",
  "vocabulary_level": "string describing vocabulary complexity",
  "pacing": "string describing content pacing",
  "themes": ["array", "of", "content", "themes"],
  "humor_style": "string describing humor approach",
  "narrative_structure": "string describing storytelling structure",
  "visual_style": "string describing visual presentation",
  "audience_engagement": ["array", "of", "engagement", "techniques"],
  "recommendations": {
    "script_generation": "string with script generation recommendations",
    "research_topics": "string with research topic recommendations",
    "thumbnails": "string with thumbnail recommendations",
    "subtitles": "string with subtitle recommendations",
    "audio_conversion": "string with audio conversion recommendations"
  }
}
`;

    // Call Gemini API with retry logic
    let styleAnalysis: StyleAnalysis | null = null;
    retryCount = 0;

    while (retryCount < maxRetries && !styleAnalysis) {
      try {
        const result: any = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt || '',
        });

        styleAnalysis = parseGeminiResponse(result.text);

        if (!styleAnalysis) {
          console.error('Failed to parse Gemini response, attempt:', retryCount + 1);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (error: any) {
        logError('train-ai-gemini-api', error, { userId, retryCount });
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!styleAnalysis) {
      return NextResponse.json({
        error: 'Failed to analyze your content style. Please try again with different videos.'
      }, { status: 500 });
    }

    // NEW: Stringify the style analysis for embedding
    const styleText = JSON.stringify(styleAnalysis);

    // NEW: Generate embedding with retry logic
    let embeddingResponse: any = null;
    retryCount = 0;

    while (retryCount < maxRetries && !embeddingResponse) {
      try {
        embeddingResponse = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: styleText,
          config: {
            outputDimensionality: 768,
            taskType: 'RETRIEVAL_DOCUMENT',
          }
        });

        if (!embeddingResponse?.embeddings) {
          throw new Error('Invalid embedding response');
        }
      } catch (error: any) {
        logError('train-ai-embedding', error, { userId, retryCount });
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!embeddingResponse) {
      return NextResponse.json({
        error: 'Failed to generate embedding for style analysis'
      }, { status: 500 });
    }

    const embeddingValues = embeddingResponse?.embeddings[0]?.values;
    const norm = Math.sqrt(embeddingValues.reduce((sum: number, val: number) => sum + val * val, 0));
    const normalizedEmbedding = norm > 0
      ? embeddingValues.map((val: number) => val / norm)
      : embeddingValues;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ ai_trained: true })
      .eq('user_id', userId);

    if (profileError) {
      logError('train-ai-profile-update', profileError, { userId });
      return NextResponse.json({
        error: 'Failed to update training status'
      }, { status: 500 });
    }

    // Save or update style analysis in user_style table
    const styleData = {
      user_id: userId,
      tone: styleAnalysis.tone,
      vocabulary_level: styleAnalysis.vocabulary_level,
      pacing: styleAnalysis.pacing,
      themes: Array.isArray(styleAnalysis.themes) ? styleAnalysis.themes.join(', ') : styleAnalysis.themes,
      humor_style: styleAnalysis.humor_style,
      structure: styleAnalysis.narrative_structure,
      visual_style: styleAnalysis.visual_style,
      audience_engagement: Array.isArray(styleAnalysis.audience_engagement) ? styleAnalysis.audience_engagement : [styleAnalysis.audience_engagement],
      video_urls: videoUrls,
      style_analysis: styleAnalysis.style_analysis,
      recommendations: styleAnalysis.recommendations,
      updated_at: new Date().toISOString(),
      content: styleText,
      embedding: normalizedEmbedding || null
    };

    const { error: styleError } = await supabase
      .from('user_style')
      .upsert(styleData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (styleError) {
      logError('train-ai-style-save', styleError, { userId });
      return NextResponse.json({
        error: 'Failed to save your content style analysis'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: isRetraining ? 'AI re-training completed successfully' : 'AI training completed successfully',
      tokenRefreshed,
      videosAnalyzed: videos.length
    });

  } catch (error: any) {
    logError('train-ai', error);

    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}