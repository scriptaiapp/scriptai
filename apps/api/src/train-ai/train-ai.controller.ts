import { Body, Controller, Post, Req, Sse, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { trainAiSchema, type TrainAiDto } from '@repo/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Observable } from 'rxjs';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { getUserId } from '../common/get-user-id';
import { createJobSSE } from '../common/sse';

export const TRAIN_AI_CANCEL_PREFIX = 'train-ai:cancel:';

@Controller('train-ai')
export class TrainAiController {
  constructor(@InjectQueue('train-ai') private readonly queue: Queue) { }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async trainAi(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(trainAiSchema)) dto: TrainAiDto
  ): Promise<{ message: string; jobId: string }> {
    const userId = getUserId(req);
    const jobId = `train-ai-${userId}-${Date.now()}`;
    await this.queue.add('train-ai', { ...dto, userId }, { jobId });
    return { message: 'Training queued', jobId };
  }

  @Post('stop/:jobId')
  @UseGuards(SupabaseAuthGuard)
  async stopTraining(
    @Req() req: AuthRequest,
    @Param('jobId') jobId: string,
  ): Promise<{ message: string }> {
    const userId = getUserId(req);
    const job = await this.queue.getJob(jobId);
    if (!job) throw new NotFoundException('Job not found');

    if (job.data?.userId !== userId) {
      throw new NotFoundException('Job not found');
    }

    const state = await job.getState();

    if (state === 'waiting' || state === 'delayed') {
      await job.remove();
      return { message: 'Training cancelled' };
    }

    if (state === 'active') {
      const client = await this.queue.client;
      await client.set(`${TRAIN_AI_CANCEL_PREFIX}${jobId}`, '1', 'EX', 3600);
      return { message: 'Cancellation requested' };
    }

    return { message: 'Job already finished' };
  }

  @Sse('status/:jobId')
  status(@Param('jobId') jobId: string, @Req() req: AuthRequest): Observable<MessageEvent> {
    return createJobSSE({
      queue: this.queue,
      jobId,
      req,
      includeLogs: true,
      getMessages: {
        active: 'Processing...',
        completed: 'Training completed!',
        failed: 'Training failed - check logs',
      },
    });
  }
}