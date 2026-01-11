import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubtitleService } from './subtitle.service';
import { CreateSubtitleDto } from './dto/create-subtitle.dto';
import { UpdateSubtitleDto } from './dto/update-subtitle.dto';
import { BurnSubtitleDto } from './dto/burn-subtitle.dto';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { Request, Response } from 'express';
import { UploadVideoDto } from './dto/upload-video.dto';

interface AuthRequest extends Request {
  user?: { id: string };
}

@Controller('subtitle')
@UseGuards(SupabaseAuthGuard)
export class SubtitleController {
  constructor(private readonly subtitleService: SubtitleService) { }

  @Post()
  create(@Body() createSubtitleDto: CreateSubtitleDto, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    console.log("working")
    return this.subtitleService.create(createSubtitleDto, userId);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.findAll(userId);
  }


  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200 * 1024 * 1024 }), // 200MB
          new FileTypeValidator({ fileType: /(video\/.*)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadVideoDto: UploadVideoDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    const filename = file.originalname;
    return this.subtitleService.upload(file, uploadVideoDto, userId, filename);
  }



  @Patch()
  update(@Body() updateSubtitleDto: UpdateSubtitleDto, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.update(updateSubtitleDto, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.findOne(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    return this.subtitleService.remove(id, userId);
  }

  @Patch(':id')
  updateSubtitles(@Param('id') id: string, @Body() updateSubtitleDto: UpdateSubtitleDto, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }
    // console.log(updateSubtitleDto);
    return this.subtitleService.updateSubtitles(id, updateSubtitleDto, userId);
  }

  @Post('burn')
  async burnSubtitle(@Body() burnSubtitleDto: BurnSubtitleDto, @Res() res: Response, @Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    try {
      const videoBuffer = await this.subtitleService.burnSubtitle(burnSubtitleDto);

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'attachment; filename=video_with_subtitles.mp4');
      res.setHeader('Content-Length', videoBuffer.length.toString());
      res.send(videoBuffer);
    } catch (error) {
      console.error('Burn subtitle controller error:', error);
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
