import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createSupabaseClient, getSupabaseServiceEnv } from '@repo/supabase';
import { CreateDubInput, DubResponse, DubbingProgress, murfLocaleMap, SupportedLanguage } from '@repo/validation';
import { randomUUID } from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class DubbingService {
  private readonly supabase = createSupabaseClient(
    getSupabaseServiceEnv().url,
    getSupabaseServiceEnv().key,
  );

  private readonly murfApiKey: string;
  private readonly baseURL = 'https://api.murf.ai/v1/murfdub';

  constructor() {
    const apiKey = process.env.MURF_API_KEY;
    if (!apiKey) throw new Error('MURF_API_KEY missing');
    this.murfApiKey = apiKey;
  }


  async createDub(userId: string, dto: CreateDubInput): Promise<DubResponse> {
    console.log('Creating Dubbing Project for user:', userId);

    const targetLocale = murfLocaleMap[dto.targetLanguage as SupportedLanguage];
    if (!targetLocale) throw new BadRequestException('Unsupported language');

    // Download file from Supabase storage URL
    console.log('Downloading file from Supabase:', dto.mediaUrl);
    const fileResponse = await axios.get(dto.mediaUrl, {
      responseType: 'arraybuffer',
    });

    if (!fileResponse.data) {
      throw new BadRequestException('Failed to download media file');
    }

    const fileBuffer = Buffer.from(fileResponse.data);
    const fileName = `media-${Date.now()}.${dto.isVideo ? 'mp4' : 'mp3'}`;

    // Create FormData with the actual file
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: dto.isVideo ? 'video/mp4' : 'audio/mpeg',
    });

    formData.append('file_name', fileName);
    formData.append('target_locales', targetLocale);
    formData.append('priority', 'NORMAL');

    // Create dubbing job with Murf.ai
    console.log('Creating Murf dubbing job...');
    let createResponse;
    try {
      createResponse = await axios.post(
        `${this.baseURL}/jobs/create`,
        formData,
        {
          headers: {
            'api-key': this.murfApiKey,
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      console.log('createResponse', createResponse.data);
    } catch (error: any) {
      console.error('Error creating Murf dubbing job:', error);
      throw error;
    }

    const projectId = createResponse.data.job_id;

    console.log('Created Murf dubbing job:', projectId);

    // Save to database with isVideo flag for later use
    const { error: insertErr } = await this.supabase
      .from('dubbing_projects')
      .insert({
        user_id: userId,
        project_id: projectId,
        original_media_url: dto.mediaUrl,
        target_language: dto.targetLanguage,
        status: 'dubbing',
        is_video: dto.isVideo,
      });

    if (insertErr) {
      throw new InternalServerErrorException('Failed to save dubbing project');
    }

    // Return immediately - SSE endpoint handles polling
    return { projectId };
  }

  streamDubbingStatus(projectId: string, req: Request): Observable<MessageEvent> {
    return new Observable((observer) => {
      let closed = false;

      const sendEvent = (data: DubbingProgress) => {
        if (!closed) observer.next({ data: JSON.stringify(data) } as MessageEvent);
      };

      // Initial processing state
      sendEvent({ state: 'processing', progress: 20, message: 'Dubbing started...', finished: false });

      const pollStatus = async () => {
        const start = Date.now();
        let delay = 5_000;

        while (!closed && Date.now() - start < 300_000) {
          try {
            const statusResponse = await axios.get(
              `${this.baseURL}/jobs/${projectId}/status`,
              { headers: { 'api-key': this.murfApiKey } },
            );

            const { status, download_details, credits_used, failure_reason } = statusResponse.data;
            console.log(`Dubbing status: ${status}`, statusResponse.data);

            if (status === 'FAILED') {
              sendEvent({
                state: 'failed',
                progress: 0,
                message: failure_reason ?? 'Dubbing failed',
                finished: true,
              });
              observer.complete();
              return;
            }

            if (status === 'COMPLETED' && download_details?.length) {
              // Get download URL from first locale result
              const dubbedUrl = download_details[0].download_url;

              // Finalize: download, upload to storage, update DB, deduct credits
              await this.finalizeDubbing(projectId, dubbedUrl, credits_used);

              sendEvent({
                state: 'completed',
                progress: 100,
                message: 'Dubbing complete!',
                creditsUsed: credits_used,
                finished: true,
              });
              observer.complete();
              return;
            }

            // Still processing - send progress update
            const elapsed = Date.now() - start;
            const progress = Math.min(20 + Math.floor((elapsed / 300_000) * 80), 90);
            sendEvent({
              state: 'processing',
              progress,
              message: 'Processing audio...',
              finished: false,
            });

            await new Promise((r) => setTimeout(r, delay));
            delay = Math.min(delay * 1.5, 20_000);
          } catch (err: any) {
            console.error('Status check failed:', err.message);
            sendEvent({
              state: 'failed',
              progress: 0,
              message: 'Status check failed',
              finished: true,
            });
            observer.complete();
            return;
          }
        }

        // Timeout
        if (!closed) {
          sendEvent({ state: 'failed', progress: 0, message: 'Dubbing timeout', finished: true });
          observer.complete();
        }
      };

      pollStatus();

      // Cleanup on disconnect
      req.on('close', () => {
        closed = true;
        observer.complete();
      });
    });
  }

  private async finalizeDubbing(
    projectId: string,
    dubbedUrl: string,
    creditsUsed: number,
  ): Promise<void> {
    // Get project to determine userId and isVideo
    const { data: project } = await this.supabase
      .from('dubbing_projects')
      .select('user_id, is_video')
      .eq('project_id', projectId)
      .single();

    if (!project) {
      throw new InternalServerErrorException('Project not found');
    }

    const { user_id: userId, is_video: isVideo } = project;

    // Download the dubbed media from Murf.ai
    console.log('Downloading dubbed file from Murf.ai');
    const dubbedResponse = await axios.get(dubbedUrl, {
      responseType: 'arraybuffer',
    });

    const ext = isVideo ? 'mp4' : 'mp3';
    const contentType = isVideo ? 'video/mp4' : 'audio/mpeg';
    const dubbedBuffer = Buffer.from(dubbedResponse.data);

    // Upload to Supabase storage
    const filePath = `${userId}/${projectId}/${randomUUID()}-dubbed.${ext}`;

    const { error: uploadErr } = await this.supabase.storage
      .from('dubbing_media')
      .upload(filePath, dubbedBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadErr) {
      throw new InternalServerErrorException('Storage upload failed');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('dubbing_media').getPublicUrl(filePath);

    console.log('Dubbed file uploaded:', publicUrl);

    // Update database with completed status and credits used
    await this.supabase
      .from('dubbing_projects')
      .update({
        dubbed_url: publicUrl,
        status: 'dubbed',
        credits_consumed: creditsUsed,
      })
      .eq('project_id', projectId);

    // Deduct credits from user profile
    if (creditsUsed > 0) {
      await this.supabase.rpc('update_user_credits', {
        user_uuid: userId,
        credit_change: -creditsUsed,
      });
    }
  }

  async listDubs(userId: string, pageSize = 100) {
    const { data, error } = await this.supabase
      .from('dubbing_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(pageSize);

    if (error) {
      throw new InternalServerErrorException('Failed to fetch dubs');
    }

    return data;
  }

  async getDub(userId: string, projectId: string): Promise<DubResponse & { targetLanguage?: string }> {
    const { data, error } = await this.supabase
      .from('dubbing_projects')
      .select('project_id, dubbed_url, target_language')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      throw new BadRequestException('Dub not found or access denied');
    }

    return {
      projectId: data.project_id,
      dubbedUrl: data.dubbed_url,
      targetLanguage: data.target_language,
    };
  }

  async deleteDub(userId: string, projectId: string): Promise<void> {
    const { error } = await this.supabase
      .from('dubbing_projects')
      .delete()
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) {
      throw new BadRequestException('Dub not found or access denied');
    }

    try {
      await axios.delete(`${this.baseURL}/jobs/${projectId}`, {
        headers: {
          'api-key': this.murfApiKey,
        },
      });
    } catch (err) {
      console.error('Failed to delete Murf job:', err);
      // Continue even if Murf deletion fails
    }
  }
}
