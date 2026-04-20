import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@ApiTags('affiliate')
@ApiBearerAuth()
@Controller('affiliate')
@UseGuards(SupabaseAuthGuard)
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  private getUserId(req: AuthRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  // ==================== USER ENDPOINTS ====================

  @Post('apply')
  @ApiOperation({ summary: 'Submit affiliate application' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['full_name', 'email', 'reason'],
      properties: {
        full_name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        website: { type: 'string' },
        social_media: { type: 'string' },
        audience_size: { type: 'string' },
        promotion_method: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  })
  apply(
    @Body() body: {
      full_name: string;
      email: string;
      website?: string;
      social_media?: string;
      audience_size?: string;
      promotion_method?: string;
      reason: string;
    },
    @Req() req: AuthRequest,
  ) {
    return this.affiliateService.submitRequest(this.getUserId(req), body);
  }

  @Get('status')
  @ApiOperation({ summary: 'Affiliate application status for current user' })
  getStatus(@Req() req: AuthRequest) {
    return this.affiliateService.getRequestStatus(this.getUserId(req));
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List affiliate applications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  getRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.affiliateService.getRequests(
      Number(page) || 1,
      Number(limit) || 20,
      status,
    );
  }

  @Put('requests/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Approve/deny affiliate request' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['approved', 'denied', 'pending'] },
        admin_notes: { type: 'string' },
      },
    },
  })
  reviewRequest(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'denied' | 'pending'; admin_notes?: string },
    @Req() req: AuthRequest,
  ) {
    return this.affiliateService.reviewRequest(
      id,
      this.getUserId(req),
      body.status,
      body.admin_notes,
    );
  }

  @Post('admin/create-link')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Create affiliate link for sales rep' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sales_rep_id', 'code'],
      properties: {
        sales_rep_id: { type: 'string', format: 'uuid' },
        code: { type: 'string' },
        label: { type: 'string' },
        target_url: { type: 'string' },
        commission_rate: { type: 'number' },
        ls_affiliate_id: { type: 'string' },
      },
    },
  })
  createLinkForRep(
    @Body() body: {
      sales_rep_id: string;
      code: string;
      label?: string;
      target_url?: string;
      commission_rate?: number;
      ls_affiliate_id?: string;
    },
    @Req() req: AuthRequest,
  ) {
    return this.affiliateService.createAffiliateLinkForRep(
      this.getUserId(req),
      body,
    );
  }

  @Get('admin/ls-affiliates')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List Lemon Squeezy affiliates' })
  getLsAffiliates() {
    return this.affiliateService.getLsAffiliates();
  }

  @Get('admin/ls-signup-url')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Lemon Squeezy affiliate signup URL' })
  getLsSignupUrl() {
    return this.affiliateService.getLsAffiliateSignupUrl();
  }
}
