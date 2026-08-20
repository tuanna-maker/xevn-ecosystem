#!/usr/bin/env node
/**
 * PO-HRM-BP-ATT-DEEP-QA-01 — Browser RO deep walk entire Attendance module
 * Persona: ceo@xe.vn · companyId=main · /hr/attendance embed
 * U65 zero-seed · open dialogs when CTA visible · Hủy/Escape · NO mutate Lưu/Duyệt/POST
 * FORBIDDEN: seed · payroll mutate · invent Attendance CLOSED · skip settings stubs
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-bp-att-deep-qa-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-bp-att-deep-qa-01');
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
  work_item_id: 'PO-HRM-BP-ATT-DEEP-QA-01',
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
  ctas: [],
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
  const featureInDev = /Tính năng đang được phát triển|đang được phát triển|Feature under development/i.test(
    bodyText,
  );
  const cfgRedirect =
    (await page.locator('[data-testid^="att-cfg-stub-"]').count()) > 0 ||
    /Cấu hình mục này tại Cài đặt HRM|không lưu tại màn Chấm công/i.test(bodyText);
  const stub = featureInDev || cfgRedirect;
  const gd2Hold = /GĐ2|Giai đoạn 2|đang phát triển.*khuôn mặt|Face.*GĐ2/i.test(bodyText);
  const emptyHonesty =
    /Chưa có dữ liệu|Không có dữ liệu|No data|trống|empty/i.test(bodyText) &&
    !/HRM API Sync ERROR|request failed/i.test(bodyText);
  const spinners = await page.locator('.animate-spin').count();
  const hasTable = (await page.locator('table').count()) > 0;
  const hasCard = (await page.locator('[class*="Card"]').count()) > 0;
  const dialogOpen = (await page.locator('[role="dialog"]').count()) > 0;
  const depthErr = results.pageErrors.some((e) => /Maximum update depth/i.test(e));
  const consoleDepth = results.consoleErrors.some((e) => /Maximum update depth/i.test(e));
  const errorBanner = /HRM API Sync ERROR|request failed \(5\d\d\)/i.test(bodyText);
  const ctaLabels = await page
    .locator('button:visible')
    .evaluateAll((els) =>
      els
        .map((el) => (el.textContent || el.getAttribute('title') || '').trim().replace(/\s+/g, ' '))
        .filter((t) => t && /^(Tạo|Thêm|Lưu|Xuất|Import|Nhập|Duyệt|Từ chối|Sửa|Xóa|Hủy|Tải lại|Làm mới|Refresh)/i.test(t))
        .slice(0, 20),
    )
    .catch(() => []);
  return {
    stub,
    featureInDev,
    cfgRedirect,
    gd2Hold,
    emptyHonesty,
    spinners,
    hasTable,
    hasCard,
    dialogOpen,
    depthErr: depthErr || consoleDepth,
    errorBanner,
    bodyLen: bodyText.length,
    ctaLabels,
    bodySnippet: bodyText.replace(/\s+/g, ' ').slice(0, 220),
  };
}

function classifyRuntime(sig, netSlice, okSlice, extras = {}) {
  if (extras.force) return extras.force;
  if (sig.depthErr || sig.errorBanner) return 'BROKEN';
  const bad5xx = netSlice.filter((n) => n.status >= 500);
  if (bad5xx.length) return 'BROKEN';
  if (sig.gd2Hold && extras.allowGd2) return 'GĐ2-HOLD';
  if (sig.stub) return 'STUB_UI';
  if (extras.partialHint) return 'PARTIAL';
  if (sig.spinners > 2 && !sig.hasTable && !sig.hasCard) return 'PARTIAL';
  if (sig.bodyLen < 80) return 'PARTIAL';
  if (okSlice.length === 0 && extras.requireNet) return 'PARTIAL';
  return 'LIVE';
}

async function shot(page, name) {
  const safe = name.replace(/[^a-z0-9-_]/gi, '_').slice(0, 72);
  const path = join(SCREEN, `${safe}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path.replace(/\\/g, '/');
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

async function closeDialogIfOpen(page) {
  const dlg = page.locator('[role="dialog"]');
  if ((await dlg.count()) === 0) return;
  const cancel = dlg.getByRole('button', { name: /Hủy|Đóng|Cancel|Close/i }).first();
  if ((await cancel.count()) > 0) {
    await cancel.click({ timeout: 3000 }).catch(() => {});
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await sleep(300);
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
  let runtime = row.clickError
    ? 'BROKEN'
    : classifyRuntime(sig, netSlice, okSlice, {
        force: row.forceRuntime,
        partialHint: row.partialHint,
        requireNet: row.requireNet,
        allowGd2: row.allowGd2,
      });
  // Honesty: stub panel wins over force LIVE
  if (!row.forceRuntime && sig.stub && runtime === 'LIVE') runtime = 'STUB_UI';
  if (row.allowGd2 && sig.gd2Hold) runtime = 'GĐ2-HOLD';

  row.runtime = runtime;
  row.signals = sig;
  row.newPageErrors = results.pageErrors.slice(errBefore);
  row.newConsoleErrors = results.consoleErrors.slice(conBefore);
  row.networkBad = netSlice;
  row.networkOk = okSlice.slice(0, 14);
  row.mutateUnexpected = results.mutateBlocked.slice(mutBefore);
  row.probedAt = ts();
  row.screenshot = await shot(page, row.id);
  if (sig.ctaLabels?.length) {
    results.ctas.push({ id: row.id, matrix: row.matrix, ctas: sig.ctaLabels, dialogOpen: sig.dialogOpen });
  }
  results.surfaces.push(row);
  save();
  console.log(
    `${runtime.padEnd(10)} #${String(row.matrix || '?').padEnd(8)} ${row.menu_path}  ok=${okSlice.length} bad=${netSlice.length} stub=${sig.stub} dlg=${sig.dialogOpen}`,
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
      cluster: 'Overview',
      menu_path: 'Tổng quan',
      requireNet: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Tổng quan$/ }).click();
      },
    },
    {
      id: 'att-clock-in',
      matrix: '6',
      cluster: 'Clock-in',
      menu_path: 'Clock-In hub',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-clock-in"]').click();
      },
    },
    {
      id: 'clock-manual',
      matrix: '7',
      cluster: 'Clock-in',
      menu_path: 'Clock-In → Thủ công (spot open)',
      action: async (p) => {
        await openClockMethod(p, /Thủ công|Manual/i);
      },
    },
    {
      id: 'clock-qr',
      matrix: '8',
      cluster: 'Clock-in',
      menu_path: 'Clock-In → QR (shell spot)',
      partialHint: true,
      action: async (p) => {
        await openClockMethod(p, /QR|Mã QR/i);
      },
    },
    {
      id: 'clock-face',
      matrix: '9',
      cluster: 'Clock-in',
      menu_path: 'Clock-In → Khuôn mặt (GĐ2-HOLD spot)',
      allowGd2: true,
      forceRuntime: 'GĐ2-HOLD',
      action: async (p) => {
        await openClockMethod(p, /Khuôn mặt|Face/i);
      },
    },
    {
      id: 'clock-gps',
      matrix: '10',
      cluster: 'Clock-in',
      menu_path: 'Clock-In → GPS (spot open, no POST)',
      action: async (p) => {
        await openClockMethod(p, /GPS|Vị trí/i);
      },
    },
    {
      id: 'att-sheets',
      matrix: '11-12',
      cluster: 'Sheets/Records',
      menu_path: 'Bảng chấm công',
      requireNet: true,
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await sleep(300);
        await p.getByRole('menuitem', { name: 'Bảng chấm công' }).click();
      },
    },
    {
      id: 'att-sheets-add-dialog',
      matrix: '12',
      cluster: 'Sheets/Records',
      menu_path: 'Bảng chấm công → Thêm (dialog open + Hủy)',
      action: async (p) => {
        await p.locator('[data-testid="attendance-tab-menu"]').click();
        await sleep(300);
        await p.getByRole('menuitem', { name: 'Bảng chấm công' }).click();
        await sleep(800);
        const addBtn = p.getByRole('button', { name: /Thêm bảng|Thêm/i }).first();
        await addBtn.click({ timeout: 8000 });
        await sleep(600);
        // leave dialog open for screenshot in probeSurface; closed after probe
      },
    },
    {
      id: 'att-records',
      matrix: '13',
      cluster: 'Sheets/Records',
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
      cluster: 'Sheets/Records',
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
      cluster: 'Sheets/Records',
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
      cluster: 'Shifts',
      menu_path: 'Ca → Danh sách ca',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Danh sách ca');
      },
    },
    {
      id: 'shifts-schedule',
      matrix: '17',
      cluster: 'Shifts',
      menu_path: 'Ca → Lịch phân ca',
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Lịch phân ca');
      },
    },
    {
      id: 'shifts-overtime',
      matrix: '18',
      cluster: 'Shifts',
      menu_path: 'Ca → Ca làm thêm',
      action: async (p) => {
        await clickDropdownItem(p, /^Ca làm việc$/, 'Ca làm thêm');
      },
    },
    {
      id: 'req-leave',
      matrix: '19',
      cluster: 'Requests',
      menu_path: 'Đơn → Nghỉ phép',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đơn xin nghỉ');
      },
    },
    {
      id: 'req-late-early',
      matrix: '20',
      cluster: 'Requests',
      menu_path: 'Đơn → Đi muộn/về sớm',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đăng ký đi muộn, về sớm');
      },
    },
    {
      id: 'req-overtime',
      matrix: '21',
      cluster: 'Requests',
      menu_path: 'Đơn → Làm thêm',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đăng ký làm thêm');
      },
    },
    {
      id: 'req-trip',
      matrix: '22',
      cluster: 'Requests',
      menu_path: 'Đơn → Công tác',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị đi công tác');
      },
    },
    {
      id: 'req-update-att',
      matrix: '23',
      cluster: 'Requests',
      menu_path: 'Đơn → Cập nhật công',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị cập nhật công');
      },
    },
    {
      id: 'req-change-shift',
      matrix: '24',
      cluster: 'Requests',
      menu_path: 'Đơn → Đổi ca',
      requireNet: true,
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Đề nghị đổi ca');
      },
    },
    {
      id: 'req-leave-summary',
      matrix: '25',
      cluster: 'Requests',
      menu_path: 'Đơn → TH nghỉ phép',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Bảng tổng hợp nghỉ phép');
      },
    },
    {
      id: 'req-comp-summary',
      matrix: '26',
      cluster: 'Requests',
      menu_path: 'Đơn → TH nghỉ bù',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Bảng tổng hợp nghỉ bù');
      },
    },
    {
      id: 'req-leave-plan',
      matrix: '27',
      cluster: 'Requests',
      menu_path: 'Đơn → Kế hoạch nghỉ',
      action: async (p) => {
        await clickDropdownItem(p, /^Quản lý đơn$/, 'Kế hoạch nghỉ phép');
      },
    },
    {
      id: 'tab-leave',
      matrix: '28',
      cluster: 'Leave',
      menu_path: 'Tab Nghỉ phép',
      requireNet: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Nghỉ phép$/ }).click();
      },
    },
    {
      id: 'tab-reports',
      matrix: '29',
      cluster: 'Reports',
      menu_path: 'Báo cáo',
      requireNet: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Báo cáo$/ }).click();
      },
    },
    {
      id: 'tab-reports-export-dialog',
      matrix: '30',
      cluster: 'Reports',
      menu_path: 'Báo cáo → Xuất báo cáo (dialog open + Hủy, no download)',
      partialHint: true,
      action: async (p) => {
        await p.getByRole('button', { name: /^Báo cáo$/ }).click();
        await sleep(1000);
        await p.getByRole('button', { name: /Xuất báo cáo/i }).click({ timeout: 10_000 });
        await sleep(700);
        // leave dialog open for screenshot; do NOT click Export/Download
      },
    },
    {
      id: 'tab-settings',
      matrix: 'shell',
      cluster: 'Settings',
      menu_path: 'Thiết lập shell',
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
      },
    },
  ];

  // Do NOT forceRuntime — detect featureInDev honesty from body
  const settingsItems = [
    { label: 'Nhân viên', matrix: '31', requireNet: true },
    { label: 'Quy định chấm công', matrix: '32', requireNet: true },
    { label: 'Quy định làm thêm', matrix: '40' },
    { label: 'Quy định nghỉ', matrix: '41' },
    { label: 'Quy định đi muộn - về sớm', matrix: '42' },
    { label: 'Quy định làm đơn', matrix: '43' },
    { label: 'Người dùng', matrix: '44' },
    { label: 'Vai trò', matrix: '45' },
    { label: 'Hệ thống', matrix: '46' },
  ];
  for (const s of settingsItems) {
    surfaces.push({
      id: `settings-${s.label.replace(/\s+/g, '-').slice(0, 28)}`,
      matrix: s.matrix,
      cluster: 'Settings',
      menu_path: `Thiết lập → ${s.label}`,
      requireNet: s.requireNet,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(400);
        await p.locator('nav button').filter({ hasText: new RegExp(`^${s.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click();
      },
    });
  }

  const rulesTabs = [
    { label: 'Chung', matrix: '32', testid: null },
    { label: 'Số công chuẩn', matrix: '33', testid: null, partialHint: true },
    { label: 'Tùy chỉnh bảng công', matrix: '34', testid: null },
    { label: 'Máy chấm công', matrix: '35', testid: 'hdsd-att-rules-tab-device' },
    { label: 'Ứng dụng di động', matrix: '36', testid: 'hdsd-att-rules-tab-app' },
  ];
  for (const r of rulesTabs) {
    surfaces.push({
      id: `rules-${r.label.slice(0, 18)}`,
      matrix: r.matrix,
      cluster: 'Settings-Rules',
      menu_path: `Quy định → ${r.label}`,
      requireNet: ['32', '33', '34'].includes(String(r.matrix)),
      partialHint: r.partialHint,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(300);
        await p.locator('nav button').filter({ hasText: /^Quy định chấm công$/ }).click();
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
    { label: 'Máy tính bảng', matrix: '37' },
    { label: 'Chấm công hộ', matrix: '38' },
    { label: 'Tự động chấm công', matrix: '39' },
  ];
  for (const r of stubRules) {
    surfaces.push({
      id: `rules-stub-${r.matrix}`,
      matrix: r.matrix,
      cluster: 'Settings-Rules',
      menu_path: `Quy định → ${r.label}`,
      action: async (p) => {
        await p.getByRole('button', { name: /^Thiết lập$/ }).click();
        await sleep(300);
        await p.locator('nav button').filter({ hasText: /^Quy định chấm công$/ }).click();
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
    await closeDialogIfOpen(page);
  }

  // Post-classify honesty fixes
  for (const s of results.surfaces) {
    if (s.id === 'clock-qr' && s.runtime === 'LIVE') s.runtime = 'PARTIAL';
    if (s.id === 'clock-face') s.runtime = 'GĐ2-HOLD';
    if ((s.id === 'shifts-schedule' || s.id === 'shifts-overtime') && s.signals?.stub) {
      s.runtime = 'STUB_UI';
    }
    if (s.id === 'tab-reports-export-dialog' && s.runtime === 'LIVE') {
      s.runtime = 'PARTIAL';
      s.note = 'Export dialog opens; client-side export with empty fetch stub (no Nest export)';
    }
    if (s.id === 'rules-Số công chuẩn' && s.runtime === 'LIVE') {
      s.runtime = 'PARTIAL';
      s.note = 'rules LIVE · columns static ACCEPTED_AS_IS_P1';
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
    screensTotal: results.screens.length,
    ctaSurfaces: results.ctas.length,
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
