import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { AffiliateRequest } from '@repo/validation';

const AUTH = { requireAuth: true };

export function useAffiliateStatus() {
  const [request, setRequest] = useState<AffiliateRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<AffiliateRequest | null>('/api/v1/affiliate/status', AUTH);
      setRequest(data);
    } catch {
      console.error('Failed to fetch affiliate status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  return { request, loading, refresh: fetchStatus };
}

export const affiliateApi = {
  apply: (data: {
    full_name: string;
    email: string;
    website?: string;
    social_media?: string;
    audience_size?: string;
    promotion_method?: string;
    reason: string;
  }) => api.post<AffiliateRequest>('/api/v1/affiliate/apply', data, AUTH),
};
