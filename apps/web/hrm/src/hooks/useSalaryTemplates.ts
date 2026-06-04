import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  addSalaryTemplateComponent,
  createSalaryTemplate,
  deleteSalaryTemplate,
  duplicateSalaryTemplate,
  listSalaryTemplateComponents,
  listSalaryTemplates,
  removeSalaryTemplateComponentRow,
  updateSalaryTemplate,
  updateSalaryTemplateComponentRow,
  type HrmSalaryTemplateRow,
} from '@/integrations/hrmApi';

export interface SalaryTemplate {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  is_default: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryTemplateComponent {
  id: string;
  template_id: string;
  component_id: string;
  default_value: number;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  component?: {
    id: string;
    code: string;
    name: string;
    component_type: string;
    nature: string;
    value_type: string;
  };
}

export interface SalaryTemplateFormData {
  code: string;
  name: string;
  description: string;
  is_default: boolean;
  status: string;
}

export interface TemplateComponentFormData {
  component_id: string;
  default_value: number;
  is_required: boolean;
  sort_order: number;
}

function mapSalaryTemplate(row: HrmSalaryTemplateRow): SalaryTemplate {
  return {
    id: row.id,
    company_id: row.company_id,
    code: row.code,
    name: row.name,
    description: row.description,
    is_default: Boolean(row.is_default),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const useSalaryTemplates = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading: isLoadingTemplates, refetch: refetchTemplates } = useQuery({
    queryKey: ['salary-templates', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const response = await listSalaryTemplates({ company_id: currentCompanyId });
      return (response.data ?? []).map(mapSalaryTemplate);
    },
    enabled: !!currentCompanyId,
  });

  const fetchTemplateComponents = async (templateId: string): Promise<SalaryTemplateComponent[]> => {
    if (!currentCompanyId) return [];
    const response = await listSalaryTemplateComponents(templateId, currentCompanyId);
    return (response.data ?? []).map((row) => ({
      id: String(row.id),
      template_id: String(row.template_id),
      component_id: String(row.component_id),
      default_value: Number(row.default_value ?? 0),
      is_required: Boolean(row.is_required),
      sort_order: Number(row.sort_order ?? 0),
      created_at: String(row.created_at ?? ''),
      component: row.component as SalaryTemplateComponent['component'],
    }));
  };

  const createTemplateMutation = useMutation({
    mutationFn: async (data: SalaryTemplateFormData) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return createSalaryTemplate({
        company_id: currentCompanyId,
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        is_default: data.is_default,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã tạo mẫu bảng lương');
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error, 'Không thể tạo mẫu bảng lương'));
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalaryTemplateFormData> }) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return updateSalaryTemplate(id, {
        company_id: currentCompanyId,
        code: data.code,
        name: data.name,
        description: data.description,
        is_default: data.is_default,
        status: data.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã cập nhật mẫu bảng lương');
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error, 'Không thể cập nhật mẫu bảng lương'));
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return deleteSalaryTemplate(id, currentCompanyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã xóa mẫu bảng lương');
    },
    onError: (error: unknown) => {
      toast.error(toErrorMessage(error, 'Không thể xóa mẫu bảng lương'));
    },
  });

  const addTemplateComponentMutation = useMutation({
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: TemplateComponentFormData;
    }) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return addSalaryTemplateComponent(templateId, {
        company_id: currentCompanyId,
        component_id: data.component_id,
        default_value: data.default_value,
        is_required: data.is_required,
        sort_order: data.sort_order,
      });
    },
    onSuccess: () => toast.success('Đã thêm thành phần vào mẫu'),
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Không thể thêm thành phần')),
  });

  const updateTemplateComponentMutation = useMutation({
    mutationFn: async ({
      componentRowId,
      data,
    }: {
      componentRowId: string;
      data: Partial<TemplateComponentFormData>;
    }) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return updateSalaryTemplateComponentRow(componentRowId, currentCompanyId, data);
    },
    onSuccess: () => toast.success('Đã cập nhật thành phần'),
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Không thể cập nhật thành phần')),
  });

  const removeTemplateComponentMutation = useMutation({
    mutationFn: async (componentRowId: string) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return removeSalaryTemplateComponentRow(componentRowId, currentCompanyId);
    },
    onSuccess: () => toast.success('Đã xóa thành phần khỏi mẫu'),
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Không thể xóa thành phần')),
  });

  const duplicateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!currentCompanyId) throw new Error('Missing company scope');
      return duplicateSalaryTemplate(templateId, currentCompanyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã sao chép mẫu bảng lương');
    },
    onError: (error: unknown) => toast.error(toErrorMessage(error, 'Không thể sao chép mẫu')),
  });

  return {
    templates,
    isLoadingTemplates,
    refetchTemplates,
    fetchTemplateComponents,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: (id: string, data: Partial<SalaryTemplateFormData>) =>
      updateTemplateMutation.mutateAsync({ id, data }),
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    addTemplateComponent: addTemplateComponentMutation.mutateAsync,
    updateTemplateComponent: updateTemplateComponentMutation.mutateAsync,
    removeTemplateComponent: removeTemplateComponentMutation.mutateAsync,
    duplicateTemplate: duplicateTemplateMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
};
