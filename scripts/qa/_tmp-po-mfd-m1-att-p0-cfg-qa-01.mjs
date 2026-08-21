#!/usr/bin/env node
/**
 * PO-MFD-M1-ATT-P0-CFG-QA-01 — HRM-AT-14 browser (U65 zero-seed)
 * Persona: ceo@xe.vn · companyId=main · /hr/attendance → Thiết lập
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m1-att-p0-cfg-qa-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const report = {
  work_item_id: 'PO-MFD-M1-ATT-P0-CFG-QA-01',
  uc_id: 'HRM-AT-14',
  startedAt: ts(),
  u65_zero_seed: true,
  hdsd_align: 'Chấm công → Thiết lập → Quy định chấm công',
  env: { PORTAL, HRM, EMAIL, COMPANY, TENANT, commit: COMMIT },
  l0: {},
  steps: [],
  verdict: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
  };
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

async function openRulesGeneral(page) {
  await page.getByRole('button', { name: /^Thiết lập$/ }).click({ timeout: 15_000 });
  await sleep(500);
  await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click({ timeout: 12_000 });
  await sleep(600);
  await page.locator('[data-testid="hdsd-att-rules-tab-general"]').click({ timeout: 10_000 });
  await sleep(800);
}

async function fetchRulesDirect(token) {
  const r = await fetch(`${HRM}/api/hrm/attendance/rules?company_id=${COMPANY}`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  return { status: r.status, body: data };
}

async function main() {
  const session = await loginApi();
  const l0Hrm = await fetch(`${HRM}/api/hrm/`).then((r) => r.status).catch(() => 0);
  report.l0 = { hrm_api: l0Hrm, portal: (await fetch(PORTAL).then((r) => r.status).catch(() => 0)) };
  if (l0Hrm !== 200) throw new Error(`L0 FAIL hrm-api ${l0Hrm}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await injectPortalAuth(page, session);

  const patchWaits = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (res.request().method() === 'PATCH' && /\/api\/hrm\/attendance\/rules/.test(u)) {
      patchWaits.push({ status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '') });
    }
  });

  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2000);

  // --- AC1 Rules Chung Lưu → F5 ---
  const step1 = { id: 'AT-14-rules-chung-save-f5', verdict: 'FAIL', notes: [] };
  try {
    await openRulesGeneral(page);
    const beforeApi = await fetchRulesDirect(session.token);
    step1.get_before = { status: beforeApi.status, notify_late: beforeApi.body?.notify_late };

    const notify = page.locator('#notify-late');
    const wasChecked = await notify.isChecked();
    await notify.setChecked(!wasChecked);
    const targetNotify = !wasChecked;

    patchWaits.length = 0;
    await page.locator('[data-testid="att-rules-general-save"]').click();
    await sleep(2500);
    step1.patch = patchWaits.slice(-1)[0] ?? null;

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await openRulesGeneral(page);
    const uiAfter = await notify.isChecked();
    const afterApi = await fetchRulesDirect(session.token);
    step1.get_after = { status: afterApi.status, notify_late: afterApi.body?.notify_late };
    step1.ui_notify_after = uiAfter;

    const patchOk = step1.patch && step1.patch.status >= 200 && step1.patch.status < 300;
    const persistOk =
      afterApi.status === 200 &&
      afterApi.body?.notify_late === targetNotify &&
      uiAfter === targetNotify;
    if (patchOk && persistOk) step1.verdict = 'PASS';
    else {
      step1.notes.push(`patchOk=${patchOk} persistOk=${persistOk} target=${targetNotify}`);
    }
    await page.screenshot({ path: join(SCREEN, 'rules-chung-f5.png') });
  } catch (e) {
    step1.notes.push(String(e).slice(0, 300));
  }
  report.steps.push(step1);

  // --- AC2 GPS work-site add → F5 ---
  const siteName = `QA-GPS-${Date.now().toString(36).slice(-6)}`;
  const step2 = { id: 'AT-14-gps-work-site-crud', verdict: 'FAIL', siteName, notes: [] };
  const postWaits = [];
  page.on('response', (res) => {
    const u = res.url();
    if (res.request().method() === 'POST' && /\/api\/hrm\/attendance\/work-sites/.test(u)) {
      postWaits.push({ status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '') });
    }
  });
  try {
    await page.locator('[data-testid="hdsd-att-rules-tab-app"]').click({ timeout: 10_000 });
    await sleep(800);
    await page.locator('[data-testid="att-gps-add-open"]').click();
    await sleep(400);
    const dlg = page.locator('[data-testid="att-gps-add-dialog"]');
    await dlg.locator('input').nth(0).fill(siteName);
    await dlg.locator('input').nth(1).fill('QA U65 điểm làm việc');
    await dlg.locator('input[type="number"]').nth(0).fill('21.0285');
    await dlg.locator('input[type="number"]').nth(1).fill('105.8542');
    await dlg.locator('input[type="number"]').nth(2).fill('120');
    postWaits.length = 0;
    await page.locator('[data-testid="att-gps-add-submit"]').click();
    await sleep(2500);
    step2.post = postWaits.slice(-1)[0] ?? null;
    const listed = await page.locator('body').innerText();
    step2.visible_after_add = listed.includes(siteName);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await page.getByRole('button', { name: /^Thiết lập$/ }).click();
    await sleep(400);
    await page.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click();
    await sleep(400);
    await page.locator('[data-testid="hdsd-att-rules-tab-app"]').click();
    await sleep(800);
    const listedF5 = await page.locator('body').innerText();
    step2.visible_after_f5 = listedF5.includes(siteName);

    const wsGet = await fetch(`${HRM}/api/hrm/attendance/work-sites?company_id=${COMPANY}`, {
      headers: {
        authorization: `Bearer ${session.token}`,
        'x-tenant-id': TENANT,
        'x-company-id': COMPANY,
      },
    });
    const wsJson = await wsGet.json().catch(() => ({}));
    const rows = wsJson?.data?.data ?? wsJson?.data ?? [];
    step2.get_work_sites = { status: wsGet.status, count: Array.isArray(rows) ? rows.length : 0 };
    step2.api_has_site = Array.isArray(rows) && rows.some((r) => r.name === siteName);

    const postOk = step2.post && step2.post.status >= 200 && step2.post.status < 300;
    if (postOk && step2.visible_after_f5 && step2.api_has_site) step2.verdict = 'PASS';
    else step2.notes.push(`postOk=${postOk} f5=${step2.visible_after_f5} api=${step2.api_has_site}`);
    await page.screenshot({ path: join(SCREEN, 'gps-app-f5.png') });
  } catch (e) {
    step2.notes.push(String(e).slice(0, 300));
  }
  report.steps.push(step2);

  // --- AC3 D4 stubs ---
  const stubIds = [
    { sidebar: 'Quy định làm thêm', testid: 'att-cfg-stub-overtime' },
    { sidebar: 'Quy định nghỉ', testid: 'att-cfg-stub-leave-rules' },
    { sidebar: 'Quy định đi muộn - về sớm', testid: 'att-cfg-stub-late-early' },
    { sidebar: 'Quy định làm đơn', testid: 'att-cfg-stub-request-rules' },
  ];
  const step3 = { id: 'AT-14-d4-stub-banners', verdict: 'PASS', stubs: [] };
  for (const s of stubIds) {
    const row = { sidebar: s.sidebar, verdict: 'FAIL' };
    try {
      await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await sleep(1200);
      await page.getByRole('button', { name: /^Thiết lập$/ }).click();
      await sleep(400);
      await page.locator('nav button').filter({ hasText: s.sidebar }).click();
      await sleep(800);
      const stub = page.locator(`[data-testid="${s.testid}"]`);
      row.stub_visible = await stub.isVisible().catch(() => false);
      row.fake_save = (await page.locator('[data-testid="att-rules-general-save"]').count()) > 0;
      row.settings_link = (await page.locator('a[href="/settings"]').count()) > 0;
      if (row.stub_visible && !row.fake_save && row.settings_link) row.verdict = 'PASS';
      else step3.verdict = 'FAIL';
    } catch (e) {
      row.error = String(e).slice(0, 200);
      step3.verdict = 'FAIL';
    }
    step3.stubs.push(row);
  }
  report.steps.push(step3);

  // --- AC4 Face ID read-only ---
  const step4 = { id: 'AT-14-faceid-readonly', verdict: 'FAIL', notes: [] };
  try {
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(1200);
    await openRulesGeneral(page);
    await page.locator('[data-testid="hdsd-att-rules-tab-app"]').click();
    await sleep(800);
    step4.banner = await page.locator('[data-testid="att-faceid-cfg-banner"]').isVisible().catch(() => false);
    const faceToggle = page.locator('[data-testid="att-app-toggle-faceid"]');
    if ((await faceToggle.count()) > 0) {
      step4.face_toggle_disabled = await faceToggle.isDisabled();
    } else {
      step4.face_toggle_disabled = 'n/a';
    }
    if (step4.banner) step4.verdict = 'PASS';
    else step4.notes.push('banner missing');
    await page.screenshot({ path: join(SCREEN, 'faceid-app-tab.png') });
  } catch (e) {
    step4.notes.push(String(e).slice(0, 300));
  }
  report.steps.push(step4);

  const allPass = report.steps.every((s) => s.verdict === 'PASS');
  report.verdict = allPass ? 'PASS_TO_PM' : 'FAIL';
  report.ack_status = report.verdict;
  report.uat_done = false;
  report.endedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: report.verdict, OUT_JSON }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  report.endedAt = ts();
  report.verdict = 'FAIL';
  report.fatal = String(e);
  save();
  process.exit(1);
});
