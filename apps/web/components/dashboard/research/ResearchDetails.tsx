"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Loader2,
  BookOpen,
  TrendingUp,
  HelpCircle,
  Lightbulb,
  Link as LinkIcon,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import ResearchDetailsSkeleton from "./skeleton/ResearchDetailsSkeleton"

type ResearchData = {
  summary: string
  keyPoints: string[]
  trends: string[]
  questions: string[]
  contentAngles: string[]
  sources: string[]
}

type Research = {
  id: string
  topic: string
  context?: string
  created_at: string
  research_data: ResearchData
}

interface ResearchDetailsProps {
  loading: boolean
  research: Research | null
}

export default function ResearchDetails({ loading, research }: ResearchDetailsProps) {
  const router = useRouter()

  if (loading) {
    return (
        <ResearchDetailsSkeleton />
    )
  }

  if (!research) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
          <Card className="text-center py-16 px-6 border-dashed dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 max-w-2xl mx-auto">
            <div className="flex flex-col items-center max-w-lg mx-auto">
              <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-6" />
              <h3 className="font-semibold text-xl mb-2 text-slate-800 dark:text-slate-200">
                Topic Not Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                The requested topic could not be found. It may have been deleted or
                you don't have access.
              </p>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={() => router.push("/dashboard/research")}
                >
                  Back to Topics
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
    )
  }

  const accordionSections = [
    { id: "key-points", title: "Key Points", icon: <BookOpen className="h-5 w-5" />, items: research.research_data.keyPoints },
    { id: "trends", title: "Current Trends", icon: <TrendingUp className="h-5 w-5" />, items: research.research_data.trends },
    { id: "questions", title: "Common Questions", icon: <HelpCircle className="h-5 w-5" />, items: research.research_data.questions },
    { id: "angles", title: "Content Angles", icon: <Lightbulb className="h-5 w-5" />, items: research.research_data.contentAngles },
    { id: "sources", title: "Sources", icon: <LinkIcon className="h-5 w-5" />, items: research.research_data.sources},
  ];

  return (
      <div className="container py-8 md:py-12">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">

          {/* Left Column: Main Content */}
          <main className="lg:col-span-2">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">
                Research Details
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                An in-depth look at the findings for your selected topic.
              </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-8"
            >
              <Card className="border dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn("prose dark:prose-invert max-w-none")}>
                    <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => (
                              <span className="font-bold text-purple-600 dark:text-purple-400" {...props} />
                          ),
                          em: ({ node, ...props }) => (
                              <span className="italic text-slate-500 dark:text-slate-400" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                              <p
                                  className="text-slate-600 dark:text-slate-400 leading-relaxed mb-2"
                                  {...props}
                              />
                          ),
                          a: ({ node, ...props }) => (
                              <a
                                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 break-all underline"
                                  {...props}
                              />
                          ),
                        }}
                    >
                      {research.research_data.summary}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
                    },
                  }}
              >
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {accordionSections.map(({ id, title, icon, items }) => (
                      <motion.div
                          key={id}
                          variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                          transition={{ duration: 0.4 }}
                      >
                        <Card className="border dark:border-slate-800 shadow-sm overflow-hidden">
                          <AccordionItem value={id} className="border-b-0">
                            <AccordionTrigger className="hover:no-underline group p-4">
                              <div className="flex items-center gap-3">
                            <span className="text-slate-500 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-500">
                              {icon}
                            </span>
                                <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">
                              {title}
                            </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <ul className="space-y-3 pl-6 list-none">
                                {items.map((item, i) => (
                                    <li key={i} className="relative pl-2">
                                      <span className="absolute left-[-1.25rem] top-[0.4rem] w-1.5 h-1.5 rounded-full bg-purple-500" />

                                          <div className={cn("prose dark:prose-invert max-w-none")}>
                                            <ReactMarkdown
                                                components={{
                                                  strong: ({ node, ...props }) => (
                                                      <span className="font-bold text-purple-600 dark:text-purple-400" {...props} />
                                                  ),
                                                  em: ({ node, ...props }) => (
                                                      <span className="italic text-slate-500 dark:text-slate-400" {...props} />
                                                  ),
                                                  p: ({ node, ...props }) => (
                                                      <span
                                                          className="text-slate-600 dark:text-slate-400 leading-relaxed break-words"
                                                          {...props}
                                                      />
                                                  ),
                                                  a: ({ node, ...props }) => (
                                                      <a
                                                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 break-all underline"
                                                          {...props}
                                                      />
                                                  ),
                                                  code: ({ node, ...props }) => (
                                                      <code
                                                          className="break-all"
                                                          {...props}
                                                      />
                                                  ),
                                                }}
                                            >
                                              {item}
                                            </ReactMarkdown>
                                          </div>

                                    </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Card>
                      </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            </motion.div>
          </main>

          {/* Right Sidebar for Metadata & Actions */}
          <motion.aside
              className="lg:col-span-1 lg:sticky lg:top-24 h-fit mt-8 lg:mt-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold tracking-tight break-words">
                  {research.topic}
                </CardTitle>
                <CardDescription>
                  Researched on {new Date(research.created_at).toLocaleDateString()}
                  {research.context && (
                      <span className="block mt-2 text-sm break-words">
                    <strong>Context:</strong> {research.context}
                  </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-3">
                <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.99 }}>
                  <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() => router.push(`/dashboard/scripts/new?researchId=${research.id}`)}
                  >
                    Create Script from Research
                  </Button>
                </motion.div>
                <motion.div className="w-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.99 }}>
                  <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push("/dashboard/research")}
                  >
                    Back to Topics
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.aside>

        </div>
      </div>
  )
}