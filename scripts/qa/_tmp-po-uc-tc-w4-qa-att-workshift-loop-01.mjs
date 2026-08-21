#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01 — U65 browser
 * Verifies no Maximum update depth / work-shifts GET storm on Ca làm việc tab
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-att-workshift-loop-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-att-workshift-loop-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01',
  fe_work_item: 'PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  steps: {},
  workShiftGets: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  optionalCrud: null,
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
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
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: 'main',
    user: {
      userId: data?.user?.userId || data?.user?.id || EMAIL,
      email: EMAIL,
      displayName: data?.user?.displayName || 'CEO',
      roles: data?.user?.roles || ['group_ceo'],
    },
    http: r.status,
  };
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
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

async function clickDropdownItem(page, triggerRegex, itemLabel) {
  const trig = page.getByRole('button', { name: triggerRegex }).first();
  await trig.click({ timeout: 12_000 });
  await sleep(400);
  await page.getByRole('menuitem', { name: itemLabel }).click({ timeout: 8000 });
}

function hasDepthError() {
  const re = /Maximum update depth/i;
  return (
    results.pageErrors.some((e) => re.test(e)) ||
    results.consoleErrors.some((e) => re.test(e))
  );
}

async function main() {
  await probeL0();
  const session = await loginApi();
  results.steps.login = { http: session.http, persona: EMAIL, companyId: 'main' };
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error' && !/favicon|React DevTools/i.test(t)) {
      results.consoleErrors.push(t.slice(0, 400));
    }
    if (/Maximum update depth/i.test(t)) {
      results.consoleErrors.push(`[depth] ${t.slice(0, 400)}`);
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 400)));
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/attendance\/work-shifts/.test(u) && res.request().method() === 'GET') {
      results.workShiftGets.push({
        at: new Date().toISOString(),
        status: res.status(),
        path: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 200),
      });
    }
    if (/\/api\/hrm\//.test(u) && res.status() >= 500) {
      results.networkBad.push({ status: res.status(), url: u.slice(0, 240) });
    }
  });

  await injectPortalAuth(page, session);
  const url = q('/hr/attendance');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(1500);
  results.steps.attendanceLoad = { url, bodyHasChamCong: /Chấm công|Ca làm việc/i.test(await page.locator('body').innerText().catch(() => '')) };
  save();

  results.workShiftGets.length = 0;
  await clickDropdownItem(page, /^Ca làm việc$/, 'Danh sách ca');
  await sleep(2500);

  const idleStart = Date.now();
  await sleep(5000);
  const getsDuringIdle = results.workShiftGets.filter((g) => new Date(g.at).getTime() >= idleStart - 500);
  const getCountAfterOpen = results.workShiftGets.length;
  const tableVisible = (await page.locator('[data-testid="shifts-table"]').count()) > 0;
  const loadingSpinners = await page.locator('.animate-spin').count();

  results.steps.shiftsTab = {
    clickPath: 'HRM embed → Chấm công → Ca làm việc → Danh sách ca',
    j_ref: 'J-HRM attendance embed (PROGRAM_JOURNEY_MAP — Ca list surface)',
    tableVisible,
    loadingSpinners,
    workShiftGetTotal: getCountAfterOpen,
    workShiftGetsIdleWindow5s: getsDuringIdle.length,
    stormThreshold: 8,
    stormDetected: getsDuringIdle.length > 8,
    depthError: hasDepthError(),
    hrm500: results.networkBad.length,
  };

  await page.screenshot({ path: join(SCREEN, 'shifts-list-tab.png'), fullPage: false });
  results.steps.screenshot = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-att-workshift-loop-01/shifts-list-tab.png';

  // Optional FE-only create (skip when PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01 scope = loop only)
  if (process.env.QA_SKIP_CRUD === '1') {
    results.optionalCrud = { attempted: false, skipReason: 'QA_SKIP_CRUD=1 loop-only seat' };
  }
  const stamp = `QA${Date.now().toString(36).slice(-6).toUpperCase()}`;
  try {
    if (process.env.QA_SKIP_CRUD === '1') throw new Error('skip crud');
    const addBtn = page.locator('button').filter({ hasText: /^Thêm$|^Thêm mới$|^Add$/ }).first();
    const addAlt = page.getByRole('button', { name: /Thêm/i }).filter({ has: page.locator('.lucide-plus, svg') }).first();
    const target = (await addBtn.count()) ? addBtn : addAlt;
    await target.click({ timeout: 8000 });
    await sleep(600);
    await page.locator('#shift-code, input[id*="shift"]').first().fill(stamp).catch(async () => {
      await page.getByLabel(/Mã ca|Mã/i).first().fill(stamp);
    });
    await page.locator('input').filter({ has: page.locator('..') }).nth(1).fill(`Ca QA ${stamp}`).catch(() => {});
    const nameInput = page.locator('input').nth(1);
    if (await nameInput.isVisible()) await nameInput.fill(`Ca QA ${stamp}`);
    const codeInput = page.locator('input').first();
    if (await codeInput.isVisible()) await codeInput.fill(stamp);

    const saveBtn = page.getByRole('button', { name: /Thêm mới|Cập nhật|Lưu/i }).last();
    const getsBeforeCreate = results.workShiftGets.length;
    await saveBtn.click({ timeout: 8000 });
    await sleep(2000);
    const createGets = results.workShiftGets.length - getsBeforeCreate;
    const bodyAfter = await page.locator('body').innerText();
    results.optionalCrud = {
      attempted: true,
      code: stamp,
      bodyMentionsCode: bodyAfter.includes(stamp),
      refetchGetsAfterSave: createGets,
      note: 'FE-origin mutate; no seed script',
    };
  } catch (e) {
    results.optionalCrud = { attempted: false, skipReason: String(e).slice(0, 180) };
  }

  if (process.env.QA_SKIP_F5 !== '1') {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await clickDropdownItem(page, /^Ca làm việc$/, 'Danh sách ca').catch(() => {});
    await sleep(2000);
    results.steps.f5 = {
      depthErrorAfterReload: hasDepthError(),
      workShiftGetsAfterF5: results.workShiftGets.length,
    };
  } else {
    results.steps.f5 = { skipped: true, reason: 'loop-only seat' };
  }

  const shiftGets = results.workShiftGets.filter((g) => /work-shifts/.test(g.path));
  const shift500OnTab = shiftGets.filter((g) => g.status >= 500);
  const firstShiftGet = shiftGets[0];

  const failReasons = [];
  if (hasDepthError()) failReasons.push('Maximum update depth in console/page');
  if (results.steps.shiftsTab.stormDetected) failReasons.push('work-shifts GET storm > threshold');
  if (firstShiftGet && firstShiftGet.status >= 500) failReasons.push('work-shifts initial GET 5xx');
  if (!tableVisible) failReasons.push('shifts-table not visible on Ca tab');

  results.steps.shiftsTab.firstWorkShiftGet = firstShiftGet || null;
  results.steps.shiftsTab.shift500Count = shift500OnTab.length;

  const passCore =
    !hasDepthError() &&
    !results.steps.shiftsTab.stormDetected &&
    tableVisible &&
    (!firstShiftGet || firstShiftGet.status < 500);

  results.verdict = passCore ? 'PASS' : 'FAIL';
  results.ack_status = passCore ? 'PASS_TO_PM' : 'FAIL';
  results.failReasons = failReasons;
  results.endedAt = new Date().toISOString();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: results.verdict, ack: results.ack_status, gets: getCountAfterOpen, idleGets: getsDuringIdle.length }));
  process.exit(passCore ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL';
  results.fatal = String(e);
  results.endedAt = new Date().toISOString();
  save();
  process.exit(1);
});
