"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowRight, Check, Unlink, FileText, Search, Image,
  MessageSquare, Clapperboard, Lightbulb, Sparkles,
  Youtube, TrendingUp, Clock, Zap, Globe, Crown,
  Activity, BarChart3, ChevronRight, CircleDot, BookOpen,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { DashboardData } from "@/app/dashboard/page";

// ── Types ──

interface DashboardHomeProps {
  profile: {
    youtube_connected: boolean;
    ai_trained: boolean;
    credits: number;
    full_name?: string;
    youtube_channel_name?: string;
    language?: string;
  } | null;
  data: DashboardData;
  connectYoutubeChannel: () => void;
  connectingYoutube: boolean;
  disconnectYoutubeChannel: () => void;
  disconnectingYoutube: boolean;
}

// ── Animation ──

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ── Constants ──

const CHART_COLORS = ["#a855f7", "#6366f1", "#ec4899", "#f59e0b", "#10b981"];

const QUICK_ACTIONS = [
  { label: "Write Script", description: "Generate a new video script", href: "/dashboard/scripts/new", icon: FileText, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  { label: "Research Idea", description: "Research a new topic with AI", href: "/dashboard/research/new", icon: Search, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { label: "Create Thumbnail", description: "Design an eye-catching thumbnail", href: "/dashboard/thumbnails/new", icon: Image, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  { label: "Add Subtitles", description: "Generate subtitles for your video", href: "/dashboard/subtitles/new", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { label: "Build Story", description: "Create a compelling story", href: "/dashboard/story-builder/new", icon: Clapperboard, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
  { label: "Ideate Content", description: "Brainstorm content ideas", href: "/dashboard/research", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
] as const;

const ACTIVITY_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  script: { icon: FileText, color: "text-purple-500" },
  ideation: { icon: Lightbulb, color: "text-amber-500" },
  thumbnail: { icon: Image, color: "text-pink-500" },
  subtitle: { icon: MessageSquare, color: "text-blue-500" },
  "story-builder": { icon: BookOpen, color: "text-indigo-500" },
};

type ActivityPeriod = "weekly" | "monthly" | "yearly";

const PERIOD_LABELS: Record<ActivityPeriod, string> = {
  weekly: "Last 7 days",
  monthly: "Last 30 days",
  yearly: "Last 12 months",
};

// ── Helpers ──

function buildActivityData(data: DashboardData, period: ActivityPeriod) {
  const now = new Date();
  type Bucket = { label: string; key: string; scripts: number; ideas: number; thumbnails: number; subtitles: number };
  const buckets: Bucket[] = [];

  if (period === "weekly") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets.push({ label: d.toLocaleDateString("en", { weekday: "short" }), key: d.toISOString().split("T")[0]!, scripts: 0, ideas: 0, thumbnails: 0, subtitles: 0 });
    }
  } else if (period === "monthly") {
    for (let i = 29; i >= 0; i -= 5) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets.push({ label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), key: `${Math.floor(i / 5)}`, scripts: 0, ideas: 0, thumbnails: 0, subtitles: 0 });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: d.toLocaleDateString("en", { month: "short" }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, scripts: 0, ideas: 0, thumbnails: 0, subtitles: 0 });
    }
  }

  const assignToBucket = (items: { created_at: string }[], field: "scripts" | "ideas" | "thumbnails" | "subtitles") => {
    const cutoff = period === "weekly" ? 7 : period === "monthly" ? 30 : 365;
    items.forEach((item) => {
      const itemDate = new Date(item.created_at);
      const daysAgo = Math.floor((now.getTime() - itemDate.getTime()) / 86400000);
      if (daysAgo > cutoff) return;

      if (period === "weekly") {
        const dateStr = itemDate.toISOString().split("T")[0];
        const b = buckets.find((b) => b.key === dateStr);
        if (b) b[field]++;
      } else if (period === "monthly") {
        const bucketIdx = Math.floor(daysAgo / 5);
        const b = buckets.find((b) => b.key === `${bucketIdx}`);
        if (b) b[field]++;
      } else {
        const key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`;
        const b = buckets.find((b) => b.key === key);
        if (b) b[field]++;
      }
    });
  };

  assignToBucket(data.scripts, "scripts");
  assignToBucket(data.ideations, "ideas");
  assignToBucket(data.thumbnails, "thumbnails");
  assignToBucket(data.subtitles, "subtitles");

  return buckets;
}

function buildRecentActivity(data: DashboardData) {
  type ActivityItem = { id: string; title: string; type: string; date: string; status?: string };
  const items: ActivityItem[] = [];

  data.scripts.forEach((s) => items.push({ id: s.id, title: s.title, type: "script", date: s.created_at, status: s.status }));
  data.ideations.forEach((i) => items.push({ id: i.id, title: i.context || i.niche_focus || "Ideation", type: "ideation", date: i.created_at, status: i.status }));
  data.thumbnails.forEach((t) => items.push({ id: t.id, title: (t as any).title || "Thumbnail", type: "thumbnail", date: t.created_at, status: (t as any).status }));
  data.subtitles.forEach((s) => items.push({ id: s.id, title: s.title || s.filename || "Subtitle", type: "subtitle", date: s.created_at, status: s.status }));
  data.storyBuilders.forEach((j) =>
    items.push({
      id: j.id,
      title: j.video_topic || "Story blueprint",
      type: "story-builder",
      date: j.created_at,
      status: j.status,
    }),
  );

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

// ── Component ──

export function DashboardHome({
  profile,
  data,
  connectYoutubeChannel,
  connectingYoutube,
  disconnectYoutubeChannel,
  disconnectingYoutube,
}: DashboardHomeProps) {
  const isYoutubeConnected = profile?.youtube_connected === true;
  const isAiTrained = profile?.ai_trained === true;
  const isSetupComplete = isYoutubeConnected && isAiTrained;
  const progressValue = isYoutubeConnected ? (isAiTrained ? 100 : 50) : 0;
  const searchParams = useSearchParams();

  const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>("weekly");
  const activityData = useMemo(() => buildActivityData(data, activityPeriod), [data, activityPeriod]);
  const recentActivity = useMemo(() => buildRecentActivity(data), [data]);

  const stats = useMemo(() => {
    const completed = (arr: { status?: string }[], statuses: string[]) =>
      arr.filter((i) => statuses.includes(i.status || "")).length;

    return [
      { label: "Scripts", count: data.scripts.length, completed: completed(data.scripts, ["completed", "done"]), icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
      { label: "Ideas", count: data.ideations.length, completed: completed(data.ideations, ["completed"]), icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
      { label: "Thumbnails", count: data.thumbnails.length, completed: completed(data.thumbnails as any[], ["completed", "done"]), icon: Image, color: "text-pink-500", bg: "bg-pink-500/10" },
      { label: "Subtitles", count: data.subtitles.length, completed: completed(data.subtitles, ["done"]), icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
      { label: "Stories", count: data.storyBuilders.length, completed: completed(data.storyBuilders, ["completed"]), icon: Clapperboard, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    ];
  }, [data]);

  const pieData = useMemo(() => stats.filter((s) => s.count > 0).map((s) => ({ name: s.label, value: s.count })), [stats]);
  const totalContent = stats.reduce((a, s) => a + s.count, 0);
  const creditsUsed = [
    ...data.scripts.map((s) => s.credits_consumed || 0),
    ...data.ideations.map((i) => i.credits_consumed || 0),
  ].reduce((a, b) => a + b, 0);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(
        <div className="font-semibold text-red-600">
          Oops! We couldn&apos;t connect your YouTube channel. Please try again.
        </div>,
        { className: "bg-red-50 border-red-600 text-red-900" },
      );
    }
  }, [searchParams]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isSetupComplete
              ? "Here\u2019s an overview of your content creation activity"
              : "Let\u2019s get your AI personalized to start creating."}
          </p>
        </div>
      </motion.div>

      {/* ── Onboarding Card (visible until setup complete) ── */}
      {!isSetupComplete && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl">Let&apos;s Get Your AI Personalized</CardTitle>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {progressValue}% Complete
                </span>
              </div>
              <Progress value={progressValue} className="w-full [&>div]:bg-purple-600" />
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${isYoutubeConnected ? "bg-green-500 text-white" : "border-2 border-purple-600 text-purple-600"}`}>
                    {isYoutubeConnected ? <Check className="h-5 w-5" /> : "1"}
                  </div>
                  <div>
                    <p className="font-semibold">Connect YouTube Channel</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">To let our AI learn your unique voice and style.</p>
                  </div>
                </div>
                {isYoutubeConnected ? (
                  <Button variant="secondary" size="sm" onClick={disconnectYoutubeChannel} disabled={disconnectingYoutube}>
                    <Unlink className="h-4 w-4 mr-2" />
                    {disconnectingYoutube ? "Disconnecting..." : "Disconnect"}
                  </Button>
                ) : (
                  <Button onClick={connectYoutubeChannel} disabled={connectingYoutube} variant="secondary" size="sm" className="bg-black text-white hover:bg-black/80">
                    {connectingYoutube ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>

              <Separator />

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`py-4 ${!isYoutubeConnected ? "cursor-not-allowed" : ""}`}>
                      <Link
                        href={isYoutubeConnected ? "/dashboard/train" : "#"}
                        className={`block ${!isYoutubeConnected ? "pointer-events-none opacity-50" : ""}`}
                        aria-disabled={!isYoutubeConnected}
                        tabIndex={!isYoutubeConnected ? -1 : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${isAiTrained ? "bg-green-500 text-white" : "border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500"}`}>
                              {isAiTrained ? <Check className="h-5 w-5" /> : "2"}
                            </div>
                            <div>
                              <p className="font-semibold">AI Studio</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">To create a personalized AI Engine.</p>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400" />
                        </div>
                      </Link>
                    </div>
                  </TooltipTrigger>
                  {!isYoutubeConnected && <TooltipContent><p>Complete Step 1 to unlock</p></TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Let's Get Started</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const locked = !isSetupComplete;
            return (
              <TooltipProvider key={action.label} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={locked ? "cursor-not-allowed" : ""}>
                      <Link
                        href={locked ? "#" : action.href}
                        className={locked ? "pointer-events-none" : ""}
                        aria-disabled={locked}
                        tabIndex={locked ? -1 : undefined}
                      >
                        <Card className={`group hover:shadow-md transition-all h-full ${locked ? "opacity-50" : "hover:border-purple-200 dark:hover:border-purple-800"}`}>
                          <CardContent className="p-5 flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl ${action.bg} shrink-0`}>
                              <action.icon className={`h-5 w-5 ${action.color}`} />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base mb-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {action.label}
                              </CardTitle>
                              <CardDescription className="text-xs">{action.description}</CardDescription>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors ml-auto mt-1 shrink-0" />
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </TooltipTrigger>
                  {locked && <TooltipContent><p>Complete AI setup to unlock</p></TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    Activity
                  </CardTitle>
                  <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                    {(["weekly", "monthly", "yearly"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setActivityPeriod(p)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${activityPeriod === p
                          ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{PERIOD_LABELS[activityPeriod]}</p>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="h-[220px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillScripts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillIdeas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillThumbnails" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px", padding: "8px 12px" }}
                      />
                      <Area type="monotone" dataKey="scripts" stroke="#a855f7" strokeWidth={2} fill="url(#fillScripts)" name="Scripts" />
                      <Area type="monotone" dataKey="ideas" stroke="#f59e0b" strokeWidth={2} fill="url(#fillIdeas)" name="Ideas" />
                      <Area type="monotone" dataKey="thumbnails" stroke="#ec4899" strokeWidth={2} fill="url(#fillThumbnails)" name="Thumbnails" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.map((item, i) => {
                      const cfg = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.script!;
                      const Icon = cfg!.icon;
                      return (
                        <motion.div
                          key={item.id + i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className={`p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 ${cfg!.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-slate-400 capitalize">{item.type}</p>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{formatTimeAgo(item.date)}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No activity yet. Start creating!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* YouTube Channel Card */}
          {isYoutubeConnected && (
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-orange-400" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    YouTube Channel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg truncate">{profile?.youtube_channel_name || "Connected Channel"}</p>
                    <Badge variant="outline" className="mt-1.5 text-green-600 border-green-600/30 bg-green-500/10">
                      <CircleDot className="h-2.5 w-2.5 mr-1.5 text-green-500 animate-pulse" />
                      Connected
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">Language</span>
                      </div>
                      <p className="text-sm font-semibold capitalize">{profile?.language || "English"}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">AI Model</span>
                      </div>
                      <p className="text-sm font-semibold">{profile?.ai_trained ? "Trained" : "Pending"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/dashboard/channel-stats" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20">
                        <BarChart3 className="h-3.5 w-3.5" />
                        View More
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={disconnectYoutubeChannel}
                      disabled={disconnectingYoutube}
                    >
                      {disconnectingYoutube ? "..." : "Disconnect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Credits Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {profile?.credits || 0}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Available credits</p>
                  </div>
                  {creditsUsed > 0 && (
                    <div className="text-right">
                      <span className="text-sm text-slate-500">{creditsUsed}</span>
                      <p className="text-xs text-slate-400">Used</p>
                    </div>
                  )}
                </div>
                {creditsUsed > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Usage</span>
                      <span>{Math.min(100, Math.round((creditsUsed / (creditsUsed + (profile?.credits || 0))) * 100))}%</span>
                    </div>
                    <Progress
                      value={Math.min(100, (creditsUsed / (creditsUsed + (profile?.credits || 0))) * 100)}
                      className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-indigo-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Distribution */}
          {totalContent > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    Content Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "none", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 -mt-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                        <span className="text-xs text-slate-500">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Subscription Card */}
          <motion.div variants={itemVariants}>
            <Link href="/dashboard/settings?tab=billing">
              <Card className="border-slate-200/80 dark:border-slate-800 overflow-hidden cursor-pointer group hover:shadow-md transition-shadow">
                <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Subscription
                    <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold mb-3">Free Plan</div>
                  <Button variant="outline" className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/20" tabIndex={-1}>
                    <Crown className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
