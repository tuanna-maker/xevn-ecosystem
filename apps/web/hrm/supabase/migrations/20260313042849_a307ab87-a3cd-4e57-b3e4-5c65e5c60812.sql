
-- System audit logs for tracking important actions
CREATE TABLE public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  entity_name TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast queries
CREATE INDEX idx_audit_logs_created_at ON public.system_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.system_audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON public.system_audit_logs(user_id);

-- RLS
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view audit logs"
  ON public.system_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can insert audit logs"
  ON public.system_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- System announcements / notifications
CREATE TABLE public.system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  priority TEXT NOT NULL DEFAULT 'normal',
  target TEXT NOT NULL DEFAULT 'all',
  target_company_ids UUID[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage announcements"
  ON public.system_announcements FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Authenticated users can view active announcements
CREATE POLICY "Users can view active announcements"
  ON public.system_announcements FOR SELECT
  TO authenticated
  USING (is_active = true AND starts_at <= now() AND (expires_at IS NULL OR expires_at > now()));

-- System configuration (key-value)
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage config"
  ON public.system_config FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Insert default system config
INSERT INTO public.system_config (key, value, description, category) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "Hệ thống đang bảo trì"}', 'Chế độ bảo trì', 'general'),
  ('max_employees_free', '{"value": 10}', 'Giới hạn NV gói Free', 'limits'),
  ('max_employees_pro', '{"value": 100}', 'Giới hạn NV gói Pro', 'limits'),
  ('registration_enabled', '{"enabled": true}', 'Cho phép đăng ký mới', 'general'),
  ('default_language', '{"value": "vi"}', 'Ngôn ngữ mặc định', 'general'),
  ('features_recruitment', '{"enabled": true}', 'Bật/tắt module Tuyển dụng', 'features'),
  ('features_payroll', '{"enabled": true}', 'Bật/tắt module Bảng lương', 'features'),
  ('features_attendance', '{"enabled": true}', 'Bật/tắt module Chấm công', 'features');

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_platform_audit(
  _action TEXT,
  _entity_type TEXT DEFAULT NULL,
  _entity_id TEXT DEFAULT NULL,
  _entity_name TEXT DEFAULT NULL,
  _details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email TEXT;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE user_id = auth.uid();
  
  INSERT INTO public.system_audit_logs (user_id, user_email, action, entity_type, entity_id, entity_name, details)
  VALUES (auth.uid(), _email, _action, _entity_type, _entity_id, _entity_name, _details);
END;
$$;
