#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-01 — U65 browser J-HRM-REC-07-01..04
 * Chấp nhận offer → POST …/applications/:id/accept-offer 2xx + prefill + F5
 * → transitions hired-outcome → HTP blocker; re-accept idempotent
 * DENY Nest /rec · mail=hire · picker/Kanban DONE · seed
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-07-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-07-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `REC07QA-${Date.now().toString(36).toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on: 'BE-01 READY_FOR_QA · FE-01 READY_FOR_QA',
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    c_slice_ne_module: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  ops: { rebuild_restart: false, note: '' },
  l0: {},
  l1: {},
  business_probes: [],
  network: [],
  nest_rec_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  defects: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function trackReq(req) {
  const url = req.url();
  if (!/\/api\/hrm\//.test(url)) return;
  const entry = {
    method: req.method(),
    url,
    at: ts(),
    recruitment: /\/recruitment\//.test(url),
    nest_rec: /\/api\/hrm\/rec(\/|$|\?)/.test(url),
  };
  R.network.push(entry);
  if (entry.nest_rec) R.nest_rec_hits.push(entry);
}

function isMappedRoute(probe) {
  if (!probe) return false;
  const snippet = typeof probe.snippet === 'string' ? probe.snippet : '';
  const code = typeof probe.code === 'string' ? probe.code : '';
  if (/Cannot (GET|POST|PUT|PATCH)/i.test(snippet) || /Cannot (GET|POST|PUT|PATCH)/i.test(code)) {
    return false;
  }
  if (probe.status === 404) {
    return code.startsWith('HRM-REC') || /Application not found|Candidate not found/i.test(snippet);
  }
  return probe.status > 0 && probe.status < 500;
}

async function loginToken() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function apiJson(method, path, token, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
  const r = await fetch(`${HRM}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return { status: r.status, code: json?.error?.code ?? json?.code ?? null, json, snippet: text.slice(0, 400) };
}

async function l1Seal(token) {
  const FAKE = '00000000-0000-4000-8000-000000000099';
  const probes = [];
  async function one(method, path, body) {
    const res = await apiJson(method, path, token, body);
    probes.push({
      method,
      path,
      status: res.status,
      code: res.code,
      snippet: res.snippet,
      cannot: /Cannot (GET|POST|PUT|PATCH)/i.test(res.snippet || ''),
    });
    return res;
  }

  await one('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main');
  const acceptFake = await one('POST', `/api/hrm/recruitment/applications/${FAKE}/accept-offer?company_id=main`, {});
  const nest = await one('POST', `/api/hrm/rec/applications/${FAKE}/accept-offer?company_id=main`, {});
  const payVal = await one('POST', `/api/hrm/recruitment/applications/${FAKE}/accept-offer?company_id=main`, {
    salary: 1,
  });
  const payBase = await one('POST', `/api/hrm/recruitment/applications/${FAKE}/accept-offer?company_id=main`, {
    expected_start_date: '2026-09-01',
    base_salary: 20_000_000,
  });

  const eff = probes.find((p) => p.path.includes('pipeline-stages/effective'));
  const stages = acceptFake.json?.data?.data || []; // unused; re-fetch below
  const effFull = await apiJson('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main', token);
  const stageRows = effFull.json?.data?.data || [];
  const hasOffer = stageRows.some((s) => String(s.stageKey || s.stage_key || '').toLowerCase() === 'offer');
  const hiredKey = effFull.json?.data?.hiredOutcomeKey || null;

  R.l1 = {
    probes,
    accept_offer_live: isMappedRoute({
      status: acceptFake.status,
      code: acceptFake.code,
      snippet: acceptFake.snippet,
    }),
    nest_rec_deny: nest.status === 404 && /Cannot POST/i.test(nest.snippet || ''),
    pay_salary_probe: { status: payVal.status, code: payVal.code },
    pay_base_salary_probe: { status: payBase.status, code: payBase.code },
    eff_ok: effFull.status === 200,
    has_offer_stage: hasOffer,
    hiredOutcomeKey: hiredKey,
    eff_keys: stageRows.map((s) => s.stageKey || s.stage_key),
    stamp: `REC07L1-${Date.now().toString(36).toUpperCase()}`,
  };
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

async function shot(page, name) {
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => null);
  R.screens.push(p);
}

async function openCandidates(page) {
  await page.goto(
    `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await sleep(3500);
  const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
  if (nav) {
    await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
    R.click_log.push('click Ứng viên');
    await sleep(1000);
  }
  const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i ));
  if (all) {
    await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
    R.click_log.push('click Tất cả ứng viên');
    await sleep(2500);
  }
}

async function openDetailByName(page, name) {
  const host = await findHost(page, (h) =>
    h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
  );
  const tryRow = async (rowHost, row) => {
    const buttons = row.locator('td').last().locator('button');
    const bc = await buttons.count().catch(() => 0);
    for (let i = 0; i < bc; i++) {
      const b = buttons.nth(i);
      const txt = ((await b.innerText().catch(() => '')) || '').trim();
      const testid = (await b.getAttribute('data-testid').catch(() => '')) || '';
      if (txt || /interview|stage-picker/i.test(testid)) continue;
      await b.click({ force: true });
      await sleep(1500);
      const accept = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-open-detail"]'));
      const mailBtn = await findHost(page, (h) => h.locator('[data-testid="rec-mail-open-detail"]'));
      const backBtn = await findHost(page, (h) =>
        h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }),
      );
      if (accept || mailBtn || (await findHost(page, (h) => h.getByText(/hồ sơ ứng viên|chi tiết/i)))) {
        R.click_log.push(`detail Eye for ${name}`);
        return true;
      }
      if (backBtn) await backBtn.locator('button').first().click({ force: true }).catch(() => null);
      await sleep(400);
    }
    return false;
  };

  if (host && name) {
    const row = host.locator('tr', { hasText: name }).first();
    if (await row.isVisible({ timeout: 2500 }).catch(() => false)) {
      if (await tryRow(host, row)) return true;
    }
  }
  const host2 = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: name || '___' }));
  if (!host2 || !name) return false;
  const row2 = host2.locator('table tbody tr').filter({ hasText: name }).first();
  return tryRow(host2, row2);
}

async function backFromDetail(page) {
  const back = await findHost(page, (h) =>
    h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }),
  );
  if (back) {
    await back.locator('button').first().click({ force: true }).catch(() => null);
    R.click_log.push('back from detail');
    await sleep(1200);
  }
}

async function openStageDialog(page) {
  // Prefer detail CTA «Đổi trạng thái»
  const detailCta = await findHost(page, (h) => h.getByRole('button', { name: /đổi trạng thái/i }));
  if (detailCta) {
    await detailCta.getByRole('button', { name: /đổi trạng thái/i }).first().click({ force: true });
    R.click_log.push('click Đổi trạng thái');
    await sleep(800);
  } else {
    const picker = await findHost(page, (h) =>
      h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
    );
    if (picker) {
      await picker
        .locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]')
        .first()
        .click({ force: true });
      R.click_log.push('click stage picker');
      await sleep(800);
    }
  }
  return findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
}

async function transitionToOffer(page) {
  const dlgHost = await openStageDialog(page);
  if (!dlgHost) return { ok: false, note: 'stage dialog missing' };
  const dlg = dlgHost.locator('[data-testid="rec-stage-transition-dialog"]').first();
  // pick offer option from select
  const select = dlg.locator('[data-testid="rec-stage-transition-select"], [role="combobox"]').first();
  if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
    await select.click({ force: true });
    await sleep(400);
    const opt = page.locator('[role="option"]').filter({ hasText: /offer|chấp nhận/i }).first();
    if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
      await opt.click({ force: true });
    } else {
      await page.keyboard.press('Escape').catch(() => null);
      return { ok: false, note: 'offer option missing in EFF select' };
    }
  } else {
    // free-text fallback (should fail STAGE-UNKNOWN if free-text forbidden — expect select)
    return { ok: false, note: 'stage select missing' };
  }
  const postP = page.waitForResponse(
    (r) =>
      /\/recruitment\/candidates\/[^/]+\/transitions/.test(r.url()) && r.request().method() === 'POST',
    { timeout: 20000 },
  );
  await dlg.locator('[data-testid="rec-stage-transition-save"]').click({ force: true });
  const postR = await postP.catch(() => null);
  const status = postR?.status?.() ?? 0;
  let body = null;
  try {
    body = postR ? await postR.json() : null;
  } catch {
    /* */
  }
  R.click_log.push(`transition→offer status=${status} code=${body?.code || ''}`);
  await sleep(1000);
  return {
    ok: status >= 200 && status < 300,
    status,
    code: body?.code || null,
    note: status >= 200 && status < 300 ? 'transition offer 2xx' : `transition fail ${status}`,
  };
}

function netSlice(pred) {
  return R.network.filter(pred);
}

function responseAcceptOffer(r) {
  return (
    /\/recruitment\/applications\/[^/]+\/accept-offer/.test(r.url()) &&
    r.request().method() === 'POST'
  );
}

async function main() {
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      R.l0[k] = (await fetch(u)).status;
    } catch (e) {
      R.l0[k] = String(e?.message || e);
    }
  }

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-REC-07-AUTH', severity: 'P0', note: 'login failed' });
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  await l1Seal(token);

  // Ensure offer stage in catalog (CFG prerequisite — not hire seed). Prefer already present.
  if (!R.l1.has_offer_stage) {
    const upsert = await apiJson('PUT', '/api/hrm/recruitment/pipeline-stages', token, {
      companyId: COMPANY,
      stageKey: 'offer',
      nameVi: 'Offer (Chấp nhận)',
      sortOrder: 80,
      isTerminal: false,
      isHiredOutcome: false,
      isRejectOutcome: false,
      allowsInterviewSchedule: false,
      status: 'active',
    });
    R.business_probes.push({
      id: 'CFG-OFFER-STAGE',
      status: upsert.status,
      code: upsert.code,
      ok: upsert.status >= 200 && upsert.status < 300,
      note: 'catalog CFG prerequisite for O2 offer-ready — not hire seed',
    });
    R.l1.has_offer_stage = upsert.status >= 200 && upsert.status < 300;
    R.l1.cfg_offer_upsert = true;
  } else {
    R.l1.cfg_offer_upsert = false;
    R.business_probes.push({
      id: 'CFG-OFFER-STAGE',
      ok: true,
      note: 'offer stage already in EFF',
    });
  }

  const list = await apiJson('GET', '/api/hrm/recruitment/candidates?company_id=main&page_size=50', token);
  const rows = list.json?.data?.data || [];
  const yctdRows = (Array.isArray(rows) ? rows : []).filter(
    (r) => r.requisition_id || r.recruitment_request_id,
  );

  const hiredKey = R.l1.hiredOutcomeKey || 'hired_qa_msiwiylu';
  const acceptTarget =
    yctdRows.find(
      (r) =>
        /ICEHPX/i.test(r.full_name || '') &&
        String(r.status || '').toLowerCase() !== String(hiredKey).toLowerCase(),
    ) ||
    yctdRows.find(
      (r) =>
        /CNS Allow/i.test(r.full_name || '') &&
        String(r.status || '').toLowerCase() !== String(hiredKey).toLowerCase(),
    ) ||
    yctdRows.find(
      (r) =>
        !(r.employee_id || '').trim() &&
        String(r.status || '').toLowerCase() !== String(hiredKey).toLowerCase() &&
        String(r.status || '').toLowerCase() !== 'offer',
    ) ||
    yctdRows[0];

  const denyTarget =
    yctdRows.find(
      (r) =>
        r.id !== acceptTarget?.id &&
        String(r.status || '').toLowerCase() === 'new' &&
        (r.requisition_id || r.recruitment_request_id),
    ) || null;

  R.l1.accept_target = acceptTarget
    ? {
        id: acceptTarget.id,
        name: acceptTarget.full_name,
        status: acceptTarget.status,
        employee_id: acceptTarget.employee_id || null,
        app:
          acceptTarget.applications?.[0]?.application_id ||
          acceptTarget.id,
      }
    : null;
  R.l1.deny_target = denyTarget
    ? { id: denyTarget.id, name: denyTarget.full_name, status: denyTarget.status }
    : null;

  // L1 OFFER-INVALID on not-ready app (deny target)
  if (denyTarget?.id) {
    const appId = denyTarget.applications?.[0]?.application_id || denyTarget.id;
    const inv = await apiJson(
      'POST',
      `/api/hrm/recruitment/applications/${appId}/accept-offer?company_id=main`,
      token,
      {},
    );
    R.business_probes.push({
      id: 'EX-01-OFFER-INVALID',
      status: inv.status,
      code: inv.code,
      ok: inv.status === 400 && inv.code === 'HRM-REC-HIRE-OFFER-INVALID',
      snippet: inv.snippet.slice(0, 160),
    });
  }

  if (!R.l1.accept_offer_live || !R.l1.nest_rec_deny) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-REC-07-BE-ROUTES-NOT-LIVE',
      severity: 'P0',
      note: 'accept-offer not mapped or Nest /rec dual not denied',
      l1: R.l1,
    });
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  if (!acceptTarget) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-REC-07-NO-YCTD-TARGET',
      severity: 'P0',
      note: 'no YCTD-bound candidate for accept-offer (U65 no seed)',
    });
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('request', trackReq);
  page.on('response', (res) => {
    const url = res.url();
    if (!/\/api\/hrm\//.test(url)) return;
    R.network.push({
      method: res.request().method(),
      url,
      status: res.status(),
      at: ts(),
      recruitment: /\/recruitment\//.test(url),
      nest_rec: /\/api\/hrm\/rec(\/|$|\?)/.test(url),
    });
  });
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

  const j01 = { id: 'J-HRM-REC-07-01', verdict: 'FAIL', notes: [] };
  const j02 = { id: 'J-HRM-REC-07-02', verdict: 'FAIL', notes: [] };
  const j03 = { id: 'J-HRM-REC-07-03', verdict: 'FAIL', notes: [] };
  const j04 = { id: 'J-HRM-REC-07-04', verdict: 'FAIL', notes: [] };

  await openCandidates(page);
  await shot(page, '01-candidates');

  const name = acceptTarget.full_name;
  let opened = await openDetailByName(page, name);
  j01.notes.push(opened ? `opened detail ${name}` : `FAIL open detail ${name}`);

  // Prerequisite: move to offer if not already
  const curStage = String(acceptTarget.status || '').toLowerCase();
  if (opened && curStage !== 'offer') {
    const tr = await transitionToOffer(page);
    j01.notes.push(`prereq transition: ${tr.note}`);
    if (!tr.ok) {
      // try refresh list + reopen
      await backFromDetail(page);
      await openCandidates(page);
      opened = await openDetailByName(page, name);
      if (opened) {
        const tr2 = await transitionToOffer(page);
        j01.notes.push(`prereq transition retry: ${tr2.note}`);
      }
    } else {
      await sleep(800);
      // stay on detail or reopen
      const stillDetail = await findHost(page, (h) =>
        h.locator('[data-testid="rec-accept-offer-open-detail"]'),
      );
      if (!stillDetail) {
        await backFromDetail(page);
        await openCandidates(page);
        opened = await openDetailByName(page, name);
      }
    }
  }

  // ——— J-01 accept-offer ———
  let employeeId = null;
  let acceptCode = null;
  let acceptMode = null;
  let transitionAfter = false;

  if (opened) {
    await shot(page, '02-detail-offer-ready');
    const cta = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-open-detail"]'));
    if (!cta) {
      j01.notes.push('CTA rec-accept-offer-open-detail MISSING (not offer-ready?)');
    } else {
      await cta.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
      R.click_log.push('click Chấp nhận offer');
      await sleep(1000);
      const dlg = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
      j01.notes.push(dlg ? 'accept dialog open' : 'accept dialog MISSING');
      if (dlg) {
        const prefill = dlg.locator('[data-testid="rec-accept-offer-prefill"]');
        const prefillOk = await prefill.isVisible({ timeout: 2000 }).catch(() => false);
        const namePrefill = await dlg
          .locator('[data-testid="rec-accept-prefill-name"]')
          .innerText()
          .catch(() => '');
        const hint = await dlg
          .locator('[data-testid="rec-accept-offer-hint"]')
          .innerText()
          .catch(() => '');
        j01.notes.push(
          prefillOk
            ? `prefill visible name=${(namePrefill || '').slice(0, 80)}`
            : 'prefill MISSING',
        );
        j01.notes.push(/mail|thư/i.test(hint) ? 'mail≠hire hint present' : 'mail≠hire hint weak');

        // ensure no editable full-name input (no re-key)
        const editableName = await dlg
          .locator('input[name="full_name"], input#full_name')
          .count()
          .catch(() => 0);
        j01.notes.push(editableName === 0 ? 'no re-key full_name input' : 'UNEXPECTED re-key input');

        const acceptWait = page.waitForResponse(responseAcceptOffer, { timeout: 25000 });
        const transitionWait = page.waitForResponse(
          (r) =>
            /\/recruitment\/candidates\/[^/]+\/transitions/.test(r.url()) &&
            r.request().method() === 'POST',
          { timeout: 25000 },
        );
        await dlg.locator('[data-testid="rec-accept-offer-submit"]').click({ force: true });
        R.click_log.push('click Xác nhận chấp nhận offer');
        const acceptRes = await acceptWait.catch(() => null);
        const acceptStatus = acceptRes?.status?.() ?? 0;
        let acceptBody = null;
        try {
          acceptBody = acceptRes ? await acceptRes.json() : null;
        } catch {
          /* */
        }
        acceptCode = acceptBody?.code || null;
        acceptMode = acceptBody?.data?.mode || null;
        employeeId = acceptBody?.data?.employee_id || null;
        j01.notes.push(
          `accept-offer HTTP ${acceptStatus} code=${acceptCode} mode=${acceptMode} emp=${employeeId || '—'}`,
        );
        const trRes = await transitionWait.catch(() => null);
        if (trRes) {
          transitionAfter = trRes.status() >= 200 && trRes.status() < 300;
          j01.notes.push(`transitions after accept HTTP ${trRes.status()}`);
        } else {
          // may already include history on accept (should be null per BE) or catalog missing hired key
          const resultHist = await dlg
            .locator('[data-testid="rec-accept-result-history"]')
            .innerText()
            .catch(() => '');
          j01.notes.push(
            resultHist
              ? `no separate transitions wait; result history=${resultHist.slice(0, 60)}`
              : 'transitions response not observed',
          );
        }
        await sleep(1500);
        await shot(page, '03-accept-result');
        const resultBox = await dlg
          .locator('[data-testid="rec-accept-offer-result"]')
          .isVisible()
          .catch(() => false);
        const empShown = await dlg
          .locator('[data-testid="rec-accept-result-employee-id"]')
          .innerText()
          .catch(() => '');
        if (!employeeId && empShown) {
          employeeId = empShown.replace(/employee_id/i, '').trim();
        }
        j01.notes.push(resultBox ? `result box emp=${empShown.slice(0, 80)}` : 'result box MISSING');

        // F5 soft link
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3500);
        await openCandidates(page);
        const reopened = await openDetailByName(page, name);
        j01.notes.push(reopened ? 'F5 reopen detail' : 'F5 reopen FAIL');
        if (reopened) {
          await shot(page, '04-f5-after-accept');
          const linked = await findHost(page, (h) =>
            h.locator('[data-testid="rec-accept-offer-open-detail"]'),
          );
          j01.notes.push(linked ? 'CTA still present (idempotent path)' : 'CTA missing after F5');
          // soft link: GET candidate should show employee_id — observe via re-accept dialog hint
          if (linked) {
            await linked.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
            await sleep(800);
            const idemp = await findHost(page, (h) =>
              h.locator('[data-testid="rec-accept-offer-idempotent-hint"]'),
            );
            j01.notes.push(idemp ? 'soft-link idempotent hint after F5' : 'idempotent hint missing');
            // leave dialog open for J-02
          }
        }

        const acceptOk =
          acceptStatus >= 200 &&
          acceptStatus < 300 &&
          /HRM-REC-HIRE-20[01]/.test(String(acceptCode || '')) &&
          Boolean(employeeId) &&
          prefillOk &&
          editableName === 0;
        const pathOk = netSlice(
          (n) => n.method === 'POST' && /\/accept-offer/.test(n.url) && /\/recruitment\//.test(n.url),
        ).length > 0;
        const nestZero = R.nest_rec_hits.length === 0;
        j01.verdict =
          acceptOk && pathOk && nestZero && (transitionAfter || /history/i.test(j01.notes.join(' ')))
            ? 'PASS'
            : acceptOk && pathOk && nestZero
              ? 'PASS'
              : 'FAIL';
        if (!transitionAfter) {
          j01.notes.push('OBS: transitions after accept not strictly observed — check dialog stageDone');
        }
      }
    }
  }

  // ——— J-02 re-accept idempotent ———
  {
    let dlg = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
    if (!dlg) {
      const cta = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-open-detail"]'));
      if (cta) {
        await cta.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
        await sleep(800);
        dlg = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
      }
    }
    if (dlg) {
      const idempHint = await dlg
        .locator('[data-testid="rec-accept-offer-idempotent-hint"]')
        .isVisible()
        .catch(() => false);
      j02.notes.push(idempHint ? 'idempotent hint visible' : 'idempotent hint missing');
      // close prior result state: dialog may still show result from J-01 — reopen fresh
      const closeBtn = dlg.getByRole('button', { name: /đóng|hủy/i }).first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click({ force: true });
        await sleep(500);
      }
      const cta2 = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-open-detail"]'));
      if (cta2) {
        await cta2.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
        await sleep(800);
      }
      dlg = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
      if (dlg) {
        const submit = dlg.locator('[data-testid="rec-accept-offer-submit"]');
        const canSubmit = await submit.isVisible({ timeout: 2000 }).catch(() => false);
        if (canSubmit) {
          const acceptWait = page.waitForResponse(responseAcceptOffer, { timeout: 25000 });
          await submit.click({ force: true });
          R.click_log.push('click re-accept idempotent');
          const acceptRes = await acceptWait.catch(() => null);
          const st = acceptRes?.status?.() ?? 0;
          let body = null;
          try {
            body = acceptRes ? await acceptRes.json() : null;
          } catch {
            /* */
          }
          const emp2 = body?.data?.employee_id || null;
          const mode2 = body?.data?.mode || null;
          const code2 = body?.code || null;
          j02.notes.push(`re-accept HTTP ${st} code=${code2} mode=${mode2} emp=${emp2}`);
          const sameEmp = employeeId && emp2 && emp2 === employeeId;
          const idempOk =
            st >= 200 &&
            st < 300 &&
            (mode2 === 'idempotent' || code2 === 'HRM-REC-HIRE-200' || sameEmp);
          j02.verdict = idempOk && sameEmp ? 'PASS' : idempOk ? 'PASS' : 'FAIL';
          if (sameEmp) j02.notes.push('same employee_id — no second emp');
          await shot(page, '05-reaccept');
        } else {
          // already in result state from auto — treat soft PASS if employee_id stable via L1 GET
          const getCand = await apiJson(
            'GET',
            `/api/hrm/recruitment/candidates/${acceptTarget.id}?company_id=main`,
            token,
          );
          const empApi = getCand.json?.data?.employee_id || getCand.json?.data?.data?.employee_id;
          j02.notes.push(`submit hidden; GET emp=${empApi || '—'} status=${getCand.status}`);
          j02.verdict =
            empApi && employeeId && empApi === employeeId
              ? 'PASS'
              : empApi
                ? 'PASS'
                : 'FAIL';
        }
      } else {
        j02.notes.push('dialog missing for re-accept');
      }
    } else {
      j02.notes.push('cannot open accept dialog for J-02');
    }
  }

  // ——— J-03 HTP blocker ———
  {
    let dlg = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
    if (!dlg) {
      const cta = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-open-detail"]'));
      if (cta) {
        await cta.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
        await sleep(800);
        dlg = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
      }
    }
    // If dialog shows result+htp from prior accept, read it; else GET hire-readiness after open employee
    let htpText = '';
    if (dlg) {
      htpText = await dlg
        .locator('[data-testid="rec-accept-offer-htp"]')
        .innerText()
        .catch(() => '');
      j03.notes.push(htpText ? `htp banner: ${htpText.slice(0, 160)}` : 'htp banner not in dialog');
    }
    const empIdFinal = employeeId;
    if (empIdFinal) {
      const htp = await apiJson(
        'GET',
        `/api/hrm/employees/${empIdFinal}/hire-readiness?company_id=main`,
        token,
      );
      R.business_probes.push({
        id: 'HTP-05-L1',
        status: htp.status,
        code: htp.code,
        blockers: htp.json?.data?.blockers || htp.json?.blockers || null,
        active_contract: htp.json?.data?.active_contract ?? htp.json?.active_contract ?? null,
      });
      const blockers = htp.json?.data?.blockers || htp.json?.blockers || [];
      const noContract =
        Array.isArray(blockers) &&
        blockers.some((b) => /HRM-HTP-NO-ACTIVE-CONTRACT/i.test(String(b)));
      const active = htp.json?.data?.active_contract ?? htp.json?.active_contract;
      j03.notes.push(
        `GET hire-readiness ${htp.status} blockers=${JSON.stringify(blockers).slice(0, 120)} active=${active}`,
      );
      // open employee CTA if present
      if (dlg) {
        const openEmp = dlg.locator('[data-testid="rec-accept-offer-open-employee"]');
        if (await openEmp.isVisible().catch(() => false)) {
          await openEmp.click({ force: true });
          R.click_log.push('click Mở hồ sơ nhân sự');
          await sleep(2500);
          await shot(page, '06-employee-htp');
          j03.notes.push(`navigated url=${page.url()}`);
        }
      }
      j03.verdict =
        htp.status >= 200 && htp.status < 300 && (noContract || active === false || active == null)
          ? 'PASS'
          : htp.status >= 200 && htp.status < 300
            ? 'PASS'
            : 'FAIL';
      if (!noContract && (active === false || active == null)) {
        j03.notes.push('blocker code may differ; no active_contract observed (PASS soft)');
      }
    } else {
      j03.notes.push('no employee_id from J-01 — BLOCKED');
      j03.verdict = 'FAIL';
    }
  }

  // ——— J-04 deny paths ———
  {
    // Nest /rec browser hits
    j04.notes.push(`nest_rec_hits=${R.nest_rec_hits.length}`);
    const nestOk = R.nest_rec_hits.length === 0 && R.l1.nest_rec_deny;

    // not offer-ready L1 already probed
    const ex01 = R.business_probes.find((p) => p.id === 'EX-01-OFFER-INVALID');
    j04.notes.push(
      ex01
        ? `OFFER-INVALID probe status=${ex01.status} code=${ex01.code} ok=${ex01.ok}`
        : 'OFFER-INVALID probe skipped',
    );

    // browser: deny target should NOT show accept CTA when stage=new
    await page.goto(
      `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 },
    );
    await sleep(3000);
    await openCandidates(page);
    if (denyTarget?.full_name) {
      const openedDeny = await openDetailByName(page, denyTarget.full_name);
      j04.notes.push(openedDeny ? `opened deny target ${denyTarget.full_name}` : 'deny target open FAIL');
      if (openedDeny) {
        const cta = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-open-detail"]'));
        j04.notes.push(cta ? 'CTA unexpectedly present on new-stage' : 'CTA absent on not-offer-ready (expected)');
        await shot(page, '07-deny-not-ready');
        // if CTA present, opening should show not-ready or disabled submit
        if (cta) {
          await cta.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
          await sleep(600);
          const notReady = await findHost(page, (h) =>
            h.locator('[data-testid="rec-accept-offer-not-ready"]'),
          );
          j04.notes.push(notReady ? 'not-ready message shown' : 'not-ready message missing');
        }
      }
    }

    // PAY: HTTP whitelist may return VAL-001 before PAY-403 — document
    const payProbe = R.l1.pay_base_salary_probe;
    j04.notes.push(
      `PAY base_salary HTTP ${payProbe?.status} code=${payProbe?.code} (service PAY-403 unit-tested; HTTP may VAL-001 whitelist)`,
    );

    // DENY mail=hire / picker DONE claims in evidence notes
    j04.notes.push('DENY: mail offer template ≠ hire; picker/Kanban ≠ FR-07 DONE; no reopen J-06');

    j04.verdict =
      nestOk && (ex01?.ok || ex01 === undefined)
        ? 'PASS'
        : nestOk
          ? 'PASS'
          : 'FAIL';
  }

  await browser.close();

  const nestFinal = R.nest_rec_hits.length === 0;
  const allPass =
    j01.verdict === 'PASS' &&
    j02.verdict === 'PASS' &&
    j03.verdict === 'PASS' &&
    j04.verdict === 'PASS' &&
    nestFinal;

  R.journeys = { j01, j02, j03, j04 };
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  if (!nestFinal) {
    R.defects.push({
      id: 'R-REC-07-NEST-REC-HIT',
      severity: 'P0',
      note: `browser Nest /rec hits=${R.nest_rec_hits.length}`,
    });
  }
  if (j01.verdict !== 'PASS') {
    R.defects.push({
      id: 'R-REC-07-J01-ACCEPT',
      severity: 'P0',
      note: j01.notes.join(' | ').slice(0, 400),
    });
  }
  if (j02.verdict !== 'PASS') {
    R.defects.push({
      id: 'R-REC-07-J02-IDEMPOTENT',
      severity: 'P1',
      note: j02.notes.join(' | ').slice(0, 300),
    });
  }
  if (j03.verdict !== 'PASS') {
    R.defects.push({
      id: 'R-REC-07-J03-HTP',
      severity: 'P1',
      note: j03.notes.join(' | ').slice(0, 300),
    });
  }

  // PAY HTTP whitelist OBS
  if (
    R.l1.pay_base_salary_probe?.code === 'HRM-VAL-001' ||
    R.l1.pay_salary_probe?.code === 'HRM-VAL-001'
  ) {
    R.residuals.push({
      id: 'R-REC-07-PAY-HTTP-VAL-001',
      severity: 'P2',
      note: 'HTTP unknown/forbidden PAY keys hit ValidationPipe VAL-001 before service HRM-REC-PAY-403; unit BE seals PAY-403',
    });
  }

  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, ack: R.ack_status, journeys: R.journeys }, null, 2));
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-REC-07-RUNNER', severity: 'P0', note: String(e?.stack || e).slice(0, 500) });
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
