"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, BookOpen, LinkIcon, TrendingUp, HelpCircle, Lightbulb } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ResearchTopic {
  id: string;
  topic: string;
  context?: string;
  created_at: string;
  research_data: {
    summary: string;
    keyPoints: string[];
    trends: string[];
    questions: string[];
    contentAngles: string[];
    sources: string[];
  };
}

export default function TopicDetails() {
  const router = useRouter();
  const params = useParams();
  const researchId = params.id as string;
  const [research, setResearch] = useState<ResearchTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!researchId) return;

      try {
        const response = await fetch(`/api/research-topic/${researchId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch research topic");
        }

        const data = await response.json();
        setResearch(data);
      } catch (error: any) {
        toast.error("Error fetching research topic", {
          description: error.message,
        });
        router.push("/dashboard/research"); // Redirect to topics list on error
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [researchId, router]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Topic Details</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View all research details for your selected topic
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </div>
      ) : research ? (
        <Card>
          <CardHeader>
            <CardTitle>{research.topic}</CardTitle>
            <CardDescription>
              Researched on {new Date(research.created_at).toLocaleDateString()}
              {research.context && (
                <span> | Context: {research.context.slice(0, 50) + (research.context.length > 50 ? "..." : "")}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-slate-600 dark:text-slate-400">{research.research_data.summary}</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="key-points">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-slate-500" />
                    <span>Key Points</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-6 list-disc">
                    {research.research_data.keyPoints.map((point, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400">
                        {point}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trends">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-slate-500" />
                    <span>Current Trends</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-6 list-disc">
                    {research.research_data.trends.map((trend, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400">
                        {trend}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="questions">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-slate-500" />
                    <span>Common Questions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-6 list-disc">
                    {research.research_data.questions.map((question, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400">
                        {question}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="angles">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-slate-500" />
                    <span>Content Angles</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-6 list-disc">
                    {research.research_data.contentAngles.map((angle, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400">
                        {angle}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sources">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-slate-500" />
                    <span>Sources</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-6 list-disc">
                    {research.research_data.sources.map((source, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400">
                        <a href={source} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard/research")}>
              Back to Topics
            </Button>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => router.push(`/dashboard/scripts/new?researchId=${research.id}`)}
            >
              Create Script from Research
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-semibold mb-2">Topic not found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              The requested topic could not be found. It may have been deleted or you don’t have access.
            </p>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => router.push("/dashboard/research")}
            >
              Back to Topics
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}