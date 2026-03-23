import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { SupportService } from './support.service';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(SupabaseAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('report-issue')
  reportIssue(@Body() body: { subject: string; email: string; body: string }) {
    return this.supportService.reportIssue(body.subject, body.email, body.body);
  }
}
