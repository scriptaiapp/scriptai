import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { TrainAiController } from './train-ai.controller';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    BullModule.registerQueue({
      name: 'train-ai',
    }),
  ],
  controllers: [TrainAiController],
})
export class TrainAiModule {}