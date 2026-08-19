/**
 * contractPrintVersionUx — PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError } from './apiError';
import {
  assertPdfMagic,
  contractPrintPdfFilename,
  CORE_CTR_PDF_SNAPSHOT_ONLY_ASSERT,
  CORE_CTR_VER_PATH_ASSERT,
  extractIssueBlockedDetails,
  formatIssueBlockedMissingSummary,
  formatPrintVersionListLine,
  isIssueGateErrorCode,
  isIssuedPrintVersion,
  printVersionStatusLabel,
} from './contractPrintVersionUx';

describe('contractPrintVersionUx CORE-09C', () => {
  it('status labels issued / superseded', () => {
    expect(printVersionStatusLabel('issued')).toBe('Đã phát hành');
    expect(printVersionStatusLabel('superseded')).toBe('Đã thay thế');
    expect(isIssuedPrintVersion('issued')).toBe(true);
    expect(isIssuedPrintVersion('superseded')).toBe(false);
  });

  it('list line shows pack_code + version_no + status', () => {
    const line = formatPrintVersionListLine({
      id: 'v1',
      version_no: 2,
      pack_code: 'IT_OFFICE',
      status: 'issued',
      issued_at: '2026-08-09T04:00:00.000Z',
      template_code: 'HDLD-IT-01',
    });
    expect(line).toContain('v2');
    expect(line).toContain('IT_OFFICE');
    expect(line).toMatch(/Đã phát hành|phát hành/);
    expect(line).toContain('HDLD-IT-01');
  });

  it('extracts ISSUE-BLOCKED missing lists from details', () => {
    const err = new ApiClientError({
      code: 'HRM-CTR-ISSUE-BLOCKED',
      message: 'blocked',
      status: 400,
      details: {
        missing_fields: [{ field: 'work_location', message: 'required' }],
        missing_clauses: [{ code: 'JOB_DUTIES', title_vi: 'Công việc' }],
      },
    });
    const d = extractIssueBlockedDetails(err);
    expect(d.missing_fields[0]?.field).toBe('work_location');
    expect(d.missing_clauses.join(' ')).toMatch(/JOB_DUTIES|Công việc/);
    expect(formatIssueBlockedMissingSummary(d)).toMatch(/Thiếu field/);
    expect(isIssueGateErrorCode('HRM-CTR-ISSUE-BLOCKED')).toBe(true);
    expect(isIssueGateErrorCode('HRM-CTR-DRIVER-REQUIRED')).toBe(true);
    expect(isIssueGateErrorCode('HRM-CTR-TERM-INVALID')).toBe(true);
    expect(isIssueGateErrorCode('HRM-CTR-TPL-NONE')).toBe(true);
  });

  it('PDF magic %PDF assert + filename', () => {
    const ok = new TextEncoder().encode('%PDF-1.4');
    expect(assertPdfMagic(ok)).toBe(true);
    expect(assertPdfMagic(new TextEncoder().encode('<html>'))).toBe(false);
    expect(
      contractPrintPdfFilename({
        contract_id: 'c-1',
        version_id: 'ver-uuid',
        version_no: 3,
      }),
    ).toBe('contract-c-1-v3.pdf');
    expect(CORE_CTR_PDF_SNAPSHOT_ONLY_ASSERT.versionNotIssuedCode).toBe(
      'HRM-CTR-VERSION-NOT-ISSUED',
    );
  });

  it('physical path assert — contracts-insurance only · Nest /core denied', () => {
    expect(CORE_CTR_VER_PATH_ASSERT.createPrintVersionsPath).toContain(
      '/contracts-insurance/contracts/',
    );
    expect(CORE_CTR_VER_PATH_ASSERT.createPrintVersionsPath).toContain('print-versions');
    expect(CORE_CTR_VER_PATH_ASSERT.pdfPath).toContain(
      '/contracts-insurance/print-versions/',
    );
    expect(CORE_CTR_VER_PATH_ASSERT.pdfPath).toContain('/pdf');
    expect(CORE_CTR_VER_PATH_ASSERT.previewMustKeepPath).toContain('/preview');
    expect(CORE_CTR_VER_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
  });
});
