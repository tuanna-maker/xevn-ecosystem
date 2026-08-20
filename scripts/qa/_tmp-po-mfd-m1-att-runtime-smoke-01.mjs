#!/usr/bin/env node
/**
 * PO-MFD-M1-ATT-RUNTIME-SMOKE-01 — U87 menu button inventory (U65 · U76)
 * Persona: ceo@xe.vn · companyId=main · /hr/attendance embed
 * FORBIDDEN: seed · apps/** edits
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m1-att-runtime-smoke-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m1-att-runtime-smoke-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M1-ATT-RUNTIME-SMOKE-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, EMAIL, COMPANY, TENANT, commit: COMMIT },
  l0: {},
  surfaces: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  screens: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
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
  const token = data?.accessToken ?? data?.access_token;
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
  };
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
    }
  }, session);
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 280));
    }
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const st = res.status();
    if (st >= 400) {
      results.networkBad.push({
        status: st,
        method: res.request().method(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      });
    }
  });
}

async function pageSignals(page) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const stub = /Tính năng đang được phát triển|đang được phát triển/i.test(bodyText);
  const spinners = await page.locator('.animate-spin').count();
  const hasTable = (await page.locator('table').count()) > 0;
  const hasCard = (await page.locator('[class*="Card"]').count()) > 0;
  const depthErr = results.pageErrors.some((e) => /Maximum update depth/i.test(e));
  const consoleDepth = results.consoleErrors.some((e) => /Maximum update depth/i.test(e));
  return { stub, spinners, hasTable, hasCard, depthErr: depthErr || consoleDepth, bodyLen: bodyText.length };
}

function classifyRuntime(sig, netForStep) {
  if (sig.depthErr) return 'BROKEN';
  const bad = netForStep.filter((n) => n.status >= 500);
  if (bad.length) return 'BROKEN';
  if (sig.stub) return 'STUB_UI';
  if (sig.spinners > 2 && !sig.hasTable) return 'PARTIAL';
  if (sig.bodyLen < 80) return 'PARTIAL';
  return 'LIVE';
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function clickDropdownItem(page, triggerRegex, itemLabel) {
  const trig = page.getByRole('button', { name: triggerRegex }).first();
  await trig.click({ timeout: 12_000 }).catch(async () => {
    await page.locator('button').filter({ hasText: triggerRegex }).first().click({ timeout: 8000 });
  });
  await sleep(400);
  await page.getByRole('menuitem', { name: itemLabel }).click({ timeout: 8000 }).catch(async () => {
    await page.locator('[role="menuitem"]').filter({ hasText: itemLabel }).first().click({ timeout: 8000 });
  });
}

async function probeSurface(page, row) {
  const netBefore = results.networkBad.length;
  const errBefore = results.pageErrors.length;
  const conBefore = results.consoleErrors.length;
  try {
    await row.action(page);
    await sleep(1200);
  } catch (e) {
    row.clickError = String(e).slice(0, 200);
  }
  const sig = await pageSignals(page);
  const netSlice = results.networkBad.slice(netBefore);
  const runtime = classifyRuntime(sig, netSlice);
  if (row.clickError) row.runtime = 'BROKEN';
  else row.runtime = runtime;
  row.signals = sig;
  row.newPageErrors = results.pageErrors.slice(errBefore);
  row.newConsoleErrors = results.consoleErrors.slice(conBefore);
  row.network = netSlice;
  if (runtime === 'BROKEN' || row.clickError) {
    await shot(page, row.id.replace(/[^a-z0-9-]/gi, '_').slice(0, 60));
  }
  results.surfaces.push(row);
  save();
  console.log(`${row.runtime} ${row.menu_path}`);
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  const url = q('/hr/attendance');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2000);

  const surfaces = [
    {
      id: 'tab-overview',
      menu_path: 'CC → HRM → Chấm công → Tổng quan',
      ui_surface: 'tab:overview',
      action: async (p) => {
        await p.getByRole('button', { name: /^Tổng quan$/ }).click();
      },
    },
    {
      id: 'att-clock-in',
      menu_path: 'CC → HRM → Chấm công → Chấm công (primary CTA)',
      ui_surface: 'attendance:clock-in',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-clock-in"]').click();
      },
    },
    {
      id: 'att-sheets',
      menu_path: 'CC → HRM → Chấm công → Bảng chấm công',
      ui_surface: 'attendance:sheets',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await sleep(300);
        await p.getByRole('menuitem', { name: 'Bảng chấm công' }).click();
      },
    },
    {
      id: 'att-records',
      menu_path: 'CC → HRM → Chấm công → Dữ liệu chấm công',
      ui_surface: 'attendance:records',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await p.getByRole('menuitem', { name: 'Dữ liệu chấm công' }).click();
      },
    },
    {
      id: 'att-weekly',
      menu_path: 'CC → HRM → Chấm công → Chấm công tuần',
      ui_surface: 'attendance:weekly',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await p.getByRole('menuitem', { name: 'Chấm công tuần' }).click();
      },
    },
    {
      id: 'att-summary',
      menu_path: 'CC → HRM → Chấm công → Tổng hợp công',
      ui_surface: 'attendance:summary',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await p.getByRole('menuitem', { name: 'Tổng hợp công' }).click();
      },
    },
    {
      id: 'shifts-list',
      menu_path: 'CC → HRM → Chấm công → Ca → Danh sách ca',
      ui_surface: 'shifts:list',
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Danh sách ca');
      },
    },
    {
      id: 'shifts-schedule',
      menu_path: 'CC → HRM → Chấm công → Ca → Lịch phân ca',
      ui_surface: 'shifts:schedule',
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Lịch phân ca');
      },
    },
    {
      id: 'shifts-overtime',
      menu_path: 'CC → HRM → Chấm công → Ca → Ca làm thêm',
      ui_surface: 'shifts:overtime',
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Ca làm thêm');
      },
    },
    {
      id: 'req-leave',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Đơn xin nghỉ',
      ui_surface: 'requests:leave',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đơn xin nghỉ');
      },
    },
    {
      id: 'req-late-early',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Đi muộn/về sớm',
      ui_surface: 'requests:late-early',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đăng ký đi muộn, về sớm');
      },
    },
    {
      id: 'req-overtime',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Làm thêm',
      ui_surface: 'requests:overtime',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đăng ký làm thêm');
      },
    },
    {
      id: 'req-trip',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Công tác',
      ui_surface: 'requests:business-trip',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị đi công tác');
      },
    },
    {
      id: 'req-update-att',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Cập nhật công',
      ui_surface: 'requests:update-attendance',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị cập nhật công');
      },
    },
    {
      id: 'req-change-shift',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Đổi ca',
      ui_surface: 'requests:change-shift',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị đổi ca');
      },
    },
    {
      id: 'req-leave-summary',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → TH nghỉ phép',
      ui_surface: 'requests:leave-summary',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Bảng tổng hợp nghỉ phép');
      },
    },
    {
      id: 'req-comp-summary',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → TH nghỉ bù',
      ui_surface: 'requests:compensatory-summary',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Bảng tổng hợp nghỉ bù');
      },
    },
    {
      id: 'req-leave-plan',
      menu_path: 'CC → HRM → Chấm công → Quản lý đơn → Kế hoạch nghỉ',
      ui_surface: 'requests:leave-plan',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Kế hoạch nghỉ phép');
      },
    },
    {
      id: 'tab-leave',
      menu_path: 'CC → HRM → Chấm công → Nghỉ phép (tab)',
      ui_surface: 'tab:leave',
      action: async (p) => {
        await p.getByRole('button', { name: /^Nghỉ phép$/ }).click();
      },
    },
    {
      id: 'tab-reports',
      menu_path: 'CC → HRM → Chấm công → Báo cáo',
      ui_surface: 'tab:reports',
      action: async (p) => {
        await p.getByRole('button', { name: /^Báo cáo$/ }).click();
      },
    },
    {
      id: 'tab-settings',
      menu_path: 'CC → HRM → Chấm công → Thiết lập (shell)',
      ui_surface: 'tab:settings',
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
      },
    },
  ];

  const settingsItems = [
    'Nhân viên',
    'Quy định chấm công',
    'Quy định làm thêm',
    'Quy định nghỉ',
    'Quy định đi muộn - về sớm',
    'Quy định làm đơn',
    'Người dùng',
    'Vai trò',
    'Hệ thống',
  ];
  for (const label of settingsItems) {
    const sid = `settings-${label.replace(/\s+/g, '-').slice(0, 24)}`;
    surfaces.push({
      id: sid,
      menu_path: `CC → HRM → Chấm công → Thiết lập → ${label}`,
      ui_surface: `settings:${label}`,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(400);
        await p.locator('nav button').filter({ hasText: label }).click();
      },
    });
  }

  const rulesTabs = ['Chung', 'Số công chuẩn', 'Tùy chỉnh bảng công', 'Máy chấm công', 'Chấm công trên ứng dụng'];
  for (const label of rulesTabs) {
    surfaces.push({
      id: `rules-${label.slice(0, 12)}`,
      menu_path: `CC → HRM → Chấm công → Thiết lập → Quy định → ${label}`,
      ui_surface: `settings:rules:${label}`,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(300);
        await p.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click();
        await sleep(400);
        await p.getByRole('button', { name: label }).click();
      },
    });
  }

  const stubRules = ['Chấm công máy tính bảng', 'Chấm công hộ', 'Nhân viên tự động chấm công'];
  for (const label of stubRules) {
    surfaces.push({
      id: `rules-stub-${label.slice(0, 8)}`,
      menu_path: `CC → HRM → Chấm công → Thiết lập → Quy định → ${label}`,
      ui_surface: `settings:rules:${label}`,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(300);
        await p.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click();
        await sleep(400);
        await p.getByRole('button', { name: label }).click();
      },
    });
  }

  for (const row of surfaces) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 }).catch(() => {});
    await sleep(800);
    results.consoleErrors.length = 0;
    results.pageErrors.length = 0;
    await probeSurface(page, { ...row, probedAt: ts() });
  }

  results.endedAt = ts();
  save();
  await browser.close();
  console.log('Wrote', OUT_JSON);
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.fatal = String(e);
  save();
  process.exit(1);
});
