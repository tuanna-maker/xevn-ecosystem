import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('D-HRM-TOOLS-STUB-TOAST-01 — ToolsEquipment page read-only + deferred notice', () => {
  const src = readFileSync(join(process.cwd(), 'src/pages/ToolsEquipment.tsx'), 'utf8');

  it('does not expose Add/Edit/Delete stub actions or fake save', () => {
    expect(src).not.toMatch(/Thêm CCDC|Tạo phiếu|Thêm mới/);
    expect(src).not.toMatch(/openAdd|openEdit|handleSave/);
    expect(src).not.toMatch(/addTool|updateTool|deleteTool|addAssignment/);
    expect(src).not.toMatch(/Trash2|<Edit\b/);
    expect(src).not.toMatch(/toast\.success/);
    expect(src).not.toContain('useEmployees');
    expect(src).toContain('TOOLS_MUTATION_UNSUPPORTED_VI');
    expect(src).toContain('tools-readonly-notice');
    expect(src).toContain('tools-deferred-banner');
  });

  it('view dialog has DialogTitle and DialogDescription (aria)', () => {
    expect(src).toMatch(/DialogTitle/);
    expect(src).toMatch(/DialogDescription/);
    expect(src).toContain('tools-view-desc');
    expect(src).toMatch(/aria-describedby=["']tools-view-desc["']/);
  });
});
