import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('D-FE-CONSOLE-A11Y-DIALOG-RR-01 — dialog / RR console a11y', () => {
  const root = process.cwd();

  it('DialogContent defaults aria-describedby={undefined} and keeps portal a11y mirror', () => {
    const dialogSrc = readFileSync(join(root, 'src/components/ui/dialog.tsx'), 'utf8');
    expect(dialogSrc).toMatch(/aria-describedby["']?:\s*ariaDescribedBy\s*=\s*undefined/);
    expect(dialogSrc).toContain('aria-describedby={ariaDescribedBy}');
    expect(dialogSrc).toContain('attachPortalDialogA11yMirror');
    expect(dialogSrc).toMatch(/assignContentRef|a11yMirrorCleanupRef/);
  });

  it('AlertDialogContent wires portal a11y mirror (Presence-safe callback ref)', () => {
    const alertSrc = readFileSync(join(root, 'src/components/ui/alert-dialog.tsx'), 'utf8');
    expect(alertSrc).toContain('attachPortalDialogA11yMirror');
    expect(alertSrc).toMatch(/assignContentRef|a11yMirrorCleanupRef/);
    expect(alertSrc).toContain('useParentPortal');
  });

  it('CommandDialog includes sr-only DialogTitle', () => {
    const cmdSrc = readFileSync(join(root, 'src/components/ui/command.tsx'), 'utf8');
    expect(cmdSrc).toContain('DialogTitle');
    expect(cmdSrc).toMatch(/DialogTitle[^>]*className="sr-only"/);
  });

  it('HRM BrowserRouter opts into v7_startTransition + v7_relativeSplatPath', () => {
    const appSrc = readFileSync(join(root, 'src/App.tsx'), 'utf8');
    expect(appSrc).toMatch(/v7_startTransition:\s*true/);
    expect(appSrc).toMatch(/v7_relativeSplatPath:\s*true/);
  });

  it('soft-nav still flushSync (must_keep Attendance stall fix with v7 flag on)', () => {
    const softNav = readFileSync(join(root, 'src/lib/portalEmbedSoftNavigate.ts'), 'utf8');
    expect(softNav).toContain('flushSync');
    expect(softNav).toMatch(/flushSync:\s*true/);
  });
});
