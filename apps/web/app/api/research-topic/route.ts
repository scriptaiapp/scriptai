import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { jsonrepair } from "jsonrepair"

// Define interfaces for type safety
interface ResearchRequest {
  topic?: string;
  context?: string;
  autoResearch: boolean;
}

interface ResearchData {
  summary: string;
  keyPoints: string[];
  trends: string[];
  questions: string[];
  contentAngles: string[];
  sources: string[];
}

interface ResearchTopicRecord {
  id: string;
  user_id: string;
  topic: string;
  context?: string;
  research_data: ResearchData;
  created_at: string;
  updated_at: string;
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

interface GeminiResponse {
  topic: string;
  research: ResearchData;
}

// Parse Gemini response into structured research data
function parseResearchResponse(text: string): GeminiResponse | null {
  try {
    // Remove markdown code fences if present
    const cleanedText = text.replace(/```json\n|\n```/g, '').trim();
    const parsed = JSON.parse(jsonrepair(cleanedText));

    if (
      typeof parsed.topic !== 'string' ||
      typeof parsed.research !== 'object' ||
      typeof parsed.research.summary !== 'string' ||
      !Array.isArray(parsed.research.keyPoints) ||
      !Array.isArray(parsed.research.trends) ||
      !Array.isArray(parsed.research.questions) ||
      !Array.isArray(parsed.research.contentAngles) ||
      !Array.isArray(parsed.research.sources)
    ) {
      return null;
    }

    return {
      topic: parsed.topic,
      research: {
        summary: parsed.research.summary,
        keyPoints: parsed.research.keyPoints,
        trends: parsed.research.trends,
        questions: parsed.research.questions,
        contentAngles: parsed.research.contentAngles,
        sources: parsed.research.sources,
      },
    };
  } catch (error) {
    console.error('Error parsing research response:', error);
    return null;
  }
}

// GET: Fetch recent research topics for the user
export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('research_topics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent topics:', error);
      return NextResponse.json({ message: 'Failed to fetch recent topics' }, { status: 500 });
    }

    return NextResponse.json(data as ResearchTopicRecord[]);
  } catch (error: unknown) {
    console.error('Error in GET research-topic:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new research topic
export async function POST(request: Request) {
  const supabase = await createClient();

  try {

    const body: ResearchRequest = await request.json();
    const { topic, context, autoResearch } = body;

    if (!autoResearch && !topic) {
      return NextResponse.json({ message: 'Topic is required unless auto-research is enabled' }, { status: 400 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check credits
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('credits, ai_trained, youtube_connected')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    if (!profileData.ai_trained && !profileData.youtube_connected) {
      return NextResponse.json({ message: 'AI training and YouTube connection are required' }, { status: 403 });
    }

    const typedProfileData: ProfileData = profileData as ProfileData;

    if (typedProfileData.credits < 1) {
      return NextResponse.json({
        message: 'Insufficient credits. Please upgrade your plan or earn more credits.'
      }, { status: 403 });
    }

    let channelData: ChannelData | null = null;
    let styleData: StyleData | null = null;
    let finalTopic = topic;

    // Fetch channel and style data if autoResearch or ai_trained
    if (autoResearch || typedProfileData.ai_trained) {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('channel_name, channel_description, topic_details, default_language')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        console.error('Error fetching channel data:', error);
      } else {
        channelData = data as ChannelData;
      }

      const { data: style, error: styleError } = await supabase
        .from('user_style')
        .select('tone, vocabulary_level, pacing, themes, humor_style, structure, style_analysis, recommendations')
        .eq('user_id', user.id)
        .single();

      if (styleError && styleError.code !== 'PGRST116') {
        console.error('Error fetching style data:', styleError);
      } else {
        styleData = style as StyleData;
      }
    }

    // Initialize Gemini API
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: 'Server configuration error: Missing API key' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey });

    // Craft prompt for research
    let researchPrompt = autoResearch
      ? `
Generate a unique research topic and comprehensive research data for a YouTube video based on the user's channel and style profile. The topic should align with the user's content preferences and audience interests.

Creator's Profile:
- Channel Name: ${channelData?.channel_name || 'Unknown'}
- Channel Description: ${channelData?.channel_description || 'None'}
- Topic Details: ${JSON.stringify(channelData?.topic_details) || 'None'}
- Default Language: ${channelData?.default_language || 'English'}
- Style Profile:
  - Content Style: ${styleData?.style_analysis || 'None'}
  - Typical Tone: ${styleData?.tone || 'conversational'}
  - Vocabulary Level: ${styleData?.vocabulary_level || 'general'}
  - Pacing: ${styleData?.pacing || 'moderate'}
  - Themes: ${styleData?.themes || 'None'}
  - Humor Style: ${styleData?.humor_style || 'None'}
  - Narrative Structure: ${styleData?.structure || 'None'}
  - Recommendations: ${JSON.stringify(styleData?.recommendations) || '{}'}

${context ? `Additional Context: ${context}` : ''}

Output format:
{
  "topic": "Suggested topic",
  "research": {
    "summary": "Summary of the topic",
    "keyPoints": ["Key point 1", "Key point 2"],
    "trends": ["Current trend 1", "Current trend 2"],
    "questions": ["Common question 1", "Common question 2"],
    "contentAngles": ["Content angle 1", "Content angle 2"],
    "sources": ["Source URL 1", "Source URL 2"]
  }
}
`
      : `
Research the topic "${topic}" for a YouTube video, tailored to the user's channel and style profile if available.

${typedProfileData.ai_trained ? `
Creator's Profile:
- Channel Name: ${channelData?.channel_name || 'Unknown'}
- Channel Description: ${channelData?.channel_description || 'None'}
- Topic Details: ${JSON.stringify(channelData?.topic_details) || 'None'}
- Default Language: ${channelData?.default_language || 'English'}
- Style Profile:
  - Content Style: ${styleData?.style_analysis || 'None'}
  - Typical Tone: ${styleData?.tone || 'conversational'}
  - Vocabulary Level: ${styleData?.vocabulary_level || 'general'}
  - Pacing: ${styleData?.pacing || 'moderate'}
  - Themes: ${styleData?.themes || 'None'}
  - Humor Style: ${styleData?.humor_style || 'None'}
  - Narrative Structure: ${styleData?.structure || 'None'}
  - Recommendations: ${JSON.stringify(styleData?.recommendations) || '{}'}
` : ''}

${context ? `Additional Context: ${context}` : ''}

Output format:
{
  "topic": "${topic}",
  "research": {
    "summary": "Summary of the topic",
    "keyPoints": ["Key point 1", "Key point 2"],
    "trends": ["Current trend 1", "Current trend 2"],
    "questions": ["Common question 1", "Common question 2"],
    "contentAngles": ["Content angle 1", "Content angle 2"],
    "sources": ["Source URL 1", "Source URL 2"]
  }
}
`;

    // Generate research with Gemini
    const result: any = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: researchPrompt,
    });

    const response = parseResearchResponse(result.text);
    if (!response) {
      return NextResponse.json({ message: 'Failed to generate valid research data' }, { status: 500 });
    }

    // Set topic for auto-research case
    if (autoResearch) {
      finalTopic = response.topic;
    }

    // Update credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: typedProfileData.credits - 1 })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return NextResponse.json({ message: 'Failed to update credits' }, { status: 500 });
    }

    // Save research to database
    const researchRecord: ResearchTopicRecord = {
      id: uuidv4(),
      user_id: user.id,
      topic: finalTopic!,
      context,
      research_data: response.research,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error: insertError } = await supabase
      .from('research_topics')
      .insert(researchRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Error saving research:', insertError);
      return NextResponse.json({ message: `Failed to save research: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      id: (data as ResearchTopicRecord).id,
      topic: finalTopic,
      research: response.research,
    });
  } catch (error: unknown) {
    console.error('Error in POST research-topic:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}