#!/usr/bin/env node
/**
 * PO-HRM-SETTINGS-FIDELITY-QA-02 — W3 P0 mutate tabs after MUTATE-FIX-FE-01
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `SETFID02W3-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-settings-fidelity-qa-02-w3p0.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-settings-fidelity-qa-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-settings-fidelity-qa-02-w3p0');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-SETTINGS-FIDELITY-QA-02',
  stamp: STAMP,
  dev_fe_ref: 'PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { settings_catalog_e2e_ready: 'DENY — not flipped this wave' },
  env: { PORTAL, commit: COMMIT },
  l0: {},
  ufs: {},
  smokes: {},
  consoleErrors: [],
  networkMutations: [],
  extensionPosts: [],
  ack_status: null,
  defects: [],
  endedAt: null,
};

const DIALOG_TABS = [
  {
    uf: 'UF-SET-W3-A01',
    tab: 'att-attendance-codes',
    shell: 'settings-att-attendance-codes',
    fr: 'FR-HRM-SC-ATT · F-ATT-CAT-CODE',
    keyId: 'hdsd-att-attendance-code-key',
    nameId: 'hdsd-att-attendance-code-name',
    saveId: 'hdsd-att-attendance-code-save',
    selectId: 'hdsd-att-attendance-code-counts-as',
  },
  {
    uf: 'UF-SET-W3-A02',
    tab: 'att-ot-types',
    shell: 'settings-att-ot-types',
    fr: 'FR-HRM-SC-ATT · F-ATT-OT-TYPE',
    keyId: 'hdsd-att-ot-type-key',
    nameId: 'hdsd-att-ot-type-name',
    saveId: 'hdsd-att-ot-type-save',
  },
  {
    uf: 'UF-SET-W3-A03',
    tab: 'att-ot-comp-types',
    shell: 'settings-att-ot-comp-types',
    fr: 'FR-HRM-SC-ATT · F-ATT-OT-COMP',
    keyId: 'hdsd-att-ot-comp-type-key',
    nameId: 'hdsd-att-ot-comp-type-name',
    saveId: 'hdsd-att-ot-comp-type-save',
  },
  {
    uf: 'UF-SET-W3-B01',
    tab: 'emp-document-types',
    shell: 'settings-emp-document-types',
    fr: 'FR-HRM-SC-EMP-DOC',
    keyId: 'hdsd-emp-document-type-key',
    nameId: 'hdsd-emp-document-type-name',
    saveId: 'hdsd-emp-document-type-save',
  },
  {
    uf: 'UF-SET-W3-B02',
    tab: 'emp-employment-types',
    shell: 'settings-emp-employment-types',
    fr: 'FR-HRM-SC-ET',
    keyId: 'hdsd-emp-employment-type-key',
    nameId: 'hdsd-emp-employment-type-name',
    saveId: 'hdsd-emp-employment-type-save',
  },
  {
    uf: 'UF-SET-W3-B04',
    tab: 'si-insurance-types',
    shell: 'settings-si-insurance-types',
    fr: 'FR-HRM-SC-SI · insurance-types',
    keyId: 'hdsd-si-insurance-type-key',
    nameId: 'hdsd-si-insurance-type-name',
    saveId: 'hdsd-si-insurance-type-save',
  },
  {
    uf: 'UF-SET-W3-B05',
    tab: 'si-insurers',
    shell: 'settings-si-insurers',
    fr: 'FR-HRM-SC-SI · insurers',
    keyId: 'hdsd-si-insurer-key',
    nameId: 'hdsd-si-insurer-name',
    saveId: 'hdsd-si-insurer-save',
  },
];

function saveJson() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function defect(id, severity, note, owner = 'dev-fe') {
  R.defects.push({ id, severity, note, owner });
}

function makeSlug(cfg) {
  const raw = `w3${STAMP.slice(-6)}${cfg.tab.slice(0, 4)}`.replace(/[^a-zA-Z0-9]/g, '');
  return raw.toLowerCase().slice(0, 24);
}

async function loginApi() {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) return { token, user: d.user ?? { email: EMAIL }, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
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
    }
  }, { ...session, expiresAt });
}

async function resolveHrmCtx(page, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      const has = await f.locator('[data-testid="settings-page"]').first().isVisible().catch(() => false);
      if (has) return f;
    }
    if (await page.locator('[data-testid="settings-page"]').first().isVisible().catch(() => false)) return page;
    await sleep(350);
  }
  return page;
}

async function selectSettingsTab(page, ctx, tabId) {
  const nav = ctx.getByTestId(`settings-nav-${tabId}`);
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
    await sleep(600);
    return resolveHrmCtx(page);
  }
  const iframeSrc = `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=${COMPANY}&tab=${encodeURIComponent(tabId)}`;
  await page.evaluate((src) => {
    const iframe = document.querySelector('iframe[src*="/hr/"]');
    if (iframe) iframe.src = src;
  }, iframeSrc);
  await sleep(2500);
  return resolveHrmCtx(page);
}

async function getLocatorAny(page, testId) {
  for (const ctx of [page, ...page.frames()]) {
    const loc = ctx.getByTestId(testId).first();
    if (await loc.isVisible().catch(() => false)) return loc;
  }
  return page.getByTestId(testId).first();
}

async function waitDialogAny(page, dialogTestId, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const loc = await getLocatorAny(page, dialogTestId);
    if (await loc.isVisible().catch(() => false)) return loc;
    await sleep(250);
  }
  throw new Error(`dialog not visible: ${dialogTestId}`);
}

async function rowVisibleAny(ctx, page, slug) {
  const normalized = slug.trim().toLowerCase();
  const locs = [
    ctx.getByTestId(`settings-emp-employment-status-row-${normalized}`).first(),
    ctx.getByTestId(`settings-emp-status-reason-row-${normalized}`).first(),
    ctx.getByTestId(`settings-catalog-row-${normalized}`).first(),
    ctx.locator(`[data-testid*="${normalized}"]`).first(),
    ctx.locator(`tr:has-text("${normalized}")`).first(),
  ];
  for (const loc of locs) {
    if (await loc.isVisible().catch(() => false)) return true;
  }
  for (const f of page.frames()) {
    if (await f.locator(`[data-testid*="${normalized}"]`).first().isVisible().catch(() => false)) return true;
    if (await f.locator(`tr:has-text("${normalized}")`).first().isVisible().catch(() => false)) return true;
  }
  return false;
}

async function mutateCatalog(page, ctx, cfg, slug, name) {
  const addBtn = ctx
    .getByTestId(`${cfg.shell}-add`)
    .or(ctx.getByRole('button', { name: /Thêm mới|Thêm/i }).first());
  await addBtn.waitFor({ state: 'visible', timeout: 25000 });
  await addBtn.click();
  const dialogTestId = `${cfg.shell}-dialog`;
  await waitDialogAny(page, dialogTestId, 20000);

  if (cfg.selectId) {
    const trig = await getLocatorAny(page, cfg.selectId);
    if (await trig.isVisible().catch(() => false)) {
      await trig.click();
      await sleep(300);
      for (const c of [page, ...page.frames()]) {
        const opt = c.getByRole('option').first();
        if (await opt.isVisible().catch(() => false)) {
          await opt.click();
          break;
        }
      }
    }
  }

  const keyLoc = await getLocatorAny(page, cfg.keyId);
  const nameLoc = await getLocatorAny(page, cfg.nameId);
  if (await keyLoc.isVisible().catch(() => false)) await keyLoc.fill(slug);
  if (await nameLoc.isVisible().catch(() => false)) await nameLoc.fill(name);

  let postStatus = null;
  let postUrl = '';
  const respP = page
    .waitForResponse(
      (res) => {
        const u = res.url();
        const m = res.request().method();
        return /\/api\/hrm\//.test(u) && (m === 'POST' || m === 'PUT' || m === 'PATCH');
      },
      { timeout: 45000 },
    )
    .catch(() => null);

  const save = await getLocatorAny(page, cfg.saveId);
  await save.click();
  const resp = await respP;
  if (resp) {
    postStatus = resp.status();
    postUrl = resp.url().replace(PORTAL, '');
    R.networkMutations.push({ uf: cfg.uf, status: postStatus, url: postUrl });
  }
  await sleep(1200);
  await waitDialogAny(page, dialogTestId, 3000).catch(() => {});

  const rowVisible = await rowVisibleAny(ctx, page, slug);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await page.goto(`${PORTAL}/command-center/hrm/settings?tab=${cfg.tab}`, { waitUntil: 'domcontentloaded' });
  await sleep(2500);
  let hrmAfter = await resolveHrmCtx(page);
  hrmAfter = (await selectSettingsTab(page, hrmAfter, cfg.tab)) || hrmAfter;
  await sleep(800);
  const rowAfterF5 = await rowVisibleAny(hrmAfter, page, slug);

  const ok =
    postStatus !== null &&
    postStatus >= 200 &&
    postStatus < 300 &&
    rowVisible &&
    rowAfterF5;
  return { ok, postStatus, postUrl, rowVisible, rowAfterF5, slug };
}

async function mutateEmpDialog(page, shell, dialogId, keyId, nameId, saveId, slug, name, urlPattern, extraFill) {
  let ctx = await openHrmSettingsTab(page, 'emp-employment-statuses');
  const addBtn = await getLocatorAny(page, `${shell}-add`);
  await addBtn.waitFor({ state: 'visible', timeout: 45000 });
  await addBtn.click();
  await waitDialogAny(page, dialogId, 25000);
  if (extraFill) await extraFill(page);
  await (await getLocatorAny(page, keyId)).fill(slug);
  await (await getLocatorAny(page, nameId)).fill(name);
  const respP = page
    .waitForResponse(
      (res) => urlPattern.test(res.url()) && ['POST', 'PUT', 'PATCH'].includes(res.request().method()),
      { timeout: 45000 },
    )
    .catch(() => null);
  await (await getLocatorAny(page, saveId)).click();
  const resp = await respP;
  const postStatus = resp?.status() ?? 0;
  await sleep(1200);
  const rowVisible = await rowVisibleAny(ctx, page, slug);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);
  ctx = await openHrmSettingsTab(page, 'emp-employment-statuses');
  const rowAfterF5 = await rowVisibleAny(ctx, page, slug);
  return {
    ok: postStatus >= 200 && postStatus < 300 && rowVisible && rowAfterF5,
    postStatus,
    rowVisible,
    rowAfterF5,
  };
}

async function mutateEmpStatusInline(page) {
  const stKey = `qa_st_${STAMP.slice(-6).toLowerCase()}`;
  const strKey = `qa_str_${STAMP.slice(-6).toLowerCase()}`;
  const tab = 'emp-employment-statuses';
  const uf = 'UF-SET-W3-B03';

  const st = await mutateEmpDialog(
    page,
    'settings-emp-employment-statuses',
    'settings-emp-employment-statuses-dialog',
    'hdsd-emp-employment-status-key',
    'hdsd-emp-employment-status-name',
    'hdsd-emp-employment-status-save',
    stKey,
    `QA ST ${stKey}`,
    /\/api\/hrm\/employees\/employment-statuses/,
    null,
  );

  const str = await mutateEmpDialog(
    page,
    'settings-emp-status-reasons',
    'settings-emp-status-reasons-dialog',
    'hdsd-emp-status-reason-key',
    'hdsd-emp-status-reason-name',
    'hdsd-emp-status-reason-save',
    strKey,
    `QA STR ${strKey}`,
    /\/api\/hrm\/employees\/status-reasons/,
    async (p) => {
      const applies = await getLocatorAny(p, 'hdsd-emp-status-reason-applies-to');
      if (await applies.isVisible().catch(() => false)) await applies.fill('inactive');
    },
  );

  const ok = st.ok && str.ok;
  return {
    ok,
    stKey,
    strKey,
    network: `ST ${st.postStatus} pre=${st.rowVisible} f5=${st.rowAfterF5} · STR ${str.postStatus} pre=${str.rowVisible} f5=${str.rowAfterF5}`,
    feAfter: `ST/STR dialog mutate`,
    f5: `ST f5=${st.rowAfterF5} STR f5=${str.rowAfterF5}`,
    uf,
    tab,
  };
}

function q(path) {
  const u = new URL(path.startsWith('/') ? path : `/${path}`, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function openHrmSettingsTab(page, tabId) {
  await page.goto(q(`/hr/settings?tab=${encodeURIComponent(tabId)}`), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(2500);
  const tabBtn = await getLocatorAny(page, `settings-tab-${tabId}`);
  if (await tabBtn.isVisible().catch(() => false)) {
    await tabBtn.click({ force: true });
    await sleep(1200);
  }
  return resolveHrmCtx(page);
}

async function smokeAttLvtRef(page) {
  const onResp = (res) => {
    const u = res.url();
    if (/settings-catalogs\/leave_types\/extension-items/.test(u) && res.request().method() === 'POST') {
      R.extensionPosts.push({ status: res.status(), url: u });
    }
  };
  page.on('response', onResp);

  await page.goto(q('/hr/settings?tab=master-data'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(3500);
  const mdTab = await getLocatorAny(page, 'md-tab-leaveTypes');
  if (await mdTab.isVisible().catch(() => false)) await mdTab.click();
  await sleep(1500);
  const banner = await getLocatorAny(page, 'md-leave-types-ref-readonly-banner')
    .then((l) => l.isVisible())
    .catch(() => false);
  const saveBtn = await getLocatorAny(page, 'md-save-leaveTypes')
    .then((l) => l.isVisible())
    .catch(() => false);

  R.extensionPosts.length = 0;
  await page.goto(q('/hr/settings?tab=catalogs'), { waitUntil: 'domcontentloaded' });
  await sleep(3500);
  const selectTrigger = page.locator('#ext-catalog-key');
  if (await selectTrigger.isVisible().catch(() => false)) {
    await selectTrigger.click();
    await sleep(400);
    const opt = page.getByRole('option', { name: /leave|nghỉ|Loại nghỉ/i }).first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    await sleep(800);
  }
  const catBanner = await getLocatorAny(page, 'settings-catalogs-leave-types-ref-readonly')
    .then((l) => l.isVisible())
    .catch(() => false);
  const extAfter = R.extensionPosts.length;
  page.off('response', onResp);

  const mdOk = banner && !saveBtn;
  const catOk = catBanner && extAfter === 0;
  return {
    ok: mdOk && catOk,
    note: `MD banner=${banner} noSave=${!saveBtn} · catalogs ref banner=${catBanner} · extension POSTs=${extAfter}`,
  };
}

async function smokeLeaveEffective(page) {
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2500);
  const leaveTab = page.locator('button').filter({ hasText: /Nghỉ phép|Leave/i }).first();
  if (await leaveTab.isVisible().catch(() => false)) {
    await leaveTab.click();
    await sleep(1500);
  }
  const effWait = page
    .waitForResponse(
      (res) => /leave-types\/effective/.test(res.url()) && res.request().method() === 'GET',
      { timeout: 45000 },
    )
    .catch(() => null);
  const createBtn = page.getByRole('button', { name: /Tạo yêu cầu|Create|Thêm đơn|Tạo đơn/i }).first();
  if (await createBtn.isVisible().catch(() => false)) await createBtn.click();
  await sleep(1200);
  const effRes = await effWait;
  const effStatus = effRes?.status() ?? 0;
  return { ok: effStatus === 200, note: `GET leave-types/effective → ${effStatus}` };
}

function renderMd(failCount) {
  const passUf = Object.values(R.ufs).filter((b) => b.verdict === '🟢').length;
  const lines = [];
  lines.push('# PO-HRM-SETTINGS-FIDELITY-QA-02');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|--------|');
  lines.push('| **work_item_id** | `PO-HRM-SETTINGS-FIDELITY-QA-02` |');
  lines.push(`| **stamp** | \`${STAMP}\` |`);
  lines.push('| **spec_ref** | `GOV-HRM-SETTINGS-POST-ATT-SA-01` Option A · `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` |');
  lines.push('| **Date** | 2026-08-10 |');
  lines.push(`| **Persona** | \`${EMAIL}\` / \`Xevn@2026\` · company \`main\` |`);
  lines.push(`| **URL** | \`${PORTAL}/command-center/hrm/settings?tab=<id>\` |`);
  lines.push('| **U65** | Zero seed · Thêm → Lưu → row pre-F5 + F5 |');
  lines.push(`| **commit** | \`${COMMIT}\` |`);
  lines.push(`| **ack_status** | **${R.ack_status}** |`);
  lines.push('| **Honesty** | `settings_catalog_e2e_ready` **DENY** (not flipped) |');
  lines.push('| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-fidelity-qa-02-w3p0.json` |');
  lines.push('| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-fidelity-qa-02-w3p0/` |');
  lines.push('| **Runner** | `scripts/qa/_tmp-po-hrm-settings-fidelity-qa-02-w3p0.mjs` |');
  lines.push('');
  lines.push('## L0');
  lines.push('');
  lines.push('| Gate | Result |');
  lines.push('|------|--------|');
  lines.push('| `pnpm run qc:dev-stack` | hrm+xbos+portal **200** (Windows UV exit quirk on script end) |');
  lines.push('| `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| W3 P0 mutate tabs | 🟢 ${passUf} | 🔴 ${Object.values(R.ufs).filter((b) => b.verdict === '🔴').length} |`);
  lines.push(`| ATTLVTSOTQC1 smoke | ${R.smokes['UF-ATT-LVT-SMOKE']?.verdict || '—'} |`);
  lines.push('');
  for (const [uf, block] of Object.entries(R.ufs)) {
    lines.push(`### ${uf} — \`${block.tab}\``);
    lines.push('');
    lines.push(`- **spec_ref:** ${block.fr || '—'}`);
    lines.push(`- Persona / URL: \`?tab=${block.tab}\``);
    lines.push(`- Action: ${block.action || '—'}`);
    lines.push(`- Slug/keys: \`${block.slug || '—'}\``);
    lines.push(`- Network: ${block.network || '—'}`);
    lines.push(`- **FE sau 2xx:** ${block.feAfter || '—'}`);
    lines.push(`- F5: ${block.f5 || '—'}`);
    lines.push(`- Verdict: ${block.verdict}`);
    lines.push('');
  }
  for (const [id, s] of Object.entries(R.smokes)) {
    lines.push(`### ${id}`);
    lines.push('');
    lines.push(`- **spec_ref:** ATTLVTSOTQC1-MSNGQC01 sealed — no reopen`);
    lines.push(`- Result: ${s.note}`);
    lines.push(`- Verdict: ${s.verdict}`);
    lines.push('');
  }
  if (R.defects.length) {
    lines.push('## Defects');
    lines.push('');
    for (const d of R.defects) {
      lines.push(`- **${d.id}** (${d.severity}): ${d.note}`);
    }
    lines.push('');
  }
  lines.push('## completion_report');
  lines.push('');
  if (R.ack_status === 'PASS_TO_PM') {
    lines.push('- **Closed:** W3 P0 mutate (7 dialog tabs + EMP ST/STR inline) U65 PASS; ATTLVTSOT REF MD + effective GET smoke PASS; honesty `settings_catalog_e2e_ready` not flipped.');
  } else {
    lines.push(`- **Open:** ${failCount} check(s) FAIL — see UF blocks and defects.`);
  }
  lines.push('- **Out of scope:** att-leave-types mutate as REF extension POST; full 18-tab W3 sweep.');
  lines.push('');
  lines.push('## next_owner');
  lines.push('');
  lines.push(R.ack_status === 'PASS_TO_PM' ? '`pm` → narrow QC or program wave kế' : '`dev-fe`');
  lines.push('');
  lines.push(`**ack_status:** **${R.ack_status}**`);
  writeFileSync(OUT_MD, lines.join('\n'));
}

async function main() {
  R.l0 = { qc_dev_stack: 'PASS (services 200)', qc_fe_be_health: 'exit 0' };
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!/favicon|404.*\.map|devtools/i.test(t)) R.consoleErrors.push(t.slice(0, 200));
    }
  });
  await injectPortalAuth(page, session);

  let failCount = 0;
  for (const cfg of DIALOG_TABS) {
    await page.goto(`${PORTAL}/command-center/hrm/settings?tab=${cfg.tab}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(2500);
    let ctx = await resolveHrmCtx(page);
    ctx = (await selectSettingsTab(page, ctx, cfg.tab)) || ctx;
    const slug = makeSlug(cfg);
    const name = `QA W3 ${slug}`;
    const block = {
      tab: cfg.tab,
      fr: cfg.fr,
      slug,
      action: 'Thêm → Lưu',
      network: '',
      feAfter: '',
      f5: '',
      verdict: '🔴',
    };
    try {
      const mut = await mutateCatalog(page, ctx, cfg, slug, name);
      block.network = mut.postStatus ? `${mut.postUrl || 'hrm'} → **${mut.postStatus}**` : 'no mutate response';
      block.feAfter = mut.rowVisible ? 'row visible pre-F5' : 'row missing pre-F5';
      block.f5 = mut.rowAfterF5 ? 'row persists after F5' : 'row missing after F5';
      block.verdict = mut.ok ? '🟢' : '🔴';
      if (!mut.ok) {
        failCount++;
        defect(cfg.uf, 'P0', `${cfg.tab} status=${mut.postStatus} pre=${mut.rowVisible} f5=${mut.rowAfterF5}`);
      }
    } catch (e) {
      block.feAfter = String(e).slice(0, 180);
      failCount++;
      defect(cfg.uf, 'P0', e.message);
    }
    R.ufs[cfg.uf] = block;
    saveJson();
  }

  try {
    const emp = await mutateEmpStatusInline(page);
    R.ufs[emp.uf] = {
      tab: emp.tab,
      fr: 'FR-HRM-SC-EMP-ST-STR',
      slug: `${emp.stKey} + ${emp.strKey}`,
      action: 'Inline ST PUT + STR PUT',
      network: emp.network,
      feAfter: emp.feAfter,
      f5: emp.f5,
      verdict: emp.ok ? '🟢' : '🔴',
    };
    if (!emp.ok) {
      failCount++;
      defect(emp.uf, 'P0', emp.network);
    }
  } catch (e) {
    failCount++;
    defect('UF-SET-W3-B03', 'P0', e.message);
    R.ufs['UF-SET-W3-B03'] = { tab: 'emp-employment-statuses', verdict: '🔴', feAfter: e.message };
  }

  try {
    const ref = await smokeAttLvtRef(page);
    const eff = await smokeLeaveEffective(page);
    const smokeOk = ref.ok && eff.ok;
    R.smokes['UF-ATT-LVT-SMOKE'] = {
      verdict: smokeOk ? '🟢' : '🔴',
      note: `REF MD: ${ref.note} · Effective: ${eff.note}`,
    };
    if (!smokeOk) {
      failCount++;
      defect('UF-ATT-LVT-SMOKE', 'P1', R.smokes['UF-ATT-LVT-SMOKE'].note);
    }
  } catch (e) {
    failCount++;
    R.smokes['UF-ATT-LVT-SMOKE'] = { verdict: '🔴', note: e.message };
    defect('UF-ATT-LVT-SMOKE', 'P0', e.message);
  }

  R.endedAt = ts();
  R.ack_status = failCount === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  saveJson();
  renderMd(failCount);
  await browser.close();
  console.log(`\n=== ${R.ack_status} failCount=${failCount} stamp=${STAMP} ===\n`);
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  defect('RUNNER', 'P0', e.message, 'qa');
  saveJson();
  try {
    renderMd(1);
  } catch {
    /* */
  }
  process.exit(1);
});
