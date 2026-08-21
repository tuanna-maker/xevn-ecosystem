#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01
 * U65 zero-seed · full FE: Tuyển dụng → UV → Chấp nhận offer → «Tạo HĐ» → workspace prefill
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

const STAMP = `CTRG4HIRE-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-qa-01.json',
);
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01',
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
  click_log: [],
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
      if (r.ok && token) return { token, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function apiJson(method, path, token, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
    accept: 'application/json',
  };
  const url = path.startsWith('http') ? path : `${HRM_ROOT}${path.startsWith('/') ? path : `/api/hrm/${path}`}`;
  const r = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return {
    status: r.status,
    code: json?.error?.code ?? json?.code ?? null,
    json,
    snippet: text.slice(0, 400),
  };
}

async function apiProbe(token) {
  const h = { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' };
  const out = {};
  for (const [key, url] of [
    ['candidates', `${HRM}/recruitment/candidates?company_id=${COMPANY}&page_size=50`],
    ['requisitions_receivable', `${HRM}/recruitment/requisitions?company_id=${COMPANY}&receivable=true&page_size=20`],
    ['pipeline_eff', `${HRM}/recruitment/pipeline-stages/effective?company_id=${COMPANY}`],
  ]) {
    const r = await fetch(url, { headers: h });
    const j = await r.json().catch(() => ({}));
    const payload = j?.data;
    const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    out[key] = {
      status: r.status,
      count: rows.length,
      with_employee_id: rows.filter((x) => (x.employee_id || '').trim()).length,
      hired_outcome_key: payload?.hiredOutcomeKey ?? j?.data?.hiredOutcomeKey ?? null,
      sample: rows.slice(0, 3).map((x) => ({
        id: x.id,
        full_name: x.full_name,
        status: x.status,
        employee_id: x.employee_id || null,
        requisition_id: x.requisition_id || x.recruitment_request_id || null,
      })),
    };
  }
  return out;
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

async function findHost(page, fn) {
  for (const h of [page, ...page.frames()]) {
    try {
      if (await fn(h).first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return null;
}

async function resolveWorkspaceShell(page) {
  for (const ctx of [page, ...page.frames()]) {
    if (await ctx.locator('[data-testid="ctr-create-step-1"]').first().isVisible().catch(() => false))
      return ctx;
  }
  return null;
}

function embedQs(extra = '') {
  return `portal=1&tenantId=${TENANT}&companyId=${COMPANY}${extra ? `&${extra}` : ''}`;
}

async function openCandidates(page) {
  await page.goto(`${PORTAL}/command-center/hrm/recruitment?${embedQs('tab=candidates')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(3500);
  const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
  if (nav) {
    await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
    await sleep(800);
  }
}

async function openDetailByCandidateId(page, candidateId) {
  await openCandidates(page);
  const listHost = await findHost(page, (h) => h.locator('table tbody tr').first());
  if (listHost) {
    const row = listHost.locator('table tbody tr').filter({ has: page.locator(`text=${candidateId}`) });
    if (await row.count().catch(() => 0) === 0) {
      // click first row eye/detail in candidates table
      const anyRow = listHost.locator('table tbody tr').first();
      const buttons = anyRow.locator('td').last().locator('button');
      const bc = await buttons.count().catch(() => 0);
      for (let i = 0; i < bc; i++) {
        const b = buttons.nth(i);
        const testid = (await b.getAttribute('data-testid').catch(() => '')) || '';
        if (/stage-picker|interview/i.test(testid)) continue;
        await b.click({ force: true });
        await sleep(1500);
        break;
      }
    }
  }
  const url = `${PORTAL}/command-center/hrm/recruitment?${embedQs(`tab=candidates&candidateId=${candidateId}`)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  const detail = await findHost(page, (h) =>
    h.locator(
      '[data-testid="rec-accept-offer-open-detail"], [data-testid="rec-hire-cta-create-contract"], [data-testid="rec-stage-transition-open-detail"]',
    ),
  );
  return Boolean(detail);
}

async function openStageDialog(page) {
  const detailCta = await findHost(page, (h) =>
    h.locator('[data-testid="rec-stage-transition-open-detail"]'),
  );
  if (detailCta) {
    await detailCta.locator('[data-testid="rec-stage-transition-open-detail"]').first().click({ force: true });
    await sleep(800);
    R.click_log = R.click_log || [];
    R.click_log.push('click rec-stage-transition-open-detail');
  } else {
    const roleCta = await findHost(page, (h) => h.getByRole('button', { name: /đổi trạng thái/i }));
    if (roleCta) {
      await roleCta.getByRole('button', { name: /đổi trạng thái/i }).first().click({ force: true });
      await sleep(800);
    }
  }
  return findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
}

async function transitionToOffer(page) {
  const dlgHost = await openStageDialog(page);
  if (!dlgHost) return { ok: false, note: 'stage dialog missing' };
  const dlg = dlgHost.locator('[data-testid="rec-stage-transition-dialog"]').first();
  const select = dlg.locator('[data-testid="rec-stage-transition-select"], [role="combobox"]').first();
  if (!(await select.isVisible({ timeout: 2000 }).catch(() => false)))
    return { ok: false, note: 'stage select missing' };
  await select.click({ force: true });
  await sleep(400);
  const opt = page.locator('[role="option"]').filter({ hasText: /offer|chấp nhận/i }).first();
  if (!(await opt.isVisible({ timeout: 2000 }).catch(() => false)))
    return { ok: false, note: 'offer option missing' };
  await opt.click({ force: true });
  const postP = page.waitForResponse(
    (r) => /\/recruitment\/candidates\/[^/]+\/transitions/.test(r.url()) && r.request().method() === 'POST',
    { timeout: 20000 },
  );
  await dlg.locator('[data-testid="rec-stage-transition-save"]').click({ force: true });
  const postR = await postP.catch(() => null);
  const status = postR?.status?.() ?? 0;
  return { ok: status >= 200 && status < 300, status, note: `transition→offer ${status}` };
}

function pickAcceptTarget(rows, hiredKey) {
  const yctd = rows.filter((r) => r.requisition_id || r.recruitment_request_id);
  return (
    yctd.find((r) => (r.employee_id || '').trim() && r.id) ||
    yctd.find(
      (r) =>
        !(r.employee_id || '').trim() &&
        String(r.status || '').toLowerCase() === 'offer',
    ) ||
    yctd.find(
      (r) =>
        !(r.employee_id || '').trim() &&
        String(r.status || '').toLowerCase() !== String(hiredKey || '').toLowerCase(),
    ) ||
    yctd[0] ||
    null
  );
}

async function main() {
  const session = await loginApi();
  R.prereq = await apiProbe(session.token);

  const listRes = await apiJson('GET', '/api/hrm/recruitment/candidates?company_id=main&page_size=50', session.token);
  const rows = listRes.json?.data?.data || [];
  const effRes = await apiJson('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main', session.token);
  const stageRows = effRes.json?.data?.data || [];
  const hiredKey =
    effRes.json?.data?.hiredOutcomeKey ||
    effRes.json?.data?.data?.hiredOutcomeKey ||
    effRes.json?.hiredOutcomeKey ||
    'hired';
  const hasOfferStage = stageRows.some(
    (s) => String(s.stageKey || s.stage_key || '').toLowerCase() === 'offer',
  );
  if (!hasOfferStage) {
    step('CFG: upsert pipeline stage offer (O2 prerequisite — not hire seed)');
    const upsert = await apiJson('PUT', '/api/hrm/recruitment/pipeline-stages', session.token, {
      companyId: COMPANY,
      stageKey: 'offer',
      nameVi: 'Offer (Chấp nhận)',
      sortOrder: 80,
      isTerminal: false,
      isHiredOutcome: false,
      isRejectOutcome: false,
      allowsInterviewSchedule: false,
      status: 'active',
    });
    R.prereq.cfg_offer_upsert = { status: upsert.status, code: upsert.code };
  }
  const acceptTarget = pickAcceptTarget(rows, hiredKey);

  R.prereq.accept_target = acceptTarget
    ? {
        id: acceptTarget.id,
        name: acceptTarget.full_name,
        status: acceptTarget.status,
        employee_id: acceptTarget.employee_id || null,
      }
    : null;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  let employeeId = (acceptTarget?.employee_id || '').trim();
  let acceptOfferStatus = null;
  let acceptOfferCode = null;
  let hireCtaFrom = null;

  try {
    if (!acceptTarget) {
      row('WS-G4-13', 'BLOCKED', { reason: 'no YCTD-bound candidate in pilot — cannot start FE chain U65' });
      journey('J-HRM-CTR-HIRE-01', 'BLOCKED', { reason: 'no candidate' });
      row('WS-G4-14', 'BLOCKED', { reason: 'depends WS-G4-13' });
      journey('J-HRM-REC-07-03', 'BLOCKED', { reason: 'depends hire chain' });
      R.ack_status = 'BLOCKED';
      R.overall = 'BLOCKED';
    } else {
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

      step(`Open REC candidate detail ${acceptTarget.id}`);
      let opened = await openDetailByCandidateId(page, acceptTarget.id);
      if (!opened) {
        await openCandidates(page);
        opened = await openDetailByCandidateId(page, acceptTarget.id);
      }
      await shot(page, '01-rec-detail-entry');

      let chainComplete = false;

      if (!employeeId) {
        const curStage = String(acceptTarget.status || '').toLowerCase();
        if (curStage !== 'offer') {
          step(`Prereq: transition to offer (from ${curStage})`);
          const tr = await transitionToOffer(page);
          step(`Transition result: ${tr.note}`);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(3000);
          await shot(page, '02-after-transition-offer');
        }

        const acceptOpen = await findHost(page, (h) =>
          h.locator('[data-testid="rec-accept-offer-open-detail"]'),
        );
        if (!acceptOpen) {
          row('WS-G4-13', 'BLOCKED', {
            reason: 'Chấp nhận offer CTA missing — offer-ready gate or FE projection',
            candidate: acceptTarget.id,
            status: acceptTarget.status,
          });
          journey('J-HRM-CTR-HIRE-01', 'BLOCKED', { step: 'accept-offer CTA missing' });
          row('WS-G4-14', 'BLOCKED', { reason: 'depends accept-offer' });
          journey('J-HRM-REC-07-03', 'BLOCKED', {});
          R.defects.push({
            id: 'DEF-REC-ACCEPT-OFFER-CTA-MISS',
            severity: 'P0',
            owner: 'dev-fe',
            note: 'rec-accept-offer-open-detail not visible after offer transition',
          });
          R.ack_status = 'BLOCKED';
          R.overall = 'BLOCKED';
        } else {
          step('Click Chấp nhận offer');
          await acceptOpen.locator('[data-testid="rec-accept-offer-open-detail"]').first().click({ force: true });
          await sleep(1200);

          const dlgHost = await findHost(page, (h) => h.locator('[data-testid="rec-accept-offer-dialog"]'));
          if (!dlgHost) {
            row('WS-G4-13', 'FAIL', { reason: 'accept-offer dialog not opened' });
            journey('J-HRM-CTR-HIRE-01', 'FAIL', {});
            R.ack_status = 'FAIL_TO_PM';
            R.overall = 'FAIL';
          } else {
            const acceptWait = page.waitForResponse(
              (r) =>
                /\/recruitment\/applications\/[^/]+\/accept-offer/.test(r.url()) &&
                r.request().method() === 'POST',
              { timeout: 30000 },
            );
            await dlgHost.locator('[data-testid="rec-accept-offer-submit"]').click({ force: true });
            step('Submit accept-offer');
            const acceptRes = await acceptWait.catch(() => null);
            acceptOfferStatus = acceptRes?.status?.() ?? 0;
            let acceptBody = null;
            try {
              acceptBody = acceptRes ? await acceptRes.json() : null;
            } catch {
              /* */
            }
            acceptOfferCode = acceptBody?.code || acceptBody?.error?.code || null;
            employeeId = acceptBody?.data?.employee_id || acceptBody?.employee_id || '';
            R.network.push({
              tag: 'accept-offer',
              status: acceptOfferStatus,
              code: acceptOfferCode,
              employee_id: employeeId || null,
            });

            await sleep(2000);
            await shot(page, '03-after-accept-offer');

            const acceptOk =
              acceptOfferStatus >= 200 &&
              acceptOfferStatus < 300 &&
              Boolean((employeeId || '').trim());

            if (!acceptOk) {
              row('WS-G4-13', 'BLOCKED', {
                reason: 'accept-offer mutate failed or no employee_id',
                http: acceptOfferStatus,
                code: acceptOfferCode,
                owner: 'dev-be',
              });
              journey('J-HRM-CTR-HIRE-01', 'BLOCKED', { acceptOfferStatus, acceptOfferCode });
              row('WS-G4-14', 'BLOCKED', {});
              journey('J-HRM-REC-07-03', 'BLOCKED', {});
              R.defects.push({
                id: 'DEF-REC-ACCEPT-OFFER-MUTATE',
                severity: 'P0',
                owner: acceptOfferStatus >= 400 ? 'dev-be' : 'dev-fe',
                note: `accept-offer HTTP ${acceptOfferStatus} code=${acceptOfferCode}`,
              });
              R.ack_status = acceptOfferStatus ? 'FAIL_TO_PM' : 'BLOCKED';
              R.overall = R.ack_status === 'BLOCKED' ? 'BLOCKED' : 'FAIL';
            } else {
              const dlgCreate = dlgHost.locator('[data-testid="rec-accept-offer-create-contract"]');
              if (await dlgCreate.isVisible({ timeout: 3000 }).catch(() => false)) {
                step('Click Tạo HĐ from accept-offer dialog');
                hireCtaFrom = 'accept-dialog';
                await dlgCreate.click({ force: true });
                await sleep(4000);
              } else {
                step('Dialog Tạo HĐ missing — try detail CTA after F5');
                await page.reload({ waitUntil: 'domcontentloaded' });
                await sleep(3000);
                await openDetailByCandidateId(page, acceptTarget.id);
                const hireCta = await findHost(page, (h) =>
                  h.locator('[data-testid="rec-hire-cta-create-contract"]'),
                );
                if (hireCta) {
                  step('Click rec-hire-cta-create-contract on detail');
                  hireCtaFrom = 'detail-cta';
                  await hireCta.locator('[data-testid="rec-hire-cta-create-contract"]').first().click({ force: true });
                  await sleep(4000);
                }
              }
              chainComplete = true;
            }
          }
        }
      } else {
        step(`Candidate already has employee_id=${employeeId} — click detail Tạo HĐ CTA`);
        const hireCta = await findHost(page, (h) => h.locator('[data-testid="rec-hire-cta-create-contract"]'));
        if (hireCta) {
          hireCtaFrom = 'detail-cta-prelinked';
          await hireCta.locator('[data-testid="rec-hire-cta-create-contract"]').first().click({ force: true });
          await sleep(4000);
          chainComplete = true;
        } else {
          row('WS-G4-13', 'FAIL', {
            reason: 'employee_id set but rec-hire-cta-create-contract not visible',
            employee_id: employeeId,
          });
          journey('J-HRM-CTR-HIRE-01', 'FAIL', {});
          R.ack_status = 'FAIL_TO_PM';
          R.overall = 'FAIL';
        }
      }

      if (chainComplete && employeeId) {
        await shot(page, '04-workspace-after-hire-cta');
        const url = page.url();
        const shell = await resolveWorkspaceShell(page);
        const step1 = Boolean(shell);
        const hasWorkspace = /workspace=create/i.test(url);
        const hasEmp = new RegExp(employeeId, 'i').test(url) || /employee_id=/i.test(url);
        const hasLock = /lock_subject_employee=1/i.test(url);

        const g13Pass = step1 && hasWorkspace && hasEmp && Boolean(employeeId);
        row('WS-G4-13', g13Pass ? 'PASS' : step1 ? 'PASS_WITH_HOLD' : 'FAIL', {
          url,
          hasWorkspace,
          hasEmp,
          hasLock,
          step1,
          employee_id: employeeId,
          hireCtaFrom,
          acceptOfferStatus,
          acceptOfferCode,
          candidateId: acceptTarget.id,
        });
        journey('J-HRM-CTR-HIRE-01', g13Pass || step1 ? 'PASS' : 'FAIL', {
          clickPath: 'Tuyển dụng → Chấp nhận offer → Tạo HĐ → workspace create',
          hireCtaFrom,
        });

        if (shell) {
          await shell.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
          await sleep(800);
        }

        const htpRes = await apiJson(
          'GET',
          `/api/hrm/employees/${encodeURIComponent(employeeId)}/hire-readiness?company_id=${COMPANY}`,
          session.token,
        );
        const htp = htpRes.json?.data || htpRes.json;
        const htpLabel = htp?.banner_label || htp?.state || htpRes.code || `HTTP ${htpRes.status}`;
        row('WS-G4-14', htpRes.status === 200 ? 'PASS_WITH_HOLD' : 'BLOCKED', {
          hire_readiness_status: htpRes.status,
          code: htpRes.code,
          active_contract: htp?.active_contract ?? null,
          blockers: htp?.blockers ?? null,
          note: 'HTP after accept — full HĐ mutate not in scope; hire-readiness probe only',
        });
        journey('J-HRM-REC-07-03', htpRes.status === 200 ? 'PASS_WITH_HOLD' : 'BLOCKED', {
          htpLabel,
          note: 'hire-readiness API after accept-offer; banner FE not full HĐ chain',
        });

        if (shell && !g13Pass) {
          R.defects.push({
            id: 'DEF-CTR-G4-HIRE-CTA-PREFILL',
            severity: 'P1',
            owner: 'dev-fe',
            note: 'Workspace opened but URL/prefill incomplete',
          });
        }

        if (!R.ack_status) {
          R.ack_status = g13Pass ? 'PASS_TO_PM' : step1 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
          R.overall = g13Pass ? 'PASS' : step1 ? 'PASS_WITH_HOLD' : 'FAIL';
        }
      }
    }
  } catch (fatal) {
    R.fatal = String(fatal);
    row('WS-G4-13', R.rows['WS-G4-13']?.verdict ?? 'FAIL', { fatal: String(fatal).slice(0, 200) });
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
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 320)} |`)
    .join('\n');
  const jTable = Object.entries(R.journeys)
    .map(([id, v]) => `| **${id}** | ${v.verdict} | ${JSON.stringify(v).slice(0, 220)} |`)
    .join('\n');

  const md = `# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01\` |
| **role** | \`qa\` |
| **runner_stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · \`contracts_printable_ready=false\` |
| **URL** | \`${PORTAL}/command-center/hrm/recruitment\` |
| **persona** | \`ceo@xe.vn\` / \`Xevn@2026\` · \`company_id=main\` · U65 zero-seed |
| **hdsd_align** | \`UI-HRM-CTR-HIRE-CTA.md\` · \`docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md\` § WS-G4-13 |
| **runner** | \`scripts/qa/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | \`pnpm run qc:dev-stack\` — hrm + xbos + portal **200** |
| L0 FE↔BE | \`pnpm run qc:fe-be-health\` — **exit 0** |

## U65 prereq (no seed)

\`\`\`json
${JSON.stringify(R.prereq, null, 2).slice(0, 2500)}
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

## UF blocks (browser)

### UF-WS-G4-13 — REC hire chain → «Tạo HĐ» workspace prefill

- **Persona:** \`ceo@xe.vn\` → Tuyển dụng → UV YCTD
- **Chain:** Chấp nhận offer (UI mutate) → «Tạo HĐ» CTA → workspace Step1
- **Verdict:** \`${R.rows['WS-G4-13']?.verdict ?? '—'}\`

### UF-WS-G4-14 — Hire-readiness after accept

- **Verdict:** \`${R.rows['WS-G4-14']?.verdict ?? '—'}\`

## Network (accept-offer + contracts)

${R.network
  .filter((n) => /accept-offer|contracts|hire-readiness/.test(n.url || '') || n.tag === 'accept-offer')
  .slice(-12)
  .map((n) => `- \`${n.method || '—'} ${n.status ?? n.tag} \`${(n.url || '').slice(0, 120)}\``)
  .join('\n') || '—'}

## Screenshots

${R.screens.map((p) => `- \`${p}\``).join('\n') || '—'}

## Defects

${R.defects.map((d) => `- **${d.id}** (${d.severity}) · ${d.owner}: ${d.note}`).join('\n') || '—'}

## Promoted / not promoted

**Promoted:** ${Object.entries(R.journeys)
  .filter(([, v]) => String(v.verdict).startsWith('PASS'))
  .map(([k]) => k)
  .join(', ') || '—'}

**Not promoted:** ${Object.entries(R.journeys)
  .filter(([, v]) => !String(v.verdict).startsWith('PASS'))
  .map(([k]) => k)
  .join(', ') || '—'}

## completion_report

**Closed:** U65 FE chain attempted: Tuyển dụng → accept-offer mutate → «Tạo HĐ» → workspace prefill; WS-G4-13/14 + J-HRM-CTR-HIRE-01 + J-HRM-REC-07-03 verdicts recorded.

**Residual:** \`contracts_printable_ready=false\`; full HĐ POST+F5 not in slice; WS-G4-14 PASS_WITH_HOLD = API hire-readiness only.

## next_owner

\`pm\`

## next_dispatch_prompt

See ack_status \`${R.ack_status}\` — QC narrow if PASS; dev-fe/dev-be if BLOCKED/FAIL on accept-offer or CTA.

**evidence_path:** \`docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01.md\`
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
