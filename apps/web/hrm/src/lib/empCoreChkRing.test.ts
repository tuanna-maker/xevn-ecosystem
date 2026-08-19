/**
 * empCoreChkRing — PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_CHK_PAPER_CORE_PATH,
  canApproveChkItem,
  canReopenChkItem,
  canSubmitChkItem,
  chkStatusLabelFallback,
  isCoreChkPhysicalPath,
  isForbiddenCoreChkSotPath,
  validateChkCreateGate,
} from './empCoreChkRing';

describe('empCoreChkRing CORE-03', () => {
  it('accepts physical document-checklist path under employees', () => {
    expect(
      isCoreChkPhysicalPath('/api/hrm/employees/emp-1/document-checklist?company_id=main'),
    ).toBe(true);
    expect(isCoreChkPhysicalPath('/api/hrm/employees/document-types')).toBe(false);
  });

  it('forbids Nest /core checklist and DOC/ET dual SoT', () => {
    expect(isForbiddenCoreChkSotPath(CORE_CHK_PAPER_CORE_PATH)).toBe(true);
    expect(isForbiddenCoreChkSotPath('/api/hrm/core/employees/document-types')).toBe(true);
    expect(isForbiddenCoreChkSotPath('/api/hrm/core/employment-types')).toBe(true);
    expect(
      isForbiddenCoreChkSotPath('/api/hrm/employees/emp-1/document-checklist'),
    ).toBe(false);
  });

  it('gates submit / approve / reopen by status lifecycle', () => {
    expect(canSubmitChkItem('missing')).toBe(true);
    expect(canSubmitChkItem('submitted')).toBe(false);
    expect(canApproveChkItem('submitted')).toBe(true);
    expect(canApproveChkItem('missing')).toBe(false);
    expect(canReopenChkItem('approved')).toBe(true);
    expect(canReopenChkItem('missing')).toBe(false);
  });

  it('labels status fallback VI', () => {
    expect(chkStatusLabelFallback('submitted')).toBe('Đã nộp');
    expect(chkStatusLabelFallback('approved')).toBe('Đã xác nhận');
    expect(chkStatusLabelFallback('missing')).toMatch(/Thiếu/);
  });

  it('create gate requires documentTypeKey — no starter invent', () => {
    expect(validateChkCreateGate({ documentTypeKey: '' })).toMatch(/Thiếu mã/);
    expect(validateChkCreateGate({ documentTypeKey: 'hr_doc_custom_09' })).toBeNull();
  });
});
