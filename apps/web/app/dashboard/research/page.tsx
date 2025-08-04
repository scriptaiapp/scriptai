"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Search, Plus, Trash2, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";

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
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Topics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all your researched topics
          </p>
        </div>
        <Link href="/dashboard/research/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder="Search topics..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent"></div>
        </div>
      ) : filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800/30 p-2 rounded-md">
                      <BookOpen className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{topic.topic}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                          {new Date(topic.created_at).toLocaleDateString()}
                        </span>
                        {topic.context && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                            {topic.context.slice(0, 20) + (topic.context.length > 20 ? "..." : "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Link href={`/dashboard/research/${topic.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setTopicToDelete(topic.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your topic.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setTopicToDelete(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteTopic}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="font-semibold mb-2">No topics found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No topics matching "${searchQuery}". Try a different search term.`
                : "You haven't researched any topics yet. Create your first topic to get started."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/research/new">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Topic
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}