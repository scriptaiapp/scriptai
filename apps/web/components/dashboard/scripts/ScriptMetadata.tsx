"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookText, CheckCircle, Clock, Hash, Languages, Link as LinkIcon, Smile, Sparkles, XCircle } from "lucide-react"
import { InfoItem } from "./InfoItem";

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
    return date.toISOString().substr(14, 5);
};

export const ScriptMetadata: React.FC<ScriptMetadataProps> = ({ script }) => {
    return (
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generation Details</CardTitle>
                    <CardDescription>The parameters used to generate this script.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        <Accordion type="multiple" className="w-full">
                            {script.prompt && (
                                <AccordionItem value="prompt">
                                    <AccordionTrigger>
                                        <div className="flex flex-row items-center gap-3">
                                            <Hash className="h-4 w-4 text-slate-400" />
                                            <strong className="font-medium">Prompt</strong>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm prose prose-slate dark:prose-invert max-w-none">
                                        {script.prompt}
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                            <AccordionItem value="context">
                                <AccordionTrigger>
                                    <div className="flex flex-row items-center gap-3">
                                        <BookText className="h-4 w-4 text-slate-400" />
                                        <strong className="font-medium">Context</strong>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-sm prose prose-slate dark:prose-invert max-w-none">
                                    {script.context || "N/A"}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <InfoItem icon={Smile} label="Tone">{script.tone || "N/A"}</InfoItem>
                        <InfoItem icon={Sparkles} label="Storytelling">{script.include_storytelling ? "Yes" : "No"}</InfoItem>
                        <InfoItem icon={LinkIcon} label="References">{script.reference_links || "N/A"}</InfoItem>
                        <InfoItem icon={Languages} label="Language">{script.language}</InfoItem>
                        <InfoItem icon={script.include_timestamps ? CheckCircle : XCircle} label="Include Timestamps">
                            {script.include_timestamps ? "Yes" : "No"}
                        </InfoItem>
                        <InfoItem icon={Clock} label="Duration">{formatDuration(script.duration)}</InfoItem>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};