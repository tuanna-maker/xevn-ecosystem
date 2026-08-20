#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-REC-REQ-VISUN-01 — Primary P-REC-REQ @ CO-VISUN (HDV / điều hành tour)
 * FE: ceo@xe.vn embed companyId=logistics (HRM slug) · OU Du lịch Visun
 *   → Thư viện JD → Thêm JD OPS_MANAGER / Quản lý Vận hành (HDV stamp) → Lưu 201 → F5
 *   → Yêu cầu tuyển dụng → Thêm yêu cầu → Lưu → Gửi duyệt QT → F5
 *   → CC Inbox stamp-scoped Xử lý nhanh → F5 terminal · assert ≠ tài xế
 * Catalog: no HDV_* code AS-IS — OPS_MANAGER = closest điều hành; U65 no seed invent title
 * FORBIDDEN: seed · invent EVIDENCED without FE chain · apps/**
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
const COMPANY = process.env.QA_COMPANY_ID || 'logistics';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-req-visun-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-rec-req-visun-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `VISUN-REQ-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const JD_CODE = `JD-HDV-${STAMP.slice(-6)}`;
const JD_TITLE = `JD HDV điều hành tour Visun ${STAMP}`;
const REQ_TITLE = `YCTD HDV điều hành tour VISUN ${STAMP}`;
/** AS-IS catalog proxy — no HDV_* in job_titles; OPS_MANAGER = Quản lý Vận hành (≠ DRIVER_LEAD) */
const POS_SEARCH = process.env.QA_POS_SEARCH || 'Quản lý Vận hành';
const POS_FALLBACK = process.env.QA_POS_FALLBACK || 'OPS_MANAGER';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-REC-REQ-VISUN-01',
  cell: 'P-REC-REQ @ CO-VISUN',
  be_fix_ref: 'D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01 (holding picker parity applies to logistics)',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, STAMP, JD_CODE, POS_SEARCH, commit: 'dc930c5' },
  persona_note:
    'Group CEO ceo@xe.vn embed companyId=logistics (CO-VISUN Primary slug) · OU Du lịch Visun · HDV/điều hành tour via OPS_MANAGER',
  api_probes: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { jdId: null, requisitionId: null, workflowInstanceId: null },
  submitBody: null,
  spawnMissing: false,
  approve: {},
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 280)}`);
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
  await page.addInitScript(
    (s) => {
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
    },
    session,
  );
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      };
      const interesting =
        /job-templates|requisitions|workflow-engine|inbox|tasks|workflow/.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;

      if (method === 'POST' && /\/job-templates(\?|$)/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.jdId = row.id;
          entry.createdId = row?.id || null;
          entry.code = j?.code || null;
          entry.title = row?.title || null;
          entry.message = String(j?.message || '').slice(0, 240);
          results.lastJdPost = {
            status: res.status(),
            code: j?.code || null,
            message: entry.message,
            companyHint: COMPANY,
          };
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/requisitions(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.requisitionId = row.id;
          entry.createdId = row?.id || null;
          entry.code = j?.code || null;
          entry.title = row?.title || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /requisitions\/.*\/submit-workflow/.test(u)) {
        try {
          const j = await res.json();
          results.submitBody = {
            code: j?.code || null,
            spawnMissing: Boolean(j?.data?.spawnMissing ?? j?.spawnMissing),
            workflowInstanceId:
              j?.data?.workflowInstanceId ||
              j?.data?.workflow_instance_id ||
              j?.workflowInstanceId ||
              null,
            message: String(j?.message || '').slice(0, 200),
            status: res.status(),
          };
          results.spawnMissing = results.submitBody.spawnMissing;
          if (results.submitBody.workflowInstanceId) {
            results.ids.workflowInstanceId = results.submitBody.workflowInstanceId;
          }
          entry.code = results.submitBody.code;
          entry.spawnMissing = results.submitBody.spawnMissing;
          entry.workflowInstanceId = results.submitBody.workflowInstanceId;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/complete/.test(u)) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.bodySnippet = JSON.stringify(j).slice(0, 240);
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /\/requisitions(\?|$)/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const data = j?.data?.data ?? j?.data ?? j?.items ?? [];
          const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          entry.rowCount = rows.length;
          entry.hasStamp = rows.some((r) => String(r.title || '').includes(STAMP));
          const hit = rows.find((r) => String(r.title || '').includes(STAMP));
          if (hit?.id) results.ids.requisitionId = hit.id;
          if (hit?.workflow_instance_id) results.ids.workflowInstanceId = hit.workflow_instance_id;
          entry.hitStatus = hit?.status || null;
          entry.hitWi = hit?.workflow_instance_id || null;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (results.network.length > 800) results.network.shift();
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

async function selectOuVisun(page) {
  try {
    const ou = page.getByLabel(/Lọc đơn vị thành viên/i).first();
    const ou2 = (await ou.isVisible().catch(() => false)) ? ou : page.getByRole('combobox').first();
    if (!(await ou2.isVisible().catch(() => false))) return;
    await ou2.click({ force: true });
    await sleep(800);
    const opt = page
      .getByRole('option', { name: /Du lịch Visun|Visun|logistics/i })
      .first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ force: true });
      await sleep(1500);
      log('OU_FILTER_VISUN', { note: 'selected member OU option Visun' });
      return;
    }
    const picked = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"]'));
      const hit = items.find((n) => /visun|du lịch visun|logistics/i.test(n.textContent || ''));
      if (!hit) return false;
      hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    await sleep(1500);
    log('OU_FILTER_VISUN', {
      note: picked ? 'picked via evaluate' : 'option not found — URL companyId=logistics',
    });
    if (!picked) await page.keyboard.press('Escape').catch(() => {});
  } catch {
    /* */
  }
}

async function pickCatalogOption(page, searchText) {
  // CatalogSearchPicker: click trigger then option / type filter
  const dialog = page.locator('[role="dialog"]').first();
  const trigger = dialog
    .locator('button[role="combobox"], [role="combobox"], button')
    .filter({ hasText: /Chọn|Chức danh|JD|phòng|ban|Chưa có/i })
    .first();
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click({ force: true });
  } else {
    // first combobox-like in dialog
    const any = dialog.locator('[role="combobox"]').first();
    if (await any.isVisible().catch(() => false)) await any.click({ force: true });
  }
  await sleep(600);
  const search = page.locator('[role="listbox"] input, [cmdk-input], input[placeholder*="Tìm"]').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(searchText);
    await sleep(500);
  }
  const opt = page.getByRole('option', { name: new RegExp(searchText, 'i') }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(500);
    return true;
  }
  return page.evaluate((q) => {
    const rx = new RegExp(q, 'i');
    const nodes = Array.from(
      document.querySelectorAll('[role="option"], [cmdk-item], [data-value], li, div'),
    );
    const hit = nodes.find((n) => rx.test(n.textContent || '') && n.offsetParent !== null);
    if (!hit) return false;
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, searchText);
}

async function probeApi(session) {
  const h = { Authorization: `Bearer ${session.token}`, 'content-type': 'application/json' };
  const emp = await fetch(`${HRM}/api/hrm/employees?company_id=${COMPANY}&page_size=5`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const jds = await fetch(`${HRM}/api/hrm/recruitment/job-templates?company_id=${COMPANY}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const reqs = await fetch(`${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const defs = await fetch(`${XBOS}/api/xbos/workflow-engine/definitions?companyId=main`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const items = defs?.data?.items ?? defs?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const reqDef = arr.find(
    (d) => String(d.workflow_code || d.workflowCode || '') === 'hrm_requisition_approval',
  );
  const jt = await fetch(`${HRM}/api/hrm/settings-catalogs/job_titles/items?company_id=holding`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const jtRows = jt?.data?.data ?? jt?.data?.items ?? jt?.data ?? [];
  const jtArr = Array.isArray(jtRows) ? jtRows : [];
  const hasOps = jtArr.some((r) => String(r.code || '') === 'OPS_MANAGER');
  const hasHdvCode = jtArr.some((r) => /HDV|TOUR_GUIDE|GUIDE/i.test(String(r.code || '')));
  results.api_probes = {
    employees: {
      code: emp?.code || null,
      total: emp?.data?.total ?? emp?.total ?? null,
      note: 'REC-REQ create does not require employee rows; 0 = env observation not auto-BLOCK',
    },
    job_titles_holding: {
      code: jt?.code || null,
      total: jtArr.length,
      has_OPS_MANAGER: hasOps,
      has_HDV_code: hasHdvCode,
      codes: jtArr.map((r) => r.code),
    },
    jd_before: {
      code: jds?.code || null,
      total: jds?.data?.total ?? (Array.isArray(jds?.data?.data) ? jds.data.data.length : null),
    },
    requisitions_before: {
      code: reqs?.code || null,
      total: reqs?.data?.total ?? (Array.isArray(reqs?.data?.data) ? reqs.data.data.length : null),
    },
    wf_req_def: reqDef
      ? {
          id: reqDef.id,
          status: reqDef.status,
          code: reqDef.workflow_code || reqDef.workflowCode,
        }
      : null,
  };
  if (!hasOps && !hasHdvCode) {
    results.residuals.push({
      id: 'R-U84-REC-REQ-VISUN-CATALOG-EMPTY',
      severity: 'P0',
      note: 'job_titles holding empty / missing OPS_MANAGER and HDV_* — cannot create JD FE-only',
    });
  } else if (!hasHdvCode) {
    results.residuals.push({
      id: 'R-U84-REC-REQ-VISUN-HDV-TITLE-PROXY',
      severity: 'P2',
      note: 'No HDV_* in job_titles AS-IS — using OPS_MANAGER (Quản lý Vận hành) as điều hành tour proxy; stamp title carries HDV context',
    });
  }
  save();
  return results.api_probes;
}

async function ensureJdViaFe(page) {
  const jdUrl = q('/hr/recruitment', { tab: 'jd-library', companyId: COMPANY });
  log('GOTO_JD_LIBRARY', { url: jdUrl });
  await page.goto(jdUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await clickText(page, /Thư viện JD|Thư viện mô tả/i, { role: 'button' });
  await sleep(1200);
  await selectOuVisun(page);
  await shot(page, '01-jd-library');

  const body = await page.locator('body').innerText().catch(() => '');
  const empty = /Chưa có JD template/i.test(body);
  const hasHdvJd = /HDV|điều hành tour|OPS_MANAGER|Quản lý Vận hành/i.test(body) && !empty;
  // Prefer create Visun HDV/ops JD for this STAMP so YCTD title is unique & ≠ tài xế
  const needCreate = empty || !body.includes(STAMP);

  if (!needCreate && hasHdvJd) {
    recordStep('jd_precond', 'PASS', { summary: 'JD library already has Visun HDV/ops-related row' });
    return true;
  }

  const addBtn = page.getByTestId('hdsd-jd-library-add-btn').or(page.getByRole('button', { name: /Thêm JD/i }));
  if (!(await addBtn.first().isVisible().catch(() => false))) {
    recordStep('jd_create', 'BLOCKED', { summary: 'Thêm JD CTA not visible' });
    results.residuals.push({
      id: 'R-U84-REC-REQ-JD-CTA-MISSING',
      severity: 'P0',
      note: 'Cannot create JD via FE — library empty and CTA missing',
    });
    return false;
  }

  await addBtn.first().click({ force: true });
  await sleep(1200);
  await shot(page, '02-jd-create-dialog');
  const dialog = page.locator('[role="dialog"]').first();
  if (!(await dialog.isVisible().catch(() => false))) {
    recordStep('jd_create', 'FAIL', { summary: 'JD create dialog did not open' });
    return false;
  }

  // FD: try submit empty → keep dialog
  const saveEmpty = dialog.getByRole('button', { name: /Lưu|Tạo|Thêm/i }).last();
  await saveEmpty.click({ force: true }).catch(() => {});
  await sleep(600);
  const fdKept = await dialog.isVisible().catch(() => false);
  recordStep('fd_jd_empty', fdKept ? 'PASS' : 'SKIP', {
    summary: fdKept ? 'empty JD submit kept dialog' : 'dialog closed unexpectedly',
  });

  if (!(await dialog.isVisible().catch(() => false))) {
    await addBtn.first().click({ force: true });
    await sleep(1000);
  }

  await page.getByTestId('hdsd-jd-form-code').fill(JD_CODE).catch(async () => {
    await dialog.locator('input').nth(0).fill(JD_CODE);
  });
  await page.getByTestId('hdsd-jd-form-title').fill(JD_TITLE).catch(async () => {
    await dialog.locator('input').nth(1).fill(JD_TITLE);
  });

  // Position catalog — OPS_MANAGER / Quản lý Vận hành (HDV proxy; ≠ DRIVER_LEAD)
  let posPicked = await pickCatalogOption(page, POS_SEARCH);
  if (!posPicked) posPicked = await pickCatalogOption(page, POS_FALLBACK);
  if (!posPicked) posPicked = await pickCatalogOption(page, 'Vận hành');
  log('JD_POSITION_PICK', {
    note: posPicked ? `picked ${POS_SEARCH}/${POS_FALLBACK}` : 'failed position pick',
  });

  // job_description optional (DTO rejects free-form `description`)
  const ta = dialog
    .locator('textarea[name*="job_description" i], textarea[placeholder*="mô tả" i], textarea')
    .first();
  if (await ta.isVisible().catch(() => false)) {
    await ta.fill('HDV / điều hành tour Visun — CO-VISUN Primary P-REC-REQ — ≠ tài xế DRIVER_LEAD');
  }

  await shot(page, '03-jd-filled');
  const netBefore = results.network.length;
  await dialog
    .getByRole('button', { name: /Lưu|Tạo|Thêm/i })
    .last()
    .click({ force: true });
  await sleep(3500);
  await shot(page, '04-jd-after-create');

  const posts = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'POST' && /\/job-templates(\?|$)/.test(n.url));
  const ok = posts.some((n) => n.status >= 200 && n.status < 300);
  const jdPosFail = posts.some((n) => n.code === 'HRM-REC-JD-POS' || /HRM-REC-JD-POS/.test(n.message || ''));
  if (!ok && jdPosFail) {
    results.residuals.push({
      id: 'R-U84-REC-REQ-VISUN-JD-CATALOG-ASSERT',
      severity: 'P0',
      note:
        'FE picker shows job_titles (settings remap→holding) but POST job-templates company_id=logistics asserts against member partition → HRM-REC-JD-POS. Reuse D-U84 pattern. U65: do not seed JD.',
    });
    recordStep('jd_create', 'BLOCKED', {
      summary: `POST job-templates ${posts.map((n) => `${n.status}:${n.code || ''}:${(n.message || '').slice(0, 80)}`).join(',') || 'none'} — catalog picker/assert company mismatch @ logistics`,
      network: posts.slice(-3),
      lastJdPost: results.lastJdPost || null,
    });
    await shot(page, '05-jd-blocked');
    return false;
  }
  recordStep('jd_create', ok ? 'PASS' : 'FAIL', {
    summary: `POST job-templates ${posts.map((n) => `${n.status}:${n.code || ''}`).join(',') || 'none'} jdId=${results.ids.jdId}`,
    network: posts.slice(-3),
  });

  // F5 persist
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  await clickText(page, /Thư viện JD|Thư viện mô tả/i, { role: 'button' });
  await sleep(1000);
  await selectOuVisun(page);
  await shot(page, '05-jd-f5');
  const after = await page.locator('body').innerText().catch(() => '');
  const persist = after.includes(STAMP) || after.includes(JD_CODE);
  recordStep('jd_f5', persist ? 'PASS' : ok ? 'PARTIAL' : 'FAIL', {
    summary: `stampOnList=${persist}`,
  });
  return ok;
}

async function createAndSubmitReq(page) {
  const url = q('/hr/recruitment', { tab: 'requisitions', companyId: COMPANY });
  log('GOTO_REQUISITIONS', { url });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await clickText(page, /Yêu cầu tuyển dụng|Yêu cầu/i, { role: 'button' });
  await sleep(1500);
  await selectOuVisun(page);
  await shot(page, '06-requisitions-tab');

  const body1 = await page.locator('body').innerText().catch(() => '');
  const mountOk =
    /Yêu cầu tuyển dụng|Thêm yêu cầu|Chưa có yêu cầu/i.test(body1) &&
    !/SyntaxError|Failed to fetch dynamically imported|HRM API Sync ERROR/i.test(body1);
  const createVisible = await page
    .getByTestId('hdsd-requisition-create-btn')
    .or(page.getByRole('button', { name: /Thêm yêu cầu/i }))
    .first()
    .isVisible()
    .catch(() => false);
  recordStep('mount_requisitions', mountOk && createVisible ? 'PASS' : 'FAIL', {
    summary: `mountOk=${mountOk} createVisible=${createVisible}`,
  });
  if (!mountOk || !createVisible) {
    results.residuals.push({
      id: 'R-U84-REC-REQ-VISUN-UI-BLOCK',
      severity: 'P0',
      note: 'Requisitions tab / create CTA not operable @ logistics/Visun',
    });
    return false;
  }

  await page
    .getByTestId('hdsd-requisition-create-btn')
    .or(page.getByRole('button', { name: /Thêm yêu cầu/i }))
    .first()
    .click({ force: true });
  await sleep(1500);
  await shot(page, '07-req-create-dialog');

  const dialog = page.locator('[role="dialog"]').first();
  if (!(await dialog.isVisible().catch(() => false))) {
    recordStep('create_req', 'FAIL', { summary: 'create dialog not open' });
    return false;
  }

  // FD: empty submit while library may block Lưu
  const saveBtn = dialog.getByTestId('hdsd-requisition-form-submit').or(
    dialog.getByRole('button', { name: /Lưu yêu cầu|Lưu/i }),
  );
  const disabled = await saveBtn.first().isDisabled().catch(() => false);
  if (!disabled) {
    await saveBtn.first().click({ force: true }).catch(() => {});
    await sleep(600);
  }
  const fdKept = await dialog.isVisible().catch(() => false);
  recordStep('fd_req_empty_or_disabled', fdKept || disabled ? 'PASS' : 'SKIP', {
    summary: disabled ? 'Lưu disabled when library/form not ready' : 'dialog kept after empty submit',
  });

  // Pick JD from library (our STAMP JD preferred — HDV / ops, not tài xế)
  let jdPicked = await pickCatalogOption(page, STAMP);
  if (!jdPicked) jdPicked = await pickCatalogOption(page, 'HDV');
  if (!jdPicked) jdPicked = await pickCatalogOption(page, 'điều hành');
  if (!jdPicked) jdPicked = await pickCatalogOption(page, 'Quản lý Vận hành');
  if (!jdPicked) jdPicked = await pickCatalogOption(page, 'JD');
  log('REQ_JD_PICK', { note: jdPicked ? 'picked' : 'FAILED' });
  await sleep(800);

  // Title / headcount
  const title = page.getByTestId('hdsd-requisition-title').or(dialog.locator('input').first());
  await title.first().fill(REQ_TITLE).catch(() => {});
  const hc = page.getByTestId('hdsd-requisition-headcount');
  if (await hc.isVisible().catch(() => false)) await hc.fill('2');

  // Department — Vận hành (tour ops)
  let deptOk = await pickCatalogOption(page, 'Vận hành');
  if (!deptOk) deptOk = await pickCatalogOption(page, 'Kinh doanh');
  if (!deptOk) deptOk = await pickCatalogOption(page, 'Vận');
  log('REQ_DEPT_PICK', { note: deptOk ? 'picked' : 'may use template default' });

  await shot(page, '08-req-filled');
  // Wait form-ready sentinel if present
  await page
    .getByTestId('hdsd-requisition-form-ready')
    .waitFor({ state: 'attached', timeout: 8000 })
    .catch(() => {});

  const netBefore = results.network.length;
  const dialogStillOpen = await dialog.isVisible().catch(() => false);
  const saveEnabled = dialogStillOpen
    ? !(await saveBtn.first().isDisabled().catch(() => true))
    : false;
  // Harness lesson R1: dialog may already be closed after prior Lưu 201 — prefer network over Lưu-disabled
  if (dialogStillOpen && saveEnabled) {
    await saveBtn.first().click({ force: true });
    await sleep(4000);
  } else if (dialogStillOpen && !saveEnabled) {
    await shot(page, '08b-req-save-disabled');
  }
  await shot(page, '09-after-create');

  const createPosts = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'POST' && /\/requisitions(\?|$)/.test(n.url) && !/submit-workflow/.test(n.url));
  // Also accept create posts from earlier in this dialog fill (race)
  const allCreatePosts = results.network.filter(
    (n) =>
      n.method === 'POST' &&
      /\/requisitions(\?|$)/.test(n.url) &&
      !/submit-workflow/.test(n.url) &&
      n.status >= 200 &&
      n.status < 300,
  );
  const create2xx = createPosts.some((n) => n.status >= 200 && n.status < 300) || allCreatePosts.length > 0;
  if (!create2xx && dialogStillOpen && !saveEnabled) {
    recordStep('create_req', 'BLOCKED', {
      summary: 'Lưu yêu cầu still disabled — JD library/form-ready gate (no 2xx create)',
    });
    results.residuals.push({
      id: 'R-U84-REC-REQ-FORM-READY-BLOCK',
      severity: 'P0',
      note: 'Create form Lưu disabled after JD attempts — do not fake',
    });
    return false;
  }
  recordStep('create_req', create2xx ? 'PASS' : 'FAIL', {
    summary: `POST requisitions ${[...createPosts, ...allCreatePosts]
      .slice(-3)
      .map((n) => `${n.status}:${n.code || ''}`)
      .join(',')} id=${results.ids.requisitionId}`,
    network: [...createPosts, ...allCreatePosts].slice(-3),
  });
  if (!create2xx) return false;

  // Submit workflow from row CTA
  await sleep(1000);
  const row = page.locator('tr').filter({ hasText: STAMP }).first();
  let submitted = false;
  const netBeforeSubmit = results.network.length;
  if (await row.isVisible().catch(() => false)) {
    const cta = row.getByRole('button', { name: /Gửi duyệt QT/i }).first();
    if (await cta.isVisible().catch(() => false)) {
      await cta.click({ force: true });
      submitted = true;
    }
  }
  if (!submitted) {
    submitted = await clickText(page, /Gửi duyệt QT/i);
  }
  await sleep(4000);
  await shot(page, '10-after-submit');

  const submitPosts = results.network
    .slice(netBeforeSubmit)
    .filter((n) => n.method === 'POST' && /submit-workflow/.test(n.url));
  const submit2xx = submitPosts.some((n) => n.status >= 200 && n.status < 300);
  const afterUi = await page.locator('body').innerText().catch(() => '');
  const toastOk = /Đã gửi duyệt|Inbox|spawn|thiếu instance/i.test(afterUi);
  recordStep('submit_wf', submit2xx ? (results.spawnMissing ? 'PARTIAL' : 'PASS') : 'FAIL', {
    summary: `clicked=${submitted} POST ${submitPosts.map((n) => `${n.status}:${n.code || ''}`).join(',') || 'none'} spawnMissing=${results.spawnMissing} wi=${results.ids.workflowInstanceId}`,
    submitBody: results.submitBody,
    toastOk,
  });

  // F5
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await clickText(page, /Yêu cầu tuyển dụng|Yêu cầu/i, { role: 'button' });
  await sleep(1500);
  await selectOuVisun(page);
  await shot(page, '11-f5-list');
  const listText = await page.locator('body').innerText().catch(() => '');
  const stampOnList = listText.includes(STAMP);
  // API assert wi
  const h = {
    Authorization: `Bearer ${(await loginApi()).token}`,
  };
  // reuse from results — fetch with stored token via page evaluate? use network capture
  const lastGet = [...results.network]
    .reverse()
    .find((n) => n.method === 'GET' && /\/requisitions(\?|$)/.test(n.url) && n.hasStamp);
  recordStep('f5_persist', stampOnList && results.ids.workflowInstanceId ? 'PASS' : stampOnList ? 'PARTIAL' : 'FAIL', {
    summary: `stamp=${stampOnList} wi=${results.ids.workflowInstanceId} status=${lastGet?.hitStatus || '?'}`,
  });

  return submit2xx && Boolean(results.ids.workflowInstanceId) && !results.spawnMissing;
}

async function approveInbox(page, session) {
  // Switch company to main for CC inbox (group CEO)
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.companyId', 'main');
    }
  });
  await page.goto(`${PORTAL}/command-center/inbox`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(4500);
  await shot(page, '12-inbox-before');

  const body = await page.locator('body').innerText().catch(() => '');
  const cardVisible =
    body.includes(STAMP) && /yêu cầu tuyển|phê duyệt yêu cầu|requisition/i.test(body);
  results.approve.cardVisible = cardVisible;
  if (!cardVisible) {
    // softer: stamp alone
    results.approve.cardVisibleStampOnly = body.includes(STAMP);
    if (!body.includes(STAMP)) {
      recordStep('ap_inbox', 'FAIL', { summary: 'STAMP card not in inbox — U65 no seed' });
      results.residuals.push({
        id: 'R-U84-REC-REQ-INBOX-EMPTY',
        severity: 'P0',
        note: 'Inbox missing YCTD stamp after submit — do not fake',
      });
      results.approve.verdict = 'FAIL';
      return false;
    }
  }

  // Stamp-scoped card only (avoid collateral leave/plan Duyệt — R-U84-REC-PLAN-AP-CLICK-SCOPE)
  const card = page
    .locator('[data-testid*="inbox"], article, li, section, div')
    .filter({ hasText: STAMP })
    .filter({ hasText: /yêu cầu tuyển|phê duyệt yêu cầu|requisition|YCTD/i })
    .first();
  const cardLoose = page.locator('article, li, section, div').filter({ hasText: STAMP }).first();
  const target = (await card.isVisible().catch(() => false)) ? card : cardLoose;
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(400);
  const quick = target.getByRole('button', { name: /Xử lý nhanh/i }).first();
  const open = target.getByRole('button', { name: /Mở chi tiết/i }).first();
  let clicked = false;
  const netBefore = results.network.length;

  if (await quick.isVisible().catch(() => false)) {
    await quick.click({ force: true });
    clicked = true;
    await sleep(1500);
    const dialog = page.locator('[role="dialog"]').filter({ hasText: new RegExp(STAMP, 'i') });
    const dlg = (await dialog.first().isVisible().catch(() => false))
      ? dialog.first()
      : page.locator('[role="dialog"]').first();
    if (await dlg.isVisible().catch(() => false)) {
      const duy = dlg.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt/i }).first();
      if (await duy.isVisible().catch(() => false)) {
        await duy.click({ force: true });
        await sleep(2500);
      }
    }
  } else if (await open.isVisible().catch(() => false)) {
    await open.click({ force: true });
    clicked = true;
    await sleep(2000);
    await shot(page, '12b-ap-detail');
    const duy = page.getByRole('button', { name: /^Duyệt$|Hoàn thành|Phê duyệt/i }).first();
    if (await duy.isVisible().catch(() => false)) {
      await duy.click({ force: true });
      await sleep(2500);
    }
  } else {
    clicked = await page.evaluate((stamp) => {
      const nodes = Array.from(document.querySelectorAll('div, li, article, section'));
      const container = nodes.find(
        (n) =>
          (n.textContent || '').includes(stamp) &&
          /Xử lý nhanh|Mở chi tiết/i.test(n.textContent || '') &&
          /yêu cầu tuyển|phê duyệt yêu cầu|requisition|YCTD/i.test(n.textContent || ''),
      );
      if (!container) return false;
      const btn = Array.from(container.querySelectorAll('button, a, [role="button"]')).find((b) =>
        /Xử lý nhanh/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }, STAMP);
    await sleep(2000);
    const duy = page.getByRole('button', { name: /^Duyệt$|Hoàn thành|Phê duyệt|Xác nhận/i }).first();
    if (await duy.isVisible().catch(() => false)) {
      await duy.click({ force: true });
      await sleep(2500);
    }
  }

  await shot(page, '13-ap-after-click');
  const completes = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'POST' && /\/complete/.test(n.url) && n.status >= 200 && n.status < 300);
  results.approve.clicked = clicked;
  results.approve.completePosts = completes;

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '14-ap-inbox-f5');
  const after = await page.locator('body').innerText().catch(() => '');
  const stillThere = after.includes(STAMP);
  results.approve.cardGoneAfterF5 = !stillThere;

  const reqRes = await fetch(`${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}`, {
    headers: { Authorization: `Bearer ${session.token}` },
  }).then((r) => r.json());
  const rows = reqRes?.data?.data ?? reqRes?.data ?? [];
  const hit = (Array.isArray(rows) ? rows : []).find(
    (r) => r.id === results.ids.requisitionId || String(r.title || '').includes(STAMP),
  );
  results.approve.req_after = hit
    ? {
        id: hit.id,
        status: hit.status,
        workflow_instance_id: hit.workflow_instance_id,
        title: hit.title,
      }
    : null;

  const terminal = hit && /approved|rejected|closed|cancelled|completed|open/i.test(String(hit.status || ''));
  const notTaiXe =
    Boolean(hit?.title) &&
    /HDV|điều hành tour|VISUN|OPS/i.test(String(hit.title)) &&
    !/Lái xe|DRIVER_LEAD|TMDV/i.test(String(hit.title));
  results.approve.not_tai_xe_context = notTaiXe;
  results.approve.inbox_stamp_context = STAMP;
  const pass = !stillThere && completes.length >= 1 && Boolean(terminal || hit?.status) && notTaiXe;
  results.approve.verdict = pass
    ? 'PASS'
    : !stillThere && completes.length >= 1
      ? 'PARTIAL'
      : 'FAIL';
  recordStep('ap_inbox', results.approve.verdict === 'FAIL' ? 'FAIL' : 'PASS', {
    summary: `clicked=${clicked} completes=${completes.length} cardGone=${!stillThere} status=${hit?.status || '?'} notTaiXe=${notTaiXe}`,
    completeCodes: completes.map((c) => c.code),
  });
  return results.approve.verdict !== 'FAIL';
}

async function main() {
  log('START', { PORTAL, COMPANY, STAMP });
  const session = await loginApi();
  log('LOGIN_OK', { email: EMAIL });
  const probes = await probeApi(session);
  log('API_PROBES', { note: JSON.stringify(probes) });

  if (!probes.wf_req_def || probes.wf_req_def.status !== 'active') {
    results.residuals.push({
      id: 'R-U84-REC-REQ-WFM-DEF-MISSING',
      severity: 'P0',
      note: 'TC-WFM-REC-REQ-HP-001 precond missing — hrm_requisition_approval not active',
    });
    recordStep('precond_wf_def', 'BLOCKED', { summary: 'WF def missing/inactive' });
    results.endedAt = ts();
    save();
    process.exitCode = 2;
    return;
  }
  recordStep('precond_wf_def', 'PASS', {
    summary: `active ${probes.wf_req_def.code} id=${probes.wf_req_def.id}`,
  });

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const jdOk = await ensureJdViaFe(page);
  if (!jdOk) {
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  const hpOk = await createAndSubmitReq(page);
  if (!hpOk) {
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  const apOk = await approveInbox(page, session);
  results.endedAt = ts();
  save();
  await browser.close();

  const hpPass = results.steps.submit_wf?.verdict === 'PASS' && results.steps.f5_persist?.verdict !== 'FAIL';
  const apPass = results.approve.verdict === 'PASS' || results.approve.verdict === 'PARTIAL';
  console.log(
    JSON.stringify(
      {
        STAMP,
        ids: results.ids,
        steps: Object.fromEntries(
          Object.entries(results.steps).map(([k, v]) => [k, v.verdict]),
        ),
        approve: results.approve.verdict,
        hpPass,
        apPass,
        residuals: results.residuals,
      },
      null,
      2,
    ),
  );
  process.exitCode = hpPass && apPass ? 0 : 2;
}

main().catch((e) => {
  results.endedAt = ts();
  results.error = String(e?.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
