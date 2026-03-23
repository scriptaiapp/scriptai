import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();
const mockSupabaseClient = { from: mockFrom };
const mockSupabaseService = {
  getClient: () => mockSupabaseClient,
};

describe('ReferralService', () => {
  let service: ReferralService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
  });

  describe('getReferralData', () => {
    it('should throw NotFoundException when profile not found', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { message: 'not found' } }),
          }),
        }),
      });

      await expect(service.getReferralData('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return referral data with pending and completed referrals', async () => {
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    id: 'p-1',
                    referral_code: 'ABC123',
                    total_referrals: 2,
                    referral_credits: 20,
                    full_name: 'John',
                    avatar_url: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                data: [
                  { id: 'r1', status: 'completed' },
                  { id: 'r2', status: 'pending' },
                ],
                error: null,
              }),
            }),
          }),
        };
      });

      const result = await service.getReferralData('user-1');
      expect(result.referralCode).toBe('ABC123');
      expect(result.pendingReferrals).toHaveLength(1);
      expect(result.completedReferrals).toHaveLength(1);
    });
  });

  describe('generateReferralCode', () => {
    it('should return existing code if already set', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: { referral_code: 'EXISTING' },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.generateReferralCode('user-1');
      expect(result.referralCode).toBe('EXISTING');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { message: 'not found' } }),
          }),
        }),
      });

      await expect(service.generateReferralCode('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('trackReferral', () => {
    it('should throw BadRequestException for invalid referral code', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { message: 'not found' } }),
          }),
        }),
      });

      await expect(
        service.trackReferral({ referralCode: 'INVALID', userEmail: 'test@test.com' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for self-referral', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: {
                id: 'p-1',
                user_id: 'u-1',
                email: 'user@test.com',
                referral_code: 'CODE1',
                total_referrals: 0,
              },
              error: null,
            }),
          }),
        }),
      });

      await expect(
        service.trackReferral({ referralCode: 'CODE1', userEmail: 'user@test.com' })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
