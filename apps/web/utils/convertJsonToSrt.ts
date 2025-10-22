interface SubtitleEntry {
    start: string;
    end: string;
    text: string;
}

export function convertJsonToSrt(subtitles: SubtitleEntry[]): string {
    return subtitles
        .map((entry, index) => {

            const srtStart = entry.start.replace('.', ',');
            const srtEnd = entry.end.replace('.', ',');
            const indexNumber = index + 1;

            return `${indexNumber}\n${srtStart} --> ${srtEnd}\n${entry.text}`;
        })
        .join('\n\n'); 
}
