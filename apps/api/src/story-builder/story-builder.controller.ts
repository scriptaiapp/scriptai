import { Controller, Post, Get, Delete, Body, Req, Param, Sse, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateStoryBuilderSchema, type CreateStoryBuilderInput } from '@repo/validation';
import type { Observable } from 'rxjs';
import { StoryBuilderService } from './story-builder.service';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { getUserId } from '../common/get-user-id';
import { createJobSSE } from '../common/sse';

@ApiTags('story-builder')
@Controller('story-builder')
export class StoryBuilderController {
  constructor(
    @InjectQueue('story-builder') private readonly queue: Queue,
    private readonly storyBuilderService: StoryBuilderService,
  ) {}

  @Post('generate')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Queue story-builder job' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['videoTopic'],
      properties: {
        videoTopic: { type: 'string' },
        ideationId: { type: 'string', format: 'uuid' },
        ideaIndex: { type: 'integer', minimum: 0 },
        targetAudience: { type: 'string' },
        audienceLevel: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced', 'general'],
          default: 'general',
        },
        videoDuration: {
          type: 'string',
          enum: ['short', 'medium', 'long', 'extended'],
          default: 'medium',
        },
        contentType: { type: 'string' },
        storyMode: { type: 'string' },
        tone: { type: 'string' },
        additionalContext: { type: 'string' },
        personalized: { type: 'boolean', default: true },
      },
    },
  })
  async generate(
    @Body(new ZodValidationPipe(CreateStoryBuilderSchema)) body: CreateStoryBuilderInput,
    @Req() req: AuthRequest,
  ) {
    return this.storyBuilderService.createJob(getUserId(req), body);
  }

  @Get('profile-status')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profile readiness for story builder' })
  async profileStatus(@Req() req: AuthRequest) {
    return this.storyBuilderService.getProfileStatus(getUserId(req));
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List story-builder jobs' })
  async listJobs(@Req() req: AuthRequest) {
    return this.storyBuilderService.listJobs(getUserId(req));
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get story-builder job' })
  @ApiParam({ name: 'id' })
  async getJob(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.storyBuilderService.getJob(id, getUserId(req));
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete story-builder job' })
  @ApiParam({ name: 'id' })
  async deleteJob(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.storyBuilderService.deleteJob(id, getUserId(req));
  }

  @Sse('status/:jobId')
  @ApiOperation({
    summary: 'SSE: story-builder job status',
    description: 'No Bearer required on this route in the current implementation.',
  })
  @ApiParam({ name: 'jobId' })
  status(@Param('jobId') jobId: string, @Req() req: AuthRequest): Observable<MessageEvent> {
    return createJobSSE({
      queue: this.queue,
      jobId,
      req,
      getMessages: {
        active: 'Analyzing and structuring your story...',
        completed: 'Story structure generated!',
        failed: 'Generation failed',
      },
      extractResult: (job) => ({ result: job.returnvalue?.result }),
    });
  }
}
