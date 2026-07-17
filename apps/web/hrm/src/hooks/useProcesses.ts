/**
 * @CODE-MEMORY
 * Screen: /processes · Quy trình & Quy định (read-only)
 * UC: XBOS-DM-HRM-14
 * BR: HRM menu processes = workflow ref only (XBOS); no HRM CRUD
 * SRS: docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md §2.1 processes
 * TechSpec: Workflow codes §55–58; catalog synced
 * Purpose: List company process/policy refs for viewing. Mutations are out of scope
 *   until BA expands XBOS-DM-HRM-14 — do not fake success toasts.
 * WorkItem: P1-HRM-PROCESSES-FE-01
 * Coded: 2026-07-17
 * Callers: pages/Processes.tsx
 * Callees: React Query (empty list until catalog/API contract exists)
 * FEActions: View only — no Add/Edit/Delete
 * Impact: Fake CRUD toasts mislead users into believing persist succeeded
 * must_keep: No fake success toast on stub mutations; read-only export surface
 * SOLID: Query-only hook; no mutation façade without API contract
 * LastVerified: hooks/useProcesses.test.ts
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface CompanyProcess {
  id: string;
  company_id: string;
  type: string;
  name: string;
  code: string | null;
  category: string | null;
  department: string | null;
  description: string | null;
  content: string | null;
  steps: unknown;
  status: string;
  effective_date: string | null;
  expiry_date: string | null;
  version: number;
  issuing_authority: string | null;
  file_urls: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Honest copy when user expects CRUD — XBOS-DM-HRM-14 is read-only in HRM. */
export const PROCESSES_MUTATION_UNSUPPORTED_VI =
  'Thêm/sửa/xóa quy trình chưa hỗ trợ trên HRM — cấu hình mã quy trình nằm ở XBOS (XBOS-DM-HRM-14).';

export const PROCESSES_READ_ONLY = true as const;

export function useProcesses() {
  const { currentCompanyId } = useAuth();

  const query = useQuery({
    queryKey: ['company-processes', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      // No Nest list contract for company_processes yet — empty is honest (not mock).
      return [] as CompanyProcess[];
    },
    enabled: !!currentCompanyId,
  });

  return query;
}
