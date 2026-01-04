import { z } from 'zod';

export const CreateDubSchema = z.object({
  mediaUrl: z.string().url({ message: 'Invalid media URL' }),
  targetLanguage: z.string().min(1, { message: 'Target language is required' }),
  isVideo: z.boolean(),
});

// Output/response schema
export const DubResponseSchema = z.object({
  projectId: z.string(),
  dubbedUrl: z.string().optional(),
  originalMediaUrl: z.string().optional(),
  status: z.enum(['dubbing', 'dubbed']),
  creditsConsumed: z.number().optional(),
  isVideo: z.boolean(),
  createdAt: z.string(),
  targetLanguage: z.string()
});

export type CreateDubInput = z.infer<typeof CreateDubSchema>;
export type DubResponse = z.infer<typeof DubResponseSchema>;