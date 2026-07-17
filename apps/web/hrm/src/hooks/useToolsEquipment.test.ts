import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  TOOLS_MUTATION_UNSUPPORTED_VI,
  TOOLS_READ_ONLY,
} from '@/hooks/useToolsEquipment';

describe('D-HRM-TOOLS-STUB-TOAST-01 — useToolsEquipment read-only (no fake success)', () => {
  it('exports read-only flag and honest unsupported copy', () => {
    expect(TOOLS_READ_ONLY).toBe(true);
    expect(TOOLS_MUTATION_UNSUPPORTED_VI).toMatch(/chưa hỗ trợ/i);
    expect(TOOLS_MUTATION_UNSUPPORTED_VI).toMatch(/CCDC|phiếu cấp phát/i);
  });

  it('hook source has no toast/mutation stubs in executable code', () => {
    const src = readFileSync(join(process.cwd(), 'src/hooks/useToolsEquipment.ts'), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/toast/);
    expect(code).not.toMatch(/useMutation/);
    expect(code).not.toMatch(/Đã thêm CCDC thành công|Đã cập nhật CCDC|Đã xóa CCDC/);
    expect(src).toContain('TOOLS_READ_ONLY');
  });
});
