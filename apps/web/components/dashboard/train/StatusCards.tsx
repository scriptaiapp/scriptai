"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UserProfile } from "@repo/validation"
// Define a clearer type for props
interface StatusCardsProps {
    profile: UserProfile | null;
    handleConnectYoutube: () => void;
    isConnectingYoutube: boolean;
}

export function StatusCards({ profile, handleConnectYoutube, isConnectingYoutube }: StatusCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${profile?.youtube_connected ? "bg-green-500" : "bg-red-500"}`}></div>
                        YouTube Connection
                    </CardTitle>
                    <CardDescription>
                        {profile?.youtube_connected ? "Your channel is connected and ready." : "Connect your channel to start."}
                    </CardDescription>
                </CardHeader>
                {!profile?.youtube_connected && (
                    <CardContent>
                        <Button onClick={handleConnectYoutube} className="w-full" disabled={isConnectingYoutube}>
                            {isConnectingYoutube ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : "Connect YouTube Channel"}
                        </Button>
                    </CardContent>
                )}
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${profile?.ai_trained ? "bg-green-500" : "bg-yellow-500"}`}></div>
                        AI Training Status
                    </CardTitle>
                    <CardDescription>
                        {profile?.ai_trained ? "Your AI has been trained." : "Ready to train your AI."}
                    </CardDescription>
                </CardHeader>
                {profile?.ai_trained && profile.training_data && (
                    <CardContent>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            <p><strong>Last trained:</strong> {new Date(profile.training_data.updated_at).toLocaleDateString()}</p>
                            <p><strong>Videos analyzed:</strong> {profile.training_data.video_urls?.length || 0}</p>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}