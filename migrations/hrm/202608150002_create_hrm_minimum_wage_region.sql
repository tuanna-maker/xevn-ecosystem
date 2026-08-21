-- @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
CREATE TABLE hrm_minimum_wage_region (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'xevn',
    company_id text NOT NULL DEFAULT 'holding',
    region_code varchar(10) NOT NULL CHECK (region_code IN ('REGION_1','REGION_2','REGION_3','REGION_4')),
    effective_from date NOT NULL,
    effective_to date,
    monthly_min_wage numeric(14,2) NOT NULL CHECK (monthly_min_wage > 0),
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by varchar(255),
    updated_by varchar(255),
    CONSTRAINT uq_min_wage_tenant_region_eff UNIQUE (tenant_id, region_code, effective_from)
);

CREATE INDEX ix_min_wage_tenant_eff ON hrm_minimum_wage_region(tenant_id, effective_from);