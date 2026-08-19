/**
 * @CODE-MEMORY
 * WorkItem:   PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01
 * Purpose:    Vitest Quét kho helpers + physical path locks + toast taxonomy.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  canSetYctdPostedFromScan,
  cvScanAuditBadgeLabel,
  formatCvScanAtVi,
  resolveCvScanAuditState,
  resolveDefaultScanPosition,
  validateCvScanCriteria,
  YCTD_CV_SCAN_CRITERIA_REQUIRED_VI,
  YCTD_CV_SCAN_POSTED_BLOCKED_VI,
} from '@/lib/jobRequisitionCvScan';
import { emptyPipelineFlags, resolvePipelineFlags } from '@/lib/jobRequisitionYctdWave2';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';

describe('jobRequisitionCvScan (PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01)', () => {
  it('O4 criteria requires title + skill|experience (exact-title-only FAIL)', () => {
    expect(validateCvScanCriteria({ position_code: 'DRV' }).ok).toBe(false);
    expect(
      validateCvScanCriteria({ position_code: 'DRV', skill: 'logistics' }).ok,
    ).toBe(true);
    expect(
      validateCvScanCriteria({ position: 'Tài xế', experience: '2 năm' }).ok,
    ).toBe(true);
    expect(
      validateCvScanCriteria({ position_code: 'DRV', experience_min_years: 1 }).ok,
    ).toBe(true);
    const fail = validateCvScanCriteria({ skill: 'only' });
    expect(fail.ok).toBe(false);
    if (!fail.ok) expect(fail.message).toBe(YCTD_CV_SCAN_CRITERIA_REQUIRED_VI);
  });

  it('scan audit state + posted gate from display-ready flags', () => {
    expect(resolveCvScanAuditState(undefined)).toBe('pending');
    expect(resolveCvScanAuditState({ internal_scan_done: true })).toBe('done');
    expect(
      resolveCvScanAuditState({
        internal_scan_skipped: true,
        internal_scan_skip_reason: 'kho trống',
      }),
    ).toBe('skipped');
    expect(canSetYctdPostedFromScan({ internal_scan_done: true })).toBe(true);
    expect(
      canSetYctdPostedFromScan({
        internal_scan_skipped: true,
        internal_scan_skip_reason: 'ok',
      }),
    ).toBe(true);
    expect(
      canSetYctdPostedFromScan({
        internal_scan_skipped: true,
        internal_scan_skip_reason: '  ',
      }),
    ).toBe(false);
    expect(canSetYctdPostedFromScan(emptyPipelineFlags())).toBe(false);
    expect(cvScanAuditBadgeLabel('pending')).toContain('Chưa');
    expect(YCTD_CV_SCAN_POSTED_BLOCKED_VI.length).toBeGreaterThan(10);
  });

  it('resolvePipelineFlags merges internal_scan_* without wiping RETAIN keys', () => {
    const flags = resolvePipelineFlags({
      pipeline_flags: {
        posted: true,
        has_cv: true,
        interview_started: false,
        cv_intake_allowed: true,
        internal_scan_done: true,
        internal_scan_at: '2026-08-09T01:00:00.000Z',
      },
    });
    expect(flags.posted).toBe(true);
    expect(flags.has_cv).toBe(true);
    expect(flags.internal_scan_done).toBe(true);
    expect(flags.internal_scan_skipped).toBe(false);
    expect(flags.internal_scan_at).toBeTruthy();
  });

  it('default position prefers position_key then name then title', () => {
    expect(
      resolveDefaultScanPosition({
        position_key: 'DRV',
        position_name: 'Tài xế',
        title: 'YCTD X',
      }).position_code,
    ).toBe('DRV');
    expect(
      resolveDefaultScanPosition({
        position_key: null,
        position_name: 'Kho',
        title: 'YCTD',
      }).position_code,
    ).toBe('Kho');
  });

  it('formatCvScanAtVi returns safe empty for invalid', () => {
    expect(formatCvScanAtVi(null)).toBe('—');
    expect(formatCvScanAtVi('not-a-date')).toBe('—');
  });

  it('HRM-REC-CV-SCAN-* toast taxonomy distinct', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-REC-CV-SCAN-REQUIRED', message: 'x', status: 400 }),
        'fallback',
      ),
    ).toMatch(/quét kho|Đã đăng tin/i);
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-REC-CV-SCAN-SKIP-REASON', message: 'x', status: 400 }),
        'fallback',
      ),
    ).toMatch(/lý do/i);
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-REC-CV-SCAN-FORBIDDEN', message: 'x', status: 403 }),
        'fallback',
      ),
    ).toMatch(/quyền/i);
    expect(
      toErrorMessage(
        new ApiClientError({ code: 'HRM-REC-CV-SCAN-YCTD', message: 'x', status: 400 }),
        'fallback',
      ),
    ).toMatch(/open_for_hire|nhận hồ sơ/i);
  });

  it('hrmApi physical paths — pool scan + internal-scan · DENY Nest /rec SoT', () => {
    const apiSrc = readFileSync(
      join(process.cwd(), 'src/integrations/hrmApi.ts'),
      'utf8',
    );
    expect(apiSrc).toMatch(/\/api\/hrm\/recruitment\/candidates-pool/);
    expect(apiSrc).toMatch(/\/internal-scan/);
    expect(apiSrc).toMatch(/internal_scan/);
    expect(apiSrc).toMatch(/postJobRequisitionInternalScan/);
    // Client must not invent Nest /rec controller SoT for scan mutate
    expect(apiSrc).not.toMatch(/\/api\/hrm\/rec\/.*internal-scan/);
  });

  it('JobRequisitionsTab + dialog source locks — Quét kho · posted gate · no Campaign invent', () => {
    const tabSrc = readFileSync(
      join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
      'utf8',
    );
    const dialogSrc = readFileSync(
      join(process.cwd(), 'src/components/recruitment/InternalCvScanDialog.tsx'),
      'utf8',
    );
    expect(tabSrc).toMatch(/InternalCvScanDialog/);
    expect(tabSrc).toMatch(/yctd-cv-scan-open/);
    expect(tabSrc).toMatch(/canSetYctdPostedFromScan/);
    expect(tabSrc).toMatch(/yctd-posted-scan-gate-hint/);
    expect(tabSrc).toMatch(/không Campaign/i);
    expect(dialogSrc).toMatch(/listCandidatesPool/);
    expect(dialogSrc).toMatch(/postJobRequisitionInternalScan/);
    expect(dialogSrc).toMatch(/action:\s*'complete'/);
    expect(dialogSrc).toMatch(/action:\s*'skip'/);
    expect(dialogSrc).toMatch(/createCandidatePool/);
    expect(dialogSrc).toMatch(/for:\s*'internal_scan'/);
    expect(dialogSrc).not.toMatch(/\/api\/hrm\/rec\//);
    expect(dialogSrc).not.toMatch(/CampaignFormDialog|JobPostingsTab/);
  });
});
