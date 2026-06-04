import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { listCandidatesPool, updateCandidatePoolStage } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';

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

const STAGE_VALUES: KanbanCandidate['stage'][] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
];

function mapPoolStage(stage: string): KanbanCandidate['stage'] {
  if (STAGE_VALUES.includes(stage as KanbanCandidate['stage'])) {
    return stage as KanbanCandidate['stage'];
  }
  if (stage === 'new') return 'applied';
  return 'applied';
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

      const response = await listCandidatesPool({ company_id: currentCompanyId });
      const transformedCandidates: KanbanCandidate[] = (response.data || []).map((candidate) => ({
        id: candidate.id,
        fullName: candidate.full_name,
        email: candidate.email ?? '',
        phone: candidate.phone,
        position: null,
        stage: mapPoolStage(candidate.stage),
        appliedDate:
          candidate.applied_date?.split('T')[0] ||
          candidate.created_at?.split('T')[0] ||
          new Date().toISOString().split('T')[0],
        source: candidate.source,
        rating: 0,
        notes: candidate.notes,
        avatarUrl: null,
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

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, stage: newStage } : candidate,
        ),
      );

      try {
        const apiStage =
          newStage === 'applied' ? 'applied' : newStage;
        await updateCandidatePoolStage(candidateId, currentCompanyId, apiStage);

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
        await fetchCandidates();
        toast({
          title: 'Lỗi',
          description: toErrorMessage(err, 'Không thể cập nhật trạng thái ứng viên'),
          variant: 'destructive',
        });
      }
    },
    [currentCompanyId, candidates, fetchCandidates],
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
