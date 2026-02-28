"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { AITrainingRequired } from "@/components/dashboard/common/AITrainingRequired";
import { useIdeation } from "@/hooks/useIdeation";
import { ResearchForm } from "@/components/dashboard/research/ResearchForm";

export default function NewIdeationPage() {
  const router = useRouter();
  const hook = useIdeation();


  useEffect(() => {
    if (hook.generatedResult && hook.activeJobDbId) {
      router.push(`/dashboard/research/${hook.activeJobDbId}`);
    }
  }, [hook.generatedResult, hook.activeJobDbId, router]);


  if (hook.isLoadingProfile) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-[600px] rounded-[2rem] mt-6" />
      </div>
    );
  }


  const showTrainingOverlay = !hook.aiTrained;

  if (hook.generatedResult && hook.activeJobDbId) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/research")}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Generate Ideas
            </h1>
            <p className="text-sm text-slate-500">
              AI analyzes trends, your channel DNA, and niche gaps to surface
              high-potential video ideas.
            </p>
          </div>
        </div>
      </div>

      {showTrainingOverlay ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AITrainingRequired />
        </motion.div>
      ) : (
        <ResearchForm
          {...hook}
          onGenerate={hook.handleGenerate}
        />
      )}
    </div>
  );
}