-- Create salary_templates table
CREATE TABLE public.salary_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create salary_template_components table (linking templates to salary components)
CREATE TABLE public.salary_template_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.salary_templates(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES public.salary_components(id) ON DELETE CASCADE,
  default_value NUMERIC DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, component_id)
);

-- Enable RLS
ALTER TABLE public.salary_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_template_components ENABLE ROW LEVEL SECURITY;

-- RLS policies for salary_templates
CREATE POLICY "Users can view salary templates in their companies"
  ON public.salary_templates FOR SELECT
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can insert salary templates in their companies"
  ON public.salary_templates FOR INSERT
  WITH CHECK (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can update salary templates in their companies"
  ON public.salary_templates FOR UPDATE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Users can delete salary templates in their companies"
  ON public.salary_templates FOR DELETE
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

-- RLS policies for salary_template_components (via template's company_id)
CREATE POLICY "Users can view template components via templates"
  ON public.salary_template_components FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.salary_templates st
    WHERE st.id = salary_template_components.template_id
    AND st.company_id IN (SELECT get_user_company_ids(auth.uid()))
  ));

CREATE POLICY "Users can insert template components via templates"
  ON public.salary_template_components FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.salary_templates st
    WHERE st.id = salary_template_components.template_id
    AND st.company_id IN (SELECT get_user_company_ids(auth.uid()))
  ));

CREATE POLICY "Users can update template components via templates"
  ON public.salary_template_components FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.salary_templates st
    WHERE st.id = salary_template_components.template_id
    AND st.company_id IN (SELECT get_user_company_ids(auth.uid()))
  ));

CREATE POLICY "Users can delete template components via templates"
  ON public.salary_template_components FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.salary_templates st
    WHERE st.id = salary_template_components.template_id
    AND st.company_id IN (SELECT get_user_company_ids(auth.uid()))
  ));

-- Trigger for updated_at
CREATE TRIGGER update_salary_templates_updated_at
  BEFORE UPDATE ON public.salary_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_salary_templates_company_id ON public.salary_templates(company_id);
CREATE INDEX idx_salary_template_components_template_id ON public.salary_template_components(template_id);
CREATE INDEX idx_salary_template_components_component_id ON public.salary_template_components(component_id);