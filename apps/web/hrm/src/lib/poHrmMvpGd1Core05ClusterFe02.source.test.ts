/**
 * Source lock — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02
 * Blank-date omit on create/update · RETAIN BB/serial/soft · Nest /core DENY.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02 source lock', () => {
  it('hook uses buildAssetWritePayload on add/update', () => {
    const src = read('hooks/useEmployeeAssets.ts');
    expect(src).toContain('buildAssetWritePayload');
    expect(src).toMatch(/addAsset[\s\S]*?buildAssetWritePayload/);
    expect(src).toMatch(/updateAsset[\s\S]*?buildAssetWritePayload/);
    expect(src).toContain('confirmHandover');
    expect(src).toContain('softReturnAsset');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
  });

  it('empCoreAstRing exports blank-date omit helper', () => {
    const src = read('lib/empCoreAstRing.ts');
    expect(src).toContain('buildAssetWritePayload');
    expect(src).toContain('isBlankAssetDate');
    expect(src).toContain('AST_DATE_WRITE_KEYS');
    expect(src).toContain('AST_BB_CONFIRM_GATE_DEFAULT_ON');
    expect(src).toContain('HRM_EMP_ASSET_SERIAL_CONFLICT_CODE');
    expect(src).toContain('buildHandoverConfirmPatch');
  });

  it('RETAIN BB CTA · soft return · Nest /core DENY · honesty false', () => {
    const ui = read('components/employee/EmployeeAssets.tsx');
    expect(ui).toContain('hdsd-emp-assets-confirm-bb');
    expect(ui).toContain('hdsd-emp-assets-soft-return');
    expect(ui).toContain('confirmReceive');
    expect(ui).toContain('notesNotBb');
    expect(codeOnly(ui)).not.toContain('/api/hrm/core/');
    expect(codeOnly(ui)).not.toMatch(/hrm_personnel_uat_ready\s*=\s*true/);
    expect(codeOnly(ui)).not.toMatch(/contracts_printable_ready\s*=\s*true/);

    const api = codeOnly(read('integrations/hrmApi.ts'));
    expect(api).toMatch(/\/api\/hrm\/employees\/\$\{encodeURIComponent\(employeeId\)\}\/assets/);
    expect(api).not.toMatch(
      /createEmployeeAsset[\s\S]{0,400}\/api\/hrm\/core\//,
    );
  });
});
