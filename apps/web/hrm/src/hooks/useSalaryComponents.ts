/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Thành phần lương (API hook)
 * UC:         UC-HRM-28 · FR-HRM-SC-PAY-01
 * Purpose:    CRUD salary_components TX qua Nest payroll API.
 * WorkItem:   D-FE-ERP-E2-01
 * Coded:      2026-07-28
 * Callers:    SalaryComponentsTab
 * Callees:    hrmApi list/create/update/delete salary-components
 * must_keep:  component_type = pay_types code (FE picker); không HARDCODE SoT
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: listCompanyId scope (U19) + invalidate peer key note; Nest SoT for consumers.
 * must_keep: payroll_e2e_ready=false · no Settings sole SoT · U65
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  createSalaryComponent,
  createSalaryComponentCategory,
  deleteSalaryComponent,
  deleteSalaryComponentCategory,
  listSalaryComponentCategories,
  listSalaryComponents,
  updateSalaryComponent,
} from '@/integrations/hrmApi';
import { SALARY_COMPONENTS_EFFECTIVE_QUERY_KEY } from '@/hooks/useSalaryComponentsEffective';
import { useQueryClient } from '@tanstack/react-query';

export interface SalaryComponentCategory {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalaryComponent {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category_id?: string;
  component_type: string;
  nature: 'income' | 'deduction' | 'other';
  value_type: 'currency' | 'number' | 'percentage';
  is_taxable: boolean;
  is_insurance_base: boolean;
  formula?: string;
  default_value: number;
  min_value?: number;
  max_value?: number;
  description?: string;
  applied_to: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: SalaryComponentCategory;
}

export interface SalaryComponentFormData {
  code: string;
  name: string;
  category_id?: string;
  component_type: string;
  nature: 'income' | 'deduction' | 'other';
  value_type: 'currency' | 'number' | 'percentage';
  is_taxable: boolean;
  is_insurance_base: boolean;
  formula?: string;
  default_value: number;
  min_value?: number;
  max_value?: number;
  description?: string;
  applied_to: string;
  is_active: boolean;
  sort_order: number;
}

export interface CategoryFormData {
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export const systemSalaryComponents = [
  { code: 'SO_NGAY_NGHI_BU', name: 'Số ngày nghỉ bù', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'LUONG_CO_BAN', name: 'Lương cơ bản', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'THUE_TNCN_HT', name: 'Thuế TNCN', componentType: 'Thuế', nature: 'deduction' as const, isTaxable: false },
];

/** @deprecated E2 — nature SoT = Settings `pay_types` via payTypeOptionsFromCatalog. Kept empty export for grep-safe removal. */
export const componentTypes: readonly string[] = [];

function mapComponent(row: Record<string, unknown>): SalaryComponent {
  const category = row.category as SalaryComponentCategory | null | undefined;
  return {
    ...(row as SalaryComponent),
    default_value: Number(row.default_value ?? 0),
    sort_order: Number(row.sort_order ?? 0),
    is_taxable: Boolean(row.is_taxable),
    is_insurance_base: Boolean(row.is_insurance_base),
    is_active: Boolean(row.is_active),
    category: category ?? undefined,
  };
}

export const useSalaryComponents = () => {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [categories, setCategories] = useState<SalaryComponentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invalidateEffectivePickers = () => {
    void queryClient.invalidateQueries({ queryKey: [SALARY_COMPONENTS_EFFECTIVE_QUERY_KEY] });
  };

  const fetchComponents = async () => {
    if (!companyId) {
      setComponents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await listSalaryComponents(companyId);
      setComponents((res.data ?? []).map(mapComponent));
    } catch (err: unknown) {
      console.error('Error fetching salary components:', err);
      setError(toErrorMessage(err, 'Không thể tải danh sách thành phần lương'));
      setComponents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!companyId) {
      setCategories([]);
      return;
    }
    try {
      const res = await listSalaryComponentCategories(companyId);
      setCategories((res.data ?? []) as SalaryComponentCategory[]);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const createComponent = async (formData: SalaryComponentFormData): Promise<SalaryComponent | null> => {
    if (!companyId) {
      toast.error('Vui lòng chọn công ty');
      return null;
    }
    try {
      await createSalaryComponent({ company_id: companyId, ...formData });
      toast.success('Thêm thành phần lương thành công');
      await fetchComponents();
      invalidateEffectivePickers();
      return null;
    } catch (err: unknown) {
      console.error('Error creating salary component:', err);
      toast.error(toErrorMessage(err, 'Không thể thêm thành phần lương'));
      return null;
    }
  };

  const updateComponent = async (
    id: string,
    formData: Partial<SalaryComponentFormData>,
  ): Promise<boolean> => {
    if (!companyId) return false;
    try {
      await updateSalaryComponent(id, companyId, formData);
      toast.success('Cập nhật thành phần lương thành công');
      await fetchComponents();
      invalidateEffectivePickers();
      return true;
    } catch (err: unknown) {
      console.error('Error updating salary component:', err);
      toast.error(toErrorMessage(err, 'Không thể cập nhật thành phần lương'));
      return false;
    }
  };

  const deleteComponent = async (id: string): Promise<boolean> => {
    if (!companyId) return false;
    try {
      await deleteSalaryComponent(id, companyId);
      toast.success('Xóa thành phần lương thành công');
      await fetchComponents();
      invalidateEffectivePickers();
      return true;
    } catch (err: unknown) {
      console.error('Error deleting salary component:', err);
      toast.error(toErrorMessage(err, 'Không thể xóa thành phần lương'));
      return false;
    }
  };

  const toggleComponentStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateComponent(id, { is_active: isActive });
  };

  const createCategory = async (formData: CategoryFormData): Promise<SalaryComponentCategory | null> => {
    if (!companyId) return null;
    try {
      const created = await createSalaryComponentCategory({ company_id: companyId, ...formData });
      toast.success('Thêm nhóm thành phần thành công');
      await fetchCategories();
      return created as SalaryComponentCategory;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể thêm nhóm thành phần'));
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!companyId) return false;
    try {
      await deleteSalaryComponentCategory(id, companyId);
      toast.success('Xóa nhóm thành phần thành công');
      await fetchCategories();
      return true;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể xóa nhóm thành phần'));
      return false;
    }
  };

  const initializeDefaultComponents = async (): Promise<boolean> => {
    if (!companyId) return false;
    try {
      for (const [idx, item] of systemSalaryComponents.entries()) {
        await createSalaryComponent({
          company_id: companyId,
          code: item.code,
          name: item.name,
          component_type: item.componentType,
          nature: item.nature,
          value_type: 'number',
          is_taxable: item.isTaxable,
          is_insurance_base: false,
          default_value: 0,
          applied_to: 'all',
          is_active: true,
          sort_order: idx,
        });
      }
      await fetchComponents();
      invalidateEffectivePickers();
      toast.success('Đã khởi tạo thành phần lương mặc định');
      return true;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể khởi tạo thành phần mặc định'));
      return false;
    }
  };

  useEffect(() => {
    void fetchComponents();
    void fetchCategories();
  }, [companyId]);

  return {
    components,
    categories,
    isLoading,
    error,
    systemSalaryComponents,
    componentTypes,
    fetchComponents,
    fetchCategories,
    createComponent,
    updateComponent,
    deleteComponent,
    toggleComponentStatus,
    createCategory,
    deleteCategory,
    initializeDefaultComponents,
  };
};
