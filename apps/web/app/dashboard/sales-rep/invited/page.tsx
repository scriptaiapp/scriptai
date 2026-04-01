"use client"

import { useState } from "react"
import { useSalesRepInvited, useSalesRepLinks, salesRepApi } from "@/hooks/useSalesRep"
import { Plus, Trash2, ChevronLeft, ChevronRight, UserPlus, Mail } from "lucide-react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
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
  DialogFooter,
} from "@repo/ui/dialog"
import { toast } from "sonner"

export default function SalesRepInvitedPage() {
  const [page, setPage] = useState(1)
  const { data, total, loading, refresh } = useSalesRepInvited(page)
  const { links } = useSalesRepLinks()

  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLinkId, setInviteLinkId] = useState("")
  const [inviting, setInviting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const totalPages = Math.ceil((total || 0) / 20)

  const statusColor = (s: string) => {
    switch (s) {
      case "registered": return "bg-green-900/40 text-green-400"
      case "subscribed": return "bg-blue-900/40 text-blue-400"
      case "expired": return "bg-red-900/40 text-red-400"
      default: return "bg-yellow-900/40 text-yellow-400"
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    try {
      setInviting(true)
      await salesRepApi.inviteUser(inviteEmail, inviteLinkId || undefined)
      toast.success("User invited")
      setShowInvite(false)
      setInviteEmail("")
      setInviteLinkId("")
      refresh()
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to invite user")
    } finally {
      setInviting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await salesRepApi.deleteInvitation(deleteId)
      toast.success("Invitation removed")
      setDeleteId(null)
      refresh()
    } catch {
      toast.error("Failed to remove invitation")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Invited Users</h1>
          <p className="text-slate-400 mt-1">Track users you've invited to the platform</p>
        </div>
        <Button onClick={() => setShowInvite(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Affiliate Link</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Invited</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td></tr>
                ))
              ) : !data?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No invitations sent yet
                  </td>
                </tr>
              ) : (
                data.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3 text-slate-200">{inv.email}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {inv.affiliate_links ? (
                        <span className="font-mono text-xs text-emerald-400">{inv.affiliate_links.code}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {inv.status === "pending" && (
                        <button
                          onClick={() => setDeleteId(inv.id)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
          <p className="text-sm text-slate-500">{total} invitations</p>
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

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email Address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-slate-800 border-slate-700 text-slate-200"
                required
              />
            </div>
            {links.length > 0 && (
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Affiliate Link (optional)</label>
                <Select value={inviteLinkId} onValueChange={setInviteLinkId}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-300">
                    <SelectValue placeholder="Select a link" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">None</SelectItem>
                    {links.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.code} {l.label ? `(${l.label})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={inviting} className="bg-emerald-600 hover:bg-emerald-700">
                {inviting ? "Inviting..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle>Remove Invitation</DialogTitle></DialogHeader>
          <p className="text-slate-400">Remove this pending invitation?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
