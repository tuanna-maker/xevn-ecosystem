import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * D-HRM-EMP-PROFILE-BTN-NEST-01 — pinned-tab DnD must not nest <button> inside Button.
 */
describe('D-HRM-EMP-PROFILE-BTN-NEST-01 — EmployeeProfile pinned tab DOM nesting', () => {
  const root = process.cwd();
  const src = readFileSync(join(root, 'src/pages/EmployeeProfile.tsx'), 'utf8');

  /** Slice the pinned-tabs Draggable render (Button + drag handle + unpin). */
  function pinnedTabBlock(): string {
    const start = src.indexOf('{/* Pinned tabs with drag and drop */}');
    const end = src.indexOf('{/* Group dropdowns: HR / Career / Personal */}');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    return src.slice(start, end);
  }

  it('drag handle is a div with dragHandleProps (not a nested button)', () => {
    const block = pinnedTabBlock();
    expect(block).toMatch(/<div[\s\S]*?\{\.\.\.provided\.dragHandleProps\}/);
    expect(block).not.toMatch(/<button[\s\S]*?dragHandleProps/);
  });

  it('unpin control is span role=button — no nested button element inside pinned Button', () => {
    const block = pinnedTabBlock().replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    expect(block).toMatch(/role="button"/);
    expect(block).toMatch(/togglePin\(tab\.id\)/);
    // Raw button element inside pinned Draggable tab chrome causes validateDOMNesting.
    expect(block).not.toMatch(/<button\b/);
  });

  it('carry-check: DialogContent aria-describedby default + RR v7 flags still present', () => {
    const dialogSrc = readFileSync(join(root, 'src/components/ui/dialog.tsx'), 'utf8');
    const appSrc = readFileSync(join(root, 'src/App.tsx'), 'utf8');
    expect(dialogSrc).toMatch(/aria-describedby["']?:\s*ariaDescribedBy\s*=\s*undefined/);
    expect(appSrc).toMatch(/v7_startTransition:\s*true/);
  });
});
