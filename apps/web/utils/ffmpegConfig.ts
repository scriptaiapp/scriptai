import ffmpeg from "fluent-ffmpeg";

export const configureFFmpeg = () => {
    const ffmpegPath = process.env.VERCEL
        ? "/usr/bin/ffmpeg"
        : "ffmpeg";

    ffmpeg.setFfmpegPath(ffmpegPath);
    return ffmpeg;
};
