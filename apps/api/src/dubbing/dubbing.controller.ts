import { Controller, Post, Body, Get, Delete, Param, Query, UseGuards, Req, Sse } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DubbingService } from './dubbing.service';
import type { CreateDubInput } from '@repo/validation';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@ApiTags('dubbing')
@ApiBearerAuth()
@Controller('dubbing')
export class DubbingController {
  constructor(private readonly service: DubbingService) { }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  async create(@Req() req: AuthRequest, @Body() dto: CreateDubInput) {
    return this.service.createDub(dto, req.user!.id);
  }

  @Sse('status/:projectId')
  status(@Param('projectId') projectId: string) {
    return this.service.streamDubbingStatus(projectId);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  async list(@Req() req: AuthRequest, @Query('page_size') pageSize: number = 100) {
    return this.service.listDubs(req.user!.id, pageSize);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  async get(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.service.getDub(req.user!.id, id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.service.deleteDub(req.user!.id, id);
    return { status: 'ok' };
  }
}
