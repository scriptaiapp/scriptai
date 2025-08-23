"use client"; // Required for Framer Motion

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function AITrainingRequired() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <Card className="max-w-lg w-full shadow-none border-0">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        {/* Icon with Purple Accent */}
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-6">
                            <div className="p-3 bg-purple-200 dark:bg-purple-900/30 rounded-full">
                                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>

                        {/* Headline */}
                        <h2 className="text-2xl font-bold tracking-tight mb-2">
                            Unlock This Feature by Training Your AI
                        </h2>

                        {/* Description */}
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                            This page is powered by your personalized AI. Train your model
                            by uploading some of your videos to start generating content
                            tailored to your unique style.
                        </p>

                        {/* Call-to-Action Button */}
                        <Link href="/dashboard/train">
                            <Button
                                size="lg"
                                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900"
                            >
                                Go to AI Training
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
