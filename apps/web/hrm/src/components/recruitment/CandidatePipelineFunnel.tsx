/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Dashboard / Board funnel strip
 * UC:         UC-HRM-RC-09 · UC-HRM-REC-WF-05
 * BR:         BR-CD-F6-03 · BR-DQ-01
 * SRS:        docs/hrm/SRS.md §14 UC-HRM-30 · §16.5 delta
 * TechSpec:   docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §6.3 AC-CD-F6-03
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2.1
 * Purpose:    Render 6-column candidate pipeline from API-derived counts (post-WF sync).
 * WorkItem:   CD-FB-09-RECRUIT · XHRM-REC-WF-FE-01
 * Coded:      2026-07-19
 *
 * Callers:
 *   - pages/Recruitment.tsx (dashboard)
 *
 * Callees:
 *   - lib/recruitmentFunnel.ts
 *
 * FE-Actions:
 *   | Click stage column | onStageClick?.(stage) | navigate/filter candidates |
 *
 * Impact:     Fake numbers violate BR-DQ-01
 * must_keep:  Always show all 6 columns; empty = 0 not hide; F6 enum unchanged
 * SOLID:      Presentational — counts injected by parent
 * LastVerified: recruitmentFunnel.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-FE-01
 * Bind funnel chips to API stage after WF sync; columns still AC-CD-F6-*.
 */

import { cn } from '@/lib/utils';
import {
  RECRUITMENT_FUNNEL_LABEL_VI,
  RECRUITMENT_FUNNEL_STAGES,
  type RecruitmentFunnelCounts,
  type RecruitmentFunnelStage,
} from '@/lib/recruitmentFunnel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * @CODE-MEMORY-CHANGE 2026-07-22 XEVN-THM-FE-W1-DENSITY-01
 * change_mode: UPGRADE
 * What: STAGE_TINT rainbow → xevn/primary neutral (ops density)
 * Why: C1 density · L-OPS; không đổi 6 cột funnel / counts API
 * must_keep: Always show all 6 columns; empty = 0
 */
const STAGE_TINT: Record<RecruitmentFunnelStage, { bar: string; tint: string; value: string }> = {
  new: { bar: 'bg-xevn-neutral', tint: 'bg-xevn-neutral/10', value: 'text-xevn-text' },
  screening: { bar: 'bg-primary', tint: 'bg-primary/[0.06]', value: 'text-xevn-text' },
  interview: { bar: 'bg-primary', tint: 'bg-primary/[0.06]', value: 'text-xevn-text' },
  offer: { bar: 'bg-primary', tint: 'bg-primary/[0.06]', value: 'text-xevn-text' },
  hired: { bar: 'bg-primary', tint: 'bg-primary/[0.06]', value: 'text-xevn-text' },
  rejected: { bar: 'bg-xevn-neutral', tint: 'bg-xevn-neutral/10', value: 'text-xevn-textSecondary' },
};

export interface CandidatePipelineFunnelProps {
  counts: RecruitmentFunnelCounts;
  loading?: boolean;
  title?: string;
  onStageClick?: (stage: RecruitmentFunnelStage) => void;
  className?: string;
}

export function CandidatePipelineFunnel({
  counts,
  loading = false,
  title = 'Pipeline ứng viên',
  onStageClick,
  className,
}: CandidatePipelineFunnelProps) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-2.5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <span className="text-xs tabular-nums text-muted-foreground">
          Tổng: {loading ? '…' : counts.total}
        </span>
      </CardHeader>
      <CardContent className="p-0 pb-0">
        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          {RECRUITMENT_FUNNEL_STAGES.map((stage) => {
            const tint = STAGE_TINT[stage];
            const value = counts[stage];
            const interactive = Boolean(onStageClick);
            const Tag = interactive ? 'button' : 'div';
            return (
              <Tag
                key={stage}
                type={interactive ? 'button' : undefined}
                onClick={interactive ? () => onStageClick?.(stage) : undefined}
                className={cn(
                  'relative min-w-0 px-2.5 py-2.5 text-left sm:px-3',
                  tint.tint,
                  interactive && 'transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                )}
                data-funnel-stage={stage}
              >
                <span
                  className={cn('absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full', tint.bar)}
                  aria-hidden
                />
                <div className="pl-2">
                  <p className="line-clamp-2 text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs">
                    {RECRUITMENT_FUNNEL_LABEL_VI[stage]}
                  </p>
                  <p className={cn('text-lg font-bold tabular-nums leading-tight sm:text-xl', tint.value)}>
                    {loading ? '—' : value}
                  </p>
                </div>
              </Tag>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
