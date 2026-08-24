#!/usr/bin/env node
/**
 * Trích xuất dữ liệu bảng lương Excel → báo cáo seed (KHÔNG insert DB).
 * Usage: node scripts/extract-payroll-excel-report.mjs [path-to-xlsx]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import pg from 'pg';
import { loadDeployEnv } from './seed-env-loader.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const DEFAULT_XLSX =
  'C:\\Users\\Admin\\Downloads\\Telegram Desktop\\2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx';
const OUT_DIR = resolve(repoRoot, 'scripts/seed-reports/payroll-vp-hanoi-2026-05');
const TENANT_ID = 'xevn';
const COMPANY_ID = 'holding';
const PERIOD_LABEL = '2026-05';
const PERIOD_START = '2026-05-01';
const PERIOD_END = '2026-05-31';

function excelSerialToIso(serial) {
  if (serial === '' || serial == null) return null;
  const n = Number(serial);
  if (!Number.isFinite(n) || n < 1) return null;
  const utc = new Date(Date.UTC(1899, 11, 30) + n * 86400000);
  return utc.toISOString().slice(0, 10);
}

function cleanStr(v) {
  if (v == null) return '';
  return String(v).replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isEmployeeCode(v) {
  return /^XE\d+$/i.test(cleanStr(v));
}

function sheetRows(wb, name) {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

function isDepartmentHeader(name) {
  if (!name || name.length < 3) return false;
  if (name.match(/^(TỔNG|Tổng|STT|Họ và Tên)/i)) return false;
  return /^(PHÒNG|Phòng|Ban |Tổ |Tổng hợp)/i.test(name) || name === name.toUpperCase() && name.includes('PHÒNG');
}

function parsePayrollSheet(rows) {
  const employees = [];
  let department = null;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = cleanStr(row[1]);
    const name = cleanStr(row[2]);
    if (!isEmployeeCode(code)) {
      if (isDepartmentHeader(name)) department = name;
      continue;
    }
    if (i < 6) continue; // skip header rows
    employees.push({
      row_number: i + 1,
      department,
      employee_code: code.toUpperCase(),
      full_name: name,
      job_title: cleanStr(row[3]),
      hired_at: excelSerialToIso(row[4]),
      probation_end_at: excelSerialToIso(row[5]),
      resigned_at: excelSerialToIso(row[6]) || null,
      contract_type: cleanStr(row[7]) || null,
      income: {
        total_monthly_salary: num(row[8]),
        insurance_base_p1: num(row[9]),
        supplemental_income_p2: num(row[10]),
        base_salary_p1_p2: num(row[11]),
        kpi_salary_p3: num(row[12]),
        performance_bonus_p4: num(row[13]),
        paying_insurance: row[14] === '' ? null : row[14],
      },
      probation_rate: num(row[15]),
      probation_salary: num(row[16]),
      standard_days: num(row[17]),
      standard_hours: num(row[18]),
      probation_work_days: num(row[19]),
      official_work_days: num(row[20]),
      hours_probation_100: num(row[21]),
      hours_official_100: num(row[22]),
      online_hours: num(row[23]),
      ot_150_hours_tv: num(row[24]),
      ot_150_hours_ct: num(row[25]),
      ot_200_hours_tv: num(row[26]),
      ot_200_hours_ct: num(row[27]),
      other_paid_days_lcb: num(row[30]),
      leave_days_lcb_tv: num(row[31]),
      leave_days_lcb_ct: num(row[32]),
      kpi_rate_percent: num(row[33]),
      salary_by_attendance: num(row[34]),
      kpi_pay: num(row[35]),
      p4_bonus: num(row[36]),
      ot_pay_total: num(row[37]),
      ot_150_pay: num(row[38]),
      ot_200_pay: num(row[39]),
      leave_day_pay: num(row[40]),
      revenue_salary: num(row[41]),
      online_pay_weekday: num(row[42]),
      online_pay_saturday: num(row[43]),
      holiday_pay: num(row[44]),
      other_salary: num(row[45]),
      fuel_allowance: num(row[46]),
      gross_income: num(row[47]),
      deductions: {
        social_insurance: num(row[48]),
        union_fee: num(row[49]),
        discipline: num(row[50]),
        accounting_deduction: num(row[51]),
        salary_advance_1: num(row[52]),
        other_advance: num(row[53]),
        pit: num(row[54]),
        total_deduction: num(row[55]),
      },
      recovery: num(row[56]),
      retro_pay: num(row[57]),
      net_pay: num(row[58]),
      email: cleanStr(row[61]) || null,
      notes: cleanStr(row[62]) || null,
      legal_entity: cleanStr(row[63]) || null,
      company_note: cleanStr(row[64]) || null,
    });
  }
  return employees;
}

function parseAttendanceSheet(rows) {
  const lines = [];
  let department = null;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = cleanStr(row[1]);
    if (!isEmployeeCode(code)) {
      const name = cleanStr(row[2]);
      if (isDepartmentHeader(name)) department = name;
      continue;
    }
    if (i < 6) continue;
    const daily = row.slice(7, 38).map((v) => cleanStr(v));
    lines.push({
      row_number: i + 1,
      department,
      employee_code: code.toUpperCase(),
      full_name: cleanStr(row[2]),
      job_title: cleanStr(row[3]),
      hired_at: excelSerialToIso(row[4]),
      probation_end_at: excelSerialToIso(row[5]),
      resigned_at: excelSerialToIso(row[6]) || null,
      contract_status: cleanStr(row[7]) || null,
      daily_marks: daily,
      probation_days: num(row[38]),
      official_days: num(row[39]),
      probation_hours: num(row[40]),
      official_hours: num(row[41]),
      standard_days: num(row[42]),
      standard_hours: num(row[43]),
      ot_150_hours_tv: num(row[46]),
      ot_150_hours_ct: num(row[47]),
      ot_200_hours_tv: num(row[48]),
      ot_200_hours_ct: num(row[49]),
      online_days_weekday: num(row[51]),
      online_days_saturday: num(row[52]),
      holiday_lcb_days: num(row[55]),
      total_work_days: num(row[57]),
      entitled_leave_days: num(row[58]),
      used_leave_days: num(row[59]),
      actual_work_days: num(row[60]),
    });
  }
  return lines;
}

function parseSimpleList(rows, codeIdx = 0, nameIdx = 1, amountIdx = 2) {
  const out = [];
  for (const row of rows) {
    const code = cleanStr(row[codeIdx]);
    if (!isEmployeeCode(code)) continue;
    out.push({
      employee_code: code.toUpperCase(),
      full_name: cleanStr(row[nameIdx]),
      amount: num(row[amountIdx]),
      raw: row,
    });
  }
  return out;
}

function parseRetroSheet(rows) {
  const out = [];
  for (const row of rows) {
    const code = cleanStr(row[1]);
    if (!isEmployeeCode(code)) continue;
    out.push({
      employee_code: code.toUpperCase(),
      full_name: cleanStr(row[2]),
      description: cleanStr(row[3]),
      retro_pay_amount: num(row[4]),
      recovery_amount: num(row[5]),
      notes: cleanStr(row[6]) || null,
    });
  }
  return out;
}

function parseEmailSheet(rows) {
  const out = [];
  for (const row of rows) {
    const code = cleanStr(row[0]);
    if (!isEmployeeCode(code)) continue;
    const email = cleanStr(row[2]);
    out.push({
      employee_code: code.toUpperCase(),
      full_name: cleanStr(row[1]),
      email: email && email.includes('@') ? email : null,
    });
  }
  return out;
}

function inferSalaryComponents(payrollRows) {
  const components = [
    { code: 'LUONG_CO_BAN', name_vi: 'Lương cơ bản (P1+P2)', nature: 'income', source_field: 'income.base_salary_p1_p2' },
    { code: 'LUONG_KPI', name_vi: 'Lương KPI (P3)', nature: 'income', source_field: 'income.kpi_salary_p3' },
    { code: 'THUONG_P4', name_vi: 'Thưởng hiệu quả năng lực (P4)', nature: 'income', source_field: 'income.performance_bonus_p4' },
    { code: 'LUONG_THEO_CONG', name_vi: 'Lương theo ngày/giờ công', nature: 'income', source_field: 'salary_by_attendance' },
    { code: 'LUONG_OT', name_vi: 'Lương OT', nature: 'income', source_field: 'ot_pay_total' },
    { code: 'LUONG_OT_150', name_vi: 'Lương OT 150%', nature: 'income', source_field: 'ot_150_pay' },
    { code: 'LUONG_OT_200', name_vi: 'Lương OT 200%', nature: 'income', source_field: 'ot_200_pay' },
    { code: 'LUONG_NGHI_PHEP', name_vi: 'Lương ngày phép', nature: 'income', source_field: 'leave_day_pay' },
    { code: 'LUONG_DOANH_SO', name_vi: 'Lương doanh số', nature: 'income', source_field: 'revenue_salary' },
    { code: 'LUONG_ONLINE', name_vi: 'Lương online', nature: 'income', source_field: 'online_pay_weekday' },
    { code: 'LUONG_NGHI_LE', name_vi: 'Lương nghỉ lễ', nature: 'income', source_field: 'holiday_pay' },
    { code: 'LUONG_KHAC', name_vi: 'Lương khác', nature: 'income', source_field: 'other_salary' },
    { code: 'PC_XANG_XE', name_vi: 'Phụ cấp xăng xe', nature: 'income', source_field: 'fuel_allowance' },
    { code: 'KHAU_TRU_BHXH', name_vi: 'BHXH', nature: 'deduction', source_field: 'deductions.social_insurance' },
    { code: 'KHAU_TRU_CONG_DOAN', name_vi: 'Công đoàn', nature: 'deduction', source_field: 'deductions.union_fee' },
    { code: 'KHAU_TRU_VPKL', name_vi: 'Vi phạm kỷ luật', nature: 'deduction', source_field: 'deductions.discipline' },
    { code: 'KHAU_TRU_KE_TOAN', name_vi: 'Bảng trừ kế toán', nature: 'deduction', source_field: 'deductions.accounting_deduction' },
    { code: 'UNG_LUONG_LAN_1', name_vi: 'Ứng lương lần 1', nature: 'deduction', source_field: 'deductions.salary_advance_1' },
    { code: 'TAM_UNG_KHAC', name_vi: 'Tạm ứng khác', nature: 'deduction', source_field: 'deductions.other_advance' },
    { code: 'THUE_TNCN', name_vi: 'Thuế TNCN', nature: 'deduction', source_field: 'deductions.pit' },
    { code: 'TRUY_THU', name_vi: 'Truy thu', nature: 'deduction', source_field: 'recovery' },
    { code: 'TRUY_LINH', name_vi: 'Truy lĩnh', nature: 'income', source_field: 'retro_pay' },
  ];
  const usage = {};
  for (const c of components) {
    const path = c.source_field.split('.');
    let count = 0;
    for (const e of payrollRows) {
      let v = e;
      for (const p of path) v = v?.[p];
      if (v != null && v !== 0) count++;
    }
    usage[c.code] = count;
  }
  return components.map((c) => ({ ...c, employee_count_with_value: usage[c.code] ?? 0 }));
}

function buildFormulaDraft() {
  return {
    company_id: COMPANY_ID,
    code: 'FORMULA_VP_HANOI_2026',
    version: 1,
    status: 'draft',
    description: 'Công thức VP Hà Nội suy ra từ Excel tháng 5/2026 — cần duyệt trước khi publish',
    expression_json: {
      form: 'gd1_eval_v1',
      lines: [
        { component_code: 'LUONG_THEO_CONG', sign: 'earning', source: 'expr', expr: 'base_salary * (payable_hours / standard_hours)' },
        { component_code: 'LUONG_KPI', sign: 'earning', source: 'expr', expr: 'kpi_salary * kpi_rate_percent' },
        { component_code: 'THUONG_P4', sign: 'earning', source: 'var', var: 'performance_bonus_p4' },
        { component_code: 'LUONG_OT_150', sign: 'earning', source: 'expr', expr: 'ot_150_hours * hourly_rate * 1.5' },
        { component_code: 'LUONG_OT_200', sign: 'earning', source: 'expr', expr: 'ot_200_hours * hourly_rate * 2.0' },
        { component_code: 'LUONG_NGHI_PHEP', sign: 'earning', source: 'var', var: 'leave_day_pay' },
        { component_code: 'LUONG_ONLINE', sign: 'earning', source: 'var', var: 'online_pay' },
        { component_code: 'LUONG_NGHI_LE', sign: 'earning', source: 'var', var: 'holiday_pay' },
        { component_code: 'LUONG_KHAC', sign: 'earning', source: 'var', var: 'other_salary' },
        { component_code: 'PC_XANG_XE', sign: 'earning', source: 'var', var: 'fuel_allowance' },
        { component_code: 'KHAU_TRU_BHXH', sign: 'deduction', source: 'var', var: 'social_insurance' },
        { component_code: 'KHAU_TRU_CONG_DOAN', sign: 'deduction', source: 'var', var: 'union_fee' },
        { component_code: 'KHAU_TRU_VPKL', sign: 'deduction', source: 'var', var: 'discipline' },
        { component_code: 'UNG_LUONG_LAN_1', sign: 'deduction', source: 'var', var: 'salary_advance_1' },
        { component_code: 'THUE_TNCN', sign: 'deduction', source: 'var', var: 'pit' },
      ],
    },
    required_vars_json: [
      'base_salary', 'payable_hours', 'standard_hours', 'kpi_salary', 'kpi_rate_percent',
      'performance_bonus_p4', 'ot_150_hours', 'ot_200_hours', 'hourly_rate',
      'leave_day_pay', 'online_pay', 'holiday_pay', 'other_salary', 'fuel_allowance',
      'social_insurance', 'union_fee', 'discipline', 'salary_advance_1', 'pit',
    ],
    payroll_group: {
      code: 'PG_VP_HANOI',
      name_vi: 'Văn phòng Hà Nội',
      match_rule_json: { department_contains: ['Ban giám đốc', 'Tổ Trợ lý', 'Phòng CNTT', 'Phòng TCKT', 'Phòng HCNS', 'Phòng dự án'] },
    },
  };
}

async function queryDb(excelCodes) {
  loadDeployEnv();
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 6432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_HRM ?? 'xevn_hrm',
    ssl: false,
  });
  await client.connect();
  try {
    const empRes = await client.query(
      `SELECT id, company_id, employee_code, email, full_name, job_title_key, status, hired_at,
              custom_fields->>'tenant_id' AS tenant_id,
              custom_fields->>'department' AS department
       FROM public.employees
       WHERE UPPER(employee_code) = ANY($1::text[])`,
      [excelCodes],
    );
    const tenantRes = await client.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE custom_fields->>'tenant_id' = $1 OR custom_fields->>'tenant_id' IS NULL)::int AS xevn_like,
              COUNT(*) FILTER (WHERE employee_code ILIKE 'XE%')::int AS xe_codes
       FROM public.employees`,
      [TENANT_ID],
    );
    const componentsRes = await client.query(
      `SELECT code, name, component_type, nature FROM public.salary_components WHERE company_id = $1 ORDER BY code`,
      [COMPANY_ID],
    ).catch(() => ({ rows: [] }));
    const formulasRes = await client.query(
      `SELECT code, version, status FROM public.pay_formula_definitions WHERE company_id = $1 ORDER BY code, version`,
      [COMPANY_ID],
    ).catch(() => ({ rows: [] }));
    const periodsRes = await client.query(
      `SELECT id, period_label, start_date, end_date, status FROM public.payroll_periods
       WHERE company_id = $1 AND period_label LIKE '2026-05%'`,
      [COMPANY_ID],
    ).catch(() => ({ rows: [] }));
    return {
      employees: empRes.rows,
      tenant_stats: tenantRes.rows[0],
      salary_components: componentsRes.rows,
      formulas: formulasRes.rows,
      payroll_periods_may2026: periodsRes.rows,
    };
  } finally {
    await client.end();
  }
}

function writeJson(name, data) {
  writeFileSync(resolve(OUT_DIR, name), JSON.stringify(data, null, 2), 'utf8');
}

function buildReadme(summary) {
  return `# Báo cáo seed — Bảng lương VP Hà Nội tháng 5/2026

> **Trạng thái:** CHỜ DUYỆT — chưa insert vào DB  
> **Nguồn:** \`2026.06.21 bảng lương văn phòng Hà Nội.done.xlsx\`  
> **Tenant mục tiêu:** \`${TENANT_ID}\` | **Company:** \`${COMPANY_ID}\`  
> **Kỳ lương:** ${PERIOD_LABEL} (${PERIOD_START} → ${PERIOD_END})

## Tổng quan thu thập

| Loại dữ liệu | Số bản ghi | File |
|---|---:|---|
| Nhân viên (bảng lương) | ${summary.payroll_count} | \`01-employees-payroll.json\` |
| Dòng chấm công | ${summary.attendance_count} | \`03-attendance-lines.json\` |
| Ứng lương lần 1 | ${summary.advance_count} | \`07-advances.json\` |
| Truy thu / truy lĩnh | ${summary.retro_count} | \`08-retro-recovery.json\` |
| Email bổ sung | ${summary.email_count} | \`09-emails.json\` |
| Thành phần lương (đề xuất) | ${summary.component_count} | \`05-salary-components-proposed.json\` |

## Đối chiếu DB (tenant ${TENANT_ID})

- Tổng NV trong DB: **${summary.db_total_employees}** (mã dạng \`NV0001\`, **không có mã XE**)
- NV có \`tenant_id=xevn\` trong DB: **${summary.db_tenant_xevn}**
- Mã Excel (XE*) khớp DB: **${summary.db_matched}** / ${summary.payroll_count}
- Mã Excel **không có** trong DB: **${summary.db_missing}** → cần tạo mới hoặc map mã
- Mã DB trùng nhưng **tên khác** Excel: **${summary.name_mismatch}**

> **Lưu ý:** DB dev hiện chứa workforce placeholder (UAT), chưa có danh mục nhân viên XE thực tế.

## Kỳ lương & công thức hiện có trong DB

- Kỳ \`2026-05\` đã tồn tại: **${summary.period_exists ? 'Có' : 'Không'}** (${summary.period_count} bản ghi)
- Công thức \`holding\` trong DB: ${summary.formula_codes.join(', ') || '(chưa có / bảng chưa bootstrap)'}
- Thành phần lương \`holding\` trong DB: ${summary.db_component_count} mã

## Các file báo cáo

1. \`01-employees-payroll.json\` — master + thu nhập/khấu trừ từng NV
2. \`02-payroll-period-proposed.json\` — metadata kỳ lương đề xuất
3. \`03-attendance-lines.json\` — bảng công (giờ/ngày, OT, phép, lễ)
4. \`04-payslip-lines-proposed.json\` — payslip lines map sang \`payroll_payslip_lines\`
5. \`05-salary-components-proposed.json\` — mã thành phần lương + số NV có giá trị
6. \`06-pay-formula-draft.json\` — công thức VP Hà Nội (draft, chưa publish)
7. \`07-advances.json\` — ứng lương lần 1
8. \`08-retro-recovery.json\` — truy thu/truy lĩnh
9. \`09-emails.json\` — email từ tab Email
10. \`10-db-crosswalk.json\` — đối chiếu mã NV Excel ↔ DB
11. \`11-gaps-and-decisions.md\` — điểm cần quyết định trước khi seed

## Quy trình sau khi duyệt

1. Xác nhận mapping \`company_id\` / pháp nhân (Visun vs X.E Việt Nam vs Du lịch)
2. Bổ sung NV thiếu vào \`employees\` (hoặc bỏ qua)
3. Publish công thức + thành phần lương
4. Tạo \`payroll_periods\` + bind \`attendance_sheets\`
5. Import \`pay_period_input_lines\` (ứng lương, VPKL, truy thu/lĩnh)
6. Chạy tính lương / hoặc import payslip lines đã chốt

---
*Tạo tự động bởi \`scripts/extract-payroll-excel-report.mjs\` — ${new Date().toISOString()}*
`;
}

function buildGapsMd(summary, missingCodes, nameMismatches) {
  return `# Điểm cần quyết định trước khi seed

## 1. Pháp nhân / company_id

Excel có nhiều công ty trong cột "Công ty":
- Công ty TNHH X.E Việt Nam
- Công ty TNHH Du lịch X.E Việt Nam
- Công ty TNHH Du lịch Visun

Hệ thống hiện dùng \`company_id = holding\` cho tenant xevn. Cần quyết định:
- Gom tất cả vào \`holding\`, hay
- Map theo pháp nhân → company slug riêng

## 2. Nhân viên thiếu trong DB (${missingCodes.length} mã)

${missingCodes.length ? missingCodes.map((c) => `- \`${c}\``).join('\n') : '_Không có_'}

## 3. Lệch tên Excel vs DB (${nameMismatches.length})

${nameMismatches.length ? nameMismatches.map((m) => `- \`${m.code}\`: Excel="${m.excel_name}" | DB="${m.db_name}"`).join('\n') : '_Không có_'}

## 4. Công thức tính lương

- Excel dùng cấu trúc P1/P2/P3/P4 + giờ công + KPI% + OT 150%/200%
- DB seed hiện có \`FORMULA_VP\` (HyperFormula) — cần mở rộng hoặc tạo \`FORMULA_VP_HANOI_2026\`
- Tab **Note tính lương** / **Quy định** chứa rule nghiệp vụ chi tiết — nên review thủ công

## 5. Bảng công

- Ngày công chuẩn tháng 5/2026: **26 ngày / 208 giờ** (theo Excel)
- Cần tạo \`attendance_sheets\` + \`att_timesheet_line\` trước khi bind kỳ lương

## 6. Dữ liệu nhạy cảm

- File Excel chứa lương thực tế — các file JSON trong thư mục này **không nên commit** lên git công khai
- Đề xuất thêm \`scripts/seed-reports/\` vào \`.gitignore\`

## 7. Trạng thái kỳ lương DB

- Kỳ 2026-05 đã có: **${summary.period_exists ? 'Có — cần merge hay tạo mới?' : 'Không — có thể tạo mới'}**
`;
}

function buildPayslipLines(payrollRows) {
  return payrollRows.map((e) => {
    const lines = [];
    const push = (code, amount, sign) => {
      if (amount == null || amount === 0) return;
      lines.push({ component_code: code, amount, sign });
    };
    push('LUONG_THEO_CONG', e.salary_by_attendance, 'earning');
    push('LUONG_KPI', e.kpi_pay ?? e.income.kpi_salary_p3, 'earning');
    push('THUONG_P4', e.p4_bonus ?? e.income.performance_bonus_p4, 'earning');
    push('LUONG_OT_150', e.ot_150_pay, 'earning');
    push('LUONG_OT_200', e.ot_200_pay, 'earning');
    push('LUONG_NGHI_PHEP', e.leave_day_pay, 'earning');
    push('LUONG_DOANH_SO', e.revenue_salary, 'earning');
    push('LUONG_ONLINE', (e.online_pay_weekday ?? 0) + (e.online_pay_saturday ?? 0), 'earning');
    push('LUONG_NGHI_LE', e.holiday_pay, 'earning');
    push('LUONG_KHAC', e.other_salary, 'earning');
    push('PC_XANG_XE', e.fuel_allowance, 'earning');
    push('TRUY_LINH', e.retro_pay, 'earning');
    push('KHAU_TRU_BHXH', e.deductions.social_insurance, 'deduction');
    push('KHAU_TRU_CONG_DOAN', e.deductions.union_fee, 'deduction');
    push('KHAU_TRU_VPKL', e.deductions.discipline, 'deduction');
    push('KHAU_TRU_KE_TOAN', e.deductions.accounting_deduction, 'deduction');
    push('UNG_LUONG_LAN_1', e.deductions.salary_advance_1, 'deduction');
    push('TAM_UNG_KHAC', e.deductions.other_advance, 'deduction');
    push('THUE_TNCN', e.deductions.pit, 'deduction');
    push('TRUY_THU', e.recovery, 'deduction');
    return {
      employee_code: e.employee_code,
      full_name: e.full_name,
      gross_income: e.gross_income,
      total_deduction: e.deductions.total_deduction,
      net_pay: e.net_pay,
      lines,
    };
  });
}

async function main() {
  const xlsxPath = process.argv[2] || DEFAULT_XLSX;
  const wb = XLSX.readFile(xlsxPath);
  mkdirSync(OUT_DIR, { recursive: true });

  const payrollRows = parsePayrollSheet(sheetRows(wb, 'Bảng lương'));
  const attendanceRows = parseAttendanceSheet(sheetRows(wb, 'Bảng công'));
  const advances = parseSimpleList(sheetRows(wb, 'Ứng lương lần 1'));
  const retro = parseRetroSheet(sheetRows(wb, 'Truy thu - Truy lĩnh'));
  const emails = parseEmailSheet(sheetRows(wb, 'Email'));
  const components = inferSalaryComponents(payrollRows);
  const formulaDraft = buildFormulaDraft();

  // Bổ sung tên thật từ tab Bảng công / Email khi tab lương mask "X"
  const nameByCode = new Map();
  for (const a of attendanceRows) {
    if (a.full_name && a.full_name !== 'X') nameByCode.set(a.employee_code, a.full_name);
  }
  for (const e of emails) {
    if (e.full_name && e.full_name !== 'X') nameByCode.set(e.employee_code, e.full_name);
  }
  for (const p of payrollRows) {
    const alt = nameByCode.get(p.employee_code);
    if (alt && (!p.full_name || p.full_name === 'X' || p.full_name.length <= 2)) {
      p.full_name = alt;
      p.name_source = 'attendance_or_email_tab';
    }
    if (p.job_title === 'X1' || p.job_title === 'Y1' || p.job_title === 'V1') {
      const att = attendanceRows.find((a) => a.employee_code === p.employee_code);
      if (att?.job_title && att.job_title !== p.job_title) p.job_title = att.job_title;
    }
  }

  const payslipLines = buildPayslipLines(payrollRows);

  const excelCodes = [...new Set(payrollRows.map((e) => e.employee_code))];
  const db = await queryDb(excelCodes);
  const dbByCode = new Map(db.employees.map((e) => [e.employee_code?.toUpperCase(), e]));

  const crosswalk = payrollRows.map((e) => {
    const dbRow = dbByCode.get(e.employee_code);
    return {
      employee_code: e.employee_code,
      excel_name: e.full_name,
      db_id: dbRow?.id ?? null,
      db_name: dbRow?.full_name ?? null,
      db_company_id: dbRow?.company_id ?? null,
      db_tenant_id: dbRow?.tenant_id ?? null,
      db_status: dbRow?.status ?? null,
      match: dbRow ? 'found' : 'missing',
      name_match: dbRow ? cleanStr(dbRow.full_name).toLowerCase() === cleanStr(e.full_name).toLowerCase() : false,
    };
  });

  const missingCodes = crosswalk.filter((c) => c.match === 'missing').map((c) => c.employee_code);
  const nameMismatches = crosswalk
    .filter((c) => c.match === 'found' && !c.name_match)
    .map((c) => ({ code: c.employee_code, excel_name: c.excel_name, db_name: c.db_name }));

  const summary = {
    payroll_count: payrollRows.length,
    attendance_count: attendanceRows.length,
    advance_count: advances.length,
    retro_count: retro.length,
    email_count: emails.length,
    component_count: components.length,
    db_total_employees: db.tenant_stats?.total ?? 0,
    db_tenant_xevn: db.tenant_stats?.xevn_like ?? 0,
    db_xe_codes: db.tenant_stats?.xe_codes ?? 0,
    db_matched: crosswalk.filter((c) => c.match === 'found').length,
    db_missing: missingCodes.length,
    name_mismatch: nameMismatches.length,
    period_exists: (db.payroll_periods_may2026?.length ?? 0) > 0,
    period_count: db.payroll_periods_may2026?.length ?? 0,
    formula_codes: [...new Set((db.formulas ?? []).map((f) => f.code))],
    db_component_count: db.salary_components?.length ?? 0,
  };

  writeJson('01-employees-payroll.json', payrollRows);
  writeJson('02-payroll-period-proposed.json', {
    tenant_id: TENANT_ID,
    company_id: COMPANY_ID,
    period_label: PERIOD_LABEL,
    start_date: PERIOD_START,
    end_date: PERIOD_END,
    status: 'draft',
    title: 'BẢNG LƯƠNG VĂN PHÒNG HÀ NỘI - THÁNG 5.2026',
    standard_days: 26,
    standard_hours: 208,
    source_file: xlsxPath,
    employee_count: payrollRows.length,
    total_gross: payrollRows.reduce((s, e) => s + (e.gross_income ?? 0), 0),
    total_net: payrollRows.reduce((s, e) => s + (e.net_pay ?? 0), 0),
  });
  writeJson('03-attendance-lines.json', attendanceRows);
  writeJson('04-payslip-lines-proposed.json', payslipLines);
  writeJson('05-salary-components-proposed.json', components);
  writeJson('06-pay-formula-draft.json', formulaDraft);
  writeJson('07-advances.json', advances);
  writeJson('08-retro-recovery.json', retro);
  writeJson('09-emails.json', emails);
  writeJson('10-db-crosswalk.json', { summary, crosswalk, db_snapshot: {
    salary_components: db.salary_components,
    formulas: db.formulas,
    payroll_periods_may2026: db.payroll_periods_may2026,
  }});
  writeFileSync(resolve(OUT_DIR, '00-README.md'), buildReadme(summary), 'utf8');
  writeFileSync(resolve(OUT_DIR, '11-gaps-and-decisions.md'), buildGapsMd(summary, missingCodes, nameMismatches), 'utf8');

  console.log(JSON.stringify({ ok: true, outDir: OUT_DIR, summary }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
