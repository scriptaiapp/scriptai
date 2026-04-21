"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { adminApi } from "@/hooks/useAdmin"
import { ArrowLeft, Save } from "lucide-react"
import { AdminButton } from "@/components/admin/admin-button"
import { Input } from "@repo/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select"
import { toast } from "sonner"
import type { BlogPost } from "@repo/validation"

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "general",
    status: "draft" as string,
    featured: false,
    cover_image_url: "",
    tags: "",
  })

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blog = await adminApi.getBlog(id)
        setForm({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt || "",
          content: blog.content,
          category: blog.category,
          status: blog.status,
          featured: blog.featured,
          cover_image_url: blog.cover_image_url || "",
          tags: blog.tags?.join(", ") || "",
        })
      } catch {
        toast.error("Failed to load blog post")
        router.push("/dashboard/admin/blogs")
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await adminApi.updateBlog(id, {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      } as Partial<BlogPost>)
      toast.success("Blog post updated")
      router.push("/dashboard/admin/blogs")
    } catch {
      toast.error("Failed to update blog post")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-96 bg-slate-800 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Edit Blog Post</h1>
          <p className="text-slate-400 mt-1">Update blog content</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-200"
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-200"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Excerpt</label>
          <Input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="bg-slate-900 border-slate-700 text-slate-200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={16}
            className="w-full rounded-md bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Category</label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-200"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Status</label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Tags</label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="ai, youtube, tips"
              className="bg-slate-900 border-slate-700 text-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Cover Image URL</label>
            <Input
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              className="bg-slate-900 border-slate-700 text-slate-200"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900"
              />
              <span className="text-sm text-slate-300">Featured post</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <AdminButton type="button" variant="tertiary" onClick={() => router.back()}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" variant="primary" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Update Post"}
          </AdminButton>
        </div>
      </form>
    </div>
  )
}
