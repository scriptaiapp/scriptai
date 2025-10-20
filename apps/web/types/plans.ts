
export interface Features {
    feature: string;
    limit: string
}

export interface Plans {
    id: string;
    name: string;
    price_monthly: number;
    is_active: boolean;
    credits_monthly: boolean;
    created_at: string;
    features: Features[]
}