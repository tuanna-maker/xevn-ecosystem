/**
 * Source lock — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01
 * Assert spine bind physical print-versions + pdf · no Nest /core SoT · no printable flip.
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

describe('PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical print-versions + pdf under contracts-insurance', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('createContractPrintVersion');
    expect(src).toContain('listContractPrintVersions');
    expect(src).toContain('getContractPrintVersion');
    expect(src).toContain('fetchContractPrintPdf');
    expect(src).toContain('/contracts/${contractId}/print-versions');
    expect(src).toContain('/print-versions/${params.version_id}/pdf');
    expect(src).toContain('%PDF');
    expect(body).not.toMatch(
      /(?:createContractPrintVersion|listContractPrintVersions|fetchContractPrintPdf|getContractPrintVersion)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('spine binds Lưu phiên bản + PDF fidelity · PREV ephemeral must_keep', () => {
    const src = read('components/contracts/ContractPrintSpinePanel.tsx');
    const body = codeOnly(src);
    expect(src).toContain('createContractPrintVersion');
    expect(src).toContain('fetchContractPrintPdf');
    expect(src).toContain('getContractPrintVersion');
    expect(src).toContain('ctr-print-save-version');
    expect(src).toContain('ctr-print-versions');
    expect(src).toContain('ctr-print-issue-blocked');
    expect(src).toContain('ctr-print-version-detail');
    expect(src).toContain('formatPrintVersionListLine');
    expect(src).toContain('extractIssueBlockedDetails');
    expect(src).toContain('HRM-CTR-VERSION-NOT-ISSUED');
    expect(src).toContain('ephemeral');
    expect(src).toContain('previewContractPrint');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    // DENY FE invent long legal body / live PDF merge invent.
    expect(body).not.toMatch(/Căn cứ Bộ luật Lao động[\s\S]{80,}/);
    expect(body).not.toMatch(/jsPDF|pdf-lib|html2pdf/i);
  });

  it('apiError maps ISSUE-BLOCKED / VERSION-NOT-ISSUED / PV-404 / RENDER-FAIL', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-CTR-ISSUE-BLOCKED"');
    expect(src).toContain('"HRM-CTR-VERSION-NOT-ISSUED"');
    expect(src).toContain('"HRM-CTR-PV-404"');
    expect(src).toContain('"HRM-CTR-RENDER-FAIL"');
  });

  it('honesty printable remains false; path assert helpers present', () => {
    const honesty = read('lib/contractLegalPrintConstants.ts');
    expect(honesty).toContain('CONTRACTS_PRINTABLE_READY = false');
    const ux = read('lib/contractPrintVersionUx.ts');
    expect(ux).toContain('CORE_CTR_VER_PATH_ASSERT');
    expect(ux).toContain('/contracts-insurance/');
    expect(ux).toContain('nestCoreDenied');
    expect(ux).toContain('CORE_CTR_PDF_SNAPSHOT_ONLY_ASSERT');
  });
});
