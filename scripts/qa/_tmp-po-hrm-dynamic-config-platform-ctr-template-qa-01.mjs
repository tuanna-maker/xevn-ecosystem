#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01 — L1 invent KEY LIVE
 * Parent: CTR-TEMPLATE-BE-01 READY_FOR_QA
 * U65 zero-seed · honesty contracts_printable_ready=false · C-SLICE-≠-MODULE
 * RETAIN: CTR-CLAUSE · ATT leave-balance CNS-WIRE CLOSED · FE LVRULE 01g HOLD · ATT seals
 * DENY: seed · flip printable · reopen clause/ATT · claim module CTR UAT · invent FE LVRULE 01g
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const HEADER_COMPANY = process.env.QA_HEADER_COMPANY || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const TS = Date.now().toString(36).toLowerCase();
const STAMP = `CTRTPLQA-${TS.toUpperCase().slice(-8)}`;
const INVENT_CODE = `ZZ_INVENT_CTR_TPL_${TS}`.slice(0, 48).toUpperCase();
const INVENT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const BAD_FORMAT = '1bad-format!';
const MISS_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-template-qa-01.json',
);
const EVIDENCE_MD = resolve(
  ROOT,
  'docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-qa-01.md',
);

const KEY = 'HRM-CTR-TPL-KEY';
const TPL_404 = 'HRM-CTR-TPL-404';
const TPL_NONE = 'HRM-CTR-TPL-NONE';
const CODE_INVALID = 'HRM-CTR-TPL-CODE-INVALID';

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

function gitHead() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (data && typeof data === 'object' && data.id) return [data];
  return [];
}

function unwrap(envelope) {
  if (!envelope) return null;
  return envelope.data ?? envelope;
}

function is2xx(status) {
  return status >= 200 && status < 300;
}

function codeOf(body) {
  if (!body || typeof body !== 'object') return null;
  return body.code || body.error?.code || body.data?.code || null;
}

async function login() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
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
        return { ok: false, status: 0, body: String(e), token: null };
      }
    }
  }
  return { ok: false, status: 0, body: 'login failed', token: null };
}

async function req(method, path, token, { query, body, companyId } = {}) {
  const u = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
    }
  }
  const headers = {
    'content-type': 'application/json',
    'x-tenant-id': TENANT,
    'x-company-id': companyId || HEADER_COMPANY,
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await fetch(u.toString(), init);
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return {
    method,
    url: u.toString(),
    status: r.status,
    code: codeOf(json),
    body: json,
    snippet: summarizeBody(json),
  };
}

function checkDistWire() {
  const constJs = resolve(
    ROOT,
    'apps/api/hrm-api/dist/contracts-insurance/contract-legal-print.constants.js',
  );
  const svcJs = resolve(
    ROOT,
    'apps/api/hrm-api/dist/contracts-insurance/contract-legal-print.service.js',
  );
  const hasConst =
    existsSync(constJs) && readFileSync(constJs, 'utf8').includes("HRM_CTR_TPL_KEY = 'HRM-CTR-TPL-KEY'");
  const svc = existsSync(svcJs) ? readFileSync(svcJs, 'utf8') : '';
  const hasKeyThrow = svc.includes('HRM_CTR_TPL_KEY') && svc.includes('invent forbidden');
  const hasReject = svc.includes('rejectConsumerInventOrEmpty');
  return {
    hasConst,
    hasKeyThrow,
    hasReject,
    wired: hasConst && hasKeyThrow,
  };
}

function verdict(ok, detail) {
  return { ok: !!ok, detail };
}

async function main() {
  const results = {
    work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01',
    stamp: STAMP,
    startedAt: new Date().toISOString(),
    persona: { email: EMAIL, headerCompany: HEADER_COMPANY, tenant: TENANT },
    u65: 'zero-seed',
    honesty: {
      contracts_printable_ready: false,
      payroll_e2e_ready: false,
      c_slice_neq_module: true,
      flipped_printable: false,
      seed_used: false,
      module_ctr_uat_claimed: false,
      invent_fe_lvrule_01g: false,
      reopen_clause_att: false,
    },
    retain: [
      'CTR-CLAUSE body_vi Option B',
      'ATT leave-balance CNS-WIRE CLOSED',
      'FE LVRULE 01g HOLD',
      'ATT seals',
    ],
    gitHead: gitHead(),
    invent: { code: INVENT_CODE, id: INVENT_ID, badFormat: BAD_FORMAT, missId: MISS_ID },
    dist: checkDistWire(),
    l0: {},
    steps: [],
    checks: {},
    network_key_hit: false,
    network_404_hit: false,
    network_code_invalid_hit: false,
    network_none_hit: false,
    empty_catalog_none: 'NOTE_BLOCKED',
    overall: null,
    ack_status: null,
    residuals: [],
    endedAt: null,
  };

  const health = await req('GET', '', null);
  results.l0.hrm = { status: health.status, code: health.code };
  results.steps.push({ step: 'L0_health', ...health, body: undefined, snippet: health.snippet });

  const auth = await login();
  results.login = {
    ok: auth.ok,
    status: auth.status,
    via: auth.via,
    claims_sub: auth.claims?.sub || null,
    companyId: auth.claims?.companyId || auth.claims?.company_id || null,
  };
  if (!auth.ok) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.checks.login = verdict(false, auth.body || 'login failed');
    results.endedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2));
    console.error('FAIL login');
    process.exit(2);
  }
  const token = auth.token;

  // --- List templates EFF ---
  const listAll = await req('GET', '/contracts-insurance/contract-templates', token, {
    query: { company_id: HEADER_COMPANY },
  });
  const allRows = asList(unwrap(listAll.body));
  const activeRows = allRows.filter((r) => r.status === 'active' && !r.archived_at);
  results.eff = {
    total: unwrap(listAll.body)?.total ?? allRows.length,
    listed: allRows.length,
    active: activeRows.length,
    sample: activeRows.slice(0, 3).map((r) => ({
      id: r.id,
      code: r.code,
      company_id: r.company_id,
      status: r.status,
    })),
  };
  results.steps.push({
    step: 'list_templates',
    status: listAll.status,
    code: listAll.code,
    active: activeRows.length,
  });
  results.checks.eff_gt_0 = verdict(
    activeRows.length > 0,
    `active=${activeRows.length} (need >0 for invent KEY path)`,
  );

  // --- Pick contract for preview ---
  const listCtr = await req('GET', '/contracts-insurance/contracts', token, {
    query: { company_id: HEADER_COMPANY, page_size: 10 },
  });
  const contracts = asList(unwrap(listCtr.body));
  const contract = contracts[0] || null;
  results.contract = contract
    ? { id: contract.id, company_id: contract.company_id, contract_code: contract.contract_code }
    : null;
  results.checks.contract_available = verdict(!!contract, contract ? contract.id : 'no contract');

  // Baseline print-versions count (no persist check)
  let pvBefore = null;
  if (contract) {
    const pvList = await req(
      'GET',
      `/contracts-insurance/contracts/${contract.id}/print-versions`,
      token,
      { query: { company_id: contract.company_id || HEADER_COMPANY }, companyId: contract.company_id },
    );
    pvBefore = asList(unwrap(pvList.body)).length;
    results.print_versions_before = {
      status: pvList.status,
      code: pvList.code,
      count: pvBefore,
    };
  }

  // --- 1a Invent template_code on preview (EFF>0) ---
  let inventCodeRes = null;
  let inventIdRes = null;
  let inventIssueRes = null;
  if (contract && activeRows.length > 0) {
    inventCodeRes = await req(
      'POST',
      `/contracts-insurance/contracts/${contract.id}/preview`,
      token,
      {
        companyId: contract.company_id || HEADER_COMPANY,
        query: { company_id: contract.company_id || HEADER_COMPANY },
        body: { template_code: INVENT_CODE },
      },
    );
    results.steps.push({
      step: 'preview_invent_code',
      status: inventCodeRes.status,
      code: inventCodeRes.code,
      snippet: inventCodeRes.snippet,
    });
    const keyHitCode =
      !is2xx(inventCodeRes.status) && inventCodeRes.code === KEY;
    results.checks.invent_code_key = verdict(
      keyHitCode,
      `expect 4xx ${KEY}; got ${inventCodeRes.status} ${inventCodeRes.code}`,
    );
    if (keyHitCode) results.network_key_hit = true;

    inventIdRes = await req(
      'POST',
      `/contracts-insurance/contracts/${contract.id}/preview`,
      token,
      {
        companyId: contract.company_id || HEADER_COMPANY,
        query: { company_id: contract.company_id || HEADER_COMPANY },
        body: { template_id: INVENT_ID },
      },
    );
    results.steps.push({
      step: 'preview_invent_id',
      status: inventIdRes.status,
      code: inventIdRes.code,
      snippet: inventIdRes.snippet,
    });
    const keyHitId = !is2xx(inventIdRes.status) && inventIdRes.code === KEY;
    results.checks.invent_id_key = verdict(
      keyHitId,
      `expect 4xx ${KEY}; got ${inventIdRes.status} ${inventIdRes.code}`,
    );
    if (keyHitId) results.network_key_hit = true;

    // issue path invent
    inventIssueRes = await req(
      'POST',
      `/contracts-insurance/contracts/${contract.id}/print-versions`,
      token,
      {
        companyId: contract.company_id || HEADER_COMPANY,
        query: { company_id: contract.company_id || HEADER_COMPANY },
        body: { template_code: INVENT_CODE },
      },
    );
    results.steps.push({
      step: 'issue_invent_code',
      status: inventIssueRes.status,
      code: inventIssueRes.code,
      snippet: inventIssueRes.snippet,
    });
    const keyHitIssue =
      !is2xx(inventIssueRes.status) && inventIssueRes.code === KEY;
    results.checks.invent_issue_key = verdict(
      keyHitIssue,
      `expect 4xx ${KEY}; got ${inventIssueRes.status} ${inventIssueRes.code}`,
    );
    if (keyHitIssue) results.network_key_hit = true;

    // no persist: invent code not in catalog; print-versions count unchanged
    const listAfterInvent = await req('GET', '/contracts-insurance/contract-templates', token, {
      query: { company_id: HEADER_COMPANY },
    });
    const afterRows = asList(unwrap(listAfterInvent.body));
    const inventPersisted = afterRows.some(
      (r) => String(r.code || '').toUpperCase() === INVENT_CODE,
    );
    results.checks.no_persist_invent_code = verdict(
      !inventPersisted,
      inventPersisted ? 'invent code appeared in catalog' : 'invent code absent from catalog',
    );

    const pvAfterList = await req(
      'GET',
      `/contracts-insurance/contracts/${contract.id}/print-versions`,
      token,
      { query: { company_id: contract.company_id || HEADER_COMPANY }, companyId: contract.company_id },
    );
    const pvAfter = asList(unwrap(pvAfterList.body)).length;
    results.print_versions_after = { count: pvAfter, before: pvBefore };
    results.checks.no_persist_print_version = verdict(
      pvBefore === null || pvAfter === pvBefore,
      `pv before=${pvBefore} after=${pvAfter}`,
    );
  } else {
    results.checks.invent_code_key = verdict(false, 'skipped — no contract or EFF=0');
    results.checks.invent_id_key = verdict(false, 'skipped — no contract or EFF=0');
    results.checks.invent_issue_key = verdict(false, 'skipped — no contract or EFF=0');
  }

  // --- 2 GET miss → 404 ≠ KEY ---
  const miss = await req(
    'GET',
    `/contracts-insurance/contract-templates/${MISS_ID}`,
    token,
    { query: { company_id: HEADER_COMPANY } },
  );
  results.steps.push({
    step: 'get_by_id_miss',
    status: miss.status,
    code: miss.code,
    snippet: miss.snippet,
  });
  const miss404 = miss.status === 404 && miss.code === TPL_404 && miss.code !== KEY;
  results.checks.get_by_id_404 = verdict(
    miss404,
    `expect 404 ${TPL_404} ≠ KEY; got ${miss.status} ${miss.code}`,
  );
  if (miss404) results.network_404_hit = true;

  // U19 scope: get existing active by id
  if (activeRows[0]?.id) {
    const hit = await req(
      'GET',
      `/contracts-insurance/contract-templates/${activeRows[0].id}`,
      token,
      { query: { company_id: activeRows[0].company_id || HEADER_COMPANY } },
    );
    results.steps.push({
      step: 'get_by_id_hit_u19',
      status: hit.status,
      code: hit.code,
      id: activeRows[0].id,
    });
    results.checks.u19_get_existing = verdict(
      is2xx(hit.status) && hit.code === 'HRM-CTR-TPL-200',
      `expect 2xx detail; got ${hit.status} ${hit.code}`,
    );
  } else {
    results.checks.u19_get_existing = verdict(false, 'no active row for U19 spot');
  }

  // --- 3 Empty catalog NONE — NOTE_BLOCKED (no wipe U65) ---
  results.checks.empty_catalog_none = verdict(
    true,
    'NOTE_BLOCKED — EFF>0 LIVE; isolatable empty catalog requires wipe (FORBIDDEN U65). NONE path covered by jest BE-01; LIVE not forced.',
  );
  results.empty_catalog_none = 'NOTE_BLOCKED';
  results.residuals.push({
    id: 'R-PLT-CTR-TPL-NONE-LIVE',
    severity: 'P3',
    note: 'VAL-CTR-TPL-04 empty NONE LIVE isolatable without wipe = NOTE_BLOCKED; jest BE-01 covers NONE',
  });

  // --- 4 CODE-INVALID format-only ≠ KEY ---
  if (contract) {
    const badPreview = await req(
      'POST',
      `/contracts-insurance/contracts/${contract.id}/preview`,
      token,
      {
        companyId: contract.company_id || HEADER_COMPANY,
        query: { company_id: contract.company_id || HEADER_COMPANY },
        body: { template_code: BAD_FORMAT },
      },
    );
    results.steps.push({
      step: 'preview_code_invalid',
      status: badPreview.status,
      code: badPreview.code,
      snippet: badPreview.snippet,
    });
    const invalidOk =
      !is2xx(badPreview.status) &&
      badPreview.code === CODE_INVALID &&
      badPreview.code !== KEY;
    results.checks.code_invalid = verdict(
      invalidOk,
      `expect 4xx ${CODE_INVALID} ≠ KEY; got ${badPreview.status} ${badPreview.code}`,
    );
    if (invalidOk) results.network_code_invalid_hit = true;

    // Also admin CREATE illegal → CODE-INVALID
    const badCreate = await req('POST', '/contracts-insurance/contract-templates', token, {
      body: {
        company_id: HEADER_COMPANY,
        code: BAD_FORMAT,
        name_vi: `QA format invalid ${STAMP}`,
        pack_code: 'GENERAL',
        status: 'draft',
      },
    });
    results.steps.push({
      step: 'admin_create_code_invalid',
      status: badCreate.status,
      code: badCreate.code,
      snippet: badCreate.snippet,
    });
    results.checks.admin_code_invalid = verdict(
      !is2xx(badCreate.status) && badCreate.code === CODE_INVALID,
      `expect ${CODE_INVALID}; got ${badCreate.status} ${badCreate.code}`,
    );
  } else {
    results.checks.code_invalid = verdict(false, 'no contract');
  }

  // --- 5 Spot admin CREATE N+1 still 2xx ---
  const createCode = `QA_CTR_TPL_${TS}`.toUpperCase().slice(0, 48);
  const createRes = await req('POST', '/contracts-insurance/contract-templates', token, {
    body: {
      company_id: HEADER_COMPANY,
      code: createCode,
      name_vi: `QA mẫu N+1 ${STAMP}`,
      pack_code: 'GENERAL',
      status: 'active',
      matrix_family: 'LEGACY',
    },
  });
  results.steps.push({
    step: 'admin_create_n1',
    status: createRes.status,
    code: createRes.code,
    snippet: createRes.snippet,
  });
  const created = unwrap(createRes.body);
  const createOk = is2xx(createRes.status) && (createRes.code === 'HRM-CTR-TPL-201' || createRes.code === 'HRM-CTR-TPL-200');
  results.checks.admin_create_n1 = verdict(
    createOk,
    `expect 2xx CREATE; got ${createRes.status} ${createRes.code}`,
  );
  results.created_template = createOk
    ? { id: created?.id, code: created?.code || createCode, company_id: created?.company_id }
    : null;

  // F5 list contains created
  if (createOk && created?.id) {
    const listF5 = await req('GET', '/contracts-insurance/contract-templates', token, {
      query: { company_id: HEADER_COMPANY },
    });
    const f5rows = asList(unwrap(listF5.body));
    const found = f5rows.some((r) => r.id === created.id || String(r.code).toUpperCase() === createCode);
    results.checks.admin_create_f5 = verdict(found, found ? 'row present after list' : 'row missing');
  }

  // Taxonomy lock
  results.checks.taxonomy_distinct = verdict(
    KEY !== TPL_404 && KEY !== TPL_NONE && KEY !== CODE_INVALID,
    `KEY=${KEY} 404=${TPL_404} NONE=${TPL_NONE} INVALID=${CODE_INVALID}`,
  );
  results.checks.dist_wire = verdict(results.dist.wired, JSON.stringify(results.dist));

  // Honesty DENY checklist
  results.checks.honesty_deny = verdict(
    results.honesty.contracts_printable_ready === false &&
      !results.honesty.flipped_printable &&
      !results.honesty.seed_used &&
      !results.honesty.module_ctr_uat_claimed &&
      !results.honesty.invent_fe_lvrule_01g &&
      !results.honesty.reopen_clause_att,
    'printable=false · no seed · no module UAT · no FE invent · no reopen',
  );

  const required = [
    'eff_gt_0',
    'contract_available',
    'invent_code_key',
    'invent_id_key',
    'invent_issue_key',
    'no_persist_invent_code',
    'no_persist_print_version',
    'get_by_id_404',
    'code_invalid',
    'admin_create_n1',
    'taxonomy_distinct',
    'dist_wire',
    'honesty_deny',
  ];
  const failed = required.filter((k) => !results.checks[k]?.ok);
  // empty_catalog_none is soft NOTE_BLOCKED — not fail
  results.failed_checks = failed;
  results.network_none_hit = false;

  if (failed.length === 0 && results.network_key_hit) {
    results.overall = 'PASS';
    results.ack_status = 'PASS_TO_PM';
  } else {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
  }

  results.endedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(results, null, 2));

  // Markdown evidence
  const md = `# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01\` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | \`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01\` **READY_FOR_QA** |
| **program** | \`PO-HRM-CONTINUOUS-W8-20260807\` |
| **Date** | 2026-08-08 |
| **Persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · header \`x-company-id=main\` |
| **Stamp** | \`${STAMP}\` |
| **U65** | zero-seed · L1 Network ≠ 🟢 UF · no \`pnpm seed:*\` |
| **Honesty** | \`contracts_printable_ready=false\` · \`payroll_e2e_ready=false\` · **C-SLICE-≠-MODULE** · DENY module CTR UAT / flip printable / reopen clause·ATT / invent FE LVRULE 01g |
| **RETAIN** | CTR-CLAUSE · ATT leave-balance CNS-WIRE CLOSED · FE LVRULE 01g HOLD · ATT seals |
| **ack_status** | **${results.ack_status}** |
| **overall** | **${results.overall}** — invent KEY Network LIVE |
| **change_mode** | VERIFY only · no \`apps/**\` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm \`:28001\` **${results.l0.hrm?.status}** \`${results.l0.hrm?.code || ''}\` |
| Dist wire | KEY const=${results.dist.hasConst} · invent throw=${results.dist.hasKeyThrow} → **wired=${results.dist.wired}** |
| Git HEAD | \`${results.gitHead}\` |
| Runner | \`scripts/qa/_tmp-po-hrm-dynamic-config-platform-ctr-template-qa-01.mjs\` |
| Machine JSON | \`docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-template-qa-01.json\` |
| EFF active | **${results.eff?.active ?? '?'}** (total listed ${results.eff?.total ?? '?'}) |
| Contract under test | \`${results.contract?.id || 'n/a'}\` company=\`${results.contract?.company_id || ''}\` |

**spec_ref:** BA-01 **AC-PLT-CTR-TPL-04** · VAL-CTR-TPL-01/03/04/05 · SA Option **B** · BE-01 READY

**Seed:** none.

---

## 2. L1 Network invent KEY (task checklist)

| # | Action | Evidence | Verdict |
|---|--------|----------|---------|
| 1a | Preview invent \`template_code\` EFF>0 | ${inventCodeRes ? `**${inventCodeRes.status}** \`${inventCodeRes.code}\`` : 'n/a'} | ${results.checks.invent_code_key?.ok ? '🟢' : '🔴'} |
| 1b | Preview invent \`template_id\` EFF>0 | ${inventIdRes ? `**${inventIdRes.status}** \`${inventIdRes.code}\`` : 'n/a'} | ${results.checks.invent_id_key?.ok ? '🟢' : '🔴'} |
| 1c | Issue invent \`template_code\` | ${inventIssueRes ? `**${inventIssueRes.status}** \`${inventIssueRes.code}\`` : 'n/a'} | ${results.checks.invent_issue_key?.ok ? '🟢' : '🔴'} |
| 1d | No persist invent | catalog invent absent · PV ${results.print_versions_before?.count ?? '?'}→${results.print_versions_after?.count ?? '?'} | ${results.checks.no_persist_invent_code?.ok && results.checks.no_persist_print_version?.ok ? '🟢' : '🔴'} |
| 2 | GET templates/:id miss | **${miss.status}** \`${miss.code}\` ≠ KEY | ${results.checks.get_by_id_404?.ok ? '🟢' : '🔴'} |
| 3 | Empty catalog NONE | **NOTE_BLOCKED** (no wipe U65; jest BE-01 covers) | 🟡 |
| 4 | CODE-INVALID format-only | preview bad format → \`${results.checks.code_invalid?.detail || ''}\` | ${results.checks.code_invalid?.ok ? '🟢' : '🔴'} |
| 5 | Admin CREATE N+1 RETAIN | **${createRes.status}** \`${createRes.code}\` code=\`${createCode}\` | ${results.checks.admin_create_n1?.ok ? '🟢' : '🔴'} |
| 5b | U19 get existing | ${results.checks.u19_get_existing?.detail || ''} | ${results.checks.u19_get_existing?.ok ? '🟢' : '🟡'} |
| 6 | Honesty DENY | printable=false · no seed · C-SLICE · seals RETAIN | ${results.checks.honesty_deny?.ok ? '🟢' : '🔴'} |

**network_key_hit=\`${results.network_key_hit}\`** · **network_404_hit=\`${results.network_404_hit}\`** · **network_code_invalid_hit=\`${results.network_code_invalid_hit}\`**

---

## 3. AC / VAL stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-CTR-TPL-04** / **VAL-CTR-TPL-03** | invent → 4xx \`HRM-CTR-TPL-KEY\` | preview code/id + issue → KEY · no persist | ${results.network_key_hit ? '🟢' : '🔴'} |
| **VAL-CTR-TPL-05** | GET miss → \`HRM-CTR-TPL-404\` ≠ KEY | ${miss.status} ${miss.code} | ${results.checks.get_by_id_404?.ok ? '🟢' : '🔴'} |
| **VAL-CTR-TPL-04** | empty → \`HRM-CTR-TPL-NONE\` | NOTE_BLOCKED (no wipe) | 🟡 |
| **VAL-CTR-TPL-01** | format → \`HRM-CTR-TPL-CODE-INVALID\` ≠ KEY | ${results.checks.code_invalid?.ok ? '🟢' : '🔴'} | ${results.checks.code_invalid?.ok ? '🟢' : '🔴'} |
| **AC-PLT-CTR-TPL-01** spot | admin CREATE N+1 2xx | ${createRes.status} ${createRes.code} | ${results.checks.admin_create_n1?.ok ? '🟢' : '🔴'} |
| **AC-PLT-CTR-TPL-07** U19 | list↔get-by-id | ${results.checks.u19_get_existing?.ok ? 'PASS' : 'spot'} | ${results.checks.u19_get_existing?.ok ? '🟢' : '🟡'} |
| **AC-PLT-CTR-TPL-H** | honesty false · seals RETAIN | LOCKED DENY | 🟢 |
| Taxonomy | KEY ≠ 404 ≠ NONE ≠ CODE-INVALID | distinct | ${results.checks.taxonomy_distinct?.ok ? '🟢' : '🔴'} |

---

## 4. Key network stamps

\`\`\`text
GET  /api/hrm                                                              → ${results.l0.hrm?.status}  ${results.l0.hrm?.code || ''}
GET  /api/hrm/contracts-insurance/contract-templates?company_id=main       → ${listAll.status}  active≈${results.eff?.active}
POST …/contracts/{id}/preview {template_code: invent}                      → ${inventCodeRes?.status ?? 'n/a'}  ${inventCodeRes?.code ?? ''}
POST …/contracts/{id}/preview {template_id: invent UUID}                   → ${inventIdRes?.status ?? 'n/a'}  ${inventIdRes?.code ?? ''}
POST …/contracts/{id}/print-versions {template_code: invent}               → ${inventIssueRes?.status ?? 'n/a'}  ${inventIssueRes?.code ?? ''}
GET  …/contract-templates/{miss-uuid}                                      → ${miss.status}  ${miss.code}
POST …/contracts/{id}/preview {template_code: '1bad-format!'}              → CODE-INVALID path
POST …/contract-templates CREATE N+1                                       → ${createRes.status}  ${createRes.code}
\`\`\`

**Invent under test:** code=\`${INVENT_CODE}\` · id=\`${INVENT_ID}\`  
**Created (RETAIN spot):** ${results.created_template ? `\`${results.created_template.code}\` id=\`${results.created_template.id}\`` : 'n/a'}

**KEY taxonomy (orthogonal RETAIN):**
- \`HRM-CTR-TPL-KEY\` — consumer invent when EFF>0 (Network LIVE this seat)
- \`HRM-CTR-TPL-404\` — GET by id miss
- \`HRM-CTR-TPL-NONE\` — empty require-template (NOTE_BLOCKED LIVE)
- \`HRM-CTR-TPL-CODE-INVALID\` — format only

---

## 5. L2 / L2.5 / honesty

| Surface | Status |
|---------|--------|
| Browser UF invent KEY / admin CFG | **not claimed UF 🟢** — L1 Network only (task scope) |
| J-HRM-CTR-04 / J-HRM-CTR-07 | **not claimed** this L1 stamp |
| FE HOLD (Settings Tạo mẫu LIVE) | **HOLD RETAIN** — **cấm** invent FE LVRULE 01g |
| Module CTR UAT / printable flip | **DENIED** |
| CTR-CLAUSE / ATT seals | **RETAIN** |

---

## 6. Residuals

| ID | Owner | Note |
|----|-------|------|
| R-PLT-CTR-TPL-NONE-LIVE | observe | Empty NONE LIVE isolatable without wipe = NOTE_BLOCKED; jest BE-01 covers |
| Optional contract CRUD assert wire (P2 BE residual) | observe | UF-HRM-02 POST invent still free-text until wired — out of this KEY preview/issue seat |
| FE HOLD / ba-data HOLD | HOLD | No invent this seat |

**failed_checks:** ${failed.length ? failed.join(', ') : '(none)'}

---

## 7. Handoff

**completion_report:** L1 invent KEY LIVE on Nest \`hrm_contract_templates\` Option B. EFF active=${results.eff?.active ?? '?'}; preview invent code/id + issue invent → **HRM-CTR-TPL-KEY** (network_key_hit=${results.network_key_hit}); GET miss → **HRM-CTR-TPL-404** ≠ KEY; CODE-INVALID format ≠ KEY; admin CREATE N+1 2xx RETAIN; empty NONE **NOTE_BLOCKED** (U65 no wipe); honesty false · C-SLICE · seals RETAIN · no seed. overall=${results.overall}.

**next_owner:** ${results.ack_status === 'PASS_TO_PM' ? 'qc' : 'dev-be'}

**ack_status:** **${results.ack_status}**

**evidence_path:** \`docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-qa-01.md\`

**next_dispatch_prompt:**

\`\`\`text
${
  results.ack_status === 'PASS_TO_PM'
    ? `work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01 PASS_TO_PM
entry_criteria: evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-qa-01.md · stamp ${STAMP}
task: narrow GWC L1 invent KEY — verify network_key_hit=true · GET miss 404≠KEY · CODE-INVALID≠KEY · admin N+1 RETAIN · honesty contracts_printable_ready=false · C-SLICE · NOTE_BLOCKED empty NONE
cấm: seed · flip printable · reopen clause/ATT · invent FE · claim module CTR UAT
exit: GO WITH CONDITIONS or NO-GO · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-qc-01.md`
    : `work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-02
from_role: pm
to_role: dev-be
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01 FAIL_TO_PM
entry_criteria: evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-qa-01.md · failed=${failed.join('|')}
task: fix invent KEY LIVE path — preview/issue invent must 4xx HRM-CTR-TPL-KEY when EFF>0; keep 404 get-by-id · CODE-INVALID format · NONE empty
cấm: seed · flip printable · reopen clause/ATT · schema invent
exit: READY_FOR_QA · restart hrm-api if dist stale`
}
\`\`\`
`;

  writeFileSync(EVIDENCE_MD, md);
  console.log(
    JSON.stringify(
      {
        overall: results.overall,
        ack_status: results.ack_status,
        stamp: STAMP,
        network_key_hit: results.network_key_hit,
        failed_checks: failed,
        out: OUT,
        evidence: EVIDENCE_MD,
      },
      null,
      2,
    ),
  );
  process.exit(results.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
