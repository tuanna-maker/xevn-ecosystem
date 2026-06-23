import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Defer SwipeableRow mount until after tab/stack transition + gesture root paint.
 * R-W7-MOB-LEAVE-NAV-01-R4 — manager inbox with pending rows crashed before GH tree ready.
 */
export function useDeferredSwipeMount(): boolean {
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setReady(false);
      let cancelled = false;
      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setReady(true);
          });
        });
      });
      return () => {
        cancelled = true;
        task.cancel();
        setReady(false);
      };
    }, []),
  );

  return ready;
}
