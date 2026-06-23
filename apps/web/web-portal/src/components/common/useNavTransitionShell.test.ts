import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavTransitionShell } from './useNavTransitionShell';
import { NAV_TRANSITION_MIN_MS } from './navTransitionTiming';

describe('useNavTransitionShell', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts hidden on initial mount', () => {
    const { result } = renderHook(() => useNavTransitionShell('a'));
    expect(result.current.shellVisible).toBe(false);
  });

  it('shows shell when transitionKey changes then hides after min duration', () => {
    const { result, rerender } = renderHook(({ key }) => useNavTransitionShell(key), {
      initialProps: { key: 'a' },
    });

    rerender({ key: 'b' });
    expect(result.current.shellVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(NAV_TRANSITION_MIN_MS);
    });
    expect(result.current.shellVisible).toBe(false);
  });
});
