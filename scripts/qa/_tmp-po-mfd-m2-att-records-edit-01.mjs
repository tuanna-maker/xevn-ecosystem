#!/usr/bin/env node
/**
 * PO-MFD-M2-ATT-RECORDS-EDIT-01-QA — U65 browser AT-03 edit modal → PATCH status
 * Matrix #13 edit · J-HRM-06 mutate · no seed · no Delete→absent cheat · uat_done false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'uat.nv0007@xe.vn';
const PASSWORDS = ['Xevn@2026', 'xevn-uat-2026'];
const COMPANY = process.env.QA_COMPANY_ID || 'trsport';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m2-att-records-edit-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m2-att-records-edit-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-MFD-M2-ATT-RECORDS-EDIT-01-QA',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  u76_hdsd_align: true,
  u87_menu_fidelity: true,
  hdsd_align: 'Attendance → ▼ → Dữ liệu chấm công → row Sửa → modal → Lưu (matrix #13 edit · HRM-AT-03)',
  portal_url: `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=${COMPANY}`,
  journey_l25: ['J-HRM-06'],
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
  testids: {},
  failReasons: [],
  residuals: [],
  verdict: null,
  ack_status: null,
  uat_done: false,
  attendance_closed: false,
  face_live: false,
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
      let bodyStatus = null;
      try {
        const req = res.request();
        const post = req.postDataJSON?.() || (req.postData() ? JSON.parse(req.postData()) : null);
        bodyStatus = post?.status ?? null;
      } catch {
        /* */
      }
      try {
        const j = await res.json();
        code = j?.code ?? j?.meta?.code ?? null;
      } catch {
        /* */
      }
      results.recordsPatches.push({
        status,
        code,
        bodyStatus,
        url: url.slice(0, 260),
        t: Date.now(),
      });
    }
  });
}

async function openRecordsMenu(page) {
  await page.locator('[data-testid="attendance-tab-menu"]').click({ timeout: 15_000 });
  await sleep(400);
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
    const syncError = await page
      .getByText(/HRM API Sync ERROR|HRM API request failed/i)
      .isVisible()
      .catch(() => false);

    const listGets = results.recordsGets.slice(getsBefore);
    const listGetOk = listGets.some((g) => g.status >= 200 && g.status < 300);
    const listCode = listGets.find((g) => g.status >= 200 && g.status < 300)?.code ?? null;
    const lastRowCount = [...listGets].reverse().find((g) => g.rowCount != null)?.rowCount;

    const table = page.getByTestId('attendance-records-table');
    const tableVisible = await table.isVisible().catch(() => false);
    const tableRows = page.locator('table tbody tr');
    const trCount = await tableRows.count().catch(() => 0);
    let dataRowCount = 0;
    for (let i = 0; i < trCount; i++) {
      const cells = await tableRows.nth(i).locator('td').count();
      if (cells >= 5) dataRowCount += 1;
    }

    // Capture first row status badge text before mutate
    let statusBefore = null;
    if (dataRowCount > 0) {
      statusBefore = (
        await tableRows
          .first()
          .locator('td')
          .nth(5)
          .innerText()
          .catch(() => '')
      )
        .trim()
        .slice(0, 80);
    }

    results.hdsd_inventory = [
      {
        hdsd_ref: 'Matrix #13 · Bản ghi chấm công',
        fe_label: menuLabel || 'Dữ liệu chấm công',
        control: 'menuitem attendance ▼ → records',
        note: 'U76 inventory',
      },
      {
        hdsd_ref: 'HRM-AT-03 · Row Sửa modal',
        fe_label: 'Chỉnh sửa / Sửa',
        control: 'attendance-record-edit-* → dialog',
        note: 'mutate seat this wave',
      },
      {
        hdsd_ref: 'Status select + Lưu',
        fe_label: 'Trạng thái · Lưu',
        control: 'attendance-record-edit-status · attendance-record-edit-save',
        note: 'PATCH …/records/:id/status',
      },
      {
        hdsd_ref: 'Xóa (forbidden as AT-03 PASS)',
        fe_label: 'Xóa',
        control: 'Delete → absent',
        note: 'NOT used this seat (U65 honesty)',
      },
    ];

    results.surfaces.row13_list = {
      runtime: syncError || !listGetOk ? 'BROKEN' : 'LIVE',
      menuLabel,
      titleVisible: titleVisible || titleAlt,
      syncError,
      dataRowCount,
      apiRowCount: lastRowCount,
      listGets: listGets.map((g) => ({ status: g.status, code: g.code, rowCount: g.rowCount })),
      listCode,
      tableVisible,
      statusBefore,
    };
    results.steps.list = results.surfaces.row13_list;
    await shot(page, '01-records-list.png');

    let dialogAfterEdit = false;
    let editModalLive = false;
    let editMenuPresent = false;
    let selectedStatus = null;
    let statusAfterFe = null;
    let statusAfterF5 = null;
    let patchesFired = 0;
    let patchOk = false;

    if (dataRowCount === 0) {
      results.failReasons.push('No data rows — cannot exercise AT-03 edit under U65 (not seed)');
      results.surfaces.row13_edit = { runtime: 'N/A_EMPTY' };
    } else {
      // Open kebab on first data row
      const firstRow = tableRows.first();
      const kebab = firstRow.locator('button').last();
      await kebab.click({ timeout: 8_000 });
      await sleep(400);

      const editItem = page.getByRole('menuitem', { name: /Sửa|Edit|Chỉnh sửa/i });
      editMenuPresent = await editItem.isVisible().catch(() => false);
      await shot(page, '02-row-menu.png');

      if (!editMenuPresent) {
        results.failReasons.push('Edit menuitem absent');
        results.surfaces.row13_edit = { runtime: 'BROKEN', editMenuPresent: false };
      } else {
        await editItem.click();
        await sleep(900);

        const dialog = page.getByTestId('attendance-record-edit-dialog');
        dialogAfterEdit = await dialog.isVisible().catch(() => false);
        const dialogRole = await page.getByRole('dialog').isVisible().catch(() => false);
        editModalLive = dialogAfterEdit || dialogRole;

        const statusTrigger = page.getByTestId('attendance-record-edit-status');
        const saveBtn = page.getByTestId('attendance-record-edit-save');
        results.testids = {
          'attendance-records-table': tableVisible,
          'attendance-record-edit-dialog': dialogAfterEdit,
          'attendance-record-edit-status': await statusTrigger.isVisible().catch(() => false),
          'attendance-record-edit-save': await saveBtn.isVisible().catch(() => false),
        };
        await shot(page, '03-edit-dialog.png');

        if (!editModalLive) {
          results.failReasons.push('dialogAfterEdit=false — edit modal not LIVE');
          results.surfaces.row13_edit = {
            runtime: 'STUB',
            editMenuPresent,
            dialogAfterEdit,
            editModalLive: false,
          };
        } else {
          // Change status: pick a different API option from current
          // Options: pending | present | absent | leave
          const currentVal = await statusTrigger.innerText().catch(() => '');
          // Prefer toggle present ↔ leave (non-destructive vs absent for honesty)
          const targetLabel = /Có mặt|present/i.test(currentVal) ? 'Nghỉ phép' : 'Có mặt';
          const targetApi = /Có mặt|present/i.test(currentVal) ? 'leave' : 'present';

          await statusTrigger.click();
          await sleep(300);
          const option = page.getByRole('option', { name: new RegExp(targetLabel, 'i') }).first();
          const optionAlt = page.locator(`[role="option"][data-value="${targetApi}"]`).first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
            selectedStatus = targetApi;
          } else if (await optionAlt.isVisible().catch(() => false)) {
            await optionAlt.click();
            selectedStatus = targetApi;
          } else {
            // Fallback: click any option that is not selected
            const opts = page.getByRole('option');
            const n = await opts.count();
            for (let i = 0; i < n; i++) {
              const txt = (await opts.nth(i).innerText()).trim();
              if (!new RegExp(currentVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(txt)) {
                await opts.nth(i).click();
                selectedStatus = txt.slice(0, 40);
                break;
              }
            }
          }
          await sleep(300);
          await shot(page, '04-status-changed.png');

          const patchesBefore = results.recordsPatches.length;
          await saveBtn.click();
          await sleep(2000);

          const patches = results.recordsPatches.slice(patchesBefore);
          patchesFired = patches.length;
          patchOk = patches.some((p) => p.status >= 200 && p.status < 300);
          const dialogClosed = !(await dialog.isVisible().catch(() => false));

          // FE after 2xx — row badge
          statusAfterFe = (
            await tableRows
              .first()
              .locator('td')
              .nth(5)
              .innerText()
              .catch(() => '')
          )
            .trim()
            .slice(0, 80);

          results.surfaces.row13_edit = {
            runtime: patchOk && dialogAfterEdit ? 'LIVE' : patchOk ? 'PARTIAL' : 'BROKEN',
            editMenuPresent,
            dialogAfterEdit,
            editModalLive,
            selectedStatus,
            patchesFired,
            patches,
            dialogClosed,
            statusBefore,
            statusAfterFe,
            testids: results.testids,
          };
          await shot(page, '05-after-patch.png');

          // F5 persist
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(2500);
          await openRecordsMenu(page);
          await sleep(1500);
          statusAfterF5 = (
            await page
              .locator('table tbody tr')
              .first()
              .locator('td')
              .nth(5)
              .innerText()
              .catch(() => '')
          )
            .trim()
            .slice(0, 80);

          const f5ListOk = results.recordsGets.some((g) => g.status === 200);
          results.steps.f5 = {
            afterPatch: true,
            listGetOk: f5ListOk,
            statusAfterF5,
            statusPersisted:
              !!statusAfterF5 &&
              (!!selectedStatus
                ? new RegExp(
                    selectedStatus === 'leave'
                      ? 'Nghỉ phép|leave|on_leave'
                      : selectedStatus === 'present'
                        ? 'Có mặt|present'
                        : selectedStatus === 'absent'
                          ? 'Vắng|absent'
                          : selectedStatus === 'pending'
                            ? 'Chờ|pending'
                            : String(selectedStatus),
                    'i',
                  ).test(statusAfterF5)
                : statusAfterF5 === statusAfterFe),
          };
          await shot(page, '06-after-f5.png');
        }
      }
    }

    results.steps.edit = results.surfaces.row13_edit;
    results.steps.patch = {
      patchesFired,
      patchOk,
      recordsPatches: results.recordsPatches,
    };

    const listLive = results.surfaces.row13_list?.runtime === 'LIVE';
    const editLive = results.surfaces.row13_edit?.runtime === 'LIVE';
    const f5Ok = results.steps.f5?.statusPersisted === true;

    results.criteria = {
      hdsd_inventory: results.hdsd_inventory.length >= 3,
      list_get_2xx: listLive && listGetOk,
      dialogAfterEdit: dialogAfterEdit === true,
      patchesFired_ge_1: patchesFired >= 1,
      patch_2xx: patchOk,
      fe_after_2xx: !!statusAfterFe,
      f5_persist: f5Ok,
      pageErrors_empty: results.pageErrors.length === 0,
      no_500: results.networkBad.length === 0,
      uat_done_false: results.uat_done === false,
      testids_present:
        results.testids['attendance-record-edit-dialog'] === true &&
        results.testids['attendance-record-edit-status'] === true &&
        results.testids['attendance-record-edit-save'] === true,
    };

    const hardFail =
      !results.criteria.list_get_2xx ||
      !results.criteria.dialogAfterEdit ||
      !results.criteria.patchesFired_ge_1 ||
      !results.criteria.patch_2xx ||
      !results.criteria.f5_persist ||
      !results.criteria.pageErrors_empty ||
      !results.criteria.no_500 ||
      results.failReasons.length > 0;

    if (hardFail) {
      results.verdict = 'FAIL';
      results.ack_status = 'FAIL';
      if (!listGetOk) results.failReasons.push('GET records not 2xx');
      if (!dialogAfterEdit) results.failReasons.push('dialogAfterEdit=false');
      if (patchesFired < 1) results.failReasons.push('patchesFired=0');
      if (!patchOk && patchesFired >= 1) results.failReasons.push('PATCH not 2xx');
      if (!f5Ok) results.failReasons.push('F5 status not persisted');
      if (results.pageErrors.length) results.failReasons.push('pageErrors');
      if (results.networkBad.length) results.failReasons.push('HTTP ≥500');
      // dedupe
      results.failReasons = [...new Set(results.failReasons)];
      if (!editLive) {
        results.residuals.push({
          id: 'R-MFD-M2-ATT-RECORDS-EDIT-STUB',
          severity: 'P1',
          owner: 'dev-fe',
          note: 'Edit modal / PATCH AT-03 still failing browser AC',
        });
      }
    } else {
      results.verdict = 'PASS';
      results.ack_status = 'PASS_TO_PM';
      results.residuals.push({
        id: 'R-MFD-M2-ATT-RECORDS-EDIT-STUB',
        severity: 'CLOSED',
        owner: '—',
        note: 'CLOSED this seat — dialog + PATCH 2xx + F5',
      });
    }

    if (results.surfaces.row13_list?.menuLabel && !/Bản ghi/i.test(results.surfaces.row13_list.menuLabel)) {
      results.residuals.push({
        id: 'R-MFD-M2-ATT-RECORDS-LABEL-DRIFT',
        severity: 'P3 OBS',
        owner: 'ba/dev-fe',
        note: 'Matrix «Bản ghi chấm công» vs FE «Dữ liệu chấm công»',
      });
    }

    results.endedAt = new Date().toISOString();
    save();
    console.log(
      JSON.stringify(
        {
          ack_status: results.ack_status,
          verdict: results.verdict,
          criteria: results.criteria,
          surfaces: results.surfaces,
          patch: results.steps.patch,
          f5: results.steps.f5,
          testids: results.testids,
          pageErrors: results.pageErrors,
          failReasons: results.failReasons,
          residuals: results.residuals,
        },
        null,
        2,
      ),
    );
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
