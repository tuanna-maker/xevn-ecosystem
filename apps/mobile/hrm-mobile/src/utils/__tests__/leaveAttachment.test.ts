import { describe, expect, it } from 'vitest';
import {
  LEAVE_ATTACHMENT_MAX_BYTES,
  leaveAttachmentSubmitBlocked,
  leaveTypeRequiresAttachment,
  resolveLeaveAttachmentUrlForSubmit,
  validateLeaveAttachment,
} from '../leaveAttachment';

describe('leaveAttachment — PCOMP-W7-MOB-LEAVE-DOC', () => {
  it('requires attachment for sick and maternity', () => {
    expect(leaveTypeRequiresAttachment('sick')).toBe(true);
    expect(leaveTypeRequiresAttachment('maternity')).toBe(true);
    expect(leaveTypeRequiresAttachment('annual')).toBe(false);
  });

  it('validates MIME and size (HRM-MOB-DOC-400)', () => {
    expect(
      validateLeaveAttachment({
        uri: 'file:///a.jpg',
        fileName: 'a.jpg',
        mimeType: 'image/jpeg',
        byteSize: 1000,
      }),
    ).toBeNull();

    expect(
      validateLeaveAttachment({
        uri: 'file:///a.exe',
        fileName: 'a.exe',
        mimeType: 'application/octet-stream',
      }),
    ).toContain('JPEG');

    expect(
      validateLeaveAttachment({
        uri: 'file:///big.pdf',
        fileName: 'big.pdf',
        mimeType: 'application/pdf',
        byteSize: LEAVE_ATTACHMENT_MAX_BYTES + 1,
      }),
    ).toContain('10 MB');
  });

  it('blocks submit when sick without uploaded URL', () => {
    expect(
      leaveAttachmentSubmitBlocked('sick', [
        { uri: 'x', fileName: 'x.jpg', mimeType: 'image/jpeg' },
      ]),
    ).toContain('đính kèm');
    expect(
      leaveAttachmentSubmitBlocked('annual', []),
    ).toBeNull();
  });

  it('uses first uploaded URL for Phase 1 single column', () => {
    expect(
      resolveLeaveAttachmentUrlForSubmit([
        { uri: 'a', fileName: 'a.jpg', mimeType: 'image/jpeg', uploadedUrl: '/api/hrm/files/holding/doc.pdf' },
      ]),
    ).toBe('/api/hrm/files/holding/doc.pdf');
  });
});
