
-- Add permissions for new modules
INSERT INTO permissions (module, action, description) VALUES
  ('processes', 'view', 'Xem quy trình & quy định'),
  ('processes', 'create', 'Tạo quy trình & quy định'),
  ('processes', 'edit', 'Sửa quy trình & quy định'),
  ('processes', 'delete', 'Xóa quy trình & quy định'),
  ('services', 'view', 'Xem dịch vụ nội bộ'),
  ('services', 'create', 'Tạo yêu cầu dịch vụ'),
  ('services', 'edit', 'Sửa yêu cầu dịch vụ'),
  ('services', 'delete', 'Xóa yêu cầu dịch vụ'),
  ('services', 'approve', 'Duyệt yêu cầu dịch vụ'),
  ('tools', 'view', 'Xem công cụ dụng cụ'),
  ('tools', 'create', 'Thêm công cụ dụng cụ'),
  ('tools', 'edit', 'Sửa công cụ dụng cụ'),
  ('tools', 'delete', 'Xóa công cụ dụng cụ'),
  ('tools', 'approve', 'Duyệt cấp phát/thu hồi');

-- Grant all new permissions to owner, admin, hr_manager roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code IN ('owner', 'admin', 'hr_manager')
  AND p.module IN ('processes', 'services', 'tools')
ON CONFLICT DO NOTHING;

-- Grant view permission to all other roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code IN ('accountant', 'recruiter', 'manager', 'employee', 'viewer')
  AND p.module IN ('processes', 'services', 'tools')
  AND p.action = 'view'
ON CONFLICT DO NOTHING;
