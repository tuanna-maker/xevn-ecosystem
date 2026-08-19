/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * Purpose: Jest — F-CORE-ACT-01 activate GATE/EFF/ATT · U19 · DENY Nest /core · silent allow · typed activated_at invent
 */
import { HttpStatus } from '@nestjs/common';
import type { Server } from 'socket.io';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HrmRealtimeService } from '../realtime/hrm-realtime.service';
import {
  EMP_STATUS_ACTIVE,
  EMP_STATUS_PENDING_DOCS,
  EMPLOYEE_ACTIVATED_EVENT,
  HRM_EMP_ACT_400,
  HRM_EMP_ACT_CHECKLIST_INCOMPLETE,
  HRM_EMP_ACT_ILLEGAL_TRANSITION,
} from './emp-activate.constants';
import { EmpDocumentChecklistService } from './emp-document-checklist.service';
import { EmployeesService } from './employees.service';

describe('PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01', () => {
  const employeeId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';

  const pendingRow = {
    id: employeeId,
    company_id: 'holding',
    employee_code: 'NV001',
    email: 'ceo@xe.vn',
    full_name: 'Nguyen Van A',
    job_title_key: 'CEO',
    manager_id: null,
    status: EMP_STATUS_PENDING_DOCS,
    hired_at: '2024-01-01',
    archived_at: null,
    avatar_url: null,
    candidate_id: null,
    custom_fields: {},
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  let service: EmployeesService;
  let db: jest.Mocked<HrmDbService>;
  let checklist: { evaluateActivationGate: jest.Mock };
  let realtime: HrmRealtimeService;
  let emit: jest.Mock;

  function groupCeoAuth() {
    return `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;
  }

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    checklist = {
      evaluateActivationGate: jest.fn().mockResolvedValue({
        employeeId,
        companyId: 'holding',
        checklist_complete: true,
        can_activate: true,
        blocking_items: [],
      }),
    };

    emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    realtime = new HrmRealtimeService();
    realtime.attachServer({ to } as unknown as Server);

    service = new EmployeesService(
      db,
      undefined,
      undefined,
      undefined,
      checklist as unknown as EmpDocumentChecklistService,
      realtime,
    );

    // ensureSchema / seed path on onModuleInit — skip by not calling it.
    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('FROM public.employees') && s.includes('id = $1')) {
        return { rows: [{ ...pendingRow }], rowCount: 1 };
      }
      if (s.includes('UPDATE public.employees') && s.includes('status = $2')) {
        return {
          rows: [{ ...pendingRow, status: EMP_STATUS_ACTIVE }],
          rowCount: 1,
        };
      }
      if (s.includes('UPDATE public.employees') && s.includes('SET')) {
        return {
          rows: [{ ...pendingRow, status: EMP_STATUS_ACTIVE }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
  });

  it('GATE incomplete → 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE · status unchanged', async () => {
    checklist.evaluateActivationGate.mockResolvedValueOnce({
      employeeId,
      companyId: 'holding',
      checklist_complete: false,
      can_activate: false,
      blocking_items: [
        { documentTypeKey: 'cccd', nameVi: 'CCCD', status: 'missing' },
      ],
    });
    await expect(
      service.activateEmployee(
        employeeId,
        { effective_date: '09/08/2026' },
        'main',
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({
      code: HRM_EMP_ACT_CHECKLIST_INCOMPLETE,
      status: HttpStatus.CONFLICT,
    });
    const updateCalls = db.query.mock.calls.filter((c) =>
      String(c[0]).includes('UPDATE public.employees'),
    );
    expect(updateCalls).toHaveLength(0);
  });

  it('EFF missing/invalid → 400 HRM-EMP-ACT-400 · no epoch junk', async () => {
    await expect(
      service.activateEmployee(
        employeeId,
        { effective_date: '2026-08-09' },
        'main',
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({
      code: HRM_EMP_ACT_400,
      status: HttpStatus.BAD_REQUEST,
    });
    await expect(
      service.activateEmployee(
        employeeId,
        { effective_date: '' },
        'main',
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_EMP_ACT_400 });
  });

  it('illegal transition (not pending_docs) → 409 HRM-EMP-ACT-ILLEGAL-TRANSITION', async () => {
    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('FROM public.employees')) {
        return {
          rows: [{ ...pendingRow, status: EMP_STATUS_ACTIVE }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    await expect(
      service.activateEmployee(
        employeeId,
        { effective_date: '09/08/2026' },
        'main',
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({
      code: HRM_EMP_ACT_ILLEGAL_TRANSITION,
      status: HttpStatus.CONFLICT,
    });
  });

  it('POST activate happy — pending_docs→active · display-ready · emit employee.activated', async () => {
    const result = await service.activateEmployee(
      employeeId,
      { effective_date: '09/08/2026' },
      'main',
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(result.status).toBe(EMP_STATUS_ACTIVE);
    expect(result.statusLabelVi).toBe('Hoạt động');
    expect(result.checklist_complete).toBe(true);
    expect(result.can_activate).toBe(true);
    expect(result.blocking_items).toEqual([]);
    expect(result.activated_at).toBe('09/08/2026');
    expect(result.activated_at).not.toMatch(/1970/);
    expect(result.events?.[0]).toMatchObject({
      type: EMPLOYEE_ACTIVATED_EVENT,
      employee_id: employeeId,
      company_id: 'holding',
      effective_date: '09/08/2026',
    });
    expect(emit).toHaveBeenCalled();
    expect(emit.mock.calls[0][0]).toBe('hrm:event');
    expect(emit.mock.calls[0][1].type).toBe(EMPLOYEE_ACTIVATED_EVENT);
  });

  it('U19 — group CEO company_id=main activates employee stored under holding', async () => {
    const result = await service.activateEmployee(
      employeeId,
      { effective_date: '01/08/2026' },
      'main',
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(result.company_id).toBe('holding');
    expect(checklist.evaluateActivationGate).toHaveBeenCalled();
  });

  it('gated PATCH status=active — same GATE + EFF + emit', async () => {
    const result = await service.updateEmployee(
      employeeId,
      { status: EMP_STATUS_ACTIVE, effective_date: '15/08/2026' },
      'main',
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(result.status).toBe(EMP_STATUS_ACTIVE);
    expect(result.activated_at).toBe('15/08/2026');
    expect(result.events?.[0]?.type).toBe(EMPLOYEE_ACTIVATED_EVENT);
  });

  it('gated PATCH status=active without effective_date → 400', async () => {
    await expect(
      service.updateEmployee(
        employeeId,
        { status: EMP_STATUS_ACTIVE },
        'main',
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_EMP_ACT_400 });
  });

  it('evaluateActivationGate — DOC required without instance blocks', async () => {
    const chkDb = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    const docType = {
      listEffective: jest.fn().mockResolvedValue({
        total: 1,
        data: [
          {
            documentTypeKey: 'cccd',
            nameVi: 'Căn cước công dân',
            sortOrder: 10,
            requiredByDefault: true,
            blocksActivation: true,
            requiresExpiry: false,
            status: 'active',
            source: 'emp_native',
            catalogKind: 'emp_document_type',
          },
        ],
      }),
      assertDocumentTypeInEffectiveCatalog: jest.fn(),
    };
    chkDb.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('FROM public.employees')) {
        return { rows: [{ ...pendingRow }], rowCount: 1 };
      }
      if (s.includes('hrm_document_checklist_item')) {
        return { rows: [], rowCount: 0 };
      }
      // ensureSchema DDL
      return { rows: [], rowCount: 0 };
    });
    const chk = new EmpDocumentChecklistService(
      chkDb,
      docType as never,
    );
    const gate = await chk.evaluateActivationGate(
      employeeId,
      'main',
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(gate.checklist_complete).toBe(false);
    expect(gate.can_activate).toBe(false);
    expect(gate.blocking_items[0]?.documentTypeKey).toBe('cccd');
  });

  it('DENY Nest /core dual — physical path constants only employees activate', () => {
    // Evidence lock: no Controller('core') invent in this wave — physical prefer /employees/:id/activate
    expect(EMPLOYEE_ACTIVATED_EVENT).toBe('employee.activated');
    expect(HRM_EMP_ACT_CHECKLIST_INCOMPLETE).toBe(
      'HRM-EMP-ACT-CHECKLIST-INCOMPLETE',
    );
  });

  it('getById exposes display-ready gate fields', async () => {
    checklist.evaluateActivationGate.mockResolvedValueOnce({
      employeeId,
      companyId: 'holding',
      checklist_complete: false,
      can_activate: false,
      blocking_items: [
        { documentTypeKey: 'cccd', nameVi: 'CCCD', status: 'submitted' },
      ],
    });
    const got = await service.getEmployeeById(
      employeeId,
      { company_id: 'main' },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(got.statusLabelVi).toBe('Chờ hoàn thiện');
    expect(got.checklist_complete).toBe(false);
    expect(got.can_activate).toBe(false);
    expect(got.blocking_items).toHaveLength(1);
    expect(got.activated_at).toBe('—');
  });

  it('ApiException details carry blocking_items on GATE fail', async () => {
    checklist.evaluateActivationGate.mockResolvedValueOnce({
      employeeId,
      companyId: 'holding',
      checklist_complete: false,
      can_activate: false,
      blocking_items: [
        { documentTypeKey: 'hdld', nameVi: 'HĐLĐ', status: 'missing' },
      ],
    });
    try {
      await service.activateEmployee(
        employeeId,
        { effective_date: '09/08/2026' },
        'main',
        groupCeoAuth(),
        { tenantId: 'xevn' },
      );
      fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiException);
      const ax = err as ApiException;
      expect(ax.code).toBe(HRM_EMP_ACT_CHECKLIST_INCOMPLETE);
      expect(ax.details).toMatchObject({
        checklist_complete: false,
        blocking_items: [{ documentTypeKey: 'hdld' }],
      });
    }
  });
});
