import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDeployEnv, loadEnvFile, repoRoot } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
loadEnvFile(resolve(repoRoot, 'apps/api/hrm-api/.env'));

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173').replace(/\/+$/, '');
const COMPANY_ID = 'main';
const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const stamp = Date.now();

const session = await portalLogin(email, password);
const headers = {
  ...authHeaders(session),
  accept: 'application/json',
  'content-type': 'application/json',
};

function clip(value, max = 320) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max)}...`;
}

async function portalHrm(method, path, body) {
  const url = `${PORTAL}${path.startsWith('/') ? path : `/api/hrm${path}`}`;
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const startedAt = Date.now();
  const res = await fetch(url, init);
  const durationMs = Date.now() - startedAt;
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
    message: json?.message ?? json?.error?.message ?? null,
    body_snippet: clip(json),
    duration_ms: durationMs,
    data,
    list: Array.isArray(list) ? list : Array.isArray(data) ? data : [],
    total: data?.total ?? (Array.isArray(list) ? list.length : null),
  };
}

const checks = [];

function isExpectedScopeReject(result) {
  return result.status === 409 && result.code === 'SCOPE_CONTEXT_MISMATCH';
}

function pushCheck(module, action, request, response, pass, extra = {}) {
  checks.push({
    module,
    action,
    request,
    response: {
      endpoint: response.url,
      status: response.status,
      code: response.code,
      message: response.message,
      duration_ms: response.duration_ms,
      body_snippet: response.body_snippet,
    },
    verdict: pass ? 'PASS' : 'FAIL',
    ...extra,
  });
}

const contractName = `QA C-W2QC contract ${stamp}`;
const contractCode = `QACW2-${String(stamp).slice(-6)}`;
const settingsName = `QA C-W2QC setting ${stamp}`;
const settingsCode = `QACW2SET-${String(stamp).slice(-6)}`;

const contractsBefore = await portalHrm('GET', `/api/hrm/contracts-insurance/contracts?company_id=${COMPANY_ID}`);
const contractCreate = await portalHrm('POST', '/api/hrm/contracts-insurance/contracts', {
  company_id: COMPANY_ID,
  contract_code: contractCode,
  employee_name: contractName,
  contract_type: 'labor_contract',
  start_date: '2026-07-01',
  end_date: '2027-06-30',
  salary: 15000000,
});
const contractsAfterCreate = await portalHrm('GET', `/api/hrm/contracts-insurance/contracts?company_id=${COMPANY_ID}`);
const createdContract =
  contractsAfterCreate.list.find((row) => row.contract_code === contractCode || row.employee_name === contractName) ?? null;
pushCheck(
  'contracts-insurance',
  'C',
  { method: 'POST', path: '/api/hrm/contracts-insurance/contracts' },
  contractCreate,
  contractCreate.status === 201 && ['HRM-CON-201', 'HRM-CONTRACT-201'].includes(contractCreate.code ?? '') && Boolean(createdContract?.id),
  { list_before_total: contractsBefore.total, list_after_total: contractsAfterCreate.total, created_id: createdContract?.id ?? null },
);

const contractId = createdContract?.id;
let contractRead = { url: `${PORTAL}/api/hrm/contracts-insurance/contracts/<missing>`, status: 0, code: 'QA-MISSING', message: '', body_snippet: '', duration_ms: 0 };
if (contractId) {
  contractRead = await portalHrm('GET', `/api/hrm/contracts-insurance/contracts/${contractId}?company_id=${COMPANY_ID}`);
}
pushCheck(
  'contracts-insurance',
  'R',
  { method: 'GET', path: `/api/hrm/contracts-insurance/contracts/${contractId ?? '<missing>'}?company_id=main` },
  contractRead,
  contractRead.status === 200 && ['HRM-CON-200', 'HRM-CONTRACT-200'].includes(contractRead.code ?? ''),
);

let contractUpdate = { url: `${PORTAL}/api/hrm/contracts-insurance/contracts/<missing>`, status: 0, code: 'QA-MISSING', message: '', body_snippet: '', duration_ms: 0 };
if (contractId) {
  contractUpdate = await portalHrm('PATCH', `/api/hrm/contracts-insurance/contracts/${contractId}?company_id=${COMPANY_ID}`, {
    salary: 17000000,
    notes: 'updated by QA C-W2QC-01',
  });
}
pushCheck(
  'contracts-insurance',
  'U',
  { method: 'PATCH', path: `/api/hrm/contracts-insurance/contracts/${contractId ?? '<missing>'}?company_id=main` },
  contractUpdate,
  contractUpdate.status === 200 && ['HRM-CON-202', 'HRM-CONTRACT-202', 'HRM-CON-200'].includes(contractUpdate.code ?? ''),
);

const contractScopeNegative = await portalHrm('GET', `/api/hrm/contracts-insurance/contracts?company_id=holding`);
pushCheck(
  'contracts-insurance',
  'NEG-R-SCOPE',
  { method: 'GET', path: '/api/hrm/contracts-insurance/contracts?company_id=holding' },
  contractScopeNegative,
  isExpectedScopeReject(contractScopeNegative),
);

let contractDelete = { url: `${PORTAL}/api/hrm/contracts-insurance/contracts/<missing>`, status: 0, code: 'QA-MISSING', message: '', body_snippet: '', duration_ms: 0 };
if (contractId) {
  contractDelete = await portalHrm('DELETE', `/api/hrm/contracts-insurance/contracts/${contractId}?company_id=${COMPANY_ID}`);
}
pushCheck(
  'contracts-insurance',
  'D',
  { method: 'DELETE', path: `/api/hrm/contracts-insurance/contracts/${contractId ?? '<missing>'}?company_id=main` },
  contractDelete,
  [200, 204].includes(contractDelete.status),
);

const insuranceList = await portalHrm('GET', `/api/hrm/contracts-insurance/insurance-policy-participants?company_id=${COMPANY_ID}`);
pushCheck(
  'insurance',
  'R',
  { method: 'GET', path: '/api/hrm/contracts-insurance/insurance-policy-participants?company_id=main' },
  insuranceList,
  insuranceList.status === 200 && ['HRM-INS-200', 'HRM-CON-200'].includes(insuranceList.code ?? ''),
  { note: 'Policy participants exposed as read-only in current API surface' },
);

const insuranceScopeNegative = await portalHrm('GET', `/api/hrm/contracts-insurance/insurance-policy-participants?company_id=holding`);
pushCheck(
  'insurance',
  'NEG-R-SCOPE',
  { method: 'GET', path: '/api/hrm/contracts-insurance/insurance-policy-participants?company_id=holding' },
  insuranceScopeNegative,
  isExpectedScopeReject(insuranceScopeNegative),
);

const decisionsBefore = await portalHrm('GET', `/api/hrm/decisions?company_id=${COMPANY_ID}&page_size=20`);
const decisionCreate = await portalHrm('POST', '/api/hrm/decisions', {
  company_id: COMPANY_ID,
  employee_id: null,
  employee_name: `QA Decision ${stamp}`,
  decision_type: 'promotion',
  decision_date: '2026-07-01',
  reason: 'QA CRUD matrix close',
});
const decisionsAfterCreate = await portalHrm('GET', `/api/hrm/decisions?company_id=${COMPANY_ID}&page_size=20`);
const createdDecision =
  decisionsAfterCreate.list.find((row) => row.employee_name?.includes(`QA Decision ${stamp}`)) ??
  decisionCreate.data ??
  null;
pushCheck(
  'decisions',
  'C',
  { method: 'POST', path: '/api/hrm/decisions' },
  decisionCreate,
  decisionCreate.status === 201 && ['HRM-DEC-201', 'HRM-DECISION-201'].includes(decisionCreate.code ?? '') && Boolean(createdDecision?.id),
  { list_before_total: decisionsBefore.total, list_after_total: decisionsAfterCreate.total, created_id: createdDecision?.id ?? null },
);

const decisionId = createdDecision?.id;
let decisionRead = { url: `${PORTAL}/api/hrm/decisions/<missing>`, status: 0, code: 'QA-MISSING', message: '', body_snippet: '', duration_ms: 0 };
if (decisionId) {
  decisionRead = await portalHrm('GET', `/api/hrm/decisions/${decisionId}?company_id=${COMPANY_ID}`);
}
pushCheck(
  'decisions',
  'R',
  { method: 'GET', path: `/api/hrm/decisions/${decisionId ?? '<missing>'}?company_id=main` },
  decisionRead,
  decisionRead.status === 200 && ['HRM-DEC-200', 'HRM-DECISION-200'].includes(decisionRead.code ?? ''),
);

let decisionUpdate = { url: `${PORTAL}/api/hrm/decisions/<missing>`, status: 0, code: 'QA-MISSING', message: '', body_snippet: '', duration_ms: 0 };
if (decisionId) {
  decisionUpdate = await portalHrm('PATCH', `/api/hrm/decisions/${decisionId}?company_id=${COMPANY_ID}`, {
    reason: 'QA decision update',
  });
}
pushCheck(
  'decisions',
  'U',
  { method: 'PATCH', path: `/api/hrm/decisions/${decisionId ?? '<missing>'}?company_id=main` },
  decisionUpdate,
  decisionUpdate.status === 200 && ['HRM-DEC-202', 'HRM-DECISION-202', 'HRM-DEC-200'].includes(decisionUpdate.code ?? ''),
);

const decisionScopeNegative = await portalHrm('GET', `/api/hrm/decisions?company_id=holding&page_size=20`);
pushCheck(
  'decisions',
  'NEG-R-SCOPE',
  { method: 'GET', path: '/api/hrm/decisions?company_id=holding&page_size=20' },
  decisionScopeNegative,
  isExpectedScopeReject(decisionScopeNegative),
);

let decisionDelete = { url: `${PORTAL}/api/hrm/decisions/<missing>`, status: 0, code: 'QA-MISSING', message: '', body_snippet: '', duration_ms: 0 };
if (decisionId) {
  decisionDelete = await portalHrm('DELETE', `/api/hrm/decisions/${decisionId}?company_id=${COMPANY_ID}`);
}
pushCheck(
  'decisions',
  'D',
  { method: 'DELETE', path: `/api/hrm/decisions/${decisionId ?? '<missing>'}?company_id=main` },
  decisionDelete,
  [200, 204].includes(decisionDelete.status),
);

const settingsBefore = await portalHrm('GET', `/api/hrm/settings-catalogs?company_id=${COMPANY_ID}`);
const settingsCreate = await portalHrm('POST', '/api/hrm/settings-catalogs/items', {
  company_id: COMPANY_ID,
  category_key: 'job_levels',
  item_key: settingsCode,
  item_name: settingsName,
  item_value: settingsName,
  metadata: { source: 'qa-c-w2qc-01' },
});
const settingsAfterCreate = await portalHrm('GET', `/api/hrm/settings-catalogs?company_id=${COMPANY_ID}`);
const createdItem = settingsAfterCreate.list.find((row) => row.item_key === settingsCode || row.item_name === settingsName) ?? null;
pushCheck(
  'settings/admin',
  'C',
  { method: 'POST', path: '/api/hrm/settings-catalogs/items' },
  settingsCreate,
  [200, 201].includes(settingsCreate.status) && ['HRM-CAT-201', 'HRM-SET-201', 'HRM-CATALOG-201'].includes(settingsCreate.code ?? ''),
  { list_before_total: settingsBefore.total, list_after_total: settingsAfterCreate.total, created_item: createdItem?.item_key ?? null },
);

const settingsRead = await portalHrm('GET', `/api/hrm/settings-catalogs?company_id=${COMPANY_ID}`);
pushCheck(
  'settings/admin',
  'R',
  { method: 'GET', path: '/api/hrm/settings-catalogs?company_id=main' },
  settingsRead,
  settingsRead.status === 200 && ['HRM-CAT-200', 'HRM-SET-200', 'HRM-CATALOG-200'].includes(settingsRead.code ?? ''),
);

const settingsUpdate = await portalHrm('PATCH', '/api/hrm/settings-catalogs/items', {
  company_id: COMPANY_ID,
  category_key: 'job_levels',
  item_key: settingsCode,
  item_name: `${settingsName} Updated`,
  item_value: `${settingsName} Updated`,
});
pushCheck(
  'settings/admin',
  'U',
  { method: 'PATCH', path: '/api/hrm/settings-catalogs/items' },
  settingsUpdate,
  settingsUpdate.status === 200 && ['HRM-CAT-202', 'HRM-SET-202', 'HRM-CATALOG-202', 'HRM-CAT-200'].includes(settingsUpdate.code ?? ''),
);

const settingsScopeNegative = await portalHrm('GET', '/api/hrm/settings-catalogs?company_id=holding');
pushCheck(
  'settings/admin',
  'NEG-R-HOLDING-POLICY',
  { method: 'GET', path: '/api/hrm/settings-catalogs?company_id=holding' },
  settingsScopeNegative,
  settingsScopeNegative.status === 200 &&
    ['HRM-CAT-200', 'HRM-SET-200', 'HRM-CATALOG-200'].includes(settingsScopeNegative.code ?? ''),
  { policy: 'D16-FROZEN-ALLOW-200' },
);

const settingsDelete = await portalHrm('DELETE', '/api/hrm/settings-catalogs/items', {
  company_id: COMPANY_ID,
  category_key: 'job_levels',
  item_key: settingsCode,
});
pushCheck(
  'settings/admin',
  'D',
  { method: 'DELETE', path: '/api/hrm/settings-catalogs/items' },
  settingsDelete,
  [200, 204].includes(settingsDelete.status),
);

const output = {
  work_item_id: 'C-W2QC-01-CRUD-MATRIX-CLOSE',
  account: email,
  portal: PORTAL,
  executed_at: new Date().toISOString(),
  checks,
};

const outDir = resolve(repoRoot, 'docs/qa/evidence');
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'c-w2qc-01-crud-matrix-close-20260602-run.json');
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(JSON.stringify(output, null, 2));
const failed = checks.filter((c) => c.verdict !== 'PASS');
process.exit(failed.length === 0 ? 0 : 1);
