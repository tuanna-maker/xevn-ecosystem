
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  progress integer NOT NULL DEFAULT 0,
  work_mode text NOT NULL DEFAULT 'offline',
  assignee_id uuid,
  assignee_name text,
  assignee_avatar text,
  reporter_id uuid,
  reporter_name text,
  department text,
  start_date date,
  due_date date,
  completed_date date,
  tags text[],
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their company"
  ON public.tasks FOR SELECT TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users with create permission can insert tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users with edit permission can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));

CREATE POLICY "Users with delete permission can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (company_id IN (SELECT public.get_user_company_ids(auth.uid())));
