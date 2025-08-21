import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { parseScriptResponse } from "@/lib/parseResponse"



// Define interfaces for type safety
interface ScriptRequest {
  prompt: string;
  context?: string;
  tone?: string;
  includeStorytelling: boolean;
  references?: string;
  language: string;
  personalized: boolean;
}

interface ProfileData {
  credits: number;
  ai_trained: boolean;
}

interface ChannelData {
  channel_name: string;
  channel_description: string | null;
  topic_details: Record<string, any>;
  default_language: string | null;
}

interface StyleData {
  tone: string;
  vocabulary_level: string;
  pacing: string;
  themes: string;
  humor_style: string;
  structure: string;
  style_analysis: string;
  recommendations: Record<string, string>;
}


interface ScriptRecord {
  id: string;
  user_id: string;
  title: string;
  content: string;
  prompt: string;
  context?: string;
  tone?: string;
  include_storytelling: boolean;
  reference_links?: string;
  language: string;
  created_at: string;
  updated_at: string;
}



export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body: ScriptRequest = await request.json();
    const {
      prompt,
      context,
      tone,
      includeStorytelling,
      references,
      language,
      personalized
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('credits, ai_trained')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const typedProfileData: ProfileData = profileData as ProfileData;

    if (typedProfileData.credits < 1) {
      return NextResponse.json({
        error: 'Insufficient credits. Please upgrade your plan or earn more credits.'
      }, { status: 403 });
    }

    let channelData: ChannelData | null = null;
    let styleData: StyleData | null = null;

    // Fetch channel details if personalized
    if (personalized && typedProfileData.ai_trained) {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('channel_name, channel_description, topic_details, default_language')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching channel data:', error);
      } else {
        channelData = data as ChannelData;
      }

      // Fetch user style
      const { data: style, error: styleError } = await supabase
        .from('user_style')
        .select('tone, vocabulary_level, pacing, themes, humor_style, structure, style_analysis, recommendations')
        .eq('user_id', user.id)
        .single();

      if (styleError) {
        console.error('Error fetching style data:', styleError);
      } else {
        styleData = style as StyleData;
      }
    }

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

    // Craft prompt for script generation
    const geminiPrompt = `
Generate a unique YouTube video script based on the following details:
- Prompt: ${prompt}
- Context: ${context || 'None'}
- Desired Tone: ${tone || styleData?.tone || 'conversational'}
- Language: ${language || channelData?.default_language || 'English'}
- Include Storytelling: ${includeStorytelling}
- References: ${references || 'None'}
- Include timestamps: Include timestamps on the script

${personalized && styleData ? `
Creator's Style Profile:
- Channel Name: ${channelData?.channel_name || 'Unknown'}
- Channel Description: ${channelData?.channel_description || 'None'}
- Content Style: ${styleData.style_analysis}
- Typical Tone: ${styleData.tone}
- Vocabulary Level: ${styleData.vocabulary_level}
- Pacing: ${styleData.pacing}
- Themes: ${styleData.themes}
- Humor Style: ${styleData.humor_style}
- Narrative Structure: ${styleData.structure}
- Recommendations: ${JSON.stringify(styleData.recommendations)}
` : ''}

Output should be valid json format:
{
  "title": "Suggested script title",
  "script": "Full script text here"
}
`;

    // Generate script with Gemini
    const result: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiPrompt,
    });

    const response = parseScriptResponse(result.text);
    if (!response) {
      return NextResponse.json({ error: 'Failed to generate valid script' }, { status: 500 });
    }

    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: typedProfileData.credits - 1 })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // Save script to database
    const { data, error: insertError } = await supabase
      .from('scripts')
      .insert({
        user_id: user.id,
        title: response.title,
        content: response.script,
        prompt,
        context,
        tone,
        include_storytelling: includeStorytelling,
        reference_links: references,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ScriptRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Error saving script:', insertError);
      return NextResponse.json({ error: 'Failed to save script' }, { status: 500 });
    }

    return NextResponse.json({
      id: (data as ScriptRecord).id,
      title: response.title,
      script: response.script
    });

  } catch (error: unknown) {
    console.error('Error in generate-script:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}