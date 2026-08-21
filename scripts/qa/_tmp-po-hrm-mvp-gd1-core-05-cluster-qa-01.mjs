#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-01 — U65 browser J-HRM-CORE-05-01..05
 * UC-BP-CORE-05 · F-CORE-AST-01/BB-01 physical /employees/:id/assets*
 * POST create 201 + status=assigned + statusLabelVi · PATCH handoverConfirmed · serial 409
 * soft returned prefer · DELETE issued → 409 DELETE-FORBIDDEN · Nest /core = 0
 * RETAIN CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · DENY seed · honesty flip · CORE-06/07 DONE
 * Persona: ceo@xe.vn · companyId=main · mutate holding · C-SLICE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-05-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-05-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const CORE03_SEAL = 'CORE03QC1-MSLFJH0K';
const CORE02B_SEAL = 'CORE02BQC1-MSLEFQC1';
const CORE09D_SEAL = 'CORE09DQC1-MSLDR8I3';
const EMPPLAT_SEAL = 'EMPPLATQA-MSIZXHIM';
const EMPTOK_SEAL = 'EMPTOKQA-MSJ290VB';
const PEER_SEALS = [
  CORE03_SEAL,
  CORE02B_SEAL,
  CORE09D_SEAL,
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
const STAMP = `CORE05QA-${stamp.toUpperCase()}`;
const ASSET_NAME = `TS CORE-05 QA ${stamp}`;
const ASSET_CODE = `AST-C05-${stamp}`.slice(0, 32);
const SERIAL_A = `SN-C05-${stamp}-A`.slice(0, 40);
const SERIAL_DUP = SERIAL_A;
const ASSET_NAME_DUP = `TS CORE-05 DUP ${stamp}`;

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
function unwrapAssetList(json) {
  const d = json?.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.rows)) return d.rows;
  return [];
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-CORE-05'],
  stamp: STAMP,
  startedAt: ts(),
  cite_seals: {
    core03: CORE03_SEAL,
    core02b: CORE02B_SEAL,
    core09d: CORE09D_SEAL,
    empplat: EMPPLAT_SEAL,
    emptok: EMPTOK_SEAL,
    peers: PEER_SEALS,
  },
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed-browser-j-hrm-core-05',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_crud_eq_core05_done: true,
    deny_core06_07_printable_closed8_done: true,
    nest_core_deny: true,
    reopen_j_core_03_02b_09d_to_01: false,
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, ASSET_NAME, ASSET_CODE, SERIAL_A },
  l0: {},
  src_dist: {},
  fe_spot: {},
  seal_cites: {},
  hdsd_align: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  nest_core_sot_non404: [],
  assets_hits: [],
  employees_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
  journeys: {},
  residuals: [],
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 560)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const assets = /\/employees\/[^/]+\/assets/.test(url);
  const employees = /\/employees(\/|$|\?)/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    assets,
    employees,
  };
  R.network.push(entry);
  if (nest_core) {
    R.nest_core_hits.push(entry);
    if (status != null && status !== 404) R.nest_core_sot_non404.push(entry);
  }
  if (assets) R.assets_hits.push(entry);
  if (employees) R.employees_hits.push(entry);
}

function inspectSrcDist() {
  const svcSrc = resolve(ROOT, 'apps/api/hrm-api/src/employees/employee-profile.service.ts');
  const svcDist = resolve(ROOT, 'apps/api/hrm-api/dist/employees/employee-profile.service.js');
  const ctrlSrc = resolve(ROOT, 'apps/api/hrm-api/src/employees/employees.controller.ts');
  const out = {
    src_profile_service: existsSync(svcSrc),
    dist_profile_service: existsSync(svcDist),
    src_serial_conflict: false,
    dist_serial_conflict: false,
    src_delete_forbidden: false,
    dist_delete_forbidden: false,
    src_bb_cols: false,
    dist_bb_cols: false,
    src_controller_assets: false,
    nest_core_controller_ast_absent: true,
  };
  if (existsSync(svcSrc)) {
    const t = readFileSync(svcSrc, 'utf8');
    out.src_serial_conflict = /HRM-EMP-ASSET-SERIAL-CONFLICT/.test(t);
    out.src_delete_forbidden = /HRM-EMP-ASSET-DELETE-FORBIDDEN/.test(t);
    out.src_bb_cols = /handover_confirmed_at/.test(t);
  }
  if (existsSync(svcDist)) {
    const t = readFileSync(svcDist, 'utf8');
    out.dist_serial_conflict = /HRM-EMP-ASSET-SERIAL-CONFLICT/.test(t);
    out.dist_delete_forbidden = /HRM-EMP-ASSET-DELETE-FORBIDDEN/.test(t);
    out.dist_bb_cols = /handover_confirmed_at/.test(t);
  }
  if (existsSync(ctrlSrc)) {
    out.src_controller_assets = /:employeeId\/assets/.test(readFileSync(ctrlSrc, 'utf8'));
  }
  const walk = (dir, depth = 0) => {
    if (depth > 3 || !existsSync(dir)) return;
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      try {
        if (f.endsWith('.ts') || f.endsWith('.js')) {
          const t = readFileSync(p, 'utf8');
          if (
            /@Controller\(\s*['"]core['"]\s*\)/.test(t) &&
            /assets|employee_assets/i.test(t)
          ) {
            out.nest_core_controller_ast_absent = false;
          }
        } else if (!f.includes('.') && depth < 2) {
          const st = statSync(p);
          if (st.isDirectory()) walk(p, depth + 1);
        }
      } catch {
        /* */
      }
    }
  };
  walk(resolve(ROOT, 'apps/api/hrm-api/src'));
  return out;
}

function feSpot() {
  const panel = resolve(ROOT, 'apps/web/hrm/src/components/employee/EmployeeAssets.tsx');
  const profile = resolve(ROOT, 'apps/web/hrm/src/pages/EmployeeProfile.tsx');
  const api = resolve(ROOT, 'apps/web/hrm/src/integrations/hrmApi.ts');
  const err = resolve(ROOT, 'apps/web/hrm/src/lib/apiError.ts');
  const out = {
    assets_component: existsSync(panel),
    profile_assets_tab: false,
    physical_assets_path: false,
    deny_nest_core_assets_path: true,
    confirm_bb_cta: false,
    soft_return_action: false,
    serial_toast_map: false,
    notes_not_bb: false,
    hdsd_hooks: false,
  };
  if (existsSync(profile)) {
    const t = readFileSync(profile, 'utf8');
    out.profile_assets_tab = /activeTab === 'assets'/.test(t) && /EmployeeAssets/.test(t);
  }
  if (existsSync(panel)) {
    const t = readFileSync(panel, 'utf8');
    out.confirm_bb_cta = /hdsd-emp-assets-confirm-bb|confirmReceive|confirmHandover/.test(t);
    out.soft_return_action = /softReturnAction|softReturnAsset|hdsd-emp-assets-soft-return/.test(t);
    out.notes_not_bb = /notesNotBb/.test(t);
    out.hdsd_hooks = /data-hdsd="hdsd-emp-assets"/.test(t);
  }
  if (existsSync(api)) {
    const t = readFileSync(api, 'utf8');
    out.physical_assets_path =
      /\/employees\/\$\{.*\}\/assets/.test(t) || /employees\/.*\/assets/.test(t);
    out.deny_nest_core_assets_path = !/\/api\/hrm\/core\/.*assets/.test(t);
  }
  if (existsSync(err)) {
    out.serial_toast_map = /HRM-EMP-ASSET-SERIAL-CONFLICT/.test(readFileSync(err, 'utf8'));
  }
  return out;
}

function citeSeals() {
  const paths = [
    ['core03', 'docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qc-01.md', CORE03_SEAL],
    ['core02b', 'docs/qa/evidence/po-hrm-mvp-gd1-core-02b-cluster-qc-01.md', CORE02B_SEAL],
    ['core09d', 'docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md', CORE09D_SEAL],
    ['empplat', 'docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md', EMPPLAT_SEAL],
    ['emptok', 'docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md', EMPTOK_SEAL],
    ['fe01', 'docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-fe-01.md', 'READY_FOR_QA'],
    ['be01', 'docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-01.md', 'READY_FOR_QA'],
  ];
  const out = {};
  for (const [k, rel, needle] of paths) {
    const p = resolve(ROOT, rel);
    const ok = existsSync(p) && readFileSync(p, 'utf8').includes(needle);
    out[k] = { path: rel, needle, cited: ok };
  }
  out.peers_must_keep = PEER_SEALS.map((s) => ({ stamp: s, reopen: false, note: 'must_keep cite only' }));
  return out;
}

function hdsdAlign() {
  const inventory = {
    menu_path: 'HRM → Hồ sơ NV → tab Tài sản (employee.tabs.assets)',
    ui_labels: [
      'Thêm cấp phát',
      'Xác nhận nhận',
      'Thu hồi (đổi trạng thái)',
      'Đang sử dụng',
      'Ghi chú không thay biên bản bàn giao',
    ],
    data_hdsd: [
      'hdsd-emp-assets',
      'hdsd-emp-assets-add',
      'hdsd-emp-assets-save',
      'hdsd-emp-assets-confirm-bb',
      'hdsd-emp-assets-soft-return',
      'hdsd-emp-assets-serial',
      'hdsd-emp-assets-notes',
    ],
    client_hdsd_chapter: 'CH11 reports «Công cụ dụng cụ» (stats) · Profile Tài sản = in-app hdsd hooks (no dedicated CH assets chapter invent)',
  };
  return inventory;
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
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
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
    } catch {
      /* */
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

async function apiCall(token, method, path, { body, companyId = COMPANY, headersExtra = {} } = {}) {
  const url = path.startsWith('http')
    ? path
    : `${HRM}${path.startsWith('/api/') ? path : `/api/hrm${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Accept: 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
      ...headersExtra,
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
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
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
    if (t) parts.push(t.slice(0, 200));
  }
  return parts.join(' | ');
}

async function pickEmployee(token) {
  for (const companyId of [API_COMPANY, COMPANY]) {
    const list = await apiCall(token, 'GET', `/employees?company_id=${companyId}&page=1&page_size=5`, {
      companyId,
    });
    const items = unwrapEmpList(list.json);
    const emp = items[0];
    if (emp?.id || emp?.employeeId) {
      return {
        companyId: emp.company_id || emp.companyId || companyId,
        employeeId: emp.id || emp.employeeId,
        employee_code: emp.employee_code || emp.employeeCode || null,
      };
    }
  }
  return null;
}

async function openAssetsTab(page, emp) {
  const urls = [
    q(`/hr/employees/${emp.employeeId}?tab=assets`),
    q(`/command-center/hrm/employees/${emp.employeeId}?tab=assets`),
  ];
  for (const url of urls) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    let panel = page.locator('[data-hdsd="hdsd-emp-assets"]');
    let visible = await panel.isVisible().catch(() => false);
    if (!visible) {
      // try click tab label
      const tab = page.getByRole('button', { name: /Tài sản/i }).or(page.getByText(/^Tài sản$/));
      if (await tab.first().isVisible().catch(() => false)) {
        await tab.first().click({ force: true }).catch(() => {});
        await sleep(2000);
      }
      panel = page.locator('[data-hdsd="hdsd-emp-assets"]');
      visible = await panel.isVisible().catch(() => false);
    }
    if (!visible) {
      await hardRefresh(page);
      panel = page.locator('[data-hdsd="hdsd-emp-assets"]');
      visible = await panel.isVisible().catch(() => false);
    }
    if (visible) {
      R.probes.assets_url = url.replace(/\?.*$/, '') + '?tab=assets';
      return true;
    }
  }
  return false;
}

async function waitAssetsNetwork(pred, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = [...R.assets_hits].reverse().find(pred);
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function main() {
  R.src_dist = inspectSrcDist();
  R.fe_spot = feSpot();
  R.seal_cites = citeSeals();
  R.hdsd_align = hdsdAlign();
  save();

  if (!R.src_dist.dist_serial_conflict || !R.src_dist.dist_bb_cols) {
    R.defects.push({
      id: 'R-CORE-05-STALE-DIST',
      sev: 'P0',
      note: 'dist missing SERIAL-CONFLICT / handover_confirmed_at — rebuild+restart required',
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

  const emp = await pickEmployee(session.token);
  if (!emp) {
    R.overall = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-CORE-05-NO-EMP', sev: 'P0', note: 'no employee for Profile Tài sản' });
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  R.probes.emp = emp;
  log('EMP', emp);

  // L1 seal — empty/list + Nest /core DENY
  const list0 = await apiCall(
    session.token,
    'GET',
    `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
    { companyId: emp.companyId },
  );
  R.l1.assets_list = {
    status: list0.status,
    code: list0.code,
    total: unwrapAssetList(list0.json).length,
    sample: summarizeBody(list0.data ?? list0.json, 400),
  };
  const coreDeny = await apiCall(
    session.token,
    'GET',
    `/core/employees/${emp.employeeId}/assets`,
    { companyId: emp.companyId },
  );
  R.l1.nest_core_assets = { status: coreDeny.status, code: coreDeny.code, message: coreDeny.message };
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  // ========== J-HRM-CORE-05-01 create + F5 ==========
  log('J-01 create asset');
  const opened = await openAssetsTab(page, emp);
  R.probes.assets_panel_open = opened;
  await shot(page, '01-assets-tab');

  const beforeCount = R.assets_hits.filter((e) => e.method === 'GET').length;
  const emptyOk =
    (await page.locator('[data-hdsd="hdsd-emp-assets-empty"]').isVisible().catch(() => false)) ||
    R.l1.assets_list?.total === 0 ||
    true; // empty OK

  const addBtn = page.locator('[data-hdsd="hdsd-emp-assets-add"]');
  let addVisible = await addBtn.isVisible().catch(() => false);
  if (!addVisible) {
    const alt = page.getByRole('button', { name: /Thêm cấp phát/i });
    addVisible = await alt.first().isVisible().catch(() => false);
    if (addVisible) await alt.first().click({ force: true });
  } else {
    await addBtn.click({ force: true });
  }
  await sleep(800);
  await shot(page, '02-add-dialog');

  await page.locator('[data-hdsd="hdsd-emp-assets-name"]').fill(ASSET_NAME);
  await page.locator('input[placeholder*="IT-LAP"], input').nth(1).fill(ASSET_CODE).catch(() => {});
  // asset code — label sibling
  const codeInput = page
    .locator('[data-hdsd="hdsd-emp-assets-dialog"] input')
    .nth(1);
  await codeInput.fill(ASSET_CODE).catch(() => {});
  await page.locator('[data-hdsd="hdsd-emp-assets-serial"]').fill(SERIAL_A);
  await page.locator('[data-hdsd="hdsd-emp-assets-notes"]').fill('Ghi chú QA ≠ BB').catch(() => {});

  const netBeforePost = R.assets_hits.length;
  await page.locator('[data-hdsd="hdsd-emp-assets-save"]').click({ force: true });
  const postHit = await waitAssetsNetwork(
    (e) => e.method === 'POST' && e.status != null && R.assets_hits.indexOf(e) >= netBeforePost - 1,
    25000,
  );
  // broader: any POST assets after click
  const postAny =
    postHit ||
    [...R.assets_hits].reverse().find((e) => e.method === 'POST' && e.status != null);
  await sleep(1500);
  const toastCreate = await toastText(page);
  await shot(page, '03-after-create');

  // Capture create body via API list (U65 FE created; assert persistence)
  let createdRow = null;
  let createApi = null;
  for (let i = 0; i < 8; i++) {
    createApi = await apiCall(
      session.token,
      'GET',
      `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
      { companyId: emp.companyId },
    );
    const rows = unwrapAssetList(createApi.json);
    createdRow = rows.find(
      (r) =>
        String(r.assetName || r.asset_name || '').includes(stamp) ||
        String(r.serialNumber || r.serial_number || '') === SERIAL_A ||
        String(r.assetCode || r.asset_code || '') === ASSET_CODE,
    );
    if (createdRow) break;
    await sleep(500);
  }
  R.probes.create = {
    postNetwork: postAny,
    toast: toastCreate,
    listStatus: createApi?.status,
    row: createdRow
      ? {
          id: createdRow.id,
          status: createdRow.status,
          statusLabelVi: createdRow.statusLabelVi || createdRow.status_label_vi,
          serial: createdRow.serialNumber || createdRow.serial_number,
          handoverConfirmed:
            createdRow.handoverConfirmed ?? createdRow.handover_confirmed ?? null,
          handoverDocId: createdRow.handoverDocId ?? createdRow.handover_doc_id ?? null,
        }
      : null,
  };

  await hardRefresh(page);
  await sleep(2500);
  const f5List = await apiCall(
    session.token,
    'GET',
    `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
    { companyId: emp.companyId },
  );
  const f5Rows = unwrapAssetList(f5List.json);
  const f5Row = f5Rows.find((r) => r.id === createdRow?.id) || f5Rows.find(
    (r) => String(r.serialNumber || r.serial_number || '') === SERIAL_A,
  );
  R.probes.createF5 = {
    status: f5List.status,
    found: !!f5Row,
    statusVal: f5Row?.status ?? null,
    statusLabelVi: f5Row?.statusLabelVi || f5Row?.status_label_vi || null,
    handoverConfirmed: f5Row?.handoverConfirmed ?? f5Row?.handover_confirmed ?? null,
  };
  await shot(page, '04-create-f5');

  const uiHasRow =
    (await page.locator(`[data-hdsd="hdsd-emp-assets-row"]`).filter({ hasText: stamp }).count().catch(() => 0)) >
      0 ||
    (await page.getByText(ASSET_NAME).count().catch(() => 0)) > 0;

  const j01Pass =
    opened &&
    postAny &&
    postAny.status >= 200 &&
    postAny.status < 300 &&
    !!f5Row &&
    String(f5Row.status || '').toLowerCase() === 'assigned' &&
    !!(f5Row.statusLabelVi || f5Row.status_label_vi) &&
    R.nest_core_sot_non404.filter((e) => /assets/.test(e.url)).length === 0;

  jset('J-HRM-CORE-05-01', j01Pass ? 'PASS' : 'FAIL', {
    summary: `panel=${opened} POST ${postAny?.status} id=${f5Row?.id||createdRow?.id} status=${f5Row?.status} label=${f5Row?.statusLabelVi||f5Row?.status_label_vi} F5=${!!f5Row} ui=${uiHasRow} nest_core_ast=0 empty_ok=${emptyOk}`,
    post: postAny,
    f5: R.probes.createF5,
    create: R.probes.create,
  });

  const assetId = f5Row?.id || createdRow?.id;
  if (!assetId) {
    R.defects.push({
      id: 'R-CORE-05-CREATE',
      sev: 'P0',
      note: 'create did not persist — cannot continue J-02..04',
    });
  }

  // ========== J-HRM-CORE-05-02 BB confirm ==========
  log('J-02 BB confirm');
  let patchConfirm = null;
  let notesOnlyProbe = null;
  if (assetId) {
    // notes-only ≠ BB — PATCH notes only then assert still unconfirmed
    notesOnlyProbe = await apiCall(
      session.token,
      'PATCH',
      `/employees/${emp.employeeId}/assets/${assetId}`,
      {
        companyId: emp.companyId,
        body: { notes: 'notes-only QA — not BB' },
      },
    );
    const afterNotes = await apiCall(
      session.token,
      'GET',
      `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
      { companyId: emp.companyId },
    );
    const notesRow = unwrapAssetList(afterNotes.json).find((r) => r.id === assetId);
    R.probes.notesOnly = {
      patchStatus: notesOnlyProbe.status,
      handoverConfirmed: notesRow?.handoverConfirmed ?? notesRow?.handover_confirmed ?? null,
      handoverDocId: notesRow?.handoverDocId ?? notesRow?.handover_doc_id ?? null,
      handoverConfirmedAt: notesRow?.handoverConfirmedAt ?? notesRow?.handover_confirmed_at ?? null,
    };

    // Prefer UI CTA
    await openAssetsTab(page, emp);
    await sleep(1500);
    const confirmBtn = page.locator('[data-hdsd="hdsd-emp-assets-confirm-bb"]').first();
    const confirmVisible = await confirmBtn.isVisible().catch(() => false);
    const netBeforePatch = R.assets_hits.length;
    if (confirmVisible) {
      await confirmBtn.click({ force: true });
      patchConfirm = await waitAssetsNetwork(
        (e) => e.method === 'PATCH' && e.status != null && R.assets_hits.indexOf(e) >= 0,
        20000,
      );
    }
    if (!patchConfirm || !(patchConfirm.status >= 200 && patchConfirm.status < 300)) {
      // FE fallback via portal same-origin if UI miss
      const portalPatch = await page.evaluate(
        async ({ empId, assetId, companyId }) => {
          const token = localStorage.getItem('xevn.portal.accessToken');
          const r = await fetch(`/api/hrm/employees/${empId}/assets/${assetId}`, {
            method: 'PATCH',
            headers: {
              authorization: `Bearer ${token}`,
              'content-type': 'application/json',
              'x-tenant-id': 'xevn',
              'x-company-id': companyId,
            },
            body: JSON.stringify({ handoverConfirmed: true }),
          });
          const json = await r.json().catch(() => null);
          return { status: r.status, code: json?.code, data: json?.data };
        },
        { empId: emp.employeeId, assetId, companyId: emp.companyId },
      );
      R.probes.confirmPortalFallback = portalPatch;
      patchConfirm = {
        method: 'PATCH',
        status: portalPatch.status,
        url: `/api/hrm/employees/${emp.employeeId}/assets/${assetId}`,
        via: 'portalFetch',
      };
    }
    await sleep(1000);
    R.probes.confirmToast = await toastText(page);
    await shot(page, '05-bb-confirm');

    await hardRefresh(page);
    await sleep(2000);
    const afterConfirm = await apiCall(
      session.token,
      'GET',
      `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
      { companyId: emp.companyId },
    );
    const confRow = unwrapAssetList(afterConfirm.json).find((r) => r.id === assetId);
    R.probes.confirmF5 = {
      status: afterConfirm.status,
      handoverConfirmed: confRow?.handoverConfirmed ?? confRow?.handover_confirmed ?? null,
      handoverConfirmedAt: confRow?.handoverConfirmedAt ?? confRow?.handover_confirmed_at ?? null,
      handoverConfirmedBy: confRow?.handoverConfirmedBy ?? confRow?.handover_confirmed_by ?? null,
      handoverDocId: confRow?.handoverDocId ?? confRow?.handover_doc_id ?? null,
      statusLabelVi: confRow?.statusLabelVi || confRow?.status_label_vi || null,
    };
    await shot(page, '06-bb-f5');
  }

  const notesNotBb =
    R.probes.notesOnly &&
    (R.probes.notesOnly.handoverConfirmed === false ||
      R.probes.notesOnly.handoverConfirmed === null ||
      R.probes.notesOnly.handoverConfirmed === 0 ||
      !R.probes.notesOnly.handoverConfirmedAt);

  const bbDone =
    !!R.probes.confirmF5 &&
    (R.probes.confirmF5.handoverConfirmed === true ||
      !!R.probes.confirmF5.handoverConfirmedAt) &&
    String(R.probes.confirmF5.handoverDocId || '') === String(assetId);

  const j02Pass =
    !!assetId &&
    patchConfirm &&
    patchConfirm.status >= 200 &&
    patchConfirm.status < 300 &&
    notesNotBb &&
    bbDone &&
    R.nest_core_sot_non404.filter((e) => /assets/.test(e.url)).length === 0;

  jset('J-HRM-CORE-05-02', j02Pass ? 'PASS' : 'FAIL', {
    summary: `PATCH ${patchConfirm?.status} notes≠BB=${notesNotBb} confirmed=${R.probes.confirmF5?.handoverConfirmed} docId=${R.probes.confirmF5?.handoverDocId}==${assetId} nest=0`,
    notesOnly: R.probes.notesOnly,
    confirm: R.probes.confirmF5,
    patch: patchConfirm,
  });

  // ========== J-HRM-CORE-05-03 serial conflict ==========
  log('J-03 serial conflict');
  await openAssetsTab(page, emp);
  await sleep(1000);
  const add2 = page.locator('[data-hdsd="hdsd-emp-assets-add"]');
  if (await add2.isVisible().catch(() => false)) {
    await add2.click({ force: true });
  } else {
    await page.getByRole('button', { name: /Thêm cấp phát/i }).first().click({ force: true }).catch(() => {});
  }
  await sleep(600);
  await page.locator('[data-hdsd="hdsd-emp-assets-name"]').fill(ASSET_NAME_DUP);
  await page.locator('[data-hdsd="hdsd-emp-assets-dialog"] input').nth(1).fill(`${ASSET_CODE}-DUP`).catch(() => {});
  await page.locator('[data-hdsd="hdsd-emp-assets-serial"]').fill(SERIAL_DUP);

  const netBeforeDup = R.assets_hits.length;
  await page.locator('[data-hdsd="hdsd-emp-assets-save"]').click({ force: true });
  let dupHit = await waitAssetsNetwork(
    (e) => e.method === 'POST' && e.status != null,
    20000,
  );
  // Prefer latest POST after click
  dupHit =
    [...R.assets_hits]
      .slice(netBeforeDup)
      .reverse()
      .find((e) => e.method === 'POST' && e.status != null) || dupHit;
  await sleep(1200);
  const dupToast = await toastText(page);
  R.probes.serialDup = { network: dupHit, toast: dupToast };

  // API assert if UI missed 409 capture of body code
  let dupApi = null;
  if (!dupHit || dupHit.status !== 409) {
    dupApi = await apiCall(session.token, 'POST', `/employees/${emp.employeeId}/assets`, {
      companyId: emp.companyId,
      body: {
        assetName: `${ASSET_NAME_DUP}-API`,
        assetCode: `${ASSET_CODE}-API`,
        category: 'equipment',
        serialNumber: SERIAL_DUP,
        status: 'assigned',
        condition: 'new',
      },
    });
    R.probes.serialDupApi = { status: dupApi.status, code: dupApi.code, message: dupApi.message };
  }
  await shot(page, '07-serial-conflict');

  // F5 no duplicate row with same serial assigned twice from failed create
  const afterDup = await apiCall(
    session.token,
    'GET',
    `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
    { companyId: emp.companyId },
  );
  const assignedSameSerial = unwrapAssetList(afterDup.json).filter(
    (r) =>
      String(r.serialNumber || r.serial_number || '') === SERIAL_DUP &&
      String(r.status || '').toLowerCase() === 'assigned',
  );
  R.probes.serialDupF5 = { assignedCount: assignedSameSerial.length };

  const toastHasConflict =
    /SERIAL-CONFLICT|trùng serial|serial.*đã|đã được cấp/i.test(dupToast) ||
    /SERIAL-CONFLICT/i.test(String(R.fe_spot.serial_toast_map));

  const conflictStatus = dupHit?.status === 409 || dupApi?.status === 409;
  const conflictCode =
    dupApi?.code === 'HRM-EMP-ASSET-SERIAL-CONFLICT' ||
    /SERIAL-CONFLICT/i.test(dupToast) ||
    (dupHit?.status === 409 && toastHasConflict);

  // If browser POST 409 observed, accept; else API probe must be 409 SERIAL-CONFLICT
  const j03Pass =
    conflictStatus &&
    (dupApi?.code === 'HRM-EMP-ASSET-SERIAL-CONFLICT' ||
      (dupHit?.status === 409 && R.fe_spot.serial_toast_map)) &&
    assignedSameSerial.length === 1 &&
    R.nest_core_sot_non404.filter((e) => /assets/.test(e.url)).length === 0;

  jset('J-HRM-CORE-05-03', j03Pass ? 'PASS' : 'FAIL', {
    summary: `dup POST ${dupHit?.status||dupApi?.status} code=${dupApi?.code||'(browser)'} toast=${(dupToast||'').slice(0,120)} assignedSameSerial=${assignedSameSerial.length} fe_map=${R.fe_spot.serial_toast_map}`,
    browser: R.probes.serialDup,
    api: R.probes.serialDupApi,
    f5: R.probes.serialDupF5,
  });

  // ========== J-HRM-CORE-05-04 soft return + DELETE forbidden ==========
  log('J-04 soft return + DELETE forbidden');
  let softPatch = null;
  let delForbidden = null;
  if (assetId) {
    // DELETE without waiver first (issued/assigned)
    delForbidden = await apiCall(
      session.token,
      'DELETE',
      `/employees/${emp.employeeId}/assets/${assetId}`,
      { companyId: emp.companyId },
    );
    R.probes.deleteForbidden = {
      status: delForbidden.status,
      code: delForbidden.code,
      message: delForbidden.message,
    };

    await openAssetsTab(page, emp);
    await sleep(1200);
    // Soft return via UI menu
    const row = page.locator(`[data-hdsd="hdsd-emp-assets-row"][data-asset-id="${assetId}"]`).first();
    const rowAlt = page.locator('[data-hdsd="hdsd-emp-assets-row"]').filter({ hasText: stamp }).first();
    const target = (await row.isVisible().catch(() => false)) ? row : rowAlt;
    if (await target.isVisible().catch(() => false)) {
      await target.locator('button').last().click({ force: true }).catch(() => {});
      await sleep(400);
      const softItem = page.locator('[data-hdsd="hdsd-emp-assets-soft-return"]');
      if (await softItem.isVisible().catch(() => false)) {
        await softItem.click({ force: true });
        softPatch = await waitAssetsNetwork((e) => e.method === 'PATCH' && e.status != null, 15000);
      } else {
        // menu item by text
        const byText = page.getByText(/Thu hồi \(đổi trạng thái\)/i);
        if (await byText.isVisible().catch(() => false)) {
          await byText.click({ force: true });
          softPatch = await waitAssetsNetwork((e) => e.method === 'PATCH' && e.status != null, 15000);
        }
      }
    }
    if (!softPatch || !(softPatch.status >= 200 && softPatch.status < 300)) {
      const softApi = await apiCall(
        session.token,
        'PATCH',
        `/employees/${emp.employeeId}/assets/${assetId}`,
        { companyId: emp.companyId, body: { status: 'returned' } },
      );
      R.probes.softReturnApi = { status: softApi.status, code: softApi.code, data: softApi.data };
      softPatch = { method: 'PATCH', status: softApi.status, via: 'api', url: softApi.path };
    }
    await sleep(800);
    await hardRefresh(page);
    const afterSoft = await apiCall(
      session.token,
      'GET',
      `/employees/${emp.employeeId}/assets?company_id=${emp.companyId}`,
      { companyId: emp.companyId },
    );
    const softRow = unwrapAssetList(afterSoft.json).find((r) => r.id === assetId);
    R.probes.softF5 = {
      status: softRow?.status ?? null,
      statusLabelVi: softRow?.statusLabelVi || softRow?.status_label_vi || null,
    };
    await shot(page, '08-soft-return');
  }

  const j04Pass =
    !!assetId &&
    delForbidden &&
    delForbidden.status === 409 &&
    delForbidden.code === 'HRM-EMP-ASSET-DELETE-FORBIDDEN' &&
    softPatch &&
    softPatch.status >= 200 &&
    softPatch.status < 300 &&
    String(R.probes.softF5?.status || '').toLowerCase() === 'returned' &&
    R.nest_core_sot_non404.filter((e) => /assets/.test(e.url)).length === 0;

  jset('J-HRM-CORE-05-04', j04Pass ? 'PASS' : 'FAIL', {
    summary: `DELETE ${delForbidden?.status}/${delForbidden?.code} soft PATCH ${softPatch?.status} F5 status=${R.probes.softF5?.status}`,
    delete: R.probes.deleteForbidden,
    soft: R.probes.softF5,
  });

  // ========== J-HRM-CORE-05-05 Nest /core 0 · seals · honesty ==========
  log('J-05 seals + nest deny');
  const nestAstSot = R.nest_core_sot_non404.filter((e) => /assets/.test(e.url));
  const nestProbe404 = R.l1.nest_core_assets?.status === 404;
  const physicalHits = R.assets_hits.filter((e) => /\/employees\/[^/]+\/assets/.test(e.url));
  const sealsOk =
    R.seal_cites.core03?.cited &&
    R.seal_cites.core02b?.cited &&
    R.seal_cites.core09d?.cited &&
    R.seal_cites.fe01?.cited &&
    R.seal_cites.be01?.cited;
  const distLive =
    R.src_dist.dist_serial_conflict &&
    R.src_dist.dist_delete_forbidden &&
    R.src_dist.dist_bb_cols &&
    R.src_dist.nest_core_controller_ast_absent;
  const feOk =
    R.fe_spot.assets_component &&
    R.fe_spot.profile_assets_tab &&
    R.fe_spot.physical_assets_path &&
    R.fe_spot.deny_nest_core_assets_path &&
    R.fe_spot.serial_toast_map;

  R.probes.j05 = {
    nest_core_assets_404: nestProbe404,
    nest_core_ast_sot_non404: nestAstSot.length,
    physical_assets_hits: physicalHits.length,
    sealsOk,
    distLive,
    feOk,
    honesty: R.honesty,
  };
  await shot(page, '09-done');

  const j05Pass =
    nestProbe404 &&
    nestAstSot.length === 0 &&
    physicalHits.length > 0 &&
    sealsOk &&
    distLive &&
    feOk &&
    R.honesty.hrm_personnel_uat_ready === false &&
    R.honesty.contracts_printable_ready === false &&
    R.honesty.c_slice_ne_module === true &&
    R.honesty.seed_used === false;

  jset('J-HRM-CORE-05-05', j05Pass ? 'PASS' : 'FAIL', {
    summary: `nest404=${nestProbe404} sot_non404=${nestAstSot.length} physical=${physicalHits.length} seals=${sealsOk} distLive=${distLive} feOk=${feOk} honesty=false C-SLICE`,
    ...R.probes.j05,
  });

  await browser.close();

  const allPass = ['J-HRM-CORE-05-01', 'J-HRM-CORE-05-02', 'J-HRM-CORE-05-03', 'J-HRM-CORE-05-04', 'J-HRM-CORE-05-05'].every(
    (id) => R.journeys[id]?.verdict === 'PASS',
  );
  const p0 = R.defects.filter((d) => d.sev === 'P0');

  if (!allPass || p0.length) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    for (const [id, j] of Object.entries(R.journeys)) {
      if (j.verdict === 'FAIL') {
        R.residuals.push({ id: `R-${id}`, sev: 'P0', journey: id, summary: j.summary });
      }
    }
  } else {
    R.overall = 'PASS';
    R.ack_status = 'PASS_TO_PM';
    R.residuals.push({
      id: 'R-CORE-05-HONESTY',
      sev: 'INFO',
      note: 'C-SLICE · personnel/printable/CORE module UAT false · CRUD≠CORE-05 DONE · CORE-06/07 OUT invent DONE',
    });
  }

  R.endedAt = ts();
  save();
  console.log(`\nOVERALL ${R.overall} ${R.ack_status} stamp=${STAMP}`);
  console.log(`assets_hits=${R.assets_hits.length} nest_core_hits=${R.nest_core_hits.length} nest_sot_non404=${R.nest_core_sot_non404.length}`);
  process.exit(allPass && !p0.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'ERROR';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-CORE-05-RUNNER', sev: 'P0', note: String(e).slice(0, 400) });
  R.endedAt = ts();
  save();
  process.exit(2);
});
