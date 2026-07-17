import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PROCESSES_MUTATION_UNSUPPORTED_VI,
  PROCESSES_READ_ONLY,
} from '@/hooks/useProcesses';

describe('P1-HRM-PROCESSES-FE-01 — useProcesses read-only (no fake success)', () => {
  it('exports read-only flag and honest unsupported copy', () => {
    expect(PROCESSES_READ_ONLY).toBe(true);
    expect(PROCESSES_MUTATION_UNSUPPORTED_VI).toMatch(/chưa hỗ trợ/i);
    expect(PROCESSES_MUTATION_UNSUPPORTED_VI).toContain('XBOS-DM-HRM-14');
  });

  it('hook source has no toast/mutation stubs in executable code', () => {
    const src = readFileSync(join(process.cwd(), 'src/hooks/useProcesses.ts'), 'utf8');
    // Strip block comments so CODE-MEMORY prose does not false-positive
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/toast/);
    expect(code).not.toMatch(/useMutation/);
    expect(code).not.toMatch(/Đã thêm thành công|Đã cập nhật thành công|Đã xóa thành công/);
    expect(src).toContain('PROCESSES_READ_ONLY');
  });
});
