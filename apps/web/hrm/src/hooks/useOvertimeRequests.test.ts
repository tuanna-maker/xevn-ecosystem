import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(hooksDir, 'useOvertimeRequests.ts'), 'utf8');

describe.skip('PO-MFD-M2-OT-FE-LOADING-01 — useOvertimeRequests fetch storm guard', () => {
  it('does not recreate unstable i18n helper h in useCallback deps', () => {
    expect(source).not.toMatch(/const h\s*=\s*\(/);
    expect(source).not.toMatch(/\[\s*currentCompanyId\s*,\s*toast\s*,\s*t\s*,\s*h\s*\]/);
    expect(source).toMatch(/\[\s*currentCompanyId\s*,\s*toast\s*,\s*t\s*\]/);
  });

  it('uses stable t(hk.overtime.*) keys and keeps create/approve contracts', () => {
    expect(source).toContain("t('hk.overtime.fetchError')");
    expect(source).toContain("t('hk.overtime.createSuccess')");
    expect(source).toContain("t('hk.overtime.approveSuccess')");
    expect(source).toContain('listOvertimeRequests');
    expect(source).toContain('createOvertimeRequest');
    expect(source).toContain('approveOvertimeRequest');
    expect(source).toContain('rejectOvertimeRequest');
    expect(source).toContain('deleteOvertimeRequest');
  });

  it('ends loading when company scope missing (no stuck Đang tải)', () => {
    expect(source).toContain('if (!currentCompanyId)');
    expect(source).toContain('setIsLoading(false)');
  });
});
