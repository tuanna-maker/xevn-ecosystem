/**
 * @CODE-MEMORY
 * Screen:     Vitest — EMP ST/STR Settings admin panel source gate
 * UC:         AC-PLT-EMP-STATUS-01* · R-PLT-EMP-ST-FE-ADMIN
 * What:       Mount surface + list/upsert/retire Nest KEY paths (source gate; dual-react RTL residual)
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * must_keep:  Nest KEY sealed · no dual writer · pos/dept Nest DENY · honesty false · U65
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EMP_EMPLOYMENT_STATUS_UAT_HONESTY,
  formatEmpEmploymentStatusDisplay,
  formatEmpStatusReasonDisplay,
  isValidEmpEmploymentStatusKeyFormat,
  isValidEmpStatusReasonKeyFormat,
  parseEmpStatusReasonAppliesTo,
} from '@/lib/empEmploymentStatusCatalog';

const panelSrc = readFileSync(
  join(__dirname, 'EmpEmploymentStatusSettingsPanel.tsx'),
  'utf8',
);
const settingsSrc = readFileSync(join(__dirname, '../../pages/Settings.tsx'), 'utf8');
const hrmApiSrc = readFileSync(join(__dirname, '../../integrations/hrmApi.ts'), 'utf8');

describe.skip('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 — mount', () => {
  it('Settings tab mounts EmpEmploymentStatusSettingsPanel', () => {
    expect(settingsSrc).toContain("settingsTab === 'emp-employment-statuses'");
    expect(settingsSrc).toContain('EmpEmploymentStatusSettingsPanel');
    expect(settingsSrc).toContain('<EmpEmploymentStatusSettingsPanel />');
  });

  it('panel root + ST/STR cards mount testids', () => {
    expect(panelSrc).toContain('data-testid="settings-emp-status-admin"');
    expect(panelSrc).toContain('testId="settings-emp-employment-statuses"');
    expect(panelSrc).toContain('testId="settings-emp-status-reasons"');
    expect(panelSrc).toContain('export function EmpEmploymentStatusSettingsPanel');
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 — list render', () => {
  it('loads Nest list GET employment-statuses + status-reasons', () => {
    expect(panelSrc).toContain('listEmpEmploymentStatuses');
    expect(panelSrc).toContain('listEmpStatusReasons');
    expect(panelSrc).toContain('settings-emp-employment-statuses-table');
    expect(panelSrc).toContain('settings-emp-status-reasons-table');
    expect(hrmApiSrc).toContain('/api/hrm/employees/employment-statuses?');
    expect(hrmApiSrc).toContain('/api/hrm/employees/status-reasons?');
  });

  it('binds effective picker preview (F5 consumer)', () => {
    expect(panelSrc).toContain('useEmpEmploymentStatusesEffective');
    expect(panelSrc).toContain('useEmpStatusReasonsEffective');
    expect(panelSrc).toContain('hdsd-emp-employment-status-effective-picker');
    expect(panelSrc).toContain('hdsd-emp-status-reason-effective-picker');
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 — create/edit submit', () => {
  it('upserts via sealed Nest PUT KEY path (no dual writer)', () => {
    expect(panelSrc).toContain('upsertEmpEmploymentStatus');
    expect(panelSrc).toContain('upsertEmpStatusReason');
    expect(panelSrc).toContain('hdsd-emp-employment-status-save');
    expect(panelSrc).toContain('hdsd-emp-status-reason-save');
    expect(hrmApiSrc).toContain('"/api/hrm/employees/employment-statuses"');
    expect(hrmApiSrc).toContain('"/api/hrm/employees/status-reasons"');
    expect(hrmApiSrc).toMatch(/method:\s*"PUT"/);
    // DENY invent Nest pos/dept admin
    expect(panelSrc).not.toMatch(/emp_position|emp_department|job_titles.*Nest/);
    expect(panelSrc).not.toContain('dualWrite');
  });

  it('validates format-only keys before submit', () => {
    expect(panelSrc).toContain('isValidEmpEmploymentStatusKeyFormat');
    expect(panelSrc).toContain('isValidEmpStatusReasonKeyFormat');
    expect(panelSrc).toContain("Định dạng a-z / số / _ sau khi đổi - → _");
    expect(isValidEmpEmploymentStatusKeyFormat('hr_st_custom_09')).toBe(true);
    expect(isValidEmpEmploymentStatusKeyFormat('2bad')).toBe(false);
    expect(isValidEmpStatusReasonKeyFormat('resign_personal')).toBe(true);
    expect(isValidEmpStatusReasonKeyFormat('9x')).toBe(false);
  });

  it('formats display labels for toast after save', () => {
    expect(formatEmpEmploymentStatusDisplay('on_leave', 'Nghỉ phép')).toBe(
      'Nghỉ phép (on_leave)',
    );
    expect(formatEmpStatusReasonDisplay('resign_personal', 'Tự nguyện')).toBe(
      'Tự nguyện (resign_personal)',
    );
    expect(parseEmpStatusReasonAppliesTo('inactive, resigned')).toEqual([
      'inactive',
      'resigned',
    ]);
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 — soft-retire', () => {
  it('wires POST …/retire soft-delete for ST + STR', () => {
    expect(panelSrc).toContain('retireEmpEmploymentStatus');
    expect(panelSrc).toContain('retireEmpStatusReason');
    expect(panelSrc).toContain('hdsd-emp-employment-status-retire-');
    expect(panelSrc).toContain('hdsd-emp-status-reason-retire-');
    expect(hrmApiSrc).toContain('/retire?');
    expect(panelSrc).toContain('soft-delete');
  });

  it('invalidates EFF query keys after mutate/retire', () => {
    expect(panelSrc).toContain('EMP_EMPLOYMENT_STATUSES_EFFECTIVE_QUERY_KEY');
    expect(panelSrc).toContain('EMP_STATUS_REASONS_EFFECTIVE_QUERY_KEY');
    expect(panelSrc).toContain('invalidateQueries');
    expect(panelSrc).toContain('catalogPageForKey');
    expect(panelSrc).toContain('useSettingsCatalogQueryPageSync');
  });
});

describe('PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01 — honesty / DENY', () => {
  it('keeps honesty false + C-SLICE note', () => {
    expect(EMP_EMPLOYMENT_STATUS_UAT_HONESTY).toBe(false);
    expect(panelSrc).toContain('hrm_personnel_uat_ready=false');
    expect(panelSrc).toContain('C-SLICE');
  });
});
