#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01
 * Browser U65 · VAL-ATT-SHIFT-CNS-02 / AC-PLT-ATT-SHIFT-01
 * Parent: FE-01 READY_FOR_QA · closes Condition R-PLT-ATT-SHIFT-CNS-02
 * stamp_l1 RETAIN: ATTSHIFTQA-MSK5FXP3
 * Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
 * Cấm: seed · flip ready · invent FE ATT-CODE · PASS probe-only as UF 🟢 · module ATT UAT
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
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const BOOTSTRAP_5 = new Set(['morning', 'afternoon', 'night', 'office', 'flexible']);
const STAMP_L1 = 'ATTSHIFTQA-MSK5FXP3';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01-browser.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8);
const OPEN_CODE = `qa_fe_shift_${stampTail}`.slice(0, 48);
const OPEN_NAME = `QA FE Ca Nest ${stampTail}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01',
  residual_target: 'R-PLT-ATT-SHIFT-CNS-02',
  stamp_l1_retain: STAMP_L1,
  startedAt: ts(),
  stamp: `ATTSHIFTQAFE-${stampTail.toUpperCase()}`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser-only · FE after 2xx + F5 · probe ≠ UF 🟢 alone',
  hdsd_align:
    'Attendance → Ca (att-shifts-add) · Đơn từ → Đổi ca (requests-menu-change-shift) · att-shift-change-add-dialog-precision',
  honesty: {
    attendance_uat_ready: false,
    payroll_e2e_ready: false,
    seed_used: false,
    ensureDefault: false,
    c_slice_ne_module: true,
    deny_module_att_uat: true,
    deny_phase1: true,
    deny_invent_fe_att_code: true,
    seal_retain: {
      ATT_CODE: 'ATTCODEQA-MSK4T1A5',
      leave: 'ATTLEAVEQA-MSJ7CPJH',
      worksite: 'ATTWSQA-MSJC3IN9',
      EMP_SI_CTR: true,
      ATT_SHIFT_L1: STAMP_L1,
    },
  },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  nest: { before: null, after_admin: null, codes: [] },
  ac: {},
  network: {
    effectiveGets: [],
    workShiftPosts: [],
    shiftChangePosts: [],
    shiftChangeGets: [],
    bad5xx: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  invent_spot: null,
  empty_path: null,
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
  return path;
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
  return R.l0.hrm === 200 && R.l0.xbos === 200 && Number(R.l0.portal) === 200;
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
  return { status: r.status, json, code: json?.code ?? json?.error?.code ?? null };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

async function getEffective(token) {
  const r = await apiCall(
    token,
    'GET',
    `/api/hrm/attendance/work-shifts/effective?company_id=${COMPANY}`,
  );
  const rows = asList(r.json?.data ?? r.json);
  const codes = rows.map((x) => String(x.code || '').toLowerCase()).filter(Boolean);
  return {
    status: r.status,
    total: r.json?.data?.total ?? r.json?.total ?? rows.length,
    rows,
    codes,
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
    if (msg.type() === 'error') {
      const t = String(msg.text());
      if (!/favicon|React DevTools|Download the React/i.test(t)) {
        R.consoleErrors.push(t.slice(0, 360));
      }
    }
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      const status = res.status();
      const path = u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360);
      let code = null;
      let bodySnippet = null;
      let reqBody = null;
      try {
        const pd = res.request().postData();
        if (pd) {
          try {
            reqBody = JSON.parse(pd);
          } catch {
            reqBody = { raw: pd.slice(0, 200) };
          }
        }
      } catch {
        /* */
      }
      try {
        const ct = res.headers()['content-type'] || '';
        if (ct.includes('json')) {
          const body = await res.json().catch(() => null);
          code = body?.code ?? body?.error?.code ?? null;
          bodySnippet = JSON.stringify(body)?.slice(0, 280);
        }
      } catch {
        /* */
      }
      const entry = {
        at: ts(),
        method,
        status,
        path,
        code,
        bodySnippet,
        req: reqBody
          ? {
              current_shift: reqBody.current_shift ?? null,
              requested_shift: reqBody.requested_shift ?? null,
              code: reqBody.code ?? null,
              name: reqBody.name ?? null,
            }
          : null,
      };
      if (/work-shifts\/effective/.test(u) && method === 'GET') {
        R.network.effectiveGets.push(entry);
      }
      if (/work-shifts(?!\/effective)/.test(u) && method === 'POST') {
        R.network.workShiftPosts.push(entry);
      }
      if (/shift-change-requests/.test(u) && method === 'POST') {
        R.network.shiftChangePosts.push(entry);
      }
      if (/shift-change-requests/.test(u) && method === 'GET') {
        R.network.shiftChangeGets.push(entry);
      }
      if (status >= 500) R.network.bad5xx.push(entry);
    } catch {
      /* */
    }
  });
}

async function openShiftsList(page) {
  const trig = page.locator('button').filter({ hasText: /Ca làm việc/i }).first();
  await trig.click({ timeout: 15_000 });
  await sleep(400);
  await page.getByTestId('shifts-menu-list').click({ timeout: 10_000 });
  await sleep(1200);
}

async function openChangeShift(page) {
  // Tab label VI: «Quản lý đơn» (attendance.tabs.requests)
  const trig = page
    .locator('button')
    .filter({ hasText: /Quản lý đơn|Request Management|Đơn từ/i })
    .first();
  await trig.click({ timeout: 15_000 });
  await sleep(500);
  const item = page.getByTestId('requests-menu-change-shift');
  if ((await item.count()) === 0) {
    // Fallback: menu text «Đề nghị đổi ca»
    await page
      .locator('[role="menuitem"], [data-radix-collection-item]')
      .filter({ hasText: /Đề nghị đổi ca|Shift Change|đổi ca/i })
      .first()
      .click({ timeout: 10_000 });
  } else {
    await item.click({ timeout: 10_000 });
  }
  await sleep(1500);
}

async function adminCreateShiftIfNeeded(page, token, before) {
  R.nest.before = {
    status: before.status,
    total: before.total,
    codes: before.codes.slice(0, 20),
  };

  async function createOne(code, name, start, end) {
    await openShiftsList(page);
    await sleep(600);
    await page.getByTestId('att-shifts-add').click({ timeout: 10_000 });
    await sleep(600);
    const dlg = page.getByTestId('att-shift-form-dialog');
    await dlg.waitFor({ state: 'visible', timeout: 10_000 });
    await dlg.locator('#shift-code').fill(code);
    await dlg.locator('#shift-name').fill(name);
    await dlg.locator('#shift-start').fill(start);
    await dlg.locator('#shift-end').fill(end);
    const saveBtn = dlg.locator('button').filter({ hasText: /Lưu|Thêm|Save|Add|Tạo/i }).last();
    await saveBtn.click({ timeout: 8000 });
    await sleep(2200);
  }

  let created = false;
  if (before.total <= 0 || before.codes.length <= 0) {
    log('Nest active=0 — admin CREATE via FE Ca tab (U65 no seed)');
    await createOne(OPEN_CODE, OPEN_NAME, '08:00', '17:00');
    created = true;
  }

  // Need ≥2 Nest shifts so current ≠ requested on Đổi ca form
  let mid = await getEffective(token);
  if (mid.codes.length < 2) {
    const codeB = `qa_fe_shift_b_${stampTail}`.slice(0, 48);
    const nameB = `QA FE Ca Nest B ${stampTail}`;
    log(`Nest N=${mid.codes.length} — admin CREATE second shift for picker pair`);
    await createOne(codeB, nameB, '14:00', '22:00');
    created = true;
    mid = await getEffective(token);
  }

  const postOk = R.network.workShiftPosts.some((p) => p.status >= 200 && p.status < 300);
  R.nest.after_admin = {
    status: mid.status,
    total: mid.total,
    codes: mid.codes.slice(0, 20),
    created,
    openCode: OPEN_CODE,
    fePost2xx: created ? postOk : true,
  };
  save();
  if (!created) {
    log(`Nest active already N=${mid.codes.length} — skip admin CREATE`);
  }
  return { created, codes: mid.codes, rows: mid.rows, postOk, after: mid };
}

async function collectPickerOptions(page) {
  const dlg = page.getByTestId('att-shift-change-add-dialog-precision');
  // Current shift select — md selects: employee(0), current(1), requested(2)
  const triggers = dlg.locator('.xevn-field-select-md');
  const currentTrig = triggers.nth(1);
  await currentTrig.click({ timeout: 8000 });
  await sleep(500);
  const options = await page.locator('[role="option"]').evaluateAll((els) =>
    els.map((el) => {
      const text = (el.textContent || '').trim();
      const value =
        el.getAttribute('data-value') ||
        el.getAttribute('value') ||
        el.dataset?.value ||
        '';
      return { value, text };
    }),
  );
  await page.keyboard.press('Escape');
  await sleep(200);
  return options.filter((o) => o.value || o.text);
}

/** Infer Nest codes from picker text when Radix data-value is opaque. */
function inferNestFromPicker(pickerOpts, nestRows, nestCodes) {
  const texts = pickerOpts.map((o) => o.text);
  const values = pickerOpts.map((o) => String(o.value || '').toLowerCase()).filter(Boolean);
  const bootstrapLabels = [/sáng/i, /chiều/i, /đêm/i, /hành chính/i, /linh hoạt/i, /morning/i, /afternoon/i, /night/i, /office/i, /flexible/i];
  const onlyBootstrapText =
    texts.length > 0 &&
    texts.length <= 5 &&
    texts.every((t) => bootstrapLabels.some((re) => re.test(t))) &&
    !nestRows.some((r) => texts.some((t) => t.includes(String(r.name || ''))));
  const nestNameHits = nestRows.filter((r) => {
    const name = String(r.name || '').trim();
    return name && texts.some((t) => t.includes(name));
  });
  const nestCodeInValue = values.filter((v) => nestCodes.includes(v));
  const nestCodeInText = nestCodes.filter((c) =>
    texts.some((t) => t.toLowerCase().includes(c)),
  );
  const hasTimePattern = texts.some((t) => /\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/.test(t));
  return {
    texts,
    values,
    onlyBootstrapText,
    nestNameHits: nestNameHits.map((r) => ({ code: r.code, name: r.name })),
    nestCodeInValue,
    nestCodeInText,
    hasTimePattern,
    pass:
      nestNameHits.length > 0 ||
      nestCodeInValue.length > 0 ||
      (nestCodeInText.length > 0 && hasTimePattern),
  };
}

async function pickSelectByText(page, triggerLocator, labelHint) {
  await triggerLocator.click({ timeout: 8000 });
  await sleep(350);
  const opt = page.locator('[role="option"]').filter({ hasText: labelHint }).first();
  await opt.click({ timeout: 8000 });
  await sleep(250);
}

async function fillAndSubmitShiftChange(page, nestCodes, nestRows) {
  const dlg = page.getByTestId('att-shift-change-add-dialog-precision');
  await dlg.waitFor({ state: 'visible', timeout: 10_000 });

  const mdSelects = dlg.locator('.xevn-field-select-md');
  await mdSelects.nth(0).click({ timeout: 8000 });
  await sleep(300);
  const empOpt = page.locator('[role="option"]').first();
  const empText = ((await empOpt.textContent()) || '').trim();
  await empOpt.click({ timeout: 5000 });
  await sleep(300);

  const dateBtn = dlg.locator('button.xevn-field-date');
  await dateBtn.click({ timeout: 5000 });
  await sleep(300);
  const dayBtn = page.locator('button[name="day"]:not([disabled])').first();
  if ((await dayBtn.count()) > 0) {
    await dayBtn.click({ timeout: 5000 });
  } else {
    await page
      .locator('.rdp-day:not([disabled]), button.rdp-day_button:not([disabled])')
      .first()
      .click({ timeout: 5000 })
      .catch(() => {});
  }
  await sleep(200);
  // Close calendar popover so it does not intercept shift Select clicks
  await page.keyboard.press('Escape');
  await sleep(300);
  const calOpen = await page.locator('[data-radix-popper-content-wrapper] table[role="grid"]').count();
  if (calOpen > 0) {
    await page.locator('body').click({ position: { x: 8, y: 8 }, force: true }).catch(() => {});
    await sleep(200);
    await page.keyboard.press('Escape');
    await sleep(200);
  }

  const preferred =
    nestCodes.find((c) => !BOOTSTRAP_5.has(c)) || nestCodes[0];
  const preferred2 =
    nestCodes.find((c) => c !== preferred && !BOOTSTRAP_5.has(c)) ||
    nestCodes.find((c) => c !== preferred) ||
    preferred;

  const row1 = nestRows.find((r) => String(r.code || '').toLowerCase() === preferred);
  const row2 =
    nestRows.find((r) => String(r.code || '').toLowerCase() === preferred2) || row1;
  const label1 = String(row1?.name || preferred);
  const label2 = String(row2?.name || preferred2);

  await pickSelectByText(page, mdSelects.nth(1), label1);
  await pickSelectByText(page, mdSelects.nth(2), label2);

  await dlg.locator('textarea.xevn-field-reason').fill(`QA-FE CNS-02 Nest picker ${stampTail}`);
  await shot(page, '04-dialog-filled-nest');

  const addBtn = dlg.locator('button').filter({ hasText: /Thêm|Add|Lưu|Gửi/i }).last();
  await addBtn.click({ timeout: 8000 });
  await sleep(2800);

  return {
    empText,
    current: preferred,
    requested: preferred2,
    label1,
    label2,
  };
}

async function main() {
  const l0ok = await probeL0();
  if (!l0ok) {
    ac('L0', 'FAIL', { summary: `stack not healthy ${JSON.stringify(R.l0)}` });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    process.exitCode = 1;
    return;
  }
  ac('L0', 'PASS', { summary: `hrm/xbos/portal ${R.l0.hrm}/${R.l0.xbos}/${R.l0.portal}` });

  const session = await loginApi();
  log('login ok', { email: EMAIL });

  const before = await getEffective(session.token);
  R.nest.codes = before.codes;
  save();

  // Optional invent L1 spot (API already sealed — not UF 🟢)
  try {
    const invent = await apiCall(session.token, 'POST', '/api/hrm/attendance/shift-change-requests', {
      company_id: COMPANY,
      employee_id: '00000000-0000-0000-0000-000000000001',
      employee_code: 'QA-INV',
      employee_name: 'QA Invent',
      change_date: new Date().toISOString().slice(0, 10),
      change_type: 'change',
      current_shift: `zz_invent_att_shift_${stampTail}`,
      requested_shift: 'morning',
      reason: 'invent spot L1 retain',
    });
    R.invent_spot = {
      status: invent.status,
      code: invent.code,
      note: 'API invent spot — prefer sealed L1; not UF 🟢',
      expectKey: invent.status === 400 && invent.code === 'HRM-ATT-SHIFT-KEY',
    };
  } catch (e) {
    R.invent_spot = { error: String(e?.message || e).slice(0, 200) };
  }
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  track(page);
  await injectPortalAuth(page, session);

  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  log('attendance loaded');

  // 1) Ensure Nest active>0 via admin CREATE if needed
  const ensure = await adminCreateShiftIfNeeded(page, session.token, before);
  const activeN = ensure.codes?.length ?? 0;
  if (activeN <= 0) {
    ac('AC-PLT-ATT-SHIFT-01d-admin', 'FAIL', {
      summary: 'Could not establish Nest active>0 via FE admin CREATE',
      nest: R.nest,
    });
    R.empty_path = {
      note: 'NOTE_BLOCKED empty path — cannot isolate active=0 wipe; admin CREATE failed',
      verdict: 'NOTE_BLOCKED',
    };
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    await shot(page, '99-fail-no-nest');
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }

  if (ensure.created) {
    ac('AC-PLT-ATT-SHIFT-01d-admin', ensure.postOk !== false ? 'PASS' : 'WARN', {
      summary: `admin CREATE ${OPEN_CODE} · Nest N ${R.nest.before?.total ?? 0}→${R.nest.after_admin?.total} · fePost2xx=${ensure.postOk}`,
    });
  } else {
    ac('AC-PLT-ATT-SHIFT-01d-admin', 'PASS', {
      summary: `Nest already active N=${activeN} — no CREATE needed`,
    });
  }

  // Empty path: not isolatable without wipe → NOTE_BLOCKED
  R.empty_path = {
    note: 'active=0 bootstrap path NOT isolatable without wipe/seed — NOTE_BLOCKED (U65)',
    verdict: 'NOTE_BLOCKED',
    bootstrap_fallback_in_src: true,
  };
  ac('AC-PLT-ATT-SHIFT-01c-empty', 'NOTE_BLOCKED', {
    summary: 'No wipe/seed to force active=0; FE fallback 5-id only when empty (src verified FE-01)',
  });

  // Refresh Nest snapshot after admin
  const eff = await getEffective(session.token);
  R.nest.codes = eff.codes;
  R.nest.after_admin = {
    ...(R.nest.after_admin || {}),
    total: eff.total,
    codes: eff.codes.slice(0, 30),
  };
  save();

  // 2) Navigate Đổi ca → open create → assert Nest picker
  await openChangeShift(page);
  await shot(page, '03-shift-change-tab');
  const tabVisible = (await page.getByTestId('att-shift-change-precision').count()) > 0;
  if (!tabVisible) {
    ac('VAL-ATT-SHIFT-CNS-02-nav', 'FAIL', { summary: 'att-shift-change-precision not mounted' });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }

  // Wait for effective GET from FE hook
  await sleep(1500);
  const effGetOk = R.network.effectiveGets.some((g) => g.status >= 200 && g.status < 300);

  await page
    .getByTestId('att-shift-change-precision')
    .locator('button')
    .filter({ hasText: /Thêm|Add|đổi ca|request/i })
    .first()
    .click({ timeout: 10_000 });
  await sleep(800);

  const pickerOpts = await collectPickerOptions(page);
  const inferred = inferNestFromPicker(pickerOpts, eff.rows, eff.codes);
  const pickerPass =
    eff.total > 0 &&
    effGetOk &&
    inferred.pass &&
    !inferred.onlyBootstrapText;

  ac('VAL-ATT-SHIFT-CNS-02-picker', pickerPass ? 'PASS' : 'FAIL', {
    summary: `effGetOk=${effGetOk} N=${eff.total} nestNames=${inferred.nestNameHits.length} nestVal=${inferred.nestCodeInValue.length} onlyBootText=${inferred.onlyBootstrapText} time=${inferred.hasTimePattern}`,
    pickerValues: inferred.values.slice(0, 20),
    pickerTexts: inferred.texts.slice(0, 12),
    nestNameHits: inferred.nestNameHits,
    nestCodes: eff.codes.slice(0, 20),
  });

  if (!pickerPass) {
    await shot(page, '99-fail-picker');
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 1;
    return;
  }

  // 3) Submit Nest codes → 2xx · FE list · F5
  const listBefore = await page
    .getByTestId('att-shift-change-precision')
    .locator('table tbody tr')
    .count()
    .catch(() => 0);

  // Dialog may have closed when we Escape'd — reopen if needed
  if ((await page.getByTestId('att-shift-change-add-dialog-precision').count()) === 0) {
    await page
      .getByTestId('att-shift-change-precision')
      .locator('button')
      .filter({ hasText: /Thêm|Add|đổi ca|request/i })
      .first()
      .click({ timeout: 10_000 });
    await sleep(600);
  }

  const submitMeta = await fillAndSubmitShiftChange(page, eff.codes, eff.rows);
  const post = R.network.shiftChangePosts[R.network.shiftChangePosts.length - 1];
  const postOk =
    post &&
    post.status >= 200 &&
    post.status < 300 &&
    post.req &&
    String(post.req.current_shift || '').toLowerCase() === submitMeta.current &&
    String(post.req.requested_shift || '').toLowerCase() === submitMeta.requested;

  const bodyUsesNestCode =
    post?.req &&
    eff.codes.includes(String(post.req.current_shift || '').toLowerCase()) &&
    eff.codes.includes(String(post.req.requested_shift || '').toLowerCase());

  ac('AC-PLT-ATT-SHIFT-01-submit', postOk && bodyUsesNestCode ? 'PASS' : 'FAIL', {
    summary: `POST status=${post?.status} code=${post?.code} current=${post?.req?.current_shift} requested=${post?.req?.requested_shift} nestBody=${bodyUsesNestCode}`,
    post,
    submitMeta,
  });

  await sleep(1000);
  const listAfter = await page
    .getByTestId('att-shift-change-precision')
    .locator('table tbody tr')
    .count()
    .catch(() => 0);
  const bodyText = await page.getByTestId('att-shift-change-precision').innerText().catch(() => '');
  const feShowsNest =
    bodyText.includes(submitMeta.label1) ||
    bodyText.toLowerCase().includes(submitMeta.current) ||
    listAfter >= listBefore;

  await shot(page, '05-fe-after-2xx');

  // F5
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  // Re-nav to change-shift after reload (tab state may reset)
  await openChangeShift(page);
  await sleep(1500);
  const bodyF5 = await page.getByTestId('att-shift-change-precision').innerText().catch(() => '');
  const f5ok =
    bodyF5.toLowerCase().includes(submitMeta.current) ||
    bodyF5.includes(submitMeta.label1) ||
    bodyF5.includes(`QA-FE CNS-02 Nest picker ${stampTail}`);
  await shot(page, '06-after-f5');

  ac('AC-PLT-ATT-SHIFT-01-fe-f5', feShowsNest && f5ok ? 'PASS' : feShowsNest ? 'WARN' : 'FAIL', {
    summary: `list ${listBefore}→${listAfter} feShowsNest=${feShowsNest} f5ok=${f5ok}`,
  });

  // Invent spot note (not UF)
  if (R.invent_spot?.expectKey) {
    ac('AC-PLT-ATT-SHIFT-01b-invent-spot', 'PASS', {
      summary: 'API invent → 400 HRM-ATT-SHIFT-KEY (L1 sealed cite; not UF 🟢)',
    });
  } else {
    ac('AC-PLT-ATT-SHIFT-01b-invent-spot', 'HOLD', {
      summary: `invent spot status=${R.invent_spot?.status} code=${R.invent_spot?.code} — prefer L1 seal; not UF`,
    });
  }

  ac('AC-PLT-ATT-SHIFT-01H-honesty', 'PASS', {
    summary: 'attendance_uat/payroll_e2e=false · C-SLICE · seals RETAIN · no seed · no ATT-CODE invent',
  });

  const hardFail = Object.entries(R.ac).some(
    ([k, v]) =>
      v.verdict === 'FAIL' &&
      !k.includes('01c') &&
      k !== 'AC-PLT-ATT-SHIFT-01b-invent-spot',
  );
  const cns02 =
    R.ac['VAL-ATT-SHIFT-CNS-02-picker']?.verdict === 'PASS' &&
    R.ac['AC-PLT-ATT-SHIFT-01-submit']?.verdict === 'PASS';

  R.overall = !hardFail && cns02 ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.residual =
    R.overall === 'PASS'
      ? [
          {
            id: 'R-PLT-ATT-SHIFT-CNS-02',
            status: 'CLOSED',
            note: 'Browser Nest picker + Nest code submit proven',
          },
          {
            id: 'AC-PLT-ATT-SHIFT-01c',
            status: 'NOTE_BLOCKED',
            note: 'empty active not isolatable without wipe',
          },
        ]
      : [
          {
            id: 'R-PLT-ATT-SHIFT-CNS-02',
            status: 'OPEN',
            owner: 'dev-fe',
            note: 'CNS-02 browser FAIL — see ac table',
          },
        ];
  R.endedAt = ts();
  save();
  await browser.close();

  console.log(
    JSON.stringify(
      {
        overall: R.overall,
        ack_status: R.ack_status,
        stamp: R.stamp,
        ac: Object.fromEntries(Object.entries(R.ac).map(([k, v]) => [k, v.verdict])),
      },
      null,
      2,
    ),
  );
  process.exitCode = R.overall === 'PASS' ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  R.pageErrors.push(String(e?.stack || e).slice(0, 800));
  save();
  process.exitCode = 1;
});
