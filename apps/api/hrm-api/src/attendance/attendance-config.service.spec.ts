import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceConfigService } from './attendance-config.service';

describe('AttendanceConfigService', () => {
  let service: AttendanceConfigService;
  let db: jest.Mocked<HrmDbService>;

  const groupCeoAuth = signServiceJwt({
    sub: 'ceo-user',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new AttendanceConfigService(db);
  });

  it('lazy-creates attendance_rules with FE-default semantics on GET', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS public.attendance_rules')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('SELECT * FROM public.attendance_rules') && sql.includes('WHERE company_id')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('INSERT INTO public.attendance_rules')) {
        return Promise.resolve({
          rows: [
            {
              id: 'rule-1',
              company_id: 'holding',
              work_start_day: 1,
              work_end_day: 31,
              work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
              round_in_minutes: 0,
              round_out_minutes: 0,
              standard_type: 'fixed',
              standard_days_per_month: 26,
              hours_per_day: 8,
              allow_multiple_checkin: true,
              auto_checkout: false,
              notify_late: true,
              gps_enabled: true,
              wifi_enabled: true,
              qr_enabled: false,
              faceid_enabled: false,
              gps_locations: [],
              created_at: '2026-08-04T00:00:00.000Z',
              updated_at: '2026-08-04T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const rules = await service.getRules('main', groupCeoAuth);
    expect(rules.company_id).toBe('holding');
    expect(rules.standard_days_per_month).toBe(26);
    expect(rules.faceid_enabled).toBe(false);
  });

  it('PATCH rules forces faceid_enabled false (ADR D4)', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS public.attendance_rules')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('SELECT * FROM public.attendance_rules') && !sql.includes('UPDATE')) {
        return Promise.resolve({
          rows: [
            {
              id: 'rule-1',
              company_id: 'trsport',
              work_start_day: 1,
              work_end_day: 31,
              work_days: ['mon'],
              round_in_minutes: 0,
              round_out_minutes: 0,
              standard_type: 'fixed',
              standard_days_per_month: 26,
              hours_per_day: 8,
              allow_multiple_checkin: true,
              auto_checkout: false,
              notify_late: true,
              gps_enabled: true,
              wifi_enabled: true,
              qr_enabled: false,
              faceid_enabled: true,
              gps_locations: [],
              created_at: '2026-08-04T00:00:00.000Z',
              updated_at: '2026-08-04T00:00:00.000Z',
            },
          ],
        } as never);
      }
      if (sql.includes('UPDATE public.attendance_rules')) {
        return Promise.resolve({
          rows: [
            {
              id: 'rule-1',
              company_id: 'trsport',
              work_start_day: 1,
              work_end_day: 31,
              work_days: ['mon'],
              round_in_minutes: 15,
              round_out_minutes: 0,
              standard_type: 'fixed',
              standard_days_per_month: 26,
              hours_per_day: 8,
              allow_multiple_checkin: true,
              auto_checkout: false,
              notify_late: true,
              gps_enabled: true,
              wifi_enabled: true,
              qr_enabled: false,
              faceid_enabled: false,
              gps_locations: [],
              created_at: '2026-08-04T00:00:00.000Z',
              updated_at: '2026-08-04T01:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const updated = await service.patchRules(
      'trsport',
      { round_in_minutes: 15, faceid_enabled: true },
      groupCeoAuth,
    );
    expect(updated.round_in_minutes).toBe(15);
    expect(updated.faceid_enabled).toBe(false);
  });

  it('listWorkSites scopes by TEXT company_id slug', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS public.attendance_work_sites')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('ALTER TABLE public.attendance_work_sites')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('DO $$')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('UPDATE public.attendance_work_sites SET company_id')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.attendance_work_sites')) {
        return Promise.resolve({
          rows: [
            {
              id: 'site-1',
              company_id: 'trsport',
              name: 'Depot',
              address: 'HN',
              latitude: 21.0285,
              longitude: 105.8542,
              radius_meters: 100,
              active: true,
              created_at: '2026-08-04T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const list = await service.listWorkSites('trsport', groupCeoAuth);
    expect(list.total).toBe(1);
    expect(list.data[0].company_id).toBe('trsport');
    expect(list.data[0].radius).toBe(100);
    const listSql = String(
      db.query.mock.calls.find(([sql]) =>
        String(sql).includes('FROM public.attendance_work_sites') &&
        String(sql).includes('SELECT id'),
      )?.[0] ?? '',
    );
    expect(listSql).toContain('active = TRUE');
  });

  it('VAL-ATT-WS-CNS-03b: listWorkSites default hides inactive; include_inactive shows all', async () => {
    const rows = [
      {
        id: 'site-active',
        company_id: 'trsport',
        name: 'Active Depot',
        address: null,
        latitude: 21,
        longitude: 105,
        radius_meters: 100,
        active: true,
        created_at: '2026-08-08T00:00:00.000Z',
      },
      {
        id: 'site-retired',
        company_id: 'trsport',
        name: 'Retired Depot',
        address: null,
        latitude: 21.1,
        longitude: 105.1,
        radius_meters: 100,
        active: false,
        created_at: '2026-08-08T00:00:00.000Z',
      },
    ];
    db.query.mockImplementation((sql: string) => {
      if (
        sql.includes('CREATE TABLE') ||
        sql.includes('ALTER TABLE') ||
        sql.includes('DO $$') ||
        sql.includes('UPDATE public.attendance_work_sites SET company_id')
      ) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.attendance_work_sites') && sql.includes('SELECT id')) {
        const activeOnly = sql.includes('active = TRUE');
        return Promise.resolve({
          rows: activeOnly ? rows.filter((r) => r.active) : rows,
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const activeList = await service.listWorkSites('trsport', groupCeoAuth);
    expect(activeList.total).toBe(1);
    expect(activeList.data[0].id).toBe('site-active');

    const allList = await service.listWorkSites('trsport', groupCeoAuth, undefined, {
      includeInactive: true,
    });
    expect(allList.total).toBe(2);
  });

  it('VAL-ATT-WS-CNS-04: deleteWorkSite soft-retires (active=false); hard=true deletes', async () => {
    db.query.mockImplementation((sql: string) => {
      if (
        sql.includes('CREATE TABLE') ||
        sql.includes('ALTER TABLE') ||
        sql.includes('DO $$') ||
        sql.includes('UPDATE public.attendance_work_sites SET company_id')
      ) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.attendance_work_sites WHERE id')) {
        return Promise.resolve({
          rows: [
            {
              id: 'site-retire',
              company_id: 'trsport',
              name: 'Gate',
              address: null,
              latitude: 21,
              longitude: 105,
              radius_meters: 200,
              active: true,
              created_at: '2026-08-08T00:00:00.000Z',
            },
          ],
        } as never);
      }
      if (sql.includes('UPDATE public.attendance_work_sites') && sql.includes('active = FALSE')) {
        return Promise.resolve({
          rows: [
            {
              id: 'site-retire',
              company_id: 'trsport',
              name: 'Gate',
              address: null,
              latitude: 21,
              longitude: 105,
              radius_meters: 200,
              active: false,
              created_at: '2026-08-08T00:00:00.000Z',
            },
          ],
        } as never);
      }
      if (sql.includes('DELETE FROM public.attendance_work_sites')) {
        return Promise.resolve({ rows: [] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const soft = await service.deleteWorkSite('site-retire', 'trsport', groupCeoAuth);
    expect(soft).toMatchObject({ id: 'site-retire', active: false, retired: true, hard_deleted: false });
    expect(
      db.query.mock.calls.some(
        ([sql]) =>
          String(sql).includes('UPDATE public.attendance_work_sites') &&
          String(sql).includes('active = FALSE'),
      ),
    ).toBe(true);

    await service.deleteWorkSite('site-retire', 'trsport', groupCeoAuth, undefined, { hard: true });
    expect(
      db.query.mock.calls.some(([sql]) => String(sql).includes('DELETE FROM public.attendance_work_sites')),
    ).toBe(true);
  });

  it('ATT-03d: createWorkSite accepts FE radius alias and persists TEXT company slug', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS public.attendance_work_sites')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('ALTER TABLE') || sql.includes('DO $$') || sql.includes('UPDATE public.attendance_work_sites SET company_id')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('INSERT INTO public.attendance_work_sites')) {
        return Promise.resolve({
          rows: [
            {
              id: 'site-new',
              company_id: 'holding',
              name: 'HQ Gate',
              address: null,
              latitude: 21.02,
              longitude: 105.85,
              radius_meters: 150,
              active: true,
              created_at: '2026-08-05T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const created = await service.createWorkSite(
      {
        company_id: 'main',
        name: 'HQ Gate',
        latitude: 21.02,
        longitude: 105.85,
        radius: 150,
      },
      groupCeoAuth,
      'xevn',
    );

    expect(created.company_id).toBe('holding');
    expect(created.radius).toBe(150);
    expect(created.radius_meters).toBe(150);
    const insertCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.attendance_work_sites'),
    );
    expect(insertCall?.[1]).toEqual(
      expect.arrayContaining(['holding', 'HQ Gate', null, 21.02, 105.85, 150, true]),
    );
  });

  it('ATT-03d: updateWorkSite rejects site outside request scope (list↔get-by-id parity)', async () => {
    const memberAuth = signServiceJwt({
      sub: 'member-ceo',
      tenantId: 'trsport',
      companyId: 'trsport',
      roleCode: 'company_ceo',
    });
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE IF NOT EXISTS public.attendance_work_sites')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('ALTER TABLE') || sql.includes('DO $$') || sql.includes('UPDATE public.attendance_work_sites SET company_id')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.attendance_work_sites WHERE id')) {
        return Promise.resolve({
          rows: [
            {
              id: 'site-other',
              company_id: 'holding',
              name: 'Holding HQ',
              address: null,
              latitude: 21,
              longitude: 105,
              radius_meters: 200,
              active: true,
              created_at: '2026-08-05T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await expect(
      service.updateWorkSite(
        'site-other',
        'trsport',
        { name: 'Hack' },
        memberAuth,
        'trsport',
      ),
    ).rejects.toBeInstanceOf(ApiException);
  });

  const baseRulesRow = {
    id: 'rule-1',
    company_id: 'holding',
    work_start_day: 1,
    work_end_day: 31,
    work_days: ['mon'],
    round_in_minutes: 0,
    round_out_minutes: 0,
    standard_type: 'fixed',
    standard_days_per_month: 26,
    hours_per_day: 8,
    allow_multiple_checkin: true,
    auto_checkout: false,
    notify_late: true,
    gps_enabled: true,
    wifi_enabled: false,
    qr_enabled: false,
    faceid_enabled: false,
    gps_locations: [],
    late_penalty_mode: null as string | null,
    late_penalty_bands: [],
    late_penalty_enabled: true,
    late_penalty_department_id: null as string | null,
    late_penalty_shift_id: null as string | null,
    created_at: '2026-08-09T00:00:00.000Z',
    updated_at: '2026-08-09T00:00:00.000Z',
  };

  function mockRulesDb(opts?: {
    onUpdate?: (sql: string, params: unknown[]) => typeof baseRulesRow;
  }) {
    db.query.mockImplementation((sql: string, params?: unknown[]) => {
      if (
        sql.includes('CREATE TABLE') ||
        sql.includes('ALTER TABLE') ||
        sql.includes('CREATE UNIQUE INDEX')
      ) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.att_attendance_rule')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('UPDATE public.attendance_rules')) {
        const updated = opts?.onUpdate?.(sql, params ?? []) ?? {
          ...baseRulesRow,
          late_penalty_mode: 'minute',
          late_penalty_bands: [{ fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 }],
          late_penalty_enabled: true,
        };
        return Promise.resolve({ rows: [updated] } as never);
      }
      if (sql.includes('SELECT * FROM public.attendance_rules')) {
        return Promise.resolve({ rows: [baseRulesRow] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
  }

  it('ATT-02: PATCH mode+bands returns display-ready envelope', async () => {
    mockRulesDb();
    const updated = await service.patchRules(
      'main',
      {
        mode: 'minute',
        bands: [{ fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 }],
        latePenaltyEnabled: true,
      },
      groupCeoAuth,
    );
    expect(updated.mode).toBe('minute');
    expect(updated.modeLabelVi).toBe('Theo phút');
    expect(updated.bands).toEqual([{ fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 }]);
    expect(updated.latePenaltyEnabled).toBe(true);
    expect(updated.sourceFlags.gpsEnabled).toBe(true);
    expect(updated.notifyLate).toBe(true);
    expect(updated.scope.companyId).toBe('holding');
  });

  it('ATT-02: PATCH mixed modes → HRM-VAL-400', async () => {
    mockRulesDb();
    await expect(
      service.patchRules(
        'main',
        { modes: ['minute', 'block'] } as never,
        groupCeoAuth,
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('ATT-02: PATCH overlapping bands → HRM-VAL-400', async () => {
    mockRulesDb();
    await expect(
      service.patchRules(
        'main',
        {
          mode: 'tier',
          bands: [
            { fromMinutes: 1, toMinutes: 20, penaltyHours: 0.5 },
            { fromMinutes: 15, toMinutes: 40, penaltyHours: 1 },
          ],
        },
        groupCeoAuth,
      ),
    ).rejects.toMatchObject({ code: 'HRM-VAL-400' });
  });

  it('ATT-02: latePenaltyEnabled=false evaluate path → 0 (notifyLate stays)', async () => {
    mockRulesDb({
      onUpdate: () => ({
        ...baseRulesRow,
        late_penalty_mode: 'minute',
        late_penalty_enabled: false,
        notify_late: true,
      }),
    });
    const updated = await service.patchRules(
      'main',
      { mode: 'minute', latePenaltyEnabled: false },
      groupCeoAuth,
    );
    expect(updated.latePenaltyEnabled).toBe(false);
    expect(updated.notifyLate).toBe(true);
    expect(
      service.evaluateLatePenaltyHours({
        latePenaltyEnabled: updated.latePenaltyEnabled,
        mode: updated.mode,
        bands: updated.bands,
        lateMinutes: 25,
      }),
    ).toBe(0);
  });
});
