import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '../config/supabase.config';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient | null;

  constructor() {
    this.supabase = createSupabaseClient();
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  isConfigured(): boolean {
    return this.supabase !== null;
  }
}
