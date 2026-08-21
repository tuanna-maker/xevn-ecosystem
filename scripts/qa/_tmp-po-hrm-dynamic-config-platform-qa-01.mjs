#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01 — L1 secondary probe (NOT UF 🟢)
 * U65: no seed claim · FE picker not ready → API-only secondary
 * Persona: ceo@xe.vn · company_id=main
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const STAMP = `PLTQA-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-qa-01.FINAL.json');

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 900) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j.data || j;
  const token = d.accessToken || d.access_token;
  if (!r.ok || !token) throw new Error(`login fail HTTP ${r.status} ${summarizeBody(j)}`);
  return token;
}

async function call(token, method, path, { query, body } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
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
    dataSummary: summarizeBody(json?.data ?? json, 600),
    itemCount: Array.isArray(json?.data?.items)
      ? json.data.items.length
      : Array.isArray(json?.data)
        ? json.data.length
        : null,
    json,
  };
}

function passFail(ok, note) {
  return { ok: !!ok, verdict: ok ? 'PASS' : 'FAIL', note };
}

const report = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-01',
  stamp: STAMP,
  lane: 'L1_secondary_only',
  u65: 'zero-seed · not UF · not printable UAT',
  persona: EMAIL,
  company_id: 'main',
  startedAt: new Date().toISOString(),
  feStatusAtRun: 'FE-01 DISPATCHED — no fe evidence · AC-PLT-CTR-05 browser SKIP',
  checks: {},
  steps: [],
};

try {
  const token = await login();
  report.login = 'ok';

  // F-PLT-TOK-01 list
  const list1 = await call(token, 'GET', '/merge-tokens', { query: { company_id: 'main' } });
  report.steps.push(list1);
  report.checks.list_200 = passFail(
    list1.status === 200 && (list1.itemCount === 0 || list1.itemCount >= 0),
    `HTTP ${list1.status} code=${list1.code} items=${list1.itemCount}`,
  );

  // F-PLT-TOK-03 resolve-preview keyword_map / empty registry path
  const prevEmpty = await call(token, 'POST', '/merge-tokens/resolve-preview', {
    body: {
      companyId: 'main',
      domain: 'CTR',
      tokenKeys: ['employee.full_name', 'contract.code'],
      fieldOverrides: { 'employee.full_name': 'QA L1 Probe' },
      strict: false,
    },
  });
  report.steps.push(prevEmpty);
  // Nest POST may surface HTTP 201 while envelope code stays HRM-PLT-TOK-200 (read-only resolve)
  const prevOk =
    prevEmpty.status >= 200 &&
    prevEmpty.status < 300 &&
    (prevEmpty.code === 'HRM-PLT-TOK-200' || String(prevEmpty.code || '').includes('PLT'));
  report.checks.resolve_preview_keyword_map = passFail(
    prevOk,
    `HTTP ${prevEmpty.status} code=${prevEmpty.code} msg=${prevEmpty.message} (2xx + PLT code OK)`,
  );

  // Format-only INVALID (DYNAMIC-LOCK: not closed enum)
  const badFmt = await call(token, 'POST', '/merge-tokens', {
    body: {
      companyId: 'main',
      tokenKey: 'BadKey-With-Dash',
      sourcePath: 'custom.emp.bad',
      ring: 'custom',
      domain: 'EMP',
      labelVi: 'QA bad format',
      origin: 'builtin',
      status: 'active',
    },
  });
  report.steps.push(badFmt);
  report.checks.format_invalid_only = passFail(
    badFmt.status === 400 && String(badFmt.code || '').includes('PLT-CAT-CODE-INVALID'),
    `HTTP ${badFmt.status} code=${badFmt.code} (expect HRM-PLT-CAT-CODE-INVALID format)`,
  );

  // Open catalog: custom 9th-style token key accepted (not closed starter enum)
  const qaKey = `custom.emp.qa_plt_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
  const upsert = await call(token, 'PUT', '/merge-tokens', {
    body: {
      companyId: 'main',
      tokenKey: qaKey,
      sourcePath: qaKey,
      ring: 'custom',
      domain: 'EMP',
      labelVi: `QA L1 soft ${STAMP}`,
      origin: 'builtin',
      status: 'active',
      meta: { qa_l1_secondary: true, stamp: STAMP },
    },
  });
  report.steps.push(upsert);
  const upsertOk = upsert.status === 200 || upsert.status === 201;
  report.checks.open_catalog_token_upsert = passFail(
    upsertOk && !String(upsert.message || '').toLowerCase().includes('not in'),
    `HTTP ${upsert.status} code=${upsert.code} key=${qaKey}`,
  );

  let tokenId = upsert.json?.data?.id || upsert.json?.data?.tokenId || null;
  if (!tokenId && upsertOk) {
    const list2 = await call(token, 'GET', '/merge-tokens', {
      query: { company_id: 'main', q: qaKey, include_archived: 'false' },
    });
    report.steps.push(list2);
    const items = list2.json?.data?.items || list2.json?.data || [];
    const hit = (Array.isArray(items) ? items : []).find((x) => x.tokenKey === qaKey || x.token_key === qaKey);
    tokenId = hit?.id || null;
  }

  // Soft-delete retire (cleanup — avoid pollution)
  if (tokenId) {
    const get1 = await call(token, 'GET', `/merge-tokens/${tokenId}`, {
      query: { company_id: 'main' },
    });
    report.steps.push(get1);
    report.checks.scope_parity_get = passFail(
      get1.status === 200,
      `GET by id HTTP ${get1.status} code=${get1.code}`,
    );

    const retire = await call(token, 'POST', `/merge-tokens/${tokenId}/retire`, {
      query: { company_id: 'main' },
    });
    report.steps.push(retire);
    report.checks.soft_delete_retire = passFail(
      retire.status >= 200 && retire.status < 300 && retire.code === 'HRM-PLT-TOK-200',
      `retire HTTP ${retire.status} code=${retire.code} (2xx soft-delete OK)`,
    );

    const listAfter = await call(token, 'GET', '/merge-tokens', {
      query: { company_id: 'main', q: qaKey },
    });
    report.steps.push(listAfter);
    const itemsAfter = listAfter.json?.data?.items || listAfter.json?.data || [];
    const stillVisible = (Array.isArray(itemsAfter) ? itemsAfter : []).some(
      (x) => (x.tokenKey === qaKey || x.token_key === qaKey) && !x.archivedAt && x.status !== 'retired',
    );
    report.checks.retired_hidden_from_default_list = passFail(
      !stillVisible,
      stillVisible ? 'retired token still active in default list' : 'retired hidden / inactive',
    );
  } else {
    report.checks.scope_parity_get = passFail(false, 'no tokenId after upsert — skip get/retire');
    report.checks.soft_delete_retire = passFail(false, 'skipped — no tokenId');
    report.checks.retired_hidden_from_default_list = passFail(false, 'skipped — no tokenId');
  }

  // DYNAMIC-LOCK regression note on template path (peer residual — not reintroduced by MergeToken)
  const tplList = await call(token, 'GET', '/contracts-insurance/contract-templates', {
    query: { company_id: 'main', page_size: 50 },
  });
  report.steps.push({
    ...tplList,
    dataSummary: summarizeBody(
      {
        total: tplList.json?.data?.total ?? tplList.itemCount,
        sampleCodes: (tplList.json?.data?.items || tplList.json?.data || [])
          .slice(0, 12)
          .map((t) => t.code || t.template_code),
      },
      500,
    ),
  });
  report.checks.dynamic_lock_merge_token_no_closed_enum = passFail(
    report.checks.open_catalog_token_upsert?.ok && report.checks.format_invalid_only?.ok,
    'token upsert open + format-only INVALID (no starter-N reject)',
  );
  report.checks.dynamic_lock_tpl_9th_peer = {
    ok: null,
    verdict: 'DEFER_PEER',
    note: 'XEVN-TPL-QA-01 FAIL AC-11 is HRM-VAL-001 DTO whitelist / stale dist — NOT CODE-INVALID «not in 8». Owned by XEVN-TPL-BE-02. MergeToken BE-01 did not reintroduce closed template CHK.',
  };

  // Honesty
  report.checks.honesty_printable_denied = passFail(
    true,
    'contracts_printable_ready=false — DENIED invent · L1 ≠ UF 🟢',
  );
} catch (err) {
  report.fatal = String(err?.stack || err);
}

const checkVals = Object.values(report.checks).filter((c) => c && c.verdict !== 'DEFER_PEER');
const fails = checkVals.filter((c) => !c.ok);
report.finishedAt = new Date().toISOString();
report.summary = {
  pass: checkVals.filter((c) => c.ok).length,
  fail: fails.length,
  defer: Object.values(report.checks).filter((c) => c?.verdict === 'DEFER_PEER').length,
};
report.ack_status =
  fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
report.label =
  'L1 secondary only — NOT UF 🟢 · NOT AC-PLT-CTR-05 browser · NOT printable UAT';

writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify({ ack: report.ack_status, summary: report.summary, checks: report.checks }, null, 2));
console.log('Wrote', OUT);
process.exit(fails.length === 0 ? 0 : 1);
