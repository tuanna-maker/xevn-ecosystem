-- Chạy trên database xevn_xbos (DBeaver). Tenant: xevn
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.xbos_legal_entity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'subsidiary', status TEXT NOT NULL DEFAULT 'active',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, company_id, code)
);
CREATE TABLE IF NOT EXISTS public.xbos_org_unit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL, company_id TEXT NOT NULL,
  parent_id UUID REFERENCES public.xbos_org_unit(id) ON DELETE SET NULL,
  legal_entity_id UUID REFERENCES public.xbos_legal_entity(id) ON DELETE SET NULL,
  org_type TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, company_id, code)
);
CREATE TABLE IF NOT EXISTS public.xbos_position_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL,
  level_scope TEXT NOT NULL DEFAULT 'group', org_type_hint TEXT, status TEXT NOT NULL DEFAULT 'active',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);
CREATE TABLE IF NOT EXISTS public.xbos_business_master_entries (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, domain TEXT NOT NULL, item_id TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb, status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, company_id, domain, item_id)
);

DELETE FROM public.xbos_position_template WHERE tenant_id = 'xevn';
DELETE FROM public.xbos_org_unit WHERE tenant_id = 'xevn';
DELETE FROM public.xbos_legal_entity WHERE tenant_id = 'xevn';
DELETE FROM public.xbos_business_master_entries WHERE tenant_id = 'xevn' AND domain = 'companies';

INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
VALUES ('xevn', 'holding', 'XEVN-HOLDING', 'Tập đoàn XeVN', 'holding', '{"shortName":"XeVN"}'::jsonb)
ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
VALUES ('xevn', 'xe-tmdv', 'XE_TMDV', 'Công ty Cổ phần Thương mại và Dịch vụ X.E', 'subsidiary', '{"shortName":"X.E TM-DV","source":"unicom-mtcv-excel"}'::jsonb)
ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


DO $$
DECLARE le_id UUID; root_id UUID;
BEGIN
  SELECT id INTO le_id FROM public.xbos_legal_entity WHERE tenant_id='xevn' AND company_id='xe-tmdv' AND code='XE_TMDV' LIMIT 1;
  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-tmdv', 'xe-tmdv-root', 'X.E TM-DV', 'subsidiary', le_id, 0, '{"employees":12}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
  RETURNING id INTO root_id;
  IF root_id IS NULL THEN
    SELECT id INTO root_id FROM public.xbos_org_unit WHERE tenant_id='xevn' AND company_id='xe-tmdv' AND code='xe-tmdv-root';
  END IF;


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-tmdv', 'xe-tmdv-BAN-GIAM-OC', 'Ban Giám đốc', 'department', root_id, le_id, 1, '{"positionCount":1}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.BAN-GIAM-OC-PHO-GIAM-OC', 'Phó giám đốc', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-tmdv","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-tmdv', 'xe-tmdv-XUONG-DICH-VU', 'Xưởng dịch vụ', 'department', root_id, le_id, 2, '{"positionCount":11}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-BAO-VE-RUA-XE', 'Bảo vệ - Rửa xe', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-CO-VAN-DICH-VU', 'Cố vấn dịch vụ', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-HOC-VIEC', 'Học việc', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-KE-TOAN-TONG-HOP', 'Kế toán tổng hợp', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-NHAN-VIEN-TAP-VU', 'Nhân viên tạp vụ', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-QUAN-OC-XUONG', 'Quản đốc Xưởng', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-THO-HOC-VIEC', 'Thợ học việc', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-THO-KY-THUAT', 'Thợ kỹ thuật', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-THU-KHO', 'Thủ kho', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-TO-PHO', 'Tổ phó', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-tmdv.XUONG-DICH-VU-TO-TRUONG', 'Tổ trưởng', 'subsidiary', 'Xưởng dịch vụ', '{"companyId":"xe-tmdv","departmentCode":"XUONG-DICH-VU","departmentName":"Xưởng dịch vụ"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

END $$;

INSERT INTO public.xbos_business_master_entries (tenant_id, company_id, domain, item_id, payload, status)
VALUES ('xevn', 'holding', 'companies', 'xe-tmdv', '{"id":"xe-tmdv","code":"XE_TMDV","name":"Công ty Cổ phần Thương mại và Dịch vụ X.E","shortName":"X.E TM-DV","status":"active","employeeCount":12}'::jsonb, 'active')
ON CONFLICT (tenant_id, company_id, domain, item_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();


INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
VALUES ('xevn', 'visun', 'VISUN', 'Công ty TNHH Du lịch Visun', 'subsidiary', '{"shortName":"Visun","source":"unicom-mtcv-excel"}'::jsonb)
ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


DO $$
DECLARE le_id UUID; root_id UUID;
BEGIN
  SELECT id INTO le_id FROM public.xbos_legal_entity WHERE tenant_id='xevn' AND company_id='visun' AND code='VISUN' LIMIT 1;
  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'visun', 'visun-root', 'Visun', 'subsidiary', le_id, 0, '{"employees":3}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
  RETURNING id INTO root_id;
  IF root_id IS NULL THEN
    SELECT id INTO root_id FROM public.xbos_org_unit WHERE tenant_id='xevn' AND company_id='visun' AND code='visun-root';
  END IF;


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'visun', 'visun-BAN-GIAM-OC', 'Ban Giám đốc', 'department', root_id, le_id, 1, '{"positionCount":1}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'visun.BAN-GIAM-OC-GIAM-OC-VISUN-TRO-LY-G-X-E', 'Giám đốc Visun + Trợ lý GĐ X.E', 'subsidiary', 'Ban Giám đốc', '{"companyId":"visun","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'visun', 'visun-PHONG-TCKT', 'Phòng TCKT', 'department', root_id, le_id, 2, '{"positionCount":1}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'visun.PHONG-TCKT-PHO-PHONG-TCKT', 'Phó phòng TCKT', 'subsidiary', 'Phòng TCKT', '{"companyId":"visun","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'visun', 'visun-PHONG-VTHK', 'Phòng VTHK', 'department', root_id, le_id, 3, '{"positionCount":1}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'visun.PHONG-VTHK-TRUONG-NHOM-DIEU-HANH', 'Trưởng nhóm điều hành', 'subsidiary', 'Phòng VTHK', '{"companyId":"visun","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

END $$;

INSERT INTO public.xbos_business_master_entries (tenant_id, company_id, domain, item_id, payload, status)
VALUES ('xevn', 'holding', 'companies', 'visun', '{"id":"visun","code":"VISUN","name":"Công ty TNHH Du lịch Visun","shortName":"Visun","status":"active","employeeCount":3}'::jsonb, 'active')
ON CONFLICT (tenant_id, company_id, domain, item_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();


INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
VALUES ('xevn', 'xe-du-lich', 'XE_DU_LICH', 'Công ty TNHH Du lịch X.E Việt Nam', 'subsidiary', '{"shortName":"X.E Du lịch VN","source":"unicom-mtcv-excel"}'::jsonb)
ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


DO $$
DECLARE le_id UUID; root_id UUID;
BEGIN
  SELECT id INTO le_id FROM public.xbos_legal_entity WHERE tenant_id='xevn' AND company_id='xe-du-lich' AND code='XE_DU_LICH' LIMIT 1;
  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-root', 'X.E Du lịch VN', 'subsidiary', le_id, 0, '{"employees":21}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
  RETURNING id INTO root_id;
  IF root_id IS NULL THEN
    SELECT id INTO root_id FROM public.xbos_org_unit WHERE tenant_id='xevn' AND company_id='xe-du-lich' AND code='xe-du-lich-root';
  END IF;


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-BAN-GIAM-SAT', 'Ban Giám sát', 'department', root_id, le_id, 1, '{"positionCount":1}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.BAN-GIAM-SAT-GIAM-SAT-DICH-VU', 'Giám sát dịch vụ', 'subsidiary', 'Ban Giám sát', '{"companyId":"xe-du-lich","departmentCode":"BAN-GIAM-SAT","departmentName":"Ban Giám sát"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-BAN-GIAM-OC', 'Ban Giám đốc', 'department', root_id, le_id, 2, '{"positionCount":3}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.BAN-GIAM-OC-G-DU-LICH-THU-KY-CHU-TICH', 'GĐ Du lịch + Thư ký Chủ tịch', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-du-lich","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.BAN-GIAM-OC-TRO-LY-CHU-TICH', 'Trợ lý Chủ tịch', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-du-lich","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.BAN-GIAM-OC-TRO-LY-GIAM-OC-X-E', 'Trợ lý Giám đốc X.E', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-du-lich","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-PHONG-HCNS', 'Phòng HCNS', 'department', root_id, le_id, 3, '{"positionCount":2}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-HCNS-HANH-CHINH', 'Hành chính', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-du-lich","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-HCNS-TRUONG-NHOM-TUYEN-DUNG', 'Trưởng nhóm tuyển dụng', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-du-lich","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-PHONG-MARKETING', 'Phòng Marketing', 'department', root_id, le_id, 4, '{"positionCount":4}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-MARKETING-CHUYEN-VIEN-QUAY-DUNG', 'Chuyên viên quay dựng', 'subsidiary', 'Phòng Marketing', '{"companyId":"xe-du-lich","departmentCode":"PHONG-MARKETING","departmentName":"Phòng Marketing"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-MARKETING-CHUYEN-VIEN-SANG-TAO-NOI-DUNG', 'Chuyên viên sáng tạo nội dung', 'subsidiary', 'Phòng Marketing', '{"companyId":"xe-du-lich","departmentCode":"PHONG-MARKETING","departmentName":"Phòng Marketing"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-MARKETING-CHUYEN-VIEN-THIET-KE', 'Chuyên viên thiết kế', 'subsidiary', 'Phòng Marketing', '{"companyId":"xe-du-lich","departmentCode":"PHONG-MARKETING","departmentName":"Phòng Marketing"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-MARKETING-TRUONG-PHONG-MKT', 'Trưởng phòng MKT', 'subsidiary', 'Phòng Marketing', '{"companyId":"xe-du-lich","departmentCode":"PHONG-MARKETING","departmentName":"Phòng Marketing"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-PHONG-TCKT', 'Phòng TCKT', 'department', root_id, le_id, 5, '{"positionCount":3}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-TCKT-KE-TOAN-CONG-NO', 'Kế toán công nợ', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-du-lich","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-TCKT-KE-TOAN-TINH', 'Kế toán tỉnh', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-du-lich","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-TCKT-KE-TOAN-TONG-HOP', 'Kế toán tổng hợp', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-du-lich","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-du-lich', 'xe-du-lich-PHONG-VTHK', 'Phòng VTHK', 'department', root_id, le_id, 6, '{"positionCount":8}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-CHAM-SOC-KHACH-HANG', 'Chăm sóc khách hàng', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-KINH-DOANH', 'Kinh doanh', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-LAI-XE-TUYEN', 'Lái xe tuyến', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-LE-TAN', 'Lễ tân', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-NHAN-VIEN-TONG-AI', 'Nhân viên tổng đài', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-TRUONG-BO-PHAN-TONG-AI', 'Trưởng bộ phận tổng đài', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-TRUONG-CA-TONG-AI', 'Trưởng ca tổng đài', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-du-lich.PHONG-VTHK-IEU-PHOI', 'Điều phối', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-du-lich","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

END $$;

INSERT INTO public.xbos_business_master_entries (tenant_id, company_id, domain, item_id, payload, status)
VALUES ('xevn', 'holding', 'companies', 'xe-du-lich', '{"id":"xe-du-lich","code":"XE_DU_LICH","name":"Công ty TNHH Du lịch X.E Việt Nam","shortName":"X.E Du lịch VN","status":"active","employeeCount":21}'::jsonb, 'active')
ON CONFLICT (tenant_id, company_id, domain, item_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();


INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
VALUES ('xevn', 'xe-vietnam', 'XE_VIETNAM', 'Công ty TNHH X.E Việt Nam', 'subsidiary', '{"shortName":"X.E Việt Nam","source":"unicom-mtcv-excel"}'::jsonb)
ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


DO $$
DECLARE le_id UUID; root_id UUID;
BEGIN
  SELECT id INTO le_id FROM public.xbos_legal_entity WHERE tenant_id='xevn' AND company_id='xe-vietnam' AND code='XE_VIETNAM' LIMIT 1;
  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-root', 'X.E Việt Nam', 'subsidiary', le_id, 0, '{"employees":64}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
  RETURNING id INTO root_id;
  IF root_id IS NULL THEN
    SELECT id INTO root_id FROM public.xbos_org_unit WHERE tenant_id='xevn' AND company_id='xe-vietnam' AND code='xe-vietnam-root';
  END IF;


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-BAN-GIAM-SAT', 'Ban Giám sát', 'department', root_id, le_id, 1, '{"positionCount":3}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-SAT-GIAM-SAT-DICH-VU', 'Giám sát dịch vụ', 'subsidiary', 'Ban Giám sát', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-SAT","departmentName":"Ban Giám sát"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-SAT-GIAM-SAT-TUAN-THU', 'Giám sát tuân thủ', 'subsidiary', 'Ban Giám sát', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-SAT","departmentName":"Ban Giám sát"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-SAT-TRUONG-NHOM-GIAM-SAT', 'Trưởng nhóm giám sát', 'subsidiary', 'Ban Giám sát', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-SAT","departmentName":"Ban Giám sát"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-BAN-GIAM-OC', 'Ban Giám đốc', 'department', root_id, le_id, 2, '{"positionCount":4}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-OC-CHU-TICH-HTV', 'Chủ tịch HĐTV', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-OC-GIAM-OC', 'Giám đốc', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-OC-THU-KY-CHU-TICH', 'Thư ký Chủ tịch', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.BAN-GIAM-OC-TRO-LY-CHU-TICH-HTV', 'Trợ lý chủ tịch HĐTV', 'subsidiary', 'Ban Giám đốc', '{"companyId":"xe-vietnam","departmentCode":"BAN-GIAM-OC","departmentName":"Ban Giám đốc"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-PHONG-DU-AN', 'Phòng Dự Án', 'department', root_id, le_id, 3, '{"positionCount":1}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-DU-AN-LAP-TRINH-VIEN', 'Lập trình viên', 'subsidiary', 'Phòng Dự Án', '{"companyId":"xe-vietnam","departmentCode":"PHONG-DU-AN","departmentName":"Phòng Dự Án"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-PHONG-HCNS', 'Phòng HCNS', 'department', root_id, le_id, 4, '{"positionCount":9}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-BAO-VE', 'Bảo vệ', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-CHUYEN-VIEN-CNTT', 'Chuyên viên CNTT', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-CHUYEN-VIEN-PHAP-CHE', 'Chuyên viên pháp chế', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-NHAN-VIEN-TIEN-LUONG-VA-PHUC-LOI', 'Nhân viên Tiền lương và Phúc lợi', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-NHAN-VIEN-CAN-VE-CHU-TICH-HOI-ON', 'Nhân viên cận vệ Chủ tịch Hội đồng thành viên', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-NHAN-VIEN-TAP-VU', 'Nhân viên tạp vụ', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-TRUONG-NHOM-TUYEN-DUNG', 'Trưởng nhóm tuyển dụng', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-TRUONG-PHONG-HCNS', 'Trưởng phòng HCNS', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-HCNS-TUYEN-DUNG', 'Tuyển dụng', 'subsidiary', 'Phòng HCNS', '{"companyId":"xe-vietnam","departmentCode":"PHONG-HCNS","departmentName":"Phòng HCNS"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-PHONG-QLPT', 'Phòng QLPT', 'department', root_id, le_id, 5, '{"positionCount":2}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-QLPT-CHUYEN-VIEN-QUAN-LY-PHUONG-TIEN', 'Chuyên viên quản lý phương tiện', 'subsidiary', 'Phòng QLPT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-QLPT","departmentName":"Phòng QLPT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-QLPT-TRUONG-PHONG-QLPT', 'Trưởng phòng QLPT', 'subsidiary', 'Phòng QLPT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-QLPT","departmentName":"Phòng QLPT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-PHONG-TCKT', 'Phòng TCKT', 'department', root_id, le_id, 6, '{"positionCount":7}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-KE-TOAN-CHUYEN-QUAN', 'Kế toán chuyên quản', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-KE-TOAN-CONG-NO', 'Kế toán công nợ', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-KE-TOAN-HANG-HOA', 'Kế toán hàng hoá', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-KE-TOAN-THANH-TOAN', 'Kế toán thanh toán', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-KE-TOAN-THUE', 'Kế toán thuế', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-THU-QUY', 'Thủ quỹ', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-TCKT-TRUONG-NHOM-THANH-TOAN', 'Trưởng nhóm thanh toán', 'subsidiary', 'Phòng TCKT', '{"companyId":"xe-vietnam","departmentCode":"PHONG-TCKT","departmentName":"Phòng TCKT"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-PHONG-VTHH', 'Phòng VTHH', 'department', root_id, le_id, 7, '{"positionCount":25}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-ADMIN', 'Admin', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-BAO-VE-RUA-XE', 'Bảo vệ - Rửa xe', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-BOC-XEP', 'Bốc xếp', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-KINH-DOANH', 'Kinh doanh', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-LAI-XE-TAI-TUYEN-NHANH', 'Lái xe tải tuyến nhánh', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-LAI-TAI-DU-PHONG', 'Lái tải dự phòng', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-LAI-TAI-TUYEN-CHINH', 'Lái tải tuyến chính', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-LAI-TAI-TUYEN-NHANH', 'Lái tải tuyến nhánh', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-LAI-XE-CONTAINER', 'Lái xe Container', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-LAI-XE-TRUNG-CHUYEN', 'Lái xe trung chuyển', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-NHAN-VIEN-GIAM-SAT-DU-AN', 'Nhân viên Giám Sát dự án', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-NHAN-VIEN-KINH-DOANH', 'Nhân viên Kinh doanh', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-NHAN-VIEN-LAI-XE-TRUNG-CHUYEN-HA', 'Nhân viên lái xe trung chuyển hàng hoá', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-NHAN-VIEN-TONG-AI', 'Nhân viên tổng đài', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-TBP-KINH-DOANH', 'TBP Kinh doanh', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-TRUONG-BUU-CUC', 'Trưởng bưu cục', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-TRUONG-NHOM-TONG-AI', 'Trưởng nhóm tổng đài', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-TRUONG-NHOM-IEU-HANH', 'Trưởng nhóm điều hành', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-HANH-TRUNG-TAM', 'Điều hành trung tâm', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-HANH-LAI-CONT', 'Điều hành Lái Cont', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-HANH-TUYEN-CHINH', 'Điều hành tuyến chính', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-HANH-TUYEN-NHANH', 'Điều hành tuyến nhánh', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-HANH-IEU-PHOI-HANG-HOA', 'Điều hành điều phối hàng hoá', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-PHOI', 'Điều phối', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHH-IEU-PHOI-HANG-HOA', 'Điều phối hàng hoá', 'subsidiary', 'Phòng VTHH', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHH","departmentName":"Phòng VTHH"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
  VALUES ('xevn', 'xe-vietnam', 'xe-vietnam-PHONG-VTHK', 'Phòng VTHK', 'department', root_id, le_id, 8, '{"positionCount":13}'::jsonb)
  ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-ADMIN', 'Admin', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-BAO-VE', 'Bảo vệ', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-LAI-XE-TRUNG-CHUYEN', 'Lái xe trung chuyển', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-LAI-XE-TUYEN', 'Lái xe tuyến', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-NHAN-VIEN-RUA-XE', 'Nhân viên rửa xe', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-NHAN-VIEN-TAP-VU', 'Nhân viên tạp vụ', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-NHAN-VIEN-TONG-AI', 'Nhân viên tổng đài', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-PHO-PHONG-VTHK', 'Phó phòng VTHK', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-THUC-TAP-SINH-IEU-HANH-TRUNG-TAM', 'Thực tập sinh Điều hành trung tâm', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-TRUONG-CHI-NHANH', 'Trưởng chi nhánh', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-IEU-HANH-TRUNG-TAM', 'Điều hành Trung tâm', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-IEU-HANH-TINH', 'Điều hành tỉnh', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();


  INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
  VALUES ('xevn', 'xe-vietnam.PHONG-VTHK-IEU-PHOI', 'Điều phối', 'subsidiary', 'Phòng VTHK', '{"companyId":"xe-vietnam","departmentCode":"PHONG-VTHK","departmentName":"Phòng VTHK"}'::jsonb)
  ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

END $$;

INSERT INTO public.xbos_business_master_entries (tenant_id, company_id, domain, item_id, payload, status)
VALUES ('xevn', 'holding', 'companies', 'xe-vietnam', '{"id":"xe-vietnam","code":"XE_VIETNAM","name":"Công ty TNHH X.E Việt Nam","shortName":"X.E Việt Nam","status":"active","employeeCount":64}'::jsonb, 'active')
ON CONFLICT (tenant_id, company_id, domain, item_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();
