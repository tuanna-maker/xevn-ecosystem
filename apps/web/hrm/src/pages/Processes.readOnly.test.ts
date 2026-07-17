import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('P1-HRM-PROCESSES-FE-01 — Processes page read-only + a11y title', () => {
  const src = readFileSync(join(process.cwd(), 'src/pages/Processes.tsx'), 'utf8');

  it('does not expose Add/Edit/Delete stub actions or fake save', () => {
    expect(src).not.toMatch(/Thêm quy trình|Thêm quy định|Thêm mới/);
    expect(src).not.toMatch(/openAdd|openEdit|handleSave/);
    expect(src).not.toMatch(/addProcess|updateProcess|deleteProcess/);
    expect(src).not.toMatch(/Trash2|<Edit\b/);
    expect(src).not.toMatch(/toast\.success/);
    expect(src).toContain('PROCESSES_MUTATION_UNSUPPORTED_VI');
    expect(src).toContain('processes-readonly-notice');
  });

  it('view dialog has DialogTitle and DialogDescription (aria)', () => {
    expect(src).toMatch(/DialogTitle/);
    expect(src).toMatch(/DialogDescription/);
    expect(src).toContain('processes-view-desc');
    expect(src).toMatch(/aria-describedby=["']processes-view-desc["']/);
  });
});
