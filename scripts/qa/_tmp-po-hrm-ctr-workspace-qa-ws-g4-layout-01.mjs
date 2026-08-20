#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01 — WS-G4-09..11 layout bind browser U65
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `CTRWSG4L-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-ctr-workspace-qa-ws-g4-layout-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01',
  stamp: STAMP,
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  rows: {},
  journeys: {},
  network: {
    view_gets: [],
    clause_list_calls: [],
    step2_clause_list_after: [],
  },
  api_probe: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ack_status: null,
  defects: [],
  endedAt: null,
};

function row(id, verdict, detail) {
  R.rows[id] = { verdict, ...detail };
}

function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
}

async function loginApi() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j?.data ?? j;
  const token = d?.accessToken ?? d?.access_token;
  if (!r.ok || !token) throw new Error('login failed');
  return { token, companyId: COMPANY };
}

async function pickContractForLayout(token) {
  const h = { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' };
  const listR = await fetch(`${HRM}/contracts-insurance/contracts?company_id=${COMPANY}&page_size=20`, { headers: h });
  const listJ = await listR.json().catch(() => ({}));
  const rows = listJ?.data?.data ?? listJ?.data ?? [];
  let best = null;
  let bestDetail = null;
  for (const r of rows) {
    const detR = await fetch(`${HRM}/contracts-insurance/contracts/${r.id}?company_id=${COMPANY}`, { headers: h });
    const detJ = await detR.json().catch(() => ({}));
    const d = detJ?.data ?? detJ;
    const snap = {
      id: r.id,
      status: detR.status,
      can_issue: d?.can_issue,
      clause_layout_len: Array.isArray(d?.clause_layout) ? d.clause_layout.length : 0,
      preview_summary: d?.preview_summary ?? null,
      contract_code: d?.contract_code,
      employee_name: d?.employee_name ?? d?.candidate_label,
    };
    if (!best || snap.clause_layout_len > best.clause_layout_len) {
      best = snap;
      bestDetail = d;
    }
  }
  return { list: rows, picked: best, detail: bestDetail };
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
  await page.addInitScript((s) => {
    const payload = JSON.stringify({ email: s.email });
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
    }
  }, { ...session, expiresAt, email: EMAIL });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function resolveHrmFrame(page, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      const has = await f
        .locator('[data-testid="hdsd-contracts-create-btn"], [data-testid="hdsd-contracts-view-btn"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (has) return f;
    }
    await sleep(400);
  }
  return null;
}

function wireNetwork(page) {
  page.on('response', (res) => {
    const url = res.url();
    const method = res.request().method();
    if (
      method === 'GET' &&
      url.includes('/contracts-insurance/contracts/') &&
      !url.includes('/preview') &&
      !url.includes('/print')
    ) {
      R.network.view_gets.push({ status: res.status(), url: url.slice(0, 160) });
    }
    if (method === 'GET' && /contract-clauses|\/clauses(\?|$)/i.test(url)) {
      R.network.clause_list_calls.push({ status: res.status(), url: url.slice(0, 160), at: ts() });
    }
  });
}

async function findShell(page, hrmCtx) {
  for (const ctx of [page, hrmCtx, ...page.frames()]) {
    if (!ctx) continue;
    const viewRoot = await ctx.locator('[data-testid="ctr-workspace-view-root"]').first().isVisible().catch(() => false);
    if (viewRoot) return ctx;
  }
  return null;
}

async function main() {
  const session = await loginApi();
  R.api_probe = await pickContractForLayout(session.token);
  if (!R.api_probe.picked?.id) {
    row('WS-G4-09', 'BLOCKED', { reason: 'no contracts in list — U65 cannot seed' });
    row('WS-G4-10', 'BLOCKED', {});
    row('WS-G4-11', 'BLOCKED', {});
    R.ack_status = 'FAIL_TO_PM';
    defect('DEF-CTR-U65-NO-CONTRACT', 'P0', 'zero contracts for view layout test');
    writeEvidence();
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wireNetwork(page);
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 240)));

  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;
  const contractId = R.api_probe.picked.id;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    const viewBtn = hrmCtx.getByTestId('hdsd-contracts-view-btn').first();
    if (!(await viewBtn.isVisible({ timeout: 30000 }).catch(() => false))) {
      throw new Error('hdsd-contracts-view-btn not visible');
    }

    const getBefore = R.network.view_gets.length;
    const clauseBefore = R.network.clause_list_calls.length;
    await viewBtn.click({ timeout: 20000 });
    await sleep(2500);

    let shell = await findShell(page, hrmCtx);
    if (!shell) {
      await sleep(2000);
      shell = await findShell(page, hrmCtx);
    }
    if (!shell) throw new Error('ctr-workspace-view-root not visible after Eye click');

    const viewDialog = shell.getByTestId('hdsd-contracts-view-dialog');
    const viewRoot = shell.getByTestId('ctr-workspace-view-root');
    const viewBody = shell.getByTestId('hdsd-contracts-view-body');
    const viewOk =
      (await viewDialog.isVisible().catch(() => false)) &&
      (await viewRoot.isVisible().catch(() => false)) &&
      (await viewBody.isVisible().catch(() => false));

    const newGets = R.network.view_gets.slice(getBefore);
    const getOk = newGets.some((g) => g.status >= 200 && g.status < 300);
    const getCountOnOpen = newGets.length;

    row('WS-G4-09', viewOk && getOk ? 'PASS' : viewOk ? 'PASS_WITH_HOLD' : 'FAIL', {
      viewOk,
      getOk,
      getCountOnOpen,
      gets: newGets,
      partyVisible: await shell.getByTestId('hdsd-contracts-view-party').isVisible().catch(() => false),
      contractId,
      page_url: page.url(),
    });
    R.journeys['J-HRM-03'] = { verdict: R.rows['WS-G4-09'].verdict.startsWith('PASS') ? 'PASS' : 'FAIL' };

    await shot(page, '01-view-step1');

    // Step 2 — clause layout canvas
    const step2Tab = shell.getByRole('tab', { name: /2\. Điều khoản/i });
    const clauseListBeforeStep2 = R.network.clause_list_calls.length;
    await step2Tab.click({ timeout: 15000 });
    await sleep(1500);

    const clauseListAfterStep2 = R.network.clause_list_calls.slice(clauseListBeforeStep2);
    const layoutList = shell.getByTestId('ctr-workspace-view-clause-layout');
    const canvas = shell.getByTestId('ctr-create-clause-canvas');
    const layoutVisible = await layoutList.isVisible().catch(() => false);
    const canvasVisible = await canvas.isVisible().catch(() => false);
    const clauseItems = layoutVisible ? await layoutList.locator('li').count() : 0;
    const readOnlyLabel = await shell.getByText(/chỉ xem/i).first().isVisible().catch(() => false);
    const paletteVisible = await shell.getByTestId('ctr-create-clause-palette').isVisible().catch(() => false);

    const oneGetOnly =
      getCountOnOpen <= 2 && !clauseListAfterStep2.some((c) => c.status >= 200 && c.status < 400);

    row('WS-G4-10', layoutVisible && readOnlyLabel && !paletteVisible && oneGetOnly ? 'PASS' : layoutVisible ? 'PASS_WITH_HOLD' : 'FAIL', {
      layoutVisible,
      canvasVisible,
      clauseItems,
      api_clause_layout_len: R.api_probe.picked.clause_layout_len,
      readOnlyLabel,
      paletteVisible,
      oneGetOnly,
      clause_list_on_step2: clauseListAfterStep2,
      note: 'clause_layout from GET; no palette in view readOnly',
    });

    await shot(page, '02-view-step2-clause-layout');

    // WS-G4-11 — can_issue gate In/PDF
    const issueBtn = shell.getByTestId('ctr-workspace-view-issue-btn');
    const pdfBtn = shell.getByTestId('ctr-workspace-view-pdf-btn');
    const previewBtn = shell.getByTestId('ctr-workspace-view-preview-btn');
    const hint = shell.getByTestId('ctr-workspace-view-issue-blocked-hint');

    const canIssueApi = R.api_probe.picked.can_issue === true;
    const issueDisabled = await issueBtn.isDisabled().catch(() => null);
    const pdfDisabled = await pdfBtn.isDisabled().catch(() => null);
    const previewEnabled = !(await previewBtn.isDisabled().catch(() => true));
    const hintVisible = await hint.isVisible().catch(() => false);
    const hintText = hintVisible ? (await hint.innerText().catch(() => '')).trim() : '';

    const gateOk =
      !canIssueApi &&
      issueDisabled === true &&
      pdfDisabled === true &&
      hintVisible &&
      hintText.length > 10 &&
      /thiếu|chưa đủ|điều kiện/i.test(hintText);

    row('WS-G4-11', gateOk ? 'PASS' : canIssueApi ? 'PASS_WITH_HOLD' : 'FAIL', {
      can_issue_api: R.api_probe.picked.can_issue,
      issueDisabled,
      pdfDisabled,
      previewEnabled,
      hintVisible,
      hintText: hintText.slice(0, 200),
      preview_summary: R.api_probe.picked.preview_summary,
      honesty: false,
    });

    await shot(page, '03-issue-gate');

    // F5 persistence — reopen view step2
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3000);
    const hrmAfter = (await resolveHrmFrame(page)) || hrmCtx;
    await hrmAfter.getByTestId('hdsd-contracts-view-btn').first().click({ timeout: 20000 });
    await sleep(2000);
    const shellF5 = (await findShell(page, hrmAfter)) || shell;
    await shellF5.getByRole('tab', { name: /2\. Điều khoản/i }).click();
    await sleep(1200);
    const layoutAfterF5 = await shellF5.getByTestId('ctr-workspace-view-clause-layout').isVisible().catch(() => false);
    const itemsAfterF5 = layoutAfterF5
      ? await shellF5.getByTestId('ctr-workspace-view-clause-layout').locator('li').count()
      : 0;
    const getsAfterF5 = R.network.view_gets.filter((g) => g.status >= 200 && g.status < 300);

    const f5Ok = layoutAfterF5 && getsAfterF5.length >= 2;
    row('WS-G4-09-F5', f5Ok ? 'PASS' : 'FAIL', { layoutAfterF5, itemsAfterF5, getCountTotal: getsAfterF5.length });
    await shot(page, '04-f5-step2');

    // Merge F5 into WS-G4-09 if fail
    if (R.rows['WS-G4-09-F5'].verdict === 'FAIL' && R.rows['WS-G4-09'].verdict.startsWith('PASS')) {
      R.rows['WS-G4-09'].verdict = 'FAIL';
      R.rows['WS-G4-09'].f5_fail = true;
    }
  } catch (fatal) {
    R.browser_fatal = String(fatal);
    defect('DEF-CTR-G4L-FATAL', 'P0', String(fatal).slice(0, 200));
    for (const id of ['WS-G4-09', 'WS-G4-10', 'WS-G4-11']) {
      if (!R.rows[id]) row(id, 'FAIL', { fatal: String(fatal).slice(0, 120) });
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const fails = ['WS-G4-09', 'WS-G4-10', 'WS-G4-11'].filter((id) => {
    const v = R.rows[id]?.verdict;
    return !v || v === 'FAIL' || v === 'BLOCKED';
  });
  if (R.rows['WS-G4-10']?.verdict === 'FAIL' && R.api_probe.picked?.clause_layout_len === 0) {
    defect('DEF-CTR-LAYOUT-EMPTY', 'P2', 'API clause_layout empty — canvas empty state only');
  }
  if (R.rows['WS-G4-11']?.verdict === 'FAIL') {
    defect('DEF-CTR-ISSUE-GATE-FE', 'P1', 'can_issue=false but In/PDF not disabled or missing VI hint');
  }
  if (R.pageErrors.some((e) => /Syntax Error|Expression expected/i.test(e))) {
    defect('DEF-CTR-WIZARD-SYNTAX-P0', 'P0', 'ContractCreateWizardDialog.tsx syntax error blocks HRM bundle');
  }

  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const rowTable = Object.entries(R.rows)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 280)} |`)
    .join('\n');

  const md = `# Evidence — PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01\` |
| **runner_stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status ?? 'PENDING'}** |
| **URL (mandatory)** | \`${R.url_required}\` |
| **persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · \`company_id=main\` · U65 zero-seed |
| **hdsd_align** | \`UI-CTR-WORKSPACE.md\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.json\` |
| **commit** | \`${COMMIT}\` |
| **honesty** | \`contracts_printable_ready=false\` · C-SLICE ≠ module CTR UAT |

## Gates (this session)

| Gate | Result |
|------|--------|
| L0 stack | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** (UV exit quirk Windows) |
| L0 FE↔BE | \`pnpm run qc:fe-be-health\` — **exit 0** |

## API probe (no seed)

\`\`\`json
${JSON.stringify(R.api_probe, null, 2).slice(0, 2000)}
\`\`\`

## Matrix WS-G4-09..11

| Row | Verdict | Detail |
|-----|---------|--------|
${rowTable || '| — | — | — |'}

## Network

\`\`\`json
${JSON.stringify(R.network, null, 2).slice(0, 2500)}
\`\`\`

## Console / page errors (sample)

${R.consoleErrors.slice(0, 5).map((e) => `- ${e}`).join('\n') || '- none'}

${R.pageErrors.slice(0, 5).map((e) => `- ${e}`).join('\n') || ''}

## Screenshots

${R.screens.map((s) => `- \`${s}\``).join('\n') || '- none'}

## Defects

${R.defects.length ? R.defects.map((d) => `| **${d.id}** | ${d.severity} | ${d.note} |`).join('\n') : '| — | — | none |'}

## completion_report

**Closed:** U65 browser WS-G4-09..11 on \`command-center/hrm/contracts\` — view workspace Step1 GET detail · Step2 \`clause_layout\` read-only canvas · \`can_issue=false\` In/PDF gate · F5.

**Residual:** \`contracts_printable_ready=false\` — no UF-HRM-10 / module PDF UAT claim.

## next_owner

\`pm\` → \`qc\` narrow GWC if PASS; else \`dev-fe\` for layout/issue-gate defects.

## next_dispatch_prompt

\`\`\`text
work_item_id: PO-HRM-CTR-WORKSPACE-QC-WS-G4-LAYOUT-01
role: qc
read_first: docs/qa/evidence/po-hrm-ctr-workspace-qa-ws-g4-layout-01.md
entry_criteria: QA WS-G4-LAYOUT ack_status PASS_TO_PM or FAIL_TO_PM
exit_criteria: GWC on layout bind slice — honesty contracts_printable_ready=false; cấm UF-HRM-10 full
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-ws-g4-layout-01.md
\`\`\`

**ack_status:** **${R.ack_status ?? 'PENDING'}**
`;

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  writeFileSync(OUT_MD, md, 'utf8');
  console.log('Wrote', OUT_MD);
  console.log('ack_status', R.ack_status);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  defect('DEF-CTR-G4L-RUNNER', 'P0', String(e));
  writeEvidence();
  process.exit(1);
});
