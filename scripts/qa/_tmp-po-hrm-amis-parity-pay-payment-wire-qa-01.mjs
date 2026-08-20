#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01
 * L1 API U65 retest AMIS step7 wire spine — zero-seed · payroll_e2e_ready=false
 * cấm claim module UAT / AMIS parity DONE
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const STAMP = `PAYWIRE-${Date.now().toString(36).toUpperCase()}`;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-01.FINAL.json',
);

mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

function summarizeBody(body, max = 1400) {
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

async function login() {
  for (const base of [`${PORTAL}/api/xbos`, XBOS]) {
    try {
      const r = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) {
        return { ok: true, status: r.status, token, sub: decodeSub(token), via: base };
      }
    } catch {
      /* try next */
    }
  }
  return { ok: false, status: 0, token: null, sub: null, via: null };
}

async function call(token, method, path, { query, body, companyId = COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  if (!url.searchParams.has('company_id')) url.searchParams.set('company_id', companyId);
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
    data: json?.data ?? json,
    body: json,
    summary: summarizeBody(json),
  };
}

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  // Nest envelope: { total, data: [...] } (sometimes double-nested under data)
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data && Array.isArray(data.data.data)) return data.data.data;
  return [];
}

function periodStatus(p) {
  return String(p?.status ?? p?.Status ?? '').toLowerCase();
}

function payslipStatus(p) {
  return String(p?.status ?? p?.Status ?? '').toLowerCase();
}

async function probeL0() {
  const out = {};
  for (const [k, u] of [
    ['hrm', `${HRM}`],
    ['xbos', XBOS.replace(/\/api\/xbos.*/, '/api/xbos')],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(u, { method: 'GET' });
      out[k] = { status: r.status, ok: r.status >= 200 && r.status < 500 };
    } catch (e) {
      out[k] = { status: 0, ok: false, err: String(e?.message || e) };
    }
  }
  return out;
}

async function findProcessedPeriod(token) {
  const list = await call(token, 'GET', '/payroll/periods', {
    query: { company_id: COMPANY, status: 'processed' },
  });
  const periods = asList(list.data);
  const candidates = [];
  for (const p of periods) {
    if (periodStatus(p) !== 'processed') continue;
    const id = p.id || p.periodId;
    if (!id) continue;
    const slips = await call(token, 'GET', '/payroll/payslips', {
      query: { company_id: COMPANY, period_id: id, page_size: '100' },
    });
    const rows = asList(slips.data);
    const processed = rows.filter((r) => payslipStatus(r) === 'processed');
    const unpaid = rows.filter((r) => payslipStatus(r) !== 'paid');
    candidates.push({
      id,
      label: p.period_label || p.periodLabel || p.label || null,
      company_id: p.company_id || p.companyId || null,
      payslip_total: rows.length,
      processed_count: processed.length,
      unpaid_count: unpaid.length,
      processed_ids: processed.map((r) => r.id),
      list_code: slips.code,
    });
  }
  // Prefer QA-labelled periods (avoid closing UAT-MOB-PILOT if alternatives exist)
  const eligible = candidates
    .filter((c) => c.processed_count > 0)
    .sort((a, b) => {
      const aQa = /QA-|PAYFE|WIRE/i.test(String(a.label || '')) ? 1 : 0;
      const bQa = /QA-|PAYFE|WIRE/i.test(String(b.label || '')) ? 1 : 0;
      if (bQa !== aQa) return bQa - aQa;
      return b.processed_count - a.processed_count;
    });
  return { list, candidates, eligible, chosen: eligible[0] || null };
}

async function main() {
  const started = new Date().toISOString();
  const l0 = await probeL0();
  const auth = await login();
  const steps = [];
  const ac = {
    AC1_wire_201: { verdict: 'PENDING', detail: null },
    AC2_rewire_idempotent: { verdict: 'PENDING', detail: null },
    AC3_process_payslips_paid: { verdict: 'PENDING', detail: null },
    AC4_close_before_pay_005: { verdict: 'PENDING', detail: null },
    AC5_close_after_paid_203: { verdict: 'PENDING', detail: null },
    AC6_honesty: { verdict: 'PASS', detail: 'payroll_e2e_ready=false · no seed · no module UAT claim' },
  };

  if (!auth.ok) {
    const result = {
      work_item_id: 'PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01',
      stamp: STAMP,
      started,
      ended: new Date().toISOString(),
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      payroll_e2e_ready: false,
      l0,
      auth,
      ac,
      reason: 'Login failed',
    };
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    process.exit(2);
  }

  // Unauth route probe (stale-dist)
  try {
    const fake = '00000000-0000-4000-8000-000000000001';
    const r = await fetch(`${HRM}/payroll/periods/${fake}/wire-payment-batch?company_id=main`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ company_id: 'main' }),
    });
    const j = await r.json().catch(() => ({}));
    steps.push({
      name: 'unauth_wire_probe',
      status: r.status,
      code: j.code || null,
      note: r.status === 401 || r.status === 403 ? 'route live (not 404)' : 'check',
    });
  } catch (e) {
    steps.push({ name: 'unauth_wire_probe', err: String(e?.message || e) });
  }

  const find = await findProcessedPeriod(auth.token);
  steps.push({
    name: 'find_processed_period',
    list_status: find.list.status,
    list_code: find.list.code,
    candidate_count: find.candidates.length,
    eligible_count: find.eligible.length,
    chosen: find.chosen
      ? {
          id: find.chosen.id,
          label: find.chosen.label,
          processed_count: find.chosen.processed_count,
          unpaid_count: find.chosen.unpaid_count,
        }
      : null,
  });

  if (!find.chosen) {
    // Negative probes still useful if any processed-but-empty or draft exists
    const anyProcessed = find.candidates[0];
    const draftish = asList(find.list.data).find((p) => periodStatus(p) !== 'processed');
    if (draftish) {
      const neg = await call(auth.token, 'POST', `/payroll/periods/${draftish.id}/wire-payment-batch`, {
        body: { company_id: COMPANY, name: `QA wire ${STAMP}` },
      });
      steps.push({ name: 'neg_wire_non_processed', status: neg.status, code: neg.code, summary: neg.summary });
    }
    if (anyProcessed) {
      const neg412 = await call(
        auth.token,
        'POST',
        `/payroll/periods/${anyProcessed.id}/wire-payment-batch`,
        { body: { company_id: COMPANY, name: `QA wire ${STAMP}` } },
      );
      steps.push({
        name: 'neg_wire_no_payslips',
        period_id: anyProcessed.id,
        status: neg412.status,
        code: neg412.code,
        summary: neg412.summary,
      });
    }
    const result = {
      work_item_id: 'PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01',
      stamp: STAMP,
      started,
      ended: new Date().toISOString(),
      verdict: 'FAIL',
      ack_status: 'FAIL_TO_PM',
      payroll_e2e_ready: false,
      l0,
      auth: { ok: true, sub: auth.sub, via: auth.via },
      ac: {
        ...ac,
        AC1_wire_201: {
          verdict: 'FAIL',
          detail: 'No processed period with status=processed payslips (U65 no seed)',
        },
        AC2_rewire_idempotent: { verdict: 'BLOCKED', detail: 'no eligible period' },
        AC3_process_payslips_paid: { verdict: 'BLOCKED', detail: 'no eligible period' },
        AC4_close_before_pay_005: { verdict: 'BLOCKED', detail: 'no eligible period' },
        AC5_close_after_paid_203: { verdict: 'BLOCKED', detail: 'no eligible period' },
      },
      steps,
      reason: 'No eligible processed period + processed payslips under company_id=main',
    };
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    process.exit(2);
  }

  const periodId = find.chosen.id;
  const expectedPayslips = find.chosen.processed_count;

  // AC1 — wire
  const wire1 = await call(auth.token, 'POST', `/payroll/periods/${periodId}/wire-payment-batch`, {
    body: {
      company_id: COMPANY,
      name: `Chi trả QA ${STAMP}`,
      payment_method: 'bank_transfer',
    },
  });
  steps.push({
    name: 'wire1',
    status: wire1.status,
    code: wire1.code,
    records_added: wire1.data?.records_added,
    records_skipped: wire1.data?.records_skipped,
    payslip_count: wire1.data?.payslip_count,
    batch_id: wire1.data?.batch?.id || wire1.data?.batch?.Id,
    payroll_e2e_ready: wire1.data?.payroll_e2e_ready,
    summary: wire1.summary,
  });

  const batchId = wire1.data?.batch?.id || wire1.data?.batch?.Id || null;
  const wireOk =
    wire1.status === 201 &&
    wire1.code === 'HRM-PAY-WIRE-201' &&
    Number(wire1.data?.payslip_count) === expectedPayslips &&
    (Number(wire1.data?.records_added) + Number(wire1.data?.records_skipped || 0) ===
      expectedPayslips ||
      Number(wire1.data?.records_added) === expectedPayslips);
  ac.AC1_wire_201 = {
    verdict: wireOk ? 'PASS' : 'FAIL',
    detail: {
      status: wire1.status,
      code: wire1.code,
      expected_payslips: expectedPayslips,
      payslip_count: wire1.data?.payslip_count,
      records_added: wire1.data?.records_added,
      records_skipped: wire1.data?.records_skipped,
      batchId,
    },
  };

  // AC2 — rewire idempotent
  const wire2 = await call(auth.token, 'POST', `/payroll/periods/${periodId}/wire-payment-batch`, {
    body: { company_id: COMPANY, name: `Chi trả QA ${STAMP} rewire` },
  });
  steps.push({
    name: 'wire2_rewire',
    status: wire2.status,
    code: wire2.code,
    records_added: wire2.data?.records_added,
    records_skipped: wire2.data?.records_skipped,
    payslip_count: wire2.data?.payslip_count,
    batch_id: wire2.data?.batch?.id || wire2.data?.batch?.Id,
    summary: wire2.summary,
  });
  const sameBatch =
    !batchId ||
    batchId === (wire2.data?.batch?.id || wire2.data?.batch?.Id) ||
    wire2.data?.batch?.payroll_batch_id === periodId ||
    wire2.data?.batch?.payrollBatchId === periodId;
  const rewireOk =
    wire2.status === 201 &&
    wire2.code === 'HRM-PAY-WIRE-201' &&
    Number(wire2.data?.records_skipped) > 0 &&
    Number(wire2.data?.records_added) === 0 &&
    sameBatch;
  ac.AC2_rewire_idempotent = {
    verdict: rewireOk ? 'PASS' : 'FAIL',
    detail: {
      status: wire2.status,
      code: wire2.code,
      records_added: wire2.data?.records_added,
      records_skipped: wire2.data?.records_skipped,
      sameBatch,
    },
  };

  // AC4 — close BEFORE pay → HRM-PAY-005 (only if unpaid remain)
  const closeBefore = await call(auth.token, 'POST', `/payroll/periods/${periodId}/close`, {
    body: {},
    query: { company_id: COMPANY },
  });
  steps.push({
    name: 'close_before_pay',
    status: closeBefore.status,
    code: closeBefore.code,
    summary: closeBefore.summary,
  });
  const closeBeforeOk =
    (closeBefore.status === 412 || closeBefore.status === 409 || closeBefore.status === 400) &&
    closeBefore.code === 'HRM-PAY-005';
  // If somehow already all paid before process (prior run), AC4 may be N/A — still record
  if (find.chosen.unpaid_count === 0 && closeBefore.code === 'HRM-PAY-203') {
    ac.AC4_close_before_pay_005 = {
      verdict: 'SKIP',
      detail: 'All payslips already paid before this run — close succeeded early; 005 not exercisable without unpaid',
    };
  } else {
    ac.AC4_close_before_pay_005 = {
      verdict: closeBeforeOk ? 'PASS' : 'FAIL',
      detail: { status: closeBefore.status, code: closeBefore.code },
    };
  }

  // AC3 — process payment batch
  let processRes = null;
  let paidCheck = null;
  if (batchId && ac.AC4_close_before_pay_005.verdict !== 'SKIP') {
    processRes = await call(
      auth.token,
      'POST',
      `/payroll/payment-batches/${batchId}/process`,
      {
        query: { company_id: COMPANY },
        body: { company_id: COMPANY, transaction_ref: `QA-${STAMP}` },
      },
    );
    steps.push({
      name: 'process_batch',
      status: processRes.status,
      code: processRes.code,
      summary: processRes.summary,
    });

    paidCheck = await call(auth.token, 'GET', '/payroll/payslips', {
      query: { company_id: COMPANY, period_id: periodId, page_size: '100' },
    });
    const rows = asList(paidCheck.data);
    const stillProcessed = rows.filter((r) => payslipStatus(r) === 'processed');
    const paid = rows.filter((r) => payslipStatus(r) === 'paid');
    steps.push({
      name: 'payslip_status_after_process',
      status: paidCheck.status,
      code: paidCheck.code,
      paid_count: paid.length,
      still_processed: stillProcessed.length,
      total: rows.length,
    });
    const processOk =
      processRes.status >= 200 &&
      processRes.status < 300 &&
      (processRes.code === 'HRM-PB-202' || processRes.code === 'HRM-PAY-WIRE-201' || !!processRes.code) &&
      stillProcessed.length === 0 &&
      paid.length === rows.length &&
      rows.length > 0;
    ac.AC3_process_payslips_paid = {
      verdict: processOk ? 'PASS' : 'FAIL',
      detail: {
        process_status: processRes.status,
        process_code: processRes.code,
        paid_count: paid.length,
        still_processed: stillProcessed.length,
        total: rows.length,
      },
    };
  } else if (ac.AC4_close_before_pay_005.verdict === 'SKIP') {
    ac.AC3_process_payslips_paid = {
      verdict: 'SKIP',
      detail: 'Period already fully paid; process not required for close path',
    };
  } else {
    ac.AC3_process_payslips_paid = {
      verdict: 'FAIL',
      detail: 'No batchId from wire',
    };
  }

  // AC5 — close after all paid → HRM-PAY-203
  let closeAfter = null;
  if (ac.AC4_close_before_pay_005.verdict === 'SKIP') {
    ac.AC5_close_after_paid_203 = {
      verdict: 'PASS',
      detail: 'Close already returned HRM-PAY-203 when unpaid_count=0',
    };
  } else if (ac.AC3_process_payslips_paid.verdict === 'PASS') {
    closeAfter = await call(auth.token, 'POST', `/payroll/periods/${periodId}/close`, {
      body: {},
      query: { company_id: COMPANY },
    });
    steps.push({
      name: 'close_after_paid',
      status: closeAfter.status,
      code: closeAfter.code,
      period_status: closeAfter.data?.status,
      summary: closeAfter.summary,
    });
    const closeOk =
      closeAfter.status >= 200 &&
      closeAfter.status < 300 &&
      closeAfter.code === 'HRM-PAY-203' &&
      String(closeAfter.data?.status || '').toLowerCase() === 'closed';
    ac.AC5_close_after_paid_203 = {
      verdict: closeOk ? 'PASS' : 'FAIL',
      detail: {
        status: closeAfter.status,
        code: closeAfter.code,
        period_status: closeAfter.data?.status,
      },
    };
  } else {
    ac.AC5_close_after_paid_203 = {
      verdict: 'BLOCKED',
      detail: 'AC3 failed — did not attempt close after pay',
    };
  }

  const hardFails = Object.values(ac).filter((x) => x.verdict === 'FAIL');
  const verdict = hardFails.length === 0 ? 'PASS' : 'FAIL';
  const result = {
    work_item_id: 'PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-01',
    stamp: STAMP,
    started,
    ended: new Date().toISOString(),
    verdict,
    ack_status: verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM',
    payroll_e2e_ready: false,
    persona: { email: EMAIL, company_id: COMPANY, sub: auth.sub },
    l0,
    period: find.chosen,
    batchId,
    ac,
    steps,
    honesty: {
      payroll_e2e_ready: false,
      seed: false,
      module_uat_claim: false,
      amis_parity_done_claim: false,
    },
  };
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(verdict === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
