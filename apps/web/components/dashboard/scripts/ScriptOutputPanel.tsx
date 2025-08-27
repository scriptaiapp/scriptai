"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import ScriptEditor from "@/components/dashboard/scripts/ScriptEditor"
import ScriptOutputPlaceholder from "@/components/dashboard/scripts/ScriptOutputPlaceholder"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ScriptOutputPanelProps {
    loading: boolean
    loadingGenerate: boolean
    generatedScript: string
    setGeneratedScript: (script: string) => void
    scriptTitle: string
    setScriptTitle: (title: string) => void
    onSave: () => void
    onRegenerate: () => void
}

export default function ScriptOutputPanel({
    loading,
    generatedScript,
    setGeneratedScript,
    scriptTitle,
    setScriptTitle,
    onSave,
    onRegenerate,
    loadingGenerate
}: ScriptOutputPanelProps) {
    return (
        <Card className="lg:sticky lg:top-8 min-h-[600px]">
            <CardHeader>
                <CardTitle>Your Script</CardTitle>
                <CardDescription>
                    Review, edit, and save your generated script here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {generatedScript ? (
                    <ScriptEditor
                        script={generatedScript}
                        setScript={setGeneratedScript}
                        title={scriptTitle}
                        setTitle={setScriptTitle}
                        size={"400"}
                        animation={true}
                    />
                ) : (
                    <ScriptOutputPlaceholder loading={loadingGenerate} />
                )}
            </CardContent>
            {generatedScript && (
                <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                        Regenerating will also cost{" "}
                        <span className="font-medium">1 credit</span>.
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={onRegenerate}
                            disabled={loadingGenerate}
                            className="flex-1 sm:flex-none"
                        >
                            Regenerate
                        </Button>
                        <Button
                            onClick={onSave}
                            className="bg-slate-900 hover:bg-slate-800 text-white flex-1 sm:flex-none"
                            disabled={loadingGenerate}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}