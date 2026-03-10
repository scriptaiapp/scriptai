import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  Logger,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { BillingService, type LsWebhookEvent } from './billing.service';

@Controller('lemonsqueezy')
export class LemonSqueezyWebhookController {
  private readonly logger = new Logger(LemonSqueezyWebhookController.name);

  constructor(private readonly billingService: BillingService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const signature = req.headers['x-signature'] as string;
    if (!signature || !req.rawBody) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Missing signature' });
    }

    try {
      const valid = this.billingService.verifyWebhookSignature(
        req.rawBody,
        signature,
      );
      if (!valid) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ error: 'Invalid signature' });
      }
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Invalid signature' });
    }

    const eventName = req.headers['x-event-name'] as string;
    const event: LsWebhookEvent = req.body;

    this.logger.log(
      `Webhook received: ${eventName} | subscription_id=${event?.data?.id} | custom_data=${JSON.stringify(event?.meta?.custom_data ?? {})}`,
    );

    try {
      switch (eventName) {
        case 'subscription_created':
          await this.billingService.handleSubscriptionCreated(event);
          this.logger.log(`subscription_created processed for user ${event?.meta?.custom_data?.user_id}`);
          break;
        case 'subscription_updated':
          await this.billingService.handleSubscriptionUpdated(event);
          break;
        case 'subscription_cancelled':
          await this.billingService.handleSubscriptionCancelled(event);
          break;
        case 'subscription_expired':
          await this.billingService.handleSubscriptionExpired(event);
          break;
        case 'subscription_payment_success':
          await this.billingService.handleSubscriptionPaymentSuccess(event);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${eventName}`);
      }
    } catch (err) {
      this.logger.error(
        `Webhook handler error for ${eventName}: ${err instanceof Error ? err.message : err}`,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Handler failed' });
    }

    return res.status(HttpStatus.OK).json({ received: true });
  }
}
