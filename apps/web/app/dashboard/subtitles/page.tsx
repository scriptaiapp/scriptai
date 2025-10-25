"use client";

import { SubtitleUploader } from "@/components/dashboard/subtitles/subtitleUploader";
import { SubtitleHistory } from "@/components/dashboard/subtitles/subtitleHistory";
import { SubtitleResponse } from "@repo/validation/src/types/SubtitleTypes";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function SubtitlesPage() {
    const [subtitles, setSubtitles] = useState<SubtitleResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshSubtitles = useCallback(async () => {
        try {
            setError(null);

            const res = await fetch("/api/subtitle");
            if (!res.ok) {
                throw new Error("Failed to fetch subtitle history");
            }
            const data = await res.json();
            console.log(data);
            setSubtitles(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            toast.error(`Error refreshing list: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSubtitles();
    }, [refreshSubtitles]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
            <div className="container mx-auto max-w-5xl space-y-8 p-4 md:p-8">
                {/* Animated Header */}
                <motion.div
                    className="space-y-2 border-b border-gray-100 pb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-purple-900 bg-clip-text text-transparent">
                        Subtitle Generator
                    </h1>
                    <p className="text-sm text-gray-500">
                        Upload your videos and generate subtitles effortlessly
                    </p>
                </motion.div>

                {/* Animated Uploader */}
                <motion.div
                    className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ y: -2 }}
                >
                    <SubtitleUploader onUploadSuccess={refreshSubtitles} />
                </motion.div>

                {/* Animated History */}
                <motion.div
                    className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <SubtitleHistory
                        subtitles={subtitles}
                        isLoading={isLoading}
                        error={error}
                        refreshSubtitles={refreshSubtitles}
                    />
                </motion.div>
            </div>
        </div>
    );
}