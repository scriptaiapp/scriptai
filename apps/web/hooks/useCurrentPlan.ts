"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  credits_monthly: number;
}

interface BillingInfo {
  currentPlan: Plan | null;
}

export function useCurrentPlan() {
  const [planName, setPlanName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<BillingInfo>("/api/v1/billing/info", { requireAuth: true })
      .then((data) => setPlanName(data.currentPlan?.name ?? "Starter"))
      .catch(() => setPlanName("Starter"))
      .finally(() => setLoading(false));
  }, []);

  return {
    planName,
    isStarter: !loading && planName === "Starter",
    loading,
  };
}
