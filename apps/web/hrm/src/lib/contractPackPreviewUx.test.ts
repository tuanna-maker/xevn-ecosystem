/**
 * contractPackPreviewUx — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  clauseCodeFingerprint,
  formatPackSuggestReason,
  missingClauseLabels,
  packLabelVi,
  packsForPicker,
  previewMergedSummaryRows,
  shouldShowDriverPreviewBlock,
} from './contractPackPreviewUx';

describe('contractPackPreviewUx CORE-09B', () => {
  it('maps MVP pack VI labels', () => {
    expect(packLabelVi('GENERAL')).toBe('Chung');
    expect(packLabelVi('IT_OFFICE')).toBe('IT / văn phòng');
    expect(packLabelVi('DRIVER')).toBe('Lái xe');
  });

  it('orders MVP packs first; LOGISTICS optional', () => {
    expect(packsForPicker()).toEqual(['GENERAL', 'IT_OFFICE', 'DRIVER', 'LOGISTICS']);
    expect(packsForPicker(['DRIVER', 'GENERAL', 'IT_OFFICE'])).toEqual([
      'GENERAL',
      'IT_OFFICE',
      'DRIVER',
    ]);
  });

  it('formats pack suggest reason', () => {
    expect(formatPackSuggestReason('job_family:driver')).toMatch(/họ nghề/i);
    expect(formatPackSuggestReason('fallback_rule')).toMatch(/dự phòng|fallback/i);
    expect(formatPackSuggestReason('hard_default_GENERAL')).toMatch(/GENERAL|Chung/i);
  });

  it('shows DRIVER block for pack or flag', () => {
    expect(shouldShowDriverPreviewBlock({ packCode: 'DRIVER' })).toBe(true);
    expect(
      shouldShowDriverPreviewBlock({ packCode: 'IT_OFFICE', showDriverLicenseBlock: true }),
    ).toBe(true);
    expect(shouldShowDriverPreviewBlock({ packCode: 'IT_OFFICE' })).toBe(false);
  });

  it('builds merged summary + clause fingerprint (O6)', () => {
    expect(
      previewMergedSummaryRows({
        company_name: 'XeVN',
        employee_full_name: 'Nguyễn Văn A',
        job_title: 'Lái xe',
        salary: '***',
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Bên A (đơn vị)', value: 'XeVN' }),
        expect.objectContaining({ label: 'Bên B (người lao động)', value: 'Nguyễn Văn A' }),
      ]),
    );
    expect(
      clauseCodeFingerprint([
        { code: 'CL-B' },
        { code: 'CL-A' },
        { code: 'CL-B' },
      ]),
    ).toBe('CL-A|CL-B|CL-B');
    expect(missingClauseLabels([{ code: 'CL-X', title_vi: 'An toàn' }, 'CL-Y'])).toEqual([
      'An toàn (CL-X)',
      'CL-Y',
    ]);
  });
});
