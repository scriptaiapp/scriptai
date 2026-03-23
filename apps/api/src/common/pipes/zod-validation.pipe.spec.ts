import { BadRequestException } from '@nestjs/common';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
  });

  let pipe: ZodValidationPipe;

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('should pass valid data through', () => {
    const input = { email: 'test@example.com', name: 'John' };
    expect(pipe.transform(input, { type: 'body' })).toEqual(input);
  });

  it('should throw BadRequestException for invalid data', () => {
    const input = { email: 'not-an-email', name: '' };
    expect(() => pipe.transform(input, { type: 'body' })).toThrow(BadRequestException);
  });

  it('should include formatted errors in exception', () => {
    try {
      pipe.transform({ email: 'bad', name: '' }, { type: 'body' });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as Record<string, unknown>;
      expect(response.message).toBe('Validation failed');
      expect(response.errors).toBeDefined();
      expect(Array.isArray(response.errors)).toBe(true);
    }
  });

  it('should throw BadRequestException for non-Zod errors', () => {
    const badSchema = {
      parse: () => { throw new Error('unexpected'); },
    } as unknown as z.ZodSchema;

    const badPipe = new ZodValidationPipe(badSchema);
    expect(() => badPipe.transform({}, { type: 'body' })).toThrow(BadRequestException);
  });
});
