import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get('info')
  @UseGuards(SupabaseAuthGuard)
  getBillingInfo(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.billingService.getBillingInfo(userId);
  }

  @Get('usage')
  @UseGuards(SupabaseAuthGuard)
  getUsage(
    @Req() req: AuthRequest,
    @Query('range') range?: 'daily' | 'weekly' | 'monthly',
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.billingService.getUsageHistory(
      userId,
      range && ['daily', 'weekly', 'monthly'].includes(range) ? range : 'weekly',
    );
  }

  @Post('checkout')
  @UseGuards(SupabaseAuthGuard)
  createCheckoutSession(
    @Req() req: AuthRequest,
    @Body() body: { planId: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.billingService.createCheckoutSession(userId, body.planId);
  }

  @Post('portal')
  @UseGuards(SupabaseAuthGuard)
  getCustomerPortal(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.billingService.getCustomerPortalUrl(userId);
  }

  @Post('cancel')
  @UseGuards(SupabaseAuthGuard)
  cancelSubscription(@Req() req: AuthRequest) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.billingService.cancelActiveSubscription(userId);
  }
}
