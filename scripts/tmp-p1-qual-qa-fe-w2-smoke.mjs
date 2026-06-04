/**
 * P1-QUAL-QA-FE-W2 — batch-2 hrmApiGap Nest wire smoke via portal :5175.
 * Account: ceo@xe.vn, company_id=main. No 54321 / gap-toast proxy paths.
 */
import { resolve } from 'node:path';
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

const results = { work_item_id: 'P1-QUAL-QA-FE-W2', steps: [], pass: true, supabase_hits: [] };

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

// Resolve employee for profile tabs
const empList = await portalHrm('GET', `/api/hrm/employees?page_size=5&${q}`);
record('employees-list', empList, { status: 200 });
const employeeId = empList.list?.[0]?.id ?? empList.row?.id;
if (!employeeId) {
  results.steps.push({ name: 'employee-id', pass: false, skip: 'no employee row' });
  results.pass = false;
} else {
  const eq = `company_id=${COMPANY}`;
  const base = `/api/hrm/employees/${employeeId}`;

  record('skills-list', await portalHrm('GET', `${base}/skills?${eq}`), { status: 200 });
  const skillCreate = record(
    'skills-create',
    await portalHrm('POST', `${base}/skills?${eq}`, {
      name: `QA W2 skill ${stamp}`,
      category: 'technical',
      level: 50,
    }),
    { status: [200, 201] },
  );
  const skillId = skillCreate.data?.id ?? skillCreate.row?.id;
  if (skillId) {
    record(
      'skills-patch',
      await portalHrm('PATCH', `${base}/skills/${skillId}?${eq}`, { proficiency: 'advanced' }),
      { status: [200, 201] },
    );
    record('skills-delete', await portalHrm('DELETE', `${base}/skills/${skillId}?${eq}`), {
      status: [200, 204],
    });
  }

  record('work-timeline-list', await portalHrm('GET', `${base}/work-timeline?${eq}`), { status: 200 });
  const tlCreate = record(
    'work-timeline-create',
    await portalHrm('POST', `${base}/work-timeline?${eq}`, {
      title: `QA W2 role ${stamp}`,
      event_date: '2024-01-01',
      event_type: 'position',
      status: 'current',
    }),
    { status: [200, 201] },
  );
  const tlId = tlCreate.data?.id ?? tlCreate.row?.id;
  if (tlId) {
    record(
      'work-timeline-patch',
      await portalHrm('PATCH', `${base}/work-timeline/${tlId}?${eq}`, { title: `QA W2 updated ${stamp}` }),
      { status: [200, 201] },
    );
    record('work-timeline-delete', await portalHrm('DELETE', `${base}/work-timeline/${tlId}?${eq}`), {
      status: [200, 204],
    });
  }

  record('resume-files-list', await portalHrm('GET', `${base}/resume-files?${eq}`), { status: 200 });
  const resumeCreate = record(
    'resume-files-create',
    await portalHrm('POST', `${base}/resume-files?${eq}`, {
      name: `qa-w2-${stamp}.pdf`,
      file_url: `stub://qa-w2-${stamp}`,
      file_size: '1024',
    }),
    { status: [200, 201] },
  );
  const resumeId = resumeCreate.data?.id ?? resumeCreate.row?.id;
  if (resumeId) {
    record('resume-files-delete', await portalHrm('DELETE', `${base}/resume-files/${resumeId}?${eq}`), {
      status: [200, 204],
    });
  }

  record('rewards-list', await portalHrm('GET', `${base}/rewards?${eq}`), { status: 200 });
  const rewardCreate = record(
    'rewards-create',
    await portalHrm('POST', `${base}/rewards?${eq}`, {
      title: `QA W2 reward ${stamp}`,
      reward_date: '2026-05-30',
      reward_type: 'bonus',
      amount: 100,
    }),
    { status: [200, 201] },
  );
  const rewardId = rewardCreate.data?.id ?? rewardCreate.row?.id;
  if (rewardId) {
    record('rewards-delete', await portalHrm('DELETE', `${base}/rewards/${rewardId}?${eq}`), {
      status: [200, 204],
    });
  }

  record('discipline-list', await portalHrm('GET', `${base}/discipline?${eq}`), { status: 200 });

  record('training-list', await portalHrm('GET', `${base}/training?${eq}`), { status: 200 });
  const trCreate = record(
    'training-create',
    await portalHrm('POST', `${base}/training?${eq}`, {
      name: `QA W2 training ${stamp}`,
      status: 'planned',
    }),
    { status: [200, 201] },
  );
  const trId = trCreate.data?.id ?? trCreate.row?.id;
  if (trId) {
    record('training-delete', await portalHrm('DELETE', `${base}/training/${trId}?${eq}`), {
      status: [200, 204],
    });
  }
}

// Admin: company members
record('admin-companies-list', await portalHrm('GET', '/api/hrm/admin/companies'), { status: 200 });
const memList = record(
  'company-memberships-list',
  await portalHrm('GET', `/api/hrm/admin/company-memberships?${q}`),
  { status: 200 },
);
const memId = memList.list?.[0]?.id ?? memList.row?.id;
if (memId) {
  record(
    'company-memberships-patch',
    await portalHrm('PATCH', `/api/hrm/admin/company-memberships/${memId}`, { status: 'active' }),
    { status: [200, 201] },
  );
}

// Recruitment: headcount, applications, evaluations, interviews
record(
  'headcount-proposals-list',
  await portalHrm('GET', `/api/hrm/recruitment/headcount-proposals?${q}`),
  { status: 200 },
);
const hcCreate = record(
  'headcount-proposals-create',
  await portalHrm('POST', '/api/hrm/recruitment/headcount-proposals', {
    company_id: COMPANY,
    title: `QA W2 headcount ${stamp}`,
    department: 'QA Dept',
    position_name: `QA Role ${stamp}`,
    requested_headcount: 1,
    current_headcount: 0,
    justification: 'QA W2 smoke',
  }),
  { status: [200, 201] },
);
const hcId = hcCreate.data?.id ?? hcCreate.row?.id;
if (hcId) {
  record(
    'headcount-proposals-status',
    await portalHrm('PATCH', `/api/hrm/recruitment/headcount-proposals/${hcId}/status?${q}`, {
      status: 'approved',
    }),
    { status: [200, 201] },
  );
}

const jpList = await portalHrm('GET', `/api/hrm/recruitment/job-postings?${q}`);
record('job-postings-list', jpList, { status: 200 });
const jobId = jpList.list?.[0]?.id ?? jpList.row?.id;

const candList = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?${q}`);
record('candidates-pool-list', candList, { status: 200 });
const candId = candList.list?.[0]?.id ?? candList.row?.id;

if (jobId && candId) {
  const appCreate = record(
    'candidate-applications-create',
    await portalHrm('POST', '/api/hrm/recruitment/candidate-applications', {
      company_id: COMPANY,
      candidate_id: candId,
      job_posting_id: jobId,
      stage: 'applied',
    }),
    { status: [200, 201] },
  );
  const appId = appCreate.data?.id ?? appCreate.row?.id;
  if (appId) {
    record(
      'candidate-applications-stage',
      await portalHrm('PATCH', `/api/hrm/recruitment/candidate-applications/${appId}/stage?${q}`, {
        stage: 'interview',
      }),
      { status: [200, 201] },
    );
    record(
      'candidate-applications-delete',
      await portalHrm('DELETE', `/api/hrm/recruitment/candidate-applications/${appId}?${q}`),
      { status: [200, 204] },
    );
  }
}

record(
  'candidate-evaluations-list',
  await portalHrm('GET', `/api/hrm/recruitment/candidate-evaluations?${q}${candId ? `&candidate_id=${candId}` : ''}`),
  { status: 200 },
);

const tplList = await portalHrm('GET', `/api/hrm/recruitment/evaluation-criteria-templates?${q}`);
record('evaluation-templates-list', tplList, { status: 200 });

const ivCreate = record(
  'interviews-catalog-create',
  await portalHrm('POST', '/api/hrm/recruitment/interviews-catalog', {
    company_id: COMPANY,
    candidate_name: `QA W2 Interview ${stamp}`,
    interview_date: '2026-05-30',
    interview_time: '14:00',
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
}

results.summary = {
  pass_steps: results.steps.filter((s) => s.pass).length,
  total_steps: results.steps.length,
  employee_id: employeeId ?? null,
};

console.log(JSON.stringify(results, null, 2));
process.exit(results.pass && results.supabase_hits.length === 0 ? 0 : 1);
