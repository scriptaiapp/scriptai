import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SubtitleResponse, SubtitleLine } from "@repo/validation/src/types/SubtitleTypes";

export function useSubtitleData(id: string) {
    const [subtitleData, setSubtitleData] = useState<SubtitleResponse | null>(null);
    const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/subtitle/${id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch subtitle data. Job not found.');
            }
            const data: SubtitleResponse = await res.json();
            setSubtitleData(data);

            let parsedSubtitles: SubtitleLine[] = [];
            if (data.subtitles_json) {
                try {
                    parsedSubtitles = JSON.parse(data.subtitles_json as string);
                } catch (e) {
                    console.error("Failed to parse subtitle_json", e);
                    toast.error("Failed to read existing subtitles. They may be corrupt.");
                }
            }
            setSubtitles(Array.isArray(parsedSubtitles) ? parsedSubtitles : []);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchData();
    }, [id]);

    return {
        subtitleData,
        subtitles,
        setSubtitles,
        isLoading,
        error,
        refetch: fetchData,
    };
}