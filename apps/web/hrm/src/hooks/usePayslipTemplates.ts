/**
 * @CODE-MEMORY
 * Screen:     Cài đặt / Phiếu lương
 * Purpose:    Hook lấy danh sách mẫu phiếu lương
 * WorkItem:   PO-HRM-PAY-PAYSLIP-TEMPLATE-SPEC-01
 * change_mode: FIX
 * What:       Cập nhật Type để hứng statusLabel, statusTone từ BE Display-Ready (Doctrine 28).
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listPayslipTemplates, createPayslipTemplate as apiCreate, updatePayslipTemplate as apiUpdate, deletePayslipTemplate as apiDelete } from '@/integrations/hrmApi';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';

export type PayslipTemplate = {
  id: string;
  code: string;
  name: string;
  pay_sheet_template_id: string | null;
  pay_sheet_template_name?: string;
  settings: {
    layoutType?: 'a4_classic' | 'a5_compact' | 'email_modern';
    showLogo?: boolean;
    hideZeroValues?: boolean;
    showCompanyStamp?: boolean;
    footerNote?: string;
    [key: string]: any;
  };
  is_active: boolean;
  statusLabel?: string;
  statusTone?: 'success' | 'secondary' | string;
};

export function usePayslipTemplates() {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<{ data: PayslipTemplate[] }>({
    queryKey: ['payslip-templates'],
    queryFn: async () => {
      const res = await listPayslipTemplates();
      return res.data;
    },
  });

  const mutate = () => {
    queryClient.invalidateQueries({ queryKey: ['payslip-templates'] });
  };

  const createTemplate = async (payload: Partial<PayslipTemplate>) => {
    try {
      await apiCreate(payload);
      toast.success('Đã tạo mẫu phiếu lương mới');
      mutate();
      return true;
    } catch (err: any) {
      toast.error(toErrorMessage(err, 'Lỗi khi tạo mẫu phiếu lương'));
      return false;
    }
  };

  const updateTemplate = async (id: string, payload: Partial<PayslipTemplate>) => {
    try {
      await apiUpdate(id, payload);
      toast.success('Đã cập nhật mẫu phiếu lương');
      mutate();
      return true;
    } catch (err: any) {
      toast.error(toErrorMessage(err, 'Lỗi khi cập nhật mẫu phiếu lương'));
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await apiDelete(id);
      toast.success('Đã xóa mẫu phiếu lương');
      mutate();
      return true;
    } catch (err: any) {
      toast.error(toErrorMessage(err, 'Lỗi khi xóa mẫu phiếu lương'));
      return false;
    }
  };

  return {
    templates: data?.data || [],
    isLoading,
    isError: error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
