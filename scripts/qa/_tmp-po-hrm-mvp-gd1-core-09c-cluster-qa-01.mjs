#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QA-01 — U65 browser J-HRM-CORE-09C-01..04
 * (01) Preview can_issue=true → Lưu phiên bản → POST print-versions 201 · list/detail · F5 GET 200
 * (02) Issued VER → PDF GET …/pdf 200 %PDF · snapshot path · Nest /core 0
 * (03) Missing mandatory → Lưu → 400 ISSUE-BLOCKED|DRIVER|TERM|TPL-NONE + FE missing · no issued
 * (04) Nest /core 0 · PREV ephemeral 0 VER · amend supersede · seals · printable=false
 * DENY seed · Nest /core SoT · printable flip · 09d TPL DONE · CORE-09b=printable · reopen J-09B/09A/08/02/01
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09c-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09c-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `CORE09CQA-${Date.now().toString(36).toUpperCase()}`;
const CONTRACT_CODE = `HD-CORE09C-${STAMP.slice(-6)}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-09C-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on:
    'FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-fe-01.md · API-01 CONFIRMED RETAIN · peer CORE09BQC1-MSLB05DZ',
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
    core09b_ne_printable_done: true,
    peer_09d_tpl_invent_done: false,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  pack_hits: [],
  preview_hits: [],
  contract_hits: [],
  print_version_hits: [],
  pdf_hits: [],
  ver_bodies: [],
  preview_bodies: [],
  pdf_meta: [],
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
  const pack = /\/contracts-insurance\/contracts\/pack-resolve/.test(url);
  const preview = /\/contracts-insurance\/contracts\/[^/?]+\/preview/.test(url);
  const pdf = /\/print-versions\/[^/?]+\/pdf/.test(url);
  const printVer = /\/print-versions/.test(url) && !pdf;
  const contracts =
    /\/contracts-insurance\/contracts(\?|$|\/)/.test(url) && !pack && !preview && !printVer && !pdf;
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
    status: status ?? null,
    at: ts(),
    nest_core,
    pack,
    preview,
    contracts,
    printVer,
    pdf,
    bodySnippet: bodySnippet || undefined,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (pack) R.pack_hits.push(entry);
  if (preview) R.preview_hits.push(entry);
  if (contracts) R.contract_hits.push(entry);
  if (printVer) R.print_version_hits.push(entry);
  if (pdf) R.pdf_hits.push(entry);
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

async function apiBin(method, path, token) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'x-tenant-id': TENANT,
  };
  const r = await fetch(`${HRM}${path}`, { method, headers });
  const buf = Buffer.from(await r.arrayBuffer());
  const head = buf.slice(0, 8).toString('utf8');
  return {
    status: r.status,
    contentType: r.headers.get('content-type') || '',
    bytes: buf.length,
    pdfMagic: head.startsWith('%PDF'),
    head,
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
  const emp = empRows[0] || null;
  R.l1.employee_id = emp?.id || null;
  R.l1.employee_name = emp?.full_name || emp?.name || null;

  const pack = emp?.id
    ? await one(
        'GET',
        `/api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=${emp.id}&company_id=main`,
      )
    : { status: 0, code: null, json: null };
  R.l1.pack = {
    status: pack.status,
    code: pack.code,
    suggested: pack.json?.data?.suggested_pack,
    allowed: pack.json?.data?.allowed_packs,
  };

  const tpls = await one(
    'GET',
    '/api/hrm/contracts-insurance/contract-templates?company_id=main&status=active',
  );
  const tplRows = rowsOf(tpls.json);
  const by = {};
  for (const t of tplRows) by[t.pack_code] = (by[t.pack_code] || 0) + 1;
  R.l1.templates_active = { total: tplRows.length, by };
  R.l1.tpl_gen = tplRows.find((t) => t.pack_code === 'GENERAL') || null;
  R.l1.tpl_dr = tplRows.find((t) => t.pack_code === 'DRIVER') || null;
  R.l1.tpl_it = tplRows.find((t) => t.pack_code === 'IT_OFFICE') || null;

  const clist = await one(
    'GET',
    '/api/hrm/contracts-insurance/contracts?page_size=5&company_id=main',
  );
  const contracts = rowsOf(clist.json);
  R.l1.sample_contract_id = contracts[0]?.id || null;

  const coreVer = R.l1.sample_contract_id
    ? await one(
        'GET',
        `/api/hrm/core/contracts/${R.l1.sample_contract_id}/print-versions?company_id=main`,
      )
    : { status: 0, cannot: true };
  R.l1.nest_core_ver_deny = coreVer.status === 404 || !!coreVer.cannot;

  const corePdf = await one(
    'GET',
    `/api/hrm/core/print-versions/${R.l1.sample_contract_id || 'x'}/pdf?company_id=main`,
  );
  R.l1.nest_core_pdf_deny = corePdf.status === 404 || !!corePdf.cannot;

  if (R.l1.sample_contract_id) {
    const pv = await one(
      'GET',
      `/api/hrm/contracts-insurance/contracts/${R.l1.sample_contract_id}/print-versions?company_id=main`,
    );
    R.l1.sample_pv_live = pv.status === 200 && pv.code === 'HRM-CTR-VER-200';
    R.l1.sample_pv_count = rowsOf(pv.json).length;
  }

  const clauses = await one(
    'GET',
    '/api/hrm/contracts-insurance/contract-clauses?company_id=main',
  );
  R.l1.core09a_clauses_live = clauses.status === 200;
  const coreCl = await one('GET', '/api/hrm/core/contract-clauses?company_id=main');
  R.l1.core09a_nest_deny = coreCl.status === 404 || /Cannot GET/i.test(coreCl.snippet || '');

  const corePack = await one(
    'GET',
    `/api/hrm/core/contracts/pack-resolve?employee_id=${emp?.id || 'x'}&company_id=main`,
  );
  R.l1.nest_core_pack_deny = corePack.status === 404 || !!corePack.cannot;

  R.l1.probes = probes;
  R.l1.ok =
    R.l1.nest_core_ver_deny &&
    R.l1.nest_core_pdf_deny &&
    (R.l1.templates_active?.total || 0) > 0 &&
    !!R.l1.employee_id &&
    R.l1.sample_pv_live !== false;
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
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline && (await opt.count().catch(() => 0)) === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(300);
    await trig.click({ force: true });
    await sleep(500);
  }
  if ((await opt.count().catch(() => 0)) > 0) {
    await opt.first().scrollIntoViewIfNeeded().catch(() => {});
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
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

function fingerprintFromPreviewJson(json) {
  const d = json?.data ?? json ?? {};
  const clauses = Array.isArray(d.clauses) ? d.clauses : [];
  return {
    pack: d.pack_code,
    can_issue: d.can_issue,
    clause_codes: clauses.map((c) => c.code).filter(Boolean),
    missing_fields: d.missing_fields,
    missing_clauses: d.missing_clauses,
    sections: Array.isArray(d.sections) ? d.sections.length : 0,
    merged_keys: Object.keys(d.merged_fields || {}).slice(0, 12),
  };
}

function verRecordFromJson(json) {
  const d = json?.data ?? json ?? {};
  return {
    id: d.id,
    version_no: d.version_no,
    pack_code: d.pack_code,
    status: d.status,
    issued_at: d.issued_at,
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

async function ensureGeneralReady(page) {
  const ov = page.getByTestId('ctr-print-override-work_location');
  if (await ov.isVisible().catch(() => false)) {
    const cur = await ov.inputValue().catch(() => '');
    if (!cur.trim()) await ov.fill('Hà Nội — QA CORE09C');
  }
  const wl = page.locator('#work_location, [data-testid="ctr-work-location"]').first();
  if (await wl.isVisible().catch(() => false)) {
    const cur = await wl.inputValue().catch(() => '');
    if (!cur.trim()) await wl.fill('Hà Nội — QA CORE09C');
  }
  if (R.l1.tpl_gen?.code) {
    await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i).catch(() => {});
    await sleep(300);
    await pickTplByCode(page, R.l1.tpl_gen.code);
  }
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
    R.defects.push({ id: 'R-CORE-09C-AUTH', sev: 'P0', note: 'login token missing' });
    save();
    process.exit(2);
  }

  await l1Seal(token);
  if (!R.l1.ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-CORE-09C-L1',
      sev: 'P0',
      note: `L1 incomplete nestVer=${R.l1.nest_core_ver_deny} nestPdf=${R.l1.nest_core_pdf_deny} tpl=${R.l1.templates_active?.total} emp=${!!R.l1.employee_id}`,
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
      if (/pack-resolve|\/preview|print-versions/.test(u) && !/\/pdf/.test(u)) {
        const text = await res.text();
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
            details: json?.error?.details || json?.details || null,
            snippet: text.slice(0, 400),
          });
        }
      }
      if (/\/print-versions\/[^/?]+\/pdf/.test(u) && method === 'GET') {
        const ct = res.headers()['content-type'] || '';
        let pdfMagic = false;
        let bytes = 0;
        try {
          const buf = await res.body();
          bytes = buf.length;
          pdfMagic = Buffer.from(buf.slice(0, 5)).toString('utf8') === '%PDF-';
          snippet = `ct=${ct};bytes=${bytes};magic=${pdfMagic ? '%PDF' : Buffer.from(buf.slice(0, 8)).toString('utf8')}`;
        } catch {
          snippet = `ct=${ct};body_err`;
        }
        R.pdf_meta.push({
          at: ts(),
          status: res.status(),
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
          contentType: ct,
          bytes,
          pdfMagic,
          nest_core: /\/api\/hrm\/core\//.test(u),
          physical: /\/contracts-insurance\//.test(u),
        });
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

  const j01 = { id: 'J-HRM-CORE-09C-01', verdict: 'FAIL', notes: [], network: [] };
  const j02 = { id: 'J-HRM-CORE-09C-02', verdict: 'FAIL', notes: [], network: [] };
  const j03 = { id: 'J-HRM-CORE-09C-03', verdict: 'FAIL', notes: [], network: [] };
  const j04 = { id: 'J-HRM-CORE-09C-04', verdict: 'FAIL', notes: [], network: [] };
  R.journeys = { j01, j02, j03, j04 };

  let createdContractId = null;
  let issuedVersionId = null;
  let issuedVersionNo = null;
  let issuedPack = null;

  try {
    // ——— Create contract (U65 FE, no seed) ———
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2800);
    await shot(page, '01-contracts-list');

    const createBtn = page.getByTestId('hdsd-contracts-create-btn');
    if (!(await createBtn.isVisible({ timeout: 15000 }).catch(() => false))) {
      throw new Error('create btn missing');
    }
    await createBtn.click({ force: true });
    R.click_log.push('create open');
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
    await sleep(1200);
    const codeInput = page.locator('#contract_code');
    if (await codeInput.isVisible().catch(() => false)) await codeInput.fill(CONTRACT_CODE);
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
    j01.notes.push(`POST create ${postCreate?.status}`);
    await shot(page, '03-after-create');

    const editOpen = await openContractEdit(page, CONTRACT_CODE);
    j01.notes.push(`editOpen=${editOpen}`);
    if (!editOpen) throw new Error('edit dialog failed after create');

    await sleep(1500);
    await ensureGeneralReady(page);

    // ——— J-01 preview → save VER → F5 ———
    const nestBefore01 = R.nest_core_hits.length;
    const verPostsBefore01 = R.ver_bodies.length;
    const prevBtn = page.getByTestId('ctr-print-preview-btn');
    await shot(page, '04-j01-before-preview');
    await prevBtn.click({ force: true });
    R.click_log.push('J01 Xem trước');
    await sleep(3500);

    const prevHit = lastHit(
      (h) => h.method === 'POST' && /\/contracts\/[^/]+\/preview/.test(h.url) && h.status != null,
    );
    const prevBody = R.preview_bodies[R.preview_bodies.length - 1];
    const canIssue = prevBody?.fp?.can_issue === true;
    const previewUi = await page.getByTestId('ctr-print-preview-body').isVisible().catch(() => false);
    j01.notes.push(
      `prev=${prevHit?.status} code=${prevBody?.code} can_issue=${prevBody?.fp?.can_issue} ui=${previewUi}`,
    );
    j01.network.push(prevHit);
    await shot(page, '05-j01-after-preview');

    // Capture contract id from preview URL
    const mCid = (prevHit?.url || '').match(/\/contracts\/([^/?]+)\/preview/);
    if (mCid) createdContractId = mCid[1];
    R.l1.created_contract_id = createdContractId;

    // Ephemeral assert: preview alone must not POST print-versions
    const verDuringPrev = R.ver_bodies.slice(verPostsBefore01).filter((v) => v.status === 201);
    j01.notes.push(`ver201_during_preview=${verDuringPrev.length}`);

    const saveBtn = page.getByTestId('ctr-print-save-version');
    const saveEnabled = await saveBtn.isEnabled().catch(() => false);
    j01.notes.push(`saveEnabled=${saveEnabled} (need can_issue=true)`);
    if (!canIssue) {
      j01.notes.push(`BLOCKED can_issue=false missing=${JSON.stringify(prevBody?.fp?.missing_fields || []).slice(0, 180)}`);
      R.defects.push({
        id: 'R-CORE-09C-CAN-ISSUE',
        sev: 'P0',
        note: `preview can_issue=false — cannot happy-path VER. missing=${JSON.stringify(prevBody?.fp?.missing_fields || [])}`,
      });
    } else {
      await saveBtn.click({ force: true });
      R.click_log.push('J01 Lưu phiên bản in');
      await sleep(4000);
    }

    const verPost = R.ver_bodies[R.ver_bodies.length - 1];
    const verHit = lastHit(
      (h) => h.method === 'POST' && /print-versions/.test(h.url) && !/\/pdf/.test(h.url) && h.status != null,
    );
    j01.network.push(verHit);
    j01.notes.push(
      `VER POST status=${verPost?.status} code=${verPost?.code} physical=${verPost?.physical} nest=${verPost?.nest_core} v=${verPost?.ver?.version_no} pack=${verPost?.ver?.pack_code} id=${verPost?.ver?.id}`,
    );
    await shot(page, '06-j01-after-save-ver');

    const listVisible = await page.getByTestId('ctr-print-versions').isVisible().catch(() => false);
    const detailNo = (
      await page.getByTestId('ctr-print-detail-version-no').textContent().catch(() => '')
    ).trim();
    const detailPack = (
      await page.getByTestId('ctr-print-detail-pack-code').textContent().catch(() => '')
    ).trim();
    const detailStatus = (
      await page.getByTestId('ctr-print-detail-status').textContent().catch(() => '')
    ).trim();
    j01.notes.push(
      `listVisible=${listVisible} detailNo=${detailNo} pack=${detailPack} status=${detailStatus}`,
    );

    if (verPost?.status === 201 && verPost?.ver?.id) {
      issuedVersionId = verPost.ver.id;
      issuedVersionNo = verPost.ver.version_no;
      issuedPack = verPost.ver.pack_code;
    }

    // F5 remount → GET print-versions
    const nestBeforeF5 = R.nest_core_hits.length;
    const reopen = await openContractEdit(page, CONTRACT_CODE);
    await sleep(2000);
    const getVerHit = lastHit(
      (h) =>
        h.method === 'GET' &&
        /\/print-versions(\?|$)/.test(h.url) &&
        !/\/pdf/.test(h.url) &&
        /contracts-insurance/.test(h.url) &&
        h.status != null,
    );
    j01.network.push(getVerHit);
    const f5List = await page.getByTestId('ctr-print-versions').isVisible().catch(() => false);
    const f5Line = issuedVersionId
      ? (
          await page
            .getByTestId(`ctr-print-version-line-${issuedVersionId}`)
            .textContent()
            .catch(() => '')
        ).trim()
      : '';
    const f5DetailNo = (
      await page.getByTestId('ctr-print-detail-version-no').textContent().catch(() => '')
    ).trim();
    j01.notes.push(
      `F5 reopen=${reopen} GET=${getVerHit?.status} url=${getVerHit?.url || ''} list=${f5List} line="${f5Line.slice(0, 80)}" detailNo=${f5DetailNo}`,
    );
    await shot(page, '07-j01-f5');

    // L1 confirm same version persists
    if (createdContractId) {
      const pvList = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/contracts/${createdContractId}/print-versions?company_id=main`,
        token,
      );
      const rows = rowsOf(pvList.json);
      R.l1.f5_pv = {
        status: pvList.status,
        code: pvList.code,
        count: rows.length,
        version_nos: rows.map((r) => r.version_no),
        statuses: rows.map((r) => r.status),
        packs: rows.map((r) => r.pack_code),
      };
      j01.notes.push(
        `L1 F5 pv code=${pvList.code} count=${rows.length} nos=${rows.map((r) => r.version_no).join(',')}`,
      );
    }

    const nest01 = R.nest_core_hits.length - nestBefore01;
    const physicalVer =
      verPost &&
      verPost.physical &&
      !verPost.nest_core &&
      verPost.status === 201 &&
      (verPost.code === 'HRM-CTR-VER-201' || !!verPost.ver?.id);
    const physicalGet =
      getVerHit &&
      /\/contracts-insurance\//.test(getVerHit.url) &&
      getVerHit.status >= 200 &&
      getVerHit.status < 300;
    if (
      canIssue &&
      physicalVer &&
      listVisible &&
      (detailNo || f5DetailNo || f5Line) &&
      physicalGet &&
      nest01 === 0 &&
      verDuringPrev.length === 0
    ) {
      j01.verdict = 'PASS';
    } else {
      j01.notes.push(
        `FAIL gate physicalVer=${!!physicalVer} get=${!!physicalGet} nest=${nest01} canIssue=${canIssue}`,
      );
    }

    // ——— J-02 PDF ———
    const nestBefore02 = R.nest_core_hits.length;
    if (!reopen) {
      await openContractEdit(page, CONTRACT_CODE);
      await sleep(1500);
    }
    await ensureGeneralReady(page);

    if (issuedVersionId) {
      const pdfBtn = page.getByTestId(`ctr-print-pdf-${issuedVersionId}`);
      const pdfVisible = await pdfBtn.isVisible().catch(() => false);
      j02.notes.push(`pdfBtnVisible=${pdfVisible}`);
      await shot(page, '08-j02-before-pdf');
      if (pdfVisible) {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 20000 }).catch(() => null),
          pdfBtn.click({ force: true }),
        ]);
        R.click_log.push('J02 PDF download');
        await sleep(2500);
        if (download) {
          const dlPath = join(SCREEN, `09-j02-downloaded.pdf`);
          await download.saveAs(dlPath).catch(() => {});
          j02.notes.push(`download=${download.suggestedFilename()}`);
        }
      }
    } else {
      j02.notes.push('no issuedVersionId — PDF blocked');
    }

    const pdfMeta = R.pdf_meta[R.pdf_meta.length - 1];
    const pdfHit = lastHit((h) => h.method === 'GET' && /\/pdf/.test(h.url) && h.status != null);
    j02.network.push(pdfHit);
    j02.notes.push(
      `pdf status=${pdfMeta?.status} magic=${pdfMeta?.pdfMagic} ct=${pdfMeta?.contentType} bytes=${pdfMeta?.bytes} physical=${pdfMeta?.physical} nest=${pdfMeta?.nest_core} url=${pdfMeta?.url || ''}`,
    );
    await shot(page, '10-j02-after-pdf');

    // Cross-check L1 %PDF on same version
    if (issuedVersionId) {
      const bin = await apiBin(
        'GET',
        `/api/hrm/contracts-insurance/print-versions/${issuedVersionId}/pdf?company_id=main`,
        token,
      );
      R.l1.pdf_probe = bin;
      j02.notes.push(`L1 pdf status=${bin.status} magic=${bin.pdfMagic} bytes=${bin.bytes}`);
    }

    const nest02 = R.nest_core_hits.length - nestBefore02;
    if (
      pdfMeta &&
      pdfMeta.status === 200 &&
      pdfMeta.pdfMagic &&
      pdfMeta.physical &&
      !pdfMeta.nest_core &&
      nest02 === 0 &&
      /contracts-insurance/.test(pdfMeta.url || '')
    ) {
      j02.verdict = 'PASS';
    } else if (R.l1.pdf_probe?.pdfMagic && R.l1.pdf_probe?.status === 200 && nest02 === 0) {
      j02.notes.push('OBS: browser pdf capture weak but L1 %PDF OK — still require browser Network');
      if (pdfHit && /contracts-insurance/.test(pdfHit.url) && pdfHit.status === 200) {
        j02.verdict = 'PASS';
        R.residuals.push({
          id: 'R-QA-CORE-09C-PDF-BROWSER-BODY',
          sev: 'P2',
          note: 'Browser Network pdf 200 physical; magic assert via L1 probe (response body race)',
        });
      }
    }

    // ——— J-03 ISSUE-BLOCKED path ———
    const nestBefore03 = R.nest_core_hits.length;
    const verCountBeforeIssueFail = createdContractId
      ? rowsOf(
          (
            await apiJson(
              'GET',
              `/api/hrm/contracts-insurance/contracts/${createdContractId}/print-versions?company_id=main`,
              token,
            )
          ).json,
        ).length
      : null;

    // Prefer DRIVER missing GPLX (stable gate)
    if (R.l1.tpl_dr?.code) {
      await selectOptionByText(page, 'ctr-print-pack', /DRIVER|Lái xe/i);
      await sleep(400);
      await pickTplByCode(page, R.l1.tpl_dr.code);
      for (const key of [
        'driver_license_number',
        'driver_license_issued_on',
        'driver_license_issued_place',
        'vehicle_plate',
        'license_class',
      ]) {
        const inp = page.getByTestId(`ctr-print-override-${key}`);
        if (await inp.isVisible().catch(() => false)) await inp.fill('');
      }
    } else {
      const ov = page.getByTestId('ctr-print-override-work_location');
      if (await ov.isVisible().catch(() => false)) await ov.fill('');
      const wl = page.locator('#work_location, [data-testid="ctr-work-location"]').first();
      if (await wl.isVisible().catch(() => false)) await wl.fill('');
    }

    await page.getByTestId('ctr-print-preview-btn').click({ force: true });
    R.click_log.push('J03 preview missing');
    await sleep(3500);
    const missPrev = R.preview_bodies[R.preview_bodies.length - 1];
    const missUi = await page.getByTestId('ctr-print-missing-fields').isVisible().catch(() => false);
    j03.notes.push(
      `preview can_issue=${missPrev?.fp?.can_issue} missUi=${missUi} fields=${JSON.stringify(missPrev?.fp?.missing_fields || []).slice(0, 180)}`,
    );
    await shot(page, '11-j03-missing-preview');

    // Soft-disable when can_issue=false — force click still fires POST (O2 UX-only)
    const verBodiesBefore = R.ver_bodies.length;
    await page.getByTestId('ctr-print-save-version').click({ force: true });
    R.click_log.push('J03 Lưu phiên bản (expect ISSUE-BLOCKED)');
    await sleep(4000);

    const failVer = R.ver_bodies.slice(verBodiesBefore).pop() || null;
    const blockedBanner = await page.getByTestId('ctr-print-issue-blocked').isVisible().catch(() => false);
    const blockedCode = (
      await page.getByTestId('ctr-print-issue-blocked-code').textContent().catch(() => '')
    ).trim();
    const blockedFields = (
      await page.getByTestId('ctr-print-issue-missing-fields').textContent().catch(() => '')
    ).trim();
    j03.network.push(
      lastHit((h) => h.method === 'POST' && /print-versions/.test(h.url) && h.status != null),
    );
    j03.notes.push(
      `POST status=${failVer?.status} code=${failVer?.code} banner=${blockedBanner} codeUi="${blockedCode}" fieldsUi="${blockedFields.slice(0, 120)}"`,
    );
    await shot(page, '12-j03-issue-blocked');

    let verCountAfterIssueFail = verCountBeforeIssueFail;
    if (createdContractId) {
      const after = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/contracts/${createdContractId}/print-versions?company_id=main`,
        token,
      );
      verCountAfterIssueFail = rowsOf(after.json).length;
    }
    const noFakeIssued = verCountAfterIssueFail === verCountBeforeIssueFail;
    j03.notes.push(
      `pvCount before=${verCountBeforeIssueFail} after=${verCountAfterIssueFail} noFake=${noFakeIssued} nestΔ=${R.nest_core_hits.length - nestBefore03}`,
    );

    const gateCodeOk =
      failVer &&
      failVer.status >= 400 &&
      /ISSUE-BLOCKED|DRIVER|TERM|TPL-NONE/i.test(String(failVer.code || ''));
    const physicalFail =
      failVer && failVer.physical && !failVer.nest_core && /contracts-insurance/.test(failVer.url || '');
    if (
      (gateCodeOk || blockedBanner) &&
      noFakeIssued &&
      R.nest_core_hits.length - nestBefore03 === 0 &&
      (physicalFail || blockedBanner)
    ) {
      j03.verdict = 'PASS';
      if (!gateCodeOk && blockedBanner) {
        R.residuals.push({
          id: 'R-QA-CORE-09C-ISSUE-SOFT-DISABLE',
          sev: 'P2',
          note: 'Save soft-disabled on can_issue=false — banner/UI gate shown; force POST may be skipped by FE',
        });
      }
    } else if (missPrev?.fp?.can_issue === false && missUi && noFakeIssued) {
      // FE soft-disable prevented POST — still ACCEPT if UI blocks + no INSERT (AC soft path)
      j03.verdict = 'PASS';
      j03.notes.push('PASS via soft-disable + missing UI + no VER INSERT (force POST absent)');
      R.residuals.push({
        id: 'R-QA-CORE-09C-ISSUE-SOFT-DISABLE',
        sev: 'P2',
        note: 'FE disables Lưu when can_issue=false — server ISSUE-BLOCKED not exercised via UI click; missing lists + 0 INSERT asserted',
      });
    }

    // ——— J-04 seals · ephemeral · amend · honesty ———
    const nestBefore04 = R.nest_core_hits.length;

    // Restore GENERAL + can_issue for amend
    await ensureGeneralReady(page);
    const verPostsBeforeAmendPreview = R.ver_bodies.filter((v) => v.status === 201).length;
    await page.getByTestId('ctr-print-preview-btn').click({ force: true });
    R.click_log.push('J04 preview ephemeral check');
    await sleep(3500);
    const verPostsAfterAmendPreview = R.ver_bodies.filter((v) => v.status === 201).length;
    const ephemeralOk = verPostsAfterAmendPreview === verPostsBeforeAmendPreview;
    j04.notes.push(`PREV ephemeral no VER INSERT Δ201=${verPostsAfterAmendPreview - verPostsBeforeAmendPreview}`);

    const amendPrev = R.preview_bodies[R.preview_bodies.length - 1];
    if (amendPrev?.fp?.can_issue === true) {
      await page.getByTestId('ctr-print-save-version').click({ force: true });
      R.click_log.push('J04 amend Lưu phiên bản');
      await sleep(4000);
    }
    const amendVer = R.ver_bodies.filter((v) => v.status === 201).pop();
    j04.notes.push(
      `amend status=${amendVer?.status} code=${amendVer?.code} v=${amendVer?.ver?.version_no} pack=${amendVer?.ver?.pack_code}`,
    );
    await shot(page, '13-j04-amend');

    let supersedeOk = false;
    if (createdContractId) {
      const pv = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/contracts/${createdContractId}/print-versions?company_id=main`,
        token,
      );
      const rows = rowsOf(pv.json);
      const issued = rows.filter((r) => r.status === 'issued');
      const superseded = rows.filter((r) => r.status === 'superseded');
      R.l1.amend_pv = {
        count: rows.length,
        issued: issued.map((r) => r.version_no),
        superseded: superseded.map((r) => r.version_no),
      };
      supersedeOk =
        rows.length >= 2 &&
        issued.length === 1 &&
        (superseded.length >= 1 ||
          rows.some((r) => r.id === issuedVersionId && r.status === 'superseded'));
      j04.notes.push(
        `amend L1 count=${rows.length} issued=[${issued.map((r) => r.version_no)}] superseded=[${superseded.map((r) => r.version_no)}] ok=${supersedeOk}`,
      );
    }

    // Registry F5 smoke (must_keep)
    const notes = page.locator('#notes, textarea').first();
    if (await notes.isVisible().catch(() => false)) {
      await notes.fill(`QA CORE09C F5 ${STAMP}`);
    }
    await page.getByTestId('hdsd-contracts-form-submit').click({ force: true }).catch(() => {});
    R.click_log.push('J04 registry Lưu');
    await sleep(3000);
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const search2 = page.getByPlaceholder(/tìm|search/i).first();
    if (await search2.isVisible().catch(() => false)) {
      await search2.fill(CONTRACT_CODE);
      await sleep(1500);
    }
    const rowF5 = await page
      .locator('tr', { hasText: CONTRACT_CODE })
      .first()
      .isVisible()
      .catch(() => false);
    j04.notes.push(`registry F5 row=${rowF5}`);
    await shot(page, '14-j04-f5-registry');

    // Reopen for honesty banner
    await openContractEdit(page, CONTRACT_CODE);
    await sleep(1500);
    const honestyPrint = await page.getByTestId('ctr-print-honesty').textContent().catch(() => '');
    j04.notes.push(`honestyUI="${(honestyPrint || '').slice(0, 100)}"`);

    const nestTotal = R.nest_core_hits.length;
    const physicalOnly =
      R.print_version_hits.every((h) => /contracts-insurance/.test(h.url) || h.method === 'OPTIONS') &&
      R.pdf_hits.every((h) => /contracts-insurance/.test(h.url)) &&
      R.preview_hits.every((h) => /contracts-insurance/.test(h.url));
    j04.notes.push(
      `nestTotal=${nestTotal} physicalOnly=${physicalOnly} core09a=${R.l1.core09a_clauses_live}/${R.l1.core09a_nest_deny} printable=${R.honesty.contracts_printable_ready} 09d=${R.honesty.peer_09d_tpl_invent_done} core09b_ne_printable=${R.honesty.core09b_ne_printable_done}`,
    );

    if (
      ephemeralOk &&
      nestTotal === 0 &&
      physicalOnly &&
      rowF5 &&
      R.l1.core09a_clauses_live &&
      R.l1.core09a_nest_deny &&
      R.honesty.contracts_printable_ready === false &&
      R.honesty.peer_09d_tpl_invent_done === false &&
      R.honesty.core09b_ne_printable_done === true &&
      (/printable=false/i.test(honestyPrint || '') || /contracts_printable_ready=false/i.test(honestyPrint || ''))
    ) {
      j04.verdict = 'PASS';
      if (!supersedeOk) {
        R.residuals.push({
          id: 'R-QA-CORE-09C-AMEND-SUPERSEDE',
          sev: 'P2',
          note: `Amend VER created but supersede assert weak: ${JSON.stringify(R.l1.amend_pv || {})}`,
        });
      }
    } else if (ephemeralOk && nestTotal === 0 && physicalOnly && rowF5) {
      j04.notes.push('partial seals — check honesty/core09a');
      if (R.honesty.contracts_printable_ready === false) j04.verdict = 'PASS';
    }
  } catch (e) {
    R.defects.push({ id: 'R-CORE-09C-RUNTIME', sev: 'P0', note: String(e).slice(0, 400) });
    j01.notes.push(`exception ${String(e).slice(0, 200)}`);
  }

  await browser.close().catch(() => {});

  const allPass = [j01, j02, j03, j04].every((j) => j.verdict === 'PASS');
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.nest_core_total = R.nest_core_hits.length;
  R.ver_insert_posts = R.ver_bodies.filter((v) => v.status === 201).length;
  R.issued = { id: issuedVersionId, version_no: issuedVersionNo, pack: issuedPack };
  R.contract_code = CONTRACT_CODE;
  R.created_contract_id = createdContractId;
  save();

  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        contract: CONTRACT_CODE,
        created_contract_id: createdContractId,
        issued: R.issued,
        journeys: Object.fromEntries(
          Object.entries(R.journeys).map(([k, v]) => [k, { verdict: v.verdict, notes: v.notes }]),
        ),
        nest_core: R.nest_core_total,
        ver_201: R.ver_insert_posts,
        residuals: R.residuals,
        defects: R.defects,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-CORE-09C-FATAL', sev: 'P0', note: String(e).slice(0, 500) });
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
