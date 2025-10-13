"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { MButton } from "@/components/ui/moving-border"
import { SparklesCore } from "@/components/ui/sparkles"
import { AlertTriangle, Home as HomeIcon } from "lucide-react"
import {MotionDiv} from "@/components/MotionComponents/MotionDiv";
import {MotionH1} from "@/components/MotionComponents/MotionH1";
import { MotionP } from "@/components/MotionComponents/MotionP"

// This is the core component that uses the search parameters.
// It needs to be a client component.
function ErrorContent() {
    const searchParams = useSearchParams()
    const errorMessage = searchParams.get('message') || "An unexpected error occurred. Please try again later."
    const errorCode = searchParams.get('code') || "500"

    // Re-using the animation variants from your Home page for consistency.
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 12,
            },
        },
    }

    return (
        <main className="flex-1 w-full h-screen">
            <section className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-white to-red-50 overflow-hidden">
                {/* Background decorative elements */}
                <div aria-hidden="true" className="absolute inset-0 -z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-red-100/50 rounded-full blur-3xl" />
                    <SparklesCore
                        background="transparent"
                        minSize={0.2}
                        maxSize={0.8}
                        className="absolute inset-0 w-full h-full z-0"
                        particleColor="#f43f5e" // Rose color for error theme
                        particleDensity={30}
                    />
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 text-center relative z-10">
                    <MotionDiv
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center justify-center space-y-6"
                    >
                        <MotionDiv variants={itemVariants}>
                            <AlertTriangle className="h-16 w-16 text-red-500" />
                        </MotionDiv>

                        <MotionP
                            variants={itemVariants}
                            className="font-semibold text-xl text-red-600"
                        >
                            Error {errorCode}
                        </MotionP>

                        <MotionH1
                            variants={itemVariants}
                            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight"
                        >
                            Oops! Something went wrong.
                        </MotionH1>

                        <MotionP
                            variants={itemVariants}
                            className="max-w-2xl text-lg text-slate-700"
                        >
                            {errorMessage}
                        </MotionP>

                        <MotionDiv variants={itemVariants}>
                            <Link href="/">
                                <MButton
                                    size="lg"
                                    className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                                    borderClassName="border border-red-500/60"
                                >
                                    <HomeIcon className="mr-2 h-4 w-4" />
                                    Go Back Home
                                </MButton>
                            </Link>
                        </MotionDiv>
                    </MotionDiv>
                </div>
            </section>
        </main>
    )
}

// The main page export. We wrap the content in a Suspense boundary
// because useSearchParams can cause the component to suspend while
// the client-side router is ready. This is a best practice.
export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}