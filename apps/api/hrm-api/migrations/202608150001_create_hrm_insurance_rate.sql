-- @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
CREATE TABLE hrm_insurance_rate (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenant(id),
    company_id uuid NOT NULL REFERENCES company(id),
    insurance_type varchar(10) NOT NULL CHECK (insurance_type IN ('BHXH','BHYT','BHTN')),
    effective_year int NOT NULL CHECK (effective_year BETWEEN 2000 AND 2100),
    employer_rate_percent numeric(5,2) NOT NULL CHECK (employer_rate_percent BETWEEN 0 AND 100),
    employee_rate_percent numeric(5,2) NOT NULL CHECK (employee_rate_percent BETWEEN 0 AND 100),
    salary_cap_multiplier numeric(4,1) NOT NULL DEFAULT 20.0 CHECK (salary_cap_multiplier > 0),
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    effective_from date NOT NULL,
    effective_to date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_ins_rate_tenant_type_year UNIQUE (tenant_id, insurance_type, effective_year)
);

CREATE INDEX ix_ins_rate_tenant_year ON hrm_insurance_rate(tenant_id, effective_year);
CREATE INDEX ix_ins_rate_tenant_status ON hrm_insurance_rate(tenant_id, status);