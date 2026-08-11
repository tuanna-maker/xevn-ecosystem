import React from 'react';
import { Button } from '@xevn/ui';

export type DashboardToolbarAction = {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  'data-testid'?: string;
};

type DashboardPageToolbarProps = {
  actions: DashboardToolbarAction[];
  'aria-label'?: string;
};

export const DashboardPageToolbar: React.FC<DashboardPageToolbarProps> = ({
  actions,
  'aria-label': ariaLabel = 'Thao tác dashboard',
}) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label={ariaLabel}
      data-testid="dashboard-page-toolbar"
    >
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant={action.variant ?? 'outline'}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          data-testid={action['data-testid'] ?? `dashboard-toolbar-${action.id}`}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};
