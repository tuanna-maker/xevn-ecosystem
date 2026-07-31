import { describe, expect, it } from 'vitest';
import {
  HRM_REC_WF_REQUIRED_CODES,
  RECRUITMENT_SPAWN_MISSING_BODY_VI,
  canSubmitRequisitionWorkflow,
  detectRecruitmentSpawnMissing,
  isRecruitmentSpawnMissing,
  isRecruitmentWorkflowLocked,
} from './recruitmentWorkflowUi';

describe('recruitmentWorkflowUi (XHRM-REC-WF-FE-01 / FE-CANVAS-01 / D-REC-13-S2)', () => {
  it('locks candidate stage PATCH when workflow_instance_id active and non-terminal', () => {
    expect(isRecruitmentWorkflowLocked('inst-1', 'screening', 'candidate')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'new', 'candidate')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'hired', 'candidate')).toBe(false);
    expect(isRecruitmentWorkflowLocked('inst-1', 'rejected', 'candidate')).toBe(false);
    expect(isRecruitmentWorkflowLocked(null, 'screening', 'candidate')).toBe(false);
  });

  it('locks requisition / plan status when instance active and non-terminal', () => {
    expect(isRecruitmentWorkflowLocked('inst-1', 'pending_approval', 'requisition')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'open', 'requisition')).toBe(false);
    expect(isRecruitmentWorkflowLocked('inst-1', 'pending_approval', 'plan')).toBe(true);
    expect(isRecruitmentWorkflowLocked('inst-1', 'approved', 'plan')).toBe(false);
  });

  it('allows Gửi duyệt QT after YCTD create (open, no instance)', () => {
    expect(canSubmitRequisitionWorkflow(null, 'open')).toBe(true);
    expect(canSubmitRequisitionWorkflow('', 'open')).toBe(true);
    expect(canSubmitRequisitionWorkflow(undefined, 'draft')).toBe(true);
    expect(canSubmitRequisitionWorkflow(undefined, 'pending_approval')).toBe(true);
    expect(canSubmitRequisitionWorkflow('wi-1', 'open')).toBe(false);
    expect(canSubmitRequisitionWorkflow(null, 'closed')).toBe(false);
    expect(canSubmitRequisitionWorkflow(null, 'rejected')).toBe(false);
  });

  it('detects SPAWN-MISSING from BE spawnMissing flag or empty spawn id', () => {
    expect(detectRecruitmentSpawnMissing({ spawnMissing: true })).toBe(true);
    expect(detectRecruitmentSpawnMissing({ spawnMissing: false, spawn: { workflowInstanceId: 'x' } })).toBe(
      false,
    );
    expect(detectRecruitmentSpawnMissing({ spawn: { workflowInstanceId: null } })).toBe(true);
    expect(isRecruitmentSpawnMissing({ spawnMissing: true, workflow_instance_id: null })).toBe(true);
  });

  it('SPAWN-MISSING copy keeps canvas path hint without raw workflow codes in UI', () => {
    expect(HRM_REC_WF_REQUIRED_CODES).toEqual([
      'hrm_recruitment_plan_approval',
      'hrm_requisition_approval',
      'hrm_candidate_pipeline',
    ]);
    expect(RECRUITMENT_SPAWN_MISSING_BODY_VI).toContain('Mẫu QT tuyển dụng HRM');
    expect(RECRUITMENT_SPAWN_MISSING_BODY_VI).toContain('Command Center');
    for (const code of HRM_REC_WF_REQUIRED_CODES) {
      expect(RECRUITMENT_SPAWN_MISSING_BODY_VI).not.toContain(code);
    }
    expect(RECRUITMENT_SPAWN_MISSING_BODY_VI).not.toContain('workflow_instance_id');
  });
});
