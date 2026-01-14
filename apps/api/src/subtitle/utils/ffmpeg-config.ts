import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

export const configureFFmpeg = () => {
    const ffmpegPath = ffmpegInstaller.path;
    const ffprobePath = ffprobeInstaller.path;

    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    return (input?: string) => ffmpeg(input);
};

