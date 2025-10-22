import { configureFFmpeg } from "@/utils/ffmpegConfig";
import fs from "fs/promises"; // Use promises-based fs
import path from 'path';
import crypto from 'crypto';

const ff = configureFFmpeg();

export async function extractAudio(file: File): Promise<Buffer> {
    const tmpDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'tmp');

    // Ensure temp directory exists
    try {
        await fs.mkdir(tmpDir, { recursive: true });
    } catch (e) {
        console.error("Failed to create tmp directory", e);
    }

    const uniqueId = crypto.randomUUID();
    const videoPath = path.join(tmpDir, `${uniqueId}-${file.name}`);

    // Suggestion: Use FLAC for a good balance of size and quality
    // It's lossless and smaller than WAV.
    const audioPath = path.join(tmpDir, `${uniqueId}-audio.flac`);

    try {
        // 1. Write video file
        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(videoPath, Buffer.from(arrayBuffer));

        // 2. Run FFmpeg
        await new Promise<void>((resolve, reject) => {
            ff(videoPath)
                .output(audioPath)
                .noVideo()
                // .audioCodec("pcm_s16le") // This is WAV (large)
                .audioCodec("flac")         // Use FLAC (lossless, smaller)
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

        // 3. Read audio file
        const audioBuffer = await fs.readFile(audioPath);
        return audioBuffer;

    } catch (error) {
        console.error("Error during audio extraction:", error);
        throw error; // Re-throw the error to be caught by the API route

    } finally {
        // 4. GUARANTEED CLEANUP
        // This 'finally' block runs whether the 'try' succeeds or fails.
        // We use 'await' to ensure cleanup completes before the function returns.
        try {
            await fs.unlink(videoPath);
        } catch (e) {
            console.warn(`Failed to delete temp video file: ${videoPath}`, e);
        }
        try {
            await fs.unlink(audioPath);
        } catch (e) {
            console.warn(`Failed to delete temp audio file: ${audioPath}`, e);
        }
    }
}