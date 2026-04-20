import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UsePipes } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubtitleService } from './subtitle.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import {
  CreateSubtitleSchema,
  UpdateSubtitleSchema,
  UpdateSubtitleByIdSchema,
  UploadVideoSchema,
  BurnSubtitleSchema,
} from '@repo/validation';
import type {
  CreateSubtitleInput,
  UpdateSubtitleInput,
  UpdateSubtitleByIdInput,
  UploadVideoInput,
  BurnSubtitleInput,
} from '@repo/validation';
import { ApiMultipartForm } from '../common/swagger-multipart';

const SUBTITLE_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@ApiTags('subtitle')
@ApiBearerAuth()
@Controller('subtitle')
@UseGuards(SupabaseAuthGuard)
export class SubtitleController {
  constructor(private readonly subtitleService: SubtitleService) { }

  @Post()
  @ApiOperation({ summary: 'Create subtitle record' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subtitleId'],
      properties: {
        subtitleId: { type: 'string' },
        language: { type: 'string' },
        targetLanguage: { type: 'string' },
        duration: { type: 'number' },
      },
    },
  })
  @UsePipes(new ZodValidationPipe(CreateSubtitleSchema))
  create(@Body() body: CreateSubtitleInput, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.create(body, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List subtitles for user' })
  findAll(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.findAll(userId);
  }


  @Post('upload')
  @ApiOperation({ summary: 'Upload video for subtitle pipeline (multipart)' })
  @ApiMultipartForm({
    type: 'object',
    required: ['video', 'duration'],
    properties: {
      video: { type: 'string', format: 'binary' },
      duration: { type: 'string' },
      scriptId: { type: 'string', format: 'uuid' },
    },
  })
  @UseInterceptors(FileInterceptor('video'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: SUBTITLE_MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: /(video\/.*)/ }),
        ],
        exceptionFactory: (errors) => {
          const combined = Array.isArray(errors) ? errors.join(' | ').toLowerCase() : String(errors).toLowerCase();
          if (combined.includes('max') || combined.includes('size') || combined.includes('larger')) {
            return new BadRequestException('Video upload limit is 50MB on your current plan. Please upgrade to upload larger videos.');
          }
          if (combined.includes('type') || combined.includes('video')) {
            return new BadRequestException('Unsupported video format. Please upload a valid video file.');
          }
          return new BadRequestException('Invalid upload request.');
        },
      }),
    )
    file: Express.Multer.File,
    @Body(new ZodValidationPipe(UploadVideoSchema)) body: UploadVideoInput,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.upload(file, body, userId, file.originalname);
  }

  @Patch()
  @ApiOperation({ summary: 'Update subtitle JSON by subtitle_id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subtitle_json', 'subtitle_id'],
      properties: {
        subtitle_id: { type: 'string' },
        subtitle_json: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' },
              text: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @UsePipes(new ZodValidationPipe(UpdateSubtitleSchema))
  update(@Body() body: UpdateSubtitleInput, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.update(body, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subtitle by id' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.findOne(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subtitle' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.remove(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Replace subtitle lines for record id' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subtitle_json'],
      properties: {
        subtitle_json: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' },
              text: { type: 'string' },
            },
          },
        },
      },
    },
  })
  updateSubtitles(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSubtitleByIdSchema)) body: UpdateSubtitleByIdInput,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.updateSubtitles(id, body, userId);
  }

  @Post('burn')
  @ApiOperation({ summary: 'Burn subtitles into video (returns MP4 stream)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['videoUrl', 'subtitles'],
      properties: {
        videoUrl: { type: 'string', format: 'uri' },
        subtitles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              start: { type: 'string' },
              end: { type: 'string' },
              text: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async burnSubtitle(
    @Body(new ZodValidationPipe(BurnSubtitleSchema)) body: BurnSubtitleInput,
    @Res() res: Response,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    try {
      const videoBuffer = await this.subtitleService.burnSubtitle(body);

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename=video_with_subtitles.mp4');
      res.setHeader('Content-Length', videoBuffer.length.toString());
      res.send(videoBuffer);
    } catch (error) {
      if (!res.headersSent) {
        if (error instanceof BadRequestException) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
        }
      }
    }
  }
}
