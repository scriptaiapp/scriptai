"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, Play, Download, Clock } from "lucide-react";

interface DubbedResult {
  projectId: string;
  dubbedUrl: string;
  targetLanguage: string;
}

export default function NewDubbing() {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [dubbedResult, setDubbedResult] = useState<DubbedResult | null>(null);
  const isComingSoon = false;

  // Supported languages from ElevenLabs Dubbing API
  const supportedLanguages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "hi", label: "Hindi" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "pt", label: "Portuguese" },
    { value: "pl", label: "Polish" },
    { value: "ru", label: "Russian" },
    { value: "nl", label: "Dutch" },
    { value: "tr", label: "Turkish" },
    { value: "sv", label: "Swedish" },
    { value: "id", label: "Indonesian" },
    { value: "fil", label: "Filipino" },
    { value: "uk", label: "Ukrainian" },
    { value: "el", label: "Greek" },
    { value: "cs", label: "Czech" },
    { value: "fi", label: "Finnish" },
    { value: "ro", label: "Romanian" },
    { value: "da", label: "Danish" },
    { value: "bg", label: "Bulgarian" },
    { value: "ms", label: "Malay" },
    { value: "sk", label: "Slovak" },
    { value: "hr", label: "Croatian" },
    { value: "ar", label: "Arabic" },
    { value: "ta", label: "Tamil" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComingSoon) return; // Prevent interaction when coming soon
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error("File too large", {
          description: "Please upload an audio file smaller than 500MB.",
        });
        return;
      }
      setAudioFile(file);
    }
  };

  const handleDubAudio = async () => {
    if (isComingSoon) return; // Prevent interaction when coming soon
    if (!audioFile) {
      toast.error("No audio file", {
        description: "Please upload an audio file to dub.",
      });
      return;
    }
    if (!targetLanguage) {
      toast.error("No language selected", {
        description: "Please select a target language.",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("targetLanguage", targetLanguage);

      const response = await fetch("/api/dubbing", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to dub audio");
      }

      const data = await response.json();
      setDubbedResult({
        projectId: data.projectId,
        dubbedUrl: data.dubbedUrl,
        targetLanguage,
      });

      toast.success("Dubbing complete!", {
        description: `Your audio has been dubbed into ${supportedLanguages.find(lang => lang.value === targetLanguage)?.label}.`,
      });
    } catch (error: any) {
      toast.error("Error dubbing audio", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Audio Dubbing</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload an audio file and dub it into another language with AI, preserving tone and style.
        </p>
      </div>

      <Card className="relative">
        <CardHeader>
          <CardTitle>Dub Your Audio</CardTitle>
          <CardDescription>Translate your audio into one of 29 languages while keeping the original voice characteristics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="audio-upload">Upload Audio File</Label>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={loading || isComingSoon}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload an MP3 or WAV file (max 500MB, 45 minutes).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-language">Target Language</Label>
            <Select
              value={targetLanguage}
              onValueChange={setTargetLanguage}
              disabled={loading || isComingSoon}
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
              Choose the language to dub your audio into.
            </p>
          </div>

          {dubbedResult && (
            <div className="space-y-2">
              <Label>Dubbed Audio</Label>
              <div className="flex items-center gap-4">
                <audio controls src={dubbedResult.dubbedUrl} className="w-full max-w-md">
                  Your browser does not support the audio element.
                </audio>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={isComingSoon}
                >
                  <a href={dubbedResult.dubbedUrl} download={`dubbed_audio_${dubbedResult.targetLanguage}.mp3`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/topics")}
            disabled={isComingSoon}
          >
            Back to Topics
          </Button>
          <Button
            onClick={handleDubAudio}
            className="bg-slate-950 hover:bg-slate-900 text-white"
            disabled={loading || !audioFile || !targetLanguage || isComingSoon}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Dubbing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Dub Audio
              </>
            )}
          </Button>
        </CardFooter>

        {isComingSoon && (
          <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <Clock className="h-12 w-12 mx-auto text-slate-500 dark:text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Coming Soon
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                Stay tuned to unlock this exciting feature to dub your voce into 29 languages and reach global audience!
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/topics")}
                className="bg-slate-950 hover:bg-slate-900 text-white"
              >
                Back to Topics
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}