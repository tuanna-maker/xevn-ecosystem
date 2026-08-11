/**
 * @CODE-MEMORY
 * WorkItem: BM-FE-CFG-APPLY-MEMBERS-01 · D-XBOS-U72-F10-HOLDING-PATH-01
 * Purpose: Source-contract + F-XBOS-10 display tests for ApplyCatalogToMembersPanel.
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-XBOS-U72-F10-HOLDING-PATH-01
 * change_mode: FIX
 * What: Thêm unit formatApplyCatalogSourceScopeDisplay — cấm \bholding\b user-facing
 * Why: AC-F-XBOS-10 / BR-XBOS-COPY-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-FE-U72-SOFT-P2-01
 * change_mode: FIX
 * What: Assert dropdown/confirm không còn `(job_titles)` paren slug
 * Why: QC C-XBOS-U72-P2 soft
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatApplyCatalogSourceScopeDisplay } from './ApplyCatalogToMembersPanel';

const PANEL = resolve(__dirname, './ApplyCatalogToMembersPanel.tsx');
const API = resolve(__dirname, '../../integrations/configSyncApplyMembers.ts');
const CC = resolve(__dirname, './CommandCenterPage.tsx');

describe('ApplyCatalogToMembersPanel source contract (BM-FE-CFG-APPLY-MEMBERS-01)', () => {
  const panel = readFileSync(PANEL, 'utf8');
  const api = readFileSync(API, 'utf8');
  const cc = readFileSync(CC, 'utf8');

  it('exposes Áp dụng CTA + appliedCount status surface', () => {
    expect(panel).toContain('Áp dụng cho');
    expect(panel).toContain('appliedCount');
    expect(panel).toContain('data-testid="apply-catalog-submit"');
    expect(panel).toContain('data-testid="apply-catalog-result"');
  });

  it('documents Group CEO 409 member-scope note', () => {
    expect(panel).toContain('MEMBER_SCOPE_409_NOTE');
    expect(api).toContain('SCOPE_CONTEXT_MISMATCH');
    expect(panel).toContain('data-testid="apply-catalog-member-scope-note"');
  });

  it('wires allow-list P0∪P1 keys + DEC writeKey bind', () => {
    expect(api).toContain("'job_titles'");
    expect(api).toContain("'recruitment_channels'");
    expect(api).toContain("'job_grades'");
    expect(api).toContain("'departments'");
    expect(api).toContain("'leave_types'");
    expect(api).toContain("'decision_types'");
    expect(api).toContain("hr_decision_types: 'decision_types'");
    expect(api).toContain('resolveApplyWriteKey');
    expect(panel).toContain('APPLY_TO_MEMBERS_CATALOG_KEYS');
    expect(panel).toContain('writeKey: source?.catalogKey');
    expect(api).not.toContain("'salary_components'");
    expect(api).not.toContain("'cost_centers'");
  });

  it('Command Center settings menu includes hrm_catalog_apply_members', () => {
    expect(cc).toContain("'hrm_catalog_apply_members'");
    expect(cc).toContain('Áp dụng danh mục HRM');
    expect(cc).toContain('ApplyCatalogToMembersPanel');
  });

  it('calls apply-to-members endpoint helper', () => {
    expect(api).toContain('/apply-to-members');
    expect(panel).toContain('applyCatalogToMembers');
    expect(panel).toContain('XBOS-DM-HRM-07');
  });

  it('source summary uses display helper — never interpolates raw tenant/company wire path', () => {
    expect(panel).toContain('formatApplyCatalogSourceScopeDisplay');
    expect(panel).toContain('data-testid="apply-catalog-source-summary"');
    // Must not render wire path literally in JSX (AC-F-XBOS-10).
    expect(panel).not.toMatch(/\{source\.tenantId\}\/\{source\.companyId\}/);
  });
});

describe('formatApplyCatalogSourceScopeDisplay (D-XBOS-U72-F10-HOLDING-PATH-01)', () => {
  it('maps holding companyId to tập đoàn — no EN holding token', () => {
    const label = formatApplyCatalogSourceScopeDisplay('xevn', 'holding');
    expect(label).toBe('tập đoàn');
    expect(label).not.toMatch(/\bholding\b/i);
    expect(label).not.toContain('xevn/holding');
  });

  it('maps main slug to tập đoàn', () => {
    expect(formatApplyCatalogSourceScopeDisplay('xevn', 'main')).toBe('tập đoàn');
  });

  it('keeps non-holding member scope as tenant/company for diagnostics', () => {
    expect(formatApplyCatalogSourceScopeDisplay('xevn', 'du-lich')).toBe('xevn/du-lich');
  });

  it('empty → em dash', () => {
    expect(formatApplyCatalogSourceScopeDisplay('', '')).toBe('—');
  });
});

describe('ApplyCatalog dropdown labels (D-FE-U72-SOFT-P2-01)', () => {
  const panel = readFileSync(PANEL, 'utf8');
  const api = readFileSync(API, 'utf8');

  it('does not render Chức danh (job_titles) paren slug in option/confirm copy', () => {
    expect(panel).not.toMatch(/APPLY_TO_MEMBERS_CATALOG_LABELS\[key\]\}\s*\(\{key\}\)/);
    expect(panel).not.toContain('({catalogKey})');
    expect(panel).not.toMatch(/`\$\{catalogLabel\}` \(\$\{catalogKey\}\)/);
    // VI labels still present; wire keys stay on value= / allow-list only.
    expect(panel).toContain('APPLY_TO_MEMBERS_CATALOG_LABELS[key]');
    expect(api).toContain("job_titles: 'Chức danh'");
  });
});
