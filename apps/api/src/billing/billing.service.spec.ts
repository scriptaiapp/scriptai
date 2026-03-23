import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();
const mockSupabaseClient = { from: mockFrom };
const mockSupabaseService = {
  getClient: () => mockSupabaseClient,
  getAdminClient: () => mockSupabaseClient,
};

describe('BillingService', () => {
  let service: BillingService;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                LEMONSQUEEZY_API_KEY: 'test-key',
                LEMONSQUEEZY_STORE_ID: 'store-1',
                LEMONSQUEEZY_WEBHOOK_SECRET: 'webhook-secret',
                FRONTEND_PROD_URL: 'https://app.test.com',
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getPlans', () => {
    it('should return active plans sorted by price', async () => {
      const plans = [
        { id: '1', name: 'Starter', price_monthly: 0 },
        { id: '2', name: 'Pro', price_monthly: 29 },
      ];

      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({ data: plans, error: null }),
          }),
        }),
      });

      const result = await service.getPlans();
      expect(result).toEqual(plans);
    });

    it('should throw on database error', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      });

      await expect(service.getPlans()).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid signature', () => {
      const crypto = require('crypto');
      const secret = 'webhook-secret';
      const body = Buffer.from('test-body');
      const hmac = crypto.createHmac('sha256', secret);
      const validSignature = hmac.update(body).digest('hex');

      const result = service.verifyWebhookSignature(body, validSignature);
      expect(result).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const body = Buffer.from('test-body');
      const result = service.verifyWebhookSignature(body, 'invalid-sig');
      expect(result).toBe(false);
    });
  });

  describe('getUsageHistory', () => {
    it('should aggregate usage across tables', async () => {
      const mockData = [
        { credits_consumed: 5, created_at: new Date().toISOString() },
      ];

      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            gte: () => ({
              gt: () => ({ data: mockData }),
            }),
          }),
        }),
      });

      const result = await service.getUsageHistory('user-1', 'weekly');
      expect(result).toHaveProperty('usage');
      expect(result).toHaveProperty('totalUsed');
      expect(result.range).toBe('weekly');
    });

    it('should return empty when no usage data', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            gte: () => ({
              gt: () => ({ data: [] }),
            }),
          }),
        }),
      });

      const result = await service.getUsageHistory('user-1', 'daily');
      expect(result.usage).toEqual([]);
      expect(result.totalUsed).toBe(0);
    });
  });
});
