"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, Youtube } from "lucide-react"
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
    isRequested,
}: {
    open: boolean
    onClose: () => void
    isRequested: boolean
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
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Youtube className="h-8 w-8 text-red-500" />
                        <span className="text-2xl font-semibold">Connect Channel</span>
                    </div>
                    <DialogTitle className="text-center text-xl">
                        {isRequested ? "Access Request Pending" : "Admin Approval Required"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {isRequested
                            ? "You have already requested access to connect your YouTube channel. Please wait for admin approval."
                            : "Your workspace requires admin approval to connect new channels."}
                    </DialogDescription>
                </DialogHeader>

                <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>{isRequested ? "Awaiting Approval" : "What Happens Next?"}</AlertTitle>
                    <AlertDescription>
                        {isRequested
                            ? "Your request has been sent to the admin. You'll receive an email notification once approved."
                            : "A request will be sent to your admin. You'll be notified by email once your request has been approved."}
                    </AlertDescription>
                </Alert>

                <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Close
                    </Button>
                    {!isRequested && (
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
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}