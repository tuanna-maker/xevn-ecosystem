/**
 * @CODE-MEMORY
 * Screen:     unit — attSheet11Ring
 * UC:         UC-BP-ATT-11
 * Purpose:    Unit coverage for path · statusLabelVi · FIXED_GĐ1 · parse display · honesty
 * WorkItem:   PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01
 * Coded:      2026-08-09
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_11_FIXED_GD1_PERSONAS,
  ATT_11_MUST_KEEP_STAMPS,
  ATT_SHEET_11_PATH_ASSERT,
  att11CsumInboxFooterText,
  att11FixedGd1FooterText,
  att11HonestyBannerText,
  att11PersonaLabelVi,
  att11PrintableReady,
  deriveAtt11StatusLabelVi,
  isForbiddenAttSheet11SotPath,
  isPhysicalAttSheet11Path,
  parseAtt11SignaturesDisplay,
} from './attSheet11Ring';

describe('attSheet11Ring — PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01', () => {
  it('locks physical attendance-sheets paths · Nest /core forbidden', () => {
    expect(ATT_SHEET_11_PATH_ASSERT.signatures).toContain(
      '/api/hrm/attendance/attendance-sheets/',
    );
    expect(ATT_SHEET_11_PATH_ASSERT.signatures).toContain('/signatures');
    expect(ATT_SHEET_11_PATH_ASSERT.close).toContain('/close');
    expect(ATT_SHEET_11_PATH_ASSERT.reopen).toContain('/reopen');
    expect(ATT_SHEET_11_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(ATT_SHEET_11_PATH_ASSERT.inventHoldTableDenied).toBe('att_leave_hold');
    expect(ATT_SHEET_11_PATH_ASSERT.secondSignLedgerDenied).toBe('second_sign_ledger');
    expect(
      isPhysicalAttSheet11Path('/api/hrm/attendance/attendance-sheets/x/signatures'),
    ).toBe(true);
    expect(isForbiddenAttSheet11SotPath('/api/hrm/core/attendance/signatures')).toBe(true);
    expect(isForbiddenAttSheet11SotPath('att_leave_hold')).toBe(true);
  });

  it('FIXED_GĐ1 = employee · direct_manager · hr_admin', () => {
    expect([...ATT_11_FIXED_GD1_PERSONAS]).toEqual([
      'employee',
      'direct_manager',
      'hr_admin',
    ]);
    expect(att11PersonaLabelVi('employee')).toBe('Nhân viên');
    expect(att11PersonaLabelVi('direct_manager')).toBe('Quản lý trực tiếp');
    expect(att11PersonaLabelVi('hr_admin')).toBe('HCNS / C&B');
  });

  it('FE-derives statusLabelVi · wire wins', () => {
    expect(deriveAtt11StatusLabelVi('submitted')).toBe('Chờ ký');
    expect(deriveAtt11StatusLabelVi('closed')).toBe('Đã chốt');
    expect(deriveAtt11StatusLabelVi('submitted', 'Đang chờ ký (BE)')).toBe(
      'Đang chờ ký (BE)',
    );
  });

  it('parses display-ready signatures envelope', () => {
    const display = parseAtt11SignaturesDisplay({
      header_id: 'sheet-1',
      status: 'submitted',
      steps: [
        {
          step_code: 'employee',
          persona_role: 'employee',
          outcome: 'approved',
          signed_at: '2026-08-09T10:00:00Z',
          signer_user_id: 'u1',
        },
        {
          step_code: 'direct_manager',
          persona_role: 'direct_manager',
          outcome: 'approved',
          signed_at: '2026-08-09T11:00:00Z',
          signer_user_id: 'u2',
        },
        {
          step_code: 'hr_admin',
          persona_role: 'hr_admin',
          outcome: 'approved',
          signed_at: '2026-08-09T12:00:00Z',
          signer_user_id: 'u3',
        },
      ],
      missing_mandatory_roles: [],
      can_close: true,
      policy_ready: true,
    });
    expect(display).not.toBeNull();
    expect(display!.headerId).toBe('sheet-1');
    expect(display!.statusLabelVi).toBe('Chờ ký');
    expect(display!.steps).toHaveLength(3);
    expect(display!.canClose).toBe(true);
    expect(display!.policyReady).toBe(true);
    expect(display!.ladderComplete).toBe(true);
    expect(display!.hasRejected).toBe(false);
  });

  it('reject → can_close false · ladder incomplete', () => {
    const display = parseAtt11SignaturesDisplay({
      header_id: 'sheet-2',
      status: 'submitted',
      steps: [
        {
          step_code: 'employee',
          persona_role: 'employee',
          outcome: 'rejected',
          comment: 'Sai số công',
          signed_at: '2026-08-09T10:00:00Z',
          signer_user_id: 'u1',
        },
      ],
      missing_mandatory_roles: ['employee', 'direct_manager', 'hr_admin'],
      can_close: false,
    });
    expect(display!.hasRejected).toBe(true);
    expect(display!.canClose).toBe(false);
    expect(display!.ladderComplete).toBe(false);
    expect(display!.missingMandatoryRoles).toContain('hr_admin');
    expect(display!.steps[0].comment).toBe('Sai số công');
  });

  it('honesty · seals · printable false · CSUM/INBOX OUT', () => {
    const honesty = att11HonestyBannerText();
    expect(honesty).toContain('≠ LIVE sign/close alone = ATT-11 DONE');
    expect(honesty).toContain('ATT10QC1-MSLWGUYH');
    expect(honesty).toContain('≠ AGG = ATT-10 DONE');
    expect(honesty).toContain('≠ soft/ATT-08 = ATT-09 DONE');
    expect(honesty).toContain('ATT09QC1-MSLUTL9D');
    expect(honesty).toContain('ATT08QC1-MSLSL36C');
    expect(honesty).toContain('CFG ≠ ATT-02 DONE (ATT02QC1-MSLQZUK7)');
    expect(honesty).toContain('DENY att_leave_hold');
    expect(honesty).toContain('Nest /core DENY');
    expect(honesty).toContain('FIXED_GĐ1');
    expect(att11FixedGd1FooterText()).toContain('R-ATT-11-WF');
    expect(att11CsumInboxFooterText()).toContain('OUT GĐ1');
    expect(att11PrintableReady()).toBe(false);
    expect(ATT_11_MUST_KEEP_STAMPS.att10).toBe('ATT10QC1-MSLWGUYH');
    expect(ATT_11_MUST_KEEP_STAMPS.core09).toBe('CORE09QC1-MSLNBA89');
  });
});
