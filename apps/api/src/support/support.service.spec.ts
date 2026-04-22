import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupportService } from './support.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockSupabaseService: Pick<SupabaseService, 'getClient'> = {
  getClient: () => ({
    from: () => ({ insert: () => Promise.resolve({ error: null }) }),
  }) as unknown as ReturnType<SupabaseService['getClient']>,
};

describe('SupportService', () => {
  let service: SupportService;

  describe('when Resend is not configured', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SupportService,
          { provide: ConfigService, useValue: { get: () => undefined } },
          { provide: SupabaseService, useValue: mockSupabaseService },
        ],
      }).compile();
      service = module.get<SupportService>(SupportService);
    });

    it('should throw InternalServerErrorException when email service not configured', async () => {
      await expect(
        service.reportIssue('Subject', 'user@test.com', 'Body text')
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('input validation', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SupportService,
          { provide: ConfigService, useValue: { get: () => undefined } },
          { provide: SupabaseService, useValue: mockSupabaseService },
        ],
      }).compile();
      service = module.get<SupportService>(SupportService);
    });

    it('should throw BadRequestException when subject is empty', async () => {
      await expect(
        service.reportIssue('', 'user@test.com', 'Body')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when email is empty', async () => {
      await expect(
        service.reportIssue('Subject', '', 'Body')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when body is empty', async () => {
      await expect(
        service.reportIssue('Subject', 'user@test.com', '')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
