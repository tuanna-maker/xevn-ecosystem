/**
 * @CODE-MEMORY
 * Custom Hook: useOvertimeTypes
 * Purpose:     Dependency Inversion (D) & Single Responsibility (S) for Overtime Types state
 * WorkItem:    D-PO-HRM-HOOK-OVERTIME-TYPES-01
 * solid_convention_ack: Encapsulate OT multiplier and driver exclusion logic out of UI view.
 */
import { useState } from 'react';
import type { OvertimeTypeItem } from '../types/catalogTypes';

const SAMPLE_OT_TYPES: OvertimeTypeItem[] = [
  { id: 'ot1', code: 'OT_WEEKDAY', name: 'OT Ngày thường (150%)', multiplier: 1.5, excludedGroup: 'Lái xe tải & Lái xe đường dài', status: 'active' },
  { id: 'ot2', code: 'OT_WEEKEND', name: 'OT Ngày nghỉ hàng tuần (200%)', multiplier: 2.0, excludedGroup: 'Lái xe tải & Lái xe đường dài', status: 'active' },
  { id: 'ot3', code: 'OT_HOLIDAY', name: 'OT Ngày lễ, Tết (300%)', multiplier: 3.0, excludedGroup: 'Lái xe tải & Lái xe đường dài', status: 'active' },
];

export function useOvertimeTypes() {
  const [items] = useState<OvertimeTypeItem[]>(SAMPLE_OT_TYPES);

  return {
    items,
  };
}
