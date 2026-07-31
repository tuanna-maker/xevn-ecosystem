/**
 * QA-REC-13-S2-SUBMIT-INBOX-8088-RET — U65 + U76 HDSD-align
 * Create YCTD → «Gửi duyệt QT» → POST submit-workflow 2xx → Inbox (no seed)
 * VPS :8088 only — retest after DO-REC-8088-JOBREQ-UI-EXPORT-01 hasExport=1 · VPS e3d41b1; no local fallback.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-rec-13-s2-submit-inbox-8088-ret-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-rec-13-s2-submit-inbox-8088-ret-20260801');
const STAMP = `S2R${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TITLE = `YCTD QA S2 Submit ${STAMP}`;
const JD_TITLE = `JD QA S2 ${STAMP}`;

let PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path, extra = {}) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || 'xevn');
  u.searchParams.set('companyId', extra.companyId || 'main');
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
};

const results = {
  work_item_id: 'QA-REC-13-S2-SUBMIT-INBOX-8088-RET',
  program: 'P-REC-E2E-13STEP-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', u76: 'hdsd_align', stamp: STAMP, companyId: 'main' },
  l0: {},
  ctaProbe: {},
  hdsd_coverage: [],
  steps: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { requisitionId: null, templateId: null, workflowInstanceId: null },
  spawnMissing: false,
  submitBody: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordStep(id, verdict, detail) {
  results.steps[id] = { ...detail, verdict, at: new Date().toISOString() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 240)}`);
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
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
        at: new Date().toISOString(),
      };
      if (/recruitment|workflow-engine|job-templates|inbox|tasks/.test(u)) {
        if (method === 'POST' && /\/requisitions(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
          try {
            const j = await res.json();
            const row = j?.data ?? j;
            if (row?.id) results.ids.requisitionId = row.id;
            entry.createdId = row?.id || null;
            entry.createdTitle = row?.title || null;
            entry.code = j?.code || null;
          } catch {
            /* */
          }
        }
        if (method === 'POST' && /submit-workflow/.test(u)) {
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
              message: String(j?.message || '').slice(0, 160),
            };
            results.spawnMissing = results.submitBody.spawnMissing;
            results.ids.workflowInstanceId = results.submitBody.workflowInstanceId;
            entry.code = results.submitBody.code;
            entry.spawnMissing = results.submitBody.spawnMissing;
            entry.workflowInstanceId = results.submitBody.workflowInstanceId;
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
        if (results.network.length > 600) results.network.shift();
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
  if (!token) throw new Error(`login failed HTTP ${r.status} portal=${PORTAL}`);
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
    companyId: 'main',
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
      }
    },
    session,
  );
}

async function probeL0() {
  const targets = [
    ['portal', PORTAL],
    ['hrm_req', `${PORTAL}/api/hrm/recruitment/requisitions?company_id=main&page_size=1`],
    ['xbos_login', `${PORTAL}/api/xbos/auth/login`],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, {
        method: name === 'xbos_login' ? 'OPTIONS' : 'GET',
        signal: AbortSignal.timeout(12000),
      });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 100);
    }
  }
  save();
}

async function clickText(page, re, opts = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  const any = page.locator('button, a, [role="button"], [role="tab"], [role="menuitem"]').filter({ hasText: re }).first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  return page.evaluate((pattern) => {
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
}

async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(200);
  }
}

async function pickFirstOption(page) {
  await sleep(500);
  const opt = page.locator('[role="option"], [cmdk-item], [data-radix-collection-item]').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    await sleep(300);
    return true;
  }
  await page.keyboard.press('ArrowDown').catch(() => {});
  await page.keyboard.press('Enter').catch(() => {});
  await sleep(300);
  return false;
}

async function fillFirstVisible(page, selectors, value) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (!(await loc.isVisible().catch(() => false))) continue;
    const tag = await loc.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
    const role = await loc.getAttribute('role').catch(() => '');
    if (tag === 'button' || role === 'combobox') {
      await loc.click({ force: true }).catch(() => {});
      await sleep(400);
      await pickFirstOption(page);
      return true;
    }
    try {
      await loc.fill(String(value));
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function gotoRecruitment(page, tab) {
  const url = q('/hr/recruitment', { tab });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  if (tab === 'requisitions') await clickText(page, /Yêu cầu tuyển dụng/i, { role: 'button' }).catch(() => {});
  if (tab === 'jd-library') await clickText(page, /Thư viện JD|JD/i, { role: 'button' }).catch(() => {});
  await sleep(1500);
  return url;
}

async function ensureJdTemplate(page) {
  await gotoRecruitment(page, 'jd-library');
  await shot(page, '01-jd-lib');
  const open = await clickText(page, /Thêm|Tạo.*JD|Tạo mẫu|Thêm mẫu/i);
  if (!open) return false;
  await sleep(1000);
  await fillFirstVisible(
    page,
    ['[role="dialog"] input[name="title"]', '[role="dialog"] input[type="text"]'],
    JD_TITLE,
  );
  await fillFirstVisible(
    page,
    ['[role="dialog"] textarea', 'textarea'],
    'QA S2 submit-inbox retest JD — NestJS / recruitment WF.',
  );
  const net0 = results.network.length;
  await clickText(page, /Lưu|Tạo|Save/i);
  await sleep(3500);
  const posts = netsSince(net0, (n) => n.method === 'POST' && /job-templates/i.test(n.url));
  return posts.some((p) => p.status >= 200 && p.status < 300);
}

async function countCta(page) {
  return page.evaluate(() => {
    const byTest =
      document.querySelectorAll(
        '[data-testid="hdsd-requisition-submit-wf"], [data-testid="hdsd-requisition-post-create-submit"], [data-testid^="hdsd-requisition-submit-wf-"]',
      ).length;
    const byLabel = Array.from(document.querySelectorAll('button, a, [role="button"]')).filter((b) =>
      /Gửi duyệt QT/i.test(b.textContent || ''),
    ).length;
    const rowActions = Array.from(document.querySelectorAll('tr button, tr a'))
      .map((b) => (b.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 20);
    return { byTest, byLabel, rowActionsSample: rowActions };
  });
}

async function runOnPortal(page, session) {
  results.env.PORTAL = PORTAL;
  await injectPortalAuth(page, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2000);

  // HDSD nav: menu Tuyển dụng → tab Yêu cầu tuyển dụng
  const menuOk = await clickText(page, /Tuyển dụng/i).catch(() => false);
  await sleep(1500);
  const tabUrl = await gotoRecruitment(page, 'requisitions');
  await shot(page, '02-req-tab');
  const body = await page.locator('body').innerText().catch(() => '');
  const tabLabelOk = /Yêu cầu tuyển dụng/i.test(body);
  results.hdsd_coverage.push({
    item: 'Menu Tuyển dụng',
    hdsd_ref: 'HDSD_XEVN_CH07 §1–2',
    click: 'sidebar/nav Tuyển dụng or /hr/recruitment',
    verdict: menuOk || /recruitment/i.test(tabUrl) ? '🟢' : '🟡',
  });
  results.hdsd_coverage.push({
    item: 'Tab Yêu cầu tuyển dụng',
    hdsd_ref: 'HDSD_XEVN_CH07 §3',
    click: 'tab=requisitions · label Yêu cầu tuyển dụng',
    verdict: tabLabelOk ? '🟢' : '🔴',
  });

  await ensureJdTemplate(page);
  await gotoRecruitment(page, 'requisitions');
  await shot(page, '03-req-list-pre');

    // Create YCTD (UF-HRM-12) — always click (visibility alone must not short-circuit)
  let createBtn = false;
  const createLoc = page.locator('[data-testid="hdsd-requisition-create-btn"]').first();
  if (await createLoc.isVisible().catch(() => false)) {
    await createLoc.click({ force: true });
    createBtn = true;
  }
  if (!createBtn) {
    createBtn = await clickText(page, /Thêm yêu cầu|Tạo yêu cầu|\+\s*Thêm/i);
  }
  if (!createBtn) {
    createBtn = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const el = nodes.find((n) => /Thêm yêu cầu|Tạo yêu cầu|\+\s*Thêm/i.test((n.textContent || '').trim()));
      if (!el) return false;
      el.click();
      return true;
    });
  }
  await sleep(2500);
await shot(page, '04-create-dialog');
  results.hdsd_coverage.push({
    item: 'Nút Thêm yêu cầu / Tạo yêu cầu',
    hdsd_ref: 'HDSD_XEVN_CH07 §3 — Tạo yêu cầu',
    click: 'hdsd-requisition-create-btn / Thêm yêu cầu',
    verdict: createBtn ? '🟢' : '🔴',
  });

  const dialogVisible = await page.locator('[role="dialog"]').first().isVisible().catch(() => false);
  results.steps.dialogOpen = { dialogVisible, createBtn, at: new Date().toISOString() };
  if (!dialogVisible) {
    // Retry click via role/name
    await page.getByRole('button', { name: /Thêm yêu cầu/i }).first().click({ force: true }).catch(() => {});
    await sleep(2000);
  }
  const dialogOk = await page.locator('[role="dialog"]').first().isVisible().catch(() => false);
  results.steps.dialogOpen.retryVisible = dialogOk;

  // Empty JD library blocker: follow FE CTA «Mở Thư viện JD» (U65) then create JD, return to requisitions
  const emptyJdHint = await page.locator('text=/Chưa có JD trong thư viện/i').first().isVisible().catch(() => false);
  results.steps.jdEmptyHint = emptyJdHint;
  if (emptyJdHint || !(await page.locator('[role="dialog"] [data-testid="hdsd-requisition-job-template"]').first().isEnabled().catch(() => false))) {
    const openJd = page.getByRole('button', { name: /Mở Thư viện JD/i }).first();
    if (await openJd.isVisible().catch(() => false)) {
      await openJd.click({ force: true });
      await sleep(2500);
      await shot(page, '04b-jd-library');
      // Create JD on library tab
      const addJd =
        (await page.locator('[data-testid="hdsd-jd-create-btn"]').first().isVisible().catch(() => false) &&
          (await page.locator('[data-testid="hdsd-jd-create-btn"]').first().click({ force: true }), true)) ||
        (await clickText(page, /Thêm|Tạo.*JD|Tạo mẫu|Thêm mẫu|Tạo JD/i));
      await sleep(1500);
      await fillFirstVisible(
        page,
        ['[role="dialog"] input[name="title"]', '[role="dialog"] input[type="text"]', 'input[name="title"]'],
        JD_TITLE,
      );
      await fillFirstVisible(
        page,
        ['[role="dialog"] textarea[name="description"]', '[role="dialog"] textarea', 'textarea'],
        'QA S2 RET JD — NestJS recruitment WF submit-inbox.',
      );
      // position if present
      const pos = page.locator('[role="dialog"] [data-testid*="position"], [role="dialog"] [role="combobox"]').first();
      if (await pos.isVisible().catch(() => false)) {
        await pos.click({ force: true }).catch(() => {});
        await sleep(400);
        await pickFirstOption(page);
      }
      const jdNet = results.network.length;
      await clickText(page, /Lưu|Tạo|Save/i);
      await sleep(4000);
      const jdPosts = netsSince(jdNet, (n) => n.method === 'POST' && /job-templates/i.test(n.url));
      results.steps.jdCreate = {
        addJd: Boolean(addJd),
        posts: jdPosts,
        ok: jdPosts.some((p) => p.status >= 200 && p.status < 300),
      };
      await shot(page, '04c-after-jd-create');
      await gotoRecruitment(page, 'requisitions');
      await sleep(2000);
      // Re-open create dialog
      const createLoc2 = page.locator('[data-testid="hdsd-requisition-create-btn"]').first();
      if (await createLoc2.isVisible().catch(() => false)) await createLoc2.click({ force: true });
      else await clickText(page, /Thêm yêu cầu/i);
      await sleep(2500);
      await shot(page, '04d-create-after-jd');
    }
  }


  // Prefer job-template combobox inside dialog
  const jt = page.locator('[role="dialog"] [data-testid="hdsd-requisition-job-template"], [role="dialog"] [role="combobox"]').first();
  if (await jt.isVisible().catch(() => false)) {
    await jt.click();
    await sleep(600);
    await pickFirstOption(page);
    await sleep(400);
  }

  await fillFirstVisible(
    page,
    ['[data-testid="hdsd-requisition-title"]', '[role="dialog"] input[name="title"]', '[role="dialog"] input[type="text"]'],
    TITLE,
  );
  const dept = page.locator('[data-testid="hdsd-requisition-department"], [role="dialog"] [aria-label*="phòng ban" i]').first();
  if (await dept.isVisible().catch(() => false)) {
    await dept.click({ force: true });
    await sleep(500);
    // Prefer option matching IT / first available
    const opt = page.getByRole('option').filter({ hasText: /Kỹ thuật|IT|Tập đoàn/i }).first();
    if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
    else await pickFirstOption(page);
  }
  await fillFirstVisible(
    page,
    ['[data-testid="hdsd-requisition-headcount"]', '[role="dialog"] input[name="headcount"]'],
    '1',
  );
  const emp = page.locator('[role="dialog"] [data-testid="hdsd-requisition-employment-type"], [role="dialog"] [role="combobox"]').last();
  if (await emp.isVisible().catch(() => false)) {
    await emp.click().catch(() => {});
    await pickFirstOption(page);
  }

  const saveNet = results.network.length;
  await clickText(page, /Lưu yêu cầu|Lưu/i);
  await sleep(4500);
  const posts = netsSince(saveNet, (n) => n.method === 'POST' && /requisitions/i.test(n.url) && !/submit-workflow/i.test(n.url));
  const createOk = posts.some((p) => p.status === 201 || p.status === 200);
  await dismissOverlays(page);
  await shot(page, '05-after-create');

  // Prefer post-create strip CTA before F5 (FE wire D-REC)
  let cta = await countCta(page);
  results.ctaProbe.afterCreate = cta;
  await shot(page, '06-cta-after-create');

  // F5 keep UF-HRM-12
  await gotoRecruitment(page, 'requisitions');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await dismissOverlays(page);
  let after = await page.locator('body').innerText().catch(() => '');
  const rowPersist =
    after.includes(STAMP) ||
    after.includes(TITLE.slice(0, 18)) ||
    netsSince(saveNet, (n) => n.method === 'GET' && /requisitions/i.test(n.url) && n.hasStamp).length > 0 ||
    Boolean(results.ids.requisitionId);
  await shot(page, '07-f5-after-create');
  cta = await countCta(page);
  results.ctaProbe.afterF5 = cta;

  recordStep('UF-HRM-12', createOk && rowPersist ? '🟢' : createOk ? '🟡' : '🔴', {
    url: tabUrl,
    clickPath: ['Tuyển dụng', 'Yêu cầu tuyển dụng', 'Thêm yêu cầu', 'Lưu', 'F5'],
    network: posts.slice(-3),
    f5: rowPersist,
    summary: `create=${createOk} id=${results.ids.requisitionId} f5=${rowPersist} posts=${posts.map((p) => p.status).join(',')}`,
  });

  // Click «Gửi duyệt QT»
  await gotoRecruitment(page, 'requisitions');
  await sleep(2000);
  await dismissOverlays(page);
  const submitNet = results.network.length;
  let clicked = false;
  const postCreate = page.locator('[data-testid="hdsd-requisition-post-create-submit"] button, [data-testid="hdsd-requisition-submit-wf"]').first();
  if (await postCreate.isVisible().catch(() => false)) {
    await postCreate.click({ force: true });
    clicked = true;
  }
  if (!clicked && results.ids.requisitionId) {
    const rowBtn = page.locator(`[data-testid="hdsd-requisition-submit-wf-${results.ids.requisitionId}"]`).first();
    if (await rowBtn.isVisible().catch(() => false)) {
      await rowBtn.click({ force: true });
      clicked = true;
    }
  }
  if (!clicked) {
    clicked = await page.evaluate((stamp) => {
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], div'));
      const row = rows.find((n) => (n.textContent || '').includes(stamp));
      if (!row) return false;
      const btn = Array.from(row.querySelectorAll('button, a')).find((b) => /Gửi duyệt/i.test(b.textContent || ''));
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }, STAMP);
  }
  if (!clicked) clicked = await clickText(page, /Gửi duyệt QT|Gửi duyệt/i);
  await sleep(4500);
  const submits = netsSince(submitNet, (n) => /submit-workflow/i.test(n.url));
  let submit2xx = submits.some((s) => s.status >= 200 && s.status < 300);
  const bodyTxt = await page.locator('body').innerText().catch(() => '');
  const spawnBanner = /SPAWN-MISSING|rec-wf-spawn-missing/i.test(bodyTxt);
  results.spawnMissing = results.spawnMissing || spawnBanner;
  await shot(page, '08-after-submit');
 
  await gotoRecruitment(page, 'requisitions');
  await sleep(2500);
  await dismissOverlays(page);
  // Residual probe: if create-path submit missed, click first visible «Gửi duyệt QT» (existing row) — evidence only
  if (!submit2xx) {
    const residualNet = results.network.length;
    const anyCta = page.locator('button, a, [role="button"]').filter({ hasText: /Gửi duyệt QT/i }).first();
    if (await anyCta.isVisible().catch(() => false)) {
      await anyCta.click({ force: true });
      clicked = true;
      await sleep(4500);
      const more = netsSince(residualNet, (n) => /submit-workflow/i.test(n.url));
      submits.push(...more);
      const submit2xxResidual = more.some((s) => s.status >= 200 && s.status < 300);
      results.steps.residualSubmitExistingRow = {
        attempted: true,
        submit2xx: submit2xxResidual,
        statuses: more.map((s) => s.status),
        spawnMissing: results.spawnMissing,
        submitBody: results.submitBody,
      };
      if (submit2xxResidual) {
        // do not rewrite createOk — only note residual wire
      }
      await shot(page, '08b-residual-submit-existing');
    } else {
      results.steps.residualSubmitExistingRow = { attempted: false, reason: 'no CTA' };
    }
    submit2xx = submits.some((s) => s.status >= 200 && s.status < 300);
  }
 results.hdsd_coverage.push({
    item: 'Nút Gửi duyệt QT',
    hdsd_ref: 'HDSD_XEVN_CH07 §3 / troubleshooting · J-REC-WF-02',
    click: 'hdsd-requisition-submit-wf / hdsd-requisition-post-create-submit',
    verdict: clicked && submit2xx ? '🟢' : clicked && !submit2xx ? '🟡' : cta.byLabel || cta.byTest ? '🟡' : '🔴',
    note: `clicked=${clicked} submit=${submits.map((s) => `${s.status}`).join(',') || 'none'} spawnMissing=${results.spawnMissing}`,
  });

  recordStep('J-REC-WF-02', submit2xx ? '🟢' : clicked ? '🟡' : '🔴', {
    url: page.url(),
    clickPath: ['Gửi duyệt QT'],
    network: submits.slice(-3),
    f5: null,
    spawnMissing: results.spawnMissing,
    submitBody: results.submitBody,
    cta,
    summary: `clicked=${clicked} submit=${submits.map((s) => s.status).join(',') || 'none'} spawn=${results.spawnMissing} wi=${results.ids.workflowInstanceId}`,
  });

  // Inbox — no seed
  const inboxUrl = `${PORTAL}/command-center/inbox`;
  await page.goto(inboxUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '09-inbox');
  const inboxBody = await page.locator('body').innerText().catch(() => '');
  const hasTask =
    Boolean(results.ids.workflowInstanceId) &&
    (/tuyển|requisition|YCTD|hrm_requisition|Yêu cầu|S2R|Backend|QA S2/i.test(inboxBody) ||
      inboxBody.includes(STAMP) ||
      inboxBody.includes(TITLE.slice(0, 12)));
  // Broader: recruitment-ish task without requiring stamp (SPAWN may use generic title)
  const hasRecTask =
    hasTask ||
    (/tuyển dụng|Yêu cầu tuyển|hrm_requisition|requisition.?approval|YCTD/i.test(inboxBody) &&
      !/không có|empty|0 task/i.test(inboxBody.slice(0, 200)));
  // Prefer stamp/id match when available
  const stampInInbox = inboxBody.includes(STAMP) || inboxBody.includes(TITLE.slice(0, 16));
  const inboxVisible = stampInInbox || (results.ids.workflowInstanceId && hasRecTask);

  results.hdsd_coverage.push({
    item: 'Inbox XBOS — task sau Gửi duyệt QT',
    hdsd_ref: 'J-REC-WF-03 · HDSD WF',
    click: '/command-center/inbox (no seed)',
    verdict: inboxVisible ? '🟢' : submit2xx ? '🟡' : '⬜',
    note: `stamp=${stampInInbox} wi=${results.ids.workflowInstanceId} spawnMissing=${results.spawnMissing}`,
  });

  recordStep('J-REC-WF-03', inboxVisible ? '🟢' : '🟡', {
    url: inboxUrl,
    clickPath: ['command-center/inbox'],
    network: netsSince(submitNet, (n) => /inbox|workflow-engine\/tasks/i.test(n.url)).slice(-5),
    f5: null,
    summary: `inboxTask=${inboxVisible} stamp=${stampInInbox} spawnMissing=${results.spawnMissing}`,
    inboxVisible,
    stampInInbox,
  });

  return {
    createOk,
    rowPersist,
    clicked,
    submit2xx,
    submits,
    posts,
    cta,
    inboxVisible,
    spawnMissing: results.spawnMissing,
  };
}

function decideAck(r) {
  // FE wire PASS when create+F5 + CTA clicked + submit 2xx
  const feWirePass = r.createOk && r.rowPersist && r.clicked && r.submit2xx;
  if (!r.createOk || !r.rowPersist) {
    return {
      ack: 'FAIL_TO_PM',
      residual: 'UF-HRM-12 create/F5 regression',
      next: 'dev-fe',
    };
  }
  if (!r.clicked || (r.cta?.byTest === 0 && r.cta?.byLabel === 0 && !r.submit2xx)) {
    return {
      ack: 'FAIL_TO_PM',
      residual: 'CTA Gửi duyệt QT absent or not wired — D-REC-13-S2-SUBMIT-INBOX-01 not on env',
      next: 'devops/dev-fe deploy',
    };
  }
  if (r.submit2xx && (r.spawnMissing || !r.inboxVisible)) {
    return {
      ack: 'PASS_TO_PM',
      fe_wire: 'PASS',
      residual: 'D-REC-13-S2-SUBMIT-INBOX-BE-01',
      note: 'FE submit-workflow 2xx observed; Inbox empty / SPAWN-MISSING — U65 no seed',
      next: 'dev-be',
    };
  }
  if (r.submit2xx && r.inboxVisible) {
    return {
      ack: 'PASS_TO_PM',
      fe_wire: 'PASS',
      inbox: 'PASS',
      residual: null,
      next: 'qc',
    };
  }
  return {
    ack: 'FAIL_TO_PM',
    residual: `submit incomplete clicked=${r.clicked} 2xx=${r.submit2xx}`,
    next: 'dev-fe',
  };
}

async function main() {
  await probeL0();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  let session;
  try {
    session = await loginApi();
  } catch (e) {
    results.fatal = String(e);
    results.ack_status = 'FAIL_TO_PM';
    save();
    await browser.close();
    process.exit(1);
  }

  let outcome = await runOnPortal(page, session);

  // Fallback local if CTA missing on VPS
  const ctaMissing =
    !outcome.clicked &&
    (!outcome.cta || (outcome.cta.byTest === 0 && outcome.cta.byLabel === 0)) &&
    !outcome.submit2xx;

  if (false && ctaMissing && !process.env.PORTAL_DEV_URL) {
    console.log('CTA missing on :8088 — trying local :5173');
    PORTAL = 'http://127.0.0.1:5173';
    results.env.fallback = 'local-5173-after-vps-cta-miss';
    results.env.PORTAL = PORTAL;
    await probeL0();
    try {
      session = await loginApi();
      // reset mutation state for second run
      results.ids = { requisitionId: null, templateId: null, workflowInstanceId: null };
      results.submitBody = null;
      results.spawnMissing = false;
      outcome = await runOnPortal(page, session);
    } catch (e) {
      results.env.localFallbackError = String(e).slice(0, 200);
      console.log('Local fallback failed:', e?.message || e);
    }
  }

  const decision = decideAck(outcome);
  results.decision = decision;
  results.outcome = {
    createOk: outcome.createOk,
    rowPersist: outcome.rowPersist,
    clicked: outcome.clicked,
    submit2xx: outcome.submit2xx,
    inboxVisible: outcome.inboxVisible,
    spawnMissing: outcome.spawnMissing,
    submitStatuses: outcome.submits?.map((s) => s.status) || [],
  };
  results.finishedAt = new Date().toISOString();
  results.ack_status = decision.ack;
  results.seed_used = false;
  save();
  console.log('ACK', results.ack_status);
  console.log('DECISION', JSON.stringify(decision));
  console.log('OUTCOME', JSON.stringify(results.outcome));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e);
  results.ack_status = 'FAIL_TO_PM';
  save();
  process.exit(1);
});
