"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FormStep3Props {
    references: string
    setReferences: (value: string) => void
}

export default function FormStep3({
    references,
    setReferences,
}: FormStep3Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">
                Step 3: Add sources and generate.
            </h3>
            <div className="space-y-2">
                <Label htmlFor="references">References (Optional)</Label>
                <Textarea
                    id="references"
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    placeholder="Paste URLs or sources..."
                    className="min-h-[150px] focus-visible:ring-purple-500"
                />
            </div>
        </div>
    )
}