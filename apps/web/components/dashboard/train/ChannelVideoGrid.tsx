"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw, Upload, CheckCircle2, Eye, Search, Lock, Youtube } from "lucide-react"
import { useChannelVideos, type ChannelVideo } from "@/hooks/useChannelVideos"
import { api } from "@/lib/api-client"
function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

function VideoCard({
  video,
  selected,
  onToggle,
}: {
  video: ChannelVideo
  selected: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!selected ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={onToggle}
      className={`
        relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border-2
        ${selected
          ? "border-[#347AF9] ring-4 ring-[#347AF9]/10 bg-[#347AF9]/5 shadow-md"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700"
        }
      `}
    >
      <div className="relative aspect-video overflow-hidden">
        <motion.img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${selected ? "scale-105" : "scale-100"}`}
          loading="lazy"
        />

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#347AF9]/20 backdrop-blur-[2px] flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-white rounded-full p-1 shadow-lg"
              >
                <CheckCircle2 className="h-8 w-8 text-[#347AF9]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded-lg z-0">
          <Eye className="h-3.5 w-3.5 text-slate-300" />
          {formatViewCount(video.viewCount)}
        </div>
      </div>

      <div className="p-4">
        <p className={`text-sm font-bold line-clamp-2 leading-snug transition-colors ${selected ? "text-[#347AF9]" : "text-slate-800 dark:text-slate-200"}`}>
          {video.title}
        </p>
      </div>
    </motion.div>
  )
}

interface ChannelVideoGridProps {
  isYtConnected: boolean | undefined
  isAiTrained: boolean | undefined
  selectedVideoIds: string[]
  onToggleVideo: (video: ChannelVideo) => void
  uploading: boolean
  onStartTraining: () => void
  onConnectYoutube?: () => void // Added this so the locked state CTA works
}

export function ChannelVideoGrid({
  isYtConnected,
  isAiTrained,
  selectedVideoIds,
  onToggleVideo,
  uploading,
  onStartTraining,
  onConnectYoutube,
}: ChannelVideoGridProps) {
  const { videos, loading, loadingMore, hasMore, fetchVideos, loadMore } = useChannelVideos()
  const [search, setSearch] = useState("")
  const [isRetrainingMode, setIsRetrainingMode] = useState(!isAiTrained)
  const [trainedVideos, setTrainedVideos] = useState<ChannelVideo[]>([])
  const [loadingTrained, setLoadingTrained] = useState(false)

  useEffect(() => {
    if (isYtConnected && isRetrainingMode) {
      fetchVideos()
    }
  }, [isYtConnected, isRetrainingMode, fetchVideos])

  useEffect(() => {
    if (isAiTrained && !isRetrainingMode) {
      const fetchTrained = async () => {
        setLoadingTrained(true)
        try {
          const data = await api.get<ChannelVideo[]>("/api/v1/youtube/trained-videos", {
            requireAuth: true,
          })
          if (data && Array.isArray(data)) {
            setTrainedVideos(data)
          }
        } catch (error) {
          console.error("Failed to fetch trained videos:", error)
          setTrainedVideos([])
        } finally {
          setLoadingTrained(false)
        }
      }
      fetchTrained()
    }
  }, [isAiTrained, isRetrainingMode])

  const currentVideos = isRetrainingMode ? videos : trainedVideos
  const currentLoading = isRetrainingMode ? loading : loadingTrained

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return currentVideos
    const q = search.toLowerCase()
    return currentVideos.filter((v) => v.title.toLowerCase().includes(q))
  }, [currentVideos, search])

  const hasEnoughVideos = selectedVideoIds.length >= 3;
  const selectionLabel = hasEnoughVideos
    ? `${selectedVideoIds.length} selected`
    : `${selectedVideoIds.length}/3 required`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      <Card className="shadow-sm border-2 border-slate-100 dark:border-slate-800 rounded-3xl relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/30">

        <CardHeader className="space-y-6 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {isRetrainingMode ? "Select Training Data" : "Trained Videos"}
              </CardTitle>
              {isRetrainingMode && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${hasEnoughVideos
                  ? "bg-[#347AF9]/10 text-[#347AF9] ring-1 ring-[#347AF9]/30"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                  {selectionLabel}
                </span>
              )}
            </div>

            {/* Premium Tactile Action Button */}
            {!isRetrainingMode ? (
              <Button
                onClick={() => setIsRetrainingMode(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white shadow-sm shrink-0 rounded-xl"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Train AI Again
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onStartTraining();
                  if (selectedVideoIds.length >= 3) {
                    setIsRetrainingMode(false);
                  }
                }}
                disabled={uploading || !isYtConnected || selectedVideoIds.length < 3}
                className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Videos...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1.5 h-4 w-4" />
                    {isAiTrained ? "Submit New Videos" : "Start Training"}
                  </>
                )}
              </Button>
            )}
          </div>

          {(currentVideos.length > 0) && (
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search videos by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm focus-visible:ring-brand-primary"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {currentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Youtube className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No videos found</h3>
              <p className="text-slate-500 max-w-sm">We couldn't find any public videos on your connected channel.</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No matching videos</h3>
              <p className="text-slate-500">Try adjusting your search terms.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    selected={!isRetrainingMode || selectedVideoIds.includes(video.id)}
                    onToggle={() => {
                      if (isRetrainingMode) onToggleVideo(video)
                    }}
                  />
                ))}
              </div>

              {isRetrainingMode && hasMore && !search.trim() && (
                <div className="flex justify-center mt-8 pb-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-full font-bold px-8 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loadingMore ? "Loading..." : "Load More Videos"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>

        {/* Premium Locked Overlay */}
        {!isYtConnected && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[6px] flex items-center justify-center z-20">
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl max-w-md mx-4">
              <div className="h-16 w-16 bg-[#347AF9]/10 rounded-full flex items-center justify-center mb-5 border border-[#347AF9]/20">
                <Lock className="h-8 w-8 text-[#347AF9]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Training Locked
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Connect your YouTube channel to access your videos. We need to analyze your past content to build your unique AI model.
              </p>
              {onConnectYoutube && (
                <Button
                  onClick={onConnectYoutube}
                  className="w-full bg-[#347AF9] hover:bg-blue-600 text-white border-b-4 border-blue-800 hover:border-b-0 hover:translate-y-[4px] active:border-b-0 active:translate-y-[4px] transition-all font-bold rounded-xl py-6 text-base"
                >
                  <Youtube className="mr-2 h-5 w-5" />
                  Connect Channel
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}