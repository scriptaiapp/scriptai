import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { configureFFmpeg } from "@/utils/ffmpegConfig";
import { fetchVideoAsBuffer } from "@/utils/videoUrlTools";
import { convertJsonToSrt } from "@/utils/convertJsonToSrt";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const { videoUrl, subtitles } = await request.json();

        if (!videoUrl || !subtitles || !Array.isArray(subtitles)) {
            return NextResponse.json(
                { error: "Missing videoUrl or subtitles" },
                { status: 400 }
            );
        }

        console.log("Starting burnSubtitle process...");
        console.log(" Video URL:", videoUrl);
        console.log(" Subtitles received:", subtitles.length);

        const videoBuffer = await fetchVideoAsBuffer(videoUrl);

        const tmpDir = path.join(os.tmpdir(), "video_processing");
        await fs.mkdir(tmpDir, { recursive: true });

        const videoPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
        const srtPath = path.join(tmpDir, `subs_${Date.now()}.srt`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.mp4`);

        await fs.writeFile(videoPath, videoBuffer);
        console.log("💾 Saved video to:", videoPath);

        const srtContent = convertJsonToSrt(subtitles);
        await fs.writeFile(srtPath, srtContent, "utf-8");

        const ffmpeg = configureFFmpeg();

        const safeSubtitlePath = srtPath
            .replace(/\\/g, "/")
            .replace(/:/g, "\\:");


        await new Promise<void>((resolve, reject) => {
            ffmpeg(videoPath)
                .outputOptions(["-c:v", "libx264", "-c:a", "copy"])
                .videoFilter(`subtitles='${safeSubtitlePath}'`)
                .on("start", (cmd) => console.log(" FFmpeg command:", cmd))
                .on("progress", (p) => console.log(`⏳ FFmpeg progress: ${p.percent?.toFixed(2)}%`))
                .on("end", () => {
                    console.log(" FFmpeg completed successfully");
                    resolve();
                })
                .on("error", (err) => {
                    console.error("Burn subtitle error:", err);
                    reject(err);
                })
                .save(outputPath);
        });

        const outputBuffer = await fs.readFile(outputPath);
        console.log(" Output video size:", outputBuffer.length);

        await Promise.allSettled([
            fs.unlink(videoPath),
            fs.unlink(srtPath),
            fs.unlink(outputPath),
        ]);

        return new NextResponse(outputBuffer, {
            status: 200,
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": "attachment; filename=video_with_subtitles.mp4",
            },
        });

    } catch (error) {
        console.error("BurnSubtitle route error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
