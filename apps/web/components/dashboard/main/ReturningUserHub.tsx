"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Image as ImageIcon, MessageSquare,
  TrendingUp, Clock, Crown, BarChart3, Lightbulb,
  ChevronRight, CircleDot, Languages, LinkIcon,
  BrainCircuit, Youtube, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import type { DashboardData } from "@/app/dashboard/page";
import type {BillingInfo, ChannelStats } from "@repo/validation";




interface ReturningUserHubProps {
  profile: {
    credits: number;
    full_name?: string;
    youtube_channel_name?: string;
    language?: string;
    ai_trained?: boolean;
    youtube_connected?: boolean;
  } | null;
  data: DashboardData;
  youtubeChannel?: ChannelStats | null;
  disconnectYoutubeChannel: () => void;
  disconnectingYoutube: boolean;
  billingInfo?: BillingInfo | null;
  billingLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

// Colors for Recharts
const BRAND_BLUE = "#347AF9";
const CHART_COLORS = [BRAND_BLUE, "#8b5cf6", "#ec4899", "#f59e0b"];

// --- HELPER FUNCTIONS ---

function buildWeeklyData(data: DashboardData) {
  const now = new Date();
  const days: { label: string; date: string; scripts: number; ideas: number; thumbnails: number; subtitles: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    days.push({
      label: d.toLocaleDateString("en", { weekday: "short" }),
      date: dateStr,
      scripts: 0, ideas: 0, thumbnails: 0, subtitles: 0,
    });
  }

  const bucketize = (items: { created_at: string }[], key: keyof typeof days[0]) => {
    items.forEach((item) => {
      const itemDate = new Date(item.created_at).toISOString().split("T")[0];
      const day = days.find((d) => d.date === itemDate);
      if (day) (day[key] as number)++;
    });
  };

  bucketize(data.scripts, "scripts");
  bucketize(data.ideations, "ideas");
  bucketize(data.thumbnails, "thumbnails");
  bucketize(data.subtitles, "subtitles");

  return days;
}

function buildRecentActivity(data: DashboardData) {
  type ActivityItem = { id: string; title: string; type: string; date: string; status?: string };
  const items: ActivityItem[] = [];

  data.scripts.forEach((s) => items.push({ id: s.id, title: s.title, type: "script", date: s.created_at, status: s.status }));
  data.ideations.forEach((i) => items.push({ id: i.id, title: i.context || i.niche_focus || "Ideation", type: "ideation", date: i.created_at, status: i.status }));
  data.thumbnails.forEach((t) => items.push({ id: t.id, title: (t as any).title || "Thumbnail", type: "thumbnail", date: t.created_at, status: (t as any).status }));
  data.subtitles.forEach((s) => items.push({ id: s.id, title: s.title || s.filename || "Subtitle", type: "subtitle", date: s.created_at, status: s.status }));
  data.dubbings.forEach((d) => items.push({ id: d.id, title: d.media_name || "Dubbing", type: "dubbing", date: d.created_at, status: d.status }));

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
}

function getActivityMeta(type: string) {
  switch (type) {
    case "script": return { icon: FileText, color: "text-brand-primary", bg: "bg-brand-primary/10", href: "/dashboard/scripts" };
    case "ideation": return { icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10", href: "/dashboard/research" };
    case "thumbnail": return { icon: ImageIcon, color: "text-pink-500", bg: "bg-pink-500/10", href: "/dashboard/thumbnails" };
    case "subtitle": return { icon: MessageSquare, color: "text-indigo-500", bg: "bg-indigo-500/10", href: "/dashboard/subtitles" };
    case "dubbing": return { icon: Languages, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/dashboard/dubbing" };
    default: return { icon: CircleDot, color: "text-slate-500", bg: "bg-slate-500/10", href: "/dashboard" };
  }
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

const QUICK_ACTIONS = [
  { label: "New Script", href: "/dashboard/scripts/new", icon: FileText },
  { label: "Ideation", href: "/dashboard/research/new", icon: Lightbulb },
  { label: "Thumbnails", href: "/dashboard/thumbnails", icon: ImageIcon },
  { label: "Subtitles", href: "/dashboard/subtitles", icon: MessageSquare },
];


export function ReturningUserHub({
  profile,
  data,
  youtubeChannel,
  disconnectYoutubeChannel,
  disconnectingYoutube,
  billingInfo,
  billingLoading
}: ReturningUserHubProps) {

  const weeklyData = useMemo(() => buildWeeklyData(data), [data]);
  const recentActivity = useMemo(() => buildRecentActivity(data), [data]);

  const stats = useMemo(() => {
    const completed = (arr: { status?: string }[], statuses: string[]) =>
      arr.filter((i) => statuses.includes(i.status || "")).length;

    return [
      { label: "Scripts", count: data.scripts.length, completed: completed(data.scripts, ["completed", "done"]), icon: FileText },
      { label: "Ideas", count: data.ideations.length, completed: completed(data.ideations, ["completed"]), icon: Lightbulb },
      { label: "Thumbnails", count: data.thumbnails.length, completed: completed(data.thumbnails as any[], ["completed", "done"]), icon: ImageIcon },
      { label: "Subtitles", count: data.subtitles.length, completed: completed(data.subtitles, ["done"]), icon: MessageSquare },
    ];
  }, [data]);

  const pieData = useMemo(() => {
    return stats.filter((s) => s.count > 0).map((s) => ({ name: s.label, value: s.count }));
  }, [stats]);

  const totalContent = stats.reduce((a, s) => a + s.count, 0);

  // ✨ BILLING LOGIC & DATA
  const displayCredits = billingInfo?.credits ?? profile?.credits ?? 0;
  const isPremium = billingInfo?.currentPlan && billingInfo.currentPlan.name.toLowerCase() !== "free";
  const planName = billingInfo?.currentPlan?.name || "Free Tier";

  const formattedRenewalDate = billingInfo?.subscription?.currentPeriodEnd
    ? new Date(billingInfo.subscription.currentPeriodEnd).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* 1. The Premium Hero Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-white dark:bg-dark-brand-primary border border-slate-100 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Welcome back, <span className="bg-gradient-to-r from-brand-primary to-purple-500 bg-clip-text text-transparent">{profile?.full_name?.split(" ")[0] || "Creator"}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Ready to create your next viral hit?
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 dark:border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalContent}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Assets</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              {/* Uses unified billing credits */}
              <p className="text-2xl font-bold text-brand-primary">{displayCredits}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Credits</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* Stats Page Aesthetic (Brand Blue Hover) */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-brand-primary/40 hover:shadow-[0_8px_30px_rgba(52,122,249,0.12)] transition-all duration-300 rounded-2xl bg-white dark:bg-dark-brand-primary overflow-hidden group hover:-translate-y-1">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-md">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">{stat.count}</div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Activity Area Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[2rem] bg-white dark:bg-dark-brand-primary overflow-hidden">
              <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-brand-primary" />
                    Weekly Output
                  </CardTitle>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold bg-slate-100 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-[10px]">
                    Last 7 days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-6 px-4 sm:px-8">
                <div className="h-[280px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.5} />
                          <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(14, 19, 56, 0.95)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                          color: "#fff", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                        }}
                        itemStyle={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}
                        cursor={{ stroke: "rgba(148,163,184,0.1)" }}
                      />
                      <Area type="monotone" dataKey="scripts" stroke={BRAND_BLUE} strokeWidth={3} fill="url(#colorBrand)" name="Created" activeDot={{ r: 6, fill: BRAND_BLUE, stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:border-brand-primary/40 hover:shadow-[0_8px_30px_rgba(52,122,249,0.12)] transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-white dark:bg-dark-brand-primary group h-full cursor-pointer">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3 h-full justify-center">
                      <div className="p-3.5 rounded-xl bg-brand-primary/10 text-brand-primary transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white group-hover:shadow-md">
                        <action.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-primary transition-colors">{action.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity List */}
          {recentActivity.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[2rem] bg-white dark:bg-dark-brand-primary overflow-hidden">
                <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <Clock className="h-5 w-5 text-slate-400" />
                      Recent Activity
                    </CardTitle>
                    <Link href="/dashboard/scripts" className="text-sm font-bold text-brand-primary hover:text-brand-primary-hover transition-colors flex items-center">
                      View all <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentActivity.map((item) => {
                      const meta = getActivityMeta(item.type);
                      const Icon = meta.icon;
                      const isCompleted = ["completed", "done"].includes(item.status?.toLowerCase() || "");

                      return (
                        <Link
                          key={item.id}
                          href={`${meta.href}/${item.id}`}
                          className="flex items-center justify-between px-6 sm:px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`p-2.5 rounded-xl shrink-0 ${meta.bg} transition-transform group-hover:scale-110`}>
                              <Icon className={`h-4 w-4 ${meta.color}`} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-primary transition-colors mb-0.5">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="capitalize">{item.type}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span>{formatTimeAgo(item.date)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 shrink-0 hidden sm:block">
                            {isCompleted ? (
                              <Badge className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border-none shadow-none text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-200 text-amber-600 dark:border-amber-900/50 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                {item.status || "Draft"}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN (Sticky on large screens) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col lg:sticky lg:top-6 h-fit pb-10">

          {/* 1. ✨ Dynamic Billing Upgrade/Manage Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-dark-brand-primary border-white/10 shadow-[0_0_20px_rgba(52,122,249,0.15)] overflow-hidden rounded-[2rem] relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl pointer-events-none" />
              <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                  {isPremium ? (
                    <Sparkles className="h-5 w-5 text-brand-primary" />
                  ) : (
                    <Crown className="h-5 w-5 text-amber-400" />
                  )}
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 px-8 pb-8">
                <div className="text-3xl font-black text-white mb-1.5 capitalize">{planName}</div>

                {/* Show renewal date if premium */}
                {isPremium && formattedRenewalDate && (
                  <div className="text-xs font-bold text-brand-primary mb-3">
                    Renews on {formattedRenewalDate}
                  </div>
                )}

                <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed mt-2">
                  {isPremium
                    ? "You have full access to advanced AI features, custom styles, and high-res exports."
                    : "Unlock infinite AI generation, custom styles, and 4K exporting."}
                </p>

                {/* <Link href={isPremium ? "/dashboard/billing" : "/dashboard/billing/upgrade"}> */}
                <Link href="#">
                  <Button
                    disabled={billingLoading}
                    className={`w-full font-bold rounded-xl transition-all h-12 shadow-[0_4px_14px_0_rgba(52,122,249,0.39)] hover:shadow-[0_6px_20px_rgba(52,122,249,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base border-b-[3px] hover:border-b-0 ${isPremium
                      ? "bg-white text-dark-brand-primary hover:bg-slate-100 border-slate-300"
                      : "bg-brand-primary text-white hover:bg-brand-primary-hover border-blue-800"
                      }`}
                  >
                    {billingLoading ? "Loading..." : isPremium ? "Manage Subscription" : "Upgrade to Pro"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Sleek Donut Chart */}
          {totalContent > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[2rem] bg-white dark:bg-dark-brand-primary overflow-hidden">
                <CardHeader className="pb-0 pt-6 px-6 sm:px-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-brand-primary" />
                      Content Mix
                    </CardTitle>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">{totalContent} items</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:px-8 pb-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative h-[180px] w-[180px] flex-shrink-0 mt-2">
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-brand-primary/5 via-purple-500/5 to-pink-500/5 blur-sm" />
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={78}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                            cornerRadius={4}
                          >
                            {pieData.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalContent}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total</span>
                      </div>
                    </div>

                    <div className="w-full space-y-3 pt-2">
                      {pieData.map((d, i) => {
                        const pct = Math.round((d.value / totalContent) * 100);
                        return (
                          <div key={d.name} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-md" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{d.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{d.value}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">{pct}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 3. YouTube Channel Card */}
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-[2rem] bg-white dark:bg-dark-brand-primary flex flex-col p-6 sm:p-8 transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                    {youtubeChannel?.thumbnail ? (
                      <Image
                        src={youtubeChannel?.thumbnail || "https://via.placeholder.com/150"}
                        alt={youtubeChannel?.channelName || "Creator Channel"}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-black text-red-500">
                        {(youtubeChannel?.channelName || profile?.youtube_channel_name || "C").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">
                      {youtubeChannel?.channelName || profile?.youtube_channel_name || "Creator Channel"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-green-600 dark:text-green-500">Connected</span>
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Youtube className="h-5 w-5 text-red-500 opacity-90" />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Languages className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Language</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                    {profile?.language || "English"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <BrainCircuit className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Profile</span>
                  </div>
                  {profile?.ai_trained ? (
                    <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 border-none shadow-none text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Trained ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-200 text-amber-600 dark:border-amber-900/50 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-6 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-bold h-11"
                onClick={disconnectYoutubeChannel}
                disabled={disconnectingYoutube}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {disconnectingYoutube ? "Disconnecting..." : "Unlink Channel"}
              </Button>
            </Card>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}