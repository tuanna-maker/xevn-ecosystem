/**
 * Source lock — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
 * Assert spine bind physical pack-resolve + preview · no Nest /core SoT · no printable flip.
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

describe('PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical pack-resolve + preview under contracts-insurance', () => {
    const src = read('integrations/hrmApi.ts');
    expect(src).toContain('/contracts-insurance/contracts/pack-resolve');
    expect(src).toContain('/contracts/${contractId}/preview');
    expect(src).toContain('resolveContractPack');
    expect(src).toContain('previewContractPrint');
    expect(src).toContain('show_driver_license_block');
    expect(codeOnly(src)).not.toMatch(
      /(?:resolveContractPack|previewContractPrint)[\s\S]{0,500}\/api\/hrm\/core\//,
    );
  });

  it('spine binds LIVE pack suggest + ephemeral preview fidelity surfaces', () => {
    const src = read('components/contracts/ContractPrintSpinePanel.tsx');
    const body = codeOnly(src);
    expect(src).toContain('resolveContractPack');
    expect(src).toContain('previewContractPrint');
    expect(src).toContain('ctr-print-pack-suggest');
    expect(src).toContain('ctr-print-driver-block');
    expect(src).toContain('ctr-print-preview-summary');
    expect(src).toContain('ctr-print-missing-clauses');
    expect(src).toContain('ephemeral');
    expect(src).toContain('packLabelVi');
    expect(src).toContain('shouldShowDriverPreviewBlock');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    // DENY FE hardcode long legal body SoT (clause body from API only).
    expect(body).not.toMatch(/Căn cứ Bộ luật Lao động[\s\S]{80,}/);
  });

  it('apiError maps TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH / DRIVER', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-CTR-TPL-NONE"');
    expect(src).toContain('"HRM-CTR-PACK-INVALID"');
    expect(src).toContain('"HRM-CTR-TPL-PACK-MISMATCH"');
    expect(src).toContain('"HRM-CTR-DRIVER-REQUIRED"');
  });

  it('honesty printable remains false; MVP pack labels retained', () => {
    const src = read('lib/contractLegalPrintConstants.ts');
    expect(src).toContain('CONTRACTS_PRINTABLE_READY = false');
    expect(src).toContain("GENERAL: 'Chung'");
    expect(src).toContain("IT_OFFICE: 'IT / văn phòng'");
    expect(src).toContain("DRIVER: 'Lái xe'");
  });
});
