"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown, TrendingUp, TrendingDown, Minus,
  ExternalLink, FileText, Clapperboard, ImageIcon, Target,
  Sparkles, Magnet, Lightbulb
} from "lucide-react";
import type { IdeationIdea } from "@repo/validation";

const MOMENTUM_CONFIG = {
  rising: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  stable: { icon: Minus, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  declining: { icon: TrendingDown, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
};

interface IdeaCardProps {
  idea: IdeationIdea;
  index: number;
  ideationId: string;
}

export default function IdeaCard({ idea, index, ideationId }: IdeaCardProps) {
  const router = useRouter();
  const [talkingPointsOpen, setTalkingPointsOpen] = useState(false);
  const momentum = MOMENTUM_CONFIG[idea.trendMomentum as keyof typeof MOMENTUM_CONFIG] || MOMENTUM_CONFIG.stable;
  const MomentumIcon = momentum.icon;


  const getScoreConfig = (score: number) => {
    if (score >= 90) return { stroke: "#10B981", text: "text-[#10B981]", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]" };
    if (score >= 70) return { stroke: "#F59E0B", text: "text-[#F59E0B]", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]" };
    return { stroke: "#EF4444", text: "text-[#EF4444]", shadow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]" };
  };

  const scoreConfig = getScoreConfig(idea.opportunityScore);
  const ringRadius = 24;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (idea.opportunityScore / 100) * ringCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1338] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(52,122,249,0.08)] hover:border-brand-primary/30 transition-all duration-500">


        <div className="p-6 sm:p-8 flex-1">


          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="text-[11px] font-black tracking-widest text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md">
                  IDEA {index + 1}
                </span>
                <Badge variant="secondary" className={`${momentum.bg} ${momentum.color} text-[11px] font-bold px-2 py-0.5 border-none rounded-md uppercase tracking-wider`}>
                  <MomentumIcon className="h-3 w-3 mr-1" strokeWidth={3} />
                  {idea.trendMomentum}
                </Badge>
                <Badge variant="outline" className="text-[11px] font-bold px-2 py-0.5 rounded-md text-slate-500 border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                  {idea.suggestedFormat}
                </Badge>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                {idea.title}
              </h3>

              {idea.titleVariations?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {idea.titleVariations.map((v, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                      {v}
                    </span>
                  ))}
                </div>
              )}
            </div>


            <div className="flex flex-col items-center shrink-0">
              <div className={`relative w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center ${scoreConfig.shadow}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 60 60">

                  <circle cx="30" cy="30" r={ringRadius} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="none" />

                  <circle
                    cx="30" cy="30" r={ringRadius}
                    stroke={scoreConfig.stroke}
                    strokeWidth="6" fill="none"
                    strokeLinecap="round"
                    style={{ strokeDasharray: ringCircumference, strokeDashoffset: ringOffset, transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <span className={`text-xl font-black ${scoreConfig.text}`}>{idea.opportunityScore}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Score</span>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/10 dark:border-brand-primary/20 transition-colors hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-brand-primary/20 text-brand-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Why This Works</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {idea.whyItWorks}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 transition-colors hover:bg-amber-500/10 dark:hover:bg-amber-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm">
                  <Magnet className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hook Angle</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {idea.hookAngle}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 mb-6" />


          <div className="space-y-6">


            {idea.targetKeywords?.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Target Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {idea.targetKeywords.map((kw, i) => (
                    <span key={i} className="text-xs font-bold text-[#b488fb] bg-[#b488fb]/10 px-2.5 py-1 rounded-md">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {idea.searchIntentSummary && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500 dark:text-purple-400" /> Search Intent
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {idea.searchIntentSummary}
                </p>
              </div>
            )}


            {idea.talkingPoints?.length > 0 && (
              <div className="pt-2">
                <Collapsible open={talkingPointsOpen} onOpenChange={setTalkingPointsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between h-14 px-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 font-bold transition-all shadow-sm">
                      <span className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        Talking Points ({idea.talkingPoints.length})
                      </span>
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${talkingPointsOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="mt-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/20">
                      <ol className="space-y-3 pl-2">
                        {idea.talkingPoints.map((point, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex gap-3">
                            <span className="text-brand-primary font-black">{i + 1}.</span> {point}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}


            {idea.referenceSignals?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Reference Signals</h4>
                <div className="space-y-2">
                  {idea.referenceSignals.map((ref, i) => (
                    <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors truncate w-fit max-w-full">
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                      <span className="truncate border-b border-transparent group-hover:border-brand-primary/30 pb-0.5">{ref.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="bg-slate-50 dark:bg-slate-900/40 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3">
          <Button
            className="bg-brand-primary hover:bg-brand-primary-hover active:bg-brand-primary-hover transition-all text-white shadow-sm shrink-0 rounded-xl"
            onClick={() => router.push(`/dashboard/scripts/new?ideationId=${ideationId}&ideaIndex=${index}`)}
          >
            <FileText className="h-4 w-4 mr-2" /> Create Script
          </Button>

          <Button
            variant="outline"
            className="font-bold h-10 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.push(`/dashboard/story-builder?topic=${encodeURIComponent(idea.title)}`)}
          >
            <Clapperboard className="h-4 w-4 mr-2 text-slate-400" /> Story Builder
          </Button>

          <Button
            variant="outline"
            className="font-bold h-10 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.push(`/dashboard/thumbnails?topic=${encodeURIComponent(idea.title)}`)}
          >
            <ImageIcon className="h-4 w-4 mr-2 text-slate-400" /> Thumbnail
          </Button>
        </div>

      </Card>
    </motion.div>
  );
}