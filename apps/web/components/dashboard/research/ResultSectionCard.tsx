// app/dashboard/research/ResultSectionCard.tsx

"use client";

import { motion } from "motion/react";
import { ResultSection } from "@repo/validation/src/types/researchTopicTypes";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown"
import {cn} from "@/lib/utils";

interface ResultSectionCardProps {
    section: ResultSection;
    index: number;
}

export default function ResultSectionCard({ section, index }: ResultSectionCardProps) {
    const { title, icon: Icon, data } = section;

    if (!data || data.length === 0) return null;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                delay: 0.1 * index
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 break-words">
                    {title}
                </h3>
            </div>

            {/* Content List */}
            <ul className="space-y-3">
                {data.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-purple-500" />

                        <div className={cn("prose dark:prose-invert max-w-none flex-1 min-w-0 overflow-hidden")}>
                            <ReactMarkdown
                                components={{
                                    strong: ({ node, ...props }) => (
                                        <span className="font-bold text-purple-600" {...props} />
                                    ),
                                    em: ({ node, ...props }) => (
                                        <span className="italic text-slate-500" {...props} />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p
                                            className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300 break-words"
                                            {...props}
                                        />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 break-all"
                                            {...props}
                                        />
                                    ),
                                    code: ({ node, ...props }) => (
                                        <code
                                            className="break-all"
                                            {...props}
                                        />
                                    ),
                                }}
                            >
                                {item}
                            </ReactMarkdown>
                        </div>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}