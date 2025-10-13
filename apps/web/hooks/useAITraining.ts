"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"
import { connectYoutubeChannel } from "@/lib/connectYT"

// The main data structure for a video
type Video = {
  id: number;
  url: string;
  title?: string;
  thumbnail?: string;
  status: 'empty' | 'loading' | 'loaded' | 'error';
  error?: string;
};

const initialVideos: Video[] = [
  { id: 1, url: "", status: 'empty', error: "" },
  { id: 2, url: "", status: 'empty', error: "" },
  { id: 3, url: "", status: 'empty', error: "" },
];

export function useAITraining() {
  const { profile, user, supabase, profileLoading: pageLoading, fetchUserProfile } = useSupabase()

  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConnectingYoutube, setIsConnectingYoutube] = useState(false);

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

  const handleAddVideoUrl = () => {
    if (videos.length < 5) {
      setVideos([...videos, { id: Date.now(), url: "", status: 'empty' }]);
    }
  };

  const handleRemoveVideoUrl = (indexToRemove: number) => {
    setVideos(videos.filter((_, index) => index !== indexToRemove));
  };

  const handleVideoUrlChange = (index: number, value: string) => {
    const newVideos = [...videos];
    if (!newVideos[index]) return;

    newVideos[index].url = value;
    if (newVideos[index].status !== 'empty') {
      newVideos[index].status = 'empty';
      delete newVideos[index].title;
      delete newVideos[index].thumbnail;
    }
    setVideos(newVideos);
  };

  const handleUrlBlur = async (index: number) => {
    const video = videos[index];
    if (!video?.url || video.status === 'loaded') return;

    if (!youtubeRegex.test(video.url)) {
      video.status = 'error';
      setVideos([...videos]);
      video.error = "Invalid YouTube URL.";
      return;
    }

    const newVideos = [...videos];
    if (!newVideos[index]) return;
    try {
      newVideos[index].status = 'loading';
      setVideos([...newVideos]);

      const response = await fetch(`/api/get-video-metadata?videoUrl=${encodeURIComponent(video.url)}`);
      if (!response.ok) {
        throw new Error("Video could not be found. It may be private or not present.");
      }

      const data = await response.json();
      newVideos[index] = { ...newVideos[index], ...data, status: 'loaded' };
      setVideos(newVideos);
    } catch (error: any) {
      if (!newVideos[index]) return;
      newVideos[index].status = 'error';
      setVideos([...newVideos]);
      toast.error(error.message || "Invalid YouTube URL.");
    }
  };

  const validateYouTubeUrls = () => {
    if (!profile?.youtube_connected) {
      toast.error("Please connect your YouTube channel first.");
      return false;
    }

    const filledVideos = videos.filter((video) => video.url.trim() !== "");
    if (filledVideos.length < 3) {
      toast.error("Please provide at least 3 YouTube video URLs.");
      return false;
    }

    if (filledVideos.some((video) => !youtubeRegex.test(video.url))) {
      toast.error("Please provide valid YouTube video URLs.");
      return false;
    }
    return true;
  };

  const handleStartTraining = async () => {
    if (!validateYouTubeUrls()) return;
    setUploading(true);
    try {
      const validUrls = videos
        .filter((video) => video.url.trim() !== "")
        .map((video) => video.url);

      const response = await fetch("/api/train-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, videoUrls: validUrls, isRetraining: profile?.ai_trained }),
      });

      if (!response.ok) throw new Error((await response.json()).error || "Failed to train AI");
      await fetchUserProfile(user?.id || "");

      toast.success(profile?.ai_trained ? "AI Re-training Complete!" : "AI Training Complete!");
      setShowModal(true);
    } catch (error: any) {
      toast.error("Error training AI", { description: error.message });
    } finally {
      setUploading(false);
      setVideos(videos.map(video => ({
        ...video,
        url: "",
        status: 'empty',
        error: "",
        title: undefined,
        thumbnail: undefined,
      })));
    }
  };

  const handleConnectYoutube = () => {
    connectYoutubeChannel({ supabase, user, setIsConnectingYoutube });
  };

  return {
    profile,
    videos,
    pageLoading,
    uploading,
    showModal,
    isConnectingYoutube,
    setShowModal,
    handleAddVideoUrl,
    handleRemoveVideoUrl,
    handleVideoUrlChange,
    handleUrlBlur,
    handleStartTraining,
    handleConnectYoutube,
  };
}