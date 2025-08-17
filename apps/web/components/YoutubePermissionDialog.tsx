"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, Youtube } from "lucide-react" // A popular icon library used with shadcn/ui
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useSupabase } from "./supabase-provider"
import { Alert, AlertTitle, AlertDescription } from "./ui/alert"

export function YoutubePermissionDialog({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const { user } = useSupabase()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const onConfirm = async () => {
        if (!user?.email) {
            toast.error("You must be logged in to request permission.")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch('/api/grant-youtube-access', {
                method: 'POST',
                body: JSON.stringify({ email: user.email }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                const errorMessage = errorData?.message || "Failed to request permission.";
                throw new Error(errorMessage);
            }

            toast.success("Permission requested successfully. You will be notified upon approval.");
            onClose();

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {/* 3. Use an engaging layout with an icon */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Youtube className="h-8 w-8 text-red-500" />
                        <span className="text-2xl font-semibold">Connect YouTube</span>
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Admin Approval Required
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Your workspace requires admin approval to connect new channels.
                    </DialogDescription>
                </DialogHeader>

                {/* 4. Use an Alert to clearly explain the process */}
                <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>What Happens Next?</AlertTitle>
                    <AlertDescription>
                        A request will be sent to your admin. You'll be notified by email
                        once your request has been approved.
                    </AlertDescription>
                </Alert>

                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Requesting Access...
                            </>
                        ) : (
                            "I Understand, Request Access"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

}