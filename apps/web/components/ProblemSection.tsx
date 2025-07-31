"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, TrendingUp, Clock, Target } from "lucide-react";
import { motion } from "motion/react";
import { BackgroundLines } from "./ui/background-lines";
import { Timeline } from "./ui/timeline";


const ProblemSection = () => {

    const problems = [
        {
            title: "Writer's Block Nightmare",
            description: "Staring at a blank screen for hours, struggling to come up with fresh, engaging content ideas that resonate with your audience.",
            icon: AlertCircle,
            color: "text-red-500"
        },
        {
            title: "Inconsistent Content Quality",
            description: "Your content quality varies drastically - some videos perform amazingly while others barely get any views or engagement.",
            icon: TrendingUp,
            color: "text-orange-500"
        },
        {
            title: "Time-Consuming Script Writing",
            description: "Spending 3-5 hours writing a single script when you could be filming, editing, or engaging with your community instead.",
            icon: Clock,
            color: "text-yellow-500"
        },
        {
            title: "Generic AI Tools",
            description: "Current AI tools generate generic content that doesn't match your unique voice, style, or brand personality.",
            icon: Target,
            color: "text-blue-500"
        }
    ]
    const entries = problems.map((p) => ({
        title: p.title,
        content: (
            <div className="flex items-start gap-4">
                <div
                    className={cn(
                        "flex-shrink-0 p-3 rounded-md border bg-white shadow-sm",
                        // use border tinted from primary palette
                        {
                            "border-blue-300": p.color === "text-blue-500",
                            "border-indigo-300": p.color === "text-indigo-500",
                            "border-orange-300": p.color === "text-orange-500",
                            "border-green-300": p.color === "text-green-500",
                        }
                    )}
                >
                    <p.icon className={cn("w-6 h-6", p.color)} />
                </div>
                <p className="text-base leading-relaxed text-slate-800">
                    {p.description}
                </p>
            </div>
        ),
    }));

    return (
        <section className="bg-white py-24">
            <div className="container max-w-5xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-900">
                        What’s Holding You Back?
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        These are the most common roadblocks content creators face — and the reason we built this.
                    </p>
                </div>

                <div className="space-y-10">
                    {problems.map((p, i) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-14 group"
                        >
                            <div className="absolute left-0 top-1">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shadow-md",
                                    p.color.replace("text-", "bg-").replace("-500", "-100")
                                )}>
                                    <p.icon className={cn("w-5 h-5", p.color)} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-800 group-hover:underline">{p.title}</h3>
                                <p className="mt-1 text-slate-600">{p.description}</p>
                            </div>

                            <div className="mt-6 border-l-2 border-dashed border-slate-200 ml-[20px] h-10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
