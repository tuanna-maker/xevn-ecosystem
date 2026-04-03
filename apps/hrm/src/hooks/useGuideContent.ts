import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface GuideContent {
  id: string;
  company_id: string | null;
  section_id: string;
  step_index: number | null;
  custom_title: string | null;
  custom_content: string | null;
  image_urls: string[];
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useGuideContent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch global guide contents (company_id IS NULL)
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['guide-contents-global'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guide_contents' as any)
        .select('*')
        .is('company_id', null);
      if (error) throw error;
      return (data || []) as unknown as GuideContent[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: {
      section_id: string;
      step_index: number | null;
      custom_title?: string;
      custom_content?: string;
      image_urls?: string[];
    }) => {
      // Check if existing global entry
      let query = supabase
        .from('guide_contents' as any)
        .select('id')
        .is('company_id', null)
        .eq('section_id', payload.section_id);

      if (payload.step_index !== null) {
        query = query.eq('step_index', payload.step_index);
      } else {
        query = query.is('step_index', null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing && (existing as any).id) {
        const { error } = await supabase
          .from('guide_contents' as any)
          .update({
            custom_title: payload.custom_title,
            custom_content: payload.custom_content,
            image_urls: payload.image_urls || [],
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('guide_contents' as any)
          .insert({
            company_id: null,
            section_id: payload.section_id,
            step_index: payload.step_index,
            custom_title: payload.custom_title,
            custom_content: payload.custom_content,
            image_urls: payload.image_urls || [],
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-contents-global'] });
      toast.success(t('guide.editor.saved', 'Đã lưu thành công'));
    },
    onError: () => {
      toast.error(t('guide.editor.saveError', 'Lỗi khi lưu'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (payload: { section_id: string; step_index: number | null }) => {
      let query = supabase
        .from('guide_contents' as any)
        .delete()
        .is('company_id', null)
        .eq('section_id', payload.section_id);

      if (payload.step_index !== null) {
        query = query.eq('step_index', payload.step_index);
      } else {
        query = query.is('step_index', null);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-contents-global'] });
    },
  });

  const getContent = (sectionId: string, stepIndex: number | null): GuideContent | undefined => {
    return contents.find(
      (c) => c.section_id === sectionId && c.step_index === stepIndex
    );
  };

  return {
    contents,
    isLoading,
    getContent,
    upsertContent: upsertMutation.mutateAsync,
    deleteContent: deleteMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
}
