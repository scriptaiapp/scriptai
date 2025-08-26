"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AITrainingRequired() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center text-center py-20 backdrop-blur-md px-4 md:px-0"
        >
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-6">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
                Unlock This Feature
            </h2>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                This feature is powered by your personalized AI. Upload some of your
                videos to train your model and start generating content tailored to your
                unique style.
            </p>

            {/* CTA */}
            <Link href="/dashboard/train">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                    Go to AI Training
                </Button>
            </Link>
        </motion.div>
    );
}
