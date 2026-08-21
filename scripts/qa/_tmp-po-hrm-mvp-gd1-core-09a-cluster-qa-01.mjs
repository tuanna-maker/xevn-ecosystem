#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QA-01 — U65 browser J-HRM-CORE-09A-01..04
 * (01) Settings clause create draft + {{token}} → F5 → activate → F5
 * (02) Draft edit body → PATCH 2xx → F5 body persists
 * (03) Issued active PATCH → 409 CONFLICT → activate bump · snapshot freeze
 * (04) Soft retire · Nest /core 0 · publish/pull ≠ body SoT · must_keep CORE-08/02/01
 * DENY seed · Nest /core SoT · printable flip · CORE-08=pillar DONE · PREV/VER/PDF/TPL invent DONE
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];
let PORTAL = PORTAL_CANDIDATES[0];
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

const ISSUED_CODE = process.env.QA_ISSUED_CLAUSE_CODE || 'LEGAL_CTRQA-HPY05Q';
const FREEZE_CONTRACT_ID =
  process.env.QA_FREEZE_CONTRACT_ID || '9cdc6ee6-0a71-4b73-89ae-c9f3e952a656';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09a-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09a-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `CORE09AQA-${Date.now().toString(36).toUpperCase()}`;
const CODE_ACT = `LEGAL_CORE09A-${STAMP.slice(-6)}`;
const CODE_DRAFT = `LEGAL_CORE09AD-${STAMP.slice(-6)}`;
const TITLE_ACT = `QA CORE09A create ${STAMP}`;
const TITLE_DRAFT = `QA CORE09A draft ${STAMP}`;
const BODY_ACT = `Căn cứ {{bo_luat}} — create ${STAMP}.`;
const BODY_DRAFT_V1 = `Draft body v1 {{token}} — ${STAMP}.`;
const BODY_DRAFT_V2 = `Draft body v2 {{token}} F5 — ${STAMP}.`;
const BODY_ISSUED_ATTEMPT = `Issued overwrite attempt {{token}} — ${STAMP}.`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-09A-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on:
    'FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md · API-01 CONFIRMED RETAIN',
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    personnel_core_uat: false,
    seed_used: false,
    c_slice_ne_module: true,
    core08_ne_pillar_done: true,
    note_crud_ne_fr08_done: true,
    prev_ver_pdf_tpl_invent_done: false,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  clause_hits: [],
  library_pub_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function trackUrl(url, method, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const clause = /\/contracts-insurance\/contract-clauses/.test(url);
  const library = /\/contracts-insurance\/contract-library\//.test(url);
  const entry = {
    method,
    url,
    status: status ?? null,
    at: ts(),
    nest_core,
    clause,
    library,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (clause) R.clause_hits.push(entry);
  if (library) R.library_pub_hits.push(entry);
}

function clauseRows(payload) {
  const d = payload?.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}

async function loginToken(email = EMAIL, password = PASSWORD) {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function apiJson(method, path, token, body, opts = {}) {
  const company = opts.companyId ?? COMPANY;
  const tenant = opts.tenantId ?? TENANT;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': company,
    'x-tenant-id': tenant,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await fetch(`${HRM}${path}`, init);
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return {
    status: r.status,
    code: json?.error?.code ?? json?.code ?? null,
    message: json?.message ?? null,
    json,
    snippet: text.slice(0, 700),
  };
}

async function l1Seal(token) {
  const probes = [];
  async function one(method, path, body, opts) {
    const res = await apiJson(method, path, token, body, opts);
    probes.push({
      method,
      path,
      status: res.status,
      code: res.code,
      message: res.message,
      snippet: res.snippet,
      cannot: /Cannot (GET|POST|PUT|PATCH|DELETE)/i.test(res.snippet || ''),
    });
    return res;
  }

  const list = await one('GET', '/api/hrm/contracts-insurance/contract-clauses?company_id=main');
  const items = clauseRows(list.json);
  const issued = items.find(
    (c) => c.code === ISSUED_CODE && String(c.status).toLowerCase() === 'active',
  );
  const core = await one('GET', '/api/hrm/core/contract-clauses?company_id=main');
  const pub = await one('GET', '/api/hrm/contracts-insurance/contract-library/publishes?company_id=main');
  const pvList = await one(
    'GET',
    `/api/hrm/contracts-insurance/contracts/${FREEZE_CONTRACT_ID}/print-versions?company_id=main`,
  );
  const pvs = clauseRows(pvList.json);
  const issuedPv =
    pvs.find((p) => String(p.status).toLowerCase() === 'issued') || pvs[0] || null;
  let snapBody = null;
  if (issuedPv?.id) {
    const pvGet = await one(
      'GET',
      `/api/hrm/contracts-insurance/contracts/${FREEZE_CONTRACT_ID}/print-versions/${issuedPv.id}?company_id=main`,
    );
    const snap = pvGet.json?.data?.clauses_snapshot_json ?? pvGet.json?.clauses_snapshot_json;
    const arr = Array.isArray(snap) ? snap : [];
    const hit = arr.find((x) => x?.code === ISSUED_CODE);
    snapBody = hit?.body_vi ?? null;
  }
  let conflictProbe = null;
  if (issued?.id) {
    conflictProbe = await one(
      'PATCH',
      `/api/hrm/contracts-insurance/contract-clauses/${issued.id}?company_id=main`,
      {
        title_vi: issued.title_vi,
        body_vi: `${issued.body_vi || ''} /*l1*/`,
        clause_group: issued.clause_group,
        apply_to_packs: issued.apply_to_packs,
        mandatory: !!issued.mandatory,
      },
    );
  }

  R.l1 = {
    probes,
    clauses_live: list.status === 200 && items.length >= 0,
    clause_count: items.length,
    issued_clause_id: issued?.id || null,
    issued_clause_code: issued?.code || null,
    issued_clause_company: issued?.company_id || null,
    issued_body_vi: issued?.body_vi || null,
    nest_core_deny: core.status === 404 && /Cannot GET/i.test(core.snippet || ''),
    publish_list_live: pub.status === 200,
    freeze_contract_id: FREEZE_CONTRACT_ID,
    freeze_pv_id: issuedPv?.id || null,
    freeze_snap_body: snapBody,
    conflict_l1:
      conflictProbe?.status === 409 && conflictProbe?.code === 'HRM-CTR-CL-CODE-CONFLICT',
    stamp: `CORE09AL1-${Date.now().toString(36).toUpperCase()}`,
  };
  return R.l1;
}

async function findAcross(page, selector, opts = {}) {
  const timeout = opts.timeout ?? 2500;
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = h.locator(selector).first();
      if (await loc.isVisible({ timeout }).catch(() => false)) {
        return { host: h, locator: loc };
      }
    } catch {
      /* */
    }
  }
  return null;
}

async function waitAcross(page, selector, ms = 12000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const hit = await findAcross(page, selector, { timeout: 400 });
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function shot(page, name) {
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => null);
  R.screens.push(p);
}

function settingsUrl() {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  return isDirectHrm
    ? `${PORTAL}/settings?tab=contract-legal&companyId=${COMPANY}&tenantId=${TENANT}`
    : `${PORTAL}/command-center/hrm/settings?tab=contract-legal&companyId=${COMPANY}&tenantId=${TENANT}`;
}

async function ensureClausePanel(page) {
  const tab = await waitAcross(page, '[data-testid="settings-tab-contract-legal"]', 12000);
  if (tab) {
    await tab.locator.click({ force: true }).catch(() => null);
    await sleep(900);
  }
  let panel = await waitAcross(page, '[data-testid="settings-contract-legal-print"]', 15000);
  const clausesTab = await waitAcross(page, '[data-testid="ctr-legal-tab-clauses"]', 8000);
  if (clausesTab) {
    await clausesTab.locator.click({ force: true }).catch(() => null);
    await sleep(700);
  }
  panel = (await waitAcross(page, '[data-testid="settings-contract-legal-print"]', 8000)) || panel;
  return panel?.host || null;
}

async function openClauseSettings(page) {
  const url = settingsUrl();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  R.click_log.push(`goto settings contract-legal via ${PORTAL}`);
  await sleep(3500);
  return ensureClausePanel(page);
}

/** F5 must re-click Điều khoản HĐ — portal reload drops tab back to Tài khoản. */
async function f5ClauseSettings(page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  // Prefer deep-link again (query tab=contract-legal) then force click.
  await page.goto(settingsUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const host = await ensureClausePanel(page);
  R.click_log.push('F5+reopen contract-legal tab');
  return host;
}

async function fillClauseForm(host, { code, title, body, codeDisabled }) {
  const codeInput = host.locator('[data-testid="ctr-clause-code"]').first();
  if (!codeDisabled) {
    await codeInput.fill(code);
  }
  await host.locator('[data-testid="ctr-clause-title"]').first().fill(title);
  await host.locator('[data-testid="ctr-clause-body"]').first().fill(body);
}

function lastHit(preds) {
  const hits = R.network.filter(preds);
  return hits.length ? hits[hits.length - 1] : null;
}

function physicalClauseMutates() {
  return R.clause_hits.filter((h) =>
    /POST|PATCH/.test(h.method) || /\/activate|\/retire/.test(h.url),
  );
}

async function main() {
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(u);
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e).slice(0, 80);
    }
  }

  PORTAL = PORTAL_CANDIDATES[0];
  for (const candidate of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(candidate);
      if (r.status > 0 && r.status < 500) {
        PORTAL = candidate;
        R.l0.portal = r.status;
        R.l0.portal_url = candidate;
        break;
      }
    } catch (e) {
      R.l0[`portal_try_${candidate}`] = String(e).slice(0, 60);
    }
  }
  if (!R.l0.portal) R.l0.portal = 'unreachable';
  R.env.PORTAL = PORTAL;

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-CORE-09A-AUTH', sev: 'P0', note: 'login token missing' });
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  await l1Seal(token);
  if (!R.l1.clauses_live || !R.l1.nest_core_deny || !R.l1.conflict_l1 || !R.l1.freeze_pv_id) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-CORE-09A-L1',
      sev: 'P0',
      note: `L1 incomplete live=${R.l1.clauses_live} nest=${R.l1.nest_core_deny} conflict=${R.l1.conflict_l1} pv=${R.l1.freeze_pv_id}`,
    });
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, l1: R.l1 }, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  page.on('request', (req) => trackUrl(req.url(), req.method()));
  page.on('response', (res) => trackUrl(res.url(), res.request().method(), res.status()));
  page.on('console', (m) => {
    if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 240));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));

  await page.addInitScript(
    (s) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
        store.setItem(
          'xevn.portal.user',
          JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }),
        );
        store.setItem('xevn.portal.tenantId', s.tenantId);
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId);
      }
    },
    { token, email: EMAIL, companyId: COMPANY, tenantId: TENANT },
  );

  const j01 = { id: 'J-HRM-CORE-09A-01', verdict: 'FAIL', notes: [], network: [] };
  const j02 = { id: 'J-HRM-CORE-09A-02', verdict: 'FAIL', notes: [], network: [] };
  const j03 = { id: 'J-HRM-CORE-09A-03', verdict: 'FAIL', notes: [], network: [] };
  const j04 = { id: 'J-HRM-CORE-09A-04', verdict: 'FAIL', notes: [], network: [] };
  R.journeys = { j01, j02, j03, j04 };

  try {
    const host = await openClauseSettings(page);
    await shot(page, '01-settings-clause-tab');
    if (!host) {
      j01.notes.push('Settings contract-legal panel not found');
      throw new Error('panel missing');
    }

    // --- J-01 create draft → F5 → activate → F5 ---
    const nestBefore = R.nest_core_hits.length;
    await fillClauseForm(host, { code: CODE_ACT, title: TITLE_ACT, body: BODY_ACT });
    await shot(page, '02-j01-form-filled');
    await host.locator('[data-testid="ctr-clause-save"]').first().click({ force: true });
    R.click_log.push(`J01 save create ${CODE_ACT}`);
    await sleep(2500);
    const postCreate = lastHit(
      (h) => h.method === 'POST' && /\/contract-clauses(\?|$)/.test(h.url) && !/activate|retire/.test(h.url),
    );
    j01.network.push(postCreate);
    if (postCreate && postCreate.status >= 200 && postCreate.status < 300) {
      j01.notes.push(`POST create ${postCreate.status}`);
    } else {
      j01.notes.push(`POST create missing/fail ${JSON.stringify(postCreate)}`);
    }
    await shot(page, '03-j01-after-create');

    // F5 after create (reopen Điều khoản HĐ — reload alone drops to Tài khoản)
    const host2 = await f5ClauseSettings(page);
    const afterCreateRow = host2
      ? host2.locator(`[data-testid="ctr-clause-row-${CODE_ACT}"]`).first()
      : null;
    if (afterCreateRow) {
      await afterCreateRow.scrollIntoViewIfNeeded().catch(() => null);
    }
    const draftLabel = host2
      ? await host2
          .locator(`[data-testid="ctr-clause-status-label-${CODE_ACT}"]`)
          .first()
          .textContent()
          .catch(() => '')
      : '';
    const rowVisible = afterCreateRow
      ? await afterCreateRow.isVisible({ timeout: 8000 }).catch(() => false)
      : false;
    j01.notes.push(`F5 after create row=${rowVisible} status="${(draftLabel || '').trim()}"`);
    await shot(page, '04-j01-f5-after-create');

    if (host2 && rowVisible) {
      await host2
        .locator(`[data-testid="ctr-clause-activate-${CODE_ACT}"]`)
        .first()
        .click({ force: true });
      R.click_log.push(`J01 activate ${CODE_ACT}`);
      await sleep(2500);
      const actHit = lastHit((h) => h.method === 'POST' && /\/contract-clauses\/[^/]+\/activate/.test(h.url));
      j01.network.push(actHit);
      if (actHit && actHit.status >= 200 && actHit.status < 300) {
        j01.notes.push(`POST activate ${actHit.status}`);
      } else {
        j01.notes.push(`POST activate missing/fail ${JSON.stringify(actHit)}`);
      }
      const host3 = await f5ClauseSettings(page);
      const activeLabel = host3
        ? await host3
            .locator(`[data-testid="ctr-clause-status-label-${CODE_ACT}"]`)
            .first()
            .textContent()
            .catch(() => '')
        : '';
      j01.notes.push(`F5 after activate status="${(activeLabel || '').trim()}"`);
      await shot(page, '05-j01-f5-after-activate');
      const nestDelta = R.nest_core_hits.length - nestBefore;
      j01.notes.push(`nest_core_delta=${nestDelta}`);
      const physicalOk =
        postCreate &&
        /\/contracts-insurance\/contract-clauses/.test(postCreate.url) &&
        actHit &&
        /\/contracts-insurance\/contract-clauses/.test(actHit.url);
      if (
        postCreate?.status >= 200 &&
        postCreate?.status < 300 &&
        rowVisible &&
        /Nháp/i.test(draftLabel || '') &&
        actHit?.status >= 200 &&
        actHit?.status < 300 &&
        /Hiệu lực/i.test(activeLabel || '') &&
        nestDelta === 0 &&
        physicalOk
      ) {
        j01.verdict = 'PASS';
      }
    }

    // --- J-02 draft edit F5 ---
    const hostJ2 = (await ensureClausePanel(page)) || (await openClauseSettings(page));
    if (hostJ2) {
      const clausesTab = hostJ2.locator('[data-testid="ctr-legal-tab-clauses"]').first();
      await clausesTab.click({ force: true }).catch(() => null);
      await sleep(400);
      // clear edit mode if leftover
      const cancel0 = hostJ2.getByRole('button', { name: /Hủy sửa/i }).first();
      if (await cancel0.isVisible({ timeout: 600 }).catch(() => false)) {
        await cancel0.click({ force: true }).catch(() => null);
        await sleep(300);
      }
      await fillClauseForm(hostJ2, {
        code: CODE_DRAFT,
        title: TITLE_DRAFT,
        body: BODY_DRAFT_V1,
      });
      await hostJ2.locator('[data-testid="ctr-clause-save"]').first().click({ force: true });
      R.click_log.push(`J02 create draft ${CODE_DRAFT}`);
      await sleep(2000);
      const draftCreate = lastHit(
        (h) =>
          h.method === 'POST' &&
          /\/contract-clauses(\?|$)/.test(h.url) &&
          !/activate|retire/.test(h.url),
      );
      j02.network.push(draftCreate);
      const h2b = await f5ClauseSettings(page);
      if (h2b) {
        const row = h2b.locator(`[data-testid="ctr-clause-row-${CODE_DRAFT}"]`).first();
        await row.scrollIntoViewIfNeeded().catch(() => null);
        await row.locator('button', { hasText: /^Sửa$/ }).click({ force: true });
        R.click_log.push(`J02 edit ${CODE_DRAFT}`);
        await sleep(500);
        await h2b.locator('[data-testid="ctr-clause-body"]').first().fill(BODY_DRAFT_V2);
        await h2b.locator('[data-testid="ctr-clause-save"]').first().click({ force: true });
        await sleep(2500);
        const patchHit = lastHit(
          (h) => h.method === 'PATCH' && /\/contract-clauses\//.test(h.url),
        );
        j02.network.push(patchHit);
        j02.notes.push(
          `PATCH ${patchHit?.status ?? 'missing'} physical=${
            patchHit ? /\/contracts-insurance\/contract-clauses/.test(patchHit.url) : false
          }`,
        );
        await shot(page, '06-j02-after-patch');
        const h2c = await f5ClauseSettings(page);
        if (h2c) {
          await h2c
            .locator(`[data-testid="ctr-clause-row-${CODE_DRAFT}"]`)
            .first()
            .locator('button', { hasText: /^Sửa$/ })
            .click({ force: true });
          await sleep(600);
          const bodyVal = await h2c
            .locator('[data-testid="ctr-clause-body"]')
            .first()
            .inputValue()
            .catch(() => '');
          j02.notes.push(`F5 body contains v2=${bodyVal.includes('Draft body v2')}`);
          await shot(page, '07-j02-f5-body');
          if (
            draftCreate?.status >= 200 &&
            draftCreate?.status < 300 &&
            patchHit?.status >= 200 &&
            patchHit?.status < 300 &&
            /\/contracts-insurance\/contract-clauses/.test(patchHit.url) &&
            bodyVal.includes('Draft body v2')
          ) {
            j02.verdict = 'PASS';
          }
        }
      }
    } else {
      j02.notes.push('host missing for J02');
    }

    // --- J-03 issued CONFLICT → bump · snapshot freeze ---
    const snapBefore = R.l1.freeze_snap_body;
    const h3 = (await ensureClausePanel(page)) || (await openClauseSettings(page));
    if (h3 && R.l1.issued_clause_id) {
      // cancel edit form if open
      const cancel = h3.getByRole('button', { name: /Hủy sửa/i }).first();
      if (await cancel.isVisible({ timeout: 800 }).catch(() => false)) {
        await cancel.click({ force: true }).catch(() => null);
        await sleep(300);
      }
      const issuedRows = h3.locator(`[data-testid="ctr-clause-row-${ISSUED_CODE}"]`);
      const n = await issuedRows.count();
      let edited = false;
      for (let i = 0; i < n; i++) {
        const row = issuedRows.nth(i);
        const st = await row
          .locator(`[data-testid="ctr-clause-status-label-${ISSUED_CODE}"]`)
          .textContent()
          .catch(() => '');
        if (/Hiệu lực/i.test(st || '')) {
          await row.locator('button', { hasText: /^Sửa$/ }).click({ force: true });
          edited = true;
          R.click_log.push(`J03 edit issued row#${i} ${ISSUED_CODE}`);
          break;
        }
      }
      if (!edited && n > 0) {
        await issuedRows.first().locator('button', { hasText: /^Sửa$/ }).click({ force: true });
        edited = true;
      }
      await sleep(500);
      await h3.locator('[data-testid="ctr-clause-body"]').first().fill(BODY_ISSUED_ATTEMPT);
      await h3.locator('[data-testid="ctr-clause-save"]').first().click({ force: true });
      await sleep(2500);
      const conflictHit = lastHit(
        (h) =>
          h.method === 'PATCH' &&
          /\/contract-clauses\//.test(h.url) &&
          (h.status === 409 || h.status === null),
      );
      // wait a bit more for response status fill
      await sleep(800);
      const conflictHits = R.clause_hits.filter(
        (h) => h.method === 'PATCH' && h.status === 409,
      );
      const conflict = conflictHits[conflictHits.length - 1] || conflictHit;
      j03.network.push(conflict);
      j03.notes.push(`PATCH conflict status=${conflict?.status} url=${conflict?.url?.slice(-80)}`);
      const banner = await waitAcross(page, '[data-testid="ctr-clause-issued-conflict-banner"]', 6000);
      const bannerOk = Boolean(banner);
      j03.notes.push(`conflict banner=${bannerOk}`);
      await shot(page, '08-j03-conflict-banner');
      if (banner) {
        await banner.host
          .locator('[data-testid="ctr-clause-activate-bump"]')
          .first()
          .click({ force: true });
        R.click_log.push('J03 activate bump');
        await sleep(2800);
      }
      const bumpHit = lastHit(
        (h) => h.method === 'POST' && /\/contract-clauses\/[^/]+\/activate/.test(h.url),
      );
      j03.network.push(bumpHit);
      j03.notes.push(`POST activate bump ${bumpHit?.status ?? 'missing'}`);
      await shot(page, '09-j03-after-bump');

      // Snapshot freeze assert via API (same token) — not invent print engine
      const pvGet = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/contracts/${FREEZE_CONTRACT_ID}/print-versions/${R.l1.freeze_pv_id}?company_id=main`,
        token,
      );
      const snap = pvGet.json?.data?.clauses_snapshot_json ?? pvGet.json?.clauses_snapshot_json;
      const arr = Array.isArray(snap) ? snap : [];
      const hit = arr.find((x) => x?.code === ISSUED_CODE);
      const snapAfter = hit?.body_vi ?? null;
      const freezeOk = snapBefore != null && snapAfter === snapBefore;
      const notAttempt = snapAfter && !String(snapAfter).includes(STAMP);
      j03.notes.push(
        `snapshot freeze ok=${freezeOk} unchanged=${snapAfter === snapBefore} notAttemptBody=${notAttempt}`,
      );
      R.l1.freeze_snap_after = snapAfter;
      if (
        conflict?.status === 409 &&
        bannerOk &&
        bumpHit?.status >= 200 &&
        bumpHit?.status < 300 &&
        /\/contracts-insurance\/contract-clauses/.test(bumpHit.url) &&
        freezeOk &&
        notAttempt
      ) {
        j03.verdict = 'PASS';
      }
    } else {
      j03.notes.push('issued clause or host missing');
    }

    // --- J-04 soft retire created active + nest/core + must_keep ---
    const h4 = await openClauseSettings(page);
    await shot(page, '10-j04-open');
    if (h4) {
      const row = h4.locator(`[data-testid="ctr-clause-row-${CODE_ACT}"]`).first();
      if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
        await row.scrollIntoViewIfNeeded().catch(() => null);
        await row.locator(`[data-testid="ctr-clause-retire-${CODE_ACT}"]`).click({ force: true });
        R.click_log.push(`J04 retire ${CODE_ACT}`);
        await sleep(2500);
        const retireHit = lastHit(
          (h) => h.method === 'POST' && /\/contract-clauses\/[^/]+\/retire/.test(h.url),
        );
        j04.network.push(retireHit);
        j04.notes.push(`POST retire ${retireHit?.status ?? 'missing'}`);
        const h4b = await f5ClauseSettings(page);
        const retiredLabel = h4b
          ? await h4b
              .locator(`[data-testid="ctr-clause-status-label-${CODE_ACT}"]`)
              .first()
              .textContent()
              .catch(() => '')
          : '';
        j04.notes.push(`F5 status="${(retiredLabel || '').trim()}"`);
        await shot(page, '11-j04-f5-retired');

        // publish panel present ≠ body SoT claim
        const pubPanel = await findAcross(page, '[data-testid="ctr-library-publish-panel"]');
        j04.notes.push(`publish/pull panel visible=${Boolean(pubPanel)} (RETAIN ≠ body SoT)`);

        const nestTotal = R.nest_core_hits.length;
        const physicalMut = physicalClauseMutates();
        const allPhysical = physicalMut.every((h) =>
          /\/contracts-insurance\/contract-clauses/.test(h.url),
        );
        j04.notes.push(
          `nest_core_hits=${nestTotal} physical_mutates=${physicalMut.length} allPhysical=${allPhysical}`,
        );
        j04.notes.push(
          'must_keep CORE08QC1-MSL9BFFE · CORE02QC1-MSL80DU6 · CORE01QC1-MSL6WMS7 RETAIN (no reopen)',
        );
        j04.notes.push(
          'DENY printable true · CORE-08=pillar DONE · note=FR-08 DONE · PREV/VER/PDF/TPL invent DONE',
        );

        if (
          retireHit?.status >= 200 &&
          retireHit?.status < 300 &&
          /Ngừng/i.test(retiredLabel || '') &&
          nestTotal === 0 &&
          allPhysical &&
          physicalMut.length > 0
        ) {
          j04.verdict = 'PASS';
        }
      } else {
        j04.notes.push(`row ${CODE_ACT} not found for retire`);
      }
    }
  } catch (e) {
    R.defects.push({ id: 'R-CORE-09A-RUNTIME', sev: 'P0', note: String(e).slice(0, 400) });
  } finally {
    await browser.close().catch(() => null);
  }

  const allPass = [j01, j02, j03, j04].every((j) => j.verdict === 'PASS');
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = {
    nest_core_hits: R.nest_core_hits.length,
    clause_hits: R.clause_hits.length,
    library_pub_hits: R.library_pub_hits.length,
    codes: { CODE_ACT, CODE_DRAFT, ISSUED_CODE },
    freeze: {
      contractId: FREEZE_CONTRACT_ID,
      pvId: R.l1.freeze_pv_id,
      before: R.l1.freeze_snap_body,
      after: R.l1.freeze_snap_after ?? null,
    },
  };

  if (!allPass) {
    R.residuals.push({
      id: 'R-CORE-09A-J-FAIL',
      sev: 'P0',
      note: [j01, j02, j03, j04]
        .filter((j) => j.verdict !== 'PASS')
        .map((j) => `${j.id}:${j.notes.join('; ')}`)
        .join(' | '),
    });
  } else {
    R.residuals.push({
      id: 'R-FE-CORE-09A-ISSUED-BODY',
      sev: 'P2 OBS',
      note: 'After CONFLICT, activate bumps version but does not apply pending form body (BE RETAIN) — peer residual, not invent this WI',
    });
  }

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        journeys: {
          j01: j01.verdict,
          j02: j02.verdict,
          j03: j03.verdict,
          j04: j04.verdict,
        },
        nest_core_hits: R.nest_core_hits.length,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-CORE-09A-CRASH', sev: 'P0', note: String(e).slice(0, 500) });
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
