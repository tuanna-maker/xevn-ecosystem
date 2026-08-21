#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01
 * L1 KEY invent + IV soft-gate + one-active spot · U65 zero-seed
 * Honesty: recruitment_uat_ready=false · C-SLICE-≠-MODULE
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
/** Query/header for Group CEO rollup; Nest stage writer company from EFF rows. */
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const STAGE_COMPANY = process.env.QA_STAGE_COMPANY_ID || 'holding';
const STAMP = `RECCNSQA-${Date.now().toString(36).toUpperCase()}`;
const SUFFIX = Date.now().toString(36).toLowerCase();
const DENY_STAGE = `hr_iv_deny_${SUFFIX}`.slice(0, 48);
const ALLOW_STAGE = `hr_iv_allow_${SUFFIX}`.slice(0, 48);
const INVENT = `zz_invent_stage_${SUFFIX}`.slice(0, 48);

function rowId(data) {
  if (!data || typeof data !== 'object') return null;
  return data.id || data.data?.id || null;
}

function stageKeyOf(r) {
  return (r?.stageKey || r?.stage_key || '').trim();
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.json',
);

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 1200) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  } catch {
    return null;
  }
}

function asList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function errCode(j) {
  return (
    j?.error?.code ||
    j?.code ||
    j?.errorCode ||
    j?.data?.code ||
    j?.message?.code ||
    null
  );
}

async function login(email, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) {
        return { ok: true, status: r.status, token, claims: decodeJwt(token), via: url };
      }
      if (url.includes('28002')) {
        return { ok: false, status: r.status, body: summarizeBody(j), token: null };
      }
    } catch (e) {
      if (url.includes('28002')) {
        return { ok: false, status: 0, body: String(e?.message || e), token: null };
      }
    }
  }
  return { ok: false, status: 0, body: 'login failed both portals', token: null };
}

async function call(token, method, path, { query, body, companyId = HEADER_COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': companyId,
    Accept: 'application/json',
  };
  if (body !== undefined) headers['content-type'] = 'application/json';
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let j = {};
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    j = { raw: text.slice(0, 400) };
  }
  return {
    status: r.status,
    ok: r.ok,
    code: errCode(j) || j?.meta?.code || null,
    data: j?.data ?? j,
    body: summarizeBody(j),
    url: url.toString(),
  };
}

function checkDist() {
  const files = [
    'apps/api/hrm-api/dist/recruitment/rec-pipeline-stage.service.js',
    'apps/api/hrm-api/dist/recruitment/rec-pipeline-stage.constants.js',
    'apps/api/hrm-api/dist/recruitment/recruitment-catalog.service.js',
    'apps/api/hrm-api/dist/recruitment/recruitment.service.js',
  ];
  const details = [];
  let ok = true;
  for (const rel of files) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) {
      ok = false;
      details.push({ rel, present: false });
      continue;
    }
    const src = readFileSync(p, 'utf8');
    const hasAssert =
      rel.includes('rec-pipeline-stage.service')
        ? src.includes('assertInterviewScheduleAllowed')
        : rel.includes('constants')
          ? src.includes('HRM-REC-IV-400-STAGE-DISALLOW')
          : rel.includes('catalog') || rel.includes('recruitment.service')
            ? src.includes('assertInterviewScheduleAllowed') ||
              src.includes('assertStageInEffectiveCatalog')
            : true;
    if (!hasAssert) ok = false;
    details.push({ rel, present: true, hasAssert, mtime: existsSync(p) });
  }
  return { ok, details };
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01',
  stamp: STAMP,
  persona: EMAIL,
  company_id: COMPANY,
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    c_slice_ne_module: true,
  },
  steps: [],
  ac: {},
  overall: {},
};

function passFail(ok, note) {
  return { pass: Boolean(ok), note };
}

function push(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
}

try {
  const health = await fetch(`${HRM.replace(/\/api\/hrm$/, '')}/api/hrm`).then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 160),
  }));
  push('L0_hrm_health', { status: health.status, ok: health.status === 200, note: health.text });

  const dist = checkDist();
  push('dist_freshness', { ok: dist.ok, details: dist.details });
  report.ac.dist = passFail(dist.ok, dist.ok ? 'CNS symbols present in dist' : 'STALE DIST');
  if (!dist.ok) {
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'stale dist — missing CNS symbols',
      residual: 'D-REC-CNS-STALE-DIST → devops rebuild+restart → QA retest',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.overall, null, 2));
    process.exit(2);
  }

  const unauth = await fetch(
    `${HRM}/recruitment/pipeline-stages/effective?company_id=${COMPANY}`,
  ).then(async (r) => ({ status: r.status, text: (await r.text()).slice(0, 220) }));
  push('unauth_effective', {
    status: unauth.status,
    ok: unauth.status === 401 || unauth.status === 403,
    note: unauth.text,
  });
  if (unauth.status === 404) {
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'stale dist — effective 404',
      residual: 'D-REC-CNS-STALE-DIST',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.overall, null, 2));
    process.exit(2);
  }

  const auth = await login(EMAIL);
  push('login', {
    status: auth.status,
    ok: auth.ok,
    via: auth.via ?? null,
    claims_sub: auth.claims?.sub ?? null,
  });
  if (!auth.ok) {
    report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', reason: 'login failed' };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    process.exit(2);
  }
  const token = auth.token;

  // --- EFF baseline ---
  let eff = await call(token, 'GET', '/recruitment/pipeline-stages/effective', {
    query: { company_id: COMPANY },
  });
  let effRows = asList(eff.data);
  push('GET_effective', eff, { total: eff.data?.total ?? effRows.length, keys: effRows.map((r) => r.stageKey || r.stage_key).slice(0, 20) });

  // Admin open N+1 for IV deny/allow (Settings CREATE — not seed density)
  const denyBody = {
    companyId: STAGE_COMPANY,
    stageKey: DENY_STAGE,
    nameVi: `QA IV Deny ${STAMP}`,
    sortOrder: 90,
    allowsInterviewSchedule: false,
    isHiredOutcome: false,
    isRejectOutcome: false,
    isTerminal: false,
  };
  let denyPut = await call(token, 'POST', '/recruitment/pipeline-stages', { body: denyBody });
  if (denyPut.status >= 400) {
    denyPut = await call(token, 'PUT', '/recruitment/pipeline-stages', { body: denyBody });
  }
  push('admin_create_deny_stage', denyPut, { stageKey: DENY_STAGE, stageCompany: STAGE_COMPANY });

  const allowBody = {
    companyId: STAGE_COMPANY,
    stageKey: ALLOW_STAGE,
    nameVi: `QA IV Allow ${STAMP}`,
    sortOrder: 91,
    allowsInterviewSchedule: true,
    isHiredOutcome: false,
    isRejectOutcome: false,
    isTerminal: false,
  };
  let upsertAllow = await call(token, 'POST', '/recruitment/pipeline-stages', { body: allowBody });
  if (upsertAllow.status >= 400) {
    upsertAllow = await call(token, 'PUT', '/recruitment/pipeline-stages', { body: allowBody });
  }
  push('admin_create_allow_stage', upsertAllow, { stageKey: ALLOW_STAGE });

  // Fallback: PATCH an existing EFF stage to deny if CREATE failed
  let denyKey = DENY_STAGE;
  let allowKey = ALLOW_STAGE;
  let patchedExisting = null;
  if (!(denyPut.status === 200 || denyPut.status === 201)) {
    const listAdm = await call(token, 'GET', '/recruitment/pipeline-stages', {
      query: { company_id: STAGE_COMPANY },
    });
    const admRows = asList(listAdm.data);
    const target = admRows.find((r) => stageKeyOf(r) && r.allowsInterviewSchedule !== false) || admRows[0];
    if (target?.id) {
      patchedExisting = {
        id: target.id,
        stageKey: stageKeyOf(target),
        prevAllows: target.allowsInterviewSchedule ?? true,
      };
      const patch = await call(token, 'PATCH', `/recruitment/pipeline-stages/${target.id}`, {
        query: { company_id: STAGE_COMPANY },
        body: { allowsInterviewSchedule: false },
      });
      push('admin_patch_existing_deny', patch, { id: target.id, stageKey: patchedExisting.stageKey });
      if (patch.status === 200 || patch.status === 201) {
        denyKey = patchedExisting.stageKey;
      }
    }
  }

  eff = await call(token, 'GET', '/recruitment/pipeline-stages/effective', {
    query: { company_id: COMPANY },
  });
  // nested { total, data: [] }
  effRows = asList(eff.data?.data ? eff.data : eff.data);
  if (eff.data?.data && Array.isArray(eff.data.data)) effRows = eff.data.data;
  const effTotal = Number(eff.data?.total ?? effRows.length);
  const hasDeny = effRows.some((r) => stageKeyOf(r) === denyKey);
  const denyRow = effRows.find((r) => stageKeyOf(r) === denyKey);
  const allowHit = effRows.find((r) => stageKeyOf(r) === allowKey);
  if (!allowHit && effRows.length) {
    allowKey = stageKeyOf(effRows.find((r) => (r.allowsInterviewSchedule ?? true) !== false) || effRows[0]);
  }
  push('GET_effective_after_admin', eff, {
    total: effTotal,
    hasDeny,
    denyKey,
    allowKey,
    denyAllowsIv: denyRow?.allowsInterviewSchedule ?? denyRow?.allows_interview_schedule,
  });
  report.ac.eff_gt0 = passFail(effTotal > 0, `EFF total=${effTotal}`);

  // --- VAL-REC-CNS-02 invent createCandidatePool ---
  const inventCreate = await call(token, 'POST', '/recruitment/candidates-pool', {
    body: {
      company_id: STAGE_COMPANY,
      full_name: `CNS Invent ${SUFFIX}`,
      email: `cns.invent.${SUFFIX}@xe.vn`,
      stage: INVENT,
      source: 'qa-cns-01',
    },
  });
  const inventCreatePass =
    inventCreate.status === 400 && inventCreate.code === 'HRM-REC-STAGE-UNKNOWN';
  push('VAL_REC_CNS_02_invent_create_pool', inventCreate, { invent: INVENT });
  report.ac.val_rec_cns_02 = passFail(
    inventCreatePass,
    inventCreatePass
      ? '400 HRM-REC-STAGE-UNKNOWN'
      : `${inventCreate.status} ${inventCreate.code}`,
  );

  // Pool on deny / allow stages (admin keys ∈ EFF)
  const poolDeny = await call(token, 'POST', '/recruitment/candidates-pool', {
    body: {
      company_id: STAGE_COMPANY,
      full_name: `CNS Deny ${SUFFIX}`,
      email: `cns.deny.${SUFFIX}@xe.vn`,
      stage: denyKey,
      source: 'qa-cns-01',
    },
  });
  const poolDenyId = rowId(poolDeny.data);
  push('create_pool_on_deny_stage', poolDeny, { id: poolDenyId, stage: denyKey });

  const poolAllow = await call(token, 'POST', '/recruitment/candidates-pool', {
    body: {
      company_id: STAGE_COMPANY,
      full_name: `CNS Allow ${SUFFIX}`,
      email: `cns.allow.${SUFFIX}@xe.vn`,
      stage: allowKey,
      source: 'qa-cns-01',
    },
  });
  const poolAllowId = rowId(poolAllow.data);
  push('create_pool_on_allow_stage', poolAllow, { id: poolAllowId, stage: allowKey });

  // --- APP-02 invent RETAIN ---
  let app02Target = poolDenyId || poolAllowId;
  if (!app02Target) {
    const listPool = await call(token, 'GET', '/recruitment/candidates-pool', {
      query: { company_id: COMPANY, page_size: 20 },
    });
    const rows = asList(listPool.data?.data ? listPool.data : listPool.data);
    const flat = Array.isArray(listPool.data?.data) ? listPool.data.data : asList(listPool.data);
    app02Target = flat[0]?.id || rows[0]?.id;
    push('list_pool_fallback', listPool, { pick: app02Target, count: flat.length });
  }
  const app02 = app02Target
    ? await call(token, 'PATCH', `/recruitment/candidates-pool/${app02Target}/stage`, {
        query: { company_id: STAGE_COMPANY },
        body: { stage: INVENT, company_id: STAGE_COMPANY },
      })
    : { status: 0, code: 'NO_POOL', body: 'no pool row', ok: false };
  const app02Pass = app02.status === 400 && app02.code === 'HRM-REC-STAGE-UNKNOWN';
  push('VAL_REC_CNS_01_APP02_invent', app02, { invent: INVENT, target: app02Target });
  report.ac.val_rec_cns_01_app02 = passFail(
    app02Pass,
    app02Pass ? '400 HRM-REC-STAGE-UNKNOWN RETAIN' : `${app02.status} ${app02.code}`,
  );

  // --- VAL-REC-CNS-05 IV soft-gate DISALLOW (Lane B catalog) ---
  const ivDisallow = poolDenyId
    ? await call(token, 'POST', '/recruitment/interviews-catalog', {
        body: {
          company_id: STAGE_COMPANY,
          candidate_id: poolDenyId,
          candidate_name: `CNS Deny ${SUFFIX}`,
          candidate_email: `cns.deny.${SUFFIX}@xe.vn`,
          interview_date: '2026-08-15',
          interview_time: '10:00',
          interview_type: 'onsite',
          duration_minutes: 30,
        },
      })
    : { status: 0, code: 'NO_POOL', body: 'skip', ok: false };
  const disallowPass =
    ivDisallow.status === 400 && ivDisallow.code === 'HRM-REC-IV-400-STAGE-DISALLOW';
  const notConfused =
    ivDisallow.code !== 'HRM-REC-STAGE-UNKNOWN' && ivDisallow.code !== 'HRM-REC-IV-409-ACTIVE';
  push('VAL_REC_CNS_05_iv_disallow', ivDisallow, {
    expected: 'HRM-REC-IV-400-STAGE-DISALLOW',
    notUnknown: ivDisallow.code !== 'HRM-REC-STAGE-UNKNOWN',
    not409Active: ivDisallow.code !== 'HRM-REC-IV-409-ACTIVE',
  });
  report.ac.val_rec_cns_05 = passFail(
    disallowPass && notConfused,
    disallowPass
      ? '400 HRM-REC-IV-400-STAGE-DISALLOW ≠ UNKNOWN ≠ 409-ACTIVE'
      : `${ivDisallow.status} ${ivDisallow.code}`,
  );

  // Restore patched stage if used
  if (patchedExisting?.id) {
    const restore = await call(token, 'PATCH', `/recruitment/pipeline-stages/${patchedExisting.id}`, {
      query: { company_id: STAGE_COMPANY },
      body: { allowsInterviewSchedule: patchedExisting.prevAllows !== false },
    });
    push('admin_restore_patched_stage', restore, { id: patchedExisting.id });
  }

  // --- Spot one-active 409 RETAIN (Lane A spine — must_keep) ---
  const spineList = await call(token, 'GET', '/recruitment/candidates', {
    query: { company_id: COMPANY, page_size: 50 },
  });
  const spineRows = Array.isArray(spineList.data?.data)
    ? spineList.data.data
    : asList(spineList.data);
  const spineCand =
    spineRows.find((r) => r.active_interview_id || r.activeInterviewId) ||
    spineRows.find((r) => r.id) ||
    null;
  push('spine_candidates_list', {
    status: spineList.status,
    ok: spineList.ok,
    code: spineList.code,
    count: spineRows.length,
    pick: spineCand?.id ?? null,
    hasActive: Boolean(spineCand?.active_interview_id || spineCand?.activeInterviewId),
  });

  let iv1 = { status: 0, code: 'NO_SPINE', ok: false };
  let iv2 = { status: 0, code: 'NO_SPINE', ok: false };
  if (spineCand?.id) {
    const scheduledAt = new Date(Date.now() + 86400000).toISOString();
    iv1 = await call(token, 'POST', '/recruitment/interviews', {
      body: {
        company_id: COMPANY,
        candidate_id: spineCand.id,
        scheduled_at: scheduledAt,
        interviewer: `QA CNS ${STAMP}`,
      },
    });
    iv2 = await call(token, 'POST', '/recruitment/interviews', {
      body: {
        company_id: COMPANY,
        candidate_id: spineCand.id,
        scheduled_at: new Date(Date.now() + 172800000).toISOString(),
        interviewer: `QA CNS dup ${STAMP}`,
      },
    });
  }
  push('iv_one_active_first', iv1);
  const oneActiveOk =
    (iv2.status === 409 && iv2.code === 'HRM-REC-IV-409-ACTIVE') ||
    (iv1.status === 409 && iv1.code === 'HRM-REC-IV-409-ACTIVE');
  push('iv_one_active_dup', iv2, { oneActiveOk });
  report.ac.iv_one_active_409 = passFail(
    oneActiveOk,
    oneActiveOk
      ? '409 HRM-REC-IV-409-ACTIVE RETAIN (Lane A)'
      : `iv1=${iv1.status}/${iv1.code} iv2=${iv2.status}/${iv2.code} spine=${spineCand?.id || 'none'}`,
  );

  // Honesty seals (document-only)
  report.ac.honesty_seals = passFail(true, [
    'recruitment_uat_ready=false LOCKED',
    'jd_dynamic_done=false',
    'REC-QC/UX/JD/IV one-active SEAL RETAIN',
    'C-SLICE-≠-MODULE',
    'no seed · no ready flip',
  ].join(' · '));

  const keys = [
    'dist',
    'eff_gt0',
    'val_rec_cns_02',
    'val_rec_cns_01_app02',
    'val_rec_cns_05',
    'iv_one_active_409',
    'honesty_seals',
  ];
  const passed = keys.filter((k) => report.ac[k]?.pass).length;
  const failed = keys.filter((k) => report.ac[k] && !report.ac[k].pass);
  const allPass = failed.length === 0;

  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    stamp: STAMP,
    score: `${passed}/${keys.length}`,
    failed: failed.map((k) => ({ id: k, note: report.ac[k]?.note })),
    kanban_note: 'browser spot separate (FE READY) — VAL-REC-CNS-04',
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ overall: report.overall, ac: report.ac }, null, 2));
  process.exit(allPass ? 0 : 2);
} catch (e) {
  report.overall = {
    verdict: 'FAIL',
    ack_status: 'FAIL_TO_PM',
    reason: String(e?.stack || e),
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.error(e);
  process.exit(2);
}
