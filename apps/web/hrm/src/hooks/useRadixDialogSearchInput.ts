/**
 * Giữ focus ô tìm kiếm trong Dialog Radix khi danh sách gợi ý re-render (DEF-PAY-FIELD-SEARCH-FOCUS-01).
 * Radix FocusScope có thể cướp focus sau mỗi keystroke — blur đồng bộ không được clear cờ ngay.
 */
import { useCallback, useRef, type ChangeEvent } from 'react';

type SearchSelection = { start: number; end: number };

export function useRadixDialogSearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const retainFocusRef = useRef(false);
  const selectionRef = useRef<SearchSelection | null>(null);
  const blurClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchFocus = useCallback(() => {
    if (blurClearTimerRef.current) {
      clearTimeout(blurClearTimerRef.current);
      blurClearTimerRef.current = null;
    }
    retainFocusRef.current = true;
  }, []);

  const onSearchBlur = useCallback(() => {
    if (blurClearTimerRef.current) {
      clearTimeout(blurClearTimerRef.current);
    }
    blurClearTimerRef.current = setTimeout(() => {
      blurClearTimerRef.current = null;
      const active = document.activeElement;
      if (active === inputRef.current) return;
      if (panelRef.current?.contains(active)) return;
      retainFocusRef.current = false;
    }, 0);
  }, []);

  const captureSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    retainFocusRef.current = true;
    selectionRef.current = {
      start: event.target.selectionStart ?? event.target.value.length,
      end: event.target.selectionEnd ?? event.target.value.length,
    };
    return event.target.value;
  }, []);

  const restoreSearchFocus = useCallback(() => {
    if (!retainFocusRef.current || !inputRef.current) return;
    const el = inputRef.current;
    if (document.activeElement === el) return;
    el.focus({ preventScroll: true });
    const sel = selectionRef.current;
    const start = sel?.start ?? el.value.length;
    const end = sel?.end ?? el.value.length;
    try {
      el.setSelectionRange(start, end);
    } catch {
      // JSDOM / edge browsers
    }
  }, []);

  return {
    inputRef,
    panelRef,
    onSearchFocus,
    onSearchBlur,
    captureSearchChange,
    restoreSearchFocus,
  };
}
