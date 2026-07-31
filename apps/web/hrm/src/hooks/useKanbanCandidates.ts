/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Kanban candidates (Dashboard Board)
 * UC:         UC-HRM-30 · UC-HRM-REC-WF-04 · UC-HRM-INT-01
 * BR:         BR-REC-WF-08 · BR-REC-WF-09 · AC-CD-F6-* · G-DB-01
 * SRS:        docs/hrm/SRS.md §14 · docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33 FR-HRM-INT-01
 * TechSpec:   docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §7–§8 · TECHSPEC §17.3 G-DB-01
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §4.1
 * Purpose:    Load candidates-pool; bind stage from API (post-WF sync); block
 *             drag-drop stage change when workflow_instance_id active (409 LOCKED).
 *             ADD hire: stage=hired gửi employee_id (soft) — FR-HRM-INT-01.
 * WorkItem:   XHRM-REC-WF-FE-01 · FE-HRM-G-DB-01-HIRE-BIND-01
 * Coded:      2026-07-19
 * must_keep:  UF-HRM-12 local stage when no instance; F6 applied↔new alias; G-RC-01; leave CREATE
 * change_mode: UPGRADE
 * LastVerified: recruitmentHireLink.test.ts · docs/qa/evidence/fe-hrm-g-db-01-hire-bind-01-20260721.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-FE-01
 * ADD workflowInstanceId on KanbanCandidate; refuse updateCandidateStage when locked.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 FE-HRM-G-DB-01-HIRE-BIND-01
 * ADD employeeId on KanbanCandidate; updateCandidateStage accepts employeeId for hired;
 * surface HRM-REC-HIRE-400 via toErrorMessage (VI).
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { listCandidatesPool, updateCandidatePoolStage } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  isRecruitmentWorkflowLocked,
  RECRUITMENT_WF_LOCKED_HINT_VI,
} from '@/lib/recruitmentWorkflowUi';
import { isHiredStage } from '@/lib/recruitmentHireLink';

export interface KanbanCandidate {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string | null;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  source: string | null;
  rating: number;
  notes: string | null;
  avatarUrl: string | null;
  workflowInstanceId: string | null;
  /** Soft hire link — FR-HRM-INT-01 / G-DB-01. */
  employeeId: string | null;
}

export type UpdateCandidateStageOpts = {
  employeeId?: string | null;
};

interface UseKanbanCandidatesReturn {
  candidates: KanbanCandidate[];
  loading: boolean;
  error: Error | null;
  updateCandidateStage: (
    candidateId: string,
    newStage: KanbanCandidate['stage'],
    opts?: UpdateCandidateStageOpts,
  ) => Promise<void>;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  };
}

const STAGE_VALUES: KanbanCandidate['stage'][] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
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
        workflowInstanceId: candidate.workflow_instance_id?.trim() || null,
        employeeId: candidate.employee_id?.trim() || null,
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
    async (
      candidateId: string,
      newStage: KanbanCandidate['stage'],
      opts?: UpdateCandidateStageOpts,
    ) => {
      if (!currentCompanyId) return;

      const current = candidates.find((c) => c.id === candidateId);
      if (
        current &&
        isRecruitmentWorkflowLocked(current.workflowInstanceId, current.stage, 'candidate')
      ) {
        toast({
          title: 'Quy trình đang chạy',
          description: RECRUITMENT_WF_LOCKED_HINT_VI,
          variant: 'destructive',
        });
        return;
      }

      const employeeId =
        opts?.employeeId?.trim() ||
        (isHiredStage(newStage) ? current?.employeeId : null) ||
        null;

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === candidateId
            ? {
                ...candidate,
                stage: newStage,
                employeeId: isHiredStage(newStage) && employeeId ? employeeId : candidate.employeeId,
              }
            : candidate,
        ),
      );

      try {
        const apiStage = newStage === 'applied' ? 'applied' : newStage;
        await updateCandidatePoolStage(candidateId, currentCompanyId, apiStage, employeeId);

        const stageLabels: Record<string, string> = {
          applied: 'Ứng tuyển',
          screening: 'Sàng lọc',
          interview: 'Phỏng vấn',
          offer: 'Đề xuất',
          hired: 'Đã tuyển',
          rejected: 'Từ chối',
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
    rejected: candidates.filter((c) => c.stage === 'rejected').length,
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
