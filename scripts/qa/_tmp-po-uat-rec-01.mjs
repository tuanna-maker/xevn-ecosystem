#!/usr/bin/env node
/**
 * PO-UAT-REC-01 — Recruitment module-level UAT pack (U65 zero-seed · browser-only)
 * Pack:
 *  1. UV create → list union spine · F5
 *  2. Compare YCTD path if reachable
 *  3. YCTD↔JD bind smoke
 *  4. Interview one-active / schedule if reachable
 *  5. Plan console / candidates chrome
 *  6. Process gates: DnD storm / mojibake / duplicate shell / Uncaught
 * DENIED: seed · recruitment_uat_ready=true on partial slice
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5175',
].filter(Boolean);
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-rec-01.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-rec-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `UATREC-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const CAND_NAME = `UV UAT REC ${STAMP}`;
const CAND_EMAIL = `uv.uat.rec.${STAMP.toLowerCase()}@xe.vn`;
const REQ_TITLE = `YCTD UAT REC ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function cellFilled(v) {
  const t = String(v || '').trim();
  return Boolean(t) && t !== '—' && t !== '-' && t !== '–' && !/^n\/?a$/i.test(t);
}

function hasMojibake(text) {
  if (!text) return false;
  // True UTF-8→Latin-1 mojibake only — NOT legitimate VI diacritics (Â in NHÂN, Ê, Ô…).
  return /Ã[¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À-ÿ]|Ä‘|Ä|á»[a-zA-Z0-9]|áº[a-zA-Z0-9]|â€[™œ]|ï¿½|Æ°á|NhÃ¢n|sá»±/.test(
    text,
  );
}

function unwrapList(body) {
  if (!body || typeof body !== 'object') return [];
  const d = body.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(d)) return d;
  return [];
}

const results = {
  work_item_id: 'PO-UAT-REC-01',
  program: 'PO-UAT-MODULES-PARALLEL-01',
  module: 'Tuyển dụng',
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL: null, HRM, XBOS, TENANT, STAMP },
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    process_nogo_history_retained: true,
    prior: 'po-hrm-rec-ux-qc-process-01 NO-GO awareness',
  },
  denied: ['seed', 'recruitment_uat_ready=true', 'partial_slice_as_module_pass'],
  l0: {},
  pack: {},
  process_gates: {
    dndStormHits: [],
    mojibakeHits: [],
    pageErrors: [],
    consoleErrors: [],
    uncaughtHits: [],
    duplicateShell: null,
  },
  network: [],
  screens: [],
  click_log: [],
  ids: {},
  residuals: [],
  gaps: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || '');
}
function recordPack(id, verdict, detail = {}) {
  results.pack[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

async function pickPortal() {
  for (const base of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(5000) });
      if (r.status === 200 || r.status === 304) return base.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return null;
}

function q(portal, path, extra = {}) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  if (extra.requisition_id) u.searchParams.set('requisition_id', extra.requisition_id);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function loginApi(portal) {
  const r = await fetch(`${portal}/api/xbos/auth/login`, {
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
    email: EMAIL,
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

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
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
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    const t = String(msg.text());
    if (msg.type() === 'error') results.process_gates.consoleErrors.push(t.slice(0, 280));
    if (/Unable to find (any )?drag handle|@hello-pangea\/dnd|Invariant failed.*[Dd]rag/i.test(t)) {
      results.process_gates.dndStormHits.push(t.slice(0, 200));
    }
    if (/Uncaught/i.test(t)) results.process_gates.uncaughtHits.push(t.slice(0, 200));
  });
  page.on('pageerror', (err) => {
    const t = String(err?.message || err);
    results.process_gates.pageErrors.push(t.slice(0, 280));
    if (/ReferenceError|TypeError|Uncaught/i.test(t)) {
      results.process_gates.uncaughtHits.push(t.slice(0, 200));
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      const interesting =
        /requisitions|candidates|compare|interviews|job-templates|plans|applications/i.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;

      if (method === 'POST' && /\/candidates(\?|$)/.test(u) && !/pool/.test(u)) {
        try {
          const postData = res.request().postData();
          entry.requestBody = postData ? JSON.parse(postData) : null;
          const j = await res.json().catch(() => ({}));
          const row = j?.data ?? j;
          entry.code = j?.code || j?.error?.code || null;
          entry.createdId = row?.id || null;
          entry.yctd_title = row?.yctd_title ?? null;
          entry.position_name = row?.position_name ?? null;
          if (row?.id) results.ids.candidateId = row.id;
          results.lastCreate = entry;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/requisitions(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
        try {
          const j = await res.json().catch(() => ({}));
          const row = j?.data ?? j;
          entry.code = j?.code || null;
          entry.requisitionId = row?.id || null;
          entry.job_template_id = row?.job_template_id ?? null;
          if (row?.id) results.ids.requisitionId = row.id;
          results.lastReqCreate = entry;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/interviews(\?|$)/.test(u)) {
        try {
          const j = await res.json().catch(() => ({}));
          entry.code = j?.code || j?.error?.code || null;
          entry.message = String(j?.message || j?.error?.message || '').slice(0, 200);
          results.lastInterviewPost = entry;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /\/compare/.test(u)) {
        entry.compare = true;
        results.lastCompare = entry;
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function findInFrames(page, locatorFn) {
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(h);
      if (await loc.first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return page;
}

async function checkShell(page) {
  const shell = await page.evaluate(() => {
    const brandMarks = document.querySelectorAll('[data-testid="portal-brand-mark"]');
    const duplicateStrips = [];
    const walker = document.body?.innerText || '';
    const titleHits = [...document.querySelectorAll('h1, [class*="brand"], header')].filter((el) => {
      const t = (el.textContent || '').trim();
      return /XeVN OS|Command Center/i.test(t) && !el.closest('[data-testid="portal-brand-mark"]');
    });
    for (const el of titleHits.slice(0, 5)) {
      duplicateStrips.push({ text: (el.textContent || '').trim().slice(0, 80) });
    }
    return {
      brandMarkCount: brandMarks.length,
      duplicateStrips,
      bodyHasMojibake: /Ã[¡-ÿ]|Ä‘|Ä|á»[a-zA-Z]|áº[a-zA-Z]|â€[™œ]|ï¿½|NhÃ¢n|sá»±/.test(walker),
    };
  });
  results.process_gates.duplicateShell = shell;
  if (shell.bodyHasMojibake) results.process_gates.mojibakeHits.push('shell_body');
  return shell;
}

async function selectFirstOption(host, testId) {
  const trigger = host.getByTestId(testId).first();
  if (!(await trigger.isVisible({ timeout: 3000 }).catch(() => false))) return null;
  await trigger.click({ force: true });
  await sleep(500);
  const opts = host.locator('[role="option"]');
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const opt = opts.nth(i);
    const t = (await opt.innerText().catch(() => '')).trim();
    const val = (await opt.getAttribute('data-value').catch(() => '')) || '';
    if (!t || /Chọn|__none__/i.test(t) || val === '__none__') continue;
    await opt.click({ force: true });
    await sleep(600);
    return { text: t, value: val, count: n };
  }
  return { text: null, value: null, count: n };
}

async function pack1_uv(page, portal) {
  log('PACK1_UV_start');
  const url = q(portal, '/hr/recruitment', { tab: 'candidates' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4500);
  await shot(page, '01-candidates');
  const body0 = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(body0)) results.process_gates.mojibakeHits.push('candidates_list');
  if (/Sync ERROR|HRM API request failed \(5/i.test(body0)) {
    recordPack('P1_UV_CREATE_LIST_F5', 'FAIL', { summary: 'candidates Sync ERROR / API fail' });
    return;
  }

  const host = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-create-btn'));
  await host.getByTestId('hdsd-candidate-create-btn').first().click({ force: true }).catch(async () => {
    await host.getByRole('button', { name: /Thêm ứng viên|Thêm UV/i }).first().click({ force: true });
  });
  await sleep(2000);
  const dlgHost = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-form-dialog'));
  const formOk = await dlgHost.getByTestId('hdsd-candidate-form-dialog').isVisible().catch(() => false);
  if (!formOk) {
    recordPack('P1_UV_CREATE_LIST_F5', 'FAIL', { summary: 'create form dialog not visible' });
    return;
  }
  await shot(page, '01b-uv-form');

  const yctd = await selectFirstOption(dlgHost, 'hdsd-candidate-form-yctd');
  if (!yctd?.text) {
    recordPack('P1_UV_CREATE_LIST_F5', 'FAIL', {
      summary: 'no receivable YCTD option under U65',
      yctd,
    });
    results.gaps.push('P1: no YCTD receivable for UV create');
    return;
  }
  results.ids.selectedYctd = yctd;
  const pos = dlgHost.getByTestId('hdsd-candidate-form-position');
  const positionVal =
    (await pos.inputValue().catch(() => '')) || (await pos.innerText().catch(() => ''));
  await dlgHost.getByLabel(/Họ và tên|Họ tên|Full name/i).fill(CAND_NAME).catch(async () => {
    await dlgHost.locator('input').first().fill(CAND_NAME);
  });
  await dlgHost.getByLabel(/Email/i).fill(CAND_EMAIL).catch(async () => {
    const inputs = dlgHost.locator('input[type="email"], input');
    const n = await inputs.count();
    for (let i = 0; i < n; i++) {
      const type = (await inputs.nth(i).getAttribute('type').catch(() => '')) || '';
      const name = (await inputs.nth(i).getAttribute('name').catch(() => '')) || '';
      if (/email/i.test(type) || /email/i.test(name)) {
        await inputs.nth(i).fill(CAND_EMAIL);
        break;
      }
    }
  });
  const postsBefore = results.network.filter(
    (n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && !/pool/.test(n.url),
  ).length;
  await dlgHost.getByTestId('hdsd-candidate-form-submit').click({ force: true });
  await sleep(4000);
  await shot(page, '01c-after-save');

  const createPosts = results.network
    .filter((n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && !/pool/.test(n.url))
    .slice(postsBefore);
  const okPost = createPosts.find((p) => p.status >= 200 && p.status < 300);
  const rowHost = await findInFrames(page, (h) =>
    h.locator('table tbody tr').filter({ hasText: STAMP }),
  );
  const row = rowHost.locator('table tbody tr').filter({ hasText: STAMP }).first();
  const rowVis = await row.isVisible().catch(() => false);
  let yctdCell = '';
  let posCell = '';
  if (rowVis) {
    yctdCell = (await row.getByTestId('hdsd-candidate-list-yctd').innerText().catch(() => '')).trim();
    posCell = (
      await row.getByTestId('hdsd-candidate-list-position').innerText().catch(() => '')
    ).trim();
  }
  const listOk = Boolean(okPost) && rowVis && cellFilled(yctdCell) && cellFilled(posCell);

  // F5
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(4500);
  await shot(page, '01d-f5');
  const rowHost2 = await findInFrames(page, (h) =>
    h.locator('table tbody tr').filter({ hasText: STAMP }),
  );
  const row2 = rowHost2.locator('table tbody tr').filter({ hasText: STAMP }).first();
  const row2Vis = await row2.isVisible().catch(() => false);
  let yctdF5 = '';
  let posF5 = '';
  if (row2Vis) {
    yctdF5 = (await row2.getByTestId('hdsd-candidate-list-yctd').innerText().catch(() => '')).trim();
    posF5 = (
      await row2.getByTestId('hdsd-candidate-list-position').innerText().catch(() => '')
    ).trim();
  }
  const f5Ok = row2Vis && cellFilled(yctdF5) && cellFilled(posF5);

  const pass = listOk && f5Ok;
  recordPack('P1_UV_CREATE_LIST_F5', pass ? 'PASS' : 'FAIL', {
    summary: `POST=${okPost?.status}/${okPost?.code} · row=${rowVis} yctd="${yctdCell}" pos="${posCell}" · F5 row=${row2Vis} yctd="${yctdF5}" pos="${posF5}" · formPos="${positionVal}"`,
    journey: 'J-HRM-REC-UV-01',
    create: okPost || null,
    listOk,
    f5Ok,
  });
  if (!pass) results.gaps.push('P1 UV create/list/F5 failed');
}

async function pack2_compare(page, portal) {
  log('PACK2_COMPARE_start');
  const url = q(portal, '/hr/recruitment', { tab: 'evaluations' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '02-evaluations');
  const body = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(body)) results.process_gates.mojibakeHits.push('evaluations');

  let host = await findInFrames(page, (h) => h.getByTestId('hdsd-rec-compare-open-btn'));
  let openBtn = host.getByTestId('hdsd-rec-compare-open-btn').first();
  let reachable = await openBtn.isVisible({ timeout: 4000 }).catch(() => false);
  if (!reachable) {
    host = await findInFrames(page, (h) => h.getByRole('button', { name: /So sánh/i }));
    openBtn = host.getByRole('button', { name: /So sánh/i }).first();
    reachable = await openBtn.isVisible({ timeout: 3000 }).catch(() => false);
  }
  if (!reachable) {
    recordPack('P2_COMPARE_YCTD', 'SKIP', {
      summary: 'So sánh menu/button not reachable — not FAIL module alone',
      journey: 'J-HRM-REC-CMP-01',
    });
    results.gaps.push('P2 compare UI not reachable (SKIP)');
    return;
  }
  await openBtn.click({ force: true });
  await sleep(2000);
  const dlgHost = await findInFrames(page, (h) => h.getByTestId('hdsd-rec-compare-dialog'));
  const dlgVis = await dlgHost.getByTestId('hdsd-rec-compare-dialog').isVisible().catch(() => false);
  await shot(page, '02b-compare-dialog');
  const dlgText = await dlgHost
    .getByTestId('hdsd-rec-compare-dialog')
    .innerText()
    .catch(() => '');
  if (hasMojibake(dlgText)) results.process_gates.mojibakeHits.push('compare_dialog');

  const picker = await selectFirstOption(dlgHost, 'hdsd-rec-compare-yctd-picker');
  await sleep(2000);
  await shot(page, '02c-compare-yctd');
  const uvRows = await dlgHost.getByTestId('hdsd-rec-compare-uv-row').count().catch(() => 0);
  const matrix = await dlgHost
    .getByTestId('hdsd-rec-compare-matrix')
    .isVisible()
    .catch(() => false);
  const compareNet = results.network.filter((n) => /\/compare/.test(n.url)).slice(-3);
  const jobPostingsAfter =
    results.network.filter(
      (n) =>
        /job.postings|job_postings|job-postings/i.test(n.url) &&
        n.at >= (results.pack.P2_COMPARE_YCTD?.at || '1970'),
    ).length === 0;

  // mark open time for SoT — use dialog open
  const pass =
    dlgVis &&
    Boolean(picker?.text || (await dlgHost.getByTestId('hdsd-rec-compare-yctd-empty').isVisible().catch(() => false))) &&
    (uvRows > 0 ? matrix || compareNet.some((n) => n.status === 200) : true);

  recordPack('P2_COMPARE_YCTD', pass ? 'PASS' : 'FAIL', {
    summary: `dialog=${dlgVis} picker=${picker?.text || 'empty-or-none'} uvRows=${uvRows} matrix=${matrix} compareNet=${JSON.stringify(compareNet)}`,
    journey: 'J-HRM-REC-CMP-01',
    job_postings_sot_obs: jobPostingsAfter,
  });
  if (!pass) results.gaps.push('P2 compare path FAIL');
}

async function pack3_jd_bind(page, portal) {
  log('PACK3_JD_BIND_start');
  const url = q(portal, '/hr/recruitment', { tab: 'requisitions' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '03-requisitions');
  const body = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(body)) results.process_gates.mojibakeHits.push('requisitions');

  const host = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-create-btn'));
  const createBtn = host.getByTestId('hdsd-requisition-create-btn').first();
  if (!(await createBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
    recordPack('P3_YCTD_JD_BIND', 'FAIL', { summary: 'requisition create btn missing' });
    results.gaps.push('P3 create YCTD button missing');
    return;
  }
  await createBtn.click({ force: true });
  await sleep(2500);
  const formHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-form-dialog'));
  await formHost.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 12000 }).catch(() => {});
  const formVis = await formHost.getByTestId('hdsd-requisition-form-dialog').isVisible().catch(() => false);
  await shot(page, '03b-yctd-form');

  const jdPick = await selectFirstOption(formHost, 'hdsd-requisition-job-template');
  if (!jdPick?.text) {
    const empty = await formHost
      .locator('text=/không có|chưa có|empty/i')
      .first()
      .isVisible()
      .catch(() => false);
    recordPack('P3_YCTD_JD_BIND', empty ? 'SKIP' : 'FAIL', {
      summary: `bindable JD picker empty under U65 · form=${formVis}`,
      journey: 'J-HRM-JD-YCTD-01',
    });
    if (!empty) results.gaps.push('P3 JD bindable picker fail');
    else results.gaps.push('P3 JD bindable empty (SKIP mutate)');
    // close dialog
    await page.keyboard.press('Escape').catch(() => {});
    return;
  }
  results.ids.selectedJd = jdPick;
  await formHost.getByTestId('hdsd-requisition-title').fill(REQ_TITLE).catch(() => {});
  await selectFirstOption(formHost, 'hdsd-requisition-department').catch(() => null);
  await formHost.getByTestId('hdsd-requisition-headcount').fill('1').catch(() => {});
  await selectFirstOption(formHost, 'hdsd-requisition-employment-type').catch(() => null);
  const postsBefore = results.network.filter(
    (n) => n.method === 'POST' && /\/requisitions(\?|$)/.test(n.url),
  ).length;
  await formHost.getByTestId('hdsd-requisition-form-submit').click({ force: true });
  await sleep(4000);
  await shot(page, '03c-after-yctd-save');
  const createPosts = results.network
    .filter((n) => n.method === 'POST' && /\/requisitions(\?|$)/.test(n.url))
    .slice(postsBefore);
  const okPost = createPosts.find((p) => p.status >= 200 && p.status < 300);
  const reqId = okPost?.requisitionId || results.ids.requisitionId;
  // F5 JD gắn
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(4000);
  await shot(page, '03d-f5');
  let jdRefVis = false;
  if (reqId) {
    const refHost = await findInFrames(page, (h) => h.locator(`[data-testid="yctd-jd-ref-${reqId}"]`));
    jdRefVis = await refHost
      .locator(`[data-testid="yctd-jd-ref-${reqId}"]`)
      .isVisible()
      .catch(() => false);
  }
  const body1 = await page.locator('body').innerText().catch(() => '');
  const titleOnList = body1.includes(STAMP) || body1.includes(REQ_TITLE);
  const pass = Boolean(okPost) && Boolean(okPost.job_template_id || jdRefVis || titleOnList);
  recordPack('P3_YCTD_JD_BIND', pass ? 'PASS' : 'FAIL', {
    summary: `POST=${okPost?.status} job_template_id=${okPost?.job_template_id || '—'} · jdRef=${jdRefVis} · titleOnList=${titleOnList} · jd="${jdPick.text}"`,
    journey: 'J-HRM-JD-YCTD-01',
    create: okPost || null,
  });
  if (!pass) results.gaps.push('P3 YCTD↔JD bind FAIL');
}

async function pack4_interview(page, portal) {
  log('PACK4_INTERVIEW_start');
  const url = q(portal, '/hr/recruitment', { tab: 'candidates' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);

  // Prefer Tuấn (prior UAT) else our stamp row else first row with calendar
  const host = await findInFrames(page, (h) => h.locator('table tbody tr').first());
  let row = host.locator('table tbody tr').filter({ hasText: /Tuấn/i }).first();
  let rowVis = await row.isVisible({ timeout: 2000 }).catch(() => false);
  let target = 'Tuấn';
  if (!rowVis) {
    row = host.locator('table tbody tr').filter({ hasText: STAMP }).first();
    rowVis = await row.isVisible({ timeout: 1500 }).catch(() => false);
    target = STAMP;
  }
  if (!rowVis) {
    row = host.locator('table tbody tr').first();
    rowVis = await row.isVisible({ timeout: 1500 }).catch(() => false);
    target = 'first-row';
  }
  if (!rowVis) {
    recordPack('P4_INTERVIEW_SCHEDULE', 'SKIP', {
      summary: 'no candidate row reachable for schedule under U65',
    });
    results.gaps.push('P4 interview SKIP — no candidate row');
    return;
  }

  // open schedule dialog
  const cal = row.locator('button').filter({ has: host.locator('.lucide-calendar-clock') }).first();
  let opened = false;
  if (await cal.isVisible({ timeout: 1500 }).catch(() => false)) {
    await cal.click({ force: true });
    opened = true;
  } else {
    const btns = row.locator('button');
    const n = await btns.count();
    for (let i = 0; i < Math.min(n, 6); i++) {
      await btns.nth(i).click({ force: true });
      await sleep(700);
      const dlg = await findInFrames(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
      if (await dlg.locator('[data-testid="schedule-interview-dialog"]').isVisible().catch(() => false)) {
        opened = true;
        break;
      }
    }
  }
  await sleep(1200);
  const dlgHost = await findInFrames(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
  const dlgVis = await dlgHost
    .locator('[data-testid="schedule-interview-dialog"]')
    .isVisible()
    .catch(() => false);
  await shot(page, '04-interview-dialog');
  if (!dlgVis) {
    recordPack('P4_INTERVIEW_SCHEDULE', opened ? 'FAIL' : 'SKIP', {
      summary: `schedule dialog not visible · target=${target}`,
    });
    results.gaps.push('P4 interview dialog not visible');
    return;
  }
  const dlgText = await dlgHost
    .locator('[data-testid="schedule-interview-dialog"]')
    .innerText()
    .catch(() => '');
  if (hasMojibake(dlgText)) results.process_gates.mojibakeHits.push('interview_dialog');
  const utfOk =
    /Lên lịch phỏng vấn|Ngày|Giờ|Thời lượng|Hình thức|Địa điểm/i.test(dlgText) &&
    !hasMojibake(dlgText);

  // Try submit once (may 201 or 409 active)
  const postsBefore = results.network.filter((n) => n.method === 'POST' && /\/interviews/.test(n.url))
    .length;
  await dlgHost
    .locator('[data-testid="schedule-interview-submit"]')
    .click({ force: true })
    .catch(() => {});
  await sleep(3000);
  await shot(page, '04b-after-schedule');
  const posts = results.network
    .filter((n) => n.method === 'POST' && /\/interviews/.test(n.url))
    .slice(postsBefore);
  const okOrConflict = posts.find(
    (p) =>
      (p.status >= 200 && p.status < 300) ||
      p.status === 409 ||
      /409|ACTIVE/i.test(String(p.code || '')),
  );
  const badgeHost = await findInFrames(page, (h) =>
    h.locator('[data-testid="candidate-active-interview-badge"]'),
  );
  const badgeVis = await badgeHost
    .locator('[data-testid="candidate-active-interview-badge"]')
    .first()
    .isVisible()
    .catch(() => false);

  const pass = utfOk && (Boolean(okOrConflict) || badgeVis);
  recordPack('P4_INTERVIEW_SCHEDULE', pass ? 'PASS' : 'FAIL', {
    summary: `target=${target} utfOk=${utfOk} posts=${JSON.stringify(posts.map((p) => ({ s: p.status, c: p.code })))} badge=${badgeVis}`,
    journey: 'REC-IV one-active',
  });
  if (!pass) results.gaps.push('P4 interview schedule FAIL');
}

async function pack5_plan_chrome(page, portal) {
  log('PACK5_PLAN_CHROME_start');
  // clear console buckets for plan-path-only counts (keep total but snapshot)
  const peBefore = results.process_gates.pageErrors.length;
  const ceBefore = results.process_gates.consoleErrors.length;
  const dndBefore = results.process_gates.dndStormHits.length;
  const uncBefore = results.process_gates.uncaughtHits.length;

  const url = q(portal, '/command-center/hrm/recruitment', { tab: 'plans' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '05-plans');
  const shell = await checkShell(page);

  // try click Kế hoạch tab
  const planTab = await findInFrames(page, (h) => h.getByRole('button', { name: /Kế hoạch|Plans/i }));
  await planTab
    .getByRole('button', { name: /Kế hoạch|Plans/i })
    .first()
    .click({ force: true })
    .catch(() => {});
  await sleep(2000);

  const body = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(body)) results.process_gates.mojibakeHits.push('plans');
  const host = await findInFrames(page, (h) => h.locator('table tbody tr').first());
  const row = host.locator('table tbody tr').first();
  const rowVis = await row.isVisible({ timeout: 3000 }).catch(() => false);
  let openedDetail = false;
  if (rowVis) {
    await row.click({ force: true });
    await sleep(2500);
    openedDetail = true;
  }
  await shot(page, '05b-plan-detail');

  // candidates chrome revisit
  await page.goto(q(portal, '/hr/recruitment', { tab: 'candidates' }), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(3500);
  await shot(page, '05c-candidates-chrome');
  const candBody = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(candBody)) results.process_gates.mojibakeHits.push('candidates_chrome');
  const createVis = await (
    await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-create-btn'))
  )
    .getByTestId('hdsd-candidate-create-btn')
    .isVisible()
    .catch(() => false);

  const planPathPageErrors = results.process_gates.pageErrors.length - peBefore;
  const planPathConsoleErrors = results.process_gates.consoleErrors.length - ceBefore;
  const planPathDnd = results.process_gates.dndStormHits.length - dndBefore;
  const planPathUnc = results.process_gates.uncaughtHits.length - uncBefore;

  const shellOk =
    shell.brandMarkCount <= 1 &&
    (shell.duplicateStrips?.length || 0) === 0;
  const chromeOk =
    planPathPageErrors === 0 &&
    planPathDnd === 0 &&
    planPathUnc === 0 &&
    createVis &&
    !hasMojibake(candBody);

  recordPack('P5_PLAN_CANDIDATES_CHROME', chromeOk && shellOk ? 'PASS' : chromeOk ? 'PASS_WITH_OBS' : 'FAIL', {
    summary: `plans row=${rowVis} detail=${openedDetail} · createBtn=${createVis} · shell brand=${shell.brandMarkCount} dup=${shell.duplicateStrips?.length || 0} · ΔpageErr=${planPathPageErrors} Δdnd=${planPathDnd} Δunc=${planPathUnc}`,
    shell,
    planPath: {
      pageErrors: planPathPageErrors,
      consoleErrors: planPathConsoleErrors,
      dnd: planPathDnd,
      uncaught: planPathUnc,
    },
  });
  if (!chromeOk) results.gaps.push('P5 plan/candidates chrome FAIL');
  if (!shellOk) results.gaps.push('P5 duplicate shell OBS/FAIL');
}

function evaluateProcessGates() {
  const dnd = results.process_gates.dndStormHits.length;
  const moji = results.process_gates.mojibakeHits.length;
  const unc = results.process_gates.uncaughtHits.length;
  const pe = results.process_gates.pageErrors.filter((e) =>
    /ReferenceError|TypeError|is not defined/i.test(e),
  ).length;
  const shell = results.process_gates.duplicateShell;
  const dupShell =
    shell && (shell.brandMarkCount > 1 || (shell.duplicateStrips?.length || 0) > 0);

  // FAIL immediately thresholds (sponsor process gate)
  const dndStorm = dnd >= 10;
  const fail =
    dndStorm || moji > 0 || unc > 0 || pe > 0 || dupShell === true;

  results.process_gates.verdict = fail ? 'FAIL' : 'PASS';
  results.process_gates.summary = {
    dndHits: dnd,
    dndStorm,
    mojibakeHits: moji,
    uncaughtHits: unc,
    referenceErrors: pe,
    duplicateShell: Boolean(dupShell),
  };
  if (dndStorm) results.gaps.push(`PROCESS: DnD storm hits=${dnd}`);
  if (moji > 0) results.gaps.push(`PROCESS: mojibake ${results.process_gates.mojibakeHits.join(',')}`);
  if (unc > 0 || pe > 0) results.gaps.push(`PROCESS: Uncaught/ReferenceError unc=${unc} pe=${pe}`);
  if (dupShell) results.gaps.push('PROCESS: duplicate shell header');
  return !fail;
}

function finalize() {
  const p1 = results.pack.P1_UV_CREATE_LIST_F5?.verdict;
  const p2 = results.pack.P2_COMPARE_YCTD?.verdict;
  const p3 = results.pack.P3_YCTD_JD_BIND?.verdict;
  const p4 = results.pack.P4_INTERVIEW_SCHEDULE?.verdict;
  const p5 = results.pack.P5_PLAN_CANDIDATES_CHROME?.verdict;
  const processOk = evaluateProcessGates();

  const coreSpineOk = p1 === 'PASS' && (p3 === 'PASS' || p3 === 'SKIP');
  const softOk = [p2, p4, p5].every((v) => v === 'PASS' || v === 'SKIP' || v === 'PASS_WITH_OBS');
  const hardFail =
    p1 === 'FAIL' ||
    p3 === 'FAIL' ||
    p2 === 'FAIL' ||
    p4 === 'FAIL' ||
    p5 === 'FAIL' ||
    !processOk;

  // Module UAT PASS only if core spine + process gates clean AND reachable packs PASS
  let overall;
  if (hardFail) {
    overall = 'FAIL_TO_PM';
  } else if (coreSpineOk && processOk && softOk && p2 !== 'SKIP' && p4 !== 'SKIP' && p3 !== 'SKIP') {
    // Full module green — still DENY recruitment_uat_ready until QC GO
    overall = 'PASS_TO_PM';
  } else if (coreSpineOk && processOk) {
    overall = 'PASS_WITH_OBS';
  } else {
    overall = 'FAIL_TO_PM';
  }

  results.overall = overall;
  results.ack_status = overall;
  results.honesty.recruitment_uat_ready = false; // always until QC GO
  results.module_uat_pass = overall === 'PASS_TO_PM';
  results.endedAt = ts();
  save();
  console.log('\n=== PO-UAT-REC-01 FINAL ===');
  console.log(JSON.stringify({ overall, pack: results.pack, process: results.process_gates.summary, gaps: results.gaps }, null, 2));
}

async function main() {
  const portal = await pickPortal();
  results.env.PORTAL = portal;
  async function probe(url) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      return r.status;
    } catch (e) {
      return String(e).slice(0, 80);
    }
  }
  results.l0 = {
    portal: portal ? await probe(portal) : 'missing',
    hrm: await probe(`${HRM}/api/hrm`),
    xbos: await probe(`${XBOS}/api/xbos`),
  };
  save();
  if (results.l0.portal !== 200 || results.l0.hrm !== 200) {
    results.overall = 'FAIL_TO_PM';
    results.ack_status = 'FAIL_TO_PM';
    results.gaps.push('L0 FAIL');
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }

  const session = await loginApi(portal);
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await pack1_uv(page, portal);
    await pack2_compare(page, portal);
    await pack3_jd_bind(page, portal);
    await pack4_interview(page, portal);
    await pack5_plan_chrome(page, portal);
  } catch (e) {
    results.residuals.push({ fatal: String(e).slice(0, 400) });
    results.gaps.push(`harness exception: ${String(e).slice(0, 200)}`);
    console.error(e);
  } finally {
    finalize();
    await browser.close().catch(() => {});
  }

  process.exit(results.overall === 'FAIL_TO_PM' ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  results.overall = 'FAIL_TO_PM';
  results.ack_status = 'FAIL_TO_PM';
  results.gaps.push(String(e).slice(0, 300));
  results.endedAt = ts();
  save();
  process.exit(2);
});
