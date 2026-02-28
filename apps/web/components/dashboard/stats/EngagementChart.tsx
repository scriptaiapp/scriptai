"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import { ChannelStatsVideo } from "@repo/validation";
import {formatCount} from "@/utils/toolsUtil";

interface EngagementChartProps {
    videos: ChannelStatsVideo[];
}
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const fullTitle = payload[0].payload.fullTitle;
        return (
            <div className="bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl max-w-[240px]">
                <p className="font-bold text-white mb-3 pb-3 border-b border-slate-700/50 leading-snug break-words whitespace-normal">
                    {fullTitle}
                </p>
                <div className="space-y-2.5">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                                    style={{ backgroundColor: entry.fill }}
                                />
                                <span className="text-slate-300 capitalize font-medium">{entry.name}</span>
                            </div>
                            <span className="font-bold text-white">{formatCount(entry.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};



const LEGEND = [
    { key: "Views", color: "#347AF9", gradId: "fillViews" },
    { key: "Likes", color: "#10B981", gradId: "fillLikes" },
    { key: "Comments", color: "#F59E0B", gradId: "fillComments" },
] as const;

export function EngagementChart({ videos }: EngagementChartProps) {
    const data = videos.slice(0, 8).map((v, index) => ({
        name: `#${index + 1}`,
        Views: v.viewCount,
        Likes: v.likeCount,
        Comments: v.commentCount,
        fullTitle: v.title,
    }));

    return (
        <Card className="h-full border-brand-gray-200 dark:border-brand-gray-800 bg-white dark:bg-brand-dark rounded-[2rem] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all flex flex-col">
            <CardHeader className="pb-6 pt-6 px-8">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2.5 bg-[#347AF9]/10 rounded-xl">
                        <BarChart2 className="h-5 w-5 text-[#347AF9]" />
                    </div>
                    Engagement Breakdown
                    <span className="ml-auto text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        Top {data.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-8 pb-8 flex-1 flex flex-col">
                <div className="flex-1 w-full min-h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={2} barSize={24}>
                            <defs>
                                {LEGEND.map(({ color, gradId }) => (
                                    <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                                    </linearGradient>
                                ))}
                            </defs>

                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="4 4"
                                stroke="rgba(148,163,184,0.15)"
                            />

                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 13, fill: "#64748B", fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dy={12}
                            />

                            <YAxis
                                tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                                tickFormatter={formatCount}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                            />

                            <Tooltip
                                content={<CustomTooltip />}
                                formatter={(value: number, name: string) => [
                                    <span key={name} className="font-bold text-sm">{formatCount(value)}</span>,
                                    <span key={`${name}-label`} className="text-slate-400 capitalize text-sm">{name}</span>
                                ]}

                                labelFormatter={(_, payload) => {
                                    if (payload && payload.length > 0) {
                                        return (

                                            <p className="font-bold text-white mb-3 pb-3 border-b border-slate-700/50 leading-tight max-w-[220px] break-words whitespace-normal">
                                                {payload[0]?.payload?.fullTitle}
                                            </p>
                                        );
                                    }
                                    return "";
                                }}
                                contentStyle={{
                                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "16px",
                                    color: "#f8fafc",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                                    padding: "16px",

                                    maxWidth: "260px"
                                }}
                                cursor={{ fill: "rgba(148,163,184,0.05)" }}
                            />

                            {LEGEND.map(({ key, gradId }) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    fill={`url(#${gradId})`}
                                    radius={[6, 6, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    {LEGEND.map(({ key, color }) => (
                        <div key={key} className="flex items-center gap-2.5">
                            <div
                                className="h-3.5 w-3.5 rounded-md"
                                style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}40` }}
                            />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}