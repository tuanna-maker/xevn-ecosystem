#!/usr/bin/env node
/**
 * Seed CT Du lịch XeVN (xe-du-lich): nhân sự mẫu, 234 xe từ TT phương tiện 1505.xlsx, bảng lương T1–T5/2026.
 *
 * Usage: pnpm run seed:tourism:xe-du-lich
 * Env: deploy/xevn-ecosystem/.env (DATABASE_URL_HRM or DB_*)
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requireHrm = createRequire(resolve(root, 'apps/api/hrm-api/package.json'));
const { Pool } = requireHrm('pg');
const ExcelJS = requireHrm('exceljs');
const TENANT = 'xe-du-lich';
const COMPANY = 'main';
const EXCEL_DEFAULT = '/Users/uranus/Downloads/TT phương tiện 1505.xlsx';

function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function poolFromEnv() {
  if (process.env.DATABASE_URL_HRM) return new Pool({ connectionString: process.env.DATABASE_URL_HRM, ssl: false });
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.HRM_DB_NAME ?? 'xevn_hrm',
    ssl: false,
  });
}

function cellStr(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object' && v !== null && 'result' in v) return String(v.result ?? '');
  return String(v).trim();
}

const HEADER_TO_FIELD = {
  'Tên lái xe': 'driver_name',
  'SĐT lái xe': 'driver_phone',
  Tuyến: 'route_name',
  'Mục đích sử dụng': 'usage_purpose',
  BKS: 'license_plate',
  'Số khung': 'chassis_number',
  'Số máy': 'engine_number',
  'Năm sản xuất': 'production_year',
  'Hãng sản xuất': 'manufacturer',
  Model: 'model',
  'Số chỗ (Không bao gồm LX)': 'seat_capacity',
  'Số KM hiện tại': 'current_odometer_km',
  'Ngày bắt đầu hoạt động xe': 'operation_start_date',
  'Ngày đăng ký lần đầu': 'first_registration_date',
  'Ngày đăng kiểm lần đầu': 'first_inspection_date',
  'Ngày đăng ký xe': 'vehicle_registration_date',
  'Ngày đăng kiểm': 'inspection_date',
  'Ngày hết hạn đăng kiểm': 'inspection_expiry_date',
  'Ngày cấp bảo hiểm TNDS': 'tpl_insurance_issue_date',
  'Ngày hết hạn bảo hiểm TNDS': 'tpl_insurance_expiry_date',
  'Ngày cấp bảo hiểm vật chất xe': 'comprehensive_insurance_issue_date',
  'Ngày hết hạn bảo hiểm vật chất xe': 'comprehensive_insurance_expiry_date',
  'Ngày cấp phù hiệu': 'badge_issue_date',
  'Ngày hết hạn phù hiệu': 'badge_expiry_date',
  'Ngày cấp giấy đi đường': 'road_permit_issue_date',
  'Ngày hết hạn giấy đi đường': 'road_permit_expiry_date',
  'Phí bảo trì đường bộ ': 'road_maintenance_fee',
  'Phí bảo trì đường bộ': 'road_maintenance_fee',
  'Ngày đóng phí bảo trì': 'road_fee_paid_date',
  'Ngày hết hạn phí bảo trì': 'road_fee_expiry_date',
  'Gói cước di động': 'mobile_plan',
  'Nhà mạng': 'mobile_carrier',
  'Ngày đăng ký': 'mobile_registered_date',
  'Ngày hết hạn': 'mobile_expiry_date',
  'Thiết bị định vị': 'gps_device',
  'Ngày lắp ': 'gps_installed_date',
  'Ngày lắp': 'gps_installed_date',
  'Tổ chức vay': 'loan_organization',
  'Ngày vay': 'loan_date',
  'Số tiền vay': 'loan_amount',
};

const TOURISM_STAFF = [
  { code: 'DL-001', name: 'Nguyễn Minh Tuấn', email: 'ceo@xe-du-lich.vn', title: 'CEO', base: 85000000 },
  { code: 'DL-002', name: 'Trần Thị Hương', email: 'hr@xe-du-lich.vn', title: 'HR_MANAGER', base: 32000000 },
  { code: 'DL-003', name: 'Lê Văn Phúc', email: 'dieuhanh@xe-du-lich.vn', title: 'DISPATCH', base: 28000000 },
  { code: 'DL-004', name: 'Phạm Quốc Bình', email: 'ketoan@xe-du-lich.vn', title: 'ACCOUNTANT', base: 26000000 },
  { code: 'DL-005', name: 'Hoàng Thị Lan', email: 'fleet@xe-du-lich.vn', title: 'FLEET_MANAGER', base: 30000000 },
  { code: 'DL-006', name: 'Vũ Đức Anh', email: 'laixe01@xe-du-lich.vn', title: 'DRIVER', base: 15000000 },
  { code: 'DL-007', name: 'Đỗ Minh Khôi', email: 'laixe02@xe-du-lich.vn', title: 'DRIVER', base: 15000000 },
  { code: 'DL-008', name: 'Bùi Thanh Tùng', email: 'laixe03@xe-du-lich.vn', title: 'DRIVER', base: 14800000 },
  { code: 'DL-009', name: 'Ngô Văn Hải', email: 'laixe04@xe-du-lich.vn', title: 'DRIVER', base: 14700000 },
  { code: 'DL-010', name: 'Đặng Thị Mai', email: 'cs@xe-du-lich.vn', title: 'CS', base: 18000000 },
];

const PAYROLL_MONTHS = [
  { label: '01/2026', start: '2026-01-01', end: '2026-01-31', status: 'closed' },
  { label: '02/2026', start: '2026-02-01', end: '2026-02-28', status: 'closed' },
  { label: '03/2026', start: '2026-03-01', end: '2026-03-31', status: 'closed' },
  { label: '04/2026', start: '2026-04-01', end: '2026-04-30', status: 'processed' },
  { label: '05/2026', start: '2026-05-01', end: '2026-05-31', status: 'draft' },
];

async function ensureSchemas(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.employees (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_code TEXT NOT NULL,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      job_title_key TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      hired_at DATE NULL,
      archived_at TIMESTAMPTZ NULL,
      custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_fleet_vehicles (
      id UUID PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      license_plate TEXT NOT NULL,
      fleet_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_fleet_plate_scope
    ON public.hrm_fleet_vehicles (tenant_id, company_id, license_plate);
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_periods (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_label TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_by TEXT NULL,
      processed_at TIMESTAMPTZ NULL,
      closed_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    ALTER TABLE public.payroll_periods ALTER COLUMN company_id TYPE TEXT USING company_id::text;
  `).catch(() => {});
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_payslips (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
      employee_id UUID NOT NULL,
      employee_code TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      deduction_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      net_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'VND',
      status TEXT NOT NULL DEFAULT 'processed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_payslip_period_employee
    ON public.payroll_payslips (period_id, employee_id);
  `);
}

async function parseFleetRows(excelPath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(excelPath);
  const sheet = wb.worksheets[0];
  const headerRow = sheet.getRow(1);
  const colMap = [];
  headerRow.eachCell((cell, col) => {
    const label = cellStr(cell.value);
    colMap[col] = HEADER_TO_FIELD[label] ?? label;
  });

  const vehicles = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const fields = {};
    let plate = '';
    row.eachCell((cell, col) => {
      const key = colMap[col];
      if (!key) return;
      const val = cellStr(cell.value);
      if (!val) return;
      fields[key] = val;
      if (key === 'license_plate') plate = val.toUpperCase();
    });
    if (!plate && fields.route_name) {
      /* file thực tế lệch cột — map theo vị trí chuẩn BKS cột 5 */
      plate = cellStr(row.getCell(5).value).toUpperCase();
      fields.license_plate = plate;
      fields.route_name = cellStr(row.getCell(3).value);
      fields.usage_purpose = cellStr(row.getCell(4).value);
      fields.chassis_number = cellStr(row.getCell(6).value);
      fields.engine_number = cellStr(row.getCell(7).value);
      fields.production_year = cellStr(row.getCell(8).value);
      fields.manufacturer = cellStr(row.getCell(9).value);
      fields.model = cellStr(row.getCell(10).value);
    }
    if (!plate) continue;
    vehicles.push({ license_plate: plate, fleet_fields: fields });
  }
  return vehicles;
}

function stableUuid(seed) {
  const h = createHash('sha256').update(seed).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

async function main() {
  loadEnv(resolve(root, 'deploy/xevn-ecosystem/.env'));
  const excelPath = process.argv[2] || process.env.TOURISM_FLEET_EXCEL || EXCEL_DEFAULT;
  if (!existsSync(excelPath)) {
    console.error('Không tìm thấy file Excel:', excelPath);
    process.exit(1);
  }

  const pool = poolFromEnv();
  const client = await pool.connect();
  try {
    await ensureSchemas(client);

    const employeeIds = new Map();
    for (const s of TOURISM_STAFF) {
      const id = stableUuid(`${TENANT}:${COMPANY}:${s.code}`);
      employeeIds.set(s.code, id);
      await client.query(
        `INSERT INTO public.employees (id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields)
         VALUES ($1,$2,$3,$4,$5,$6,'active','2024-06-01'::date,$7::jsonb)
         ON CONFLICT (company_id, employee_code) DO UPDATE SET
           email = EXCLUDED.email,
           full_name = EXCLUDED.full_name,
           job_title_key = EXCLUDED.job_title_key,
           custom_fields = EXCLUDED.custom_fields,
           updated_at = NOW()`,
        [
          id,
          COMPANY,
          s.code,
          s.email,
          s.name,
          s.title,
          JSON.stringify({ tenant_id: TENANT, base_salary: s.base }),
        ],
      );
    }
    console.log(`✓ Nhân sự CT Du lịch: ${TOURISM_STAFF.length} hồ sơ (company_id=${COMPANY})`);

    const vehicles = await parseFleetRows(excelPath);
    let fleetN = 0;
    for (const v of vehicles) {
      const id = stableUuid(`${TENANT}:fleet:${v.license_plate}`);
      await client.query(
        `INSERT INTO public.hrm_fleet_vehicles (id, tenant_id, company_id, license_plate, fleet_fields, status)
         VALUES ($1,$2,$3,$4,$5::jsonb,'active')
         ON CONFLICT (tenant_id, company_id, license_plate) DO UPDATE SET
           fleet_fields = EXCLUDED.fleet_fields,
           updated_at = NOW()`,
        [id, TENANT, COMPANY, v.license_plate, JSON.stringify(v.fleet_fields)],
      );
      fleetN += 1;
    }
    console.log(`✓ Phương tiện: ${fleetN} xe từ ${excelPath}`);

    const allEmployees = [...employeeIds.entries()];
    for (const month of PAYROLL_MONTHS) {
      const periodId = stableUuid(`${COMPANY}:payroll:${month.start}`);
      const processedAt = month.status !== 'draft' ? 'NOW()' : 'NULL';
      const closedAt = month.status === 'closed' ? 'NOW()' : 'NULL';
      await client.query(
        `INSERT INTO public.payroll_periods (id, company_id, period_label, start_date, end_date, status, created_by, processed_at, closed_at)
         VALUES ($1,$2,$3,$4::date,$5::date,$6,'seed-tourism',${processedAt},${closedAt})
         ON CONFLICT (id) DO UPDATE SET
           period_label = EXCLUDED.period_label,
           start_date = EXCLUDED.start_date,
           end_date = EXCLUDED.end_date,
           status = EXCLUDED.status,
           processed_at = EXCLUDED.processed_at,
           closed_at = EXCLUDED.closed_at,
           updated_at = NOW()`,
        [periodId, COMPANY, month.label, month.start, month.end, month.status],
      );

      for (const [code, empId] of allEmployees) {
        const staff = TOURISM_STAFF.find((x) => x.code === code);
        const base = staff?.base ?? 15000000;
        const allowance = 500000 + Math.floor(Math.random() * 800000);
        const gross = base + allowance;
        const deduction = Math.round(gross * 0.105);
        const net = gross - deduction;
        const slipId = stableUuid(`${periodId}:${empId}`);
        await client.query(
          `INSERT INTO public.payroll_payslips (
            id, company_id, period_id, employee_id, employee_code, employee_name,
            gross_amount, deduction_amount, net_amount, status
          ) VALUES ($1,$2,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10)
          ON CONFLICT (period_id, employee_id) DO UPDATE SET
            gross_amount = EXCLUDED.gross_amount,
            deduction_amount = EXCLUDED.deduction_amount,
            net_amount = EXCLUDED.net_amount,
            status = EXCLUDED.status,
            updated_at = NOW()`,
          [
            slipId,
            COMPANY,
            periodId,
            empId,
            code,
            staff?.name ?? code,
            gross,
            deduction,
            net,
            month.status === 'draft' ? 'draft' : 'processed',
          ],
        );
      }
    }
    console.log(`✓ Bảng lương: ${PAYROLL_MONTHS.length} kỳ (01–05/2026), ${allEmployees.length} NV/kỳ`);

    const summary = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM public.employees WHERE company_id = $1) AS employees,
         (SELECT COUNT(*)::int FROM public.hrm_fleet_vehicles WHERE tenant_id = $2) AS fleet,
         (SELECT COUNT(*)::int FROM public.payroll_payslips WHERE company_id = $1) AS payslips`,
      [COMPANY, TENANT],
    );
    console.log('Tổng trong DB:', summary.rows[0]);
    console.log('\nĐăng nhập Portal: ceo@xe-du-lich.vn / Xevn@2026 → tenant xe-du-lich');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
