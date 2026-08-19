/**
 * Source lock — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
 * Assert Settings bind physical contract-clauses* · CONFLICT→activate · no Nest /core SoT.
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

describe('PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical contract-clauses + activate/retire + get-by-id', () => {
    const src = read('integrations/hrmApi.ts');
    expect(src).toContain('/contracts-insurance/contract-clauses');
    expect(src).toContain('listContractClauses');
    expect(src).toContain('getContractClause');
    expect(src).toContain('createContractClause');
    expect(src).toContain('updateContractClause');
    expect(src).toContain('/activate');
    expect(src).toContain('/retire');
    expect(src).toContain('contract-library/publishes');
    expect(codeOnly(src)).not.toMatch(
      /(?:list|create|update|activate|retire|get)ContractClause[\s\S]{0,400}\/api\/hrm\/core\//,
    );
  });

  it('Settings panel CONFLICT bump + VI labels + draft create + placeholder validate', () => {
    const src = read('components/settings/ContractLegalPrintSettingsPanel.tsx');
    const body = codeOnly(src);
    expect(src).toContain('listContractClauses');
    expect(src).toContain('updateContractClause');
    expect(src).toContain('activateContractClause');
    expect(src).toContain('retireContractClause');
    expect(src).toContain('isCtrClCodeConflict');
    expect(src).toContain('validateClausePlaceholderSyntax');
    expect(src).toContain('clauseStatusLabelVi');
    expect(src).toContain('ctr-clause-issued-conflict-banner');
    expect(src).toContain('ctr-clause-activate-bump');
    expect(src).toContain("status: 'draft'");
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('apiError maps CTR-CL REQUIRED / CODE-CONFLICT / 404', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-CTR-CL-REQUIRED"');
    expect(src).toContain('"HRM-CTR-CL-CODE-CONFLICT"');
    expect(src).toContain('"HRM-CTR-CL-404"');
  });

  it('honesty printable remains false in constants', () => {
    const src = read('lib/contractLegalPrintConstants.ts');
    expect(src).toContain('CONTRACTS_PRINTABLE_READY = false');
    expect(src).toContain('CONTRACT_CLAUSE_STATUS_LABELS');
  });
});
