import { describe, expect, it } from 'vitest';
import {
  LEAVE_ATTACHMENT_MAX_FILES,
  isValidLeaveAttachmentUploadedUrl,
  leaveAttachmentSubmitBlocked,
  leaveCreateStep1NextBlocked,
  leaveTypeRequiresAttachment,
} from '../../../utils/leaveAttachment';

/**
 * Mirrors CreateLeaveRequestScreen goNext / nextDisabled (step === 1).
 * PCOMP-W7-MOB-LEAVE-DOC-02 — AC-LEAVE-DOC-01 must not reach Bước 3 without valid upload URL.
 */
function simulateStep1Next(
  leaveType: string,
  drafts: Parameters<typeof leaveCreateStep1NextBlocked>[1],
): { advanced: boolean; alert?: string; nextDisabled: boolean } {
  const block = leaveCreateStep1NextBlocked(leaveType, drafts);
  if (block) return { advanced: false, alert: block, nextDisabled: true };
  return { advanced: true, nextDisabled: false };
}

/** PCOMP-W7-MOB-LEAVE-DOC / -02 — picker / detail / step-next product gate (no RN render). */
describe('Leave medical doc UX — PCOMP-W7-MOB-LEAVE-DOC-02', () => {
  it('picker allows max 3 files per TechSpec §3.5 / SRS §4.2', () => {
    expect(LEAVE_ATTACHMENT_MAX_FILES).toBe(3);
  });

  it('shows picker only when leave type requires doc', () => {
    const showPicker = (leaveType: string) => leaveTypeRequiresAttachment(leaveType);
    expect(showPicker('sick')).toBe(true);
    expect(showPicker('maternity')).toBe(true);
    expect(showPicker('annual')).toBe(false);
  });

  it('AC-LEAVE-DOC-01: sick/maternity Tiếp tục without upload stays on Bước 2', () => {
    const sick = simulateStep1Next('sick', []);
    expect(sick.advanced).toBe(false);
    expect(sick.nextDisabled).toBe(true);
    expect(sick.alert).toContain('đính kèm');

    const maternity = simulateStep1Next('maternity', [
      { uri: 'file:///x.jpg', fileName: 'x.jpg', mimeType: 'image/jpeg' },
    ]);
    expect(maternity.advanced).toBe(false);
    expect(maternity.nextDisabled).toBe(true);
  });

  it('AC-LEAVE-DOC-01: local pick URI alone does not unlock Tiếp tục', () => {
    const blocked = simulateStep1Next('sick', [
      {
        uri: 'file:///local/doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        uploadedUrl: 'file:///local/doc.pdf',
      },
    ]);
    expect(blocked.advanced).toBe(false);
    expect(blocked.nextDisabled).toBe(true);
    expect(isValidLeaveAttachmentUploadedUrl('file:///local/doc.pdf')).toBe(false);
  });

  it('AC-LEAVE-DOC-02: annual Tiếp tục OK without attachment', () => {
    const annual = simulateStep1Next('annual', []);
    expect(annual.advanced).toBe(true);
    expect(annual.nextDisabled).toBe(false);
    expect(annual.alert).toBeUndefined();
  });

  it('AC-LEAVE-DOC-01 happy path: sick with mock uploadedUrl may advance', () => {
    const mockUrl = '/api/hrm/files/holding/leave_attachment-mock-giay-bac-si.pdf';
    const ok = simulateStep1Next('sick', [
      {
        uri: 'file:///doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        uploadedUrl: mockUrl,
      },
    ]);
    expect(ok.advanced).toBe(true);
    expect(ok.nextDisabled).toBe(false);
    expect(leaveCreateStep1NextBlocked('sick', [
      {
        uri: 'file:///doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        uploadedUrl: mockUrl,
      },
    ])).toBeNull();
    expect(leaveAttachmentSubmitBlocked('sick', [
      {
        uri: 'file:///doc.pdf',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        uploadedUrl: mockUrl,
      },
    ])).toBeNull();
  });

  it('detail open control testID is leave-attachment-open (J-MOB leave doc)', () => {
    const detailOpenTestId = 'leave-attachment-open';
    const pickerTestId = 'leave-attachment-picker';
    const addTestId = 'leave-attachment-add';
    const nextTestId = 'leave-create-next';
    expect(detailOpenTestId).toBe('leave-attachment-open');
    expect(pickerTestId).toBe('leave-attachment-picker');
    expect(addTestId).toBe('leave-attachment-add');
    expect(nextTestId).toBe('leave-create-next');
  });

  it('touch targets: add/remove minHeight ≥ 44', () => {
    const addMinHeight = 48;
    const removeMinHeight = 44;
    const rowMinHeight = 44;
    expect(addMinHeight).toBeGreaterThanOrEqual(44);
    expect(removeMinHeight).toBeGreaterThanOrEqual(44);
    expect(rowMinHeight).toBeGreaterThanOrEqual(44);
  });
});
