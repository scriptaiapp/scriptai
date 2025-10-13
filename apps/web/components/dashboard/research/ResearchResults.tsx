// app/dashboard/research/ResearchResults.tsx

"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, HelpCircle, Lightbulb, LinkIcon } from "lucide-react";
import ResultSectionCard from "./ResultSectionCard";
import { ResearchTopic, ResultSection } from "@repo/validation/src/types/researchTopicTypes";

interface ResearchResultsProps {
    result: ResearchTopic;
    onResearchNew: () => void;
}

export default function ResearchResults({ result, onResearchNew }: ResearchResultsProps) {
    const router = useRouter();

    const resultSections: ResultSection[] = [
        { id: 'keyPoints', title: 'Key Points', icon: BookOpen, data: result.research_data.keyPoints },
        { id: 'trends', title: 'Current Trends', icon: TrendingUp, data: result.research_data.trends },
        { id: 'questions', title: 'Common Questions', icon: HelpCircle, data: result.research_data.questions },
        { id: 'contentAngles', title: 'Content Angles', icon: Lightbulb, data: result.research_data.contentAngles },
        { id: 'sources', title: 'Sources', icon: LinkIcon, data: result.research_data.sources },
    ];

    return (
        <div className="w-full min-h-screen">
            <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
                {/* Page Header */}
                <header className="mb-8">
                    <div className="bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm rounded-xl p-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 break-words">
                            {result.topic}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Research generated on {new Date(result.created_at).toLocaleString()}
                        </p>
                    </div>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Left Column: Summary (Sticky on large screens) */}
                    <aside className="lg:col-span-5 xl:col-span-4">
                        <div className="lg:sticky lg:top-24">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="border-l-4 border-purple-600 bg-slate-50 dark:bg-slate-900/40 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Executive Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                                            {result.research_data.summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </aside>

                    {/* Right Column: Detailed Sections */}
                    <main className="lg:col-span-7 xl:col-span-8">
                        <div className="space-y-6">
                            {resultSections.map((section, index) => (
                                <ResultSectionCard key={section.id} section={section} index={index} />
                            ))}
                        </div>
                    </main>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 pt-8 border-t dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onResearchNew}
                            className="w-full sm:w-auto"
                        >
                            Research Another Topic
                        </Button>
                        <Button
                            className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900"
                            onClick={() => router.push(`/dashboard/scripts/new?researchId=${result.id}`)}
                        >
                            Create Script from Research
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}