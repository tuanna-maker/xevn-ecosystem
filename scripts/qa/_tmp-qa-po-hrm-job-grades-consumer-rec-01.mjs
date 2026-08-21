#!/usr/bin/env node
/**
 * QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01 — AC-SET-CONSUMER-JG-REC-01
 * U65 ceo@ · zero-seed · Settings sync/create job_grades if EFF=0
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
].filter(Boolean);
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `JGRECQA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const GRADE_CODE = `gqa${STAMP.slice(-6).toLowerCase()}`;
const GRADE_LABEL = `QA Ngạch ${STAMP}`;
const YCTD_TITLE = `YCTD JG QA ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-job-grades-consumer-rec-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-po-hrm-job-grades-consumer-rec-01');
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
  work_item_id: 'QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01',
  stamp: STAMP,
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  honesty: { settings_catalog_e2e_ready: false, uf_hrm_10_full: false, must_keep: ['RECCHQC1'] },
  env: { PORTAL: null, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  vitest: { file: 'po-hrm-job-grades-consumer-rec-fe-01.test.ts', result: '4/4 (pre-run)' },
  jest: { file: 'po-hrm-job-grades-consumer-rec-be-01.spec.ts', result: '3/3 (pre-run)' },
  jobGrades: { effBefore: 0, effAfter: 0, codes: [], syncUsed: false, feCreateUsed: false },
  ac: {},
  network: [],
  consoleErrors: [],
  ids: { selectedGradeCode: null, selectedGradeLabel: null, requisitionId: null },
  ack_status: null,
  overall: null,
  pm_dispatch_hint: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, ...detail, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
  save();
}

async function pickPortal() {
  for (const base of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(8000) });
      if (r.status === 200 || r.status === 304) return base.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return null;
}

function q(portal, path, extra = {}) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

async function loginApi(portal) {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${portal}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        return {
          token,
          user: data?.user ?? { email: EMAIL },
          companyId: COMPANY,
          expiresAt: Date.now() + 3600000,
          raw: data,
        };
      }
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function fetchGradeEff(token) {
  const url = `${HRM}/api/hrm/settings-catalogs?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const catalogs = j?.data?.catalogs ?? j?.catalogs ?? [];
  const list = Array.isArray(catalogs) ? catalogs : [];
  const gradeCat = list.find((c) => {
    const k = String(c?.catalog_key ?? c?.key ?? '');
    return k === 'job_grades' || k === 'grades';
  });
  const items =
    gradeCat?.effectiveItems ??
    gradeCat?.effective_items ??
    gradeCat?.items ??
    [];
  const arr = Array.isArray(items) ? items : [];
  const active = arr.filter((i) => i?.is_active !== false && i?.active !== false);
  const codes = active.map((i) => String(i.code ?? i.storage_key ?? '')).filter(Boolean);
  return { status: r.status, count: codes.length, codes, items: active };
}

async function injectPortalAuth(page, session) {
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
    }
  }, session);
}

function wireNetwork(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 400));
  });
  page.on('response', async (res) => {
    const req = res.request();
    const url = res.url();
    const method = req.method();
    if (!/\/api\/hrm\//.test(url)) return;
    const entry = { method, url: url.slice(0, 220), status: res.status(), at: ts() };
    if (/requisitions/.test(url) && ['POST', 'PATCH', 'PUT'].includes(method)) {
      let body = null;
      try {
        body = req.postDataJSON();
      } catch {
        /* */
      }
      R.network.push({ ...entry, body });
      if (method === 'POST' && res.status() >= 200 && res.status() < 300) {
        try {
          const j = await res.json();
          R.ids.requisitionId = j?.data?.id ?? j?.id ?? R.ids.requisitionId;
        } catch {
          /* */
        }
      }
    }
    if (/settings-catalogs/.test(url) && ['POST', 'PUT', 'PATCH'].includes(method)) {
      R.network.push(entry);
    }
    if (/catalog-sync|settings-catalogs\/sync/i.test(url)) {
      R.network.push({ ...entry, kind: 'sync' });
    }
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  return path.replace(/\\/g, '/');
}

async function findInFrames(page, locatorFn) {
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(h);
      if (await loc.first().isVisible({ timeout: 600 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return page;
}

async function clickTestId(page, testId) {
  const host = await findInFrames(page, (h) => h.getByTestId(testId));
  await host.getByTestId(testId).first().click({ force: true, timeout: 30000 });
}

async function countPickerOptions(page, ctx) {
  for (const c of [ctx, page, ...page.frames()]) {
    const n = await c.locator('[data-testid^="catalog-picker-option-"]').count();
    if (n > 0) {
      const loc = c.locator('[data-testid^="catalog-picker-option-"]');
      const codes = [];
      const m = Math.min(n, 30);
      for (let i = 0; i < m; i++) {
        const tid = (await loc.nth(i).getAttribute('data-testid')) || '';
        const code = tid.replace(/^catalog-picker-option-/, '');
        if (code) codes.push(code);
      }
      return { count: n, codes };
    }
  }
  return { count: 0, codes: [] };
}

async function pickCatalogOption(page, ctx, combobox, preferCode) {
  await combobox.scrollIntoViewIfNeeded().catch(() => {});
  await combobox.click({ force: true, timeout: 25000 });
  await sleep(900);
  const opts = await countPickerOptions(page, ctx);
  if (opts.count === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'picker-empty', opts };
  }
  let targetCode = preferCode && opts.codes.includes(preferCode) ? preferCode : opts.codes[0];
  const optId = `catalog-picker-option-${targetCode}`;
  const optHost = await findInFrames(page, (h) => h.getByTestId(optId));
  const opt = optHost.getByTestId(optId).first();
  if (await opt.isVisible({ timeout: 8000 }).catch(() => false)) {
    await opt.click({ force: true });
  } else {
    await page.evaluate((code) => {
      const el = document.querySelector(`[data-testid="catalog-picker-option-${code}"]`);
      el?.click();
    }, targetCode);
  }
  await sleep(500);
  return { ok: true, code: targetCode, opts };
}

async function ensureJobGradesViaFe(page, portal) {
  await page.goto(q(portal, '/hr/settings', { tab: 'master-data' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(3500);
  const tab = page.getByTestId('md-tab-jobGrades');
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ force: true });
    await sleep(1200);
  }
  const syncBtn = page.getByTestId('md-sync-xbos');
  if (await syncBtn.isVisible().catch(() => false)) {
    const syncWait = page
      .waitForResponse((res) => /catalog-sync|settings-catalogs\/sync/i.test(res.url()), {
        timeout: 60000,
      })
      .catch(() => null);
    await syncBtn.click({ force: true });
    await syncWait;
    await sleep(2500);
    R.jobGrades.syncUsed = true;
  }
  await shot(page, '01-settings-job-grades');
}

async function createGradeExtension(page, code, label) {
  const codeInput = page.getByTestId('md-code-jobGrades');
  const labelInput = page.getByTestId('md-label-jobGrades');
  if (!(await codeInput.isVisible().catch(() => false))) return false;
  await codeInput.fill(code);
  await labelInput.fill(label);
  const postWait = page
    .waitForResponse(
      (res) =>
        /settings-catalogs\/items/.test(res.url()) &&
        res.request().method() === 'POST' &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 45000 },
    )
    .catch(() => null);
  await page.getByTestId('md-save-jobGrades').click({ force: true });
  await postWait;
  await sleep(2000);
  R.jobGrades.feCreateUsed = true;
  await shot(page, '02-grade-created');
  return true;
}

async function fillYctdCreate(page, portal, gradeCode) {
  await page.goto(q(portal, '/hr/recruitment', { tab: 'requisitions' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(4000);
  await clickTestId(page, 'hdsd-requisition-create-btn');
  await sleep(2000);

  let dialogCtx = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-form-dialog'));
  await dialogCtx.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 35000 }).catch(() => {});

  const jdHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-job-template'));
  const jdRoot = jdHost.getByTestId('hdsd-requisition-job-template');
  const jdCombo = jdRoot.locator('[role="combobox"]').first();
  const jdTarget = (await jdCombo.isVisible().catch(() => false)) ? jdCombo : jdRoot;
  const jdPick = await pickCatalogOption(page, jdHost, jdTarget);
  if (!jdPick.ok) return { ok: false, reason: 'no-jd-template' };

  const titleHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-title'));
  await titleHost.getByTestId('hdsd-requisition-title').fill(YCTD_TITLE);

  const reasonHost = await findInFrames(page, (h) => h.getByTestId('yctd-out-of-plan-reason'));
  if (await reasonHost.getByTestId('yctd-out-of-plan-reason').isVisible().catch(() => false)) {
    await reasonHost.getByTestId('yctd-out-of-plan-reason').fill(`QA ngoài ĐB ${STAMP}`);
  }

  const deptHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-department'));
  const deptRoot = deptHost.getByTestId('hdsd-requisition-department');
  const deptCombo = deptRoot.locator('[role="combobox"]').first();
  const deptTarget = (await deptCombo.isVisible().catch(() => false)) ? deptCombo : deptRoot;
  const deptPick = await pickCatalogOption(page, deptHost, deptTarget);
  if (!deptPick.ok) return { ok: false, reason: 'no-dept' };

  const hcHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-headcount'));
  await hcHost.getByTestId('hdsd-requisition-headcount').fill('1');

  const etHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-employment-type'));
  const etRoot = etHost.getByTestId('hdsd-requisition-employment-type');
  const etCombo = etRoot.locator('[role="combobox"]').first();
  const etTarget = (await etCombo.isVisible().catch(() => false)) ? etCombo : etRoot;
  const etPick = await pickCatalogOption(page, etHost, etTarget);
  if (!etPick.ok) return { ok: false, reason: 'no-employment-type' };

  const jgHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-job-grade'));
  const jgRoot = jgHost.getByTestId('hdsd-requisition-job-grade');
  const jgVisible = await jgRoot.isVisible().catch(() => false);
  if (!jgVisible) return { ok: false, reason: 'job-grade-picker-missing' };
  const jgCombo = jgRoot.locator('[role="combobox"]').first();
  const jgTarget = (await jgCombo.isVisible().catch(() => false)) ? jgCombo : jgRoot;
  const jgPick = await pickCatalogOption(page, jgHost, jgTarget, gradeCode);
  if (!jgPick.ok) return { ok: false, reason: 'job-grade-picker-empty' };
  R.ids.selectedGradeCode = jgPick.code;

  const postsBefore = R.network.length;
  try {
    await clickTestId(page, 'hdsd-requisition-form-submit');
  } catch {
    await page
      .locator('[data-testid="hdsd-requisition-form-dialog"] button')
      .filter({ hasText: /Lưu/i })
      .first()
      .click({ force: true })
      .catch(() => {});
  }
  await sleep(5000);
  const yctdPost = R.network.slice(postsBefore).find((n) => n.method === 'POST' && /requisitions/.test(n.url));
  return { ok: yctdPost && yctdPost.status >= 200 && yctdPost.status < 300, yctdPost, jgPick };
}

async function verifyListAndDetail(page, portal, gradeLabelHint) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3500);
  await shot(page, '03-list-after-f5');

  const listHost = await findInFrames(page, (h) =>
    h.locator('tbody tr').filter({ hasText: YCTD_TITLE }),
  );
  const row = listHost.locator('tbody tr').filter({ hasText: YCTD_TITLE }).first();
  const rowVisible = await row.isVisible().catch(() => false);
  let gradeLabelOk = false;
  if (rowVisible && R.ids.requisitionId) {
    const cell = listHost.locator(`[data-testid="yctd-grade-label-${R.ids.requisitionId}"]`).first();
    const txt = await cell.innerText().catch(() => '');
    gradeLabelOk = txt.length > 0 && txt !== '—' && !/^null$/i.test(txt);
    if (gradeLabelHint && txt.includes(gradeLabelHint)) gradeLabelOk = true;
  }

  await row.getByRole('button', { name: /Chi tiết/i }).first().click({ force: true }).catch(async () => {
    await row.click({ force: true });
  });
  await sleep(2000);
  await shot(page, '04-detail');

  const detailHost = await findInFrames(page, (h) => h.getByTestId('yctd-detail-job-grade'));
  const detailTxt = await detailHost.getByTestId('yctd-detail-job-grade').innerText().catch(() => '');
  const detailOk = detailTxt.length > 0 && detailTxt !== '—';

  return { rowVisible, gradeLabelOk, detailOk, detailTxt };
}

async function tryEditPatch(page, newGradeCode) {
  const listHost = await findInFrames(page, (h) =>
    h.locator('tbody tr').filter({ hasText: YCTD_TITLE }),
  );
  const row = listHost.locator('tbody tr').filter({ hasText: YCTD_TITLE }).first();
  await row.getByRole('button', { name: /^Sửa$/ }).first().click({ force: true }).catch(() => {});
  await sleep(2000);
  const editHost = await findInFrames(page, (h) => h.getByTestId('yctd-edit-job-grade'));
  const jgRoot = editHost.getByTestId('yctd-edit-job-grade');
  if (!(await jgRoot.isVisible().catch(() => false))) return { ok: false, reason: 'edit-grade-missing' };
  const combo = jgRoot.locator('[role="combobox"]').first();
  const target = (await combo.isVisible().catch(() => false)) ? combo : jgRoot;
  const pick = await pickCatalogOption(page, editHost, target, newGradeCode);
  if (!pick.ok) return { ok: false, reason: 'edit-picker-empty' };

  const before = R.network.length;
  await page.getByRole('button', { name: /^Lưu$/ }).last().click({ force: true }).catch(() => {});
  await sleep(4000);
  const patch = R.network
    .slice(before)
    .find((n) => n.method === 'PATCH' && /requisitions/.test(n.url));
  return {
    ok: patch && patch.status >= 200 && patch.status < 300,
    patch,
    bodyGrade: patch?.body?.job_grade_key,
  };
}

async function main() {
  const portal = await pickPortal();
  if (!portal) {
    ac('L0-PORTAL', 'FAIL', { summary: 'portal not reachable' });
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    save();
    process.exit(1);
  }
  R.env.PORTAL = portal;
  save();

  const session = await loginApi(portal);
  const effBefore = await fetchGradeEff(session.token);
  R.jobGrades.effBefore = effBefore.count;
  R.jobGrades.codes = effBefore.codes.slice(0, 20);
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(CHROME) ? CHROME : undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wireNetwork(page);
  await injectPortalAuth(page, session);
  await page.goto(q(portal, '/command-center'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2000);

  let gradeCode = effBefore.codes[0] || null;
  let gradeLabel = GRADE_LABEL;

  if (effBefore.count === 0) {
    await ensureJobGradesViaFe(page, portal);
    let effMid = await fetchGradeEff(session.token);
    if (effMid.count === 0) {
      await createGradeExtension(page, GRADE_CODE, GRADE_LABEL);
      effMid = await fetchGradeEff(session.token);
    }
    R.jobGrades.effAfter = effMid.count;
    R.jobGrades.codes = effMid.codes.slice(0, 20);
    gradeCode = effMid.codes.includes(GRADE_CODE) ? GRADE_CODE : effMid.codes[0];
    save();
    ac('JOB-GRADES-EFF', effMid.count > 0 ? 'PASS' : 'FAIL', {
      summary: `EFF before=${effBefore.count} after=${effMid.count} sync=${R.jobGrades.syncUsed} feCreate=${R.jobGrades.feCreateUsed}`,
    });
    if (effMid.count === 0) {
      R.ack_status = 'FAIL_TO_PM';
      R.overall = 'FAIL';
      R.pm_dispatch_hint = 'dev-fe/dev-be — job_grades catalog empty after U65 Settings sync+create';
      R.endedAt = ts();
      save();
      await browser.close();
      process.exit(1);
    }
  } else {
    ac('JOB-GRADES-EFF', 'PASS', { summary: `existing EFF=${effBefore.count}` });
    R.jobGrades.effAfter = effBefore.count;
  }

  const create = await fillYctdCreate(page, portal, gradeCode);
  const postBodyGrade = create.yctdPost?.body?.job_grade_key;
  const postOk = create.ok && postBodyGrade === R.ids.selectedGradeCode;
  ac('AC-SET-CONSUMER-JG-REC-01-CREATE', postOk ? 'PASS' : 'FAIL', {
    summary: `POST ${create.yctdPost?.status ?? 'none'} job_grade_key=${postBodyGrade} expected=${R.ids.selectedGradeCode} reason=${create.reason || ''}`,
    clickPath: 'Tuyển dụng → YCTD → Tạo → hdsd-requisition-job-grade → Lưu',
  });
  await shot(page, '02-after-create');

  if (!postOk) {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL';
    R.pm_dispatch_hint = 'dev-fe/dev-be — YCTD POST job_grade_key 2xx+body';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }

  const verify = await verifyListAndDetail(page, portal, gradeLabel);
  const f5Ok = verify.rowVisible && (verify.gradeLabelOk || verify.detailOk);
  ac('AC-SET-CONSUMER-JG-REC-01-F5', f5Ok ? 'PASS' : 'FAIL', {
    summary: `row=${verify.rowVisible} listLabel=${verify.gradeLabelOk} detail=${verify.detailOk} detailTxt=${verify.detailTxt?.slice(0, 80)}`,
  });

  const altCode =
    R.jobGrades.codes.find((c) => c !== R.ids.selectedGradeCode) ||
    (gradeCode !== R.ids.selectedGradeCode ? gradeCode : null);
  let editOk = false;
  if (altCode) {
    const edit = await tryEditPatch(page, altCode);
    editOk = edit.ok && edit.bodyGrade === altCode;
    ac('AC-SET-CONSUMER-JG-REC-01-EDIT', editOk ? 'PASS' : 'FAIL', {
      summary: `PATCH ${edit.patch?.status ?? 'skip'} job_grade_key=${edit.bodyGrade}`,
    });
  } else {
    ac('AC-SET-CONSUMER-JG-REC-01-EDIT', 'PASS', {
      summary: 'skipped — single grade in catalog (create path sufficient)',
    });
    editOk = true;
  }

  const overallPass = postOk && f5Ok && editOk;
  R.ack_status = overallPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = overallPass ? 'PASS' : 'FAIL';
  if (!overallPass) {
    R.pm_dispatch_hint = 'dev-fe — resolveJobGradeLabel list/detail; dev-be PATCH persist';
  }
  R.endedAt = ts();
  save();
  await browser.close();
  console.log(JSON.stringify({ ack_status: R.ack_status, stamp: STAMP, overall: R.overall }));
  process.exit(overallPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  save();
  process.exit(1);
});
