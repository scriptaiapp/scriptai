"use client"

import { motion } from "motion/react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LucideIcon } from "lucide-react"

export interface GuideStep {
    title: string;
    desc: string;
    icon: LucideIcon;
}

export interface StepperGuideProps {
    title: string;
    steps: GuideStep[];
    accordionValue?: string;
    defaultOpen?: boolean;
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } as const },
}

export function StepperGuide({
    title,
    steps,
    accordionValue = "guide",
    defaultOpen = true
}: StepperGuideProps) {
    return (
        <motion.div variants={itemVariants} className="w-full" initial="hidden" animate="visible">
            <Accordion
                type="single"
                collapsible
                defaultValue={defaultOpen ? accordionValue : undefined}
                className="w-full"
            >
                <AccordionItem value={accordionValue} className="border-slate-100 dark:border-slate-800">
                    <AccordionTrigger className="font-bold text-lg text-slate-900 dark:text-white hover:no-underline hover:text-[#347AF9] transition-colors py-4">
                        {title}
                    </AccordionTrigger>

                    <AccordionContent className="pt-4 pb-6 px-1">
                        {/* Wrapper for the timeline line */}
                        <div className="relative space-y-6">

                            {/* The vertical connecting line */}
                            <div className="absolute top-4 bottom-4 left-5 w-px bg-slate-200 dark:bg-slate-800 z-0" />

                            {steps.map((step, index) => (
                                <div key={index} className="relative z-10 flex items-start gap-5 group cursor-default">

                                    {/* Tactile Icon Container */}
                                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 group-hover:border-[#347AF9] group-hover:text-[#347AF9] group-hover:bg-[#347AF9]/5 group-hover:shadow-[0_4px_15px_rgba(52,122,249,0.15)] transition-all duration-300 shrink-0">
                                        <step.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="pt-1.5">
                                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 group-hover:text-[#347AF9] transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed pr-4">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </motion.div>
    )
}