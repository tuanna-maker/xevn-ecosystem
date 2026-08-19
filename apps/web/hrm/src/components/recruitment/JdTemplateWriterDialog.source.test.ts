/**
 * PO-UAT-REC-JD-DND-FE-01 — source locks for JD writer DnD storm=0.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const writerSrc = readFileSync(resolve(__dirname, './JdTemplateWriterDialog.tsx'), 'utf8');

describe('PO-UAT-REC-JD-DND-FE-01 JdTemplateWriterDialog DnD locks', () => {
  it('mounts DialogContent on parent portal (~90vw PAT-DIALOG-FULL-VIEWPORT-CC-01)', () => {
    expect(writerSrc).not.toContain('portalScope="iframe"');
    expect(writerSrc).toContain('data-hrm-dialog-portal="parent"');
    expect(writerSrc).toContain('HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS');
    expect(writerSrc).toContain('HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS');
  });

  it('palette and canvas both use sameNodeDragBind (no nested header-only handle)', () => {
    expect(writerSrc).toContain('sameNodeDragBind');
    // Nested-only pattern retired on canvas — no bare dragHandleProps spread on a child header
    expect(writerSrc).not.toMatch(/\{\.\.\.drag\.dragHandleProps\}/);
    expect(writerSrc).not.toMatch(/\{\.\.\.provided\.dragHandleProps\}/);
  });

  it('defers DragDropContext until dndReady (double rAF after open)', () => {
    expect(writerSrc).toContain('dndReady');
    expect(writerSrc).toContain('setDndReady');
    expect(writerSrc).toContain('requestAnimationFrame');
    expect(writerSrc).toMatch(/dndReady\s*\?\s*\(/);
    expect(writerSrc).toContain('jd-writer-dnd-surface');
    expect(writerSrc).toContain('jd-writer-dnd-pending');
  });

  it('keeps HDSD form dialog testid and VI labels', () => {
    expect(writerSrc).toContain('HDSD_MUTATE_TEST_IDS.jdFormDialog');
    expect(writerSrc).toContain('Thêm JD template');
    expect(writerSrc).toContain('Nhóm tùy chọn');
    expect(writerSrc).toContain('Canvas nhóm');
  });

  it('create submit label is Lưu nháp (P04 draft)', () => {
    expect(writerSrc).toContain("editing ? 'Lưu thay đổi' : 'Lưu nháp'");
  });
});
