import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SalesRepService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getAdminClient();
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats(salesRepId: string) {
    const [linksRes, salesRes, invitedRes, revenueRes, pendingRes] = await Promise.all([
      this.db.from('affiliate_links').select('id', { count: 'exact', head: true }).eq('sales_rep_id', salesRepId),
      this.db.from('affiliate_sales').select('id', { count: 'exact', head: true }).eq('sales_rep_id', salesRepId).eq('status', 'confirmed'),
      this.db.from('invited_users').select('id', { count: 'exact', head: true }).eq('invited_by', salesRepId),
      this.db.from('affiliate_sales').select('commission').eq('sales_rep_id', salesRepId).in('status', ['confirmed', 'paid']),
      this.db.from('affiliate_sales').select('commission').eq('sales_rep_id', salesRepId).eq('status', 'pending'),
    ]);

    const totalCommission = revenueRes.data?.reduce((sum, r) => sum + Number(r.commission || 0), 0) ?? 0;
    const pendingCommission = pendingRes.data?.reduce((sum, r) => sum + Number(r.commission || 0), 0) ?? 0;

    return {
      totalLinks: linksRes.count ?? 0,
      confirmedSales: salesRes.count ?? 0,
      totalInvited: invitedRes.count ?? 0,
      totalCommission,
      pendingCommission,
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
}
