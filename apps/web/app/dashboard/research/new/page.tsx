"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import RecentTopicsList from "@/components/dashboard/research/RecentTopicsList";
import ResearchForm from "@/components/dashboard/research/ResearchForm";
import ResearchResults from "@/components/dashboard/research/ResearchResults";
import { ResearchTopic } from "@repo/validation/src/types/researchTopicTypes";

export default function NewTopicPage() {
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchTopic | null>(null);
  const [activeTab, setActiveTab] = useState("research");

  const handleResearchTopic = async (data: { topic: string; context: string; autoResearch: boolean }) => {
    setIsResearching(true);
    try {
      const response = await fetch("/api/research-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: data.autoResearch ? undefined : data.topic,
          context: data.context,
          autoResearch: data.autoResearch,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to research topic");
      }

      const result = await response.json();
      setResearchResult({
        id: result.id,
        topic: result.topic,
        context: data.context,
        created_at: new Date().toISOString(),
        research_data: result.research,
      });

      toast.success("Research complete!", {
        description: `Successfully researched: ${result.topic}`,
      });

      setActiveTab("results");
    } catch (error: any) {
      toast.error("Error researching topic", { description: error.message });
    } finally {
      setIsResearching(false);
    }
  };

  const handleResearchNew = () => {
    setResearchResult(null);
    setActiveTab("research");
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Topic Research</h1>
        <p className="text-muted-foreground mt-1">Research topics for your YouTube videos with AI assistance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="research">Research Topic</TabsTrigger>
          <TabsTrigger value="results" disabled={!researchResult}>Research Results</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ResearchForm
                isResearching={isResearching}
                onResearch={handleResearchTopic}
              />
            </div>
            <div>
              <RecentTopicsList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {researchResult && (
            <ResearchResults
              result={researchResult}
              onResearchNew={handleResearchNew}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}