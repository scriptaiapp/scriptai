"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FormStep1Props {
    prompt: string
    setPrompt: (value: string) => void
    context: string
    setContext: (value: string) => void
    promptError: string | null
}

export default function FormStep1({
    prompt,
    setPrompt,
    context,
    setContext,
    promptError,
}: FormStep1Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Step 1: What's the core idea?</h3>
            <div className="space-y-2">
                <Label htmlFor="prompt">
                    Prompt <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A video about the Pomodoro Technique"
                    className="min-h-[120px] focus-visible:ring-purple-500"
                />
                {promptError && <p className="text-red-500 text-sm">{promptError}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="context">Additional Context</Label>
                <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., Mention benefits for students and developers"
                    className="min-h-[100px] focus-visible:ring-purple-500"
                />
            </div>
        </div>
    )
}