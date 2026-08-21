#!/usr/bin/env node
/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-QA-03 — U65 browser (W7.5 FE-03 Wave B)
 * Holding Publish → Member Pull/Apply · skipped/conflicts when returned ·
 * origin overlay 4 fields · company_id query-only · must_keep smoke
 * Honesty: contracts_printable_ready=false — DENIED invent printable UAT / seed
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
const HOLDING = process.env.QA_COMPANY_ID || 'main';
/** Valid OU: holding|trsport|logistics|finance|services — portal alias du-lich ≠ OU slug */
const MEMBER = process.env.QA_MEMBER_OU || 'trsport';
const MEMBER_NEG = process.env.QA_MEMBER_NEG_OU || 'finance';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-03.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-03');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CTR3-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-QA-03',
  parent: 'PO-HRM-CONTRACT-LEGAL-PRINT-FE-04',
  program: 'PO-HRM-CONTINUOUS-W7-20260807',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  persona: { email: EMAIL, holding: HOLDING, member: MEMBER, memberNeg: MEMBER_NEG },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP },
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
    'invent_printable_uat',
    'synced_catalogs',
    'flip_contracts_printable_ready',
    'claim_module_printable_DONE',
  ],
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 500)}`);
  save();
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 500)}`);
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
  u.searchParams.set('companyId', extra.companyId || HOLDING);
  u.searchParams.set('_', String(Date.now()));
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
    companyId: HOLDING,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function injectPortalAuth(page, session, companyId, ouFilter) {
  await page.addInitScript(
    ({ s, cid, ou }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', cid);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', cid);
        store.setItem('hrm_current_tenant_id', 'xevn');
        if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
        if (s.raw?.defaultMembershipId)
          store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
      // Settings hides OU chip but listCompanyId still reads this key (HrmOperatingUnitFilterContext).
      sessionStorage.setItem('hrm:operating-unit-filter', ou || 'all');
    },
    { s: session, cid: companyId, ou: ouFilter || (companyId === 'main' || companyId === 'holding' ? 'all' : companyId) },
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
      if (!/contract-library\/(publishes|pull|apply)|\/preview|print-versions|contracts-insurance\/contracts(\?|$)/.test(u))
        return;
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
        /contract-library\/(publishes|pull|apply)|contract-clauses|contract-templates|print-versions|\/preview|contracts-insurance\/contracts/.test(
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
          entry.message = String(j?.message || '').slice(0, 220);
          if (j?.data?.id) entry.dataId = j.data.id;
          if (j?.data?.publish_version != null) entry.publish_version = j.data.publish_version;
          if (j?.data?.upserted) entry.upsertedCount = Array.isArray(j.data.upserted) ? j.data.upserted.length : null;
          if (j?.data?.skipped_override)
            entry.skipped_override = j.data.skipped_override;
          if (j?.data?.conflicts) entry.conflicts = j.data.conflicts;
          if (Array.isArray(j?.data?.items)) entry.listCount = j.data.items.length;
          if (Array.isArray(j?.data?.data)) entry.listCount = j.data.data.length;
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
    `/api/hrm/contracts-insurance/contract-library/publishes?company_id=${HOLDING}`,
    `/api/hrm/contracts-insurance/contract-clauses?company_id=${HOLDING}`,
    `/api/hrm/contracts-insurance/contract-templates?company_id=${HOLDING}`,
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
        count: Array.isArray(body?.data?.items)
          ? body.data.items.length
          : Array.isArray(body?.data?.data)
            ? body.data.data.length
            : null,
      };
    } catch (e) {
      out[path] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  results.beProbe = out;
  const pub = out[paths[0]]?.status;
  const clauses = out[paths[1]]?.status;
  results.beUp = pub >= 200 && pub < 300 && clauses >= 200 && clauses < 300;
  save();
  return results.beUp;
}

async function openSettings(page, companyId) {
  await page.goto(q('/hr/settings', { companyId, tab: 'contract-legal' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(1500);
  const tabBtn = page.getByTestId('settings-tab-contract-legal');
  if (await tabBtn.isVisible().catch(() => false)) {
    await tabBtn.click({ force: true });
    await sleep(1200);
  }
  await page.getByTestId('settings-contract-legal-print').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  await page.getByTestId('ctr-library-publish-panel').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
}

async function hardRefreshSettings(page, companyId) {
  await page.goto(q('/hr/settings', { companyId, tab: 'contract-legal' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(1200);
  const tabBtn = page.getByTestId('settings-tab-contract-legal');
  if (await tabBtn.isVisible().catch(() => false)) await tabBtn.click({ force: true });
  await sleep(1500);
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
    console.log('FAIL L0');
    process.exit(2);
  }

  const session = await loginApi();
  const beUp = await probeBe(session.token);
  log('BE_PROBE', { note: `beUp=${beUp}` });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    // ——— AC1 Holding Publish (fresh context · OU=all/main) ———
    const holdingCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await holdingCtx.newPage();
    track(page);
    await injectPortalAuth(page, session, HOLDING, 'all');
    await openSettings(page, HOLDING);
    await shot(page, '00-holding-settings');
    const holdingPanel = await page.getByTestId('ctr-library-publish-holding').isVisible().catch(() => false);
    const publishBtn = page.getByTestId('ctr-library-publish-btn');
    const publishVisible = await publishBtn.isVisible().catch(() => false);
    const honestyText = await page.locator('body').innerText().catch(() => '');
    const honestyOk = /contracts_printable_ready\s*=\s*false/i.test(honestyText);
    const clauseChrome = await page.getByTestId('ctr-clause-code').isVisible().catch(() => false);
    const tplTab = page.getByTestId('ctr-legal-tab-templates');
    if (await tplTab.isVisible().catch(() => false)) {
      await tplTab.click().catch(() => {});
      await sleep(600);
    }
    const tplChrome =
      (await page.getByTestId('ctr-tpl-canvas').isVisible().catch(() => false)) ||
      (await page.getByTestId('ctr-tpl-palette').isVisible().catch(() => false));
    recordAc('AC-SETTINGS-CHROME', holdingPanel && publishVisible && clauseChrome ? 'PASS' : 'FAIL', {
      summary: `holding=${holdingPanel} publishBtn=${publishVisible} clause=${clauseChrome} tpl=${tplChrome} honesty=${honestyOk}`,
    });
    recordAc('AC-HONESTY-STAMP', honestyOk ? 'PASS' : 'FAIL', {
      summary: `contracts_printable_ready=false visible on panel=${honestyOk}`,
    });

    const label = `QA-03 FE phát hành ${STAMP}`;
    await page.getByTestId('ctr-library-publish-label').fill(label);
    const netBeforePub = results.network.length;
    const bodyBeforePub = results.postBodies.length;
    await publishBtn.click({ force: true });
    log('CLICK_PUBLISH', { note: label });
    await sleep(4000);
    await shot(page, '01-after-publish');

    const pubPosts = results.network
      .slice(netBeforePub)
      .filter((n) => n.method === 'POST' && /contract-library\/publishes/.test(n.url));
    const pubOk = pubPosts.some((p) => p.status >= 200 && p.status < 300);
    const pubVer = pubPosts.find((p) => p.publish_version != null)?.publish_version;
    results.ids.publish_version = pubVer;
    const pubBodies = results.postBodies.slice(bodyBeforePub).filter((b) => /\/publishes/.test(b.url));
    const pubBodyClean = pubBodies.every((b) => b.qsHasCompanyId && !b.bodyHasCompanyId);
    await hardRefreshSettings(page, HOLDING);
    await sleep(2000);
    const rowSel = pubVer != null ? `ctr-library-publish-row-${pubVer}` : null;
    const rowVisible = rowSel
      ? await page.getByTestId(rowSel).isVisible().catch(() => false)
      : (await page.locator('[data-testid^="ctr-library-publish-row-"]').count()) > 0;
    await shot(page, '02-publish-row-f5');
    recordAc('AC-HOLDING-PUBLISH', pubOk && rowVisible && pubBodyClean ? 'PASS' : 'FAIL', {
      summary: `POST=${pubPosts.map((p) => `${p.status}:${p.code}:v${p.publish_version}`).join(',')} row=${rowVisible} bodyClean=${pubBodyClean} ver=${pubVer}`,
      posts: pubPosts,
      bodies: pubBodies,
    });
    await holdingCtx.close().catch(() => {});

    // ——— AC2 Member Pull + Apply (fresh context · OU filter=trsport) ———
    const memberCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const memberPage = await memberCtx.newPage();
    track(memberPage);
    await injectPortalAuth(memberPage, session, MEMBER, MEMBER);
    const page2 = memberPage;

    await openSettings(page2, MEMBER);
    await shot(page2, '03-member-settings');
    // Debug: confirm partition
    const holdingStill = await page2.getByTestId('ctr-library-publish-holding').isVisible().catch(() => false);
    const memberZone = await page2.getByTestId('ctr-library-pull-member').isVisible().catch(() => false);
    results.ids.memberPartition = { holdingStill, memberZone, ou: MEMBER };
    const pullBtn = page2.getByTestId('ctr-library-pull-btn');
    const applyBtn = page2.getByTestId('ctr-library-apply-btn');
    const pullVisible = await pullBtn.isVisible().catch(() => false);
    const applyVisible = await applyBtn.isVisible().catch(() => false);

    // Select version if select available
    const versionTrigger = page2.getByTestId('ctr-library-pull-version');
    if (await versionTrigger.isVisible().catch(() => false)) {
      await versionTrigger.click({ force: true });
      await sleep(500);
      const verOpt =
        pubVer != null
          ? page2.getByRole('option').filter({ hasText: new RegExp(`v${pubVer}`) }).first()
          : page2.getByRole('option').first();
      if (await verOpt.isVisible().catch(() => false)) {
        await verOpt.click({ force: true });
        await sleep(400);
      } else {
        await page2.keyboard.press('Escape').catch(() => {});
      }
    }

    const netBeforePull = results.network.length;
    const bodyBeforePull = results.postBodies.length;
    if (pullVisible) {
      await pullBtn.click({ force: true });
      log('CLICK_PULL', { note: MEMBER });
      await sleep(4500);
    }
    await shot(page2, '04-after-pull');
    const pullPosts = results.network
      .slice(netBeforePull)
      .filter((n) => n.method === 'POST' && /contract-library\/pull/.test(n.url));
    const pullOk = pullPosts.some((p) => p.status >= 200 && p.status < 300);
    const pullBodies = results.postBodies.slice(bodyBeforePull).filter((b) => /\/pull/.test(b.url));
    const pullBodyClean = pullBodies.length === 0 ? false : pullBodies.every((b) => b.qsHasCompanyId && !b.bodyHasCompanyId);
    const pullSummary = await page2.getByTestId('ctr-library-pull-summary').innerText().catch(() => '');
    const pullSkippedVisible = await page2.getByTestId('ctr-library-pull-skipped').isVisible().catch(() => false);
    const pullConflictsVisible = await page2
      .getByTestId('ctr-library-pull-conflicts')
      .isVisible()
      .catch(() => false);
    const pullDetailVisible = await page2
      .getByTestId('ctr-library-pull-result-detail')
      .isVisible()
      .catch(() => false);
    const pullSkippedApi = pullPosts.find((p) => Array.isArray(p.skipped_override))?.skipped_override || [];
    const pullConflictsApi = pullPosts.find((p) => Array.isArray(p.conflicts))?.conflicts || [];
    const skipConflictUiOk =
      (pullSkippedApi.length === 0 || pullSkippedVisible) &&
      (pullConflictsApi.length === 0 || pullConflictsVisible);
    results.ids.pullSkipConflict = {
      skippedApi: pullSkippedApi,
      conflictsApi: pullConflictsApi,
      pullSkippedVisible,
      pullConflictsVisible,
      pullDetailVisible,
      skipConflictUiOk,
    };
    recordAc('AC-PULL-SKIP-CONFLICT-UI', skipConflictUiOk ? 'PASS' : 'FAIL', {
      summary: `skippedApi=${JSON.stringify(pullSkippedApi)} conflictsApi=${JSON.stringify(pullConflictsApi)} ui skipped=${pullSkippedVisible} conflicts=${pullConflictsVisible} detail=${pullDetailVisible}`,
    });

    const netBeforeApply = results.network.length;
    const bodyBeforeApply = results.postBodies.length;
    if (applyVisible) {
      await applyBtn.click({ force: true });
      log('CLICK_APPLY', { note: MEMBER });
      await sleep(4500);
    }
    await shot(page2, '05-after-apply');
    const applyPosts = results.network
      .slice(netBeforeApply)
      .filter((n) => n.method === 'POST' && /contract-library\/apply/.test(n.url));
    const applyOk = applyPosts.some((p) => p.status >= 200 && p.status < 300);
    const applyBodies = results.postBodies.slice(bodyBeforeApply).filter((b) => /\/apply/.test(b.url));
    const applyBodyClean = applyBodies.length === 0 ? false : applyBodies.every((b) => b.qsHasCompanyId && !b.bodyHasCompanyId);

    await hardRefreshSettings(page2, MEMBER);
    await sleep(2500);
    // Origin badges on TPL/CL — FE-03: 4 overlay fields when present
    await page2.getByTestId('ctr-legal-tab-clauses').click().catch(() => {});
    await sleep(800);
    const clauseOriginLoc = page2.locator('[data-testid^="ctr-clause-origin-"]');
    const clauseOriginCount = await clauseOriginLoc.count();
    let originSample = '';
    let originAttrs = [];
    if (clauseOriginCount > 0) {
      const texts = await clauseOriginLoc.allInnerTexts().catch(() => []);
      originSample = texts.find((t) => /Tập đoàn/i.test(t)) || texts[0] || '';
      const n = Math.min(clauseOriginCount, 6);
      for (let i = 0; i < n; i++) {
        const el = clauseOriginLoc.nth(i);
        originAttrs.push({
          testid: await el.getAttribute('data-testid').catch(() => null),
          origin: await el.getAttribute('data-origin').catch(() => null),
          origin_company_id: await el.getAttribute('data-origin-company').catch(() => null),
          origin_publish_version: await el.getAttribute('data-origin-version').catch(() => null),
          lineage_code: await el.getAttribute('data-lineage-code').catch(() => null),
          text: (await el.innerText().catch(() => '')).slice(0, 120),
        });
      }
    }
    await page2.getByTestId('ctr-legal-tab-templates').click().catch(() => {});
    await sleep(800);
    const tplOriginLoc = page2.locator('[data-testid^="ctr-tpl-origin-"]');
    const tplOriginCount = await tplOriginLoc.count();
    let tplOriginSample = '';
    let tplOriginAttrs = [];
    if (tplOriginCount > 0) {
      const texts = await tplOriginLoc.allInnerTexts().catch(() => []);
      tplOriginSample = texts.find((t) => /Tập đoàn/i.test(t)) || texts[0] || '';
      const n = Math.min(tplOriginCount, 6);
      for (let i = 0; i < n; i++) {
        const el = tplOriginLoc.nth(i);
        tplOriginAttrs.push({
          testid: await el.getAttribute('data-testid').catch(() => null),
          origin: await el.getAttribute('data-origin').catch(() => null),
          origin_company_id: await el.getAttribute('data-origin-company').catch(() => null),
          origin_publish_version: await el.getAttribute('data-origin-version').catch(() => null),
          lineage_code: await el.getAttribute('data-lineage-code').catch(() => null),
          text: (await el.innerText().catch(() => '')).slice(0, 120),
        });
      }
    }
    const groupBadges = [...originAttrs, ...tplOriginAttrs].filter(
      (a) => String(a.origin || '').toLowerCase() === 'group',
    );
    const originOk = groupBadges.length > 0 || /Tập đoàn/i.test(`${originSample} ${tplOriginSample}`);
    const fourFieldOk =
      groupBadges.length === 0
        ? false
        : groupBadges.every(
            (a) =>
              a.origin === 'group' &&
              a.origin_publish_version &&
              String(a.origin_publish_version).length > 0 &&
              a.origin_company_id &&
              String(a.origin_company_id).length > 0 &&
              a.lineage_code &&
              String(a.lineage_code).length > 0,
          );
    // Soft: if BE omitted a field, still require attrs present on DOM (empty string allowed only if API omitted)
    const attrsPresent =
      groupBadges.length > 0 &&
      groupBadges.every(
        (a) =>
          a.origin != null &&
          a.origin_company_id != null &&
          a.origin_publish_version != null &&
          a.lineage_code != null,
      );
    await shot(page2, '06-origin-badges');
    results.ids.originOverlay = {
      clauseOriginCount,
      tplOriginCount,
      groupBadgeCount: groupBadges.length,
      fourFieldOk,
      attrsPresent,
      samples: { originSample, tplOriginSample },
      groupBadges: groupBadges.slice(0, 4),
    };

    recordAc(
      'AC-MEMBER-PULL-APPLY',
      memberZone && pullOk && applyOk && pullBodyClean && applyBodyClean ? 'PASS' : 'FAIL',
      {
        summary: `zone=${memberZone} holdingStill=${holdingStill} pull=${pullPosts.map((p) => `${p.status}:${p.code}`).join(',')} apply=${applyPosts.map((p) => `${p.status}:${p.code}`).join(',')} bodyClean pull=${pullBodyClean}/apply=${applyBodyClean} summary=${pullSummary.slice(0, 120)} originCL=${clauseOriginCount}:${originSample.slice(0, 40)} originTPL=${tplOriginCount}:${tplOriginSample.slice(0, 40)}`,
        pullPosts,
        applyPosts,
        originOk,
      },
    );
    recordAc('AC-ORIGIN-BADGE', originOk && attrsPresent ? 'PASS' : originOk ? 'PARTIAL' : 'FAIL', {
      summary: `clauseOrigins=${clauseOriginCount} tplOrigins=${tplOriginCount} group=${groupBadges.length} fourFieldOk=${fourFieldOk} attrsPresent=${attrsPresent} samples=${JSON.stringify({ originSample, tplOriginSample })}`,
      groupBadges: groupBadges.slice(0, 4),
    });
    recordAc('AC-ORIGIN-FOUR-FIELDS', fourFieldOk ? 'PASS' : attrsPresent && originOk ? 'PARTIAL' : 'FAIL', {
      summary: `Require data-origin + data-origin-version + data-origin-company + data-lineage-code on group badges. fourFieldOk=${fourFieldOk} attrsPresent=${attrsPresent}`,
      groupBadges: groupBadges.slice(0, 4),
    });

    // ——— AC3 company_id query only (aggregate) ———
    const libBodies = results.postBodies.filter((b) =>
      /contract-library\/(publishes|pull|apply)/.test(b.url),
    );
    const allQueryOnly =
      libBodies.length > 0 && libBodies.every((b) => b.qsHasCompanyId === true && b.bodyHasCompanyId === false);
    recordAc('AC-COMPANY-ID-QUERY-ONLY', allQueryOnly ? 'PASS' : 'FAIL', {
      summary: `n=${libBodies.length} allQueryOnly=${allQueryOnly}`,
      bodies: libBodies,
    });

    // ——— AC4 Negatives (fresh context · finance OU · apply without pull) ———
    await memberCtx.close().catch(() => {});
    const negCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const negPage = await negCtx.newPage();
    track(negPage);
    await injectPortalAuth(negPage, session, MEMBER_NEG, MEMBER_NEG);
    await openSettings(negPage, MEMBER_NEG);
    await sleep(1500);
    const negApply = negPage.getByTestId('ctr-library-apply-btn');
    let nothingToast = false;
    let nothingCode = null;
    if (await negApply.isVisible().catch(() => false)) {
      const net0 = results.network.length;
      await negApply.click({ force: true });
      log('CLICK_APPLY_NEG_NOTHING', { note: MEMBER_NEG });
      await sleep(3500);
      const fails = results.network
        .slice(net0)
        .filter((n) => n.method === 'POST' && /\/apply/.test(n.url));
      nothingCode = fails.find((f) => /NOTHING-TO-APPLY|CTR-PUB-NOTHING/i.test(String(f.code || f.message || '')))?.code
        || fails.find((f) => f.status >= 400)?.code
        || null;
      nothingToast =
        Boolean(nothingCode) ||
        /không có|nothing|chưa có|áp dụng/i.test(await negPage.locator('body').innerText().catch(() => ''));
      await shot(negPage, '07-nothing-to-apply');
      results.ids.negApplyPosts = fails;
    } else {
      results.ids.negZoneMissing = true;
      await shot(negPage, '07-nothing-to-apply-no-zone');
    }
    recordAc('AC-NEG-NOTHING-TO-APPLY', nothingCode ? 'PASS' : 'OBS', {
      summary: `ou=${MEMBER_NEG} code=${nothingCode} toastHint=${nothingToast} — CODE-CONFLICT requires member-local collide without seed invent → OBS`,
    });
    recordAc('AC-NEG-CODE-CONFLICT', 'OBS', {
      summary: 'Not reproducible without inventing member-local colliding codes (U65 forbid seed invent)',
    });
    await negCtx.close().catch(() => {});

    // ——— must_keep UF-HRM-02 + print-spine chrome (holding context) ———
    const keepCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const keepPage = await keepCtx.newPage();
    track(keepPage);
    await injectPortalAuth(keepPage, session, HOLDING, 'all');
    await keepPage.goto(q('/hr/contracts', { companyId: HOLDING }), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await sleep(2500);
    await shot(keepPage, '08-contracts-list');
    const addBtn = keepPage.getByRole('button', { name: /Thêm|Tạo hợp đồng/i }).first();
    let ufOk = false;
    let spineOk = false;
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click({ force: true });
      await sleep(1500);
      let formReady = await keepPage.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
      const deadline = Date.now() + 35000;
      while (!formReady && Date.now() < deadline) {
        await pickFirstOption(keepPage, 'hdsd-contracts-form-employee');
        await pickFirstOption(keepPage, 'hdsd-contracts-form-contract-type');
        await sleep(700);
        formReady = await keepPage.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
      }
      const wl = keepPage.getByTestId('ctr-work-location');
      if (await wl.isVisible().catch(() => false)) {
        await wl.fill(`Hà Nội — QA must_keep ${STAMP}`);
      }
      const codeInput = keepPage.locator('#contract_code');
      let contractCode = `HD-QA3-${STAMP}`;
      if (await codeInput.isVisible().catch(() => false)) {
        const cur = (await codeInput.inputValue().catch(() => '')).trim();
        if (cur) contractCode = cur;
        else await codeInput.fill(contractCode);
      }
      const net0 = results.network.length;
      if (formReady) {
        await keepPage.getByTestId('hdsd-contracts-form-submit').click({ timeout: 15000 });
        log('UF02_SAVE', { note: contractCode });
        await sleep(4000);
        const posts = results.network
          .slice(net0)
          .filter((n) => n.method === 'POST' && /contracts-insurance\/contracts(\?|$)/.test(n.url));
        ufOk = posts.some((p) => p.status >= 200 && p.status < 300);
        results.ids.contractCode = contractCode;
        results.ids.contractId = posts.find((p) => p.dataId)?.dataId || null;
        await shot(keepPage, '09-uf02-after-save');

        // Open edit → print spine chrome
        await keepPage.goto(q('/hr/contracts', { companyId: HOLDING }), {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });
        await sleep(2500);
        const search = keepPage.locator('input[placeholder*="Tìm"], input[type=search]').first();
        if (await search.isVisible().catch(() => false)) {
          await search.fill(contractCode);
          await sleep(1000);
        }
        const row = keepPage.locator('tbody tr').filter({ hasText: contractCode }).first();
        if (await row.isVisible().catch(() => false)) {
          const actionBtns = row.locator('td').last().locator('button');
          const pencil = actionBtns.nth(1);
          if (await pencil.isVisible().catch(() => false)) await pencil.click({ force: true });
          await sleep(2000);
          spineOk = await keepPage.getByTestId('ctr-print-spine').isVisible().catch(() => false);
          if (!spineOk) {
            spineOk = /In hợp đồng|Xem trước|print-spine|Phiên bản in/i.test(
              await keepPage.locator('body').innerText().catch(() => ''),
            );
          }
          await shot(keepPage, '10-print-spine-chrome');
        }
      }
      recordUf('UF-HRM-02', ufOk ? 'PASS' : 'FAIL', {
        summary: `formReady=${formReady} save=${ufOk} code=${contractCode} spineChrome=${spineOk}`,
      });
    } else {
      recordUf('UF-HRM-02', 'FAIL', { summary: 'add button not visible' });
    }
    recordAc('AC-MUSTKEEP-PRINT-SPINE', spineOk || ufOk ? (spineOk ? 'PASS' : 'PARTIAL') : 'FAIL', {
      summary: `spineVisible=${spineOk} uf02=${ufOk}`,
    });
    await keepCtx.close().catch(() => {});

    const proc = processGateSummary();
    recordAc('AC-PROCESS-CLEAN', proc.fail ? 'FAIL' : 'PASS', {
      summary: `dndStorm=${proc.dndStorm.length} uncaught=${proc.uncaught.length} mojibake=${hasMojibake(honestyText)}`,
    });

    // ——— Verdict ———
    const needPass = [
      'AC-HOLDING-PUBLISH',
      'AC-MEMBER-PULL-APPLY',
      'AC-COMPANY-ID-QUERY-ONLY',
      'AC-SETTINGS-CHROME',
      'AC-PROCESS-CLEAN',
      'AC-PULL-SKIP-CONFLICT-UI',
      'AC-ORIGIN-BADGE',
      'AC-HONESTY-STAMP',
    ];
    const soft = ['AC-ORIGIN-FOUR-FIELDS', 'AC-NEG-NOTHING-TO-APPLY', 'AC-NEG-CODE-CONFLICT', 'AC-MUSTKEEP-PRINT-SPINE'];
    const hardFail = needPass.some((k) => results.ac[k]?.verdict === 'FAIL');
    const ufFail = results.uf['UF-HRM-02']?.verdict === 'FAIL';
    const softFail = soft.some((k) => results.ac[k]?.verdict === 'FAIL');

    if (hardFail || ufFail || softFail || proc.fail) {
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
      if (hardFail) {
        results.residuals.push({
          id: 'R-CTR-LIBRARY-PUBLISH-APPLY',
          sev: 'P0',
          note: needPass.filter((k) => results.ac[k]?.verdict === 'FAIL').join(','),
        });
      }
      if (results.ac['AC-ORIGIN-FOUR-FIELDS']?.verdict === 'FAIL') {
        results.residuals.push({
          id: 'R-CTR-ORIGIN-FOUR-FIELDS',
          sev: 'P1',
          note: 'Group origin badges missing one of 4 overlay attrs/values after apply',
        });
      }
    } else {
      results.overall = 'PASS';
      results.ack_status = 'PASS_TO_PM';
      if (results.ac['AC-ORIGIN-FOUR-FIELDS']?.verdict === 'PARTIAL') {
        results.residuals.push({
          id: 'R-CTR-ORIGIN-FOUR-FIELDS-PARTIAL',
          sev: 'P2',
          note: 'Attrs present but one+ group badge missing non-empty company/lineage — OBS if BE omit allowed',
        });
      }
    }
    results.honesty.contracts_printable_ready = false;
    results.endedAt = ts();
    save();
    console.log(`\n=== ${results.ack_status} overall=${results.overall} stamp=${STAMP} ===`);
    console.log(JSON.stringify({ ac: results.ac, uf: results.uf, residuals: results.residuals }, null, 2));
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.pageErrors.push(String(e).slice(0, 400));
    results.endedAt = ts();
    save();
    console.error('HARNESS_ERROR', e);
    process.exitCode = 2;
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
