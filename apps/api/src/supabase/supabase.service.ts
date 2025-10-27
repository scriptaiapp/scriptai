import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient, getSupabaseEnv } from '@repo/supabase';

@Injectable()
export class SupabaseService {
  private readonly supabase;

  constructor(private config: ConfigService) {
    const { url, key } = getSupabaseEnv();
    this.supabase = createSupabaseClient(url, key);
  }

  getClient() {
    return this.supabase;
  }
}