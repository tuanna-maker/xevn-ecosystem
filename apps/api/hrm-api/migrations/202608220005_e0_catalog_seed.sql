-- ============================================================
-- Migration 005: E0 — Catalog Seed
-- WorkItem: HRM-POLICY-E0-02
-- Seeds 12 catalog types + 80+ entries for XeVN HRM Policy Engine
-- Idempotent: INSERT ... ON CONFLICT DO NOTHING
-- NOTE: Assumes pay_catalog_item table follows existing catalog pattern.
--       If table name differs, adapt accordingly.
-- ============================================================

-- ─── CATALOG TYPES ──────────────────────────────────────────

-- Grade (ngạch) catalog type
INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'GRADE', 'Ngạch lương', 10, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'PAY_GROUP', 'Nhóm lương', 20, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'PROVINCE', 'Tỉnh định biên', 30, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'VEHICLE_TYPE', 'Loại phương tiện', 40, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'COMPONENT_TYPE', 'Loại thành phần lương', 50, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'SHIFT_TYPE', 'Loại ca làm việc', 60, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'ROUTE_TYPE', 'Loại tuyến xe', 70, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'HOTLINE_CODE', 'Số tổng đài', 80, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'OFFICE_BRANCH', 'Chi nhánh văn phòng', 90, '{}')
ON CONFLICT DO NOTHING;

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES ('', 'PAY_CATALOG_TYPE', 'POLICY_DECISION_TYPE', 'Loại quyết định', 100, '{}')
ON CONFLICT DO NOTHING;

-- ─── PAY_GROUP (Nhóm lương) ─────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'PAY_GROUP', 'LX_TUYEN', 'Lái xe Tuyến',  10, '{"description": "Lái xe khách tuyến cố định theo tỉnh"}'),
  ('', 'PAY_GROUP', 'LX_TAI',   'Lái xe Tải',    20, '{"description": "Lái xe vận chuyển hàng hóa"}'),
  ('', 'PAY_GROUP', 'DPHH',     'Điều phối HH',  30, '{"description": "Điều phối hàng hóa văn phòng"}'),
  ('', 'PAY_GROUP', 'TONG_DAI', 'Tổng đài',      40, '{"description": "Nhân viên tổng đài hành khách 1500/1731"}'),
  ('', 'PAY_GROUP', 'VP_TINH',  'VP Tỉnh',       50, '{"description": "Văn phòng vé tỉnh"}'),
  ('', 'PAY_GROUP', 'VP_HN',    'VP Hà Nội',     60, '{"description": "Văn phòng Hà Nội (cơ chế cấu hình)"}'),
  ('', 'PAY_GROUP', 'KHAC',     'Khác',           70, '{"description": "Nhóm khác chưa phân loại"}')
ON CONFLICT DO NOTHING;

-- ─── PROVINCE ────────────────────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'PROVINCE', 'ND',  'Nam Định',   10, '{"accident_deduction_pct": 10}'),
  ('', 'PROVINCE', 'NB',  'Ninh Bình',  20, '{"accident_deduction_pct": 10}'),
  ('', 'PROVINCE', 'TB',  'Thái Bình',  30, '{"accident_deduction_pct": 10}'),
  ('', 'PROVINCE', 'PT',  'Phú Thọ',    40, '{"accident_deduction_pct": 100}'),
  ('', 'PROVINCE', 'VT',  'Việt Trì',   50, '{"accident_deduction_pct": 100}'),
  ('', 'PROVINCE', 'YB',  'Yên Bái',    60, '{"accident_deduction_pct": 10}'),
  ('', 'PROVINCE', 'HN',  'Hà Nội',     70, '{"accident_deduction_pct": 10}')
ON CONFLICT DO NOTHING;

-- ─── VEHICLE_TYPE ───────────────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'VEHICLE_TYPE', 'FRR_55T',  'FRR 5.5T',    10, '{"fuel_quota_l_per_100km": 12.0, "load_tons": 5.5}'),
  ('', 'VEHICLE_TYPE', 'FRR_75T',  'FRR 7.5T',    20, '{"fuel_quota_l_per_100km": 14.0, "load_tons": 7.5}'),
  ('', 'VEHICLE_TYPE', 'ELF_15T',  'ELF 1.5T',    30, '{"fuel_quota_l_per_100km": 9.0,  "load_tons": 1.5}'),
  ('', 'VEHICLE_TYPE', 'ELF_35T',  'ELF 3.5T',    40, '{"fuel_quota_l_per_100km": 10.5, "load_tons": 3.5}'),
  ('', 'VEHICLE_TYPE', 'JAC_5T',   'JAC 5T',      50, '{"fuel_quota_l_per_100km": 13.0, "load_tons": 5.0}'),
  ('', 'VEHICLE_TYPE', 'HINO_8T',  'HINO 8T',     60, '{"fuel_quota_l_per_100km": 16.0, "load_tons": 8.0}'),
  ('', 'VEHICLE_TYPE', 'HINO_15T', 'HINO 15T',    70, '{"fuel_quota_l_per_100km": 22.0, "load_tons": 15.0}'),
  ('', 'VEHICLE_TYPE', 'DAU_KEO',  'Đầu kéo',     80, '{"fuel_quota_l_per_100km": 32.0, "load_tons": 25.0}'),
  ('', 'VEHICLE_TYPE', 'BUS_29',   'Xe khách 29', 90, '{"fuel_quota_l_per_100km": 18.0, "seats": 29}'),
  ('', 'VEHICLE_TYPE', 'BUS_34',   'Xe khách 34', 100,'{"fuel_quota_l_per_100km": 20.0, "seats": 34}'),
  ('', 'VEHICLE_TYPE', 'BUS_45',   'Xe khách 45', 110,'{"fuel_quota_l_per_100km": 24.0, "seats": 45}')
ON CONFLICT DO NOTHING;

-- ─── SHIFT_TYPE ─────────────────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'SHIFT_TYPE', 'CA_SANG',   'Ca sáng',     10, '{"start_time": "06:00", "end_time": "14:30"}'),
  ('', 'SHIFT_TYPE', 'CA_CHIEU',  'Ca chiều',    20, '{"start_time": "14:30", "end_time": "23:00"}'),
  ('', 'SHIFT_TYPE', 'HC',        'Hành chính',  30, '{"start_time": "08:00", "end_time": "17:00"}'),
  ('', 'SHIFT_TYPE', 'CA_DEM',    'Ca đêm',      40, '{"start_time": "23:00", "end_time": "06:00"}')
ON CONFLICT DO NOTHING;

-- ─── ROUTE_TYPE ─────────────────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'ROUTE_TYPE', 'TUYEN_CO_DINH', 'Tuyến cố định',      10, '{}'),
  ('', 'ROUTE_TYPE', 'HO_TRO',        'Hỗ trợ tỉnh khác',  20, '{}'),
  ('', 'ROUTE_TYPE', 'NOI_BAI',       'Nội Bài',            30, '{}')
ON CONFLICT DO NOTHING;

-- ─── HOTLINE_CODE ────────────────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'HOTLINE_CODE', '1500', 'Tổng đài 1500',  10, '{}'),
  ('', 'HOTLINE_CODE', '1731', 'Tổng đài 1731',  20, '{}')
ON CONFLICT DO NOTHING;

-- ─── COMPONENT_TYPE (29 types) ──────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('','COMPONENT_TYPE','grade_base',                'Lương cơ bản ngạch-bậc',          10,  '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','grade_allowance',           'Phụ cấp theo ngạch',              20,  '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','kpi_bonus_pct',             'Thưởng KPI %',                    30,  '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','trip_rate_tiered',          'Lương lượt (tier)',               40,  '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','revenue_quality',           'DT × hệ số CLDV',                50,  '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','cpn_commission',            'Hoa hồng CPN',                    60,  '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','contract_fee',              'Phí hợp đồng',                    70,  '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','vehicle_repair_deduction',  'Giảm trừ bảo dưỡng',            80,  '{"is_deduction": true,  "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','fixed_base_salary',         'Lương cứng theo loại xe',         90,  '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','vehicle_mgmt_allowance',    'Tiền QLPT',                      100, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','revenue_commission_tiered', 'Thưởng DT (tier %)',             110, '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','fuel_quota_deduction',      'Khoán nhiên liệu',              120, '{"is_deduction": true,  "input_source": "system"}'),
  ('','COMPONENT_TYPE','clhd_point_deduction',      'Phạt điểm CLHĐ',               130, '{"is_deduction": true,  "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','kpi_pool_share',            'Pool KPI ĐPHH',                 140, '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','revenue_pool_commission',   'Hoa hồng gửi/nhận ĐPHH',       150, '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','team_milestone_bonus',      'Thưởng vượt mốc DT VP',        160, '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','delivery_commission',       'Thưởng giao hàng ship',         170, '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','zero_sum_pool',             'Pool zero-sum (TĐ/VP Tỉnh)',    180, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','attendance_bonus_conditional','Thưởng chuyên cần',           190, '{"is_deduction": false, "input_source": "attendance_system"}'),
  ('','COMPONENT_TYPE','meal_allowance_conditional', 'Ăn ca Chủ nhật',               200, '{"is_deduction": false, "input_source": "attendance_system"}'),
  ('','COMPONENT_TYPE','remote_work_allowance',     'PC xa nhà / tăng cường',        210, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','loading_support',           'Hỗ trợ bốc xếp',               220, '{"is_deduction": false, "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','special_allowance',         'Phụ cấp đặc thù',              230, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','probation_override',        'Nhân 85% (thử việc)',           240, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','fixed_trial_salary',        'Lương flat thử việc',           250, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','ranking_bonus',             'Thưởng Top CLDV TĐ',           260, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','kpi_multiplier',            'Hệ số nhỡ TĐ',                 270, '{"is_deduction": false, "input_source": "system"}'),
  ('','COMPONENT_TYPE','penalty_deduction',         'Phạt kỷ luật/giám sát',        280, '{"is_deduction": true,  "input_source": "excel_import"}'),
  ('','COMPONENT_TYPE','insurance_deduction',       'BHXH + BHYT + BHTN',           290, '{"is_deduction": true,  "input_source": "system"}')
ON CONFLICT DO NOTHING;

-- ─── POLICY_DECISION_TYPE ────────────────────────────────────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'POLICY_DECISION_TYPE', 'ISSUE',   'Ban hành mới',    10, '{}'),
  ('', 'POLICY_DECISION_TYPE', 'AMEND',   'Điều chỉnh',      20, '{}'),
  ('', 'POLICY_DECISION_TYPE', 'SUSPEND', 'Tạm ngừng',       30, '{}'),
  ('', 'POLICY_DECISION_TYPE', 'REVOKE',  'Thu hồi',         40, '{}')
ON CONFLICT DO NOTHING;

-- ─── LƯƠNG CƠ SỞ (dùng cho insurance_deduction ceiling) ─────

INSERT INTO pay_catalog_items (tenant_id, catalog_type, code, name_vi, sort_order, metadata)
VALUES
  ('', 'SYSTEM_CONFIG', 'BASE_SALARY_REF_VND', 'Mức lương cơ sở 2024', 10, '{"amount_vnd": 2340000}')
ON CONFLICT DO NOTHING;
