"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "motion/react"
import ReactMarkdown from "react-markdown"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScriptEditorProps {
    script: string
    setScript: (value: string) => void
    title: string
    size: string
    setTitle: (value: string) => void
    animation: boolean
}

export default function ScriptEditor({
    script,
    setScript,
    title,
    setTitle,
    size,
    animation
}: ScriptEditorProps) {
    const [viewMode, setViewMode] = useState<"write" | "preview">("preview")
    const [typedScript, setTypedScript] = useState("")
    const [copiedTitle, setCopiedTitle] = useState(false)
    const [copiedScript, setCopiedScript] = useState(false)
    const hasAnimated = useRef(!animation) // only animate once on first load

    useEffect(() => {
        if (viewMode !== "preview") return

        // First time preview opens with a script → animate
        if (!hasAnimated.current && script) {
            setTypedScript("")
            const words = script.split(/(\s+)/)
            let i = 0

            const typingInterval = setInterval(() => {
                if (i < words.length) {
                    setTypedScript((prev) => prev + words[i])
                    i++
                } else {
                    clearInterval(typingInterval)
                    hasAnimated.current = true
                }
            }, 25)

            return () => clearInterval(typingInterval)
        }

        // After first animation → instantly update preview
        if (hasAnimated.current) {
            setTypedScript(script)
        }
    }, [script, viewMode])

    const copyToClipboard = async (text: string, type: "title" | "script") => {
        try {
            await navigator.clipboard.writeText(text)
            if (type === "title") {
                setCopiedTitle(true)
                setTimeout(() => setCopiedTitle(false), 2000)
            } else {
                setCopiedScript(true)
                setTimeout(() => setCopiedScript(false), 2000)
            }
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const editorClassName =
        `min-h-[300px] max-h-[350px] overflow-y-auto w-full rounded-md rounded-t-none border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`

    return (
        <motion.div
            key={script ? "script-loaded" : "script-empty"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-6"
        >
            {/* --- Title Input with Copy Button --- */}
            <div className="space-y-2">
                <Label htmlFor="title">Script Title</Label>
                <div className="relative">
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for your script"
                        className="focus-visible:ring-purple-500 pr-10"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => copyToClipboard(title, "title")}
                        aria-label="Copy script title"
                    >
                        {copiedTitle ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* --- Editor / Preview Tabs with Copy Button --- */}
            <div className="space-y-2">
                <div className="flex items-center">
                    <button
                        onClick={() => setViewMode("write")}
                        className={cn(
                            "rounded-t-md border border-b-0 px-3 py-1.5 text-sm font-medium transition-colors",
                            viewMode === "write"
                                ? "border-input bg-background text-purple-600"
                                : "border-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        Write
                    </button>
                    <button
                        onClick={() => setViewMode("preview")}
                        className={cn(
                            "rounded-t-md border border-b-0 px-3 py-1.5 text-sm font-medium transition-colors",
                            viewMode === "preview"
                                ? "border-input bg-background text-purple-600"
                                : "border-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        Preview
                    </button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => copyToClipboard(script, "script")}
                        aria-label="Copy script content"
                    >
                        {copiedScript ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>

                {viewMode === "write" ? (
                    <Textarea
                        id="script-edit"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="✨ Write your script using Markdown..."
                        className={cn(editorClassName, "focus-visible:ring-purple-500 max-[700px]:min-h-[200px]") + ` h-[${size}px]`}
                    />
                ) : (
                    <div className={cn(editorClassName, "prose dark:prose-invert max-w-none")}>
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
                                        className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300"
                                        {...props}
                                    />
                                ),
                            }}
                        >
                            {script
                                ? typedScript
                                : "Nothing to preview yet. Switch to the 'Write' tab."}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </motion.div>
    )
}