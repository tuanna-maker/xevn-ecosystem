/**
 * Source lock — PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01
 * Assert PREV bind + registry without template · Nest /core CTR=0 · honesty footers.
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

describe('PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical contracts* + preview · no Nest /core CTR SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/contracts-insurance/contracts');
    expect(src).toContain('/contracts/${contractId}/preview');
    expect(src).toContain('previewContractPrint');
    expect(src).toContain('createEmployeeContract');
    expect(src).toContain('merged_fields');
    expect(src).toContain('can_issue');
    expect(src).toContain('cb_masked');
    expect(src).toContain('statusLabelVi');
    expect(body).not.toMatch(
      /(?:createEmployeeContract|previewContractPrint|listEmployeeContracts)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('spine binds PREV surfaces + ZERO-TPL CTA + honesty 09a–d≠DONE · CORE-07 RETAIN', () => {
    const src = read('components/contracts/ContractPrintSpinePanel.tsx');
    const body = codeOnly(src);
    expect(src).toContain('previewContractPrint');
    expect(src).toContain('merged_fields');
    expect(src).toContain('can_issue');
    expect(src).toContain('cb_masked');
    expect(src).toContain('ctr-core09-zero-tpl-cta');
    expect(src).toContain('ctr-core09-honesty');
    expect(src).toContain('ctr-print-missing-fields');
    expect(src).toContain('CORE_09_ZERO_TPL_CTA');
    expect(src).toContain('core09HonestyBannerText');
    expect(src).toContain('isPreviewMandatoryBlocked');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    // DENY invent Word upload as SoT — honesty may cite «Word/DOCX OUT»
    expect(body).not.toMatch(/application\/vnd\.openxmlformats|word\.document|\.docx['"`]/i);
    expect(src).toContain('09a–d ADD ≠ CORE-09 DONE');
    expect(src).toContain('CORE-07 GATE/ACT RETAIN');
  });

  it('registry create omits blank template · statusLabelVi FE-derive · terminated preserved', () => {
    const hook = read('hooks/useContracts.ts');
    const page = read('pages/Contracts.tsx');
    const ring = read('lib/contractCore09Ring.ts');
    expect(hook).toContain('omitBlankContractTemplateFields');
    expect(hook).toContain('statusLabelVi');
    expect(hook).toContain('resolveContractStatusLabelVi');
    // DENY collapse terminated→expired (DISP-01) — mapApiStatus must return status as-is
    expect(hook).toContain('preserve terminated');
    expect(codeOnly(hook)).not.toMatch(
      /if\s*\(\s*status\s*===\s*['"]terminated['"]\s*\)\s*return\s*['"]expired['"]/,
    );
    // PO-HRM-CTR-CREATE-REDESIGN-FE-01 / AC-CTR-UX-01 — list + create path DENY user honesty paragraphs
    expect(page).not.toContain('ctr-core09-registry-honesty');
    expect(page).not.toContain('core09HonestyBannerText');
    expect(page).toContain('ContractCreateWizardDialog');
    expect(page).toContain('ctr-create-list-hint');
    expect(page).toContain('AC-CTR-XEVN-08');
    expect(ring).toContain("active: 'Hiệu lực'");
    expect(ring).toContain('R-CORE-09-DISP-01');
  });

  it('DENY invent PAY/ATT/printable DONE · Word · Nest /core dual in ring', () => {
    const ring = read('lib/contractCore09Ring.ts');
    expect(ring).toContain('PAY/ATT invent DONE OUT');
    expect(ring).toContain('Word/DOCX primary OUT');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('soft ≠ CORE-06 DONE');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });
});
