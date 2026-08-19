import { describe, expect, it } from 'vitest';
import {
  isSickLeaveType,
  leaveAttachmentRequired,
  leaveAttachmentSubmitBlocked,
  shouldShowLeaveAttachmentControl,
  toLeaveAttachmentUrlForApi,
  validateLeaveAttachmentFile,
} from './leaveAttachment';

describe('R-SPINE-LV04-ATTACH-FE-01 — leaveAttachment BR-LEAVE-ATT-01', () => {
  it('detects catalog LVT_02 and literal sick as ốm', () => {
    expect(isSickLeaveType('LVT_02')).toBe(true);
    expect(isSickLeaveType('sick')).toBe(true);
    expect(isSickLeaveType('medical')).toBe(true);
    expect(isSickLeaveType('LVT_01')).toBe(false);
    expect(isSickLeaveType('annual')).toBe(false);
    expect(isSickLeaveType('LVT_99', 'Nghỉ ốm dài')).toBe(true);
  });

  it('shows attach control for ốm; requires only when days ≥ 3', () => {
    expect(shouldShowLeaveAttachmentControl('LVT_02')).toBe(true);
    expect(shouldShowLeaveAttachmentControl('annual')).toBe(false);
    expect(leaveAttachmentRequired('LVT_02', 2)).toBe(false);
    expect(leaveAttachmentRequired('LVT_02', 3)).toBe(true);
    expect(leaveAttachmentRequired('LVT_02', 5)).toBe(true);
    expect(leaveAttachmentRequired('annual', 5)).toBe(false);
  });

  it('blocks submit for ốm ≥3d without relative attachment_url', () => {
    expect(leaveAttachmentSubmitBlocked('LVT_02', 5, null)).toMatch(/giấy bác sĩ/i);
    expect(
      leaveAttachmentSubmitBlocked(
        'sick',
        3,
        '/api/hrm/files/holding/leave_attachment-1-giay.pdf',
      ),
    ).toBeNull();
    expect(leaveAttachmentSubmitBlocked('LVT_02', 2, null)).toBeNull();
  });

  it('normalizes absolute upload URL to relative path for Nest VAL-ATT', () => {
    expect(
      toLeaveAttachmentUrlForApi(
        'http://127.0.0.1:28001/api/hrm/files/holding/leave_attachment-1.pdf',
      ),
    ).toBe('/api/hrm/files/holding/leave_attachment-1.pdf');
    expect(toLeaveAttachmentUrlForApi('/api/hrm/files/main/doc.pdf')).toBe(
      '/api/hrm/files/main/doc.pdf',
    );
    expect(toLeaveAttachmentUrlForApi('blob:http://localhost/x')).toBeUndefined();
  });

  it('validates MIME and 10MB cap', () => {
    const pdf = new File(['x'], 'giay.pdf', { type: 'application/pdf' });
    expect(validateLeaveAttachmentFile(pdf)).toBeNull();
    const bad = new File(['x'], 'x.exe', { type: 'application/x-msdownload' });
    expect(validateLeaveAttachmentFile(bad)).toMatch(/JPEG|PDF/i);
  });
});
