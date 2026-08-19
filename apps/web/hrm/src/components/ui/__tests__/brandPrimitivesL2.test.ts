/**
 * Static lock: L2 brand primitives use token border / radius / focus (not generic ring/border-input).
 * work_item: FE-XEVN-BRAND-PRIMITIVES-L2-01
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const ui = (name: string) => readFileSync(join(root, `src/components/ui/${name}`), 'utf8');

describe('FE-XEVN-BRAND-PRIMITIVES-L2-01 — token border/radius/focus', () => {
  it('button: accent focus ring + outline border-xevn-border + rounded-input', () => {
    const src = ui('button.tsx');
    expect(src).toContain('focus-visible:ring-xevn-accent');
    expect(src).toContain('border-xevn-border');
    expect(src).toContain('rounded-input');
    expect(src).not.toMatch(/focus-visible:ring-ring(?!-)/);
  });

  it('input + textarea: rounded-input + border-xevn-border + ring-xevn-accent', () => {
    for (const file of ['input.tsx', 'textarea.tsx']) {
      const src = ui(file);
      expect(src).toContain('rounded-input');
      expect(src).toContain('border-xevn-border');
      expect(src).toContain('ring-xevn-accent');
    }
  });

  it('select: trigger tokens + content rounded-card border', () => {
    const src = ui('select.tsx');
    expect(src).toContain('border-xevn-border');
    expect(src).toContain('ring-xevn-accent');
    expect(src).toContain('rounded-card');
  });

  it('card: border-xevn-border + rounded-card + shadow-soft', () => {
    const src = ui('card.tsx');
    expect(src).toContain('border-xevn-border');
    expect(src).toContain('rounded-card');
    expect(src).toContain('shadow-soft');
  });

  it('table: TableHead text-xevn-textSecondary + border-xevn-border', () => {
    const src = ui('table.tsx');
    expect(src).toContain('text-xevn-textSecondary');
    expect(src).toContain('border-xevn-border');
  });

  it('sheet + drawer: overlay shadow + border token', () => {
    expect(ui('sheet.tsx')).toContain('shadow-overlay');
    expect(ui('sheet.tsx')).toContain('border-xevn-border');
    expect(ui('sheet.tsx')).toContain('ring-xevn-accent');
    expect(ui('drawer.tsx')).toContain('rounded-t-card');
    expect(ui('drawer.tsx')).toContain('border-xevn-border');
    expect(ui('drawer.tsx')).toContain('shadow-overlay');
  });

  it('popover + dropdown + hover-card: rounded-card + border-xevn-border', () => {
    for (const file of ['popover.tsx', 'dropdown-menu.tsx', 'hover-card.tsx']) {
      const src = ui(file);
      expect(src).toContain('rounded-card');
      expect(src).toContain('border-xevn-border');
    }
  });

  it('toast + sonner: border-xevn-border + soft shadow', () => {
    expect(ui('toast.tsx')).toContain('border-xevn-border');
    expect(ui('toast.tsx')).toContain('rounded-card');
    expect(ui('toast.tsx')).toContain('ring-xevn-accent');
    expect(ui('sonner.tsx')).toContain('border-xevn-border');
    expect(ui('sonner.tsx')).toContain('shadow-soft');
  });

  it('alert-dialog: Action/Cancel use buttonVariants; Description textSecondary', () => {
    const src = ui('alert-dialog.tsx');
    expect(src).toContain('buttonVariants({ variant: "default" })');
    expect(src).toContain('buttonVariants({ variant: "outline" })');
    expect(src).toContain('text-xevn-textSecondary');
    expect(src).toContain('border-xevn-border');
    expect(src).toContain('rounded-card');
  });

  it('dialog Description uses text-xevn-textSecondary', () => {
    expect(ui('dialog.tsx')).toContain('text-xevn-textSecondary');
  });

  it('HRM dark primary/ring aligned to brand HSL (#1E40AF / accent)', () => {
    const css = readFileSync(join(root, 'src/index.css'), 'utf8');
    expect(css).toMatch(/\.dark\s*\{[\s\S]*?--primary:\s*226 71% 40%/);
    expect(css).toMatch(/\.dark\s*\{[\s\S]*?--ring:\s*189 94% 43%/);
    expect(css).not.toMatch(/--primary:\s*221 83% 60%/);
  });

  it('HRM TW spacing xs…3xl extend present', () => {
    const tw = readFileSync(join(root, 'tailwind.config.ts'), 'utf8');
    expect(tw).toMatch(/spacing:\s*\{[\s\S]*?xs:\s*"0\.25rem"/);
    expect(tw).toMatch(/"3xl":\s*"4rem"/);
  });
});
