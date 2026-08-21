#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-TRAINING-QA-01 — U65 browser retest matrix #19 Đào tạo
 * Parent FAIL: RUNTIME-01 pageError stats.completed
 * FE fix: PO-MFD-M3-EMP-TRAINING-FIX-01
 * Path: login → Employees → profile → nhóm HR → Đào tạo → F5
 * No seed · no mutate · must_keep LIST/CREATE/DETAIL/IMPORT/SCOPE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const TENANT = 'xevn';
const COMPANY = 'main';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-training-qa-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01');
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
  work_item_id: 'PO-MFD-M3-EMP-TRAINING-QA-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  journeys: ['J-HRM-02'],
  matrix_surface: [19],
  must_keep: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 28],
  persona: { email: EMAIL, tenantId: TENANT, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, commit: COMMIT },
  l0: {},
  click_log: [],
  network: [],
  mutates: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  surfaces: {},
  criteria: {},
  failReasons: [],
  verdict: null,
  ack_status: null,
  employees_closed: false,
  attendance_closed: false,
  uat_done: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function log(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[${results.click_log.length}] ${action}`, detail.url || detail.text || detail.note || '');
  return entry;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
}

async function probeL0(phase) {
  const bucket = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      bucket[k] = r.status;
    } catch (e) {
      bucket[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  results.l0[phase] = bucket;
  save();
  return bucket;
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u) && !/\/api\/xbos\/auth/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        results.mutates.push({
          at: ts(),
          method,
          status: res.status(),
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        });
      }
      let bodySnippet = null;
      try {
        if (method === 'GET' && /\/training/i.test(u)) {
          const j = await res.json();
          const d = j?.data ?? j;
          const items = Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : null;
          bodySnippet = {
            code: j?.code,
            itemCount: items?.length ?? (Array.isArray(d) ? d.length : null),
            hasStatsKey: d && typeof d === 'object' && !Array.isArray(d) ? 'stats' in d : false,
          };
        } else if (method === 'GET' && /\/employees/.test(u)) {
          const j = await res.json();
          const d = j?.data ?? j;
          const items = Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : null;
          if (items?.[0]) {
            bodySnippet = {
              total: d?.total ?? items.length,
              first: {
                id: items[0].id,
                company_id: items[0].company_id,
                display_name:
                  items[0].display_name || items[0].full_name || items[0].employee_name,
              },
            };
          } else if (d && typeof d === 'object' && d.id) {
            bodySnippet = {
              id: d.id,
              company_id: d.company_id,
              code: j?.code,
            };
          }
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        bodySnippet,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools/i.test(t)) return;
    results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi() {
  log('API_LOGIN', { email: EMAIL, companyId: COMPANY, tenantId: TENANT });
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed ${EMAIL} HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    email: EMAIL,
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    tenantId: TENANT,
    http: r.status,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || [],
    },
  };
}

async function injectAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', s.tenantId);
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', s.tenantId);
    }
  }, session);
}

async function openTrainingTab(page) {
  for (const sel of [
    '[data-testid="profile-tab-training"]',
    '[data-testid="profile-pinned-tab-training"]',
  ]) {
    const loc = page.locator(sel);
    if ((await loc.count()) > 0 && (await loc.first().isVisible().catch(() => false))) {
      await loc.first().click({ timeout: 6000 });
      await sleep(1400);
      return { via: sel };
    }
  }

  for (const g of ['hr', 'career', 'personal']) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    const btn = page.locator(`[data-testid="profile-group-${g}"]`);
    if ((await btn.count()) === 0) continue;
    await btn.first().click({ timeout: 5000 });
    const panel = page.locator(`[data-testid="profile-group-panel-${g}"]`);
    await panel.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
    await sleep(400);
    const gt = page.locator('[data-testid="profile-group-tab-training"]');
    if ((await gt.count()) > 0) {
      await gt.first().click({ timeout: 6000 });
      await sleep(1400);
      return { via: `group:${g}` };
    }
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
  }

  const byText = page
    .getByRole('button', { name: /Đào tạo/i })
    .or(page.locator('button').filter({ hasText: /Đào tạo/i }));
  if ((await byText.count()) > 0) {
    await byText.first().click({ timeout: 5000 });
    await sleep(1400);
    return { via: 'label' };
  }
  throw new Error('Training tab not found');
}

function trainingGets(slice) {
  return slice.filter(
    (n) => n.method === 'GET' && /\/training/i.test(n.url) && !/OPTIONS/i.test(n.method),
  );
}

function isCompletedCrash(text) {
  return /completed/i.test(text) && /TypeError|undefined|Cannot read/i.test(text);
}

async function main() {
  const entry = await probeL0('entry');
  if (entry.hrm !== 200 || entry.portal !== 200) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push('L0 entry FAIL');
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  results.hdsd_inventory.push({
    surface: 'Login Group CEO (portal proxy)',
    attempted: true,
    http: session.http,
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'vi-VN',
    });
    const page = await ctx.newPage();
    page.setDefaultTimeout(10000);
    track(page);
    await injectAuth(page, session);

    const listUrl = `${PORTAL}/hr/employees?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
    log('NAV_EMPLOYEES', { url: listUrl });
    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §2 Danh sách nhân sự',
      attempted: true,
      persona: EMAIL,
    });
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(4500);
    await shot(page, '01-list');

    const rows = await page.locator('table tbody tr').count();
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 2500) || '');
    const syncError = /Sync ERROR|HRM API.*ERROR|409|companyId mismatches/i.test(bodyText);
    results.surfaces.list = { rows, syncError };
    if (rows === 0 || syncError) {
      results.failReasons.push('list_empty_or_sync_error');
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
      results.endedAt = ts();
      save();
      process.exit(2);
    }

    let target = page.locator('table tbody tr').first();
    const rollupHint = page
      .locator('table tbody tr')
      .filter({ hasText: /holding|Holding|Tập đoàn|du-lich|Du lịch|trsport|vanchuyen/i });
    if (await rollupHint.count()) target = rollupHint.first();
    const rowText = ((await target.textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 140);

    log('CLICK_EMPLOYEE_ROW', { text: rowText });
    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §6 / J-HRM-02 list→hồ sơ',
      attempted: true,
    });
    await target.locator('td').first().click({ timeout: 8000 }).catch(async () => {
      await target.click({ timeout: 8000 });
    });
    await sleep(4500);
    await shot(page, '02-detail-shell');

    const detailUrl = page.url();
    const detailId = detailUrl.match(/\/employees\/([0-9a-f-]{8,})/i)?.[1] || null;
    results.surfaces.detail = { detailUrl: detailUrl.slice(0, 220), detailId };

    const pageErrorsBefore = results.pageErrors.length;
    const consoleBefore = results.consoleErrors.length;
    const netBefore = results.network.length;

    log('OPEN_TRAINING_TAB', { note: 'HDSD CH06 §6.2 nhóm HR → Đào tạo' });
    results.hdsd_inventory.push({
      surface: 'HDSD CH06 §6.2 Tab Đào tạo (SCR-TAB-TRAINING #19)',
      attempted: true,
    });
    const openVia = await openTrainingTab(page);
    await sleep(2000);
    await shot(page, '03-training-tab');

    const trainingNets = trainingGets(results.network.slice(netBefore));
    const trainingOk = trainingNets.filter((n) => n.status >= 200 && n.status < 300);
    const trainingBad = trainingNets.filter((n) => n.status >= 400);

    const ui = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      const white =
        !t.trim() ||
        (document.querySelector('[data-testid="employee-profile-page"]') &&
          !/Đào tạo|Hoàn thành|completed|training|Khóa|Thêm/i.test(t));
      return {
        hasCompletedLabel: /Hoàn thành|Completed|Đã hoàn thành/i.test(t),
        hasInProgress: /Đang học|In progress|Đang diễn ra/i.test(t),
        hasAdd: /\bThêm\b|Add training|Thêm khóa/i.test(t),
        emptyHonesty: /Chưa có|No training|Không có dữ liệu|empty/i.test(t),
        hasNumericStats: /\b0\b|\b[1-9]\d*\b/.test(t),
        crashBanner: /Something went wrong|TypeError|Cannot read/i.test(t),
        bodySnippet: t.replace(/\s+/g, ' ').trim().slice(0, 700),
        whiteCrashSuspect: white,
      };
    });

    const newPageErrors = results.pageErrors.slice(pageErrorsBefore);
    const newConsole = results.consoleErrors.slice(consoleBefore);
    const completedCrash =
      newPageErrors.some((e) => isCompletedCrash(e.text)) ||
      newConsole.some((e) => isCompletedCrash(e.text));

    results.surfaces.training_19 = {
      openVia,
      trainingOk: trainingOk.map((n) => ({
        status: n.status,
        url: n.url,
        bodySnippet: n.bodySnippet,
      })),
      trainingBad: trainingBad.map((n) => ({ status: n.status, url: n.url })),
      pageErrors: newPageErrors,
      consoleErrors: newConsole,
      completedCrash,
      ui,
      mutates: results.mutates.length,
    };

    // F5 → default tab is general; must re-open Đào tạo (tab strip still shows label)
    log('F5_RELOAD', { note: 'reload profile then re-open Đào tạo' });
    const peF5 = results.pageErrors.length;
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(4000);
    const netF5 = results.network.length;
    const f5Via = await openTrainingTab(page);
    await sleep(2000);
    await shot(page, '04-training-f5');
    const f5Nets = trainingGets(results.network.slice(netF5));
    const f5Ok = f5Nets.filter((n) => n.status >= 200 && n.status < 300);
    const f5Errors = results.pageErrors.slice(peF5);
    const f5Crash =
      f5Errors.some((e) => isCompletedCrash(e.text)) || f5Errors.length > 0;
    const uiF5 = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      return {
        hasCompletedLabel: /Đã hoàn thành|Hoàn thành|Completed/i.test(t),
        hasProgram: /Chương trình đào tạo|Thêm khóa/i.test(t),
        crashBanner: /Something went wrong|TypeError|Cannot read/i.test(t),
        bodySnippet: t.replace(/\s+/g, ' ').trim().slice(0, 500),
      };
    });

    results.surfaces.training_f5 = {
      f5Via,
      trainingOk: f5Ok.map((n) => ({ status: n.status, url: n.url, bodySnippet: n.bodySnippet })),
      pageErrors: f5Errors,
      f5Crash,
      ui: uiF5,
    };

    results.hdsd_inventory.push({
      surface: 'F5 → re-open Đào tạo (default tab = chung)',
      attempted: true,
      training_get_2xx: f5Ok.length > 0,
      no_completed_crash: !f5Crash,
      stats_visible: !!(uiF5.hasCompletedLabel && uiF5.hasProgram),
    });

    // Criteria
    const c = {
      l0_entry: entry.hrm === 200 && entry.portal === 200,
      list_ok: rows > 0 && !syncError,
      detail_opened: !!detailId,
      training_get_2xx: trainingOk.length > 0,
      no_pageerror_completed: !completedCrash && newPageErrors.length === 0,
      no_console_completed: !newConsole.some((e) => isCompletedCrash(e.text)),
      ui_stats_visible:
        ui.hasCompletedLabel &&
        (ui.hasAdd || ui.emptyHonesty) &&
        !ui.crashBanner &&
        !ui.whiteCrashSuspect,
      f5_ok:
        f5Ok.length > 0 &&
        !f5Crash &&
        !uiF5.crashBanner &&
        !!uiF5.hasCompletedLabel &&
        !!uiF5.hasProgram,
      zero_mutates: results.mutates.length === 0,
      zero_seed: true,
    };
    results.criteria = c;

    const pass = Object.values(c).every(Boolean);
    if (!pass) {
      for (const [k, v] of Object.entries(c)) {
        if (!v) results.failReasons.push(k);
      }
    }

    results.verdict = pass ? 'PASS' : 'FAIL';
    results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.matrix_stamp = pass ? 'LIVE' : completedCrash || newPageErrors.length ? 'BROKEN' : 'PARTIAL';

    const exit = await probeL0('exit');
    if (exit.hrm !== 200 || exit.portal !== 200) {
      results.failReasons.push('L0 exit FAIL');
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
    }

    results.endedAt = ts();
    save();
    console.error(
      JSON.stringify(
        {
          verdict: results.verdict,
          stamp: results.matrix_stamp,
          trainingOk: trainingOk.length,
          pageErrors: newPageErrors.length,
          f5Ok: f5Ok.length,
          mutates: results.mutates.length,
          failReasons: results.failReasons,
        },
        null,
        2,
      ),
    );
    await ctx.close();
    process.exit(pass && results.verdict === 'PASS' ? 0 : 2);
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.message || e).slice(0, 200));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
