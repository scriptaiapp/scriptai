import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AffiliateService } from './affiliate.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockFrom = jest.fn();
const mockAdminClient = { from: mockFrom };
const mockSupabaseService = {
  getAdminClient: () => mockAdminClient,
};

describe('AffiliateService', () => {
  let service: AffiliateService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliateService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'LEMONSQUEEZY_STORE_ID') return 'store_123';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AffiliateService>(AffiliateService);
  });

  describe('submitRequest', () => {
    it('throws when a pending request already exists', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'affiliate_requests') {
          return {
            select: () => ({
              eq: () => ({
                in: () => ({
                  maybeSingle: () => ({ data: { id: 'req-1', status: 'pending' } }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        service.submitRequest('user-1', { reason: 'I can promote this.' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('uses profile name and email instead of client payload', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: () => ({
          single: () => ({ data: { id: 'req-new' }, error: null }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'affiliate_requests') {
          return {
            select: () => ({
              eq: () => ({
                in: () => ({
                  maybeSingle: () => ({ data: null }),
                }),
              }),
            }),
            insert: insertMock,
          };
        }
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    full_name: 'Session User',
                    name: 'Session User Alt',
                    email: 'session@user.com',
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      await service.submitRequest('user-1', {
        full_name: 'Spoofed Name',
        email: 'spoofed@email.com',
        reason: 'I can promote this.',
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          full_name: 'Session User',
          email: 'session@user.com',
          reason: 'I can promote this.',
        }),
      );
    });
  });

  describe('reviewRequest', () => {
    it('throws NotFoundException when request is missing', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'affiliate_requests') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({ data: null, error: { message: 'not found' } }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        service.reviewRequest('req-1', 'admin-1', 'approved'),
      ).rejects.toThrow(NotFoundException);
    });

    it('sends approval email with the admin note as the message when approved', async () => {
      const sendMock = jest.fn().mockResolvedValue({ id: 'mail-1' });
      (service as any).resend = { emails: { send: sendMock } };
      const updateMock = jest.fn().mockReturnValue({
        eq: () => ({
          select: () => ({
            single: () => ({ data: { id: 'req-1', status: 'approved' }, error: null }),
          }),
        }),
      });

      let requestFetchCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'affiliate_requests') {
          requestFetchCount += 1;
          if (requestFetchCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  single: () => ({
                    data: {
                      id: 'req-1',
                      status: 'pending',
                      email: 'applicant@test.com',
                      full_name: 'Applicant',
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {
            update: updateMock,
          };
        }
        return {};
      });

      await service.reviewRequest('req-1', 'admin-1', 'approved', 'Welcome aboard!');

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'approved',
          reviewed_by: 'admin-1',
          admin_notes: 'Welcome aboard!',
        }),
      );
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('support@tryscriptai.com'),
          to: 'applicant@test.com',
          subject: expect.stringContaining('approved'),
          html: expect.stringContaining('Welcome aboard!'),
        }),
      );
    });

    it('does not send approval email for denied action', async () => {
      const sendMock = jest.fn();
      (service as any).resend = { emails: { send: sendMock } };

      let requestFetchCount = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'affiliate_requests') {
          requestFetchCount += 1;
          if (requestFetchCount === 1) {
            return {
              select: () => ({
                eq: () => ({
                  single: () => ({
                    data: {
                      id: 'req-1',
                      status: 'pending',
                      email: 'applicant@test.com',
                      full_name: 'Applicant',
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          return {
            update: () => ({
              eq: () => ({
                select: () => ({
                  single: () => ({ data: { id: 'req-1', status: 'denied' }, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      await service.reviewRequest('req-1', 'admin-1', 'denied', 'Not a fit right now');

      expect(sendMock).not.toHaveBeenCalled();
    });

    it('throws when approved but email provider is not configured', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'affiliate_requests') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    id: 'req-1',
                    status: 'pending',
                    email: 'applicant@test.com',
                    full_name: 'Applicant',
                  },
                  error: null,
                }),
              }),
            }),
            update: () => ({
              eq: () => ({
                select: () => ({
                  single: () => ({ data: { id: 'req-1', status: 'approved' }, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      await expect(
        service.reviewRequest('req-1', 'admin-1', 'approved'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
