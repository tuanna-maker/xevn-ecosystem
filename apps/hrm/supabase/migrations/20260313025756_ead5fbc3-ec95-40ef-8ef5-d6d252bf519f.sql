
-- =============================================
-- NEW PERMISSION SYSTEM - Complete Rebuild
-- =============================================

-- 1. Permissions table
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module, action)
);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 2. System roles
CREATE TABLE public.system_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  level int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

-- 3. Role-permission mapping
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES public.system_roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. User role assignments per company
CREATE TABLE public.company_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES public.system_roles(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id, role_id)
);
ALTER TABLE public.company_user_roles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_permissions_module ON public.permissions(module);
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX idx_company_user_roles_user_company ON public.company_user_roles(user_id, company_id);
CREATE INDEX idx_company_user_roles_company ON public.company_user_roles(company_id);

-- =============================================
-- SEED: System Roles
-- =============================================
INSERT INTO public.system_roles (code, name, description, level) VALUES
  ('owner', 'Owner', 'Chủ sở hữu công ty - toàn quyền', 100),
  ('admin', 'Admin', 'Quản trị viên - gần như toàn quyền', 90),
  ('hr_manager', 'HR Manager', 'Trưởng phòng nhân sự', 70),
  ('accountant', 'Accountant', 'Kế toán', 60),
  ('recruiter', 'Recruiter', 'Tuyển dụng viên', 50),
  ('manager', 'Manager', 'Trưởng bộ phận', 40),
  ('employee', 'Employee', 'Nhân viên', 20),
  ('viewer', 'Viewer', 'Người xem', 10);

-- =============================================
-- SEED: Permissions
-- =============================================
INSERT INTO public.permissions (module, action, description) VALUES
  ('dashboard', 'view', 'Xem tổng quan'),
  ('employees', 'view', 'Xem danh sách nhân viên'),
  ('employees', 'create', 'Thêm nhân viên'),
  ('employees', 'edit', 'Chỉnh sửa nhân viên'),
  ('employees', 'delete', 'Xóa nhân viên'),
  ('employees', 'export', 'Xuất dữ liệu nhân viên'),
  ('employees', 'import', 'Nhập dữ liệu nhân viên'),
  ('employees', 'view_salary', 'Xem lương nhân viên'),
  ('recruitment', 'view', 'Xem tuyển dụng'),
  ('recruitment', 'create', 'Tạo tuyển dụng'),
  ('recruitment', 'edit', 'Chỉnh sửa tuyển dụng'),
  ('recruitment', 'delete', 'Xóa tuyển dụng'),
  ('recruitment', 'manage_campaigns', 'Quản lý chiến dịch'),
  ('recruitment', 'schedule_interviews', 'Lên lịch phỏng vấn'),
  ('recruitment', 'evaluate', 'Đánh giá ứng viên'),
  ('attendance', 'view', 'Xem chấm công'),
  ('attendance', 'create', 'Tạo bản ghi chấm công'),
  ('attendance', 'edit', 'Chỉnh sửa chấm công'),
  ('attendance', 'approve', 'Duyệt chấm công'),
  ('attendance', 'export', 'Xuất chấm công'),
  ('attendance', 'manage_rules', 'Quản lý quy tắc chấm công'),
  ('attendance', 'checkin', 'Check-in/Check-out'),
  ('payroll', 'view', 'Xem bảng lương'),
  ('payroll', 'create', 'Tạo bảng lương'),
  ('payroll', 'edit', 'Chỉnh sửa bảng lương'),
  ('payroll', 'approve', 'Duyệt bảng lương'),
  ('payroll', 'export', 'Xuất bảng lương'),
  ('payroll', 'manage_templates', 'Quản lý mẫu lương'),
  ('payroll', 'manage_components', 'Quản lý thành phần lương'),
  ('contracts', 'view', 'Xem hợp đồng'),
  ('contracts', 'create', 'Tạo hợp đồng'),
  ('contracts', 'edit', 'Chỉnh sửa hợp đồng'),
  ('contracts', 'delete', 'Xóa hợp đồng'),
  ('insurance', 'view', 'Xem bảo hiểm'),
  ('insurance', 'create', 'Tạo bảo hiểm'),
  ('insurance', 'edit', 'Chỉnh sửa bảo hiểm'),
  ('insurance', 'delete', 'Xóa bảo hiểm'),
  ('decisions', 'view', 'Xem quyết định'),
  ('decisions', 'create', 'Tạo quyết định'),
  ('decisions', 'edit', 'Chỉnh sửa quyết định'),
  ('decisions', 'delete', 'Xóa quyết định'),
  ('company', 'view', 'Xem công ty'),
  ('company', 'edit', 'Chỉnh sửa công ty'),
  ('company', 'manage_members', 'Quản lý thành viên'),
  ('company', 'manage_departments', 'Quản lý phòng ban'),
  ('reports', 'view', 'Xem báo cáo'),
  ('reports', 'export', 'Xuất báo cáo'),
  ('settings', 'view', 'Xem cài đặt'),
  ('settings', 'edit', 'Chỉnh sửa cài đặt');

-- =============================================
-- SEED: Role-Permission Mappings
-- =============================================

-- Owner & Admin: ALL permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr CROSS JOIN public.permissions p
WHERE sr.code IN ('owner', 'admin');

-- HR Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr, public.permissions p
WHERE sr.code = 'hr_manager' AND (
  (p.module = 'dashboard') OR
  (p.module = 'employees') OR
  (p.module = 'recruitment') OR
  (p.module = 'attendance') OR
  (p.module = 'contracts') OR
  (p.module = 'insurance') OR
  (p.module = 'decisions') OR
  (p.module = 'company' AND p.action IN ('view', 'manage_departments')) OR
  (p.module = 'reports') OR
  (p.module = 'settings' AND p.action = 'view')
);

-- Accountant
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr, public.permissions p
WHERE sr.code = 'accountant' AND (
  (p.module = 'dashboard') OR
  (p.module = 'employees' AND p.action IN ('view', 'view_salary')) OR
  (p.module = 'payroll') OR
  (p.module = 'insurance') OR
  (p.module = 'contracts' AND p.action = 'view') OR
  (p.module = 'company' AND p.action = 'view') OR
  (p.module = 'reports')
);

-- Recruiter
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr, public.permissions p
WHERE sr.code = 'recruiter' AND (
  (p.module = 'dashboard') OR
  (p.module = 'recruitment') OR
  (p.module = 'employees' AND p.action = 'view') OR
  (p.module = 'company' AND p.action = 'view') OR
  (p.module = 'reports' AND p.action = 'view')
);

-- Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr, public.permissions p
WHERE sr.code = 'manager' AND (
  (p.module = 'dashboard') OR
  (p.module = 'employees' AND p.action = 'view') OR
  (p.module = 'recruitment' AND p.action = 'view') OR
  (p.module = 'attendance' AND p.action IN ('view', 'approve', 'checkin')) OR
  (p.module = 'company' AND p.action = 'view') OR
  (p.module = 'reports' AND p.action = 'view')
);

-- Employee
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr, public.permissions p
WHERE sr.code = 'employee' AND (
  (p.module = 'dashboard') OR
  (p.module = 'attendance' AND p.action IN ('view', 'checkin')) OR
  (p.module = 'company' AND p.action = 'view')
);

-- Viewer
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id FROM public.system_roles sr, public.permissions p
WHERE sr.code = 'viewer' AND p.action = 'view';

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _company_id uuid, _module text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_user_roles cur
    JOIN role_permissions rp ON rp.role_id = cur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE cur.user_id = _user_id
      AND cur.company_id = _company_id
      AND p.module = _module
      AND p.action = _action
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid, _company_id uuid)
RETURNS TABLE(module text, action text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.module, p.action
  FROM company_user_roles cur
  JOIN role_permissions rp ON rp.role_id = cur.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE cur.user_id = _user_id
    AND cur.company_id = _company_id
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid, _company_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sr.code
  FROM company_user_roles cur
  JOIN system_roles sr ON sr.id = cur.role_id
  WHERE cur.user_id = _user_id
    AND cur.company_id = _company_id
  ORDER BY sr.level DESC
  LIMIT 1
$$;

-- Update is_company_admin to use new system
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_user_roles cur
    JOIN public.system_roles sr ON sr.id = cur.role_id
    WHERE cur.user_id = _user_id
      AND cur.company_id = _company_id
      AND sr.code IN ('owner', 'admin')
  )
$$;

-- Update has_recruitment_access to use new system
CREATE OR REPLACE FUNCTION public.has_recruitment_access(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_permission(_user_id, _company_id, 'recruitment', 'view')
$$;

-- =============================================
-- MIGRATE EXISTING DATA
-- =============================================
INSERT INTO public.company_user_roles (user_id, company_id, role_id)
SELECT 
  ucm.user_id,
  ucm.company_id,
  sr.id
FROM public.user_company_memberships ucm
JOIN public.system_roles sr ON sr.code = ucm.role
WHERE ucm.user_id IS NOT NULL
  AND ucm.status = 'active'
ON CONFLICT (user_id, company_id, role_id) DO NOTHING;

-- For 'member' role in old system, map to 'employee' in new system
INSERT INTO public.company_user_roles (user_id, company_id, role_id)
SELECT 
  ucm.user_id,
  ucm.company_id,
  sr.id
FROM public.user_company_memberships ucm
JOIN public.system_roles sr ON sr.code = 'employee'
WHERE ucm.user_id IS NOT NULL
  AND ucm.status = 'active'
  AND ucm.role = 'member'
ON CONFLICT (user_id, company_id, role_id) DO NOTHING;

-- =============================================
-- RLS POLICIES
-- =============================================
CREATE POLICY "Authenticated users can view permissions"
  ON public.permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view system roles"
  ON public.system_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view role permissions"
  ON public.role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view roles in their companies"
  ON public.company_user_roles FOR SELECT TO authenticated
  USING (company_id IN (SELECT get_user_company_ids(auth.uid())));

CREATE POLICY "Admins can insert roles"
  ON public.company_user_roles FOR INSERT TO authenticated
  WITH CHECK (is_company_admin(auth.uid(), company_id));

CREATE POLICY "Admins can update roles"
  ON public.company_user_roles FOR UPDATE TO authenticated
  USING (is_company_admin(auth.uid(), company_id));

CREATE POLICY "Admins can delete roles"
  ON public.company_user_roles FOR DELETE TO authenticated
  USING (is_company_admin(auth.uid(), company_id) AND user_id != auth.uid());
