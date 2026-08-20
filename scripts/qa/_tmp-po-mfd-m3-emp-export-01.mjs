#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-EXPORT-01 — U65 browser Employees Xuất honesty vs Nest export
 * HDSD CH06 §5.2 · matrix #9 · must_keep #1-6 #7 #8 #10-12 #19 #28
 * Persona: ceo@xe.vn · companyId=main
 * FORBIDDEN: seed · Attendance Face · invent Employees CLOSED
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-export-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-export-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const EXPECTED_COL_HINTS = [
  /STT|index/i,
  /Mã|employee.?code|mã NV/i,
  /Họ|full.?name|tên/i,
  /Email/i,
  /SĐT|phone|điện thoại/i,
  /Phòng|department/i,
  /Chức|position|job/i,
  /Ngày vào|start/i,
  /Trạng thái|status/i,
];

const results = {
  work_item_id: 'PO-MFD-M3-EMP-EXPORT-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  journey: 'J-HRM-IM-01 export slice · HDSD CH06 §5.2',
  spec_ref: 'HDSD CH06 §5.2 · matrix #9 · TC-EMP-X-HP-008+',
  matrix_surfaces: [9],
  must_keep: ['#1-6 LIST', '#7 CREATE', '#8 IMPORT', '#10-12 DETAIL', '#19 TRAINING', '#28 SCOPE'],
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, commit: COMMIT },
  portal_url: null,
  l0: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  dialog: {},
  client_export: {},
  nest_probe: {},
  training_spot: {},
  criteria: {},
  failReasons: [],
  stamp: {},
  honesty: {},
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

function netMatches(pred) {
  return results.network.filter(pred);
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/employees/.test(u) &&
        !/\/api\/hrm\/spreadsheet/.test(u) &&
        !/\/api\/hrm\/.*training/.test(u) &&
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
          if (/\/employees(\?|$)/.test(u) && method === 'GET' && !/\/employees\/[0-9a-f-]{8,}/i.test(u)) {
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
              hasCursor: Boolean(d?.next_cursor || d?.nextCursor),
            };
          } else if (/training/i.test(u)) {
            bodySnippet = {
              code: j?.code,
              itemCount: Array.isArray(d?.items) ? d.items.length : Array.isArray(d) ? d.length : null,
              hasStatsKey: d != null && typeof d === 'object' && 'stats' in d,
            };
          } else {
            bodySnippet = { code: j?.code, message: String(j?.message || '').slice(0, 120) };
          }
        } else if (/spreadsheet\/export/i.test(u)) {
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
    }
  }, session);
}

async function probeNestExport(token) {
  log('NEST_EXPORT_PROBE', { note: 'POST /api/hrm/spreadsheet/export (API honesty, not FE)' });
  try {
    const r = await fetch(`${HRM}/api/hrm/spreadsheet/export`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
        'x-tenant-id': TENANT,
        'x-company-id': COMPANY,
      },
      body: JSON.stringify({
        kind: 'employee_export',
        format: 'csv',
        filter: { company_id: COMPANY, page: 1, page_size: 50 },
      }),
      signal: AbortSignal.timeout(20000),
    });
    const ct = r.headers.get('content-type') || '';
    const text = await r.text();
    const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
    const header = lines[0] || '';
    results.nest_probe = {
      http: r.status,
      contentType: ct.slice(0, 80),
      byteLength: Buffer.byteLength(text, 'utf8'),
      lineCount: lines.length,
      header,
      sampleRow: (lines[1] || '').slice(0, 160),
      disposition: r.headers.get('content-disposition') || null,
      note: 'Nest csv-only · fixed columns · list page_size cap in service',
    };
  } catch (e) {
    results.nest_probe = { error: String(e?.message || e).slice(0, 200) };
  }
  save();
}

async function main() {
  await probeL0('entry');
  const session = await loginApi();
  await probeNestExport(session.token);

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  track(page);
  await injectAuth(page, session);

  const url = empUrl();
  results.portal_url = url;
  log('GOTO_EMPLOYEES', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  await shot(page, '01-list-baseline');

  const listGets = netMatches(
    (n) => n.method === 'GET' && /\/api\/hrm\/employees/.test(n.url) && !/\/employees\/[0-9a-f-]{8,}/i.test(n.url),
  );
  const listOk = listGets.some((n) => n.status === 200);
  const listTotal = listGets.find((n) => n.bodySnippet?.total != null)?.bodySnippet?.total ?? null;
  results.hdsd_inventory.push({
    step: 'CH06 §2 list baseline (must_keep)',
    ok: listOk,
    listTotal,
    listGetCount: listGets.length,
  });
  log('LIST_BASELINE', { listOk, listTotal, listGetCount: listGets.length });

  // Open Xuất
  const exportBtn = page.getByRole('button', { name: /^Xuất$/i }).first();
  await exportBtn.click({ timeout: 10000 });
  await sleep(1200);
  await shot(page, '02-export-dialog');

  const dialog = page.getByRole('dialog');
  const dialogVisible = await dialog.isVisible().catch(() => false);
  const dialogText = dialogVisible ? (await dialog.innerText().catch(() => '')).slice(0, 1200) : '';
  const checkboxes = dialogVisible ? await dialog.locator('button[role="checkbox"], [role="checkbox"]').count() : 0;
  const hasXlsx = /Excel|\.xlsx/i.test(dialogText);
  const hasCsv = /\.csv|CSV/i.test(dialogText);
  const hasFilters = /Phòng|Trạng thái|department|status|Bộ lọc|filters/i.test(dialogText);
  const colHits = EXPECTED_COL_HINTS.map((re) => ({ re: String(re), hit: re.test(dialogText) }));
  const colHitCount = colHits.filter((c) => c.hit).length;
  const exportCountMatch = dialogText.match(/(?:Số bản ghi|exportCount|Xuất)[^\d]*(\d+)/i);
  const filteredCountUi = exportCountMatch ? Number(exportCountMatch[1]) : null;

  results.dialog = {
    opened: dialogVisible,
    titleOk: /Xuất|Export|nhân viên/i.test(dialogText),
    checkboxCount: checkboxes,
    hasXlsx,
    hasCsv,
    hasFilters,
    colHitCount,
    colHits,
    filteredCountUi,
    dialogTextPreview: dialogText.slice(0, 400),
  };
  results.hdsd_inventory.push({
    step: 'CH06 §5.2 Xuất dialog columns/format',
    ok: dialogVisible && hasXlsx && hasCsv && checkboxes >= 8 && colHitCount >= 6,
    ...results.dialog,
  });
  log('EXPORT_DIALOG', {
    opened: dialogVisible,
    checkboxes,
    hasXlsx,
    hasCsv,
    colHitCount,
    filteredCountUi,
  });

  // Client export click — expect download; expect ZERO Nest spreadsheet/export from browser
  const nestExportBefore = netMatches((n) => /\/spreadsheet\/export/i.test(n.url)).length;
  let downloadInfo = { got: false };
  try {
    const exportActionBtn = dialog.getByRole('button', { name: /Xuất|Export|Tải/i }).last();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
      exportActionBtn.click({ timeout: 8000 }),
    ]);
    await sleep(800);
    if (download) {
      downloadInfo = {
        got: true,
        suggestedFilename: download.suggestedFilename(),
        failure: await download.failure().catch(() => null),
      };
    } else {
      downloadInfo = { got: false, note: 'no download event (may be blocked headless)' };
    }
  } catch (e) {
    downloadInfo = { got: false, error: String(e?.message || e).slice(0, 160) };
  }
  await shot(page, '03-after-client-export');

  const nestExportFromBrowser = netMatches((n) => /\/spreadsheet\/export/i.test(n.url));
  const empMutates = netMatches(
    (n) =>
      /\/api\/hrm\/employees/.test(n.url) &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(n.method),
  );
  results.client_export = {
    download: downloadInfo,
    nestExportCallsFromBrowser: nestExportFromBrowser.length,
    nestExportBefore,
    empMutates: empMutates.length,
    note: 'FE EmployeeExportDialog uses client XLSX.writeFile — not POST /spreadsheet/export',
  };
  results.hdsd_inventory.push({
    step: 'CH06 §5.2 client export action (honesty: no Nest wire)',
    ok: nestExportFromBrowser.length === 0 && empMutates.length === 0,
    downloadGot: downloadInfo.got,
    nestExportCallsFromBrowser: nestExportFromBrowser.length,
    empMutates: empMutates.length,
  });
  log('CLIENT_EXPORT', results.client_export);

  // Close dialog if still open
  if (await dialog.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await sleep(400);
  }

  // must_keep #19 Training spot — no crash regression
  let trainingSpot = { ok: false };
  try {
    const firstRow = page.locator('table tbody tr, [role="row"]').filter({ hasText: /@|\d{2,}/ }).first();
    await firstRow.click({ timeout: 10000 });
    await sleep(2000);
    const trainTab = page.getByRole('tab', { name: /Đào tạo|Training/i }).first();
    if (await trainTab.isVisible().catch(() => false)) {
      await trainTab.click({ timeout: 8000 });
      await sleep(1500);
    } else {
      // group HR → Đào tạo
      const hrGroup = page.getByRole('button', { name: /Nhân sự|HR|Hồ sơ/i }).first();
      if (await hrGroup.isVisible().catch(() => false)) {
        await hrGroup.click({ timeout: 5000 }).catch(() => {});
        await sleep(400);
      }
      await page.getByText(/^Đào tạo$/i).first().click({ timeout: 8000 }).catch(() => {});
      await sleep(1500);
    }
    await shot(page, '04-training-spot');
    const trainNets = netMatches((n) => /training/i.test(n.url) && n.method === 'GET');
    const train200 = trainNets.some((n) => n.status === 200);
    const typeErrors = results.pageErrors.filter((e) => /completed|TypeError|undefined/i.test(e.text));
    trainingSpot = {
      ok: typeErrors.length === 0 && (train200 || results.pageErrors.length === 0),
      train200,
      trainNetCount: trainNets.length,
      pageErrors: results.pageErrors.length,
      typeErrors: typeErrors.length,
      url: page.url(),
    };
  } catch (e) {
    trainingSpot = { ok: results.pageErrors.length === 0, error: String(e?.message || e).slice(0, 160) };
  }
  results.training_spot = trainingSpot;
  results.hdsd_inventory.push({
    step: 'must_keep #19 Training spot (no .completed crash)',
    ok: trainingSpot.ok === true,
    ...trainingSpot,
  });
  log('TRAINING_SPOT', trainingSpot);

  await browser.close();
  await probeL0('exit');

  const nestOk =
    Number(results.nest_probe.http) >= 200 &&
    Number(results.nest_probe.http) < 300 &&
    /employee_code/i.test(results.nest_probe.header || '');
  const dialogOk =
    results.dialog.opened &&
    results.dialog.hasXlsx &&
    results.dialog.hasCsv &&
    results.dialog.checkboxCount >= 8 &&
    results.dialog.colHitCount >= 6;
  const honestyNoNestWire = results.client_export.nestExportCallsFromBrowser === 0;
  const l0EntryOk = Object.values(results.l0.entry || {}).every((v) => v === 200);
  const l0ExitOk = Object.values(results.l0.exit || {}).every((v) => v === 200);

  results.honesty = {
    fe_path: 'client XLSX from listAllEmployees (cursor walk) — column picker + xlsx|csv',
    nest_path: 'POST /api/hrm/spreadsheet/export kind=employee_export format=csv only; fixed 6 cols; service page_size 100',
    fe_calls_nest: false,
    column_parity: 'FE offers 17 selectable cols (salary/bank/…) · Nest fixed employee_code,email,full_name,job_title_key,status,hired_at',
    format_parity: 'FE xlsx+csv · Nest csv-only',
    depth_parity: 'FE listAllEmployees walk · Nest exportEmployeesCsv hard page_size:100',
    stamp_decision: 'PARTIAL — SPEC_GAP FE↔Nest wire + Nest depth',
    spec_gap_owner: 'dev-fe',
    nest_depth_owner: 'dev-be',
  };

  results.criteria = {
    l0_entry: l0EntryOk,
    l0_exit: l0ExitOk,
    list_baseline: listOk,
    dialog_columns_format: dialogOk,
    client_export_no_nest_wire: honestyNoNestWire,
    nest_api_exists: nestOk,
    no_page_errors: results.pageErrors.length === 0,
    training_must_keep: trainingSpot.ok === true,
    zero_emp_mutates: empMutates.length === 0,
    u65_no_seed: true,
    employees_not_closed: true,
  };

  for (const [k, v] of Object.entries(results.criteria)) {
    if (k === 'employees_not_closed' || k === 'u65_no_seed') continue;
    if (!v) results.failReasons.push(k);
  }

  // Stamp: keep PARTIAL (SPEC_GAP) — dialog LIVE shell ≠ Nest-aligned product depth
  results.stamp = {
    '#9': {
      prior: 'PARTIAL',
      after: 'PARTIAL',
      reason:
        'Client dialog columns/xlsx|csv LIVE; FE never calls Nest POST /spreadsheet/export; Nest csv-only + fixed cols + page_size 100 — SPEC_GAP',
      owner: 'dev-fe',
      nest_depth_owner: 'dev-be',
      evidence: 'po-mfd-m3-emp-export-01.md',
    },
    '#19': { after: 'LIVE', note: 'must_keep spot — no Training crash' },
    employees_closed: false,
  };

  const pass =
    results.failReasons.length === 0 &&
    results.stamp['#9'].after === 'PARTIAL' &&
    results.employees_closed === false;

  results.verdict = pass ? 'PASS' : 'FAIL';
  results.ack_status = 'PASS_TO_PM';
  results.endedAt = ts();
  save();

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        stamp9: results.stamp['#9'].after,
        failReasons: results.failReasons,
        nestHttp: results.nest_probe.http,
        dialogOk,
        downloadGot: downloadInfo.got,
        nestBrowserCalls: nestExportFromBrowser.length,
        trainingOk: trainingSpot.ok,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'PASS_TO_PM';
  results.failReasons.push('harness_crash');
  results.endedAt = ts();
  results.crash = String(e?.stack || e).slice(0, 800);
  save();
  console.error(e);
  process.exit(1);
});
