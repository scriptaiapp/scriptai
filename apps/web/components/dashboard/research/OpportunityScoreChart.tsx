"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "lucide-react";
import type { IdeationIdea } from "@repo/validation";

interface OpportunityScoreChartProps {
  ideas: IdeationIdea[];
}

const getBarColor = (score: number) => {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
};


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (

      <div className="z-50 bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl max-w-[220px]">
        <p className="font-bold text-white mb-2.5 pb-2.5 border-b border-slate-700/50 leading-snug break-words whitespace-normal text-sm">
          {data.fullTitle}
        </p>
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            style={{ backgroundColor: payload[0].fill }}
          />
          <span className="font-black text-white text-lg leading-none">{data.score}</span>
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-0.5">/ 100 Score</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function OpportunityScoreChart({ ideas }: OpportunityScoreChartProps) {
  const data = ideas.map((idea, i) => ({
    name: `Idea ${i + 1}`,
    score: idea.opportunityScore,
    fullTitle: idea.title,
  }));


  const chartHeight = Math.max(ideas.length * 60, 140);

  return (
    <Card className="border border-slate-200 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-[#0E1338] shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
      <CardHeader className="rounded-t-[2rem] pb-4 pt-6 px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="p-1.5 bg-purple-500/10 rounded-lg">
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </div>
          Opportunity Scores
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 sm:px-8 pt-6">
        <div style={{ height: chartHeight, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
              barGap={8}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={55}
                tick={{ fontSize: 12, fill: "#64748B", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(148,163,184,0.05)" }}

                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 100, outline: 'none', overflow: 'visible' }}
              />
              <Bar
                dataKey="score"
                radius={[0, 99, 99, 0] as any}
                barSize={24}
                background={{ fill: 'rgba(148,163,184,0.1)', radius: [0, 99, 99, 0] as any }}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}