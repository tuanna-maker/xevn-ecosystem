/**
 * Source lock — PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01
 * Assert KT/KL bind paths rewards* + discipline* · enforce/cancel · no Nest /core SoT.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

/** Strip block comments so CODE-MEMORY paths do not false-positive. */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01 source lock', () => {
  it('hrmApi uses physical rewards/discipline + enforce/cancel-enforce', () => {
    const src = read('integrations/hrmApi.ts');
    expect(src).toContain('/rewards');
    expect(src).toContain('/discipline');
    expect(src).toContain('/enforce');
    expect(src).toContain('/cancel-enforce');
    expect(src).toContain('enforceEmployeeReward');
    expect(src).toContain('cancelEnforceEmployeeDiscipline');
    expect(codeOnly(src)).not.toMatch(
      /enforceEmployeeReward[\s\S]{0,300}\/api\/hrm\/core\//,
    );
  });

  it('hook posts create without status invent + period + enforce', () => {
    const src = read('hooks/useEmployeeRewardsDiscipline.ts');
    expect(src).toContain('createEmployeeReward');
    expect(src).toContain('createEmployeeDiscipline');
    expect(src).toContain('enforceEmployeeReward');
    expect(src).toContain('cancelEnforceEmployeeReward');
    expect(src).toContain('enforceEmployeeDiscipline');
    expect(src).toContain('cancelEnforceEmployeeDiscipline');
    expect(src).toContain('listPayrollPeriods');
    expect(src).toContain('buildRdMutatePayload');
    expect(src).toContain('validateRdAmountPeriodGate');
    expect(src).toContain('status_label');
    expect(src).toContain('payroll_link_status');
    expect(src).toContain('payroll_period_ref');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toContain('status: \'approved\'');
    expect(codeOnly(src)).not.toContain('status: \'active\'');
  });

  it('EmployeeRewardsDiscipline title-first + period picker + enforce UI', () => {
    const src = read('components/employee/EmployeeRewardsDiscipline.tsx');
    expect(src).toContain('hdsd-emp-rd-title');
    expect(src).toContain('hdsd-emp-rd-period-picker');
    expect(src).toContain('hdsd-emp-rd-enforce');
    expect(src).toContain('hdsd-emp-rd-cancel-enforce');
    expect(src).toContain('hdsd-emp-rd-status-label');
    expect(src).toContain('hdsd-emp-rd-link-status');
    expect(src).toContain('hdsd-emp-rd-period-label');
    expect(src).toContain('formatDisplayDate');
    expect(src).toContain('Thi hành');
    expect(src).toContain('Hủy thi hành');
    expect(src).toContain('Nhập tiêu đề trước');
    expect(codeOnly(src)).not.toContain('/api/hrm/core/');
    expect(codeOnly(src)).not.toMatch(/payslip.*[Nn]et|Net\s*\+|invent.*payslip/);
  });

  it('apiError maps CORE-08 RD VAL/ENFORCE/DUAL/LOCKED/EMP', () => {
    const src = read('lib/apiError.ts');
    expect(src).toContain('"HRM-CORE-RD-VAL-400"');
    expect(src).toContain('"HRM-CORE-RD-ENFORCE-409"');
    expect(src).toContain('"HRM-CORE-RD-DUAL-PERIOD-409"');
    expect(src).toContain('"HRM-CORE-RD-LOCKED-PERIOD-409"');
    expect(src).toContain('"HRM-CORE-RD-EMP-INACTIVE-409"');
    expect(src).toContain('"HRM-CORE-RD-PERIOD-404"');
    expect(src).toContain('"HRM-CORE-RD-404"');
  });

  it('empCoreRdRing forbids Nest /core RD SoT', () => {
    const src = read('lib/empCoreRdRing.ts');
    expect(src).toContain('isForbiddenCoreRdSotPath');
    expect(src).toContain('CORE_RD_PAPER_CORE_PATH');
    expect(src).toContain('validateRdAmountPeriodGate');
    expect(src).toContain('/api/hrm/core/reward-discipline');
  });
});
