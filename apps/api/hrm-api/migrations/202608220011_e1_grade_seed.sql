-- ============================================================
-- Migration 011: E1 — Grade Seed (11 ngạch × 9 bậc)
-- WorkItem: HRM-POLICY-E1-02
-- Nguồn: Ước tính từ QĐ 2A/2026 XeVN (cập nhật khi KH xác nhận số thực)
-- Idempotent: INSERT ... ON CONFLICT DO NOTHING
-- BIGINT money (VND, không float)
-- ============================================================

-- Xóa dữ liệu cũ nếu chạy lại (dev mode)
-- DELETE FROM public.pay_grade_steps WHERE tenant_id = '';
-- DELETE FROM public.pay_grade_definitions WHERE tenant_id = '';

-- ─── GRADE DEFINITIONS (11 ngạch) ────────────────────────────────────────

INSERT INTO public.pay_grade_definitions
  (tenant_id, grade_code, grade_name, pay_group_code, description, version, effective_from)
VALUES
  -- Nhóm Lái xe Tuyến (LX_TUYEN)
  ('', 'LX1', 'Lái xe Tuyến - Bậc sơ cấp',       'LX_TUYEN', 'LX ≤ 3 năm',         1, '2026-01-01'),
  ('', 'LX2', 'Lái xe Tuyến - Bậc trung cấp',     'LX_TUYEN', 'LX 3–7 năm',          1, '2026-01-01'),
  ('', 'LX3', 'Lái xe Tuyến - Bậc cao cấp',       'LX_TUYEN', 'LX > 7 năm',          1, '2026-01-01'),
  -- Nhóm Lái xe Tải (LX_TAI)
  ('', 'LT1', 'Lái xe Tải - Sơ cấp',             'LX_TAI',   'LX Tải ≤ 2 năm',      1, '2026-01-01'),
  ('', 'LT2', 'Lái xe Tải - Trung cấp',           'LX_TAI',   'LX Tải 2–5 năm',      1, '2026-01-01'),
  -- Nhóm Điều phối / VP (DPHH, VP_TINH)
  ('', 'DP1', 'Điều phối - Sơ cấp',               'DPHH',     'ĐPHH ≤ 3 năm',        1, '2026-01-01'),
  ('', 'DP2', 'Điều phối - Cao cấp',              'DPHH',     'ĐPHH > 3 năm',         1, '2026-01-01'),
  -- Nhóm Tổng đài (TONG_DAI)
  ('', 'TD1', 'Tổng đài - Sơ cấp',               'TONG_DAI', 'TĐ ≤ 2 năm',          1, '2026-01-01'),
  ('', 'TD2', 'Tổng đài - Cao cấp',              'TONG_DAI', 'TĐ > 2 năm',           1, '2026-01-01'),
  -- Nhóm Văn phòng Hà Nội (VP_HN)
  ('', 'VP1', 'VP HN - Chuyên viên',              'VP_HN',    'CVC',                  1, '2026-01-01'),
  ('', 'VP2', 'VP HN - Chuyên viên cao cấp',      'VP_HN',    'CVCC',                 1, '2026-01-01')
ON CONFLICT (tenant_id, grade_code, version) DO NOTHING;

-- ─── GRADE STEPS (9 bậc / ngạch) ─────────────────────────────────────────
-- Quy tắc: mỗi bậc tăng ~8-12% so với bậc trước (theo thâm niên)

DO $$
DECLARE
  v_grade TEXT;
  v_step  INT;
  v_def_id BIGINT;
  -- Base salary (bậc 1) và hệ số tăng (%) per ngạch
  bases JSONB := '{
    "LX1": 5500000,
    "LX2": 7000000,
    "LX3": 8500000,
    "LT1": 5800000,
    "LT2": 7200000,
    "DP1": 6000000,
    "DP2": 8000000,
    "TD1": 4500000,
    "TD2": 6000000,
    "VP1": 7500000,
    "VP2": 10000000
  }';
  rates JSONB := '{
    "LX1": 9,
    "LX2": 9,
    "LX3": 9,
    "LT1": 8,
    "LT2": 9,
    "DP1": 10,
    "DP2": 10,
    "TD1": 8,
    "TD2": 9,
    "VP1": 10,
    "VP2": 10
  }';
  v_base BIGINT;
  v_rate NUMERIC;
  v_salary BIGINT;
  -- Thâm niên tối thiểu mỗi bậc (tháng)
  seniority INT[] := ARRAY[0, 12, 24, 36, 48, 60, 72, 84, 96];
BEGIN
  FOR v_grade IN SELECT jsonb_object_keys(bases) LOOP
    -- Get definition id
    SELECT id INTO v_def_id FROM public.pay_grade_definitions
    WHERE tenant_id = '' AND grade_code = v_grade AND version = 1;

    IF v_def_id IS NULL THEN CONTINUE; END IF;

    v_base := (bases ->> v_grade)::BIGINT;
    v_rate := (rates ->> v_grade)::NUMERIC / 100;

    FOR v_step IN 1..9 LOOP
      -- salary = base × (1 + rate)^(step-1), rounded to nearest 50,000
      v_salary := ROUND(v_base::NUMERIC * POWER(1 + v_rate, v_step - 1) / 50000) * 50000;

      INSERT INTO public.pay_grade_steps
        (grade_id, step_number, monthly_salary_vnd, min_seniority_months, tenant_id, effective_from)
      VALUES
        (v_def_id, v_step, v_salary, seniority[v_step], '', '2026-01-01')
      ON CONFLICT (grade_id, step_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
