export const TOKENS_PER_CREDIT = 1000;

export const FeatureType = {
  SCRIPT_GENERATION: 'script_generation',
  THUMBNAIL_CREATION: 'thumbnail_creation',
  SUBTITLE_GENERATION: 'subtitle_generation',
  RESEARCH_TOPIC: 'research_topic',
  COURSE_MODULE: 'course_module',
  AI_TRAINING: 'ai_training',
  STORY_BUILDER: 'story_builder',
  IDEATION: 'ideation',
} as const;

export type FeatureType = (typeof FeatureType)[keyof typeof FeatureType];

export interface TokenBasedCreditParams {
  totalTokens: number;
}

export function calculateCreditsFromTokens(params: TokenBasedCreditParams): number {
  const { totalTokens } = params;
  return Math.max(1, Math.ceil(totalTokens / TOKENS_PER_CREDIT));
}

export function hasEnoughCredits(userCredits: number, requiredCredits: number): boolean {
  return userCredits >= requiredCredits;
}

export function getMinimumCreditsForGemini(): number {
  return 1;
}

export function getMinimumCreditsForIdeation(): number {
  return 2;
}

export function calculateIdeationCredits(params: TokenBasedCreditParams): number {
  return Math.max(2, calculateCreditsFromTokens(params));
}

export function getMinimumCreditsForStoryBuilder(): number {
  return 2;
}

export function calculateStoryBuilderCredits(params: TokenBasedCreditParams): number {
  return Math.max(2, calculateCreditsFromTokens(params));
}
