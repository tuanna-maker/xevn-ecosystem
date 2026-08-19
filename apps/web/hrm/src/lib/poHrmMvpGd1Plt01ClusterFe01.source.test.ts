/**
 * Source lock — PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01
 * Assert merge-tokens* bind · Nest /core TOK/PLT=0 · honesty · soft-retire · no VER invent.
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

describe('PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical merge-tokens* list/get/upsert/retire/resolve-preview · no Nest /core TOK SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/merge-tokens');
    expect(src).toContain('listMergeTokens');
    expect(src).toContain('upsertMergeToken');
    expect(src).toContain('retireMergeToken');
    expect(src).toContain('resolveMergeTokenPreview');
    expect(src).toContain('/retire');
    expect(src).toContain('resolve-preview');
    expect(src).toContain('labelVi');
    expect(src).toContain('archivedAt');
    expect(body).not.toMatch(
      /(?:listMergeTokens|getMergeTokenById|upsertMergeToken|retireMergeToken|resolveMergeTokenPreview)[\s\S]{0,900}\/api\/hrm\/core\//,
    );
  });

  it('MergeTokenSettingsPanel binds LIVE DTO + soft-retire + honesty · Nest /core 0', () => {
    const panel = read('components/settings/MergeTokenSettingsPanel.tsx');
    const body = codeOnly(panel);
    expect(panel).toContain('listMergeTokens');
    expect(panel).toContain('upsertMergeToken');
    expect(panel).toContain('retireMergeToken');
    expect(panel).toContain('resolveMergeTokenPreview');
    expect(panel).toContain('labelVi');
    expect(panel).toContain('archivedAt');
    expect(panel).toContain('plt-01-honesty');
    expect(panel).toContain('plt01HonestyBannerText');
    expect(panel).toContain('include_archived');
    expect(panel).toContain('PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01');
    expect(body).not.toContain('/api/hrm/core/');
    expect(body).not.toMatch(/method:\s*['"]DELETE['"]/);
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    // resolve-preview must not invent VER/print as SoT
    expect(panel).toContain('≠ VER');
    expect(body).not.toContain('print-versions');
  });

  it('pltTokRing path + DISP + honesty · DENY invent PAY/printable/CORE DONE', () => {
    const ring = read('lib/pltTokRing.ts');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('/api/hrm/merge-tokens');
    expect(ring).toContain('peer catalog ≠ PLT-01 DONE');
    expect(ring).toContain('merge LIVE ≠ platform');
    expect(ring).toContain('catalog/CRUD/LIVE ≠ CORE-10 DONE');
    expect(ring).toContain('PAY/ATT OUT invent DONE');
    expect(ring).toContain('soft ≠ CORE-06 DONE');
    expect(ring).toContain('resolve-preview ≠ VER write');
    expect(ring).toContain('R-PLT-01-DISP');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('mergeTokenCatalog printable honesty false · format-only key · no mega-EAV', () => {
    const cat = read('lib/mergeTokenCatalog.ts');
    expect(cat).toContain('MERGE_TOKEN_PRINTABLE_HONESTY = false');
    expect(cat).toContain('MERGE_TOKEN_KEY_FORMAT');
    expect(codeOnly(cat)).not.toContain('/api/hrm/core/');
    expect(codeOnly(cat)).not.toContain('emp_custom_field');
  });
});
