import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SETTINGS_CATALOGS_QUERY_KEY,
  settingsCatalogsQueryKey,
} from '@/hooks/useSettingsCatalogsOverview';

describe('P1-HRM-PERF-FE-03 — unified settings-catalogs RQ cache', () => {
  it('exports stable query key root', () => {
    expect(SETTINGS_CATALOGS_QUERY_KEY).toBe('hrm-settings-catalogs');
    expect(settingsCatalogsQueryKey({ tenantId: 't1', companyId: 'c1' })).toEqual([
      'hrm-settings-catalogs',
      't1',
      'c1',
    ]);
  });

  it('consumers share useSettingsCatalogsOverview — no split query keys', () => {
    const contracts = readFileSync(resolve(__dirname, '../pages/Contracts.tsx'), 'utf8');
    const employeeForm = readFileSync(
      resolve(__dirname, '../components/employee/EmployeeFormDialog.tsx'),
      'utf8',
    );
    const settingsTab = readFileSync(
      resolve(__dirname, '../components/settings/SettingsCatalogsTab.tsx'),
      'utf8',
    );

    for (const src of [contracts, employeeForm, settingsTab]) {
      expect(src).toContain('useSettingsCatalogsOverview');
      expect(src).not.toContain("'contracts-settings-catalogs'");
      expect(src).not.toContain("'employee-form-catalogs'");
      expect(src).not.toContain('"contracts-settings-catalogs"');
      expect(src).not.toContain('"employee-form-catalogs"');
    }

    expect(settingsTab).toContain('SETTINGS_CATALOGS_QUERY_KEY');
  });
});
