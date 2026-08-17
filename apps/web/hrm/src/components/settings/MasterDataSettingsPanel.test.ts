/**
 * @CODE-MEMORY
 * Screen:     Vitest — Settings master-data E1-B registry + source gate
 * UC:         FR-HRM-SC-SET-UI-01 · AC-SET-UI-01/05/07
 * What:       ≥10 buckets VI; DEC dual keys + writeKey; panel source wires forceMount/search/Ngưng
 * Why:        D-FE-ERP-E1B-MD-PANEL-01 — RTL full panel blocked by dual-react in vitest (residual)
 * WorkItem:   D-FE-ERP-E1B-MD-PANEL-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 BUILD-GAP-MD-PANEL-01 — restore panel.tsx from 43c479a; gate 36/36 with catalogSearchPicker + hrmSettingsCatalogItem
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertE1bMdBucketRegistry,
  MD_BUCKET_META,
  MD_BUCKET_ORDER,
} from '@/lib/mdBucketRegistry';
import { HRM_MASTER_DATA_CATALOG_KEYS } from '@/lib/catalogSearchPicker';

const panelSrc = readFileSync(
  join(__dirname, 'MasterDataSettingsPanel.tsx'),
  'utf8',
);

describe('D-FE-ERP-E1B-MD-PANEL-01 — registry (≥10 / DEC alias)', () => {
  it('exposes ≥10 MD buckets with Vietnamese titles (AC-SET-UI-01 / U72)', () => {
    const snap = assertE1bMdBucketRegistry();
    expect(snap.bucketCount).toBeGreaterThanOrEqual(10);
    expect(MD_BUCKET_ORDER.length).toBe(snap.bucketCount);
    for (const id of MD_BUCKET_ORDER) {
      expect(MD_BUCKET_META[id].title.trim().length).toBeGreaterThan(0);
      expect(MD_BUCKET_META[id].title.includes('_')).toBe(false);
    }
    expect(MD_BUCKET_META.employmentTypes.title).toBe('Loại hình lao động');
    expect(MD_BUCKET_META.contractTypes.title).toBe('Loại hợp đồng');
    expect(MD_BUCKET_META.decisionTypes.title).toBe('Loại quyết định');
  });

  it('DEC keys dual-read + writeKey prefer hr_decision_types (AC-SET-UI-05 / SA)', () => {
    const snap = assertE1bMdBucketRegistry();
    expect([...snap.decisionKeys]).toEqual(['hr_decision_types', 'decision_types']);
    expect(snap.decisionWriteKey).toBe('hr_decision_types');
    expect([...HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes]).toEqual([
      'hr_decision_types',
      'decision_types',
    ]);
  });

  it('includes all E1-B ADD families from BA inventory', () => {
    const ids = new Set(MD_BUCKET_ORDER);
    for (const required of [
      'positions',
      'departments',
      'leaveTypes',
      'decisionTypes',
      'payTypes',
      'shifts',
      'jobGrades',
      'recruitmentChannels',
      'contractTypes',
      'employmentTypes',
    ] as const) {
      expect(ids.has(required)).toBe(true);
    }
    expect(MD_BUCKET_META.shifts.writeKey).toBe('shifts');
    expect(MD_BUCKET_META.shifts.description.toLowerCase()).toContain('work_shifts');
  });
});

describe('D-FE-ERP-E1B-MD-PANEL-01 — panel source gate', () => {
  it('wires MD_BUCKET_ORDER with forceMount + search + Ngưng soft-stop', () => {
    expect(panelSrc).toContain('MD_BUCKET_ORDER');
    expect(panelSrc).toContain('MD_BUCKET_META');
    expect(panelSrc).toContain('forceMount');
    expect(panelSrc).toContain('md-search-');
    expect(panelSrc).toContain('Ngưng');
    expect(panelSrc).toContain("status: 'draft'");
    expect(panelSrc).toContain('mergeEffectiveItemsByKeys');
    expect(panelSrc).toContain('resolveCatalogWriteKey');
    expect(panelSrc).toContain('D-FE-ERP-E1B-MD-PANEL-01');
    // must_keep mentions work_shifts only as forbidden dual-write — no Attendance TX wiring
    expect(panelSrc).not.toMatch(/from\(['"]@\/.*work_shifts/i);
    expect(panelSrc).not.toMatch(/upsertWorkShift|dualWrite.*work_shifts/i);
  });

  it('keeps departments upsert form testids for U65 create path', () => {
    expect(panelSrc).toContain('md-code-${bucket}');
    expect(panelSrc).toContain('md-upsert-form-${bucket}');
    expect(panelSrc).toContain('md-save-${bucket}');
  });

  it('gates leaveTypes REF read-only + ATT tab CTA (HRM-SC-01)', () => {
    expect(panelSrc).toContain('isLeaveTypesGroupRefReadOnly');
    expect(panelSrc).toContain('md-leave-types-ref-readonly-banner');
    expect(panelSrc).toContain('md-leave-types-open-att-tab');
    expect(panelSrc).toContain('SETTINGS_ATT_LEAVE_TYPES_PATH');
    expect(panelSrc).toContain('PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01');
  });
});
