import { mkdir, writeFile } from 'node:fs/promises';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { DecisionsService } from './decisions.service';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

describe('DecisionsService', () => {
  let service: DecisionsService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new DecisionsService(db);
  });

  it('UC-HRM-27: listDecisions embed decisions/report scope for group CEO main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hr_decisions')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.listDecisions({ company_id: 'main', page_size: '20', page: '1' }, `Bearer ${token}`);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([expect.any(Array)]),
    );
  });

  it('accepts legacy create payload without decision_code/title', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('INSERT INTO public.hr_decisions')) {
        return {
          rows: [
            {
              id: 'dec-legacy',
              company_id: 'holding',
              decision_code: 'DEC-123',
              decision_type: 'promotion',
              title: 'QA CRUD matrix close',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const out = await service.createDecision({
      company_id: 'holding',
      decision_type: 'promotion',
      decision_date: '2026-07-01',
      reason: 'QA CRUD matrix close',
      employee_name: 'QA Decision',
    });

    expect(out).toBeDefined();
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.hr_decisions'),
      expect.arrayContaining(['holding', 'promotion']),
    );
  });

  it('getDecisionById keeps list/detail scope parity for company_id=main (G-INT-04)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const decisionId = 'dec-holding-1';
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hr_decisions WHERE') && sql.includes('LIMIT 1')) {
        return {
          rows: [
            {
              id: decisionId,
              company_id: 'holding',
              decision_code: 'QD-1',
              decision_type: 'appointment',
              title: 't',
              content: null,
              employee_id: null,
              employee_name: 'n',
              employee_code: null,
              department: null,
              position: null,
              effective_date: null,
              expiry_date: null,
              signer_name: null,
              signer_position: null,
              signing_date: null,
              file_url: null,
              status: 'draft',
              notes: null,
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.getDecisionById(decisionId, 'main', `Bearer ${token}`);

    expect(result.id).toBe(decisionId);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([decisionId, expect.any(Array)]),
    );
  });

  it('getDecisionById returns 404 when decision is outside member CEO scope (G-INT-04)', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hr_decisions WHERE') && sql.includes('LIMIT 1')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.getDecisionById('dec-holding-1', 'main', `Bearer ${token}`),
    ).rejects.toMatchObject({ code: 'HRM-DEC-404' });
  });

  it('updateDecision asserts resource company_id before patch (P1-02)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hr_decisions WHERE') && sql.includes('LIMIT 1')) {
        return {
          rows: [
            {
              id: 'dec-1',
              company_id: 'other-co',
              decision_code: 'QD-1',
              decision_type: 'appointment',
              title: 't',
              content: null,
              employee_id: null,
              employee_name: 'n',
              employee_code: null,
              department: null,
              position: null,
              effective_date: null,
              expiry_date: null,
              signer_name: null,
              signer_position: null,
              signing_date: null,
              file_url: null,
              status: 'draft',
              notes: null,
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateDecision('dec-1', { company_id: 'main', title: 'x' }, `Bearer ${token}`),
    ).rejects.toMatchObject({ code: 'HRM-DEC-409' });
  });

  it('saveDecisionFile writes disk stub and updates file_url (P1-SUPA-BE-03)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const decisionRow = {
      id: 'dec-1',
      company_id: 'holding',
      decision_code: 'QD-1',
      decision_type: 'appointment',
      title: 't',
      content: null,
      employee_id: null,
      employee_name: 'n',
      employee_code: null,
      department: null,
      position: null,
      effective_date: null,
      expiry_date: null,
      signer_name: null,
      signer_position: null,
      signing_date: null,
      file_url: null,
      status: 'draft',
      notes: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.hr_decisions WHERE') && sql.includes('LIMIT 1')) {
        return { rows: [decisionRow] } as never;
      }
      if (sql.includes('UPDATE public.hr_decisions') && sql.includes('file_url')) {
        return {
          rows: [{ ...decisionRow, file_url: '/api/hrm/decisions/files/dec-1-test.pdf' }],
        } as never;
      }
      return { rows: [] } as never;
    });

    const out = await service.saveDecisionFile('dec-1', 'main', `Bearer ${token}`, {
      buffer: Buffer.from('pdf'),
      originalname: 'scan.pdf',
      mimetype: 'application/pdf',
    });

    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
    expect(out.file_url).toContain('/api/hrm/decisions/files/');
    expect(out.storage_path).toBeDefined();
  });
});
