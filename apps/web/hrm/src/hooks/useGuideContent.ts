import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { useTranslation } from 'react-i18next';

import { useAuth } from '@/contexts/AuthContext';

import { toErrorMessage } from '@/lib/apiError';

import { deleteGuideContent, listGuideContent, upsertGuideContent } from '@/integrations/hrmApi';



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



function mapGuide(row: Record<string, unknown>): GuideContent {

  const images = row.image_urls;

  return {

    id: String(row.id),

    company_id: row.company_id ? String(row.company_id) : null,

    section_id: String(row.section_id),

    step_index: row.step_index != null ? Number(row.step_index) : null,

    custom_title: row.custom_title ? String(row.custom_title) : null,

    custom_content: row.custom_content ? String(row.custom_content) : null,

    image_urls: Array.isArray(images) ? (images as string[]) : [],

    updated_by: row.updated_by ? String(row.updated_by) : null,

    created_at: String(row.created_at ?? ''),

    updated_at: String(row.updated_at ?? ''),

  };

}



export function useGuideContent() {

  const { t } = useTranslation();

  const { currentCompanyId } = useAuth();

  const queryClient = useQueryClient();



  const { data: contents = [], isLoading } = useQuery({

    queryKey: ['guide-contents-global', currentCompanyId],

    queryFn: async () => {

      const response = await listGuideContent(currentCompanyId ?? undefined);

      return (response.data ?? []).map(mapGuide);

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

      return upsertGuideContent({

        company_id: currentCompanyId,

        ...payload,

      });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['guide-contents-global', currentCompanyId] });

      toast.success(t('guide.editor.saved', 'Đã lưu thành công'));

    },

    onError: (error: unknown) => {

      toast.error(toErrorMessage(error, t('guide.editor.saveError', 'Lỗi khi lưu')));

    },

  });



  const deleteMutation = useMutation({

    mutationFn: async (payload: { section_id: string; step_index: number | null }) => {

      return deleteGuideContent({

        ...payload,

        company_id: currentCompanyId ?? undefined,

      });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['guide-contents-global', currentCompanyId] });

    },

    onError: (error: unknown) => {

      toast.error(toErrorMessage(error, 'Lỗi khi xóa'));

    },

  });



  const getContent = (sectionId: string, stepIndex: number | null): GuideContent | undefined => {

    return contents.find((c) => c.section_id === sectionId && c.step_index === stepIndex);

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


