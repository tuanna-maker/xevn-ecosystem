-- Cập nhật cấu trúc DB cho Payroll Data Source Mapping & Template Assignment (SRS-PAY-DS-01, ASG-01)
-- Bổ sung data_source_type cho Component và bảng pay_employee_templates.

ALTER TABLE IF EXISTS public.hrm_salary_template_components
  ADD COLUMN IF NOT EXISTS data_source_type VARCHAR(50) NOT NULL DEFAULT 'FORMULA',
  ADD COLUMN IF NOT EXISTS source_mapping_key VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS formula TEXT NULL,
  ADD COLUMN IF NOT EXISTS condition_formula TEXT NULL,
  ADD COLUMN IF NOT EXISTS min_value NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS max_value NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS apply_tax BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS apply_insurance BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_editable BOOLEAN NOT NULL DEFAULT TRUE;

-- Thêm comment cho columns mới
COMMENT ON COLUMN public.hrm_salary_template_components.data_source_type IS 'Enum: SYSTEM_CONTRACT, TIMESHEET, INPUT_HUB, FORMULA, CONSTANT';
COMMENT ON COLUMN public.hrm_salary_template_components.source_mapping_key IS 'Trường ánh xạ tương ứng (vd: base_salary, actual_working_days)';

-- Bảng gán Mẫu bảng lương cho Nhân viên
CREATE TABLE IF NOT EXISTS public.pay_employee_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL, -- Tham chiếu tới hrm_employees (nếu có)
  template_id UUID NOT NULL, -- Tham chiếu tới pay_salary_templates / hrm_payroll_templates
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_pay_employee_templates_employee ON public.pay_employee_templates(employee_id);
CREATE INDEX IF NOT EXISTS ix_pay_employee_templates_template ON public.pay_employee_templates(template_id);
CREATE INDEX IF NOT EXISTS ix_pay_employee_templates_dates ON public.pay_employee_templates(effective_from, effective_to);

COMMENT ON TABLE public.pay_employee_templates IS 'Bảng gán trực tiếp nhân viên vào Mẫu bảng lương (Template Assignment)';
