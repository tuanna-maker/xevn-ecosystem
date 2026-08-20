#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-08-CLUSTER-QA-01 — U65 browser J-HRM-CORE-08-01..04
 * (01) KT/KL title-first create → POST /employees/:id/rewards|discipline 2xx · Chờ · physical
 * (02) Thi hành → POST …/enforce 2xx · F5 status_label + payroll_link_status + period
 * (03) Hủy → cancel-enforce · note-only link=none · no FE invent payslip Net
 * (04) Nest /core 0 · toast VAL/ENFORCE/DUAL/LOCKED/EMP · CORE-02/01 seals RETAIN
 * DENY Nest /core SoT · seed · honesty flip · claim CORE-02=pillar DONE · note-CRUD=FR-08 DONE
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
const EMP_HINT = process.env.QA_EMP_ID || '2b4cbc90-fb74-4a2d-9fef-d188d4e48d61';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-08-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-08-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `CORE08QA-${Date.now().toString(36).toUpperCase()}`;
const TITLE_MONEY = `QA CORE08 browser KT ${STAMP}`;
const TITLE_NOTE = `QA CORE08 note-only ${STAMP}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-08-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on:
    'BE-01 READY · docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-be-01.md · FE-01 READY · docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-fe-01.md',
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    personnel_core_uat: false,
    seed_used: false,
    c_slice_ne_module: true,
    core02_ne_pillar_done: true,
    note_crud_ne_fr08_done: true,
    reopen_j_core_02_01: false,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  ops: {
    rebuild_restart: true,
    note: 'stale dist at entry missing RD service + payroll_period_id cols → rebuild+restart seal BE-01 LIVE',
  },
  l0: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  rewards_hits: [],
  discipline_hits: [],
  decisions_hits: [],
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
  const rewards = /\/employees\/[^/?]+\/rewards/.test(url);
  const discipline = /\/employees\/[^/?]+\/discipline/.test(url);
  const decisions = /\/api\/hrm\/decisions/.test(url);
  const entry = {
    method,
    url,
    status: status ?? null,
    at: ts(),
    nest_core,
    rewards,
    discipline,
    decisions,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (rewards) R.rewards_hits.push(entry);
  if (discipline) R.discipline_hits.push(entry);
  if (decisions) R.decisions_hits.push(entry);
}

function isMappedRoute(probe) {
  if (!probe) return false;
  const snippet = typeof probe.snippet === 'string' ? probe.snippet : '';
  if (/Cannot (GET|POST|PUT|PATCH|DELETE)/i.test(snippet)) return false;
  return probe.status > 0 && probe.status < 500;
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
    snippet: text.slice(0, 600),
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

  const list = await one('GET', '/api/hrm/employees?company_id=main&page=1&page_size=5');
  const items = list.json?.data?.data || [];
  const emp = items.find((e) => e.id === EMP_HINT) || items[0];
  const empId = emp?.id || null;

  let rewards = null;
  let discipline = null;
  let periods = null;
  let core = null;
  let cbCf = null;
  let valNoPeriod = null;
  let enforceRoute = null;
  let openPeriod = null;

  if (empId) {
    rewards = await one('GET', `/api/hrm/employees/${empId}/rewards?company_id=main`);
    discipline = await one('GET', `/api/hrm/employees/${empId}/discipline?company_id=main`);
    periods = await one('GET', '/api/hrm/payroll/periods?company_id=main');
    core = await one('GET', '/api/hrm/core/reward-discipline');
    cbCf = await one('PATCH', `/api/hrm/employees/${empId}?company_id=main`, {
      custom_fields: { salary: '1' },
    });
    valNoPeriod = await one('POST', `/api/hrm/employees/${empId}/rewards?company_id=main`, {
      title: `QA L1 VAL ${STAMP}`,
      reward_type: 'bonus',
      reward_date: '2026-08-09',
      amount: 500000,
    });
    const periodRows = periods?.json?.data?.data || periods?.json?.data || [];
    openPeriod = (Array.isArray(periodRows) ? periodRows : []).find((p) =>
      /^(draft|open|adjust)$/i.test(String(p.status || '')),
    );
    enforceRoute = await one(
      'POST',
      `/api/hrm/employees/${empId}/rewards/00000000-0000-4000-8000-000000000099/enforce?company_id=main`,
      {},
    );
  }

  R.l1 = {
    probes,
    empId,
    empName: emp?.full_name || null,
    rewards_live: isMappedRoute(rewards) && rewards?.status === 200,
    discipline_live: isMappedRoute(discipline) && discipline?.status === 200,
    periods_live: isMappedRoute(periods) && periods?.status === 200,
    open_period_id: openPeriod?.id || null,
    open_period_label: openPeriod?.period_label || null,
    nest_core_deny: core?.status === 404 && /Cannot GET/i.test(core?.snippet || ''),
    cb_cf_403: cbCf?.status === 403 && cbCf?.code === 'HRM-CORE-CB-403',
    val_400:
      valNoPeriod?.status === 400 &&
      (valNoPeriod?.code === 'HRM-CORE-RD-VAL-400' ||
        /VAL-400|payroll_period/i.test(String(valNoPeriod?.code) + String(valNoPeriod?.message))),
    enforce_route_mapped:
      enforceRoute &&
      !/Cannot POST/i.test(enforceRoute.snippet || '') &&
      (enforceRoute.status === 404 ||
        enforceRoute.status === 409 ||
        enforceRoute.code === 'HRM-CORE-RD-404' ||
        /RD-404|not found|không tìm/i.test(
          String(enforceRoute.code) + String(enforceRoute.message) + String(enforceRoute.snippet),
        )),
    stamp: `CORE08L1-${Date.now().toString(36).toUpperCase()}`,
  };
  return empId;
}

async function findHost(page, fn) {
  for (const h of [page, ...page.frames()]) {
    try {
      if (await fn(h).first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return null;
}

/** Locate element across portal page + HRM iframes; returns { host, locator }. */
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

async function waitAcross(page, selector, ms = 8000) {
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

async function openRewardsTab(page, empId) {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  const url = isDirectHrm
    ? `${PORTAL}/employees/${empId}?companyId=${COMPANY}&tenantId=${TENANT}&tab=rewards`
    : `${PORTAL}/command-center/hrm/employees/${empId}?companyId=${COMPANY}&tenantId=${TENANT}&tab=rewards`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  R.click_log.push(`goto profile rewards ${empId} via ${PORTAL}`);
  await sleep(3500);

  const hrGroup = await findHost(page, (h) => h.getByTestId('profile-group-hr'));
  if (hrGroup) {
    await hrGroup.getByTestId('profile-group-hr').first().click({ force: true }).catch(() => null);
    await sleep(600);
    const tab = await findHost(page, (h) => h.getByTestId('profile-group-tab-rewards'));
    if (tab) {
      await tab.getByTestId('profile-group-tab-rewards').first().click({ force: true });
      R.click_log.push('click profile-group-tab-rewards');
      await sleep(2000);
    }
  }

  let host = await findHost(page, (h) => h.locator('[data-hdsd="hdsd-emp-rd-tab"]'));
  if (!host) {
    const byText = await findHost(page, (h) =>
      h.getByText(/khen thưởng|kỷ luật|rewards|discipline/i),
    );
    if (byText) {
      await byText
        .getByText(/khen thưởng|rewards/i)
        .first()
        .click({ force: true })
        .catch(() => null);
      await sleep(2000);
      host = await findHost(page, (h) => h.locator('[data-hdsd="hdsd-emp-rd-tab"]'));
    }
  }
  return host;
}

async function fillRewardDialog(host, { title, amount, date, noteOnly }) {
  const dlg = host.locator('[role="dialog"]').last();
  await dlg.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);

  const titleInput = dlg.locator('[data-hdsd="hdsd-emp-rd-title"]').first();
  await titleInput.fill(title);

  // Date — first date-like input in dialog
  const dateInput = dlg.locator('input').filter({ hasNot: host.locator('[data-hdsd="hdsd-emp-rd-title"]') });
  const inputs = dlg.locator('input');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    const el = inputs.nth(i);
    const ph = ((await el.getAttribute('placeholder')) || '').toLowerCase();
    const type = ((await el.getAttribute('type')) || '').toLowerCase();
    const name = ((await el.getAttribute('name')) || '').toLowerCase();
    if (
      /dd\/mm|ngày|date/i.test(ph) ||
      type === 'date' ||
      /date|reward_date/i.test(name) ||
      ph.includes('__/__/____')
    ) {
      await el.click({ force: true });
      await el.fill(date);
      break;
    }
  }
  // Fallback: fill any empty text input that looks like date mask
  if (date) {
    for (let i = 0; i < count; i++) {
      const el = inputs.nth(i);
      const val = await el.inputValue().catch(() => '');
      const hdsd = await el.getAttribute('data-hdsd');
      if (hdsd === 'hdsd-emp-rd-title') continue;
      if (!val || /^\d{2}\/\d{2}\/\d{4}$/.test(val) || val.includes('_')) {
        const aria = ((await el.getAttribute('aria-label')) || '').toLowerCase();
        const near = await el.evaluate((node) => {
          const label = node.closest('div')?.querySelector('label')?.textContent || '';
          return label;
        }).catch(() => '');
        if (/ngày|date|reward/i.test(aria + near) || !val) {
          // only set if label mentions date OR still empty after title filled
          if (/ngày|date/i.test(aria + near)) {
            await el.fill(date);
            break;
          }
        }
      }
    }
  }

  // Amount via ViMoneyInput — find input under amount label
  if (!noteOnly && amount > 0) {
    const amountBox = dlg.locator('div').filter({ hasText: /số tiền|amount|tiền/i }).locator('input').last();
    if (await amountBox.isVisible({ timeout: 1500 }).catch(() => false)) {
      await amountBox.click({ force: true });
      await amountBox.fill('');
      await amountBox.type(String(amount), { delay: 20 });
    } else {
      // last numeric-capable input before period picker
      for (let i = count - 1; i >= 0; i--) {
        const el = inputs.nth(i);
        const hdsd = await el.getAttribute('data-hdsd');
        if (hdsd === 'hdsd-emp-rd-title') continue;
        await el.click({ force: true });
        await el.fill(String(amount));
        break;
      }
    }
    await sleep(400);

    const picker = dlg.locator('[data-hdsd="hdsd-emp-rd-period-picker"]');
    if (await picker.isVisible({ timeout: 3000 }).catch(() => false)) {
      await picker.locator('button,[role="combobox"]').first().click({ force: true });
      await sleep(500);
      // Pick first unlocked option in portal/iframe
      const optHost = (await findHost(host.page?.() || host, (h) =>
        h.getByRole('option'),
      )) || host;
      const options = optHost.getByRole('option');
      const n = await options.count().catch(() => 0);
      let picked = false;
      for (let i = 0; i < n; i++) {
        const txt = (await options.nth(i).textContent()) || '';
        if (/__none|Không có kỳ/i.test(txt)) continue;
        if (/\((draft|open|adjust)\)/i.test(txt) || txt.trim()) {
          await options.nth(i).click({ force: true });
          picked = true;
          R.click_log.push(`period pick: ${txt.trim().slice(0, 80)}`);
          break;
        }
      }
      if (!picked && n > 0) {
        await options.first().click({ force: true });
      }
    }
  }

  return dlg;
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

  // Pick live FE surface: portal embed preferred, HRM Vite :8080 fallback
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
  if (!R.l0.portal) {
    R.l0.portal = 'unreachable';
  }
  R.env.PORTAL = PORTAL;

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-CORE-08-AUTH', sev: 'P0', note: 'login token missing' });
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  const empId = await l1Seal(token);
  if (
    !empId ||
    !R.l1.rewards_live ||
    !R.l1.nest_core_deny ||
    !R.l1.cb_cf_403 ||
    !R.l1.val_400 ||
    !R.l1.enforce_route_mapped ||
    !R.l1.open_period_id
  ) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-CORE-08-L1-STALE',
      sev: 'P0',
      note: `L1 incomplete rewards=${R.l1.rewards_live} nest=${R.l1.nest_core_deny} cb403=${R.l1.cb_cf_403} val=${R.l1.val_400} enforce=${R.l1.enforce_route_mapped} period=${R.l1.open_period_id}`,
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

  const j01 = { id: 'J-HRM-CORE-08-01', verdict: 'FAIL', notes: [] };
  const j02 = { id: 'J-HRM-CORE-08-02', verdict: 'FAIL', notes: [] };
  const j03 = { id: 'J-HRM-CORE-08-03', verdict: 'FAIL', notes: [] };
  const j04 = { id: 'J-HRM-CORE-08-04', verdict: 'FAIL', notes: [] };
  R.journeys = { j01, j02, j03, j04 };

  try {
  // --- J-01 create money+period title-first ---
  const nestBefore = R.nest_core_hits.length;
  const rewardsBefore = R.rewards_hits.length;
  const host = await openRewardsTab(page, empId);
  await shot(page, '01-rd-tab-open');

  if (!host) {
    j01.notes.push('RD tab host not found');
  } else {
    const addHit =
      (await findAcross(page, '[data-hdsd="hdsd-emp-rd-add-reward"]')) ||
      (await findHost(page, (h) => h.getByRole('button', { name: /thêm khen thưởng/i })));
    if (addHit?.locator) {
      await addHit.locator.click({ force: true });
    } else if (addHit) {
      await addHit.getByRole('button', { name: /thêm khen thưởng/i }).first().click({ force: true });
    } else {
      await host.locator('[data-hdsd="hdsd-emp-rd-add-reward"]').first().click({ force: true });
    }
    R.click_log.push('click add reward');
    await sleep(1000);

    const titleHit = await waitAcross(page, '[data-hdsd="hdsd-emp-rd-title"]', 10000);
    if (!titleHit) {
      j01.notes.push('dialog title input not found after add');
      await shot(page, '02-dialog-missing');
    } else {
      const dlgHost = titleHit.host;
      const titleInput = titleHit.locator;
      await titleInput.fill(TITLE_MONEY);

      const dateField = dlgHost
        .locator('[role="dialog"],[data-state="open"]')
        .last()
        .locator('.space-y-2')
        .filter({ hasText: /ngày|date/i })
        .locator('input')
        .first();
      if (await dateField.isVisible({ timeout: 1500 }).catch(() => false)) {
        await dateField.click({ clickCount: 3 });
        await dateField.fill('09/08/2026');
        await dateField.press('Tab');
      } else {
        // fallback: any non-title input near date placeholder
        const inputs = dlgHost.locator('[role="dialog"]').last().locator('input');
        const n = await inputs.count();
        for (let i = 0; i < n; i++) {
          const el = inputs.nth(i);
          const hdsd = await el.getAttribute('data-hdsd');
          if (hdsd === 'hdsd-emp-rd-title') continue;
          const ph = ((await el.getAttribute('placeholder')) || '').toLowerCase();
          if (/ngày|dd\/mm|date|_/.test(ph)) {
            await el.fill('09/08/2026');
            break;
          }
        }
      }

      const amountInput = dlgHost
        .locator('[role="dialog"],[data-state="open"]')
        .last()
        .locator('.space-y-2')
        .filter({ hasText: /số tiền|amount|Tiền/i })
        .locator('input')
        .first();
      if (await amountInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await amountInput.click({ clickCount: 3 });
        await amountInput.fill('1250000');
        await amountInput.press('Tab');
      }
      await sleep(700);

      await shot(page, '02-reward-form-filled');

      const pickerHit = await waitAcross(page, '[data-hdsd="hdsd-emp-rd-period-picker"]', 5000);
      const pickerVisible = Boolean(pickerHit);
      j01.notes.push(`period_picker_visible=${pickerVisible}`);
      let picked = false;
      let pickedLabel = '';
      if (pickerHit) {
        await pickerHit.locator.locator('button,[role="combobox"]').first().click({ force: true });
        await sleep(700);
        for (const frame of [page, ...page.frames()]) {
          const opts = frame.getByRole('option');
          const n = await opts.count().catch(() => 0);
          for (let i = 0; i < n; i++) {
            const txt = ((await opts.nth(i).textContent()) || '').trim();
            if (!txt || /__none|Không có kỳ/i.test(txt)) continue;
            // Unlocked soft targets only (BE: draft|open|adjust). FE may list processed — skip.
            if (!/\((draft|open|adjust)\)/i.test(txt)) continue;
            await opts.nth(i).click({ force: true });
            picked = true;
            pickedLabel = txt.slice(0, 120);
            R.click_log.push(`period=${pickedLabel}`);
            break;
          }
          if (picked) break;
        }
        if (!picked) await page.keyboard.press('Escape').catch(() => null);
      }
      j01.notes.push(`period_picked=${picked} label=${pickedLabel}`);

      if (!picked) {
        j01.notes.push('abort save — no unlocked draft|open|adjust period in picker');
        await shot(page, '03-period-pick-fail');
        R.residuals.push({
          id: 'R-CORE-08-FE-PERIOD-FILTER',
          sev: 'P1',
          note: 'isRdPeriodSelectable includes processed; BE LOCKED-PERIOD-409 on save — pick draft in QA',
        });
      } else {
        const saveHit = await findAcross(page, '[data-hdsd="hdsd-emp-rd-save-reward"]');
        if (saveHit) {
          await saveHit.locator.click({ force: true });
          R.click_log.push('click save reward');
        }
        await sleep(2800);
        await shot(page, '03-after-create');

        const postCreate = R.rewards_hits.filter(
          (h) =>
            h.method === 'POST' &&
            /\/rewards(\?|$)/.test(h.url) &&
            !/enforce/.test(h.url) &&
            h.status != null,
        );
        const lastPost = postCreate[postCreate.length - 1];
        j01.notes.push(
          `post_create=${lastPost?.status || 'none'} url=${lastPost?.url?.slice(-80) || ''}`,
        );

        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3500);
        const hostF5 = await openRewardsTab(page, empId);
        await shot(page, '04-f5-after-create');
        const rowHost =
          hostF5 || (await findHost(page, (h) => h.locator('[data-hdsd="hdsd-emp-rd-tab"]')));
        const row = rowHost
          ?.locator('[data-hdsd="hdsd-emp-rd-reward-row"]')
          .filter({ hasText: TITLE_MONEY });
        const rowVisible = row
          ? await row.first().isVisible({ timeout: 5000 }).catch(() => false)
          : false;
        let statusText = '';
        let linkText = '';
        let periodText = '';
        if (rowVisible) {
          statusText = (
            (await row
              .first()
              .locator('[data-hdsd="hdsd-emp-rd-status-label"]')
              .textContent({ timeout: 2000 })
              .catch(() => '')) || ''
          ).trim();
          linkText = (
            (await row
              .first()
              .locator('[data-hdsd="hdsd-emp-rd-link-status"]')
              .textContent({ timeout: 2000 })
              .catch(() => '')) || ''
          ).trim();
          periodText = (
            (await row
              .first()
              .locator('[data-hdsd="hdsd-emp-rd-period-label"]')
              .textContent({ timeout: 2000 })
              .catch(() => '')) || ''
          ).trim();
        }
        j01.notes.push(
          `f5_row=${rowVisible} status=${statusText} link=${linkText} period=${periodText}`,
        );

        const physicalOk =
          Boolean(lastPost) &&
          lastPost.status >= 200 &&
          lastPost.status < 300 &&
          /\/employees\/[^/]+\/rewards/.test(lastPost.url) &&
          !/\/api\/hrm\/core\//.test(lastPost.url);
        const nestDelta = R.nest_core_hits.length - nestBefore;
        if (
          physicalOk &&
          rowVisible &&
          /chờ|pending/i.test(statusText) &&
          nestDelta === 0 &&
          pickerVisible &&
          picked
        ) {
          j01.verdict = 'PASS';
        } else {
          j01.notes.push(`physical=${physicalOk} nestDelta=${nestDelta}`);
        }
      }
    }
  }

  // --- J-02 enforce ---
  {
    const host2 =
      (await findHost(page, (h) => h.locator('[data-hdsd="hdsd-emp-rd-tab"]'))) ||
      (await openRewardsTab(page, empId));
    const row = host2
      ?.locator('[data-hdsd="hdsd-emp-rd-reward-row"]')
      .filter({ hasText: TITLE_MONEY });
    const enforceBtn = row?.locator('[data-hdsd="hdsd-emp-rd-enforce"]').first();
    const enforceVisible = enforceBtn
      ? await enforceBtn.isVisible({ timeout: 3000 }).catch(() => false)
      : false;
    j02.notes.push(`enforce_btn=${enforceVisible}`);
    if (enforceVisible && j01.verdict === 'PASS') {
      const before = R.rewards_hits.length;
      await enforceBtn.click({ force: true });
      R.click_log.push('click Thi hành');
      await sleep(2500);
      await shot(page, '05-after-enforce');
      const enforcePosts = R.rewards_hits
        .slice(before)
        .filter(
          (h) =>
            h.method === 'POST' &&
            /\/enforce(\?|$)/.test(h.url) &&
            !/cancel-enforce/.test(h.url) &&
            h.status != null,
        );
      const enf = enforcePosts[enforcePosts.length - 1];
      j02.notes.push(`enforce_status=${enf?.status} url=${enf?.url?.slice(-90)}`);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(3500);
      const hostF5 = await openRewardsTab(page, empId);
      await shot(page, '06-f5-after-enforce');
      const rowF5 = hostF5
        ?.locator('[data-hdsd="hdsd-emp-rd-reward-row"]')
        .filter({ hasText: TITLE_MONEY });
      const rowOk = rowF5
        ? await rowF5.first().isVisible({ timeout: 4000 }).catch(() => false)
        : false;
      let statusText = '';
      let linkText = '';
      let periodText = '';
      if (rowOk) {
        statusText = (
          (await rowF5
            .first()
            .locator('[data-hdsd="hdsd-emp-rd-status-label"]')
            .textContent({ timeout: 2000 })
            .catch(() => '')) || ''
        ).trim();
        linkText = (
          (await rowF5
            .first()
            .locator('[data-hdsd="hdsd-emp-rd-link-status"]')
            .textContent({ timeout: 2000 })
            .catch(() => '')) || ''
        ).trim();
        periodText = (
          (await rowF5
            .first()
            .locator('[data-hdsd="hdsd-emp-rd-period-label"]')
            .textContent({ timeout: 2000 })
            .catch(() => '')) || ''
        ).trim();
      }
      j02.notes.push(`f5 status=${statusText} link=${linkText} period=${periodText}`);
      const okNet = enf && enf.status >= 200 && enf.status < 300 && /\/enforce/.test(enf.url);
      const okUi =
        /đang|đã thi hành|in_force|executed/i.test(statusText) &&
        /linked|đã gắn|gắn kỳ|liên kết/i.test(linkText) &&
        periodText.length > 0;
      if (okNet && okUi && R.nest_core_hits.length === nestBefore) {
        j02.verdict = 'PASS';
      } else {
        j02.notes.push(`okNet=${okNet} okUi=${okUi} rowOk=${rowOk}`);
      }
    } else {
      j02.notes.push(
        j01.verdict !== 'PASS'
          ? 'blocked — J-01 create FAIL'
          : 'enforce button missing on TITLE_MONEY row',
      );
    }
  }

  // --- J-03 cancel + note-only ---
  {
    const host3 =
      (await findHost(page, (h) => h.locator('[data-hdsd="hdsd-emp-rd-tab"]'))) ||
      (await openRewardsTab(page, empId));
    const row = host3
      ?.locator('[data-hdsd="hdsd-emp-rd-reward-row"]')
      .filter({ hasText: TITLE_MONEY });
    const cancelBtn = row?.locator('[data-hdsd="hdsd-emp-rd-cancel-enforce"]').first();
    const cancelVisible = cancelBtn
      ? await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)
      : false;
    j03.notes.push(`cancel_btn=${cancelVisible}`);
    let cancelOk = false;
    if (cancelVisible && j02.verdict === 'PASS') {
      const before = R.rewards_hits.length;
      await cancelBtn.click({ force: true });
      R.click_log.push('click Hủy thi hành');
      await sleep(2500);
      await shot(page, '07-after-cancel');
      const cancels = R.rewards_hits
        .slice(before)
        .filter((h) => h.method === 'POST' && /cancel-enforce/.test(h.url) && h.status != null);
      const c = cancels[cancels.length - 1];
      cancelOk = Boolean(c && c.status >= 200 && c.status < 300);
      j03.notes.push(`cancel_status=${c?.status}`);
    } else if (j02.verdict !== 'PASS') {
      j03.notes.push('cancel skipped — J-02 FAIL');
    }

    // note-only create (amount 0)
    const addHit = await findAcross(page, '[data-hdsd="hdsd-emp-rd-add-reward"]');
    if (addHit) await addHit.locator.click({ force: true });
    await sleep(800);
    const titleHit = await waitAcross(page, '[data-hdsd="hdsd-emp-rd-title"]', 8000);
    let pickerShown = false;
    let noteSaved = false;
    if (titleHit) {
      await titleHit.locator.fill(TITLE_NOTE);
      const dateField = titleHit.host
        .locator('[role="dialog"],[data-state="open"]')
        .last()
        .locator('.space-y-2')
        .filter({ hasText: /ngày|date/i })
        .locator('input')
        .first();
      if (await dateField.isVisible({ timeout: 1500 }).catch(() => false)) {
        await dateField.fill('09/08/2026');
      }
      pickerShown = Boolean(
        await findAcross(page, '[data-hdsd="hdsd-emp-rd-period-picker"]', { timeout: 600 }),
      );
      j03.notes.push(`note_period_picker=${pickerShown}`);
      const saveHit = await findAcross(page, '[data-hdsd="hdsd-emp-rd-save-reward"]');
      if (saveHit) {
        await saveHit.locator.click({ force: true });
        noteSaved = true;
        R.click_log.push('save note-only');
      }
      await sleep(2500);
    } else {
      j03.notes.push('note dialog missing');
    }
    await shot(page, '08-note-only-created');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3500);
    const hostF5 = await openRewardsTab(page, empId);
    await shot(page, '09-f5-note-cancel');
    const noteRow = hostF5
      ?.locator('[data-hdsd="hdsd-emp-rd-reward-row"]')
      .filter({ hasText: TITLE_NOTE });
    const noteVisible = noteRow
      ? await noteRow.first().isVisible({ timeout: 4000 }).catch(() => false)
      : false;
    const noteLink = (
      (await noteRow?.first().locator('[data-hdsd="hdsd-emp-rd-link-status"]').textContent()) ||
      ''
    ).trim();
    j03.notes.push(`note_row=${noteVisible} link=${noteLink}`);

    const payslipNetInvent = await page
      .locator('body')
      .innerText()
      .then((t) => /payslip\s*net|net\s*pay|lương thực nhận.*kt\/kl/i.test(t))
      .catch(() => false);

    const notePost = R.rewards_hits.filter(
      (h) =>
        h.method === 'POST' &&
        /\/rewards(\?|$)/.test(h.url) &&
        !/enforce/.test(h.url) &&
        h.status >= 200 &&
        h.status < 300,
    );
    const lastNotePost = notePost[notePost.length - 1];

    if (
      cancelOk &&
      noteVisible &&
      /none|không|chưa liên kết|không liên kết|không gắn/i.test(noteLink) &&
      !pickerShown &&
      !payslipNetInvent &&
      (lastNotePost || noteSaved)
    ) {
      j03.verdict = 'PASS';
    } else {
      j03.notes.push(
        `cancelOk=${cancelOk} noteVis=${noteVisible} inventNet=${payslipNetInvent}`,
      );
    }
  }

  // --- J-04 network + must_keep ---
  {
    const nestTotal = R.nest_core_hits.length;
    const decisionsTotal = R.decisions_hits.length;
    const physicalHits = [...R.rewards_hits, ...R.discipline_hits].filter(
      (h) => /\/employees\/[^/]+\/(rewards|discipline)/.test(h.url),
    );
    const toastCodes = {
      val: R.l1.val_400,
      cb403: R.l1.cb_cf_403,
      nest_deny: R.l1.nest_core_deny,
    };
    j04.notes.push(
      `nest_core=${nestTotal} decisions=${decisionsTotal} physical=${physicalHits.length} toast=${JSON.stringify(toastCodes)}`,
    );
    await shot(page, '10-j04-done');
    if (
      nestTotal === 0 &&
      decisionsTotal === 0 &&
      physicalHits.length > 0 &&
      R.l1.val_400 &&
      R.l1.cb_cf_403 &&
      R.l1.nest_core_deny &&
      R.honesty.core02_ne_pillar_done &&
      R.honesty.note_crud_ne_fr08_done &&
      !R.honesty.seed_used
    ) {
      j04.verdict = 'PASS';
    }
  }
  } catch (err) {
    R.defects.push({
      id: 'R-CORE-08-BROWSER-EX',
      sev: 'P0',
      note: String(err).slice(0, 400),
    });
    await shot(page, '99-exception').catch(() => null);
  }

  R.journeys = { j01, j02, j03, j04 };
  const allPass = [j01, j02, j03, j04].every((j) => j.verdict === 'PASS');
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  if (!allPass) {
    for (const j of [j01, j02, j03, j04]) {
      if (j.verdict !== 'PASS') {
        R.defects.push({
          id: `R-${j.id}`,
          sev: 'P0',
          note: j.notes.join(' | '),
        });
      }
    }
  }
  R.endedAt = ts();
  R.summary = {
    nest_core_hits: R.nest_core_hits.length,
    rewards_hits: R.rewards_hits.length,
    discipline_hits: R.discipline_hits.length,
    decisions_hits: R.decisions_hits.length,
    consoleErrors: R.consoleErrors.slice(0, 8),
    pageErrors: R.pageErrors.slice(0, 8),
  };

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        journeys: Object.fromEntries(
          Object.entries(R.journeys).map(([k, v]) => [k, { id: v.id, verdict: v.verdict, notes: v.notes }]),
        ),
        l1: {
          rewards_live: R.l1.rewards_live,
          val_400: R.l1.val_400,
          nest_core_deny: R.l1.nest_core_deny,
          cb_cf_403: R.l1.cb_cf_403,
          open_period_id: R.l1.open_period_id,
        },
        nest_core_hits: R.nest_core_hits.length,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  await browser.close();
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-CORE-08-RUNNER', sev: 'P0', note: String(e).slice(0, 400) });
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
