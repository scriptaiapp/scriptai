import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockRpc = jest.fn();
const mockFrom = jest.fn();
const mockAdminUpdateUser = jest.fn();

const mockSupabaseClient = {
  from: mockFrom,
  rpc: mockRpc,
};

const mockAdminClient = {
  auth: { admin: { updateUserById: mockAdminUpdateUser } },
};

const mockSupabaseService = {
  getClient: () => mockSupabaseClient,
  getAdminClient: () => mockAdminClient,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-key') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('forgotPassword', () => {
    it('should return generic message even when user not found', async () => {
      mockFrom.mockReturnValue({
        select: () => ({ eq: () => ({ maybeSingle: () => ({ data: null }) }) }),
      });

      const result = await service.forgotPassword('unknown@test.com');
      expect(result.message).toContain('If an account exists');
    });

    it('should generate OTP and store it when user exists', async () => {
      const updateMock = jest.fn().mockReturnValue({
        eq: () => ({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () => ({ data: { id: 'profile-1' } }),
              }),
            }),
            update: updateMock,
          };
        }
        return {};
      });

      const result = await service.forgotPassword('user@test.com');
      expect(result.message).toContain('If an account exists');
      expect(updateMock).toHaveBeenCalled();
    });

    it('should throw when OTP storage fails', async () => {
      mockFrom.mockImplementation((table: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => ({ data: { id: 'profile-1' } }),
          }),
        }),
        update: () => ({
          eq: () => ({ error: { message: 'DB error' } }),
        }),
      }));

      await expect(service.forgotPassword('user@test.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it('should return invalid for non-existent OTP', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: jest.fn().mockReturnThis(),
          single: () => ({ data: null, error: { message: 'not found' } }),
        }),
      });
      mockRpc.mockResolvedValue({});

      const result = await service.verifyOtp('user@test.com', '000000');
      expect(result.valid).toBe(false);
    });

    it('should return invalid for expired OTP', async () => {
      const expiredDate = new Date(Date.now() - 60000).toISOString();
      mockFrom.mockReturnValue({
        select: () => ({
          eq: jest.fn().mockReturnThis(),
          single: () => ({
            data: {
              id: 'p-1',
              password_reset_otp: '123456',
              password_reset_otp_expires_at: expiredDate,
              password_reset_otp_attempts: 0,
              password_reset_otp_verified: false,
            },
            error: null,
          }),
        }),
      });

      const result = await service.verifyOtp('user@test.com', '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should block after 5 failed attempts', async () => {
      const futureDate = new Date(Date.now() + 600000).toISOString();
      mockFrom.mockReturnValue({
        select: () => ({
          eq: jest.fn().mockReturnThis(),
          single: () => ({
            data: {
              id: 'p-1',
              password_reset_otp: '123456',
              password_reset_otp_expires_at: futureDate,
              password_reset_otp_attempts: 5,
              password_reset_otp_verified: false,
            },
            error: null,
          }),
        }),
      });

      const result = await service.verifyOtp('user@test.com', '123456');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Too many attempts');
    });
  });

  describe('resetPassword', () => {
    it('should throw UnauthorizedException for invalid reset code', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: jest.fn().mockReturnThis(),
          gt: jest.fn().mockReturnThis(),
          single: () => ({ data: null, error: { message: 'not found' } }),
        }),
      });

      await expect(
        service.resetPassword('user@test.com', '000000', 'newpass', 'newpass')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when admin client is missing', async () => {
      const serviceWithNoAdmin = new AuthService(
        { getClient: () => mockSupabaseClient, getAdminClient: () => null } as unknown as SupabaseService,
        { get: jest.fn() } as unknown as ConfigService,
      );

      await expect(
        serviceWithNoAdmin.resetPassword('user@test.com', '123456', 'new', 'new')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
