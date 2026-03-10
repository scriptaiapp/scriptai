import { api } from "@/lib/api-client"
import { toast } from "sonner"
import type { StoryBuilderJob } from "@/hooks/useStoryBuilder"

export type { StoryBuilderJob }

export async function getStoryBuilderJobs(): Promise<StoryBuilderJob[]> {
  try {
    return await api.get<StoryBuilderJob[]>("/api/v1/story-builder", { requireAuth: true })
  } catch {
    toast.error("Failed to load story blueprints")
    return []
  }
}

export async function getStoryBuilderJob(id: string): Promise<StoryBuilderJob | null> {
  try {
    return await api.get<StoryBuilderJob>(`/api/v1/story-builder/${id}`, { requireAuth: true })
  } catch {
    toast.error("Failed to load story blueprint")
    return null
  }
}

export async function deleteStoryBuilderJob(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/story-builder/${id}`, { requireAuth: true })
    return true
  } catch {
    return false
  }
}
