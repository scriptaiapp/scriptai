"use client"

import { useState } from "react"
import { useSalesRepLinks, salesRepApi } from "@/hooks/useSalesRep"
import { Plus, Trash2, Edit, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function SalesRepLinksPage() {
  const { links, loading, refresh } = useSalesRepLinks()
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ code: "", label: "", commission_rate: "10" })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      await salesRepApi.createLink({
        code: form.code || generateCode(),
        label: form.label || undefined,
        commission_rate: Number(form.commission_rate) || 10,
      })
      toast.success("Affiliate link created")
      setShowCreate(false)
      setForm({ code: "", label: "", commission_rate: "10" })
      refresh()
    } catch {
      toast.error("Failed to create link")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await salesRepApi.deleteLink(deleteId)
      toast.success("Link deleted")
      setDeleteId(null)
      refresh()
    } catch {
      toast.error("Failed to delete link")
    }
  }

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${baseUrl}/?ref=${code}`)
    toast.success("Link copied to clipboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Affiliate Links</h1>
          <p className="text-slate-400 mt-1">Create and manage your affiliate links</p>
        </div>
        <Button onClick={() => { setForm({ code: generateCode(), label: "", commission_rate: "10" }); setShowCreate(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          New Link
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-slate-800 bg-slate-900">
          <ExternalLink className="h-12 w-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 mb-4">No affiliate links yet</p>
          <Button onClick={() => { setForm({ code: generateCode(), label: "", commission_rate: "10" }); setShowCreate(true); }} className="bg-emerald-600 hover:bg-emerald-700">
            Create your first link
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">
                    {link.code}
                  </span>
                  {link.label && <span className="text-sm text-slate-300">{link.label}</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    link.is_active ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
                  }`}>
                    {link.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{link.commission_rate}% commission</span>
                  <span>{link.click_count} clicks</span>
                  <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => copyLink(link.code)}
                  className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(link.id)}
                  className="p-2 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create Affiliate Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="bg-slate-800 border-slate-700 text-slate-200 font-mono"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Users will visit: {baseUrl}/?ref={form.code || "CODE"}</p>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                {creating ? "Creating..." : "Create Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle>Delete Affiliate Link</DialogTitle></DialogHeader>
          <p className="text-slate-400">This will permanently delete this affiliate link and its tracking data.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
