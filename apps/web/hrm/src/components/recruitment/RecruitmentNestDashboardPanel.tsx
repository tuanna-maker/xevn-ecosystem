/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → Dashboard («bao giờ đủ người»)
 * UC:         UC-BP-REC-08 · AC-REC-08-01..10 · J-HRM-REC-DASH-01
 * BR:         O1–O10 · U63/U65 FE-after-2xx+F5 · DENY Campaign · DENY cost/VND
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-08 Diễn biến §3.4
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md §7
 * Purpose:    Filter kỳ/đơn vị → bind Nest DTO KPIs/funnel/enough-people/empty_guide/YCTD table.
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    pages/Recruitment.tsx dashboard subtab
 * Callees:    useRecruitmentNestDashboard · recruitmentDashboardNestBind · RecruitmentLine/BarChart
 * FEActions:  | Đổi kỳ | sync URL + GET | bind số |
 *             | Click YCTD row | onOpenYctd(id) | J-HRM-05 detail |
 *             | empty CTA | onOpenPlans | Định biên tab |
 * Impact:     FE formula / cost invent / Campaign drill = FAIL
 * must_keep:  chrome layout parent · J-HRM-05 path · sealed REC-01/02 UF · honesty false
 * SOLID:      Presentational panel — Nest owns formulas
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock3, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RecruitmentBarChart } from '@/components/recruitment/RecruitmentBarChart';
import { RecruitmentLineChart } from '@/components/recruitment/RecruitmentLineChart';
import {
  useRecruitmentNestDashboard,
  type RecDashPeriodMode,
} from '@/hooks/useRecruitmentNestDashboard';
import {
  useHrmOperatingUnitFilter,
  type OperatingUnitFilterSelection,
} from '@/contexts/HrmOperatingUnitFilterContext';
import { yctdModeBadgeLabel } from '@/lib/jobRequisitionYctdWave2';
import {
  bindRecDashFunnelCounts,
  bindRecDashFunnelLabels,
  bindRecDashMonthChartRows,
  bindRecDashOrgUnitChartRows,
  enoughPeopleStatusLabelVi,
  formatRecDashCompletionPct,
  formatRecDashCount,
  REC_DASH_FUNNEL_KEYS,
} from '@/lib/recruitmentDashboardNestBind';
import { cn } from '@/lib/utils';
import type { HrmRecDashYctdRow } from '@/integrations/hrmApi';

const DASH_YEAR = 'dash_year';
const DASH_FROM = 'dash_from';
const DASH_TO = 'dash_to';
const DASH_MODE = 'dash_mode';

function currentYear(): number {
  return new Date().getFullYear();
}

function parseYearParam(raw: string | null): number {
  const n = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(n) || n < 2000 || n > 2100) return currentYear();
  return n;
}

export type RecruitmentNestDashboardPanelProps = {
  onOpenYctd: (requisitionId: string, companyId?: string) => void;
  onOpenPlans?: () => void;
};

export function RecruitmentNestDashboardPanel({
  onOpenYctd,
  onOpenPlans,
}: RecruitmentNestDashboardPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    showFilter,
    units,
    selectedSlug,
    setSelectedSlug,
  } = useHrmOperatingUnitFilter();

  const initialMode = (searchParams.get(DASH_MODE) === 'range' ? 'range' : 'year') as RecDashPeriodMode;
  const [mode, setMode] = useState<RecDashPeriodMode>(initialMode);
  const [year, setYear] = useState(() => parseYearParam(searchParams.get(DASH_YEAR)));
  const [from, setFrom] = useState(() => searchParams.get(DASH_FROM) || `${currentYear()}-01`);
  const [to, setTo] = useState(() => searchParams.get(DASH_TO) || `${currentYear()}-12`);

  // F5 retain filter — write query string when filters change.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set(DASH_MODE, mode);
    if (mode === 'year') {
      next.set(DASH_YEAR, String(year));
      next.delete(DASH_FROM);
      next.delete(DASH_TO);
    } else {
      next.delete(DASH_YEAR);
      next.set(DASH_FROM, from);
      next.set(DASH_TO, to);
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync on filter fields
  }, [mode, year, from, to]);

  const { data, loading, isError, companyId } = useRecruitmentNestDashboard({
    enabled: true,
    mode,
    year,
    from,
    to,
  });

  const funnelCounts = useMemo(() => bindRecDashFunnelCounts(data ?? undefined), [data]);
  const funnelLabels = useMemo(() => bindRecDashFunnelLabels(data ?? undefined), [data]);
  const monthChart = useMemo(() => bindRecDashMonthChartRows(data?.by_month), [data]);
  const orgChart = useMemo(() => bindRecDashOrgUnitChartRows(data?.by_org_unit), [data]);

  const showEmptyGuide = Boolean(data?.empty_guide) || data?.enough_people_status === 'no_plan';
  const status = data?.enough_people_status ?? '';

  const StatusIcon =
    status === 'enough'
      ? CheckCircle2
      : status === 'at_risk'
        ? AlertTriangle
        : status === 'in_progress'
          ? Clock3
          : Info;

  const onRowClick = useCallback(
    (row: HrmRecDashYctdRow) => {
      onOpenYctd(row.requisition_id, row.company_id);
    },
    [onOpenYctd],
  );

  const yearOptions = useMemo(() => {
    const y = currentYear();
    return [y - 1, y, y + 1];
  }, []);

  return (
    <div className="space-y-3" data-testid="rec-nest-dashboard-panel">
      {/* Filter axis — h-10 header pattern */}
      <div className="flex flex-wrap items-center gap-2 xevn-safe-inline">
        <div className="flex h-10 items-center gap-2">
          <Label className="text-sm text-xevn-textSecondary whitespace-nowrap">Kỳ</Label>
          <Select
            value={mode}
            onValueChange={(v) => setMode(v === 'range' ? 'range' : 'year')}
          >
            <SelectTrigger className="h-10 w-[140px]" data-testid="rec-dash-period-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Theo năm</SelectItem>
              <SelectItem value="range">Từ tháng – đến</SelectItem>
            </SelectContent>
          </Select>
          {mode === 'year' ? (
            <Select value={String(year)} onValueChange={(v) => setYear(Number.parseInt(v, 10))}>
              <SelectTrigger className="h-10 w-[110px]" data-testid="rec-dash-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <>
              <Input
                type="month"
                className="h-10 w-[150px]"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                data-testid="rec-dash-from"
              />
              <span className="text-sm text-xevn-textSecondary">→</span>
              <Input
                type="month"
                className="h-10 w-[150px]"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                data-testid="rec-dash-to"
              />
            </>
          )}
        </div>

        {showFilter && (
          <div className="flex h-10 items-center gap-2">
            <Label className="text-sm text-xevn-textSecondary whitespace-nowrap">Đơn vị</Label>
            <Select
              value={selectedSlug}
              onValueChange={(v) => setSelectedSlug(v as OperatingUnitFilterSelection)}
            >
              <SelectTrigger className="h-10 w-[220px]" data-testid="rec-dash-company">
                <SelectValue placeholder="Trong quyền" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả (trong quyền)</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.operating_slug} value={u.operating_slug}>
                    {u.display_name_vi || u.operating_slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isError && (
        <Card className="border-destructive/40 shadow-sm" data-testid="rec-dash-error">
          <CardContent className="px-4 py-3 text-sm text-destructive">
            Không hiển thị số liệu cũ — tải lại sau khi sửa kỳ lọc hoặc phạm vi đơn vị.
          </CardContent>
        </Card>
      )}

      {!isError && showEmptyGuide && data?.empty_guide && (
        <Card className="border-dashed shadow-sm" data-testid="rec-dash-empty-guide">
          <CardContent className="space-y-2 px-4 py-3">
            <p className="text-sm font-semibold text-xevn-text">{data.empty_guide.title}</p>
            <p className="text-sm text-xevn-textSecondary">{data.empty_guide.body}</p>
            {onOpenPlans && (
              <Button size="sm" variant="outline" onClick={onOpenPlans} data-testid="rec-dash-empty-cta">
                {data.empty_guide.cta_hint || 'Mở Định biên nhân sự'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI strip — Nest display-ready */}
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                { label: 'Kế hoạch (Cần tuyển)', value: formatRecDashCount(data?.planned_need), testid: 'rec-dash-planned' },
                { label: 'Đã tuyển (onboard)', value: formatRecDashCount(data?.filled_count), testid: 'rec-dash-filled' },
                { label: 'Trong pipeline', value: formatRecDashCount(data?.in_pipeline_count), testid: 'rec-dash-pipeline' },
                { label: 'Còn thiếu (gap)', value: formatRecDashCount(data?.gap_count), testid: 'rec-dash-gap' },
                {
                  label: '% hoàn thành',
                  value: loading ? '…' : formatRecDashCompletionPct(data?.completion_pct),
                  testid: 'rec-dash-pct',
                },
                { label: 'YCTD mở', value: formatRecDashCount(data?.open_yctd_count), testid: 'rec-dash-open-yctd' },
              ] as const
            ).map((k) => (
              <div key={k.label} className="relative min-w-0 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-xevn-background">
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary sm:top-2.5 sm:bottom-2.5" aria-hidden />
                <div className="pl-2">
                  <p className="line-clamp-2 text-sm font-medium leading-tight text-xevn-textSecondary">{k.label}</p>
                  <p className="text-lg font-bold tabular-nums leading-tight text-xevn-text sm:text-xl" data-testid={k.testid}>
                    {loading && !data ? '…' : isError ? '—' : k.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enough people */}
      <Card className="shadow-sm" data-testid="rec-dash-enough-people">
        <CardContent className="flex flex-wrap items-start gap-3 px-4 py-3">
          <StatusIcon
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              status === 'enough' && 'text-emerald-600',
              status === 'at_risk' && 'text-amber-600',
              status === 'in_progress' && 'text-primary',
              (status === 'no_plan' || !status) && 'text-xevn-textSecondary',
            )}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-xevn-text">
              {loading && !data ? 'Đang tải…' : enoughPeopleStatusLabelVi(status || undefined)}
            </p>
            <p className="text-sm text-xevn-textSecondary" data-testid="rec-dash-eta-label">
              {isError ? '—' : data?.enough_people_eta_label || 'Chưa xác định thời điểm đủ người'}
            </p>
          </div>
          {data?.enough_people_eta && (
            <Badge variant="secondary" className="tabular-nums" data-testid="rec-dash-eta">
              {data.enough_people_eta}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Funnel — 5 Nest keys (O4) */}
      <Card className="shadow-sm" data-testid="rec-dash-funnel">
        <CardHeader className="space-y-0 px-4 py-2.5">
          <CardTitle className="text-sm font-semibold">Phễu tuyển (Nest)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-0">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-5 sm:divide-y-0">
            {REC_DASH_FUNNEL_KEYS.map((key) => (
              <div key={key} className="relative min-w-0 px-2.5 py-2.5 sm:px-3" data-funnel-key={key}>
                <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-primary" aria-hidden />
                <p className="pl-2 text-xs font-medium text-xevn-textSecondary line-clamp-2">
                  {funnelLabels[key]}
                </p>
                <p className="pl-2 text-lg font-bold tabular-nums text-xevn-text">
                  {loading && !data ? '…' : isError ? '—' : formatRecDashCount(funnelCounts[key])}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts — BE arrays only; O10 no cost */}
      <Card className="shadow-sm">
        <CardHeader className="space-y-0 px-4 py-2 pb-0">
          <CardTitle className="text-sm font-semibold">Theo tháng (filled — Nest)</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-1 sm:px-4">
          <RecruitmentLineChart data={monthChart} loading={loading && !data} />
        </CardContent>
      </Card>

      <Card className="min-w-0 shadow-sm">
        <CardHeader className="space-y-0 px-4 py-2 pb-0">
          <CardTitle className="text-sm font-semibold">Theo đơn vị (filled — Nest)</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-2 pb-3 pt-1 sm:px-4">
          <RecruitmentBarChart data={orgChart} loading={loading && !data} />
        </CardContent>
      </Card>

      {/* YCTD drill — DENY Campaign */}
      <Card className="shadow-sm" data-testid="rec-dash-yctd-table">
        <CardHeader className="space-y-0 px-4 py-2">
          <CardTitle className="text-sm font-semibold">Khoan YCTD</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {loading && !data ? (
            <p className="px-4 py-6 text-center text-sm text-xevn-textSecondary">Đang tải…</p>
          ) : isError ? (
            <p className="px-4 py-6 text-center text-sm text-xevn-textSecondary">—</p>
          ) : !(data?.by_yctd?.length) ? (
            <p className="px-4 py-6 text-center text-sm text-xevn-textSecondary">Không có YCTD trong kỳ/phạm vi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xevn-textSecondary">
                    <th className="px-4 py-2 font-medium">Tiêu đề</th>
                    <th className="px-2 py-2 font-medium">Trạng thái</th>
                    <th className="px-2 py-2 font-medium">Mode</th>
                    <th className="px-2 py-2 font-medium tabular-nums">HC</th>
                    <th className="px-2 py-2 font-medium tabular-nums">Filled</th>
                    <th className="px-2 py-2 font-medium tabular-nums">Pipeline</th>
                    <th className="px-2 py-2 font-medium">Tháng đích</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_yctd.map((row) => (
                    <tr
                      key={row.requisition_id}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                      onClick={() => onRowClick(row)}
                      data-testid={`rec-dash-yctd-row-${row.requisition_id}`}
                    >
                      <td className="px-4 py-2 font-medium text-primary underline-offset-2 hover:underline">
                        {row.title || row.requisition_id}
                      </td>
                      <td className="px-2 py-2">{row.status}</td>
                      <td className="px-2 py-2">
                        <span className="inline-flex items-center gap-1">
                          {yctdModeBadgeLabel(row.headcount_mode, row.mode_warn)}
                          {row.mode_warn ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-label="Chưa phân loại" />
                          ) : null}
                        </span>
                      </td>
                      <td className="px-2 py-2 tabular-nums">{row.headcount}</td>
                      <td className="px-2 py-2 tabular-nums">{row.filled_count}</td>
                      <td className="px-2 py-2 tabular-nums">{row.in_pipeline_count}</td>
                      <td className="px-2 py-2 tabular-nums">{row.target_month ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
