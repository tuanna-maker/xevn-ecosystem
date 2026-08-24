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
import { useListPolicyPacks } from '@/components/payroll/policy-pack/usePolicyPackApi';

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
  created_at: string;
  updated_at: string;
  positions?: any[];
  applies_to?: string[];
}

export const PROCESSES_MUTATION_UNSUPPORTED_VI =
  'Thêm/sửa/xóa quy trình chưa hỗ trợ trên HRM. Cấu hình mã quy trình được quản lý tại Command Center.';

export const PROCESSES_READ_ONLY = true as const;

export function useProcesses() {
  const { currentCompanyId } = useAuth();
  
  const policiesQuery = useListPolicyPacks('CHUNG');

  const workflowsQuery = useQuery({
    queryKey: ['company-processes-workflows', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const results: CompanyProcess[] = [];
      try {
        const workflowsRaw = localStorage.getItem('hrm.workflow-configs.v3');
        if (workflowsRaw) {
          const parsed = JSON.parse(workflowsRaw);
          const workflows = parsed.workflows;
          const types = parsed.types || [];
          
          if (Array.isArray(workflows)) {
            for (const wf of workflows) {
              const typeObj = types.find((t: any) => t.id === wf.typeId);
              const categoryName = typeObj ? typeObj.name : (wf.typeId || null);

              let contentStr = '';
              if (wf.appliesTo && wf.appliesTo.length > 0) {
                const appliesMap: Record<string, string> = {
                  recruitment: 'Tuyển dụng',
                  onboarding: 'Onboarding',
                  employee_record: 'Hồ sơ nhân sự',
                  contract: 'Hợp đồng',
                  decision: 'Quyết định',
                  salary: 'Lương',
                  insurance: 'Bảo hiểm'
                };
                const appliesToLabels = wf.appliesTo.map((a: string) => appliesMap[a] || a);
                contentStr += `PHẠM VI ÁP DỤNG:\n- ${appliesToLabels.join(', ')}\n\n`;
              }

              if (wf.positions && wf.positions.length > 0) {
                contentStr += `VỊ TRÍ TUYỂN DỤNG:\n`;
                wf.positions.forEach((pos: any, idx: number) => {
                  contentStr += `${idx + 1}. ${pos.positionName || 'Chưa rõ'}`;
                  if (pos.quantity) contentStr += ` (Số lượng: ${pos.quantity})`;
                  if (pos.department) contentStr += ` - Phòng ban: ${pos.department}`;
                  contentStr += `\n`;
                  if (pos.salaryMin || pos.salaryMax) {
                    contentStr += `   Mức lương: ${pos.salaryMin || '0'} - ${pos.salaryMax || 'Không giới hạn'}\n`;
                  }
                });
                contentStr += `\n`;
              }

              if (wf.steps && wf.steps.length > 0) {
                contentStr += `CÁC BƯỚC THỰC HIỆN:\n`;
                wf.steps.forEach((step: any, idx: number) => {
                  contentStr += `${idx + 1}. ${step.name || 'Bước ' + (idx + 1)}`;
                  if (step.slaHours) contentStr += ` (SLA: ${step.slaHours}h)`;
                  contentStr += `\n`;
                  if (step.requiredInfo) contentStr += `   Yêu cầu: ${step.requiredInfo}\n`;
                });
              }

              results.push({
                id: wf.id,
                company_id: currentCompanyId,
                type: 'process',
                name: wf.name || 'Quy trình chưa đặt tên',
                code: wf.code || null,
                category: categoryName,
                department: null,
                description: typeObj ? typeObj.description : null,
                content: contentStr || null,
                steps: wf.steps,
                positions: wf.positions,
                applies_to: wf.appliesTo,
                status: wf.status || 'draft',
                effective_date: null,
                expiry_date: null,
                version: 1,
                issuing_authority: null,
                file_urls: [],
                created_by: null,
                created_at: wf.createdAt || '2026-08-24T13:50:00.000Z',
                updated_at: wf.updatedAt || wf.createdAt || '2026-08-24T13:50:00.000Z',
              });
            }
          }
        }
      } catch (e) {
        console.error('Failed to load workflow configs', e);
      }
      return results;
    },
    enabled: !!currentCompanyId,
  });

  const mergedData = [
    ...(workflowsQuery.data || []),
    ...(policiesQuery.data || []).map(p => ({
      id: p.id,
      company_id: currentCompanyId || '',
      type: 'policy',
      name: p.nameVi || 'Chính sách chưa đặt tên',
      code: p.code || null,
      category: p.scope,
      department: null,
      description: null,
      content: null,
      steps: null,
      status: p.status || 'draft',
      effective_date: p.effectiveFrom || null,
      expiry_date: p.effectiveTo || null,
      version: 1,
      issuing_authority: null,
      file_urls: [],
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as CompanyProcess))
  ];

  return {
    data: mergedData,
    isLoading: workflowsQuery.isLoading || policiesQuery.isLoading,
  };
}
