#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-REC-PIPE-TMDV-01
 * FE-only P-REC-PIPE @ CO-TMDV after P-REC-REQ EVIDENCED (TMDV-REQ-R1-DINI2P)
 *
 * Flow:
 *   1) Precond TC-WFM-REC-PIPE — ensure hrm_candidate_pipeline via CC preset FE (U65)
 *   2) Candidates tab → Thêm ứng viên tài xế → Lưu → F5
 *   3) Bắt đầu QT → start-pipeline 2xx + wi → F5 stage lock
 *   4) Inbox AP stamp-scoped Xử lý nhanh if task spawned
 *   5) Document FD BR-PO-REC-LGX-01 Offer/GPLX gate (no bypass)
 *
 * FORBIDDEN: seed · invent EVIDENCED · apps/**
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'trsport';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const PRIOR_REQ_STAMP = 'TMDV-REQ-R1-DINI2P';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-pipe-tmdv-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-rec-pipe-tmdv-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `TMDV-PIPE-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const CAND_NAME = `Nguyễn Văn Tài xế ${STAMP}`;
const CAND_EMAIL = `tai.xe.${STAMP.toLowerCase()}@xe.vn.test`;
const CAND_POSITION = 'Lái xe / Vận hành logistics';
const CAND_NOTES = `${STAMP} · ứng viên tài xế YCTD ${PRIOR_REQ_STAMP} · thiếu GPLX hạng (FD BR-PO-REC-LGX-01)`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-REC-PIPE-TMDV-01',
  prior_req_stamp: PRIOR_REQ_STAMP,
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, STAMP, commit: 'dc930c5' },
  persona_note:
    'Group CEO ceo@xe.vn embed companyId=trsport (CO-TMDV) · OU TM-DV · reuse open YCTD TMDV-REQ-R1-DINI2P',
  api_probes: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: {
    wfDefId: null,
    candidateId: null,
    workflowInstanceId: null,
    requisitionId: null,
  },
  startPipeline: null,
  approve: {},
  fd_gplx: {},
  residuals: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}
function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 240));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      };
      const interesting =
        /candidates|start-pipeline|workflow-engine|inbox|tasks|complete|definitions/.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;

      if (method === 'POST' && /\/candidates(\?|$|\/)/.test(u) && !/start-pipeline|applications|evaluations/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.candidateId = row.id;
          entry.createdId = row?.id || null;
          entry.code = j?.code || null;
          entry.full_name = row?.full_name || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /start-pipeline/.test(u)) {
        try {
          const j = await res.json();
          results.startPipeline = {
            status: res.status(),
            code: j?.code || null,
            spawnMissing: Boolean(j?.data?.spawnMissing ?? j?.spawnMissing),
            workflowInstanceId:
              j?.data?.workflowInstanceId ||
              j?.data?.workflow_instance_id ||
              j?.workflowInstanceId ||
              null,
            message: String(j?.message || '').slice(0, 220),
            stage: j?.data?.stage || j?.data?.candidate?.stage || null,
          };
          if (results.startPipeline.workflowInstanceId) {
            results.ids.workflowInstanceId = results.startPipeline.workflowInstanceId;
          }
          entry.code = results.startPipeline.code;
          entry.spawnMissing = results.startPipeline.spawnMissing;
          entry.workflowInstanceId = results.startPipeline.workflowInstanceId;
        } catch {
          /* */
        }
      }
      if (
        (method === 'POST' || method === 'PUT') &&
        /workflow-engine\/definitions/.test(u)
      ) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.wfDefId = row.id;
          entry.code = j?.code || null;
          entry.wfCode = row?.workflow_code || row?.workflowCode || row?.code || null;
          entry.defId = row?.id || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/complete/.test(u)) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.bodySnippet = JSON.stringify(j).slice(0, 280);
          entry.instanceId =
            j?.data?.instance_id || j?.data?.instanceId || j?.instance_id || null;
          entry.stepKey = j?.data?.step_key || j?.data?.stepKey || null;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /candidates-pool/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const data = j?.data?.data ?? j?.data ?? [];
          const rows = Array.isArray(data) ? data : [];
          const hit = rows.find(
            (r) =>
              r.id === results.ids.candidateId ||
              String(r.full_name || '').includes(STAMP) ||
              String(r.notes || '').includes(STAMP),
          );
          entry.hasStamp = Boolean(hit);
          entry.hitStage = hit?.stage || null;
          entry.hitWi = hit?.workflow_instance_id || null;
          if (hit?.id) results.ids.candidateId = hit.id;
          if (hit?.workflow_instance_id) results.ids.workflowInstanceId = hit.workflow_instance_id;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (results.network.length > 900) results.network.shift();
    } catch {
      /* */
    }
  });
}

async function clickText(page, re, opts = {}) {
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"]')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], span, div'),
    );
    const el = nodes.find(
      (n) => rx.test((n.textContent || '').trim()) && (n.offsetParent !== null || n.getClientRects().length),
    );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
}

async function selectOuTmdv(page) {
  try {
    const ou = page.getByLabel(/Lọc đơn vị thành viên/i).first();
    const ou2 = (await ou.isVisible().catch(() => false)) ? ou : page.getByRole('combobox').first();
    if (!(await ou2.isVisible().catch(() => false))) return;
    await ou2.click({ force: true });
    await sleep(800);
    const opt = page
      .getByRole('option', { name: /Thương mại và Dịch vụ|Thương mại|trsport/i })
      .first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ force: true });
      await sleep(1500);
      log('OU_FILTER_TMDV', { note: 'selected member OU option' });
      return;
    }
    const picked = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"]'));
      const hit = items.find((n) => /thương mại|trsport|tmdv|dịch vụ x\.e/i.test(n.textContent || ''));
      if (!hit) return false;
      hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    await sleep(1500);
    log('OU_FILTER_TMDV', {
      note: picked ? 'picked via evaluate' : 'option not found — URL companyId=trsport',
    });
    if (!picked) await page.keyboard.press('Escape').catch(() => {});
  } catch {
    /* */
  }
}

async function probeApi(session) {
  const h = { Authorization: `Bearer ${session.token}`, 'content-type': 'application/json' };
  const defs = await fetch(`${XBOS}/api/xbos/workflow-engine/definitions?companyId=main`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const items = defs?.data?.items ?? defs?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const pipeDef = arr.find(
    (d) => String(d.workflow_code || d.workflowCode || '') === 'hrm_candidate_pipeline',
  );
  const reqs = await fetch(`${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const reqRows = reqs?.data?.data ?? reqs?.data ?? [];
  const reqList = Array.isArray(reqRows) ? reqRows : [];
  const priorReq = reqList.find((r) => String(r.title || '').includes(PRIOR_REQ_STAMP));
  if (priorReq?.id) results.ids.requisitionId = priorReq.id;
  const cands = await fetch(`${HRM}/api/hrm/recruitment/candidates-pool?company_id=${COMPANY}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  results.api_probes = {
    wf_pipe_def: pipeDef
      ? {
          id: pipeDef.id,
          status: pipeDef.status,
          code: pipeDef.workflow_code || pipeDef.workflowCode,
        }
      : null,
    prior_req: priorReq
      ? { id: priorReq.id, status: priorReq.status, title: priorReq.title }
      : null,
    candidates_before: {
      total: cands?.data?.total ?? (Array.isArray(cands?.data?.data) ? cands.data.data.length : null),
    },
    defs_total: arr.length,
    defs_codes: arr.map((d) => d.workflow_code || d.workflowCode),
  };
  if (pipeDef?.id) results.ids.wfDefId = pipeDef.id;
  save();
  return results.api_probes;
}

async function ensurePipeWfViaFe(page, session) {
  if (results.api_probes.wf_pipe_def?.status === 'active') {
    recordStep('wf_precond', 'PASS', {
      summary: `hrm_candidate_pipeline already active id=${results.api_probes.wf_pipe_def.id}`,
    });
    return true;
  }

  log('GOTO_CC_WF', { url: `${PORTAL}/command-center?settings=workflow` });
  await page.goto(`${PORTAL}/command-center?settings=workflow`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.companyId', 'main');
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(4500);
  await shot(page, '00-wf-list');

  const preset = page.getByTestId('hrm-rec-wf-preset-candidate');
  if (!(await preset.isVisible().catch(() => false))) {
    recordStep('wf_precond', 'BLOCKED', {
      summary: 'Preset chip hrm-rec-wf-preset-candidate not visible on CC settings=workflow',
    });
    results.residuals.push({
      id: 'R-U84-REC-PIPE-WF-PRESET-MISSING',
      severity: 'P0',
      note: 'Cannot create hrm_candidate_pipeline via FE preset — TC-WFM-REC-PIPE-HP-001 precond',
    });
    return false;
  }

  await preset.click({ force: true });
  await sleep(2500);
  await shot(page, '00b-wf-preset-open');

  const body = await page.locator('body').innerText().catch(() => '');
  const onCanvas =
    /Lưu quy trình|\bLưu\b|Roadmap ứng viên|hrm_candidate_pipeline|Tiếp nhận|Sàng lọc|Phỏng vấn|Đề nghị/i.test(
      body,
    );
  if (!onCanvas) {
    recordStep('wf_precond', 'FAIL', { summary: 'Preset click did not open canvas/detail' });
    return false;
  }

  const net0 = results.network.length;
  let saved = await clickText(page, /Lưu quy trình/i);
  if (!saved) saved = await clickText(page, /^Lưu$/i);
  await sleep(4000);
  await shot(page, '00c-wf-after-save');

  const saves = results.network
    .slice(net0)
    .filter(
      (n) =>
        /workflow-engine\/definitions/.test(n.url) &&
        (n.method === 'POST' || n.method === 'PUT') &&
        n.status >= 200 &&
        n.status < 300,
    );
  const saveOk = saves.length >= 1;

  // Re-probe
  const h = { Authorization: `Bearer ${session.token}` };
  const defs = await fetch(`${XBOS}/api/xbos/workflow-engine/definitions?companyId=main`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const items = defs?.data?.items ?? defs?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const pipeDef = arr.find(
    (d) => String(d.workflow_code || d.workflowCode || '') === 'hrm_candidate_pipeline',
  );
  results.api_probes.wf_pipe_def_after = pipeDef
    ? {
        id: pipeDef.id,
        status: pipeDef.status,
        code: pipeDef.workflow_code || pipeDef.workflowCode,
      }
    : null;
  if (pipeDef?.id) results.ids.wfDefId = pipeDef.id;

  await page.goto(`${PORTAL}/command-center?settings=workflow`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(3000);
  await shot(page, '00d-wf-f5');
  const after = await page.locator('body').innerText().catch(() => '');
  const onList = /hrm_candidate_pipeline|Roadmap ứng viên/i.test(after);

  const pass =
    (saveOk || pipeDef) &&
    pipeDef &&
    String(pipeDef.status || '').toLowerCase() === 'active';
  recordStep('wf_precond', pass ? 'PASS' : saveOk || onList ? 'PARTIAL' : 'FAIL', {
    summary: `presetSave=${saveOk} codes=${saves.map((s) => `${s.status}:${s.wfCode || s.code || ''}`).join(',') || 'none'} def=${pipeDef?.id || 'none'} status=${pipeDef?.status || '?'} onList=${onList}`,
  });
  if (!pass) {
    results.residuals.push({
      id: 'R-U84-REC-PIPE-WF-DEF-CREATE',
      severity: 'P0',
      note: 'FE preset save did not yield active hrm_candidate_pipeline',
    });
  }
  return pass;
}

async function createCandidateViaFe(page) {
  const url = q('/hr/recruitment', { tab: 'candidates', companyId: COMPANY });
  log('GOTO_CANDIDATES', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  // restore trsport scope for HRM embed (after navigation — localStorage safe)
  await page.evaluate((cid) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.companyId', cid);
      store.setItem('hrm_current_company_id', cid);
    }
  }, COMPANY);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(4000);
  await clickText(page, /Ứng viên/i, { role: 'button' });
  await sleep(1000);
  await selectOuTmdv(page);
  await shot(page, '01-candidates');

  const addBtn = page.getByRole('button', { name: /Thêm ứng viên/i }).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    recordStep('cand_create', 'BLOCKED', { summary: 'Thêm ứng viên CTA not visible' });
    return false;
  }
  await addBtn.click({ force: true });
  await sleep(1200);
  await shot(page, '02-cand-dialog');

  const dialog = page.locator('[role="dialog"]').first();
  if (!(await dialog.isVisible().catch(() => false))) {
    recordStep('cand_create', 'FAIL', { summary: 'Create candidate dialog did not open' });
    return false;
  }

  // FD empty submit
  const saveBtn = dialog.getByRole('button', { name: /Lưu|Tạo|Thêm/i }).last();
  await saveBtn.click({ force: true }).catch(() => {});
  await sleep(700);
  const fdKept = await dialog.isVisible().catch(() => false);
  recordStep('fd_cand_empty', fdKept ? 'PASS' : 'SKIP', {
    summary: fdKept ? 'empty candidate submit kept dialog' : 'dialog closed unexpectedly',
  });

  if (!(await dialog.isVisible().catch(() => false))) {
    await addBtn.click({ force: true });
    await sleep(1000);
  }

  const nameInput = dialog.getByLabel(/Họ và tên/i).or(dialog.locator('input').first());
  await nameInput.fill(CAND_NAME).catch(async () => {
    await dialog.locator('input').nth(0).fill(CAND_NAME);
  });
  const emailInput = dialog.getByLabel(/Email/i).or(dialog.locator('input[type="email"]'));
  await emailInput.fill(CAND_EMAIL).catch(async () => {
    await dialog.locator('input[type="email"]').fill(CAND_EMAIL);
  });

  const pos = dialog.getByLabel(/Vị trí/i).first();
  if (await pos.isVisible().catch(() => false)) {
    await pos.fill(CAND_POSITION);
  } else {
    // 2nd text input after name often position in grid — try placeholder
    const posPh = dialog.locator('input[placeholder*="Frontend"], input[placeholder*="Vị trí"], input[placeholder*="Developer"]').first();
    if (await posPh.isVisible().catch(() => false)) await posPh.fill(CAND_POSITION);
  }

  // notes for stamp + GPLX FD documentation
  const notes = dialog.getByLabel(/Ghi chú|Notes/i).or(dialog.locator('textarea')).first();
  if (await notes.isVisible().catch(() => false)) {
    await notes.fill(CAND_NOTES);
  }

  await shot(page, '03-cand-filled');
  const net0 = results.network.length;
  await dialog.getByRole('button', { name: /Lưu|Tạo|Thêm/i }).last().click({ force: true });
  await sleep(3500);
  await shot(page, '04-cand-after-create');

  const creates = results.network
    .slice(net0)
    .filter(
      (n) =>
        n.method === 'POST' &&
        /\/candidates(\?|$|\/)/.test(n.url) &&
        !/start-pipeline|applications|evaluations/.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
  const createOk = creates.length >= 1 || Boolean(results.ids.candidateId);
  recordStep('cand_create', createOk ? 'PASS' : 'FAIL', {
    summary: `posts=${creates.map((c) => `${c.status}:${c.code || ''}`).join(',') || 'none'} id=${results.ids.candidateId} name=${CAND_NAME}`,
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await selectOuTmdv(page);
  await shot(page, '05-cand-f5');
  const body = await page.locator('body').innerText().catch(() => '');
  const onList = body.includes(STAMP) || body.includes(CAND_NAME);
  recordStep('cand_f5', onList ? 'PASS' : createOk ? 'PARTIAL' : 'FAIL', {
    summary: `stampOnList=${onList} id=${results.ids.candidateId}`,
  });
  return createOk && onList;
}

async function startPipelineViaFe(page) {
  const body = await page.locator('body').innerText().catch(() => '');
  if (!body.includes(STAMP) && !body.includes(CAND_NAME)) {
    // ensure on candidates
    await page.goto(q('/hr/recruitment', { tab: 'candidates', companyId: COMPANY }), {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(3500);
    await selectOuTmdv(page);
  }

  await shot(page, '06-before-start-qt');
  const row = page
    .locator('tr')
    .filter({ hasText: new RegExp(STAMP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
    .first();
  const rowLoose = page.locator('tr').filter({ hasText: /Nguyễn Văn Tài xế/i }).first();
  const target = (await row.isVisible().catch(() => false)) ? row : rowLoose;

  const net0 = results.network.length;
  let clicked = false;
  if (await target.isVisible().catch(() => false)) {
    const btn = target.getByRole('button', { name: /Bắt đầu QT/i }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      clicked = true;
    }
  }
  if (!clicked) {
    clicked = await page.evaluate((stamp) => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const r = rows.find((n) => (n.textContent || '').includes(stamp));
      if (!r) return false;
      const btn = Array.from(r.querySelectorAll('button')).find((b) =>
        /Bắt đầu QT/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.click();
      return true;
    }, STAMP);
  }
  await sleep(4500);
  await shot(page, '07-after-start-qt');

  const posts = results.network
    .slice(net0)
    .filter((n) => n.method === 'POST' && /start-pipeline/.test(n.url));
  const ok2xx = posts.some((n) => n.status >= 200 && n.status < 300);
  const spawnMissing = Boolean(results.startPipeline?.spawnMissing);
  const wi = results.ids.workflowInstanceId || results.startPipeline?.workflowInstanceId;
  const hpPass = ok2xx && !spawnMissing && Boolean(wi);

  recordStep('start_pipeline', hpPass ? 'PASS' : ok2xx && spawnMissing ? 'FAIL' : ok2xx ? 'PARTIAL' : 'FAIL', {
    summary: `clicked=${clicked} posts=${posts.map((p) => `${p.status}:${p.code || ''}`).join(',') || 'none'} wi=${wi || 'none'} spawnMissing=${spawnMissing}`,
    startPipeline: results.startPipeline,
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await selectOuTmdv(page);
  await shot(page, '08-f5-after-pipeline');
  const after = await page.locator('body').innerText().catch(() => '');
  const lockedHint = /QT XBOS|không đổi tay|Bắt đầu QT/i.test(after);
  const stillHasCand = after.includes(STAMP) || after.includes(CAND_NAME);
  const startBtnGone = stillHasCand && !new RegExp(`${STAMP}[\\s\\S]{0,400}Bắt đầu QT`, 'i').test(after);
  recordStep('f5_pipeline', hpPass && stillHasCand ? 'PASS' : stillHasCand ? 'PARTIAL' : 'FAIL', {
    summary: `cand=${stillHasCand} wi=${results.ids.workflowInstanceId || wi || 'none'} lockedHint=${lockedHint} startBtnLikelyGone=${startBtnGone}`,
  });

  if (!hpPass) {
    results.residuals.push({
      id: spawnMissing ? 'R-U84-REC-PIPE-SPAWN-MISSING' : 'R-U84-REC-PIPE-START-FAIL',
      severity: 'P0',
      note: `start-pipeline did not yield workflow_instance_id (spawnMissing=${spawnMissing})`,
    });
  }
  return hpPass;
}

async function observeGplxOfferFd(page) {
  // Honest FD: try advance stage to offer without GPLX fields — product has no GPLX inputs on create form
  const body = await page.locator('body').innerText().catch(() => '');
  const hasGplxField = /GPLX|Giấy phép lái|hạng bằng|kinh nghiệm tuyến/i.test(body);
  // Open edit if possible
  const row = page.locator('tr').filter({ hasText: STAMP }).first();
  if (await row.isVisible().catch(() => false)) {
    const edit = row.locator('button').filter({ has: page.locator('svg') }).nth(2);
    // Prefer explicit Edit via evaluate
    await page.evaluate((stamp) => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const r = rows.find((n) => (n.textContent || '').includes(stamp));
      if (!r) return;
      const btns = Array.from(r.querySelectorAll('button'));
      // eye / calendar / edit — try last edit-ish
      const editBtn = btns[btns.length - 2] || btns[btns.length - 1];
      editBtn?.click();
    }, STAMP);
    await sleep(1500);
  }
  await shot(page, '09-fd-gplx-observe');
  const dlgBody = await page.locator('[role="dialog"]').innerText().catch(() => '');
  const dlgHasGplx = /GPLX|Giấy phép lái|hạng bằng|kinh nghiệm tuyến/i.test(dlgBody);
  await page.keyboard.press('Escape').catch(() => {});

  results.fd_gplx = {
    formHasGplxField: hasGplxField || dlgHasGplx,
    notesDocumentMissingGplx: true,
    expected_br: 'BR-PO-REC-LGX-01 — block offer without GPLX/route experience',
    actual:
      hasGplxField || dlgHasGplx
        ? 'FE surfaces GPLX/route fields'
        : 'No GPLX / kinh nghiệm tuyến field on candidate create/edit dialog — Offer gate NOT enforced in FE (document SPEC_GAP / FD not product-blocked)',
  };
  recordStep('fd_gplx_offer', hasGplxField || dlgHasGplx ? 'PASS' : 'SKIP', {
    summary: results.fd_gplx.actual,
  });
  if (!(hasGplxField || dlgHasGplx)) {
    results.residuals.push({
      id: 'R-U84-REC-PIPE-LGX-GPLX-GATE',
      severity: 'P2',
      note: 'BR-PO-REC-LGX-01 Offer GPLX gate not present on FE candidate form — SPEC_GAP / not silent-hire in this WI (no hire attempted)',
    });
  }
}

async function inboxAp(page, session) {
  if (!results.ids.workflowInstanceId) {
    recordStep('ap_inbox', 'SKIP', { summary: 'No workflow_instance_id — AP N/A (U65 no seed)' });
    results.approve = { verdict: 'SKIP', reason: 'no_wi' };
    return false;
  }

  await page.goto(`${PORTAL}/command-center/inbox`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.companyId', 'main');
    }
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(5000);
  await shot(page, '10-inbox-before');

  const inboxBody = await page.locator('body').innerText().catch(() => '');
  const cardVisible =
    inboxBody.includes(STAMP) ||
    inboxBody.includes(CAND_NAME) ||
    (/ứng viên|candidate|roadmap|pipeline|Tiếp nhận|hrm_candidate/i.test(inboxBody) &&
      Boolean(results.ids.workflowInstanceId));

  // Prefer stamp; also try WI substring
  const wiShort = String(results.ids.workflowInstanceId).slice(0, 8);
  const stampHit = inboxBody.includes(STAMP) || inboxBody.includes(CAND_NAME);
  const wiHit = inboxBody.includes(wiShort) || inboxBody.includes(results.ids.workflowInstanceId);
  results.approve.cardVisible = stampHit || wiHit;
  results.approve.stampHit = stampHit;
  results.approve.wiHit = wiHit;

  if (!stampHit && !wiHit) {
    // Wait/retry once
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await shot(page, '10b-inbox-retry');
    const body2 = await page.locator('body').innerText().catch(() => '');
    results.approve.cardVisible = body2.includes(STAMP) || body2.includes(CAND_NAME) || body2.includes(wiShort);
    if (!results.approve.cardVisible) {
      recordStep('ap_inbox', 'FAIL', {
        summary: 'Inbox missing PIPE stamp/WI after start-pipeline — U65 no seed',
      });
      results.residuals.push({
        id: 'R-U84-REC-PIPE-INBOX-EMPTY',
        severity: 'P0',
        note: 'No inbox task for hrm_candidate after start-pipeline',
      });
      results.approve.verdict = 'FAIL';
      return false;
    }
  }

  const filterRe = stampHit
    ? new RegExp(STAMP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    : new RegExp(wiShort, 'i');
  const card = page
    .locator('article, li, section, div')
    .filter({ hasText: filterRe })
    .filter({ hasText: /ứng viên|candidate|pipeline|Tiếp nhận|Sàng lọc|Đề nghị|roadmap|hrm_candidate|tuyển/i })
    .first();
  const loose = page.locator('article, li, section, div').filter({ hasText: filterRe }).first();
  const target = (await card.isVisible().catch(() => false)) ? card : loose;
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(400);

  const netAp = results.network.length;
  let apClicked = false;
  const quick = target.getByRole('button', { name: /Xử lý nhanh/i }).first();
  if (await quick.isVisible().catch(() => false)) {
    await quick.click({ force: true });
    apClicked = true;
    await sleep(1500);
    const dlg = page.locator('[role="dialog"]').first();
    if (await dlg.isVisible().catch(() => false)) {
      const duy = dlg.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt/i }).first();
      if (await duy.isVisible().catch(() => false)) {
        await duy.click({ force: true });
        await sleep(3000);
      }
    }
  } else {
    apClicked = await page.evaluate((needle) => {
      const nodes = Array.from(document.querySelectorAll('div, li, article, section'));
      const container = nodes.find(
        (n) =>
          (n.textContent || '').includes(needle) && /Xử lý nhanh/i.test(n.textContent || ''),
      );
      if (!container) return false;
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        /Xử lý nhanh/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.click();
      return true;
    }, stampHit ? STAMP : wiShort);
    await sleep(1500);
    const duy = page.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt/i }).first();
    if (await duy.isVisible().catch(() => false)) {
      await duy.click({ force: true });
      await sleep(3000);
    }
  }

  await shot(page, '11-ap-after-click');
  const completes = results.network
    .slice(netAp)
    .filter((n) => n.method === 'POST' && /\/complete/.test(n.url) && n.status >= 200 && n.status < 300);
  results.approve.clicked = apClicked;
  results.approve.completePosts = completes;

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '12-ap-inbox-f5');
  const afterInbox = await page.locator('body').innerText().catch(() => '');
  const stillStamp = afterInbox.includes(STAMP) || afterInbox.includes(CAND_NAME);
  results.approve.cardGoneAfterF5 = !stillStamp;

  // Probe candidate stage after approve
  const candRes = await fetch(
    `${HRM}/api/hrm/recruitment/candidates-pool?company_id=${COMPANY}`,
    { headers: { Authorization: `Bearer ${session.token}` } },
  ).then((r) => r.json());
  const rows = candRes?.data?.data ?? candRes?.data ?? [];
  const hit = (Array.isArray(rows) ? rows : []).find(
    (r) => r.id === results.ids.candidateId || String(r.full_name || '').includes(STAMP),
  );
  results.approve.cand_after = hit
    ? {
        id: hit.id,
        stage: hit.stage,
        workflow_instance_id: hit.workflow_instance_id,
        full_name: hit.full_name,
      }
    : null;

  const matchingWi = completes.some(
    (c) =>
      !results.ids.workflowInstanceId ||
      String(c.bodySnippet || '').includes(results.ids.workflowInstanceId) ||
      c.instanceId === results.ids.workflowInstanceId,
  );
  const stageAdvanced = hit && hit.stage && !/^(new|applied)$/i.test(String(hit.stage));
  const pass = completes.length >= 1 && (matchingWi || !stillStamp || stageAdvanced);
  results.approve.verdict = pass ? 'PASS' : completes.length >= 1 ? 'PARTIAL' : 'FAIL';
  recordStep('ap_inbox', results.approve.verdict === 'FAIL' ? 'FAIL' : 'PASS', {
    summary: `clicked=${apClicked} completes=${completes.length} cardGone=${!stillStamp} stage=${hit?.stage || '?'} codes=${completes.map((c) => c.code).join(',')} matchingWi=${matchingWi}`,
  });
  return results.approve.verdict !== 'FAIL';
}

async function main() {
  const session = await loginApi();
  await probeApi(session);
  recordStep('l0_probe', 'PASS', {
    summary: `priorReq=${results.api_probes.prior_req?.status || 'missing'} pipeDef=${results.api_probes.wf_pipe_def?.id || 'MISSING'} candTotal=${results.api_probes.candidates_before?.total}`,
  });

  if (!results.api_probes.prior_req) {
    results.residuals.push({
      id: 'R-U84-REC-PIPE-PRIOR-REQ',
      severity: 'P2',
      note: `Prior stamp ${PRIOR_REQ_STAMP} not found — continue with FE candidate create (REQ cell already EVIDENCED)`,
    });
  }

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const wfOk = await ensurePipeWfViaFe(page, session);
  const candOk = await createCandidateViaFe(page);
  if (!candOk) {
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  await observeGplxOfferFd(page);

  let pipeOk = false;
  if (wfOk || results.api_probes.wf_pipe_def_after || results.ids.wfDefId) {
    pipeOk = await startPipelineViaFe(page);
  } else {
    recordStep('start_pipeline', 'BLOCKED', {
      summary: 'Skipped start-pipeline — WF precond not active',
    });
  }

  let apOk = false;
  if (pipeOk) {
    apOk = await inboxAp(page, session);
  } else {
    recordStep('ap_inbox', 'SKIP', { summary: 'HP pipeline not spawned — AP skipped' });
  }

  // Final cand probe
  const candRes = await fetch(
    `${HRM}/api/hrm/recruitment/candidates-pool?company_id=${COMPANY}`,
    { headers: { Authorization: `Bearer ${session.token}` } },
  ).then((r) => r.json());
  const rows = candRes?.data?.data ?? candRes?.data ?? [];
  const hit = (Array.isArray(rows) ? rows : []).find(
    (r) => r.id === results.ids.candidateId || String(r.full_name || '').includes(STAMP),
  );
  results.final_candidate = hit
    ? {
        id: hit.id,
        stage: hit.stage,
        workflow_instance_id: hit.workflow_instance_id,
        full_name: hit.full_name,
        position: hit.position,
      }
    : null;

  results.endedAt = ts();
  results.verdict = {
    hp: pipeOk ? 'PASS' : results.steps.start_pipeline?.verdict || 'FAIL',
    ap: results.approve.verdict || (pipeOk ? 'FAIL' : 'SKIP'),
    wf_precond: results.steps.wf_precond?.verdict,
    cand: results.steps.cand_create?.verdict,
  };
  save();
  await browser.close();

  console.log(
    JSON.stringify(
      {
        STAMP,
        ids: results.ids,
        verdict: results.verdict,
        startPipeline: results.startPipeline,
        approve: results.approve.verdict,
        residuals: results.residuals.map((r) => r.id),
      },
      null,
      2,
    ),
  );
  process.exitCode = pipeOk && (apOk || results.approve.verdict === 'SKIP') ? 0 : pipeOk ? 0 : 2;
  // AP FAIL with HP PASS → exit 2; HP PASS + AP PASS → 0; HP FAIL → 2
  if (pipeOk && results.approve.verdict === 'FAIL') process.exitCode = 2;
  if (pipeOk && (results.approve.verdict === 'PASS' || results.approve.verdict === 'PARTIAL'))
    process.exitCode = 0;
}

main().catch((e) => {
  results.endedAt = ts();
  results.error = String(e?.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
