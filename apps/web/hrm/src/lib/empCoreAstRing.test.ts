/**
 * empCoreAstRing — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  AST_BB_CONFIRM_GATE_DEFAULT_ON,
  CORE_06_SOFT_NE_DONE_FOOTER_VI,
  CORE_06_UAT_HONESTY,
  CORE_AST_PAPER_CORE_PATH,
  CORE_AST_UAT_HONESTY,
  HRM_EMP_ASSET_SERIAL_CONFLICT_CODE,
  astStatusLabelFallback,
  buildAssetWritePayload,
  buildHandoverConfirmPatch,
  buildLostAssetPatch,
  buildSoftReturnPatch,
  countOpenAssigned,
  deriveAssetChecklistClosed,
  filterAssignedAssets,
  isBlankAssetDate,
  isCoreAstPhysicalPath,
  isForbiddenCoreAstOrTermSotPath,
  isForbiddenCoreAstSotPath,
  isForbiddenCoreTermSotPath,
  isFullyInUse,
  needsHandoverConfirmCta,
  parseHandoverConfirmed,
  prefersSoftDisposition,
  resolveAstStatusLabel,
} from './empCoreAstRing';

describe('empCoreAstRing CORE-05', () => {
  it('CFG BB confirm gate defaults ON', () => {
    expect(AST_BB_CONFIRM_GATE_DEFAULT_ON).toBe(true);
  });

  it('physical assets path · forbids Nest /core assets SoT', () => {
    expect(isCoreAstPhysicalPath('/api/hrm/employees/abc/assets')).toBe(true);
    expect(isCoreAstPhysicalPath('/api/hrm/employees/abc/assets/xyz')).toBe(true);
    expect(isForbiddenCoreAstSotPath('/api/hrm/core/employees/abc/assets')).toBe(true);
    expect(isForbiddenCoreAstSotPath(CORE_AST_PAPER_CORE_PATH + '/x/assets')).toBe(true);
    expect(isForbiddenCoreAstSotPath('/api/hrm/employees/abc/assets')).toBe(false);
  });

  it('VI status fallback map O3', () => {
    expect(astStatusLabelFallback('assigned')).toBe('Đang sử dụng');
    expect(astStatusLabelFallback('returned')).toBe('Đã thu hồi');
    expect(astStatusLabelFallback('maintenance')).toBe('Bảo trì');
    expect(astStatusLabelFallback('lost')).toBe('Mất/ghi nợ');
    expect(resolveAstStatusLabel('assigned', 'Đang sử dụng (BE)')).toBe('Đang sử dụng (BE)');
    expect(resolveAstStatusLabel('assigned', null)).toBe('Đang sử dụng');
  });

  it('parseHandoverConfirmed from bool or timestamp', () => {
    expect(parseHandoverConfirmed({ handoverConfirmed: true })).toBe(true);
    expect(parseHandoverConfirmed({ handover_confirmed_at: '2026-08-09T10:00:00Z' })).toBe(true);
    expect(parseHandoverConfirmed({ handoverConfirmed: false })).toBe(false);
    expect(parseHandoverConfirmed({})).toBe(false);
  });

  it('isFullyInUse / needsHandoverConfirmCta with CFG on', () => {
    expect(
      isFullyInUse({ status: 'assigned', handoverConfirmed: true }, true),
    ).toBe(true);
    expect(
      isFullyInUse({ status: 'assigned', handoverConfirmed: false }, true),
    ).toBe(false);
    expect(
      isFullyInUse({ status: 'assigned', handoverConfirmed: false }, false),
    ).toBe(true);
    expect(
      needsHandoverConfirmCta({ status: 'assigned', handoverConfirmed: false }, true),
    ).toBe(true);
    expect(
      needsHandoverConfirmCta({ status: 'assigned', handoverConfirmed: true }, true),
    ).toBe(false);
  });

  it('soft disposition prefer · BB patch ≠ notes', () => {
    expect(prefersSoftDisposition({ status: 'assigned', handoverConfirmed: false })).toBe(true);
    expect(buildHandoverConfirmPatch()).toEqual({ handoverConfirmed: true });
    expect(buildHandoverConfirmPatch('Nguyễn Văn A')).toEqual({
      handoverConfirmed: true,
      handoverReceiverName: 'Nguyễn Văn A',
    });
    expect(buildHandoverConfirmPatch()).not.toHaveProperty('notes');
    expect(buildSoftReturnPatch('2026-08-09')).toEqual({
      status: 'returned',
      return_date: '2026-08-09',
    });
  });

  it('CORE-06: lost patch + assigned filter + FE-derive closed', () => {
    expect(buildLostAssetPatch('Mất tại hiện trường')).toEqual({
      status: 'lost',
      notes: 'Mất tại hiện trường',
    });
    expect(buildLostAssetPatch('x', '2026-08-09')).toEqual({
      status: 'lost',
      notes: 'x',
      return_date: '2026-08-09',
    });

    const rows = [
      { status: 'assigned' },
      { status: 'returned' },
      { status: 'assigned' },
      { status: 'lost' },
    ];
    expect(filterAssignedAssets(rows)).toHaveLength(2);
    expect(countOpenAssigned(rows)).toBe(2);
    expect(deriveAssetChecklistClosed(rows)).toEqual({
      asset_checklist_closed: false,
      openAssignedCount: 2,
    });
    expect(deriveAssetChecklistClosed([{ status: 'returned' }, { status: 'lost' }])).toEqual({
      asset_checklist_closed: true,
      openAssignedCount: 0,
    });
    expect(isForbiddenCoreTermSotPath('/api/hrm/core/employees/x/terminations')).toBe(true);
    expect(isForbiddenCoreAstOrTermSotPath('/api/hrm/employees/x/assets')).toBe(false);
    expect(CORE_06_UAT_HONESTY.hrm_personnel_uat_ready).toBe(false);
    expect(CORE_06_UAT_HONESTY.soft_profile_alone_ne_core06_done).toBe(true);
    expect(CORE_06_SOFT_NE_DONE_FOOTER_VI).toMatch(/≠ CORE-06 DONE/);
  });

  it('honesty flags locked false · serial code constant', () => {
    expect(CORE_AST_UAT_HONESTY.hrm_personnel_uat_ready).toBe(false);
    expect(CORE_AST_UAT_HONESTY.contracts_printable_ready).toBe(false);
    expect(HRM_EMP_ASSET_SERIAL_CONFLICT_CODE).toBe('HRM-EMP-ASSET-SERIAL-CONFLICT');
  });

  it('FE-02: buildAssetWritePayload omits blank assigned/return dates (never "")', () => {
    expect(isBlankAssetDate('')).toBe(true);
    expect(isBlankAssetDate('   ')).toBe(true);
    expect(isBlankAssetDate(null)).toBe(true);
    expect(isBlankAssetDate('2026-08-09')).toBe(false);

    const blankForm = {
      asset_name: 'Laptop Dell',
      asset_code: 'AST-001',
      serial_number: 'SN-1',
      category: 'laptop',
      assigned_date: '',
      return_date: '',
      status: 'assigned',
      notes: '',
    };
    const payload = buildAssetWritePayload(blankForm);
    expect(payload).not.toHaveProperty('assigned_date');
    expect(payload).not.toHaveProperty('return_date');
    expect(payload.asset_name).toBe('Laptop Dell');
    expect(payload.notes).toBe('');
    expect(JSON.stringify(payload)).not.toMatch(/assigned_date""|return_date""/);
    expect(JSON.stringify(payload)).not.toContain('"assigned_date":""');
    expect(JSON.stringify(payload)).not.toContain('"return_date":""');

    const camelBlank = buildAssetWritePayload({
      assetName: 'Phone',
      assignedDate: '',
      returnDate: '  ',
      status: 'assigned',
    });
    expect(camelBlank).not.toHaveProperty('assignedDate');
    expect(camelBlank).not.toHaveProperty('returnDate');
    expect(camelBlank.assetName).toBe('Phone');

    const withDates = buildAssetWritePayload({
      asset_name: 'Monitor',
      assigned_date: '2026-08-01',
      return_date: '2026-12-31',
    });
    expect(withDates.assigned_date).toBe('2026-08-01');
    expect(withDates.return_date).toBe('2026-12-31');
  });
});
