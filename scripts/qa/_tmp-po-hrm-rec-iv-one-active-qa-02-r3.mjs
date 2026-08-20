#!/usr/bin/env node
/** PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3 — BE-03 spine bridge retest */
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02-r3.json');
const SHOT = resolve(ROOT, 'docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02-r3');
mkdirSync(SHOT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const result = {
  work_item_id: 'PO-HRM-REC-IV-ONE-ACTIVE-QA-02-R3',
  startedAt: ts(),
  u65: 'zero-seed',
  recruitment_uat_ready: false,
  network: [],
  api: {},
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

function hdr(token) {
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'x-tenant-id': 'xevn',
    'x-company-id': COMPANY,
  };
}

async function hrm(path, token, opts = {}) {
  const r = await fetch(`${HRM}/api/hrm${path}`, { ...opts, headers: { ...hdr(token), ...(opts.headers || {}) } });
  const body = await r.json().catch(() => null);
  return { status: r.status, body };
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
  if (!host) return { visible: false };
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
    return true;
  }
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

async function submitSchedule(page) {
  const dlgHost = await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
  if (!dlgHost) return false;
  const dlg = dlgHost.locator('[data-testid="schedule-interview-dialog"]');
  await dlg.locator('[role="combobox"]').first().click({ force: true }).catch(() => {});
  await sleep(400);
  const opt = await findHost(page, (h) => h.getByRole('option', { name: '10:00' }).or(h.getByRole('option', { name: '09:00' })));
  if (opt) {
    const o = opt.getByRole('option', { name: '10:00' }).or(opt.getByRole('option', { name: '09:00' })).first();
    await o.click({ force: true }).catch(() => {});
  }
  await sleep(300);
  await dlg.getByRole('button', { name: /chọn ngày/i }).click({ force: true }).catch(() => {});
  await sleep(700);
  const day = await findHost(page, (h) => h.locator('button.rdp-day:not([disabled])').last());
  if (day) await day.locator('button.rdp-day:not([disabled])').last().click({ force: true });
  await sleep(400);
  await dlg.getByRole('button', { name: /^lên lịch phỏng vấn$/i }).click({ force: true });
  await sleep(4000);
  return true;
}

async function main() {
  const token = await login();
  if (!token) throw new Error('login failed');

  // Resolve Tuấn spine + cancel any ACTIVE for clean browser schedule
  const list = await hrm(`/recruitment/candidates?company_id=${COMPANY}&page_size=500`, token);
  const rows = list.body?.data?.data ?? [];
  const tuann = rows.find((r) => r.email?.toLowerCase() === TARGET.toLowerCase());
  result.api.spineHasTargetEmail = Boolean(tuann);
  result.api.emailMergeGap = false;
  result.api.activeBefore = tuann?.active_interview ?? null;

  if (tuann?.active_interview?.has_active_interview) {
    const ivList = await hrm(`/recruitment/interviews?company_id=${COMPANY}&candidate_id=${tuann.id}`, token);
    const ivs = ivList.body?.data?.data ?? ivList.body?.data ?? [];
    const active = (Array.isArray(ivs) ? ivs : []).find((i) => i.status === 'scheduled');
    if (active?.id) {
      await hrm(`/recruitment/interviews/${active.id}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      result.api.cancelledForCleanSchedule = active.id;
    }
  }

  // API slug regression
  if (tuann?.id) {
    const post = await hrm('/recruitment/interviews', token, {
      method: 'POST',
      body: JSON.stringify({
        company_id: COMPANY,
        candidate_id: tuann.id,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        interviewer: 'QA-R3 API slug',
      }),
    });
    const code = post.body?.code ?? post.body?.error?.code;
    result.api.slugPost = {
      status: post.status,
      code,
      pass: post.status !== 400 && code !== 'HRM-VAL-001' && (post.status === 201 || post.status === 409),
    };
    if (post.status === 201) result.api.apiInterviewId = post.body?.data?.id;

    const dup = await hrm('/recruitment/interviews', token, {
      method: 'POST',
      body: JSON.stringify({
        company_id: COMPANY,
        candidate_id: tuann.id,
        scheduled_at: new Date(Date.now() + 172800000).toISOString(),
        interviewer: 'QA-R3 dup',
      }),
    });
    const dupCode = dup.body?.code ?? dup.body?.error?.code;
    result.api.conflict409 = { status: dup.status, code: dupCode, pass: dup.status === 409 && dupCode === 'HRM-REC-IV-409-ACTIVE' };

    // cancel for browser schedule test
    const ivId = result.api.apiInterviewId ?? post.body?.data?.id;
    if (ivId) {
      await hrm(`/recruitment/interviews/${ivId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
    }
  }

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];
  const postCreates = [];

  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/hrm/recruitment/')) {
      let body = null;
      try { body = await resp.json(); } catch { /* */ }
      const entry = {
        method: resp.request().method(),
        path: url.replace(PORTAL, '').slice(0, 120),
        status: resp.status(),
        code: body?.code ?? body?.error?.code ?? null,
      };
      result.network.push(entry);
      if (url.includes('/interviews') && resp.request().method() === 'POST') postCreates.push(entry);
    }
  });

  await page.addInitScript((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
      store.setItem('xevn.portal.user', JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }));
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
    }
  }, { token, email: EMAIL });

  await page.goto(`${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=main&tenantId=xevn`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(5000);
  await navCandidates(page);
  await page.screenshot({ path: join(SHOT, '01-list-before.png') });

  result.browser.badgeBefore = await readBadge(page);
  const opened = await openSchedule(page);
  result.browser.scheduleOpened = opened;
  await page.screenshot({ path: join(SHOT, '02-dialog.png') });

  if (opened) await submitSchedule(page);
  result.browser.postCreates = postCreates;
  result.browser.badgeAfterSchedule = await readBadge(page);
  result.browser.badgeTimePattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(result.browser.badgeAfterSchedule.time || '')
    ? 'vi-VN'
    : 'other';

  await page.screenshot({ path: join(SHOT, '03-after-schedule.png') });

  // AC-03 duplicate
  if (await openSchedule(page)) {
    await sleep(1000);
    await submitSchedule(page);
  }
  const toastHost = await findHost(page, (h) =>
    h.locator('[data-sonner-toast], [role="status"]').filter({ hasText: /hiệu lực|409|đã có lịch|active/i }),
  );
  result.browser.conflictToast = toastHost
    ? (await toastHost.locator('[data-sonner-toast], [role="status"]').last().innerText().catch(() => '')).trim().slice(0, 300)
    : null;

  await page.screenshot({ path: join(SHOT, '04-duplicate-toast.png') });

  // F5 + re-nav
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await navCandidates(page);
  result.browser.f5Badge = await readBadge(page);
  result.browser.f5BadgePersists = result.browser.f5Badge.visible && /Đã có lịch/.test(result.browser.f5Badge.label || '');

  await page.screenshot({ path: join(SHOT, '05-after-f5.png') });

  // AC-04 cancel/complete via API then browser create
  if (tuann?.id) {
    const relist = await hrm(`/recruitment/candidates?company_id=${COMPANY}&page_size=500`, token);
    const row = (relist.body?.data?.data ?? []).find((r) => r.id === tuann.id);
    const activeIv = row?.active_interview;
    if (activeIv?.has_active_interview) {
      const ivList = await hrm(`/recruitment/interviews?company_id=${COMPANY}&candidate_id=${tuann.id}`, token);
      const ivs = ivList.body?.data?.data ?? [];
      const active = (Array.isArray(ivs) ? ivs : []).find((i) => i.status === 'scheduled');
      if (active?.id) {
        const cancel = await hrm(`/recruitment/interviews/${active.id}/status`, token, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled' }),
        });
        const create = await hrm('/recruitment/interviews', token, {
          method: 'POST',
          body: JSON.stringify({
            company_id: COMPANY,
            candidate_id: tuann.id,
            scheduled_at: new Date(Date.now() + 432000000).toISOString(),
            interviewer: 'QA-R3 after cancel',
          }),
        });
        result.api.cancelThenCreate = {
          cancelStatus: cancel.status,
          createStatus: create.status,
          pass: (cancel.status === 200 || cancel.status === 204) && create.status === 201,
        };
        if (create.body?.data?.id) {
          const complete = await hrm(`/recruitment/interviews/${create.body.data.id}/status`, token, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'completed' }),
          });
          const create2 = await hrm('/recruitment/interviews', token, {
            method: 'POST',
            body: JSON.stringify({
              company_id: COMPANY,
              candidate_id: tuann.id,
              scheduled_at: new Date(Date.now() + 518400000).toISOString(),
              interviewer: 'QA-R3 after complete',
            }),
          });
          result.api.completeThenCreate = {
            completeStatus: complete.status,
            createStatus: create2.status,
            pass: (complete.status === 200 || complete.status === 204) && create2.status === 201,
          };
        }
      }
    }
  }

  result.browser.pageErrors = pageErrors.length;
  result.browser.consoleErrors = consoleErrors.length;
  await browser.close();

  // Verdicts
  const ac1 = result.api.slugPost?.pass ? 'PASS' : 'FAIL';
  const ac2 =
    result.browser.badgeAfterSchedule?.visible &&
    /Đã có lịch/.test(result.browser.badgeAfterSchedule.label || '') &&
    result.browser.badgeTimePattern === 'vi-VN' &&
    result.browser.f5BadgePersists
      ? 'PASS'
      : 'FAIL';
  const dupNet = postCreates.some((p) => p.status === 409 && p.code === 'HRM-REC-IV-409-ACTIVE');
  const ac3 =
    dupNet || result.api.conflict409?.pass || /hiệu lực|đã có lịch/i.test(result.browser.conflictToast || '')
      ? 'PASS'
      : 'FAIL';
  const ac4 =
    result.api.cancelThenCreate?.pass && result.api.completeThenCreate?.pass !== false ? 'PASS' : 'FAIL';
  const ac5 = result.browser.pageErrors === 0 && result.browser.consoleErrors === 0 ? 'PASS' : 'FAIL';

  result.ac = {
    'AC-01-slug-post-201-or-409-not-val001': ac1,
    'AC-02-badge-datetime-f5': ac2,
    'AC-03-duplicate-409-toast': ac3,
    'AC-04-cancel-complete-create': ac4,
    'AC-05-console-clean': ac5,
  };
  result.overall = Object.values(result.ac).every((v) => v === 'PASS') ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  result.endedAt = ts();

  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ overall: result.overall, ac: result.ac, browser: result.browser, api: result.api }, null, 2));
  if (result.overall !== 'PASS_TO_PM') process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
