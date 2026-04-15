"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Download, FileText, FileJson, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { downloadBlob } from "@/lib/download";
import { useCurrentPlan } from "@/hooks/useCurrentPlan";
import PremiumGateModal from "./PremiumGateModal";

interface IdeationExportMenuProps {
  ideationId: string;
}

export default function IdeationExportMenu({ ideationId }: IdeationExportMenuProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const { isStarter } = useCurrentPlan();

  const openPremiumModal = () => {
    setDropdownOpen(false);
    setTimeout(() => setPremiumModalOpen(true), 0);
  };

  const handleExportPdf = async () => {
    if (isStarter) { openPremiumModal(); return; }
    setExporting("pdf");
    try {
      const blob = await api.get<Blob>(`/api/v1/ideation/${ideationId}/export/pdf`, {
        requireAuth: true,
        responseType: "blob",
      });
      downloadBlob(blob, `ideation_${ideationId}.pdf`);
      toast.success("PDF exported");
    } catch {
      toast.error("PDF export failed");
    } finally {
      setExporting(null);
    }
  };

  const handleExportJson = async () => {
    if (isStarter) { openPremiumModal(); return; }
    setExporting("json");
    try {
      const data = await api.get<any>(`/api/v1/ideation/${ideationId}/export/json`, {
        requireAuth: true,
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      downloadBlob(blob, `ideation_${ideationId}.json`);
      toast.success("JSON exported");
    } catch {
      toast.error("JSON export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={!!exporting} className="relative">
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Download className="h-4 w-4 mr-1.5" />
            )}
            Export
            {isStarter && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm">
                <Lock className="h-2 w-2 text-white" />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" /> Export as PDF
            {isStarter && <Sparkles className="ml-auto h-3.5 w-3.5 text-purple-500" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJson} className="cursor-pointer">
            <FileJson className="mr-2 h-4 w-4" /> Export as JSON
            {isStarter && <Sparkles className="ml-auto h-3.5 w-3.5 text-purple-500" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PremiumGateModal
        open={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        featureLabel="Exporting ideation results"
      />
    </>
  );
}
