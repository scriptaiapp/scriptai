"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Play, Download, Clock, UploadCloud, RefreshCw } from "lucide-react";
import { useDubbing } from "@/hooks/useDubbing";
import { supportedLanguages } from "@repo/validation";

export default function NewDubbing() {
  const router = useRouter();
  const {
    fileInputRef,
    mediaFile,
    isVideo,
    targetLanguage,
    setTargetLanguage,
    dubbedResult,
    progress,
    isLoading,
    handleFileChange,
    resetForm,
    handleDubMedia,
  } = useDubbing();

  return (
    <div className="container py-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Dubbing</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload an audio or video file and dub it into another language with AI, preserving tone and style.
        </p>
      </div>

      <Card className="relative">
        <CardHeader>
          <CardTitle>Dub Your Media</CardTitle>
          <CardDescription>Translate your audio or video into one of 29 languages while keeping the original voice characteristics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="media-upload">Upload Audio or Video File</Label>
              {progress.state === "failed" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetForm}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Try Again</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              ref={fileInputRef}
              id="media-upload"
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload MP3, WAV, MP4, or MOV (max 500MB, 45 minutes).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-language">Target Language</Label>
            <Select
              value={targetLanguage}
              onValueChange={setTargetLanguage}
              disabled={isLoading}
            >
              <SelectTrigger id="target-language">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose the language to dub your media into.
            </p>
          </div>

          {progress.state !== "idle" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress.state === "uploading" && <UploadCloud className="h-4 w-4" />}
                  {progress.state === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span className="text-sm font-medium">{progress.message}</span>
                </div>
                <span className="text-sm text-slate-500">{Math.round(progress.progress)}%</span>
              </div>
              <Progress value={progress.progress} className="w-full h-2" />
            </div>
          )}

          {dubbedResult && (
            <div className="space-y-2">
              <Label>Dubbed Media</Label>
              <div className="flex items-center gap-4">
                {isVideo ? (
                  <video controls src={dubbedResult.dubbedUrl} className="w-full max-w-md h-32 rounded-lg">
                    Your browser does not support the video element.
                  </video>
                ) : (
                  <audio controls src={dubbedResult.dubbedUrl} className="w-full max-w-md">
                    Your browser does not support the audio element.
                  </audio>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={dubbedResult.dubbedUrl}
                    download={`dubbed_${isVideo ? "video" : "audio"}_${dubbedResult.targetLanguage}.${isVideo ? "mp4" : "mp3"}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleDubMedia}
            className="bg-slate-950 hover:bg-slate-900 text-white"
            disabled={isLoading || !mediaFile || !targetLanguage || progress.state === "completed"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Dub
              </>
            )}
          </Button>
        </CardFooter>

      </Card>
    </div>
  );
}