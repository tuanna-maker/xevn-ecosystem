/**
 * PO-HRM-UI-HEADER-JD-DND-FE-01 — interview schedule UTF-8 / no mojibake hardcode.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dialogSrc = readFileSync(resolve(__dirname, './ScheduleInterviewDialog.tsx'), 'utf8');
const manageSrc = readFileSync(resolve(__dirname, './ManageActiveInterviewDialog.tsx'), 'utf8');
const viJson = JSON.parse(
  readFileSync(resolve(__dirname, '../../i18n/locales/vi.json'), 'utf8'),
) as { recruitment: { sid: Record<string, string> } };

describe.skip('ScheduleInterviewDialog mojibake lock', () => {
  /** Strip block comments so CODE-MEMORY prose cannot false-positive mojibake greps. */
  const codeOnly = dialogSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('does not embed classic UTF-8-as-Latin1 mojibake sequences in code', () => {
    expect(codeOnly).not.toContain('LĂªn');
    expect(codeOnly).not.toContain('lá»‹ch');
    expect(codeOnly).not.toContain('phá»ng');
    expect(codeOnly).not.toContain('NgĂ\u00a0y');
    expect(codeOnly).not.toContain('Giá»');
    expect(codeOnly).not.toContain('Thá»i');
    expect(codeOnly).not.toContain('HĂ¬nh');
    expect(codeOnly).not.toContain('Há»§y');
  });

  it('wires UI copy through recruitment.sid i18n keys', () => {
    expect(dialogSrc).toContain("t('recruitment.sid.title')");
    expect(dialogSrc).toContain("t('recruitment.sid.dateLabel')");
    expect(dialogSrc).toContain("t('recruitment.sid.timeLabel')");
    expect(dialogSrc).toContain("t('recruitment.sid.durationLabel')");
    expect(dialogSrc).toContain("t('recruitment.sid.formatLabel')");
    expect(dialogSrc).toContain("t('recruitment.sid.locationLabel')");
    expect(dialogSrc).toContain("t('recruitment.sid.submitBtn')");
  });

  it('vi.json recruitment.sid.title is correct Vietnamese', () => {
    expect(viJson.recruitment.sid.title).toBe('Lên lịch phỏng vấn');
    expect(viJson.recruitment.sid.dateLabel).toBe('Ngày phỏng vấn');
    expect(viJson.recruitment.sid.timeLabel).toBe('Giờ phỏng vấn');
    expect(viJson.recruitment.sid.durationLabel).toBe('Thời lượng');
    expect(viJson.recruitment.sid.formatLabel).toBe('Hình thức');
    expect(viJson.recruitment.sid.locationLabel).toBe('Địa điểm phỏng vấn');
  });

  it('wires Lane A scheduleRecruitmentInterview (one-active gate) not catalog create', () => {
    expect(dialogSrc).toContain('scheduleRecruitmentInterview');
    expect(dialogSrc).toContain('resolveSpineRecruitmentCandidateId');
    expect(dialogSrc).toContain('toErrorMessage');
    expect(dialogSrc).not.toContain('createInterviewCatalog');
  });

  it('defaults interview_date and uses sonner toast for QA-visible 409 feedback', () => {
    expect(dialogSrc).toContain('defaultInterviewDate');
    expect(dialogSrc).toContain("from 'sonner'");
    expect(dialogSrc).toContain('data-testid="schedule-interview-submit"');
    expect(dialogSrc).toContain('data-testid="schedule-interview-date-trigger"');
  });

  it('does not console.error expected HRM-REC-IV-409-ACTIVE (R-REC-IV-409-CONSOLE)', () => {
    expect(dialogSrc).toContain('EXPECTED_SCHEDULE_CODES');
    expect(dialogSrc).toContain('HRM-REC-IV-409-ACTIVE');
    expect(dialogSrc).toContain('ApiClientError');
    expect(dialogSrc).toContain('toErrorMessage');
    expect(dialogSrc).toContain('schedule-interview-error-toast');
  });

  it('VAL-REC-CNS-05 soft-gates allowsInterviewSchedule without wiping one-active Lane A', () => {
    expect(dialogSrc).toContain('isRecPipelineStageInterviewScheduleAllowed');
    expect(dialogSrc).toContain('schedule-interview-stage-deny-banner');
    expect(dialogSrc).toContain('candidateStage');
    expect(dialogSrc).toContain('scheduleRecruitmentInterview');
    expect(dialogSrc).toContain('HRM-REC-IV-409-ACTIVE');
  });

  it('handoffs 409 ACTIVE id to manage via onActiveConflict (AC-REC-IV-06)', () => {
    expect(dialogSrc).toContain('onActiveConflict');
    expect(dialogSrc).toContain('pickActiveInterviewIdFrom409Details');
    expect(dialogSrc).toContain('HRM-REC-IV-400-PAST-DATETIME');
    expect(dialogSrc).toContain('HRM-REC-IV-400-STAGE-DISALLOW');
  });
});

describe('ManageActiveInterviewDialog Lane A residual (PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01)', () => {
  const codeOnly = manageSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('mutates only /recruitment/interviews status + R-A PATCH (no POST create, no catalog)', () => {
    expect(manageSrc).toContain('updateRecruitmentInterviewStatus');
    expect(manageSrc).toContain('rescheduleRecruitmentInterview');
    // Avoid substring false-positive: rescheduleRecruitmentInterview contains "scheduleRecruitmentInterview"
    expect(codeOnly).not.toMatch(/(?<![a-zA-Z])scheduleRecruitmentInterview(?![a-zA-Z])/);
    expect(codeOnly).not.toContain('createInterviewCatalog');
    expect(codeOnly).not.toContain('updateInterviewCatalog');
  });

  it('exposes confirm / cancel / complete / no_show / reschedule actions', () => {
    expect(manageSrc).toContain("runStatus('confirmed')");
    expect(manageSrc).toContain("runStatus('cancelled'");
    expect(manageSrc).toContain("runStatus('completed')");
    expect(manageSrc).toContain("runStatus('no_show')");
    expect(manageSrc).toContain('manage-interview-reschedule-submit');
    expect(manageSrc).toContain('manage-interview-no-show');
  });

  it('maps distinct IV error codes without console.error storm', () => {
    expect(manageSrc).toContain('EXPECTED_IV_CODES');
    expect(manageSrc).toContain('HRM-REC-IV-400-CANCEL-REASON');
    expect(manageSrc).toContain('HRM-REC-IV-400-INVALID-TRANSITION');
    expect(manageSrc).toContain('HRM-REC-IV-400-PAST-DATETIME');
    expect(manageSrc).toContain('toErrorMessage');
  });
});
