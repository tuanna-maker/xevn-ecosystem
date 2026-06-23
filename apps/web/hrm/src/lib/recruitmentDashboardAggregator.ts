import { format, startOfMonth, subMonths } from 'date-fns';
import type { HrmCandidateApplicationRow, HrmJobPostingRow } from '@/integrations/hrmApi';

export const RECRUITMENT_CHART_COLORS = ['#f59e0b', '#22c55e', '#8b5cf6', '#06b6d4', '#6366f1', '#ec4899', '#84cc16', '#ef4444'];

export const RECRUITMENT_DEPT_FALLBACK = 'Khác';

export interface RecruitmentDashboardCandidateInput {
  id: string;
  appliedDate: string;
  source?: string | null;
}

export interface RecruitmentBarChartRow {
  name: string;
  value: number;
  color: string;
}

export interface RecruitmentLineChartRow {
  month: string;
  value: number;
}

export interface RecruitmentCostSummary {
  avgCostPerCandidate: number | null;
  costTopCV: number | null;
  cost24h: number | null;
  hasData: boolean;
}

export function buildJobPostingDepartmentMap(jobPostings: HrmJobPostingRow[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const posting of jobPostings) {
    const dept = posting.department?.trim();
    if (dept) map.set(posting.id, dept);
  }
  return map;
}

export function buildJobPostingCompanySlugMap(jobPostings: HrmJobPostingRow[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const posting of jobPostings) {
    const slug = posting.company_id?.trim();
    if (slug) map.set(posting.id, slug);
  }
  return map;
}

export function buildCandidateDepartmentMap(
  applications: HrmCandidateApplicationRow[],
  jobPostings: HrmJobPostingRow[],
): Map<string, string> {
  const deptByJobId = buildJobPostingDepartmentMap(jobPostings);
  const map = new Map<string, string>();
  for (const app of applications) {
    if (map.has(app.candidate_id)) continue;
    const dept = deptByJobId.get(app.job_posting_id);
    if (dept) map.set(app.candidate_id, dept);
  }
  return map;
}

export function buildCandidateCompanySlugMap(
  applications: HrmCandidateApplicationRow[],
  jobPostings: HrmJobPostingRow[],
): Map<string, string> {
  const slugByJobId = buildJobPostingCompanySlugMap(jobPostings);
  const map = new Map<string, string>();
  for (const app of applications) {
    if (map.has(app.candidate_id)) continue;
    const slug = slugByJobId.get(app.job_posting_id);
    if (slug) map.set(app.candidate_id, slug);
  }
  return map;
}

export function resolveRecruitmentChartLabel(
  candidateId: string,
  departmentByCandidateId?: Map<string, string>,
  companySlugByCandidateId?: Map<string, string>,
  operatingUnitLabels?: Map<string, string>,
  catalogDepartmentNames?: string[],
): string {
  const dept = normalizeDepartmentName(
    departmentByCandidateId?.get(candidateId),
    catalogDepartmentNames,
  );
  if (dept !== RECRUITMENT_DEPT_FALLBACK) return dept;

  const slug = companySlugByCandidateId?.get(candidateId);
  if (slug && operatingUnitLabels?.get(slug)) {
    return operatingUnitLabels.get(slug)!;
  }

  return RECRUITMENT_DEPT_FALLBACK;
}

export function normalizeDepartmentName(
  raw: string | undefined | null,
  catalogDepartmentNames?: string[],
): string {
  const trimmed = raw?.trim();
  if (!trimmed) return RECRUITMENT_DEPT_FALLBACK;
  if (!catalogDepartmentNames?.length) return trimmed;
  const match = catalogDepartmentNames.find((name) => name.toLowerCase() === trimmed.toLowerCase());
  return match ?? trimmed;
}

export function aggregateCandidatesByDepartment(
  candidates: RecruitmentDashboardCandidateInput[],
  departmentByCandidateId?: Map<string, string>,
  catalogDepartmentNames?: string[],
  companySlugByCandidateId?: Map<string, string>,
  operatingUnitLabels?: Map<string, string>,
): RecruitmentBarChartRow[] {
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    const label = resolveRecruitmentChartLabel(
      candidate.id,
      departmentByCandidateId,
      companySlugByCandidateId,
      operatingUnitLabels,
      catalogDepartmentNames,
    );
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      color: RECRUITMENT_CHART_COLORS[index % RECRUITMENT_CHART_COLORS.length],
    }));
}

export function aggregateCandidatesByAppliedMonth(
  candidates: RecruitmentDashboardCandidateInput[],
  referenceDate = new Date(),
  monthCount = 12,
): RecruitmentLineChartRow[] {
  const monthBuckets: { key: string; label: string }[] = [];
  const anchor = startOfMonth(referenceDate);

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const monthDate = subMonths(anchor, offset);
    monthBuckets.push({
      key: format(monthDate, 'yyyy-MM'),
      label: format(monthDate, 'MM/yyyy'),
    });
  }

  const counts = new Map(monthBuckets.map((bucket) => [bucket.key, 0]));
  for (const candidate of candidates) {
    const monthKey = candidate.appliedDate?.slice(0, 7);
    if (!monthKey || !counts.has(monthKey)) continue;
    counts.set(monthKey, (counts.get(monthKey) ?? 0) + 1);
  }

  return monthBuckets.map((bucket) => ({
    month: bucket.label,
    value: counts.get(bucket.key) ?? 0,
  }));
}

/** No recruitment cost API yet — never invent VND amounts. */
export function buildRecruitmentCostSummary(
  _candidates: RecruitmentDashboardCandidateInput[],
): RecruitmentCostSummary {
  return {
    avgCostPerCandidate: null,
    costTopCV: null,
    cost24h: null,
    hasData: false,
  };
}

export function sumActiveJobPostingHeadcount(jobPostings: HrmJobPostingRow[]): number {
  return jobPostings
    .filter((posting) => posting.status === 'active' || posting.status === 'open')
    .reduce((sum, posting) => sum + Math.max(0, posting.headcount ?? 0), 0);
}

export function formatRecruitmentCostVnd(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return `${Math.round(value).toLocaleString('vi-VN')} đ`;
}
