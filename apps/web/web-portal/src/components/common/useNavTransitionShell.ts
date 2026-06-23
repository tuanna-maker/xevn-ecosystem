import { useEffect, useRef, useState } from 'react';
import { NAV_TRANSITION_MIN_MS } from './navTransitionTiming';

/**
 * Shows a navigation skeleton overlay for at least NAV_TRANSITION_MIN_MS when `transitionKey` changes.
 * Used for CC settings panel swap, HRM embed route changes, and similar G-UX-03 NAV flows.
 */
export function useNavTransitionShell(transitionKey: string) {
  const [shellVisible, setShellVisible] = useState(false);
  const prevKeyRef = useRef(transitionKey);

  useEffect(() => {
    if (transitionKey === prevKeyRef.current) return;
    prevKeyRef.current = transitionKey;
    setShellVisible(true);
    const hideTimer = window.setTimeout(() => setShellVisible(false), NAV_TRANSITION_MIN_MS);
    return () => window.clearTimeout(hideTimer);
  }, [transitionKey]);

  return { shellVisible };
}
