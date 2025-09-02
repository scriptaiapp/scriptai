"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface FormStep2Props {
    tone: string
    setTone: (value: string) => void
    language: string
    setLanguage: (value: string) => void
    includeStorytelling: boolean
    setIncludeStorytelling: (value: boolean) => void
    customDuration: string
    setCustomDuration: (value: string) => void
    duration: string
    setDuration: (value: string) => void
    includeTimestamps: boolean
    setIncludeTimestamps: (value: boolean) => void


}

export default function FormStep2({
    tone,
    setTone,
    language,
    setLanguage,
    includeStorytelling,
    setIncludeStorytelling,
    duration,
    setDuration,
    customDuration,
    setCustomDuration,
    includeTimestamps,
    setIncludeTimestamps

}: FormStep2Props) {
    return (
        <div className="space-y-8">
            <h3 className="text-xl font-semibold">Step 2: Define the style.</h3>

            {/* Tone and Language Selection */}
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

            {/* Video Duration Selection */}
            <div className="space-y-3">
                <Label>Video Duration</Label>
                <p className="text-sm text-muted-foreground">Select a target length for your script.</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button variant={duration === '1min' ? 'default' : 'outline'} onClick={() => setDuration('1min')}>~1 min</Button>
                    <Button variant={duration === '3min' ? 'default' : 'outline'} onClick={() => setDuration('3min')}>~3 min</Button>
                    <Button variant={duration === '5min' ? 'default' : 'outline'} onClick={() => setDuration('5min')}>~5 min</Button>
                    <Button variant={duration === 'custom' ? 'default' : 'outline'} onClick={() => setDuration('custom')}>Custom</Button>
                </div>
                {duration === 'custom' && (
                    <div className="pt-2">
                        <Input
                            type="text"
                            placeholder="e.g., 04:30"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            className="max-w-[120px]"
                        />
                    </div>
                )}
            </div>

            {/* Formatting Options */}
            <div className="space-y-6">
                <Label>Formatting Options</Label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="storytelling-switch" className="text-base">Include storytelling elements</Label>
                        <p className="text-sm text-muted-foreground">Weaves a narrative to make your script more engaging.</p>
                    </div>
                    <Switch
                        id="storytelling-switch"
                        checked={includeStorytelling}
                        onCheckedChange={setIncludeStorytelling}
                    />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="timestamps-switch" className="text-base">Include timestamps</Label>
                        <p className="text-sm text-muted-foreground">Adds estimated time markers for easier pacing and editing.</p>
                    </div>
                    <Switch
                        id="timestamps-switch"
                        checked={includeTimestamps}
                        onCheckedChange={setIncludeTimestamps}
                    />
                </div>
            </div>
        </div>
    )
}