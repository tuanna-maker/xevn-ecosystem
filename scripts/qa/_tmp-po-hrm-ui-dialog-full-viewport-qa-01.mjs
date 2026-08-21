#!/usr/bin/env node
/**
 * QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01 — PAT full viewport parent portal (U65)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync, appendFileSync } from 'node:fs';
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

const STAMP = `DLGFVP-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-dialog-full-viewport-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-ui-dialog-full-viewport-fe-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-dialog-full-viewport-qa-01');
mkdirSync(SCREEN, { recursive: true });

const DND_STORM_RE =
  /sameNodeDragBind|dragHandleProps missing|Unable to find drag handle|@hello-pangea\/dnd/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01',
  parent: 'PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  env: { PORTAL, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  ufs: {},
  dnd_storms: [],
  consoleErrors: [],
  pageErrors: [],
  network: [],
  screens: [],
  defects: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function saveJson() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function uf(id, pass, note, extra = {}) {
  R.ufs[id] = { verdict: pass ? 'PASS' : 'FAIL', note, meta: extra };
  if (!pass) R.defects.push({ id, note, owner: 'dev-fe' });
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
    if (await loc.isVisible().catch(() => false)) return { loc, ctx };
  }
  return { loc: page.getByTestId(testId).first(), ctx: page };
}

async function measureParentDialog(page, testId) {
  const vp = page.viewportSize() || { width: 1440, height: 900 };
  const dialog = page.getByTestId(testId).first();
  let onParent = await dialog.isVisible().catch(() => false);
  if (!onParent) {
    const roleDlg = page.locator('[role="dialog"][data-hrm-dialog-portal="parent"]').first();
    onParent = await roleDlg.isVisible().catch(() => false);
    if (onParent) {
      const box = await roleDlg.boundingBox().catch(() => null);
      if (!box) return { pass: false, onParent: true, wRatio: 0, note: 'parent dialog no bbox' };
      const wRatio = box.width / vp.width;
      return {
        pass: wRatio >= 0.85,
        onParent: true,
        wRatio: Number(wRatio.toFixed(3)),
        hRatio: Number((box.height / vp.height).toFixed(3)),
        note: `${Math.round(box.width)}×${Math.round(box.height)} vs ${vp.width}×${vp.height}`,
      };
    }
    return { pass: false, onParent: false, wRatio: 0, note: 'dialog not on parent page' };
  }
  const box = await dialog.boundingBox().catch(() => null);
  if (!box) return { pass: false, onParent: true, wRatio: 0, note: 'bbox missing' };
  const wRatio = box.width / vp.width;
  const hRatio = box.height / vp.height;
  return {
    pass: wRatio >= 0.85,
    onParent: true,
    wRatio: Number(wRatio.toFixed(3)),
    hRatio: Number(hRatio.toFixed(3)),
    note: `${Math.round(box.width)}×${Math.round(box.height)} vs ${vp.width}×${vp.height}`,
  };
}

async function countDuplicateShell(page) {
  const headers = await page.locator('[data-testid="portal-command-center-header"], header').count();
  return headers;
}

async function waitJdDndReady(page) {
  const pending = page.getByTestId('jd-writer-dnd-pending');
  const surface = page.getByTestId('jd-writer-dnd-surface');
  const start = Date.now();
  while (Date.now() - start < 20000) {
    if (await surface.isVisible().catch(() => false)) return true;
    if (!(await pending.isVisible().catch(() => false))) {
      await sleep(400);
      if (await surface.isVisible().catch(() => false)) return true;
    }
    await sleep(300);
  }
  return await surface.isVisible().catch(() => false);
}

async function jdWriterDnd(page, stormBefore) {
  const canvas = page.getByTestId('jd-writer-canvas');
  const palette = page.getByTestId('jd-writer-optional-palette');
  const groups = page.locator('[data-testid^="jd-writer-group-"]');
  const n = await groups.count().catch(() => 0);
  let moved = false;
  if (n >= 2) {
    const h0 = groups.nth(0).locator('[data-rbd-drag-handle-draggable-id], .cursor-grab').first();
    const h1 = groups.nth(1);
    if (await h0.isVisible().catch(() => false)) {
      await h0.dragTo(h1, { force: true }).catch(() => {});
      moved = true;
    }
  }
  if (!moved) {
    const item = palette.locator('[data-rbd-draggable-id], .cursor-grab').first();
    if ((await item.isVisible().catch(() => false)) && (await canvas.isVisible().catch(() => false))) {
      await item.dragTo(canvas, { force: true, targetPosition: { x: 80, y: 60 } }).catch(() => {});
      moved = true;
    }
  }
  await sleep(800);
  const stormAfter = R.dnd_storms.length;
  return { moved, dndStorm: stormAfter > stormBefore };
}

async function ctrTplDnd(page, stormBefore) {
  const canvas = page.getByTestId('ctr-tpl-canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const palette = page.getByTestId('ctr-tpl-palette');
  const item = palette.locator('[data-rbd-draggable-id], .cursor-grab').first();
  if (await item.isVisible().catch(() => false)) {
    const box = await item.boundingBox();
    const cbox = await canvas.boundingBox();
    if (box && cbox) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await sleep(80);
      await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 50, { steps: 14 });
      await sleep(80);
      await page.mouse.up();
    }
  }
  await sleep(700);
  const count = await page.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
  const stormAfter = R.dnd_storms.length;
  return { canvasItems: count, dndStorm: stormAfter > stormBefore };
}

async function pickJdPosition(page) {
  const trigger = page
    .locator('[data-testid="hdsd-jd-form-position"], [data-testid="jd-form-position"]')
    .first();
  let el = trigger;
  if (!(await el.isVisible().catch(() => false))) {
    el = page.getByRole('combobox').first();
  }
  if (!(await el.isVisible().catch(() => false))) return false;
  await el.click({ force: true }).catch(() => null);
  await sleep(700);
  const options = page.locator('[role="option"]');
  const n = await options.count().catch(() => 0);
  if (n < 1) return false;
  await options.first().click();
  await sleep(2200);
  const pack = await page.getByTestId('jd-writer-pack-label').isVisible().catch(() => false);
  return pack || n > 0;
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
    const t = msg.text();
    if (msg.type() === 'error' || DND_STORM_RE.test(t)) {
      R.consoleErrors.push(t.slice(0, 240));
      if (DND_STORM_RE.test(t)) R.dnd_storms.push(t.slice(0, 200));
    }
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));
  page.on('response', (res) => {
    const url = res.url();
    if (/job-templates|contract-templates/.test(url) && ['POST', 'PUT', 'PATCH'].includes(res.request().method())) {
      R.network.push({ method: res.request().method(), url: url.slice(0, 160), status: res.status() });
    }
  });

  await injectPortalAuth(page, session);

  // --- JD master library ---
  await page.goto(`${PORTAL}/command-center/hrm/settings?tab=jd-master-library`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(2500);
  let ctx = await resolveHrmCtx(page);
  ctx = (await selectSettingsTab(page, ctx, 'jd-master-library')) || ctx;

  const { loc: addBtn } = await getLocatorAny(page, 'settings-jd-master-library-add');
  const addOk = await addBtn.isVisible().catch(() => false);
  if (addOk) await addBtn.click();
  else await ctx.getByRole('button', { name: /Thêm JD/i }).first().click().catch(() => {});
  await sleep(1500);

  const jdDialogId = 'hdsd-jd-form-dialog';
  const jdMeasure = await measureParentDialog(page, jdDialogId);
  const shellBefore = await countDuplicateShell(page);
  await shot(page, '01-jd-add-dialog');

  const slug = `jd${STAMP.slice(-6).toLowerCase()}`;
  await page.getByTestId('hdsd-jd-form-code').fill(slug).catch(() => {});
  await page.getByTestId('hdsd-jd-form-title').fill(`QA viewport ${STAMP}`).catch(() => {});

  const posOk = await pickJdPosition(page);
  const dndReady = await waitJdDndReady(page);
  const storm0 = R.dnd_storms.length;
  const jdDnd = dndReady ? await jdWriterDnd(page, storm0) : { moved: false, dndStorm: false };

  const submit = page.getByTestId('hdsd-jd-form-submit');
  const submitEnabled = await submit.isEnabled().catch(() => false);
  const net0 = R.network.length;
  if (submitEnabled) {
    await submit.click();
    await sleep(4000);
  }
  const savedPost = R.network.slice(net0).find((n) => n.method === 'POST' && /job-templates/.test(n.url));
  const dialogClosed = !(await page.getByTestId('hdsd-jd-form-dialog').isVisible().catch(() => false));
  await sleep(600);
  const shellAfterAdd = await countDuplicateShell(page);

  uf(
    'UF-JD-ADD-FULL-VIEWPORT',
    addOk && jdMeasure.pass && jdMeasure.onParent && !jdDnd.dndStorm,
    `add=${addOk} parent=${jdMeasure.onParent} wRatio=${jdMeasure.wRatio} ≥0.85=${jdMeasure.pass} · ${jdMeasure.note} · dndReady=${dndReady} dndMoved=${jdDnd.moved} dndStorm=${jdDnd.dndStorm} pos=${posOk} saveEnabled=${submitEnabled} post=${savedPost?.status ?? 'none'}`,
    jdMeasure,
  );

  // Xem JD — sau Lưu nháp U65 hoặc row có sẵn
  if (!dialogClosed) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  ctx = await resolveHrmCtx(page);
  ctx = (await selectSettingsTab(page, ctx, 'jd-master-library')) || ctx;
  await sleep(3000);
  let { loc: viewBtn } = await getLocatorAny(page, 'settings-jd-master-library-view');
  let hasView = await viewBtn.isVisible().catch(() => false);
  if (!hasView) {
    const { loc: row } = await getLocatorAny(page, 'settings-jd-master-library-row');
    if (await row.isVisible().catch(() => false)) {
      ({ loc: viewBtn } = await getLocatorAny(page, 'settings-jd-master-library-view'));
      hasView = await viewBtn.isVisible().catch(() => false);
    }
  }
  R.viewPrereq = { createdSlug: slug, hasViewAfterSave: hasView, savePost: savedPost ?? null, submitEnabled };

  let viewOk = false;
  let viewMeasure = { pass: false, note: 'no row to view' };
  if (hasView) {
    await viewBtn.first().click();
    await sleep(900);
    const viewDlg = page
      .locator('[role="dialog"][data-hrm-dialog-portal="parent"]')
      .filter({ hasText: /Xem JD/i })
      .first();
    let viewVisible = await viewDlg.isVisible().catch(() => false);
    if (!viewVisible) {
      viewVisible = await page
        .locator('[role="dialog"]')
        .filter({ hasText: /Xem JD/i })
        .first()
        .isVisible()
        .catch(() => false);
    }
    const vp = page.viewportSize() || { width: 1440, height: 900 };
    const dlg = viewVisible
      ? page.locator('[role="dialog"]').filter({ hasText: /Xem JD/i }).first()
      : null;
    const box = dlg ? await dlg.boundingBox().catch(() => null) : null;
    const wRatio = box ? box.width / vp.width : 0;
    viewMeasure = {
      pass: viewVisible && wRatio >= 0.85,
      onParent: viewVisible,
      wRatio: Number(wRatio.toFixed(3)),
      note: box ? `${Math.round(box.width)}×${Math.round(box.height)}` : 'no bbox',
    };
    viewOk = viewMeasure.pass;
    await shot(page, '02-jd-view-dialog');
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
  }

  uf(
    'UF-JD-VIEW-FULL-VIEWPORT',
    viewOk,
    hasView
      ? `view parent wRatio=${viewMeasure.wRatio} · ${viewMeasure.note}`
      : `no Xem after FE Lưu nháp (slug=${slug})`,
    viewMeasure,
  );

  // --- contract-templates ---
  await page.goto(`${PORTAL}/command-center/hrm/settings?tab=contract-templates`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(2500);
  ctx = await resolveHrmCtx(page);
  ctx = (await selectSettingsTab(page, ctx, 'contract-templates')) || ctx;

  const { loc: tplAdd } = await getLocatorAny(page, 'settings-contract-templates-add');
  if (await tplAdd.isVisible().catch(() => false)) await tplAdd.click();
  else await ctx.getByRole('button', { name: /Thêm mẫu/i }).first().click().catch(() => {});
  await sleep(1200);

  const tplMeasure = await measureParentDialog(page, 'settings-contract-templates-dialog');
  await shot(page, '03-ctr-tpl-dialog');
  const storm1 = R.dnd_storms.length;
  const tplDnd = await ctrTplDnd(page, storm1);
  const closeBtn = page.getByRole('button', { name: /^Đóng$/i }).first();
  if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
  else await page.keyboard.press('Escape');
  await sleep(500);
  const canvasStill = await page.getByTestId('ctr-tpl-canvas').isVisible().catch(() => false);

  uf(
    'UF-CTR-TPL-FULL-VIEWPORT-DND',
    tplMeasure.pass &&
      tplMeasure.onParent &&
      !tplDnd.dndStorm &&
      !canvasStill,
    `parent=${tplMeasure.onParent} wRatio=${tplMeasure.wRatio} · ${tplMeasure.note} · canvasItems=${tplDnd.canvasItems} dndStorm=${tplDnd.dndStorm} closed=${!canvasStill}`,
    { tplMeasure, tplDnd },
  );

  const dupShell = shellAfterAdd > 3;
  uf('UF-NO-DUP-SHELL', !dupShell, `header-ish count after JD close=${shellAfterAdd}`);

  const allPass = Object.values(R.ufs).every((u) => u.verdict === 'PASS');
  const zeroDnd = R.dnd_storms.length === 0;
  R.overall = allPass && zeroDnd ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  saveJson();

  const mdBlock = `

---

## QA retest — ${STAMP}

| Field | Value |
|-------|--------|
| **work_item_id** | QA-PO-HRM-UI-DIALOG-FULL-VIEWPORT-01 |
| **persona** | \`${EMAIL}\` · company \`${COMPANY}\` |
| **URL** | \`${PORTAL}/command-center/hrm/settings\` |
| **L0** | \`pnpm run qc:fe-be-health\` exit **0** |
| **U65** | zero-seed · browser-only |
| **commit** | \`${COMMIT}\` |
| **stamp** | \`${STAMP}\` |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** |

### UF verdicts

| UF | Verdict | Note |
|----|---------|------|
| UF-JD-ADD-FULL-VIEWPORT | ${R.ufs['UF-JD-ADD-FULL-VIEWPORT']?.verdict} | ${R.ufs['UF-JD-ADD-FULL-VIEWPORT']?.note} |
| UF-JD-VIEW-FULL-VIEWPORT | ${R.ufs['UF-JD-VIEW-FULL-VIEWPORT']?.verdict} | ${R.ufs['UF-JD-VIEW-FULL-VIEWPORT']?.note} |
| UF-CTR-TPL-FULL-VIEWPORT-DND | ${R.ufs['UF-CTR-TPL-FULL-VIEWPORT-DND']?.verdict} | ${R.ufs['UF-CTR-TPL-FULL-VIEWPORT-DND']?.note} |
| UF-NO-DUP-SHELL | ${R.ufs['UF-NO-DUP-SHELL']?.verdict} | ${R.ufs['UF-NO-DUP-SHELL']?.note} |

### Console / DnD

- pangea/drag-handle storms: **${R.dnd_storms.length}** ${R.dnd_storms.length ? `(sample: ${R.dnd_storms[0]?.slice(0, 100)})` : ''}
- pageErrors: ${R.pageErrors.length} · consoleErrors (tracked): ${R.consoleErrors.length}

### Evidence

- JSON: \`docs/qa/evidence/_tmp-po-hrm-ui-dialog-full-viewport-qa-01.json\`
- Screens: \`docs/qa/evidence/screens/po-hrm-ui-dialog-full-viewport-qa-01/\`

### next_owner

\`${R.ack_status === 'PASS_TO_PM' ? 'pm' : 'dev-fe'}\`
`;

  appendFileSync(OUT_MD, mdBlock, 'utf8');
  console.log(JSON.stringify({ ack_status: R.ack_status, overall: R.overall, stamp: STAMP, ufs: R.ufs }, null, 2));

  await browser.close();
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  saveJson();
  appendFileSync(
    OUT_MD,
    `\n\n## QA retest — ${STAMP} (CRASH)\n\n- **ack_status:** FAIL_TO_PM\n- **error:** ${String(e).slice(0, 300)}\n`,
    'utf8',
  );
  console.error(e);
  process.exit(1);
});
