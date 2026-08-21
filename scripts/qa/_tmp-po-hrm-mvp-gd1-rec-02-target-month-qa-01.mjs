#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QA-01
 * Narrow L1 retest for R-REC-02-TARGET-MONTH-DATE (probe OK; FE omits field)
 * Persona: ceo@xe.vn · companyId=main · U65 zero-seed · C-SLICE
 * cấm: seed · honesty flip · claim module REC UAT · reopen sealed REC-01/02
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.json');
mkdirSync(dirname(OUT_JSON), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8).toUpperCase();
const STAMP = `RECTMQA-${stampTail}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QA-01',
  residual: 'R-REC-02-TARGET-MONTH-DATE',
  startedAt: ts(),
  stamp: STAMP,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · L1 probe only (FE omits target_month)',
  honesty: {
    recruitment_uat_ready: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_module_rec_uat: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  ac: {},
  defects: [],
  fixtures: {},
  residual_close: null,
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  console.error(`[log] ${msg}${extra && Object.keys(extra).length ? ' ' + JSON.stringify(extra) : ''}`);
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
  return token;
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

function normalizeReturnedMonth(v) {
  if (v == null) return null;
  const s = String(v);
  // ISO date or date-time → YYYY-MM-DD
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}

async function loadFixtures(token) {
  const plans = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans?company_id=${COMPANY}&page_size=50&year=2026`,
  );
  const planRows = plans.data?.data || plans.data?.items || [];
  const approved = (Array.isArray(planRows) ? planRows : []).filter((p) => p.status === 'approved');
  const cells = [];
  for (const p of approved.slice(0, 16)) {
    const g = await api(token, 'GET', `/api/hrm/recruitment/recruitment-plans/${p.id}?company_id=${COMPANY}`);
    for (const c of extractCells(g.data || {})) {
      if (c.lifecycle_status === 'need_hire_approved' || c.lifecycle === 'need_hire_approved') {
        cells.push({
          planId: p.id,
          planTitle: p.title,
          cell_id: c.cell_id,
          need: Number(c.headcount_need_hire || c.need_hire || 0),
          month: c.month,
          position_key: c.position_key || c.positionKey,
          department_key: c.department_key || c.departmentKey,
          name: c.name || c.position_name,
          deptName: c.department_name || c.dept_name,
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
    freeCells: free.slice(0, 8).map((c) => ({ cell_id: c.cell_id, planId: c.planId, need: c.need })),
    occupiedCells: occupied.slice(0, 4).map((c) => ({ cell_id: c.cell_id, planId: c.planId })),
    jd: jd ? { id: jd.id, code: jd.code, title: jd.title || jd.name } : null,
    nullModeCount: nullMode.length,
    nullModeSample: nullMode.slice(0, 2).map((r) => ({ id: r.id, status: r.status })),
    approvedPlanCount: approved.length,
    lockedCellSample: uniq[0]
      ? { planId: uniq[0].planId, cell_id: uniq[0].cell_id, need: uniq[0].need }
      : null,
  };
  save();
  return { free, occupied, jd, nullMode, locked: uniq[0] || null, approved };
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
  try {
    const src = execSync(
      "powershell -NoProfile -Command \"(Get-Item 'apps/api/hrm-api/src/recruitment/yctd-requisition-gates.ts').LastWriteTimeUtc.ToString('o')\"",
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    const dist = execSync(
      "powershell -NoProfile -Command \"(Get-Item 'apps/api/hrm-api/dist/recruitment/yctd-requisition-gates.js').LastWriteTimeUtc.ToString('o')\"",
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    checks.srcMtime = src;
    checks.distMtime = dist;
    checks.stale_dist = new Date(src) > new Date(dist);
    const hasFix = execSync(
      'powershell -NoProfile -Command "Select-String -Path \'apps/api/hrm-api/dist/recruitment/yctd-requisition-gates.js\' -Pattern \'normalizeTargetMonthOrThrow\' | Measure-Object | Select-Object -ExpandProperty Count"',
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    checks.dist_has_normalize = Number(hasFix) > 0;
  } catch (e) {
    checks.dist_check = String(e).slice(0, 120);
  }
  R.l0 = checks;
  const ok =
    checks.hrm === 200 &&
    checks.portal === 200 &&
    checks.stale_dist !== true &&
    checks.dist_has_normalize === true;
  ac('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(checks) });
  return ok;
}

function baseOutBody(jdId, title) {
  return {
    company_id: COMPANY,
    title,
    department: 'HCNS',
    employment_type: 'full_time',
    headcount: 1,
    headcount_mode: 'out_of_plan',
    hire_reason: 'new',
    out_of_plan_reason: `Phát sinh QA target_month ${STAMP}`,
    job_template_id: jdId,
  };
}

async function runTargetMonthCases(token, jdId) {
  const L = {};

  // 1) YYYY-MM → 2xx first-day
  {
    const body = { ...baseOutBody(jdId, `QA TM YYYY-MM ${STAMP}`), target_month: '2026-09' };
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    const returned = normalizeReturnedMonth(r.data?.target_month);
    L.YYYY_MM = {
      status: r.status,
      code: r.code,
      id: r.data?.id,
      reqStatus: r.data?.status,
      target_month_raw: r.data?.target_month,
      target_month: returned,
      message: r.message,
    };
    const pass =
      r.status >= 200 &&
      r.status < 300 &&
      r.status !== 500 &&
      !/HRM-SYS-001/.test(String(r.code || '')) &&
      returned === '2026-09-01';
    ac('L1-TM-YYYY-MM', pass ? 'PASS' : 'FAIL', {
      summary: `target_month=2026-09 → ${r.status} ${r.code} stored=${returned}`,
      ...L.YYYY_MM,
    });
    if (!pass)
      defect(
        'R-REC-02-TARGET-MONTH-DATE',
        'P2',
        `YYYY-MM not first-day: ${JSON.stringify(L.YYYY_MM)}`,
      );
  }

  // 2) YYYY-MM-01 → 2xx
  {
    const body = { ...baseOutBody(jdId, `QA TM YYYY-MM-01 ${STAMP}`), target_month: '2026-09-01' };
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    const returned = normalizeReturnedMonth(r.data?.target_month);
    L.YYYY_MM_01 = {
      status: r.status,
      code: r.code,
      id: r.data?.id,
      reqStatus: r.data?.status,
      target_month: returned,
      message: r.message,
    };
    const pass =
      r.status >= 200 &&
      r.status < 300 &&
      (returned === '2026-09-01' || returned == null || String(returned).startsWith('2026-09-01'));
    ac('L1-TM-YYYY-MM-01', pass ? 'PASS' : 'FAIL', {
      summary: `target_month=2026-09-01 → ${r.status} ${r.code} stored=${returned}`,
      ...L.YYYY_MM_01,
    });
    if (!pass)
      defect('R-REC-02-TARGET-MONTH-DATE', 'P2', `YYYY-MM-01 fail: ${JSON.stringify(L.YYYY_MM_01)}`);
  }

  // 3) garbage "8" → 400 VAL-400 not 500 SYS
  {
    const body = { ...baseOutBody(jdId, `QA TM GARBAGE-8 ${STAMP}`), target_month: '8' };
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    L.GARBAGE_8 = {
      status: r.status,
      code: r.code,
      message: r.message,
      id: r.data?.id,
    };
    const pass =
      r.status === 400 &&
      String(r.code || '').includes('HRM-YCTD-VAL-400') &&
      r.status !== 500 &&
      !/HRM-SYS-001/.test(String(r.code || ''));
    ac('L1-TM-GARBAGE-8', pass ? 'PASS' : 'FAIL', {
      summary: `target_month=8 → ${r.status} ${r.code} (expect 400 VAL-400)`,
      ...L.GARBAGE_8,
    });
    if (!pass)
      defect(
        'R-REC-02-TARGET-MONTH-DATE',
        'P2',
        `garbage "8" not VAL-400: ${JSON.stringify(L.GARBAGE_8)}`,
      );
  }

  // 3b) extra garbage
  {
    const body = { ...baseOutBody(jdId, `QA TM GARBAGE-BAD ${STAMP}`), target_month: 'not-a-date' };
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    L.GARBAGE_BAD = { status: r.status, code: r.code, message: r.message };
    const pass = r.status === 400 && String(r.code || '').includes('HRM-YCTD-VAL-400');
    ac('L1-TM-GARBAGE-BAD', pass ? 'PASS' : 'FAIL', {
      summary: `target_month=not-a-date → ${r.status} ${r.code}`,
      ...L.GARBAGE_BAD,
    });
    if (!pass)
      defect(
        'R-REC-02-TARGET-MONTH-DATE',
        'P2',
        `garbage not-a-date: ${JSON.stringify(L.GARBAGE_BAD)}`,
      );
  }

  // 4) omit target_month → 2xx draft (FE path RETAIN)
  {
    const body = baseOutBody(jdId, `QA TM OMIT ${STAMP}`);
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', body);
    const returned = normalizeReturnedMonth(r.data?.target_month);
    L.OMIT = {
      status: r.status,
      code: r.code,
      id: r.data?.id,
      reqStatus: r.data?.status,
      target_month: returned,
    };
    const pass =
      r.status >= 200 &&
      r.status < 300 &&
      r.data?.status === 'draft' &&
      (returned == null || returned === '');
    ac('L1-TM-OMIT', pass ? 'PASS' : 'FAIL', {
      summary: `omit target_month → ${r.status} ${r.code} status=${r.data?.status} tm=${returned}`,
      ...L.OMIT,
    });
    if (!pass) defect('R-REC-02-TARGET-MONTH-OMIT', 'P1', `omit path broken: ${JSON.stringify(L.OMIT)}`);
    R.fixtures.omitDraftId = r.data?.id;
  }

  R.l1.target_month = L;
  save();
}

async function runMustKeep(token, fx) {
  const L = {};
  const jdId = fx.jd?.id;

  // SPAWN-DUP
  if (fx.occupied[0]) {
    const occ = fx.occupied[0];
    const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', {
      company_id: COMPANY,
      title: `QA MK SPAWN-DUP ${STAMP}`,
      department: 'HCNS',
      employment_type: 'full_time',
      headcount: 1,
      headcount_mode: 'in_plan',
      headcount_cell_id: occ.cell_id,
      hire_reason: 'new',
      job_template_id: jdId,
      recruitment_plan_id: occ.planId,
    });
    L.SPAWN_DUP = { status: r.status, code: r.code, message: r.message, cell: occ.cell_id };
    const pass = r.status === 409 && /SPAWN-DUP|YCTD/.test(String(r.code || ''));
    ac('L1-MK-SPAWN-DUP', pass ? 'PASS' : 'FAIL', {
      summary: `SPAWN-DUP → ${r.status} ${r.code}`,
      ...L.SPAWN_DUP,
    });
    if (!pass) defect('R-REC-02-SPAWN-DUP-REGRESS', 'P1', `SPAWN-DUP regress: ${JSON.stringify(L.SPAWN_DUP)}`);
  } else {
    ac('L1-MK-SPAWN-DUP', 'NOTE_BLOCKED', { summary: 'No occupied in_plan cell (zero-seed)' });
  }

  // CELL-QTY — prefer free cell; if none, occupied+qty>need (qty gate runs before spawn UQ)
  {
    const cell = fx.free[0] || fx.occupied[0] || fx.locked;
    if (cell) {
      const hc = Math.max(999, (cell.need || 1) + 50);
      const r = await api(token, 'POST', '/api/hrm/recruitment/requisitions', {
        company_id: COMPANY,
        title: `QA MK CELL-QTY ${STAMP}`,
        department: 'HCNS',
        employment_type: 'full_time',
        headcount: hc,
        headcount_mode: 'in_plan',
        headcount_cell_id: cell.cell_id,
        hire_reason: 'new',
        job_template_id: jdId,
        recruitment_plan_id: cell.planId,
      });
      L.CELL_QTY = {
        status: r.status,
        code: r.code,
        message: r.message,
        headcount: hc,
        cell: cell.cell_id,
        via: fx.free[0] ? 'free' : 'occupied-qty-before-spawn',
      };
      const pass = r.status === 409 && String(r.code || '').includes('HRM-YCTD-CELL-QTY');
      ac('L1-MK-CELL-QTY', pass ? 'PASS' : 'FAIL', {
        summary: `CELL-QTY → ${r.status} ${r.code} via=${L.CELL_QTY.via}`,
        ...L.CELL_QTY,
      });
      if (!pass) defect('R-REC-02-CELL-QTY-REGRESS', 'P1', `CELL-QTY regress: ${JSON.stringify(L.CELL_QTY)}`);
    } else {
      ac('L1-MK-CELL-QTY', 'NOTE_BLOCKED', { summary: 'No cell for CELL-QTY (zero-seed)' });
    }
  }

  // MODE-UNCLASSIFIED
  if (fx.nullMode[0]) {
    const legacy = fx.nullMode[0];
    const r = await api(
      token,
      'PATCH',
      `/api/hrm/recruitment/requisitions/${legacy.id}/pipeline-flags?company_id=${COMPANY}`,
      { posted: true, cv_intake_allowed: true },
    );
    L.MODE_UNCLASSIFIED = { status: r.status, code: r.code, message: r.message, id: legacy.id };
    const pass = r.status === 409 && String(r.code || '').includes('HRM-YCTD-MODE-UNCLASSIFIED');
    ac('L1-MK-MODE-UNCLASSIFIED', pass ? 'PASS' : 'FAIL', {
      summary: `MODE-UNCLASSIFIED → ${r.status} ${r.code}`,
      ...L.MODE_UNCLASSIFIED,
    });
    if (!pass)
      defect(
        'R-REC-02-MODE-UNCLASSIFIED-REGRESS',
        'P1',
        `O4 regress: ${JSON.stringify(L.MODE_UNCLASSIFIED)}`,
      );
  } else {
    ac('L1-MK-MODE-UNCLASSIFIED', 'NOTE_BLOCKED', {
      summary: 'No legacy NULL headcount_mode row',
    });
  }

  // HRM-HC-CELL-LOCKED no-wipe (REC-01 retain smoke)
  if (fx.locked) {
    const planId = fx.locked.planId;
    const before = await api(
      token,
      'GET',
      `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
    );
    const beforeCells = extractCells(before.data || {}).filter(
      (c) => (c.lifecycle_status || c.lifecycle) === 'need_hire_approved',
    );
    const target = beforeCells.find((c) => c.cell_id === fx.locked.cell_id) || beforeCells[0];
    const beforeNeed = Number(target?.headcount_need_hire || target?.need_hire || 0);
    const beforeCount = beforeCells.length;

    // Minimal PUT that would bump locked cell — expect 409 without wipe
    // Prefer reusing plan structure from GET if present
    const depts = before.data?.departments || before.data?.items || [];
    let putBody = null;
    if (Array.isArray(depts) && depts.length > 0) {
      // Deep clone and bump one locked need_hire
      putBody = {
        company_id: COMPANY,
        title: before.data?.title,
        year: before.data?.year || 2026,
        departments: JSON.parse(JSON.stringify(depts)).map((d) => {
          const positions = (d.positions || []).map((p) => {
            const months = (p.months || []).map((m) => {
              if (m.cell_id === (target?.cell_id || fx.locked.cell_id)) {
                return {
                  ...m,
                  headcount_need_hire: beforeNeed + 2,
                  need_hire: beforeNeed + 2,
                };
              }
              return m;
            });
            return { ...p, months };
          });
          return { ...d, positions };
        }),
      };
    }

    let putLocked = { status: 0, code: 'SKIP', message: 'no departments shape' };
    if (putBody) {
      putLocked = await api(token, 'PUT', `/api/hrm/recruitment/recruitment-plans/${planId}`, putBody);
    }

    const after = await api(
      token,
      'GET',
      `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
    );
    const afterCells = extractCells(after.data || {}).filter(
      (c) => (c.lifecycle_status || c.lifecycle) === 'need_hire_approved',
    );
    const afterTarget =
      afterCells.find((c) => c.cell_id === (target?.cell_id || fx.locked.cell_id)) || afterCells[0];
    const afterNeed = Number(afterTarget?.headcount_need_hire || afterTarget?.need_hire || 0);
    const sameCell =
      afterTarget?.cell_id === (target?.cell_id || fx.locked.cell_id) && afterNeed === beforeNeed;
    const gridIntact = afterCells.length >= beforeCount && afterCells.length >= 1;
    const codeOk =
      putBody == null
        ? false
        : putLocked.status === 409 && String(putLocked.code || '') === 'HRM-HC-CELL-LOCKED';
    L.CELL_LOCKED = {
      status: putLocked.status,
      code: putLocked.code,
      message: putLocked.message,
      beforeNeed,
      afterNeed,
      beforeCount,
      afterCount: afterCells.length,
      sameCell,
      gridIntact,
      planId,
      cell_id: target?.cell_id || fx.locked.cell_id,
    };
    const pass = codeOk && sameCell && gridIntact;
    ac('L1-MK-CELL-LOCKED-NO-WIPE', pass ? 'PASS' : putBody == null ? 'NOTE_BLOCKED' : 'FAIL', {
      summary: putBody
        ? `CELL-LOCKED → ${putLocked.status} ${putLocked.code}; sameCell=${sameCell} gridIntact=${gridIntact}`
        : 'Plan GET lacked departments shape for PUT probe',
      ...L.CELL_LOCKED,
    });
    if (putBody && !pass)
      defect(
        'R-REC-HC-PUT-LOCKED-WIPE',
        'P0',
        `CELL-LOCKED smoke fail: ${JSON.stringify(L.CELL_LOCKED)}`,
      );
  } else {
    ac('L1-MK-CELL-LOCKED-NO-WIPE', 'NOTE_BLOCKED', {
      summary: 'No need_hire_approved locked cell found',
    });
  }

  R.l1.must_keep = L;
  save();
}

async function main() {
  log(`start ${STAMP}`);
  // wait for hrm-api up to 45s
  for (let i = 0; i < 45; i++) {
    try {
      const r = await fetch(`${HRM}/api/hrm`);
      if (r.status === 200) break;
    } catch {
      /* */
    }
    await sleep(1000);
  }

  const l0ok = await runL0();
  if (!l0ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.residual_close = { id: 'R-REC-02-TARGET-MONTH-DATE', closable: false, reason: 'L0 FAIL' };
    R.endedAt = ts();
    save();
    process.exit(2);
  }

  const token = await loginApi();
  log('login ok');
  const fx = await loadFixtures(token);
  log('fixtures', {
    free: fx.free.length,
    occupied: fx.occupied.length,
    nullMode: fx.nullMode.length,
    jd: !!fx.jd,
  });

  if (!fx.jd?.id) {
    defect('R-REC-02-TM-NO-JD', 'P1', 'No job template for create probes');
  } else {
    await runTargetMonthCases(token, fx.jd.id);
  }
  await runMustKeep(token, fx);

  const required = [
    'L1-TM-YYYY-MM',
    'L1-TM-YYYY-MM-01',
    'L1-TM-GARBAGE-8',
    'L1-TM-OMIT',
  ];
  const reqPass = required.every((k) => R.ac[k]?.verdict === 'PASS');
  const mkKeys = Object.keys(R.ac).filter((k) => k.startsWith('L1-MK-'));
  const mkFail = mkKeys.some((k) => R.ac[k]?.verdict === 'FAIL');
  const p0 = R.defects.some((d) => d.severity === 'P0');

  const closable = reqPass && !p0 && !mkFail;
  R.residual_close = {
    id: 'R-REC-02-TARGET-MONTH-DATE',
    closable,
    state: closable ? 'CLOSED' : 'OPEN',
    reason: closable
      ? 'L1 YYYY-MM→first-day · YYYY-MM-01 · garbage→400 VAL-400 · omit→draft; must_keep no FAIL'
      : `reqPass=${reqPass} mkFail=${mkFail} p0=${p0}`,
  };

  R.overall = closable ? 'PASS' : 'FAIL';
  R.ack_status = closable ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        residual_close: R.residual_close,
        ac: Object.fromEntries(Object.entries(R.ac).map(([k, v]) => [k, v.verdict])),
        defects: R.defects,
      },
      null,
      2,
    ),
  );
  process.exit(closable ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  process.exit(1);
});
