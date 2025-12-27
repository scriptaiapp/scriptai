import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import redisConfig from './config/redis.config';
import { SupabaseModule } from './supabase/supabase.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TrainAiController } from './train-ai/train-ai.controller';
import { TrainAiModule } from './train-ai/train-ai.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig]
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: configService.get('redis'),
        defaultJobOptions: {
          attempts: 1,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
          limiter: { max: 100, duration: 60000 }
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'train-ai'
    }),
    SupabaseModule,
    TrainAiModule,
    AuthModule
  ],
  controllers: [AppController, TrainAiController],
  providers: [AppService],
})
export class AppModule { }
