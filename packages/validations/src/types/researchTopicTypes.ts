import { LucideIcon } from "lucide-react";

export interface ResearchTopic {
  id: string;
  topic: string;
  context?: string;
  created_at: string;
  research_data: ResearchData;
}

export interface ResearchData {
  summary: string;
  keyPoints: string[];
  trends: string[];
  questions: string[];
  contentAngles: string[];
  sources: string[];
}

export interface ResultSection {
  id: keyof ResearchData;
  title: string;
  icon: LucideIcon;
  data: string[];
}