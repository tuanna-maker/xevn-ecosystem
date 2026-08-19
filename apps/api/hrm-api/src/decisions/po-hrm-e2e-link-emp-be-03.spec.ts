/**
 * PO-HRM-E2E-LINK-EMP-BE-03 — R-EMP-DEC-WH-NEO-CATALOG
 * @spec_read_ack
 * - srs: FR-UC-BP-CORE-01a · AC-DEC-WH-01/02 · BR-DEC-05
 * - tech_spec: PO-HRM-E2E-LINK-EMP-SA-01 F-CORE-DEC-01/02
 * - db_design: PO-HRM-E2E-LINK-EMP-DB-01 · person-bound + effective WH
 * - residual: QA R2 HRD_01 effective → work_history_id=null (catalog ≠ appointment|transfer neo)
 */
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  DecisionsService,
  HRM_DEC_EMP_REQUIRED,
  PERSON_BOUND_DECISION_TYPES,
  WORK_HISTORY_NEO_DECISION_TYPES,
  isPersonBoundDecisionType,
  isWorkHistoryNeoDecisionType,
  resolveWorkHistoryEventType,
} from './decisions.service';

const EMP_ID = '0500220b-f289-40df-b07e-86316285439b';
const DEC_ID = 'bf9a0b74-c365-4cde-b4f8-5f0ba43359d8';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

describe('PO-HRM-E2E-LINK-EMP-BE-03 catalog neo', () => {
  it('maps live HRD_* catalog codes into person-bound / WH neo sets', () => {
    expect(PERSON_BOUND_DECISION_TYPES.has('hrd_01')).toBe(true);
    expect(PERSON_BOUND_DECISION_TYPES.has('hrd_02')).toBe(true);
    expect(PERSON_BOUND_DECISION_TYPES.has('hrd_03')).toBe(true);
    expect(WORK_HISTORY_NEO_DECISION_TYPES.has('hrd_01')).toBe(true);
    expect(WORK_HISTORY_NEO_DECISION_TYPES.has('hrd_02')).toBe(true);
    expect(WORK_HISTORY_NEO_DECISION_TYPES.has('hrd_03')).toBe(false);
    expect(isPersonBoundDecisionType('HRD_01')).toBe(true);
    expect(isWorkHistoryNeoDecisionType('HRD_01')).toBe(true);
    expect(isWorkHistoryNeoDecisionType('HRD_03')).toBe(false);
    expect(resolveWorkHistoryEventType('HRD_01')).toBe('appointment');
    expect(resolveWorkHistoryEventType('HRD_02')).toBe('termination');
    expect(resolveWorkHistoryEventType('transfer')).toBe('transfer');
    // Legacy aliases retained (jest / empty-catalog path).
    expect(PERSON_BOUND_DECISION_TYPES.has('appointment')).toBe(true);
    expect(PERSON_BOUND_DECISION_TYPES.has('transfer')).toBe(true);
  });

  describe('DecisionsService create effective HRD_01', () => {
    let service: DecisionsService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as jest.Mocked<HrmDbService>;
      service = new DecisionsService(db);
    });

    it('HRD_01 without employee_id → HRM-DEC-EMP-REQUIRED', async () => {
      await expect(
        service.createDecision({
          company_id: 'holding',
          decision_type: 'HRD_01',
          employee_name: 'No Id',
          position_key: 'CEO',
          status: 'effective',
        }),
      ).rejects.toMatchObject({ code: HRM_DEC_EMP_REQUIRED });
    });

    it('F-CORE-DEC-02: HRD_01 + effective UPSERT WH + returns work_history_id', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
        if (sql.includes('FROM public.employees WHERE')) {
          return {
            rows: [{ id: EMP_ID, full_name: 'UAT NV 0100', employee_code: 'UAT-0100' }],
          } as never;
        }
        if (sql.includes('INSERT INTO public.hr_decisions')) {
          expect(params).toEqual(expect.arrayContaining(['HRD_01', EMP_ID, 'effective']));
          return {
            rows: [
              {
                id: DEC_ID,
                company_id: 'holding',
                decision_code: 'QD-EMPQA-HMSE7X',
                decision_type: 'HRD_01',
                title: 'QA QSĐ',
                content: null,
                employee_id: EMP_ID,
                employee_name: 'UAT NV 0100',
                employee_code: 'UAT-0100',
                department: null,
                department_key: null,
                position: 'Tổng Giám đốc',
                position_key: 'CEO',
                effective_date: '2026-08-06',
                expiry_date: null,
                signer_name: null,
                signer_position: null,
                signer_position_key: null,
                signing_date: null,
                file_url: null,
                status: 'effective',
                notes: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.employee_work_timeline') && sql.includes('decision_id')) {
          return { rows: [] } as never;
        }
        if (sql.includes('INSERT INTO public.employee_work_timeline')) {
          // event_type appointment for HRD_01; decision_id soft FK
          expect(params).toEqual(
            expect.arrayContaining([EMP_ID, 'appointment', 'CEO', DEC_ID]),
          );
          return { rows: [{ id: 'wh-hrd01-1' }] } as never;
        }
        return { rows: [] } as never;
      });

      const out = await service.createDecision(
        {
          company_id: 'holding',
          decision_type: 'HRD_01',
          decision_code: 'QD-EMPQA-HMSE7X',
          title: 'QA QSĐ',
          employee_id: EMP_ID,
          employee_name: 'UAT NV 0100',
          position_key: 'CEO',
          status: 'effective',
          effective_date: '2026-08-06',
        },
        `Bearer ${token}`,
      );

      expect(out).toMatchObject({
        id: DEC_ID,
        decision_type: 'HRD_01',
        status: 'effective',
        work_history_id: 'wh-hrd01-1',
      });
      expect(
        db.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO public.employee_work_timeline')),
      ).toBe(true);
    });

    it('HRD_03 effective is person-bound but does not invent WH row', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employees WHERE')) {
          return {
            rows: [{ id: EMP_ID, full_name: 'UAT NV 0100', employee_code: 'UAT-0100' }],
          } as never;
        }
        if (sql.includes('INSERT INTO public.hr_decisions')) {
          return {
            rows: [
              {
                id: DEC_ID,
                company_id: 'holding',
                decision_code: 'QD-DISC',
                decision_type: 'HRD_03',
                title: 'Ky luat',
                content: null,
                employee_id: EMP_ID,
                employee_name: 'UAT NV 0100',
                employee_code: 'UAT-0100',
                department: null,
                department_key: null,
                position: 'Tổng Giám đốc',
                position_key: 'CEO',
                effective_date: '2026-08-06',
                expiry_date: null,
                signer_name: null,
                signer_position: null,
                signer_position_key: null,
                signing_date: null,
                file_url: null,
                status: 'effective',
                notes: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const out = await service.createDecision(
        {
          company_id: 'holding',
          decision_type: 'HRD_03',
          employee_id: EMP_ID,
          employee_name: 'UAT NV 0100',
          position_key: 'CEO',
          status: 'effective',
        },
        `Bearer ${token}`,
      );

      expect((out as { work_history_id?: string | null }).work_history_id).toBeUndefined();
      expect(
        db.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO public.employee_work_timeline')),
      ).toBe(false);
    });

    it('must_keep: legacy appointment still neo-WH when catalog assert absent', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employees WHERE')) {
          return {
            rows: [{ id: EMP_ID, full_name: 'Nguyen A', employee_code: 'NV001' }],
          } as never;
        }
        if (sql.includes('INSERT INTO public.hr_decisions')) {
          return {
            rows: [
              {
                id: DEC_ID,
                company_id: 'holding',
                decision_code: 'QD-LEG',
                decision_type: 'appointment',
                title: 'Legacy',
                content: null,
                employee_id: EMP_ID,
                employee_name: 'Nguyen A',
                employee_code: 'NV001',
                department: null,
                department_key: null,
                position: 'NV',
                position_key: 'NV_KD',
                effective_date: '2026-08-01',
                expiry_date: null,
                signer_name: null,
                signer_position: null,
                signer_position_key: null,
                signing_date: null,
                file_url: null,
                status: 'effective',
                notes: null,
                created_at: '2026-08-06',
                updated_at: '2026-08-06',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.employee_work_timeline') && sql.includes('decision_id')) {
          return { rows: [] } as never;
        }
        if (sql.includes('INSERT INTO public.employee_work_timeline')) {
          return { rows: [{ id: 'wh-legacy' }] } as never;
        }
        return { rows: [] } as never;
      });

      const out = await service.createDecision(
        {
          company_id: 'holding',
          decision_type: 'appointment',
          employee_id: EMP_ID,
          employee_name: 'Nguyen A',
          position_key: 'NV_KD',
          status: 'effective',
        },
        `Bearer ${token}`,
      );
      expect((out as { work_history_id?: string }).work_history_id).toBe('wh-legacy');
    });
  });
});
