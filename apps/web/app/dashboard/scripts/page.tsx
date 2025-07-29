"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Plus, Search, FileText, Trash2, ExternalLink } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Script {
  id: string
  title: string
  created_at: string
  tone: string
  language: string
}

export default function Scripts() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [scriptToDelete, setScriptToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchScripts = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("scripts")
          .select("id, title, created_at, tone, language")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setScripts(data || [])
      } catch (error: any) {
        toast({
          title: "Error fetching scripts",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchScripts()
  }, [supabase, user, toast])

  const handleDeleteScript = async () => {
    if (!scriptToDelete) return

    try {
      const { error } = await supabase.from("scripts").delete().eq("id", scriptToDelete)

      if (error) throw error

      setScripts(scripts.filter((script) => script.id !== scriptToDelete))

      toast({
        title: "Script deleted",
        description: "Your script has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting script",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setScriptToDelete(null)
    }
  }

  const filteredScripts = scripts.filter((script) => script.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Scripts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage all your generated scripts</p>
        </div>
        <Link href="/dashboard/scripts/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Script
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder="Search scripts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent"></div>
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredScripts.map((script) => (
            <Card key={script.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800/30 p-2 rounded-md">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{script.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                          {new Date(script.created_at).toLocaleDateString()}
                        </span>
                        {script.tone && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                            {script.tone.charAt(0).toUpperCase() + script.tone.slice(1)}
                          </span>
                        )}
                        {script.language && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                            {script.language.charAt(0).toUpperCase() + script.language.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Link href={`/dashboard/scripts/${script.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setScriptToDelete(script.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your script.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setScriptToDelete(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteScript}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-semibold mb-2">No scripts found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No scripts matching "${searchQuery}". Try a different search term.`
                : "You haven't created any scripts yet. Create your first script to get started."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/scripts/new">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Script
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
