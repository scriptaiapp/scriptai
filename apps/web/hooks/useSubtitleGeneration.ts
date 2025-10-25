import { useState } from 'react';
import { toast } from 'sonner';
import { useSupabase } from "@/components/supabase-provider";
export function useSubtitleGeneration(
    id: string,
    videoDuration: number | null,
    refetchData: () => Promise<void>
) {
    const [isGenerating, setIsGenerating] = useState(false);
    const{user, fetchUserProfile} = useSupabase();

    const handleGenerate = async (language: string, targetLanguage: string) => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/subtitle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    duration: videoDuration,
                    language: language,
                    targetLanguage: targetLanguage,
                    subtitleId: id,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Subtitle generation failed to start.');
            }
            toast.success('Subtitle generation started! Refreshing data...');
            await refetchData();
            await fetchUserProfile(user?.id as string)

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        handleGenerate,
    };
}