import {NextRequest, NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {convertJsonToSrt} from "@/utils/convertJsonToSrt";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();

    const params = await context.params;
    const subtitleId = params.id;
    try{
        const{data: {user}} = await supabase.auth.getUser();
        if(!user){
            return NextResponse.json({error: 'Unauthorized'}, {status:401});
        }



        const {data: subtitleData, error: subtitleError} = await supabase
            .from('subtitle_jobs')
            .select("*")
            .eq("id", subtitleId)
            .eq("user_id", user.id)
            .single();


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



export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const params = await context.params;
    const subtitleId = params.id;
    console.log(subtitleId);

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { data: subtitle, error: subtitleError } = await supabase
            .from('subtitle_jobs')
            .delete()
            .eq('id', subtitleId)
            .eq('user_id', user.id)
            .select('video_url')
            .single();

        console.log(subtitle)
        if (subtitleError && subtitleError.code !== 'PGRST116' || !subtitle) {

            console.error('Subtitle lookup error:', subtitleError);
            NextResponse.json({ message: 'Subtitle lookup error' }, { status: 404 });
        }

        if (subtitle?.video_url) {
            const bucketName = 'video_subtitles';
            const filePath = subtitle.video_url.substring(
                subtitle.video_url.indexOf(bucketName) + bucketName.length + 1
            );
            if (filePath) {
                await supabase.storage.from(bucketName).remove([filePath]);
            }
        }

        return NextResponse.json({ message: 'Script deleted successfully' });
    } catch (error) {
        console.error('Error deleting script:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request,     context: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const params = await context.params;
    const subtitle_id = params.id;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subtitle_json} = body;
        console.log(subtitle_id);
        console.log(subtitle_json.type);
        if (!Array.isArray(subtitle_json)) {
            return NextResponse.json({ error: 'Invalid subtitle format' }, { status: 400 });
        }

        const srtContent = convertJsonToSrt(subtitle_json);

        const { error: updateError } = await supabase
            .from("subtitle_jobs")
            .update({
                subtitles_json:JSON.stringify(subtitle_json)
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
            subtitles: subtitle_json,
            srt: srtContent
        });
    } catch (error) {
        console.error("Error in PATCH:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
