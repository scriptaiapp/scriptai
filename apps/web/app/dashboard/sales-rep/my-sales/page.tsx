"use client"

import { useState } from "react"
import { useSalesRepSales } from "@/hooks/useSalesRep"
import { ChevronLeft, ChevronRight, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SalesRepSalesPage() {
  const [page, setPage] = useState(1)
  const { data, total, loading } = useSalesRepSales(page)

  const totalPages = Math.ceil((total || 0) / 20)

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "bg-green-900/40 text-green-400"
      case "paid": return "bg-blue-900/40 text-blue-400"
      case "refunded": return "bg-red-900/40 text-red-400"
      default: return "bg-yellow-900/40 text-yellow-400"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Sales</h1>
        <p className="text-slate-400 mt-1">Track your affiliate sales and commissions</p>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Affiliate Code</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Sale Amount</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !data?.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No sales yet. Share your affiliate links to start earning!
                  </td>
                </tr>
              ) : (
                data.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">
                        {sale.affiliate_links?.code || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{sale.customer_email || "—"}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">${Number(sale.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">${Number(sale.commission).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{total} sales</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-slate-700 text-slate-300">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center text-sm text-slate-400 px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-slate-700 text-slate-300">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
