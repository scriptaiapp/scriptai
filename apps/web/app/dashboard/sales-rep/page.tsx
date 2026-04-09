"use client"

import { useSalesRepStats, useSalesRepLsTracking } from "@/hooks/useSalesRep"
import { Link2, Users, DollarSign, TrendingUp, Clock, Zap, Wallet } from "lucide-react"

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function SalesRepDashboardPage() {
  const { stats, loading } = useSalesRepStats()
  const { data: lsData, loading: lsLoading } = useSalesRepLsTracking()

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Your affiliate performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Affiliate Links" value={stats?.totalLinks ?? 0} icon={Link2} color="bg-purple-600" />
        <StatCard label="Confirmed Sales" value={stats?.confirmedSales ?? 0} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard label="Invited Users" value={stats?.totalInvited ?? 0} icon={Users} color="bg-blue-600" />
        <StatCard
          label="Total Commission"
          value={`$${(stats?.totalCommission ?? 0).toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          label="Pending Commission"
          value={`$${(stats?.pendingCommission ?? 0).toFixed(2)}`}
          icon={Clock}
          color="bg-yellow-600"
        />
        <StatCard
          label="Paid Out"
          value={`$${(stats?.paidCommission ?? 0).toFixed(2)}`}
          icon={Wallet}
          color="bg-cyan-600"
        />
      </div>

      {!lsLoading && lsData && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Lemon Squeezy Affiliate Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">LS Status</p>
              <p className={`text-lg font-bold mt-1 ${
                lsData.status === "active" ? "text-green-400" :
                lsData.status === "pending" ? "text-yellow-400" : "text-red-400"
              }`}>
                {lsData.status.charAt(0).toUpperCase() + lsData.status.slice(1)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Total LS Earnings</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">
                ${(lsData.total_earnings / 100).toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Unpaid Earnings</p>
              <p className="text-lg font-bold text-yellow-400 mt-1">
                ${(lsData.unpaid_earnings / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
