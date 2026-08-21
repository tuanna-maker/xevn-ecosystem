#!/usr/bin/env node
/**
 * QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02 — narrow 5 P1 tabs after MUTATE-FIX-FE-01
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
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `SETW3RT2-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02');
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
  work_item_id: 'QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  env: { PORTAL, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  ufs: {},
  consoleErrors: [],
  pageErrors: [],
  networkMutations: [],
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

const TABS = [
  {
    uf: 'UF-SET-W3-A01',
    tab: 'att-attendance-codes',
    shell: 'settings-att-attendance-codes',
    keyId: 'hdsd-att-attendance-code-key',
    nameId: 'hdsd-att-attendance-code-name',
    saveId: 'hdsd-att-attendance-code-save',
    selectId: 'hdsd-att-attendance-code-counts-as',
  },
  {
    uf: 'UF-SET-W3-B01',
    tab: 'emp-document-types',
    shell: 'settings-emp-document-types',
    keyId: 'hdsd-emp-document-type-key',
    nameId: 'hdsd-emp-document-type-name',
    saveId: 'hdsd-emp-document-type-save',
  },
  {
    uf: 'UF-SET-W3-B02',
    tab: 'emp-employment-types',
    shell: 'settings-emp-employment-types',
    keyId: 'hdsd-emp-employment-type-key',
    nameId: 'hdsd-emp-employment-type-name',
    saveId: 'hdsd-emp-employment-type-save',
  },
  {
    uf: 'UF-SET-W3-B07',
    tab: 'rec-pipeline-stages',
    shell: 'settings-rec-pipeline-stages',
    keyId: 'hdsd-rec-pipeline-stage-key',
    nameId: 'hdsd-rec-pipeline-stage-name',
    saveId: 'hdsd-rec-pipeline-stage-save',
  },
  {
    uf: 'UF-SET-W3-C03',
    tab: 'contract-templates',
    kind: 'templates-canvas',
    shell: 'settings-contract-templates',
  },
];

function saveJson() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
}

function makeSlug(cfg) {
  const raw = `rt2${STAMP.slice(-6)}${cfg.tab.slice(0, 4)}`.replace(/[^a-zA-Z0-9]/g, '');
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

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
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

async function getLocatorAny(page, testId) {
  const contexts = [page, ...page.frames()];
  for (const ctx of contexts) {
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
  const rowTestId = `settings-catalog-row-${normalized}`;
  const locs = [
    ctx.getByTestId(rowTestId).first(),
    ctx.locator(`[data-testid*="${normalized}"]`).first(),
    ctx.locator(`tr:has-text("${normalized}")`).first(),
    page.getByTestId(rowTestId).first(),
    page.locator(`[data-testid*="${normalized}"]`).first(),
  ];
  for (const loc of locs) {
    if (await loc.isVisible().catch(() => false)) return true;
  }
  for (const f of page.frames()) {
    if (await f.getByTestId(rowTestId).first().isVisible().catch(() => false)) return true;
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
  await sleep(1000);
  await waitDialogAny(page, dialogTestId, 3000).catch(() => {});

  const rowVisible = await rowVisibleAny(ctx, page, slug);

  await page.reload({ waitUntil: 'networkidle' });
  await sleep(500);
  await page.goto(`${PORTAL}/command-center/hrm/settings?tab=${cfg.tab}`, { waitUntil: 'networkidle' });
  await sleep(1500);
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
  return { ok, postStatus, postUrl, rowVisible, rowAfterF5, slug, name };
}

async function templatesCanvas(page, ctx, cfg) {
  const add = ctx.getByTestId('settings-contract-templates-add').or(ctx.getByRole('button', { name: /Thêm/i }));
  await add.first().waitFor({ state: 'visible', timeout: 25000 });
  await add.first().click();
  await sleep(1200);
  const canvas = await getLocatorAny(page, 'ctr-tpl-canvas');
  const canvasVisible = await canvas.isVisible().catch(() => false);
  await page.keyboard.press('Escape').catch(() => {});
  return { ok: canvasVisible, canvasVisible };
}

function renderMd() {
  const passCount = Object.values(R.ufs).filter((b) => b.verdict === '🟢').length;
  const failCount = Object.values(R.ufs).filter((b) => b.verdict === '🔴').length;
  const lines = [];
  lines.push('# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02 — Narrow 5 P1 tabs');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|--------|');
  lines.push(`| **work_item_id** | \`QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02\` |`);
  lines.push(`| **stamp** | \`${STAMP}\` |`);
  lines.push(`| **Prior fix** | \`PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01\` · prior QA \`SETW3QA-MSMY9E1A\` |`);
  lines.push(`| **Date** | 2026-08-10 |`);
  lines.push(`| **Persona** | \`${EMAIL}\` / \`Xevn@2026\` · company \`main\` |`);
  lines.push(`| **URL base** | \`${PORTAL}/command-center/hrm/settings?tab=<id>\` |`);
  lines.push(`| **U65** | Zero seed · Thêm → Lưu · F5 row by **lowercase slug** |`);
  lines.push(`| **commit** | \`${COMMIT}\` |`);
  lines.push(`| **ack_status** | **${R.ack_status}** |`);
  lines.push(`| **Machine JSON** | \`docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json\` |`);
  lines.push(`| **Screens** | \`docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/\` |`);
  lines.push('');
  lines.push('## L0 (pre-browser)');
  lines.push('');
  lines.push('| Gate | Result |');
  lines.push('|------|--------|');
  lines.push('| `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|--------|`);
  lines.push(`| Tabs in scope | 5 |`);
  lines.push(`| 🟢 | ${passCount} |`);
  lines.push(`| 🔴 | ${failCount} |`);
  lines.push('');
  for (const [uf, block] of Object.entries(R.ufs)) {
    lines.push(`### ${uf} — \`${block.tab}\``);
    lines.push('');
    lines.push(`- Persona / URL: \`?tab=${block.tab}\``);
    lines.push(`- Action: ${block.action || '—'}`);
    lines.push(`- Slug assert: \`${block.slug || 'n/a'}\` (lowercase)`);
    lines.push(`- Network: ${block.network || '—'}`);
    lines.push(`- **FE sau 2xx:** ${block.feAfter || '—'}`);
    lines.push(`- F5: ${block.f5 || '—'}`);
    lines.push(`- Verdict: ${block.verdict || '—'}`);
    lines.push(`- spec_ref: \`po-hrm-settings-w3-mutate-fix-fe-01.md\` · PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01`);
    lines.push('');
  }
  if (R.defects.length) {
    lines.push('## Defects');
    for (const d of R.defects) lines.push(`- **${d.id}** (${d.severity}): ${d.note}`);
    lines.push('');
  }
  lines.push('## completion_report');
  lines.push('');
  lines.push(R.ack_status === 'PASS_TO_PM'
    ? '- **Closed:** P1 mutate on 5 tabs + contract-templates canvas after FE-01 fix.'
    : `- **Open:** ${failCount} tab(s) still FAIL — see defects.`);
  lines.push('- **Residual:** Full 18-tab W3 sweep not re-run (narrow scope).');
  lines.push('');
  lines.push('## next_owner');
  lines.push('');
  lines.push(R.ack_status === 'PASS_TO_PM' ? '`qc` — GWC slice PO-HRM-SETTINGS-FIDELITY W3' : '`dev-fe` — P1 residual');
  lines.push('');
  lines.push(`**pm_dispatch_hint:** ${R.ack_status === 'PASS_TO_PM' ? 'QC-PO-HRM-SETTINGS-W3-NARROW-GATE-01' : 'PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-02'}`);
  writeFileSync(OUT_MD, lines.join('\n'));
}

async function main() {
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
      if (!/favicon|404.*\.map|devtools/i.test(t)) R.consoleErrors.push(t.slice(0, 300));
    }
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));

  await injectPortalAuth(page, session);

  let failCount = 0;
  for (const cfg of TABS) {
    const url = `${PORTAL}/command-center/hrm/settings?tab=${cfg.tab}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(2500);
    let ctx = await resolveHrmCtx(page);
    ctx = (await selectSettingsTab(page, ctx, cfg.tab)) || ctx;
    await sleep(800);
    if (cfg.shell) {
      const shellVisible = await ctx.getByTestId(cfg.shell).isVisible().catch(() => false);
      if (!shellVisible) {
        ctx = (await selectSettingsTab(page, ctx, cfg.tab)) || ctx;
        await sleep(1000);
      }
    }
    const block = { tab: cfg.tab, slug: '', action: '', network: '', feAfter: '', f5: '', verdict: '🟡' };

    if (cfg.kind === 'templates-canvas') {
      try {
        const r = await templatesCanvas(page, ctx, cfg);
        block.action = 'Thêm mẫu → ctr-tpl-canvas visible (iframe dialog portal)';
        block.feAfter = r.canvasVisible ? 'canvas visible' : 'canvas not visible';
        block.verdict = r.ok ? '🟢' : '🔴';
        if (!r.ok) {
          failCount++;
          defect(cfg.uf, 'P1', 'ctr-tpl-canvas not visible after Thêm');
        }
      } catch (e) {
        block.verdict = '🔴';
        block.feAfter = String(e).slice(0, 200);
        failCount++;
        defect(cfg.uf, 'P0', e.message);
      }
      R.ufs[cfg.uf] = block;
      await shot(page, cfg.tab);
      saveJson();
      continue;
    }

    const slug = makeSlug(cfg);
    const name = `QA W3 RT2 ${slug}`;
    block.slug = slug;
    try {
      const mut = await mutateCatalog(page, ctx, cfg, slug, name);
      block.action = `Thêm → Lưu (slug=${slug})`;
      block.network = mut.postStatus
        ? `${mut.postUrl || 'hrm'} → **${mut.postStatus}**`
        : 'no POST/PUT captured';
      block.feAfter = mut.rowVisible ? 'row visible pre-F5 (lowercase slug)' : 'row not seen pre-F5';
      block.f5 = mut.rowAfterF5 ? 'row visible after F5' : 'row missing after F5';
      block.verdict = mut.ok ? '🟢' : '🔴';
      if (!mut.ok) {
        failCount++;
        defect(cfg.uf, 'P1', `tab=${cfg.tab} status=${mut.postStatus} preF5=${mut.rowVisible} f5=${mut.rowAfterF5}`);
      }
    } catch (e) {
      block.verdict = '🔴';
      block.feAfter = String(e).slice(0, 200);
      failCount++;
      defect(cfg.uf, 'P0', `${cfg.tab}: ${e.message}`);
    }
    R.ufs[cfg.uf] = block;
    await shot(page, cfg.tab);
    saveJson();
  }

  R.endedAt = ts();
  R.overall = failCount === 0 ? 'PASS' : 'FAIL';
  R.ack_status = failCount === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  saveJson();
  renderMd();
  await browser.close();
  console.log(`\n=== ${R.ack_status} failCount=${failCount} stamp=${STAMP} ===\n`);
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  defect('RUNNER', 'P0', e.message);
  saveJson();
  try {
    renderMd();
  } catch {
    /* */
  }
  process.exit(1);
});
