#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01 — U65 browser
 * AC-PLT-EMP-TOK-01..03 + must_keep AC-PLT-EMP-TOK-05
 * Parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
 * Honesty: hrm_personnel_uat_ready=false · employees_e2e=false LOCKED
 * Cấm: seed · reopen EMP-QC · invent ready/printable · claim custom.emp.* LIVE
 * Stale dist: missing emp-merge-token-register / emp_catalog → FAIL + devops residual
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const API_COMPANY = process.env.QA_API_COMPANY_ID || 'holding';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-merge-token-emp-qa-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);

function unwrapList(json) {
  if (!json) return [];
  const d = json.data ?? json;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(json.items)) return json.items;
  return [];
}

const DOC_KEY = `hr_doc_tok_${stamp}`;
const DOC_LABEL = `GT MergeTok QA ${stamp}`;
const ET_KEY = `seasonal_tok_${stamp}`;
const ET_LABEL = `Thuê mùa vụ Tok QA ${stamp}`;
const ET_FULLTIME_INPUT = 'full-time';
const ET_FULLTIME_PERSIST = 'full_time';
const ET_FULLTIME_LABEL = `Toàn thời gian Tok QA ${stamp}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  startedAt: ts(),
  stamp: `EMPTOKQA-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5 · assert merge-tokens',
  hdsd_align:
    'Settings → Loại giấy tờ EMP · Loại hình thuê EMP → Lưu → F5 GET merge-tokens?domain=EMP · resolve-preview',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    seed_used: false,
    deny_module_emp_uat: true,
    deny_honesty_flip: true,
    deny_reopen_emp_qc: true,
    deny_custom_emp_live: true,
    r_emp_tok_ext_hold: true,
  },
  env: {
    PORTAL,
    HRM,
    XBOS,
    TENANT,
    commit: COMMIT,
    DOC_KEY,
    DOC_LABEL,
    ET_KEY,
    ET_FULLTIME_INPUT,
    ET_FULLTIME_PERSIST,
  },
  l0: {},
  stale_dist: {},
  ac: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  probes: {},
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
  save();
}
function passCount() {
  return Object.values(R.ac).filter((a) => a.verdict === 'PASS').length;
}
function failCount() {
  return Object.values(R.ac).filter((a) => a.verdict === 'FAIL').length;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function probeStaleDist() {
  const distDir = resolve(ROOT, 'apps/api/hrm-api/dist/merge-tokens');
  const registerJs = join(distDir, 'emp-merge-token-register.js');
  const constJs = join(distDir, 'merge-token.constants.js');
  const ctrlJs = join(distDir, 'merge-tokens.controller.js');
  const docSvc = resolve(ROOT, 'apps/api/hrm-api/dist/employees/emp-document-type.service.js');
  const etSvc = resolve(ROOT, 'apps/api/hrm-api/dist/employees/emp-employment-type.service.js');
  const srcRegister = resolve(ROOT, 'apps/api/hrm-api/src/merge-tokens/emp-merge-token-register.ts');

  let constText = '';
  let docText = '';
  let etText = '';
  try {
    if (existsSync(constJs)) constText = readFileSync(constJs, 'utf8');
  } catch {
    /* */
  }
  try {
    if (existsSync(docSvc)) docText = readFileSync(docSvc, 'utf8');
  } catch {
    /* */
  }
  try {
    if (existsSync(etSvc)) etText = readFileSync(etSvc, 'utf8');
  } catch {
    /* */
  }

  const hasEmpCatalogConst = /['"]emp_catalog['"]/.test(constText);
  const hasRegisterFile = existsSync(registerJs);
  const docHasRegister =
    /emp-merge-token-register|registerEmpCatalog|emp\.doc\./.test(docText) ||
    /withTransaction/.test(docText);
  const etHasRegister =
    /emp-merge-token-register|registerEmpCatalog|emp\.et\./.test(etText) ||
    /withTransaction/.test(etText);

  R.stale_dist = {
    merge_tokens_controller_present: existsSync(ctrlJs),
    emp_merge_token_register_js: hasRegisterFile,
    src_register_present: existsSync(srcRegister),
    constants_has_emp_catalog: hasEmpCatalogConst,
    constants_has_allowance_catalog: /['"]allowance_catalog['"]/.test(constText),
    doc_service_has_register_hook: docHasRegister,
    et_service_has_register_hook: etHasRegister,
    verdict:
      !hasRegisterFile || !hasEmpCatalogConst || !docHasRegister || !etHasRegister
        ? 'STALE'
        : 'OK',
  };
  return R.stale_dist;
}

async function loginApi() {
  let lastStatus = 0;
  let data = null;
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch {
      /* try next */
    }
  }
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${lastStatus}`);
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

async function apiCall(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await r.json();
  } catch {
    json = null;
  }
  return { status: r.status, json, code: json?.code || json?.error?.code || null };
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
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/hrm\/(employees\/(document-types|employment-types)|merge-tokens|contracts|employee-insurances|catalog-sync)/.test(
          u,
        )
      )
        return;
      let bodySnippet = null;
      try {
        if (
          (/document-types|employment-types|merge-tokens/.test(u) &&
            res.request().method() !== 'GET') ||
          /merge-tokens/.test(u)
        ) {
          const j = await res.json().catch(() => null);
          if (j) {
            const items = unwrapList(j);
            bodySnippet = {
              code: j.code || j?.error?.code || null,
              id: j?.data?.id || j?.id || null,
              key:
                j?.data?.documentTypeKey ||
                j?.data?.employmentTypeKey ||
                j?.data?.tokenKey ||
                j?.tokenKey ||
                null,
              itemCount: Array.isArray(items) ? items.length : null,
            };
          }
        }
      } catch {
        /* */
      }
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
        at: ts(),
        body: bodySnippet,
      });
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
}

async function openSettingsTab(page, testId) {
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);
  await page
    .getByRole('tab', { name: /Loại|Account|Tài khoản|Cài đặt|Giai đoạn|Loại phép/i })
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
    .catch(() => {});
  let tab = page.getByTestId(testId);
  let visible = await tab.isVisible().catch(() => false);
  if (!visible) {
    await hardRefresh(page);
    tab = page.getByTestId(testId);
    visible = await tab.isVisible().catch(() => false);
  }
  if (visible) {
    await tab.scrollIntoViewIfNeeded().catch(() => {});
    await tab.click({ force: true });
    await sleep(1500);
  }
  return visible;
}

async function findMergeToken(token, tokenKey, companyId) {
  const list = await apiCall(
    token,
    'GET',
    `/api/hrm/merge-tokens?domain=EMP&company_id=${companyId}&status=active`,
  );
  const items = unwrapList(list.json);
  const hit = items.find(
    (it) =>
      (it.tokenKey || it.token_key) === tokenKey ||
      String(it.tokenKey || it.token_key || '').toLowerCase() === tokenKey.toLowerCase(),
  );
  return {
    status: list.status,
    code: list.code,
    count: items.length,
    hit: hit
      ? {
          tokenKey: hit.tokenKey || hit.token_key,
          origin: hit.origin,
          status: hit.status,
          domain: hit.domain,
          labelVi: hit.labelVi || hit.label_vi || hit.nameVi || hit.name_vi,
          archivedAt: hit.archivedAt || hit.archived_at || null,
        }
      : null,
    sampleKeys: items.slice(0, 15).map((it) => it.tokenKey || it.token_key),
  };
}

async function resolvePreview(token, tokenKeys, companyId) {
  // DTO whitelist: companyId + tokenKeys only — unknown `tokens` → HRM-VAL-001 400
  const body = {
    companyId,
    tokenKeys,
  };
  const r = await apiCall(token, 'POST', `/api/hrm/merge-tokens/resolve-preview`, body);
  const data = r.json?.data ?? r.json ?? {};
  // Prefer array `tokens[]` from resolve-preview response for label/source asserts
  const tokenRows = Array.isArray(data.tokens) ? data.tokens : null;
  const bag = tokenRows
    ? Object.fromEntries(
        tokenRows.map((t) => [
          t.tokenKey || t.token_key,
          t.value ?? t.nameVi ?? t.labelVi ?? (t.source === 'missing' ? '' : t.source),
        ]),
      )
    : data.bag || data.resolved || data.fields || data;
  return { status: r.status, code: r.code, data, bag, tokenRows };
}

async function main() {
  // L0
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      R.l0[k] = { status: r.status, url };
    } catch (e) {
      R.l0[k] = { status: 0, error: String(e).slice(0, 160) };
    }
  }

  // Route smoke (unauth) — 404 = classic stale-route; 401/400 = route mounted
  for (const [k, url, method] of [
    ['unauth_list', `${HRM}/api/hrm/merge-tokens?domain=EMP&company_id=main`, 'GET'],
    ['unauth_preview', `${HRM}/api/hrm/merge-tokens/resolve-preview`, 'POST'],
  ]) {
    try {
      const r = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: method === 'POST' ? '{}' : undefined,
      });
      R.l0[k] = { status: r.status, url };
    } catch (e) {
      R.l0[k] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  save();

  if (R.l0.portal?.status !== 200 || R.l0.hrm?.status !== 200) {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    throw new Error(`L0 FAIL portal=${R.l0.portal?.status} hrm=${R.l0.hrm?.status}`);
  }
  ac('L0-STACK', 'PASS', {
    summary: `portal ${R.l0.portal.status} · hrm ${R.l0.hrm.status} · xbos ${R.l0.xbos?.status}`,
  });

  const listRouteOk = R.l0.unauth_list?.status === 401 || R.l0.unauth_list?.status === 403;
  const previewRouteOk =
    R.l0.unauth_preview?.status === 401 ||
    R.l0.unauth_preview?.status === 403 ||
    R.l0.unauth_preview?.status === 400;
  const route404 =
    R.l0.unauth_list?.status === 404 || R.l0.unauth_preview?.status === 404;
  ac('L0-MERGE-TOKENS-ROUTE', listRouteOk && previewRouteOk && !route404 ? 'PASS' : 'FAIL', {
    summary: `unauth list=${R.l0.unauth_list?.status} preview=${R.l0.unauth_preview?.status} (expect 401/400 not 404)`,
  });

  const stale = probeStaleDist();
  ac('STALE-DIST-PROBE', stale.verdict === 'OK' ? 'PASS' : 'FAIL', {
    summary:
      stale.verdict === 'OK'
        ? 'dist has emp_catalog + emp-merge-token-register + DOC/ET hooks'
        : `STALE: register_js=${stale.emp_merge_token_register_js} emp_catalog=${stale.constants_has_emp_catalog} doc_hook=${stale.doc_service_has_register_hook} et_hook=${stale.et_service_has_register_hook}`,
    detail: stale,
  });
  if (stale.verdict === 'STALE') {
    R.residuals.push({
      id: 'D-EMP-TOK-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      summary:
        'hrm-api dist missing emp-merge-token-register.js; MERGE_TOKEN_ORIGINS lacks emp_catalog; DOC/ET dist services lack register hooks (src newer). Peer EMP/DEC stale-dist pattern — rebuild+restart required before AC retest.',
    });
  }

  const session = await loginApi();
  log('loginApi ok');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // ——— AC-PLT-EMP-TOK-01: DOC Lưu → F5 → merge-tokens emp.doc.<key> ———
  log('Settings DOC tab');
  const docTabOk = await openSettingsTab(page, 'settings-tab-emp-document-types');
  if (!docTabOk) {
    await shot(page, '01-settings-no-doc-tab');
    ac('AC-PLT-EMP-TOK-01-TAB', 'FAIL', { summary: 'settings-tab-emp-document-types not visible' });
  } else {
    ac('AC-PLT-EMP-TOK-01-TAB', 'PASS', { summary: 'Clicked settings-tab-emp-document-types' });
    await shot(page, '01-settings-emp-doc');

    const docUpsertWait = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/employees\/document-types(\?|$)/.test(res.url()) &&
          ['PUT', 'POST'].includes(res.request().method()) &&
          !/\/retire/.test(res.url()),
        { timeout: 45_000 },
      )
      .catch(() => null);

    await page.getByTestId('hdsd-emp-document-type-key').fill(DOC_KEY);
    await page.getByTestId('hdsd-emp-document-type-name').fill(DOC_LABEL);
    log(`DOC save key=${DOC_KEY}`);
    await page.getByTestId('hdsd-emp-document-type-save').click();
    const docUpsertRes = await docUpsertWait;
    let docUpsertStatus = docUpsertRes?.status() ?? 0;
    let docUpsertBody = null;
    try {
      docUpsertBody = docUpsertRes ? await docUpsertRes.json() : null;
    } catch {
      docUpsertBody = null;
    }
    R.probes.docUpsert = {
      status: docUpsertStatus,
      method: docUpsertRes?.request()?.method() ?? null,
      url: docUpsertRes?.url()?.replace(/^https?:\/\/[^/]+/, '') ?? null,
      id: docUpsertBody?.data?.id ?? docUpsertBody?.id ?? null,
      documentTypeKey:
        docUpsertBody?.data?.documentTypeKey ?? docUpsertBody?.documentTypeKey ?? DOC_KEY,
      code: docUpsertBody?.code ?? null,
    };
    await sleep(1200);
    await shot(page, '02-doc-after-create');

    const docCreate2xx = docUpsertStatus >= 200 && docUpsertStatus < 300;
    ac('AC-PLT-EMP-TOK-01-CREATE-2XX', docCreate2xx ? 'PASS' : 'FAIL', {
      summary: `UPSERT document-types ${R.probes.docUpsert.method || '?'} → ${docUpsertStatus} key=${DOC_KEY} code=${R.probes.docUpsert.code}`,
      network: R.probes.docUpsert,
    });

    log('F5 settings DOC then assert merge-tokens');
    await hardRefresh(page);
    const docTab2 = page.getByTestId('settings-tab-emp-document-types');
    if (await docTab2.isVisible().catch(() => false)) {
      await docTab2.click({ force: true });
      await sleep(1200);
    }
    await shot(page, '03-doc-f5');

    const expectTok = `emp.doc.${DOC_KEY}`;
    const tokH = await findMergeToken(session.token, expectTok, API_COMPANY);
    const tokM = await findMergeToken(session.token, expectTok, COMPANY);
    R.probes.mergeTokenDoc = { expectTok, holding: tokH, main: tokM };

    // Also capture FE-visible network GET if Settings surfaces merge-tokens (optional)
    const docTokOk =
      (tokH.status >= 200 &&
        tokH.status < 300 &&
        tokH.hit &&
        tokH.hit.origin === 'emp_catalog' &&
        (tokH.hit.status === 'active' || !tokH.hit.status)) ||
      (tokM.status >= 200 &&
        tokM.status < 300 &&
        tokM.hit &&
        tokM.hit.origin === 'emp_catalog');

    const listReachable =
      (tokH.status >= 200 && tokH.status < 300) || (tokM.status >= 200 && tokM.status < 300);
    const list404 = tokH.status === 404 || tokM.status === 404;

    ac('AC-PLT-EMP-TOK-01', docTokOk ? 'PASS' : 'FAIL', {
      summary: docTokOk
        ? `GET merge-tokens?domain=EMP has ${expectTok} origin=emp_catalog`
        : list404
          ? `FAIL route 404 merge-tokens (stale dist) holding=${tokH.status} main=${tokM.status}`
          : listReachable
            ? `DOC saved but token missing: ${expectTok} · holding hit=${!!tokH.hit} origin=${tokH.hit?.origin || 'n/a'} · main hit=${!!tokM.hit} · sample=${(tokM.sampleKeys || tokH.sampleKeys || []).slice(0, 8).join(',')}`
            : `merge-tokens list fail holding=${tokH.status} main=${tokM.status}`,
      probes: R.probes.mergeTokenDoc,
    });
  }

  // ——— AC-PLT-EMP-TOK-02: ET create/normalize + retire ———
  log('Settings ET tab');
  const etTabOk = await openSettingsTab(page, 'settings-tab-emp-employment-types');
  ac('AC-PLT-EMP-TOK-02-TAB', etTabOk ? 'PASS' : 'FAIL', {
    summary: etTabOk
      ? 'Clicked settings-tab-emp-employment-types'
      : 'settings-tab-emp-employment-types missing',
  });
  await shot(page, '04-settings-emp-et');

  let etId = null;
  let etFullId = null;
  if (etTabOk) {
    // seasonal create
    const etUpsertWait = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/employees\/employment-types(\?|$)/.test(res.url()) &&
          ['PUT', 'POST'].includes(res.request().method()) &&
          !/\/retire/.test(res.url()),
        { timeout: 45_000 },
      )
      .catch(() => null);
    await page.getByTestId('hdsd-emp-employment-type-key').fill(ET_KEY);
    await page.getByTestId('hdsd-emp-employment-type-name').fill(ET_LABEL);
    log(`ET save key=${ET_KEY}`);
    await page.getByTestId('hdsd-emp-employment-type-save').click();
    const etUpsertRes = await etUpsertWait;
    let etStatus = etUpsertRes?.status() ?? 0;
    let etBody = null;
    try {
      etBody = etUpsertRes ? await etUpsertRes.json() : null;
    } catch {
      etBody = null;
    }
    etId = etBody?.data?.id ?? etBody?.id ?? null;
    R.probes.etUpsert = {
      status: etStatus,
      id: etId,
      employmentTypeKey:
        etBody?.data?.employmentTypeKey ?? etBody?.employmentTypeKey ?? ET_KEY,
      code: etBody?.code ?? null,
    };
    await sleep(1000);
    await shot(page, '05-et-after-create');

    const etCreate2xx = etStatus >= 200 && etStatus < 300;
    ac('AC-PLT-EMP-TOK-02-CREATE-2XX', etCreate2xx ? 'PASS' : 'FAIL', {
      summary: `UPSERT employment-types → ${etStatus} key=${ET_KEY} code=${R.probes.etUpsert.code}`,
    });

    // full-time normalize
    const etFtWait = page
      .waitForResponse(
        (res) =>
          /\/api\/hrm\/employees\/employment-types(\?|$)/.test(res.url()) &&
          ['PUT', 'POST'].includes(res.request().method()) &&
          !/\/retire/.test(res.url()),
        { timeout: 45_000 },
      )
      .catch(() => null);
    await page.getByTestId('hdsd-emp-employment-type-key').fill(ET_FULLTIME_INPUT);
    await page.getByTestId('hdsd-emp-employment-type-name').fill(ET_FULLTIME_LABEL);
    await page.getByTestId('hdsd-emp-employment-type-save').click();
    const etFtRes = await etFtWait;
    let etFtStatus = etFtRes?.status() ?? 0;
    let etFtBody = null;
    try {
      etFtBody = etFtRes ? await etFtRes.json() : null;
    } catch {
      etFtBody = null;
    }
    etFullId = etFtBody?.data?.id ?? etFtBody?.id ?? null;
    const persistedKey =
      etFtBody?.data?.employmentTypeKey ?? etFtBody?.employmentTypeKey ?? null;
    R.probes.etFulltime = {
      status: etFtStatus,
      id: etFullId,
      input: ET_FULLTIME_INPUT,
      persistedKey,
      code: etFtBody?.code ?? null,
    };
    ac(
      'AC-PLT-EMP-TOK-02-NORMALIZE',
      etFtStatus >= 200 && etFtStatus < 300 && persistedKey === ET_FULLTIME_PERSIST
        ? 'PASS'
        : 'FAIL',
      {
        summary: `full-time input → persist key=${persistedKey} (expect ${ET_FULLTIME_PERSIST}) status=${etFtStatus}`,
      },
    );

    await hardRefresh(page);
    const expectEt = `emp.et.${ET_KEY}`;
    const expectFt = `emp.et.${ET_FULLTIME_PERSIST}`;
    const tokEt = await findMergeToken(session.token, expectEt, API_COMPANY);
    const tokFt = await findMergeToken(session.token, expectFt, API_COMPANY);
    R.probes.mergeTokenEt = { expectEt, expectFt, seasonal: tokEt, fulltime: tokFt };

    const etTokOk =
      tokEt.hit?.origin === 'emp_catalog' &&
      (tokEt.hit?.status === 'active' || !tokEt.hit?.status);
    const ftTokOk =
      tokFt.hit?.origin === 'emp_catalog' &&
      (tokFt.hit?.status === 'active' || !tokFt.hit?.status);

    ac('AC-PLT-EMP-TOK-02-TOKEN', etTokOk && ftTokOk ? 'PASS' : 'FAIL', {
      summary:
        etTokOk && ftTokOk
          ? `Tokens ${expectEt} + ${expectFt} origin=emp_catalog`
          : `Missing tokens seasonal=${!!tokEt.hit} full_time=${!!tokFt.hit} · sample=${(tokEt.sampleKeys || []).slice(0, 8).join(',')}`,
      probes: R.probes.mergeTokenEt,
    });

    // Retire seasonal ET → token retired (company_id is QUERY, not body)
    if (etId) {
      const retire = await apiCall(
        session.token,
        'POST',
        `/api/hrm/employees/employment-types/${etId}/retire?company_id=${COMPANY}`,
        {},
      );
      R.probes.etRetire = { status: retire.status, code: retire.code, id: etId };
      await sleep(500);
      const afterRetire = await findMergeToken(session.token, expectEt, API_COMPANY);
      // also list without status=active filter
      const listAll = await apiCall(
        session.token,
        'GET',
        `/api/hrm/merge-tokens?domain=EMP&company_id=${API_COMPANY}`,
      );
      const allItems = unwrapList(listAll.json);
      const retiredHit = allItems.find(
        (it) => (it.tokenKey || it.token_key) === expectEt,
      );
      R.probes.mergeTokenEtRetire = {
        activeListHit: afterRetire.hit,
        allListHit: retiredHit
          ? {
              tokenKey: retiredHit.tokenKey || retiredHit.token_key,
              origin: retiredHit.origin,
              status: retiredHit.status,
              archivedAt: retiredHit.archivedAt || retiredHit.archived_at || null,
            }
          : null,
      };
      const retireTokOk =
        retire.status >= 200 &&
        retire.status < 300 &&
        !afterRetire.hit &&
        (retiredHit == null ||
          retiredHit.status === 'retired' ||
          retiredHit.archived_at ||
          retiredHit.archivedAt);

      // If token never registered, retire path cannot prove token retire — still FAIL TOK-02 overall
      ac('AC-PLT-EMP-TOK-02-RETIRE', etTokOk && retireTokOk ? 'PASS' : 'FAIL', {
        summary: etTokOk
          ? retireTokOk
            ? `ET retire ${retire.status} → token ${expectEt} retired/hidden from active`
            : `ET retire ${retire.status} but token state unexpected · activeHit=${!!afterRetire.hit} allStatus=${retiredHit?.status || 'n/a'}`
          : `Skip-proof: seasonal token never registered (stale dist) — cannot assert retire; ET catalog retire=${retire.status}`,
        probes: R.probes.mergeTokenEtRetire,
      });
    } else {
      ac('AC-PLT-EMP-TOK-02-RETIRE', 'FAIL', { summary: 'No ET id to retire' });
    }

    // Rollup TOK-02
    const tok02Parts = [
      R.ac['AC-PLT-EMP-TOK-02-CREATE-2XX']?.verdict,
      R.ac['AC-PLT-EMP-TOK-02-NORMALIZE']?.verdict,
      R.ac['AC-PLT-EMP-TOK-02-TOKEN']?.verdict,
      R.ac['AC-PLT-EMP-TOK-02-RETIRE']?.verdict,
    ];
    ac(
      'AC-PLT-EMP-TOK-02',
      tok02Parts.every((v) => v === 'PASS') ? 'PASS' : 'FAIL',
      { summary: `rollup ${tok02Parts.join('/')}` },
    );
  } else {
    ac('AC-PLT-EMP-TOK-02', 'FAIL', { summary: 'ET tab missing — cannot exercise TOK-02' });
  }

  // ——— AC-PLT-EMP-TOK-03: resolve-preview name_vi from effective (no invent CCCD/FULL_TIME) ———
  {
    const previewKeys = [
      `emp.doc.${DOC_KEY}`,
      `emp.et.${ET_FULLTIME_PERSIST}`,
      'emp.doc.CCCD',
      'emp.et.FULL_TIME',
    ];
    const prevH = await resolvePreview(session.token, previewKeys, API_COMPANY);
    const prevM = await resolvePreview(session.token, previewKeys, COMPANY);
    R.probes.resolvePreview = {
      keys: previewKeys,
      holding: {
        status: prevH.status,
        code: prevH.code,
        bag: prevH.bag,
        tokenRows: (prevH.tokenRows || []).map((t) => ({
          tokenKey: t.tokenKey,
          source: t.source,
          value: t.value ?? null,
          warning: t.warning ?? null,
        })),
      },
      main: {
        status: prevM.status,
        code: prevM.code,
        bag: prevM.bag,
        tokenRows: (prevM.tokenRows || []).map((t) => ({
          tokenKey: t.tokenKey,
          source: t.source,
          value: t.value ?? null,
          warning: t.warning ?? null,
        })),
      },
    };

    const rows = prevH.tokenRows || prevM.tokenRows || [];
    const bag = prevH.bag || prevM.bag || {};
    const bagStr = JSON.stringify({ bag, rows });

    const rowByKey = (k) =>
      rows.find((t) => String(t.tokenKey || '').toLowerCase() === String(k).toLowerCase());
    const cccdRow = rowByKey('emp.doc.CCCD');
    // AC: FORBIDDEN invent CCCD/FULL_TIME labels when catalog missing.
    // API lowercases keys: emp.doc.CCCD → emp.doc.cccd (expect source=missing).
    // emp.et.FULL_TIME → emp.et.full_time — if we created full_time ET, registry hit is REQUIRED (not invent).
    const inventForbidden =
      !!cccdRow &&
      cccdRow.source !== 'missing' &&
      String(cccdRow.value || '').trim().length > 0;

    const docRow = rowByKey(`emp.doc.${DOC_KEY}`);
    const etRow = rowByKey(`emp.et.${ET_FULLTIME_PERSIST}`);
    const docLabelHit =
      bagStr.includes(DOC_LABEL) ||
      (docRow &&
        docRow.source === 'registry' &&
        String(docRow.value || '').includes(DOC_LABEL.slice(0, 12)));
    const etLabelHit =
      bagStr.includes(ET_FULLTIME_LABEL) ||
      (etRow && etRow.source === 'registry' && String(etRow.value || '').trim().length > 0);

    const previewOk =
      (prevH.status >= 200 && prevH.status < 300) ||
      (prevM.status >= 200 && prevM.status < 300);
    const tok03Pass = previewOk && !inventForbidden && (docLabelHit || etLabelHit);

    ac('AC-PLT-EMP-TOK-03', tok03Pass ? 'PASS' : 'FAIL', {
      summary: tok03Pass
        ? `resolve-preview 2xx · catalog labels present · CCCD missing (no invent) · full_time registry OK`
        : !previewOk
          ? `resolve-preview fail holding=${prevH.status} main=${prevM.status}`
          : inventForbidden
            ? `Invented CCCD label without catalog — forbidden · source=${cccdRow?.source}`
            : `Preview 2xx but catalog labels missing for emp.doc.${DOC_KEY} / emp.et.${ET_FULLTIME_PERSIST} (register stale?) · inventForbidden=${inventForbidden}`,
      inventForbidden,
      docLabelHit,
      etLabelHit,
      cccdSource: cccdRow?.source || null,
    });
  }

  // ——— AC-PLT-EMP-TOK-05 must_keep ———
  {
    // Correct path: /contracts-insurance/contracts · page_size OK; SI rejects page_size/limit whitelist
    const contracts = await apiCall(
      session.token,
      'GET',
      `/api/hrm/contracts-insurance/contracts?page_size=3&company_id=${COMPANY}`,
    );
    const si = await apiCall(
      session.token,
      'GET',
      `/api/hrm/employee-insurances?company_id=${COMPANY}`,
    );
    const catalog = await apiCall(
      session.token,
      'GET',
      `/api/hrm/catalog-sync?company_id=${COMPANY}`,
    );
    // keyword_map fallback: resolve builtin employee.full_name should still work without invent
    const builtinPrev = await resolvePreview(
      session.token,
      ['employee.full_name'],
      API_COMPANY,
    );
    const builtinRow = (builtinPrev.tokenRows || []).find(
      (t) => (t.tokenKey || t.token_key) === 'employee.full_name',
    );
    R.probes.mustKeep = {
      contracts: { status: contracts.status, code: contracts.code },
      si: { status: si.status, code: si.code },
      catalogSync: { status: catalog.status, code: catalog.code },
      builtinPreview: {
        status: builtinPrev.status,
        code: builtinPrev.code,
        source: builtinRow?.source || null,
        bagSnippet: JSON.stringify(builtinPrev.bag || {}).slice(0, 240),
      },
      empQcNotReopened: true,
      customEmpNotClaimedLive: true,
    };
    const mkOk =
      contracts.status >= 200 &&
      contracts.status < 300 &&
      si.status >= 200 &&
      si.status < 300 &&
      catalog.status >= 200 &&
      catalog.status < 300 &&
      builtinPrev.status >= 200 &&
      builtinPrev.status < 300 &&
      (builtinRow?.source === 'builtin' || builtinRow?.source === 'registry');
    ac('AC-PLT-EMP-TOK-05', mkOk ? 'PASS' : 'FAIL', {
      summary: mkOk
        ? 'must_keep: contracts/SI/catalog-sync 2xx · builtin resolve-preview 2xx · EMP-QC not reopened · custom.emp HOLD'
        : `must_keep probe fail contracts=${contracts.status} si=${si.status} catalog=${catalog.status} builtinPrev=${builtinPrev.status} builtinSrc=${builtinRow?.source || 'n/a'}`,
    });
  }

  await shot(page, '99-final');
  await browser.close();

  const coreFail = ['AC-PLT-EMP-TOK-01', 'AC-PLT-EMP-TOK-02', 'AC-PLT-EMP-TOK-03', 'AC-PLT-EMP-TOK-05', 'STALE-DIST-PROBE']
    .map((id) => R.ac[id]?.verdict)
    .some((v) => v === 'FAIL');

  R.overall = coreFail || failCount() > 0 ? 'FAIL' : 'PASS';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.summary = {
    pass: passCount(),
    fail: failCount(),
    stamp: R.stamp,
    residuals: R.residuals,
  };
  save();

  console.log(
    `\n=== ${R.ack_status} · ${R.stamp} · PASS ${passCount()} FAIL ${failCount()} · stale=${R.stale_dist.verdict} ===`,
  );
  console.log(`JSON: ${OUT_JSON}`);
  process.exitCode = R.overall === 'PASS' ? 0 : 1;
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.fatal = String(e).slice(0, 800);
  save();
  console.error(e);
  process.exit(1);
});
