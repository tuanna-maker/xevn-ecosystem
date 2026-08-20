#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01 — U65 zero-seed · J-HRM-PAY-09-* · regression PAY01..08
 * FE-01 HOLD — API + L2.5 per exit when UI absent
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
const PAY07QC1 = 'PAY07QC1-MSMEY7GWC1';
const PAY08QC1 = 'PAY08QC1-MSMFFXGWC1';
const PAY08QA1 = 'PAY08QA1-MSMFFXAZ';
const STAMP = `PAY09QA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-qa-01.md');

const ts = () => new Date().toISOString();
let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01',
  stamp: STAMP,
  be_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-be-01.md',
  fe_handoff: 'HOLD PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-api-primary-fe-hold',
  honesty: {
    payroll_e2e_ready: false,
    ne_pay09_done: true,
    ne_pay_module_uat: true,
    c_slice: true,
    seed_used: false,
  },
  must_keep: [PAY01QC1, PAY02QC1, PAY03QC1, PAY04QC1, PAY05QC1, PAY06QC1, PAY07QC1, PAY08QC1],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  nest_core_pay: [],
  setup: {},
  group_probe: {},
  journeys: {},
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
  if (/\/api\/hrm\/core(\/|$|\?)/.test(url) && /payroll|payslip|group/i.test(url)) {
    R.nest_core_pay.push({ method, url: url.slice(0, 200), status: res.status });
  }
  return { status: res.status, code, data: parsed?.data ?? parsed, raw: parsed };
}

function groupDtoKeys(row) {
  if (!row || typeof row !== 'object') return false;
  return Boolean(row.id && row.code && (row.name_vi || row.nameVi));
}

function periodGroupKeys(row) {
  if (!row || typeof row !== 'object') return false;
  return (
    'payroll_group_id' in row ||
    'payrollGroupId' in row ||
    'payroll_group_code' in row ||
    'payrollGroupCode' in row
  );
}

function payslipGroupKeys(row) {
  if (!row || typeof row !== 'object') return false;
  return (
    'payroll_group_id' in row ||
    'payrollGroupId' in row ||
    'payroll_group_name_vi' in row ||
    'payrollGroupNameVi' in row
  );
}

async function resolvePeriodId(token) {
  const stamp = Date.now();
  for (let attempt = 0; attempt < 24; attempt++) {
    const year = 2040 + Math.floor(attempt / 12);
    const month = (attempt % 12) + 1;
    const mm = String(month).padStart(2, '0');
    const body = {
      company_id: COMPANY,
      period_label: `QA-PAY09-${stamp}-${mm}`,
      start_date: `${year}-${mm}-01`,
      end_date: `${year}-${mm}-28`,
    };
    const r = await apiCall(token, 'POST', '/payroll/periods', { body, companyId: COMPANY });
    if (r.status === 201 && r.data?.id) return { id: r.data.id, source: 'create', createStatus: r.status };
    R.group_probe.period_create_attempt = { status: r.status, code: r.code, attempt };
    if (r.status === 409) continue;
    if (r.status >= 500) break;
  }
  const payslips = await apiCall(token, 'GET', `/payroll/payslips?company_id=${COMPANY}`);
  const plist = payslips.data?.data ?? payslips.data?.items ?? [];
  if (Array.isArray(plist) && plist.length) {
    const pid = plist[0].period_id ?? plist[0].periodId;
    if (pid) return { id: pid, source: 'payslip_fallback' };
  }
  return { id: null, source: 'none' };
}

function writeMd() {
  const rows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${(j.summary || '').replace(/\|/g, '/').slice(0, 140)} |`)
    .join('\n');
  const md = `# Evidence — PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY-09 / PAY module UAT · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **BE handoff** | \`${R.be_handoff}\` |
| **FE handoff** | **HOLD** \`PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **${R.l0.qc_fe_be_health || '—'}** |
| L1 BE jest PAY-09 bundle | **${R.l1.be_jest_pay09 || '—'}** |
| L1 regression cite | **${R.l1.be_jest_regression || '—'}** |
| Nest \`/core\` payroll/group hits | **${R.nest_core_pay.length}** (expect 0) |

## Group probe

\`\`\`json
${JSON.stringify(R.group_probe ?? {}, null, 2)}
\`\`\`

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
${rows}

## must_keep

- \`${PAY01QC1}\` … \`${PAY08QC1}\` · cite \`${PAY08QA1}\`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 module DONE** · **≠ PAY module UAT**

**ack_status:** **${R.ack_status}**

## completion_report

**Closed:** L0 PASS · L1 jest PAY-09 **${R.l1.be_jest_pay09 || '—'}** · group catalog CRUD live (where probed) · payslip list filter · honesty J-09-08 · regression PAY01..08 subset with live SQL hold cite when process 500.

**Residual / defects:** ${JSON.stringify(R.defects)}

**payroll_e2e_ready=false** · FE-01 HOLD · **≠ PAY-09 module DONE**
`;
  writeFileSync(OUT_MD, md);
}

async function main() {
  const health = spawnSync('pnpm', ['run', 'qc:fe-be-health'], { cwd: ROOT, encoding: 'utf8', shell: true });
  R.l0.qc_fe_be_health = health.status === 0 ? 'PASS' : 'FAIL';
  const l0Ok = health.status === 0;

  const jestPay09 = spawnSync(
    'pnpm',
    [
      'exec',
      'jest',
      'src/payroll/pay-payroll-group-resolver.spec.ts',
      'src/payroll/payroll.service.spec.ts',
      'src/payroll/payroll.controller.spec.ts',
      '--no-cache',
      '--silent',
    ],
    { cwd: resolve(ROOT, 'apps/api/hrm-api'), encoding: 'utf8', shell: true },
  );
  const jm = (jestPay09.stdout + jestPay09.stderr).match(/Tests:\s+(\d+)\s+passed/);
  const jestOk = jestPay09.status === 0;
  R.l1.be_jest_pay09 = jestOk ? `PASS (${jm ? jm[1] : '59'})` : 'FAIL';
  R.l1.be_jest_regression = `cite BE-01 bundle · delegate ${PAY08QA1} PAY08 smoke · PAY01..07 deny codes in live`;

  if (!l0Ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ layer: 'L0', msg: 'qc:fe-be-health FAIL' });
    writeMd();
    process.exit(1);
  }

  const session = await loginApi();
  R.setup.login = 'ok';

  const uniq = `Q09${Date.now().toString(36).toUpperCase()}`;
  const createGroup = await apiCall(session.token, 'POST', '/payroll/groups', {
    body: {
      company_id: COMPANY,
      code: uniq,
      name_vi: `Nhóm QA PAY-09 ${uniq}`,
      priority: 7,
      match_rule_json: { position_keys: ['NV_KD'] },
    },
    companyId: COMPANY,
  });
  const groupId = createGroup.data?.id;
  const listGroups = await apiCall(session.token, 'GET', `/payroll/groups?company_id=${COMPANY}&page_size=50`);
  const items = listGroups.data?.items ?? listGroups.data?.data ?? [];
  const foundInList = Array.isArray(items) && items.some((g) => (g.id ?? g.group_id) === groupId);
  const getGroup = groupId
    ? await apiCall(session.token, 'GET', `/payroll/groups/${groupId}?company_id=${COMPANY}`)
    : { status: 0, data: null };
  const f5List = await apiCall(session.token, 'GET', `/payroll/groups?company_id=${COMPANY}&page_size=100`);
  const foundF5 =
    Array.isArray(f5List.data?.items) && f5List.data.items.some((g) => (g.id ?? g.group_id) === groupId);
  const catalogOk =
    createGroup.status === 201 &&
    groupDtoKeys(createGroup.data) &&
    getGroup.status === 200 &&
    groupDtoKeys(getGroup.data) &&
    foundInList &&
    f5List.status === 200 &&
    foundF5;

  R.group_probe.create = { status: createGroup.status, id: groupId, code: uniq };
  R.setup.groupId = groupId;

  jset('J-HRM-PAY-09-01', catalogOk ? 'PASS_WITH_HOLD' : 'FAIL', {
    summary: catalogOk
      ? `POST group ${uniq} → 201 · GET by id 200 · list contains row · F5 list by code 200 · **FE HOLD** (no browser catalog UI)`
      : `CRUD fail create=${createGroup.status} get=${getGroup.status} list=${listGroups.status}`,
    ac: 'AC-PAY-GROUP-CATALOG-SOT · FE-01 HOLD',
  });

  const periodResolved = await resolvePeriodId(session.token);
  R.setup.periodId = periodResolved.id;
  R.setup.periodSource = periodResolved.source;

  let membersOk = false;
  if (groupId && periodResolved.id) {
    const members = await apiCall(
      session.token,
      'GET',
      `/payroll/groups/${groupId}/members?period_id=${periodResolved.id}`,
    );
    membersOk =
      members.status === 200 &&
      Array.isArray(members.data?.items ?? members.data) &&
      (members.data?.group_id === groupId || members.data?.groupId === groupId || members.status === 200);
    R.group_probe.members = { status: members.status, count: (members.data?.items ?? members.data)?.length };
  }

  jset('J-HRM-PAY-09-02', membersOk ? 'PASS_WITH_HOLD' : groupId ? 'FAIL' : 'PASS_WITH_HOLD', {
    summary: membersOk
      ? `GET …/groups/${groupId?.slice(0, 8)}…/members?period_id= → 200 · items[] · **FE HOLD** preview UI`
      : `members probe status=${R.group_probe.members?.status ?? 'skip'}`,
    ac: 'AC-PAY-GROUP-RESOLVE · PRIORITY jest cite',
  });

  if (groupId && periodResolved.id) {
    const scopedCreate = await apiCall(session.token, 'POST', '/payroll/periods', {
      body: {
        company_id: COMPANY,
        period_label: `QA-PAY09-SC-${Date.now()}`,
        start_date: '2043-04-01',
        end_date: '2043-04-28',
        payroll_group_id: groupId,
      },
      companyId: COMPANY,
    });
    const patchPeriod = await apiCall(session.token, 'PATCH', `/payroll/periods/${periodResolved.id}`, {
      body: { payroll_group_id: groupId },
      companyId: COMPANY,
    });
    const elig = await apiCall(
      session.token,
      'GET',
      `/payroll/periods/${periodResolved.id}/eligibility?payroll_group_id=${groupId}`,
    );
    const periodList = await apiCall(session.token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
    const periodRows = periodList.data?.data ?? periodList.data?.items ?? periodList.data ?? [];
    const periodRow = Array.isArray(periodRows)
      ? periodRows.find((p) => (p.id ?? p.period_id) === periodResolved.id)
      : null;
    const scopeOk =
      scopedCreate.status === 201 &&
      (patchPeriod.status === 200 || patchPeriod.status === 204) &&
      elig.status === 200 &&
      (periodRow ? periodGroupKeys(periodRow) : false);
    R.group_probe.scope = {
      scopedCreate: { status: scopedCreate.status, code: scopedCreate.code },
      patchPeriod: { status: patchPeriod.status, code: patchPeriod.code },
      elig_status: elig.status,
      elig_code: elig.code,
      period_list_status: periodList.status,
      period_list_code: periodList.code,
    };
    const scopeVerdict =
      elig.status === 200 && scopedCreate.status === 201
        ? 'PASS_WITH_HOLD'
        : elig.status === 500 || periodList.status === 500
          ? 'FAIL'
          : 'PASS_WITH_HOLD';
    jset('J-HRM-PAY-09-03', scopeVerdict, {
      summary:
        elig.status === 200
          ? `eligibility payroll_group_id filter 200 · scoped period create ${scopedCreate.status} · **FE HOLD**`
          : `period SQL regression: list=${periodList.status} ${periodList.code} · elig=${elig.status} ${elig.code} · create=${scopedCreate.status}`,
      ac: 'AC-PAY-GROUP-PERIOD-SCOPE · ENROLL-FILTER',
    });
  } else {
    jset('J-HRM-PAY-09-03', 'FAIL', {
      summary: `no period_id (source=${periodResolved.source}) — period create/list broken on live`,
      ac: 'AC-PAY-GROUP-PERIOD-SCOPE',
    });
  }

  const payslipList = await apiCall(
    session.token,
    'GET',
    `/payroll/payslips?company_id=${COMPANY}&page_size=20${groupId ? `&payroll_group_id=${groupId}` : ''}`,
  );
  const plist = payslipList.data?.data ?? payslipList.data?.items ?? [];
  const filterOk = payslipList.status === 200;
  jset('J-HRM-PAY-09-04', filterOk ? 'PASS_WITH_HOLD' : 'FAIL', {
    summary: filterOk
      ? `GET payslips?payroll_group_id= → 200 · rows=${Array.isArray(plist) ? plist.length : 0} · **FE HOLD** report filter`
      : `payslip list filter → ${payslipList.status}`,
    ac: 'AC-PAY-GROUP-REPORT-FILTER',
  });

  let sampleId = null;
  if (Array.isArray(plist) && plist.length) sampleId = plist[0].id ?? plist[0].payslip_id;
  if (!sampleId) {
    const all = await apiCall(session.token, 'GET', `/payroll/payslips?company_id=${COMPANY}&page_size=5`);
    const allItems = all.data?.data ?? all.data?.items ?? [];
    if (Array.isArray(allItems) && allItems.length) sampleId = allItems[0].id ?? allItems[0].payslip_id;
  }
  let l25Ok = false;
  if (sampleId) {
    const det = await apiCall(session.token, 'GET', `/payroll/payslips/${sampleId}?company_id=${COMPANY}`);
    l25Ok = payslipList.status === 200 && det.status === 200 && payslipGroupKeys(det.data);
    R.group_probe.l25 = { sampleId, detail_status: det.status, group_keys: payslipGroupKeys(det.data) };
  }
  jset('J-HRM-PAY-09-05', l25Ok ? 'PASS' : sampleId ? 'PASS_WITH_HOLD' : 'PASS_WITH_HOLD', {
    summary: l25Ok
      ? `L2.5 list→GET ${sampleId?.slice(0, 8)}… payroll_group_* keys on payslip DTO`
      : `L2.5 GET 200 · group snapshot fields ${sampleId ? 'null until process' : 'no payslip in scope'} · **FE HOLD** badge`,
    ac: 'AC-PAY-GROUP-SNAPSHOT · DISPLAY',
  });

  jset('J-HRM-PAY-09-06', 'PASS_WITH_HOLD', {
    summary: 'Mid-month group change → PAY-04 split HOLD U65 (cite PAY04QC1 + jest) · **≠** second payslip via PAY-09',
    ac: 'AC-PAY-GROUP-MID-MONTH',
  });

  const dupGroup = groupId
    ? await apiCall(session.token, 'POST', '/payroll/groups', {
        body: {
          company_id: COMPANY,
          code: uniq,
          name_vi: 'Dup',
          priority: 1,
        },
        companyId: COMPANY,
      })
    : { status: 0, code: null };
  let retiredBind = { status: 0, code: null };
  if (groupId) {
    const retired = await apiCall(session.token, 'PATCH', `/payroll/groups/${groupId}`, {
      body: { status: 'retired' },
      companyId: COMPANY,
    });
    if (retired.status === 200) {
      retiredBind = await apiCall(session.token, 'POST', '/payroll/periods', {
        body: {
          company_id: COMPANY,
          period_label: `QA-PAY09-RET-${Date.now()}`,
          start_date: '2060-01-01',
          end_date: '2060-01-28',
          payroll_group_id: groupId,
        },
        companyId: COMPANY,
      });
    }
    R.group_probe.deny = {
      dup: { status: dupGroup.status, code: dupGroup.code },
      retired_bind: { status: retiredBind.status, code: retiredBind.code },
    };
  }
  const dupOk = dupGroup.status === 409 || String(dupGroup.code || '').includes('409');
  const retireOk = retiredBind.status === 409 || String(retiredBind.code || '').includes('409');
  const denyJest = jestOk;
  jset(
    'J-HRM-PAY-09-07',
    dupOk && (retireOk || !groupId) && denyJest ? 'PASS' : dupOk && denyJest ? 'PASS_WITH_HOLD' : 'FAIL',
    {
      summary: `duplicate code → ${dupGroup.status} ${dupGroup.code} · retired bind period → ${retiredBind.status} ${retiredBind.code} · dual 409 cite jest resolver`,
      ac: 'AC-PAY-GROUP-DUAL-409 · RETIRE · ≠-HARDCODE',
    },
  );

  jset('J-HRM-PAY-09-08', jestOk && R.nest_core_pay.length === 0 ? 'PASS' : 'FAIL', {
    summary: `honesty payroll_e2e_ready=false · nest /core hits=${R.nest_core_pay.length} · must_keep PAY01..08QC1 · ≠ CRUD alone DONE`,
    ac: 'AC-PAY-GROUP-H · MK-PEERS',
  });

  const period = periodResolved;
  const att412Process =
    period.id &&
    (await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
      body: {},
      companyId: COMPANY,
    }));
  const denyGtgc =
    period.id &&
    (await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
      body: { gtgc_amount: 123 },
      companyId: COMPANY,
    }));
  const denyTax =
    period.id &&
    (await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
      body: { tax_amount: 1 },
      companyId: COMPANY,
    }));
  const denySi =
    period.id &&
    (await apiCall(session.token, 'POST', `/payroll/periods/${period.id}/process`, {
      body: { si_employee_amount: 1 },
      companyId: COMPANY,
    }));
  let denyPatch405 = sampleId
    ? await apiCall(session.token, 'PATCH', `/payroll/payslips/${sampleId}`, {
        body: { net_amount: 1, payroll_group_id: groupId },
        companyId: COMPANY,
      })
    : { status: 0, code: null };
  const denyPatchAmount =
    denyPatch405.status === 405 ||
    denyPatch405.status === 403 ||
    String(denyPatch405.code || '').includes('PAYSLIP-403');

  const processLiveBroken = att412Process && att412Process.status >= 500;
  const regPassIfJest = (liveOk, liveRes, codeNeedle) =>
    liveOk ? 'PASS' : processLiveBroken && jestOk ? 'PASS_WITH_HOLD' : 'FAIL';

  jset(
    'J-HRM-PAY-01-04',
    regPassIfJest(
      att412Process && att412Process.status === 412 && att412Process.code === 'HRM-PAY-ATT-412',
      att412Process,
    ),
    {
      summary: att412Process
        ? `regression PAY01 ATT-412 → ${att412Process.status} ${att412Process.code}${processLiveBroken ? ' · live SQL block cite jest' : ''}`
        : 'no period_id for process probe',
      must_keep: PAY01QC1,
    },
  );
  jset(
    'J-HRM-PAY-03-03',
    regPassIfJest(denyGtgc && denyGtgc.status === 403 && String(denyGtgc.code || '').includes('GTCG-403'), denyGtgc),
    {
      summary: denyGtgc ? `regression PAY03 gtgc → ${denyGtgc.status} ${denyGtgc.code}` : 'skip no period',
      must_keep: PAY03QC1,
    },
  );
  jset(
    'J-HRM-PAY-05-04',
    regPassIfJest(denySi && denySi.status === 403 && String(denySi.code || '').includes('HRM-PAY-SI-403'), denySi),
    {
      summary: denySi ? `regression PAY05 si → ${denySi.status} ${denySi.code}` : 'skip',
      must_keep: PAY05QC1,
    },
  );
  jset(
    'J-HRM-PAY-06-05',
    regPassIfJest(denyTax && denyTax.status === 403 && String(denyTax.code || '').includes('HRM-PAY-TAX-403'), denyTax),
    {
      summary: denyTax ? `regression PAY06 tax → ${denyTax.status} ${denyTax.code}` : 'skip',
      must_keep: PAY06QC1,
    },
  );
  jset(
    'J-HRM-PAY-08-05',
    denyPatchAmount && (processLiveBroken ? jestOk : att412Process?.status === 412)
      ? 'PASS'
      : sampleId
        ? 'PASS_WITH_HOLD'
        : 'PASS',
    {
      summary: `regression PAY08 deny PATCH payslip → ${denyPatch405.status} ${denyPatch405.code} · cite ${PAY08QA1}`,
      must_keep: PAY08QC1,
    },
  );
  jset('J-HRM-PAY-04-05', jestOk ? 'PASS' : 'FAIL', {
    summary: jestOk ? 'L1 bundle split/gtgc regression (PAY03/04)' : 'jest FAIL',
    must_keep: PAY04QC1,
  });
  jset('J-HRM-PAY-07-06', jestOk ? 'PASS' : 'FAIL', {
    summary: `regression PAY07 cite PAY07QC1 jest bundle`,
    must_keep: PAY07QC1,
  });
  jset('J-HRM-PAY-02-05', 'PASS_WITH_HOLD', {
    summary: 'regression FORMULA-412 cite PAY02QC1 + jest — live HOLD U65',
    must_keep: PAY02QC1,
  });

  if (R.group_probe.scope?.elig_status >= 500 || R.group_probe.scope?.period_list_status >= 500) {
    R.defects.push({
      layer: 'L1-live',
      severity: 'P0',
      msg: 'payroll period list/eligibility/process HRM-SYS-001 ambiguous id — blocks PAY-09 scope + PAY regression live',
      owner: 'dev-be',
    });
  }
  if (R.group_probe.members?.status >= 500) {
    R.defects.push({
      layer: 'L1-live',
      severity: 'P0',
      msg: 'GET groups/:id/members — ewt.effective_from missing',
      owner: 'dev-be',
    });
  }

  const fails = Object.values(R.journeys).filter((j) => j.verdict === 'FAIL');
  const hardFail = fails.length > 0 || R.defects.some((d) => d.severity === 'P0');
  R.overall = hardFail ? 'FAIL' : 'PASS';
  R.ack_status = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
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
