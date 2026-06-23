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
  subtitle: 'hrm_leave',
  assigneeUserId: 'user-1',
  assigneeName: 'Nguyễn Văn A',
  priority: 'medium',
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
    expect(screen.getByRole('button', { name: 'Xử lý nhanh' })).toBeDisabled();
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

  it('approve triggers onApprove directly', () => {
    const onApprove = vi.fn();
    const onRejectRequest = vi.fn();
    render(
      <WorkflowTaskDetailDrawer
        {...baseProps}
        onApprove={onApprove}
        onRejectRequest={onRejectRequest}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xử lý nhanh' }));
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onRejectRequest).not.toHaveBeenCalled();
  });
});
