/**
 * Cài đặt HRM — menu nhóm dọc (AMIS-style) + vùng nội dung.
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 */
import { cn } from '@/lib/utils';
import {
  SETTINGS_NAV_GROUPS,
  type SettingsTabId,
} from '@/lib/settingsNavigation';

import type { ReactNode } from 'react';

export type SettingsNavLayoutProps = {
  activeTab: SettingsTabId;
  onSelectTab: (tab: SettingsTabId) => void;
  children: ReactNode;
};

export function SettingsNavLayout({ activeTab, onSelectTab, children }: SettingsNavLayoutProps) {
  return (
    <div className="flex min-h-0 flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-3">
      <nav
        className="w-full shrink-0 lg:sticky lg:top-0 lg:w-[13.5rem]"
        aria-label="Cài đặt HRM"
        data-testid="settings-nav-sidebar"
      >
        <div className="max-h-[min(calc(100dvh-7.5rem),820px)] overflow-y-auto rounded-card border border-xevn-border bg-surface/80 p-1 shadow-soft backdrop-blur-md lg:min-h-[min(calc(100dvh-7.5rem),820px)]">
          {SETTINGS_NAV_GROUPS.map((group) => (
            <div key={group.groupId} className="mb-3 last:mb-0">
              <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-xevn-textMuted">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        data-testid={item.testId ?? `settings-nav-${item.id}`}
                        onClick={() => onSelectTab(item.id)}
                        className={cn(
                          'flex h-10 w-full items-center gap-2 rounded-input px-2.5 text-left text-sm transition-colors',
                          active
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-xevn-textSecondary hover:bg-muted/80 hover:text-xevn-text',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      <div className="min-w-0 w-full max-w-none flex-1" data-testid="settings-content-pane">
        {children}
      </div>
    </div>
  );
}
