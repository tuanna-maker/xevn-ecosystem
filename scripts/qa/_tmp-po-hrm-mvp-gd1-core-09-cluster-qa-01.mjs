#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-09-CLUSTER-QA-01 — U65 browser J-HRM-CORE-09-01..06
 * (01) 0 mẫu → ZERO-TPL CTA · Lưu VER disabled · Nest /core 0 · no fake VER
 * (02) Chọn mẫu → Xem trước → POST preview 200 · merged_fields · ephemeral
 * (03) Thiếu field → can_issue=false + missing · no silent VER 2xx
 * (04) PREV cb_masked banner (or CEO C&B OBS) · không invent C&B DONE
 * (05) PREV đủ → Lưu VER → F5 · ≠ printable flip
 * (06) Registry without template · footer 09a–d≠DONE · printable false · CORE-07 RETAIN · soft≠CORE-06
 * DENY seed · Nest /core SoT · printable flip · claim registry/09a–d=CORE-09 DONE · reopen sealed J-*
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL || 'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5175',
];
let PORTAL = PORTAL_CANDIDATES[0];
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `CORE09QA-${Date.now().toString(36).toUpperCase()}`;
const CONTRACT_CODE = `HD-CORE09-${STAMP.slice(-6)}`;
const CONTRACT_CODE_NOTPL = `HD-CORE09NT-${STAMP.slice(-6)}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-09-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on:
    'FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md · API-01 CONFIRMED RETAIN',
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    personnel_core_uat: false,
    ctr_module_uat: false,
    seed_used: false,
    c_slice_ne_module: true,
    registry_ne_core09_done: true,
    peers_09ad_ne_core09_done: true,
    soft_ne_core06_done: true,
    core07_ne_done_retain: true,
    pay_att_printable_invent_done: false,
    word_docx_out: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  preview_hits: [],
  contract_hits: [],
  print_version_hits: [],
  template_hits: [],
  ver_bodies: [],
  preview_bodies: [],
  create_bodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
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

function trackUrl(url, method, status, bodySnippet) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const preview = /\/contracts-insurance\/contracts\/[^/?]+\/preview/.test(url);
  const pdf = /\/print-versions\/[^/?]+\/pdf/.test(url);
  const printVer = /\/print-versions/.test(url) && !pdf;
  const templates = /\/contracts-insurance\/contract-templates/.test(url);
  const contracts =
    /\/contracts-insurance\/contracts(\?|$|\/)/.test(url) &&
    !/pack-resolve|preview|print-versions/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
    status: status ?? null,
    at: ts(),
    nest_core,
    preview,
    contracts,
    printVer,
    templates,
    bodySnippet: bodySnippet || undefined,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (preview) R.preview_hits.push(entry);
  if (contracts) R.contract_hits.push(entry);
  if (printVer) R.print_version_hits.push(entry);
  if (templates) R.template_hits.push(entry);
}

function lastHit(pred) {
  for (let i = R.network.length - 1; i >= 0; i--) {
    if (pred(R.network[i])) return R.network[i];
  }
  return null;
}

function rowsOf(payload) {
  const d = payload?.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}

async function loginToken() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function apiJson(method, path, token, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await fetch(`${HRM}${path}`, init);
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return {
    status: r.status,
    code: json?.error?.code ?? json?.code ?? null,
    json,
    snippet: text.slice(0, 900),
  };
}

async function l1Seal(token) {
  const probes = [];
  async function one(method, path, body) {
    const res = await apiJson(method, path, token, body);
    probes.push({
      method,
      path,
      status: res.status,
      code: res.code,
      cannot: /Cannot (GET|POST|PUT|PATCH|DELETE)/i.test(res.snippet || ''),
      snippet: res.snippet.slice(0, 220),
    });
    return res;
  }

  const emps = await one('GET', '/api/hrm/employees?page_size=5&company_id=main');
  const empRows = rowsOf(emps.json);
  const emp = empRows.find((e) => e.status === 'active' || e.employment_status === 'active') || empRows[0] || null;
  R.l1.employee_id = emp?.id || null;
  R.l1.employee_name = emp?.full_name || emp?.name || null;

  const tpls = await one(
    'GET',
    '/api/hrm/contracts-insurance/contract-templates?company_id=main&status=active',
  );
  const tplRows = rowsOf(tpls.json);
  const by = {};
  for (const t of tplRows) by[t.pack_code] = (by[t.pack_code] || 0) + 1;
  R.l1.templates_active = { total: tplRows.length, by };
  // Prefer proven can_issue GENERAL (peer 09c) — avoid empty QA_* stubs first
  R.l1.tpl_gen =
    tplRows.find((t) => t.pack_code === 'GENERAL' && String(t.code || '') === 'TPL_CLQA4-KN5SCA') ||
    tplRows.find((t) => t.pack_code === 'GENERAL' && /XEVN_FT_12M/i.test(String(t.code || ''))) ||
    tplRows.find(
      (t) =>
        t.pack_code === 'GENERAL' &&
        Array.isArray(t.clauses) &&
        t.clauses.length > 0 &&
        !/^QA_/i.test(String(t.code || '')),
    ) ||
    tplRows.find((t) => t.pack_code === 'GENERAL' && !/^QA_/i.test(String(t.code || ''))) ||
    tplRows.find((t) => t.pack_code === 'GENERAL') ||
    null;
  R.l1.tpl_dr = tplRows.find((t) => t.pack_code === 'DRIVER' && /XEVN_FT/i.test(String(t.code || ''))) ||
    tplRows.find((t) => t.pack_code === 'DRIVER') ||
    null;

  const clist = await one(
    'GET',
    '/api/hrm/contracts-insurance/contracts?page_size=5&company_id=main',
  );
  const contracts = rowsOf(clist.json);
  R.l1.sample_contract_id = contracts[0]?.id || null;

  const coreList = await one('GET', '/api/hrm/core/contracts?company_id=main');
  R.l1.nest_core_list_deny = coreList.status === 404 || !!coreList.cannot;

  const corePrev = R.l1.sample_contract_id
    ? await one(
        'POST',
        `/api/hrm/core/contracts/${R.l1.sample_contract_id}/preview?company_id=main`,
        { pack_code: 'GENERAL' },
      )
    : { status: 0, cannot: true };
  R.l1.nest_core_prev_deny = corePrev.status === 404 || !!corePrev.cannot;

  const coreVer = R.l1.sample_contract_id
    ? await one(
        'GET',
        `/api/hrm/core/contracts/${R.l1.sample_contract_id}/print-versions?company_id=main`,
      )
    : { status: 0, cannot: true };
  R.l1.nest_core_ver_deny = coreVer.status === 404 || !!coreVer.cannot;

  R.l1.probes = probes;
  R.l1.ok =
    R.l1.nest_core_list_deny &&
    R.l1.nest_core_prev_deny &&
    R.l1.nest_core_ver_deny &&
    (R.l1.templates_active?.total || 0) > 0 &&
    !!R.l1.employee_id;
  save();
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function pickFirstOption(page, testId) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = page.getByRole('option').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  return false;
}

async function selectOptionByText(page, testId, textRe) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(600);
  const opt = page.getByRole('option').filter({ hasText: textRe }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function pickTplByCode(page, code) {
  const trig = page.getByTestId('ctr-print-template');
  if (!(await trig.isVisible().catch(() => false))) return false;
  await trig.click({ force: true });
  await sleep(700);
  const opt = page.getByTestId(`ctr-print-tpl-option-${code}`);
  if ((await opt.count().catch(() => 0)) > 0) {
    await opt.first().click({ force: true });
    await sleep(400);
    return true;
  }
  const byText = page.getByRole('option').filter({ hasText: code }).first();
  if (await byText.isVisible().catch(() => false)) {
    await byText.click({ force: true });
    await sleep(400);
    return true;
  }
  // first real option after __none__
  const opts = page.getByRole('option');
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const t = await opts.nth(i).innerText().catch(() => '');
    if (/Chưa chọn|__none__/i.test(t)) continue;
    await opts.nth(i).click({ force: true });
    await sleep(400);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

function fingerprintFromPreviewJson(json) {
  const d = json?.data ?? json ?? {};
  const mf = d.merged_fields || {};
  const salaryLeakKeys = Object.keys(mf).filter((k) =>
    /salary|luong|wage|mst|tax_code|base_pay/i.test(k),
  );
  return {
    pack: d.pack_code,
    can_issue: d.can_issue,
    cb_masked: d.cb_masked,
    template_code: d.template_code || null,
    missing_fields: d.missing_fields,
    missing_clauses: d.missing_clauses,
    merged_keys: Object.keys(mf).slice(0, 16),
    merged_count: Object.keys(mf).length,
    salary_like_keys: salaryLeakKeys.slice(0, 8),
    salary_like_values: salaryLeakKeys.slice(0, 4).map((k) => String(mf[k] ?? '').slice(0, 40)),
  };
}

function verRecordFromJson(json) {
  const d = json?.data ?? json ?? {};
  return {
    id: d.id,
    version_no: d.version_no,
    pack_code: d.pack_code,
    status: d.status,
    code: json?.code,
  };
}

async function openContractEdit(page, code) {
  await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const search = page.getByPlaceholder(/tìm|search/i).first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(code);
    await sleep(1500);
  }
  const row = page.locator('tr', { hasText: code }).first();
  const rowVisible = await row.isVisible({ timeout: 12000 }).catch(() => false);
  if (!rowVisible) return false;
  await row
    .getByRole('button', { name: /sửa|edit/i })
    .click({ force: true })
    .catch(async () => {
      await row.locator('button').nth(1).click({ force: true });
    });
  await sleep(1500);
  let dialog = page.getByTestId('hdsd-contracts-form-dialog');
  let open = await dialog.isVisible().catch(() => false);
  if (!open) {
    await row.locator('button').filter({ has: page.locator('svg') }).nth(1).click({ force: true });
    await sleep(1500);
    open = await dialog.isVisible().catch(() => false);
  }
  return open;
}

async function waitSpineReady(page, { allowZeroTpl = false } = {}) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const spine = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
    const zero = await page.getByTestId('ctr-core09-zero-tpl-cta').isVisible().catch(() => false);
    const tpl = await page.getByTestId('ctr-print-template').isVisible().catch(() => false);
    if (spine && (allowZeroTpl ? zero || tpl : tpl && !zero)) return true;
    await sleep(400);
  }
  return false;
}

async function ensureGeneralReady(page) {
  await waitSpineReady(page, { allowZeroTpl: false }).catch(() => false);
  const ov = page.getByTestId('ctr-print-override-work_location');
  if (await ov.isVisible().catch(() => false)) {
    await ov.fill('Hà Nội — QA CORE09');
  }
  await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i).catch(() => {});
  await sleep(400);
  if (R.l1.tpl_gen?.code) {
    await pickTplByCode(page, R.l1.tpl_gen.code);
  } else {
    await pickTplByCode(page, 'TPL_CLQA4-KN5SCA');
  }
  await sleep(500);
}

function isPreviewOkStatus(st) {
  return st === 200 || st === 201;
}

async function fillCreateForm(page, code) {
  const createBtn = page.getByTestId('hdsd-contracts-create-btn');
  if (!(await createBtn.isVisible({ timeout: 15000 }).catch(() => false))) {
    throw new Error('create btn missing');
  }
  await createBtn.click({ force: true });
  await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 25000 });
  await sleep(1200);
  let formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
  const deadline = Date.now() + 45000;
  while (!formReady && Date.now() < deadline) {
    await pickFirstOption(page, 'hdsd-contracts-form-employee');
    await pickFirstOption(page, 'hdsd-contracts-form-contract-type');
    await sleep(700);
    formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
  }
  await pickFirstOption(page, 'hdsd-contracts-form-employee');
  await sleep(800);
  const codeInput = page.locator('#contract_code');
  if (await codeInput.isVisible().catch(() => false)) await codeInput.fill(code);
}

async function assertHonestyUi(page, journey) {
  const reg = page.getByTestId('ctr-core09-registry-honesty');
  const spine = page.getByTestId('ctr-core09-honesty');
  const print = page.getByTestId('ctr-print-honesty');
  const regT = ((await reg.textContent().catch(() => '')) || '').trim();
  const spineT = ((await spine.textContent().catch(() => '')) || '').trim();
  const printT = ((await print.textContent().catch(() => '')) || '').trim();
  const blob = `${regT}\n${spineT}\n${printT}`;
  const checks = {
    printable_false: /contracts_printable_ready\s*=\s*false/i.test(blob),
    peers_09ad_ne: /09a.?d.*≠.*CORE-09 DONE|09a.?d ADD ≠ CORE-09 DONE/i.test(blob),
    registry_ne: /registry.*≠.*CORE-09 DONE|registry CRUD ≠ CORE-09 DONE/i.test(blob),
    core07_retain: /CORE-07.*RETAIN|GATE\/ACT RETAIN/i.test(blob),
    soft_ne_06: /soft\s*≠\s*CORE-06 DONE|soft ≠ CORE-06 DONE/i.test(blob),
    word_out: /Word\/DOCX/i.test(blob),
    nest_core_0: /Nest \/core CTR\s*=\s*0/i.test(blob),
  };
  journey.notes.push(`honesty=${JSON.stringify(checks)}`);
  journey.honesty_blob = blob.slice(0, 500);
  return checks;
}

async function main() {
  for (const candidate of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(candidate);
      if (r.status > 0 && r.status < 500) {
        PORTAL = candidate;
        R.l0.portal = r.status;
        R.l0.portal_url = candidate;
        break;
      }
    } catch (e) {
      R.l0[`portal_try_${candidate}`] = String(e).slice(0, 80);
    }
  }
  R.env.PORTAL = PORTAL;
  try {
    R.l0.hrm = (await fetch(`${HRM}/api/hrm`)).status;
  } catch {
    R.l0.hrm = 'down';
  }
  try {
    R.l0.xbos = (await fetch(`${XBOS}/api/xbos`)).status;
  } catch {
    R.l0.xbos = 'down';
  }

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-CORE-09-AUTH', sev: 'P0', note: 'login token missing' });
    save();
    process.exit(2);
  }

  await l1Seal(token);
  if (!R.l1.ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-CORE-09-L1',
      sev: 'P0',
      note: `L1 incomplete nestList=${R.l1.nest_core_list_deny} nestPrev=${R.l1.nest_core_prev_deny} nestVer=${R.l1.nest_core_ver_deny} tpl=${R.l1.templates_active?.total} emp=${!!R.l1.employee_id}`,
    });
    save();
    console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, l1: R.l1 }, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    acceptDownloads: true,
  });
  const page = await context.newPage();

  let forceEmptyTemplates = false;

  page.on('request', (req) => {
    const u = req.url();
    if (!/\/api\/hrm\//.test(u)) return;
    trackUrl(u, req.method());
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    let snippet = '';
    let json = null;
    try {
      if (/\/preview|print-versions|\/contracts(\?|$)/.test(u) && !/\/pdf/.test(u)) {
        const text = await res.text().catch(() => '');
        snippet = text.slice(0, 500);
        try {
          json = JSON.parse(text);
        } catch {
          /* */
        }
        if (/\/preview/.test(u) && method === 'POST') {
          R.preview_bodies.push({
            at: ts(),
            status: res.status(),
            code: json?.code,
            url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
            fp: fingerprintFromPreviewJson(json),
          });
        }
        if (/print-versions/.test(u) && method === 'POST') {
          R.ver_bodies.push({
            at: ts(),
            status: res.status(),
            code: json?.code ?? json?.error?.code,
            url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
            nest_core: /\/api\/hrm\/core\//.test(u),
            physical: /\/contracts-insurance\//.test(u),
            ver: verRecordFromJson(json),
            error: json?.error || null,
            snippet: text.slice(0, 400),
          });
        }
        if (
          method === 'POST' &&
          /\/contracts-insurance\/contracts(\?|$)/.test(u) &&
          !/preview|pack-resolve|print-versions|activate/.test(u)
        ) {
          R.create_bodies.push({
            at: ts(),
            status: res.status(),
            code: json?.code ?? json?.error?.code,
            url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
            nest_core: /\/api\/hrm\/core\//.test(u),
            physical: /\/contracts-insurance\//.test(u),
            has_template_id: !!(json?.data?.template_id || json?.data?.templateId),
            contract_code: json?.data?.contract_code || json?.data?.code,
            id: json?.data?.id,
            snippet: text.slice(0, 350),
          });
        }
      }
    } catch {
      /* */
    }
    trackUrl(u, method, res.status(), snippet);
  });
  page.on('console', (m) => {
    if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 240));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));

  await page.route('**/api/hrm/contracts-insurance/contract-templates**', async (route) => {
    if (!forceEmptyTemplates) {
      await route.continue();
      return;
    }
    const req = route.request();
    if (req.method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        code: 'HRM-CTR-TPL-200',
        message: 'Contract templates listed (QA ZERO-TPL harness)',
        data: { total: 0, data: [] },
      }),
    });
  });

  await page.addInitScript(
    (s) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
        store.setItem(
          'xevn.portal.user',
          JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }),
        );
        store.setItem('xevn.portal.tenantId', s.tenantId);
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId);
      }
    },
    { token, email: EMAIL, companyId: COMPANY, tenantId: TENANT },
  );

  const j01 = { id: 'J-HRM-CORE-09-01', verdict: 'FAIL', notes: [], network: [] };
  const j02 = { id: 'J-HRM-CORE-09-02', verdict: 'FAIL', notes: [], network: [] };
  const j03 = { id: 'J-HRM-CORE-09-03', verdict: 'FAIL', notes: [], network: [] };
  const j04 = { id: 'J-HRM-CORE-09-04', verdict: 'FAIL', notes: [], network: [] };
  const j05 = { id: 'J-HRM-CORE-09-05', verdict: 'FAIL', notes: [], network: [] };
  const j06 = { id: 'J-HRM-CORE-09-06', verdict: 'FAIL', notes: [], network: [] };
  R.journeys = { j01, j02, j03, j04, j05, j06 };

  let createdContractId = null;
  let issuedVersionId = null;

  try {
    // ——— Bootstrap create (with template ready for spine) ———
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2800);
    await shot(page, '01-contracts-list');

    await fillCreateForm(page, CONTRACT_CODE);
    await ensureGeneralReady(page);
    await shot(page, '02-form-filled');
    await page.getByTestId('hdsd-contracts-form-submit').click({ force: true });
    R.click_log.push(`registry Lưu ${CONTRACT_CODE}`);
    await sleep(4000);
    const postCreate = lastHit(
      (h) =>
        h.method === 'POST' &&
        /\/contracts-insurance\/contracts(\?|$)/.test(h.url) &&
        !/preview|pack-resolve|print-versions|activate/.test(h.url),
    );
    R.click_log.push(`POST create ${postCreate?.status}`);
    const createBody0 = R.create_bodies[R.create_bodies.length - 1];
    if (createBody0?.id) {
      createdContractId = createBody0.id;
      R.l1.created_contract_id = createdContractId;
    }
    await shot(page, '03-after-create');

    const editOpen = await openContractEdit(page, CONTRACT_CODE);
    if (!editOpen) throw new Error('edit dialog failed after create');
    await sleep(1800);
    await ensureGeneralReady(page);
    await shot(page, '04-edit-spine');

    // Warm preview (capture can_issue path)
    {
      await page.getByTestId('ctr-print-preview-btn').click({ force: true });
      await sleep(3500);
      const prevBody0 = R.preview_bodies[R.preview_bodies.length - 1];
      const mCid = (prevBody0?.url || '').match(/\/contracts\/([^/?]+)\/preview/);
      if (mCid) {
        createdContractId = mCid[1];
        R.l1.created_contract_id = createdContractId;
      }
      R.click_log.push(
        `warm prev status=${prevBody0?.status} can_issue=${prevBody0?.fp?.can_issue} tpl=${prevBody0?.fp?.template_code}`,
      );
    }

    // ========== J-01 ZERO-TPL (route harness empty templates — no seed / no TPL wipe) ==========
    {
      const nestBefore = R.nest_core_hits.length;
      const verBefore = R.ver_bodies.length;
      forceEmptyTemplates = true;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2000);
      // reopen edit after reload
      const reOpen = await openContractEdit(page, CONTRACT_CODE);
      j01.notes.push(`reOpen=${reOpen}`);
      await sleep(2500);
      const cta = page.getByTestId('ctr-core09-zero-tpl-cta');
      const ctaVisible = await cta.isVisible().catch(() => false);
      const ctaText = ((await cta.textContent().catch(() => '')) || '').slice(0, 220);
      const saveBtn = page.getByTestId('ctr-print-save-version');
      const saveDisabled = !(await saveBtn.isEnabled().catch(() => true));
      const title = (await saveBtn.getAttribute('title').catch(() => '')) || '';
      j01.notes.push(
        `cta=${ctaVisible} saveDisabled=${saveDisabled} title=${title.slice(0, 80)} ctaText=${ctaText}`,
      );
      await shot(page, '05-j01-zero-tpl');
      // try force click — must not create VER
      await saveBtn.click({ force: true }).catch(() => {});
      await sleep(1500);
      const verDelta = R.ver_bodies.slice(verBefore).filter((v) => v.status >= 200 && v.status < 300);
      const nestDelta = R.nest_core_hits.length - nestBefore;
      j01.notes.push(`ver2xx_after_force=${verDelta.length} nest_delta=${nestDelta}`);
      j01.network.push(lastHit((h) => h.templates) || null);
      if (ctaVisible && saveDisabled && verDelta.length === 0 && nestDelta === 0) {
        j01.verdict = 'PASS';
      } else {
        j01.verdict = 'FAIL';
        R.defects.push({
          id: 'R-CORE-09-ZERO-TPL',
          sev: 'P0',
          note: `cta=${ctaVisible} saveDisabled=${saveDisabled} ver2xx=${verDelta.length} nest=${nestDelta}`,
        });
      }
      forceEmptyTemplates = false;
      // restore live templates — hard reopen edit + wait spine
      await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(1500);
      await openContractEdit(page, CONTRACT_CODE);
      await sleep(2500);
      const spineOk = await waitSpineReady(page, { allowZeroTpl: false });
      j01.notes.push(`restore_spine=${spineOk}`);
      await ensureGeneralReady(page);
    }

    // ========== J-02 Preview merged_fields ephemeral ==========
    {
      const nestBefore = R.nest_core_hits.length;
      const verBefore = R.ver_bodies.length;
      const prevCountBefore = R.preview_bodies.length;
      await ensureGeneralReady(page);
      await waitSpineReady(page, { allowZeroTpl: false });
      const prevBtn = page.getByTestId('ctr-print-preview-btn');
      const btnOk = await prevBtn.isVisible().catch(() => false);
      await prevBtn.click({ force: true });
      R.click_log.push('J02 Xem trước');
      await sleep(4000);
      const prevHit = lastHit(
        (h) =>
          h.method === 'POST' &&
          /\/contracts-insurance\/contracts\/[^/]+\/preview/.test(h.url) &&
          h.status != null,
      );
      const prevBody = R.preview_bodies[R.preview_bodies.length - 1];
      const previewUi = await page.getByTestId('ctr-print-preview-body').isVisible().catch(() => false);
      const meta = ((await page.getByTestId('ctr-print-preview-meta').textContent().catch(() => '')) || '');
      const ephemeral = /ephemeral/i.test(meta);
      const verDuring = R.ver_bodies.slice(verBefore).filter((v) => v.status === 201);
      const nestDelta = R.nest_core_hits.length - nestBefore;
      const newPrev = R.preview_bodies.length > prevCountBefore;
      j02.notes.push(
        `btnOk=${btnOk} prev=${prevHit?.status} code=${prevBody?.code} merged=${prevBody?.fp?.merged_count} ui=${previewUi} ephemeral=${ephemeral} ver201=${verDuring.length} nest=${nestDelta} newPrev=${newPrev}`,
      );
      j02.network.push(prevHit);
      await shot(page, '06-j02-preview');
      if (
        isPreviewOkStatus(prevHit?.status ?? prevBody?.status) &&
        /\/contracts-insurance\//.test(prevHit?.url || prevBody?.url || '') &&
        (prevBody?.fp?.merged_count || 0) > 0 &&
        previewUi &&
        ephemeral &&
        verDuring.length === 0 &&
        nestDelta === 0
      ) {
        j02.verdict = 'PASS';
      } else {
        j02.verdict = 'FAIL';
        R.defects.push({
          id: 'R-CORE-09-PREV',
          sev: 'P0',
          note: j02.notes.join(' | '),
        });
      }
    }

    // ========== J-03 Mandatory block ==========
    {
      const nestBefore = R.nest_core_hits.length;
      const verBefore = R.ver_bodies.length;
      // Deterministic: clear work_location on GENERAL (avoid DRIVER TPL-KEY flaky)
      await ensureGeneralReady(page);
      const ov = page.getByTestId('ctr-print-override-work_location');
      if (await ov.isVisible().catch(() => false)) await ov.fill('');
      await page.getByTestId('ctr-print-preview-btn').click({ force: true });
      R.click_log.push('J03 preview missing');
      await sleep(3500);
      const prevBody = R.preview_bodies[R.preview_bodies.length - 1];
      const canIssueFalse = prevBody?.fp?.can_issue === false;
      const missUi =
        (await page.getByTestId('ctr-print-missing-fields').isVisible().catch(() => false)) ||
        (await page.getByTestId('ctr-print-missing-clauses').isVisible().catch(() => false)) ||
        /mandatory block|can_issue=false/i.test(
          (await page.getByTestId('ctr-print-preview-meta').textContent().catch(() => '')) || '',
        );
      const saveBtn = page.getByTestId('ctr-print-save-version');
      const saveDisabled = !(await saveBtn.isEnabled().catch(() => true));
      await saveBtn.click({ force: true }).catch(() => {});
      await sleep(1500);
      const ver2xx = R.ver_bodies.slice(verBefore).filter((v) => v.status >= 200 && v.status < 300);
      const nestDelta = R.nest_core_hits.length - nestBefore;
      j03.notes.push(
        `can_issue=${prevBody?.fp?.can_issue} missUi=${missUi} saveDisabled=${saveDisabled} ver2xx=${ver2xx.length} missing=${JSON.stringify(prevBody?.fp?.missing_fields || []).slice(0, 180)} nest=${nestDelta}`,
      );
      await shot(page, '07-j03-mandatory');
      if (canIssueFalse && missUi && ver2xx.length === 0 && nestDelta === 0) {
        j03.verdict = 'PASS';
        if (saveDisabled) {
          R.residuals.push({
            id: 'R-QA-CORE-09-ISSUE-SOFT-DISABLE',
            sev: 'P2 OBS',
            note: 'FE disables Lưu when can_issue=false — server ISSUE-BLOCKED not clicked; missing + 0 INSERT asserted',
          });
        }
      } else {
        j03.verdict = 'FAIL';
        R.defects.push({ id: 'R-CORE-09-MANDATORY', sev: 'P0', note: j03.notes.join(' | ') });
      }
      // restore GENERAL + work_location for later
      await ensureGeneralReady(page);
    }

    // ========== J-04 C&B mask ==========
    {
      const nestBefore = R.nest_core_hits.length;
      await page.getByTestId('ctr-print-preview-btn').click({ force: true });
      await sleep(3000);
      const prevBody = R.preview_bodies[R.preview_bodies.length - 1];
      const cbMasked = prevBody?.fp?.cb_masked === true;
      const banner = await page.getByTestId('ctr-core09-cb-masked').isVisible().catch(() => false);
      const meta = (await page.getByTestId('ctr-print-preview-meta').textContent().catch(() => '')) || '';
      const nestDelta = R.nest_core_hits.length - nestBefore;
      j04.notes.push(
        `cb_masked=${prevBody?.fp?.cb_masked} banner=${banner} metaHasMask=${/cb_masked/i.test(meta)} salaryKeys=${JSON.stringify(prevBody?.fp?.salary_like_keys || [])} nest=${nestDelta}`,
      );
      await shot(page, '08-j04-cb-mask');
      if (cbMasked && banner && nestDelta === 0) {
        j04.verdict = 'PASS';
      } else if (!cbMasked && nestDelta === 0) {
        // Group CEO typically has C&B — mask not applied; honesty DENY invent C&B DONE still required
        j04.verdict = 'PASS';
        R.residuals.push({
          id: 'R-QA-CORE-09-CB-MASK-CEO',
          sev: 'P2 OBS',
          note: 'ceo@xe.vn Group CEO → PREV cb_masked=false (has C&B). Banner path present in FE; Non-C&B persona not in this seat. DENY invent C&B engine DONE.',
        });
      } else {
        j04.verdict = 'FAIL';
        R.defects.push({ id: 'R-CORE-09-CB-MASK', sev: 'P0', note: j04.notes.join(' | ') });
      }
    }

    // ========== J-05 Save VER → F5 · printable false ==========
    {
      const nestBefore = R.nest_core_hits.length;
      // Hard reopen to avoid stale spine after mandatory tests
      await openContractEdit(page, CONTRACT_CODE);
      await sleep(2000);
      await ensureGeneralReady(page);
      await waitSpineReady(page, { allowZeroTpl: false });
      const ov = page.getByTestId('ctr-print-override-work_location');
      if (await ov.isVisible().catch(() => false)) await ov.fill('Hà Nội — QA CORE09 VER');
      await page.getByTestId('ctr-print-preview-btn').click({ force: true });
      await sleep(4000);
      let prevBody = R.preview_bodies[R.preview_bodies.length - 1];
      // retry once if can_issue not true
      if (prevBody?.fp?.can_issue !== true) {
        await ensureGeneralReady(page);
        await page.getByTestId('ctr-print-preview-btn').click({ force: true });
        await sleep(4000);
        prevBody = R.preview_bodies[R.preview_bodies.length - 1];
      }
      const canIssue = prevBody?.fp?.can_issue === true;
      j05.notes.push(
        `pre_can_issue=${prevBody?.fp?.can_issue} tpl=${prevBody?.fp?.template_code} missing=${JSON.stringify(prevBody?.fp?.missing_fields || []).slice(0, 120)}`,
      );
      const saveBtn = page.getByTestId('ctr-print-save-version');
      // wait enable
      const enableDeadline = Date.now() + 8000;
      let enabled = await saveBtn.isEnabled().catch(() => false);
      while (!enabled && Date.now() < enableDeadline) {
        await sleep(400);
        enabled = await saveBtn.isEnabled().catch(() => false);
      }
      if (!canIssue || !enabled) {
        j05.notes.push(`BLOCKED cannot save VER — can_issue/enabled false (enabled=${enabled})`);
        j05.verdict = 'FAIL';
        R.defects.push({
          id: 'R-CORE-09-VER-GATE',
          sev: 'P0',
          note: `can_issue=${prevBody?.fp?.can_issue} enabled=${enabled} missing=${JSON.stringify(prevBody?.fp?.missing_fields || [])}`,
        });
      } else {
        await saveBtn.click({ force: true });
        R.click_log.push('J05 Lưu phiên bản in');
        await sleep(4500);
        const verHit = lastHit(
          (h) =>
            h.method === 'POST' &&
            /\/contracts-insurance\/.*print-versions/.test(h.url) &&
            h.status != null,
        );
        const verBody = R.ver_bodies[R.ver_bodies.length - 1];
        issuedVersionId = verBody?.ver?.id || null;
        j05.notes.push(
          `POST VER ${verHit?.status ?? verBody?.status} code=${verBody?.code} id=${issuedVersionId} physical=${verBody?.physical} nest=${verBody?.nest_core}`,
        );
        await shot(page, '09-j05-after-save');

        await page.keyboard.press('Escape').catch(() => {});
        await sleep(500);
        const re = await openContractEdit(page, CONTRACT_CODE);
        await sleep(2500);
        const honesty = await assertHonestyUi(page, j05);
        const nestDelta = R.nest_core_hits.length - nestBefore;
        const verOk =
          (verHit?.status >= 200 && verHit?.status < 300) ||
          (verBody?.status >= 200 && verBody?.status < 300);
        j05.notes.push(`F5_reopen=${re} nest_delta=${nestDelta}`);
        await shot(page, '10-j05-f5');

        if (
          verOk &&
          verBody?.physical === true &&
          verBody?.nest_core !== true &&
          honesty.printable_false &&
          nestDelta === 0
        ) {
          j05.verdict = 'PASS';
        } else {
          j05.verdict = 'FAIL';
          R.defects.push({ id: 'R-CORE-09-VER-F5', sev: 'P0', note: j05.notes.join(' | ') });
        }
      }
    }

    // ========== J-06 Registry without template + seals ==========
    {
      const nestBefore = R.nest_core_hits.length;
      await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      const honestyList = await assertHonestyUi(page, j06);
      const noTplNote = await page
        .getByTestId('ctr-core09-registry-no-tpl-note')
        .isVisible()
        .catch(() => false);
      // note may only show in create dialog — open create without selecting template
      await fillCreateForm(page, CONTRACT_CODE_NOTPL);
      // Explicitly leave print template as none if picker present
      const tplTrig = page.getByTestId('ctr-print-template');
      if (await tplTrig.isVisible().catch(() => false)) {
        await tplTrig.click({ force: true });
        await sleep(400);
        const none = page.getByRole('option', { name: /Chưa chọn/i }).first();
        if (await none.isVisible().catch(() => false)) await none.click({ force: true });
        else await page.keyboard.press('Escape');
      }
      const noteInDialog = await page
        .getByTestId('ctr-core09-registry-no-tpl-note')
        .isVisible()
        .catch(() => false);
      await shot(page, '11-j06-create-no-tpl');
      await page.getByTestId('hdsd-contracts-form-submit').click({ force: true });
      R.click_log.push(`J06 Lưu no-tpl ${CONTRACT_CODE_NOTPL}`);
      await sleep(4000);
      const createBody = R.create_bodies[R.create_bodies.length - 1];
      const postHit = lastHit(
        (h) =>
          h.method === 'POST' &&
          /\/contracts-insurance\/contracts(\?|$)/.test(h.url) &&
          !/preview|pack-resolve|print-versions/.test(h.url) &&
          h.status != null,
      );
      j06.notes.push(
        `POST ${postHit?.status} code=${createBody?.code} has_tpl=${createBody?.has_template_id} physical=${createBody?.physical} nest=${createBody?.nest_core} noteDialog=${noteInDialog} noteList=${noTplNote}`,
      );

      // F5 — row remains
      await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      const search = page.getByPlaceholder(/tìm|search/i).first();
      if (await search.isVisible().catch(() => false)) {
        await search.fill(CONTRACT_CODE_NOTPL);
        await sleep(1500);
      }
      const row = page.locator('tr', { hasText: CONTRACT_CODE_NOTPL }).first();
      const rowOk = await row.isVisible({ timeout: 10000 }).catch(() => false);
      const honesty2 = await assertHonestyUi(page, j06);
      const nestDelta = R.nest_core_hits.length - nestBefore;
      const nestTotal = R.nest_core_hits.length;
      j06.notes.push(`F5_row=${rowOk} nest_delta=${nestDelta} nest_total=${nestTotal}`);
      await shot(page, '12-j06-f5');

      const sealsOk =
        honestyList.printable_false &&
        honesty2.printable_false &&
        (honesty2.peers_09ad_ne || honestyList.peers_09ad_ne) &&
        (honesty2.core07_retain || honestyList.core07_retain) &&
        (honesty2.soft_ne_06 || honestyList.soft_ne_06) &&
        (honesty2.registry_ne || honestyList.registry_ne);

      if (
        postHit?.status >= 200 &&
        postHit?.status < 300 &&
        createBody?.physical === true &&
        createBody?.nest_core !== true &&
        createBody?.has_template_id !== true &&
        rowOk &&
        nestDelta === 0 &&
        sealsOk
      ) {
        j06.verdict = 'PASS';
      } else {
        j06.verdict = 'FAIL';
        R.defects.push({ id: 'R-CORE-09-REG-NOTPL', sev: 'P0', note: j06.notes.join(' | ') });
      }
    }
  } catch (e) {
    R.defects.push({ id: 'R-CORE-09-RUNTIME', sev: 'P0', note: String(e).slice(0, 400) });
    await shot(page, '99-error').catch(() => {});
  }

  await browser.close().catch(() => {});

  const allPass = [j01, j02, j03, j04, j05, j06].every((j) => j.verdict === 'PASS');
  const nestTotal = R.nest_core_hits.length;
  R.nest_core_browser_total = nestTotal;
  R.physical_only_assert =
    nestTotal === 0 &&
    R.preview_hits.every((h) => /contracts-insurance/.test(h.url)) &&
    R.print_version_hits.every((h) => /contracts-insurance/.test(h.url) || h.method === 'GET');

  if (nestTotal > 0) {
    R.defects.push({
      id: 'R-CORE-09-NEST-CORE',
      sev: 'P0',
      note: `Nest /core browser hits=${nestTotal}`,
    });
  }

  R.overall = allPass && nestTotal === 0 && R.defects.filter((d) => d.sev === 'P0').length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = {
    stamp: STAMP,
    overall: R.overall,
    journeys: Object.fromEntries(
      Object.entries(R.journeys).map(([k, v]) => [k, { id: v.id, verdict: v.verdict, notes: v.notes }]),
    ),
    nest_core: nestTotal,
    contract_code: CONTRACT_CODE,
    contract_code_notpl: CONTRACT_CODE_NOTPL,
    created_contract_id: createdContractId,
    issued_version_id: issuedVersionId,
    residuals: R.residuals,
    defects: R.defects,
  };
  save();
  console.log(JSON.stringify(R.summary, null, 2));
  process.exit(R.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-CORE-09-FATAL', sev: 'P0', note: String(e).slice(0, 500) });
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
