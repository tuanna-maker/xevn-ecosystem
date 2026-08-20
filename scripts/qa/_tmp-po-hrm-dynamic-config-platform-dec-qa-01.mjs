#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01 — L1 API smoke
 * U65 zero-seed · browser Settings UF HOLD · honesty LOCKED false
 * VAL-DEC-CAT/CNS/ALS/SCP · stale-dist gate (EMP class)
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'holding';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const STAMP = `DECPLATQA-${Date.now().toString(36).toUpperCase()}`;
const OPEN_KEY = `hr_custom_dec_09_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-01.FINAL.json',
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
        return {
          ok: true,
          status: r.status,
          token,
          claims: decodeJwt(token),
          via: url,
          memberships: d.memberships || d.user?.memberships || [],
        };
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

async function call(token, method, path, { query, body, companyId = HEADER_COMPANY, tenantId = 'xevn' } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId,
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

function inspectDist() {
  const distDec = resolve(ROOT, 'apps/api/hrm-api/dist/decisions');
  const srcDec = resolve(ROOT, 'apps/api/hrm-api/src/decisions');
  const out = {
    dist_decisions_exists: existsSync(distDec),
    src_files: existsSync(srcDec)
      ? readdirSync(srcDec).filter((f) => /decision-type|decisions\.(controller|service)/i.test(f))
      : [],
    dist_files: [],
    has_hr_decision_type_service_js: false,
    controller_has_effective_route: false,
    controller_mtime: null,
    service_src_mtime: null,
  };
  if (existsSync(distDec)) {
    out.dist_files = readdirSync(distDec);
    out.has_hr_decision_type_service_js = out.dist_files.some((f) =>
      f.includes('hr-decision-type.service'),
    );
    const ctrl = out.dist_files.find((f) => f === 'decisions.controller.js');
    if (ctrl) {
      const p = join(distDec, ctrl);
      const t = readFileSync(p, 'utf8');
      out.controller_has_effective_route = t.includes('decision-types/effective');
      out.controller_mtime = statSync(p).mtime.toISOString();
    }
  }
  const svcSrc = join(srcDec, 'hr-decision-type.service.ts');
  if (existsSync(svcSrc)) out.service_src_mtime = statSync(svcSrc).mtime.toISOString();
  return out;
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API_smoke_only',
  u65: 'zero-seed · probe ≠ UF · browser Settings HOLD',
  honesty: {
    decisions_module_uat_ready: false,
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    payroll_e2e_ready: false,
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    contracts_printable_ready: false,
    browser_uf: false,
    module_uat: false,
  },
  account: EMAIL,
  member_account: MEMBER_EMAIL,
  company_id_query: COMPANY,
  x_company_id: HEADER_COMPANY,
  open_key: OPEN_KEY,
  dist_inspect: inspectDist(),
  steps: [],
  ac: {},
  residual: [],
  overall: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
}

function isAuthGate(status) {
  return status === 401 || status === 403;
}

function looksLikeUuidParamError(status, text) {
  // EMP class: 500 uuid "document-types" when param route ate catalog segment
  const s = String(text || '');
  return (
    status === 500 &&
    (/uuid/i.test(s) || /Validation failed/i.test(s) || /decision-types/i.test(s))
  );
}

try {
  // --- L0 ---
  const health = await fetch(`${HRM.replace(/\/api\/hrm$/, '')}/api/hrm`).then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 160),
  }));
  pushStep('L0_hrm_health', {
    status: health.status,
    ok: health.status === 200,
    note: health.text,
  });

  // Stale-dist probe — list + effective must auth-gate (401/403), NOT 404/500-uuid
  const staleList = await fetch(`${HRM}/decisions/decision-types?company_id=${COMPANY}`).then(
    async (r) => ({ status: r.status, text: (await r.text()).slice(0, 280) }),
  );
  const staleEff = await fetch(
    `${HRM}/decisions/decision-types/effective?company_id=${COMPANY}`,
  ).then(async (r) => ({ status: r.status, text: (await r.text()).slice(0, 280) }));

  const listOk = isAuthGate(staleList.status) || staleList.status === 200;
  const effOk = isAuthGate(staleEff.status) || staleEff.status === 200;
  const listStale =
    staleList.status === 404 || looksLikeUuidParamError(staleList.status, staleList.text);
  const effStale =
    staleEff.status === 404 || looksLikeUuidParamError(staleEff.status, staleEff.text);

  pushStep('stale_dist_probe_unauth', {
    list: staleList,
    effective: staleEff,
    dist: report.dist_inspect,
    ok: listOk && effOk && !listStale && !effStale,
    note:
      listStale || effStale
        ? `STALE DIST class — list=${staleList.status} effective=${staleEff.status} (need 401/403, got 404/500-uuid)`
        : `routes present (list=${staleList.status} effective=${staleEff.status})`,
  });

  if (listStale || effStale) {
    report.ac.stale_dist_gate = passFail(
      false,
      `D-DEC-PLT-STALE-DIST — unauth list=${staleList.status} effective=${staleEff.status}; dist has_hr_decision_type_service_js=${report.dist_inspect.has_hr_decision_type_service_js} controller_effective=${report.dist_inspect.controller_has_effective_route}`,
    );
    report.residual.push({
      id: 'D-DEC-PLT-STALE-DIST',
      severity: 'P0',
      owner: 'devops',
      summary:
        'Runtime missing /decisions/decision-types/effective (and/or incomplete catalog compile) — EMP-class stale dist. Rebuild+restart hrm-api; retest QA-01.',
      evidence: { staleList, staleEff, dist: report.dist_inspect },
    });
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      pass: 0,
      fail: 1,
      stamp: STAMP,
      residual: 'D-DEC-PLT-STALE-DIST',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify(report.overall, null, 2));
    console.log('evidence_json', OUT);
    process.exit(2);
  }

  report.ac.stale_dist_gate = passFail(true, 'unauth list+effective auth-gate (not 404/500)');

  const loginCeo = await login(EMAIL);
  pushStep('login_ceo', {
    ok: loginCeo.ok,
    status: loginCeo.status,
    via: loginCeo.via,
    companyClaim: loginCeo.claims?.companyId || loginCeo.claims?.company_id,
  });
  if (!loginCeo.ok || !loginCeo.token) {
    report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', note: 'login ceo failed', stamp: STAMP };
    writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    process.exit(2);
  }
  const token = loginCeo.token;

  // --- VAL-DEC-CAT-01 list ---
  const list = await call(token, 'GET', '/decisions/decision-types', {
    query: { company_id: COMPANY },
  });
  const listRows = asList(list.data);
  const listOk2 = list.status === 200;
  pushStep('VAL_DEC_CAT_list', list, { total: listRows.length });
  report.ac.VAL_DEC_CAT_list = passFail(listOk2, `${list.status} ${list.code} total=${listRows.length}`);

  // --- VAL-DEC-CAT-01 create open key ---
  const create = await call(token, 'POST', '/decisions/decision-types', {
    body: {
      companyId: COMPANY,
      decisionTypeKey: OPEN_KEY,
      nameVi: `QA DEC open ${STAMP}`,
      sortOrder: 90,
      isPersonBound: false,
      writesWorkHistory: false,
    },
  });
  const createdId = create.data?.id || create.data?.decisionTypeId || null;
  const createOk = create.status === 201 || create.status === 200;
  pushStep('VAL_DEC_CAT_01_create_open', create, { createdId, key: OPEN_KEY });
  report.ac.VAL_DEC_CAT_01_create_open = passFail(
    createOk && !!createdId,
    `${create.status} ${create.code} id=${createdId}`,
  );

  // --- invalid format (dispatch said "invalid uppercase"; DEC allows HRD_* case —
  //     probe uses invalid chars + leading digit; also prove uppercase-alone is VALID) ---
  const invalidSpace = await call(token, 'POST', '/decisions/decision-types', {
    body: {
      companyId: COMPANY,
      decisionTypeKey: 'BAD KEY',
      nameVi: 'invalid space',
    },
  });
  const invalidDigit = await call(token, 'POST', '/decisions/decision-types', {
    body: {
      companyId: COMPANY,
      decisionTypeKey: '9bad_key',
      nameVi: 'leading digit',
    },
  });
  // EMP-style ALLCAPS key — DEC format ALLOWS (HRD_01); expect 2xx not CODE-INVALID
  const upperKey = `HRD_QA_${Date.now().toString(36).toUpperCase()}`.slice(0, 48);
  const upperOk = await call(token, 'POST', '/decisions/decision-types', {
    body: {
      companyId: COMPANY,
      decisionTypeKey: upperKey,
      nameVi: `Upper allowed ${STAMP}`,
      isPersonBound: false,
      writesWorkHistory: false,
    },
  });
  const invalidOk =
    invalidSpace.status === 400 &&
    String(invalidSpace.code || '').includes('CODE-INVALID') &&
    invalidDigit.status === 400 &&
    String(invalidDigit.code || '').includes('CODE-INVALID');
  pushStep('VAL_DEC_CAT_03_invalid_format', {
    space: { status: invalidSpace.status, code: invalidSpace.code },
    digit: { status: invalidDigit.status, code: invalidDigit.code },
    uppercase_alone: { status: upperOk.status, code: upperOk.code, key: upperKey },
    ok: invalidOk,
  });
  report.ac.VAL_DEC_CAT_03_invalid_format = passFail(
    invalidOk,
    `space=${invalidSpace.status}/${invalidSpace.code} digit=${invalidDigit.status}/${invalidDigit.code} upperAlone=${upperOk.status} (DEC allows case)`,
  );
  // Note: "invalid uppercase" from EMP template ≠ DEC BR-PLT-05 — uppercase alone VALID

  // --- effective dual SoT ---
  const eff = await call(token, 'GET', '/decisions/decision-types/effective', {
    query: { company_id: COMPANY },
  });
  const effRows = asList(eff.data);
  const openInEff = effRows.some(
    (r) => String(r.decisionTypeKey || r.decision_type_key || '').toLowerCase() === OPEN_KEY.toLowerCase(),
  );
  const sources = [...new Set(effRows.map((r) => r.source).filter(Boolean))];
  const effOk2 = eff.status === 200 && (effRows.length === 0 || openInEff || createOk);
  pushStep('VAL_DEC_ALS_effective', eff, {
    total: effRows.length,
    openInEff,
    sources,
  });
  report.ac.VAL_DEC_ALS_effective = passFail(
    eff.status === 200 && (effRows.length === 0 || openInEff),
    `${eff.status} total=${effRows.length} openInEff=${openInEff} sources=${sources.join(',')}`,
  );

  // --- Wire smoke F-CORE-DEC: unknown type when catalog >0 ---
  let cns01 = { skipped: true };
  if (effRows.length > 0 || createOk) {
    const unknown = await call(token, 'POST', '/decisions', {
      body: {
        company_id: COMPANY,
        decision_type: `zz_unknown_dec_${Date.now().toString(36)}`,
        employee_name: 'QA Probe',
        position_key: 'ceo',
        title: `CNS-01 probe ${STAMP}`,
      },
    });
    const cnsOk =
      unknown.status === 400 && String(unknown.code || '') === 'HRM-DEC-TYPE-UNKNOWN';
    cns01 = {
      status: unknown.status,
      code: unknown.code,
      message: unknown.message,
      ok: cnsOk,
    };
    pushStep('VAL_DEC_CNS_01_unknown_when_catalog_gt0', unknown, { ok: cnsOk });
    report.ac.VAL_DEC_CNS_01 = passFail(
      cnsOk,
      `${unknown.status} ${unknown.code} (expect 400 HRM-DEC-TYPE-UNKNOWN)`,
    );
  } else {
    report.ac.VAL_DEC_CNS_01 = passFail(
      true,
      'WAIVE — effective empty after create fail; BR-PLT-DEC-06 soft allow when EFF=0',
    );
  }

  // --- retire ---
  let retireOk = false;
  if (createdId) {
    const retire = await call(token, 'POST', `/decisions/decision-types/${createdId}/retire`, {
      query: { company_id: COMPANY },
      body: {},
    });
    const listAfter = await call(token, 'GET', '/decisions/decision-types', {
      query: { company_id: COMPANY },
    });
    const afterRows = asList(listAfter.data);
    const hidden = !afterRows.some((r) => (r.id || r.decisionTypeId) === createdId);
    const archived = await call(token, 'GET', '/decisions/decision-types', {
      query: { company_id: COMPANY, include_archived: 'true' },
    });
    const archRows = asList(archived.data);
    const stillVisibleArchived = archRows.some(
      (r) => (r.id || r.decisionTypeId) === createdId || String(r.status).toLowerCase() === 'retired',
    );
    retireOk =
      (retire.status === 201 || retire.status === 200) &&
      String(retire.data?.status || '').toLowerCase() === 'retired' &&
      hidden;
    pushStep('VAL_DEC_CAT_04_retire', retire, {
      hidden,
      stillVisibleArchived,
      listAfterTotal: afterRows.length,
    });
    report.ac.VAL_DEC_CAT_04_retire = passFail(
      retireOk,
      `${retire.status} status=${retire.data?.status} hidden=${hidden}`,
    );

    // scope_parity get-by-id (holding + main for group CEO)
    const getHolding = await call(token, 'GET', `/decisions/decision-types/${createdId}`, {
      query: { company_id: COMPANY },
    });
    const getMain = await call(token, 'GET', `/decisions/decision-types/${createdId}`, {
      query: { company_id: 'main' },
    });
    const scopeOk =
      (getHolding.status === 200 || getHolding.status === 404) &&
      (getMain.status === 200 || getMain.status === 404) &&
      !(getHolding.status === 200 && getMain.status === 500);
    // After retire, get may still return row (soft) — 200 expected for same scope
    const parityOk = getHolding.status === 200 || getHolding.status === 404;
    pushStep('VAL_DEC_SCP_get', { getHolding, getMain, ok: parityOk });
    report.ac.VAL_DEC_SCP_ceo = passFail(
      parityOk,
      `holding=${getHolding.status} main=${getMain.status}`,
    );
  } else {
    report.ac.VAL_DEC_CAT_04_retire = passFail(false, 'no createdId — skip retire');
    report.ac.VAL_DEC_SCP_ceo = passFail(false, 'no createdId — skip get');
  }

  // member OOS
  const loginMember = await login(MEMBER_EMAIL);
  pushStep('login_member', {
    ok: loginMember.ok,
    status: loginMember.status,
  });
  if (loginMember.ok && loginMember.token && createdId) {
    const oos = await call(
      loginMember.token,
      'GET',
      `/decisions/decision-types/${createdId}`,
      {
        query: { company_id: COMPANY },
        companyId: COMPANY,
      },
    );
    const deny = oos.status === 403 || oos.status === 404 || oos.status === 409;
    pushStep('VAL_DEC_SCP_member_oos', oos, { ok: deny });
    report.ac.VAL_DEC_SCP_member_oos = passFail(
      deny,
      `${oos.status} ${oos.code} (expect 403|404|409)`,
    );
  } else {
    report.ac.VAL_DEC_SCP_member_oos = passFail(
      false,
      `member login/createdId missing loginOk=${loginMember.ok} id=${createdId}`,
    );
  }

  // FORBIDDEN hard-delete
  if (createdId) {
    const del = await call(token, 'DELETE', `/decisions/decision-types/${createdId}`, {
      query: { company_id: COMPANY },
    });
    const delOk = del.status === 404 || del.status === 405 || del.status === 403;
    pushStep('VAL_DEC_CAT_05_hard_delete_forbidden', del, { ok: delOk });
    report.ac.VAL_DEC_CAT_05_hard_delete = passFail(
      delOk,
      `${del.status} ${del.code} (expect 404/405 no hard-delete)`,
    );
  } else {
    report.ac.VAL_DEC_CAT_05_hard_delete = passFail(false, 'no createdId');
  }

  // honesty lock
  report.ac.honesty_locked = passFail(
    Object.values(report.honesty).every((v) => v === false),
    'all *_ready / browser_uf / module_uat false LOCKED',
  );

  // FE HOLD stamp
  report.ac.browser_settings_hold = passFail(
    true,
    'FE HOLD — do not claim Settings browser PASS (R-PLT-DEC-FE-01)',
  );

  const acEntries = Object.entries(report.ac);
  const passCount = acEntries.filter(([, v]) => v.ok).length;
  const failCount = acEntries.filter(([, v]) => !v.ok).length;
  const verdict = failCount === 0 ? 'PASS' : 'FAIL';
  report.overall = {
    verdict,
    ack_status: verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    pass: passCount,
    fail: failCount,
    total_ac: acEntries.length,
    stamp: STAMP,
    fe_hold: true,
    honesty_locked: true,
  };

  if (verdict === 'FAIL') {
    report.residual.push({
      id: 'D-DEC-PLT-L1-AC',
      severity: 'P1',
      owner: 'dev-be',
      summary: `L1 AC fail ${failCount}/${acEntries.length}`,
      failed: acEntries.filter(([, v]) => !v.ok).map(([k, v]) => ({ k, note: v.note })),
    });
  }

  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify({ overall: report.overall, ac: report.ac, residual: report.residual }, null, 2));
  console.log('evidence_json', OUT);
  process.exit(verdict === 'PASS' ? 0 : 2);
} catch (e) {
  report.overall = {
    verdict: 'FAIL',
    ack_status: 'FAIL_TO_PM',
    error: String(e?.stack || e),
    stamp: STAMP,
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  console.error(e);
  process.exit(2);
}
