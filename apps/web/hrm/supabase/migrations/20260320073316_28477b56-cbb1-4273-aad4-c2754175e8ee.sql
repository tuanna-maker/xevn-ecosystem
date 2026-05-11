
-- Add tasks permissions
INSERT INTO permissions (module, action, description) VALUES
  ('tasks', 'create', 'Tạo công việc'),
  ('tasks', 'delete', 'Xóa công việc'),
  ('tasks', 'edit', 'Chỉnh sửa công việc'),
  ('tasks', 'view', 'Xem công việc');

-- Grant all tasks permissions to owner, admin, hr_manager, manager roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE p.module = 'tasks'
  AND sr.code IN ('owner', 'admin', 'hr_manager', 'manager')
ON CONFLICT DO NOTHING;

-- Grant view + create to employee role
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE p.module = 'tasks'
  AND sr.code = 'employee'
  AND p.action IN ('view', 'create')
ON CONFLICT DO NOTHING;

-- Grant view to viewer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE p.module = 'tasks'
  AND sr.code = 'viewer'
  AND p.action = 'view'
ON CONFLICT DO NOTHING;
