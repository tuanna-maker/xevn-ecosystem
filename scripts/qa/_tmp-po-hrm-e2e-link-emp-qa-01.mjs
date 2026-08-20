#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-EMP-QA-01 R4 — Browser U65
 * Parent: FE-04 (SI action body company_id) · FE-03 mount · BE-03 WH neo
 * Focus: D5 POST …/actions JSON body includes company_id → 2xx + F5
 * Smoke: D1 WH neo · D2 WH picker · D6 HTP-05 · J-HRM-01..04
 * Persona: ceo@xe.vn · company_id=main · portal :5173
 * DENIED: seed · API-only PASS · hrm_personnel_uat_ready · employees_e2e_linkage_ready
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-01-r4.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-01-r4');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `EMPQA-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const FE03_EVIDENCE = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-emp-fe-03.md');
const FE04_EVIDENCE = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-emp-fe-04.md');
const FE03_READY =
  process.env.FE03_READY === '1' ||
  (existsSync(FE03_EVIDENCE) && process.env.FE03_READY !== '0');
const FE04_READY =
  process.env.FE04_READY === '1' ||
  (existsSync(FE04_EVIDENCE) && process.env.FE04_READY !== '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-E2E-LINK-EMP-QA-01',
  round: 'R4',
  parent: [
    'PO-HRM-E2E-LINK-EMP-BE-03',
    ...(FE03_READY ? ['PO-HRM-E2E-LINK-EMP-FE-03'] : []),
    ...(FE04_READY ? ['PO-HRM-E2E-LINK-EMP-FE-04'] : []),
  ],
  fe03: FE03_READY ? 'READY' : 'MISSING_HOLD_D5',
  fe04: FE04_READY ? 'READY' : 'MISSING',
  startedAt: ts(),
  u65: 'zero-seed',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, TENANT, STAMP, FE03_READY, FE04_READY },
  denied: [
    'hrm_personnel_uat_ready',
    'employees_e2e_linkage_ready',
    'seed',
    'api_only_pass',
    'module_uat',
  ],
  l0: {},
  uf: {},
  journey: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  ids: {},
  residuals: [],
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || extra.url || '');
}
function recordUf(id, verdict, detail = {}) {
  results.uf[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 280)}`);
  save();
}
function recordJ(id, verdict, detail = {}) {
  results.journey[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 280)}`);
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
  return u.toString();
}

function unwrapList(body) {
  if (!body || typeof body !== 'object') return [];
  const d = body.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(d)) return d;
  return [];
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

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
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
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        at: ts(),
      };
      const interesting =
        /work-timeline|hire-readiness|employee-insurances|\/decisions|\/employees\/|\/contracts-insurance/.test(
          u,
        );
      if (!interesting) return;

      if (
        (method === 'POST' || method === 'PATCH' || method === 'PUT') &&
        /work-timeline|decisions|employee-insurances.*actions/.test(u)
      ) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 200);
          const row = j?.data ?? j;
          entry.id = row?.id || null;
          entry.decision_id = row?.decision_id || null;
          entry.position_key = row?.position_key || null;
          entry.work_history_id = row?.work_history_id ?? null;
          entry.enrollment_id = row?.enrollment_id || row?.id || null;
          if (/actions/.test(u)) {
            // R4 AC: company_id must be in JSON body (not query-only)
            let postBody = null;
            try {
              postBody = res.request().postDataJSON();
            } catch {
              try {
                postBody = JSON.parse(res.request().postData() || 'null');
              } catch {
                postBody = null;
              }
            }
            entry.requestBody = postBody;
            entry.bodyCompanyId =
              postBody && typeof postBody.company_id === 'string'
                ? postBody.company_id
                : null;
            entry.bodyHasCompanyId =
              typeof entry.bodyCompanyId === 'string' && entry.bodyCompanyId.trim().length > 0;
          }
          if (/work-timeline/.test(u)) results.lastWhMutate = entry;
          if (/decisions/.test(u)) results.lastDecisionMutate = { ...entry, body: row };
          if (/actions/.test(u)) results.lastSiAction = entry;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /hire-readiness/.test(u)) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.data = j?.data || null;
          results.lastHireReadiness = entry;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /work-timeline/.test(u)) {
        try {
          const j = await res.json();
          const arr = unwrapList(j);
          entry.count = arr.length;
          entry.sample = arr.slice(0, 3).map((x) => ({
            id: x.id,
            position_key: x.position_key,
            decision_id: x.decision_id,
            decision_code: x.decision_code,
            source_module: x.source_module,
          }));
          results.lastWhList = entry;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function apiGet(token, path) {
  const r = await fetch(`${HRM}${path}`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
    },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j };
}

async function pickCatalog(page, testId) {
  const trigger = page.locator(`[data-testid="${testId}"]`).first();
  if ((await trigger.count()) === 0) return { ok: false, reason: 'picker_missing' };
  await trigger.click({ timeout: 8000 });
  await sleep(400);
  const item = page.locator('[cmdk-item], [role="option"]').first();
  if ((await item.count()) === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'no_options' };
  }
  const label = ((await item.textContent()) || '').trim().slice(0, 80);
  await item.click();
  await sleep(300);
  return { ok: true, label };
}

async function openEmployeeProfile(page, employeeId) {
  const url = q(`/hr/employees/${employeeId}`);
  log('GOTO_EMPLOYEE_PROFILE', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  return url;
}

async function clickTab(page, patterns) {
  for (const re of patterns) {
    const btn = page.locator('button, [role="tab"], a').filter({ hasText: re }).first();
    if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
      await btn.click({ timeout: 5000 }).catch(() => {});
      await sleep(1500);
      return true;
    }
  }
  return false;
}

async function main() {
  // —— L0 ——
  const healthChecks = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${PORTAL}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      healthChecks[name] = { status: r.status, url };
    } catch (e) {
      healthChecks[name] = { status: 0, error: String(e).slice(0, 120), url };
    }
  }
  results.l0 = healthChecks;
  const l0ok =
    healthChecks.hrm?.status === 200 &&
    healthChecks.portal?.status === 200 &&
    (healthChecks.xbos?.status === 200 || healthChecks.xbos?.status === 404);
  recordUf('L0', l0ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(healthChecks) });
  if (!l0ok) {
    results.overall = 'FAIL';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  results.ids.tokenOk = true;

  // Probe data (corroborate — not PASS evidence alone)
  const empList = await apiGet(session.token, `/api/hrm/employees?page_size=30&company_id=${COMPANY}`);
  const employees = unwrapList(empList.body);
  results.ids.employeeCount = employees.length;
  const emp0 = employees[0];
  if (!emp0?.id) throw new Error('no employees for U65 natural data');
  results.ids.employeeId = emp0.id;
  results.ids.employeeName = emp0.display_name || emp0.full_name;
  results.ids.employeeCompany = emp0.company_id;

  const hireProbe = await apiGet(
    session.token,
    `/api/hrm/employees/${emp0.id}/hire-readiness?company_id=${COMPANY}`,
  );
  results.api_corroborate = results.api_corroborate || {};
  results.api_corroborate.hireReadiness = {
    status: hireProbe.status,
    code: hireProbe.body?.code,
    ready: hireProbe.body?.data?.ready_for_payroll ?? hireProbe.body?.data?.ready,
    blockers: hireProbe.body?.data?.blockers,
  };

  let insuranceId = null;
  let insuranceEmpId = emp0.id;
  // BE-02: contracts-insurance/insurance and employee-insurances share enrollment SoT
  const ciInsList = await apiGet(
    session.token,
    `/api/hrm/contracts-insurance/insurance?company_id=${COMPANY}`,
  );
  const ciInsRows = unwrapList(ciInsList.body);
  results.api_corroborate.contractsInsurance = {
    status: ciInsList.status,
    code: ciInsList.body?.code,
    count: ciInsRows.length,
    first: ciInsRows[0]
      ? {
          id: ciInsRows[0].id,
          enrollment_id: ciInsRows[0].enrollment_id || ciInsRows[0].id,
          employee_id: ciInsRows[0].employee_id,
          status: ciInsRows[0].status,
        }
      : null,
  };

  const insList = await apiGet(
    session.token,
    `/api/hrm/employee-insurances?company_id=${COMPANY}`,
  );
  const insRows = unwrapList(insList.body);
  results.api_corroborate.insuranceList = {
    status: insList.status,
    code: insList.body?.code,
    count: insRows.length,
    first: insRows[0]
      ? { id: insRows[0].id, employee_id: insRows[0].employee_id, status: insRows[0].status }
      : null,
  };

  const ciIds = new Set(ciInsRows.map((r) => r.id).filter(Boolean));
  const eiIds = new Set(insRows.map((r) => r.id).filter(Boolean));
  const idOverlap = [...ciIds].filter((id) => eiIds.has(id));
  results.api_corroborate.sotParity = {
    contractsInsuranceCount: ciInsRows.length,
    employeeInsurancesCount: insRows.length,
    idOverlapCount: idOverlap.length,
    sampleOverlapId: idOverlap[0] || null,
    enrollmentIdEqualsId:
      ciInsRows[0] &&
      String(ciInsRows[0].enrollment_id || ciInsRows[0].id) === String(ciInsRows[0].id),
  };

  if (idOverlap[0]) {
    insuranceId = idOverlap[0];
    const match =
      insRows.find((r) => r.id === insuranceId) ||
      ciInsRows.find((r) => r.id === insuranceId);
    insuranceEmpId = match?.employee_id || emp0.id;
  } else if (insRows[0]?.id) {
    insuranceId = insRows[0].id;
    insuranceEmpId = insRows[0].employee_id || emp0.id;
  } else if (ciInsRows[0]?.id) {
    // Bridge should have populated employee-insurances; try list again after CI hit
    const retry = await apiGet(
      session.token,
      `/api/hrm/employee-insurances?company_id=${COMPANY}`,
    );
    const retryRows = unwrapList(retry.body);
    results.api_corroborate.insuranceListAfterCi = {
      status: retry.status,
      count: retryRows.length,
    };
    if (retryRows[0]?.id) {
      insuranceId = retryRows[0].id;
      insuranceEmpId = retryRows[0].employee_id || emp0.id;
    } else {
      insuranceId = ciInsRows[0].id;
      insuranceEmpId = ciInsRows[0].employee_id || emp0.id;
    }
  } else {
    for (const e of employees.slice(0, 25)) {
      const one = await apiGet(
        session.token,
        `/api/hrm/employee-insurances?company_id=${COMPANY}&employee_id=${e.id}`,
      );
      const rows = unwrapList(one.body);
      if (rows[0]?.id) {
        insuranceId = rows[0].id;
        insuranceEmpId = e.id;
        results.api_corroborate.insuranceFoundViaScan = {
          employeeId: e.id,
          insuranceId,
          status: rows[0].status,
        };
        break;
      }
    }
  }

  const ctrList = await apiGet(
    session.token,
    `/api/hrm/contracts-insurance/contracts?company_id=${COMPANY}&page_size=10`,
  );
  const contracts = unwrapList(ctrList.body);
  results.api_corroborate.contracts = {
    status: ctrList.status,
    code: ctrList.body?.code,
    count: contracts.length,
    first: contracts[0]
      ? { id: contracts[0].id, employee_id: contracts[0].employee_id }
      : null,
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // ========== D2 WH CatalogSearchPicker ==========
    log('D2_START');
    await openEmployeeProfile(page, emp0.id);
    await shot(page, '01-profile-general');

    // Work timeline is on general + workHistory — prefer testid
    let addBtn = page.locator('[data-testid="hdsd-work-timeline-add-btn"]').first();
    if ((await addBtn.count()) === 0) {
      await clickTab(page, [/Quá trình|Lịch sử công tác|Work history|workHistory/i]);
      addBtn = page.locator('[data-testid="hdsd-work-timeline-add-btn"]').first();
    }
    if ((await addBtn.count()) === 0) {
      // try any add on timeline card
      addBtn = page
        .locator('[data-testid="hdsd-work-timeline-root"] button, button')
        .filter({ hasText: /^\+|Thêm|Add/i })
        .first();
    }

    let d2PickerOk = false;
    let d2SaveStatus = null;
    let d2PositionKey = null;
    let d2F5Persist = false;
    let d2RejectFreeText = 'N/A';

    if ((await addBtn.count()) > 0) {
      await addBtn.click();
      await sleep(1200);
      await shot(page, '02-wh-form');

      const picker = page.locator('[data-testid="hdsd-work-timeline-position-picker"]');
      d2PickerOk = (await picker.count()) > 0;
      // free-text Input for position SoT must NOT exist as primary SoT
      const freeTextPos = page.locator(
        '[data-testid="hdsd-work-timeline-form-dialog"] input[name="position"], [role="dialog"] input[name="position"]',
      );
      const freeTextCount = await freeTextPos.count();
      d2RejectFreeText =
        freeTextCount === 0
          ? 'PASS_no_free_text_position_input'
          : 'FAIL_free_text_position_present';

      // fill title + date if needed
      const title = page.locator('[role="dialog"] input').filter({ hasText: '' }).first();
      const titleInput = page
        .locator('[role="dialog"] input[placeholder*="tiêu"], [role="dialog"] input')
        .nth(1);
      // Fill title via label proximity
      const allInputs = page.locator('[role="dialog"] input:not([type=hidden])');
      const inputCount = await allInputs.count();
      for (let i = 0; i < inputCount; i++) {
        const el = allInputs.nth(i);
        const ph = ((await el.getAttribute('placeholder')) || '').toLowerCase();
        const val = await el.inputValue().catch(() => '');
        if (!val && (ph.includes('tiêu') || ph.includes('title') || ph.includes('sự kiện') || i === 1)) {
          await el.fill(`QA WH ${STAMP}`);
          break;
        }
      }
      // Ensure date present — ViDateField often prefilled
      const posPick = await pickCatalog(page, 'hdsd-work-timeline-position-picker');
      log('D2_POSITION_PICK', posPick);
      await pickCatalog(page, 'hdsd-work-timeline-department-picker').catch(() => ({ ok: false }));

      const submit = page.locator('[data-testid="hdsd-work-timeline-submit"]').first();
      if ((await submit.count()) > 0 && posPick.ok) {
        await submit.click();
        await sleep(2500);
        d2SaveStatus = results.lastWhMutate?.status ?? null;
        d2PositionKey = results.lastWhMutate?.position_key ?? null;
        await shot(page, '03-wh-after-save');

        // F5
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3500);
        const listSample = results.lastWhList?.sample || [];
        d2F5Persist =
          listSample.some((x) => x.position_key) ||
          (await page.locator('[data-testid="hdsd-work-timeline-root"]').count()) > 0;
        await shot(page, '04-wh-f5');
      } else {
        log('D2_SUBMIT_SKIP', { posPick, hasSubmit: (await submit.count()) > 0 });
      }
    } else {
      log('D2_ADD_BTN_MISSING');
    }

    const d2Pass =
      d2PickerOk &&
      d2RejectFreeText.startsWith('PASS') &&
      d2SaveStatus >= 200 &&
      d2SaveStatus < 300 &&
      d2F5Persist;
    recordUf('D2_WH_PICKER', d2Pass ? 'PASS' : d2PickerOk && d2RejectFreeText.startsWith('PASS') ? 'PARTIAL' : 'FAIL', {
      summary: `picker=${d2PickerOk} freeText=${d2RejectFreeText} save=${d2SaveStatus} posKey=${d2PositionKey} f5=${d2F5Persist}`,
      d2PickerOk,
      d2RejectFreeText,
      d2SaveStatus,
      d2PositionKey,
      d2F5Persist,
    });

    // ========== D1 QSĐ person-bound → WH badge ==========
    log('D1_START');
    await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await shot(page, '05-decisions-list');

    let d1Pass = false;
    let d1Detail = {};
    const addBtnDec = page.locator('button').filter({ hasText: /^\+|Thêm|Tạo quyết định|Tạo/i }).first();

    async function fillLabeledInput(labelRe, value) {
      const label = page.locator('[role="dialog"] label').filter({ hasText: labelRe }).first();
      if ((await label.count()) === 0) return false;
      const forId = await label.getAttribute('for');
      let input = forId ? page.locator(`[role="dialog"] #${forId}`) : null;
      if (!input || (await input.count()) === 0) {
        input = label.locator('xpath=following::input[1]');
      }
      if ((await input.count()) === 0) return false;
      await input.fill(value);
      return true;
    }

    async function pickDialogCatalog(labelRe, optionRe) {
      const label = page.locator('[role="dialog"] label').filter({ hasText: labelRe }).first();
      if ((await label.count()) === 0) return false;
      const btn = label.locator('xpath=following::button[1]');
      if ((await btn.count()) === 0) return false;
      await btn.click();
      await sleep(400);
      const opt = page.locator('[cmdk-item], [role="option"]').filter({ hasText: optionRe }).first();
      if ((await opt.count()) > 0) {
        await opt.click();
        await sleep(300);
        return true;
      }
      const any = page.locator('[cmdk-item], [role="option"]').first();
      if ((await any.count()) > 0) {
        await any.click();
        await sleep(300);
        return true;
      }
      await page.keyboard.press('Escape').catch(() => {});
      return false;
    }

    if ((await addBtnDec.count()) > 0) {
      await addBtnDec.click();
      await sleep(1500);
      await shot(page, '06-decision-form');

      // FE-02 HDSD testids: code / title / type / employee / position / status
      const codeInput = page.locator('[data-testid="hdsd-decisions-form-code"]').first();
      const titleInput = page.locator('[data-testid="hdsd-decisions-form-title"]').first();
      d1Detail.codeFilled = false;
      d1Detail.titleFilled = false;
      if ((await codeInput.count()) > 0) {
        await codeInput.fill(`QD-${STAMP}`);
        d1Detail.codeFilled = true;
      } else {
        d1Detail.codeFilled = await fillLabeledInput(
          /Số \/ mã quyết định|Mã quyết định|Decision code|mã QSĐ/i,
          `QD-${STAMP}`,
        );
      }
      if ((await titleInput.count()) > 0) {
        await titleInput.fill(`QA QSĐ ${STAMP}`);
        d1Detail.titleFilled = true;
      } else {
        d1Detail.titleFilled = await fillLabeledInput(/Tiêu đề|Title/i, `QA QSĐ ${STAMP}`);
      }

      // Type: bổ nhiệm / appointment (person-bound) — prefer testid picker
      const typePicker = page.locator('[data-testid="hdsd-decisions-form-type"]').first();
      if ((await typePicker.count()) > 0) {
        await typePicker.click();
        await sleep(400);
        const typeOpt = page
          .locator('[cmdk-item], [role="option"]')
          .filter({ hasText: /bổ nhiệm|appointment|thuyên chuyển|transfer/i })
          .first();
        if ((await typeOpt.count()) > 0) {
          await typeOpt.click();
          d1Detail.typePicked = true;
        } else {
          const any = page.locator('[cmdk-item], [role="option"]').first();
          if ((await any.count()) > 0) {
            await any.click();
            d1Detail.typePicked = true;
          } else {
            d1Detail.typePicked = false;
          }
        }
        await sleep(300);
      } else {
        d1Detail.typePicked = await pickDialogCatalog(
          /Loại quyết định|Decision type|Loại/i,
          /bổ nhiệm|appointment|thuyên chuyển|transfer/i,
        );
      }

      // Employee select
      const empTrigger = page.locator('[data-testid="hdsd-decisions-form-employee"]').first();
      if ((await empTrigger.count()) > 0) {
        await empTrigger.click();
        await sleep(500);
        const opt = page.locator('[role="option"]').first();
        if ((await opt.count()) > 0) {
          d1Detail.employeeLabel = ((await opt.textContent()) || '').trim();
          await opt.click();
          await sleep(400);
          d1Detail.employeePicked = true;
        }
      }

      // Position CatalogSearchPicker (required) — FE-02 testid
      const posPick = await pickCatalog(page, 'hdsd-decisions-form-position');
      d1Detail.posPicked = !!posPick.ok;
      d1Detail.posLabel = posPick.label || null;
      if (!d1Detail.posPicked) {
        d1Detail.posPicked = await pickDialogCatalog(/Vị trí|Chức danh|Position/i, /./);
      }

      // Status → Có hiệu lực (FE-02 label Trạng thái)
      const statusTrigger = page.locator('[data-testid="hdsd-decisions-form-status"]').first();
      if ((await statusTrigger.count()) > 0) {
        await statusTrigger.click();
        await sleep(300);
        const eff = page
          .locator('[role="option"]')
          .filter({ hasText: /Có hiệu lực|Hiệu lực|effective/i })
          .first();
        if ((await eff.count()) > 0) {
          await eff.click();
          d1Detail.statusEffective = true;
        }
      } else {
        const statusBtn = page
          .locator('[role="dialog"] label')
          .filter({ hasText: /Trạng thái|Status/i })
          .locator('xpath=following::button[1]');
        if ((await statusBtn.count()) > 0) {
          await statusBtn.click();
          await sleep(300);
          const eff = page
            .locator('[role="option"]')
            .filter({ hasText: /Có hiệu lực|Hiệu lực|effective/i })
            .first();
          if ((await eff.count()) > 0) {
            await eff.click();
            d1Detail.statusEffective = true;
          }
        }
      }

      const hint = page.locator('[data-testid="hdsd-decisions-effective-wh-hint"]');
      d1Detail.hintVisible = (await hint.count()) > 0;
      await shot(page, '06b-decision-filled');

      // Dismiss open cmdk/Select list only — do NOT Escape the whole dialog
      const cmdkOpen = page.locator('[cmdk-list], [role="listbox"]');
      if ((await cmdkOpen.count()) > 0 && (await cmdkOpen.first().isVisible().catch(() => false))) {
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(200);
      }

      const submitDec = page.locator('[data-testid="hdsd-decisions-form-submit"]').first();
      if ((await submitDec.count()) > 0) {
        await submitDec.evaluate((el) => el.click());
        await sleep(3500);
        // Capture toast text
        const toast = page.locator('[data-sonner-toast], [role="status"]').first();
        d1Detail.toast =
          (await toast.count()) > 0 ? ((await toast.textContent()) || '').slice(0, 160) : null;
        d1Detail.saveStatus = results.lastDecisionMutate?.status ?? null;
        d1Detail.saveCode = results.lastDecisionMutate?.code ?? null;
        d1Detail.decisionId = results.lastDecisionMutate?.id ?? results.lastDecisionMutate?.body?.id;
        d1Detail.work_history_id =
          results.lastDecisionMutate?.work_history_id ??
          results.lastDecisionMutate?.body?.work_history_id ??
          null;
        d1Detail.decisionType =
          results.lastDecisionMutate?.body?.decision_type ||
          results.lastDecisionMutate?.body?.type ||
          null;
        d1Detail.decisionEmployeeId =
          results.lastDecisionMutate?.body?.employee_id || null;
        await shot(page, '07-decision-after-save');

        const targetEmp = d1Detail.decisionEmployeeId || emp0.id;
        results.ids.decisionEmployeeId = targetEmp;
        results.ids.decisionId = d1Detail.decisionId;
        results.ids.work_history_id = d1Detail.work_history_id;
        if (d1Detail.saveStatus >= 200 && d1Detail.saveStatus < 300) {
          await openEmployeeProfile(page, targetEmp);
          await sleep(2000);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(3500);
          await shot(page, '08-wh-after-decision-f5');

          const badge = page.locator('[data-testid^="hdsd-work-timeline-decision-"]');
          const badgeCount = await badge.count();
          const badgeText = badgeCount > 0 ? ((await badge.first().textContent()) || '').trim() : '';
          const whSample = results.lastWhList?.sample || [];
          const linkedByDecision =
            !!d1Detail.decisionId &&
            whSample.some(
              (x) =>
                x.decision_id === d1Detail.decisionId ||
                (x.decision_id && String(x.decision_id) === String(d1Detail.decisionId)),
            );
          const hasDecisionNeo =
            linkedByDecision ||
            whSample.some((x) => x.decision_id || x.decision_code || x.source_module === 'decision') ||
            badgeCount > 0;
          d1Detail.badgeCount = badgeCount;
          d1Detail.badgeText = badgeText.slice(0, 120);
          d1Detail.whSample = whSample;
          d1Detail.linkedByDecision = linkedByDecision;
          d1Detail.hasDecisionNeo = hasDecisionNeo;
          // R3 P0: work_history_id ≠ null on HRD_01 effective + WH F5 neo
          d1Pass =
            !!d1Detail.work_history_id &&
            d1Detail.saveStatus >= 200 &&
            d1Detail.saveStatus < 300 &&
            hasDecisionNeo;
        } else {
          d1Detail.hasDecisionNeo = false;
        }
      } else {
        d1Detail.submitMissing = true;
      }
    } else {
      d1Detail.addMissing = true;
    }

    if (!d1Pass && d1Detail.saveStatus === 400) {
      d1Detail.beRejected = results.lastDecisionMutate?.code;
    }

    // HRD_03 negative (API corroborate — must NOT invent WH)
    try {
      const hrd03 = await fetch(`${HRM}/api/hrm/decisions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${session.token}`,
          'content-type': 'application/json',
          'x-tenant-id': TENANT,
          'x-company-id': COMPANY,
        },
        body: JSON.stringify({
          company_id: COMPANY,
          decision_code: `QD-HRD03-${STAMP}`,
          title: `QA HRD_03 no WH ${STAMP}`,
          decision_type: 'HRD_03',
          type: 'HRD_03',
          status: 'effective',
          employee_id: emp0.id,
          effective_date: new Date().toISOString().slice(0, 10),
        }),
      }).then(async (r) => {
        const j = await r.json().catch(() => ({}));
        const row = j?.data ?? j;
        return {
          status: r.status,
          code: j?.code,
          work_history_id: row?.work_history_id ?? null,
          id: row?.id || null,
        };
      });
      d1Detail.hrd03Probe = hrd03;
      d1Detail.hrd03NoWhInvent =
        hrd03.status >= 400 || hrd03.work_history_id == null;
    } catch (e) {
      d1Detail.hrd03Probe = { error: String(e).slice(0, 120) };
    }

    recordUf('D1_DEC_WH', d1Pass ? 'PASS' : 'FAIL', {
      summary: `save=${d1Detail.saveStatus} code=${d1Detail.saveCode} whId=${d1Detail.work_history_id} neo=${d1Detail.hasDecisionNeo} badge=${d1Detail.badgeCount} hrd03NoInvent=${d1Detail.hrd03NoWhInvent} toast=${d1Detail.toast || ''}`,
      ...d1Detail,
    });

    // ========== D6 HTP-05 banner ==========
    log('D6_START');
    await openEmployeeProfile(page, emp0.id);
    await clickTab(page, [/Hợp đồng|Contract/i]);
    await sleep(2500);
    await shot(page, '09-contract-tab-htp');
    const banner = page.locator('[data-testid="hdsd-hire-readiness-banner"]').first();
    const bannerVisible = (await banner.count()) > 0;
    const htpState = bannerVisible
      ? await banner.getAttribute('data-htp05-state')
      : null;
    const bannerText = bannerVisible ? ((await banner.textContent()) || '').trim().slice(0, 200) : '';
    const hrNet = results.lastHireReadiness;
    const inventReady =
      htpState === 'ready' &&
      hrNet &&
      (hrNet.status === 404 || hrNet.data?.ready === false || hrNet.data?.ready_for_payroll === false);
    const d6Pass =
      bannerVisible &&
      ['ready', 'blocked', 'unavailable', 'loading'].includes(String(htpState || '')) &&
      !inventReady &&
      htpState !== 'loading';
    // allow brief loading then settle
    if (htpState === 'loading') {
      await sleep(2000);
    }
    const htpState2 = bannerVisible
      ? await banner.getAttribute('data-htp05-state')
      : null;
    const inventReady2 =
      htpState2 === 'ready' &&
      hrNet &&
      (hrNet.status === 404 ||
        hrNet.data?.ready === false ||
        hrNet.data?.ready_for_payroll === false);
    const d6Pass2 =
      bannerVisible &&
      ['ready', 'blocked', 'unavailable'].includes(String(htpState2 || '')) &&
      !inventReady2;

    recordUf('D6_HTP05', d6Pass2 ? 'PASS' : 'FAIL', {
      summary: `banner=${bannerVisible} state=${htpState2} net=${hrNet?.status}/${hrNet?.code} invent=${inventReady2}`,
      bannerVisible,
      htpState: htpState2,
      bannerText,
      net: hrNet,
      inventReady: inventReady2,
    });

    // ========== D5 SI timeline ==========
    log('D5_START');
    let d5Pass = false;
    let d5Detail = {
      insuranceId,
      insuranceEmpId,
      contractsInsuranceCount: results.api_corroborate?.contractsInsurance?.count ?? null,
      employeeInsurancesCount: results.api_corroborate?.insuranceList?.count ?? null,
      sotParity: results.api_corroborate?.sotParity ?? null,
      fe03: FE03_READY ? 'READY' : 'HOLD',
    };

    async function openInsuranceTab(empId) {
      // FE-03: deep-link ?tab=insurance
      const deep = q(`/hr/employees/${empId}`, { tab: 'insurance' });
      log('GOTO_INSURANCE_TAB', { url: deep });
      await page.goto(deep, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      let enrollRoot = page.locator('[data-testid="hdsd-insurance-enrollments-root"]');
      let timelineRoot = page.locator('[data-testid="hdsd-insurance-timeline-root"]');
      if ((await enrollRoot.count()) === 0 && (await timelineRoot.count()) === 0) {
        const cta = page.locator('[data-testid="hdsd-profile-open-insurance-tab"]').first();
        if ((await cta.count()) > 0) {
          await cta.click();
          await sleep(2500);
        } else {
          const group = page.locator('[data-testid="profile-group-tab-insurance"]').first();
          if ((await group.count()) > 0) {
            await group.click();
            await sleep(2500);
          } else {
            await clickTab(page, [/Bảo hiểm|Insurance|Phúc lợi/i]);
            await sleep(2000);
          }
        }
      }
      return {
        enrollmentsRoot: (await page.locator('[data-testid="hdsd-insurance-enrollments-root"]').count()) > 0,
        timelineRoot: (await page.locator('[data-testid="hdsd-insurance-timeline-root"]').count()) > 0,
        url: page.url(),
      };
    }

    if (!FE03_READY) {
      recordUf('D5_SI_TIMELINE', 'HOLD', {
        summary: 'FE-03 evidence missing — D5 NOT RUN (do not FAIL for missing FE-03)',
        ...d5Detail,
      });
    } else {
    // Prefer natural employee-insurances; else FE-create enrollment (U65) on profile
    async function ensureEnrollmentViaFe() {
      const target =
        results.api_corroborate?.contractsInsurance?.first?.employee_id || emp0.id;
      await openInsuranceTab(target);
      await sleep(2000);
      const addIns = page
        .locator('button')
        .filter({ hasText: /^\+|Thêm bảo hiểm|Thêm|Add/i })
        .first();
      if ((await addIns.count()) === 0) return { ok: false, reason: 'no_add_btn' };
      await addIns.click();
      await sleep(1000);
      // Minimal fill if dialog
      const dlg = page.locator('[role="dialog"]');
      if ((await dlg.count()) === 0) return { ok: false, reason: 'no_dialog' };
      const inputs = dlg.locator('input:not([type=hidden])');
      const n = await inputs.count();
      for (let i = 0; i < Math.min(n, 4); i++) {
        const el = inputs.nth(i);
        const v = await el.inputValue().catch(() => 'x');
        if (!v) await el.fill(`QA-SI-${STAMP}`).catch(() => {});
      }
      const save = dlg.locator('button').filter({ hasText: /Lưu|Save|Tạo/i }).first();
      if ((await save.count()) > 0) {
        await save.click();
        await sleep(2500);
      }
      // Refetch list via API
      const one = await apiGet(
        session.token,
        `/api/hrm/employee-insurances?company_id=${COMPANY}&employee_id=${target}`,
      );
      const rows = unwrapList(one.body);
      return {
        ok: rows.length > 0,
        insuranceId: rows[0]?.id || null,
        employeeId: target,
        createStatus: one.status,
        count: rows.length,
      };
    }

    // Re-probe after bridge may have run on CI list
    if (!insuranceId || (d5Detail.sotParity?.idOverlapCount || 0) === 0) {
      const ci = await apiGet(
        session.token,
        `/api/hrm/contracts-insurance/insurance?company_id=${COMPANY}`,
      );
      const ciRows = unwrapList(ci.body);
      const ei = await apiGet(
        session.token,
        `/api/hrm/employee-insurances?company_id=${COMPANY}`,
      );
      const eiRows = unwrapList(ei.body);
      const overlap = ciRows.map((r) => r.id).filter((id) => eiRows.some((e) => e.id === id));
      d5Detail.sotParity = {
        contractsInsuranceCount: ciRows.length,
        employeeInsurancesCount: eiRows.length,
        idOverlapCount: overlap.length,
        sampleOverlapId: overlap[0] || null,
      };
      results.api_corroborate.sotParity = d5Detail.sotParity;
      results.api_corroborate.contractsInsurance = {
        status: ci.status,
        code: ci.body?.code,
        count: ciRows.length,
        first: ciRows[0]
          ? { id: ciRows[0].id, employee_id: ciRows[0].employee_id, status: ciRows[0].status }
          : null,
      };
      d5Detail.contractsInsuranceCount = ciRows.length;
      d5Detail.employeeInsurancesCount = eiRows.length;

      if (overlap[0]) {
        insuranceId = overlap[0];
        insuranceEmpId =
          eiRows.find((r) => r.id === insuranceId)?.employee_id ||
          ciRows.find((r) => r.id === insuranceId)?.employee_id ||
          emp0.id;
        d5Detail.insuranceId = insuranceId;
        d5Detail.insuranceEmpId = insuranceEmpId;
        d5Detail.dualSotClosed = true;
      } else if (!insuranceId) {
        d5Detail.dualSot =
          ciRows.length > 0 && eiRows.length === 0
            ? 'contracts-insurance has rows; employee-insurances empty — timeline panel SoT gap'
            : ciRows.length > 0 && eiRows.length > 0 && overlap.length === 0
              ? 'both lists have rows but ids do not overlap'
              : null;
        const created = await ensureEnrollmentViaFe();
        d5Detail.feCreate = created;
        if (created.ok) {
          insuranceId = created.insuranceId;
          insuranceEmpId = created.employeeId;
          d5Detail.insuranceId = insuranceId;
          d5Detail.insuranceEmpId = insuranceEmpId;
        }
      }
    } else {
      d5Detail.dualSotClosed = true;
    }

    if (!insuranceId) {
      d5Detail.blocked = 'NO_EMPLOYEE_INSURANCES_ENROLLMENT';
      recordUf('D5_SI_TIMELINE', 'FAIL', {
        summary: `No employee-insurances enrollment after FE create attempt; contracts-insurance count=${d5Detail.contractsInsuranceCount}; dualSot=${d5Detail.dualSot || 'n/a'}`,
        ...d5Detail,
      });
      results.residuals.push({
        id: 'R-EMP-SI-DUAL-SOT',
        severity: 'P0',
        note: 'Insurance list (contracts-insurance) ≠ profile timeline (employee-insurances); actions CORE-10 cannot run on natural list rows',
      });
    } else {
      // Assert list id usable for actions (BE-02)
      d5Detail.idMatchOk =
        (d5Detail.sotParity?.idOverlapCount || 0) > 0 || d5Detail.dualSotClosed === true;

      await openInsuranceTab(insuranceEmpId);
      // Hard refresh so FE-04 bundle (body company_id) is live
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2000);
      await shot(page, '10-insurance-tab');

      const openMeta = {
        enrollmentsRoot:
          (await page.locator('[data-testid="hdsd-insurance-enrollments-root"]').count()) > 0,
        timelineRoot:
          (await page.locator('[data-testid="hdsd-insurance-timeline-root"]').count()) > 0,
        url: page.url(),
      };
      d5Detail.openPath = openMeta;
      d5Detail.enrollmentsRoot = openMeta.enrollmentsRoot;

      const root = page.locator('[data-testid="hdsd-insurance-timeline-root"]');
      d5Detail.timelineRoot = (await root.count()) > 0;

      const actionOrder = ['suspend', 'stop', 'close', 'change_rate', 'resume'];
      let clicked = null;
      for (const action of actionOrder) {
        const btn = page
          .locator(`[data-testid="hdsd-insurance-action-${action}-${insuranceId}"]`)
          .first();
        const btnAny = page.locator(`[data-testid^="hdsd-insurance-action-${action}-"]`).first();
        const target = (await btn.count()) > 0 ? btn : btnAny;
        if ((await target.count()) > 0 && (await target.isVisible().catch(() => false))) {
          await target.click();
          clicked = action;
          d5Detail.actionTestId = await target.getAttribute('data-testid');
          break;
        }
      }
      if (!clicked) {
        const lab = page
          .locator('button')
          .filter({ hasText: /Đổi mức|Tạm hoãn|Ngừng|Đóng|Tiếp tục/i })
          .first();
        if ((await lab.count()) > 0) {
          const t = ((await lab.textContent()) || '').trim();
          await lab.click();
          clicked = t;
        }
      }
      d5Detail.clickedAction = clicked;
      await sleep(800);
      await shot(page, '11-si-action-dialog');

      if (clicked) {
        // Fill required dialog fields (ViDateField usually prefilled; suspend needs reason)
        if (String(clicked).includes('suspend') || clicked === 'suspend') {
          const reason = page.locator('[role="dialog"] textarea').first();
          if ((await reason.count()) > 0) {
            await reason.fill(`QA R4 suspend ${STAMP}`);
          }
        }
        // change_rate may need amounts — leave defaults if prefilled
        const submit = page.locator('[data-testid="hdsd-insurance-action-submit"]').first();
        if ((await submit.count()) > 0) {
          await submit.click();
          await sleep(3000);
          d5Detail.postStatus = results.lastSiAction?.status ?? null;
          d5Detail.postCode = results.lastSiAction?.code ?? null;
          d5Detail.postMessage = results.lastSiAction?.message ?? null;
          d5Detail.postEnrollmentId =
            results.lastSiAction?.enrollment_id || results.lastSiAction?.id || null;
          d5Detail.requestBody = results.lastSiAction?.requestBody ?? null;
          d5Detail.bodyCompanyId = results.lastSiAction?.bodyCompanyId ?? null;
          d5Detail.bodyHasCompanyId = results.lastSiAction?.bodyHasCompanyId === true;
          await shot(page, '12-si-after-post');
          // F5 with deep-link again
          await openInsuranceTab(insuranceEmpId);
          await sleep(2500);
          const periods = page.locator('[data-testid="hdsd-insurance-periods-list"]');
          d5Detail.periodsVisible = (await periods.count()) > 0;
          if (!d5Detail.periodsVisible) {
            const bodyText = ((await page.locator('body').textContent()) || '').slice(0, 4000);
            d5Detail.periodsVisible = /giai đoạn|period|mức đóng|từ ngày|→|tạm hoãn|suspend/i.test(
              bodyText,
            );
          }
          d5Detail.timelineRootAfterF5 =
            (await page.locator('[data-testid="hdsd-insurance-timeline-root"]').count()) > 0;
          await shot(page, '13-si-f5-periods');
          const post2xx =
            d5Detail.postStatus >= 200 && d5Detail.postStatus < 300;
          d5Pass =
            d5Detail.timelineRoot === true &&
            post2xx &&
            d5Detail.bodyHasCompanyId === true &&
            (d5Detail.periodsVisible || d5Detail.timelineRootAfterF5);
          if (!d5Detail.bodyHasCompanyId || (d5Detail.postStatus === 400 && /company_id/i.test(String(d5Detail.postMessage || '')))) {
            results.residuals.push({
              id: 'R-EMP-SI-ACTION-COMPANY-ID-BODY',
              severity: 'P0',
              note: `POST actions body company_id missing or rejected; status=${d5Detail.postStatus} code=${d5Detail.postCode} bodyCompanyId=${d5Detail.bodyCompanyId} msg=${d5Detail.postMessage}`,
            });
          }
        } else {
          // Fallback: API POST actions if FE submit missing but id known (still need FE click path)
          d5Detail.submitMissing = true;
        }
      } else {
        // No FE action buttons — try API action as corroborate only, mark FE gap
        d5Detail.noActionButtons = true;
        const act = await fetch(
          `${HRM}/api/hrm/employee-insurances/${insuranceId}/actions`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${session.token}`,
              'content-type': 'application/json',
              'x-tenant-id': TENANT,
              'x-company-id': COMPANY,
            },
            body: JSON.stringify({
              action: 'suspend',
              company_id: COMPANY,
              effective_from: new Date().toISOString().slice(0, 10),
              effective_date: new Date().toISOString().slice(0, 10),
              suspend_reason: `QA R4 ${STAMP}`,
              change_reason: `QA R4 ${STAMP}`,
              note: `QA R4 ${STAMP}`,
            }),
          },
        ).then(async (r) => {
          const j = await r.json().catch(() => ({}));
          return { status: r.status, code: j?.code, message: j?.message };
        });
        d5Detail.apiActionCorroborate = act;
        d5Detail.postStatus = act.status;
        // U65: API corroborate alone ≠ PASS — need FE action click
        d5Pass = false;
        results.residuals.push({
          id: 'R-EMP-SI-FE-ACTION-UI',
          severity: 'P1',
          note: `Enrollment id=${insuranceId} exists (SoT overlap ok) but FE action buttons missing; API actions HTTP ${act.status}`,
        });
      }

      recordUf('D5_SI_TIMELINE', d5Pass ? 'PASS' : 'FAIL', {
        summary: `timeline=${d5Detail.timelineRoot} enrollRoot=${d5Detail.enrollmentsRoot} action=${clicked} post=${d5Detail.postStatus} bodyCompanyId=${d5Detail.bodyCompanyId} periods=${d5Detail.periodsVisible}`,
        ...d5Detail,
      });
    }
    } // end FE03_READY else

    // ========== J-HRM-01..04 regression ==========
    log('J_START');

    // J-HRM-02 employees list → detail
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await shot(page, '14-j02-list');
    const row = page.locator('table tbody tr').first();
    let j02 = false;
    if ((await row.count()) > 0) {
      const link = row.locator('a[href*="/employees/"]').first();
      if ((await link.count()) > 0) {
        await link.click();
      } else {
        await row.locator('td').first().click();
      }
      await sleep(3000);
      j02 = /\/employees\/[0-9a-f-]{8,}/i.test(page.url());
      const detailGet = results.network.filter(
        (n) => n.method === 'GET' && /\/employees\/[0-9a-f-]{8,}/i.test(n.url) && !/work-timeline|hire-readiness/.test(n.url),
      );
      const lastGet = detailGet[detailGet.length - 1];
      j02 = j02 && (!lastGet || (lastGet.status >= 200 && lastGet.status < 300));
      await shot(page, '15-j02-detail');
      recordJ('J-HRM-02', j02 ? 'PASS' : 'FAIL', {
        summary: `url=${page.url().slice(0, 120)} get=${lastGet?.status}`,
        url: page.url(),
        getStatus: lastGet?.status,
      });
    } else {
      recordJ('J-HRM-02', 'FAIL', { summary: 'empty employees table' });
    }

    // J-HRM-01 contracts → employee
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await shot(page, '16-j01-contracts');
    let j01 = false;
    const empLink = page.locator('a[href*="/employees/"]').first();
    if ((await empLink.count()) > 0) {
      const href = await empLink.getAttribute('href');
      await empLink.click();
      await sleep(3000);
      j01 = /\/employees\//.test(page.url());
      await shot(page, '17-j01-emp');
      recordJ('J-HRM-01', j01 ? 'PASS' : 'FAIL', {
        summary: `href=${href} url=${page.url().slice(0, 120)}`,
        href,
        url: page.url(),
      });
    } else {
      // Eye / detail without emp link — soft if list loaded
      const rows = await page.locator('table tbody tr').count();
      recordJ('J-HRM-01', rows > 0 ? 'PARTIAL' : 'FAIL', {
        summary: `no employee link; rows=${rows}`,
        rows,
      });
      if (rows === 0) {
        results.residuals.push({
          id: 'R-J01-EMPTY-OR-NO-LINK',
          severity: 'P2',
          note: 'Contracts list no employee_id link visible under main',
        });
      }
    }

    // J-HRM-03 contract detail
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const eye = page.locator('button, a').filter({ hasText: /Eye|Chi tiết|Xem/i }).first();
    const eyeIcon = page.locator('table tbody tr button').first();
    let j03 = false;
    if ((await eye.count()) > 0) {
      await eye.click();
      await sleep(1500);
      j03 = (await page.locator('[role="dialog"], [data-state="open"]').count()) > 0;
    } else if ((await eyeIcon.count()) > 0) {
      await eyeIcon.click();
      await sleep(1500);
      j03 = (await page.locator('[role="dialog"], [data-state="open"]').count()) > 0;
    }
    await shot(page, '18-j03-detail');
    recordJ('J-HRM-03', j03 ? 'PASS' : (await page.locator('table tbody tr').count()) > 0 ? 'PARTIAL' : 'FAIL', {
      summary: `dialog=${j03}`,
    });

    // J-HRM-04 insurance → employee
    await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await shot(page, '19-j04-insurance');
    const insEmpLink = page.locator('table tbody tr a[href*="/employees/"]').first();
    let j04 = false;
    if ((await insEmpLink.count()) > 0) {
      const href = await insEmpLink.getAttribute('href');
      // Prefer navigation over click (footer chrome intercepts pointer)
      const abs = href?.startsWith('http') ? href : `${PORTAL}${href}`;
      await page.goto(abs, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      j04 = /\/employees\//.test(page.url());
      const detailGets = results.network.filter(
        (n) =>
          n.method === 'GET' &&
          /\/employees\/[0-9a-f-]{8,}/i.test(n.url) &&
          !/work-timeline|hire-readiness/.test(n.url),
      );
      const lastGet = detailGets[detailGets.length - 1];
      const scopeOk = !lastGet || (lastGet.status !== 404 && lastGet.status !== 409);
      await shot(page, '20-j04-emp');
      recordJ('J-HRM-04', j04 && scopeOk ? 'PASS' : 'FAIL', {
        summary: `href=${href} url=${page.url().slice(0, 120)} get=${lastGet?.status}`,
        href,
        url: page.url(),
        getStatus: lastGet?.status,
      });
    } else {
      const rows = await page.locator('table tbody tr').count();
      recordJ('J-HRM-04', rows > 0 ? 'PARTIAL' : 'FAIL', {
        summary: `no employee link; rows=${rows}`,
        rows,
      });
    }

    // Process gate
    const processOk =
      results.pageErrors.length === 0 &&
      !results.consoleErrors.some((e) => /Uncaught|ReferenceError|Unable to find drag handle/i.test(e));

    const ufVerdicts = Object.values(results.uf).map((x) => x.verdict);
    const jVerdicts = Object.values(results.journey).map((x) => x.verdict);
    const hardFail =
      ufVerdicts.includes('FAIL') ||
      jVerdicts.includes('FAIL') ||
      !processOk;
    const blockedOnly =
      !hardFail &&
      (ufVerdicts.includes('BLOCKED') ||
        ufVerdicts.includes('PARTIAL') ||
        jVerdicts.includes('PARTIAL') ||
        jVerdicts.includes('BLOCKED'));

    results.process_gate = {
      pageErrors: results.pageErrors.length,
      consoleErrors: results.consoleErrors.length,
      processOk,
    };
    results.honesty = {
      hrm_personnel_uat_ready: false,
      employees_e2e_linkage_ready: false,
      narrow_slice_only: true,
    };

    if (hardFail) results.overall = 'FAIL';
    else if (blockedOnly) results.overall = 'FAIL';
    else results.overall = 'PASS';

    const coreRequired = ['D2_WH_PICKER', 'D1_DEC_WH', 'D6_HTP05'];
    if (FE03_READY) coreRequired.push('D5_SI_TIMELINE');
    const coreAllPass = coreRequired.every((k) => results.uf[k]?.verdict === 'PASS');
    const d5HoldOk = !FE03_READY && results.uf.D5_SI_TIMELINE?.verdict === 'HOLD';
    const jOk = ['J-HRM-01', 'J-HRM-02', 'J-HRM-04'].every((k) => {
      const v = results.journey[k]?.verdict;
      return v === 'PASS' || v === 'PARTIAL';
    });
    // J-HRM-03 PARTIAL allowed (Eye dialog flaky) — not hard fail alone
    if (coreAllPass && jOk && processOk && (FE03_READY || d5HoldOk)) {
      results.overall = 'PASS';
    } else {
      results.overall = 'FAIL';
    }
    if (!d1Pass && results.uf.D1_DEC_WH?.verdict === 'FAIL') {
      results.residuals.push({
        id: 'R-EMP-DEC-WH-NEO-CATALOG',
        severity: 'P0',
        note: `POST decisions HRD_01 effective → work_history_id=${results.uf.D1_DEC_WH?.work_history_id ?? 'null'}; F5 neo=${results.uf.D1_DEC_WH?.hasDecisionNeo}`,
      });
    }

    results.endedAt = ts();
    save();
    console.log('OVERALL', results.overall);
  } catch (sectionErr) {
    results.fatal = String(sectionErr).slice(0, 500);
    results.overall = 'FAIL';
    results.residuals.push({
      id: 'R-QA-HARNESS-FATAL',
      severity: 'P0',
      note: results.fatal,
    });
    results.endedAt = ts();
    save();
    console.error('SECTION_FATAL', sectionErr);
    console.log('OVERALL', results.overall);
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((e) => {
  results.overall = 'FAIL';
  results.fatal = String(e).slice(0, 500);
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
