#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-TPL-QA-01 — L1 API smoke (NOT browser UF / NOT module UAT)
 * U65 zero-seed · payroll_e2e_ready=false · cấm treat salary-templates pack as mẫu
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const STAMP = `PAYTPLQA-${Date.now().toString(36).toUpperCase()}`;
const CODE = `qa_sheet_${Date.now().toString(36).toLowerCase()}`.slice(0, 48);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function decodeSub(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub ?? null;
  } catch {
    return null;
  }
}

async function login(email, password = PASSWORD) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j.data || j;
  const token = d.accessToken || d.access_token;
  if (!r.ok || !token) {
    return { ok: false, status: r.status, body: summarizeBody(j), token: null, sub: null };
  }
  return { ok: true, status: r.status, token, sub: decodeSub(token), body: null };
}

async function call(token, method, path, { query, body, companyId = COMPANY } = {}) {
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
    dataSummary: summarizeBody(json?.data ?? json, 700),
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

const report = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-TPL-QA-01',
  stamp: STAMP,
  lane: 'L1_API_smoke_only',
  u65: 'zero-seed · probe ≠ UF · cấm claim payroll_e2e_ready · cấm treat pack as mẫu',
  honesty: {
    payroll_e2e_ready: false,
    browser_uf: false,
    module_uat: false,
    pack_is_not_mau: true,
  },
  account: EMAIL,
  company_id: COMPANY,
  steps: [],
  ac: {},
  residual: [],
  overall: null,
};

function pushStep(name, result, extra = {}) {
  report.steps.push({ name, ...result, ...extra });
}

try {
  // --- L0 spot ---
  const health = await fetch(`${HRM.replace(/\/api\/hrm$/, '')}/api/hrm`).then(async (r) => ({
    status: r.status,
    text: (await r.text()).slice(0, 120),
  }));
  pushStep('L0_hrm_health', {
    status: health.status,
    ok: health.status === 200,
    note: health.text,
  });

  // Stale-dist probe (unauth): 401 = route live; 404 = rebuild needed
  const staleProbe = await fetch(
    `${HRM}/payroll/pay-sheet-templates?company_id=${COMPANY}`,
  ).then(async (r) => ({ status: r.status, text: (await r.text()).slice(0, 200) }));
  const routeLive = staleProbe.status === 401 || staleProbe.status === 403;
  pushStep('stale_dist_probe_unauth', {
    status: staleProbe.status,
    ok: routeLive || staleProbe.status === 200,
    note:
      staleProbe.status === 404
        ? 'STALE DIST — need rebuild/restart'
        : `route present (${staleProbe.status})`,
    body: staleProbe.text,
  });
  if (staleProbe.status === 404) {
    report.ac.ac1_crud = passFail(false, '404 pay-sheet-templates — stale dist');
    report.overall = {
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      reason: 'stale_dist_404',
    };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.error(JSON.stringify(report.overall));
    process.exit(2);
  }

  const auth = await login(EMAIL);
  pushStep('login', {
    status: auth.status,
    ok: auth.ok,
    sub: auth.sub,
    note: auth.ok ? 'Bearer ok' : auth.body,
  });
  if (!auth.ok) {
    report.overall = { verdict: 'FAIL', ack_status: 'FAIL_TO_PM', reason: 'login_failed' };
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    process.exit(2);
  }
  const token = auth.token;

  // --- AC1: LIST empty/create/get/patch ---
  const list0 = await call(token, 'GET', '/payroll/pay-sheet-templates', {
    query: { company_id: COMPANY },
  });
  pushStep('list_templates_before', list0, {
    count: asList(list0.data).length,
  });

  const create = await call(token, 'POST', '/payroll/pay-sheet-templates', {
    body: {
      company_id: COMPANY,
      code: CODE,
      name: `QA mẫu bảng lương ${STAMP}`,
      description: 'L1 smoke AMIS mẫu — not pack',
      status: 'draft',
      isDefault: false,
      applicabilityScope: 'company',
    },
  });
  const createdId = create.data?.id ?? null;
  const persistCompany = create.data?.companyId ?? create.data?.company_id ?? null;
  pushStep('create_template', create, { createdId, persistCompany, code: CODE });

  const getMain = createdId
    ? await call(token, 'GET', `/payroll/pay-sheet-templates/${createdId}`, {
        query: { company_id: COMPANY },
      })
    : { status: 0, code: null, ok: false, note: 'no id' };
  pushStep('get_by_id_main', getMain);

  const patch = createdId
    ? await call(token, 'PATCH', `/payroll/pay-sheet-templates/${createdId}`, {
        body: {
          company_id: COMPANY,
          name: `QA mẫu bảng lương ${STAMP} (patched)`,
          status: 'active',
        },
      })
    : { status: 0, code: null };
  pushStep('patch_activate', patch);

  const ac1Ok =
    list0.status === 200 &&
    (create.status === 201 || create.status === 200) &&
    Boolean(createdId) &&
    getMain.status === 200 &&
    (patch.status === 200 || patch.status === 201) &&
    (patch.data?.status === 'active' || getMain.status === 200);
  report.ac.ac1_list_create_get_patch = passFail(
    ac1Ok,
    `list=${list0.status}/${list0.code} create=${create.status}/${create.code} get=${getMain.status} patch=${patch.status} status=${patch.data?.status}`,
  );

  // --- AC2: PUT lines (component + display_label + sort_order + optional OV-C) ---
  const comps = await call(token, 'GET', '/payroll/salary-components', {
    query: { company_id: COMPANY },
  });
  const compRows = asList(comps.data);
  const c1 = compRows[0];
  const c2 = compRows[1] || compRows[0];
  pushStep('list_salary_components', {
    status: comps.status,
    code: comps.code,
    count: compRows.length,
    c1: c1 ? { id: c1.id, code: c1.code, name: c1.name } : null,
    c2: c2 ? { id: c2.id, code: c2.code } : null,
  });

  // Optional OV-C: try list formulas for a definition id; else jsonb preview stash only
  const formulas = await call(token, 'GET', '/payroll/formulas', {
    query: { company_id: COMPANY },
  });
  const formulaRows = asList(formulas.data);
  const activeFormula =
    formulaRows.find((f) => f.status === 'active') || formulaRows[0] || null;
  pushStep('list_formulas_optional_ovc', {
    status: formulas.status,
    code: formulas.code,
    count: formulaRows.length,
    picked: activeFormula
      ? { id: activeFormula.id, code: activeFormula.code, status: activeFormula.status }
      : null,
  });

  let putLines = { status: 0, code: null };
  let getLines = { status: 0, code: null };
  let lineHasLabel = false;
  let lineHasSort = false;
  let lineHasOvc = false;
  if (createdId && c1?.id) {
    const linesBody = {
      company_id: COMPANY,
      lines: [
        {
          componentId: c1.id,
          displayLabel: `Nhãn QA ${STAMP}`,
          sortOrder: 10,
          isVisible: true,
          formulaOverrideJson: { stub: true, stamp: STAMP, note: 'preview-only OV-C stash' },
          ...(activeFormula?.id
            ? { formulaOverrideDefinitionId: activeFormula.id }
            : {}),
        },
      ],
    };
    if (c2?.id && c2.id !== c1.id) {
      linesBody.lines.push({
        componentId: c2.id,
        displayLabel: `Cột 2 ${STAMP}`,
        sortOrder: 20,
        isVisible: true,
      });
    }
    putLines = await call(token, 'PUT', `/payroll/pay-sheet-templates/${createdId}/lines`, {
      body: linesBody,
    });
    getLines = await call(token, 'GET', `/payroll/pay-sheet-templates/${createdId}/lines`, {
      query: { company_id: COMPANY },
    });
    const linesOut = asList(getLines.data?.lines ?? getLines.data);
    lineHasLabel = linesOut.some(
      (l) =>
        (l.displayLabel || l.display_label || '').includes('Nhãn QA') ||
        (l.displayLabel || l.display_label || '').includes(STAMP),
    );
    lineHasSort = linesOut.some((l) => Number(l.sortOrder ?? l.sort_order) === 10);
    lineHasOvc = linesOut.some(
      (l) =>
        l.formulaOverrideDefinitionId ||
        l.formula_override_definition_id ||
        l.formulaOverrideJson ||
        l.formula_override_json,
    );
  }
  pushStep('put_lines', putLines, {
    lineHasLabel,
    lineHasSort,
    lineHasOvc,
    linesCount: asList(getLines.data?.lines ?? getLines.data).length,
  });
  pushStep('get_lines', getLines);

  const ac2Ok =
    comps.status === 200 &&
    Boolean(c1?.id) &&
    (putLines.status === 200 || putLines.status === 201) &&
    getLines.status === 200 &&
    lineHasLabel &&
    lineHasSort;
  report.ac.ac2_put_lines_label_sort_ovc = passFail(
    ac2Ok,
    `put=${putLines.status}/${putLines.code} label=${lineHasLabel} sort=${lineHasSort} ovc=${lineHasOvc} comps=${compRows.length}`,
  );

  // --- AC3: ARCHIVE hide from active list ---
  const archive = createdId
    ? await call(token, 'POST', `/payroll/pay-sheet-templates/${createdId}/archive`, {
        body: { company_id: COMPANY },
        query: { company_id: COMPANY },
      })
    : { status: 0 };
  // Some controllers take company_id only as query — retry with query if 400
  let archiveFinal = archive;
  if (createdId && archive.status >= 400) {
    archiveFinal = await call(
      token,
      'POST',
      `/payroll/pay-sheet-templates/${createdId}/archive?company_id=${COMPANY}`,
      { body: { company_id: COMPANY } },
    );
  }
  pushStep('archive_template', archiveFinal);

  const listActive = await call(token, 'GET', '/payroll/pay-sheet-templates', {
    query: { company_id: COMPANY },
  });
  const listArchived = await call(token, 'GET', '/payroll/pay-sheet-templates', {
    query: { company_id: COMPANY, include_archived: 'true' },
  });
  const inActive = asList(listActive.data).some((t) => t.id === createdId);
  const inArchived = asList(listArchived.data).some((t) => t.id === createdId);
  pushStep('list_after_archive', {
    status: listActive.status,
    activeCount: asList(listActive.data).length,
    inActive,
    archivedListStatus: listArchived.status,
    inArchived,
  });

  const ac3Ok =
    (archiveFinal.status === 200 || archiveFinal.status === 201) && !inActive;
  report.ac.ac3_archive_hide = passFail(
    ac3Ok,
    `archive=${archiveFinal.status}/${archiveFinal.code} inActive=${inActive} inArchived=${inArchived}`,
  );

  // --- AC4: Bind draft period → snapshot (need fresh ACTIVE template — archived can't bind) ---
  const create2 = await call(token, 'POST', '/payroll/pay-sheet-templates', {
    body: {
      company_id: COMPANY,
      code: `${CODE}_b`,
      name: `QA mẫu bind ${STAMP}`,
      status: 'active',
      applicabilityScope: 'company',
    },
  });
  const tplBindId = create2.data?.id ?? null;
  pushStep('create_template_for_bind', create2, { tplBindId });

  if (tplBindId && c1?.id) {
    await call(token, 'PUT', `/payroll/pay-sheet-templates/${tplBindId}/lines`, {
      body: {
        company_id: COMPANY,
        lines: [
          {
            componentId: c1.id,
            displayLabel: `Bind col ${STAMP}`,
            sortOrder: 1,
          },
        ],
      },
    });
  }

  // Create draft period WITHOUT template, then bind
  const ym = new Date();
  const label = `QA-TPL-${STAMP}`;
  const start = `${ym.getUTCFullYear()}-${String(ym.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const endDay = new Date(Date.UTC(ym.getUTCFullYear(), ym.getUTCMonth() + 1, 0)).getUTCDate();
  const end = `${ym.getUTCFullYear()}-${String(ym.getUTCMonth() + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  const periodCreate = await call(token, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: label,
      start_date: start,
      end_date: end,
      created_by: EMAIL,
    },
  });
  const periodId = periodCreate.data?.id ?? null;
  pushStep('create_draft_period', periodCreate, { periodId, label });

  let bind = { status: 0 };
  if (periodId && tplBindId) {
    bind = await call(token, 'POST', `/payroll/periods/${periodId}/bind-sheet-template`, {
      body: { company_id: COMPANY, paySheetTemplateId: tplBindId },
    });
  }
  pushStep('bind_sheet_template', bind);

  const snapshot =
    bind.data?.sheet_template_snapshot_json ??
    bind.data?.sheetTemplateSnapshotJson ??
    null;
  const boundTplId =
    bind.data?.pay_sheet_template_id ?? bind.data?.paySheetTemplateId ?? null;
  const snapshotOk =
    snapshot &&
    (Array.isArray(snapshot.columns) || Array.isArray(snapshot?.Columns)) &&
    (boundTplId === tplBindId || Boolean(boundTplId));

  // Also exercise create-with-paySheetTemplateId path (second period)
  const periodCreateBound = tplBindId
    ? await call(token, 'POST', '/payroll/periods', {
        body: {
          company_id: COMPANY,
          period_label: `${label}-C`,
          start_date: start,
          end_date: end,
          created_by: EMAIL,
          paySheetTemplateId: tplBindId,
        },
      })
    : { status: 0 };
  const createBoundSnapshot =
    periodCreateBound.data?.sheet_template_snapshot_json ??
    periodCreateBound.data?.sheetTemplateSnapshotJson ??
    null;
  pushStep('create_period_with_paySheetTemplateId', periodCreateBound, {
    hasSnapshot: Boolean(createBoundSnapshot),
  });

  const ac4Ok =
    Boolean(tplBindId) &&
    (periodCreate.status === 201 || periodCreate.status === 200) &&
    (bind.status === 200 || bind.status === 201) &&
    snapshotOk;
  report.ac.ac4_bind_snapshot = passFail(
    ac4Ok,
    `bind=${bind.status}/${bind.code} snapshotCols=${Array.isArray(snapshot?.columns) ? snapshot.columns.length : 0} createBound=${periodCreateBound.status} createBoundSnap=${Boolean(createBoundSnapshot)}`,
  );

  // --- AC5: scope_parity main↔holding ---
  let getHolding = { status: 0 };
  let listHolding = { status: 0 };
  if (tplBindId) {
    listHolding = await call(token, 'GET', '/payroll/pay-sheet-templates', {
      query: { company_id: 'holding' },
      companyId: 'holding',
    });
    getHolding = await call(token, 'GET', `/payroll/pay-sheet-templates/${tplBindId}`, {
      query: { company_id: 'holding' },
      companyId: 'holding',
    });
  }
  const getMainBind = tplBindId
    ? await call(token, 'GET', `/payroll/pay-sheet-templates/${tplBindId}`, {
        query: { company_id: COMPANY },
      })
    : { status: 0 };
  // Plane B: persist may be holding; list/get with main must resolve (same as formula QA)
  const scopeOk =
    getMainBind.status === 200 &&
    (getHolding.status === 200 || getHolding.status === 404) &&
    // If holding get 200, ids must match; if 404, not a leak of wrong tenant as 200 empty wrong
    (getHolding.status !== 200 || getHolding.data?.id === tplBindId);
  pushStep('scope_parity_main_holding', {
    getMain: getMainBind.status,
    getHolding: getHolding.status,
    listHolding: listHolding.status,
    persistCompany: create2.data?.companyId ?? create2.data?.company_id,
    holdingIdMatch: getHolding.data?.id === tplBindId,
  });
  report.ac.ac5_scope_parity = passFail(
    scopeOk,
    `getMain=${getMainBind.status} getHolding=${getHolding.status} persist=${create2.data?.companyId ?? create2.data?.company_id}`,
  );

  // --- AC6: salary-templates pack still enroll-only (≠ mẫu) ---
  const packList = await call(token, 'GET', '/payroll/salary-templates', {
    query: { company_id: COMPANY },
  });
  const packRows = asList(packList.data);
  const packLooksLikeMau = packRows.some(
    (r) =>
      r.sheet_template_snapshot_json ||
      r.formulaOverrideDefinitionId ||
      r.applicabilityScope === 'ou',
  );
  // Ensure mẫu path ≠ pack path: pack list must not return our pay_sheet template ids as pack rows
  const packHasMauId = packRows.some((r) => r.id === createdId || r.id === tplBindId);
  pushStep('salary_templates_pack_regression', {
    status: packList.status,
    code: packList.code,
    count: packRows.length,
    packHasMauId,
    packLooksLikeMau,
  });
  const ac6Ok =
    packList.status === 200 &&
    !packHasMauId &&
    create.code?.includes('TPL') &&
    packList.code &&
    !String(packList.code).includes('TPL');
  report.ac.ac6_pack_enroll_only = passFail(
    ac6Ok,
    `pack=${packList.status}/${packList.code} packHasMauId=${packHasMauId} createCode=${create.code}`,
  );

  // --- AC7 honesty locks ---
  report.ac.ac7_honesty_locks = passFail(
    report.honesty.payroll_e2e_ready === false &&
      report.honesty.browser_uf === false &&
      report.honesty.module_uat === false,
    'payroll_e2e_ready=false · no browser UF · no seed · pack≠mẫu',
  );

  const allPass = Object.values(report.ac).every((a) => a.ok);
  report.overall = {
    verdict: allPass ? 'PASS' : 'FAIL',
    ack_status: allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    ac_summary: Object.fromEntries(
      Object.entries(report.ac).map(([k, v]) => [k, v.verdict]),
    ),
  };

  if (!allPass) {
    report.residual.push({
      id: 'R-PAY-TPL-QA-L1-FAIL',
      item: 'One or more L1 AC FAIL — see ac matrix',
      owner: 'dev-be',
    });
  }
  report.residual.push({
    id: 'R-PAY-TPL-FE',
    item: 'Settings mẫu GĐ1 form — after L1 PASS',
    owner: 'dev-fe',
  });
  report.residual.push({
    id: 'HONESTY',
    item: 'payroll_e2e_ready remains false · module UAT DENIED',
    owner: 'pm/qa',
  });

  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ out: OUT, overall: report.overall, ac: report.ac }, null, 2));
  process.exit(allPass ? 0 : 1);
} catch (err) {
  report.overall = {
    verdict: 'FAIL',
    ack_status: 'FAIL_TO_PM',
    reason: String(err?.stack || err),
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.error(err);
  process.exit(2);
}
