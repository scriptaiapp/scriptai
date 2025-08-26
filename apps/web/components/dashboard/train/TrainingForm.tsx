"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/components/supabase-provider";
import { Upload, X, Loader2, Youtube, RefreshCw } from "lucide-react";
import { SuccessDialog } from "@/components/success-dialog";
import { PenTool, Search, Volume2 } from "lucide-react";
import { useTrainingForm } from "@/hooks/useTrainingForm";
import { UserProfile } from "@repo/validation"


const NEXT_STEPS_CONFIG = [
    { title: "Create Scripts", description: "Generate scripts tailored to your style", icon: PenTool, href: "/dashboard/scripts" },
    { title: "Research Topics", description: "Explore topics aligned with your content", icon: Search, href: "/dashboard/research" },
    { title: "Audio Dubbing", description: "Create dubbed audio in multiple languages", icon: Volume2, href: "/dashboard/audio-dubbing" },
];


export function TrainingForm({ profile }: { profile: UserProfile }) {
    const { user } = useSupabase();
    const {
        videoUrls, uploading, showModal, setShowModal, handleVideoUrlChange,
        handleAddVideoUrl, handleRemoveVideoUrl, validateAndSubmit, isValidForSubmission,
    } = useTrainingForm(profile, user);

    const isRetraining = profile?.ai_trained;

    return (
        <>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>{isRetraining ? "Re-train Your AI" : "Add Your YouTube Videos"}</CardTitle>
                    <CardDescription>{isRetraining ? "Update the video list below to refine your AI's style." : "Provide 3-5 video links. More videos lead to better results."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <AnimatePresence>
                        {videoUrls.map((url, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                layout
                            >
                                <div className="relative w-full">
                                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                    <Input
                                        placeholder={`Video URL ${index + 1}`}
                                        value={url}
                                        onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                                        disabled={uploading}
                                        className="pl-10"
                                    />
                                </div>
                                {videoUrls.length > 3 && (
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveVideoUrl(index)} disabled={uploading}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {videoUrls.length < 5 && (
                        <Button variant="outline" size="sm" onClick={handleAddVideoUrl} disabled={uploading} className="mt-2">
                            Add Another Video
                        </Button>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end bg-slate-50/50 dark:bg-slate-900/50 p-4 border-t">
                    <Button
                        onClick={validateAndSubmit}
                        size="lg"
                        disabled={uploading || !profile?.youtube_connected || !isValidForSubmission}
                    >
                        {uploading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isRetraining ? "Re-training..." : "Training..."}</>
                        ) : (
                            <>{isRetraining ? <RefreshCw className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />} {isRetraining ? "Re-train AI" : "Start Training"}</>
                        )}
                    </Button>
                </CardFooter>
            </Card>
            <SuccessDialog
                open={showModal}
                onOpenChange={setShowModal}
                title="AI Training Complete!"
                description="Your AI has been successfully trained. You can now generate personalized content that matches your unique style."
                nextSteps={NEXT_STEPS_CONFIG}
            />
        </>
    );
}