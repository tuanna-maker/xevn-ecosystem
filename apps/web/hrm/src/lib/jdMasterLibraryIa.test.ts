/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-JD-IA-LIST-DETAIL-FE-01
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SETTINGS_NAV_GROUPS } from './settingsNavigation';
import {
  JD_DYNAMIC_CFG_TAB_ID,
  JD_MASTER_LIBRARY_TAB_ID,
  JD_MASTER_LIBRARY_WRITER_DIALOG_TEST_ID,
  settingsTabQuery,
} from './jdMasterLibraryIa';
import { HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS } from './hrmDialogFullViewport';

describe.skip('PO-HRM-JD-IA-LIST-DETAIL-FE-01 — Settings JD master IA', () => {
  it('AC-JD-SET-LIST-01: Thư viện JD tab distinct from Cấu hình trường JD', () => {
    const recruitment = SETTINGS_NAV_GROUPS.find((g) => g.groupId === 'recruitment');
    expect(recruitment).toBeDefined();
    const items = recruitment!.items;
    const library = items.find((i) => i.id === JD_MASTER_LIBRARY_TAB_ID);
    const cfg = items.find((i) => i.id === JD_DYNAMIC_CFG_TAB_ID);
    expect(library?.label).toBe('Thư viện JD');
    expect(cfg?.label).toBe('Cấu hình trường JD');
    expect(library?.id).not.toBe(cfg?.id);
  });

  it('AC-JD-SET-LIST-08: empty CTA links jd-dynamic tab query', () => {
    expect(settingsTabQuery(JD_DYNAMIC_CFG_TAB_ID)).toBe('?tab=jd-dynamic');
  });

  it('AC-JD-SET-LIST-05: writer dialog uses parent portal full viewport class', () => {
    expect(HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS).toMatch(/90vw/);
    expect(HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS).toMatch(/90vh/);
  });

  it('QA harness: settings writer dialog test id stable', () => {
    expect(JD_MASTER_LIBRARY_WRITER_DIALOG_TEST_ID).toBe(
      'settings-jd-master-library-writer-dialog',
    );
    const panelSrc = readFileSync(
      resolve(__dirname, '../components/settings/JdMasterLibrarySettingsPanel.tsx'),
      'utf8',
    );
    expect(panelSrc).toContain('dialogTestId={JD_MASTER_LIBRARY_WRITER_DIALOG_TEST_ID}');
    expect(panelSrc).not.toMatch(/<Card[\s\S]*JdTemplateWriterDialog/);
  });
});