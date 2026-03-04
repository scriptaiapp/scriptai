"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useSupabase } from "@/components/supabase-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Youtube, Eye, Users, Video, Globe, Calendar,
  ExternalLink, AlertCircle, Link2,
} from "lucide-react";
import Link from "next/link";

interface ChannelData {
  id: string;
  channel_id: string;
  channel_name: string | null;
  channel_description: string | null;
  custom_url: string | null;
  country: string | null;
  default_language: string | null;
  view_count: number | null;
  subscriber_count: number | null;
  video_count: number | null;
  thumbnail: string | null;
  published_at: string | null;
  is_linked: boolean | null;
  topic_details: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

function formatNumber(num: number | null): string {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function ChannelStatsPage() {
  const { supabase, user, profile } = useSupabase();
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error: dbError } = await supabase
          .from("youtube_channels")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (dbError) throw dbError;
        setChannel(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load channel data");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, supabase]);

  if (loading) return <ChannelStatsSkeleton />;

  if (error || !profile?.youtube_connected || !channel) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Channel Stats</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View your connected YouTube channel details
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/30 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Channel Connected</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              {error || "Connect your YouTube channel first to view detailed statistics and insights."}
            </p>
            <Link href="/dashboard">
              <Button className="gap-2">
                <Link2 className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const topics = (channel.topic_details as any)?.topicCategories ?? [];

  return (
    <motion.div
      className="container py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Channel Stats</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Your connected YouTube channel overview
        </p>
      </div>

      {/* Channel Header */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-500 via-red-400 to-orange-400" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {channel.thumbnail && (
              <img
                src={channel.thumbnail}
                alt={channel.channel_name || "Channel"}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold truncate">{channel.channel_name}</h2>
                <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-500/10">
                  Connected
                </Badge>
              </div>
              {channel.custom_url && (
                <a
                  href={`https://youtube.com/${channel.custom_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-500 hover:underline flex items-center gap-1 mt-1"
                >
                  {channel.custom_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {channel.channel_description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {channel.channel_description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30">
                <Users className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-sm text-slate-500">Subscribers</span>
            </div>
            <div className="text-3xl font-bold">{formatNumber(channel.subscriber_count)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-sm text-slate-500">Total Views</span>
            </div>
            <div className="text-3xl font-bold">{formatNumber(channel.view_count)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Video className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-sm text-slate-500">Total Videos</span>
            </div>
            <div className="text-3xl font-bold">{formatNumber(channel.video_count)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-500" />
              Channel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Country", value: channel.country || "Not set" },
              { label: "Language", value: channel.default_language || profile?.language || "Not set" },
              { label: "AI Model", value: profile?.ai_trained ? "Trained" : "Not trained" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Channel Created", value: channel.published_at ? new Date(channel.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A" },
              { label: "Connected On", value: channel.created_at ? new Date(channel.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A" },
              { label: "Last Updated", value: channel.updated_at ? new Date(channel.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {topics.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                Channel Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic: string) => {
                  const label = topic.split("/").pop()?.replace(/_/g, " ") || topic;
                  return (
                    <Badge key={topic} variant="secondary" className="capitalize">
                      {label}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

function ChannelStatsSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <Skeleton className="h-32 w-full rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
