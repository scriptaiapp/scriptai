"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useSupabase } from "@/components/supabase-provider"
import ScriptGenerationForm, {
  type ScriptFormData,
} from "@/components/dashboard/scripts/ScriptGenerationForm"
import ScriptOutputPanel from "@/components/dashboard/scripts/ScriptOutputPanel"
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired"
import { useScripts } from "@/hooks/use-script"

const calculateDurationInSeconds = (duration: string, customDuration: string) => {
  switch (duration) {
    case '1min':
      return "60";
    case '3min':
      return "180";
    case '5min':
      return "300";
    case 'custom':

      if (!customDuration || !customDuration.includes(':')) {
        return 0;
      }
      const parts = customDuration.split(':');
      const minutes = parseInt(parts[0] ?? '0', 10) || 0;
      const seconds = parseInt(parts[1] ?? '0', 10) || 0;
      return ((minutes * 60) + seconds).toString();
    default:
      return 0;
  }
};

export default function NewScriptPage() {
  const router = useRouter()
  const { supabase, user, profile, profileLoading } = useSupabase()
  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("")
  const [scriptTitle, setScriptTitle] = useState("")
  const [scriptId, setScriptId] = useState<string | null>(null)
  const { fetchScripts } = useScripts()


  // Store the last submitted form data to allow for regeneration
  const [latestFormData, setLatestFormData] = useState<ScriptFormData | null>(
    null
  )

  const handleGenerateScript = async (formData: ScriptFormData) => {
    if (!formData.prompt) {
      toast.error("Prompt required", {
        description: "Please enter a prompt to generate a script.",
      })
      return
    }
    const duration = calculateDurationInSeconds(formData.duration, formData.customDuration || "")
    formData.duration = duration || "300"
    delete formData.customDuration
    formData.personalized = profile?.ai_trained

    console.log(formData)
    const multipartData = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (key === "files" && Array.isArray(value)) {
        for (const file of value) {
          multipartData.append("files", file, file.name);
        }
      } else if (typeof value === "boolean") {
        multipartData.append(key, String(value));
      } else if (value !== undefined && value !== null) {
        multipartData.append(key, value as string);
      }
    }

    setLoadingGenerate(true)
    setGeneratedScript("") // Clear previous script
    setLatestFormData(formData) // Save for regeneration

    try {

      const response = await fetch("/api/generate-script", {
        method: "POST",
        body: multipartData,
        // headers: { "Content-Type": "multipart/form-data" },
        // body: JSON.stringify({
        //   ...formData, // Pass all form data to the API
        //   personalized: profile?.ai_trained,
        // }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate script")
      }

      const data = await response.json()

      setGeneratedScript(data.script)
      setScriptTitle(data.title)
      setScriptId(data.id)

      toast.success("Script generated!", {
        description: "Your script is ready for review.",
      })
    } catch (error: any) {
      toast.error("Error generating script", { description: error.message })
    } finally {
      setLoadingGenerate(false)
    }
  }

  const handleRegenerateScript = () => {
    if (latestFormData) {
      handleGenerateScript(latestFormData)
    } else {
      toast.error("No data to regenerate", {
        description: "Please generate a script first.",
      })
    }
  }

  const handleSaveScript = async () => {
    if (!generatedScript || !scriptTitle || !scriptId) {
      toast.error("Missing information", {
        description:
          "Please generate a script and provide a title before saving.",
      })
      return
    }

    setLoadingSave(true)

    try {
      const { error } = await supabase
        .from("scripts")
        .update({
          title: scriptTitle,
          content: generatedScript,
          updated_at: new Date().toISOString(),
        })
        .eq("id", scriptId)
        .eq("user_id", user?.id)

      if (error) throw error
      await fetchScripts() // Refresh the scripts list after saving

      toast.success("Script updated!", {
        description: "Your script changes have been saved successfully.",
      })

      router.push(`/dashboard/scripts`)
    } catch (error: any) {
      toast.error("Error saving script", { description: error.message })
    } finally {
      setLoadingSave(false)
    }
  }

  if (!profile?.ai_trained || !profile?.youtube_connected && !profileLoading) {
    return (
      <AITrainingRequired />
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Script</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Generate your script step-by-step
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8  items-start">
        {/* The form component manages its own internal state and calls `onGenerate` when ready. */}
        <ScriptGenerationForm
          loading={loadingGenerate}
          onGenerate={handleGenerateScript}
        />

        {/* The output panel displays the results and calls back to the page for actions. */}
        <ScriptOutputPanel
          loading={loadingSave}
          loadingGenerate={loadingGenerate}
          generatedScript={generatedScript}
          setGeneratedScript={setGeneratedScript}
          scriptTitle={scriptTitle}
          setScriptTitle={setScriptTitle}
          onSave={handleSaveScript}
          onRegenerate={handleRegenerateScript}
        />
      </div>
    </div>
  )
}