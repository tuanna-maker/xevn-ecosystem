#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02 — Browser AC-PLT-CTR-05 (UF)
 * Supersedes QA-01 L1-only note for this AC.
 * U65 zero-seed · browser-only · honesty contracts_printable_ready=false
 * Persona: ceo@xe.vn · company_id=main
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-qa-02.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-qa-02');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `PLTQA2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TOKEN_KEY = `custom.emp.qa_plt_${STAMP.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
const LABEL_VI = `Nhãn QA Token Merge ${STAMP}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02',
  startedAt: ts(),
  u65: 'zero-seed · browser-only · UF claim allowed when FE after 2xx + F5',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP, TOKEN_KEY, LABEL_VI },
  supersedes: {
    prior: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01',
    note: 'QA-01 L1-only SKIP for AC-PLT-CTR-05 is superseded by this browser UF',
  },
  honesty: {
    contracts_printable_ready: false,
    contracts_printable_ready_claimed: false,
    seed_used: false,
    phase1_done_claimed: false,
  },
  denied: [
    'contracts_printable_ready=true',
    'seed',
    'Phase1 DONE',
    'UF from probe-only',
  ],
  l0: {},
  ids: { tokenKey: TOKEN_KEY, labelVi: LABEL_VI },
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
    samplePageErrors: results.pageErrors.slice(0, 5),
    sampleConsole: results.consoleErrors.slice(0, 10),
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
      if (!/\/api\/hrm\/merge-tokens/.test(u)) return;
      const method = req.method();
      if (!['POST', 'PUT', 'PATCH'].includes(method)) return;
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
                tokenKey: body.tokenKey,
                labelVi: body.labelVi,
                companyId: body.companyId,
                origin: body.origin,
                domain: body.domain,
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
      if (!/\/api\/hrm\/merge-tokens/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
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
          if (j?.data?.tokenKey) entry.tokenKey = j.data.tokenKey;
          if (j?.data?.labelVi) entry.labelVi = j.data.labelVi;
          if (Array.isArray(j?.data?.items)) entry.itemCount = j.data.items.length;
          if (Array.isArray(j?.data?.tokens)) {
            entry.tokenCount = j.data.tokens.length;
            entry.registryHits = j.data.tokens.filter((t) => t?.source === 'registry').length;
          }
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

async function openSettingsMergeTokens(page) {
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
  const panel = page.getByTestId('settings-merge-tokens');
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(800);
  return panel;
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[k] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      results.l0[k] = { ok: false, error: String(e).slice(0, 120) };
    }
  }
  save();
  if (!results.l0.portal?.ok || !results.l0.hrm?.ok) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'L0', owner: 'devops', note: 'stack down' });
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }

  const session = await loginApi();
  log('login_api_ok');

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // --- Navigate Settings → Điều khoản HĐ → Token merge ---
    const panel = await openSettingsMergeTokens(page);
    const panelVisible = await panel.isVisible().catch(() => false);
    await shot(page, '01-settings-merge-tokens');
    log('open_settings_merge_tokens', { visible: panelVisible });

    if (!panelVisible) {
      recordAc('AC-PLT-CTR-05', 'FAIL', {
        summary: 'settings-merge-tokens panel not visible after Settings → Điều khoản HĐ',
        url: page.url(),
      });
      results.residuals.push({
        id: 'AC-PLT-CTR-05-UI',
        owner: 'dev-fe',
        note: 'MergeToken Settings panel missing',
      });
      throw new Error('panel missing');
    }

    // DYNAMIC-LOCK: confirm custom #9-style key accepted by FE format (not closed enum)
    const keyInput = page.getByTestId('hdsd-merge-token-key');
    const labelInput = page.getByTestId('hdsd-merge-token-label');
    const sourceInput = page.getByTestId('hdsd-merge-token-source');
    await keyInput.fill(TOKEN_KEY);
    await labelInput.fill(LABEL_VI);
    await sourceInput.fill(TOKEN_KEY);
    await shot(page, '02-form-filled');
    log('form_filled', { tokenKey: TOKEN_KEY, labelVi: LABEL_VI });

    // Upsert → Network PUT/POST 2xx
    const saveBtn = page.getByTestId('hdsd-merge-token-save');
    const upsertWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/merge-tokens\/?(\?|$)/.test(res.url()) &&
        ['PUT', 'POST'].includes(res.request().method()) &&
        !/resolve-preview|retire/.test(res.url()),
      { timeout: 45000 },
    );
    await saveBtn.click();
    const upsertRes = await upsertWait.catch(() => null);
    await sleep(1500);
    await shot(page, '03-after-upsert');

    const upsertStatus = upsertRes?.status?.() ?? null;
    const upsertOk = upsertStatus != null && upsertStatus >= 200 && upsertStatus < 300;
    let upsertBody = null;
    try {
      upsertBody = upsertRes ? await upsertRes.json() : null;
    } catch {
      /* */
    }
    log('upsert_response', {
      status: upsertStatus,
      code: upsertBody?.code,
      note: upsertBody?.message || '',
    });

    if (!upsertOk) {
      recordAc('AC-PLT-CTR-05', 'FAIL', {
        summary: `Upsert not 2xx — HTTP ${upsertStatus} code=${upsertBody?.code || 'n/a'}`,
        status: upsertStatus,
        code: upsertBody?.code || null,
        message: String(upsertBody?.message || '').slice(0, 200),
      });
      results.residuals.push({
        id: 'AC-PLT-CTR-05-UPSERT',
        owner: 'dev-be',
        note: `PUT/POST merge-tokens HTTP ${upsertStatus}`,
      });
    }

    // FE after 2xx: row should appear (loadTokens after save)
    const rowSel = page.getByTestId(`settings-merge-token-row-${TOKEN_KEY}`);
    let rowVisibleAfterSave = await rowSel.isVisible().catch(() => false);
    let rowTextAfterSave = rowVisibleAfterSave
      ? ((await rowSel.innerText().catch(() => '')) || '').trim()
      : '';
    log('fe_after_2xx', { rowVisible: rowVisibleAfterSave, text: rowTextAfterSave.slice(0, 200) });

    // Tải lại / F5 list
    const reloadBtn = page.getByTestId('hdsd-merge-token-reload');
    if (await reloadBtn.isVisible().catch(() => false)) {
      const listWait = page.waitForResponse(
        (res) =>
          res.request().method() === 'GET' &&
          /\/api\/hrm\/merge-tokens/.test(res.url()) &&
          !/resolve-preview/.test(res.url()),
        { timeout: 30000 },
      );
      await reloadBtn.click();
      await listWait.catch(() => null);
      await sleep(1000);
    }

    // Hard F5 page
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const tabBtn = page.getByTestId('settings-tab-contract-legal');
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click();
      await sleep(1000);
    }
    await page.getByTestId('settings-merge-tokens').scrollIntoViewIfNeeded().catch(() => {});
    await sleep(800);
    await shot(page, '04-after-f5');

    const rowAfterF5 = page.getByTestId(`settings-merge-token-row-${TOKEN_KEY}`);
    const rowVisibleF5 = await rowAfterF5.isVisible().catch(() => false);
    const rowTextF5 = rowVisibleF5
      ? ((await rowAfterF5.innerText().catch(() => '')) || '').trim()
      : '';
    const hasLabel = rowTextF5.includes(LABEL_VI);
    const hasTokenBrace = rowTextF5.includes(`{{${TOKEN_KEY}}}`) || rowTextF5.includes(TOKEN_KEY);
    const notRawOnly = hasLabel && hasTokenBrace;
    log('fe_after_f5', {
      rowVisible: rowVisibleF5,
      hasLabel,
      hasTokenBrace,
      text: rowTextF5.slice(0, 240),
    });

    const acPass =
      upsertOk &&
      rowVisibleAfterSave &&
      rowVisibleF5 &&
      hasLabel &&
      notRawOnly;

    recordAc('AC-PLT-CTR-05', acPass ? 'PASS' : 'FAIL', {
      summary: acPass
        ? `Register/upsert ${TOKEN_KEY} → PUT/POST ${upsertStatus} → FE row + F5 with labelVi «${LABEL_VI}» (not raw-key-only)`
        : `FAIL upsertOk=${upsertOk} feAfter2xx=${rowVisibleAfterSave} f5=${rowVisibleF5} hasLabel=${hasLabel} notRawOnly=${notRawOnly}`,
      upsertStatus,
      upsertCode: upsertBody?.code || null,
      feAfter2xx: { visible: rowVisibleAfterSave, text: rowTextAfterSave.slice(0, 200) },
      feAfterF5: { visible: rowVisibleF5, hasLabel, hasTokenBrace, text: rowTextF5.slice(0, 240) },
      click_path:
        'login → /hr/settings?tab=contract-legal → settings-tab-contract-legal → settings-merge-tokens → fill key+label → hdsd-merge-token-save → reload/F5 → row',
      url: page.url(),
    });

    if (!acPass && !results.residuals.some((r) => r.id.startsWith('AC-PLT-CTR-05'))) {
      results.residuals.push({
        id: 'AC-PLT-CTR-05',
        owner: !upsertOk ? 'dev-be' : 'dev-fe',
        note: 'browser UF incomplete',
      });
    }

    // Optional: resolve preview → registry source
    try {
      const resolveBtn = page.getByTestId('hdsd-merge-token-resolve-preview');
      if (await resolveBtn.isVisible().catch(() => false)) {
        const resolveWait = page.waitForResponse(
          (res) =>
            /\/api\/hrm\/merge-tokens\/resolve-preview/.test(res.url()) &&
            res.request().method() === 'POST',
          { timeout: 30000 },
        );
        await resolveBtn.click();
        const resolveRes = await resolveWait.catch(() => null);
        await sleep(800);
        await shot(page, '05-resolve-preview');
        let resolveJson = null;
        try {
          resolveJson = resolveRes ? await resolveRes.json() : null;
        } catch {
          /* */
        }
        const tokens = resolveJson?.data?.tokens || [];
        const hit = tokens.find((t) => t?.tokenKey === TOKEN_KEY);
        const sourceRegistry = hit?.source === 'registry';
        const previewUi = page.getByTestId('settings-merge-tokens-preview');
        const previewText = (await previewUi.innerText().catch(() => '')) || '';
        const badgeRegistry =
          /Registry MergeToken/i.test(previewText) || sourceRegistry;
        recordOpt('RESOLVE_REGISTRY', sourceRegistry || badgeRegistry ? 'PASS' : 'FAIL', {
          summary: sourceRegistry
            ? `resolve-preview source=registry for ${TOKEN_KEY}`
            : `resolve hit=${JSON.stringify(hit || null).slice(0, 200)} badge=${badgeRegistry}`,
          status: resolveRes?.status?.() ?? null,
          source: hit?.source || null,
          previewSnippet: previewText.slice(0, 300),
        });
      } else {
        recordOpt('RESOLVE_REGISTRY', 'SKIP', { summary: 'resolve button not visible' });
      }
    } catch (e) {
      recordOpt('RESOLVE_REGISTRY', 'FAIL', { summary: String(e).slice(0, 200) });
    }

    // DYNAMIC-LOCK: custom key accepted (already upserted) + format-invalid toast path
    recordOpt('DYNAMIC-LOCK_OPEN_KEY', upsertOk ? 'PASS' : 'FAIL', {
      summary: upsertOk
        ? `Custom #9+-style key «${TOKEN_KEY}» accepted (not closed-enum reject)`
        : `Custom key rejected HTTP ${upsertStatus} code=${upsertBody?.code}`,
      tokenKey: TOKEN_KEY,
    });

    // Soft-delete must_keep smoke (retire this QA token — cleanup, not seed)
    try {
      const retireBtn = page.getByTestId(`hdsd-merge-token-retire-${TOKEN_KEY}`);
      if (await retireBtn.isVisible().catch(() => false)) {
        page.once('dialog', async (d) => {
          await d.accept().catch(() => {});
        });
        const retireWait = page.waitForResponse(
          (res) =>
            /\/api\/hrm\/merge-tokens\/.+\/retire/.test(res.url()) &&
            res.request().method() === 'POST',
          { timeout: 30000 },
        );
        await retireBtn.click();
        const retireRes = await retireWait.catch(() => null);
        await sleep(1200);
        await shot(page, '06-after-retire');
        const stillVisible = await page
          .getByTestId(`settings-merge-token-row-${TOKEN_KEY}`)
          .isVisible()
          .catch(() => false);
        const retireOk =
          retireRes &&
          retireRes.status() >= 200 &&
          retireRes.status() < 300 &&
          !stillVisible;
        results.must_keep.soft_delete = {
          verdict: retireOk ? 'PASS' : 'FAIL',
          status: retireRes?.status?.() ?? null,
          hiddenAfter: !stillVisible,
        };
        recordOpt('SOFT_DELETE_RETIRE', retireOk ? 'PASS' : 'FAIL', {
          summary: retireOk
            ? `Retire 2xx → row hidden from active list`
            : `retire status=${retireRes?.status?.()} stillVisible=${stillVisible}`,
        });
      } else {
        results.must_keep.soft_delete = { verdict: 'SKIP', note: 'retire btn not visible' };
      }
    } catch (e) {
      results.must_keep.soft_delete = { verdict: 'FAIL', note: String(e).slice(0, 160) };
    }

    // Optional Contracts Preview path — smoke navigate only (not invent printable)
    try {
      await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2000);
      await shot(page, '07-contracts-surface');
      const bodyText = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 400);
      recordOpt('CONTRACTS_SURFACE_SMOKE', /hợp đồng|contract/i.test(bodyText) ? 'PASS' : 'OBS', {
        summary:
          'Navigated Contracts surface after registry upsert — full PREV registry-consume left as OBS if no live print open in wave',
        url: page.url(),
        snippet: bodyText.slice(0, 200),
      });
    } catch (e) {
      recordOpt('CONTRACTS_SURFACE_SMOKE', 'SKIP', { summary: String(e).slice(0, 160) });
    }

    results.must_keep.uf_hrm_02 = { verdict: 'NOT_REOPENED', note: 'slice did not touch UF-HRM-02 path' };
    results.must_keep.print_spine = {
      verdict: 'NOT_REOPENED',
      note: 'no print-spine rewrite; PREV consume optional OBS',
    };
    results.must_keep.u65 = { verdict: 'PASS', seed_used: false };
    results.must_keep.dynamic_lock = results.optional.DYNAMIC_LOCK_OPEN_KEY || { verdict: 'n/a' };

    const pg = processGate();
    const ac = results.ac['AC-PLT-CTR-05']?.verdict;
    const pass = ac === 'PASS' && !pg.fail;

    results.overall = pass ? 'PASS' : 'FAIL';
    results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    results.honesty.contracts_printable_ready = false;
    save();

    console.log(
      JSON.stringify(
        {
          overall: results.overall,
          ack_status: results.ack_status,
          ac: results.ac,
          optional: results.optional,
          residuals: results.residuals,
          stamp: STAMP,
        },
        null,
        2,
      ),
    );

    await browser.close();
    process.exit(pass ? 0 : 1);
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    results.residuals.push({ id: 'HARNESS', owner: 'qa', note: String(e).slice(0, 300) });
    processGate();
    save();
    console.error('HARNESS FAIL', e);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main();
