import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

// Define a type for your profile object for better type safety
interface Profile {
  ai_trained: boolean;
  youtube_connected: boolean;
  training_data?: {
    video_urls: string[];
    updated_at: string;
  };
}

export function useTrainingForm(profile: Profile | null, user: User | null) {
  const [videoUrls, setVideoUrls] = useState<string[]>(['', '', '']);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Pre-fill form with existing training data for a better re-training UX
  useEffect(() => {
    if (profile?.ai_trained && profile.training_data?.video_urls) {
      const existingUrls = profile.training_data.video_urls;
      // Ensure there are at least 3 input fields
      const displayUrls = [...existingUrls];
      while (displayUrls.length < 3) {
        displayUrls.push('');
      }
      setVideoUrls(displayUrls);
    }
  }, [profile]);

  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  const handleAddVideoUrl = () => {
    if (videoUrls.length < 5) setVideoUrls([...videoUrls, ""]);
  };

  const handleRemoveVideoUrl = (index: number) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(newUrls);
  };

  const validateAndSubmit = async () => {
    const filledUrls = videoUrls.filter((url) => url.trim() !== "");
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

    if (!profile?.youtube_connected) {
      toast.error("Please connect your YouTube channel first.");
      return;
    }
    if (filledUrls.length < 3) {
      toast.error("Please provide at least 3 YouTube video URLs.");
      return;
    }
    if (filledUrls.some((url) => !youtubeRegex.test(url))) {
      toast.error("One or more URLs are not valid YouTube links.");
      return;
    }

    setUploading(true);
    try {
      const isRetraining = profile?.ai_trained;
      const response = await fetch("/api/train-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, videoUrls: filledUrls, isRetraining }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to train AI");
      }
      
      const result = await response.json();
      toast.success(isRetraining ? "AI Re-training Complete!" : "AI Training Complete!", {
        description: `Successfully analyzed ${result.videosAnalyzed} videos.`,
      });
      setShowModal(true);
    } catch (error: any) {
      toast.error("Training Error", { description: error.message });
    } finally {
      setUploading(false);
    }
  };

  const isValidForSubmission = videoUrls.filter(url => url.trim().match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)).length >= 3;

  return {
    videoUrls,
    uploading,
    showModal,
    setShowModal,
    handleVideoUrlChange,
    handleAddVideoUrl,
    handleRemoveVideoUrl,
    validateAndSubmit,
    isValidForSubmission,
  };
}