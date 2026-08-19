/**
 * Unit — attRuleRing ATT-02 path / XOR / envelope / honesty · FE-01+FE-02.
 */
import { describe, expect, it } from 'vitest';
import {
  ATT_02_HONESTY_FOOTER,
  ATT_02_VAL_400_CODE,
  ATT_RULE_02_PATH_ASSERT,
  R_ATT_02_MODE_FE,
  R_ATT_02_MODE_FE_CLOSED,
  assertAtt02PrintableHonesty,
  assertAtt02XorModes,
  att02HonestyBannerText,
  att02HonestyFooterLines,
  att02Val400Message,
  bandsOverlap,
  buildAtt02LatePenaltyPatchBody,
  collectActiveAtt02Modes,
  isAtt02MixedModePayload,
  isForbiddenAttRuleSotPath,
  isPhysicalAttendancePath,
  parseAtt02LatePenaltyEnvelope,
  resolveAtt02ModeLabelVi,
  validateAtt02LatePenaltyDraft,
} from './attRuleRing';

describe('attRuleRing — PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01/02', () => {
  it('path assert physical /attendance/* · Nest /core denied', () => {
    expect(ATT_RULE_02_PATH_ASSERT.rules).toBe('/api/hrm/attendance/rules');
    expect(ATT_RULE_02_PATH_ASSERT.rulesLatePenaltyOptional).toContain('/attendance/rules/late-penalty');
    expect(ATT_RULE_02_PATH_ASSERT.workSites).toContain('/attendance/work-sites');
    expect(ATT_RULE_02_PATH_ASSERT.workShifts).toContain('/attendance/work-shifts');
    expect(ATT_RULE_02_PATH_ASSERT.lateEarly).toContain('/attendance/late-early-requests');
    expect(ATT_RULE_02_PATH_ASSERT.punch).toContain('/attendance/records');
    expect(ATT_RULE_02_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(isPhysicalAttendancePath('/api/hrm/attendance/rules')).toBe(true);
    expect(isForbiddenAttRuleSotPath('/api/hrm/core/att/rules/late-penalty')).toBe(true);
    expect(isForbiddenAttRuleSotPath('/api/hrm/attendance/rules')).toBe(false);
  });

  it('parse envelope ABSENT when mode/bands/off missing (CFG-only row)', () => {
    const env = parseAtt02LatePenaltyEnvelope({
      id: 'r1',
      company_id: 'main',
      notify_late: true,
      gps_enabled: true,
      round_in_minutes: 5,
    });
    expect(env.envelopePresent).toBe(false);
    expect(env.mode).toBeNull();
    expect(env.latePenaltyEnabled).toBeNull();
    expect(env.notifyLate).toBe(true);
    expect(env.sourceFlags.gpsEnabled).toBe(true);
  });

  it('parse envelope LIVE when BE display-ready (FE-02) · modeLabelVi · off ≠ notifyLate', () => {
    const env = parseAtt02LatePenaltyEnvelope({
      companyId: 'main',
      mode: 'minute',
      modeLabelVi: 'Theo phút',
      bands: [{ fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 }],
      latePenaltyEnabled: false,
      latePenaltyHours: null,
      scope: { companyId: 'main', departmentId: null, shiftId: 'sh1' },
      sourceFlags: { gpsEnabled: true, wifiEnabled: false, qrEnabled: false },
      notifyLate: true,
    });
    expect(env.envelopePresent).toBe(true);
    expect(env.mode).toBe('minute');
    expect(env.modeLabelVi).toBe('Theo phút');
    expect(env.bands).toHaveLength(1);
    expect(env.latePenaltyEnabled).toBe(false);
    expect(env.notifyLate).toBe(true);
    expect(env.scope.shiftId).toBe('sh1');
    expect(env.sourceFlags.gpsEnabled).toBe(true);
    expect(resolveAtt02ModeLabelVi('block', null)).toBe('Theo block');
  });

  it('XOR + bands overlap + mixed flags · HRM-VAL-400 helpers', () => {
    expect(assertAtt02XorModes(['minute'])).toBe(true);
    expect(assertAtt02XorModes(['minute', 'block'])).toBe(false);
    expect(assertAtt02XorModes(['tier', 'band'])).toBe(true);
    expect(collectActiveAtt02Modes({ modeMinute: true, modeBlock: true })).toEqual([
      'minute',
      'block',
    ]);
    expect(isAtt02MixedModePayload({ modeMinute: true, modeBlock: true })).toBe(true);
    expect(isAtt02MixedModePayload({ mode: 'minute' })).toBe(false);
    expect(
      bandsOverlap([
        { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 },
        { fromMinutes: 10, toMinutes: 30, penaltyHours: 1 },
      ]),
    ).toBe(true);
    expect(
      bandsOverlap([
        { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 },
        { fromMinutes: 16, toMinutes: 30, penaltyHours: 1 },
      ]),
    ).toBe(false);
    expect(att02Val400Message('xor')).toContain(ATT_02_VAL_400_CODE);
    expect(validateAtt02LatePenaltyDraft({ mode: null, latePenaltyEnabled: true, bands: [] })).toContain(
      'Chọn đúng một',
    );
    expect(
      validateAtt02LatePenaltyDraft({
        mode: 'minute',
        latePenaltyEnabled: true,
        bands: [
          { fromMinutes: 1, toMinutes: 15, penaltyHours: 0.5 },
          { fromMinutes: 10, toMinutes: 30, penaltyHours: 1 },
        ],
      }),
    ).toContain(ATT_02_VAL_400_CODE);
    expect(
      validateAtt02LatePenaltyDraft({
        mode: 'minute',
        latePenaltyEnabled: false,
        bands: [],
      }),
    ).toBeNull();
  });

  it('buildAtt02LatePenaltyPatchBody — single mode · no notifyLate conflation', () => {
    const body = buildAtt02LatePenaltyPatchBody({
      mode: 'band',
      latePenaltyEnabled: false,
      bands: [{ fromMinutes: 1, toMinutes: 10, penaltyHours: 0.25 }],
      departmentId: '  ',
      shiftId: 'sh-1',
    });
    expect(body.mode).toBe('tier');
    expect(body.latePenaltyEnabled).toBe(false);
    expect(body).not.toHaveProperty('notifyLate');
    expect(body).not.toHaveProperty('notify_late');
    expect(body.departmentId).toBeNull();
    expect(body.shiftId).toBe('sh-1');
    expect(body.bands).toEqual([{ fromMinutes: 1, toMinutes: 10, penaltyHours: 0.25 }]);
  });

  it('honesty footer · printable false · residual CLOSED FE-02', () => {
    expect(assertAtt02PrintableHonesty()).toBe(true);
    expect(ATT_02_HONESTY_FOOTER.cfgNeAtt02Done).toContain('CFG alone ≠ ATT-02 DONE');
    expect(ATT_02_HONESTY_FOOTER.lerNeModeSot).toContain('late_early_requests ≠ mode SoT');
    expect(ATT_02_HONESTY_FOOTER.payOut).toContain('PAY OUT');
    expect(ATT_02_HONESTY_FOOTER.nePltDone).toContain('PLT01QC1-MSLPUQIU');
    expect(ATT_02_HONESTY_FOOTER.offNeNotifyLate).toContain('notifyLate');
    expect(ATT_02_HONESTY_FOOTER.residualMode).toContain(R_ATT_02_MODE_FE_CLOSED);
    expect(att02HonestyFooterLines().length).toBeGreaterThan(8);
    expect(att02HonestyBannerText()).toContain(R_ATT_02_MODE_FE);
    expect(att02HonestyBannerText()).toContain('attendance_uat_ready=false');
    expect(att02HonestyBannerText()).toContain('CLOSED');
  });
});
