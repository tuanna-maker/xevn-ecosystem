import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WorkflowTaskDetailDrawer } from './WorkflowTaskDetailDrawer';
import type { UnifiedTask } from '../../data/command-center-mock';

const task: UnifiedTask = {
  cardId: 'task-1',
  sourceSystem: 'xbos-workflow',
  sourceId: 'inst-1',
  dedupeKey: 'wf-task-1',
  statusNormalized: 'PENDING_APPROVAL',
  orgUnitId: 'main',
  moduleCode: 'hrm',
  title: 'Phê duyệt nghỉ phép',
  subtitle: 'Nghỉ phép',
  businessType: 'hrm_leave',
  assigneeUserId: 'user-1',
  assigneeName: 'Nguyễn Văn A',
  priority: 'medium',
};

const nonLeaveTask: UnifiedTask = {
  ...task,
  cardId: 'task-rec',
  title: 'Phê duyệt yêu cầu tuyển dụng HRM',
  subtitle: 'Yêu cầu tuyển dụng',
  businessType: 'hrm_requisition',
};

const baseProps = {
  open: true,
  task,
  detail: {
    instance: { id: 'inst-1', status: 'pending' },
    tasks: [{ id: 's1', step_key: 'dept_head', status: 'pending' }],
  } as const,
  loading: false,
  detailLoadFailed: false,
  busy: false,
  inboxFromApi: true,
  onClose: vi.fn(),
  onApprove: vi.fn(),
  onRejectRequest: vi.fn(),
};

describe('WorkflowTaskDetailDrawer', () => {
  it('UC-CC-P0-06: renders instance id and workflow steps from normalized detail', () => {
    render(<WorkflowTaskDetailDrawer {...baseProps} />);

    expect(screen.getByText(/inst-1/)).toBeTruthy();
    expect(screen.getByText('dept_head')).toBeTruthy();
    expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
  });

  it('shows load failure when detail API returns empty', () => {
    render(
      <WorkflowTaskDetailDrawer
        {...baseProps}
        detail={null}
        detailLoadFailed
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/instances\/:id\/detail/);
  });

  it('blocks complete actions when inbox not from API', () => {
    render(<WorkflowTaskDetailDrawer {...baseProps} inboxFromApi={false} />);

    expect(screen.getByRole('button', { name: 'Từ chối nhiệm vụ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeDisabled();
  });

  it('ACT-CC-WF-REJECT: reject triggers onRejectRequest, not onApprove', () => {
    const onApprove = vi.fn();
    const onRejectRequest = vi.fn();
    render(
      <WorkflowTaskDetailDrawer
        {...baseProps}
        onApprove={onApprove}
        onRejectRequest={onRejectRequest}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Từ chối nhiệm vụ' }));
    expect(onRejectRequest).toHaveBeenCalledTimes(1);
    expect(onApprove).not.toHaveBeenCalled();
  });

  it('R-SPINE-WEB-APPROVE-UX-01: leave drawer exposes actionable Duyệt', () => {
    const onApprove = vi.fn();
    const onRejectRequest = vi.fn();
    render(
      <WorkflowTaskDetailDrawer
        {...baseProps}
        onApprove={onApprove}
        onRejectRequest={onRejectRequest}
      />,
    );

    const duyet = screen.getByRole('button', { name: 'Duyệt' });
    expect(duyet).not.toBeDisabled();
    expect(duyet.getAttribute('data-testid')).toBe('hdsd-cc-leave-approve');
    fireEvent.click(duyet);
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onRejectRequest).not.toHaveBeenCalled();
  });

  it('non-leave drawer keeps Hoàn thành / Xử lý nhanh accessible name', () => {
    render(<WorkflowTaskDetailDrawer {...baseProps} task={nonLeaveTask} />);
    expect(screen.getByRole('button', { name: 'Xử lý nhanh' })).toHaveTextContent('Hoàn thành');
  });

  it('R-XHRM-REC-WF-DEEPLINK-TASKID: blocks Xử lý when cardId is instance-only synthetic', () => {
    const synthetic: UnifiedTask = {
      ...task,
      cardId: 'inst-1',
      sourceId: 'inst-1',
      dedupeKey: 'wf-inst-inst-1',
    };
    render(<WorkflowTaskDetailDrawer {...baseProps} task={synthetic} />);

    expect(screen.getByRole('button', { name: 'Từ chối nhiệm vụ' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeDisabled();
  });
});
