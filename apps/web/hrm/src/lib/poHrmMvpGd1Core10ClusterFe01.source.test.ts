/**
 * Source lock — PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01
 * Assert employee-insurances* bind · Nest /core SI=0 · honesty · BH≠CORE-07.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01 source lock', () => {
  it('hrmApi physical employee-insurances* + actions · no Nest /core SI SoT', () => {
    const src = read('integrations/hrmApi.ts');
    const body = codeOnly(src);
    expect(src).toContain('/api/hrm/employee-insurances');
    expect(src).toContain('postEmployeeInsuranceAction');
    expect(src).toContain('listEmployeeInsurances');
    expect(src).toContain('/actions');
    expect(body).not.toMatch(
      /(?:listEmployeeInsurances|getEmployeeInsurance|postEmployeeInsuranceAction|createEmployeeInsurance)[\s\S]{0,900}\/api\/hrm\/core\//,
    );
  });

  it('Profile BH binds timeline + honesty · statusLabelVi · Nest /core 0', () => {
    const panel = read('components/employee/EmployeeInsurance.tsx');
    const timeline = read('components/employee/InsuranceTimelineActionsPanel.tsx');
    const bodyPanel = codeOnly(panel);
    const bodyTl = codeOnly(timeline);
    expect(panel).toContain('InsuranceTimelineActionsPanel');
    expect(panel).toContain('si-core10-honesty');
    expect(panel).toContain('core10HonestyBannerText');
    expect(panel).toContain('resolveInsuranceStatusLabelVi');
    expect(timeline).toContain('postEmployeeInsuranceAction');
    expect(timeline).toContain('statusLabelVi');
    expect(timeline).toContain('isInsuranceActionValidationError');
    expect(timeline).toContain('HRM-SI-ACTION-400');
    expect(bodyPanel).not.toContain('/api/hrm/core/');
    expect(bodyTl).not.toContain('/api/hrm/core/');
    expect(bodyPanel).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('DISP FE-derive + path lock in empCoreSiRing · DENY invent PAY/printable DONE', () => {
    const ring = read('lib/empCoreSiRing.ts');
    const helpers = read('lib/insuranceTimelineActions.ts');
    expect(ring).toContain("active: 'Hoạt động'");
    expect(ring).toContain('R-CORE-10-DISP');
    expect(ring).toContain("nestCoreDenied: '/api/hrm/core/'");
    expect(ring).toContain('catalog ≠ CORE-10 DONE');
    expect(ring).toContain('enrollment CRUD ≠ CORE-10 DONE');
    expect(ring).toContain('LIVE actions ≠ module DONE');
    expect(ring).toContain('BH «Hoạt động» ≠ CORE-07');
    expect(ring).toContain('PAY AC-SI-TL-06 OUT invent DONE');
    expect(ring).toContain('CORE-09 RETAIN');
    expect(ring).toContain('CORE-07 RETAIN');
    expect(ring).toContain('soft ≠ CORE-06 DONE');
    expect(helpers).toContain('statusLabelVi');
    expect(helpers).toContain('resolveInsurancePeriodStatusLabelVi');
    expect(codeOnly(ring)).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('hook maps statusLabelVi · DENY Nest /core dual · DENY CORE-07 activate conflate in SI ring', () => {
    const hook = read('hooks/useEmployeeInsurance.ts');
    const act = read('components/employee/EmployeeActivatePanel.tsx');
    expect(hook).toContain('statusLabelVi');
    expect(hook).toContain('resolveInsuranceStatusLabelVi');
    expect(codeOnly(hook)).not.toContain('/api/hrm/core/');
    // CORE-07 activate panel RETAIN separate — SI must not call activateEmployee
    expect(codeOnly(hook)).not.toContain('activateEmployee');
    expect(act).toContain('Kích hoạt Hoạt động');
  });
});
