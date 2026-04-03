import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

export const useSalaryTemplates = () => {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all salary templates
  const { data: templates = [], isLoading: isLoadingTemplates, refetch: refetchTemplates } = useQuery({
    queryKey: ['salary-templates', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('salary_templates')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SalaryTemplate[];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch template components for a specific template
  const fetchTemplateComponents = async (templateId: string): Promise<SalaryTemplateComponent[]> => {
    const { data, error } = await supabase
      .from('salary_template_components')
      .select(`
        *,
        component:salary_components(id, code, name, component_type, nature, value_type)
      `)
      .eq('template_id', templateId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data as SalaryTemplateComponent[];
  };

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (formData: SalaryTemplateFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from('salary_templates')
          .update({ is_default: false })
          .eq('company_id', currentCompanyId);
      }

      const { data, error } = await supabase
        .from('salary_templates')
        .insert({
          company_id: currentCompanyId,
          ...formData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã tạo mẫu bảng lương thành công');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Mã mẫu bảng lương đã tồn tại');
      } else {
        toast.error('Lỗi khi tạo mẫu bảng lương');
      }
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<SalaryTemplateFormData> }) => {
      if (!currentCompanyId) throw new Error('No company selected');

      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from('salary_templates')
          .update({ is_default: false })
          .eq('company_id', currentCompanyId)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('salary_templates')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã cập nhật mẫu bảng lương');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Mã mẫu bảng lương đã tồn tại');
      } else {
        toast.error('Lỗi khi cập nhật mẫu bảng lương');
      }
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salary_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã xóa mẫu bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi xóa mẫu bảng lương');
    },
  });

  // Add component to template
  const addTemplateComponentMutation = useMutation({
    mutationFn: async ({ templateId, componentData }: { templateId: string; componentData: TemplateComponentFormData }) => {
      const { data, error } = await supabase
        .from('salary_template_components')
        .insert({
          template_id: templateId,
          ...componentData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-components', variables.templateId] });
      toast.success('Đã thêm thành phần vào mẫu');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Thành phần này đã có trong mẫu');
      } else {
        toast.error('Lỗi khi thêm thành phần');
      }
    },
  });

  // Update template component
  const updateTemplateComponentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TemplateComponentFormData> }) => {
      const { error } = await supabase
        .from('salary_template_components')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Đã cập nhật thành phần');
    },
    onError: () => {
      toast.error('Lỗi khi cập nhật thành phần');
    },
  });

  // Remove component from template
  const removeTemplateComponentMutation = useMutation({
    mutationFn: async ({ templateId, componentId }: { templateId: string; componentId: string }) => {
      const { error } = await supabase
        .from('salary_template_components')
        .delete()
        .eq('id', componentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template-components', variables.templateId] });
      toast.success('Đã xóa thành phần khỏi mẫu');
    },
    onError: () => {
      toast.error('Lỗi khi xóa thành phần');
    },
  });

  // Duplicate template
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      if (!currentCompanyId) throw new Error('No company selected');

      // Get original template
      const { data: original, error: fetchError } = await supabase
        .from('salary_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Create new template
      const newCode = `${original.code}_copy_${Date.now()}`;
      const { data: newTemplate, error: createError } = await supabase
        .from('salary_templates')
        .insert({
          company_id: currentCompanyId,
          code: newCode,
          name: `${original.name} (Bản sao)`,
          description: original.description,
          is_default: false,
          status: 'active',
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy template components
      const { data: components, error: componentsError } = await supabase
        .from('salary_template_components')
        .select('*')
        .eq('template_id', templateId);

      if (componentsError) throw componentsError;

      if (components && components.length > 0) {
        const newComponents = components.map(c => ({
          template_id: newTemplate.id,
          component_id: c.component_id,
          default_value: c.default_value,
          is_required: c.is_required,
          sort_order: c.sort_order,
        }));

        const { error: insertError } = await supabase
          .from('salary_template_components')
          .insert(newComponents);

        if (insertError) throw insertError;
      }

      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates', currentCompanyId] });
      toast.success('Đã sao chép mẫu bảng lương');
    },
    onError: () => {
      toast.error('Lỗi khi sao chép mẫu bảng lương');
    },
  });

  return {
    templates,
    isLoadingTemplates,
    refetchTemplates,
    fetchTemplateComponents,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
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
