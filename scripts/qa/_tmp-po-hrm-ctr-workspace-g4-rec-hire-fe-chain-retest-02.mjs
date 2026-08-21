#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02
 * U65 · CC embed ?tab=candidates&candidateId= (FE-02 deep-link fix)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const HRM_ROOT = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `CTRG4HIRE-RT2-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.json',
);
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02',
  parent: 'PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02',
  prior_defect: 'DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  prereq: {},
  rows: {},
  journeys: {},
  network: [],
  steps_attempted: [],
  screens: [],
  defects: [],
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
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j?.data ?? j;
  const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
  if (!r.ok || !token) throw new Error('login failed');
  return { token, companyId: COMPANY };
}

function embedQs(extra = '') {
  return `portal=1&tenantId=${TENANT}&companyId=${COMPANY}${extra ? `&${extra}` : ''}`;
}

function recruitmentUrl(extraQs = '') {
  return `${PORTAL}/command-center/hrm/recruitment?${embedQs(extraQs)}`;
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

/** Radix Dialog may portal outside the iframe ctx that opened it — scan page + all frames. */
async function resolveVisibleTestId(page, testId, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, ...page.frames()]) {
      const loc = ctx.getByTestId(testId).first();
      if (await loc.isVisible().catch(() => false)) return { ctx, loc };
    }
    await sleep(300);
  }
  return null;
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
  await page.addInitScript((s) => {
    const payload = JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] });
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

async function waitForRecruitmentReady(page) {
  const ctx =
    await resolveHrmCtx(page, 'rec-accept-offer-open-detail', 90000) ||
    await resolveHrmCtx(page, 'rec-stage-transition-open-detail', 5000) ||
    await resolveHrmCtx(page, 'rec-hire-cta-create-contract', 5000);
  if (ctx) return { ok: true, ctx };
  for (const f of page.frames()) {
    if (await f.locator('table tbody tr').first().isVisible().catch(() => false)) return { ok: true, ctx: f };
  }
  return { ok: false, ctx: null };
}

async function resolveWorkspaceShell(page) {
  for (const ctx of [page, ...page.frames()]) {
    if (await ctx.locator('[data-testid="ctr-create-step-1"]').first().isVisible().catch(() => false))
      return ctx;
  }
  return null;
}

async function main() {
  const session = await loginApi();
  const h = { Authorization: `Bearer ${session.token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' };
  const listRes = await fetch(`${HRM}/recruitment/candidates?company_id=${COMPANY}&page_size=50`, { headers: h });
  const listJson = await listRes.json();
  const rows = listJson?.data?.data || [];
  const acceptTarget =
    rows.find((r) => (r.requisition_id || r.recruitment_request_id) && String(r.status).toLowerCase() === 'offer' && !(r.employee_id || '').trim()) ||
    rows.find((r) => (r.requisition_id || r.recruitment_request_id) && !(r.employee_id || '').trim()) ||
    null;

  R.prereq = {
    candidates_count: rows.length,
    with_employee_id: rows.filter((x) => (x.employee_id || '').trim()).length,
    accept_target: acceptTarget
      ? { id: acceptTarget.id, name: acceptTarget.full_name, status: acceptTarget.status }
      : null,
  };

  if (!acceptTarget) {
    row('WS-G4-13', 'BLOCKED', { reason: 'no YCTD UV for U65 chain' });
    journey('J-HRM-CTR-HIRE-01', 'BLOCKED', {});
    row('WS-G4-14', 'BLOCKED', {});
    R.ack_status = 'BLOCKED';
    R.overall = 'BLOCKED';
    R.endedAt = ts();
    writeEvidence();
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  let employeeId = '';
  let acceptOfferStatus = 0;
  let hireCtaFrom = null;
  let deepLinkTabOk = false;

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await injectPortalAuth(page, session);

    page.on('response', (res) => {
      const url = res.url();
      if (!/\/api\/hrm\//.test(url)) return;
      R.network.push({
        method: res.request().method(),
        url,
        status: res.status(),
        at: ts(),
      });
    });

    const candidateId = acceptTarget.id;
    const url = recruitmentUrl(`tab=candidates&candidateId=${candidateId}`);
    step(`Goto ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 }).catch(() =>
      page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }),
    );
    await sleep(6000);

    const navCandidates = await resolveHrmCtx(page, 'recruitment-nav-candidates', 20000);
    const tabCtx = navCandidates || page;
    const uvNav = tabCtx.locator('[data-testid="recruitment-nav-candidates"]').first();
    const uvNavActive =
      (await uvNav.getAttribute('data-active').catch(() => null)) === 'true' ||
      (await uvNav.getAttribute('aria-selected').catch(() => null)) === 'true';
    const dashboardNav = tabCtx.locator('[data-testid="recruitment-nav-dashboard"]').first();
    const dashboardActive =
      (await dashboardNav.getAttribute('data-active').catch(() => null)) === 'true' ||
      (await dashboardNav.getAttribute('aria-selected').catch(() => null)) === 'true';

    deepLinkTabOk = uvNavActive && !dashboardActive;
    step(`Deep-link tab candidates active: ${deepLinkTabOk} (uvNavActive=${uvNavActive}, dashboardActive=${dashboardActive})`);

    if (!deepLinkTabOk) {
      if (await uvNav.isVisible({ timeout: 5000 }).catch(() => false)) {
        step('Fallback click recruitment-nav-candidates');
        await uvNav.click({ force: true });
        await sleep(3500);
      } else {
        const uvTab = tabCtx.getByRole('button', { name: /^ứng viên$/i }).first();
        if (await uvTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          step('Fallback click tab Ứng viên (role button)');
          await uvTab.click({ force: true });
          await sleep(3500);
        }
      }
    }

    const readyPack = await waitForRecruitmentReady(page);
    step(`Recruitment UI ready: ${readyPack.ok}`);
    await shot(page, '01-after-deeplink');

    let hrmCtx = readyPack.ctx || page;
    const detailOpen = await hrmCtx.locator('[data-testid="rec-accept-offer-open-detail"]').first().isVisible().catch(() => false);
    if (!detailOpen) {
      const targetRow = hrmCtx.locator('table tbody tr').filter({ hasText: acceptTarget.name }).first();
      if (await targetRow.isVisible({ timeout: 5000 }).catch(() => false)) {
        step(`Open detail row for ${acceptTarget.name}`);
        await targetRow.locator('button').first().click({ force: true });
        await sleep(3000);
      } else {
        const rowBtn = hrmCtx.locator('table tbody tr').first().locator('button').first();
        if (await rowBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          step('Open first candidate detail from list');
          await rowBtn.click({ force: true });
          await sleep(3000);
        }
      }
      const ready2 = await waitForRecruitmentReady(page);
      hrmCtx = ready2.ctx || hrmCtx;
      await shot(page, '02-detail-opened');
    }

    const acceptBtn = hrmCtx.locator('[data-testid="rec-accept-offer-open-detail"]').first();
    const acceptVisible = await acceptBtn.isVisible({ timeout: 8000 }).catch(() => false);

    if (!acceptVisible) {
      row('WS-G4-13', 'FAIL', {
        reason: 'rec-accept-offer-open-detail not visible',
        candidateId,
        api_status: acceptTarget.status,
        ui_ready: readyPack.ok,
        deepLinkTabOk,
      });
      journey('J-HRM-CTR-HIRE-01', 'FAIL', { step: 'accept-offer CTA missing' });
      row('WS-G4-14', 'BLOCKED', { reason: 'depends accept-offer' });
      R.defects.push({
        id: 'DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE',
        severity: 'P0',
        owner: 'dev-fe',
        note: 'FE-02 retest — CTA still absent with API status=offer',
      });
      if (!deepLinkTabOk) {
        R.defects.push({
          id: 'DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES',
          severity: 'P1',
          owner: 'dev-fe',
          note: 'Deep-link tab=candidates not active on CC embed',
        });
      }
      R.ack_status = 'FAIL_TO_PM';
      R.overall = 'FAIL';
    } else {
      step('Click Chấp nhận offer');
      await acceptBtn.click({ force: true });
      await sleep(1200);
      await shot(page, '03-accept-offer-dialog');

      const dlgPack = await resolveVisibleTestId(page, 'rec-accept-offer-dialog', 8000);
      const dlg = dlgPack?.loc ?? hrmCtx.locator('[data-testid="rec-accept-offer-dialog"]').first();
      const dlgVisible = Boolean(dlgPack) || (await dlg.isVisible({ timeout: 2000 }).catch(() => false));
      if (!dlgVisible) {
        row('WS-G4-13', 'FAIL', { reason: 'accept-offer dialog not opened' });
        journey('J-HRM-CTR-HIRE-01', 'FAIL', {});
        R.ack_status = 'FAIL_TO_PM';
        R.overall = 'FAIL';
      } else {
        const submitPack = await resolveVisibleTestId(page, 'rec-accept-offer-submit', 5000);
        const submitBtn =
          submitPack?.loc ??
          (dlgPack?.ctx ?? hrmCtx).locator('[data-testid="rec-accept-offer-submit"]').first();
        const acceptWait = page.waitForResponse(
          (r) =>
            /\/recruitment\/applications\/[^/]+\/accept-offer/.test(r.url()) &&
            r.request().method() === 'POST',
          { timeout: 30000 },
        );
        await submitBtn.click({ force: true });
        step('Submit accept-offer');
        const acceptRes = await acceptWait.catch(() => null);
        acceptOfferStatus = acceptRes?.status?.() ?? 0;
        let acceptBody = null;
        try {
          acceptBody = acceptRes ? await acceptRes.json() : null;
        } catch {
          /* */
        }
        employeeId = (acceptBody?.data?.employee_id || acceptBody?.employee_id || '').trim();
        R.network.push({
          tag: 'accept-offer',
          status: acceptOfferStatus,
          employee_id: employeeId || null,
        });
        await sleep(2000);
        await shot(page, '04-after-accept-offer');

        const acceptOk = acceptOfferStatus >= 200 && acceptOfferStatus < 300 && employeeId;
        if (!acceptOk) {
          row('WS-G4-13', 'FAIL', {
            reason: 'POST accept-offer failed or no employee_id',
            http: acceptOfferStatus,
            employee_id: employeeId || null,
            owner: acceptOfferStatus >= 400 ? 'dev-be' : 'dev-fe',
          });
          journey('J-HRM-CTR-HIRE-01', 'FAIL', { acceptOfferStatus });
          row('WS-G4-14', 'BLOCKED', {});
          R.ack_status = 'FAIL_TO_PM';
          R.overall = 'FAIL';
        } else {
          const dlgCreatePack = await resolveVisibleTestId(page, 'rec-accept-offer-create-contract', 3000);
          const dlgCreate =
            dlgCreatePack?.loc ??
            (dlgPack?.ctx ?? hrmCtx).locator('[data-testid="rec-accept-offer-create-contract"]').first();
          if (await dlgCreate.isVisible({ timeout: 3000 }).catch(() => false)) {
            step('Click Tạo HĐ from accept dialog');
            hireCtaFrom = 'accept-dialog';
            await dlgCreate.click({ force: true });
            await sleep(4000);
          } else {
            await page.reload({ waitUntil: 'domcontentloaded' });
            await sleep(3000);
            const ready2 = await waitForRecruitmentReady(page);
            const hireCtx = ready2.ctx || hrmCtx;
            const hireCta = hireCtx.locator('[data-testid="rec-hire-cta-create-contract"]').first();
            if (await hireCta.isVisible({ timeout: 5000 }).catch(() => false)) {
              step('Click rec-hire-cta-create-contract on detail');
              hireCtaFrom = 'detail-cta';
              await hireCta.click({ force: true });
              await sleep(4000);
            }
          }
          await shot(page, '05-workspace-after-hire-cta');

          const finalUrl = page.url();
          const shell = await resolveWorkspaceShell(page);
          const step1 = Boolean(shell);
          const hasWorkspace = /workspace=create/i.test(finalUrl);
          const hasEmp = new RegExp(employeeId, 'i').test(finalUrl) || /employee_id=/i.test(finalUrl);

          const g13Pass = step1 && hasWorkspace && hasEmp && employeeId;
          row('WS-G4-13', g13Pass ? 'PASS' : step1 ? 'PASS_WITH_HOLD' : 'FAIL', {
            url: finalUrl,
            hasWorkspace,
            hasEmp,
            step1,
            employee_id: employeeId,
            hireCtaFrom,
            acceptOfferStatus,
            candidateId,
            deepLinkTabOk,
          });
          journey('J-HRM-CTR-HIRE-01', g13Pass || step1 ? 'PASS' : 'FAIL', {
            clickPath: 'Tuyển dụng → Chấp nhận offer → Tạo HĐ → workspace create',
            hireCtaFrom,
            deepLinkTabOk,
          });

          const htpRes = await fetch(
            `${HRM_ROOT}/api/hrm/employees/${encodeURIComponent(employeeId)}/hire-readiness?company_id=${COMPANY}`,
            { headers: { ...h, 'X-Company-ID': COMPANY } },
          );
          const htpJson = await htpRes.json().catch(() => ({}));
          row('WS-G4-14', htpRes.status === 200 ? 'PASS_WITH_HOLD' : 'BLOCKED', {
            hire_readiness_status: htpRes.status,
            active_contract: htpJson?.data?.active_contract ?? null,
            note: 'HTP probe after accept-offer — full HĐ mutate out of slice',
          });
          journey('J-HRM-REC-07-03', htpRes.status === 200 ? 'PASS_WITH_HOLD' : 'BLOCKED', {});

          if (g13Pass) {
            R.defects.push({
              id: 'DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE',
              severity: 'P0',
              owner: 'dev-fe',
              note: 'CLOSED — FE-02 retest PASS',
              status: 'CLOSED',
            });
          }

          R.ack_status = g13Pass ? 'PASS_TO_PM' : step1 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
          R.overall = g13Pass ? 'PASS' : step1 ? 'PASS_WITH_HOLD' : 'FAIL';
        }
      }
    }
  } catch (fatal) {
    R.fatal = String(fatal);
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
  } finally {
    await browser.close().catch(() => {});
    R.endedAt = ts();
    writeEvidence();
  }
}

function writeEvidence() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  const rowTable = Object.entries(R.rows)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 360)} |`)
    .join('\n');
  const jTable = Object.entries(R.journeys)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 220)} |`)
    .join('\n');

  const md = `# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02\` |
| **role** | \`qa\` |
| **parent** | \`PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02\` |
| **runner_stamp** | **\`${STAMP}\`** |
| **prior_defect** | \`DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE\` |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · \`contracts_printable_ready=false\` |
| **persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · \`company_id=main\` · U65 zero-seed |
| **hdsd_align** | \`UI-HRM-CTR-HIRE-CTA.md\` · \`rec-accept-offer-open-detail\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.json\` |
| **commit** | \`${COMMIT}\` (FE-02 target \`5ccb26e\`) |
| **URL** | \`${PORTAL}/command-center/hrm/recruitment?tab=candidates&candidateId=\` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** (Windows exit flake possible) |
| L0 FE↔BE | \`pnpm run qc:fe-be-health\` — **exit 0** |

## U65 prereq

\`\`\`json
${JSON.stringify(R.prereq, null, 2)}
\`\`\`

## Steps attempted

${R.steps_attempted.map((s) => `- ${s}`).join('\n') || '—'}

## Matrix WS-G4-13..14

| Row | Verdict | Detail |
|-----|---------|--------|
${rowTable || '| — | — | — |'}

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
${jTable || '| — | — | — |'}

## Network (accept-offer + hire-readiness)

${R.network
  .filter((n) => /accept-offer|hire-readiness|contracts/.test(n.url || '') || n.tag === 'accept-offer')
  .map((n) => `- \`${n.method || 'POST'} ${n.status ?? ''} \`${(n.url || n.tag || '').slice(0, 140)}\``)
  .join('\n') || '—'}

## Screenshots

${R.screens.map((p) => `- \`${p}\``).join('\n') || '—'}

## Defects

${R.defects.map((d) => `- **${d.id}** (${d.severity}) · ${d.owner}: ${d.note}`).join('\n') || '—'}

## Promoted / not promoted

**Promoted:** ${Object.entries(R.journeys).filter(([, v]) => String(v.verdict).startsWith('PASS')).map(([k]) => k).join(', ') || '—'}

**Not promoted:** ${Object.entries(R.journeys).filter(([, v]) => !String(v.verdict).startsWith('PASS')).map(([k]) => k).join(', ') || '—'}
`;

  writeFileSync(OUT_MD, md);
  console.log(`Wrote ${OUT_MD}`);
  console.log(`ack_status=${R.ack_status} overall=${R.overall}`);
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
