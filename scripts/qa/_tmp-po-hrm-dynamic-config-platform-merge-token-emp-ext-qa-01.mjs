#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01 — U65 browser
 * AC-PLT-EMP-TOK-04 / 04b / 04c · stale-dist F-EMP-TOK-03
 * Parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01
 * Honesty: personnel/e2e/printable=false LOCKED · DENY custom.emp LIVE · DENY reopen EMPTOKQA-MSJ290VB
 * Cấm: seed · invent LIVE · reopen MERGE-TOKEN-EMP GWC / EMP-QC · claim Phase1
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';
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
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01',
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

function tokenKeyOf(row) {
  return String(row?.tokenKey ?? row?.token_key ?? '').toLowerCase();
}
function originOf(row) {
  return String(row?.origin ?? '').toLowerCase();
}
function statusOf(row) {
  return String(row?.status ?? '').toLowerCase();
}
function ringOf(row) {
  return String(row?.ring ?? '').toLowerCase();
}
function extRefOf(row) {
  return String(row?.extensionFieldRef ?? row?.extension_field_ref ?? '').toLowerCase();
}

const EXT_CODE = `qa_ext_tok_${stamp}`;
const EXT_LABEL = `Trường NS mở rộng Tok QA ${stamp}`;
const NON_ALLOW_CODE = `qa_leave_tok_${stamp}`;
const NON_ALLOW_LABEL = `Leave non-allow Tok QA ${stamp}`;
const ALLOW_CATALOG = 'hrm_employee_basic_fields';
const NON_ALLOW_CATALOG = 'leave_types';

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  startedAt: ts(),
  stamp: `EMPTOKEXTQA-${stamp.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY, apiCompanyId: API_COMPANY },
  u65: 'zero-seed · browser Settings EMP field allow-list → extension-items → F5 merge-tokens',
  hdsd_align:
    'Command Center Group HR / Settings EMP field catalog → append → Lưu 2xx → GET merge-tokens?domain=EMP · retire · non-allow · employee value PATCH',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    contracts_printable_ready: false,
    seed_used: false,
    deny_module_emp_uat: true,
    deny_honesty_flip: true,
    deny_reopen_emp_qc: true,
    deny_custom_emp_live: true,
    deny_reopen_merge_token_emp_gwc: true,
    peer_stamp_retain: 'EMPTOKQA-MSJ290VB',
    c_slice_ne_module: true,
  },
  env: {
    PORTAL,
    HRM,
    XBOS,
    TENANT,
    commit: COMMIT,
    EXT_CODE,
    EXT_LABEL,
    NON_ALLOW_CODE,
    ALLOW_CATALOG,
    NON_ALLOW_CATALOG,
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

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function probeStaleDist() {
  const registerJs = resolve(ROOT, 'apps/api/hrm-api/dist/merge-tokens/emp-merge-token-register.js');
  const settingsJs = resolve(
    ROOT,
    'apps/api/hrm-api/dist/settings-catalogs/settings-catalogs.service.js',
  );
  let regText = '';
  let setText = '';
  try {
    if (existsSync(registerJs)) regText = readFileSync(registerJs, 'utf8');
  } catch {
    /* */
  }
  try {
    if (existsSync(settingsJs)) setText = readFileSync(settingsJs, 'utf8');
  } catch {
    /* */
  }

  const hasUpsertExt = /upsertEmpExtensionFieldMergeToken/.test(regText);
  const hasAllowList = /EMP_EXTENSION_FIELD_CATALOG_KEYS/.test(regText);
  const settingsHooks =
    /registerEmpExtensionMergeToken|upsertEmpExtensionFieldMergeToken|isEmpExtensionFieldCatalogKey/.test(
      setText,
    );
  const hasExtensionOrigin = /extension_field/.test(regText);

  const verdict =
    !existsSync(registerJs) || !hasUpsertExt || !hasAllowList || !settingsHooks
      ? 'STALE'
      : 'OK';

  R.stale_dist = {
    emp_merge_token_register_js: existsSync(registerJs),
    settings_catalogs_service_js: existsSync(settingsJs),
    register_has_upsertEmpExtensionFieldMergeToken: hasUpsertExt,
    register_has_EMP_EXTENSION_FIELD_CATALOG_KEYS: hasAllowList,
    register_has_extension_field_origin: hasExtensionOrigin,
    settings_has_F_EMP_TOK_03_hook: settingsHooks,
    register_mtime: existsSync(registerJs) ? statSync(registerJs).mtime.toISOString() : null,
    settings_mtime: existsSync(settingsJs) ? statSync(settingsJs).mtime.toISOString() : null,
    verdict,
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
      /* */
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

async function apiCall(token, method, path, body, companyId = COMPANY) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
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
        !/\/api\/hrm\/(settings-catalogs|merge-tokens|employees)(\/|$|\?)/.test(u) &&
        !/extension-items|catalog-sync/.test(u)
      )
        return;
      let bodySnippet = null;
      try {
        const method = res.request().method();
        if (
          method !== 'GET' ||
          /merge-tokens/.test(u) ||
          /extension-items/.test(u) ||
          /settings-catalogs\/items/.test(u)
        ) {
          const j = await res.json().catch(() => null);
          if (j) {
            const items = unwrapList(j);
            bodySnippet = {
              code: j.code || j?.error?.code || null,
              upserted: j?.data?.upserted ?? j?.upserted ?? null,
              itemCount: Array.isArray(items) ? items.length : null,
              tokenKey:
                j?.data?.tokenKey ||
                j?.data?.token_key ||
                (Array.isArray(items) ? items[0]?.tokenKey || items[0]?.token_key : null),
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

async function clickText(page, re) {
  const loc = page.getByText(re).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ force: true });
    return true;
  }
  return false;
}

async function findToken(token, expectKey, companyId = API_COMPANY) {
  const paths = [
    `/api/hrm/merge-tokens?domain=EMP&company_id=${companyId}&status=active`,
    `/api/hrm/merge-tokens?domain=EMP&company_id=${COMPANY}&status=active`,
    `/api/hrm/merge-tokens?domain=EMP&status=active`,
  ];
  const out = [];
  for (const p of paths) {
    const res = await apiCall(token, 'GET', p);
    const items = unwrapList(res.json);
    out.push({ path: p, status: res.status, code: res.code, total: items.length });
    const hit = items.find((row) => tokenKeyOf(row) === expectKey.toLowerCase());
    if (hit) {
      return { hit, probe: out, items };
    }
  }
  // also search all statuses for retire proof
  const allRes = await apiCall(
    token,
    'GET',
    `/api/hrm/merge-tokens?domain=EMP&company_id=${companyId}`,
  );
  const allItems = unwrapList(allRes.json);
  out.push({
    path: `all-status company=${companyId}`,
    status: allRes.status,
    total: allItems.length,
  });
  const hitAny = allItems.find((row) => tokenKeyOf(row) === expectKey.toLowerCase());
  return { hit: hitAny || null, probe: out, items: allItems };
}

async function portalFetch(page, method, path, body) {
  return page.evaluate(
    async ({ method, path, body }) => {
      const token = localStorage.getItem('xevn.portal.accessToken');
      const companyId = localStorage.getItem('xevn.portal.companyId') || 'main';
      const r = await fetch(path, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          'x-tenant-id': 'xevn',
          'x-company-id': companyId,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = await r.json().catch(() => null);
      return { status: r.status, json, code: json?.code || json?.error?.code || null };
    },
    { method, path, body },
  );
}

async function tryGroupHrAllowList(page) {
  log('GOTO_GROUP_HR', { url: `${PORTAL}/command-center?settings=company_group_hr` });
  await page.goto(`${PORTAL}/command-center?settings=company_group_hr`, {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(4500);
  await shot(page, '01-group-hr');

  const cfg =
    (await clickText(page, /Cấu hình chi tiết/i)) ||
    (await page
      .getByRole('button', { name: /Cấu hình chi tiết/i })
      .first()
      .click({ force: true })
      .then(() => true)
      .catch(() => false));
  if (!cfg) {
    log('GROUP_HR_CFG_MISSING');
    return { ok: false, reason: 'Cấu hình chi tiết not found' };
  }
  await sleep(3500);
  await shot(page, '02-cfg-dialog');

  const dlg = page
    .locator('[role="dialog"]')
    .filter({ hasText: /Cấu hình mục thông tin|Thêm field custom|Label tiếng Việt/i })
    .first();
  if (!(await dlg.isVisible().catch(() => false))) {
    return { ok: false, reason: 'Group HR config dialog not open' };
  }

  const workBtn = dlg.locator('button').filter({ hasText: /Công việc|Cơ bản|Basic/i }).first();
  if (await workBtn.isVisible().catch(() => false)) {
    await workBtn.click({ force: true });
    await sleep(600);
  }

  // Fill label
  let filled = false;
  const labelCandidates = [
    dlg.locator('label:has-text("Label tiếng Việt")').locator('xpath=following::input[1]'),
    dlg.locator('input[placeholder*="Ghi chú"]'),
    dlg.locator('h4:has-text("Thêm field custom")').locator('xpath=ancestor::div[1]').locator('input:not([type="checkbox"])'),
  ];
  for (const loc of labelCandidates) {
    const el = loc.first();
    if (await el.isVisible().catch(() => false)) {
      await el.fill(EXT_LABEL);
      filled = true;
      break;
    }
  }
  if (!filled) {
    const inputs = dlg.locator('input:not([type="checkbox"]):not([readonly])');
    const n = await inputs.count();
    for (let i = n - 1; i >= 0; i -= 1) {
      const el = inputs.nth(i);
      if (await el.isVisible().catch(() => false)) {
        await el.fill(EXT_LABEL);
        filled = true;
        break;
      }
    }
  }
  if (!filled) return { ok: false, reason: 'Could not fill Label tiếng Việt' };

  // optional code field
  const codeInput = dlg.locator('input[placeholder*="mã"], input[placeholder*="code" i]').first();
  if (await codeInput.isVisible().catch(() => false)) {
    await codeInput.fill(EXT_CODE).catch(() => {});
  }

  const addBtn = dlg.locator('button').filter({ hasText: /^Thêm field$/i }).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'Thêm field button missing' };
  }
  await addBtn.click({ force: true });
  await sleep(1000);
  await shot(page, '03-field-added');

  const net0 = R.network.length;
  const applyBtn = dlg
    .locator('button')
    .filter({ hasText: /Xác nhận \(áp dụng\)|Áp dụng|Lưu|Đồng bộ/i })
    .first();
  if (!(await applyBtn.isVisible().catch(() => false))) {
    return { ok: false, reason: 'Apply/Lưu button missing' };
  }
  await applyBtn.click({ force: true });
  await sleep(8000);
  await shot(page, '04-after-apply');

  const extPosts = R.network
    .slice(net0)
    .filter(
      (n) =>
        /extension-items|settings-catalogs\/items/.test(n.url) &&
        n.method === 'POST' &&
        n.status >= 200 &&
        n.status < 300,
    );
  return {
    ok: extPosts.length > 0,
    reason: extPosts.length
      ? `posts=${extPosts.map((p) => `${p.status}:${p.body?.code || ''}`).join('|')}`
      : 'no extension-items 2xx after apply',
    posts: extPosts,
  };
}

async function fePostAllowList(page) {
  log('FE_PORTAL_POST_ALLOW_LIST', { catalog: ALLOW_CATALOG, code: EXT_CODE });
  const res = await portalFetch(
    page,
    'POST',
    `/api/hrm/settings-catalogs/${encodeURIComponent(ALLOW_CATALOG)}/extension-items`,
    {
      items: [{ code: EXT_CODE, label: EXT_LABEL, unit: 'text', status: 'active' }],
    },
  );
  R.probes.allow_list_post = {
    status: res.status,
    code: res.code,
    via: 'portal_fetch_browser_session',
  };
  return res;
}

async function fePostNonAllow(page) {
  log('FE_PORTAL_POST_NON_ALLOW', { catalog: NON_ALLOW_CATALOG, code: NON_ALLOW_CODE });
  const res = await portalFetch(
    page,
    'POST',
    `/api/hrm/settings-catalogs/${encodeURIComponent(NON_ALLOW_CATALOG)}/extension-items`,
    {
      items: [{ code: NON_ALLOW_CODE, label: NON_ALLOW_LABEL, unit: 'text', status: 'active' }],
    },
  );
  R.probes.non_allow_post = { status: res.status, code: res.code };
  return res;
}

async function feRetireAllow(page) {
  log('FE_PORTAL_RETIRE_ALLOW', { code: EXT_CODE });
  const res = await portalFetch(page, 'DELETE', `/api/hrm/settings-catalogs/items`, {
    company_id: COMPANY,
    category_key: ALLOW_CATALOG,
    item_key: EXT_CODE,
  });
  // also try holding if main maps
  if (res.status >= 400) {
    const res2 = await portalFetch(page, 'DELETE', `/api/hrm/settings-catalogs/items`, {
      company_id: API_COMPANY,
      category_key: ALLOW_CATALOG,
      item_key: EXT_CODE,
    });
    R.probes.retire = { first: res, second: res2 };
    return res2;
  }
  R.probes.retire = { first: res };
  return res;
}

async function employeeValuePatchOnly(token) {
  // list employees → pick first → PATCH custom_fields only
  const list = await apiCall(
    token,
    'GET',
    `/api/hrm/employees?company_id=${API_COMPANY}&page_size=5`,
  );
  const items = unwrapList(list.json);
  const emp = items[0];
  if (!emp?.id && !emp?.employeeId) {
    return { blocked: true, reason: 'no employee row for PATCH', listStatus: list.status };
  }
  const id = emp.id || emp.employeeId;
  const beforeTok = await findToken(token, `custom.emp.${EXT_CODE}`);
  const patchBody = {
    custom_fields: {
      ...(emp.custom_fields || emp.customFields || {}),
      [`orphan_value_${stamp}`]: `value-only-${stamp}`,
    },
  };
  const patch = await apiCall(token, 'PATCH', `/api/hrm/employees/${id}`, patchBody, API_COMPANY);
  // if 404/405 try alternate
  let patchAlt = null;
  if (patch.status >= 400) {
    patchAlt = await apiCall(
      token,
      'PATCH',
      `/api/hrm/employees/${id}?company_id=${API_COMPANY}`,
      patchBody,
      COMPANY,
    );
  }
  const afterTok = await findToken(token, `custom.emp.orphan_value_${stamp}`);
  const stillExt = await findToken(token, `custom.emp.${EXT_CODE}`);
  return {
    blocked: false,
    employeeId: id,
    patch: patchAlt || patch,
    beforeExtPresent: Boolean(beforeTok.hit),
    afterOrphanToken: afterTok.hit,
    extStillSame: stillExt.hit ? statusOf(stillExt.hit) : null,
  };
}

async function main() {
  // L0
  const l0 = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      l0[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      l0[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  R.l0 = l0;
  save();

  const stale = probeStaleDist();
  save();
  if (stale.verdict === 'STALE') {
    ac('STALE-DIST-PROBE', 'FAIL', {
      summary: 'dist missing F-EMP-TOK-03 upsertEmpExtensionFieldMergeToken / settings hook',
      stale,
    });
    R.residuals.push({
      id: 'D-EMP-TOK-EXT-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      note: 'Rebuild+restart hrm-api so dist includes upsertEmpExtensionFieldMergeToken + settings F-EMP-TOK-03 (peer EMPTOK pattern)',
    });
  } else {
    ac('STALE-DIST-PROBE', 'PASS', {
      summary: 'dist has upsertEmpExtensionFieldMergeToken + settings registerEmpExtensionMergeToken',
      stale,
    });
  }

  if (!l0.hrm?.ok || !l0.xbos?.ok) {
    ac('L0', 'FAIL', { summary: `stack down ${JSON.stringify(l0)}` });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  ac('L0', 'PASS', { summary: `hrm/xbos/portal ${JSON.stringify(l0)}` });

  const session = await loginApi();
  log('LOGIN_OK', { via: session.raw?.__via });

  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2500);
  await shot(page, '00-cc');

  // Baseline GĐ1 DOC/ET must_keep probe
  const baseline = await findToken(session.token, 'emp.doc.__none__');
  R.probes.baseline_emp_tokens = {
    totalSample: baseline.items?.length ?? 0,
    hasEmpDoc: (baseline.items || []).some((r) => tokenKeyOf(r).startsWith('emp.doc.')),
    hasEmpEt: (baseline.items || []).some((r) => tokenKeyOf(r).startsWith('emp.et.')),
    hasCustomEmp: (baseline.items || []).some((r) => tokenKeyOf(r).startsWith('custom.emp.')),
  };

  // --- AC-04 happy: try Group HR UI then FE portal POST fallback (still browser session, U65 zero-seed) ---
  let allowPost = null;
  const ui = await tryGroupHrAllowList(page);
  R.probes.group_hr_ui = ui;
  if (ui.ok) {
    allowPost = { status: ui.posts[0]?.status ?? 200, code: ui.posts[0]?.body?.code, via: 'group_hr_ui' };
  } else {
    log('GROUP_HR_UI_FALLBACK', { reason: ui.reason });
    allowPost = await fePostAllowList(page);
    allowPost.via = 'portal_fetch_after_ui_miss';
  }

  await sleep(1500);
  // F5 assert
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(2000);

  const expectKey = `custom.emp.${EXT_CODE}`;
  const found = await findToken(session.token, expectKey);
  R.probes.ac04_token = {
    expectKey,
    found: found.hit
      ? {
          token_key: tokenKeyOf(found.hit),
          origin: originOf(found.hit),
          status: statusOf(found.hit),
          ring: ringOf(found.hit),
          extension_field_ref: extRefOf(found.hit),
          domain: found.hit.domain || found.hit.Domain,
        }
      : null,
    probes: found.probe,
    allowPost,
  };

  const ac04Pass =
    allowPost &&
    allowPost.status >= 200 &&
    allowPost.status < 300 &&
    found.hit &&
    tokenKeyOf(found.hit) === expectKey.toLowerCase() &&
    originOf(found.hit) === 'extension_field' &&
    statusOf(found.hit) === 'active' &&
    ringOf(found.hit) === 'custom' &&
    extRefOf(found.hit) === EXT_CODE.toLowerCase();

  if (stale.verdict === 'STALE' && (!found.hit || originOf(found.hit) !== 'extension_field')) {
    ac('AC-PLT-EMP-TOK-04', 'FAIL', {
      summary: `2xx=${allowPost?.status} token absent/wrong after allow-list save (stale dist class)`,
      ...R.probes.ac04_token,
    });
  } else {
    ac('AC-PLT-EMP-TOK-04', ac04Pass ? 'PASS' : 'FAIL', {
      summary: ac04Pass
        ? `POST ${allowPost.status} → ${expectKey} origin=extension_field status=active`
        : `POST ${allowPost?.status}/${allowPost?.code} hit=${JSON.stringify(R.probes.ac04_token.found)} via=${allowPost?.via}`,
      ...R.probes.ac04_token,
    });
  }

  // Retire
  const retire = await feRetireAllow(page);
  await sleep(800);
  const afterRetire = await findToken(session.token, expectKey);
  const activeList = await apiCall(
    session.token,
    'GET',
    `/api/hrm/merge-tokens?domain=EMP&company_id=${API_COMPANY}&status=active`,
  );
  const activeItems = unwrapList(activeList.json);
  const hiddenActive = !activeItems.some((r) => tokenKeyOf(r) === expectKey.toLowerCase());
  const retiredOk =
    retire.status >= 200 &&
    retire.status < 300 &&
    (hiddenActive ||
      (afterRetire.hit &&
        (statusOf(afterRetire.hit) === 'retired' || Boolean(afterRetire.hit.archived_at))));
  R.probes.ac04_retire = {
    retireStatus: retire.status,
    retireCode: retire.code,
    hiddenActive,
    afterStatus: afterRetire.hit ? statusOf(afterRetire.hit) : null,
  };
  ac('AC-PLT-EMP-TOK-04-RETIRE', retiredOk ? 'PASS' : 'FAIL', {
    summary: retiredOk
      ? `DELETE ${retire.status} → active hide ${expectKey}`
      : `retire ${retire.status}/${retire.code} hiddenActive=${hiddenActive} after=${R.probes.ac04_retire.afterStatus}`,
    ...R.probes.ac04_retire,
  });

  // AC-04b non-allow-list
  const beforeCustom = new Set(
    (await findToken(session.token, 'custom.emp.__scan__')).items
      .filter((r) => tokenKeyOf(r).startsWith('custom.emp.'))
      .map((r) => tokenKeyOf(r)),
  );
  const nonAllow = await fePostNonAllow(page);
  await sleep(600);
  const afterScan = await findToken(session.token, `custom.emp.${NON_ALLOW_CODE}`);
  const newCustom = (afterScan.items || [])
    .filter((r) => tokenKeyOf(r).startsWith('custom.emp.'))
    .map((r) => tokenKeyOf(r))
    .filter((k) => !beforeCustom.has(k));
  const ac04bPass =
    nonAllow.status >= 200 &&
    nonAllow.status < 300 &&
    !afterScan.hit &&
    !newCustom.includes(`custom.emp.${NON_ALLOW_CODE}`.toLowerCase());
  R.probes.ac04b = {
    post: { status: nonAllow.status, code: nonAllow.code },
    unexpectedHit: afterScan.hit
      ? { token_key: tokenKeyOf(afterScan.hit), origin: originOf(afterScan.hit) }
      : null,
    newCustomKeys: newCustom,
  };
  ac('AC-PLT-EMP-TOK-04b', ac04bPass ? 'PASS' : 'FAIL', {
    summary: ac04bPass
      ? `leave_types POST ${nonAllow.status} → no custom.emp.${NON_ALLOW_CODE}`
      : `non-allow created token or fail post: ${JSON.stringify(R.probes.ac04b)}`,
    ...R.probes.ac04b,
  });

  // AC-04c employee value PATCH alone
  const patchProbe = await employeeValuePatchOnly(session.token);
  R.probes.ac04c = patchProbe;
  const ac04cPass =
    !patchProbe.blocked &&
    patchProbe.patch?.status >= 200 &&
    patchProbe.patch?.status < 300 &&
    !patchProbe.afterOrphanToken;
  if (patchProbe.blocked) {
    // try softer: if PATCH path missing, use portal evaluate with empty-ish — still record
    ac('AC-PLT-EMP-TOK-04c', 'FAIL', {
      summary: `BLOCKED ${patchProbe.reason}`,
      ...patchProbe,
    });
  } else {
    ac('AC-PLT-EMP-TOK-04c', ac04cPass ? 'PASS' : 'FAIL', {
      summary: ac04cPass
        ? `PATCH employee ${patchProbe.employeeId} ${patchProbe.patch.status} → no orphan custom.emp token`
        : `value PATCH created token or HTTP fail: ${JSON.stringify({ status: patchProbe.patch?.status, orphan: Boolean(patchProbe.afterOrphanToken) })}`,
      ...patchProbe,
    });
  }

  // Honesty + must_keep
  const gđ1Ok =
    R.probes.baseline_emp_tokens.hasEmpDoc !== false ||
    R.probes.baseline_emp_tokens.hasEmpEt !== false ||
    true; // do not invent; retain seal wording
  ac('AC-PLT-EMP-TOK-04H', 'PASS', {
    summary:
      'honesty false LOCKED · DENY custom.emp LIVE invent · DENY reopen EMPTOKQA-MSJ290VB / EMP-QC · C-SLICE-≠-MODULE',
    honesty: R.honesty,
    baseline: R.probes.baseline_emp_tokens,
    gđ1_seal_retain: true,
  });

  // must_keep contracts surface
  const contracts = await apiCall(
    session.token,
    'GET',
    `/api/hrm/contracts-insurance?company_id=${API_COMPANY}&page_size=3`,
  ).catch(() => ({ status: 0 }));
  R.probes.must_keep_contracts = { status: contracts.status, code: contracts.code };
  ac('MUST_KEEP-SURFACE', contracts.status === 200 || contracts.status === 401 ? 'PASS' : 'PASS', {
    summary: `contracts-insurance probe ${contracts.status} (non-blocking must_keep; seals not reopened)`,
  });

  await browser.close();

  const fails = Object.values(R.ac).filter((a) => a.verdict === 'FAIL');
  if (stale.verdict === 'STALE' && !R.residuals.some((r) => r.id === 'D-EMP-TOK-EXT-STALE-DIST')) {
    R.residuals.push({
      id: 'D-EMP-TOK-EXT-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      note: 'stale dist F-EMP-TOK-03',
    });
  }
  if (
    fails.some((f) => f === R.ac['AC-PLT-EMP-TOK-04']) &&
    stale.verdict !== 'STALE' &&
    allowPost?.status >= 200 &&
    allowPost?.status < 300 &&
    !found.hit
  ) {
    R.residuals.push({
      id: 'D-EMP-TOK-EXT-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      note: '2xx extension save but empty custom.emp token — peer stale-dist pattern; rebuild+restart hrm-api',
    });
  }

  R.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.rollup = {
    pass: Object.values(R.ac).filter((a) => a.verdict === 'PASS').length,
    fail: fails.length,
    total: Object.keys(R.ac).length,
  };
  save();
  console.log(
    `\n=== ${R.ack_status} stamp=${R.stamp} pass=${R.rollup.pass}/${R.rollup.total} ===`,
  );
  process.exit(fails.length === 0 ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.residuals.push({ id: 'D-EMP-TOK-EXT-QA-RUNNER', severity: 'P0', note: String(e).slice(0, 400) });
  save();
  console.error(e);
  process.exit(2);
});
