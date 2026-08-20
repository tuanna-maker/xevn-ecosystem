#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E4-CI01-R4 — HRM-CI-01 CC iframe ONLY (U65)
 * Login UI → menu Hợp đồng → Thêm (iframe) → dialog parent-portal OR latch → Lưu → F5 by API code
 * CẤM: seed · fallback navigate to /hr · invent PASS if dialog never opens on parent
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e4-ci01-r4.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const RUN = `W4E4R4-${Date.now().toString(36).slice(-5).toUpperCase()}`;

const network = [];
const click_log = [];
const steps = {};
const consoleErrors = [];

function log(msg, extra = {}) {
  click_log.push({ at: ts(), msg, ...extra });
  console.error(`[CI01-R4 ${click_log.length}] ${msg}`, extra.note || '');
}
function record(id, verdict, summary) {
  steps[id] = { verdict, summary, at: ts() };
  console.log(`${verdict} ${id} — ${summary.slice(0, 480)}`);
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

async function hrmScope(page) {
  await page.locator('iframe').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => {});
  await sleep(800);
  const f = page.frames().find((fr) => /\/hr\//.test(fr.url()));
  return f || page;
}

/** Prefer parent doc (portal dialog); never .or() across frames. */
async function visibleIn(page, hrm, factory) {
  const parentLoc = factory(page);
  if (await parentLoc.first().isVisible().catch(() => false)) return parentLoc.first();
  const iframeLoc = factory(hrm);
  if (await iframeLoc.first().isVisible().catch(() => false)) return iframeLoc.first();
  return null;
}

async function pickFirstOption(page, hrm, triggerTestId) {
  const trigger = await visibleIn(page, hrm, (s) => s.getByTestId(triggerTestId));
  if (!trigger) return false;
  await trigger.click({ force: true });
  await sleep(500);
  // Radix select / cmdk options often also portal to parent
  const opt = page.getByRole('option').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  const optIframe = hrm.getByRole('option').first();
  if (await optIframe.isVisible().catch(() => false)) {
    await optIframe.click({ force: true });
    await sleep(400);
    return true;
  }
  await page.evaluate(() => {
    const o = document.querySelector('[role="option"]');
    if (o) o.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(400);
  return true;
}

async function assertDialogOpen(page, hrm) {
  const parentDlg = page.getByTestId('hdsd-contracts-form-dialog');
  await parentDlg.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  let parentVisible = await parentDlg.isVisible().catch(() => false);

  const latch = hrm.getByTestId('hdsd-contracts-form-dialog-open');
  const latchVisible = await latch.isVisible().catch(() => false);
  // latch is sr-only — count attached nodes too
  const latchCount = await latch.count().catch(() => 0);

  if (!parentVisible) {
    parentVisible = await page
      .locator('[role="dialog"]')
      .filter({ hasText: /hợp đồng/i })
      .first()
      .isVisible()
      .catch(() => false);
  }

  // Do NOT fail solely because iframe document lacks dialog when parent has it
  const iframeDlgCount = await hrm.getByTestId('hdsd-contracts-form-dialog').count().catch(() => 0);

  return {
    parentVisible,
    latchVisible: latchVisible || latchCount > 0,
    latchCount,
    iframeDlgCount,
    open: parentVisible || ((latchVisible || latchCount > 0) && parentVisible),
  };
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
          work_item_id: 'PO-UC-TC-W4-QA-E4-CI01-R4',
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
  let apiContractCode = '';
  let createOk = false;
  let stampOnList = false;
  let formReady = false;
  let posts = [];
  let verdict = 'FAIL';
  let surface = 'iframe';
  const residuals = [];
  let dialogProbe = {};

  try {
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

    // HDSD: land CC HRM then menu Hợp đồng — stay on command-center (no /hr top nav)
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
      await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      log('MENU_FALLBACK_CC_CONTRACTS', {
        note: 'sidebar Hợp đồng not found — used /command-center/hrm/contracts',
      });
      await sleep(5000);
    }

    // Hard refuse leaving CC shell
    if (!/command-center/i.test(page.url())) {
      throw new Error(`Left command-center shell — url=${page.url()} (cấm /hr fallback)`);
    }

    let hrm = await hrmScope(page);
    log('HRM_SCOPE', {
      note: typeof hrm.url === 'function' ? hrm.url() : page.url(),
    });
    if (typeof hrm.url === 'function' && !/\/hr\//.test(hrm.url())) {
      throw new Error('No HRM iframe under command-center');
    }

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
        const retry = hrm.getByTestId('contracts-list-empty-error-cta');
        if (await retry.isVisible().catch(() => false)) {
          await retry.click({ force: true });
          log('RETRY_LIST_AFTER_AUTH');
        }
      }
      await sleep(1500);
      hrm = await hrmScope(page);
    }
    await shot(page, '02-contracts-list');
    const listBody = await hrm.locator('body').innerText().catch(() => '');
    const listChrome = /Thêm hợp đồng|Mã HĐ|Hợp đồng/i.test(listBody);
    const getContracts = network.filter(
      (n) => n.method === 'GET' && /contracts/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    record(
      'OPEN_LIST',
      listOk && listChrome ? 'PASS' : listChrome ? 'PARTIAL' : 'FAIL',
      `listOk=${listOk} chrome=${listChrome} gets=${getContracts.length} codes=${getContracts.map((g) => g.code || g.status).join(',')} page=${page.url()} iframe=${typeof hrm.url === 'function' ? hrm.url() : 'n/a'}`,
    );
    if (!listChrome) throw new Error('Contracts chrome missing in HRM iframe');
    if (!listOk) throw new Error('Contracts list not loaded — refuse mutate');
    if (!/command-center/i.test(page.url())) {
      throw new Error('Not on command-center after list load');
    }

    // Count tab before create (for FE after 2xx)
    const tabAllBefore = await hrm
      .locator('button, [role="tab"]')
      .filter({ hasText: /Tất cả/i })
      .first()
      .innerText()
      .catch(() => '');

    // 3) Thêm inside iframe only
    const createBtn = hrm.getByTestId('hdsd-contracts-create-btn');
    if (!(await createBtn.isVisible().catch(() => false))) {
      throw new Error('hdsd-contracts-create-btn not visible in iframe');
    }
    await createBtn.click({ timeout: 15000 });
    log('CLICK_THEM_HOP_DONG_IFRAME');
    await sleep(1200);

    dialogProbe = await assertDialogOpen(page, hrm);
    // Correct open: parent dialog OR (latch + parent form/dialog)
    const parentFormOrDlg =
      dialogProbe.parentVisible ||
      (await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false)) ||
      (await page.getByTestId('hdsd-contracts-form-submit').isVisible().catch(() => false));
    const dialogOpen =
      dialogProbe.parentVisible || (dialogProbe.latchVisible && parentFormOrDlg);

    await shot(page, '03-iframe-after-create-click');
    record(
      'OPEN_DIALOG_IFRAME',
      dialogOpen ? 'PASS' : 'FAIL',
      `parentDlg=${dialogProbe.parentVisible} latch=${dialogProbe.latchVisible} latchCount=${dialogProbe.latchCount} iframeDlgCount=${dialogProbe.iframeDlgCount} parentFormOrDlg=${parentFormOrDlg} (TECHSPEC §4.1 parent portal — iframe miss alone ≠ FAIL)`,
    );

    if (!dialogOpen) {
      residuals.push({
        id: 'R-W4E4-CI01-IFRAME-DIALOG',
        severity: 'P0',
        owner: 'dev-fe',
        note: 'CC iframe Thêm: neither parent hdsd-contracts-form-dialog nor (latch + parent form) visible — refuse invent PASS; no /hr fallback',
      });
      throw new Error('Dialog not open on parent after iframe Thêm (R4 no /hr fallback)');
    }

    await sleep(1500);

    const readyDeadline = Date.now() + 30000;
    formReady = Boolean(
      await visibleIn(page, hrm, (s) => s.getByTestId('hdsd-contracts-form-ready')),
    );
    while (!formReady && Date.now() < readyDeadline) {
      await pickFirstOption(page, hrm, 'hdsd-contracts-form-employee');
      const typeHost = await visibleIn(page, hrm, (s) => s.getByTestId('hdsd-contracts-form-contract-type'));
      if (typeHost) {
        await typeHost.click({ force: true });
        await sleep(600);
        const opt = page.getByRole('option').first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
        else {
          const opt2 = hrm.getByRole('option').first();
          if (await opt2.isVisible().catch(() => false)) await opt2.click({ force: true });
        }
        await sleep(400);
      }
      await sleep(800);
      formReady = Boolean(
        await visibleIn(page, hrm, (s) => s.getByTestId('hdsd-contracts-form-ready')),
      );
    }

    const codeInput = await visibleIn(page, hrm, (s) => s.locator('#contract_code'));
    if (codeInput) {
      const cur = await codeInput.inputValue().catch(() => '');
      if (cur && cur.trim()) {
        contractStamp = cur.trim();
      } else {
        contractStamp = `HD-${RUN}`;
        await codeInput.fill(contractStamp);
      }
      const notes = await visibleIn(page, hrm, (s) => s.locator('#notes, textarea'));
      if (notes) {
        await notes.fill(`QA CI01-R4 ${RUN}`);
      }
    } else {
      contractStamp = RUN;
    }

    await shot(page, '04-form-filled');
    record(
      'FORM_READY',
      formReady ? 'PASS' : 'PARTIAL',
      `formReady=${formReady} code=${contractStamp} surface=iframe page=${page.url()}`,
    );

    if (!/command-center/i.test(page.url())) {
      throw new Error('Left command-center before Lưu — abort');
    }

    const net0 = network.length;
    const submit = await visibleIn(page, hrm, (s) => s.getByTestId('hdsd-contracts-form-submit'));
    const submitVisible = Boolean(submit);
    const submitDisabled = submit ? await submit.isDisabled().catch(() => false) : true;
    log('CLICK_LUU', { note: `disabled=${submitDisabled} formReady=${formReady}` });
    if (!formReady) {
      record('MAIN_SAVE', 'FAIL', 'refuse Lưu — hdsd-contracts-form-ready not visible');
      throw new Error('form not ready before Lưu');
    }
    if (!submit) {
      record('MAIN_SAVE', 'FAIL', 'hdsd-contracts-form-submit not visible on parent or iframe');
      throw new Error('submit CTA missing');
    }
    await submit.click({ timeout: 15000 });

    const saveDeadline = Date.now() + 25000;
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
      await sleep(500);
    }
    await sleep(1500);
    await shot(page, '05-after-save');

    posts = network
      .slice(net0)
      .filter((n) => n.method === 'POST' && /contracts/.test(n.url) && n.phase === 'response');
    createOk = posts.some((p) => p.status >= 200 && p.status < 300 && /HRM-CON-201|201/.test(String(p.code || p.status)));
    if (!createOk) createOk = posts.some((p) => p.status === 201);
    const okPost = posts.find((p) => p.status === 201) || posts.find((p) => p.status >= 200 && p.status < 300);
    if (okPost?.contract_code) apiContractCode = String(okPost.contract_code);

    const toastText = await page
      .locator('[data-sonner-toast]')
      .allInnerTexts()
      .catch(() => []);
    const tabAllAfter = await hrm
      .locator('button, [role="tab"]')
      .filter({ hasText: /Tất cả/i })
      .first()
      .innerText()
      .catch(() => '');
    const toastOk = toastText.some((t) => /thành công|success|Thêm hợp đồng/i.test(t));

    record(
      'MAIN_SAVE',
      createOk ? 'PASS' : 'FAIL',
      `createOk=${createOk} posts=${posts.map((p) => `${p.status}:${p.code || ''}:${p.contract_code || ''}`).join('|') || 'none'} toast=${JSON.stringify(toastText).slice(0, 180)} tabBefore=${tabAllBefore.slice(0, 40)} tabAfter=${tabAllAfter.slice(0, 40)} toastOk=${toastOk}`,
    );

    if (!createOk) {
      residuals.push({
        id: 'R-W4E4-CI01-MUTATE-INCOMPLETE',
        severity: 'P0',
        owner: 'dev-be',
        note: `iframe Lưu no POST 201 — posts=${posts.map((p) => `${p.status}:${p.code}`).join(',') || 'none'}`,
      });
      throw new Error('POST contracts not 201 from iframe surface');
    }

    // 5) F5 — reload page (CC shell) then search by API contract_code
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    if (!/command-center/i.test(page.url())) {
      // ensure still CC contracts
      await page.goto(`${PORTAL}/command-center/hrm/contracts`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(4000);
    }
    hrm = await hrmScope(page);

    const searchCode = apiContractCode || contractStamp;
    let after = await hrm.locator('body').innerText().catch(() => '');
    stampOnList = Boolean(searchCode && after.includes(searchCode));
    if (!stampOnList && searchCode) {
      const search = hrm.locator('input[placeholder*="Tìm"], input[placeholder*="Search"]').first();
      if (await search.isVisible().catch(() => false)) {
        await search.fill(searchCode);
        await sleep(1500);
        after = await hrm.locator('body').innerText();
        stampOnList = after.includes(searchCode);
      }
    }
    await shot(page, '06-f5');
    record(
      'FE_F5',
      createOk && stampOnList ? 'PASS' : createOk ? 'PARTIAL' : 'FAIL',
      `stampOnList=${stampOnList} searchCode=${searchCode} apiContractCode=${apiContractCode} contractStamp=${contractStamp}`,
    );

    if (createOk && stampOnList && dialogOpen) {
      verdict = 'PASS';
    } else if (createOk && dialogOpen) {
      verdict = 'PARTIAL';
      residuals.push({
        id: 'R-W4E4-CI01-CODE-DISPLAY',
        severity: 'P1',
        owner: 'dev-fe',
        note: `POST 201 but F5 search by API code miss — api=${apiContractCode} stamp=${contractStamp}`,
      });
    } else {
      verdict = 'FAIL';
    }
  } catch (e) {
    verdict = 'FAIL';
    if (!residuals.some((r) => r.id === 'R-W4E4-CI01-IFRAME-DIALOG' || r.id === 'R-W4E4-CI01-MUTATE-INCOMPLETE')) {
      residuals.push({
        id: 'R-W4E4-CI01-MUTATE-INCOMPLETE',
        severity: 'P0',
        owner: 'qa',
        note: `harness exception: ${e?.message || e}`,
      });
    }
    record('EXCEPTION', 'FAIL', String(e?.message || e));
    await shot(page, '99-exception').catch(() => {});
  } finally {
    const ack = verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    const out = {
      work_item_id: 'PO-UC-TC-W4-QA-E4-CI01-R4',
      uc_id: 'HRM-CI-01',
      startedAt: ts(),
      endedAt: ts(),
      u65: 'zero-seed',
      hdsd_align: true,
      seed_used: false,
      env: {
        PORTAL,
        HRM,
        XBOS,
        EMAIL,
        RUN,
        contractStamp,
        apiContractCode,
        surface,
        pageUrlFinal: page.url(),
      },
      l0,
      verdict,
      createOk,
      stampOnList,
      formReady,
      surface,
      dialogProbe,
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
      no_hr_fallback: true,
    };
    writeFileSync(OUT, JSON.stringify(out, null, 2));
    console.log('OUT', OUT);
    console.log(
      'VERDICT',
      verdict,
      JSON.stringify({ createOk, stampOnList, formReady, apiContractCode, dialogProbe }, null, 2),
    );
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
        work_item_id: 'PO-UC-TC-W4-QA-E4-CI01-R4',
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
