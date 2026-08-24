import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  createHrmInternalNews,
  deleteHrmInternalNews,
  getHrmInternalNews,
  listHrmInternalNews,
  updateHrmInternalNews,
  viewHrmInternalNews,
  type CreateInternalNewsPayload,
  type HrmInternalNewsRecord,
  type UpdateInternalNewsPayload,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';

export type InternalNewsRecord = HrmInternalNewsRecord;

export interface InternalNewsFormData {
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  category: string;
  status: string;
  pinned: boolean;
  visibility: string;
  featured_image_url?: string;
  tags: string[];
  attachments: string[];
  department_ids: string[];
  author_name?: string;
}

export const initialFormData: InternalNewsFormData = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: 'general',
  status: 'published',
  pinned: false,
  visibility: 'all',
  featured_image_url: '',
  tags: [],
  attachments: [],
  department_ids: [],
  author_name: '',
};

function toPayload(companyId: string, data: InternalNewsFormData): CreateInternalNewsPayload {
  return {
    company_id: companyId,
    title: data.title,
    slug: data.slug || undefined,
    summary: data.summary || undefined,
    content: data.content || undefined,
    category: data.category,
    status: data.status,
    pinned: data.pinned,
    visibility: data.visibility,
    featured_image_url: data.featured_image_url || undefined,
    tags: data.tags.length > 0 ? data.tags : undefined,
    attachments: data.attachments.length > 0 ? data.attachments : undefined,
    department_ids: data.department_ids.length > 0 ? data.department_ids : undefined,
    author_name: data.author_name || undefined,
  };
}

function toUpdatePayload(companyId: string, data: Partial<InternalNewsFormData>): UpdateInternalNewsPayload {
  return {
    company_id: companyId,
    ...(data.title !== undefined && { title: data.title }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.summary !== undefined && { summary: data.summary }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.pinned !== undefined && { pinned: data.pinned }),
    ...(data.visibility !== undefined && { visibility: data.visibility }),
    ...(data.featured_image_url !== undefined && { featured_image_url: data.featured_image_url }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(data.attachments !== undefined && { attachments: data.attachments }),
    ...(data.department_ids !== undefined && { department_ids: data.department_ids }),
  };
}

export function useInternalNews(options?: { selectedCategory?: string; includeDrafts?: boolean }) {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();

  const selectedCategory = options?.selectedCategory ?? 'all';
  const includeDrafts = options?.includeDrafts ?? false;

  const newsQuery = useQuery({
    queryKey: ['hrm-internal-news', currentCompanyId, selectedCategory, includeDrafts],
    queryFn: async () => {
      if (!currentCompanyId) return { total: 0, page: 1, page_size: 20, data: [] };
      const res = await listHrmInternalNews({
        company_id: currentCompanyId,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        include_drafts: includeDrafts,
        page_size: 100,
      });
      return res;
    },
    enabled: Boolean(currentCompanyId),
    staleTime: 30_000,
  });

  const detailQuery = useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      return getHrmInternalNews(id, companyId);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InternalNewsFormData) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return createHrmInternalNews(toPayload(currentCompanyId, data));
    },
    onSuccess: () => {
      toast.success('Tạo tin nội bộ thành công');
      queryClient.invalidateQueries({ queryKey: ['hrm-internal-news', currentCompanyId] });
    },
    onError: (err) => {
      toast.error(toErrorMessage(err, 'Không thể tạo tin nội bộ'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InternalNewsFormData> }) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return updateHrmInternalNews(id, toUpdatePayload(currentCompanyId, data));
    },
    onSuccess: () => {
      toast.success('Cập nhật tin nội bộ thành công');
      queryClient.invalidateQueries({ queryKey: ['hrm-internal-news', currentCompanyId] });
    },
    onError: (err) => {
      toast.error(toErrorMessage(err, 'Không thể cập nhật tin nội bộ'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentCompanyId) throw new Error('No company selected');
      return deleteHrmInternalNews(id, currentCompanyId);
    },
    onSuccess: () => {
      toast.success('Xóa tin nội bộ thành công');
      queryClient.invalidateQueries({ queryKey: ['hrm-internal-news', currentCompanyId] });
    },
    onError: (err) => {
      toast.error(toErrorMessage(err, 'Không thể xóa tin nội bộ'));
    },
  });

  const viewMutation = useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      return viewHrmInternalNews(id, companyId);
    },
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['hrm-internal-news', currentCompanyId] });
  };

  return {
    news: newsQuery.data?.data ?? [],
    total: newsQuery.data?.total ?? 0,
    isLoading: newsQuery.isLoading,
    fetchError: newsQuery.error,
    refetch,
    getNewsById: detailQuery.mutateAsync,
    createNews: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateNews: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteNews: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    incrementView: viewMutation.mutateAsync,
  };
}
