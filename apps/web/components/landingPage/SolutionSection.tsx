"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Video, Zap, CheckCircle, Target } from "lucide-react";

export default function SolutionCard() {
    const solutions = [
        {
            title: "AI That Learns Your Style",
            description: "Connect your YouTube channel and let our AI study your videos. It picks up your tone, vocabulary, and pacing so everything it creates sounds like you.",
            icon: <Video className="h-6 w-6 text-slate-600" />,
            background: "bg-white",
        },
        {
            title: "Scripts in Minutes, Not Hours",
            description: "Tell the AI what your video is about, pick a tone, and get a full script that matches your voice. What used to take hours now takes minutes.",
            icon: <Zap className="h-6 w-6 text-slate-600" />,
            background: "bg-slate-50",
        },
        {
            title: "Stay Consistent, Every Video",
            description: "No more quality dips. Every script, thumbnail, and idea keeps your brand voice intact so your audience always gets the best version of you.",
            icon: <CheckCircle className="h-6 w-6 text-slate-600" />,
            background: "bg-white",
        },
        {
            title: "Everything in One Place",
            description: "Ideas, scripts, thumbnails, subtitles, story outlines — all your content creation tools in a single dashboard. No more juggling 5 different apps.",
            icon: <Target className="h-6 w-6 text-slate-600" />,
            background: "bg-slate-50",
        },
    ];

    return (
        <div className="container px-4 md:px-6">
            <motion.div
                className="flex flex-col items-center text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
                    How Creator AI Fixes This
                </h2>
                <p className="max-w-[700px] text-slate-600 dark:text-slate-400 md:text-lg">
                    We built Creator AI to solve the exact problems you face as a content creator.
                </p>
            </motion.div>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            >
                {solutions.map((solution, index) => (
                    <motion.div
                        key={index}
                        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 14 } } }}
                    >
                        <CardSpotlight
                            className={cn(
                                "relative overflow-hidden min-h-[250px] w-full",
                                solution.background,
                                "border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-400/5 transition-shadow"
                            )}
                            color="#c4b5fd"
                            role="article"
                        >
                            <div className="relative z-10 flex flex-col items-start h-full p-6">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-200 text-slate-600 dark:text-slate-600 mb-4">
                                    {solution.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                    {solution.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {solution.description}
                                </p>
                            </div>
                        </CardSpotlight>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
