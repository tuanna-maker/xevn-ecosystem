import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { borderWidth, colors, radius } from '../tokens';

/**
 * MOB-XEVN-BRAND-PRIMITIVES-L2-01 — gate: core primitives consume L1 tokens.
 * Static source audit (no RN render) — U65 zero-seed.
 */

const ROOT = resolve(__dirname, '../..');

function readSrc(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

/** Drop block comments so CODE-MEMORY prose mentioning "borderWidth: 1" does not false-fail. */
function codeWithoutBlockComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('L2 brand primitives — token wiring', () => {
  it('locks radius / borderWidth / colors.border SoT', () => {
    expect(radius.modal).toBe(12);
    expect(radius.card).toBe(12);
    expect(radius.input).toBe(8);
    expect(borderWidth.thin).toBe(1);
    expect(borderWidth.focus).toBe(2);
    expect(borderWidth.hairline).toBe(0.5);
    expect(colors.border).toBe('#E5E7EB');
  });

  it('ConfirmActionModal uses radius.modal + borderWidth.thin + colors.border', () => {
    const src = readSrc('components/ui/ConfirmActionModal.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/radius\.modal/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/borderWidth:\s*1\b/);
    expect(code).not.toMatch(/borderRadius:\s*12\b/);
  });

  it('FabPrimaryActionSheet uses radius.modal + borderWidth.thin', () => {
    const src = readSrc('components/navigation/FabPrimaryActionSheet.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/radius\.modal/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/borderWidth:\s*1\b/);
  });

  it('ElevatedCard uses radius.card + borderWidth.hairline', () => {
    const src = readSrc('components/ui/ElevatedCard.tsx');
    expect(src).toMatch(/borderWidth\.hairline/);
    expect(src).toMatch(/radius\.card/);
    expect(src).toMatch(/colors\.border/);
  });

  it('SurfaceCard uses radius.card + borderWidth.thin', () => {
    const src = readSrc('components/ui/SurfaceCard.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/radius\.card/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/borderWidth:\s*1\b/);
  });

  it('FormField uses radius.input + borderWidth.thin|focus', () => {
    const src = readSrc('components/ui/FormField.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/borderWidth\.focus/);
    expect(src).toMatch(/radius\.input/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/borderWidth:\s*1\b/);
  });

  it('AvatarUploadField prefers ConfirmActionModal for remove confirm', () => {
    const src = readSrc('components/ui/AvatarUploadField.tsx');
    expect(src).toMatch(/ConfirmActionModal/);
    expect(src).toMatch(/confirmRemoveOpen/);
    expect(src).not.toMatch(/Alert\.alert\(\s*['"]Xóa ảnh['"]/);
  });

  it('LeaveRequestDetailScreen prefers ConfirmActionModal for cancel confirm', () => {
    const src = readSrc('features/attendance/LeaveRequestDetailScreen.tsx');
    expect(src).toMatch(/ConfirmActionModal/);
    expect(src).toMatch(/confirmCancelOpen/);
    expect(src).not.toMatch(/Alert\.alert\(\s*['"]Hủy đơn nghỉ['"]/);
  });
});
