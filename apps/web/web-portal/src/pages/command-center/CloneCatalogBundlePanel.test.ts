/**
 * @CODE-MEMORY
 * WorkItem: PO-UC-TC-W3-FE-LOG09
 * Purpose: Source-contract + HDSD surface tests for CloneCatalogBundlePanel.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PANEL = resolve(__dirname, './CloneCatalogBundlePanel.tsx');
const API = resolve(__dirname, '../../integrations/configSyncCloneBundle.ts');
const CC = resolve(__dirname, './CommandCenterPage.tsx');
const APPLY = resolve(__dirname, './ApplyCatalogToMembersPanel.tsx');

describe('CloneCatalogBundlePanel contract (PO-UC-TC-W3-FE-LOG09)', () => {
  const panel = readFileSync(PANEL, 'utf8');
  const api = readFileSync(API, 'utf8');
  const cc = readFileSync(CC, 'utf8');
  const apply = readFileSync(APPLY, 'utf8');

  it('exposes Sao chép bộ CTA + CFG-205 result surface + HDSD testids', () => {
    expect(panel).toContain('Sao chép bộ danh mục');
    expect(panel).toContain('XBOS-DM-LOG-09');
    expect(panel).toContain('data-testid="clone-bundle-submit"');
    expect(panel).toContain('data-testid="clone-bundle-result"');
    expect(panel).toContain('data-hdsd="sao-chep-bo-danh-muc"');
    expect(panel).toContain('XBOS-CFG-205');
    expect(panel).toContain('XBOS-CFG-009');
  });

  it('wires clone-bundle logistics domains — not apply-to-members / single-key clone', () => {
    expect(api).toContain('/catalogs/clone-bundle');
    expect(api).toContain("CLONE_BUNDLE_LOGISTICS_DOMAINS = ['logistics']");
    expect(panel).toContain('cloneCatalogBundle');
    expect(panel).toContain('CLONE_BUNDLE_LOGISTICS_DOMAINS');
    expect(panel).not.toContain('applyCatalogToMembers');
    expect(panel).not.toContain('/apply-to-members');
    expect(apply).toContain('applyCatalogToMembers');
  });

  it('Command Center settings menu includes log_catalog_clone_bundle', () => {
    expect(cc).toContain("'log_catalog_clone_bundle'");
    expect(cc).toContain('Sao chép bộ danh mục LOG');
    expect(cc).toContain('CloneCatalogBundlePanel');
  });

  it('must_keep ApplyCatalogToMembersPanel still mounted', () => {
    expect(cc).toContain('ApplyCatalogToMembersPanel');
    expect(cc).toContain("'hrm_catalog_apply_members'");
  });

  it('gates Group CEO AU surface', () => {
    expect(panel).toContain('isGroupCeoOnMasterTenant');
    expect(panel).toContain('data-testid="clone-bundle-au-block"');
    expect(panel).toContain('XBOS-AUTH-003');
  });

  it('source summary uses display helper — no raw holding in user summary copy helpers', () => {
    expect(panel).toContain('formatApplyCatalogSourceScopeDisplay');
    expect(panel).toContain('data-testid="clone-bundle-source-summary"');
  });
});
