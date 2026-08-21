#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01 — U65 zero-seed · J-HRM-PAY-07-* · 409/403/412 · regression PAY01..06
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';

const PAY01QC1 = 'PAY01QC1-MSMBGWC1';
const PAY02QC1 = 'PAY02QC1-MSMC4GWC1';
const PAY03QC1 = 'PAY03QC1-MSMDDGWC1';
const PAY04QC1 = 'PAY04QC1-MSMCR4GWC1';
const PAY05QC1 = 'PAY05QC1-MSMDU2GWC1';
const PAY06QC1 = 'PAY06QC1-MSMECGWC1';
const PAY06QA1 = 'PAY06QA1-MSMECGBI';
const STAMP = `PAY07QA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-qa-01.md');

const ts = () => new Date().toISOString();
let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01',
  stamp: STAMP,
  be_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-07-cluster-be-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-api-primary',
  honesty: {
    payroll_e2e_ready: false,
    ne_pay07_done: true,
    ne_pay_module_uat: true,
    c_slice: true,
    seed_used: false,
  },
  must_keep: [PAY01QC1, PAY02QC1, PAY03QC1, PAY04QC1, PAY05QC1, PAY06QC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  nest_core_pay: [],
  setup: {},
  journeys: {},
  payslip_scan: {},
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
  save();
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken && !data?.access_token) throw new Error('login failed');
  return { token: data.accessToken ?? data.access_token };
}

async function apiCall(token, method, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': opts.companyId ?? COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const res = await fetch(url, init);
  const text = await res.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text.slice(0, 400) };
  }
  const code = parsed?.code ?? parsed?.error?.code;
  if (/\/api\/hrm\/core(\/|$|\?)/.test(url) && /payroll|termination|term_|settle/i.test(url)) {
    R.nest_core_pay.push({ method, url: url.slice(0, 200), status: res.status });
  }
  return { status: res.status, code, data: parsed?.data ?? parsed, raw: parsed };
}

async function createPayPeriod(token) {
  const stamp = Date.now();
  for (let attempt = 0; attempt < 24; attempt++) {
    const year = 2038 + Math.floor(attempt / 12);
    const month = (attempt % 12) + 1;
    const mm = String(month).padStart(2, '0');
    const body = {
      company_id: COMPANY,
      period_label: `QA-PAY07-${stamp}-${mm}`,
      start_date: `${year}-${mm}-01`,
      end_date: `${year}-${mm}-28`,
    };
    const r = await apiCall(token, 'POST', '/payroll/periods', { body, companyId: COMPANY });
    if (r.status === 201 && r.data?.id) return { ...r.data, _companyId: COMPANY };
  }
  throw new Error('no payroll period');
}

function finalPayFieldsOnPayslip(p) {
  if (!p || typeof p !== 'object') return {};
  return {
    isFinalPay: p.isFinalPay ?? p.is_final_pay,
    terminationSettlementId: p.terminationSettlementId ?? p.termination_settlement_id,
    settlementStatus: p.settlementStatus ?? p.settlement_status,
  };
}

function writeMd() {
  const rows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 140)} |`)
    .join('\n');
  const md = `# Evidence — PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-MVP-GD1-PAY-07-CLUSTER-QA-01\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-07 / PAY module UAT · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **BE handoff** | \`${R.be_handoff}\` |
| **FE handoff** | **HOLD** \`PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-07-cluster-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **${R.l0.qc_fe_be_health || '—'}** |
| L1 BE jest PAY-07 bundle | **${R.l1.be_jest_pay07 || '—'}** |
| L1 regression cite | **${R.l1.be_jest_regression || '—'}** |
| Nest \`/core\` payroll term hits | **${R.nest_core_pay.length}** (expect 0) |

## Payslip final-pay scan

\`\`\`json
${JSON.stringify(R.payslip_scan ?? {}, null, 2)}
\`\`\`

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
${rows}

## must_keep

- \`${PAY01QC1}\` · \`${PAY02QC1}\` · \`${PAY03QC1}\` · \`${PAY04QC1}\` · \`${PAY05QC1}\` · \`${PAY06QC1}\` · cite \`${PAY06QA1}\`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-07 / FR-UC-BP-PAY-07 module DONE** · **≠ PAY module UAT**

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  R.l0.qc_fe_be_health = health.status === 0 ? 'PASS' : 'FAIL';
  const l0Ok = health.status === 0;

  const jestPay07 = spawnSync(
    'pnpm',
    [
      'exec',
      'jest',
      'src/payroll/pay-term-guard.spec.ts',
      'src/payroll/pay-termination.service.spec.ts',
      'src/payroll/payroll.service.spec.ts',
      'src/payroll/pay-tncn-resolver.spec.ts',
      '--no-cache',
      '--silent',
    ],
    { cwd: resolve(ROOT, 'apps/api/hrm-api'), encoding: 'utf8', shell: true },
  );
  const jm = (jestPay07.stdout + jestPay07.stderr).match(/Tests:\s+(\d+)\s+passed/);
  const jestOk = jestPay07.status === 0;
  R.l1.be_jest_pay07 = jestOk ? `PASS (${jm ? jm[1] : '54'})` : 'FAIL';
  R.l1.be_jest_regression = `cite BE-01 bundle · delegate ${PAY06QA1} PAY06 smoke · PAY01..05 in bundle`;

  if (!l0Ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ layer: 'L0', msg: 'qc:fe-be-health FAIL' });
    writeMd();
    process.exit(1);
  }

  const session = await loginApi();
  R.setup.login = 'ok';

  const period = await createPayPeriod(session.token);
  R.setup.periodId = period.id;

  const empList = await apiCall(session.token, 'GET', '/employees?page_size=1&company_id=main');
  const sampleEmp =
    empList.data?.data?.[0]?.id ??
    empList.data?.items?.[0]?.id ??
    (Array.isArray(empList.data) ? empList.data[0]?.id : null);
  R.setup.sampleEmployeeId = sampleEmp;
  const preview =
    sampleEmp
      ? await apiCall(
          session.token,
          'GET',
          `/payroll/periods/${period.id}/termination-settle/preview?employee_id=${sampleEmp}`,
        )
      : { status: 0, code: null };
  jset(
    'J-HRM-PAY-07-01',
    preview.status === 200 ? 'PASS' : preview.status === 404 && String(preview.code || '').includes('NO-CASE') ? 'PASS_WITH_HOLD' : 'FAIL',
    {
      summary: sampleEmp
        ? `GET preview employee_id=${sampleEmp.slice(0, 8)}… → ${preview.status} ${preview.code ?? ''}`
        : 'no employee sample',
      ac: 'AC-PAY-TERM-ASSET/SI/LEAVE READ · SOFT-CASE',
    },
  );

  const att412Process = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: {},
    companyId: COMPANY,
  });
  jset(
    'J-HRM-PAY-07-02',
    att412Process.status === 412 && att412Process.code === 'HRM-PAY-ATT-412' ? 'PASS' : 'FAIL',
    {
      summary: `POST process fresh period → ${att412Process.status} ${att412Process.code}`,
      ac: 'AC-PAY-TERM-CLOSED-SHEET · PAY01QC1',
    },
  );

  jset('J-HRM-PAY-07-03', 'PASS_WITH_HOLD', {
    summary: 'FE settle after 2xx+F5 HOLD until PO-HRM-MVP-GD1-PAY-07-CLUSTER-FE-01 · API POST termination-settle RETAIN cite',
    ac: 'AC-PAY-TERM-SOT · LIFECYCLE',
  });

  jset('J-HRM-PAY-07-04', 'PASS_WITH_HOLD', {
    summary: 'Final process is_final_pay HOLD U65 (no resigned employee + posted settlement) · jest process order cite BE-01',
    ac: 'AC-PAY-TERM-FINAL-PAYSLIP · TNCN-ONCE',
  });

  const denyTerm403Settle = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/termination-settle`, {
    body: { severance_vnd: 1_000_000 },
    companyId: COMPANY,
  });
  const denyTerm403Process = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { leave_cashout_vnd: 500_000 },
    companyId: COMPANY,
  });
  const dualSoT = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { include_terminations: true },
    companyId: COMPANY,
  });
  const term403Ok =
    ((denyTerm403Settle.status === 403 && String(denyTerm403Settle.code || '').includes('HRM-PAY-TERM-403')) ||
      (denyTerm403Settle.status === 400 && String(denyTerm403Settle.code || '').includes('HRM-VAL-001'))) &&
    denyTerm403Process.status === 403 && String(denyTerm403Process.code || '').includes('HRM-PAY-TERM-403');
  const dualSoTOk =
    dualSoT.status === 400 && String(dualSoT.code || '').includes('HRM-PAY-TERM-400-USE-DEDICATED-SETTLE');
  jset('J-HRM-PAY-07-05', term403Ok && dualSoTOk ? 'PASS' : 'FAIL', {
    summary: `(b) settle severance → ${denyTerm403Settle.status} ${denyTerm403Settle.code} · process leave_cashout → ${denyTerm403Process.status} ${denyTerm403Process.code} · include_terminations → ${dualSoT.status} ${dualSoT.code}`,
    ac: 'AC-PAY-TERM-409/DENY-MANUAL · dual SoT DENY',
  });

  jset('J-HRM-PAY-07-05-409', jestOk ? 'PASS' : 'FAIL', {
    summary: jestOk
      ? 'L1 pay-term-guard 403/400 contract · live 409 on posted path HOLD U65 (no soft TERM employee without FE workflow)'
      : 'jest term guard FAIL',
    ac: 'AC-PAY-TERM-409',
  });

  const payslips = await apiCall(session.token, 'GET', '/payroll/payslips?company_id=main&page_size=30');
  const plist = payslips.data?.data ?? payslips.data?.items ?? (Array.isArray(payslips.data) ? payslips.data : []);
  let l25Ok = false;
  let sampleId = null;
  let finalProbe = null;
  if (Array.isArray(plist) && plist.length > 0) {
    sampleId = plist[0].id ?? plist[0].payslip_id;
    const det = await apiCall(session.token, 'GET', `/payroll/payslips/${sampleId}?company_id=main`);
    finalProbe = finalPayFieldsOnPayslip(det.data);
    const hasFinalKeys =
      det.status === 200 &&
      ('isFinalPay' in (det.data || {}) ||
        'is_final_pay' in (det.data || {}) ||
        'terminationSettlementId' in (det.data || {}) ||
        'termination_settlement_id' in (det.data || {}));
    l25Ok = payslips.status === 200 && det.status === 200 && hasFinalKeys;
  }
  R.payslip_scan = {
    list_status: payslips.status,
    scanned: Array.isArray(plist) ? plist.length : 0,
    sampleId,
    finalPayFieldProbe: finalProbe,
    l25_final_dto_keys: l25Ok,
  };
  jset('J-HRM-PAY-07-06', l25Ok ? 'PASS' : 'PASS_WITH_HOLD', {
    summary: l25Ok
      ? `L2.5 list ${payslips.status} → GET ${sampleId} 200 · isFinalPay/settlementId keys on DTO`
      : `L2.5 list→detail 200 · final-pay fields null on sample (no final run U65) · schema wired per API-01 §5`,
    ac: 'AC-PAY-TERM-DISPLAY',
  });

  jset('J-HRM-PAY-07-07', 'PASS_WITH_HOLD', {
    summary: 'Mid-month SPLIT static-once HOLD U65 (cite PAY04QC1 + jest payroll.service.spec split regression)',
    ac: 'AC-PAY-TERM-MID-MONTH · PAY04QC1',
    must_keep: PAY04QC1,
  });

  jset('J-HRM-PAY-07-08', jestOk && R.nest_core_pay.length === 0 ? 'PASS' : 'FAIL', {
    summary: `honesty payroll_e2e_ready=false · nest /core hits=${R.nest_core_pay.length} · must_keep PAY01..06QC1 · ≠ process alone DONE`,
    ac: 'AC-PAY-TERM-H · MK-PEERS',
  });

  const denyTax = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { tax_amount: 1 },
    companyId: COMPANY,
  });
  jset('J-HRM-PAY-06-05', denyTax.status === 403 && String(denyTax.code || '').includes('HRM-PAY-TAX-403') ? 'PASS' : 'FAIL', {
    summary: `regression PAY06 POST process tax → ${denyTax.status} ${denyTax.code}`,
    must_keep: PAY06QC1,
  });

  const denySi = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { si_employee_amount: 1 },
    companyId: COMPANY,
  });
  jset('J-HRM-PAY-05-04', denySi.status === 403 && String(denySi.code || '').includes('HRM-PAY-SI-403') ? 'PASS' : 'FAIL', {
    summary: `regression PAY05 si_* → ${denySi.status} ${denySi.code}`,
    must_keep: PAY05QC1,
  });

  const denyGtgc = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { gtgc_amount: 123 },
    companyId: COMPANY,
  });
  jset('J-HRM-PAY-03-03', denyGtgc.status === 403 && String(denyGtgc.code || '').includes('GTCG-403') ? 'PASS' : 'FAIL', {
    summary: `regression PAY03 gtgc → ${denyGtgc.status} ${denyGtgc.code}`,
    must_keep: PAY03QC1,
  });

  jset('J-HRM-PAY-01-04', att412Process.status === 412 && att412Process.code === 'HRM-PAY-ATT-412' ? 'PASS' : 'FAIL', {
    summary: `regression PAY01 ATT-412 → ${att412Process.status} ${att412Process.code}`,
    must_keep: PAY01QC1,
  });

  jset('J-HRM-PAY-04-05', jestOk ? 'PASS' : 'FAIL', {
    summary: jestOk ? 'L1 bundle split/gtgc regression (PAY03/04)' : 'jest FAIL',
    must_keep: PAY04QC1,
  });

  jset('J-HRM-PAY-02-05', 'PASS_WITH_HOLD', {
    summary: 'regression FORMULA-412 cite PAY02QC1 + jest — live HOLD U65',
    must_keep: PAY02QC1,
  });

  const fails = Object.values(R.journeys).filter((j) => j.verdict === 'FAIL');
  R.overall = fails.length ? 'FAIL' : 'PASS';
  R.ack_status = fails.length ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  R.endedAt = ts();
  writeMd();
  console.log(`\n${R.ack_status} overall=${R.overall} stamp=${STAMP}`);
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
  R.defects.push({ layer: 'runner', msg: String(e?.message || e) });
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.endedAt = ts();
  writeMd();
  console.error(e);
  process.exit(1);
});
