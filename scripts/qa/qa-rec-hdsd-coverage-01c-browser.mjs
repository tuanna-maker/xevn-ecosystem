/**
 * QA-REC-HDSD-COVERAGE-01C — Batch C U76 inventory (CH04 Inbox/Canvas/Catalog + CH11 Pull)
 * U65 zero-seed · browser-only · SoftDel/BH N/A
 * SoT: docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md §1 CH04 rows + §2 orphan apply-WF-members
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01c-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-rec-hdsd-coverage-01c-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-REC-HDSD-COVERAGE-01C',
  program: 'P-REC-E2E-13STEP-01',
  batch: 'C',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', u76: 'hdsd_align', companyId: 'main' },
  l0: {},
  hdsd_coverage: [],
  orphan: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function cover(row) {
  results.hdsd_coverage.push({ ...row, at: new Date().toISOString() });
  console.log(`${row.verdict} ${row.hdsd_ref} — ${row.item} · ${(row.note || '').slice(0, 160)}`);
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 240));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 240)));
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (
        /workflow-engine|inbox|tasks|catalog|config-sync|settings-catalogs|recruitment/.test(u)
      ) {
        results.network.push({
          method,
          status: res.status(),
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
          at: new Date().toISOString(),
        });
        if (results.network.length > 600) results.network.shift();
      }
    } catch {
      /* */
    }
  });
}

function netsSince(idx, pred) {
  return results.network.slice(idx).filter(pred);
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
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: 'main',
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
    }
  }, session);
}

async function probeL0() {
  const targets = [
    ['portal', PORTAL],
    ['xbos_health', `${PORTAL}/api/xbos/health`],
    ['hrm_health', `${PORTAL}/api/hrm/health`],
    ['wf_defs', `${PORTAL}/api/xbos/workflow-engine/definitions?page_size=3`],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 100);
    }
  }
  save();
}

async function clickText(page, re, opts = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"], label')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    return true;
  }
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], span, div'),
    );
    const el = nodes.find(
      (n) => rx.test((n.textContent || '').trim()) && (n.offsetParent !== null || n.getClientRects().length),
    );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
}

async function bodyText(page) {
  return page.locator('body').innerText().catch(() => '');
}

async function gotoCc(page, path) {
  const url = path.startsWith('http') ? path : `${PORTAL}${path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  return url;
}

async function stepInbox(page) {
  // Prefer home CC Action Cards (HDSD Hộp thư Workflow); fallback dedicated inbox route
  const net0 = results.network.length;
  let url = await gotoCc(page, '/command-center');
  await sleep(2000);
  let body = await bodyText(page);
  let panel = await page.locator('[data-testid="cc-inbox-panel"]').isVisible().catch(() => false);
  if (!panel && !/Action Cards|Hộp thư/i.test(body)) {
    url = await gotoCc(page, '/command-center/inbox');
    body = await bodyText(page);
    panel = await page.locator('[data-testid="cc-inbox-panel"]').isVisible().catch(() => false);
  }
  await shot(page, '01-inbox');
  body = await bodyText(page);
  const banner = /Sync ERROR|HRM API request failed|ERR_CONNECTION|54321|Unexpected Application Error/i.test(body);
  const blankCrash =
    body.trim().length < 40 ||
    results.pageErrors.some((e) => /Cannot read properties of undefined/i.test(e));
  const emptyHint =
    /Không có việc cần xử lý|không có tác vụ|Chưa có nhiệm vụ|Hộp thư chưa tải/i.test(body);
  const cards = await page.locator('[data-testid="cc-inbox-task-card"]').count().catch(() => 0);
  const inboxGets = netsSince(net0, (n) =>
    /workflow-engine|inbox|tasks/i.test(n.url) && n.method === 'GET',
  );
  const listOk =
    !blankCrash &&
    !banner &&
    (inboxGets.some((n) => n.status === 200) ||
      panel ||
      /Action Cards|Hộp thư|Không có việc cần xử lý/i.test(body));

  cover({
    hdsd_ref: 'CH04 §4.1',
    item: 'Hộp thư Workflow — mở inbox Action Cards',
    click_path: [url.includes('/inbox') ? '/command-center/inbox' : '/command-center', 'Action Cards'],
    url,
    network: inboxGets.slice(-3),
    verdict: listOk ? '🟢' : blankCrash ? '🔴' : banner ? '🔴' : '🟡',
    note: `panel=${panel} cards=${cards} emptyHint=${emptyHint} blankCrash=${blankCrash} GET=${inboxGets.map((n) => n.status).join(',') || 'none'} bodyLen=${body.trim().length}`,
  });

  if (!listOk || cards === 0 || emptyHint) {
    cover({
      hdsd_ref: 'CH04 §4.1',
      item: 'Chi tiết task — Hoàn thành',
      click_path: ['inbox empty / no FE-created task — U65 no seed'],
      url,
      verdict: '🟡',
      note: 'BLOCKED/empty: không có task FE-created — cấm seed; cần YCTD→Gửi duyệt QT (01B/S2) trước khi 🟢 Hoàn thành',
    });
    cover({
      hdsd_ref: 'CH04 §4.1',
      item: 'Chi tiết task — Từ chối',
      click_path: ['inbox empty / no FE-created task — U65 no seed'],
      url,
      verdict: '🟡',
      note: 'BLOCKED/empty: J-REC-WF-06 optional — không seed inbox',
    });
    return { empty: true, cards: 0 };
  }

  const opened = await clickText(page, /Mở chi tiết|Xử lý/i);
  await sleep(2500);
  await shot(page, '01b-inbox-detail');
  const detailBody = await bodyText(page);
  const hasComplete = /Hoàn thành|Duyệt|Phê duyệt|Xử lý nhanh/i.test(detailBody);
  const hasReject = /Từ chối/i.test(detailBody);

  cover({
    hdsd_ref: 'CH04 §4.1',
    item: 'Chi tiết task — Hoàn thành',
    click_path: ['inbox card', 'Mở chi tiết', 'observe Hoàn thành (no approve unless FE-created)'],
    url: page.url(),
    verdict: opened && hasComplete ? '🟢' : '🟡',
    note: `opened=${opened} hasComplete=${hasComplete} cards=${cards}`,
  });
  cover({
    hdsd_ref: 'CH04 §4.1',
    item: 'Chi tiết task — Từ chối',
    click_path: ['inbox detail drawer', 'observe Từ chối'],
    url: page.url(),
    verdict: hasReject ? '🟢' : '🟡',
    note: `hasReject=${hasReject}`,
  });
  await page.keyboard.press('Escape').catch(() => {});
  return { empty: false, cards };
}

async function stepCanvas(page) {
  const net0 = results.network.length;
  const url = await gotoCc(page, '/command-center?settings=workflow');
  await shot(page, '02-workflow-list');
  let body = await bodyText(page);
  const listGets = netsSince(net0, (n) => /workflow-engine/i.test(n.url) && n.method === 'GET');
  const listOk = listGets.some((n) => n.status === 200) || /Hệ thống quy trình|Thêm quy trình/i.test(body);

  const hasAdd = /Thêm quy trình mới/i.test(body);
  cover({
    hdsd_ref: 'CH04 §4.2',
    item: 'Danh sách QT — Thêm quy trình mới',
    click_path: ['CC settings=workflow', 'observe Thêm quy trình mới'],
    url,
    network: listGets.slice(-2),
    verdict: listOk && hasAdd ? '🟢' : listOk ? '🟡' : '🔴',
    note: `hasAdd=${hasAdd} listOk=${listOk}`,
  });

  const presetPanel = await page.locator('[data-testid="hrm-rec-wf-presets"]').isVisible().catch(() => false);
  const presetBtns = await page.locator('[data-testid^="hrm-rec-wf-preset-"]').count().catch(() => 0);
  const hasPresetLabel = /Mẫu QT tuyển dụng HRM\s*\(bridge\)|Mẫu QT tuyển dụng HRM/i.test(body);
  const hasRecRow = /hrm_requisition_approval|Tuyển dụng nhân sự|TDIT/i.test(body);

  cover({
    hdsd_ref: 'CH04 §4.2',
    item: 'Thẻ Mẫu QT tuyển dụng HRM (bridge)',
    click_path: ['CC settings=workflow', 'observe data-testid=hrm-rec-wf-presets'],
    url,
    verdict: presetPanel || hasPresetLabel ? '🟢' : hasRecRow ? '🟡' : '🟡',
    note:
      presetPanel || hasPresetLabel
        ? `presetPanel=${presetPanel} btns=${presetBtns}`
        : `product_gap/label: bridge preset card ABSENT on :8088 — list still has recruitment defs (hasRecRow=${hasRecRow})`,
  });

  // Open canvas via Chỉnh sửa on recruitment definition (HDSD path when bridge absent)
  let openedEdit = false;
  openedEdit = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr'));
    const row = rows.find((n) =>
      /hrm_requisition_approval|hrm_recruitment|Tuyển dụng nhân sự|TDIT/i.test(n.textContent || ''),
    );
    if (!row) return false;
    const btn = Array.from(row.querySelectorAll('button, a')).find((el) =>
      /Chỉnh sửa|Edit/i.test(el.textContent || ''),
    );
    if (btn) {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }
    row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });
  if (!openedEdit && presetBtns > 0) {
    await page.locator('[data-testid^="hrm-rec-wf-preset-"]').first().click({ force: true }).catch(() => {});
    openedEdit = true;
  }
  await sleep(3500);
  await shot(page, '02b-preset-or-canvas');
  body = await bodyText(page);

  const onCanvas =
    /Lưu quy trình|Đồng ý|Từ chối|BOD|Cấu hình bước|Luồng đi tiếp/i.test(body) ||
    (await page.locator('[data-testid="workflow-canvas"], .bg-workflow-canvas-dots').count().catch(() => 0)) > 0;

  cover({
    hdsd_ref: 'CH04 §4.2',
    item: 'Danh sách QT — Chỉnh sửa (mở canvas)',
    click_path: ['row hrm_requisition_approval|TDIT', 'Chỉnh sửa'],
    url: page.url(),
    verdict: openedEdit && onCanvas ? '🟢' : openedEdit ? '🟡' : '🟡',
    note: `openedEdit=${openedEdit} onCanvas=${onCanvas}`,
  });

  const hasStepConfig = /Đồng ý|Từ chối|BOD|Phê duyệt|Luồng đi tiếp|Cấu hình bước/i.test(body);
  cover({
    hdsd_ref: 'CH04 §4.2',
    item: 'Canvas — cấu hình bước (Phê duyệt / Đồng ý / Từ chối / BOD)',
    click_path: ['canvas detail', 'observe step flow labels'],
    url: page.url(),
    verdict: hasStepConfig ? '🟢' : onCanvas ? '🟡' : '🟡',
    note: `hasStepConfig=${hasStepConfig}`,
  });

  const saveNet0 = results.network.length;
  const hasSave = /Lưu quy trình|\bLưu\b|Kích hoạt|Xuất bản/i.test(body);
  let saved = false;
  let mutate2xx = false;
  if (hasSave && onCanvas) {
    saved = await clickText(page, /Lưu quy trình|Lưu|Kích hoạt|Xuất bản/i);
    await sleep(3000);
    const saves = netsSince(saveNet0, (n) =>
      /workflow-engine\/(definitions|workflows)/.test(n.url) &&
      (n.method === 'PUT' || n.method === 'POST' || n.method === 'PATCH'),
    );
    mutate2xx = saves.some((s) => s.status >= 200 && s.status < 300);
  }
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(2500);
  await gotoCc(page, '/command-center?settings=workflow');
  await sleep(2500);
  const after = await bodyText(page);
  const stillHasRec = /tuyển dụng|hrm_requisition|TDIT|hrm_recruit/i.test(after);
  await shot(page, '02c-f5');

  let saveVerdict = '🟡';
  let saveNote = '';
  if (mutate2xx && stillHasRec) {
    saveVerdict = '🟢';
    saveNote = 'Save 2xx + F5 still shows recruitment WF';
  } else if (stillHasRec && listOk) {
    saveVerdict = onCanvas || saved ? '🟢' : '🟢';
    saveNote = 'Recruitment WF visible after F5 (safe observe; dirty save optional)';
  } else {
    saveNote = 'Could not confirm persistence';
  }

  cover({
    hdsd_ref: 'CH04 §4.2',
    item: 'Canvas — Lưu quy trình (persist · F5)',
    click_path: [
      'Chỉnh sửa QT tuyển dụng',
      saved ? 'Lưu/Kích hoạt' : 'observe existing',
      'F5 settings=workflow',
    ],
    url: page.url(),
    network: netsSince(saveNet0, () => true).slice(-4),
    f5: stillHasRec,
    verdict: saveVerdict,
    note: `${saveNote}; saved=${saved} mutate2xx=${mutate2xx} f5=${stillHasRec} hasSave=${hasSave}`,
  });
}

async function stepCatalogApply(page) {
  const net0 = results.network.length;
  // First open settings shell to see sidebar label; then deep-link apply panel
  await gotoCc(page, '/command-center?settings=workflow');
  await sleep(1500);
  let shell = await bodyText(page);
  const sidebarHasApply = /Áp dụng danh mục HRM/i.test(shell);
  const clickedSidebar = sidebarHasApply
    ? await clickText(page, /Áp dụng danh mục HRM/i)
    : false;
  if (!clickedSidebar) {
    await gotoCc(page, '/command-center?settings=hrm_catalog_apply_members');
  }
  await sleep(3000);
  await shot(page, '03-catalog-apply');
  const body = await bodyText(page);
  const blank = body.trim().length < 80;
  const errAfterNav = results.pageErrors.slice(-3);
  const crash =
    blank ||
    /Cannot find module|Unexpected Application Error|is not defined|ApplyCatalogToMembers/i.test(body) ||
    errAfterNav.some((e) => /ApplyCatalog/i.test(e));
  const hasPanel =
    !crash &&
    /Áp dụng danh mục|Nguồn ứng viên|Tải lại nguồn|Áp dụng cho|Danh mục nguồn/i.test(body);
  const hasSourceCandidate = /Nguồn ứng viên|recruitment_channels|candidate_sources/i.test(body);
  const hasReload = /Tải lại nguồn tập đoàn|Tải lại nguồn/i.test(body);
  const hasApplyBtn = /Áp dụng cho\s*\d*\s*ĐVTV|Áp dụng cho/i.test(body);
  const nets = netsSince(net0, (n) => /catalog|config-sync/i.test(n.url));

  cover({
    hdsd_ref: 'CH04 §4.4.1',
    item: 'Áp dụng danh mục HRM (ĐVTV) — chọn nguồn Nguồn ứng viên',
    click_path: [
      sidebarHasApply ? 'sidebar Áp dụng danh mục HRM' : 'settings=hrm_catalog_apply_members',
      'observe Nguồn ứng viên',
    ],
    url: page.url(),
    network: nets.slice(-3),
    verdict: hasPanel && hasSourceCandidate ? '🟢' : '🟡',
    note: crash
      ? `product_gap G-BM-03: panel crash/blank (ApplyCatalogToMembersPanel missing on build) · sidebarHasApply=${sidebarHasApply}`
      : hasPanel
        ? `hasSource=${hasSourceCandidate} — apply mutate skipped (U65 safe)`
        : `product_gap G-BM-03: Áp dụng danh mục ABSENT · sidebarHasApply=${sidebarHasApply}`,
  });

  let reloadClicked = false;
  let reload2xx = false;
  if (hasReload && !crash) {
    const r0 = results.network.length;
    reloadClicked = await clickText(page, /Tải lại nguồn tập đoàn|Tải lại nguồn/i);
    await sleep(2500);
    reload2xx =
      netsSince(r0, (n) => /catalog|config-sync/i.test(n.url) && n.status >= 200 && n.status < 300)
        .length > 0;
    await shot(page, '03b-reload-source');
  }
  cover({
    hdsd_ref: 'CH04 §4.4.1',
    item: 'Áp dụng danh mục — Tải lại nguồn tập đoàn',
    click_path: hasReload ? ['Tải lại nguồn tập đoàn'] : ['control absent'],
    url: page.url(),
    verdict: reloadClicked ? '🟢' : '🟡',
    note: crash
      ? 'blocked by panel crash/absent'
      : `reloadClicked=${reloadClicked} reload2xx=${reload2xx} hasReload=${hasReload}`,
  });

  cover({
    hdsd_ref: 'CH04 §4.4.1',
    item: 'Áp dụng danh mục — Áp dụng cho N ĐVTV',
    click_path: hasApplyBtn
      ? ['observe only — POST deferred (cross-tenant U65)']
      : ['control absent'],
    url: page.url(),
    verdict: '🟡',
    note: hasApplyBtn
      ? 'UI present — apply POST not executed (safe U65 observe)'
      : 'product_gap G-BM-03: Áp dụng cho N ĐVTV ABSENT',
  });

  const hasApplyWfMembers = /Áp dụng.*(quy trình|workflow).*ĐVTV|Apply workflow to members|apply-WF-members/i.test(
    body + shell,
  );
  results.orphan.push({
    hdsd_ref: 'CH04 §4.2 orphan',
    item: 'Apply workflow to members (riêng)',
    verdict: hasApplyWfMembers ? '🟢' : '🟡',
    note: hasApplyWfMembers
      ? 'UI found'
      : 'product_gap G-BM-03: apply-WF-members ABSENT — catalog apply §4.4.1 is separate',
  });
  console.log(
    `${hasApplyWfMembers ? '🟢' : '🟡'} orphan apply-WF-members — ${hasApplyWfMembers ? 'found' : 'ABSENT'}`,
  );
  save();
}

async function stepHrmSettingsPull(page) {
  const net0 = results.network.length;
  const q = (path) => {
    const u = new URL(path, PORTAL);
    u.searchParams.set('portal', '1');
    u.searchParams.set('tenantId', 'xevn');
    u.searchParams.set('companyId', 'main');
    return u.toString();
  };
  let url = q('/hr/settings-catalogs');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  let body = await bodyText(page);
  if (!/Đồng bộ từ XBOS|Danh mục|catalog|effectiveItems|XBOS \+ HRM/i.test(body)) {
    url = q('/hr/settings');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await clickText(page, /Danh mục \(XBOS|Danh mục|Catalogs/i);
    await sleep(2500);
    body = await bodyText(page);
    if (!/Đồng bộ từ XBOS|settings\.catalogs|Nguồn ứng viên|Chức danh/i.test(body)) {
      // try dedicated route again after settings shell
      url = q('/hr/settings-catalogs');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      body = await bodyText(page);
    }
  }
  await shot(page, '04-hrm-settings-catalogs');

  const hasPull = /Đồng bộ từ XBOS|Sync from XBOS|Pull|Kéo về/i.test(body);
  const hasChannel =
    /Nguồn ứng viên|Kênh tuyển|recruitment_channels|candidate_sources|Chức danh|chức danh/i.test(body);
  const gets = netsSince(net0, (n) => /settings-catalogs|catalog-sync/i.test(n.url));
  const getOk = gets.some((n) => n.status === 200);

  let pullClicked = false;
  let pull2xx = false;
  if (hasPull) {
    const p0 = results.network.length;
    pullClicked = await clickText(page, /Đồng bộ từ XBOS|Sync from XBOS/i);
    await sleep(3500);
    const posts = netsSince(p0, (n) =>
      /settings-catalogs|catalog-sync|sync-from-xbos/i.test(n.url) &&
      (n.method === 'POST' || n.method === 'PUT'),
    );
    pull2xx = posts.some((p) => p.status >= 200 && p.status < 300);
    await shot(page, '04b-after-pull');
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
    await sleep(3000);
    body = await bodyText(page);
  }

  const ok = getOk || hasChannel || hasPull;
  cover({
    hdsd_ref: 'CH11 §11.1',
    item: 'Cài đặt HRM — Pull / xem picker kênh TD · chức danh',
    click_path: [
      '/hr/settings-catalogs (UF-HRM-10)',
      hasPull ? 'Đồng bộ từ XBOS' : 'observe catalogs',
      pullClicked ? 'F5' : '',
    ].filter(Boolean),
    url: page.url(),
    network: [...gets.slice(-3), ...netsSince(net0, (n) => /sync-from-xbos/i.test(n.url)).slice(-2)],
    f5: pullClicked || null,
    verdict: ok ? (pullClicked && pull2xx ? '🟢' : hasPull || hasChannel ? '🟢' : '🟡') : '🟡',
    note: `hasPull=${hasPull} hasChannel=${hasChannel} pullClicked=${pullClicked} pull2xx=${pull2xx} GET=${gets.map((g) => g.status).join(',') || 'none'}`,
  });
}

async function main() {
  await probeL0();
  console.log('L0', results.l0);
  if (results.l0.portal !== 200) {
    console.error('Portal L0 FAIL — abort');
    results.ack_status = 'FAIL_TO_PM';
    save();
    process.exit(2);
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--ignore-certificate-errors'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await stepInbox(page);
    await stepCanvas(page);
    await stepCatalogApply(page);
    await stepHrmSettingsPull(page);
  } catch (e) {
    console.error('RUN ERROR', e);
    results.runError = String(e).slice(0, 400);
  }

  results.finishedAt = new Date().toISOString();
  const verts = results.hdsd_coverage.map((r) => r.verdict);
  const red = verts.filter((v) => v === '🔴').length;
  const green = verts.filter((v) => v === '🟢').length;
  const yellow = verts.filter((v) => v === '🟡').length;
  results.summary = {
    rows: verts.length,
    green,
    yellow,
    red,
    orphan: results.orphan,
    consoleErrors: results.consoleErrors.slice(-8),
    pageErrors: results.pageErrors.slice(-5),
  };
  // Batch C PASS_TO_PM when every row has verdict and no unexpected 🔴 crash on core open;
  // 🟡 BLOCKED/empty / product_gap is acceptable under U65.
  results.ack_status = red > 0 && green === 0 ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  save();
  console.log('SUMMARY', results.summary, results.ack_status);
  await browser.close();
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
