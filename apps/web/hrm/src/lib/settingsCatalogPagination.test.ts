import { describe, expect, it, beforeEach } from 'vitest';
import { resolveEffectiveSettingsTab } from './settingsNavigation';
import {
  catalogPageForKey,
  clearSettingsCatalogFocus,
  consumeSettingsCatalogFocusPage,
  readSettingsCatalogFocus,
  resolveSettingsCatalogFocusPage,
  resolveSettingsCatalogInitialSearchQuery,
  settingsCatalogFocusPageAfterSearch,
  settingsCatalogRowTestId,
  settingsCatalogFocusStorageKey,
  sortSettingsCatalogByOrderThenKey,
  writeSettingsCatalogFocus,
  SETTINGS_CATALOG_PAGE_SIZE,
} from './settingsCatalogPagination';

type Row = { key: string; sortOrder: number };

describe('settingsCatalogPagination — F5 focus', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('resolveEffectiveSettingsTab prefers iframe tab then parent tab', () => {
    expect(resolveEffectiveSettingsTab('att-attendance-codes', 'emp-document-types')).toBe(
      'att-attendance-codes',
    );
    expect(resolveEffectiveSettingsTab(null, 'emp-document-types')).toBe('emp-document-types');
    expect(resolveEffectiveSettingsTab('', 'rec-pipeline-stages')).toBe('rec-pipeline-stages');
    expect(resolveEffectiveSettingsTab(null, null)).toBe('account');
  });

  it('writeSettingsCatalogFocus uses localStorage (survives iframe teardown on parent reload)', () => {
    writeSettingsCatalogFocus('att-attendance-codes', 'f5_slug');
    expect(localStorage.getItem(settingsCatalogFocusStorageKey('att-attendance-codes'))).toBe('f5_slug');
    expect(sessionStorage.getItem(settingsCatalogFocusStorageKey('att-attendance-codes'))).toBeNull();
  });

  it('sortSettingsCatalogByOrderThenKey orders by sortOrder then key', () => {
    const rows: Row[] = [
      { key: 'z_last', sortOrder: 100 },
      { key: 'a_first', sortOrder: 10 },
      { key: 'm_mid', sortOrder: 100 },
    ];
    const sorted = sortSettingsCatalogByOrderThenKey(rows, (r) => r.sortOrder, (r) => r.key);
    expect(sorted.map((r) => r.key)).toEqual(['a_first', 'm_mid', 'z_last']);
  });

  it('settingsCatalogFocusStorageKey normalizes tab id case', () => {
    expect(settingsCatalogFocusStorageKey('ATT-Attendance-Codes')).toBe(
      settingsCatalogFocusStorageKey('att-attendance-codes'),
    );
  });

  it('writeSettingsCatalogFocus + consume jumps page for key on large list', () => {
    const tab = 'att-attendance-codes';
    const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
      key: `code_${String(i).padStart(2, '0')}`,
      sortOrder: i,
    }));
    const target = 'code_22';
    writeSettingsCatalogFocus(tab, target);
    expect(readSettingsCatalogFocus(tab)).toBe('code_22');

    const page = consumeSettingsCatalogFocusPage(tab, rows, (r) => r.key, SETTINGS_CATALOG_PAGE_SIZE);
    expect(page).toBe(catalogPageForKey(rows, target, (r) => r.key));
    expect(readSettingsCatalogFocus(tab)).toBeNull();
  });

  it('consume returns null when row missing and keeps storage for retry', () => {
    writeSettingsCatalogFocus('emp-document-types', 'missing_key');
    const page = consumeSettingsCatalogFocusPage(
      'emp-document-types',
      [{ key: 'other', sortOrder: 1 }],
      (r) => r.key,
    );
    expect(page).toBeNull();
    expect(readSettingsCatalogFocus('emp-document-types')).toBe('missing_key');
    clearSettingsCatalogFocus('emp-document-types');
  });

  it('resolveSettingsCatalogFocusPage is case-insensitive on row keys', () => {
    const rows: Row[] = [{ key: 'RT2Slug', sortOrder: 1 }];
    expect(resolveSettingsCatalogFocusPage(rows, 'rt2slug', (r) => r.key)).toBe(1);
  });

  it('settingsCatalogRowTestId normalizes lowercase slug', () => {
    expect(settingsCatalogRowTestId('RT2Slug')).toBe('settings-catalog-row-rt2slug');
  });

  it('settingsCatalogFocusPageAfterSearch returns page 1 for narrowed match', () => {
    const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
      key: `code_${String(i).padStart(2, '0')}`,
      sortOrder: i,
    }));
    rows.push({ key: 'rt2target', sortOrder: 999 });
    expect(settingsCatalogFocusPageAfterSearch(rows, 'rt2target', (r) => r.key)).toBe(1);
  });

  it('resolveSettingsCatalogInitialSearchQuery prefers localStorage then iframe focus', () => {
    writeSettingsCatalogFocus('att-attendance-codes', 'from_store');
    expect(resolveSettingsCatalogInitialSearchQuery('att-attendance-codes', 'from_url')).toBe(
      'from_store',
    );
    localStorage.clear();
    expect(resolveSettingsCatalogInitialSearchQuery('att-attendance-codes', 'from_url')).toBe(
      'from_url',
    );
  });
});
