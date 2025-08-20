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
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">{result.topic}</h2>
                <p className="text-muted-foreground">Research results generated on {new Date(result.created_at).toLocaleString()}</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="bg-gradient-to-br from-purple-50/50 via-white to-slate-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-950/20">
                    <CardHeader>
                        <CardTitle className="text-xl">Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-foreground/80">{result.research_data.summary}</p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {resultSections.map((section, index) => (
                    <ResultSectionCard key={section.id} section={section} index={index} />
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onResearchNew}>Research Another Topic</Button>
                <Button className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900" onClick={() => router.push(`/dashboard/scripts/new?researchId=${result.id}`)}>Create Script from Research</Button>
            </div>
        </div>
    );
}