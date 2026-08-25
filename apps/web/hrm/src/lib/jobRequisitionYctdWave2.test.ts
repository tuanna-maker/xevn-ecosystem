/**
 * @CODE-MEMORY
 * WorkItem:   PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01
 * Purpose:    Vitest for YCTD Wave-2 helpers (mode/hire/O4/O2/receivable/pipeline).
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-FE-01
 * What: Approval chain SHORT/LONG/BOD · cell picker options · replace display
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  canMutateYctdPipelineFlags,
  collectApprovedNeedHireCellOptions,
  diagnoseApprovedNeedHireCellPickerEmpty,
  ensureHeadcountCellOptionPresent,
  isYctdClassificationRequired,
  normalizeYctdHeadcountMode,
  normalizeYctdHireReason,
  parseYctdCreatePresetFromSearch,
  resolveYctdApprovalChainView,
  resolveYctdCellLabel,
  resolveYctdMatrixFamily,
  resolveYctdReplaceEmployeeDisplay,
  validateYctdCreateForm,
  YCTD_BOD_BLOCKED_CV_VI,
  YCTD_CELL_QTY_HINT_VI,
  YCTD_CLASSIFY_BANNER_VI,
  YCTD_LONG_MATRIX_HINT_VI,
  YCTD_MATRIX_LONG_BOD_KEY,
  YCTD_MATRIX_SHORT_KEY,
  YCTD_MODE_LABEL_VI,
  YCTD_PROPOSALS_DEPRECATE_VI,
  yctdModeBadgeLabel,
} from '@/lib/jobRequisitionYctdWave2';
import { parseMonthsData } from '@/lib/recruitmentPlanHeadcount';
import { toErrorMessage, ApiClientError } from '@/lib/apiError';
import { canSubmitRequisitionWorkflow } from '@/lib/recruitmentWorkflowUi';
import { REQUISITION_STATUS_LABEL_VI, mapRequisitionStatus } from '@/lib/jobRequisitionUi';
import { filterReceivableRequisitions } from '@/lib/candidateUvYctdUi';

describe('jobRequisitionYctdWave2 (PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01)', () => {
  it('normalizes mode + hire_reason aliases', () => {
    expect(normalizeYctdHeadcountMode('in_plan')).toBe('in_plan');
    expect(normalizeYctdHeadcountMode('out_of_plan')).toBe('out_of_plan');
    expect(normalizeYctdHeadcountMode(null)).toBeNull();
    expect(normalizeYctdHireReason('replacement')).toBe('replace');
    expect(normalizeYctdHireReason('new')).toBe('new');
  });

  it('O4 classification_required when mode NULL', () => {
    expect(isYctdClassificationRequired({ headcount_mode: null })).toBe(true);
    expect(isYctdClassificationRequired({ classification_required: true })).toBe(true);
    expect(isYctdClassificationRequired({ headcount_mode: 'in_plan' })).toBe(false);
  });

  it('validate in_plan needs cell; out_of_plan needs reason on complete; draft_save allows empty out reason', () => {
    expect(
      validateYctdCreateForm({
        headcount_mode: 'in_plan',
        hire_reason: 'new',
        headcount_cell_id: '',
      }).ok,
    ).toBe(false);
    expect(
      validateYctdCreateForm({
        headcount_mode: 'in_plan',
        hire_reason: 'new',
        headcount_cell_id: 'cell-1',
      }).ok,
    ).toBe(true);
    expect(
      validateYctdCreateForm({
        headcount_mode: 'out_of_plan',
        hire_reason: 'new',
        out_of_plan_reason: '',
      }).ok,
    ).toBe(false);
    expect(
      validateYctdCreateForm(
        {
          headcount_mode: 'out_of_plan',
          hire_reason: 'new',
          out_of_plan_reason: '',
        },
        'draft_save',
      ).ok,
    ).toBe(true);
    expect(
      validateYctdCreateForm({
        headcount_mode: 'out_of_plan',
        hire_reason: 'replace',
        out_of_plan_reason: 'Vượt kế hoạch',
        replace_employee_id: '',
      }).ok,
    ).toBe(false);
    expect(
      validateYctdCreateForm({
        headcount_mode: 'out_of_plan',
        hire_reason: 'replace',
        out_of_plan_reason: 'Vượt kế hoạch',
        replace_employee_id: 'emp-1',
      }).ok,
    ).toBe(true);
  });

  it('pipeline flags only when receivable + classified', () => {
    expect(
      canMutateYctdPipelineFlags({
        status: 'open_for_hire',
        headcount_mode: 'in_plan',
      }),
    ).toBe(true);
    expect(
      canMutateYctdPipelineFlags({
        status: 'open_for_hire',
        headcount_mode: null,
        classification_required: true,
      }),
    ).toBe(false);
    expect(
      canMutateYctdPipelineFlags({
        status: 'pending_approval',
        headcount_mode: 'out_of_plan',
      }),
    ).toBe(false);
    expect(
      canMutateYctdPipelineFlags({
        status: 'draft',
        headcount_mode: 'in_plan',
      }),
    ).toBe(false);
  });

  it('parse create preset from search', () => {
    expect(
      parseYctdCreatePresetFromSearch(
        '?headcount_mode=in_plan&headcount_cell_id=c1&headcount=2',
      ),
    ).toEqual({
      headcount_mode: 'in_plan',
      headcount_cell_id: 'c1',
      headcount: 2,
    });
  });

  it('O2 CELL-QTY toast VI + LONG matrix hint present', () => {
    expect(YCTD_CELL_QTY_HINT_VI).toMatch(/Ngoài định biên|ngoài định biên/i);
    expect(YCTD_LONG_MATRIX_HINT_VI).toMatch(/BOD/);
    expect(YCTD_CLASSIFY_BANNER_VI).toMatch(/phân loại/i);
    expect(YCTD_MODE_LABEL_VI.in_plan).toBe('Trong định biên');
    expect(yctdModeBadgeLabel(null, true)).toBe('Chưa phân loại');
  });

  it('apiError maps HRM-YCTD-CELL-QTY with ngoài ĐB hint', () => {
    const msg = toErrorMessage(
      new ApiClientError({
        code: 'HRM-YCTD-CELL-QTY',
        message: 'qty',
        status: 409,
      }),
      'fallback',
    );
    expect(msg).toMatch(/Ngoài định biên|ngoài định biên/i);
  });

  it('status open_for_hire labeled + map active; submit blocked', () => {
    expect(REQUISITION_STATUS_LABEL_VI.open_for_hire).toBe('Mở nhận hồ sơ');
    expect(mapRequisitionStatus('open_for_hire')).toBe('active');
    expect(canSubmitRequisitionWorkflow(null, 'draft')).toBe(true);
    expect(canSubmitRequisitionWorkflow(null, 'open_for_hire')).toBe(false);
  });

  it('O4 UV filter excludes unclassified receivable synonym', () => {
    const rows = filterReceivableRequisitions([
      { id: '1', status: 'open', headcount_mode: null },
      { id: '2', status: 'open_for_hire', headcount_mode: 'in_plan' },
      { id: '3', status: 'open', classification_required: true },
    ]);
    expect(rows.map((r) => r.id)).toEqual(['2']);
  });

  it('O5 proposals deprecate copy locked', () => {
    expect(YCTD_PROPOSALS_DEPRECATE_VI).toMatch(/không còn là nguồn sự thật/i);
  });

  it('AC-02d SHORT pending → TP/HR approve → open_for_hire (no BOD)', () => {
    expect(resolveYctdMatrixFamily({ approval_matrix_key: YCTD_MATRIX_SHORT_KEY })).toBe(
      'SHORT',
    );
    const chain = resolveYctdApprovalChainView({
      status: 'pending_approval',
      headcount_mode: 'in_plan',
      approval_matrix_key: YCTD_MATRIX_SHORT_KEY,
    });
    expect(chain.matrixFamily).toBe('SHORT');
    expect(chain.showTransitionActions).toBe(true);
    expect(chain.approveSendsBodComplete).toBe(false);
    expect(chain.bodStepPending).toBe(false);
    expect(chain.approveButtonLabelVi).toMatch(/mở nhận hồ sơ/i);
    expect(chain.chainSteps.some((s) => s.id === 'tp_hr' && s.state === 'current')).toBe(true);
  });

  it('AC-02b-05 LONG pending → TP/HR first; approved → BOD with bod_complete', () => {
    expect(resolveYctdMatrixFamily({ approval_matrix_key: YCTD_MATRIX_LONG_BOD_KEY })).toBe(
      'LONG',
    );
    const pending = resolveYctdApprovalChainView({
      status: 'pending_approval',
      headcount_mode: 'out_of_plan',
      approval_matrix_key: YCTD_MATRIX_LONG_BOD_KEY,
      requires_bod: true,
    });
    expect(pending.matrixFamily).toBe('LONG');
    expect(pending.approveSendsBodComplete).toBe(false);
    expect(pending.bodStepPending).toBe(true);
    expect(pending.blockedFromCv).toBe(true);
    expect(pending.approveButtonLabelVi).toMatch(/TP\/HR/i);

    const bod = resolveYctdApprovalChainView({
      status: 'approved',
      headcount_mode: 'out_of_plan',
      approval_matrix_key: YCTD_MATRIX_LONG_BOD_KEY,
      requires_bod: true,
    });
    expect(bod.showTransitionActions).toBe(true);
    expect(bod.approveSendsBodComplete).toBe(true);
    expect(bod.approveButtonLabelVi).toMatch(/BOD/i);
    expect(bod.chainSteps.some((s) => s.id === 'bod' && s.state === 'current')).toBe(true);
    expect(YCTD_BOD_BLOCKED_CV_VI).toMatch(/BOD/i);
  });

  it('ALT replace employee display + cell picker from approved Định biên', () => {
    expect(
      resolveYctdReplaceEmployeeDisplay('emp-1', [
        { value: 'emp-1', label: 'Nguyễn A', code: 'NV001' },
      ]),
    ).toMatch(/Nguyễn A/);

    const opts = collectApprovedNeedHireCellOptions(
      [
        {
          id: 'plan-1',
          title: 'ĐB 2026',
          status: 'approved',
          year: 2026,
          departments: [
            {
              name: 'Kinh doanh',
              positions: [
                {
                  name: 'CVKD',
                  months: [
                    {
                      cell_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
                      month: 3,
                      need_hire: 2,
                      lifecycle_status: 'need_hire_approved',
                    },
                    {
                      cell_id: 'skip-open',
                      month: 4,
                      need_hire: 1,
                      lifecycle_status: 'open',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'plan-draft',
          status: 'draft',
          departments: [
            {
              name: 'X',
              positions: [
                {
                  name: 'Y',
                  months: [
                    {
                      cell_id: 'should-skip',
                      month: 1,
                      need_hire: 1,
                      lifecycle_status: 'need_hire_approved',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      parseMonthsData,
    );
    expect(opts).toHaveLength(1);
    expect(opts[0].value).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(opts[0].label).toMatch(/Kinh doanh/);
    expect(opts[0].label).toMatch(/T3\/2026/);

    expect(diagnoseApprovedNeedHireCellPickerEmpty([])).toMatch(/Chưa có kế hoạch/);
    expect(
      diagnoseApprovedNeedHireCellPickerEmpty([{ status: 'draft' }, { status: 'draft' }]),
    ).toMatch(/chưa ở trạng thái Đã duyệt/);

    const withDeepLink = ensureHeadcountCellOptionPresent(opts, 'deep-link-cell');
    expect(withDeepLink.some((o) => o.value === 'deep-link-cell')).toBe(true);
    expect(resolveYctdCellLabel(opts[0].value, opts)).toMatch(/Kinh doanh/);
  });

  it('JobRequisitionsTab wires wave2 API + form forks + BOD chain + cell picker (source)', () => {
    const tabSrc = readFileSync(
      join(__dirname, '../components/recruitment/JobRequisitionsTab.tsx'),
      'utf8',
    );
    expect(tabSrc).toMatch(/headcount_mode/);
    expect(tabSrc).toMatch(/hire_reason/);
    expect(tabSrc).toMatch(/out_of_plan_reason/);
    expect(tabSrc).toMatch(/transitionJobRequisition/);
    expect(tabSrc).toMatch(/patchJobRequisitionPipelineFlags/);
    expect(tabSrc).toMatch(/HRM-YCTD-CELL-QTY/);
    expect(tabSrc).toMatch(/YCTD_CLASSIFY_BANNER_VI/);
    expect(tabSrc).toMatch(/resolveYctdApprovalChainView/);
    expect(tabSrc).toMatch(/yctd-approval-chain/);
    expect(tabSrc).toMatch(/approveSendsBodComplete/);
    expect(tabSrc).toMatch(/collectApprovedNeedHireCellOptions/);
    expect(tabSrc).toMatch(/listRecruitmentPlans/);
    expect(tabSrc).toMatch(/yctd-detail-replace-employee/);
    expect(tabSrc).toMatch(/yctd-detail-rejected-reason/);
  });

  it('HeadcountProposalTab creates on-tab (source)', () => {
    const src = readFileSync(
      join(__dirname, '../components/recruitment/HeadcountProposalTab.tsx'),
      'utf8',
    );
    expect(src).toMatch(/createHeadcountProposal/);
    expect(src).toMatch(/setIsDialogOpen\(true\)/);
    expect(src).toMatch(/data-testid="hcp-create-btn"/);
    expect(src).toMatch(/data-testid="hcp-submit"/);
    expect(src).not.toMatch(/YCTD_PROPOSALS_REDIRECT_CTA_VI/);
  });

  it('hrmApi exposes transitions + pipeline-flags physical paths', () => {
    const apiSrc = readFileSync(join(__dirname, '../integrations/hrmApi.ts'), 'utf8');
    expect(apiSrc).toMatch(/\/transitions/);
    expect(apiSrc).toMatch(/\/pipeline-flags/);
    expect(apiSrc).toMatch(/open_for_hire/);
    expect(apiSrc).not.toMatch(/\/api\/hrm\/rec\/recruitment-requests/);
  });
});
