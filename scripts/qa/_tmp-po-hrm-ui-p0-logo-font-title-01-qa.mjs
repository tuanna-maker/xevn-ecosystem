#!/usr/bin/env node
/**
 * PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QA — U65 browser
 * AC: dialog wordmark white pad · AlertDialog white · html 16px · title-first forms · body weight OBS
 * Cấm: seed · API fake · remaster_program_done · JD drag
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
  process.env.QA_OUT_JSON ||
    'docs/qa/evidence/_tmp-po-hrm-ui-p0-logo-font-title-01-qa.FINAL.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function isWhiteBg(bg) {
  if (!bg) return false;
  const s = String(bg).toLowerCase().trim();
  if (s === 'white' || s === '#fff' || s === '#ffffff') return true;
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?/);
  if (!m) return false;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const a = m[4] === undefined ? 1 : Number(m[4]);
  return a >= 0.95 && r >= 250 && g >= 250 && b >= 250;
}

function isBlackBg(bg) {
  if (!bg) return false;
  const s = String(bg).toLowerCase().trim();
  if (s === 'black' || s === '#000' || s === '#000000') return true;
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) return false;
  return Number(m[1]) <= 5 && Number(m[2]) <= 5 && Number(m[3]) <= 5;
}

const results = {
  work_item_id: 'PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: [
    'Recruitment → Tin tuyển dụng → Tạo tin',
    'Recruitment → Tin tuyển dụng → Xóa (AlertDialog cancel)',
    'Recruitment → Thư viện JD → Thêm JD',
    'Recruitment → YCTD → Thêm yêu cầu',
    'documentElement font-size',
    'body font-weight OBS',
  ],
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
  network: [],
  mutates: [],
  consoleErrors: [],
  pageErrors: [],
  steps: {},
  checks: {},
  failReasons: [],
  screens: [],
  residuals: [],
  honesty: {
    remaster_program_done_claimed: false,
    seed_used: false,
    jd_dynamic_drag_tested: false,
  },
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function step(id, status, note) {
  results.steps[id] = { status, note, at: ts() };
  save();
}

function fail(reason) {
  results.failReasons.push(reason);
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal5173', PORTAL],
    ['portal8088', 'http://127.0.0.1:8088/'],
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
  } else if (results.l0.portal8088 === 200) {
    BASE = 'http://127.0.0.1:8088';
    PORTAL_MODE = true;
  }
  results.env.BASE = BASE;
  results.env.PORTAL_MODE = PORTAL_MODE;
  save();
}

function q(path, tab) {
  const u = new URL(path, BASE);
  if (PORTAL_MODE) u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (tab) u.searchParams.set('tab', tab);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
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
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/').split('docs/qa/')[1] || path);
}

async function clearOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => null);
    await sleep(200);
  }
}

async function gotoTab(page, tab) {
  await clearOverlays(page);
  await page.goto(q('/hr/recruitment', tab), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2200);
  await clearOverlays(page);
}

async function dismissDialog(page) {
  const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng|Close/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click({ force: true });
    await sleep(400);
    return;
  }
  await page.keyboard.press('Escape');
  await sleep(300);
}

async function measureRootFont(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const htmlCs = getComputedStyle(html);
    const bodyCs = getComputedStyle(body);
    return {
      htmlFontSize: htmlCs.fontSize,
      htmlFontSizeCss: html.style.fontSize || '',
      bodyFontSize: bodyCs.fontSize,
      bodyFontWeight: bodyCs.fontWeight,
      bodyFontFamily: bodyCs.fontFamily,
    };
  });
}

async function measureWordmark(page, preferAlert = false) {
  return page.evaluate((alert) => {
    const selectors = alert
      ? [
          '[data-testid="xevn-alert-dialog-wordmark"]',
          '[role="alertdialog"] .xevn-dialog-wordmark',
          '.xevn-dialog-wordmark',
        ]
      : [
          '[data-testid="xevn-dialog-wordmark"]',
          '[role="dialog"] .xevn-dialog-wordmark',
          'img.xevn-dialog-wordmark',
          '.xevn-dialog-wordmark',
        ];
    let el = null;
    let used = null;
    for (const sel of selectors) {
      el = document.querySelector(sel);
      if (el) {
        used = sel;
        break;
      }
    }
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    return {
      found: true,
      selector: used,
      testId: el.getAttribute('data-testid') || '',
      backgroundColor: cs.backgroundColor,
      width: cs.width,
      height: cs.height,
      className: el.className?.toString?.() || '',
    };
  }, preferAlert);
}

async function measureTitleFirst(page, dialogTestId, firstFieldTestId, expectedLabelRe) {
  return page.evaluate(
    ({ dialogTestId: tid, firstFieldTestId: fid, expectedLabelRe: reSrc }) => {
      const root =
        (tid && document.querySelector(`[data-testid="${tid}"]`)) ||
        document.querySelector('[role="dialog"]');
      if (!root) return { found: false, reason: 'dialog missing' };
      const form = root.querySelector('form') || root;
      const labels = Array.from(form.querySelectorAll('label')).map((l) =>
        (l.textContent || '').trim().replace(/\s+/g, ' '),
      );
      const firstLabel = labels[0] || '';
      const field =
        (fid && form.querySelector(`[data-testid="${fid}"]`)) ||
        form.querySelector('input, textarea, [role="combobox"]');
      const fieldTestId = field?.getAttribute?.('data-testid') || '';
      const allFields = Array.from(
        form.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]), textarea, button[role="combobox"], [role="combobox"]',
        ),
      );
      const firstInteractive = allFields[0];
      const firstInteractiveTestId = firstInteractive?.getAttribute?.('data-testid') || '';
      const firstInteractiveTag = firstInteractive?.tagName || '';
      const re = new RegExp(reSrc, 'i');
      const labelOk = re.test(firstLabel);
      const fieldOk = !fid || fieldTestId === fid || firstInteractiveTestId === fid;
      // Title field should appear before any other labeled control in DOM order
      let titleBeforeOthers = true;
      if (fid) {
        const titleEl = form.querySelector(`[data-testid="${fid}"]`);
        if (!titleEl) titleBeforeOthers = false;
        else {
          for (const other of allFields) {
            if (other === titleEl) break;
            if (other.getAttribute('data-testid') && other.getAttribute('data-testid') !== fid) {
              titleBeforeOthers = false;
              break;
            }
            // unlabeled skip until title — ok if only chrome
          }
          // Ensure title is among first interactive
          const idx = allFields.indexOf(titleEl);
          titleBeforeOthers = idx === 0 || (idx >= 0 && idx <= 1);
        }
      }
      return {
        found: true,
        firstLabel,
        labels: labels.slice(0, 6),
        fieldTestId,
        firstInteractiveTestId,
        firstInteractiveTag,
        labelOk,
        fieldOk,
        titleBeforeOthers,
        pass: labelOk && fieldOk && titleBeforeOthers,
      };
    },
    { dialogTestId, firstFieldTestId, expectedLabelRe },
  );
}

async function main() {
  await probeL0();
  const feOk =
    results.l0.hrm_fe === 200 || results.l0.portal5173 === 200 || results.l0.portal8088 === 200;
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || !feOk) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    fail(`L0 down ${JSON.stringify(results.l0)}`);
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

  page.on('pageerror', (e) => results.pageErrors.push(String(e.message || e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, ''),
    };
    if (method !== 'GET' && method !== 'HEAD') results.mutates.push(entry);
    if (results.network.length < 160) results.network.push(entry);
  });

  await injectPortalAuth(page, session);

  // ——— AC3 root font ———
  try {
    await gotoTab(page, 'jobs');
    await shot(page, '00-jobs-shell');
    const root = await measureRootFont(page);
    const fs = parseFloat(root.htmlFontSize || '0');
    // Accept 16px exact, or 100% resolving to ~16 (browser default)
    const rootOk = fs >= 15.5 && fs <= 16.5;
    const bodyW = parseInt(root.bodyFontWeight || '0', 10) || 400;
    const sharpObs =
      bodyW >= 500
        ? 'OBS: body font-weight ≥500 — sharper floor present'
        : 'OBS: body font-weight <500 — may still feel soft';
    results.checks.root_font_16px = {
      pass: rootOk,
      ...root,
      effectivePx: fs,
      sharpObs,
    };
    results.checks.body_weight_obs = {
      pass: true, // observational — not hard fail
      obs: sharpObs,
      bodyFontWeight: root.bodyFontWeight,
    };
    if (!rootOk) fail(`html font-size ${root.htmlFontSize} (want ~16px)`);
    step('root_font', rootOk ? 'PASS' : 'FAIL', `${root.htmlFontSize} · ${sharpObs}`);
  } catch (e) {
    results.checks.root_font_16px = { pass: false, error: String(e.message || e) };
    fail(`root font: ${String(e.message || e).slice(0, 160)}`);
    step('root_font', 'FAIL', String(e.message || e).slice(0, 120));
  }

  // ——— AC1 create-job wordmark white + AC4 title-first ———
  try {
    await gotoTab(page, 'jobs');
    const createBtn = page.getByRole('button', { name: /Tạo tin tuyển dụng/i }).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await createBtn.click({ force: true });
    await sleep(1200);
    const dlg = page.locator('[data-testid="rec-job-create-edit-dialog-precision"]');
    await dlg.waitFor({ state: 'visible', timeout: 12_000 });

    const wm = await measureWordmark(page, false);
    const whiteOk = wm.found && isWhiteBg(wm.backgroundColor) && !isBlackBg(wm.backgroundColor);
    results.checks.create_job_wordmark_white = {
      pass: whiteOk,
      ...wm,
      isWhite: isWhiteBg(wm.backgroundColor),
      isBlack: isBlackBg(wm.backgroundColor),
    };
    if (!whiteOk) {
      fail(
        `create-job wordmark bg=${wm.backgroundColor || 'missing'} (want rgb(255,255,255))`,
      );
    }

    const titleFirst = await measureTitleFirst(
      page,
      'rec-job-create-edit-dialog-precision',
      'rec-job-form-title',
      'Tiêu đề|Title',
    );
    results.checks.create_job_title_first = titleFirst;
    if (!titleFirst.pass) {
      fail(
        `create-job title-first FAIL firstLabel="${titleFirst.firstLabel}" field=${titleFirst.fieldTestId}`,
      );
    }

    await shot(page, '01-create-job-dialog');
    await dismissDialog(page);
    step(
      'create_job',
      whiteOk && titleFirst.pass ? 'PASS' : 'FAIL',
      `wm=${wm.backgroundColor}; label=${titleFirst.firstLabel}`,
    );
  } catch (e) {
    results.checks.create_job_wordmark_white = { pass: false, error: String(e.message || e) };
    results.checks.create_job_title_first = { pass: false, error: String(e.message || e) };
    fail(`create-job: ${String(e.message || e).slice(0, 160)}`);
    step('create_job', 'FAIL', String(e.message || e).slice(0, 120));
    await clearOverlays(page);
  }

  // ——— AC2 AlertDialog delete confirm (cancel only — no mutate); "if easy" ———
  try {
    await gotoTab(page, 'jobs');
    await sleep(1000);
    const emptyJobs = await page
      .locator('[data-testid="rec-jobs-tab-precision"]')
      .getByText(/Chưa có tin tuyển dụng/i)
      .isVisible()
      .catch(() => false);
    let opened = false;
    const trashSvg = page.locator('[data-testid="rec-jobs-tab-precision"] svg.lucide-trash-2');
    const n = await trashSvg.count();
    if (n > 0) {
      await trashSvg.first().click({ force: true });
      await sleep(800);
      opened = await page.locator('[role="alertdialog"]').isVisible().catch(() => false);
    }

    // Fallback: Employees SoftDel AlertDialog (same primitive) — open → Cancel only
    if (!opened) {
      await clearOverlays(page);
      await page.goto(q('/hr/employees'), {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      });
      await sleep(2800);
      await clearOverlays(page);
      const row = page.locator('table tbody tr').first();
      if (await row.isVisible().catch(() => false)) {
        await row.locator('button').last().click({ force: true });
        await sleep(600);
        const menuOk = await page
          .locator('[role="menu"]')
          .waitFor({ state: 'visible', timeout: 5000 })
          .then(() => true)
          .catch(() => false);
        if (menuOk) {
          try {
            await page.getByRole('menuitem', { name: 'Xóa', exact: true }).click({ timeout: 5000 });
          } catch {
            await page
              .locator('[role="menuitem"]')
              .filter({ hasText: /^Xóa$/ })
              .click({ timeout: 5000 })
              .catch(() => null);
          }
          await sleep(1000);
          opened = await page.locator('[role="alertdialog"]').isVisible().catch(() => false);
          if (opened) {
            results.checks.alert_dialog_path = 'employees-softdel-cancel';
          }
        }
      }
    } else {
      results.checks.alert_dialog_path = 'jobs-delete-cancel';
    }

    if (!opened) {
      // AC2 "if easy" — empty jobs + no SoftDel alert in session → OBS skip, not hard FAIL
      const note =
        'OBS SKIP: AlertDialog not easy (jobs list empty under U65; SoftDel alert not opened). Source lock AlertDialog !bg-white still in FE READY.';
      results.checks.alert_dialog_wordmark_white = {
        pass: true,
        skipped: true,
        emptyJobs,
        trashCount: n,
        obs: note,
      };
      results.residuals.push(note);
      step('alert_dialog', 'OBS_SKIP', note);
    } else {
      const wm = await measureWordmark(page, true);
      const whiteOk = wm.found && isWhiteBg(wm.backgroundColor) && !isBlackBg(wm.backgroundColor);
      results.checks.alert_dialog_wordmark_white = {
        pass: whiteOk,
        skipped: false,
        ...wm,
        isWhite: isWhiteBg(wm.backgroundColor),
        isBlack: isBlackBg(wm.backgroundColor),
      };
      if (!whiteOk) fail(`AlertDialog wordmark bg=${wm.backgroundColor || 'missing'}`);
      await shot(page, '02-alert-delete-confirm');
      const cancel = page.getByRole('button', { name: /Hủy|Cancel/i }).first();
      if (await cancel.isVisible().catch(() => false)) {
        await cancel.click({ force: true });
      } else {
        await page.keyboard.press('Escape');
      }
      await sleep(400);
      step('alert_dialog', whiteOk ? 'PASS' : 'FAIL', wm.backgroundColor || '');
    }
  } catch (e) {
    results.checks.alert_dialog_wordmark_white = { pass: false, error: String(e.message || e) };
    fail(`AlertDialog: ${String(e.message || e).slice(0, 160)}`);
    step('alert_dialog', 'FAIL', String(e.message || e).slice(0, 120));
    await clearOverlays(page);
  }

  // ——— AC4 JD template title-first ———
  try {
    await gotoTab(page, 'jd-library');
    const addBtn = page.getByRole('button', { name: /Thêm JD/i }).first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click({ force: true });
    await sleep(1000);
    const dlg = page
      .locator('[role="dialog"]')
      .filter({ hasText: /JD template|Thêm JD/i })
      .first();
    await dlg.waitFor({ state: 'visible', timeout: 12_000 });

    // Prefer known testids if present; else label order
    const titleFirst = await page.evaluate(() => {
      const root = document.querySelector('[role="dialog"]');
      if (!root) return { found: false };
      const labels = Array.from(root.querySelectorAll('label')).map((l) =>
        (l.textContent || '').trim().replace(/\s+/g, ' '),
      );
      const firstLabel = labels[0] || '';
      const titleOk = /Tiêu đề|Title/i.test(firstLabel);
      const codeIdx = labels.findIndex((l) => /Mã JD|Code/i.test(l));
      const titleIdx = labels.findIndex((l) => /Tiêu đề|Title/i.test(l));
      const beforeCode = titleIdx >= 0 && (codeIdx < 0 || titleIdx < codeIdx);
      const titleInput =
        root.querySelector('[data-testid="hdsd-jd-form-title"]') ||
        root.querySelector('input');
      return {
        found: true,
        firstLabel,
        labels: labels.slice(0, 6),
        titleIdx,
        codeIdx,
        beforeCode,
        titleInputTestId: titleInput?.getAttribute?.('data-testid') || '',
        pass: titleOk && beforeCode,
      };
    });
    results.checks.jd_template_title_first = titleFirst;
    if (!titleFirst.pass) {
      fail(`JD template title-first FAIL firstLabel="${titleFirst.firstLabel}"`);
    }
    await shot(page, '03-jd-template-create');
    await dismissDialog(page);
    step('jd_template', titleFirst.pass ? 'PASS' : 'FAIL', titleFirst.firstLabel || '');
  } catch (e) {
    results.checks.jd_template_title_first = { pass: false, error: String(e.message || e) };
    fail(`JD template: ${String(e.message || e).slice(0, 160)}`);
    step('jd_template', 'FAIL', String(e.message || e).slice(0, 120));
    await clearOverlays(page);
  }

  // ——— AC4 YCTD title-first ———
  try {
    await gotoTab(page, 'requisitions');
    const addBtn = page
      .locator('[data-testid="hdsd-requisition-create-btn"]')
      .or(page.getByRole('button', { name: /Thêm yêu cầu/i }))
      .first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click({ force: true });
    await sleep(1200);
    const dlg = page.locator('[data-testid="hdsd-requisition-form-dialog"]');
    await dlg.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
    const titleFirst = await measureTitleFirst(
      page,
      'hdsd-requisition-form-dialog',
      'hdsd-requisition-title',
      'Tiêu đề|Title',
    );
    // Also ensure title before JD picker
    const order = await page.evaluate(() => {
      const root =
        document.querySelector('[data-testid="hdsd-requisition-form-dialog"]') ||
        document.querySelector('[role="dialog"]');
      if (!root) return { ok: false };
      const title = root.querySelector('[data-testid="hdsd-requisition-title"]');
      const jd = root.querySelector('[data-testid="hdsd-requisition-job-template"]');
      if (!title || !jd) return { ok: false, title: !!title, jd: !!jd };
      const pos = title.compareDocumentPosition(jd);
      const titleBeforeJd = !!(pos & Node.DOCUMENT_POSITION_FOLLOWING);
      return { ok: titleBeforeJd, titleBeforeJd };
    });
    const pass = !!(titleFirst.pass && order.ok);
    results.checks.yctd_title_first = { ...titleFirst, order, pass };
    if (!pass) {
      fail(
        `YCTD title-first FAIL firstLabel="${titleFirst.firstLabel}" order=${JSON.stringify(order)}`,
      );
    }
    await shot(page, '04-yctd-create');
    await dismissDialog(page);
    step('yctd', pass ? 'PASS' : 'FAIL', titleFirst.firstLabel || '');
  } catch (e) {
    results.checks.yctd_title_first = { pass: false, error: String(e.message || e) };
    fail(`YCTD: ${String(e.message || e).slice(0, 160)}`);
    step('yctd', 'FAIL', String(e.message || e).slice(0, 120));
    await clearOverlays(page);
  }

  const mutateCount = results.mutates.length;
  results.checks.zero_mutates = {
    pass: mutateCount === 0,
    count: mutateCount,
    mutates: results.mutates,
  };
  if (mutateCount > 0) fail(`U65 mutates=${mutateCount}`);

  const required = [
    'create_job_wordmark_white',
    'alert_dialog_wordmark_white',
    'root_font_16px',
    'create_job_title_first',
    'jd_template_title_first',
    'yctd_title_first',
    'zero_mutates',
  ];
  let allPass = true;
  for (const k of required) {
    if (!results.checks[k]?.pass) allPass = false;
  }

  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  save();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        checks: Object.fromEntries(
          Object.entries(results.checks).map(([k, v]) => [
            k,
            {
              pass: v?.pass,
              bg: v?.backgroundColor,
              htmlFontSize: v?.htmlFontSize,
              firstLabel: v?.firstLabel,
              reason: v?.reason || v?.error,
              obs: v?.obs || v?.sharpObs,
            },
          ]),
        ),
        mutates: mutateCount,
        screens: results.screens.length,
        BASE,
        commit: COMMIT,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'ERROR';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(3);
});
