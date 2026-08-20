#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01 — L1 API smoke
 * U65 zero-seed · browser UF HOLD · recruitment_uat_ready=false · payroll_e2e_ready=false
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'holding';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const STAMP = `RECPLATQA-${Date.now().toString(36).toUpperCase()}`;
const UNIQUE_KEY = `hr_custom_stage_07_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const HIRED_KEY = `hired_qa_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-01.FINAL.json',
);

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
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
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return {
    method,
    path: url.pathname + url.search,
    status: r.status,
    code: json?.code ?? null,
    message: json?.message ?? null,
    dataSummary: summarizeBody(json?.data ?? json, 800),
    data: json?.data ?? null,
    json,
  };
}

function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API_smoke_only',
  resume_chunk: 'K6.2d',
  u65: 'zero-seed · probe ≠ UF · browser UF HOLD until FE',
  honesty: {
    recruitment_uat_ready: false,
    payroll_e2e_ready: false,
    browser_uf: false,
    module_uat: false,
  },
  account: EMAIL,
  company_id_query: COMPANY,
  x_company_id: HEADER_COMPANY,
  unique_key: UNIQUE_KEY,
  hired_key: HIRED_KEY,
  steps: [],
  ac: {},
  residual: [],
  overall: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
}

try {
  const health = await fetch(`${HRM.replace(/\/api\/hrm$/, '')}/api/hrm`).then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 160),
  }));
  pushStep('L0_hrm_health', {
    status: health.status,
    ok: health.status === 200,
    note: health.text,
  });

  const staleProbe = await fetch(
    `${HRM}/recruitment/pipeline-stages?company_id=${COMPANY}`,
  ).then(async (r) => ({ status: r.status, text: (await r.text()).slice(0, 220) }));
  const routeLive = staleProbe.status === 401 || staleProbe.status === 403;
  pushStep('stale_dist_probe_unauth', {
    status: staleProbe.status,
    ok: routeLive || staleProbe.status === 200,
    note:
      staleProbe.status === 404
        ? 'STALE DIST — pipeline-stages missing'
        : `route present (${staleProbe.status})`,
    body: staleProbe.text,
  });
  if (staleProbe.status === 404) {
    report.ac.ensureSchema_list = passFail(false, '404 pipeline-stages — stale dist');
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'stale dist / route absent',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.overall));
    process.exit(2);
  }

  const auth = await login(EMAIL);
  pushStep('login', {
    status: auth.status,
    ok: auth.ok,
    via: auth.via ?? null,
    claims_sub: auth.claims?.sub ?? null,
    operating_unit: auth.claims?.operatingUnitId ?? auth.claims?.companyId ?? null,
    body: auth.body ?? null,
  });
  if (!auth.ok) {
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'login failed',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report.overall));
    process.exit(2);
  }
  const token = auth.token;

  // --- ensureSchema / VAL list ---
  const list0 = await call(token, 'GET', '/recruitment/pipeline-stages', {
    query: { company_id: COMPANY },
  });
  const list0Rows = asList(list0.data);
  pushStep('GET_pipeline_stages_holding', list0, {
    total: list0.data?.total ?? list0Rows.length,
    rowCount: list0Rows.length,
  });
  report.ac.ensureSchema_list = passFail(
    list0.status === 200,
    list0.status === 200
      ? `200 ${list0.code ?? ''} · total=${list0.data?.total ?? list0Rows.length} (empty [] OK U65)`
      : `${list0.status} ${list0.code}`,
  );

  // --- VAL-REC-STG-04 / AC-PLT-REC-02 open key ---
  const createBody = {
    companyId: COMPANY,
    stageKey: UNIQUE_KEY,
    nameVi: `QA giai đoạn ${STAMP}`,
    sortOrder: 70,
    isTerminal: false,
    isHiredOutcome: false,
    isRejectOutcome: false,
    allowsInterviewSchedule: true,
  };
  const create = await call(token, 'POST', '/recruitment/pipeline-stages', { body: createBody });
  pushStep('POST_pipeline_stages_open_key', create, { bodySent: createBody });
  const created =
    create.data && typeof create.data === 'object' && !Array.isArray(create.data)
      ? create.data
      : asList(create.data)[0] ?? null;
  const createOk = (create.status === 201 || create.status === 200) && created?.id;
  report.ac.val_rec_stg_04_open_key = passFail(
    createOk,
    createOk
      ? `created id=${created.id} key=${created.stageKey ?? created.stage_key}`
      : `${create.status} ${create.code} ${create.message}`,
  );

  // Literal hr_custom_stage_07 (open catalog, not enum ceiling)
  const c07 = await call(token, 'POST', '/recruitment/pipeline-stages', {
    body: {
      companyId: COMPANY,
      stageKey: 'hr_custom_stage_07',
      nameVi: `QA hr_custom_stage_07 ${STAMP}`,
      sortOrder: 71,
    },
  });
  pushStep('POST_pipeline_stages_hr_custom_stage_07_literal', c07);
  const openLiteralOk =
    c07.status === 201 ||
    c07.status === 200 ||
    (c07.status === 409 &&
      (c07.code === 'HRM-PLT-CAT-CODE-CONFLICT' || String(c07.code || '').includes('CONFLICT')));
  report.ac.val_rec_stg_04_literal = passFail(
    openLiteralOk,
    `${c07.status} ${c07.code ?? ''} — open catalog (not enum ceiling)`,
  );

  // scope_parity list + get-by-id
  const list1 = await call(token, 'GET', '/recruitment/pipeline-stages', {
    query: { company_id: COMPANY, q: created?.stageKey || UNIQUE_KEY },
  });
  const list1Rows = asList(list1.data);
  const inList = list1Rows.some(
    (r) =>
      r.id === created?.id ||
      r.stageKey === created?.stageKey ||
      r.stage_key === created?.stageKey,
  );
  pushStep('GET_pipeline_stages_after_create', list1, { inList, rowCount: list1Rows.length });

  let getById = null;
  if (created?.id) {
    getById = await call(token, 'GET', `/recruitment/pipeline-stages/${created.id}`, {
      query: { company_id: COMPANY },
    });
    pushStep('GET_pipeline_stages_by_id', getById);
  }
  const scopeOk =
    createOk &&
    list1.status === 200 &&
    inList &&
    getById?.status === 200 &&
    getById?.data?.id === created.id;
  report.ac.val_rec_stg_11_scope_parity = passFail(
    scopeOk,
    scopeOk
      ? `list+get id=${created.id}`
      : `inList=${inList} get=${getById?.status} ${getById?.code}`,
  );

  // --- VAL-REC-STG-02 Interview uppercase ---
  const interview = await call(token, 'POST', '/recruitment/pipeline-stages', {
    body: {
      companyId: COMPANY,
      stageKey: 'Interview',
      nameVi: 'Should reject format',
    },
  });
  pushStep('POST_pipeline_stages_Interview_invalid', interview);
  report.ac.val_rec_stg_02_format = passFail(
    interview.status === 400 && interview.code === 'HRM-PLT-CAT-CODE-INVALID',
    `${interview.status} ${interview.code}`,
  );

  // --- Hired outcome + effective hiredOutcomeKey ---
  // Prefer existing hired row; else create one.
  const listAll = await call(token, 'GET', '/recruitment/pipeline-stages', {
    query: { company_id: COMPANY },
  });
  const allRows = asList(listAll.data);
  const existingHired = allRows.find(
    (r) =>
      (r.isHiredOutcome === true || r.is_hired_outcome === true) &&
      (r.status === 'active' || !r.status),
  );
  let hiredCreate = null;
  let hiredId = existingHired?.id ?? null;
  let hiredKey = existingHired?.stageKey || existingHired?.stage_key || null;
  if (!hiredId) {
    hiredCreate = await call(token, 'POST', '/recruitment/pipeline-stages', {
      body: {
        companyId: COMPANY,
        stageKey: HIRED_KEY,
        nameVi: `QA hired outcome ${STAMP}`,
        sortOrder: 90,
        isTerminal: true,
        isHiredOutcome: true,
        isRejectOutcome: false,
      },
    });
    pushStep('POST_pipeline_stages_hired_outcome', hiredCreate);
    const hiredRow =
      hiredCreate.data && typeof hiredCreate.data === 'object' && !Array.isArray(hiredCreate.data)
        ? hiredCreate.data
        : null;
    hiredId = hiredRow?.id ?? null;
    hiredKey = hiredRow?.stageKey ?? HIRED_KEY;
  } else {
    pushStep('reuse_existing_hired_outcome', {
      status: 200,
      ok: true,
      id: hiredId,
      stageKey: hiredKey,
    });
  }

  const effective = await call(token, 'GET', '/recruitment/pipeline-stages/effective', {
    query: { company_id: COMPANY },
  });
  pushStep('GET_pipeline_stages_effective', effective, {
    hiredOutcomeKey: effective.data?.hiredOutcomeKey ?? null,
    total: effective.data?.total ?? asList(effective.data).length,
  });
  const effOk =
    effective.status === 200 &&
    (effective.data?.hiredOutcomeKey === hiredKey ||
      (typeof effective.data?.hiredOutcomeKey === 'string' &&
        effective.data.hiredOutcomeKey.length > 0));
  report.ac.val_rec_stg_eff_hired_key = passFail(
    effOk,
    effOk
      ? `200 hiredOutcomeKey=${effective.data?.hiredOutcomeKey}`
      : `${effective.status} hiredOutcomeKey=${effective.data?.hiredOutcomeKey ?? 'null'} expected=${hiredKey}`,
  );

  // --- VAL-REC-STG-05 second hired outcome ---
  const secondHired = await call(token, 'POST', '/recruitment/pipeline-stages', {
    body: {
      companyId: COMPANY,
      stageKey: `hired_dup_${Date.now().toString(36).toLowerCase()}`.slice(0, 48),
      nameVi: `QA second hired ${STAMP}`,
      sortOrder: 91,
      isTerminal: true,
      isHiredOutcome: true,
      isRejectOutcome: false,
    },
  });
  pushStep('POST_pipeline_stages_second_hired', secondHired);
  const dupOk =
    secondHired.status === 409 &&
    (secondHired.code === 'HRM-REC-STG-HIRED-DUP' ||
      secondHired.code === 'HRM-PLT-CAT-CODE-CONFLICT');
  report.ac.val_rec_stg_05_hired_dup = passFail(
    dupOk,
    `${secondHired.status} ${secondHired.code} (expect HRM-REC-STG-HIRED-DUP)`,
  );

  // --- VAL-REC-STG-12 / AC-PLT-REC-04 UNKNOWN ---
  const apps = await call(token, 'GET', '/recruitment/candidate-applications', {
    query: { company_id: COMPANY },
  });
  const appRows = asList(apps.data);
  pushStep('GET_candidate_applications', apps, { rowCount: appRows.length });
  let unknownPatch = null;
  let unlockedCandId = null;
  if (appRows.length > 0) {
    const appId = appRows[0].id;
    unknownPatch = await call(
      token,
      'PATCH',
      `/recruitment/candidate-applications/${appId}/stage`,
      {
        query: { company_id: COMPANY },
        body: { stage: `not_in_catalog_${Date.now().toString(36)}` },
      },
    );
  } else {
    // Fallback: pool stage assert (same F-REC-APP-02) — skip WF-locked rows
    const pool = await call(token, 'GET', '/recruitment/candidates-pool', {
      query: { company_id: COMPANY },
    });
    const poolRows = asList(pool.data);
    const unlocked = poolRows.find(
      (r) =>
        !r.workflow_instance_id &&
        String(r.stage || '').toLowerCase() !== 'hired',
    );
    unlockedCandId = unlocked?.id || unlocked?.candidate_id || null;
    pushStep('GET_candidates_pool_fallback', pool, {
      rowCount: poolRows.length,
      unlockedCandId,
    });
    if (unlockedCandId) {
      unknownPatch = await call(
        token,
        'PATCH',
        `/recruitment/candidates-pool/${unlockedCandId}/stage`,
        {
          query: { company_id: COMPANY },
          body: { stage: `not_in_catalog_${Date.now().toString(36)}` },
        },
      );
    }
  }
  if (unknownPatch) {
    pushStep('PATCH_stage_unknown', unknownPatch);
    const catalogCount = effective.data?.total ?? asList(effective.data).length;
    const unknownOk =
      catalogCount > 0 &&
      unknownPatch.status === 400 &&
      unknownPatch.code === 'HRM-REC-STAGE-UNKNOWN';
    report.ac.val_rec_stg_12_unknown = passFail(
      unknownOk,
      `${unknownPatch.status} ${unknownPatch.code} (catalog total=${catalogCount})`,
    );
  } else {
    report.ac.val_rec_stg_12_unknown = passFail(
      false,
      'no candidate-application or pool row to PATCH — BLOCKED data',
    );
    report.residual.push({
      id: 'R-REC-STG-UNKNOWN-NO-APP',
      severity: 'P2',
      note: 'No application/pool row for APP-02 UNKNOWN probe; catalog create still PASS',
    });
  }

  // --- Retire non-hired custom stage (AC-PLT-REC-03 / VAL-REC-STG-08 picker hide) ---
  let retire = null;
  if (created?.id) {
    // Best-effort: stamp unlocked pool candidate with custom stage before retire (history intact)
    let historyCandId = null;
    let historyStageBefore = null;
    const histTarget =
      unlockedCandId ||
      asList(
        (
          await call(token, 'GET', '/recruitment/candidates-pool', {
            query: { company_id: COMPANY },
          })
        ).data,
      ).find((r) => !r.workflow_instance_id && String(r.stage || '').toLowerCase() !== 'hired')
        ?.id;
    if (histTarget) {
      const setStage = await call(
        token,
        'PATCH',
        `/recruitment/candidates-pool/${histTarget}/stage`,
        {
          query: { company_id: COMPANY },
          body: { stage: UNIQUE_KEY },
        },
      );
      pushStep('PATCH_pool_to_custom_before_retire', setStage);
      if (setStage.status === 200 || setStage.status === 201) {
        historyCandId = histTarget;
        historyStageBefore = UNIQUE_KEY;
      }
    }

    retire = await call(token, 'POST', `/recruitment/pipeline-stages/${created.id}/retire`, {
      query: { company_id: COMPANY },
    });
    pushStep('POST_pipeline_stages_retire', retire);
    const activeAfter = await call(token, 'GET', '/recruitment/pipeline-stages', {
      query: { company_id: COMPANY, status: 'active' },
    });
    const activeRows = asList(activeAfter.data);
    const hidden = !activeRows.some((r) => r.id === created.id);
    const archivedList = await call(token, 'GET', '/recruitment/pipeline-stages', {
      query: { company_id: COMPANY, include_archived: '1' },
    });
    const archivedRows = asList(archivedList.data);
    const retiredRow = archivedRows.find((r) => r.id === created.id);
    pushStep('GET_after_retire_active', activeAfter, { hidden });
    pushStep('GET_after_retire_include_archived', archivedList, {
      retiredStatus: retiredRow?.status,
      archivedAt: retiredRow?.archivedAt ?? retiredRow?.archived_at,
    });

    let historyOk = true;
    let historyNote = 'no pool row set to custom key (picker-hide only)';
    if (historyCandId) {
      const poolAfter = await call(token, 'GET', '/recruitment/candidates-pool', {
        query: { company_id: COMPANY },
      });
      const hit = asList(poolAfter.data).find((a) => a.id === historyCandId);
      const stageVal = hit?.stage ?? hit?.stage_key;
      historyOk = stageVal === historyStageBefore;
      historyNote = `cand ${historyCandId} stage=${stageVal} (expect ${historyStageBefore})`;
      pushStep('GET_pool_after_retire_history', poolAfter, { historyOk, stageVal });
    }

    const retireOk =
      (retire.status === 200 || retire.status === 201) &&
      (retire.data?.status === 'retired' || retiredRow?.status === 'retired') &&
      hidden;
    report.ac.val_rec_stg_08_retire = passFail(
      retireOk && historyOk,
      retireOk
        ? `retired+hidden · ${historyNote}`
        : `${retire?.status} ${retire?.code} hidden=${hidden} historyOk=${historyOk}`,
    );
  } else {
    report.ac.val_rec_stg_08_retire = passFail(false, 'no created id to retire');
  }

  // --- must_keep JD / IV / hire surface / YCTD ---
  const jd = await call(token, 'GET', '/recruitment/jd-field-defs', {
    query: { company_id: COMPANY },
  });
  const jdLayout = await call(token, 'GET', '/recruitment/jd-form-layouts', {
    query: { company_id: COMPANY },
  });
  const iv = await call(token, 'GET', '/recruitment/interviews-catalog', {
    query: { company_id: COMPANY },
  });
  const hireSurf = await call(token, 'GET', '/recruitment/candidates-pool', {
    query: { company_id: COMPANY },
  });
  const yctd = await call(token, 'GET', '/recruitment/requisitions', {
    query: { company_id: COMPANY },
  });
  pushStep('must_keep_jd_field_defs', jd);
  pushStep('must_keep_jd_form_layouts', jdLayout);
  pushStep('must_keep_interviews_catalog', iv);
  pushStep('must_keep_candidates_pool_hire_surface', hireSurf);
  pushStep('must_keep_requisitions_yctd', yctd);
  const mustKeepOk =
    jd.status === 200 &&
    jdLayout.status === 200 &&
    iv.status === 200 &&
    hireSurf.status === 200 &&
    yctd.status === 200;
  report.ac.must_keep_jd_iv_hire_yctd = passFail(
    mustKeepOk,
    `jd=${jd.status} layout=${jdLayout.status} iv=${iv.status} pool=${hireSurf.status} yctd=${yctd.status}`,
  );

  // AC matrix rollup (L1)
  report.ac.ac_plt_rec_02_l1 = report.ac.val_rec_stg_04_open_key;
  report.ac.ac_plt_rec_03_l1 = report.ac.val_rec_stg_08_retire;
  report.ac.ac_plt_rec_04_l1 = report.ac.val_rec_stg_12_unknown;
  report.ac.ac_plt_rec_05_hire_path = passFail(
    true,
    'L1 HOLD full hire→EMP soft-link — must_keep candidates-pool 200 only; browser/FE for AC-PLT-REC-05',
  );
  report.ac.ac_plt_rec_05_hire_path.verdict = 'HOLD';
  report.ac.ac_plt_rec_05_hire_path.ok = true; // not a fail for this L1 seat

  report.residual.push({
    id: 'R-REC-BROWSER-AC-PLT',
    severity: 'P2',
    note: 'AC-PLT-REC-02..05 browser Settings/picker HOLD until REC-FE',
  });
  report.residual.push({
    id: 'R-REC-AC-PLT-REC-05',
    severity: 'P2',
    note: 'Full hire→EMP with hired-outcome key not exercised this L1 (must_keep surface only)',
  });

  const required = [
    'ensureSchema_list',
    'val_rec_stg_04_open_key',
    'val_rec_stg_04_literal',
    'val_rec_stg_11_scope_parity',
    'val_rec_stg_02_format',
    'val_rec_stg_eff_hired_key',
    'val_rec_stg_05_hired_dup',
    'val_rec_stg_12_unknown',
    'val_rec_stg_08_retire',
    'must_keep_jd_iv_hire_yctd',
  ];
  const failed = required.filter((k) => !report.ac[k]?.ok);
  const allPass = failed.length === 0;
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    stamp: STAMP,
    failed,
    pass_count: required.filter((k) => report.ac[k]?.ok).length,
    required_count: required.length,
    honesty: report.honesty,
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.overall, null, 2));
  process.exit(allPass ? 0 : 1);
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
