import { LegalEntityProfileService } from './legal-entity-profile.service';
import type { XbosDbService } from '../db/xbos-db.service';

describe('LegalEntityProfileService', () => {
  it('scopes legal document file lookup by tenant and company', async () => {
    const query = jest.fn(async (_sql: string, _params: unknown[]) => ({ rows: [] }));
    const service = new LegalEntityProfileService({ query } as unknown as XbosDbService);

    await expect(
      service.streamDocumentFile('xevn', 'holding', '74f9d798-e4c4-44c5-a087-ad6d4a611f4d'),
    ).rejects.toMatchObject({ code: 'XBOS-DOC-404' });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('tenant_id = $2 AND company_id = $3'),
      ['74f9d798-e4c4-44c5-a087-ad6d4a611f4d', 'xevn', 'holding'],
    );
  });
});
