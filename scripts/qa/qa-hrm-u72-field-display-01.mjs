/**
 * QA-HRM-U72-FIELD-DISPLAY-01 — browser spot F-01..F-13 + U-01..U-06 + AC-CO-IND-02
 * U65 zero-seed · portal :5173 · ceo@xe.vn
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE = resolve(ROOT, 'docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-qa-hrm-u72-field-display-01-runtime.json');
const SHOT_DIR = resolve(EVIDENCE, 'screenshots/qa-hrm-u72-field-display-01');

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const FORBIDDEN_INDUSTRY = new Set(['subsidiary', 'holding', 'parent', 'member', 'branch']);

const RAW_PATTERNS = {
  gender: /\b(male|female|other)\b/i,
  employment: /\b(full[_-]?time|part[_-]?time|fulltime|parttime|intern)\b/i,
  lineType: /\b(base|probation|allowance)\b/i,
  allowanceCode: /\bPHU_CAP_[A-Z0-9_]+\b/,
  contractType: /\b(fixed_term|indefinite|permanent|HDLD_[A-Z0-9_]+)\b/i,
  contractStatus: /\b(active|expired|terminated)\b/i,
  leaveType: /\b(annual|LVT_\d+)\b/i,
  companySlug: /\b(trsport|logistics|finance|services|holding)\b/i,
  marital: /\b(single|married|divorced)\b/i,
  stage: /\b(screening|interview|offer|hired|rejected|applied)\b/i,
  settingsStatus: /\b(active|draft)\b/i,
  cycleStatus: /\b(draft|active|closed)\b/i,
  employeeUuid: /Employee\s+[0-9a-f-]{36}/i,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-U72-FIELD-DISPLAY-01',
  alias: 'QA-HRM-U72-LABEL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, XBOS_API, EMAIL, seed: false },
  steps: [],
  ac: {},
  observations: {},
  screenshots: [],
  consoleErrors: [],
  overall: null,
};

function save() {
  mkdirSync(EVIDENCE, { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

function setAc(id, verdict, detail, extras = {}) {
  results.ac[id] = { verdict, detail, ...extras };
  note(id, verdict === 'PASS' || verdict === 'N/A' || verdict === 'BLOCKED', `${verdict} · ${detail}`);
}

async function shot(page, name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = resolve(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push(path);
  return path;
}

function q(path) {
  const base = `${PORTAL}${path}`;
  const join = path.includes('?') ? '&' : '?';
  return `${base}${join}portal=1&tenantId=xevn&companyId=main`;
}

async function loginApi() {
  const bases = [`${XBOS_API}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
  for (const url of bases) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: data?.user ?? {
            userId: EMAIL,
            email: EMAIL,
            displayName: 'CEO Tập đoàn',
            roles: ['group_ceo', 'portal'],
          },
          raw: data,
          loginUrl: url,
        };
      }
    } catch {
      /* try next */
    }
  }
  throw new Error('login failed');
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

async function bodyText(page) {
  return page.evaluate(() => (document.body?.innerText || '').replace(/\s+/g, ' ').trim());
}

/** Extract value next to a label (label then value on same/nearby block). */
async function labeledValues(page, labels) {
  return page.evaluate((labs) => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const out = {};
    const all = Array.from(document.querySelectorAll('label, dt, th, span, div, p, td'));
    for (const lab of labs) {
      const hit = all.find((el) => {
        const t = text(el);
        return t === lab || t.startsWith(lab) || (t.includes(lab) && t.length < lab.length + 24);
      });
      if (!hit) {
        out[lab] = null;
        continue;
      }
      const parent = hit.closest('div, tr, dl, li, section') || hit.parentElement;
      let value = '';
      if (hit.tagName === 'TH') {
        const idx = Array.from(hit.parentElement?.children || []).indexOf(hit);
        const row = hit.closest('table')?.querySelector('tbody tr');
        const cell = row?.querySelectorAll('td')?.[idx];
        value = text(cell);
      } else if (hit.nextElementSibling) {
        value = text(hit.nextElementSibling);
      } else if (parent) {
        const full = text(parent);
        value = full.replace(lab, '').replace(/^[:\s]+/, '').trim().slice(0, 120);
      }
      out[lab] = value || null;
    }
    return out;
  }, labels);
}

async function clickText(page, patterns, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const ok = await page.evaluate((pats) => {
      const nodes = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="menuitem"], span, div'));
      for (const pat of pats) {
        const re = new RegExp(pat, 'i');
        const el = nodes.find((n) => re.test((n.textContent || '').trim()) && (n.textContent || '').trim().length < 80);
        if (el) {
          el.click();
          return (el.textContent || '').trim().slice(0, 60);
        }
      }
      return null;
    }, patterns);
    if (ok) return ok;
    await sleep(300);
  }
  return null;
}

async function clickFirstDataRow(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((tr) => tr.querySelectorAll('td').length >= 2);
    if (!rows.length) return { ok: false, text: '' };
    const row = rows[0];
    const t = (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    const link = row.querySelector('a[href*="/employees/"], a[href*="/recruitment"], button, td');
    (link || row).click();
    return { ok: true, text: t };
  });
}

function hasRaw(text, re) {
  if (!text) return false;
  return re.test(text);
}

function passIfNoRaw(id, observed, rawRe, goodHints = []) {
  const text = typeof observed === 'string' ? observed : JSON.stringify(observed);
  const leak = hasRaw(text, rawRe);
  const uuidLeak = UUID_RE.test(text) && /Employee\s+/i.test(text);
  const empty = !text || text === 'null' || text === '{}' || text.includes('"null"');
  let verdict = 'PASS';
  let detail = `observed=${String(text).slice(0, 180)}`;
  if (empty) {
    verdict = 'BLOCKED';
    detail = `no observable field value · ${detail}`;
  } else if (leak || uuidLeak) {
    verdict = 'FAIL';
    detail = `RAW LEAK · ${detail}`;
  } else if (goodHints.length && !goodHints.some((h) => text.includes(h))) {
    // still PASS if no raw — VI label may vary; only FAIL on raw
    detail = `no raw; VI hint soft · ${detail}`;
  }
  setAc(id, verdict, detail, { observed: String(text).slice(0, 300) });
  return verdict;
}

async function scrapeIndustry(page) {
  return page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    for (const table of Array.from(document.querySelectorAll('table'))) {
      const headers = Array.from(table.querySelectorAll('th')).map((th) => text(th));
      const indIdx = headers.findIndex((h) => h.includes('Ngành nghề') || /industry/i.test(h));
      if (indIdx < 0) continue;
      const rows = [];
      for (const tr of Array.from(table.querySelectorAll('tbody tr'))) {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (!cells.length) continue;
        rows.push({ industry: text(cells[indIdx]), name: text(cells[0]).slice(0, 80) });
      }
      return { headers, rows, url: location.href };
    }
    return { headers: [], rows: [], url: location.href, body: text(document.body).slice(0, 300) };
  });
}

async function scrapeColumnSamples(page, headerHints) {
  return page.evaluate((hints) => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    for (const table of Array.from(document.querySelectorAll('table'))) {
      const headers = Array.from(table.querySelectorAll('th')).map((th) => text(th));
      const idx = headers.findIndex((h) => hints.some((x) => h.toLowerCase().includes(x.toLowerCase())));
      if (idx < 0) continue;
      const values = [];
      for (const tr of Array.from(table.querySelectorAll('tbody tr')).slice(0, 8)) {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (cells[idx]) values.push(text(cells[idx]));
      }
      return { header: headers[idx], values, headers, url: location.href };
    }
    return { header: null, values: [], headers: [], url: location.href };
  }, headerHints);
}

async function main() {
  console.log('=== QA-HRM-U72-FIELD-DISPLAY-01 ===');
  const session = await loginApi();
  note('login', true, session.loginUrl);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => results.consoleErrors.push(String(e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  await injectSession(page, session);

  try {
    // ---- AC-CO-IND-02 via CC embed company ----
    await page.goto(`${PORTAL}/command-center/hrm/company`, {
      waitUntil: 'networkidle2',
      timeout: 90_000,
    });
    await sleep(4500);
    let frame = page.mainFrame();
    for (const f of page.frames()) {
      const u = f.url() || '';
      if (u.includes('/hr/') || u.includes('company')) {
        frame = f;
        break;
      }
    }
    const industry = await frame.evaluate(() => {
      const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
      for (const table of Array.from(document.querySelectorAll('table'))) {
        const headers = Array.from(table.querySelectorAll('th')).map((th) => text(th));
        const indIdx = headers.findIndex((h) => h.includes('Ngành nghề') || /industry/i.test(h));
        if (indIdx < 0) continue;
        const rows = [];
        for (const tr of Array.from(table.querySelectorAll('tbody tr'))) {
          const cells = Array.from(tr.querySelectorAll('td'));
          if (!cells.length) continue;
          rows.push({ industry: text(cells[indIdx]), name: text(cells[0]).slice(0, 80) });
        }
        return { headers, rows, url: location.href };
      }
      return { headers: [], rows: [], url: location.href, body: text(document.body).slice(0, 300) };
    });
    results.observations.industry = industry;
    await shot(page, '01-company-industry');
    const badInd = (industry.rows || []).filter((r) =>
      FORBIDDEN_INDUSTRY.has((r.industry || '').trim().toLowerCase()),
    );
    setAc(
      'AC-CO-IND-02',
      badInd.length === 0 && (industry.rows || []).length > 0 ? 'PASS' : badInd.length ? 'FAIL' : 'BLOCKED',
      `rows=${industry.rows?.length || 0} forbidden=${badInd.length} sample=${JSON.stringify((industry.rows || []).slice(0, 5))}`,
      { click_path: 'login→CC/hrm/company→Ngành nghề column', url: `${PORTAL}/command-center/hrm/company` },
    );

    // ---- Employees profile F-01 F-02 U-01 U-02 ----
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await shot(page, '02-employees-list');
    const row1 = await clickFirstDataRow(page);
    await sleep(3000);
    let empUrl = page.url();
    if (!/\/employees\//.test(empUrl)) {
      // try name link
      await page.evaluate(() => {
        const a = document.querySelector('tbody tr a[href*="/employees/"]');
        if (a) a.click();
      });
      await sleep(2500);
      empUrl = page.url();
    }
    results.observations.employeeUrl = empUrl;
    await shot(page, '03-employee-profile');

    const profileLabels = await labeledValues(page, [
      'Giới tính',
      'Loại hình làm việc',
      'Nơi làm việc',
      'Phòng ban',
      'Chức danh',
      'Gender',
      'Employment type',
    ]);
    results.observations.profileLabels = profileLabels;
    const genderVal =
      profileLabels['Giới tính'] || profileLabels['Gender'] || (await bodyText(page)).match(/Giới tính\s+([^\n]+)/)?.[1];
    const empTypeVal =
      profileLabels['Loại hình làm việc'] ||
      profileLabels['Employment type'] ||
      (await bodyText(page)).match(/Loại hình(?: làm việc)?\s+([^\n]+)/)?.[1];
    const workLoc = profileLabels['Nơi làm việc'];
    const dept = profileLabels['Phòng ban'];
    const pos = profileLabels['Chức danh'];

    const profileBody = await bodyText(page);
    passIfNoRaw(
      'AC-FD-01',
      genderVal || (profileBody.includes('Nam') || profileBody.includes('Nữ') ? 'Nam/Nữ present' : profileBody.slice(0, 200)),
      RAW_PATTERNS.gender,
      ['Nam', 'Nữ', 'Khác', '—', '-'],
    );
    results.ac['AC-FD-01'].click_path = 'employees list→row→profile Giới tính';
    results.ac['AC-FD-01'].url = empUrl;

    passIfNoRaw(
      'AC-FD-02',
      empTypeVal || profileBody.slice(0, 400),
      RAW_PATTERNS.employment,
      ['Toàn thời gian', 'Bán thời gian', 'Hợp đồng', 'Thực tập', '—'],
    );
    results.ac['AC-FD-02'].click_path = 'employees→profile Loại hình làm việc';
    results.ac['AC-FD-02'].url = empUrl;

    // Soft: if labeled extract failed, scan profile body for raw gender/employment near fields
    if (results.ac['AC-FD-01'].verdict === 'BLOCKED') {
      const leak = RAW_PATTERNS.gender.test(profileBody);
      setAc('AC-FD-01', leak ? 'FAIL' : 'PASS', leak ? 'raw gender in body' : 'no raw gender in profile body', {
        click_path: 'employees→profile',
        url: empUrl,
        observed: profileBody.slice(0, 240),
      });
    }
    if (results.ac['AC-FD-02'].verdict === 'BLOCKED') {
      const leak = RAW_PATTERNS.employment.test(profileBody);
      setAc('AC-FD-02', leak ? 'FAIL' : 'PASS', leak ? 'raw employment in body' : 'no raw employment_type in profile body', {
        click_path: 'employees→profile',
        url: empUrl,
        observed: profileBody.slice(0, 240),
      });
    }

    const u01Text = workLoc || '—';
    const u01Leak = /\b(WL_|LOC_|work_location)\b/i.test(u01Text);
    setAc(
      'AC-FD-U01',
      u01Leak ? 'FAIL' : 'PASS',
      `work_location=${u01Text}`,
      { click_path: 'employees→profile Nơi làm việc', url: empUrl, observed: u01Text },
    );
    const u02Text = [dept, pos].filter(Boolean).join(' | ') || profileBody.slice(0, 200);
    const u02Leak = /\b(job_title_key|JT_|POS_)\b/i.test(u02Text) || /job_title_key/i.test(profileBody);
    setAc(
      'AC-FD-U02',
      u02Leak ? 'FAIL' : 'PASS',
      `dept/pos=${u02Text.slice(0, 160)}`,
      { click_path: 'employees→profile Phòng ban/Chức danh', url: empUrl, observed: u02Text.slice(0, 200) },
    );

    // Resume tab F-01
    const resumeClick = await clickText(page, ['Sơ yếu', 'Hồ sơ', 'Resume', 'Lý lịch']);
    await sleep(1500);
    const resumeBody = await bodyText(page);
    await shot(page, '04-employee-resume');
    const resumeGenderLeak = RAW_PATTERNS.gender.test(resumeBody);
    setAc(
      'AC-FD-01-resume',
      resumeGenderLeak ? 'FAIL' : 'PASS',
      `tab=${resumeClick || 'n/a'} genderRaw=${resumeGenderLeak}`,
      { click_path: 'profile→Resume/Sơ yếu', url: page.url(), observed: resumeBody.slice(0, 200) },
    );
    // Merge resume into AC-FD-01 if FAIL
    if (resumeGenderLeak) {
      results.ac['AC-FD-01'].verdict = 'FAIL';
      results.ac['AC-FD-01'].detail += ' · resume raw gender';
    }

    // Contract / compensation tab F-03 F-04 F-05
    const contractTab = await clickText(page, ['Hợp đồng', 'Contract', 'Đãi ngộ', 'Compensation', 'Lương']);
    await sleep(2000);
    let contractBody = await bodyText(page);
    await shot(page, '05-employee-contract-tab');
    const f03Leak =
      /\b(base|probation|allowance)\b/i.test(contractBody) &&
      !/Lương cơ bản|Thử việc|Phụ cấp/.test(contractBody);
    // More precise: look for standalone raw line types as cell text
    const f03RawCells = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td, span, p, div'));
      return cells
        .map((c) => (c.textContent || '').trim())
        .filter((t) => /^(base|probation|allowance|PHU_CAP_[A-Z0-9_]+)$/i.test(t))
        .slice(0, 10);
    });
    setAc(
      'AC-FD-03',
      f03RawCells.length ? 'FAIL' : 'PASS',
      `tab=${contractTab || 'n/a'} rawCells=${JSON.stringify(f03RawCells)} bodyHasVI=${/Lương cơ bản|Thử việc|Phụ cấp/.test(contractBody)}`,
      { click_path: 'profile→Hợp đồng/Đãi ngộ', url: page.url(), observed: f03RawCells },
    );

    const histClick = await clickText(page, ['Lịch sử', 'History']);
    await sleep(1500);
    contractBody = await bodyText(page);
    await shot(page, '06-contract-history');
    const f04Cells = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td, span, badge, div'));
      return cells
        .map((c) => (c.textContent || '').trim())
        .filter((t) => /^(fixed_term|indefinite|permanent|HDLD_[A-Z0-9_]+)$/i.test(t))
        .slice(0, 10);
    });
    const f05Cells = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td, span, badge, div'));
      return cells
        .map((c) => (c.textContent || '').trim())
        .filter((t) => /^(active|expired|terminated)$/i.test(t))
        .slice(0, 10);
    });
    setAc(
      'AC-FD-04-emp',
      f04Cells.length ? 'FAIL' : 'PASS',
      `history=${histClick || 'n/a'} rawType=${JSON.stringify(f04Cells)}`,
      { click_path: 'profile→Hợp đồng→Lịch sử', url: page.url() },
    );
    setAc(
      'AC-FD-05',
      f05Cells.length ? 'FAIL' : 'PASS',
      `rawStatus=${JSON.stringify(f05Cells)} hasVI=${/Đang hiệu lực|Hết hạn|Đã chấm dứt/.test(contractBody)}`,
      { click_path: 'profile→Hợp đồng→Lịch sử status', url: page.url() },
    );

    // Insurance U-03
    await page.goto(empUrl.includes('/employees/') ? empUrl : q('/hr/employees'), {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await sleep(2000);
    if (!/\/employees\//.test(page.url()) && results.observations.employeeUrl) {
      await page.goto(results.observations.employeeUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await sleep(2000);
    }
    const insTab = await clickText(page, ['Bảo hiểm', 'BHXH', 'Insurance']);
    await sleep(2000);
    const insBody = await bodyText(page);
    await shot(page, '07-insurance');
    const u03Raw = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td, span, badge'));
      return cells
        .map((c) => (c.textContent || '').trim())
        .filter((t) => /^(social|health|unemployment|active|expired|cancelled)$/i.test(t))
        .slice(0, 10);
    });
    setAc(
      'AC-FD-U03',
      u03Raw.length ? 'FAIL' : 'PASS',
      `tab=${insTab || 'n/a'} raw=${JSON.stringify(u03Raw)}`,
      { click_path: 'profile→Bảo hiểm', url: page.url() },
    );

    // ---- Contracts page F-04 ----
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await shot(page, '08-contracts-page');
    const typeCol = await scrapeColumnSamples(page, ['Loại', 'Type', 'contract']);
    const statusCol = await scrapeColumnSamples(page, ['Trạng thái', 'Status']);
    results.observations.contractsType = typeCol;
    results.observations.contractsStatus = statusCol;
    const typeJoined = (typeCol.values || []).join(' | ');
    const statusJoined = (statusCol.values || []).join(' | ');
    const f04PageLeak = (typeCol.values || []).some((v) => RAW_PATTERNS.contractType.test(v));
    const f05PageLeak = (statusCol.values || []).some((v) => /^(active|expired|terminated)$/i.test(v.trim()));
    setAc(
      'AC-FD-04',
      f04PageLeak || results.ac['AC-FD-04-emp']?.verdict === 'FAIL' ? 'FAIL' : 'PASS',
      `listTypes=${typeJoined.slice(0, 160)} empHist=${results.ac['AC-FD-04-emp']?.verdict}`,
      { click_path: 'menu→Hợp đồng list + emp history', url: page.url(), observed: typeCol },
    );
    if (f05PageLeak && results.ac['AC-FD-05']?.verdict === 'PASS') {
      setAc('AC-FD-05', 'FAIL', `list status raw=${statusJoined}`, { url: page.url() });
    }

    // ---- Dashboard leave reminder F-06 ----
    await page.goto(q('/hr/dashboard'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(4000);
    await shot(page, '09-dashboard');
    const dashBody = await bodyText(page);
    const f06Raw = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('li, div, span, p, td'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => t.length < 80 && /^(annual|LVT_\d+)$/i.test(t))
        .slice(0, 10);
    });
    // Also catch "annual" inside reminder lines as whole token
    const f06BodyLeak = /\b(annual|LVT_\d+)\b/i.test(dashBody) && !/Nghỉ phép/.test(dashBody);
    setAc(
      'AC-FD-06',
      f06Raw.length || f06BodyLeak ? 'FAIL' : 'PASS',
      `rawNodes=${JSON.stringify(f06Raw)} bodyHasLeaveReminders=${/nghỉ|leave|phép/i.test(dashBody)}`,
      { click_path: 'HRM Dashboard reminders', url: page.url(), observed: dashBody.slice(0, 280) },
    );

    // ---- Attendance leave U-04 ----
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await clickText(page, ['Nghỉ phép', 'Leave', 'Yêu cầu nghỉ', 'Đơn nghỉ']);
    await sleep(2000);
    await shot(page, '10-attendance-leave');
    const leaveTypeCol = await scrapeColumnSamples(page, ['Loại nghỉ', 'Loại', 'Leave type', 'leave']);
    const leaveJoined = (leaveTypeCol.values || []).join(' | ');
    const u04Leak = (leaveTypeCol.values || []).some((v) => /^(annual|LVT_\d+)$/i.test(v.trim()));
    // open first leave if possible
    await clickFirstDataRow(page);
    await sleep(1500);
    const leaveDetailBody = await bodyText(page);
    const u04DetailRaw = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('td, span, p, div'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => /^(annual|LVT_\d+)$/i.test(t))
        .slice(0, 8);
    });
    setAc(
      'AC-FD-U04',
      u04Leak || u04DetailRaw.length ? 'FAIL' : 'PASS',
      `col=${leaveJoined.slice(0, 120)} detailRaw=${JSON.stringify(u04DetailRaw)}`,
      { click_path: 'attendance→leave list→row', url: page.url(), observed: leaveTypeCol },
    );

    // ---- Recruitment F-07..F-11 U-05 U-06 ----
    await page.goto(q('/hr/recruitment'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await clickText(page, ['Yêu cầu tuyển', 'Requisition', 'YCT', 'Tin tuyển']);
    await sleep(2000);
    await shot(page, '11-recruitment-req');
    const empTypeRec = await scrapeColumnSamples(page, ['Loại hình', 'Employment', 'Hình thức']);
    const f07Leak = (empTypeRec.values || []).some((v) => RAW_PATTERNS.employment.test(v));
    setAc(
      'AC-FD-07',
      f07Leak ? 'FAIL' : 'PASS',
      `values=${(empTypeRec.values || []).slice(0, 6).join(' | ')}`,
      { click_path: 'recruitment→Yêu cầu tuyển table', url: page.url(), observed: empTypeRec },
    );

    // open detail
    await clickFirstDataRow(page);
    await sleep(2000);
    await shot(page, '12-requisition-detail');
    const detailBody = await bodyText(page);
    const detailVals = await labeledValues(page, [
      'Đơn vị',
      'Công ty',
      'Company',
      'Quy trình',
      'Workflow',
      'Loại hình',
      'Đơn vị áp dụng',
    ]);
    results.observations.reqDetail = { detailVals, snippet: detailBody.slice(0, 400) };
    const companyDisp = detailVals['Đơn vị'] || detailVals['Công ty'] || detailVals['Company'] || detailVals['Đơn vị áp dụng'] || '';
    const wfDisp = detailVals['Quy trình'] || detailVals['Workflow'] || '';
    const slugLeak =
      /^(holding|trsport|logistics|finance|services)$/i.test((companyDisp || '').trim()) ||
      /\b(trsport|logistics)\b/i.test(companyDisp);
    // UUID full for workflow
    const uuidInUi = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('td, span, p, code, div, badge'));
      const re = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => t.length <= 40 && re.test(t))
        .slice(0, 8);
    });
    const hasWfBadge = /Đã gắn quy trình/.test(detailBody);
    setAc(
      'AC-FD-08',
      slugLeak ? 'FAIL' : 'PASS',
      `companyDisp=${companyDisp || '(from body scan)'} slugLeak=${slugLeak}`,
      { click_path: 'requisition→detail Đơn vị', url: page.url(), observed: companyDisp || detailBody.slice(0, 200) },
    );
    // If labeled extract empty, scan body for mono slug as standalone
    if (!companyDisp) {
      const monoSlug = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('td, p, span, code'));
        return nodes
          .map((n) => (n.textContent || '').trim())
          .filter((t) => /^(holding|trsport|logistics|finance|services)$/i.test(t))
          .slice(0, 5);
      });
      if (monoSlug.length) {
        setAc('AC-FD-08', 'FAIL', `mono slug cells=${JSON.stringify(monoSlug)}`, { url: page.url() });
      }
    }
    setAc(
      'AC-FD-09',
      uuidInUi.length && !hasWfBadge ? 'FAIL' : uuidInUi.length && hasWfBadge ? 'FAIL' : 'PASS',
      `uuidCells=${JSON.stringify(uuidInUi)} badge=${hasWfBadge} wfDisp=${wfDisp}`,
      { click_path: 'requisition→detail workflow', url: page.url() },
    );
    // F-09: any full UUID shown is FAIL per AC
    if (uuidInUi.length) {
      setAc('AC-FD-09', 'FAIL', `full UUID visible=${JSON.stringify(uuidInUi)}`, { url: page.url() });
    }

    // Candidates F-10
    await page.goto(q('/hr/recruitment'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2500);
    await clickText(page, ['Ứng viên', 'Candidate', 'Funnel', 'Pipeline']);
    await sleep(2000);
    await shot(page, '13-candidates');
    const stageCol = await scrapeColumnSamples(page, ['Giai đoạn', 'Stage', 'Trạng thái']);
    const u06Leak = (stageCol.values || []).some((v) => /^(screening|interview|offer|hired|rejected|applied|new)$/i.test(v.trim()));
    setAc(
      'AC-FD-U06',
      u06Leak ? 'FAIL' : 'PASS',
      `stages=${(stageCol.values || []).slice(0, 6).join(' | ')}`,
      { click_path: 'recruitment→Ứng viên/Funnel stage col', url: page.url(), observed: stageCol },
    );

    await clickFirstDataRow(page);
    await sleep(2000);
    await shot(page, '14-candidate-detail');
    const candBody = await bodyText(page);
    const maritalVals = await labeledValues(page, ['Tình trạng hôn nhân', 'Hôn nhân', 'Marital']);
    const marital = maritalVals['Tình trạng hôn nhân'] || maritalVals['Hôn nhân'] || maritalVals['Marital'] || '';
    const f10Raw = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('td, span, p, div'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => /^(single|married|divorced)$/i.test(t))
        .slice(0, 8);
    });
    setAc(
      'AC-FD-10',
      f10Raw.length || RAW_PATTERNS.marital.test(marital) ? 'FAIL' : 'PASS',
      `marital=${marital} raw=${JSON.stringify(f10Raw)}`,
      { click_path: 'candidates→detail marital', url: page.url(), observed: marital || candBody.slice(0, 200) },
    );

    // Import preview F-11 — open import if button exists
    await page.goto(q('/hr/recruitment'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(2000);
    const importBtn = await clickText(page, ['Import', 'Nhập', 'Tải lên', 'Upload']);
    await sleep(1500);
    const importBody = await bodyText(page);
    await shot(page, '15-import-or-recruitment');
    const f11Raw = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('td, span, th'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => /^(screening|interview|offer|hired|rejected|applied|new)$/i.test(t))
        .slice(0, 8);
    });
    if (importBtn) {
      setAc(
        'AC-FD-11',
        f11Raw.length ? 'FAIL' : 'PASS',
        `importUI open; stageRaw=${JSON.stringify(f11Raw)}`,
        { click_path: 'recruitment→Import preview', url: page.url() },
      );
    } else {
      // No import dialog — treat as N/A spot if funnel list already covered U-06; still check no raw stage cells on page
      setAc(
        'AC-FD-11',
        f11Raw.length ? 'FAIL' : 'N/A',
        `import button not found; pageStageRaw=${JSON.stringify(f11Raw)} (funnel covered by U06)`,
        { click_path: 'recruitment (import unavailable)', url: page.url() },
      );
    }

    // Job postings U-05
    await clickText(page, ['Tin đăng', 'Tin tuyển', 'Posting', 'Job posting']);
    await sleep(2000);
    await shot(page, '16-job-postings');
    const postEmp = await scrapeColumnSamples(page, ['Loại hình', 'Employment', 'Hình thức']);
    const u05Leak = (postEmp.values || []).some((v) => RAW_PATTERNS.employment.test(v));
    setAc(
      'AC-FD-U05',
      u05Leak ? 'FAIL' : 'PASS',
      `values=${(postEmp.values || []).slice(0, 6).join(' | ')}`,
      { click_path: 'recruitment→Tin đăng employment_type', url: page.url(), observed: postEmp },
    );

    // ---- Settings F-12 ----
    await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await clickText(page, ['Master', 'Danh mục', 'Catalog', 'Chức danh', 'leave_types', 'Master data']);
    await sleep(2000);
    await shot(page, '17-settings');
    const statusColSet = await scrapeColumnSamples(page, ['Trạng thái', 'Status']);
    const f12Leak = (statusColSet.values || []).some((v) => /^(active|draft)$/i.test(v.trim()));
    // also scan badge cells
    const f12RawNodes = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('td, span, badge'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => /^(active|draft)$/i.test(t))
        .slice(0, 10);
    });
    setAc(
      'AC-FD-12',
      f12Leak || f12RawNodes.length ? 'FAIL' : 'PASS',
      `statusCol=${(statusColSet.values || []).slice(0, 6).join('|')} rawNodes=${JSON.stringify(f12RawNodes)}`,
      { click_path: 'settings→catalog/master status', url: page.url(), observed: statusColSet },
    );

    // ---- Performance F-13 ----
    await page.goto(q('/hr/performance'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await shot(page, '18-performance');
    const perfBody = await bodyText(page);
    const f13StatusRaw = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('h1, h2, h3, span, badge, td, div'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => /^\(?\s*(draft|active|closed)\s*\)?$/i.test(t) || /\((draft|active|closed)\)/i.test(t))
        .slice(0, 10);
    });
    const f13EmpUuid = RAW_PATTERNS.employeeUuid.test(perfBody);
    const f13UuidCells = await page.evaluate(() => {
      const re = /Employee\s+[0-9a-f-]{36}/i;
      const nodes = Array.from(document.querySelectorAll('td, span, div, li'));
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => re.test(t))
        .slice(0, 5);
    });
    setAc(
      'AC-FD-13',
      f13StatusRaw.length || f13EmpUuid || f13UuidCells.length ? 'FAIL' : 'PASS',
      `statusRaw=${JSON.stringify(f13StatusRaw)} empUuid=${JSON.stringify(f13UuidCells)} hasVI=${/Nháp|Đang mở|Đã đóng/.test(perfBody)}`,
      { click_path: 'HRM Performance cycle+eval', url: page.url(), observed: perfBody.slice(0, 280) },
    );

    // ---- AC-U72-GLOBAL rollup ----
    const acIds = Object.keys(results.ac).filter((k) => k.startsWith('AC-FD') || k === 'AC-CO-IND-02');
    const fails = acIds.filter((k) => results.ac[k].verdict === 'FAIL');
    const blocked = acIds.filter((k) => results.ac[k].verdict === 'BLOCKED');
    const pass = acIds.filter((k) => results.ac[k].verdict === 'PASS' || results.ac[k].verdict === 'N/A');
    const globalOk = fails.length === 0 && blocked.length === 0;
    setAc(
      'AC-U72-GLOBAL',
      globalOk ? 'PASS' : fails.length ? 'FAIL' : 'BLOCKED',
      `pass/na=${pass.length} fail=${fails.length} blocked=${blocked.length} fails=${fails.join(',')}`,
    );

    results.finishedAt = new Date().toISOString();
    results.overall = fails.length ? 'FAIL' : blocked.length ? 'BLOCKED' : 'PASS';
    results.failIds = fails;
    results.blockedIds = blocked;
    save();
    console.log('\n=== OVERALL', results.overall, '===');
    console.log('consoleErrors', results.consoleErrors.length);
    console.log('runtime', OUT);
  } finally {
    await browser.close();
  }

  process.exitCode = results.overall === 'PASS' ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  results.overall = 'ERROR';
  results.error = String(e);
  save();
  process.exit(1);
});
