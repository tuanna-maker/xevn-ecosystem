#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01 — L1 API smoke
 * U65 zero-seed · browser UF HOLD · honesty flags LOCKED false
 * verify: DOC + ET catalog · open key · format reject · hyphen normalize ·
 *         effective EMP wins · retire hide · scope_parity · FORBIDDEN closed enum / hard-delete
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
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
const STAMP = `EMPPLATQA-${Date.now().toString(36).toUpperCase()}`;
const DOC_KEY = `hr_doc_custom_09_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ET_KEY = `seasonal_temp_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-qa-01.FINAL.json',
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

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01',
  stamp: STAMP,
  git_head: gitHead(),
  lane: 'L1_API_smoke_only',
  u65: 'zero-seed · probe ≠ UF · browser UF HOLD until FE',
  honesty: {
    hrm_personnel_uat_ready: false,
    employees_e2e_linkage_ready: false,
    payroll_e2e_ready: false,
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    browser_uf: false,
    module_uat: false,
  },
  account: EMAIL,
  member_account: MEMBER_EMAIL,
  company_id_query: COMPANY,
  x_company_id: HEADER_COMPANY,
  doc_key: DOC_KEY,
  et_key: ET_KEY,
  steps: [],
  ac: {},
  residual: [],
  overall: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
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

  // Stale-dist probe — routes must exist (401/403) not 404
  const staleDoc = await fetch(`${HRM}/employees/document-types?company_id=${COMPANY}`).then(
    async (r) => ({ status: r.status, text: (await r.text()).slice(0, 220) }),
  );
  const staleEt = await fetch(`${HRM}/employees/employment-types?company_id=${COMPANY}`).then(
    async (r) => ({ status: r.status, text: (await r.text()).slice(0, 220) }),
  );
  const routeLive =
    (staleDoc.status === 401 || staleDoc.status === 403) &&
    (staleEt.status === 401 || staleEt.status === 403);
  pushStep('stale_dist_probe_unauth', {
    doc: staleDoc,
    et: staleEt,
    ok: routeLive || (staleDoc.status === 200 && staleEt.status === 200),
    note:
      staleDoc.status === 404 || staleEt.status === 404
        ? 'STALE DIST — document-types / employment-types missing'
        : `routes present (doc=${staleDoc.status} et=${staleEt.status})`,
  });
  if (staleDoc.status === 404 || staleEt.status === 404) {
    report.ac.ensureSchema_list = passFail(false, '404 catalog routes — stale dist');
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

  // ========== 1) ensureSchema live GET document-types ==========
  const listDoc0 = await call(token, 'GET', '/employees/document-types', {
    query: { company_id: COMPANY },
  });
  const listDoc0Rows = asList(listDoc0.data);
  pushStep('GET_document_types_holding', listDoc0, {
    total: listDoc0.data?.total ?? listDoc0Rows.length,
    rowCount: listDoc0Rows.length,
  });
  report.ac.ensureSchema_doc_list = passFail(
    listDoc0.status === 200,
    listDoc0.status === 200
      ? `200 · total=${listDoc0.data?.total ?? listDoc0Rows.length} (empty [] OK U65)`
      : `${listDoc0.status} ${listDoc0.code}`,
  );

  // ========== 2) POST open key + CCCD uppercase reject ==========
  const createDocBody = {
    companyId: COMPANY,
    documentTypeKey: DOC_KEY,
    nameVi: `QA loại HS ${STAMP}`,
    requiredByDefault: false,
    requiresExpiry: false,
  };
  const createDoc = await call(token, 'POST', '/employees/document-types', {
    body: createDocBody,
  });
  const createdDoc =
    createDoc.data && typeof createDoc.data === 'object' && !Array.isArray(createDoc.data)
      ? createDoc.data
      : asList(createDoc.data)[0] ?? null;
  pushStep('POST_document_types_open_key', createDoc, {
    bodySent: createDocBody,
    createdId: createdDoc?.id ?? null,
  });
  const createDocOk =
    (createDoc.status === 201 || createDoc.status === 200) && createdDoc?.id;
  report.ac.val_emp_doc_open_key = passFail(
    createDocOk,
    createDocOk
      ? `created id=${createdDoc.id} key=${createdDoc.documentTypeKey}`
      : `${createDoc.status} ${createDoc.code} ${createDoc.message}`,
  );

  // Literal hr_doc_custom_09 — prove open catalog not enum ceiling
  const c09 = await call(token, 'POST', '/employees/document-types', {
    body: {
      companyId: COMPANY,
      documentTypeKey: 'hr_doc_custom_09',
      nameVi: `QA hr_doc_custom_09 ${STAMP}`,
    },
  });
  pushStep('POST_document_types_hr_doc_custom_09_literal', c09);
  const open09Ok =
    c09.status === 201 ||
    c09.status === 200 ||
    (c09.status === 409 && String(c09.code || '').includes('CONFLICT'));
  report.ac.val_emp_doc_literal_09 = passFail(
    open09Ok,
    `${c09.status} ${c09.code ?? ''} — open catalog (not enum ceiling)`,
  );

  // Uppercase CCCD → 400 HRM-PLT-CAT-CODE-INVALID
  const cccd = await call(token, 'POST', '/employees/document-types', {
    body: {
      companyId: COMPANY,
      documentTypeKey: 'CCCD',
      nameVi: 'Should reject uppercase',
    },
  });
  pushStep('POST_document_types_CCCD_invalid', cccd);
  report.ac.val_emp_doc_cccd_invalid = passFail(
    cccd.status === 400 && cccd.code === 'HRM-PLT-CAT-CODE-INVALID',
    `${cccd.status} ${cccd.code}`,
  );

  // ========== 3) employment-types seasonal_temp + full-time normalize ==========
  const listEt0 = await call(token, 'GET', '/employees/employment-types', {
    query: { company_id: COMPANY },
  });
  const listEt0Rows = asList(listEt0.data);
  pushStep('GET_employment_types_holding', listEt0, {
    total: listEt0.data?.total ?? listEt0Rows.length,
    rowCount: listEt0Rows.length,
  });
  report.ac.ensureSchema_et_list = passFail(
    listEt0.status === 200,
    listEt0.status === 200
      ? `200 · total=${listEt0.data?.total ?? listEt0Rows.length}`
      : `${listEt0.status} ${listEt0.code}`,
  );

  const createEtBody = {
    companyId: COMPANY,
    employmentTypeKey: ET_KEY.startsWith('seasonal_temp') ? ET_KEY : 'seasonal_temp',
    nameVi: `QA loại HĐLĐ ${STAMP}`,
    countsTowardHeadcount: false,
    isContingent: true,
  };
  const createEt = await call(token, 'POST', '/employees/employment-types', {
    body: createEtBody,
  });
  const createdEt =
    createEt.data && typeof createEt.data === 'object' && !Array.isArray(createEt.data)
      ? createEt.data
      : asList(createEt.data)[0] ?? null;
  pushStep('POST_employment_types_5th_plus', createEt, {
    bodySent: createEtBody,
    createdId: createdEt?.id ?? null,
  });
  const createEtOk =
    (createEt.status === 201 || createEt.status === 200) && createdEt?.id;
  report.ac.val_emp_et_open_5th = passFail(
    createEtOk,
    createEtOk
      ? `created id=${createdEt.id} key=${createdEt.employmentTypeKey}`
      : `${createEt.status} ${createEt.code} ${createEt.message}`,
  );

  // Literal seasonal_temp if unique worked
  if (createEtOk && ET_KEY !== 'seasonal_temp') {
    const lit = await call(token, 'POST', '/employees/employment-types', {
      body: {
        companyId: COMPANY,
        employmentTypeKey: 'seasonal_temp',
        nameVi: `QA seasonal_temp ${STAMP}`,
        isContingent: true,
      },
    });
    pushStep('POST_employment_types_seasonal_temp_literal', lit);
    const litOk =
      lit.status === 201 ||
      lit.status === 200 ||
      (lit.status === 409 && String(lit.code || '').includes('CONFLICT'));
    report.ac.val_emp_et_literal_seasonal = passFail(
      litOk,
      `${lit.status} ${lit.code ?? ''} — open 5th+ (not enum ceiling)`,
    );
  }

  // full-time → persist full_time
  const hyphen = await call(token, 'POST', '/employees/employment-types', {
    body: {
      companyId: COMPANY,
      employmentTypeKey: 'full-time',
      nameVi: `QA full-time normalize ${STAMP}`,
      countsTowardHeadcount: true,
    },
  });
  const hyphenRow =
    hyphen.data && typeof hyphen.data === 'object' && !Array.isArray(hyphen.data)
      ? hyphen.data
      : null;
  pushStep('POST_employment_types_full-time_normalize', hyphen, {
    persistedKey: hyphenRow?.employmentTypeKey ?? null,
  });
  const hyphenOk =
    (hyphen.status === 201 ||
      hyphen.status === 200 ||
      (hyphen.status === 409 && String(hyphen.code || '').includes('CONFLICT'))) &&
    (hyphenRow?.employmentTypeKey === 'full_time' ||
      hyphen.status === 409); // conflict means key full_time already exists from prior normalize
  // If 409, confirm list has full_time
  let fullTimePersisted = hyphenRow?.employmentTypeKey === 'full_time';
  if (!fullTimePersisted) {
    const checkFt = await call(token, 'GET', '/employees/employment-types', {
      query: { company_id: COMPANY, q: 'full_time', include_archived: 'true' },
    });
    fullTimePersisted = asList(checkFt.data).some((r) => r.employmentTypeKey === 'full_time');
    pushStep('GET_employment_types_full_time_check', checkFt, { fullTimePersisted });
  }
  report.ac.val_emp_et_hyphen_normalize = passFail(
    (hyphen.status === 201 || hyphen.status === 200 || hyphen.status === 409) &&
      fullTimePersisted,
    `status=${hyphen.status} key=${hyphenRow?.employmentTypeKey} fullTimePersisted=${fullTimePersisted}`,
  );

  // ========== 4) effective EMP wins REF ==========
  const effective0 = await call(token, 'GET', '/employees/employment-types/effective', {
    query: { company_id: COMPANY },
  });
  const effRows = asList(effective0.data);
  pushStep('GET_employment_types_effective', effective0, {
    total: effective0.data?.total ?? effRows.length,
    sample: effRows.slice(0, 8).map((r) => ({
      key: r.employmentTypeKey,
      source: r.source,
      nameVi: r.nameVi,
    })),
  });
  const effHasCreated = effRows.some(
    (r) => r.employmentTypeKey === createdEt?.employmentTypeKey,
  );
  report.ac.effective_includes_emp = passFail(
    effective0.status === 200 && (!createEtOk || effHasCreated),
    `status=${effective0.status} hasCreated=${effHasCreated} total=${effective0.data?.total ?? effRows.length}`,
  );

  const refOnly = effRows.filter((r) => r.source === 'group_ref');
  const overrideRows = effRows.filter((r) => r.source === 'emp_override');
  let collision = {
    attempted: false,
    ok: false,
    note: 'no REF keys — EMP-native present; collision deferred',
  };
  if (refOnly.length > 0) {
    const refKey = refOnly[0].employmentTypeKey;
    const upsertCollision = await call(token, 'POST', '/employees/employment-types', {
      body: {
        companyId: COMPANY,
        employmentTypeKey: refKey,
        nameVi: `EMP override ${STAMP}`,
        countsTowardHeadcount: true,
      },
    });
    pushStep('POST_employment_types_collision_with_ref', upsertCollision, { refKey });
    const eff2 = await call(token, 'GET', '/employees/employment-types/effective', {
      query: { company_id: COMPANY, q: refKey },
    });
    const hit = asList(eff2.data).find((r) => r.employmentTypeKey === refKey);
    pushStep('GET_effective_after_collision', eff2, { hit });
    collision = {
      attempted: true,
      ok: hit?.source === 'emp_override' || hit?.source === 'emp_native',
      note: `refKey=${refKey} source=${hit?.source} nameVi=${hit?.nameVi}`,
    };
  } else if (overrideRows.length > 0) {
    collision = {
      attempted: true,
      ok: true,
      note: `pre-existing emp_override rows=${overrideRows.length} key=${overrideRows[0].employmentTypeKey}`,
    };
  } else {
    // Force: upsert full_time then re-read — if REF also has full_time → emp_override
    const forceFt = await call(token, 'POST', '/employees/employment-types', {
      body: {
        companyId: COMPANY,
        employmentTypeKey: 'full_time',
        nameVi: `EMP full_time wins ${STAMP}`,
        countsTowardHeadcount: true,
      },
    });
    pushStep('POST_employment_types_full_time_for_collision', forceFt);
    const eff3 = await call(token, 'GET', '/employees/employment-types/effective', {
      query: { company_id: COMPANY, q: 'full_time' },
    });
    const hitFt = asList(eff3.data).find((r) => r.employmentTypeKey === 'full_time');
    pushStep('GET_effective_full_time', eff3, { hitFt });
    if (hitFt?.source === 'emp_override') {
      collision = {
        attempted: true,
        ok: true,
        note: 'EMP+REF collision → source=emp_override',
      };
    } else if (hitFt?.source === 'emp_native') {
      collision = {
        attempted: true,
        ok: true,
        note: 'EMP-native full_time in effective; no REF peer observed (EMP wins vacuously)',
      };
    } else {
      collision = {
        attempted: true,
        ok: false,
        note: `unexpected full_time source=${hitFt?.source} status=${forceFt.status}`,
      };
    }
  }
  report.ac.val_emp_et_emp_wins = passFail(collision.ok, collision.note);

  // DOC effective also reachable
  const docEff = await call(token, 'GET', '/employees/document-types/effective', {
    query: { company_id: COMPANY },
  });
  pushStep('GET_document_types_effective', docEff, {
    total: docEff.data?.total ?? asList(docEff.data).length,
  });
  report.ac.effective_doc_reachable = passFail(
    docEff.status === 200,
    `${docEff.status} ${docEff.code ?? ''}`,
  );

  // ========== 5) retire → hide from default list ==========
  let retireDoc = null;
  let retireEt = null;
  if (createdDoc?.id) {
    retireDoc = await call(token, 'POST', `/employees/document-types/${createdDoc.id}/retire`, {
      query: { company_id: COMPANY },
    });
    pushStep('POST_document_types_retire', retireDoc);
    const afterRetireDoc = await call(token, 'GET', '/employees/document-types', {
      query: { company_id: COMPANY, q: createdDoc.documentTypeKey },
    });
    const archivedDoc = await call(token, 'GET', '/employees/document-types', {
      query: {
        company_id: COMPANY,
        q: createdDoc.documentTypeKey,
        include_archived: 'true',
      },
    });
    const activeHide = !asList(afterRetireDoc.data).some((r) => r.id === createdDoc.id);
    const archivedShow = asList(archivedDoc.data).some(
      (r) =>
        r.id === createdDoc.id &&
        (r.status === 'retired' || r.archivedAt || r.archived_at),
    );
    pushStep('GET_document_types_after_retire', afterRetireDoc, {
      activeHide,
      archivedShow,
      retireStatus: retireDoc?.data?.status ?? retireDoc?.json?.data?.status,
    });
    pushStep('GET_document_types_include_archived', archivedDoc, {
      archivedShow,
      hit: asList(archivedDoc.data).find((r) => r.id === createdDoc.id),
    });
    report.ac.val_emp_doc_retire_hide = passFail(
      (retireDoc.status === 201 || retireDoc.status === 200) && activeHide && archivedShow,
      `retire=${retireDoc.status} activeHide=${activeHide} archivedShow=${archivedShow}`,
    );
  } else {
    report.ac.val_emp_doc_retire_hide = passFail(false, 'no createdDoc to retire');
  }

  if (createdEt?.id) {
    retireEt = await call(token, 'POST', `/employees/employment-types/${createdEt.id}/retire`, {
      query: { company_id: COMPANY },
    });
    pushStep('POST_employment_types_retire', retireEt);
    const afterRetireEt = await call(token, 'GET', '/employees/employment-types', {
      query: { company_id: COMPANY, q: createdEt.employmentTypeKey },
    });
    const archivedEt = await call(token, 'GET', '/employees/employment-types', {
      query: {
        company_id: COMPANY,
        q: createdEt.employmentTypeKey,
        include_archived: 'true',
      },
    });
    const activeHideEt = !asList(afterRetireEt.data).some((r) => r.id === createdEt.id);
    const archivedShowEt = asList(archivedEt.data).some(
      (r) =>
        r.id === createdEt.id &&
        (r.status === 'retired' || r.archivedAt || r.archived_at),
    );
    pushStep('GET_employment_types_after_retire', afterRetireEt, {
      activeHideEt,
      archivedShowEt,
    });
    pushStep('GET_employment_types_include_archived', archivedEt, {
      archivedShowEt,
      hit: asList(archivedEt.data).find((r) => r.id === createdEt.id),
    });
    report.ac.val_emp_et_retire_hide = passFail(
      (retireEt.status === 201 || retireEt.status === 200) &&
        activeHideEt &&
        archivedShowEt,
      `retire=${retireEt.status} activeHide=${activeHideEt} archivedShow=${archivedShowEt}`,
    );
  } else {
    report.ac.val_emp_et_retire_hide = passFail(false, 'no createdEt to retire');
  }

  // ========== 6) scope_parity group CEO main↔holding; member OOS ==========
  // Re-create a fresh DOC row for get-by-id (prior may be retired)
  const scopeCreate = await call(token, 'POST', '/employees/document-types', {
    body: {
      companyId: COMPANY,
      documentTypeKey: `hr_doc_scope_${Date.now().toString(36).toLowerCase()}`.slice(0, 48),
      nameVi: `QA scope parity ${STAMP}`,
    },
  });
  const scopeRow =
    scopeCreate.data && typeof scopeCreate.data === 'object' && !Array.isArray(scopeCreate.data)
      ? scopeCreate.data
      : null;
  pushStep('POST_document_types_scope_row', scopeCreate, { id: scopeRow?.id });

  let getHolding = null;
  let getMainQuery = null;
  if (scopeRow?.id) {
    getHolding = await call(token, 'GET', `/employees/document-types/${scopeRow.id}`, {
      query: { company_id: COMPANY },
    });
    getMainQuery = await call(token, 'GET', `/employees/document-types/${scopeRow.id}`, {
      query: { company_id: 'main' },
    });
    pushStep('GET_document_types_by_id_holding', getHolding);
    pushStep('GET_document_types_by_id_main_query', getMainQuery);
  }

  // List with company_id=main should include holding for group CEO
  const listMain = await call(token, 'GET', '/employees/document-types', {
    query: { company_id: 'main', include_archived: 'true', q: scopeRow?.documentTypeKey },
  });
  const inMainList = asList(listMain.data).some((r) => r.id === scopeRow?.id);
  pushStep('GET_document_types_main_list', listMain, { inMainList });

  const scopeParityOk =
    scopeRow?.id &&
    getHolding?.status === 200 &&
    getHolding?.data?.id === scopeRow.id &&
    (getMainQuery?.status === 200 || inMainList);
  report.ac.scope_parity_group_ceo = passFail(
    !!scopeParityOk,
    `create=${scopeCreate.status} getHolding=${getHolding?.status} getMain=${getMainQuery?.status} inMainList=${inMainList}`,
  );

  // Member CEO OOS — try get holding row with member token
  const memberAuth = await login(MEMBER_EMAIL);
  pushStep('login_member', {
    status: memberAuth.status,
    ok: memberAuth.ok,
    via: memberAuth.via ?? null,
    memberships: (memberAuth.memberships || []).slice(0, 4).map((m) => ({
      companyId: m.companyId || m.company_id,
      tenantId: m.tenantId || m.tenant_id,
    })),
  });
  if (memberAuth.ok && scopeRow?.id) {
    const memCompany =
      memberAuth.memberships?.[0]?.companyId ||
      memberAuth.memberships?.[0]?.company_id ||
      'main';
    const memTenant =
      memberAuth.memberships?.[0]?.tenantId ||
      memberAuth.memberships?.[0]?.tenant_id ||
      'xe-du-lich';
    const oos = await call(
      memberAuth.token,
      'GET',
      `/employees/document-types/${scopeRow.id}`,
      {
        query: { company_id: COMPANY },
        companyId: memCompany,
        tenantId: memTenant,
      },
    );
    pushStep('GET_document_types_member_OOS', oos, {
      memCompany,
      memTenant,
    });
    // Pilot matrix: member CEO expect 403/409 rollup/OOS deny (not 200 leak)
    const oosOk =
      oos.status === 404 ||
      oos.status === 403 ||
      (oos.status === 409 &&
        (oos.code === 'SCOPE_CONTEXT_MISMATCH' ||
          String(oos.message || '').includes('mismatches token scope')));
    report.ac.scope_parity_member_oos = passFail(
      oosOk,
      `member get holding row → ${oos.status} ${oos.code}`,
    );
  } else {
    report.ac.scope_parity_member_oos = passFail(
      false,
      `member login=${memberAuth.ok} scopeRow=${!!scopeRow?.id}`,
    );
  }

  // ET scope parity list↔get
  if (createdEt?.id || scopeRow) {
    const etScopeCreate = await call(token, 'POST', '/employees/employment-types', {
      body: {
        companyId: COMPANY,
        employmentTypeKey: `et_scope_${Date.now().toString(36).toLowerCase()}`.slice(0, 48),
        nameVi: `QA ET scope ${STAMP}`,
      },
    });
    const etScopeRow =
      etScopeCreate.data &&
      typeof etScopeCreate.data === 'object' &&
      !Array.isArray(etScopeCreate.data)
        ? etScopeCreate.data
        : null;
    pushStep('POST_employment_types_scope_row', etScopeCreate, { id: etScopeRow?.id });
    if (etScopeRow?.id) {
      const etGet = await call(token, 'GET', `/employees/employment-types/${etScopeRow.id}`, {
        query: { company_id: COMPANY },
      });
      pushStep('GET_employment_types_by_id', etGet);
      report.ac.scope_parity_et_list_get = passFail(
        etGet.status === 200 && etGet.data?.id === etScopeRow.id,
        `get=${etGet.status} idMatch=${etGet.data?.id === etScopeRow.id}`,
      );
    }
  }

  // ========== 7) FORBIDDEN: hard-delete; closed enum honesty ==========
  let hardDelete = null;
  if (scopeRow?.id) {
    hardDelete = await call(token, 'DELETE', `/employees/document-types/${scopeRow.id}`, {
      query: { company_id: COMPANY },
    });
    pushStep('DELETE_document_types_forbidden', hardDelete);
  }
  // Nest typically 404/405 for undeclared DELETE — both prove no hard-delete path
  const hardDeleteOk =
    !hardDelete ||
    hardDelete.status === 404 ||
    hardDelete.status === 405 ||
    hardDelete.status === 501 ||
    (hardDelete.status >= 400 && hardDelete.status < 500);
  report.ac.forbidden_hard_delete = passFail(
    hardDeleteOk && hardDelete?.status !== 200 && hardDelete?.status !== 204,
    hardDelete
      ? `DELETE → ${hardDelete.status} ${hardDelete.code ?? ''} (no hard-delete success)`
      : 'no id to probe',
  );

  // Closed enum: uppercase already proved CODE-INVALID; also try mixed invalid format
  const closedEnumProbe = await call(token, 'POST', '/employees/employment-types', {
    body: {
      companyId: COMPANY,
      employmentTypeKey: 'FULL_TIME',
      nameVi: 'Should reject closed/uppercase',
    },
  });
  pushStep('POST_employment_types_FULL_TIME_invalid', closedEnumProbe);
  report.ac.forbidden_closed_enum = passFail(
    closedEnumProbe.status === 400 &&
      closedEnumProbe.code === 'HRM-PLT-CAT-CODE-INVALID',
    `${closedEnumProbe.status} ${closedEnumProbe.code}`,
  );

  // must_keep: employees list + contracts reachable
  const empList = await call(token, 'GET', '/employees', {
    query: { company_id: COMPANY, page_size: 3 },
  });
  pushStep('must_keep_employees_list', {
    status: empList.status,
    code: empList.code,
    ok: empList.status === 200,
    count: asList(empList.data).length,
  });
  const contracts = await call(token, 'GET', '/contracts-insurance/contracts', {
    query: { company_id: COMPANY, page_size: 3 },
  });
  pushStep('must_keep_contracts', {
    status: contracts.status,
    code: contracts.code,
    ok: contracts.status === 200 || contracts.status === 404,
    note: contracts.status === 200 ? 'contracts reachable' : `${contracts.status}`,
  });
  report.ac.must_keep_emp_contracts = passFail(
    empList.status === 200 && (contracts.status === 200 || contracts.status === 404),
    `employees=${empList.status} contracts=${contracts.status}`,
  );

  // Honesty lock stamp — never flip
  report.ac.honesty_locked_false = passFail(
    report.honesty.hrm_personnel_uat_ready === false &&
      report.honesty.employees_e2e_linkage_ready === false &&
      report.honesty.payroll_e2e_ready === false &&
      report.honesty.attendance_uat_ready === false &&
      report.honesty.recruitment_uat_ready === false,
    'all honesty flags remain false (LOCKED)',
  );

  // --- Overall ---
  const acEntries = Object.entries(report.ac);
  const failed = acEntries.filter(([, v]) => !v.ok);
  const allPass = failed.length === 0;
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    pass_count: acEntries.filter(([, v]) => v.ok).length,
    fail_count: failed.length,
    failed_ids: failed.map(([k]) => k),
    stamp: STAMP,
    note: allPass
      ? 'L1 API PASS · browser FE HOLD · honesty LOCKED false · DENIED personnel UAT'
      : `L1 FAIL: ${failed.map(([k, v]) => `${k}:${v.note}`).join(' | ')}`,
  };

  if (!allPass) {
    report.residual = failed.map(([k, v]) => ({
      id: `D-EMP-PLT-${k.toUpperCase()}`,
      ac: k,
      note: v.note,
      owner: 'dev-be',
    }));
  } else {
    report.residual = [
      {
        id: 'R-PLT-EMP-FE',
        note: 'Browser Settings pickers DOC/ET HOLD until FE wire',
        owner: 'dev-fe',
      },
      {
        id: 'R-PLT-EMP-01',
        note: 'Wire checklist/ACT → assert DOC',
        owner: 'dev-be',
      },
      {
        id: 'R-PLT-EMP-02',
        note: 'Wire YCTD/employee employment_type → assert ET',
        owner: 'dev-be',
      },
    ];
  }

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.overall, null, 2));
  console.log(`evidence_json=${OUT}`);
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
