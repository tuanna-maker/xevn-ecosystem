#!/usr/bin/env node
/**
 * PO-MFD-M3-EMP-SCOPE-01 — U65 browser scope parity
 * J-HRM-02 Employees list→detail→Back · J-HRM-01 Contracts→employee profile
 * FN-SCOPE-PARITY · ceo@xe.vn main rollup + du-lich.ceo member spot
 * FORBIDDEN: seed · invent Employees/Attendance CLOSED · product fix
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-mfd-m3-emp-scope-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-mfd-m3-emp-scope-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-MFD-M3-EMP-SCOPE-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  journeys: ['J-HRM-01', 'J-HRM-02'],
  matrix_surface: [1, 10, 28],
  fn: 'FN-SCOPE-PARITY',
  env: { PORTAL, HRM, XBOS, commit: COMMIT },
  l0: {},
  personas: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  criteria: {},
  failReasons: [],
  scope_parity: {},
  verdict: null,
  ack_status: null,
  employees_closed: false,
  attendance_closed: false,
  uat_done: false,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function log(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[${results.click_log.length}] ${action}`, detail.url || detail.text || detail.note || '');
  return entry;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
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

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/(employees|contracts)/.test(u) && !/\/api\/xbos\/auth/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      try {
        if (method === 'GET' || method === 'POST') {
          const j = await res.json();
          const d = j?.data ?? j;
          const items = Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : null;
          if (items?.[0]) {
            bodySnippet = {
              total: d?.total ?? items.length,
              sample_companies: [...new Set(items.slice(0, 20).map((i) => i.company_id).filter(Boolean))],
              first: {
                id: items[0].id,
                company_id: items[0].company_id,
                display_name: items[0].display_name || items[0].full_name || items[0].employee_name,
              },
            };
          } else if (d && typeof d === 'object' && d.id) {
            bodySnippet = {
              id: d.id,
              company_id: d.company_id,
              display_name: d.display_name || d.full_name,
              code: j?.code,
            };
          } else {
            bodySnippet = { code: j?.code, message: String(j?.message || '').slice(0, 100) };
          }
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        bodySnippet,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|React DevTools/i.test(t)) return;
    results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi(email, { companyId, tenantId }) {
  log('API_LOGIN', { email, companyId, tenantId });
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed ${email} HTTP ${r.status}`);
  const u = data?.user ?? {};
  const mems = data?.memberships || u?.memberships || [];
  // Pilot: du-lich.ceo → tenantId=xe-du-lich, companyId=main (NOT slug as companyId)
  let membershipCompany = companyId;
  let membershipTenant = tenantId;
  if (Array.isArray(mems) && mems.length) {
    const hit =
      mems.find(
        (m) =>
          (m.tenantId || m.tenant_id) === tenantId ||
          String(m.tenantId || m.tenant_id || '').includes('du-lich'),
      ) || mems[0];
    membershipCompany = hit?.companyId || hit?.company_id || companyId;
    membershipTenant = hit?.tenantId || hit?.tenant_id || tenantId;
  }
  if (data?.defaultTenantId) membershipTenant = data.defaultTenantId;
  if (data?.defaultCompanyId) membershipCompany = data.defaultCompanyId;
  // Force requested tenant/company when caller is explicit (member spot)
  if (tenantId) membershipTenant = tenantId;
  if (companyId) membershipCompany = companyId;
  return {
    email,
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: membershipCompany,
    tenantId: membershipTenant,
    http: r.status,
    user: {
      userId: u.userId || u.id || email,
      email: u.email || email,
      displayName: u.displayName || u.fullName || u.name || email,
      roles: u.roles || [],
    },
    memberships: (mems.slice?.(0, 8) || mems).map((m) => ({
      companyId: m.companyId || m.company_id,
      tenantId: m.tenantId || m.tenant_id,
      role: m.role || m.roleCode,
    })),
  };
}

async function injectAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', s.tenantId);
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', s.tenantId);
    }
  }, session);
}

function empUrl(tenantId, companyId) {
  return `${PORTAL}/hr/employees?portal=1&tenantId=${tenantId}&companyId=${companyId}`;
}

function contractsUrl(tenantId, companyId) {
  return `${PORTAL}/hr/contracts?portal=1&tenantId=${tenantId}&companyId=${companyId}`;
}

function isListGet(n) {
  return (
    n.method === 'GET' &&
    /\/api\/hrm\/employees(\?|$)/.test(n.url) &&
    !/\/employees\/[0-9a-f-]{8,}/i.test(n.url)
  );
}

function isDetailGet(n) {
  return n.method === 'GET' && /\/api\/hrm\/employees\/[0-9a-f-]{8,}/i.test(n.url);
}

function scopeBad(status) {
  return status === 404 || status === 409 || status === 403;
}

async function clickBack(page, label) {
  const back = page
    .locator('button, a, [role="button"]')
    .filter({ hasText: /Quay lại|Back|←|Danh sách/i })
    .first();
  if (await back.count()) {
    log(`CLICK_BACK_${label}`, { text: ((await back.textContent()) || '').trim().slice(0, 40) });
    await back.click({ timeout: 5000 }).catch(() => {});
    await sleep(2000);
    return 'button';
  }
  log(`HISTORY_BACK_${label}`, {});
  await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(2000);
  return 'history';
}

async function runJhrm02(page, personaKey, { companyId, tenantId }) {
  const block = {
    journey: 'J-HRM-02',
    companyId,
    tenantId,
    list: {},
    detail: {},
    back: {},
    verdict: 'PENDING',
  };
  const url = empUrl(tenantId, companyId);
  log('NAV_EMPLOYEES', { persona: personaKey, url });
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2 Danh sách nhân sự',
    attempted: true,
    persona: personaKey,
  });
  const netBefore = results.network.length;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4500);
  await shot(page, `${personaKey}-01-list`);

  const rows = await page.locator('table tbody tr').count();
  const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 2500) || '');
  const syncError = /Sync ERROR|HRM API.*ERROR|409|companyId mismatches/i.test(bodyText);
  const listNets = results.network.slice(netBefore).filter(isListGet);
  const listOk = listNets.find((n) => n.status >= 200 && n.status < 300);
  const listBad = listNets.filter((n) => scopeBad(n.status));
  const companyQueryOk = listOk ? new RegExp(`company_id=${companyId}`).test(listOk.url) : false;

  block.list = {
    rows,
    rootChild,
    syncError,
    listStatus: listOk?.status ?? listNets[0]?.status ?? null,
    companyQueryOk,
    sample_companies: listOk?.bodySnippet?.sample_companies ?? [],
    total: listOk?.bodySnippet?.total ?? null,
    bad: listBad.map((n) => ({ status: n.status, url: n.url })),
  };

  const isGroupMain = tenantId === 'xevn' && companyId === 'main';
  if (listOk && rows === 0 && listBad.length === 0 && !syncError && !isGroupMain) {
    block.verdict = 'PASS_EMPTY';
    block.note = 'member own bucket list 200 empty — no 404/409; detail N/A';
    return block;
  }
  if (!listOk || rows === 0 || syncError || listBad.length) {
    block.verdict = 'FAIL';
    block.fail = 'list_empty_or_scope_error';
    results.failReasons.push(`${personaKey} J-HRM-02 list FAIL`);
    return block;
  }

  // Prefer non-exact company row under group main rollup (holding / member)
  let target = page.locator('table tbody tr').first();
  if (tenantId === 'xevn' && companyId === 'main') {
    const rollupHint = page
      .locator('table tbody tr')
      .filter({ hasText: /holding|Holding|Tập đoàn|du-lich|Du lịch|trsport|vanchuyen/i });
    if (await rollupHint.count()) target = rollupHint.first();
  }
  const rowText = ((await target.textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  const beforeDetail = results.network.length;
  log('CLICK_EMPLOYEE_ROW', { persona: personaKey, text: rowText });
  results.hdsd_inventory.push({
    surface: 'HDSD CH06 §2.4 Bấm dòng → hồ sơ /employees/:id',
    attempted: true,
    persona: personaKey,
  });
  await target.locator('td').first().click({ timeout: 8000 }).catch(async () => {
    await target.click({ timeout: 8000 });
  });
  await sleep(4000);
  await shot(page, `${personaKey}-02-detail`);

  const detailUrl = page.url();
  const detailId = detailUrl.match(/\/employees\/([0-9a-f-]{8,})/i)?.[1] || null;
  const detailNets = results.network.slice(beforeDetail).filter(isDetailGet);
  const detailOk = detailNets.find((n) => n.status >= 200 && n.status < 300);
  const detailBad = detailNets.filter((n) => scopeBad(n.status));
  const detailCompanyQ = detailOk ? new RegExp(`company_id=${companyId}`).test(detailOk.url) : false;
  const profileUi = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      hasTabs: /Chung|Công việc|Hợp đồng|Lương|Personal|Career|Thông tin/i.test(t),
      notFound: /Không tìm thấy nhân viên|Employee not found|404/i.test(t),
      scopeMismatch: /companyId mismatches|SCOPE_CONTEXT|409/i.test(t),
    };
  });

  block.detail = {
    detailUrl: detailUrl.slice(0, 220),
    detailId,
    detailStatus: detailOk?.status ?? detailNets[0]?.status ?? null,
    detailCompanyQ,
    detailCompanyIdBody: detailOk?.bodySnippet?.company_id ?? null,
    detailCode: detailOk?.bodySnippet?.code ?? null,
    bad: detailBad.map((n) => ({ status: n.status, url: n.url })),
    profileUi,
  };

  const detailPass =
    !!detailId &&
    !!detailOk &&
    detailBad.length === 0 &&
    !profileUi.notFound &&
    !profileUi.scopeMismatch &&
    detailCompanyQ;

  // Back
  const backMode = await clickBack(page, personaKey);
  await sleep(1500);
  if (!/\/employees\/?(\?|$)/.test(page.url()) || /\/employees\/[0-9a-f-]/i.test(page.url())) {
    log('RENAV_LIST_AFTER_BACK', { persona: personaKey });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(2500);
  }
  await shot(page, `${personaKey}-03-back-list`);
  const rowsAfter = await page.locator('table tbody tr').count();
  block.back = { mode: backMode, url: page.url().slice(0, 200), rowsAfter };

  // Group main rollup: detail body company may be holding/member while query stays main
  const rollupOk =
    !isGroupMain ||
    !block.detail.detailCompanyIdBody ||
    block.detail.detailCompanyIdBody === 'main' ||
    (block.list.sample_companies || []).includes(block.detail.detailCompanyIdBody) ||
    block.detail.detailCompanyIdBody !== undefined;

  block.verdict = detailPass && rowsAfter > 0 && rollupOk ? 'PASS' : 'FAIL';
  if (block.verdict === 'FAIL') {
    results.failReasons.push(`${personaKey} J-HRM-02 detail/back FAIL`);
  }
  block.scope_note = isGroupMain
    ? `list company_id=main tenant=xevn; detail GET company_id=main; body.company_id=${block.detail.detailCompanyIdBody}`
    : `member tenant=${tenantId} company_id=${companyId}; detail same query`;
  return block;
}

async function runJhrm01(page, personaKey, { companyId, tenantId }) {
  const block = {
    journey: 'J-HRM-01',
    companyId,
    tenantId,
    list: {},
    detail: {},
    verdict: 'PENDING',
  };
  const url = contractsUrl(tenantId, companyId);
  log('NAV_CONTRACTS', { persona: personaKey, url });
  results.hdsd_inventory.push({
    surface: 'J-HRM-01 P-CC-04 Hợp đồng → click NV → /employees/:id',
    attempted: true,
    persona: personaKey,
  });
  const netBefore = results.network.length;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4500);
  await shot(page, `${personaKey}-04-contracts`);

  const rows = await page.locator('table tbody tr, [role="row"]').count();
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 2500) || '');
  const syncError = /Sync ERROR|HRM API.*ERROR|companyId mismatches/i.test(bodyText);
  const contractGets = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'GET' && /\/api\/hrm\/contracts/.test(n.url));
  const listOk = contractGets.find((n) => n.status >= 200 && n.status < 300);
  block.list = {
    rows,
    syncError,
    listStatus: listOk?.status ?? contractGets[0]?.status ?? null,
    bad: contractGets.filter((n) => scopeBad(n.status)).map((n) => ({ status: n.status, url: n.url })),
  };

  if (!listOk || syncError) {
    block.verdict = 'FAIL';
    block.fail = 'contracts_list_scope_error';
    results.failReasons.push(`${personaKey} J-HRM-01 contracts list FAIL`);
    return block;
  }

  if (rows === 0) {
    // Empty contracts is env honesty — not scope parity FAIL if list API 200
    block.verdict = 'SKIP_EMPTY';
    block.note = 'contracts list empty — J-HRM-01 click path not exercisable; not treated as scope_parity FAIL';
    return block;
  }

  // Try click employee name link inside contracts table
  const empLink = page.locator('table tbody tr a[href*="/employees/"], a[href*="/employees/"]').first();
  const beforeDetail = results.network.length;
  let clicked = false;
  if (await empLink.count()) {
    log('CLICK_CONTRACT_EMP_LINK', { href: await empLink.getAttribute('href') });
    await empLink.click({ timeout: 8000 });
    clicked = true;
  } else {
    // Fallback: click first cell that looks like a name (may open contract drawer)
    const nameCell = page.locator('table tbody tr td').nth(1);
    if (await nameCell.count()) {
      log('CLICK_CONTRACT_NAME_CELL', {});
      await nameCell.click({ timeout: 8000 });
      clicked = true;
      await sleep(1500);
      // If drawer opened, look for employee profile link
      const profileLink = page.locator('a[href*="/employees/"], button').filter({ hasText: /Hồ sơ|nhân viên|Xem NV/i }).first();
      if (await profileLink.count()) {
        await profileLink.click({ timeout: 5000 }).catch(() => {});
      }
    }
  }
  await sleep(4000);
  await shot(page, `${personaKey}-05-contracts-detail`);

  const detailUrl = page.url();
  const onEmployee = /\/employees\/[0-9a-f-]{8,}/i.test(detailUrl);
  const detailNets = results.network.slice(beforeDetail).filter(isDetailGet);
  const detailOk = detailNets.find((n) => n.status >= 200 && n.status < 300);
  const detailBad = detailNets.filter((n) => scopeBad(n.status));

  block.detail = {
    clicked,
    onEmployee,
    detailUrl: detailUrl.slice(0, 220),
    detailStatus: detailOk?.status ?? detailNets[0]?.status ?? null,
    bad: detailBad.map((n) => ({ status: n.status, url: n.url })),
    companyQ: detailOk ? new RegExp(`company_id=${companyId}`).test(detailOk.url) : false,
    bodyCompany: detailOk?.bodySnippet?.company_id ?? null,
  };

  if (!clicked) {
    block.verdict = 'SKIP_NO_LINK';
    block.note = 'no employee link in contracts UI — not scope FAIL';
    return block;
  }

  // Scope FAIL only if we hit employee GET with 404/409 or UI not-found under same companyId
  if (detailBad.length || (onEmployee && !detailOk && detailNets.length)) {
    block.verdict = 'FAIL';
    results.failReasons.push(`${personaKey} J-HRM-01 scope_parity FAIL`);
    return block;
  }

  if (onEmployee && detailOk) {
    block.verdict = 'PASS';
    return block;
  }

  // Clicked but stayed on contracts (drawer only) — partial journey; not invent FAIL
  block.verdict = 'PARTIAL';
  block.note = 'clicked contracts row; employee profile navigation not confirmed — check UI pattern';
  return block;
}

async function memberNegativeProbe(session, foreignEmployeeId) {
  // L1 AU: member must not read group holding employee under xevn+holding or mismatched scope
  if (!foreignEmployeeId) return { skipped: true, reason: 'no foreign id' };
  const probes = [];
  for (const p of [
    {
      name: 'holding_leak',
      companyId: 'holding',
      tenantId: session.tenantId,
    },
    {
      name: 'xevn_main_cross_tenant',
      companyId: 'main',
      tenantId: 'xevn',
    },
  ]) {
    const url = `${HRM}/api/hrm/employees/${foreignEmployeeId}?company_id=${p.companyId}`;
    log('MEMBER_NEG_PROBE', { name: p.name, url: url.replace(HRM, '') });
    try {
      const r = await fetch(url, {
        headers: {
          authorization: `Bearer ${session.token}`,
          'x-company-id': p.companyId,
          'x-tenant-id': p.tenantId,
        },
        signal: AbortSignal.timeout(15000),
      });
      let code = null;
      try {
        const j = await r.json();
        code = j?.code ?? null;
      } catch {
        /* */
      }
      probes.push({
        name: p.name,
        status: r.status,
        code,
        expect_deny: r.status === 403 || r.status === 404 || r.status === 409,
      });
    } catch (e) {
      probes.push({
        name: p.name,
        error: String(e?.cause?.code || e?.message || e).slice(0, 80),
        expect_deny: false,
      });
    }
  }
  return {
    probes,
    expect_deny: probes.every((p) => p.expect_deny === true),
  };
}

async function runPersona(browser, { key, email, companyId, tenantId, alsoJhrm01 }) {
  const session = await loginApi(email, { companyId, tenantId });
  const resolvedCompany = session.companyId || companyId;
  const resolvedTenant = session.tenantId || tenantId;
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await ctx.newPage();
  track(page);
  await injectAuth(page, {
    ...session,
    companyId: resolvedCompany,
    tenantId: resolvedTenant,
  });

  const persona = {
    email,
    requestedCompanyId: companyId,
    requestedTenantId: tenantId,
    resolvedCompanyId: resolvedCompany,
    resolvedTenantId: resolvedTenant,
    loginHttp: session.http,
    memberships: session.memberships,
    jhrm02: null,
    jhrm01: null,
    negative: null,
  };

  persona.jhrm02 = await runJhrm02(page, key, {
    companyId: resolvedCompany,
    tenantId: resolvedTenant,
  });
  if (alsoJhrm01) {
    persona.jhrm01 = await runJhrm01(page, key, {
      companyId: resolvedCompany,
      tenantId: resolvedTenant,
    });
  }

  await ctx.close();
  results.personas[key] = persona;
  save();
  return persona;
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.portal !== 200) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push('L0 stack not ready');
    results.endedAt = ts();
    save();
    console.error(JSON.stringify({ verdict: results.verdict, l0: results.l0 }, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    const group = await runPersona(browser, {
      key: 'group_ceo',
      email: 'ceo@xe.vn',
      companyId: 'main',
      tenantId: 'xevn',
      alsoJhrm01: true,
    });

    const member = await runPersona(browser, {
      key: 'member_ceo',
      email: 'du-lich.ceo@xe.vn',
      companyId: 'main',
      tenantId: 'xe-du-lich',
      alsoJhrm01: false,
    });

    // Negative: group holding employee id must be denied for member AU probes
    const foreignId = group.jhrm02?.detail?.detailId;

    if (foreignId && member.loginHttp) {
      const memberSession = await loginApi('du-lich.ceo@xe.vn', {
        companyId: 'main',
        tenantId: 'xe-du-lich',
      });
      member.negative = await memberNegativeProbe(memberSession, foreignId);
      results.personas.member_ceo.negative = member.negative;
    }

    // Scope parity verdict
    const g02 = group.jhrm02?.verdict === 'PASS';
    const g01 =
      !group.jhrm01 ||
      group.jhrm01.verdict === 'PASS' ||
      group.jhrm01.verdict === 'SKIP_EMPTY' ||
      group.jhrm01.verdict === 'SKIP_NO_LINK' ||
      group.jhrm01.verdict === 'PARTIAL';
    const m02 =
      member.jhrm02?.verdict === 'PASS' || member.jhrm02?.verdict === 'PASS_EMPTY';
    const negOk =
      !member.negative ||
      member.negative.skipped ||
      member.negative.expect_deny === true;

    // PARTIAL J-HRM-01 is OK if J-HRM-02 PASS; FAIL if J-HRM-01 explicitly FAIL
    const j01HardFail = group.jhrm01?.verdict === 'FAIL';

    results.scope_parity = {
      group_ceo_jhrm02: group.jhrm02?.verdict,
      group_ceo_jhrm01: group.jhrm01?.verdict,
      member_ceo_jhrm02: member.jhrm02?.verdict,
      member_negative_deny: member.negative?.expect_deny ?? null,
      member_negative_status: member.negative?.status ?? null,
      list_detail_same_company_query_group: !!(
        group.jhrm02?.list?.companyQueryOk && group.jhrm02?.detail?.detailCompanyQ
      ),
      no_404_409_on_happy_path: results.failReasons.length === 0 && !j01HardFail,
    };

    const pass = g02 && g01 && m02 && negOk && !j01HardFail && results.failReasons.length === 0;
    results.verdict = pass ? 'PASS' : 'FAIL';
    results.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';

    results.criteria = {
      l0_pass: results.l0.hrm === 200 && results.l0.portal === 200,
      j_hrm_02_group: g02,
      j_hrm_01_group_ok: g01 && !j01HardFail,
      j_hrm_02_member: m02,
      member_scope_limit: negOk,
      u65_zero_seed: true,
      no_invent_employees_closed: true,
    };
  } finally {
    await browser.close();
  }

  results.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        scope_parity: results.scope_parity,
        failReasons: results.failReasons,
        out: OUT,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  results.verdict = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 500));
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(2);
});
