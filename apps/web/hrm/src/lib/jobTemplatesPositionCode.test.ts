/**
 * @CODE-MEMORY
 * Screen:     Vitest static lock — JD writer position_code SoT
 * UC:         FR-HRM-RC-JD-01 · AC-SET-FS-03
 * What: Assert create/update payload uses position_code (not label-only invent)
 * Why: D-HRM-SETTINGS-MD-JT-FE-01 — BE HRM-REC-JD-POS
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-FE-01
 * What: Lock moves to JdTemplateWriterDialog (dynamic pack writer) — JobTemplatesTab delegates
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(
  resolve(__dirname, '../components/recruitment/JobTemplatesTab.tsx'),
  'utf8',
);
const writerSrc = readFileSync(
  resolve(__dirname, '../components/recruitment/JdTemplateWriterDialog.tsx'),
  'utf8',
);
const hookSrc = readFileSync(resolve(__dirname, '../hooks/useJobTemplates.ts'), 'utf8');

describe('JobTemplatesTab — position_code catalog SoT (AC-SET-FS-03)', () => {
  it('writer uses CatalogSearchPicker + position_code (not position_name as SoT)', () => {
    expect(writerSrc).toContain('CatalogSearchPicker');
    expect(writerSrc).toContain('buildJobTemplatePositionFields');
    expect(writerSrc).toContain('position_code: positionFields.position_code');
    expect(tabSrc).toContain('jobTitleOptionsFromCatalog');
    expect(tabSrc).toContain('JdTemplateWriterDialog');
  });

  it('picker stores catalog code via onValueChange (not label invent)', () => {
    expect(writerSrc).toContain('onValueChange={onPositionChange}');
    expect(writerSrc).not.toMatch(/onValueChange\(hit\?\.label/);
  });

  it('create/update send position_code (+ optional denorm position_name)', () => {
    expect(tabSrc).toContain('position_code: payload.position_code');
    expect(tabSrc).toContain('position_name: payload.position_name');
    expect(hookSrc).toContain('position_code: string');
  });

  it('empty catalog → submit disabled (honest CTA, no invent)', () => {
    expect(writerSrc).toContain('canSubmitPosition');
    expect(writerSrc).toContain('disabled={submitting || resolving || !canSubmitPosition}');
    expect(writerSrc).toContain('Mở Cài đặt → Danh mục nghiệp vụ');
  });
});
