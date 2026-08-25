-- HRM Internal News Table
-- Feature: Tin nội bộ cho HRM

CREATE TABLE IF NOT EXISTS public.hrm_internal_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  tenant_id TEXT,

  -- Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,

  -- Media
  featured_image_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Categorization
  category TEXT DEFAULT 'general',
  tags JSONB DEFAULT '[]'::jsonb,

  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  pinned BOOLEAN DEFAULT FALSE,

  -- Access control
  visibility TEXT DEFAULT 'all',
  department_ids JSONB DEFAULT '[]'::jsonb,

  -- Author
  author_id UUID,
  author_name TEXT NOT NULL,

  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: slug per company
CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_internal_news_company_slug
  ON public.hrm_internal_news (company_id, slug);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_hrm_internal_news_company_status_published
  ON public.hrm_internal_news (company_id, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_hrm_internal_news_company_category
  ON public.hrm_internal_news (company_id, category, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_hrm_internal_news_pinned
  ON public.hrm_internal_news (company_id, pinned DESC, published_at DESC)
  WHERE pinned = TRUE;
