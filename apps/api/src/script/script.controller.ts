import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Req, Res, Sse, UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateScriptSchema, type CreateScriptInput } from '@repo/validation';
import { getUserId } from '../common/get-user-id';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { ScriptService } from './script.service';
import { createJobSSE } from '../common/sse';
import { ApiMultipartForm } from '../common/swagger-multipart';

@ApiTags('script')
@Controller('script')
export class ScriptController {
  constructor(
    @InjectQueue('script') private readonly queue: Queue,
    private readonly scriptService: ScriptService,
  ) {}

  @Post('generate')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Queue script generation (multipart: fields + optional files)' })
  @ApiMultipartForm({
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string' },
      context: { type: 'string' },
      tone: {
        type: 'string',
        enum: ['conversational', 'educational', 'motivational', 'funny', 'serious'],
        default: 'conversational',
      },
      language: {
        type: 'string',
        enum: ['english', 'spanish', 'french', 'german', 'japanese'],
        default: 'english',
      },
      duration: { type: 'string', default: '180' },
      includeStorytelling: { type: 'boolean' },
      includeTimestamps: { type: 'boolean' },
      references: { type: 'string' },
      personalized: { type: 'boolean', default: true },
      ideationId: { type: 'string', format: 'uuid' },
      ideaIndex: { type: 'integer', minimum: 0 },
      files: { type: 'array', items: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  generate(
    @Body(new ZodValidationPipe(CreateScriptSchema)) body: CreateScriptInput,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthRequest,
  ) {
    return this.scriptService.createJob(getUserId(req), body, files || []);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List script jobs' })
  list(@Req() req: AuthRequest) {
    return this.scriptService.list(getUserId(req));
  }

  @Get(':id/export')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download script as PDF' })
  @ApiParam({ name: 'id' })
  async exportPdf(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const { pdfBytes, filename } = await this.scriptService.exportPdf(id, getUserId(req));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(Buffer.from(pdfBytes));
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get script job by id' })
  @ApiParam({ name: 'id' })
  getOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.scriptService.getOne(id, getUserId(req));
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update script title and content' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() body: { title: string; content: string },
    @Req() req: AuthRequest,
  ) {
    return this.scriptService.update(id, getUserId(req), body.title, body.content);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete script job' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.scriptService.remove(id, getUserId(req));
  }

  @Sse('status/:jobId')
  @ApiOperation({
    summary: 'SSE: script generation job status',
    description: 'No Bearer required on this route in the current implementation.',
  })
  @ApiParam({ name: 'jobId' })
  status(@Param('jobId') jobId: string, @Req() req: AuthRequest): Observable<MessageEvent> {
    return createJobSSE({
      queue: this.queue,
      jobId,
      req,
      getMessages: {
        active: 'Generating your script...',
        completed: 'Script generated!',
        failed: 'Generation failed',
      },
      extractResult: (job) => ({
        title: job.returnvalue?.title,
        script: job.returnvalue?.script,
        creditsConsumed: job.returnvalue?.creditsConsumed ?? 0,
      }),
    });
  }
}
