import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { DubbedResult, DubbingProgress } from "@repo/validation"

export const supportedLanguages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
  { value: "pl", label: "Polish" },
  { value: "ru", label: "Russian" },
  { value: "nl", label: "Dutch" },
  { value: "tr", label: "Turkish" },
  { value: "sv", label: "Swedish" },
  { value: "id", label: "Indonesian" },
  { value: "fil", label: "Filipino" },
  { value: "uk", label: "Ukrainian" },
  { value: "el", label: "Greek" },
  { value: "cs", label: "Czech" },
  { value: "fi", label: "Finnish" },
  { value: "ro", label: "Romanian" },
  { value: "da", label: "Danish" },
  { value: "bg", label: "Bulgarian" },
  { value: "ms", label: "Malay" },
  { value: "sk", label: "Slovak" },
  { value: "hr", label: "Croatian" },
  { value: "ar", label: "Arabic" },
  { value: "ta", label: "Tamil" },
] as const;

export function useDubbing() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [dubbedResult, setDubbedResult] = useState<DubbedResult | null>(null);
  const [progress, setProgress] = useState<DubbingProgress>({
    state: "idle",
    progress: 0,
    message: "",
  });

  const updateProgress = useCallback((state: DubbingProgress["state"], progress: number, message: string) => {
    setProgress({ state, progress, message });
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload a file smaller than 500MB.",
        });
        return;
      }
      setIsVideo(file.type.startsWith("video/"));
      setMediaFile(file);
      setProgress({ state: "idle", progress: 0, message: "" });
      setDubbedResult(null);
    }
  }, []);

  const resetForm = useCallback(() => {
    setProgress({ state: "idle", progress: 0, message: "" });
    setMediaFile(null);
    setTargetLanguage("");
    setDubbedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDubMedia = useCallback(async () => {
    if (!mediaFile || !targetLanguage) {
      if (!mediaFile) toast.error("No file", { description: "Please upload an audio or video file to dub." });
      if (!targetLanguage) toast.error("No language selected", { description: "Please select a target language." });
      return;
    }

    updateProgress("uploading", 10, "Uploading media to storage...");

    try {
      const filePath = `${crypto.randomUUID()}-${mediaFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("dubbing_media")
        .upload(filePath, mediaFile, { upsert: true });

      if (uploadError) {
        updateProgress("failed", 0, `Upload failed: ${uploadError.message}`);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from("dubbing_media").getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Failed to generate public URL");
      }

      updateProgress("uploading", 50, "Upload complete! Starting dubbing...");

      const { data } = await axios.post<DubbedResult>("/api/dubbing", {
        mediaUrl: urlData.publicUrl,
        targetLanguage,
        isVideo,
      });

      setDubbedResult({
        projectId: data.projectId,
        dubbedUrl: data.dubbedUrl,
        targetLanguage,
      });

      updateProgress("completed", 100, "Dubbing complete!");

      toast.success("Dubbing complete!", {
        description: `Your media has been dubbed into ${supportedLanguages.find(lang => lang.value === targetLanguage)?.label}.`,
      });
    } catch (error: any) {
      updateProgress("failed", 0, error.message || "Dubbing failed");
      toast.error("Error dubbing media", { description: error.message || "Failed to dub media" });
    }
  }, [mediaFile, targetLanguage, isVideo, updateProgress]);

  const isLoading = progress.state === "uploading" || progress.state === "processing";

  return {
    fileInputRef,
    mediaFile,
    isVideo,
    targetLanguage,
    setTargetLanguage,
    dubbedResult,
    progress,
    isLoading,
    handleFileChange,
    resetForm,
    handleDubMedia,
  };
}