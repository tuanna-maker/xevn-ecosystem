/**
 * @CODE-MEMORY
 * Custom Hook: useDragOrdering
 * Purpose: Manage drag-and-drop item ordering, move-up / move-down position re-indexing,
 *   and hierarchical parent-child linking for interactive catalog UI screens.
 * SOLID: Decouples UI presentation from reordering state algorithms.
 */
import { useState, useCallback } from 'react';

export interface OrderableItem {
  id: string;
  sortOrder?: number;
  [key: string]: unknown;
}

export function useDragOrdering<T extends OrderableItem>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });
  }, []);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });
  }, []);

  return {
    items,
    setItems,
    moveUp,
    moveDown,
    reorder,
  };
}
