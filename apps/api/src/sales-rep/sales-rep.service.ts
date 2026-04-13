import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

@Injectable()
export class SalesRepService {
  private readonly logger = new Logger(SalesRepService.name);
  private lsInitialized = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  private get db() {
    return this.supabaseService.getAdminClient();
  }

  private initLemonSqueezy() {
    if (this.lsInitialized) return;
    const apiKey = this.configService.get<string>('LEMONSQUEEZY_API_KEY');
    if (!apiKey) throw new BadRequestException('Lemon Squeezy not configured');
    lemonSqueezySetup({ apiKey });
    this.lsInitialized = true;
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats(salesRepId: string) {
    const [linksRes, salesRes, invitedRes, revenueRes, pendingRes, paidRes] = await Promise.all([
      this.db.from('affiliate_links').select('id', { count: 'exact', head: true }).eq('sales_rep_id', salesRepId),
      this.db.from('affiliate_sales').select('id', { count: 'exact', head: true }).eq('sales_rep_id', salesRepId).eq('status', 'confirmed'),
      this.db.from('invited_users').select('id', { count: 'exact', head: true }).eq('invited_by', salesRepId),
      this.db.from('affiliate_sales').select('commission').eq('sales_rep_id', salesRepId).in('status', ['confirmed', 'paid']),
      this.db.from('affiliate_sales').select('commission').eq('sales_rep_id', salesRepId).eq('status', 'pending'),
      this.db.from('affiliate_sales').select('commission').eq('sales_rep_id', salesRepId).eq('status', 'paid'),
    ]);

    const totalCommission = revenueRes.data?.reduce((sum, r) => sum + Number(r.commission || 0), 0) ?? 0;
    const pendingCommission = pendingRes.data?.reduce((sum, r) => sum + Number(r.commission || 0), 0) ?? 0;
    const paidCommission = paidRes.data?.reduce((sum, r) => sum + Number(r.commission || 0), 0) ?? 0;

    return {
      totalLinks: linksRes.count ?? 0,
      confirmedSales: salesRes.count ?? 0,
      totalInvited: invitedRes.count ?? 0,
      totalCommission,
      pendingCommission,
      paidCommission,
    };
  }

  // ==================== AFFILIATE LINKS ====================

  async getAffiliateLinks(salesRepId: string) {
    const { data, error } = await this.db
      .from('affiliate_links')
      .select('*')
      .eq('sales_rep_id', salesRepId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async createAffiliateLink(salesRepId: string, link: {
    code: string;
    label?: string;
    target_url?: string;
    commission_rate?: number;
  }) {
    const { data, error } = await this.db
      .from('affiliate_links')
      .insert({
        sales_rep_id: salesRepId,
        code: link.code,
        label: link.label,
        target_url: link.target_url || '/',
        commission_rate: link.commission_rate ?? 10,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateAffiliateLink(salesRepId: string, linkId: string, updates: Record<string, unknown>) {
    const { data, error } = await this.db
      .from('affiliate_links')
      .update(updates)
      .eq('id', linkId)
      .eq('sales_rep_id', salesRepId)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteAffiliateLink(salesRepId: string, linkId: string) {
    const { error } = await this.db
      .from('affiliate_links')
      .delete()
      .eq('id', linkId)
      .eq('sales_rep_id', salesRepId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ==================== INVITED USERS ====================

  async getInvitedUsers(salesRepId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.db
      .from('invited_users')
      .select('*, affiliate_links(code, label)', { count: 'exact' })
      .eq('invited_by', salesRepId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new BadRequestException(error.message);
    return { data, total: count ?? 0, page, limit };
  }

  async inviteUser(salesRepId: string, email: string, affiliateLinkId?: string) {
    const { data: existing } = await this.db
      .from('invited_users')
      .select('id')
      .eq('invited_by', salesRepId)
      .eq('email', email)
      .single();

    if (existing) {
      throw new BadRequestException('User already invited');
    }

    const { data, error } = await this.db
      .from('invited_users')
      .insert({
        invited_by: salesRepId,
        email,
        affiliate_link_id: affiliateLinkId || null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteInvitation(salesRepId: string, invitationId: string) {
    const { error } = await this.db
      .from('invited_users')
      .delete()
      .eq('id', invitationId)
      .eq('invited_by', salesRepId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }

  // ==================== SALES ====================

  async getSales(salesRepId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.db
      .from('affiliate_sales')
      .select('*, affiliate_links(code, label)', { count: 'exact' })
      .eq('sales_rep_id', salesRepId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw new BadRequestException(error.message);
    return { data, total: count ?? 0, page, limit };
  }

  // ==================== LS AFFILIATE TRACKING ====================

  async getLsAffiliateData(salesRepId: string) {
    const { data: links } = await this.db
      .from('affiliate_links')
      .select('ls_affiliate_id')
      .eq('sales_rep_id', salesRepId)
      .not('ls_affiliate_id', 'is', null);

    if (!links?.length) return null;

    this.initLemonSqueezy();
    const apiKey = this.configService.get<string>('LEMONSQUEEZY_API_KEY');
    const lsId = links[0].ls_affiliate_id;

    try {
      const response = await fetch(`https://api.lemonsqueezy.com/v1/affiliates/${lsId}`, {
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) return null;

      const json = await response.json();
      const attrs = json.data?.attributes;
      if (!attrs) return null;

      return {
        id: json.data.id,
        user_name: attrs.user_name,
        user_email: attrs.user_email,
        status: attrs.status,
        total_earnings: attrs.total_earnings,
        unpaid_earnings: attrs.unpaid_earnings,
        share_domain: attrs.share_domain,
      };
    } catch (err) {
      this.logger.error('Failed to fetch LS affiliate data', err);
      return null;
    }
  }
}
