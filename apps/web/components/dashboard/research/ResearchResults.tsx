// app/dashboard/research/ResearchResults.tsx

"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react"; // Note: I'm using framer-motion here, it's the successor to motion/react and often used with modern Next.js apps. The API is very similar.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, HelpCircle, Lightbulb, LinkIcon } from "lucide-react";
import ResultSectionCard from "./ResultSectionCard"; // We will redesign this component next
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
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col">
            {/* Page Header */}
            <header className="lg:sticky lg:top-20 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{result.topic}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Research generated on {new Date(result.created_at).toLocaleString()}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                {/* Left Column: Sticky Summary */}
                <aside className="lg:col-span-1 mb-8 lg:mb-0">
                    <div className="lg:sticky lg:top-44">
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
                <main className="lg:col-span-2 space-y-6">
                    {resultSections.map((section, index) => (
                        <ResultSectionCard key={section.id} section={section} index={index} />
                    ))}
                </main>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 mt-8 border-t dark:border-slate-800">
                <Button variant="outline" onClick={onResearchNew}>Research Another Topic</Button>
                <Button
                    className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900"
                    onClick={() => router.push(`/dashboard/scripts/new?researchId=${result.id}`)}
                >
                    Create Script from Research
                </Button>
            </div>
        </div>
    );
}