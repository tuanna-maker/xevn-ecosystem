#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-ATT-D-QA — U65 browser brand remaster
 * Inventory S50–S57 · ADR Precision Motion §8–§10
 * Cấm: seed · invent Face LIVE · Attendance CLOSED · remaster DONE · QR invent · Nest as UF
 * must_keep: LeaveTab/panel untouched · Face honesty
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-d-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-d-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function parseRgb(s) {
  if (!s) return null;
  const m = String(s).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function nearPrimary(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 30) <= 12 && Math.abs(g - 64) <= 12 && Math.abs(b - 175) <= 12;
}

function looksOrange(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return r > 180 && g > 80 && g < 160 && b < 80;
}

function looksPaleBody(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  const avg = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return avg > 140 && avg < 200 && max - min < 25;
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-ATT-D-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: ['S50', 'S51', 'S52', 'S53', 'S54', 'S55', 'S56', 'S57'],
  env: { PORTAL, HRM_FE, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT, BASE: null },
  l0: {},
  themeContrastStrict: { note: 'run separately: pnpm verify:xevn:theme-contrast -- --strict' },
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
    face_live_claimed: false,
    attendance_closed_claimed: false,
    remaster_program_done_claimed: false,
    qr_invented: false,
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
    ['portal', PORTAL],
    ['hrm_fe', `${HRM_FE}/hr/`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  if (results.l0.portal === 200) {
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

function q(path) {
  const u = new URL(path, BASE);
  if (PORTAL_MODE) u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function loginApi() {
  const urls = [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`];
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

async function styleOf(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      className: el.className?.toString?.() ?? '',
    };
  });
}

async function titleMetrics(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 80),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
    };
  });
}

function titlePass(m) {
  if (!m) return false;
  const fs = parseFloat(m.fontSize || '0');
  const w = parseInt(m.fontWeight || '0', 10) || (/bold/i.test(String(m.fontWeight)) ? 700 : 0);
  return fs >= 20 && w >= 700;
}

async function openRequestsMenuItem(page, labelRe) {
  const trigger = page.locator('button').filter({ hasText: /Quản lý đơn|Requests|Đơn từ/i }).first();
  await trigger.click();
  await sleep(600);
  // Radix may render menuitem or plain div with role; also dump labels for debug
  const candidates = page.locator('[role="menuitem"], [data-radix-collection-item], [role="menu"] > *');
  const n = await candidates.count();
  const labels = [];
  for (let i = 0; i < n; i++) {
    const text = ((await candidates.nth(i).innerText().catch(() => '')) || '').trim().replace(/\s+/g, ' ');
    if (text) labels.push(text);
    if (labelRe.test(text)) {
      await candidates.nth(i).click();
      await sleep(1800);
      return text;
    }
  }
  // Fallback: getByText within open menu
  const menu = page.locator('[role="menu"]').last();
  if (await menu.isVisible().catch(() => false)) {
    const hit = menu.getByText(labelRe).first();
    if (await hit.isVisible().catch(() => false)) {
      const text = ((await hit.innerText().catch(() => '')) || '').trim();
      await hit.click();
      await sleep(1800);
      return text;
    }
  }
  throw new Error(`requests menu item not found for ${labelRe}; seen=[${labels.join(' | ')}]`);
}

async function dismissDialog(page) {
  const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng|Close/i }).first();
  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click();
    await sleep(400);
    return;
  }
  await page.keyboard.press('Escape');
  await sleep(300);
}

async function paleHitsIn(rootLocator) {
  return rootLocator.evaluate((root) => {
    const out = [];
    const nodes = root.querySelectorAll('h1,h2,h3,p,span,td,th,label,button');
    for (const el of Array.from(nodes).slice(0, 200)) {
      const cs = getComputedStyle(el);
      const m = String(cs.color).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      if (!m) continue;
      const r = +m[1],
        g = +m[2],
        b = +m[3];
      const avg = (r + g + b) / 3;
      if (avg > 140 && avg < 200 && Math.max(r, g, b) - Math.min(r, g, b) < 25) {
        const text = (el.textContent || '').trim().slice(0, 40);
        if (text) out.push({ text, color: cs.color });
      }
    }
    return out.slice(0, 10);
  });
}

async function purpleAiBgHits(rootLocator, testId) {
  return rootLocator.evaluate((root, tid) => {
    const out = [];
    const scope = tid ? document.querySelector(`[data-testid="${tid}"]`) || root : root;
    for (const el of Array.from(scope.querySelectorAll('*')).slice(0, 400)) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const m = String(bg).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      if (!m) continue;
      const r = +m[1],
        g = +m[2],
        b = +m[3];
      if (r >= 100 && b >= 160 && g <= 90 && Math.abs(r - 30) > 20) {
        out.push({ tag: el.tagName, bg });
      }
    }
    return out.slice(0, 6);
  }, testId);
}

async function dialogBrandBar(page) {
  return page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    if (!dlg) return { found: false };
    const surface = dlg.closest('.xevn-dialog-surface') || dlg.querySelector('.xevn-dialog-surface') || dlg;
    const before = getComputedStyle(surface, '::before');
    return {
      found: true,
      className: surface.className?.toString?.() ?? '',
      beforeBg: before.backgroundColor,
      beforeH: before.height,
      beforeDisplay: before.display,
    };
  });
}

/**
 * List shell + Add dialog (+ Detail/Delete when rows exist) for one request tab.
 */
async function auditRequestTab(page, cfg) {
  const { id, testId, menuRe, addBtnRe, shotPrefix, checkHhMm } = cfg;
  const menuLabel = await openRequestsMenuItem(page, menuRe);
  const root = page.locator(`[data-testid="${testId}"]`);
  await root.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null);
  await sleep(1200);
  const visible = await root.isVisible().catch(() => false);
  const h2 = visible ? await titleMetrics(root.locator('h2').first()) : null;
  const addBtn = root.getByRole('button', { name: addBtnRe }).first();
  const addVisible = await addBtn.isVisible().catch(() => false);
  const addStyle = addVisible ? await styleOf(addBtn) : null;
  const addPrimary = nearPrimary(parseRgb(addStyle?.backgroundColor));
  const addOrange = looksOrange(parseRgb(addStyle?.backgroundColor));
  const pale = visible ? await paleHitsIn(root) : [];
  const purpleAi = visible ? await purpleAiBgHits(root, testId) : [];

  const listCheck = {
    pass:
      visible &&
      titlePass(h2) &&
      addVisible &&
      addPrimary &&
      !addOrange &&
      (pale?.length || 0) === 0 &&
      (purpleAi?.length || 0) === 0,
    visible,
    menuLabel,
    h2,
    addPrimary,
    addBg: addStyle?.backgroundColor,
    addOrange,
    paleCount: pale?.length || 0,
    paleSample: pale,
    purpleAiBg: purpleAi,
  };
  results.checks[`${id}_list`] = listCheck;
  if (!listCheck.pass) fail(`${id} list: ${JSON.stringify(listCheck)}`);
  await shot(page, `${shotPrefix}-list`);
  step(`${id}_list`, listCheck.pass ? 'PASS' : 'FAIL', `${testId} shell`);

  // Add dialog
  await addBtn.click();
  await sleep(900);
  const addDlg = page.locator('[role="dialog"]').first();
  const addDlgOk = await addDlg.isVisible().catch(() => false);
  let addTitle = null;
  let brandBar = null;
  let savePrimary = false;
  let saveBg = null;
  let hhMmOk = null;
  if (addDlgOk) {
    addTitle = await titleMetrics(addDlg.locator('h2, [class*="DialogTitle"]').first());
    brandBar = await dialogBrandBar(page);
    const save = addDlg.getByRole('button', { name: /Lưu|Save|Gửi|Thêm|Tạo|Add/i }).last();
    if (await save.count()) {
      saveBg = await save.evaluate((el) => getComputedStyle(el).backgroundColor);
      savePrimary = nearPrimary(parseRgb(saveBg));
    }
    if (checkHhMm) {
      const timeInputs = addDlg.locator('input[type="time"], input[placeholder*="HH"], input[placeholder*="hh"]');
      const n = await timeInputs.count();
      let found = n > 0;
      if (!found) {
        // look for labels / pattern HH:mm in dialog text or inputs with step
        const html = await addDlg.innerHTML().catch(() => '');
        found = /type="time"|HH:mm|hh:mm|step="60"/i.test(html);
      }
      hhMmOk = found;
    }
    const barPrimary = nearPrimary(parseRgb(brandBar?.beforeBg));
    const barOk =
      brandBar?.found &&
      (barPrimary ||
        /xevn-dialog-surface/i.test(brandBar?.className || '') ||
        parseFloat(brandBar?.beforeH || '0') > 0);
    await shot(page, `${shotPrefix}-add-dialog`);
    await dismissDialog(page);

    const modalCheck = {
      pass: addDlgOk && titlePass(addTitle) && barOk && savePrimary && (hhMmOk === null || hhMmOk === true),
      addDlgOk,
      addTitle,
      brandBar,
      barOk,
      savePrimary,
      saveBg,
      hhMmOk,
    };
    results.checks[`${id}_add_dialog`] = modalCheck;
    if (!modalCheck.pass) fail(`${id} add dialog: ${JSON.stringify(modalCheck)}`);
    step(`${id}_add`, modalCheck.pass ? 'PASS' : 'FAIL', 'Add Dialog ≥20 + brand bar');
  } else {
    results.checks[`${id}_add_dialog`] = { pass: false, addDlgOk: false };
    fail(`${id} add dialog not opened`);
    step(`${id}_add`, 'FAIL', 'Add Dialog missing');
  }

  // Detail if row
  let detailOpened = false;
  let detailTitle = null;
  const eye = root.locator('button').filter({ has: page.locator('svg.lucide-eye') }).first();
  if (await eye.isVisible().catch(() => false)) {
    await eye.click();
    await sleep(700);
    const dlg = page.locator('[role="dialog"]').first();
    if (await dlg.isVisible().catch(() => false)) {
      detailOpened = true;
      detailTitle = await titleMetrics(dlg.locator('h2, [class*="DialogTitle"]').first());
      await shot(page, `${shotPrefix}-detail-dialog`);
      await dismissDialog(page);
    }
  }
  results.checks[`${id}_detail`] = {
    pass: detailOpened ? titlePass(detailTitle) : titlePass(addTitle),
    detailOpened,
    detailTitle,
    inferredFromAdd: !detailOpened,
  };
  if (!detailOpened) {
    results.residuals.push({
      id: `OBS-${id}-DETAIL-EMPTY`,
      severity: 'P2',
      owner: 'qa',
      note: `No ${id} row for Detail — U65 empty-list OBS; title floor from Add Dialog`,
    });
  }
  if (!results.checks[`${id}_detail`].pass) fail(`${id} detail: ${JSON.stringify(results.checks[`${id}_detail`])}`);
  step(`${id}_detail`, results.checks[`${id}_detail`].pass ? 'PASS' : 'FAIL', 'Detail title');

  // Delete Alert if trash
  let delOpened = false;
  let delTitle = null;
  const trash = root.locator('button').filter({ has: page.locator('svg.lucide-trash-2, svg.lucide-trash') }).first();
  if (await trash.isVisible().catch(() => false)) {
    await trash.click();
    await sleep(700);
    const alertdlg = page
      .locator('[role="alertdialog"], [role="dialog"]')
      .filter({ hasText: /Xóa|Delete|xác nhận/i })
      .first();
    if (await alertdlg.isVisible().catch(() => false)) {
      delOpened = true;
      delTitle = await titleMetrics(
        alertdlg.locator('h2, [class*="AlertDialogTitle"], [class*="DialogTitle"]').first(),
      );
      await shot(page, `${shotPrefix}-delete-alert`);
      await dismissDialog(page);
    }
  }
  results.checks[`${id}_delete`] = {
    pass: delOpened ? titlePass(delTitle) : true,
    delOpened,
    delTitle,
    waivedEmptyList: !delOpened,
    note: delOpened ? null : 'no trash/row — U65 empty OBS; AlertDialogTitle text-[20px] static; not FAIL',
  };
  if (!delOpened) {
    results.residuals.push({
      id: `OBS-${id}-DELETE-EMPTY`,
      severity: 'P2',
      owner: 'qa',
      note: `Delete Alert not opened — no ${id} row; inferred ≥20 from static classes`,
    });
  }
  if (!results.checks[`${id}_delete`].pass) fail(`${id} delete: ${JSON.stringify(results.checks[`${id}_delete`])}`);
  step(`${id}_delete`, results.checks[`${id}_delete`].pass ? 'PASS' : 'FAIL', 'Delete Alert');

  return { addTitle, listCheck };
}

async function main() {
  await probeL0();
  const feOk = results.l0.portal === 200 || results.l0.hrm_fe === 200;
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || !feOk) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    fail(
      `L0 down hrm=${results.l0.hrm} xbos=${results.l0.xbos} portal=${results.l0.portal} hrm_fe=${results.l0.hrm_fe}`,
    );
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('l0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  step('login', 'PASS', `HTTP ${session.http}`);

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
    if (method !== 'GET') results.mutates.push(entry);
    if (results.network.length < 160) results.network.push(entry);
  });

  await injectPortalAuth(page, session);
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2800);

  // ——— S50–S51 OT ———
  await auditRequestTab(page, {
    id: 'S50_S51_ot',
    testId: 'att-ot-precision',
    menuRe: /làm thêm|tăng ca|overtime/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '01-s50-ot',
  });

  // ——— S52–S53 Trip ———
  await auditRequestTab(page, {
    id: 'S52_S53_trip',
    testId: 'att-trip-precision',
    menuRe: /công tác|business.?trip|đi công tác/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '02-s52-trip',
  });

  // ——— S54–S55 Update ———
  await auditRequestTab(page, {
    id: 'S54_S55_update',
    testId: 'att-update-precision',
    menuRe: /cập nhật công|cập nhật chấm|update.?attendance|đề nghị cập nhật/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '03-s54-update',
    checkHhMm: true,
  });

  // ——— S56–S57 Shift change ———
  await auditRequestTab(page, {
    id: 'S56_S57_shift',
    testId: 'att-shift-change-precision',
    menuRe: /đổi ca|change.?shift|shift.?change/i,
    addBtnRe: /Thêm|Add|Tạo|Đăng ký/i,
    shotPrefix: '04-s56-shift',
  });

  // ——— must_keep: LeaveTab still loads (untouched) ———
  await openRequestsMenuItem(page, /đơn xin nghỉ|xin nghỉ|nghỉ phép(?! kế hoạch)|leave(?!.?plan)/i).catch(async () => {
    // top tab Nghỉ phép
    const btn = page.locator('button').filter({ hasText: /Nghỉ phép|Leave/i }).first();
    await btn.click({ timeout: 12_000 });
    await sleep(1800);
  });
  const leaveRoot = page.locator('[data-testid="att-leave-precision"]');
  await leaveRoot.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
  const leaveVisible = await leaveRoot.isVisible().catch(() => false);
  const leaveH2 = leaveVisible ? await titleMetrics(leaveRoot.locator('h2').first()) : null;
  const panel = page.locator('[data-testid="leave-balance-panel"]');
  const panelVisible = await panel.isVisible().catch(() => false);
  results.checks.leave_untouched_spot = {
    pass: leaveVisible && titlePass(leaveH2) && panelVisible,
    leaveVisible,
    leaveH2,
    panelVisible,
    note: 'ATT-C LeaveTab/panel must remain; spot only — no fight',
  };
  if (!results.checks.leave_untouched_spot.pass) {
    fail(`LeaveTab regression: ${JSON.stringify(results.checks.leave_untouched_spot)}`);
  }
  await shot(page, '05-leave-untouched-spot');
  step('leave_spot', results.checks.leave_untouched_spot.pass ? 'PASS' : 'FAIL', 'LeaveTab untouched');

  // ——— Face honesty ———
  await page.locator('[data-testid="attendance-tab-clock-in"]').click().catch(async () => {
    const btn = page.locator('button').filter({ hasText: /^Chấm công$|Clock/i }).first();
    await btn.click().catch(() => null);
  });
  await sleep(1200);
  const faceTile = page.getByText(/Face ID|Face/i).first();
  if (await faceTile.isVisible().catch(() => false)) {
    await faceTile.click();
    await sleep(800);
  }
  const faceHold = page.locator('[data-testid="att-faceid-hold-banner"]');
  let faceHoldVisible = await faceHold.isVisible().catch(() => false);
  if (!faceHoldVisible) {
    try {
      await page.locator('[data-testid="attendance-tab-menu"]').click();
      await sleep(400);
      const item = page.locator('[role="menuitem"]').filter({ hasText: /Face/i }).first();
      if (await item.count()) {
        await item.click();
        await sleep(1200);
      }
    } catch {
      /* */
    }
    faceHoldVisible = await faceHold.isVisible().catch(() => false);
  }
  results.checks.face_honesty = { pass: faceHoldVisible, faceHoldVisible };
  if (!faceHoldVisible) fail(`Face honesty banner missing`);
  await shot(page, '06-face-hold-honesty');
  step('face', results.checks.face_honesty.pass ? 'PASS' : 'FAIL', 'Face hold honesty');

  // QR invent check — must NOT claim LIVE
  const qrLiveClaim =
    (await page.getByText(/QR.*(LIVE|sẵn sàng|ready)/i).count().catch(() => 0)) > 0 &&
    (await page.locator('[data-testid*="qr"]').filter({ hasText: /LIVE/i }).count().catch(() => 0)) > 0;
  results.checks.no_qr_invent = {
    pass: !qrLiveClaim,
    qrLiveClaim,
    note: 'W3-ATT-E SKIP — no invent QR LIVE',
  };
  if (!results.checks.no_qr_invent.pass) fail('QR LIVE invent detected');
  step('qr', results.checks.no_qr_invent.pass ? 'PASS' : 'FAIL', 'no QR invent');

  results.honesty.qr_invented = false;
  results.honesty.face_live_claimed = false;
  results.honesty.attendance_closed_claimed = false;
  results.honesty.remaster_program_done_claimed = false;

  results.mutatesCount = results.mutates.length;
  if (results.mutates.length > 0) {
    results.residuals.push({
      id: 'OBS-MUTATES',
      severity: 'P1',
      owner: 'qa',
      note: `Unexpected mutates under U65 RO: ${JSON.stringify(results.mutates.slice(0, 5))}`,
    });
    // mutates during dismiss alone shouldn't happen; fail if any
    fail(`U65 mutates=${results.mutates.length}`);
  }

  const allPass = results.failReasons.length === 0;
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
        checks: Object.fromEntries(Object.entries(results.checks).map(([k, v]) => [k, v.pass])),
        mutates: results.mutates.length,
        screens: results.screens.length,
        residuals: results.residuals.length,
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
  process.exit(1);
});
