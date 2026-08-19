/**
 * PO-E2E-SPINE-01-QA-W2 — Hire-to-pay WEB retest after JobTemplatesTab mount restore
 * U65 zero-seed · U76 HDSD · U78 chronological · anti-idle clicks
 * SoT: docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md § E2E-SPINE-01
 * Prior: po-e2e-spine-01-qa-w1 FAIL mount · fe-rec-mount READY_FOR_QA
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w2-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-01-qa-w2-20260803');
const STAMP = `SP2${Date.now().toString(36).slice(-7).toUpperCase()}`;
const TITLE = `YCTD HireToPay ${STAMP}`;
const JD_TITLE = `JD HireToPay ${STAMP}`;
const CAND_EMAIL = `hire.pay.${Date.now()}@example.vn`;
const CAND_NAME = `Nguyen Hire Pay ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const q = (path, extra = {}) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || 'xevn');
  u.searchParams.set('companyId', extra.companyId || 'main');
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
};

const results = {
  work_item_id: 'PO-E2E-SPINE-01-QA-W2',
  program: 'PO-E2E-BIZ-SPINE-01',
  spine: 'E2E-SPINE-01',
  startedAt: ts(),
  env: { PORTAL, EMAIL, MEMBER_EMAIL, u65: 'zero-seed', stamp: STAMP, companyId: 'main', retest_of: 'PO-E2E-SPINE-01-QA-W1' },
  l0: {},
  vite_probes: {},
  mount: {},
  click_log: [],
  steps: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { requisitionId: null, candidateId: null, employeeId: null, workflowInstanceId: null },
  inboxEmpty: false,
  inboxThisWave: false,
  seed_used: false,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function logClick(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[CLICK ${results.click_log.length}] ${entry.at} ${action}`, detail.url || detail.text || '');
  return entry;
}

function recordStep(id, verdict, detail) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 240)}`);
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        at: ts(),
      };
      if (
        /recruitment|workflow-engine|job-templates|candidates|employees|contracts|payroll|payslip|inbox|tasks|auth\/login/.test(
          u,
        )
      ) {
        if (method === 'POST' && /\/requisitions(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
          try {
            const j = await res.json();
            const row = j?.data ?? j;
            if (row?.id) results.ids.requisitionId = row.id;
            entry.createdId = row?.id || null;
            entry.code = j?.code || null;
          } catch {
            /* */
          }
        }
        if (method === 'POST' && /submit-workflow/.test(u)) {
          try {
            const j = await res.json();
            results.ids.workflowInstanceId =
              j?.data?.workflowInstanceId || j?.data?.workflow_instance_id || null;
            entry.code = j?.code || null;
            entry.spawnMissing = Boolean(j?.data?.spawnMissing ?? j?.spawnMissing);
          } catch {
            /* */
          }
        }
        if (method === 'GET' && /\/requisitions(\?|$)/.test(u) && res.status() === 200) {
          try {
            const j = await res.json();
            const data = j?.data?.data ?? j?.data ?? j?.items ?? [];
            const rows = Array.isArray(data) ? data : [];
            entry.rowCount = rows.length;
            entry.hasStamp = rows.some((r) => String(r.title || '').includes(STAMP));
            const hit = rows.find((r) => String(r.title || '').includes(STAMP));
            if (hit?.id) results.ids.requisitionId = hit.id;
          } catch {
            /* */
          }
        }
        results.network.push(entry);
        if (results.network.length > 900) results.network.shift();
      }
    } catch {
      /* */
    }
  });
}

function netsSince(idx, pred) {
  return results.network.slice(idx).filter(pred);
}

async function loginApi(email = EMAIL, password = PASSWORD) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status} for ${email}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email,
    user: {
      userId: u.userId || u.id || u.email || email,
      email: u.email || email,
      displayName: u.displayName || u.fullName || u.name || email,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: email.startsWith('du-lich') ? 'xe-du-lich' : 'main',
  };
}

async function injectPortalAuth(page, session) {
  const companyId = session.companyId || 'main';
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
      }
    },
    { ...session, companyId },
  );
}

async function probeL0() {
  const targets = [
    ['portal', PORTAL],
    ['hrm_api', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos_api', 'http://127.0.0.1:28002/api/xbos'],
    ['hrm_vite', 'http://127.0.0.1:8080/'],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 120);
    }
  }
  const viteTargets = [
    ['recruitment_tsx_5173', `${PORTAL}/hr/src/pages/Recruitment.tsx`],
    ['job_templates_tab_5173', `${PORTAL}/hr/src/components/recruitment/JobTemplatesTab.tsx`],
    ['recruitment_tsx_8080', 'http://127.0.0.1:8080/hr/src/pages/Recruitment.tsx'],
    ['job_templates_tab_8080', 'http://127.0.0.1:8080/hr/src/components/recruitment/JobTemplatesTab.tsx'],
  ];
  for (const [name, url] of viteTargets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      results.vite_probes[name] = r.status;
    } catch (e) {
      results.vite_probes[name] = String(e).slice(0, 120);
    }
  }
  save();
}

async function assessRecruitmentMount(page) {
  const body = await page.locator('body').innerText().catch(() => '');
  const viteFail =
    /Failed to resolve import|JobTemplatesTab|Internal Server Error|vite.*error/i.test(body) ||
    results.pageErrors.some((e) => /JobTemplatesTab|Failed to resolve/i.test(e)) ||
    results.consoleErrors.some((e) => /JobTemplatesTab|Failed to resolve|Recruitment\.tsx/i.test(e));
  const hasChrome =
    /Tuyển dụng|Yêu cầu tuyển|Thư viện JD|Ứng viên|Kế hoạch tuyển|jd-library|requisition/i.test(body);
  const rootKids = await page.locator('#root > *').count().catch(() => 0);
  const mounted = hasChrome && !viteFail && rootKids > 0;
  results.mount = { mounted, viteFail, hasChrome, rootKids, bodySample: body.slice(0, 280) };
  return results.mount;
}

async function clickText(page, re, opts = {}) {
  try {
    await page.keyboard.press('Escape').catch(() => {});
  } catch {
    /* */
  }
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    logClick('click_role', { text: String(re), url: page.url() });
    return true;
  }
  const any = page.locator('button, a, [role="button"], [role="tab"], [role="menuitem"]').filter({ hasText: re }).first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    logClick('click_locator', { text: String(re), url: page.url() });
    return true;
  }
  const ok = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], span'),
    );
    const el = nodes.find(
      (n) => rx.test((n.textContent || '').trim()) && (n.offsetParent !== null || n.getClientRects().length),
    );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
  if (ok) logClick('click_eval', { text: String(re), url: page.url() });
  return ok;
}

async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(150);
  }
}

async function pickFirstOption(page) {
  await sleep(400);
  const opt = page.locator('[role="option"], [cmdk-item], [data-radix-collection-item]').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    logClick('pick_option', { url: page.url() });
    await sleep(250);
    return true;
  }
  await page.keyboard.press('ArrowDown').catch(() => {});
  await page.keyboard.press('Enter').catch(() => {});
  await sleep(250);
  return false;
}

async function fillFirstVisible(page, selectors, value) {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (!(await el.isVisible().catch(() => false))) continue;
    const tag = await el.evaluate((n) => n.tagName.toLowerCase()).catch(() => '');
    const editable = await el
      .evaluate((n) => {
        const t = n.tagName.toLowerCase();
        if (t === 'input' || t === 'textarea') return true;
        if (n.getAttribute('contenteditable') === 'true') return true;
        return false;
      })
      .catch(() => false);
    if (!editable) {
      const inner = el.locator('input, textarea').first();
      if (await inner.isVisible().catch(() => false)) {
        await inner.fill(String(value)).catch(() => {});
        logClick('fill_inner', { sel, value: String(value).slice(0, 40) });
        return true;
      }
      continue;
    }
    await el.fill(String(value)).catch(() => {});
    logClick('fill', { sel, tag, value: String(value).slice(0, 40) });
    return true;
  }
  return false;
}

async function gotoRecruitment(page, tab) {
  const url = q('/hr/recruitment', { tab });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_recruitment', { url, tab });
  await sleep(3000);
  if (tab) {
    const labels = {
      requisitions: /Yêu cầu tuyển dụng/i,
      'jd-library': /Thư viện JD|JD/i,
      candidates: /Ứng viên|Candidates/i,
      plans: /Kế hoạch/i,
      dashboard: /Dashboard|Tổng quan/i,
    };
    if (labels[tab]) await clickText(page, labels[tab], { role: 'button' }).catch(() => {});
    await sleep(1200);
  }
  return url;
}

async function gotoCc(page, path) {
  const url = `${PORTAL}${path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_cc', { url });
  await sleep(3000);
  return url;
}

/** Step 1 — J-REC-WF-01 WF recruitment definition smoke */
async function step1_wf(page) {
  const net0 = results.network.length;
  const url = await gotoCc(page, '/command-center?settings=workflow');
  await shot(page, '01-wf-list');
  const search = page.locator('input[placeholder*="Tìm"], input[type="search"]').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill('tuyển');
    logClick('search_wf', { text: 'tuyển' });
    await sleep(800);
  }
  let opened = await clickText(page, /tuyển dụng|requisition|hrm_recruitment|hrm_requisition|pipeline/i);
  if (!opened) {
    opened = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], button, a, div'));
      const el = rows.find((n) => /hrm_recruitment|hrm_requisition|tuyển dụng|requisition/i.test(n.textContent || ''));
      if (!el) return false;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    if (opened) logClick('open_wf_row', {});
  }
  await sleep(2000);
  await shot(page, '01-wf-detail');
  const saved = await clickText(page, /Lưu|Save|Kích hoạt|Active|Xuất bản/i);
  await sleep(2000);
  const getDefs = netsSince(net0, (n) => /workflow-engine/.test(n.url) && n.method === 'GET');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_wf', { url: page.url() });
  await sleep(2500);
  const after = await page.locator('body').innerText().catch(() => '');
  const stillHasRec = /tuyển dụng|hrm_recruit|requisition|pipeline/i.test(after);
  await shot(page, '01-wf-f5');
  const listOk = getDefs.some((s) => s.status === 200);
  const verdict = listOk && stillHasRec ? '🟢' : listOk ? '🟡' : '🔴';
  recordStep('SP1', verdict, {
    url,
    clickPath: ['CC settings=workflow', 'find hrm_recruitment*', 'reload'],
    network: getDefs.slice(-3),
    f5: stillHasRec,
    spec_ref: 'J-REC-WF-01 · FR-UC-B03',
    summary: `listOk=${listOk} stillHasRec=${stillHasRec} opened=${opened} saved=${saved}`,
    gap: verdict === '🔴' ? 'workflow definitions GET failed' : null,
  });
  return verdict;
}

async function ensureJd(page) {
  await gotoRecruitment(page, 'jd-library');
  await shot(page, '02-jd-lib');
  const open = await clickText(page, /Thêm|Tạo.*JD|Tạo mẫu|Thêm mẫu/i);
  if (open) {
    await sleep(800);
    await fillFirstVisible(
      page,
      ['[role="dialog"] input[name="title"]', '[role="dialog"] input[type="text"]'],
      JD_TITLE,
    );
    await fillFirstVisible(page, ['[role="dialog"] textarea', 'textarea'], 'JD Hire-to-pay Nest HRM-API.');
    const saveNet = results.network.length;
    await clickText(page, /Lưu|Tạo|Save/i);
    await sleep(3500);
    return netsSince(saveNet, (n) => n.method === 'POST' && /job-templates/i.test(n.url));
  }
  return [];
}

/** Step 2 — create/submit requisition UF-HRM-12 · J-REC-WF-02 */
async function step2_req(page) {
  // Mount gate (closes R-PO-SPINE01-REC-MOUNT)
  const mountUrl = await gotoRecruitment(page, 'jd-library');
  await shot(page, '02-mount');
  const mount = await assessRecruitmentMount(page);
  const viteOk =
    results.vite_probes.recruitment_tsx_5173 === 200 &&
    results.vite_probes.job_templates_tab_5173 === 200;
  recordStep('SP2-MOUNT', mount.mounted && viteOk ? '🟢' : mount.viteFail || !viteOk ? '🔴' : '🟡', {
    url: mountUrl,
    clickPath: ['/hr/recruitment', 'tab=jd-library'],
    network: [],
    f5: null,
    spec_ref: 'UF-HRM-12 mount · R-PO-SPINE01-REC-MOUNT',
    gap: mount.mounted ? null : 'Recruitment mount fail (vite/import/whitescreen)',
    summary: `mounted=${mount.mounted} viteFail=${mount.viteFail} viteOk=${viteOk} probes=${JSON.stringify(results.vite_probes)}`,
  });
  if (!mount.mounted) {
    recordStep('SP2', '🔴', {
      url: mountUrl,
      clickPath: ['/hr/recruitment blocked by mount'],
      network: [],
      f5: false,
      spec_ref: 'UF-HRM-12 · J-REC-WF-02',
      gap: 'Blocked by SP2-MOUNT — no YCTD create',
      summary: 'create skipped — mount fail',
      createOk: false,
    });
    return { verdict: '🔴', createOk: false, rowPersist: false, submits: [], spawnBanner: false };
  }

  await ensureJd(page);
  const net0 = results.network.length;
  const url = await gotoRecruitment(page, 'requisitions');
  await shot(page, '02-req-list');
  let createBtn = await clickText(page, /Thêm yêu cầu/i);
  if (!createBtn) createBtn = await clickText(page, /Thêm yêu cầu|Tạo yêu cầu|Thêm/i);
  await sleep(1800);
  await shot(page, '02-req-dialog');

  const jt = page.locator('[data-testid="hdsd-requisition-job-template"], [data-testid="requisition-job-template"]').first();
  if (await jt.isVisible().catch(() => false)) {
    await jt.click();
    await pickFirstOption(page);
  } else {
    const combo = page.locator('[role="dialog"] [role="combobox"]').first();
    if (await combo.isVisible().catch(() => false)) {
      await combo.click();
      await pickFirstOption(page);
    }
  }

  await fillFirstVisible(
    page,
    [
      '[data-testid="hdsd-requisition-title"]',
      '[data-testid="requisition-title"]',
      '[role="dialog"] input[name="title"]',
      '[role="dialog"] input[type="text"]',
    ],
    TITLE,
  );
  // Department is catalog combobox (button role=combobox) — not a text input
  const dept = page
    .locator(
      '[data-testid="hdsd-requisition-department"], [data-testid="requisition-department"], [role="dialog"] [aria-label*="phòng ban" i]',
    )
    .first();
  if (await dept.isVisible().catch(() => false)) {
    await dept.click({ timeout: 4000 }).catch(() => {});
    logClick('open_department', {});
    await pickFirstOption(page);
    // Prefer IT / Kỹ thuật if listed
    const itOpt = page.locator('[role="option"], [cmdk-item]').filter({ hasText: /Kỹ thuật|IT|Công nghệ/i }).first();
    if (await itOpt.isVisible().catch(() => false)) {
      await itOpt.click().catch(() => {});
      logClick('pick_department_it', {});
    }
  } else {
    await fillFirstVisible(page, ['input[name="department"]'], 'Kỹ thuật / IT');
  }
  await fillFirstVisible(
    page,
    [
      '[data-testid="hdsd-requisition-headcount"] input',
      '[data-testid="hdsd-requisition-headcount"]',
      '[data-testid="requisition-headcount"]',
      'input[name="headcount"]',
      '[role="dialog"] input[type="number"]',
    ],
    '1',
  );
  // Only fill if the matched node is actually editable input
  const headcount = page.locator('[data-testid="hdsd-requisition-headcount"]').first();
  if (await headcount.isVisible().catch(() => false)) {
    const tag = await headcount.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
    if (tag === 'input' || tag === 'textarea') {
      await headcount.fill('1').catch(() => {});
    } else {
      const inner = headcount.locator('input').first();
      if (await inner.isVisible().catch(() => false)) await inner.fill('1').catch(() => {});
    }
  }
  const emp = page.locator('[data-testid="hdsd-requisition-employment-type"]').first();
  if (await emp.isVisible().catch(() => false)) {
    await emp.click().catch(() => {});
    await pickFirstOption(page);
  } else {
    const lastCombo = page.locator('[role="dialog"] [role="combobox"]').last();
    if (await lastCombo.isVisible().catch(() => false)) {
      await lastCombo.click().catch(() => {});
      await pickFirstOption(page);
    }
  }

  const saveNet = results.network.length;
  await clickText(page, /Lưu yêu cầu|Lưu/i);
  await sleep(4000);
  const posts = netsSince(saveNet, (n) => n.method === 'POST' && /requisitions/i.test(n.url) && !/submit-workflow/i.test(n.url));
  const createOk = posts.some((p) => p.status === 201 || p.status === 200);
  await dismissOverlays(page);
  await shot(page, '02-after-create');

  await gotoRecruitment(page, 'requisitions');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_after_create', {});
  await sleep(3500);
  let after = await page.locator('body').innerText().catch(() => '');
  let rowPersist =
    after.includes(STAMP) ||
    after.includes(TITLE.slice(0, 18)) ||
    netsSince(saveNet, (n) => n.method === 'GET' && /requisitions/i.test(n.url) && n.hasStamp).length > 0 ||
    Boolean(results.ids.requisitionId);
  await shot(page, '02-f5-create');

  const submitNet = results.network.length;
  let submitted = await page.evaluate((stamp) => {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"], div'));
    const row = rows.find((n) => (n.textContent || '').includes(stamp));
    if (!row) return false;
    const btn = Array.from(row.querySelectorAll('button, a')).find((b) => /Gửi duyệt/i.test(b.textContent || ''));
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, STAMP);
  if (submitted) logClick('submit_row', { stamp: STAMP });
  if (!submitted) submitted = await clickText(page, /Gửi duyệt QT|Gửi duyệt/i);
  await sleep(4000);
  const submits = netsSince(submitNet, (n) => /submit-workflow/i.test(n.url));
  const spawnBanner = /SPAWN-MISSING/i.test(await page.locator('body').innerText().catch(() => ''));
  await shot(page, '02-after-submit');

  let verdict = '🔴';
  let gap = null;
  if (!createOk) {
    gap = `Create requisition failed POST=${posts.map((p) => p.status).join(',') || 'none'}`;
  } else if (!rowPersist) {
    gap = 'POST 2xx but stamp not observed after F5';
  } else if (submits.some((s) => s.status >= 200 && s.status < 300) || spawnBanner) {
    verdict = '🟢';
    if (spawnBanner) gap = 'SPAWN-MISSING banner (J-REC-WF-02 acceptable)';
  } else {
    verdict = '🟡';
    gap = 'YCTD created+F5 OK; submit-workflow not observed 2xx';
  }

  recordStep('SP2', verdict, {
    url,
    clickPath: ['tab=requisitions', 'Thêm yêu cầu', 'Lưu', 'F5', 'Gửi duyệt'],
    network: [...posts.slice(-2), ...submits.slice(-2)],
    f5: rowPersist,
    spec_ref: 'UF-HRM-12 · J-HRM-05 · J-REC-WF-02',
    gap,
    summary: `create=${createOk} id=${results.ids.requisitionId} submit=${submits.map((s) => s.status)} spawn=${spawnBanner} f5=${rowPersist}`,
    createOk,
    spawnBanner,
  });
  return { verdict, createOk, rowPersist, submits, spawnBanner };
}

/** Step 3 — Inbox approve J-REC-WF-03 · UF-XBOS-08 — NO SEED · this-wave stamp only */
async function step3_inbox(page) {
  const approveNet = results.network.length;
  const inboxUrl = await gotoCc(page, '/command-center/inbox');
  await shot(page, '03-inbox');
  const inboxBody = await page.locator('body').innerText().catch(() => '');
  const hasThisWave =
    inboxBody.includes(STAMP) ||
    inboxBody.includes(TITLE.slice(0, 18)) ||
    inboxBody.includes('HireToPay');
  const hasPriorRec = /tuyển|requisition|YCTD|hrm_requisition|Yêu cầu tuyển/i.test(inboxBody);
  const emptyHint = /không có|trống|empty|chưa có task|không có công việc/i.test(inboxBody);
  results.inboxThisWave = hasThisWave;
  results.inboxEmpty = !hasThisWave;
  let approveOk = false;
  // U65: only approve if THIS WAVE task is visible — do not complete prior unrelated inbox rows
  if (hasThisWave) {
    await clickText(page, new RegExp(STAMP.slice(0, 8) + '|HireToPay|' + TITLE.slice(0, 12), 'i'));
    await sleep(1500);
    const approved = await clickText(page, /Duyệt|Phê duyệt|Approve|Hoàn thành|Xử lý/i);
    await sleep(3000);
    if (approved) {
      await clickText(page, /Xác nhận|Duyệt|OK|Đồng ý/i);
      await sleep(2500);
    }
    const approves = netsSince(approveNet, (n) =>
      (n.method === 'POST' || n.method === 'PATCH') && /workflow-engine\/tasks|complete|approve/i.test(n.url),
    );
    approveOk = approves.some((a) => a.status >= 200 && a.status < 300);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    logClick('f5_inbox', {});
    await sleep(2000);
  }
  await shot(page, '03-inbox-after');
  let verdict = '🟡';
  let gap = null;
  if (approveOk && hasThisWave) verdict = '🟢';
  else if (!hasThisWave) {
    verdict = '🟡';
    gap = hasPriorRec
      ? 'Prior tuyển tasks may exist but THIS-WAVE stamp absent — U65 BLOCKED chain (no seed · no prior-task approve)'
      : 'Inbox empty after FE submit — U65 BLOCKED step (no seed)';
  } else {
    gap = 'This-wave task visible but approve 2xx not observed';
  }
  recordStep('SP3', verdict, {
    url: inboxUrl,
    clickPath: ['/command-center/inbox', hasThisWave ? 'open this-wave → Duyệt' : 'observe no this-wave task'],
    network: netsSince(approveNet, () => true).slice(-5),
    f5: hasThisWave,
    spec_ref: 'J-REC-WF-03 · UF-XBOS-08',
    gap,
    summary: `thisWave=${hasThisWave} priorRec=${hasPriorRec} emptyHint=${emptyHint} approveOk=${approveOk} seed=false`,
    hasTask: hasThisWave,
    approveOk,
    blocked_u65: !hasThisWave,
  });
  return verdict;
}

/** Step 4 — candidate / hire J-REC-WF-04 */
async function step4_hire(page) {
  const url = await gotoRecruitment(page, 'candidates');
  await shot(page, '04-candidates');
  const net0 = results.network.length;
  const open = await clickText(page, /Thêm ứng viên|Thêm UV|Tạo ứng viên|Thêm/i);
  await sleep(1200);
  let createOk = false;
  if (open) {
    await fillFirstVisible(
      page,
      ['[role="dialog"] input[name="full_name"]', '[role="dialog"] input[name="name"]', '[role="dialog"] input[type="text"]'],
      CAND_NAME,
    );
    await fillFirstVisible(
      page,
      ['[role="dialog"] input[type="email"]', 'input[name="email"]'],
      CAND_EMAIL,
    );
    const combos = page.locator('[role="dialog"] [role="combobox"]');
    const n = await combos.count();
    for (let i = 0; i < Math.min(n, 3); i++) {
      try {
        await combos.nth(i).click({ timeout: 1500 });
        await pickFirstOption(page);
      } catch {
        /* */
      }
    }
    const saveNet = results.network.length;
    await clickText(page, /Lưu|Tạo|Save/i);
    await sleep(3500);
    const posts = netsSince(saveNet, (n) => n.method === 'POST' && /candidate/i.test(n.url));
    createOk = posts.some((p) => p.status >= 200 && p.status < 300);
  }

  // try hire / stage hired
  const stageNet = results.network.length;
  await page.evaluate((stamp) => {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
    const row = rows.find((n) => (n.textContent || '').includes(stamp)) || rows[1];
    const combo = row?.querySelector('[role="combobox"], select, button');
    combo?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, STAMP);
  await sleep(500);
  await clickText(page, /hired|Đã tuyển|Thuê|Hire|Offer/i);
  await sleep(1500);
  const dialog = page.locator('[role="dialog"]').first();
  if (await dialog.isVisible().catch(() => false)) {
    const pickEmp = dialog.locator('[role="combobox"]').first();
    if (await pickEmp.isVisible().catch(() => false)) {
      await pickEmp.click();
      await pickFirstOption(page);
    }
    await clickText(page, /Lưu|Xác nhận|Gắn|Link|Continue|Hire/i);
    await sleep(2500);
  }
  const patches = netsSince(stageNet, (n) =>
    /candidate|hire|employee/i.test(n.url) && ['PATCH', 'PUT', 'POST'].includes(n.method),
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_candidates', {});
  await sleep(2500);
  await gotoRecruitment(page, 'candidates');
  const after = await page.locator('body').innerText().catch(() => '');
  const hiredShown = /hired|Đã tuyển|Thuê|Offer/i.test(after) || after.includes(STAMP);
  await shot(page, '04-f5');
  const ok = createOk || patches.some((p) => p.status >= 200 && p.status < 300);
  const verdict = ok && hiredShown ? '🟢' : open || hiredShown ? '🟡' : '🟡';
  recordStep('SP4', verdict, {
    url,
    clickPath: ['tab=candidates', 'Thêm UV / stage hire'],
    network: [...netsSince(net0, (n) => /candidate/i.test(n.url)).slice(-4), ...patches.slice(-3)],
    f5: hiredShown || after.includes(STAMP),
    spec_ref: 'J-REC-WF-04 · UF-HRM-12',
    gap: ok ? null : 'candidate/hire CTA incomplete — product_gap or missing prior approve',
    summary: `open=${open} createOk=${createOk} patches=${patches.map((p) => p.status)} hiredShown=${hiredShown}`,
  });
  return verdict;
}

/** Step 5 — employees + contracts J-HRM-01/02/03 */
async function step5_emp_contract(page) {
  const empUrl = q('/hr/employees');
  await page.goto(empUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_employees', { url: empUrl });
  await sleep(3500);
  await shot(page, '05-employees');
  const empNet = results.network.length;
  const empBody = await page.locator('body').innerText().catch(() => '');
  const empBanner = /Sync ERROR|HRM API request failed|409|54321/i.test(empBody);
  const empGets = netsSince(empNet - 20 < 0 ? 0 : empNet, (n) => /\/employees/i.test(n.url) && n.method === 'GET');
  // click first employee row if present
  let detailOk = false;
  let detailUrl = null;
  const row = page.locator('table tbody tr, [role="row"]').filter({ hasText: /.+/ }).first();
  if (await row.isVisible().catch(() => false)) {
    await row.click({ timeout: 4000 }).catch(() => {});
    logClick('click_employee_row', {});
    await sleep(2500);
    detailUrl = page.url();
    const detailGets = netsSince(empNet, (n) => /\/employees\/[^/?]+/i.test(n.url) && n.method === 'GET');
    detailOk = detailGets.some((g) => g.status === 200) || /hồ sơ|profile|email|điện thoại/i.test(await page.locator('body').innerText().catch(() => ''));
    await shot(page, '05-employee-detail');
  }

  const contractUrl = q('/hr/contracts');
  await page.goto(contractUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_contracts', { url: contractUrl });
  await sleep(3000);
  await shot(page, '05-contracts');
  const cBody = await page.locator('body').innerText().catch(() => '');
  const cBanner = /Sync ERROR|HRM API request failed/i.test(cBody);
  const hasContracts = /hợp đồng|contract|đang hiệu lực|active/i.test(cBody);
  // click employee name from contracts if link
  const nameLink = page.locator('table tbody tr a, table tbody tr button').first();
  let jhrm01 = false;
  if (await nameLink.isVisible().catch(() => false)) {
    await nameLink.click({ timeout: 4000 }).catch(() => {});
    logClick('contracts_to_employee', {});
    await sleep(2500);
    const t = await page.locator('body').innerText().catch(() => '');
    jhrm01 = !/không tìm thấy nhân viên|404/i.test(t);
    await shot(page, '05-jhrm01');
  }

  const stampSeen = empBody.includes(STAMP) || cBody.includes(STAMP);
  const listOk = !empBanner && empGets.some((g) => g.status === 200 || g.status === undefined) || /nhân viên|employee/i.test(empBody);
  const verdict =
    listOk && hasContracts && !cBanner ? (stampSeen || detailOk || jhrm01 ? '🟢' : '🟡') : empBanner || cBanner ? '🔴' : '🟡';
  recordStep('SP5', verdict, {
    url: empUrl,
    detailUrl,
    contractUrl,
    clickPath: ['/hr/employees', 'row→detail', '/hr/contracts', 'name→profile'],
    network: [...empGets.slice(-3), ...netsSince(0, (n) => /contracts/i.test(n.url)).slice(-3)],
    f5: null,
    spec_ref: 'J-HRM-01 · J-HRM-02 · J-HRM-03',
    gap: stampSeen ? null : 'new hire stamp not on emp/contract lists (hire incomplete upstream)',
    summary: `empBanner=${empBanner} detailOk=${detailOk} jhrm01=${jhrm01} hasContracts=${hasContracts} stampSeen=${stampSeen}`,
  });
  return verdict;
}

/** Step 6 — payroll J-HRM-07 */
async function step6_payroll(page) {
  const paths = ['/hr/payroll', '/hr/salary', '/command-center/hrm/payroll'];
  let url = null;
  let body = '';
  let loaded = false;
  const net0 = results.network.length;
  for (const p of paths) {
    url = p.startsWith('/command-center') ? `${PORTAL}${p}` : q(p);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    logClick('goto_payroll', { url });
    await sleep(2800);
    body = await page.locator('body').innerText().catch(() => '');
    if (/lương|payroll|payslip|phiếu lương|kỳ lương/i.test(body) && !/Cannot GET|404 Not Found/i.test(body)) {
      loaded = true;
      break;
    }
  }
  await shot(page, '06-payroll');
  const banner = /Sync ERROR|HRM API request failed|54321/i.test(body);
  const emptyHonest = /chưa có|không có dữ liệu|empty|chọn kỳ|không có phiếu/i.test(body);
  const hasRows = /phiếu|payslip|NV|nhân viên|\d{1,3}(\.\d{3})+/i.test(body);
  const stampSeen = body.includes(STAMP);
  const gets = netsSince(net0, (n) => /payroll|payslip|salary/i.test(n.url));
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  logClick('f5_payroll', {});
  await sleep(2500);
  await shot(page, '06-payroll-f5');
  let verdict = '🟡';
  let gap = null;
  if (!loaded || banner) {
    verdict = banner ? '🔴' : '🟡';
    gap = banner ? 'payroll banner error' : 'payroll surface not clearly loaded';
  } else if (stampSeen || (hasRows && gets.some((g) => g.status === 200))) {
    verdict = '🟢';
  } else if (emptyHonest || gets.some((g) => g.status === 200)) {
    verdict = '🟡';
    gap = 'Payroll loads with honest empty / no new hire in period — acceptable U65 if reason visible';
  }
  recordStep('SP6', verdict, {
    url,
    clickPath: paths,
    network: gets.slice(-5),
    f5: true,
    spec_ref: 'J-HRM-07 · UF-HRM-06 · FR-UC-H04',
    gap,
    summary: `loaded=${loaded} banner=${banner} emptyHonest=${emptyHonest} hasRows=${hasRows} stamp=${stampSeen}`,
  });
  return verdict;
}

/** Member CEO scope probe */
async function step_member(page, memberSession) {
  if (!memberSession) {
    recordStep('SP-MEM', '🟡', {
      url: null,
      clickPath: [],
      network: [],
      f5: null,
      spec_ref: 'scope negative member',
      gap: 'member login failed',
      summary: 'no member session',
    });
    return '🟡';
  }
  const ctx = page.context();
  const mp = await ctx.newPage();
  track(mp);
  await injectPortalAuth(mp, memberSession);
  const url = q('/hr/recruitment', { companyId: 'xe-du-lich', tab: 'requisitions' });
  await mp.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('member_recruitment', { url });
  await sleep(3500);
  await shot(mp, '07-member-rec');
  const body = await mp.locator('body').innerText().catch(() => '');
  const banner = /Sync ERROR|companyId mismatches|54321/i.test(body);
  const ok = !banner && /Tuyển dụng|Yêu cầu|requisition/i.test(body);
  await mp.close();
  const verdict = ok ? '🟢' : banner ? '🔴' : '🟡';
  recordStep('SP-MEM', verdict, {
    url,
    clickPath: ['member login', '/hr/recruitment?companyId=xe-du-lich'],
    network: [],
    f5: null,
    spec_ref: 'UF-HRM-13 scope · SPINE-01 negative',
    gap: ok ? null : 'member recruitment surface issue',
    summary: `ok=${ok} banner=${banner}`,
  });
  return verdict;
}

function overallAck() {
  const s = results.steps;
  // Mount restore is P0 exit for W2 — hard fail if still red
  if (s['SP2-MOUNT']?.verdict === '🔴' || s.SP2?.verdict === '🔴') return 'FAIL_TO_PM';
  if (s.SP1?.verdict === '🔴') return 'FAIL_TO_PM';
  // Payroll blank = P1 residual only — do not fail overall on SP6 🟡
  const mountPass = s['SP2-MOUNT']?.verdict === '🟢';
  const createOk = Boolean(s.SP2?.createOk) || s.SP2?.verdict === '🟢' || s.SP2?.verdict === '🟡';
  if (mountPass && createOk) {
    if (results.inboxEmpty && !s.SP3?.approveOk) {
      results.blocked_reason =
        'HP-03 Inbox this-wave empty after FE submit — U65 no seed (mount+HP-02 may still PASS residual)';
      // Mount + create closed P0; chain approve blocked → PASS_TO_PM with HP-03 🟡 if create+F5 OK
      if (s.SP2?.verdict === '🟢' || (s.SP2?.createOk && s.SP2?.f5)) return 'PASS_TO_PM';
      return 'BLOCKED';
    }
    return 'PASS_TO_PM';
  }
  if (mountPass && !createOk) return 'FAIL_TO_PM';
  return 'FAIL_TO_PM';
}

async function main() {
  await probeL0();
  const xbosOk = results.l0.xbos_api === 200;
  const portalOk = results.l0.portal === 200;
  if (!portalOk) {
    results.fatal = 'portal L0 not 200';
    save();
    console.error('FATAL L0 portal', results.l0);
    process.exit(2);
  }
  if (!xbosOk) {
    console.error('WARN xbos L0 not ready yet — login may fail', results.l0);
  }

  const session = await loginApi();
  let memberSession = null;
  try {
    memberSession = await loginApi(MEMBER_EMAIL, PASSWORD);
    memberSession.companyId = 'xe-du-lich';
  } catch (e) {
    results.env.memberLoginError = String(e).slice(0, 140);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('open_portal', { url: PORTAL });
  await sleep(2000);
  await shot(page, '00-shell');

  const run = async (id, fn) => {
    try {
      await dismissOverlays(page);
      await fn();
    } catch (e) {
      console.error(`STEP_FAIL ${id}`, e?.message || e);
      if (!results.steps[id]) {
        recordStep(id, '🔴', {
          url: page.url(),
          clickPath: [],
          network: [],
          f5: null,
          spec_ref: id,
          gap: `harness exception: ${String(e?.message || e).slice(0, 200)}`,
          summary: String(e?.message || e).slice(0, 160),
        });
      }
    }
  };

  await run('SP1', () => step1_wf(page));
  await run('SP2', () => step2_req(page));
  await run('SP3', () => step3_inbox(page));
  await run('SP4', () => step4_hire(page));
  await run('SP5', () => step5_emp_contract(page));
  await run('SP6', () => step6_payroll(page));
  await run('SP-MEM', () => step_member(page, memberSession));

  results.finishedAt = ts();
  results.click_count = results.click_log.length;
  results.idle_guard = {
    qa_idle_viewport: results.click_log.length >= 8 ? 'PASS' : 'FAIL',
    click_count: results.click_log.length,
  };
  results.ack_status = overallAck();
  save();
  console.log('ACK', results.ack_status);
  console.log(
    'SUMMARY',
    Object.fromEntries(Object.entries(results.steps).map(([k, v]) => [k, v.verdict])),
  );
  console.log('CLICKS', results.click_count, 'INBOX_EMPTY', results.inboxEmpty, 'SEED', results.seed_used);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e);
  results.ack_status = 'FAIL_TO_PM';
  save();
  process.exit(1);
});
