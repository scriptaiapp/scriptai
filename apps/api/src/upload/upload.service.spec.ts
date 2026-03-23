import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { SupabaseService } from '../supabase/supabase.service';

const mockUpload = jest.fn();
const mockRemove = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockUpdate = jest.fn();
const mockFrom = jest.fn();

const mockStorageFrom = jest.fn().mockReturnValue({
  upload: mockUpload,
  remove: mockRemove,
  getPublicUrl: mockGetPublicUrl,
});

const mockSupabaseClient = {
  from: mockFrom,
  storage: { from: mockStorageFrom },
};

const mockSupabaseService = {
  getClient: () => mockSupabaseClient,
};

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('uploadAvatar', () => {
    it('should throw BadRequestException when no file provided', async () => {
      await expect(
        service.uploadAvatar('user-1', undefined as unknown as Express.Multer.File)
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload file and return public URL', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({ data: { avatar_url: null } }),
          }),
        }),
        update: () => ({ eq: () => ({ error: null }) }),
      });

      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.test/avatar.jpg' } });

      const file = {
        originalname: 'avatar.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = await service.uploadAvatar('user-1', file);
      expect(result.url).toBe('https://cdn.test/avatar.jpg');
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and clear URL', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: { avatar_url: 'https://cdn.test/user_avatar/user-1/old.jpg' },
            }),
          }),
        }),
        update: () => ({ eq: () => ({ error: null }) }),
      });
      mockRemove.mockResolvedValue({ error: null });

      const result = await service.deleteAvatar('user-1');
      expect(result.message).toBe('Avatar deleted.');
      expect(mockRemove).toHaveBeenCalled();
    });

    it('should handle missing avatar gracefully', async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => ({ data: { avatar_url: null } }),
          }),
        }),
        update: () => ({ eq: () => ({ error: null }) }),
      });

      const result = await service.deleteAvatar('user-1');
      expect(result.message).toBe('Avatar deleted.');
      expect(mockRemove).not.toHaveBeenCalled();
    });
  });
});
