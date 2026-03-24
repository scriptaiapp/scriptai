import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { DubResponse } from '@repo/validation';

const FEATURE_DISABLED_MSG = 'Audio dubbing is not yet available';

@Injectable()
export class DubbingService {
  private readonly logger = new Logger(DubbingService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async createDub(): Promise<never> {
    throw new BadRequestException(FEATURE_DISABLED_MSG);
  }

  streamDubbingStatus(): never {
    throw new BadRequestException(FEATURE_DISABLED_MSG);
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

  async getDub(userId: string, projectId: string): Promise<DubResponse> {
    const { data, error } = await this.supabase
      .from('dubbing_projects')
      .select('project_id, dubbed_url, original_media_url, target_language, status, credits_consumed, is_video, created_at, media_name')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      throw new BadRequestException('Dub not found or access denied');
    }

    return {
      projectId: data.project_id,
      originalMediaUrl: data.original_media_url,
      dubbedUrl: data.dubbed_url,
      status: data.status,
      creditsConsumed: data.credits_consumed,
      isVideo: data.is_video,
      createdAt: data.created_at,
      targetLanguage: data.target_language,
      mediaName: data.media_name,
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
  }
}
