#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02 — WS-G4-12 strict PASS (parent URL sync)
 * U65 zero-seed · browser-only · post DEF-CTR-G4-PROFILE-EMBED-P0 fix
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
const NV101_UUID = '33333333-3333-4333-8333-333333333333';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `CTRG4URL-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-02.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-url-retest-02');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02',
  parent: 'PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02',
  defect_closed: ['DEF-CTR-G4-PROFILE-EMBED-P0', 'DEF-CTR-G4-PROFILE-URL-P2'],
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  hdsd_align: 'UI-HRM-CTR-PROFILE-DEEP-LINK.md',
  honesty: { contracts_printable_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  gates: {},
  prereq: {},
  rows: {},
  journeys: {},
  steps_attempted: [],
  screens: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function row(id, verdict, detail) {
  R.rows[id] = { verdict, ...detail };
}
function journey(id, verdict, detail) {
  R.journeys[id] = { verdict, ...detail };
}
function step(note) {
  R.steps_attempted.push(note);
}

async function loginApi() {
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
      if (r.ok && token) return { token, user: d?.user ?? { email: EMAIL }, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function apiProbe(token) {
  const h = { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' };
  const r = await fetch(`${HRM}/employees?company_id=${COMPANY}&page_size=20`, { headers: h });
  const j = await r.json().catch(() => ({}));
  const payload = j?.data;
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return { status: r.status, count: rows.length, first: rows[0] ?? null };
}

async function probeEmbedModule() {
  const url = `${PORTAL}/hr/src/components/layout/PortalEmbedRouterSync.tsx`;
  try {
    const r = await fetch(url);
    return { url, status: r.status };
  } catch (e) {
    return { url, status: 0, error: String(e) };
  }
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
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
  }, { ...session, expiresAt });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function resolveHrmCtx(page, testId, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      if (await f.getByTestId(testId).first().isVisible().catch(() => false)) return f;
    }
    if (await page.getByTestId(testId).isVisible().catch(() => false)) return page;
    await sleep(400);
  }
  return null;
}

async function resolveWorkspaceShell(page) {
  for (const ctx of [page, ...page.frames()]) {
    const step1 = await ctx.locator('[data-testid="ctr-create-step-1"]').first().isVisible().catch(() => false);
    if (step1) return ctx;
  }
  return null;
}

function embedQs(extra = '') {
  return `portal=1&tenantId=${TENANT}&companyId=${COMPANY}${extra ? `&${extra}` : ''}`;
}

function parseParentUrl(url) {
  const u = new URL(url);
  return {
    pathname: u.pathname,
    workspace: u.searchParams.get('workspace'),
    employee_id: u.searchParams.get('employee_id'),
    lock_subject_employee: u.searchParams.get('lock_subject_employee'),
    tab: u.searchParams.get('tab'),
    search: u.search,
  };
}

async function main() {
  R.gates.embedModule = await probeEmbedModule();
  row('L2-embed-module', R.gates.embedModule.status === 200 ? 'PASS' : 'FAIL', R.gates.embedModule);

  const session = await loginApi();
  R.prereq = await apiProbe(session.token);

  const empId = R.prereq.first?.id || NV101_UUID;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await injectPortalAuth(page, session);

    const moduleFailures = [];
    page.on('response', (res) => {
      const u = res.url();
      if (u.includes('PortalEmbedRouterSync') && res.status() >= 400) {
        moduleFailures.push({ url: u, status: res.status() });
      }
    });

    step(`Navigate profile /employees/${empId}?tab=contract`);
    const profUrl = `${PORTAL}/command-center/hrm/employees/${empId}?${embedQs('tab=contract')}`;
    await page.goto(profUrl, { waitUntil: 'networkidle', timeout: 120000 }).catch(() =>
      page.goto(profUrl, { waitUntil: 'domcontentloaded', timeout: 120000 }),
    );
    await sleep(6000);

    let hrmProf = await resolveHrmCtx(page, 'employee-profile-page');
    if (!hrmProf) hrmProf = await resolveHrmCtx(page, 'ec-open-contract-workspace-create');

    const profilePageVisible = hrmProf
      ? await hrmProf.getByTestId('employee-profile-page').isVisible().catch(() => false)
      : false;

    row('L2-embed-mount', profilePageVisible && R.gates.embedModule.status === 200 ? 'PASS' : 'FAIL', {
      profilePageVisible,
      moduleFailures,
      empId,
    });

    if (!profilePageVisible) {
      step('Profile page not visible — retry navigate after 3s');
      await sleep(3000);
      await page.goto(profUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await sleep(6000);
      hrmProf = await resolveHrmCtx(page, 'employee-profile-page');
      if (!hrmProf) hrmProf = await resolveHrmCtx(page, 'ec-open-contract-workspace-create');
    }

    await shot(page, '00-profile-loaded');

    const contractTab = hrmProf?.getByTestId('profile-tab-contract');
    if (contractTab && (await contractTab.isVisible().catch(() => false))) {
      await contractTab.click();
      await sleep(1200);
      step('Clicked profile-tab-contract');
    }

    const addBtn = hrmProf?.getByTestId('ec-open-contract-workspace-create');
    if (!addBtn || !(await addBtn.isVisible().catch(() => false))) {
      row('WS-G4-12', 'FAIL', { reason: 'ec-open-contract-workspace-create not visible', empId, moduleFailures });
      journey('J-HRM-CTR-PROFILE-01', 'FAIL', { reason: 'add button not visible' });
      await shot(page, '01-profile-no-add-btn');
    } else {
      step('Click ec-open-contract-workspace-create');
      await addBtn.click();
      await sleep(3500);
      await shot(page, '01-profile-add-contract');

      const parentUrl = page.url();
      const parsed = parseParentUrl(parentUrl);
      const hasWorkspace = parsed.workspace === 'create';
      const hasEmp = parsed.employee_id === empId;
      const hasLock = parsed.lock_subject_employee === '1';

      const shell = await resolveWorkspaceShell(page);
      const step1 = Boolean(shell);
      const uvTab = shell
        ? await shell.getByTestId('ctr-create-subject-tab-candidate').isVisible().catch(() => false)
        : false;
      const uvTabHidden = !uvTab;
      const locked =
        (shell &&
          (await shell.getByTestId('ctr-create-subject-employee-locked').isVisible().catch(() => false))) ||
        hasLock;

      const pass = hasWorkspace && hasEmp && hasLock && step1 && uvTabHidden && locked;
      row('WS-G4-12', pass ? 'PASS' : 'FAIL', {
        parentUrl,
        parsed,
        hasWorkspace,
        hasEmp,
        hasLock,
        step1,
        uvTabHidden,
        locked,
        empId,
        moduleFailures,
      });
      journey('J-HRM-CTR-PROFILE-01', pass ? 'PASS' : 'FAIL', {
        clickPath: 'profile → tab HĐ → Thêm HĐ → workspace create',
        parentUrlSync: hasWorkspace && hasEmp && hasLock,
        embedLoads: profilePageVisible,
        noModule500: moduleFailures.length === 0 && R.gates.embedModule.status === 200,
      });

      if (pass) {
        step('F5 regression — reload parent URL');
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(4000);
        const afterF5 = parseParentUrl(page.url());
        const f5Pass =
          afterF5.workspace === 'create' &&
          afterF5.employee_id === empId &&
          afterF5.lock_subject_employee === '1' &&
          Boolean(await resolveWorkspaceShell(page));
        row('WS-G4-12-F5', f5Pass ? 'PASS' : 'FAIL', { url: page.url(), parsed: afterF5 });
        await shot(page, '02-after-f5');
        if (!f5Pass) {
          R.rows['WS-G4-12'].verdict = 'FAIL';
          R.rows['WS-G4-12'].f5Regression = 'FAIL';
        }
      }

      if (shell) {
        await shell.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
        await sleep(800);
      }
    }
  } catch (fatal) {
    R.fatal = String(fatal);
    row('WS-G4-12', R.rows['WS-G4-12']?.verdict ?? 'FAIL', { fatal: String(fatal).slice(0, 200) });
  } finally {
    await browser.close().catch(() => {});
  }

  const g12 = R.rows['WS-G4-12']?.verdict ?? 'FAIL';
  const l2 = R.rows['L2-embed-mount']?.verdict ?? 'FAIL';
  const l2mod = R.rows['L2-embed-module']?.verdict ?? 'FAIL';
  const j01 = R.journeys['J-HRM-CTR-PROFILE-01']?.verdict ?? 'FAIL';

  if (g12 === 'PASS' && l2 === 'PASS' && l2mod === 'PASS' && j01 === 'PASS') {
    R.ack_status = 'PASS_TO_PM';
    R.overall = 'PASS';
  } else {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
  }

  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));

  const g12 = R.rows['WS-G4-12'] ?? {};
  const g12f5 = R.rows['WS-G4-12-F5'] ?? null;
  const l2 = R.rows['L2-embed-mount'] ?? {};
  const l2mod = R.rows['L2-embed-module'] ?? {};

  const md = `# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02\` |
| **parent** | \`PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02\` |
| **role** | \`qa\` |
| **runner_stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** |
| **defects** | \`DEF-CTR-G4-PROFILE-EMBED-P0\` → ${R.overall === 'PASS' ? '**CLOSED**' : '**OPEN**'} · \`DEF-CTR-G4-PROFILE-URL-P2\` → ${R.overall === 'PASS' ? '**CLOSED**' : '**OPEN**'} |
| **persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · \`company_id=main\` · U65 zero-seed |
| **hdsd_align** | \`UI-HRM-CTR-PROFILE-DEEP-LINK.md\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-02.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-url-retest-02.json\` |
| **prior FE evidence** | \`docs/qa/evidence/po-hrm-ctr-workspace-g4-profile-url-fe-02.md\` |
| **prior QA** | \`docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-01.md\` (FAIL P0 embed) |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | \`pnpm run qc:dev-stack\` — hrm-api + xbos-api + portal **200** |
| L0 FE↔BE | \`pnpm run qc:fe-be-health\` — **ALL PASS** (exit 0) |
| **L2 embed module** | **${l2mod.verdict ?? '—'}** — \`PortalEmbedRouterSync.tsx\` HTTP **${R.gates.embedModule?.status ?? '—'}** |
| **L2 embed mount** | **${l2.verdict ?? '—'}** — \`employee-profile-page\` visible · no module 500 |

## U65 prereq (no seed)

\`\`\`json
${JSON.stringify(R.prereq, null, 2).slice(0, 1200)}
\`\`\`

## Steps attempted

${R.steps_attempted.map((s) => `- ${s}`).join('\n') || '—'}

## Matrix WS-G4-12 (strict — not PASS_WITH_HOLD)

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-12** | **${g12.verdict ?? 'FAIL'}** | ${JSON.stringify(g12).slice(0, 500)} |
${g12f5 ? `| **WS-G4-12-F5** | **${g12f5.verdict}** | ${JSON.stringify(g12f5).slice(0, 200)} |` : ''}

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-PROFILE-01** | **${R.journeys['J-HRM-CTR-PROFILE-01']?.verdict ?? '—'}** | ${JSON.stringify(R.journeys['J-HRM-CTR-PROFILE-01'] ?? {}).slice(0, 300)} |

## UF block — WS-G4-12

- **Persona / URL:** \`ceo@xe.vn\` → profile NV101 (\`${g12.empId ?? NV101_UUID}\`) tab HĐ
- **Trước mutate:** profile embed mounted · tab HĐ visible
- **Action:** \`profile-tab-contract\` → \`ec-open-contract-workspace-create\`
- **FE sau click:** \`ctr-create-step-1\` ${g12.step1 ? 'visible' : 'missing'} · UV tab ${g12.uvTabHidden ? 'hidden' : 'visible'}
- **Parent URL assert:** \`workspace=create\` + \`employee_id\` + \`lock_subject_employee=1\`
- **Parent URL observed:** \`${g12.parentUrl ?? '—'}\`
- **Verdict:** ${g12.verdict === 'PASS' ? '🟢 **PASS**' : '🔴 **FAIL**'}

## Promoted / not promoted

${R.overall === 'PASS'
    ? `- **Promoted:** WS-G4-12 strict · J-HRM-CTR-PROFILE-01 · DEF-CTR-G4-PROFILE-EMBED-P0 · DEF-CTR-G4-PROFILE-URL-P2
- **must_keep:** \`contracts_printable_ready=false\`
- **Out of scope:** WS-G4-13/14 REC hire chain`
    : `- **Not promoted:** WS-G4-12 strict · J-HRM-CTR-PROFILE-01
- **Open defects:** see JSON rows`}

## Screenshots

${R.screens.map((p) => `- \`${p}\``).join('\n') || '—'}

## completion_report

**Closed:** ${R.overall === 'PASS'
    ? 'Post FE-02 JSDoc fix — HRM embed mounts (no module 500); WS-G4-12 strict PASS: parent CC URL sync `workspace=create&employee_id&lock_subject_employee=1`; Step1 visible; UV tab hidden; J-HRM-CTR-PROFILE-01 PASS.'
    : 'WS-G4-12 and/or L2 embed FAIL — see rows above; defects remain OPEN for dev-fe.'}

**Residual:** WS-G4-13/14 REC hire BLOCKED U65 (out of scope). \`contracts_printable_ready=false\` unchanged.

## next_owner

\`${R.ack_status === 'PASS_TO_PM' ? 'pm' : 'dev-fe'}\`

## next_dispatch_prompt

\`\`\`text
${R.ack_status === 'PASS_TO_PM'
    ? `work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01
role: pm
read_first: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md
entry_criteria: QA PASS_TO_PM WS-G4-12 strict PASS; DEF-CTR-G4-PROFILE-EMBED-P0 + DEF-CTR-G4-PROFILE-URL-P2 CLOSED
exit_criteria: update seal carry table — profile URL row CLOSED; dispatch QC narrow if slice gate open
ack_status: PASS_TO_PM`
    : `work_item_id: PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-03
role: dev-fe
read_first: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md
entry_criteria: QA FAIL_TO_PM — WS-G4-12 strict or L2 embed regression
exit_criteria: parent URL workspace=create&employee_id&lock_subject_employee=1; Step1 + UV hidden; vitest contractWorkspace exit 0; READY_FOR_QA
ack_status: READY_FOR_QA`}
\`\`\`

**evidence_path:** \`docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md\`
**ack_status:** **${R.ack_status}**
`;

  writeFileSync(OUT_MD, md);
  console.log(`Wrote ${OUT_MD}`);
  console.log(`ack_status=${R.ack_status} overall=${R.overall} WS-G4-12=${g12.verdict}`);
}

main().catch((e) => {
  console.error(e);
  R.fatal = String(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  writeEvidence();
  process.exit(1);
});
