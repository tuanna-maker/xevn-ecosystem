import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Encoding gate for D-REC-13-S2-LABELMAPS-UTF8-01:
 * UTF-16 LE (BOM FF FE + NUL pairs) makes Vite throw Unexpected character
 * and whitescreens /hr/recruitment (JobRequisitionsTab).
 */
describe('labelMaps.ts encoding (UTF-8)', () => {
  it('is UTF-8 without UTF-16 LE BOM or inter-ASCII NUL pairs', () => {
    const filePath = join(dirname(fileURLToPath(import.meta.url)), 'labelMaps.ts');
    const bytes = readFileSync(filePath);

    expect(bytes[0]).not.toBe(0xff);
    expect(bytes[1]).not.toBe(0xfe);
    // ASCII start of block comment
    expect(bytes[0]).toBe(0x2f); // /
    expect(bytes[1]).toBe(0x2a); // *

    const nulRatio = bytes.filter((b) => b === 0).length / bytes.length;
    expect(nulRatio).toBeLessThan(0.01);

    const text = bytes.toString('utf8');
    expect(text).toContain('@CODE-MEMORY');
    expect(text).toContain('export function resolveGenderDisplay');
    expect(text.includes('\uFFFD')).toBe(false);
  });
});
