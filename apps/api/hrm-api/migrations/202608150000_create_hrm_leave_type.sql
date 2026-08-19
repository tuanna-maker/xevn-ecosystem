-- @CODE-MEMORY WorkItem: BA-HRM-LEAVE-TYPE-TECHSPEC-01
CREATE TABLE hrm_leave_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenant(id),
    company_id uuid NOT NULL REFERENCES company(id),
    code varchar(20) NOT NULL,
    name varchar(100) NOT NULL,
    default_days_per_year int NOT NULL DEFAULT 0 CHECK (default_days_per_year >= 0),
    is_paid boolean NOT NULL DEFAULT true,
    pay_rate_percent numeric(5,2) NOT NULL DEFAULT 100.00 CHECK (pay_rate_percent BETWEEN 0 AND 100),
    leave_category varchar(20) NOT NULL CHECK (leave_category IN ('LABOR_LAW','INTERNAL')),
    description text,
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by varchar(255),
    updated_by varchar(255),
    CONSTRAINT uq_leave_type_tenant_code UNIQUE (tenant_id, code)
);

CREATE INDEX ix_leave_type_tenant_status ON hrm_leave_type(tenant_id, status);
CREATE INDEX ix_leave_type_tenant_category ON hrm_leave_type(tenant_id, leave_category);