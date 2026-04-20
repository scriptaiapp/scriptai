import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseService } from './supabase/supabase.service';
import { SupabaseAuthGuard } from './guards/auth.guard';

@ApiTags('app')
@ApiBearerAuth()
@Controller()
@UseGuards(SupabaseAuthGuard)
export class AppController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('test-db')
  @ApiOperation({ summary: 'Smoke test Supabase profiles table (dev/debug)' })
  async testDb() {
    const { data, error } = await this.supabaseService.getClient().from('profiles').select('*').limit(1);
    if (error) throw error;
    return data;
  }
}
