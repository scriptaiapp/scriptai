import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SalesRepService } from './sales-rep.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@ApiTags('sales-rep')
@ApiBearerAuth()
@Controller('sales-rep')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('sales_rep', 'admin')
export class SalesRepController {
  constructor(private readonly salesRepService: SalesRepService) {}

  private getUserId(req: AuthRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  // ==================== DASHBOARD ====================

  @Get('stats')
  @ApiOperation({ summary: 'Sales rep dashboard stats' })
  getDashboardStats(@Req() req: AuthRequest) {
    return this.salesRepService.getDashboardStats(this.getUserId(req));
  }

  // ==================== AFFILIATE LINKS ====================

  @Get('links')
  @ApiOperation({ summary: 'List affiliate links for rep' })
  getAffiliateLinks(@Req() req: AuthRequest) {
    return this.salesRepService.getAffiliateLinks(this.getUserId(req));
  }

  @Post('links')
  @ApiOperation({ summary: 'Create affiliate link' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'string' },
        label: { type: 'string' },
        target_url: { type: 'string' },
        commission_rate: { type: 'number' },
      },
    },
  })
  createAffiliateLink(
    @Body() body: { code: string; label?: string; target_url?: string; commission_rate?: number },
    @Req() req: AuthRequest,
  ) {
    return this.salesRepService.createAffiliateLink(this.getUserId(req), body);
  }

  @Put('links/:id')
  @ApiOperation({ summary: 'Update affiliate link' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  updateAffiliateLink(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthRequest,
  ) {
    return this.salesRepService.updateAffiliateLink(this.getUserId(req), id, body);
  }

  @Delete('links/:id')
  @ApiOperation({ summary: 'Delete affiliate link' })
  @ApiParam({ name: 'id' })
  deleteAffiliateLink(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.salesRepService.deleteAffiliateLink(this.getUserId(req), id);
  }

  // ==================== INVITED USERS ====================

  @Get('invited')
  @ApiOperation({ summary: 'Paginated invited users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getInvitedUsers(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesRepService.getInvitedUsers(
      this.getUserId(req),
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite user by email' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: { email: { type: 'string', format: 'email' }, affiliate_link_id: { type: 'string' } },
    },
  })
  inviteUser(
    @Body() body: { email: string; affiliate_link_id?: string },
    @Req() req: AuthRequest,
  ) {
    return this.salesRepService.inviteUser(
      this.getUserId(req),
      body.email,
      body.affiliate_link_id,
    );
  }

  @Delete('invited/:id')
  @ApiOperation({ summary: 'Delete invitation' })
  @ApiParam({ name: 'id' })
  deleteInvitation(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.salesRepService.deleteInvitation(this.getUserId(req), id);
  }

  // ==================== SALES ====================

  @Get('sales')
  @ApiOperation({ summary: 'Paginated sales for rep' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getSales(
    @Req() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesRepService.getSales(
      this.getUserId(req),
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  // ==================== LS AFFILIATE TRACKING ====================

  @Get('ls-tracking')
  @ApiOperation({ summary: 'Lemon Squeezy affiliate tracking data' })
  getLsTracking(@Req() req: AuthRequest) {
    return this.salesRepService.getLsAffiliateData(this.getUserId(req));
  }
}
