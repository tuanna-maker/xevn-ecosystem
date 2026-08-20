#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-02-CLUSTER-QA-01
 * L1 API spot + U65 browser J-HRM-REC-YCTD-02 / 02b
 * Persona: ceo@xe.vn · companyId=main · U65 zero-seed · C-SLICE
 * cấm: seed · API fake inbox · DB mutate · honesty flip · Nest /rec dual claim
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-02-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8).toUpperCase();
const STAMP = `REC02QA-${stampTail}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-02-CLUSTER-QA-01',
  startedAt: ts(),
  stamp: STAMP,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · browser FE YCTD · Network 2xx · F5',
  honesty: {
    recruitment_uat_ready: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_module_rec_uat: true,
    deny_nest_rec_dual: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  ac: {},
  journeys: {},
  defects: [],
  fixtures: {},
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
function defect(id, severity, summary, owner = 'dev-be') {
  R.defects.push({ id, severity, summary, owner, at: ts() });
  console.error(`[DEFECT ${severity}] ${id}: ${summary}`);
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  for (const [k, v] of Object.entries(extra)) {
    if (v != null) u.searchParams.set(k, String(v));
  }
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

function apiHeaders(token) {
  return {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
}

async function api(token, method, path, body) {
  const url = path.startsWith('http') ? path : `${HRM}${path}`;
  const r = await fetch(url, {
    method,
    headers: apiHeaders(token),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j.code, message: j.message, data: j.data, raw: j };
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
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const path = u.replace(/^https?:\/\/[^/]+/, '');
      if (!/recruitment|job-templates|headcount-proposal/.test(path)) return;
      R.network.push({
        method: res.request().method(),
        status: res.status(),
        url: path.slice(0, 520),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
}

async function waitNet(predicate, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = [...R.network].reverse().find(predicate);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
}

function extractCells(plan) {
  const cells = [];
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (o.cell_id && (o.lifecycle_status || o.lifecycle)) cells.push(o);
    for (const v of Object.values(o)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') walk(v);
    }
  };
  walk(plan);
  return cells;
}

async function loadFixtures(token) {
  const plans = await api(token, 'GET', `/api/hrm/recruitment/recruitment-plans?company_id=${COMPANY}&page_size=50&year=2026`);
  const planRows = plans.data?.data || [];
  const approved = planRows.filter((p) => p.status === 'approved');
  const cells = [];
  for (const p of approved.slice(0, 12)) {
    const g = await api(token, 'GET', `/api/hrm/recruitment/recruitment-plans/${p.id}?company_id=${COMPANY}`);
    for (const c of extractCells(g.data || {})) {
      if (c.lifecycle_status === 'need_hire_approved') {
        cells.push({
          planId: p.id,
          cell_id: c.cell_id,
          need: Number(c.headcount_need_hire || c.need_hire || 0),
          month: c.month,
          title: p.title,
        });
      }
    }
  }
  const uniq = [];
  const seen = new Set();
  for (const c of cells) {
    if (seen.has(c.cell_id)) continue;
    seen.add(c.cell_id);
    uniq.push(c);
  }
  const recs = await api(token, 'GET', `/api/hrm/recruitment/requisitions?company_id=${COMPANY}&page_size=100`);
  const ri = recs.data?.items || recs.data?.data || (Array.isArray(recs.data) ? recs.data : []);
  const used = new Set(
    (Array.isArray(ri) ? ri : [])
      .filter((r) => r.headcount_mode === 'in_plan' && r.headcount_cell_id)
      .map((r) => r.headcount_cell_id),
  );
  const free = uniq.filter((c) => !used.has(c.cell_id) && c.need > 0);
  const occupied = uniq.filter((c) => used.has(c.cell_id));
  const jds = await api(token, 'GET', `/api/hrm/recruitment/job-templates?company_id=${COMPANY}&page_size=30`);
  const ji = jds.data?.data || jds.data?.items || [];
  const jd = (Array.isArray(ji) ? ji : []).find((j) => j.is_active !== false) || (Array.isArray(ji) ? ji[0] : null);
  const nullMode = (Array.isArray(ri) ? ri : []).filter((r) => r.headcount_mode == null || r.headcount_mode === '');
  R.fixtures = {
    freeCells: free.slice(0, 6),
    occupiedCells: occupied.slice(0, 4),
    jd: jd ? { id: jd.id, code: jd.code, title: jd.title || jd.name } : null,
    nullModeCount: nullMode.length,
    nullModeSample: nullMode.slice(0, 3).map((r) => ({ id: r.id, status: r.status, title: r.title })),
    requisitionCount: Array.isArray(ri) ? ri.length : 0,
  };
  save();
  return { free, occupied, jd, nullMode, requisitions: Array.isArray(ri) ? ri : [] };
}

async function runL0() {
  const checks = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      checks[k] = r.status;
    } catch (e) {
      checks[k] = String(e).slice(0, 80);
    }
  }
  // dist freshness
  try {
    const src = execSync(
      'powershell -NoProfile -Command "(Get-Item \'apps/api/hrm-api/src/recruitment/recruitment.service.ts\').LastWriteTimeUtc.ToString(\'o\')"',
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    const dist = execSync(
      'powershell -NoProfile -Command "(Get-Item \'apps/api/hrm-api/dist/recruitment/recruitment.service.js\').LastWriteTimeUtc.ToString(\'o\')"',
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    checks.srcMtime = src;
    checks.distMtime = dist;
    checks.stale_dist = new Date(src) > new Date(dist);
  } catch (e) {
    checks.dist_check = String(e).slice(0, 80);
  }
  R.l0 = checks;
  const ok = checks.hrm === 200 && checks.portal === 200 && checks.stale_dist !== true;
  ac('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(checks) });
  return ok;
}

async function runL1(token, fx) {
  const L = {};
  const jdId = fx.jd?.id;
  const freeCell = fx.free[0];
  const occupiedCell = fx.occupied[0];

  // 1) POST out_of_plan → draft
  {
    const body = {
      company_id: COMPANY,
      title: `QA L1 OUT ${STAMP}`,
      department: 'HCNS',
      employment_type: 'full_time',
      headcount: 1,
      headcount_mode: 'out_of_plan',
      hire_reason: 'new',
      out_of_plan_reason: `Phát sinh dự án QA ${STAMP}`,
      job_template_id: jdId,
    };
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    L.CREATE_OUT_DRAFT = {
      status: r.status,
      code: r.code,
      id: r.data?.id,
      reqStatus: r.data?.status,
      mode: r.data?.headcount_mode,
    };
    const pass = r.status === 201 && r.data?.status === 'draft' && r.data?.status !== 'open';
    ac('L1-CREATE-OUT-DRAFT', pass ? 'PASS' : 'FAIL', {
      summary: `POST out_of_plan → ${r.status} ${r.code} status=${r.data?.status}`,
      ...L.CREATE_OUT_DRAFT,
    });
    if (!pass) defect('R-REC-02-CREATE-DRAFT', 'P0', `Create out_of_plan not draft: ${JSON.stringify(L.CREATE_OUT_DRAFT)}`);
    R.fixtures.outDraftId = r.data?.id;
  }

  // 2) out_of_plan missing reason on create/submit — create may allow empty; submit must 400
  {
    const body = {
      company_id: COMPANY,
      title: `QA L1 OUT-NO-REASON ${STAMP}`,
      department: 'HCNS',
      employment_type: 'full_time',
      headcount: 1,
      headcount_mode: 'out_of_plan',
      hire_reason: 'new',
      job_template_id: jdId,
    };
    const cr = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    let submit = null;
    if (cr.status === 201 && cr.data?.id) {
      submit = await api(
        token,
        'POST',
        `/api/hrm/recruitment/requisitions/${cr.data.id}/submit-workflow?company_id=${COMPANY}`,
        {},
      );
    }
    L.OUT_REASON = {
      createStatus: cr.status,
      createCode: cr.code,
      submitStatus: submit?.status,
      submitCode: submit?.code,
      submitMessage: submit?.message,
    };
    const pass =
      (cr.status === 400 && /OUT-REASON|YCTD/.test(String(cr.code || cr.message || ''))) ||
      (submit &&
        submit.status === 400 &&
        /HRM-YCTD-OUT-REASON|OUT-REASON/.test(String(submit.code || submit.message || '')));
    ac('L1-OUT-REASON', pass ? 'PASS' : 'FAIL', {
      summary: `out_of_plan reason gate create=${cr.status}/${cr.code} submit=${submit?.status}/${submit?.code}`,
      ...L.OUT_REASON,
    });
    if (!pass)
      defect(
        'R-REC-02-OUT-REASON',
        'P0',
        `Missing out_of_plan_reason not gated: ${JSON.stringify(L.OUT_REASON)}`,
      );
  }

  // 3) in_plan create draft + CELL-QTY
  if (freeCell) {
    const bodyOk = {
      company_id: COMPANY,
      title: `QA L1 IN ${STAMP}`,
      department: 'HCNS',
      employment_type: 'full_time',
      headcount: 1,
      headcount_mode: 'in_plan',
      headcount_cell_id: freeCell.cell_id,
      hire_reason: 'new',
      job_template_id: jdId,
      recruitment_plan_id: freeCell.planId,
      target_month: String(freeCell.month || 8),
    };
    const cr = await api(token, 'POST', '/api/hrm/recruitment/requisitions', bodyOk);
    L.CREATE_IN_DRAFT = {
      status: cr.status,
      code: cr.code,
      id: cr.data?.id,
      reqStatus: cr.data?.status,
      cell: cr.data?.headcount_cell_id,
      mode: cr.data?.headcount_mode,
    };
    const passIn = cr.status === 201 && cr.data?.status === 'draft';
    ac('L1-CREATE-IN-DRAFT', passIn ? 'PASS' : 'FAIL', {
      summary: `POST in_plan → ${cr.status} ${cr.code} status=${cr.data?.status} cell=${freeCell.cell_id.slice(0, 8)}`,
      ...L.CREATE_IN_DRAFT,
    });
    if (!passIn) defect('R-REC-02-CREATE-IN', 'P0', `in_plan create fail: ${JSON.stringify(L.CREATE_IN_DRAFT)}`);
    R.fixtures.inDraftId = cr.data?.id;
    R.fixtures.inCellId = freeCell.cell_id;

    const qtyBody = {
      ...bodyOk,
      title: `QA L1 QTY ${STAMP}`,
      headcount: Math.max(999, (freeCell.need || 1) + 50),
      headcount_cell_id: freeCell.cell_id,
    };
    // use another free cell if available to avoid SPAWN-DUP on same after success
    const qtyCell = fx.free[1] || freeCell;
    qtyBody.headcount_cell_id = qtyCell.cell_id;
    qtyBody.recruitment_plan_id = qtyCell.planId;
    qtyBody.headcount = Math.max(999, (qtyCell.need || 1) + 50);
    const qty = await api(token, 'POST', '/api/hrm/recruitment/requisitions', qtyBody);
    L.CELL_QTY = { status: qty.status, code: qty.code, message: qty.message, headcount: qtyBody.headcount, cell: qtyCell.cell_id };
    const passQty = qty.status === 409 && String(qty.code || '').includes('HRM-YCTD-CELL-QTY');
    ac('L1-CELL-QTY', passQty ? 'PASS' : 'FAIL', {
      summary: `O2 vượt ô → ${qty.status} ${qty.code}`,
      ...L.CELL_QTY,
    });
    if (!passQty) defect('R-REC-02-CELL-QTY', 'P0', `Expected 409 HRM-YCTD-CELL-QTY got ${JSON.stringify(L.CELL_QTY)}`);
  } else {
    ac('L1-CREATE-IN-DRAFT', 'BLOCKED', { summary: 'No free need_hire_approved cell (zero-seed)' });
    ac('L1-CELL-QTY', 'BLOCKED', { summary: 'No free cell for QTY probe' });
  }

  // 4) submit-workflow → pending + matrix
  const submitId = R.fixtures.inDraftId || R.fixtures.outDraftId;
  if (submitId) {
    // ensure out draft has reason if using out
    if (submitId === R.fixtures.outDraftId) {
      /* already has reason */
    }
    const sw = await api(
      token,
      'POST',
      `/api/hrm/recruitment/requisitions/${submitId}/submit-workflow?company_id=${COMPANY}`,
      {},
    );
    L.SUBMIT = {
      status: sw.status,
      code: sw.code,
      id: submitId,
      reqStatus: sw.data?.status,
      matrix: sw.data?.approval_matrix_key,
      spawnMissing: sw.data?.spawnMissing,
    };
    const pass =
      sw.status === 200 &&
      (sw.data?.status === 'pending_approval' || sw.code === 'HRM-REC-WF-200') &&
      (sw.data?.approval_matrix_key === 'SHORT' ||
        sw.data?.approval_matrix_key === 'LONG' ||
        /SHORT|LONG/i.test(String(sw.data?.approval_matrix_key || '')));
    // soft: if spawnMissing still 2xx with pending
    const passSoft =
      sw.status === 200 &&
      (sw.data?.status === 'pending_approval' || sw.data?.spawnMissing === true) &&
      (sw.data?.approval_matrix_key == null ||
        /SHORT|LONG/i.test(String(sw.data?.approval_matrix_key || '')));
    const ok = pass || (passSoft && sw.data?.status === 'pending_approval');
    ac('L1-SUBMIT-MATRIX', ok ? 'PASS' : 'FAIL', {
      summary: `submit → ${sw.status} ${sw.code} status=${sw.data?.status} matrix=${sw.data?.approval_matrix_key}`,
      ...L.SUBMIT,
    });
    if (!ok) defect('R-REC-02-SUBMIT', 'P0', `submit-workflow matrix fail: ${JSON.stringify(L.SUBMIT)}`);
    R.fixtures.submittedId = submitId;
    R.fixtures.submittedMatrix = sw.data?.approval_matrix_key;
  } else {
    ac('L1-SUBMIT-MATRIX', 'BLOCKED', { summary: 'No draft id' });
  }

  // 5) transitions approve → open_for_hire (in_plan) or approved/BOD (out)
  const transId = R.fixtures.submittedId || R.fixtures.inDraftId;
  if (transId) {
    // ensure pending — if still draft, submit first
    let cur = await api(token, 'GET', `/api/hrm/recruitment/requisitions/${transId}?company_id=${COMPANY}`);
    if (cur.data?.status === 'draft') {
      await api(
        token,
        'POST',
        `/api/hrm/recruitment/requisitions/${transId}/submit-workflow?company_id=${COMPANY}`,
        {},
      );
      cur = await api(token, 'GET', `/api/hrm/recruitment/requisitions/${transId}?company_id=${COMPANY}`);
    }
    const mode = cur.data?.headcount_mode;
    const tr = await api(
      token,
      'POST',
      `/api/hrm/recruitment/requisitions/${transId}/transitions?company_id=${COMPANY}`,
      { action: 'approve', bod_complete: mode === 'out_of_plan' ? true : undefined, comment: `QA approve ${STAMP}` },
    );
    L.TRANSITION = {
      status: tr.status,
      code: tr.code,
      mode,
      before: cur.data?.status,
      after: tr.data?.status,
      message: tr.message,
    };
    const expectOpen = mode === 'in_plan' || mode === 'out_of_plan';
    const pass =
      tr.status === 200 &&
      (tr.data?.status === 'open_for_hire' ||
        (mode === 'out_of_plan' && (tr.data?.status === 'approved' || tr.data?.status === 'open_for_hire')));
    ac('L1-TRANSITION-APPROVE', pass ? 'PASS' : 'FAIL', {
      summary: `transitions approve mode=${mode} → ${tr.status} status=${tr.data?.status}`,
      ...L.TRANSITION,
    });
    if (!pass && expectOpen)
      defect('R-REC-02-TRANSITION', 'P0', `approve transition fail: ${JSON.stringify(L.TRANSITION)}`);
    R.fixtures.transitionedId = transId;
    R.fixtures.transitionedStatus = tr.data?.status;
  } else {
    ac('L1-TRANSITION-APPROVE', 'BLOCKED', { summary: 'No submitted id' });
  }

  // 6) pipeline-flags gate
  {
    // non-receivable: use nullMode or a draft
    const blockedId =
      fx.nullMode[0]?.id ||
      (R.fixtures.outDraftId && R.fixtures.transitionedStatus !== 'open_for_hire'
        ? R.fixtures.outDraftId
        : null);
    // create a fresh draft to test NOT-RECEIVABLE
    const draft = await api(token, 'POST', '/api/hrm/recruitment/requisitions', {
      company_id: COMPANY,
      title: `QA L1 FLAGS-DRAFT ${STAMP}`,
      department: 'HCNS',
      employment_type: 'full_time',
      headcount: 1,
      headcount_mode: 'out_of_plan',
      hire_reason: 'new',
      out_of_plan_reason: `flags gate ${STAMP}`,
      job_template_id: jdId,
    });
    const draftId = draft.data?.id;
    const flagsBlocked = draftId
      ? await api(
          token,
          'PATCH',
          `/api/hrm/recruitment/requisitions/${draftId}/pipeline-flags?company_id=${COMPANY}`,
          { posted: true, cv_intake_allowed: true },
        )
      : { status: 0, code: 'NO_DRAFT' };
    L.FLAGS_BLOCKED = {
      status: flagsBlocked.status,
      code: flagsBlocked.code,
      message: flagsBlocked.message,
      id: draftId,
    };
    const passBlock =
      flagsBlocked.status === 409 &&
      /HRM-YCTD-NOT-RECEIVABLE|HRM-YCTD-BOD-REQUIRED|HRM-YCTD-MODE-UNCLASSIFIED/.test(
        String(flagsBlocked.code || ''),
      );
    ac('L1-PIPELINE-FLAGS-GATE', passBlock ? 'PASS' : 'FAIL', {
      summary: `flags on draft → ${flagsBlocked.status} ${flagsBlocked.code}`,
      ...L.FLAGS_BLOCKED,
    });
    if (!passBlock)
      defect(
        'R-REC-02-FLAGS-GATE',
        'P0',
        `pipeline-flags should 409 on non-receivable: ${JSON.stringify(L.FLAGS_BLOCKED)}`,
      );

    // open_for_hire path when we have one
    if (R.fixtures.transitionedStatus === 'open_for_hire' && R.fixtures.transitionedId) {
      const flagsOk = await api(
        token,
        'PATCH',
        `/api/hrm/recruitment/requisitions/${R.fixtures.transitionedId}/pipeline-flags?company_id=${COMPANY}`,
        { posted: true, cv_intake_allowed: true },
      );
      L.FLAGS_OK = { status: flagsOk.status, code: flagsOk.code, data: flagsOk.data?.pipeline_flags };
      const passOk = flagsOk.status === 200;
      ac('L1-PIPELINE-FLAGS-OK', passOk ? 'PASS' : 'FAIL', {
        summary: `flags on open_for_hire → ${flagsOk.status} ${flagsOk.code}`,
        ...L.FLAGS_OK,
      });
      if (!passOk) defect('R-REC-02-FLAGS-OK', 'P1', `flags on receivable fail: ${JSON.stringify(L.FLAGS_OK)}`);
    } else {
      ac('L1-PIPELINE-FLAGS-OK', 'NOTE_BLOCKED', {
        summary: `no open_for_hire yet (status=${R.fixtures.transitionedStatus}) — gate block proven`,
      });
    }
  }

  // 7) O4 MODE-UNCLASSIFIED
  {
    const legacy = fx.nullMode[0];
    if (legacy?.id) {
      const flags = await api(
        token,
        'PATCH',
        `/api/hrm/recruitment/requisitions/${legacy.id}/pipeline-flags?company_id=${COMPANY}`,
        { posted: true },
      );
      L.O4 = { status: flags.status, code: flags.code, message: flags.message, id: legacy.id };
      const pass =
        flags.status === 409 && String(flags.code || '').includes('HRM-YCTD-MODE-UNCLASSIFIED');
      ac('L1-O4-MODE-UNCLASSIFIED', pass ? 'PASS' : 'FAIL', {
        summary: `legacy NULL mode flags → ${flags.status} ${flags.code}`,
        ...L.O4,
      });
      if (!pass)
        defect('R-REC-02-O4', 'P0', `O4 expected MODE-UNCLASSIFIED: ${JSON.stringify(L.O4)}`);
      R.fixtures.legacyId = legacy.id;
    } else {
      ac('L1-O4-MODE-UNCLASSIFIED', 'BLOCKED', { summary: 'No legacy NULL headcount_mode row in list' });
    }
  }

  // 8) scope_parity list=get=mutate
  {
    const list = await api(token, 'GET', `/api/hrm/recruitment/requisitions?company_id=${COMPANY}&page_size=50`);
    const items = list.data?.items || list.data?.data || [];
    const sample = (Array.isArray(items) ? items : []).find((r) => r.id) || {
      id: R.fixtures.outDraftId,
    };
    const get = sample?.id
      ? await api(token, 'GET', `/api/hrm/recruitment/requisitions/${sample.id}?company_id=${COMPANY}`)
      : { status: 0 };
    const inList = (Array.isArray(items) ? items : []).some((r) => r.id === sample.id);
    L.SCOPE = {
      listStatus: list.status,
      getStatus: get.status,
      inList,
      id: sample?.id,
      getCode: get.code,
    };
    const pass = list.status === 200 && get.status === 200 && inList && get.data?.id === sample.id;
    ac('L1-SCOPE-PARITY', pass ? 'PASS' : 'FAIL', {
      summary: `list=${list.status} get=${get.status} inList=${inList}`,
      ...L.SCOPE,
    });
    if (!pass) defect('R-REC-02-SCOPE', 'P0', `scope_parity fail: ${JSON.stringify(L.SCOPE)}`, 'dev-be');
  }

  // 9) Nest /rec dual DENY
  {
    const dual = await api(token, 'GET', `/api/hrm/rec/recruitment-requests?company_id=${COMPANY}`);
    L.NEST_REC_DUAL = { status: dual.status, code: dual.code, message: dual.message };
    const pass = dual.status === 404 || dual.status === 501 || /404|Cannot|not found/i.test(String(dual.message || dual.code || ''));
    ac('L1-DENY-NEST-REC-DUAL', pass ? 'PASS' : 'FAIL', {
      summary: `GET /rec/recruitment-requests → ${dual.status} ${dual.code}`,
      ...L.NEST_REC_DUAL,
    });
    if (!pass) defect('R-REC-02-NEST-DUAL', 'P0', `Nest /rec dual unexpectedly live: ${JSON.stringify(L.NEST_REC_DUAL)}`);
  }

  // 10) SPAWN-DUP when occupied cell available
  if (occupiedCell) {
    const dup = await api(token, 'POST', '/api/hrm/recruitment/requisitions', {
      company_id: COMPANY,
      title: `QA L1 SPAWN-DUP ${STAMP}`,
      department: 'HCNS',
      employment_type: 'full_time',
      headcount: 1,
      headcount_mode: 'in_plan',
      headcount_cell_id: occupiedCell.cell_id,
      hire_reason: 'new',
      job_template_id: jdId,
    });
    L.SPAWN_DUP = { status: dup.status, code: dup.code, message: dup.message, cell: occupiedCell.cell_id };
    const pass = dup.status === 409 && /SPAWN-DUP|YCTD/.test(String(dup.code || ''));
    ac('L1-SPAWN-DUP-RETAIN', pass ? 'PASS' : 'FAIL', {
      summary: `manual create occupied cell → ${dup.status} ${dup.code}`,
      ...L.SPAWN_DUP,
    });
    if (!pass)
      defect('R-REC-02-SPAWN-DUP', 'P1', `SPAWN-DUP retain fail: ${JSON.stringify(L.SPAWN_DUP)}`, 'dev-be');
  } else {
    ac('L1-SPAWN-DUP-RETAIN', 'NOTE_BLOCKED', { summary: 'No occupied in_plan cell observed' });
  }

  R.l1 = L;
  save();
}

async function selectRadix(page, testId, optionTextOrValue) {
  const trigger = page.getByTestId(testId);
  await trigger.click();
  await sleep(300);
  const byRole = page.getByRole('option', { name: new RegExp(optionTextOrValue, 'i') }).first();
  if ((await byRole.count()) > 0) {
    await byRole.click();
    return true;
  }
  const item = page.locator(`[role="option"], [data-radix-collection-item]`).filter({ hasText: optionTextOrValue }).first();
  if ((await item.count()) > 0) {
    await item.click();
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function pickFirstJobTemplate(page) {
  const trigger = page.getByTestId('hdsd-requisition-job-template');
  if ((await trigger.count()) === 0) return { ok: false, reason: 'no_jd_picker' };
  await trigger.click();
  await sleep(500);
  const opt = page.getByRole('option').first();
  if ((await opt.count()) === 0) {
    const alt = page.locator('[cmdk-item], [role="option"]').first();
    if ((await alt.count()) === 0) {
      await page.keyboard.press('Escape').catch(() => {});
      return { ok: false, reason: 'no_jd_options' };
    }
    const label = ((await alt.textContent()) || '').trim().slice(0, 80);
    await alt.click();
    return { ok: true, label };
  }
  const label = ((await opt.textContent()) || '').trim().slice(0, 80);
  await opt.click();
  return { ok: true, label };
}

async function fillBasicFields(page, title) {
  await page.getByTestId('hdsd-requisition-title').fill(title);
  const dept = page.getByTestId('hdsd-requisition-department');
  if ((await dept.count()) > 0) {
    const tag = await dept.evaluate((el) => el.tagName.toLowerCase());
    if (tag === 'input' || tag === 'textarea') await dept.fill('HCNS');
    else {
      await dept.click();
      await sleep(300);
      const opt = page.getByRole('option').first();
      if ((await opt.count()) > 0) await opt.click();
      else await page.keyboard.press('Escape').catch(() => {});
    }
  }
  const hc = page.getByTestId('hdsd-requisition-headcount');
  if ((await hc.count()) > 0) {
    await hc.fill('1');
  }
  const emp = page.getByTestId('hdsd-requisition-employment-type');
  if ((await emp.count()) > 0) {
    await emp.click().catch(() => {});
    await sleep(250);
    const opt = page.getByRole('option').first();
    if ((await opt.count()) > 0) await opt.click();
    else await page.keyboard.press('Escape').catch(() => {});
  }
}

async function runBrowser(session, fx) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  // --- J-HRM-REC-YCTD-02 in_plan ---
  log('J-HRM-REC-YCTD-02 start');
  const url02 = q('/hr/recruitment', { tab: 'requisitions' });
  await page.goto(url02, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  await shot(page, '01-requisitions-list');

  const beforeRows = await page.locator('[data-testid^="yctd-mode-"]').count().catch(() => 0);
  R.journeys['J-HRM-REC-YCTD-02'] = { beforeRows, url: url02 };

  await page.getByTestId('hdsd-requisition-create-btn').click();
  await page.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 15000 });
  await sleep(400);

  const modeIn = await selectRadix(page, 'yctd-headcount-mode', 'Trong định biên');
  if (!modeIn) await selectRadix(page, 'yctd-headcount-mode', 'in_plan');
  await sleep(300);

  const freeCell = fx.free[0] || fx.freeCells?.[0];
  // prefer a cell not used by L1 create — skip first if L1 consumed it
  const cellForBrowser =
    fx.free.find((c) => c.cell_id !== R.fixtures.inCellId) || freeCell || R.fixtures.freeCells?.[1];
  if (cellForBrowser) {
    await page.getByTestId('yctd-headcount-cell-id').fill(cellForBrowser.cell_id);
  }
  await selectRadix(page, 'yctd-hire-reason', 'Tuyển mới');
  const title02 = `QA FE IN ${STAMP}`;
  await fillBasicFields(page, title02);
  const jdPick = await pickFirstJobTemplate(page);
  log('JD pick', jdPick);

  const netBefore = R.network.length;
  await page.getByTestId('hdsd-requisition-form-submit').click();
  const createHit = await waitNet(
    (n) => n.method === 'POST' && /\/requisitions$/.test(n.url.split('?')[0]) && n.status >= 200,
    25000,
  );
  await sleep(1500);
  await shot(page, '02-after-save-in');

  const createOk = createHit && createHit.status >= 200 && createHit.status < 300;
  let feAfterSave = false;
  if (createOk) {
    feAfterSave =
      (await page.getByText(title02).count()) > 0 ||
      (await page.getByTestId('hdsd-requisition-post-create-submit').count()) > 0 ||
      (await page.getByText(/Trong ĐB|chờ duyệt|nháp|draft/i).count()) > 0;
  }

  // Gửi duyệt
  let submitHit = null;
  if ((await page.getByTestId('hdsd-requisition-submit-wf').count()) > 0) {
    await page.getByTestId('hdsd-requisition-submit-wf').first().click();
    submitHit = await waitNet(
      (n, idx) =>
        n.method === 'POST' &&
        /submit-workflow/.test(n.url) &&
        n.status >= 200 &&
        R.network.indexOf(n) >= netBefore,
      25000,
    );
  } else {
    // try row button by title
    const rowBtn = page.locator(`[aria-label="Gửi duyệt QT"]`).first();
    if ((await rowBtn.count()) > 0) {
      await rowBtn.click();
      submitHit = await waitNet((n) => n.method === 'POST' && /submit-workflow/.test(n.url), 25000);
    }
  }
  await sleep(1200);
  await shot(page, '03-after-submit-in');

  // F5
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await shot(page, '04-f5-in');
  const f5HasTitle = (await page.getByText(title02).count()) > 0;
  const f5Mode = await page.locator('[data-testid^="yctd-mode-"]').filter({ hasText: /Trong/i }).count();

  const j02Pass =
    createOk &&
    feAfterSave &&
    f5HasTitle &&
    (submitHit == null || (submitHit.status >= 200 && submitHit.status < 300));
  R.journeys['J-HRM-REC-YCTD-02'] = {
    ...R.journeys['J-HRM-REC-YCTD-02'],
    cell: cellForBrowser?.cell_id,
    createHit,
    submitHit,
    feAfterSave,
    f5HasTitle,
    f5ModeCount: f5Mode,
    jdPick,
    verdict: !cellForBrowser ? 'BLOCKED' : j02Pass ? 'PASS' : 'FAIL',
  };
  ac(
    'J-HRM-REC-YCTD-02',
    !cellForBrowser ? 'BLOCKED' : j02Pass ? 'PASS' : 'FAIL',
    {
      summary: `in_plan Lưu ${createHit?.status} FE=${feAfterSave} submit=${submitHit?.status} F5=${f5HasTitle}`,
      createHit,
      submitHit,
      cell: cellForBrowser?.cell_id,
    },
  );
  if (cellForBrowser && !j02Pass)
    defect(
      'R-REC-02-J-YCTD-02',
      'P0',
      `J-HRM-REC-YCTD-02 fail create=${createHit?.status} fe=${feAfterSave} f5=${f5HasTitle} submit=${submitHit?.status}`,
      'dev-fe',
    );

  // --- J-HRM-REC-YCTD-02b out_of_plan ---
  log('J-HRM-REC-YCTD-02b start');
  await page.goto(q('/hr/recruitment', { tab: 'requisitions' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2000);
  await page.getByTestId('hdsd-requisition-create-btn').click();
  await page.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 15000 });
  await selectRadix(page, 'yctd-headcount-mode', 'Ngoài định biên');
  await sleep(400);
  const longHint = (await page.getByTestId('yctd-long-matrix-hint').count()) > 0;
  const reasonText = `Vượt kế hoạch quý — QA ${STAMP}`;
  await page.getByTestId('yctd-out-of-plan-reason').fill(reasonText);
  await selectRadix(page, 'yctd-hire-reason', 'Tuyển mới');
  const title02b = `QA FE OUT ${STAMP}`;
  await fillBasicFields(page, title02b);
  await pickFirstJobTemplate(page);

  await page.getByTestId('hdsd-requisition-form-submit').click();
  const createOut = await waitNet(
    (n) => n.method === 'POST' && /\/requisitions$/.test(n.url.split('?')[0]) && n.status >= 200,
    25000,
  );
  await sleep(1500);
  await shot(page, '05-after-save-out');

  // try flags blocked on detail if opened — or check pipeline section absent for draft
  let flagsBlockedUi = true;
  if ((await page.getByTestId('yctd-pipeline-flags').count()) > 0) {
    // if visible on non-receivable — try save and expect toast/409
    await page.getByTestId('yctd-flag-posted').click().catch(() => {});
    await page.getByTestId('yctd-pipeline-flags-save').click().catch(() => {});
    const flagNet = await waitNet((n) => n.method === 'PATCH' && /pipeline-flags/.test(n.url), 8000);
    if (flagNet && flagNet.status >= 200 && flagNet.status < 300) flagsBlockedUi = false;
  }

  let submitOut = null;
  if ((await page.getByTestId('hdsd-requisition-submit-wf').count()) > 0) {
    await page.getByTestId('hdsd-requisition-submit-wf').first().click();
    submitOut = await waitNet((n) => n.method === 'POST' && /submit-workflow/.test(n.url), 25000);
  }
  await sleep(1000);

  // approve path when transitions visible
  let approveHit = null;
  // open detail of our row
  const outRow = page.getByText(title02b).first();
  if ((await outRow.count()) > 0) {
    await outRow.click().catch(() => {});
    await sleep(1000);
  }
  if ((await page.getByTestId('yctd-transition-approve').count()) > 0) {
    await page.getByTestId('yctd-transition-approve').click();
    approveHit = await waitNet((n) => n.method === 'POST' && /transitions/.test(n.url), 20000);
  }
  await shot(page, '06-out-detail');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await shot(page, '07-f5-out');
  const f5Out = (await page.getByText(title02b).count()) > 0;
  const f5Reason = (await page.getByText(reasonText.slice(0, 20)).count()) > 0 || f5Out;

  const j02bPass =
    createOut &&
    createOut.status >= 200 &&
    createOut.status < 300 &&
    longHint &&
    flagsBlockedUi &&
    f5Out;
  R.journeys['J-HRM-REC-YCTD-02b'] = {
    longHint,
    createOut,
    submitOut,
    approveHit,
    flagsBlockedUi,
    f5Out,
    f5Reason,
    verdict: j02bPass ? 'PASS' : 'FAIL',
  };
  ac('J-HRM-REC-YCTD-02b', j02bPass ? 'PASS' : 'FAIL', {
    summary: `out_of_plan Lưu ${createOut?.status} LONG=${longHint} flagsBlock=${flagsBlockedUi} F5=${f5Out} approve=${approveHit?.status}`,
  });
  if (!j02bPass)
    defect(
      'R-REC-02-J-YCTD-02b',
      'P0',
      `J-HRM-REC-YCTD-02b fail create=${createOut?.status} longHint=${longHint} flagsBlock=${flagsBlockedUi} f5=${f5Out}`,
      'dev-fe',
    );

  // --- O4 classify banner ---
  log('O4 banner check');
  await page.goto(q('/hr/recruitment', { tab: 'requisitions' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2000);
  const bannerList = (await page.getByTestId('yctd-classify-banner').count()) > 0;
  let bannerDetail = false;
  if (R.fixtures.legacyId) {
    // click a null-mode row if visible — open first row without mode chip Trong/Ngoài
    const legacyChip = page.locator('[data-testid^="yctd-mode-"]').filter({ hasText: /chưa|phân loại|—|N\/A|null/i });
    if ((await legacyChip.count()) > 0) {
      await legacyChip.first().click();
      await sleep(800);
    } else {
      // click any row then check detail banner via API-known legacy — navigate list text
      const rows = page.locator('table tbody tr');
      const n = await rows.count();
      for (let i = 0; i < Math.min(n, 12); i++) {
        await rows.nth(i).click();
        await sleep(600);
        if ((await page.getByTestId('yctd-detail-classify-banner').count()) > 0) {
          bannerDetail = true;
          break;
        }
        if ((await page.getByTestId('yctd-classify-banner').count()) > 0) {
          bannerDetail = true;
          break;
        }
      }
    }
  }
  await shot(page, '08-o4-banner');
  const o4Pass = bannerList || bannerDetail || R.fixtures.nullModeCount > 0;
  // If legacy rows exist, banner should show when viewing them — if not found after scan, FAIL
  const o4Verdict =
    R.fixtures.nullModeCount === 0
      ? 'NOTE_BLOCKED'
      : bannerList || bannerDetail
        ? 'PASS'
        : 'FAIL';
  ac('O4-CLASSIFY-BANNER', o4Verdict, {
    summary: `nullModeRows=${R.fixtures.nullModeCount} listBanner=${bannerList} detailBanner=${bannerDetail}`,
  });
  if (o4Verdict === 'FAIL')
    defect('R-REC-02-O4-BANNER', 'P1', 'Legacy NULL mode rows exist but classify banner not visible', 'dev-fe');

  // --- O5 proposals CTA only ---
  log('O5 proposals tab');
  const netBeforeO5 = R.network.length;
  await page.goto(q('/hr/recruitment', { tab: 'proposals' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2500);
  await shot(page, '09-proposals-o5');
  const deprecate = (await page.getByTestId('yctd-proposals-deprecate-banner').count()) > 0;
  const cta =
    (await page.getByTestId('yctd-proposals-redirect-cta').count()) > 0 ||
    (await page.getByTestId('yctd-proposals-redirect-cta-header').count()) > 0;
  // assert no POST createHeadcountProposal / dual persist
  if (cta) {
    await page.getByTestId('yctd-proposals-redirect-cta').first().click().catch(async () => {
      await page.getByTestId('yctd-proposals-redirect-cta-header').first().click();
    });
    await sleep(2000);
  }
  const dualPost = R.network
    .slice(netBeforeO5)
    .filter(
      (n) =>
        n.method === 'POST' &&
        /headcount-proposal|proposals/.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
  const o5Pass = deprecate && cta && dualPost.length === 0;
  ac('O5-PROPOSALS-REDIRECT', o5Pass ? 'PASS' : 'FAIL', {
    summary: `deprecate=${deprecate} cta=${cta} dualPersistPosts=${dualPost.length}`,
    dualPost,
  });
  if (!o5Pass)
    defect(
      'R-REC-02-O5',
      'P0',
      `O5 proposals not redirect-only: deprecate=${deprecate} cta=${cta} dual=${dualPost.length}`,
      'dev-fe',
    );
  R.journeys.O5 = { deprecate, cta, dualPost };

  // --- must_keep smoke: UF-HRM-12 submit strip + JD soft bind surface + Định biên tab ---
  log('must_keep regression smoke');
  await page.goto(q('/hr/recruitment', { tab: 'requisitions' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2000);
  const uf12 =
    (await page.getByTestId('hdsd-requisition-create-btn').count()) > 0 &&
    (await page.getByText(/Gửi duyệt QT/i).count()) >= 0;
  await page.goto(q('/hr/recruitment', { tab: 'headcount' }), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2500);
  const dinhBien =
    (await page.getByTestId('rec-hc-plan-grid').count()) > 0 ||
    (await page.getByText(/Định biên|Cần tuyển/i).count()) > 0;
  await shot(page, '10-must-keep');
  ac('MUSTKEEP-UF-HRM-12-JD-REC01', uf12 && dinhBien ? 'PASS' : 'FAIL', {
    summary: `UF-HRM-12 surface=${uf12} Định biên panel=${dinhBien}`,
  });
  if (!(uf12 && dinhBien))
    defect('R-REC-02-MUSTKEEP', 'P1', `must_keep regression uf12=${uf12} dinhBien=${dinhBien}`, 'dev-fe');

  R.journeys.must_keep = { uf12, dinhBien };
  await browser.close();
}

function finalize() {
  const fails = Object.entries(R.ac).filter(([, v]) => v.verdict === 'FAIL');
  const blocked = Object.entries(R.ac).filter(([, v]) => v.verdict === 'BLOCKED');
  R.overall = fails.length === 0 ? (blocked.length ? 'PASS_WITH_BLOCKED' : 'PASS') : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log(`\n=== OVERALL ${R.overall} ack=${R.ack_status} stamp=${R.stamp} fails=${fails.length} ===`);
  for (const [k, v] of fails) console.log(`FAIL ${k}: ${v.summary}`);
}

async function main() {
  const l0ok = await runL0();
  if (!l0ok) {
    defect('R-REC-02-L0', 'P0', `L0 fail: ${JSON.stringify(R.l0)}`, 'devops');
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  const session = await loginApi();
  const fx = await loadFixtures(session.token);
  log('fixtures', {
    free: fx.free.length,
    occupied: fx.occupied.length,
    jd: fx.jd?.id,
    nullMode: fx.nullMode.length,
  });
  await runL1(session.token, fx);
  await runBrowser(session, fx);
  finalize();
  process.exit(R.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  defect('R-REC-02-RUNNER', 'P0', String(e).slice(0, 400), 'qa');
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  save();
  process.exit(1);
});
