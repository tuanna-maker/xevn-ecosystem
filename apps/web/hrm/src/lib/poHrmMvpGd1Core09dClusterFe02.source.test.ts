/**
 * Source lock — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02
 * Assert updateContractTemplate PATCH omits company_id from JSON body (query only).
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

describe('PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02 source lock', () => {
  it('updateContractTemplate strips company_id from PATCH body (query only)', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    const start = body.indexOf('export async function updateContractTemplate');
    const end = body.indexOf('export async function putContractTemplateClauses', start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const fn = body.slice(start, end);
    expect(fn).toContain('company_id: scopeCompanyId');
    expect(fn).toContain('search.set("company_id"');
    expect(fn).toContain('method: "PATCH"');
    expect(fn).toContain('JSON.stringify(body)');
    // Must not re-inject company_id into PATCH JSON body
    expect(fn).not.toMatch(/JSON\.stringify\(\s*\{[\s\S]*company_id/);
    expect(fn).not.toContain('/api/hrm/core/');
  });

  it('Settings edit Lưu still calls updateContractTemplate then sync PUT clauses', () => {
    const src = read('components/settings/ContractLegalPrintSettingsPanel.tsx');
    const body = codeOnly(src);
    expect(body).toContain('updateContractTemplate(editingTplId');
    expect(body).toContain('syncContractTemplateClauseBind(editingTplId, companyId, clause_ids)');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('honesty printable remains false', () => {
    const honesty = read('lib/contractLegalPrintConstants.ts');
    expect(honesty).toContain('CONTRACTS_PRINTABLE_READY = false');
  });
});
