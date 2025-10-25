import { useState } from 'react';
import { toast } from 'sonner';
import { SubtitleLine } from "@repo/validation/src/types/SubtitleTypes";
import { parseSRT } from '@/utils/srtUtils';

export function useSubtitleFileOperations(
    id: string,
    subtitles: SubtitleLine[],
    setSubtitles: (subtitles: SubtitleLine[]) => void,
    videoPath?: string,
    videoUrl?: string
) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!id) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/subtitle/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subtitle_json: subtitles }),
            });
            if (!res.ok) throw new Error('Save failed');
            toast.success('Saved successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        const srt = subtitles.map((s, i) =>
            `${i + 1}\n${s.start.replace('.', ',')} --> ${s.end.replace('.', ',')}\n${s.text}\n`
        ).join('\n');

        const blob = new Blob([srt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = (videoPath || 'subtitles.srt').split('/').pop()?.split('.').shift();
        a.href = url;
        a.download = `${filename}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                try {
                    const parsed = parseSRT(content);
                    if (parsed.length === 0) {
                        throw new Error("Could not find any valid subtitle blocks.");
                    }
                    setSubtitles(parsed);
                    toast.success(`Uploaded and parsed ${parsed.length} subtitle lines.`);
                } catch (err) {
                    const message = err instanceof Error ? err.message : "Unknown parsing error";
                    toast.error(`Failed to parse SRT file: ${message}`);
                }
            } else {
                toast.error("File is empty or could not be read.");
            }
        };
        reader.onerror = () => toast.error("An error occurred while reading the file.");
        reader.readAsText(file);
        e.target.value = '';
    };

    const[downloadVideoLoading, setDownloadVideoLoading] = useState(false);

    const handleDownloadVideo = async () => {
        setDownloadVideoLoading(true);
        const res = await fetch("/api/subtitle/burnSubtitle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoUrl, subtitles }),
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "video_with_subs.mp4";
        a.click();
        URL.revokeObjectURL(url);
        setDownloadVideoLoading(false);
    };

    return {
        isSaving,
        handleSave,
        handleDownload,
        handleFileUpload,
        handleDownloadVideo,
        downloadVideoLoading,
    };
}