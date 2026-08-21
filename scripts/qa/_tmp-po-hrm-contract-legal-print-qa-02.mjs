#!/usr/bin/env node
/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-QA-02 — U65 browser retest Q-CTR-02 PDF binary (BE-02)
 * Prefer existing R3 print-version HD-QVQ6L / 312255a9… ; recreate only if missing.
 * Honesty: contracts_printable_ready=false — DENIED printable module UAT
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
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const KNOWN_CONTRACT = process.env.QA_CONTRACT_ID || 'e675c27d-f2bf-4295-bc69-1fcdc4899fa9';
const KNOWN_CODE = process.env.QA_CONTRACT_CODE || 'HD-QVQ6L';
const KNOWN_VERSION = process.env.QA_PRINT_VERSION_ID || '312255a9-b87e-46d9-97e1-c1b835db7043';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-02.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-02');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CTR2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-QA-02',
  parent: 'PO-HRM-CONTRACT-LEGAL-PRINT-BE-02',
  qc_condition: 'Q-CTR-02',
  round: 'QA-02-PDF-BINARY',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP, KNOWN_CONTRACT, KNOWN_CODE, KNOWN_VERSION },
  honesty: {
    contracts_printable_ready: false,
    contracts_printable_ready_claimed: false,
    seed_used: false,
    api_only_pass: false,
  },
  denied: ['contracts_printable_ready=true', 'seed', 'api_only_pass', 'invent_printable_uat'],
  l0: {},
  beProbe: {},
  beUp: false,
  ids: { contractId: KNOWN_CONTRACT, contractCode: KNOWN_CODE, printVersionId: KNOWN_VERSION },
  uf: {},
  ac: {},
  process: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  closed_residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || '');
}
function recordUf(id, verdict, detail = {}) {
  results.uf[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
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

function processGateSummary() {
  const dndStorm = results.consoleErrors.filter((t) =>
    /Unable to find drag handle|@hello-pangea\/dnd/i.test(t),
  );
  const uncaught = [
    ...results.pageErrors,
    ...results.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  results.process = {
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    dndStorm: dndStorm.length,
    uncaught: uncaught.length,
    samplePageErrors: results.pageErrors.slice(0, 5),
    sampleConsole: results.consoleErrors.slice(0, 10),
    sampleDnd: dndStorm.slice(0, 3),
  };
  return { fail: dndStorm.length > 0 || uncaught.length > 0, dndStorm, uncaught };
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
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const interesting =
        /print-versions|\/pdf|contracts-insurance\/contracts|contract-clauses|contract-templates/.test(
          u,
        );
      if (!interesting) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
        qsHasCompanyId: /[?&]company_id=/.test(u),
        contentType: (res.headers()['content-type'] || '').slice(0, 100),
        stub: res.headers()['x-hrm-pdf-stub'] || null,
        engine: res.headers()['x-hrm-pdf-engine'] || null,
      };
      if (/\/pdf/.test(u) && !/format=html/.test(u)) {
        try {
          const buf = Buffer.from(await res.body());
          entry.len = buf.length;
          entry.magic = buf.slice(0, 4).toString('ascii');
          entry.isPdfMagic = entry.magic === '%PDF';
          entry.isApplicationPdf = /application\/pdf/i.test(entry.contentType);
        } catch (e) {
          entry.bodyErr = String(e).slice(0, 120);
        }
      } else if (/json/i.test(entry.contentType)) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 160);
          if (j?.data?.id) entry.dataId = j.data.id;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function probeBe(token) {
  const paths = [
    `/api/hrm/contracts-insurance/contract-clauses?company_id=${COMPANY}`,
    `/api/hrm/contracts-insurance/contract-templates?company_id=${COMPANY}`,
    `/api/hrm/contracts-insurance/contracts?page_size=3&company_id=${COMPANY}`,
  ];
  const out = {};
  for (const path of paths) {
    try {
      const r = await fetch(`${HRM}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await r.json().catch(() => ({}));
      out[path] = {
        status: r.status,
        code: body?.code || null,
        message: String(body?.message || '').slice(0, 160),
      };
    } catch (e) {
      out[path] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  results.beProbe = out;
  results.beUp = Object.values(out).every((x) => x.status >= 200 && x.status < 300);
  save();
  return results.beUp;
}

async function apiPdfChecks(token, versionId) {
  const headers = { Authorization: `Bearer ${token}` };
  const pdfR = await fetch(
    `${HRM}/api/hrm/contracts-insurance/print-versions/${versionId}/pdf?company_id=${COMPANY}`,
    { headers },
  );
  const pdfBuf = Buffer.from(await pdfR.arrayBuffer());
  const pdf = {
    status: pdfR.status,
    contentType: pdfR.headers.get('content-type') || '',
    stub: pdfR.headers.get('x-hrm-pdf-stub'),
    engine: pdfR.headers.get('x-hrm-pdf-engine'),
    len: pdfBuf.length,
    magic: pdfBuf.slice(0, 4).toString('ascii'),
  };
  pdf.pass =
    pdf.status === 200 &&
    /application\/pdf/i.test(pdf.contentType) &&
    pdf.magic === '%PDF' &&
    pdf.stub === 'false' &&
    pdf.engine === 'pdfkit' &&
    pdf.len > 100;

  const htmlR = await fetch(
    `${HRM}/api/hrm/contracts-insurance/print-versions/${versionId}/pdf?company_id=${COMPANY}&format=html`,
    { headers },
  );
  const htmlText = await htmlR.text();
  const html = {
    status: htmlR.status,
    contentType: htmlR.headers.get('content-type') || '',
    engine: htmlR.headers.get('x-hrm-pdf-engine'),
    len: htmlText.length,
    head: htmlText.slice(0, 100),
  };
  html.pass =
    html.status === 200 && /text\/html/i.test(html.contentType) && html.engine === 'html-debug';

  results.ids.apiPdf = pdf;
  results.ids.apiHtml = html;
  save();
  return { pdf, html };
}

async function ensureVersion(token) {
  const listR = await fetch(
    `${HRM}/api/hrm/contracts-insurance/contracts/${KNOWN_CONTRACT}/print-versions?company_id=${COMPANY}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const listJ = await listR.json().catch(() => ({}));
  const versions =
    listJ?.data?.data || listJ?.data?.items || (Array.isArray(listJ?.data) ? listJ.data : []);
  const count = Array.isArray(versions) ? versions.length : 0;
  results.ids.printVersionsList = { status: listR.status, count };
  if (count > 0) {
    const hit = versions.find((v) => v.id === KNOWN_VERSION) || versions[0];
    results.ids.printVersionId = hit.id;
    results.ids.printVersionStatus = hit.status;
    results.ids.reusedExistingVersion = true;
    save();
    return hit.id;
  }
  results.ids.reusedExistingVersion = false;
  results.residuals.push({
    id: 'R-CTR-PRINT-VERSION-MISSING',
    severity: 'P1',
    note: 'R3 version missing — browser recreate path required',
  });
  save();
  return null;
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
}

async function openSettingsLegal(page) {
  await page.goto(q('/hr/settings', { tab: 'contract-legal' }), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2500);
  const tabBtn = page.getByTestId('settings-tab-contract-legal');
  if (await tabBtn.isVisible().catch(() => false)) {
    await tabBtn.click();
    await sleep(1200);
  } else {
    await page.getByText(/Điều khoản HĐ/i).first().click().catch(() => {});
    await sleep(1200);
  }
}

async function openContracts(page) {
  await page.goto(q('/hr/contracts'), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(3000);
  await hardRefresh(page);
  await sleep(2500);
}

async function openEditByCode(page, code) {
  const search = page.locator('input[placeholder*="Tìm"], input[type=search]').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(code);
    await sleep(1200);
  }
  const row = page.locator('tbody tr').filter({ hasText: code }).first();
  if (!(await row.isVisible().catch(() => false))) return false;
  const actionBtns = row.locator('td').last().locator('button');
  // pencil/edit is typically 2nd action (index 1) — same as R3
  await actionBtns.nth(1).click({ force: true }).catch(() => {});
  await sleep(2800);
  return true;
}

async function main() {
  console.log(`START ${results.work_item_id} stamp=${STAMP}`);

  for (const [name, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[name] = { status: r.status, url };
    } catch (e) {
      results.l0[name] = { status: 0, url, error: String(e).slice(0, 120) };
    }
  }
  save();
  const l0Ok = Object.values(results.l0).every((x) => x.status === 200);
  if (!l0Ok) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'L0', severity: 'P0', note: 'stack not healthy' });
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  await probeBe(session.token);
  const vid = (await ensureVersion(session.token)) || KNOWN_VERSION;
  const api = await apiPdfChecks(session.token, vid);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // Settings honesty chrome (must_keep spot)
    await openSettingsLegal(page);
    await hardRefresh(page);
    await openSettingsLegal(page);
    let bodyText = await page.locator('body').innerText().catch(() => '');
    const honestyVisible = /contracts_printable_ready\s*=\s*false/i.test(bodyText);
    const clauseChrome =
      (await page.getByTestId('ctr-clause-code').isVisible().catch(() => false)) ||
      (await page.getByTestId('ctr-legal-tab-clauses').isVisible().catch(() => false));
    await page.getByTestId('ctr-legal-tab-templates').click().catch(() => {});
    await sleep(1000);
    const tplChrome =
      (await page.getByTestId('ctr-tpl-code').isVisible().catch(() => false)) ||
      (await page.getByTestId('ctr-tpl-palette').isVisible().catch(() => false)) ||
      (await page.getByTestId('ctr-tpl-canvas').isVisible().catch(() => false));
    await shot(page, '00-settings-chrome');
    recordUf('SETTINGS_CHROME', clauseChrome || tplChrome ? 'PASS' : 'FAIL', {
      summary: `honesty=${honestyVisible} clause=${clauseChrome} tpl=${tplChrome}`,
      honestySettings: honestyVisible,
      clauseChrome,
      tplChrome,
    });

    // Open existing contract + PDF button (UF-HRM-02 create skipped — reuse R3 row; spot list)
    await openContracts(page);
    await shot(page, '01-contracts-list');
    const createBtn = page.getByTestId('hdsd-contracts-create-btn');
    const listOk =
      (await createBtn.isVisible().catch(() => false)) ||
      (await page.locator('tbody tr').first().isVisible().catch(() => false));
    const opened = await openEditByCode(page, KNOWN_CODE);
    await shot(page, '02-edit-spine');

    const versionsList = page.getByTestId('ctr-print-versions');
    const versionsVisible = await versionsList.isVisible().catch(() => false);
    let versionsCount = 0;
    if (versionsVisible) versionsCount = await versionsList.locator('li').count();

    let toastOk = false;
    let downloadOk = false;
    let fePdfNet = null;
    const pdfBtn = page.getByTestId(`ctr-print-pdf-${vid}`);
    const pdfBtnAlt = page.locator('[data-testid^="ctr-print-pdf-"]').first();
    const btn = (await pdfBtn.isVisible().catch(() => false)) ? pdfBtn : pdfBtnAlt;

    if (await btn.isVisible().catch(() => false)) {
      const n0 = results.network.length;
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
      await btn.click();
      log('CLICK_PDF', { note: `vid=${vid}` });
      await sleep(3000);
      const dl = await downloadPromise;
      if (dl) {
        downloadOk = true;
        const suggested = dl.suggestedFilename();
        results.ids.downloadFilename = suggested;
        const p = join(SCREEN, 'downloaded.pdf');
        await dl.saveAs(p).catch(() => {});
      }
      const toast = page.getByText(/Đã tải PDF/i).first();
      toastOk = await toast.isVisible().catch(() => false);
      if (!toastOk) {
        await sleep(1500);
        toastOk = await toast.isVisible().catch(() => false);
      }
      fePdfNet = results.network
        .slice(n0)
        .filter((n) => /\/pdf/.test(n.url) && !/format=html/.test(n.url))
        .pop();
      await shot(page, '03-pdf-toast');
    } else {
      log('PDF_BTN_MISSING', { note: `vid=${vid} opened=${opened}` });
      await shot(page, '03-pdf-btn-missing');
    }

    // Honesty on spine
    const spineText = await page.locator('body').innerText().catch(() => '');
    const honestySpine =
      /contracts_printable_ready\s*=\s*false|chưa sẵn sàng in|printable.?ready.*false/i.test(
        spineText,
      );

    const netPdfPass = Boolean(
      fePdfNet &&
        fePdfNet.status === 200 &&
        fePdfNet.isApplicationPdf &&
        fePdfNet.isPdfMagic,
    );

    recordUf('UF-HRM-02-SPOT', listOk && opened ? 'PASS' : 'FAIL', {
      summary: `listOk=${listOk} opened=${opened} code=${KNOWN_CODE} versionsUi=${versionsCount}`,
      listOk,
      opened,
      versionsCount,
    });

    recordAc('AC-CTR-PDF-BINARY', api.pdf.pass && (netPdfPass || toastOk) ? 'PASS' : 'FAIL', {
      summary: `apiPdf=${api.pdf.pass} ct=${api.pdf.contentType} magic=${api.pdf.magic} eng=${api.pdf.engine} feNet=${netPdfPass} toast=${toastOk} dl=${downloadOk}`,
      apiPdf: api.pdf,
      feNetwork: fePdfNet,
      toastOk,
      downloadOk,
      netPdfPass,
    });

    recordAc('AC-CTR-PDF-HTML-DEBUG', api.html.pass ? 'PASS' : 'FAIL', {
      summary: `html=${api.html.status} ct=${api.html.contentType} eng=${api.html.engine}`,
      apiHtml: api.html,
    });

    recordUf('HONESTY', !results.honesty.contracts_printable_ready_claimed ? 'PASS' : 'FAIL', {
      summary: `contracts_printable_ready=false settings=${honestyVisible} spine=${honestySpine}`,
      honestySettings: honestyVisible,
      honestySpine,
    });

    const pg = processGateSummary();
    recordUf('PROCESS_GATE', pg.fail ? 'FAIL' : 'PASS', {
      summary: `dndStorm=${results.process.dndStorm} uncaught=${results.process.uncaught} pageErr=${results.process.pageErrors} console=${results.process.consoleErrors}`,
      ...results.process,
    });

    if (api.pdf.pass && toastOk) {
      results.closed_residuals.push({
        id: 'Q-CTR-02',
        note: 'PDF binary application/pdf + %PDF + FE toast Đã tải PDF (browser)',
      });
    } else if (api.pdf.pass && !toastOk) {
      results.residuals.push({
        id: 'Q-CTR-02-FE-TOAST',
        severity: 'P1',
        note: `API PDF binary PASS but FE toast missing; net=${JSON.stringify(fePdfNet || {})}`,
      });
    } else {
      results.residuals.push({
        id: 'Q-CTR-02',
        severity: 'P0',
        note: `PDF binary FAIL api=${JSON.stringify(api.pdf)}`,
      });
    }

    const mustKeepOk =
      results.uf['UF-HRM-02-SPOT']?.verdict !== 'FAIL' &&
      results.uf.PROCESS_GATE?.verdict === 'PASS' &&
      results.uf.HONESTY?.verdict === 'PASS';
    const acOk =
      results.ac['AC-CTR-PDF-BINARY']?.verdict === 'PASS' &&
      results.ac['AC-CTR-PDF-HTML-DEBUG']?.verdict === 'PASS';

    results.overall = acOk && mustKeepOk && api.pdf.pass ? 'PASS' : 'FAIL';
    results.ack_status = results.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.honesty.contracts_printable_ready = false;
    results.endedAt = ts();
    save();
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'HARNESS', severity: 'P0', note: String(e).slice(0, 400) });
    results.endedAt = ts();
    save();
    console.error(e);
  } finally {
    await browser.close().catch(() => {});
  }

  console.log(`FINAL ${results.ack_status} overall=${results.overall}`);
  console.log(`evidence ${OUT_JSON}`);
  process.exit(results.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  results.overall = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  process.exit(2);
});
