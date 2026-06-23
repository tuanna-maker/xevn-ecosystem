import { describe, expect, it } from 'vitest';
import {
  aggregateCandidatesByAppliedMonth,
  aggregateCandidatesByDepartment,
  buildCandidateCompanySlugMap,
  buildCandidateDepartmentMap,
  buildRecruitmentCostSummary,
  formatRecruitmentCostVnd,
  RECRUITMENT_DEPT_FALLBACK,
  resolveRecruitmentChartLabel,
  sumActiveJobPostingHeadcount,
} from './recruitmentDashboardAggregator';

describe('recruitmentDashboardAggregator', () => {
  const candidates = [
    { id: 'c1', appliedDate: '2026-03-15', source: 'TopCV' },
    { id: 'c2', appliedDate: '2026-03-20', source: 'Website' },
    { id: 'c3', appliedDate: '2026-04-01', source: 'Referral' },
  ];

  it('does not include hardcoded 1OFFICE mock departments', () => {
    const deptMap = new Map<string, string>([
      ['c1', 'Phòng Nhân sự'],
      ['c2', 'Phòng Kinh doanh'],
    ]);
    const rows = aggregateCandidatesByDepartment(candidates, deptMap, ['Phòng Nhân sự', 'Phòng Kinh doanh']);
    expect(rows.some((row) => row.name.includes('1OFFICE'))).toBe(false);
    expect(rows).toEqual([
      expect.objectContaining({ name: 'Phòng Nhân sự', value: 1 }),
      expect.objectContaining({ name: 'Phòng Kinh doanh', value: 1 }),
      expect.objectContaining({ name: RECRUITMENT_DEPT_FALLBACK, value: 1 }),
    ]);
  });

  it('aggregates applied month from live candidate dates (not 2023 mock)', () => {
    const rows = aggregateCandidatesByAppliedMonth(candidates, new Date('2026-06-07T12:00:00Z'));
    const march = rows.find((row) => row.month === '03/2026');
    const april = rows.find((row) => row.month === '04/2026');
    expect(march?.value).toBe(2);
    expect(april?.value).toBe(1);
    expect(rows.some((row) => row.month.endsWith('/2023'))).toBe(false);
  });

  it('uses operating unit display name instead of Khác when dept missing', () => {
    const deptMap = new Map<string, string>();
    const slugMap = new Map<string, string>([['c1', 'trsport']]);
    const labels = new Map<string, string>([['trsport', 'Khối Vận tải X.E']]);
    expect(
      resolveRecruitmentChartLabel('c1', deptMap, slugMap, labels, []),
    ).toBe('Khối Vận tải X.E');
    const rows = aggregateCandidatesByDepartment(
      [{ id: 'c1', appliedDate: '2026-03-15' }],
      deptMap,
      [],
      slugMap,
      labels,
    );
    expect(rows).toEqual([expect.objectContaining({ name: 'Khối Vận tải X.E', value: 1 })]);
    expect(rows.some((row) => row.name === RECRUITMENT_DEPT_FALLBACK)).toBe(false);
  });

  it('builds candidate company slug map from job posting applications', () => {
    const slugMap = buildCandidateCompanySlugMap(
      [
        {
          id: 'a1',
          candidate_id: 'c1',
          job_posting_id: 'jp1',
          company_id: 'main',
          applied_date: '2026-03-01',
          stage: 'applied',
          rating: 0,
          notes: null,
          created_at: '2026-03-01T00:00:00Z',
          updated_at: '2026-03-01T00:00:00Z',
        },
      ],
      [
        {
          id: 'jp1',
          company_id: 'trsport',
          title: 'NV Kinh doanh',
          department: null,
          position: 'Nhân viên kinh doanh',
          employment_type: 'full-time',
          work_location: 'HCM',
          salary_min: null,
          salary_max: null,
          is_salary_visible: true,
          description: null,
          requirements: null,
          benefits: null,
          headcount: 2,
          applied_count: 1,
          status: 'active',
          deadline: null,
          priority: 'medium',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    );
    expect(slugMap.get('c1')).toBe('trsport');
  });

  it('builds candidate department map from job posting applications', () => {
    const map = buildCandidateDepartmentMap(
      [
        {
          id: 'a1',
          candidate_id: 'c1',
          job_posting_id: 'jp1',
          company_id: 'main',
          applied_date: '2026-03-01',
          stage: 'applied',
          rating: 0,
          notes: null,
          created_at: '2026-03-01T00:00:00Z',
          updated_at: '2026-03-01T00:00:00Z',
        },
      ],
      [
        {
          id: 'jp1',
          company_id: 'main',
          title: 'NV Kinh doanh',
          department: 'Phòng Kinh doanh XeVN',
          position: 'Nhân viên kinh doanh',
          employment_type: 'full-time',
          work_location: 'HCM',
          salary_min: null,
          salary_max: null,
          is_salary_visible: true,
          description: null,
          requirements: null,
          benefits: null,
          headcount: 2,
          applied_count: 1,
          status: 'active',
          deadline: null,
          priority: 'medium',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ],
    );
    expect(map.get('c1')).toBe('Phòng Kinh doanh XeVN');
  });

  it('returns empty cost summary instead of fake VND amounts', () => {
    expect(buildRecruitmentCostSummary(candidates)).toEqual({
      avgCostPerCandidate: null,
      costTopCV: null,
      cost24h: null,
      hasData: false,
    });
    expect(formatRecruitmentCostVnd(null)).toBeNull();
    expect(formatRecruitmentCostVnd(990000)).toBe('990.000 đ');
  });

  it('sums active job posting headcount for dashboard target KPI', () => {
    expect(
      sumActiveJobPostingHeadcount([
        {
          id: 'jp1',
          company_id: 'main',
          title: 'A',
          department: 'HR',
          position: 'Staff',
          employment_type: 'full-time',
          work_location: null,
          salary_min: null,
          salary_max: null,
          is_salary_visible: true,
          description: null,
          requirements: null,
          benefits: null,
          headcount: 3,
          applied_count: 0,
          status: 'active',
          deadline: null,
          priority: 'medium',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'jp2',
          company_id: 'main',
          title: 'B',
          department: 'IT',
          position: 'Dev',
          employment_type: 'full-time',
          work_location: null,
          salary_min: null,
          salary_max: null,
          is_salary_visible: true,
          description: null,
          requirements: null,
          benefits: null,
          headcount: 5,
          applied_count: 0,
          status: 'draft',
          deadline: null,
          priority: 'medium',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]),
    ).toBe(3);
  });
});
