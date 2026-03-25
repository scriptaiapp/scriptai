import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import { existsSync } from 'fs';

export const configureFFmpeg = () => {
    const envFfmpegPath = process.env.FFMPEG_PATH;
    const resolvedFfmpegPath =
        (envFfmpegPath && existsSync(envFfmpegPath) && envFfmpegPath) ||
        (ffmpegPath && existsSync(ffmpegPath) && ffmpegPath) ||
        'ffmpeg';

    const envFfprobePath = process.env.FFPROBE_PATH;
    const resolvedFfprobePath =
        (envFfprobePath && existsSync(envFfprobePath) && envFfprobePath) ||
        (ffprobePath.path && existsSync(ffprobePath.path) && ffprobePath.path) ||
        'ffprobe';

    ffmpeg.setFfmpegPath(resolvedFfmpegPath);
    ffmpeg.setFfprobePath(resolvedFfprobePath);

    return (input?: string) => ffmpeg(input);
};
