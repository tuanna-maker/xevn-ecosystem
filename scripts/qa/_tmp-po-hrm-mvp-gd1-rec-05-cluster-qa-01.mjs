#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01 — U65 browser J-HRM-REC-STG-05-01..04
 * Persona ceo@xe.vn · zero-seed · C-SLICE
 * cấm: seed · Nest /rec SoT · pool stage as FR-05 · honesty flip · reopen J-CV-04
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-05-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `REC05QA-${Date.now().toString(36).toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    seed_used: false,
    c_slice_ne_module: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  build: {},
  network: [],
  nest_rec_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function trackNet(req) {
  const url = req.url();
  if (!/\/api\/hrm\//.test(url)) return;
  const entry = {
    method: req.method(),
    url,
    at: ts(),
    recruitment: /\/recruitment\//.test(url),
    nest_rec: /\/api\/hrm\/rec(\/|$|\?)/.test(url),
  };
  R.network.push(entry);
  if (entry.nest_rec) R.nest_rec_hits.push(entry);
}

async function loginToken() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function l1Seal(token) {
  const FAKE = '00000000-0000-4000-8000-000000000001';
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
  const probes = [];
  async function one(method, path, body) {
    const r = await fetch(`${HRM}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await r.text();
    probes.push({
      method,
      path,
      status: r.status,
      snippet: text.slice(0, 220),
      cannot: /Cannot (GET|POST|PUT|PATCH)/i.test(text),
    });
  }
  await one('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main');
  await one('POST', `/api/hrm/recruitment/candidates/${FAKE}/transitions`, {
    to_stage: 'screening',
  });
  await one('GET', `/api/hrm/recruitment/candidates/${FAKE}/stage-history?company_id=main`);
  await one('POST', `/api/hrm/rec/candidates/${FAKE}/transitions`, { to_stage: 'screening' });
  const post = probes.find((p) => p.method === 'POST' && p.path.includes('/recruitment/'));
  const hist = probes.find((p) => p.path.includes('stage-history') && p.path.includes('/recruitment/'));
  R.l1 = {
    probes,
    transitions_live: Boolean(post && !post.cannot && post.status !== 404),
    history_live: Boolean(hist && !hist.cannot && hist.status !== 404),
    nest_rec_deny: probes.filter((p) => p.path.includes('/rec/')).every((p) => p.status === 404),
    eff_ok: probes[0]?.status === 200,
  };
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

async function shot(page, name) {
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => null);
  R.screens.push(p);
}

async function navCandidates(page) {
  R.click_log.push('open /hr/recruitment');
  await page.goto(
    `${PORTAL}/hr/recruitment?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=candidates`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await sleep(2500);
  const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
  if (nav) {
    await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
    R.click_log.push('click Ứng viên');
    await sleep(1500);
  }
  const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
  if (all) {
    await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
    R.click_log.push('click Tất cả ứng viên');
    await sleep(2500);
  }
}

async function main() {
  // L0
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(u);
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e?.message || e);
    }
  }

  // Build seal (skip re-build if SKIP_BUILD=1 — still record prior known failure)
  if (process.env.SKIP_BUILD === '1') {
    R.build = {
      ok: false,
      exit: 1,
      skipped: true,
      error:
        'TS2345 listCandidateStageHistory query.company_id optional vs resolveHrmListScope(string) — sealed prior run',
    };
  } else {
    try {
      execSync('pnpm run build', {
        cwd: resolve(ROOT, 'apps/api/hrm-api'),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      R.build = { ok: true, exit: 0 };
    } catch (e) {
      const msg = `${e?.stdout || ''}\n${e?.stderr || e?.message || e}`;
      R.build = {
        ok: false,
        exit: e?.status ?? 1,
        error: msg.includes('TS2345')
          ? 'TS2345 listCandidateStageHistory query.company_id optional vs resolveHrmListScope(string)'
          : msg.slice(-800),
      };
    }
  }

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-REC-05-AUTH', severity: 'P0', note: 'login failed' });
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }
  await l1Seal(token);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('request', trackNet);
  page.on('console', (m) => {
    if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 240));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));

  // Portal auth keys (same as REC-04 / REC-06a harnesses)
  await page.addInitScript(
    (s) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
        store.setItem(
          'xevn.portal.user',
          JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }),
        );
        store.setItem('xevn.portal.tenantId', s.tenantId);
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId);
      }
    },
    { token, email: EMAIL, companyId: COMPANY, tenantId: TENANT },
  );

  // Prefer command-center embed (REC-06a) then fallback /hr/recruitment
  await page.goto(
    `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await sleep(4000);
  await navCandidates(page);
  await shot(page, '01-candidates');

  // Find YCTD Lane A picker (button with data-lane)
  const host = await findHost(page, (h) =>
    h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
  );

  const j01 = {
    id: 'J-HRM-REC-STG-05-01',
    verdict: 'FAIL',
    notes: [],
  };

  if (!host) {
    j01.notes.push('no YCTD-bound lane-A picker visible (data-lane=yctd-transitions)');
    // fallback: any stage picker button
    const any = await findHost(page, (h) =>
      h.locator('button[data-testid="hdsd-rec-candidate-stage-picker"]'),
    );
    j01.notes.push(any ? 'found non-lane-A picker buttons' : 'no stage picker buttons');
  } else {
    const beforeEff = R.network.filter((n) => /pipeline-stages\/effective/.test(n.url)).length;
    await host
      .locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]')
      .first()
      .click({ force: true });
    R.click_log.push('click YCTD stage picker');
    await sleep(2000);
    await shot(page, '02-transition-dialog');

    const dlg = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
    const dlgVisible = Boolean(dlg);
    j01.notes.push(dlgVisible ? 'dialog open' : 'dialog missing');

    const afterEff = R.network.filter((n) => /pipeline-stages\/effective/.test(n.url));
    const effHit = afterEff.slice(beforeEff).find((n) => /\/recruitment\//.test(n.url));
    j01.notes.push(
      effHit
        ? `EFF GET ${effHit.method} …/recruitment/pipeline-stages/effective`
        : 'no EFF GET after open',
    );

    // Capture EFF response status via wait if possible
    const effResp = await page
      .waitForResponse(
        (r) => /\/recruitment\/pipeline-stages\/effective/.test(r.url()) && r.request().method() === 'GET',
        { timeout: 4000 },
      )
      .catch(() => null);
    if (effResp) j01.notes.push(`EFF status=${effResp.status()}`);

    j01.verdict =
      dlgVisible && (effHit || (effResp && effResp.status() >= 200 && effResp.status() < 300))
        ? 'PASS'
        : 'FAIL';

    // J-02 attempt save if dialog + live
    const j02 = {
      id: 'J-HRM-REC-STG-05-02',
      verdict: 'FAIL',
      notes: [],
    };
    if (!R.l1.transitions_live) {
      j02.notes.push('BLOCKED — POST …/transitions Cannot POST (dist not LIVE)');
      j02.verdict = 'BLOCKED';
    } else if (dlg) {
      const select = dlg.locator('[data-testid="hdsd-rec-candidate-stage-picker"]').first();
      await select.click({ force: true }).catch(() => null);
      await sleep(400);
      const options = dlg.locator('[role="option"]');
      const count = await options.count().catch(() => 0);
      j02.notes.push(`eff options=${count}`);
      if (count > 0) {
        // pick a different option if possible
        await options.nth(Math.min(1, count - 1)).click({ force: true });
        await sleep(300);
        const save = dlg.locator('[data-testid="rec-stage-transition-save"]');
        const postP = page.waitForResponse(
          (r) => /\/candidates\/[^/]+\/transitions/.test(r.url()) && r.request().method() === 'POST',
          { timeout: 12000 },
        );
        await save.click({ force: true });
        R.click_log.push('click Lưu transition');
        const postR = await postP.catch(() => null);
        if (postR) {
          j02.notes.push(`POST transitions status=${postR.status()} url=${postR.url()}`);
          j02.notes.push(`path_ok=${/\/recruitment\//.test(postR.url())}`);
        } else {
          j02.notes.push('no POST transitions observed');
        }
      }
    }
    R.journeys['J-HRM-REC-STG-05-02'] = j02;

    // J-03 reject
    const j03 = {
      id: 'J-HRM-REC-STG-05-03',
      verdict: R.l1.transitions_live ? 'FAIL' : 'BLOCKED',
      notes: R.l1.transitions_live
        ? []
        : ['BLOCKED — BE transitions not LIVE; cannot assert REJECT-REASON 400 + F5'],
    };
    R.journeys['J-HRM-REC-STG-05-03'] = j03;

    // J-04 reverse / deny
    const j04 = {
      id: 'J-HRM-REC-STG-05-04',
      verdict: R.l1.transitions_live ? 'FAIL' : 'BLOCKED',
      notes: [
        R.l1.transitions_live
          ? ''
          : 'BLOCKED — BE transitions not LIVE; reverse CFG + multi-YCTD not executable',
        `nest_rec_browser_hits=${R.nest_rec_hits.length}`,
        'DENY reopen J-CV-04 (not executed)',
        'DENY pool-as-FR-05 (Lane A picker only asserted)',
      ].filter(Boolean),
    };
    R.journeys['J-HRM-REC-STG-05-04'] = j04;
  }

  R.journeys['J-HRM-REC-STG-05-01'] = j01;

  if (!R.journeys['J-HRM-REC-STG-05-02']) {
    R.journeys['J-HRM-REC-STG-05-02'] = {
      id: 'J-HRM-REC-STG-05-02',
      verdict: 'BLOCKED',
      notes: ['no dialog / no YCTD row'],
    };
    R.journeys['J-HRM-REC-STG-05-03'] = {
      id: 'J-HRM-REC-STG-05-03',
      verdict: 'BLOCKED',
      notes: ['blocked upstream'],
    };
    R.journeys['J-HRM-REC-STG-05-04'] = {
      id: 'J-HRM-REC-STG-05-04',
      verdict: 'BLOCKED',
      notes: ['blocked upstream'],
    };
  }

  await browser.close();

  // Defects
  if (!R.build.ok) {
    R.defects.push({
      id: 'R-REC-05-BE-BUILD-TS2345',
      severity: 'P0',
      owner: 'dev-be',
      note: R.build.error,
      file: 'apps/api/hrm-api/src/recruitment/recruitment.service.ts:2501',
      fix_hint:
        'listCandidateStageHistory: pass query.company_id ?? \'\' (or require company_id on ListCandidateStageHistoryQueryDto) to satisfy resolveHrmListScope(requestedCompanyId: string); rebuild+restart dist; seal POST transitions + GET stage-history not Cannot *',
    });
  }
  if (!R.l1.transitions_live || !R.l1.history_live) {
    R.defects.push({
      id: 'R-REC-05-BE-ROUTES-NOT-LIVE',
      severity: 'P0',
      owner: 'dev-be',
      note: 'Running dist lacks POST …/candidates/:id/transitions and GET …/stage-history (Cannot * 404 HRM-DATA-404) while EFF LIVE — stale/unbuildable dist after BE-01 READY claim',
    });
  }

  const allPass = ['01', '02', '03', '04'].every(
    (n) => R.journeys[`J-HRM-REC-STG-05-${n}`]?.verdict === 'PASS',
  );
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.nest_rec_hits_count = R.nest_rec_hits.length;
  R.recruitment_path_ok =
    R.network.filter((n) => n.recruitment).length > 0 && R.nest_rec_hits.length === 0;
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        build: R.build,
        l1: {
          transitions_live: R.l1.transitions_live,
          history_live: R.l1.history_live,
          nest_rec_deny: R.l1.nest_rec_deny,
          eff_ok: R.l1.eff_ok,
        },
        journeys: Object.fromEntries(
          Object.entries(R.journeys).map(([k, v]) => [k, { verdict: v.verdict, notes: v.notes }]),
        ),
        defects: R.defects,
        nest_rec_hits: R.nest_rec_hits.length,
      },
      null,
      2,
    ),
  );
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-REC-05-QA-RUNNER', severity: 'P0', note: String(e?.stack || e) });
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
