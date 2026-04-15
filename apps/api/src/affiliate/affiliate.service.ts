import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { Resend } from 'resend';

interface LsAffiliateAttributes {
  store_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  share_domain: string;
  status: string;
  products: unknown;
  application_note: string;
  total_earnings: number;
  unpaid_earnings: number;
  created_at: string;
  updated_at: string;
}

interface LsAffiliateData {
  type: string;
  id: string;
  attributes: LsAffiliateAttributes;
}

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);
  private readonly resend: Resend | null = null;
  private readonly adminEmail: string;
  private lsInitialized = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) this.resend = new Resend(apiKey);
    this.adminEmail = this.configService.get<string>('ADMIN_NOTIFICATION_EMAIL') || 'afrinxnahar@gmail.com';
  }

  private get db() {
    const client = this.supabaseService.getAdminClient();
    if (!client) throw new BadRequestException('Admin client not configured');
    return client;
  }

  private initLemonSqueezy() {
    if (this.lsInitialized) return;
    const apiKey = this.configService.get<string>('LEMONSQUEEZY_API_KEY');
    if (!apiKey) throw new BadRequestException('Lemon Squeezy not configured');
    lemonSqueezySetup({ apiKey });
    this.lsInitialized = true;
  }

  // ==================== USER: Apply to become affiliate ====================

  async submitRequest(userId: string, data: {
    full_name?: string;
    email?: string;
    website?: string;
    social_media?: string;
    audience_size?: string;
    promotion_method?: string;
    reason: string;
  }) {
    const { data: existing } = await this.db
      .from('affiliate_requests')
      .select('id, status')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved'])
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(
        existing.status === 'pending'
          ? 'You already have a pending request'
          : 'You are already an approved affiliate',
      );
    }

    const { data: profile, error: profileError } = await this.db
      .from('profiles')
      .select('full_name, name, email')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.email) {
      throw new BadRequestException('Unable to load your profile information');
    }

    const fullName = profile.full_name || profile.name || profile.email;
    const email = profile.email;

    const { data: request, error } = await this.db
      .from('affiliate_requests')
      .insert({
        user_id: userId,
        full_name: fullName,
        email,
        website: data.website,
        social_media: data.social_media,
        audience_size: data.audience_size,
        promotion_method: data.promotion_method,
        reason: data.reason,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    this.notifyAdminNewApplication({
      ...data,
      full_name: fullName,
      email,
    }).catch((err) =>
      this.logger.error(`Failed to send affiliate notification: ${err}`),
    );

    return request;
  }

  private async notifyAdminNewApplication(data: {
    full_name: string;
    email: string;
    website?: string;
    social_media?: string;
    audience_size?: string;
    promotion_method?: string;
    reason: string;
  }) {
    if (!this.resend) return;

    const esc = (s?: string) =>
      (s ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    await this.resend.emails.send({
      from: 'Creator AI <notifications@tryscriptai.com>',
      to: this.adminEmail,
      subject: `New Affiliate Application from ${data.full_name}`,
      html: `<div style="font-family:Arial,sans-serif;color:#333;background:#f9f9f9;padding:20px">
        <div style="background:#fff;padding:24px;border-radius:8px;max-width:560px;margin:auto">
          <h2 style="color:#4F46E5;margin-top:0">New Affiliate Application</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#888;width:140px">Name</td><td style="padding:8px 0">${esc(data.full_name)}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Email</td><td style="padding:8px 0">${esc(data.email)}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Website</td><td style="padding:8px 0">${esc(data.website)}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Social Media</td><td style="padding:8px 0">${esc(data.social_media)}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Audience Size</td><td style="padding:8px 0">${esc(data.audience_size)}</td></tr>
            <tr><td style="padding:8px 0;color:#888">Promotion Method</td><td style="padding:8px 0">${esc(data.promotion_method)}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee">
          <p style="color:#888;font-size:13px;margin-bottom:4px"><strong>Reason</strong></p>
          <p style="white-space:pre-line;margin-top:0">${esc(data.reason)}</p>
          <hr style="margin:16px 0;border:none;border-top:1px solid #eee">
          <p style="font-size:12px;color:#aaa">Received ${new Date().toUTCString()}</p>
        </div>
      </div>`,
    });
  }

  async getRequestStatus(userId: string) {
    const { data, error } = await this.db
      .from('affiliate_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ==================== ADMIN: Manage affiliate requests ====================

  async getRequests(page = 1, limit = 20, status?: string) {
    let query = this.db
      .from('affiliate_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw new BadRequestException(error.message);
    return { data, total: count ?? 0, page, limit };
  }

  async reviewRequest(requestId: string, reviewedBy: string, action: 'approved' | 'denied' | 'pending', adminNotes?: string) {
    const { data: request, error: fetchErr } = await this.db
      .from('affiliate_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchErr || !request) throw new NotFoundException('Request not found');
    if (request.status === action) throw new BadRequestException(`Request is already ${action}`);

    const updates: Record<string, unknown> = {
      status: action,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;

    const { data, error } = await this.db
      .from('affiliate_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    if (action === 'approved') {
      await this.sendAffiliateApprovalEmail({
        recipientEmail: request.email,
        recipientName: request.full_name,
        adminNotes,
      });
    }

    return data;
  }

  private async sendAffiliateApprovalEmail(input: {
    recipientEmail: string;
    recipientName: string;
    adminNotes?: string;
  }) {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not configured, cannot send affiliate approval email');
      throw new InternalServerErrorException('Approval email service is not configured');
    }

    const affiliateLink = this.getLsAffiliateSignupUrl();
    const esc = (value: string) =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const safeName = esc(input.recipientName || 'there');
    const safeNotes = input.adminNotes ? esc(input.adminNotes) : '';

    try {
      await this.resend.emails.send({
        from: 'Creator AI <notifications@tryscriptai.com>',
        to: input.recipientEmail,
        subject: 'Your affiliate application was approved',
        html: `<div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;margin:auto;padding:20px">
          <h2 style="color:#4F46E5;margin-top:0">You are approved as a Creator AI affiliate</h2>
          <p>Hi ${safeName},</p>
          <p>Your affiliate application has been approved. Use the link below to continue:</p>
          <p><a href="${affiliateLink}" style="color:#4F46E5;font-weight:600">Open your affiliate link</a></p>
          ${safeNotes ? `<p><strong>Note from admin:</strong><br/>${safeNotes}</p>` : ''}
          <p style="margin-top:20px">Thanks,<br/>Creator AI Team</p>
        </div>`,
      });
    } catch (error) {
      this.logger.error(`Failed to send affiliate approval email: ${error}`);
      throw new InternalServerErrorException('Failed to send approval email');
    }
  }

  // ==================== ADMIN: Create affiliate link for a rep ====================

  async createAffiliateLinkForRep(adminId: string, body: {
    sales_rep_id: string;
    code: string;
    label?: string;
    target_url?: string;
    commission_rate?: number;
    ls_affiliate_id?: string;
  }) {
    const { data: rep } = await this.db
      .from('profiles')
      .select('user_id, role')
      .eq('user_id', body.sales_rep_id)
      .single();

    if (!rep) throw new NotFoundException('Sales rep not found');

    const { data, error } = await this.db
      .from('affiliate_links')
      .insert({
        sales_rep_id: body.sales_rep_id,
        code: body.code,
        label: body.label,
        target_url: body.target_url || '/',
        commission_rate: body.commission_rate ?? 10,
        ls_affiliate_id: body.ls_affiliate_id || null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ==================== ADMIN: Fetch LS affiliates ====================

  async getLsAffiliates() {
    this.initLemonSqueezy();
    const apiKey = this.configService.get<string>('LEMONSQUEEZY_API_KEY');
    const storeId = this.configService.get<string>('LEMONSQUEEZY_STORE_ID');

    const url = storeId
      ? `https://api.lemonsqueezy.com/v1/affiliates?filter[store_id]=${storeId}`
      : 'https://api.lemonsqueezy.com/v1/affiliates';

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      this.logger.error(`LS affiliates fetch failed: ${response.status}`);
      throw new BadRequestException('Failed to fetch Lemon Squeezy affiliates');
    }

    const json = await response.json() as { data: LsAffiliateData[] };

    return (json.data || []).map((item) => ({
      id: item.id,
      user_name: item.attributes.user_name,
      user_email: item.attributes.user_email,
      share_domain: item.attributes.share_domain,
      status: item.attributes.status,
      total_earnings: item.attributes.total_earnings,
      unpaid_earnings: item.attributes.unpaid_earnings,
      created_at: item.attributes.created_at,
      updated_at: item.attributes.updated_at,
    }));
  }

  getLsAffiliateSignupUrl(): string {
    const storeId = this.configService.get<string>('LEMONSQUEEZY_STORE_ID');
    return `https://app.lemonsqueezy.com/affiliates/store/${storeId || ''}`;
  }
}
