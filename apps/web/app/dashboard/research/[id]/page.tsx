"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, Clock, Coins, PlaySquare, AlertCircle, Plus } from "lucide-react";
import IdeaCard from "@/components/dashboard/research/IdeaCard";
import TrendSnapshotPanel from "@/components/dashboard/research/TrendSnapshotPanel";
import OpportunityScoreChart from "@/components/dashboard/research/OpportunityScoreChart";
import IdeationExportMenu from "@/components/dashboard/research/IdeationExportMenu";
import { api } from "@/lib/api-client";
import type { IdeationJob } from "@repo/validation";

export default function IdeationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<IdeationJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await api.get<IdeationJob>(`/api/v1/ideation/${id}`, { requireAuth: true });
        setJob(data);
      } catch (error: any) {
        toast.error("Error loading ideation", { description: error.message });
        router.push("/dashboard/research");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-64 rounded-[2rem]" />
            <Skeleton className="h-64 rounded-[2rem]" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-48 rounded-[2rem]" />
            <Skeleton className="h-48 rounded-[2rem]" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const result = job.result;
  const trendSnapshot = result?.trendSnapshot || job.trend_snapshot;

  if (job.status === "failed") {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/research" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Ideation
        </Link>
        <Card className="border-red-200 dark:border-red-800/40 rounded-[2rem] shadow-sm">
          <CardContent className="py-16 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ideation Failed</h2>
            <p className="text-slate-500 max-w-md">{job.error_message || "An unknown error occurred while processing this request."}</p>
            <Button onClick={() => router.push("/dashboard/research/new")} className="mt-6 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (job.status !== "completed" || !result) {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/research" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Ideation
        </Link>
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <CardContent className="py-20 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Generating Ideas...</h2>
            <p className="text-slate-500 font-medium">Please wait while our AI analyzes market trends.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  const isSingleIdea = result.ideas.length === 1;

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Link href="/dashboard/research" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Ideation
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            {job.niche_focus || (job.auto_mode ? "Auto-generated Ideas" : "Ideation Results")}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              {new Date(job.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              {result.ideas.length} ideas
            </span>
            {result.metadata?.creditsConsumed && (
              <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md text-amber-700 dark:text-amber-400">
                <Coins className="h-4 w-4" />
                {result.metadata.creditsConsumed} credits
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <IdeationExportMenu ideationId={job.id} />
          <Button
            onClick={() => router.push("/dashboard/research/new")}
            className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 font-bold rounded-xl shadow-sm transition-all h-10"
          >
            <Plus className="h-4 w-4 mr-2" /> New Ideation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">



        <main className={`lg:col-span-8 space-y-8 ${isSingleIdea ? "lg:sticky lg:top-6 h-fit" : ""}`}>
          {result.ideas.map((idea, index) => (
            <IdeaCard key={idea.id || index} idea={idea} index={index} ideationId={job.id} />
          ))}
        </main>



        <aside className={`lg:col-span-4 ${!isSingleIdea ? "lg:sticky lg:top-6 h-fit" : ""}`}>
          <div className="space-y-6 flex flex-col pb-10">

            <OpportunityScoreChart ideas={result.ideas} />

            {result.channelFit && (
              <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-[#0E1338] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-1.5 bg-pink-500/10 rounded-lg">
                      <PlaySquare className="h-4 w-4 text-pink-500" />
                    </div>
                    Channel Alignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">

                    {result.channelFit.bestFormats?.length > 0 && (
                      <div className="p-6 sm:px-8">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested Formats</p>
                        <div className="flex flex-wrap gap-2">
                          {result.channelFit.bestFormats.map((f, i) => (
                            <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1 border-none shadow-none text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.channelFit.contentGaps?.length > 0 && (
                      <div className="p-6 sm:px-8">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Audience Gaps</p>
                        <ul className="space-y-3">
                          {result.channelFit.contentGaps.map((g, i) => (
                            <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                              <span className="flex items-center justify-center mt-0.5 w-4 h-4 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-black shrink-0">
                                +
                              </span>
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.channelFit.titlePatterns?.length > 0 && (
                      <div className="p-6 sm:px-8 bg-slate-50/50 dark:bg-slate-900/10">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Proven Title Patterns</p>
                        <div className="flex flex-wrap gap-2">
                          {result.channelFit.titlePatterns.map((p, i) => (
                            <span key={i} className="text-[11px] font-bold bg-white dark:bg-slate-800 text-brand-primary px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            )}

            {trendSnapshot && <TrendSnapshotPanel snapshot={trendSnapshot} />}

          </div>
        </aside>
      </div>
    </motion.div>
  );
}