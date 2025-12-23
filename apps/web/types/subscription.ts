export type SubType = "Pro" | "Enterprise" | "Free"

export interface Subscription {
    id: string
    user_id: string
    plan_id: string
    stripe_subscription_id: string
    status: string
    current_period_start: string
    current_period_end: string
    created_at: string
    updated_at: string
}