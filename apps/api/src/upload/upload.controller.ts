import {
  Controller, Post, Delete, Req, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { getUserId } from '../common/get-user-id';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { UploadService } from './upload.service';
import { ApiMultipartForm } from '../common/swagger-multipart';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(SupabaseAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar image' })
  @ApiMultipartForm({
    type: 'object',
    required: ['file'],
    properties: { file: { type: 'string', format: 'binary' } },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    return this.uploadService.uploadAvatar(getUserId(req), file);
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove user avatar' })
  deleteAvatar(@Req() req: AuthRequest) {
    return this.uploadService.deleteAvatar(getUserId(req));
  }
}
