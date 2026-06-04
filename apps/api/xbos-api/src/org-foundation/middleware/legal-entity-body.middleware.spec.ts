import { legalEntityBodyMiddleware } from './legal-entity-body.middleware';

describe('legalEntityBodyMiddleware', () => {
  it('enriches req.body before route handlers', () => {
    const req = {
      method: 'PUT',
      originalUrl: '/api/xbos/org-foundation/legal-entities/uuid',
      body: {
        payload: { companyForm: { shortName: 'XE_DU_LICH', nameVi: 'saveave11111222' } },
      },
    };
    let nextCalled = false;
    legalEntityBodyMiddleware(req as never, {} as never, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(req.body).toMatchObject({ code: 'XE_DU_LICH', name: 'saveave11111222' });
  });
});
