import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  type NewCheckout,
} from '@lemonsqueezy/lemonsqueezy.js';
import * as crypto from 'crypto';

export interface PlanRecord {
  id: string;
  name: string;
  price_monthly: number;
  credits_monthly: number;
  features: unknown;
  is_active: boolean;
  ls_variant_id?: string;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id: string;
  ls_subscription_id: string | null;
  ls_customer_id: string | null;
  ls_order_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  plans: PlanRecord;
}

export interface LsWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string; plan_id?: string };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private lsInitialized = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) { }

  private initLemonSqueezy() {
    if (this.lsInitialized) return;
    const apiKey = this.configService.get<string>('LEMONSQUEEZY_API_KEY');
    if (!apiKey) throw new BadRequestException('Lemon Squeezy not configured');
    lemonSqueezySetup({ apiKey });
    this.lsInitialized = true;
  }

  async getPlans(): Promise<PlanRecord[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw new BadRequestException('Failed to fetch plans');
    return data ?? [];
  }

  async getBillingInfo(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .in('status', ['active', 'on_trial', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', userId)
      .single();

    const starterPlan = await this.getStarterPlan();

    // Monthly credit reset for free plan (no LS subscription)
    if (subscription && !subscription.ls_subscription_id && subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      if (periodEnd <= new Date()) {
        const now = new Date();
        const newPeriodEnd = new Date(now);
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

        await supabase
          .from('subscriptions')
          .update({
            current_period_start: now.toISOString(),
            current_period_end: newPeriodEnd.toISOString(),
          })
          .eq('id', subscription.id);

        const resetCredits =
          subscription.plans?.credits_monthly ?? starterPlan?.credits_monthly ?? 500;
        await supabase
          .from('profiles')
          .update({ credits: resetCredits })
          .eq('user_id', userId);

        if (profile) profile.credits = resetCredits;
      }
    } else if (!subscription && starterPlan) {
      // First-time free user: create a free-plan subscription record for tracking
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await supabase.from('subscriptions').insert({
        user_id: userId,
        plan_id: starterPlan.id,
        ls_subscription_id: null,
        ls_customer_id: null,
        ls_order_id: null,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      });
    }

    const isPaidSubscription = !!subscription?.ls_subscription_id;

    return {
      currentPlan: subscription?.plans ?? starterPlan,
      subscription: isPaidSubscription
        ? {
          id: subscription!.id,
          status: subscription!.status,
          currentPeriodEnd: subscription!.current_period_end,
          lsSubscriptionId: subscription!.ls_subscription_id,
        }
        : null,
      credits: profile?.credits ?? 0,
    };
  }

  async createCheckoutSession(userId: string, planId: string) {
    this.initLemonSqueezy();
    const supabase = this.supabaseService.getClient();

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) throw new NotFoundException('Plan not found');
    if (plan.price_monthly === 0)
      throw new BadRequestException('Cannot purchase the free plan');
    if (!plan.ls_variant_id)
      throw new BadRequestException('Plan is not configured for payments');

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    if (!profile?.email) throw new BadRequestException('User email not found');

    const storeId = this.configService.get<string>('LEMONSQUEEZY_STORE_ID');
    if (!storeId) throw new BadRequestException('Store not configured');

    const frontendUrl =
      this.configService.get<string>('FRONTEND_PROD_URL') ||
      this.configService.get<string>('FRONTEND_DEV_URL') ||
      'http://localhost:3000';

    const checkoutData: NewCheckout = {
      productOptions: {
        redirectUrl: `${frontendUrl}/dashboard/settings?tab=billing&status=success`,
      },
      checkoutData: {
        email: profile.email,
        name: profile.full_name ?? undefined,
        custom: { user_id: userId, plan_id: planId },
      },
    };

    const { data, error } = await createCheckout(
      storeId,
      plan.ls_variant_id,
      checkoutData,
    );

    if (error) {
      this.logger.error(`Checkout creation failed: ${JSON.stringify(error)}`);
      throw new BadRequestException('Failed to create checkout');
    }

    return { url: data?.data.attributes.url };
  }

  async getCustomerPortalUrl(userId: string) {
    this.initLemonSqueezy();
    const supabase = this.supabaseService.getClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('ls_subscription_id')
      .eq('user_id', userId)
      .in('status', ['active', 'on_trial', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.ls_subscription_id) {
      throw new BadRequestException('No active subscription found');
    }

    const { data, error } = await getSubscription(
      subscription.ls_subscription_id,
    );

    if (error) {
      this.logger.error(`Failed to fetch subscription: ${JSON.stringify(error)}`);
      throw new BadRequestException('Failed to get portal URL');
    }

    const urls = data?.data.attributes.urls;
    return {
      url: urls?.customer_portal ?? null,
    };
  }

  async cancelActiveSubscription(userId: string) {
    this.initLemonSqueezy();
    const supabase = this.supabaseService.getClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .not('ls_subscription_id', 'is', null)
      .in('status', ['active', 'on_trial', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.ls_subscription_id) {
      throw new BadRequestException('No active paid subscription found');
    }

    const { error } = await cancelSubscription(subscription.ls_subscription_id);
    if (error) {
      this.logger.error(`Failed to cancel subscription: ${JSON.stringify(error)}`);
      throw new BadRequestException('Failed to cancel subscription');
    }

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', subscription.id);

    await this.createFreePlanSubscription(userId);

    this.logger.log(`Subscription canceled for user ${userId}`);
    return { success: true };
  }

  private async createFreePlanSubscription(userId: string) {
    const supabase = this.supabaseService.getClient();
    const starter = await this.getStarterPlan();
    if (!starter) return;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan_id: starter.id,
      ls_subscription_id: null,
      ls_customer_id: null,
      ls_order_id: null,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    await supabase
      .from('profiles')
      .update({ credits: starter.credits_monthly })
      .eq('user_id', userId);
  }

  // --- Webhook handlers ---

  async handleSubscriptionCreated(event: LsWebhookEvent) {
    const attrs = event.data.attributes;
    const userId = event.meta.custom_data?.user_id;
    const planId = event.meta.custom_data?.plan_id;

    if (!userId || !planId) {
      this.logger.warn('Missing custom_data in subscription_created');
      return;
    }

    const supabase = this.supabaseService.getClient();

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', userId)
      .in('status', ['active', 'on_trial', 'past_due']);

    await supabase.from('subscriptions').insert({
      user_id: userId,
      plan_id: planId,
      ls_subscription_id: String(event.data.id),
      ls_customer_id: String(attrs.customer_id ?? ''),
      ls_order_id: String(attrs.order_id ?? ''),
      status: this.mapLsStatus(String(attrs.status ?? 'active')),
      current_period_start: attrs.created_at
        ? new Date(attrs.created_at as string).toISOString()
        : null,
      current_period_end: attrs.renews_at
        ? new Date(attrs.renews_at as string).toISOString()
        : null,
    });

    const { data: plan } = await supabase
      .from('plans')
      .select('credits_monthly')
      .eq('id', planId)
      .single();

    if (plan) {
      await supabase
        .from('profiles')
        .update({ credits: plan.credits_monthly })
        .eq('user_id', userId);
    }

    this.logger.log(`Subscription created for user ${userId}`);
  }

  async handleSubscriptionUpdated(event: LsWebhookEvent) {
    const attrs = event.data.attributes;
    const supabase = this.supabaseService.getClient();
    const lsSubId = String(event.data.id);

    await supabase
      .from('subscriptions')
      .update({
        status: this.mapLsStatus(String(attrs.status ?? '')),
        current_period_end: attrs.renews_at
          ? new Date(attrs.renews_at as string).toISOString()
          : null,
      })
      .eq('ls_subscription_id', lsSubId);
  }

  async handleSubscriptionCancelled(event: LsWebhookEvent) {
    const supabase = this.supabaseService.getClient();
    const lsSubId = String(event.data.id);

    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('ls_subscription_id', lsSubId);
  }

  async handleSubscriptionExpired(event: LsWebhookEvent) {
    const supabase = this.supabaseService.getClient();
    const lsSubId = String(event.data.id);

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('ls_subscription_id', lsSubId)
      .single();

    await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('ls_subscription_id', lsSubId);

    if (sub?.user_id) {
      // Skip if user already has a free plan subscription (e.g. from manual downgrade)
      const { data: existingFreeSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', sub.user_id)
        .is('ls_subscription_id', null)
        .eq('status', 'active')
        .maybeSingle();

      if (!existingFreeSub) {
        await this.createFreePlanSubscription(sub.user_id);
      }
    }
  }

  async handleSubscriptionPaymentSuccess(event: LsWebhookEvent) {
    const attrs = event.data.attributes;
    const lsSubId = String(attrs.subscription_id ?? '');
    if (!lsSubId) return;

    const supabase = this.supabaseService.getClient();

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id')
      .eq('ls_subscription_id', lsSubId)
      .single();

    if (!sub) return;

    const { data: plan } = await supabase
      .from('plans')
      .select('credits_monthly')
      .eq('id', sub.plan_id)
      .single();

    if (plan) {
      await supabase
        .from('profiles')
        .update({ credits: plan.credits_monthly })
        .eq('user_id', sub.user_id);
    }
  }

  // --- Usage history ---

  async getUsageHistory(userId: string, range: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    const supabase = this.supabaseService.getClient();

    const now = new Date();
    let daysBack: number;
    switch (range) {
      case 'daily':
        daysBack = 7;
        break;
      case 'weekly':
        daysBack = 28;
        break;
      case 'monthly':
        daysBack = 180;
        break;
    }
    const since = new Date(now.getTime() - daysBack * 86400000).toISOString();

    const tables = ['scripts', 'ideation_jobs', 'thumbnail_jobs', 'subtitle_jobs', 'dubbing_jobs', 'story_builder_jobs'] as const;
    type UsageRow = { credits_consumed: number; created_at: string };

    const rows: UsageRow[] = [];
    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select('credits_consumed, created_at')
        .eq('user_id', userId)
        .gte('created_at', since)
        .gt('credits_consumed', 0);

      if (data) rows.push(...(data as UsageRow[]));
    }

    const buckets: Record<string, number> = {};
    for (const row of rows) {
      const d = new Date(row.created_at);
      let key: string;
      if (range === 'daily') {
        key = d.toISOString().split('T')[0]!;
      } else if (range === 'weekly') {
        const weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split('T')[0]!;
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      buckets[key] = (buckets[key] ?? 0) + (row.credits_consumed ?? 0);
    }

    const result = Object.entries(buckets)
      .map(([date, credits]) => ({ date, credits }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalUsed = rows.reduce((sum, r) => sum + (r.credits_consumed ?? 0), 0);

    return { usage: result, totalUsed, range };
  }

  // --- Webhook signature verification ---

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const secret = this.configService.get<string>(
      'LEMONSQUEEZY_WEBHOOK_SECRET',
    );
    if (!secret) throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');
    const digestBuf = Buffer.from(digest);
    const signatureBuf = Buffer.from(signature);

    if (digestBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(digestBuf, signatureBuf);
  }

  // --- Helpers ---

  private async getStarterPlan(): Promise<PlanRecord | null> {
    const supabase = this.supabaseService.getClient();
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('name', 'Starter')
      .single();
    return data;
  }

  private mapLsStatus(status: string): string {
    const map: Record<string, string> = {
      active: 'active',
      on_trial: 'on_trial',
      past_due: 'past_due',
      paused: 'paused',
      cancelled: 'canceled',
      expired: 'expired',
      unpaid: 'unpaid',
    };
    return map[status] ?? 'canceled';
  }
}
