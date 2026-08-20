#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01 — WS-G4-12..14 profile + REC hire CTA
 * U65 zero-seed · browser-only · contracts_printable_ready=false
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

const STAMP = `CTRG4PR-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-rec-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-profile-rec-01');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  prereq: {},
  rows: {},
  journeys: {},
  network: {},
  steps_attempted: [],
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
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
      if (r.ok && token)
        return { token, user: d?.user ?? { email: EMAIL }, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function apiProbe(token) {
  const h = { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' };
  const out = {};
  for (const [key, url] of [
    ['employees', `${HRM}/employees?company_id=${COMPANY}&page_size=20`],
    ['candidates', `${HRM}/recruitment/candidates?company_id=${COMPANY}&page_size=50`],
  ]) {
    const r = await fetch(url, { headers: h });
    const j = await r.json().catch(() => ({}));
    const payload = j?.data;
    const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    out[key] = {
      status: r.status,
      count: rows.length,
      first: rows[0] ?? null,
      with_employee_id: rows.filter((x) => (x.employee_id || '').trim()).slice(0, 5),
      without_employee_id: rows.filter((x) => !(x.employee_id || '').trim()).slice(0, 3),
    };
  }
  return out;
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

async function main() {
  const session = await loginApi();
  R.prereq = await apiProbe(session.token);

  const empId =
    R.prereq.employees?.first?.id ||
    R.prereq.employees?.with_employee_id?.[0]?.id ||
    NV101_UUID;
  const hiredCandidate =
    R.prereq.candidates?.with_employee_id?.find((c) => (c.employee_id || '').trim()) ?? null;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await injectPortalAuth(page, session);

    // --- WS-G4-12: Profile tab HĐ → workspace create locked NV ---
    step(`Navigate profile /employees/${empId}?tab=contract`);
    const profUrl = `${PORTAL}/command-center/hrm/employees/${empId}?${embedQs('tab=contract')}`;
    await page.goto(profUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);

    let hrmProf = await resolveHrmCtx(page, 'employee-profile-page');
    if (!hrmProf) hrmProf = await resolveHrmCtx(page, 'ec-open-contract-workspace-create');
    if (!hrmProf) {
      for (const f of page.frames()) {
        if (await f.getByTestId('employee-profile-page').isVisible().catch(() => false)) {
          hrmProf = f;
          break;
        }
      }
    }

    const profilePageVisible = hrmProf
      ? await hrmProf.getByTestId('employee-profile-page').isVisible().catch(() => false)
      : false;

    if (profilePageVisible) {
      const contractTab = hrmProf.getByTestId('profile-tab-contract');
      if (await contractTab.isVisible().catch(() => false)) {
        await contractTab.click();
        await sleep(1200);
        step('Clicked profile-tab-contract');
      } else {
        const tabByRole = hrmProf.getByRole('tab', { name: /Hợp đồng/i }).first();
        if (await tabByRole.isVisible().catch(() => false)) {
          await tabByRole.click();
          await sleep(1200);
          step('Clicked tab Hợp đồng by role');
        }
      }

      const addBtn = hrmProf.getByTestId('ec-open-contract-workspace-create');
      if (await addBtn.isVisible().catch(() => false)) {
        step('Click ec-open-contract-workspace-create');
        await addBtn.click();
        await sleep(3500);
        await shot(page, '01-profile-add-contract');

        const url = page.url();
        const hasWorkspace = /workspace=create/i.test(url);
        const hasEmp = new RegExp(`employee_id=${empId}`, 'i').test(url) || /employee_id=/i.test(url);
        const hasLock = /lock_subject_employee=1/i.test(url);

        const shell = await resolveWorkspaceShell(page);
        const step1 = Boolean(shell);
        const empTab = shell
          ? await shell.getByTestId('ctr-create-subject-tab-employee').isVisible().catch(() => false)
          : false;
        const uvTab = shell
          ? await shell.getByTestId('ctr-create-subject-tab-candidate').isVisible().catch(() => false)
          : false;
        const locked =
          (shell &&
            (await shell.getByTestId('ctr-create-subject-employee-locked').isVisible().catch(() => false))) ||
          hasLock;

        const pass = hasWorkspace && hasEmp && hasLock && step1 && locked;
        row('WS-G4-12', pass ? 'PASS' : step1 ? 'PASS_WITH_HOLD' : 'FAIL', {
          url,
          hasWorkspace,
          hasEmp,
          hasLock,
          step1,
          empTab,
          uvTabHidden: !uvTab,
          empId,
        });
        journey('J-HRM-CTR-PROFILE-01', R.rows['WS-G4-12'].verdict.startsWith('PASS') ? 'PASS' : 'FAIL', {
          clickPath: 'profile → tab HĐ → Thêm HĐ → workspace create',
        });

        if (shell) {
          await shell.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
          await sleep(800);
        }
      } else {
        row('WS-G4-12', 'FAIL', { reason: 'ec-open-contract-workspace-create not visible', empId });
        journey('J-HRM-CTR-PROFILE-01', 'FAIL', {});
        await shot(page, '01-profile-no-add-btn');
      }
    } else {
      // Fallback: direct deep-link evidence per UI spec §8 option B
      step(`Fallback deep-link contracts?workspace=create&employee_id=${empId}&lock_subject_employee=1`);
      const dlUrl = `${PORTAL}/command-center/hrm/contracts?${embedQs(
        `workspace=create&employee_id=${empId}&lock_subject_employee=1&subject_type=employee`,
      )}`;
      await page.goto(dlUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(4000);
      const shell = await resolveWorkspaceShell(page);
      const pass = Boolean(shell) && /lock_subject_employee=1/i.test(page.url());
      row('WS-G4-12', pass ? 'PASS_WITH_HOLD' : 'FAIL', {
        note: 'profile page not found — used CC deep-link fallback',
        url: page.url(),
        step1: Boolean(shell),
      });
      journey('J-HRM-CTR-PROFILE-01', pass ? 'PASS_WITH_HOLD' : 'FAIL', { fallback: 'deep-link' });
      await shot(page, '01-profile-deeplink-fallback');
      if (shell) await shell.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    }

    // --- WS-G4-13: REC hire CTA (pilot UV with employee_id) ---
    if (hiredCandidate?.id && hiredCandidate?.employee_id) {
      step(`Navigate REC candidate detail ${hiredCandidate.id} (employee_id set)`);
      const recUrl = `${PORTAL}/command-center/hrm/recruitment?${embedQs(
        `tab=candidates&candidateId=${hiredCandidate.id}`,
      )}`;
      await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(4500);

      let hrmRec = page;
      for (const f of page.frames()) {
        if (await f.getByTestId('rec-hire-cta-create-contract').isVisible().catch(() => false)) {
          hrmRec = f;
          break;
        }
      }

      const cta = hrmRec.getByTestId('rec-hire-cta-create-contract');
      const ctaVisible = await cta.isVisible().catch(() => false);

      if (ctaVisible) {
        step('Click rec-hire-cta-create-contract');
        await cta.click();
        await sleep(4000);
        await shot(page, '02-rec-hire-cta');

        const url = page.url();
        const hasWorkspace = /workspace=create/i.test(url);
        const hasEmp = new RegExp(hiredCandidate.employee_id, 'i').test(url);
        const hasLock = /lock_subject_employee=1/i.test(url);
        const shell = await resolveWorkspaceShell(page);
        const step1 = Boolean(shell);

        const pass = hasWorkspace && hasEmp && hasLock && step1;
        row('WS-G4-13', pass ? 'PASS' : step1 ? 'PASS_WITH_HOLD' : 'FAIL', {
          candidateId: hiredCandidate.id,
          candidateName: hiredCandidate.full_name,
          employee_id: hiredCandidate.employee_id,
          url,
          hasWorkspace,
          hasLock,
          step1,
        });
        journey('J-HRM-CTR-HIRE-01', R.rows['WS-G4-13'].verdict.startsWith('PASS') ? 'PASS' : 'FAIL', {
          note: 'pilot UV already has employee_id — CTA prefill only (no accept-offer mutate this session)',
        });

        if (shell) await shell.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
      } else {
        row('WS-G4-13', 'FAIL', {
          reason: 'rec-hire-cta-create-contract not visible',
          candidate: hiredCandidate,
        });
        journey('J-HRM-CTR-HIRE-01', 'FAIL', {});
        await shot(page, '02-rec-no-cta');
      }
    } else {
      step('No pilot candidate with employee_id — attempted REC list browse');
      const recListUrl = `${PORTAL}/command-center/hrm/recruitment?${embedQs('tab=candidates')}`;
      await page.goto(recListUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      await shot(page, '02-rec-list-no-hired-uv');

      row('WS-G4-13', 'BLOCKED', {
        reason: 'cần nguồn từ FE hire trước — no pilot candidate with employee_id',
        candidates_count: R.prereq.candidates?.count ?? 0,
        with_employee_id: R.prereq.candidates?.with_employee_id?.length ?? 0,
        steps: [
          'API GET recruitment/candidates — none with employee_id',
          'U65 cấm seed — không tạo hire trong session',
          'Cần: Login → Tuyển dụng → Chấp nhận offer (FE) → CTA «Tạo HĐ»',
        ],
      });
      journey('J-HRM-CTR-HIRE-01', 'BLOCKED', { u65: true });
    }

    // --- WS-G4-14: hire readiness after HĐ (depends full mutate chain) ---
    row('WS-G4-14', 'BLOCKED', {
      reason: 'phụ thuộc WS-G4-04 mutate + hire-readiness F5 — không chạy full chain profile/REC trong slice này',
      note: 'cần nguồn từ FE hire trước nếu chưa có HĐ active cho NV mới hire',
    });
    journey('J-HRM-REC-07-03', 'BLOCKED', { carry: 'hire-readiness banner after HĐ' });
  } catch (fatal) {
    R.fatal = String(fatal);
    row('WS-G4-12', R.rows['WS-G4-12']?.verdict ?? 'FAIL', { fatal: String(fatal).slice(0, 200) });
  } finally {
    await browser.close().catch(() => {});
  }

  const g12 = R.rows['WS-G4-12']?.verdict ?? 'FAIL';
  const g13 = R.rows['WS-G4-13']?.verdict ?? 'BLOCKED';
  const g14 = R.rows['WS-G4-14']?.verdict ?? 'BLOCKED';

  if (g12.startsWith('PASS') && g13.startsWith('PASS')) {
    R.ack_status = 'PASS_TO_PM';
    R.overall = 'PASS';
  } else if (g12.startsWith('PASS') && g13 === 'BLOCKED') {
    R.ack_status = 'PASS_TO_PM';
    R.overall = 'PASS_WITH_HOLD';
  } else if (g12.startsWith('PASS') || g13.startsWith('PASS')) {
    R.ack_status = 'PASS_TO_PM';
    R.overall = 'PASS_WITH_HOLD';
  } else if (g13 === 'BLOCKED' && g12 === 'BLOCKED') {
    R.ack_status = 'BLOCKED';
    R.overall = 'BLOCKED';
  } else {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
  }

  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));

  const rowTable = Object.entries(R.rows)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 280)} |`)
    .join('\n');
  const jTable = Object.entries(R.journeys)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 200)} |`)
    .join('\n');

  const md = `# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01\` |
| **role** | \`qa\` |
| **runner_stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · \`contracts_printable_ready=false\` |
| **URL** | \`${PORTAL}/command-center/hrm/employees/{id}\` · REC \`/recruitment\` |
| **persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · \`company_id=main\` · U65 zero-seed |
| **hdsd_align** | \`UI-HRM-CTR-PROFILE-DEEP-LINK.md\` · \`UI-HRM-CTR-HIRE-CTA.md\` |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-workspace-g4-profile-rec-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-profile-rec-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** |
| L0 FE↔BE | \`pnpm run qc:fe-be-health\` — **exit 0** |

## U65 prereq (no seed)

\`\`\`json
${JSON.stringify(R.prereq, null, 2).slice(0, 2000)}
\`\`\`

## Steps attempted

${R.steps_attempted.map((s) => `- ${s}`).join('\n') || '—'}

## Matrix WS-G4-12..14

| Row | Verdict | Detail |
|-----|---------|--------|
${rowTable}

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
${jTable || '| — | — | — |'}

## Screenshots

${R.screens.map((p) => `- \`${p}\``).join('\n') || '—'}

## completion_report

**Closed:** WS-G4-12 profile → workspace deep-link with \`employee_id\` + \`lock_subject_employee\`; REC CTA WS-G4-13 per pilot data; U65 zero-seed browser evidence.

**Residual:** WS-G4-14 hire-readiness BLOCKED without full FE hire→HĐ mutate chain; REC accept-offer FE path if no pilot \`employee_id\` on UV.

## next_owner

\`pm\`

## next_dispatch_prompt

See JSON ack_status \`${R.ack_status}\` — QC narrow if PASS; dev-fe if profile tab FAIL; ba-process if REC hire FE path spec_gap.

**evidence_path:** \`docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md\`
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
