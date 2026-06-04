import { RaciGovernanceService } from './raci-governance.service';

describe('RaciGovernanceService (P1-FIX-RACI-SEED-02)', () => {
  const memberCompanyUuid = 'f01bb8dc-99fd-46bf-9653-21ae9f696e5a';
  const dbUuid = 'd76b2d55-9fea-4e77-ac87-92bd43abb9d7';

  let service: RaciGovernanceService;
  const db = { query: jest.fn() };
  const platformAudit = { emit: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RaciGovernanceService(db as never, platformAudit as never);
  });

  it('member partition matrix uses master-tenant catalog UUIDs (not seed-*)', async () => {
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('company_raci_matrix_cell')) {
        return { rows: [] };
      }
      if (sql.includes('raci_activity_catalog') && params?.[0] === 'xevn') {
        return {
          rows: [
            {
              id: dbUuid,
              activity_code: 'BDH-001',
              domain_code: 'ban_dieu_hanh',
              domain_label: 'Ban Điều hành',
              seq_no: 1,
              name: 'Sample',
              default_matrix: { col_hcns: 'R' },
            },
          ],
        };
      }
      if (sql.includes('raci_activity_catalog') && params?.[0] === 'xe-du-lich') {
        return { rows: [] };
      }
      return { rows: [] };
    });

    const matrix = await service.getCompanyMatrix('xe-du-lich', memberCompanyUuid);
    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].activity_id).toBe(dbUuid);
    expect(matrix.rows[0].activity_id).not.toMatch(/^seed-/);
  });

  it('remaps legacy seed-* override keys to catalog UUID on read', async () => {
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('company_raci_matrix_cell')) {
        return {
          rows: [
            {
              activity_id: 'seed-BDH-001',
              org_column_id: 'col_hcns',
              raci_letters: 'A',
            },
          ],
        };
      }
      if (sql.includes('raci_activity_catalog')) {
        return {
          rows: [
            {
              id: dbUuid,
              activity_code: 'BDH-001',
              domain_code: 'ban_dieu_hanh',
              domain_label: 'Ban Điều hành',
              seq_no: 1,
              name: 'Sample',
              default_matrix: { col_hcns: 'R' },
            },
          ],
        };
      }
      return { rows: [] };
    });

    const matrix = await service.getCompanyMatrix('xe-du-lich', memberCompanyUuid);
    expect(matrix.rows[0].matrix.col_hcns).toBe('A');
    expect(matrix.rows[0].has_override).toBe(true);
  });

  it('rejects PUT when activity_id is seed-* placeholder', async () => {
    await expect(
      service.upsertMatrixCell('xe-du-lich', memberCompanyUuid, {
        activity_id: 'seed-BDH-001',
        org_column_id: 'col_hcns',
        raci_letters: 'R',
      }),
    ).rejects.toMatchObject({ code: 'XBOS-RACI-503' });
  });
});
