/**
 * @CODE-MEMORY
 * WorkItem: PO-UC-TC-W3-FE-DM09
 * Purpose: Source-contract tests for CloneCatalogPanel + CC menu wire (XBOS-DM-09).
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-DM09
 * change_mode: ADD
 * What: Assert Sao chép CTA · POST …/clone · AU forbidden · menu hrm_catalog_clone
 * Why: Residual R-DM09-FE-WIRE — must not claim apply-to-members as DM-09
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PANEL = resolve(__dirname, './CloneCatalogPanel.tsx');
const API = resolve(__dirname, '../../integrations/configSyncCloneCatalog.ts');
const CC = resolve(__dirname, './CommandCenterPage.tsx');
const APPLY = resolve(__dirname, './ApplyCatalogToMembersPanel.tsx');

describe('CloneCatalogPanel contract (PO-UC-TC-W3-FE-DM09)', () => {
  const panel = readFileSync(PANEL, 'utf8');
  const api = readFileSync(API, 'utf8');
  const cc = readFileSync(CC, 'utf8');
  const apply = readFileSync(APPLY, 'utf8');

  it('exposes Sao chép CTA + CFG-206 result surface', () => {
    expect(panel).toContain('Sao chép bộ danh mục');
    expect(panel).toContain('data-testid="clone-catalog-submit"');
    expect(panel).toContain('data-testid="clone-catalog-result"');
    expect(panel).toContain('XBOS-CFG-206');
    expect(panel).toContain('XBOS-DM-09');
  });

  it('wires POST …/catalog/{key}/clone — not apply-to-members / clone-bundle', () => {
    expect(api).toContain('/config-sync/catalog/');
    expect(api).toContain('/clone');
    expect(api).toContain('config-sync.clone-catalog');
    expect(api).not.toContain('/apply-to-members');
    expect(api).not.toContain('/catalogs/clone-bundle');
    expect(panel).toContain('cloneCatalog');
    expect(panel).toContain('XBOS-CFG-409');
  });

  it('surfaces AU forbidden for non–group CEO', () => {
    expect(panel).toContain('isGroupCeoOnMasterTenant');
    expect(panel).toContain('data-testid="clone-catalog-au-blocked"');
    expect(panel).toContain('XBOS-AUTH-003');
  });

  it('Command Center settings menu includes hrm_catalog_clone', () => {
    expect(cc).toContain("'hrm_catalog_clone'");
    expect(cc).toContain('Sao chép bộ danh mục');
    expect(cc).toContain('CloneCatalogPanel');
  });

  it('must_keep: ApplyCatalogToMembersPanel remains DM-HRM-07 only', () => {
    expect(apply).toContain('XBOS-DM-HRM-07');
    expect(apply).toContain('apply-to-members');
    expect(apply).not.toContain('/catalog/${');
    expect(apply).not.toMatch(/\/clone['"`]/);
  });
});
