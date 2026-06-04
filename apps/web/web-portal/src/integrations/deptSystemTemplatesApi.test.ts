import { describe, expect, it } from 'vitest';
import { INITIAL_DEPT_SYSTEM_TEMPLATES } from '../data/dept-system-foundation-catalog';
import {
  deptTemplatesLoadErrorMessage,
  isDeptTemplatesNotFoundError,
  mapDeptSystemTemplateRow,
  resolveDeptSystemTemplatesLoad,
} from './deptSystemTemplatesApi';

describe('deptSystemTemplatesApi', () => {
  it('maps business-master row with defaults', () => {
    const row = mapDeptSystemTemplateRow({
      id: 'dtpl-1',
      code: ' PB-01 ',
      nameVi: ' Khung A ',
    });
    expect(row).toEqual({
      id: 'dtpl-1',
      code: 'PB-01',
      nameVi: 'Khung A',
      description: '',
      appliesToCompanyIds: [],
      enabledOrgGradeLevels: [],
    });
  });

  it('sorts enabled org grade levels', () => {
    const row = mapDeptSystemTemplateRow({
      id: 'x',
      enabledOrgGradeLevels: [9, 1, 3],
    });
    expect(row.enabledOrgGradeLevels).toEqual([1, 3, 9]);
  });

  it('prefers API rows in strict mode', () => {
    const api = [mapDeptSystemTemplateRow({ id: 'api-1', code: 'A', nameVi: 'From API' })];
    const mock = INITIAL_DEPT_SYSTEM_TEMPLATES.map((r) => mapDeptSystemTemplateRow(r));
    const resolved = resolveDeptSystemTemplatesLoad(api, false, mock);
    expect(resolved.source).toBe('api');
    expect(resolved.templates).toHaveLength(1);
    expect(resolved.loadFailed).toBe(false);
  });

  it('uses mock seed only when flag allows and API empty', () => {
    const mock = INITIAL_DEPT_SYSTEM_TEMPLATES.map((r) => mapDeptSystemTemplateRow(r));
    const resolved = resolveDeptSystemTemplatesLoad([], true, mock);
    expect(resolved.source).toBe('mock');
    expect(resolved.templates[0]?.code).toBe('PB-ORG-XEVN-01');
  });

  it('returns empty strict when API empty and mock disabled', () => {
    const mock = INITIAL_DEPT_SYSTEM_TEMPLATES.map((r) => mapDeptSystemTemplateRow(r));
    const resolved = resolveDeptSystemTemplatesLoad([], false, mock);
    expect(resolved.source).toBe('empty');
    expect(resolved.templates).toHaveLength(0);
  });

  it('detects HTTP 404 for dept templates domain', () => {
    expect(isDeptTemplatesNotFoundError(new Error('HTTP 404: dept_system_templates'))).toBe(true);
    expect(isDeptTemplatesNotFoundError(new Error('network'))).toBe(false);
  });

  it('returns seed hint message on 404', () => {
    const msg = deptTemplatesLoadErrorMessage(true, false);
    expect(msg).toMatch(/seed:business-master:settings-md/);
  });

  it('marks loadFailed on API error without mock', () => {
    const mock = INITIAL_DEPT_SYSTEM_TEMPLATES.map((r) => mapDeptSystemTemplateRow(r));
    const resolved = resolveDeptSystemTemplatesLoad([], false, mock, true);
    expect(resolved.loadFailed).toBe(true);
    expect(resolved.templates).toHaveLength(0);
  });
});
