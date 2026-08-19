/**
 * Source lock — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
 * Assert assets bind /employees/:id/assets* · BB CTA · no Nest /core SoT.
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

describe('PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical employees assets — not Nest /core', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('listEmployeeAssets');
    expect(src).toContain('createEmployeeAsset');
    expect(src).toContain('updateEmployeeAsset');
    expect(src).toContain('deleteEmployeeAsset');
    expect(body).toMatch(/\/api\/hrm\/employees\/\$\{encodeURIComponent\(employeeId\)\}\/assets/);
    expect(body).not.toMatch(
      /listEmployeeAssets[\s\S]{0,600}\/api\/hrm\/core\//,
    );
    expect(body).not.toMatch(
      /updateEmployeeAsset[\s\S]{0,600}\/api\/hrm\/core\//,
    );
  });

  it('hook maps display-ready + confirmHandover + softReturn · no /core', () => {
    const src = read('hooks/useEmployeeAssets.ts');
    expect(src).toContain('listEmployeeAssets');
    expect(src).toContain('confirmHandover');
    expect(src).toContain('softReturnAsset');
    expect(src).toContain('handoverConfirmed');
    expect(src).toContain('status_label_vi');
    expect(src).toContain('buildHandoverConfirmPatch');
    expect(src).toContain('AST_BB_CONFIRM_GATE_DEFAULT_ON');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/e-sign|PKI|asset.?ledger|kho.?master/i);
  });

  it('EmployeeAssets UI — Xác nhận nhận · soft thu hồi · hdsd · notes ≠ BB', () => {
    const src = read('components/employee/EmployeeAssets.tsx');
    expect(src).toContain('hdsd-emp-assets');
    expect(src).toContain('hdsd-emp-assets-confirm-bb');
    expect(src).toContain('hdsd-emp-assets-soft-return');
    expect(src).toContain('confirmHandover');
    expect(src).toContain('confirmReceive');
    expect(src).toContain('notesNotBb');
    expect(src).toContain('status_label_vi');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/personnel_uat_ready\s*=\s*true/);
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError maps CORE-05 serial + soft delete', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-EMP-ASSET-SERIAL-CONFLICT"');
    expect(src).toContain('"HRM-EMP-ASSET-DELETE-FORBIDDEN"');
    expect(src).toContain('"HRM-EMP-ASSET-VAL-400"');
  });

  it('empCoreAstRing forbids Nest /core AST SoT · BB gate on', () => {
    const src = read('lib/empCoreAstRing.ts');
    expect(src).toContain('isForbiddenCoreAstSotPath');
    expect(src).toContain('AST_BB_CONFIRM_GATE_DEFAULT_ON');
    expect(src).toContain('buildHandoverConfirmPatch');
    expect(src).toContain('Đang sử dụng');
    expect(src).toContain('CORE_AST_PAPER_CORE_PATH');
  });

  it('EmployeeProfile wires assets tab · DENY honesty flip', () => {
    const src = read('pages/EmployeeProfile.tsx');
    expect(src).toContain('EmployeeAssets');
    expect(src).toContain("activeTab === 'assets'");
    expect(codeOnly(src)).not.toMatch(/hrm_personnel_uat_ready\s*=\s*true/);
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('mapAsset binds camelCase + snake_case display-ready', () => {
    const src = read('hooks/useEmployeeAssets.ts');
    expect(src).toContain('statusLabelVi');
    expect(src).toContain('handoverConfirmedAt');
    expect(src).toContain('handover_confirmed_at');
    expect(src).toContain('handoverDocId');
  });
});
