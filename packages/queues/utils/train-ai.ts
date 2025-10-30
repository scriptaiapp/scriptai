import { GoogleGenAI } from "@google/genai";
import { manageAccessToken, validateOAuthEnvironment } from "./token-manager";
import { ChannelData, StyleAnalysis, Thumbnail, Transcript, VideoData } from "@repo/validation";
import axios from "axios";
import { calculateRetryDelay, logError, shouldRetry } from "./error-handler";


// Validation functions
export async function validateInputs(userId: string, videoUrls: string[]): Promise<void> {
  if (!userId || !videoUrls || !Array.isArray(videoUrls) || videoUrls.length < 3) {
    throw new Error('Invalid input: userId and at least 3 video URLs required');
  }
}

export async function validateEnvironment(): Promise<void> {
  const envValidation = validateOAuthEnvironment();
  if (
    !envValidation.isValid ||
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    !process.env.ELEVENLABS_API_KEY
  ) {
    throw new Error('Missing environment variables');
  }
}

// Fetch channel data
export async function fetchChannelData(supabase: any, userId: string): Promise<ChannelData> {
  const { data, error } = await supabase
    .from('youtube_channels')
    .select('channel_name, channel_id, provider_token, refresh_token, channel_description, custom_url, country, default_language, view_count, subscriber_count, video_count, topic_details')
    .eq('user_id', userId)
    .single();
  if (error || !data) {
    throw new Error('YouTube channel not found');
  }
  return data;
}

// Manage YouTube access token
export async function manageYouTubeToken(
  supabase: any,
  userId: string,
  channelData: ChannelData
): Promise<{ accessToken: string; tokenRefreshed: boolean }> {
  const tokenResult = await manageAccessToken(
    channelData.provider_token,
    channelData.refresh_token || '',
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!
  );
  if (!tokenResult.isValid) {
    throw new Error('YouTube connection expired. Please reconnect.');
  }
  if (tokenResult.tokenRefreshed) {
    await supabase
      .from('youtube_channels')
      .update({ provider_token: tokenResult.accessToken, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }
  return { accessToken: tokenResult.accessToken!, tokenRefreshed: tokenResult.tokenRefreshed };
}

// Fetch video data from YouTube API
export async function fetchVideoData(
  videoUrls: string[],
  accessToken: string,
  channelId: string,
  maxRetries = 3
): Promise<VideoData[]> {
  const videoIds = videoUrls
    .map(url => new URL(url).searchParams.get('v') || url.split('/').pop())
    .filter((id): id is string => Boolean(id));
  if (videoIds.length < 3) {
    throw new Error('At least 3 valid YouTube video URLs required');
  }

  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: { part: 'snippet,contentDetails,statistics,topicDetails', id: videoIds.join(','), mine: true },
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'ScriptAI/1.0' },
        timeout: 30000,
      });
      const videos = response.data.items;
      console.log('Fetched video data:', videos);
      if (!videos || videos.length < 3) {
        throw new Error('Could not find at least 3 videos');
      }
      for (const video of videos) {
        if (video.snippet.channelId !== channelId) {
          throw new Error(`Video "${video.snippet.title}" does not belong to your channel`);
        }
      }
      return videos.map((item: any): VideoData => ({
        id: item.id,
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
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        defaultAudioLanguage: item.snippet.defaultAudioLanguage || "en",
      }));
    } catch (error: any) {
      retryCount++;
      if (retryCount >= maxRetries || !shouldRetry(error, retryCount, maxRetries)) {
        logError('train-ai-youtube-api', error, { videoIds, retryCount });
        throw new Error('Failed to fetch video data');
      }
      await new Promise(resolve => setTimeout(resolve, calculateRetryDelay(retryCount)));
    }
  }
  throw new Error('Max retries reached for YouTube API');
}

// Process video assets (audio, transcripts, thumbnails)
// export async function processVideoAssets(
//   supabase: any,
//   genAI: any,
//   userId: string,
//   videos: VideoData[],
//   videoUrls: string[]
// ): Promise<{
//   transcripts: Transcript[];
//   thumbnails: Thumbnail[];
//   geminiInputTokens: number;
//   geminiOutputTokens: number;
//   elevenlabsClonesCreated: number;
// }> {
//   const transcripts: Transcript[] = [];
//   const thumbnails: Thumbnail[] = [];
//   const audioFiles: BodyAddVoiceV1VoicesAddPost["files"] = [];
//   let geminiInputTokens = 0;
//   let geminiOutputTokens = 0;
//   let elevenlabsClonesCreated = 0;
//   const client = new ElevenLabsClient({
//     apiKey: process.env.ELEVENLABS_API_KEY,
//   });

//   for (const [index, video] of videos.entries()) {
//     const videoUrl = videoUrls[index];

//     try {
//       // Extract audio using youtube-dl-exec

//       const tempDir = path.join(process.cwd(), "public", "temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//       const outputFile = path.join(tempDir, `${Date.now()}.mp3`);



//       await youtubedl(videoUrl, {
//         extractAudio: true,
//         audioFormat: "mp3",
//         format: "bestaudio[ext=m4a]/bestaudio",
//         output: outputFile,
//         noPlaylist: true,
//         preferFreeFormats: true,
//         noCheckCertificates: true,
//         addMetadata: true,
//       });

//       const fileData = fs.readFileSync(outputFile);

//       // Upload audio to Supabase
//       const { data: { publicUrl: audioUrl } } = await supabase.storage
//         .from('training-audio')
//         .upload(`voices/${userId}/${video.id}.mp3`, fileData, { contentType: 'audio/mp3', upsert: true });

//       console.log('Uploaded audio URL:', audioUrl);
//       audioFiles.push(audioUrl);
//       console.log(audioFiles)

//       fs.rmSync(tempDir, { recursive: true, force: true });
//       // Transcribe with Gemini using YouTube URL
//       const lang = video.defaultAudioLanguage || 'en';
//       const sttPrompt = `Transcribe this YouTube video to timed segments in JSON format (array of objects with "text", "start_time", "end_time"). Language: ${lang}`;
//       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//       const transcriptResult = await model.generateContent([
//         sttPrompt,
//         {
//           fileData: {
//             fileUri: videoUrl,
//           },
//         },
//       ]);
//       const transcriptText = transcriptResult.response.text();
//       const transcript = JSON.parse(transcriptText) as { text: string; start_time: number; end_time: number }[];
//       console.log(`Transcribed video ${video.id}:`, transcript);
//       geminiInputTokens += transcriptResult.response.usageMetadata?.promptTokenCount || 0;
//       geminiOutputTokens += transcriptResult.response.usageMetadata?.candidatesTokenCount || 0;
//       transcripts.push({
//         videoId: video.id, transcriptText, segments: transcript.map(segment => ({
//           start: segment.start_time,
//           end: segment.end_time,
//           text: segment.text,
//         }))
//       });
//       thumbnails.push({ videoId: video.id, thumbnailUrl: video.thumbnailUrl });
//     } catch (error: any) {
//       logError('process-video-assets', error, { videoId: video.id });
//       throw new Error(`Failed to process video ${video.id}: ${error.message}`);
//     }
//   }

//   // Clone voice with ElevenLabs
//   const voiceResponse = await client.voices.ivc.create(
//     {
//       name: `${userId}_voice`,
//       files: audioFiles.slice(0, 3),
//     }
//   );
//   elevenlabsClonesCreated = 1;

//   // Save voice to user_voices
//   const { error: voiceError } = await supabase.from('user_voices').insert({
//     user_id: userId,
//     voice_id: voiceResponse.voiceId,
//     name: `${userId}_voice`,
//     sample_url: audioFiles[0],
//     elevenlabs_voice_clones_created: elevenlabsClonesCreated,
//     credits_consumed: Math.ceil(elevenlabsClonesCreated * 0.75), // Adjust factor
//   });
//   if (voiceError) {
//     logError('train-ai-voice-save', voiceError, { userId });
//     throw new Error('Failed to save voice data');
//   }

//   return { transcripts, thumbnails, geminiInputTokens, geminiOutputTokens, elevenlabsClonesCreated };
// }

// Analyze content style with Gemini
export async function analyzeStyle(
  genAI: any,
  channelData: ChannelData,
  videoData: VideoData[],
  videoUrls: string[],
  maxRetries = 3
): Promise<{
  styleAnalysis: StyleAnalysis;
  geminiInputTokens: number;
  geminiOutputTokens: number;
}> {
  const prompt = `
Analyze the following YouTube channel and video data to extract the creator's content style, which will be used for generating scripts, research topics, thumbnails, subtitles, and audio conversions. Provide a detailed analysis of the following aspects: tone (e.g., conversational, formal), vocabulary level (e.g., simple, technical), pacing (e.g., fast, slow), themes (e.g., educational, entertainment), humor style (e.g., witty, sarcastic), narrative structure (e.g., storytelling, listicle), visual style, thumbnails and descriptions, and audience engagement techniques (e.g., calls to action, audience questions). Additionally, include a comprehensive narrative overview of the creator's overall content style in the style_analysis field, synthesizing all aspects into a cohesive summary.

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
${videoData.map((video, i) => `
Video ${i + 1}:
- URL: ${videoUrls[i]}
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
`;

  // Define structured schema
  const schema = {
    type: "object",
    properties: {
      style_analysis: { type: "string" },
      tone: { type: "string" },
      vocabulary_level: { type: "string" },
      pacing: { type: "string" },
      themes: { type: "array", items: { type: "string" } },
      humor_style: { type: "string" },
      narrative_structure: { type: "string" },
      visual_style: { type: "string" },
      audience_engagement: { type: "array", items: { type: "string" } },
      recommendations: {
        type: "object",
        properties: {
          script_generation: { type: "string" },
          research_topics: { type: "string" },
          thumbnails: { type: "string" },
          subtitles: { type: "string" },
          audio_conversion: { type: "string" }
        },
        required: [
          "script_generation",
          "research_topics",
          "thumbnails",
          "subtitles",
          "audio_conversion"
        ]
      }
    },
    required: [
      "style_analysis",
      "tone",
      "vocabulary_level",
      "pacing",
      "themes",
      "humor_style",
      "narrative_structure",
      "visual_style",
      "audience_engagement",
      "recommendations"
    ]
  };

  let styleAnalysis: StyleAnalysis | null = null;
  let geminiInputTokens = 0;
  let geminiOutputTokens = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      });

      console.log('Gemini style analysis response:', result);

      styleAnalysis = result.text as StyleAnalysis;

      geminiInputTokens += result.response.usageMetadata?.promptTokenCount ?? 0;
      geminiOutputTokens += result.response.usageMetadata?.candidatesTokenCount ?? 0;

      if (styleAnalysis) break;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('❌ analyzeStyle failed after max retries:', error);
        throw new Error('Failed to analyze content style');
      }
      console.warn(`Retrying analyzeStyle... (${attempt}/${maxRetries})`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  return { styleAnalysis: styleAnalysis!, geminiInputTokens, geminiOutputTokens };
}


// Generate embedding with Gemini
export async function generateEmbedding(
  styleAnalysis: StyleAnalysis,
  maxRetries = 3
): Promise<number[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

  const styleText = JSON.stringify(styleAnalysis);
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: styleText,
        config: {
          outputDimensionality: 768,
          taskType: 'RETRIEVAL_DOCUMENT',
        }
      });

      if (!response?.embeddings) {
        throw new Error('Invalid embedding response');
      }
      const embeddingValues = response?.embeddings[0]?.values;
      if (!embeddingValues) {
        throw new Error('Invalid embedding response');
      }
      const norm = Math.sqrt(embeddingValues.reduce((sum: number, val: number) => sum + val * val, 0));
      return norm > 0 ? embeddingValues.map((val: number) => val / norm) : embeddingValues;
    } catch (error: any) {
      retryCount++;
      if (retryCount >= maxRetries) {
        logError('train-ai-embedding', error, { retryCount });
        throw new Error('Failed to generate embedding');
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Max retries reached for embedding');
}

// Save style data to Supabase
export async function saveStyleData(
  supabase: any,
  userId: string,
  styleAnalysis: StyleAnalysis,
  embedding: number[],
  videoUrls: string[],
  transcripts: Transcript[],
  thumbnails: Thumbnail[],
  geminiInputTokens: number,
  geminiOutputTokens: number,
  elevenlabsClonesCreated: number
): Promise<void> {
  const geminiTotalTokens = geminiInputTokens + geminiOutputTokens;
  const geminiCredits = Math.ceil(geminiTotalTokens / 1000);
  const elevenlabsCredits = elevenlabsClonesCreated * 0.75; // Adjust factor
  const totalCredits = geminiCredits + Math.ceil(elevenlabsCredits);

  const { data: profile } = await supabase.from('profiles').select('credits').eq('user_id', userId).single();
  if (profile.credits < totalCredits) {
    throw new Error('Insufficient credits');
  }

  await supabase.from('profiles').update({ credits: profile.credits - totalCredits, ai_trained: true }).eq('user_id', userId);

  const styleData = {
    user_id: userId,
    tone: styleAnalysis.tone,
    vocabulary_level: styleAnalysis.vocabulary_level,
    pacing: styleAnalysis.pacing,
    themes: Array.isArray(styleAnalysis.themes) ? styleAnalysis.themes.join(', ') : styleAnalysis.themes,
    humor_style: styleAnalysis.humor_style,
    structure: styleAnalysis.narrative_structure,
    visual_style: styleAnalysis.visual_style,
    audience_engagement: Array.isArray(styleAnalysis.audience_engagement)
      ? styleAnalysis.audience_engagement
      : [styleAnalysis.audience_engagement],
    video_urls: videoUrls,
    style_analysis: styleAnalysis.style_analysis,
    recommendations: styleAnalysis.recommendations,
    updated_at: new Date().toISOString(),
    content: JSON.stringify(styleAnalysis),
    embedding,
    transcripts,
    thumbnails,
    gemini_input_tokens: geminiInputTokens,
    gemini_output_tokens: geminiOutputTokens,
    elevenlabs_voice_clones_created: elevenlabsClonesCreated,
    credits_consumed: totalCredits,
  };

  const { error } = await supabase.from('user_style').upsert(styleData, { onConflict: 'user_id' });
  if (error) {
    logError('train-ai-style-save', error, { userId });
    throw new Error('Failed to save style analysis');
  }
}