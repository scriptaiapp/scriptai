export interface SubtitleLine {
    start: string;
    end: string;
    text: string;
}

export class UpdateSubtitleDto {
    subtitle_json: SubtitleLine[];
    subtitle_id: string;
}
