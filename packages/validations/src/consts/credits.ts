export const TOKENS_PER_CREDIT = 1000;
export const SCRIPT_CREDIT_MULTIPLIER = 1;
export const THUMBNAIL_CREDIT_MULTIPLIER = 2;
export const SUBTITLE_CREDIT_MULTIPLIER = 2;
export const IDEATION_CREDIT_MULTIPLIER = 1;
export const STORY_BUILDER_CREDIT_MULTIPLIER = 1;
export const TRAIN_AI_CREDIT_MULTIPLIER = 2;

export const FeatureType = {
  SCRIPT_GENERATION: 'script_generation',
  THUMBNAIL_CREATION: 'thumbnail_creation',
  SUBTITLE_GENERATION: 'subtitle_generation',
  RESEARCH_TOPIC: 'research_topic',
  COURSE_MODULE: 'course_module',
  DUBBING: 'dubbing',
  AI_TRAINING: 'ai_training',
  STORY_BUILDER: 'story_builder',
  IDEATION: 'ideation',
} as const;

export type FeatureType = (typeof FeatureType)[keyof typeof FeatureType];

export interface TokenBasedCreditParams {
  totalTokens: number;
}

export interface ExternalCreditParams {
  externalCreditsUsed: number;
  multiplier?: number;
}

export interface TokenCreditConfig {
  tokensPerCredit?: number;
  multiplier?: number;
  minimumCredits?: number;
}

export function calculateCreditsFromTokens(
  params: TokenBasedCreditParams,
  config?: TokenCreditConfig,
): number {
  const { totalTokens } = params;
  const tokensPerCredit = config?.tokensPerCredit ?? TOKENS_PER_CREDIT;
  const multiplier = config?.multiplier ?? 1;
  const minimumCredits = config?.minimumCredits ?? 1;
  const baseCredits = Math.ceil(totalTokens / tokensPerCredit);
  return Math.max(minimumCredits, baseCredits * multiplier);
}

export function calculateDubbingCredits(params: ExternalCreditParams): number {
  const { externalCreditsUsed, multiplier = 10 } = params;
  return externalCreditsUsed * multiplier;
}

export function hasEnoughCredits(userCredits: number, requiredCredits: number): boolean {
  return userCredits >= requiredCredits;
}

export function getMinimumCreditsForGemini(multiplier = SCRIPT_CREDIT_MULTIPLIER): number {
  return Math.max(1, multiplier);
}

export function getMinimumCreditsForIdeation(multiplier = IDEATION_CREDIT_MULTIPLIER): number {
  return Math.max(2, multiplier);
}

export function calculateIdeationCredits(
  params: TokenBasedCreditParams,
  config?: Omit<TokenCreditConfig, 'minimumCredits'>,
): number {
  return calculateCreditsFromTokens(params, {
    tokensPerCredit: config?.tokensPerCredit,
    multiplier: config?.multiplier ?? IDEATION_CREDIT_MULTIPLIER,
    minimumCredits: 2,
  });
}

export function getMinimumCreditsForStoryBuilder(multiplier = STORY_BUILDER_CREDIT_MULTIPLIER): number {
  return Math.max(2, multiplier);
}

export function calculateStoryBuilderCredits(
  params: TokenBasedCreditParams,
  config?: Omit<TokenCreditConfig, 'minimumCredits'>,
): number {
  return calculateCreditsFromTokens(params, {
    tokensPerCredit: config?.tokensPerCredit,
    multiplier: config?.multiplier ?? STORY_BUILDER_CREDIT_MULTIPLIER,
    minimumCredits: 2,
  });
}

export function calculateThumbnailCredits(
  params: TokenBasedCreditParams,
  config?: Omit<TokenCreditConfig, 'minimumCredits'>,
): number {
  return calculateCreditsFromTokens(params, {
    tokensPerCredit: config?.tokensPerCredit,
    multiplier: config?.multiplier ?? THUMBNAIL_CREDIT_MULTIPLIER,
    minimumCredits: 1,
  });
}

export function getMinimumCreditsForThumbnailRequest(
  generateCount: number,
  multiplier = THUMBNAIL_CREDIT_MULTIPLIER,
): number {
  return Math.max(1, generateCount * multiplier);
}

export function calculateSubtitleCredits(
  params: TokenBasedCreditParams,
  config?: Omit<TokenCreditConfig, 'minimumCredits'>,
): number {
  return calculateCreditsFromTokens(params, {
    tokensPerCredit: config?.tokensPerCredit,
    multiplier: config?.multiplier ?? SUBTITLE_CREDIT_MULTIPLIER,
    minimumCredits: 1,
  });
}

export function getMinimumCreditsForSubtitleRequest(multiplier = SUBTITLE_CREDIT_MULTIPLIER): number {
  return Math.max(1, multiplier);
}
