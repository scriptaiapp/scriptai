"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface ResearchFormProps {
    isResearching: boolean;
    onResearch: (data: { topic: string; context: string; autoResearch: boolean }) => void;
}

export default function ResearchForm({ isResearching, onResearch }: ResearchFormProps) {
    const [topic, setTopic] = useState("");
    const [context, setContext] = useState("");
    const [autoResearch, setAutoResearch] = useState(false);

    const handleSubmit = () => {
        if (!topic && !autoResearch) {
            toast.error("Topic is required", {
                description: "Please enter a topic or enable auto-research.",
            });
            return;
        }
        onResearch({ topic: autoResearch ? "" : topic, context, autoResearch });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Research a New Topic</CardTitle>
                <CardDescription>Enter a topic or let AI suggest one based on your channel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" placeholder="e.g., The Psychology of Color in Marketing" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isResearching || autoResearch} className="focus-visible:ring-purple-500/80" />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="auto-research" checked={autoResearch} onCheckedChange={(c) => setAutoResearch(c as boolean)} disabled={isResearching} className="data-[state=checked]:bg-purple-600 focus-visible:ring-purple-500/80" />
                    <Label htmlFor="auto-research" className="cursor-pointer font-normal">Let AI choose a trending topic for my channel</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="context">Additional Context (Optional)</Label>
                    <Textarea id="context" placeholder="e.g., Focus on how brands like Apple and Coca-Cola use color." value={context} onChange={(e) => setContext(e.target.value)} disabled={isResearching} className="focus-visible:ring-purple-500/80" />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} className="w-full bg-slate-950 hover:bg-slate-900 text-white dark:bg-slate-50 dark:hover:bg-slate-200 dark:text-slate-900" disabled={isResearching}>
                    {isResearching ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Researching...</>) : (<><Search className="mr-2 h-4 w-4" />Research Topic</>)}
                </Button>
            </CardFooter>
        </Card>
    );
}