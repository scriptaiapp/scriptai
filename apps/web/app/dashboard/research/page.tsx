"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
import { ContentCard } from "@/components/dashboard/common/ContentCard";
import ContentCardSkeleton from "@/components/dashboard/common/skeleton/ContentCardSkeleton";
import { EmptySvg } from "@/components/dashboard/common/EmptySvg";
import { motion } from "motion/react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // This creates the staggered effect. Each child will animate 0.07s after the previous one.
      staggerChildren: 0.07,
    },
  },
};

export default function Topics() {
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch("/api/research-topic", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },


        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch topics");
        }

        const data = await response.json();
        setTopics(data || []);
      } catch (error: any) {
        toast.error("Error fetching topics", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;

    try {
      const response = await fetch(`/api/research-topic/${topicToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete topic");
      }

      setTopics(topics.filter((topic) => topic.id !== topicToDelete));
      toast.success("Topic deleted", {
        description: "Your topic has been deleted successfully.",
      });
    } catch (error: any) {
      toast.error("Error deleting topic", {
        description: error.message,
      });
    } finally {
      setTopicToDelete(null);
    }
  };

  const filteredTopics = topics.filter((topic) =>
    topic.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 md:py-12">
      {/* SECTION: Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            My Topics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and explore all your researched topics in one place.
          </p>
        </div>
        <Link href="/dashboard/research/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white transition-all hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10">
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Button>
        </Link>
      </div>

      {/* SECTION: Search and Filters */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search topics by name or context..."
            className="pl-12 py-6 text-base focus:border-purple-500" // Larger input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* SECTION: Content Area */}
      {loading ? (
        <ContentCardSkeleton />
      ) : filteredTopics.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredTopics.map((topic) => (
            <motion.div
              key="script-list"
              className="grid grid-cols-1 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >

              <ContentCard key={topic.id} id={topic.id} title={topic.topic} created_at={topic.created_at} onDelete={handleDeleteTopic} setToDelete={setTopicToDelete} type="research" />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-20">
          <div className="flex flex-col items-center">
            {/* Placeholder for illustration */}
            <EmptySvg className="h-32 w-auto mb-6 text-slate-300 dark:text-slate-700" />
            <h3 className="font-semibold text-xl text-slate-800 dark:text-slate-200 mb-2">
              {searchQuery ? "No topics found" : "Start a New Topic"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any topics matching "${searchQuery}".`
                : "Your research journey begins here. Create your first topic to get started."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/research/new">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Create topic
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
