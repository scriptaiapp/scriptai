"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ThumbsUp, MessageCircle, Trophy, Play } from "lucide-react";
import { ChannelStatsVideo } from "@repo/validation";
import {formatCount, parseDuration} from "@/utils/toolsUtil";

interface TopVideosTableProps {
    videos: ChannelStatsVideo[];
}





const RANK_STYLES: Record<number, string> = {
    0: "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-[0_4px_10px_rgba(245,158,11,0.3)]", // Gold
    1: "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-[0_4px_10px_rgba(148,163,184,0.3)]", // Silver
    2: "bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-[0_4px_10px_rgba(217,119,6,0.3)]", // Bronze
};

export function TopVideosTable({ videos }: TopVideosTableProps) {
    // Limit to top 5 so the table height matches the chart nicely
    const displayVideos = videos.slice(0, 5);

    return (
        <Card className="h-full border-brand-gray-200 dark:border-brand-gray-800 bg-white dark:bg-brand-dark rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
            <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                        <Trophy className="h-5 w-5 text-amber-500" />
                    </div>
                    Top Performing Videos
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {displayVideos.map((video, i) => (
                        <a
                            key={video.id}
                            href={`https://youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 px-6 sm:px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group"
                        >
                            {/* Rank badge */}
                            <span
                                className={`w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-full shrink-0 ${RANK_STYLES[i] ?? "bg-slate-100 dark:bg-slate-800 text-slate-500 shadow-sm"
                                    }`}
                            >
                                {i + 1}
                            </span>

                            {/* Thumbnail with hover overlay */}
                            <div className="relative h-[60px] w-[106px] shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                                {video.thumbnail ? (
                                    <Image
                                        src={video.thumbnail}
                                        alt={video.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="106px"
                                    />
                                ) : null}
                                {/* Play overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                    <div className="bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 shadow-md">
                                        <Play className="h-3 w-3 text-slate-900 ml-0.5" />
                                    </div>
                                </div>
                                {video.duration && (
                                    <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-white font-bold tracking-wider text-[9px] px-1.5 py-0.5 rounded-[4px] leading-none">
                                        {parseDuration(video.duration)}
                                    </span>
                                )}
                            </div>

                            {/* Title & Stats block */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-[#347AF9] transition-colors mb-1">
                                    {video.title}
                                </p>

                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <p className="text-slate-400">
                                        {new Date(video.publishedAt).toLocaleDateString("en", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>

                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block"></span>

                                    {/* Horizontal Stat Pills matching the Chart's color legend */}
                                    <div className="hidden sm:flex items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <Eye className="h-3.5 w-3.5 text-[#347AF9]" />
                                            {formatCount(video.viewCount)}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <ThumbsUp className="h-3.5 w-3.5 text-[#10B981]" />
                                            {formatCount(video.likeCount)}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <MessageCircle className="h-3.5 w-3.5 text-[#F59E0B]" />
                                            {formatCount(video.commentCount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}