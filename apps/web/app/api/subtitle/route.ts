import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {extractAudioFromBuffer} from "@/utils/ExtractAudio";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { GoogleGenAI } from '@google/genai';
import {convertJsonToSrt} from '@/utils/convertJsonToSrt';
import {fetchVideoAsBuffer, getFileNameFromUrl, getMimeTypeFromUrl} from "@/utils/videoUrlTools";

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


export async function POST(request: Request) {
    const supabase = await createClient();
    let tempFilePath: string | null = null;

    async function logErrorToDB(message: string, subtitleId: string) {
        if (!subtitleId) return;
        try {
            await supabase
                .from("subtitle_jobs")
                .update({
                    status: "error",
                    error_message: message.slice(0, 5000)
                })
                .eq("id", subtitleId);
        } catch (dbError) {
            console.error(" Failed to record error in DB:", dbError);
        }
    }

    try{
        const{data: {user}} = await supabase.auth.getUser();

        if(!user){
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { subtitleId, language, targetLanguage, duration } = body;

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('credits, ai_trained, youtube_connected')
            .eq('user_id', user.id)
            .single();

        if (profileError || !profileData) {
            await logErrorToDB('Profile not found or profile fetch failed', subtitleId);
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (!profileData.ai_trained && !profileData.youtube_connected) {
            await logErrorToDB('AI training and YouTube connection are required', subtitleId);
            return NextResponse.json({ message: 'AI training and YouTube connection are required' }, { status: 403 });
        }

        const typedProfileData = profileData

        if (typedProfileData.credits < 1) {
            await logErrorToDB('Insufficient credits', subtitleId);
            return NextResponse.json({
                error: 'Insufficient credits. Please upgrade your plan or earn more credits.'
            }, { status: 403 });
        }

        const { data: subtitle, error: subtitleError } = await supabase
            .from('subtitle_jobs')
            .select('video_url')
            .eq('user_id', user.id)
            .eq('id', subtitleId)
            .single();

        if (subtitleError && subtitleError.code !== 'PGRST116' || !subtitle?.video_url) {
            await logErrorToDB('Subtitle lookup failed or video_url missing', subtitleId);
            console.error('Subtitle lookup error:', subtitleError);
            NextResponse.json({ message: 'Subtitle lookup error' }, { status: 404 });
        }
        const video_url = subtitle ? subtitle.video_url: null;

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error('Google Generative AI API key is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Determine if auto-detect or specific language
        const isAutoDetect = !language || language.toLowerCase() === 'auto detect' || language.toLowerCase() === 'auto';
        const languageInstruction = isAutoDetect
            ? "Automatically detect the language being spoken and transcribe in that language."
            : `Transcribe the audio in ${language}.`;

        // Determine target language instruction
        const hasTargetLanguage = targetLanguage && targetLanguage.toLowerCase() !== 'none' && targetLanguage.toLowerCase() !== 'same';
        const targetLanguageInstruction = hasTargetLanguage
            ? `After transcription, translate all subtitle text to ${targetLanguage}. Maintain the same timestamps but provide the translated text.`
            : "Provide subtitles in the original/detected language without translation.";

        const prompt = `
You are an expert, highly-accurate subtitle transcription service.
Your task is to transcribe the provided audio file and generate precise, time-stamped subtitles.

**LANGUAGE INSTRUCTION:** ${languageInstruction}

**TARGET LANGUAGE INSTRUCTION:** ${targetLanguageInstruction}

**CRITICAL RULES:**
1.  **Format:** Your entire response MUST be a valid JSON object with two keys: "detected_language" (string) and "subtitles" (array). Do NOT include any text, headers, or markdown formatting (like \`\`\`json) before or after the object.
2.  **Language Detection:** The "detected_language" field MUST contain the full name of the language detected in the audio (e.g., "English", "Spanish", "Hindi", "French", etc.).
3.  **Translation:** ${hasTargetLanguage ? `Translate all subtitle text to ${targetLanguage} while keeping timestamps accurate. The subtitle text should be in ${targetLanguage}, not the original language.` : 'Provide subtitles in the detected/original language.'}
4.  **Timestamps:** Timestamps MUST be in the exact \`HH:MM:SS.mmm\` format (hours:minutes:seconds.milliseconds).
5.  **Punctuation:** Include correct punctuation (commas, periods, question marks) for readability.
6.  **Silence:** Do NOT generate subtitle entries for periods of silence.
7.  **Non-Speech:** (Optional) Transcribe significant non-speech sounds in brackets, e.g., [MUSIC], [LAUGHTER], [APPLAUSE].
8.  **Accuracy:** Transcribe the audio verbatim. Do not paraphrase or correct the speaker's grammar. ${hasTargetLanguage ? `When translating, maintain the meaning and tone of the original speech.` : ''}
9.  **SUBTITLE LENGTH:** Keep each subtitle entry SHORT and concise. Each subtitle should contain a maximum of 1-2 short sentences or 5-10 words. Break longer sentences into multiple subtitle entries with appropriate timestamps. This ensures subtitles are readable and don't cover the entire screen. Think of comfortable reading speed - viewers should be able to read the subtitle in 2-3 seconds.

**Output Example:**
{
  "detected_language": "English",
  "subtitles": [
    { "start": "00:00:01.200", "end": "00:00:04.100", "text": "${hasTargetLanguage ? `[Translated text in ${targetLanguage}]` : 'Hello everyone, and welcome.'}" },
    { "start": "00:00:04.350", "end": "00:00:07.000", "text": "${hasTargetLanguage ? `[Translated text in ${targetLanguage}]` : 'Today we\'re going to discuss...'}" },
    { "start": "00:00:07.100", "end": "00:00:08.000", "text": "[MUSIC]" }
  ]
}
`;

        console.log('Converting file to buffer...');
        const audioBuffer = await fetchVideoAsBuffer(video_url)
        const fileName = getFileNameFromUrl(video_url);
        console.log('Buffer length:', audioBuffer.length);

        tempFilePath = path.join(os.tmpdir(), `${Date.now()}_${fileName}`);
        console.log('Writing to temp file:', tempFilePath);
        await fs.writeFile(tempFilePath, audioBuffer);
        console.log("audio length", audioBuffer.length)

        console.log('Uploading to Google AI...');
        const newFileName = `${user.id}/${Date.now()}_${fileName}`;
        const fileType = getMimeTypeFromUrl(video_url);
        const [ myFile] = await Promise.all([
            ai.files.upload({
                file: tempFilePath,
                config: { mimeType: fileType },
            }),
        ]);

        console.log('File uploaded:', myFile);

        await waitForFileActive(ai, myFile.name!);
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
            await logErrorToDB(`Gemini API error: ${geminiError}`, subtitleId);
            return NextResponse.json({ error: 'Failed to generate subtitles from Gemini API' }, { status: 500 });
        }

        // Clean up temp file
        if (tempFilePath) {
            await fs.unlink(tempFilePath).catch(err =>
                console.error('Failed to delete temp file:', err)
            );
        }

        console.log(result.text);

        let subtitlesData;
        let cleanedText;
        try {
            const rawText = result.text;
            cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            subtitlesData = JSON.parse(cleanedText);

            // Validate the response structure
            if (!subtitlesData.detected_language || !subtitlesData.subtitles) {
                throw new Error('Invalid response structure from Gemini');
            }
        } catch (parseError) {
            await logErrorToDB(`Failed to parse Gemini JSON: ${String(parseError)}`, subtitleId);

            console.error('Failed to parse JSON from Gemini:', parseError, "Raw text:", result.text);
            return NextResponse.json({ error: 'Failed to parse subtitle data' }, { status: 500 });
        }

        const subtitlesJson = subtitlesData.subtitles;
        const detectedLanguage = subtitlesData.detected_language;

        console.log('Detected language:', detectedLanguage);

        const srtContent = convertJsonToSrt(subtitlesJson);
        const {data, error: subtitleInsertError} = await supabase
            .from("subtitle_jobs")
            .update({
                subtitles_json: JSON.stringify(subtitlesJson),
                status: "done",
                language: language,
                detected_language: detectedLanguage,
                target_language: targetLanguage,
                duration: duration
            })
            .eq("id", subtitleId)
            .eq("user_id", user.id)
            .select()
            .single();

        if(subtitleInsertError){
            await logErrorToDB(`Failed to update subtitles: ${subtitleInsertError.message}`, subtitleId);
            console.log(subtitleInsertError);
            return NextResponse.json({error: 'Failed to update subtitles'}, {status: 500});
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: typedProfileData.credits - 1 })
            .eq('user_id', user.id);

        if (updateError) {
            console.error('Error updating credits:', updateError);
            return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
        }

        console.log(data);
        return NextResponse.json({
            success: true,
            detected_language: detectedLanguage,
            target_language: hasTargetLanguage ? targetLanguage : detectedLanguage
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

export async function GET(req: Request, res: Response) {
    const supabase = await createClient();
    try{
        const{data: {user}} = await supabase.auth.getUser();
        if(!user){
            return NextResponse.json({error: 'Unauthorized'}, {status:401});
        }

        const {data: subtitleData, error: subtitleError} = await supabase
            .from('subtitle_jobs')
            .select("*")
            .eq("user_id", user.id)
            .order('created_at', { ascending: false })
            .limit(10);


        if (subtitleError) {
            return NextResponse.json({ message: 'Error fetching subtitle' }, { status: 500 });
        }
        // console.log(subtitleData);

        return NextResponse.json(subtitleData);


    }catch(error: unknown) {
        console.error('Error fetching subtitles:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }



}


export async function PATCH(request: Request) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subtitles, subtitle_id } = body; // Edited subtitle JSON
        console.log(subtitle_id);
        if (!Array.isArray(subtitles)) {
            return NextResponse.json({ error: 'Invalid subtitle format' }, { status: 400 });
        }

        // Convert to SRT for consistency
        const srtContent = convertJsonToSrt(subtitles);

        // Store edited subtitles in the same way as POST
        const { error: updateError } = await supabase
            .from("subtitle_jobs")
            .update({
                subtitles_json: subtitles
            })
            .eq("id", subtitle_id)
            .eq("user_id", user.id)
            .single();

        if (updateError) {
            console.error(updateError);
            return NextResponse.json({ error: 'Failed to update subtitles' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Subtitles updated successfully',
            subtitles: subtitles,
            srt: srtContent
        });
    } catch (error) {
        console.error("Error in PATCH:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


