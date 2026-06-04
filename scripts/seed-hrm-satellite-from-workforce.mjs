#!/usr/bin/env node
/**
 * Scale HRM satellite tables from active workforce (idempotent).
 * work_item_id: HRM-FIDELITY-BE
 * Rules: docs/hrm/HRM_SEED_CARDINALITY_RULES.md
 */
import pg from 'pg';
import { createHash } from 'node:crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  UAT_COMPANIES,
  attendanceCompanyUuid,
  resolveMasterTenant,
} from './lib/uat-workforce.mjs';
import {
  contractDatesForType,
  pickContractType,
  pickInsuranceProvider,
} from './lib/vietnamese-workforce-data.mjs';

loadDeployEnv();

const { Client } = pg;

export const FIDELITY_SEED_TAG = process.env.HRM_FIDELITY_SEED_TAG ?? 'hrm-realistic-v2';
const CONTRACT_COHORT_MAX = Number(process.env.HRM_FIDELITY_CONTRACT_PCT ?? 217); // ~85% of 255
const ATTENDANCE_DAYS_PER_EMPLOYEE = Number(process.env.HRM_FIDELITY_ATTENDANCE_DAYS ?? 3);
const NOTE_TAG = `seed:${FIDELITY_SEED_TAG}`;
const LEAVE_REASON_TAG = `seed:${FIDELITY_SEED_TAG}`;
const POLICY_PREFIX = `FIDELITY:${FIDELITY_SEED_TAG}:`;

const COMPANY_UUID_MAP = {
  holding: '10000000-0000-4000-8000-000000000001',
  trsport: '10000000-0000-4000-8000-000000000002',
  logistics: '10000000-0000-4000-8000-000000000003',
  finance: '10000000-0000-4000-8000-000000000004',
  services: '10000000-0000-4000-8000-000000000005',
};

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HRM_DB_NAME || 'xevn_hrm',
  ssl: false,
};

function hashByte(seed) {
  return createHash('sha256').update(seed).digest()[0];
}

function inCohort(prefix, key, max = CONTRACT_COHORT_MAX) {
  return hashByte(`${FIDELITY_SEED_TAG}:${prefix}:${key}`) < max;
}

function fidelityId(entity, key) {
  return stableUuid(`${FIDELITY_SEED_TAG}:${entity}:${key}`);
}

async function companyIdKind(client, table) {
  const r = await client.query(
    `SELECT data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'company_id'`,
    [table],
  );
  const dt = r.rows[0]?.data_type;
  if (dt === 'uuid') return 'uuid';
  return 'text';
}

function slugFromCompanyId(companyId) {
  if (!companyId) return 'holding';
  const s = String(companyId);
  if (COMPANY_UUID_MAP[s]) return s;
  const hit = Object.entries(COMPANY_UUID_MAP).find(([, u]) => u === s);
  return hit?.[0] ?? (UAT_COMPANIES.includes(s) ? s : 'holding');
}

function cidForSlug(slug, kind) {
  if (kind === 'uuid') return COMPANY_UUID_MAP[slug] ?? COMPANY_UUID_MAP.holding;
  return slug;
}

function resolveAttendanceCompanyUuid(emp, tenantId) {
  const cf = emp.custom_fields ?? {};
  if (cf.attendance_company_uuid) return cf.attendance_company_uuid;
  const slug = slugFromCompanyId(emp.company_id);
  return attendanceCompanyUuid(tenantId, slug);
}

async function ensureMetadataSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_metadata (
      seed_tag TEXT NOT NULL,
      entity_table TEXT NOT NULL,
      entity_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (seed_tag, entity_table, entity_id)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_runs (
      seed_tag TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);
}

async function purgePriorSeed(client) {
  const workforceTags = ['realistic-v2', '1000-v1'];
  const satelliteTables = [
    'payroll_payslips',
    'leave_requests',
    'attendance_records',
    'employee_insurance_records',
    'employee_contracts',
  ];
  for (const table of satelliteTables) {
    await client.query(
      `
      DELETE FROM public.${table} t
      USING public.employees e
      WHERE t.employee_id = e.id AND e.custom_fields->>'uat_seed' = ANY($1::text[])
      `,
      [workforceTags],
    );
  }

  const tables = [
    'payroll_payslips',
    'payroll_periods',
    'recruitment_interviews',
    'recruitment_candidates',
    'job_requisitions',
    'leave_requests',
    'attendance_records',
    'employee_insurance_records',
    'employee_contracts',
  ];
  for (const table of tables) {
    await client.query(
      `
      DELETE FROM public.${table} t
      USING public.hrm_seed_metadata m
      WHERE m.seed_tag = $1 AND m.entity_table = $2 AND m.entity_id = t.id;
      `,
      [FIDELITY_SEED_TAG, table],
    );
    await client.query(
      `
      DELETE FROM public.${table} t
      USING public.hrm_seed_metadata m
      WHERE m.seed_tag = $1 AND m.entity_table = $2 AND m.entity_id = t.id;
      `,
      ['hrm-fidelity-v1', table],
    );
  }
  await client.query(`DELETE FROM public.hrm_seed_metadata WHERE seed_tag = ANY($1::text[])`, [
    [FIDELITY_SEED_TAG, 'hrm-fidelity-v1'],
  ]);
}

async function trackMeta(client, table, id) {
  await client.query(
    `INSERT INTO public.hrm_seed_metadata (seed_tag, entity_table, entity_id)
     VALUES ($1, $2, $3::uuid)
     ON CONFLICT DO NOTHING`,
    [FIDELITY_SEED_TAG, table, id],
  );
}

async function loadActiveEmployees(client) {
  const res = await client.query(
    `
    SELECT id, company_id, employee_code, full_name, status, hired_at, custom_fields
    FROM public.employees
    WHERE status = 'active' OR status IS NULL
    ORDER BY employee_code;
    `,
  );
  return res.rows.map((r) => ({
    ...r,
    custom_fields:
      typeof r.custom_fields === 'string' ? JSON.parse(r.custom_fields) : r.custom_fields ?? {},
  }));
}

async function seedContractsAndInsurance(client, employees, kinds) {
  let contracts = 0;
  const batch = [];

  for (const emp of employees) {
    if (!inCohort('contract', emp.employee_code)) continue;
    const slug = slugFromCompanyId(emp.company_id);
    const contractCompany = cidForSlug(slug, kinds.employee_contracts);
    const contractId = fidelityId('contract', emp.id);
    batch.push({ contractId, contractCompany, emp });
    if (batch.length >= 200) {
      contracts += await flushContractBatch(client, batch, kinds);
      batch.length = 0;
    }
  }
  if (batch.length) {
    contracts += await flushContractBatch(client, batch, kinds);
  }
  return { contracts, insurance: contracts };
}

async function flushContractBatch(client, batch, kinds) {
  let n = 0;
  for (const row of batch) {
    const { contractId, contractCompany, emp } = row;
    n += 1;
    const seqNum = Number(String(emp.employee_code ?? '').replace(/\D/g, '')) || hashByte(emp.employee_code);
    const contractDef = pickContractType(seqNum);
    const dates = contractDatesForType(contractDef.key, emp.hired_at ?? null);
    await client.query(
      `INSERT INTO public.employee_contracts
         (id, company_id, employee_id, contract_type, start_date, end_date, status)
       VALUES ($1::uuid, $2, $3::uuid, $4, $5::date, $6::date, 'active')
       ON CONFLICT (id) DO UPDATE SET
         company_id = EXCLUDED.company_id,
         employee_id = EXCLUDED.employee_id,
         contract_type = EXCLUDED.contract_type,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         status = EXCLUDED.status,
         updated_at = NOW()`,
      [
        contractId,
        contractCompany,
        emp.id,
        contractDef.label,
        dates.start,
        dates.end,
      ],
    );
    await trackMeta(client, 'employee_contracts', contractId);

    const insId = fidelityId('insurance', emp.id);
    const insCompany = cidForSlug(slugFromCompanyId(emp.company_id), kinds.employee_insurance_records);
    const provider = pickInsuranceProvider(seqNum);
    const expiry = dates.end > '2026-01-01' ? dates.end : '2027-12-31';
    await client.query(
      `INSERT INTO public.employee_insurance_records
         (id, company_id, employee_id, provider, policy_number, expiry_date, status)
       VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6::date, 'active')
       ON CONFLICT (id) DO UPDATE SET
         company_id = EXCLUDED.company_id,
         provider = EXCLUDED.provider,
         policy_number = EXCLUDED.policy_number,
         expiry_date = EXCLUDED.expiry_date,
         status = EXCLUDED.status,
         updated_at = NOW()`,
      [
        insId,
        insCompany,
        emp.id,
        provider,
        `BH-${emp.employee_code}-${contractDef.key}`,
        expiry,
      ],
    );
    await trackMeta(client, 'employee_insurance_records', insId);
  }
  return n;
}

async function seedAttendance(client, employees, kinds, tenantId) {
  let count = 0;
  const attKind = kinds.attendance_records;

  for (const emp of employees) {
    if (!inCohort('attendance', emp.employee_code)) continue;
    const slug = slugFromCompanyId(emp.company_id);
    const companyId =
      attKind === 'uuid' ? resolveAttendanceCompanyUuid(emp, tenantId) : cidForSlug(slug, 'text');

    for (let d = 0; d < ATTENDANCE_DAYS_PER_EMPLOYEE; d += 1) {
      const dayOffset = (hashByte(`${emp.employee_code}:d${d}`) % 28) + 1;
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - dayOffset);
      const dateStr = date.toISOString().slice(0, 10);
      const recordId = fidelityId('attendance', `${emp.id}:${dateStr}`);
      const checkIn = `${dateStr}T01:00:00.000Z`;
      const checkOut = `${dateStr}T10:00:00.000Z`;

      await client.query(
        `INSERT INTO public.attendance_records
           (id, company_id, employee_id, attendance_date, check_in_at, check_out_at, status, note, created_by)
         VALUES ($1::uuid, $2, $3::uuid, $4::date, $5::timestamptz, $6::timestamptz, 'present', $7, $8)
         ON CONFLICT (company_id, employee_id, attendance_date) DO UPDATE SET
           status = EXCLUDED.status,
           note = EXCLUDED.note,
           check_in_at = EXCLUDED.check_in_at,
           check_out_at = EXCLUDED.check_out_at,
           updated_at = NOW()`,
        [recordId, companyId, emp.id, dateStr, checkIn, checkOut, NOTE_TAG, FIDELITY_SEED_TAG],
      );
      await trackMeta(client, 'attendance_records', recordId);
      count += 1;
    }
  }
  return count;
}

async function seedPayroll(client, employees, kinds) {
  const companies = [...new Set(employees.map((e) => slugFromCompanyId(e.company_id)))];
  const periods = [];
  let payslips = 0;

  for (const slug of companies) {
    const payrollCompany = cidForSlug(slug, kinds.payroll_periods);
    const processedId = fidelityId('payroll-period', `${slug}:2026-05`);
    const draftId = fidelityId('payroll-period', `${slug}:2026-06`);

    for (const [id, label, start, end, status] of [
      [processedId, `Kỳ lương 05/2026 — ${slug}`, '2026-05-01', '2026-05-31', 'processed'],
      [draftId, `Kỳ lương 06/2026 — ${slug}`, '2026-06-01', '2026-06-30', 'draft'],
    ]) {
      const ins = await client.query(
        `INSERT INTO public.payroll_periods
           (id, company_id, period_label, start_date, end_date, status, created_by, processed_at)
         VALUES ($1::uuid, $2, $3, $4::date, $5::date, $6, $7, CASE WHEN $6 = 'processed' THEN NOW() ELSE NULL END)
         ON CONFLICT (company_id, start_date, end_date) DO UPDATE SET
           period_label = EXCLUDED.period_label,
           status = EXCLUDED.status,
           updated_at = NOW()
         RETURNING id`,
        [id, payrollCompany, label, start, end, status, FIDELITY_SEED_TAG],
      );
      const periodId = ins.rows[0]?.id ?? id;
      await trackMeta(client, 'payroll_periods', periodId);
      periods.push({ id: periodId, slug, payrollCompany, status });
    }
  }

  for (const emp of employees) {
    if (!inCohort('payslip', emp.employee_code)) continue;
    const slug = slugFromCompanyId(emp.company_id);
    const period = periods.find((p) => p.slug === slug && p.status === 'processed');
    if (!period) continue;
    const payslipId = fidelityId('payslip', `${emp.id}:${period.id}`);
    const gross = 15000000 + (hashByte(emp.employee_code) % 50) * 100000;
    const deduction = Math.floor(gross * 0.1);
    await client.query(
      `INSERT INTO public.payroll_payslips
         (id, company_id, period_id, employee_id, employee_code, employee_name,
          gross_amount, deduction_amount, net_amount, currency, status)
       VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, 'VND', 'processed')
       ON CONFLICT (period_id, employee_id) DO UPDATE SET
         gross_amount = EXCLUDED.gross_amount,
         net_amount = EXCLUDED.net_amount,
         updated_at = NOW()`,
      [
        payslipId,
        period.payrollCompany,
        period.id,
        emp.id,
        emp.employee_code,
        emp.full_name,
        gross,
        deduction,
        gross - deduction,
      ],
    );
    await trackMeta(client, 'payroll_payslips', payslipId);
    payslips += 1;
  }

  return { periods: periods.length, payslips };
}

async function seedRecruitment(client, kinds) {
  let requisitions = 0;
  let candidates = 0;

  for (const slug of UAT_COMPANIES) {
    const reqCompany = cidForSlug(slug, kinds.job_requisitions);
    for (let i = 0; i < 2; i += 1) {
      const reqId = fidelityId('requisition', `${slug}:${i}`);
      await client.query(
        `INSERT INTO public.job_requisitions
           (id, company_id, title, department, employment_type, status)
         VALUES ($1::uuid, $2, $3, $4, 'full-time', 'open')
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, updated_at = NOW()`,
        [reqId, reqCompany, `Tuyển ${slug} #${i + 1}`, i === 0 ? 'Vận hành' : 'Nhân sự'],
      );
      await trackMeta(client, 'job_requisitions', reqId);
      requisitions += 1;

      for (let c = 0; c < 2; c += 1) {
        const candId = fidelityId('candidate', `${reqId}:${c}`);
        await client.query(
          `INSERT INTO public.recruitment_candidates
             (id, company_id, requisition_id, full_name, email, source, status)
           VALUES ($1::uuid, $2, $3::uuid, $4, $5, 'referral', 'interview')
           ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
          [
            candId,
            reqCompany,
            reqId,
            `UV Fidelity ${slug} ${i}-${c}`,
            `fidelity.${slug}.${i}.${c}@mail.xe.vn`,
          ],
        );
        await trackMeta(client, 'recruitment_candidates', candId);
        candidates += 1;
      }
    }
  }

  return { requisitions, candidates };
}

async function seedLeave(client, employees, tenantId) {
  const target = Math.max(5, Math.ceil(employees.length / 200));
  let count = 0;

  for (let i = 0; i < employees.length && count < target; i += 1) {
    const emp = employees[i];
    if (!inCohort('leave', emp.employee_code, 64)) continue;
    const companyUuid = resolveAttendanceCompanyUuid(emp, tenantId);
    const leaveId = fidelityId('leave', emp.id);
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 2);
    const status = hashByte(emp.employee_code) % 2 === 0 ? 'pending' : 'approved';

    await client.query(
      `INSERT INTO public.leave_requests (
         id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
         employee_code, employee_name, total_days, requested_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 'annual', $4::date, $5::date, $6, $7,
         $8, $9, 3, NOW()
       )
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, reason = EXCLUDED.reason`,
      [
        leaveId,
        companyUuid,
        emp.id,
        start.toISOString().slice(0, 10),
        end.toISOString().slice(0, 10),
        LEAVE_REASON_TAG,
        status,
        emp.employee_code,
        emp.full_name,
      ],
    );
    await trackMeta(client, 'leave_requests', leaveId);
    count += 1;
  }

  return count;
}

async function main() {
  const client = new Client(baseConfig);
  const tenantId = resolveMasterTenant();
  await client.connect();

  try {
    await client.query('BEGIN');
    await ensureMetadataSchema(client);

    const kinds = {
      employee_contracts: await companyIdKind(client, 'employee_contracts'),
      employee_insurance_records: await companyIdKind(client, 'employee_insurance_records'),
      attendance_records: await companyIdKind(client, 'attendance_records'),
      payroll_periods: await companyIdKind(client, 'payroll_periods'),
      payroll_payslips: await companyIdKind(client, 'payroll_payslips'),
      job_requisitions: await companyIdKind(client, 'job_requisitions'),
      recruitment_candidates: await companyIdKind(client, 'recruitment_candidates'),
    };

    await purgePriorSeed(client);
    const employees = await loadActiveEmployees(client);

    const { contracts, insurance } = await seedContractsAndInsurance(client, employees, kinds);
    const attendance = await seedAttendance(client, employees, kinds, tenantId);
    const payroll = await seedPayroll(client, employees, kinds);
    const recruitment = await seedRecruitment(client, kinds);
    const leave = await seedLeave(client, employees, tenantId);

    const counts = {
      employees_active: employees.length,
      employee_contracts: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.employee_contracts`)
      ).rows[0].c,
      employee_insurance_records: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.employee_insurance_records`)
      ).rows[0].c,
      attendance_records: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.attendance_records`)
      ).rows[0].c,
      payroll_periods: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.payroll_periods`)
      ).rows[0].c,
      payroll_payslips: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.payroll_payslips`)
      ).rows[0].c,
      job_requisitions: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.job_requisitions`)
      ).rows[0].c,
      recruitment_candidates: (
        await client.query(`SELECT COUNT(*)::int AS c FROM public.recruitment_candidates`)
      ).rows[0].c,
      leave_requests: (await client.query(`SELECT COUNT(*)::int AS c FROM public.leave_requests`)).rows[0]
        .c,
    };

    const meta = {
      seed_tag: FIDELITY_SEED_TAG,
      seeded_this_run: { contracts, insurance, attendance, payroll, recruitment, leave },
      company_id_kinds: kinds,
      rules_doc: 'docs/hrm/HRM_SEED_CARDINALITY_RULES.md',
    };

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, ran_at, metadata)
       VALUES ($1, NOW(), $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [FIDELITY_SEED_TAG, JSON.stringify(meta)],
    );

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          success: true,
          seed_tag: FIDELITY_SEED_TAG,
          table_counts: counts,
          seeded_this_run: meta.seeded_this_run,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
