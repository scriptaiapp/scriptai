"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard } from "lucide-react"
import { useState, useEffect } from "react"

interface BillingInfoProps {
    currentPlan?: string
    nextBillingDate?: string
    paymentMethod?: string
}

export function BillingInfo({ currentPlan, nextBillingDate, paymentMethod }: BillingInfoProps) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000) // Simulate API delay
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                        {loading ? (
                            <>
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-3 w-40" />
                            </>
                        ) : (
                            <>
                                <p className="font-medium">{currentPlan} Plan</p>
                                {nextBillingDate && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Next billing date: {nextBillingDate}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    {loading ? (
                        <Skeleton className="h-8 w-28 rounded-md" />
                    ) : (
                        <Button variant="outline">Upgrade Plan</Button>
                    )}
                </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Payment Method</h3>
                {loading ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center">
                            <Skeleton className="h-5 w-5 rounded-full mr-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                ) : paymentMethod ? (
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-slate-500" />
                            <p>{paymentMethod}</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Change
                        </Button>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400">No payment method added</p>
                        <Button variant="outline" size="sm" className="mt-2">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Add Payment Method
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Billing History */}
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Billing History</h3>
                {loading ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <Skeleton className="h-4 w-56 mx-auto" />
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                        <p className="text-slate-500 dark:text-slate-400">No billing history available</p>
                    </div>
                )}
            </div>
        </div>
    )
}
