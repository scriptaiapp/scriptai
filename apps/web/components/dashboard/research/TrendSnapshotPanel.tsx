"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  Eye,
  ArrowUpRight,
  Compass,
  Crosshair
} from "lucide-react";
import type { TrendSnapshot } from "@repo/validation";

interface TrendSnapshotPanelProps {
  snapshot: TrendSnapshot;
}

function formatCompactViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export default function TrendSnapshotPanel({ snapshot }: TrendSnapshotPanelProps) {
  const hasMarketData = snapshot.trendingTopics?.length > 0 || snapshot.earlySignals?.length > 0 || snapshot.saturatedTopics?.length > 0;
  const hasCompetitiveData = snapshot.nicheGaps?.length > 0 || snapshot.competitorInsights?.length > 0;

  return (
    <div className="space-y-6 flex flex-col h-full">


      {hasMarketData && (
        <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-[#0E1338] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                <Compass className="h-4 w-4 text-brand-primary" />
              </div>
              Market Radar
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">


              {snapshot.trendingTopics?.length > 0 && (
                <div className="p-6 sm:px-8">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> High Momentum
                  </h4>
                  <div className="space-y-3.5">
                    {snapshot.trendingTopics.slice(0, 6).map((t, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate pr-4 group-hover:text-brand-primary transition-colors">
                          {t.topic}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-16 sm:w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, t.momentum)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-400 w-6 text-right">
                            {t.momentum}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {snapshot.earlySignals?.length > 0 && (
                <div className="p-6 sm:px-8 bg-emerald-50/30 dark:bg-emerald-900/5">
                  <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Early Signals
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {snapshot.earlySignals.map((s, i) => (
                      <Badge key={i} className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border-none shadow-none text-xs font-bold px-2.5 py-1">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}


              {snapshot.saturatedTopics?.length > 0 && (
                <div className="p-6 sm:px-8 bg-rose-50/30 dark:bg-rose-900/5">
                  <h4 className="text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Saturated (Avoid)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {snapshot.saturatedTopics.map((t, i) => (
                      <Badge key={i} className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 border-none shadow-none text-xs font-bold px-2.5 py-1">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}


      {hasCompetitiveData && (
        <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-[#0E1338] shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-1.5 bg-purple-500/10 rounded-lg">
                <Crosshair className="h-4 w-4 text-purple-500" />
              </div>
              Competitive Edge
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">


              {snapshot.nicheGaps?.length > 0 && (
                <div className="p-6 sm:px-8">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> Content Gaps
                  </h4>
                  <ul className="space-y-3">
                    {snapshot.nicheGaps.map((g, i) => (
                      <li key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                        <span className="flex items-center justify-center mt-0.5 w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black shrink-0">
                          +
                        </span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}


              {snapshot.competitorInsights?.length > 0 && (
                <div className="p-6 sm:px-8">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Competitor Signals
                  </h4>
                  <div className="space-y-1">
                    {snapshot.competitorInsights.slice(0, 5).map((c, i) => (
                      <a
                        key={i}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col gap-1 p-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-primary transition-colors line-clamp-2 leading-snug">
                            {c.title}
                          </p>
                          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-primary shrink-0 transition-colors" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] px-1.5 py-0 border-none">
                            {formatCompactViews(c.views)} views
                          </Badge>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}