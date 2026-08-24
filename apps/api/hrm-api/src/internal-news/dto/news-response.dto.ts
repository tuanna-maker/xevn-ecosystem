export interface HrmInternalNewsRow {
  id: string;
  company_id: string;
  tenant_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  featured_image_url: string | null;
  attachments: unknown[];
  category: string;
  tags: string[];
  status: string;
  published_at: string | null;
  pinned: boolean;
  visibility: string;
  department_ids: string[];
  author_id: string | null;
  author_name: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface InternalNewsListResult {
  total: number;
  page: number;
  page_size: number;
  data: HrmInternalNewsRow[];
}
