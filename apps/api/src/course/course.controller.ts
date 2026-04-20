import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { getUserId } from '../common/get-user-id';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { CourseService } from './course.service';

@ApiTags('course')
@ApiBearerAuth()
@Controller('course')
@UseGuards(SupabaseAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI course outline/content' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['topic'],
      properties: {
        topic: { type: 'string' },
        description: { type: 'string' },
        difficulty: { type: 'string' },
        videoCount: { type: 'integer' },
        references: { type: 'string' },
      },
    },
  })
  generate(
    @Body() body: {
      topic: string;
      description?: string;
      difficulty?: string;
      videoCount?: number;
      references?: string;
    },
    @Req() req: AuthRequest,
  ) {
    return this.courseService.generate(getUserId(req), body);
  }
}
