"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { X, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'motion/react';
import Link from 'next/link';

import { SubtitleHeader } from '@/components/dashboard/subtitles/SubtitleHeader';
import { VideoPlayer } from '@/components/dashboard/subtitles/VideoPlayer';
import { SubtitleEditorPanel } from '@/components/dashboard/subtitles/SubtitleEditorPanel';

import { useSubtitleData } from '@/hooks/useSubtitleData';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useSubtitleEditor } from '@/hooks/useSubtitleEditor';
import { useSubtitleFileOperations } from '@/hooks/useSubtitleFileOperations';
import { useSubtitleGeneration } from '@/hooks/useSubtitleGeneration';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { convertJsonToVTT } from "@/utils/vttHelper";
import { useDebounce } from "@/hooks/useDebounce";
import { SubtitleEditorSkeleton } from "@/components/dashboard/subtitles/skeleton/SubtitleEditorSkeleton";

export default function SubtitleEditorPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { id } = useParams();

    const { subtitleData, subtitles, setSubtitles, isLoading, error, refetch } = useSubtitleData(id as string);
    const { currentTime, videoDuration, currentSubtitle, seekTo } = useVideoPlayer(
        videoRef,
        subtitleData?.video_url,
        subtitles
    );
    const { editingIndex, setEditingIndex, updateSubtitle, handleAddLine, handleDeleteLine, handleClear } = useSubtitleEditor(
        subtitles,
        setSubtitles,
        currentTime
    );
    const { isSaving, handleSave, handleDownload, handleFileUpload, handleDownloadVideo, downloadVideoLoading } = useSubtitleFileOperations(
        id as string,
        subtitles,
        setSubtitles,
        subtitleData?.video_path,
        subtitleData?.video_url
    );
    const { isGenerating, handleGenerate } = useSubtitleGeneration(id as string, videoDuration, refetch);
    const { undo, redo, canUndo, canRedo } = useUndoRedo(subtitles, setSubtitles);
    const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
    const debouncedSubtitles = useDebounce(subtitles, 500);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) undo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (canRedo) redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    useEffect(() => {
        if (!debouncedSubtitles || debouncedSubtitles.length === 0) {
            if (subtitleUrl) {
                URL.revokeObjectURL(subtitleUrl);
                setSubtitleUrl(null);
            }
            return;
        }

        const vttContent = convertJsonToVTT(debouncedSubtitles);
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const newSubtitleUrl = URL.createObjectURL(blob);
        setSubtitleUrl(newSubtitleUrl);

        return () => {
            URL.revokeObjectURL(newSubtitleUrl);
        };
    }, [debouncedSubtitles]);

    if (isLoading) {
        return <SubtitleEditorSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-[#0B0F19]">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <Card className="max-w-md border border-red-200 dark:border-red-900/30 rounded-[2rem] shadow-xl shadow-red-500/5 bg-white dark:bg-[#0E1338] overflow-hidden">
                        <CardContent className="p-8 sm:p-10 text-center flex flex-col items-center">
                            <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Error Loading Workspace</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                {error || "We couldn't load this subtitle job. Please try again or return to your dashboard."}
                            </p>
                            <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl h-12 font-bold shadow-md transition-all active:scale-95">
                                <Link href="/dashboard/subtitles">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Subtitles
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] lg:h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#0B0F19] overflow-x-hidden lg:overflow-hidden">

            <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col flex-1 lg:min-h-0">

                {/* Header Section */}
                <SubtitleHeader
                    filename={subtitleData?.filename || 'Loading...'}
                    videoPath={subtitleData?.video_path || 'Loading...'}
                    isSaving={isSaving}
                    hasSubtitles={subtitles.length > 0}
                    onSave={handleSave}
                    onDownload={handleDownload}
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                />


                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1 lg:min-h-0">


                    <div className="w-full lg:w-7/12 flex flex-col shrink-0 lg:shrink lg:min-h-0">
                        <VideoPlayer
                            ref={videoRef}
                            videoUrl={subtitleData?.video_url || ''}
                            subtitleUrl={subtitleUrl}
                            title={subtitleData?.video_path || 'Video Player'}
                            onDownloadVideo={handleDownloadVideo}
                            isDownloadDisabled={!subtitles.length || isSaving}
                            downloadVideoLoading={downloadVideoLoading}
                            detectedLanguage={subtitleData?.detected_language}
                            targetLanguage={subtitleData?.language}
                            language={subtitleData?.language}
                        />
                    </div>


                    <div className="w-full lg:w-5/12 flex flex-col min-h-[500px] h-[60vh] sm:h-[70vh] lg:h-auto lg:min-h-0 flex-1 mt-4 lg:mt-0">
                        <SubtitleEditorPanel
                            subtitles={subtitles}
                            currentSub={currentSubtitle}
                            editingIndex={editingIndex}
                            isGenerating={isGenerating}
                            videoDuration={videoDuration}
                            onAddLine={handleAddLine}
                            onUpdate={updateSubtitle}
                            onDelete={handleDeleteLine}
                            onClear={handleClear}
                            onSetEditing={setEditingIndex}
                            onSeek={seekTo}
                            onGenerate={handleGenerate}
                            onFileChange={handleFileUpload}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}