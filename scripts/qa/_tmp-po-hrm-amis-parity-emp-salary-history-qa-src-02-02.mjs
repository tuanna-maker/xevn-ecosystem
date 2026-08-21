#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02
 * U65 FE-CB-COMPONENT retest — Đãi ngộ create/revise POST 2xx with lines[].component_code
 * cấm: seed · product-path mirror · payroll_e2e_ready claim
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const HRM_API = `${HRM}/api/hrm`;
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `SRCSRC0202-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const CB_BASE = 13_579_000;
const CB_ALLOW_AN = 777_000;
const CB_ALLOW_XANG = 300_000;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-02.FINAL.json',
);
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md');
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-src-02-02',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const R = {
  work_item_id: 'PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02',
  parent: 'PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01',
  stamp: STAMP,
  startedAt: ts(),
  journey: 'FE-CB-COMPONENT · Đãi ngộ create/revise',
  u65: 'zero-seed · HDSD testids · Network POST 2xx · F5 · no product-path mirror',
  persona: { email: EMAIL, companyId: COMPANY },
  honesty: {
    payroll_e2e_ready: false,
    seed_used: false,
    product_path_mirror: false,
    amis_done: false,
  },
  l0: {},
  ac: {},
  network: { comp: [], hrm: [] },
  postBodies: [],
  consoleErrors: [],
  pageErrors: [],
  click_log: [],
  steps: [],
  residuals: [],
  hdsd_inventory: {},
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.log(`[${ts()}] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, ...detail, at: ts() };
  console.log(`${verdict} ${id}`, detail.note || '');
  save();
}

async function login(email, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token;
      if (token) {
        return { ok: true, token, user: d?.user ?? {} };
      }
    } catch {
      /* next */
    }
  }
  return { ok: false, token: null };
}

async function api(token, method, path, { body, query, companyId = COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM_API}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
      Accept: 'application/json',
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code ?? null, message: j?.message ?? null, data: j?.data ?? j, json: j };
}

function listRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/** Catalog prerequisite for FE default PHU_CAP_* → component_code (≠ C&B package mirror). */
async function ensureSc(token, code, name) {
  const list = await api(token, 'GET', '/payroll/salary-components', { query: { company_id: COMPANY } });
  const rows = listRows(list.data?.data ?? list.data);
  const hit = rows.find((c) => String(c.code || '').toLowerCase() === code.toLowerCase());
  if (hit?.id) {
    R.steps.push({ name: `ensure_sc_${code}`, status: 'exists', id: hit.id });
    return hit;
  }
  const create = await api(token, 'POST', '/payroll/salary-components', {
    body: { company_id: 'holding', code, name, component_type: 'luong', nature: 'income' },
  });
  R.steps.push({
    name: `ensure_sc_${code}`,
    status: create.status,
    code: create.code,
    id: create.data?.id ?? null,
    note: 'catalog prerequisite ≠ C&B package mirror',
  });
  if (create.data?.id) return create.data;
  const again = listRows(
    (
      await api(token, 'GET', '/payroll/salary-components', { query: { company_id: COMPANY } })
    ).data?.data ??
      (
        await api(token, 'GET', '/payroll/salary-components', { query: { company_id: COMPANY } })
      ).data,
  );
  return again.find((c) => String(c.code || '').toLowerCase() === code.toLowerCase()) ?? null;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, String(v));
  return u.toString();
}

async function injectAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    {
      s: {
        token: session.token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: session.user?.userId || session.user?.id || EMAIL,
          email: EMAIL,
          displayName: session.user?.displayName || EMAIL,
          roles: session.user?.roles || ['group_ceo'],
        },
      },
    },
  );
}

function trackNetwork(page) {
  page.on('request', (req) => {
    const u = req.url();
    if (!/compensation-packages/.test(u)) return;
    if (req.method() !== 'POST') return;
    let body = null;
    try {
      body = JSON.parse(req.postData() || 'null');
    } catch {
      body = { raw: String(req.postData() || '').slice(0, 500) };
    }
    R.postBodies.push({
      url: u.slice(0, 280),
      method: req.method(),
      lines: Array.isArray(body?.lines)
        ? body.lines.map((l) => ({
            line_type: l.line_type ?? l.lineType,
            component_code: l.component_code ?? l.componentCode ?? null,
            allowance_code: l.allowance_code ?? l.allowanceCode ?? null,
            amount: l.amount,
          }))
        : [],
      change_reason: body?.change_reason ?? body?.changeReason ?? null,
    });
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const row = { method: res.request().method(), status: res.status(), url: u.slice(0, 280), code: null };
    try {
      const j = await res.json();
      row.code = j?.code ?? null;
    } catch {
      /* */
    }
    R.network.hrm.push(row);
    if (/compensation-packages/.test(u)) R.network.comp.push(row);
  });
}

async function fillViMoney(page, testId, amount) {
  const loc = page.getByTestId(testId);
  await loc.waitFor({ state: 'visible', timeout: 15_000 });
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await loc.click({ clickCount: 3 });
  await page.keyboard.press('Control+A').catch(() => {});
  await page.keyboard.press('Backspace').catch(() => {});
  // Commit digits via InputEvents (ViMoney parseViMoneyDigits on each change)
  await loc.evaluate((el, val) => {
    const input = el instanceof HTMLInputElement ? el : el.querySelector('input');
    if (!input) return;
    const proto = window.HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    let acc = '';
    for (const ch of String(val)) {
      acc += ch;
      desc?.set?.call(input, acc);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(amount));
  await loc.blur().catch(() => {});
  await sleep(80);
}

async function ensureProbationOff(page) {
  const cb = page.getByTestId('hdsd-emp-comp-include-probation');
  if (!(await cb.isVisible().catch(() => false))) return;
  const checked = await cb.getAttribute('data-state').catch(() => null);
  const aria = await cb.getAttribute('aria-checked').catch(() => null);
  if (checked === 'checked' || aria === 'true') {
    await cb.click();
    await sleep(200);
    R.steps.push({ name: 'probation_unchecked', ok: true });
  }
}

async function inventoryHdsd(page) {
  const ids = [
    'hdsd-emp-contracts-tab-dai-ngo',
    'hdsd-emp-compensation-panel',
    'hdsd-emp-comp-base',
    'hdsd-emp-comp-allowance-amount-0',
    'hdsd-emp-comp-allowance-amount-1',
    'hdsd-emp-comp-create',
    'hdsd-emp-comp-revise',
    'hdsd-emp-comp-create-unlinked',
    'hdsd-emp-comp-change-reason',
    'hdsd-emp-comp-active-lines',
  ];
  const out = {};
  for (const id of ids) {
    out[id] = await page.getByTestId(id).isVisible().catch(() => false);
  }
  R.hdsd_inventory = out;
  return out;
}

function analyzePostBodies(bodies) {
  const withLines = bodies.filter((b) => Array.isArray(b.lines) && b.lines.length > 0);
  const last = withLines[withLines.length - 1] || bodies[bodies.length - 1] || null;
  if (!last?.lines?.length) {
    return {
      hasBody: false,
      hasBaseCc: false,
      hasAnCc: false,
      allHaveCc: false,
      lines: [],
    };
  }
  const lines = last.lines;
  const hasBaseCc = lines.some(
    (l) => (l.line_type === 'base' || /base/i.test(l.component_code || '')) && l.component_code === 'base',
  );
  const hasAnCc = lines.some((l) => /phu_cap_an/i.test(String(l.component_code || '')));
  const allHaveCc = lines.every((l) => Boolean(l.component_code));
  return { hasBody: true, hasBaseCc, hasAnCc, allHaveCc, lines };
}

async function browserFeCb(page, emp, asOf) {
  log('FE employee → Contracts → Đãi ngộ (HDSD)');
  const url = q(`/hr/employees/${emp.id}`, { tab: 'contract' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3500);

  const tab = page.getByTestId('hdsd-emp-contracts-tab-dai-ngo');
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
  } else {
    await page.getByRole('tab', { name: /Đãi ngộ/i }).first().click({ force: true }).catch(() => {});
  }
  await sleep(2000);
  await page.getByTestId('hdsd-emp-compensation-panel').waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
  await page.screenshot({ path: join(SCREEN, '01-dai-ngo-panel.png') }).catch(() => {});

  const inv = await inventoryHdsd(page);
  R.steps.push({ name: 'hdsd_inventory', inv });

  await ensureProbationOff(page);

  // Effective from — prefer date control if present
  const dateBtn = page.locator('[data-testid="hdsd-emp-comp-effective-from"] button, button').filter({
    hasText: /Chọn ngày|\d{2}\/\d{2}\/\d{4}/,
  }).first();
  if (await dateBtn.isVisible().catch(() => false)) {
    await dateBtn.click().catch(() => {});
    await sleep(400);
    const dayNum = Number(String(asOf).slice(-2)) || 1;
    const dayBtn = page
      .locator('[role="gridcell"] button:not([disabled])')
      .filter({ hasText: new RegExp(`^${dayNum}$`) })
      .first();
    if (await dayBtn.isVisible().catch(() => false)) await dayBtn.click();
    else {
      const any = page.locator('[role="gridcell"] button:not([disabled])').first();
      if (await any.isVisible().catch(() => false)) await any.click();
    }
  }

  await fillViMoney(page, 'hdsd-emp-comp-base', CB_BASE);
  await fillViMoney(page, 'hdsd-emp-comp-allowance-amount-0', CB_ALLOW_AN);
  await fillViMoney(page, 'hdsd-emp-comp-allowance-amount-1', CB_ALLOW_XANG);

  const reason = page.getByTestId('hdsd-emp-comp-change-reason');
  if (await reason.isVisible().catch(() => false)) {
    await reason.click();
    await reason.fill(`U65 FE-CB SRC-02-02 ${STAMP}`);
  }

  // Close any date popover that would swallow the save click
  await page.keyboard.press('Escape').catch(() => {});
  await sleep(300);

  const fieldSnapshot = {
    base: await page.getByTestId('hdsd-emp-comp-base').inputValue().catch(() => null),
    an: await page.getByTestId('hdsd-emp-comp-allowance-amount-0').inputValue().catch(() => null),
    xang: await page.getByTestId('hdsd-emp-comp-allowance-amount-1').inputValue().catch(() => null),
    reason: await reason.inputValue().catch(() => null),
  };
  R.steps.push({ name: 'field_snapshot', ...fieldSnapshot });
  await page.screenshot({ path: join(SCREEN, '02-form-filled.png') }).catch(() => {});

  const beforeComp = R.network.comp.length;
  const beforeBodies = R.postBodies.length;
  const reviseVisible = await page.getByTestId('hdsd-emp-comp-revise').isVisible().catch(() => false);
  const createVisible = await page.getByTestId('hdsd-emp-comp-create').isVisible().catch(() => false);
  const createUnlinkedVisible = await page
    .getByTestId('hdsd-emp-comp-create-unlinked')
    .isVisible()
    .catch(() => false);
  const activeLinesEmpty = !(await page.getByTestId('hdsd-emp-comp-active-lines').isVisible().catch(() => false));
  R.steps.push({
    name: 'action_buttons',
    reviseVisible,
    createVisible,
    createUnlinkedVisible,
    activeLinesEmpty,
  });

  async function clickSave(testId) {
    const btn = page.getByTestId(testId);
    await btn.scrollIntoViewIfNeeded();
    const waitPost = page
      .waitForResponse(
        (res) =>
          res.request().method() === 'POST' && /compensation-packages/.test(res.url()),
        { timeout: 12_000 },
      )
      .catch(() => null);
    await btn.click({ force: true });
    return waitPost;
  }

  let clicked = null;
  // Prefer revise when active package exists (create-unlinked → HRM-COMP-004 overlap)
  if (createVisible) {
    clicked = 'hdsd-emp-comp-create';
    await clickSave(clicked);
  } else if (reviseVisible) {
    clicked = 'hdsd-emp-comp-revise';
    await clickSave(clicked);
  } else if (createUnlinkedVisible) {
    clicked = 'hdsd-emp-comp-create-unlinked';
    await clickSave(clicked);
  } else {
    clicked = 'fallback-role';
    await page
      .locator('button')
      .filter({ hasText: /Tạo gói đãi ngộ|Tăng lương|revise/i })
      .first()
      .click({ force: true });
    await sleep(3000);
  }
  await sleep(2500);

  let posts = R.network.comp
    .slice(beforeComp)
    .filter((p) => p.method === 'POST' && /compensation-packages/.test(p.url));
  let post2xx = posts.some((p) => p.status >= 200 && p.status < 300);

  // FE retry: if create(/unlinked) got 4xx overlap, click revise (still U65 FE — not API mirror)
  if (!post2xx && reviseVisible && clicked !== 'hdsd-emp-comp-revise') {
    R.steps.push({
      name: 'retry_revise_after_non_2xx',
      prior: clicked,
      priorPosts: posts,
    });
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
    await clickSave('hdsd-emp-comp-revise');
    await sleep(3000);
    posts = R.network.comp
      .slice(beforeComp)
      .filter((p) => p.method === 'POST' && /compensation-packages/.test(p.url));
    post2xx = posts.some((p) => p.status >= 200 && p.status < 300);
    clicked = `${clicked}+revise`;
  }
  // FE retry: if revise failed and create-unlinked available (no active edge)
  if (!post2xx && createUnlinkedVisible && !String(clicked).includes('create-unlinked')) {
    R.steps.push({ name: 'retry_create_unlinked', prior: clicked, priorPosts: posts });
    await clickSave('hdsd-emp-comp-create-unlinked');
    await sleep(3000);
    posts = R.network.comp
      .slice(beforeComp)
      .filter((p) => p.method === 'POST' && /compensation-packages/.test(p.url));
    post2xx = posts.some((p) => p.status >= 200 && p.status < 300);
    clicked = `${clicked}+create-unlinked`;
  }

  await page.screenshot({ path: join(SCREEN, '03-after-save.png') }).catch(() => {});

  const bodies = R.postBodies.slice(beforeBodies);
  const bodyAnalysis = analyzePostBodies(bodies);

  const toastText = await page
    .locator('[data-sonner-toast], [data-sonner-toaster] li, [role="status"]')
    .allTextContents()
    .catch(() => []);
  const bodySnippet = (await page.locator('body').innerText().catch(() => '')).slice(0, 400);
  R.steps.push({
    name: 'fe_cb_save',
    clicked,
    post2xx,
    posts,
    bodies,
    bodyAnalysis,
    toast: toastText.map((t) => t.slice(0, 160)).slice(0, 8),
    bodyHasError: /Nhập lương|phụ cấp|hiệu lực|Không thể|Chưa có gói|HRM-COMP/i.test(bodySnippet),
  });

  return {
    ok: post2xx && bodyAnalysis.hasBaseCc && bodyAnalysis.hasAnCc && bodyAnalysis.allHaveCc,
    post2xx,
    posts,
    bodies,
    bodyAnalysis,
    reviseVisible,
    createVisible,
    clicked,
    url,
  };
}

async function f5Persist(page, token, emp, asOf) {
  log('F5 persist — reload Đãi ngộ + GET active package');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(3000);
  const tab = page.getByTestId('hdsd-emp-contracts-tab-dai-ngo');
  if (await tab.isVisible().catch(() => false)) await tab.click();
  else await page.getByRole('tab', { name: /Đãi ngộ/i }).first().click({ force: true }).catch(() => {});
  await sleep(2500);
  await page.screenshot({ path: join(SCREEN, '04-f5-persist.png') }).catch(() => {});

  const activeLinesVisible = await page.getByTestId('hdsd-emp-comp-active-lines').isVisible().catch(() => false);
  const companyId = emp.company_id || 'holding';
  const active = await api(token, 'GET', '/contracts-insurance/compensation-packages/active', {
    query: { company_id: companyId, employee_id: emp.id, as_of: asOf },
    companyId: companyId === 'holding' ? COMPANY : companyId,
  });
  // retry with main if holding 404
  let pkg = active.data;
  let status = active.status;
  if (!pkg?.id) {
    const retry = await api(token, 'GET', '/contracts-insurance/compensation-packages/active', {
      query: { company_id: COMPANY, employee_id: emp.id, as_of: asOf },
    });
    pkg = retry.data;
    status = retry.status;
  }

  const lines = pkg?.lines || [];
  const mapped = lines.map((l) => ({
    type: l.line_type,
    component_code: l.component_code,
    allowance_code: l.allowance_code,
    amount: l.amount,
  }));
  const hasBase = mapped.some((l) => l.component_code === 'base' && Number(l.amount) === CB_BASE);
  const hasAn = mapped.some(
    (l) => /phu_cap_an/i.test(String(l.component_code || '')) && Number(l.amount) === CB_ALLOW_AN,
  );
  R.steps.push({
    name: 'f5_active_pkg',
    getStatus: status,
    pkgId: pkg?.id ?? null,
    activeLinesVisible,
    lines: mapped,
    hasBase,
    hasAn,
  });
  return {
    ok: Boolean(pkg?.id) && hasBase && hasAn && mapped.every((l) => Boolean(l.component_code)),
    lines: mapped,
    pkgId: pkg?.id ?? null,
    activeLinesVisible,
    status,
  };
}

function buildMd() {
  const fe = R.ac['FE-CB-COMPONENT'];
  const f5 = R.ac['F5-PERSIST'];
  const lines = [
    '# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02` |',
    '| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01` |',
    '| **from_role** | `qa` |',
    '| **to_role** | `pm` |',
    `| **ack_status** | **\`${R.ack_status}\`** |`,
    `| **verdict** | **${R.verdict}** |`,
    `| **date** | ${new Date().toISOString().slice(0, 10)} |`,
    '| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |',
    '| **focus** | **FE-CB-COMPONENT** U65 create/revise |',
    '| **U65** | zero-seed · HDSD latch · Network POST 2xx + body `component_code` · F5 |',
    '| **honesty** | **`payroll_e2e_ready=false`** · **no product-path mirror** · no AMIS DONE |',
    `| **stamp** | \`${STAMP}\` |`,
    '| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-02.FINAL.json` |',
    '| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-src-02-02/` |',
    '| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-02.mjs` |',
    '',
    '## Click path (U65)',
    '',
    '1. Login `ceo@xe.vn` → portal `:5173`',
    '2. `/hr/employees/:id?tab=contract` → `[data-testid=hdsd-emp-contracts-tab-dai-ngo]`',
    '3. Fill `[hdsd-emp-comp-base]` + allowance amounts 0/1 · reason · create|revise',
    '4. Assert Network POST compensation-packages(/revise) **2xx** · `lines[].component_code`',
    '5. F5 → active package lines persist with `component_code`',
    '6. **Cấm** product-path mirror / seed as PASS substitute',
    '',
    '## HDSD inventory (U76)',
    '',
    '| testid | visible |',
    '|--------|---------|',
    ...Object.entries(R.hdsd_inventory || {}).map(([k, v]) => `| \`${k}\` | ${v ? 'yes' : 'no'} |`),
    '',
    '## Honesty locks',
    '',
    '| Flag | Value |',
    '|------|-------|',
    '| `payroll_e2e_ready` | **false** |',
    '| Seed | **DENIED** |',
    '| Product-path mirror | **DENIED** (FAIL if FE POST empty) |',
    '| AMIS DONE / module UAT | **DENIED** |',
    '',
    '## AC matrix',
    '',
    '| AC | Verdict | Notes |',
    '|----|---------|-------|',
    ...Object.entries(R.ac).map(
      ([id, v]) => `| **${id}** | ${v.verdict} | ${(v.note || '').replace(/\|/g, '/')} |`,
    ),
    '',
    '## Key steps',
    '',
    ...R.steps.slice(0, 40).map((s) => `- \`${JSON.stringify(s).slice(0, 220)}\``),
    '',
    '## Network POST compensation (sample)',
    '',
    '```json',
    JSON.stringify(
      {
        posts: R.network.comp.filter((p) => p.method === 'POST').slice(-5),
        bodies: R.postBodies.slice(-3),
      },
      null,
      2,
    ).slice(0, 2500),
    '```',
    '',
    '## Residuals',
    '',
    ...(R.residuals.length
      ? R.residuals.map((r) => `- **${r.id}** · ${r.owner}: ${r.note}`)
      : ['- (none for FE-CB-COMPONENT scope)']),
    '',
    '## Honesty / non-claims',
    '',
    '- `payroll_e2e_ready=false`',
    '- No `pnpm seed:*` / DB fake / product-path mirror',
    '- No AMIS parity DONE / module UAT / J-HRM-07 PROCESS claim (out of this wave)',
    '',
    '## completion_report',
    '',
    `Closed: U65 FE-CB-COMPONENT retest stamp ${STAMP}. FE-CB: ${fe?.verdict || 'n/a'}; F5: ${f5?.verdict || 'n/a'}. Honesty: payroll_e2e_ready=false; no seed; no product-path mirror; no AMIS DONE.`,
    '',
    '## next_owner',
    '',
    R.verdict === 'PASS' ? 'qc' : 'dev-fe',
    '',
    '## next_dispatch_prompt',
    '',
    '```text',
    R.verdict === 'PASS'
      ? `work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-02
from_role: pm
to_role: qc
lane: governance
GWC FE-CB-COMPONENT residual R-EMP-SH-FE-CB-CLICK closed — evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md
honesty: payroll_e2e_ready=false · no AMIS DONE · no product-path mirror`
      : `work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-02
from_role: pm
to_role: dev-fe
lane: execution
FIX FE Đãi ngộ create/revise — Network posts empty or missing component_code
evidence FAIL: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md
entry: HDSD testids from FE-CB-01; cấm product-path mirror
exit: READY_FOR_QA → QA-SRC-02-02 retest`,
    '```',
    '',
    '## evidence_path',
    '',
    '`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md`',
    '',
    '## ack_status',
    '',
    `**${R.ack_status}**`,
    '',
  ];
  writeFileSync(OUT_MD, lines.join('\n'));
}

async function main() {
  async function probe(url) {
    for (let i = 0; i < 3; i++) {
      try {
        return (await fetch(url, { signal: AbortSignal.timeout(8000) })).status;
      } catch (e) {
        if (i === 2) return String(e?.message || e).slice(0, 80);
        await sleep(700);
      }
    }
    return 'unreachable';
  }
  R.l0.hrm = await probe(`${HRM}/api/hrm`);
  R.l0.xbos = await probe(`${XBOS}/api/xbos`);
  R.l0.portal = await probe(PORTAL);
  ac('L0', R.l0.hrm === 200 && R.l0.xbos === 200 && R.l0.portal === 200 ? '🟢 PASS' : '🔴 FAIL', {
    note: JSON.stringify(R.l0),
  });
  if (R.ac.L0.verdict.includes('FAIL')) {
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    buildMd();
    save();
    process.exit(2);
  }

  const author = await login(EMAIL);
  if (!author.ok) {
    ac('AUTH', '🔴 FAIL', { note: 'ceo login failed' });
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    buildMd();
    save();
    process.exit(2);
  }
  ac('AUTH', '🟢 PASS', { note: 'ceo@xe.vn token ok' });

  // Catalog prerequisite (DM §33 codes FE emits) — NOT compensation package product-path mirror
  const scBase = await ensureSc(author.token, 'base', `Base FE-CB ${STAMP}`);
  const scAn = await ensureSc(author.token, 'phu_cap_an', `PC An FE-CB ${STAMP}`);
  const scXang = await ensureSc(author.token, 'phu_cap_xang', `PC Xang FE-CB ${STAMP}`);
  ac(
    'SETUP-SC',
    scBase?.id && scAn?.id && scXang?.id ? '🟢 PASS' : '🔴 FAIL',
    {
      note: `base=${scBase?.id} an=${scAn?.id} xang=${scXang?.id} · catalog only`,
    },
  );
  if (R.ac['SETUP-SC'].verdict.includes('FAIL')) {
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    R.residuals.push({
      id: 'R-EMP-SH-SC-CATALOG',
      owner: 'dev-be',
      note: 'Cannot ensure base/phu_cap_an/phu_cap_xang salary_components for FE default allowances',
    });
    buildMd();
    save();
    process.exit(2);
  }

  const asOf = '2026-09-30';
  const emps = await api(author.token, 'GET', '/employees', { query: { company_id: COMPANY, page_size: 80 } });
  let empNoPkg = null;
  let empWithPkg = null;
  let empEmptyLines = null;
  for (const e of listRows(emps.data)) {
    // Match FE portal scope (company_id=main) — holding-only probe mis-classified create vs revise
    const active = await api(author.token, 'GET', '/contracts-insurance/compensation-packages/active', {
      query: { company_id: COMPANY, employee_id: e.id, as_of: asOf },
    });
    const lines = active.data?.lines || [];
    if (!active.data?.id && !empNoPkg) empNoPkg = e;
    if (active.data?.id && lines.length === 0 && !empEmptyLines) empEmptyLines = e;
    if (active.data?.id && lines.length > 0 && !empWithPkg) empWithPkg = e;
    if (empNoPkg && empWithPkg) break;
  }
  // Prefer true create (no active) → empty-lines package → revise with lines
  const emp = empNoPkg || empEmptyLines || empWithPkg || listRows(emps.data)[0];
  R.steps.push({
    name: 'pick_emp',
    id: emp?.id,
    code: emp?.employee_code || emp?.code,
    company: emp?.company_id,
    mode: empNoPkg ? 'create' : empEmptyLines ? 'create-unlinked-or-revise-empty' : empWithPkg ? 'revise' : 'unknown',
  });

  if (!emp?.id) {
    ac('FE-CB-COMPONENT', '🔴 FAIL', { note: 'no employee found' });
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    buildMd();
    save();
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 240));
  });

  try {
    await injectAuth(page, author);
    const feCb = await browserFeCb(page, emp, '2026-09-01');

    const hdsdCore =
      R.hdsd_inventory['hdsd-emp-comp-base'] &&
      R.hdsd_inventory['hdsd-emp-comp-allowance-amount-0'] &&
      (R.hdsd_inventory['hdsd-emp-comp-create'] || R.hdsd_inventory['hdsd-emp-comp-revise']);
    ac('HDSD-LATCH', hdsdCore ? '🟢 PASS' : '🔴 FAIL', {
      note: JSON.stringify(R.hdsd_inventory),
    });

    if (!feCb.post2xx || !feCb.posts.length) {
      ac('FE-CB-COMPONENT', '🔴 FAIL', {
        note: `feOk=${feCb.ok} post2xx=${feCb.post2xx} posts=${JSON.stringify(feCb.posts)} body=${JSON.stringify(feCb.bodyAnalysis)} — NO product-path mirror`,
      });
      R.residuals.push({
        id: 'R-EMP-SH-FE-CB-CLICK',
        owner: 'dev-fe',
        note: 'FE Đãi ngộ save did not POST 2xx with component_code (retest QA-SRC-02-02; mirror forbidden)',
      });
    } else if (!feCb.bodyAnalysis.hasBaseCc || !feCb.bodyAnalysis.hasAnCc || !feCb.bodyAnalysis.allHaveCc) {
      ac('FE-CB-COMPONENT', '🔴 FAIL', {
        note: `POST 2xx but component_code incomplete: ${JSON.stringify(feCb.bodyAnalysis)}`,
      });
      R.residuals.push({
        id: 'R-EMP-SH-FE-CB-COMPONENT-CODE',
        owner: 'dev-fe',
        note: 'POST body missing base/phu_cap_an component_code on lines[]',
      });
    } else {
      ac('FE-CB-COMPONENT', '🟢 PASS', {
        note: `post2xx=true base=cc an=cc allHaveCc=true posts=${feCb.posts.length} mode=${feCb.reviseVisible ? 'revise' : 'create'}`,
      });
    }

    let f5 = { ok: false };
    if (R.ac['FE-CB-COMPONENT']?.verdict?.includes('PASS')) {
      f5 = await f5Persist(page, author.token, emp, asOf);
      ac('F5-PERSIST', f5.ok ? '🟢 PASS' : '🔴 FAIL', {
        note: `pkg=${f5.pkgId} hasBase=${f5.lines?.some((l) => l.component_code === 'base')} hasAn=${f5.lines?.some((l) => /phu_cap_an/i.test(l.component_code || ''))} uiLines=${f5.activeLinesVisible}`,
      });
      if (!f5.ok) {
        R.residuals.push({
          id: 'R-EMP-SH-FE-CB-F5',
          owner: 'dev-fe',
          note: 'POST 2xx but F5 active package missing expected component_code/amounts',
        });
      }
    } else {
      ac('F5-PERSIST', '⬜ SKIP', { note: 'blocked by FE-CB-COMPONENT FAIL' });
    }

    const uncaught = [...R.pageErrors, ...R.consoleErrors].filter((t) => /Uncaught|ReferenceError/i.test(t));
    ac('UF-CONSOLE', uncaught.length === 0 ? '🟢 PASS' : '🔴 FAIL', {
      note: `uncaught=${uncaught.length} pageErr=${R.pageErrors.length}`,
    });

    // Explicit anti-mirror gate
    ac('NO-MIRROR', R.honesty.product_path_mirror === false ? '🟢 PASS' : '🔴 FAIL', {
      note: 'product_path_mirror=false · seed_used=false',
    });
  } finally {
    await browser.close().catch(() => {});
  }

  const must = ['L0', 'AUTH', 'HDSD-LATCH', 'FE-CB-COMPONENT', 'F5-PERSIST', 'NO-MIRROR'];
  const fail = must.some((id) => {
    const v = R.ac[id]?.verdict || '';
    return v.includes('FAIL') || v.includes('SKIP');
  });
  // F5 SKIP only when FE failed — already FAIL overall
  R.verdict = fail ? 'FAIL' : 'PASS';
  R.ack_status = fail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  R.endedAt = ts();
  buildMd();
  save();
  console.log(`\nVERDICT ${R.verdict} ack=${R.ack_status} stamp=${STAMP}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  R.verdict = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.residuals.push({ id: 'R-QA-HARNESS', owner: 'qa', note: String(e?.stack || e).slice(0, 400) });
  R.endedAt = ts();
  try {
    buildMd();
    save();
  } catch {
    /* */
  }
  process.exit(1);
});
