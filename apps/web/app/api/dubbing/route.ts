import { getSupabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    const targetLanguage = formData.get('targetLanguage') as string;

    if (!audio || !targetLanguage) {
      return NextResponse.json({ error: 'Missing audio file or target language' }, { status: 400 });
    }

    // Check file size (500MB limit for UI)
    if (audio.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 500MB limit' }, { status: 400 });
    }

    // ElevenLabs API call
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const elevenLabsFormData = new FormData();
    elevenLabsFormData.append('file', audio);
    elevenLabsFormData.append('target_lang', targetLanguage);
    elevenLabsFormData.append('num_speakers', '1'); // Assume single speaker; adjust if needed
    elevenLabsFormData.append('watermark', 'true'); // Optional: reduces credit usage

    const response = await fetch('https://api.elevenlabs.io/v1/dubbing', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to dub audio' }, { status: response.status });
    }

    const data = await response.json();
    const projectId = data.dubbing_id;
    const dubbedUrl = data.dubbed_audio_url; // Adjust based on actual API response

    // Optionally store dubbing metadata in Supabase
    const { error: dbError } = await supabase
      .from('dubbing_projects')
      .insert({
        user_id: user.id,
        project_id: projectId,
        original_audio_name: audio.name,
        target_language: targetLanguage,
        dubbed_url: dubbedUrl,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Error saving dubbing project:', dbError);
    }

    return NextResponse.json({ projectId, dubbedUrl });
  } catch (error: any) {
    console.error('Error in dubbing API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}