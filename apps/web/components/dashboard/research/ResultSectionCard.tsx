"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultSection } from "@repo/validation/src/types/researchTopicTypes";

interface ResultSectionCardProps {
    section: ResultSection;
    index: number;
}

export default function ResultSectionCard({ section, index }: ResultSectionCardProps) {
    const { title, icon: Icon, data } = section;

    if (!data || data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
        >
            <Card className="flex flex-col h-full">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <div className="p-2 bg-muted rounded-md"><Icon className="h-5 w-5 text-muted-foreground" /></div>
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 flex-grow">
                    <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                        {data.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
    );
}