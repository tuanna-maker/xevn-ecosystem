/**
 * D-UX-EMPTY-STATE-FE-01 — EmptyState moods smoke
 */
import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  EMPTY_STATE_MOODS,
  EMPTY_STATE_VI,
  isEmptyStateMood,
} from './emptyStateSot';
import { EmptyState } from './EmptyState';

function renderEmpty(props: Parameters<typeof EmptyState>[0] = {}) {
  return render(
    createElement(MemoryRouter, null, createElement(EmptyState, props)),
  );
}

describe('D-UX-EMPTY-STATE-FE-01 — EmptyState moods', () => {
  afterEach(() => {
    cleanup();
  });

  it('SoT exposes exactly none/error/permission with VI CTA labels', () => {
    expect([...EMPTY_STATE_MOODS]).toEqual(['none', 'error', 'permission']);
    expect(isEmptyStateMood('none')).toBe(true);
    expect(isEmptyStateMood('error')).toBe(true);
    expect(isEmptyStateMood('permission')).toBe(true);
    expect(isEmptyStateMood('loading')).toBe(false);
    expect(EMPTY_STATE_VI.none.actionLabel).toBe('Thêm mới');
    expect(EMPTY_STATE_VI.error.actionLabel).toBe('Thử lại');
    expect(EMPTY_STATE_VI.permission.actionLabel).toBe('Liên hệ HR');
  });

  it('mood=none — VI defaults + CTA fires onAction', () => {
    const onAction = vi.fn();
    renderEmpty({ mood: 'none', onAction });
    const root = screen.getByTestId('hrm-empty-state');
    expect(root.getAttribute('data-mood')).toBe('none');
    expect(screen.getByText(EMPTY_STATE_VI.none.title)).toBeTruthy();
    expect(screen.getByText(EMPTY_STATE_VI.none.description)).toBeTruthy();
    fireEvent.click(screen.getByTestId('hrm-empty-state-cta'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('mood=error — VI defaults + Thử lại', () => {
    const onAction = vi.fn();
    renderEmpty({ mood: 'error', onAction });
    expect(screen.getByTestId('hrm-empty-state').getAttribute('data-mood')).toBe(
      'error',
    );
    expect(screen.getByText(EMPTY_STATE_VI.error.title)).toBeTruthy();
    fireEvent.click(screen.getByTestId('hrm-empty-state-cta'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('mood=permission — VI defaults + Liên hệ HR href', () => {
    renderEmpty({ mood: 'permission', actionHref: 'mailto:hr@xe.vn' });
    expect(screen.getByTestId('hrm-empty-state').getAttribute('data-mood')).toBe(
      'permission',
    );
    expect(screen.getByText(EMPTY_STATE_VI.permission.title)).toBeTruthy();
    const cta = screen.getByTestId('hrm-empty-state-cta');
    expect(cta.textContent).toBe(EMPTY_STATE_VI.permission.actionLabel);
    expect(cta.getAttribute('href')).toBe('mailto:hr@xe.vn');
  });

  it('hides CTA when no action target', () => {
    renderEmpty({ mood: 'none', title: 'Trống', description: 'Không CTA' });
    expect(screen.queryByTestId('hrm-empty-state-cta')).toBeNull();
  });

  it('Dashboard + Contracts wire EmptyState (must_keep surfaces untouched)', () => {
    const dash = readFileSync(join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');
    const contracts = readFileSync(
      join(process.cwd(), 'src/pages/Contracts.tsx'),
      'utf8',
    );
    expect(dash).toMatch(/from '@\/components\/hrm\/EmptyState'/);
    expect(dash).toMatch(/dashboard-newest-employees-empty/);
    expect(dash).toMatch(/dashboard-dept-salary-empty/);
    expect(contracts).toMatch(/from '@\/components\/hrm\/EmptyState'/);
    expect(contracts).toMatch(/contracts-list-empty/);
    expect(contracts).toMatch(/mood="error"/);
    // must_keep — this WI must not edit Clock-In / taxSettlement / Profile
    const clockIn = readFileSync(
      join(process.cwd(), 'src/lib/clockInMethods.ts'),
      'utf8',
    );
    expect(clockIn).toMatch(/LEGACY_CLOCK_IN_TYPES|ClockIn/);
  });
});
