#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-02 — U65 retest J-HRM-REC-STG-05-01..04
 * depends_on: BE-02 L1_ROUTES_LIVE
 * Persona ceo@xe.vn · zero-seed · C-SLICE · honesty false
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-cluster-qa-02.json');
const L1_OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-l1-seal.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-05-cluster-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `REC05QA2-${Date.now().toString(36).toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-02',
  stamp: STAMP,
  startedAt: ts(),
  depends_on: 'BE-02 READY · L1_ROUTES_LIVE',
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
  business_probes: [],
  network: [],
  nest_rec_hits: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  journeys: {},
  defects: [],
  residuals: [],
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

function isMappedRoute(probe, cannotRe) {
  if (!probe) return false;
  const snippet = typeof probe.snippet === 'string' ? probe.snippet : '';
  const code = typeof probe.code === 'string' ? probe.code : '';
  if (cannotRe.test(snippet) || cannotRe.test(code)) return false;
  if (probe.status === 404) {
    return code.startsWith('HRM-REC') || /Candidate not found/i.test(snippet);
  }
  return probe.status > 0 && probe.status < 500;
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

async function apiJson(method, path, token, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
  const r = await fetch(`${HRM}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return { status: r.status, code: json?.error?.code ?? json?.code ?? null, json, snippet: text.slice(0, 280) };
}

async function l1Seal(token) {
  const FAKE = '00000000-0000-4000-8000-000000000001';
  const probes = [];
  async function one(method, path, body) {
    const res = await apiJson(method, path, token, body);
    probes.push({
      method,
      path,
      status: res.status,
      code: res.code,
      snippet: res.snippet,
      cannot: /Cannot (GET|POST|PUT|PATCH)/i.test(res.snippet || ''),
    });
  }
  await one('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main');
  await one('POST', `/api/hrm/recruitment/candidates/${FAKE}/transitions`, { to_stage: 'screening' });
  await one('GET', `/api/hrm/recruitment/candidates/${FAKE}/stage-history?company_id=main`);
  await one('POST', `/api/hrm/rec/candidates/${FAKE}/transitions`, { to_stage: 'screening' });
  await one('GET', `/api/hrm/rec/candidates/${FAKE}/stage-history`);
  const post = probes.find((p) => p.method === 'POST' && p.path.includes('/recruitment/'));
  const hist = probes.find((p) => p.path.includes('stage-history') && p.path.includes('/recruitment/'));
  const nest = probes.filter((p) => p.path.includes('/rec/'));
  R.l1 = {
    probes,
    transitions_live: isMappedRoute(post, /Cannot POST/i),
    history_live: isMappedRoute(hist, /Cannot GET/i),
    nest_rec_deny: nest.every((p) => p.status === 404),
    eff_ok: probes[0]?.status === 200,
    stamp: `REC05L1-${Date.now().toString(36).toUpperCase()}`,
  };
  writeFileSync(
    L1_OUT,
    JSON.stringify(
      {
        work_item_id: R.work_item_id,
        stamp: R.l1.stamp,
        startedAt: ts(),
        token_ok: true,
        probes,
        seal: {
          transitions_route_live: R.l1.transitions_live,
          stage_history_route_live: R.l1.history_live,
          nest_rec_deny: R.l1.nest_rec_deny,
          eff_ok: R.l1.eff_ok,
        },
        overall:
          R.l1.transitions_live && R.l1.history_live && R.l1.nest_rec_deny
            ? 'L1_ROUTES_LIVE'
            : 'L1_STALE_OR_ABSENT',
      },
      null,
      2,
    ),
  );
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

async function openCandidates(page) {
  await page.goto(
    `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await sleep(3500);
  const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
  if (nav) {
    await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
    R.click_log.push('click Ứng viên');
    await sleep(1000);
  }
  const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
  if (all) {
    await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
    R.click_log.push('click Tất cả ứng viên');
    await sleep(2500);
  }
}

/** Pick EFF option different from current (avoid same-key no-op). */
async function pickDifferentStage(host, page, preferKeys = [], avoidKeys = []) {
  const trigger = host.locator('[data-testid="hdsd-rec-candidate-stage-picker"]').first();
  await trigger.click({ force: true });
  await sleep(400);
  const options = page.locator('[role="option"]');
  const count = await options.count().catch(() => 0);
  if (count <= 0) return { count: 0, label: null };
  const labels = [];
  for (let i = 0; i < count; i++) {
    labels.push(((await options.nth(i).innerText().catch(() => '')) || '').trim());
  }
  let idx = -1;
  for (let i = 0; i < labels.length; i++) {
    const low = labels[i].toLowerCase();
    if (avoidKeys.some((k) => k && low.includes(String(k).toLowerCase()))) continue;
    if (preferKeys.some((k) => low.includes(String(k).toLowerCase()))) {
      idx = i;
      break;
    }
    if (idx < 0) idx = i;
  }
  if (idx < 0) idx = 0;
  await options.nth(idx).click({ force: true });
  await sleep(350);
  return { count, label: labels[idx], labels };
}

async function clickLaneAPicker(host, name) {
  if (name) {
    const row = host.locator('tr', { hasText: name }).first();
    const p = row.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]');
    if (await p.isVisible({ timeout: 1500 }).catch(() => false)) {
      await p.click({ force: true });
      R.click_log.push(`picker row ${name}`);
      return true;
    }
  }
  await host
    .locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]')
    .first()
    .click({ force: true });
  R.click_log.push('picker first YCTD');
  return true;
}

async function openDetailByName(page, name) {
  const host = await findHost(page, (h) =>
    h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
  );
  if (!host || !name) return false;
  const row = host.locator('tr', { hasText: name }).first();
  if (!(await row.isVisible({ timeout: 2000 }).catch(() => false))) return false;
  const buttons = row.locator('td').last().locator('button');
  const bc = await buttons.count().catch(() => 0);
  for (let i = 0; i < bc; i++) {
    const b = buttons.nth(i);
    const txt = ((await b.innerText().catch(() => '')) || '').trim();
    const testid = (await b.getAttribute('data-testid').catch(() => '')) || '';
    if (txt || /interview/i.test(testid)) continue;
    await b.click({ force: true });
    await sleep(1500);
    const tab = await findHost(page, (h) => h.locator('[data-testid="rec-stage-history-tab"]'));
    if (tab) {
      R.click_log.push(`detail Eye idx=${i} for ${name}`);
      return true;
    }
    // wrong panel — try Back
    const back = await findHost(page, (h) => h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }));
    if (back) await back.locator('button').first().click({ force: true }).catch(() => null);
    await sleep(400);
  }
  return false;
}

async function saveTransition(page, host) {
  const dlg = host.locator('[data-testid="rec-stage-transition-dialog"]');
  const postP = page.waitForResponse(
    (r) =>
      /\/recruitment\/candidates\/[^/]+\/transitions/.test(r.url()) && r.request().method() === 'POST',
    { timeout: 15000 },
  );
  await dlg.locator('[data-testid="rec-stage-transition-save"]').click({ force: true });
  R.click_log.push('click Lưu');
  const postR = await postP.catch(() => null);
  if (!postR) return null;
  const body = await postR.json().catch(() => null);
  const m = postR.url().match(/\/candidates\/([^/?]+)\/transitions/);
  return {
    status: postR.status(),
    code: body?.code,
    url: postR.url(),
    history_id: body?.data?.history_id ?? body?.data?.history?.id ?? null,
    stage: body?.data?.stage,
    candidate_id: m?.[1] || null,
    cannot: /Cannot /i.test(JSON.stringify(body)),
    body,
  };
}

async function main() {
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      R.l0[k] = (await fetch(u)).status;
    } catch (e) {
      R.l0[k] = String(e?.message || e);
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

  const eff = await apiJson('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main', token);
  const stages = eff.json?.data?.data || [];
  R.l1.eff_total = stages.length;
  R.l1.reject_in_eff = stages.filter((s) => s.isRejectOutcome === true).length;
  R.l1.eff_keys = stages.map((s) => s.stageKey || s.stage_key);

  const list = await apiJson('GET', '/api/hrm/recruitment/candidates?company_id=main&page_size=40', token);
  const rows = list.json?.data?.data || list.json?.data || [];
  const yctdRows = (Array.isArray(rows) ? rows : []).filter((r) => r.requisition_id || r.requisitionId);
  // Prefer stage=new for real append (not same-key no-op)
  const target =
    yctdRows.find((r) => /ICEHPX/i.test(r.full_name || '') && (r.stage || r.status) === 'new') ||
    yctdRows.find((r) => (r.stage || r.status) === 'new' && r.requisition_id) ||
    yctdRows.find((r) => /ICEHPX/i.test(r.full_name || '')) ||
    yctdRows[0];
  const peer = yctdRows.find(
    (r) =>
      r.id !== target?.id &&
      (r.requisition_id || r.requisitionId) !== (target?.requisition_id || target?.requisitionId),
  );
  R.l1.target_candidate = target
    ? {
        id: target.id,
        name: target.full_name || target.fullName,
        stage: target.stage || target.status,
        requisition_id: target.requisition_id || target.requisitionId,
      }
    : null;
  R.l1.peer_candidate = peer
    ? {
        id: peer.id,
        name: peer.full_name || peer.fullName,
        stage: peer.stage || peer.status,
        requisition_id: peer.requisition_id || peer.requisitionId,
      }
    : null;

  if (target?.id) {
    const invent = await apiJson(
      'POST',
      `/api/hrm/recruitment/candidates/${target.id}/transitions?company_id=main`,
      token,
      { to_stage: 'invent_stage_qa02' },
    );
    R.business_probes.push({
      id: 'EX-01-UNKNOWN',
      status: invent.status,
      code: invent.code,
      ok: invent.status === 400 && invent.code === 'HRM-REC-STAGE-UNKNOWN',
    });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('request', trackNet);
  page.on('response', (res) => {
    const url = res.url();
    if (!/\/api\/hrm\//.test(url)) return;
    R.network.push({
      method: res.request().method(),
      url,
      status: res.status(),
      at: ts(),
      recruitment: /\/recruitment\//.test(url),
      nest_rec: /\/api\/hrm\/rec(\/|$|\?)/.test(url),
    });
  });
  page.on('console', (m) => {
    if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 240));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));

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

  const j01 = { id: 'J-HRM-REC-STG-05-01', verdict: 'FAIL', notes: [] };
  const j02 = { id: 'J-HRM-REC-STG-05-02', verdict: 'FAIL', notes: [] };
  const j03 = { id: 'J-HRM-REC-STG-05-03', verdict: 'FAIL', notes: [] };
  const j04 = { id: 'J-HRM-REC-STG-05-04', verdict: 'FAIL', notes: [] };

  await openCandidates(page);
  await shot(page, '01-candidates');

  const host = await findHost(page, (h) =>
    h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
  );

  if (!host || !R.l1.transitions_live) {
    j01.notes.push(host ? 'L1 not live' : 'no YCTD picker');
    j02.verdict = j03.verdict = j04.verdict = 'BLOCKED';
  } else {
    const name = target?.name || '';
    const currentStage = (target?.stage || 'new').toLowerCase();
    await clickLaneAPicker(host, name);
    await sleep(1800);
    await shot(page, '02-transition-dialog');

    const dlgHost = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
    const dlgVisible = Boolean(dlgHost);
    const freeText = dlgHost
      ? await dlgHost
          .locator('[data-testid="rec-stage-free-text"]')
          .count()
          .catch(() => 0)
      : 0;
    const effNet = R.network.filter((n) => /pipeline-stages\/effective/.test(n.url));
    j01.notes.push(dlgVisible ? 'dialog open' : 'dialog missing');
    j01.notes.push(freeText === 0 ? 'no free-text SoT' : 'free-text FAIL');
    j01.notes.push(effNet.length || R.l1.eff_ok ? 'EFF path /recruitment/ OK' : 'EFF miss');
    j01.verdict = dlgVisible && freeText === 0 ? 'PASS' : 'FAIL';

    if (dlgHost) {
      // Read current stage label from dialog to avoid same-key no-op
      const dlgText = ((await dlgHost.innerText().catch(() => '')) || '').toLowerCase();
      const avoidFromDialog = [];
      if (/hr_custom_stage_07|custom_stage_07/.test(dlgText)) avoidFromDialog.push('custom_stage_07', 'hr_custom');
      if (/hired/.test(dlgText)) avoidFromDialog.push('hired');
      if (/iv allow|allow/.test(dlgText) && !/deny/.test(dlgText)) avoidFromDialog.push('iv allow');
      if (/deny/.test(dlgText)) avoidFromDialog.push('deny');
      const avoidAll = [currentStage, 'new', ...avoidFromDialog];

      // --- J-02: forward to DIFFERENT stage (prefer hired/allow — not same as current) ---
      const pick = await pickDifferentStage(dlgHost, page, ['hired', 'iv allow', 'allow', 'custom_stage_07'], avoidAll);
      j02.notes.push(`options=${pick.count}; picked=${pick.label}; avoid=${avoidAll.join('|')}`);
      let post = await saveTransition(page, dlgHost);
      // Retry once if same-key no-op
      if (post && !post.history_id && pick.count > 1) {
        j02.notes.push('same-key no-op — reopen and pick alternate EFF');
        await page.keyboard.press('Escape').catch(() => null);
        await sleep(500);
        await openCandidates(page);
        const hRetry = await findHost(page, (h) =>
          h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
        );
        if (hRetry) {
          await clickLaneAPicker(hRetry, name);
          await sleep(1200);
          const dRetry = await findHost(page, (h) =>
            h.locator('[data-testid="rec-stage-transition-dialog"]'),
          );
          if (dRetry) {
            const alt = await pickDifferentStage(
              dRetry,
              page,
              ['iv allow', 'hired', 'allow', 'deny'],
              [String(post.stage || currentStage), 'custom_stage_07', 'new', ...(pick.label ? [pick.label.slice(0, 12)] : [])],
            );
            j02.notes.push(`retry pick=${alt.label}`);
            post = await saveTransition(page, dRetry);
          }
        }
      }
      if (post) {
        j02.notes.push(
          `POST status=${post.status} code=${post.code} cand=${post.candidate_id} history_id=${post.history_id} stage=${post.stage} cannot=${post.cannot}`,
        );
        const postOk =
          post.status >= 200 &&
          post.status < 300 &&
          !post.cannot &&
          Boolean(post.history_id) &&
          /\/recruitment\//.test(post.url);
        if (!post.history_id) {
          j02.notes.push('WARN same-key no-op or missing history_id — need different to_stage');
        }

        await sleep(600);
        await page.keyboard.press('Escape').catch(() => null);

        // F5
        await page.reload({ waitUntil: 'domcontentloaded' });
        await sleep(3500);
        await openCandidates(page);
        j02.notes.push('F5 after Lưu');

        const candId = post.candidate_id || target.id;
        const histApi = await apiJson(
          'GET',
          `/api/hrm/recruitment/candidates/${candId}/stage-history?company_id=main`,
          token,
        );
        const histTotal = histApi.json?.data?.total ?? 0;
        j02.notes.push(`L1 history status=${histApi.status} total=${histTotal} for ${candId}`);

        // Detail timeline UI
        const detailName =
          (await apiJson('GET', `/api/hrm/recruitment/candidates/${candId}?company_id=main`, token)).json
            ?.data?.full_name || name;
        let detailOk = await openDetailByName(page, detailName);
        if (detailOk) {
          const histTab = await findHost(page, (h) => h.locator('[data-testid="rec-stage-history-tab"]'));
          if (histTab) {
            const histWait = page.waitForResponse(
              (r) =>
                /\/recruitment\/candidates\/[^/]+\/stage-history/.test(r.url()) &&
                r.request().method() === 'GET',
              { timeout: 10000 },
            );
            await histTab.locator('[data-testid="rec-stage-history-tab"]').first().click({ force: true });
            const hg = await histWait.catch(() => null);
            if (hg) j02.notes.push(`UI GET stage-history status=${hg.status()}`);
            await sleep(1000);
            const panel = await findHost(page, (h) => h.locator('[data-testid="rec-stage-history-panel"]'));
            const rowsUi = panel
              ? await panel.locator('[data-testid="rec-stage-history-row"]').count().catch(() => 0)
              : 0;
            j02.notes.push(`history panel=${Boolean(panel)} rows=${rowsUi}`);
            detailOk = Boolean(panel) && (rowsUi > 0 || histTotal > 0);
          }
        } else {
          j02.notes.push('detail open failed — L1 history used for F5 AC');
        }
        await shot(page, '04-stage-history');

        j02.verdict = postOk && histApi.status === 200 && histTotal >= 1 ? 'PASS' : 'FAIL';
        R.l1.mutated_candidate_id = candId;
        R.l1.mutated_candidate_name = detailName;
        R.l1.post_history_id = post.history_id;

        // --- J-03 invent + reject OBS ---
        const inventProbe = R.business_probes.find((p) => p.id === 'EX-01-UNKNOWN');
        j03.notes.push(
          inventProbe?.ok
            ? 'L1 invent → 400 HRM-REC-STAGE-UNKNOWN'
            : `invent fail ${inventProbe?.code}`,
        );
        j03.notes.push('FE Select-only (no free-text invent)');
        j03.notes.push(`EFF reject outcomes=${R.l1.reject_in_eff}`);
        if (R.l1.reject_in_eff === 0) {
          j03.notes.push(
            'OBS: no isRejectOutcome in EFF — REJECT-REASON browser path N/A (jest BE-01 seals; DENY seed CAT)',
          );
          R.residuals.push({
            id: 'R-REC-05-EFF-NO-REJECT-OUTCOME',
            severity: 'P2',
            owner: 'peer-CAT',
            note: 'EFF 4 stages all isRejectOutcome=false; reject+note / REJECT-REASON browser not executable without catalog reject stage.',
          });
        }
        j03.verdict = inventProbe?.ok && freeText === 0 ? 'PASS' : 'FAIL';

        // --- J-04 reverse allow (to lower sort custom_stage_07) ---
        await openCandidates(page);
        const h4 = await findHost(page, (h) =>
          h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
        );
        let reverseOk = false;
        if (h4) {
          const getCand = await apiJson(
            'GET',
            `/api/hrm/recruitment/candidates/${candId}?company_id=main`,
            token,
          );
          let cur =
            getCand.json?.data?.stage ||
            getCand.json?.data?.status ||
            post.stage ||
            'hr_custom_stage_07';
          j04.notes.push(`pre-reverse stage=${cur}`);

          // Always move to a HIGHER sort stage first (hired / iv allow), then reverse down
          await clickLaneAPicker(h4, detailName);
          await sleep(1500);
          let d4 = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
          if (d4) {
            const up = await pickDifferentStage(d4, page, ['hired', 'iv allow', 'allow'], [
              String(cur),
              'custom_stage_07',
              'new',
            ]);
            j04.notes.push(`prep up pick=${up.label}`);
            const upPost = await saveTransition(page, d4);
            if (upPost) {
              j04.notes.push(
                `prep POST status=${upPost.status} hist=${upPost.history_id} stage=${upPost.stage}`,
              );
              if (upPost.stage) cur = upPost.stage;
            }
            await sleep(800);
            await page.keyboard.press('Escape').catch(() => null);
            await openCandidates(page);
            const h5 = await findHost(page, (h) =>
              h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
            );
            if (h5) {
              await clickLaneAPicker(h5, detailName);
              await sleep(1200);
              d4 = await findHost(page, (h) =>
                h.locator('[data-testid="rec-stage-transition-dialog"]'),
              );
            }
          }
          if (d4) {
            const rev = await pickDifferentStage(d4, page, ['custom_stage_07', 'hr_custom'], [
              String(cur),
              'hired',
              'allow',
              'deny',
            ]);
            const hint = await d4
              .locator('[data-testid="rec-stage-reverse-hint"]')
              .isVisible({ timeout: 800 })
              .catch(() => false);
            j04.notes.push(`reverse pick=${rev.label} hint=${hint} from=${cur}`);
            const revPost = await saveTransition(page, d4);
            if (revPost) {
              j04.notes.push(
                `reverse POST status=${revPost.status} code=${revPost.code} hist=${revPost.history_id} cannot=${revPost.cannot}`,
              );
              reverseOk =
                revPost.status >= 200 &&
                revPost.status < 300 &&
                Boolean(revPost.history_id) &&
                !revPost.cannot;
            }
            await shot(page, '05-reverse');
          }
        }

        if (peer?.id) {
          const peerAfter = await apiJson(
            'GET',
            `/api/hrm/recruitment/candidates/${peer.id}?company_id=main`,
            token,
          );
          const peerStage = peerAfter.json?.data?.stage || peerAfter.json?.data?.status;
          j04.notes.push(
            `multi-YCTD peer ${peer.id} stage_after=${peerStage} (baseline ${peer.stage})`,
          );
        }
        j04.notes.push(`nest_rec_browser_hits=${R.nest_rec_hits.length}`);
        j04.notes.push('DENY reopen J-CV-04 · pool-as-FR-05 · Campaign SoT');
        j04.notes.push(
          'OBS EX-03 REVERSE-FORBIDDEN: CFG default allow; jest seals deny — no CFG flip U65',
        );
        R.residuals.push({
          id: 'R-REC-05-REVERSE-CFG-DENY-BROWSER',
          severity: 'P2',
          owner: 'qa-follow',
          note: 'Browser EX-03 needs allow_reverse_stage=false; default true → reverse 2xx asserted.',
        });
        j04.verdict = reverseOk && R.nest_rec_hits.length === 0 ? 'PASS' : 'FAIL';
      } else {
        j02.notes.push('no POST observed');
      }
    }
  }

  R.journeys['J-HRM-REC-STG-05-01'] = j01;
  R.journeys['J-HRM-REC-STG-05-02'] = j02;
  R.journeys['J-HRM-REC-STG-05-03'] = j03;
  R.journeys['J-HRM-REC-STG-05-04'] = j04;

  await browser.close();

  if (!R.l1.transitions_live || !R.l1.history_live) {
    R.defects.push({
      id: 'R-REC-05-BE-ROUTES-NOT-LIVE',
      severity: 'P0',
      owner: 'dev-be',
      note: 'Cannot * still after BE-02',
    });
  }

  const allPass = ['01', '02', '03', '04'].every(
    (n) => R.journeys[`J-HRM-REC-STG-05-${n}`]?.verdict === 'PASS',
  );
  R.nest_rec_hits_count = R.nest_rec_hits.length;
  R.overall = allPass ? (R.residuals.length ? 'PASS_WITH_OBS' : 'PASS') : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        l1: {
          transitions_live: R.l1.transitions_live,
          history_live: R.l1.history_live,
          reject_in_eff: R.l1.reject_in_eff,
          mutated: R.l1.mutated_candidate_id,
          history_id: R.l1.post_history_id,
        },
        business_probes: R.business_probes,
        journeys: Object.fromEntries(
          Object.entries(R.journeys).map(([k, v]) => [k, { verdict: v.verdict, notes: v.notes }]),
        ),
        residuals: R.residuals,
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
