import { configureFFmpeg } from "@/utils/ffmpegConfig";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ff = configureFFmpeg();


export async function extractAudioFromBuffer(buffer: Buffer, fileName: string): Promise<Buffer> {
    const tmpDir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "tmp");

    // Ensure temp directory exists
    await fs.mkdir(tmpDir, { recursive: true });

    const uniqueId = crypto.randomUUID();
    const videoPath = path.join(tmpDir, `${uniqueId}-${fileName}`);
    const audioPath = path.join(tmpDir, `${uniqueId}-audio.flac`);

    try {
        // 1️⃣ Save video buffer to temp file
        await fs.writeFile(videoPath, buffer);

        // 2️⃣ Extract + clean audio with FFmpeg
        await new Promise<void>((resolve, reject) => {
            ff(videoPath)
                .output(audioPath)
                .noVideo()
                .audioCodec("flac") // lossless, smaller than WAV
                .audioFilter([
                    "highpass=f=200",
                    "lowpass=f=3000",
                    "afftdn=nf=-25",
                    "loudnorm=I=-16:TP=-1.5"
                ])
                .on("end", () => resolve())
                .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
                .run();
        });

        // 3️⃣ Read processed audio
        const audioBuffer = await fs.readFile(audioPath);
        return audioBuffer;

    } catch (error) {
        console.error("Error during audio extraction:", error);
        throw error;

    } finally {
        // 4️⃣ Cleanup temp files
        await new Promise((res) => setTimeout(res, 100)); // small delay for file release
        for (const filePath of [videoPath, audioPath]) {
            try {
                await fs.unlink(filePath);
                console.log(`Deleted temp file: ${filePath}`);
            } catch (e: any) {
                if (e.code !== "ENOENT") {
                    console.warn(`⚠ Failed to delete ${filePath}:`, e.message);
                }
            }
        }
    }
}
