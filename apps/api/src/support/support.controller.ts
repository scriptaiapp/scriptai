import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { SupportService } from './support.service';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
@UseGuards(SupabaseAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('report-issue')
  @ApiOperation({ summary: 'Submit support / issue report' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subject', 'email', 'body'],
      properties: {
        subject: { type: 'string' },
        email: { type: 'string', format: 'email' },
        body: { type: 'string' },
      },
    },
  })
  reportIssue(@Body() body: { subject: string; email: string; body: string }) {
    return this.supportService.reportIssue(body.subject, body.email, body.body);
  }
}
