"use client";

import { motion } from "motion/react";
import {
  Loader2,
  BrainCircuit,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Save,
  Cpu,
} from "lucide-react";
import {
  GenerationProgress,
  type GenerationProgressStep,
} from "../common/GenerationProgress";

const IDEATION_STEPS: GenerationProgressStep[] = [
  { label: "Queued", icon: Loader2, threshold: 0 },
  { label: "Intelligence", icon: BrainCircuit, threshold: 10 },
  { label: "Trends", icon: TrendingUp, threshold: 40 },
  { label: "Synthesis", icon: Sparkles, threshold: 75 },
  { label: "Refinement", icon: ShieldCheck, threshold: 90 },
  { label: "Done", icon: Save, threshold: 100 },
];

interface IdeationProgressProps {
  progress: number;
  statusMessage: string;
}

export default function IdeationProgress({
  progress,
  statusMessage,
}: IdeationProgressProps) {
  return (
    <div className="relative">
      {/* Orbiting particles around the progress card */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1000]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand-primary rounded-full blur-[1px]"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1],
              }}
              transition={{
                rotate: {
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              style={{
                top: "50%",
                left: "50%",
                marginTop: "-4px",
                marginLeft: "-8px",
                transformOrigin: `${40 + i * 10}px ${40 + i * 10}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Shared GenerationProgress component */}
      <GenerationProgress
        progress={progress}
        statusMessage={statusMessage}
        title="AI Engine Running"
        steps={IDEATION_STEPS}
        icon={Cpu}
        hint="This may take 1-3 minutes depending on niche complexity"
      />
    </div>
  );
}