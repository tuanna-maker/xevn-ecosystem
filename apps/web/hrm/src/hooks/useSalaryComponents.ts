import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  // Join fields
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

// System salary components (read-only reference data)
export const systemSalaryComponents = [
  { code: 'SO_NGAY_NGHI_BU', name: 'Số ngày nghỉ bù', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_NGAY_NGHI_KHONG_LUONG', name: 'Số ngày nghỉ không lương', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_NGHI_LE', name: 'Số giờ nghỉ lễ', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_NGHI_BU', name: 'Số giờ nghỉ bù', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_DI_CONG_TAC', name: 'Số giờ đi công tác', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_NGHI_KHONG_LUONG', name: 'Số giờ nghỉ không lương', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_CA_NGHI_PHEP', name: 'Số ca nghỉ phép', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_CA_NGHI_LE', name: 'Số ca nghỉ lễ', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_CA_NGHI_BU', name: 'Số ca nghỉ bù', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_CA_DI_CONG_TAC', name: 'Số ca đi công tác', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_NGAY_LAM_VIEC', name: 'Số ngày làm việc thực tế', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_LAM_THEM', name: 'Số giờ làm thêm', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_LAM_DEM', name: 'Số giờ làm đêm', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_NGAY_CONG_CHUAN', name: 'Số ngày công chuẩn', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'SO_GIO_CONG_CHUAN', name: 'Số giờ công chuẩn', componentType: 'Chấm công', nature: 'other' as const, isTaxable: false },
  { code: 'LUONG_CO_BAN', name: 'Lương cơ bản', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'LUONG_NGAY_CONG', name: 'Lương ngày công', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'LUONG_THEO_GIO_HT', name: 'Lương theo giờ', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'LUONG_LAM_THEM_HT', name: 'Lương làm thêm giờ', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'LUONG_LAM_DEM', name: 'Lương làm đêm', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'LUONG_KPI_HT', name: 'Lương KPI', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'LUONG_DOANH_SO', name: 'Lương doanh số', componentType: 'Lương', nature: 'income' as const, isTaxable: true },
  { code: 'BHXH_NV', name: 'BHXH nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction' as const, isTaxable: false },
  { code: 'BHYT_NV', name: 'BHYT nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction' as const, isTaxable: false },
  { code: 'BHTN_NV', name: 'BHTN nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction' as const, isTaxable: false },
  { code: 'PHI_CONG_DOAN_NV', name: 'Phí công đoàn nhân viên', componentType: 'Bảo hiểm - Công đoàn', nature: 'deduction' as const, isTaxable: false },
  { code: 'BHXH_DN', name: 'BHXH doanh nghiệp', componentType: 'Bảo hiểm - Công đoàn', nature: 'other' as const, isTaxable: false },
  { code: 'BHYT_DN', name: 'BHYT doanh nghiệp', componentType: 'Bảo hiểm - Công đoàn', nature: 'other' as const, isTaxable: false },
  { code: 'BHTN_DN', name: 'BHTN doanh nghiệp', componentType: 'Bảo hiểm - Công đoàn', nature: 'other' as const, isTaxable: false },
  { code: 'PHU_CAP_AN_CA', name: 'Phụ cấp ăn ca', componentType: 'Phụ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'PHU_CAP_XANG_XE', name: 'Phụ cấp xăng xe', componentType: 'Phụ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'PHU_CAP_DIEN_THOAI_HT', name: 'Phụ cấp điện thoại', componentType: 'Phụ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'PHU_CAP_NHA_O', name: 'Phụ cấp nhà ở', componentType: 'Phụ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'PHU_CAP_TRACH_NHIEM', name: 'Phụ cấp trách nhiệm', componentType: 'Phụ cấp', nature: 'income' as const, isTaxable: true },
  { code: 'PHU_CAP_CHUYEN_CAN', name: 'Phụ cấp chuyên cần', componentType: 'Phụ cấp', nature: 'income' as const, isTaxable: true },
  { code: 'THUONG_THANG_HT', name: 'Thưởng tháng', componentType: 'Thưởng', nature: 'income' as const, isTaxable: true },
  { code: 'THUONG_QUY_HT', name: 'Thưởng quý', componentType: 'Thưởng', nature: 'income' as const, isTaxable: true },
  { code: 'THUONG_NAM', name: 'Thưởng năm', componentType: 'Thưởng', nature: 'income' as const, isTaxable: true },
  { code: 'THUONG_LE_TET', name: 'Thưởng lễ tết', componentType: 'Thưởng', nature: 'income' as const, isTaxable: true },
  { code: 'THUONG_NHAN_VIEN_XUAT_SAC', name: 'Thưởng nhân viên xuất sắc', componentType: 'Thưởng', nature: 'income' as const, isTaxable: true },
  { code: 'THUONG_HIEU_HI_SINH_NHAT', name: 'Hiếu/Hỉ/Sinh nhật', componentType: 'Thưởng', nature: 'income' as const, isTaxable: false },
  { code: 'THUE_TNCN_HT', name: 'Thuế TNCN', componentType: 'Thuế', nature: 'deduction' as const, isTaxable: false },
  { code: 'GIAM_TRU_GIA_CANH', name: 'Giảm trừ gia cảnh', componentType: 'Thuế', nature: 'other' as const, isTaxable: false },
  { code: 'GIAM_TRU_BAN_THAN', name: 'Giảm trừ bản thân', componentType: 'Thuế', nature: 'other' as const, isTaxable: false },
  { code: 'SO_NGUOI_PHU_THUOC', name: 'Số người phụ thuộc', componentType: 'Thuế', nature: 'other' as const, isTaxable: false },
  { code: 'TAM_UNG', name: 'Tạm ứng', componentType: 'Khấu trừ', nature: 'deduction' as const, isTaxable: false },
  { code: 'KHAU_TRU_KHAC', name: 'Khấu trừ khác', componentType: 'Khấu trừ', nature: 'deduction' as const, isTaxable: false },
  { code: 'THU_NHAP_KHAC', name: 'Thu nhập khác', componentType: 'Thu nhập khác', nature: 'income' as const, isTaxable: true },
  { code: 'TRO_CAP_THAI_SAN', name: 'Trợ cấp thai sản', componentType: 'Trợ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'TRO_CAP_THAT_NGHIEP', name: 'Trợ cấp thất nghiệp', componentType: 'Trợ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'TRO_CAP_OM_DAU', name: 'Trợ cấp ốm đau', componentType: 'Trợ cấp', nature: 'income' as const, isTaxable: false },
  { code: 'HOA_HONG', name: 'Hoa hồng', componentType: 'Doanh số', nature: 'income' as const, isTaxable: true },
  { code: 'DOANH_SO_BAN_HANG', name: 'Doanh số bán hàng', componentType: 'Doanh số', nature: 'other' as const, isTaxable: false },
  { code: 'DIEM_KPI', name: 'Điểm KPI', componentType: 'KPI', nature: 'other' as const, isTaxable: false },
  { code: 'TY_LE_HOAN_THANH_KPI', name: 'Tỷ lệ hoàn thành KPI', componentType: 'KPI', nature: 'other' as const, isTaxable: false },
  { code: 'SO_SAN_PHAM', name: 'Số sản phẩm', componentType: 'Sản phẩm', nature: 'other' as const, isTaxable: false },
  { code: 'LUONG_SAN_PHAM', name: 'Lương sản phẩm', componentType: 'Sản phẩm', nature: 'income' as const, isTaxable: true },
  { code: 'TONG_LUONG_GROSS', name: 'Tổng lương Gross', componentType: 'Tổng hợp', nature: 'other' as const, isTaxable: false },
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

export const useSalaryComponents = () => {
  const { currentCompanyId } = useAuth();
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [categories, setCategories] = useState<SalaryComponentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch salary components
  const fetchComponents = async () => {
    if (!currentCompanyId) {
      setComponents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('salary_components')
        .select(`
          *,
          category:salary_component_categories(*)
        `)
        .eq('company_id', currentCompanyId)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      setComponents(data as SalaryComponent[] || []);
    } catch (err: any) {
      console.error('Error fetching salary components:', err);
      setError(err.message);
      toast.error('Không thể tải danh sách thành phần lương');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!currentCompanyId) {
      setCategories([]);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('salary_component_categories')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data as SalaryComponentCategory[] || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  // Create salary component
  const createComponent = async (formData: SalaryComponentFormData): Promise<SalaryComponent | null> => {
    if (!currentCompanyId) {
      toast.error('Vui lòng chọn công ty');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('salary_components')
        .insert({
          company_id: currentCompanyId,
          ...formData,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error('Mã thành phần đã tồn tại');
          return null;
        }
        throw insertError;
      }

      toast.success('Thêm thành phần lương thành công');
      await fetchComponents();
      return data as SalaryComponent;
    } catch (err: any) {
      console.error('Error creating salary component:', err);
      toast.error('Không thể thêm thành phần lương');
      return null;
    }
  };

  // Update salary component
  const updateComponent = async (id: string, formData: Partial<SalaryComponentFormData>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('salary_components')
        .update(formData)
        .eq('id', id);

      if (updateError) {
        if (updateError.code === '23505') {
          toast.error('Mã thành phần đã tồn tại');
          return false;
        }
        throw updateError;
      }

      toast.success('Cập nhật thành phần lương thành công');
      await fetchComponents();
      return true;
    } catch (err: any) {
      console.error('Error updating salary component:', err);
      toast.error('Không thể cập nhật thành phần lương');
      return false;
    }
  };

  // Delete salary component
  const deleteComponent = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('salary_components')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Xóa thành phần lương thành công');
      await fetchComponents();
      return true;
    } catch (err: any) {
      console.error('Error deleting salary component:', err);
      toast.error('Không thể xóa thành phần lương');
      return false;
    }
  };

  // Toggle component active status
  const toggleComponentStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('salary_components')
        .update({ is_active: isActive })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success(isActive ? 'Đã kích hoạt thành phần' : 'Đã vô hiệu hóa thành phần');
      await fetchComponents();
      return true;
    } catch (err: any) {
      console.error('Error toggling component status:', err);
      toast.error('Không thể cập nhật trạng thái');
      return false;
    }
  };

  // Create category
  const createCategory = async (formData: CategoryFormData): Promise<SalaryComponentCategory | null> => {
    if (!currentCompanyId) {
      toast.error('Vui lòng chọn công ty');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('salary_component_categories')
        .insert({
          company_id: currentCompanyId,
          ...formData,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Thêm danh mục thành công');
      await fetchCategories();
      return data as SalaryComponentCategory;
    } catch (err: any) {
      console.error('Error creating category:', err);
      toast.error('Không thể thêm danh mục');
      return null;
    }
  };

  // Delete category
  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('salary_component_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Xóa danh mục thành công');
      await fetchCategories();
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast.error('Không thể xóa danh mục');
      return false;
    }
  };

  // Initialize default components for new company
  const initializeDefaultComponents = async (): Promise<boolean> => {
    if (!currentCompanyId) return false;

    try {
      const componentsToInsert = systemSalaryComponents.map((comp, index) => ({
        company_id: currentCompanyId,
        code: comp.code,
        name: comp.name,
        component_type: comp.componentType,
        nature: comp.nature,
        value_type: 'currency' as const,
        is_taxable: comp.isTaxable,
        is_insurance_base: false,
        default_value: 0,
        applied_to: 'all',
        is_active: true,
        sort_order: index,
      }));

      const { error: insertError } = await supabase
        .from('salary_components')
        .insert(componentsToInsert);

      if (insertError) throw insertError;

      toast.success('Đã khởi tạo các thành phần lương mặc định');
      await fetchComponents();
      return true;
    } catch (err: any) {
      console.error('Error initializing default components:', err);
      toast.error('Không thể khởi tạo thành phần lương mặc định');
      return false;
    }
  };

  useEffect(() => {
    fetchComponents();
    fetchCategories();
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
