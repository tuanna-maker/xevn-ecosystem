#!/usr/bin/env node
/**
 * PO-UAT-EMP-SOFT-OBS-QA-01 — Browser U65 soft OBS reconfirm
 * Parent: PO-UAT-EMP-SOFT-OBS-FE-01 READY_FOR_QA
 * Focus:
 *   OBS-D1-HINT — HRD_01+effective+employee → hdsd-decisions-effective-wh-hint visible; D1 neo/badge still PASS
 *   HRD_03+effective → hint absent
 *   OBS-SI-DATE-ISO — SI card + periods after stop/F5 = dd/MM/yyyy (no raw ISO leak)
 *   D5 body company_id still true; J03 not reopened
 * Honesty: do NOT set hrm_personnel_uat_ready
 * DENIED: seed · api_only_pass · invent flag · reopen sealed D1/D5/J03
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-emp-soft-obs-qa-01.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-emp-soft-obs-qa-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `EMPOBS-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const ISO_DATE_LEAK = /\b20\d{2}-\d{2}-\d{2}\b/;
const VI_DATE = /\b\d{2}\/\d{2}\/\d{4}\b/;

const results = {
  work_item_id: 'PO-UAT-EMP-SOFT-OBS-QA-01',
  parent: 'PO-UAT-EMP-SOFT-OBS-FE-01',
  startedAt: ts(),
  u65: 'zero-seed',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, TENANT, STAMP },
  denied: [
    'hrm_personnel_uat_ready',
    'employees_e2e_linkage_ready',
    'seed',
    'api_only_pass',
    'module_uat',
    'reopen_D1',
    'reopen_D5',
    'reopen_J03',
  ],
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    note: 'QA does not invent personnel UAT flag — QC decides clean GO',
  },
  sealed: {
    'R-EMP-DEC-WH-NEO-CATALOG': 'SEALED_must_keep',
    'R-EMP-SI-ACTION-COMPANY-ID-BODY': 'SEALED_must_keep',
    'R-J03-DIALOG': 'SEALED_not_reopened',
  },
  l0: {},
  uf: {},
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
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

function scanDates(text) {
  const t = String(text || '');
  return {
    hasIsoLeak: ISO_DATE_LEAK.test(t),
    hasViDate: VI_DATE.test(t),
    isoMatches: t.match(ISO_DATE_LEAK) || [],
    viMatches: t.match(VI_DATE) || [],
    sample: t.replace(/\s+/g, ' ').trim().slice(0, 400),
  };
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
        /work-timeline|employee-insurances|\/decisions|\/employees\//.test(u);
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
          entry.work_history_id = row?.work_history_id ?? null;
          entry.enrollment_id = row?.enrollment_id || row?.id || null;
          if (/actions/.test(u)) {
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
              postBody && typeof postBody.company_id === 'string' ? postBody.company_id : null;
            entry.bodyHasCompanyId =
              typeof entry.bodyCompanyId === 'string' && entry.bodyCompanyId.trim().length > 0;
            entry.wireEffectiveFrom = postBody?.effective_from ?? null;
            results.lastSiAction = entry;
          }
          if (/decisions/.test(u)) results.lastDecisionMutate = { ...entry, body: row };
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
  await sleep(3000);
  return url;
}

async function openInsuranceTab(page, employeeId) {
  const url = q(`/hr/employees/${employeeId}`, { tab: 'insurance' });
  log('GOTO_INSURANCE', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const group = page.locator('[data-testid="profile-group-tab-insurance"]').first();
  if ((await group.count()) > 0) {
    await group.click().catch(() => {});
    await sleep(1500);
  }
  return url;
}

async function openDecisionsCreate(page) {
  await page.goto(q('/hr/decisions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const add = page.locator('[data-testid="hdsd-decisions-add"]').first();
  const addBtn =
    (await add.count()) > 0
      ? add
      : page.locator('button').filter({ hasText: /Thêm|Tạo|Add|New/i }).first();
  if ((await addBtn.count()) === 0) return { ok: false, reason: 'add_missing' };
  await addBtn.click();
  await sleep(1200);
  return { ok: true };
}

async function pickType(page, pattern) {
  const typePicker = page.locator('[data-testid="hdsd-decisions-form-type"]').first();
  if ((await typePicker.count()) === 0) return { ok: false };
  await typePicker.click();
  await sleep(400);
  const typeOpt = page.locator('[cmdk-item], [role="option"]').filter({ hasText: pattern }).first();
  if ((await typeOpt.count()) === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false };
  }
  const label = ((await typeOpt.textContent()) || '').trim().slice(0, 80);
  await typeOpt.click();
  await sleep(300);
  return { ok: true, label };
}

async function pickEmployee(page) {
  const empTrigger = page.locator('[data-testid="hdsd-decisions-form-employee"]').first();
  if ((await empTrigger.count()) === 0) return { ok: false };
  await empTrigger.click();
  await sleep(500);
  const opt = page.locator('[role="option"]').first();
  if ((await opt.count()) === 0) return { ok: false };
  const label = ((await opt.textContent()) || '').trim();
  await opt.click();
  await sleep(400);
  return { ok: true, label };
}

async function setEffective(page) {
  const statusTrigger = page.locator('[data-testid="hdsd-decisions-form-status"]').first();
  if ((await statusTrigger.count()) === 0) return false;
  await statusTrigger.click();
  await sleep(300);
  const eff = page
    .locator('[role="option"]')
    .filter({ hasText: /Có hiệu lực|Hiệu lực|effective/i })
    .first();
  if ((await eff.count()) === 0) return false;
  await eff.click();
  await sleep(400);
  return true;
}

async function fillDecisionBasics(page, code, title) {
  const codeInput = page.locator('[data-testid="hdsd-decisions-form-code"]').first();
  const titleInput = page.locator('[data-testid="hdsd-decisions-form-title"]').first();
  if ((await codeInput.count()) > 0) await codeInput.fill(code);
  else {
    const labeled = page.getByLabel(/Số \/ mã quyết định|Mã quyết định/i).first();
    if ((await labeled.count()) > 0) await labeled.fill(code);
  }
  if ((await titleInput.count()) > 0) await titleInput.fill(title);
  else {
    const labeled = page.getByLabel(/Tiêu đề|Title/i).first();
    if ((await labeled.count()) > 0) await labeled.fill(title);
  }
}

async function main() {
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

  const empList = await apiGet(session.token, `/api/hrm/employees?page_size=30&company_id=${COMPANY}`);
  const employees = unwrapList(empList.body);
  const emp0 = employees[0];
  if (!emp0?.id) throw new Error('no employees for U65 natural data');
  results.ids.employeeId = emp0.id;
  results.ids.employeeName = emp0.display_name || emp0.full_name;

  // Prefer enrollments whose employee profile is FE-visible (GET by id 2xx under main)
  const ei = await apiGet(session.token, `/api/hrm/employee-insurances?company_id=${COMPANY}`);
  const eiRows = unwrapList(ei.body);
  const profileOk = {};
  for (const row of eiRows) {
    const eid = row.employee_id;
    if (!eid || profileOk[eid] != null) continue;
    const probe = await apiGet(session.token, `/api/hrm/employees/${eid}?company_id=${COMPANY}`);
    profileOk[eid] = probe.status >= 200 && probe.status < 300;
  }
  const ranked = [...eiRows].sort((a, b) => {
    const aVis = profileOk[a.employee_id] ? 1 : 0;
    const bVis = profileOk[b.employee_id] ? 1 : 0;
    if (bVis !== aVis) return bVis - aVis;
    const aAct = /active|pending|suspended/i.test(String(a.status || '')) ? 1 : 0;
    const bAct = /active|pending|suspended/i.test(String(b.status || '')) ? 1 : 0;
    return bAct - aAct;
  });
  let insuranceId = null;
  let insuranceEmpId = emp0.id;
  for (const row of ranked) {
    if (profileOk[row.employee_id] && row.id) {
      insuranceId = row.id;
      insuranceEmpId = row.employee_id;
      break;
    }
  }
  // Fallback: use emp0 (known visible from D1) — FE may create enrollment later
  if (!insuranceId) {
    insuranceEmpId = emp0.id;
    const one = await apiGet(
      session.token,
      `/api/hrm/employee-insurances?company_id=${COMPANY}&employee_id=${emp0.id}`,
    );
    const rows = unwrapList(one.body);
    insuranceId = rows[0]?.id || null;
  }
  results.ids.insuranceId = insuranceId;
  results.ids.insuranceEmpId = insuranceEmpId;
  results.api_corroborate = {
    employeeInsurancesCount: eiRows.length,
    profileOk,
    pickedStatus: ranked.find((r) => r.id === insuranceId)?.status || null,
    pickedVisible: !!profileOk[insuranceEmpId],
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
    // ========== OBS-D1-HINT positive (HRD_01) ==========
    log('OBS_D1_HINT_HRD01');
    const d1 = {
      hintVisible: false,
      typeLabel: null,
      statusEffective: false,
      employeePicked: false,
      saveStatus: null,
      work_history_id: null,
      hasDecisionNeo: false,
      badgeCount: 0,
      badgeText: '',
    };

    const opened = await openDecisionsCreate(page);
    if (!opened.ok) {
      recordUf('OBS-D1-HINT', 'FAIL', { summary: 'decisions add missing', ...d1 });
    } else {
      await fillDecisionBasics(page, `QD-${STAMP}`, `QA OBS hint ${STAMP}`);
      const typePick = await pickType(page, /bổ nhiệm|appointment|HRD_01/i);
      d1.typePicked = typePick.ok;
      d1.typeLabel = typePick.label || null;

      const empPick = await pickEmployee(page);
      d1.employeePicked = empPick.ok;
      d1.employeeLabel = empPick.label || null;

      const posPick = await pickCatalog(page, 'hdsd-decisions-form-position');
      d1.posPicked = !!posPick.ok;
      d1.posLabel = posPick.label || null;

      d1.statusEffective = await setEffective(page);
      await sleep(500);

      const hint = page.locator('[data-testid="hdsd-decisions-effective-wh-hint"]');
      d1.hintVisible = (await hint.count()) > 0 && (await hint.first().isVisible().catch(() => false));
      d1.hintText = d1.hintVisible
        ? ((await hint.first().textContent()) || '').trim().slice(0, 200)
        : null;
      await shot(page, '01-d1-hrd01-hint');

      // Submit to reconfirm D1 sealed neo/badge (must_keep)
      const cmdkOpen = page.locator('[cmdk-list], [role="listbox"]');
      if ((await cmdkOpen.count()) > 0 && (await cmdkOpen.first().isVisible().catch(() => false))) {
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(200);
      }
      const submitDec = page.locator('[data-testid="hdsd-decisions-form-submit"]').first();
      if ((await submitDec.count()) > 0) {
        await submitDec.evaluate((el) => el.click());
        await sleep(3500);
        d1.saveStatus = results.lastDecisionMutate?.status ?? null;
        d1.saveCode = results.lastDecisionMutate?.code ?? null;
        d1.decisionId = results.lastDecisionMutate?.id ?? results.lastDecisionMutate?.body?.id;
        d1.work_history_id =
          results.lastDecisionMutate?.work_history_id ??
          results.lastDecisionMutate?.body?.work_history_id ??
          null;
        d1.decisionType =
          results.lastDecisionMutate?.body?.decision_type ||
          results.lastDecisionMutate?.body?.type ||
          null;
        d1.decisionEmployeeId = results.lastDecisionMutate?.body?.employee_id || null;
        await shot(page, '02-d1-after-save');

        if (d1.saveStatus >= 200 && d1.saveStatus < 300 && d1.decisionEmployeeId) {
          await openEmployeeProfile(page, d1.decisionEmployeeId);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(3500);
          await shot(page, '03-d1-wh-f5');
          const badge = page.locator('[data-testid^="hdsd-work-timeline-decision-"]');
          d1.badgeCount = await badge.count();
          d1.badgeText =
            d1.badgeCount > 0 ? ((await badge.first().textContent()) || '').trim().slice(0, 120) : '';
          const whSample = results.lastWhList?.sample || [];
          d1.hasDecisionNeo =
            !!d1.work_history_id &&
            (d1.badgeCount > 0 ||
              whSample.some(
                (x) =>
                  x.decision_id === d1.decisionId ||
                  x.source_module === 'decision' ||
                  x.decision_code,
              ));
        }
      }

      const d1NeoOk =
        !!d1.work_history_id &&
        d1.saveStatus >= 200 &&
        d1.saveStatus < 300 &&
        d1.hasDecisionNeo === true;
      const hintOk = d1.hintVisible === true && d1.statusEffective === true && d1.employeePicked === true;
      const obsD1Pass = hintOk && d1NeoOk;
      if (!obsD1Pass) {
        results.residuals.push({
          id: 'OBS-D1-HINT',
          severity: 'P3',
          note: `hintVisible=${d1.hintVisible} neo=${d1.hasDecisionNeo} whId=${d1.work_history_id}`,
        });
      }
      recordUf('OBS-D1-HINT', obsD1Pass ? 'PASS' : 'FAIL', {
        summary: `hint=${d1.hintVisible} type=${d1.typeLabel || d1.decisionType} save=${d1.saveStatus} whId=${d1.work_history_id} neo=${d1.hasDecisionNeo} badge=${d1.badgeCount}`,
        ...d1,
        d1NeoSealed: d1NeoOk ? 'PASS' : 'FAIL',
      });
      recordUf('D1_NEO_SEALED', d1NeoOk ? 'PASS' : 'FAIL', {
        summary: `whId=${d1.work_history_id} neo=${d1.hasDecisionNeo} badge=${d1.badgeText}`,
        work_history_id: d1.work_history_id,
        hasDecisionNeo: d1.hasDecisionNeo,
        badgeCount: d1.badgeCount,
        badgeText: d1.badgeText,
      });
    }

    // ========== HRD_03 negative — hint absent ==========
    log('OBS_D1_HINT_HRD03_NEG');
    const hrd03 = { hintVisible: null, typeLabel: null, statusEffective: false, employeePicked: false };
    const opened3 = await openDecisionsCreate(page);
    if (!opened3.ok) {
      recordUf('OBS-D1-HINT-HRD03-ABSENT', 'FAIL', { summary: 'add missing', ...hrd03 });
    } else {
      await fillDecisionBasics(page, `QD-H3-${STAMP}`, `QA HRD03 no hint ${STAMP}`);
      const typePick = await pickType(page, /kỷ luật|ky luat|HRD_03|discipline/i);
      hrd03.typePicked = typePick.ok;
      hrd03.typeLabel = typePick.label || null;
      // If catalog label differs, try alternate
      if (!typePick.ok) {
        const alt = await pickType(page, /kỷ|luật|HRD.?03/i);
        hrd03.typePicked = alt.ok;
        hrd03.typeLabel = alt.label || null;
      }
      const empPick = await pickEmployee(page);
      hrd03.employeePicked = empPick.ok;
      // position may still be required by form — pick to keep dialog stable
      await pickCatalog(page, 'hdsd-decisions-form-position');
      hrd03.statusEffective = await setEffective(page);
      await sleep(500);
      const hint = page.locator('[data-testid="hdsd-decisions-effective-wh-hint"]');
      const hintCount = await hint.count();
      hrd03.hintVisible =
        hintCount > 0 && (await hint.first().isVisible().catch(() => false));
      await shot(page, '04-d1-hrd03-no-hint');
      // Close dialog without save — do not invent WH via HRD_03 mutate
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(300);
      const cancel = page.locator('button').filter({ hasText: /Hủy|Cancel|Đóng/i }).first();
      if ((await cancel.count()) > 0) await cancel.click().catch(() => {});

      const hrd03Pass =
        hrd03.typePicked === true &&
        hrd03.statusEffective === true &&
        hrd03.employeePicked === true &&
        hrd03.hintVisible === false;
      if (!hrd03Pass) {
        results.residuals.push({
          id: 'OBS-D1-HINT-HRD03',
          severity: 'P3',
          note: `expected hint absent; got hintVisible=${hrd03.hintVisible} type=${hrd03.typeLabel}`,
        });
      }
      recordUf('OBS-D1-HINT-HRD03-ABSENT', hrd03Pass ? 'PASS' : 'FAIL', {
        summary: `type=${hrd03.typeLabel} hintVisible=${hrd03.hintVisible} (expect false)`,
        ...hrd03,
      });
    }

    // ========== OBS-SI-DATE-ISO + D5 sealed body company_id ==========
    log('OBS_SI_DATE_ISO');
    const d5 = {
      insuranceId,
      insuranceEmpId,
      bodyHasCompanyId: false,
      bodyCompanyId: null,
      wireEffectiveFrom: null,
      postStatus: null,
      periodsScan: null,
      cardScan: null,
      periodsVisible: false,
    };

    async function ensureEnrollmentViaFe(targetEmpId) {
      await openInsuranceTab(page, targetEmpId);
      await sleep(2000);
      const notFound = page.getByText(/Không tìm thấy nhân viên/i);
      if ((await notFound.count()) > 0 && (await notFound.first().isVisible().catch(() => false))) {
        return { ok: false, reason: 'employee_not_found' };
      }
      const existingActionable = page
        .locator(
          '[data-testid^="hdsd-insurance-action-stop-"], [data-testid^="hdsd-insurance-action-suspend-"], [data-testid^="hdsd-insurance-action-resume-"], [data-testid^="hdsd-insurance-action-close-"], [data-testid^="hdsd-insurance-action-change_rate-"]',
        )
        .first();
      if (
        (await existingActionable.count()) > 0 &&
        (await existingActionable.isVisible().catch(() => false))
      ) {
        const tid = await existingActionable.getAttribute('data-testid');
        const m = tid && tid.match(/hdsd-insurance-action-[^-]+-(.+)$/);
        return {
          ok: true,
          insuranceId: m?.[1] || null,
          employeeId: targetEmpId,
          reused: true,
        };
      }
      const addIns = page
        .locator('button')
        .filter({ hasText: /Thêm bảo hiểm|\+.*[Bb]ảo hiểm|Add insurance/i })
        .first();
      const addAny = page.locator('button').filter({ hasText: /^\+\s*$|Thêm$/i }).first();
      const addBtn =
        (await addIns.count()) > 0
          ? addIns
          : page
              .locator('[data-testid="hdsd-insurance-enrollments-root"]')
              .locator('xpath=ancestor::div[contains(@class,\"card\") or contains(@class,\"Card\")][1]')
              .locator('button')
              .filter({ hasText: /Thêm|Add|\+/i })
              .first();
      const clickAdd =
        (await addIns.count()) > 0 ? addIns : (await addBtn.count()) > 0 ? addBtn : addAny;
      if ((await clickAdd.count()) === 0) {
        // Fallback: any blue add near insurance title
        const plus = page.locator('button').filter({ hasText: /Thêm bảo hiểm|Thêm/i });
        if ((await plus.count()) === 0) return { ok: false, reason: 'no_add_btn' };
        await plus.first().click();
      } else {
        await clickAdd.click();
      }
      await sleep(1000);
      const dlg = page.locator('[role="dialog"]');
      if ((await dlg.count()) === 0) return { ok: false, reason: 'no_dialog' };
      const todayVi = (() => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      })();
      const endVi = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      })();
      const fillAfterLabel = async (re, value) => {
        const lab = dlg.locator('label').filter({ hasText: re }).first();
        if ((await lab.count()) === 0) return false;
        const inp = lab.locator('xpath=following::input[1]');
        if ((await inp.count()) === 0) return false;
        await inp.fill('');
        await inp.fill(value);
        return true;
      };
      await fillAfterLabel(/Nhà cung cấp|Provider/i, `QA-SI-${STAMP}`);
      await fillAfterLabel(/Số thẻ|Policy|Số hợp đồng|Số bảo hiểm/i, `POL-${STAMP}`);
      await fillAfterLabel(/Ngày bắt đầu|Start/i, todayVi);
      await fillAfterLabel(/Ngày kết thúc|End/i, endVi);
      // Placeholder fallback for ViDateField
      const dateInputs = dlg.locator('input[placeholder*="dd"], input[placeholder*="MM"]');
      const di = await dateInputs.count();
      if (di >= 1) {
        await dateInputs.nth(0).fill(todayVi).catch(() => {});
      }
      if (di >= 2) {
        await dateInputs.nth(1).fill(endVi).catch(() => {});
      }
      await shot(page, '05a-si-create-dialog');
      const save = dlg.locator('button').filter({ hasText: /^Lưu$|Save/i }).first();
      if ((await save.count()) > 0) {
        await save.click();
        await sleep(3500);
      }
      await shot(page, '05b-si-after-fe-create');
      const createNet = [...results.network]
        .reverse()
        .find((x) => x.method === 'POST' && /employee-insurances/.test(x.url) && !/actions/.test(x.url));
      const one = await apiGet(
        session.token,
        `/api/hrm/employee-insurances?company_id=${COMPANY}&employee_id=${targetEmpId}`,
      );
      const rows = unwrapList(one.body);
      const actionable = rows.find((r) =>
        /active|pending|suspended/i.test(String(r.status || '')),
      );
      return {
        ok: !!actionable?.id,
        insuranceId: actionable?.id || null,
        employeeId: targetEmpId,
        createCount: rows.length,
        status: actionable?.status || null,
        allStatuses: rows.map((r) => r.status),
        createNet: createNet || null,
        datesFilled: { start: todayVi, end: endVi },
        reason: actionable?.id ? undefined : 'no_actionable_after_create',
      };
    }

    // Prefer emp0 (empty SI) for FE create; then other visible employees
    const targetCandidates = [
      emp0.id,
      results.uf['OBS-D1-HINT']?.decisionEmployeeId,
      '22222222-2222-4222-8222-222222222222',
      insuranceEmpId,
    ].filter(Boolean);

    let ensured = null;
    for (const cand of [...new Set(targetCandidates)]) {
      const probe = await apiGet(session.token, `/api/hrm/employees/${cand}?company_id=${COMPANY}`);
      if (!(probe.status >= 200 && probe.status < 300)) continue;
      const list = await apiGet(
        session.token,
        `/api/hrm/employee-insurances?company_id=${COMPANY}&employee_id=${cand}`,
      );
      const rows = unwrapList(list.body);
      const actionable = rows.find((r) => /active|pending|suspended/i.test(String(r.status || '')));
      if (actionable?.id) {
        insuranceId = actionable.id;
        insuranceEmpId = cand;
        ensured = { ok: true, insuranceId, employeeId: cand, reused: true, status: actionable.status };
        break;
      }
      ensured = await ensureEnrollmentViaFe(cand);
      d5.feCreateAttempts = (d5.feCreateAttempts || []).concat([{ cand, ...ensured }]);
      if (ensured.ok && ensured.insuranceId) {
        insuranceId = ensured.insuranceId;
        insuranceEmpId = ensured.employeeId;
        break;
      }
    }
    d5.ensured = ensured;
    // Only proceed to D5 mutate with actionable enrollment
    if (!(ensured && ensured.ok && ensured.insuranceId)) {
      insuranceId = null;
    } else {
      insuranceId = ensured.insuranceId;
      insuranceEmpId = ensured.employeeId;
    }
    d5.insuranceId = insuranceId;
    d5.insuranceEmpId = insuranceEmpId;
    results.ids.insuranceId = insuranceId;
    results.ids.insuranceEmpId = insuranceEmpId;

    // Soft-OBS date evidence can use existing stopped enrollment (post prior UAT stop) on visible emp
    async function assertSiDateDisplay(empId) {
      await openInsuranceTab(page, empId);
      await sleep(2000);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(2500);
      const group = page.locator('[data-testid="profile-group-tab-insurance"]').first();
      if ((await group.count()) > 0) {
        await group.click().catch(() => {});
        await sleep(1200);
      }
      await shot(page, '05-si-date-surface');
      const periods = page.locator('[data-testid="hdsd-insurance-periods-list"]');
      const periodsVisible = (await periods.count()) > 0;
      const periodsText = periodsVisible
        ? (await periods.first().textContent()) || ''
        : (await page
              .locator('[data-testid="hdsd-insurance-timeline-root"]')
              .textContent()
              .catch(() => '')) || '';
      const enrollRoot = page.locator('[data-testid="hdsd-insurance-enrollments-root"]').first();
      const cardText =
        (await enrollRoot.count()) > 0
          ? (await enrollRoot.textContent()) || ''
          : (await page.locator('body').textContent()) || '';
      const periodsScan = scanDates(periodsText);
      const cardScan = scanDates(cardText);
      const displayClean =
        periodsScan.hasIsoLeak === false &&
        cardScan.hasIsoLeak === false &&
        (periodsScan.hasViDate === true || cardScan.hasViDate === true);
      return {
        periodsVisible,
        periodsScan,
        cardScan,
        displayClean,
        enrollmentsRoot: (await enrollRoot.count()) > 0,
        timelineRoot:
          (await page.locator('[data-testid="hdsd-insurance-timeline-root"]').count()) > 0,
      };
    }

    // Always capture OBS-SI-DATE-ISO on known stopped enrollment (periods after prior stop)
    const dateSurface = await assertSiDateDisplay('22222222-2222-4222-8222-222222222222');
    recordUf('OBS-SI-DATE-ISO', dateSurface.displayClean ? 'PASS' : 'FAIL', {
      summary: `periodsIsoLeak=${dateSurface.periodsScan.hasIsoLeak} cardIsoLeak=${dateSurface.cardScan.hasIsoLeak} viP=${dateSurface.periodsScan.hasViDate} viC=${dateSurface.cardScan.hasViDate} periodsVisible=${dateSurface.periodsVisible} (stopped enrollment after prior stop/F5)`,
      employeeId: '22222222-2222-4222-8222-222222222222',
      source: 'post_prior_uat_stop_periods',
      ...dateSurface,
    });
    if (!dateSurface.displayClean) {
      results.residuals.push({
        id: 'OBS-SI-DATE-ISO',
        severity: 'P2',
        note: `periodsIso=${dateSurface.periodsScan.hasIsoLeak} cardIso=${dateSurface.cardScan.hasIsoLeak}`,
      });
    }

    if (!insuranceId) {
      recordUf('D5_BODY_COMPANY_ID', 'FAIL', {
        summary: 'blocked — no actionable enrollment after FE create (dates/create)',
        feCreateAttempts: d5.feCreateAttempts,
        ensured,
      });
    } else {
      await openInsuranceTab(page, insuranceEmpId);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      // Click insurance group tab if present
      const group = page.locator('[data-testid="profile-group-tab-insurance"]').first();
      if ((await group.count()) > 0) {
        await group.click().catch(() => {});
        await sleep(1500);
      }
      await shot(page, '05-si-before-action');

      d5.enrollmentsRoot =
        (await page.locator('[data-testid="hdsd-insurance-enrollments-root"]').count()) > 0;
      d5.timelineRoot =
        (await page.locator('[data-testid="hdsd-insurance-timeline-root"]').count()) > 0;
      d5.actionBtnCount = await page.locator('[data-testid^="hdsd-insurance-action-"]').count();

      const enrollRoot = page.locator('[data-testid="hdsd-insurance-enrollments-root"]').first();
      const cardText =
        (await enrollRoot.count()) > 0
          ? (await enrollRoot.textContent()) || ''
          : (await page.locator('body').textContent()) || '';
      d5.cardScanBefore = scanDates(cardText);

      const actionOrder = ['stop', 'suspend', 'close', 'resume', 'change_rate'];
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
          d5.actionTestId = await target.getAttribute('data-testid');
          // sync id from testid if create reused another row
          const tid = d5.actionTestId || '';
          const m = tid.match(/hdsd-insurance-action-[^-]+-(.+)$/);
          if (m?.[1]) {
            insuranceId = m[1];
            d5.insuranceId = insuranceId;
          }
          break;
        }
      }
      if (!clicked) {
        const lab = page
          .locator('button')
          .filter({ hasText: /Ngừng|Tạm hoãn|Đóng|Tiếp tục|Đổi mức/i })
          .first();
        if ((await lab.count()) > 0) {
          clicked = ((await lab.textContent()) || '').trim();
          await lab.click();
        }
      }
      d5.clickedAction = clicked;
      await sleep(800);
      await shot(page, '06-si-action-dialog');

      if (clicked) {
        if (String(clicked).includes('suspend') || clicked === 'suspend') {
          const reason = page.locator('[role="dialog"] textarea').first();
          if ((await reason.count()) > 0) await reason.fill(`QA soft-obs ${STAMP}`);
        }
        const submit = page.locator('[data-testid="hdsd-insurance-action-submit"]').first();
        if ((await submit.count()) > 0) {
          await submit.click();
          await sleep(3000);
          d5.postStatus = results.lastSiAction?.status ?? null;
          d5.postCode = results.lastSiAction?.code ?? null;
          d5.requestBody = results.lastSiAction?.requestBody ?? null;
          d5.bodyCompanyId = results.lastSiAction?.bodyCompanyId ?? null;
          d5.bodyHasCompanyId = results.lastSiAction?.bodyHasCompanyId === true;
          d5.wireEffectiveFrom = results.lastSiAction?.wireEffectiveFrom ?? null;
          await shot(page, '07-si-after-post');

          await openInsuranceTab(page, insuranceEmpId);
          await sleep(2500);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(2500);
          await shot(page, '08-si-f5-periods');

          const periods = page.locator('[data-testid="hdsd-insurance-periods-list"]');
          d5.periodsVisible = (await periods.count()) > 0;
          const periodsText =
            d5.periodsVisible
              ? (await periods.first().textContent()) || ''
              : (await page
                    .locator('[data-testid="hdsd-insurance-timeline-root"]')
                    .textContent()
                    .catch(() => '')) || '';
          d5.periodsScan = scanDates(periodsText);

          const enrollAfter = page.locator('[data-testid="hdsd-insurance-enrollments-root"]').first();
          const cardAfter =
            (await enrollAfter.count()) > 0
              ? (await enrollAfter.textContent()) || ''
              : (await page.locator('body').textContent()) || '';
          d5.cardScan = scanDates(cardAfter);

          const displayClean =
            d5.periodsScan &&
            d5.cardScan &&
            d5.periodsScan.hasIsoLeak === false &&
            d5.cardScan.hasIsoLeak === false &&
            (d5.periodsScan.hasViDate === true || d5.cardScan.hasViDate === true);

          const d5BodyOk =
            d5.bodyHasCompanyId === true && d5.postStatus >= 200 && d5.postStatus < 300;
          const wireOk =
            !d5.wireEffectiveFrom || /^\d{4}-\d{2}-\d{2}$/.test(String(d5.wireEffectiveFrom));

          recordUf('D5_BODY_COMPANY_ID', d5BodyOk ? 'PASS' : 'FAIL', {
            summary: `post=${d5.postStatus} bodyHasCompanyId=${d5.bodyHasCompanyId} company_id=${d5.bodyCompanyId} wire=${d5.wireEffectiveFrom}`,
            bodyHasCompanyId: d5.bodyHasCompanyId,
            bodyCompanyId: d5.bodyCompanyId,
            requestBody: d5.requestBody,
            postStatus: d5.postStatus,
            postCode: d5.postCode,
            wireEffectiveFrom: d5.wireEffectiveFrom,
            wireYyyyMmDd: wireOk,
            postActionDisplayClean: displayClean,
          });
          // Reinforce OBS-SI after this wave's stop if display regresses
          if (!displayClean) {
            results.residuals.push({
              id: 'OBS-SI-DATE-ISO',
              severity: 'P2',
              note: `post-action periodsIso=${d5.periodsScan?.hasIsoLeak} cardIso=${d5.cardScan?.hasIsoLeak}`,
            });
            recordUf('OBS-SI-DATE-ISO', 'FAIL', {
              summary: `post-action regress periodsIsoLeak=${d5.periodsScan?.hasIsoLeak} cardIsoLeak=${d5.cardScan?.hasIsoLeak}`,
              ...d5,
              displayClean,
            });
          }
        } else {
          recordUf('D5_BODY_COMPANY_ID', 'FAIL', { summary: 'submit missing', ...d5 });
        }
      } else {
        recordUf('D5_BODY_COMPANY_ID', 'FAIL', {
          summary: `no SI action buttons enrollRoot=${d5.enrollmentsRoot} actionBtnCount=${d5.actionBtnCount}`,
          ...d5,
        });
      }
    }

    // J03 — explicitly not reopened (spot note only)
    recordUf('J03_NOT_REOPENED', 'PASS', {
      summary: 'R-J03-DIALOG sealed — soft-obs wave did not touch contracts Eye/dialog paths',
      note: 'out_of_scope_soft_obs',
    });

    // Honesty lock
    recordUf('HONESTY_PERSONNEL_FLAG', 'PASS', {
      summary: 'hrm_personnel_uat_ready remains false — QA does not invent; handoff QC for clean GO',
      hrm_personnel_uat_ready: false,
    });

    const required = [
      'OBS-D1-HINT',
      'OBS-D1-HINT-HRD03-ABSENT',
      'OBS-SI-DATE-ISO',
      'D5_BODY_COMPANY_ID',
      'D1_NEO_SEALED',
    ];
    const allPass = required.every((k) => results.uf[k]?.verdict === 'PASS');
    const processOk = results.pageErrors.length === 0;
    results.processOk = processOk;
    results.overall = allPass && processOk ? 'PASS' : 'FAIL';
    results.endedAt = ts();
    save();
    console.log(`\n=== OVERALL ${results.overall} stamp=${STAMP} ===`);
    console.log(`JSON: ${OUT_JSON}`);
    await browser.close();
    process.exit(allPass && processOk ? 0 : 1);
  } catch (e) {
    results.overall = 'FAIL';
    results.fatal = String(e).slice(0, 400);
    results.endedAt = ts();
    save();
    console.error(e);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main();
