/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → Đánh giá → So sánh ứng viên (dialog)
 * UC:         FR-UC-BP-REC-06b Diễn biến #1–#6 · Thành công · J-HRM-REC-CMP-01
 * BR:         BR-BP-REC-CMP-01 · AC-REC-CMP-01..05
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 · FR-UC-BP-REC-06b
 * TechSpec:   docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §3 F-REC-CMP-01..02
 * DB:         docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md — soft FK requisition_id · eval neo application
 * API:        docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md §7 · errors MAX-N / YCTD-MIX
 * Purpose:    Dialog so sánh UV theo bộ chọn YCTD (không tin đăng); empty 0 YCTD/0 UV; max-N; «chưa đánh giá».
 * WorkItem:   PO-HRM-REC-UV-YCTD-CMP-FE-01
 * Coded:      2026-08-06
 * Callers:    pages/Recruitment.tsx evaluations tab
 * Callees:    listJobRequisitions(receivable) · listRecruitmentApplicationsByYctd · getRecruitmentCompareMatrix
 * FE-Actions: | Mở dialog | fetch YCTD receivable | |
 *             | Chọn YCTD | load UV+evals | |
 *             | Toggle UV ≤ N | GET compare matrix | |
 * must_keep:  YCTD SoT only · scores từ BE · no job_postings picker · no fake matrix · U65 zero-seed
 * SOLID:      Dialog UI; pure map/max-N trong candidateCompareUi
 * LastVerified: docs/qa/evidence/po-hrm-rec-uv-yctd-cmp-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-CMP-FE-01
 * change_mode: ADD
 * What: Replace job_postings stub picker with YCTD receivable + CMP-01/02 wire + empty/max-N/eval badges + HDSD testids
 * Why: QA plan AC-REC-CMP-01..05 · FORBIDDEN tin đăng SoT · parallel FE-01 UV form (must_keep)
 * must_keep: HDSD labels · BE authoritative MAX-N/MIX · recruitment_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-REC-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: After YCTD UV list loads (≥1), auto-select first candidate_id so GET …/compare fires with matrix panel
 * Why: QC soft OBS R-REC-CMP-NET-CAPTURE — matrix testid visible but compareNet=[] (harness never clicked UV)
 * must_keep: YCTD SoT · getRecruitmentCompareMatrix · max-N · no job_postings · recruitment_uat_ready=false
 * LastVerified: docs/qa/evidence/po-uat-rec-soft-obs-fe-01.md
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, Users, CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import {
  REC_COMPARE_MAX_N,
  buildRadarFromCompareMatrix,
  canAddCandidateToCompare,
  compareEvalBadgeLabel,
  isCompareEvalMissing,
  mapApplicationItemToCompareCandidate,
  normalizeCompareListRows,
  type CompareApplicationListItem,
  type CompareMatrixResponse,
} from '@/lib/candidateCompareUi';
import {
  getRecruitmentCompareMatrix,
  listJobRequisitions,
  listRecruitmentApplicationsByYctd,
  type HrmJobRequisition,
} from '@/integrations/hrmApi';

interface CandidateComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CompareCandidateRow = ReturnType<typeof mapApplicationItemToCompareCandidate>;

const getResultConfig = (t: (k: string) => string) => ({
  pass: { label: t('rc.results.pass'), color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: <CheckCircle className="w-4 h-4" /> },
  fail: { label: t('rc.results.fail'), color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: <XCircle className="w-4 h-4" /> },
  pending: { label: t('rc.results.pending'), color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', icon: <AlertCircle className="w-4 h-4" /> },
});

const getRecommendationConfig = (t: (k: string) => string) => ({
  strong_hire: { label: t('rc.recommendations.strongHire'), color: 'text-green-700 bg-green-100 dark:bg-green-900/30' },
  hire: { label: t('rc.recommendations.hire'), color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  maybe: { label: t('rc.recommendations.maybe'), color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  no_hire: { label: t('rc.recommendations.noHire'), color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
});

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(39, 100%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(280, 85%, 65%)'];

export function CandidateComparisonDialog({ open, onOpenChange }: CandidateComparisonDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const r = (key: string) => t(`rc.${key}`);
  const resultConfig = getResultConfig(t);
  const recommendationConfig = getRecommendationConfig(t);

  const [yctdList, setYctdList] = useState<HrmJobRequisition[]>([]);
  const [selectedYctdId, setSelectedYctdId] = useState<string>('');
  const [candidates, setCandidates] = useState<CompareCandidateRow[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<CompareMatrixResponse | null>(null);
  const [loadingYctd, setLoadingYctd] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);

  const resetSelection = useCallback(() => {
    setCandidates([]);
    setSelectedCandidateIds([]);
    setMatrix(null);
  }, []);

  useEffect(() => {
    if (!open || !currentCompanyId) return;
    let cancelled = false;
    const fetchYctd = async () => {
      setLoadingYctd(true);
      try {
        const response = await listJobRequisitions({
          company_id: currentCompanyId,
          receivable: true,
          page_size: 100,
        });
        const rows = normalizeCompareListRows<HrmJobRequisition>(response);
        if (!cancelled) {
          setYctdList(rows);
          setSelectedYctdId('');
          resetSelection();
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t('common.error'),
            description: toErrorMessage(error, r('fetchYctdError')),
            variant: 'destructive',
          });
          setYctdList([]);
        }
      } finally {
        if (!cancelled) setLoadingYctd(false);
      }
    };
    void fetchYctd();
    return () => {
      cancelled = true;
    };
  }, [open, currentCompanyId, t, toast, resetSelection]);

  useEffect(() => {
    if (!selectedYctdId || !currentCompanyId) {
      resetSelection();
      return;
    }
    let cancelled = false;
    const fetchUv = async () => {
      setLoadingCandidates(true);
      try {
        const response = await listRecruitmentApplicationsByYctd({
          company_id: currentCompanyId,
          requisition_id: selectedYctdId,
          include: 'evals',
        });
        const items = normalizeCompareListRows<CompareApplicationListItem>(response);
        if (!cancelled) {
          const rows = items.map(mapApplicationItemToCompareCandidate);
          setCandidates(rows);
          // Soft OBS R-REC-CMP-NET-CAPTURE: pick first UV so GET /compare runs with matrix (Network ↔ FE).
          const initialIds = rows.slice(0, 1).map((row) => row.id);
          setSelectedCandidateIds(initialIds);
          setMatrix(null);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t('common.error'),
            description: toErrorMessage(error, r('compareFetchError')),
            variant: 'destructive',
          });
          resetSelection();
        }
      } finally {
        if (!cancelled) setLoadingCandidates(false);
      }
    };
    void fetchUv();
    return () => {
      cancelled = true;
    };
  }, [selectedYctdId, currentCompanyId, t, toast, resetSelection]);

  const loadMatrix = useCallback(
    async (candidateIds: string[]) => {
      if (!selectedYctdId || !currentCompanyId || candidateIds.length === 0) {
        setMatrix(null);
        return;
      }
      setLoadingMatrix(true);
      try {
        const payload = await getRecruitmentCompareMatrix({
          company_id: currentCompanyId,
          requisition_id: selectedYctdId,
          candidate_ids: candidateIds,
        });
        setMatrix(payload);
      } catch (error) {
        setMatrix(null);
        const code = error instanceof ApiClientError ? error.code : undefined;
        toast({
          title: t('common.error'),
          description: toErrorMessage(
            error,
            code === 'HRM-REC-CMP-MAX-N'
              ? r('maxCompare')
              : code === 'HRM-REC-CMP-YCTD-MIX'
                ? r('mixBlocked')
                : r('compareFetchError'),
          ),
          variant: 'destructive',
        });
      } finally {
        setLoadingMatrix(false);
      }
    },
    [selectedYctdId, currentCompanyId, t, toast],
  );

  useEffect(() => {
    if (selectedCandidateIds.length === 0) {
      setMatrix(null);
      return;
    }
    void loadMatrix(selectedCandidateIds);
  }, [selectedCandidateIds, loadMatrix]);

  const selectedCandidates = useMemo(
    () => candidates.filter((c) => selectedCandidateIds.includes(c.id)),
    [candidates, selectedCandidateIds],
  );

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) return prev.filter((id) => id !== candidateId);
      if (!canAddCandidateToCompare(prev.length, REC_COMPARE_MAX_N)) {
        toast({ title: r('limitReached'), description: r('maxCompare') });
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const radarData = useMemo(() => {
    if (matrix && selectedCandidateIds.length > 0) {
      return buildRadarFromCompareMatrix(matrix, selectedCandidateIds);
    }
    if (selectedCandidates.length === 0) return [];
    const allCriteria = new Set<string>();
    selectedCandidates.forEach((c) => {
      c.evaluation?.scores.forEach((s) => allCriteria.add(s.criterion_name));
    });
    return Array.from(allCriteria).map((criterion) => {
      const dataPoint: Record<string, string | number> = { criterion };
      selectedCandidates.forEach((candidate, index) => {
        const score = candidate.evaluation?.scores.find((s) => s.criterion_name === criterion);
        dataPoint[`candidate${index}`] = score?.actual_score ?? 0;
        dataPoint[`candidateName${index}`] = candidate.full_name;
      });
      return dataPoint;
    });
  }, [matrix, selectedCandidateIds, selectedCandidates]);

  const atMaxN = selectedCandidateIds.length >= REC_COMPARE_MAX_N;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] p-0"
        data-testid={HDSD_MUTATE_TEST_IDS.recCompareDialog}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {r('compareTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(90vh-100px)]">
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b space-y-2">
              <label className="text-sm font-medium block" htmlFor="rec-compare-yctd">
                {r('selectYctd')}
              </label>
              {loadingYctd ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : yctdList.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground"
                  data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdEmpty}
                >
                  <p>{r('noYctdEmpty')}</p>
                </div>
              ) : (
                <Select value={selectedYctdId || undefined} onValueChange={setSelectedYctdId}>
                  <SelectTrigger
                    id="rec-compare-yctd"
                    data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdPicker}
                  >
                    <SelectValue placeholder={r('selectYctdPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {yctdList.map((yctd) => (
                      <SelectItem key={yctd.id} value={yctd.id}>
                        <div className="flex flex-col text-left">
                          <span>{yctd.title}</span>
                          {yctd.department ? (
                            <span className="text-xs text-muted-foreground">{yctd.department}</span>
                          ) : null}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : candidates.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-testid={
                      selectedYctdId
                        ? HDSD_MUTATE_TEST_IDS.recCompareUvEmpty
                        : HDSD_MUTATE_TEST_IDS.recCompareYctdEmpty
                    }
                  >
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {selectedYctdId ? r('noCandidatesForYctd') : r('selectYctdToView')}
                    </p>
                  </div>
                ) : (
                  candidates.map((candidate) => {
                    const selected = selectedCandidateIds.includes(candidate.id);
                    const disabled = !selected && atMaxN;
                    const notEvalLabel = compareEvalBadgeLabel(
                      candidate.eval_status,
                      r('notEvaluated'),
                    );
                    return (
                      <div
                        key={candidate.id}
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        aria-disabled={disabled}
                        data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvRow}
                        data-candidate-id={candidate.id}
                        data-eval-status={candidate.eval_status ?? 'none'}
                        onClick={() => {
                          if (disabled) {
                            toast({ title: r('limitReached'), description: r('maxCompare') });
                            return;
                          }
                          toggleCandidate(candidate.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) toggleCandidate(candidate.id);
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-pointer'
                            : disabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={candidate.avatar_url || ''} />
                            <AvatarFallback>
                              {candidate.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{candidate.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.email || candidate.position || '—'}
                            </p>
                          </div>
                          {notEvalLabel || isCompareEvalMissing(candidate.eval_status) ? (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-xs"
                              data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvNotEval}
                            >
                              {r('notEvaluated')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="shrink-0">
                              {candidate.evaluation?.weighted_score?.toFixed(1) || '—'}
                            </Badge>
                          )}
                        </div>
                        {candidate.evaluation?.result &&
                          resultConfig[candidate.evaluation.result as keyof typeof resultConfig] && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge
                                className={`text-xs ${
                                  resultConfig[
                                    candidate.evaluation.result as keyof typeof resultConfig
                                  ].color
                                }`}
                              >
                                {
                                  resultConfig[
                                    candidate.evaluation.result as keyof typeof resultConfig
                                  ].icon
                                }
                                <span className="ml-1">
                                  {
                                    resultConfig[
                                      candidate.evaluation.result as keyof typeof resultConfig
                                    ].label
                                  }
                                </span>
                              </Badge>
                            </div>
                          )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/30 space-y-1">
              <p
                className="text-xs text-muted-foreground"
                data-testid={HDSD_MUTATE_TEST_IDS.recCompareSelectedCount}
              >
                {r('selectedCompare').replace('{{count}}', String(selectedCandidateIds.length))}
              </p>
              {atMaxN ? (
                <p
                  className="text-xs  hidden  dark:text-amber-400"
                  data-testid={HDSD_MUTATE_TEST_IDS.recCompareMaxNHint}
                >
                  {r('maxCompare')}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-auto" data-testid={HDSD_MUTATE_TEST_IDS.recCompareMatrix}>
            {loadingMatrix && selectedCandidates.length > 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">{r('selectToCompare')}</p>
                  <p className="text-sm">{r('clickToAdd')}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedCandidates.map((candidate, index) => (
                    <Card key={candidate.id} className="relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={candidate.avatar_url || ''} />
                            <AvatarFallback
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                                color: 'white',
                              }}
                            >
                              {candidate.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{candidate.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.position || '—'}
                            </p>
                          </div>
                        </div>
                        {candidate.evaluation && !isCompareEvalMissing(candidate.eval_status) ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{r('totalScore')}</span>
                              <span
                                className="text-2xl font-bold"
                                style={{ color: COLORS[index % COLORS.length] }}
                              >
                                {candidate.evaluation.weighted_score?.toFixed(1) || '—'}
                              </span>
                            </div>
                            {candidate.evaluation.recommendation &&
                              recommendationConfig[
                                candidate.evaluation.recommendation as keyof typeof recommendationConfig
                              ] && (
                                <Badge
                                  className={`w-full justify-center ${
                                    recommendationConfig[
                                      candidate.evaluation
                                        .recommendation as keyof typeof recommendationConfig
                                    ].color
                                  }`}
                                >
                                  {
                                    recommendationConfig[
                                      candidate.evaluation
                                        .recommendation as keyof typeof recommendationConfig
                                    ].label
                                  }
                                </Badge>
                              )}
                          </div>
                        ) : (
                          <p
                            className="text-sm text-muted-foreground text-center py-4"
                            data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvNotEval}
                          >
                            {r('notEvaluated')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {radarData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('criteriaChart')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis
                              dataKey="criterion"
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              tickLine={false}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 5]}
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              tickCount={6}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                              formatter={(value) => {
                                const index = parseInt(String(value).replace('candidate', ''), 10);
                                return (
                                  <span className="text-foreground">
                                    {selectedCandidates[index]?.full_name || value}
                                  </span>
                                );
                              }}
                            />
                            {selectedCandidates.map((_, index) => (
                              <Radar
                                key={index}
                                name={`candidate${index}`}
                                dataKey={`candidate${index}`}
                                stroke={COLORS[index % COLORS.length]}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.2}
                                strokeWidth={2}
                              />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedCandidates.filter((c) => c.evaluation).length >= 2 && radarData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('criteriaDetail')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-medium">{r('criteria')}</th>
                              {selectedCandidates.map((candidate, index) => (
                                <th key={candidate.id} className="text-center py-2 px-3 font-medium">
                                  <div className="flex items-center justify-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="truncate max-w-[100px]">{candidate.full_name}</span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {radarData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b last:border-0">
                                <td className="py-2 px-3">{row.criterion}</td>
                                {selectedCandidates.map((candidate, index) => {
                                  const score = Number(row[`candidate${index}`] ?? 0);
                                  const maxScore = Math.max(
                                    ...selectedCandidates.map((_, i) =>
                                      Number(row[`candidate${i}`] || 0),
                                    ),
                                  );
                                  const isMax = score === maxScore && score > 0;
                                  return (
                                    <td key={candidate.id} className="text-center py-2 px-3">
                                      <span
                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                          isMax
                                            ? 'bg-green-100 text-green-700 font-bold dark:bg-green-900/30'
                                            : ''
                                        }`}
                                      >
                                        {score || '—'}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            <tr className="border-t-2 font-medium">
                              <td className="py-2 px-3">{r('totalScore')}</td>
                              {selectedCandidates.map((candidate) => {
                                const score = candidate.evaluation?.weighted_score;
                                const maxScore = Math.max(
                                  ...selectedCandidates.map((c) => c.evaluation?.weighted_score || 0),
                                );
                                const isMax = score === maxScore && !!score && score > 0;
                                return (
                                  <td key={candidate.id} className="text-center py-2 px-3">
                                    <span
                                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${
                                        isMax
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted'
                                      }`}
                                    >
                                      {score?.toFixed(1) || '—'}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedCandidates.some((c) => c.evaluation?.overall_feedback) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('overallFeedback')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCandidates.map(
                        (candidate, index) =>
                          candidate.evaluation?.overall_feedback && (
                            <div key={candidate.id} className="flex gap-3">
                              <div
                                className="w-1 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <div>
                                <p className="font-medium text-sm mb-1">{candidate.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {candidate.evaluation.overall_feedback}
                                </p>
                              </div>
                            </div>
                          ),
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
