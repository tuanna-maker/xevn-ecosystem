#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02 — Browser AC-PAY-TPL-03
 * Prior: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02 READY_FOR_QA - retest R-PAY-PERIOD-LIST-TPL
 * U65 zero-seed · browser-only · honesty payroll_e2e_ready=false
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-amis-parity-pay-period-bind-qa-02');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `PAYBINDQA2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TPL_CODE = `qa_bind_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 36)}`;
const TPL_NAME = `Mẫu bind QA ${STAMP}`;
const PERIOD_NAME = `Bảng lương QA ${STAMP}`;
// Resolved after login to avoid HRM-PAY-002 overlap (or QA_PERIOD_MONTH/YEAR env)
let PERIOD_MONTH = Number(process.env.QA_PERIOD_MONTH || 0) || 0;
let PERIOD_YEAR = Number(process.env.QA_PERIOD_YEAR || 0) || 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02',
  startedAt: ts(),
  u65: 'zero-seed · browser-only · AC-PAY-TPL-03',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP, TPL_CODE, TPL_NAME, PERIOD_NAME, PERIOD_MONTH, PERIOD_YEAR },
  prior: { fe: 'PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01 READY_FOR_QA' },
  honesty: {
    payroll_e2e_ready: false,
    payroll_e2e_ready_claimed: false,
    seed_used: false,
    pack_is_not_mau: true,
  },
  l0: {},
  ac: {},
  network: [],
  requestBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  ids: { periodId: null, tplCode: TPL_CODE, tplName: TPL_NAME },
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
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


async function resolveFreePeriodSlot(token) {
  if (PERIOD_MONTH && PERIOD_YEAR) return { month: PERIOD_MONTH, year: PERIOD_YEAR, source: 'env' };
  const r = await fetch(HRM + '/api/hrm/payroll/periods?company_id=' + COMPANY, {
    headers: { Authorization: 'Bearer ' + token, 'x-tenant-id': TENANT, 'x-company-id': COMPANY },
  });
  const j = await r.json().catch(() => ({}));
  const rows = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.data) ? j.data.data : [];
  const occupied = new Set();
  for (const row of rows) {
    const sd = row.start_date || row.period_start;
    if (!sd) continue;
    const d = new Date(sd);
    const vn = new Date(d.getTime() + 7 * 3600_000);
    occupied.add(vn.getUTCMonth() + 1 + '-' + vn.getUTCFullYear());
  }
  const cy = new Date().getFullYear();
  const candidates = [];
  for (const y of [cy, cy + 1, cy - 1]) {
    for (let m = 1; m <= 12; m++) candidates.push({ month: m, year: y });
  }
  candidates.sort((a, b) => {
    const score = (x) => (x.month === 9 || x.month === 10 || x.month === 11 || x.month === 12 ? 0 : 1);
    return score(a) - score(b);
  });
  for (const c of candidates) {
    if (!occupied.has(c.month + '-' + c.year)) {
      PERIOD_MONTH = c.month;
      PERIOD_YEAR = c.year;
      return { ...c, source: 'probe', occupied: [...occupied].sort() };
    }
  }
  PERIOD_MONTH = 10;
  PERIOD_YEAR = cy + 1;
  return { month: PERIOD_MONTH, year: PERIOD_YEAR, source: 'fallback', occupied: [...occupied].sort() };
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
      if (!/\/api\/hrm\/payroll\/(periods|pay-sheet-templates|salary-templates)/.test(u)) return;
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
                paySheetTemplateId: body.paySheetTemplateId ?? body.pay_sheet_template_id,
                period_label: body.period_label,
                salaryTemplateId: body.salaryTemplateId ?? body.salary_template_id,
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
      if (!/\/api\/hrm\/payroll\/(periods|pay-sheet-templates|salary-templates)/.test(u)) return;
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
          const d = j?.data ?? j;
          if (d?.id) entry.dataId = d.id;
          if (d?.pay_sheet_template_id) entry.paySheetTemplateId = d.pay_sheet_template_id;
          if (d?.sheet_template_snapshot_json?.template_name)
            entry.snapshotTemplateName = d.sheet_template_snapshot_json.template_name;
          if (d?.start_date) entry.start_date = d.start_date;
          if (d?.end_date) entry.end_date = d.end_date;
          const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : null;
          if (list && /\/periods/.test(u) && method === 'GET') {
            entry.listCount = list.length;
            const hit =
              list.find((p) => String(p.period_label || '').includes(STAMP)) ||
              (results.ids.periodId ? list.find((p) => p.id === results.ids.periodId) : null);
            if (hit) {
              entry.listHit = {
                id: hit.id,
                pay_sheet_template_id: hit.pay_sheet_template_id ?? null,
                snapshot_name: hit.sheet_template_snapshot_json?.template_name ?? null,
                start_date: hit.start_date ?? null,
              };
            }
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

async function openPaySheetTplTab(page) {
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const tabBtn = page.getByTestId('settings-tab-pay-sheet-tpl');
  await tabBtn.scrollIntoViewIfNeeded().catch(() => {});
  await tabBtn.click({ force: true });
  await sleep(1500);
  await page.getByTestId('pay-sheet-tpl-settings-panel').waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
}

async function ensureActiveTemplate(page) {
  await openPaySheetTplTab(page);
  const existingRow = page.getByTestId(`pay-sheet-tpl-row-${TPL_CODE}`);
  if (await existingRow.isVisible().catch(() => false)) {
    return { created: false, code: TPL_CODE, name: TPL_NAME };
  }
  await page.getByTestId('hdsd-pay-sheet-tpl-new').click({ force: true }).catch(() => {});
  await sleep(400);
  await page.getByTestId('hdsd-pay-sheet-tpl-code').fill(TPL_CODE);
  await page.getByTestId('hdsd-pay-sheet-tpl-name').fill(TPL_NAME);
  // Picker uses active_only — draft templates never appear in period dialog
  await page.getByTestId('hdsd-pay-sheet-tpl-status').click({ force: true });
  await sleep(400);
  const activeOpt = page.getByRole('option', { name: /active|đang áp dụng|hiệu lực/i }).first();
  if (await activeOpt.isVisible().catch(() => false)) {
    await activeOpt.click({ force: true });
  } else {
    // fallback: SelectItem value=active
    const byVal = page.locator('[role="option"][data-value="active"], [data-radix-collection-item]', { hasText: /active/i }).first();
    await page.locator('[role="option"]').filter({ hasText: /^active$/i }).first().click({ force: true }).catch(async () => {
      await page.keyboard.type('active');
      await page.keyboard.press('Enter');
    });
  }
  await sleep(300);
  await page.getByTestId('hdsd-pay-sheet-tpl-save-header').click();
  await sleep(2000);
  const createPost = results.network.find(
    (n) => n.method === 'POST' && /\/pay-sheet-templates/.test(n.url) && n.status === 201,
  );
  const rowVisible = await page.getByTestId(`pay-sheet-tpl-row-${TPL_CODE}`).isVisible().catch(() => false);
  return { created: true, code: TPL_CODE, name: TPL_NAME, createPost, rowVisible };
}

async function openPayrollBatches(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const calcTab = page.getByTestId('payroll-tab-calculate');
  await calcTab.click({ force: true });
  await sleep(700);
  const listItem = page.getByRole('menuitem', { name: /danh sách bảng lương/i });
  if (await listItem.isVisible().catch(() => false)) {
    await listItem.click({ force: true });
  } else {
    await page
      .locator('[role="menuitem"]')
      .filter({ hasText: /danh sách/i })
      .first()
      .click({ force: true })
      .catch(() => {});
  }
  await sleep(2500);
  await page.getByTestId('pay-batches-precision').waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
}

async function pickSelectOption(page, trigger) {
  await trigger.scrollIntoViewIfNeeded().catch(() => {});
  await trigger.click({ force: true });
  await sleep(600);
  const options = page.locator('[role="listbox"] [role="option"], [role="option"]');
  const count = await options.count().catch(() => 0);
  if (count < 1) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, count: 0, text: null };
  }
  let idx = 0;
  for (let i = 0; i < count; i++) {
    const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
    if (/chọn mẫu|—|không có/i.test(t)) continue;
    idx = i;
    break;
  }
  const text = ((await options.nth(idx).innerText().catch(() => '')) || '').trim();
  await options.nth(idx).click({ force: true });
  await sleep(350);
  return { ok: Boolean(text), count, text };
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
  const slot = await resolveFreePeriodSlot(session.token);
  log('free_period_slot', { note: JSON.stringify(slot) });
  results.env.PERIOD_MONTH = PERIOD_MONTH;
  results.env.PERIOD_YEAR = PERIOD_YEAR;
  save();

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'vi-VN' });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // --- Step 1: Settings active mẫu (U65 create from FE) ---
    const tpl = await ensureActiveTemplate(page);
    await shot(page, '01-settings-active-template');
    const acTpl = tpl.rowVisible || tpl.createPost?.status === 201;
    recordAc('AC0_SETTINGS_ACTIVE_TPL', acTpl ? 'PASS' : 'FAIL', {
      summary: acTpl
        ? `Active mẫu ${TPL_CODE} ready (created=${tpl.created})`
        : 'Could not ensure active pay-sheet-template',
      tpl,
      click_path: 'settings-tab-pay-sheet-tpl → create mẫu active',
    });
    if (!acTpl) throw new Error('No active template');

    // --- Step 2: Open batches + create dialog (hard nav so template picker refetches) ---
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await openPayrollBatches(page);
    await shot(page, '02-payroll-batches-tab');
    const aliasNote = page.getByTestId('pay-period-pay-sheet-tpl-alias-note');
    const createBtn = page.getByRole('button', { name: /lập bảng lương/i }).first();
    await createBtn.click({ force: true });
    await sleep(1200);
    const dialog = page.getByTestId('pay-batch-create-dialog-precision');
    await dialog.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    const dialogVisible = await dialog.isVisible().catch(() => false);
    const aliasText = ((await aliasNote.innerText().catch(() => '')) || '').trim();
    const aliasOk = /salary-templates|gói|enroll/i.test(aliasText) && /pay-sheet-templates|mẫu bảng/i.test(aliasText);

    recordAc('AC1_DIALOG_PACK_NEQ_MAU', dialogVisible && aliasOk ? 'PASS' : 'FAIL', {
      summary:
        dialogVisible && aliasOk
          ? 'Create dialog shows pay-period-pay-sheet-tpl-alias-note pack≠mẫu'
          : `FAIL dialog=${dialogVisible} aliasOk=${aliasOk}`,
      aliasText: aliasText.slice(0, 280),
      click_path: 'payroll-tab-calculate → Danh sách bảng lương → Lập bảng lương',
    });

    // Fill form
    await dialog.locator('input').first().fill(PERIOD_NAME);
    await page.getByTestId('pay-batch-create-month-select').click({ force: true });
    await sleep(400);
    await page.getByTestId(`pay-batch-create-month-option-${PERIOD_MONTH}`).click({ force: true });
    await sleep(300);
    await page.getByTestId('pay-batch-create-year-select').click({ force: true });
    await sleep(400);
    await page.getByTestId(`pay-batch-create-year-option-${PERIOD_YEAR}`).click({ force: true });
    await sleep(300);

    const tplSelect = page.getByTestId('pay-period-pay-sheet-tpl-select');
    let pickedOk = false;
    let pickedLabel = null;
    for (let attempt = 0; attempt < 6 && !pickedOk; attempt++) {
      await tplSelect.click({ force: true });
      await sleep(800 + attempt * 400);
      const optionByCode = page.locator('[data-testid="pay-period-pay-sheet-tpl-option-' + TPL_CODE + '"]');
      if ((await optionByCode.count().catch(() => 0)) > 0) {
        await optionByCode.first().click({ force: true });
        pickedOk = true;
        pickedLabel = TPL_NAME;
        break;
      }
      const byStamp = page.getByRole('option').filter({ hasText: STAMP });
      if ((await byStamp.count().catch(() => 0)) > 0) {
        pickedLabel = ((await byStamp.first().innerText().catch(() => '')) || '').trim();
        await byStamp.first().click({ force: true });
        pickedOk = true;
        break;
      }
      await tplSelect.click({ force: true }).catch(() => {});
      await sleep(300);
    }
    if (!pickedOk) {
      await tplSelect.click({ force: true });
      await sleep(800);
      const options = page.locator('[role="listbox"] [role="option"], [role="option"]');
      const count = await options.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
        if (!t || /chọn mẫu|không có|Đang tải|Chưa có/i.test(t)) continue;
        await options.nth(i).click({ force: true });
        pickedOk = true;
        pickedLabel = t;
        break;
      }
    }
    await sleep(500);
    log('tpl_picked', { note: JSON.stringify({ pickedOk, TPL_CODE, pickedLabel }) });
    if (!(await page.getByTestId('hdsd-pay-period-create-submit').isVisible().catch(() => false))) {
      throw new Error('Create dialog submit missing after tpl pick');
    }
    await shot(page, '03-create-dialog-filled');

    const preSubmitBodies = results.requestBodies.length;
    await page.getByTestId('hdsd-pay-period-create-submit').click({ force: true });
    await sleep(3500);

    const periodPost = results.network.find(
      (n) => n.method === 'POST' && /\/payroll\/periods$/.test(n.url) && !/\/process/.test(n.url),
    );
    const periodBody = results.requestBodies.find(
      (b) => b.method === 'POST' && /\/payroll\/periods/.test(b.url) && b.at >= results.ac.AC1_DIALOG_PACK_NEQ_MAU?.at,
    );
    const postOk =
      periodPost?.status === 201 &&
      periodPost?.code === 'HRM-PAY-201' &&
      Boolean(periodBody?.body?.paySheetTemplateId);
    const noSalaryTemplateSoT = !results.requestBodies.some(
      (b) =>
        b.method === 'POST' &&
        /\/payroll\/periods/.test(b.url) &&
        (b.body?.salaryTemplateId || /salary-templates/.test(b.url)),
    );
    if (periodPost?.dataId) results.ids.periodId = periodPost.dataId;
    // Realign filter to VN calendar month of created start_date (form month can diverge)
    if (periodPost?.start_date) {
      const d = new Date(periodPost.start_date);
      const vn = new Date(d.getTime() + 7 * 3600_000);
      PERIOD_MONTH = vn.getUTCMonth() + 1;
      PERIOD_YEAR = vn.getUTCFullYear();
      results.env.PERIOD_MONTH = PERIOD_MONTH;
      results.env.PERIOD_YEAR = PERIOD_YEAR;
      log('period_slot_realign', {
        note: JSON.stringify({ start_date: periodPost.start_date, PERIOD_MONTH, PERIOD_YEAR }),
      });
      save();
    }

    recordAc('AC2_POST_PERIOD_BIND', postOk && noSalaryTemplateSoT ? 'PASS' : 'FAIL', {
      summary: postOk
        ? `POST periods 201 HRM-PAY-201 paySheetTemplateId present · no salary-templates SoT`
        : `FAIL post status=${periodPost?.status} code=${periodPost?.code} tplId=${periodBody?.body?.paySheetTemplateId}`,
      periodPost,
      periodBody,
      snapshotName: periodPost?.snapshotTemplateName,
      click_path: 'hdsd-pay-period-create-submit',
    });

    await dialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null);
    await sleep(1500);

    async function applyPeriodFilterInPlace() {
      const filter = page.getByTestId('pay-batch-period-filter');
      if (!(await filter.isVisible().catch(() => false))) return { ok: false, via: 'no-filter' };
      await filter.click({ force: true });
      await sleep(700);
      const opt = page.locator('[data-testid="pay-batch-period-option-' + PERIOD_MONTH + '-' + PERIOD_YEAR + '"]');
      try {
        await opt.first().click({ force: true, timeout: 8000 });
        await sleep(1800);
        return { ok: true, via: 'select-inplace', month: PERIOD_MONTH, year: PERIOD_YEAR };
      } catch {
        await page.keyboard.press('Escape').catch(() => {});
        return { ok: false, via: 'select-miss', month: PERIOD_MONTH, year: PERIOD_YEAR };
      }
    }

    async function openBatchesForSlot() {
      // Prefer in-place filter (avoid portal reload flakiness)
      if (await page.getByTestId('pay-batches-precision').isVisible().catch(() => false)) {
        const inplace = await applyPeriodFilterInPlace();
        if (inplace.ok) return inplace;
      }
      await openPayrollBatches(page);
      const inplace2 = await applyPeriodFilterInPlace();
      if (inplace2.ok) return inplace2;

      // Deep-link remount fallback
      const u = new URL(page.url());
      u.searchParams.set('portal', '1');
      u.searchParams.set('tenantId', TENANT);
      u.searchParams.set('companyId', COMPANY);
      u.searchParams.set('pay_period_month', String(PERIOD_MONTH));
      u.searchParams.set('pay_period_year', String(PERIOD_YEAR));
      if (results.ids.periodId) u.searchParams.set('pay_batch_id', results.ids.periodId);
      u.searchParams.set('_', String(Date.now()));
      await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2800);
      if (!(await page.getByTestId('pay-batches-precision').isVisible().catch(() => false))) {
        await openPayrollBatches(page);
      }
      const inplace3 = await applyPeriodFilterInPlace();
      return inplace3.ok ? inplace3 : { ok: true, via: 'deeplink-remount', month: PERIOD_MONTH, year: PERIOD_YEAR };
    }
    const filterSet = await openBatchesForSlot();
    log('period_filter_set', { note: JSON.stringify(filterSet) });
    await shot(page, '04-after-create-list');

    const periodId = results.ids.periodId;
    const listHits = results.network
      .filter((n) => n.method === 'GET' && /\/payroll\/periods/.test(n.url) && n.listHit)
      .map((n) => n.listHit);
    const listHit =
      (periodId && listHits.filter((h) => h.id === periodId).slice(-1)[0]) ||
      listHits[listHits.length - 1] ||
      null;
    const listApiOk = Boolean(
      listHit?.pay_sheet_template_id &&
        listHit?.snapshot_name &&
        (String(listHit.snapshot_name).includes(TPL_NAME) ||
          String(listHit.snapshot_name).includes(TPL_CODE) ||
          (periodPost?.snapshotTemplateName &&
            String(listHit.snapshot_name).includes(periodPost.snapshotTemplateName))),
    );

    let rowTplText = '';
    if (periodId) {
      const rowCell = page.getByTestId('pay-batch-row-tpl-' + periodId);
      rowTplText = ((await rowCell.innerText().catch(() => '')) || '').trim();
    } else {
      const row = page.locator('tr:has-text("' + PERIOD_NAME + '")').first();
      rowTplText = ((await row.locator('td').nth(3).innerText().catch(() => '')) || '').trim();
    }
    const rowHasName =
      rowTplText.includes(TPL_NAME) ||
      rowTplText.includes(TPL_CODE) ||
      (periodPost?.snapshotTemplateName && rowTplText.includes(periodPost.snapshotTemplateName));
    const ac3Ok = listApiOk && rowHasName;

    recordAc('AC3_ROW_TPL_AFTER_CREATE', ac3Ok ? 'PASS' : 'FAIL', {
      summary: ac3Ok
        ? 'List API snapshot="' + (listHit?.snapshot_name || '') + '" row="' + rowTplText + '"'
        : 'FAIL listApiOk=' + listApiOk + ' listHit=' + JSON.stringify(listHit) + ' rowTpl="' + rowTplText + '"',
      rowTplText,
      listHit,
      listApiOk,
      filterSet,
      periodId,
      click_path: 'list after POST + pay-batch-period-filter',
    });
    if (!listApiOk) {
      results.residuals.push({
        id: 'R-PAY-PERIOD-LIST-TPL',
        owner: 'dev-be',
        note: 'GET /payroll/periods list missing pay_sheet_template_id / snapshot template_name',
      });
    } else if (!rowHasName) {
      results.residuals.push({
        id: 'R-PAY-PERIOD-ROW-TPL-FE',
        owner: 'dev-fe',
        note: 'List API has snapshot but row cell="' + rowTplText + '"',
      });
    }

    // Detail subtitle
    if (!periodId) {
      recordAc('AC4_DETAIL_TPL_SUBTITLE', 'FAIL', {
        summary: 'SKIP/FAIL — no periodId (POST did not create)',
        click_path: 'blocked',
      });
      throw new Error('No periodId after POST — cannot continue AC4/AC5');
    }
    const rowLocator = page.getByTestId('pay-batch-row-' + periodId);
    await rowLocator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
    if (!(await rowLocator.isVisible().catch(() => false))) {
      // one more deeplink retry
      await openBatchesForSlot();
      await rowLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    }
    if (await rowLocator.isVisible().catch(() => false)) {
      await rowLocator.click({ force: true });
    } else {
      recordAc('AC4_DETAIL_TPL_SUBTITLE', 'FAIL', {
        summary: 'FAIL row not visible after deeplink filter ' + PERIOD_MONTH + '/' + PERIOD_YEAR,
        filterSet,
        click_path: 'pay_period_month deep-link',
      });
      results.residuals.push({
        id: 'R-PAY-PERIOD-FILTER-UX',
        owner: 'dev-fe',
        note: 'Created period row not visible after pay_period_month/year deep-link',
      });
      throw new Error('Row not visible for detail');
    }
    await sleep(2000);
    await shot(page, '05-detail-subtitle');
    const detailText = ((await page.locator('h1, h2, h3, p, span').filter({ hasText: /Mẫu:/ }).first().innerText().catch(() => '')) || '').trim();
    const detailHasName =
      detailText.includes(TPL_NAME) ||
      detailText.includes(TPL_CODE) ||
      (periodPost?.snapshotTemplateName && detailText.includes(periodPost.snapshotTemplateName));

    recordAc('AC4_DETAIL_TPL_SUBTITLE', detailHasName ? 'PASS' : 'FAIL', {
      summary: detailHasName ? `Detail subtitle: ${detailText}` : `FAIL detail missing mẫu: "${detailText}"`,
      detailText,
      click_path: 'click pay-batch-row → detail header Mẫu:',
    });

    // F5
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3500);
    const filterSetF5 = await openBatchesForSlot();
    log('period_filter_set_f5', { note: JSON.stringify(filterSetF5) });
    await shot(page, '06-after-f5-list');

    const listHitsF5 = results.network
      .filter((n) => n.method === 'GET' && /\/payroll\/periods/.test(n.url) && n.listHit)
      .map((n) => n.listHit);
    const listHitF5 =
      listHitsF5.filter((h) => h.id === periodId).slice(-1)[0] ||
      listHitsF5[listHitsF5.length - 1] ||
      null;
    const listApiF5Ok = Boolean(
      listHitF5?.pay_sheet_template_id &&
        listHitF5?.snapshot_name &&
        (String(listHitF5.snapshot_name).includes(TPL_NAME) ||
          String(listHitF5.snapshot_name).includes(TPL_CODE) ||
          (periodPost?.snapshotTemplateName &&
            String(listHitF5.snapshot_name).includes(periodPost.snapshotTemplateName))),
    );

    let rowTplAfterF5 = '';
    rowTplAfterF5 = ((await page.getByTestId('pay-batch-row-tpl-' + periodId).innerText().catch(() => '')) || '').trim();
    const periodStillThere = await page.getByTestId('pay-batch-row-' + periodId).isVisible().catch(() => false);
    const rowF5Ok =
      periodStillThere &&
      (rowTplAfterF5.includes(TPL_NAME) ||
        rowTplAfterF5.includes(TPL_CODE) ||
        (periodPost?.snapshotTemplateName && rowTplAfterF5.includes(periodPost.snapshotTemplateName)));
    const f5TplOk = listApiF5Ok && rowF5Ok;

    recordAc('AC5_F5_ROW_TPL_PERSIST', f5TplOk ? 'PASS' : 'FAIL', {
      summary: f5TplOk
        ? 'F5: list snapshot="' + (listHitF5?.snapshot_name || '') + '" row="' + rowTplAfterF5 + '"'
        : 'FAIL F5 listApi=' + listApiF5Ok + ' period=' + periodStillThere + ' rowTpl="' + rowTplAfterF5 + '"',
      rowTplAfterF5,
      listHitF5,
      listApiF5Ok,
      periodStillThere,
      click_path: 'F5 -> reopen batches list -> pay-batch-period-filter',
    });
    if (!listApiF5Ok) {
      if (!results.residuals.some((r) => r.id === 'R-PAY-PERIOD-LIST-TPL')) {
        results.residuals.push({
          id: 'R-PAY-PERIOD-LIST-TPL',
          owner: 'dev-be',
          note: 'F5 GET list missing pay_sheet_template_id / snapshot',
        });
      }
    } else if (!rowF5Ok) {
      if (!results.residuals.some((r) => r.id === 'R-PAY-PERIOD-ROW-TPL-FE')) {
        results.residuals.push({
          id: 'R-PAY-PERIOD-ROW-TPL-FE',
          owner: 'dev-fe',
          note: 'F5 list API OK but row="' + rowTplAfterF5 + '"',
        });
      }
    }

    // Pack enroll regression
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2000);
    await page.getByTestId('payroll-tab-calculate').click({ force: true });
    await sleep(600);
    const packMenu = page.getByRole('menuitem', { name: /mẫu bảng lương/i });
    if (await packMenu.isVisible().catch(() => false)) await packMenu.click({ force: true });
    await sleep(2000);
    const packBanner = page.getByTestId('pay-salary-template-pack-alias-note');
    const packOk = await packBanner.isVisible().catch(() => false);
    recordAc('AC6_PACK_ENROLL_REGRESSION', packOk ? 'PASS' : 'FAIL', {
      summary: packOk ? 'Enroll tab still pack-only banner' : 'FAIL pack regression',
      click_path: 'calc-template enroll · pay-salary-template-pack-alias-note',
    });

    const corePass = ['AC2_POST_PERIOD_BIND', 'AC3_ROW_TPL_AFTER_CREATE', 'AC4_DETAIL_TPL_SUBTITLE', 'AC5_F5_ROW_TPL_PERSIST'].every(
      (k) => results.ac[k]?.verdict === 'PASS',
    );
    results.overall = corePass ? 'PASS' : 'FAIL';
    results.ack_status = results.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    results.honesty.payroll_e2e_ready = false;
    save();

    console.log(
      JSON.stringify(
        {
          overall: results.overall,
          ack_status: results.ack_status,
          stamp: STAMP,
          periodId: results.ids.periodId,
          ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
          residuals: results.residuals,
        },
        null,
        2,
      ),
    );

    await browser.close();
    process.exit(results.overall === 'PASS' ? 0 : 1);
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'HARNESS', owner: 'qa', note: String(e).slice(0, 240) });
    results.endedAt = ts();
    save();
    console.error('HARNESS FAIL', e);
    await browser.close().catch(() => {});
    process.exit(2);
  }
}

main();
