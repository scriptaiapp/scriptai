import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { trainAiSchema, type TrainAiDto } from '@repo/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller()
@UseGuards(SupabaseAuthGuard)
export class TrainAiController {
  constructor(@InjectQueue('train-ai') private readonly queue: Queue) { }

  @Post('train-ai')
  async trainAi(
    @Body(new ZodValidationPipe(trainAiSchema)) dto: TrainAiDto
  ) {
    const jobId = `train-ai-${dto.userId}-${Date.now()}`;
    await this.queue.add('train-ai', dto, { jobId });
    return { message: 'Training queued', jobId };
  }
}