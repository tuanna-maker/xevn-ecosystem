
-- Drop existing RLS policies
DROP POLICY IF EXISTS "Company members can view guide contents" ON public.guide_contents;
DROP POLICY IF EXISTS "Company admins can insert guide contents" ON public.guide_contents;
DROP POLICY IF EXISTS "Company admins can update guide contents" ON public.guide_contents;
DROP POLICY IF EXISTS "Company admins can delete guide contents" ON public.guide_contents;

-- Drop the unique constraint that includes company_id
ALTER TABLE public.guide_contents DROP CONSTRAINT IF EXISTS guide_contents_company_id_section_id_step_index_key;

-- Make company_id nullable (global content has null company_id)
ALTER TABLE public.guide_contents ALTER COLUMN company_id DROP NOT NULL;

-- Add unique constraint for global content (company_id is null)
CREATE UNIQUE INDEX guide_contents_global_unique ON public.guide_contents (section_id, step_index) WHERE company_id IS NULL;

-- New RLS: All authenticated users can read
CREATE POLICY "All authenticated users can read guide contents"
ON public.guide_contents FOR SELECT
TO authenticated
USING (true);

-- Only platform admins can insert
CREATE POLICY "Platform admins can insert guide contents"
ON public.guide_contents FOR INSERT
TO authenticated
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Only platform admins can update
CREATE POLICY "Platform admins can update guide contents"
ON public.guide_contents FOR UPDATE
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Only platform admins can delete
CREATE POLICY "Platform admins can delete guide contents"
ON public.guide_contents FOR DELETE
TO authenticated
USING (public.is_platform_admin(auth.uid()));
