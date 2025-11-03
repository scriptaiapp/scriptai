import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseAuthGuard } from '../guards/auth.guard';

interface TrainAiDto {
  userId: string;
  videoUrls: string[];
  isRetraining?: boolean;
}

@Controller()
@UseGuards(SupabaseAuthGuard)
export class TrainAiController {
  constructor(@InjectQueue('train-ai') private readonly queue: Queue) { }

  @Post('train-ai')
  async trainAi(@Body() dto: TrainAiDto) {
    const jobId = `train-ai-${dto.userId}-${Date.now()}`;
    await this.queue.add('train-ai', dto, { jobId });
    return { message: 'Training queued', jobId };
  }
}