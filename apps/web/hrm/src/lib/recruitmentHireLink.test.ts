import { describe, expect, it } from 'vitest';
import {
  HRM_REC_HIRE_400,
  HRM_REC_HIRE_400_VI,
  HRM_REC_HIRE_409,
  isHiredStage,
  needsHireEmployeePicker,
  resolveHireEmployeeIdForRequest,
  resolveHireTargetStage,
} from '@/lib/recruitmentHireLink';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';

describe('recruitmentHireLink', () => {
  it('isHiredStage accepts hired case-insensitively when catalog empty', () => {
    expect(isHiredStage('hired')).toBe(true);
    expect(isHiredStage('Hired')).toBe(true);
    expect(isHiredStage('offer')).toBe(false);
    expect(isHiredStage(null)).toBe(false);
  });

  it('isHiredStage uses hiredOutcomeKey when provided (AC-PLT-REC-05)', () => {
    expect(isHiredStage('hired_qa_custom', 'hired_qa_custom')).toBe(true);
    expect(isHiredStage('hired', 'hired_qa_custom')).toBe(false);
    expect(isHiredStage('hired_qa_custom', null)).toBe(false);
  });

  it('needsHireEmployeePicker only when hired-outcome without employee_id', () => {
    expect(needsHireEmployeePicker('hired', null)).toBe(true);
    expect(needsHireEmployeePicker('hired', '  ')).toBe(true);
    expect(needsHireEmployeePicker('hired', 'emp-1')).toBe(false);
    expect(needsHireEmployeePicker('offer', null)).toBe(false);
    expect(needsHireEmployeePicker('hired_qa_custom', null, 'hired_qa_custom')).toBe(true);
    expect(needsHireEmployeePicker('hired', null, 'hired_qa_custom')).toBe(false);
  });

  it('resolveHireTargetStage prefers pending then catalog outcome', () => {
    expect(resolveHireTargetStage('hired_qa_custom', 'hired')).toBe('hired_qa_custom');
    expect(resolveHireTargetStage(null, 'hired_qa_custom')).toBe('hired_qa_custom');
    expect(resolveHireTargetStage(null, null)).toBe('hired');
  });

  it('resolveHireEmployeeIdForRequest prefers explicit selection', () => {
    expect(resolveHireEmployeeIdForRequest('existing', 'picked')).toBe('picked');
    expect(resolveHireEmployeeIdForRequest('existing', null)).toBe('existing');
    expect(resolveHireEmployeeIdForRequest(null, null)).toBeUndefined();
  });

  it('toErrorMessage maps HRM-REC-HIRE-400/409 to VI', () => {
    expect(
      toErrorMessage(new ApiClientError({ code: HRM_REC_HIRE_400, message: 'en' }), 'fallback'),
    ).toBe(HRM_REC_HIRE_400_VI);
    expect(
      toErrorMessage(new ApiClientError({ code: HRM_REC_HIRE_409, message: 'en' }), 'fallback'),
    ).toContain('đơn vị');
  });

  it('toErrorMessage maps HRM-REC-STAGE-UNKNOWN (AC-PLT-REC-04)', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-REC-STAGE-UNKNOWN', message: 'en' }),
        'fallback',
      ),
    ).toContain('catalog hiệu lực');
  });
});
