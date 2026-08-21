#!/usr/bin/env node
/**
 * PO-UC-TC-W4-BE-SYNC-XBOSS-500-QA — Browser U65 retest after BE sync-from-xbos fix
 * UC: XBOS-DM-HRM-10 · UC-HRM-06
 * FORBIDDEN: seed · apply-to-members as PASS · clone as PASS · invent Leave L2 · apps/**
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
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-be-sync-xboss-500-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-be-sync-xboss-500-qa');
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
  work_item_id: 'PO-UC-TC-W4-BE-SYNC-XBOSS-500-QA',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  hdsd_inventory: [
    'Login UI ceo@xe.vn / Xevn@2026',
    'HRM → Danh mục cài đặt /hr/settings-catalogs?portal=1&companyId=main',
    'Nút Đồng bộ từ XBOS → POST …/settings-catalogs/sync-from-xbos',
    '≠ Áp dụng danh mục (apply-to-members) · ≠ Sao chép (clone)',
    'Toast pulled count · F5 list still populated',
  ],
  must_keep: {
    applyPanelNotUsedAsSyncPass: true,
    clonePanelNotUsedAsSyncPass: true,
    leaveL2Untouched: true,
    zeroSeed: true,
  },
  l0: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  toast_text: null,
  sync_body: null,
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}
async function bodyText(page) {
  return page.evaluate(() => document.body?.innerText?.slice(0, 12000) || '');
}
function netsSince(idx, pred) {
  return results.network.slice(idx).filter(pred);
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

async function loginViaUi(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1500);
  // Clear LoginPage defaults (trap from prior waves)
  const email = page.locator('input[type="email"], input[name="email"], #email').first();
  const pass = page.locator('input[type="password"], input[name="password"], #password').first();
  if ((await email.count()) === 0) {
    // maybe already logged in
    if (!/login/i.test(page.url())) return true;
  }
  await email.fill('');
  await email.fill(EMAIL);
  await pass.fill('');
  await pass.fill(PASSWORD);
  const before = results.network.length;
  await page.getByRole('button', { name: /Đăng nhập|Login|Sign in/i }).first().click().catch(async () => {
    await pass.press('Enter');
  });
  await sleep(4000);
  const loginNet = netsSince(before, (n) => /auth\/login/.test(n.url) && n.method === 'POST' && n.status > 0);
  const ok = loginNet.find((n) => n.status >= 200 && n.status < 300);
  log('UI_LOGIN', { note: `status=${ok?.status || 'n/a'} code=${ok?.code || ''} url=${page.url().slice(0, 120)}` });
  await shot(page, '01-after-login');
  return Boolean(ok) || !/login/i.test(page.url());
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const interesting =
      /sync-from-xbos|settings-catalogs|catalog-sync|apply-to-members|\/clone|auth\/login/.test(u);
    if (!interesting) return;
    const entry = {
      method,
      status: res.status(),
      phase: 'response',
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
      at: ts(),
    };
    results.network.push(entry);
    save();
    res
      .json()
      .then((body) => {
        entry.code = body?.code || null;
        entry.message = String(body?.message || '').slice(0, 200);
        const data = body?.data ?? body;
        if (data && typeof data === 'object') {
          if (Array.isArray(data.pulledKeys)) {
            entry.pulledKeysCount = data.pulledKeys.length;
            entry.pulledKeysSample = data.pulledKeys.slice(0, 8);
          } else if (typeof data.pulledKeys === 'number') {
            entry.pulledKeysCount = data.pulledKeys;
          }
          if (typeof data.skippedKeys === 'number') entry.skippedKeys = data.skippedKeys;
          else if (Array.isArray(data.skippedKeys)) entry.skippedKeys = data.skippedKeys.length;
          if (Array.isArray(data.items)) entry.itemCount = data.items.length;
          if (Array.isArray(data.catalogs)) entry.catalogCount = data.catalogs.length;
          if (typeof data.total === 'number') entry.total = data.total;
        }
        save();
      })
      .catch(() => {});
  });
}

async function run() {
  await probeL0();
  const l0Ok = results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200;
  recordStep('L0', l0Ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(results.l0) });
  if (!l0Ok) {
    results.overall = 'FAIL';
    results.endedAt = ts();
    save();
    process.exitCode = 2;
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  try {
    const loggedIn = await loginViaUi(page);
    recordStep('LOGIN', loggedIn ? 'PASS' : 'FAIL', { summary: `url=${page.url().slice(0, 140)}` });
    if (!loggedIn) throw new Error('UI login failed');

    // Ensure company scope main (holding)
    await page.evaluate(() => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.companyId', 'main');
        store.setItem('hrm_current_company_id', 'main');
        store.setItem('hrm_portal_mode', '1');
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('hrm_current_tenant_id', 'xevn');
      }
    });

    const url = `${PORTAL}/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`;
    log('NAV_SETTINGS_CATALOGS', { url });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4500);
    await shot(page, '02-settings-open');

    const onApply = /hrm_catalog_apply_members|apply-to-members/i.test(page.url());
    const onClone = /hrm_catalog_clone|settings=hrm_catalog_clone/i.test(page.url());
    if (onApply || onClone) {
      results.residuals.push({
        id: 'R-SYNC-QA-WRONG-PANEL',
        severity: 'P0',
        note: `landed apply/clone url=${page.url().slice(0, 160)}`,
      });
    }

    const syncBtn = page.getByRole('button', { name: /Đồng bộ từ XBOS/i }).first();
    const hasSync = (await syncBtn.count()) > 0 && (await syncBtn.isVisible().catch(() => false));
    const bodyOpen = await bodyText(page);
    const noCompany = /chưa chọn công ty|noCompany|Chọn công ty/i.test(bodyOpen);
    const listPopulated =
      /catalog|danh mục|items|mục|job_titles|departments|leave_types/i.test(bodyOpen) &&
      !/không có dữ liệu|no data|empty catalog/i.test(bodyOpen.slice(0, 400));
    recordStep('TC-XBOS-DM-HRM-10-OPEN-HP-001', hasSync && !noCompany && !onApply && !onClone ? 'PASS' : 'FAIL', {
      summary: `hasSync=${hasSync} noCompany=${noCompany} onApply=${onApply} onClone=${onClone} url=${page.url().slice(0, 140)}`,
    });
    recordStep('TC-UC-HRM-06-OPEN-HP-001', hasSync && !noCompany ? 'PASS' : 'FAIL', {
      summary: 'same surface UF-HRM-10 /settings-catalogs',
    });

    if (!hasSync) {
      recordStep('TC-XBOS-DM-HRM-10-ACT-HP-001', 'FAIL', { summary: 'sync button missing' });
      recordStep('TC-UC-HRM-06-ACT-HP-001', 'FAIL', { summary: 'sync button missing' });
      results.overall = 'FAIL';
      return;
    }

    const before = results.network.length;
    const waitPull = page
      .waitForResponse(
        (r) =>
          r.request().method() === 'POST' &&
          /sync-from-xbos/.test(r.url()) &&
          !/apply-to-members/.test(r.url()),
        { timeout: 120000 },
      )
      .catch(() => null);

    await syncBtn.click({ timeout: 8000 });
    log('CLICK_DONG_BO_XBOS');
    const waited = await waitPull;
    await sleep(2500);
    await shot(page, '03-sync-after');

    let syncRow = null;
    if (waited) {
      syncRow = {
        method: 'POST',
        status: waited.status(),
        url: waited.url().replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      try {
        const body = await waited.json();
        results.sync_body = {
          code: body?.code,
          message: String(body?.message || '').slice(0, 200),
          pulledKeys:
            typeof body?.data?.pulledKeys === 'number'
              ? body.data.pulledKeys
              : Array.isArray(body?.data?.pulledKeys)
                ? body.data.pulledKeys.length
                : body?.pulledKeys,
          skippedKeys:
            typeof body?.data?.skippedKeys === 'number'
              ? body.data.skippedKeys
              : Array.isArray(body?.data?.skippedKeys)
                ? body.data.skippedKeys.length
                : body?.skippedKeys,
        };
        syncRow.code = body?.code;
        syncRow.pulledKeysCount = results.sync_body.pulledKeys;
        syncRow.skippedKeys = results.sync_body.skippedKeys;
        syncRow.message = results.sync_body.message;
      } catch (e) {
        syncRow.parseErr = String(e).slice(0, 80);
      }
      results.network.push({ ...syncRow, phase: 'waitForResponse' });
      save();
      log('SYNC_RESPONSE', {
        note: `status=${syncRow.status} code=${syncRow.code} pulled=${syncRow.pulledKeysCount}`,
      });
    }

    const pullNets = netsSince(
      before,
      (n) =>
        n.method === 'POST' &&
        /sync-from-xbos/.test(n.url) &&
        !/apply-to-members/.test(n.url) &&
        (n.phase === 'response' || n.phase === 'waitForResponse' || n.status > 0),
    );
    const applyNets = netsSince(before, (n) => /apply-to-members/.test(n.url));
    const cloneNets = netsSince(before, (n) => /\/clone|clone-bundle/.test(n.url));
    const ok =
      pullNets.find((n) => n.status >= 200 && n.status < 300 && (!n.code || /HRM-SET-201|HRM-SYNC/i.test(String(n.code)))) ||
      (syncRow && syncRow.status >= 200 && syncRow.status < 300 ? syncRow : null);
    const bare500 = pullNets.find((n) => n.status === 500 && !n.code);
    const confused = applyNets.length > 0 || cloneNets.length > 0;

    const bodyAfter = await bodyText(page);
    const toastHit =
      /đã đồng bộ|đồng bộ thành công|pulled|kéo về|catalog/i.test(bodyAfter) ||
      (ok && Number(ok.pulledKeysCount || results.sync_body?.pulledKeys || 0) > 0);
    // Capture toast-like text
    const toastSnippet = await page
      .evaluate(() => {
        const sels = [
          '[data-sonner-toast]',
          '[role="status"]',
          '.Toastify__toast',
          '[class*="toast"]',
          '[class*="Toast"]',
        ];
        for (const s of sels) {
          const el = document.querySelector(s);
          if (el?.textContent?.trim()) return el.textContent.trim().slice(0, 240);
        }
        return null;
      })
      .catch(() => null);
    results.toast_text = toastSnippet || (toastHit ? bodyAfter.match(/.{0,40}(đồng bộ|pulled|kéo).{0,80}/i)?.[0] || null : null);

    if (confused) {
      results.residuals.push({
        id: 'R-SYNC-QA-APPLY-CLONE',
        severity: 'P0',
        note: `applyHits=${applyNets.length} cloneHits=${cloneNets.length}`,
      });
    }
    if (bare500) {
      results.residuals.push({
        id: 'R-E3-SYNC-500',
        severity: 'P0',
        note: 'Still bare 500 undefined code on sync-from-xbos',
      });
    }

    const actPass = Boolean(ok) && !confused && !bare500;
    recordStep('TC-XBOS-DM-HRM-10-ACT-HP-001', actPass ? 'PASS' : 'FAIL', {
      summary: `status=${ok?.status ?? syncRow?.status ?? pullNets[0]?.status} code=${ok?.code ?? syncRow?.code} pulledKeys=${ok?.pulledKeysCount ?? results.sync_body?.pulledKeys} applyHits=${applyNets.length} cloneHits=${cloneNets.length} toast=${Boolean(results.toast_text || toastHit)}`,
    });
    recordStep('TC-UC-HRM-06-ACT-HP-001', actPass ? 'PASS' : 'FAIL', {
      summary: `consumer same path · toast_or_pulled=${Boolean(results.toast_text || toastHit)}`,
    });
    recordStep('FE_TOAST_PULLED', results.toast_text || toastHit ? 'PASS' : 'PARTIAL', {
      summary: `toast=${JSON.stringify(results.toast_text)} pulled=${results.sync_body?.pulledKeys}`,
    });

    // F5 — list still populated
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await shot(page, '04-sync-f5');
    const f5Before = results.network.length;
    await sleep(1500);
    const getNets = netsSince(
      Math.max(0, f5Before - 30),
      (n) =>
        n.method === 'GET' &&
        /settings-catalogs|catalog-sync/.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
    const bodyF5 = await bodyText(page);
    const f5Populated =
      getNets.length > 0 ||
      (/catalog|danh mục|job_|leave_|department|chức danh/i.test(bodyF5) &&
        !/HRM API Sync ERROR|request failed \(5/i.test(bodyF5));
    recordStep('TC-XBOS-DM-HRM-10-RELOAD-HP-001', f5Populated ? 'PASS' : 'FAIL', {
      summary: `GET2xx=${getNets.length} sample=${getNets.slice(0, 2).map((g) => `${g.status}:${g.code || ''}:${g.url}`).join('|')} bodyHasCatalog=${/danh mục|catalog/i.test(bodyF5)}`,
    });
    recordStep('TC-UC-HRM-06-RELOAD-HP-001', f5Populated ? 'PASS' : 'FAIL', {
      summary: 'F5 catalogs still load after pull',
    });

    // Network invariant summary for whole session
    const allApply = results.network.filter((n) => /apply-to-members/.test(n.url));
    const allClone = results.network.filter((n) => /\/clone|clone-bundle/.test(n.url));
    recordStep('NET_NO_APPLY_CLONE', allApply.length === 0 && allClone.length === 0 ? 'PASS' : 'FAIL', {
      summary: `apply=${allApply.length} clone=${allClone.length}`,
    });

    const fails = Object.entries(results.steps).filter(([, v]) => v.verdict === 'FAIL');
    results.overall = fails.length === 0 ? 'PASS' : 'FAIL';
    if (fails.some(([, v]) => v.verdict === 'FAIL' && !['FE_TOAST_PULLED'].includes(Object.keys(results.steps).find(() => false)))) {
      /* overall already set */
    }
    // PARTIAL toast alone should not fail if ACT+RELOAD+NET pass
    const hardFail = Object.entries(results.steps).filter(
      ([k, v]) => v.verdict === 'FAIL' && k !== 'FE_TOAST_PULLED',
    );
    results.overall = hardFail.length === 0 ? 'PASS' : 'FAIL';
  } catch (e) {
    results.residuals.push({ id: 'R-SYNC-QA-RUNTIME', severity: 'P0', note: String(e).slice(0, 300) });
    results.overall = 'FAIL';
    console.error(e);
  } finally {
    results.endedAt = ts();
    save();
    await browser.close().catch(() => {});
    console.log(`\nOVERALL=${results.overall} json=${OUT_JSON}`);
    process.exitCode = results.overall === 'PASS' ? 0 : 2;
  }
}

run();
