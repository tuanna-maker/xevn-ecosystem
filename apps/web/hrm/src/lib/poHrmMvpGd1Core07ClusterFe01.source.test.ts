/**
 * Source lock — PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * Assert Profile activate CTA · POST …/activate · GATE 409 · Nest /core = 0 ·
 * checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · honesty false.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

/** Strip block comments so CODE-MEMORY paths do not false-positive. */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01 source lock', () => {
  it('hrmApi activateEmployee — physical POST …/activate · Nest /core DENY', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('activateEmployee');
    expect(src).toContain('effective_date');
    expect(body).toMatch(
      /activateEmployee[\s\S]{0,600}\/api\/hrm\/employees\/\$\{encodeURIComponent\(employeeId\)\}\/activate/,
    );
    expect(body).not.toMatch(
      /activateEmployee[\s\S]{0,800}\/api\/hrm\/core\//,
    );
    expect(src).toContain('can_activate');
    expect(src).toContain('blocking_items');
  });

  it('hook useEmployeeActivate — POST activate · can_activate · GATE toast', () => {
    const src = read('hooks/useEmployeeActivate.ts');
    expect(src).toContain('activateEmployee');
    expect(src).toContain('buildActivatePostBody');
    expect(src).toContain('canActivateCta');
    expect(src).toContain('HRM-EMP-ACT-CHECKLIST-INCOMPLETE');
    expect(src).toContain('listEmployeeDocumentChecklist');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/hrm_personnel_uat_ready\s*=\s*true/);
  });

  it('EmployeeActivatePanel — CTA · blocking_items · effective_date · footer', () => {
    const src = read('components/employee/EmployeeActivatePanel.tsx');
    expect(src).toContain('hdsd-emp-activate-panel');
    expect(src).toContain('hdsd-emp-activate-submit');
    expect(src).toContain('hdsd-emp-activate-blocking-items');
    expect(src).toContain('hdsd-emp-activate-effective-date');
    expect(src).toContain('hdsd-emp-activate-core07-footer');
    expect(src).toContain('CORE_07_ACT_NE_DONE_FOOTER_VI');
    expect(src).toContain('data-can-activate');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('empCoreActRing CORE-07 helpers · Nest ACT DENY · honesty', () => {
    const src = read('lib/empCoreActRing.ts');
    expect(src).toContain('buildActivatePostBody');
    expect(src).toContain('deriveCanActivateFromChecklist');
    expect(src).toContain('isForbiddenCoreActSotPath');
    expect(src).toContain('CORE_07_ACT_NE_DONE_FOOTER_VI');
    expect(src).toContain('CORE_07_UAT_HONESTY');
    expect(src).toContain('HRM_EMP_ACT_CHECKLIST_INCOMPLETE_CODE');
    expect(src).toMatch(/≠ CORE-07 DONE/);
    expect(src).toMatch(/≠ CORE-06 DONE/);
  });

  it('apiError maps GATE 409 incomplete + ACT-400', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-EMP-ACT-CHECKLIST-INCOMPLETE"');
    expect(src).toContain('"HRM-EMP-ACT-400"');
  });

  it('EmployeeProfile embeds ActivatePanel · DENY honesty flip · Nest /core', () => {
    const src = read('pages/EmployeeProfile.tsx');
    expect(src).toContain('EmployeeActivatePanel');
    expect(src).toContain('PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01');
    expect(codeOnly(src)).not.toMatch(/hrm_personnel_uat_ready\s*=\s*true/);
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
  });

  it('DENY invent PAY / CORE-09 / ATT enroll DONE in activate FE surface', () => {
    const panel = codeOnly(read('components/employee/EmployeeActivatePanel.tsx'));
    const hook = codeOnly(read('hooks/useEmployeeActivate.ts'));
    const ring = codeOnly(read('lib/empCoreActRing.ts'));
    for (const src of [panel, hook]) {
      expect(src).not.toMatch(/payslip|payroll_done|att_enroll_done|printable_ready\s*=\s*true/i);
      expect(src).not.toContain('/api/hrm/core/');
    }
    // Ring may cite paper path only inside DENY detector constant — never as request SoT.
    expect(ring).toContain('isForbiddenCoreActSotPath');
    expect(ring).toContain('CORE_ACT_PAPER_CORE_PATH');
    expect(ring).not.toMatch(/requestHrm[\s\S]{0,200}\/api\/hrm\/core\//);
    expect(ring).not.toMatch(/payslip|payroll_done|att_enroll_done/i);
  });
});
