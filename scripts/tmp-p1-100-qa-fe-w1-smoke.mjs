/**
 * P1-100-QA-FE-W1 — batch-1 hrmApiGap Nest wire smoke via portal :5175.
 * Account: ceo@xe.vn, company_id=main. No 54321 / Supabase paths.
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv, loadEnvFile, repoRoot } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
loadEnvFile(resolve(repoRoot, 'apps/api/hrm-api/.env'));

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const COMPANY = 'main';
const stamp = Date.now();

const session = await portalLogin(email, password);
const headers = {
  ...authHeaders(session),
  accept: 'application/json',
  'content-type': 'application/json',
};

const results = { work_item_id: 'P1-100-QA-FE-W1', steps: [], pass: true, supabase_hits: [] };

function record(name, r, expect = {}) {
  const statusOk = Array.isArray(expect.status)
    ? expect.status.includes(r.status)
    : expect.status == null || r.status === expect.status;
  const ok = statusOk && (expect.minTotal == null || (r.total ?? 0) >= expect.minTotal);
  if (String(r.url ?? '').includes('54321') || String(r.url ?? '').includes('rest/v1')) {
    results.supabase_hits.push(r.url);
    results.pass = false;
  }
  results.steps.push({ name, url: r.url, status: r.status, code: r.code, total: r.total, pass: ok, expect });
  if (!ok) results.pass = false;
  return r;
}

async function portalHrm(method, path, body) {
  const url = `${PORTAL}${path.startsWith('/') ? path : `/api/hrm${path}`}`;
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  const data = json?.data ?? json;
  const list = data?.data ?? data?.items ?? (Array.isArray(data) ? data : null);
  return {
    url,
    status: res.status,
    code: json?.code ?? json?.error?.code ?? null,
    data,
    row: data?.id ? data : list?.[0] ?? null,
    total: data?.total ?? (Array.isArray(list) ? list.length : null),
    list: Array.isArray(list) ? list : Array.isArray(data) ? data : data?.data ?? [],
  };
}

const q = `company_id=${COMPANY}`;

// --- Payroll: salary components ---
const scList = record(
  'salary-components-list',
  await portalHrm('GET', `/api/hrm/payroll/salary-components?${q}`),
  { status: 200 },
);
const scCreate = record(
  'salary-components-create',
  await portalHrm('POST', '/api/hrm/payroll/salary-components', {
    company_id: COMPANY,
    code: `QA100SC${stamp}`,
    name: `QA P1-100 component ${stamp}`,
    component_type: 'Lương',
    nature: 'income',
    value_type: 'currency',
  }),
  { status: [200, 201] },
);
const scId = scCreate.data?.id ?? scCreate.row?.id;
if (scId) {
  record(
    'salary-components-patch',
    await portalHrm('PATCH', `/api/hrm/payroll/salary-components/${scId}?${q}`, {
      name: `QA P1-100 component updated ${stamp}`,
    }),
    { status: [200, 201] },
  );
  record(
    'salary-components-delete',
    await portalHrm('DELETE', `/api/hrm/payroll/salary-components/${scId}?${q}`),
    { status: [200, 204] },
  );
} else {
  results.pass = false;
  results.steps.push({ name: 'salary-components-id', pass: false });
}

// --- Payroll: payment batches ---
record(
  'payment-batches-list',
  await portalHrm('GET', `/api/hrm/payroll/payment-batches?${q}`),
  { status: 200 },
);
const pbCreate = record(
  'payment-batches-create',
  await portalHrm('POST', '/api/hrm/payroll/payment-batches', {
    company_id: COMPANY,
    name: `QA P1-100 batch ${stamp}`,
    salary_period: '2026-05',
    payment_method: 'bank_transfer',
  }),
  { status: [200, 201] },
);
const pbId = pbCreate.data?.id ?? pbCreate.row?.id;
if (pbId) {
  record(
    'payment-batches-records-list',
    await portalHrm('GET', `/api/hrm/payroll/payment-batches/${pbId}/records?${q}`),
    { status: 200 },
  );
  record(
    'payment-batches-delete',
    await portalHrm('DELETE', `/api/hrm/payroll/payment-batches/${pbId}?${q}`),
    { status: [200, 204] },
  );
}

// --- Attendance: work shifts ---
record(
  'work-shifts-list',
  await portalHrm('GET', `/api/hrm/attendance/work-shifts?${q}`),
  { status: 200 },
);
const wsCreate = record(
  'work-shifts-create',
  await portalHrm('POST', '/api/hrm/attendance/work-shifts', {
    company_id: COMPANY,
    code: `QA100WS${stamp}`,
    name: `QA shift ${stamp}`,
    start_time: '08:00',
    end_time: '17:00',
  }),
  { status: [200, 201] },
);
const wsId = wsCreate.data?.id ?? wsCreate.row?.id;
if (wsId) {
  record(
    'work-shifts-delete',
    await portalHrm('DELETE', `/api/hrm/attendance/work-shifts/${wsId}?${q}`),
    { status: [200, 204] },
  );
}

// --- Attendance: sheets ---
record(
  'attendance-sheets-list',
  await portalHrm('GET', `/api/hrm/attendance/attendance-sheets?${q}`),
  { status: 200 },
);

// --- Recruitment: job postings create → patch → delete ---
const jpList = await portalHrm('GET', `/api/hrm/recruitment/job-postings?${q}`);
record('job-postings-list', jpList, { status: 200 });
const jpCreate = record(
  'job-postings-create',
  await portalHrm('POST', '/api/hrm/recruitment/job-postings', {
    company_id: COMPANY,
    title: `QA P1-100 posting ${stamp}`,
    position: 'QA Engineer',
    department: 'QA',
    status: 'draft',
  }),
  { status: [200, 201] },
);
const jpId = jpCreate.data?.id ?? jpCreate.row?.id ?? jpList.list?.[0]?.id;
if (jpId) {
  record(
    'job-postings-patch',
    await portalHrm('PATCH', `/api/hrm/recruitment/job-postings/${jpId}?${q}`, {
      title: `QA P1-100 posting updated ${stamp}`,
      status: 'open',
    }),
    { status: [200, 201] },
  );
  if (jpCreate.data?.id ?? jpCreate.row?.id) {
    record(
      'job-postings-delete',
      await portalHrm('DELETE', `/api/hrm/recruitment/job-postings/${jpId}?${q}`),
      { status: [200, 204] },
    );
  }
} else {
  results.steps.push({ name: 'job-postings-patch', pass: false, skip: 'no id' });
  results.pass = false;
}

// --- Recruitment: kanban stage (seed one row if pool empty) ---
function pgClientConfig() {
  const dbUrl = process.env.DATABASE_URL_HRM?.trim();
  if (dbUrl) return { connectionString: dbUrl };
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_HRM ?? 'xevn_hrm',
      ssl: false,
    };
  }
  return null;
}

async function ensurePoolCandidate() {
  const list = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?${q}`);
  if (list.list?.[0]?.id) return list.list[0];
  const cfg = pgClientConfig();
  if (!cfg) return null;
  const { randomUUID } = await import('node:crypto');
  const pg = (await import('pg')).default;
  const client = new pg.Client(cfg);
  await client.connect();
  const id = randomUUID();
  const companyId = 'holding';
  await client.query(
    `INSERT INTO public.candidates (id, company_id, full_name, email, stage, source)
     VALUES ($1::uuid, $2, $3, $4, 'applied', 'qa-smoke')
     ON CONFLICT (id) DO NOTHING`,
    [id, companyId, `QA Pool ${stamp}`, `qa.pool.${stamp}@mail.xe.vn`],
  );
  await client.end();
  return { id, stage: 'applied' };
}

const candRow = await ensurePoolCandidate();
const candList = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?${q}`);
record('candidates-pool-list', candList, { status: 200 });
const candId = candRow?.id ?? candList.list?.[0]?.id;
const prevStage = candRow?.stage ?? candList.list?.[0]?.stage ?? 'applied';
if (candId) {
  const stageR = await portalHrm('PATCH', `/api/hrm/recruitment/candidates-pool/${candId}/stage?${q}`, {
    stage: prevStage === 'interview' ? 'applied' : 'interview',
  });
  record('candidates-pool-stage', stageR, { status: [200, 201] });
  await portalHrm('PATCH', `/api/hrm/recruitment/candidates-pool/${candId}/stage?${q}`, {
    stage: prevStage,
  });
} else {
  results.steps.push({ name: 'candidates-pool-stage', pass: false, skip: 'no candidate / no DATABASE_URL_HRM' });
  results.pass = false;
}

// --- Recruitment: plans create/delete ---
const planCreate = record(
  'recruitment-plans-create',
  await portalHrm('POST', '/api/hrm/recruitment/recruitment-plans', {
    company_id: COMPANY,
    title: `QA P1-100 plan ${stamp}`,
    start_month: 1,
    end_month: 3,
    year: 2026,
    status: 'draft',
    departments: [{ name: 'QA Dept', positions: [{ name: 'QA Role', months: [{ ns: 1, dx: 0 }] }] }],
  }),
  { status: [200, 201] },
);
const planId = planCreate.data?.id ?? planCreate.row?.id ?? planCreate.list?.find?.((p) => p.title?.includes('QA P1-100'))?.id;
if (planId) {
  record(
    'recruitment-plans-delete',
    await portalHrm('DELETE', `/api/hrm/recruitment/recruitment-plans/${planId}?${q}`),
    { status: [200, 204] },
  );
} else {
  results.steps.push({ name: 'recruitment-plans-id', pass: false });
  results.pass = false;
}

// --- Recruitment: interviews catalog ---
const ivList = record(
  'interviews-catalog-list',
  await portalHrm('GET', `/api/hrm/recruitment/interviews-catalog?${q}`),
  { status: 200 },
);
const ivCreate = record(
  'interviews-catalog-create',
  await portalHrm('POST', '/api/hrm/recruitment/interviews-catalog', {
    company_id: COMPANY,
    candidate_name: `QA Interview ${stamp}`,
    interview_date: '2026-05-30',
    interview_time: '10:00',
    status: 'scheduled',
  }),
  { status: [200, 201] },
);
const ivId = ivCreate.data?.id ?? ivCreate.row?.id;
if (ivId) {
  record(
    'interviews-catalog-patch',
    await portalHrm('PATCH', `/api/hrm/recruitment/interviews-catalog/${ivId}?${q}`, {
      status: 'completed',
      result: 'pass',
    }),
    { status: [200, 201] },
  );
  record(
    'interviews-catalog-delete',
    await portalHrm('DELETE', `/api/hrm/recruitment/interviews-catalog/${ivId}?${q}`),
    { status: [200, 204] },
  );
} else if (ivList.list?.[0]?.id) {
  const existingId = ivList.list[0].id;
  record(
    'interviews-catalog-patch-existing',
    await portalHrm('PATCH', `/api/hrm/recruitment/interviews-catalog/${existingId}?${q}`, {
      status: ivList.list[0].status ?? 'scheduled',
    }),
    { status: [200, 201] },
  );
}

results.summary = {
  pass_steps: results.steps.filter((s) => s.pass).length,
  total_steps: results.steps.length,
  sc_list_total: scList.total,
};

console.log(JSON.stringify(results, null, 2));
process.exit(results.pass && results.supabase_hits.length === 0 ? 0 : 1);
