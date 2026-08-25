/**
 * Import X.E legacy Settings catalogs from Telegram Excel packs.
 * Sources:
 *   Cham_Cong_Nghi_Phep_XE.xlsx
 *   Luong_Thu_Nhap_XE.xlsx
 *
 * Usage:
 *   node scripts/import-xe-settings-from-excel.mjs
 */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const BASE = process.env.HRM_API_BASE || 'http://127.0.0.1:28001';
const COMPANY_ID = process.env.HRM_COMPANY_ID || 'main';
const HEADERS = {
  'x-internal-api-key':
    process.env.INTERNAL_API_KEY || 'xevn-dev-internal-key',
  'x-tenant-id': process.env.HRM_TENANT_ID || 'xevn',
  'x-company-id': COMPANY_ID,
  'Content-Type': 'application/json',
  'x-catalog-write-mode': 'immediate',
};

const ATT_XLSX =
  process.env.ATT_XLSX ||
  path.join(
    process.env.USERPROFILE || '',
    'Downloads',
    'Telegram Desktop',
    'Cham_Cong_Nghi_Phep_XE.xlsx',
  );
const PAY_XLSX =
  process.env.PAY_XLSX ||
  path.join(
    process.env.USERPROFILE || '',
    'Downloads',
    'Telegram Desktop',
    'Luong_Thu_Nhap_XE.xlsx',
  );

function sheetRows(file, sheetName) {
  const wb = XLSX.readFile(file);
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: null,
  });
  // Find header row containing 'code' or 'Tham số'
  let headerIdx = raw.findIndex(
    (r) =>
      Array.isArray(r) &&
      r.some(
        (c) =>
          String(c ?? '')
            .trim()
            .toLowerCase() === 'code' ||
          String(c ?? '').trim() === 'Tham số',
      ),
  );
  if (headerIdx < 0) return [];
  const headers = raw[headerIdx].map((h) => String(h ?? '').trim());
  const out = [];
  for (let i = headerIdx + 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.every((c) => c == null || String(c).trim() === '')) continue;
    // Skip section banners / duplicate headers
    const first = String(row[0] ?? '').trim();
    if (
      first === 'STT' ||
      first.startsWith('A.') ||
      first.startsWith('B.') ||
      first.includes('CHI TRẢ') ||
      first.includes('LOẠI TĂNG')
    ) {
      // If this looks like a new header row for section B, rebind headers
      if (row.some((c) => String(c ?? '').toLowerCase() === 'code')) {
        for (let j = 0; j < row.length; j++) {
          headers[j] = String(row[j] ?? '').trim();
        }
      }
      continue;
    }
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = row[idx];
    });
    out.push(obj);
  }
  return out;
}

function toKey(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function yes(v) {
  const s = String(v ?? '')
    .trim()
    .toLowerCase();
  return s === 'có' || s === 'co' || s === 'yes' || s === 'true' || s === '1';
}

function parseMoney(v) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/[^\d.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parsePct(v) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace('%', '').replace(',', '.').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseRateX(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (s.startsWith('+')) {
    const pct = Number(s.replace(/[^\d.]/g, ''));
    return Number.isFinite(pct) ? 1 + pct / 100 : 1;
  }
  const n = Number(s.replace(/x/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 1;
}

async function api(method, pathName, body) {
  const res = await fetch(`${BASE}${pathName}`, {
    method,
    headers: HEADERS,
    body: body == null ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function summarize(label, ok, fail, detail) {
  console.log(
    `${ok ? '✓' : '✗'} ${label}: ok=${ok} fail=${fail}${detail ? ` — ${detail}` : ''}`,
  );
}

async function ensurePayTypes() {
  const items = [
    { code: 'luong', label: 'Lương', status: 'active' },
    { code: 'phu_cap', label: 'Phụ cấp', status: 'active' },
    { code: 'thuong', label: 'Thưởng', status: 'active' },
    { code: 'hoa_hong', label: 'Hoa hồng', status: 'active' },
    { code: 'khau_tru', label: 'Khấu trừ', status: 'active' },
    { code: 'luong_bien_doi', label: 'Lương biến đổi', status: 'active' },
    { code: 'thue', label: 'Thuế', status: 'active' },
    { code: 'cham_cong', label: 'Chấm công', status: 'active' },
  ];
  const r = await api('POST', '/api/hrm/settings-catalogs/pay_types/extension-items', {
    bulkSync: true,
    items,
  });
  console.log(
    'pay_types extension',
    r.status,
    r.json.code,
    r.json.data ?? r.json.message,
  );
}

async function importAttendanceCodes(file) {
  const rows = sheetRows(file, 'Mã_Chấm_Công').filter((r) => r.code);
  let ok = 0;
  let fail = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const excelCode = String(row.code).trim();
    const code = toKey(excelCode === 'P/2' ? 'p_half' : excelCode);
    const affect = String(row.affects_salary ?? '').toLowerCase();
    let countsAs = 'other';
    let dayWeight = 1;
    let isPaid = true;
    let isPresent = false;
    if (excelCode === 'P') {
      countsAs = 'work';
      isPresent = true;
    } else if (excelCode === 'P/2') {
      countsAs = 'work';
      dayWeight = 0.5;
      isPresent = true;
    } else if (['AN', 'NB', 'DT'].includes(excelCode)) {
      countsAs = 'paid_leave';
    } else if (['OM', 'TS', 'TT'].includes(excelCode)) {
      countsAs = 'paid_leave';
    } else if (excelCode === 'KL') {
      countsAs = 'unpaid_leave';
      isPaid = false;
    } else if (excelCode === 'L') {
      countsAs = 'holiday';
    } else if (excelCode === 'X') {
      countsAs = 'absent';
      isPaid = false;
      dayWeight = 1; // API requires (0,1]; unpaid absent still weight=1 day unit
    } else if (affect.includes('0.5')) {
      dayWeight = 0.5;
      countsAs = 'work';
      isPresent = true;
    } else if (affect.includes('không')) {
      isPaid = false;
    }

    const body = {
      companyId: COMPANY_ID,
      code,
      nameVi: String(row.name_vi ?? code),
      symbol: excelCode.slice(0, 16),
      sortOrder: i + 1,
      countsAs,
      dayWeight,
      isPaid,
      isPresent,
      status: 'active',
      legacyAliasKeys: excelCode.toLowerCase() !== code ? [toKey(excelCode)] : undefined,
      metadata: {
        source: 'Cham_Cong_Nghi_Phep_XE.xlsx',
        excel_code: excelCode,
        affects_salary: row.affects_salary ?? null,
        note: row.ghi_chu ?? null,
      },
    };
    const r = await api('PUT', '/api/hrm/attendance/attendance-codes', body);
    if (r.status >= 200 && r.status < 300) ok++;
    else {
      fail++;
      errors.push(`${excelCode}->${code}: ${r.status} ${r.json.code} ${r.json.message}`);
    }
  }
  summarize('Mã chấm công', ok, fail, errors.slice(0, 3).join(' | '));
  return { ok, fail };
}

async function importOtAndComp(file) {
  const all = sheetRows(file, 'Tăng_Ca_và_Chi_Trả');
  // sheetRows already handled section B header switch; split by method column presence
  const otRows = [];
  const compRows = [];
  for (const row of all) {
    if (!row.code) continue;
    if (row.method != null || row.rate_x == null) {
      // After header switch, OT rows have rate_x; comp have method
      if (row.method != null && String(row.method).trim() !== '') {
        compRows.push(row);
      } else if (row.rate_x != null) {
        otRows.push(row);
      } else {
        // fallback: OT_* with rate vs OT_CASH*
        const c = String(row.code);
        if (c.startsWith('OT_CASH') || c.includes('COMP') || c.includes('MIX')) {
          compRows.push(row);
        } else {
          otRows.push(row);
        }
      }
    } else {
      otRows.push(row);
    }
  }

  // Re-parse sheet manually for reliability
  const wb = XLSX.readFile(file);
  const raw = XLSX.utils.sheet_to_json(wb.Sheets['Tăng_Ca_và_Chi_Trả'], {
    header: 1,
    defval: null,
  });
  const ot = [];
  const comp = [];
  let mode = null;
  for (const row of raw) {
    const a = String(row[0] ?? '');
    if (a.includes('A. LOẠI')) {
      mode = 'ot';
      continue;
    }
    if (a.includes('B. CHI')) {
      mode = 'comp';
      continue;
    }
    if (a === 'STT' || !mode) continue;
    if (typeof row[0] !== 'number') continue;
    const item = {
      code: row[1],
      name_vi: row[2],
      rate_or_method: row[3],
      ghi_chu: row[4],
      stt: row[0],
    };
    if (mode === 'ot') ot.push(item);
    else comp.push(item);
  }

  let ok = 0;
  let fail = 0;
  const errors = [];
  for (const row of ot) {
    const code = toKey(row.code);
    const body = {
      companyId: COMPANY_ID,
      code,
      nameVi: String(row.name_vi ?? code),
      defaultCoeff: parseRateX(row.rate_or_method),
      sortOrder: Number(row.stt) || 0,
      status: 'active',
      metadata: {
        source: 'Cham_Cong_Nghi_Phep_XE.xlsx',
        excel_rate: row.rate_or_method,
        note: row.ghi_chu,
      },
    };
    const r = await api('PUT', '/api/hrm/attendance/ot-types', body);
    if (r.status >= 200 && r.status < 300) ok++;
    else {
      fail++;
      errors.push(`OT ${code}: ${r.status} ${r.json.code}`);
    }
  }
  summarize('Loại tăng ca', ok, fail, errors.slice(0, 3).join(' | '));

  let ok2 = 0;
  let fail2 = 0;
  const errors2 = [];
  for (const row of comp) {
    const code = toKey(row.code);
    const body = {
      companyId: COMPANY_ID,
      code,
      nameVi: String(row.name_vi ?? code),
      sortOrder: Number(row.stt) || 0,
      status: 'active',
      metadata: {
        source: 'Cham_Cong_Nghi_Phep_XE.xlsx',
        method: row.rate_or_method,
        note: row.ghi_chu,
      },
    };
    const r = await api('PUT', '/api/hrm/attendance/ot-comp-types', body);
    if (r.status >= 200 && r.status < 300) ok2++;
    else {
      fail2++;
      errors2.push(`OTC ${code}: ${r.status} ${r.json.code} ${r.json.message}`);
    }
  }
  summarize('Chi trả tăng ca', ok2, fail2, errors2.slice(0, 3).join(' | '));
  return { ot: { ok, fail }, comp: { ok: ok2, fail: fail2 } };
}

async function importLeaveTypes(file) {
  const rows = sheetRows(file, 'Loại_Nghỉ_Phép').filter((r) => r.code);
  let ok = 0;
  let fail = 0;
  const errors = [];
  for (const row of rows) {
    const leaveTypeKey = toKey(row.code);
    const paidRaw = String(row.paid ?? '');
    const category =
      leaveTypeKey === 'annual'
        ? 'annual'
        : leaveTypeKey === 'sick'
          ? 'sick'
          : leaveTypeKey === 'comp_leave'
            ? 'ot_comp'
            : 'other';
    const body = {
      companyId: COMPANY_ID,
      leaveTypeKey,
      nameVi: String(row.name_vi ?? leaveTypeKey),
      category,
      isPaid: yes(paidRaw) || paidRaw.toLowerCase().includes('bh'),
      allowsCarryOver: yes(row.carry_over),
      insuranceRegimeFlag: paidRaw.toLowerCase().includes('bh'),
      unit: 'day',
      status: 'active',
      metadata: {
        source: 'Cham_Cong_Nghi_Phep_XE.xlsx',
        days_per_year: row.days_per_year,
        note: row.ghi_chu,
        excel_code: row.code,
      },
    };
    const r = await api('PUT', '/api/hrm/attendance/leave-types', body);
    if (r.status >= 200 && r.status < 300) ok++;
    else {
      fail++;
      errors.push(`${leaveTypeKey}: ${r.status} ${r.json.code} ${r.json.message}`);
    }
  }
  summarize('Loại nghỉ phép (XE)', ok, fail, errors.slice(0, 3).join(' | '));
  return { ok, fail };
}

function breakWindow(start, end, breakMinutes) {
  if (!start || !end || !breakMinutes || Number(breakMinutes) <= 0) {
    return { break_start: null, break_end: null };
  }
  // Place break roughly midday for office-like shifts
  const [sh, sm] = String(start).split(':').map(Number);
  if ([sh, sm].some((n) => Number.isNaN(n))) {
    return { break_start: null, break_end: null };
  }
  const startMin = sh * 60 + sm + 4 * 60; // +4h from start
  const bs = `${String(Math.floor(startMin / 60) % 24).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')}`;
  const endMin = startMin + Number(breakMinutes);
  const be = `${String(Math.floor(endMin / 60) % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
  return { break_start: bs, break_end: be };
}

async function importShifts(file) {
  const existing = await api(
    'GET',
    `/api/hrm/attendance/work-shifts?company_id=${COMPANY_ID}`,
  );
  const have = new Set(
    (existing.json.data?.data || []).map((r) => String(r.code).toUpperCase()),
  );
  const rows = sheetRows(file, 'Ca_Làm_Việc').filter((r) => r.code);
  let ok = 0;
  let fail = 0;
  let skip = 0;
  const errors = [];
  for (const row of rows) {
    const code = String(row.code).trim().toUpperCase();
    if (have.has(code)) {
      skip++;
      continue;
    }
    let start = String(row.start_time ?? '08:00').trim();
    let end = String(row.end_time ?? '17:00').trim();
    if (!/^\d{1,2}:\d{2}$/.test(start)) start = '08:00';
    if (!/^\d{1,2}:\d{2}$/.test(end)) end = '17:00';
    const br = breakWindow(start, end, row.break_minutes);
    const body = {
      company_id: COMPANY_ID,
      code,
      name: String(row.name_vi ?? code),
      department: row.apply_to ?? null,
      start_time: start,
      end_time: end,
      break_start: br.break_start,
      break_end: br.break_end,
      work_hours: 8,
      is_night_shift: code.includes('DEM') || start.startsWith('22'),
      status: 'active',
      notes: row.ghi_chu ?? null,
    };
    const r = await api('POST', '/api/hrm/attendance/work-shifts', body);
    if (r.status >= 200 && r.status < 300) {
      ok++;
      have.add(code);
    } else {
      fail++;
      errors.push(`${code}: ${r.status} ${r.json.code} ${r.json.message}`);
    }
  }
  summarize(
    'Ca làm việc (XE)',
    ok,
    fail,
    `skip_existing=${skip}; ${errors.slice(0, 2).join(' | ')}`,
  );
  return { ok, fail, skip };
}

function mapComponentType(excelType, code) {
  const t = String(excelType ?? '').toLowerCase();
  const c = String(code ?? '').toUpperCase();
  // assertPayTypeKey uses persist company_id without catalog remap —
  // only starter REF codes luong|thue|cham_cong are reliably accepted.
  if (t.includes('khấu') || c.startsWith('KHAU_TRU') || c === 'TAM_UNG' || c === 'KTTC_KHOAN_PHAT') {
    return c.includes('THUE') || c === 'KHAU_TRU_THUE' ? 'thue' : 'cham_cong';
  }
  return 'luong';
}

async function importSalaryComponents(file) {
  const existing = await api(
    'GET',
    `/api/hrm/payroll/salary-components?company_id=${COMPANY_ID}`,
  );
  const have = new Set(
    (existing.json.data?.data || []).map((r) => String(r.code).toUpperCase()),
  );
  const rows = sheetRows(file, 'Thành_Phần_Lương').filter((r) => r.code);
  let ok = 0;
  let fail = 0;
  let skip = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = String(row.code).trim().toUpperCase();
    if (have.has(code)) {
      skip++;
      continue;
    }
    const ctype = mapComponentType(row.component_type, code);
    const isDeduction =
      ctype === 'thue' ||
      ctype === 'cham_cong' &&
        (String(row.component_type).includes('Khấu') ||
          code.startsWith('KHAU') ||
          code === 'TAM_UNG' ||
          code === 'KTTC_KHOAN_PHAT');
    // Fix operator precedence for deduction detection
    const deduction =
      String(row.component_type).includes('Khấu') ||
      code.startsWith('KHAU') ||
      code === 'TAM_UNG' ||
      code === 'KTTC_KHOAN_PHAT';
    const body = {
      company_id: COMPANY_ID,
      code,
      name: String(row.name_vi ?? code),
      component_type: ctype,
      nature: deduction ? 'deduction' : 'income',
      value_type: 'currency',
      is_taxable: yes(row.taxable),
      is_insurance_base: yes(row.in_bhxh_base),
      description: row.ghi_chu ?? null,
      sort_order: (i + 1) * 10,
      is_active: true,
    };
    const r = await api('POST', '/api/hrm/payroll/salary-components', body);
    if (r.status >= 200 && r.status < 300) {
      ok++;
      have.add(code);
    } else {
      fail++;
      errors.push(`${code}: ${r.status} ${r.json.code} ${r.json.message}`);
    }
  }
  summarize(
    'Thành phần lương (XE)',
    ok,
    fail,
    `skip_existing=${skip}; ${errors.slice(0, 3).join(' | ')}`,
  );
  return { ok, fail, skip };
}

async function importPayrollGroups(file) {
  const existing = await api(
    'GET',
    `/api/hrm/payroll/groups?company_id=${COMPANY_ID}`,
  );
  const have = new Set(
    (existing.json.data?.items || existing.json.data?.data || []).map((r) =>
      String(r.code).toUpperCase(),
    ),
  );
  const rows = sheetRows(file, 'Nhóm_Lương').filter((r) => r.code);
  let ok = 0;
  let fail = 0;
  let skip = 0;
  const errors = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = String(row.code).trim().toUpperCase();
    if (have.has(code)) {
      skip++;
      continue;
    }
    const body = {
      company_id: COMPANY_ID,
      code,
      name_vi: String(row.name_vi ?? code),
      priority: (i + 1) * 10,
      status: 'active',
      match_rule_json: {},
    };
    const r = await api('POST', '/api/hrm/payroll/groups', body);
    if (r.status >= 200 && r.status < 300) {
      ok++;
      have.add(code);
    } else {
      fail++;
      errors.push(`${code}: ${r.status} ${r.json.code} ${r.json.message}`);
    }
  }
  summarize(
    'Nhóm lương (XE)',
    ok,
    fail,
    `skip_existing=${skip}; ${errors.slice(0, 2).join(' | ')}`,
  );
  return { ok, fail, skip };
}

async function importPayrollParams(file) {
  const wb = XLSX.readFile(file);
  const raw = XLSX.utils.sheet_to_json(wb.Sheets['Mặc_Định_Tính_Lương'], {
    header: 1,
    defval: null,
  });
  const map = new Map();
  for (const row of raw) {
    const k = String(row[0] ?? '').trim();
    const v = row[1];
    if (!k || k === 'Tham số') continue;
    map.set(k, v);
  }
  const body = {
    company_id: COMPANY_ID,
    STANDARD_WORK_DAYS: 26,
    STANDARD_WORK_HOURS: 8,
    MINIMUM_WAGE: parseMoney(map.get('Lương tối thiểu vùng I (HN)')) ?? 4_960_000,
    BHXH_BASE: parseMoney(map.get('Lương cơ sở BHXH 2026')) ?? 2_340_000,
    BHXH_CAP: parseMoney(map.get('Mức trần lương đóng BHXH')) ?? 46_800_000,
    BHXH_CMP_RATE: parsePct(map.get('Tỷ lệ BHXH (Công ty đóng)')) ?? 17.5,
    BHXH_EMP_RATE: parsePct(map.get('Tỷ lệ BHXH (NLĐ đóng)')) ?? 10.5,
    TNLD_CMP_RATE: parsePct(map.get('Tỷ lệ tai nạn LĐ (CT đóng)')) ?? 0.5,
    TNCN_PERSONAL:
      parseMoney(map.get('Giảm trừ gia cảnh bản thân')) ?? 11_000_000,
    TNCN_DEPENDENT:
      parseMoney(map.get('Giảm trừ người phụ thuộc')) ?? 4_400_000,
    CUTOFF_DAY: 25,
    PAY_DAY: 10,
    ADVANCE_DAY: 20,
    TNCN_BRACKETS: [
      { level: 1, upTo: 5_000_000, rate: 5 },
      { level: 2, upTo: 10_000_000, rate: 10 },
      { level: 3, upTo: 18_000_000, rate: 15 },
      { level: 4, upTo: 32_000_000, rate: 20 },
      { level: 5, upTo: 52_000_000, rate: 25 },
      { level: 6, upTo: 80_000_000, rate: 30 },
      { level: 7, upTo: null, rate: 35 },
    ],
  };
  const r = await api('PUT', '/api/hrm/settings/payroll-params', body);
  const ok = r.status >= 200 && r.status < 300;
  summarize(
    'Mặc định tính lương (params)',
    ok ? 1 : 0,
    ok ? 0 : 1,
    `${r.status} ${r.json.code} MW=${body.MINIMUM_WAGE}`,
  );
  return { ok: ok ? 1 : 0, fail: ok ? 0 : 1 };
}

async function importInsuranceTypesAndRates() {
  const types = [
    { insuranceTypeKey: 'BHXH', nameVi: 'BHXH' },
    { insuranceTypeKey: 'BHYT', nameVi: 'BHYT' },
    { insuranceTypeKey: 'BHTN', nameVi: 'BHTN' },
    { insuranceTypeKey: 'TNLD', nameVi: 'TNLĐ-BNN' },
  ];
  let typeOk = 0;
  for (const t of types) {
    const r = await api('PUT', '/api/hrm/contracts-insurance/insurance-types', {
      companyId: COMPANY_ID,
      insuranceTypeKey: t.insuranceTypeKey,
      nameVi: t.nameVi,
      isStatutory: true,
      eligibleForRateCfg: true,
      status: 'active',
      metadata: { source: 'Luong_Thu_Nhap_XE.xlsx' },
    });
    if (r.status >= 200 && r.status < 300) typeOk++;
    else
      console.log(
        'ins-type fail',
        t.insuranceTypeKey,
        r.status,
        r.json.code,
        r.json.message,
      );
  }
  summarize('Loại BH (SI types)', typeOk, types.length - typeOk);

  const rates = [
    { insuranceTypeKey: 'BHXH', employeeRatePct: 8, employerRatePct: 14 },
    { insuranceTypeKey: 'BHYT', employeeRatePct: 1.5, employerRatePct: 3 },
    { insuranceTypeKey: 'BHTN', employeeRatePct: 1, employerRatePct: 0.5 },
    { insuranceTypeKey: 'TNLD', employeeRatePct: 0, employerRatePct: 0.5 },
  ];
  let ok = 0;
  let fail = 0;
  const errors = [];
  for (const rate of rates) {
    const body = {
      companyId: COMPANY_ID,
      insuranceTypeKey: rate.insuranceTypeKey,
      employeeRatePct: rate.employeeRatePct,
      employerRatePct: rate.employerRatePct,
      ceilingAmount: 46_800_000,
      effectiveFrom: '2024-07-01',
      status: 'active',
    };
    const r = await api('POST', '/api/hrm/settings/insurance-rate-cfg', body);
    if (r.status >= 200 && r.status < 300) ok++;
    else {
      fail++;
      errors.push(
        `${rate.insuranceTypeKey}: ${r.status} ${r.json.code} ${r.json.message}`,
      );
    }
  }
  summarize('Tỷ lệ BH (rate-cfg)', ok, fail, errors.slice(0, 3).join(' | '));
  return { typeOk, ok, fail };
}

async function verify() {
  const paths = [
    ['leave-types', '/api/hrm/attendance/leave-types?company_id=main'],
    ['attendance-codes', '/api/hrm/attendance/attendance-codes?company_id=main'],
    ['ot-types', '/api/hrm/attendance/ot-types?company_id=main'],
    ['ot-comp-types', '/api/hrm/attendance/ot-comp-types?company_id=main'],
    ['work-shifts', '/api/hrm/attendance/work-shifts?company_id=main'],
    ['salary-components', '/api/hrm/payroll/salary-components?company_id=main'],
    ['payroll-groups', '/api/hrm/payroll/groups?company_id=main'],
    ['insurance-rate-cfg', '/api/hrm/settings/insurance-rate-cfg?company_id=main'],
    ['payroll-params', '/api/hrm/settings/payroll-params?company_id=main'],
  ];
  console.log('\n=== VERIFY ===');
  for (const [name, p] of paths) {
    const r = await api('GET', p);
    const d = r.json.data;
    let n = '?';
    if (d && typeof d.total === 'number') n = d.total;
    else if (d?.items) n = d.items.length;
    else if (d?.data) n = d.data.length;
    else if (d && typeof d === 'object' && d.MINIMUM_WAGE != null)
      n = `MW=${d.MINIMUM_WAGE}`;
    console.log(`${name}: ${r.status} n=${n}`);
  }
}

async function main() {
  if (!existsSync(ATT_XLSX)) throw new Error(`Missing ATT xlsx: ${ATT_XLSX}`);
  if (!existsSync(PAY_XLSX)) throw new Error(`Missing PAY xlsx: ${PAY_XLSX}`);
  console.log('ATT:', ATT_XLSX);
  console.log('PAY:', PAY_XLSX);
  console.log('API:', BASE, 'company:', COMPANY_ID);

  await ensurePayTypes();
  await importAttendanceCodes(ATT_XLSX);
  await importOtAndComp(ATT_XLSX);
  await importLeaveTypes(ATT_XLSX);
  await importShifts(ATT_XLSX);
  await importSalaryComponents(PAY_XLSX);
  await importPayrollGroups(PAY_XLSX);
  await importPayrollParams(PAY_XLSX);
  await importInsuranceTypesAndRates();
  await verify();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
