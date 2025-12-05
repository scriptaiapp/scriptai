import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient, getSupabaseEnv, getSupabaseServiceEnv, SupabaseClient } from '@repo/supabase';
import { Thumbnail, Transcript, VideoData } from "@repo/validation";
import { GoogleGenAI } from '@google/genai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import ytdl from 'ytdl-core';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { validateInputs, validateEnvironment, fetchChannelData, manageYouTubeToken, fetchVideoData, analyzeStyle, generateEmbedding, saveStyleData } from '../utils/train-ai';
import { createWriteStream } from "fs";

interface TrainAiJobData {
  userId: string;
  videoUrls: string[];
  isRetraining?: boolean;
}

@Processor('train-ai', { concurrency: 5 })
export class TrainAiProcessor extends WorkerHost {
  private readonly logger = new Logger(TrainAiProcessor.name);
  private readonly supabase: SupabaseClient;
  private readonly genAI: GoogleGenAI;
  private readonly client: ElevenLabsClient;

  constructor(private readonly configService: ConfigService) {
    super();
    const { url, key } = getSupabaseServiceEnv();
    this.supabase = createSupabaseClient(url, key);

    console.log(this.configService)

    this.genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
    this.client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
  }

  async process(job: Job<TrainAiJobData>): Promise<void> {
    const { userId, videoUrls, isRetraining } = job.data;
    const supabase = this.supabase;

    await job.updateProgress(0); // Initial: Queued
    await job.log('Job queued and validations starting...');

    try {
      await validateInputs(userId, videoUrls);
      await validateEnvironment();

      await job.updateProgress(10); // 10%: Validated
      await job.log('Fetching channel and token...');

      const channelData = await fetchChannelData(supabase, userId);
      const { accessToken } = await manageYouTubeToken(supabase, userId, channelData);

      await job.updateProgress(20); // 20%: Channel ready
      await job.log('Fetching video data...');

      const videoData = await fetchVideoData(videoUrls, accessToken, channelData.channel_id);

      await job.updateProgress(30); // 30%: Videos fetched
      await job.log('Processing assets (audio/transcripts)...');

      const { transcripts, thumbnails, geminiInputTokens: assetInput, geminiOutputTokens: assetOutput, elevenlabsClonesCreated } = await this.processVideoAssets(supabase, userId, videoData, videoUrls);

      await job.updateProgress(60); // 60%: Assets done
      await job.log('Analyzing style and embedding...');

      const { styleAnalysis, geminiInputTokens: styleInput, geminiOutputTokens: styleOutput } = await analyzeStyle(this.genAI, channelData, videoData, videoUrls);
      const embedding = await generateEmbedding(styleAnalysis);

      await job.updateProgress(80); // 80%: Analysis done
      await job.log('Saving data...');

      await saveStyleData(supabase, userId, styleAnalysis, embedding, videoUrls, transcripts, thumbnails, assetInput + styleInput, assetOutput + styleOutput, elevenlabsClonesCreated);

      await job.updateProgress(100); // 100%: Complete
      this.logger.log(`Train AI completed for ${userId}, retraining: ${isRetraining}`);
    } catch (error: any) {
      await job.log(`Error: ${error.message}`);
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;  // Retry via BullMQ
    }
  }

  private async processVideoAssets(
    supabase: any,
    userId: string,
    videos: VideoData[],
    videoUrls: string[]
  ): Promise<{
    transcripts: Transcript[];
    thumbnails: Thumbnail[];
    geminiInputTokens: number;
    geminiOutputTokens: number;
    elevenlabsClonesCreated: number;
  }> {
    const transcripts: Transcript[] = [];
    const thumbnails: Thumbnail[] = [];
    const audioUrls: any[] = [];
    let geminiInputTokens = 0;
    let geminiOutputTokens = 0;
    let elevenlabsClonesCreated = 0;

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'train-ai-'));

    try {
      for (const [index, video] of videos.entries()) {
        const videoUrl = videoUrls[index];
        if (!videoUrl) {
          throw new Error(`Missing videoUrl for index ${index} (video id: ${video.id})`);
        }
        const outputFile = path.join(tempDir, `${video.id}.mp3`);

        // Stream audio with ytdl‐core
        const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
        await new Promise<void>((resolve, reject) => {
          stream.pipe(createWriteStream(outputFile))
            .on('finish', () => resolve())
            .on('error', (err) => reject(err));
        });

        const fileData = await fs.readFile(outputFile);
        const { data, error } = await supabase.storage
          .from('training-audio')
          .upload(`voices/${userId}/${video.id}.mp3`, fileData, {
            contentType: 'audio/mp3',
            upsert: true,
          });
        if (error) throw error;
        audioUrls.push(data.path);  // adjust if you need signed URL

        const lang = video.defaultAudioLanguage || 'en';

        // Call Gemini for structured JSON output following docs
        const promptText = `Transcribe to JSON: Language ${lang}`;

        const schema = {
          type: "object",
          properties: {
            videoId: { type: "string" },
            transcriptText: { type: "string" },
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  start: { type: "number" },
                  end: { type: "number" },
                  text: { type: "string" }
                },
                required: ["start", "end", "text"]
              }
            }
          },
          required: ["videoId", "transcriptText", "segments"],
          propertyOrdering: ["videoId", "transcriptText", "segments"]
        };

        const result: any = await this.genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText },
                { fileData: { fileUri: videoUrl, mimeType: "audio/mp3" } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0,
            maxOutputTokens: 2048
          }
        });

        let parsed: { videoId: string; transcriptText: string; segments: Array<{ start: number; end: number; text: string }> };
        try {
          parsed = JSON.parse(result.text);
        } catch {
          throw new Error(`Invalid JSON from Gemini for video id ${video.id}: ${result.inputText}`);
        }

        geminiInputTokens += result.response.usageMetadata?.promptTokenCount ?? 0;
        geminiOutputTokens += result.response.usageMetadata?.candidatesTokenCount ?? 0;

        transcripts.push({
          videoId: video.id,
          transcriptText: parsed.transcriptText,
          segments: parsed.segments
        });
        thumbnails.push({ videoId: video.id, thumbnailUrl: video.thumbnailUrl });

        console.log(transcripts);
      }

      // ElevenLabs voice clone
      const voiceResponse = await this.client.voices.ivc.create({
        name: `${userId}_voice`,
        files: audioUrls.slice(0, 3)
      });
      elevenlabsClonesCreated = 1;

      await supabase.from('user_voices').insert({
        user_id: userId,
        voice_id: voiceResponse.voiceId,
        name: `${userId}_voice`,
        sample_url: audioUrls[0],
        elevenlabs_voice_clones_created: elevenlabsClonesCreated,
        credits_consumed: Math.ceil(0.75)
      });

      return {
        transcripts,
        thumbnails,
        geminiInputTokens,
        geminiOutputTokens,
        elevenlabsClonesCreated
      };
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  // @OnWorkerEvent('stalled')
  // onStalled(jobId: string) {
  //   this.logger.warn(`Job ${jobId} stalled - check Redis/dependencies`);  // Monitor for scale
  // }
}