
-- Update attendance_records SELECT policy: employees see only their own, management sees all
DROP POLICY IF EXISTS "Users can view attendance in their companies" ON public.attendance_records;

CREATE POLICY "Users can view attendance in their companies"
ON public.attendance_records
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Also restrict attendance_update_requests
DROP POLICY IF EXISTS "Users can view update requests in their companies" ON public.attendance_update_requests;
CREATE POLICY "Users can view update requests in their companies"
ON public.attendance_update_requests
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Restrict leave_requests
DROP POLICY IF EXISTS "Users can view leave requests in their companies" ON public.leave_requests;
CREATE POLICY "Users can view leave requests in their companies"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Restrict overtime_requests
DROP POLICY IF EXISTS "Users can view overtime requests in their companies" ON public.overtime_requests;
CREATE POLICY "Users can view overtime requests in their companies"
ON public.overtime_requests
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Restrict late_early_requests
DROP POLICY IF EXISTS "Users can view late early requests in their companies" ON public.late_early_requests;
CREATE POLICY "Users can view late early requests in their companies"
ON public.late_early_requests
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Restrict business_trip_requests
DROP POLICY IF EXISTS "Users can view business trips in their companies" ON public.business_trip_requests;
CREATE POLICY "Users can view business trips in their companies"
ON public.business_trip_requests
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);

-- Restrict shift_change_requests
DROP POLICY IF EXISTS "Users can view shift changes in their companies" ON public.shift_change_requests;
CREATE POLICY "Users can view shift changes in their companies"
ON public.shift_change_requests
FOR SELECT
TO authenticated
USING (
  company_id IN (SELECT public.get_user_company_ids(auth.uid()))
  AND (
    public.can_view_all_employees(auth.uid(), company_id)
    OR
    employee_id = public.get_user_employee_id(auth.uid(), company_id)
  )
);
