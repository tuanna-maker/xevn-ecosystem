/**
 * Source lock — PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * Assert TERM checklist + soft-return/lost PATCH · FE-derive closed · Nest /core AST/TERM = 0.
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

describe('PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01 source lock', () => {
  it('hrmApi listEmployeeAssets accepts status=assigned · physical path only', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('listEmployeeAssets');
    expect(src).toContain('status');
    expect(src).toContain('termination_context_id');
    expect(body).toMatch(/\/api\/hrm\/employees\/\$\{encodeURIComponent\(employeeId\)\}\/assets/);
    expect(body).not.toMatch(
      /listEmployeeAssets[\s\S]{0,800}\/api\/hrm\/core\//,
    );
    expect(body).not.toMatch(/\/assets\/\$\{[^}]+\}\/return/);
  });

  it('hook: markLost + loadAssignedChecklist + FE-derive closed · no /core', () => {
    const src = read('hooks/useEmployeeAssets.ts');
    expect(src).toContain('markLostAsset');
    expect(src).toContain('loadAssignedChecklist');
    expect(src).toContain('buildLostAssetPatch');
    expect(src).toContain('deriveAssetChecklistClosed');
    expect(src).toContain('filterAssignedAssets');
    expect(src).toContain("status: 'assigned'");
    expect(src).toContain('soft Profile ≠ CORE-06 DONE');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/asset.?ledger|pay.?settle|hrm_termination/i);
  });

  it('EmployeeAssetReturnChecklist — assigned list · return/lost · closed · footer', () => {
    const src = read('components/employee/EmployeeAssetReturnChecklist.tsx');
    expect(src).toContain('hdsd-emp-assets-return-checklist');
    expect(src).toContain('hdsd-emp-assets-checklist-load');
    expect(src).toContain('hdsd-emp-assets-checklist-return');
    expect(src).toContain('hdsd-emp-assets-checklist-lost');
    expect(src).toContain('hdsd-emp-assets-core06-footer');
    expect(src).toContain('data-asset-checklist-closed');
    expect(src).toContain('CORE_06_SOFT_NE_DONE_FOOTER_VI');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/hrm_personnel_uat_ready\s*=\s*true/);
  });

  it('EmployeeAssets embeds checklist · soft≠DONE footer · must_keep soft-return', () => {
    const src = read('components/employee/EmployeeAssets.tsx');
    expect(src).toContain('EmployeeAssetReturnChecklist');
    expect(src).toContain('hdsd-emp-assets-profile-core06-footer');
    expect(src).toContain('hdsd-emp-assets-soft-return');
    expect(src).toContain('hdsd-emp-assets-confirm-bb');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('empCoreAstRing CORE-06 helpers · Nest TERM DENY', () => {
    const src = read('lib/empCoreAstRing.ts');
    expect(src).toContain('buildLostAssetPatch');
    expect(src).toContain('deriveAssetChecklistClosed');
    expect(src).toContain('isForbiddenCoreTermSotPath');
    expect(src).toContain('CORE_06_SOFT_NE_DONE_FOOTER_VI');
    expect(src).toContain('CORE_06_UAT_HONESTY');
    expect(src).toContain('buildSoftReturnPatch');
  });

  it('DENY honesty flip on EmployeeProfile wire', () => {
    const src = read('pages/EmployeeProfile.tsx');
    expect(src).toContain('EmployeeAssets');
    expect(codeOnly(src)).not.toMatch(/hrm_personnel_uat_ready\s*=\s*true/);
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });
});
