#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-REC-PLAN-TMDV-01 — P-REC-PLAN @ CO-TMDV (U65 · U76 · U78)
 * FE: ceo@xe.vn embed companyId=trsport → Tuyển dụng → Kế hoạch → Tạo → Gửi duyệt QT → F5
 * Optional AP: CC Inbox Duyệt if card appears without seed
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
const COMPANY = process.env.QA_COMPANY_ID || 'trsport';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-plan-tmdv-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-rec-plan-tmdv-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `TMDV-PLAN-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TITLE = `KH Tuyển Lái xe Vận hành TMDV ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-REC-PLAN-TMDV-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, STAMP, commit: 'dc930c5' },
  persona_note: 'Group CEO ceo@xe.vn with company switch/embed companyId=trsport (CO-TMDV Primary slug)',
  api_probes: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { planId: null, workflowInstanceId: null },
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 260)}`);
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
        if (s.raw?.defaultMembershipId) store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
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
        /recruitment-plans|workflow-engine|inbox|tasks|workflow/.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;
      if (method === 'POST' && /\/recruitment-plans(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.planId = row.id;
          entry.createdId = row?.id || null;
          entry.createdTitle = row?.title || null;
          entry.code = j?.code || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /recruitment-plans\/.*\/submit-workflow/.test(u)) {
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
      if (method === 'GET' && /\/recruitment-plans(\?|$)/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const data = j?.data?.data ?? j?.data ?? j?.items ?? [];
          const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          entry.rowCount = rows.length;
          entry.hasStamp = rows.some((r) => String(r.title || '').includes(STAMP));
          const hit = rows.find((r) => String(r.title || '').includes(STAMP));
          if (hit?.id) results.ids.planId = hit.id;
          if (hit?.workflow_instance_id) results.ids.workflowInstanceId = hit.workflow_instance_id;
          entry.hitStatus = hit?.status || null;
          entry.hitWi = hit?.workflow_instance_id || null;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (results.network.length > 700) results.network.shift();
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

async function probeApi(session) {
  const h = { Authorization: `Bearer ${session.token}`, 'content-type': 'application/json' };
  const emp = await fetch(`${HRM}/api/hrm/employees?company_id=${COMPANY}&page_size=5`, { headers: h }).then(
    (r) => r.json().catch(() => ({})),
  );
  const plans = await fetch(`${HRM}/api/hrm/recruitment/recruitment-plans?company_id=${COMPANY}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const defs = await fetch(`${XBOS}/api/xbos/workflow-engine/definitions?companyId=main`, { headers: h }).then(
    (r) => r.json().catch(() => ({})),
  );
  const items = defs?.data?.items ?? defs?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const planDef = arr.find((d) => String(d.workflow_code || d.workflowCode || '') === 'hrm_recruitment_plan_approval');
  results.api_probes = {
    employees: {
      code: emp?.code || null,
      total: emp?.data?.total ?? emp?.total ?? (Array.isArray(emp?.data) ? emp.data.length : null),
    },
    plans_before: {
      code: plans?.code || null,
      total: plans?.data?.total ?? (Array.isArray(plans?.data?.data) ? plans.data.data.length : Array.isArray(plans?.data) ? plans.data.length : null),
    },
    wf_plan_def: planDef
      ? { id: planDef.id, status: planDef.status, code: planDef.workflow_code || planDef.workflowCode }
      : null,
  };
  save();
  return results.api_probes;
}

async function main() {
  log('START', { PORTAL, COMPANY, STAMP });
  const session = await loginApi();
  log('LOGIN_OK', { email: EMAIL });
  const probes = await probeApi(session);
  log('API_PROBES', { note: JSON.stringify(probes) });

  if (!probes.wf_plan_def || probes.wf_plan_def.status !== 'active') {
    results.residuals.push({
      id: 'R-U84-REC-PLAN-WFM-DEF-MISSING',
      severity: 'P0',
      note: 'TC-WFM-REC-PLAN-HP-001 precond missing — hrm_recruitment_plan_approval not active',
    });
    recordStep('precond_wf_def', 'BLOCKED', { summary: 'WF def missing/inactive' });
  } else {
    recordStep('precond_wf_def', 'PASS', {
      summary: `active ${probes.wf_plan_def.code} id=${probes.wf_plan_def.id}`,
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

  // --- Mount plans tab ---
  const plansUrl = q('/hr/recruitment', { tab: 'plans', companyId: COMPANY });
  log('GOTO_PLANS', { url: plansUrl });
  await page.goto(plansUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await clickText(page, /Kế hoạch/i, { role: 'button' });
  await sleep(1500);
  // Prefer CO-TMDV operating unit in embed filter (not rollup-all) for honest Primary cell scope
  try {
    const ou = page.getByLabel(/Lọc đơn vị thành viên/i).first();
    const ou2 = (await ou.isVisible().catch(() => false)) ? ou : page.getByRole('combobox').first();
    if (await ou2.isVisible().catch(() => false)) {
      await ou2.click({ force: true });
      await sleep(800);
      const opt = page
        .getByRole('option', { name: /Thương mại và Dịch vụ|Thương mại|trsport/i })
        .first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click({ force: true });
        await sleep(1500);
        log('OU_FILTER_TMDV', { note: 'selected member OU option' });
      } else {
        // SelectItem value=trsport via evaluate if label encoding differs
        const picked = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('[role="option"]'));
          const hit = items.find((n) => /thương mại|trsport|tmdv|dịch vụ x\.e/i.test(n.textContent || ''));
          if (!hit) return false;
          hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return true;
        });
        await sleep(1500);
        log('OU_FILTER_TMDV', { note: picked ? 'picked via evaluate' : 'option not found — URL companyId=trsport' });
        if (!picked) await page.keyboard.press('Escape').catch(() => {});
      }
    }
  } catch {
    /* */
  }
  await shot(page, '01-plans-tab');
  const body1 = await page.locator('body').innerText().catch(() => '');
  const mountOk =
    /Kế hoạch|Tạo kế hoạch|Chưa có kế hoạch|recruitmentPlans|Tuyển dụng/i.test(body1) &&
    !/SyntaxError|Failed to fetch dynamically imported|HRM API Sync ERROR/i.test(body1);
  const createVisible = await page.getByRole('button', { name: /Tạo kế hoạch/i }).first().isVisible().catch(() => false);
  recordStep('mount_plans', mountOk ? 'PASS' : 'FAIL', {
    summary: `mountOk=${mountOk} createVisible=${createVisible} rootLen=${body1.length}`,
    createVisible,
  });
  if (!mountOk || !createVisible) {
    results.residuals.push({
      id: 'R-U84-REC-PLAN-TMDV-UI-BLOCK',
      severity: 'P0',
      note: 'Plans tab / create CTA not operable',
    });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  // --- Fail-deep optional: open dialog, try submit empty title ---
  await clickText(page, /Tạo kế hoạch/i);
  await sleep(1200);
  await shot(page, '02-create-dialog');
  const dialog = page.locator('[role="dialog"]').first();
  const dialogOpen = await dialog.isVisible().catch(() => false);
  let fdBlocked = false;
  if (dialogOpen) {
    const submitBtn = dialog.getByRole('button', { name: /^Tạo kế hoạch$/i }).last();
    await submitBtn.click({ force: true }).catch(() => {});
    await sleep(800);
    const msg = await dialog.innerText().catch(() => '');
    fdBlocked = /bắt buộc|required|tiêu đề/i.test(msg) || (await dialog.isVisible().catch(() => false));
    recordStep('fd_empty_title', fdBlocked ? 'PASS' : 'SKIP', {
      summary: fdBlocked ? 'validation kept dialog / required hint' : 'no clear validation text (optional)',
    });
  } else {
    recordStep('fd_empty_title', 'SKIP', { summary: 'dialog did not open for FD' });
  }

  // --- Fill create form (logistics hiring) ---
  if (!(await dialog.isVisible().catch(() => false))) {
    await clickText(page, /Tạo kế hoạch/i);
    await sleep(1000);
  }
  const titleInput = page
    .locator('[role="dialog"] input')
    .filter({ has: page.locator('xpath=..') })
    .first();
  // Prefer labeled title field
  const titled = page.locator('[role="dialog"] input[placeholder*="Kế hoạch"], [role="dialog"] input').first();
  await titled.fill(TITLE).catch(async () => {
    await page.locator('[role="dialog"] input').nth(0).fill(TITLE);
  });
  // Set department / position names + headcount ns
  const deptInput = page.locator('[role="dialog"] input[placeholder*="phòng"], [role="dialog"] input[placeholder*="Phòng"], [role="dialog"] input').nth(1);
  // Find inputs by value defaults
  await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;
    const inputs = Array.from(dialog.querySelectorAll('input'));
    for (const inp of inputs) {
      const ph = (inp.getAttribute('placeholder') || '').toLowerCase();
      const val = (inp.value || '').toLowerCase();
      if (ph.includes('phòng') || val.includes('kinh doanh') && !val.includes('nhân')) {
        inp.focus();
        inp.value = '';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
  // Fill by placeholder / known defaults
  const dept = page.locator('[role="dialog"] input').filter({ hasText: '' });
  const allInputs = page.locator('[role="dialog"] input:not([type="number"]):not([type="hidden"])');
  const count = await allInputs.count();
  for (let i = 0; i < count; i++) {
    const el = allInputs.nth(i);
    const ph = (await el.getAttribute('placeholder').catch(() => '')) || '';
    const val = (await el.inputValue().catch(() => '')) || '';
    if (/tiêu đề|kế hoạch tuyển/i.test(ph) || i === 0) {
      if (!val.includes(STAMP)) await el.fill(TITLE);
      continue;
    }
    if (/phòng|department/i.test(ph) || /Phòng Kinh doanh/i.test(val)) {
      await el.fill('Phòng Vận hành Logistics');
      continue;
    }
    if (/vị trí|position|chức danh/i.test(ph) || /Nhân viên kinh doanh/i.test(val)) {
      await el.fill('Lái xe / Vận hành');
      continue;
    }
  }
  // Set first month ns > 0
  const numInputs = page.locator('[role="dialog"] input[type="number"]');
  const nCount = await numInputs.count();
  if (nCount > 0) {
    await numInputs.nth(0).fill('2');
  }
  await shot(page, '03-create-filled');
  log('CREATE_FILL', { title: TITLE, nums: nCount });

  const netBeforeCreate = results.network.length;
  await page
    .locator('[role="dialog"]')
    .getByRole('button', { name: /^Tạo kế hoạch$/i })
    .last()
    .click({ force: true })
    .catch(() => clickText(page, /^Tạo kế hoạch$/i));
  await sleep(3500);
  await shot(page, '04-after-create');

  const createPosts = results.network
    .slice(netBeforeCreate)
    .filter((n) => n.method === 'POST' && /\/recruitment-plans(\?|$)/.test(n.url) && !/submit-workflow/.test(n.url));
  const create2xx = createPosts.some((n) => n.status >= 200 && n.status < 300);
  recordStep('create_plan', create2xx ? 'PASS' : 'FAIL', {
    summary: `POST plans ${createPosts.map((n) => `${n.status}:${n.code || ''}`).join(',') || 'none'} planId=${results.ids.planId}`,
    network: createPosts.slice(-3),
  });

  // Open detail via Eye on the stamped row (row text click alone may not setSelectedPlan)
  await sleep(1000);
  async function openPlanDetail() {
    const row = page.locator('tr').filter({ hasText: STAMP }).first();
    if (await row.isVisible().catch(() => false)) {
      const eye = row.locator('button').last();
      if (await eye.isVisible().catch(() => false)) {
        await eye.click({ force: true });
        await sleep(1500);
      } else {
        await row.click({ force: true });
        await sleep(1500);
      }
    } else {
      await page.evaluate((stamp) => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const el = rows.find((n) => (n.textContent || '').includes(stamp));
        if (!el) return;
        const btn = el.querySelector('button');
        (btn || el).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }, STAMP);
      await sleep(1500);
    }
    // detail header often shows period / Gửi duyệt / Quay lại
    const text = await page.locator('body').innerText().catch(() => '');
    return /Gửi duyệt QT|Quay lại|Chi tiết|T1–T12|headcount|Phòng Vận hành/i.test(text) && text.includes(STAMP);
  }
  let opened = await openPlanDetail();
  if (!opened) {
    // retry: click title cell
    await page.locator('td', { hasText: STAMP }).first().click({ force: true }).catch(() => {});
    await sleep(1500);
    opened = await openPlanDetail();
  }
  await shot(page, '05-plan-detail');
  let detailText = await page.locator('body').innerText().catch(() => '');
  let hasSubmitCta = /Gửi duyệt QT/i.test(detailText);
  // If still on list, force React path via second eye click
  if (!hasSubmitCta) {
    await page.locator('tr').filter({ hasText: STAMP }).locator('button').last().click({ force: true }).catch(() => {});
    await sleep(2000);
    detailText = await page.locator('body').innerText().catch(() => '');
    hasSubmitCta = /Gửi duyệt QT/i.test(detailText);
    opened = opened || hasSubmitCta || detailText.includes(STAMP);
    await shot(page, '05b-plan-detail-retry');
  }
  recordStep('open_detail', hasSubmitCta ? 'PASS' : opened ? 'PARTIAL' : 'FAIL', {
    summary: `opened=${opened} hasGửiDuyệtQT=${hasSubmitCta} snippet=${detailText.slice(0, 180).replace(/\s+/g, ' ')}`,
  });

  // --- Submit workflow ---
  const netBeforeSubmit = results.network.length;
  let submitted = false;
  if (hasSubmitCta) {
    submitted = await clickText(page, /Gửi duyệt QT/i);
  } else if (results.ids.planId) {
    // Last resort: still FE-driven? No — do not API-only mutate. Record residual.
    log('SUBMIT_CTA_MISSING', { planId: results.ids.planId });
  }
  await sleep(4000);
  await shot(page, '06-after-submit');
  const submitPosts = results.network
    .slice(netBeforeSubmit)
    .filter((n) => n.method === 'POST' && /submit-workflow/.test(n.url));
  const submit2xx = submitPosts.some((n) => n.status >= 200 && n.status < 300);
  const afterSubmitUi = await page.locator('body').innerText().catch(() => '');
  const toastOk = /Đã gửi duyệt|Inbox|thiếu instance|spawn/i.test(afterSubmitUi);
  recordStep('submit_wf', submit2xx ? (results.spawnMissing ? 'PARTIAL' : 'PASS') : 'FAIL', {
    summary: `clicked=${submitted} POST ${submitPosts.map((n) => n.status).join(',') || 'none'} spawnMissing=${results.spawnMissing} wi=${results.ids.workflowInstanceId}`,
    submitBody: results.submitBody,
    toastOk,
  });

  // --- F5 ---
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await clickText(page, /Kế hoạch/i, { role: 'button' });
  await sleep(1500);
  await shot(page, '07-f5-list');
  const listText = await page.locator('body').innerText().catch(() => '');
  const stampOnList = listText.includes(STAMP);
  const pendingBadge = /Chờ duyệt QT|pending_approval|Chờ duyệt/i.test(listText);
  // open detail again via Eye
  await page.locator('tr').filter({ hasText: STAMP }).locator('button').last().click({ force: true }).catch(() => {});
  await sleep(1500);
  await shot(page, '08-f5-detail');
  const f5Detail = await page.locator('body').innerText().catch(() => '');
  const wiVisible =
    Boolean(results.ids.workflowInstanceId) || /Chờ duyệt QT|đã gửi|Gửi duyệt QT/i.test(f5Detail);
  const getPlans = results.network.filter(
    (n) => n.method === 'GET' && /recruitment-plans/.test(n.url) && n.status === 200 && n.hasStamp,
  );
  recordStep('f5_persist', stampOnList && (results.ids.workflowInstanceId || pendingBadge) ? 'PASS' : stampOnList ? 'PARTIAL' : 'FAIL', {
    summary: `stampOnList=${stampOnList} pendingBadge=${pendingBadge} wi=${results.ids.workflowInstanceId} getHits=${getPlans.length}`,
    wiVisible,
  });

  // --- Optional AP: Inbox ---
  if (results.ids.workflowInstanceId && !results.spawnMissing) {
    log('GOTO_INBOX');
    await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await shot(page, '09-inbox');
    const inboxText = await page.locator('body').innerText().catch(() => '');
    const cardHit =
      inboxText.includes(STAMP) ||
      /kế hoạch tuyển|recruitment.?plan|Phê duyệt kế hoạch/i.test(inboxText);
    results.approve.cardVisible = cardHit;
    if (cardHit) {
      const netAp = results.network.length;
      await clickText(page, /kế hoạch|Duyệt|Hoàn thành/i);
      await sleep(1000);
      const duy = await clickText(page, /^Duyệt$|Phê duyệt|Hoàn thành/i);
      await sleep(2500);
      await shot(page, '10-after-approve');
      const apPosts = results.network
        .slice(netAp)
        .filter((n) => (n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH') && /inbox|tasks|workflow|complete|approve/i.test(n.url));
      const ap2xx = apPosts.some((n) => n.status >= 200 && n.status < 300);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      await shot(page, '11-inbox-f5');
      results.approve = {
        attempted: true,
        cardVisible: true,
        clicked: duy,
        network: apPosts.slice(-5),
        ap2xx,
      };
      recordStep('approve_inbox', ap2xx ? 'PASS' : 'PARTIAL', {
        summary: `AP attempted ap2xx=${ap2xx} posts=${apPosts.map((n) => n.status).join(',')}`,
      });
    } else {
      results.approve = { attempted: false, cardVisible: false, reason: 'no matching inbox card without seed' };
      recordStep('approve_inbox', 'SKIP', {
        summary: 'Inbox reachable but no REC-PLAN card matched STAMP — no seed; AP not claimed',
      });
    }
  } else {
    recordStep('approve_inbox', 'SKIP', {
      summary: 'No workflowInstanceId or spawnMissing — AP XREF skipped',
    });
  }

  // Verdict assembly
  const hpPass =
    results.steps.create_plan?.verdict === 'PASS' &&
    (results.steps.submit_wf?.verdict === 'PASS' || results.steps.submit_wf?.verdict === 'PARTIAL') &&
    (results.steps.f5_persist?.verdict === 'PASS' || results.steps.f5_persist?.verdict === 'PARTIAL') &&
    Boolean(results.ids.planId);

  if (results.spawnMissing) {
    results.residuals.push({
      id: 'R-U84-REC-PLAN-SPAWN-MISSING',
      severity: 'P1',
      note: 'submit-workflow 2xx but spawnMissing — inbox instance not created',
    });
  }
  if (!results.ids.workflowInstanceId && submit2xx === false && results.steps.submit_wf?.verdict === 'FAIL') {
    results.residuals.push({
      id: 'R-U84-REC-PLAN-SUBMIT-FAIL',
      severity: 'P0',
      note: 'Gửi duyệt QT did not yield submit-workflow 2xx',
    });
  }

  results.verdict = hpPass
    ? results.spawnMissing || !results.ids.workflowInstanceId
      ? 'partial'
      : 'pass'
    : results.steps.mount_plans?.verdict === 'FAIL'
      ? 'blocked'
      : 'fail';
  results.endedAt = ts();
  save();
  await browser.close();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        planId: results.ids.planId,
        wi: results.ids.workflowInstanceId,
        spawnMissing: results.spawnMissing,
        steps: Object.fromEntries(Object.entries(results.steps).map(([k, v]) => [k, v.verdict])),
        residuals: results.residuals,
      },
      null,
      2,
    ),
  );
  process.exitCode = results.verdict === 'fail' || results.verdict === 'blocked' ? 2 : 0;
}

main().catch((e) => {
  results.endedAt = ts();
  results.verdict = 'fail';
  results.residuals.push({ id: 'R-HARNESS-CRASH', severity: 'P0', note: String(e?.stack || e).slice(0, 500) });
  save();
  console.error(e);
  process.exit(1);
});
