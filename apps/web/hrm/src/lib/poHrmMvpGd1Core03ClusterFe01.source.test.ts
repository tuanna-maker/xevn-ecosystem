/**
 * Source lock — PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * Assert checklist bind paths document-checklist* · DOC/ET RETAIN · no Nest /core SoT.
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

describe('PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical document-checklist under employees — not Nest /core', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('listEmployeeDocumentChecklist');
    expect(src).toContain('createEmployeeDocumentChecklistItem');
    expect(src).toContain('updateEmployeeDocumentChecklistItem');
    expect(src).toContain('archiveEmployeeDocumentChecklistItem');
    expect(body).toContain('/document-checklist');
    expect(body).toContain('/api/hrm/employees/document-types');
    expect(body).toContain('/api/hrm/employees/employment-types');
    // Physical path only — no Nest /core checklist SoT in client callers.
    expect(body).not.toMatch(
      /listEmployeeDocumentChecklist[\s\S]{0,800}\/api\/hrm\/core\//,
    );
    expect(body).not.toMatch(
      /createEmployeeDocumentChecklistItem[\s\S]{0,400}\/api\/hrm\/core\//,
    );
  });

  it('hook submits submitted + approves approved · no invent required starter', () => {
    const src = read('hooks/useEmployeeDocumentChecklist.ts');
    expect(src).toContain('listEmployeeDocumentChecklist');
    expect(src).toContain("status: 'submitted'");
    expect(src).toContain("status: 'approved'");
    expect(src).toContain('validateChkCreateGate');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/required:\s*true/);
    expect(codeOnly(src)).not.toMatch(/\['cccd'|'cmnd'|'passport'\]/i);
  });

  it('EmployeeDocumentChecklist UI — Nộp / Xác nhận · DOC EFF picker · empty OK', () => {
    const src = read('components/employee/EmployeeDocumentChecklist.tsx');
    expect(src).toContain('hdsd-emp-document-checklist');
    expect(src).toContain('hdsd-emp-chk-submit');
    expect(src).toContain('hdsd-emp-chk-approve');
    expect(src).toContain('hdsd-emp-chk-empty');
    expect(src).toContain('hdsd-emp-chk-doc-picker');
    expect(src).toContain('useEmpDocumentTypesEffective');
    expect(src).toContain('Nộp');
    expect(src).toContain('Xác nhận');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/starter.*(CCCD|CMND)|CCCD.*CMND.*CV/);
  });

  it('Settings DOC/ET RETAIN paths · no FE hardcode required starter list', () => {
    const docPanel = read('components/settings/EmpDocumentTypeSettingsPanel.tsx');
    const etPanel = read('components/settings/EmpEmploymentTypeSettingsPanel.tsx');
    expect(docPanel).toContain('document-types');
    expect(etPanel).toContain('employment-types');
    expect(codeOnly(docPanel)).not.toMatch(/\/api\/hrm\/core\//);
    expect(codeOnly(etPanel)).not.toMatch(/\/api\/hrm\/core\//);
    expect(codeOnly(docPanel)).not.toMatch(
      /REQUIRED_STARTER|STARTER_DOC|const\s+STARTER.*=\s*\[/,
    );
    expect(docPanel).toMatch(/không giới hạn starter|open catalog/i);
  });

  it('apiError maps CORE-03 CHK + invent KEY', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-EMP-DOC-TYPE-UNKNOWN"');
    expect(src).toContain('"HRM-CORE-CHK-VAL-400"');
    expect(src).toContain('"HRM-CORE-CHK-CONFLICT-409"');
    expect(src).toContain('"HRM-CORE-CHK-404"');
  });

  it('empCoreChkRing forbids Nest /core CHK SoT', () => {
    const src = read('lib/empCoreChkRing.ts');
    expect(src).toContain('isForbiddenCoreChkSotPath');
    expect(src).toContain('CORE_CHK_PAPER_CORE_PATH');
    expect(src).toContain('/api/hrm/core/document-checklist');
    expect(src).toContain('canSubmitChkItem');
    expect(src).toContain('canApproveChkItem');
  });

  it('EmployeeProfile wires documents tab · DENY CORE-07 / printable claim', () => {
    const src = read('pages/EmployeeProfile.tsx');
    expect(src).toContain('EmployeeDocumentChecklist');
    expect(src).toContain("activeTab === 'documents'");
    expect(codeOnly(src)).not.toMatch(/personnel_uat_ready\s*=\s*true/);
    expect(codeOnly(src)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });
});
