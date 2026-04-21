"use client"

import { useState } from "react"
import { useAdminSalesReps, adminApi } from "@/hooks/useAdmin"
import { Plus, Trash2, ChevronLeft, ChevronRight, Copy, Check, Eye, EyeOff } from "lucide-react"
import { AdminButton } from "@/components/admin/admin-button"
import { Input } from "@repo/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@repo/ui/dialog"
import { toast } from "sonner"

function generatePassword(length = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const symbols = "!@#$%&*"
  const all = upper + lower + digits + symbols
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]
  const rest = Array.from({ length: length - 4 }, () => all[Math.floor(Math.random() * all.length)])
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("")
}

export default function AdminSalesRepsPage() {
  const [page, setPage] = useState(1)
  const { data, total, loading, refresh } = useAdminSalesReps(page)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ email: "", name: "", password: "" })
  const [creating, setCreating] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string; name: string } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const totalPages = Math.ceil((total || 0) / 20)

  const openCreateDialog = () => {
    const pw = generatePassword()
    setCreateForm({ email: "", name: "", password: pw })
    setShowPassword(false)
    setShowCreate(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.email || !createForm.name || !createForm.password) return
    try {
      setCreating(true)
      await adminApi.createSalesRep(createForm)
      setShowCreate(false)
      setCreatedCreds({ email: createForm.email, password: createForm.password, name: createForm.name })
      setCreateForm({ email: "", name: "", password: "" })
      refresh()
    } catch {
      toast.error("Failed to create Sales Rep")
    } finally {
      setCreating(false)
    }
  }

  const handleRemove = async () => {
    if (!removeConfirm) return
    try {
      await adminApi.removeSalesRep(removeConfirm)
      toast.success("Sales Rep role removed")
      setRemoveConfirm(null)
      refresh()
    } catch {
      toast.error("Failed to remove Sales Rep")
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAllCreds = () => {
    if (!createdCreds) return
    const text = `Sales Rep Login Credentials\n\nName: ${createdCreds.name}\nEmail: ${createdCreds.email}\nPassword: ${createdCreds.password}\n\nLogin URL: ${window.location.origin}/login`
    navigator.clipboard.writeText(text)
    setCopiedField("all")
    toast.success("All credentials copied")
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Sales Reps</h1>
          <p className="text-slate-400 mt-1">Manage sales representative accounts</p>
        </div>
        <AdminButton onClick={openCreateDialog} variant="primary">
          <Plus className="h-4 w-4" />
          Add Sales Rep
        </AdminButton>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-3">
                      <div className="h-5 bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sales reps found</td>
                </tr>
              ) : (
                data?.map((rep: Record<string, unknown>) => (
                  <tr key={rep.user_id as string} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3 text-slate-200">{(rep.full_name || rep.name || "—") as string}</td>
                    <td className="px-4 py-3 text-slate-400">{rep.email as string}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(rep.created_at as string).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setRemoveConfirm(rep.user_id as string)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400"
                        title="Remove Sales Rep role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
          <p className="text-sm text-slate-500">{total} total</p>
          <div className="flex gap-2">
            <AdminButton variant="secondary" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </AdminButton>
            <span className="flex items-center text-sm text-slate-400 px-2">{page} / {totalPages}</span>
            <AdminButton variant="secondary" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </AdminButton>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create Sales Rep</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter their details. A secure password has been auto-generated. You'll get the full credentials to share after creation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Name</label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="John Doe"
                className="bg-slate-800 border-slate-700 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email</label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="john@example.com"
                className="bg-slate-800 border-slate-700 text-slate-200"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-200 pr-10 font-mono"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <AdminButton type="button" variant="tertiary" onClick={() => setShowCreate(false)}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" variant="primary" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </AdminButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog - shown after successful creation */}
      <Dialog open={!!createdCreds} onOpenChange={() => setCreatedCreds(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              Sales Rep Created
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Share these login credentials with the sales rep. The password will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="rounded-lg bg-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm text-slate-200 mt-0.5">{createdCreds?.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-slate-200 mt-0.5 font-mono">{createdCreds?.email}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCreds?.email || "", "email")}
                  className="ml-2 p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 shrink-0"
                >
                  {copiedField === "email" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Password</p>
                  <p className="text-sm text-slate-200 mt-0.5 font-mono break-all">{createdCreds?.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCreds?.password || "", "password")}
                  className="ml-2 p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 shrink-0"
                >
                  {copiedField === "password" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Login URL</p>
                <p className="text-sm text-purple-400 mt-0.5 font-mono">{typeof window !== "undefined" ? window.location.origin : ""}/login</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <AdminButton onClick={copyAllCreds} variant="secondary" className="flex-1">
              {copiedField === "all" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              Copy All
            </AdminButton>
            <AdminButton onClick={() => setCreatedCreds(null)} variant="primary" className="flex-1">
              Done
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <Dialog open={!!removeConfirm} onOpenChange={() => setRemoveConfirm(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Remove Sales Rep Role</DialogTitle>
          </DialogHeader>
          <p className="text-slate-400">This will demote the user to a regular user role. They will lose access to the Sales Rep dashboard.</p>
          <DialogFooter>
            <AdminButton variant="tertiary" onClick={() => setRemoveConfirm(null)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" tone="danger" onClick={handleRemove}>
              Remove Role
            </AdminButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
