export interface Plan {
    id: string;
    name: string;
    price_monthly: number;
    credits_monthly: number;
    features: string[];
    is_active: boolean;
    stripe_price_id: string | null;
}

export interface SubscriptionInfo {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    stripeSubscriptionId: string | null;
}

export interface BillingInfo {
    currentPlan: Plan | null;
    subscription: SubscriptionInfo | null;
    credits: number;
}