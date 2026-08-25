#!/usr/bin/env node
/**
 * Cập nhật HĐ 12 tháng cho 43 NV ĐPHH (xe-vietnam) theo lịch thử việc từ bảng Excel.
 * Xóa toàn bộ HĐ cũ của từng NV có dữ liệu, tạo lại 1 HĐ HDLD_XDHN_12.
 *
 * Usage:
 *   node scripts/reseed-dphh-contracts-from-schedule.mjs --dry-run
 *   node scripts/reseed-dphh-contracts-from-schedule.mjs
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';

export const DPHH_CONTRACT_SCHEDULE_TAG = 'dphh-contract-schedule-2026-08';

const TENANT_ID = 'xe-vietnam';
const COMPANY_ID = 'main';
const CONTRACT_TYPE = 'HDLD_XDHN_12';
const PACK_CODE = 'IT_OFFICE';
const TEMPLATE_CODE = 'XEVN_FT_12M_OFFICE';
const WORK_ARRANGEMENT = 'full_time';

const TARGET_DEPARTMENT_CODES = ['phong_dphh', 'phong_dphh_hadong_hn'];

const DEPARTMENT_LABELS = {
  phong_dphh: 'Phòng Điều Phối Hàng Hóa',
  phong_dphh_hadong_hn: 'DPHH Văn Phòng Hà Đông',
};

const JOB_LABEL_BY_KEY = {
  dieu_phoi: 'Điều phối',
  truong_buu_cuc: 'Trưởng bưu cục',
};

/**
 * Mã NV · ngày vào làm/thử việc · ngày kết thúc thử việc (MM/DD/YYYY).
 * Nguồn: bảng ĐPHH — lấy 1 dòng đại diện / mã gốc (các suffix LD/GP/TT… cùng ngày).
 */
const PROBATION_SCHEDULE = [
  ['XE01480', '1/16/2026', '2/14/2026'],
  ['XE01683', '5/11/2026', '6/9/2026'],
  ['XE01753', '6/17/2026', '7/16/2026'],
  ['XE01134', '7/30/2025', '8/28/2025'],
  ['XE00963', '4/5/2025', '6/3/2025'],
  ['XE01640', '4/11/2026', '5/10/2026'],
  ['XE00968', '4/9/2025', '7/8/2025'],
  ['XE01686', '5/13/2026', '6/11/2026'],
  ['XE01132', '7/28/2025', '10/27/2025'],
  ['XE01495', '1/23/2026', '2/21/2026'],
  ['XE00136', '9/23/2022', '10/22/2022'],
  ['XE00073', '7/27/2020', '9/24/2020'],
  ['XE01113', '7/19/2025', '10/18/2025'],
  ['XE00106', '3/17/2022', '4/15/2022'],
  ['XE00903', '3/15/2025', '7/14/2025'],
  ['XE01239', '9/24/2025', '10/23/2025'],
  ['XE01324', '10/27/2025', '11/25/2025'],
  ['XE01484', '1/19/2026', '2/17/2026'],
  ['XE01339', '11/6/2025', '12/5/2025'],
  ['XE00640', '10/18/2024', '11/16/2024'],
  ['XE00708', '12/2/2024', '12/31/2024'],
  ['XE01751', '6/16/2026', '7/15/2026'],
  ['XE00061', '11/26/2019', '12/25/2019'],
  ['XE00087', '11/3/2020', '12/2/2020'],
  ['XE00102', '2/24/2022', '3/25/2022'],
  ['XE00279', '11/13/2023', '12/12/2023'],
  ['XE00564', '9/3/2024', '9/3/2024'],
  ['XE00036', '3/8/2018', '4/6/2018'],
  ['XE01702', '5/20/2026', '6/18/2026'],
  ['XE00331', '3/1/2024', '3/30/2024'],
  ['XE00332', '3/1/2024', '3/30/2024'],
  ['XE00988', '4/21/2025', '7/20/2025'],
  ['XE00047', '1/21/2019', '3/3/2019'],
  ['XE00131', '8/29/2022', '9/27/2022'],
  ['XE01174', '7/24/2025', '8/22/2025'],
  ['XE01173', '8/1/2025', '10/31/2025'],
  ['XE00218', '6/26/2023', '7/25/2023'],
  ['XE00358', '3/25/2024', '4/23/2024'],
  ['XE00182', '2/13/2023', '3/12/2023'],
  ['XE01579', '3/14/2026', '4/12/2026'],
  ['XE01203', '9/3/2025', '10/2/2025'],
  ['XE01561', '3/6/2026', '4/4/2026'],
  ['XE01571', '3/10/2026', '4/8/2026'],
];

function parseUsDate(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const parts = s.split('/').map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [month, day, year] = parts;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDaysUtc(d, days) {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function contractEndFromStart(start) {
  const end = new Date(start);
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  end.setUTCDate(end.getUTCDate() - 1);
  return end;
}

function diffDaysInclusive(start, end) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / 86400000) + 1);
}

function buildScheduleEntry(code, probationStartRaw, probationEndRaw) {
  const probationStart = parseUsDate(probationStartRaw);
  const probationEnd = parseUsDate(probationEndRaw);
  if (!probationStart || !probationEnd) {
    return { code: code.toUpperCase(), valid: false, reason: 'invalid_date' };
  }
  if (probationEnd < probationStart) {
    return { code: code.toUpperCase(), valid: false, reason: 'probation_end_before_start' };
  }
  const contractStart = addDaysUtc(probationEnd, 1);
  const contractEnd = contractEndFromStart(contractStart);
  const today = fmtDate(new Date());
  const contractEndIso = fmtDate(contractEnd);
  return {
    code: code.toUpperCase(),
    valid: true,
    hired_at: fmtDate(probationStart),
    probation_start: fmtDate(probationStart),
    probation_end: fmtDate(probationEnd),
    probation_days: diffDaysInclusive(probationStart, probationEnd),
    contract_start: fmtDate(contractStart),
    contract_end: contractEndIso,
    contract_status: contractEndIso >= today ? 'active' : 'expired',
  };
}

const SCHEDULE_BY_CODE = new Map(
  PROBATION_SCHEDULE.map(([code, s, e]) => {
    const entry = buildScheduleEntry(code, s, e);
    return [entry.code, entry];
  }),
);

function resolveJobLabel(employee) {
  const fromCf = String(employee.job_title_label ?? '').trim();
  if (fromCf) return fromCf;
  const key = String(employee.job_title_key ?? '').trim().toLowerCase();
  return (JOB_LABEL_BY_KEY[key] ?? key) || 'Nhân viên';
}

function resolveDepartmentMeta(employee) {
  const code = String(employee.department_code ?? '').trim().toLowerCase();
  const label =
    String(employee.department_label ?? '').trim() ||
    DEPARTMENT_LABELS[code] ||
    code;
  return { code, label };
}

async function loadEmployees(client, codes) {
  const res = await client.query(
    `SELECT
       e.id,
       e.employee_code,
       e.job_title_key,
       e.custom_fields->>'department' AS department_code,
       e.custom_fields->>'department_label' AS department_label,
       e.custom_fields->>'job_title_label' AS job_title_label
     FROM public.employees e
     WHERE e.company_id = $1
       AND COALESCE(NULLIF(TRIM(e.custom_fields->>'tenant_id'), ''), '') = $2
       AND upper(e.employee_code) = ANY($3::text[])
     ORDER BY e.employee_code`,
    [COMPANY_ID, TENANT_ID, codes],
  );
  return res.rows;
}

export async function reseedDphhContractsFromSchedule(client, { dryRun = false } = {}) {
  const scheduleCodes = [...SCHEDULE_BY_CODE.keys()];
  const employees = await loadEmployees(client, scheduleCodes);
  const employeeByCode = new Map(employees.map((e) => [e.employee_code.toUpperCase(), e]));

  const result = {
    seed_tag: DPHH_CONTRACT_SCHEDULE_TAG,
    tenant_id: TENANT_ID,
    schedule_rows: PROBATION_SCHEDULE.length,
    employees_in_db: employees.length,
    contracts_deleted: 0,
    contracts_created: 0,
    employees_updated: 0,
    skipped_no_schedule: [],
    skipped_not_in_db: [],
    skipped_invalid_schedule: [],
    details: [],
  };

  for (const code of scheduleCodes) {
    const schedule = SCHEDULE_BY_CODE.get(code);
    if (!schedule?.valid) {
      result.skipped_invalid_schedule.push({ code, reason: schedule?.reason });
      continue;
    }
    const emp = employeeByCode.get(code);
    if (!emp) {
      result.skipped_not_in_db.push(code);
      continue;
    }

    const jobLabel = resolveJobLabel(emp);
    const jobKey = String(emp.job_title_key ?? '').trim().toLowerCase();
    const dept = resolveDepartmentMeta(emp);
    const contractId = stableUuid(`${DPHH_CONTRACT_SCHEDULE_TAG}:contract:${emp.id}`);

    if (dryRun) {
      const cnt = await client.query(
        `SELECT COUNT(*)::int AS c FROM public.employee_contracts WHERE employee_id = $1::uuid`,
        [emp.id],
      );
      result.contracts_deleted += cnt.rows[0]?.c ?? 0;
      result.contracts_created++;
      result.employees_updated++;
      result.details.push({
        employee_code: code,
        ...schedule,
        department: dept.code,
        contracts_removed: cnt.rows[0]?.c ?? 0,
      });
      continue;
    }

    const del = await client.query(
      `DELETE FROM public.employee_contracts WHERE employee_id = $1::uuid RETURNING id`,
      [emp.id],
    );
    result.contracts_deleted += del.rowCount ?? 0;

    await client.query(
      `INSERT INTO public.employee_contracts (
        id, company_id, employee_id, contract_code, contract_type,
        start_date, end_date, status,
        pack_code, template_code, salary_ratio_percent,
        position, position_key, department, department_key,
        work_arrangement, subject_type,
        probation_days, probation_end,
        updated_at
      ) VALUES (
        $1::uuid, $2, $3::uuid, $4, $5,
        $6::date, $7::date, $8,
        $9, $10, 100,
        $11, $12, $13, $14,
        $15, 'employee',
        $16, $17::date,
        NOW()
      )`,
      [
        contractId,
        COMPANY_ID,
        emp.id,
        `HD-${code}-${schedule.contract_start.replace(/-/g, '')}`,
        CONTRACT_TYPE,
        schedule.contract_start,
        schedule.contract_end,
        schedule.contract_status,
        PACK_CODE,
        TEMPLATE_CODE,
        jobLabel,
        jobKey,
        dept.label,
        dept.code,
        WORK_ARRANGEMENT,
        schedule.probation_days,
        schedule.probation_end,
      ],
    );
    result.contracts_created++;

    await client.query(
      `UPDATE public.employees
       SET hired_at = $2::date,
           custom_fields = custom_fields
             || jsonb_build_object(
               'probation_start_at', $3::text,
               'probation_end_at', $4::text,
               'contract_schedule_tag', $5::text
             ),
           updated_at = NOW()
       WHERE id = $1::uuid`,
      [emp.id, schedule.hired_at, schedule.probation_start, schedule.probation_end, DPHH_CONTRACT_SCHEDULE_TAG],
    );
    result.employees_updated++;

    result.details.push({
      employee_code: code,
      full_name: jobLabel,
      department: dept.code,
      hired_at: schedule.hired_at,
      probation_start: schedule.probation_start,
      probation_end: schedule.probation_end,
      contract_start: schedule.contract_start,
      contract_end: schedule.contract_end,
      contract_status: schedule.contract_status,
      contracts_removed: del.rowCount ?? 0,
    });
  }

  return result;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadDeployEnv();
  const client = createHrmClient();
  await client.connect();
  try {
    if (!dryRun) await client.query('BEGIN');
    const result = await reseedDphhContractsFromSchedule(client, { dryRun });
    if (!dryRun) {
      await client.query(
        `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
         VALUES ($1, NOW(), $2::jsonb)
         ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
        [DPHH_CONTRACT_SCHEDULE_TAG, JSON.stringify(result)],
      );
      await client.query('COMMIT');
    }
    console.log(JSON.stringify({ success: true, dry_run: dryRun, ...result }, null, 2));
  } catch (error) {
    if (!dryRun) await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
