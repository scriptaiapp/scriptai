"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookText, Clock, Hash, Languages, Link as LinkIcon, Smile, Sparkles, ListVideo, Settings2 } from "lucide-react"

interface Script {
    prompt: string | null;
    context: string | null;
    tone: string | null;
    include_storytelling: boolean;
    reference_links: string | null;
    language: string;
    include_timestamps: boolean;
    duration: string;
}

interface ScriptMetadataProps {
    script: Script;
}

const formatDuration = (seconds: string | null): string => {
    if (!seconds || isNaN(parseInt(seconds, 10))) {
        return "N/A";
    }
    const date = new Date(0);
    date.setSeconds(parseInt(seconds, 10));
    return date.toISOString().substring(14, 19); // Returns MM:SS cleanly
};

export const ScriptMetadata: React.FC<ScriptMetadataProps> = ({ script }) => {
    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] bg-white dark:bg-[#0E1338] overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0E1338]/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Settings2 className="h-5 w-5 text-[#347AF9]" />
                    Generation Details
                </CardTitle>
                <p className="text-xs font-medium text-slate-500">Parameters used by the AI.</p>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">

                {/* 1. The Bento Grid for Quick Stats */}
                <div className="grid grid-cols-2 gap-3">

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-[#347AF9]/30 group">
                        <Smile className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tone</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize truncate">
                            {script.tone || "Neutral"}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-[#347AF9]/30 group">
                        <Clock className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Duration</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {formatDuration(script.duration)}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-[#347AF9]/30 group">
                        <Languages className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Language</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize truncate">
                            {script.language || "English"}
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-[#347AF9]/30 group">
                        {script.include_storytelling ? (
                            <Sparkles className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                        ) : (
                            <ListVideo className="h-4 w-4 text-[#347AF9] mb-2 group-hover:scale-110 transition-transform" />
                        )}
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Format</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {script.include_storytelling ? "Storytelling" : "Standard"}
                        </p>
                    </div>

                </div>

                {/* 2. Soft Accordions for Long Text */}
                <Accordion type="multiple" className="w-full space-y-3">

                    {script.prompt && (
                        <AccordionItem value="prompt" className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex flex-row items-center gap-3">
                                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                        <Hash className="h-4 w-4 text-[#347AF9]" />
                                    </div>
                                    <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">Prompt</strong>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed">
                                {script.prompt}
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    <AccordionItem value="context" className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden px-4">
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex flex-row items-center gap-3">
                                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                    <BookText className="h-4 w-4 text-[#347AF9]" />
                                </div>
                                <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">Context</strong>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed">
                            {script.context || <span className="italic opacity-50">No context provided.</span>}
                        </AccordionContent>
                    </AccordionItem>

                    {script.reference_links && (
                        <AccordionItem value="references" className="border-none bg-slate-50 dark:bg-slate-900/50 rounded-2xl overflow-hidden px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex flex-row items-center gap-3">
                                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                        <LinkIcon className="h-4 w-4 text-[#347AF9]" />
                                    </div>
                                    <strong className="font-bold text-slate-800 dark:text-slate-200 text-sm">References</strong>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-[#347AF9] pb-4 break-all">
                                <a href={script.reference_links} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {script.reference_links}
                                </a>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                </Accordion>

            </CardContent>
        </Card>
    );
};