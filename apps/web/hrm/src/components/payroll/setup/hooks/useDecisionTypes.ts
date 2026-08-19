/**
 * @CODE-MEMORY
 * Custom Hook: useDecisionTypes
 * Purpose:     Dependency Inversion (D) & Single Responsibility (S) for Decision Types catalog state
 * WorkItem:    D-PO-HRM-HOOK-DECISION-TYPES-01
 * solid_convention_ack: Encapsulate data fetching, searching, and extension creation logic out of UI view.
 */
import { useState, useMemo } from 'react';
import type { DecisionTypeItem } from '../types/catalogTypes';

const SAMPLE_DECISION_TYPES: DecisionTypeItem[] = [
  { id: 'dec1', code: 'DEC_REWARD', name: 'Quyết định Khen thưởng', origin: 'holding', status: 'active' },
  { id: 'dec2', code: 'DEC_DISCIPLINE', name: 'Quyết định Kỷ luật', origin: 'holding', status: 'active' },
  { id: 'dec3', code: 'DEC_SALARY_ADJUSTMENT', name: 'Quyết định Điều chỉnh lương', origin: 'holding', status: 'active' },
  { id: 'dec4', code: 'DEC_PROMOTION', name: 'Quyết định Bổ nhiệm / Thăng tiến', origin: 'holding', status: 'active' },
  { id: 'dec5', code: 'DEC_TERMINATION', name: 'Quyết định Chấm dứt HĐLĐ', origin: 'holding', status: 'active' },
  { id: 'dec6', code: 'DEC_TRANSFER', name: 'Quyết định Điều chuyển công tác', origin: 'holding', status: 'active' },
  { id: 'dec7', code: 'DEC_REAPPOINTMENT', name: 'Quyết định Bổ nhiệm lại', origin: 'holding', status: 'active' },
];

export function useDecisionTypes() {
  const [items, setItems] = useState<DecisionTypeItem[]>(SAMPLE_DECISION_TYPES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [items, searchTerm]);

  const addExtensionItem = (code: string, name: string) => {
    if (!code || !name) return;
    const newItem: DecisionTypeItem = {
      id: `dec_ext_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      origin: 'extension',
      status: 'active',
    };
    setItems((prev) => [...prev, newItem]);
    setIsAddDialogOpen(false);
  };

  return {
    items: filteredItems,
    searchTerm,
    setSearchTerm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    addExtensionItem,
  };
}
