#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-ATT-G2-QA — U65 browser brand remaster
 * Inventory S76–S85 · ADR §8–§10
 * Path: ceo@xe.vn → Chấm công → Thiết lập (hrm_fe :8080 fallback OK)
 * Cấm: seed · Nest as UF · Face LIVE invent · PROP-03e invent · Attendance CLOSED · remaster DONE
 * Prior: ATT-G1-QA PASS
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-g2-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa');
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

function nearText(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 17) <= 20 && Math.abs(g - 24) <= 20 && Math.abs(b - 39) <= 20;
}

function nearPrimary(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return Math.abs(r - 30) <= 12 && Math.abs(g - 64) <= 12 && Math.abs(b - 175) <= 12;
}

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-ATT-G2-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  inventory: [
    'S76',
    'S77',
    'S78',
    'S79',
    'S80',
    'S81',
    'S82',
    'S83',
    'S84',
    'S85',
  ],
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
    prop_03e_invented: false,
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

async function titleMetrics(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 120),
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

async function purpleAiBgHits(rootLocator) {
  return rootLocator.evaluate((root) => {
    const out = [];
    for (const el of Array.from(root.querySelectorAll('*')).slice(0, 400)) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const m = String(bg).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
      if (!m) continue;
      const r = +m[1],
        g = +m[2],
        b = +m[3];
      // purple/violet AI — exclude primary #1E40AF; also skip orange AI accents
      if (r >= 100 && b >= 160 && g <= 90 && Math.abs(r - 30) > 20) {
        out.push({ tag: el.tagName, bg, text: (el.textContent || '').trim().slice(0, 40) });
      }
      // orange AI CTA-ish (high R, mid G, low B)
      if (r >= 220 && g >= 100 && g <= 170 && b <= 80) {
        out.push({ tag: el.tagName, bg, kind: 'orange', text: (el.textContent || '').trim().slice(0, 40) });
      }
    }
    return out.slice(0, 8);
  });
}

async function clickTopTab(page, labelRe) {
  const exact = page.getByRole('button', { name: labelRe }).first();
  if (await exact.isVisible().catch(() => false)) {
    await exact.click({ timeout: 15_000 });
    await sleep(1400);
    return 'role';
  }
  const byText = page.locator('button').filter({ hasText: labelRe }).first();
  if (await byText.count()) {
    await byText.scrollIntoViewIfNeeded().catch(() => {});
    await byText.click({ force: true, timeout: 15_000 });
    await sleep(1400);
    return 'force';
  }
  throw new Error(`top tab not found: ${labelRe}`);
}

async function clickSidebar(page, labelRe) {
  const shell = page.locator('[data-testid="att-settings-shell-precision"]');
  const btn = shell.locator('nav button').filter({ hasText: labelRe }).first();
  await btn.waitFor({ state: 'visible', timeout: 15_000 });
  await btn.click();
  await sleep(1200);
}

async function assertRulesStub(page, tabId, opts) {
  const { expectGd2 = false, expectAsIs = false, expectStub = true } = opts;
  const tab = page.locator(`[data-testid="hdsd-att-rules-tab-${tabId}"]`);
  await tab.waitFor({ state: 'visible', timeout: 15_000 });
  await tab.click();
  await sleep(1200);

  const root = page.locator(`[data-testid="att-rules-${tabId}-stub-precision"]`);
  await root.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
  const visible = await root.isVisible().catch(() => false);
  const banner = page.locator(`[data-testid="att-rules-${tabId}-hold-banner"]`);
  const bannerVisible = await banner.isVisible().catch(() => false);
  const title = bannerVisible
    ? await titleMetrics(banner.locator('.text-\\[20px\\], [class*="text-[20px]"]').first())
    : null;
  const body = bannerVisible ? ((await banner.innerText()) || '').slice(0, 280) : '';
  const hasStub = expectStub ? /STUB/i.test(body) || (await banner.locator('text=/STUB/i').count()) > 0 : true;
  const hasGd2 = expectGd2
    ? /GĐ2|HOLD|Giai đoạn/i.test(body) || (await banner.locator('text=/GĐ2|HOLD/i').count()) > 0
    : true;
  const hasAsIs = expectAsIs
    ? /ACCEPTED_AS_IS/i.test(body) || (await banner.locator('text=/ACCEPTED_AS_IS/i').count()) > 0
    : true;
  // no invent LIVE form inputs
  const liveInputs = visible
    ? await root.locator('input:not([type="hidden"]), textarea, select').count()
    : -1;
  const purple = visible ? await purpleAiBgHits(root) : [];
  const textOk = title ? nearText(parseRgb(title.color)) : false;
  const mutatesBefore = results.mutates.length;
  // force-click empty card — must remain no-op
  if (visible) {
    await root.locator('Card, .rounded-card, [class*="Card"]').first().click({ force: true }).catch(() => {});
    await sleep(200);
  }
  const pass =
    visible &&
    bannerVisible &&
    titlePass(title) &&
    hasStub &&
    hasGd2 &&
    hasAsIs &&
    liveInputs === 0 &&
    purple.length === 0 &&
    results.mutates.length === mutatesBefore;
  return {
    pass,
    visible,
    bannerVisible,
    title,
    textOk,
    hasStub,
    hasGd2,
    hasAsIs,
    liveInputs,
    purpleHits: purple,
    mutatesDelta: results.mutates.length - mutatesBefore,
    bodySnippet: body.slice(0, 140),
  };
}

async function assertCfgRedirect(page, sidebarId, labelRe) {
  await clickSidebar(page, labelRe);
  const root = page.locator(`[data-testid="att-cfg-redirect-${sidebarId}-precision"]`);
  await root.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
  const visible = await root.isVisible().catch(() => false);
  const banner = page.locator(`[data-testid="att-cfg-redirect-${sidebarId}-banner"]`);
  const bannerVisible = await banner.isVisible().catch(() => false);
  const title = bannerVisible
    ? await titleMetrics(banner.locator('.text-\\[20px\\], [class*="text-[20px]"]').first())
    : null;
  const body = bannerVisible ? ((await banner.innerText()) || '').slice(0, 280) : '';
  const hasCfg = /CFG/i.test(body) || (await banner.locator('text=/CFG/i').count()) > 0;
  const link = page.locator(`[data-testid="att-cfg-redirect-${sidebarId}-link"]`);
  const linkVisible = await link.isVisible().catch(() => false);
  const href = linkVisible ? (await link.getAttribute('href')) || '' : '';
  const hrefOk = href === '/settings' || href.endsWith('/settings');
  // no invent persist form on Attendance
  const liveInputs = visible
    ? await root.locator('input:not([type="hidden"]), textarea, select, button[type="submit"]').count()
    : -1;
  const purple = visible ? await purpleAiBgHits(root) : [];
  const linkColor = linkVisible
    ? await link.evaluate((el) => getComputedStyle(el).color)
    : null;
  const primaryOk = linkVisible ? nearPrimary(parseRgb(linkColor)) : false;
  const mutatesBefore = results.mutates.length;
  // Do NOT navigate away — only assert href honesty (U65 stay on Attendance)
  const pass =
    visible &&
    bannerVisible &&
    titlePass(title) &&
    hasCfg &&
    linkVisible &&
    hrefOk &&
    liveInputs === 0 &&
    purple.length === 0 &&
    results.mutates.length === mutatesBefore;
  return {
    pass,
    visible,
    bannerVisible,
    title,
    hasCfg,
    linkVisible,
    href,
    hrefOk,
    primaryOk,
    linkColor,
    liveInputs,
    purpleHits: purple,
    mutatesDelta: results.mutates.length - mutatesBefore,
    bodySnippet: body.slice(0, 140),
  };
}

async function assertSettingsStub(page, sidebarId, labelRe) {
  await clickSidebar(page, labelRe);
  const root = page.locator(`[data-testid="att-settings-${sidebarId}-stub-precision"]`);
  await root.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => null);
  const visible = await root.isVisible().catch(() => false);
  const banner = page.locator(`[data-testid="att-settings-${sidebarId}-hold-banner"]`);
  const bannerVisible = await banner.isVisible().catch(() => false);
  const title = bannerVisible
    ? await titleMetrics(banner.locator('.text-\\[20px\\], [class*="text-[20px]"]').first())
    : null;
  const body = bannerVisible ? ((await banner.innerText()) || '').slice(0, 280) : '';
  const hasStub = /STUB/i.test(body) || (await banner.locator('text=/STUB/i').count()) > 0;
  const liveInputs = visible
    ? await root.locator('input:not([type="hidden"]), textarea, select, button[type="submit"]').count()
    : -1;
  const purple = visible ? await purpleAiBgHits(root) : [];
  const mutatesBefore = results.mutates.length;
  if (visible) {
    await root.locator('.rounded-card, [class*="Card"]').first().click({ force: true }).catch(() => {});
    await sleep(200);
  }
  const pass =
    visible &&
    bannerVisible &&
    titlePass(title) &&
    hasStub &&
    liveInputs === 0 &&
    purple.length === 0 &&
    results.mutates.length === mutatesBefore;
  return {
    pass,
    visible,
    bannerVisible,
    title,
    hasStub,
    liveInputs,
    purpleHits: purple,
    mutatesDelta: results.mutates.length - mutatesBefore,
    bodySnippet: body.slice(0, 140),
  };
}

async function main() {
  await probeL0();
  const feOk = results.l0.portal === 200 || results.l0.hrm_fe === 200;
  const l0ok = results.l0.hrm === 200 && results.l0.xbos === 200 && feOk;
  results.checks.L0 = { pass: l0ok, ...results.l0 };
  if (!l0ok) {
    fail(`L0 unhealthy: ${JSON.stringify(results.l0)}`);
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    console.log(JSON.stringify(results, null, 2));
    process.exit(2);
  }
  step('L0', 'PASS', JSON.stringify(results.l0));

  const session = await loginApi();
  results.env.loginHttp = session.http;
  results.env.loginVia = session.loginVia;
  step('login', 'PASS', `HTTP ${session.http}`);

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  page.on('pageerror', (e) => {
    results.pageErrors.push(String(e.message || e).slice(0, 200));
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 160),
    };
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) results.mutates.push(entry);
    if (results.network.length < 120) results.network.push(entry);
  });

  try {
    await injectPortalAuth(page, session);
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(3000);

    // ——— Spot Face HOLD + PROP-03e SKIP (ATT-G1 non-regression) ———
    await page.locator('[data-testid="attendance-tab-clock-in"]').click();
    await sleep(1200);
    const faceMethod = page.locator('[data-testid="clock-in-method-faceid"]');
    if (await faceMethod.isVisible().catch(() => false)) {
      await faceMethod.click();
      await sleep(1000);
    }
    const faceBanner = page.locator('[data-testid="att-faceid-hold-banner"]');
    const faceBannerVisible = await faceBanner.isVisible().catch(() => false);
    const shell = page.locator('[data-testid="att-faceid-shell-disabled"]');
    const shellVisible = await shell.isVisible().catch(() => false);
    const faceLiveClaim = await page
      .getByText(/Face\s*LIVE|Nhận diện khuôn mặt đang hoạt động|Face ID LIVE/i)
      .count()
      .catch(() => 0);
    const qrMethod = page.locator('[data-testid="clock-in-method-qrcode"]');
    let propSkipVisible = false;
    let employeeQrLive = false;
    if (await qrMethod.isVisible().catch(() => false)) {
      await qrMethod.click();
      await sleep(800);
      propSkipVisible = await page
        .locator('[data-testid="att-prop-03e-qr-card-skip"]')
        .isVisible()
        .catch(() => false);
      employeeQrLive =
        (await page.locator('[data-testid*="employee-qr"], [data-testid*="EmployeeQR"]').count().catch(() => 0)) >
        0;
    }
    results.honesty.face_live_claimed = faceLiveClaim > 0;
    results.honesty.prop_03e_invented = employeeQrLive;
    results.checks.spot_face_prop03e = {
      pass: faceBannerVisible && shellVisible && faceLiveClaim === 0 && propSkipVisible && !employeeQrLive,
      faceBannerVisible,
      shellVisible,
      faceLiveClaim,
      propSkipVisible,
      employeeQrLive,
    };
    if (!results.checks.spot_face_prop03e.pass)
      fail(`spot Face/PROP-03e: ${JSON.stringify(results.checks.spot_face_prop03e)}`);
    await shot(page, '00-spot-face-prop03e');
    step('spot_face_prop03e', results.checks.spot_face_prop03e.pass ? 'PASS' : 'FAIL', 'Face HOLD + PROP-03e SKIP');

    // ——— Settings shell ———
    await clickTopTab(page, /^(Thiết lập|Cài đặt|Settings)$/i);
    const settingsShell = page.locator('[data-testid="att-settings-shell-precision"]');
    await settingsShell.waitFor({ state: 'visible', timeout: 20_000 });
    await clickSidebar(page, /Quy định chấm công|Quy tắc|Rules/i);
    await sleep(1000);
    const rulesShell = page.locator('[data-testid="att-settings-rules-precision"]');
    const rulesShellVisible = await rulesShell.isVisible().catch(() => false);
    results.checks.rules_shell = {
      pass: rulesShellVisible,
      rulesShellVisible,
    };
    if (!rulesShellVisible) fail('rules shell att-settings-rules-precision missing');
    step('rules_shell', rulesShellVisible ? 'PASS' : 'FAIL', 'settings → rules');

    // ——— S76 tablet STUB ———
    const s76 = await assertRulesStub(page, 'tablet', { expectStub: true, expectGd2: false, expectAsIs: false });
    results.checks.S76_tablet_stub = s76;
    if (!s76.pass) fail(`S76: ${JSON.stringify(s76)}`);
    await shot(page, '01-s76-tablet-stub');
    step('S76', s76.pass ? 'PASS' : 'FAIL', 'tablet STUB');

    // ——— S77 proxy GĐ2 STUB ———
    const s77 = await assertRulesStub(page, 'proxy', { expectStub: false, expectGd2: true, expectAsIs: false });
    // proxy shows GĐ2 badge (not STUB text) per FE
    results.checks.S77_proxy_gd2 = s77;
    if (!s77.pass) fail(`S77: ${JSON.stringify(s77)}`);
    await shot(page, '02-s77-proxy-gd2');
    step('S77', s77.pass ? 'PASS' : 'FAIL', 'proxy GĐ2 STUB');

    // ——— S78 auto STUB + ACCEPTED_AS_IS ———
    const s78 = await assertRulesStub(page, 'auto', { expectStub: true, expectGd2: false, expectAsIs: true });
    results.checks.S78_auto_asis = s78;
    if (!s78.pass) fail(`S78: ${JSON.stringify(s78)}`);
    await shot(page, '03-s78-auto-asis');
    step('S78', s78.pass ? 'PASS' : 'FAIL', 'auto STUB ACCEPTED_AS_IS');

    // ——— S79–S82 CFG redirect ———
    const cfgCases = [
      ['overtime', /Quy định làm thêm|Overtime/i, 'S79_cfg_overtime'],
      ['leave-rules', /Quy định nghỉ|Leave rules/i, 'S80_cfg_leave'],
      ['late-early', /đi muộn|về sớm|Late/i, 'S81_cfg_late_early'],
      ['request-rules', /làm đơn|Request rules|đơn từ/i, 'S82_cfg_request'],
    ];
    let shotN = 4;
    for (const [id, re, key] of cfgCases) {
      const c = await assertCfgRedirect(page, id, re);
      results.checks[key] = c;
      if (!c.pass) fail(`${key}: ${JSON.stringify(c)}`);
      await shot(page, `0${shotN}-s${79 + (shotN - 4)}-cfg-${id}`);
      step(key, c.pass ? 'PASS' : 'FAIL', `CFG redirect ${id} → /settings`);
      shotN++;
    }

    // ——— S83–S85 users/roles/system STUB ———
    const stubCases = [
      ['users', /Người dùng|Users/i, 'S83_users_stub'],
      ['roles', /Vai trò|Roles/i, 'S84_roles_stub'],
      ['system', /Hệ thống|System/i, 'S85_system_stub'],
    ];
    for (const [id, re, key] of stubCases) {
      const c = await assertSettingsStub(page, id, re);
      results.checks[key] = c;
      if (!c.pass) fail(`${key}: ${JSON.stringify(c)}`);
      await shot(page, `0${shotN}-s${83 + (shotN - 8)}-${id}-stub`);
      step(key, c.pass ? 'PASS' : 'FAIL', `${id} STUB`);
      shotN++;
    }

    // ——— Honesty gates ———
    const closedClaim = await page.getByText(/Attendance\s*CLOSED|Chấm công đã đóng|ATT CLOSED/i).count();
    const remasterDone = await page.getByText(/remaster\s*DONE|UI brand DONE/i).count();
    results.honesty.attendance_closed_claimed = closedClaim > 0;
    results.honesty.remaster_program_done_claimed = remasterDone > 0;
    results.checks.honesty_gates = {
      pass:
        !results.honesty.face_live_claimed &&
        !results.honesty.attendance_closed_claimed &&
        !results.honesty.remaster_program_done_claimed &&
        !results.honesty.prop_03e_invented &&
        results.mutates.length === 0,
      mutates: results.mutates.length,
      ...results.honesty,
    };
    if (!results.checks.honesty_gates.pass) fail(`honesty: ${JSON.stringify(results.checks.honesty_gates)}`);
    step('honesty', results.checks.honesty_gates.pass ? 'PASS' : 'FAIL', 'no invent CLOSED/LIVE/DONE');

    await shot(page, '99-final');
  } catch (e) {
    fail(`harness exception: ${String(e?.message || e).slice(0, 240)}`);
    await shot(page, '99-exception').catch(() => {});
  } finally {
    const checkVals = Object.values(results.checks);
    const allPass =
      results.failReasons.length === 0 && checkVals.length > 0 && checkVals.every((c) => c && c.pass);
    results.verdict = allPass ? 'PASS' : 'FAIL';
    results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    results.summary = {
      checksPass: checkVals.filter((c) => c?.pass).length,
      checksTotal: checkVals.length,
      mutates: results.mutates.length,
      failReasons: results.failReasons,
    };
    save();
    if (allPass) {
      const passPath = OUT_JSON.replace(/\.json$/, '.PASS.json');
      try {
        writeFileSync(passPath, JSON.stringify(results, null, 2));
      } catch {
        /* */
      }
    }
    await browser.close().catch(() => {});
    console.log(
      JSON.stringify(
        {
          verdict: results.verdict,
          ack_status: results.ack_status,
          failReasons: results.failReasons,
          summary: results.summary,
          l0: results.l0,
          mutates: results.mutates.length,
        },
        null,
        2,
      ),
    );
    process.exit(allPass ? 0 : 1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
