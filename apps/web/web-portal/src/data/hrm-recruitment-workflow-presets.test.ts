/**
 * @CODE-MEMORY
 * Screen:     unit tests — hrm-recruitment-workflow-presets
 * UC:         UC-HRM-REC-WF-01 · AC-REC-WF-01
 * WorkItem:   XHRM-REC-WF-FE-CANVAS-01
 * Coded:      2026-07-19
 * must_keep:  Three normative codes; F6 rec_* taskTypes on candidate pipeline
 */

import { describe, expect, it } from 'vitest';
import {
  HRM_RECRUITMENT_WF_PRESET_META,
  WF_HRM_CANDIDATE_PIPELINE_CODE,
  WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE,
  WF_HRM_REQUISITION_APPROVAL_CODE,
  buildHrmRecruitmentWorkflowPreset,
  businessTypeForWorkflowCode,
  categoryForWorkflowCode,
  findWorkflowByRecruitmentCode,
  isHrmRecruitmentWorkflowCode,
} from './hrm-recruitment-workflow-presets';
import { workflowDefinitionToApiPayload } from '../integrations/workflowMapper';

describe('hrm-recruitment-workflow-presets', () => {
  it('exposes exactly three normative bridge codes', () => {
    expect(HRM_RECRUITMENT_WF_PRESET_META).toHaveLength(3);
    const codes = HRM_RECRUITMENT_WF_PRESET_META.map((m) => m.workflowCode);
    expect(codes).toEqual([
      WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE,
      WF_HRM_REQUISITION_APPROVAL_CODE,
      WF_HRM_CANDIDATE_PIPELINE_CODE,
    ]);
  });

  it('maps codes to businessType + category for API payload', () => {
    expect(businessTypeForWorkflowCode(WF_HRM_REQUISITION_APPROVAL_CODE)).toBe('hrm_requisition');
    expect(categoryForWorkflowCode(WF_HRM_REQUISITION_APPROVAL_CODE)).toBe('hrm_recruitment');
    expect(isHrmRecruitmentWorkflowCode('hrm_candidate_pipeline')).toBe(true);
    expect(isHrmRecruitmentWorkflowCode('WF-TD-01')).toBe(false);
  });

  it('builds plan/requisition single-step presets with direct_manager', () => {
    const plan = buildHrmRecruitmentWorkflowPreset('plan', 'tmp-plan');
    expect(plan.code).toBe(WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE);
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]?.id).toBe('plan_approval');
    expect(plan.steps[0]?.taskType).toBe('rec_plan_approve');
    expect(plan.steps[0]?.resolverType).toBe('direct_manager');

    const req = buildHrmRecruitmentWorkflowPreset('requisition', 'tmp-req');
    expect(req.code).toBe(WF_HRM_REQUISITION_APPROVAL_CODE);
    expect(req.steps[0]?.taskType).toBe('rec_req_approve');
  });

  it('builds candidate pipeline with F6 rec_* taskTypes (AC-CD-F6 map)', () => {
    const cand = buildHrmRecruitmentWorkflowPreset('candidate', 'tmp-cand');
    expect(cand.code).toBe(WF_HRM_CANDIDATE_PIPELINE_CODE);
    expect(cand.steps.map((s) => s.taskType)).toEqual([
      'rec_intake',
      'rec_screening',
      'rec_interview',
      'rec_offer',
    ]);
  });

  it('serializes active payload with conditions.businessType for spawn lookup', () => {
    const req = buildHrmRecruitmentWorkflowPreset('requisition', 'tmp-req-2');
    const payload = workflowDefinitionToApiPayload(req);
    expect(payload.workflowCode).toBe(WF_HRM_REQUISITION_APPROVAL_CODE);
    expect(payload.status).toBe('active');
    expect(payload.category).toBe('hrm_recruitment');
    expect(payload.conditions).toEqual({ businessType: 'hrm_requisition' });
    const graph = payload.graph as { steps: Array<Record<string, unknown>> };
    expect(graph.steps[0]?.stepKey).toBe('requisition_approval');
    expect(graph.steps[0]?.taskType).toBe('rec_req_approve');
    expect(graph.steps[0]?.resolver_type).toBe('direct_manager');
  });

  it('findWorkflowByRecruitmentCode matches existing list rows', () => {
    const hit = findWorkflowByRecruitmentCode(
      [{ id: 'a', code: 'hrm_requisition_approval' }],
      'requisition',
    );
    expect(hit?.id).toBe('a');
    expect(findWorkflowByRecruitmentCode([{ id: 'b', code: 'WF-TD-01' }], 'plan')).toBeUndefined();
  });
});
