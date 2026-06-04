import { describe, expect, it } from 'vitest';
import {
  dedupePortalAlerts,
  mapCatalogInboxToPortalAlert,
  mapStoredPortalAlertRow,
  mapWorkflowTaskToPortalAlert,
  sortPortalAlerts,
} from './portalAlertMappers';

describe('portalAlertMappers', () => {
  it('maps workflow task to portal alert', () => {
    const alert = mapWorkflowTaskToPortalAlert({
      id: 't1',
      workflow_name: 'Duyệt HĐ',
      business_type: 'hrm_contract',
      due_at: '2026-06-01',
    });
    expect(alert.id).toBe('wf-t1');
    expect(alert.moduleCode).toBe('hrm');
    expect(alert.level).toBe('warn');
  });

  it('maps catalog inbox item', () => {
    const alert = mapCatalogInboxToPortalAlert({
      id: 'c1',
      title: 'Duyệt danh mục',
      status: 'pending',
      catalogKey: 'hrm_employee_personal_fields',
    });
    expect(alert.moduleCode).toBe('x-bos');
    expect(alert.level).toBe('warn');
  });

  it('maps stored kpi-engine alert row', () => {
    const alert = mapStoredPortalAlertRow({
      id: 'a1',
      module_code: 'finance',
      level: 'critical',
      title: 'Cảnh báo',
      detail: 'Chi tiết',
      source_system: 'xbos',
      company_id: 'main',
    });
    expect(alert.level).toBe('critical');
    expect(alert.orgUnitId).toBe('main');
  });

  it('sorts critical before warn before info and dedupes by id', () => {
    const alerts = sortPortalAlerts([
      mapStoredPortalAlertRow({ id: '1', level: 'info', title: 'i' }),
      mapStoredPortalAlertRow({ id: '2', level: 'critical', title: 'c' }),
      mapStoredPortalAlertRow({ id: '1', level: 'warn', title: 'dup' }),
    ]);
    expect(dedupePortalAlerts(alerts).map((a) => a.level)).toEqual(['critical', 'warn']);
  });
});
