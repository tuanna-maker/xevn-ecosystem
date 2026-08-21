-- Goal 1.6: Thực thi 5 công thức lương đặc thù của X.E vào Pipeline tính toán (sử dụng HyperFormula)

-- 1. Xóa các công thức cũ (nếu có)
DELETE FROM public.pay_formula_definitions WHERE code IN ('FORMULA_VP', 'FORMULA_LX_TUYEN', 'FORMULA_LX_TAI', 'FORMULA_DP', 'FORMULA_TONG_DAI');

-- 2. Thêm 5 công thức mới
INSERT INTO public.pay_formula_definitions (
    id, company_id, code, version, status, expression_json, required_vars_json, authored_by, authored_at, published_by, published_at, effective_from
) VALUES 
(
    gen_random_uuid(), 'holding', 'FORMULA_VP', 1, 'active', 
    '{
        "form": "hyperformula_v1",
        "lines": [
            {"component_code": "LUONG_CHINH", "sign": "earning", "formula": "=base_salary * (payable_hours / 208)"},
            {"component_code": "THU_NHAP_BS", "sign": "earning", "formula": "=allowance_p2"},
            {"component_code": "PC_DIEN_THOAI", "sign": "earning", "formula": "=allowance_phone"},
            {"component_code": "KHAU_TRU_BHXH", "sign": "deduction", "formula": "=insurance_employee"}
        ]
    }'::jsonb, 
    '["payable_hours", "base_salary", "allowance_p2", "allowance_phone", "insurance_employee"]'::jsonb, 
    'seed', NOW(), 'seed', NOW(), '2026-01-01'
),
(
    gen_random_uuid(), 'holding', 'FORMULA_LX_TUYEN', 1, 'active', 
    '{
        "form": "hyperformula_v1",
        "lines": [
            {"component_code": "LUONG_CHINH", "sign": "earning", "formula": "=base_salary"},
            {"component_code": "LUONG_CUOC", "sign": "earning", "formula": "=route_count * route_price"},
            {"component_code": "PC_DIEU_KIEN", "sign": "earning", "formula": "=allowance_heavy"},
            {"component_code": "THUONG_AN_TOAN", "sign": "earning", "formula": "=allowance_bonus"}
        ]
    }'::jsonb, 
    '["base_salary", "route_count", "route_price", "allowance_heavy", "allowance_bonus"]'::jsonb, 
    'seed', NOW(), 'seed', NOW(), '2026-01-01'
),
(
    gen_random_uuid(), 'holding', 'FORMULA_LX_TAI', 1, 'active', 
    '{
        "form": "hyperformula_v1",
        "lines": [
            {"component_code": "LUONG_CHINH", "sign": "earning", "formula": "=base_salary * vehicle_rate"},
            {"component_code": "PC_AN_TRUA", "sign": "earning", "formula": "=allowance_meal"},
            {"component_code": "THUONG_HIEU_SUAT", "sign": "earning", "formula": "=allowance_kpi"}
        ]
    }'::jsonb, 
    '["base_salary", "vehicle_rate", "allowance_meal", "allowance_kpi"]'::jsonb, 
    'seed', NOW(), 'seed', NOW(), '2026-01-01'
),
(
    gen_random_uuid(), 'holding', 'FORMULA_DP', 1, 'active', 
    '{
        "form": "hyperformula_v1",
        "lines": [
            {"component_code": "LUONG_CHINH", "sign": "earning", "formula": "=base_salary * (payable_hours / 208)"},
            {"component_code": "PC_DIEU_KIEN", "sign": "earning", "formula": "=allowance_shift3"},
            {"component_code": "THUONG_HIEU_SUAT", "sign": "earning", "formula": "=kpi * cldv"}
        ]
    }'::jsonb, 
    '["payable_hours", "base_salary", "allowance_shift3", "kpi", "cldv"]'::jsonb, 
    'seed', NOW(), 'seed', NOW(), '2026-01-01'
),
(
    gen_random_uuid(), 'holding', 'FORMULA_TONG_DAI', 1, 'active', 
    '{
        "form": "hyperformula_v1",
        "lines": [
            {"component_code": "LUONG_CHINH", "sign": "earning", "formula": "=base_salary"},
            {"component_code": "PC_DIEU_KIEN", "sign": "earning", "formula": "=allowance_shift"},
            {"component_code": "THUONG_HIEU_SUAT", "sign": "earning", "formula": "=cldv"},
            {"component_code": "HOA_HONG", "sign": "earning", "formula": "=revenue * kpi"}
        ]
    }'::jsonb, 
    '["base_salary", "allowance_shift", "cldv", "revenue", "kpi"]'::jsonb, 
    'seed', NOW(), 'seed', NOW(), '2026-01-01'
);

-- Done!
