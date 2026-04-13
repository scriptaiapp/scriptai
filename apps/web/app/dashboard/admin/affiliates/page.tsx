"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"
import {
  useAdminAffiliateRequests,
  useAdminLsAffiliates,
  adminApi,
} from "@/hooks/useAdmin"
import {
  ChevronLeft,
  ChevronRight,
  Link2,
  Users,
  ExternalLink,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Zap,
  DollarSign,
  Edit,
  RotateCcw,
} from "lucide-react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Textarea } from "@repo/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { toast } from "sonner"
import type { AffiliateLink, AffiliateRequest, AffiliateSale, PaginatedResponse } from "@repo/validation"

function LinksTab() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<AffiliateLink & { profiles?: { full_name: string; email: string } }> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [reps, setReps] = useState<Array<{ user_id: string; full_name: string; email: string }>>([])
  const [form, setForm] = useState({ sales_rep_id: "", code: "", label: "", commission_rate: "10", ls_affiliate_id: "" })
  const [editLink, setEditLink] = useState<(AffiliateLink & { profiles?: { full_name: string; email: string } }) | null>(null)
  const [editForm, setEditForm] = useState({ label: "", commission_rate: "", is_active: true, ls_affiliate_id: "" })
  const [saving, setSaving] = useState(false)

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

  const loadReps = async () => {
    try {
      const res = await api.get<PaginatedResponse<{ user_id: string; full_name: string; email: string }>>(
        '/api/v1/admin/sales-reps?limit=100',
        { requireAuth: true }
      )
      setReps(res.data || [])
    } catch {
      console.error("Failed to load reps")
    }
  }

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.sales_rep_id) { toast.error("Select a sales rep"); return }
    try {
      setCreating(true)
      await adminApi.createAffiliateLinkForRep({
        sales_rep_id: form.sales_rep_id,
        code: form.code || generateCode(),
        label: form.label || undefined,
        commission_rate: Number(form.commission_rate) || 10,
        ls_affiliate_id: form.ls_affiliate_id || undefined,
      })
      toast.success("Affiliate link created and assigned to sales rep")
      setShowCreate(false)
      setForm({ sales_rep_id: "", code: "", label: "", commission_rate: "10", ls_affiliate_id: "" })
      fetchLinks()
    } catch {
      toast.error("Failed to create link")
    } finally {
      setCreating(false)
    }
  }

  const copyLink = (code: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    navigator.clipboard.writeText(`${baseUrl}/?ref=${code}`)
    toast.success("Link copied to clipboard")
  }

  const openEdit = (link: AffiliateLink & { profiles?: { full_name: string; email: string } }) => {
    setEditLink(link)
    setEditForm({
      label: link.label || "",
      commission_rate: String(link.commission_rate),
      is_active: link.is_active,
      ls_affiliate_id: link.ls_affiliate_id || "",
    })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLink) return
    try {
      setSaving(true)
      await adminApi.updateAffiliateLink(editLink.id, {
        label: editForm.label || null,
        commission_rate: Number(editForm.commission_rate) || 10,
        is_active: editForm.is_active,
        ls_affiliate_id: editForm.ls_affiliate_id || null,
      })
      toast.success("Link updated")
      setEditLink(null)
      fetchLinks()
    } catch {
      toast.error("Failed to update link")
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil((data?.total || 0) / 20)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{data?.total ?? 0} total links</p>
        <Button
          onClick={() => { setForm({ sales_rep_id: "", code: generateCode(), label: "", commission_rate: "10", ls_affiliate_id: "" }); loadReps(); setShowCreate(true) }}
          className="bg-emerald-600 hover:bg-emerald-700"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Link for Rep
        </Button>
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
                <th className="px-4 py-3 font-medium">LS ID</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
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
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{link.ls_affiliate_id || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        link.is_active ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
                      }`}>
                        {link.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => copyLink(link.code)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200" title="Copy link">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => openEdit(link)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200" title="Edit">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create Affiliate Link for Sales Rep</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Sales Rep *</label>
              <Select value={form.sales_rep_id} onValueChange={(v: string) => setForm({ ...form, sales_rep_id: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Select a sales rep" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {reps.map((rep) => (
                    <SelectItem key={rep.user_id} value={rep.user_id}>
                      {rep.full_name || rep.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="bg-slate-800 border-slate-700 text-slate-200 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Label (optional)</label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g., YouTube Campaign"
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Commission Rate (%)</label>
              <Input
                type="number"
                value={form.commission_rate}
                onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-200"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Lemon Squeezy Affiliate ID (optional)</label>
              <Input
                value={form.ls_affiliate_id}
                onChange={(e) => setForm({ ...form, ls_affiliate_id: e.target.value })}
                placeholder="LS affiliate ID to link"
                className="bg-slate-800 border-slate-700 text-slate-200 font-mono"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                {creating ? "Creating..." : "Create & Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editLink} onOpenChange={() => setEditLink(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit Affiliate Link — <span className="font-mono text-purple-400">{editLink?.code}</span></DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Label</label>
              <Input value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} placeholder="Campaign label" className="bg-slate-800 border-slate-700 text-slate-200" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Commission Rate (%)</label>
              <Input type="number" value={editForm.commission_rate} onChange={(e) => setEditForm({ ...editForm, commission_rate: e.target.value })} className="bg-slate-800 border-slate-700 text-slate-200" min="0" max="100" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">LS Affiliate ID</label>
              <Input value={editForm.ls_affiliate_id} onChange={(e) => setEditForm({ ...editForm, ls_affiliate_id: e.target.value })} className="bg-slate-800 border-slate-700 text-slate-200 font-mono" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${editForm.is_active ? "bg-green-600" : "bg-slate-700"}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${editForm.is_active ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <span className="text-sm text-slate-300">{editForm.is_active ? "Active" : "Inactive"}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditLink(null)} className="border-slate-700 text-slate-300">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RequestsTab() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const { data, total, loading, refresh } = useAdminAffiliateRequests(page, statusFilter)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<"approved" | "denied">("approved")
  const [adminNotes, setAdminNotes] = useState("")

  const handleReview = async () => {
    if (!reviewingId) return
    try {
      await adminApi.reviewAffiliateRequest(reviewingId, reviewAction, adminNotes || undefined)
      toast.success(`Request ${reviewAction}`)
      setReviewingId(null)
      setAdminNotes("")
      refresh()
    } catch {
      toast.error("Failed to review request")
    }
  }

  const totalPages = Math.ceil((total || 0) / 20)

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": return "bg-green-900/40 text-green-400"
      case "denied": return "bg-red-900/40 text-red-400"
      default: return "bg-yellow-900/40 text-yellow-400"
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-400" />
      case "denied": return <XCircle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter || "all"} onValueChange={(v: string) => { setStatusFilter(v === "all" ? undefined : v); setPage(1) }}>
          <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-slate-300 text-xs h-8">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500">{total ?? 0} requests</p>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Website</th>
                <th className="px-4 py-3 font-medium">Promotion</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !data?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No affiliate requests yet
                  </td>
                </tr>
              ) : (
                data.map((req: AffiliateRequest) => (
                  <tr key={req.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3 text-slate-200">{req.full_name}</td>
                    <td className="px-4 py-3 text-slate-400">{req.email}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{req.website || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[150px] truncate">{req.promotion_method || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(req.status)}`}>
                        <StatusIcon status={req.status} />
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {req.status !== "approved" && (
                          <button
                            onClick={() => { setReviewingId(req.id); setReviewAction("approved"); setAdminNotes("") }}
                            className="p-1.5 rounded hover:bg-green-900/30 text-slate-400 hover:text-green-400"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {req.status !== "denied" && (
                          <button
                            onClick={() => { setReviewingId(req.id); setReviewAction("denied"); setAdminNotes("") }}
                            className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400"
                            title="Deny"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {req.status !== "pending" && (
                          <button
                            onClick={() => { setReviewingId(req.id); setReviewAction("pending" as "approved"); setAdminNotes("") }}
                            className="p-1.5 rounded hover:bg-yellow-900/30 text-slate-400 hover:text-yellow-400"
                            title="Revert to Pending"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-slate-700 text-slate-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-400 px-2">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-slate-700 text-slate-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!reviewingId} onOpenChange={() => setReviewingId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approved" ? "Approve" : "Deny"} Affiliate Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-400">
              {reviewAction === "approved"
                ? "The applicant will be notified they've been approved. You can include the Lemon Squeezy affiliate signup link in your notes."
                : "The applicant will be notified their request was denied."}
            </p>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Notes to applicant (optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={reviewAction === "approved"
                  ? "Welcome! Here's your affiliate signup link..."
                  : "Unfortunately, we cannot approve your request at this time..."}
                className="bg-slate-800 border-slate-700 text-slate-200"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingId(null)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button
              onClick={handleReview}
              className={reviewAction === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {reviewAction === "approved" ? "Approve" : "Deny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SalesTab() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse<AffiliateSale & { profiles?: { full_name: string; email: string } }> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<PaginatedResponse<AffiliateSale & { profiles?: { full_name: string; email: string } }>>(
        `/api/v1/admin/affiliates/sales?page=${page}`,
        { requireAuth: true }
      )
      setData(res)
    } catch {
      console.error("Failed to fetch sales")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchSales() }, [fetchSales])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminApi.updateSaleStatus(id, status)
      toast.success(`Sale marked as ${status}`)
      fetchSales()
    } catch {
      toast.error("Failed to update sale status")
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "bg-green-900/40 text-green-400"
      case "paid": return "bg-blue-900/40 text-blue-400"
      case "refunded": return "bg-red-900/40 text-red-400"
      default: return "bg-yellow-900/40 text-yellow-400"
    }
  }

  const totalPages = Math.ceil((data?.total || 0) / 20)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">{data?.total ?? 0} total sales</p>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Sales Rep</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No affiliate sales recorded yet
                  </td>
                </tr>
              ) : (
                data.data.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded">
                        {sale.affiliate_links?.code || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{sale.profiles?.full_name || sale.profiles?.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{sale.customer_email || "—"}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">${Number(sale.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">${Number(sale.commission).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(sale.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Select value={sale.status} onValueChange={(v: string) => handleStatusChange(sale.id, v)}>
                        <SelectTrigger className="w-28 h-7 bg-slate-800 border-slate-700 text-slate-300 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-slate-700 text-slate-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-400 px-2">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-slate-700 text-slate-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function LsAffiliatesTab() {
  const { affiliates, loading, refresh } = useAdminLsAffiliates()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{affiliates.length} Lemon Squeezy affiliates</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} className="border-slate-700 text-slate-300">
            Sync from LS
          </Button>
          <a
            href="https://app.lemonsqueezy.com/affiliates"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              Open LS Dashboard
            </Button>
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">LS ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total Earnings</th>
                <th className="px-4 py-3 font-medium">Unpaid</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !affiliates.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No Lemon Squeezy affiliates found. Set up your affiliate program in the LS dashboard.
                  </td>
                </tr>
              ) : (
                affiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3 font-mono text-xs text-purple-400">{aff.id}</td>
                    <td className="px-4 py-3 text-slate-200">{aff.user_name}</td>
                    <td className="px-4 py-3 text-slate-400">{aff.user_email}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{aff.share_domain || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        aff.status === "active" ? "bg-green-900/40 text-green-400" :
                        aff.status === "pending" ? "bg-yellow-900/40 text-yellow-400" :
                        "bg-red-900/40 text-red-400"
                      }`}>
                        {aff.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      ${(aff.total_earnings / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-yellow-400">
                      ${(aff.unpaid_earnings / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(aff.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function AdminAffiliatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Affiliate Program</h1>
        <p className="text-slate-400 mt-1">Manage affiliate links, review requests, and sync with Lemon Squeezy</p>
      </div>

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="links" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
            <Link2 className="h-4 w-4 mr-1.5" />
            Links
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
            <Users className="h-4 w-4 mr-1.5" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="sales" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="lemon-squeezy" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
            <Zap className="h-4 w-4 mr-1.5" />
            Lemon Squeezy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="mt-4">
          <LinksTab />
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <SalesTab />
        </TabsContent>

        <TabsContent value="lemon-squeezy" className="mt-4">
          <LsAffiliatesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
