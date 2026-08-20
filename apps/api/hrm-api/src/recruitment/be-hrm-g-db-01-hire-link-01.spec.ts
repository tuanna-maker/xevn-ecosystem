/**
 * @CODE-MEMORY
 * Screen:     Jest — G-DB-01 hire → employee_id soft link
 * UC:         UC-HRM-INT-01
 * BR:         G-DB-01 · FR-HRM-INT-01 Diễn biến #5/#7
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33
 * TechSpec:   docs/hrm/TECHSPEC.md §17.3 G-DB-01
 * WorkItem:   BE-HRM-G-DB-01-HIRE-LINK-01
 * Coded:      2026-07-21
 * must_keep:  G-RC-01 · leave CREATE · U65 no seed · no hard REFERENCES
 */
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  assertHireEmployeeLinkOrThrow,
  HRM_REC_HIRE_400,
  HRM_REC_HIRE_409,
  isHiredStage,
  resolveHireEmployeeId,
} from './hire-employee-link';
import { RecruitmentCatalogService } from './recruitment-catalog.service';

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

function ceoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'group_ceo',
  });
}

describe('BE-HRM-G-DB-01 hire-employee-link helpers', () => {
  it('isHiredStage only matches hired', () => {
    expect(isHiredStage('hired')).toBe(true);
    expect(isHiredStage('HIRED')).toBe(true);
    expect(isHiredStage('offer')).toBe(false);
    expect(isHiredStage(null)).toBe(false);
  });

  it('resolveHireEmployeeId prefers explicit then existing then reverse link', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 'emp-reverse' }] }),
    };
    await expect(
      resolveHireEmployeeId(db, 'cand-1', {
        explicitEmployeeId: 'emp-explicit',
        existingEmployeeId: 'emp-existing',
      }),
    ).resolves.toBe('emp-explicit');
    await expect(
      resolveHireEmployeeId(db, 'cand-1', {
        existingEmployeeId: 'emp-existing',
      }),
    ).resolves.toBe('emp-existing');
    await expect(resolveHireEmployeeId(db, 'cand-1', {})).resolves.toBe(
      'emp-reverse',
    );
    expect(db.query).toHaveBeenCalled();
  });

  it('assertHireEmployeeLinkOrThrow rejects when no link (HRM-REC-HIRE-400)', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    await expect(
      assertHireEmployeeLinkOrThrow(db, 'cand-1', 'holding', {}),
    ).rejects.toMatchObject({ code: HRM_REC_HIRE_400 });
  });

  it('assertHireEmployeeLinkOrThrow rejects company mismatch (HRM-REC-HIRE-409)', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({
        rows: [{ id: 'emp-1', company_id: 'xe-du-lich' }],
      }),
    };
    await expect(
      assertHireEmployeeLinkOrThrow(db, 'cand-1', 'holding', {
        explicitEmployeeId: 'emp-1',
      }),
    ).rejects.toMatchObject({ code: HRM_REC_HIRE_409 });
  });
});

describe('BE-HRM-G-DB-01 RecruitmentCatalogService hire path', () => {
  const candidateId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  const employeeId = '11111111-2222-4333-8444-555555555555';
  const companyId = 'holding';

  it('rejects stage=hired without employee link (HRM-REC-HIRE-400)', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        if (String(sql).includes('FROM public.candidates WHERE id')) {
          return {
            rows: [
              {
                id: candidateId,
                company_id: companyId,
                stage: 'offer',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        // reverse link miss + employee lookup miss
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    await expect(
      service.updateCandidatePoolStage(
        candidateId,
        companyId,
        'hired',
        `Bearer ${ceoToken()}`,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_HIRE_400 });
  });

  it('happy path: stage=hired with employee_id stamps soft FK and returns hired', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        const s = String(sql);
        if (s.includes('FROM public.candidates WHERE id')) {
          return {
            rows: [
              {
                id: candidateId,
                company_id: companyId,
                stage: 'offer',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        if (s.includes('FROM public.employees') && s.includes('WHERE id =')) {
          return { rows: [{ id: employeeId, company_id: companyId }] };
        }
        if (s.includes('SET stage = $2, employee_id = $3::uuid')) {
          return {
            rows: [
              {
                id: candidateId,
                company_id: companyId,
                stage: 'hired',
                employee_id: employeeId,
              },
            ],
          };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    const row = await service.updateCandidatePoolStage(
      candidateId,
      companyId,
      'hired',
      `Bearer ${ceoToken()}`,
      employeeId,
    );
    expect(row).toMatchObject({ stage: 'hired', employee_id: employeeId });
    const stampCall = (db.query as jest.Mock).mock.calls.find(([sql]) =>
      String(sql).includes('employee_id = $3::uuid'),
    );
    expect(stampCall?.[1]).toEqual([candidateId, 'hired', employeeId]);
  });

  it('updateCandidatePool rejects hired without link (FE PATCH path)', async () => {
    const db = {
      query: jest.fn(async (sql: string) => {
        if (String(sql).includes('FROM public.candidates WHERE id')) {
          return {
            rows: [
              {
                company_id: companyId,
                stage: 'offer',
                workflow_instance_id: null,
                employee_id: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    await expect(
      service.updateCandidatePool(
        candidateId,
        companyId,
        { stage: 'hired' },
        `Bearer ${ceoToken()}`,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_HIRE_400 });
  });

  it('createCandidatePool rejects stage=hired without employee_id', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const service = new RecruitmentCatalogService(db, mockBridge() as never);
    await expect(
      service.createCandidatePool(
        {
          company_id: companyId,
          full_name: 'Nguyễn Văn A',
          stage: 'hired',
        },
        `Bearer ${ceoToken()}`,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_HIRE_400 });
  });
});
