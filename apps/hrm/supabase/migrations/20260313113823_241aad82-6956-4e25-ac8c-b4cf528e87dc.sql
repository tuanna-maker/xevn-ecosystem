
-- Add AI module permissions
INSERT INTO permissions (module, action, description) VALUES
  ('ai', 'view', 'Xem module UniAI'),
  ('ai', 'qa', 'Sử dụng AI hỏi đáp báo cáo & nội quy'),
  ('ai', 'extract', 'Sử dụng AI trích xuất thông tin giấy tờ'),
  ('ai', 'generate_doc', 'Sử dụng AI tạo mẫu văn bản'),
  ('ai', 'create_request', 'Sử dụng AI tạo đơn từ'),
  ('ai', 'evaluate_cv', 'Sử dụng AI đánh giá CV')
ON CONFLICT DO NOTHING;

-- Grant all AI permissions to owner, admin, hr_manager roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code IN ('owner', 'admin', 'hr_manager')
  AND p.module = 'ai'
ON CONFLICT DO NOTHING;

-- Grant view and qa to manager, accountant
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code IN ('manager', 'accountant')
  AND p.module = 'ai'
  AND p.action IN ('view', 'qa')
ON CONFLICT DO NOTHING;

-- Grant view, qa, create_request to employee
INSERT INTO role_permissions (role_id, permission_id)
SELECT sr.id, p.id
FROM system_roles sr
CROSS JOIN permissions p
WHERE sr.code = 'employee'
  AND p.module = 'ai'
  AND p.action IN ('view', 'qa', 'create_request')
ON CONFLICT DO NOTHING;
