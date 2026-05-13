-- HRM Mobile notifications: persisted inbox + device push tokens (aligns with hrm-api ensureSchema)

CREATE TABLE IF NOT EXISTS public.hrm_inbox_notifications (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  recipient_employee_id UUID NULL,
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hrm_inbox_company_recipient_created
ON public.hrm_inbox_notifications (company_id, recipient_employee_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.hrm_push_device_tokens (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  platform TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hrm_push_platform CHECK (platform IN ('expo', 'fcm'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_push_device_tokens_scope
ON public.hrm_push_device_tokens (company_id, employee_id, platform);
