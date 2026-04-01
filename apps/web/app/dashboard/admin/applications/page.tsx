"use client"

import { useState } from "react"
import { useAdminApplications, adminApi } from "@/hooks/useAdmin"
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  ExternalLink,
  Trash2,
  Download,
} from "lucide-react"
import { Button } from "@repo/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import { Textarea } from "@repo/ui/textarea"
import { Label } from "@repo/ui/label"
import { toast } from "sonner"
import type { JobApplication } from "@repo/validation"

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
]

const statusColor = (s: string) => {
  switch (s) {
    case "pending": return "bg-yellow-900/40 text-yellow-400"
    case "reviewing": return "bg-blue-900/40 text-blue-400"
    case "shortlisted": return "bg-green-900/40 text-green-400"
    case "rejected": return "bg-red-900/40 text-red-400"
    case "hired": return "bg-emerald-900/40 text-emerald-400"
    default: return "bg-slate-800 text-slate-400"
  }
}

export default function AdminApplicationsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const { data, total, loading, refresh } = useAdminApplications(page, statusFilter)
  const [viewApp, setViewApp] = useState<JobApplication | null>(null)
  const [updateStatus, setUpdateStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  const totalPages = Math.ceil((total || 0) / 20)

  const handleView = (app: JobApplication) => {
    setViewApp(app)
    setUpdateStatus(app.status)
    setNotes(app.notes || "")
  }

  const handleStatusUpdate = async () => {
    if (!viewApp || updating) return
    setUpdating(true)
    try {
      await adminApi.updateApplicationStatus(viewApp.id, updateStatus, notes)
      toast.success("Application updated")
      setViewApp(null)
      refresh()
    } catch {
      toast.error("Failed to update application")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application permanently?")) return
    try {
      await adminApi.deleteApplication(id)
      toast.success("Application deleted")
      if (viewApp?.id === id) setViewApp(null)
      refresh()
    } catch {
      toast.error("Failed to delete application")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Job Applications</h1>
        <p className="text-slate-400 mt-1">Review and manage candidate applications</p>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}>
          <SelectTrigger className="w-44 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium w-8"></th>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Experience</th>
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
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No applications found</td></tr>
              ) : (
                data.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/30 cursor-pointer" onClick={() => handleView(app)}>
                    <td className="px-4 py-3"><FileText className="h-4 w-4 text-purple-400" /></td>
                    <td className="px-4 py-3">
                      <div className="text-slate-100 font-medium">{app.full_name}</div>
                      <div className="text-xs text-slate-500">{app.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{app.position}</td>
                    <td className="px-4 py-3 text-slate-400">{app.experience}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(app.status)}`}>{app.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => handleView(app)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-purple-400" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(app.id)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400" title="Delete">
                          <Trash2 className="h-4 w-4" />
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
          <p className="text-sm text-slate-500">{total} applications</p>
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

      {/* View Application Dialog */}
      <Dialog open={!!viewApp} onOpenChange={() => setViewApp(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application: {viewApp?.position}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Name:</span>{" "}
                <span className="text-slate-200">{viewApp?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>{" "}
                <a href={`mailto:${viewApp?.email}`} className="text-purple-400 hover:underline">{viewApp?.email}</a>
              </div>
              {viewApp?.phone && (
                <div>
                  <span className="text-slate-500">Phone:</span>{" "}
                  <span className="text-slate-300">{viewApp.phone}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Experience:</span>{" "}
                <span className="text-slate-300">{viewApp?.experience}</span>
              </div>
              <div>
                <span className="text-slate-500">Applied:</span>{" "}
                <span className="text-slate-300">{viewApp && new Date(viewApp.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              <a href={viewApp?.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
                <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
              </a>
              {viewApp?.github_url && (
                <a href={viewApp.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
                  <ExternalLink className="h-3.5 w-3.5" /> GitHub
                </a>
              )}
              {viewApp?.portfolio_url && (
                <a href={viewApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300">
                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio
                </a>
              )}
            </div>

            {/* Files */}
            {(viewApp?.resume_file_path || viewApp?.cover_letter_file_path) && (
              <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-4">
                {viewApp.resume_file_path && (
                  <a href={viewApp.resume_file_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-800 text-green-400 hover:bg-slate-700">
                    <Download className="h-3.5 w-3.5" /> Resume PDF
                  </a>
                )}
                {viewApp.cover_letter_file_path && (
                  <a href={viewApp.cover_letter_file_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-slate-700">
                    <Download className="h-3.5 w-3.5" /> Cover Letter PDF
                  </a>
                )}
              </div>
            )}

            {/* Problem Solving */}
            {viewApp?.problem_solving && (
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Real-world problem & how they tackled it</h3>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{viewApp.problem_solving}</p>
              </div>
            )}

            {/* Status update */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-400">Update Status</h3>
              <div className="flex gap-3">
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger className="w-44 bg-slate-800 border-slate-700 text-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {STATUS_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-400">Internal Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add notes about this candidate..." className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleStatusUpdate} disabled={updating} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {updating ? "Updating..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => viewApp && handleDelete(viewApp.id)} className="border-red-800 text-red-400 hover:bg-red-900/30">
                  Delete Application
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
