/**
 * @CODE-MEMORY
 * Screen: /tools-equipment · Công cụ & thiết bị (read-only / deferred)
 * UC: UC-HRM-27 (deferred)
 * BR: HRM_MENU_DATA_LINKAGE_MATRIX — tools_equipment has no Nest API in Phase 1
 * SRS: docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md § tools_equipment
 * TechSpec: Deferred — no GET/POST tools contract yet
 * Purpose: Honest empty list until tools API lands. No stub mutations or fake success toasts.
 * WorkItem: D-HRM-TOOLS-STUB-TOAST-01
 * Coded: 2026-07-17
 * Callers: pages/ToolsEquipment.tsx, components/reports/ToolsReportTab.tsx
 * Callees: React Query (empty list until API contract exists)
 * FEActions: View only — no Add/Edit/Delete / assignment mutate
 * Impact: Fake CRUD toasts mislead users into believing persist succeeded
 * must_keep: No fake success toast on stub mutations; read-only export surface
 * SOLID: Query-only hook; no mutation façade without API contract
 * LastVerified: hooks/useToolsEquipment.test.ts
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface ToolEquipment {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  specifications: string | null;
  unit: string;
  quantity: number;
  available_quantity: number;
  condition: string;
  location: string | null;
  purchase_date: string | null;
  purchase_price: number;
  warranty_expiry: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolAssignment {
  id: string;
  company_id: string;
  tool_id: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  assignment_type: string;
  quantity: number;
  assignment_date: string;
  return_date: string | null;
  condition_on_assign: string | null;
  condition_on_return: string | null;
  notes: string | null;
  approved_by: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Honest copy when user expects CRUD — tools API is deferred in Phase 1. */
export const TOOLS_MUTATION_UNSUPPORTED_VI =
  'Thêm/sửa/xóa CCDC và phiếu cấp phát chưa hỗ trợ — module đang chờ API HRM (Phase 2).';

export const TOOLS_READ_ONLY = true as const;

export function useToolsEquipment() {
  const { currentCompanyId } = useAuth();

  const toolsQuery = useQuery({
    queryKey: ['tools-equipment', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      // No Nest list contract for tools yet — empty is honest (not mock).
      return [] as ToolEquipment[];
    },
    enabled: !!currentCompanyId,
  });

  const assignmentsQuery = useQuery({
    queryKey: ['tool-assignments', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      return [] as ToolAssignment[];
    },
    enabled: !!currentCompanyId,
  });

  return {
    tools: toolsQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    isLoading: toolsQuery.isLoading || assignmentsQuery.isLoading,
  };
}
