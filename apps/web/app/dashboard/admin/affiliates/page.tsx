"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import { ChevronLeft, ChevronRight, Link2, ExternalLink } from "lucide-react"
import { Button } from "@repo/ui/button"
import type { AffiliateLink, PaginatedResponse } from "@repo/validation"

export default function AdminAffiliatesPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<AffiliateLink & { profiles?: { full_name: string; email: string } }> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<PaginatedResponse<AffiliateLink & { profiles?: { full_name: string; email: string } }>>(
        `/api/v1/admin/affiliates/links?page=${page}`,
        { requireAuth: true }
      )
      setData(res)
    } catch {
      console.error("Failed to fetch affiliate links")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  const totalPages = Math.ceil((data?.total || 0) / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Affiliate Links</h1>
        <p className="text-slate-400 mt-1">Overview of all affiliate links across sales reps</p>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Sales Rep</th>
                <th className="px-4 py-3 font-medium">Commission %</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <Link2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No affiliate links created yet
                  </td>
                </tr>
              ) : (
                data.data.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded">
                        {link.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{link.label || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {link.profiles?.full_name || link.profiles?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{link.commission_rate}%</td>
                    <td className="px-4 py-3 text-slate-300">{link.click_count}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        link.is_active ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
                      }`}>
                        {link.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(link.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{data?.total} links</p>
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
