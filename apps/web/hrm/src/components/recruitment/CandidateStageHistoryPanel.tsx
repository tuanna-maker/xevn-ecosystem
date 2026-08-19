/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Timeline lịch sử trạng thái UV–YCTD
 * UC:         UC-BP-REC-05 · AC-REC-05-03/08 · ALT-06
 * BR:         BR-BP-CV-02 · VAL-REC-STG-21 display-ready (cấm FE invent SoT)
 * SRS:        FR-UC-BP-REC-05 Diễn biến #2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md F-REC-APP-02-TL
 * Purpose:    GET …/candidates/:id/stage-history — hiển thị from→to + note + changed_at; F5 còn vết.
 * WorkItem:   PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidateDetailView
 * Callees:    listRecruitmentCandidateStageHistory · resolveLaneACandidateIdForTransition
 * must_keep:  /recruitment/ path · retired keys visible · empty 200 OK · U65 · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md
 */
import { useCallback, useEffect, useState } from 'react';
import { History, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  listRecruitmentCandidateStageHistory,
  type HrmCandidateStageHistoryItem,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import {
  formatStageHistoryChangedAt,
  REC_STAGE_TIMELINE_EMPTY_VI,
  resolveLaneACandidateIdForTransition,
  type RecStageTransitionCandidate,
} from '@/lib/recCandidateStageTransition';
import { normalizeRequisitionId } from '@/lib/candidateUvYctdUi';

export type CandidateStageHistoryPanelProps = {
  candidate: RecStageTransitionCandidate;
  /** Bump to force reload after transition 2xx. */
  refreshToken?: number;
};

export function CandidateStageHistoryPanel({
  candidate,
  refreshToken = 0,
}: CandidateStageHistoryPanelProps) {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { stageDisplayLabel } = useRecPipelineStagesEffective();
  const [items, setItems] = useState<HrmCandidateStageHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const laneAId = resolveLaneACandidateIdForTransition(candidate);
  const requisitionId =
    normalizeRequisitionId(candidate.requisition_id) ||
    normalizeRequisitionId(candidate.recruitment_request_id);

  const load = useCallback(async () => {
    if (!currentCompanyId || !laneAId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await listRecruitmentCandidateStageHistory(laneAId, currentCompanyId, {
        requisition_id: requisitionId || undefined,
        limit: 100,
      });
      setItems(res.items);
    } catch (error: unknown) {
      setItems([]);
      toast({
        title: 'Không tải được lịch sử trạng thái',
        description: toErrorMessage(error, 'GET stage-history thất bại'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, laneAId, requisitionId, toast]);

  useEffect(() => {
    void load();
  }, [load, refreshToken]);

  if (!laneAId) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="rec-stage-history-no-lane-a">
        Timeline chỉ áp dụng cho liên kết UV gắn YCTD (Lane A).
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="rec-stage-history-panel">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="h-4 w-4" />
          Lịch sử trạng thái (UV–YCTD)
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="rec-stage-history-refresh"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-1">Tải lại</span>
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải timeline…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4" data-testid="rec-stage-history-empty">
          {REC_STAGE_TIMELINE_EMPTY_VI}
        </p>
      ) : (
        <ol className="space-y-3 border-l border-xevn-border pl-4">
          {items.map((row) => (
            <li
              key={row.id}
              className="relative space-y-1"
              data-testid="rec-stage-history-row"
              data-history-id={row.id}
            >
              <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">
                  {stageDisplayLabel(row.from_stage, row.from_stage) || '—'}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge className="bg-primary/10 text-primary">
                  {stageDisplayLabel(row.to_stage, row.to_stage)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatStageHistoryChangedAt(row.changed_at)}
                {row.changed_by ? ` · ${row.changed_by}` : ''}
              </p>
              {row.note?.trim() ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">{row.note.trim()}</p>
              ) : null}
              {typeof row.desired_salary === 'number' && Number.isFinite(row.desired_salary) ? (
                <p className="text-xs text-muted-foreground">
                  Mức mong muốn:{' '}
                  {row.desired_salary.toLocaleString('vi-VN')}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
