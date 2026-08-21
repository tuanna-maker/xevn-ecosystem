#!/usr/bin/env node
/**
 * PO-UAT-REC-JD-DND-QA-01 — U65 browser certify JD writer DnD after FE-01
 * UF-JD-DND-01: Thư viện JD → Thêm JD → chức danh → drag canvas and/or palette→canvas
 * Console: Unable to find drag handle = 0 · Unable to find any drag handles = 0
 * Uncaught/ReferenceError = 0 · UTF-8 VI labels OK
 * Cấm: seed · invent recruitment_uat_ready · invent jd_dynamic_done · claim Phase1
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
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

let BASE = PORTAL;
let PORTAL_MODE = true;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  process.env.QA_OUT_JSON || 'docs/qa/evidence/_tmp-po-uat-rec-jd-dnd-qa-01.FINAL.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-rec-jd-dnd-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

/** True UTF-8→Latin-1 mojibake only — NOT legitimate VI diacritics (Â in NHÂN, Ê, Ô…). */
function hasMojibake(text) {
  if (!text) return false;
  return /Ã[¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À-ÿ]|Ä‘|Ä|á»[a-zA-Z0-9]|áº[a-zA-Z0-9]|â€[™œ]|ï¿½|Æ°á|NhÃ¢n|sá»±/.test(
    text,
  );
}

const STAMP = `JDDND-${Date.now().toString(36).toUpperCase().slice(-6)}`;

const results = {
  work_item_id: 'PO-UAT-REC-JD-DND-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  u65: 'zero-seed · browser-only · hard-refresh via cache-bust · no Lưu mutate',
  parent: 'PO-UAT-REC-JD-DND-FE-01 READY_FOR_QA',
  hdsd_align: true,
  inventory: [
    'Tuyển dụng → Thư viện JD → Thêm JD → pick chức danh → wait jd-writer-dnd-surface → drag canvas/palette → Hủy',
  ],
  journeys: ['UF-JD-DND-01'],
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
  network: [],
  mutates: [],
  consoleAll: [],
  consoleErrors: [],
  pageErrors: [],
  consoleClassCounts: {
    unable_find_drag_handle: 0,
    unable_find_any_drag_handles: 0,
    uncaught_reference: 0,
    uncaught_typeerror: 0,
  },
  process_gates: {},
  steps: {},
  checks: {},
  failReasons: [],
  screens: [],
  residuals: [],
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    phase1_done_claimed: false,
    product_go_claimed: false,
  },
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2), 'utf8');
}

function step(id, status, note) {
  results.steps[id] = { status, note, at: ts() };
  save();
}

function check(id, pass, note) {
  results.checks[id] = { pass: !!pass, note: String(note || ''), at: ts() };
  if (!pass) results.failReasons.push(`${id}: ${note}`);
  save();
}

function classifyConsole(text) {
  const t = String(text || '');
  results.consoleAll.push(t.slice(0, 280));
  if (/Unable to find any drag handles/i.test(t)) {
    results.consoleClassCounts.unable_find_any_drag_handles += 1;
  } else if (/Unable to find drag handle/i.test(t)) {
    results.consoleClassCounts.unable_find_drag_handle += 1;
  }
  if (/Uncaught.*ReferenceError|ReferenceError:/i.test(t)) {
    results.consoleClassCounts.uncaught_reference += 1;
  }
  if (/Uncaught.*TypeError|TypeError:/i.test(t)) {
    results.consoleClassCounts.uncaught_typeerror += 1;
  }
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal5173', PORTAL],
    ['hrm_fe', `${HRM_FE}/hr/`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  if (results.l0.portal5173 === 200) {
    BASE = PORTAL;
    PORTAL_MODE = true;
  } else if (results.l0.hrm_fe === 200) {
    BASE = HRM_FE;
    PORTAL_MODE = false;
    results.l0.portal_fallback = 'hrm_fe_8080';
  }
  results.env.BASE = BASE;
  results.env.PORTAL_MODE = PORTAL_MODE;
  save();
}

async function loginApi() {
  const urls = [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
  let lastErr = 'login failed';
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (!token) {
        lastErr = `login HTTP ${r.status} via ${url}`;
        continue;
      }
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        email: EMAIL,
        companyId: COMPANY,
        http: r.status,
        loginVia: url,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || u.name || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    } catch (e) {
      lastErr = String(e?.message || e).slice(0, 120);
    }
  }
  throw new Error(lastErr);
}

function q(path, tab) {
  const u = new URL(path, BASE);
  if (PORTAL_MODE && path.startsWith('/hr')) u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (tab) u.searchParams.set('tab', tab);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    ({ s, portalMode }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        if (portalMode) store.setItem('hrm_portal_mode', '1');
        else store.removeItem('hrm_portal_mode');
      }
    },
    { s: session, portalMode: PORTAL_MODE },
  );
}

async function shot(page, name) {
  try {
    mkdirSync(SCREEN, { recursive: true });
    const path = join(SCREEN, `${name}.png`);
    await page.screenshot({ path, fullPage: false, timeout: 15_000 });
    results.screens.push(`evidence/screens/po-uat-rec-jd-dnd-qa-01/${name}.png`);
  } catch (e) {
    results.screens.push(`SHOT_FAIL:${name}:${String(e?.message || e).slice(0, 80)}`);
  }
  save();
}

async function clearOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => null);
    await sleep(180);
  }
}

function trackPage(page) {
  page.on('console', (msg) => {
    const text = msg.text();
    classifyConsole(text);
    if (msg.type() === 'error') {
      results.consoleErrors.push(text.slice(0, 240));
    }
  });
  page.on('pageerror', (err) => {
    const text = String(err?.message || err);
    results.pageErrors.push(text.slice(0, 240));
    classifyConsole(text);
  });
  page.on('response', (res) => {
    const req = res.request();
    const m = req.method();
    const url = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(url)) return;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) {
      const entry = { method: m, status: res.status(), url: url.slice(0, 220), at: ts() };
      results.network.push(entry);
      results.mutates.push(entry);
      save();
    }
  });
}

function recountDragHandlesFromAll() {
  let singular = 0;
  let plural = 0;
  for (const t of results.consoleAll) {
    if (/Unable to find any drag handles/i.test(t)) plural += 1;
    else if (/Unable to find drag handle/i.test(t)) singular += 1;
  }
  results.consoleClassCounts.unable_find_drag_handle = singular;
  results.consoleClassCounts.unable_find_any_drag_handles = plural;
}

async function openPositionPicker(page) {
  const trigger = page
    .locator('[data-testid="hdsd-jd-form-position"], [data-testid="jd-form-position"]')
    .first();
  let el = trigger;
  if (!(await el.isVisible().catch(() => false))) {
    el = page.getByRole('combobox').first();
  }
  if (!(await el.isVisible().catch(() => false))) {
    el = page.getByText(/Chọn chức danh/i).first();
  }
  await el.click({ force: true }).catch(() => null);
  await sleep(700);
  return page.locator('[role="option"]');
}

async function pickFirstPosition(page) {
  const prefer = /IT|TECH|Software|Dev|Phần mềm|Công nghệ|Lập trình|CEO|Giám đốc/i;
  const options = await openPositionPicker(page);
  const n = await options.count().catch(() => 0);
  let picked = null;
  for (let i = 0; i < Math.min(n, 60); i++) {
    const t = ((await options.nth(i).textContent()) || '').trim();
    if (prefer.test(t)) {
      await options.nth(i).click();
      picked = t;
      break;
    }
  }
  if (!picked) {
    for (let i = 0; i < Math.min(n, 60); i++) {
      const t = ((await options.nth(i).textContent()) || '').trim();
      if (t) {
        await options.nth(i).click();
        picked = t;
        break;
      }
    }
  }
  await sleep(1800);
  return { count: n, picked };
}

async function dragElement(page, fromEl, toEl) {
  const from = await fromEl.boundingBox().catch(() => null);
  const to = await toEl.boundingBox().catch(() => null);
  if (!from || !to) return { ok: false, reason: 'missing boundingBox' };
  const fx = from.x + from.width / 2;
  const fy = from.y + Math.min(12, from.height / 2);
  const tx = to.x + to.width / 2;
  const ty = to.y + 40;
  await page.mouse.move(fx, fy);
  await page.mouse.down();
  await page.mouse.move(tx, ty, { steps: 18 });
  await page.mouse.up();
  await sleep(900);
  return { ok: true, from: { fx, fy }, to: { tx, ty } };
}

async function waitDndSurface(page, timeoutMs = 12_000) {
  const surface = page.getByTestId('jd-writer-dnd-surface');
  const pending = page.getByTestId('jd-writer-dnd-pending');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await surface.isVisible().catch(() => false)) {
      return { ready: true, pending: false };
    }
    await sleep(250);
  }
  const pendingVis = await pending.isVisible().catch(() => false);
  return { ready: false, pending: pendingVis };
}

async function runJdDnd(page) {
  step('UF-JD-DND-01', 'RUNNING', 'JD writer DnD certify');

  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', 'jd-library'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2800);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await clearOverlays(page);
  await shot(page, '01-jd-library');

  const addByTid = page.getByTestId('hdsd-jd-library-add-btn');
  const addByRole = page.getByRole('button', { name: /^Thêm JD$/i });
  const addBtn = (await addByTid.isVisible().catch(() => false)) ? addByTid : addByRole.first();
  const addVisible = await addBtn.isVisible().catch(() => false);
  check('JD_add_btn', addVisible, addVisible ? 'Thêm JD visible' : 'Thêm JD missing');
  if (!addVisible) {
    step('UF-JD-DND-01', 'FAIL', 'add missing');
    return false;
  }
  await addBtn.click();
  await sleep(1500);

  const formDialog = page.getByTestId('hdsd-jd-form-dialog');
  const dialogOk =
    (await formDialog.isVisible().catch(() => false)) ||
    (await page.locator('[role="dialog"]').filter({ hasText: /Thêm JD|JD/i }).first().isVisible().catch(() => false));
  check('JD_writer_open', dialogOk, dialogOk ? 'writer open' : 'writer missing');
  if (!dialogOk) {
    step('UF-JD-DND-01', 'FAIL', 'writer missing');
    return false;
  }

  // UTF-8 VI labels on writer chrome (before DnD)
  const writerText = await formDialog.innerText().catch(async () => {
    return (await page.locator('[role="dialog"]').first().innerText().catch(() => '')) || '';
  });
  const hasViLabels =
    /Thêm JD|Nhóm tùy chọn|Canvas|chức danh|Chọn chức danh/i.test(writerText) &&
    !hasMojibake(writerText);
  check(
    'JD_utf8_vi_labels',
    hasViLabels,
    hasViLabels
      ? `VI OK excerpt=${writerText.replace(/\s+/g, ' ').slice(0, 120)}`
      : `mojibake or missing VI · excerpt=${writerText.replace(/\s+/g, ' ').slice(0, 160)}`,
  );

  const pos = await pickFirstPosition(page);
  results.steps.JD_position = { status: 'OBS', note: JSON.stringify(pos), at: ts() };

  const dndGate = await waitDndSurface(page, 15_000);
  check(
    'JD_dnd_surface_ready',
    dndGate.ready,
    dndGate.ready
      ? 'jd-writer-dnd-surface visible'
      : `surface missing pending=${dndGate.pending}`,
  );
  await sleep(600);
  await shot(page, '02-jd-writer-before-dnd');

  const canvas = page.getByTestId('jd-writer-canvas');
  const canvasVisible = await canvas.isVisible().catch(() => false);
  const groupLoc = page.locator('[data-testid^="jd-writer-group-"]');
  const groupsBefore = await groupLoc.count().catch(() => 0);
  check(
    'JD_canvas_groups',
    groupsBefore >= 1 || canvasVisible,
    `groups=${groupsBefore} canvas=${canvasVisible}`,
  );

  let dndMode = 'none';
  let dndResult = { ok: false, reason: 'not attempted' };

  if (groupsBefore >= 2) {
    const handle0 = groupLoc.nth(0).locator('[data-rbd-drag-handle-draggable-id], .cursor-grab').first();
    const handle1 = groupLoc.nth(1);
    const h0vis = await handle0.isVisible().catch(() => false);
    if (h0vis) {
      dndMode = 'canvas-reorder';
      dndResult = await dragElement(page, handle0, handle1);
    }
  }

  if (dndMode === 'none') {
    const paletteItem = page
      .locator(
        '[data-testid="jd-writer-optional-palette"] [data-rbd-draggable-id], [data-testid="jd-writer-optional-palette"] .cursor-grab',
      )
      .first();
    if ((await paletteItem.isVisible().catch(() => false)) && canvasVisible) {
      dndMode = 'palette-to-canvas';
      dndResult = await dragElement(page, paletteItem, canvas);
    }
  }

  if (dndMode === 'none' && groupsBefore >= 1) {
    const handle0 = groupLoc.nth(0).locator('[data-rbd-drag-handle-draggable-id], .cursor-grab').first();
    if (await handle0.isVisible().catch(() => false)) {
      dndMode = 'canvas-nudge';
      dndResult = await dragElement(page, handle0, canvas);
    }
  }

  await sleep(800);
  await shot(page, '03-jd-writer-after-dnd');

  const groupsAfter = await groupLoc.count().catch(() => 0);
  const writerStillUsable =
    (await formDialog.isVisible().catch(() => false)) &&
    (await page.getByTestId('hdsd-jd-form-submit').isVisible().catch(() => false));

  results.steps.JD_dnd = {
    status: dndResult.ok ? 'OBS' : 'WARN',
    note: JSON.stringify({ dndMode, dndResult, groupsBefore, groupsAfter, writerStillUsable, position: pos.picked }),
    at: ts(),
  };

  check(
    'JD_dnd_attempted',
    dndMode !== 'none' && dndResult.ok,
    `mode=${dndMode} ok=${dndResult.ok} reason=${dndResult.reason || '—'} groups ${groupsBefore}→${groupsAfter}`,
  );
  check(
    'JD_writer_usable_after_drop',
    writerStillUsable,
    writerStillUsable ? 'dialog+submit still up' : 'writer broken',
  );

  recountDragHandlesFromAll();
  const totalSingular = results.consoleClassCounts.unable_find_drag_handle;
  const totalPlural = results.consoleClassCounts.unable_find_any_drag_handles;
  const dndHits = totalSingular + totalPlural;
  const dndStorm = dndHits >= 10;

  check(
    'JD_zero_drag_handle_invariant',
    totalSingular === 0 && totalPlural === 0,
    `unable_find_drag_handle=${totalSingular} unable_find_any=${totalPlural} dndHits=${dndHits} storm=${dndStorm}`,
  );

  const uncaught =
    results.pageErrors.length +
    results.consoleClassCounts.uncaught_reference +
    results.consoleClassCounts.uncaught_typeerror;
  check(
    'JD_zero_uncaught',
    uncaught === 0 && results.pageErrors.length === 0,
    `pageErrors=${results.pageErrors.length} ref=${results.consoleClassCounts.uncaught_reference} type=${results.consoleClassCounts.uncaught_typeerror}`,
  );

  // Close without save (U65)
  const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click({ force: true }).catch(() => null);
  } else {
    await page.keyboard.press('Escape').catch(() => null);
  }
  await sleep(500);
  await shot(page, '04-jd-writer-closed');

  // Process FAIL-immediate gates (surface-scoped)
  results.process_gates = {
    dndHits,
    dndStorm,
    unable_find_drag_handle: totalSingular,
    unable_find_any_drag_handles: totalPlural,
    mojibakeHits: hasMojibake(writerText) ? 1 : 0,
    uncaughtHits: uncaught,
    pageErrors: results.pageErrors.slice(0, 5),
    verdict:
      !dndStorm && dndHits === 0 && uncaught === 0 && !hasMojibake(writerText)
        ? 'PASS'
        : 'FAIL',
  };

  const pass =
    results.checks.JD_writer_open?.pass &&
    results.checks.JD_dnd_surface_ready?.pass &&
    results.checks.JD_dnd_attempted?.pass &&
    results.checks.JD_writer_usable_after_drop?.pass &&
    results.checks.JD_zero_drag_handle_invariant?.pass &&
    results.checks.JD_zero_uncaught?.pass &&
    results.checks.JD_utf8_vi_labels?.pass &&
    results.process_gates.verdict === 'PASS';

  step('UF-JD-DND-01', pass ? 'PASS' : 'FAIL', pass ? 'DnD clean storm=0' : 'DnD FAIL');
  return pass;
}

async function main() {
  console.log(`[${STAMP}] PO-UAT-REC-JD-DND-QA-01 start`);
  await probeL0();
  const l0Ok =
    results.l0.hrm === 200 &&
    results.l0.xbos === 200 &&
    (results.l0.portal5173 === 200 || results.l0.hrm_fe === 200);
  check('L0', l0Ok, JSON.stringify(results.l0));
  if (!l0Ok) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  results.env.loginHttp = session.http;
  results.env.loginVia = session.loginVia;
  save();

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
  trackPage(page);
  await injectPortalAuth(page, session);

  let pass = false;
  try {
    pass = await runJdDnd(page);
  } catch (e) {
    results.failReasons.push(`harness_throw: ${String(e?.message || e).slice(0, 200)}`);
    step('UF-JD-DND-01', 'FAIL', String(e?.message || e).slice(0, 120));
    pass = false;
  }

  // Honesty locks — always false; never invent
  results.honesty = {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    phase1_done_claimed: false,
    product_go_claimed: false,
  };
  results.denied = [
    'recruitment_uat_ready=true',
    'jd_dynamic_done=true',
    'seed',
    'Phase1 DONE',
    'product GO',
  ];

  const checkFails = Object.values(results.checks).filter((c) => !c.pass).length;
  results.verdict = pass && checkFails === 0 ? 'PASS' : 'FAIL';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  results.next_owner = results.verdict === 'PASS' ? 'qc' : 'dev-fe';
  results.next_dispatch =
    results.verdict === 'PASS'
      ? 'PO-UAT-REC-JD-DND-QC-01 certify JD DnD slice storm=0'
      : 'PO-UAT-REC-JD-DND-FE-02 fix residual from failReasons';
  save();

  await browser.close().catch(() => null);
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        process_gates: results.process_gates,
        consoleClassCounts: results.consoleClassCounts,
        checks: Object.fromEntries(
          Object.entries(results.checks).map(([k, v]) => [k, v.pass ? 'PASS' : 'FAIL']),
        ),
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.message || e));
  results.endedAt = ts();
  save();
  process.exit(1);
});
