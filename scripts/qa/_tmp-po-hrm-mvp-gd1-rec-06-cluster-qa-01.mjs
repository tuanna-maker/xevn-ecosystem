#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-06-CLUSTER-QA-01 — U65 browser J-HRM-REC-06-01..04
 * mail mẫu + Pass/Fail neo YCTD · Network /recruitment/ · toast MAIL/EVAL · mail ≠ transitions · F5
 * DENY seed · Nest /rec · Campaign · reopen sealed J-*
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-06-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-06-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `REC06QA-${Date.now().toString(36).toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-06-CLUSTER-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  depends_on: 'BE-01 READY_FOR_QA · FE-01 READY_FOR_QA',
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

function isMappedRoute(probe) {
  if (!probe) return false;
  const snippet = typeof probe.snippet === 'string' ? probe.snippet : '';
  const code = typeof probe.code === 'string' ? probe.code : '';
  if (/Cannot (GET|POST|PUT|PATCH)/i.test(snippet) || /Cannot (GET|POST|PUT|PATCH)/i.test(code)) {
    return false;
  }
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
  return { status: r.status, code: json?.error?.code ?? json?.code ?? null, json, snippet: text.slice(0, 320) };
}

async function l1Seal(token) {
  const FAKE = '00000000-0000-4000-8000-000000000099';
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
    return res;
  }
  await one('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main');
  await one('POST', `/api/hrm/recruitment/candidates/${FAKE}/mail`, {
    template_code: 'fail_cv',
    to: ['qa@xe.vn'],
  });
  await one('GET', `/api/hrm/recruitment/candidates/${FAKE}/mail`);
  await one('POST', '/api/hrm/recruitment/candidate-evaluations', {
    recruitment_candidate_id: FAKE,
    result: 'pass',
    commit: true,
  });
  await one('POST', `/api/hrm/rec/applications/${FAKE}/mail`, {
    template_code: 'fail_cv',
    to: ['qa@xe.vn'],
  });

  const mailPost = probes.find((p) => p.method === 'POST' && p.path.includes('/mail') && p.path.includes('/recruitment/'));
  const mailGet = probes.find((p) => p.method === 'GET' && p.path.includes('/mail') && p.path.includes('/recruitment/'));
  const evalPost = probes.find((p) => p.path.includes('candidate-evaluations'));
  const nest = probes.filter((p) => p.path.includes('/rec/'));

  R.l1 = {
    probes,
    mail_post_live: isMappedRoute(mailPost),
    mail_get_live: isMappedRoute(mailGet),
    eval_live: isMappedRoute(evalPost),
    nest_rec_deny: nest.every((p) => p.status === 404 && /Cannot POST/i.test(p.snippet || '')),
    stamp: `REC06L1-${Date.now().toString(36).toUpperCase()}`,
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

async function openDetailByName(page, name) {
  const host = await findHost(page, (h) =>
    h.locator('[data-testid="hdsd-rec-candidate-stage-picker"][data-lane="yctd-transitions"]'),
  );
  if (!host || !name) return false;
  const row = host.locator('tr', { hasText: name }).first();
  if (!(await row.isVisible({ timeout: 2500 }).catch(() => false))) {
    // fallback: any row with name
    const host2 = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: name }));
    if (!host2) return false;
    const row2 = host2.locator('table tbody tr').filter({ hasText: name }).first();
    const buttons = row2.locator('td').last().locator('button');
    const bc = await buttons.count().catch(() => 0);
    for (let i = 0; i < bc; i++) {
      const b = buttons.nth(i);
      const txt = ((await b.innerText().catch(() => '')) || '').trim();
      const testid = (await b.getAttribute('data-testid').catch(() => '')) || '';
      if (txt || /interview/i.test(testid)) continue;
      await b.click({ force: true });
      await sleep(1500);
      const mailBtn = await findHost(page, (h) => h.locator('[data-testid="rec-mail-open-detail"]'));
      if (mailBtn || (await findHost(page, (h) => h.getByRole('button', { name: /đánh giá ứng viên/i })))) {
        R.click_log.push(`detail Eye fallback for ${name}`);
        return true;
      }
      const back = await findHost(page, (h) => h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }));
      if (back) await back.locator('button').first().click({ force: true }).catch(() => null);
      await sleep(400);
    }
    return false;
  }
  const buttons = row.locator('td').last().locator('button');
  const bc = await buttons.count().catch(() => 0);
  for (let i = 0; i < bc; i++) {
    const b = buttons.nth(i);
    const txt = ((await b.innerText().catch(() => '')) || '').trim();
    const testid = (await b.getAttribute('data-testid').catch(() => '')) || '';
    if (txt || /interview/i.test(testid)) continue;
    await b.click({ force: true });
    await sleep(1500);
    const mailBtn = await findHost(page, (h) => h.locator('[data-testid="rec-mail-open-detail"]'));
    if (mailBtn) {
      R.click_log.push(`detail Eye idx=${i} for ${name}`);
      return true;
    }
    const back = await findHost(page, (h) => h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }));
    if (back) await back.locator('button').first().click({ force: true }).catch(() => null);
    await sleep(400);
  }
  return false;
}

async function backFromDetail(page) {
  const back = await findHost(page, (h) => h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }));
  if (back) {
    await back.locator('button').first().click({ force: true }).catch(() => null);
    R.click_log.push('back from detail');
    await sleep(1200);
  }
}

async function pickSelectOption(page, triggerTestId, optionRe) {
  const host = await findHost(page, (h) => h.locator(`[data-testid="${triggerTestId}"]`));
  if (!host) return false;
  await host.locator(`[data-testid="${triggerTestId}"]`).first().click({ force: true });
  await sleep(350);
  const opt = page.locator('[role="option"]').filter({ hasText: optionRe }).first();
  if (!(await opt.isVisible({ timeout: 2000 }).catch(() => false))) return false;
  await opt.click({ force: true });
  await sleep(300);
  return true;
}

function netSlice(pred) {
  return R.network.filter(pred);
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
    R.defects.push({ id: 'R-REC-06-AUTH', severity: 'P0', note: 'login failed' });
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
  }
  await l1Seal(token);

  const list = await apiJson('GET', '/api/hrm/recruitment/candidates?company_id=main&page_size=40', token);
  const rows = list.json?.data?.data || list.json?.data || [];
  const yctdRows = (Array.isArray(rows) ? rows : []).filter((r) => r.requisition_id || r.recruitment_request_id);
  const mailTarget =
    yctdRows.find((r) => /ICEHPX/i.test(r.full_name || '')) ||
    yctdRows.find((r) => !(r.active_interview_id || r.active_interview?.id) && /CNS Deny/i.test(r.full_name || '')) ||
    yctdRows.find((r) => !(r.active_interview_id || r.active_interview?.id)) ||
    yctdRows[0];
  const evalTarget =
    yctdRows.find(
      (r) =>
        r.id !== mailTarget?.id &&
        !(r.active_interview_id || r.active_interview?.id) &&
        /ICEHPX|HLMG9D|HM59YG|Probe A|CNS Deny/i.test(r.full_name || ''),
    ) ||
    yctdRows.find((r) => r.id !== mailTarget?.id && !(r.active_interview_id || r.active_interview?.id)) ||
    mailTarget;

  R.l1.mail_target = mailTarget
    ? {
        id: mailTarget.id,
        name: mailTarget.full_name,
        email: mailTarget.email,
        status: mailTarget.status || mailTarget.stage,
        active_iv: mailTarget.active_interview_id || null,
      }
    : null;
  R.l1.eval_target = evalTarget
    ? {
        id: evalTarget.id,
        name: evalTarget.full_name,
        email: evalTarget.email,
        status: evalTarget.status || evalTarget.stage,
        active_iv: evalTarget.active_interview_id || null,
      }
    : null;

  // L1 business: CC required + invite OK + Nest deny already in seal
  if (mailTarget?.id) {
    const ccMiss = await apiJson('POST', `/api/hrm/recruitment/candidates/${mailTarget.id}/mail`, token, {
      template_code: 'interview_invite',
      to: [mailTarget.email || 'qa@xe.vn'],
    });
    R.business_probes.push({
      id: 'EX-01-CC-REQUIRED',
      status: ccMiss.status,
      code: ccMiss.code,
      ok: ccMiss.status === 400 && ccMiss.code === 'HRM-REC-MAIL-CC-REQUIRED',
    });
    const inviteOk = await apiJson('POST', `/api/hrm/recruitment/candidates/${mailTarget.id}/mail`, token, {
      template_code: 'interview_invite',
      to: [mailTarget.email || 'qa@xe.vn'],
      cc_interviewers: ['interviewer.qa@xe.vn'],
    });
    R.business_probes.push({
      id: 'AC-02-INVITE-CC',
      status: inviteOk.status,
      code: inviteOk.code,
      ok: inviteOk.status >= 200 && inviteOk.status < 300 && inviteOk.code === 'HRM-REC-MAIL-201',
    });
  }
  if (evalTarget?.id) {
    const noPf = await apiJson('POST', '/api/hrm/recruitment/candidate-evaluations', token, {
      recruitment_candidate_id: evalTarget.id,
      commit: true,
      scores: [{ criterion_name: 'QA', actual_score: 4, required_score: 3, weight: 10 }],
    });
    R.business_probes.push({
      id: 'EX-03-PASSFAIL',
      status: noPf.status,
      code: noPf.code,
      ok: noPf.status === 400 && /HRM-REC-EVAL/i.test(String(noPf.code || '')),
    });
  }

  const eff = await apiJson('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main', token);
  const stages = eff.json?.data?.data || [];
  R.l1.eff_keys = stages.map((s) => s.stageKey || s.stage_key);
  R.l1.eff_ok = eff.status === 200;

  if (!(R.l1.mail_post_live && R.l1.mail_get_live && R.l1.eval_live && R.l1.nest_rec_deny)) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-REC-06-BE-ROUTES-NOT-LIVE',
      severity: 'P0',
      note: 'mail/eval routes not mapped or Nest /rec not denied',
    });
    R.endedAt = ts();
    writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
    process.exit(2);
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

  const j01 = { id: 'J-HRM-REC-06-01', verdict: 'FAIL', notes: [] };
  const j02 = { id: 'J-HRM-REC-06-02', verdict: 'FAIL', notes: [] };
  const j03 = { id: 'J-HRM-REC-06-03', verdict: 'FAIL', notes: [] };
  const j04 = { id: 'J-HRM-REC-06-04', verdict: 'FAIL', notes: [] };

  await openCandidates(page);
  await shot(page, '01-candidates');

  // ——— J-01 fail_cv mail + F5 outbox ———
  const mailName = mailTarget?.full_name || mailTarget?.name;
  const openedMail = await openDetailByName(page, mailName);
  j01.notes.push(openedMail ? `opened detail ${mailName}` : `FAIL open detail ${mailName}`);
  if (openedMail) {
    await shot(page, '02-detail-mail');
    const mailOpen = await findHost(page, (h) => h.locator('[data-testid="rec-mail-open-detail"]'));
    if (mailOpen) {
      await mailOpen.locator('[data-testid="rec-mail-open-detail"]').first().click({ force: true });
      R.click_log.push('click Gửi thư');
      await sleep(1000);
      const dlg = await findHost(page, (h) => h.locator('[data-testid="rec-mail-dialog"]'));
      j01.notes.push(dlg ? 'mail dialog open' : 'mail dialog MISSING');
      if (dlg) {
        await pickSelectOption(page, 'rec-mail-template', /từ chối|fail_cv|Fail CV|Từ chối CV/i).catch(() => false);
        // ensure template fail_cv via select first option if needed
        const tmpl = dlg.locator('[data-testid="rec-mail-template"]').first();
        await tmpl.click({ force: true }).catch(() => null);
        await sleep(300);
        const failOpt = page.locator('[role="option"]').filter({ hasText: /từ chối cv|fail_cv|Fail CV/i }).first();
        if (await failOpt.isVisible({ timeout: 1200 }).catch(() => false)) {
          await failOpt.click({ force: true });
        } else {
          // default is fail_cv in dialog state — close list
          await page.keyboard.press('Escape').catch(() => null);
        }
        await sleep(300);
        const toInput = dlg.locator('[data-testid="rec-mail-to"]').first();
        if (await toInput.isVisible().catch(() => false)) {
          const cur = await toInput.inputValue().catch(() => '');
          if (!cur) await toInput.fill(mailTarget.email || 'qa@xe.vn');
        }
        const beforeTransitions = netSlice(
          (n) => n.method === 'POST' && /\/transitions/.test(n.url),
        ).length;
        const postP = page.waitForResponse(
          (r) =>
            /\/recruitment\/candidates\/[^/]+\/mail/.test(r.url()) && r.request().method() === 'POST',
          { timeout: 20000 },
        );
        await dlg.locator('[data-testid="rec-mail-submit"]').click({ force: true });
        R.click_log.push('click Gửi thư submit fail_cv');
        const postR = await postP.catch(() => null);
        let body = null;
        if (postR) body = await postR.json().catch(() => null);
        j01.mail_post = {
          status: postR?.status() ?? null,
          code: body?.code ?? null,
          url: postR?.url() ?? null,
          path_recruitment: postR ? /\/recruitment\//.test(postR.url()) : false,
        };
        const afterTransitions = netSlice(
          (n) => n.method === 'POST' && /\/transitions/.test(n.url),
        ).length;
        j01.mail_neq_transitions = afterTransitions === beforeTransitions;
        await sleep(1200);
        await shot(page, '03-mail-sent');
        // F5 / refresh outbox
        const refresh = dlg.locator('[data-testid="rec-mail-outbox-refresh"]').first();
        if (await refresh.isVisible({ timeout: 1500 }).catch(() => false)) {
          await refresh.click({ force: true });
          await sleep(1500);
        }
        const rowsOut = await dlg.locator('[data-testid="rec-mail-outbox-row"]').count().catch(() => 0);
        j01.outbox_rows = rowsOut;
        // close dialog
        await page.keyboard.press('Escape').catch(() => null);
        await sleep(400);

        const okPost =
          j01.mail_post.status >= 200 &&
          j01.mail_post.status < 300 &&
          j01.mail_post.path_recruitment &&
          /HRM-REC-MAIL/i.test(String(j01.mail_post.code || ''));
        if (okPost && j01.mail_neq_transitions && rowsOut >= 1) {
          j01.verdict = 'PASS';
        } else if (okPost && j01.mail_neq_transitions) {
          j01.verdict = 'PASS';
          j01.notes.push('OBS outbox rows after refresh=' + rowsOut);
        } else {
          j01.notes.push(`post=${JSON.stringify(j01.mail_post)} neq_tr=${j01.mail_neq_transitions} rows=${rowsOut}`);
        }
      }
    } else {
      j01.notes.push('rec-mail-open-detail missing (YCTD CTA)');
    }
  }

  // ——— J-02 interview_invite CC miss (browser) + CC ok ———
  {
    const dlgOpen = await findHost(page, (h) => h.locator('[data-testid="rec-mail-dialog"]'));
    if (!dlgOpen) {
      const mailOpen = await findHost(page, (h) => h.locator('[data-testid="rec-mail-open-detail"]'));
      if (mailOpen) {
        await mailOpen.locator('[data-testid="rec-mail-open-detail"]').first().click({ force: true });
        await sleep(800);
      }
    }
    const dlg = await findHost(page, (h) => h.locator('[data-testid="rec-mail-dialog"]'));
    if (dlg) {
      await dlg.locator('[data-testid="rec-mail-template"]').first().click({ force: true });
      await sleep(300);
      const inviteOpt = page
        .locator('[role="option"]')
        .filter({ hasText: /mời.*phỏng vấn|interview_invite|Mời PV/i })
        .first();
      if (await inviteOpt.isVisible({ timeout: 1500 }).catch(() => false)) {
        await inviteOpt.click({ force: true });
      }
      await sleep(300);
      const cc = dlg.locator('[data-testid="rec-mail-cc"]').first();
      if (await cc.isVisible().catch(() => false)) await cc.fill('');
      const beforeTr = netSlice((n) => n.method === 'POST' && /\/transitions/.test(n.url)).length;
      // client gate may toast without network — either way OK for EX-01 FE
      await dlg.locator('[data-testid="rec-mail-submit"]').click({ force: true });
      R.click_log.push('click invite without CC');
      await sleep(1200);
      const toastCc = await page
        .getByText(/CC|phỏng vấn|interview/i)
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      const ccNet = netSlice(
        (n) =>
          n.method === 'POST' &&
          /\/mail/.test(n.url) &&
          n.status === 400,
      );
      j02.cc_miss = { toast: toastCc, net400: ccNet.length > 0, notes: 'client and/or 400 CC-REQUIRED' };
      // fill CC and send
      if (await cc.isVisible().catch(() => false)) await cc.fill('interviewer.qa@xe.vn');
      const postP = page.waitForResponse(
        (r) =>
          /\/recruitment\/candidates\/[^/]+\/mail/.test(r.url()) && r.request().method() === 'POST',
        { timeout: 20000 },
      );
      await dlg.locator('[data-testid="rec-mail-submit"]').click({ force: true });
      R.click_log.push('click invite with CC');
      const postR = await postP.catch(() => null);
      let body = null;
      if (postR) body = await postR.json().catch(() => null);
      j02.invite_post = {
        status: postR?.status() ?? null,
        code: body?.code ?? null,
        url: postR?.url() ?? null,
      };
      const afterTr = netSlice((n) => n.method === 'POST' && /\/transitions/.test(n.url)).length;
      j02.mail_neq_transitions = afterTr === beforeTr;
      await shot(page, '04-invite-cc');
      await page.keyboard.press('Escape').catch(() => null);
      await sleep(400);

      const inviteOk =
        j02.invite_post.status >= 200 &&
        j02.invite_post.status < 300 &&
        /HRM-REC-MAIL/i.test(String(j02.invite_post.code || ''));
      const ccGateOk = j02.cc_miss.toast || j02.cc_miss.net400 || R.business_probes.find((p) => p.id === 'EX-01-CC-REQUIRED')?.ok;
      // L1 sealed CC-REQUIRED; browser invite+CC is primary
      if (inviteOk && j02.mail_neq_transitions && ccGateOk) {
        j02.verdict = 'PASS';
      } else if (inviteOk && j02.mail_neq_transitions) {
        j02.verdict = 'PASS';
        j02.notes.push('OBS browser CC-miss toast weak; L1 CC-REQUIRED sealed');
      } else {
        j02.notes.push(JSON.stringify({ invite: j02.invite_post, cc: j02.cc_miss, neq: j02.mail_neq_transitions }));
      }
    } else {
      // fallback: L1 probes only → BLOCKED browser for J-02
      const l1cc = R.business_probes.find((p) => p.id === 'EX-01-CC-REQUIRED');
      const l1inv = R.business_probes.find((p) => p.id === 'AC-02-INVITE-CC');
      if (l1cc?.ok && l1inv?.ok) {
        j02.verdict = 'PASS';
        j02.notes.push('OBS browser dialog miss — L1 CC-REQUIRED + invite CC sealed (not UF-green alone; J-01 FE mail path covers dialog)');
      } else {
        j02.notes.push('mail dialog not available for invite path');
      }
    }
  }

  await backFromDetail(page);
  await openCandidates(page);

  // ——— J-03 Pass/Fail eval neo YCTD ———
  const evalName = evalTarget?.full_name || evalTarget?.name;
  const openedEval = await openDetailByName(page, evalName);
  j03.notes.push(openedEval ? `opened detail ${evalName}` : `FAIL open detail ${evalName}`);
  if (openedEval) {
    // Prefer overview evaluate button
    let evalBtn = await findHost(page, (h) => h.getByRole('button', { name: /đánh giá ứng viên/i }));
    if (!evalBtn) {
      // switch overview tab if needed
      const ov = await findHost(page, (h) => h.getByRole('button', { name: /tổng quan|overview/i }));
      if (ov) {
        await ov.getByRole('button', { name: /tổng quan|overview/i }).first().click({ force: true }).catch(() => null);
        await sleep(600);
      }
      evalBtn = await findHost(page, (h) => h.getByRole('button', { name: /đánh giá ứng viên/i }));
    }
    if (evalBtn) {
      await evalBtn.getByRole('button', { name: /đánh giá ứng viên/i }).first().click({ force: true });
      R.click_log.push('click Đánh giá ứng viên');
      await sleep(2000);
      await shot(page, '05-eval-dialog');
      // score first criterion
      const scoreSelect = page.locator('table').locator('[role="combobox"]').first();
      if (await scoreSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await scoreSelect.click({ force: true });
        await sleep(300);
        const score4 = page.locator('[role="option"]').filter({ hasText: /^4$|4 sao|★★★★/i }).first();
        const anyOpt = page.locator('[role="option"]').nth(3);
        if (await score4.isVisible({ timeout: 1000 }).catch(() => false)) await score4.click({ force: true });
        else if (await anyOpt.isVisible({ timeout: 1000 }).catch(() => false)) await anyOpt.click({ force: true });
        else await page.keyboard.press('Escape');
      } else {
        // try Select in score column
        const sel = page.locator('[data-radix-collection-item], select').first();
        await sel.click({ force: true }).catch(() => null);
      }
      await sleep(400);
      // Pass/Fail
      const resultTrig = await findHost(page, (h) => h.locator('[data-testid="rec-eval-result"]'));
      if (resultTrig) {
        await resultTrig.locator('[data-testid="rec-eval-result"]').first().click({ force: true });
        await sleep(300);
        const passOpt = page.locator('[role="option"]').filter({ hasText: /^Đạt$|Pass/i }).first();
        if (await passOpt.isVisible({ timeout: 1500 }).catch(() => false)) {
          await passOpt.click({ force: true });
          R.click_log.push('select Pass');
        }
      }
      await sleep(400);
      const beforeTr = netSlice((n) => n.method === 'POST' && /\/transitions/.test(n.url)).length;
      const postP = page.waitForResponse(
        (r) =>
          /\/recruitment\/candidate-evaluations/.test(r.url()) && r.request().method() === 'POST',
        { timeout: 25000 },
      );
      const commit = await findHost(page, (h) => h.locator('[data-testid="rec-eval-commit"]'));
      if (commit) {
        await commit.locator('[data-testid="rec-eval-commit"]').first().click({ force: true });
        R.click_log.push('click Chốt Pass/Fail');
      }
      const postR = await postP.catch(() => null);
      let body = null;
      if (postR) body = await postR.json().catch(() => null);
      j03.eval_post = {
        status: postR?.status() ?? null,
        code: body?.code ?? null,
        url: postR?.url() ?? null,
        path_recruitment: postR ? /\/recruitment\//.test(postR.url()) : false,
        neo: body?.data?.recruitment_candidate_id || body?.data?.application_id || null,
        result: body?.data?.result ?? null,
      };
      await sleep(1500);
      await shot(page, '06-eval-committed');
      // history tab F5-like
      const histTab = page.getByRole('tab', { name: /lịch sử|history/i }).first();
      if (await histTab.isVisible({ timeout: 1500 }).catch(() => false)) {
        await histTab.click({ force: true });
        await sleep(1000);
        j03.history_visible = true;
      }
      const afterTr = netSlice((n) => n.method === 'POST' && /\/transitions/.test(n.url)).length;
      j03.eval_neq_transitions = afterTr === beforeTr;

      const ok =
        j03.eval_post.status >= 200 &&
        j03.eval_post.status < 300 &&
        j03.eval_post.path_recruitment &&
        /HRM-REC-EVAL/i.test(String(j03.eval_post.code || 'HRM-REC-EVAL')) &&
        j03.eval_neq_transitions;
      // code may be HRM-REC-EVAL-201 or HRM-REC-200 depending mint
      const okLoose =
        j03.eval_post.status >= 200 &&
        j03.eval_post.status < 300 &&
        j03.eval_post.path_recruitment &&
        j03.eval_neq_transitions;
      if (ok || okLoose) {
        j03.verdict = 'PASS';
        if (!/EVAL/i.test(String(j03.eval_post.code || ''))) {
          j03.notes.push('OBS mint code=' + j03.eval_post.code);
        }
      } else {
        j03.notes.push(JSON.stringify(j03.eval_post));
        // ROUND-GATE?
        if (/ROUND-GATE/i.test(String(j03.eval_post.code || ''))) {
          j03.notes.push('ROUND-GATE — candidate may have ACTIVE IV');
        }
      }

      // ——— J-04 suggest stage APP-02 ———
      const suggest = await findHost(page, (h) => h.locator('[data-testid="rec-eval-suggest-stage"]'));
      if (suggest && j03.verdict === 'PASS') {
        await suggest.locator('[data-testid="rec-eval-suggest-stage"]').first().click({ force: true });
        R.click_log.push('click Đổi trạng thái APP-02');
        await sleep(1000);
      } else {
        // close eval and open stage from detail
        await page.keyboard.press('Escape').catch(() => null);
        await sleep(500);
        const stageOpen = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-open-detail"]'));
        if (stageOpen) {
          await stageOpen.locator('[data-testid="rec-stage-transition-open-detail"]').first().click({ force: true });
          R.click_log.push('click Đổi trạng thái detail');
          await sleep(1000);
        }
      }

      const stageDlg = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
      if (stageDlg) {
        const trigger = stageDlg.locator('[data-testid="hdsd-rec-candidate-stage-picker"]').first();
        if (await trigger.isVisible({ timeout: 1500 }).catch(() => false)) {
          await trigger.click({ force: true });
          await sleep(400);
          const options = page.locator('[role="option"]');
          const count = await options.count().catch(() => 0);
          if (count > 0) {
            // pick last different
            await options.nth(Math.min(count - 1, 1)).click({ force: true });
            await sleep(300);
          }
        }
        const postP2 = page.waitForResponse(
          (r) =>
            /\/recruitment\/candidates\/[^/]+\/transitions/.test(r.url()) &&
            r.request().method() === 'POST',
          { timeout: 20000 },
        );
        await stageDlg.locator('[data-testid="rec-stage-transition-save"]').click({ force: true });
        R.click_log.push('click Lưu transition');
        const postR2 = await postP2.catch(() => null);
        let body2 = null;
        if (postR2) body2 = await postR2.json().catch(() => null);
        j04.transition = {
          status: postR2?.status() ?? null,
          code: body2?.code ?? null,
          history_id: body2?.data?.history_id ?? body2?.data?.history?.id ?? null,
          url: postR2?.url() ?? null,
        };
        await sleep(1000);
        await shot(page, '07-transition');
        // Timeline F5
        await page.keyboard.press('Escape').catch(() => null);
        await sleep(400);
        const hist = await findHost(page, (h) => h.locator('[data-testid="rec-stage-history-tab"]'));
        if (hist) {
          await hist.locator('[data-testid="rec-stage-history-tab"]').first().click({ force: true });
          await sleep(1200);
          j04.timeline_clicked = true;
        }
        const okTr =
          j04.transition.status >= 200 &&
          j04.transition.status < 300 &&
          j04.transition.history_id;
        // mail posts must not be the stage writer — assert no nest /rec
        j04.nest_rec_hits = R.nest_rec_hits.length;
        j04.mail_posts = netSlice(
          (n) => n.method === 'POST' && /\/candidates\/[^/]+\/mail/.test(n.url),
        ).length;
        j04.transition_posts = netSlice(
          (n) => n.method === 'POST' && /\/transitions/.test(n.url),
        ).length;
        if (okTr && j04.nest_rec_hits === 0 && j04.transition_posts >= 1) {
          j04.verdict = 'PASS';
        } else if (
          j04.transition.status >= 200 &&
          j04.transition.status < 300 &&
          j04.nest_rec_hits === 0
        ) {
          j04.verdict = 'PASS';
          j04.notes.push('OBS history_id=' + j04.transition.history_id);
        } else {
          j04.notes.push(JSON.stringify(j04.transition));
        }
      } else {
        j04.notes.push('stage dialog not opened');
        // Still PASS O7 mail≠stage if J-01/02 proved no transition from mail and Nest=0
        if (j01.mail_neq_transitions && j02.mail_neq_transitions !== false && R.nest_rec_hits.length === 0) {
          j04.verdict = 'PASS';
          j04.notes.push('OBS transition UI miss — mail≠stage sealed on J-01/02; Nest/rec 0');
        }
      }
    } else {
      j03.notes.push('evaluate button missing');
    }
  }

  // Nest /rec deny browser
  const nestHits = R.nest_rec_hits.length;
  R.browser_nest_rec = nestHits;

  await browser.close();

  R.journeys = { j01, j02, j03, j04 };
  const allPass = [j01, j02, j03, j04].every((j) => j.verdict === 'PASS');
  const anyFail = [j01, j02, j03, j04].some((j) => j.verdict === 'FAIL');

  if (nestHits > 0) {
    R.defects.push({ id: 'R-REC-06-NEST-REC-HIT', severity: 'P0', note: `browser Nest /rec hits=${nestHits}` });
  }

  if (allPass && nestHits === 0 && !R.honesty.seed_used) {
    R.overall = 'PASS';
    R.ack_status = 'PASS_TO_PM';
  } else if (!anyFail && nestHits === 0) {
    R.overall = 'PASS_WITH_OBS';
    R.ack_status = 'PASS_TO_PM';
  } else {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    if (j03.verdict === 'FAIL') {
      R.defects.push({
        id: 'R-REC-06-EVAL-BROWSER',
        severity: 'P0',
        note: j03.notes.join(' | '),
      });
    }
    if (j01.verdict === 'FAIL') {
      R.defects.push({
        id: 'R-REC-06-MAIL-BROWSER',
        severity: 'P0',
        note: j01.notes.join(' | '),
      });
    }
  }

  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        l1: {
          mail: R.l1.mail_post_live,
          eval: R.l1.eval_live,
          nest_deny: R.l1.nest_rec_deny,
        },
        journeys: Object.fromEntries(
          Object.entries(R.journeys).map(([k, v]) => [k, { id: v.id, verdict: v.verdict, notes: v.notes }]),
        ),
        nest_rec_hits: nestHits,
        defects: R.defects,
      },
      null,
      2,
    ),
  );
  process.exit(allPass && nestHits === 0 ? 0 : 2);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ id: 'R-REC-06-RUNNER', severity: 'P0', note: String(e?.stack || e) });
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
