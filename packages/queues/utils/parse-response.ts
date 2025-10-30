
import { ResearchData } from '@repo/validation';
import { jsonrepair } from 'jsonrepair';

export interface StyleAnalysis {
  style_analysis: string;
  tone: string;
  vocabulary_level: string;
  pacing: string;
  themes: string[];
  humor_style: string;
  narrative_structure: string;
  visual_style: string;
  audience_engagement: string[];
  recommendations: {
    script_generation: string;
    research_topics: string;
    thumbnails: string;
    subtitles: string;
    audio_conversion: string;
  };
}
interface ScriptResponse {
  title: string;
  script: string;
}

// for model training
export function parseGeminiResponse(rawText: string): StyleAnalysis | null {
  try {
    // Remove markdown code block formatting if present
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json') && cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(7, -3).trim();
    } else if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(3, -3).trim();
    }

    // Parse the cleaned text into a JSON object
    const parsedObject = JSON.parse(jsonrepair(cleanedText));

    // Define expected keys for validation
    const expectedKeys = [
      'style_analysis',
      'tone',
      'vocabulary_level',
      'pacing',
      'themes',
      'humor_style',
      'narrative_structure',
      'visual_style',
      'audience_engagement',
      'recommendations',
    ];

    // Validate the structure
    const isValidResponse =
      typeof parsedObject === 'object' &&
      expectedKeys.every((key) => key in parsedObject) &&
      Array.isArray(parsedObject.themes) &&
      Array.isArray(parsedObject.audience_engagement) &&
      typeof parsedObject.recommendations === 'object' &&
      ['script_generation', 'research_topics', 'thumbnails', 'subtitles', 'audio_conversion'].every(
        (key) => key in parsedObject.recommendations && typeof parsedObject.recommendations[key] === 'string'
      );

    if (!isValidResponse) {
      console.error('Invalid Gemini response structure:', parsedObject);
      return null;
    }

    return parsedObject as StyleAnalysis;
  } catch (error) {
    console.error('Error parsing Gemini response:', error, 'Raw text:', rawText);
    return null;
  }
}

// Function to parse Gemini response into a typed object
export function parseScriptResponse(text: string): ScriptResponse | null {
  try {
    let cleanedText = text.trim();

    // Remove markdown code fences if present
    if (cleanedText.startsWith('```json') && cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(7, -3).trim();
    } else if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(3, -3).trim();
    }

    // Additional cleaning: remove leading/trailing newlines, tabs, or whitespace
    cleanedText = cleanedText.replace(/^\s+|\s+$/g, '');

    // Log cleaned text for debugging
    console.log('Cleaned Gemini response:', cleanedText);

    let parsed: ScriptResponse;
    try {
      // Attempt to repair and parse JSON
      parsed = JSON.parse(jsonrepair(cleanedText));
    } catch (repairError) {
      console.error('JSON repair failed:', repairError);
      // Fallback: try parsing without jsonrepair
      try {
        parsed = JSON.parse(cleanedText);
      } catch (fallbackError) {
        console.error('Fallback JSON parse failed:', fallbackError);
        return null;
      }
    }

    // Validate the parsed response
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'title' in parsed &&
      'script' in parsed &&
      typeof parsed.title === 'string' &&
      typeof parsed.script === 'string'
    ) {
      return {
        title: parsed.title,
        script: parsed.script
      };
    }

    console.error('Parsed JSON missing required fields:', parsed);
    return null;
  } catch (error) {
    console.error('Error parsing Gemini response:', error, { inputText: text });
    return null;
  }
}

interface GeminiResponse {
  topic: string;
  research: ResearchData;
}

// Parse Gemini response into structured research data
export function parseResearchResponse(text: string): GeminiResponse | null {
  try {
    let cleanedText = text.trim();

    // Remove markdown code fences if present
    if (cleanedText.startsWith('```json') && cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(7, -3).trim();
    } else if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(3, -3).trim();
    }

    // Additional cleaning: remove leading/trailing newlines, tabs, or whitespace
    cleanedText = cleanedText.replace(/^\s+|\s+$/g, '');

    // Log cleaned text for debugging
    console.log('Cleaned Gemini response:', cleanedText);
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
