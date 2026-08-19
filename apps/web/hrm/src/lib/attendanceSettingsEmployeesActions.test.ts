import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { resolveAttendanceEmployeeImportScope } from './attendanceSettingsEmployeesActions';

describe('resolveAttendanceEmployeeImportScope (PO-MFD-M2-ATT-SETTINGS-EMP-01-FE)', () => {
  it('returns null when company missing (fail-closed)', () => {
    expect(resolveAttendanceEmployeeImportScope(null)).toBeNull();
    expect(resolveAttendanceEmployeeImportScope(undefined)).toBeNull();
    expect(resolveAttendanceEmployeeImportScope('')).toBeNull();
    expect(resolveAttendanceEmployeeImportScope('   ')).toBeNull();
  });

  it('uses companyId as tenant when env blank', () => {
    expect(resolveAttendanceEmployeeImportScope('main', '')).toEqual({
      tenantId: 'main',
      companyId: 'main',
    });
    expect(resolveAttendanceEmployeeImportScope('trsport')).toEqual({
      tenantId: 'trsport',
      companyId: 'trsport',
    });
  });

  it('prefers VITE_HRM_SCOPE_TENANT_ID when set', () => {
    expect(resolveAttendanceEmployeeImportScope('main', 'xevn')).toEqual({
      tenantId: 'xevn',
      companyId: 'main',
    });
  });
});

describe('Attendance settings employees CTA wire (source-guard)', () => {
  const pageSrc = readFileSync(join(process.cwd(), 'src/pages/Attendance.tsx'), 'utf8');

  it('wires refresh + import testids and EmployeeImportDialog', () => {
    expect(pageSrc).toContain('hdsd-att-settings-emp-refresh');
    expect(pageSrc).toContain('hdsd-att-settings-emp-import');
    expect(pageSrc).toContain('EmployeeImportDialog');
    expect(pageSrc).toContain('handleRefreshSettingsEmployees');
    expect(pageSrc).toContain('handleOpenSettingsEmployeeImport');
    expect(pageSrc).toContain('refetchEmployees');
  });
});
