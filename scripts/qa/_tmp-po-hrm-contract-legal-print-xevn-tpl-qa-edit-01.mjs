#!/usr/bin/env node
/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01
 * Retest R-CTR-XEVN-TPL-FE-EDIT-RESTORE after FE-EDIT-01
 * U65 zero-seed · browser-only · honesty contracts_printable_ready=false
 * AC: create bind #9 → F5 → Sửa → picker still #9 (not «— Chưa chọn —»)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-edit-01.FINAL.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-qa-edit-01',
);
mkdirSync(SCREEN, { recursive: true });

const STAMP = `EDIT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TPL_CODE = `XEVN_CUSTOM_${STAMP}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const results = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-EDIT-01',
  residual: 'R-CTR-XEVN-TPL-FE-EDIT-RESTORE',
  parent: 'PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP, TPL_CODE },
  honesty: {
    contracts_printable_ready: false,
    contracts_printable_ready_claimed: false,
    seed_used: false,
    api_only_pass: false,
  },
  denied: [
    'contracts_printable_ready=true',
    'seed',
    'api_only_pass',
    'invent_printable_UAT',
    'reopen_Q-CTR',
  ],
  l0: {},
  ids: { tplCode: TPL_CODE },
  ac: {},
  must_keep: {},
  process: {},
  network: [],
  requestBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  overall: null,
  ack_status: null,
  f5KeepsTpl: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || '');
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function hasMojibake(text) {
  if (!text) return false;
  return /Ã.|Â.|Ä.|Æ.|â€|ï¿½|�/.test(text);
}

function processGate() {
  const dndStorm = results.consoleErrors.filter((t) =>
    /Unable to find drag handle|@hello-pangea\/dnd/i.test(t),
  );
  const uncaught = [
    ...results.pageErrors,
    ...results.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  results.process = {
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    dndStorm: dndStorm.length,
    uncaught: uncaught.length,
    mojibake: false,
    samplePageErrors: results.pageErrors.slice(0, 5),
    sampleConsole: results.consoleErrors.slice(0, 10),
  };
  return { fail: dndStorm.length > 0 || uncaught.length > 0 };
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = req.method();
      if (!['POST', 'PUT', 'PATCH'].includes(method)) return;
      if (!/contract-templates|\/preview|contracts-insurance\/contracts/.test(u)) return;
      let body = null;
      try {
        body = req.postDataJSON();
      } catch {
        try {
          body = req.postData();
        } catch {
          /* */
        }
      }
      results.requestBodies.push({
        method,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        body:
          body && typeof body === 'object'
            ? {
                template_code: body.template_code,
                template_id: body.template_id,
                code: body.code,
                pack_code: body.pack_code,
                keys: Object.keys(body).slice(0, 24),
              }
            : String(body || '').slice(0, 200),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const interesting =
        /contract-templates|\/preview|contracts-insurance\/contracts/.test(u);
      if (!interesting) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      try {
        const ct = res.headers()['content-type'] || '';
        if (/json/i.test(ct)) {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 160);
          if (j?.data?.id) entry.dataId = j.data.id;
          if (j?.data?.code) entry.dataCode = j.data.code;
          if (j?.data?.template_id) entry.template_id = j.data.template_id;
          if (j?.data?.template_code) entry.template_code = j.data.template_code;
        }
      } catch {
        /* */
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function pickFirstOption(page, testId) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = page.getByRole('option').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  return false;
}

async function selectOptionByText(page, testId, textRe) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = page.getByRole('option').filter({ hasText: textRe }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
}

async function openSettingsLegal(page) {
  await page.goto(q('/hr/settings', { tab: 'contract-legal' }), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2500);
  const tabBtn = page.getByTestId('settings-tab-contract-legal');
  if (await tabBtn.isVisible().catch(() => false)) {
    await tabBtn.click();
    await sleep(1200);
  }
}

async function openTemplatesTab(page) {
  const tab = page.getByTestId('ctr-legal-tab-templates');
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await sleep(800);
  }
}

async function pickTplCode(page, code) {
  const tplTrig = page.getByTestId('ctr-print-template');
  await tplTrig.click({ force: true });
  await sleep(800);
  const optById = page.getByTestId(`ctr-print-tpl-option-${code}`);
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if ((await optById.count().catch(() => 0)) > 0) break;
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
    await tplTrig.click({ force: true });
    await sleep(600);
  }
  if ((await optById.count().catch(() => 0)) > 0) {
    await optById.first().scrollIntoViewIfNeeded().catch(() => {});
    await sleep(200);
    await optById.first().click({ force: true });
    return true;
  }
  const opt9 = page.getByRole('option').filter({ hasText: code }).first();
  if (await opt9.count().catch(() => 0)) {
    await opt9.scrollIntoViewIfNeeded().catch(() => {});
    await opt9.click({ force: true });
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function openEditOnRow(page, contractCode) {
  const row = page.locator('tr, [role="row"]').filter({ hasText: contractCode }).first();
  await row.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  const pencil = row
    .getByRole('button', { name: /Sửa|Edit|Chỉnh sửa/i })
    .or(
      row.locator(
        'button[aria-label*="Sửa"], button[aria-label*="Edit"], button[aria-label*="Chỉnh"]',
      ),
    )
    .first();
  if (await pencil.isVisible().catch(() => false)) {
    await pencil.click({ force: true });
  } else {
    const actionBtns = row.locator('td').last().locator('button');
    const count = await actionBtns.count().catch(() => 0);
    if (count >= 2) await actionBtns.nth(1).click({ force: true });
    else throw new Error('edit pencil not found on row');
  }
  await page
    .getByTestId('hdsd-contracts-form-dialog')
    .waitFor({ state: 'visible', timeout: 20000 });
  await sleep(1500);
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[k] = { status: r.status, url };
    } catch (e) {
      results.l0[k] = { status: 0, error: String(e).slice(0, 120) };
    }
  }
  save();
  if (results.l0.portal?.status !== 200 || results.l0.hrm?.status !== 200) {
    results.ack_status = 'FAIL_TO_PM';
    results.overall = 'FAIL';
    results.endedAt = ts();
    save();
    throw new Error('L0 FAIL');
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  let contractCode = `HD-${STAMP}`;

  try {
    // ——— 1. Settings: create open-catalog template #9 ———
    await openSettingsLegal(page);
    await openTemplatesTab(page);
    await sleep(600);
    await shot(page, '00-settings-templates');

    await page.getByTestId('ctr-tpl-code').fill(TPL_CODE);
    await page.getByTestId('ctr-tpl-name').fill(`Mẫu EDIT restore ${STAMP}`);
    await page.getByTestId('ctr-tpl-title-print').fill(`HĐLĐ EDIT ${STAMP}`);
    await selectOptionByText(page, 'ctr-tpl-pack', /GENERAL|Chung|general/i);
    await selectOptionByText(page, 'ctr-tpl-status', /Hiệu lực|active/i);
    await selectOptionByText(page, 'ctr-tpl-term-type', /Xác định|definite/i).catch(() => {});
    const matrixTrig = page.getByTestId('ctr-tpl-matrix-family');
    if (await matrixTrig.isVisible().catch(() => false)) {
      const matrixLabel = (await matrixTrig.innerText().catch(() => '')).trim();
      if (/X\.E|XEVN_MATRIX|LEGACY|Ma trận X/i.test(matrixLabel)) {
        await selectOptionByText(page, 'ctr-tpl-matrix-family', /^—$/);
      }
    }
    await shot(page, '01-tpl-form');

    const nTpl = results.network.length;
    await page.getByTestId('ctr-tpl-save').click();
    log('CLICK_TPL_SAVE', { note: TPL_CODE });
    await sleep(3000);
    const tplPosts = results.network.slice(nTpl).filter((n) => /contract-templates/.test(n.url));
    const tplCreateOk = tplPosts.some(
      (p) => p.method === 'POST' && p.status >= 200 && p.status < 300,
    );
    if (await page.getByTestId('ctr-tpl-activate').isVisible().catch(() => false)) {
      await page.getByTestId('ctr-tpl-activate').click();
      await sleep(2000);
    }
    await hardRefresh(page);
    await openSettingsLegal(page);
    await openTemplatesTab(page);
    await sleep(800);
    const rowAfterF5 = await page.getByTestId(`ctr-tpl-row-${TPL_CODE}`).isVisible().catch(() => false);
    await shot(page, '02-tpl-f5');
    recordAc('AC-CREATE-TPL-9', tplCreateOk && rowAfterF5 ? 'PASS' : 'FAIL', {
      summary: `POST2xx=${tplCreateOk} F5row=${rowAfterF5} code=${TPL_CODE}`,
      tplPosts: tplPosts.map((p) => ({ method: p.method, status: p.status, code: p.code })),
    });

    // ——— 2. Create HĐ bind #9 ———
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    await hardRefresh(page);
    await sleep(2000);
    await shot(page, '03-contracts-list');

    const createBtn = page.getByTestId('hdsd-contracts-create-btn');
    if (!(await createBtn.isVisible().catch(() => false))) {
      throw new Error('create btn missing');
    }
    await createBtn.click();
    await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 25000 });
    await sleep(1500);

    let formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
    const deadline = Date.now() + 45000;
    while (!formReady && Date.now() < deadline) {
      await pickFirstOption(page, 'hdsd-contracts-form-employee');
      await pickFirstOption(page, 'hdsd-contracts-form-contract-type');
      await sleep(700);
      formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
    }

    const codeInput = page.locator('#contract_code');
    if (await codeInput.isVisible().catch(() => false)) {
      const cur = (await codeInput.inputValue().catch(() => '')).trim();
      contractCode = cur || contractCode;
      if (!cur) await codeInput.fill(contractCode);
    }
    results.ids.contractCode = contractCode;

    const spine = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
    results.must_keep['print-spine'] = {
      verdict: spine ? 'PASS' : 'FAIL',
      summary: `ctr-print-spine visible=${spine}`,
    };

    await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i).catch(() => {});
    await sleep(400);
    let picked = await pickTplCode(page, TPL_CODE);
    await sleep(500);
    let pickerTriggerText = (
      await page.getByTestId('ctr-print-template').innerText().catch(() => '')
    ).trim();
    if (!new RegExp(esc(TPL_CODE), 'i').test(pickerTriggerText)) {
      picked = (await pickTplCode(page, TPL_CODE)) || picked;
      await sleep(400);
      pickerTriggerText = (
        await page.getByTestId('ctr-print-template').innerText().catch(() => '')
      ).trim();
    }
    const pickerHas9 = new RegExp(esc(TPL_CODE), 'i').test(pickerTriggerText);
    await shot(page, '04-create-picker');
    recordAc('AC-CREATE-BIND-PICKER', pickerHas9 && spine ? 'PASS' : 'FAIL', {
      summary: `picked=${picked} trigger=${pickerTriggerText.slice(0, 100)}`,
    });

    if (!formReady) throw new Error('formReady=false');

    const nCreate = results.network.length;
    await page.getByTestId('hdsd-contracts-form-submit').click({ timeout: 15000 });
    log('CLICK_LUU', { note: contractCode });
    await sleep(4000);
    const posts = results.network
      .slice(nCreate)
      .filter((n) => n.method === 'POST' && /contracts-insurance\/contracts(\?|$)/.test(n.url));
    const saveOk = posts.some((p) => p.status >= 200 && p.status < 300);
    const createdId = posts.find((p) => p.dataId)?.dataId || null;
    results.ids.contractId = createdId;

    const createReq = [...results.requestBodies]
      .reverse()
      .find(
        (b) =>
          b.method === 'POST' &&
          /contracts-insurance\/contracts(\?|$)/.test(b.url) &&
          typeof b.body === 'object',
      );
    const createBoundTpl =
      createReq?.body?.template_code === TPL_CODE ||
      String(createReq?.body?.template_code || '').toUpperCase() === TPL_CODE;

    // ——— 3. F5 list → open Sửa (NO re-select) ———
    await hardRefresh(page);
    await sleep(2500);
    const listText = await page.locator('body').innerText().catch(() => '');
    const codeOnList = listText.includes(contractCode);
    await shot(page, '05-list-f5');
    results.must_keep['UF-HRM-02'] = {
      verdict: saveOk && codeOnList ? 'PASS' : saveOk ? 'PARTIAL' : 'FAIL',
      summary: `save2xx=${saveOk} F5list=${codeOnList} createBoundTpl=${createBoundTpl} bound=${createReq?.body?.template_code || ''}`,
    };
    recordAc('AC-CREATE-SAVE-F5', saveOk && codeOnList && createBoundTpl ? 'PASS' : 'FAIL', {
      summary: `save2xx=${saveOk} list=${codeOnList} bound=${createBoundTpl} id=${createdId}`,
      createReq,
    });

    await openEditOnRow(page, contractCode);
    log('OPEN_EDIT_AFTER_F5', { note: contractCode });

    const spineEdit = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
    const trig = page.getByTestId('ctr-print-template');
    const editTrigText = (await trig.innerText().catch(() => '')).trim();
    const isEmptyPick =
      /Chưa chọn|^—\s*$|^\s*$/i.test(editTrigText) || editTrigText === '— Chưa chọn —';
    const f5KeepsTpl =
      spineEdit && new RegExp(esc(TPL_CODE), 'i').test(editTrigText) && !isEmptyPick;
    results.f5KeepsTpl = f5KeepsTpl;
    results.ids.editTrigText = editTrigText.slice(0, 160);
    results.ids.isEmptyPick = isEmptyPick;
    await shot(page, '06-edit-after-f5-picker');

    // Optional strengthen: preview without re-select
    let previewWithoutReselect = null;
    if (f5KeepsTpl) {
      const wl = page.getByTestId('ctr-print-override-work_location');
      if (await wl.isVisible().catch(() => false)) {
        const v = await wl.inputValue().catch(() => '');
        if (!v.trim()) await wl.fill('Hà Nội — QA-EDIT-01');
      }
      const nPrev = results.network.length;
      const nReq = results.requestBodies.length;
      const previewBtn = page.getByTestId('ctr-print-preview-btn');
      if (await previewBtn.isVisible().catch(() => false)) {
        await previewBtn.click({ force: true });
        log('CLICK_PREVIEW_NO_RESELECT', { note: TPL_CODE });
        await sleep(4000);
        const prevRes = results.network.slice(nPrev).filter((n) => /\/preview/.test(n.url));
        const prevOk = prevRes.some((p) => p.status >= 200 && p.status < 300);
        const prevReq = results.requestBodies
          .slice(nReq)
          .find((b) => /\/preview/.test(b.url) && typeof b.body === 'object');
        const bodyHasTpl =
          prevReq?.body?.template_code === TPL_CODE ||
          String(prevReq?.body?.template_code || '').toUpperCase() === TPL_CODE;
        previewWithoutReselect = { prevOk, bodyHasTpl, bodyCode: prevReq?.body?.template_code || null };
        await shot(page, '07-preview-no-reselect');
      }
    }

    recordAc('R-CTR-XEVN-TPL-FE-EDIT-RESTORE', f5KeepsTpl ? 'PASS' : 'FAIL', {
      summary: `f5KeepsTpl=${f5KeepsTpl} emptyPick=${isEmptyPick} trigger=${editTrigText.slice(0, 100)} spine=${spineEdit}`,
      editTrigText: editTrigText.slice(0, 160),
      previewWithoutReselect,
    });

    if (!f5KeepsTpl) {
      results.residuals.push({
        id: 'R-CTR-XEVN-TPL-FE-EDIT-RESTORE',
        severity: 'P1',
        owner: 'dev-fe',
        status: 'OPEN',
        note: `After F5→Sửa picker=${editTrigText.slice(0, 80)} expect ${TPL_CODE}`,
      });
    } else {
      results.residuals.push({
        id: 'R-CTR-XEVN-TPL-FE-EDIT-RESTORE',
        severity: 'P1',
        owner: 'dev-fe',
        status: 'CLOSED',
        note: `f5KeepsTpl=true · picker=${editTrigText.slice(0, 80)}`,
      });
    }

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const mojibake = hasMojibake(bodyText.slice(0, 8000));
    const gate = processGate();
    results.process.mojibake = mojibake;
    recordAc('PROCESS-HYGIENE', !gate.fail && !mojibake ? 'PASS' : 'FAIL', {
      summary: `dndStorm=${results.process.dndStorm} uncaught=${results.process.uncaught} mojibake=${mojibake}`,
    });

    results.must_keep['Q-CTR'] = {
      verdict: 'PASS',
      summary: 'not reopened — edit-restore residual only',
    };
    results.must_keep['honesty'] = {
      verdict: 'PASS',
      summary: 'contracts_printable_ready=false retained',
    };
    results.must_keep['UF-HRM-02'] = results.must_keep['UF-HRM-02'] || {
      verdict: 'PASS',
      summary: 'create path exercised',
    };
    results.must_keep['open-catalog'] = {
      verdict: tplCreateOk ? 'PASS' : 'FAIL',
      summary: `created custom ${TPL_CODE}`,
    };

    const core =
      results.ac['AC-CREATE-TPL-9']?.verdict === 'PASS' &&
      results.ac['AC-CREATE-BIND-PICKER']?.verdict === 'PASS' &&
      results.ac['AC-CREATE-SAVE-F5']?.verdict === 'PASS' &&
      results.ac['R-CTR-XEVN-TPL-FE-EDIT-RESTORE']?.verdict === 'PASS' &&
      results.ac['PROCESS-HYGIENE']?.verdict === 'PASS' &&
      results.must_keep['print-spine']?.verdict === 'PASS';

    results.overall = core ? 'PASS' : 'FAIL';
    results.ack_status = core ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  } catch (e) {
    results.residuals.push({
      id: 'R-CTR-XEVN-TPL-QA-EDIT-HARNESS',
      severity: 'P0',
      owner: 'qa',
      note: String(e).slice(0, 400),
    });
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    console.error(e);
    await shot(page, '99-error').catch(() => {});
  } finally {
    results.endedAt = ts();
    results.honesty.contracts_printable_ready = false;
    results.honesty.contracts_printable_ready_claimed = false;
    save();
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        overall: results.overall,
        ack_status: results.ack_status,
        f5KeepsTpl: results.f5KeepsTpl,
        ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
        honesty: results.honesty.contracts_printable_ready,
        ids: results.ids,
      },
      null,
      2,
    ),
  );
  if (results.overall !== 'PASS') process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  results.overall = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  process.exit(1);
});
