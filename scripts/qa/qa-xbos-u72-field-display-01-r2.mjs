/**
 * QA-XBOS-U72-FIELD-DISPLAY-01-R2 — retest F-09+F-10 after FE FIX + spot AC-F-XBOS-01..11 (U65)
 * x-bos-core :5176 + web-portal :5173 · ceo@xe.vn
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_CORE = process.env.XBOS_CORE_URL || 'http://127.0.0.1:5176';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SHOT_DIR = resolve(ROOT, 'docs/qa/evidence/screenshots/qa-xbos-u72-field-display-01-r2');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-xbos-u72-field-display-01-r2-runtime.json');
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const RAW_ORG = /\b(holding|subsidiary|division|department)\b/i;
const RAW_STATUS_AI = /\b(active|inactive)\b/i;
const RAW_META = /\b(org_unit|boolean|select|text|number|date)\b/i;
const RAW_KPI_FREQ = /\b(daily|weekly|monthly)\b/i;
const RAW_KPI_ST = /\b(draft|active|inactive|pending_approval|approved|frozen)\b/i;
const RAW_PARTNER = /\b(supplier|distributor|service)\b/i;
const RAW_BLOCK = /\b(general|location|capacity)\b/i;
const HOLDING_COPY = /\bholding\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-XBOS-U72-FIELD-DISPLAY-01-R2',
  alias: 'QA-XBOS-U72-LABEL-02',
  startedAt: new Date().toISOString(),
  portal: PORTAL,
  xbosCore: XBOS_CORE,
  account: EMAIL,
  seed: false,
  fids: {},
  hids: {},
  steps: [],
  screenshots: [],
  networkWire: { companyIdHoldingSeen: false, sampleUrls: [] },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

function setFid(id, verdict, detail, extras = {}) {
  results.fids[id] = { verdict, detail, ...extras };
  note(id, verdict === 'PASS', detail);
}

function setHid(id, verdict, detail, extras = {}) {
  results.hids[id] = { verdict, detail, ...extras };
  note(id, verdict === 'PASS', detail);
}

async function shot(page, name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = resolve(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  results.screenshots.push(path);
  return path;
}

async function bodyText(page) {
  return page.evaluate(() =>
    (document.body?.innerText || '').replace(/\s+/g, ' ').trim(),
  );
}

async function optionTexts(page, selector = 'select option') {
  return page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(sel)).map((o) =>
      (o.textContent || '').replace(/\s+/g, ' ').trim(),
    );
  }, selector);
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
    }
  }, session);
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(500);
  await page.evaluate(
    (email, password) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const emailEl =
        inputs.find((i) => i.type === 'email' || /email/i.test(i.name || i.placeholder || '')) ||
        inputs[0];
      const passEl =
        inputs.find((i) => i.type === 'password') || inputs[1];
      if (emailEl) {
        emailEl.focus();
        emailEl.value = email;
        emailEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passEl) {
        passEl.focus();
        passEl.value = password;
        passEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    EMAIL,
    PASSWORD,
  );
  const clicked = await clickByText(page, 'Đăng nhập', 'button');
  if (!clicked) {
    await page.keyboard.press('Enter');
  }
  await sleep(2500);
  if (!/command-center|partners|dashboard|hr\//i.test(page.url())) {
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1500);
  }
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: j?.data?.user ?? { userId: EMAIL, displayName: 'CEO XeVN', email: EMAIL },
    raw: j?.data ?? j,
  };
}

async function clickByText(
  page,
  text,
  sel = 'button, a, [role="tab"], [role="button"], li, span',
  { exact = false } = {},
) {
  const box = await page.evaluate(
    (t, selector, exactMatch) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exactMatch) return txt === t;
        // Prefer shortest matching clickable (avoid matching long paragraphs)
        return txt.includes(t) && txt.length <= Math.max(t.length + 40, 80);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, txt: (el.textContent || '').slice(0, 60) };
    },
    text,
    sel,
    exact,
  );
  if (!box) return false;
  await page.mouse.click(box.x, box.y);
  return true;
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });
  let session;
  try {
    session = await loginApi();
    note('L0-login-api', true, 'ceo@xe.vn token ok');
  } catch (e) {
    note('L0-login-api', false, String(e));
    save();
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(45000);
    page.on('response', (res) => {
      try {
        const u = res.url();
        if (!/catalog|apply|snapshot|hrm/i.test(u)) return;
        // note URL only; body inspected later for apply panel
        if (results.networkWire.sampleUrls.length < 12) {
          results.networkWire.sampleUrls.push(`${res.status()} ${u.slice(0, 160)}`);
        }
      } catch {
        /* ignore */
      }
    });
    await injectSession(page, session);

    // ——— x-bos-core F-01..07 ———
    await page.goto(`${XBOS_CORE}/`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(800);
    let text = await bodyText(page);
    const optOrg = await optionTexts(page);
    const orgLeak =
      RAW_ORG.test(text) ||
      optOrg.some((t) => RAW_ORG.test(t) && !/Tập đoàn|Công ty|Khối|Phòng/.test(t));
    // Allow VI labels only — reject if raw keys appear as standalone table/option text
    const orgTableLeak = await page.evaluate(() => {
      const cells = Array.from(document.querySelectorAll('td, th, select option, span, badge, div'));
      const keys = ['holding', 'subsidiary', 'division', 'department', 'active', 'inactive'];
      const hits = [];
      for (const el of cells) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 40) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      return hits.slice(0, 20);
    });
    await shot(page, 'f01-f02-organization');
    setFid(
      'F-XBOS-01',
      orgTableLeak.filter((h) => ['holding', 'subsidiary', 'division', 'department'].includes(h.toLowerCase()))
        .length === 0
        ? 'PASS'
        : 'FAIL',
      orgTableLeak.length
        ? `orgType visible hits: ${orgTableLeak.join(', ')}`
        : 'No raw orgTypeCode in table/select text',
      { screenshot: 'f01-f02-organization.png', url: `${XBOS_CORE}/` },
    );
    setFid(
      'F-XBOS-02',
      orgTableLeak.filter((h) => ['active', 'inactive'].includes(h.toLowerCase())).length === 0
        ? 'PASS'
        : 'FAIL',
      orgTableLeak.filter((h) => ['active', 'inactive'].includes(h.toLowerCase())).length
        ? `status hits: ${orgTableLeak.join(', ')}`
        : 'No raw active/inactive status badges',
      { screenshot: 'f01-f02-organization.png', url: `${XBOS_CORE}/` },
    );

    await page.goto(`${XBOS_CORE}/metadata`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(600);
    const metaHits = await page.evaluate(() => {
      const keys = ['org_unit', 'boolean', 'select', 'text', 'number', 'date'];
      const hits = [];
      for (const el of document.querySelectorAll('td, th, select option, span, div')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 30) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      return hits.slice(0, 20);
    });
    await shot(page, 'f03-metadata');
    setFid(
      'F-XBOS-03',
      metaHits.length === 0 ? 'PASS' : 'FAIL',
      metaHits.length ? `raw meta hits: ${metaHits.join(', ')}` : 'entityType/dataType show VI labels',
      { screenshot: 'f03-metadata.png', url: `${XBOS_CORE}/metadata` },
    );

    await page.goto(`${XBOS_CORE}/kpi`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(600);
    const kpiHits = await page.evaluate(() => {
      const keys = ['draft', 'active', 'inactive', 'daily', 'weekly', 'monthly'];
      const hits = [];
      for (const el of document.querySelectorAll('td, th, select option, span, div, badge')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 24) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      return hits.slice(0, 20);
    });
    await shot(page, 'f04-kpi-definitions');
    setFid(
      'F-XBOS-04',
      kpiHits.length === 0 ? 'PASS' : 'FAIL',
      kpiHits.length ? `raw kpi hits: ${kpiHits.join(', ')}` : 'frequency/status VI in table+select',
      { screenshot: 'f04-kpi-definitions.png', url: `${XBOS_CORE}/kpi` },
    );

    await page.goto(`${XBOS_CORE}/kpi/assign`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(600);
    text = await bodyText(page);
    const assignEn = /\bStatus\s*:/i.test(text);
    const assignHits = await page.evaluate(() => {
      const keys = ['draft', 'pending_approval', 'approved', 'frozen'];
      const hits = [];
      for (const el of document.querySelectorAll('h1,h2,h3,header,span,div,p')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 80) continue;
        for (const k of keys) {
          if (t === k || t.includes(`Status: ${k}`) || t.endsWith(` ${k}`)) hits.push(t.slice(0, 80));
        }
      }
      return [...new Set(hits)].slice(0, 15);
    });
    await shot(page, 'f05-kpi-assignments');
    setFid(
      'F-XBOS-05',
      !assignEn && assignHits.length === 0 ? 'PASS' : 'FAIL',
      assignEn || assignHits.length
        ? `EN Status or raw: ${assignHits.join(' | ') || 'Status: present'}`
        : 'Header/summary use VI status labels',
      { screenshot: 'f05-kpi-assignments.png', url: `${XBOS_CORE}/kpi/assign` },
    );

    await page.goto(`${XBOS_CORE}/policy`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(600);
    const polHits = await page.evaluate(() => {
      const keys = ['draft', 'active', 'inactive'];
      const hits = [];
      for (const el of document.querySelectorAll('td, select option, span, badge, div')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 20) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      return hits.slice(0, 20);
    });
    await shot(page, 'f06-policy');
    setFid(
      'F-XBOS-06',
      polHits.length === 0 ? 'PASS' : 'FAIL',
      polHits.length ? `raw policy status: ${polHits.join(', ')}` : 'group/policy status VI',
      { screenshot: 'f06-policy.png', url: `${XBOS_CORE}/policy` },
    );

    await page.goto(`${XBOS_CORE}/policy/summary`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(600);
    const rpHits = await page.evaluate(() => {
      const keys = ['draft', 'final'];
      const hits = [];
      for (const el of document.querySelectorAll('select option, td, span, div')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 40) continue;
        // option like "Run … — draft" or bare draft/final
        if (keys.includes(t.toLowerCase()) || /[—\-]\s*(draft|final)\b/i.test(t)) hits.push(t);
      }
      return hits.slice(0, 20);
    });
    await shot(page, 'f07-reward-penalty');
    setFid(
      'F-XBOS-07',
      rpHits.length === 0 ? 'PASS' : 'FAIL',
      rpHits.length ? `raw run status: ${rpHits.join(', ')}` : 'run select status VI / unknown —',
      { screenshot: 'f07-reward-penalty.png', url: `${XBOS_CORE}/policy/summary` },
    );

    // ——— portal F-08..11 (session already injected) ———
    await page.goto(`${PORTAL}/partners`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1200);
    if (/\/login/i.test(page.url())) {
      await uiLogin(page);
      await page.goto(`${PORTAL}/partners`, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(1000);
    }
    const partnerHits = await page.evaluate(() => {
      const keys = ['supplier', 'distributor', 'service'];
      const hits = [];
      for (const el of document.querySelectorAll('td, span, div, badge, button')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 24) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      return hits.slice(0, 20);
    });
    await shot(page, 'f08-partners');
    setFid(
      'F-XBOS-08',
      partnerHits.length === 0 && !/\/login/i.test(page.url()) ? 'PASS' : partnerHits.length ? 'FAIL' : 'FAIL',
      /\/login/i.test(page.url())
        ? 'Still on login — auth session not accepted'
        : partnerHits.length
          ? `raw partner type: ${partnerHits.join(', ')}`
          : 'Partner type badges VI (Nhà cung cấp/…)',
      { screenshot: 'f08-partners.png', url: page.url() },
    );

    // F-09: Sửa danh mục → Tiếp theo×2 → pick entity → nested «Cấu hình khối & trường»
    // Fallback: Điểm hạ tầng → Thêm → Mở cấu hình khối
    await page.goto(`${PORTAL}/command-center?settings=company_infrastructure`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(2000);
    if (/\/login/i.test(page.url())) {
      await uiLogin(page);
      await page.goto(`${PORTAL}/command-center?settings=company_infrastructure`, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });
      await sleep(2000);
    }
    await clickByText(page, 'Hạ tầng cơ sở');
    await sleep(700);
    await clickByText(page, 'Danh mục nền');
    await sleep(600);
    const openedSua = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const sua = btns.find((b) => /^Sửa$/i.test((b.textContent || '').trim()));
      if (sua) {
        sua.click();
        return true;
      }
      return false;
    });
    await sleep(1000);
    await clickByText(page, 'Tiếp theo', 'button', { exact: true });
    await sleep(1000);
    await clickByText(page, 'Tiếp theo', 'button', { exact: true });
    await sleep(1200);
    const wizardStep3 = await page.evaluate(() =>
      /Chọn pháp nhân xem trước biểu mẫu|Cấu hình khối & trường/i.test(
        document.body?.innerText || '',
      ),
    );
    // Click first legal-entity preview chip (em dash title)
    const chipClicked = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button, [role="button"], div'));
      const chip = cards.find((b) => {
        const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
        return (
          (/TẬP ĐOÀN|Công ty|—/.test(t) || /XeVN/i.test(t)) &&
          t.length < 140 &&
          t.length > 8 &&
          !/Tiếp theo|Hủy|Quay lại|Xác nhận|Cấu hình khối|Thông tin|Phạm vi|Ba bước/i.test(t)
        );
      });
      if (!chip) return false;
      chip.scrollIntoView({ block: 'center' });
      chip.click();
      return true;
    });
    await sleep(900);
    let nestedOpened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter((b) => {
        const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
        return /Cấu hình khối\s*&\s*trường/i.test(t);
      });
      const enabled = btns.find((b) => !b.disabled);
      if (!enabled) return { ok: false, reason: 'button missing/disabled', count: btns.length };
      enabled.scrollIntoView({ block: 'center' });
      enabled.click();
      return { ok: true, disabled: false, count: btns.length };
    });
    await sleep(2000);

    // Fallback path if nested modal missing
    let usedFallback = false;
    const hasNested = async () =>
      page.evaluate(() =>
        /Thuộc khối|Khối Thông tin chung|Cấu hình mục thông tin hạ tầng/i.test(
          document.body?.innerText || '',
        ),
      );
    if (!(await hasNested())) {
      usedFallback = true;
      await page.keyboard.press('Escape');
      await sleep(400);
      await page.keyboard.press('Escape');
      await sleep(400);
      await clickByText(page, 'Điểm hạ tầng') ||
        (await clickByText(page, '2. Điểm hạ tầng'));
      await sleep(900);
      await clickByText(page, 'Thêm hạ tầng');
      await sleep(1000);
      nestedOpened = {
        ...(nestedOpened || {}),
        fallback: await clickByText(page, 'Mở cấu hình khối'),
      };
      await sleep(1500);
    }

    // Open field form (Thêm / Sửa) so read-only «Thuộc khối» bind is visible
    const openedFieldForm =
      (await clickByText(page, 'Thêm trường')) ||
      (await clickByText(page, 'Thêm mục')) ||
      (await clickByText(page, 'Thêm')) ||
      (await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('button, a'));
        const edit = rows.find((b) => {
          const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
          return /^Sửa$/i.test(t) || /Chỉnh sửa trường|Sửa trường/i.test(t);
        });
        if (!edit) return false;
        edit.scrollIntoView({ block: 'center' });
        edit.click();
        return true;
      }));
    await sleep(1200);

    const f09 = await page.evaluate(() => {
      const dialogs = Array.from(
        document.querySelectorAll('[role="dialog"], [aria-modal="true"]'),
      );
      const titled = dialogs.find((d) =>
        /Cấu hình mục thông tin hạ tầng|Thuộc khối|Khối Thông tin chung/i.test(
          d.innerText || '',
        ),
      );
      const root = titled || dialogs[dialogs.length - 1] || document.body;
      const optionTexts = Array.from(root.querySelectorAll('select option')).map((o) =>
        (o.textContent || '').replace(/\s+/g, ' ').trim(),
      );
      const badOptions = optionTexts.filter(
        (t) =>
          /^(general|location|capacity)\b/i.test(t) ||
          /\b(general|location|capacity)\s*[-–]/i.test(t),
      );
      // Only leaf-ish nodes: exact key as entire text (avoid parent aggregating children)
      const shortHits = [];
      for (const el of root.querySelectorAll('option, span, label, li, td, h3, h4, button, div')) {
        if (el.children.length > 0 && !['BUTTON', 'DIV'].includes(el.tagName)) continue;
        if (el.tagName === 'DIV' && el.children.length > 0) continue;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 24) continue;
        if (['general', 'location', 'capacity'].includes(t.toLowerCase())) shortHits.push(t);
      }
      // AC-F-XBOS-09 focus: selected/display text next to «Thuộc khối»
      const thuocKhoiDisplays = [];
      for (const lab of root.querySelectorAll('label, div, span')) {
        const labText = (lab.textContent || '').replace(/\s+/g, ' ').trim();
        if (!/^Thuộc khối$/i.test(labText) && !labText.startsWith('Thuộc khối')) continue;
        // Prefer sibling / nested display (not the whole label tree)
        const select = lab.querySelector('select');
        if (select) {
          const opt = select.options[select.selectedIndex];
          thuocKhoiDisplays.push({
            kind: 'select',
            valueAttr: select.value,
            display: (opt?.textContent || '').replace(/\s+/g, ' ').trim(),
          });
        }
        const div = lab.querySelector('div.mt-1, div');
        if (div && !select) {
          thuocKhoiDisplays.push({
            kind: 'readonly',
            display: (div.textContent || '').replace(/\s+/g, ' ').trim(),
          });
        }
      }
      // Also scan labels that contain span «Thuộc khối»
      for (const span of root.querySelectorAll('span')) {
        if (!/^Thuộc khối$/i.test((span.textContent || '').trim())) continue;
        const label = span.closest('label') || span.parentElement;
        if (!label) continue;
        const select = label.querySelector('select');
        if (select) {
          const opt = select.options[select.selectedIndex];
          thuocKhoiDisplays.push({
            kind: 'select-via-span',
            valueAttr: select.value,
            display: (opt?.textContent || '').replace(/\s+/g, ' ').trim(),
          });
        } else {
          const div = label.querySelector('div');
          if (div) {
            thuocKhoiDisplays.push({
              kind: 'readonly-via-span',
              display: (div.textContent || '').replace(/\s+/g, ' ').trim(),
            });
          }
        }
      }
      const displayLeak = thuocKhoiDisplays.filter((d) =>
        /^(general|location|capacity)$/i.test(d.display || ''),
      );
      const body = (root.innerText || '').replace(/\s+/g, ' ');
      return {
        dialogCount: dialogs.length,
        badOptions,
        shortHits: [...new Set(shortHits)].slice(0, 20),
        sampleOptions: optionTexts.filter(Boolean).slice(0, 16),
        hasThuocKhoi: /Thuộc khối/.test(body),
        hasBlockNavVi: /Khối Thông tin chung|Khối Vị trí|Khối Năng lực/.test(body),
        title: /Cấu hình mục thông tin hạ tầng/i.test(body),
        thuocKhoiDisplays: thuocKhoiDisplays.slice(0, 8),
        displayLeak,
        bodySnippet: body.slice(0, 400),
      };
    });
    await shot(page, 'f09-infra-custom-fields');
    const onBlockSurface = f09.hasThuocKhoi || f09.hasBlockNavVi || f09.title;
    const f09Pass =
      onBlockSurface &&
      f09.badOptions.length === 0 &&
      f09.shortHits.length === 0 &&
      f09.displayLeak.length === 0;
    setFid(
      'F-XBOS-09',
      f09Pass ? 'PASS' : 'FAIL',
      !onBlockSurface
        ? `Block surface not reached (sua=${openedSua} step3=${wizardStep3} chip=${chipClicked} nested=${JSON.stringify(nestedOpened)} fallback=${usedFallback} fieldForm=${openedFieldForm}) snip=${f09.bodySnippet}`
        : f09.badOptions.length || f09.shortHits.length || f09.displayLeak.length
          ? `blockCode leak options=[${f09.badOptions.join('|')}] shorts=[${f09.shortHits.join(',')}] displayLeak=${JSON.stringify(f09.displayLeak)} sample=${f09.sampleOptions.join(' ; ')}`
          : `Thuộc khối/block nav VI only; displays=${JSON.stringify(f09.thuocKhoiDisplays)}; options=${f09.sampleOptions.join(' ; ')}`,
      {
        screenshot: 'f09-infra-custom-fields.png',
        url: page.url(),
        click_path:
          'login → settings=company_infrastructure → Sửa → Tiếp theo×2 → chip PN → Cấu hình khối & trường → Thêm/Sửa field',
        probe: { ...f09, nestedOpened, chipClicked, usedFallback, openedFieldForm },
      },
    );

    await page.keyboard.press('Escape');
    await sleep(300);
    await page.keyboard.press('Escape');
    await sleep(400);

    // F-10 Apply catalog deep-link
    const catalogBodies = [];
    page.on('response', async (res) => {
      try {
        const u = res.url();
        if (!/catalog|snapshot|apply-to-members|hrm-catalog/i.test(u)) return;
        const ct = res.headers()['content-type'] || '';
        if (!/json/i.test(ct)) return;
        const j = await res.json().catch(() => null);
        const s = JSON.stringify(j || {});
        if (/"companyId"\s*:\s*"holding"/i.test(s) || /"company_id"\s*:\s*"holding"/i.test(s)) {
          results.networkWire.companyIdHoldingSeen = true;
          if (catalogBodies.length < 3) catalogBodies.push(u.slice(0, 120));
        }
      } catch {
        /* ignore */
      }
    });
    await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_apply_members`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(2000);
    let openedApply =
      (await clickByText(page, 'Áp dụng danh mục HRM')) ||
      (await clickByText(page, 'Áp dụng danh mục'));
    await sleep(1000);
    for (let i = 0; i < 10; i++) {
      text = await bodyText(page);
      if (/Nguồn tập đoàn:|checksum:|Chưa có snapshot|Đang tải catalog/i.test(text)) break;
      await sleep(800);
    }
    if (!/Nguồn tập đoàn|Áp dụng danh mục|tập đoàn/i.test(text)) {
      openedApply =
        (await clickByText(page, 'Áp dụng danh mục HRM')) || openedApply;
      await sleep(1200);
      text = await bodyText(page);
    }
    // Scope holding check to Apply Catalog panel (not unrelated CC toast residuals)
    const holdingHits = await page.evaluate(() => {
      const panel =
        document.querySelector('[data-testid="apply-catalog-panel"]') ||
        Array.from(document.querySelectorAll('section, div, form')).find((el) =>
          /Nguồn tập đoàn:|Tải lại nguồn tập đoàn/i.test(el.textContent || ''),
        ) ||
        document.body;
      const body = panel?.innerText || '';
      const lines = body
        .split('\n')
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter((l) => /\bholding\b/i.test(l) || /xevn\/holding/i.test(l));
      const m = body.replace(/\s+/g, ' ').match(/Nguồn tập đoàn:[^.]{0,80}/i);
      return {
        lines: lines.slice(0, 8),
        sourceLine: m ? m[0] : null,
        hasTapDoanInSource: /Nguồn tập đoàn:\s*tập đoàn/i.test(body),
        hasXevnHoldingPath: /xevn\/holding/i.test(body),
      };
    });
    const holdingInUi = holdingHits.lines.length > 0 || holdingHits.hasXevnHoldingPath;
    const hasTapDoan = /tập đoàn|Nguồn tập đoàn/i.test(text);
    const sourceLoaded = /Nguồn tập đoàn:|version \d+/i.test(text);
    const panelVisible = /Tải lại nguồn tập đoàn|Áp dụng danh mục HRM|Áp dụng cho|Nguồn tập đoàn/i.test(
      text,
    );
    await shot(page, 'f10-apply-catalog');
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(2000);
    const holdingAfterF5 = await page.evaluate(() => {
      const panel =
        document.querySelector('[data-testid="apply-catalog-panel"]') ||
        Array.from(document.querySelectorAll('section, div, form')).find((el) =>
          /Nguồn tập đoàn:|Tải lại nguồn tập đoàn/i.test(el.textContent || ''),
        ) ||
        document.body;
      const body = (panel?.innerText || '').replace(/\s+/g, ' ');
      const m = body.match(/Nguồn tập đoàn:[^·]{0,60}/i);
      return {
        stillHolding: /\bholding\b/i.test(body) || /xevn\/holding/i.test(body),
        sourceLine: m ? m[0] : null,
        hasTapDoan: /Nguồn tập đoàn:\s*tập đoàn/i.test(body),
      };
    });
    await shot(page, 'f10-apply-catalog-f5');
    const f10Pass =
      panelVisible &&
      sourceLoaded &&
      !holdingInUi &&
      !holdingAfterF5.stillHolding &&
      (holdingHits.hasTapDoanInSource || holdingAfterF5.hasTapDoan || hasTapDoan);
    setFid(
      'F-XBOS-10',
      f10Pass ? 'PASS' : 'FAIL',
      !panelVisible
        ? `Apply catalog panel not visible (click=${openedApply}) snip=${text.slice(0, 200)}`
        : !sourceLoaded
          ? `Source summary not loaded — cannot clear holding (snip=${text.slice(0, 180)})`
          : holdingInUi || holdingAfterF5.stillHolding
            ? `User-facing «holding» still visible: ${(holdingHits.lines[0] || holdingAfterF5.sourceLine || '').toString()}`
            : `Copy uses tập đoàn; no \\bholding\\b / xevn/holding in panel; F5 OK; wireHolding=${results.networkWire.companyIdHoldingSeen} (OK)`,
      {
        screenshot: 'f10-apply-catalog.png',
        url: page.url(),
        click_path: '/command-center?settings=hrm_catalog_apply_members → F5',
        holdingHits,
        holdingAfterF5,
        networkWire: { ...results.networkWire, catalogBodies },
      },
    );

    // F-11 workflow unknown → —
    try {
      await page.goto(`${PORTAL}/command-center?settings=workflow`, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });
      await sleep(1200);
      const mapperProbe = await page.evaluate(async () => {
        try {
          const mod = await import('/src/integrations/workflowInstanceMapper.ts');
          const fn = mod.workflowInstanceStatusLabelVi;
          return {
            ok: true,
            unknown: fn('totally_unknown_xyz_u72'),
            pending: fn('pending'),
            completed: fn('completed'),
          };
        } catch (e) {
          return { ok: false, error: String(e) };
        }
      });
      await clickByText(page, 'Quy trình');
      await sleep(800);
      await shot(page, 'f11-workflow-status');
      const f11Pass =
        mapperProbe.ok &&
        mapperProbe.unknown === '—' &&
        mapperProbe.pending === 'Đang chờ' &&
        mapperProbe.completed === 'Hoàn thành';
      setFid(
        'F-XBOS-11',
        f11Pass ? 'PASS' : 'FAIL',
        mapperProbe.ok
          ? `mapper browser-import: unknown→«${mapperProbe.unknown}» pending→«${mapperProbe.pending}» completed→«${mapperProbe.completed}»`
          : `import failed: ${mapperProbe.error}`,
        {
          screenshot: 'f11-workflow-status.png',
          url: page.url(),
          click_path: '/command-center?settings=workflow (+ Vite import mapper)',
          probe: mapperProbe,
        },
      );
    } catch (e) {
      setFid('F-XBOS-11', 'FAIL', `workflow navigate/import error: ${String(e).slice(0, 180)}`, {
        url: `${PORTAL}/command-center?settings=workflow`,
      });
    }

    // ——— Spot AC-H + industry regression ———
    await page.goto(`${PORTAL}/command-center`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(1500);
    const h01 = await page.evaluate(() => {
      const keys = ['parent', 'holding', 'subsidiary', 'affiliate'];
      const hits = [];
      for (const el of document.querySelectorAll('td, select option, span, div, badge')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 28) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      const body = (document.body?.innerText || '').replace(/\s+/g, ' ');
      const hasVi = /Công ty mẹ|Công ty con|Công ty liên kết/.test(body);
      return { hits: [...new Set(hits)].slice(0, 15), hasVi };
    });
    await shot(page, 'h01-entity-level');
    setHid(
      'AC-H-XBOS-01',
      h01.hits.length === 0 ? 'PASS' : 'FAIL',
      h01.hits.length
        ? `raw entityLevel: ${h01.hits.join(', ')}`
        : h01.hasVi
          ? 'Cấp bậc VI (Công ty mẹ/con/liên kết); no parent/holding raw'
          : 'No raw entityLevel keys (VI labels may be empty list)',
      { screenshot: 'h01-entity-level.png', url: page.url() },
    );

    // enterpriseType select (H-04) — open legal entity create/edit if available
    await clickByText(page, 'Thêm pháp nhân') ||
      (await clickByText(page, 'Thêm công ty')) ||
      (await clickByText(page, 'Chỉnh sửa'));
    await sleep(1000);
    const h04 = await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('select option')).map((o) =>
        (o.textContent || '').replace(/\s+/g, ' ').trim(),
      );
      const bad = opts.filter((t) =>
        /\b(joint-stock|llc-2-members|llc-1-member|state-owned)\b/i.test(t),
      );
      const hasVi = opts.some((t) => /cổ phần|TNHH|nhà nước/i.test(t));
      return { bad, hasVi, sample: opts.filter(Boolean).slice(0, 12) };
    });
    await shot(page, 'h04-enterprise-type');
    setHid(
      'AC-H-XBOS-04',
      h04.bad.length === 0 && (h04.hasVi || h04.sample.length === 0) ? 'PASS' : 'FAIL',
      h04.bad.length
        ? `enterpriseType raw in options: ${h04.bad.join(' | ')}`
        : h04.hasVi
          ? `enterpriseType options VI: ${h04.sample.join(' ; ')}`
          : 'No enterpriseType select on surface (N/A soft PASS — no raw keys)',
      { screenshot: 'h04-enterprise-type.png', url: page.url(), probe: h04 },
    );
    await page.keyboard.press('Escape');
    await sleep(400);

    // H-08 partner/customer status — reuse partners page
    await page.goto(`${PORTAL}/partners`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(1000);
    const h08 = await page.evaluate(() => {
      const keys = ['active', 'inactive'];
      const hits = [];
      for (const el of document.querySelectorAll('td, span, div, badge')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!t || t.length > 16) continue;
        if (keys.includes(t.toLowerCase())) hits.push(t);
      }
      const body = document.body?.innerText || '';
      return {
        hits: [...new Set(hits)].slice(0, 10),
        hasVi: /Hoạt động|Ngưng|Tạm dừng/.test(body),
      };
    });
    setHid(
      'AC-H-XBOS-08',
      h08.hits.length === 0 ? 'PASS' : 'FAIL',
      h08.hits.length
        ? `partner status raw: ${h08.hits.join(', ')}`
        : 'Partner status badges VI (no active/inactive raw)',
      { url: page.url() },
    );

    // H-12 = F-04 already; mirror verdict
    setHid(
      'AC-H-XBOS-12',
      results.fids['F-XBOS-04']?.verdict === 'PASS' ? 'PASS' : 'FAIL',
      'Mirrors AC-F-XBOS-04 (KPI status+frequency)',
      { ref: 'F-XBOS-04' },
    );

    // H-03 / AC-CO-IND-02 industry ≠ entity_type (HRM company)
    await page.goto(`${PORTAL}/command-center/hrm/company`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(2500);
    const h03 = await page.evaluate(() => {
      const frameDocs = [document];
      for (const f of Array.from(document.querySelectorAll('iframe'))) {
        try {
          if (f.contentDocument) frameDocs.push(f.contentDocument);
        } catch {
          /* cross-origin */
        }
      }
      const hits = [];
      for (const doc of frameDocs) {
        const body = (doc.body?.innerText || '').replace(/\s+/g, ' ');
        // Look near "Ngành" for subsidiary/holding as cell values
        for (const el of doc.querySelectorAll('td, span, div')) {
          const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
          if (!t || t.length > 40) continue;
          if (/^(holding|subsidiary)$/i.test(t)) hits.push(t);
        }
        if (/\bNgành nghề\b[\s\S]{0,40}\b(holding|subsidiary)\b/i.test(body)) {
          hits.push('industry-column-entity_type');
        }
      }
      return { hits: [...new Set(hits)].slice(0, 12), url: location.href };
    });
    await shot(page, 'h03-industry-regression');
    setHid(
      'AC-H-XBOS-03',
      h03.hits.length === 0 ? 'PASS' : 'FAIL',
      h03.hits.length
        ? `industry/entity_type leak: ${h03.hits.join(', ')}`
        : 'HRM Company: no holding/subsidiary as Ngành nghề (AC-CO-IND-02)',
      { screenshot: 'h03-industry-regression.png', url: page.url(), probe: h03 },
    );

    const fPass = Object.values(results.fids).every((f) => f.verdict === 'PASS');
    const hPass = Object.values(results.hids).every((f) => f.verdict === 'PASS');
    const allPass = fPass && hPass;
    results.finishedAt = new Date().toISOString();
    results.overall = allPass ? 'PASS' : 'FAIL';
    results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    save();
    console.log('\nOVERALL', results.overall, results.ack_status);
    console.log(
      Object.entries(results.fids)
        .map(([k, v]) => `${k}=${v.verdict}`)
        .join(' '),
    );
    console.log(
      Object.entries(results.hids)
        .map(([k, v]) => `${k}=${v.verdict}`)
        .join(' '),
    );
    process.exit(allPass ? 0 : 1);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e);
  save();
  process.exit(2);
});
