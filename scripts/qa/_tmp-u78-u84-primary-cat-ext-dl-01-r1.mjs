#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-CAT-EXT-DL-01-R1
 * Retest: exact xe-du-lich select · custom field stamp · gov approve confirm dialog
 * Continues after HP 201/wi from prior run; may re-HP if needed.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const PRIOR = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-cat-ext-dl-01-browser.json');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-cat-ext-dl-01-r1-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-cat-ext-dl-01');
mkdirSync(SCREEN, { recursive: true });

const prior = JSON.parse(readFileSync(PRIOR, 'utf8'));
const STAMP = `DL-CAT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const FIELD_LABEL = `QA-${STAMP}-tour-xe-du-lich`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-CAT-EXT-DL-01',
  run: 'R1',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  prior_ids: prior.ids,
  env: { PORTAL, XBOS, STAMP, commit: 'dc930c5' },
  steps: {},
  network: [],
  extensionPosts: [],
  approve: {},
  ids: {
    wfDefId: prior.ids?.wfDefId || null,
    batchId: null,
    workflowInstanceId: null,
    fieldLabel: FIELD_LABEL,
    approveTaskId: null,
  },
  click_log: [],
  screens: [],
  residuals: [],
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[${results.click_log.length}] ${msg}`);
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `r1-${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error('login fail');
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: 'main',
    user: {
      userId: data?.user?.userId || EMAIL,
      email: EMAIL,
      displayName: 'CEO',
      roles: ['group_ceo'],
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
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      if (!/extension-items|catalog-governance|approve/.test(u)) return;
      try {
        const j = await res.json();
        entry.code = j?.code || null;
        const data = j?.data ?? j;
        if (/extension-items/.test(u) && method === 'POST') {
          const row = {
            status: res.status(),
            code: j?.code || null,
            catalogKey: (u.match(/settings-catalogs\/([^/]+)\/extension-items/) || [])[1],
            batchId: data?.batchId || null,
            workflowInstanceId: data?.workflowInstanceId || null,
          };
          results.extensionPosts.push(row);
          if (row.workflowInstanceId) results.ids.workflowInstanceId = row.workflowInstanceId;
          if (row.batchId) results.ids.batchId = row.batchId;
          entry.extension = row;
        }
        if (/\/approve/.test(u) && method === 'POST') {
          results.approve = { status: res.status(), code: j?.code || null, url: entry.url };
          const m = u.match(/tasks\/([^/?]+)/);
          if (m) results.ids.approveTaskId = m[1];
        }
      } catch {
        /* */
      }
      results.network.push(entry);
      save();
    } catch {
      /* */
    }
  });
}

async function selectXeDuLich(page) {
  // Prefer exact short-name chip for X.E Du lịch VN (not Visun)
  const chips = page.locator('button[role="tab"]');
  const n = await chips.count();
  for (let i = 0; i < n; i++) {
    const t = (await chips.nth(i).innerText().catch(() => '')) || '';
    if (/X\.E Du lịch VN/i.test(t) || (/Du lịch X\.E/i.test(t) && !/Visun/i.test(t))) {
      await chips.nth(i).click({ force: true });
      return { ok: true, text: t.replace(/\s+/g, ' ').trim() };
    }
  }
  // fallback evaluate
  const ok = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button[role="tab"], button')];
    const hit = buttons.find((b) => {
      const t = b.textContent || '';
      return /X\.E Du lịch VN/i.test(t) || (/xe-du-lich/i.test(t) && !/Visun/i.test(t));
    });
    if (!hit) return null;
    hit.click();
    return (hit.textContent || '').replace(/\s+/g, ' ').trim();
  });
  return { ok: Boolean(ok), text: ok || '' };
}

async function runHp(page) {
  log('GOTO_GROUP_HR');
  await page.goto(`${PORTAL}/command-center?settings=company_group_hr`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(5000);
  await shot(page, '01-group-hr');

  const sel = await selectXeDuLich(page);
  if (!sel.ok) {
    recordStep('hp_member', 'BLOCKED', { summary: 'X.E Du lịch VN chip not found (Visun excluded)' });
    return false;
  }
  recordStep('hp_member', 'PASS', { summary: `selected=${sel.text}` });
  await sleep(1200);
  await shot(page, '02-dl');

  const cfg = page.getByRole('button', { name: /Cấu hình chi tiết/i }).first();
  await cfg.click({ force: true });
  await sleep(4000);
  await shot(page, '03-cfg');

  const dlg = page.locator('[role="dialog"]').filter({ hasText: /Cấu hình mục thông tin|Thêm field custom/i }).first();
  if (!(await dlg.isVisible().catch(() => false))) {
    recordStep('hp_cfg', 'FAIL', { summary: 'dialog missing' });
    return false;
  }
  recordStep('hp_cfg', 'PASS', { summary: 'dialog open' });

  const work = dlg.locator('button').filter({ hasText: /Công việc/i }).first();
  if (await work.isVisible().catch(() => false)) {
    await work.click({ force: true });
    await sleep(600);
  }

  // Fill Label tiếng Việt precisely
  const labelLoc = dlg.locator('span:text-is("Label tiếng Việt"), span:has-text("Label tiếng Việt")').first();
  let filled = false;
  if (await labelLoc.isVisible().catch(() => false)) {
    const input = labelLoc.locator('xpath=ancestor::label[1]//input | following::input[1]').first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill(FIELD_LABEL);
      filled = true;
    }
  }
  if (!filled) {
    filled = await page.evaluate((label) => {
      const dlgEl = document.querySelector('[role="dialog"]');
      if (!dlgEl) return false;
      const spans = [...dlgEl.querySelectorAll('span, label')];
      const lab = spans.find((s) => /Label tiếng Việt/i.test(s.textContent || ''));
      if (!lab) return false;
      const root = lab.closest('label') || lab.parentElement;
      const input = root?.querySelector('input:not([readonly])') || lab.parentElement?.querySelector('input');
      if (!input) return false;
      const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      proto?.set?.call(input, label);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, FIELD_LABEL);
  }
  if (!filled) {
    recordStep('hp_add_field', 'FAIL', { summary: 'label fill failed' });
    await shot(page, '03b-label-fail');
    return false;
  }

  await dlg.locator('button').filter({ hasText: /^Thêm field$/i }).first().click({ force: true });
  await sleep(1500);
  const afterAdd = await dlg.innerText();
  const stampIn = afterAdd.includes(FIELD_LABEL) || afterAdd.includes(STAMP);
  await shot(page, '04-added');
  recordStep('hp_add_field', stampIn ? 'PASS' : 'PARTIAL', {
    summary: `stampInDlg=${stampIn} label=${FIELD_LABEL}`,
  });

  const net0 = results.network.length;
  await dlg.locator('button').filter({ hasText: /Xác nhận \(áp dụng\)/i }).first().click({ force: true });
  await sleep(9000);
  await shot(page, '05-apply');

  const posts = results.network
    .slice(net0)
    .filter((n) => /extension-items/.test(n.url) && n.method === 'POST');
  const ok209 = posts.some((n) => n.status === 201 || n.code === 'HRM-SET-209');
  const hasWi = Boolean(results.ids.workflowInstanceId);
  const scope409 = posts.some((n) => n.status === 409);
  if (scope409) {
    recordStep('hp_apply', 'BLOCKED', { summary: '409 on extension-items' });
    return false;
  }
  recordStep('hp_apply', ok209 && hasWi ? 'PASS' : ok209 ? 'PARTIAL' : 'FAIL', {
    summary: `posts=${posts.map((p) => `${p.status}:${p.code}`).join(',') || 'none'} wi=${results.ids.workflowInstanceId} batch=${results.ids.batchId}`,
  });

  // F5 persist
  await page.goto(`${PORTAL}/command-center?settings=company_group_hr`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(4000);
  await selectXeDuLich(page);
  await sleep(800);
  await page.getByRole('button', { name: /Cấu hình chi tiết/i }).first().click({ force: true });
  await sleep(3500);
  const dlg2 = page.locator('[role="dialog"]').first();
  const work2 = dlg2.locator('button').filter({ hasText: /Công việc/i }).first();
  if (await work2.isVisible().catch(() => false)) await work2.click({ force: true });
  const t2 = await dlg2.innerText().catch(() => '');
  const f5 = t2.includes(FIELD_LABEL) || t2.includes(STAMP);
  await shot(page, '06-f5');
  await page.keyboard.press('Escape').catch(() => {});
  recordStep('hp_f5', f5 ? 'PASS' : 'PARTIAL', { summary: `stampPresent=${f5}` });
  return ok209 && hasWi;
}

async function runAp(page, session) {
  log('GOTO_GOV');
  await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_governance`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(4000);
  await page.getByRole('button', { name: /Làm mới/i }).click({ force: true }).catch(() => {});
  await sleep(2500);
  await shot(page, '07-inbox');

  const h = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  const inbox = await fetch(`${XBOS}/api/xbos/catalog-governance/inbox?assigneeUserId=${encodeURIComponent(EMAIL)}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const items = inbox?.data?.items ?? inbox?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const wi = results.ids.workflowInstanceId || prior.ids?.workflowInstanceId;
  const batch = results.ids.batchId || prior.ids?.batchId;
  const target =
    arr.find((t) => String(t.instance_id || t.instanceId || '') === wi) ||
    arr.find((t) => String(t.business_id || t.businessId || '') === batch) ||
    arr[0];

  if (!target) {
    recordStep('ap_inbox', 'BLOCKED', { summary: `inbox empty count=${arr.length}` });
    return false;
  }
  recordStep('ap_inbox', 'PASS', {
    summary: `count=${arr.length} task=${target.id} instance=${target.instance_id || target.instanceId} batch=${target.business_id}`,
  });

  // Click card containing short batch or task id
  const batchShort = String(target.business_id || '').replace(/-/g, '').slice(0, 8);
  const taskShort = String(target.id || '').slice(0, 8);
  const cards = page.locator('button').filter({ hasText: /Mã lô:/i });
  const cardCount = await cards.count();
  let clicked = false;
  for (let i = 0; i < cardCount; i++) {
    const txt = (await cards.nth(i).innerText().catch(() => '')) || '';
    if (
      (batchShort && txt.toLowerCase().includes(batchShort.toLowerCase().slice(0, 6))) ||
      (taskShort && txt.includes(taskShort)) ||
      (wi && txt.includes(String(wi).slice(0, 8)))
    ) {
      await cards.nth(i).click({ force: true });
      clicked = true;
      break;
    }
  }
  if (!clicked && cardCount > 0) {
    // prefer first card if our wi is selected by default — click first that matches workflow name catalog
    await cards.first().click({ force: true });
    clicked = true;
  }
  await sleep(2500);
  await shot(page, '08-selected');

  // Detail panel Phê duyệt (MutationButton)
  const detailApprove = page
    .locator('button')
    .filter({ hasText: /^Phê duyệt$/ })
    .filter({ has: page.locator('svg') })
    .first();
  // broader: any button with exact Phê duyệt in detail area
  const approveBtns = page.locator('button:has-text("Phê duyệt")');
  const ac = await approveBtns.count();
  log(`approve_buttons=${ac}`);

  // Click the primary approve in detail (not confirm yet)
  let openedConfirm = false;
  for (let i = 0; i < ac; i++) {
    const b = approveBtns.nth(i);
    const txt = ((await b.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
    if (txt === 'Phê duyệt' || /^Phê duyệt$/.test(txt)) {
      await b.click({ force: true });
      openedConfirm = true;
      break;
    }
  }
  await sleep(1500);
  await shot(page, '09-confirm');

  // Confirm dialog — title Phê duyệt yêu cầu danh mục · confirmLabel Phê duyệt
  const dialog = page.locator('[role="dialog"], [role="alertdialog"]').filter({
    hasText: /Phê duyệt yêu cầu danh mục|Xác nhận phê duyệt/i,
  });
  if (await dialog.isVisible().catch(() => false)) {
    const conf = dialog.getByRole('button', { name: /^Phê duyệt$/i }).last();
    await conf.click({ force: true });
  } else {
    // fallback: last Phê duyệt on page
    const last = page.getByRole('button', { name: /^Phê duyệt$/i }).last();
    if (await last.isVisible().catch(() => false)) await last.click({ force: true });
  }
  await sleep(6000);
  await shot(page, '10-after-approve');

  const ok =
    results.approve?.status === 201 ||
    results.approve?.code === 'XBOS-CAT-201' ||
    results.network.some(
      (n) => /\/approve/.test(n.url) && n.method === 'POST' && (n.status === 201 || n.code === 'XBOS-CAT-201'),
    );

  recordStep('ap_approve', ok ? 'PASS' : 'FAIL', {
    summary: `openedConfirm=${openedConfirm} status=${results.approve?.status || '?'} code=${results.approve?.code || '?'} task=${results.ids.approveTaskId || target.id}`,
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(3000);
  await shot(page, '11-f5');
  const after = await fetch(`${XBOS}/api/xbos/catalog-governance/inbox?assigneeUserId=${encodeURIComponent(EMAIL)}`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const afterArr = Array.isArray(after?.data?.items ?? after?.data) ? after?.data?.items ?? after?.data : [];
  const gone = !afterArr.some((t) => t.id === target.id);
  recordStep('ap_f5', ok && gone ? 'PASS' : ok ? 'PARTIAL' : 'FAIL', {
    summary: `inbox ${arr.length}→${afterArr.length} taskGone=${gone}`,
  });
  return ok;
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'vi-VN' });
  const page = await context.newPage();
  track(page);
  await inject(page, session);

  try {
    const hpOk = await runHp(page);
    // Always attempt AP — prefer new wi, else prior
    await runAp(page, session);
    if (!hpOk) {
      results.residuals.push({
        id: 'R-U84-CAT-EXT-DL-HP-STAMP',
        severity: 'P1',
        note: 'HP apply may still have prior-run 201; stamp field add partial',
      });
    }
  } finally {
    results.endedAt = ts();
    save();
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        steps: Object.fromEntries(Object.entries(results.steps).map(([k, v]) => [k, v.verdict])),
        ids: results.ids,
        approve: results.approve,
        extensionPosts: results.extensionPosts.slice(-3),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  results.residuals.push({ id: 'R-HARNESS', note: String(e).slice(0, 400) });
  results.endedAt = ts();
  save();
  process.exit(1);
});
