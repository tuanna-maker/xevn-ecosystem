#!/usr/bin/env node
/**
 * QA-HRM-SETTINGS-ATT-LVT-SOT-FE-01 — HRM-SC-01 dual SoT FE UX
 * U65 zero-seed · browser via portal session
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hrm-settings-att-lvt-sot-fe-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-hrm-settings-att-lvt-sot-fe-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

const LVT_KEY = `hr_lvt_fe_${stamp}`;
const LVT_LABEL = `QA LVT FE ${stamp}`;
const INVENT_KEY = `zz_invent_lvt_fe_${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-HRM-SETTINGS-ATT-LVT-SOT-FE-01',
  parent_fe: 'PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01',
  parent_be_qa: 'QA-HRM-SETTINGS-ATT-LVT-SOT-01',
  startedAt: ts(),
  stamp: `ATTLVTSOTFEQA-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed',
  env: { PORTAL, HRM, TENANT, commit: COMMIT, LVT_KEY },
  uf: {},
  network: [],
  extensionPosts: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function uf(id, verdict, detail = {}) {
  R.uf[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
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
  };
}

async function hrmFetch(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  const code = json?.code ?? json?.error?.code ?? json?.errorCode ?? null;
  return { status: r.status, json, code };
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
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
    }
  }, session);
}

function trackHrmNetwork(page) {
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (['GET', 'POST', 'PUT'].includes(method)) {
      const short = u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400);
      R.network.push({ method, status: res.status(), url: short });
      if (
        method === 'POST' &&
        /settings-catalogs\/leave_types\/extension-items/.test(u)
      ) {
        R.extensionPosts.push({ status: res.status(), url: short });
      }
    }
  });
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  trackHrmNetwork(page);
  await injectPortalAuth(page, session);

  // UF-MD-LEAVE-TYPES-REF — Master data Loại nghỉ
  await page.goto(q('/hr/settings?tab=master-data'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  const mdTab = page.getByTestId('md-tab-leaveTypes');
  if (await mdTab.isVisible().catch(() => false)) await mdTab.click();
  await sleep(1500);

  const banner = await page.getByTestId('md-leave-types-ref-readonly-banner').isVisible().catch(() => false);
  const upsertForm = await page.getByTestId('md-upsert-form-leaveTypes').isVisible().catch(() => false);
  const saveBtn = await page.getByTestId('md-save-leaveTypes').isVisible().catch(() => false);
  const extPostsDuringMd = R.extensionPosts.length;

  let ctaOk = false;
  const cta = page.getByTestId('md-leave-types-open-att-tab');
  if (await cta.isVisible().catch(() => false)) {
    await cta.click();
    await sleep(2000);
    const url = page.url();
    const attPanel = await page.getByTestId('settings-att-leave-types').isVisible().catch(() => false);
    const attTabActive = await page.getByTestId('settings-tab-att-leave-types').isVisible().catch(() => false);
    ctaOk =
      /tab=att-leave-types/.test(url) &&
      (attPanel || attTabActive || /att-leave-types/.test(url));
  }

  const mdPass =
    banner && !upsertForm && !saveBtn && extPostsDuringMd === 0 && ctaOk;
  uf('UF-MD-LEAVE-TYPES-REF', mdPass ? 'PASS' : 'FAIL', {
    summary: mdPass
      ? 'banner + no md-save/upsert + no extension POST + CTA → att-leave-types'
      : JSON.stringify({ banner, upsertForm, saveBtn, extPostsDuringMd, ctaOk }),
  });
  await page.screenshot({ path: `${SCREEN}/md-leave-types-ref.png`, fullPage: false }).catch(() => {});

  // UF-CATALOGS-LEAVE-TYPES-REF — Danh mục (sync) overview
  R.extensionPosts.length = 0;
  await page.goto(q('/hr/settings?tab=catalogs'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);

  const stampEl = page.getByTestId('catalog-leave-types-tenant-writer-leave_types');
  const stampVisible = await stampEl.isVisible().catch(() => false);

  const selectTrigger = page.locator('#ext-catalog-key');
  if (await selectTrigger.isVisible().catch(() => false)) {
    await selectTrigger.click();
    await sleep(400);
    const opt = page.getByRole('option', { name: /leave|nghỉ|Loại nghỉ/i }).first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    else {
      const leaveOpt = page.locator('[role="option"]').filter({ hasText: /leave_types/i }).first();
      if (await leaveOpt.isVisible().catch(() => false)) await leaveOpt.click();
    }
    await sleep(800);
  }

  const catBanner = await page.getByTestId('settings-catalogs-leave-types-ref-readonly').isVisible().catch(() => false);
  const addBtn = page.getByRole('button', { name: /Thêm|Add/i }).filter({ has: page.locator('svg') }).last();
  const addDisabled = (await addBtn.isVisible().catch(() => false))
    ? await addBtn.isDisabled().catch(() => false)
    : true;
  const trashInLeaveCard = await page
    .locator('[data-testid^="catalog-leave-types-tenant-writer-leave_types"]')
    .locator('xpath=ancestor::div[contains(@class,"space-y")]')
    .locator('button:has(svg)')
    .count()
    .catch(() => -1);

  let catCtaOk = false;
  const catCta = page.getByTestId('settings-catalogs-open-att-leave-types');
  if (await catCta.isVisible().catch(() => false)) {
    await catCta.click();
    await sleep(2000);
    catCtaOk = /tab=att-leave-types/.test(page.url());
  }

  const catalogsPass =
    stampVisible && catBanner && addDisabled && catCtaOk && R.extensionPosts.length === 0;
  uf('UF-CATALOGS-LEAVE-TYPES-REF', catalogsPass ? 'PASS' : 'FAIL', {
    summary: catalogsPass
      ? 'overview stamp + ref banner + add disabled + CTA att tab + no extension POST'
      : JSON.stringify({ stampVisible, catBanner, addDisabled, catCtaOk, extPosts: R.extensionPosts.length, trashInLeaveCard }),
  });
  await page.screenshot({ path: `${SCREEN}/catalogs-leave-types-ref.png`, fullPage: false }).catch(() => {});

  // UF-ATT-ADMIN-CREATE-F5 (regression)
  await page.goto(q('/hr/settings?tab=att-leave-types'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  let adminPass = false;
  if (await page.getByTestId('settings-att-leave-types').isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /Thêm loại phép/i }).click();
    await page.getByTestId('settings-att-leave-types-dialog').waitFor({ state: 'visible', timeout: 20_000 });
    const upsertWait = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/attendance\/leave-types(\?|$)/.test(res.url()) &&
          ['PUT', 'POST'].includes(res.request().method()),
        { timeout: 45_000 },
      )
      .catch(() => null);
    await page.getByTestId('hdsd-att-leave-type-key').fill(LVT_KEY);
    await page.getByTestId('hdsd-att-leave-type-name').fill(LVT_LABEL);
    await page.getByTestId('hdsd-att-leave-type-save').click();
    const upsertRes = await upsertWait;
    const upsertStatus = upsertRes?.status() ?? 0;
    await sleep(800);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const tab2 = page.getByTestId('settings-tab-att-leave-types');
    if (await tab2.isVisible().catch(() => false)) await tab2.click();
    await sleep(1200);
    const rowVisible = await page.getByTestId(`settings-att-leave-type-row-${LVT_KEY}`).isVisible().catch(() => false);
    adminPass = upsertStatus >= 200 && upsertStatus < 300 && rowVisible;
  }
  uf('UF-ATT-ADMIN-CREATE-F5', adminPass ? 'PASS' : 'FAIL', {
    summary: adminPass ? `ATT PUT/POST ${adminPass} + F5 row ${LVT_KEY}` : `admin regression fail key=${LVT_KEY}`,
  });

  // UF-LEAVE-CONSUMER-EFFECTIVE (regression)
  let consumerPass = false;
  const netBefore = R.network.length;
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  const leaveTab = page.locator('button').filter({ hasText: /Nghỉ phép|Leave/i }).first();
  if (await leaveTab.isVisible().catch(() => false)) {
    await leaveTab.click();
    await sleep(1500);
  }
  const effWait = page
    .waitForResponse(
      (res) => /leave-types\/effective/.test(res.url()) && res.request().method() === 'GET',
      { timeout: 45_000 },
    )
    .catch(() => null);
  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Create|Thêm đơn|Tạo đơn/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
    await sleep(1200);
  }
  const effRes = await effWait;
  let effStatus = effRes?.status() ?? 0;
  if (!effStatus) {
    const hit = R.network.slice(netBefore).find((n) => /leave-types\/effective/.test(n.url));
    effStatus = hit?.status ?? 0;
  }
  const empList = await hrmFetch(session.token, 'GET', `/employees?company_id=${COMPANY}&page_size=3`);
  const empArr = empList.json?.data?.data ?? empList.json?.data ?? [];
  const emp = Array.isArray(empArr) ? empArr[0] : null;
  const d0 = '2027-06-20';
  const invent = emp?.id
    ? await hrmFetch(session.token, 'POST', `/attendance/leave-requests`, {
        company_id: COMPANY,
        employee_id: emp.id,
        employee_code: emp.employee_code || emp.employeeCode || emp.code || 'QA',
        employee_name: emp.full_name || emp.fullName || emp.display_name || emp.name || 'QA Emp',
        leave_type: INVENT_KEY,
        start_date: d0,
        end_date: d0,
        total_days: 1,
        reason: `LVT FE invent ${stamp}`,
      })
    : { status: 0, code: 'NO_EMPLOYEE' };
  const inventOk =
    invent.status >= 400 &&
    invent.status < 500 &&
    String(invent.code || '').includes('HRM-LEAVE-TYPE-UNKNOWN');
  consumerPass = effStatus === 200 && inventOk;
  uf('UF-LEAVE-CONSUMER-EFFECTIVE', consumerPass ? 'PASS' : 'FAIL', {
    summary: consumerPass
      ? `GET effective ${effStatus} · invent ${invent.status} ${invent.code}`
      : `eff=${effStatus} invent=${invent.status} ${invent.code}`,
  });

  await browser.close();

  const fails = Object.values(R.uf).filter((x) => x.verdict === 'FAIL');
  R.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log(JSON.stringify({ overall: R.overall, ack_status: R.ack_status, stamp: R.stamp }, null, 2));
  if (fails.length) process.exit(1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.error = String(e).slice(0, 500);
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
