CREATE TABLE IF NOT EXISTS pay_policies (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  company_id      TEXT          NOT NULL DEFAULT '',
  pay_group_code  TEXT          NOT NULL,
  name            TEXT          NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  version         INTEGER       NOT NULL DEFAULT 1,
  effective_from  DATE          NOT NULL,
  effective_to    DATE          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  CONSTRAINT chk_policy_period CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_pay_policies_tenant_group 
ON pay_policies(tenant_id, company_id, pay_group_code) 
WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS pay_policy_components (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  policy_id       BIGINT        NOT NULL REFERENCES pay_policies(id),
  component_type  TEXT          NOT NULL,
  name            TEXT          NOT NULL,
  sort_order      INTEGER       NOT NULL DEFAULT 0,
  is_deduction    BOOLEAN       NOT NULL DEFAULT false,
  input_source    TEXT          NULL,
  params          JSONB         NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL
);

CREATE INDEX IF NOT EXISTS idx_pay_policy_components_policy_id 
ON pay_policy_components(policy_id) 
WHERE deleted_at IS NULL;
