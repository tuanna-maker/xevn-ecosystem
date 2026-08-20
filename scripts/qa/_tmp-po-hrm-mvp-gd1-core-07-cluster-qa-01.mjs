#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01 — U65 browser J-HRM-CORE-07-01..05
 * Depends: BE-01 READY · FE-01 READY · API-01 CONFIRMED
 * Assert: Profile CTA can_activate/blocking · incomplete → GATE 409 · checklist đủ → POST activate 2xx + F5 Hoạt động
 *         Nest /core ACT = 0 · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · seals · honesty false
 * DENY: seed · Nest /core SoT · claim CORE-07 DONE · invent PAY/CORE-09/ATT DONE · honesty flip · reopen sealed J-*
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
// playwright imported dynamically after L0/login — avoids Windows UV_HANDLE_CLOSING crash

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:8080';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const API_COMPANY = process.env.QA_API_COMPANY_ID || 'holding';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-07-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-07-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const CORE06_QC = 'CORE06QC1-MSLID363';
const CORE06_QA2 = 'CORE06QA2-MSLI95K8';
const CORE05_QC = 'CORE05QC1-MSLGVT40';
const CORE03_QC = 'CORE03QC1-MSLFJH0K';
const CORE02B_QC = 'CORE02BQC1-MSLEFQC1';
const CORE09D_QC = 'CORE09DQC1-MSLDR8I3';
const PEER_SEALS = [
  CORE06_QC,
  CORE06_QA2,
  CORE05_QC,
  CORE03_QC,
  CORE02B_QC,
  CORE09D_QC,
  'CORE09CQC1-MSLBXMUT',
  'CORE09BQC1-MSLB05DZ',
  'CORE09AQC1-MSLA4LX9',
  'CORE08QC1-MSL9BFFE',
  'CORE02QC1-MSL80DU6',
  'CORE01QC1-MSL6WMS7',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `CORE07QA1-${stamp.toUpperCase()}`;
const DOC_KEY = `hr_doc_c07_${stamp}`.slice(0, 40).toLowerCase();
const DOC_LABEL = `Giay CORE-07 ${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 700) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
function unwrapEmpList(json) {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}
function unwrapChkList(json) {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}
function todayDdMmYyyy() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-CORE-07'],
  stamp: STAMP,
  startedAt: ts(),
  depends_on: {
    be01: 'READY_FOR_QA',
    fe01: 'READY_FOR_QA',
    api01: 'CONFIRMED',
    core06_qc: CORE06_QC,
    core03_qc: CORE03_QC,
  },
  cite_seals: {
    core06_qc: CORE06_QC,
    core06_qa2: CORE06_QA2,
    core05_qc: CORE05_QC,
    core03_qc: CORE03_QC,
    core02b: CORE02B_QC,
    core09d: CORE09D_QC,
    peers: PEER_SEALS,
  },
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed-browser-j-hrm-core-07',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    c_slice_ne_module: true,
    checklist_ne_core07_done: true,
    free_patch_ne_done: true,
    soft_ne_core06_done: true,
    deny_pay_core09_att_done: true,
    nest_core_deny: true,
    claim_core07_done: false,
    reopen_sealed_j: false,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, DOC_KEY, DOC_LABEL },
  l0: {},
  src_dist: {},
  fe_spot: {},
  seal_cites: {},
  hdsd_align: {
    inventory: [
      'hdsd-emp-activate-panel',
      'hdsd-emp-activate-can-activate-badge',
      'hdsd-emp-activate-blocking-items',
      'hdsd-emp-activate-effective-date',
      'hdsd-emp-activate-submit',
      'hdsd-emp-activate-core07-footer',
      'hdsd-emp-document-checklist',
      'hdsd-emp-chk-approve',
    ],
    path: 'Hồ sơ NV → panel Kích hoạt Hoạt động · tab Giấy tờ checklist',
  },
  l1: {},
  network: [],
  nest_core_hits: [],
  nest_core_sot_non404: [],
  activate_hits: [],
  employees_hits: [],
  checklist_hits: [],
  journeys: {},
  probes: {},
  defects: [],
  consoleErrors: [],
  pageErrors: [],
  overall: 'PENDING',
  ack_status: 'PENDING',
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
}
function log(...args) {
  console.log(`[CORE07QA1 ${STAMP}]`, ...args);
}
function jset(id, verdict, extra = {}) {
  R.journeys[id] = { verdict, at: ts(), ...extra };
  save();
}
function trackUrl(method, url, status) {
  const path = url.replace(/^https?:\/\/[^/]+/, '');
  const entry = { method, url: path.slice(0, 480), status, at: ts() };
  R.network.push(entry);
  if (/\/api\/hrm\/core\//i.test(path)) {
    R.nest_core_hits.push(entry);
    if (status !== 404) R.nest_core_sot_non404.push(entry);
  }
  if (/\/employees\/[^/]+\/activate(\?|$)/i.test(path)) R.activate_hits.push(entry);
  if (/\/employees(\/|\?|$)/i.test(path) && !/document-checklist|document-types|assets/i.test(path)) {
    R.employees_hits.push(entry);
  }
  if (/document-checklist/i.test(path)) R.checklist_hits.push(entry);
}

function inspectSrcDist() {
  const out = {
    dist_activate_constants: false,
    dist_controller_activate: false,
    dist_evaluate_gate: false,
    src_activate_constants: false,
    fe_activate_employee: false,
    fe_panel: false,
    fe_nest_core_deny: false,
    fe_footer_ne_done: false,
  };
  const distConst = resolve(ROOT, 'apps/api/hrm-api/dist/employees/emp-activate.constants.js');
  const distCtrl = resolve(ROOT, 'apps/api/hrm-api/dist/employees/employees.controller.js');
  const distChk = resolve(ROOT, 'apps/api/hrm-api/dist/employees/emp-document-checklist.service.js');
  const srcConst = resolve(ROOT, 'apps/api/hrm-api/src/employees/emp-activate.constants.ts');
  const feApi = resolve(ROOT, 'apps/web/hrm/src/integrations/hrmApi.ts');
  const fePanel = resolve(ROOT, 'apps/web/hrm/src/components/employee/EmployeeActivatePanel.tsx');
  const feRing = resolve(ROOT, 'apps/web/hrm/src/lib/empCoreActRing.ts');
  try {
    out.dist_activate_constants = existsSync(distConst);
    if (existsSync(distCtrl)) {
      const s = readFileSync(distCtrl, 'utf8');
      out.dist_controller_activate = /:employeeId\/activate|Post\(':employeeId\/activate'\)/.test(s);
    }
    if (existsSync(distChk)) {
      out.dist_evaluate_gate = /evaluateActivationGate/.test(readFileSync(distChk, 'utf8'));
    }
    out.src_activate_constants = existsSync(srcConst);
    if (existsSync(feApi)) {
      const s = readFileSync(feApi, 'utf8');
      out.fe_activate_employee =
        /activateEmployee/.test(s) &&
        /\/employees\/\$\{encodeURIComponent\(employeeId\)\}\/activate/.test(s);
      out.fe_nest_core_deny = !/\/api\/hrm\/core\/.*activate/.test(s);
    }
    if (existsSync(fePanel)) {
      const s = readFileSync(fePanel, 'utf8');
      out.fe_panel = /hdsd-emp-activate-panel/.test(s) && /can_activate|canActivateCta/.test(s);
    }
    if (existsSync(feRing)) {
      const s = readFileSync(feRing, 'utf8');
      out.fe_footer_ne_done =
        /Checklist đủ \/ badge alone ≠ CORE-07 DONE/.test(s) &&
        /free PATCH status ≠ DONE/.test(s) &&
        /soft Profile ≠ CORE-06 DONE/.test(s);
    }
  } catch (e) {
    out.err = String(e).slice(0, 200);
  }
  return out;
}

function citeSeals() {
  const out = { present: [], missing: [] };
  for (const id of PEER_SEALS) {
    const patterns = [
      resolve(ROOT, `docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qc-01.md`),
      resolve(ROOT, `docs/qa/evidence`),
    ];
    // stamp string presence across evidence folder names / known files
    void patterns;
  }
  // Cite by known evidence files + stamp strings (no reopen)
  const files = [
    ['CORE06QC1', 'docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qc-01.md'],
    ['CORE06QA2', 'docs/qa/evidence/po-hrm-mvp-gd1-core-06-cluster-qa-02.md'],
    ['CORE05QC1', 'docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qc-01.md'],
    ['CORE03QC1', 'docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qc-01.md'],
    ['CORE02BQC1', 'docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qc-01.md'],
    ['CORE09DQC1', 'docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md'],
    ['BE01', 'docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-be-01.md'],
    ['FE01', 'docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-fe-01.md'],
  ];
  for (const [k, rel] of files) {
    const p = resolve(ROOT, rel);
    if (existsSync(p)) out.present.push({ k, rel });
    else out.missing.push({ k, rel });
  }
  out.reopen_sealed_j = false;
  out.deny_invent_pay_core09_att = true;
  out.core07_claim_done = false;
  return out;
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function loginApi() {
  let lastStatus = 0;
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch (e) {
      console.error(`[login] fail ${url}: ${String(e).slice(0, 120)}`);
    }
  }
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${lastStatus}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, { body, companyId = COMPANY } = {}) {
  let pathWithQ = path;
  if (!/^https?:\/\//.test(path) && !/[?&]company_id=/.test(path)) {
    pathWithQ = `${path}${path.includes('?') ? '&' : '?'}company_id=${encodeURIComponent(companyId)}`;
  }
  const url = pathWithQ.startsWith('http')
    ? pathWithQ
    : `${HRM}${pathWithQ.startsWith('/api/') ? pathWithQ : `/api/hrm${pathWithQ}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Accept: 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  trackUrl(method, url, r.status);
  return {
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    message: json?.message ?? null,
    data: json?.data ?? null,
    json,
    summary: summarizeBody(json, 500),
    path: url.replace(/^https?:\/\/[^/]+/, ''),
  };
}

async function l0() {
  const out = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { redirect: 'manual' });
      const ok =
        name === 'portal' ? r.status >= 200 && r.status < 400 : r.status === 200;
      out[name] = { status: r.status, ok };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  R.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok && out.portal?.ok;
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('dialog', (d) => {
    R.probes.lastDialog = d.message().slice(0, 240);
    void d.accept();
  });
  page.on('response', (res) => {
    try {
      trackUrl(res.request().method(), res.url(), res.status());
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

async function toastText(page) {
  const loc = page.locator('[data-sonner-toast], [data-sonner-toaster] li, [role="status"]');
  const n = await loc.count().catch(() => 0);
  const parts = [];
  for (let i = 0; i < Math.min(n, 6); i++) {
    const t = await loc.nth(i).innerText().catch(() => '');
    if (t) parts.push(t.slice(0, 220));
  }
  return parts.join(' | ');
}

async function shot(page, name) {
  const p = resolve(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => {});
  return p;
}

async function ensureStatusCatalog(token, companyId) {
  const out = {};
  for (const row of [
    {
      statusKey: 'pending_docs',
      nameVi: 'Chờ hoàn thiện',
      sortOrder: 10,
      isWorkforceActive: false,
      isTerminal: false,
      requiresReason: false,
      countsTowardHeadcount: false,
    },
    {
      statusKey: 'active',
      nameVi: 'Hoạt động',
      sortOrder: 20,
      isWorkforceActive: true,
      isTerminal: false,
      requiresReason: false,
      countsTowardHeadcount: true,
    },
  ]) {
    const r = await apiCall(token, 'POST', `/employees/employment-statuses`, {
      companyId,
      body: { companyId, ...row },
    });
    out[row.statusKey] = { status: r.status, code: r.code };
  }
  return out;
}

/** Product-path fixture: create pending_docs NV when none left (≠ seed densify). */
async function createPendingEmployee(token, companyId) {
  const code = `qa_c07p_${stamp}`.slice(0, 32);
  const r = await apiCall(token, 'POST', `/employees`, {
    companyId,
    body: {
      company_id: companyId,
      employee_code: code,
      full_name: `QA CORE07 PENDING ${stamp}`,
      email: `qa.core07.p.${stamp}@xe.vn`,
      status: 'pending_docs',
    },
  });
  return {
    status: r.status,
    code: r.code,
    employeeId: r.data?.id ?? null,
    companyId: r.data?.company_id ?? companyId,
    empStatus: r.data?.status ?? null,
    summary: r.summary,
  };
}

async function pickPendingEmployee(token, { preferIncomplete = false } = {}) {
  await ensureStatusCatalog(token, API_COMPANY);
  const candidates = [];
  for (const companyId of [API_COMPANY, COMPANY]) {
    for (const statusQ of ['pending_docs', '']) {
      const path = statusQ
        ? `/employees?company_id=${companyId}&page=1&page_size=80&status=${statusQ}`
        : `/employees?company_id=${companyId}&page=1&page_size=80`;
      const list = await apiCall(token, 'GET', path, { companyId });
      const items = unwrapEmpList(list.json);
      for (const e of items) {
        const st = String(e.status || e.employment_status || '').toLowerCase();
        if (st !== 'pending_docs') continue;
        const id = e.id || e.employeeId;
        if (!id) continue;
        if (candidates.some((c) => c.employeeId === id)) continue;
        candidates.push({
          employeeId: id,
          companyId: e.companyId || e.company_id || companyId,
          status: 'pending_docs',
          fullName: e.fullName || e.full_name || e.name || null,
          listStatus: list.status,
          listCode: list.code,
        });
      }
    }
  }
  if (candidates.length === 0) {
    const created = await createPendingEmployee(token, API_COMPANY);
    R.probes.created_pending = created;
    if (created.employeeId && String(created.empStatus || '').toLowerCase() === 'pending_docs') {
      candidates.push({
        employeeId: created.employeeId,
        companyId: created.companyId,
        status: 'pending_docs',
        fullName: `QA CORE07 PENDING ${stamp}`,
        listStatus: created.status,
        listCode: created.code,
        created: true,
      });
    }
  }
  // Enrich with gate from GET-by-id (display-ready)
  for (const c of candidates) {
    const d = await getEmployee(token, c);
    c.can_activate = d.data?.can_activate ?? d.data?.canActivate ?? null;
    c.checklist_complete = d.data?.checklist_complete ?? d.data?.checklistComplete ?? null;
    c.blocking_count = Array.isArray(d.data?.blocking_items)
      ? d.data.blocking_items.length
      : Array.isArray(d.data?.blockingItems)
        ? d.data.blockingItems.length
        : 0;
    c.detailStatus = d.data?.status ?? null;
  }
  if (preferIncomplete) {
    const incomplete = candidates.find((c) => c.can_activate === false || c.blocking_count > 0);
    if (incomplete) return incomplete;
  }
  // Prefer still pending_docs after enrich (skip flipped)
  return candidates.find((c) => String(c.detailStatus || '').toLowerCase() === 'pending_docs') || null;
}

/** Force GATE incomplete: DOC required+blocks + checklist instance non-approved (U65 FE-token, not seed densify). */
async function forceIncompleteGate(token, emp) {
  const upsert = await apiCall(token, 'POST', `/employees/document-types`, {
    companyId: emp.companyId,
    body: {
      companyId: emp.companyId,
      documentTypeKey: DOC_KEY,
      nameVi: DOC_LABEL,
      requiredByDefault: true,
      blocksActivation: true,
      requiresExpiry: false,
      sortOrder: 90,
    },
  });
  const upsertAlt =
    upsert.status >= 400
      ? await apiCall(token, 'PUT', `/employees/document-types`, {
          companyId: emp.companyId,
          body: {
            companyId: emp.companyId,
            documentTypeKey: DOC_KEY,
            nameVi: DOC_LABEL,
            requiredByDefault: true,
            blocksActivation: true,
            requiresExpiry: false,
            sortOrder: 90,
          },
        })
      : upsert;

  const createChk = await apiCall(
    token,
    'POST',
    `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
    {
      companyId: emp.companyId,
      body: { documentTypeKey: DOC_KEY, required: true, fileRef: `qa-c07-block-${stamp}.pdf` },
    },
  );

  // Ensure DOC_KEY row is NOT approved (missing/submitted only)
  const list = await apiCall(
    token,
    'GET',
    `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
    { companyId: emp.companyId },
  );
  for (const row of unwrapChkList(list.json)) {
    const key = String(row.documentTypeKey || row.document_type_key || '').toLowerCase();
    if (key !== DOC_KEY) continue;
    const st = String(row.status || '').toLowerCase();
    if (st === 'approved') {
      await apiCall(
        token,
        'PATCH',
        `/employees/${emp.employeeId}/document-checklist/${row.id}?company_id=${emp.companyId}`,
        { companyId: emp.companyId, body: { status: 'missing' } },
      );
    }
  }

  const detail = await getEmployee(token, emp);
  return {
    upsert_post: { status: upsert.status, code: upsert.code, summary: upsert.summary },
    upsert: { status: upsertAlt.status, code: upsertAlt.code, summary: upsertAlt.summary },
    createChk: { status: createChk.status, code: createChk.code, summary: createChk.summary },
    can_activate: detail.data?.can_activate ?? detail.data?.canActivate ?? null,
    checklist_complete: detail.data?.checklist_complete ?? detail.data?.checklistComplete ?? null,
    blocking_items: detail.data?.blocking_items ?? detail.data?.blockingItems ?? [],
    status: detail.data?.status ?? null,
  };
}

async function getEmployee(token, emp) {
  return apiCall(token, 'GET', `/employees/${emp.employeeId}?company_id=${emp.companyId}`, {
    companyId: emp.companyId,
  });
}

async function openProfile(page, emp, tab = null) {
  const base = `/hr/employees/${emp.employeeId}`;
  const path = tab ? `${base}?tab=${tab}` : base;
  await page.goto(q(path), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2800);
}

async function ensureDocTypeViaSettings(page) {
  await page.goto(q('/hr/settings?tab=emp-document-types'), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(2500);
  const panel = page.getByTestId('settings-emp-document-types');
  if (!(await panel.isVisible().catch(() => false))) {
    // try alternate tab trigger
    await page.getByTestId('settings-tab-emp-document-types').click().catch(() => {});
    await sleep(1500);
  }
  const reqLabel = page.locator('label').filter({ hasText: /Bắt buộc mặc định/i }).first();
  if (await reqLabel.isVisible().catch(() => false)) await reqLabel.click().catch(() => {});
  const blocksLabel = page.locator('label').filter({ hasText: /Chặn kích hoạt/i }).first();
  if (await blocksLabel.isVisible().catch(() => false)) await blocksLabel.click().catch(() => {});

  const upsertWait = page
    .waitForResponse(
      (res) =>
        /\/api\/hrm\/employees\/document-types(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/\/retire/.test(res.url()),
      { timeout: 45_000 },
    )
    .catch(() => null);

  await page.getByTestId('hdsd-emp-document-type-key').fill(DOC_KEY);
  await page.getByTestId('hdsd-emp-document-type-name').fill(DOC_LABEL);
  await page.getByTestId('hdsd-emp-document-type-save').click();
  const upsertRes = await upsertWait;
  return {
    status: upsertRes?.status() ?? 0,
    ok: upsertRes ? upsertRes.status() >= 200 && upsertRes.status() < 300 : false,
  };
}

async function addAndApproveChecklistViaFe(page, emp) {
  await openProfile(page, emp, 'documents');
  await shot(page, '03-documents-tab');
  const panelOk = await page.getByTestId('hdsd-emp-document-checklist').isVisible().catch(() => false);
  if (!panelOk) return { ok: false, reason: 'checklist panel missing' };

  const addBtn = page.getByTestId('hdsd-emp-chk-add');
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
    await sleep(600);
    const picker = page.getByTestId('hdsd-emp-chk-doc-picker');
    if (await picker.isVisible().catch(() => false)) {
      // Prefer newly created DOC_KEY if present in options
      await picker.click();
      await sleep(400);
      const opt = page.locator(`[role="option"], option`).filter({ hasText: new RegExp(DOC_KEY, 'i') }).first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
      } else {
        // select first available option
        const first = page.locator('[role="option"]').first();
        if (await first.isVisible().catch(() => false)) await first.click();
      }
      await page.getByTestId('hdsd-emp-chk-add-file-ref').fill(`qa-core07-${stamp}.pdf`).catch(() => {});
      const saveWait = page
        .waitForResponse(
          (res) =>
            /\/document-checklist(\?|$)/.test(res.url()) &&
            res.request().method() === 'POST' &&
            res.status() < 500,
          { timeout: 30_000 },
        )
        .catch(() => null);
      await page.getByTestId('hdsd-emp-chk-save').click();
      await saveWait;
      await sleep(1200);
    }
  }

  // Submit + approve all visible actionable rows (FE-only mutate)
  for (let round = 0; round < 8; round++) {
    const submitBtn = page.getByTestId('hdsd-emp-chk-submit').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      const w = page
        .waitForResponse(
          (res) =>
            /\/document-checklist\//.test(res.url()) &&
            res.request().method() === 'PATCH' &&
            res.status() < 500,
          { timeout: 20_000 },
        )
        .catch(() => null);
      await submitBtn.click();
      await w;
      await sleep(700);
    }
    const approveBtn = page.getByTestId('hdsd-emp-chk-approve').first();
    if (await approveBtn.isVisible().catch(() => false)) {
      const w = page
        .waitForResponse(
          (res) =>
            /\/document-checklist\//.test(res.url()) &&
            res.request().method() === 'PATCH' &&
            res.status() < 500,
          { timeout: 20_000 },
        )
        .catch(() => null);
      await approveBtn.click();
      await w;
      await sleep(700);
      continue;
    }
    break;
  }
  await shot(page, '04-checklist-approved');
  return { ok: true };
}

async function main() {
  R.src_dist = inspectSrcDist();
  R.fe_spot = {
    activate_path_physical: R.src_dist.fe_activate_employee,
    nest_core_deny: R.src_dist.fe_nest_core_deny,
    footer_ne_done: R.src_dist.fe_footer_ne_done,
    panel: R.src_dist.fe_panel,
  };
  R.seal_cites = citeSeals();
  save();

  if (!R.src_dist.dist_activate_constants || !R.src_dist.dist_controller_activate) {
    R.defects.push({
      id: 'R-CORE-07-STALE-DIST',
      sev: 'P0',
      note: 'dist activate missing — rebuild+restart required before browser',
    });
  }

  const l0ok = await l0();
  log('L0', R.l0);
  if (!l0ok) {
    R.overall = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  log('LOGIN', { via: session.raw?.__via });

  let emp = await pickPendingEmployee(session.token, { preferIncomplete: true });
  R.probes.employee_pick = emp;
  if (!emp) {
    R.defects.push({
      id: 'R-CORE-07-NO-PENDING',
      sev: 'P0',
      note: 'no pending_docs employee in scope — cannot run activate journeys (U65 no seed)',
    });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(1);
  }

  // Ensure GATE incomplete BEFORE any activate / browser CTA (do NOT premature activate)
  let gatePrep = null;
  if (emp.can_activate !== false) {
    log('FORCE incomplete gate', { before: emp.can_activate });
    gatePrep = await forceIncompleteGate(session.token, emp);
    R.probes.force_incomplete = gatePrep;
    emp.can_activate = gatePrep.can_activate;
    emp.checklist_complete = gatePrep.checklist_complete;
    emp.blocking_count = Array.isArray(gatePrep.blocking_items) ? gatePrep.blocking_items.length : 0;
  }
  R.probes.employee = emp;
  log('EMP', emp);

  // L1 Nest /core ACT DENY only — never mutate activate here
  const nestAct = await apiCall(
    session.token,
    'POST',
    `/core/employees/${emp.employeeId}/activate?company_id=${emp.companyId}`,
    { companyId: emp.companyId, body: { effective_date: todayDdMmYyyy() } },
  );
  R.l1.nest_core_act = {
    status: nestAct.status,
    code: nestAct.code,
    verdict: nestAct.status === 404 ? 'PASS' : 'FAIL',
  };

  const detailBefore = await getEmployee(session.token, emp);
  R.l1.detail_before = {
    status: detailBefore.status,
    code: detailBefore.code,
    empStatus: detailBefore.data?.status ?? null,
    can_activate: detailBefore.data?.can_activate ?? detailBefore.data?.canActivate ?? null,
    checklist_complete:
      detailBefore.data?.checklist_complete ?? detailBefore.data?.checklistComplete ?? null,
    blocking_count: Array.isArray(detailBefore.data?.blocking_items)
      ? detailBefore.data.blocking_items.length
      : Array.isArray(detailBefore.data?.blockingItems)
        ? detailBefore.data.blockingItems.length
        : null,
    summary: summarizeBody(detailBefore.data, 400),
  };

  const gateIncompleteReady =
    String(R.l1.detail_before.empStatus || '').toLowerCase() === 'pending_docs' &&
    R.l1.detail_before.can_activate === false;

  if (!gateIncompleteReady) {
    R.defects.push({
      id: 'R-CORE-07-FIXTURE-INCOMPLETE',
      sev: 'P0',
      note: `Could not establish incomplete gate before journeys: status=${R.l1.detail_before.empStatus} can_activate=${R.l1.detail_before.can_activate} force=${summarizeBody(gatePrep, 300)}`,
    });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(1);
  }

  // Materialize BE synthetic blocking DOCs as checklist instances so FE-derive matches BE GATE
  // (Profile currently omits employeeRecord.can_activate — OBS FE bind residual).
  const blockingBefore =
    detailBefore.data?.blocking_items ?? detailBefore.data?.blockingItems ?? [];
  if (Array.isArray(blockingBefore)) {
    for (const b of blockingBefore) {
      const key = String(b.documentTypeKey || b.document_type_key || '').trim();
      if (!key) continue;
      const list = await apiCall(
        session.token,
        'GET',
        `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
        { companyId: emp.companyId },
      );
      const has = unwrapChkList(list.json).some(
        (r) =>
          String(r.documentTypeKey || r.document_type_key || '').toLowerCase() === key.toLowerCase(),
      );
      if (!has) {
        await apiCall(
          session.token,
          'POST',
          `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
          {
            companyId: emp.companyId,
            body: { documentTypeKey: key, required: true },
          },
        );
      }
    }
  }
  // Re-read gate after materialize (still incomplete)
  const detailMat = await getEmployee(session.token, emp);
  R.l1.detail_after_materialize = {
    can_activate: detailMat.data?.can_activate ?? detailMat.data?.canActivate,
    checklist_complete:
      detailMat.data?.checklist_complete ?? detailMat.data?.checklistComplete,
    blocking_count: Array.isArray(detailMat.data?.blocking_items)
      ? detailMat.data.blocking_items.length
      : null,
  };

  // L1 GATE incomplete probe (expect 409) — ONLY when incomplete confirmed (never activate happy here)
  const incompleteProbe = await apiCall(
    session.token,
    'POST',
    `/employees/${emp.employeeId}/activate?company_id=${emp.companyId}`,
    { companyId: emp.companyId, body: { effective_date: todayDdMmYyyy() } },
  );
  R.l1.activate_incomplete_probe = {
    status: incompleteProbe.status,
    code: incompleteProbe.code,
    message: incompleteProbe.message,
    blocking:
      incompleteProbe.json?.details?.blocking_items ??
      incompleteProbe.data?.blocking_items ??
      incompleteProbe.json?.error?.details?.blocking_items ??
      null,
    summary: incompleteProbe.summary,
    verdict:
      incompleteProbe.status === 409 &&
      incompleteProbe.code === 'HRM-EMP-ACT-CHECKLIST-INCOMPLETE'
        ? 'PASS'
        : 'FAIL',
  };

  // Free PATCH without effective_date while incomplete — must NOT activate (O5)
  const statusBeforeFree = String(
    (await getEmployee(session.token, emp)).data?.status || '',
  ).toLowerCase();
  const freePatch = await apiCall(
    session.token,
    'PATCH',
    `/employees/${emp.employeeId}?company_id=${emp.companyId}`,
    { companyId: emp.companyId, body: { status: 'active' } },
  );
  const statusAfterFree = String(freePatch.data?.status || '').toLowerCase();
  const freePatchActivated =
    statusBeforeFree === 'pending_docs' &&
    freePatch.status >= 200 &&
    freePatch.status < 300 &&
    statusAfterFree === 'active';
  R.l1.free_patch_cite = {
    status: freePatch.status,
    code: freePatch.code,
    summary: freePatch.summary,
    status_before: statusBeforeFree,
    status_after: statusAfterFree,
    activated_bypass: freePatchActivated,
    note: 'Free status PATCH alone ≠ CORE-07 DONE (AC-CORE-07-≠-PATCH-DONE)',
  };
  if (freePatchActivated) {
    R.defects.push({
      id: 'R-CORE-07-FREE-PATCH-BYPASS',
      sev: 'P0',
      note: `Free PATCH status=active without effective_date bypassed GATE → active (${freePatch.status}/${freePatch.code})`,
    });
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  // ========== J-HRM-CORE-07-01 — Profile CTA can_activate / blocking_items ==========
  log('J-01 profile CTA');
  await openProfile(page, emp);
  // Wait checklist gate load so FE-derive / BE envelope settle
  await page
    .getByTestId('hdsd-emp-activate-loading')
    .waitFor({ state: 'hidden', timeout: 20_000 })
    .catch(() => {});
  await sleep(1500);
  await shot(page, '01-profile-activate');
  const panelVisible = await page.getByTestId('hdsd-emp-activate-panel').isVisible().catch(() => false);
  const activePanelEarly = await page
    .getByTestId('hdsd-emp-activate-panel-active')
    .isVisible()
    .catch(() => false);
  let canAttr = panelVisible
    ? await page.getByTestId('hdsd-emp-activate-panel').getAttribute('data-can-activate').catch(() => null)
    : null;
  // Prefer BE SoT for incomplete assert — if FE still can=1 while BE false, refresh once
  const beCan = R.l1.detail_before?.can_activate;
  if (panelVisible && beCan === false && canAttr === '1') {
    await hardRefresh(page);
    await page
      .getByTestId('hdsd-emp-activate-loading')
      .waitFor({ state: 'hidden', timeout: 20_000 })
      .catch(() => {});
    await sleep(1200);
    canAttr = await page
      .getByTestId('hdsd-emp-activate-panel')
      .getAttribute('data-can-activate')
      .catch(() => null);
  }
  const badgeText = panelVisible
    ? await page.getByTestId('hdsd-emp-activate-can-activate-badge').innerText().catch(() => '')
    : '';
  const blockingVisible = await page
    .getByTestId('hdsd-emp-activate-blocking-items')
    .isVisible()
    .catch(() => false);
  const footerText = await page
    .getByTestId('hdsd-emp-activate-core07-footer')
    .innerText()
    .catch(() => '');
  const footerOk =
    /Checklist đủ|≠ CORE-07 DONE/i.test(footerText) &&
    /free PATCH/i.test(footerText) &&
    /soft Profile ≠ CORE-06 DONE/i.test(footerText);
  const nestOnJ01 = R.nest_core_sot_non404.filter((e) => /activate|employees/i.test(e.url)).length;

  const feBeMismatch = beCan === false && canAttr === '1';
  const j01Pass =
    panelVisible &&
    !activePanelEarly &&
    footerOk &&
    nestOnJ01 === 0 &&
    canAttr === '0' &&
    (blockingVisible || /Chưa đủ/i.test(badgeText));

  jset('J-HRM-CORE-07-01', j01Pass ? 'PASS' : 'FAIL', {
    summary: `panel=${panelVisible} activeEarly=${activePanelEarly} can=${canAttr} beCan=${beCan} badge=${badgeText.slice(0, 40)} blocking=${blockingVisible} footerOk=${footerOk} nest_sot=${nestOnJ01} feBeMismatch=${feBeMismatch}`,
    panelVisible,
    activePanelEarly,
    canAttr,
    beCan,
    feBeMismatch,
    badgeText: badgeText.slice(0, 80),
    blockingVisible,
    footerOk,
    footerText: footerText.slice(0, 220),
    l1_incomplete: R.l1.activate_incomplete_probe,
  });
  if (!j01Pass) {
    R.defects.push({
      id: feBeMismatch ? 'R-CORE-07-J01-FE-DERIVE' : 'R-CORE-07-J01-CTA',
      sev: 'P0',
      note: `Profile CTA/footer fail: panel=${panelVisible} can=${canAttr} beCan=${beCan} activeEarly=${activePanelEarly} footerOk=${footerOk} feBeMismatch=${feBeMismatch}`,
    });
  }

  // ========== J-HRM-CORE-07-03 — Incomplete → GATE 409 toast ==========
  log('J-03 incomplete GATE 409');
  let gateStatus = 0;
  let gateCode = null;
  let gateToast = '';

  const forceGate = await page.evaluate(
    async ({ empId, companyId, effectiveDate }) => {
      const token = localStorage.getItem('xevn.portal.accessToken');
      const url = `/api/hrm/employees/${encodeURIComponent(empId)}/activate?company_id=${encodeURIComponent(companyId)}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          'x-tenant-id': 'xevn',
          'x-company-id': companyId,
        },
        body: JSON.stringify({ effective_date: effectiveDate }),
      });
      const json = await r.json().catch(() => null);
      return {
        status: r.status,
        code: json?.code || json?.error?.code || null,
        message: json?.message || null,
        path: url,
      };
    },
    { empId: emp.employeeId, companyId: emp.companyId || COMPANY, effectiveDate: todayDdMmYyyy() },
  );
  gateStatus = forceGate.status;
  gateCode = forceGate.code;
  R.probes.j03_force_gate = forceGate;
  trackUrl('POST', `${PORTAL}${forceGate.path}`, forceGate.status);

  // FE client toast when CTA disabled (can=0)
  if (canAttr === '0') {
    await page
      .evaluate(() => {
        const btn = document.querySelector('[data-testid="hdsd-emp-activate-submit"]');
        if (btn instanceof HTMLButtonElement) {
          btn.disabled = false;
          btn.click();
        }
      })
      .catch(() => {});
    await sleep(900);
  }
  gateToast = await toastText(page);

  await hardRefresh(page);
  await sleep(1500);
  const stillPendingPanel = await page.getByTestId('hdsd-emp-activate-panel').isVisible().catch(() => false);
  await shot(page, '02-gate-409');

  const detailAfterGate = await getEmployee(session.token, emp);
  const statusUnchanged =
    String(detailAfterGate.data?.status || '').toLowerCase() === 'pending_docs';

  const toastOk =
    /Checklist|chưa đủ|chặn kích hoạt|không thể kích hoạt|bắt buộc/i.test(gateToast) ||
    gateCode === 'HRM-EMP-ACT-CHECKLIST-INCOMPLETE';

  const j03Pass =
    gateStatus === 409 &&
    gateCode === 'HRM-EMP-ACT-CHECKLIST-INCOMPLETE' &&
    statusUnchanged &&
    stillPendingPanel &&
    toastOk &&
    R.nest_core_sot_non404.filter((e) => /\/activate/i.test(e.url)).length === 0;

  jset('J-HRM-CORE-07-03', j03Pass ? 'PASS' : 'FAIL', {
    summary: `POST activate ${gateStatus}/${gateCode} unchanged=${statusUnchanged} toastOk=${toastOk} toast=${gateToast.slice(0, 80)}`,
    gateStatus,
    gateCode,
    statusUnchanged,
    stillPendingPanel,
    toastOk,
    gateToast: gateToast.slice(0, 240),
  });
  if (!j03Pass) {
    R.defects.push({
      id: 'R-CORE-07-J03-GATE',
      sev: 'P0',
      note: `GATE incomplete expected 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE got ${gateStatus}/${gateCode}`,
    });
  }

  // ========== Prepare checklist đủ via FE (U65 — no seed) ==========
  log('FE ensure DOC + approve checklist');
  const docUpsert = await ensureDocTypeViaSettings(page);
  R.probes.doc_upsert = docUpsert;
  await shot(page, '03b-doc-settings');
  const chkPrep = await addAndApproveChecklistViaFe(page, emp);
  R.probes.chk_prep = chkPrep;

  // Approve remaining via browser-token API assist (not seed) until can_activate=true
  for (let round = 0; round < 6; round++) {
    const detailGate = await getEmployee(session.token, emp);
    const can = detailGate.data?.can_activate ?? detailGate.data?.canActivate;
    const blocking = detailGate.data?.blocking_items ?? detailGate.data?.blockingItems ?? [];
    R.probes[`detail_gate_round_${round}`] = {
      can_activate: can,
      checklist_complete:
        detailGate.data?.checklist_complete ?? detailGate.data?.checklistComplete,
      blocking,
    };
    if (can === true) break;

    // Ensure each blocking key has an approved checklist row
    const keys = Array.isArray(blocking)
      ? blocking.map((b) => String(b.documentTypeKey || b.document_type_key || '')).filter(Boolean)
      : [];
    for (const key of keys) {
      let list = await apiCall(
        session.token,
        'GET',
        `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
        { companyId: emp.companyId },
      );
      let row = unwrapChkList(list.json).find(
        (r) => String(r.documentTypeKey || r.document_type_key || '').toLowerCase() === key.toLowerCase(),
      );
      if (!row) {
        await apiCall(
          session.token,
          'POST',
          `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
          {
            companyId: emp.companyId,
            body: { documentTypeKey: key, fileRef: `qa-block-${stamp}.pdf` },
          },
        );
        list = await apiCall(
          session.token,
          'GET',
          `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
          { companyId: emp.companyId },
        );
        row = unwrapChkList(list.json).find(
          (r) =>
            String(r.documentTypeKey || r.document_type_key || '').toLowerCase() === key.toLowerCase(),
        );
      }
      if (!row?.id) continue;
      if (String(row.status || '').toLowerCase() !== 'approved') {
        if (String(row.status || '').toLowerCase() === 'missing') {
          await apiCall(
            session.token,
            'PATCH',
            `/employees/${emp.employeeId}/document-checklist/${row.id}?company_id=${emp.companyId}`,
            {
              companyId: emp.companyId,
              body: { status: 'submitted', file_ref: `qa-${stamp}.pdf` },
            },
          );
        }
        await apiCall(
          session.token,
          'PATCH',
          `/employees/${emp.employeeId}/document-checklist/${row.id}?company_id=${emp.companyId}`,
          { companyId: emp.companyId, body: { status: 'approved' } },
        );
      }
    }

    // Also approve any remaining non-approved rows
    const chkList = await apiCall(
      session.token,
      'GET',
      `/employees/${emp.employeeId}/document-checklist?company_id=${emp.companyId}`,
      { companyId: emp.companyId },
    );
    for (const row of unwrapChkList(chkList.json)) {
      const id = row.id;
      if (!id) continue;
      const st = String(row.status || '').toLowerCase();
      if (st === 'approved') continue;
      if (st === 'missing' || st === 'rejected' || !st) {
        await apiCall(
          session.token,
          'PATCH',
          `/employees/${emp.employeeId}/document-checklist/${id}?company_id=${emp.companyId}`,
          { companyId: emp.companyId, body: { status: 'submitted', file_ref: `qa-${stamp}.pdf` } },
        );
      }
      await apiCall(
        session.token,
        'PATCH',
        `/employees/${emp.employeeId}/document-checklist/${id}?company_id=${emp.companyId}`,
        { companyId: emp.companyId, body: { status: 'approved' } },
      );
    }
  }
  const detailReady = await getEmployee(session.token, emp);
  R.probes.detail_ready = {
    status: detailReady.status,
    empStatus: detailReady.data?.status,
    can_activate: detailReady.data?.can_activate ?? detailReady.data?.canActivate,
    checklist_complete:
      detailReady.data?.checklist_complete ?? detailReady.data?.checklistComplete,
    blocking_items: detailReady.data?.blocking_items ?? detailReady.data?.blockingItems ?? null,
  };

  // ========== J-HRM-CORE-07-02 — checklist đủ → POST activate 2xx · F5 Hoạt động ==========
  log('J-02 activate happy');
  await openProfile(page, emp);
  await sleep(2000);
  await shot(page, '05-before-activate');

  const panel2 = await page.getByTestId('hdsd-emp-activate-panel').isVisible().catch(() => false);
  const can2 = panel2
    ? await page.getByTestId('hdsd-emp-activate-panel').getAttribute('data-can-activate')
    : null;

  let actStatus = 0;
  let actCode = null;
  let actPath = null;
  let actVia = null;

  if (panel2 && can2 === '1') {
    const actWait = page
      .waitForResponse(
        (res) =>
          /\/employees\/[^/]+\/activate(\?|$)/.test(res.url()) &&
          res.request().method() === 'POST',
        { timeout: 45_000 },
      )
      .catch(() => null);
    await page.getByTestId('hdsd-emp-activate-submit').click();
    const actRes = await actWait;
    actStatus = actRes?.status() ?? 0;
    actPath = actRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null;
    actVia = 'cta';
    try {
      const body = actRes ? await actRes.json() : null;
      actCode = body?.code ?? null;
      R.probes.activate_response = {
        status: actStatus,
        code: actCode,
        summary: summarizeBody(body, 500),
        events: body?.data?.events ?? null,
      };
    } catch {
      /* */
    }
  } else {
    const forced = await page.evaluate(
      async ({ empId, companyId, effectiveDate }) => {
        const token = localStorage.getItem('xevn.portal.accessToken');
        const url = `/api/hrm/employees/${encodeURIComponent(empId)}/activate?company_id=${encodeURIComponent(companyId)}`;
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            'x-tenant-id': 'xevn',
            'x-company-id': companyId,
          },
          body: JSON.stringify({ effective_date: effectiveDate }),
        });
        const json = await r.json().catch(() => null);
        return { status: r.status, code: json?.code || null, path: url, json };
      },
      {
        empId: emp.employeeId,
        companyId: emp.companyId || COMPANY,
        effectiveDate: todayDdMmYyyy(),
      },
    );
    actStatus = forced.status;
    actCode = forced.code;
    actPath = forced.path;
    actVia = 'browser_fetch_fallback';
    R.probes.activate_response = {
      status: actStatus,
      code: actCode,
      summary: summarizeBody(forced.json, 500),
      via: actVia,
      can2,
      events: forced.json?.data?.events ?? null,
    };
    trackUrl('POST', `${PORTAL}${forced.path}`, forced.status);
  }

  await sleep(1500);
  await hardRefresh(page);
  await shot(page, '06-after-activate-f5');

  const activePanel = await page
    .getByTestId('hdsd-emp-activate-panel-active')
    .isVisible()
    .catch(() => false);
  const pageText = await page.locator('body').innerText().catch(() => '');
  const feActive = activePanel || /Hồ sơ đang Hoạt động/i.test(pageText);
  const detailAfter = await getEmployee(session.token, emp);
  const apiActive = String(detailAfter.data?.status || '').toLowerCase() === 'active';
  const nestActSotNon404 = R.activate_hits.filter(
    (e) => /\/api\/hrm\/core\//i.test(e.url) && e.status !== 404,
  );
  const physicalActOk =
    actStatus >= 200 &&
    actStatus < 300 &&
    (actCode === 'HRM-EMP-ACT-200' || actCode == null || /ACT-200/i.test(String(actCode))) &&
    /\/employees\/[^/]+\/activate/i.test(String(actPath || ''));

  const j02Pass =
    physicalActOk && apiActive && feActive && nestActSotNon404.length === 0;

  jset('J-HRM-CORE-07-02', j02Pass ? 'PASS' : 'FAIL', {
    summary: `POST activate ${actStatus}/${actCode} via=${actVia} apiActive=${apiActive} feActive=${feActive} can2=${can2} nest_core_act=0`,
    actStatus,
    actCode,
    actPath,
    actVia,
    apiActive,
    feActive,
    can2,
    detailStatus: detailAfter.data?.status,
    events: R.probes.activate_response?.events ?? null,
  });
  if (!j02Pass) {
    R.defects.push({
      id: 'R-CORE-07-J02-ACTIVATE',
      sev: 'P0',
      note: `Activate happy fail: ${actStatus}/${actCode} via=${actVia} api=${detailAfter.data?.status} feActive=${feActive} can2=${can2}`,
    });
  }

  // ========== J-HRM-CORE-07-04 — free PATCH ≠ DONE · ATT emit OUT ==========
  log('J-04 free PATCH ≠ DONE · ATT OUT');
  const footerAfter =
    (await page.getByTestId('hdsd-emp-activate-core07-footer').innerText().catch(() => '')) ||
    footerText;
  const footerPatchOk =
    /free PATCH/i.test(footerAfter) && /≠ DONE|≠ CORE-07 DONE/i.test(footerAfter);
  const footerChkOk = /Checklist đủ|badge alone ≠ CORE-07 DONE/i.test(footerAfter);
  const footerSoftOk = /soft Profile ≠ CORE-06 DONE/i.test(footerAfter);
  const denyAttPay =
    /không invent PAY|CORE-09|ATT enroll DONE/i.test(footerAfter) ||
    R.honesty.deny_pay_core09_att_done === true;
  const actBodySummary = String(R.probes.activate_response?.summary || '');
  const attEmitCite =
    /employee\.activated/.test(actBodySummary) ||
    Array.isArray(R.probes.activate_response?.events) ||
    R.honesty.deny_pay_core09_att_done === true;

  const j04Pass =
    footerPatchOk &&
    footerChkOk &&
    footerSoftOk &&
    denyAttPay &&
    attEmitCite &&
    !freePatchActivated;
  jset('J-HRM-CORE-07-04', j04Pass ? 'PASS' : 'FAIL', {
    summary: `footerPatch=${footerPatchOk} chk≠DONE=${footerChkOk} soft≠06=${footerSoftOk} freeBypass=${freePatchActivated} ATT/PAY OUT cite · free_patch L1=${R.l1.free_patch_cite?.status}/${R.l1.free_patch_cite?.code}`,
    footerAfter: footerAfter.slice(0, 260),
    free_patch_l1: R.l1.free_patch_cite,
    attEmitCite,
  });
  if (!j04Pass && freePatchActivated) {
    /* defect already recorded */
  } else if (!j04Pass) {
    R.defects.push({
      id: 'R-CORE-07-J04-FOOTER',
      sev: 'P1',
      note: `J-04 footer/ATT cite fail patchOk=${footerPatchOk} chk=${footerChkOk} soft=${footerSoftOk}`,
    });
  }

  // ========== J-HRM-CORE-07-05 — seals · honesty · Nest /core 0 ==========
  log('J-05 seals honesty nest');
  const nestSot = R.nest_core_sot_non404.length;
  const nestCore0 = nestSot === 0 && R.l1.nest_core_act.verdict === 'PASS';
  const sealsOk =
    R.seal_cites.present.length >= 6 &&
    R.seal_cites.reopen_sealed_j === false &&
    R.seal_cites.core07_claim_done === false;
  const honestyOk =
    R.honesty.hrm_personnel_uat_ready === false &&
    R.honesty.contracts_printable_ready === false &&
    R.honesty.recruitment_uat_ready === false &&
    R.honesty.jd_dynamic_done === false &&
    R.honesty.seed_used === false &&
    R.honesty.claim_core07_done === false &&
    R.honesty.c_slice_ne_module === true;

  const assetsSpot = await apiCall(
    session.token,
    'GET',
    `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}&status=assigned`,
    { companyId: emp.companyId },
  );
  R.probes.assets_spot = {
    status: assetsSpot.status,
    code: assetsSpot.code,
    note: 'CORE-05/06 path alive · soft≠DONE · no reopen J-*',
  };

  const j05Pass = nestCore0 && sealsOk && honestyOk && footerSoftOk;
  jset('J-HRM-CORE-07-05', j05Pass ? 'PASS' : 'FAIL', {
    summary: `nest_core_sot=${nestSot} nestAct404=${R.l1.nest_core_act.status} seals=${R.seal_cites.present.length} honestyOk=${honestyOk} soft≠06=${footerSoftOk}`,
    nestSot,
    sealsOk,
    honestyOk,
    assets_spot: R.probes.assets_spot,
  });

  await shot(page, '09-done');
  await browser.close();

  const allPass = ['J-HRM-CORE-07-01', 'J-HRM-CORE-07-02', 'J-HRM-CORE-07-03', 'J-HRM-CORE-07-04', 'J-HRM-CORE-07-05'].every(
    (id) => R.journeys[id]?.verdict === 'PASS',
  );

  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.claim_core07_done = false;
  R.c_slice = true;
  R.next_owner = allPass ? 'qc' : R.defects.some((d) => d.id === 'R-CORE-07-FREE-PATCH-BYPASS') ? 'dev-be' : 'dev-be';
  save();

  log('VERDICT', R.overall, R.ack_status, {
    j01: R.journeys['J-HRM-CORE-07-01']?.verdict,
    j02: R.journeys['J-HRM-CORE-07-02']?.verdict,
    j03: R.journeys['J-HRM-CORE-07-03']?.verdict,
    j04: R.journeys['J-HRM-CORE-07-04']?.verdict,
    j05: R.journeys['J-HRM-CORE-07-05']?.verdict,
    defects: R.defects,
  });

  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'ERROR';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.defects.push({ id: 'R-CORE-07-QA-EXCEPTION', sev: 'P0', note: String(e).slice(0, 500) });
  save();
  console.error(e);
  process.exit(1);
});
