import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrainAiProcessor } from '@repo/train-ai-worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'train-ai'
    }),
  ],
  providers: [TrainAiProcessor],
})
export class TrainAiModule { }