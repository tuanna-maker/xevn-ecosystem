/**
 * D-HRM-UI-STRIP-TECH-CHROME-02 — source guards for residual tech chrome
 * from QA-HRM-MENU-FULL-SWEEP-01 FAIL rows.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatDisplayDate } from './formatDisplayDate';
import { PROCESSES_MUTATION_UNSUPPORTED_VI } from '@/hooks/useProcesses';

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), 'utf8');
}

/** Strip block + line comments so CODE-MEMORY prose does not false-positive. */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('D-HRM-UI-STRIP-TECH-CHROME-02', () => {
  it('P1 — PayrollPayslipsApiTab header has no hrm-api label', () => {
    const code = codeOnly(readSrc('src/components/payroll/PayrollPayslipsApiTab.tsx'));
    expect(code).not.toMatch(/hrm-api/i);
    expect(code).toContain('payroll-payslips-count');
  });

  it('P1 — Payroll feedback empty copy has no hrm-api', () => {
    const code = codeOnly(readSrc('src/pages/Payroll.tsx'));
    expect(code).not.toMatch(/từ hrm-api|from hrm-api/i);
  });

  it('P2 — EmployeeSalary does not hardcode API grade badge', () => {
    const code = codeOnly(readSrc('src/components/employee/EmployeeSalary.tsx'));
    expect(code).not.toMatch(/salaryGrade:\s*['"]API['"]/);
    expect(code).toMatch(/salaryGrade\.toUpperCase\(\)\s*!==\s*['"]API['"]/);
    expect(code).not.toMatch(/từ hrm-api/i);
  });

  it('P2 — Processes empty notice has no XBOS-DM-* code', () => {
    expect(PROCESSES_MUTATION_UNSUPPORTED_VI).not.toMatch(/XBOS-DM-/i);
    expect(PROCESSES_MUTATION_UNSUPPORTED_VI).toMatch(/Command Center/i);
    const code = codeOnly(readSrc('src/pages/Processes.tsx'));
    expect(code).not.toMatch(/XBOS-DM-HRM-14/);
  });

  it('P2 — Settings catalogs humanizes sync stamp', () => {
    const code = codeOnly(readSrc('src/components/settings/SettingsCatalogsTab.tsx'));
    expect(code).toMatch(/formatDisplayDate\(\s*cat\.xbosSyncedAt/);
    expect(code).toMatch(/dd\/MM\/yyyy HH:mm/);
  });

  it('P2 — Performance cycles humanize start/end dates', () => {
    const code = codeOnly(readSrc('src/pages/Performance.tsx'));
    expect(code).toMatch(/formatDisplayDate\(\s*item\.start_date\s*\)/);
    expect(code).toMatch(/formatDisplayDate\(\s*item\.end_date\s*\)/);
    expect(code).not.toMatch(/\{item\.start_date\}\s*-\s*\{item\.end_date\}/);
  });

  it('formatDisplayDate humanizes ISO-Z for sync + cycle patterns', () => {
    const stamp = formatDisplayDate('2026-07-17T02:16:10.132Z', 'dd/MM/yyyy HH:mm');
    expect(stamp).toMatch(/^\d{2}\/\d{2}\/2026 \d{2}:\d{2}$/);
    expect(stamp).not.toContain('T');
    expect(stamp).not.toContain('Z');

    const cycle = formatDisplayDate('2026-05-31T17:00:00.000Z');
    expect(cycle).toMatch(/^\d{2}\/\d{2}\/2026$/);
    expect(cycle).not.toContain('T');
  });
});
