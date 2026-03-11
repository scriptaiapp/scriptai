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
import { SalesRepService } from './sales-rep.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

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
  getDashboardStats(@Req() req: AuthRequest) {
    return this.salesRepService.getDashboardStats(this.getUserId(req));
  }

  // ==================== AFFILIATE LINKS ====================

  @Get('links')
  getAffiliateLinks(@Req() req: AuthRequest) {
    return this.salesRepService.getAffiliateLinks(this.getUserId(req));
  }

  @Post('links')
  createAffiliateLink(
    @Body() body: { code: string; label?: string; target_url?: string; commission_rate?: number },
    @Req() req: AuthRequest,
  ) {
    return this.salesRepService.createAffiliateLink(this.getUserId(req), body);
  }

  @Put('links/:id')
  updateAffiliateLink(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthRequest,
  ) {
    return this.salesRepService.updateAffiliateLink(this.getUserId(req), id, body);
  }

  @Delete('links/:id')
  deleteAffiliateLink(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.salesRepService.deleteAffiliateLink(this.getUserId(req), id);
  }

  // ==================== INVITED USERS ====================

  @Get('invited')
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
  deleteInvitation(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.salesRepService.deleteInvitation(this.getUserId(req), id);
  }

  // ==================== SALES ====================

  @Get('sales')
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
}
