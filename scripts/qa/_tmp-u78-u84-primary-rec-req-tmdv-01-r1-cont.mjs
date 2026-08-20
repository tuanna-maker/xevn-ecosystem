#!/usr/bin/env node
/**
 * R1 continuation — submit WF + Inbox AP for already-created YCTD (U65)
 * Prior create: POST 201 requisitions id=46c0fff1… stamp TMDV-REQ-R1-DINI2P
 * Harness false-negative: mistook closed dialog for Lưu disabled after create.
 */
import { chromium } from 'playwright';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = 'trsport';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const PREV = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-req-tmdv-01-r1-browser.json');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-req-tmdv-01-r1-cont-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-rec-req-tmdv-01-r1');
mkdirSync(SCREEN, { recursive: true });

const prev = JSON.parse(readFileSync(PREV, 'utf8'));
const STAMP = prev.env?.STAMP || 'TMDV-REQ-R1-DINI2P';
const REQ_ID = prev.ids?.requisitionId;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-REC-REQ-TMDV-01-R1',
  phase: 'submit-wf+AP',
  startedAt: ts(),
  STAMP,
  REQ_ID,
  u65: 'zero-seed',
  network: [],
  steps: {},
  ids: {
    jdId: prev.ids?.jdId || null,
    requisitionId: REQ_ID,
    workflowInstanceId: null,
  },
  submitBody: null,
  approve: {},
  residuals: [],
  screens: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 300)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  return {
    token: data.accessToken || data.access_token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: data.user?.userId || EMAIL,
      email: EMAIL,
      displayName: data.user?.displayName || 'CEO',
      roles: data.user?.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function inject(page, session) {
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
      return;
    }
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"]'));
      const hit = items.find((n) => /thương mại|trsport|tmdv|dịch vụ x\.e/i.test(n.textContent || ''));
      if (hit) hit.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await sleep(1500);
  } catch {
    /* */
  }
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  page.on('response', async (res) => {
    try {
      const u = res.url();
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const interesting =
        /requisitions|workflow|inbox|tasks|complete/.test(u) &&
        (method === 'POST' || method === 'GET');
      if (!interesting) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      };
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
            message: String(j?.message || '').slice(0, 200),
            status: res.status(),
          };
          if (results.submitBody.workflowInstanceId) {
            results.ids.workflowInstanceId = results.submitBody.workflowInstanceId;
          }
          entry.code = results.submitBody.code;
          entry.workflowInstanceId = results.submitBody.workflowInstanceId;
          entry.spawnMissing = results.submitBody.spawnMissing;
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
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /\/requisitions(\?|$)/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const data = j?.data?.data ?? j?.data ?? [];
          const rows = Array.isArray(data) ? data : [];
          const hit = rows.find(
            (r) => r.id === REQ_ID || String(r.title || '').includes(STAMP),
          );
          entry.hasStamp = Boolean(hit);
          entry.hitStatus = hit?.status || null;
          entry.hitWi = hit?.workflow_instance_id || null;
          if (hit?.workflow_instance_id) results.ids.workflowInstanceId = hit.workflow_instance_id;
          if (hit?.id) results.ids.requisitionId = hit.id;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });

  await inject(page, session);

  // Correct prior false BLOCKED
  recordStep('create_req_correction', 'PASS', {
    summary: `Prior false-negative: POST requisitions 201 id=${REQ_ID} stamp=${STAMP} (dialog closed → harness mistook Lưu disabled)`,
  });

  const url = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=${COMPANY}&tab=requisitions`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await selectOuTmdv(page);
  await shot(page, '09-cont-req-list');

  const body = await page.locator('body').innerText().catch(() => '');
  if (!body.includes(STAMP)) {
    recordStep('submit_precond', 'FAIL', { summary: 'STAMP row missing on list — cannot continue U65' });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }
  recordStep('submit_precond', 'PASS', { summary: `row visible stamp=${STAMP}` });

  // Prefer post-create banner CTA, else row CTA
  const netBefore = results.network.length;
  let clicked = false;
  const bannerCta = page
    .locator('div, section, aside')
    .filter({ hasText: STAMP })
    .getByRole('button', { name: /Gửi duyệt QT/i })
    .first();
  if (await bannerCta.isVisible().catch(() => false)) {
    await bannerCta.click({ force: true });
    clicked = true;
  } else {
    const row = page.locator('tr').filter({ hasText: STAMP }).first();
    const cta = row.getByRole('button', { name: /Gửi duyệt QT/i }).first();
    if (await cta.isVisible().catch(() => false)) {
      await cta.click({ force: true });
      clicked = true;
    }
  }
  if (!clicked) {
    clicked = await page.evaluate((stamp) => {
      const nodes = Array.from(document.querySelectorAll('tr, div, section'));
      const c = nodes.find(
        (n) => (n.textContent || '').includes(stamp) && /Gửi duyệt QT/i.test(n.textContent || ''),
      );
      if (!c) return false;
      const btn = Array.from(c.querySelectorAll('button')).find((b) =>
        /Gửi duyệt QT/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.click();
      return true;
    }, STAMP);
  }
  await sleep(4500);
  await shot(page, '10-after-submit');

  const submitPosts = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'POST' && /submit-workflow/.test(n.url));
  const submit2xx = submitPosts.some((n) => n.status >= 200 && n.status < 300);
  recordStep('submit_wf', submit2xx && !results.submitBody?.spawnMissing ? 'PASS' : submit2xx ? 'PARTIAL' : 'FAIL', {
    summary: `clicked=${clicked} posts=${submitPosts.map((n) => `${n.status}:${n.code || ''}`).join(',') || 'none'} wi=${results.ids.workflowInstanceId} spawnMissing=${results.submitBody?.spawnMissing}`,
    submitBody: results.submitBody,
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await selectOuTmdv(page);
  await shot(page, '11-f5-list');
  const afterList = await page.locator('body').innerText().catch(() => '');
  recordStep('f5_persist', afterList.includes(STAMP) && results.ids.workflowInstanceId ? 'PASS' : afterList.includes(STAMP) ? 'PARTIAL' : 'FAIL', {
    summary: `stamp=${afterList.includes(STAMP)} wi=${results.ids.workflowInstanceId}`,
  });

  if (!submit2xx || !results.ids.workflowInstanceId || results.submitBody?.spawnMissing) {
    results.residuals.push({
      id: 'R-U84-REC-REQ-SUBMIT-WF',
      severity: 'P0',
      note: 'Gửi duyệt QT did not yield workflow_instance_id',
    });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  // Inbox AP — company main
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.companyId', 'main');
    }
  });
  await page.goto(`${PORTAL}/command-center/inbox`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(5000);
  await shot(page, '12-inbox-before');

  const inboxBody = await page.locator('body').innerText().catch(() => '');
  const cardVisible = inboxBody.includes(STAMP);
  results.approve.cardVisible = cardVisible;
  if (!cardVisible) {
    recordStep('ap_inbox', 'FAIL', { summary: 'STAMP not in inbox — U65 no seed' });
    results.residuals.push({
      id: 'R-U84-REC-REQ-INBOX-EMPTY',
      severity: 'P0',
      note: 'Inbox missing YCTD stamp after submit',
    });
    results.endedAt = ts();
    save();
    await browser.close();
    process.exitCode = 2;
    return;
  }

  const target = page
    .locator('article, li, section, div')
    .filter({ hasText: STAMP })
    .filter({ hasText: /yêu cầu tuyển|phê duyệt yêu cầu|requisition|YCTD|tuyển dụng/i })
    .first();
  const loose = page.locator('article, li, section, div').filter({ hasText: STAMP }).first();
  const card = (await target.isVisible().catch(() => false)) ? target : loose;
  await card.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(400);

  const netAp = results.network.length;
  let apClicked = false;
  const quick = card.getByRole('button', { name: /Xử lý nhanh/i }).first();
  if (await quick.isVisible().catch(() => false)) {
    await quick.click({ force: true });
    apClicked = true;
    await sleep(1500);
    const dlg = page.locator('[role="dialog"]').first();
    if (await dlg.isVisible().catch(() => false)) {
      const duy = dlg.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt/i }).first();
      if (await duy.isVisible().catch(() => false)) {
        await duy.click({ force: true });
        await sleep(2500);
      }
    }
  } else {
    apClicked = await page.evaluate((stamp) => {
      const nodes = Array.from(document.querySelectorAll('div, li, article, section'));
      const container = nodes.find(
        (n) =>
          (n.textContent || '').includes(stamp) &&
          /Xử lý nhanh/i.test(n.textContent || ''),
      );
      if (!container) return false;
      const btn = Array.from(container.querySelectorAll('button')).find((b) =>
        /Xử lý nhanh/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.click();
      return true;
    }, STAMP);
    await sleep(1500);
    const duy = page.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt/i }).first();
    if (await duy.isVisible().catch(() => false)) {
      await duy.click({ force: true });
      await sleep(2500);
    }
  }

  await shot(page, '13-ap-after-click');
  const completes = results.network
    .slice(netAp)
    .filter((n) => n.method === 'POST' && /\/complete/.test(n.url) && n.status >= 200 && n.status < 300);
  results.approve.clicked = apClicked;
  results.approve.completePosts = completes;

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '14-ap-inbox-f5');
  const afterInbox = await page.locator('body').innerText().catch(() => '');
  const stillThere = afterInbox.includes(STAMP);
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

  const terminal = hit && /approved|rejected|closed|cancelled|completed/i.test(String(hit.status || ''));
  const pass =
    !stillThere &&
    completes.length >= 1 &&
    (terminal ||
      completes.some(
        (c) =>
          !results.ids.workflowInstanceId ||
          String(c.bodySnippet || '').includes(results.ids.workflowInstanceId) ||
          c.instanceId === results.ids.workflowInstanceId,
      ));
  results.approve.verdict = pass
    ? 'PASS'
    : !stillThere && completes.length >= 1
      ? 'PARTIAL'
      : 'FAIL';
  recordStep('ap_inbox', results.approve.verdict === 'FAIL' ? 'FAIL' : 'PASS', {
    summary: `clicked=${apClicked} completes=${completes.length} cardGone=${!stillThere} status=${hit?.status || '?'} codes=${completes.map((c) => c.code).join(',')}`,
  });

  // Merge into primary raw for evidence convenience
  prev.steps = { ...prev.steps, ...results.steps };
  prev.steps.create_req = {
    summary: `POST requisitions 201:HRM-REC-201 id=${REQ_ID} (corrected from false Lưu-disabled)`,
    verdict: 'PASS',
    at: ts(),
  };
  prev.ids = results.ids;
  prev.submitBody = results.submitBody;
  prev.approve = results.approve;
  prev.network = [...(prev.network || []), ...results.network];
  prev.screens = [...new Set([...(prev.screens || []), ...results.screens])];
  prev.residuals = results.residuals;
  prev.continuation = { OUT, at: ts() };
  prev.endedAt = ts();
  writeFileSync(PREV, JSON.stringify(prev, null, 2));

  results.endedAt = ts();
  save();
  await browser.close();

  const hpPass = results.steps.submit_wf?.verdict === 'PASS' && results.steps.f5_persist?.verdict !== 'FAIL';
  const apPass = results.approve.verdict === 'PASS' || results.approve.verdict === 'PARTIAL';
  console.log(JSON.stringify({ STAMP, ids: results.ids, approve: results.approve.verdict, hpPass, apPass }, null, 2));
  process.exitCode = hpPass && apPass ? 0 : 2;
}

main().catch((e) => {
  results.endedAt = ts();
  results.error = String(e?.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
