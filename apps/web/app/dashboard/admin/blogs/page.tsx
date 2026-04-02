"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminBlogs, adminApi } from "@/hooks/useAdmin"
import { Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
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
  DialogFooter,
} from "@repo/ui/dialog"
import { toast } from "sonner"
import type { BlogPost } from "@repo/validation"

export default function AdminBlogsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const { data, total, loading, refresh } = useAdminBlogs(page, statusFilter)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const totalPages = Math.ceil((total || 0) / 20)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminApi.deleteBlog(deleteId)
      toast.success("Blog deleted")
      setDeleteId(null)
      refresh()
    } catch {
      toast.error("Failed to delete blog")
    }
  }

  const togglePublish = async (blog: BlogPost) => {
    try {
      const newStatus = blog.status === "published" ? "draft" : "published"
      await adminApi.updateBlog(blog.id, { status: newStatus })
      toast.success(newStatus === "published" ? "Blog published" : "Blog unpublished")
      refresh()
    } catch {
      toast.error("Failed to update blog status")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Blog Posts</h1>
          <p className="text-slate-400 mt-1">Manage blog content</p>
        </div>
        <Button onClick={() => router.push("/dashboard/admin/blogs/new")} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-slate-300">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3"><div className="h-5 bg-slate-800 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No blog posts found</td>
                </tr>
              ) : (
                data?.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-3 text-slate-200 max-w-xs truncate">{blog.title}</td>
                    <td className="px-4 py-3 text-slate-400">{blog.category}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(blog)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          blog.status === "published"
                            ? "bg-green-900/40 text-green-400"
                            : blog.status === "draft"
                            ? "bg-yellow-900/40 text-yellow-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {blog.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{blog.featured ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/admin/blogs/${blog.id}`)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(blog.id)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400"
                        >
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
          <p className="text-sm text-slate-500">{total} posts</p>
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader><DialogTitle>Delete Blog Post</DialogTitle></DialogHeader>
          <p className="text-slate-400">Are you sure? This will permanently delete this blog post.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
