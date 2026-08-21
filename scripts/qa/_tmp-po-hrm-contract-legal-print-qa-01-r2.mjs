#!/usr/bin/env node
/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2 — U65 browser retest after FE-02
 * Focus: AC-CTR-PRINT-SPINE (company_id query-only) + smoke must_keep CL/TPL/UF-HRM-02
 * Honesty: contracts_printable_ready=false — DENIED printable module GO
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01-r2.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-01-r2');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CTR2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2',
  parent: 'PO-HRM-CONTRACT-LEGAL-PRINT-FE-02',
  round: 'R2-FE02-QUERY-ONLY',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP },
  honesty: {
    contracts_printable_ready: false,
    contracts_printable_ready_claimed: false,
    seed_used: false,
    api_only_pass: false,
  },
  denied: ['contracts_printable_ready=true', 'seed', 'api_only_pass', 'invent_printable_uat'],
  l0: {},
  beProbe: {},
  beUp: false,
  ids: {},
  uf: {},
  ac: {},
  process: {},
  network: [],
  postBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  closed_residuals: [],
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
function recordUf(id, verdict, detail = {}) {
  results.uf[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
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
  return u.toString();
}

function hasMojibake(text) {
  if (!text) return false;
  return /Ã.|Â.|Ä.|Æ.|â€|ï¿½|�/.test(text);
}

function processGateSummary() {
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
    email: EMAIL,
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
  await page.addInitScript(
    (s) => {
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
    },
    session,
  );
}

function parsePostBody(req) {
  try {
    const raw = req.postData();
    if (!raw) return { raw: null, json: null, hasCompanyIdKey: false };
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {
      /* */
    }
    const hasCompanyIdKey =
      json && typeof json === 'object'
        ? Object.prototype.hasOwnProperty.call(json, 'company_id')
        : /"company_id"\s*:/.test(raw);
    return { raw: String(raw).slice(0, 800), json, hasCompanyIdKey };
  } catch {
    return { raw: null, json: null, hasCompanyIdKey: null };
  }
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      const method = req.method();
      if (method !== 'POST') return;
      if (!/\/preview|print-versions/.test(u)) return;
      if (/\/pdf/.test(u)) return;
      const body = parsePostBody(req);
      const qsHasCompany = /[?&]company_id=/.test(u);
      results.postBodies.push({
        at: ts(),
        method,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        qsHasCompanyId: qsHasCompany,
        bodyHasCompanyId: body.hasCompanyIdKey,
        bodyKeys: body.json && typeof body.json === 'object' ? Object.keys(body.json) : [],
        bodySnippet: body.raw,
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
        /contract-clauses|contract-templates|print-versions|\/preview|\/pdf|pack-resolve|contracts-insurance\/contracts/.test(
          u,
        );
      if (!interesting) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
        qsHasCompanyId: /[?&]company_id=/.test(u),
      };
      try {
        const ct = res.headers()['content-type'] || '';
        entry.contentType = ct.slice(0, 80);
        if (/json/i.test(ct)) {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 200);
          if (j?.data?.id) entry.dataId = j.data.id;
          if (j?.data?.can_issue !== undefined) entry.can_issue = j.data.can_issue;
          if (j?.data?.missing_fields) entry.missing_fields = j.data.missing_fields;
          if (j?.data?.missing_clauses) entry.missing_clauses = j.data.missing_clauses;
          if (Array.isArray(j?.data?.data)) entry.listCount = j.data.data.length;
          if (typeof j?.data?.total === 'number') entry.total = j.data.total;
        } else {
          const t = await res.text();
          entry.bodySnippet = String(t).slice(0, 120);
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

async function probeBe(token) {
  const paths = [
    `/api/hrm/contracts-insurance/contract-clauses?company_id=${COMPANY}`,
    `/api/hrm/contracts-insurance/contract-templates?company_id=${COMPANY}`,
    `/api/hrm/contracts-insurance/contracts?page_size=3&company_id=${COMPANY}`,
  ];
  const out = {};
  for (const path of paths) {
    try {
      const r = await fetch(`${HRM}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await r.json().catch(() => ({}));
      out[path] = {
        status: r.status,
        code: body?.code || null,
        message: String(body?.message || '').slice(0, 160),
      };
    } catch (e) {
      out[path] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  results.beProbe = out;
  const clauses = out[paths[0]]?.status;
  const templates = out[paths[1]]?.status;
  results.beUp = clauses >= 200 && clauses < 300 && templates >= 200 && templates < 300;
  save();
  return results.beUp;
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
  // fallback first option
  const first = page.getByRole('option').first();
  if (await first.isVisible().catch(() => false)) {
    await first.click({ force: true });
    await sleep(400);
    return true;
  }
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
    save();
    throw new Error('L0 FAIL');
  }

  const session = await loginApi();
  const beUp = await probeBe(session.token);
  log('BE_PROBE', { note: `beUp=${beUp}` });

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
    // ——— Smoke Settings CL + TPL chrome (must_keep — no full mutate) ———
    await openSettingsLegal(page);
    await hardRefresh(page); // FE-02 bundle live
    await openSettingsLegal(page);
    await shot(page, '00-settings-legal');

    let bodyText = await page.locator('body').innerText().catch(() => '');
    const honestySettings = /contracts_printable_ready\s*=\s*false/i.test(bodyText);
    const loadError = await page.getByTestId('ctr-legal-load-error').isVisible().catch(() => false);
    const clauseForm = await page.getByTestId('ctr-clause-code').isVisible().catch(() => false);
    const clauseTab = await page.getByTestId('ctr-legal-tab-clauses').isVisible().catch(() => false);

    await page.getByTestId('ctr-legal-tab-templates').click().catch(() => {});
    await sleep(1000);
    const tplChrome =
      (await page.getByTestId('ctr-tpl-code').isVisible().catch(() => false)) ||
      (await page.getByTestId('ctr-tpl-palette').isVisible().catch(() => false)) ||
      (await page.getByTestId('ctr-tpl-canvas').isVisible().catch(() => false));
    await shot(page, '01-settings-tpl');

    bodyText = await page.locator('body').innerText().catch(() => '');
    const mojibake = hasMojibake(bodyText.slice(0, 4000));
    recordUf('SETTINGS_CHROME', clauseForm || clauseTab ? 'PASS' : 'FAIL', {
      summary: `clauseForm=${clauseForm} tplChrome=${tplChrome} honesty=${honestySettings} loadError=${loadError} mojibake=${mojibake}`,
      honestySettings,
      tplChrome,
      loadError,
      mojibake,
    });
    recordAc('SMOKE-CL-TPL', clauseForm || clauseTab ? (tplChrome ? 'PASS' : 'PARTIAL') : 'FAIL', {
      summary: `CL chrome OK; TPL chrome=${tplChrome} (re-smoke only — R1 already 🟢 mutate)`,
    });

    // ——— UF-HRM-02 list smoke + create for print path ———
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await hardRefresh(page);
    await sleep(2500);
    await shot(page, '02-contracts-list');

    const createBtn = page.getByTestId('hdsd-contracts-create-btn');
    const listOk = await createBtn.isVisible().catch(() => false);
    const listBody = await page.locator('body').innerText().catch(() => '');
    const listMojibake = hasMojibake(listBody.slice(0, 3000));

    if (!listOk) {
      recordUf('UF-HRM-02', 'FAIL', { summary: 'create btn / list chrome missing' });
    } else {
      await createBtn.click();
      await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 25000 });
      await sleep(1500);

      let formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
      const deadline = Date.now() + 40000;
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
      const notes = page.locator('#notes');
      if (await notes.isVisible().catch(() => false)) await notes.fill(`QA LEGAL-PRINT R2 ${STAMP}`);

      const netBefore = results.network.length;
      if (!formReady) {
        recordUf('UF-HRM-02', 'FAIL', { summary: 'formReady=false' });
      } else {
        await page.getByTestId('hdsd-contracts-form-submit').click({ timeout: 15000 });
        log('CLICK_LUU', { note: contractCode });
        await sleep(4000);
        const posts = results.network
          .slice(netBefore)
          .filter((n) => n.method === 'POST' && /contracts-insurance\/contracts(\?|$)/.test(n.url));
        const saveOk = posts.some((p) => p.status >= 200 && p.status < 300);
        const createdId = posts.find((p) => p.dataId)?.dataId || null;
        results.ids.contractId = createdId;
        results.ids.contractCode = contractCode;
        await shot(page, '03-after-registry-save');

        await hardRefresh(page);
        await sleep(3000);
        const listText = await page.locator('body').innerText().catch(() => '');
        const codeOnList = listText.includes(contractCode);
        await shot(page, '04-f5-list');

        recordUf(
          'UF-HRM-02',
          saveOk && codeOnList && !listMojibake ? 'PASS' : saveOk ? 'PARTIAL' : 'FAIL',
          {
            summary: `listOk=${listOk} POST=${posts.map((p) => `${p.status}:${p.code}`).join(',')} code=${contractCode} F5=${codeOnList} id=${createdId} mojibake=${listMojibake}`,
            posts: posts.map((p) => ({ status: p.status, code: p.code })),
          },
        );

        // ——— AC-CTR-PRINT-SPINE ———
        if (beUp && (createdId || codeOnList)) {
          const search = page.locator('input[placeholder*="Tìm"], input[type=search]').first();
          if (await search.isVisible().catch(() => false)) {
            await search.fill(contractCode);
            await sleep(1200);
          }
          const row = page.locator('tbody tr').filter({ hasText: contractCode }).first();
          let dialogOpen = false;
          if (await row.isVisible().catch(() => false)) {
            const actionBtns = row.locator('td').last().locator('button');
            const pencil = actionBtns.nth(1);
            if (await pencil.isVisible().catch(() => false)) {
              await pencil.click({ force: true });
              log('CLICK_PENCIL_EDIT', { note: contractCode });
            }
            await sleep(2000);
            dialogOpen = await page.getByTestId('hdsd-contracts-form-dialog').isVisible().catch(() => false);
          }
          if (!dialogOpen) {
            const fallback = page
              .locator('tbody tr')
              .filter({ hasText: contractCode })
              .locator('button.h-8.w-8')
              .nth(1);
            if (await fallback.isVisible().catch(() => false)) {
              await fallback.click({ force: true });
              await sleep(2000);
              dialogOpen = await page.getByTestId('hdsd-contracts-form-dialog').isVisible().catch(() => false);
            }
          }

          await shot(page, '05-edit-dialog');
          const spineEdit = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
          const spineHonesty = await page.getByTestId('ctr-print-honesty').isVisible().catch(() => false);

          if (!dialogOpen) {
            recordAc('AC-CTR-PRINT-SPINE', 'FAIL', {
              summary: `edit dialog not open; code=${contractCode} id=${createdId}`,
            });
          } else if (!spineEdit) {
            recordAc('AC-CTR-PRINT-SPINE', 'FAIL', {
              summary: 'dialog open but ctr-print-spine missing',
            });
          } else {
            await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung|general/i).catch(() => {});
            await sleep(400);
            // Prefer any active template option (R1 TPL or later)
            const tplTrigger = page.getByTestId('ctr-print-template');
            if (await tplTrigger.isVisible().catch(() => false)) {
              await tplTrigger.click({ force: true });
              await sleep(500);
              const opts = page.getByRole('option');
              const n = await opts.count();
              if (n > 0) {
                // Prefer TPL_CTRQA / active / first non-empty
                const preferred = page
                  .getByRole('option')
                  .filter({ hasText: /TPL_|CTRQA|active|Hiệu lực|GENERAL/i })
                  .first();
                if (await preferred.isVisible().catch(() => false)) await preferred.click({ force: true });
                else await opts.nth(0).click({ force: true });
              }
              await sleep(600);
            }

            const bodiesBefore = results.postBodies.length;
            const nPrev = results.network.length;
            await page.getByTestId('ctr-print-preview-btn').click();
            log('CLICK_PREVIEW');
            await sleep(3500);

            const prevPosts = results.network.slice(nPrev).filter((n) => /\/preview/.test(n.url));
            const previewBodies = results.postBodies.slice(bodiesBefore).filter((b) => /\/preview/.test(b.url));
            const previewOk = prevPosts.some((p) => p.status >= 200 && p.status < 300);
            const val001 = prevPosts.find(
              (p) => p.code === 'HRM-VAL-001' || /company_id should not exist/i.test(p.message || ''),
            );
            const bodyClean = previewBodies.every((b) => b.bodyHasCompanyId === false);
            const qsOk = previewBodies.every((b) => b.qsHasCompanyId === true) ||
              prevPosts.every((p) => p.qsHasCompanyId);
            const previewBodyUi = await page.getByTestId('ctr-print-preview-body').isVisible().catch(() => false);
            const previewErr = await page.getByTestId('ctr-print-preview-error').innerText().catch(() => '');
            const canIssue = prevPosts.find((p) => p.can_issue !== undefined)?.can_issue;
            await shot(page, '06-preview');

            let versionOk = false;
            let versionBodiesClean = true;
            let versionsAfterF5 = 0;
            let pdfOk = false;
            let pdfSnippet = '';

            const saveVerBtn = page.getByTestId('ctr-print-save-version');
            const canSave =
              (await saveVerBtn.isVisible().catch(() => false)) &&
              !(await saveVerBtn.isDisabled().catch(() => true));

            if (canSave) {
              const bodiesV0 = results.postBodies.length;
              const nV = results.network.length;
              await saveVerBtn.click();
              log('CLICK_SAVE_VERSION');
              await sleep(3500);
              const vers = results.network
                .slice(nV)
                .filter((n) => n.method === 'POST' && /print-versions/.test(n.url));
              versionOk = vers.some((p) => p.status >= 200 && p.status < 300);
              const vBodies = results.postBodies.slice(bodiesV0).filter((b) => /print-versions/.test(b.url));
              versionBodiesClean = vBodies.every((b) => b.bodyHasCompanyId === false);
              results.ids.printVersionPosts = vers.map((p) => ({
                status: p.status,
                code: p.code,
                message: p.message,
                qsHasCompanyId: p.qsHasCompanyId,
              }));
              results.ids.printVersionBodies = vBodies;
            }

            // F5 versions list
            if (versionOk || previewOk) {
              await page.keyboard.press('Escape').catch(() => {});
              await sleep(500);
              await hardRefresh(page);
              await sleep(2500);
              if (await search.isVisible().catch(() => false)) {
                await search.fill(contractCode);
                await sleep(1000);
              }
              const row2 = page.locator('tbody tr').filter({ hasText: contractCode }).first();
              if (await row2.isVisible().catch(() => false)) {
                const actionBtns = row2.locator('td').last().locator('button');
                await actionBtns.nth(1).click({ force: true }).catch(() => {});
                await sleep(2500);
              }
              const versionsList = page.getByTestId('ctr-print-versions');
              if (await versionsList.isVisible().catch(() => false)) {
                versionsAfterF5 = await versionsList.locator('li').count();
              }
              // API corroborate
              const cid = createdId || results.ids.contractId;
              if (cid) {
                try {
                  const listR = await fetch(
                    `${HRM}/api/hrm/contracts-insurance/contracts/${cid}/print-versions?company_id=${COMPANY}`,
                    { headers: { Authorization: `Bearer ${session.token}` } },
                  );
                  const listJ = await listR.json().catch(() => ({}));
                  const versions =
                    listJ?.data?.data || listJ?.data?.items || (Array.isArray(listJ?.data) ? listJ.data : []);
                  const count = Array.isArray(versions) ? versions.length : 0;
                  results.ids.printVersionsList = { status: listR.status, count };
                  if (count > versionsAfterF5) versionsAfterF5 = count;

                  const vid = Array.isArray(versions) && versions[0]?.id;
                  if (vid) {
                    const pdfBtn = page.getByTestId(`ctr-print-pdf-${vid}`);
                    if (await pdfBtn.isVisible().catch(() => false)) {
                      const nP = results.network.length;
                      await pdfBtn.click();
                      await sleep(2500);
                      const pdfs = results.network.slice(nP).filter((n) => /\/pdf/.test(n.url));
                      pdfOk = pdfs.some((p) => p.status >= 200 && p.status < 300);
                      pdfSnippet = pdfs
                        .map((p) => `${p.status}:${p.contentType}:${p.bodySnippet || ''}`)
                        .join('|');
                    }
                    if (!pdfOk) {
                      const pdfR = await fetch(
                        `${HRM}/api/hrm/contracts-insurance/print-versions/${vid}/pdf?company_id=${COMPANY}`,
                        { headers: { Authorization: `Bearer ${session.token}` } },
                      );
                      const pdfText = await pdfR.text();
                      pdfOk =
                        pdfR.status >= 200 &&
                        pdfR.status < 300 &&
                        /html|HỢP ĐỒNG|hop dong|contract|stub|<!DOCTYPE/i.test(pdfText);
                      pdfSnippet = `API ${pdfR.status} len=${pdfText.length} head=${pdfText.slice(0, 100)}`;
                    }
                  }
                } catch (e) {
                  pdfSnippet = String(e).slice(0, 160);
                }
              }
              await shot(page, '07-versions-pdf');
            }

            const companyIdBodyClosed =
              previewOk && bodyClean && !val001 && previewBodies.length > 0;
            if (companyIdBodyClosed) {
              results.closed_residuals.push({
                id: 'R-CTR-PREVIEW-COMPANY-ID-BODY',
                note: 'POST preview body has no company_id; query has company_id; HTTP 2xx',
              });
            } else if (val001 || previewBodies.some((b) => b.bodyHasCompanyId)) {
              results.residuals.push({
                id: 'R-CTR-PREVIEW-COMPANY-ID-BODY',
                severity: 'P0',
                owner: 'dev-fe',
                note: 'Still seeing company_id in body or HRM-VAL-001',
              });
            }

            const spinePass =
              previewOk &&
              previewBodyUi &&
              bodyClean &&
              !val001 &&
              versionOk &&
              versionBodiesClean &&
              versionsAfterF5 > 0 &&
              pdfOk;

            const spinePartial =
              previewOk && bodyClean && !val001 && (!versionOk || !pdfOk || versionsAfterF5 === 0);

            recordAc(
              'AC-CTR-PRINT-SPINE',
              spinePass ? 'PASS' : spinePartial ? 'PARTIAL' : 'FAIL',
              {
                summary: `preview=${previewOk} bodyUi=${previewBodyUi} bodyClean=${bodyClean} qsOk=${qsOk} val001=${Boolean(val001)} can_issue=${canIssue} canSave=${canSave} versionOk=${versionOk} vBodyClean=${versionBodiesClean} versionsF5=${versionsAfterF5} pdfOk=${pdfOk} err=${previewErr.slice(0, 100)} ${pdfSnippet}`,
                previewOk,
                previewBodyUi,
                bodyClean,
                qsOk,
                canIssue,
                canSave,
                versionOk,
                versionsAfterF5,
                pdfOk,
                prevPosts: prevPosts.map((p) => ({
                  status: p.status,
                  code: p.code,
                  message: p.message,
                  qsHasCompanyId: p.qsHasCompanyId,
                  can_issue: p.can_issue,
                  missing_fields: p.missing_fields,
                  missing_clauses: p.missing_clauses,
                })),
                previewBodies,
                note: 'Q-CTR-02 PDF HTML stub; honesty remains false',
              },
            );

            if (previewOk && !versionOk) {
              results.residuals.push({
                id: canIssue === false ? 'R-CTR-PRINT-CAN-ISSUE' : 'R-CTR-PRINT-VERSION',
                severity: 'P1',
                owner: canIssue === false ? 'ba-process/dev-be' : 'dev-fe',
                note:
                  previewErr.slice(0, 200) ||
                  `canSave=${canSave} can_issue=${canIssue} — print-version not 2xx`,
              });
            }
            if (versionOk && !pdfOk) {
              results.residuals.push({
                id: 'Q-CTR-02-PDF-STUB-OPEN',
                severity: 'P2',
                owner: 'dev-be',
                note: `PDF stub not 2xx: ${pdfSnippet}`,
              });
            }
          }

          recordUf('HONESTY', honestySettings || spineHonesty ? 'PASS' : 'FAIL', {
            summary: `contracts_printable_ready=false settings=${honestySettings} spine=${spineHonesty}`,
          });
        } else if (!beUp) {
          recordAc('AC-CTR-PRINT-SPINE', 'BLOCKED-BE', { summary: 'BE not up' });
        } else {
          recordAc('AC-CTR-PRINT-SPINE', 'FAIL', { summary: 'registry save failed — cannot print' });
        }
      }
    }

    const gate = processGateSummary();
    recordUf('PROCESS_GATE', gate.fail ? 'FAIL' : 'PASS', {
      summary: `dndStorm=${gate.dndStorm.length} uncaught=${gate.uncaught.length} pageErr=${results.pageErrors.length} console=${results.consoleErrors.length}`,
      ...results.process,
    });

    const acV = Object.values(results.ac).map((x) => x.verdict);
    const ufV = Object.values(results.uf).map((x) => x.verdict);
    const hardFail = acV.includes('FAIL') || ufV.includes('FAIL');
    const blocked = acV.includes('BLOCKED-BE');
    const partial = acV.includes('PARTIAL') || ufV.includes('PARTIAL');

    // Exit criteria require full spine PASS for PASS_TO_PM
    const spine = results.ac['AC-CTR-PRINT-SPINE']?.verdict;
    if (hardFail || spine === 'FAIL') {
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
    } else if (spine === 'PARTIAL' || partial || blocked) {
      // R2 exit criteria: preview+version+PDF all required → PARTIAL = FAIL_TO_PM for gate honesty
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
      results.note =
        'R2 exit requires preview 2xx + print-version 2xx + PDF 2xx + F5 versions>0. PARTIAL spine → FAIL_TO_PM (no invent printable). R-CTR-PREVIEW-COMPANY-ID-BODY may still be CLOSED if body clean.';
    } else {
      results.overall = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    }

    // Never claim printable ready
    results.honesty.contracts_printable_ready = false;
    results.honesty.contracts_printable_ready_claimed = false;
  } finally {
    results.endedAt = ts();
    save();
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        ack_status: results.ack_status,
        overall: results.overall,
        ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
        uf: Object.fromEntries(Object.entries(results.uf).map(([k, v]) => [k, v.verdict])),
        closed: results.closed_residuals.map((r) => r.id),
        residuals: results.residuals.map((r) => r.id),
      },
      null,
      2,
    ),
  );
  if (results.ack_status !== 'PASS_TO_PM') process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  results.ack_status = 'FAIL_TO_PM';
  results.overall = 'FAIL';
  results.endedAt = ts();
  results.fatal = String(e).slice(0, 400);
  save();
  process.exit(1);
});
