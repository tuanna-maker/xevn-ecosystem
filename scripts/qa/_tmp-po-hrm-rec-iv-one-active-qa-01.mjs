#!/usr/bin/env node
/**
 * PO-HRM-REC-IV-ONE-ACTIVE-QA-01 — L1 API + U65 browser one-active slice
 * Persona: ceo@xe.vn · company_id=main · U65 zero-seed (mutate via production API path only)
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-01.json');
const SHOT = resolve(ROOT, 'docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01');
mkdirSync(SHOT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const result = {
  work_item_id: 'PO-HRM-REC-IV-ONE-ACTIVE-QA-01',
  startedAt: ts(),
  u65: 'zero-seed',
  persona: { email: EMAIL, companyId: COMPANY },
  recruitment_uat_ready: false,
  denied: ['recruitment_uat_ready', 'seed', 'module_uat'],
  l0: null,
  unit: {},
  api: {},
  browser: {},
  ac: {},
  clickPath: [],
  residuals: [],
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(result, null, 2));
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
  return { token, raw: data };
}

function hrmHeaders(token, companyId = COMPANY) {
  return {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'x-tenant-id': TENANT,
    'x-company-id': companyId,
  };
}

async function hrmFetch(path, token, opts = {}) {
  const url = `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const r = await fetch(url, { ...opts, headers: { ...hrmHeaders(token), ...(opts.headers || {}) } });
  const body = await r.json().catch(() => null);
  return { status: r.status, body, url };
}

async function findHostWith(page, locatorFn) {
  for (const host of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(host);
      if (await loc.first().isVisible({ timeout: 800 }).catch(() => false)) {
        return { host, loc: loc.first() };
      }
    } catch {
      /* continue */
    }
  }
  return null;
}

async function runApiPhase(token) {
  const api = {
    listCandidates: null,
    listCandidatesPool: null,
    conflict409: null,
    cancelThenCreate: null,
    scopeParity: null,
    ids: {},
  };

  const list = await hrmFetch(`/recruitment/candidates?company_id=${COMPANY}&page_size=50`, token);
  api.listCandidates = {
    status: list.status,
    total: list.body?.data?.total ?? list.body?.total,
    sampleFields: null,
    withActive: 0,
  };
  const rows = list.body?.data?.data ?? list.body?.data ?? [];
  const arr = Array.isArray(rows) ? rows : [];
  for (const row of arr) {
    const ai = row.active_interview;
    if (ai?.has_active_interview) api.listCandidates.withActive += 1;
  }
  if (arr[0]) {
    api.listCandidates.sampleFields = arr[0].active_interview ?? null;
  }

  const pool = await hrmFetch(`/recruitment/candidates-pool?company_id=${COMPANY}`, token);
  const poolRows = pool.body?.data?.data ?? pool.body?.data ?? [];
  const poolArr = Array.isArray(poolRows) ? poolRows : [];
  api.listCandidatesPool = {
    status: pool.status,
    total: pool.body?.data?.total ?? pool.body?.total ?? poolArr.length,
    firstHasActiveInterview: Boolean(poolArr[0]?.active_interview?.has_active_interview ?? poolArr[0]?.has_active_interview),
    firstKeys: poolArr[0] ? Object.keys(poolArr[0]).slice(0, 20) : [],
  };

  let target = arr.find((r) => r.active_interview?.has_active_interview);
  let createdForTest = false;

  async function ensureLaneACandidate() {
    if (arr.length > 0) return arr[0];
    const reqRes = await hrmFetch(`/recruitment/requisitions?company_id=${COMPANY}&page_size=20`, token);
    const reqs = reqRes.body?.data?.data ?? reqRes.body?.data ?? [];
    const reqList = Array.isArray(reqs) ? reqs : [];
    const req =
      reqList.find((r) => /approved|active|open|recruiting/i.test(String(r.status))) ?? reqList[0];
    if (!req?.id) {
      api.bootstrap = { pass: false, note: 'no requisition for Lane A candidate create' };
      return null;
    }
    const stamp = Date.now().toString(36).slice(-6).toUpperCase();
    const createCand = await hrmFetch('/recruitment/candidates', token, {
      method: 'POST',
      body: JSON.stringify({
        company_id: req.company_id || COMPANY,
        requisition_id: req.id,
        full_name: `QA OneActive ${stamp}`,
        email: `qa.oneactive.${stamp}@xe.vn`.toLowerCase(),
        source: 'qa-u65-probe',
      }),
    });
    api.bootstrap = {
      requisitionId: req.id,
      createStatus: createCand.status,
      createCode: createCand.body?.code,
      createMessage: createCand.body?.message ?? createCand.body?.error?.message,
      candidateId: createCand.body?.data?.id,
    };
    if (createCand.status !== 201 && createCand.status !== 200) return null;
    const row = createCand.body?.data;
    arr.push(row);
    api.listCandidates.total = (api.listCandidates.total ?? 0) + 1;
    return row;
  }

  if (!target) {
    const cand = await ensureLaneACandidate();
    if (cand) {
      const scheduledAt = new Date(Date.now() + 86400000).toISOString();
      const create1 = await hrmFetch('/recruitment/interviews', token, {
        method: 'POST',
        body: JSON.stringify({
          company_id: cand.company_id || COMPANY,
          candidate_id: cand.id,
          scheduled_at: scheduledAt,
          interviewer: 'QA One-Active Probe',
        }),
      });
      api.bootstrapCreate = { status: create1.status, code: create1.body?.code, id: create1.body?.data?.id };
      if (create1.status === 201 || create1.status === 200) {
        createdForTest = true;
        api.ids.interviewId = create1.body?.data?.id;
        api.ids.candidateId = cand.id;
        target = { ...cand, active_interview: { has_active_interview: true } };
      }
    }
  } else {
    api.ids.candidateId = target.id;
  }

  if (target) {
    const companyId = target.company_id || COMPANY;
    const scheduledAt2 = new Date(Date.now() + 172800000).toISOString();
    const dup = await hrmFetch('/recruitment/interviews', token, {
      method: 'POST',
      body: JSON.stringify({
        company_id: companyId,
        candidate_id: target.id,
        scheduled_at: scheduledAt2,
        interviewer: 'QA Duplicate Probe',
      }),
    });
    const err = dup.body?.error ?? dup.body;
    api.conflict409 = {
      status: dup.status,
      code: err?.code ?? dup.body?.code,
      message: err?.message ?? dup.body?.message,
      details: err?.details ?? dup.body?.details,
      pass:
        dup.status === 409 &&
        (err?.code === 'HRM-REC-IV-409-ACTIVE' || dup.body?.code === 'HRM-REC-IV-409-ACTIVE'),
    };

    const ivId = api.ids.interviewId;
    if (ivId) {
      const cancel = await hrmFetch(`/recruitment/interviews/${ivId}/status`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const create2 = await hrmFetch('/recruitment/interviews', token, {
        method: 'POST',
        body: JSON.stringify({
          company_id: companyId,
          candidate_id: target.id,
          scheduled_at: new Date(Date.now() + 259200000).toISOString(),
          interviewer: 'QA After Cancel',
        }),
      });
      api.cancelThenCreate = {
        cancelStatus: cancel.status,
        createStatus: create2.status,
        createCode: create2.body?.code,
        pass: cancel.status === 200 && (create2.status === 201 || create2.status === 200),
      };
      if (create2.body?.data?.id) api.ids.postCancelInterviewId = create2.body.data.id;

      const relist = await hrmFetch(`/recruitment/candidates?company_id=${COMPANY}&page_size=50`, token);
      const relistRows = relist.body?.data?.data ?? relist.body?.data ?? [];
      const hit = (Array.isArray(relistRows) ? relistRows : []).find((r) => r.id === target.id);
      api.listProjectionAfterMutate = hit?.active_interview ?? null;
      api.listProjectionFieldCheck = {
        pass: Boolean(
          hit?.active_interview?.has_active_interview &&
            hit.active_interview.active_interview_badge_label === 'Đã có lịch' &&
            typeof hit.active_interview.active_interview_display_time_vi_vn === 'string' &&
            /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(hit.active_interview.active_interview_display_time_vi_vn),
        ),
        fields: hit?.active_interview ?? null,
      };
    }
  } else {
    api.conflict409 = { pass: false, note: 'no candidate available for conflict probe' };
    api.cancelThenCreate = { pass: false, note: 'skipped — no candidate' };
  }

  if (api.ids.candidateId) {
    const getById = await hrmFetch(
      `/recruitment/candidates/${api.ids.candidateId}?company_id=${COMPANY}`,
      token,
    );
    api.scopeParity = {
      listHadRow: Boolean(arr.find((r) => r.id === api.ids.candidateId)),
      getStatus: getById.status,
      getHasActive: getById.body?.data?.active_interview?.has_active_interview ?? null,
      pass: getById.status === 200,
    };
  }

  api.createdForTest = createdForTest;
  result.api = api;
  save();
  return api;
}

async function runBrowserPhase(session) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const browserResult = {
    badgeVisible: false,
    badgeLabel: null,
    badgeTime: null,
    badgeTimePattern: null,
    conflictToast: null,
    f5BadgePersists: null,
    poolApiMissingProjection: null,
    pageErrors: 0,
    consoleErrors: 0,
    screenshots: [],
  };

  try {
    await page.addInitScript(
      (s) => {
        const payload = JSON.stringify({
          userId: s.email,
          email: s.email,
          displayName: 'Group CEO',
          roles: ['group_ceo'],
        });
        for (const store of [localStorage, sessionStorage]) {
          store.setItem('xevn.portal.accessToken', s.token);
          store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
          store.setItem('xevn.portal.user', payload);
          store.setItem('xevn.portal.tenantId', 'xevn');
          store.setItem('xevn.portal.companyId', s.companyId);
          store.setItem('hrm_portal_mode', '1');
          store.setItem('hrm_current_company_id', s.companyId);
        }
      },
      { token: session.token, email: EMAIL, companyId: COMPANY },
    );

    const recUrl = `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    result.clickPath.push('goto recruitment candidates tab');
    await sleep(4500);

    const nav = await findHostWith(page, (h) => h.locator('[data-testid="recruitment-nav-candidates"]'));
    if (nav) {
      await nav.loc.click({ force: true });
      result.clickPath.push('click recruitment-nav-candidates');
      await sleep(2000);
    }

    await page.screenshot({ path: join(SHOT, '01-candidates-list.png'), fullPage: false });
    browserResult.screenshots.push('docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01/01-candidates-list.png');

    const badgeHit = await findHostWith(page, (h) => h.locator('[data-testid="candidate-active-interview-badge"]'));
    if (badgeHit) {
      browserResult.badgeVisible = true;
      browserResult.badgeLabel = (await badgeHit.loc.innerText().catch(() => '')).trim();
      const timeHit = await findHostWith(page, (h) => h.locator('[data-testid="candidate-active-interview-time"]'));
      if (timeHit) {
        browserResult.badgeTime = (await timeHit.loc.innerText().catch(() => '')).trim();
        browserResult.badgeTimePattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(browserResult.badgeTime)
          ? 'vi-VN'
          : browserResult.badgeTime === '—'
            ? 'emdash'
            : 'other';
      }
    }

    browserResult.poolApiMissingProjection = result.api?.listCandidatesPool?.firstHasActiveInterview === false &&
      (result.api?.listCandidates?.withActive ?? 0) > 0;

    browserResult.pageErrors = pageErrors.length;
    browserResult.consoleErrors = consoleErrors.length;
  } finally {
    await browser.close();
  }

  result.browser = browserResult;
  save();
  return browserResult;
}

async function main() {
  try {
    const l0 = await fetch(`${HRM}/api/hrm/health`).then((r) => ({ hrm: r.status })).catch((e) => ({ hrm: 0, err: String(e) }));
    const portal = await fetch(`${PORTAL}/`).then((r) => r.status).catch(() => 0);
    result.l0 = { portal, ...l0, pass: l0.hrm === 200 && portal === 200 };

    const session = await loginApi();
    await runApiPhase(session.token);
    await runBrowserPhase(session);

    const ac = {};
    ac['AC-409-conflict'] = result.api.conflict409?.pass ? 'PASS' : 'FAIL';
    ac['AC-cancel-create'] = result.api.cancelThenCreate?.pass ? 'PASS' : 'FAIL';
    ac['AC-list-projection'] =
      result.api.listProjectionFieldCheck?.pass ||
      (result.api.listCandidates?.status === 200 && result.api.listProjectionAfterMutate?.has_active_interview)
        ? 'PASS'
        : result.api.bootstrapCreate?.status === 201 || result.api.bootstrapCreate?.status === 200
          ? result.api.listProjectionFieldCheck?.pass
            ? 'PASS'
            : 'FAIL'
          : 'FAIL';
    ac['AC-scope-parity'] = result.api.scopeParity?.pass ? 'PASS' : 'FAIL';
    ac['AC-fe-badge'] = result.browser.badgeVisible ? 'PASS' : 'FAIL';
    ac['AC-fe-pool-wire'] = result.browser.poolApiMissingProjection ? 'FAIL' : 'PASS';

    result.ac = ac;

    const apiPass =
      ac['AC-409-conflict'] === 'PASS' &&
      ac['AC-cancel-create'] === 'PASS' &&
      ac['AC-list-projection'] === 'PASS' &&
      ac['AC-scope-parity'] === 'PASS';

    const browserPass = ac['AC-fe-badge'] === 'PASS';

    if (!browserPass && result.browser.poolApiMissingProjection) {
      result.residuals.push({
        id: 'FE-POOL-ACTIVE-PROJECTION-WIRE',
        severity: 'P0',
        owner: 'dev-fe',
        note: 'CandidatesTab uses listCandidatesPool (Lane B) without active_interview; BE projection on listCandidates (Lane A) only',
      });
    }
    if (!browserPass && !result.browser.poolApiMissingProjection) {
      result.residuals.push({
        id: 'FE-BADGE-NO-ROW-WITH-ACTIVE',
        severity: 'P1',
        owner: 'qa',
        note: 'No badge visible — may need candidate with active interview in UI list or FE wiring gap',
      });
    }

    result.overall = apiPass && browserPass ? 'PASS_TO_PM' : apiPass && !browserPass ? 'CONDITIONAL_PASS_TO_PM' : 'FAIL_TO_PM';
    result.endedAt = ts();
    save();
    console.log(JSON.stringify({ overall: result.overall, ac, api: result.api, browser: result.browser, residuals: result.residuals }, null, 2));
    if (result.overall === 'FAIL_TO_PM') process.exitCode = 2;
  } catch (err) {
    result.fatal = String(err?.stack || err);
    result.overall = 'FAIL_TO_PM';
    result.endedAt = ts();
    save();
    console.error(result.fatal);
    process.exitCode = 1;
  }
}

main();
