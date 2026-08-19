import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(hooksDir, 'useShiftChangeRequests.ts'), 'utf8');

describe('PO-MFD-M2-ATT-REQUESTS-FE-LOADING-01 — useShiftChangeRequests fetch storm guard', () => {
  it('does not recreate unstable i18n helper h in useCallback deps', () => {
    expect(source).not.toMatch(/const h\s*=\s*\(/);
    expect(source).not.toMatch(/\[\s*currentCompanyId\s*,\s*toast\s*,\s*t\s*,\s*h\s*\]/);
    expect(source).toMatch(/\[\s*currentCompanyId\s*,\s*toast\s*,\s*t\s*\]/);
  });

  it('uses stable t(hk.shiftChange.*) keys and keeps create/approve contracts', () => {
    expect(source).toContain("t('hk.shiftChange.fetchError')");
    expect(source).toContain("t('hk.shiftChange.createSuccess')");
    expect(source).toContain("t('hk.shiftChange.approveSuccess')");
    expect(source).toContain('listShiftChangeRequests');
    expect(source).toContain('createShiftChangeRequest');
    expect(source).toContain('approveShiftChangeRequest');
    expect(source).toContain('rejectShiftChangeRequest');
    expect(source).toContain('deleteShiftChangeRequest');
    expect(source).toContain('updateRequest');
  });

  it('ends loading when company scope missing (no stuck Đang tải)', () => {
    expect(source).toContain('if (!currentCompanyId)');
    expect(source).toContain('setIsLoading(false)');
  });
});
