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
    const parsedObject = JSON.parse(cleanedText);

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