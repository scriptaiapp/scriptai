import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {extractAudio} from "@/utils/ExtractAudio";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { GoogleGenAI } from '@google/genai';
import {convertJsonToSrt} from '@/utils/convertJsonToSrt';

async function waitForFileActive(ai: any, fileName: string, maxWaitTime = 120000) {
    const startTime = Date.now();
    const pollInterval = 3000; // Check every 3 seconds

    console.log(`Polling for file status: ${fileName}`);

    while (Date.now() - startTime < maxWaitTime) {
        try {
            const file = await ai.files.get({ name: fileName });

            console.log(`File status: ${file.state} (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);

            if (file.state === 'ACTIVE') {
                return file; 
            }
            if (file.state === 'FAILED') {
                throw new Error(`File processing failed: ${file.stateDescription}`);
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error) {
            console.error('Error checking file status:', error);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
    }
    throw new Error(`File processing timeout for ${fileName} after ${maxWaitTime / 1000}s`);
}

async function UploadVideo(file: File, newFileName: string): Promise<string> {
    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
        .from("video_subtitles")
        .upload(newFileName, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from("video_subtitles")
        .getPublicUrl(newFileName);

    return publicUrl;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    let tempFilePath: string | null = null;

    try{
        const{data: {user}} = await supabase.auth.getUser();

        if(!user){
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('video') as File;
        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        console.log('File received:', file.name, 'Size:', file.size);

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error('Google Generative AI API key is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
You are an expert, highly-accurate subtitle transcription service.
Your task is to transcribe the provided audio file and generate precise, time-stamped subtitles.

**CRITICAL RULES:**
1.  **Format:** Your entire response MUST be a valid JSON array. Do NOT include any text, headers, or markdown formatting (like \`\`\`json) before or after the array.
2.  **Timestamps:** Timestamps MUST be in the exact \`HH:MM:SS.mmm\` format (hours:minutes:seconds.milliseconds).
3.  **Punctuation:** Include correct punctuation (commas, periods, question marks) for readability.
4.  **Silence:** Do NOT generate subtitle entries for periods of silence.
5.  **Non-Speech:** (Optional) Transcribe significant non-speech sounds in brackets, e.g., [MUSIC], [LAUGHTER], [APPLAUSE].
6.  **Accuracy:** Transcribe the audio verbatim. Do not paraphrase or correct the speaker's grammar.

**Output Example:**
[
  { "start": "00:00:01.200", "end": "00:00:04.100", "text": "Hello everyone, and welcome." },
  { "start": "00:00:04.350", "end": "00:00:07.000", "text": "Today we're going to discuss..." },
  { "start": "00:00:07.100", "end": "00:00:08.000", "text": "[MUSIC]" }
]
`;

        console.log('Converting file to buffer...');
        const audioBuffer = Buffer.from(await file.arrayBuffer());
        // const audioBuffer = await extractAudio(file)
        console.log('Buffer length:', audioBuffer.length);

        tempFilePath = path.join(os.tmpdir(), `${Date.now()}_${file.name}`);
        console.log('Writing to temp file:', tempFilePath);
        await fs.writeFile(tempFilePath, audioBuffer);

        console.log('Uploading to Google AI...');
        const myFile = await ai.files.upload({
            file: tempFilePath,
            config: { mimeType: file.type },
        });

        console.log('File uploaded:', myFile);

        const waitTimeMs = Math.max(5000, Math.min(60000, (file.size / 1024 / 1024) * 1000));
        console.log(`Waiting ${Math.round(waitTimeMs / 1000)}s for file to be processed...`);


        const processedFile = await waitForFileActive(ai, myFile.name!);
        const parts = [
            { text: prompt },
            {
                fileData: {
                    fileUri: myFile.uri,
                    mimeType: myFile.mimeType
                }
            }
        ];

        console.log('Generating content...');
        let result: any;
        try {
            result = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts }],
            });
            console.log('Generation complete');
        } catch (geminiError) {
            console.error('Gemini API error:', geminiError);
            return NextResponse.json({ error: 'Failed to generate subtitles from Gemini API' }, { status: 500 });
        }

        // Clean up temp file
        if (tempFilePath) {
            await fs.unlink(tempFilePath).catch(err =>
                console.error('Failed to delete temp file:', err)
            );
        }

        console.log(result.text);

        let subtitlesJson;
        try {
            const rawText = result.text;
            const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            subtitlesJson = JSON.parse(cleanedText);

        } catch (parseError) {
            console.error('Failed to parse JSON from Gemini:', parseError, "Raw text:", result.text);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        const srtContent = convertJsonToSrt(subtitlesJson);
        console.log(srtContent);
        return NextResponse.json({
            success: true,
            subtitles: result.text
        });
    } catch (error) {
        console.error('Error in subtitle generation:', error);

        // Clean up temp file on error
        if (tempFilePath) {
             fs.unlink(tempFilePath).catch(err =>
                console.error('Failed to delete temp file:', err)
            );
        }

        return NextResponse.json({ error: "Upload failed", status: 400 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    try{
        const{data: {user}} = await supabase.auth.getUser();

        if(!user){
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {data: subtitle} = await supabase
            .from("subtitle_jobs")
            .select("video_url")
            .eq("user_id", user.id)
            .single();

        if(subtitle?.video_url){
            const bucketName = 'video_subtitles';
            const filePath = subtitle.video_url.substring(
                subtitle.video_url.indexOf(bucketName) + bucketName.length + 1
            )
            await supabase.storage.from(bucketName).remove([filePath]);;
        }
    }catch (error) {
        return NextResponse.json({ error: 'Deletion failed.' }, { status: 500 });
    }
}
