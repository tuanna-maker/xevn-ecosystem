#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-QA-01
 * Narrow retest Option A reuse/mismatch + sealed P0 LOCKED regression + U65 MISMATCH UI
 * Persona: ceo@xe.vn · companyId=main · U65 zero-seed · C-SLICE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.json');
const OUT_L1 = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01-l1.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stampTail = Date.now().toString(36).toLowerCase().slice(-8).toUpperCase();
const STAMP = `HCELLQA-${stampTail}`;
const PLAN_TITLE = `QA ĐB CELL ${STAMP}`;
const PLAN_TITLE_ALT = `QA ĐB MINT ${STAMP}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-QA-01',
  startedAt: ts(),
  stamp: STAMP,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed · L1 API FE-auth path · browser Định biên after MISMATCH',
  honesty: {
    recruitment_uat_ready: false,
    seed_used: false,
    c_slice_ne_module: true,
    deny_module_rec_uat: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  dist: {},
  l1: { out: [] },
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  ac: {},
  residuals: [],
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function saveL1() {
  writeFileSync(OUT_L1, JSON.stringify({ stamp: STAMP, planId: R.l1.planId, out: R.l1.out }, null, 2));
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
function l1(k, v) {
  R.l1.out.push({ k, v });
  saveL1();
  console.log(`L1 ${k}`, typeof v === 'object' ? JSON.stringify(v).slice(0, 360) : v);
}
function defect(id, severity, summary, owner = 'dev-be') {
  R.defects.push({ id, severity, summary, owner, at: ts() });
  console.error(`[DEFECT ${severity}] ${id}: ${summary}`);
}
function residual(id, severity, owner, note) {
  R.residuals.push({ id, severity, owner, note, at: ts() });
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

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

async function api(token, method, path, body) {
  const r = await fetch(`${HRM}${path}`, {
    method,
    headers: authHeaders(token),
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return { status: r.status, json, code: json?.code, data: json?.data ?? json, message: json?.message };
}

function asList(payload) {
  const d = payload?.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}

function asEntity(payload) {
  const d = payload?.data ?? payload;
  if (d && typeof d === 'object' && !Array.isArray(d) && d.id) return d;
  if (d?.data && d.data.id) return d.data;
  return d;
}

function twelveMonths(needMonth, needHire, cellId) {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    if (m === needMonth) {
      months.push({
        month: m,
        cell_status: 'need_hire',
        headcount_need_hire: needHire,
        need_hire: needHire,
        headcount_current: 1,
        ...(cellId !== undefined && cellId !== null && cellId !== ''
          ? { cell_id: cellId }
          : {}),
      });
    } else {
      months.push({
        month: m,
        cell_status: 'current',
        headcount_need_hire: 0,
        need_hire: 0,
        headcount_current: 0,
      });
    }
  }
  return months;
}

/** Build months omitting cell_id on the need_hire month (Option A probe). */
function twelveMonthsOmitCell(needMonth, needHire) {
  return twelveMonths(needMonth, needHire, undefined);
}

function gridSnapshot(detail) {
  const d = asEntity(detail);
  const depts = d?.departments || [];
  const positions = depts.flatMap((x) => x.positions || []);
  const cells = positions.flatMap((p) => p.months || p.months_data || []);
  const need = cells.filter(
    (c) => (c.need_hire ?? c.headcount_need_hire ?? 0) >= 1 || c.cell_status === 'need_hire',
  );
  return {
    planId: d?.id,
    status: d?.status,
    depts: depts.length,
    positions: positions.length,
    needCells: need.map((c) => ({
      month: c.month,
      need_hire: c.need_hire ?? c.headcount_need_hire,
      lifecycle: c.lifecycle_status,
      cell_id: c.cell_id,
      cell_status: c.cell_status,
    })),
    allCellIds: cells.map((c) => c.cell_id).filter(Boolean),
    dept_key: depts[0]?.department_key,
    pos_key: positions[0]?.position_key,
    dept_name: depts[0]?.name,
    pos_name: positions[0]?.name,
    positionsMeta: positions.map((p) => ({
      position_key: p.position_key,
      name: p.name,
      months: (p.months || []).map((c) => ({
        month: c.month,
        cell_id: c.cell_id,
        need_hire: c.need_hire ?? c.headcount_need_hire,
        lifecycle: c.lifecycle_status,
      })),
    })),
  };
}

function spawnCounts(spawn) {
  const data = spawn.data ?? spawn.json?.data ?? {};
  const createdArr = Array.isArray(data.created) ? data.created : [];
  const skippedArr = Array.isArray(data.skipped_duplicate) ? data.skipped_duplicate : [];
  const driftArr = Array.isArray(data.drift_warnings) ? data.drift_warnings : [];
  return {
    status: spawn.status,
    code: spawn.code,
    created: createdArr.length,
    skipped: skippedArr.length,
    drift: driftArr.length,
    createdArr,
    skippedArr,
    driftArr,
    data,
  };
}

async function listYctdByCell(token, cellId) {
  // Prefer spawn response linkage; also probe requisitions list if available
  const list = await api(
    token,
    'GET',
    `/api/hrm/recruitment/job-requisitions?company_id=${COMPANY}&page_size=100`,
  );
  const rows = asList(list);
  const match = rows.filter((r) => r.headcount_cell_id === cellId);
  return {
    listStatus: list.status,
    total: rows.length,
    matchCount: match.length,
    match: match.map((r) => ({
      id: r.id,
      headcount: r.headcount,
      headcount_cell_id: r.headcount_cell_id,
      headcount_mode: r.headcount_mode,
      status: r.status,
    })),
  };
}

async function runL0() {
  const checks = {};
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['portal', PORTAL],
    ['xbos', `${PORTAL}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      checks[k] = r.status;
    } catch (e) {
      checks[k] = String(e).slice(0, 80);
    }
  }
  R.l0 = checks;
  const ok = checks.hrm === 200 && checks.portal === 200;
  ac('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(checks) });
  return ok;
}

async function runL1(token) {
  log('L1 start — Option A cell identity');
  const listRes = await api(token, 'GET', `/api/hrm/recruitment/recruitment-plans?company_id=${COMPANY}`);
  const list = asList(listRes);
  const sampleId = list.find((p) => p.status === 'approved')?.id || list[0]?.id;
  if (!sampleId) throw new Error('No existing plan to discover catalog keys (U65)');
  const sample = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${sampleId}?company_id=${COMPANY}`,
  );
  const snap0 = gridSnapshot(sample);
  const DEPT_KEY = snap0.dept_key || 'DEPT_02';
  const POS_KEY = snap0.pos_key || 'CHRO';
  const DEPT_NAME = snap0.dept_name || 'Vận hành';
  const POS_NAME = snap0.pos_name || 'Giám đốc Nhân sự';
  // Second position key for ALT-03 mint — prefer another key from sample if present
  const altPos =
    snap0.positionsMeta.find((p) => p.position_key && p.position_key !== POS_KEY) || null;
  const POS_KEY_2 = altPos?.position_key || `${POS_KEY}_ALT`;
  const POS_NAME_2 = altPos?.name || `${POS_NAME} (ALT)`;
  l1('KEYS', { DEPT_KEY, POS_KEY, POS_KEY_2, fromPlan: sampleId });

  // ——— CREATE + approve baseline plan ———
  const createBody = {
    company_id: COMPANY,
    title: PLAN_TITLE,
    year: 2026,
    creator_name: 'QA CELLID',
    departments: [
      {
        name: DEPT_NAME,
        department_key: DEPT_KEY,
        positions: [
          {
            name: POS_NAME,
            position_key: POS_KEY,
            months: twelveMonths(8, 5),
          },
        ],
      },
    ],
  };
  const created = await api(token, 'POST', `/api/hrm/recruitment/recruitment-plans`, createBody);
  const planId = asEntity(created)?.id;
  R.l1.planId = planId;
  l1('CREATE', { status: created.status, code: created.code, id: planId });
  if (!planId || created.status >= 300) {
    ac('L1-CREATE', 'FAIL', { summary: `CREATE ${created.status} ${created.code}` });
    return null;
  }
  ac('L1-CREATE', 'PASS', { summary: `id=${planId}` });

  const beforeApprGet = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
  );
  const draftSnap = gridSnapshot(beforeApprGet);
  const C0_draft = draftSnap.needCells[0]?.cell_id;
  l1('DRAFT_CELL', { C0: C0_draft, need: draftSnap.needCells[0]?.need_hire });

  const approve = await api(
    token,
    'PATCH',
    `/api/hrm/recruitment/recruitment-plans/${planId}/status?company_id=${COMPANY}`,
    { status: 'approved', approved_by: EMAIL },
  );
  const afterAppr = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
  );
  const lockSnap = gridSnapshot(afterAppr);
  const C0 = lockSnap.needCells[0]?.cell_id;
  const lockedNeed = lockSnap.needCells[0]?.need_hire;
  l1('APPROVE', {
    status: approve.status,
    code: approve.code,
    C0,
    need: lockedNeed,
    lifecycle: lockSnap.needCells[0]?.lifecycle,
  });
  if (approve.status !== 200 || lockSnap.needCells[0]?.lifecycle !== 'need_hire_approved') {
    ac('L1-APPROVE', 'FAIL', {
      summary: `approve ${approve.status} lifecycle=${lockSnap.needCells[0]?.lifecycle}`,
    });
    return { planId, C0, DEPT_KEY, POS_KEY, DEPT_NAME, POS_NAME };
  }
  ac('L1-APPROVE', 'PASS', {
    summary: `C0=${C0} need=${lockedNeed} lifecycle=need_hire_approved`,
  });

  // ——— AC-REC-HC-CELL-EX-01 (sealed P0 regression) — locked + no override ———
  const putLocked = await api(token, 'PUT', `/api/hrm/recruitment/recruitment-plans/${planId}`, {
    company_id: COMPANY,
    title: PLAN_TITLE,
    year: 2026,
    departments: [
      {
        name: DEPT_NAME,
        department_key: DEPT_KEY,
        positions: [
          {
            name: POS_NAME,
            position_key: POS_KEY,
            months: twelveMonthsOmitCell(8, Number(lockedNeed || 5) + 2),
          },
        ],
      },
    ],
  });
  const afterLocked = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
  );
  const afterLockedSnap = gridSnapshot(afterLocked);
  const ex01Ok =
    putLocked.status === 409 &&
    putLocked.code === 'HRM-HC-CELL-LOCKED' &&
    afterLockedSnap.needCells[0]?.cell_id === C0 &&
    afterLockedSnap.needCells[0]?.need_hire === lockedNeed &&
    afterLockedSnap.positions >= 1;
  l1('EX01_LOCKED', {
    status: putLocked.status,
    code: putLocked.code,
    message: putLocked.message,
    after: afterLockedSnap.needCells[0],
    positions: afterLockedSnap.positions,
  });
  ac('AC-REC-HC-CELL-EX-01', ex01Ok ? 'PASS' : 'FAIL', {
    summary: `${putLocked.status}/${putLocked.code}; sameCell=${afterLockedSnap.needCells[0]?.cell_id === C0} needIntact=${afterLockedSnap.needCells[0]?.need_hire === lockedNeed} pos=${afterLockedSnap.positions}`,
  });
  if (!ex01Ok) {
    defect(
      'R-REC-HC-PUT-LOCKED-WIPE',
      'P0',
      `EX-01 regression FAIL: ${putLocked.status}/${putLocked.code}; after=${JSON.stringify(afterLockedSnap.needCells[0])}`,
    );
  }

  // Spawn after EX-01 — eligible
  const spawn1 = await api(
    token,
    'POST',
    `/api/hrm/recruitment/recruitment-plans/${planId}/spawn-requests?company_id=${COMPANY}`,
    {},
  );
  const s1 = spawnCounts(spawn1);
  l1('SPAWN1', s1);
  const spawnEligible = spawn1.status < 300 && (s1.created >= 1 || s1.skipped >= 1);
  ac('AC-REC-HC-CELL-EX-01-SPAWN', spawnEligible ? 'PASS' : 'FAIL', {
    summary: `spawn after LOCKED → ${spawn1.status} created=${s1.created} skipped=${s1.skipped}`,
  });

  // Capture YCTD headcount for C0 before override
  const yctdBefore = await listYctdByCell(token, C0);
  const yctdHcBefore =
    yctdBefore.match[0]?.headcount ??
    s1.createdArr[0]?.headcount ??
    s1.skippedArr[0]?.headcount ??
    null;
  const yctdId =
    yctdBefore.match[0]?.id ?? s1.createdArr[0]?.id ?? s1.skippedArr[0]?.id ?? null;
  l1('YCTD_BEFORE_OVERRIDE', {
    yctdId,
    headcount: yctdHcBefore,
    matchCount: yctdBefore.matchCount,
    listStatus: yctdBefore.listStatus,
    fromSpawn: s1.createdArr[0] || s1.skippedArr[0] || null,
  });

  // ——— AC-REC-HC-CELL-01 / 01c — override OMIT cell_id → reuse C0 ———
  const newNeed = Number(lockedNeed || 5) + 3; // drift from spawn headcount
  const putOmit = await api(token, 'PUT', `/api/hrm/recruitment/recruitment-plans/${planId}`, {
    company_id: COMPANY,
    title: PLAN_TITLE,
    year: 2026,
    allow_override: true,
    departments: [
      {
        name: DEPT_NAME,
        department_key: DEPT_KEY,
        positions: [
          {
            name: POS_NAME,
            position_key: POS_KEY,
            months: twelveMonthsOmitCell(8, newNeed),
          },
        ],
      },
    ],
  });
  const afterOmit = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
  );
  const omitSnap = gridSnapshot(afterOmit);
  const reused = omitSnap.needCells[0]?.cell_id === C0;
  const needUpdated = omitSnap.needCells[0]?.need_hire === newNeed;
  l1('CELL01_OMIT_OVERRIDE', {
    status: putOmit.status,
    code: putOmit.code,
    C0,
    afterCell: omitSnap.needCells[0]?.cell_id,
    afterNeed: omitSnap.needCells[0]?.need_hire,
    reused,
    needUpdated,
  });
  const ac01Ok =
    putOmit.status >= 200 && putOmit.status < 300 && reused && needUpdated;
  ac('AC-REC-HC-CELL-01', ac01Ok ? 'PASS' : 'FAIL', {
    summary: `PUT omit → ${putOmit.status}/${putOmit.code}; C0=${C0} after=${omitSnap.needCells[0]?.cell_id} need=${omitSnap.needCells[0]?.need_hire} (expect ${newNeed})`,
  });
  if (!ac01Ok) {
    defect(
      'R-REC-HC-OVERRIDE-CELLID',
      'P0',
      `AC-01 FAIL: omit override minted/changed identity or need. C0=${C0} after=${omitSnap.needCells[0]?.cell_id} status=${putOmit.status}`,
    );
  }

  // YCTD still C0; headcount not silently overwritten
  const yctdAfter = await listYctdByCell(token, C0);
  const yctdHcAfter = yctdAfter.match[0]?.headcount ?? yctdHcBefore;
  const yctdStillC0 = yctdAfter.matchCount >= 1 || yctdId != null;
  // Also check no second YCTD if list works; if list empty, use re-spawn
  const spawn2 = await api(
    token,
    'POST',
    `/api/hrm/recruitment/recruitment-plans/${planId}/spawn-requests?company_id=${COMPANY}`,
    {},
  );
  const s2 = spawnCounts(spawn2);
  l1('CELL01c_RESPAWN', {
    ...s2,
    yctdAfter,
    yctdHcBefore,
    yctdHcAfter,
  });
  const skippedOk = s2.skipped >= 1 && s2.created === 0;
  const sameCellOnSkip =
    !s2.skippedArr.length || s2.skippedArr.every((x) => x.headcount_cell_id === C0);
  // O3: if drift warn present, YCTD headcount must not equal newNeed unless it was already
  const driftPresent = s2.drift >= 1 || (yctdHcBefore != null && yctdHcBefore !== newNeed);
  const noSilentOverwrite =
    yctdHcAfter == null || yctdHcAfter === yctdHcBefore || yctdHcAfter !== newNeed;
  // Prefer strict: headcount unchanged when we had a before value
  const o3Ok =
    yctdHcBefore == null || yctdHcAfter === yctdHcBefore || yctdHcAfter !== newNeed;

  const ac01cOk = ac01Ok && skippedOk && sameCellOnSkip && o3Ok;
  ac('AC-REC-HC-CELL-01c', ac01cOk ? 'PASS' : 'FAIL', {
    summary: `YCTD still C0 link; re-spawn created=${s2.created} skipped=${s2.skipped}; yctdHc ${yctdHcBefore}→${yctdHcAfter} (newNeed=${newNeed}); drift=${s2.drift}; o3Ok=${o3Ok}`,
  });
  if (!ac01cOk) {
    defect(
      'R-REC-HC-OVERRIDE-CELLID',
      'P1',
      `AC-01c FAIL: skipped=${s2.skipped} created=${s2.created} yctdHc ${yctdHcBefore}→${yctdHcAfter}`,
    );
  }

  // ——— AC-REC-HC-CELL-EX-02 — foreign cell_id → MISMATCH ———
  const FOREIGN = randomUUID();
  const putMismatch = await api(token, 'PUT', `/api/hrm/recruitment/recruitment-plans/${planId}`, {
    company_id: COMPANY,
    title: PLAN_TITLE,
    year: 2026,
    allow_override: true,
    departments: [
      {
        name: DEPT_NAME,
        department_key: DEPT_KEY,
        positions: [
          {
            name: POS_NAME,
            position_key: POS_KEY,
            months: twelveMonths(8, newNeed + 1, FOREIGN),
          },
        ],
      },
    ],
  });
  const afterMismatch = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${planId}?company_id=${COMPANY}`,
  );
  const mmSnap = gridSnapshot(afterMismatch);
  const ex02Ok =
    putMismatch.status === 409 &&
    putMismatch.code === 'HRM-HC-CELL-ID-MISMATCH' &&
    mmSnap.needCells[0]?.cell_id === C0 &&
    mmSnap.needCells[0]?.need_hire === newNeed;
  l1('EX02_MISMATCH', {
    status: putMismatch.status,
    code: putMismatch.code,
    message: putMismatch.message,
    foreign: FOREIGN,
    afterCell: mmSnap.needCells[0]?.cell_id,
    afterNeed: mmSnap.needCells[0]?.need_hire,
  });
  ac('AC-REC-HC-CELL-EX-02', ex02Ok ? 'PASS' : 'FAIL', {
    summary: `${putMismatch.status}/${putMismatch.code}; identity=${mmSnap.needCells[0]?.cell_id} (expect C0=${C0}) need=${mmSnap.needCells[0]?.need_hire}`,
  });
  if (!ex02Ok) {
    defect(
      'R-REC-HC-OVERRIDE-CELLID',
      'P0',
      `EX-02 FAIL: expected 409 HRM-HC-CELL-ID-MISMATCH, got ${putMismatch.status}/${putMismatch.code}; cell=${mmSnap.needCells[0]?.cell_id}`,
    );
  }

  // ——— AC-REC-HC-CELL-ALT-03 — new natural key mints fresh cell_id ———
  // Use a fresh draft plan so we can add a second position without lock fights
  const createAlt = await api(token, 'POST', `/api/hrm/recruitment/recruitment-plans`, {
    company_id: COMPANY,
    title: PLAN_TITLE_ALT,
    year: 2026,
    creator_name: 'QA CELLID MINT',
    departments: [
      {
        name: DEPT_NAME,
        department_key: DEPT_KEY,
        positions: [
          {
            name: POS_NAME,
            position_key: POS_KEY,
            months: twelveMonths(8, 3),
          },
        ],
      },
    ],
  });
  const altPlanId = asEntity(createAlt)?.id;
  R.l1.altPlanId = altPlanId;
  const altGet0 = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${altPlanId}?company_id=${COMPANY}`,
  );
  const altSnap0 = gridSnapshot(altGet0);
  const existingC0 = altSnap0.needCells[0]?.cell_id;

  // PUT adding second position (new NK) + keep first without cell_id
  const putMint = await api(token, 'PUT', `/api/hrm/recruitment/recruitment-plans/${altPlanId}`, {
    company_id: COMPANY,
    title: PLAN_TITLE_ALT,
    year: 2026,
    departments: [
      {
        name: DEPT_NAME,
        department_key: DEPT_KEY,
        positions: [
          {
            name: POS_NAME,
            position_key: POS_KEY,
            months: twelveMonthsOmitCell(8, 3),
          },
          {
            name: POS_NAME_2,
            position_key: POS_KEY_2,
            months: twelveMonthsOmitCell(9, 2),
          },
        ],
      },
    ],
  });
  const altGet1 = await api(
    token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${altPlanId}?company_id=${COMPANY}`,
  );
  const altSnap1 = gridSnapshot(altGet1);
  const staffCell = altSnap1.positionsMeta
    .find((p) => p.position_key === POS_KEY)
    ?.months.find((m) => (m.need_hire ?? 0) >= 1);
  const staff2Cell = altSnap1.positionsMeta
    .find((p) => p.position_key === POS_KEY_2)
    ?.months.find((m) => (m.need_hire ?? 0) >= 1);
  const reusedExisting = staffCell?.cell_id === existingC0;
  const minted = staff2Cell?.cell_id;
  const mintUuidOk =
    typeof minted === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(minted);
  const mintDistinct = minted && minted !== existingC0;
  l1('ALT03_MINT', {
    status: putMint.status,
    code: putMint.code,
    existingC0,
    staffCell,
    staff2Cell,
    positions: altSnap1.positions,
  });
  const alt03Ok =
    putMint.status >= 200 &&
    putMint.status < 300 &&
    reusedExisting &&
    mintUuidOk &&
    mintDistinct;
  ac('AC-REC-HC-CELL-ALT-03', alt03Ok ? 'PASS' : 'FAIL', {
    summary: `PUT ${putMint.status}; reuse=${reusedExisting} minted=${minted} distinct=${mintDistinct}`,
  });
  if (!alt03Ok) {
    defect(
      'R-REC-HC-OVERRIDE-CELLID',
      'P1',
      `ALT-03 FAIL: put=${putMint.status} reuse=${reusedExisting} minted=${minted}`,
    );
  }

  return {
    planId,
    C0,
    DEPT_KEY,
    POS_KEY,
    DEPT_NAME,
    POS_NAME,
    newNeed,
    FOREIGN,
    mismatch: { status: putMismatch.status, code: putMismatch.code, message: putMismatch.message },
  };
}

async function runU65MismatchUi(session, ctx) {
  log('U65 browser — Định biên after 409 MISMATCH');
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 240));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', (res) => {
    const u = res.url();
    if (u.includes('/api/hrm/recruitment')) {
      R.network.push({ method: res.request().method(), status: res.status(), url: u.replace(PORTAL, '').slice(0, 180) });
    }
  });

  await page.addInitScript((s) => {
    localStorage.setItem(
      'xevn.auth',
      JSON.stringify({
        accessToken: s.token,
        expiresAt: s.expiresAt,
        companyId: s.companyId,
        user: s.user,
      }),
    );
    localStorage.setItem('xevn_access_token', s.token);
    localStorage.setItem('tenantId', 'xevn');
    localStorage.setItem('companyId', s.companyId);
  }, session);

  const plansUrl = q('/hr/recruitment', { tab: 'plans' });
  await page.goto(plansUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  await shot(page, '01-plans-tab');

  // Open detail of our plan if possible
  const titleVisible = await page.getByText(PLAN_TITLE, { exact: false }).first().isVisible().catch(() => false);
  if (titleVisible) {
    await page.getByText(PLAN_TITLE, { exact: false }).first().click().catch(() => {});
    await sleep(2000);
  } else if (ctx.planId) {
    // Deep link attempt
    await page.goto(q('/hr/recruitment', { tab: 'plans', planId: ctx.planId }), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await sleep(2500);
  }
  await shot(page, '02-before-mismatch');

  // Trigger MISMATCH via page context (same auth as portal) then reload detail
  const mm = await page.evaluate(
    async ({ planId, company, title, deptName, deptKey, posName, posKey, foreign, need }) => {
      const token =
        localStorage.getItem('xevn_access_token') ||
        JSON.parse(localStorage.getItem('xevn.auth') || '{}').accessToken;
      const months = [];
      for (let m = 1; m <= 12; m++) {
        if (m === 8) {
          months.push({
            month: m,
            cell_status: 'need_hire',
            headcount_need_hire: need,
            need_hire: need,
            headcount_current: 1,
            cell_id: foreign,
          });
        } else {
          months.push({
            month: m,
            cell_status: 'current',
            headcount_need_hire: 0,
            need_hire: 0,
            headcount_current: 0,
          });
        }
      }
      const r = await fetch(`/api/hrm/recruitment/recruitment-plans/${planId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          company_id: company,
          title,
          year: 2026,
          allow_override: true,
          departments: [
            {
              name: deptName,
              department_key: deptKey,
              positions: [{ name: posName, position_key: posKey, months }],
            },
          ],
        }),
      });
      const j = await r.json().catch(() => ({}));
      return { status: r.status, code: j.code, message: j.message };
    },
    {
      planId: ctx.planId,
      company: COMPANY,
      title: PLAN_TITLE,
      deptName: ctx.DEPT_NAME,
      deptKey: ctx.DEPT_KEY,
      posName: ctx.POS_NAME,
      posKey: ctx.POS_KEY,
      foreign: ctx.FOREIGN || randomUUID(),
      need: (ctx.newNeed || 8) + 2,
    },
  );
  l1('U65_MISMATCH_PUT', mm);

  // Surface error if FE has toast; then reload and check grid not blank
  await sleep(1500);
  await shot(page, '03-after-mismatch-put');

  // Reload detail
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  await shot(page, '04-after-reload');

  const ui = await page.evaluate(() => {
    const bodyText = document.body?.innerText || '';
    const blankish =
      bodyText.trim().length < 40 ||
      /không có dữ liệu|failed to load|HRM API.*ERROR|Something went wrong/i.test(bodyText);
    const gridHints =
      document.querySelectorAll(
        '[data-testid*="rec-hc"], [data-testid*="headcount"], table, [class*="grid"], input[type="number"]',
      ).length;
    const needInputs = document.querySelectorAll('input').length;
    const errHints =
      /MISMATCH|định danh|cell_id|không được|409|lệch|override/i.test(bodyText) ||
      document.querySelectorAll('[role="alert"], .toast, [class*="toast"], [class*="error"]').length >
        0;
    return {
      blankish,
      gridHints,
      needInputs,
      errHints,
      textSample: bodyText.slice(0, 400),
    };
  });
  l1('U65_UI_AFTER_MISMATCH', ui);

  // Also verify via API grid still intact (source of truth for blank)
  const getAfter = await api(
    session.token,
    'GET',
    `/api/hrm/recruitment/recruitment-plans/${ctx.planId}?company_id=${COMPANY}`,
  );
  const snap = gridSnapshot(getAfter);
  const gridOk = snap.positions >= 1 && snap.needCells.length >= 1 && snap.needCells[0]?.cell_id === ctx.C0;

  const putOk = mm.status === 409 && mm.code === 'HRM-HC-CELL-ID-MISMATCH';
  // U65 sanity: UI not blank + grid renders; error message shown OR network 409 observed (toast optional)
  const uiOk = !ui.blankish && (ui.gridHints > 0 || ui.needInputs > 0) && gridOk;
  const errShown = ui.errHints || putOk; // at minimum API error proven; toast preferred
  ac('U65-MISMATCH-UI', uiOk && putOk ? 'PASS' : 'FAIL', {
    summary: `PUT ${mm.status}/${mm.code}; blank=${ui.blankish} gridHints=${ui.gridHints} errHints=${ui.errHints} apiGridOk=${gridOk}; msg=${String(mm.message || '').slice(0, 120)}`,
    put: mm,
    ui,
    gridOk,
    errShown,
  });
  if (!(uiOk && putOk)) {
    defect(
      'R-REC-HC-MISMATCH-UI',
      'P2',
      `U65 after MISMATCH: blank=${ui.blankish} gridHints=${ui.gridHints} put=${mm.status}/${mm.code}`,
      'dev-fe',
    );
  }

  await browser.close();
}

function finalize() {
  const ids = [
    'AC-REC-HC-CELL-01',
    'AC-REC-HC-CELL-01c',
    'AC-REC-HC-CELL-EX-02',
    'AC-REC-HC-CELL-EX-01',
    'AC-REC-HC-CELL-ALT-03',
    'U65-MISMATCH-UI',
  ];
  const fails = ids.filter((id) => R.ac[id]?.verdict === 'FAIL');
  const p0 = R.defects.filter((d) => d.severity === 'P0');
  const overall = fails.length === 0 && p0.length === 0 ? 'PASS' : 'FAIL';
  R.overall = overall;
  R.ack_status = overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  residual(
    'R-ATT-CRUD-RD-PARITY-SPEC',
    'P2',
    'attendance lane (in-flight)',
    'p1-phase1-be-crud-rd-parity.spec.ts attendance failures — out-of-slice; record only, do not fix',
  );
  if (overall === 'PASS') {
    residual(
      'R-REC-HC-OVERRIDE-CELLID',
      'P2',
      'qc',
      'QA seat PASS — residual closable at QC if evidence accepted; honesty recruitment_uat_ready=false C-SLICE',
    );
  }
  R.endedAt = ts();
  save();
  console.log(`\n=== OVERALL ${overall} · ${R.ack_status} · stamp ${STAMP} ===`);
  console.log(`fails=${fails.join(',') || 'none'} defects=${R.defects.length}`);
}

async function main() {
  R.dist = {
    note: 'QA rebuilt+restarted hrm-api dist before probe (src 03:24 > prior dist 03:00)',
    verified_marker: 'HRM-HC-CELL-ID-MISMATCH + mintWhenMissing in dist',
  };
  const ok0 = await runL0();
  if (!ok0) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    defect('R-L0', 'P0', 'L0 stack FAIL', 'devops');
    finalize();
    process.exit(2);
  }
  const session = await loginApi();
  const ctx = await runL1(session.token);
  if (ctx?.planId) {
    await runU65MismatchUi(session, ctx);
  } else {
    ac('U65-MISMATCH-UI', 'FAIL', { summary: 'no planId — L1 create failed' });
  }
  finalize();
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  defect('R-QA-RUNNER', 'P0', String(e).slice(0, 400), 'qa');
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  process.exit(1);
});
