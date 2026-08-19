/**
 * QA-HRM-U72-FIELD-DISPLAY-02 — retest AC-FD-U02 after D-HRM-U72-LABEL-FE-02
 * U65 zero-seed · portal :5173 · ceo@xe.vn · browser-only
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
const EMP_ID = process.env.QA_EMP_ID || 'ff16d855-41e4-4390-8381-9ec56262848c';
const EMP_CODE = 'HLD-0996';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE = resolve(ROOT, 'docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-qa-hrm-u72-field-display-02-runtime.json');
const SHOT_DIR = resolve(EVIDENCE, 'screenshots/qa-hrm-u72-field-display-02');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-U72-FIELD-DISPLAY-02',
  startedAt: new Date().toISOString(),
  env: { PORTAL, XBOS_API, EMAIL, seed: false, EMP_ID, EMP_CODE },
  ac: {},
  observations: {},
  screenshots: [],
  consoleErrors: [],
  network: [],
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

async function shot(page, name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = resolve(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push(path);
  return path;
}

function visibleText(el) {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function isVisible(el) {
  const st = getComputedStyle(el);
  if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
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

async function scanProfile(page) {
  return page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const isVis = (el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const body = text(document.body);
    const visibleNodes = [...document.querySelectorAll('h1,h2,h3,span,div,p,td,li,button,badge')]
      .filter(isVis)
      .map((n) => text(n))
      .filter(Boolean);
    const visibleJoined = visibleNodes.join(' | ');
    const grab = (lab) => {
      const i = body.indexOf(lab);
      return i >= 0 ? body.slice(i, i + 100) : null;
    };
    // Header chip area near employee code / name
    const headerSlice = (() => {
      const i = body.indexOf('HLD-0996');
      return i >= 0 ? body.slice(Math.max(0, i - 80), i + 160) : body.slice(0, 400);
    })();
    const jobSlice = grab('Chức vụ') || grab('Chức');
    const hasJobKeyVisible = /\bLEGAL_SPECIALIST\b/.test(visibleJoined) || /\bLEGAL_SPECIALIST\b/.test(body);
    const hasJobKeyInBody = /\bLEGAL_SPECIALIST\b/.test(body);
    const hasViJob =
      /Chuyên viên Pháp chế|Pháp chế/.test(body) ||
      /Chuyên viên Pháp chế|Pháp chế/.test(visibleJoined);
    const chucVuValue = (() => {
      // Prefer labeled row: label then next sibling/value
      const labels = [...document.querySelectorAll('label,dt,span,div,p,td,th')].filter(isVis);
      for (const lab of labels) {
        const t = text(lab);
        if (t === 'Chức vụ' || /^Chức vụ$/.test(t)) {
          const row = lab.closest('div,tr,dl,li') || lab.parentElement;
          return text(row).slice(0, 120);
        }
      }
      return jobSlice;
    })();
    return {
      url: location.href,
      headerSlice,
      jobSlice,
      chucVuValue,
      hasJobKeyVisible,
      hasJobKeyInBody,
      hasViJob,
      hasEmpCode: /HLD-0996/.test(body),
      hasName: /Phạm Đức Hùng/.test(body),
      bodyHead: body.slice(0, 700),
    };
  });
}

async function main() {
  const { token, user } = await loginToken();
  results.observations.login = { ok: true, email: EMAIL };

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (e) => results.consoleErrors.push(String(e.message || e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/(employees|companies|contracts|attendance)/.test(u)) {
      results.network.push({ url: u.replace(PORTAL, ''), status: res.status(), ok: res.ok() });
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
    { token, expiresAt: Date.now() + 8e6, user },
  );

  // --- AC-FD-U02 profile ---
  const profileUrl = `${PORTAL}/hr/employees/${EMP_ID}?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(3500);
  // Profile header + «Chức vụ» live on «Thông tin chung» (not operations «Công việc» tasks tab)
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role=tab],button,a')].find(
      (x) => (x.textContent || '').trim() === 'Thông tin chung',
    );
    t?.click();
  });
  await sleep(1200);
  let profile = await scanProfile(page);
  results.observations.profile_before_f5 = profile;
  await shot(page, '01-profile-u02');

  const pageDead =
    !profile.url?.includes('/hr/') ||
    /chrome-error|HTTP ERROR|unable to handle/i.test(profile.bodyHead || '');
  if (pageDead) {
    setAc('AC-FD-U02', 'BLOCKED', `ENV portal/HRM proxy · url=${profile.url} · ${(profile.bodyHead || '').slice(0, 120)}`, {
      profile,
    });
  } else {
    const u02Pass =
      profile.hasEmpCode &&
      profile.hasName &&
      !profile.hasJobKeyVisible &&
      !profile.hasJobKeyInBody &&
      (profile.hasViJob || /Chức vụ\s*[—–-]/.test(profile.chucVuValue || profile.jobSlice || ''));

    setAc(
      'AC-FD-U02',
      u02Pass ? 'PASS' : 'FAIL',
      u02Pass
        ? `HLD-0996 header/Chức vụ VI or —; no LEGAL_SPECIALIST · vi=${profile.hasViJob} · chucVu=${(profile.chucVuValue || '').slice(0, 80)}`
        : `raw or missing · hasJobKey=${profile.hasJobKeyVisible}/${profile.hasJobKeyInBody} · vi=${profile.hasViJob} · job=${(profile.jobSlice || '').slice(0, 90)}`,
      { profile },
    );
  }

  // F5 keep labels — stay on Thông tin chung (do not open tasks «Công việc»)
  await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(3500);
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role=tab],button,a')].find(
      (x) => (x.textContent || '').trim() === 'Thông tin chung',
    );
    t?.click();
  });
  await sleep(1500);
  const afterF5 = await scanProfile(page);
  results.observations.profile_after_f5 = afterF5;
  await shot(page, '02-profile-u02-f5');
  const f5Dead =
    !afterF5.url?.includes('/hr/') || /chrome-error|HTTP ERROR/i.test(afterF5.bodyHead || '');
  const f5Pass =
    !f5Dead &&
    afterF5.hasEmpCode &&
    !afterF5.hasJobKeyVisible &&
    !afterF5.hasJobKeyInBody &&
    (afterF5.hasViJob || /Chức vụ\s*[—–-]/.test(afterF5.chucVuValue || afterF5.jobSlice || ''));
  setAc(
    'AC-FD-U02-F5',
    f5Dead ? 'BLOCKED' : f5Pass ? 'PASS' : 'FAIL',
    f5Dead
      ? `ENV after F5 · url=${afterF5.url}`
      : f5Pass
        ? `F5 keeps VI/—; no LEGAL_SPECIALIST · vi=${afterF5.hasViJob} · chucVu=${(afterF5.chucVuValue || '').slice(0, 80)}`
        : `F5 leak/missing · hasJobKey=${afterF5.hasJobKeyVisible} · job=${(afterF5.jobSlice || '').slice(0, 90)} · header=${(afterF5.headerSlice || '').slice(0, 100)}`,
    { afterF5 },
  );

  // Soft leave unknown → —
  await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'networkidle2',
    timeout: 90000,
  });
  await sleep(2500);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button,a,div,span')].find(
      (b) => (b.textContent || '').trim() === 'Nghỉ phép' && b.getBoundingClientRect().height > 0,
    );
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(2000);
  await page.evaluate(() => {
    const triggers = [...document.querySelectorAll('[role=tab]')];
    const t = triggers.find(
      (x) => /Danh sách|request/i.test(x.textContent || '') || x.getAttribute('value') === 'requests',
    );
    t?.click();
  });
  await sleep(2500);
  const leave = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const isVis = (el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const active = [...document.querySelectorAll('[role=tab][data-state=active]')].map((t) =>
      text(t),
    );
    const rawVisible = [...document.querySelectorAll('td,span,badge,div')]
      .filter(isVis)
      .map((n) => text(n))
      .filter((t) => /^(annual|sick|unpaid|LVT_\d+|UNKNOWN_LEAVE|leave_type)$/i.test(t))
      .slice(0, 20);
    const body = text(document.body);
    const sideSlice = (() => {
      const i = body.search(/Ốm|Phép năm|Nghỉ/);
      return i >= 0 ? body.slice(i, i + 120) : body.slice(0, 300);
    })();
    return {
      active,
      rawVisible,
      sideSlice,
      hasOm: /Ốm|Phép năm|Nghỉ ốm/.test(body),
      url: location.href,
    };
  });
  results.observations.leave = leave;
  await shot(page, '03-leave-soft');
  const leaveDead = !leave.url?.includes('/hr/') || /unable to handle|HTTP ERROR/i.test(leave.sideSlice || '');
  const leaveSoftPass = !leaveDead && leave.rawVisible.length === 0;
  setAc(
    'AC-U72-LEAVE-SOFT',
    leaveDead ? 'BLOCKED' : leaveSoftPass ? 'PASS' : 'FAIL',
    leaveDead
      ? `ENV · url=${leave.url}`
      : leaveSoftPass
        ? `No raw leave codes visible · viHint=${leave.hasOm} · active=${leave.active.join('|')}`
        : `rawVisible=${JSON.stringify(leave.rawVisible)}`,
    { leave },
  );

  // Spot AC-CO-IND-02
  await page.goto(`${PORTAL}/hr/company?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'networkidle2',
    timeout: 90000,
  });
  await sleep(3000);
  const industry = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const headers = [...document.querySelectorAll('table th')].map((th) => text(th));
    const indIdx = headers.findIndex((h) => /Ngành/i.test(h));
    const rows = [...document.querySelectorAll('table tbody tr')].slice(0, 8).map((tr) => {
      const cells = [...tr.querySelectorAll('td')].map((td) => text(td));
      return { cells, industry: indIdx >= 0 ? cells[indIdx] : null };
    });
    const industries = rows.map((r) => r.industry).filter((x) => x != null);
    const leak = industries.filter((v) => /^(holding|subsidiary|parent|member|branch)$/i.test(v));
    const body = text(document.body);
    const bodyLeak = /\b(holding|subsidiary)\b/i.test(body) && /Ngành nghề/.test(body)
      ? [...body.matchAll(/\b(holding|subsidiary)\b/gi)].map((m) => m[0]).slice(0, 10)
      : [];
    return { headers, industries, leak, bodyLeak: bodyLeak.slice(0, 5), rowCount: rows.length, url: location.href };
  });
  results.observations.industry = industry;
  await shot(page, '04-company-industry');
  const indPass = industry.leak.length === 0 && industry.rowCount > 0;
  setAc(
    'AC-CO-IND-02',
    indPass ? 'PASS' : industry.rowCount === 0 ? 'BLOCKED' : 'FAIL',
    indPass
      ? `industry cells=${JSON.stringify(industry.industries)} · no holding/subsidiary`
      : `leak=${JSON.stringify(industry.leak)} rows=${industry.rowCount}`,
    { industry },
  );

  // Spot AC-FD-04 contracts VI
  await page.goto(`${PORTAL}/hr/contracts?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'networkidle2',
    timeout: 90000,
  });
  await sleep(3500);
  const contracts = await page.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const isVis = (el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const headers = [...document.querySelectorAll('table th')].map((th) => text(th));
    const typeIdx = headers.findIndex((h) => /loại|hợp đồng/i.test(h) && !/tình trạng|status/i.test(h));
    const cells = [...document.querySelectorAll('table tbody td')]
      .filter(isVis)
      .map((td) => text(td))
      .slice(0, 80);
    const samples = [...document.querySelectorAll('table tbody tr')]
      .slice(0, 10)
      .map((tr) => [...tr.querySelectorAll('td')].map((td) => text(td)).slice(0, 6));
    const rawType = cells.filter((t) => /^(fixed_term|indefinite|permanent|HDLD_)/i.test(t));
    const viType = cells.filter((t) =>
      /Hợp đồng thử việc|Có thời hạn|Không thời hạn|Thử việc/.test(t),
    );
    return {
      headers,
      typeIdx,
      samples,
      rawType: rawType.slice(0, 10),
      viType: [...new Set(viType)].slice(0, 10),
      url: location.href,
    };
  });
  results.observations.contracts = contracts;
  await shot(page, '05-contracts');
  const fd04Pass = contracts.rawType.length === 0 && contracts.viType.length > 0;
  setAc(
    'AC-FD-04',
    fd04Pass ? 'PASS' : contracts.samples.length === 0 ? 'BLOCKED' : 'FAIL',
    fd04Pass
      ? `VI types=${JSON.stringify(contracts.viType)} · raw=0`
      : `raw=${JSON.stringify(contracts.rawType)} vi=${JSON.stringify(contracts.viType)}`,
    { contracts },
  );

  // GLOBAL driven by U02
  const u02Ok = results.ac['AC-FD-U02']?.verdict === 'PASS' && results.ac['AC-FD-U02-F5']?.verdict === 'PASS';
  setAc(
    'AC-U72-GLOBAL',
    u02Ok ? 'PASS' : 'FAIL',
    u02Ok ? 'U02 closed; no job_title_key leak on profile spot' : 'Blocked by AC-FD-U02 / F5',
  );

  const must = ['AC-FD-U02', 'AC-FD-U02-F5', 'AC-U72-GLOBAL', 'AC-CO-IND-02'];
  const hardFail = must.some((k) => results.ac[k]?.verdict === 'FAIL');
  const blocked = must.some((k) => results.ac[k]?.verdict === 'BLOCKED');
  results.overall = hardFail ? 'FAIL' : blocked ? 'BLOCKED' : 'PASS';
  results.finishedAt = new Date().toISOString();
  results.ack_status =
    results.overall === 'PASS' ? 'PASS_TO_PM' : results.overall === 'BLOCKED' ? 'FAIL_TO_PM' : 'FAIL_TO_PM';
  results.l0 = {
    note: 'HRM Vite :8080 required for /hr proxy; started if ECONNREFUSED',
  };
  save();
  console.log('\nOVERALL', results.overall, results.ack_status);
  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  results.overall = 'ERROR';
  results.error = String(err?.stack || err);
  results.ack_status = 'FAIL_TO_PM';
  save();
  console.error(err);
  process.exit(2);
});
