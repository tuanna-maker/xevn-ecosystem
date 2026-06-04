import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();

const { Client } = pg;

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
};

const tenantId = process.env.MASTER_TENANT_ID || 'xevn';
const companyTextList = ['holding', 'trsport', 'logistics', 'finance', 'services'];
const companyUuidMap = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

function pick(arr, idx) {
  return arr[idx % arr.length];
}

const companyUuidList = () => Object.values(companyUuidMap);

/** Resolve company_id column type per table (live DB may differ from migrations). */
async function companyIdKind(client, table) {
  const r = await client.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'company_id'`,
    [table],
  );
  return r.rows[0]?.data_type === 'uuid' ? 'uuid' : 'text';
}

async function seedHrmEmployees(client) {
  const empCompanyKind = await companyIdKind(client, 'employees');
  const roles = [
    'CEO','COO','CFO','CHRO','CTO','HRBP_MANAGER','HR_SPECIALIST','PAYROLL_SPECIALIST','RECRUITER',
    'OPS_MANAGER','DISPATCH_SUPERVISOR','FLEET_SUPERVISOR','WAREHOUSE_SUP','WAREHOUSE_STAFF',
    'DRIVER_LEAD','DRIVER','ACCOUNTANT','FINANCE_ANALYST','SALES_MANAGER','SALES_EXECUTIVE',
    'LEGAL_SPECIALIST','SAFETY_OFFICER','IT_ADMIN','DATA_ANALYST','CUSTOMER_SUCCESS',
  ];
  const departments = [
    'Ban Điều hành','Nhân sự','Tài chính','Vận hành','Kho vận',
    'Kinh doanh','CNTT','Pháp chế','An toàn','CSKH',
  ];

  if (empCompanyKind === 'uuid') {
    await client.query(`DELETE FROM public.employees WHERE company_id = ANY($1::uuid[])`, [companyUuidList()]);
  } else {
    await client.query(`DELETE FROM public.employees WHERE company_id = ANY($1::text[])`, [companyTextList]);
  }

  for (let i = 0; i < 100; i += 1) {
    const seq = i + 1;
    const companySlug = pick(companyTextList, i);
    const companyUuid = companyUuidMap[companySlug];
    const companyId = empCompanyKind === 'uuid' ? companyUuid : companySlug;
    const role = pick(roles, i);
    const dept = pick(departments, i);
    const hiredAt = new Date(Date.UTC(2022 + (i % 4), (i * 3) % 12, ((i * 7) % 27) + 1)).toISOString().slice(0, 10);
    const employeeId = `20000000-0000-4000-8000-${String(seq).padStart(12, '0')}`;
    const employeeCode = `NV${String(seq).padStart(4, '0')}`;
    await client.query(
      `
      INSERT INTO public.employees
        (id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields, archived_at, updated_at)
      VALUES
        ($1::uuid, $2, $3, $4, $5, $6, $7, $8::date, $9::jsonb, NULL, NOW())
      `,
      [
        employeeId,
        companyId,
        employeeCode,
        `nhansu${String(seq).padStart(4, '0')}@xe.vn`,
        `Nguyen NhanSu ${String(seq).padStart(3, '0')}`,
        role,
        i % 12 === 0 ? 'inactive' : 'active',
        hiredAt,
        JSON.stringify({
          company_slug: companySlug,
          department: dept,
          cost_center: `CC-${companySlug.toUpperCase()}`,
          grade: `G${(i % 7) + 1}`,
          shift_group: i % 2 === 0 ? 'Ca hành chính' : 'Ca xoay',
        }),
      ],
    );
  }
}

async function seedHrmOperationalTables(client) {
  const kinds = {
    employee_contracts: await companyIdKind(client, 'employee_contracts'),
    employee_insurance_records: await companyIdKind(client, 'employee_insurance_records'),
    attendance_records: await companyIdKind(client, 'attendance_records'),
    payroll_periods: await companyIdKind(client, 'payroll_periods'),
    job_requisitions: await companyIdKind(client, 'job_requisitions'),
    recruitment_candidates: await companyIdKind(client, 'recruitment_candidates'),
    recruitment_interviews: await companyIdKind(client, 'recruitment_interviews'),
    service_requests: await companyIdKind(client, 'service_requests'),
    hrm_tasks: await companyIdKind(client, 'hrm_tasks'),
    performance_cycles: await companyIdKind(client, 'performance_cycles'),
    performance_evaluations: await companyIdKind(client, 'performance_evaluations'),
  };

  const empKind = await companyIdKind(client, 'employees');
  const empFilter = empKind === 'uuid' ? companyUuidList() : companyTextList;
  const empCast = empKind === 'uuid' ? 'uuid[]' : 'text[]';

  const empRes = await client.query(
    `SELECT id, company_id, employee_code, full_name
     FROM public.employees
     WHERE company_id = ANY($1::${empCast})
     ORDER BY employee_code
     LIMIT 100`,
    [empFilter],
  );
  const employees = empRes.rows;

  async function del(table) {
    const k = kinds[table];
    if (!k) return;
    const vals = k === 'uuid' ? companyUuidList() : companyTextList;
    await client.query(
      `DELETE FROM public.${table} WHERE company_id = ANY($1::${k}[])`,
      [vals],
    );
  }

  await del('employee_contracts');
  await del('employee_insurance_records');
  await del('attendance_records');
  await del('payroll_periods');
  await del('recruitment_interviews');
  await del('recruitment_candidates');
  await del('job_requisitions');
  await del('service_requests');
  await del('hrm_tasks');
  await del('performance_evaluations');
  await del('performance_cycles');

  const hasPerfCycles = Boolean(kinds.performance_cycles);
  const hasHrmTasks = kinds.hrm_tasks === 'uuid';

  const slugFromEmp = (companyId) =>
    empKind === 'text' ? companyId : Object.entries(companyUuidMap).find(([, u]) => u === companyId)?.[0] ?? 'holding';
  const uuidFromEmp = (companyId) =>
    empKind === 'uuid' ? companyId : companyUuidMap[companyId] ?? companyUuidMap.holding;
  const cidFor = (slug, table) => (kinds[table] === 'uuid' ? companyUuidMap[slug] : slug);

  for (const [idx, e] of employees.entries()) {
    const contractCompany =
      kinds.employee_contracts === 'uuid' ? uuidFromEmp(e.company_id) : slugFromEmp(e.company_id);
    const insuranceCompany =
      kinds.employee_insurance_records === 'uuid' ? uuidFromEmp(e.company_id) : slugFromEmp(e.company_id);
    await client.query(
      `INSERT INTO public.employee_contracts
       (id, company_id, employee_id, contract_type, start_date, end_date, status)
       VALUES ($1::uuid,$2,$3::uuid,$4,$5::date,$6::date,$7)`,
      [
        randomUUID(),
        contractCompany,
        e.id,
        idx % 3 === 0 ? 'HĐ 3 năm' : idx % 3 === 1 ? 'HĐ 1 năm' : 'HĐ không thời hạn',
        '2024-01-01',
        idx % 7 === 0 ? '2026-12-31' : '2027-12-31',
        'active',
      ],
    );
    await client.query(
      `INSERT INTO public.employee_insurance_records
       (id, company_id, employee_id, provider, policy_number, expiry_date, status)
       VALUES ($1::uuid,$2,$3::uuid,$4,$5,$6::date,'active')`,
      [randomUUID(), insuranceCompany, e.id, idx % 2 === 0 ? 'Bao Viet' : 'PVI', `POL-${e.employee_code}`, '2027-06-30'],
    );
  }

  for (const company of companyTextList) {
    const payrollCompany = cidFor(company, 'payroll_periods');
    const perfCompany = cidFor(company, 'performance_cycles');
    const reqCompany = cidFor(company, 'job_requisitions');
    const svcCompany = cidFor(company, 'service_requests');
    const taskCompany = cidFor(company, 'hrm_tasks');
    await client.query(
      `INSERT INTO public.payroll_periods
       (id, company_id, period_label, start_date, end_date, status, created_by, processed_at)
       VALUES ($1::uuid,$2,$3,$4::date,$5::date,'processed','seed-system',NOW()),
              ($6::uuid,$2,$7,$8::date,$9::date,'draft','seed-system',NULL)`,
      [randomUUID(), payrollCompany, 'Payroll 2026-03', '2026-03-01', '2026-03-31', randomUUID(), 'Payroll 2026-04', '2026-04-01', '2026-04-30'],
    );
    if (hasPerfCycles) {
      await client.query(
        `INSERT INTO public.performance_cycles
         (id, company_id, cycle_name, start_date, end_date, status, created_by)
         VALUES ($1::uuid,$2,'Q1 2026','2026-01-01','2026-03-31','closed','seed-system'),
                ($3::uuid,$2,'Q2 2026','2026-04-01','2026-06-30','active','seed-system')`,
        [randomUUID(), perfCompany, randomUUID()],
      );
    }
    await client.query(
      `INSERT INTO public.job_requisitions
       (id, company_id, title, department, employment_type, status)
       VALUES ($1::uuid,$2,'Nhân viên vận hành','Vận hành','full-time','open'),
              ($3::uuid,$2,'Chuyên viên nhân sự','Nhân sự','full-time','open')`,
      [randomUUID(), reqCompany, randomUUID()],
    );
    if (hasHrmTasks) {
      await client.query(
        `INSERT INTO public.hrm_tasks
         (id, company_id, title, description, priority, status, due_date)
         VALUES ($1::uuid,$2,'Rà soát KPI tuần','Kiểm tra KPI tuần cho đội vận hành','high','in_progress',CURRENT_DATE + INTERVAL '2 days'),
                ($3::uuid,$2,'Cập nhật lịch trực','Điều chỉnh lịch trực tháng','medium','todo',CURRENT_DATE + INTERVAL '5 days')`,
        [randomUUID(), taskCompany, randomUUID()],
      );
    }
    await client.query(
      `INSERT INTO public.service_requests
       (id, company_id, service_type, employee_name, employee_code, department, request_date, status, notes, meal_type, meal_date, meal_quantity)
       VALUES
       ($1::uuid,$2,'meal','Nguyen Van A','NV0001','Vận hành',CURRENT_DATE,'pending','Suất ăn ca tối','Tối',CURRENT_DATE,15),
       ($3::uuid,$2,'vehicle','Tran Thi B','NV0002','Nhân sự',CURRENT_DATE,'approved','Đi công tác nội bộ',NULL,NULL,NULL)`,
      [randomUUID(), svcCompany, randomUUID()],
    );
  }

  if (hasPerfCycles) {
    const perfCast = kinds.performance_cycles === 'uuid' ? 'uuid[]' : 'text[]';
    const perfFilter = kinds.performance_cycles === 'uuid' ? companyUuidList() : companyTextList;
    const cyclesRes = await client.query(
      `SELECT id, company_id FROM public.performance_cycles WHERE company_id = ANY($1::${perfCast})`,
      [perfFilter],
    );
    for (const row of cyclesRes.rows.slice(0, 10)) {
      const emp = employees.find((x) => x.company_id === row.company_id);
      if (!emp) continue;
      await client.query(
        `INSERT INTO public.performance_evaluations
         (id, company_id, employee_id, cycle_id, score, summary, reviewer)
         VALUES ($1::uuid,$2,$3::uuid,$4::uuid,$5,$6,$7)`,
        [
          randomUUID(),
          kinds.performance_evaluations === 'uuid' ? row.company_id : slugFromEmp(row.company_id),
          emp.id,
          row.id,
          70 + Math.random() * 25,
          'Đánh giá đạt kỳ vọng',
          'Trưởng bộ phận',
        ],
      );
    }
  }

  for (const e of employees.slice(0, 60)) {
    const compUuid = cidFor(slugFromEmp(e.company_id), 'attendance_records');
    const date = new Date();
    date.setDate(date.getDate() - (Math.floor(Math.random() * 15)));
    const d = date.toISOString().slice(0, 10);
    await client.query(
      `INSERT INTO public.attendance_records
       (id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by)
       VALUES ($1::uuid,$2::uuid,$3::uuid,$4::date,$5::timestamptz,$6::timestamptz,$7,$8,$9)`,
      [
        randomUUID(),
        compUuid,
        e.id,
        d,
        `${d}T08:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00Z`,
        `${d}T17:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00Z`,
        'present',
        'Seed dữ liệu công',
        'seed-system',
      ],
    );
  }

  const reqRes = await client.query(`SELECT id, company_id FROM public.job_requisitions ORDER BY created_at DESC LIMIT 20`);
  for (const req of reqRes.rows) {
    const candidateId = randomUUID();
    await client.query(
      `INSERT INTO public.recruitment_candidates
       (id, company_id, requisition_id, full_name, email, source, status)
       VALUES ($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7)`,
      [candidateId, req.company_id, req.id, `Ứng viên ${candidateId.slice(0, 6)}`, `candidate.${candidateId.slice(0, 6)}@mail.com`, 'linkedin', 'interview'],
    );
    await client.query(
      `INSERT INTO public.recruitment_interviews
       (id, company_id, candidate_id, scheduled_at, interviewer, status)
       VALUES ($1::uuid,$2::uuid,$3::uuid,NOW() + INTERVAL '2 days',$4,'scheduled')`,
      [randomUUID(), req.company_id, candidateId, 'Interviewer Seed'],
    );
  }
}

async function seedXbos(client) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.config_catalogs (
      id BIGSERIAL PRIMARY KEY, catalog_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, domain TEXT NOT NULL,
      assigned_systems JSONB NOT NULL DEFAULT '[]'::jsonb, tenant_id TEXT NOT NULL DEFAULT 'xevn',
      company_id TEXT NOT NULL DEFAULT 'holding', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.config_catalog_items (
      id BIGSERIAL PRIMARY KEY, catalog_key TEXT NOT NULL, code TEXT NOT NULL, label TEXT NOT NULL,
      unit TEXT NULL, status TEXT NOT NULL DEFAULT 'active', UNIQUE (catalog_key, code)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.xbos_infrastructure_settings (
      tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, foundation_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      sites JSONB NOT NULL DEFAULT '[]'::jsonb, block_title_overrides_by_entity JSONB NOT NULL DEFAULT '{}'::jsonb,
      custom_blocks_by_entity JSONB NOT NULL DEFAULT '{}'::jsonb, custom_field_defs_by_entity JSONB NOT NULL DEFAULT '{}'::jsonb,
      foundation_categories_count INT NOT NULL DEFAULT 0, sites_count INT NOT NULL DEFAULT 0, custom_fields_count INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (tenant_id, company_id)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.xbos_business_master_entries (
      tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, domain TEXT NOT NULL, item_id TEXT NOT NULL, payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tenant_id, company_id, domain, item_id)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.asset_registry (
      id BIGSERIAL PRIMARY KEY, asset_id UUID NOT NULL DEFAULT gen_random_uuid(), tenant_id TEXT NOT NULL, company_id TEXT NOT NULL,
      asset_code TEXT NOT NULL, asset_name TEXT NOT NULL, asset_type TEXT NOT NULL, vin TEXT NULL, chassis_no TEXT NULL, status TEXT NOT NULL DEFAULT 'active',
      owner_module TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}'::jsonb, version INT NOT NULL DEFAULT 1, created_by TEXT NOT NULL DEFAULT 'system',
      updated_by TEXT NOT NULL DEFAULT 'system', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (asset_id), UNIQUE (tenant_id, company_id, asset_code)
    );
  `);

  await client.query(`DELETE FROM public.config_catalog_items WHERE catalog_key IN ('job_titles','cost_centers','kpi_library')`);
  await client.query(`DELETE FROM public.config_catalogs WHERE catalog_key IN ('job_titles','cost_centers','kpi_library')`);
  await client.query(`DELETE FROM public.xbos_business_master_entries WHERE tenant_id = $1 AND company_id = 'holding'`, [tenantId]);
  await client.query(`DELETE FROM public.asset_registry WHERE tenant_id = $1 AND company_id = 'holding'`, [tenantId]);

  const catalogs = [
    ['job_titles', 'Danh mục chức danh XeVN', 'human_resources', JSON.stringify(['hrm','xbos'])],
    ['cost_centers', 'Danh mục cost center XeVN', 'finance_control', JSON.stringify(['hrm','xbos','web-portal'])],
    ['kpi_library', 'Thư viện KPI tập đoàn', 'performance_management', JSON.stringify(['xbos','hrm'])],
  ];
  for (const c of catalogs) {
    await client.query(
      `INSERT INTO public.config_catalogs (catalog_key,name,domain,assigned_systems,tenant_id,company_id,updated_at)
       VALUES ($1,$2,$3,$4::jsonb,$5,'holding',NOW())`,
      [c[0], c[1], c[2], c[3], tenantId],
    );
  }
  const catalogItems = [
    ['job_titles','CEO','Tổng giám đốc',null],['job_titles','CHRO','Giám đốc nhân sự',null],['job_titles','OPS_MANAGER','Quản lý vận hành',null],
    ['cost_centers','CC-HOLDING-OPS','Trung tâm vận hành',null],['cost_centers','CC-HOLDING-HR','Trung tâm nhân sự',null],
    ['kpi_library','KPI_OTIF','Tỷ lệ OTIF','%'],['kpi_library','KPI_ABSENCE','Tỷ lệ vắng mặt','%'],
  ];
  for (const i of catalogItems) {
    await client.query(
      `INSERT INTO public.config_catalog_items (catalog_key,code,label,unit,status) VALUES ($1,$2,$3,$4,'active')`,
      i,
    );
  }

  const businessDomainsPayload = {
    companies: [
      { id: 'all', code: 'ALL', name: 'Toàn tập đoàn', shortName: 'All', employeeCount: 100, revenue: 10000000000, status: 'active' },
      ...companyTextList.map((c) => ({ id: c, code: c.toUpperCase(), name: `Công ty ${c.toUpperCase()}`, shortName: c.toUpperCase(), employeeCount: 20, revenue: 2000000000, status: 'active' })),
    ],
    positions: [
      { id: 'pos-ceo', code: 'CEO', name: 'Tổng giám đốc', level: 1, category: 'management', description: 'Điều hành tập đoàn', applicableCompanies: ['all'] },
      { id: 'pos-ops', code: 'OPS', name: 'Quản lý vận hành', level: 3, category: 'management', description: 'Quản lý vận hành', applicableCompanies: ['all'] },
    ],
    kpi_metrics: [
      { id: 'kpi-otif', code: 'OTIF', name: 'Tỷ lệ giao đúng hạn', unit: '%', category: 'Vận hành', targetValue: 95, warningThreshold: 90, criticalThreshold: 80, applicableCompanies: ['all'] },
      { id: 'kpi-absence', code: 'ABSENCE', name: 'Tỷ lệ vắng mặt', unit: '%', category: 'Nhân sự', targetValue: 3, warningThreshold: 5, criticalThreshold: 8, applicableCompanies: ['all'] },
    ],
    vendors: [
      { id: 'vnd-fuel-01', code: 'VND-FUEL-01', shortName: 'Petro', name: 'Nhà cung cấp nhiên liệu Petro', category: 'fuel', relatedCompanies: ['all'], status: 'active' },
    ],
    expense_categories: [
      { id: 'exp-fuel', code: 'EXP-FUEL', name: 'Chi phí nhiên liệu', category: 'variable', type: 'fuel', accountCode: '6421', taxDeductible: true, requiresReceipt: true, approvalRequired: false, applicableCompanies: ['all'], status: 'active' },
    ],
    organizations: [
      { id: 'org-holding', name: 'Tập đoàn XeVN', type: 'company', manager: 'CEO', employees: 100, children: [{ id: 'org-ops', name: 'Khối vận hành', type: 'department', manager: 'COO', employees: 35 }] },
    ],
    customers: [
      { id: 'cus-001', code: 'CUS001', name: 'Công ty A', type: 'corporate', industry: 'Logistics', contactPerson: 'Nguyễn A', phone: '0900000001', totalOrders: 120, totalRevenue: 1500000000, status: 'active', createdAt: '2026-01-01', fromCompanyId: 'holding' },
    ],
    partners: [
      { id: 'par-001', code: 'PAR001', name: 'Đối tác B', type: 'supplier', industry: 'Fuel', contactPerson: 'Trần B', phone: '0900000002', totalContracts: 12, totalValue: 2200000000, status: 'active', createdAt: '2026-01-01', relatedCompanies: ['all'], email: 'partnerb@xe.vn' },
    ],
  };

  for (const [domain, items] of Object.entries(businessDomainsPayload)) {
    for (const item of items) {
      await client.query(
        `INSERT INTO public.xbos_business_master_entries
         (tenant_id, company_id, domain, item_id, payload, status, updated_at)
         VALUES ($1,'holding',$2,$3,$4::jsonb,'active',NOW())`,
        [tenantId, domain, item.id, JSON.stringify(item)],
      );
    }
  }

  await client.query(
    `
    INSERT INTO public.xbos_infrastructure_settings
      (tenant_id, company_id, foundation_categories, sites, block_title_overrides_by_entity, custom_blocks_by_entity, custom_field_defs_by_entity, foundation_categories_count, sites_count, custom_fields_count, updated_at)
    VALUES
      ($1,'holding',$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,1,2,0,NOW())
    ON CONFLICT (tenant_id, company_id)
    DO UPDATE SET
      foundation_categories = EXCLUDED.foundation_categories,
      sites = EXCLUDED.sites,
      block_title_overrides_by_entity = EXCLUDED.block_title_overrides_by_entity,
      custom_blocks_by_entity = EXCLUDED.custom_blocks_by_entity,
      custom_field_defs_by_entity = EXCLUDED.custom_field_defs_by_entity,
      foundation_categories_count = EXCLUDED.foundation_categories_count,
      sites_count = EXCLUDED.sites_count,
      custom_fields_count = EXCLUDED.custom_fields_count,
      updated_at = NOW()
    `,
    [
      tenantId,
      JSON.stringify([{ id: 'fcat-core', code: 'HT-LOG-CS', nameVi: 'Danh mục hạ tầng logistics', description: 'Khối chuẩn', appliesToCompanyIds: ['holding'] }]),
      JSON.stringify([
        { id: 'site-01', siteCode: 'KHO-HQ-01', name: 'Kho trung tâm', facilityType: 'warehouse', operatingEntityId: 'holding', capacitySummary: '1200 pallet', status: 'active', addressDetail: 'HCM', ownerLegalEntityId: 'holding', customFields: {} },
        { id: 'site-02', siteCode: 'BAI-HN-01', name: 'Bãi xe Hà Nội', facilityType: 'parking', operatingEntityId: 'holding', capacitySummary: '250 xe', status: 'active', addressDetail: 'HN', ownerLegalEntityId: 'holding', customFields: {} },
      ]),
      JSON.stringify({ holding: { general: 'Khối Thông tin chung', location: 'Khối Vị trí', capacity: 'Khối Năng lực' } }),
      JSON.stringify({ holding: [] }),
      JSON.stringify({ holding: [] }),
    ],
  );

  const assets = [
    ['ASSET-TRUCK-001', 'Xe tải Hino 15T', 'vehicle', 'VIN-TRK-001', 'CHS-TRK-001'],
    ['ASSET-FORK-001', 'Xe nâng Toyota', 'equipment', 'VIN-FRK-001', 'CHS-FRK-001'],
    ['ASSET-LAP-001', 'Laptop điều phối', 'it', null, null],
  ];
  for (const a of assets) {
    await client.query(
      `INSERT INTO public.asset_registry
       (tenant_id, company_id, asset_code, asset_name, asset_type, vin, chassis_no, status, owner_module, metadata, version, created_by, updated_by)
       VALUES ($1,'holding',$2,$3,$4,$5,$6,'active','operations',$7::jsonb,1,'seed-system','seed-system')
       ON CONFLICT (tenant_id, company_id, asset_code)
       DO UPDATE SET asset_name = EXCLUDED.asset_name, asset_type = EXCLUDED.asset_type, metadata = EXCLUDED.metadata, updated_at = NOW()`,
      [tenantId, a[0], a[1], a[2], a[3], a[4], JSON.stringify({ source: 'seed-full-ecosystem' })],
    );
  }
}

async function main() {
  const hrm = new Client({ ...baseConfig, database: process.env.HRM_DB_NAME || 'xevn_hrm' });
  const xbos = new Client({ ...baseConfig, database: process.env.XBOS_DB_NAME || 'xevn_xbos' });
  await hrm.connect();
  await xbos.connect();
  try {
    await hrm.query('BEGIN');
    await xbos.query('BEGIN');

    await seedHrmEmployees(hrm);
    await seedHrmOperationalTables(hrm);
    await seedXbos(xbos);

    await hrm.query('COMMIT');
    await xbos.query('COMMIT');

    const summary = {
      tenant: tenantId,
      hrm: {
        employees: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.employees`)).rows[0].c,
        contracts: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.employee_contracts`)).rows[0].c,
        insurance: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.employee_insurance_records`)).rows[0].c,
        attendance: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.attendance_records`)).rows[0].c,
        payroll_periods: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.payroll_periods`)).rows[0].c,
        requisitions: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.job_requisitions`)).rows[0].c,
        candidates: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.recruitment_candidates`)).rows[0].c,
        interviews: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.recruitment_interviews`)).rows[0].c,
        service_requests: (await hrm.query(`SELECT COUNT(*)::int AS c FROM public.service_requests`)).rows[0].c,
      },
      xbos: {
        catalogs: (await xbos.query(`SELECT COUNT(*)::int AS c FROM public.config_catalogs WHERE tenant_id = $1`, [tenantId])).rows[0].c,
        catalog_items: (await xbos.query(`SELECT COUNT(*)::int AS c FROM public.config_catalog_items WHERE catalog_key IN ('job_titles','cost_centers','kpi_library')`)).rows[0].c,
        business_master_items: (await xbos.query(`SELECT COUNT(*)::int AS c FROM public.xbos_business_master_entries WHERE tenant_id = $1 AND company_id = 'holding' AND status <> 'deleted'`, [tenantId])).rows[0].c,
        infrastructure_rows: (await xbos.query(`SELECT COUNT(*)::int AS c FROM public.xbos_infrastructure_settings WHERE tenant_id = $1`, [tenantId])).rows[0].c,
        assets: (await xbos.query(`SELECT COUNT(*)::int AS c FROM public.asset_registry WHERE tenant_id = $1 AND company_id = 'holding'`, [tenantId])).rows[0].c,
      },
    };
    console.log(JSON.stringify({ success: true, summary }, null, 2));
  } catch (error) {
    await hrm.query('ROLLBACK');
    await xbos.query('ROLLBACK');
    throw error;
  } finally {
    await hrm.end();
    await xbos.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});

