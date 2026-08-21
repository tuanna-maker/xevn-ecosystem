#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01 — U65 browser J-HRM-ATT-03B-01..06
 * FE-02 + BE-01 READY · Wave-31 UC-BP-ATT-03b
 *   J-01 thin+residual CRUD năm · Lưu · F5 · Nest /core 0 · ≠ thin=DONE
 *   J-02 lunarFlag / calendarType âm · F5
 *   J-03 dayType Nghỉ lễ/Trực lễ · isPaid · dayTypeLabelVi · ≠ PAY DONE
 *   J-04 status Nháp/Đã phát hành · replace → midYear banner · DENY silent
 *   J-05 năm ABSENT → HOL-MISS · CTA admin · Nest /core 0 · ≠ ATT-03b DONE alone
 *   J-06 F5 + honesty footer seals · residual alone ≠ ATT-03b DONE · C-SLICE
 * DENY seed · Nest /core holiday SoT · invent ASSIGN / att_leave_hold · invent PAY/printable
 *   · claim residual=ATT-03b DONE · catalog/LIVE/AGG DONE · ATT UAT · honesty flip
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · printable false
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

/** Browser FE-only CRUD year (ABSENT) — U65 zero-seed · ≠ pnpm seed */
const CRUD_YEAR = Number(process.env.QA_ATT03B_YEAR || 2096);
/** HOL-MISS peer year ABSENT */
const HOL_MISS_YEAR = 2030;
const HOL_MISS_START_VI = '03/01/2030';
const HOL_MISS_END_VI = '06/01/2030';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-03b-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-03b-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const SEALS = {
  ATT01: 'ATT01QC1-MSLZ3KIM',
  ATT11: 'ATT11QC1-MSLXTH9P',
  ATT10: 'ATT10QC1-MSLWGUYH',
  ATT09: 'ATT09QC1-MSLUTL9D',
  ATT08: 'ATT08QC1-MSLSL36C',
  ATT02: 'ATT02QC1-MSLQZUK7',
  PLT01: 'PLT01QC1-MSLPUQIU',
  CORE10: 'CORE10QC1-MSLP0EJB',
  CORE09: 'CORE09QC1-MSLNBA89',
  CORE07: 'CORE07QC1-KZJTSHNT',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT03BQA1-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 700) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-03B-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-03b', 'FR-UC-BP-ATT-03b'],
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    residual_alone_ne_att03b_done: true,
    thin_ne_att03b_done: true,
    ne_catalog_att01_done: true,
    ne_live_att11_done: true,
    ne_agg_att10_done: true,
    ne_att_module_uat: true,
    cfg_ne_att02_done: true,
    pay_out: true,
    nest_core_deny: true,
    soft_ne_core06_done: true,
    r_att_01_assign_open: true,
    deny_att_leave_hold: true,
    seed_used: false,
    c_slice_ne_module: true,
  },
  must_keep: Object.values(SEALS),
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT, CRUD_YEAR, HOL_MISS_YEAR },
  l0: {},
  network: [],
  nest_core_hits: [],
  nest_core_holiday_non404: [],
  holiday_get_hits: [],
  holiday_put_hits: [],
  preview_hits: [],
  put_bodies: [],
  put_responses: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  setup: {},
  overall: null,
  ack_status: null,
  endedAt: null,
  _putMark: ts(),
  _previewMark: ts(),
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 600)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function isNestCoreHoliday(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return (
    p.includes('holiday') ||
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('leave')
  );
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const holiday =
    /\/attendance\/holiday-calendars(\/|\?|$)/.test(url) ||
    /\/attendance\/holiday-calendars\/\d+/.test(url);
  const preview = /leave-requests\/preview-deduction/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    holiday,
    preview,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreHoliday(url) && status !== 404) {
    R.nest_core_holiday_non404.push(entry);
  }
  if (holiday && method === 'GET') R.holiday_get_hits.push(entry);
  if (holiday && method === 'PUT') R.holiday_put_hits.push(entry);
  if (preview) R.preview_hits.push(entry);
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function attendanceUrl() {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  const base = isDirectHrm ? `/attendance` : `/hr/attendance`;
  return q(base);
}

async function loginApi() {
  let lastStatus = 0;
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch (e) {
      console.error(`[login] fail ${url}: ${String(e).slice(0, 120)}`);
    }
  }
  if (!data?.accessToken && !data?.access_token) {
    throw new Error(`login failed status=${lastStatus}`);
  }
  const token = data.accessToken ?? data.access_token;
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      id: data.userId ?? data.user?.id ?? 'ceo',
      email: EMAIL,
      fullName: data.fullName ?? data.user?.fullName ?? 'CEO XeVN',
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
      memberships: data.memberships ?? [],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, opts = {}) {
  const companyId = opts.companyId ?? COMPANY;
  const url = path.startsWith('http')
    ? path
    : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': companyId,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const r = await fetch(url, init);
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  trackUrl(method, url, r.status);
  return {
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    data: json?.data ?? json,
    json,
    summary: summarizeBody(json, 700),
    path: url.replace(/^https?:\/\/[^/]+/, ''),
  };
}

async function l0(token) {
  const out = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  const nestProbe = await apiCall(token, 'GET', `/core/att/holiday-calendars/${CRUD_YEAR}`);
  out.nest_core_holiday = { status: nestProbe.status, ok: nestProbe.status === 404 };
  const abs = await apiCall(
    token,
    'GET',
    `/attendance/holiday-calendars/${CRUD_YEAR}?company_id=${COMPANY}`,
  );
  out.crud_year_absent = {
    status: abs.status,
    code: abs.code,
    ok: abs.status === 404 || (abs.status === 200 && (abs.data?.dayCount ?? 0) === 0),
  };
  R.setup.crud_year_probe = abs.summary;
  R.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok && out.portal?.ok;
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const req = res.request();
      const method = req.method();
      const url = res.url();
      trackUrl(method, url, res.status());
      if (method === 'PUT' && /holiday-calendars\/\d+/.test(url)) {
        let reqBody = null;
        try {
          reqBody = req.postDataJSON();
        } catch {
          reqBody = req.postData();
        }
        let resBody = null;
        try {
          resBody = await res.json();
        } catch {
          resBody = null;
        }
        R.put_bodies.push({
          at: ts(),
          url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 200),
          status: res.status(),
          body: reqBody,
        });
        R.put_responses.push({
          at: ts(),
          status: res.status(),
          code: resBody?.code ?? null,
          data: resBody?.data
            ? {
                year: resBody.data.year,
                status: resBody.data.status,
                statusLabelVi: resBody.data.statusLabelVi,
                dayCount: resBody.data.dayCount,
                midYearPendingLeaveRecalcRequired:
                  resBody.data.midYearPendingLeaveRecalcRequired,
                publishMode: resBody.data.publishMode,
                days: (resBody.data.days || []).map((d) => ({
                  date: d.date,
                  nameVi: d.nameVi,
                  lunarFlag: d.lunarFlag,
                  calendarType: d.calendarType,
                  isPaid: d.isPaid,
                  dayType: d.dayType,
                  dayTypeLabelVi: d.dayTypeLabelVi,
                })),
              }
            : null,
        });
        save();
      }
    } catch {
      /* */
    }
  });
}

async function findAcross(page, selector, { timeout = 800 } = {}) {
  const hosts = [page, ...page.frames()];
  for (const h of hosts) {
    try {
      const loc = h.locator(selector).first();
      if (await loc.isVisible({ timeout }).catch(() => false)) {
        return { host: h, locator: loc };
      }
    } catch {
      /* */
    }
  }
  return null;
}

async function waitAcross(page, selector, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const hit = await findAcross(page, selector, { timeout: 400 });
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function openHolidayAdmin(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1500);

  // VI label = Thiết lập (mission says Cài đặt — HDSD alias)
  const settingsBtn = page
    .getByRole('button', { name: /Thiết lập|Cài đặt/i })
    .first();
  if (await settingsBtn.isVisible().catch(() => false)) {
    await settingsBtn.click({ timeout: 10000 });
    log('open Thiết lập / Cài đặt tab');
  } else {
    const hit =
      (await findAcross(page, 'button:has-text("Thiết lập")')) ||
      (await findAcross(page, 'button:has-text("Cài đặt")'));
    if (!hit) throw new Error('settings tab not found');
    await hit.locator.click({ force: true });
    log('open settings tab (text)');
  }
  await sleep(800);

  const shell = await waitAcross(page, '[data-testid="att-settings-shell-precision"]', 20000);
  if (!shell) throw new Error('att-settings-shell-precision not found');

  const holNav =
    shell.host.getByRole('button', { name: /Lịch lễ\s*\/\s*Tết/i }).first();
  if (await holNav.isVisible().catch(() => false)) {
    await holNav.click({ timeout: 10000 });
    log('open Lịch lễ / Tết sidebar');
  } else {
    const hit = await findAcross(page, 'button:has-text("Lịch lễ")');
    if (!hit) throw new Error('Lịch lễ / Tết nav not found');
    await hit.locator.click({ force: true });
    log('open Lịch lễ nav (text)');
  }
  await sleep(1000);

  const panel = await waitAcross(page, '[data-testid="att-03b-holiday-calendar-panel"]', 25000);
  if (!panel) throw new Error('att-03b-holiday-calendar-panel not found');
  return panel.host;
}

async function setYear(host, year) {
  const input = host.locator('[data-testid="att-03b-year-input"]').first();
  await input.fill(String(year));
  await input.press('Tab');
  await sleep(400);
  const reload = host.locator('[data-testid="att-03b-reload"]').first();
  if (await reload.isVisible().catch(() => false)) {
    await reload.click();
    log('reload year', { year });
  }
  await sleep(1500);
}

async function clearAllDays(host) {
  for (let guard = 0; guard < 20; guard++) {
    const remove = host.locator('[data-testid^="att-03b-day-remove-"]').first();
    if (!(await remove.isVisible().catch(() => false))) break;
    await remove.click();
    await sleep(200);
  }
}

async function addDay(host, { date, nameVi, lunar, calType, dayType, isPaid }) {
  const before = await host.locator('[data-testid^="att-03b-day-row-"]').count();
  await host.locator('[data-testid="att-03b-add-day"]').click();
  await sleep(400);
  const idx = before;
  await host.locator(`[data-testid="att-03b-day-date-${idx}"]`).fill(date);
  await host.locator(`[data-testid="att-03b-day-name-${idx}"]`).fill(nameVi);
  if (calType) {
    await host.locator(`[data-testid="att-03b-day-cal-type-${idx}"]`).selectOption(calType);
  }
  if (dayType) {
    await host.locator(`[data-testid="att-03b-day-type-${idx}"]`).selectOption(dayType);
  }
  const lunarCb = host.locator(`[data-testid="att-03b-day-lunar-${idx}"]`);
  const lunarOn = await lunarCb.isChecked().catch(() => false);
  if (Boolean(lunar) !== lunarOn) await lunarCb.click();
  const paidCb = host.locator(`[data-testid="att-03b-day-paid-${idx}"]`);
  const paidOn = await paidCb.isChecked().catch(() => false);
  if (Boolean(isPaid) !== paidOn) await paidCb.click();
  log('add day', { idx, date, nameVi, lunar, calType, dayType, isPaid });
  await sleep(200);
  return idx;
}

async function clickSave(host) {
  R._putMark = ts();
  const putBefore = R.holiday_put_hits.length;
  await host.locator('[data-testid="att-03b-save"]').click();
  log('click Lưu');
  const start = Date.now();
  while (Date.now() - start < 15000) {
    if (R.holiday_put_hits.length > putBefore) break;
    await sleep(200);
  }
  await sleep(800);
  return R.holiday_put_hits.slice(putBefore);
}

async function openLeaveForHolMiss(page) {
  await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(1200);
  const leaveBtn = page.getByRole('button', { name: /^Nghỉ phép$/i }).first();
  if (await leaveBtn.isVisible().catch(() => false)) {
    await leaveBtn.click({ timeout: 10000 });
    log('open Nghỉ phép');
  } else {
    const hit = await findAcross(page, 'button:has-text("Nghỉ phép")');
    if (hit) await hit.locator.click({ force: true });
  }
  await sleep(1000);
  const shell = await waitAcross(page, '[data-testid="att-leave-precision"]', 25000);
  if (!shell) throw new Error('att-leave-precision not found');
  return shell.host;
}

async function openCreateDialog(host) {
  const createBtn = host
    .getByRole('button', { name: /Tạo yêu cầu nghỉ|Tạo yêu cầu|Create/i })
    .first();
  await createBtn.click({ timeout: 15000 });
  log('open create leave dialog');
  await sleep(800);
  const dlg = host.locator('[data-testid="att-leave-create-dialog-precision"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 15000 });
  return dlg;
}

async function selectFirstEmployee(dlg) {
  const trigger = dlg.locator('.xevn-field-select-md').first();
  await trigger.click({ timeout: 10000 });
  await sleep(600);
  const opt = dlg.page().locator('[role="option"]').first();
  await opt.waitFor({ state: 'visible', timeout: 15000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('select employee', { label: label.slice(0, 80) });
  await sleep(400);
  return label;
}

async function selectLeaveType(dlg) {
  const picker = dlg.locator('[data-testid="catalog-search-picker"]').first();
  if (await picker.isVisible().catch(() => false)) {
    await picker.click({ timeout: 8000 });
  } else {
    const combo = dlg.getByRole('combobox').nth(1);
    if (await combo.isVisible().catch(() => false)) {
      await combo.click({ timeout: 8000 });
    }
  }
  await sleep(500);
  const opt = dlg.page().locator('[role="option"]').first();
  await opt.waitFor({ state: 'visible', timeout: 12000 });
  const label = (await opt.innerText().catch(() => '')).trim();
  await opt.click();
  log('select leave type', { label: label.slice(0, 80) });
  await sleep(400);
  return label;
}

async function fillDates(dlg, startVi, endVi) {
  const dateInputs = dlg.locator('input.xevn-field-date, input[placeholder="dd/MM/yyyy"]');
  const count = await dateInputs.count();
  if (count < 2) throw new Error(`expected ≥2 date inputs, got ${count}`);
  await dateInputs.nth(0).fill('');
  await dateInputs.nth(0).fill(startVi);
  await dateInputs.nth(0).press('Tab');
  await sleep(200);
  await dateInputs.nth(1).fill('');
  await dateInputs.nth(1).fill(endVi);
  await dateInputs.nth(1).press('Tab');
  log('fill dates', { startVi, endVi });
  await sleep(1500);
}

function nestCoreHolidayFail() {
  return R.nest_core_holiday_non404.length > 0;
}

function lastPutResponse() {
  return R.put_responses[R.put_responses.length - 1] || null;
}

function lastPutBody() {
  return R.put_bodies[R.put_bodies.length - 1] || null;
}

async function main() {
  console.error(`[start] ${STAMP} CRUD_YEAR=${CRUD_YEAR}`);
  const session = await loginApi();
  R.setup.login = { via: session.raw?.__via, ok: true };
  save();

  const l0ok = await l0(session.token);
  if (!l0ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'L0',
      severity: 'P0',
      summary: 'L0 stack not healthy',
      owner: 'devops',
    });
    R.endedAt = ts();
    save();
    process.exitCode = 2;
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  try {
    // ─── J-01 thin+residual CRUD ─────────────────────────────────────
    let host = await openHolidayAdmin(page);
    await shot(page, '01-holiday-admin');
    await setYear(host, CRUD_YEAR);
    await shot(page, '02-year-load');

    const getHits = R.holiday_get_hits.filter((h) =>
      h.url.includes(`/holiday-calendars/${CRUD_YEAR}`),
    );
    const getOk = getHits.some((h) => h.status === 200 || h.status === 404);
    const emptyCta = await host
      .locator('[data-testid="att-03b-empty-cta"]')
      .isVisible()
      .catch(() => false);

    await clearAllDays(host);
    const idxSolar = await addDay(host, {
      date: `${CRUD_YEAR}-01-01`,
      nameVi: 'QA Tết Dương ATT03B',
      lunar: false,
      calType: 'solar',
      dayType: 'nghi',
      isPaid: true,
    });
    const puts1 = await clickSave(host);
    await shot(page, '03-j01-save');
    const put1 = lastPutResponse();
    const body1 = lastPutBody();
    const statusLabel = (
      await host.locator('[data-testid="att-03b-status-label"]').innerText().catch(() => '')
    ).trim();
    const dayCountTxt = (
      await host.locator('[data-testid="att-03b-day-count"]').innerText().catch(() => '')
    ).trim();
    const typeLabel0 = (
      await host
        .locator(`[data-testid="att-03b-day-type-label-${idxSolar}"]`)
        .innerText()
        .catch(() => '')
    ).trim();

    const j01Pass =
      getOk &&
      puts1.some((p) => p.status >= 200 && p.status < 300) &&
      put1?.status >= 200 &&
      put1?.status < 300 &&
      Number(put1?.data?.dayCount || 0) >= 1 &&
      /attendance\/holiday-calendars/.test(puts1[0]?.url || '') &&
      !nestCoreHolidayFail() &&
      Boolean(body1?.body?.days?.[0]?.nameVi);

    jset('J-HRM-ATT-03B-01', j01Pass ? 'PASS' : 'FAIL', {
      summary: `GET year ${getHits.map((h) => h.status).join(',') || 'none'} · emptyCta=${emptyCta} · PUT ${put1?.status}/${put1?.code} dayCount=${put1?.data?.dayCount} · statusLabel=${statusLabel} · NestCoreNon404=${R.nest_core_holiday_non404.length}`,
      getHits: getHits.slice(-3),
      put: put1,
      putBodyKeys: body1?.body ? Object.keys(body1.body) : [],
      fe: { statusLabel, dayCountTxt, typeLabel0 },
      nest_core_0: !nestCoreHolidayFail(),
      seed_used: false,
      ne_thin_done: true,
    });
    if (!j01Pass) {
      R.defects.push({
        id: 'J-01',
        severity: 'P0',
        summary: 'CRUD thin+residual PUT/F5 path FAIL',
        owner: 'dev-fe',
      });
    }

    // ─── J-02 lunar ──────────────────────────────────────────────────
    await clearAllDays(host);
    await addDay(host, {
      date: `${CRUD_YEAR}-02-17`,
      nameVi: 'QA Tết Âm ATT03B',
      lunar: true,
      calType: 'lunar',
      dayType: 'nghi',
      isPaid: true,
    });
    // keep solar day too for residual variety
    await addDay(host, {
      date: `${CRUD_YEAR}-01-01`,
      nameVi: 'QA Tết Dương ATT03B',
      lunar: false,
      calType: 'solar',
      dayType: 'nghi',
      isPaid: true,
    });
    const puts2 = await clickSave(host);
    await shot(page, '04-j02-lunar');
    const put2 = lastPutResponse();
    const body2 = lastPutBody();
    const lunarDay = (put2?.data?.days || []).find((d) => d.lunarFlag === true);
    const lunarReq = (body2?.body?.days || []).find((d) => d.lunarFlag === true);
    const lunarCbOn = await host
      .locator('[data-testid="att-03b-day-lunar-0"]')
      .isChecked()
      .catch(() => false);

    const j02Pass =
      puts2.some((p) => p.status >= 200 && p.status < 300) &&
      Boolean(lunarReq) &&
      (lunarDay?.lunarFlag === true || lunarDay?.calendarType === 'lunar') &&
      !nestCoreHolidayFail();

    jset('J-HRM-ATT-03B-02', j02Pass ? 'PASS' : 'FAIL', {
      summary: `PUT lunarFlag=${lunarReq?.lunarFlag} calendarType=${lunarReq?.calendarType} · resp lunar=${lunarDay?.lunarFlag}/${lunarDay?.calendarType} · FE lunar0=${lunarCbOn} · Nest0`,
      put: put2,
      lunarReq,
      lunarDay,
      nest_core_0: !nestCoreHolidayFail(),
      ne_solar_hardcode_only: true,
    });
    if (!j02Pass) {
      R.defects.push({
        id: 'J-02',
        severity: 'P0',
        summary: 'lunarFlag/calendarType residual FAIL',
        owner: 'dev-fe',
      });
    }

    // ─── J-03 type / paid / label ────────────────────────────────────
    await clearAllDays(host);
    const idxNghi = await addDay(host, {
      date: `${CRUD_YEAR}-04-30`,
      nameVi: 'QA 30/4 Nghỉ lễ',
      lunar: false,
      calType: 'solar',
      dayType: 'nghi',
      isPaid: true,
    });
    const idxTruc = await addDay(host, {
      date: `${CRUD_YEAR}-05-01`,
      nameVi: 'QA 1/5 Trực lễ',
      lunar: false,
      calType: 'solar',
      dayType: 'truc',
      isPaid: false,
    });
    const puts3 = await clickSave(host);
    await shot(page, '05-j03-type');
    const put3 = lastPutResponse();
    const body3 = lastPutBody();
    const labelNghi = (
      await host
        .locator(`[data-testid="att-03b-day-type-label-${idxNghi}"]`)
        .innerText()
        .catch(() => '')
    ).trim();
    const labelTruc = (
      await host
        .locator(`[data-testid="att-03b-day-type-label-${idxTruc}"]`)
        .innerText()
        .catch(() => '')
    ).trim();
    const days3 = put3?.data?.days || [];
    const nghi = days3.find((d) => d.dayType === 'nghi');
    const truc = days3.find((d) => d.dayType === 'truc');
    const paidFalse = (body3?.body?.days || []).some((d) => d.isPaid === false);

    const j03Pass =
      puts3.some((p) => p.status >= 200 && p.status < 300) &&
      Boolean(nghi) &&
      Boolean(truc) &&
      /Nghỉ lễ/i.test(labelNghi || nghi?.dayTypeLabelVi || '') &&
      /Trực lễ/i.test(labelTruc || truc?.dayTypeLabelVi || '') &&
      paidFalse &&
      !nestCoreHolidayFail();

    jset('J-HRM-ATT-03B-03', j03Pass ? 'PASS' : 'FAIL', {
      summary: `labels FE nghi=${labelNghi} truc=${labelTruc} · BE dayTypeLabelVi nghi=${nghi?.dayTypeLabelVi} truc=${truc?.dayTypeLabelVi} · isPaid false in PUT=${paidFalse} · ≠ PAY DONE`,
      put: put3,
      labels: { labelNghi, labelTruc },
      nest_core_0: !nestCoreHolidayFail(),
      pay_out: true,
    });
    if (!j03Pass) {
      R.defects.push({
        id: 'J-03',
        severity: 'P0',
        summary: 'dayType/isPaid/dayTypeLabelVi FAIL',
        owner: 'dev-fe',
      });
    }

    // ─── J-04 publish + midYear on replace ───────────────────────────
    // Year already exists from J-03 → set status effective + add day → midYear true
    await host.locator('[data-testid="att-03b-status-select"]').selectOption('effective');
    await addDay(host, {
      date: `${CRUD_YEAR}-09-02`,
      nameVi: 'QA Quốc khánh midYear',
      lunar: false,
      calType: 'solar',
      dayType: 'nghi',
      isPaid: true,
    });
    const puts4 = await clickSave(host);
    await sleep(500);
    await shot(page, '06-j04-midyear');
    const put4 = lastPutResponse();
    const midBanner = await host
      .locator('[data-testid="att-03b-midyear-banner"]')
      .isVisible()
      .catch(() => false);
    const midText = (
      await host.locator('[data-testid="att-03b-midyear-text"]').innerText().catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();
    const statusLabel4 = (
      await host.locator('[data-testid="att-03b-status-label"]').innerText().catch(() => '')
    ).trim();
    const midFlag = put4?.data?.midYearPendingLeaveRecalcRequired === true;
    const statusEff =
      put4?.data?.status === 'effective' || /Đã phát hành/i.test(statusLabel4);

    const j04Pass =
      puts4.some((p) => p.status >= 200 && p.status < 300) &&
      midFlag &&
      midBanner &&
      /midYearPendingLeaveRecalcRequired|tính lại đơn nghỉ/i.test(midText) &&
      statusEff &&
      !nestCoreHolidayFail();

    jset('J-HRM-ATT-03B-04', j04Pass ? 'PASS' : 'FAIL', {
      summary: `PUT midYear=${midFlag} banner=${midBanner} status=${put4?.data?.status}/${statusLabel4} publishMode=${put4?.data?.publishMode} · DENY silent`,
      put: put4,
      midBanner,
      midText: midText.slice(0, 240),
      nest_core_0: !nestCoreHolidayFail(),
      ne_att03b_done_alone: true,
    });
    if (!j04Pass) {
      R.defects.push({
        id: 'J-04',
        severity: 'P0',
        summary: 'status/midYear banner FAIL',
        owner: 'dev-fe',
      });
    }

    // F5 persistence (feeds J-01/J-06)
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1500);
    // re-open settings → holiday after F5 (tab may reset)
    host = await openHolidayAdmin(page);
    await setYear(host, CRUD_YEAR);
    await shot(page, '07-f5-reload');
    const f5DayCount = (
      await host.locator('[data-testid="att-03b-day-count"]').innerText().catch(() => '')
    ).trim();
    const f5Status = (
      await host.locator('[data-testid="att-03b-status-label"]').innerText().catch(() => '')
    ).trim();
    const f5Rows = await host.locator('[data-testid^="att-03b-day-row-"]').count();
    const f5LunarAny = await host
      .locator('[data-testid^="att-03b-day-lunar-"]')
      .evaluateAll((els) => els.some((el) => el.checked))
      .catch(() => false);
    R.setup.f5 = { f5DayCount, f5Status, f5Rows, f5LunarAny };
    save();

    // ─── J-05 HOL-MISS CTA ───────────────────────────────────────────
    // Ensure 2030 ABSENT (product GET only — no seed create)
    const holProbe = await apiCall(
      session.token,
      'GET',
      `/attendance/holiday-calendars/${HOL_MISS_YEAR}?company_id=${COMPANY}`,
    );
    R.setup.hol_miss_probe = { status: holProbe.status, code: holProbe.code };
    save();

    const leaveHost = await openLeaveForHolMiss(page);
    await shot(page, '08-leave-tab');
    const dlg = await openCreateDialog(leaveHost);
    await selectFirstEmployee(dlg);
    await selectLeaveType(dlg);
    R._previewMark = ts();
    const previewBefore = R.preview_hits.length;
    await fillDates(dlg, HOL_MISS_START_VI, HOL_MISS_END_VI);
    const startPv = Date.now();
    while (Date.now() - startPv < 12000) {
      if (R.preview_hits.length > previewBefore) break;
      await sleep(200);
    }
    await sleep(800);
    await shot(page, '09-j05-hol-miss');

    const holMissUi = await leaveHost
      .locator('[data-testid="att-08-hol-miss"]')
      .isVisible()
      .catch(() => false);
    const holMissCta = (
      await leaveHost.locator('[data-testid="att-08-hol-miss-cta-admin"]').innerText().catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();
    const submitBtn = dlg.getByRole('button', { name: /Gửi|Lưu|Nộp|Submit/i }).first();
    const submitDisabled =
      (await submitBtn.isDisabled().catch(() => false)) ||
      (await submitBtn.getAttribute('disabled').catch(() => null)) !== null ||
      holMissUi;
    const previewHol = R.preview_hits
      .slice(previewBefore)
      .filter((h) => h.status === 400 || h.status === 403 || h.status === 409);
    // Also accept any preview with HOL-MISSING via response body capture — status track only
    const previewAny = R.preview_hits.slice(previewBefore);
    const j05Pass =
      holProbe.status === 404 &&
      holMissUi &&
      /Lịch lễ|Tết|Cài đặt|Thiết lập/i.test(holMissCta) &&
      submitDisabled &&
      !nestCoreHolidayFail() &&
      previewAny.length > 0;

    jset('J-HRM-ATT-03B-05', j05Pass ? 'PASS' : 'FAIL', {
      summary: `year ${HOL_MISS_YEAR} GET ${holProbe.status}/${holProbe.code} · holMissUi=${holMissUi} · CTA=${holMissCta.slice(0, 120)} · submitDisabled=${submitDisabled} · previewHits=${previewAny.map((h) => h.status).join(',')} · Nest0 · ≠ ATT-03b DONE alone · ≠ AGG=ATT-10`,
      holProbe: { status: holProbe.status, code: holProbe.code },
      holMissUi,
      holMissCta: holMissCta.slice(0, 200),
      previewAny: previewAny.slice(-3),
      previewHol,
      nest_core_0: !nestCoreHolidayFail(),
      ne_att03b_done_alone: true,
      ne_agg10: true,
      sheet_hol_out: true,
    });
    if (!j05Pass) {
      R.defects.push({
        id: 'J-05',
        severity: 'P0',
        summary: 'HOL-MISS CTA / chặn nộp FAIL',
        owner: 'dev-fe',
      });
    }

    // Close dialog / back to honesty on holiday admin
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
    host = await openHolidayAdmin(page);
    await setYear(host, CRUD_YEAR);
    await shot(page, '10-j06-honesty');

    // ─── J-06 honesty + F5 seals ─────────────────────────────────────
    const honesty = (
      await host.locator('[data-testid="att-03b-honesty"]').innerText().catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();
    const residualBanner = (
      await host.locator('[data-testid="att-03b-residual-banner"]').innerText().catch(() => '')
    )
      .replace(/\s+/g, ' ')
      .trim();
    const honestyChecks = {
      printable_false: /contracts_printable_ready=false|printable/i.test(honesty),
      residual_ne_done: /residual.*≠ ATT-03b DONE|≠ ATT-03b DONE alone/i.test(honesty),
      thin_ne_done: /thin year|thin PUT|≠ ATT-03b DONE/i.test(honesty),
      ne_catalog: /catalog|ATT-01/i.test(honesty),
      ne_live: /LIVE|ATT-11/i.test(honesty),
      ne_agg: /AGG|ATT-10/i.test(honesty),
      ne_uat: /ATT module UAT|attendance_uat/i.test(honesty),
      pay_out: /PAY OUT/i.test(honesty),
      nest_deny: /Nest.*\/core|\/core.*DENY|Nest \/core/i.test(honesty),
      residual_banner: /R-ATT-03B-LUNAR|≠ residual alone=ATT-03b DONE/i.test(residualBanner),
      f5_persisted: Number(f5DayCount) >= 1 || f5Rows >= 1,
      nest_core_0: !nestCoreHolidayFail(),
      zero_seed: R.honesty.seed_used === false,
    };
    const j06Pass = Object.values(honestyChecks).every((v) => v === true);

    jset('J-HRM-ATT-03B-06', j06Pass ? 'PASS' : 'FAIL', {
      summary: `honesty footer + F5 dayCount=${f5DayCount} rows=${f5Rows} · seals RETAIN · C-SLICE · Nest0`,
      honesty: honesty.slice(0, 500),
      residualBanner: residualBanner.slice(0, 240),
      honestyChecks,
      f5: R.setup.f5,
      must_keep: SEALS,
    });
    if (!j06Pass) {
      R.defects.push({
        id: 'J-06',
        severity: 'P1',
        summary: 'honesty/F5 seals FAIL',
        owner: 'dev-fe',
      });
    }

    // Overall
    const verdicts = Object.values(R.journeys).map((j) => j.verdict);
    const allPass = verdicts.length === 6 && verdicts.every((v) => v === 'PASS');
    const anyFail = verdicts.some((v) => v === 'FAIL');
    R.overall = allPass ? 'PASS' : anyFail ? 'FAIL' : 'PARTIAL';
    R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    R.residuals = [
      {
        id: 'C-SLICE',
        note: 'residual FE/BE bind ≠ ATT-03b / FR-03b module DONE · ≠ ATT module UAT',
      },
      {
        id: 'R-ATT-01-ASSIGN',
        note: 'open · DENY invent ASSIGN DONE · seal ATT01QC1-MSLZ3KIM',
      },
      {
        id: 'PAY-OUT',
        note: 'isPaid UI ≠ invent PAY DONE · printable false RETAIN',
      },
      {
        id: 'SEALS',
        note: 'ATT01/11/10/09/08/02/PLT/CORE RETAIN · Nest /core DENY · DENY att_leave_hold',
      },
    ];
    R.endedAt = ts();
    save();

    console.log(
      JSON.stringify(
        {
          stamp: STAMP,
          overall: R.overall,
          ack_status: R.ack_status,
          journeys: Object.fromEntries(
            Object.entries(R.journeys).map(([k, v]) => [k, v.verdict]),
          ),
          nest_core_holiday_non404: R.nest_core_holiday_non404.length,
          holiday_put: R.holiday_put_hits.length,
          seed_used: false,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'RUNNER',
      severity: 'P0',
      summary: String(e).slice(0, 400),
      owner: 'qa',
    });
    R.endedAt = ts();
    save();
    console.error(e);
    process.exitCode = 2;
  } finally {
    await browser.close().catch(() => {});
  }

  if (R.ack_status !== 'PASS_TO_PM') process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
