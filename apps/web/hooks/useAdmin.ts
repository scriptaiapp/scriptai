import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type {
  AdminDashboardStats,
  BlogPost,
  MailMessage,
  Activity,
  PaginatedResponse,
} from '@repo/validation';

const AUTH = { requireAuth: true };

export function useAdminStats() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<AdminDashboardStats>('/api/v1/admin/stats', AUTH);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  return { stats, loading, refresh: fetchStats };
}

export function useAdminUsers(page = 1, search?: string, role?: string) {
  const [data, setData] = useState<PaginatedResponse<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      const res = await api.get<PaginatedResponse<Record<string, unknown>>>(`/api/v1/admin/users?${params}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  return { ...data, loading, refresh: fetchUsers };
}

export function useAdminSalesReps(page = 1) {
  const [data, setData] = useState<PaginatedResponse<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<PaginatedResponse<Record<string, unknown>>>(`/api/v1/admin/sales-reps?page=${page}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch sales reps:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReps(); }, [fetchReps]);
  return { ...data, loading, refresh: fetchReps };
}

export function useAdminBlogs(page = 1, status?: string) {
  const [data, setData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const res = await api.get<PaginatedResponse<BlogPost>>(`/api/v1/admin/blogs?${params}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
  return { ...data, loading, refresh: fetchBlogs };
}

export function useAdminActivities(page = 1, entityType?: string) {
  const [data, setData] = useState<PaginatedResponse<Activity> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (entityType) params.set('entityType', entityType);
      const res = await api.get<PaginatedResponse<Activity>>(`/api/v1/admin/activities?${params}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, [page, entityType]);

  useEffect(() => { fetch(); }, [fetch]);
  return { ...data, loading, refresh: fetch };
}

export function useAdminMails(page = 1, status?: string) {
  const [data, setData] = useState<PaginatedResponse<MailMessage> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMails = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const res = await api.get<PaginatedResponse<MailMessage>>(`/api/v1/admin/mails?${params}`, AUTH);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch mails:', err);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchMails(); }, [fetchMails]);
  return { ...data, loading, refresh: fetchMails };
}

export const adminApi = {
  updateUser: (userId: string, updates: Record<string, unknown>) =>
    api.put(`/api/v1/admin/users/${userId}`, updates, AUTH),
  deleteUser: (userId: string) =>
    api.delete(`/api/v1/admin/users/${userId}`, AUTH),
  createSalesRep: (data: { email: string; name: string; password: string }) =>
    api.post('/api/v1/admin/sales-reps', data, AUTH),
  removeSalesRep: (userId: string) =>
    api.delete(`/api/v1/admin/sales-reps/${userId}`, AUTH),
  createBlog: (data: Partial<BlogPost>) =>
    api.post<BlogPost>('/api/v1/admin/blogs', data, AUTH),
  updateBlog: (id: string, data: Partial<BlogPost>) =>
    api.put<BlogPost>(`/api/v1/admin/blogs/${id}`, data, AUTH),
  deleteBlog: (id: string) =>
    api.delete(`/api/v1/admin/blogs/${id}`, AUTH),
  getBlog: (id: string) =>
    api.get<BlogPost>(`/api/v1/admin/blogs/${id}`, AUTH),
  updateMailStatus: (id: string, status: string) =>
    api.put(`/api/v1/admin/mails/${id}`, { status }, AUTH),
  updateSaleStatus: (id: string, status: string) =>
    api.put(`/api/v1/admin/affiliates/sales/${id}`, { status }, AUTH),
};
