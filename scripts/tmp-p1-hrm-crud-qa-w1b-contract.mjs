import { resolve } from 'node:path';
import { loadDeployEnv, loadEnvFile, repoRoot } from './seed-env-loader.mjs';
import { authHeaders, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();
loadEnvFile(resolve(repoRoot, 'apps/api/hrm-api/.env'));

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');
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

const results = {
  work_item_id: 'P1-HRM-CRUD-QA-W1B-CONTRACT',
  account: email,
  portal: PORTAL,
  actions: [],
  pass: true,
};

function clip(value, max = 280) {
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

function pushAction(name, request, response, pass, checks = {}) {
  results.actions.push({
    name,
    request,
    response: {
      endpoint: response.url,
      status: response.status,
      code: response.code,
      message: response.message,
      duration_ms: response.duration_ms,
      body_snippet: response.body_snippet,
    },
    checks,
    verdict: pass ? 'PASS' : 'FAIL',
  });
  if (!pass) results.pass = false;
}

function findCreatedRow(list, marker) {
  return list.find((row) => row.full_name?.includes(marker) || row.email?.includes(marker));
}

const candidateMarker = `QA W1B Candidate ${stamp}`;
const candidateEmail = `qa.w1b.${stamp}@xe.vn`;
const paymentBatchName = `QA W1B Batch ${stamp}`;

const candidateListBefore = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?company_id=${COMPANY_ID}`);

const candidateCreateBody = {
  company_id: COMPANY_ID,
  full_name: candidateMarker,
  email: candidateEmail,
  source: 'qa-contract-sync',
  stage: 'applied',
  phone: '0900000001',
  notes: 'W1B contract sync create candidate from pool',
};
const candidateCreate = await portalHrm('POST', '/api/hrm/recruitment/candidates', candidateCreateBody);
const candidateListAfterCreate = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?company_id=${COMPANY_ID}`);
const createdCandidate = findCreatedRow(candidateListAfterCreate.list, candidateMarker);
const candidateCreatePass =
  candidateCreate.status === 201 &&
  candidateCreate.code === 'HRM-REC-CP-201' &&
  Boolean(createdCandidate?.id);
pushAction(
  'candidate create from pool (without requisition_id)',
  { method: 'POST', path: '/api/hrm/recruitment/candidates', body: candidateCreateBody },
  candidateCreate,
  candidateCreatePass,
  {
    expected_code: 'HRM-REC-CP-201',
    list_before_total: candidateListBefore.total,
    list_after_total: candidateListAfterCreate.total,
    created_candidate_id: createdCandidate?.id ?? null,
    post_action_refresh_consistent: Boolean(createdCandidate?.id),
  },
);

const candidateId = createdCandidate?.id;

let candidateUpdate = {
  url: `${PORTAL}/api/hrm/recruitment/candidates-pool/<missing-id>`,
  status: 0,
  code: 'QA-MISSING-CANDIDATE',
  message: 'Candidate not created',
  body_snippet: '',
  duration_ms: 0,
};
let candidateListAfterUpdate = { list: [], total: null };
if (candidateId) {
  const candidateUpdateBody = {
    full_name: `${candidateMarker} Updated`,
    stage: 'interview',
    notes: 'updated from QA contract sync',
  };
  candidateUpdate = await portalHrm(
    'PATCH',
    `/api/hrm/recruitment/candidates-pool/${candidateId}?company_id=${COMPANY_ID}`,
    candidateUpdateBody,
  );
  candidateListAfterUpdate = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?company_id=${COMPANY_ID}`);
  const updatedRow = candidateListAfterUpdate.list.find((row) => row.id === candidateId);
  pushAction(
    'candidate update via candidates-pool PATCH',
    {
      method: 'PATCH',
      path: `/api/hrm/recruitment/candidates-pool/${candidateId}?company_id=${COMPANY_ID}`,
      body: candidateUpdateBody,
    },
    candidateUpdate,
    candidateUpdate.status === 200 && candidateUpdate.code === 'HRM-REC-CP-200' && updatedRow?.stage === 'interview',
    {
      expected_code: 'HRM-REC-CP-200',
      updated_stage: updatedRow?.stage ?? null,
      updated_name: updatedRow?.full_name ?? null,
      post_action_refresh_consistent: updatedRow?.stage === 'interview',
    },
  );
} else {
  pushAction(
    'candidate update via candidates-pool PATCH',
    { method: 'PATCH', path: '/api/hrm/recruitment/candidates-pool/<candidateId>?company_id=main', body: null },
    candidateUpdate,
    false,
    { defect_id: 'DEF-P1-HRM-CRUD-W1B-001', reason: 'Create action did not return an executable candidate id' },
  );
}

let candidateDelete = {
  url: `${PORTAL}/api/hrm/recruitment/candidates-pool/<missing-id>`,
  status: 0,
  code: 'QA-MISSING-CANDIDATE',
  message: 'Candidate not created',
  body_snippet: '',
  duration_ms: 0,
};
if (candidateId) {
  candidateDelete = await portalHrm(
    'DELETE',
    `/api/hrm/recruitment/candidates-pool/${candidateId}?company_id=${COMPANY_ID}`,
  );
  const candidateListAfterDelete = await portalHrm('GET', `/api/hrm/recruitment/candidates-pool?company_id=${COMPANY_ID}`);
  const deletedStillPresent = candidateListAfterDelete.list.some((row) => row.id === candidateId);
  pushAction(
    'candidate delete via candidates-pool DELETE',
    { method: 'DELETE', path: `/api/hrm/recruitment/candidates-pool/${candidateId}?company_id=${COMPANY_ID}` },
    candidateDelete,
    candidateDelete.status === 200 && candidateDelete.code === 'HRM-REC-CP-200' && !deletedStillPresent,
    {
      expected_code: 'HRM-REC-CP-200',
      still_present_after_delete: deletedStillPresent,
      post_action_refresh_consistent: !deletedStillPresent,
    },
  );
} else {
  pushAction(
    'candidate delete via candidates-pool DELETE',
    { method: 'DELETE', path: '/api/hrm/recruitment/candidates-pool/<candidateId>?company_id=main' },
    candidateDelete,
    false,
    { defect_id: 'DEF-P1-HRM-CRUD-W1B-001', reason: 'Create action did not return an executable candidate id' },
  );
}

const paymentBatchCreate = await portalHrm('POST', '/api/hrm/payroll/payment-batches', {
  company_id: COMPANY_ID,
  name: paymentBatchName,
  salary_period: '2026-06',
  payment_method: 'bank_transfer',
});
const paymentBatchId = paymentBatchCreate.data?.id ?? paymentBatchCreate.list?.[0]?.id ?? null;

let paymentRecordAdd = {
  url: `${PORTAL}/api/hrm/payroll/payment-batches/<missing-id>/records`,
  status: 0,
  code: 'QA-MISSING-BATCH',
  message: 'Payment batch not created',
  body_snippet: '',
  duration_ms: 0,
};
let firstRecordId = null;
if (paymentBatchId) {
  const paymentRecordBody = {
    company_id: COMPANY_ID,
    employee_code: `QA${String(stamp).slice(-6)}`,
    employee_name: 'QA Contract Sync Employee 1',
    amount: 12345000,
    notes: 'W1B add record',
  };
  paymentRecordAdd = await portalHrm(
    'POST',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records`,
    paymentRecordBody,
  );
  const recordsAfterAdd = await portalHrm(
    'GET',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records?company_id=${COMPANY_ID}`,
  );
  const createdRecord =
    recordsAfterAdd.list.find((row) => row.employee_code === paymentRecordBody.employee_code) ?? paymentRecordAdd.data;
  firstRecordId = createdRecord?.id ?? null;
  pushAction(
    'add payment record to batch',
    {
      method: 'POST',
      path: `/api/hrm/payroll/payment-batches/${paymentBatchId}/records`,
      body: paymentRecordBody,
    },
    paymentRecordAdd,
    paymentRecordAdd.status === 201 && paymentRecordAdd.code === 'HRM-PB-201' && Boolean(firstRecordId),
    {
      expected_code: 'HRM-PB-201',
      payment_batch_id: paymentBatchId,
      created_record_id: firstRecordId,
      post_action_refresh_consistent: Boolean(firstRecordId),
      records_total_after_add: recordsAfterAdd.total,
    },
  );
} else {
  pushAction(
    'add payment record to batch',
    { method: 'POST', path: '/api/hrm/payroll/payment-batches/<batchId>/records', body: null },
    paymentRecordAdd,
    false,
    { defect_id: 'DEF-P1-HRM-CRUD-W1B-002', reason: 'Could not create payment batch prerequisite' },
  );
}

let processOne = {
  url: `${PORTAL}/api/hrm/payroll/payment-batches/<missing-id>/records/<missing-id>/process`,
  status: 0,
  code: 'QA-MISSING-RECORD',
  message: 'Payment record not found',
  body_snippet: '',
  duration_ms: 0,
};
if (paymentBatchId && firstRecordId) {
  processOne = await portalHrm(
    'POST',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records/${firstRecordId}/process?company_id=${COMPANY_ID}`,
    { transaction_ref: `QA-TX-${stamp}`, notes: 'single process from QA' },
  );
  const recordsAfterProcessOne = await portalHrm(
    'GET',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records?company_id=${COMPANY_ID}`,
  );
  const processedRow = recordsAfterProcessOne.list.find((row) => row.id === firstRecordId);
  pushAction(
    'process one payment record',
    {
      method: 'POST',
      path: `/api/hrm/payroll/payment-batches/${paymentBatchId}/records/${firstRecordId}/process?company_id=${COMPANY_ID}`,
      body: { transaction_ref: `QA-TX-${stamp}`, notes: 'single process from QA' },
    },
    processOne,
    [200, 201].includes(processOne.status) && processOne.code === 'HRM-PB-202' && processedRow?.status === 'paid',
    {
      expected_code: 'HRM-PB-202',
      processed_record_status: processedRow?.status ?? null,
      post_action_refresh_consistent: processedRow?.status === 'paid',
    },
  );
} else {
  pushAction(
    'process one payment record',
    { method: 'POST', path: '/api/hrm/payroll/payment-batches/<batchId>/records/<recordId>/process?company_id=main' },
    processOne,
    false,
    { defect_id: 'DEF-P1-HRM-CRUD-W1B-003', reason: 'No record id for single-process action' },
  );
}

let secondRecordId = null;
if (paymentBatchId) {
  const secondRecordBody = {
    company_id: COMPANY_ID,
    employee_code: `QB${String(stamp).slice(-6)}`,
    employee_name: 'QA Contract Sync Employee 2',
    amount: 9876000,
    notes: 'W1B add second record for process-all',
  };
  const secondRecordAdd = await portalHrm(
    'POST',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records`,
    secondRecordBody,
  );
  const recordsAfterSecondAdd = await portalHrm(
    'GET',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records?company_id=${COMPANY_ID}`,
  );
  secondRecordId =
    recordsAfterSecondAdd.list.find((row) => row.employee_code === secondRecordBody.employee_code)?.id ??
    secondRecordAdd.data?.id ??
    null;
}

let processAll = {
  url: `${PORTAL}/api/hrm/payroll/payment-batches/<missing-id>/process`,
  status: 0,
  code: 'QA-MISSING-BATCH',
  message: 'Payment batch not found',
  body_snippet: '',
  duration_ms: 0,
};
if (paymentBatchId) {
  processAll = await portalHrm(
    'POST',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/process?company_id=${COMPANY_ID}`,
    { transaction_ref: `QA-TX-ALL-${stamp}`, notes: 'process all from QA' },
  );
  const recordsAfterProcessAll = await portalHrm(
    'GET',
    `/api/hrm/payroll/payment-batches/${paymentBatchId}/records?company_id=${COMPANY_ID}`,
  );
  const secondRow = secondRecordId ? recordsAfterProcessAll.list.find((row) => row.id === secondRecordId) : null;
  const unpaidCount = recordsAfterProcessAll.list.filter((row) => row.status !== 'paid').length;
  pushAction(
    'process all records in batch',
    {
      method: 'POST',
      path: `/api/hrm/payroll/payment-batches/${paymentBatchId}/process?company_id=${COMPANY_ID}`,
      body: { transaction_ref: `QA-TX-ALL-${stamp}`, notes: 'process all from QA' },
    },
    processAll,
    [200, 201].includes(processAll.status) &&
      processAll.code === 'HRM-PB-202' &&
      unpaidCount === 0 &&
      (secondRow?.status === 'paid' || secondRecordId === null),
    {
      expected_code: 'HRM-PB-202',
      records_total_after_process_all: recordsAfterProcessAll.total,
      unpaid_count_after_process_all: unpaidCount,
      second_record_id: secondRecordId,
      second_record_status: secondRow?.status ?? null,
      post_action_refresh_consistent: unpaidCount === 0,
    },
  );
} else {
  pushAction(
    'process all records in batch',
    { method: 'POST', path: '/api/hrm/payroll/payment-batches/<batchId>/process?company_id=main' },
    processAll,
    false,
    { defect_id: 'DEF-P1-HRM-CRUD-W1B-002', reason: 'Could not create payment batch prerequisite' },
  );
}

if (paymentBatchId) {
  await portalHrm('DELETE', `/api/hrm/payroll/payment-batches/${paymentBatchId}?company_id=${COMPANY_ID}`);
}

results.summary = {
  total_actions: results.actions.length,
  passed_actions: results.actions.filter((item) => item.verdict === 'PASS').length,
  failed_actions: results.actions.filter((item) => item.verdict === 'FAIL').length,
};

console.log(JSON.stringify(results, null, 2));
process.exit(results.pass ? 0 : 1);
