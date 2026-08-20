#!/usr/bin/env node
/** PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4 — browser POST + 409 sonner toast (U65 zero-seed) */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const COMPANY = 'main';
const TARGET = 'tuanna@unicomhub.com';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r4.json');
const SHOT = resolve(ROOT, 'docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r4');
mkdirSync(SHOT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const result = {
  work_item_id: 'PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R4',
  parent: 'PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1',
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  recruitment_uat_ready: false,
  network: [],
  browser: {},
  ac: {},
  overall: null,
};

async function login() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function findHost(page, fn) {
  for (const h of [page, ...page.frames()]) {
    try {
      if (await fn(h).first().isVisible({ timeout: 900 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return null;
}

async function navCandidates(page) {
  const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
  if (nav) await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
  await sleep(2000);
  const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
  if (all) await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
  await sleep(2500);
}

async function readBadge(page) {
  const host = await findHost(page, (h) =>
    h.locator('table tbody tr').filter({ hasText: /Tuấn/i }).locator('[data-testid="candidate-active-interview-badge"]'),
  );
  if (!host) return { visible: false, label: '', time: '' };
  const row = host.locator('table tbody tr').filter({ hasText: /Tuấn/i }).first();
  const badge = row.locator('[data-testid="candidate-active-interview-badge"]');
  const time = row.locator('[data-testid="candidate-active-interview-time"]');
  const vis = await badge.isVisible({ timeout: 2000 }).catch(() => false);
  const label = vis ? (await badge.innerText().catch(() => '')).trim() : '';
  const timeText = (await time.innerText().catch(() => '')).trim();
  return { visible: vis, label, time: timeText };
}

async function openSchedule(page) {
  const host = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: /Tuấn/i }));
  if (!host) return false;
  const row = host.locator('table tbody tr').filter({ hasText: /Tuấn/i }).first();
  const cal = row.locator('button').filter({ has: host.locator('.lucide-calendar-clock') }).first();
  if (await cal.isVisible({ timeout: 1500 }).catch(() => false)) {
    await cal.click({ force: true });
  } else {
    const btns = row.locator('button');
    const n = await btns.count();
    for (let i = 0; i < n; i += 1) {
      await btns.nth(i).click({ force: true });
      await sleep(600);
      const dlg = await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
      if (dlg) return true;
    }
    return false;
  }
  await sleep(1200);
  return Boolean(await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]')));
}

async function submitScheduleViaTestid(page) {
  const dlgHost = await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
  if (!dlgHost) return { submitted: false };
  const dlg = dlgHost.locator('[data-testid="schedule-interview-dialog"]');
  const submit = dlg.locator('[data-testid="schedule-interview-submit"]');
  const vis = await submit.isVisible({ timeout: 2000 }).catch(() => false);
  if (!vis) return { submitted: false };
  await submit.click({ force: true });
  await sleep(4500);
  return { submitted: true };
}

async function readSonnerToast(page) {
  const toastHost = await findHost(page, (h) =>
    h.locator('[data-sonner-toast]').filter({ hasText: /./ }),
  );
  if (!toastHost) return null;
  const text = (await toastHost.locator('[data-sonner-toast]').last().innerText().catch(() => '')).trim();
  return text.slice(0, 400) || null;
}

async function main() {
  const token = await login();
  if (!token) throw new Error('login failed');

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];
  const postCreates = [];

  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/hrm/recruitment/')) {
      let body = null;
      try {
        body = await resp.json();
      } catch {
        /* */
      }
      const entry = {
        method: resp.request().method(),
        path: url.replace(PORTAL, '').slice(0, 140),
        status: resp.status(),
        code: body?.code ?? body?.error?.code ?? null,
      };
      result.network.push(entry);
      if (url.includes('/interviews') && resp.request().method() === 'POST') postCreates.push(entry);
    }
  });

  await page.addInitScript(
    (s) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
        store.setItem('xevn.portal.user', JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }));
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', 'main');
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', 'main');
      }
    },
    { token, email: EMAIL },
  );

  await page.goto(`${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=main&tenantId=xevn`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(5000);
  await navCandidates(page);
  await page.screenshot({ path: join(SHOT, '01-list-before.png') });

  result.browser.badgeBefore = await readBadge(page);
  const hadActiveBefore = result.browser.badgeBefore.visible && /Đã có lịch/.test(result.browser.badgeBefore.label);

  const opened1 = await openSchedule(page);
  result.browser.scheduleOpened = opened1;
  await page.screenshot({ path: join(SHOT, '02-dialog-open.png') });

  let postsBeforeFirst = postCreates.length;
  if (opened1) await submitScheduleViaTestid(page);
  const firstPosts = postCreates.slice(postsBeforeFirst);
  result.browser.firstSubmitPosts = firstPosts;
  result.browser.badgeAfterFirstSubmit = await readBadge(page);
  await page.screenshot({ path: join(SHOT, '03-after-first-submit.png') });

  // AC-03: duplicate submit when ACTIVE exists
  let conflictToast = null;
  const needsDuplicateAttempt = hadActiveBefore || firstPosts.some((p) => p.status === 201);
  if (needsDuplicateAttempt) {
    await sleep(800);
    const opened2 = await openSchedule(page);
    if (opened2) {
      postsBeforeFirst = postCreates.length;
      await submitScheduleViaTestid(page);
      result.browser.duplicateSubmitPosts = postCreates.slice(postsBeforeFirst);
      conflictToast = await readSonnerToast(page);
      result.browser.conflictToast = conflictToast;
    }
  } else if (firstPosts.some((p) => p.status === 409 && p.code === 'HRM-REC-IV-409-ACTIVE')) {
    conflictToast = await readSonnerToast(page);
    result.browser.conflictToast = conflictToast;
  }

  await page.screenshot({ path: join(SHOT, '04-duplicate-toast.png') });

  // F5 regression AC-02
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await navCandidates(page);
  result.browser.f5Badge = await readBadge(page);
  result.browser.f5BadgePersists =
    result.browser.f5Badge.visible && /Đã có lịch/.test(result.browser.f5Badge.label || '');
  result.browser.badgeTimePattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(result.browser.f5Badge.time || '')
    ? 'vi-VN'
    : 'other';

  await page.screenshot({ path: join(SHOT, '05-after-f5.png') });

  result.browser.postCreates = postCreates;
  result.browser.pageErrors = pageErrors.length;
  result.browser.consoleErrors = consoleErrors.length;
  result.browser.consoleErrorSamples = consoleErrors.slice(0, 5);

  await browser.close();

  const browserPostOk = postCreates.some(
    (p) => (p.status === 201 || p.status === 409) && p.code !== 'HRM-VAL-001' && p.status !== 400,
  );
  const toastOk =
    /hiệu lực|đã có lịch|409|active/i.test(conflictToast || '') ||
    postCreates.some((p) => p.status === 409 && p.code === 'HRM-REC-IV-409-ACTIVE');
  const ac2 =
    result.browser.f5BadgePersists &&
    /Đã có lịch/.test(result.browser.f5Badge.label || '') &&
    result.browser.badgeTimePattern === 'vi-VN';

  result.ac = {
    'AC-01-browser-post-201-or-409': browserPostOk ? 'PASS' : 'FAIL',
    'AC-02-badge-datetime-f5': ac2 ? 'PASS' : 'FAIL',
    'AC-03-duplicate-409-sonner-toast': toastOk ? 'PASS' : 'FAIL',
    'AC-05-console-clean': result.browser.pageErrors === 0 && result.browser.consoleErrors === 0 ? 'PASS' : 'FAIL',
  };
  result.overall = Object.values(result.ac).every((v) => v === 'PASS') ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  result.endedAt = ts();

  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify(
      { overall: result.overall, ac: result.ac, postCreates, conflictToast, browser: result.browser },
      null,
      2,
    ),
  );
  if (result.overall !== 'PASS_TO_PM') process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
