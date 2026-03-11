import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type {
  SalesRepDashboardStats,
  AffiliateLink,
  AffiliateSale,
  InvitedUser,
  PaginatedResponse,
} from '@repo/validation';

const AUTH = { requireAuth: true };

export function useSalesRepStats() {
  const [stats, setStats] = useState<SalesRepDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<SalesRepDashboardStats>('/api/v1/sales-rep/stats', AUTH);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch sales rep stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  return { stats, loading, refresh: fetchStats };
}

export function useSalesRepLinks() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<AffiliateLink[]>('/api/v1/sales-rep/links', AUTH);
      setLinks(data);
    } catch (err) {
      console.error('Failed to fetch affiliate links:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);
  return { links, loading, refresh: fetchLinks };
}

export function useSalesRepInvited(page = 1) {
  const [data, setData] = useState<PaginatedResponse<InvitedUser> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvited = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<PaginatedResponse<InvitedUser>>(`/api/v1/sales-rep/invited?page=${page}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch invited users:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchInvited(); }, [fetchInvited]);
  return { ...data, loading, refresh: fetchInvited };
}

export function useSalesRepSales(page = 1) {
  const [data, setData] = useState<PaginatedResponse<AffiliateSale> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<PaginatedResponse<AffiliateSale>>(`/api/v1/sales-rep/sales?page=${page}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSales(); }, [fetchSales]);
  return { ...data, loading, refresh: fetchSales };
}

export const salesRepApi = {
  createLink: (data: { code: string; label?: string; target_url?: string; commission_rate?: number }) =>
    api.post<AffiliateLink>('/api/v1/sales-rep/links', data, AUTH),
  updateLink: (id: string, data: Record<string, unknown>) =>
    api.put<AffiliateLink>(`/api/v1/sales-rep/links/${id}`, data, AUTH),
  deleteLink: (id: string) =>
    api.delete(`/api/v1/sales-rep/links/${id}`, AUTH),
  inviteUser: (email: string, affiliateLinkId?: string) =>
    api.post<InvitedUser>('/api/v1/sales-rep/invite', { email, affiliate_link_id: affiliateLinkId }, AUTH),
  deleteInvitation: (id: string) =>
    api.delete(`/api/v1/sales-rep/invited/${id}`, AUTH),
};
