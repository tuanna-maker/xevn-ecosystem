/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — SPAWN-MISSING banner
 * UC:         UC-HRM-REC-WF-02 A (spawn miss) · UC-HRM-REC-WF-01
 * BR:         BR-REC-WF-02 · BR-REC-WF-14
 * SRS:        docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
 * TechSpec:   docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §7–§8
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §6
 * Purpose:    Surface SPAWN-MISSING when submit-workflow / start-pipeline returns
 *             null instance — no silent approve; cite canvas path for J-REC-WF-01.
 * WorkItem:   XHRM-REC-WF-FE-01 · XHRM-REC-WF-FE-CANVAS-01
 * Coded:      2026-07-19
 * must_keep:  U65 FE-only; do not seed inbox to clear banner; F6 AC columns
 * change_mode: UPGRADE
 * LastVerified: docs/qa/evidence/xhrm-rec-wf-fe-canvas-01-20260719.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: XHRM-REC-WF-FE-CANVAS-01
 * What: data-rec-wf-required-codes attr for QA; body cites Mẫu QT tuyển dụng
 * Why: Unblock J-REC-WF-03/06 after FE-created defs
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-REC-13-S2-SUBMIT-INBOX-01
 * change_mode: ADD
 * What: Restore banner after Undo Create Diff (Vite resolve for JobRequisitionsTab)
 * Why: R-REC-13-S2-SUBMIT-INBOX — submit path needs SPAWN-MISSING surface
 * must_keep: U65 no seed; UF-HRM-12
 */

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  HRM_REC_WF_REQUIRED_CODES,
  RECRUITMENT_SPAWN_MISSING_BODY_VI,
  RECRUITMENT_SPAWN_MISSING_TITLE_VI,
} from '@/lib/recruitmentWorkflowUi';
import { cn } from '@/lib/utils';

export interface RecruitmentWfSpawnBannerProps {
  visible: boolean;
  className?: string;
  detail?: string;
}

export function RecruitmentWfSpawnBanner({ visible, className, detail }: RecruitmentWfSpawnBannerProps) {
  if (!visible) return null;
  return (
    <Alert
      variant="destructive"
      className={cn('border-amber-500/60 bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-50', className)}
      data-testid="rec-wf-spawn-missing-banner"
      data-rec-wf-code="HRM-REC-WF-SPAWN-MISSING"
      data-rec-wf-required-codes={HRM_REC_WF_REQUIRED_CODES.join(',')}
    >
      <AlertTriangle className="h-4 w-4  hidden  dark:text-amber-300" />
      <AlertTitle>{RECRUITMENT_SPAWN_MISSING_TITLE_VI}</AlertTitle>
      <AlertDescription>
        <p>{RECRUITMENT_SPAWN_MISSING_BODY_VI}</p>
        {detail ? <p className="mt-1 text-xs opacity-90">{detail}</p> : null}
      </AlertDescription>
    </Alert>
  );
}
