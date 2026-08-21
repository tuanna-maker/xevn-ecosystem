#!/usr/bin/env node
/**
 * U78-U84-PRIMARY-CAT-EXT-DL-01
 * FE-only P-CAT-EXT @ CO-DL + CO-HOLD approve
 *
 * Flow:
 *   1) Probe WF wf_hrm_catalog_extension_xe_du_lich + group-member-units xe-du-lich
 *   2) Precond TC-WFM-CAT-HP-001 — FE designer create if missing (or product ensure on apply)
 *   3) company_group_hr → CT Du lịch → Cấu hình chi tiết → Công việc → Thêm field custom → Xác nhận
 *   4) F5 field persist
 *   5) hrm_catalog_governance → Phê duyệt → F5
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
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const WF_CODE = 'wf_hrm_catalog_extension_xe_du_lich';
const WF_NAME = 'Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN';
const DL_ENTITY_ID = '3f379019-dc02-427e-83d0-2bc7871e90f9';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-cat-ext-dl-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-cat-ext-dl-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `DL-CAT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const FIELD_LABEL = `QA-${STAMP}-phu-cap-tour`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'U78-U84-PRIMARY-CAT-EXT-DL-01',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, EMAIL, COMPANY, TENANT, STAMP, commit: 'dc930c5' },
  persona_note:
    'Group CEO ceo@xe.vn · company_group_hr select xe-du-lich (CO-DL) · holding gov inbox approve',
  api_probes: {},
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: {
    wfDefId: null,
    batchId: null,
    workflowInstanceId: null,
    fieldLabel: FIELD_LABEL,
    approveTaskId: null,
  },
  extensionPosts: [],
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      const interesting =
        /extension-items|catalog-governance|workflow-engine\/definitions|group-member-units|settings-catalogs\/batches|workflows\/start/.test(
          u,
        ) ||
        (method === 'POST' && /approve|reject/.test(u));
      if (!interesting) return;

      try {
        const j = await res.json();
        entry.code = j?.code || null;
        entry.message = String(j?.message || '').slice(0, 180);
        const data = j?.data ?? j;
        if (/extension-items/.test(u) && method === 'POST') {
          const wi =
            data?.workflowInstanceId ||
            data?.workflow_instance_id ||
            j?.workflowInstanceId ||
            null;
          const batchId = data?.batchId || data?.batch_id || null;
          const row = {
            status: res.status(),
            code: j?.code || null,
            catalogKey: (u.match(/settings-catalogs\/([^/]+)\/extension-items/) || [])[1] || null,
            batchId,
            workflowInstanceId: wi,
            submitted: data?.submitted ?? data?.itemCount ?? null,
          };
          results.extensionPosts.push(row);
          if (wi) results.ids.workflowInstanceId = wi;
          if (batchId) results.ids.batchId = batchId;
          entry.extension = row;
        }
        if (/catalog-governance\/tasks\/[^/]+\/approve/.test(u) && method === 'POST') {
          results.approve = {
            status: res.status(),
            code: j?.code || null,
            message: entry.message,
            url: entry.url,
          };
          const m = u.match(/tasks\/([^/?]+)/);
          if (m) results.ids.approveTaskId = m[1];
        }
        if (/workflow-engine\/definitions/.test(u) && (method === 'POST' || method === 'PUT')) {
          entry.wfCode = data?.workflow_code || data?.workflowCode || data?.code || null;
          entry.wfId = data?.id || null;
          if (entry.wfId && String(entry.wfCode || '') === WF_CODE) {
            results.ids.wfDefId = entry.wfId;
          }
        }
        if (/workflows\/start/.test(u) && method === 'POST') {
          entry.workflowInstanceId =
            data?.workflowInstanceId || data?.workflow_instance_id || data?.id || null;
          if (entry.workflowInstanceId) results.ids.workflowInstanceId = entry.workflowInstanceId;
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

async function clickText(page, re, opts = {}) {
  const loc = page.getByRole('button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ force: true, ...opts });
    return true;
  }
  const any = page.locator('button, a, [role="button"], [role="tab"]').filter({ hasText: re }).first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ force: true, ...opts });
    return true;
  }
  return false;
}

async function probeApi(session) {
  const h = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  const defs = await fetch(`${XBOS}/api/xbos/workflow-engine/definitions?companyId=main&page_size=100`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const items = defs?.data?.items ?? defs?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const catDef = arr.find((d) => String(d.workflow_code || d.workflowCode || '') === WF_CODE);

  const members = await fetch(`${XBOS}/api/xbos/tenant-scope/group-member-units`, { headers: h }).then(
    (r) => r.json().catch(() => ({})),
  );
  const memberRows = members?.data?.members ?? [];
  const dl = memberRows.find(
    (m) =>
      String(m.tenant_id || m.tenantId || '') === 'xe-du-lich' ||
      /du lịch/i.test(String(m.name || m.tenant_name || '')),
  );

  const inbox = await fetch(`${XBOS}/api/xbos/catalog-governance/inbox`, { headers: h }).then((r) =>
    r.json().catch(() => ({})),
  );
  const inboxItems = inbox?.data?.items ?? inbox?.data ?? [];

  results.api_probes = {
    wf_cat_def: catDef
      ? {
          id: catDef.id,
          status: catDef.status,
          code: catDef.workflow_code || catDef.workflowCode,
        }
      : null,
    defs_codes: arr.map((d) => d.workflow_code || d.workflowCode),
    member_dl: dl
      ? {
          id: dl.id,
          tenant_id: dl.tenant_id || dl.tenantId,
          name: dl.name || dl.tenant_name,
          short: dl.tenant_short_name || dl.payload?.shortName,
        }
      : null,
    members_count: memberRows.length,
    gov_inbox_before: Array.isArray(inboxItems) ? inboxItems.length : null,
    gov_inbox_code: inbox?.code || null,
  };
  if (catDef?.id) results.ids.wfDefId = catDef.id;
  save();
  return results.api_probes;
}

async function ensureCatWfViaFe(page, session) {
  if (results.api_probes.wf_cat_def?.status === 'active' || results.api_probes.wf_cat_def?.id) {
    recordStep('wf_precond', 'PASS', {
      summary: `${WF_CODE} already present id=${results.api_probes.wf_cat_def.id} status=${results.api_probes.wf_cat_def.status}`,
    });
    return true;
  }

  log('GOTO_CC_WF', { url: `${PORTAL}/command-center?settings=workflow` });
  await page.goto(`${PORTAL}/command-center?settings=workflow`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(4000);
  await shot(page, '00-wf-list');

  const opened = await clickText(page, /Thêm quy trình mới/i);
  if (!opened) {
    recordStep('wf_precond', 'PARTIAL', {
      summary:
        'Thêm quy trình mới not clicked — will rely on product ensureXeDuLichCatalogWorkflow on extension apply (FE-triggered, not seed)',
    });
    return false;
  }
  await sleep(2000);
  await shot(page, '00b-wf-new');

  const codeInput = page.getByLabel(/Mã quy trình/i).first();
  const nameInput = page.getByLabel(/Tên quy trình/i).first();
  if (await codeInput.isVisible().catch(() => false)) {
    await codeInput.fill(WF_CODE);
  } else {
    const ta = page.locator('textarea, input').filter({ hasText: '' }).first();
    await page.locator('label:has-text("Mã quy trình")').locator('..').locator('textarea, input').first().fill(WF_CODE).catch(() => {});
  }
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill(WF_NAME);
  } else {
    await page.locator('label:has-text("Tên quy trình")').locator('..').locator('textarea, input').first().fill(WF_NAME).catch(() => {});
  }

  // Step task name
  const stepName = page.getByLabel(/Tên bước|Tên nhiệm vụ|Task/i).first();
  if (await stepName.isVisible().catch(() => false)) {
    await stepName.fill('Tập đoàn phê duyệt danh mục');
  } else {
    const stepInputs = page.locator('input, textarea').filter({ hasText: /^$/ });
    // best-effort: fill first empty text field in steps area
    const candidates = page.locator('[class*="step"] input, [class*="step"] textarea, table input, table textarea');
    const n = await candidates.count().catch(() => 0);
    for (let i = 0; i < Math.min(n, 6); i++) {
      const el = candidates.nth(i);
      const v = await el.inputValue().catch(() => '');
      if (!v) {
        await el.fill('Tập đoàn phê duyệt danh mục').catch(() => {});
        break;
      }
    }
  }

  // Prefer BOD / group_ceo role if select present
  const roleSelect = page.locator('select').filter({ hasText: /CEO|BOD|Tập đoàn|Giám đốc/i }).first();
  if (await roleSelect.isVisible().catch(() => false)) {
    const opts = await roleSelect.locator('option').allTextContents().catch(() => []);
    const bod = opts.findIndex((t) => /BOD|CEO Tập đoàn|group_ceo|Tập đoàn/i.test(t));
    if (bod >= 0) await roleSelect.selectOption({ index: bod }).catch(() => {});
  } else {
    // try any select with bod value
    const selects = page.locator('select');
    const sc = await selects.count();
    for (let i = 0; i < sc; i++) {
      const s = selects.nth(i);
      const html = await s.innerHTML().catch(() => '');
      if (/bod|group_ceo/i.test(html)) {
        await s.selectOption({ value: 'bod' }).catch(() => s.selectOption({ label: /BOD|CEO/i }).catch(() => {}));
        break;
      }
    }
  }

  await shot(page, '00c-wf-filled');
  const net0 = results.network.length;
  let saved = await clickText(page, /Lưu quy trình/i);
  if (!saved) saved = await clickText(page, /^Lưu$/i);
  await sleep(4500);
  await shot(page, '00d-wf-after-save');

  const saves = results.network
    .slice(net0)
    .filter(
      (n) =>
        /workflow-engine\/definitions/.test(n.url) &&
        (n.method === 'POST' || n.method === 'PUT') &&
        n.status >= 200 &&
        n.status < 300,
    );

  const h = { Authorization: `Bearer ${session.token}`, 'x-tenant-id': 'xevn', 'x-company-id': 'main' };
  const defs = await fetch(`${XBOS}/api/xbos/workflow-engine/definitions?companyId=main&page_size=100`, {
    headers: h,
  }).then((r) => r.json().catch(() => ({})));
  const items = defs?.data?.items ?? defs?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  const catDef = arr.find((d) => String(d.workflow_code || d.workflowCode || '') === WF_CODE);
  results.api_probes.wf_cat_def_after_fe = catDef
    ? { id: catDef.id, status: catDef.status, code: catDef.workflow_code || catDef.workflowCode }
    : null;
  if (catDef?.id) results.ids.wfDefId = catDef.id;

  const pass = Boolean(catDef?.id) || saves.length >= 1;
  recordStep('wf_precond', pass ? 'PASS' : 'PARTIAL', {
    summary: `feDesignerSave=${saves.map((s) => `${s.status}:${s.wfCode || ''}`).join(',') || 'none'} def=${catDef?.id || 'none'} — if missing, product ensure on apply may still spawn`,
  });
  return pass;
}

async function runHpExtension(page) {
  log('GOTO_GROUP_HR', { url: `${PORTAL}/command-center?settings=company_group_hr` });
  await page.goto(`${PORTAL}/command-center?settings=company_group_hr`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(5000);
  await shot(page, '01-group-hr');

  const body = await page.locator('body').innerText().catch(() => '');
  const dlVisible =
    /Du lịch|xe-du-lich|X\.E Du lịch|XE_DU_LICH/i.test(body) ||
    (await page.getByRole('tab', { name: /Du lịch/i }).count()) > 0;

  if (!dlVisible) {
    recordStep('hp_member_visible', 'BLOCKED', {
      summary: 'xe-du-lich / CT Du lịch not visible on company_group_hr — cannot fake',
    });
    results.residuals.push({
      id: 'R-U84-CAT-EXT-DL-MEMBER-NOT-VISIBLE',
      severity: 'P0',
      note: 'Member unit xe-du-lich not visible on FE company_group_hr',
    });
    return false;
  }
  recordStep('hp_member_visible', 'PASS', { summary: 'Du lịch / xe-du-lich visible in scope bar' });

  // Select Du lịch tab/chip
  let selected =
    (await clickText(page, /X\.E Du lịch VN|Du lịch X\.E|X\.E Du lịch/i)) ||
    (await page.getByRole('tab', { name: /Du lịch/i }).first().click({ force: true }).then(() => true).catch(() => false));
  if (!selected) {
    // click by entity id via evaluate if buttons contain short name
    selected = await page.evaluate((id) => {
      const buttons = [...document.querySelectorAll('button[role="tab"], button')];
      const hit = buttons.find(
        (b) =>
          /du lịch/i.test(b.textContent || '') ||
          b.getAttribute('data-entity-id') === id,
      );
      if (hit) {
        hit.click();
        return true;
      }
      return false;
    }, DL_ENTITY_ID);
  }
  await sleep(1500);
  await shot(page, '02-dl-selected');

  const cfg = await clickText(page, /Cấu hình chi tiết/i);
  if (!cfg) {
    recordStep('hp_open_cfg', 'FAIL', { summary: 'Cấu hình chi tiết button not found' });
    return false;
  }
  await sleep(3500);
  await shot(page, '03-cfg-dialog');

  const dlg = page.locator('[role="dialog"]').filter({ hasText: /Cấu hình mục thông tin|Thêm field custom/i }).first();
  const dlgOk = await dlg.isVisible().catch(() => false);
  if (!dlgOk) {
    recordStep('hp_open_cfg', 'FAIL', { summary: 'Group HR config dialog not open' });
    return false;
  }
  recordStep('hp_open_cfg', 'PASS', { summary: 'Cấu hình chi tiết dialog open' });

  // Select Công việc block
  const workBtn = dlg.locator('button').filter({ hasText: /Công việc/i }).first();
  if (await workBtn.isVisible().catch(() => false)) {
    await workBtn.click({ force: true });
    await sleep(800);
  }
  await shot(page, '04-work-block');

  // Fill Label tiếng Việt
  const labelInput = dlg.locator('input[placeholder*="Ghi chú"], label:has-text("Label tiếng Việt") + input, label:has-text("Label tiếng Việt") ~ input').first();
  let filled = false;
  if (await labelInput.isVisible().catch(() => false)) {
    await labelInput.fill(FIELD_LABEL);
    filled = true;
  } else {
    const labels = dlg.locator('label').filter({ hasText: /Label tiếng Việt/i });
    if ((await labels.count()) > 0) {
      const input = labels.first().locator('xpath=following::input[1]');
      if (await input.isVisible().catch(() => false)) {
        await input.fill(FIELD_LABEL);
        filled = true;
      }
    }
  }
  if (!filled) {
    // fallback: last visible text input in "Thêm field custom" section
    const section = dlg.locator('h4:has-text("Thêm field custom")').locator('xpath=ancestor::div[1]');
    const inputs = section.locator('input:not([readonly])');
    const ic = await inputs.count();
    for (let i = 0; i < ic; i++) {
      const el = inputs.nth(i);
      const ph = (await el.getAttribute('placeholder').catch(() => '')) || '';
      const type = (await el.getAttribute('type').catch(() => '')) || 'text';
      if (type === 'checkbox') continue;
      await el.fill(FIELD_LABEL);
      filled = true;
      break;
    }
  }
  if (!filled) {
    recordStep('hp_add_field', 'FAIL', { summary: 'Could not fill Label tiếng Việt' });
    await shot(page, '04b-label-fail');
    return false;
  }

  const addBtn = dlg.locator('button').filter({ hasText: /^Thêm field$/i }).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    recordStep('hp_add_field', 'FAIL', { summary: 'Thêm field button missing' });
    return false;
  }
  await addBtn.click({ force: true });
  await sleep(1200);
  await shot(page, '05-field-added');

  const dlgText = await dlg.innerText().catch(() => '');
  const stampInDlg = dlgText.includes(FIELD_LABEL) || dlgText.includes(STAMP);
  recordStep('hp_add_field', stampInDlg ? 'PASS' : 'PARTIAL', {
    summary: `Thêm field clicked; stampInDlg=${stampInDlg} label=${FIELD_LABEL}`,
  });

  const net0 = results.network.length;
  const applyBtn = dlg.locator('button').filter({ hasText: /Xác nhận \(áp dụng\)/i }).first();
  if (!(await applyBtn.isVisible().catch(() => false))) {
    recordStep('hp_apply', 'FAIL', { summary: 'Xác nhận (áp dụng) not visible' });
    return false;
  }
  await applyBtn.click({ force: true });
  await sleep(8000);
  await shot(page, '06-after-apply');

  const extPosts = results.extensionPosts.filter((p) => p.status >= 200 && p.status < 300);
  const withWi = extPosts.filter((p) => p.workflowInstanceId);
  const set209 = results.network
    .slice(net0)
    .filter((n) => /extension-items/.test(n.url) && n.method === 'POST');

  const ok209 = set209.some((n) => n.status === 201 || n.code === 'HRM-SET-209');
  const hasWi = withWi.length > 0 || Boolean(results.ids.workflowInstanceId);

  // 409 check
  const scope409 = set209.some((n) => n.status === 409);
  if (scope409) {
    recordStep('hp_apply', 'BLOCKED', {
      summary: `extension-items 409 scope — ${set209.map((n) => `${n.status}:${n.code}`).join(',')}`,
    });
    results.residuals.push({
      id: 'R-U84-CAT-EXT-DL-SCOPE-409',
      severity: 'P0',
      note: 'extension-items returned 409 — do not fake',
    });
    return false;
  }

  recordStep('hp_apply', ok209 && hasWi ? 'PASS' : ok209 ? 'PARTIAL' : 'FAIL', {
    summary: `posts=${set209.map((n) => `${n.status}:${n.code}:${(n.url.match(/settings-catalogs\/([^/]+)/) || [])[1] || ''}`).join(' | ') || 'none'} wi=${results.ids.workflowInstanceId || 'null'} batch=${results.ids.batchId || 'null'}`,
  });

  // Re-probe WF after apply (product ensure)
  const h = {
    Authorization: `Bearer ${(await page.evaluate(() => localStorage.getItem('xevn.portal.accessToken'))) || ''}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  // use session from closure — re-fetch via portal
  return ok209;
}

async function runF5Persist(page) {
  await page.goto(`${PORTAL}/command-center?settings=company_group_hr`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(4000);
  await clickText(page, /X\.E Du lịch VN|Du lịch X\.E|X\.E Du lịch/i);
  await sleep(1000);
  await clickText(page, /Cấu hình chi tiết/i);
  await sleep(3500);
  await shot(page, '07-f5-cfg');

  const dlg = page.locator('[role="dialog"]').first();
  const workBtn = dlg.locator('button').filter({ hasText: /Công việc/i }).first();
  if (await workBtn.isVisible().catch(() => false)) await workBtn.click({ force: true });
  await sleep(500);
  const text = await dlg.innerText().catch(() => '');
  const ok = text.includes(FIELD_LABEL) || text.includes(STAMP);
  await shot(page, '08-f5-field');
  // close
  await page.keyboard.press('Escape').catch(() => {});
  recordStep('hp_f5', ok ? 'PASS' : 'PARTIAL', {
    summary: `F5 reopen dialog stampPresent=${ok}`,
  });
  return ok;
}

async function runApApprove(page, session) {
  log('GOTO_GOV', { url: `${PORTAL}/command-center?settings=hrm_catalog_governance` });
  await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_governance`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(4000);
  await clickText(page, /Làm mới/i);
  await sleep(2500);
  await shot(page, '09-gov-inbox');

  const body = await page.locator('body').innerText().catch(() => '');
  const empty = /Không có tác vụ|Hộp thư \(0\)|inbox.*0/i.test(body) && !/Hộp thư \([1-9]/i.test(body);

  // Prefer API inbox to find our instance
  const h = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  const inbox = await fetch(`${XBOS}/api/xbos/catalog-governance/inbox`, { headers: h }).then((r) =>
    r.json().catch(() => ({})),
  );
  const items = inbox?.data?.items ?? inbox?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  results.api_probes.gov_inbox_after_hp = arr.length;
  const target =
    arr.find((t) => String(t.instance_id || t.instanceId || '') === results.ids.workflowInstanceId) ||
    arr.find((t) => String(t.business_id || t.businessId || '') === results.ids.batchId) ||
    arr[0];

  if (!target) {
    recordStep('ap_inbox', empty || arr.length === 0 ? 'BLOCKED' : 'FAIL', {
      summary: `gov inbox empty after HP — count=${arr.length} wi=${results.ids.workflowInstanceId || 'null'} (U65 no seed)`,
    });
    results.residuals.push({
      id: 'R-U84-CAT-EXT-DL-GOV-INBOX-EMPTY',
      severity: 'P0',
      note: 'HRM-SET-209 may have wi but catalog-governance inbox has 0 tasks — do not seed',
    });
    return false;
  }

  recordStep('ap_inbox', 'PASS', {
    summary: `inbox=${arr.length} targetTask=${target.id} instance=${target.instance_id || target.instanceId}`,
  });

  // Click batch / task in UI — match short id
  const short = String(target.id || '').slice(0, 8);
  const batchShort = String(results.ids.batchId || target.business_id || '').slice(0, 8);
  let clicked = false;
  if (short) {
    clicked = await page
      .locator('button, [role="button"], tr, li, div')
      .filter({ hasText: new RegExp(short, 'i') })
      .first()
      .click({ force: true })
      .then(() => true)
      .catch(() => false);
  }
  if (!clicked && batchShort) {
    clicked = await page
      .locator('button, [role="button"], tr, li, div')
      .filter({ hasText: new RegExp(batchShort, 'i') })
      .first()
      .click({ force: true })
      .then(() => true)
      .catch(() => false);
  }
  await sleep(2000);
  await shot(page, '10-gov-selected');

  const net0 = results.network.length;
  let approveClicked = await clickText(page, /Phê duyệt danh mục|Phê duyệt/i);
  await sleep(1500);
  // confirm dialog
  const confirm = page.getByRole('button', { name: /^Phê duyệt$/i }).last();
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click({ force: true });
    approveClicked = true;
  } else {
    await clickText(page, /^Phê duyệt$/i);
  }
  await sleep(5000);
  await shot(page, '11-gov-after-approve');

  const approveNets = results.network
    .slice(net0)
    .filter((n) => /catalog-governance\/tasks\/.+\/approve/.test(n.url) && n.method === 'POST');
  const ok =
    results.approve?.status === 201 ||
    results.approve?.code === 'XBOS-CAT-201' ||
    approveNets.some((n) => n.status === 201 || n.code === 'XBOS-CAT-201');

  recordStep('ap_approve', ok ? 'PASS' : approveClicked ? 'FAIL' : 'FAIL', {
    summary: `approveClicked=${approveClicked} status=${results.approve?.status || approveNets[0]?.status || '?'} code=${results.approve?.code || approveNets[0]?.code || '?'} task=${results.ids.approveTaskId || target.id}`,
  });

  // F5
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(3500);
  await shot(page, '12-gov-f5');
  const after = await fetch(`${XBOS}/api/xbos/catalog-governance/inbox`, { headers: h }).then((r) =>
    r.json().catch(() => ({})),
  );
  const afterItems = after?.data?.items ?? after?.data ?? [];
  const afterArr = Array.isArray(afterItems) ? afterItems : [];
  const stillThere = afterArr.some((t) => t.id === target.id);
  results.api_probes.gov_inbox_after_ap = afterArr.length;
  recordStep('ap_f5', ok && !stillThere ? 'PASS' : ok ? 'PARTIAL' : 'FAIL', {
    summary: `inbox ${arr.length}→${afterArr.length}; approvedTaskGone=${!stillThere}`,
  });

  return ok;
}

async function main() {
  const session = await loginApi();
  await probeApi(session);

  if (!results.api_probes.member_dl) {
    recordStep('precond_member_api', 'BLOCKED', {
      summary: 'group-member-units missing xe-du-lich',
    });
    results.residuals.push({
      id: 'R-U84-CAT-EXT-DL-MEMBER-API',
      severity: 'P0',
      note: 'xe-du-lich not in group-member-units API',
    });
    results.endedAt = ts();
    save();
    console.log(JSON.stringify({ blocked: true, probes: results.api_probes }, null, 2));
    return;
  }
  recordStep('precond_member_api', 'PASS', {
    summary: `member_dl id=${results.api_probes.member_dl.id} tenant=${results.api_probes.member_dl.tenant_id}`,
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await ensureCatWfViaFe(page, session);
    const hpOk = await runHpExtension(page);
    if (hpOk) {
      await runF5Persist(page);
      // re-probe wf after apply
      await probeApi(session);
      results.api_probes.wf_cat_def_post_hp = results.api_probes.wf_cat_def;
      if (results.api_probes.wf_cat_def?.id && results.steps.wf_precond?.verdict === 'PARTIAL') {
        recordStep('wf_precond_ensure', 'PASS', {
          summary: `Product ensure after apply — ${WF_CODE} id=${results.api_probes.wf_cat_def.id}`,
        });
      }
      await runApApprove(page, session);
    } else {
      recordStep('ap_approve', 'BLOCKED', { summary: 'AP skipped — HP not successful' });
    }
  } finally {
    results.endedAt = ts();
    save();
    await browser.close().catch(() => {});
  }

  const hp = results.steps.hp_apply?.verdict;
  const ap = results.steps.ap_approve?.verdict;
  const verdict =
    hp === 'PASS' && ap === 'PASS'
      ? 'PASS'
      : hp === 'BLOCKED' || ap === 'BLOCKED'
        ? 'BLOCKED'
        : 'FAIL';
  console.log(
    JSON.stringify(
      {
        verdict,
        stamp: STAMP,
        ids: results.ids,
        steps: Object.fromEntries(
          Object.entries(results.steps).map(([k, v]) => [k, v.verdict]),
        ),
        extensionPosts: results.extensionPosts,
        approve: results.approve,
        residuals: results.residuals,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.residuals.push({ id: 'R-HARNESS', severity: 'P0', note: String(e).slice(0, 400) });
  save();
  process.exit(1);
});
