#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E4-CI01-R3 — HRM-CI-01 MAIN/FE browser retest (U65)
 * Login UI → menu Hợp đồng → Thêm hợp đồng → Lưu → Network 2xx + FE + F5
 * FORBIDDEN: seed · API-only PASS · claim Phase1 DONE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e4-ci01-r3.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r3');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const RUN = `W4E4R3-${Date.now().toString(36).slice(-5).toUpperCase()}`;

const network = [];
const click_log = [];
const steps = {};
const consoleErrors = [];

function log(msg, extra = {}) {
  click_log.push({ at: ts(), msg, ...extra });
  console.error(`[CI01-R3 ${click_log.length}] ${msg}`, extra.note || '');
}
function record(id, verdict, summary) {
  steps[id] = { verdict, summary, at: ts() };
  console.log(`${verdict} ${id} — ${summary.slice(0, 420)}`);
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  return path;
}

function track(page) {
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(String(m.text()).slice(0, 240));
  });
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = req.method();
      if (method === 'OPTIONS') return;
      if (/contracts|employees|auth\/login/.test(u)) {
        network.push({
          phase: 'request',
          method,
          status: null,
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
          at: ts(),
        });
      }
    } catch {
      /* */
    }
  });
  page.on('requestfailed', (req) => {
    try {
      const u = req.url();
      if (!/contracts|employees/.test(u)) return;
      network.push({
        phase: 'failed',
        method: req.method(),
        status: null,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
        message: req.failure()?.errorText,
        at: ts(),
      });
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        phase: 'response',
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
        at: ts(),
      };
      if (/auth\/login|\/contracts|employees|settings-catalogs/.test(u)) {
        try {
          const j = await res.json();
          entry.code = j?.code;
          entry.message = String(j?.message || '').slice(0, 200);
          entry.id = j?.data?.id || j?.id || null;
          if (j?.data?.contract_code) entry.contract_code = j.data.contract_code;
        } catch {
          /* non-json */
        }
      }
      network.push(entry);
    } catch {
      /* */
    }
  });
}

async function clearAuth(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
}

async function fillLogin(page, email, password) {
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill('');
  await emailInput.fill(email);
  await passInput.fill('');
  await passInput.fill(password);
}

/** Portal CC wraps HRM in iframe — return Frame for /hr/* or page itself. */
async function hrmScope(page) {
  await page.locator('iframe').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => {});
  await sleep(800);
  const f = page.frames().find((fr) => /\/hr\//.test(fr.url()));
  return f || page;
}

async function pickFirstOption(scope, triggerTestId) {
  const trigger = scope.getByTestId(triggerTestId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = scope.getByRole('option').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  await scope.evaluate(() => {
    const o = document.querySelector('[role="option"]');
    if (o) o.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(400);
  return true;
}

async function main() {
  const l0 = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      l0[k] = r.status;
    } catch (e) {
      l0[k] = `ERR:${e?.cause?.code || e.message}`;
    }
  }
  console.log('L0', JSON.stringify(l0));
  if (l0.hrm !== 200 || l0.xbos !== 200 || l0.portal !== 200) {
    writeFileSync(
      OUT,
      JSON.stringify(
        {
          work_item_id: 'PO-UC-TC-W4-QA-E4-CI01-R3',
          l0,
          blocked: true,
          ack_status: 'FAIL_TO_PM',
          note: 'L0 not green — cannot browser',
        },
        null,
        2,
      ),
    );
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  let contractStamp = '';
  let createOk = false;
  let stampOnList = false;
  let formReady = false;
  let posts = [];
  let verdict = 'FAIL';
  let residual = null;
  let surface = 'iframe';
  const residuals = [];

  try {
    // 1) UI login
    await clearAuth(page);
    await fillLogin(page, EMAIL, PASSWORD);
    const beforeLogin = network.length;
    await page
      .locator('button[type="submit"]')
      .filter({ hasText: /Đăng nhập/i })
      .click();
    log('LOGIN_CEO_UI');
    await sleep(3500);
    const loginNet = network.slice(beforeLogin).filter((n) => /\/auth\/login/.test(n.url));
    const loginOk =
      loginNet.some((n) => n.status >= 200 && n.status < 300) ||
      /command-center|\/hr\//i.test(page.url());
    record(
      'LOGIN',
      loginOk ? 'PASS' : 'FAIL',
      `login=${loginNet.map((n) => `${n.status}:${n.code || ''}`).join(',') || 'none'} url=${page.url()}`,
    );
    await shot(page, '01-after-login');
    if (!loginOk) throw new Error('UI login failed');

    // 2) HDSD menu — open HRM embed then sidebar Hợp đồng
    await page.goto(`${PORTAL}/command-center/hrm/employees?portal=1&tenantId=xevn&companyId=main`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(300);

    const sideContract = page
      .locator('a, button, [role="link"], [role="menuitem"]')
      .filter({ hasText: /^Hợp đồng$/i })
      .first();
    if (await sideContract.isVisible().catch(() => false)) {
      await sideContract.click({ force: true });
      log('MENU_CLICK_HOP_DONG');
      await sleep(5000);
    } else {
      // fallback deep-link still after UI login (menu miss = note, not seed)
      await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      log('MENU_FALLBACK_CC_CONTRACTS', {
        note: 'sidebar Hợp đồng not found — used /command-center/hrm/contracts',
      });
      await sleep(5000);
    }

    // ensure contracts surface (CC iframe or direct /hr)
    if (!/contracts/i.test(page.url()) && !page.frames().some((f) => /contracts/i.test(f.url()))) {
      await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(3000);
    }
    // Wait portal→iframe session (race: early load shows HRM-AUTH-001)
    let hrm = await hrmScope(page);
    log('HRM_SCOPE', {
      note: typeof hrm.url === 'function' ? hrm.url() : page.url(),
    });
    const sessionDeadline = Date.now() + 45000;
    let listOk = false;
    while (Date.now() < sessionDeadline) {
      const gets = network.filter(
        (n) =>
          n.method === 'GET' &&
          /contracts-insurance\/contracts|\/contracts\?/.test(n.url) &&
          n.status >= 200 &&
          n.status < 300,
      );
      const body = await hrm.locator('body').innerText().catch(() => '');
      const authFail =
        /Phiên đăng nhập không hợp lệ|HRM-AUTH-001|Không tải được danh sách hợp đồng/i.test(body) &&
        gets.length === 0;
      if (gets.length > 0 && !/Phiên đăng nhập không hợp lệ/i.test(body)) {
        listOk = true;
        break;
      }
      if (authFail) {
        // click Thử lại or soft-reload iframe
        const retry = hrm.getByTestId('contracts-list-empty-error-cta');
        if (await retry.isVisible().catch(() => false)) {
          await retry.click({ force: true });
          log('RETRY_LIST_AFTER_AUTH');
        } else if (typeof hrm.goto === 'function') {
          await hrm.goto(hrm.url(), { waitUntil: 'domcontentloaded' }).catch(() => {});
        }
      }
      await sleep(1500);
      hrm = await hrmScope(page);
    }
    await shot(page, '02-contracts-list');
    const listBody = await hrm.locator('body').innerText().catch(() => '');
    const listChrome = /Thêm hợp đồng|Mã HĐ|Hợp đồng/i.test(listBody);
    const getContracts = network.filter(
      (n) =>
        n.method === 'GET' &&
        /contracts/.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
    record(
      'OPEN_LIST',
      listOk && listChrome ? 'PASS' : listChrome ? 'PARTIAL' : 'FAIL',
      `listOk=${listOk} chrome=${listChrome} gets=${getContracts.length} codes=${getContracts.map((g) => g.code || g.status).join(',')} page=${page.url()}`,
    );
    if (!listChrome) throw new Error('Contracts chrome missing in HRM scope');
    if (!listOk) throw new Error('Contracts list not loaded (session/API) — refuse mutate');

    // 3) Thêm hợp đồng — first try inside CC iframe (true HDSD surface)
    let createBtn = hrm.getByTestId('hdsd-contracts-create-btn');
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click({ timeout: 15000 });
    } else {
      await hrm.getByRole('button', { name: /Thêm hợp đồng/i }).first().click({ timeout: 15000 });
    }
    log('CLICK_THEM_HOP_DONG_IFRAME');
    let dlg = hrm.getByTestId('hdsd-contracts-form-dialog');
    await dlg.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    let dlgVisible = await dlg.isVisible().catch(() => false);
    if (!dlgVisible) {
      dlgVisible = await hrm
        .locator('[role="dialog"]')
        .filter({ hasText: /hợp đồng/i })
        .first()
        .isVisible()
        .catch(() => false);
    }
    await shot(page, '03a-iframe-after-create-click');
    if (!dlgVisible) {
      // Product gap: CTA no-op in CC iframe — continue on same session via /hr embed URL
      // (same app surface iframe src) to separate shell bug vs create API.
      record(
        'OPEN_DIALOG_IFRAME',
        'FAIL',
        'CC iframe: Thêm hợp đồng click does not open dialog (known R3)',
      );
      residuals.push({
        id: 'R-W4E4-CI01-IFRAME-DIALOG',
        severity: 'P0',
        owner: 'dev-fe',
        note: 'command-center/hrm/contracts iframe: hdsd-contracts-create-btn click no-op; direct /hr opens dialog',
      });
      const hrmSrc =
        typeof hrm.url === 'function'
          ? hrm.url()
          : `${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`;
      await page.goto(hrmSrc, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(5000);
      surface = 'direct_hr';
      hrm = page;
      createBtn = page.getByTestId('hdsd-contracts-create-btn');
      await createBtn.waitFor({ state: 'visible', timeout: 20000 });
      await createBtn.click({ timeout: 15000 });
      log('CLICK_THEM_HOP_DONG_DIRECT_HR', { note: hrmSrc });
      dlg = page.getByTestId('hdsd-contracts-form-dialog');
      await dlg.waitFor({ state: 'visible', timeout: 20000 });
      dlgVisible = await dlg.isVisible().catch(() => false);
    }
    await shot(page, '03-dialog-open');
    record(
      'OPEN_DIALOG',
      dlgVisible ? (surface === 'iframe' ? 'PASS' : 'PARTIAL') : 'FAIL',
      `dialogVisible=${dlgVisible} surface=${surface}`,
    );
    if (!dlgVisible) throw new Error('Create dialog not visible on iframe or direct /hr');

    await sleep(2000);

    // Wait employees settle then ensure form-ready (pick emp/type if needed)
    const readyDeadline = Date.now() + 25000;
    formReady = await hrm.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
    while (!formReady && Date.now() < readyDeadline) {
      await pickFirstOption(hrm, 'hdsd-contracts-form-employee');
      const typeHost = hrm.getByTestId('hdsd-contracts-form-contract-type');
      if (await typeHost.isVisible().catch(() => false)) {
        await typeHost.click({ force: true });
        await sleep(600);
        const opt = hrm.getByRole('option').first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
        else {
          const row = hrm.locator('[cmdk-item], [data-value], [role="option"], li').first();
          if (await row.isVisible().catch(() => false)) await row.click({ force: true });
        }
        await sleep(400);
      }
      await sleep(800);
      formReady = await hrm.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
    }

    const codeInput = hrm.locator('#contract_code').first();
    if (await codeInput.isVisible().catch(() => false)) {
      const cur = await codeInput.inputValue().catch(() => '');
      if (cur && cur.trim()) {
        contractStamp = cur.trim();
      } else {
        contractStamp = `HD-${RUN}`;
        await codeInput.fill(contractStamp);
      }
      const notes = hrm.locator('#notes, textarea').first();
      if (await notes.isVisible().catch(() => false)) {
        await notes.fill(`QA CI01-R3 ${RUN}`);
      }
    } else {
      contractStamp = RUN;
    }

    await shot(page, '04-form-filled');
    record(
      'FORM_READY',
      formReady ? 'PASS' : 'PARTIAL',
      `formReady=${formReady} code=${contractStamp} empPicker=${await hrm.getByTestId('hdsd-contracts-form-employee').isVisible().catch(() => false)}`,
    );

    // 4) Lưu
    const net0 = network.length;
    const submit = hrm.getByTestId('hdsd-contracts-form-submit');
    const submitVisible = await submit.isVisible().catch(() => false);
    const submitDisabled = submitVisible ? await submit.isDisabled().catch(() => false) : true;
    log('CLICK_LUU', { note: `disabled=${submitDisabled} formReady=${formReady}` });
    if (!formReady) {
      record('MAIN_SAVE', 'FAIL', 'refuse Lưu — hdsd-contracts-form-ready not visible');
      throw new Error('form not ready before Lưu');
    }
    if (submitVisible) await submit.click({ timeout: 15000 });
    // wait for POST response or hang signal (Đang lưu...)
    const saveDeadline = Date.now() + 20000;
    while (Date.now() < saveDeadline) {
      posts = network
        .slice(net0)
        .filter(
          (n) =>
            n.method === 'POST' &&
            /contracts/.test(n.url) &&
            (n.phase === 'response' || n.status != null),
        );
      if (posts.some((p) => p.status != null)) break;
      const btnTxt = await submit.innerText().catch(() => '');
      if (/Đang lưu|Saving/i.test(btnTxt)) {
        /* still in-flight */
      }
      await sleep(500);
    }
    await sleep(1500);
    await shot(page, '05-after-save');
    const postReqs = network
      .slice(net0)
      .filter((n) => n.method === 'POST' && /contracts/.test(n.url) && n.phase === 'request');
    posts = network
      .slice(net0)
      .filter((n) => n.method === 'POST' && /contracts/.test(n.url) && n.phase === 'response');
    createOk = posts.some((p) => p.status >= 200 && p.status < 300);
    const btnAfter = await submit.innerText().catch(() => '');
    const toastText = await page
      .locator('[data-sonner-toast]')
      .allInnerTexts()
      .catch(() => []);
    const bodyAfter = await hrm.locator('body').innerText().catch(() => '');
    const toastOrErr =
      toastText.some((t) => /Chọn vị trí|bắt buộc|không hợp lệ|Danh mục|400|409|500/i.test(t)) ||
      /Chọn vị trí|bắt buộc|không hợp lệ|Danh mục loại|400|409|500/i.test(bodyAfter);
    const hungSave = /Đang lưu|Saving/i.test(btnAfter) && posts.length === 0;

    record(
      'MAIN_SAVE',
      createOk ? 'PASS' : 'FAIL',
      `createOk=${createOk} disabled=${submitDisabled} postReqs=${postReqs.length} posts=${posts.map((p) => `${p.status}:${p.code || ''}:${(p.message || '').slice(0, 60)}`).join('|') || 'none'} hung=${hungSave} btn=${btnAfter} toast=${JSON.stringify(toastText).slice(0, 160)}`,
    );
    if (hungSave) {
      residuals.push({
        id: 'R-W4E4-CI01-SAVE-HANG',
        severity: 'P0',
        owner: 'dev-be',
        note: 'Lưu stuck Đang lưu… — POST contracts request without response (API hang/down mid-save)',
      });
    }

    // 5) F5 — reload HRM frame URL (keep portal shell)
    const hrmUrl =
      typeof hrm.url === 'function'
        ? hrm.url()
        : `${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`;
    if (typeof hrm.goto === 'function' && /\/hr\//.test(hrmUrl)) {
      await hrm.goto(hrmUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    } else {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    }
    await sleep(3500);
    hrm = await hrmScope(page);
    let after = await hrm.locator('body').innerText().catch(() => '');
    stampOnList =
      (contractStamp && after.includes(contractStamp)) ||
      (RUN && after.includes(RUN)) ||
      (createOk &&
        posts.some((p) => p.contract_code && after.includes(String(p.contract_code))));
    if (!stampOnList && contractStamp) {
      const search = hrm.locator('input[placeholder*="Tìm"], input[placeholder*="Search"]').first();
      if (await search.isVisible().catch(() => false)) {
        await search.fill(contractStamp);
        await sleep(1200);
        after = await hrm.locator('body').innerText();
        stampOnList = after.includes(contractStamp);
      }
    }
    await shot(page, '06-f5');
    record(
      'FE_F5',
      createOk && stampOnList ? 'PASS' : createOk ? 'PARTIAL' : 'FAIL',
      `stampOnList=${stampOnList} stamp=${contractStamp}`,
    );

    if (createOk && stampOnList) {
      // HDSD path requires iframe Thêm; direct_hr mutate alone ≠ full PASS
      verdict = surface === 'iframe' && residuals.length === 0 ? 'PASS' : 'PARTIAL';
    } else if (createOk) {
      verdict = 'PARTIAL';
      residuals.push({
        id: 'R-W4E4-CI01-MUTATE-INCOMPLETE',
        severity: 'P1',
        owner: 'qa',
        note: 'POST 2xx but F5 stamp miss',
      });
    } else {
      verdict = 'FAIL';
      residuals.push({
        id: 'R-W4E4-CI01-MUTATE-INCOMPLETE',
        severity: 'P0',
        owner: formReady ? 'dev-be' : 'dev-fe',
        note: `Lưu no POST 2xx — formReady=${formReady} disabled=${submitDisabled} posts=${posts.map((p) => `${p.status}:${p.code}`).join(',') || 'none'} toastHint=${toastOrErr}`,
      });
    }
    if (surface !== 'iframe' && residuals.some((r) => r.id === 'R-W4E4-CI01-IFRAME-DIALOG')) {
      // keep FAIL for hdsd_align when mutate only proven outside CC iframe
      if (verdict === 'PARTIAL' && createOk && stampOnList) {
        /* stay PARTIAL — mutate proven on /hr, iframe CTA P0 open */
      } else if (verdict === 'PASS') {
        verdict = 'PARTIAL';
      }
    }
  } catch (e) {
    verdict = 'FAIL';
    residuals.push({
      id: 'R-W4E4-CI01-MUTATE-INCOMPLETE',
      severity: 'P0',
      owner: 'qa',
      note: `harness exception: ${e?.message || e}`,
    });
    record('EXCEPTION', 'FAIL', String(e?.message || e));
    await shot(page, '99-exception').catch(() => {});
  } finally {
    const ack =
      verdict === 'PASS'
        ? 'PASS_TO_PM'
        : verdict === 'PARTIAL' && createOk && stampOnList
          ? 'FAIL_TO_PM'
          : 'FAIL_TO_PM';
    const out = {
      work_item_id: 'PO-UC-TC-W4-QA-E4-CI01-R3',
      uc_id: 'HRM-CI-01',
      startedAt: ts(),
      endedAt: ts(),
      u65: 'zero-seed',
      hdsd_align: true,
      seed_used: false,
      env: { PORTAL, HRM, XBOS, EMAIL, RUN, contractStamp, surface },
      l0: { hrm: 200, xbos: 200, portal: 200 },
      verdict,
      createOk,
      stampOnList,
      formReady,
      surface,
      posts,
      steps,
      click_log,
      network: network.filter((n) =>
        /auth\/login|\/contracts|employees|settings-catalogs/.test(n.url),
      ),
      consoleErrors: consoleErrors.slice(0, 20),
      residuals,
      screens: SCREEN.replace(/\\/g, '/'),
      ack_status: ack,
      uat_done: false,
      phase1_done_claimed: false,
    };
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    console.log('OUT', OUT);
    console.log('VERDICT', verdict, JSON.stringify({ createOk, stampOnList, formReady, posts }, null, 2));
    await browser.close().catch(() => {});
    process.exitCode = 0;
  }
}

main().catch((e) => {
  console.error(e);
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        work_item_id: 'PO-UC-TC-W4-QA-E4-CI01-R3',
        blocked: true,
        error: String(e?.message || e),
        ack_status: 'FAIL_TO_PM',
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
