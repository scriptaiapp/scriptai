"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Bot, PenTool, AlertCircle } from "lucide-react";

const HOW_IT_WORKS_STEPS = [
    { step: 1, title: "Provide Videos", desc: "Add 3-5 YouTube video links that best represent your style.", icon: Youtube },
    { step: 2, title: "AI Analysis", desc: "Our AI analyzes your tone, vocabulary, and delivery style.", icon: Bot },
    { step: 3, title: "Start Creating", desc: "Generate personalized scripts that match your unique voice.", icon: PenTool },
];

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

export function HowItWorksSection() {
    return (
        <motion.div variants={itemVariants} className="lg:col-span-1 lg:sticky lg:top-8 space-y-6">
            <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>Personalize your AI in 3 simple steps.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {HOW_IT_WORKS_STEPS.map(({ step, title, desc, icon: Icon }) => (
                        <div key={step} className="flex items-start gap-4">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-slate-900 shrink-0">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{step}. {title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-400">For best results, use videos that showcase your typical content style, tone, and delivery.</p>
            </div>
        </motion.div>
    );
}