"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/hooks/useSettings";
import { CreditCard, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// A type for the component's data state
interface BillingData {
  currentPlan: string
  nextBillingDate: string | null
  paymentMethod: string | null
}

export function BillingInfo() {

  const { updateBilling, loadingBilling } = useSettings()
  const router = useRouter()


  const [isLoadingData, setIsLoadingData] = useState(true)
  const [billingData, setBillingData] = useState<BillingData | null>(null)

  useEffect(() => {
    const fetchBillingData = async () => {
      setIsLoadingData(true)
      // Simulate an API call to get the user's billing info
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setBillingData({
        currentPlan: "Pro",
        nextBillingDate: "September 16, 2025",
        paymentMethod: "Visa ending in 4242",
      })
      setIsLoadingData(false)
    }

    fetchBillingData()
  }, [])

  const handleSaveBilling = () => {
    if (!billingData) return

    updateBilling({
      plan: billingData.currentPlan,
      paymentMethod: billingData.paymentMethod || "",
    })
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>Manage your plan and payment method.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Current Plan</h3>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div>

              {isLoadingData ? (
                <>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </>
              ) : (
                <>
                  <p className="font-medium">{billingData?.currentPlan} Plan</p>
                  {billingData?.nextBillingDate && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Next billing date: {billingData.nextBillingDate}
                    </p>
                  )}
                </>
              )}
            </div>
            {isLoadingData ? (
              <Skeleton className="h-8 w-28 rounded-md" />
            ) : (
              <Button variant="outline" onClick={() => router.push("/dashboard/plan")}>Upgrade Plan</Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Payment Method</h3>
          {isLoadingData ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 rounded-full mr-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ) : billingData?.paymentMethod ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-slate-500" />
                <p>{billingData.paymentMethod}</p>
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
          {isLoadingData ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <Skeleton className="h-4 w-56 mx-auto" />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
              <p className="text-slate-500 dark:text-slate-400">No billing history available</p>
            </div>
          )}
        </div>
      </CardContent>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 rounded-b-lg">
        <Button onClick={handleSaveBilling} disabled={loadingBilling}>
          {loadingBilling ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          Save Billing Info
        </Button>
      </div>
    </Card>
  )
}