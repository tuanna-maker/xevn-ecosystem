/**
 * @CODE-MEMORY
 * Screen:     vitest — Nest dashboard display bind (UC-BP-REC-08)
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Purpose:    Assert FE does not invent %/funnel keys; maps Nest DTO only.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  bindRecDashFunnelCounts,
  bindRecDashFunnelLabels,
  bindRecDashMonthChartRows,
  bindRecDashOrgUnitChartRows,
  enoughPeopleStatusLabelVi,
  formatRecDashCompletionPct,
  mapRecruitmentReportFromDashboardDto,
  REC_DASH_FUNNEL_KEYS,
} from './recruitmentDashboardNestBind';
import type { HrmRecruitmentDashboardDto } from '@/integrations/hrmApi';
import { buildRecruitmentCostSummary, sumActiveJobPostingHeadcount } from './recruitmentDashboardAggregator';
import { toErrorMessage, ApiClientError } from './apiError';

function sampleDto(overrides: Partial<HrmRecruitmentDashboardDto> = {}): HrmRecruitmentDashboardDto {
  return {
    period: { year: 2026, from: null, to: null },
    planned_need: 12,
    filled_count: 4,
    in_pipeline_count: 7,
    open_yctd_count: 5,
    gap_count: 8,
    completion_pct: 33,
    enough_people_status: 'in_progress',
    enough_people_eta: '2026-09',
    enough_people_eta_label: 'Dự kiến đủ người: 09/2026',
    funnel: { cv: 3, screening: 2, interview: 1, offer: 1, onboard: 4 },
    funnel_labels: {
      cv: 'Hồ sơ / CV',
      screening: 'Sàng lọc',
      interview: 'Phỏng vấn',
      offer: 'Offer',
      onboard: 'Onboard / Đã tuyển',
    },
    by_month: [
      {
        month: '2026-03',
        planned_need: 2,
        filled_count: 1,
        in_pipeline_count: 1,
        gap_count: 1,
        completion_pct: 50,
      },
    ],
    by_org_unit: [
      {
        company_id: 'main',
        department_key: null,
        label: 'Tập đoàn',
        planned_need: 12,
        filled_count: 4,
        in_pipeline_count: 7,
        gap_count: 8,
        completion_pct: 33,
      },
    ],
    by_yctd: [],
    empty_guide: null,
    ...overrides,
  };
}

describe('recruitmentDashboardNestBind (UC-BP-REC-08)', () => {
  it('always exposes 5 funnel keys (missing → 0)', () => {
    expect(REC_DASH_FUNNEL_KEYS).toHaveLength(5);
    const counts = bindRecDashFunnelCounts({
      funnel: { cv: 1, screening: 0, interview: 0, offer: 0, onboard: 2 } as never,
    });
    expect(counts).toEqual({ cv: 1, screening: 0, interview: 0, offer: 0, onboard: 2 });
    expect(bindRecDashFunnelCounts(null)).toEqual({
      cv: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      onboard: 0,
    });
  });

  it('formats completion_pct null as em dash (O9 — no FE divide)', () => {
    expect(formatRecDashCompletionPct(null)).toBe('—');
    expect(formatRecDashCompletionPct(33)).toBe('33%');
  });

  it('maps enough_people status labels VI', () => {
    expect(enoughPeopleStatusLabelVi('enough')).toContain('Đã đủ');
    expect(enoughPeopleStatusLabelVi('at_risk')).toContain('Còn thiếu');
  });

  it('binds month/org chart rows from Nest arrays only', () => {
    const dto = sampleDto();
    expect(bindRecDashMonthChartRows(dto.by_month)[0]).toMatchObject({
      month: '03/2026',
      value: 1,
      planned_need: 2,
    });
    expect(bindRecDashOrgUnitChartRows(dto.by_org_unit)[0]).toMatchObject({
      name: 'Tập đoàn',
      value: 4,
    });
  });

  it('maps Reports subset from Nest DTO (O8 — identical semantics)', () => {
    const report = mapRecruitmentReportFromDashboardDto(sampleDto({ completion_pct: null, planned_need: 0 }));
    expect(report.planned_need).toBe(0);
    expect(report.completion_pct).toBeNull();
    expect(report.funnel.onboard).toBe(4);
    expect(bindRecDashFunnelLabels(sampleDto()).cv).toBe('Hồ sơ / CV');
  });

  it('disabled aggregator never invents KH/cost (O10 / AC-09)', () => {
    expect(sumActiveJobPostingHeadcount()).toBe(0);
    expect(buildRecruitmentCostSummary().hasData).toBe(false);
  });

  it('surfaces PERIOD-400 and SCOPE-409 as Vietnamese', () => {
    expect(
      toErrorMessage(
        new ApiClientError({ status: 400, code: 'HRM-REC-DASH-PERIOD-400', message: 'x' }),
        'fallback',
      ),
    ).toMatch(/Kỳ lọc/);
    expect(
      toErrorMessage(
        new ApiClientError({ status: 409, code: 'HRM-SCOPE-409', message: 'x' }),
        'fallback',
      ),
    ).toMatch(/phạm vi/);
  });

  it('source audit — dashboard SoT uses Nest GET; no listJobPostings KH', () => {
    const hook = readFileSync(join(__dirname, '../hooks/useRecruitmentDashboard.ts'), 'utf8');
    const nestHook = readFileSync(join(__dirname, '../hooks/useRecruitmentNestDashboard.ts'), 'utf8');
    const panel = readFileSync(
      join(__dirname, '../components/recruitment/RecruitmentNestDashboardPanel.tsx'),
      'utf8',
    );
    const reports = readFileSync(join(__dirname, '../hooks/useReportsData.ts'), 'utf8');
    const page = readFileSync(join(__dirname, '../pages/Recruitment.tsx'), 'utf8');

    expect(nestHook).toMatch(/getRecruitmentDashboard/);
    expect(nestHook).not.toMatch(/from ['"]@\/integrations\/hrmApi['"].*listJobPostings|listJobPostings\(/);
    expect(hook).not.toMatch(/listJobPostings\(/);
    expect(hook).not.toMatch(/sumActiveJobPostingHeadcount/);
    expect(panel).toMatch(/RecruitmentNestDashboardPanel/);
    expect(panel).toMatch(/rec-dash-yctd-table/);
    expect(panel).not.toMatch(/formatRecruitmentCostVnd/);
    expect(reports).toMatch(/getRecruitmentDashboard/);
    expect(reports).not.toMatch(/buildRecruitmentReportFromApi\(/);
    expect(page).toMatch(/RecruitmentNestDashboardPanel/);
    expect(page).not.toMatch(/formatRecruitmentCostVnd/);
    expect(page).not.toMatch(/listJobPostings\(/);
  });
});
