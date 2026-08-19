import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { fetchCommandCenterInboxTasks } = vi.hoisted(() => ({
  fetchCommandCenterInboxTasks: vi.fn(),
}));

vi.mock('../../integrations/commandCenterInboxApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../integrations/commandCenterInboxApi')>();
  return {
    ...actual,
    fetchCommandCenterInboxTasks,
  };
});

vi.mock('../../components/command-center/CapabilityActionButton', () => ({
  CapabilityActionButton: ({
    children,
    onClick,
    className,
    accessibleName,
    'data-testid': dataTestId,
  }: {
    children: unknown;
    onClick?: () => void;
    className?: string;
    accessibleName?: string;
    'data-testid'?: string;
  }) => (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={accessibleName}
      data-testid={dataTestId}
    >
      {children as never}
    </button>
  ),
}));

vi.mock('../../components/common/ApiLoadBanner', () => ({
  ApiLoadBanner: () => null,
}));

import CommandCenterInboxPage from './CommandCenterInboxPage';

describe('CommandCenterInboxPage (D-HDSD-WF-INBOX-FE-01)', () => {
  beforeEach(() => {
    fetchCommandCenterInboxTasks.mockReset();
  });

  it('mounts inbox panel and loads workflow tasks on nav', async () => {
    fetchCommandCenterInboxTasks.mockResolvedValue([
      {
        cardId: 'task-1',
        sourceSystem: 'xbos-workflow',
        sourceId: 'inst-1',
        dedupeKey: 'wf-task-task-1',
        statusNormalized: 'PENDING_APPROVAL',
        orgUnitId: 'main',
        moduleCode: 'hrm',
        title: 'Phê duyệt nghỉ phép',
        subtitle: 'Nghỉ phép',
        businessType: 'hrm_leave',
        assigneeUserId: 'ceo@xe.vn',
        assigneeName: 'ceo@xe.vn',
        priority: 'medium',
      },
    ]);

    render(
      <MemoryRouter initialEntries={['/command-center/inbox']}>
        <CommandCenterInboxPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('cc-inbox-panel')).toBeTruthy();

    await waitFor(() => {
      expect(fetchCommandCenterInboxTasks).toHaveBeenCalled();
      expect(screen.getByTestId('cc-inbox-task-card')).toBeTruthy();
    });
    expect(screen.getAllByText(/Nghỉ phép/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Duyệt' })).toBeTruthy();
    expect(screen.getByTestId('hdsd-cc-leave-approve')).toBeTruthy();
  });
});
