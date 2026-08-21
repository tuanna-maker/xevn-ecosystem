/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Chốt Pass/Fail bắt buộc · neo recruitment_candidate_id/application_id · list filter YCTD ·
 *       toast HRM-REC-EVAL family · salary_recommendation optional · gợi ý APP-02 riêng (không auto stage)
 * Why: UC-BP-REC-06 Diễn biến #2 · O2/O5/O6/O7 · DENY pool-only as FR-06 DONE · Nest /rec dual
 * must_keep: criteria template picker · radar · history tab · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-21 PO-HRM-REC-EVAL-FEEDBACK-NEO-FE-01
 * change_mode: FIX
 * What: (1) useEffect fetch neo theo candidate.id — cấm deps object candidate (reset Textarea 1 ký tự);
 *       (2) call sites Lane A truyền list_lane=spine + recruitment_candidate_id + requisition_id
 * Why: Sponsor — nhận xét/đề xuất mất focus/value; Chốt Pass báo thiếu neo dù UV đã gắn YCTD
 * must_keep: validateRecEvalCommit · Pass|Fail only · no auto stage · U65
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Star,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { CandidateEvaluationRadarChart } from './CandidateEvaluationRadarChart';
import { useToast } from '@/hooks/use-toast';
import {
  createCandidateEvaluation,
  listCandidateEvaluations,
  listEvaluationCriteriaTemplates,
  replaceEvaluationCriteriaTemplates,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  REC_EVAL_SUCCESS_TOAST_VI,
  REC_EVAL_SUGGEST_STAGE_HINT_VI,
  resolveLaneACandidateIdForMailEval,
  validateRecEvalCommit,
} from '@/lib/recCandidateMailEval';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Evaluation criteria data structure
interface EvaluationCriterion {
  id: string;
  category: string;
  name: string;
  weight: number;
  requiredScore: number;
  actualScore: number | null;
  notes?: string;
  criterion_id?: string;
}

interface CandidateEvaluation {
  id: string;
  evaluator_name: string | null;
  total_score: number | null;
  weighted_score: number | null;
  result: string;
  overall_feedback: string | null;
  recommendation: string | null;
  created_at: string;
}

interface EvaluationCriteriaTemplate {
  id: string;
  category: string;
  name: string;
  weight: number;
  default_required_score: number;
  sort_order: number;
  is_active: boolean;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  position?: string | null;
  /** Lane A spine id when pool-enriched / YCTD-bound (FR-06 neo). */
  recruitment_candidate_id?: string | null;
  application_id?: string | null;
  list_lane?: 'pool' | 'spine' | string | null;
  requisition_id?: string | null;
  recruitment_request_id?: string | null;
}

interface CandidateEvaluationDialogProps {
  candidate: Candidate | null;
  interviewId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  /** After Pass/Fail 2xx — parent may open APP-02 transition (separate Network). */
  onSuggestStageTransition?: () => void;
}

const scoreOptions = [1, 2, 3, 4, 5];

/** History badge labels (may include legacy pending). */
const getResultConfig = (r: (key: string) => string): Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> => ({
  pending: { label: r('results.pending'), color: 'bg-xevn-neutral/15 text-xevn-textSecondary dark:bg-slate-800/50 dark:text-xevn-textMuted', icon: AlertCircle },
  pass: { label: r('results.pass'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  fail: { label: r('results.fail'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  hold: { label: r('results.hold'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
});

/** FR-06 chốt — chỉ Pass|Fail (O5 · silent pending ≠ DONE). */
const getCommitResultConfig = (r: (key: string) => string): Record<'pass' | 'fail', { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> => ({
  pass: { label: r('results.pass'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  fail: { label: r('results.fail'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
});

// Default criteria when no templates exist
const getDefaultCriteria = (r: (key: string) => string): Omit<EvaluationCriterion, 'id'>[] => [
  { category: r('defaultCriteria.appearance'), name: r('defaultCriteria.appearanceDress'), weight: 8, requiredScore: 3, actualScore: null },
  { category: r('defaultCriteria.appearance'), name: r('defaultCriteria.confidence'), weight: 8, requiredScore: 3, actualScore: null },
  { category: r('defaultCriteria.education'), name: r('defaultCriteria.educationLevel'), weight: 10, requiredScore: 3, actualScore: null },
  { category: r('defaultCriteria.experience'), name: r('defaultCriteria.workExperience'), weight: 15, requiredScore: 4, actualScore: null },
  { category: r('defaultCriteria.experience'), name: r('defaultCriteria.relevantExperience'), weight: 12, requiredScore: 4, actualScore: null },
  { category: r('defaultCriteria.knowledge'), name: r('defaultCriteria.companyKnowledge'), weight: 10, requiredScore: 3, actualScore: null },
  { category: r('defaultCriteria.skills'), name: r('defaultCriteria.communication'), weight: 12, requiredScore: 4, actualScore: null },
  { category: r('defaultCriteria.skills'), name: r('defaultCriteria.presentation'), weight: 10, requiredScore: 3, actualScore: null },
  { category: r('defaultCriteria.skills'), name: r('defaultCriteria.computerSkills'), weight: 8, requiredScore: 3, actualScore: null },
  { category: r('defaultCriteria.language'), name: r('defaultCriteria.foreignLanguage'), weight: 7, requiredScore: 3, actualScore: null },
];

export function CandidateEvaluationDialog({
  candidate,
  interviewId,
  open,
  onOpenChange,
  onSaved,
  onSuggestStageTransition,
}: CandidateEvaluationDialogProps) {
  const { t } = useTranslation();
  const r = (key: string) => t(`rc.${key}`);
  const { toast } = useToast();
  const { currentCompanyId, user } = useAuth();
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [templates, setTemplates] = useState<EvaluationCriteriaTemplate[]>([]);
  const [existingEvaluations, setExistingEvaluations] = useState<CandidateEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  /** FR-06 chốt — empty until user picks Pass|Fail (không default pending DONE). */
  const [result, setResult] = useState<string>('');
  const [overallFeedback, setOverallFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [salaryRecommendation, setSalaryRecommendation] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [activeTab, setActiveTab] = useState('evaluate');
  const [lastCommitOk, setLastCommitOk] = useState(false);
  
  // New criterion form
  const [newCriterionCategory, setNewCriterionCategory] = useState('');
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionWeight, setNewCriterionWeight] = useState(10);
  const [newCriterionRequired, setNewCriterionRequired] = useState(3);

  const resultConfig = getResultConfig(r);
  const commitResultConfig = getCommitResultConfig(r);
  const candidateId = candidate?.id?.trim() || null;
  const laneAId = candidate
    ? resolveLaneACandidateIdForMailEval({
        id: candidate.id,
        recruitment_candidate_id: candidate.recruitment_candidate_id,
        list_lane: candidate.list_lane,
        requisition_id: candidate.requisition_id,
        recruitment_request_id: candidate.recruitment_request_id,
        application_id: candidate.application_id,
      })
    : null;

  // Fetch templates + history when dialog opens / UV id đổi — KHÔNG deps cả object candidate
  // (parent inline `{ id, ... }` mỗi render → fetchData reset overallFeedback/recommendation).
  useEffect(() => {
    if (!open || !currentCompanyId || !candidateId || !candidate) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const evalQuery = laneAId
          ? {
              company_id: currentCompanyId,
              recruitment_candidate_id: laneAId,
              application_id: candidate.application_id ?? undefined,
            }
          : {
              company_id: currentCompanyId,
              candidate_id: candidate.id,
              include_legacy: true,
            };
        const [templatesRes, evaluationsRes] = await Promise.all([
          listEvaluationCriteriaTemplates(currentCompanyId),
          listCandidateEvaluations(evalQuery),
        ]);
        if (cancelled) return;
        const templatesData = (templatesRes.data ?? []) as EvaluationCriteriaTemplate[];
        const evaluationsData = (evaluationsRes.data ?? []).map((row) => ({
          id: String(row.id),
          evaluator_name: row.evaluator_name ? String(row.evaluator_name) : null,
          total_score: row.total_score != null ? Number(row.total_score) : null,
          weighted_score: row.weighted_score != null ? Number(row.weighted_score) : null,
          result: String(row.result ?? 'pending'),
          overall_feedback: row.overall_feedback ? String(row.overall_feedback) : null,
          recommendation: row.recommendation ? String(row.recommendation) : null,
          created_at: String(row.created_at ?? row.evaluated_at ?? ''),
        }));

        setTemplates(templatesData);
        setExistingEvaluations(evaluationsData);

        if (templatesData.length > 0) {
          setCriteria(
            templatesData.map((t, idx) => ({
              id: `temp-${idx}`,
              criterion_id: t.id,
              category: t.category,
              name: t.name,
              weight: Number(t.weight),
              requiredScore: t.default_required_score,
              actualScore: null,
            })),
          );
        } else {
          setCriteria(
            getDefaultCriteria(r).map((c, idx) => ({
              ...c,
              id: `temp-${idx}`,
            })),
          );
        }

        setResult('');
        setOverallFeedback('');
        setRecommendation('');
        setSalaryRecommendation('');
        setLastCommitOk(false);
        setEvaluatorName(user?.email || '');
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching evaluation data:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: stable id only
  }, [open, currentCompanyId, candidateId]);

  const fetchData = async () => {
    if (!currentCompanyId || !candidate) return;

    setLoading(true);
    try {
      const evalQuery = laneAId
        ? {
            company_id: currentCompanyId,
            recruitment_candidate_id: laneAId,
            application_id: candidate.application_id ?? undefined,
          }
        : {
            company_id: currentCompanyId,
            candidate_id: candidate.id,
            include_legacy: true,
          };
      const [templatesRes, evaluationsRes] = await Promise.all([
        listEvaluationCriteriaTemplates(currentCompanyId),
        listCandidateEvaluations(evalQuery),
      ]);
      const templatesData = (templatesRes.data ?? []) as EvaluationCriteriaTemplate[];
      const evaluationsData = (evaluationsRes.data ?? []).map((row) => ({
        id: String(row.id),
        evaluator_name: row.evaluator_name ? String(row.evaluator_name) : null,
        total_score: row.total_score != null ? Number(row.total_score) : null,
        weighted_score: row.weighted_score != null ? Number(row.weighted_score) : null,
        result: String(row.result ?? 'pending'),
        overall_feedback: row.overall_feedback ? String(row.overall_feedback) : null,
        recommendation: row.recommendation ? String(row.recommendation) : null,
        created_at: String(row.created_at ?? row.evaluated_at ?? ''),
      }));

      setTemplates(templatesData);
      setExistingEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error fetching evaluation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criterionId: string, score: number) => {
    setCriteria(prev =>
      prev.map(c =>
        c.id === criterionId ? { ...c, actualScore: score } : c
      )
    );
  };

  const handleRequiredScoreChange = (criterionId: string, score: number) => {
    setCriteria(prev =>
      prev.map(c =>
        c.id === criterionId ? { ...c, requiredScore: score } : c
      )
    );
  };

  const handleWeightChange = (criterionId: string, weight: number) => {
    setCriteria(prev =>
      prev.map(c =>
        c.id === criterionId ? { ...c, weight } : c
      )
    );
  };

  const handleRemoveCriterion = (criterionId: string) => {
    setCriteria(prev => prev.filter(c => c.id !== criterionId));
  };

  const handleAddCriterion = () => {
    if (!newCriterionCategory || !newCriterionName) {
      toast({
        title: t('common.error'),
        description: r('evalCriteriaRequired'),
        variant: 'destructive',
      });
      return;
    }

    setCriteria(prev => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        category: newCriterionCategory,
        name: newCriterionName,
        weight: newCriterionWeight,
        requiredScore: newCriterionRequired,
        actualScore: null,
      },
    ]);

    setNewCriterionCategory('');
    setNewCriterionName('');
    setNewCriterionWeight(10);
    setNewCriterionRequired(3);
  };

  // Calculate scores
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const scoredCriteria = criteria.filter(c => c.actualScore !== null);
  const totalScore = scoredCriteria.length > 0 
    ? scoredCriteria.reduce((sum, c) => sum + (c.actualScore || 0), 0) / scoredCriteria.length 
    : 0;
  const weightedScore = criteria.reduce((sum, c) => {
    if (c.actualScore === null) return sum;
    return sum + (c.actualScore * c.weight) / totalWeight;
  }, 0);

  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record<string, EvaluationCriterion[]>);

  // Prepare radar chart data
  const radarChartData = criteria.map(c => ({
    subject: c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name,
    required: c.requiredScore,
    actual: c.actualScore || 0,
    fullMark: 5,
  }));

  const handleSaveEvaluation = async () => {
    if (!currentCompanyId || !candidate) return;

    if (scoredCriteria.length === 0) {
      toast({
        title: t('common.error'),
        description: r('evalMinOneCriteria'),
        variant: 'destructive',
      });
      return;
    }

    const gate = validateRecEvalCommit({
      laneAId,
      applicationId: candidate.application_id,
      result,
    });
    if (!gate.ok) {
      toast({
        title: 'Chưa chốt được đánh giá',
        description: gate.message,
        variant: 'destructive',
      });
      return;
    }

    const salaryRaw = salaryRecommendation.replace(/\./g, '').replace(/,/g, '').trim();
    const salaryNum =
      salaryRaw.length > 0 && Number.isFinite(Number(salaryRaw)) ? Number(salaryRaw) : undefined;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        company_id: currentCompanyId,
        interview_id: interviewId ?? null,
        evaluator_name: evaluatorName || user?.email || null,
        evaluator_email: user?.email ?? null,
        total_score: totalScore,
        weighted_score: weightedScore,
        result,
        commit: true,
        overall_feedback: overallFeedback,
        recommendation,
        scores: criteria.map((c) => ({
          criterion_name: c.name,
          category: c.category,
          actual_score: c.actualScore,
          required_score: c.requiredScore,
          weight: c.weight,
          criterion_id: c.criterion_id,
        })),
      };
      if (laneAId) {
        payload.recruitment_candidate_id = laneAId;
      }
      if (candidate.application_id?.trim()) {
        payload.application_id = candidate.application_id.trim();
      }
      // Legacy pool display only when no YCTD neo — DENY claim as FR-06 DONE
      if (!laneAId && !candidate.application_id?.trim()) {
        payload.candidate_id = candidate.id;
      }
      if (typeof salaryNum === 'number') {
        payload.salary_recommendation = salaryNum;
      }

      await createCandidateEvaluation(payload);
      setLastCommitOk(true);
      toast({
        title: t('common.success'),
        description: REC_EVAL_SUCCESS_TOAST_VI,
      });

      onSaved?.();
      fetchData();
      setActiveTab('history');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: t('common.error'),
        description: toErrorMessage(error, r('evalSaveError')),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplates = async () => {
    if (!currentCompanyId) return;

    setSaving(true);
    try {
      await replaceEvaluationCriteriaTemplates(
        currentCompanyId,
        criteria.map((c, index) => ({
          category: c.category,
          name: c.name,
          weight: c.weight,
          default_required_score: c.requiredScore,
          sort_order: index,
        })),
      );
      toast({
        title: t('common.success'),
        description: r('evalTemplateSaveSuccess'),
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        title: t('common.error'),
        description: r('evalTemplateSaveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (score: number | null) => {
    if (score === null) return null;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            {r('evalDialogTitle').replace('{{name}}', candidate.full_name)}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="evaluate">{r('evalNewTab')}</TabsTrigger>
              <TabsTrigger value="history">
                {r('evalHistoryTab')} ({existingEvaluations.length})
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-1" />
                {r('evalSettingsTab')}
              </TabsTrigger>
            </TabsList>

            {/* Evaluation Tab */}
            <TabsContent value="evaluate" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Side - Evaluation Table */}
                <div className="lg:col-span-3 space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px]">{r('evalGroup')}</TableHead>
                            <TableHead>{r('evalCriteria')}</TableHead>
                            <TableHead className="text-center w-[80px]">{r('evalWeight')}</TableHead>
                            <TableHead className="text-center w-[100px]">{r('evalRequired')}</TableHead>
                            <TableHead className="text-center w-[150px]">{r('evalScore')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(groupedCriteria).map(([category, items]) => (
                            items.map((criterion, index) => (
                              <TableRow key={criterion.id} className="hover:bg-muted/30">
                                {index === 0 && (
                                  <TableCell
                                    rowSpan={items.length}
                                    className="font-medium border-r align-top pt-4 bg-muted/20 text-sm"
                                  >
                                    {category}
                                  </TableCell>
                                )}
                                <TableCell className="text-sm">{criterion.name}</TableCell>
                                <TableCell className="text-center text-sm">
                                  {criterion.weight}%
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {criterion.requiredScore}/5
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Select
                                    value={criterion.actualScore?.toString() || ''}
                                    onValueChange={(value) => handleScoreChange(criterion.id, parseInt(value))}
                                  >
                                    <SelectTrigger className="h-8 w-[110px]">
                                      <SelectValue placeholder={r('evalSelectScore')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {scoreOptions.map((score) => (
                                        <SelectItem key={score} value={score.toString()}>
                                          <div className="flex items-center gap-2">
                                            <span>{r('evalScoreLabel').replace('{{score}}', score.toString())}</span>
                                            {renderStars(score)}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            ))
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Score Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-muted-foreground">{r('evalScored')}</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {scoredCriteria.length}/{criteria.length}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-muted-foreground">{r('evalAvgScore')}</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {totalScore.toFixed(1)}/5
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-xs text-muted-foreground">{r('evalWeightedScore')}</p>
                        <p className="text-2xl font-bold text-green-600">
                          {weightedScore.toFixed(2)}/5
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Assessment */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{r('evalOverallComment')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{r('evalEvaluator')}</label>
                          <Input
                            value={evaluatorName}
                            onChange={(e) => setEvaluatorName(e.target.value)}
                            placeholder={r('evalEvaluatorPlaceholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{r('evalResult')} (Pass/Fail)</label>
                          <Select value={result || undefined} onValueChange={setResult}>
                            <SelectTrigger data-testid="rec-eval-result">
                              <SelectValue placeholder="Chọn Đạt hoặc Không đạt" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(commitResultConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="w-4 h-4" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!laneAId ? (
                            <p className="text-xs text-destructive" data-testid="rec-eval-neo-hint">
                              FR-06 yêu cầu neo UV–YCTD. Gắn YCTD trước khi chốt (pool thuần ≠ SoT).
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Neo Lane A · commit Pass/Fail · stage chỉ qua APP-02 riêng.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{r('evalFeedback')}</label>
                        <Textarea
                          value={overallFeedback}
                          onChange={(e) => setOverallFeedback(e.target.value)}
                          placeholder={r('evalFeedbackPlaceholder')}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{r('evalRecommendation')}</label>
                        <Textarea
                          value={recommendation}
                          onChange={(e) => setRecommendation(e.target.value)}
                          placeholder={r('evalRecommendationPlaceholder')}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Đề xuất lương (tuỳ chọn)</label>
                        <Input
                          data-testid="rec-eval-salary"
                          value={salaryRecommendation}
                          onChange={(e) => setSalaryRecommendation(e.target.value)}
                          placeholder="VD: 15000000"
                          inputMode="numeric"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side - Radar Chart */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">
                        {r('evalChart')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CandidateEvaluationRadarChart data={radarChartData} />
                    </CardContent>
                  </Card>

                  {lastCommitOk && onSuggestStageTransition ? (
                    <p className="text-xs text-muted-foreground" data-testid="rec-eval-stage-hint">
                      {REC_EVAL_SUGGEST_STAGE_HINT_VI}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                      >
                        {r('evalClose')}
                      </Button>
                      <Button
                        className="flex-1"
                        data-testid="rec-eval-commit"
                        onClick={handleSaveEvaluation}
                        disabled={saving || scoredCriteria.length === 0 || !result}
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Chốt Pass/Fail
                      </Button>
                    </div>
                    {lastCommitOk && onSuggestStageTransition ? (
                      <Button
                        type="button"
                        variant="secondary"
                        data-testid="rec-eval-suggest-stage"
                        onClick={() => {
                          onOpenChange(false);
                          onSuggestStageTransition();
                        }}
                      >
                        Đổi trạng thái (APP-02)
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-0">
              {existingEvaluations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{r('evalNoHistory')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingEvaluations.map((evaluation) => {
                    const resultInfo = resultConfig[evaluation.result] || resultConfig.pending;
                    return (
                      <Card key={evaluation.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={resultInfo.color}>
                                  <resultInfo.icon className="w-3 h-3 mr-1" />
                                  {resultInfo.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(evaluation.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </span>
                              </div>
                              {evaluation.evaluator_name && (
                                <p className="text-sm text-muted-foreground">
                                  {r('evalEvaluatorLabel')} {evaluation.evaluator_name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{r('evalWeightedScore')}</p>
                              <p className="text-2xl font-bold text-primary">
                                {Number(evaluation.weighted_score || 0).toFixed(2)}/5
                              </p>
                            </div>
                          </div>

                          {evaluation.overall_feedback && (
                            <div className="bg-muted/50 rounded-lg p-3 mb-2">
                              <p className="text-sm font-medium mb-1">{r('evalFeedbackLabel')}</p>
                              <p className="text-sm text-muted-foreground">{evaluation.overall_feedback}</p>
                            </div>
                          )}

                          {evaluation.recommendation && (
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-sm font-medium mb-1">{r('evalRecommendationLabel')}</p>
                              <p className="text-sm text-muted-foreground">{evaluation.recommendation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab - Manage Criteria Templates */}
            <TabsContent value="settings" className="mt-0">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{r('evalAddCriteria')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      <Input
                        placeholder={r('evalGroupPlaceholder')}
                        value={newCriterionCategory}
                        onChange={(e) => setNewCriterionCategory(e.target.value)}
                      />
                      <Input
                        placeholder={r('evalCriteriaPlaceholder')}
                        value={newCriterionName}
                        onChange={(e) => setNewCriterionName(e.target.value)}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder={r('evalWeightPlaceholder')}
                        value={newCriterionWeight}
                        onChange={(e) => setNewCriterionWeight(parseInt(e.target.value) || 0)}
                        min={1}
                        max={100}
                      />
                      <Button onClick={handleAddCriterion}>
                        <Plus className="w-4 h-4 mr-1" />
                        {r('evalAdd')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>{r('evalGroup')}</TableHead>
                          <TableHead>{r('evalCriteria')}</TableHead>
                          <TableHead className="text-center w-[100px]">{r('evalWeightPlaceholder')}</TableHead>
                          <TableHead className="text-center w-[120px]">{r('evalRequiredScore')}</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteria.map((criterion) => (
                          <TableRow key={criterion.id}>
                            <TableCell className="font-medium">{criterion.category}</TableCell>
                            <TableCell>{criterion.name}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                value={criterion.weight}
                                onChange={(e) => handleWeightChange(criterion.id, parseInt(e.target.value) || 0)}
                                className="h-8 w-16 text-center"
                                min={1}
                                max={100}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Select
                                value={criterion.requiredScore.toString()}
                                onValueChange={(value) => handleRequiredScoreChange(criterion.id, parseInt(value))}
                              >
                                <SelectTrigger className="h-8 w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {scoreOptions.map((score) => (
                                    <SelectItem key={score} value={score.toString()}>
                                      {score}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveCriterion(criterion.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {r('evalTotalWeight')} <span className={totalWeight === 100 ? 'text-green-600' : 'text-amber-600'}>
                      {totalWeight}%
                    </span>
                    {totalWeight !== 100 && ` ${r('evalShouldBe100')}`}
                  </p>
                  <Button onClick={handleSaveTemplates} disabled={saving}>
                    {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {r('evalSaveTemplate')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
