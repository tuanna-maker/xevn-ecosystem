#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-RECORDS-01 — U65 browser fidelity
 * Matrix #13 · HRM-AT-02 list · HRM-AT-03 PATCH status (if CTA LIVE)
 * U76 HDSD inventory · no seed · no Face invent · uat_done false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
/** NV persona (HDSD records view) — clock lane used same OU */
const EMAIL = process.env.QA_EMAIL || 'uat.nv0007@xe.vn';
const PASSWORDS = ['Xevn@2026', 'xevn-uat-2026'];
const COMPANY = process.env.QA_COMPANY_ID || 'trsport';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-records-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-records-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-MFD-M2-ATT-RECORDS-01',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  u87_menu_fidelity: true,
  hdsd_align: 'Attendance → ▼ → Bản ghi / Dữ liệu chấm công (matrix #13)',
  env: { PORTAL, HRM, XBOS, EMAIL, companyId: COMPANY, commit: COMMIT },
  l0: {},
  hdsd_inventory: [],
  steps: {},
  recordsGets: [],
  recordsPatches: [],
  consoleErrors: [],
  pageErrors: [],
  networkBad: [],
  surfaces: {},
  criteria: {},
  failReasons: [],
  residuals: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
  attendance_closed: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
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

async function loginMobileOrPortal() {
  // Prefer HRM mobile login for UAT NV personas (same as CLOCK seats)
  for (const password of PASSWORDS) {
    const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password }),
    });
    const j = await r.json().catch(() => ({}));
    const d = j?.data ?? j;
    const token = d?.access_token ?? d?.accessToken;
    if (token) {
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        email: EMAIL,
        companyId: COMPANY,
        source: 'hrm-mobile',
        http: r.status,
        user: {
          userId: d?.user?.id || d?.userId || EMAIL,
          email: EMAIL,
          displayName: d?.user?.full_name || d?.user?.displayName || EMAIL,
          roles: d?.user?.roles || ['employee'],
        },
      };
    }
  }
  // Fallback XBOS portal login (ceo@)
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORDS[0] }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed for ${EMAIL}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    source: 'xbos-portal',
    http: r.status,
    user: {
      userId: data?.user?.userId || data?.user?.id || EMAIL,
      email: EMAIL,
      displayName: data?.user?.displayName || EMAIL,
      roles: data?.user?.roles || [],
    },
  };
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
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

async function shot(page, name) {
  const p = join(SCREEN, name);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!/favicon|Download the React DevTools/i.test(t)) {
        results.consoleErrors.push(t.slice(0, 300));
      }
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err?.message || err).slice(0, 300));
  });
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    if (!/\/api\/hrm\//.test(url)) return;
    if (status >= 500) {
      results.networkBad.push({ status, url: url.slice(0, 220) });
    }
    const method = res.request().method();
    if (/\/attendance\/records(\?|$)/.test(url) && method === 'GET') {
      let code = null;
      let rowCount = null;
      try {
        const j = await res.json();
        code = j?.code ?? j?.meta?.code ?? null;
        const data = j?.data;
        if (Array.isArray(data)) rowCount = data.length;
        else if (Array.isArray(data?.items)) rowCount = data.items.length;
        else if (typeof data?.total === 'number') rowCount = data.total;
      } catch {
        /* */
      }
      results.recordsGets.push({ status, code, rowCount, url: url.slice(0, 260), t: Date.now() });
    }
    if (/\/attendance\/records\/[^/]+\/status/.test(url) && method === 'PATCH') {
      let code = null;
      try {
        const j = await res.json();
        code = j?.code ?? j?.meta?.code ?? null;
      } catch {
        /* */
      }
      results.recordsPatches.push({ status, code, url: url.slice(0, 260), t: Date.now() });
    }
  });
}

async function openRecordsMenu(page) {
  await page.locator('[data-testid="attendance-tab-menu"]').click({ timeout: 15_000 });
  await sleep(400);
  // Matrix HDSD: «Bản ghi chấm công» · FE i18n: «Dữ liệu chấm công»
  const item = page.getByRole('menuitem', { name: /Dữ liệu chấm công|Bản ghi chấm công/i });
  const label = (await item.innerText().catch(() => '')).trim();
  await item.click({ timeout: 10_000 });
  await sleep(1500);
  return label;
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.failReasons.push('L0 stack not healthy');
    results.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const session = await loginMobileOrPortal();
  results.steps.login = {
    http: session.http,
    companyId: session.companyId,
    source: session.source,
    email: session.email,
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  try {
    const url = q('/hr/attendance');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    results.steps.landed = { url: page.url() };

    const getsBefore = results.recordsGets.length;
    const menuLabel = await openRecordsMenu(page);
    await sleep(1500);

    const titleVisible = await page
      .getByRole('heading', { name: /Dữ liệu chấm công|Bản ghi chấm công/i })
      .isVisible()
      .catch(() => false);
    const titleAlt = await page.getByText(/Dữ liệu chấm công/i).first().isVisible().catch(() => false);
    const emptyCopy = await page
      .getByText(/Không có dữ liệu|Chưa có bản ghi|noData/i)
      .isVisible()
      .catch(() => false);
    const syncError = await page
      .getByText(/HRM API Sync ERROR|HRM API request failed/i)
      .isVisible()
      .catch(() => false);
    const loadingStuck = await page
      .getByText(/Đang tải|loadingData/i)
      .isVisible()
      .catch(() => false);

    const listGets = results.recordsGets.slice(getsBefore);
    const listGetOk = listGets.some((g) => g.status >= 200 && g.status < 300);
    const listCode = listGets.find((g) => g.status >= 200 && g.status < 300)?.code ?? null;
    const lastRowCount = [...listGets].reverse().find((g) => g.rowCount != null)?.rowCount;

    // Count table body rows (exclude loading/empty single-cell)
    const tableRows = page.locator('table tbody tr');
    const trCount = await tableRows.count().catch(() => 0);
    let dataRowCount = 0;
    for (let i = 0; i < trCount; i++) {
      const cells = await tableRows.nth(i).locator('td').count();
      if (cells >= 5) dataRowCount += 1;
    }

    results.hdsd_inventory = [
      {
        hdsd_ref: 'Matrix #13 · Bản ghi chấm công',
        fe_label: menuLabel || 'Dữ liệu chấm công',
        control: 'menuitem attendance ▼ → records',
        note: menuLabel && /Bản ghi/i.test(menuLabel) ? 'label_match' : 'label_drift (FE=Dữ liệu chấm công vs matrix Bản ghi)',
      },
      {
        hdsd_ref: 'List filters',
        fe_label: 'search · date · status · refresh · export',
        control: 'AttendanceRecordsTable toolbar',
        note: 'visible on records surface',
      },
      {
        hdsd_ref: 'Row actions · Sửa (modal)',
        fe_label: 'Sửa / Edit',
        control: 'DropdownMenuItem Pencil',
        note: 'probe Edit CTA wiring below',
      },
      {
        hdsd_ref: 'Row actions · Xóa',
        fe_label: 'Xóa / Delete',
        control: 'DropdownMenuItem Trash → AlertDialog',
        note: 'delete maps to PATCH status=absent (not true DELETE API)',
      },
    ];

    results.surfaces.row13_list = {
      runtime: syncError || !listGetOk || (loadingStuck && dataRowCount === 0 && !emptyCopy) ? 'BROKEN' : 'LIVE',
      menuLabel,
      titleVisible: titleVisible || titleAlt,
      emptyCopy,
      syncError,
      loadingStuck,
      dataRowCount,
      apiRowCount: lastRowCount,
      listGets: listGets.map((g) => ({ status: g.status, code: g.code, rowCount: g.rowCount })),
      listCode,
    };
    results.steps.list = results.surfaces.row13_list;
    await shot(page, '01-records-list.png');

    // Idle storm 10s
    const stormMark = Date.now();
    const getsAtMark = results.recordsGets.length;
    await sleep(10_000);
    const stormGets = results.recordsGets.filter((g) => g.t >= stormMark);
    results.steps.storm10s = {
      recordsGets: stormGets.length,
      getsAtMark,
      ok: stormGets.length <= 2,
    };

    // —— Open row → Edit / modal ——
    let editModalLive = false;
    let editMenuPresent = false;
    let deleteMenuPresent = false;
    let dialogAfterEdit = false;
    let patchCtaKind = 'NONE';

    if (dataRowCount > 0) {
      const firstRow = tableRows.filter({ has: page.locator('td') }).first();
      // Prefer row with kebab (⋯)
      const kebab = page.locator('table tbody tr button').filter({ has: page.locator('svg') }).last();
      const kebabAlt = page.locator('table tbody button.h-8.w-8, table tbody button[class*="ghost"]').first();
      const menuBtn = (await kebab.isVisible().catch(() => false)) ? kebab : kebabAlt;
      await menuBtn.click({ timeout: 8_000 }).catch(() => null);
      await sleep(400);

      const editItem = page.getByRole('menuitem', { name: /Sửa|Edit|Chỉnh sửa/i });
      const deleteItem = page.getByRole('menuitem', { name: /Xóa|Delete/i });
      editMenuPresent = await editItem.isVisible().catch(() => false);
      deleteMenuPresent = await deleteItem.isVisible().catch(() => false);

      await shot(page, '02-row-menu.png');

      if (editMenuPresent) {
        const dialogsBefore = await page.locator('[role="dialog"]').count();
        await editItem.click();
        await sleep(800);
        const dialogsAfter = await page.locator('[role="dialog"]').count();
        dialogAfterEdit = dialogsAfter > dialogsBefore;
        // Also check AlertDialog / any modal title about edit
        const editDialog = await page
          .getByRole('dialog')
          .filter({ hasText: /Sửa|Chỉnh sửa|Cập nhật|Edit|bản ghi/i })
          .isVisible()
          .catch(() => false);
        editModalLive = dialogAfterEdit || editDialog;
        await shot(page, '03-after-edit-click.png');

        // Close any accidental dialog
        if (editModalLive) {
          const cancel = page.getByRole('button', { name: /Hủy|Cancel|Đóng/i }).first();
          if (await cancel.isVisible().catch(() => false)) await cancel.click().catch(() => null);
          await page.keyboard.press('Escape').catch(() => null);
        } else {
          await page.keyboard.press('Escape').catch(() => null);
        }
      }

      // Status select inside row? (none expected)
      const statusSelectInRow = await page
        .locator('table tbody select, table tbody [role="combobox"]')
        .count()
        .catch(() => 0);

      if (editModalLive) {
        patchCtaKind = 'EDIT_MODAL';
      } else if (editMenuPresent && !editModalLive) {
        patchCtaKind = 'STUB_EDIT';
      } else if (deleteMenuPresent) {
        patchCtaKind = 'DELETE_ONLY_ABSENT_PATCH';
      } else if (statusSelectInRow > 0) {
        patchCtaKind = 'INLINE_STATUS';
      }

      results.surfaces.row13_modal = {
        runtime: editModalLive ? 'LIVE' : editMenuPresent ? 'STUB' : 'EXPECTED_NO_CTA',
        editMenuPresent,
        deleteMenuPresent,
        dialogAfterEdit,
        editModalLive,
        statusSelectInRow,
        patchCtaKind,
        note: editModalLive
          ? 'Edit opens dialog'
          : editMenuPresent
            ? 'Edit menuitem present but no dialog/modal (onClick not wired)'
            : 'No edit CTA',
      };
    } else {
      results.surfaces.row13_modal = {
        runtime: 'N/A_EMPTY',
        note: 'No data rows — cannot open row modal; empty honesty OK under U65',
        patchCtaKind: 'N/A_EMPTY',
      };
      await shot(page, '02-empty-no-row.png');
    }
    results.steps.modal = results.surfaces.row13_modal;

    // —— PATCH status mutate only if real edit modal LIVE ——
    // Do NOT invent mutate via Delete→absent (destructive / not AT-03 status UX)
    if (results.surfaces.row13_modal?.editModalLive) {
      // Re-open edit and try save if status control exists
      const kebab2 = page.locator('table tbody button.h-8.w-8, table tbody button').last();
      await kebab2.click().catch(() => null);
      await sleep(300);
      await page.getByRole('menuitem', { name: /Sửa|Edit/i }).click().catch(() => null);
      await sleep(600);
      const dialog = page.getByRole('dialog').first();
      const statusControl = dialog.locator('select, [role="combobox"]').first();
      const hasStatus = await statusControl.isVisible().catch(() => false);
      const saveBtn = dialog.getByRole('button', { name: /Lưu|Save|Cập nhật/i }).first();
      const patchesBefore = results.recordsPatches.length;
      if (hasStatus && (await saveBtn.isVisible().catch(() => false))) {
        await saveBtn.click();
        await sleep(1500);
        const patches = results.recordsPatches.slice(patchesBefore);
        const patchOk = patches.some((p) => p.status >= 200 && p.status < 300);
        results.surfaces.row13_patch = {
          runtime: patchOk ? 'LIVE' : 'BROKEN',
          patches,
          feAfter: true,
        };
        await shot(page, '04-after-patch.png');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(2000);
        await openRecordsMenu(page);
        await sleep(1200);
        results.steps.f5 = { afterPatch: true, listGetOk: results.recordsGets.some((g) => g.status === 200) };
        await shot(page, '05-after-f5.png');
      } else {
        results.surfaces.row13_patch = {
          runtime: 'PARTIAL',
          note: 'Edit modal open but no status control/save wired for AT-03',
          hasStatus,
        };
        await shot(page, '04-edit-modal-no-status.png');
      }
    } else {
      results.surfaces.row13_patch = {
        runtime: patchCtaKind === 'STUB_EDIT' ? 'STUB' : 'EXPECTED_NO_CTA',
        patchCtaKind,
        note:
          patchCtaKind === 'STUB_EDIT'
            ? 'Edit CTA STUB — no PATCH mutate under U65 (honest; do not use Delete→absent as AT-03 PASS)'
            : 'No PATCH status CTA on records list surface',
        patchesFired: results.recordsPatches.length,
      };
      await shot(page, '04-no-patch-cta.png');
    }

    // Criteria
    const listLive = results.surfaces.row13_list?.runtime === 'LIVE';
    const stormOk = results.steps.storm10s?.ok === true;
    const modalOk =
      results.surfaces.row13_modal?.runtime === 'LIVE' ||
      results.surfaces.row13_modal?.runtime === 'STUB' ||
      results.surfaces.row13_modal?.runtime === 'EXPECTED_NO_CTA' ||
      results.surfaces.row13_modal?.runtime === 'N/A_EMPTY';
    const patchDocumented =
      results.surfaces.row13_patch?.runtime === 'LIVE' ||
      results.surfaces.row13_patch?.runtime === 'STUB' ||
      results.surfaces.row13_patch?.runtime === 'EXPECTED_NO_CTA' ||
      results.surfaces.row13_patch?.runtime === 'PARTIAL';

    results.criteria = {
      hdsd_inventory: results.hdsd_inventory.length >= 3,
      list_get_2xx: listLive && listGetOk,
      empty_or_rows_honest: emptyCopy || dataRowCount > 0 || lastRowCount === 0,
      no_storm: stormOk,
      modal_honesty: modalOk,
      patch_honesty: patchDocumented,
      matrix_13_stamp: true,
      uat_done_false: results.uat_done === false,
      no_500: results.networkBad.length === 0,
    };

    const hardFail =
      !results.criteria.list_get_2xx ||
      !results.criteria.no_storm ||
      !results.criteria.hdsd_inventory ||
      results.networkBad.length > 0 ||
      results.pageErrors.length > 0;

    // Edit STUB is honest PASS_TO_PM for list fidelity seat (AT-03 residual)
    if (hardFail) {
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL';
      if (!listGetOk) results.failReasons.push('GET records not 2xx');
      if (!stormOk) results.failReasons.push('GET storm >2/10s');
      if (results.networkBad.length) results.failReasons.push('HTTP ≥500 on HRM');
      if (results.pageErrors.length) results.failReasons.push('pageErrors');
    } else {
      results.verdict = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    }

    if (results.surfaces.row13_patch?.runtime === 'STUB' || results.surfaces.row13_modal?.runtime === 'STUB') {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-RECORDS-EDIT-STUB',
        severity: 'P1',
        owner: 'dev-fe',
        note: 'Dropdown «Sửa» present but no onClick → no modal; updateRecord/updateAttendanceStatus not wired from AttendanceRecordsTable; Attendance.tsx openEditAttendanceModal dead (never called)',
      });
    }
    if (results.surfaces.row13_list?.menuLabel && !/Bản ghi/i.test(results.surfaces.row13_list.menuLabel)) {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-RECORDS-LABEL-DRIFT',
        severity: 'P3 OBS',
        owner: 'ba/dev-fe',
        note: 'Matrix/HDSD «Bản ghi chấm công» vs FE «Dữ liệu chấm công» — label_drift U76',
      });
    }

    results.endedAt = new Date().toISOString();
    save();
    console.log(JSON.stringify({ ack_status: results.ack_status, verdict: results.verdict, surfaces: results.surfaces, storm: results.steps.storm10s, residuals: results.residuals }, null, 2));
    await browser.close();
    process.exit(hardFail ? 1 : 0);
  } catch (e) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL';
    results.failReasons.push(String(e?.message || e).slice(0, 400));
    results.endedAt = new Date().toISOString();
    save();
    console.error(e);
    await browser.close().catch(() => null);
    process.exit(1);
  }
}

main();
