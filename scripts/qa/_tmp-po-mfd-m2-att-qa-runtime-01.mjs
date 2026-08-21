#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-QA-RUNTIME-01 — U65 read-only fidelity runtime refresh
 * Persona: ceo@xe.vn · companyId=main · /hr/attendance embed
 * Prefer Network GETs; NO mutate CTAs (Tạo/Lưu/Duyệt/POST records)
 * Face #9 GĐ2-HOLD spot only · GPS method open only (no check-in POST)
 * FORBIDDEN: seed · apps/** edits · invent Attendance CLOSED
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-qa-runtime-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-qa-runtime-01');
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
  work_item_id: 'PO-MFD-M2-ATT-QA-RUNTIME-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  read_only: true,
  uat_done: false,
  attendance_closed: false,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, commit: COMMIT },
  portal_url: null,
  l0: {},
  surfaces: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  networkOk: [],
  mutateBlocked: [],
  screens: [],
  rollup: {},
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

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
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

function shortUrl(u) {
  return u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320);
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
  page.on('request', (req) => {
    const m = req.method();
    const u = req.url();
    if (!/\/api\/hrm\//.test(u)) return;
    if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') {
      results.mutateBlocked.push({
        method: m,
        url: shortUrl(u),
        at: ts(),
        note: 'unexpected non-GET during read-only seat',
      });
    }
  });
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const st = res.status();
    const method = res.request().method();
    const entry = { status: st, method, url: shortUrl(u), at: ts() };
    if (st >= 400) results.networkBad.push(entry);
    else if (method === 'GET') results.networkOk.push(entry);
  });
}

async function pageSignals(page) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const stub = /Tính năng đang được phát triển|đang được phát triển/i.test(bodyText);
  const gd2Hold = /GĐ2|Giai đoạn 2|đang phát triển.*khuôn mặt|Face.*GĐ2/i.test(bodyText);
  const spinners = await page.locator('.animate-spin').count();
  const hasTable = (await page.locator('table').count()) > 0;
  const hasCard = (await page.locator('[class*="Card"]').count()) > 0;
  const depthErr = results.pageErrors.some((e) => /Maximum update depth/i.test(e));
  const consoleDepth = results.consoleErrors.some((e) => /Maximum update depth/i.test(e));
  const errorBanner = /HRM API Sync ERROR|request failed \(5\d\d\)/i.test(bodyText);
  return {
    stub,
    gd2Hold,
    spinners,
    hasTable,
    hasCard,
    depthErr: depthErr || consoleDepth,
    errorBanner,
    bodyLen: bodyText.length,
  };
}

function classifyRuntime(sig, netSlice, okSlice, extras = {}) {
  if (extras.force) return extras.force;
  if (sig.depthErr || sig.errorBanner) return 'BROKEN';
  const bad5xx = netSlice.filter((n) => n.status >= 500);
  if (bad5xx.length) return 'BROKEN';
  if (sig.stub) return 'STUB_UI';
  if (extras.partialHint) return 'PARTIAL';
  if (sig.spinners > 2 && !sig.hasTable && !sig.hasCard) return 'PARTIAL';
  if (sig.bodyLen < 80) return 'PARTIAL';
  if (okSlice.length === 0 && extras.requireNet) return 'PARTIAL';
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

async function openClockMethod(page, methodTestIdOrText) {
  await page.locator('[data-testid="attendance-tab-clock-in"]').click();
  await sleep(600);
  const byTest = page.locator(`[data-testid="${methodTestIdOrText}"]`);
  if ((await byTest.count()) > 0) {
    await byTest.first().click({ timeout: 8000 });
    return;
  }
  await page.getByRole('button', { name: methodTestIdOrText }).first().click({ timeout: 8000 }).catch(async () => {
    await page.locator('button').filter({ hasText: methodTestIdOrText }).first().click({ timeout: 8000 });
  });
}

async function probeSurface(page, row) {
  const netBefore = results.networkBad.length;
  const okBefore = results.networkOk.length;
  const errBefore = results.pageErrors.length;
  const conBefore = results.consoleErrors.length;
  const mutBefore = results.mutateBlocked.length;
  try {
    await row.action(page);
    await sleep(1400);
  } catch (e) {
    row.clickError = String(e).slice(0, 220);
  }
  const sig = await pageSignals(page);
  const netSlice = results.networkBad.slice(netBefore);
  const okSlice = results.networkOk.slice(okBefore);
  const runtime = row.clickError
    ? 'BROKEN'
    : classifyRuntime(sig, netSlice, okSlice, {
        force: row.forceRuntime,
        partialHint: row.partialHint,
        requireNet: row.requireNet,
      });
  row.runtime = runtime;
  row.signals = sig;
  row.newPageErrors = results.pageErrors.slice(errBefore);
  row.newConsoleErrors = results.consoleErrors.slice(conBefore);
  row.networkBad = netSlice;
  row.networkOk = okSlice.slice(0, 12);
  row.mutateUnexpected = results.mutateBlocked.slice(mutBefore);
  row.probedAt = ts();
  if (runtime === 'BROKEN' || row.clickError) {
    await shot(page, row.id.replace(/[^a-z0-9-]/gi, '_').slice(0, 60));
  }
  results.surfaces.push(row);
  save();
  console.log(
    `${runtime.padEnd(10)} #${String(row.matrix || '?').padEnd(8)} ${row.menu_path}  ok=${okSlice.length} bad=${netSlice.length}`,
  );
}

async function main() {
  await probeL0();
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
  results.portal_url = url;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await sleep(2000);

  const surfaces = [
    {
      id: 'tab-overview',
      matrix: '1-5',
      menu_path: 'Tổng quan',
      requireNet: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Tổng quan$/ }).click();
      },
    },
    {
      id: 'att-clock-in',
      matrix: '6',
      menu_path: 'Clock-In hub',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-clock-in"]').click();
      },
    },
    {
      id: 'clock-manual',
      matrix: '7',
      menu_path: 'Clock-In → Thủ công (spot open)',
      action: async (p) => {
        await openClockMethod(p, /Thủ công|Manual/i);
      },
    },
    {
      id: 'clock-qr',
      matrix: '8',
      menu_path: 'Clock-In → QR (shell spot)',
      partialHint: true,
      forceRuntime: null,
      action: async (p) => {
        await openClockMethod(p, /QR|Mã QR/i);
      },
    },
    {
      id: 'clock-face',
      matrix: '9',
      menu_path: 'Clock-In → Khuôn mặt (GĐ2-HOLD spot)',
      forceRuntime: 'GĐ2-HOLD',
      action: async (p) => {
        await openClockMethod(p, /Khuôn mặt|Face/i);
      },
    },
    {
      id: 'clock-gps',
      matrix: '10',
      menu_path: 'Clock-In → GPS (spot open, no POST)',
      action: async (p) => {
        await openClockMethod(p, /GPS|Vị trí/i);
      },
    },
    {
      id: 'att-sheets',
      matrix: '11-12',
      menu_path: 'Bảng chấm công',
      requireNet: true,
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await sleep(300);
        await p.getByRole('menuitem', { name: 'Bảng chấm công' }).click();
      },
    },
    {
      id: 'att-records',
      matrix: '13',
      menu_path: 'Dữ liệu chấm công (list RO)',
      requireNet: true,
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await p.getByRole('menuitem', { name: 'Dữ liệu chấm công' }).click();
      },
    },
    {
      id: 'att-weekly',
      matrix: '14',
      menu_path: 'Chấm công tuần',
      requireNet: true,
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await p.getByRole('menuitem', { name: 'Chấm công tuần' }).click();
      },
    },
    {
      id: 'att-summary',
      matrix: '15',
      menu_path: 'Tổng hợp công',
      requireNet: true,
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await p.getByRole('menuitem', { name: 'Tổng hợp công' }).click();
      },
    },
    {
      id: 'shifts-list',
      matrix: '16',
      menu_path: 'Ca → Danh sách ca',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Danh sách ca');
      },
    },
    {
      id: 'shifts-schedule',
      matrix: '17',
      menu_path: 'Ca → Lịch phân ca',
      partialHint: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Lịch phân ca');
      },
    },
    {
      id: 'shifts-overtime',
      matrix: '18',
      menu_path: 'Ca → Ca làm thêm',
      partialHint: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Ca làm thêm');
      },
    },
    {
      id: 'req-leave',
      matrix: '19',
      menu_path: 'Đơn → Nghỉ phép',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đơn xin nghỉ');
      },
    },
    {
      id: 'req-late-early',
      matrix: '20',
      menu_path: 'Đơn → Đi muộn/về sớm',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đăng ký đi muộn, về sớm');
      },
    },
    {
      id: 'req-overtime',
      matrix: '21',
      menu_path: 'Đơn → Làm thêm',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đăng ký làm thêm');
      },
    },
    {
      id: 'req-trip',
      matrix: '22',
      menu_path: 'Đơn → Công tác',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị đi công tác');
      },
    },
    {
      id: 'req-update-att',
      matrix: '23',
      menu_path: 'Đơn → Cập nhật công',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị cập nhật công');
      },
    },
    {
      id: 'req-change-shift',
      matrix: '24',
      menu_path: 'Đơn → Đổi ca',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị đổi ca');
      },
    },
    {
      id: 'req-leave-summary',
      matrix: '25',
      menu_path: 'Đơn → TH nghỉ phép',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Bảng tổng hợp nghỉ phép');
      },
    },
    {
      id: 'req-comp-summary',
      matrix: '26',
      menu_path: 'Đơn → TH nghỉ bù',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Bảng tổng hợp nghỉ bù');
      },
    },
    {
      id: 'req-leave-plan',
      matrix: '27',
      menu_path: 'Đơn → Kế hoạch nghỉ',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Kế hoạch nghỉ phép');
      },
    },
    {
      id: 'tab-leave',
      matrix: '28',
      menu_path: 'Tab Nghỉ phép',
      requireNet: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Nghỉ phép$/ }).click();
      },
    },
    {
      id: 'tab-reports',
      matrix: '29',
      menu_path: 'Báo cáo (RO, no export click)',
      requireNet: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Báo cáo$/ }).click();
      },
    },
    {
      id: 'tab-settings',
      matrix: 'shell',
      menu_path: 'Thiết lập shell',
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
      },
    },
  ];

  const settingsItems = [
    { label: 'Nhân viên', matrix: '31', requireNet: true },
    { label: 'Quy định chấm công', matrix: '32', requireNet: true },
    { label: 'Quy định làm thêm', matrix: '40', forceRuntime: 'STUB_UI' },
    { label: 'Quy định nghỉ', matrix: '41', forceRuntime: 'STUB_UI' },
    { label: 'Quy định đi muộn - về sớm', matrix: '42', forceRuntime: 'STUB_UI' },
    { label: 'Quy định làm đơn', matrix: '43', forceRuntime: 'STUB_UI' },
    { label: 'Người dùng', matrix: '44', forceRuntime: 'STUB_UI' },
    { label: 'Vai trò', matrix: '45', forceRuntime: 'STUB_UI' },
    { label: 'Hệ thống', matrix: '46', forceRuntime: 'STUB_UI' },
  ];
  for (const s of settingsItems) {
    surfaces.push({
      id: `settings-${s.label.replace(/\s+/g, '-').slice(0, 24)}`,
      matrix: s.matrix,
      menu_path: `Thiết lập → ${s.label}`,
      requireNet: s.requireNet,
      forceRuntime: s.forceRuntime,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(400);
        await p.locator('nav button').filter({ hasText: s.label }).click();
      },
    });
  }

  const rulesTabs = [
    { label: 'Chung', matrix: '32', testid: null },
    { label: 'Số công chuẩn', matrix: '33', testid: null },
    { label: 'Tùy chỉnh bảng công', matrix: '34', testid: null },
    { label: 'Máy chấm công', matrix: '35', testid: 'hdsd-att-rules-tab-device' },
    { label: 'Chấm công trên ứng dụng', matrix: '36', testid: 'hdsd-att-rules-tab-app' },
  ];
  for (const r of rulesTabs) {
    surfaces.push({
      id: `rules-${r.label.slice(0, 14)}`,
      matrix: r.matrix,
      menu_path: `Quy định → ${r.label}`,
      requireNet: r.matrix === '32' || r.matrix === '33' || r.matrix === '34',
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(300);
        await p.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click();
        await sleep(400);
        if (r.testid) {
          await p.locator(`[data-testid="${r.testid}"]`).click({ timeout: 8000 });
        } else {
          await p.getByRole('button', { name: r.label }).click();
        }
      },
    });
  }

  const stubRules = [
    { label: 'Chấm công máy tính bảng', matrix: '37' },
    { label: 'Chấm công hộ', matrix: '38' },
    { label: 'Nhân viên tự động chấm công', matrix: '39' },
  ];
  for (const r of stubRules) {
    surfaces.push({
      id: `rules-stub-${r.matrix}`,
      matrix: r.matrix,
      menu_path: `Quy định → ${r.label}`,
      forceRuntime: 'STUB_UI',
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(300);
        await p.locator('nav button').filter({ hasText: 'Quy định chấm công' }).click();
        await sleep(400);
        await p.getByRole('button', { name: r.label }).click();
      },
    });
  }

  for (const row of surfaces) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 }).catch(() => {});
    await sleep(700);
    results.consoleErrors.length = 0;
    results.pageErrors.length = 0;
    await probeSurface(page, { ...row });
  }

  // Post-classify QR: shell without mutate stays PARTIAL if LIVE heuristics passed
  for (const s of results.surfaces) {
    if (s.id === 'clock-qr' && s.runtime === 'LIVE') s.runtime = 'PARTIAL';
    if (s.id === 'clock-face') s.runtime = 'GĐ2-HOLD';
    if ((s.id === 'shifts-schedule' || s.id === 'shifts-overtime') && s.runtime === 'LIVE') {
      s.runtime = 'PARTIAL';
      s.note = 'menu LIVE · NO_API branch honesty';
    }
  }

  const counts = {};
  for (const s of results.surfaces) {
    counts[s.runtime] = (counts[s.runtime] || 0) + 1;
  }
  results.rollup = {
    probeCount: results.surfaces.length,
    counts,
    networkOkTotal: results.networkOk.length,
    networkBadTotal: results.networkBad.length,
    unexpectedMutates: results.mutateBlocked.length,
    pageErrorsTotal: results.pageErrors.length,
  };
  results.endedAt = ts();
  save();
  await browser.close();
  console.log('ROLLUP', JSON.stringify(results.rollup));
  console.log('Wrote', OUT_JSON);
  if (results.mutateBlocked.length) {
    console.warn('WARN unexpected non-GET', results.mutateBlocked.length);
  }
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.fatal = String(e);
  save();
  process.exit(1);
});
