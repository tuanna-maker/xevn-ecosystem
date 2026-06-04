import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export const componentTypes = [
  'Chấm công',
  'Lương',
  'Bảo hiểm - Công đoàn',
  'Phụ cấp',
  'Thưởng',
  'Thuế',
  'Khấu trừ',
  'Thu nhập khác',
  'Trợ cấp',
  'Doanh số',
  'KPI',
  'Sản phẩm',
  'Tổng hợp',
];

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
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [categories, setCategories] = useState<SalaryComponentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    if (!currentCompanyId) {
      setComponents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await listSalaryComponents(currentCompanyId);
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
    if (!currentCompanyId) {
      setCategories([]);
      return;
    }
    try {
      const res = await listSalaryComponentCategories(currentCompanyId);
      setCategories((res.data ?? []) as SalaryComponentCategory[]);
    } catch (err: unknown) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const createComponent = async (formData: SalaryComponentFormData): Promise<SalaryComponent | null> => {
    if (!currentCompanyId) {
      toast.error('Vui lòng chọn công ty');
      return null;
    }
    try {
      await createSalaryComponent({ company_id: currentCompanyId, ...formData });
      toast.success('Thêm thành phần lương thành công');
      await fetchComponents();
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
    if (!currentCompanyId) return false;
    try {
      await updateSalaryComponent(id, currentCompanyId, formData);
      toast.success('Cập nhật thành phần lương thành công');
      await fetchComponents();
      return true;
    } catch (err: unknown) {
      console.error('Error updating salary component:', err);
      toast.error(toErrorMessage(err, 'Không thể cập nhật thành phần lương'));
      return false;
    }
  };

  const deleteComponent = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteSalaryComponent(id, currentCompanyId);
      toast.success('Xóa thành phần lương thành công');
      await fetchComponents();
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
    if (!currentCompanyId) return null;
    try {
      const created = await createSalaryComponentCategory({ company_id: currentCompanyId, ...formData });
      toast.success('Thêm nhóm thành phần thành công');
      await fetchCategories();
      return created as SalaryComponentCategory;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể thêm nhóm thành phần'));
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteSalaryComponentCategory(id, currentCompanyId);
      toast.success('Xóa nhóm thành phần thành công');
      await fetchCategories();
      return true;
    } catch (err: unknown) {
      toast.error(toErrorMessage(err, 'Không thể xóa nhóm thành phần'));
      return false;
    }
  };

  const initializeDefaultComponents = async (): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      for (const [idx, item] of systemSalaryComponents.entries()) {
        await createSalaryComponent({
          company_id: currentCompanyId,
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
  }, [currentCompanyId]);

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
