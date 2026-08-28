-- Tạo bảng danh mục Dữ liệu hệ thống (System Data Definitions)
CREATE TABLE IF NOT EXISTS public.pay_system_data_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    data_type TEXT NOT NULL DEFAULT 'NUMBER',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pay_system_data_definitions_code_company_key UNIQUE (company_id, code)
);

-- Thêm cột Cách nhập và System Data ID vào pay_sheet_template_lines
ALTER TABLE public.pay_sheet_template_lines
    ADD COLUMN IF NOT EXISTS input_method VARCHAR(50) NOT NULL DEFAULT 'FORMULA',
    ADD COLUMN IF NOT EXISTS system_data_mapping_id UUID REFERENCES public.pay_system_data_definitions(id) ON DELETE SET NULL;
