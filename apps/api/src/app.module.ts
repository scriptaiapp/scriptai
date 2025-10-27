import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SupabaseModule } from './supabase/supabase.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
