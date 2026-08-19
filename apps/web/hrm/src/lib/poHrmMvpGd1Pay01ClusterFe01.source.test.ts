import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01 source guards', () => {
  it('bind panel wires timesheet-binds API · no Nest /core hour SoT', () => {
    const api = readFileSync(join(root, 'integrations/hrmApi.ts'), 'utf8');
    expect(api).toContain('/timesheet-binds');
    expect(api).not.toMatch(/\/api\/hrm\/core\/.*hour/i);

    const panel = readFileSync(
      join(root, 'components/payroll/PayrollPeriodTimesheetBindPanel.tsx'),
      'utf8',
    );
    expect(panel).toContain('pay-period-timesheet-binds');
    expect(panel).toContain('HRM-PAY-ATT-412');
    expect(panel).toContain('PAY01_ATT11_PEER_STAMP');
    expect(panel).toContain('payroll_e2e_ready=false');

    const ring = readFileSync(join(root, 'lib/payPay01BindRing.ts'), 'utf8');
    expect(ring).toContain('ATT11QC1-MSLXTH9P');
  });
});
