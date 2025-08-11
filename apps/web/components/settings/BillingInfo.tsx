"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard } from "lucide-react"

interface BillingInfoProps {
    currentPlan: string;
    nextBillingDate: string;
    paymentMethod: string;
}

export function BillingInfo({ currentPlan, nextBillingDate, paymentMethod }: BillingInfoProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div>
                        <p className="font-medium">{currentPlan} Plan</p>
                        {nextBillingDate && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">Next billing date: {nextBillingDate}</p>
                        )}
                    </div>
                    <Button variant="outline">Upgrade Plan</Button>
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Payment Method</h3>
                {paymentMethod ? (
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

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Billing History</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                    <p className="text-slate-500 dark:text-slate-400">No billing history available</p>
                </div>
            </div>
        </div>
    )
}
