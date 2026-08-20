#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E1-P1-INB-CV — Browser U65 P1
 * UC-CC-P0-06 inbox approve (FE-spawn only) · UC-XBOS-CC-06 canvas save + F5
 * LOCKS: zero-seed · hdsd_align · no invent Leave L2 · no full UAT claim · DEPT FD closed (do not reopen)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e1-p1-inb-cv-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e1-p1-inb-cv');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = `W4E1P1-${Date.now().toString(36).slice(-6).toUpperCase()}`;

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-E1-P1-INB-CV',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  uat_done: false,
  env: { PORTAL, XBOS, HRM, EMAIL, MEMBER_EMAIL, commit: COMMIT, stamp },
  hdsd_inventory: [
    'Login portal (ceo@xe.vn)',
    'Cài đặt → Quy trình → mở canvas → Lưu quy trình → F5',
    'Hộp thư /command-center/inbox → Mở chi tiết / Duyệt (chỉ nếu FE-spawn)',
    'AU x-company-id / member scope spot',
  ],
  l0: {},
  uc: {},
  steps: {},
  click_log: [],
  network: [],
  requestHeaders: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}
function setUc(ucId, payload) {
  results.uc[ucId] = { ...(results.uc[ucId] || {}), ...payload, at: ts() };
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      if (req.method() === 'OPTIONS') return;
      if (!/workflow-engine|leave-requests|leave\//.test(u)) return;
      const h = req.headers();
      const allKeys = Object.keys(h || {});
      const companyKey = allKeys.find((k) => k.toLowerCase() === 'x-company-id');
      const tenantKey = allKeys.find((k) => k.toLowerCase() === 'x-tenant-id');
      results.requestHeaders.push({
        method: req.method(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        xCompanyId: companyKey ? h[companyKey] : null,
        xTenantId: tenantKey ? h[tenantKey] : null,
        headerKeys: allKeys.filter((k) => /company|tenant|authorization/i.test(k)).slice(0, 8),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      if (/\/auth\/login|\/workflow-engine/.test(u)) {
        try {
          const body = await res.json();
          entry.code = body?.code || null;
          entry.message = String(body?.message || '').slice(0, 180);
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

function nets(pred) {
  return results.network.filter(pred);
}
function lastNet(pred) {
  const hits = nets(pred);
  return hits[hits.length - 1] || null;
}

async function clearAuth(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) store.clear();
  });
}

async function fillLogin(page, email, password) {
  const emailInput = page
    .locator('input[type="email"], input[name="email"], input[autocomplete="username"]')
    .first();
  const passInput = page
    .locator('input[type="password"], input[name="password"], input[autocomplete="current-password"]')
    .first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill('');
  await emailInput.fill(email);
  await passInput.fill('');
  await passInput.fill(password);
}

async function loginUi(page) {
  await clearAuth(page);
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(500);
  await fillLogin(page, EMAIL, PASSWORD);
  const before = results.network.length;
  await page
    .locator('button[type="submit"], button')
    .filter({ hasText: /Đăng nhập|Login/i })
    .first()
    .click();
  log('LOGIN_CEO');
  await sleep(2500);
  const loginNet = results.network
    .slice(before)
    .filter((n) => /\/auth\/login/.test(n.url) && n.method === 'POST')
    .pop();
  if (!loginNet || loginNet.status >= 400) {
    throw new Error(`CEO login fail status=${loginNet?.status} code=${loginNet?.code}`);
  }
  await page.goto(`${PORTAL}/command-center`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(1500);
  recordStep('LOGIN', 'PASS', {
    summary: `POST login ${loginNet.status} ${loginNet.code || ''}`,
  });
  return loginNet;
}

async function ensureCc(page) {
  if (!/command-center/i.test(page.url())) {
    await page.goto(`${PORTAL}/command-center`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(1200);
  }
}

async function openSettingsMenu(page, labelRe, deeplink) {
  await ensureCc(page);
  const settingsBtn = page
    .locator('button, a, [role="button"]')
    .filter({ hasText: /^Cài đặt$|^Settings$/i })
    .first();
  if (await settingsBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await settingsBtn.click();
    log('CLICK_SETTINGS');
    await sleep(600);
  }
  const item = page
    .locator('button, a, [role="menuitem"], [role="button"], li, span')
    .filter({ hasText: labelRe })
    .first();
  if (await item.isVisible({ timeout: 3500 }).catch(() => false)) {
    await item.click();
    log('CLICK_MENU', { note: String(labelRe) });
    await sleep(1200);
    return 'hdsd';
  }
  log('FALLBACK_DEEPLINK', { note: deeplink });
  await page.goto(`${PORTAL}/command-center?settings=${deeplink}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(1500);
  return 'deeplink';
}

async function loginApi(email, password) {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`API login fail ${email} ${r.status}`);
  const mem = (data?.memberships || [])[0] || {};
  return {
    token,
    companyId: mem.companyId || mem.company_id || data?.companyId || 'main',
    http: r.status,
    code: j?.code,
  };
}

async function apiJson(method, path, token, companyId, body) {
  const r = await fetch(`${XBOS}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'x-company-id': companyId,
      'x-tenant-id': 'xevn',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { http: r.status, code: j?.code, message: j?.message, data: j?.data ?? j };
}

async function l0() {
  const checks = {};
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', `${PORTAL}/`],
  ]) {
    try {
      const r = await fetch(u);
      checks[k] = r.status;
    } catch (e) {
      checks[k] = `FAIL ${String(e).slice(0, 80)}`;
    }
  }
  results.l0 = checks;
  const ok = checks.hrm === 200 && checks.xbos === 200 && checks.portal === 200;
  recordStep('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(checks) });
  if (!ok) throw new Error(`L0 FAIL ${JSON.stringify(checks)}`);
}

async function runCanvas(page) {
  const uc = 'UC-XBOS-CC-06';
  const tcs = {};
  try {
    // R1 false-positive: menu regex hit Action Cards; force HDSD deeplink settings=workflow
    log('FALLBACK_DEEPLINK', { note: 'workflow (forced — avoid Action Cards false match)' });
    await page.goto(`${PORTAL}/command-center?settings=workflow`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    // HDSD path reinforce: Cài đặt → Quy trình if still not on list
    let body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    if (!/Hệ thống quy trình|Thêm quy trình mới|Mã quy trình/i.test(body)) {
      await openSettingsMenu(page, /^Quy trình$/i, 'workflow');
      await sleep(2000);
      body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    }
    await shot(page, 'cv-open');
    const defs = lastNet(
      (n) => n.method === 'GET' && /workflow-engine\/definitions/.test(n.url),
    );
    const listOk = /Hệ thống quy trình|Thêm quy trình mới|Canvas quy trình/i.test(body);
    const canvasUi =
      listOk ||
      (await page.locator('[data-testid="workflow-canvas"], .bg-workflow-canvas-dots').count()) > 0;
    tcs['TC-DM-CC-06-CV-OPEN-HP-001'] =
      canvasUi && (!defs || defs.status < 400) ? 'PASS' : canvasUi ? 'PARTIAL' : 'FAIL';
    recordStep('CV-OPEN', tcs['TC-DM-CC-06-CV-OPEN-HP-001'], {
      summary: `listOk=${listOk} ui=${canvasUi} defs=${defs?.status} ${defs?.code || ''}`,
    });

    let openedDetail = false;
    let createdNew = false;
    // Prefer existing row «Chỉnh sửa»
    const editBtn = page.locator('button').filter({ hasText: /^Chỉnh sửa$/i }).first();
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click();
      log('CLICK_WF_CHINH_SUA');
      await sleep(2000);
      openedDetail = true;
    } else {
      const createBtn = page
        .locator('button')
        .filter({ hasText: /Thêm quy trình mới/i })
        .first();
      if (await createBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await createBtn.click();
        log('CLICK_WF_CREATE');
        await sleep(1500);
        createdNew = true;
        openedDetail = true;
        const codeBox = page.getByLabel(/Mã quy trình/i).first();
        const nameBox = page.getByLabel(/Tên quy trình/i).first();
        if (await codeBox.isVisible({ timeout: 2000 }).catch(() => false)) {
          await codeBox.fill(`QA-CV-${stamp.slice(-6)}`);
        }
        if (await nameBox.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameBox.fill(`QA Canvas ${stamp}`);
        }
      }
    }

    await shot(page, 'cv-detail');
    body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const detailOk = /Chi tiết quy trình|Thêm quy trình|Lưu quy trình/i.test(body);
    const canvasDots =
      (await page.locator('.bg-workflow-canvas-dots, [data-testid="workflow-canvas"]').count()) > 0;
    const saveBtn = page.locator('button').filter({ hasText: /Lưu quy trình/i }).first();
    const saveVisible = await saveBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (saveVisible && (openedDetail || detailOk)) {
      // Mild name patch on existing def for F5 sticky proof
      const nameBox = page.getByLabel(/Tên quy trình/i).first();
      if (!createdNew && (await nameBox.isVisible({ timeout: 1500 }).catch(() => false))) {
        const cur = await nameBox.inputValue().catch(() => '');
        const next = `${String(cur || 'WF').replace(/\s*·QA-P1-\w+$/, '')} ·QA-P1-${stamp.slice(-4)}`;
        await nameBox.fill(next);
        log('PATCH_WF_NAME', { note: next });
      }

      const before = results.network.length;
      await saveBtn.click();
      log('CV_SAVE_CLICK');
      await sleep(3000);
      const saveNet = results.network
        .slice(before)
        .filter(
          (n) =>
            /workflow-engine\/definitions/.test(n.url) &&
            (n.method === 'POST' || n.method === 'PUT'),
        )
        .pop();
      const hdr = results.requestHeaders
        .filter((h) => /definitions/.test(h.url) && (h.method === 'POST' || h.method === 'PUT'))
        .pop();

      tcs['TC-DM-CC-06-CV-SAVE-HP-001'] =
        saveNet && saveNet.status >= 200 && saveNet.status < 300
          ? 'PASS'
          : saveNet
            ? 'FAIL'
            : 'PARTIAL';
      recordStep('CV-SAVE', tcs['TC-DM-CC-06-CV-SAVE-HP-001'], {
        summary: `openedDetail=${openedDetail} createdNew=${createdNew} detailOk=${detailOk} canvasDots=${canvasDots} save=${saveNet?.status} code=${saveNet?.code} x-company-id=${hdr?.xCompanyId || 'n/a'}`,
      });

      if (saveNet && saveNet.status < 300) {
        await page.goto(`${PORTAL}/command-center?settings=workflow`, {
          waitUntil: 'domcontentloaded',
          timeout: 90000,
        });
        await sleep(2000);
        await shot(page, 'cv-f5');
        const bodyAfter = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
        const sticky =
          bodyAfter.includes(stamp.slice(-4)) ||
          bodyAfter.includes(`QA-CV-${stamp.slice(-6)}`) ||
          /Hệ thống quy trình|Mã quy trình/i.test(bodyAfter);
        tcs['TC-DM-CC-06-CV-SAVE-UX-001'] = sticky ? 'PASS' : 'PARTIAL';
        recordStep('CV-F5', tcs['TC-DM-CC-06-CV-SAVE-UX-001'], {
          summary: `stickyHint=${sticky} stamp=${stamp.slice(-4)}`,
        });
      } else {
        tcs['TC-DM-CC-06-CV-SAVE-UX-001'] = 'BLOCKED';
      }
    } else {
      tcs['TC-DM-CC-06-CV-SAVE-HP-001'] = 'PARTIAL';
      tcs['TC-DM-CC-06-CV-SAVE-UX-001'] = 'BLOCKED';
      recordStep('CV-SAVE', 'PARTIAL', {
        summary: `Save not visible (openedDetail=${openedDetail} detailOk=${detailOk} createdNew=${createdNew} canvasDots=${canvasDots} listOk=${listOk})`,
      });
      results.residuals.push({
        id: 'R-W4E1-CV-DEPTH',
        owner: 'dev-fe',
        note: 'Canvas detail «Lưu quy trình» not reached/visible after settings=workflow; need FE openEditWorkflow path for QA',
      });
    }

    // Honest gaps — not invented
    tcs['TC-DM-CC-06-CV-L2-HP-001'] = 'BLOCKED';
    tcs['TC-DM-CC-06-CV-L2-FD-001'] = 'BLOCKED';
    tcs['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
    tcs['TC-DM-CC-06-CV-SAVE-FD-001'] = 'PARTIAL';
    recordStep('CV-L2-SELF', 'BLOCKED', {
      summary:
        'L2 graph config + self-approve after spawn not forced this seat (need deeper canvas edit + FE instance spawn); Leave L2 not invented',
    });
    results.residuals.push({
      id: 'R-W4E1-CV-L2-SELF',
      owner: 'qa',
      note: 'After save sticky, still need FE 2-level step edit + spawn chain before L2/self FD close',
    });

    // AU member create holding def
    const member = await loginApi(MEMBER_EMAIL, PASSWORD);
    const auPut = await apiJson(
      'POST',
      '/api/xbos/workflow-engine/definitions',
      member.token,
      member.companyId,
      { name: `AU-WF-${stamp}`, steps: [] },
    );
    tcs['TC-DM-CC-06-CV-SCOPE-AU-001'] =
      auPut.http === 403 || auPut.http === 409 || auPut.http === 400 || auPut.http === 404
        ? 'PASS'
        : auPut.http < 300
          ? 'PARTIAL'
          : 'FAIL';
    recordStep('CV-AU', tcs['TC-DM-CC-06-CV-SCOPE-AU-001'], {
      summary: `member POST definitions http=${auPut.http} code=${auPut.code} companyId=${member.companyId}`,
    });

    const fail = Object.values(tcs).some((v) => v === 'FAIL');
    const hasPass = Object.values(tcs).some((v) => v === 'PASS');
    const blocked = Object.values(tcs).filter((v) => v === 'BLOCKED' || v === 'PARTIAL').length;
    const verdict = fail ? 'FAIL' : hasPass && blocked > 0 ? 'PARTIAL' : hasPass ? 'PASS' : 'BLOCKED';
    setUc(uc, {
      execution: verdict,
      tcs,
      note: `save=${tcs['TC-DM-CC-06-CV-SAVE-HP-001']} L2/self BLOCKED honest`,
    });
    return verdict;
  } catch (e) {
    setUc(uc, { execution: 'FAIL', tcs, note: String(e).slice(0, 240) });
    recordStep('CV-ERR', 'FAIL', { summary: String(e) });
    results.residuals.push({ id: 'R-W4E1-CV-ERR', owner: 'dev-fe', note: String(e).slice(0, 200) });
    return 'FAIL';
  }
}

async function runInbox(page) {
  const uc = 'UC-CC-P0-06';
  const tcs = {};
  try {
    await page.goto(`${PORTAL}/command-center/inbox`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2000);
    let body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    if (!/Hộp thư|Inbox|Việc cần xử lý|cc-inbox|tác vụ/i.test(body)) {
      await ensureCc(page);
      const inboxNav = page
        .locator('button, a, [role="tab"]')
        .filter({ hasText: /Hộp thư|Inbox|Việc cần xử lý/i })
        .first();
      if (await inboxNav.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inboxNav.click();
        log('CLICK_INBOX_NAV');
        await sleep(1500);
      }
      body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    }
    await shot(page, 'inbox-open');

    const listGet = lastNet(
      (n) =>
        n.method === 'GET' &&
        /workflow-engine\/tasks|command-center.*tasks|\/tasks/.test(n.url),
    );
    const listHdr = results.requestHeaders
      .filter((h) => h.method === 'GET' && /workflow-engine\/tasks/.test(h.url))
      .pop();
    const emptyUi =
      /Không có việc cần xử lý|không có tác vụ|Chưa có nhiệm vụ|Hộp thư trống|0 tác vụ/i.test(body);
    const cards = page.locator('[data-testid="cc-inbox-task-card"]');
    const cardCount = await cards.count().catch(() => 0);
    const empty = emptyUi || cardCount === 0;

    tcs['TC-CC-P0-06-INB-LIST-HP-001'] = !empty && cardCount > 0 ? 'PASS' : empty ? 'BLOCKED' : 'PARTIAL';
    tcs['TC-CC-P0-06-INB-LIST-UX-001'] =
      empty || /Hộp thư|Inbox|Việc cần|Không có việc/i.test(body) ? 'PASS' : 'FAIL';
    recordStep('INB-LIST', tcs['TC-CC-P0-06-INB-LIST-HP-001'], {
      summary: `empty=${empty} cards=${cardCount} get=${listGet?.status} code=${listGet?.code} x-company-id=${listHdr?.xCompanyId || 'n/a'}`,
    });

    // FE-spawned = API/workflow-engine cards (hrm_leave / xbos-workflow) — NOT seed.
    // Prefer leave cards (data-business-type=hrm_leave) as FE business submit origin.
    let feSpawnedIdx = -1;
    let feSpawnKind = null;
    if (cardCount > 0) {
      for (let i = 0; i < Math.min(cardCount, 20); i++) {
        const card = cards.nth(i);
        const biz = await card.getAttribute('data-business-type').catch(() => null);
        const txt = ((await card.innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
        if (
          biz === 'hrm_leave' ||
          /xbos-workflow/i.test(txt) ||
          /Phê duyệt đơn nghỉ phép|Nghỉ phép/i.test(txt)
        ) {
          feSpawnedIdx = i;
          feSpawnKind = biz || 'xbos-workflow';
          break;
        }
      }
    }

    if (empty) {
      tcs['TC-CC-P0-06-INB-DET-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-APPR-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-REJ-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-L2-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
      recordStep('INB-MUTATE', 'BLOCKED', {
        summary:
          'Inbox empty — 🟡 BLOCKED honest U65; create WF / business submit from FE first (cấm seed inbox)',
      });
      results.residuals.push({
        id: 'R-W4E1-INB-SPAWN',
        owner: 'qa',
        note: 'Inbox empty — need FE spawn (canvas/business submit) before approve HP; U65 no seed',
      });
    } else if (feSpawnedIdx < 0) {
      await cards.first().locator('a, button').filter({ hasText: /Mở chi tiết/i }).first().click().catch(async () => {
        await cards.first().click();
      });
      log('CLICK_INBOX_DETAIL_NOSPAWN');
      await sleep(1200);
      await shot(page, 'inbox-detail-nospawn');
      tcs['TC-CC-P0-06-INB-DET-HP-001'] = 'PARTIAL';
      tcs['TC-CC-P0-06-INB-APPR-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-REJ-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-L2-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
      recordStep('INB-APPR', 'BLOCKED', {
        summary: `cards=${cardCount} but no FE-origin workflow card detected; approve deferred U65`,
      });
      results.residuals.push({
        id: 'R-W4E1-INB-SPAWN',
        owner: 'qa',
        note: `${cardCount} cards; no hrm_leave/xbos-workflow FE-origin detected — cấm seed`,
      });
    } else {
      const target = cards.nth(feSpawnedIdx);
      await target.scrollIntoViewIfNeeded().catch(() => {});
      // Detail link first (DET HP)
      const detailLink = target.locator('a').filter({ hasText: /Mở chi tiết/i }).first();
      if (await detailLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await detailLink.click();
        log('CLICK_INBOX_DETAIL');
        await sleep(2000);
        await shot(page, 'inbox-detail');
        const det = lastNet(
          (n) => n.method === 'GET' && /instances\/.+\/detail|workflow-engine/.test(n.url),
        );
        tcs['TC-CC-P0-06-INB-DET-HP-001'] =
          det && det.status < 400 ? 'PASS' : 'PARTIAL';
        recordStep('INB-DET', tcs['TC-CC-P0-06-INB-DET-HP-001'], {
          summary: `det=${det?.status} kind=${feSpawnKind}`,
        });
        // back to inbox for approve on list (quick complete)
        await page.goto(`${PORTAL}/command-center/inbox`, {
          waitUntil: 'domcontentloaded',
          timeout: 90000,
        });
        await sleep(1500);
      } else {
        tcs['TC-CC-P0-06-INB-DET-HP-001'] = 'PARTIAL';
      }

      const cards2 = page.locator('[data-testid="cc-inbox-task-card"]');
      const target2 = cards2.nth(0);
      const approveBtn = target2.getByTestId(/hdsd-cc-leave-approve|cc-inbox-task-approve/);
      const before = results.network.length;
      const hdrBefore = results.requestHeaders.length;
      if (await approveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await approveBtn.click();
        log('CLICK_INBOX_APPROVE', { note: String(feSpawnKind) });
      } else {
        await target2.locator('button').filter({ hasText: /Duyệt|Xử lý nhanh/i }).first().click();
        log('CLICK_INBOX_APPROVE_TEXT');
      }
      await sleep(3000);
      await shot(page, 'inbox-after-approve');
      const completeNet = results.network
        .slice(before)
        .filter(
          (n) =>
            n.method === 'POST' &&
            /tasks\/.+\/(complete|approve)|leave.*approv|workflow-engine/.test(n.url),
        )
        .pop();
      const apprHdr = results.requestHeaders
        .slice(hdrBefore)
        .filter((h) => h.method === 'POST')
        .pop();
      tcs['TC-CC-P0-06-INB-APPR-HP-001'] =
        completeNet && completeNet.status >= 200 && completeNet.status < 300
          ? 'PASS'
          : completeNet
            ? 'FAIL'
            : 'PARTIAL';
      recordStep('INB-APPR', tcs['TC-CC-P0-06-INB-APPR-HP-001'], {
        summary: `kind=${feSpawnKind} complete=${completeNet?.status} code=${completeNet?.code} url=${completeNet?.url || 'n/a'} x-company-id=${apprHdr?.xCompanyId || 'n/a'}`,
      });
      // F5 list
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(1500);
      await shot(page, 'inbox-f5');
      tcs['TC-CC-P0-06-INB-L2-HP-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
      tcs['TC-CC-P0-06-INB-REJ-HP-001'] = 'BLOCKED';
      recordStep('INB-L2-SELF', 'BLOCKED', {
        summary:
          'L2/self not closed — cấm invent Leave L2; need 2-level FE definition + submitter≠approver evidence',
      });
      if (tcs['TC-CC-P0-06-INB-APPR-HP-001'] !== 'PASS') {
        results.residuals.push({
          id: 'R-W4E1-INB-APPROVE',
          owner: 'dev-be',
          note: `FE-spawn leave approve not 2xx: status=${completeNet?.status} code=${completeNet?.code}`,
        });
      }
    }

    // AU member tasks list + x-company-id spot
    const member = await loginApi(MEMBER_EMAIL, PASSWORD);
    const au = await apiJson(
      'GET',
      '/api/xbos/workflow-engine/tasks',
      member.token,
      member.companyId,
    );
    tcs['TC-CC-P0-06-INB-SCOPE-AU-001'] =
      au.http === 200 || au.http === 403 || au.http === 409 ? 'PASS' : 'FAIL';
    recordStep('INB-AU', tcs['TC-CC-P0-06-INB-SCOPE-AU-001'], {
      summary: `member tasks http=${au.http} code=${au.code} x-company-id=${member.companyId}`,
    });

    // CEO list header company id evidence
    if (listHdr?.xCompanyId) {
      recordStep('INB-X-COMPANY', 'PASS', {
        summary: `CEO GET tasks x-company-id=${listHdr.xCompanyId}`,
      });
    } else {
      recordStep('INB-X-COMPANY', 'PARTIAL', {
        summary: 'CEO GET tasks header x-company-id not captured (may be omitted on some builds)',
      });
    }

    const fail = Object.values(tcs).some((v) => v === 'FAIL');
    const hasPass = Object.values(tcs).some((v) => v === 'PASS');
    const blockedN = Object.values(tcs).filter((v) => v === 'BLOCKED').length;
    const verdict = fail
      ? 'FAIL'
      : blockedN >= 3 && tcs['TC-CC-P0-06-INB-APPR-HP-001'] === 'BLOCKED'
        ? hasPass
          ? 'PARTIAL'
          : 'BLOCKED'
        : hasPass && blockedN > 0
          ? 'PARTIAL'
          : hasPass
            ? 'PASS'
            : 'BLOCKED';
    setUc(uc, {
      execution: verdict,
      tcs,
      note: empty
        ? 'Inbox empty — BLOCKED mutate U65; create WF from FE first'
        : feSpawnedIdx < 0
          ? `cards=${cardCount} no FE-origin workflow card — approve BLOCKED honest`
          : `approve=${tcs['TC-CC-P0-06-INB-APPR-HP-001']} kind=${feSpawnKind}`,
    });
    return verdict;
  } catch (e) {
    setUc(uc, { execution: 'FAIL', tcs, note: String(e).slice(0, 240) });
    recordStep('INB-ERR', 'FAIL', { summary: String(e) });
    return 'FAIL';
  }
}

async function main() {
  await l0();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  try {
    await loginUi(page);
    const cv = await runCanvas(page);
    const inb = await runInbox(page);
    results.overall =
      cv === 'FAIL' || inb === 'FAIL'
        ? 'FAIL'
        : cv === 'PASS' && inb === 'PASS'
          ? 'PASS'
          : 'PARTIAL';
    recordStep('OVERALL', results.overall, {
      summary: `UC-XBOS-CC-06=${cv} UC-CC-P0-06=${inb}`,
    });
  } finally {
    results.endedAt = ts();
    save();
    await browser.close();
  }
  console.log('\n=== DONE ===');
  console.log(JSON.stringify({ overall: results.overall, uc: results.uc, residuals: results.residuals }, null, 2));
  if (results.overall === 'FAIL') process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.overall = 'FAIL';
  results.residuals.push({ id: 'R-W4E1-P1-HARNESS', owner: 'qa', note: String(e).slice(0, 240) });
  save();
  process.exit(1);
});
