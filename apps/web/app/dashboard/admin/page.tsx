"use client"

import { useAdminStats } from "@/hooks/useAdmin"
import {
  Users,
  UserCog,
  CreditCard,
  FileText,
  DollarSign,
  Mail,
  TrendingUp,
  UserPlus,
} from "lucide-react"

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

export default function AdminDashboardPage() {
  const { stats, loading } = useAdminStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
        <p className="text-slate-400 mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="bg-blue-600" />
        <StatCard label="Sales Reps" value={stats?.totalSalesReps ?? 0} icon={UserCog} color="bg-purple-600" />
        <StatCard label="New Users (30d)" value={stats?.newUsers30d ?? 0} icon={UserPlus} color="bg-green-600" />
        <StatCard label="Active Subscriptions" value={stats?.activeSubscriptions ?? 0} icon={CreditCard} color="bg-cyan-600" />
        <StatCard label="Published Blogs" value={stats?.publishedBlogs ?? 0} icon={FileText} color="bg-orange-600" />
        <StatCard label="Total Sales" value={stats?.totalSales ?? 0} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-yellow-600"
        />
        <StatCard label="Unread Mails" value={stats?.unreadMails ?? 0} icon={Mail} color="bg-red-600" />
      </div>
    </div>
  )
}
