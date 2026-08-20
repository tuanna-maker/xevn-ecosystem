#!/usr/bin/env node
/**
 * PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QA-01 — BR-CTR-CREATE-08 banner U65
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

const STAMP = `CTRG4BR08-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_EMP = `QG4B8${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `BR-CTR-CREATE-08 banner ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ctr-g4-br-ctr-create-08-banner-qa-01');
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
  work_item_id: 'PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  rows: {},
  journeys: {},
  banner: {},
  network: { employee_post: null },
  consoleErrors: [],
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
function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
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

async function apiHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'X-Tenant-ID': TENANT,
    'X-Company-ID': COMPANY,
  };
}

async function fetchNv101CandidateId(token) {
  const r = await fetch(`${HRM}/employees/${NV101_UUID}?company_id=${COMPANY}`, {
    headers: await apiHeaders(token),
  });
  if (!r.ok) return { ok: false, status: r.status, candidate_id: null };
  const j = await r.json();
  const data = j?.data ?? j;
  return { ok: true, status: r.status, candidate_id: data?.candidate_id ?? null, employee_code: data?.employee_code };
}

async function findEmployeeWithCandidateId(token) {
  const r = await fetch(`${HRM}/employees?page_size=100&company_id=${COMPANY}`, {
    headers: await apiHeaders(token),
  });
  if (!r.ok) return null;
  const j = await r.json();
  const items = j?.data?.items ?? j?.items ?? (Array.isArray(j?.data) ? j.data : []);
  if (!Array.isArray(items)) return null;
  const hit = items.find((e) => e?.candidate_id && String(e.candidate_id).trim());
  if (!hit) return null;
  return {
    id: hit.id,
    employee_code: hit.employee_code ?? hit.code,
    full_name: hit.full_name ?? hit.display_name,
    candidate_id: hit.candidate_id,
  };
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

async function resolveHrmFrame(page, timeoutMs = 120000) {
  const start = Date.now();
  let reloadAttempted = false;
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      if (await f.locator('[data-testid="hdsd-contracts-create-btn"]').first().isVisible().catch(() => false))
        return f;
    }
    if (await page.getByTestId('hdsd-contracts-create-btn').isVisible().catch(() => false)) return page;
    if (!reloadAttempted && Date.now() - start > 25000) {
      reloadAttempted = true;
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(5000);
    }
    await sleep(500);
  }
  return null;
}

async function resolveShell(page, hrmCtx) {
  for (const ctx of [page, hrmCtx, ...page.frames()]) {
    if (!ctx) continue;
    if (await ctx.locator('[data-testid="ctr-create-step-1"]').first().isVisible().catch(() => false)) return ctx;
  }
  return null;
}

async function pickTemplate(shell, searchText) {
  const combobox = shell.getByTestId('ctr-create-template-combobox');
  await combobox.click();
  await sleep(300);
  const input = combobox.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(searchText);
    await sleep(500);
  }
  await shell.getByRole('option', { name: new RegExp(searchText, 'i') }).first().click({ timeout: 20000 });
}

async function pickEmployee(shell, page, query, labelRe) {
  const picker = shell.getByTestId('hdsd-contracts-form-employee');
  await picker.click();
  await sleep(400);
  const inlineSearch = picker.locator('input').first();
  if (await inlineSearch.isVisible().catch(() => false)) {
    await inlineSearch.fill(query);
    await sleep(800);
  }
  for (const ctx of [shell, page, ...page.frames()]) {
    const opt = ctx.getByRole('option', { name: labelRe }).first();
    if (await opt.isVisible({ timeout: 10000 }).catch(() => false)) {
      const label = (await opt.innerText().catch(() => '')).trim();
      await opt.click();
      return { picked: true, label };
    }
  }
  return { picked: false, label: '' };
}

async function fillSigningDate(shell) {
  const btn = shell.getByTestId('ctr-create-signing-date');
  await btn.click();
  await sleep(300);
  const day = shell.getByRole('gridcell', { name: /^15$/ }).first();
  if (await day.isVisible().catch(() => false)) {
    await day.click();
    return true;
  }
  return false;
}

async function fillWorkArrangement(shell) {
  await shell.getByTestId('ctr-create-work-arrangement').click();
  await sleep(200);
  await shell.getByRole('option').first().click({ timeout: 10000 });
}

async function readBannerState(shell) {
  const hint = await shell.getByTestId('ctr-create-employee-rec-hint').isVisible().catch(() => false);
  const link = await shell.getByTestId('ctr-create-employee-rec-link').isVisible().catch(() => false);
  let linkText = '';
  let linkHref = '';
  if (link) {
    linkText = (await shell.getByTestId('ctr-create-employee-rec-link').innerText().catch(() => '')).trim();
    linkHref = (await shell.getByTestId('ctr-create-employee-rec-link').getAttribute('href').catch(() => '')) || '';
  }
  const nextEnabled = await shell.getByTestId('ctr-create-next-btn').isEnabled().catch(() => false);
  return { hint, link, linkText, linkHref, nextEnabled };
}

function wireNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    const method = res.request().method();
    if (url.includes('/contracts-insurance/contracts') && method === 'POST' && !url.includes('/preview')) {
      let body = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        body = null;
      }
      const snap = {
        status: res.status(),
        employee_id: body?.employee_id,
        subject_type: body?.subject_type,
        start_date: body?.start_date,
      };
      try {
        const j = await res.json();
        snap.code = j?.code ?? j?.error?.code;
        snap.message = j?.message ?? j?.error?.message;
      } catch {
        /* */
      }
      if (body?.employee_id) R.network.employee_post = snap;
    }
  });
}

async function openCreateWizard(page, hrmCtx) {
  await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
  await sleep(1500);
  const shell = await resolveShell(page, hrmCtx);
  if (!shell) throw new Error('workspace shell not visible');
  await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 });
  await shell.getByTestId('ctr-create-subject-tab-employee').click().catch(() => {});
  await sleep(400);
  return shell;
}

async function fillStep1Basics(shell) {
  await shell.getByTestId('ctr-create-contract-code').fill(CODE_EMP);
  let catalogOk = false;
  for (const t of ['XEVN_FT', 'DRIVER', 'XEVN']) {
    try {
      await pickTemplate(shell, t);
      catalogOk = true;
      break;
    } catch {
      /* */
    }
  }
  if (!catalogOk) throw new Error('template pick failed');
  await fillSigningDate(shell);
  await fillWorkArrangement(shell);
  await shell.getByTestId('ctr-create-salary-ratio').fill('100');
  await shell.getByTestId('ctr-create-abstract').fill(ABSTRACT);
  return catalogOk;
}

async function main() {
  const session = await loginApi();
  const nv101Api = await fetchNv101CandidateId(session.token);
  const withCand = await findEmployeeWithCandidateId(session.token);
  R.prereq = { nv101Api, withCandEmployee: withCand };

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

  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed frame not found');

    const shell = await openCreateWizard(page, hrmCtx);
    await fillStep1Basics(shell);

    const empPick = await pickEmployee(shell, page, 'NV101', /NV101|Le Van C/i);
    await sleep(600);
    const bannerNv101 = await readBannerState(shell);
    R.banner.nv101 = bannerNv101;

    const bannerOk =
      bannerNv101.hint &&
      bannerNv101.link &&
      /Mở tuyển dụng/i.test(bannerNv101.linkText) &&
      /recruitment/i.test(bannerNv101.linkHref);
    row('BR-CTR-CREATE-08-banner', bannerOk ? 'PASS' : 'FAIL', {
      empPick,
      bannerNv101,
      nv101_candidate_id: nv101Api.candidate_id,
    });
    await shot(page, '01-nv101-banner');

    const nextBtn = shell.getByTestId('ctr-create-next-btn');
    const postWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview'),
      { timeout: 90000 },
    );
    await nextBtn.click({ timeout: 15000 });
    await postWait.catch(() => null);
    await sleep(2000);

    const step2Open = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 30000 }).catch(() => false);
    const postStatus = R.network.employee_post?.status ?? 0;
    const postOk = postStatus >= 200 && postStatus < 300;
    const notBlockedByBanner = bannerNv101.nextEnabled && postOk;

    row('BR-CTR-CREATE-08-post-not-blocked', notBlockedByBanner && step2Open ? 'PASS' : 'FAIL', {
      post: R.network.employee_post,
      step2Open,
      nextWasEnabled: bannerNv101.nextEnabled,
    });
    journey('J-HRM-CTR-CREATE-01', step2Open && postOk ? 'PASS' : 'FAIL', {
      step2Open,
      post: R.network.employee_post,
      bannerPresent: bannerNv101.hint,
    });
    await shot(page, '02-after-tiep-step2');

    await shell.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    await sleep(1200);

    if (withCand?.employee_code || withCand?.full_name) {
      const shell2 = await openCreateWizard(page, hrmCtx);
      await fillStep1Basics(shell2);
      const q = withCand.employee_code || withCand.full_name?.split(' ')[0] || '';
      const labelRe = new RegExp(withCand.employee_code || withCand.full_name || '.', 'i');
      const candPick = await pickEmployee(shell2, page, q, labelRe);
      await sleep(600);
      const bannerWithCand = await readBannerState(shell2);
      R.banner.withCandidate = { pick: candPick, ...bannerWithCand, candidate_id: withCand.candidate_id };
      const absent = !bannerWithCand.hint && !bannerWithCand.link;
      row('BR-CTR-CREATE-08-banner-absent-with-candidate', candPick.picked && absent ? 'PASS' : 'FAIL', R.banner.withCandidate);
      await shot(page, '03-nv-with-candidate-no-banner');
      await shell2.getByTestId('ctr-create-cancel-btn').click().catch(() => {});
    } else {
      row('BR-CTR-CREATE-08-banner-absent-with-candidate', 'PASS_WITH_HOLD', {
        reason: 'no pilot employee with candidate_id in scope — API list empty / none found',
        nv101_candidate_id_null: nv101Api.candidate_id == null,
      });
    }

    R.browser = { code: CODE_EMP, banner: R.banner, network: R.network };
  } catch (fatal) {
    R.browser = { fatal: String(fatal) };
    defect('DEF-CTR-G4-BR08-FATAL', 'P0', String(fatal).slice(0, 200));
  } finally {
    await browser.close().catch(() => {});
  }

  const failRows = Object.entries(R.rows).filter(([, v]) => v.verdict === 'FAIL');
  const createFail = R.journeys['J-HRM-CTR-CREATE-01']?.verdict === 'FAIL';
  const hasFatal = R.defects.some((d) => d.id.includes('FATAL'));
  R.ack_status = !hasFatal && failRows.length === 0 && !createFail ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = R.ack_status === 'PASS_TO_PM' ? 'PASS' : 'FAIL';
  R.endedAt = ts();

  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  console.log('ack_status', R.ack_status);
  console.log('rows', JSON.stringify(R.rows, null, 2));
  console.log('banner', JSON.stringify(R.banner, null, 2));
  console.log('network', JSON.stringify(R.network, null, 2));
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2), 'utf8');
  process.exit(1);
});
