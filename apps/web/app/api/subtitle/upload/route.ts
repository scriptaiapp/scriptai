import {NextResponse}  from "next/server";
import {createClient} from '@/lib/supabase/server';


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

    try {
        const {data: {user}} = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }
        const formData = await request.formData();
        const file = formData.get('video') as File;
        const durationStr = formData.get('duration') as string | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        if (!durationStr) {
            return NextResponse.json({ error: 'No duration provided.' }, { status: 400 });
        }

        const duration = parseFloat(durationStr);
        if (isNaN(duration)) {
            return NextResponse.json({ error: 'Invalid duration format.' }, { status: 400 });
        }

        const maxSize = 200 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 200MB' }, { status: 413 });
        }

        const maxDuration = 10 * 60;
        if (duration > maxDuration) {
            return NextResponse.json({ error: 'Video duration must be 10 minutes or less' }, { status: 400 });
        }
        const newFileName = `${user.id}/${Date.now()}_${file.name}`;
        const video_url = await UploadVideo(file, newFileName);
        const {data, error: subtitleInsertError} = await supabase
            .from("subtitle_jobs")
            .insert({
                user_id: user.id,
                video_path: video_url,
                video_url: video_url,
                duration: duration,
            })
            .select()
            .single()

        if(subtitleInsertError){
            console.log(subtitleInsertError);
            return NextResponse.json({error: 'Failed to update subtitles'}, {status: 500});
        }

        console.log(data)

        return NextResponse.json({
            success: true,
            subtitleId: data.id,
        });

    }catch(error) {
        console.log(error);
        return NextResponse.json({error: "Upload failed", status: 400})
    }


}
