#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-04-CLUSTER-QA-01
 * U65 browser J-HRM-REC-CV-04-01..04 · Quét kho + posted gate · Network /recruitment/
 * Persona: ceo@xe.vn · companyId=main · zero-seed · C-SLICE
 * cấm: seed · Campaign/REC-03 · Nest /rec dual · honesty flip · claim REC UAT
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-04-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-04-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8).toUpperCase();
const STAMP = `REC04QA-${stampTail}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-04-CLUSTER-QA-01',
  startedAt: ts(),
  stamp: STAMP,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser Quét kho · Network 2xx · F5',
  hdsd_align: true,
  hdsd_inventory: [
    'Tuyển dụng → Yêu cầu tuyển (YCTD)',
    'Chi tiết → Mở quét kho',
    'Tìm trong kho / Hoàn tất quét / Bỏ qua quét',
    'Lưu cờ pipeline posted (không Campaign)',
  ],
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_module_rec_uat: true,
    deny_campaign_rec03: true,
    deny_nest_rec_dual: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_rec_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  defects: [],
  fixtures: {},
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function journey(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
  save();
}
function defect(id, severity, summary, owner = 'dev-be') {
  R.defects.push({ id, severity, summary, owner, at: ts() });
  console.error(`[DEFECT ${severity}] ${id}: ${summary}`);
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  for (const [k, v] of Object.entries(extra)) {
    if (v != null) u.searchParams.set(k, String(v));
  }
  u.searchParams.set('_', String(Date.now()));
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
    raw: data,
  };
}

function apiHeaders(token, companyId = COMPANY) {
  return {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'x-company-id': companyId,
    'content-type': 'application/json',
  };
}

async function api(token, method, path, body, companyId = COMPANY) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: apiHeaders(token, companyId),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j.code, message: j.message, data: j.data, raw: j };
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const path = u.replace(/^https?:\/\/[^/]+/, '');
      if (/\/api\/hrm\/rec(\/|$|\?)/.test(path) && !/recruitment/.test(path)) {
        R.nest_rec_hits.push({ status: res.status(), path: path.slice(0, 240), at: ts() });
      }
      if (
        !/recruitment\/(candidates-pool|candidates|requisitions\/.+\/(internal-scan|pipeline-flags)|requisitions\?)/.test(
          path,
        )
      ) {
        return;
      }
      let bodyCode = null;
      let bodySnippet = null;
      try {
        const j = await res.json();
        bodyCode = j?.code ?? null;
        if (j?.data?.pipeline_flags || j?.data?.id) {
          bodySnippet = {
            id: j?.data?.id,
            flags: j?.data?.pipeline_flags,
            total: j?.data?.total ?? j?.total,
          };
        }
      } catch {
        /* */
      }
      R.network.push({
        at: ts(),
        status: res.status(),
        method: res.request().method(),
        path: path.slice(0, 420),
        code: bodyCode,
        snippet: bodySnippet,
      });
    } catch {
      /* */
    }
  });
}

function flagsOf(row) {
  return row?.pipeline_flags || row?.pipeline_flags_json || {};
}

async function listOpenForHire(token) {
  const res = await api(token, 'GET', '/api/hrm/recruitment/requisitions?company_id=main&page_size=100');
  const rows = res.data?.data || res.data || [];
  return Array.isArray(rows) ? rows.filter((r) => r.status === 'open_for_hire') : [];
}

async function getRequisition(token, id, companyId) {
  return api(
    token,
    'GET',
    `/api/hrm/recruitment/requisitions/${id}?company_id=${encodeURIComponent(companyId)}`,
    null,
    companyId,
  );
}

async function openYctdDetail(page, target) {
  const id = typeof target === 'string' ? null : target?.id;
  const title = typeof target === 'string' ? target : target?.title;
  let row = null;
  if (id) {
    const modeCell = page.getByTestId(`yctd-mode-${id}`);
    if ((await modeCell.count()) > 0) {
      row = modeCell.locator('xpath=ancestor::tr[1]');
    }
  }
  if (!row) {
    // Prefer exact title — shared prefixes (QA BOD AC02b05…) collide on slice().
    row = page.locator('tr').filter({ hasText: title }).first();
  }
  await row.waitFor({ state: 'visible', timeout: 20000 });
  const btn = row.getByRole('button', { name: /Chi tiết/i });
  await btn.click();
  await page.getByText('Chi tiết yêu cầu tuyển dụng').waitFor({ state: 'visible', timeout: 15000 });
  await sleep(800);
  return true;
}

async function gotoRequisitions(page) {
  const url = q('/hr/recruitment', { tab: 'requisitions' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2800);
  return url;
}

async function runL1(token) {
  const nest = await api(token, 'GET', '/api/hrm/rec/candidates-pool?company_id=main');
  R.l1.nest_rec = { status: nest.status, code: nest.code, message: nest.message };
  const fake = await api(
    token,
    'POST',
    '/api/hrm/recruitment/requisitions/00000000-0000-4000-8000-000000000001/internal-scan?company_id=main',
    { action: 'complete' },
  );
  R.l1.scan_route = { status: fake.status, code: fake.code, message: fake.message };

  const open = await listOpenForHire(token);
  R.l1.open_for_hire_count = open.length;
  const unscanned = open.filter((r) => {
    const f = flagsOf(r);
    return !f.internal_scan_done && !f.internal_scan_skipped && !f.posted;
  });
  R.fixtures.open = open.slice(0, 8).map((r) => ({
    id: r.id,
    title: r.title,
    company_id: r.company_id,
    flags: flagsOf(r),
  }));
  R.fixtures.unscanned = unscanned.slice(0, 6).map((r) => ({
    id: r.id,
    title: r.title,
    company_id: r.company_id,
  }));

  if (unscanned[0]) {
    const a = unscanned[0];
    const pool = await api(
      token,
      'GET',
      `/api/hrm/recruitment/candidates-pool?company_id=${encodeURIComponent(a.company_id)}&for=internal_scan&requisition_id=${a.id}&position_code=${encodeURIComponent(a.position_key || 'CEO')}&skill=logistics`,
      null,
      a.company_id,
    );
    R.l1.pool_scan = {
      status: pool.status,
      code: pool.code,
      message: pool.message,
      total: pool.data?.total ?? pool.data?.data?.length,
    };

    const postedBefore = await api(
      token,
      'PATCH',
      `/api/hrm/recruitment/requisitions/${a.id}/pipeline-flags?company_id=${encodeURIComponent(a.company_id)}`,
      { posted: true },
      a.company_id,
    );
    R.l1.posted_before_scan = {
      status: postedBefore.status,
      code: postedBefore.code,
      message: postedBefore.message,
    };
  }

  // SKIP-REASON empty body on a real id (EX)
  if (unscanned[1] || unscanned[0]) {
    const b = unscanned[1] || unscanned[0];
    const skipEmpty = await api(
      token,
      'POST',
      `/api/hrm/recruitment/requisitions/${b.id}/internal-scan?company_id=${encodeURIComponent(b.company_id)}`,
      { action: 'skip', skip_reason: '' },
      b.company_id,
    );
    R.l1.skip_empty = {
      status: skipEmpty.status,
      code: skipEmpty.code,
      message: skipEmpty.message,
      yctd: b.id,
    };
  }

  const routeLive =
    R.l1.scan_route?.code === 'HRM-REC-404' ||
    (R.l1.scan_route?.status !== 404 && !/Cannot POST/i.test(R.l1.scan_route?.message || ''));
  const nestDeny = R.l1.nest_rec?.status === 404;
  const postedGate =
    R.l1.posted_before_scan?.code === 'HRM-REC-CV-SCAN-REQUIRED' ||
    R.l1.posted_before_scan?.status === 400;
  const poolOk = R.l1.pool_scan?.status >= 200 && R.l1.pool_scan?.status < 300;
  const skipReason =
    R.l1.skip_empty?.code === 'HRM-REC-CV-SCAN-SKIP-REASON' ||
    R.l1.skip_empty?.status === 400;

  R.l1.verdict = {
    routeLive,
    nestDeny,
    postedGate,
    poolOk,
    skipReason,
    pass: routeLive && nestDeny && postedGate && poolOk && skipReason,
  };
  save();
  return { open, unscanned };
}

async function runBrowser(session, fixtures) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // Prefer unique titles — shared «QA BOD AC02b05 REC02BODQA*» prefixes collide in list.
  const pickUnique = (arr) => {
    const scored = [...arr].sort((a, b) => {
      const score = (t) => (/QA BOD AC02b05/i.test(t.title) ? 1 : 0);
      return score(a) - score(b);
    });
    return scored;
  };
  const uniquePool = pickUnique(fixtures.unscanned);
  const completeTarget = uniquePool[0];
  const skipTarget = uniquePool.find((r) => r.id !== completeTarget?.id);
  const gateTarget =
    uniquePool.find((r) => r.id !== completeTarget?.id && r.id !== skipTarget?.id) || skipTarget;

  if (!completeTarget) {
    journey('J-HRM-REC-CV-04-01', 'BLOCKED', {
      summary: 'No unscanned open_for_hire YCTD in scope — cannot browser Quét kho without seed',
    });
    await browser.close();
    return;
  }

  // ---------- J-01 + J-02 complete / 0-hits ----------
  log('J-01 start', { id: completeTarget.id, title: completeTarget.title });
  let url = await gotoRequisitions(page);
  await shot(page, '01-requisitions');
  await openYctdDetail(page, completeTarget);
  await shot(page, '02-detail-before-scan');

  const openBtn = page.getByTestId('yctd-cv-scan-open');
  const openVisible = (await openBtn.count()) > 0;
  if (!openVisible) {
    journey('J-HRM-REC-CV-04-01', 'FAIL', {
      summary: 'Mở quét kho button missing on open_for_hire detail',
      url,
    });
    defect('R-REC-04-FE-OPEN', 'P0', 'yctd-cv-scan-open missing', 'dev-fe');
    await browser.close();
    return;
  }
  await openBtn.click();
  await page.getByTestId('yctd-internal-cv-scan-dialog').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByTestId('yctd-cv-scan-skill').fill('logistics');
  await page.getByTestId('yctd-cv-scan-experience').fill('2 năm vận hành');
  const netBefore = R.network.length;
  await page.getByTestId('yctd-cv-scan-search').click();
  await sleep(2500);
  await shot(page, '03-scan-results');

  const poolHits = R.network
    .slice(netBefore)
    .filter(
      (n) =>
        n.method === 'GET' &&
        /candidates-pool/.test(n.path) &&
        /recruitment\//.test(n.path) &&
        /for=internal_scan/.test(n.path),
    );
  const nestDual = R.nest_rec_hits.length > 0;
  const resultsVisible = (await page.getByTestId('yctd-cv-scan-results').count()) > 0;
  const emptyOrRows =
    (await page.getByTestId('yctd-cv-scan-empty').count()) > 0 ||
    (await page.locator('[data-testid^="yctd-cv-scan-row-"]').count()) > 0;
  const poolPass =
    poolHits.some((h) => h.status >= 200 && h.status < 300) && resultsVisible && emptyOrRows && !nestDual;

  journey('J-HRM-REC-CV-04-01', poolPass ? 'PASS' : 'FAIL', {
    summary: `poolHits=${poolHits.length} status=${poolHits.map((h) => h.status).join(',')} results=${resultsVisible} emptyOrRows=${emptyOrRows} nestDual=${nestDual}`,
    url,
    network: poolHits.slice(0, 3),
    click_path: [
      'login ceo@xe.vn',
      'Tuyển dụng → YCTD',
      `Chi tiết «${completeTarget.title}»`,
      'Mở quét kho',
      'skill+exp → Tìm trong kho',
    ],
  });
  if (!poolPass) {
    defect(
      'R-REC-04-POOL',
      'P0',
      `GET candidates-pool internal_scan failed or missing /recruitment/ — hits=${JSON.stringify(poolHits.slice(0, 2))}`,
      'dev-be',
    );
  }

  // Optional attach if rows
  const attachBtn = page.locator('[data-testid^="yctd-cv-scan-attach-"]').first();
  let attached = false;
  if ((await attachBtn.count()) > 0) {
    const netAtt = R.network.length;
    await attachBtn.click();
    await sleep(2000);
    attached = R.network
      .slice(netAtt)
      .some(
        (n) =>
          n.method === 'POST' &&
          /\/recruitment\/candidates(\?|$)/.test(n.path) &&
          n.status >= 200 &&
          n.status < 300,
      );
  }

  const netComplete = R.network.length;
  await page.getByTestId('yctd-cv-scan-complete').click();
  await sleep(2500);
  const completeHits = R.network
    .slice(netComplete)
    .filter((n) => n.method === 'POST' && /internal-scan/.test(n.path) && /recruitment\//.test(n.path));
  const completeOk = completeHits.some((h) => h.status >= 200 && h.status < 300);

  // close detail if still open, F5, reopen
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
  url = await gotoRequisitions(page);
  await openYctdDetail(page, completeTarget);
  await shot(page, '04-detail-after-complete-f5');
  const badgeText =
    ((await page.getByTestId('yctd-cv-scan-audit-badge').first().textContent().catch(() => '')) || '') +
    ((await page.locator('[data-testid="yctd-cv-scan-detail-at"]').textContent().catch(() => '')) || '');
  const doneUi =
    /Đã quét|đã quét|quét kho/i.test(
      ((await page.locator('[data-testid="yctd-pipeline-flags"]').locator('..').textContent().catch(() => '')) ||
        '') + badgeText,
    ) ||
    (await page.getByText(/Đã quét kho/i).count()) > 0 ||
    (await page.getByTestId('yctd-cv-scan-detail-at').count()) > 0;

  // L1 confirm flags after F5
  const afterComplete = await getRequisition(
    session.token,
    completeTarget.id,
    completeTarget.company_id,
  );
  const fComplete = flagsOf(afterComplete.data);
  const flagsDone = fComplete.internal_scan_done === true && !fComplete.internal_scan_skipped;

  journey('J-HRM-REC-CV-04-02', completeOk && flagsDone ? 'PASS' : 'FAIL', {
    summary: `completeOk=${completeOk} attached=${attached} flagsDone=${flagsDone} doneUi=${doneUi} codes=${completeHits.map((h) => h.code || h.status).join(',')}`,
    flags: fComplete,
    network: completeHits.slice(0, 3),
    click_path: [
      '… Tìm trong kho',
      attached ? 'Gắn YCTD (optional)' : '0 hits path',
      'Hoàn tất quét',
      'F5 → Chi tiết badge/vết',
    ],
  });
  if (!(completeOk && flagsDone)) {
    defect(
      'R-REC-04-COMPLETE',
      'P0',
      `internal-scan complete or F5 flags fail — ${JSON.stringify({ completeHits: completeHits.slice(0, 2), fComplete })}`,
      completeOk ? 'dev-fe' : 'dev-be',
    );
  }

  // J-04 posted AFTER complete on same YCTD
  log('J-04 after-complete posted');
  const gateHintBefore = (await page.getByTestId('yctd-posted-scan-gate-hint').count()) > 0;
  const postedCb = page.getByTestId('yctd-flag-posted');
  if ((await postedCb.count()) > 0) {
    const checked = await postedCb.isChecked().catch(() => false);
    if (!checked) {
      await postedCb.check({ force: true }).catch(async () => {
        await postedCb.click({ force: true });
      });
    }
  }
  const netPosted = R.network.length;
  await page.getByTestId('yctd-pipeline-flags-save').click();
  await sleep(2200);
  const postedHits = R.network
    .slice(netPosted)
    .filter((n) => n.method === 'PATCH' && /pipeline-flags/.test(n.path) && /recruitment\//.test(n.path));
  const postedOk = postedHits.some((h) => h.status >= 200 && h.status < 300);
  await page.keyboard.press('Escape').catch(() => {});
  await gotoRequisitions(page);
  await openYctdDetail(page, completeTarget);
  await shot(page, '05-posted-after-scan-f5');
  const afterPosted = await getRequisition(session.token, completeTarget.id, completeTarget.company_id);
  const fPosted = flagsOf(afterPosted.data);
  const campaignDeny =
    ((await page.getByText(/không Campaign/i).count()) > 0 ||
      ((await page.getByTestId('yctd-pipeline-flags').textContent().catch(() => '')) || '').includes(
        'không Campaign',
      )) &&
    R.nest_rec_hits.length === 0;

  // ---------- J-04 BEFORE scan (FE block) on another YCTD ----------
  let beforeBlocked = false;
  let beforeCode = null;
  if (gateTarget && gateTarget.id !== completeTarget.id) {
    log('J-04 before-scan FE+BE gate', { title: gateTarget.title });
    await page.keyboard.press('Escape').catch(() => {});
    await gotoRequisitions(page);
    await openYctdDetail(page, gateTarget);
    const hint = (await page.getByTestId('yctd-posted-scan-gate-hint').count()) > 0;
    const cb = page.getByTestId('yctd-flag-posted');
    if ((await cb.count()) > 0) {
      await cb.check({ force: true }).catch(async () => {
        await cb.click({ force: true });
      });
      await sleep(400);
      // if FE reverts unchecked → blocked
      const stillChecked = await cb.isChecked().catch(() => false);
      beforeBlocked = hint || !stillChecked;
      if (stillChecked) {
        const netB = R.network.length;
        await page.getByTestId('yctd-pipeline-flags-save').click();
        await sleep(2000);
        const hitsB = R.network.slice(netB).filter((n) => /pipeline-flags/.test(n.path));
        beforeCode = hitsB.map((h) => h.code).find(Boolean) || null;
        beforeBlocked =
          beforeBlocked ||
          hitsB.some((h) => h.code === 'HRM-REC-CV-SCAN-REQUIRED' || h.status === 400);
      }
    }
    await shot(page, '06-posted-before-scan-blocked');
  } else {
    beforeBlocked = R.l1.posted_before_scan?.code === 'HRM-REC-CV-SCAN-REQUIRED';
    beforeCode = R.l1.posted_before_scan?.code;
  }

  const j04Pass = beforeBlocked && postedOk && fPosted.posted === true && campaignDeny;
  journey('J-HRM-REC-CV-04-04', j04Pass ? 'PASS' : 'FAIL', {
    summary: `beforeBlocked=${beforeBlocked} beforeCode=${beforeCode} postedOk=${postedOk} fPosted.posted=${fPosted.posted} campaignDeny=${campaignDeny} gateHintBeforeComplete=${gateHintBefore}`,
    flags: fPosted,
    network: postedHits.slice(0, 3),
    click_path: [
      'posted trước quét → FE/BE SCAN-REQUIRED',
      'sau complete → check posted → Lưu cờ',
      'F5 posted; UI không Campaign',
    ],
  });
  if (!j04Pass) {
    defect(
      'R-REC-04-POSTED-GATE',
      'P0',
      `posted gate journey fail — ${JSON.stringify({ beforeBlocked, beforeCode, postedOk, fPosted, campaignDeny })}`,
      beforeBlocked && !postedOk ? 'dev-be' : 'dev-fe',
    );
  }

  // ---------- J-03 skip + reason ----------
  if (!skipTarget || skipTarget.id === completeTarget.id) {
    journey('J-HRM-REC-CV-04-03', 'BLOCKED', {
      summary: 'Need second unscanned open_for_hire for skip path; L1 skip_empty still asserted',
      l1_skip_empty: R.l1.skip_empty,
    });
  } else {
    log('J-03 skip', { id: skipTarget.id, title: skipTarget.title });
    await page.keyboard.press('Escape').catch(() => {});
    await gotoRequisitions(page);
    await openYctdDetail(page, skipTarget);
    await page.getByTestId('yctd-cv-scan-open').click();
    await page.getByTestId('yctd-internal-cv-scan-dialog').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByTestId('yctd-cv-scan-skip-open').click();
    await sleep(300);
    const netSkipEmpty = R.network.length;
    await page.getByTestId('yctd-cv-scan-skip-confirm').click();
    await sleep(800);
    const emptyNet = R.network.slice(netSkipEmpty).filter((n) => /internal-scan/.test(n.path));
    const emptyBlockedClient =
      emptyNet.length === 0 ||
      emptyNet.some((h) => h.status === 400 || h.code === 'HRM-REC-CV-SCAN-SKIP-REASON');

    const reason = `QA skip REC04 ${STAMP} — kho không ưu tiên kênh nội bộ`;
    await page.getByTestId('yctd-cv-scan-skip-reason').fill(reason);
    const netSkip = R.network.length;
    await page.getByTestId('yctd-cv-scan-skip-confirm').click();
    await sleep(2200);
    const skipHits = R.network
      .slice(netSkip)
      .filter(
        (n) =>
          n.method === 'POST' &&
          /internal-scan/.test(n.path) &&
          /recruitment\//.test(n.path) &&
          n.path.includes(skipTarget.id),
      );
    const skipOk = skipHits.some((h) => h.status >= 200 && h.status < 300);
    const skipBodyFlags = skipHits.find((h) => h.status >= 200 && h.status < 300)?.snippet?.flags;
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);
    await gotoRequisitions(page);
    await openYctdDetail(page, skipTarget);
    await shot(page, '07-skip-f5');
    const afterSkip = await getRequisition(session.token, skipTarget.id, skipTarget.company_id);
    const fSkip = flagsOf(afterSkip.data);
    const skipFlags =
      (fSkip.internal_scan_skipped === true &&
        String(fSkip.internal_scan_skip_reason || '').includes('QA skip REC04')) ||
      (skipBodyFlags?.internal_scan_skipped === true &&
        String(skipBodyFlags?.internal_scan_skip_reason || '').includes('QA skip REC04'));
    const reasonUi =
      (await page.getByTestId('yctd-cv-scan-detail-at').count()) > 0 ||
      ((await page.getByText(/Lý do/i).count()) > 0 &&
        ((await page.locator('body').textContent()) || '').includes('QA skip REC04'));

    const j03Pass = emptyBlockedClient && skipOk && skipFlags;
    journey('J-HRM-REC-CV-04-03', j03Pass ? 'PASS' : 'FAIL', {
      summary: `id=${skipTarget.id} emptyBlocked=${emptyBlockedClient} skipOk=${skipOk} skipFlags=${skipFlags} reasonUi=${reasonUi} l1Skip=${R.l1.skip_empty?.code} fSkip.skipped=${fSkip.internal_scan_skipped}`,
      flags: fSkip,
      skipBodyFlags,
      network: skipHits.slice(0, 3),
      click_path: [
        `Chi tiết id=${skipTarget.id}`,
        'Mở quét kho → Bỏ qua quét…',
        'Xác nhận không lý do → toast/400 SKIP-REASON',
        'Nhập lý do → Xác nhận → F5',
      ],
    });
    if (!j03Pass) {
      defect(
        'R-REC-04-SKIP',
        'P0',
        `skip journey fail — ${JSON.stringify({ id: skipTarget.id, emptyBlockedClient, skipOk, fSkip, skipBodyFlags, skipHits: skipHits.slice(0, 2) })}`,
        'dev-be',
      );
    }
  }

  // Campaign invent DENY smoke
  const campaignInvent =
    (await page.getByRole('link', { name: /Campaign|chiến dịch đăng tin/i }).count()) > 0 ||
    (await page.getByTestId('rec-campaign').count()) > 0;
  R.l1.campaign_invent = { present: campaignInvent };

  await shot(page, '08-final');
  await browser.close();
}

async function main() {
  console.log(`STAMP ${STAMP} commit ${COMMIT}`);
  // L0
  try {
    const h = await fetch(`${HRM}/api/hrm/`);
    R.l0.hrm = h.status;
    const p = await fetch(PORTAL);
    R.l0.portal = p.status;
    const x = await fetch('http://127.0.0.1:28002/api/xbos');
    R.l0.xbos = x.status;
  } catch (e) {
    R.l0.error = String(e);
  }

  const session = await loginApi();
  const { unscanned } = await runL1(session.token);
  if (!R.l1.verdict?.pass) {
    defect(
      'R-REC-04-L1-SEAL',
      'P0',
      `L1 seal incomplete after rebuild — ${JSON.stringify(R.l1.verdict)} ${JSON.stringify({ scan: R.l1.scan_route, pool: R.l1.pool_scan, posted: R.l1.posted_before_scan, skip: R.l1.skip_empty })}`,
      'devops',
    );
  }

  await runBrowser(session, { unscanned });

  const jIds = ['J-HRM-REC-CV-04-01', 'J-HRM-REC-CV-04-02', 'J-HRM-REC-CV-04-03', 'J-HRM-REC-CV-04-04'];
  const verdicts = jIds.map((id) => R.journeys[id]?.verdict);
  const anyFail = verdicts.some((v) => v === 'FAIL');
  const anyBlocked = verdicts.some((v) => v === 'BLOCKED');
  const allPass = verdicts.every((v) => v === 'PASS');
  const nestDualFail = R.nest_rec_hits.length > 0;
  if (nestDualFail) {
    defect('R-REC-04-NEST-DUAL', 'P0', `Nest /rec SoT hits: ${JSON.stringify(R.nest_rec_hits.slice(0, 3))}`, 'dev-fe');
  }

  if (allPass && !nestDualFail && R.defects.filter((d) => d.severity === 'P0').length === 0) {
    R.overall = 'PASS';
    R.ack_status = 'PASS_TO_PM';
  } else if (anyFail || nestDualFail) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
  } else if (anyBlocked) {
    R.overall = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
  } else {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
  }

  R.endedAt = ts();
  R.honesty.recruitment_uat_ready = false;
  R.honesty.seed_used = false;
  save();
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        journeys: Object.fromEntries(jIds.map((id) => [id, R.journeys[id]?.verdict])),
        defects: R.defects,
        l1: R.l1.verdict,
        nest_rec_hits: R.nest_rec_hits.length,
      },
      null,
      2,
    ),
  );
  process.exit(R.ack_status === 'PASS_TO_PM' ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  defect('R-REC-04-RUNNER', 'P0', String(e?.stack || e), 'qa');
  save();
  process.exit(1);
});
