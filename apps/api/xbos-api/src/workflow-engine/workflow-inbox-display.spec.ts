import {
  composeInboxDisplayTitle,
  enrichWorkflowInboxTaskRow,
  ensureGroupApproverAmongInboxSteps,
  readSubjectTitleFromContext,
} from './workflow-inbox-display';

describe('workflow-inbox-display PO-E2E-SPINE-01-BE-INBOX-01', () => {
  it('reads subjectTitle from spawn context (camel / snake)', () => {
    expect(readSubjectTitleFromContext({ subjectTitle: 'YCTD HireToPay SP2SDD8FM8' })).toBe(
      'YCTD HireToPay SP2SDD8FM8',
    );
    expect(readSubjectTitleFromContext({ subject_title: '  Plan A  ' })).toBe('Plan A');
    expect(readSubjectTitleFromContext({ businessTitle: 'B' })).toBe('B');
    expect(readSubjectTitleFromContext({})).toBe('');
  });

  it('composes display title so this-wave stamp is visible with tuyển definition name', () => {
    const title = composeInboxDisplayTitle(
      'Phê duyệt yêu cầu tuyển dụng HRM',
      'YCTD HireToPay SP2SDD8FM8',
    );
    expect(title).toContain('SP2SDD8FM8');
    expect(title).toMatch(/tuyển|YCTD|HireToPay/i);
  });

  it('enrichWorkflowInboxTaskRow sets workflow_name for FE title map + subject_title', () => {
    const enriched = enrichWorkflowInboxTaskRow({
      id: 'task-1',
      workflow_name: 'Phê duyệt yêu cầu tuyển dụng HRM',
      step_key: 'requisition_approval',
      business_type: 'hrm_requisition',
      business_id: '34a421e7-33df-4c8b-b96c-559082b78086',
      context: {
        subjectTitle: 'YCTD HireToPay SP2SDD8FM8',
        memberCompanyId: 'holding',
      },
    });
    expect(enriched.subject_title).toBe('YCTD HireToPay SP2SDD8FM8');
    expect(String(enriched.workflow_name)).toContain('SP2SDD8FM8');
    expect(enriched.workflow_definition_name).toBe('Phê duyệt yêu cầu tuyển dụng HRM');
    expect(enriched.display_title).toBe(enriched.workflow_name);
  });

  it('leave / no subject keeps workflow_name unchanged', () => {
    const enriched = enrichWorkflowInboxTaskRow({
      workflow_name: 'Phê duyệt đơn nghỉ phép HRM',
      step_key: 'manager_approval',
      business_type: 'hrm_leave',
      context: { memberCompanyId: 'holding' },
    });
    expect(enriched.subject_title).toBeNull();
    expect(enriched.workflow_name).toBe('Phê duyệt đơn nghỉ phép HRM');
  });

  it('ensureGroupApproverAmongInboxSteps adds ceo@xe.vn when role fan-out omitted them', () => {
    const steps = ensureGroupApproverAmongInboxSteps(
      [
        {
          stepKey: 'requisition_approval',
          hatKey: 'group_ceo',
          assigneeUserId: 'admin@xe.vn',
        },
      ],
      'ceo@xe.vn',
    );
    expect(steps.map((s) => s.assigneeUserId)).toEqual(
      expect.arrayContaining(['admin@xe.vn', 'ceo@xe.vn']),
    );
  });

  it('ensureGroupApproverAmongInboxSteps is no-op when ceo already present', () => {
    const input = [
      { stepKey: 'requisition_approval', assigneeUserId: 'ceo@xe.vn' },
      { stepKey: 'requisition_approval', assigneeUserId: 'admin@xe.vn' },
    ];
    expect(ensureGroupApproverAmongInboxSteps(input, 'ceo@xe.vn')).toEqual(input);
  });
});
