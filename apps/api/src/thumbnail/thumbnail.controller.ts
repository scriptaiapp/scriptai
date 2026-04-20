import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Param,
  Sse,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateThumbnailSchema, type CreateThumbnailInput } from '@repo/validation';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { getUserId } from '../common/get-user-id';
import type { Observable } from 'rxjs';
import { ThumbnailService } from './thumbnail.service';
import { createJobSSE } from '../common/sse';
import { ApiMultipartForm } from '../common/swagger-multipart';

@ApiTags('thumbnail')
@Controller('thumbnail')
export class ThumbnailController {
  constructor(
    @InjectQueue('thumbnail') private readonly queue: Queue,
    private readonly thumbnailService: ThumbnailService,
  ) { }

  @Post('generate')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Queue thumbnail generation (optional reference + face images)' })
  @ApiMultipartForm({
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string' },
      ratio: { type: 'string', enum: ['16:9', '9:16', '1:1', '4:3'], default: '16:9' },
      generateCount: { type: 'integer', minimum: 1, maximum: 5, default: 3 },
      videoLink: { type: 'string', format: 'uri' },
      personalized: { type: 'boolean', default: true },
      scriptId: { type: 'string', format: 'uuid' },
      storyBuilderId: { type: 'string', format: 'uuid' },
      referenceImage: { type: 'string', format: 'binary' },
      faceImage: { type: 'string', format: 'binary' },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'referenceImage', maxCount: 1 },
      { name: 'faceImage', maxCount: 1 },
    ]),
  )
  async generate(
    @Body(new ZodValidationPipe(CreateThumbnailSchema)) body: CreateThumbnailInput,
    @UploadedFiles()
    files: {
      referenceImage?: Express.Multer.File[];
      faceImage?: Express.Multer.File[];
    },
    @Req() req: AuthRequest,
  ) {
    return this.thumbnailService.createJob(
      getUserId(req),
      body,
      files?.referenceImage?.[0],
      files?.faceImage?.[0],
    );
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List thumbnail jobs' })
  async listJobs(@Req() req: AuthRequest) {
    return this.thumbnailService.listJobs(getUserId(req));
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get thumbnail job' })
  @ApiParam({ name: 'id' })
  async getJob(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.thumbnailService.getJob(id, getUserId(req));
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete thumbnail job' })
  @ApiParam({ name: 'id' })
  async deleteJob(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.thumbnailService.deleteJob(id, getUserId(req));
  }

  @Sse('status/:jobId')
  @ApiOperation({
    summary: 'SSE: thumbnail job status',
    description: 'No Bearer required on this route in the current implementation.',
  })
  @ApiParam({ name: 'jobId' })
  status(@Param('jobId') jobId: string, @Req() req: AuthRequest): Observable<MessageEvent> {
    return createJobSSE({
      queue: this.queue,
      jobId,
      req,
      getMessages: {
        active: 'Generating thumbnails...',
        completed: 'Thumbnails generated!',
        failed: 'Generation failed',
      },
      extractResult: (job) => ({ imageUrls: job.returnvalue?.imageUrls }),
    });
  }
}
