// app/dashboard/research/ResultSectionCard.tsx

"use client";

import { motion } from "motion/react";
import { ResultSection } from "@repo/validation/src/types/researchTopicTypes";
import { ChevronRight } from "lucide-react";

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
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
            </div>

            {/* Content List */}
            <ul className="space-y-3">
                {data.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-purple-500" />

                        {/* --- MODIFICATION START --- */}
                        {/* Conditionally render an anchor tag for sources, otherwise render a span */}
                        {section.id === 'sources' ? (
                            <a
                                href={item}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors"
                            >
                                {item}
                            </a>
                        ) : (
                            <span className="break-words text-justify text-sm text-slate-600 dark:text-slate-400">
                                {item}
                            </span>
                        )}
                        {/* --- MODIFICATION END --- */}

                    </li>
                ))}
            </ul>
        </motion.div>
    );
}