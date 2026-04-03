import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EvaluationScore {
  criterion_name: string; category: string; actual_score: number | null; required_score: number; weight: number;
}

export interface CandidateEvaluation {
  id: string; candidate_id: string; candidate_name: string; candidate_email: string;
  candidate_avatar: string | null; candidate_position: string | null; evaluator_name: string | null;
  evaluator_email: string | null; total_score: number | null; weighted_score: number | null;
  result: 'pending' | 'pass' | 'fail' | 'hold'; overall_feedback: string | null;
  recommendation: string | null; interview_id: string | null; created_at: string; scores: EvaluationScore[];
}

export function useCandidateEvaluations() {
  const [evaluations, setEvaluations] = useState<CandidateEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.evaluation.${key}`) as string;

  const fetchEvaluations = useCallback(async () => {
    if (!currentCompanyId) { setEvaluations([]); setLoading(false); return; }
    try {
      setLoading(true);
      const { data: evaluationsData, error: evalError } = await supabase
        .from('candidate_evaluations')
        .select(`id, candidate_id, evaluator_name, evaluator_email, total_score, weighted_score, result, overall_feedback, recommendation, interview_id, created_at, candidates (id, full_name, email, avatar_url, position)`)
        .eq('company_id', currentCompanyId).order('created_at', { ascending: false });
      if (evalError) throw evalError;

      const evaluationIds = evaluationsData?.map(e => e.id) || [];
      let scoresMap = new Map<string, EvaluationScore[]>();
      if (evaluationIds.length > 0) {
        const { data: scoresData, error: scoresError } = await supabase
          .from('candidate_evaluation_scores')
          .select('evaluation_id, criterion_name, category, actual_score, required_score, weight')
          .in('evaluation_id', evaluationIds);
        if (scoresError) throw scoresError;
        scoresData?.forEach(score => {
          if (!scoresMap.has(score.evaluation_id)) scoresMap.set(score.evaluation_id, []);
          scoresMap.get(score.evaluation_id)!.push({ criterion_name: score.criterion_name, category: score.category, actual_score: score.actual_score, required_score: score.required_score, weight: Number(score.weight) });
        });
      }

      const formattedEvaluations: CandidateEvaluation[] = (evaluationsData || []).filter(e => e.candidates).map(e => {
        const candidate = e.candidates as any;
        return {
          id: e.id, candidate_id: e.candidate_id, candidate_name: candidate.full_name,
          candidate_email: candidate.email, candidate_avatar: candidate.avatar_url,
          candidate_position: candidate.position, evaluator_name: e.evaluator_name,
          evaluator_email: e.evaluator_email, total_score: e.total_score ? Number(e.total_score) : null,
          weighted_score: e.weighted_score ? Number(e.weighted_score) : null,
          result: (e.result as CandidateEvaluation['result']) || 'pending',
          overall_feedback: e.overall_feedback, recommendation: e.recommendation,
          interview_id: e.interview_id, created_at: e.created_at, scores: scoresMap.get(e.id) || [],
        };
      });
      setEvaluations(formattedEvaluations);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setLoading(false); }
  }, [currentCompanyId, toast, t]);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  const deleteEvaluation = async (evaluationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('candidate_evaluations').delete().eq('id', evaluationId);
      if (error) throw error;
      toast({ title: t('messages.success'), description: h('deleteSuccess') });
      await fetchEvaluations(); return true;
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({ title: t('messages.error'), description: h('deleteError'), variant: 'destructive' }); return false;
    }
  };

  const stats = {
    total: evaluations.length, pass: evaluations.filter(e => e.result === 'pass').length,
    fail: evaluations.filter(e => e.result === 'fail').length, pending: evaluations.filter(e => e.result === 'pending').length,
    hold: evaluations.filter(e => e.result === 'hold').length,
  };

  return { evaluations, loading, stats, refetch: fetchEvaluations, deleteEvaluation };
}
