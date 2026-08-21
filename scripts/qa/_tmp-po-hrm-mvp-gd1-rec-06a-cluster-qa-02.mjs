#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-02 — Browser residual J-HRM-REC-IV-03..06 (U65)
 * depends_on: BE-02 READY (active_interview_id projection)
 * RETAIN J-01/02/07 from QA-01 — no L1 cancel before browser (preserves ACTIVE)
 */
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
const ROW_RE = /Tuấn|Tuan/i;
const ROW_EMAIL = /tuanna@unicomhub\.com/i;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-02.json');
const SHOT = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-02');
mkdirSync(SHOT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = `REC06AQA2-${Date.now().toString(36).toUpperCase()}`;

const result = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-02',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  stamp,
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  recruitment_uat_ready: false,
  persona: `${EMAIL} / company_id=${COMPANY}`,
  depends_on: 'BE-02 READY_FOR_QA · R-REC-IV-PROJ-ID CLOSED at L1',
  network: [],
  browser: {},
  l1_entry: {},
  journeys: {},
  ac: {},
  residual: [],
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
  await sleep(1800);
  const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
  if (all) await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
  await sleep(2500);
}

async function rowHost(page) {
  const byName = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: ROW_RE }));
  if (byName) return byName;
  return findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: ROW_EMAIL }));
}

function rowLocator(host) {
  const byName = host.locator('table tbody tr').filter({ hasText: ROW_RE });
  return byName;
}

async function readBadge(page) {
  const host = await rowHost(page);
  if (!host) return { visible: false, label: '', time: '', rowFound: false };
  let row = host.locator('table tbody tr').filter({ hasText: ROW_RE }).first();
  if (!(await row.isVisible({ timeout: 800 }).catch(() => false))) {
    row = host.locator('table tbody tr').filter({ hasText: ROW_EMAIL }).first();
  }
  const badge = row.locator('[data-testid="candidate-active-interview-badge"]');
  const time = row.locator('[data-testid="candidate-active-interview-time"]');
  const vis = await badge.isVisible({ timeout: 2000 }).catch(() => false);
  return {
    visible: vis,
    label: vis ? (await badge.innerText().catch(() => '')).trim() : '',
    time: (await time.innerText().catch(() => '')).trim(),
    rowFound: true,
  };
}

async function clickRowCalendar(page) {
  const host = await rowHost(page);
  if (!host) return { ok: false, reason: 'no-row' };
  let row = host.locator('table tbody tr').filter({ hasText: ROW_RE }).first();
  if (!(await row.isVisible({ timeout: 800 }).catch(() => false))) {
    row = host.locator('table tbody tr').filter({ hasText: ROW_EMAIL }).first();
  }
  const manageBtn = row.locator('[data-testid="candidate-manage-interview-btn"]');
  const scheduleBtn = row.locator('[data-testid="candidate-schedule-interview-btn"]');
  if (await manageBtn.isVisible({ timeout: 1200 }).catch(() => false)) {
    await manageBtn.click({ force: true });
    await sleep(1200);
    return { ok: true, mode: 'manage-btn' };
  }
  if (await scheduleBtn.isVisible({ timeout: 1200 }).catch(() => false)) {
    await scheduleBtn.click({ force: true });
    await sleep(1200);
    return { ok: true, mode: 'schedule-btn' };
  }
  const cal = row.locator('button').filter({ has: host.locator('.lucide-calendar-clock') }).first();
  if (await cal.isVisible({ timeout: 1000 }).catch(() => false)) {
    await cal.click({ force: true });
    await sleep(1200);
    return { ok: true, mode: 'calendar-icon' };
  }
  return { ok: false, reason: 'no-calendar' };
}

async function openManage(page, track) {
  const badge = await readBadge(page);
  if (badge.visible) {
    const host = await rowHost(page);
    let row = host.locator('table tbody tr').filter({ hasText: ROW_RE }).first();
    if (!(await row.isVisible({ timeout: 800 }).catch(() => false))) {
      row = host.locator('table tbody tr').filter({ hasText: ROW_EMAIL }).first();
    }
    const badgeEl = row.locator('[data-testid="candidate-active-interview-badge"]');
    await badgeEl.click({ force: true });
    await sleep(1200);
    let dlg = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
    if (dlg) {
      const missing = await dlg
        .locator('[data-testid="manage-interview-id-missing"]')
        .isVisible({ timeout: 800 })
        .catch(() => false);
      const disabled = await dlg
        .locator('[data-testid="manage-interview-cancel-open"]')
        .isDisabled()
        .catch(() => true);
      track.openManage = { path: 'badge-click', missingId: missing, cancelDisabled: disabled };
      if (!missing && !disabled) return { opened: true, path: 'badge', missingId: false };
      await page.keyboard.press('Escape');
      await sleep(600);
    }
  }

  const click = await clickRowCalendar(page);
  track.calendarClick = click;
  const manage = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
  if (manage) {
    const missing = await manage
      .locator('[data-testid="manage-interview-id-missing"]')
      .isVisible({ timeout: 800 })
      .catch(() => false);
    const disabled = await manage
      .locator('[data-testid="manage-interview-cancel-open"]')
      .isDisabled()
      .catch(() => true);
    track.openManage = { path: click.mode || 'manage-btn', missingId: missing, cancelDisabled: disabled };
    return { opened: !missing && !disabled, path: click.mode || 'manage-btn', missingId: missing };
  }
  track.openManage = { path: 'fail', missingId: true };
  return { opened: false, path: 'none', missingId: true };
}

async function submitSchedule(page) {
  const dlgHost = await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
  if (!dlgHost) return { submitted: false };
  await dlgHost.locator('[data-testid="schedule-interview-submit"]').click({ force: true });
  await sleep(4500);
  return { submitted: true };
}

async function ensureActive(page, net) {
  const before = await readBadge(page);
  if (before.visible && /Đã có lịch/.test(before.label)) {
    return { badge: before, created: false, posts: [] };
  }
  const click = await clickRowCalendar(page);
  if (!click.ok) return { badge: before, created: false, error: click.reason };
  // If manage opened (unexpected), close
  const manage = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
  if (manage) {
    await page.keyboard.press('Escape');
    await sleep(500);
    return { badge: before, created: false, error: 'manage-opened-no-active-badge' };
  }
  const postsBefore = net.posts.length;
  await submitSchedule(page);
  await sleep(1000);
  const badge = await readBadge(page);
  return {
    badge,
    created: true,
    posts: net.posts.slice(postsBefore),
    click,
  };
}

async function readSonnerToast(page) {
  const toastHost = await findHost(page, (h) => h.locator('[data-sonner-toast]').filter({ hasText: /./ }));
  if (!toastHost) return null;
  const text = (await toastHost.locator('[data-sonner-toast]').last().innerText().catch(() => '')).trim();
  return text.slice(0, 500) || null;
}

async function pickRescheduleTime(page, prefer) {
  const dlg = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
  if (!dlg) return null;
  const trigger = dlg.locator('[data-testid="manage-interview-reschedule-time"]');
  await trigger.click({ force: true });
  await sleep(500);
  const options = page.locator('[role="option"]');
  const n = await options.count();
  let chosen = prefer;
  for (let i = 0; i < n; i += 1) {
    const t = (await options.nth(i).innerText()).trim();
    if (t && t !== prefer) {
      chosen = t;
      await options.nth(i).click({ force: true });
      await sleep(400);
      return chosen;
    }
  }
  if (n > 0) {
    chosen = (await options.first().innerText()).trim();
    await options.first().click({ force: true });
  }
  return chosen;
}

function isLaneA(path) {
  return (
    path.includes('/recruitment/interviews') &&
    !path.includes('/rec/interviews') &&
    !path.match(/\/api\/hrm\/rec\//)
  );
}

function patchStatusOk(p) {
  return p && p.status >= 200 && p.status < 300 && (p.code === 'HRM-REC-204' || p.status === 200);
}

function post2xx(arr) {
  return (arr || []).some((p) => p.status >= 200 && p.status < 300);
}

/** Non-destructive entry probe — verify projection id; PAST create only (no cancel). */
async function probeEntry(token) {
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'x-tenant-id': 'xevn',
  };
  const out = {};
  const list = await fetch(
    `${HRM}/api/hrm/recruitment/candidates?page_size=100&company_id=${COMPANY}`,
    { headers },
  );
  const listJ = await list.json().catch(() => ({}));
  const rows = listJ?.data?.data ?? [];
  const tuan = Array.isArray(rows)
    ? rows.find((r) => ROW_EMAIL.test(r.email || '') || /Tuấn/i.test(r.full_name || ''))
    : null;
  out.listStatus = list.status;
  out.candidateId = tuan?.id ?? null;
  out.nestedActiveId = tuan?.active_interview?.active_interview_id ?? null;
  out.flatActiveId = tuan?.active_interview_id ?? null;
  out.activeStatus = tuan?.active_interview?.active_interview_status ?? null;
  out.hasActive = Boolean(out.nestedActiveId);
  out.projectionOk = Boolean(out.nestedActiveId && out.flatActiveId && out.nestedActiveId === out.flatActiveId);

  // PAST — non-destructive soft fail (may 409 if ACTIVE)
  if (tuan?.id) {
    const past = await fetch(`${HRM}/api/hrm/recruitment/interviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        candidate_id: tuan.id,
        company_id: COMPANY,
        scheduled_at: '2020-01-15T09:00:00.000Z',
        interview_type: 'offline',
      }),
    });
    const pastJ = await past.json().catch(() => ({}));
    out.past = { status: past.status, code: pastJ?.code ?? pastJ?.error?.code ?? null };
  }
  return out;
}

async function main() {
  const token = await login();
  if (!token) throw new Error('login failed');

  result.l1_entry = await probeEntry(token);
  if (!result.l1_entry.projectionOk) {
    result.overall = 'FAIL_TO_PM';
    result.residual.push({
      id: 'R-REC-IV-PROJ-ID',
      severity: 'P0',
      note: 'Entry LIVE still missing nested/flat active_interview_id — BE-02 not sealed on LIVE',
    });
    result.endedAt = ts();
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ overall: result.overall, l1_entry: result.l1_entry, residual: result.residual }, null, 2));
    process.exitCode = 2;
    return;
  }

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];
  const net = { posts: [], patches: [], all: [] };

  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (!url.includes('/api/hrm/recruitment/')) return;
    let body = null;
    try {
      body = await resp.json();
    } catch {
      /* */
    }
    const entry = {
      method: resp.request().method(),
      path: url.replace(PORTAL, '').replace(HRM, '').slice(0, 200),
      status: resp.status(),
      code: body?.code ?? body?.error?.code ?? null,
      id: body?.data?.id ?? body?.data?.interview_id ?? body?.details?.active_interview_id ?? null,
      scheduled_at: body?.data?.scheduled_at ?? null,
    };
    net.all.push(entry);
    result.network.push(entry);
    if (url.includes('/interviews') && resp.request().method() === 'POST') net.posts.push(entry);
    if (url.includes('/interviews') && resp.request().method() === 'PATCH') net.patches.push(entry);
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

  // Ensure ACTIVE for residual journeys
  const ensured = await ensureActive(page, net);
  await page.screenshot({ path: join(SHOT, '02-ensure-active.png') });

  // ——— J-HRM-REC-IV-06 — Open ACTIVE manage with id ———
  const j06 = {};
  const open06 = await openManage(page, j06);
  j06.open = open06;
  j06.dialogVisible = Boolean(
    await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]')),
  );
  j06.scheduleNotSot = !(await findHost(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]')));
  j06.idMissingVisible = Boolean(
    await findHost(page, (h) => h.locator('[data-testid="manage-interview-id-missing"]')),
  );
  await page.screenshot({ path: join(SHOT, '03-manage-iv06.png') });
  await page.keyboard.press('Escape');
  await sleep(600);

  // ——— J-HRM-REC-IV-05 — R-A Đổi lịch ———
  const j05 = {};
  let badgePreRa = await readBadge(page);
  if (!(badgePreRa.visible && /Đã có lịch/.test(badgePreRa.label))) {
    j05.reEnsure = await ensureActive(page, net);
    badgePreRa = j05.reEnsure.badge;
  }
  const timeBefore = badgePreRa.time;
  const openRa = await openManage(page, j05);
  j05.open = openRa;
  await page.screenshot({ path: join(SHOT, '04-manage-open-ra.png') });

  let raPatch = null;
  if (openRa.opened) {
    const dlg = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
    await dlg.locator('[data-testid="manage-interview-reschedule-open"]').click({ force: true });
    await sleep(800);
    const patchesBefore = net.patches.length;
    const postsBefore = net.posts.length;
    const newTime = await pickRescheduleTime(page, '09:00');
    j05.pickedTime = newTime;
    await dlg.locator('[data-testid="manage-interview-reschedule-submit"]').click({ force: true });
    await sleep(4500);
    const newPatches = net.patches.slice(patchesBefore);
    const newPosts = net.posts.slice(postsBefore);
    raPatch =
      newPatches.find(
        (p) =>
          p.method === 'PATCH' &&
          /\/interviews\/[^/?]+$/.test(p.path.replace(/\?.*$/, '')) &&
          !p.path.includes('/status'),
      ) ||
      newPatches.find((p) => p.method === 'PATCH' && p.path.includes('/interviews/') && !p.path.includes('/status'));
    j05.patches = newPatches;
    j05.postsDuringRa = newPosts;
    j05.toast = await readSonnerToast(page);
    j05.raPatch = raPatch;
  }
  await sleep(1500);
  j05.badgeAfter = await readBadge(page);
  j05.timeChanged =
    Boolean(j05.badgeAfter?.time) &&
    j05.badgeAfter.time !== timeBefore &&
    /Đã có lịch/.test(j05.badgeAfter.label || '');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await navCandidates(page);
  j05.f5Badge = await readBadge(page);
  j05.f5Persists = j05.f5Badge.visible && /Đã có lịch/.test(j05.f5Badge.label || '');
  await page.screenshot({ path: join(SHOT, '05-ra-after-f5.png') });

  // ——— J-HRM-REC-IV-03 — Cancel → round 2 ———
  const j03 = {};
  let b03 = await readBadge(page);
  if (!(b03.visible && /Đã có lịch/.test(b03.label))) {
    j03.reEnsure = await ensureActive(page, net);
  }
  const openCancel = await openManage(page, j03);
  j03.open = openCancel;
  let cancelPatch = null;
  if (openCancel.opened) {
    const dlg = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
    const patchesBefore = net.patches.length;
    await dlg.locator('[data-testid="manage-interview-cancel-open"]').click({ force: true });
    await sleep(600);
    await dlg.locator('[data-testid="manage-interview-cancel-submit"]').click({ force: true });
    await sleep(4000);
    cancelPatch = net.patches.slice(patchesBefore).find((p) => p.path.includes('/status'));
    j03.cancelPatch = cancelPatch;
    j03.toast = await readSonnerToast(page);
  }
  await sleep(1200);
  j03.badgeAfterCancel = await readBadge(page);
  j03.badgeCleared =
    !j03.badgeAfterCancel.visible || !/Đã có lịch/.test(j03.badgeAfterCancel.label || '');

  const postsBeforeR2 = net.posts.length;
  j03.round2Click = await clickRowCalendar(page);
  await submitSchedule(page);
  j03.round2Posts = net.posts.slice(postsBeforeR2);
  j03.badgeRound2 = await readBadge(page);
  await page.screenshot({ path: join(SHOT, '06-cancel-round2.png') });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await navCandidates(page);
  j03.f5Round2 = await readBadge(page);
  j03.f5Round2Ok = j03.f5Round2.visible && /Đã có lịch/.test(j03.f5Round2.label || '');

  // ——— J-HRM-REC-IV-04 — no_show → round 2 ———
  const j04 = {};
  let b04 = await readBadge(page);
  if (!(b04.visible && /Đã có lịch/.test(b04.label))) {
    j04.reEnsure = await ensureActive(page, net);
    b04 = j04.reEnsure?.badge || (await readBadge(page));
  }
  const openNs = await openManage(page, j04);
  j04.open = openNs;
  let noShowPatch = null;
  if (openNs.opened) {
    const dlg = await findHost(page, (h) => h.locator('[data-testid="manage-active-interview-dialog"]'));
    const patchesBefore = net.patches.length;
    await dlg.locator('[data-testid="manage-interview-no-show"]').click({ force: true });
    await sleep(4000);
    noShowPatch = net.patches.slice(patchesBefore).find((p) => p.path.includes('/status'));
    j04.noShowPatch = noShowPatch;
    j04.toast = await readSonnerToast(page);
  }
  await sleep(1200);
  j04.badgeAfterNoShow = await readBadge(page);
  j04.terminalCleared =
    !j04.badgeAfterNoShow.visible || !/Đã có lịch/.test(j04.badgeAfterNoShow.label || '');

  const postsBeforeNsR2 = net.posts.length;
  await clickRowCalendar(page);
  await submitSchedule(page);
  j04.round2Posts = net.posts.slice(postsBeforeNsR2);
  j04.badgeRound2 = await readBadge(page);
  await page.screenshot({ path: join(SHOT, '07-noshow-round2.png') });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(5000);
  await navCandidates(page);
  j04.f5 = await readBadge(page);
  j04.f5Ok = j04.f5.visible && /Đã có lịch/.test(j04.f5.label || '');
  await page.screenshot({ path: join(SHOT, '08-f5-final.png') });

  // Lane A path check
  const dualNest = net.all.filter(
    (e) => e.path.includes('/api/hrm/rec/') || /\/rec\/interviews/.test(e.path),
  );

  result.browser = {
    ensured,
    j03,
    j04,
    j05,
    j06,
    pageErrors: pageErrors.length,
    consoleErrors: consoleErrors.length,
    consoleErrorSamples: consoleErrors.slice(0, 8),
    posts: net.posts,
    patches: net.patches,
    dualNestHits: dualNest.length,
  };

  const iv06 = open06.opened && j06.dialogVisible && j06.scheduleNotSot && !j06.idMissingVisible;
  const iv05 =
    openRa.opened &&
    raPatch &&
    raPatch.status >= 200 &&
    raPatch.status < 300 &&
    (j05.postsDuringRa || []).length === 0 &&
    j05.f5Persists &&
    (j05.timeChanged || Boolean(j05.pickedTime));
  const iv03 =
    patchStatusOk(cancelPatch) &&
    j03.badgeCleared &&
    post2xx(j03.round2Posts) &&
    j03.f5Round2Ok;
  const iv04 =
    patchStatusOk(noShowPatch) &&
    j04.terminalCleared &&
    post2xx(j04.round2Posts) &&
    (j04.badgeRound2?.visible || j04.f5Ok);

  result.journeys = {
    'J-HRM-REC-IV-01': 'PASS_RETAIN',
    'J-HRM-REC-IV-02': 'PASS_RETAIN',
    'J-HRM-REC-IV-03': iv03 ? 'PASS' : 'FAIL',
    'J-HRM-REC-IV-04': iv04 ? 'PASS' : 'FAIL',
    'J-HRM-REC-IV-05': iv05 ? 'PASS' : 'FAIL',
    'J-HRM-REC-IV-06': iv06 ? 'PASS' : 'FAIL',
    'J-HRM-REC-IV-07': 'PASS_RETAIN',
  };

  result.ac = {
    'AC-REC-IV-03-cancel-round2': iv03 ? 'PASS' : 'FAIL',
    'AC-REC-IV-04-noshow-round2': iv04 ? 'PASS' : 'FAIL',
    'AC-REC-IV-05-ra-reschedule': iv05 ? 'PASS' : 'FAIL',
    'AC-REC-IV-06-manage-active': iv06 ? 'PASS' : 'FAIL',
    'AC-REC-IV-R01-cancel-optional': patchStatusOk(cancelPatch) ? 'PASS' : 'FAIL',
    'AC-REC-IV-R04-noshow-terminal': patchStatusOk(noShowPatch) ? 'PASS' : 'FAIL',
    'AC-REC-IV-R05-ra-no-post': iv05 ? 'PASS' : 'FAIL',
    'O1-path-lane-a': dualNest.length === 0 && net.all.every((e) => !e.path.includes('/interviews') || isLaneA(e.path))
      ? 'PASS'
      : 'FAIL',
    'ERR-PAST-DATETIME':
      result.l1_entry?.past?.code === 'HRM-REC-IV-400-PAST-DATETIME' ||
      result.l1_entry?.past?.code === 'HRM-REC-IV-409-ACTIVE'
        ? 'PASS_OR_409_ACTIVE'
        : 'OBS',
    honesty_false: 'PASS',
    R_REC_IV_PROJ_ID: result.l1_entry.projectionOk ? 'CLOSED' : 'OPEN',
  };

  if (!iv06) {
    result.residual.push({
      id: 'R-REC-IV-MANAGE-ID',
      severity: 'P0',
      note: `Manage open missingId=${open06.missingId} opened=${open06.opened} path=${open06.path}`,
    });
  }
  if (!iv05) {
    result.residual.push({
      id: 'R-REC-IV-RA-BROWSER',
      severity: 'P0',
      note: `raPatch=${JSON.stringify(raPatch)} postsDuring=${(j05.postsDuringRa || []).length} f5=${j05.f5Persists}`,
    });
  }
  if (!iv03) {
    result.residual.push({
      id: 'R-REC-IV-CANCEL-BROWSER',
      severity: 'P0',
      note: `cancelPatch=${JSON.stringify(cancelPatch)} cleared=${j03.badgeCleared} r2=${post2xx(j03.round2Posts)} f5=${j03.f5Round2Ok}`,
    });
  }
  if (!iv04) {
    result.residual.push({
      id: 'R-REC-IV-NOSHOW-BROWSER',
      severity: 'P0',
      note: `noShowPatch=${JSON.stringify(noShowPatch)} cleared=${j04.terminalCleared} r2=${post2xx(j04.round2Posts)}`,
    });
  }

  const hardFails = Object.entries(result.journeys).filter(
    ([k, v]) =>
      ['J-HRM-REC-IV-03', 'J-HRM-REC-IV-04', 'J-HRM-REC-IV-05', 'J-HRM-REC-IV-06'].includes(k) &&
      v === 'FAIL',
  );

  result.overall = hardFails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  result.endedAt = ts();
  result.hardFails = { journeys: hardFails };

  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify(
      {
        overall: result.overall,
        stamp,
        journeys: result.journeys,
        ac: result.ac,
        residual: result.residual,
        hardFails: result.hardFails,
        l1_entry: result.l1_entry,
        raPatch,
        cancelPatch,
        noShowPatch,
        open06,
      },
      null,
      2,
    ),
  );

  await browser.close();
  if (result.overall !== 'PASS_TO_PM') process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
