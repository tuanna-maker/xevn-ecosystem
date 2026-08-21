#!/usr/bin/env node
/**
 * PO-HRM-UI-HEADER-JD-DND-QA-01 — U65 browser retest after FE-01
 * (1) CC shell single TopHeader · no duplicate XeVN OS / Command Center strip
 * (2) JD writer DnD — drag canvas/palette; ZERO drag-handle invariants
 * (3) Interview Schedule — Vietnamese UTF-8 labels; zero mojibake
 * (4) ZERO ReferenceError getDialogPortalContainer / LayoutDashboard
 * Cấm: seed · PASS chỉ Network 2xx · jd_dynamic_done · remaster · recruitment UAT-ready · product GO
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
  process.env.QA_OUT_JSON || 'docs/qa/evidence/_tmp-po-hrm-ui-header-jd-dnd-qa-01.FINAL.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-header-jd-dnd-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const MOJIBAKE_RE =
  /LÃªn|lá»‹ch|phá»ng|váº¥n|Äá»|Ã¡|Ã©|Ã­|Ã³|Ãº|Â.|Ãƒ|Ã„|â€|ï¿½|LÃªn lá»‹ch|phÃ²ng/i;

const results = {
  work_item_id: 'PO-HRM-UI-HEADER-JD-DND-QA-01',
  startedAt: ts(),
  u65: 'zero-seed · browser-only · hard-refresh via cache-bust',
  entry: 'FE-01 READY 5/5 · process NO-GO context',
  hdsd_align: true,
  inventory: [
    'Command Center → TopHeader + cc-persona-bar',
    'Tuyển dụng → Thư viện JD → Thêm JD → drag canvas/palette',
    'Tuyển dụng → Ứng viên → Lên lịch phỏng vấn dialog',
  ],
  journeys: ['UF-CC-HEADER-01', 'UF-JD-DND-01', 'UF-REC-INTERVIEW-UTF-01', 'UF-REFERROR-01'],
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
    getDialogPortalContainer: 0,
    LayoutDashboard: 0,
  },
  steps: {},
  checks: {},
  failReasons: [],
  screens: [],
  residuals: [],
  honesty: {
    remaster_program_done_claimed: false,
    seed_used: false,
    jd_dynamic_done_claimed: false,
    recruitment_uat_ready_claimed: false,
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
  }
  if (/Unable to find drag handle(?!s)/i.test(t) || /Unable to find drag handle\b/i.test(t)) {
    // count specific "Unable to find drag handle" (singular) — also matches plural above once
    if (!/Unable to find any drag handles/i.test(t)) {
      results.consoleClassCounts.unable_find_drag_handle += 1;
    } else {
      // plural line already counted; also count singular class separately when both phrases appear
    }
  }
  // hello-pangea often logs: "Unable to find drag handle" as invariant (non-plural)
  if (/Unable to find drag handle/i.test(t) && !/Unable to find any drag handles/i.test(t)) {
    /* already counted */
  }
  if (/getDialogPortalContainer is not defined/i.test(t)) {
    results.consoleClassCounts.getDialogPortalContainer += 1;
  }
  if (/LayoutDashboard is not defined/i.test(t)) {
    results.consoleClassCounts.LayoutDashboard += 1;
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
    results.screens.push(`evidence/screens/po-hrm-ui-header-jd-dnd-qa-01/${name}.png`);
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
  const prefer = /IT|TECH|Software|Dev|Phần mềm|Công nghệ|Lập trình/i;
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

async function runHeader(page) {
  step('UF-CC-HEADER-01', 'RUNNING', 'Command Center shell');
  // snapshot console baseline for this surface
  const errBefore = results.consoleAll.length;

  await page.goto(q('/command-center'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  // hard refresh cache-bust already via _qa; extra reload once
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2800);
  await clearOverlays(page);
  await shot(page, '01-cc-shell');

  const shell = await page.evaluate(() => {
    const brandMarks = document.querySelectorAll('[data-testid="portal-brand-mark"]');
    const personaBar = document.querySelector('[data-testid="cc-persona-bar"]');
    const personaSwitcher = document.querySelector('[data-testid="cc-persona-switcher"]');
    // Duplicate page strip: sticky/in-page title containing both XeVN OS and Command Center
    // outside TopHeader brand mark.
    const candidates = Array.from(
      document.querySelectorAll('h1, h2, [class*="page-title"], [class*="PageTitle"], header, [class*="sticky"]'),
    );
    const duplicateStrips = [];
    for (const el of candidates) {
      if (el.closest('[data-testid="portal-brand-mark"]')) continue;
      if (el.closest('header') && el.closest('[data-testid="portal-brand-mark"]')) continue;
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/XeVN OS/i.test(text) && /Command Center/i.test(text) && text.length < 120) {
        // ignore TopHeader if it only has brand aria
        if (el.closest('header')?.querySelector('[data-testid="portal-brand-mark"]')) {
          // text inside top header chrome — allowed only if not a second title strip
          const inTop = el.closest('header');
          const hasBrand = !!inTop?.querySelector('[data-testid="portal-brand-mark"]');
          if (hasBrand && /portal-brand|TopHeader|top-header/i.test(inTop?.className || '')) {
            continue;
          }
        }
        // Persona bar should NOT contain XeVN OS / Command Center as title
        if (el.closest('[data-testid="cc-persona-bar"]')) {
          duplicateStrips.push({ where: 'persona-bar', text: text.slice(0, 100) });
          continue;
        }
        // page body strip
        if (!el.closest('[data-testid="portal-brand-mark"]')) {
          duplicateStrips.push({
            where: el.tagName + '.' + (el.className || '').toString().slice(0, 40),
            text: text.slice(0, 100),
          });
        }
      }
    }
    // Stronger: look for explicit remastered duplicate pattern — grid title block
    const bodyTextNodes = Array.from(document.querySelectorAll('main h1, main h2, [data-testid="cc-page-title"]'));
    for (const el of bodyTextNodes) {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (/XeVN OS/i.test(text) || (/Command Center/i.test(text) && /XeVN/i.test(text))) {
        duplicateStrips.push({ where: 'main-title', text: text.slice(0, 100) });
      }
    }
    const personaLabels = personaSwitcher
      ? Array.from(personaSwitcher.querySelectorAll('button, [role="tab"], [role="radio"]'))
          .map((b) => (b.textContent || '').trim())
          .filter(Boolean)
      : [];
    return {
      brandMarkCount: brandMarks.length,
      personaBar: !!personaBar,
      personaSwitcher: !!personaSwitcher,
      personaLabels,
      duplicateStrips,
      url: location.href,
    };
  });

  results.steps.UF_CC_HEADER_shell = { status: 'OBS', note: JSON.stringify(shell), at: ts() };

  check(
    'CC_single_brand_mark',
    shell.brandMarkCount === 1,
    `portal-brand-mark count=${shell.brandMarkCount}`,
  );
  check(
    'CC_no_duplicate_title_strip',
    shell.duplicateStrips.length === 0,
    shell.duplicateStrips.length
      ? `strips=${JSON.stringify(shell.duplicateStrips).slice(0, 220)}`
      : 'no XeVN OS/Command Center page strip',
  );
  check('CC_persona_bar', shell.personaBar, shell.personaBar ? 'cc-persona-bar visible' : 'missing');
  check(
    'CC_persona_switcher',
    shell.personaSwitcher,
    shell.personaSwitcher ? `labels=${shell.personaLabels.join('|')}` : 'missing',
  );

  // Click each persona if present
  let personaUsable = false;
  if (shell.personaSwitcher) {
    const pills = page.locator('[data-testid="cc-persona-switcher"] button, [data-testid="cc-persona-switcher"] [role="tab"]');
    const n = await pills.count().catch(() => 0);
    for (let i = 0; i < Math.min(n, 3); i++) {
      await pills.nth(i).click({ force: true }).catch(() => null);
      await sleep(400);
      personaUsable = true;
    }
  }
  check('CC_persona_clickable', personaUsable, personaUsable ? 'clicked persona pills' : 'no pills clicked');
  await shot(page, '02-cc-persona');

  const layoutDashHits = results.consoleClassCounts.LayoutDashboard;
  check(
    'CC_zero_LayoutDashboard',
    layoutDashHits === 0,
    `LayoutDashboard is not defined count=${layoutDashHits} (console slice from ${errBefore})`,
  );

  const pass =
    results.checks.CC_single_brand_mark?.pass &&
    results.checks.CC_no_duplicate_title_strip?.pass &&
    results.checks.CC_persona_bar?.pass &&
    results.checks.CC_persona_clickable?.pass &&
    results.checks.CC_zero_LayoutDashboard?.pass;
  step('UF-CC-HEADER-01', pass ? 'PASS' : 'FAIL', pass ? 'single chrome OK' : 'shell FAIL');
  return pass;
}

async function runJdDnd(page) {
  step('UF-JD-DND-01', 'RUNNING', 'JD writer DnD');
  // Reset class counters for surface-scoped storm (still keep cumulative for report)
  const baselineSingular = results.consoleClassCounts.unable_find_drag_handle;
  const baselinePlural = results.consoleClassCounts.unable_find_any_drag_handles;
  const baselinePortal = results.consoleClassCounts.getDialogPortalContainer;

  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', 'jd-library'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2800);
  await clearOverlays(page);
  await shot(page, '03-jd-library');

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

  const pos = await pickFirstPosition(page);
  results.steps.JD_position = { status: 'OBS', note: JSON.stringify(pos), at: ts() };
  await sleep(2000);
  await shot(page, '04-jd-writer-before-dnd');

  const canvas = page.getByTestId('jd-writer-canvas');
  const canvasVisible = await canvas.isVisible().catch(() => false);
  const groupLoc = page.locator('[data-testid^="jd-writer-group-"]');
  const groupsBefore = await groupLoc.count().catch(() => 0);
  check('JD_canvas_groups', groupsBefore >= 1 || canvasVisible, `groups=${groupsBefore} canvas=${canvasVisible}`);

  let dndMode = 'none';
  let dndResult = { ok: false, reason: 'not attempted' };

  // Prefer canvas reorder if ≥2 groups
  if (groupsBefore >= 2) {
    const handle0 = groupLoc.nth(0).locator('[data-rbd-drag-handle-draggable-id], .cursor-grab').first();
    const handle1 = groupLoc.nth(1);
    const h0vis = await handle0.isVisible().catch(() => false);
    if (h0vis) {
      dndMode = 'canvas-reorder';
      dndResult = await dragElement(page, handle0, handle1);
    }
  }

  // Else palette → canvas
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

  // Else single canvas group — drag within canvas (still exercises handle)
  if (dndMode === 'none' && groupsBefore >= 1) {
    const handle0 = groupLoc.nth(0).locator('[data-rbd-drag-handle-draggable-id], .cursor-grab').first();
    if (await handle0.isVisible().catch(() => false)) {
      dndMode = 'canvas-nudge';
      dndResult = await dragElement(page, handle0, canvas);
    }
  }

  await sleep(800);
  await shot(page, '05-jd-writer-after-dnd');

  const groupsAfter = await groupLoc.count().catch(() => 0);
  const writerStillUsable =
    (await formDialog.isVisible().catch(() => false)) &&
    (await page.getByTestId('hdsd-jd-form-submit').isVisible().catch(() => false));

  results.steps.JD_dnd = {
    status: dndResult.ok ? 'OBS' : 'WARN',
    note: JSON.stringify({ dndMode, dndResult, groupsBefore, groupsAfter, writerStillUsable }),
    at: ts(),
  };

  check(
    'JD_dnd_attempted',
    dndMode !== 'none' && dndResult.ok,
    `mode=${dndMode} ok=${dndResult.ok} reason=${dndResult.reason || '—'} groups ${groupsBefore}→${groupsAfter}`,
  );
  check('JD_writer_usable_after_drop', writerStillUsable, writerStillUsable ? 'dialog+submit still up' : 'writer broken');

  recountDragHandlesFromAll();
  const deltaSingular =
    results.consoleClassCounts.unable_find_drag_handle - baselineSingular;
  const deltaPlural =
    results.consoleClassCounts.unable_find_any_drag_handles - baselinePlural;
  // Prefer absolute session counts on JD surface — use total after JD opened
  const totalSingular = results.consoleClassCounts.unable_find_drag_handle;
  const totalPlural = results.consoleClassCounts.unable_find_any_drag_handles;

  check(
    'JD_zero_drag_handle_invariant',
    totalSingular === 0 && totalPlural === 0,
    `unable_find_drag_handle=${totalSingular} unable_find_any=${totalPlural} (delta singular=${deltaSingular} plural=${deltaPlural})`,
  );

  const portalDelta = results.consoleClassCounts.getDialogPortalContainer - baselinePortal;
  check(
    'JD_zero_getDialogPortalContainer',
    results.consoleClassCounts.getDialogPortalContainer === 0,
    `getDialogPortalContainer count=${results.consoleClassCounts.getDialogPortalContainer} delta=${portalDelta}`,
  );

  // Close without save (U65 — avoid mutate if possible; cancel)
  const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click({ force: true }).catch(() => null);
  } else {
    await page.keyboard.press('Escape').catch(() => null);
  }
  await sleep(500);

  const pass =
    results.checks.JD_writer_open?.pass &&
    results.checks.JD_dnd_attempted?.pass &&
    results.checks.JD_writer_usable_after_drop?.pass &&
    results.checks.JD_zero_drag_handle_invariant?.pass &&
    results.checks.JD_zero_getDialogPortalContainer?.pass;
  step('UF-JD-DND-01', pass ? 'PASS' : 'FAIL', pass ? 'DnD clean' : 'DnD FAIL');
  return pass;
}

async function runInterviewUtf(page) {
  step('UF-REC-INTERVIEW-UTF-01', 'RUNNING', 'Interview schedule UTF-8');
  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', 'candidates'), {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await sleep(2800);
  await clearOverlays(page);
  await shot(page, '06-candidates');

  // Prefer calendar icon button in first data row
  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count().catch(() => 0);
  let opened = false;
  if (rowCount > 0) {
    // CalendarClock buttons — last action cluster often has schedule
    const scheduleBtn = rows
      .first()
      .locator('button')
      .filter({ has: page.locator('svg.lucide-calendar-clock, svg.lucide-calendar') })
      .first();
    if (await scheduleBtn.isVisible().catch(() => false)) {
      await scheduleBtn.click({ force: true });
      opened = true;
    } else {
      // tooltip text path
      const byTitle = page.getByRole('button', { name: /Lên lịch|Schedule/i }).first();
      if (await byTitle.isVisible().catch(() => false)) {
        await byTitle.click({ force: true });
        opened = true;
      } else {
        // click icon buttons right-to-left in first row
        const btns = rows.first().locator('button');
        const bn = await btns.count();
        for (let i = bn - 1; i >= 0 && i >= bn - 5; i--) {
          await btns.nth(i).click({ force: true }).catch(() => null);
          await sleep(600);
          if (await page.getByTestId('schedule-interview-dialog').isVisible().catch(() => false)) {
            opened = true;
            break;
          }
          if (await page.locator('[role="dialog"]').filter({ hasText: /lịch phỏng|Schedule/i }).first().isVisible().catch(() => false)) {
            opened = true;
            break;
          }
          await page.keyboard.press('Escape').catch(() => null);
          await sleep(200);
        }
      }
    }
  }

  await sleep(1000);
  const dialog = page.getByTestId('schedule-interview-dialog');
  let dialogVisible = await dialog.isVisible().catch(() => false);
  if (!dialogVisible) {
    dialogVisible = await page
      .locator('[role="dialog"]')
      .filter({ hasText: /phỏng vấn|Interview/i })
      .first()
      .isVisible()
      .catch(() => false);
  }
  check(
    'INT_dialog_open',
    dialogVisible,
    `opened=${opened} rowCount=${rowCount} dialogVisible=${dialogVisible}`,
  );

  let dialogText = '';
  if (dialogVisible) {
    const root = (await dialog.isVisible().catch(() => false))
      ? dialog
      : page.locator('[role="dialog"]').filter({ hasText: /phỏng|Interview/i }).first();
    dialogText = ((await root.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
  }
  results.steps.INT_dialog_text = {
    status: 'OBS',
    note: dialogText.slice(0, 400),
    at: ts(),
  };
  await shot(page, '07-interview-schedule-dialog');

  const hasTitle = /Lên lịch phỏng vấn/.test(dialogText);
  const hasDate = /Ngày/.test(dialogText);
  const hasTime = /Giờ/.test(dialogText);
  const hasDuration = /Thời lượng/.test(dialogText);
  const hasFormat = /Hình thức/.test(dialogText);
  const hasLocation = /Địa điểm/.test(dialogText);
  const mojibake = MOJIBAKE_RE.test(dialogText);

  check('INT_title_utf8', hasTitle, hasTitle ? 'title Lên lịch phỏng vấn' : `title missing; text=${dialogText.slice(0, 80)}`);
  check(
    'INT_labels_utf8',
    hasDate && hasTime && hasDuration && hasFormat && hasLocation,
    `Ngày=${hasDate} Giờ=${hasTime} Thời lượng=${hasDuration} Hình thức=${hasFormat} Địa điểm=${hasLocation}`,
  );
  check('INT_zero_mojibake', !mojibake && dialogVisible, mojibake ? `mojibake hit in: ${dialogText.slice(0, 120)}` : 'no mojibake patterns');

  // Close without submit
  if (dialogVisible) {
    const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng/i }).first();
    if (await cancel.isVisible().catch(() => false)) await cancel.click({ force: true }).catch(() => null);
    else await page.keyboard.press('Escape').catch(() => null);
  }

  const pass =
    results.checks.INT_dialog_open?.pass &&
    results.checks.INT_title_utf8?.pass &&
    results.checks.INT_labels_utf8?.pass &&
    results.checks.INT_zero_mojibake?.pass;
  step('UF-REC-INTERVIEW-UTF-01', pass ? 'PASS' : 'FAIL', pass ? 'UTF-8 OK' : 'interview UTF FAIL');
  return pass;
}

async function main() {
  await probeL0();
  const feOk = results.l0.portal5173 === 200 || results.l0.hrm_fe === 200;
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || !feOk) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push(`L0 down ${JSON.stringify(results.l0)}`);
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('l0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  step('login', 'PASS', `HTTP ${session.http} via ${session.loginVia}`);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  let p1 = false;
  let p2 = false;
  let p3 = false;
  try {
    p1 = await runHeader(page);
    p2 = await runJdDnd(page);
    p3 = await runInterviewUtf(page);
  } catch (e) {
    results.failReasons.push(`runtime: ${String(e?.message || e).slice(0, 200)}`);
    step('runtime', 'FAIL', String(e?.message || e).slice(0, 200));
  }

  recountDragHandlesFromAll();

  // Global ReferenceError gate
  check(
    'REF_zero_getDialogPortalContainer',
    results.consoleClassCounts.getDialogPortalContainer === 0,
    `count=${results.consoleClassCounts.getDialogPortalContainer}`,
  );
  check(
    'REF_zero_LayoutDashboard',
    results.consoleClassCounts.LayoutDashboard === 0,
    `count=${results.consoleClassCounts.LayoutDashboard}`,
  );
  const pageErrRef = results.pageErrors.filter((e) =>
    /getDialogPortalContainer|LayoutDashboard/i.test(e),
  );
  check('REF_zero_pageErrors_named', pageErrRef.length === 0, `hits=${pageErrRef.length}`);

  const allPass =
    p1 &&
    p2 &&
    p3 &&
    results.checks.REF_zero_getDialogPortalContainer?.pass &&
    results.checks.REF_zero_LayoutDashboard?.pass &&
    results.checks.REF_zero_pageErrors_named?.pass &&
    results.failReasons.length === 0;

  // Soft: if failReasons only from failed checks already counted — recompute
  const hardFail =
    !p1 ||
    !p2 ||
    !p3 ||
    !results.checks.REF_zero_getDialogPortalContainer?.pass ||
    !results.checks.REF_zero_LayoutDashboard?.pass ||
    !results.checks.REF_zero_pageErrors_named?.pass;

  results.verdict = hardFail ? 'FAIL' : 'PASS';
  results.ack_status = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  if (hardFail) {
    results.residuals.push(
      ...Object.entries(results.checks)
        .filter(([, v]) => !v.pass)
        .map(([k, v]) => `${k}: ${v.note}`),
    );
  }

  results.consoleExcerpt = {
    drag_handle_singular: results.consoleClassCounts.unable_find_drag_handle,
    drag_handle_plural: results.consoleClassCounts.unable_find_any_drag_handles,
    getDialogPortalContainer: results.consoleClassCounts.getDialogPortalContainer,
    LayoutDashboard: results.consoleClassCounts.LayoutDashboard,
    pageErrors_sample: results.pageErrors.slice(0, 8),
    consoleErrors_sample: results.consoleErrors.slice(0, 12),
  };

  results.endedAt = ts();
  save();
  await browser.close().catch(() => null);

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        checks: Object.fromEntries(
          Object.entries(results.checks).map(([k, v]) => [k, v.pass ? 'PASS' : 'FAIL']),
        ),
        consoleClassCounts: results.consoleClassCounts,
        failReasons: results.failReasons,
        screens: results.screens,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(hardFail ? 1 : 0);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 400));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
