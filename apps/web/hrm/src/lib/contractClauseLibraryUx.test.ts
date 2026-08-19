/**
 * Helpers — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError } from './apiError';
import {
  CORE_CL_PHYSICAL_PATH_FRAGMENT,
  CORE_CL_SNAPSHOT_FREEZE_ASSERT,
  clauseGroupLabelVi,
  clausePackLabelsVi,
  clauseStatusLabelVi,
  isCoreClPhysicalPath,
  isCtrClCodeConflict,
  isForbiddenCoreClSotPath,
  validateClausePlaceholderSyntax,
} from './contractClauseLibraryUx';

describe('contractClauseLibraryUx CORE-09A', () => {
  it('maps status / group / pack VI labels', () => {
    expect(clauseStatusLabelVi('draft')).toBe('Nháp');
    expect(clauseStatusLabelVi('active')).toBe('Hiệu lực');
    expect(clauseStatusLabelVi('retired')).toBe('Ngừng dùng');
    expect(clauseGroupLabelVi('LEGAL_BASIS')).toMatch(/Căn cứ/i);
    expect(clausePackLabelsVi(['GENERAL', 'DRIVER'])).toMatch(/Chung/);
    expect(clausePackLabelsVi(['*'])).toMatch(/\*/);
  });

  it('normalizes clause group for filter', () => {
    expect(clauseGroupLabelVi('legal_basis')).toMatch(/Căn cứ/i);
  });

  it('validates {{field}} only — dual syntax FAIL', () => {
    expect(validateClausePlaceholderSyntax('Họ tên {{ho_ten}}')).toBeNull();
    expect(validateClausePlaceholderSyntax('plain text no token')).toBeNull();
    expect(validateClausePlaceholderSyntax('bad ${ho_ten}')).toMatch(/\{\{/);
    expect(validateClausePlaceholderSyntax('{{a}} and ${b}')).toMatch(/một cú pháp|không kết hợp/i);
    expect(validateClausePlaceholderSyntax('{{a}} and #b#')).toMatch(/một cú pháp|không kết hợp/i);
  });

  it('detects HRM-CTR-CL-CODE-CONFLICT', () => {
    expect(
      isCtrClCodeConflict(
        new ApiClientError({ code: 'HRM-CTR-CL-CODE-CONFLICT', message: 'x', status: 409 }),
      ),
    ).toBe(true);
    expect(
      isCtrClCodeConflict(new ApiClientError({ code: 'HRM-CTR-CL-REQUIRED', message: 'x', status: 400 })),
    ).toBe(false);
  });

  it('locks physical path · DENY Nest /core clause SoT', () => {
    expect(isCoreClPhysicalPath(`/api/hrm${CORE_CL_PHYSICAL_PATH_FRAGMENT}`)).toBe(true);
    expect(isForbiddenCoreClSotPath('/api/hrm/core/clauses')).toBe(true);
    expect(isForbiddenCoreClSotPath('/api/hrm/contracts-insurance/contract-clauses')).toBe(false);
  });

  it('documents snapshot freeze assert path', () => {
    expect(CORE_CL_SNAPSHOT_FREEZE_ASSERT.immutableField).toBe('clauses_snapshot_json');
    expect(CORE_CL_SNAPSHOT_FREEZE_ASSERT.libraryMutatePath).toContain('contract-clauses');
    expect(CORE_CL_SNAPSHOT_FREEZE_ASSERT.issuedPrintVersionsPath).toContain('print-versions');
  });
});
