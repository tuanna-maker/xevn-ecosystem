import { describe, expect, it } from 'vitest';
import {
  LEAVE_ATTACHMENT_MAX_BYTES,
  isValidLeaveAttachmentUploadedUrl,
  leaveAttachmentSubmitBlocked,
  leaveCreateStep1NextBlocked,
  leaveTypeRequiresAttachment,
  resolveLeaveAttachmentUrlForSubmit,
  resolveLeaveAttachmentUrls,
  validateLeaveAttachment,
} from '../leaveAttachment';

describe('leaveAttachment — PCOMP-W7-MOB-LEAVE-DOC', () => {
  it('BR-LEAVE-DOC-01: requires attachment for SRS+DATA medical types', () => {
    expect(leaveTypeRequiresAttachment('sick')).toBe(true);
    expect(leaveTypeRequiresAttachment('maternity')).toBe(true);
    expect(leaveTypeRequiresAttachment('medical')).toBe(true);
    expect(leaveTypeRequiresAttachment('maternity_medical')).toBe(true);
    expect(leaveTypeRequiresAttachment('LVT_02')).toBe(true);
    expect(leaveTypeRequiresAttachment('annual')).toBe(false);
    expect(leaveTypeRequiresAttachment('unpaid')).toBe(false);
    expect(leaveTypeRequiresAttachment('paternity')).toBe(false);
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
        uri: 'file:///a.pdf',
        fileName: 'a.pdf',
        mimeType: 'application/pdf',
        byteSize: 2048,
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

  it('AC-LEAVE-DOC-02: annual not blocked without attachment', () => {
    expect(leaveAttachmentSubmitBlocked('annual', [])).toBeNull();
  });

  it('AC-LEAVE-DOC-01 / D2: blocks submit when sick without uploaded URL', () => {
    expect(
      leaveAttachmentSubmitBlocked('sick', [
        { uri: 'x', fileName: 'x.jpg', mimeType: 'image/jpeg' },
      ]),
    ).toContain('đính kèm');
    expect(
      leaveAttachmentSubmitBlocked('sick', [
        {
          uri: 'x',
          fileName: 'x.jpg',
          mimeType: 'image/jpeg',
          uploadedUrl: '/api/hrm/files/holding/doc.pdf',
        },
      ]),
    ).toBeNull();
  });

  it('PCOMP-W7-MOB-LEAVE-DOC-02: step-next blocked without valid uploadedUrl; happy path with mock URL', () => {
    expect(leaveCreateStep1NextBlocked('sick', [])).toContain('đính kèm');
    expect(
      leaveCreateStep1NextBlocked('sick', [
        { uri: 'file:///x.pdf', fileName: 'x.pdf', mimeType: 'application/pdf' },
      ]),
    ).toContain('đính kèm');
    expect(
      leaveCreateStep1NextBlocked('sick', [
        {
          uri: 'file:///x.pdf',
          fileName: 'x.pdf',
          mimeType: 'application/pdf',
          uploadedUrl: 'file:///x.pdf',
        },
      ]),
    ).toContain('đính kèm');
    expect(isValidLeaveAttachmentUploadedUrl('/api/hrm/files/holding/doc.pdf')).toBe(true);
    expect(
      isValidLeaveAttachmentUploadedUrl(
        'https://127.0.0.1:28001/api/hrm/files/holding/doc.pdf',
      ),
    ).toBe(true);
    expect(
      leaveCreateStep1NextBlocked('sick', [
        {
          uri: 'file:///x.pdf',
          fileName: 'x.pdf',
          mimeType: 'application/pdf',
          uploadedUrl: '/api/hrm/files/holding/leave_attachment-mock.pdf',
        },
      ]),
    ).toBeNull();
  });

  it('rejects oversized file before upload (≤10 MB SRS)', () => {
    expect(
      validateLeaveAttachment({
        uri: 'file:///big.pdf',
        fileName: 'big.pdf',
        mimeType: 'application/pdf',
        byteSize: LEAVE_ATTACHMENT_MAX_BYTES,
      }),
    ).toBeNull();
    expect(
      validateLeaveAttachment({
        uri: 'file:///big.pdf',
        fileName: 'big.pdf',
        mimeType: 'application/pdf',
        byteSize: LEAVE_ATTACHMENT_MAX_BYTES + 1,
      }),
    ).toContain('10 MB');
  });

  it('Phase-1 single column: resolve first uploaded URL for attachment_url', () => {
    expect(
      resolveLeaveAttachmentUrlForSubmit([
        {
          uri: 'a',
          fileName: 'a.jpg',
          mimeType: 'image/jpeg',
          uploadedUrl: '/api/hrm/files/holding/doc.pdf',
        },
        {
          uri: 'b',
          fileName: 'b.jpg',
          mimeType: 'image/jpeg',
          uploadedUrl: '/api/hrm/files/holding/doc2.pdf',
        },
      ]),
    ).toBe('/api/hrm/files/holding/doc.pdf');

    expect(
      resolveLeaveAttachmentUrls([
        {
          uri: 'a',
          fileName: 'a.jpg',
          mimeType: 'image/jpeg',
          uploadedUrl: '/api/hrm/files/holding/doc.pdf',
        },
        { uri: 'b', fileName: 'b.jpg', mimeType: 'image/jpeg' },
      ]),
    ).toEqual(['/api/hrm/files/holding/doc.pdf']);
  });
});
