import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrainAiProcessor } from '@repo/queues';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'train-ai' }),
  ],
  providers: [TrainAiProcessor],
})
export class TrainAiModule { }