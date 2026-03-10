"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  credits_monthly: number;
  features: string[];
  is_active: boolean;
  ls_variant_id: string | null;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  currentPeriodEnd: string | null;
  lsSubscriptionId: string | null;
}

interface BillingInfo {
  currentPlan: Plan | null;
  subscription: SubscriptionInfo | null;
  credits: number;
}

const POLL_DELAYS = [2000, 3000, 4000, 5000, 6000];
const MAX_POLL_ATTEMPTS = POLL_DELAYS.length;

export function useBilling() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const pollAbort = useRef<AbortController | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await api.get<Plan[]>("/api/v1/billing/plans");
      setPlans(data);
    } catch {
      toast.error("Failed to load plans");
    }
  }, []);

  const fetchBillingInfo = useCallback(async (): Promise<BillingInfo | null> => {
    try {
      const data = await api.get<BillingInfo>("/api/v1/billing/info", {
        requireAuth: true,
      });
      setBillingInfo(data);
      return data;
    } catch {
      toast.error("Failed to load billing info");
      return null;
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPlans(), fetchBillingInfo()]);
    setLoading(false);
  }, [fetchPlans, fetchBillingInfo]);

  useEffect(() => {
    loadAll();
    return () => { pollAbort.current?.abort(); };
  }, [loadAll]);

  const triggerBackendSync = useCallback(async (): Promise<boolean> => {
    try {
      const result = await api.post<{ synced: boolean }>(
        "/api/v1/billing/sync",
        {},
        { requireAuth: true },
      );
      return result.synced;
    } catch {
      return false;
    }
  }, []);

  const pollForSubscription = useCallback(
    async (previousCredits: number) => {
      pollAbort.current?.abort();
      const controller = new AbortController();
      pollAbort.current = controller;
      setSyncing(true);

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (controller.signal.aborted) break;

        await new Promise((resolve) => setTimeout(resolve, POLL_DELAYS[attempt]));
        if (controller.signal.aborted) break;

        // On attempt 2, also try the backend sync fallback
        if (attempt === 2) {
          await triggerBackendSync();
        }

        const data = await fetchBillingInfo();
        if (data?.subscription || (data && data.credits !== previousCredits)) {
          setSyncing(false);
          toast.success("Plan updated successfully!", {
            description: `You're now on the ${data.currentPlan?.name ?? "new"} plan.`,
          });
          return;
        }
      }

      setSyncing(false);
      toast.info("Your payment was received. It may take a moment to reflect.", {
        description: "Try refreshing in a few seconds.",
        duration: 8000,
      });
    },
    [fetchBillingInfo, triggerBackendSync],
  );

  const subscribe = useCallback(async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const { url } = await api.post<{ url: string }>(
        "/api/v1/billing/checkout",
        { planId },
        { requireAuth: true },
      );
      if (url) window.location.href = url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      toast.error(message);
    } finally {
      setCheckoutLoading(null);
    }
  }, []);

  const openPortal = useCallback(async () => {
    setPortalLoading(true);
    try {
      const { url } = await api.post<{ url: string }>(
        "/api/v1/billing/portal",
        {},
        { requireAuth: true },
      );
      if (url) window.location.href = url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to open billing portal";
      toast.error(message);
    } finally {
      setPortalLoading(false);
    }
  }, []);

  return {
    plans,
    billingInfo,
    loading,
    syncing,
    checkoutLoading,
    portalLoading,
    subscribe,
    openPortal,
    refresh: loadAll,
    pollForSubscription,
  };
}
