import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { LemonSqueezyWebhookController } from './lemonsqueezy-webhook.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SupabaseModule, ConfigModule],
  controllers: [BillingController, LemonSqueezyWebhookController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
