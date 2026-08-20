-- @CODE-MEMORY: Tạo bảng pay_salary_component và pay_system_settings cho nghiệp vụ lương.
-- Spec: PAY-09-DATA-SPEC-01 và cấu hình khách hàng.

CREATE TABLE IF NOT EXISTS pay_salary_component (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    company_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    is_taxable BOOLEAN NOT NULL DEFAULT false,
    in_bhxh_base BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_pay_salary_component_code UNIQUE (company_id, code)
);

CREATE INDEX idx_pay_salary_component_tenant ON pay_salary_component(tenant_id);

CREATE TABLE IF NOT EXISTS pay_system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    company_id VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pay_system_settings_key UNIQUE (company_id, setting_key)
);

CREATE INDEX idx_pay_system_settings_tenant ON pay_system_settings(tenant_id);
