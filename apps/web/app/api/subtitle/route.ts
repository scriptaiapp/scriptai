import {NextResponse} from 'next/server';
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

        const newFileName = `${user.id}/${Date.now()}_${file.name}`;
        const publicUrl = await UploadVideo(file, newFileName);

        console.log(publicUrl);
    }catch (error) {
        console.log(error);
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
