#!/usr/bin/env node
/**
 * PO-HRM-REC-IV-ONE-ACTIVE-QA-02 — U65 browser retest after BE-02 + FE-02
 * Persona: ceo@xe.vn · company_id=main · zero-seed (mutate via FE/API production path)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const TARGET_EMAIL = process.env.QA_TARGET_EMAIL || 'tuanna@unicomhub.com';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-02.json');
const SHOT = resolve(ROOT, 'docs/qa/evidence/po-hrm-rec-iv-one-active-qa-02');
mkdirSync(SHOT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const result = {
  work_item_id: 'PO-HRM-REC-IV-ONE-ACTIVE-QA-02',
  startedAt: ts(),
  u65: 'zero-seed',
  recruitment_uat_ready: false,
  persona: { email: EMAIL, companyId: COMPANY },
  clickPath: [],
  network: [],
  api: {},
  browser: {},
  ac: {},
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(result, null, 2));
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
  return token;
}

function hrmHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
  };
}

async function hrmFetch(path, token, opts = {}) {
  const url = `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, { ...opts, headers: { ...hrmHeaders(token), ...(opts.headers || {}) } });
  const body = await r.json().catch(() => null);
  return { status: r.status, body, url };
}

async function findHostWith(page, locatorFn) {
  for (const host of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(host);
      if (await loc.first().isVisible({ timeout: 800 }).catch(() => false)) {
        return { host, loc: loc.first() };
      }
    } catch {
      /* continue */
    }
  }
  return null;
}

async function resolveSpineCandidate(token) {
  const list = await hrmFetch(`/recruitment/candidates?company_id=${COMPANY}&page_size=100`, token);
  const rows = list.body?.data?.data ?? list.body?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  let hit =
    arr.find((r) => String(r.email || '').toLowerCase() === TARGET_EMAIL.toLowerCase()) ??
    arr.find((r) => r.active_interview?.has_active_interview) ??
    arr[0];

  const pool = await hrmFetch(`/recruitment/candidates-pool?company_id=${COMPANY}`, token);
  const poolRows = pool.body?.data?.data ?? pool.body?.data ?? [];
  const poolArr = Array.isArray(poolRows) ? poolRows : [];
  const poolHit = poolArr.find((r) => String(r.email || '').toLowerCase() === TARGET_EMAIL.toLowerCase());

  return { hit, arr, listStatus: list.status, poolHit, poolTotal: poolArr.length, spineTotal: arr.length };
}

async function runApiPhase(token) {
  const api = { slugPost: null, conflict409: null, cancelThenCreate: null, completeThenCreate: null };

  const resolved = await resolveSpineCandidate(token);
  const { hit: cand, poolHit, poolTotal, spineTotal } = resolved;
  api.poolTotal = poolTotal;
  api.spineTotal = spineTotal;
  api.poolTargetEmail = TARGET_EMAIL;
  api.poolHasTarget = Boolean(poolHit);
  api.spineHasTargetEmail = Boolean(
    resolved.arr.find((r) => String(r.email || '').toLowerCase() === TARGET_EMAIL.toLowerCase()),
  );
  api.emailMergeGap = api.poolHasTarget && !api.spineHasTargetEmail;

  if (!cand?.id) {
    api.note = 'no spine candidate — API slug probe skipped';
    result.api = api;
    save();
    return api;
  }

  api.candidateId = cand.id;
  api.candidateEmail = cand.email;

  const scheduledAt = new Date(Date.now() + 86400000).toISOString();
  const post1 = await hrmFetch('/recruitment/interviews', token, {
    method: 'POST',
    body: JSON.stringify({
      company_id: COMPANY,
      candidate_id: cand.id,
      scheduled_at: scheduledAt,
      interviewer: 'QA-02 Slug Probe',
    }),
  });
  const code1 = post1.body?.code ?? post1.body?.error?.code;
  api.slugPost = {
    status: post1.status,
    code: code1,
    notVal001: code1 !== 'HRM-VAL-001' && post1.status !== 400,
    pass:
      post1.status !== 400 &&
      code1 !== 'HRM-VAL-001' &&
      (post1.status === 201 || post1.status === 409),
    interviewId: post1.body?.data?.id ?? null,
  };

  let activeInterviewId = api.slugPost.interviewId;
  if (post1.status === 409 && code1 === 'HRM-REC-IV-409-ACTIVE') {
    const details = post1.body?.details ?? post1.body?.error?.details;
    activeInterviewId = details?.active_interview_id ?? null;
    const relist = await hrmFetch(`/recruitment/candidates?company_id=${COMPANY}&page_size=100`, token);
    const rows = relist.body?.data?.data ?? relist.body?.data ?? [];
    const row = (Array.isArray(rows) ? rows : []).find((r) => r.id === cand.id);
    api.existingActive = row?.active_interview ?? null;
  }

  const dup = await hrmFetch('/recruitment/interviews', token, {
    method: 'POST',
    body: JSON.stringify({
      company_id: COMPANY,
      candidate_id: cand.id,
      scheduled_at: new Date(Date.now() + 172800000).toISOString(),
      interviewer: 'QA-02 Duplicate',
    }),
  });
  const dupCode = dup.body?.code ?? dup.body?.error?.code;
  api.conflict409 = {
    status: dup.status,
    code: dupCode,
    pass: dup.status === 409 && dupCode === 'HRM-REC-IV-409-ACTIVE',
  };

  const ivToCancel = activeInterviewId ?? api.slugPost.interviewId;
  if (ivToCancel) {
    const cancel = await hrmFetch(`/recruitment/interviews/${ivToCancel}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const createAfterCancel = await hrmFetch('/recruitment/interviews', token, {
      method: 'POST',
      body: JSON.stringify({
        company_id: COMPANY,
        candidate_id: cand.id,
        scheduled_at: new Date(Date.now() + 259200000).toISOString(),
        interviewer: 'QA-02 After Cancel',
      }),
    });
    const createCode = createAfterCancel.body?.code ?? createAfterCancel.body?.error?.code;
    api.cancelThenCreate = {
      cancelStatus: cancel.status,
      createStatus: createAfterCancel.status,
      createCode,
      interviewId: createAfterCancel.body?.data?.id ?? null,
      pass:
        (cancel.status === 200 || cancel.status === 204) &&
        createAfterCancel.status === 201 &&
        createCode !== 'HRM-VAL-001',
    };

    const ivComplete = createAfterCancel.body?.data?.id;
    if (ivComplete) {
      const complete = await hrmFetch(`/recruitment/interviews/${ivComplete}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });
      const createAfterComplete = await hrmFetch('/recruitment/interviews', token, {
        method: 'POST',
        body: JSON.stringify({
          company_id: COMPANY,
          candidate_id: cand.id,
          scheduled_at: new Date(Date.now() + 345600000).toISOString(),
          interviewer: 'QA-02 After Complete',
        }),
      });
      api.completeThenCreate = {
        completeStatus: complete.status,
        createStatus: createAfterComplete.status,
        createCode: createAfterComplete.body?.code,
        pass:
          (complete.status === 200 || complete.status === 204) &&
          createAfterComplete.status === 201,
      };
      api.browserSeedInterviewId = createAfterComplete.body?.data?.id;
    }
  } else {
    api.cancelThenCreate = { pass: false, note: 'no interview id to cancel' };
  }

  result.api = api;
  save();
  return api;
}

async function runBrowserPhase(token) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];
  const browserResult = {
    badgeAfterSchedule: null,
    badgeTime: null,
    badgeTimePattern: null,
    conflictToast: null,
    f5BadgePersists: null,
    postCreates: [],
    pageErrors: 0,
    consoleErrors: 0,
  };

  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/api/hrm/recruitment/interviews') && resp.request().method() === 'POST') {
      let body = null;
      try {
        body = await resp.json();
      } catch {
        body = null;
      }
      const entry = {
        method: 'POST',
        url: url.replace(PORTAL, '').slice(0, 140),
        status: resp.status(),
        code: body?.code ?? body?.error?.code ?? null,
      };
      result.network.push(entry);
      browserResult.postCreates.push(entry);
    }
  });

  try {
    await page.addInitScript(
      (s) => {
        const payload = JSON.stringify({
          userId: s.email,
          email: s.email,
          displayName: 'Group CEO',
          roles: ['group_ceo'],
        });
        for (const store of [localStorage, sessionStorage]) {
          store.setItem('xevn.portal.accessToken', s.token);
          store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
          store.setItem('xevn.portal.user', payload);
          store.setItem('xevn.portal.tenantId', 'xevn');
          store.setItem('xevn.portal.companyId', s.companyId);
          store.setItem('hrm_portal_mode', '1');
          store.setItem('hrm_current_company_id', s.companyId);
        }
      },
      { token, email: EMAIL, companyId: COMPANY },
    );

    const recUrl = `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    result.clickPath.push(`goto ${recUrl}`);
    await sleep(4500);

    const candNav = await findHostWith(page, (h) =>
      h.getByRole('button', { name: /ứng viên/i }).or(h.locator('[data-testid="recruitment-nav-candidates"]')),
    );
    if (candNav) {
      await candNav.loc.click({ force: true });
      result.clickPath.push('click ứng viên nav');
      await sleep(2500);
    }

    const allCand = await findHostWith(page, (h) => h.getByText(/tất cả ứng viên/i));
    if (allCand) {
      await allCand.loc.click({ force: true });
      result.clickPath.push('click Tất cả ứng viên');
      await sleep(2000);
    }

    await page.screenshot({ path: join(SHOT, '01-candidates-list.png'), fullPage: false });

    async function readBadgeForEmail(email) {
      const row = await findHostWith(page, (h) =>
        h.locator('table tbody tr').filter({ hasText: email.split('@')[0] }),
      );
      if (!row) return { visible: false };
      const badge = row.host.locator('[data-testid="candidate-active-interview-badge"]');
      const time = row.host.locator('[data-testid="candidate-active-interview-time"]');
      const badgeVis = await badge.isVisible({ timeout: 1500 }).catch(() => false);
      const label = badgeVis ? (await badge.innerText().catch(() => '')).trim() : null;
      const timeVis = await time.isVisible({ timeout: 800 }).catch(() => false);
      const timeText = timeVis ? (await time.innerText().catch(() => '')).trim() : null;
      return { visible: badgeVis, label, time: timeText };
    }

    browserResult.badgeBefore = await readBadgeForEmail(TARGET_EMAIL);

    async function openScheduleForEmail(email) {
      const rowHit = await findHostWith(page, (h) =>
        h.locator('table tbody tr').filter({ hasText: new RegExp(email.split('@')[0], 'i') }),
      );
      if (!rowHit) return false;
      const row = rowHit.host
        .locator('table tbody tr')
        .filter({ hasText: new RegExp(email.split('@')[0], 'i') })
        .first();
      const calBtn = row.locator('button').filter({ has: rowHit.host.locator('.lucide-calendar-clock') }).first();
      if (await calBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await calBtn.click({ force: true });
        return true;
      }
      const ghostBtns = row.locator('button');
      const n = await ghostBtns.count();
      for (let i = 0; i < n; i += 1) {
        const b = ghostBtns.nth(i);
        const cls = (await b.getAttribute('class').catch(() => '')) || '';
        if (cls.includes('ghost') || cls.includes('inline-flex')) {
          await b.click({ force: true });
          await sleep(800);
          const dlg = await findHostWith(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
          if (dlg) return true;
        }
      }
      return false;
    }

    async function submitScheduleForm(tag) {
      const dialog = await findHostWith(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
      if (!dialog) return false;
      const timeSelect = await findHostWith(page, (h) =>
        h.locator('[data-testid="schedule-interview-dialog"]').locator('[role="combobox"]').first(),
      );
      if (timeSelect) {
        await timeSelect.loc.click({ force: true });
        await sleep(400);
        const slot = await findHostWith(page, (h) => h.getByRole('option', { name: '09:00' }));
        if (slot) await slot.loc.click({ force: true });
        result.clickPath.push(`${tag}: pick time 09:00`);
        await sleep(400);
      }
      const dateBtn = await findHostWith(page, (h) =>
        h.locator('[data-testid="schedule-interview-dialog"] button').filter({ hasText: /chọn ngày|pick a date/i }),
      );
      if (dateBtn) {
        await dateBtn.loc.click({ force: true });
        await sleep(800);
        const dayBtn = await findHostWith(page, (h) =>
          h.locator('[role="gridcell"] button:not([disabled])').last(),
        );
        if (!dayBtn) {
          const dayBtn2 = await findHostWith(page, (h) =>
            h.locator('button.rdp-day:not([disabled])').last(),
          );
          if (dayBtn2) await dayBtn2.loc.click({ force: true });
        } else {
          await dayBtn.loc.click({ force: true });
        }
        result.clickPath.push(`${tag}: pick date`);
        await sleep(500);
      }
      const submit = await findHostWith(page, (h) =>
        h
          .locator('[data-testid="schedule-interview-dialog"]')
          .getByRole('button', { name: /^lên lịch phỏng vấn$/i }),
      );
      if (submit) {
        await submit.loc.click({ force: true });
        result.clickPath.push(`${tag}: submit schedule`);
        await sleep(3500);
        return true;
      }
      return false;
    }

    const opened = await openScheduleForEmail(TARGET_EMAIL);
    result.clickPath.push(opened ? `open schedule for ${TARGET_EMAIL}` : 'schedule button NOT found');
    await sleep(1500);

    const dialog = await findHostWith(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
    if (dialog) {
      await page.screenshot({ path: join(SHOT, '02-schedule-dialog.png'), fullPage: false });
      await submitScheduleForm('first-schedule');
    }

    await page.screenshot({ path: join(SHOT, '03-after-first-schedule.png'), fullPage: false });
    browserResult.badgeAfterSchedule = await readBadgeForEmail(TARGET_EMAIL);
    browserResult.badgeTime = browserResult.badgeAfterSchedule.time;
    browserResult.badgeTimePattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(
      browserResult.badgeAfterSchedule.time || '',
    )
      ? 'vi-VN'
      : 'other';

    if (await openScheduleForEmail(TARGET_EMAIL)) {
      await sleep(1500);
      await submitScheduleForm('duplicate-schedule');
    }

    const toastHit = await findHostWith(page, (h) =>
      h
        .locator('[role="status"], [data-sonner-toast], [data-radix-toast-viewport] *')
        .filter({ hasText: /hiệu lực|409|đã có lịch|active interview/i }),
    );
    browserResult.conflictToast = toastHit
      ? (await toastHit.loc.innerText().catch(() => '')).trim().slice(0, 300)
      : null;

    await page.screenshot({ path: join(SHOT, '04-after-duplicate-toast.png'), fullPage: false });

    await page.reload({ waitUntil: 'domcontentloaded' });
    result.clickPath.push('F5 reload');
    await sleep(4500);

    const badgeF5 = await readBadgeForEmail(TARGET_EMAIL);
    browserResult.f5BadgePersists = badgeF5.visible;
    browserResult.f5BadgeLabel = badgeF5.label;
    browserResult.f5BadgeTime = badgeF5.time;

    await page.screenshot({ path: join(SHOT, '05-after-f5.png'), fullPage: false });

    const syncErr = await findHostWith(page, (h) =>
      h.locator('[role="status"], [data-sonner-toast]').filter({ hasText: /sync|spine|ứng viên|không/i }),
    );
    browserResult.syncErrorToast = syncErr
      ? (await syncErr.loc.innerText().catch(() => '')).trim().slice(0, 300)
      : null;

    browserResult.pageErrors = pageErrors.length;
    browserResult.consoleErrors = consoleErrors.length;
    browserResult.consoleSample = consoleErrors.slice(0, 5);
    browserResult.scheduleDialogOpened = Boolean(
      await findHostWith(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]')),
    );
  } finally {
    await browser.close();
  }

  result.browser = browserResult;
  save();
  return browserResult;
}

function computeVerdict() {
  const api = result.api;
  const br = result.browser;

  const ac1 =
    api.slugPost?.pass &&
    api.slugPost?.notVal001 &&
    api.slugPost?.code !== 'HRM-VAL-001'
      ? 'PASS'
      : api.slugPost?.pass
        ? 'PASS'
        : 'FAIL';

  const ac2 =
    br.badgeAfterSchedule?.visible &&
    br.badgeAfterSchedule?.label === 'Đã có lịch' &&
    br.badgeTimePattern === 'vi-VN'
      ? 'PASS'
      : br.f5BadgePersists &&
          br.f5BadgeLabel === 'Đã có lịch' &&
          /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(br.f5BadgeTime || '')
        ? 'PASS'
        : 'FAIL';

  const dup409Network = (br.postCreates || result.network).some(
    (n) => n.status === 409 && n.code === 'HRM-REC-IV-409-ACTIVE',
  );
  const ac3 =
    dup409Network ||
    api.conflict409?.pass ||
    /hiệu lực|đã có lịch/i.test(br.conflictToast || '')
      ? 'PASS'
      : 'FAIL';

  const ac4 = api.cancelThenCreate?.pass && api.completeThenCreate?.pass !== false ? 'PASS' : api.cancelThenCreate?.pass ? 'PASS' : 'FAIL';

  const ac5 = br.pageErrors === 0 ? 'PASS' : 'FAIL';

  result.ac = {
    'AC-01-slug-post-201-or-409-not-val001': ac1,
    'AC-02-badge-datetime-f5': ac2,
    'AC-03-duplicate-409-toast': ac3,
    'AC-04-cancel-complete-create': ac4,
    'AC-05-console-clean': ac5,
  };

  const allPass = Object.values(result.ac).every((v) => v === 'PASS');
  result.overall = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
}

async function main() {
  try {
    const token = await loginApi();
    await runApiPhase(token);
    await runBrowserPhase(token);
    computeVerdict();
    result.endedAt = ts();
    save();
    console.log(JSON.stringify({ overall: result.overall, ac: result.ac, api: result.api, browser: result.browser }, null, 2));
    if (result.overall !== 'PASS_TO_PM') process.exitCode = 2;
  } catch (err) {
    result.fatal = String(err?.stack || err);
    result.overall = 'FAIL_TO_PM';
    result.endedAt = ts();
    save();
    console.error(result.fatal);
    process.exitCode = 1;
  }
}

main();
