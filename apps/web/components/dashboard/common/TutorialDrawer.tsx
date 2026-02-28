"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Lightbulb, PenTool, Search, Bot, Youtube, Settings, Play, Clapperboard, Layers, BarChart2, Sparkles, Image, MessageSquare, Upload, Palette, Download, Languages, Wand2, Type } from "lucide-react"
import { StepperGuide, GuideStep } from "./StepperGuide";


interface TutorialDrawerProps {
    isSidebarOpen: boolean;
}


const TUTORIAL_DATA: Record<string, { title: string, description: string, steps: GuideStep[] }> = {
    "/dashboard/train": {
        title: "AI Studio Guide",
        description: "Learn how to train your personalized AI model.",
        steps: [
            { title: "Connect Channel", desc: "Link your YouTube account securely.", icon: Youtube },
            { title: "Select Videos", desc: "Pick 3-5 videos that best represent your speaking style.", icon: Play },
            { title: "AI Analysis", desc: "Our AI extracts your vocabulary, tone, and pacing.", icon: Bot },
        ]
    },
    "/dashboard/scripts/new": {
        title: "Script Generation",
        description: "How to generate a viral script in seconds.",
        steps: [
            { title: "Describe Your Idea", desc: "Enter your video topic and any additional context. Pick a quick template or write your own prompt.", icon: Lightbulb },
            { title: "Customize Style", desc: "Choose tone, language, duration, and formatting options. The AI adapts to your channel's trained style.", icon: Settings },
            { title: "Generate & Edit", desc: "AI writes a full script personalized to your voice. Edit, export as PDF, copy, or regenerate.", icon: PenTool },
        ]
    },
    "/dashboard/scripts": {
        title: "My Scripts",
        description: "Manage and refine your generated scripts.",
        steps: [
            { title: "Browse Scripts", desc: "View all your previously generated scripts in one place.", icon: Lightbulb },
            { title: "Open & Edit", desc: "Click any script to open the full editor and make changes.", icon: PenTool },
            { title: "Export or Delete", desc: "Download as PDF or remove scripts you no longer need.", icon: Settings },
        ]
    },
    "/dashboard/research/new": {
        title: "Generate Ideas",
        description: "How to generate high-potential video ideas.",
        steps: [
            { title: "Configure Search", desc: "Toggle Auto Mode or define your specific Niche Focus to target ideas.", icon: Search },
            { title: "Set Context", desc: "Provide any additional context and choose how many ideas you want.", icon: Settings },
            { title: "AI Generation", desc: "Our AI analyzes trends and your channel DNA to generate fresh ideas.", icon: Bot },
        ]
    },
    "/dashboard/research": {
        title: "Ideation & Research",
        description: "How to find winning video ideas.",
        steps: [
            { title: "Enter Niche", desc: "Type in your broad topic or channel niche.", icon: Search },
            { title: "Analyze Trends", desc: "Our AI scans current trends and search volume.", icon: BarChart2 },
            { title: "Pick a Winner", desc: "Select a high-scoring idea and push it directly to a script.", icon: Lightbulb },
        ]
    },
    "/dashboard/story-builder": {
        title: "Story Builder Guide",
        description: "How to structure a captivating narrative.",
        steps: [
            { title: "The Hook", desc: "Start with a strong hook to grab attention in the first 5 seconds.", icon: Clapperboard },
            { title: "The Conflict", desc: "Introduce the main problem or challenge.", icon: Layers },
            { title: "The Resolution", desc: "Deliver the payoff and your call to action.", icon: Play },
        ]
    },
    "/dashboard/thumbnails": {
        title: "Thumbnail Generator",
        description: "Create scroll-stopping thumbnails with AI.",
        steps: [
            { title: "Upload or Describe", desc: "Upload a reference image or describe the look you want.", icon: Upload },
            { title: "AI Generation", desc: "Our AI creates multiple thumbnail variants for you to choose from.", icon: Wand2 },
            { title: "Customize & Export", desc: "Tweak colors, text overlays, and download in the perfect resolution.", icon: Palette },
        ]
    },
    "/dashboard/subtitles": {
        title: "Subtitle Generator",
        description: "Generate accurate subtitles and captions effortlessly.",
        steps: [
            { title: "Upload Media", desc: "Upload your video or audio file for transcription.", icon: Upload },
            { title: "Auto-Transcribe", desc: "AI generates timestamped subtitles with high accuracy.", icon: Type },
            { title: "Translate & Export", desc: "Translate into multiple languages and download as SRT or VTT.", icon: Languages },
        ]
    },
    // The fallback tutorial if they are on the main dashboard or a page without a specific guide
    "default": {
        title: "Welcome to Creator AI",
        description: "Your all-in-one content creation engine.",
        steps: [
            { title: "Train Your AI", desc: "Go to AI Studio and let the system learn your style.", icon: Bot },
            { title: "Find Ideas", desc: "Use Ideation to find high-performing topics.", icon: Search },
            { title: "Create Content", desc: "Generate scripts, thumbnails, and subtitles instantly.", icon: Sparkles },
        ]
    }
}

export function TutorialDrawer({ isSidebarOpen }: TutorialDrawerProps) {
    const pathname = usePathname();

    const currentTutorialKey = Object.keys(TUTORIAL_DATA).find(key => pathname.includes(key)) || "default";
    const tutorial = TUTORIAL_DATA[currentTutorialKey];

    return (
        <Sheet>
            <SheetTrigger asChild>

                <motion.button
                    title={!isSidebarOpen ? "Quick Tutorials" : undefined}
                    className={cn(
                        "flex items-center group relative overflow-hidden cursor-pointer",
                        "bg-gradient-to-br from-[#347AF9]/10 to-purple-500/10",
                        "border border-[#347AF9]/20 hover:border-[#347AF9]/50",
                        "hover:shadow-[0_0_15px_rgba(52,122,249,0.15)]",
                        "text-slate-800 dark:text-slate-200",
                        "mb-4 w-full"
                    )}
                    animate={{
                        paddingLeft: isSidebarOpen ? 12 : 0,
                        paddingRight: isSidebarOpen ? 12 : 0,
                        paddingTop: isSidebarOpen ? 12 : 8,
                        paddingBottom: isSidebarOpen ? 12 : 8,
                        borderRadius: isSidebarOpen ? 12 : 20,
                        gap: isSidebarOpen ? 12 : 0,
                    }}
                    initial={false}
                    transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                >
                    <div className="relative flex items-center justify-center shrink-0 mx-auto"
                        style={{ marginLeft: isSidebarOpen ? 0 : 'auto', marginRight: isSidebarOpen ? 0 : 'auto' }}
                    >

                        <div className="absolute inset-0 bg-[#347AF9] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                        <Lightbulb className="h-5 w-5 text-[#347AF9] relative z-10 group-hover:scale-110 transition-transform" />
                    </div>


                    <motion.div
                        className="flex flex-col items-start overflow-hidden text-left whitespace-nowrap"
                        animate={{
                            width: isSidebarOpen ? "auto" : 0,
                            opacity: isSidebarOpen ? 1 : 0,
                        }}
                        initial={false}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                            opacity: { duration: isSidebarOpen ? 0.3 : 0.15 },
                        }}
                    >
                        <span className="text-sm font-bold">Quick Tutorials</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Page Guide</span>
                    </motion.div>
                </motion.button>
            </SheetTrigger>


            <SheetContent side="right" className="w-full sm:max-w-md border-l-slate-100 dark:border-l-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-0">
                <div className="p-6 h-full flex flex-col overflow-y-auto">

                    <SheetHeader className="mb-8 text-left">
                        <div className="h-12 w-12 rounded-2xl bg-[#347AF9]/10 flex items-center justify-center mb-4 border border-[#347AF9]/20">
                            <Lightbulb className="h-6 w-6 text-[#347AF9]" />
                        </div>
                        <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            {tutorial?.title}
                        </SheetTitle>
                        <SheetDescription className="text-base text-slate-500">
                            {tutorial?.description}
                        </SheetDescription>
                    </SheetHeader>


                    <div className="flex-1">
                        <StepperGuide
                            title="Step-by-step Guide"
                            steps={tutorial ? tutorial.steps : []}
                            defaultOpen={true}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-center text-slate-400">
                            Need more help? <a href="mailto:support@creatorai.com" className="text-[#347AF9] hover:underline font-semibold">Contact Support</a>
                        </p>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    )
}