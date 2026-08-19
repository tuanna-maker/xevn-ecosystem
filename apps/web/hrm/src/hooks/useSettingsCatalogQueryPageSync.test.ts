import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSettingsCatalogQueryPageSync } from './useSettingsCatalogQueryPageSync';

describe('useSettingsCatalogQueryPageSync — FE-04 mount skip', () => {
  it('does not reset page on mount (avoids clobbering F5 focus jump)', () => {
    const setPage = vi.fn();
    renderHook(() => useSettingsCatalogQueryPageSync('', setPage));
    expect(setPage).not.toHaveBeenCalled();
  });

  it('resets page to 1 when q changes after mount', () => {
    const setPage = vi.fn();
    const { rerender } = renderHook(
      ({ q }: { q: string }) => useSettingsCatalogQueryPageSync(q, setPage),
      { initialProps: { q: '' } },
    );
    expect(setPage).not.toHaveBeenCalled();

    rerender({ q: 'rt2' });
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('does not reset page when q becomes bootstrap focus slug (FE-06)', () => {
    const setPage = vi.fn();
    const { rerender } = renderHook(
      ({ q }: { q: string }) =>
        useSettingsCatalogQueryPageSync(q, setPage, { bootstrapFocusQuery: 'rt2slug' }),
      { initialProps: { q: '' } },
    );
    rerender({ q: 'rt2slug' });
    expect(setPage).not.toHaveBeenCalled();
  });

  it('resets again when user clears search', () => {
    const setPage = vi.fn();
    const { rerender } = renderHook(
      ({ q }: { q: string }) => useSettingsCatalogQueryPageSync(q, setPage),
      { initialProps: { q: 'a' } },
    );
    setPage.mockClear();

    rerender({ q: '' });
    expect(setPage).toHaveBeenCalledWith(1);
  });
});
