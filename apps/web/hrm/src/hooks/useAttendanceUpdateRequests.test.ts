import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Source-contract gate — approve/reject must pass currentCompanyId into hrmApi
 * so requestHrm sets x-company-id (U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01).
 */
describe('useAttendanceUpdateRequests company scope wire', () => {
  const source = readFileSync(resolve(__dirname, './useAttendanceUpdateRequests.ts'), 'utf8');

  it('passes currentCompanyId into approveAttendanceUpdateRequest', () => {
    expect(source).toContain('approveAttendanceUpdateRequest(id, undefined, currentCompanyId)');
  });

  it('passes currentCompanyId into rejectAttendanceUpdateRequest', () => {
    expect(source).toMatch(/rejectAttendanceUpdateRequest\(\s*id,\s*\{\s*rejected_reason:\s*reason\s*\},\s*currentCompanyId/);
  });

  it('passes currentCompanyId into deleteAttendanceUpdateRequest', () => {
    expect(source).toContain('deleteAttendanceUpdateRequest(id, currentCompanyId)');
  });

  it('guards mutate when currentCompanyId missing', () => {
    expect(source).toContain('if (!currentCompanyId) return false;');
  });
});
