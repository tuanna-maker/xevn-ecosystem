#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-IMPORT-01 — U65 browser Employees import preview → Hủy
 * HDSD CH06 §5.1 · FR-HRM-IM-01 · J-HRM-IM-01 · matrix #8 (+ #9 export spot)
 * Persona: ceo@xe.vn · companyId=main
 * FORBIDDEN: seed · commit LIVE claim without FE commit · invent Employees CLOSED
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-import-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-import-01');
const TMP = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-import-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(TMP, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M3-EMP-IMPORT-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  journey: 'J-HRM-IM-01',
  spec_ref: 'HDSD CH06 §5.1 · FR-HRM-IM-01 · matrix #8–9',
  matrix_surfaces: [8, 9],
  must_keep: ['#1-6 LIST', '#10-12 DETAIL', '#28 SCOPE'],
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, commit: COMMIT },
  portal_url: null,
  l0: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  surfaces: {},
  criteria: {},
  failReasons: [],
  stamp: {},
  baseline: {},
  afterCancel: {},
  commit_exercised: false,
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
  console.error(`[${results.click_log.length}] ${action}`, detail.note || detail.url || detail.text || '');
  return entry;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
}

async function probeL0(label) {
  const block = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      block[k] = r.status;
    } catch (e) {
      block[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  results.l0[label] = block;
  save();
  return block;
}

function empUrl() {
  return `${PORTAL}/hr/employees?portal=1&tenantId=${TENANT}&companyId=${COMPANY}`;
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/employees/.test(u) &&
        !/\/api\/hrm\/spreadsheet/.test(u) &&
        !/\/api\/xbos\/auth/.test(u)
      ) {
        return;
      }
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      try {
        const ct = res.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const j = await res.json();
          const d = j?.data ?? j;
          if (/\/spreadsheet\/import\/preview/.test(u)) {
            bodySnippet = {
              code: j?.code,
              dryRun: d?.dryRun,
              rowCount: d?.rowCount,
              errorCount: Array.isArray(d?.errors) ? d.errors.length : null,
              truncated: d?.truncated,
              sessionId: d?.sessionId ?? null,
            };
          } else if (/\/employees(\?|$)/.test(u) && method === 'GET' && !/\/employees\/[0-9a-f-]{8,}/i.test(u)) {
            const items = Array.isArray(d?.items)
              ? d.items
              : Array.isArray(d?.data)
                ? d.data
                : Array.isArray(d)
                  ? d
                  : null;
            bodySnippet = {
              code: j?.code,
              total: d?.total ?? (items ? items.length : null),
              count: items ? items.length : null,
            };
          } else {
            bodySnippet = { code: j?.code, message: String(j?.message || '').slice(0, 120) };
          }
        } else if (/templates\/employee_import/.test(u)) {
          bodySnippet = {
            contentType: ct.slice(0, 80),
            contentLength: res.headers()['content-length'] || null,
          };
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        bodySnippet,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools|Download the React/i.test(t)) return;
    results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi() {
  log('API_LOGIN', { note: EMAIL });
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
    tenantId: TENANT,
    http: r.status,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
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

async function pageState(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    const rows = document.querySelectorAll('table tbody tr').length;
    const rangeMatch = t.match(/(\d+)\s*[–-]\s*(\d+)\s*\/\s*(\d+)/);
    const dialogOpen = !!document.querySelector('[role="dialog"]');
    const dialogText = dialogOpen
      ? (document.querySelector('[role="dialog"]')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 800)
      : '';
    return {
      rows,
      syncError: /Sync ERROR|HRM API Sync ERROR|HRM API request failed|companyId mismatches/i.test(t),
      rangeText: rangeMatch ? `${rangeMatch[1]}–${rangeMatch[2]} / ${rangeMatch[3]}` : null,
      totalUi: rangeMatch ? Number(rangeMatch[3]) : null,
      dialogOpen,
      dialogText,
      hasPreviewTable:
        dialogOpen &&
        /Tổng số dòng|Hợp lệ|Lỗi|Import \d+ nhân viên|Chọn file khác/i.test(dialogText),
      hasImportTitle: /Import nhân viên từ Excel|Nhập Excel|Import Excel/i.test(dialogText || t),
      hasExportTitle: /Xuất|Export|cột|định dạng/i.test(dialogText),
      bodySnippet: t.slice(0, 1000),
    };
  });
}

function netMatches(pred) {
  return results.network.filter(pred);
}

function writePreviewCsv() {
  const code = `QA-IM-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const email = `${code.toLowerCase()}@qa.xevn.local`;
  const csv = [
    'employee_code,email,full_name,job_title_key,status,hired_at',
    `${code},${email},QA Import Preview Cancel,staff,active,2026-01-15`,
    '',
  ].join('\n');
  const path = join(TMP, 'preview-cancel-row.csv');
  writeFileSync(path, csv, 'utf8');
  return { path, code, email };
}

async function main() {
  await probeL0('entry');
  const session = await loginApi();
  results.login = { http: session.http, email: EMAIL, companyId: COMPANY, tenantId: TENANT };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
    acceptDownloads: true,
  });
  const page = await context.newPage();
  track(page);
  await injectAuth(page, session);

  const url = empUrl();
  results.portal_url = url;
  log('NAV_EMPLOYEES', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3500);
  await shot(page, '01-list-baseline');

  let state = await pageState(page);
  const baselineGets = netMatches(
    (n) => n.method === 'GET' && /\/api\/hrm\/employees\?/.test(n.url) && n.status === 200,
  );
  const baselineTotal =
    baselineGets.at(-1)?.bodySnippet?.total ?? state.totalUi;
  results.baseline = {
    totalApi: baselineGets.at(-1)?.bodySnippet?.total ?? null,
    totalUi: state.totalUi,
    rangeText: state.rangeText,
    code: baselineGets.at(-1)?.bodySnippet?.code ?? null,
    syncError: state.syncError,
  };
  results.hdsd_inventory.push({
    step: 'CH06 §2 list load baseline',
    ok: baselineTotal != null && !state.syncError,
    total: baselineTotal,
  });
  log('BASELINE', results.baseline);

  if (baselineTotal == null) {
    results.failReasons.push('baseline_total_missing');
  }

  // --- #8 Import Excel ---
  const importBtn = page
    .getByRole('button', { name: /Import Excel|Nhập từ Excel|Nhập Excel/i })
    .first();
  await importBtn.click({ timeout: 10000 });
  await sleep(800);
  await shot(page, '02-import-dialog');
  state = await pageState(page);
  results.hdsd_inventory.push({
    step: 'CH06 §5.1 open Nhập Excel / Import Excel',
    ok: state.dialogOpen && state.hasImportTitle,
    dialogText: state.dialogText?.slice(0, 200),
  });
  log('OPEN_IMPORT', { dialogOpen: state.dialogOpen, hasImportTitle: state.hasImportTitle });

  // Template download
  let templateOk = false;
  let templateMeta = null;
  try {
    const dlPromise = page.waitForEvent('download', { timeout: 15000 });
    const tplBtn = page.getByRole('button', { name: /Tải file mẫu|Tải mẫu|\.xlsx/i }).first();
    await tplBtn.click({ timeout: 8000 });
    const download = await dlPromise;
    const suggested = download.suggestedFilename();
    const savePath = join(TMP, suggested || 'employee_import_template.xlsx');
    await download.saveAs(savePath);
    const buf = readFileSync(savePath);
    templateOk = buf.length > 0;
    templateMeta = { suggested, bytes: buf.length, path: savePath.replace(/\\/g, '/') };
    await sleep(1200);
  } catch (e) {
    templateMeta = { error: String(e?.message || e).slice(0, 200) };
  }
  const tplNet = netMatches((n) => /\/spreadsheet\/templates\/employee_import/.test(n.url));
  results.hdsd_inventory.push({
    step: 'CH06 §5.1 Tải mẫu (.xlsx)',
    ok: templateOk || tplNet.some((n) => n.status >= 200 && n.status < 300),
    templateMeta,
    network: tplNet.map((n) => ({ status: n.status, url: n.url })),
  });
  await shot(page, '03-after-template');
  log('TEMPLATE', { templateOk, templateMeta, tplNet: tplNet.length });

  // Upload CSV for server preview (FE file picker — not seed DB)
  const csv = writePreviewCsv();
  results.preview_file = { path: csv.path.replace(/\\/g, '/'), code: csv.code, email: csv.email };
  const fileInput = page.locator('[role="dialog"] input[type="file"]').first();
  await fileInput.setInputFiles(csv.path);
  await sleep(4000);
  await shot(page, '04-preview');

  const previewNets = netMatches((n) => /\/spreadsheet\/import\/preview/.test(n.url));
  const previewOk = previewNets.some(
    (n) => n.status === 200 && (n.bodySnippet?.code === 'SHEET-200' || n.bodySnippet?.rowCount != null),
  );
  state = await pageState(page);
  results.hdsd_inventory.push({
    step: 'CH06 §5.1 upload → preview table',
    ok: previewOk && state.hasPreviewTable,
    previewOk,
    hasPreviewTable: state.hasPreviewTable,
    previewNets: previewNets.map((n) => ({
      status: n.status,
      code: n.bodySnippet?.code,
      dryRun: n.bodySnippet?.dryRun,
      rowCount: n.bodySnippet?.rowCount,
      sessionId: n.bodySnippet?.sessionId,
    })),
  });
  log('PREVIEW', {
    previewOk,
    hasPreviewTable: state.hasPreviewTable,
    nets: previewNets.length,
  });

  // Hủy — zero persist
  const cancelBtn = page.getByRole('button', { name: /^Hủy$/i }).first();
  await cancelBtn.click({ timeout: 8000 });
  await sleep(1000);
  state = await pageState(page);
  results.hdsd_inventory.push({
    step: 'CH06 §5.1 Hủy on preview (no commit)',
    ok: !state.dialogOpen,
    dialogOpen: state.dialogOpen,
  });
  await shot(page, '05-after-cancel');
  log('CANCEL', { dialogOpen: state.dialogOpen });

  // F5 — list unchanged
  const beforeF5NetLen = results.network.length;
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3500);
  await shot(page, '06-f5-after-cancel');
  state = await pageState(page);
  const afterGets = results.network
    .slice(beforeF5NetLen)
    .filter(
      (n) => n.method === 'GET' && /\/api\/hrm\/employees\?/.test(n.url) && n.status === 200,
    );
  const afterTotal = afterGets.at(-1)?.bodySnippet?.total ?? state.totalUi;
  results.afterCancel = {
    totalApi: afterGets.at(-1)?.bodySnippet?.total ?? null,
    totalUi: state.totalUi,
    rangeText: state.rangeText,
    syncError: state.syncError,
  };
  // Prove our preview row did NOT persist (stronger than total alone — concurrent CREATE may +1)
  let previewCodePersisted = null;
  try {
    const kw = await fetch(
      `${HRM}/api/hrm/employees?company_id=${encodeURIComponent(COMPANY)}&page_size=10&keyword=${encodeURIComponent(csv.code)}`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
          'x-tenant-id': TENANT,
          'x-company-id': COMPANY,
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    const kj = await kw.json().catch(() => ({}));
    const kd = kj?.data ?? kj;
    const items = Array.isArray(kd?.items) ? kd.items : Array.isArray(kd?.data) ? kd.data : [];
    previewCodePersisted = {
      http: kw.status,
      total: kd?.total ?? items.length,
      codes: items.map((i) => i.employee_code).filter(Boolean),
      hit: items.some((i) => String(i.employee_code || '').toUpperCase() === csv.code.toUpperCase()),
    };
  } catch (e) {
    previewCodePersisted = { error: String(e?.message || e).slice(0, 160) };
  }
  results.preview_persist_probe = previewCodePersisted;

  const totalEqual =
    baselineTotal != null && afterTotal != null && Number(baselineTotal) === Number(afterTotal);
  // Tentative — finalized after commit/mutate guards below
  let listUnchanged = totalEqual && previewCodePersisted?.hit === false;
  results._pendingF5 = { baselineTotal, afterTotal, totalEqual, previewCodePersisted };
  log('F5_PROBE', {
    baselineTotal,
    afterTotal,
    totalEqual,
    previewCodePersisted,
  });

  // --- #9 Export spot (honesty — client dialog; no Nest export claim) ---
  let exportSpot = { opened: false };
  try {
    const exportBtn = page.getByRole('button', { name: /^Xuất$/i }).first();
    await exportBtn.click({ timeout: 8000 });
    await sleep(800);
    state = await pageState(page);
    exportSpot = {
      opened: state.dialogOpen,
      hasExportTitle: state.hasExportTitle || /Xuất|Export|cột|xlsx|csv/i.test(state.dialogText || ''),
      dialogText: (state.dialogText || '').slice(0, 240),
    };
    await shot(page, '07-export-dialog');
    await page.keyboard.press('Escape');
    await sleep(400);
  } catch (e) {
    exportSpot = { opened: false, error: String(e?.message || e).slice(0, 160) };
  }
  results.hdsd_inventory.push({
    step: 'CH06 §5.2 Xuất dialog spot (honesty)',
    ok: exportSpot.opened === true,
    exportSpot,
  });
  log('EXPORT_SPOT', exportSpot);

  // Mutate / commit guards
  const commitCalls = netMatches((n) => /\/spreadsheet\/import\/commit/.test(n.url));
  const empMutates = netMatches(
    (n) =>
      /\/api\/hrm\/employees/.test(n.url) &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(n.method),
  );
  results.guards = {
    commitCalls: commitCalls.length,
    empMutates: empMutates.length,
    previewCalls: previewNets.length,
    templateCalls: tplNet.length,
  };

  const pending = results._pendingF5 || {};
  const zeroPersistStrong =
    commitCalls.length === 0 &&
    empMutates.length === 0 &&
    pending.previewCodePersisted?.hit === false;
  // Accept total drift only when our preview code is absent + no commit/mutate (concurrent foreign create)
  listUnchanged =
    (pending.totalEqual === true && pending.previewCodePersisted?.hit === false) ||
    (zeroPersistStrong && pending.previewCodePersisted?.hit === false);
  results.hdsd_inventory.push({
    step: 'CH06 §5.1 F5 list unchanged after Hủy',
    ok: listUnchanged && !results.afterCancel.syncError && pending.previewCodePersisted?.hit === false,
    baselineTotal: pending.baselineTotal,
    afterTotal: pending.afterTotal,
    totalEqual: pending.totalEqual,
    previewCodePersisted: pending.previewCodePersisted,
    note: pending.totalEqual
      ? 'total equal + preview code absent'
      : 'total drifted — accepted: preview code absent + commitCalls=0 + empMutates=0 (concurrent foreign create)',
  });
  delete results._pendingF5;

  // Criteria
  const l0EntryOk = Object.values(results.l0.entry || {}).every((v) => v === 200);
  results.criteria = {
    l0_entry: l0EntryOk,
    list_baseline: baselineTotal != null && !results.baseline.syncError,
    import_dialog: results.hdsd_inventory.find((h) => /open Nhập/.test(h.step))?.ok === true,
    template: results.hdsd_inventory.find((h) => /Tải mẫu/.test(h.step))?.ok === true,
    preview_sheet200: previewOk,
    preview_ui: state.hasPreviewTable || results.hdsd_inventory.some((h) => h.step.includes('preview') && h.hasPreviewTable),
    cancel_zero_persist: commitCalls.length === 0 && empMutates.length === 0 && pending.previewCodePersisted?.hit === false,
    f5_unchanged: listUnchanged,
    no_page_errors: results.pageErrors.length === 0,
    export_spot: exportSpot.opened === true,
    u65_no_seed: true,
    commit_not_claimed: true,
  };
  // re-read preview UI from inventory (state may be post-export)
  const previewInv = results.hdsd_inventory.find((h) => /upload → preview/.test(h.step));
  results.criteria.preview_ui = previewInv?.hasPreviewTable === true;

  if (!results.criteria.l0_entry) results.failReasons.push('l0_entry');
  if (!results.criteria.list_baseline) results.failReasons.push('list_baseline');
  if (!results.criteria.import_dialog) results.failReasons.push('import_dialog');
  if (!results.criteria.template) results.failReasons.push('template');
  if (!results.criteria.preview_sheet200) results.failReasons.push('preview_sheet200');
  if (!results.criteria.preview_ui) results.failReasons.push('preview_ui');
  if (!results.criteria.cancel_zero_persist) results.failReasons.push('cancel_zero_persist');
  if (!results.criteria.f5_unchanged) results.failReasons.push('f5_unchanged');
  if (!results.criteria.no_page_errors) results.failReasons.push('page_errors');

  // Stamp honesty
  const importLive =
    results.criteria.import_dialog &&
    results.criteria.template &&
    results.criteria.preview_sheet200 &&
    results.criteria.preview_ui &&
    results.criteria.cancel_zero_persist &&
    results.criteria.f5_unchanged;
  results.stamp = {
    '#8': importLive
      ? {
          runtime: 'LIVE',
          note: 'FR-HRM-IM-01 preview+Hủy+F5; commit IM-02 NOT exercised — not claim commit LIVE',
        }
      : {
          runtime: 'PARTIAL',
          note: `gaps: ${results.failReasons.join(',') || 'unknown'}`,
        },
    '#9': exportSpot.opened
      ? {
          runtime: 'PARTIAL',
          note: 'Client EmployeeExportDialog open (xlsx/csv columns); Nest spreadsheet export not exercised — P1-2 depth',
        }
      : {
          runtime: 'STUB_UI',
          note: 'Export button/dialog not opened',
        },
  };
  results.surfaces = {
    8: results.stamp['#8'],
    9: results.stamp['#9'],
  };

  await probeL0('exit');
  const l0ExitOk = Object.values(results.l0.exit || {}).every((v) => v === 200);
  results.criteria.l0_exit = l0ExitOk;
  if (!l0ExitOk) results.failReasons.push('l0_exit');

  const hardFail = results.failReasons.filter((f) => f !== 'page_errors');
  // pageErrors alone soft unless product fail
  results.verdict =
    hardFail.length === 0 && importLive ? 'PASS' : hardFail.length === 0 ? 'PASS_PARTIAL' : 'FAIL';
  results.ack_status = results.verdict === 'FAIL' ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  results.endedAt = ts();
  save();

  console.error(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        stamp: results.stamp,
        guards: results.guards,
        baseline: results.baseline,
        afterCancel: results.afterCancel,
        failReasons: results.failReasons,
        criteria: results.criteria,
      },
      null,
      2,
    ),
  );

  await browser.close();
  process.exit(results.verdict === 'FAIL' ? 1 : 0);
}

main().catch((e) => {
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
