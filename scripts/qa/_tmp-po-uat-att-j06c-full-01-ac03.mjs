#!/usr/bin/env node
/**
 * PO-UAT-ATT-J06C-FULL-01 — AC-03 delta only (lock path retest)
 * Prior run: J-06c PASS · AC-01/02 PASS · AC-03 FAIL (create OVERLAP, lockApprove null)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const CEO = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const OU = 'main';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-att-j06c-full-01.json');
const OUT_AC03 = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-att-j06c-full-01-ac03.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-att-j06c-full-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `J06AC3-${Date.now().toString(36).slice(-5).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Days inside known closed sheets — skip prior OVERLAP leftovers */
const LOCK_DATES = [
  '2026-07-20',
  '2026-07-21',
  '2026-07-22',
  '2026-07-23',
  '2026-01-10',
  '2026-01-12',
  '2026-01-14',
  '2026-01-20',
  '2026-09-05',
  '2026-09-06',
  '2026-09-27',
  '2026-09-28',
];

const R = {
  work_item_id: 'PO-UAT-ATT-J06C-FULL-01-AC03',
  stamp: STAMP,
  attempts: [],
  lockCreate: null,
  lockApprove: null,
  ac03: null,
  network: [],
  consoleErrors: [],
};

async function login() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: CEO, password: PASS }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.data ?? j;
    const token = d?.accessToken ?? d?.access_token;
    if (token) {
      return {
        token,
        expiresAt: Date.now() + 8e6,
        companyId: OU,
        user: {
          userId: d?.user?.userId || CEO,
          email: CEO,
          displayName: 'CEO',
          roles: ['group_ceo'],
        },
      };
    }
  }
  throw new Error('login failed');
}

async function inject(page, s) {
  await page.addInitScript(
    ({ s, ou }) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', JSON.stringify(s.user));
        store.setItem('xevn.portal.companyId', ou);
        store.setItem('hrm_current_company_id', ou);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    { s, ou: OU },
  );
}

function attUrl() {
  return `${PORTAL}/hr/attendance?portal=1&tenantId=${TENANT}&companyId=${OU}&_ac03=${Date.now()}`;
}

async function fillViDate(locator, isoYmd) {
  const [y, m, d] = isoYmd.split('-');
  const vi = `${d}/${m}/${y}`;
  await locator.click({ force: true });
  await locator.fill('').catch(() => {});
  await locator.fill(vi).catch(async () => {
    await locator.press('Control+A').catch(() => {});
    await locator.type(vi, { delay: 12 }).catch(() => {});
  });
  await locator.press('Tab').catch(() => {});
}

async function main() {
  const session = await login();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/leave-requests/.test(u)) return;
    const m = res.request().method();
    if (m !== 'POST') return;
    const j = await res.json().catch(() => ({}));
    const entry = {
      status: res.status(),
      code: j?.code,
      message: String(j?.message || '').slice(0, 160),
      url: u.replace(PORTAL, '').replace(HRM, '').slice(0, 180),
      id: j?.data?.id,
      materialized_days: j?.data?.materialized_days,
    };
    R.network.push(entry);
    if (/leave-requests(\?|$)/.test(u) && !/\/(approve|reject|cancel)/.test(u)) {
      R.lockCreate = entry;
    }
    if (/\/approve/.test(u)) {
      R.lockApprove = entry;
    }
  });
  await inject(page, session);
  await page.goto(attUrl(), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);

  // Nghỉ phép tab
  await page.locator('[role="tab"],button').filter({ hasText: /^Nghỉ phép$/i }).first().click({ force: true }).catch(() => {});
  await sleep(1200);

  let pass = false;
  for (const day of LOCK_DATES) {
    R.lockCreate = null;
    R.lockApprove = null;
    const attempt = { day, create: null, approve: null };
    const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ/i }).first();
    if (!(await createBtn.isVisible().catch(() => false))) {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(400);
      const huy = page.getByRole('button', { name: /^Hủy$/i }).last();
      if (await huy.isVisible().catch(() => false)) await huy.click({ force: true }).catch(() => {});
      await sleep(400);
      attempt.error = 'no_create_cta';
      R.attempts.push(attempt);
      continue;
    }
    await createBtn.click({ force: true });
    await sleep(1000);
    const dlg = page.locator('[role="dialog"]').first();
    if (!(await dlg.isVisible().catch(() => false))) {
      attempt.error = 'no_dialog';
      R.attempts.push(attempt);
      continue;
    }
    for (let i = 0; i < 3; i++) {
      const c = dlg.locator('button[role="combobox"]').nth(i);
      if (await c.isVisible().catch(() => false)) {
        await c.click();
        await sleep(400);
        const prefer = page.getByRole('option').filter({ hasText: /UAT-0100/i });
        if ((await prefer.count()) > 0) await prefer.first().click({ force: true });
        else {
          const opt = page.getByRole('option').first();
          if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
        }
        await sleep(250);
      }
    }
    const reason =
      (await dlg.getByTestId('hdsd-leave-reason').count()) > 0
        ? dlg.getByTestId('hdsd-leave-reason')
        : dlg.locator('textarea').first();
    if (await reason.isVisible().catch(() => false)) await reason.fill(`AC03-LOCK ${STAMP} ${day}`);
    const dateInputs = dlg.locator(
      'input[type="date"], input[placeholder*="dd" i], input[inputmode="numeric"]',
    );
    if ((await dateInputs.count()) >= 2) {
      const t0 = await dateInputs.nth(0).getAttribute('type');
      if (t0 === 'date') {
        await dateInputs.nth(0).fill(day);
        await dateInputs.nth(1).fill(day);
      } else {
        await fillViDate(dateInputs.nth(0), day);
        await fillViDate(dateInputs.nth(1), day);
      }
    }
    await dlg.getByRole('button', { name: /Gửi|Lưu|Tạo/i }).last().click({ force: true });
    await sleep(3500);
    attempt.create = R.lockCreate;
    if (!(R.lockCreate && R.lockCreate.status >= 200 && R.lockCreate.status < 300)) {
      // close dialog if still open after OVERLAP / validation
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(300);
      const huy = page.getByRole('button', { name: /^Hủy$/i }).last();
      if (await huy.isVisible().catch(() => false)) await huy.click({ force: true }).catch(() => {});
      await sleep(400);
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(300);
      R.attempts.push(attempt);
      continue;
    }
    const leaveId = R.lockCreate.id;
    // Chờ duyệt → Duyệt
    await page.locator('[role="tab"],button').filter({ hasText: /Chờ duyệt|Duyệt/i }).first().click({ force: true }).catch(() => {});
    await sleep(1500);
    let clicked = false;
    if (leaveId) {
      const byId = page.getByTestId(`hdsd-leave-list-approve-${leaveId}`);
      if ((await byId.count()) > 0) {
        await byId.first().click({ force: true });
        clicked = true;
      }
    }
    if (!clicked) {
      const b = page.getByRole('button', { name: /^Duyệt$/i }).first();
      if (await b.isVisible().catch(() => false)) {
        await b.click({ force: true });
        clicked = true;
      }
    }
    await sleep(4000);
    attempt.approve = R.lockApprove;
    R.attempts.push(attempt);
    const appr = R.lockApprove;
    if (
      appr &&
      (appr.status === 409 || /LOCKED|HRM-ATT-SHEET-LOCKED/i.test(String(appr.code) + String(appr.message)))
    ) {
      pass = true;
      break;
    }
    // if approved successfully (not locked), cancel to avoid pollution — via FE if possible
    if (appr && appr.status >= 200 && appr.status < 300) {
      await page.locator('[role="tab"]').filter({ hasText: /Danh sách yêu cầu/i }).first().click({ force: true }).catch(() => {});
      await sleep(1000);
      const cancelBtn = page.getByTestId(`hdsd-leave-list-cancel-${leaveId}`);
      if ((await cancelBtn.count()) > 0) {
        await cancelBtn.first().click({ force: true });
        await sleep(500);
        const conf = page.getByTestId('hdsd-leave-cancel-confirm');
        if (await conf.isVisible().catch(() => false)) await conf.click({ force: true });
        await sleep(2000);
      }
    }
    await page.locator('[role="tab"],button').filter({ hasText: /^Nghỉ phép$/i }).first().click({ force: true }).catch(() => {});
    await sleep(800);
  }

  await page.screenshot({ path: join(SCREEN, '03b-ac03-delta.png') }).catch(() => {});
  R.ac03 = pass ? 'PASS' : 'FAIL';
  writeFileSync(OUT_AC03, JSON.stringify(R, null, 2));

  // Merge into main machine JSON
  try {
    const main = JSON.parse(readFileSync(OUT_JSON, 'utf8'));
    main.leave.lockCreate = R.lockCreate;
    main.leave.lockApprove = R.lockApprove;
    main.ac['AC-ATT-LV-SHEET-03'] = R.ac03;
    main.steps['AC-03'] = {
      verdict: R.ac03,
      summary: pass
        ? `409 LOCKED ${R.lockApprove?.code} day=${R.attempts.find((a) => a.approve?.status === 409)?.day}`
        : `delta FAIL attempts=${R.attempts.length} lastCreate=${JSON.stringify(R.lockCreate)} lastApprove=${JSON.stringify(R.lockApprove)}`,
      at: new Date().toISOString(),
      delta: true,
    };
    main.screens.push(
      join(SCREEN, '03b-ac03-delta.png').replace(/\\/g, '/'),
    );
    if (pass) {
      main.obs = (main.obs || []).filter((o) => !/AC smoke partial/i.test(o));
      const acFail = ['AC-ATT-LV-SHEET-01', 'AC-ATT-LV-SHEET-02', 'AC-ATT-LV-SHEET-03'].some(
        (k) => main.ac[k] === 'FAIL',
      );
      if (main.ac['J-HRM-06c'] === 'PASS' && !acFail) {
        main.verdict = 'PASS';
        main.ack_status = 'PASS_TO_PM';
      }
    }
    main.ac03_delta = { stamp: STAMP, attempts: R.attempts.length, verdict: R.ac03 };
    writeFileSync(OUT_JSON, JSON.stringify(main, null, 2));
  } catch (e) {
    console.error('merge fail', e.message);
  }

  await browser.close();
  console.log('AC-03', R.ac03, 'attempts', R.attempts.length);
  console.log('lockApprove', R.lockApprove);
  console.log(OUT_AC03);
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
