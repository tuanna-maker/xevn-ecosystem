/**
 * QA-U72-LEAVE-NOTE-HYGIENE-01 — assert leave lý do/ghi chú never shows raw `seed:…`
 * Local :5173 · ceo@xe.vn · U65 zero-seed · HOLD_DEPLOY · NOT Phase1/PROD/:8088
 * must_keep: C-U72-LEAVE-P3 (leave type VI / unknown→—) · no reopen soft CLOSED maps
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE = resolve(ROOT, 'docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-qa-u72-leave-note-hygiene-01-runtime.json');
const SHOT_DIR = resolve(EVIDENCE, 'screenshots/qa-u72-leave-note-hygiene-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-U72-LEAVE-NOTE-HYGIENE-01',
  startedAt: new Date().toISOString(),
  portal: PORTAL,
  account: EMAIL,
  seed: false,
  hold_deploy: true,
  not_phase1_prod_8088: true,
  checks: {},
  screenshots: [],
  leaveApi: null,
  overall: null,
};

function save() {
  mkdirSync(EVIDENCE, { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function setCheck(id, verdict, detail, extras = {}) {
  results.checks[id] = { verdict, detail, ...extras };
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

async function loginApi() {
  const r = await fetch(`${XBOS_API}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data.user ?? { userId: EMAIL, email: EMAIL, roles: ['group_ceo'] },
  };
}

async function fetchLeaveApi(token) {
  for (const path of [
    `${HRM_API}/api/hrm/attendance/leave-requests?company_id=main&page_size=50`,
    `${HRM_API}/api/hrm/leave-requests?company_id=main&page_size=50`,
  ]) {
    try {
      const r = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      // Nest leave list: { data: { total, data: [...] } }
      const nested = j?.data?.data;
      const items = Array.isArray(nested)
        ? nested
        : Array.isArray(j?.data?.items)
          ? j.data.items
          : Array.isArray(j?.data)
            ? j.data
            : Array.isArray(j?.items)
              ? j.items
              : [];
      const reasons = items
        .map((x) => x?.reason ?? x?.note ?? null)
        .filter((x) => x != null && String(x).trim());
      const seedReasons = reasons.filter((x) => String(x).trim().toLowerCase().startsWith('seed:'));
      const seedRow = items.find((x) => String(x?.reason || '').trim().toLowerCase().startsWith('seed:'));
      results.leaveApi = {
        path,
        status: r.status,
        total: j?.data?.total ?? items.length,
        count: items.length,
        reasonSamples: reasons.slice(0, 8),
        apiSeedReasonCount: seedReasons.length,
        apiSeedSamples: seedReasons.slice(0, 5),
        seedEmployeeName: seedRow?.employee_name || null,
        seedLeaveId: seedRow?.id || null,
      };
      if (r.ok) return;
    } catch (e) {
      results.leaveApi = { path, err: String(e) };
    }
  }
}

function scanLeaveSurfaceFn() {
  const isVisible = (el) => {
    const st = window.getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const body = (document.body?.innerText || '').replace(/\s+/g, ' ');

  // Visible text nodes / cells that look like leave reason with seed:
  const candidates = [...document.querySelectorAll('td, span, p, div, li, button, label')];
  const seedVisible = [];
  for (const el of candidates) {
    if (!isVisible(el)) continue;
    const t = text(el);
    if (!t || t.length > 240) continue;
    if (/^seed:/i.test(t) || /\bseed:[a-z0-9._:-]+/i.test(t)) {
      seedVisible.push({ t: t.slice(0, 120), tag: el.tagName });
    }
  }

  // Leave type raw codes (C-U72-LEAVE-P3 keep)
  const rawLeaveType = candidates
    .filter(isVisible)
    .map((n) => text(n))
    .filter((t) => /^(annual|sick|unpaid|LVT_\d+|UNKNOWN_LEAVE|leave_type)$/i.test(t));

  const tables = [...document.querySelectorAll('table')]
    .filter(isVisible)
    .map((table) => {
      const headers = [...table.querySelectorAll('th')].map((th) => text(th));
      const reasonIdx = headers.findIndex((h) => /lý do|ghi chú|reason|note/i.test(h));
      const typeIdx = headers.findIndex((h) => /loại nghỉ|^loại$|leave type/i.test(h));
      const rows = [...table.querySelectorAll('tbody tr')].slice(0, 15).map((tr) =>
        [...tr.querySelectorAll('td')].map((td) => text(td)).slice(0, 12),
      );
      return {
        headers,
        reasonIdx,
        typeIdx,
        reasonCells: reasonIdx >= 0 ? rows.map((r) => r[reasonIdx]).filter(Boolean) : [],
        typeCells: typeIdx >= 0 ? rows.map((r) => r[typeIdx]).filter(Boolean) : [],
        rowCount: rows.length,
        isLeaveRequestTable: reasonIdx >= 0 || headers.some((h) => /nhân viên|employees/i.test(h)),
      };
    })
    // Prefer leave request table over calendar grid
    .sort((a, b) => Number(b.isLeaveRequestTable) - Number(a.isLeaveRequestTable));

  const activeTab = [
    ...document.querySelectorAll('[role=tab][data-state=active], [data-state=active]'),
  ]
    .map((t) => text(t))
    .slice(0, 8);

  return {
    url: location.href,
    bodyHasSeed: /\bseed:/i.test(body),
    seedVisible: seedVisible.slice(0, 20),
    rawLeaveTypeVisible: rawLeaveType.slice(0, 20),
    hasViLeaveHint: /Ốm|Phép năm|Không lương|Nghỉ|—/.test(body),
    emDashPresent: body.includes('—'),
    tables,
    activeTab,
    bodySlice: body.slice(0, 400),
  };
}

async function clickExact(page, exact) {
  return page.evaluate((t) => {
    const el = [...document.querySelectorAll('button, a, [role="tab"], [role="button"], li, span')].find(
      (n) => (n.textContent || '').replace(/\s+/g, ' ').trim() === t,
    );
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, exact);
}

async function clickIncludes(page, partial) {
  return page.evaluate((t) => {
    const el = [...document.querySelectorAll('button, a, [role="tab"], [role="button"], li, span')].find(
      (n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        return txt.includes(t) && txt.length <= Math.max(t.length + 40, 100);
      },
    );
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, partial);
}

async function main() {
  const session = await loginApi();
  await fetchLeaveApi(session.token);
  save();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
  });

  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
    }
  }, session);

  // ---- Calendar / default leave surface ----
  await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'networkidle2',
    timeout: 90_000,
  });
  await sleep(3500);
  const clickedLeave = await clickExact(page, 'Nghỉ phép');
  if (!clickedLeave) await clickIncludes(page, 'Nghỉ phép');
  await sleep(3000);

  const calendarScan = await page.evaluate(scanLeaveSurfaceFn);
  await shot(page, '01-leave-calendar');
  const calSeedFail =
    calendarScan.bodyHasSeed || (calendarScan.seedVisible && calendarScan.seedVisible.length > 0);
  setCheck(
    'AC-LEAVE-NOTE-CALENDAR',
    calSeedFail ? 'FAIL' : 'PASS',
    calSeedFail
      ? `Visible seed on calendar: ${JSON.stringify(calendarScan.seedVisible.slice(0, 5))}`
      : `No visible seed: · tabs=${calendarScan.activeTab.join('|')}`,
    { click_path: '/hr/attendance → Nghỉ phép', scan: calendarScan, screenshot: '01-leave-calendar.png' },
  );

  // ---- List requests (TabsTrigger) — page.mouse.click required for Radix ----
  const listTabBox = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role="tab"]')].find((n) =>
      /^Danh sách yêu cầu/.test((n.textContent || '').replace(/\s+/g, ' ').trim()),
    );
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (listTabBox) await page.mouse.click(listTabBox.x, listTabBox.y);
  await sleep(3500);
  for (let i = 0; i < 8; i++) {
    const ready = await page.evaluate(() => {
      const headers = [...document.querySelectorAll('table thead th')].map((th) =>
        (th.textContent || '').trim(),
      );
      return headers.some((h) => /lý do|ghi chú|reason/i.test(h));
    });
    if (ready) break;
    if (listTabBox && i === 2) await page.mouse.click(listTabBox.x, listTabBox.y);
    await sleep(700);
  }
  const listScan = await page.evaluate(scanLeaveSurfaceFn);
  await shot(page, '02-leave-list');
  const listSeedFail = listScan.bodyHasSeed || (listScan.seedVisible && listScan.seedVisible.length > 0);
  const reasonTables = (listScan.tables || []).filter((t) => t.reasonIdx >= 0);
  const reasonCells = reasonTables.flatMap((t) => t.reasonCells || []);
  const reasonHasSeed = reasonCells.some((c) => /seed:/i.test(c));
  const listOnRequests = reasonCells.length > 0 || reasonTables.length > 0;
  let listVerdict = 'PASS';
  let listDetail = '';
  if (listSeedFail || reasonHasSeed) {
    listVerdict = 'FAIL';
    listDetail = `Visible seed on list: seedVisible=${JSON.stringify(listScan.seedVisible.slice(0, 5))} reasons=${JSON.stringify(reasonCells.slice(0, 8))}`;
  } else if (!listOnRequests) {
    listVerdict = 'BLOCKED';
    listDetail = `List tab not reached · box=${JSON.stringify(listTabBox)}`;
  } else {
    const dashCount = reasonCells.filter((c) => c === '—' || c === '-' || c === '–').length;
    listDetail = `No visible seed: · reasonSample=${JSON.stringify(reasonCells.slice(0, 12))} · dash=${dashCount}/${reasonCells.length}`;
  }
  setCheck('AC-LEAVE-NOTE-LIST', listVerdict, listDetail, {
    click_path: 'Nghỉ phép → Danh sách yêu cầu',
    scan: listScan,
    reasonCells,
    listTabBox,
    screenshot: '02-leave-list.png',
  });

  // Pending surface
  const pendingBox = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role="tab"]')].find((n) =>
      /^Chờ duyệt/.test((n.textContent || '').replace(/\s+/g, ' ').trim()),
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (pendingBox) {
    await page.mouse.click(pendingBox.x, pendingBox.y);
    await sleep(2500);
  }
  const pendingScan = await page.evaluate(scanLeaveSurfaceFn);
  await shot(page, '04-leave-pending');
  const pendingSeed =
    pendingScan.bodyHasSeed || (pendingScan.seedVisible && pendingScan.seedVisible.length > 0);
  setCheck(
    'AC-LEAVE-NOTE-PENDING',
    pendingSeed ? 'FAIL' : 'PASS',
    pendingSeed
      ? `Visible seed on pending: ${JSON.stringify(pendingScan.seedVisible.slice(0, 5))}`
      : `No visible seed: on Chờ duyệt · emDash=${pendingScan.emDashPresent}`,
    { scan: pendingScan, screenshot: '04-leave-pending.png' },
  );

  // Back to list for detail open
  if (listTabBox) {
    await page.mouse.click(listTabBox.x, listTabBox.y);
    await sleep(2000);
  }

  // ---- Detail: open action on a seed-reason employee row when possible ----
  const seedName = results.leaveApi?.seedEmployeeName;
  await page.evaluate((name) => {
    const rows = [...document.querySelectorAll('table.saas-table tbody tr, table tbody tr')].filter(
      (tr) => tr.querySelectorAll('td').length >= 5,
    );
    let target = rows[0];
    if (name) {
      const hit = rows.find((tr) => (tr.textContent || '').includes(name));
      if (hit) target = hit;
    }
    const btn = target?.querySelector('button, a, [role="button"]');
    if (btn) btn.click();
    else target?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, seedName);
  await sleep(2000);
  await clickIncludes(page, 'Chi tiết');
  await clickIncludes(page, 'Xem');
  await sleep(1500);
  const detailScan = await page.evaluate(scanLeaveSurfaceFn);
  await shot(page, '03-leave-detail');
  const detailSeedFail =
    detailScan.bodyHasSeed || (detailScan.seedVisible && detailScan.seedVisible.length > 0);
  setCheck(
    'AC-LEAVE-NOTE-DETAIL',
    detailSeedFail ? 'FAIL' : 'PASS',
    detailSeedFail
      ? `Visible seed on detail: ${JSON.stringify(detailScan.seedVisible.slice(0, 5))}`
      : `No visible seed: on detail · seedName=${seedName || 'n/a'} · emDash=${detailScan.emDashPresent}`,
    {
      click_path: 'leave list → row / Chi tiết',
      scan: detailScan,
      screenshot: '03-leave-detail.png',
    },
  );

  // ---- C-U72-LEAVE-P3 keep: no raw leave type codes ----
  const typeHits = [
    ...(calendarScan.rawLeaveTypeVisible || []),
    ...(listScan.rawLeaveTypeVisible || []),
    ...(detailScan.rawLeaveTypeVisible || []),
  ];
  const typeCells = (listScan.tables || []).flatMap((t) => t.typeCells || []);
  const typeRaw = typeCells.some((c) => /^(annual|sick|unpaid|LVT_\d+)$/i.test(String(c).trim()));
  const p3Pass = typeHits.length === 0 && !typeRaw;
  setCheck(
    'AC-LEAVE-P3-KEPT',
    p3Pass ? 'PASS' : 'FAIL',
    p3Pass
      ? `Leave type VI/— kept · typeCells=${JSON.stringify(typeCells.slice(0, 6))} · hasVi=${calendarScan.hasViLeaveHint || listScan.hasViLeaveHint}`
      : `Raw leave type visible: hits=${JSON.stringify(typeHits)} cells=${JSON.stringify(typeCells)}`,
    { typeCells, typeHits },
  );

  // API may still have seed reasons — hygiene is display-only; note for evidence
  const apiHasSeed = (results.leaveApi?.apiSeedReasonCount || 0) > 0;
  setCheck(
    'OBS-API-SEED-RESIDUE',
    'PASS',
    apiHasSeed
      ? `API still has ${results.leaveApi.apiSeedReasonCount} seed reason(s) (ENV residue OK) — FE must mask → —`
      : 'API leave reasons have no seed: prefix in sample page',
    { leaveApi: results.leaveApi },
  );

  // Corroborate: when API has seed residue, calendar+list must not show raw seed:
  if (apiHasSeed) {
    const calOk = results.checks['AC-LEAVE-NOTE-CALENDAR']?.verdict === 'PASS';
    const listOk = results.checks['AC-LEAVE-NOTE-LIST']?.verdict === 'PASS';
    const pendingOk = results.checks['AC-LEAVE-NOTE-PENDING']?.verdict !== 'FAIL';
    const maskOk =
      calOk &&
      listOk &&
      pendingOk &&
      !calendarScan.bodyHasSeed &&
      !listScan.bodyHasSeed &&
      !(pendingScan.bodyHasSeed);
    setCheck(
      'AC-LEAVE-NOTE-SEED-MASKED',
      maskOk ? 'PASS' : 'FAIL',
      maskOk
        ? `API seed residue=${results.leaveApi.apiSeedReasonCount} masked on UI (no visible seed:)`
        : 'API has seed reasons but UI still leaks or list not verified',
      { apiSeedSamples: results.leaveApi.apiSeedSamples },
    );
  }

  results.consoleErrors = consoleErrors.slice(0, 10);
  results.finishedAt = new Date().toISOString();

  const hardIds = [
    'AC-LEAVE-NOTE-CALENDAR',
    'AC-LEAVE-NOTE-LIST',
    'AC-LEAVE-NOTE-PENDING',
    'AC-LEAVE-NOTE-DETAIL',
    'AC-LEAVE-P3-KEPT',
    'AC-LEAVE-NOTE-SEED-MASKED',
  ].filter((id) => results.checks[id]);
  const fails = hardIds.filter((id) => results.checks[id]?.verdict === 'FAIL');
  const blocked = hardIds.filter((id) => results.checks[id]?.verdict === 'BLOCKED');
  results.overall = fails.length ? 'FAIL' : blocked.length ? 'BLOCKED' : 'PASS';
  save();

  console.log(`\noverall=${results.overall} fails=${fails.join(',') || 'none'} blocked=${blocked.join(',') || 'none'}`);
  console.log(`runtime=${OUT}`);
  await browser.close();
  process.exit(fails.length ? 1 : blocked.length ? 3 : 0);
}

main().catch((e) => {
  console.error(e);
  results.overall = 'ERROR';
  results.error = String(e);
  save();
  process.exit(2);
});
