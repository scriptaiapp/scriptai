"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FormStep2Props {
    tone: string
    setTone: (value: string) => void
    language: string
    setLanguage: (value: string) => void
    includeStorytelling: boolean
    setIncludeStorytelling: (value: boolean) => void
}

export default function FormStep2({
    tone,
    setTone,
    language,
    setLanguage,
    includeStorytelling,
    setIncludeStorytelling,
}: FormStep2Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Step 2: Define the style.</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone" className="focus:ring-purple-500">
                            <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="conversational">Conversational</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                            <SelectItem value="motivational">Motivational</SelectItem>
                            <SelectItem value="funny">Funny</SelectItem>
                            <SelectItem value="serious">Serious</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" className="focus:ring-purple-500">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="japanese">Japanese</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                    id="storytelling"
                    checked={includeStorytelling}
                    onCheckedChange={(checked) =>
                        setIncludeStorytelling(checked as boolean)
                    }
                />
                <Label htmlFor="storytelling" className="cursor-pointer">
                    Include storytelling elements
                </Label>
            </div>
        </div>
    )
}