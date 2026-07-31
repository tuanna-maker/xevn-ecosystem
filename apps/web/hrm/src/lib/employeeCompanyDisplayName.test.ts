import { describe, expect, it } from 'vitest';
import {
  asLegalCompanyDisplayName,
  isLegacyKhoiDisplayName,
  resolveEmployeeCompanyColumnLabel,
} from './employeeCompanyDisplayName';

describe('employeeCompanyDisplayName (D-HRM-EMP-COMPANY-COL-FE-01)', () => {
  const leMap = new Map<string, string>([
    ['holding', 'Tập đoàn XeVN'],
    ['trsport', 'Công ty Cổ phần Thương mại và Dịch vụ X.E'],
    ['logistics', 'Công ty TNHH Du lịch Visun'],
  ]);

  const khoiMap = new Map<string, string>([
    ['trsport', 'Khối Vận tải X.E'],
    ['logistics', 'Khối Logistics X.E'],
  ]);

  it('detects legacy Khối labels (AC-EMP-COL-01)', () => {
    expect(isLegacyKhoiDisplayName('Khối Logistics X.E')).toBe(true);
    expect(isLegacyKhoiDisplayName('Khối Tài chính X.E')).toBe(true);
    expect(isLegacyKhoiDisplayName('Công ty TNHH Du lịch Visun')).toBe(false);
    expect(asLegalCompanyDisplayName('Khối Vận tải X.E')).toBeNull();
  });

  it('prefers BE company_display_name when legal (AC-EMP-COL-03)', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: 'trsport',
        companyDisplayName: 'Công ty Cổ phần Thương mại và Dịch vụ X.E',
        operatingUnitLabelMap: khoiMap,
        membershipCompanyName: 'Ignored',
      }),
    ).toBe('Công ty Cổ phần Thương mại và Dịch vụ X.E');
  });

  it('rejects Khối company_display_name and falls through to LE map', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: 'logistics',
        companyDisplayName: 'Khối Logistics X.E',
        operatingUnitLabelMap: leMap,
      }),
    ).toBe('Công ty TNHH Du lịch Visun');
  });

  it('FAIL if resolve would surface Khối when LE map available', () => {
    const label = resolveEmployeeCompanyColumnLabel({
      companyId: 'trsport',
      operatingUnitLabelMap: leMap,
    });
    expect(label).not.toMatch(/^Khối\s+/u);
    expect(label).toContain('Thương mại');
  });

  it('fail-closed to em dash when only Khối labels exist (BR-EMP-COL-02)', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: 'trsport',
        companyDisplayName: 'Khối Vận tải X.E',
        operatingUnitLabelMap: khoiMap,
        membershipCompanyName: 'Khối Vận tải X.E',
      }),
    ).toBe('—');
  });

  it('uses membership company name when OU map empty', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: 'xe-du-lich',
        operatingUnitLabelMap: new Map(),
        membershipCompanyName: 'Công ty TNHH Du lịch X.E Việt Nam',
      }),
    ).toBe('Công ty TNHH Du lịch X.E Việt Nam');
  });

  it('holding partition shows Tập đoàn XeVN (AC-EMP-COL-02)', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: 'holding',
        operatingUnitLabelMap: leMap,
      }),
    ).toBe('Tập đoàn XeVN');
  });

  it('D-MOB-UUID-BPRIME-FE-01: Plane B′ holding UUID maps to Tập đoàn XeVN', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: '10000000-0000-4000-8000-000000000001',
        operatingUnitLabelMap: leMap,
      }),
    ).toBe('Tập đoàn XeVN');
  });

  it('D-MOB-UUID-BPRIME-FE-01: LE UUID without display fails closed to em dash', () => {
    expect(
      resolveEmployeeCompanyColumnLabel({
        companyId: '78b8a663-1111-4111-8111-111111111111',
        operatingUnitLabelMap: leMap,
      }),
    ).toBe('—');
  });
});
