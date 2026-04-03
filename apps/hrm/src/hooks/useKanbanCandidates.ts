import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface KanbanCandidate {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string | null;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired';
  appliedDate: string;
  source: string | null;
  rating: number;
  notes: string | null;
  avatarUrl: string | null;
}

interface UseKanbanCandidatesReturn {
  candidates: KanbanCandidate[];
  loading: boolean;
  error: Error | null;
  updateCandidateStage: (candidateId: string, newStage: KanbanCandidate['stage']) => Promise<void>;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
  };
}

export function useKanbanCandidates(): UseKanbanCandidatesReturn {
  const { currentCompanyId } = useAuth();
  const [candidates, setCandidates] = useState<KanbanCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!currentCompanyId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('applied_date', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedCandidates: KanbanCandidate[] = (data || []).map((candidate) => ({
        id: candidate.id,
        fullName: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        stage: (candidate.stage as KanbanCandidate['stage']) || 'applied',
        appliedDate: candidate.applied_date || new Date().toISOString().split('T')[0],
        source: candidate.source,
        rating: candidate.rating || 0,
        notes: candidate.notes,
        avatarUrl: candidate.avatar_url,
      }));

      setCandidates(transformedCandidates);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch candidates'));
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  const updateCandidateStage = useCallback(
    async (candidateId: string, newStage: KanbanCandidate['stage']) => {
      if (!currentCompanyId) return;

      // Optimistic update
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, stage: newStage } : candidate
        )
      );

      try {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ stage: newStage, updated_at: new Date().toISOString() })
          .eq('id', candidateId)
          .eq('company_id', currentCompanyId);

        if (updateError) throw updateError;

        const stageLabels: Record<string, string> = {
          applied: 'Ứng tuyển',
          screening: 'Sàng lọc',
          interview: 'Phỏng vấn',
          offer: 'Đề xuất',
          hired: 'Đã tuyển',
        };

        const movedCandidate = candidates.find((c) => c.id === candidateId);
        if (movedCandidate) {
          toast({
            title: 'Cập nhật trạng thái',
            description: `${movedCandidate.fullName} đã được chuyển sang "${stageLabels[newStage]}"`,
          });
        }
      } catch (err) {
        console.error('Error updating candidate stage:', err);
        // Revert on error
        await fetchCandidates();
        toast({
          title: 'Lỗi',
          description: 'Không thể cập nhật trạng thái ứng viên',
          variant: 'destructive',
        });
      }
    },
    [currentCompanyId, candidates, fetchCandidates]
  );

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const stats = {
    total: candidates.length,
    applied: candidates.filter((c) => c.stage === 'applied').length,
    screening: candidates.filter((c) => c.stage === 'screening').length,
    interview: candidates.filter((c) => c.stage === 'interview').length,
    offer: candidates.filter((c) => c.stage === 'offer').length,
    hired: candidates.filter((c) => c.stage === 'hired').length,
  };

  return {
    candidates,
    loading,
    error,
    updateCandidateStage,
    refetch: fetchCandidates,
    stats,
  };
}
