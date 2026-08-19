/**
 * @CODE-MEMORY
 * Screen:     unit — pltTokRing helpers (PLT-01 path + DISP + honesty)
 * WorkItem:   PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 */
import { describe, expect, it } from 'vitest';
import {
  assertPlt01PrintableHonesty,
  isForbiddenPltTokSotPath,
  isMergeTokenArchived,
  isPhysicalMergeTokensPath,
  PLT_01_HONESTY_FOOTER,
  PLT_TOK_01_PATH_ASSERT,
  PLT_TOK_RESOLVE_PREVIEW_HONESTY,
  plt01HonestyBannerText,
  plt01HonestyFooterLines,
  resolveMergeTokenPrimaryLabel,
} from './pltTokRing';

describe('pltTokRing (PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01)', () => {
  it('path lock — physical merge-tokens · Nest /core TOK/PLT forbidden', () => {
    expect(PLT_TOK_01_PATH_ASSERT.list).toBe('/api/hrm/merge-tokens');
    expect(PLT_TOK_01_PATH_ASSERT.retire).toContain('/retire');
    expect(PLT_TOK_01_PATH_ASSERT.resolvePreview).toContain('resolve-preview');
    expect(PLT_TOK_01_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(isPhysicalMergeTokensPath('/api/hrm/merge-tokens?company_id=main')).toBe(true);
    expect(isForbiddenPltTokSotPath('/api/hrm/core/merge-tokens')).toBe(true);
    expect(isForbiddenPltTokSotPath('/api/hrm/merge-tokens')).toBe(false);
  });

  it('R-PLT-01-DISP — labelVi primary · raw key only when label absent', () => {
    expect(resolveMergeTokenPrimaryLabel('custom.emp.badge', 'Mã thẻ NV')).toBe('Mã thẻ NV');
    expect(resolveMergeTokenPrimaryLabel('custom.emp.badge', '')).toBe('{{custom.emp.badge}}');
    expect(resolveMergeTokenPrimaryLabel(null, null)).toBe('—');
  });

  it('soft-retire — archivedAt set hides from default picker', () => {
    expect(isMergeTokenArchived(null)).toBe(false);
    expect(isMergeTokenArchived('')).toBe(false);
    expect(isMergeTokenArchived('2026-08-09T10:00:00.000Z')).toBe(true);
  });

  it('honesty footers · printable false · ≠ PLT/CORE DONE · PAY/ATT OUT · no VER invent', () => {
    expect(assertPlt01PrintableHonesty()).toBe(true);
    const lines = plt01HonestyFooterLines();
    expect(lines).toContain(PLT_01_HONESTY_FOOTER.catalogNePltDone);
    expect(lines).toContain(PLT_01_HONESTY_FOOTER.mergeNePlatformUat);
    expect(lines).toContain(PLT_01_HONESTY_FOOTER.catalogNeCore10Done);
    expect(lines).toContain(PLT_01_HONESTY_FOOTER.payAttOut);
    expect(lines).toContain(PLT_01_HONESTY_FOOTER.softNeCore06);
    expect(PLT_TOK_RESOLVE_PREVIEW_HONESTY.noVerWrite).toContain('≠ VER write');
    const banner = plt01HonestyBannerText();
    expect(banner).toContain('peer catalog ≠ PLT-01 DONE');
    expect(banner).toContain('merge LIVE ≠ platform');
    expect(banner).toContain('resolve-preview ≠ VER write');
  });
});
