#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-WIRE-BALANCE-01-QA — U65 browser (ceo@ main)
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-wire-balance-01-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-MFD-M2-ATT-WIRE-BALANCE-01-QA',
  fe_work_item: 'PO-MFD-M2-ATT-WIRE-BALANCE-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  steps: {},
  leaveBalanceGets: [],
  rulesPatches: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  verdict: null,
  ack_status: null,
  failReasons: [],
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

async function clickTopTab(page, label) {
  const btn = page.getByRole('button', { name: new RegExp(`^${label}$`) }).first();
  await btn.click({ timeout: 15_000 });
  await sleep(800);
}

async function clickShiftsSubmenu(page, itemLabel) {
  const trig = page.locator('button').filter({ hasText: /Ca làm việc/i }).first();
  await trig.click({ timeout: 15_000 });
  await sleep(400);
  await page.getByRole('menuitem', { name: itemLabel }).click({ timeout: 8000 });
  await sleep(400);
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
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 400)));
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/attendance\/leave-balance/.test(u) && res.request().method() === 'GET') {
      results.leaveBalanceGets.push({
        at: new Date().toISOString(),
        status: res.status(),
        path: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
      });
    }
    if (/\/api\/hrm\/attendance\/rules/.test(u) && res.request().method() === 'PATCH') {
      results.rulesPatches.push({ status: res.status(), at: new Date().toISOString() });
    }
    if (/\/api\/hrm\//.test(u) && res.status() >= 500) {
      results.networkBad.push({ status: res.status(), url: u.slice(0, 240) });
    }
  });

  await injectPortalAuth(page, session);
  const url = q('/hr/attendance');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2000);

  // --- 1) Leave balance ---
  results.leaveBalanceGets.length = 0;
  await clickTopTab(page, 'Nghỉ phép');
  await sleep(1500);
  await page.getByRole('button', { name: /Tạo yêu cầu nghỉ/i }).click({ timeout: 12_000 });
  await sleep(800);
  const selectTrigger = page.locator('[role="dialog"] [role="combobox"]').first();
  await selectTrigger.click({ timeout: 8000 });
  await sleep(400);
  let empPicked = false;
  let empText = '';
  for (let attempt = 0; attempt < 8; attempt++) {
    const opt = page.locator('[role="option"]').first();
    if ((await opt.count()) > 0) {
      empText = await opt.innerText();
      await opt.click();
      empPicked = true;
      break;
    }
    await sleep(1500);
    if (attempt === 2) await selectTrigger.click().catch(() => {});
  }
  results.steps.leaveEmployee = empPicked
    ? { picked: true, label: empText.slice(0, 120) }
    : { picked: false, reason: 'no options in employee select after wait' };
  await sleep(3500);

  const panel = page.locator('[data-testid="leave-balance-panel"]');
  const panelText = (await panel.count()) ? await panel.first().innerText() : '';
  const hasDemo = /\bDemo\b/i.test(panelText);
  const hasSpinner = (await panel.locator('.animate-spin').count()) > 0;
  const balanceGets2xx = results.leaveBalanceGets.filter((g) => g.status >= 200 && g.status < 300);
  const showsDays =
    /Còn lại|remaining|ngày|Đã dùng|entitled|used/i.test(panelText) && !hasDemo;

  results.steps.leaveBalance = {
    clickPath: 'Nghỉ phép → Tạo yêu cầu nghỉ → chọn NV',
    j_ref: 'J-HRM-06 (attendance leave surface)',
    leaveBalanceGets: [...results.leaveBalanceGets],
    panelText: panelText.slice(0, 500),
    hasDemo,
    foreverSpin: hasSpinner && balanceGets2xx.length === 0 && empPicked,
    showsRemainingDays: showsDays,
    pass:
      empPicked &&
      balanceGets2xx.length > 0 &&
      !hasDemo &&
      !(hasSpinner && balanceGets2xx.length === 0) &&
      (showsDays || /balanceEmpty|Không có số dư|empty/i.test(panelText) || panelText.length > 20),
  };
  await page.screenshot({ path: join(SCREEN, 'leave-balance-create-dialog.png'), fullPage: false });

  // Close dialog
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(500);

  // --- 2) Shift schedule / OT hold ---
  await clickShiftsSubmenu(page, 'Lịch phân ca');
  await sleep(1200);
  const scheduleHold = (await page.locator('[data-testid="shifts-schedule-hold"]').count()) > 0;
  const scheduleTable = (await page.locator('[data-testid="shifts-table"]').count()) > 0;
  results.steps.shiftSchedule = {
    clickPath: 'Ca làm việc → Lịch phân ca',
    holdVisible: scheduleHold,
    shiftsTableVisible: scheduleTable,
    pass: scheduleHold && !scheduleTable,
  };
  await page.screenshot({ path: join(SCREEN, 'shifts-schedule-hold.png'), fullPage: false });

  await clickShiftsSubmenu(page, 'Ca làm thêm');
  await sleep(1200);
  const otHold = (await page.locator('[data-testid="shifts-overtime-hold"]').count()) > 0;
  const otTable = (await page.locator('[data-testid="shifts-table"]').count()) > 0;
  results.steps.shiftOvertime = {
    clickPath: 'Ca làm việc → Ca làm thêm',
    holdVisible: otHold,
    shiftsTableVisible: otTable,
    pass: otHold && !otTable,
  };
  await page.screenshot({ path: join(SCREEN, 'shifts-overtime-hold.png'), fullPage: false });

  // --- 3) Clock-In Face hold ---
  await clickTopTab(page, 'Chấm công');
  await sleep(1200);
  const wizard = (await page.locator('[data-testid="clock-in-wizard"]').count()) > 0;
  if (!wizard) {
    await page.getByRole('button', { name: /^Chấm công$/ }).first().click().catch(() => {});
    await sleep(800);
  }
  await page.locator('[data-testid="clock-in-method-faceid"]').click({ timeout: 10_000 });
  await sleep(1500);
  const wizardRoot = page.locator('[data-testid="clock-in-wizard"]');
  const bodyFace = await wizardRoot.innerText().catch(() => '');
  const holdBanner = /Face ID|Khuôn mặt|faceIdScanner|Quét khuôn mặt/i.test(bodyFace);
  const confirmBtn = wizardRoot
    .getByRole('button', { name: /Xác nhận|Check-in|Vào ca|Chấm công vào/i })
    .first();
  let checkInToastSuccess = false;
  let holdErrorToast = false;
  let checkInPosts = 0;
  const onCheckInRes = (res) => {
    const u = res.url();
    if (/\/api\/hrm\/attendance\/records/.test(u) && res.request().method() === 'POST') {
      checkInPosts += 1;
    }
  };
  page.on('response', onCheckInRes);
  if ((await confirmBtn.count()) && (await confirmBtn.isEnabled().catch(() => false))) {
    await confirmBtn.click().catch(() => {});
    await sleep(2000);
    const toastBits = await page.locator('[data-sonner-toast]').allInnerTexts().catch(() => []);
    const toastJoined = toastBits.join('\n');
    holdErrorToast = /GĐ2|phát triển|khuôn mặt đang|không ghi nhận chấm công/i.test(toastJoined);
    checkInToastSuccess = /Chấm công vào thành công|check-out thành công|đã check-in thành công/i.test(
      toastJoined,
    );
  } else {
    holdErrorToast = true;
  }
  page.off('response', onCheckInRes);
  results.steps.faceHold = {
    clickPath: 'Chấm công → Clock-In wizard → Face ID',
    holdBanner,
    holdErrorToast,
    checkInSuccessToast: checkInToastSuccess,
    checkInPostCount: checkInPosts,
    pass: holdBanner && !checkInToastSuccess && checkInPosts === 0,
  };
  await page.screenshot({ path: join(SCREEN, 'clock-in-face-hold.png'), fullPage: false });

  // --- 4) Settings rules save ---
  await clickTopTab(page, 'Thiết lập');
  await sleep(1200);
  await page.getByRole('button', { name: /Quy định chấm công/i }).click({ timeout: 10_000 });
  await sleep(800);
  await page.getByRole('tab', { name: /^Chung$/ }).click({ timeout: 8000 }).catch(async () => {
    await page.getByText(/^Chung$/).first().click();
  });
  await sleep(600);
  results.rulesPatches.length = 0;
  await page.locator('[data-testid="att-rules-general-save"]').click({ timeout: 10_000 });
  await sleep(2500);
  const toastRegion = await page.locator('[data-sonner-toast], [role="status"]').allInnerTexts().catch(() => []);
  const toastJoined = toastRegion.join(' ');
  const cfgDestructive = /cfgNotPersisted|Chỉ áp dụng cho mục chưa có API|featureInDev|chưa lưu/i.test(toastJoined);
  const cfgSuccess = /saveSuccess|Thành công|đã lưu/i.test(toastJoined) && !cfgDestructive;
  const patchStatus = results.rulesPatches[0]?.status ?? null;
  results.steps.settingsRulesSave = {
    clickPath: 'Thiết lập → Quy định chấm công → Chung → Lưu thay đổi',
    toastExcerpt: toastJoined.slice(0, 400),
    patchAttendanceRules: results.rulesPatches,
    buildStamp: `commit ${COMMIT} · CFG persist=${cfgSuccess ? 'likely-merged' : cfgDestructive ? 'hold-toast' : 'unknown'}`,
    passHonest:
      cfgSuccess || cfgDestructive || patchStatus === 200 || patchStatus === 204,
    cfgMergedNote: cfgSuccess ? 'PO-MFD-M1-ATT-P0-CFG-FE-01 path — success toast + PATCH' : 'destructive/hold or error toast documented',
  };
  await page.screenshot({ path: join(SCREEN, 'settings-rules-save.png'), fullPage: false });

  const failReasons = [];
  if (!results.steps.leaveBalance.pass) failReasons.push('leave-balance wire FAIL');
  if (!results.steps.shiftSchedule.pass) failReasons.push('shift schedule hold FAIL');
  if (!results.steps.shiftOvertime.pass) failReasons.push('shift OT hold FAIL');
  if (!results.steps.faceHold.pass) failReasons.push('face hold FAIL');
  if (!results.steps.settingsRulesSave.passHonest) failReasons.push('settings save honest UX FAIL');

  const passCore = failReasons.length === 0;
  results.failReasons = failReasons;
  results.verdict = passCore ? 'PASS' : 'FAIL';
  results.ack_status = passCore ? 'PASS_TO_PM' : 'FAIL';
  results.endedAt = new Date().toISOString();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: results.verdict, ack: results.ack_status, failReasons }));
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
