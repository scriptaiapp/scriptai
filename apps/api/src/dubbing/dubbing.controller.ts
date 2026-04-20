import { Controller, Post, Body, Get, Delete, Param, Query, UseGuards, Req, Sse } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DubbingService } from './dubbing.service';
import type { CreateDubInput } from '@repo/validation';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@ApiTags('dubbing')
@Controller('dubbing')
export class DubbingController {
  constructor(private readonly service: DubbingService) { }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create dubbing project' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['mediaUrl', 'targetLanguage', 'isVideo', 'mediaName'],
      properties: {
        mediaUrl: { type: 'string', format: 'uri' },
        targetLanguage: { type: 'string' },
        isVideo: { type: 'boolean' },
        mediaName: { type: 'string', maxLength: 100 },
      },
    },
  })
  async create(@Req() req: AuthRequest, @Body() dto: CreateDubInput) {
    return this.service.createDub(dto, req.user!.id);
  }

  @Sse('status/:projectId')
  @ApiOperation({
    summary: 'SSE: dubbing status for project',
    description: 'No Bearer required on this route in the current implementation.',
  })
  @ApiParam({ name: 'projectId' })
  status(@Param('projectId') projectId: string) {
    return this.service.streamDubbingStatus(projectId);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List dubbing projects for user' })
  @ApiQuery({ name: 'page_size', required: false, schema: { default: 100, type: 'integer' } })
  async list(@Req() req: AuthRequest, @Query('page_size') pageSize: number = 100) {
    return this.service.listDubs(req.user!.id, pageSize);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dubbing project' })
  @ApiParam({ name: 'id' })
  async get(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.service.getDub(req.user!.id, id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete dubbing project' })
  @ApiParam({ name: 'id' })
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.service.deleteDub(req.user!.id, id);
    return { status: 'ok' };
  }
}
