import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { deleteCandidateEvaluation, listCandidateEvaluations } from '@/integrations/hrmApi';
import { isAbortLikeError, toErrorMessage } from '@/lib/apiError';

interface EvaluationScore {
  criterion_name: string;
  category: string;
  actual_score: number | null;
  required_score: number;
  weight: number;
}

export interface CandidateEvaluation {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_avatar: string | null;
  candidate_position: string | null;
  evaluator_name: string | null;
  evaluator_email: string | null;
  total_score: number | null;
  weighted_score: number | null;
  result: 'pending' | 'pass' | 'fail' | 'hold';
  overall_feedback: string | null;
  recommendation: string | null;
  interview_id: string | null;
  created_at: string;
  scores: EvaluationScore[];
}

function mapEvaluation(row: Record<string, unknown>): CandidateEvaluation {
  const scores = Array.isArray(row.scores) ? (row.scores as EvaluationScore[]) : [];
  return {
    id: String(row.id),
    candidate_id: String(row.candidate_id),
    candidate_name: String(row.candidate_name ?? ''),
    candidate_email: String(row.candidate_email ?? ''),
    candidate_avatar: null,
    candidate_position: row.candidate_position ? String(row.candidate_position) : null,
    evaluator_name: row.evaluator_name ? String(row.evaluator_name) : null,
    evaluator_email: row.evaluator_email ? String(row.evaluator_email) : null,
    total_score: row.total_score != null ? Number(row.total_score) : null,
    weighted_score: row.weighted_score != null ? Number(row.weighted_score) : null,
    result: (row.result as CandidateEvaluation['result']) ?? 'pending',
    overall_feedback: row.overall_feedback ? String(row.overall_feedback) : null,
    recommendation: row.recommendation ? String(row.recommendation) : null,
    interview_id: row.interview_id ? String(row.interview_id) : null,
    created_at: String(row.created_at ?? ''),
    scores,
  };
}

export function useCandidateEvaluations(enabled = false) {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['candidate-evaluations', currentCompanyId],
    queryFn: async () => {
      const result = await listCandidateEvaluations({ company_id: currentCompanyId! });
      return (result.data ?? []).map(mapEvaluation);
    },
    enabled: enabled && !!currentCompanyId,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (isAbortLikeError(error)) return false;
      return failureCount < 1;
    },
  });

  const evaluations = query.data ?? [];

  const deleteEvaluation = async (evaluationId: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteCandidateEvaluation(evaluationId, currentCompanyId);
      await queryClient.invalidateQueries({ queryKey: ['candidate-evaluations', currentCompanyId] });
      return true;
    } catch (error: unknown) {
      if (!isAbortLikeError(error)) {
        toast({
          title: t('messages.error'),
          description: toErrorMessage(
            error,
            String(t('hk.evaluation.deleteError', 'Không thể xóa đánh giá')),
          ),
          variant: 'destructive',
        });
      }
      return false;
    }
  };

  const stats = {
    total: evaluations.length,
    pass: evaluations.filter((e) => e.result === 'pass').length,
    fail: evaluations.filter((e) => e.result === 'fail').length,
    pending: evaluations.filter((e) => e.result === 'pending').length,
    hold: evaluations.filter((e) => e.result === 'hold').length,
  };

  return {
    evaluations,
    loading: query.isLoading,
    stats,
    refetch: () => query.refetch(),
    deleteEvaluation,
  };
}
