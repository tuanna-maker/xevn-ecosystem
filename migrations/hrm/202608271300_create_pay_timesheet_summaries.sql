-- Táº¡o báº£ng lÆ°u trá»¯ Dá»¯ liá»‡u Cháº¥m cĂ´ng & Ä Ă¡nh giĂ¡ hĂ ng thĂ¡ng (Timesheet Summaries)
-- Phá»¥c vá»¥ cho tĂ­nh lÆ°Æ¡ng (nguá»“n INPUT_HUB & TIMESHEET)

CREATE TABLE IF NOT EXISTS public.pay_timesheet_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    employee_id UUID NOT NULL,
    department_id TEXT, -- MĂ£ phĂ²ng hoáº·c UUID phĂ²ng
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, APPROVED, LOCKED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_timesheet_summary_emp_period UNIQUE (company_id, employee_id, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS ix_pay_timesheet_summaries_company_period ON public.pay_timesheet_summaries(company_id, period_month, period_year);

CREATE TABLE IF NOT EXISTS public.pay_timesheet_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timesheet_id UUID NOT NULL REFERENCES public.pay_timesheet_summaries(id) ON DELETE CASCADE,
    metric_code TEXT NOT NULL, -- VD: NGAY_CONG_CT, NGAY_CONG_TV, GIO_OT_150, GIO_OT_200, PHAT_DI_MUON
    metric_value NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_timesheet_line_metric UNIQUE (timesheet_id, metric_code)
);

CREATE INDEX IF NOT EXISTS ix_pay_timesheet_lines_timesheet ON public.pay_timesheet_lines(timesheet_id);
