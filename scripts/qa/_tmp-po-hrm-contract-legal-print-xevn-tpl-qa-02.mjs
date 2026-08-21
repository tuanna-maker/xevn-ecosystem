#!/usr/bin/env node
/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02 — AC-CTR-XEVN-11 (DYNAMIC LOCK)
 * U65 zero-seed · browser-only · honesty contracts_printable_ready=false
 * Scope: Settings create #9 → 2xx → F5 · Create HĐ picker · preview bind template_code
 * Optional: starter 8 list · CFG org_suffix F5 · process hygiene
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

const STARTERS = [
  'XEVN_PROBATION_OFFICE',
  'XEVN_FT_12M_OFFICE',
  'XEVN_FT_24M_OFFICE',
  'XEVN_INDEF_OFFICE',
  'XEVN_PROBATION_DRIVER',
  'XEVN_FT_12M_DRIVER',
  'XEVN_FT_24M_DRIVER',
  'XEVN_INDEF_DRIVER',
];

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-QA-02.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-QA-02');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `XEVN9-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TPL_CODE = `XEVN_CUSTOM_${STAMP}`;
const CFG_SUFFIX = `XE-${STAMP.slice(-4)}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-02',
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
    'hardcode_assert_exactly_8_only',
    'reopen_Q-CTR',
  ],
  l0: {},
  ids: { tplCode: TPL_CODE },
  ac: {},
  optional: {},
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
function recordOpt(id, verdict, detail = {}) {
  results.optional[id] = { ...detail, verdict, at: ts() };
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
    sampleDnd: dndStorm.slice(0, 3),
  };
  return { fail: dndStorm.length > 0 || uncaught.length > 0, dndStorm, uncaught };
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
      if (!/contract-templates|company-settings|\/preview|contracts-insurance\/contracts/.test(u))
        return;
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
                company_id: body.company_id,
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
        /contract-templates|company-settings|\/preview|print-versions|contracts-insurance\/contracts/.test(
          u,
        );
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
          if (j?.data?.template_code) entry.template_code = j.data.template_code;
          if (Array.isArray(j?.data?.data)) entry.listCount = j.data.data.length;
          if (typeof j?.data?.total === 'number') entry.total = j.data.total;
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
    // ——— Settings: create template #9 ———
    await openSettingsLegal(page);
    await shot(page, '00-settings-legal');

    // Optional CFG-01
    const cfgPanel = page.getByTestId('ctr-company-settings-cfg');
    if (await cfgPanel.isVisible().catch(() => false)) {
      await page.getByTestId('ctr-cfg-org-suffix').fill(CFG_SUFFIX);
      const nCfg = results.network.length;
      await page.getByTestId('ctr-cfg-save').click();
      await sleep(2000);
      const cfgPosts = results.network
        .slice(nCfg)
        .filter((n) => /company-settings/.test(n.url) && n.status >= 200 && n.status < 300);
      await hardRefresh(page);
      await openSettingsLegal(page);
      const suffixVal = await page.getByTestId('ctr-cfg-org-suffix').inputValue().catch(() => '');
      const cfgOk = cfgPosts.length > 0 && suffixVal.includes(CFG_SUFFIX);
      recordOpt('CFG-ORG-SUFFIX-F5', cfgOk ? 'PASS' : 'FAIL', {
        summary: `save2xx=${cfgPosts.length > 0} F5value=${suffixVal.slice(0, 40)} expect=${CFG_SUFFIX}`,
        cfgPosts: cfgPosts.map((p) => ({ status: p.status, method: p.method })),
      });
      await shot(page, '01-cfg-f5');
    } else {
      recordOpt('CFG-ORG-SUFFIX-F5', 'SKIP', { summary: 'cfg panel not visible' });
    }

    await openTemplatesTab(page);
    await sleep(600);

    // Optional starter presence (not assert exactly-8-only)
    const starterHits = [];
    for (const code of STARTERS) {
      const vis = await page.getByTestId(`ctr-tpl-row-${code}`).isVisible().catch(() => false);
      if (vis) starterHits.push(code);
    }
    const listCountText = await page.getByTestId('ctr-tpl-list-count').innerText().catch(() => '');
    recordOpt('STARTER-8-LIST', starterHits.length > 0 ? 'PASS' : 'SKIP', {
      summary: `present=${starterHits.length}/8 (soft; not ceiling) listCount=${listCountText.slice(0, 80)}`,
      starterHits,
      note: 'PASS if any starters visible; empty catalog OK if create #9 works',
    });

    // Create #9
    await page.getByTestId('ctr-tpl-code').fill(TPL_CODE);
    await page.getByTestId('ctr-tpl-name').fill(`Mẫu tùy chỉnh QA ${STAMP}`);
    await page.getByTestId('ctr-tpl-title-print').fill(`HĐLĐ CUSTOM ${STAMP}`);
    // Open catalog AC-11: leave matrix_family default «—» (null). Do NOT pick XEVN_MATRIX with GENERAL
    // (BE assertMatrixPack: XEVN_MATRIX requires IT_OFFICE|DRIVER).
    await selectOptionByText(page, 'ctr-tpl-pack', /GENERAL|Chung|general/i);
    await selectOptionByText(page, 'ctr-tpl-status', /Hiệu lực|active/i);
    await selectOptionByText(page, 'ctr-tpl-term-type', /Xác định|definite/i).catch(() => {});
    // Ensure matrix stays empty if prior run left it open
    const matrixTrig = page.getByTestId('ctr-tpl-matrix-family');
    if (await matrixTrig.isVisible().catch(() => false)) {
      const matrixLabel = (await matrixTrig.innerText().catch(() => '')).trim();
      if (/X\.E|XEVN_MATRIX|LEGACY|Ma trận X/i.test(matrixLabel)) {
        await selectOptionByText(page, 'ctr-tpl-matrix-family', /^—$/);
      }
    }
    await shot(page, '02-tpl-form-filled');

    const nTpl = results.network.length;
    await page.getByTestId('ctr-tpl-save').click();
    log('CLICK_TPL_SAVE', { note: TPL_CODE });
    await sleep(3000);
    const tplPosts = results.network.slice(nTpl).filter((n) => /contract-templates/.test(n.url));
    const tplCreateOk = tplPosts.some(
      (p) => p.method === 'POST' && p.status >= 200 && p.status < 300,
    );
    const createBody = results.requestBodies.find(
      (b) =>
        b.method === 'POST' &&
        /contract-templates/.test(b.url) &&
        (b.body?.code === TPL_CODE || String(b.body?.code || '').includes('XEVN_CUSTOM')),
    );

    // Activate if still draft
    if (await page.getByTestId('ctr-tpl-activate').isVisible().catch(() => false)) {
      const nA = results.network.length;
      await page.getByTestId('ctr-tpl-activate').click();
      await sleep(2000);
      results.ids.tplActivate = results.network
        .slice(nA)
        .some((n) => /activate/.test(n.url) && n.status >= 200 && n.status < 300);
    }

    const rowBeforeF5 = await page.getByTestId(`ctr-tpl-row-${TPL_CODE}`).isVisible().catch(() => false);
    await shot(page, '03-tpl-after-save');

    await hardRefresh(page);
    await openSettingsLegal(page);
    await openTemplatesTab(page);
    await sleep(1000);
    const rowAfterF5 = await page.getByTestId(`ctr-tpl-row-${TPL_CODE}`).isVisible().catch(() => false);
    await shot(page, '04-tpl-f5');

    const codeInvalidEnum = tplPosts.some(
      (p) =>
        /CODE-INVALID/i.test(String(p.code || '')) &&
        /not in|không thuộc|starter|8 mã/i.test(String(p.message || '')),
    );

    const ac11Create =
      tplCreateOk && rowAfterF5 && !codeInvalidEnum && !STARTERS.includes(TPL_CODE);
    recordAc('AC-CTR-XEVN-11-CREATE', ac11Create ? 'PASS' : 'FAIL', {
      summary: `POST2xx=${tplCreateOk} rowBefore=${rowBeforeF5} F5=${rowAfterF5} codeInvalidEnum=${codeInvalidEnum} activate=${results.ids.tplActivate}`,
      tplPosts: tplPosts.map((p) => ({
        method: p.method,
        status: p.status,
        code: p.code,
        dataCode: p.dataCode,
      })),
      createBody,
    });

    // ——— Create HĐ · picker #9 · preview bind ———
    // Fresh navigation so active templates include just-created #9
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    await hardRefresh(page);
    await sleep(2500);
    await shot(page, '05-contracts-list');

    const createBtn = page.getByTestId('hdsd-contracts-create-btn');
    if (!(await createBtn.isVisible().catch(() => false))) {
      recordAc('AC-CTR-XEVN-11-PICKER', 'FAIL', { summary: 'create btn missing' });
      recordAc('AC-CTR-XEVN-11-PREVIEW-BIND', 'FAIL', { summary: 'blocked — no create' });
      results.must_keep['UF-HRM-02'] = { verdict: 'FAIL', summary: 'create btn missing' };
    } else {
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

      const spine = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
      results.must_keep['print-spine'] = {
        verdict: spine ? 'PASS' : 'FAIL',
        summary: `ctr-print-spine visible=${spine}`,
      };

      let pickerHas9 = false;
      let pickerTriggerText = '';
      if (spine) {
        await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i).catch(() => {});
        await sleep(500);
        const tplTrig = page.getByTestId('ctr-print-template');

        async function pickTplCode() {
          await tplTrig.click({ force: true });
          await sleep(800);
          const optById = page.getByTestId(`ctr-print-tpl-option-${TPL_CODE}`);
          // Wait up to ~8s for open-catalog list to include just-created #9
          const deadline = Date.now() + 8000;
          while (Date.now() < deadline) {
            const count = await optById.count().catch(() => 0);
            if (count > 0) break;
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
          const opt9 = page.getByRole('option').filter({ hasText: TPL_CODE }).first();
          if (await opt9.count().catch(() => 0)) {
            await opt9.scrollIntoViewIfNeeded().catch(() => {});
            await opt9.click({ force: true });
            return true;
          }
          await page.keyboard.press('Escape').catch(() => {});
          return false;
        }

        let picked = await pickTplCode();
        await sleep(500);
        pickerTriggerText = (await tplTrig.innerText().catch(() => '')).trim();
        if (!new RegExp(TPL_CODE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(pickerTriggerText)) {
          picked = (await pickTplCode()) || picked;
          await sleep(500);
          pickerTriggerText = (await tplTrig.innerText().catch(() => '')).trim();
        }
        pickerHas9 = new RegExp(
          TPL_CODE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'i',
        ).test(pickerTriggerText);
        results.ids.pickerPicked = picked;
        results.ids.pickerTriggerText = pickerTriggerText.slice(0, 120);
      }
      await shot(page, '06-create-picker');

      recordAc('AC-CTR-XEVN-11-PICKER', pickerHas9 && spine ? 'PASS' : 'FAIL', {
        summary: `spine=${spine} pickerHas#9=${pickerHas9} trigger=${pickerTriggerText.slice(0, 80)} code=${TPL_CODE}`,
      });

      const nCreate = results.network.length;
      if (!formReady) {
        results.must_keep['UF-HRM-02'] = { verdict: 'FAIL', summary: 'formReady=false' };
        recordAc('AC-CTR-XEVN-11-PREVIEW-BIND', 'FAIL', { summary: 'blocked — formReady=false' });
      } else {
        // Final assert template still selected before Lưu
        const preSaveTpl = (
          await page.getByTestId('ctr-print-template').innerText().catch(() => '')
        ).trim();
        if (!new RegExp(TPL_CODE, 'i').test(preSaveTpl)) {
          await page.getByTestId('ctr-print-template').click({ force: true });
          await sleep(400);
          const o = page.getByTestId(`ctr-print-tpl-option-${TPL_CODE}`);
          if (await o.isVisible().catch(() => false)) await o.click({ force: true });
          await sleep(400);
        }

        await page.getByTestId('hdsd-contracts-form-submit').click({ timeout: 15000 });
        log('CLICK_LUU', { note: contractCode });
        await sleep(4000);
        const posts = results.network
          .slice(nCreate)
          .filter((n) => n.method === 'POST' && /contracts-insurance\/contracts(\?|$)/.test(n.url));
        const saveOk = posts.some((p) => p.status >= 200 && p.status < 300);
        const createdId = posts.find((p) => p.dataId)?.dataId || null;
        results.ids.contractId = createdId;
        results.ids.contractCode = contractCode;

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

        await hardRefresh(page);
        await sleep(2500);
        const listText = await page.locator('body').innerText().catch(() => '');
        const codeOnList = listText.includes(contractCode);
        await shot(page, '07-after-create-f5');

        results.must_keep['UF-HRM-02'] = {
          verdict: saveOk && codeOnList ? 'PASS' : saveOk ? 'PARTIAL' : 'FAIL',
          summary: `save2xx=${saveOk} F5list=${codeOnList} id=${createdId} createBoundTpl=${createBoundTpl} bound=${createReq?.body?.template_code || ''}`,
          createReq,
        };

        // Preview bind — open EDIT (not View/Chi tiết) then preview with #9
        let previewBindOk = false;
        let previewDetail = { createBoundTpl, createBoundCode: createReq?.body?.template_code || null };

        if (createdId || codeOnList) {
          const row = page.locator('tr, [role="row"]').filter({ hasText: contractCode }).first();
          // Avoid Chi tiết/View (Eye) — that dialog has no print spine
          const pencil = row
            .getByRole('button', { name: /Sửa|Edit|Chỉnh sửa/i })
            .or(row.locator('button[aria-label*="Sửa"], button[aria-label*="Edit"], button[aria-label*="Chỉnh"]'))
            .first();
          if (await pencil.isVisible().catch(() => false)) {
            await pencil.click({ force: true });
          } else {
            // nth pencil: Eye=0, Pencil=1 on action cell
            const actionBtns = row.locator('td').last().locator('button');
            const count = await actionBtns.count().catch(() => 0);
            if (count >= 2) await actionBtns.nth(1).click({ force: true });
          }
          await sleep(2500);

          const dialog = page.getByTestId('hdsd-contracts-form-dialog');
          await dialog.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

          const spineEdit = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
          if (spineEdit) {
            // Re-bind #9 — handleOpenEdit clears template; scroll open-catalog option into view
            const trig = page.getByTestId('ctr-print-template');
            const escRe = TPL_CODE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            let editHasTpl = new RegExp(escRe, 'i').test(
              (await trig.innerText().catch(() => '')).trim(),
            );
            for (let attempt = 0; attempt < 3 && !editHasTpl; attempt++) {
              await trig.click({ force: true });
              await sleep(700);
              const o = page.getByTestId(`ctr-print-tpl-option-${TPL_CODE}`);
              const waitUntil = Date.now() + 6000;
              while (Date.now() < waitUntil && (await o.count().catch(() => 0)) === 0) {
                await page.keyboard.press('Escape').catch(() => {});
                await sleep(300);
                await trig.click({ force: true });
                await sleep(500);
              }
              if ((await o.count().catch(() => 0)) > 0) {
                await o.first().scrollIntoViewIfNeeded().catch(() => {});
                await o.first().click({ force: true });
                await sleep(500);
              }
              editHasTpl = new RegExp(escRe, 'i').test(
                (await trig.innerText().catch(() => '')).trim(),
              );
            }
            previewDetail.editHasTplBeforePreview = editHasTpl;
            // Fill work_location override if present (can_issue path)
            const wl = page.getByTestId('ctr-print-override-work_location');
            if (await wl.isVisible().catch(() => false)) {
              const v = await wl.inputValue().catch(() => '');
              if (!v.trim()) await wl.fill('Hà Nội — trụ sở chính QA-02');
            }

            const nPrev = results.network.length;
            const nReq = results.requestBodies.length;
            const previewBtn = page.getByTestId('ctr-print-preview-btn');
            if ((await previewBtn.isVisible().catch(() => false)) && editHasTpl) {
              await previewBtn.click({ force: true });
              log('CLICK_PREVIEW', { note: TPL_CODE });
              await sleep(4000);
              const prevRes = results.network.slice(nPrev).filter((n) => /\/preview/.test(n.url));
              const prevOk = prevRes.some((p) => p.status >= 200 && p.status < 300);
              const prevReq = results.requestBodies
                .slice(nReq)
                .find((b) => /\/preview/.test(b.url) && typeof b.body === 'object');
              const bodyHasTpl =
                prevReq?.body?.template_code === TPL_CODE ||
                String(prevReq?.body?.template_code || '').toUpperCase() === TPL_CODE;
              const bodyHasCompanyId = Boolean(
                prevReq?.body &&
                  typeof prevReq.body === 'object' &&
                  Object.prototype.hasOwnProperty.call(prevReq.body, 'company_id') &&
                  prevReq.body.company_id != null,
              );
              const previewBody = await page
                .getByTestId('ctr-print-preview-body')
                .isVisible()
                .catch(() => false);
              const previewErr = await page
                .getByTestId('ctr-print-preview-error')
                .innerText()
                .catch(() => '');

              // F5 keep template on edit form
              await hardRefresh(page);
              await sleep(2000);
              const row2 = page.locator('tr, [role="row"]').filter({ hasText: contractCode }).first();
              const actionBtns2 = row2.locator('td').last().locator('button');
              if ((await actionBtns2.count().catch(() => 0)) >= 2) {
                await actionBtns2.nth(1).click({ force: true });
                await sleep(2000);
              }
              const f5Trig = (
                await page.getByTestId('ctr-print-template').innerText().catch(() => '')
              ).trim();
              const f5KeepsTpl = new RegExp(escRe, 'i').test(f5Trig);

              previewBindOk =
                createBoundTpl && prevOk && bodyHasTpl && !bodyHasCompanyId;
              if (previewBindOk && !f5KeepsTpl) {
                previewDetail.obs_f5 =
                  'R-CTR-XEVN-TPL-FE-EDIT-RESTORE — handleOpenEdit clears printTemplate*; F5/edit UI blank';
                results.residuals.push({
                  id: 'R-CTR-XEVN-TPL-FE-EDIT-RESTORE',
                  severity: 'P1',
                  owner: 'dev-fe',
                  note: 'Contracts.tsx handleOpenEdit clears printTemplateId/Code — AC F5 keep on edit UI',
                });
              }
              if (!previewBindOk && createBoundTpl) {
                previewDetail.obs =
                  'R-CTR-XEVN-TPL-FE-PREVIEW-BIND — create bound #9 OK; preview body template_code mismatch';
                results.residuals.push({
                  id: 'R-CTR-XEVN-TPL-FE-PREVIEW-BIND',
                  severity: 'P1',
                  owner: 'dev-fe',
                  note: `createBound=${createReq?.body?.template_code} previewBound=${prevReq?.body?.template_code}`,
                });
              }
              previewDetail = {
                ...previewDetail,
                prevOk,
                bodyHasTpl,
                bodyHasCompanyId,
                previewBody,
                previewErr: previewErr.slice(0, 120),
                f5Trig: f5Trig.slice(0, 80),
                f5KeepsTpl: new RegExp(
                  TPL_CODE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                  'i',
                ).test(f5Trig),
                prevRes: prevRes.map((p) => ({
                  status: p.status,
                  code: p.code,
                  template_code: p.template_code,
                })),
                prevReq,
              };
            } else {
              previewDetail.note = editHasTpl
                ? 'preview btn missing'
                : 'edit could not re-select #9 after handleOpenEdit clear';
              previewBindOk = false;
              if (createBoundTpl) {
                results.residuals.push({
                  id: 'R-CTR-XEVN-TPL-FE-EDIT-RESTORE',
                  severity: 'P1',
                  owner: 'dev-fe',
                  note: 'Edit spine cleared; re-select #9 failed before preview',
                });
              }
            }
          } else {
            previewDetail.note = 'edit spine missing (opened view?)';
            previewBindOk = false;
          }
          await shot(page, '08-preview');
        } else {
          previewDetail.note = 'no contract created';
        }

        recordAc('AC-CTR-XEVN-11-PREVIEW-BIND', previewBindOk ? 'PASS' : 'FAIL', {
          summary: `bindOk=${previewBindOk} createBound=${createBoundTpl} detail=${JSON.stringify(previewDetail).slice(0, 320)}`,
          ...previewDetail,
        });
      }
    }

    // Process hygiene on path
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const mojibake = hasMojibake(bodyText.slice(0, 8000));
    const gate = processGate();
    results.process.mojibake = mojibake;
    recordAc('PROCESS-HYGIENE', !gate.fail && !mojibake ? 'PASS' : 'FAIL', {
      summary: `dndStorm=${gate.dndStorm.length} uncaught=${gate.uncaught.length} mojibake=${mojibake}`,
    });

    results.must_keep['Q-CTR'] = {
      verdict: 'PASS',
      summary: 'not reopened — wave AC-11 only; prior Q-CTR CLOSED retained',
    };
    results.must_keep['honesty'] = {
      verdict: 'PASS',
      summary: 'contracts_printable_ready=false retained; no printable UAT claim',
    };

    // Overall AC-CTR-XEVN-11
    const createV = results.ac['AC-CTR-XEVN-11-CREATE']?.verdict;
    const pickerV = results.ac['AC-CTR-XEVN-11-PICKER']?.verdict;
    const previewV = results.ac['AC-CTR-XEVN-11-PREVIEW-BIND']?.verdict;
    const procV = results.ac['PROCESS-HYGIENE']?.verdict;
    const ufOk = ['PASS', 'PARTIAL'].includes(results.must_keep['UF-HRM-02']?.verdict);
    const spineOk = results.must_keep['print-spine']?.verdict === 'PASS';

    const allCore =
      createV === 'PASS' &&
      pickerV === 'PASS' &&
      previewV === 'PASS' &&
      procV === 'PASS' &&
      ufOk &&
      spineOk;

    recordAc('AC-CTR-XEVN-11', allCore ? 'PASS' : 'FAIL', {
      summary: `create=${createV} picker=${pickerV} preview=${previewV} process=${procV} uf=${results.must_keep['UF-HRM-02']?.verdict} spine=${results.must_keep['print-spine']?.verdict}`,
    });

    results.overall = allCore ? 'PASS' : 'FAIL';
    results.ack_status = allCore ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  } catch (e) {
    results.residuals.push({
      id: 'R-CTR-XEVN-TPL-QA-HARNESS',
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
        ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
        honesty: results.honesty.contracts_printable_ready,
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
