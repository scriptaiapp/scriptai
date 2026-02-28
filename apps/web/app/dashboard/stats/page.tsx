"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Eye,
    Users,
    Video,
    TrendingUp,
    Youtube,
    RefreshCw,
    Activity,
    ShieldAlert,
    Unplug,
    MapPin,
    Globe,
    Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/supabase-provider";
import { useChannelStats } from "@/hooks/useChannelStats";
import { StatCard } from "@/components/dashboard/stats/StatCard";
import { EngagementChart } from "@/components/dashboard/stats/EngagementChart";
import { TopVideosTable } from "@/components/dashboard/stats/TopVideosTable";
import { RecentVideosGrid } from "@/components/dashboard/stats/RecentVideosGrid";
import { StatsPageSkeleton } from "@/components/dashboard/stats/StatsPageSkeleton";
import { formatCount } from "@/utils/toolsUtil";


const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } as const },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.98 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } as const },
};

export default function StatsPage() {
    const { profile, profileLoading } = useSupabase();
    const { stats, loading, error, fetchStats } = useChannelStats();
    const isYtConnected = profile?.youtube_connected === true;

    useEffect(() => {
        if (isYtConnected) fetchStats();
    }, [isYtConnected, fetchStats]);

    if (profileLoading || (isYtConnected && loading)) {
        return (
            <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <StatsPageSkeleton />
            </div>
        );
    }

    if (!profileLoading && !isYtConnected) {
        return (
            <div className="w-full min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-lg flex flex-col items-center justify-center text-center bg-white dark:bg-brand-dark rounded-[2rem] border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 sm:p-16 min-h-[70vh]"
                >
                    <div className="h-20 w-20 bg-[#347AF9]/10 rounded-full flex items-center justify-center mb-6 border border-[#347AF9]/20">
                        <Lock className="h-10 w-10 text-[#347AF9]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Connect YouTube to continue
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base mb-10 leading-relaxed max-w-sm mx-auto">
                        Link your YouTube channel to view your channel statistics and performance insights.
                    </p>
                    <Link href="/dashboard">
                        <Button className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl">
                            <Youtube className="mr-2 h-5 w-5" />
                            Connect Channel
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-2xl flex flex-col items-center justify-center text-center bg-white dark:bg-brand-dark rounded-[2rem] border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 sm:p-16"
                >
                    {/* Glowing Error Icon */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full" />
                        <div className="relative h-20 w-20 bg-red-50 dark:bg-red-500/10 rounded-[1.5rem] flex items-center justify-center border border-red-100 dark:border-red-500/20 rotate-3 shadow-sm">
                            <Unplug className="h-10 w-10 text-red-500 -rotate-3" />
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                        Connection Interrupted
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium text-base leading-relaxed">
                        {error || "We couldn't connect to the YouTube Data API to fetch your latest channel statistics. Please check your connection and try again."}
                    </p>

                    <Button
                        onClick={() => fetchStats(false)}
                        className="bg-[#347AF9] hover:bg-[#2665D8] text-white border-b-[3px] border-blue-800 hover:border-b-0 hover:translate-y-[3px] active:border-b-0 active:translate-y-[3px] transition-all h-12 px-10 font-bold rounded-xl shadow-sm text-base"
                    >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Try Again
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!stats) return null;

    // --- DERIVED METRICS CALCULATIONS ---
    const safeAvgViews = stats.avgViewsPerVideo > 0 ? stats.avgViewsPerVideo : 1;
    const engagementRate = ((stats.avgLikesPerVideo / safeAvgViews) * 100).toFixed(1);

    let performanceSub = "Analyzing recent data...";
    if (stats.recentVideos && stats.recentVideos.length > 0) {
        const latestViews = stats.recentVideos[0]?.viewCount ?? 0;
        const diff = latestViews - safeAvgViews;
        const percentChange = ((diff / safeAvgViews) * 100).toFixed(0);

        if (diff > 0) {
            performanceSub = `Latest upload is ${percentChange}% above average`;
        } else if (diff < 0) {
            performanceSub = `Latest upload is ${Math.abs(Number(percentChange))}% below average`;
        } else {
            performanceSub = `Performing exactly at average`;
        }
    }

    // --- QUOTA CALCULATIONS ---
    const isOutOfQuota = stats.remaining <= 0;
    const quotaPercentage = Math.min((stats.usage_count / stats.daily_limit) * 100, 100);
    const isLowQuota = stats.remaining <= 2 && stats.daily_limit > 2;

    const statCards = [
        {
            label: "Subscribers",
            value: formatCount(stats.subscriberCount),
            icon: Users,
            sub: "Lifetime audience" // ✨ Added sub
        },
        {
            label: "Total Views",
            value: formatCount(stats.totalViews),
            icon: Eye,
            sub: "Across all uploads" // ✨ Added sub
        },
        {
            label: "Total Videos",
            value: stats.totalVideos.toLocaleString(),
            icon: Video,
            sub: "Publicly available" // ✨ Added sub
        },
        {
            label: "Avg Views / Video",
            value: formatCount(stats.avgViewsPerVideo),
            icon: TrendingUp,
            sub: performanceSub
        },
        {
            label: "Avg Engagement",
            value: `${engagementRate}%`,
            icon: Activity,
            sub: "Likes per view"
        },
    ];

    return (
        <div className="w-full min-h-full">
            <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

                    {/* Header Area */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white dark:bg-brand-dark p-6 sm:p-8 rounded-[2rem] border border-brand-gray-200 dark:border-brand-gray-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                    >
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex-1">

                            <div className="flex items-center gap-4 mb-3">
                                {stats.thumbnail ? (
                                    <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                                        <Image
                                            src={stats.thumbnail}
                                            alt={stats.channelName}
                                            fill
                                            className="object-cover"
                                            sizes="72px"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                        <Youtube className="h-8 w-8 text-red-500" />
                                    </div>
                                )}

                                <div className="flex flex-col justify-center">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1.5">
                                        {stats.channelName}
                                    </h1>
                                    {stats.custom_url && (
                                        <p className="text-sm font-bold text-slate-500">
                                            {stats.custom_url.startsWith('@') ? stats.custom_url : `@${stats.custom_url}`}
                                        </p>
                                    )}
                                </div>
                            </div>


                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500 mt-4">
                                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                                    </span>
                                    Linked
                                </span>

                                {stats.country && (
                                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
                                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {stats.country}
                                    </span>
                                )}

                                {stats.default_language && (
                                    <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
                                        <Globe className="h-3.5 w-3.5 text-slate-400" /> {stats.default_language}
                                    </span>
                                )}

                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>

                                <span className="text-slate-400">YouTube Data API v3</span>
                            </div>
                        </div>


                        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-5 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">

                            <Button
                                className={`w-full md:w-auto gap-2 h-11 px-8 font-bold rounded-xl transition-all shadow-sm ${isOutOfQuota
                                    ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-none shadow-none"
                                    : stats.can_use_now
                                        ? "bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-none"
                                    }`}
                                onClick={() => fetchStats(true)}
                                disabled={loading || !stats.can_use_now || isOutOfQuota}
                            >
                                {isOutOfQuota ? (
                                    <><ShieldAlert className="h-4 w-4" /> Limit Reached</>
                                ) : (
                                    <>
                                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                        {stats.can_use_now ? "Sync Latest Data" : "Syncing Paused"}
                                    </>
                                )}
                            </Button>


                            <div className="flex flex-col md:items-end w-full">
                                <div className="flex items-center justify-between md:justify-end gap-3 w-full text-xs mb-1.5">
                                    <span className="px-2 py-0.5 rounded-md bg-[#347AF9]/10 text-[#347AF9] font-black uppercase tracking-wider text-[10px]">
                                        {stats.plan} Plan
                                    </span>

                                    {!stats.can_use_now && stats.cooldown_remaining > 0 && !isOutOfQuota ? (
                                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                                            Available in {Math.ceil(stats.cooldown_remaining)} mins
                                        </span>
                                    ) : (
                                        <span className={`font-bold ${isOutOfQuota ? 'text-red-500' : isLowQuota ? 'text-amber-500' : 'text-slate-500'}`}>
                                            {stats.remaining} / {stats.daily_limit} syncs left
                                        </span>
                                    )}
                                </div>

                                <div className="w-full md:w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isOutOfQuota ? 'bg-red-500' : isLowQuota ? 'bg-amber-500' : 'bg-[#347AF9]'}`}
                                        style={{ width: `${quotaPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>


                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {statCards.map((card) => (
                            <StatCard key={card.label} {...card} />
                        ))}
                    </motion.div>


                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <EngagementChart videos={stats.topVideos} />
                        <TopVideosTable videos={stats.topVideos} />
                    </motion.div>


                    {stats.recentVideos.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <RecentVideosGrid videos={stats.recentVideos} />
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}