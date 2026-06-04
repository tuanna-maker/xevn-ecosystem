import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('WorkflowTaskDetailDrawer', () => {
  it('UC-CC-P0-06: renders instance id and workflow steps from normalized detail', () => {
    render(
      <WorkflowTaskDetailDrawer
        open
        task={task}
        detail={{
          instance: { id: 'inst-1', status: 'pending' },
          tasks: [{ id: 's1', step_key: 'dept_head', status: 'pending' }],
        }}
        loading={false}
        detailLoadFailed={false}
        busy={false}
        inboxFromApi
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByText(/inst-1/)).toBeTruthy();
    expect(screen.getByText('dept_head')).toBeTruthy();
    expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
  });

  it('shows load failure when detail API returns empty', () => {
    render(
      <WorkflowTaskDetailDrawer
        open
        task={task}
        detail={null}
        loading={false}
        detailLoadFailed
        busy={false}
        inboxFromApi
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/instances\/:id\/detail/);
  });

  it('blocks complete actions when inbox not from API', () => {
    render(
      <WorkflowTaskDetailDrawer
        open
        task={task}
        detail={{ instance: { id: 'inst-1' }, tasks: [] }}
        loading={false}
        detailLoadFailed={false}
        busy={false}
        inboxFromApi={false}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    const completeButtons = screen.getAllByRole('button', { name: 'Xử lý nhanh' });
    expect(completeButtons).toHaveLength(2);
    completeButtons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
