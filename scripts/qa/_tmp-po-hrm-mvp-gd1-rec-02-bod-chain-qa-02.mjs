#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-02
 * U65 browser-only — narrow ALT-01 retest after BE-ALT01-01 + must_keep smoke (AC-02d · AC-02b-05)
 * Persona: ceo@xe.vn · companyId=main · zero-seed · C-SLICE
 * cấm: seed · API fake inbox · DB mutate · honesty flip · Nest /rec dual · broaden beyond ALT-01+smoke
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8).toUpperCase();
const STAMP = `REC02BODQA2-${stampTail}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-QA-02',
  startedAt: ts(),
  stamp: STAMP,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser FE YCTD ALT-01 retest + must_keep smoke · Network 2xx · F5',
  depends_on: 'PO-HRM-MVP-GD1-REC-02-BOD-CHAIN-BE-ALT01-01',
  residual_target: 'R-REC-02-ALT-01',
  honesty: {
    recruitment_uat_ready: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_module_rec_uat: true,
    deny_nest_rec_dual: true,
  },
  deferred: {
    'ALT-02': 'replace employee — RETAIN from QA-01 · not re-run this wave',
    'CELL-PICKER': 'RETAIN from QA-01 · not re-run this wave',
    'ALT-03': 'CFG BOD on in_plan — not tested as FAIL',
    'XBOS-multi-actor-inbox': 'full multi-actor inbox persona — not tested as FAIL',
    'O4-O5-full-must_keep': 'narrow smoke only AC-02d + AC-02b-05 · no full matrix',
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  ac: {},
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
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 640)}`);
  save();
}
function defect(id, severity, summary, owner = 'dev-fe') {
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

function apiHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
}

async function api(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: apiHeaders(token),
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
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const path = u.replace(/^https?:\/\/[^/]+/, '');
      if (!/recruitment|job-templates|headcount-proposal|employees/.test(path)) return;
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: path.slice(0, 520),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
}

async function waitNet(predicate, timeoutMs = 28000) {
  const start = Date.now();
  const baseLen = R.network.length;
  while (Date.now() - start < timeoutMs) {
    const hit = [...R.network].reverse().find((n, i, arr) => {
      const idx = R.network.length - 1 - i;
      return idx >= baseLen - 5 && predicate(n);
    });
    // Prefer newest matching from end
    for (let i = R.network.length - 1; i >= 0; i--) {
      if (predicate(R.network[i]) && Date.parse(R.network[i].at) >= start - 500) {
        return R.network[i];
      }
    }
    await sleep(200);
  }
  return null;
}

function extractCells(plan) {
  const cells = [];
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (o.cell_id && (o.lifecycle_status || o.lifecycle)) cells.push(o);
    for (const v of Object.values(o)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') walk(v);
    }
  };
  walk(plan);
  return cells;
}

async function loadFixtures(token) {
  const plans = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans?company_id=${COMPANY}&page_size=50&year=2026`,
  );
  const planRows = plans.data?.data || [];
  const approved = planRows.filter((p) => p.status === 'approved');
  const cells = [];
  for (const p of approved.slice(0, 16)) {
    const g = await api(token, 'GET', `/api/hrm/recruitment/recruitment-plans/${p.id}?company_id=${COMPANY}`);
    for (const c of extractCells(g.data || {})) {
      if (c.lifecycle_status === 'need_hire_approved') {
        cells.push({
          planId: p.id,
          cell_id: c.cell_id,
          need: Number(c.headcount_need_hire || c.need_hire || 0),
          month: c.month,
          title: p.title,
        });
      }
    }
  }
  const uniq = [];
  const seen = new Set();
  for (const c of cells) {
    if (seen.has(c.cell_id)) continue;
    seen.add(c.cell_id);
    uniq.push(c);
  }
  const recs = await api(token, 'GET', `/api/hrm/recruitment/requisitions?company_id=${COMPANY}&page_size=100`);
  const ri = recs.data?.items || recs.data?.data || (Array.isArray(recs.data) ? recs.data : []);
  const used = new Set(
    (Array.isArray(ri) ? ri : [])
      .filter((r) => {
        if (r.headcount_mode !== 'in_plan' || !r.headcount_cell_id) return false;
        const st = String(r.status || '').toLowerCase();
        // Terminal statuses release the cell for a new YCTD (SPAWN-DUP only on active)
        if (['rejected', 'cancelled', 'closed', 'filled', 'hired'].includes(st)) return false;
        return true;
      })
      .map((r) => r.headcount_cell_id),
  );
  const free = uniq.filter((c) => !used.has(c.cell_id) && c.need > 0);
  const jds = await api(token, 'GET', `/api/hrm/recruitment/job-templates?company_id=${COMPANY}&page_size=30`);
  const ji = jds.data?.data || jds.data?.items || [];
  const jd = (Array.isArray(ji) ? ji : []).find((j) => j.is_active !== false) || (Array.isArray(ji) ? ji[0] : null);
  const emps = await api(
    token,
    'GET',
    `/api/hrm/employees?company_id=${COMPANY}&page_size=20&status=active`,
  );
  const ei = emps.data?.items || emps.data?.data || (Array.isArray(emps.data) ? emps.data : []);
  const emp = (Array.isArray(ei) ? ei : []).find((e) => e.id) || null;
  const nullMode = (Array.isArray(ri) ? ri : []).filter(
    (r) => r.headcount_mode == null || r.headcount_mode === '',
  );
  const pendingInPlan = (Array.isArray(ri) ? ri : []).filter(
    (r) =>
      r.headcount_mode === 'in_plan' &&
      String(r.status || '')
        .toLowerCase()
        .includes('pending'),
  );
  R.fixtures = {
    freeCells: free.slice(0, 8),
    freeCount: free.length,
    pendingInPlan: pendingInPlan.slice(0, 8).map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      company_id: r.company_id,
      matrix: r.approval_matrix_key,
    })),
    jd: jd ? { id: jd.id, code: jd.code, title: jd.title || jd.name } : null,
    emp: emp
      ? {
          id: emp.id,
          name: emp.full_name || emp.fullName || emp.name || emp.display_name || emp.code,
          code: emp.code || emp.employee_code,
        }
      : null,
    nullModeCount: nullMode.length,
    requisitionCount: Array.isArray(ri) ? ri.length : 0,
  };
  save();
  return {
    free,
    jd,
    emp,
    nullMode,
    pendingInPlan,
    requisitions: Array.isArray(ri) ? ri : [],
  };
}

async function runL0() {
  const checks = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      checks[k] = r.status;
    } catch (e) {
      checks[k] = String(e).slice(0, 80);
    }
  }
  try {
    const src = execSync(
      "powershell -NoProfile -Command \"(Get-Item 'apps/api/hrm-api/src/recruitment/recruitment.service.ts').LastWriteTimeUtc.ToString('o')\"",
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    const dist = execSync(
      "powershell -NoProfile -Command \"(Get-Item 'apps/api/hrm-api/dist/recruitment/recruitment.service.js').LastWriteTimeUtc.ToString('o')\"",
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    checks.srcMtime = src;
    checks.distMtime = dist;
    checks.stale_dist = new Date(src) > new Date(dist);
    const distBody = readFileSync(
      resolve(ROOT, 'apps/api/hrm-api/dist/recruitment/recruitment.service.js'),
      'utf8',
    );
    const hasFixed = /const values = \[reason, requisitionId\]/.test(distBody);
    const hasHole = /const values = \[reason,\s*(?:options\?\.actorId|actorId)/.test(distBody);
    checks.reject_bind_fix = hasFixed && !hasHole;
    checks.reject_bind_has_fixed = hasFixed;
    checks.reject_bind_has_hole = hasHole;
  } catch (e) {
    checks.dist_check = String(e).slice(0, 120);
  }
  R.l0 = checks;
  const ok =
    checks.hrm === 200 &&
    checks.portal === 200 &&
    checks.stale_dist !== true &&
    checks.reject_bind_fix !== false;
  ac('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(checks) });
  if (checks.stale_dist === true) {
    defect('R-REC-02-BOD-STALE-DIST', 'P0', 'hrm-api src newer than dist — rebuild+restart required', 'devops');
  }
  if (checks.reject_bind_fix === false) {
    defect('R-REC-02-ALT-01-DIST', 'P0', 'dist reject still has unused $2 actorId bind pattern', 'dev-be');
  }
  return ok;
}

async function selectRadix(page, testId, optionTextOrValue) {
  const trigger = page.getByTestId(testId);
  await trigger.click();
  await sleep(350);
  const byRole = page.getByRole('option', { name: new RegExp(optionTextOrValue, 'i') }).first();
  if ((await byRole.count()) > 0) {
    await byRole.click();
    return true;
  }
  const item = page
    .locator(`[role="option"], [data-radix-collection-item]`)
    .filter({ hasText: optionTextOrValue })
    .first();
  if ((await item.count()) > 0) {
    await item.click();
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function pickFirstJobTemplate(page) {
  const trigger = page.getByTestId('hdsd-requisition-job-template');
  if ((await trigger.count()) === 0) return { ok: false, reason: 'no_jd_picker' };
  await trigger.click();
  await sleep(500);
  const opt = page.getByRole('option').first();
  if ((await opt.count()) === 0) {
    const alt = page.locator('[cmdk-item], [role="option"]').first();
    if ((await alt.count()) === 0) {
      await page.keyboard.press('Escape').catch(() => {});
      return { ok: false, reason: 'no_jd_options' };
    }
    const label = ((await alt.textContent()) || '').trim().slice(0, 80);
    await alt.click();
    return { ok: true, label };
  }
  const label = ((await opt.textContent()) || '').trim().slice(0, 80);
  await opt.click();
  return { ok: true, label };
}

async function pickCatalogOption(page, testId, preferText) {
  const trigger = page.getByTestId(testId);
  if ((await trigger.count()) === 0) return { ok: false, reason: 'no_trigger' };
  const tag = await trigger.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
  // CatalogSearchPicker uses button; raw Input would be input — detect regression
  const isRawInput = tag === 'input' || tag === 'textarea';
  await trigger.click();
  await sleep(600);
  let item = preferText
    ? page.locator('[cmdk-item], [role="option"]').filter({ hasText: preferText }).first()
    : page.locator('[cmdk-item], [role="option"]').first();
  if ((await item.count()) === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'no_options', isRawInput };
  }
  const label = ((await item.textContent()) || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  await item.click();
  await sleep(300);
  const mono =
    (await page.getByTestId('yctd-cell-id-value').textContent().catch(() => '')) || '';
  // Human-readable: label has non-uuid words OR contains slash / month / dept words
  const uuidOnly = /^[0-9a-f-]{36}$/i.test(label.trim());
  const human =
    !uuidOnly &&
    (label.length > 12 ||
      /tháng|T\d|phòng|định biên|need|Cần|\/|\|/i.test(label) ||
      !/^[0-9a-f-]{8}/i.test(label));
  return { ok: true, label, monoId: mono.trim(), isRawInput, humanReadable: human || !uuidOnly };
}

async function fillBasicFields(page, title) {
  await page.getByTestId('hdsd-requisition-title').fill(title);
  const dept = page.getByTestId('hdsd-requisition-department');
  if ((await dept.count()) > 0) {
    const tag = await dept.evaluate((el) => el.tagName.toLowerCase());
    if (tag === 'input' || tag === 'textarea') await dept.fill('HCNS');
    else {
      await dept.click();
      await sleep(300);
      const opt = page.getByRole('option').first();
      if ((await opt.count()) > 0) await opt.click();
      else await page.keyboard.press('Escape').catch(() => {});
    }
  }
  const hc = page.getByTestId('hdsd-requisition-headcount');
  if ((await hc.count()) > 0) await hc.fill('1');
  const emp = page.getByTestId('hdsd-requisition-employment-type');
  if ((await emp.count()) > 0) {
    await emp.click().catch(() => {});
    await sleep(250);
    const opt = page.getByRole('option').first();
    if ((await opt.count()) > 0) await opt.click();
    else await page.keyboard.press('Escape').catch(() => {});
  }
}

async function openCreate(page) {
  await page.getByTestId('hdsd-requisition-create-btn').click();
  await page.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 15000 });
  await sleep(400);
}

async function clickRowChiTiet(page, title) {
  const row = page.locator('table tbody tr').filter({ hasText: title }).first();
  if ((await row.count()) === 0) {
    // fallback: click title text then Chi tiết nearby
    const t = page.getByText(title).first();
    if ((await t.count()) > 0) await t.click().catch(() => {});
  }
  const detailBtn = page
    .locator('table tbody tr')
    .filter({ hasText: title })
    .getByRole('button', { name: /Chi tiết/i })
    .first();
  if ((await detailBtn.count()) > 0) {
    await detailBtn.click();
  } else {
    await page.getByRole('button', { name: /Chi tiết/i }).first().click().catch(() => {});
  }
  await sleep(1200);
  return (await page.getByTestId('yctd-approval-chain').count()) > 0 ||
    (await page.getByText(title).count()) > 0;
}

async function submitWorkflowIfPresent(page) {
  // Prefer exact post-create strip (not row-scoped id behind dialog overlay)
  const stripExact = page.getByTestId('hdsd-requisition-submit-wf');
  if ((await stripExact.count()) > 0) {
    await stripExact.first().click({ force: true }).catch(() => {});
    const hit = await waitNet(
      (n) => n.method === 'POST' && /submit-workflow/.test(n.url) && n.status >= 200 && n.status < 300,
      12000,
    );
    if (hit) return hit;
  }
  const postCreate = page.getByTestId('hdsd-requisition-post-create-submit');
  if ((await postCreate.count()) > 0) {
    await postCreate.first().click({ force: true }).catch(() => {});
    await sleep(400);
    if ((await stripExact.count()) > 0) {
      await stripExact.first().click({ force: true }).catch(() => {});
    }
    const hit = await waitNet(
      (n) => n.method === 'POST' && /submit-workflow/.test(n.url) && n.status >= 200 && n.status < 300,
      12000,
    );
    if (hit) return hit;
  }
  // Dismiss overlays that intercept pointer events, then try row / detail buttons
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(250);
  }
  await sleep(400);
  const detailSubmit = page.locator('[data-testid^="hdsd-requisition-submit-wf"]').first();
  if ((await detailSubmit.count()) > 0) {
    await detailSubmit.click({ force: true }).catch(() => {});
    return waitNet((n) => n.method === 'POST' && /submit-workflow/.test(n.url), 25000);
  }
  const rowBtn = page.getByRole('button', { name: /Gửi duyệt/i }).first();
  if ((await rowBtn.count()) > 0) {
    await rowBtn.click({ force: true }).catch(() => {});
    return waitNet((n) => n.method === 'POST' && /submit-workflow/.test(n.url), 25000);
  }
  return null;
}

async function closeDetail(page) {
  const close = page.getByRole('button', { name: /Đóng|Close/i }).first();
  if ((await close.count()) > 0) await close.click().catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(400);
}

async function gotoRequisitions(page) {
  await page.goto(q('/hr/recruitment', { tab: 'requisitions' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2200);
}

async function runBrowser(session, fx) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const freeQueue = [...(fx.free || [])];
  const takeCell = () => freeQueue.shift() || null;

  // Narrow wave: skip CELL-PICKER · ALT-02 · full O4/O5 matrix (RETAIN QA-01)
  ac('CELL-PICKER', 'RETAIN', { summary: 'skipped narrow QA-02 — RETAIN stamp REC02BODQA-MSKWIO4O' });
  ac('ALT-02', 'RETAIN', { summary: 'skipped narrow QA-02 — RETAIN stamp REC02BODQA-MSKWIO4O' });

  // ========== AC-02d SHORT approve → open_for_hire (must_keep smoke) ==========
  log('AC-02d start');
  await gotoRequisitions(page);
  let create02d = null;
  let submit02d = null;
  let create02dOk = false;
  let title02d = `QA BOD AC02d ${STAMP}`;
  let ac02dPath = 'create';
  const cell02d = takeCell();
  let pick02d = { ok: false };

  if (cell02d || (fx.free && fx.free.length > 0) || true) {
    // Attempt FE create when picker has options; SPAWN-DUP → fall back to existing pending
    await openCreate(page);
    await selectRadix(page, 'yctd-headcount-mode', 'Trong định biên');
    await sleep(400);
    pick02d = await pickCatalogOption(page, 'yctd-headcount-cell-id');
    if (pick02d.ok) {
      await selectRadix(page, 'yctd-hire-reason', 'Tuyển mới');
      await fillBasicFields(page, title02d);
      await pickFirstJobTemplate(page);
      await page.getByTestId('hdsd-requisition-form-submit').click();
      create02d = await waitNet(
        (n) =>
          n.method === 'POST' &&
          /\/requisitions$/.test(n.url.split('?')[0]) &&
          n.status >= 200 &&
          n.status < 400,
        28000,
      );
      await sleep(1200);
      await shot(page, '04-ac02d-after-save');
      create02dOk = create02d && create02d.status >= 200 && create02d.status < 300;
      if (create02dOk) {
        submit02d = await submitWorkflowIfPresent(page);
        await sleep(1200);
        await shot(page, '05-ac02d-after-submit');
      } else {
        for (let i = 0; i < 3; i++) {
          await page.keyboard.press('Escape').catch(() => {});
          await sleep(200);
        }
      }
    } else {
      for (let i = 0; i < 2; i++) {
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(200);
      }
    }
  }

  // Fallback: existing pending in_plan (zero-seed — prior FE data, not API invent)
  if (!create02dOk) {
    const pendingList = fx.pendingInPlan || R.fixtures.pendingInPlan || [];
    const preferFe =
      pendingList.find((p) => /QA FE IN/i.test(String(p.title || ''))) || pendingList[0];
    if (preferFe?.title) {
      ac02dPath = 'existing_pending';
      title02d = preferFe.title;
      log('AC-02d fallback existing pending', { title: title02d, id: preferFe.id });
    }
  }

  let chainShort = false;
  let approve02d = null;
  let statusAfterApprove = null;
  let f5OpenHire = false;
  const canExercise02d = create02dOk || ac02dPath === 'existing_pending';

  if (canExercise02d) {
    await gotoRequisitions(page);
    // Prefer FE-created title if present in list
    if (ac02dPath === 'existing_pending') {
      // Prefer title containing FE IN from prior cluster QA
      const prefer = page.locator('table tbody tr').filter({ hasText: /QA FE IN|pending|chờ duyệt/i });
      if ((await prefer.count()) > 0) {
        const t = ((await prefer.first().textContent()) || '').trim();
        // keep title02d from fixture
      }
    }
    await clickRowChiTiet(page, title02d);
    await sleep(1000);
    chainShort =
      (await page.getByTestId('yctd-approval-chain').count()) > 0 &&
      (((await page.getByTestId('yctd-detail-matrix-label').textContent().catch(() => '')) || '').match(
        /SHORT/i,
      ) ||
        ((await page.getByTestId('yctd-approval-chain').textContent().catch(() => '')) || '').match(
          /SHORT|TP\/HR \(SHORT\)/i,
        ));
    if ((await page.getByTestId('yctd-transition-approve').count()) > 0) {
      await page.getByTestId('yctd-transition-approve').click({ force: true });
      approve02d = await waitNet(
        (n) => n.method === 'POST' && /transitions/.test(n.url) && n.status >= 200 && n.status < 300,
        25000,
      );
      await sleep(1400);
      statusAfterApprove =
        (await page.getByText(/Mở nhận hồ sơ/i).count()) > 0 ||
        ((await page.getByTestId('yctd-approval-next-hint').textContent().catch(() => '')) || '').match(
          /mở nhận hồ sơ|hoàn tất|Đã mở/i,
        );
    }
    await shot(page, '06-ac02d-after-approve');
    await closeDetail(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await clickRowChiTiet(page, title02d);
    await sleep(900);
    f5OpenHire =
      (await page.getByText(/Mở nhận hồ sơ/i).count()) > 0 ||
      ((await page.getByTestId('yctd-approval-next-hint').textContent().catch(() => '')) || '').match(
        /hoàn tất|Đã mở/i,
      ) ||
      ((await page.getByTestId('yctd-pipeline-flags').count()) > 0 &&
        (await page.getByTestId('yctd-bod-blocked-cv').count()) === 0);
    await shot(page, '07-ac02d-f5');
    await closeDetail(page);
  }

  const ac02dPass =
    canExercise02d &&
    chainShort &&
    approve02d &&
    approve02d.status >= 200 &&
    approve02d.status < 300 &&
    Boolean(statusAfterApprove) &&
    Boolean(f5OpenHire);

  ac('AC-02d', !canExercise02d ? 'BLOCKED' : ac02dPass ? 'PASS' : 'FAIL', {
    summary: `path=${ac02dPath} create=${create02d?.status} submit=${submit02d?.status} SHORT=${chainShort} approve=${approve02d?.status} open=${Boolean(statusAfterApprove)} F5=${Boolean(f5OpenHire)} title=${title02d.slice(0, 48)}`,
    create02d,
    submit02d,
    approve02d,
    chainShort,
    title: title02d,
    ac02dPath,
    pick02d,
  });
  if (canExercise02d && !ac02dPass)
    defect(
      'R-REC-02-AC-02d',
      'P0',
      `AC-02d FAIL path=${ac02dPath} chainShort=${chainShort} approve=${approve02d?.status} f5=${f5OpenHire}`,
    );
  R.journeys['AC-02d'] = {
    title: title02d,
    ac02dPath,
    create02d,
    submit02d,
    approve02d,
    chainShort,
    f5OpenHire,
    verdict: !canExercise02d ? 'BLOCKED' : ac02dPass ? 'PASS' : 'FAIL',
  };

  // ========== AC-02b-05 LONG TP/HR → approved (CV blocked) → BOD → open_for_hire ==========
  log('AC-02b-05 start');
  await gotoRequisitions(page);
  await openCreate(page);
  await selectRadix(page, 'yctd-headcount-mode', 'Ngoài định biên');
  await sleep(400);
  const longHint = (await page.getByTestId('yctd-long-matrix-hint').count()) > 0;
  const reasonOut = `Vượt KH quý — BOD QA ${STAMP}`;
  await page.getByTestId('yctd-out-of-plan-reason').fill(reasonOut);
  await selectRadix(page, 'yctd-hire-reason', 'Tuyển mới');
  const title02b = `QA BOD AC02b05 ${STAMP}`;
  await fillBasicFields(page, title02b);
  await pickFirstJobTemplate(page);
  await page.getByTestId('hdsd-requisition-form-submit').click();
  const create02b = await waitNet(
    (n) => n.method === 'POST' && /\/requisitions$/.test(n.url.split('?')[0]) && n.status >= 200 && n.status < 300,
    28000,
  );
  await sleep(1500);
  const submit02b = await submitWorkflowIfPresent(page);
  await sleep(1200);
  await shot(page, '08-ac02b-after-submit');

  let chainLong = false;
  let tpHrApprove = null;
  let afterTpHrApproved = false;
  let cvBlockedAfterTpHr = false;
  let f5ApprovedBlocked = false;
  let bodApprove = null;
  let openAfterBod = false;
  let f5OpenAfterBod = false;

  if (create02b && create02b.status >= 200 && create02b.status < 300) {
    await gotoRequisitions(page);
    await clickRowChiTiet(page, title02b);
    await sleep(900);
    const chainText = (await page.getByTestId('yctd-approval-chain').textContent().catch(() => '')) || '';
    chainLong =
      (await page.getByTestId('yctd-approval-chain').count()) > 0 &&
      (/LONG|BOD/i.test(chainText) ||
        ((await page.getByTestId('yctd-detail-matrix-label').textContent().catch(() => '')) || '').match(
          /LONG/i,
        ));
    const bodCvPending = (await page.getByTestId('yctd-bod-blocked-cv').count()) > 0;
    const approveLabel =
      (await page.getByTestId('yctd-transition-approve').textContent().catch(() => '')) || '';
    if ((await page.getByTestId('yctd-transition-approve').count()) > 0) {
      await page.getByTestId('yctd-transition-approve').click();
      tpHrApprove = await waitNet(
        (n) => n.method === 'POST' && /transitions/.test(n.url) && n.status >= 200 && n.status < 300,
        25000,
      );
      await sleep(1400);
    }
    afterTpHrApproved =
      (await page.getByText(/Đã duyệt|approved/i).count()) > 0 ||
      ((await page.getByTestId('yctd-approval-next-hint').textContent().catch(() => '')) || '').match(
        /BOD duyệt/i,
      );
    cvBlockedAfterTpHr =
      (await page.getByTestId('yctd-bod-blocked-cv').count()) > 0 ||
      (await page.getByTestId('yctd-pipeline-blocked-hint').count()) > 0 ||
      bodCvPending;
    await shot(page, '09-ac02b-after-tphr');
    await closeDetail(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await clickRowChiTiet(page, title02b);
    await sleep(900);
    f5ApprovedBlocked =
      (((await page.getByTestId('yctd-approval-next-hint').textContent().catch(() => '')) || '').match(
        /BOD/i,
      ) ||
        (await page.getByText(/Đã duyệt/i).count()) > 0) &&
      ((await page.getByTestId('yctd-bod-blocked-cv').count()) > 0 ||
        (await page.getByTestId('yctd-pipeline-blocked-hint').count()) > 0);
    await shot(page, '10-ac02b-f5-approved-blocked');

    // BOD step
    const bodLabel =
      (await page.getByTestId('yctd-transition-approve').textContent().catch(() => '')) || '';
    if ((await page.getByTestId('yctd-transition-approve').count()) > 0) {
      await page.getByTestId('yctd-transition-approve').click();
      bodApprove = await waitNet(
        (n) => n.method === 'POST' && /transitions/.test(n.url) && n.status >= 200 && n.status < 300,
        25000,
      );
      await sleep(1400);
    }
    openAfterBod =
      (await page.getByText(/Mở nhận hồ sơ/i).count()) > 0 ||
      ((await page.getByTestId('yctd-approval-next-hint').textContent().catch(() => '')) || '').match(
        /hoàn tất|Đã mở/i,
      );
    await shot(page, '11-ac02b-after-bod');
    await closeDetail(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await clickRowChiTiet(page, title02b);
    await sleep(900);
    f5OpenAfterBod =
      (await page.getByText(/Mở nhận hồ sơ/i).count()) > 0 ||
      ((await page.getByTestId('yctd-approval-next-hint').textContent().catch(() => '')) || '').match(
        /hoàn tất|Đã mở/i,
      );
    await shot(page, '12-ac02b-f5-open');
    await closeDetail(page);
    void approveLabel;
    void bodLabel;
  }

  const ac02bPass =
    create02b &&
    create02b.status >= 200 &&
    create02b.status < 300 &&
    longHint &&
    submit02b &&
    submit02b.status >= 200 &&
    submit02b.status < 300 &&
    chainLong &&
    tpHrApprove &&
    tpHrApprove.status >= 200 &&
    tpHrApprove.status < 300 &&
    afterTpHrApproved &&
    cvBlockedAfterTpHr &&
    f5ApprovedBlocked &&
    bodApprove &&
    bodApprove.status >= 200 &&
    bodApprove.status < 300 &&
    openAfterBod &&
    f5OpenAfterBod;

  ac('AC-02b-05', ac02bPass ? 'PASS' : 'FAIL', {
    summary: `create=${create02b?.status} LONG=${longHint}/${chainLong} submit=${submit02b?.status} TP/HR=${tpHrApprove?.status} approved+block=${afterTpHrApproved}/${cvBlockedAfterTpHr} F5block=${f5ApprovedBlocked} BOD=${bodApprove?.status} open=${openAfterBod} F5open=${f5OpenAfterBod}`,
    title: title02b,
  });
  if (!ac02bPass)
    defect(
      'R-REC-02-AC-02b-05',
      'P0',
      `AC-02b-05 FAIL chainLong=${chainLong} tphr=${tpHrApprove?.status} cvBlock=${cvBlockedAfterTpHr} f5b=${f5ApprovedBlocked} bod=${bodApprove?.status} open=${openAfterBod}`,
    );
  R.journeys['AC-02b-05'] = {
    title: title02b,
    chainLong,
    tpHrApprove,
    cvBlockedAfterTpHr,
    f5ApprovedBlocked,
    bodApprove,
    f5OpenAfterBod,
    verdict: ac02bPass ? 'PASS' : 'FAIL',
  };

  // ========== ALT-01 reject + reason ==========
  log('ALT-01 start');
  await gotoRequisitions(page);
  await openCreate(page);
  await selectRadix(page, 'yctd-headcount-mode', 'Ngoài định biên');
  const rejectReason = `Không đủ ngân sách — ALT01 ${STAMP}`;
  await page.getByTestId('yctd-out-of-plan-reason').fill(`Lý do ngoài ĐB ALT01 ${STAMP}`);
  await selectRadix(page, 'yctd-hire-reason', 'Tuyển mới');
  const titleAlt01 = `QA BOD ALT01 ${STAMP}`;
  await fillBasicFields(page, titleAlt01);
  await pickFirstJobTemplate(page);
  await page.getByTestId('hdsd-requisition-form-submit').click();
  const createAlt01 = await waitNet(
    (n) => n.method === 'POST' && /\/requisitions$/.test(n.url.split('?')[0]) && n.status >= 200 && n.status < 300,
    28000,
  );
  await sleep(1200);
  const submitAlt01 = await submitWorkflowIfPresent(page);
  await sleep(1000);
  let rejectHit = null;
  let reasonVisible = false;
  let f5Reason = false;
  if (createAlt01 && createAlt01.status >= 200 && createAlt01.status < 300) {
    await gotoRequisitions(page);
    await clickRowChiTiet(page, titleAlt01);
    await sleep(800);
    if ((await page.getByTestId('yctd-reject-reason').count()) > 0) {
      await page.getByTestId('yctd-reject-reason').fill(rejectReason);
      await sleep(300);
    }
    if ((await page.getByTestId('yctd-transition-reject').count()) > 0) {
      await page.getByTestId('yctd-transition-reject').click({ force: true });
      // Capture 2xx success OR 4xx/5xx failure (do not drop 500)
      rejectHit = await waitNet(
        (n) => n.method === 'POST' && /transitions/.test(n.url) && n.status >= 200,
        25000,
      );
      await sleep(1200);
    } else {
      // transitions panel missing — mark UI gap
      rejectHit = { status: 0, url: 'NO_REJECT_CTA', method: 'POST' };
    }
    reasonVisible =
      (await page.getByTestId('yctd-detail-rejected-reason').count()) > 0 &&
      ((await page.getByTestId('yctd-detail-rejected-reason').textContent().catch(() => '')) || '').includes(
        'Không đủ ngân sách',
      );
    await shot(page, '13-alt01-after-reject');
    await closeDetail(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await clickRowChiTiet(page, titleAlt01);
    await sleep(800);
    f5Reason =
      (await page.getByTestId('yctd-detail-rejected-reason').count()) > 0 &&
      ((await page.getByTestId('yctd-detail-rejected-reason').textContent().catch(() => '')) || '').includes(
        'Không đủ ngân sách',
      );
    await shot(page, '14-alt01-f5');
    await closeDetail(page);
  }
  const alt01Pass =
    createAlt01 &&
    createAlt01.status >= 200 &&
    createAlt01.status < 300 &&
    submitAlt01 &&
    submitAlt01.status >= 200 &&
    submitAlt01.status < 300 &&
    rejectHit &&
    rejectHit.status >= 200 &&
    rejectHit.status < 300 &&
    reasonVisible &&
    f5Reason;
  ac('ALT-01', alt01Pass ? 'PASS' : 'FAIL', {
    summary: `create=${createAlt01?.status} submit=${submitAlt01?.status} reject=${rejectHit?.status} reason=${reasonVisible} F5=${f5Reason}`,
    title: titleAlt01,
    rejectHit,
  });
  if (!alt01Pass) {
    const beReject500 =
      rejectHit && rejectHit.status >= 500
        ? ' BE reject transitions SQL/type error (unused $2 actorId in values) — HRM-SYS-001'
        : '';
    defect(
      'R-REC-02-ALT-01',
      'P0',
      `ALT-01 FAIL reject=${rejectHit?.status} reason=${reasonVisible} f5=${f5Reason}.${beReject500}`,
      rejectHit && rejectHit.status >= 500 ? 'dev-be' : 'dev-fe',
    );
  }
  R.journeys['ALT-01'] = { title: titleAlt01, rejectHit, reasonVisible, f5Reason, verdict: alt01Pass ? 'PASS' : 'FAIL' };

  // ========== Narrow must_keep smoke already exercised above (AC-02d · AC-02b-05) ==========
  log('must_keep smoke + transitions no-500 audit');
  const transitionPosts = R.network.filter((n) => n.method === 'POST' && /transitions/.test(n.url));
  const transition5xx = transitionPosts.filter((n) => n.status >= 500);
  const transitionOk = transitionPosts.filter((n) => n.status >= 200 && n.status < 300);
  const noTransition500 = transition5xx.length === 0 && transitionPosts.length > 0;
  ac('TRANSITIONS-NO-500', noTransition500 ? 'PASS' : 'FAIL', {
    summary: `posts=${transitionPosts.length} 2xx=${transitionOk.length} 5xx=${transition5xx.length} codes=${JSON.stringify(transition5xx.map((n) => n.status))}`,
    sample: transitionPosts.slice(0, 12),
  });
  if (!noTransition500)
    defect(
      'R-REC-02-TRANSITIONS-500',
      'P0',
      `transitions 5xx seen: ${transition5xx.map((n) => `${n.status} ${n.url}`).join(' | ') || 'none but zero posts'}`,
      'dev-be',
    );

  // Nest /rec dual DENY spot (read-only probe — not UF)
  const nestRec = await api(session.token, 'GET', '/api/hrm/rec/recruitment-requests');
  const nest404 = nestRec.status === 404;
  ac('DENY-NEST-REC', nest404 ? 'PASS' : 'FAIL', {
    summary: `GET /api/hrm/rec/recruitment-requests → ${nestRec.status} ${nestRec.code}`,
  });

  const smoke02d = R.ac['AC-02d']?.verdict === 'PASS';
  const smoke02b = R.ac['AC-02b-05']?.verdict === 'PASS';
  ac('MUSTKEEP-SMOKE-SHORT-LONG-BOD', smoke02d && smoke02b ? 'PASS' : 'FAIL', {
    summary: `AC-02d=${R.ac['AC-02d']?.verdict} AC-02b-05=${R.ac['AC-02b-05']?.verdict} (spot smoke · no full matrix)`,
  });
  if (!(smoke02d && smoke02b))
    defect(
      'R-REC-02-MUSTKEEP-SMOKE',
      'P0',
      `must_keep smoke FAIL AC-02d=${R.ac['AC-02d']?.verdict} AC-02b-05=${R.ac['AC-02b-05']?.verdict}`,
    );

  R.journeys.must_keep_smoke = {
    ac02d: R.ac['AC-02d']?.verdict,
    ac02b05: R.ac['AC-02b-05']?.verdict,
    transitions_no_500: noTransition500,
    nest404,
  };
  R.residual_alt01 =
    alt01Pass && noTransition500
      ? { id: 'R-REC-02-ALT-01', status: 'CLOSED' }
      : { id: 'R-REC-02-ALT-01', status: 'OPEN', reason: `alt01=${alt01Pass} no500=${noTransition500}` };

  await browser.close();
}

function finalize() {
  // RETAIN / NOTE_BLOCKED do not fail the wave
  const scored = Object.entries(R.ac).filter(([, v]) => !['RETAIN', 'NOTE_BLOCKED'].includes(v.verdict));
  const fails = scored.filter(([, v]) => v.verdict === 'FAIL');
  const blocked = scored.filter(([, v]) => v.verdict === 'BLOCKED');
  R.overall = fails.length === 0 ? (blocked.length ? 'PASS_WITH_BLOCKED' : 'PASS') : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.honesty.recruitment_uat_ready = false;
  save();
  console.log(`\n=== OVERALL ${R.overall} ack=${R.ack_status} stamp=${R.stamp} fails=${fails.length} residual=${JSON.stringify(R.residual_alt01)} ===`);
  for (const [k, v] of fails) console.log(`FAIL ${k}: ${v.summary}`);
}

async function main() {
  const l0ok = await runL0();
  if (!l0ok) {
    defect('R-REC-02-BOD-L0', 'P0', `L0 fail: ${JSON.stringify(R.l0)}`, 'devops');
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  const session = await loginApi();
  const fx = await loadFixtures(session.token);
  log('fixtures', {
    free: fx.free.length,
    pendingInPlan: fx.pendingInPlan?.length,
    jd: fx.jd?.id,
    emp: fx.emp?.id,
    nullMode: fx.nullMode.length,
  });
  await runBrowser(session, fx);
  finalize();
  process.exit(R.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  defect('R-REC-02-BOD-RUNNER', 'P0', String(e).slice(0, 400), 'qa');
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  save();
  process.exit(1);
});
