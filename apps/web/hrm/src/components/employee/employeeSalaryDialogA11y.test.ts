import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('D-HRM-EMP-SALARY-DIALOG-A11Y-01 — EmployeeSalary DialogTitle + Description', () => {
  const src = readFileSync(join(process.cwd(), 'src/components/employee/EmployeeSalary.tsx'), 'utf8');

  it('add + edit allowance dialogs include DialogTitle and DialogDescription', () => {
    expect(src).toMatch(/DialogDescription/);
    expect(src).toContain("t('salary.addNewAllowance'");
    expect(src).toContain("t('salary.editAllowance'");
    expect(src).toMatch(/salary\.addAllowanceA11yDesc|salary\.editAllowanceA11yDesc/);
    // Both DialogContent blocks must wire description (not title-only).
    const titleCount = (src.match(/<DialogTitle[\s>]/g) ?? []).length;
    const descCount = (src.match(/<DialogDescription[\s>]/g) ?? []).length;
    expect(titleCount).toBeGreaterThanOrEqual(2);
    expect(descCount).toBeGreaterThanOrEqual(2);
  });

  it('dialog primitive wires portal a11y mirror via callback ref (Presence-safe)', () => {
    const dialogSrc = readFileSync(join(process.cwd(), 'src/components/ui/dialog.tsx'), 'utf8');
    expect(dialogSrc).toContain('attachPortalDialogA11yMirror');
    // R2: must attach from content callback ref — parent useLayoutEffect alone misses Presence mount.
    expect(dialogSrc).toMatch(/assignContentRef|a11yMirrorCleanupRef/);
    expect(dialogSrc).toContain('useParentPortal');
  });
});
