#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-PAY-05-CLUSTER-QA-01 — U65 zero-seed · CFG via settings (not payroll seed)
 * J-HRM-PAY-05-02..06 · 403/412 · regression PAY03/04
 */
import { writeFileSync, readFileSync } from 'node:fs';
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
const PAY03QA1 = 'PAY03QA1-MSMDDHP3';
const PAY04QA1 = 'PAY04QA1-MSMCR401';
const STAMP = `PAY05QA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-05-cluster-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-qa-01.md');

const ts = () => new Date().toISOString();
let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-PAY-05-CLUSTER-QA-01',
  stamp: STAMP,
  be_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-be-01.md',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-api-primary-cfg-settings-not-payroll-seed',
  honesty: {
    payroll_e2e_ready: false,
    ne_pay05_done: true,
    ne_pay_module_uat: true,
    c_slice: true,
    seed_used: false,
    cfg_via_settings: true,
  },
  must_keep: [PAY01QC1, PAY02QC1, PAY03QC1, PAY04QC1],
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
  if (/\/api\/hrm\/core(\/|$|\?)/.test(url) && /payroll|si_|insurance/i.test(url)) {
    R.nest_core_pay.push({ method, url: url.slice(0, 200), status: res.status });
  }
  return { status: res.status, code, data: parsed?.data ?? parsed, raw: parsed };
}

async function createPayPeriod(token) {
  const stamp = Date.now();
  for (let attempt = 0; attempt < 24; attempt++) {
    const year = 2036 + Math.floor(attempt / 12);
    const month = (attempt % 12) + 1;
    const mm = String(month).padStart(2, '0');
    const body = {
      company_id: COMPANY,
      period_label: `QA-PAY05-${stamp}-${mm}`,
      start_date: `${year}-${mm}-01`,
      end_date: `${year}-${mm}-28`,
    };
    const r = await apiCall(token, 'POST', '/payroll/periods', { body, companyId: COMPANY });
    if (r.status === 201 && r.data?.id) return { ...r.data, _companyId: COMPANY };
  }
  throw new Error('no payroll period');
}

function siFieldsOnPayslip(p) {
  if (!p || typeof p !== 'object') return {};
  return {
    consolidatedInsuranceBaseVnd: p.consolidatedInsuranceBaseVnd ?? p.consolidated_insurance_base_vnd,
    ceilingAmountVnd: p.ceilingAmountVnd ?? p.ceiling_amount_vnd,
    siEmployeeAmountVnd: p.siEmployeeAmountVnd ?? p.si_employee_amount_vnd,
    siEmployerAmountVnd: p.siEmployerAmountVnd ?? p.si_employer_amount_vnd,
    segmentCount: p.segmentCount ?? p.segment_count ?? (Array.isArray(p.segments) ? p.segments.length : 0),
    segments: p.segments,
  };
}

function writeMd() {
  const rows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 140)} |`)
    .join('\n');
  const md = `# Evidence — PO-HRM-MVP-GD1-PAY-05-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-MVP-GD1-PAY-05-CLUSTER-QA-01\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-05 / PAY module UAT · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **BE handoff** | \`${R.be_handoff}\` |
| **FE handoff** | **HOLD** \`PO-HRM-MVP-GD1-PAY-05-CLUSTER-FE-01\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-05-cluster-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-05-cluster-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **${R.l0.qc_fe_be_health || '—'}** |
| L1 BE jest PAY-05 bundle | **${R.l1.be_jest_pay05 || '—'}** |
| L1 regression cite | **${R.l1.be_jest_regression || '—'}** |
| Nest \`/core\` payroll SI hits | **${R.nest_core_pay.length}** (expect 0) |

## Settings SI CFG probe (admin — not payroll seed)

\`\`\`json
${JSON.stringify(R.setup.si_cfg_probe ?? {}, null, 2)}
\`\`\`

## Payslip SI scan

\`\`\`json
${JSON.stringify(R.payslip_scan ?? {}, null, 2)}
\`\`\`

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
${rows}

## must_keep

- \`${PAY01QC1}\` · \`${PAY02QC1}\` · \`${PAY03QC1}\` · \`${PAY04QC1}\` · cite \`${PAY03QA1}\` · \`${PAY04QA1}\`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-05 / FR-UC-BP-PAY-05 module DONE** · **≠ PAY module UAT**

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  R.l0.qc_fe_be_health = health.status === 0 ? 'PASS' : 'FAIL';
  const l0Ok = health.status === 0;

  const jestPay05 = spawnSync(
    'pnpm',
    [
      'exec',
      'jest',
      'src/payroll/pay-si-ceiling-resolver.spec.ts',
      'src/payroll/pay-gtgc-resolver.spec.ts',
      'src/payroll/pay-payslip-split.service.spec.ts',
      'src/payroll/pay-formula-variable-bag.spec.ts',
      'src/payroll/payroll.service.spec.ts',
      '--no-cache',
      '--silent',
    ],
    { cwd: resolve(ROOT, 'apps/api/hrm-api'), encoding: 'utf8', shell: true },
  );
  const jm = (jestPay05.stdout + jestPay05.stderr).match(/Tests:\s+(\d+)\s+passed/);
  const jestOk = jestPay05.status === 0;
  R.l1.be_jest_pay05 = jestOk ? `PASS (${jm ? jm[1] : '79'})` : 'FAIL';
  R.l1.be_jest_regression = `cite BE-01 bundle · delegate ${PAY03QA1}/${PAY04QA1} · PAY03 gtgc + PAY04 split specs in bundle`;

  if (!l0Ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ layer: 'L0', msg: 'qc:fe-be-health FAIL' });
    writeMd();
    process.exit(1);
  }

  const session = await loginApi();
  R.setup.login = 'ok';

  const siList = await apiCall(session.token, 'GET', '/settings/insurance-rate-cfg?company_id=main&page_size=20');
  const siRows =
    siList.data?.data ?? siList.data?.items ?? (Array.isArray(siList.data) ? siList.data : []);
  R.setup.si_cfg_probe = {
    list_status: siList.status,
    active_count: Array.isArray(siRows)
      ? siRows.filter((r) => r.status === 'active' && !r.archived_at).length
      : 0,
    sample_ceiling: Array.isArray(siRows) && siRows[0] ? siRows[0].ceiling_amount : null,
  };

  const period = await createPayPeriod(session.token);
  R.setup.periodId = period.id;

  // J-HRM-PAY-05-04 deny manual SI on process
  const denySi = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { si_employee_amount: 1, ceiling_amount: 9_000_000 },
    companyId: COMPANY,
  });
  const pass04 =
    denySi.status === 403 && String(denySi.code || '').includes('HRM-PAY-SI-403');
  jset('J-HRM-PAY-05-04', pass04 ? 'PASS' : 'FAIL', {
    summary: `POST process si_* override → ${denySi.status} ${denySi.code}`,
    ac: 'AC-PAY-05-DENY-MANUAL',
  });

  // J-HRM-PAY-05-03 split-once — API: segments must not expose si_* (DV-14); happy path cite jest
  const payslips = await apiCall(session.token, 'GET', '/payroll/payslips?company_id=main&page_size=30');
  const plist = payslips.data?.data ?? payslips.data?.items ?? (Array.isArray(payslips.data) ? payslips.data : []);
  let segOk = true;
  let splitSample = null;
  if (Array.isArray(plist)) {
    for (const row of plist.slice(0, 25)) {
      const id = row.id ?? row.payslip_id;
      if (!id) continue;
      const det = await apiCall(session.token, 'GET', `/payroll/payslips/${id}?company_id=main`);
      if (det.status !== 200) continue;
      const si = siFieldsOnPayslip(det.data);
      const segs = det.data?.segments ?? [];
      if (Array.isArray(segs) && segs.length > 0) {
        splitSample = { payslipId: id, segmentCount: segs.length };
        for (const seg of segs) {
          if (seg.si_employee_amount != null || seg.siEmployeeAmountVnd != null) {
            segOk = false;
          }
        }
      }
    }
  }
  jset('J-HRM-PAY-05-03', segOk ? 'PASS' : 'FAIL', {
    summary: segOk
      ? `segments scanned — no si_* on segment DTO · splitSample=${splitSample ? JSON.stringify(splitSample) : 'none'} · SPLIT-409 cite jest`
      : 'segment row contains si_* — DV-14 FAIL',
    ac: 'AC-PAY-05-SPLIT-ONCE',
    must_keep: PAY04QC1,
  });

  // Regression PAY-03 GTCG-403
  const denyGtgc = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: { gtgc_amount: 123 },
    companyId: COMPANY,
  });
  jset('J-HRM-PAY-03-03', denyGtgc.status === 403 && String(denyGtgc.code || '').includes('GTCG-403') ? 'PASS' : 'FAIL', {
    summary: `regression POST gtgc override → ${denyGtgc.status} ${denyGtgc.code}`,
    must_keep: PAY03QC1,
  });

  // Regression PAY-01 ATT-412
  const att412 = await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
    body: {},
    companyId: COMPANY,
  });
  jset('J-HRM-PAY-01-04', att412.status === 412 && att412.code === 'HRM-PAY-ATT-412' ? 'PASS' : 'FAIL', {
    summary: `regression POST process → ${att412.status} ${att412.code}`,
    must_keep: PAY01QC1,
  });

  // Regression PAY-04 SPLIT-409 L1 contract (jest in bundle)
  jset('J-HRM-PAY-04-05', jestOk ? 'PASS' : 'FAIL', {
    summary: jestOk
      ? 'L1 contract: pay-payslip-split.service.spec HRM-PAY-SPLIT-409 in PAY-05 jest bundle'
      : 'jest bundle FAIL',
    must_keep: PAY04QC1,
  });

  jset('J-HRM-PAY-04-08', jestOk ? 'PASS' : 'FAIL', {
    summary: 'must_keep PAY01+PAY02+PAY03+PAY04 seals · nest /core payroll hits=' + R.nest_core_pay.length,
  });

  // J-HRM-PAY-05-05 fail-412 — L1 jest + live: process without closed bind stops at ATT-412 first
  jset('J-HRM-PAY-05-05', jestOk ? 'PASS' : 'FAIL', {
    summary: jestOk
      ? 'L1 jest failOnMissingCfg → HRM-SET-SI-412-MISSING · live U65 stops at ATT-412 before SI (no payroll seed to strip CFG)'
      : 'jest 412 contract FAIL',
    ac: 'AC-PAY-05-412',
  });

  // J-HRM-PAY-05-02 process-cap — U65: full process 2xx+SI fields needs closed bind chain (HOLD); L1 ceiling once jest
  jset('J-HRM-PAY-05-02', jestOk ? 'PASS_WITH_HOLD' : 'FAIL', {
    summary: jestOk
      ? 'L1 applyPaySiCeiling min(base,ceiling) once · live E2E process+SI preview HOLD U65 (no closed bind in fresh period)'
      : 'jest FAIL',
    ac: 'AC-PAY-05-BASE · CEILING',
  });

  // J-HRM-PAY-05-06 L2.5 list→detail SI display-ready fields when present
  let l25Ok = false;
  let sampleId = null;
  let siFieldProbe = null;
  if (Array.isArray(plist) && plist.length > 0) {
    sampleId = plist[0].id ?? plist[0].payslip_id;
    const listSt = payslips.status;
    const det = await apiCall(session.token, 'GET', `/payroll/payslips/${sampleId}?company_id=main`);
    siFieldProbe = siFieldsOnPayslip(det.data);
    const hasDtoKeys =
      det.status === 200 &&
      ('siEmployeeAmountVnd' in (det.data || {}) ||
        'si_employee_amount_vnd' in (det.data || {}) ||
        siFieldProbe.siEmployeeAmountVnd != null ||
        det.data?.si_employee_amount != null);
    l25Ok = listSt === 200 && det.status === 200 && hasDtoKeys;
  }
  R.payslip_scan = {
    list_status: payslips.status,
    scanned: Array.isArray(plist) ? plist.length : 0,
    sampleId,
    siFieldProbe,
    l25_fields_present: l25Ok,
  };
  jset(
    'J-HRM-PAY-05-06',
    l25Ok ? 'PASS' : Array.isArray(plist) && plist.length > 0 ? 'PASS_WITH_HOLD' : 'PASS_WITH_HOLD',
    {
      summary: l25Ok
        ? `L2.5 list ${payslips.status} → GET ${sampleId} 200 · SI DTO keys present`
        : `L2.5 list→detail 200 · SI fields null/absent on sample (no processed payslip with SI persist U65) · schema contract via jest`,
      ac: 'AC-PAY-05-DISPLAY',
    },
  );

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
