/**
 * PO-HRM-E2E-LINK-EMP-BE-01 — F-CORE-DEC/WH/SI/HTP + scope_parity
 * @spec_read_ack
 * - srs: SRS_HRM_ENTERPRISE CORE-01a · CORE-10 · REC-07 AC-HTP-05
 * - tech_spec: PO-HRM-E2E-LINK-EMP-SA-01 F-CORE-DEC-01/02 · WH-02 · SI-03 · HTP-05
 * - db_design: PO-HRM-E2E-LINK-EMP-DB-01 CONFIRMED
 */
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  DecisionsService,
  HRM_DEC_EMP_REQUIRED,
  PERSON_BOUND_DECISION_TYPES,
} from '../decisions/decisions.service';
import {
  EmployeeInsurancesService,
  HRM_SI_ACTION_400,
} from '../employee-insurances/employee-insurances.service';
import {
  EmployeeProfileService,
  HRM_WH_PICK_REQUIRED,
} from '../employees/employee-profile.service';
import { EmployeesService } from '../employees/employees.service';

const EMP_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const DEC_ID = 'a1111111-1111-4111-8111-111111111111';
const INS_ID = 'b2222222-2222-4222-8222-222222222222';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

describe('PO-HRM-E2E-LINK-EMP-BE-01', () => {
  describe('F-CORE-DEC-01/02 DecisionsService', () => {
    let service: DecisionsService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new DecisionsService(db);
    });

    it('PERSON_BOUND defaults include appointment + transfer (+ HRD_* catalog aliases BE-03)', () => {
      expect(PERSON_BOUND_DECISION_TYPES.has('appointment')).toBe(true);
      expect(PERSON_BOUND_DECISION_TYPES.has('transfer')).toBe(true);
      expect(PERSON_BOUND_DECISION_TYPES.has('hrd_01')).toBe(true);
    });

    it('VAL-EMP-DB-01: appointment without employee_id → HRM-DEC-EMP-REQUIRED', async () => {
      await expect(
        service.createDecision({
          company_id: 'holding',
          decision_type: 'appointment',
          employee_name: 'No Id',
          position_key: 'NV_KD',
        }),
      ).rejects.toMatchObject({ code: HRM_DEC_EMP_REQUIRED });
    });

    it('F-CORE-DEC-02: status=effective UPSERT WH by decision_id (insert path)', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employees WHERE')) {
          return {
            rows: [
              { id: EMP_ID, full_name: 'Nguyen A', employee_code: 'NV001' },
            ],
          } as never;
        }
        if (sql.includes('INSERT INTO public.hr_decisions')) {
          return {
            rows: [
              {
                id: DEC_ID,
                company_id: 'holding',
                decision_code: 'QD-1',
                decision_type: 'appointment',
                title: 'Bo nhiem',
                content: null,
                employee_id: EMP_ID,
                employee_name: 'Nguyen A',
                employee_code: 'NV001',
                department: null,
                department_key: null,
                position: 'Nhan vien KD',
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
        if (
          sql.includes('FROM public.employee_work_timeline') &&
          sql.includes('decision_id')
        ) {
          return { rows: [] } as never;
        }
        if (sql.includes('INSERT INTO public.employee_work_timeline')) {
          return { rows: [{ id: 'wh-1' }] } as never;
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
          effective_date: '2026-08-01',
        },
        `Bearer ${token}`,
      );

      expect(out).toMatchObject({ id: DEC_ID, status: 'effective' });
      expect((out as { work_history_id?: string }).work_history_id).toBe(
        'wh-1',
      );
      expect(
        db.query.mock.calls.some(([sql]) =>
          String(sql).includes('INSERT INTO public.employee_work_timeline'),
        ),
      ).toBe(true);
    });

    it('scope_parity: getDecisionById uses company_id = ANY for group CEO main', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.hr_decisions WHERE') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: DEC_ID,
                company_id: 'holding',
                decision_code: 'QD-1',
                decision_type: 'appointment',
                title: 't',
                content: null,
                employee_id: EMP_ID,
                employee_name: 'n',
                employee_code: null,
                department: null,
                department_key: null,
                position: null,
                position_key: 'NV_KD',
                effective_date: null,
                expiry_date: null,
                signer_name: null,
                signer_position: null,
                signer_position_key: null,
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

      await service.getDecisionById(DEC_ID, 'main', `Bearer ${token}`);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = ANY'),
        expect.arrayContaining([DEC_ID, expect.any(Array)]),
      );
    });
  });

  describe('F-CORE-WH-02 EmployeeProfileService', () => {
    let profile: EmployeeProfileService;
    let employees: jest.Mocked<EmployeesService>;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as jest.Mocked<HrmDbService>;
      employees = {
        getEmployeeById: jest.fn().mockResolvedValue({
          id: EMP_ID,
          company_id: 'holding',
          full_name: 'Nguyen A',
        }),
      } as unknown as jest.Mocked<EmployeesService>;
      profile = new EmployeeProfileService(db, employees);
    });

    it('rejects free-text position without position_key → HRM-WH-PICK-REQUIRED', async () => {
      await expect(
        profile.createWorkTimelineItem(
          EMP_ID,
          { company_id: 'holding' },
          { event_date: '2026-08-01', title: 'x', position: 'Free text only' },
          `Bearer ${groupCeoToken()}`,
        ),
      ).rejects.toMatchObject({ code: HRM_WH_PICK_REQUIRED });
    });

    it('soft-archives WH on delete (no hard DELETE)', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('SELECT company_id FROM public.employee_work_timeline')
        ) {
          return { rows: [{ company_id: 'holding' }] } as never;
        }
        if (
          sql.includes('UPDATE public.employee_work_timeline') &&
          sql.includes('archived_at')
        ) {
          return { rows: [{ id: 'wh-1' }] } as never;
        }
        return { rows: [] } as never;
      });
      const out = await profile.deleteWorkTimelineItem(
        'wh-1',
        EMP_ID,
        { company_id: 'holding' },
        `Bearer ${groupCeoToken()}`,
      );
      expect(out).toMatchObject({ id: 'wh-1', archived: true });
      expect(
        db.query.mock.calls.some(([sql]) =>
          String(sql).includes('DELETE FROM public.employee_work_timeline'),
        ),
      ).toBe(false);
    });
  });

  describe('F-CORE-SI-03 EmployeeInsurancesService', () => {
    let service: EmployeeInsurancesService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new EmployeeInsurancesService(db);
    });

    it('scope_parity list↔get use company_id = ANY for group CEO main', async () => {
      const token = groupCeoToken();
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.employee_insurances') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: INS_ID,
                employee_id: EMP_ID,
                company_id: 'holding',
                type: 'social',
                provider: 'BHXH',
                policy_number: null,
                start_date: '2026-01-01',
                end_date: null,
                contribution: 100,
                employer_contribution: 200,
                status: 'active',
                notes: null,
                policy_id: null,
                si_number: null,
                archived_at: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.hrm_insurance_rate_period')) {
          return { rows: [] } as never;
        }
        if (sql.includes('FROM public.employee_insurances')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await service.list({ company_id: 'main' }, `Bearer ${token}`);
      await service.getById(INS_ID, 'main', `Bearer ${token}`);

      const listCall = db.query.mock.calls.find(
        ([sql]) =>
          String(sql).includes('FROM public.employee_insurances') &&
          !String(sql).includes('LIMIT 1'),
      );
      const getCall = db.query.mock.calls.find(
        ([sql]) =>
          String(sql).includes('FROM public.employee_insurances') &&
          String(sql).includes('LIMIT 1'),
      );
      expect(listCall?.[0]).toEqual(
        expect.stringContaining('company_id = ANY'),
      );
      expect(getCall?.[0]).toEqual(expect.stringContaining('company_id = ANY'));
    });

    it('applyAction suspend without reason → HRM-SI-ACTION-400', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.employee_insurances') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: INS_ID,
                employee_id: EMP_ID,
                company_id: 'holding',
                type: 'social',
                provider: 'BHXH',
                policy_number: null,
                start_date: '2026-01-01',
                end_date: null,
                contribution: 100,
                employer_contribution: 200,
                status: 'active',
                notes: null,
                policy_id: null,
                si_number: null,
                archived_at: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          } as never;
        }
        if (sql.includes('FROM public.hrm_insurance_rate_period')) {
          return { rows: [] } as never;
        }
        return { rows: [] } as never;
      });

      await expect(
        service.applyAction(
          INS_ID,
          {
            company_id: 'holding',
            action: 'suspend',
            effective_from: '2026-08-01',
          },
          `Bearer ${groupCeoToken()}`,
        ),
      ).rejects.toMatchObject({ code: HRM_SI_ACTION_400 });
    });

    it('applyAction close appends period + sets enrollment closed', async () => {
      let enrollmentStatus = 'active';
      db.query.mockImplementation(async (sql: string) => {
        if (
          sql.includes('FROM public.employee_insurances') &&
          sql.includes('LIMIT 1')
        ) {
          return {
            rows: [
              {
                id: INS_ID,
                employee_id: EMP_ID,
                company_id: 'holding',
                type: 'social',
                provider: 'BHXH',
                policy_number: null,
                start_date: '2026-01-01',
                end_date: null,
                contribution: 100,
                employer_contribution: 200,
                status: enrollmentStatus,
                notes: null,
                policy_id: null,
                si_number: null,
                archived_at: null,
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
              },
            ],
          } as never;
        }
        if (
          sql.includes('UPDATE public.employee_insurances') &&
          sql.includes('SET status')
        ) {
          enrollmentStatus = 'closed';
          return { rows: [] } as never;
        }
        if (
          sql.includes('FROM public.hrm_insurance_rate_period') &&
          sql.includes('ORDER BY')
        ) {
          return {
            rows: [
              {
                id: 'p1',
                enrollment_id: INS_ID,
                company_id: 'holding',
                effective_from: '2026-08-01',
                effective_to: null,
                employee_rate_pct: null,
                employer_rate_pct: null,
                employee_amount: 100,
                employer_amount: 200,
                pay_rate_cfg_id: null,
                period_status: 'closed',
                action: 'close',
                change_reason: null,
                suspend_reason: null,
                archived_at: null,
                created_at: '2026-08-01',
                updated_at: '2026-08-01',
              },
            ],
          } as never;
        }
        return { rows: [] } as never;
      });

      const out = await service.applyAction(
        INS_ID,
        {
          company_id: 'holding',
          action: 'close',
          effective_from: '2026-08-01',
        },
        `Bearer ${groupCeoToken()}`,
      );
      expect(out.status).toBe('closed');
      expect(out.periods?.length).toBeGreaterThan(0);
      expect(out.periods[0].action).toBe('close');
      expect(
        db.query.mock.calls.some(([sql]) =>
          String(sql).includes('INSERT INTO public.hrm_insurance_rate_period'),
        ),
      ).toBe(true);
    });
  });

  describe('F-CORE-HTP-05 EmployeesService.getHireReadiness', () => {
    let service: EmployeesService;
    let db: jest.Mocked<HrmDbService>;

    beforeEach(() => {
      db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as jest.Mocked<HrmDbService>;
      service = new EmployeesService(db);
      jest.spyOn(service, 'getEmployeeById').mockResolvedValue({
        id: EMP_ID,
        company_id: 'holding',
        full_name: 'Nguyen A',
        employee_code: 'NV001',
        email: 'a@xe.vn',
        status: 'active',
      } as never);
    });

    it('no active contract → ready_for_payroll=false + HRM-HTP-NO-ACTIVE-CONTRACT', async () => {
      db.query.mockResolvedValue({ rows: [] } as never);
      const out = await service.getHireReadiness(EMP_ID, {
        company_id: 'holding',
        as_of: '2026-08-06',
      });
      expect(out.ready_for_payroll).toBe(false);
      expect(out.blockers).toContain('HRM-HTP-NO-ACTIVE-CONTRACT');
      expect(out.active_contract).toBeNull();
    });

    it('active contract same company → ready_for_payroll=true', async () => {
      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.employee_contracts')) {
          return { rows: [{ id: 'ctr-1', status: 'active' }] } as never;
        }
        return { rows: [] } as never;
      });
      const out = await service.getHireReadiness(EMP_ID, {
        company_id: 'holding',
        as_of: '2026-08-06',
      });
      expect(out.ready_for_payroll).toBe(true);
      expect(out.active_contract).toEqual({
        contract_id: 'ctr-1',
        status: 'active',
      });
      expect(out.blockers).toEqual([]);
    });
  });
});
