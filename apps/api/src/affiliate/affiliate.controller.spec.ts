import { UnauthorizedException } from '@nestjs/common';
import { AffiliateController } from './affiliate.controller';

describe('AffiliateController', () => {
  const affiliateService = {
    submitRequest: jest.fn(),
    getRequestStatus: jest.fn(),
    getRequests: jest.fn(),
    reviewRequest: jest.fn(),
    createAffiliateLinkForRep: jest.fn(),
    getLsAffiliates: jest.fn(),
    getLsAffiliateSignupUrl: jest.fn(),
  };

  let controller: AffiliateController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AffiliateController(affiliateService as any);
  });

  it('apply delegates to service with authenticated user id', () => {
    const body = { reason: 'I can promote this.' };
    const req = { user: { id: 'user-1' } } as any;

    controller.apply(body as any, req);

    expect(affiliateService.submitRequest).toHaveBeenCalledWith('user-1', body);
  });

  it('apply throws UnauthorizedException without user id', () => {
    expect(() =>
      controller.apply({ reason: 'x' } as any, {} as any),
    ).toThrow(UnauthorizedException);
  });

  it('reviewRequest delegates to service with reviewer id', () => {
    const req = { user: { id: 'admin-1' } } as any;
    const body = { status: 'approved' as const, admin_notes: 'Approved' };

    controller.reviewRequest('req-1', body, req);

    expect(affiliateService.reviewRequest).toHaveBeenCalledWith(
      'req-1',
      'admin-1',
      'approved',
      'Approved',
    );
  });
});
