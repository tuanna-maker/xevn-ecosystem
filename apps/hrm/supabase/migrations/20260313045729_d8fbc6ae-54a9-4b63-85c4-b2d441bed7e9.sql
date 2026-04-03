
-- Subscription plans table managed by Platform Admin
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_vi text NOT NULL,
  name_en text NOT NULL,
  description_vi text,
  description_en text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'VND',
  max_employees integer NOT NULL DEFAULT 0,
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  features_vi jsonb NOT NULL DEFAULT '[]'::jsonb,
  features_en jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans (for landing page)
CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- Platform admins can manage plans
CREATE POLICY "Platform admins can insert plans"
  ON public.subscription_plans FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update plans"
  ON public.subscription_plans FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete plans"
  ON public.subscription_plans FOR DELETE
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- Seed default plans
INSERT INTO public.subscription_plans (code, name_vi, name_en, description_vi, description_en, price_monthly, price_yearly, max_employees, is_popular, sort_order, features_vi, features_en) VALUES
('starter', 'Starter', 'Starter', 'Dành cho doanh nghiệp nhỏ', 'For small businesses', 299000, 2990000, 30, false, 1,
 '["Quản lý nhân sự cơ bản", "Chấm công cơ bản", "1 quản trị viên", "Hỗ trợ email"]'::jsonb,
 '["Basic HR management", "Basic attendance", "1 admin", "Email support"]'::jsonb),
('standard', 'Standard', 'Standard', 'Dành cho doanh nghiệp đang phát triển', 'For growing businesses', 499000, 4990000, 60, false, 2,
 '["Tất cả tính năng Starter", "Tuyển dụng", "Bảng lương cơ bản", "3 quản trị viên"]'::jsonb,
 '["All Starter features", "Recruitment", "Basic payroll", "3 admins"]'::jsonb),
('pro', 'Professional', 'Professional', 'Giải pháp toàn diện', 'Comprehensive solution', 899000, 8990000, 100, true, 3,
 '["Tất cả tính năng Standard", "Bảng lương nâng cao", "Báo cáo chi tiết", "5 quản trị viên", "Hỗ trợ ưu tiên"]'::jsonb,
 '["All Standard features", "Advanced payroll", "Detailed reports", "5 admins", "Priority support"]'::jsonb),
('enterprise', 'Enterprise', 'Enterprise', 'Dành cho tổ chức lớn', 'For large organizations', 1499000, 14990000, 150, false, 4,
 '["Tất cả tính năng Professional", "API truy cập", "10 quản trị viên", "SLA hỗ trợ"]'::jsonb,
 '["All Professional features", "API access", "10 admins", "SLA support"]'::jsonb),
('enterprise_plus', 'Enterprise Plus', 'Enterprise Plus', 'Giải pháp không giới hạn', 'Unlimited solution', 2499000, 24990000, 200, false, 5,
 '["Tất cả tính năng Enterprise", "Nhân viên không giới hạn", "Quản trị viên không giới hạn", "Hỗ trợ 24/7"]'::jsonb,
 '["All Enterprise features", "Unlimited employees", "Unlimited admins", "24/7 support"]'::jsonb);
