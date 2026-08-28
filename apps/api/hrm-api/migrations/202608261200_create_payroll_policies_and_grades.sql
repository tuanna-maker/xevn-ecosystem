-- Tạo bảng payroll_grades
CREATE TABLE IF NOT EXISTS public.payroll_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(50) NOT NULL,
    grade_code VARCHAR(50) NOT NULL,
    grade_name VARCHAR(255) NOT NULL,
    pay_group_code VARCHAR(50),
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payroll_grades_company_id ON public.payroll_grades(company_id);

-- Tạo bảng payroll_policies
CREATE TABLE IF NOT EXISTS public.payroll_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    pay_group_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    version INT NOT NULL DEFAULT 1,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payroll_policies_company_id ON public.payroll_policies(company_id);

-- Tạo bảng payroll_policy_components
CREATE TABLE IF NOT EXISTS public.payroll_policy_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES public.payroll_policies(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    is_deduction BOOLEAN NOT NULL DEFAULT false,
    input_source VARCHAR(50) NOT NULL,
    params JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payroll_policy_comps_policy_id ON public.payroll_policy_components(policy_id);
