
-- Table to store custom guide content per company
CREATE TABLE public.guide_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  step_index INTEGER, -- null means section-level content
  custom_title TEXT,
  custom_content TEXT, -- rich text HTML
  image_urls TEXT[] DEFAULT '{}',
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, section_id, step_index)
);

-- Enable RLS
ALTER TABLE public.guide_contents ENABLE ROW LEVEL SECURITY;

-- Anyone in the company can read
CREATE POLICY "Company members can view guide contents"
ON public.guide_contents FOR SELECT
TO authenticated
USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

-- Only admins can insert/update/delete
CREATE POLICY "Company admins can insert guide contents"
ON public.guide_contents FOR INSERT
TO authenticated
WITH CHECK (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can update guide contents"
ON public.guide_contents FOR UPDATE
TO authenticated
USING (public.is_company_admin(auth.uid(), company_id))
WITH CHECK (public.is_company_admin(auth.uid(), company_id));

CREATE POLICY "Company admins can delete guide contents"
ON public.guide_contents FOR DELETE
TO authenticated
USING (public.is_company_admin(auth.uid(), company_id));

-- Storage bucket for guide images
INSERT INTO storage.buckets (id, name, public) VALUES ('guide-images', 'guide-images', true);

-- Storage policies
CREATE POLICY "Company members can view guide images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'guide-images');

CREATE POLICY "Company admins can upload guide images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guide-images');

CREATE POLICY "Company admins can delete guide images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guide-images');
