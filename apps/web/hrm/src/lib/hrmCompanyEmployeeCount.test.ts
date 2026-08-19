import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GROUP_HOLDING_ROOT_ID } from '@/integrations/tenantScopeApi';
import { HRM_OPERATING_UNIT_TEST_FIXTURE } from '@/lib/hrmOperatingUnits';
import {
  buildOperatingUnitNameToSlugMap,
  enrichHrmCompaniesWithEmployeeCounts,
  fetchEmployeeCountsByOperatingSlug,
  formatHrmEmployeeCount,
  parseEmployeeSummaryByCompany,
  resolveHrmCompanyRowOperatingSlug,
  sumKnownEmployeeCounts,
} from './hrmCompanyEmployeeCount';
import * as hrmApi from '@/integrations/hrmApi';

const MEMBER_LE_UUID = 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa';

describe('hrmCompanyEmployeeCount (D-HRM-CO-EMP-COUNT-FE-01)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps holding root to holding — never uses LE UUID as slug', () => {
    expect(
      resolveHrmCompanyRowOperatingSlug({
        id: GROUP_HOLDING_ROOT_ID,
        name: 'Tập đoàn XeVN',
        code: 'XeVN',
      }),
    ).toBe('holding');

    const nameMap = buildOperatingUnitNameToSlugMap(HRM_OPERATING_UNIT_TEST_FIXTURE);
    expect(
      resolveHrmCompanyRowOperatingSlug(
        {
          id: MEMBER_LE_UUID,
          name: 'Công ty TNHH Du lịch Visun',
          code: 'VISUN',
        },
        nameMap,
      ),
    ).toBe('logistics');

    // LE UUID must not be treated as operating company_id
    expect(
      resolveHrmCompanyRowOperatingSlug({
        id: MEMBER_LE_UUID,
        name: 'Unknown Legal Entity',
        code: 'X',
      }),
    ).toBeNull();
  });

  it('maps pilot HRM UUID to slug but not arbitrary LE UUID', () => {
    expect(
      resolveHrmCompanyRowOperatingSlug({
        id: '10000000-0000-4000-8000-000000000002',
        name: 'ignored',
        code: null,
      }),
    ).toBe('trsport');
  });

  it('enriches null → real counts by slug; unknown stays null', () => {
    const nameMap = buildOperatingUnitNameToSlugMap(HRM_OPERATING_UNIT_TEST_FIXTURE);
    const companies = [
      {
        id: GROUP_HOLDING_ROOT_ID,
        name: 'Tập đoàn XeVN',
        code: 'XeVN',
        logo_url: null,
        address: null,
        phone: null,
        email: null,
        tax_code: '0101234567',
        website: null,
        industry: null,
        employee_count: null as number | null,
        founded_date: '2015-01-01',
        description: null,
        status: 'active',
        created_at: '',
        updated_at: '',
      },
      {
        id: MEMBER_LE_UUID,
        name: 'Công ty TNHH Du lịch Visun',
        code: 'VISUN',
        logo_url: null,
        address: null,
        phone: null,
        email: null,
        tax_code: null,
        website: null,
        industry: null,
        employee_count: null as number | null,
        founded_date: null,
        description: null,
        status: 'active',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        name: 'Công ty chưa map slug',
        code: 'ZZ',
        logo_url: null,
        address: null,
        phone: null,
        email: null,
        tax_code: null,
        website: null,
        industry: null,
        employee_count: null as number | null,
        founded_date: null,
        description: null,
        status: 'active',
        created_at: '',
        updated_at: '',
      },
    ];

    const counts = new Map<string, number | null>([
      ['holding', 120],
      ['logistics', 340],
      ['trsport', null],
    ]);

    const enriched = enrichHrmCompaniesWithEmployeeCounts(companies, counts, nameMap);
    expect(enriched[0]?.employee_count).toBe(120);
    expect(enriched[0]?.workforce_operating_slug).toBe('holding');
    expect(enriched[1]?.employee_count).toBe(340);
    expect(enriched[1]?.workforce_operating_slug).toBe('logistics');
    expect(enriched[2]?.employee_count).toBeNull();
    expect(enriched[2]?.workforce_operating_slug).toBeNull();
    // CO-BIND fields preserved
    expect(enriched[0]?.tax_code).toBe('0101234567');
    expect(enriched[0]?.founded_date).toBe('2015-01-01');
  });

  it('sumKnown skips null; format shows em-dash for unknown', () => {
    expect(formatHrmEmployeeCount(null)).toBe('—');
    expect(formatHrmEmployeeCount(undefined)).toBe('—');
    expect(formatHrmEmployeeCount(0)).toBe('0');
    expect(formatHrmEmployeeCount(1100)).toBe('1100');

    expect(
      sumKnownEmployeeCounts([
        { employee_count: null },
        { employee_count: null },
      ]),
    ).toBeNull();
    expect(
      sumKnownEmployeeCounts([
        { employee_count: 100 },
        { employee_count: null },
        { employee_count: 1000 },
      ]),
    ).toBe(1100);
  });

  it('does not use company.id LE UUID as countsBySlug key', () => {
    const counts = new Map<string, number | null>([[MEMBER_LE_UUID, 999]]);
    const enriched = enrichHrmCompaniesWithEmployeeCounts(
      [
        {
          id: MEMBER_LE_UUID,
          name: 'Công ty TNHH Du lịch Visun',
          code: 'VISUN',
          logo_url: null,
          address: null,
          phone: null,
          email: null,
          tax_code: null,
          website: null,
          industry: null,
          employee_count: null,
          founded_date: null,
          description: null,
          status: 'active',
          created_at: '',
          updated_at: '',
        },
      ],
      counts,
      buildOperatingUnitNameToSlugMap(HRM_OPERATING_UNIT_TEST_FIXTURE),
    );
    // Count keyed by LE UUID must be ignored — slug key would be logistics
    expect(enriched[0]?.employee_count).toBeNull();
  });

  it('parseEmployeeSummaryByCompany ignores LE UUID keys (D-HRM-CO-01-FE-HEADCOUNT-BIND-01)', () => {
    const map = parseEmployeeSummaryByCompany({
      company_id: 'main',
      total: 1100,
      active_count: 1000,
      inactive_count: 100,
      archived_count: 0,
      payroll: { total: 0, employees_with_salary: 0 },
      by_department: [],
      salary_ranges: [],
      new_hires: { last_30_days: 0, recent: [] },
      by_company: [
        { company_id: 'holding', total: 120 },
        { company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa', total: 999 },
        { company_id: 'logistics', total: 340 },
      ],
    });
    expect(map?.get('holding')).toBe(120);
    expect(map?.get('logistics')).toBe(340);
    expect(map?.has('a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa')).toBe(false);
  });

  it('fetchEmployeeCountsByOperatingSlug returns rollup total + by_company slugs', async () => {
    vi.spyOn(hrmApi, 'getEmployeesSummary').mockResolvedValue({
      company_id: 'main',
      total: 1100,
      active_count: 1000,
      inactive_count: 100,
      archived_count: 0,
      payroll: { total: 0, employees_with_salary: 0 },
      by_department: [],
      salary_ranges: [],
      new_hires: { last_30_days: 0, recent: [] },
      by_company: [
        { company_id: 'holding', total: 120 },
        { company_id: 'trsport', total: 200 },
        { company_id: 'logistics', total: 340 },
        { company_id: 'finance', total: 240 },
        { company_id: 'services', total: 200 },
      ],
    });

    const { countsBySlug, rollupTotal } = await fetchEmployeeCountsByOperatingSlug([
      'holding',
      'logistics',
    ]);
    expect(rollupTotal).toBe(1100);
    expect(countsBySlug.get('holding')).toBe(120);
    expect(countsBySlug.get('logistics')).toBe(340);
    expect(hrmApi.getEmployeesSummary).toHaveBeenCalledTimes(1);
    expect(hrmApi.getEmployeesSummary).toHaveBeenCalledWith({ company_id: 'main' });
  });
});
