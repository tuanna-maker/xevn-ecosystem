/**
 * Source lock — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 * Assert Settings/picker bind physical contract-templates* + PUT /clauses · no Nest /core · open catalog.
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

describe('PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical contract-templates* + PUT /clauses under contracts-insurance', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('listContractTemplates');
    expect(src).toContain('getContractTemplate');
    expect(src).toContain('createContractTemplate');
    expect(src).toContain('updateContractTemplate');
    expect(src).toContain('activateContractTemplate');
    expect(src).toContain('putContractTemplateClauses');
    expect(src).toContain('syncContractTemplateClauseBind');
    expect(src).toContain('/contracts-insurance/contract-templates');
    expect(src).toContain('/clauses?');
    expect(body).toMatch(
      /putContractTemplateClauses[\s\S]{0,600}method:\s*"PUT"/,
    );
    expect(body).toMatch(
      /syncContractTemplateClauseBind[\s\S]{0,400}putContractTemplateClauses/,
    );
    expect(body).not.toMatch(
      /(?:listContractTemplates|createContractTemplate|putContractTemplateClauses|getContractTemplate)[\s\S]{0,800}\/api\/hrm\/core\//,
    );
  });

  it('Settings Lưu/Kích hoạt uses sync PUT clauses · open catalog · no Nest /core', () => {
    const src = read('components/settings/ContractLegalPrintSettingsPanel.tsx');
    const body = codeOnly(src);
    expect(src).toContain('syncContractTemplateClauseBind');
    expect(src).toContain('createContractTemplate');
    expect(src).toContain('updateContractTemplate');
    expect(src).toContain('activateContractTemplate');
    expect(src).toContain('clauseIdsFromTemplate');
    expect(src).toContain('matrix: \'xevn\'');
    expect(src).toContain('isValidTemplateCodeFormat');
    expect(src).toContain('Không bị giới hạn 8 mẫu starter');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    // DENY closed-8-only picker slice
    expect(body).not.toMatch(/XEVN_STARTER_TEMPLATE_CODES\.slice|filter\(\s*\(?t\)?\s*=>\s*isXevnStarter/);
  });

  it('spine picker uses open catalog label + clauses[] canvas', () => {
    const src = read('components/contracts/ContractPrintSpinePanel.tsx');
    const body = codeOnly(src);
    expect(src).toContain('formatTemplatePickerLabel');
    expect(src).toContain('clauseIdsFromTemplate');
    expect(src).toContain('syncContractTemplateClauseBind');
    expect(src).toContain('activeTemplatesForPicker');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('honesty printable remains false; CODE-INVALID format-only toast', () => {
    const honesty = read('lib/contractLegalPrintConstants.ts');
    expect(honesty).toContain('CONTRACTS_PRINTABLE_READY = false');
    const apiErr = read('lib/apiError.ts');
    expect(apiErr).toContain('"HRM-CTR-TPL-CODE-INVALID"');
    expect(apiErr).toContain('Không bị chặn vì «ngoài 8 mẫu starter»');
  });
});
