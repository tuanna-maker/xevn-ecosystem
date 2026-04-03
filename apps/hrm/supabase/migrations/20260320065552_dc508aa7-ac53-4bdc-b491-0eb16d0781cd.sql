
-- Grant full access to owner, admin, hr_manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM public.system_roles sr
CROSS JOIN public.permissions p
WHERE sr.code IN ('owner', 'admin', 'hr_manager')
  AND p.module = 'tasks'
ON CONFLICT DO NOTHING;

-- Grant view access to other roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM public.system_roles sr
CROSS JOIN public.permissions p
WHERE sr.code IN ('hr_staff', 'manager', 'employee', 'accountant')
  AND p.module = 'tasks' AND p.action = 'view'
ON CONFLICT DO NOTHING;
