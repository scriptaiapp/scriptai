"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Eye, ThumbsUp, Play } from "lucide-react";
import { ChannelStatsVideo } from "@repo/validation";
import {timeAgo} from "@/utils/toolsUtil";

interface RecentVideosGridProps {
    videos: ChannelStatsVideo[];
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}



export function RecentVideosGrid({ videos }: RecentVideosGridProps) {
    return (
        <Card className="border-brand-gray-200 dark:border-brand-gray-800 bg-white dark:bg-brand-dark rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
            <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-[#347AF9]/10 rounded-xl">
                        <Clock className="h-5 w-5 text-[#347AF9]" />
                    </div>
                    Recent Uploads
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video) => {
                        const age = timeAgo(video.publishedAt);
                        return (
                            <a
                                key={video.id}
                                href={`https://youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 p-3 rounded-2xl border-2 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-[68px] w-[120px] shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                                    {video.thumbnail ? (
                                        <Image
                                            src={video.thumbnail}
                                            alt={video.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="120px"
                                        />
                                    ) : null}
                                    {/* Play overlay (Matches TopVideosTable) */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                        <div className="bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 shadow-md">
                                            <Play className="h-3.5 w-3.5 text-slate-900 ml-0.5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-[#347AF9] transition-colors leading-snug mb-1.5">
                                        {video.title}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {/* Date Badge */}
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${age.style}`}>
                                            {age.label}
                                        </span>

                                        {/* Stats matching the Chart legend colors */}
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                <Eye className="h-3.5 w-3.5 text-[#347AF9]" />
                                                {formatCount(video.viewCount)}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                <ThumbsUp className="h-3.5 w-3.5 text-[#10B981]" />
                                                {formatCount(video.likeCount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}