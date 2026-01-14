import { ConfigService } from '@nestjs/config';

let genaiModule: typeof import('@google/genai') | null = null;

async function loadGenAI() {
  if (!genaiModule) {
    genaiModule = await import('@google/genai');
  }
  return genaiModule;
}

export async function createGoogleAI(configService: ConfigService) {
  const { GoogleGenAI } = await loadGenAI();
  const apiKey = configService.get<string>('GOOGLE_GENERATIVE_AI_API_KEY');
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
  }
  return new GoogleGenAI({ apiKey });
}

export type GoogleAIInstance = Awaited<ReturnType<typeof createGoogleAI>>;
