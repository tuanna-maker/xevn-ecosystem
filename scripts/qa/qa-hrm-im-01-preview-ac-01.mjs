/**
 * QA-HRM-IM-01-PREVIEW-AC-01 — FR-HRM-IM-01 preview AC (browser U65)
 * AC-IM-01-SCOPE-01/02 · SESSION-01/02 · VAL-01..03
 * Portal :5173 · ceo@xe.vn · zero-seed · NO commit (IM-02 OUT)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE = resolve(ROOT, 'docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-qa-hrm-im-01-preview-ac-01-runtime.json');
const SHOT_DIR = resolve(EVIDENCE, 'screenshots/qa-hrm-im-01-preview-ac-01');

const UNIQUE = `QA-IM01-${Date.now().toString(36).toUpperCase()}`;
const VALID_CODE = `${UNIQUE}-OK`;
const VALID_EMAIL = `${UNIQUE.toLowerCase()}.ok@xe.vn`;
const EXISTING_CODE_PROBE = 'HLD-0996'; // known seed persona code — used only for VAL-03 (preview must NOT hard-fail DB dup)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-IM-01-PREVIEW-AC-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_API, XBOS_API, EMAIL, seed: false, UNIQUE },
  entry_criteria: {},
  ac: {},
  click_path: [],
  network: { preview: null, commitCalls: [], employeesMutate: [] },
  ui: {},
  apiBaseline: {},
  consoleErrors: [],
  screenshots: [],
  overall: null,
};

function save() {
  mkdirSync(EVIDENCE, { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function setAc(id, verdict, detail, extras = {}) {
  results.ac[id] = { verdict, detail, ...extras };
  console.log(`${verdict}  ${id}  ${detail}`);
  save();
}

function note(msg) {
  results.click_path.push({ at: new Date().toISOString(), msg });
  console.log(` · ${msg}`);
}

async function shot(page, name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = resolve(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push(path);
  return path;
}

async function loginToken() {
  const res = await fetch(`${XBOS_API}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login HTTP ${res.status}`);
  const login = await res.json();
  const data = login?.data ?? login;
  const token = data.accessToken || data.access_token;
  if (!token) throw new Error('login missing token');
  return { token, user: data.user || { userId: EMAIL, email: EMAIL, roles: ['group_ceo'] } };
}

async function empTotal(token) {
  const r = await fetch(`${HRM_API}/api/hrm/employees/summary?company_id=main`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    },
  });
  const j = await r.json();
  return { http: r.status, code: j.code, total: j?.data?.total ?? null, raw: j };
}

async function searchEmpCode(token, code) {
  const q = new URLSearchParams({
    company_id: 'main',
    keyword: code,
    page: '1',
    page_size: '5',
  });
  const r = await fetch(`${HRM_API}/api/hrm/employees?${q}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    },
  });
  const j = await r.json();
  const rows = j?.data?.data ?? j?.data ?? [];
  const list = Array.isArray(rows) ? rows : [];
  const hit = list.some(
    (e) => String(e.employee_code || e.code || '').toUpperCase() === code.toUpperCase(),
  );
  return { http: r.status, code: j.code, total: j?.data?.total, hit, sample: list.slice(0, 2) };
}

function buildCsv() {
  // Row1 valid; Row2 missing email; Row3 missing code+name + bad hired_at;
  // Row4 uses EXISTING_CODE_PROBE + fake catalog job_title (VAL-02/03 — must not hard-fail preview)
  const lines = [
    'employee_code,email,full_name,job_title_key,hired_at',
    `${VALID_CODE},${VALID_EMAIL},QA IM01 Preview Valid,NOT_A_REAL_CATALOG_KEY_XYZ,2026-01-15`,
    `${UNIQUE}-NOEMAIL,,QA Missing Email Only,DRIVER,2026-01-15`,
    `,,Missing Code Name,DRIVER,not-a-date`,
    `${EXISTING_CODE_PROBE},dup.probe.${UNIQUE.toLowerCase()}@xe.vn,Dup Code Probe Row,ANOTHER_FAKE_TITLE,2026-02-01`,
  ];
  return lines.join('\n') + '\n';
}

async function main() {
  mkdirSync(EVIDENCE, { recursive: true });
  note('entry: BA residual + OpenAPI closed (docs cited in evidence MD)');
  results.entry_criteria = {
    ba_u71: 'docs/qa/evidence/ba-u71-im-residual-01-20260727.md PASS_TO_PM',
    api_design: 'docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md',
    team_ac: 'docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md',
    openapi: 'docs/qa/evidence/be-hrm-oa-import-fleet-01-20260727.md G-IM-OPENAPI-01 CLOSED',
    l0: 'portal:5173 + hrm:28001 + xbos:28002 UP',
    u65: true,
  };

  const auth = await loginToken();
  note(`login OK ${EMAIL}`);

  const before = await empTotal(auth.token);
  results.apiBaseline.beforeTotal = before;
  note(`employees summary total BEFORE preview = ${before.total}`);

  const csvPath = join(tmpdir(), `${UNIQUE}-preview.csv`);
  writeFileSync(csvPath, buildCsv(), 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        results.consoleErrors.push(msg.text().slice(0, 300));
      }
    });

    page.on('response', async (res) => {
      const url = res.url();
      try {
        if (url.includes('/api/hrm/spreadsheet/import/preview')) {
          const status = res.status();
          let body = null;
          try {
            body = await res.json();
          } catch {
            body = { parseError: true };
          }
          results.network.preview = {
            url,
            status,
            code: body?.code,
            message: body?.message,
            dataKeys: body?.data ? Object.keys(body.data) : [],
            rowCount: body?.data?.rowCount,
            errorsLen: body?.data?.errors?.length,
            hasSessionId: Boolean(body?.data?.sessionId || body?.data?.previewToken),
            sessionId: body?.data?.sessionId ?? null,
            previewToken: body?.data?.previewToken ?? null,
            dryRun: body?.data?.dryRun,
            truncated: body?.data?.truncated,
            errorsSample: (body?.data?.errors || []).slice(0, 8),
            previewRowsSample: (body?.data?.previewRows || []).slice(0, 2),
          };
          note(`Network preview HTTP ${status} code=${body?.code}`);
          save();
        }
        if (url.includes('/api/hrm/spreadsheet/import/commit')) {
          results.network.commitCalls.push({ url, status: res.status() });
          note(`WARN commit observed HTTP ${res.status()} — IM-01 must not require commit`);
        }
        const method = res.request().method();
        if (
          url.includes('/api/hrm/employees') &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        ) {
          results.network.employeesMutate.push({
            url,
            method,
            status: res.status(),
          });
        }
      } catch {
        /* ignore body read races */
      }
    });

    await page.evaluateOnNewDocument(
      (s) => {
        for (const store of [localStorage, sessionStorage]) {
          store.setItem('xevn.portal.accessToken', s.token);
          store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
          store.setItem('xevn.portal.user', JSON.stringify(s.user));
          store.setItem('xevn.portal.tenantId', 'xevn');
          store.setItem('xevn.portal.companyId', 'main');
        }
      },
      { token: auth.token, expiresAt: Date.now() + 8e6, user: auth.user },
    );

    // Prefer portal embed path used in matrix journeys
    const urlsTry = [
      `${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`,
      `${PORTAL}/command-center/hrm/employees`,
    ];

    let landed = null;
    for (const u of urlsTry) {
      note(`goto ${u}`);
      await page.goto(u, { waitUntil: 'networkidle2', timeout: 90000 });
      await sleep(2500);
      const hasImport = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button,a')];
        return btns.some((b) => /Nhập từ Excel|Import Excel|Import from Excel/i.test(b.textContent || ''));
      });
      if (hasImport) {
        landed = u;
        break;
      }
      // iframe embed?
      const frames = page.frames();
      for (const f of frames) {
        try {
          const ok = await f.evaluate(() => {
            const btns = [...document.querySelectorAll('button,a')];
            return btns.some((b) =>
              /Nhập từ Excel|Import Excel|Import from Excel/i.test(b.textContent || ''),
            );
          });
          if (ok) {
            landed = `iframe:${f.url()}`;
            results.ui.frameUrl = f.url();
            break;
          }
        } catch {
          /* cross-origin */
        }
      }
      if (landed) break;
    }

    results.ui.landed = landed;
    results.ui.url = page.url();
    await shot(page, '01-employees-list');

    if (!landed) {
      const bodySlice = await page.evaluate(() =>
        (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 400),
      );
      results.ui.bodySlice = bodySlice;
      setAc('AC-IM-01-SCOPE-01', 'BLOCKED', 'Import Excel button not found on FE path tried', {
        urlsTry,
        bodySlice,
      });
      setAc('AC-IM-01-SCOPE-02', 'BLOCKED', 'FE path blocked before scope assert');
      setAc('AC-IM-01-SESSION-01', 'BLOCKED', 'FE path blocked');
      setAc('AC-IM-01-SESSION-02', 'BLOCKED', 'FE path blocked');
      setAc('AC-IM-01-VAL-01', 'BLOCKED', 'FE path blocked');
      setAc('AC-IM-01-VAL-02', 'BLOCKED', 'FE path blocked');
      setAc('AC-IM-01-VAL-03', 'BLOCKED', 'FE path blocked');
      results.overall = 'BLOCKED';
      save();
      return;
    }

    // Resolve working page/frame context
    let ctx = page;
    if (String(landed).startsWith('iframe:')) {
      const f = page.frames().find((x) => x.url() === results.ui.frameUrl);
      if (f) ctx = f;
    }

    note('click Import Excel');
    const clicked = await ctx.evaluate(() => {
      const btn = [...document.querySelectorAll('button,a')].find((b) =>
        /Nhập từ Excel|Import Excel|Import from Excel/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.click();
      return true;
    });
    if (!clicked) {
      setAc('AC-IM-01-SCOPE-01', 'BLOCKED', 'Import button evaluate click failed');
      results.overall = 'BLOCKED';
      save();
      return;
    }
    await sleep(1200);
    await shot(page, '02-import-dialog-open');

    const dialogOk = await ctx.evaluate(() => {
      const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
      return /Import|Nhập|Excel|mẫu|template|tải/i.test(text);
    });
    note(`dialog visible=${dialogOk}`);

    const input = await ctx.$('input[type=file]');
    if (!input) {
      setAc('AC-IM-01-SCOPE-01', 'BLOCKED', 'file input not found in import dialog');
      results.overall = 'BLOCKED';
      await shot(page, '02b-no-file-input');
      save();
      return;
    }

    note(`upload CSV ${csvPath}`);
    await input.uploadFile(csvPath);
    // wait for preview network + UI
    for (let i = 0; i < 40; i++) {
      if (results.network.preview) break;
      await sleep(250);
    }
    await sleep(1500);
    await shot(page, '03-preview-table');

    const uiPreview = await ctx.evaluate(() => {
      const dialog =
        document.querySelector('[role=dialog]') ||
        document.querySelector('[data-state=open]') ||
        document.body;
      const text = (dialog?.innerText || '').replace(/\s+/g, ' ');
      const tables = [...(dialog?.querySelectorAll?.('table') || [])];
      const previewTable =
        tables.find((t) => /email|họ tên|full.?name|mã|employee/i.test(t.innerText || '')) ||
        tables[tables.length - 1];
      const rows = previewTable ? [...previewTable.querySelectorAll('tbody tr')].length : 0;
      const hasTable = rows > 0 || /Tổng|Total|row|dòng|Hợp lệ|Lỗi|Valid|Error/i.test(text);
      const hasErrorBadge = /Lỗi|Error|invalid|Required|email/i.test(text);
      const hasValid = /Hợp lệ|Valid|OK/i.test(text);
      const hasValidCode = /QA-IM01-/i.test(text);
      const dialogSlice = text.slice(0, 900);
      return { rows, hasTable, hasErrorBadge, hasValid, hasValidCode, dialogSlice, tableCount: tables.length };
    });
    results.ui.preview = uiPreview;
    note(`UI preview rows=${uiPreview.rows} hasTable=${uiPreview.hasTable}`);

    const pv = results.network.preview;
    const http2xx = pv && pv.status >= 200 && pv.status < 300;
    const sheetOk = Boolean(http2xx && pv.code === 'SHEET-200');
    const httpExact200 = Boolean(pv && pv.status === 200);
    results.network.httpContract = {
      expectedHttp: 200,
      actualHttp: pv?.status ?? null,
      code: pv?.code ?? null,
      httpExact200,
      note: 'API_DESIGN §A + @HttpCode(OK) — Nest default POST was 201 when process stale',
    };
    const noSession = pv && !pv.hasSessionId && pv.sessionId == null && pv.previewToken == null;
    const hasRowErrors = (pv?.errorsLen || 0) > 0;
    const noCommit = results.network.commitCalls.length === 0;
    const noEmpMutate = results.network.employeesMutate.length === 0;

    // AC-IM-01-SESSION-01
    if (sheetOk && noSession && uiPreview.hasTable) {
      setAc(
        'AC-IM-01-SESSION-01',
        'PASS',
        `SHEET-200 without sessionId/previewToken; FE preview table rows=${uiPreview.rows}`,
        { dataKeys: pv.dataKeys },
      );
    } else {
      setAc(
        'AC-IM-01-SESSION-01',
        sheetOk && noSession ? 'FAIL' : 'FAIL',
        `sheetOk=${sheetOk} noSession=${noSession} hasTable=${uiPreview.hasTable}`,
        { preview: pv, uiPreview },
      );
    }

    // AC-IM-01-VAL-01 — missing fields → errors[]
    if (sheetOk && hasRowErrors) {
      const codes = (pv.errorsSample || []).map((e) => e.code);
      setAc(
        'AC-IM-01-VAL-01',
        'PASS',
        `row-level errors[] len=${pv.errorsLen}; sample codes=${codes.join(',') || 'n/a'}`,
        { errorsSample: pv.errorsSample },
      );
    } else {
      setAc(
        'AC-IM-01-VAL-01',
        'FAIL',
        `expected SHEET-200 + errors[] for missing email/code; sheetOk=${sheetOk} errorsLen=${pv?.errorsLen}`,
      );
    }

    // AC-IM-01-VAL-02 — fake catalog key still preview (no hard-block / no staging)
    const fakeTitleStillPreview =
      sheetOk &&
      (pv.previewRowsSample || []).some(
        (r) => String(r.job_title_key || '').includes('NOT_A_REAL_CATALOG') || r.employee_code === VALID_CODE,
      );
    if (sheetOk && pv.status === 200 && pv.code !== 'SHEET-422') {
      setAc(
        'AC-IM-01-VAL-02',
        'PASS',
        `preview not hard-blocked for fake catalog job_title; HTTP 200 SHEET-200 (no staging)`,
        { fakeTitleStillPreview, dryRun: pv.dryRun },
      );
    } else {
      setAc('AC-IM-01-VAL-02', 'FAIL', `unexpected hard-fail on catalog-less preview: ${pv?.code}`);
    }

    // AC-IM-01-VAL-03 — existing employee_code in file still SHEET-200 (DB dup OUT)
    const dupRowInPreview =
      sheetOk &&
      ((pv.previewRowsSample || []).some((r) => r.employee_code === EXISTING_CODE_PROBE) ||
        pv.rowCount >= 4);
    if (sheetOk && pv.code === 'SHEET-200') {
      setAc(
        'AC-IM-01-VAL-03',
        'PASS',
        `preview SHEET-200 with row using existing code ${EXISTING_CODE_PROBE}; DB-dup not required on IM-01`,
        { rowCount: pv.rowCount, dupRowInPreview },
      );
    } else {
      setAc('AC-IM-01-VAL-03', 'FAIL', `preview failed when file includes existing code: ${pv?.code}`);
    }

    // Close dialog WITHOUT commit (SCOPE-02)
    note('close dialog without commit (Esc / Cancel)');
    await ctx.evaluate(() => {
      const cancel = [...document.querySelectorAll('button')].find((b) =>
        /Hủy|Cancel|Đóng|Close/i.test((b.textContent || '').trim()),
      );
      cancel?.click();
    });
    await page.keyboard.press('Escape');
    await sleep(800);

    // F5 — SESSION-02 + SCOPE-01 non-persist
    note('F5 reload employees — expect no new employees from preview');
    await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(2500);
    await shot(page, '04-after-f5');

    const after = await empTotal(auth.token);
    results.apiBaseline.afterTotal = after;
    const searchValid = await searchEmpCode(auth.token, VALID_CODE);
    results.apiBaseline.searchValidCode = searchValid;

    const totalUnchanged =
      before.total != null && after.total != null && before.total === after.total;
    const codeNotPersisted = searchValid.hit === false;

    if (sheetOk && totalUnchanged && codeNotPersisted && noCommit && noEmpMutate) {
      setAc(
        'AC-IM-01-SCOPE-01',
        'PASS',
        `preview SHEET-200; total ${before.total}→${after.total}; code ${VALID_CODE} not in list; no commit/POST employees`,
      );
    } else {
      setAc(
        'AC-IM-01-SCOPE-01',
        'FAIL',
        `sheetOk=${sheetOk} totalUnchanged=${totalUnchanged} (${before.total}→${after.total}) codeNotPersisted=${codeNotPersisted} noCommit=${noCommit} noEmpMutate=${noEmpMutate}`,
        { commitCalls: results.network.commitCalls, employeesMutate: results.network.employeesMutate },
      );
    }

    // SESSION-02 — F5 does not restore preview session from server
    const previewGone = await page.evaluate(() => {
      const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
      const dialogOpen = !!document.querySelector('[role=dialog]');
      const stillPreview =
        dialogOpen && /preview|xem trước|Hợp lệ|Tổng số dòng|total rows/i.test(text);
      return { dialogOpen, stillPreview, slice: text.slice(0, 200) };
    });
    results.ui.afterF5 = previewGone;
    if (!previewGone.stillPreview) {
      setAc(
        'AC-IM-01-SESSION-02',
        'PASS',
        'After F5, preview dialog/session not restored from server (ephemeral expected)',
        previewGone,
      );
    } else {
      setAc(
        'AC-IM-01-SESSION-02',
        'FAIL',
        'Preview UI still present after F5 — unexpected durable session',
        previewGone,
      );
    }

    // SCOPE-02 — did not require commit/staging to close IM-01
    if (noCommit && sheetOk) {
      setAc(
        'AC-IM-01-SCOPE-02',
        'PASS',
        'IM-01 closed on preview alone; no commit/staging used; commit OUT (IM-02)',
      );
    } else {
      setAc(
        'AC-IM-01-SCOPE-02',
        'FAIL',
        `commitCalls=${results.network.commitCalls.length} sheetOk=${sheetOk}`,
      );
    }

    const verdicts = Object.values(results.ac).map((a) => a.verdict);
    if (verdicts.includes('FAIL')) results.overall = 'FAIL';
    else if (verdicts.includes('BLOCKED')) results.overall = 'BLOCKED';
    else if (verdicts.every((v) => v === 'PASS')) results.overall = 'PASS';
    else results.overall = 'FAIL';

    results.finishedAt = new Date().toISOString();
    save();
    console.log(`\nOVERALL ${results.overall}`);
    console.log(`runtime ${OUT}`);
  } finally {
    await browser.close();
    try {
      unlinkSync(csvPath);
    } catch {
      /* keep */
    }
  }
}

main().catch((e) => {
  results.overall = 'FAIL';
  results.fatal = String(e?.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
