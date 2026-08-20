#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-B2-HRM-MD — Browser U65 CEO holding
 * UC: HRM-MD-01 submit · MD-02 queue · MD-03 approve · MD-04 reject
 * HDSD: UF-HRM-11 · /hr/employee-metadata · Hàng chờ metadata nhân sự
 * API: HRM-META-201/200/202/203
 * FORBIDDEN: seed · invent Leave L2 · UAT/Phase1 DONE · apps/**
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  process.env.QA_BROWSER_JSON ||
    'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b2-hrm-md-r1-browser.json',
);
const SCREEN = resolve(
  ROOT,
  process.env.QA_SCREEN_DIR || 'docs/qa/evidence/screens/po-uc-tc-w4-qa-b2-hrm-md-r1',
);
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toString();
const STAMP = `W4B2${Date.now().toString(36).slice(-6).toUpperCase()}`;
/** HDSD exit: job_title + plain «Chuyên viên QA» (FE wraps as {"value":…}). */
const VALUE_PLAIN = `Chuyên viên QA ${STAMP.slice(-4)}`;
const VALUE_A = `{"title":"QA-MD-APPR-${STAMP}"}`;
const VALUE_R = `{"title":"QA-MD-REJ-${STAMP}"}`;
const VALUE_A_NEEDLE = `QA-MD-APPR-${STAMP}`;
const VALUE_R_NEEDLE = `QA-MD-REJ-${STAMP}`;

const results = {
  work_item_id: process.env.QA_WORK_ITEM || 'PO-UC-TC-W4-QA-B2-HRM-MD-R1',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  hdsd_align: true,
  domain_note:
    'HRM-MD = employee metadata change-request queue (UF-HRM-11 / UC-HRM-26), not settings-catalog Master Data pull',
  env: { PORTAL, HRM, XBOS, EMAIL, MEMBER_EMAIL, commit: COMMIT },
  stamp: { STAMP, VALUE_PLAIN, VALUE_A, VALUE_R, VALUE_A_NEEDLE, VALUE_R_NEEDLE },
  hdsd_inventory: [
    'Login ceo@xe.vn holding',
    'HRM → Hàng chờ metadata /employee-metadata (UF-HRM-11 · HDSD menu Settings/metadata)',
    'Gửi yêu cầu metadata mới (MD-01)',
    'Xem hàng chờ GET change-requests (MD-02)',
    'Duyệt (MD-03) · Từ chối (MD-04)',
    'AU: member du-lich.ceo vs companyId=main when TC requires',
  ],
  must_keep: {
    leaveL2Untouched: true,
    at12L1ApproveClosed: true,
    createCatalogClosed: true,
    ci01IframeClosed: true,
    brWf04SelfFdClosed: true,
    im01to04UiPassUntouched: true,
    zeroSeed: true,
  },
  l0: {},
  steps: {},
  uc_verdicts: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  au_probes: [],
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: new Date().toISOString(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: new Date().toISOString() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
}

async function loginApi(email, password) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed ${email} HTTP ${r.status} ${j?.code || ''}`);
  const memberships = data?.memberships || data?.user?.memberships || [];
  const mem = memberships[0] || {};
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email,
    companyId: mem.companyId || mem.company_id || data?.companyId || 'main',
    tenantId: mem.tenantId || mem.tenant_id || data?.tenantId || 'xevn',
    roleCode: mem.roleCode || mem.role_code || null,
    user: {
      userId: u.userId || u.id || email,
      email: u.email || email,
      displayName: u.displayName || u.fullName || u.name || email,
      roles: u.roles || [mem.roleCode || 'user'],
    },
    raw: {
      ...data,
      refreshToken: data?.refreshToken || data?.refresh_token,
      defaultMembershipId: mem.id || mem.membershipId || mem.membership_id,
      loginCode: j?.code || null,
      http: r.status,
    },
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
        store.setItem('xevn.portal.tenantId', s.tenantId || 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId || 'xevn');
        if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
        if (s.raw?.defaultMembershipId) {
          store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
        }
      }
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const interesting =
      /employee-metadata|employees\?|auth\/login|catalog-sync/.test(u) ||
      (method !== 'GET' && /\/api\/hrm\//.test(u));
    if (!interesting) return;
    const entry = {
      method,
      status: res.status(),
      phase: 'response',
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      at: new Date().toISOString(),
      xCompanyId: res.request().headers()['x-company-id'] || null,
    };
    results.network.push(entry);
    save();
    res
      .json()
      .then((body) => {
        entry.code = body?.code || null;
        entry.message = String(body?.message || '').slice(0, 160);
        const data = body?.data ?? body;
        if (data && typeof data === 'object') {
          if (typeof data.total === 'number') entry.total = data.total;
          if (data.id) entry.id = data.id;
          if (data.status) entry.businessStatus = data.status;
          if (Array.isArray(data.data)) entry.rowCount = data.data.length;
        }
        save();
      })
      .catch(() => {});
  });
}

async function tryClick(page, locator, label, { wait = 1200 } = {}) {
  try {
    if ((await locator.count()) === 0) {
      log(`${label}_MISS`);
      return false;
    }
    await locator.first().click({ force: true, timeout: 8000 });
    log(label);
    await sleep(wait);
    return true;
  } catch (e) {
    log(`${label}_ERR`, { note: String(e).slice(0, 120) });
    return false;
  }
}

function metaUrl(companyId = 'main') {
  return `${PORTAL}/hr/employee-metadata?portal=1&tenantId=xevn&companyId=${companyId}`;
}

function findNet(pred, afterIdx = 0) {
  return results.network.slice(afterIdx).find(pred);
}

async function gotoMetadata(page) {
  const url = metaUrl('main');
  log('NAV_EMPLOYEE_METADATA', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  // HDSD menu path attempt (deeplink is SoT if menu miss)
  const menu = page
    .locator('a, button, [role="menuitem"]')
    .filter({ hasText: /Hàng chờ metadata|Metadata|employee-metadata|Duyệt thay đổi/i });
  if ((await menu.count()) > 0 && !/employee-metadata/.test(page.url())) {
    await tryClick(page, menu.first(), 'CLICK_MENU_METADATA', { wait: 3000 });
  }
}

async function bodyHas(page, re) {
  const t = await page.evaluate(() => document.body?.innerText?.slice(0, 12000) || '');
  return re.test(t);
}

async function submitRequest(page, value) {
  const before = results.network.length;
  const field = page.locator('#meta-field-key');
  const val = page.locator('#meta-requested-value');
  await field.fill('job_title');
  await val.fill(value);
  await sleep(300);
  const btn = page.locator('button').filter({ hasText: /Gửi yêu cầu/i });
  const clicked = await tryClick(page, btn, `CLICK_GUI_YEU_CAU_${value.slice(-8)}`, { wait: 3500 });
  const post = findNet(
    (n) =>
      n.method === 'POST' &&
      /employee-metadata\/change-requests$/.test(n.url.split('?')[0]) &&
      !/\/approve|\/reject/.test(n.url),
    before,
  );
  return { clicked, post, before };
}

async function runMd02OpenMain(page) {
  await gotoMetadata(page);
  await shot(page, '01-md02-open');
  const land =
    /Hàng chờ metadata/i.test(await page.locator('body').innerText().catch(() => '')) ||
    /employee-metadata/.test(page.url());
  const get = findNet(
    (n) => n.method === 'GET' && /employee-metadata\/change-requests/.test(n.url) && n.status === 200,
  );
  const errBanner = await bodyHas(page, /HRM API Sync ERROR|ERR_CONNECTION_REFUSED/i);
  if (land && get && !errBanner) {
    recordStep('MD-02-OPEN-MAIN', 'PASS', {
      summary: `Land metadata queue · GET → ${get.status} ${get.code || ''} total=${get.total ?? '?'}`,
      network: get,
      url: page.url(),
    });
    results.uc_verdicts['HRM-MD-02'] = 'UI_PASS';
    return true;
  }
  recordStep('MD-02-OPEN-MAIN', 'FAIL', {
    summary: `land=${land} get=${!!get} errBanner=${errBanner}`,
    url: page.url(),
  });
  results.uc_verdicts['HRM-MD-02'] = 'FAIL';
  return false;
}

async function runMd01Fd(page) {
  // FE blocks empty requested_value — button disabled (honest FD before API)
  const val = page.locator('#meta-requested-value');
  await val.fill('');
  await sleep(200);
  const btn = page.locator('button').filter({ hasText: /Gửi yêu cầu/i }).first();
  const disabled = await btn.isDisabled().catch(() => false);
  await shot(page, '02-md01-fd-empty');
  let emptyOk = false;
  if (disabled) {
    recordStep('MD-01-VAL-FD-EMPTY', 'PASS', {
      summary: 'Empty Giá trị đề nghị → Gửi yêu cầu disabled · no POST (FE fail-deep)',
    });
    emptyOk = true;
  } else {
    const before = results.network.length;
    await tryClick(page, btn, 'CLICK_GUI_EMPTY', { wait: 1500 });
    const badPost = findNet(
      (n) =>
        n.method === 'POST' &&
        /change-requests$/.test(n.url.split('?')[0]) &&
        n.status >= 200 &&
        n.status < 300,
      before,
    );
    emptyOk = !badPost;
    recordStep('MD-01-VAL-FD-EMPTY', emptyOk ? 'PASS' : 'FAIL', {
      summary: emptyOk
        ? 'Empty submit did not produce 2xx POST create'
        : `Empty submit produced 2xx ${badPost.status} ${badPost.code}`,
      network: badPost || null,
    });
  }

  // HDSD placeholder path: plain text (not JSON object) — product must accept OR guide user
  const beforePlain = results.network.length;
  const plain = await submitRequest(page, VALUE_PLAIN);
  await shot(page, '02b-md01-plain-text');
  const plainFail =
    plain.post &&
    plain.post.status >= 400 &&
    (plain.post.code === 'HRM-VAL-001' || /json string/i.test(plain.post.message || ''));
  if (plainFail) {
    recordStep('MD-01-PLAIN-TEXT-WIRE', 'FAIL', {
      summary: `Placeholder plain text POST → ${plain.post.status} ${plain.post.code}: ${plain.post.message || ''}`,
      network: plain.post,
    });
  } else if (plain.post && plain.post.status < 300) {
    recordStep('MD-01-PLAIN-TEXT-WIRE', 'PASS', {
      summary: `Plain text accepted → ${plain.post.status} ${plain.post.code}`,
      network: plain.post,
    });
  } else {
    recordStep('MD-01-PLAIN-TEXT-WIRE', 'FAIL', {
      summary: `Plain text unexpected: ${plain.post ? `${plain.post.status} ${plain.post.code}` : 'no POST'}`,
      network: plain.post || null,
      nets: results.network.slice(beforePlain),
    });
  }
  return emptyOk;
}

async function runMd01Hp(page) {
  // Object-shaped JSON typed in FE field (valid U65; unblocks chain) — not seed
  const { clicked, post } = await submitRequest(page, VALUE_A);
  await shot(page, '03-md01-submit');
  await sleep(1500);
  const toastOk = await bodyHas(page, /Đã gửi yêu cầu metadata|chờ duyệt/i);
  const rowVisible = await bodyHas(
    page,
    new RegExp(VALUE_A_NEEDLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '04-md01-f5');
  const afterF5 = await bodyHas(
    page,
    new RegExp(VALUE_A_NEEDLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  const ok =
    clicked &&
    post &&
    post.status >= 200 &&
    post.status < 300 &&
    (post.code === 'HRM-META-201' || post.status === 201) &&
    (rowVisible || afterF5);
  const plainFail = results.steps['MD-01-PLAIN-TEXT-WIRE']?.verdict === 'FAIL';
  if (ok && !plainFail) {
    recordStep('MD-01-MAIN-FE', 'PASS', {
      summary: `POST create → ${post.status} ${post.code} · FE row/toast · F5=${afterF5} · id=${post.id || '?'}`,
      network: post,
      toastOk,
      rowVisible,
      afterF5,
    });
    results.uc_verdicts['HRM-MD-01'] = 'UI_PASS';
    return { ok: true, id: post.id };
  }
  // Root-cause stamp for residual (always when FE create 400)
  if (post && post.status >= 400) {
    const msg = post.message || '';
    const currentNull =
      /current_value must be a json string/i.test(msg) || /current_value/i.test(msg);
    results.residuals.push({
      id: 'R-W4-B2-MD01-SUBMIT-ISJSON',
      sev: 'P0',
      owner: 'dev-fe',
      note:
        `FE POST /employee-metadata/change-requests → ${post.status} ${post.code}: ${msg}. ` +
        `Dual wire: (1) submitEmployeeMetadataChangeRequest always sends current_value=serialize(null)→'null' which fails @IsJSON ` +
        `(validator.isJSON rejects JSON null). (2) plain scalar requested_value serialize→'"text"' also fails @IsJSON (requires object). ` +
        `API probe without current_value + object JSON → 201 HRM-META-201. Fix: omit current_value when null; wrap scalars as object or change DTO. ` +
        `must_keep Leave L2 / AT-12 / CREATE-CATALOG / CI01 / BR-WF-04 / IM UI_PASS.`,
    });
    if (currentNull) {
      recordStep('MD-01-CURRENT-VALUE-NULL', 'FAIL', {
        summary: 'FE always posts current_value:"null" → BE @IsJSON rejects (blocks all UI submits)',
        network: post,
      });
    }
  }
  if (ok && plainFail) {
    recordStep('MD-01-MAIN-FE', 'PARTIAL', {
      summary: `Object JSON → ${post.status} ${post.code} F5 OK; plain-text path FAIL`,
      network: post,
      toastOk,
      afterF5,
    });
    results.uc_verdicts['HRM-MD-01'] = 'UI_PARTIAL';
    return { ok: true, id: post.id };
  }
  recordStep('MD-01-MAIN-FE', 'FAIL', {
    summary: `clicked=${clicked} post=${post ? `${post.status} ${post.code} ${post.message || ''}` : 'none'} row=${rowVisible} f5=${afterF5}`,
    network: post || null,
  });
  results.uc_verdicts['HRM-MD-01'] = 'FAIL';
  return { ok: false };
}

async function runMd03Approve(page) {
  const before = results.network.length;
  const row = page.locator('tr').filter({ hasText: VALUE_A_NEEDLE });
  let approveBtn;
  if ((await row.count()) > 0) {
    approveBtn = row.first().locator('button').filter({ hasText: /^Duyệt$/i });
  } else {
    approveBtn = page.locator('button').filter({ hasText: /^Duyệt$/i });
  }
  const count = await approveBtn.count();
  if (count === 0) {
    recordStep('MD-03-APPR-FD-EMPTY', 'PASS', {
      summary: 'No Duyệt CTA — inbox empty honest (BLOCKED path documented; seed forbidden)',
    });
    recordStep('MD-03-MAIN', 'FAIL', { summary: 'No pending row to approve after MD-01 submit' });
    results.uc_verdicts['HRM-MD-03'] = 'FAIL';
    return false;
  }
  await tryClick(page, approveBtn, 'CLICK_DUYET', { wait: 3500 });
  await shot(page, '05-md03-approve');
  const post = findNet(
    (n) => n.method === 'POST' && /change-requests\/[^/]+\/approve/.test(n.url),
    before,
  );
  const toastOk = await bodyHas(page, /Đã duyệt yêu cầu metadata/i);
  const gone = !(await bodyHas(
    page,
    new RegExp(VALUE_A_NEEDLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  ));
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '06-md03-f5');
  const stillGone = !(await bodyHas(
    page,
    new RegExp(VALUE_A_NEEDLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  ));
  const ok =
    post &&
    post.status >= 200 &&
    post.status < 300 &&
    (post.code === 'HRM-META-202' || post.status === 200 || post.status === 201);
  // Self-approve observation (CEO submitted + approved)
  results.steps['MD-03-APPR-AU-SELF'] = {
    verdict: ok ? 'OBS_ALLOWED' : post?.status >= 400 ? 'PASS_BLOCKED' : 'UNKNOWN',
    summary: ok
      ? 'CEO submit+approve same actor returned 2xx (self-approve not blocked at API — OBS)'
      : `approve status=${post?.status} code=${post?.code}`,
    network: post || null,
  };
  if (ok && stillGone) {
    recordStep('MD-03-MAIN-FE', 'PASS', {
      summary: `POST approve → ${post.status} ${post.code} · toast=${toastOk} · F5 pending gone`,
      network: post,
    });
    results.uc_verdicts['HRM-MD-03'] = 'UI_PASS';
    return true;
  }
  if (ok && !stillGone) {
    recordStep('MD-03-MAIN-FE', 'PARTIAL', {
      summary: `POST approve 2xx but VALUE_A still visible after F5`,
      network: post,
    });
    results.uc_verdicts['HRM-MD-03'] = 'UI_PARTIAL';
    return false;
  }
  recordStep('MD-03-MAIN-FE', 'FAIL', {
    summary: `post=${post ? `${post.status} ${post.code}` : 'none'} gone=${gone} f5=${stillGone}`,
    network: post || null,
  });
  results.uc_verdicts['HRM-MD-03'] = 'FAIL';
  return false;
}

async function runMd04Reject(page) {
  // Submit second request for reject path (FE-origin, not seed)
  const sub = await submitRequest(page, VALUE_R);
  await shot(page, '07-md04-submit-for-reject');
  if (!sub.post || sub.post.status >= 300) {
    recordStep('MD-04-PRECOND', 'FAIL', {
      summary: `Could not create FE-origin reject target: ${sub.post ? `${sub.post.status} ${sub.post.code}` : 'no POST'}`,
    });
    results.uc_verdicts['HRM-MD-04'] = 'FAIL';
    return false;
  }
  await sleep(1000);
  const before = results.network.length;
  const row = page.locator('tr').filter({ hasText: VALUE_R_NEEDLE });
  let rejectBtn;
  if ((await row.count()) > 0) {
    rejectBtn = row.first().locator('button').filter({ hasText: /Từ chối/i });
  } else {
    rejectBtn = page.locator('button').filter({ hasText: /Từ chối/i });
  }
  if ((await rejectBtn.count()) === 0) {
    recordStep('MD-04-APPR-FD-EMPTY', 'PASS', {
      summary: 'No Từ chối CTA after submit — honest empty (unexpected after create)',
    });
    results.uc_verdicts['HRM-MD-04'] = 'FAIL';
    return false;
  }
  await tryClick(page, rejectBtn, 'CLICK_TU_CHOI', { wait: 3500 });
  await shot(page, '08-md04-reject');
  const post = findNet(
    (n) => n.method === 'POST' && /change-requests\/[^/]+\/reject/.test(n.url),
    before,
  );
  const toastOk = await bodyHas(page, /Đã từ chối yêu cầu metadata/i);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '09-md04-f5');
  const stillGone = !(await bodyHas(
    page,
    new RegExp(VALUE_R_NEEDLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  ));
  const ok =
    post &&
    post.status >= 200 &&
    post.status < 300 &&
    (post.code === 'HRM-META-203' || post.status === 200 || post.status === 201);
  // FD: reject without reason — UI currently posts with default note; document OBS if 2xx
  results.steps['MD-04-VAL-FD-REASON'] = {
    verdict: 'OBS',
    summary: 'Reject UI sends default note «Từ chối từ HRM embed» — no empty-reason 4xx path on FE',
  };
  if (ok && stillGone) {
    recordStep('MD-04-MAIN-FE', 'PASS', {
      summary: `POST reject → ${post.status} ${post.code} · toast=${toastOk} · F5 pending gone`,
      network: post,
    });
    results.uc_verdicts['HRM-MD-04'] = 'UI_PASS';
    return true;
  }
  recordStep('MD-04-MAIN-FE', 'FAIL', {
    summary: `post=${post ? `${post.status} ${post.code}` : 'none'} f5Gone=${stillGone}`,
    network: post || null,
  });
  results.uc_verdicts['HRM-MD-04'] = 'FAIL';
  return false;
}

async function runAuMemberMain(sessionCeo) {
  // Member JWT + company_id=main on metadata queue — expect 403/409
  let member;
  try {
    member = await loginApi(MEMBER_EMAIL, PASSWORD);
  } catch (e) {
    results.au_probes.push({
      id: 'AU-MEMBER-LOGIN',
      verdict: 'BLOCKED',
      note: String(e).slice(0, 160),
    });
    recordStep('MD-SCOPE-AU', 'BLOCKED', { summary: `Member login failed: ${String(e).slice(0, 120)}` });
    return;
  }
  const url = `${HRM}/api/hrm/employee-metadata/change-requests?company_id=main&status=pending&page_size=5`;
  const r = await fetch(url, {
    headers: {
      authorization: `Bearer ${member.token}`,
      'x-company-id': 'main',
      'x-tenant-id': member.tenantId || 'xevn',
      accept: 'application/json',
    },
  });
  const body = await r.json().catch(() => ({}));
  const probe = {
    id: 'AU-MEMBER-MAIN-METADATA-LIST',
    http: r.status,
    code: body?.code || null,
    message: String(body?.message || '').slice(0, 160),
    memberCompany: member.companyId,
    expect: '403/409',
  };
  results.au_probes.push(probe);
  // ADR §5 corrected (same as IM03 retest): member + main + own slug → 200 own bucket, not group leak
  const memberSlug = member.companyId || 'xe-du-lich';
  const urlOwn = `${HRM}/api/hrm/employee-metadata/change-requests?company_id=main&company_slug=${memberSlug}&status=pending&page_size=5`;
  const rOwn = await fetch(urlOwn, {
    headers: {
      authorization: `Bearer ${member.token}`,
      'x-company-id': memberSlug,
      'x-tenant-id': member.tenantId || 'xevn',
      accept: 'application/json',
    },
  });
  const bodyOwn = await rOwn.json().catch(() => ({}));
  results.au_probes.push({
    id: 'AU-MEMBER-MAIN-OWN-BUCKET',
    http: rOwn.status,
    code: bodyOwn?.code || null,
    total: bodyOwn?.data?.total ?? bodyOwn?.total ?? null,
    memberSlug,
  });
  const blocked = r.status === 403 || r.status === 409;
  const ownBucketOk = rOwn.status === 200 && (bodyOwn?.data?.total ?? bodyOwn?.total ?? 0) <= 10;
  if (blocked || ownBucketOk) {
    recordStep('MD-SCOPE-AU', 'PASS', {
      summary: blocked
        ? `member ${MEMBER_EMAIL} GET metadata company_id=main → ${r.status} ${body?.code || ''}`
        : `member own bucket main+${memberSlug} → ${rOwn.status} ${bodyOwn?.code || ''} total=${bodyOwn?.data?.total ?? '?'}`,
      probe,
    });
    // Attach AU to MD-01/02 if not already FAIL
    for (const uc of ['HRM-MD-01', 'HRM-MD-02', 'HRM-MD-03', 'HRM-MD-04']) {
      if (results.uc_verdicts[uc] === 'UI_PASS') {
        /* AU pass strengthens; keep UI_PASS */
      }
    }
  } else {
    recordStep('MD-SCOPE-AU', 'FAIL', {
      summary: `member GET company_id=main → ${r.status} ${body?.code || ''}; own bucket probe ${rOwn.status}`,
      probe,
    });
    results.residuals.push({
      id: 'R-W4-B2-AU-MEMBER-MAIN-METADATA-UNEXPECTED',
      sev: 'P1',
      owner: 'dev-be',
      note: `${MEMBER_EMAIL} metadata scope probe unexpected: main list ${r.status}, own ${rOwn.status}`,
    });
  }
  // Bonus: CEO with mismatched x-company-id=du-lich
  const r2 = await fetch(url, {
    headers: {
      authorization: `Bearer ${sessionCeo.token}`,
      'x-company-id': 'du-lich',
      'x-tenant-id': 'xevn',
      accept: 'application/json',
    },
  });
  const b2 = await r2.json().catch(() => ({}));
  results.au_probes.push({
    id: 'AU-CEO-XCOMPANY-DU-LICH',
    http: r2.status,
    code: b2?.code || null,
    message: String(b2?.message || '').slice(0, 120),
  });
  save();
}

function finalizeOverall() {
  const v = results.uc_verdicts;
  const fail = Object.values(v).some((x) => x === 'FAIL');
  const partial = Object.values(v).some((x) => x === 'UI_PARTIAL' || x === 'PARTIAL');
  const auFail = results.steps['MD-SCOPE-AU']?.verdict === 'FAIL';
  if (fail) results.overall = 'FAIL';
  else if (partial || auFail) results.overall = 'PARTIAL';
  else if (Object.keys(v).length >= 4 && Object.values(v).every((x) => x === 'UI_PASS'))
    results.overall = auFail ? 'PARTIAL' : 'PASS';
  else results.overall = 'PARTIAL';
  results.endedAt = new Date().toISOString();
  save();
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || results.l0.portal !== 200) {
    results.overall = 'FAIL';
    results.residuals.push({ id: 'L0', sev: 'P0', owner: 'devops', note: results.l0 });
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }
  recordStep('L0', 'PASS', { summary: JSON.stringify(results.l0) });

  const session = await loginApi(EMAIL, PASSWORD);
  // Force holding main for Group CEO UAT
  session.companyId = 'main';

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const page = await browser.newPage();
  track(page);
  await injectPortalAuth(page, session);

  await runMd02OpenMain(page);
  await runMd01Fd(page);
  const md01 = await runMd01Hp(page);
  if (md01.ok) {
    await runMd03Approve(page);
    await runMd04Reject(page);
  } else {
    // U65: cannot seed inbox. MD-03/04 HP blocked. FD empty-inbox = honest PASS.
    const duyot = await page.locator('button').filter({ hasText: /^Duyệt$/i }).count();
    const tuchoi = await page.locator('button').filter({ hasText: /Từ chối/i }).count();
    if (duyot === 0) {
      recordStep('MD-03-APPR-FD-EMPTY', 'PASS', {
        summary: 'No Duyệt CTA after FE create FAIL — inbox empty honest; U65 no seed',
      });
    } else {
      // OBS only — rows may exist from prior API probes; not FE-origin HP
      const before = results.network.length;
      await tryClick(page, page.locator('button').filter({ hasText: /^Duyệt$/i }), 'OBS_CLICK_DUYET', {
        wait: 3000,
      });
      const post = findNet(
        (n) => n.method === 'POST' && /\/approve/.test(n.url),
        before,
      );
      recordStep('MD-03-OBS-WIRE', post && post.status < 300 ? 'OBS_PASS' : 'OBS_FAIL', {
        summary: `Non-FE-origin row approve OBS → ${post ? `${post.status} ${post.code}` : 'no POST'} (not HP; create still FAIL)`,
        network: post || null,
      });
      await shot(page, '05-md03-obs-approve');
    }
    if (tuchoi === 0 && duyot === 0) {
      recordStep('MD-04-APPR-FD-EMPTY', 'PASS', {
        summary: 'No Từ chối CTA — empty honest; U65 no seed after create FAIL',
      });
    } else if (tuchoi > 0) {
      const before = results.network.length;
      await tryClick(page, page.locator('button').filter({ hasText: /Từ chối/i }), 'OBS_CLICK_TU_CHOI', {
        wait: 3000,
      });
      const post = findNet(
        (n) => n.method === 'POST' && /\/reject/.test(n.url),
        before,
      );
      recordStep('MD-04-OBS-WIRE', post && post.status < 300 ? 'OBS_PASS' : 'OBS_FAIL', {
        summary: `Non-FE-origin row reject OBS → ${post ? `${post.status} ${post.code}` : 'no POST'} (not HP)`,
        network: post || null,
      });
      await shot(page, '08-md04-obs-reject');
    }
    results.uc_verdicts['HRM-MD-03'] = 'BLOCKED';
    results.uc_verdicts['HRM-MD-04'] = 'BLOCKED';
    recordStep('MD-03-BLOCKED', 'BLOCKED', {
      summary: 'HP blocked — MD-01 FE submit 400; U65 forbids seed to create pending',
    });
    recordStep('MD-04-BLOCKED', 'BLOCKED', {
      summary: 'HP blocked — MD-01 FE submit 400; U65 forbids seed to create pending',
    });
  }
  await runAuMemberMain(session);

  await shot(page, '10-final');
  await browser.close();
  finalizeOverall();

  console.log(
    JSON.stringify(
      {
        overall: results.overall,
        uc_verdicts: results.uc_verdicts,
        steps: Object.fromEntries(
          Object.entries(results.steps).map(([k, v]) => [k, { verdict: v.verdict, summary: v.summary }]),
        ),
        residuals: results.residuals,
        au_probes: results.au_probes,
        networkSample: results.network
          .filter((n) => /employee-metadata/.test(n.url))
          .slice(-12)
          .map((n) => ({
            method: n.method,
            status: n.status,
            code: n.code,
            url: n.url.slice(0, 120),
          })),
      },
      null,
      2,
    ),
  );
  process.exit(results.overall === 'FAIL' ? 1 : 0);
}

main().catch((e) => {
  results.error = String(e);
  results.overall = 'FAIL';
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
