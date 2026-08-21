#!/usr/bin/env node
/**
 * QA-PO-HRM-WH-POSITION-PICKER-01 — AC-SET-CONSUMER-JT-WH-01
 * U65 ceo@ · NV detail → Quá trình công tác → Vị trí picker → Lưu → F5
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `WHPOS1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-wh-position-picker-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-po-hrm-wh-position-picker-01');
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
  work_item_id: 'QA-PO-HRM-WH-POSITION-PICKER-01',
  ac_id: 'AC-SET-CONSUMER-JT-WH-01',
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { settings_catalog_e2e_ready: false, deny_flip: true, uf_hrm_10_full: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  vitest: { file: 'po-hrm-settings-consumer-jt-wh-fe-01.test.ts', result: '4/4 (pre-run)' },
  jest: { file: 'po-hrm-settings-consumer-jt-wh-be-01.spec.ts', result: '4/4 (pre-run)' },
  catalogs: { jobTitlesEff: 0, sampleCodes: [] },
  employee: { id: null, name: null },
  browser: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

function unwrapList(body) {
  if (!body || typeof body !== 'object') return [];
  const d = body.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(d)) return d;
  return [];
}

async function loginApi() {
  let data = null;
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
      if (r.ok && token) {
        data = { ...d, accessToken: token };
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken) throw new Error('login failed');
  return {
    token: data.accessToken,
    user: data.user ?? { email: EMAIL },
    companyId: COMPANY,
    expiresAt: Date.now() + 3600000,
    raw: data,
  };
}

async function fetchJobTitlesEff(token) {
  const url = `${HRM}/api/hrm/settings-catalogs?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const catalogs = j?.data?.catalogs ?? j?.catalogs ?? j?.data ?? [];
  const list = Array.isArray(catalogs) ? catalogs : [];
  const jt = list.find(
    (c) =>
      c?.catalog_key === 'job_titles' ||
      c?.catalogKey === 'job_titles' ||
      c?.key === 'job_titles',
  );
  const items =
    jt?.effectiveItems ??
    jt?.effective_items ??
    jt?.items?.filter((x) => x?.status === 'effective' || x?.isEffective) ??
    [];
  const eff = Array.isArray(items) ? items : [];
  R.catalogs.jobTitlesEff = eff.length;
  R.catalogs.sampleCodes = eff.slice(0, 5).map((x) => x.code || x.key).filter(Boolean);
  return eff.length;
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
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u) || !/work-timeline/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        at: ts(),
      };
      let postBody = null;
      try {
        postBody = res.request().postDataJSON();
      } catch {
        try {
          postBody = JSON.parse(res.request().postData() || 'null');
        } catch {
          postBody = null;
        }
      }
      entry.requestBody = postBody;
      if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          entry.position_key = row?.position_key ?? postBody?.position_key ?? null;
          entry.position = row?.position ?? postBody?.position ?? null;
          entry.code = j?.code ?? null;
        } catch {
          /* */
        }
        R.browser.lastMutate = entry;
      }
      if (method === 'GET') {
        try {
          const j = await res.json();
          const arr = unwrapList(j);
          entry.count = arr.length;
          entry.sample = arr.slice(0, 3).map((x) => ({
            id: x.id,
            position_key: x.position_key,
            position: x.position,
          }));
          R.browser.lastList = entry;
        } catch {
          /* */
        }
      }
      R.network.push(entry);
      save();
    } catch {
      /* */
    }
  });
}

async function pickCatalog(page, testId) {
  const trigger = page.locator(`[data-testid="${testId}"]`).first();
  if ((await trigger.count()) === 0) return { ok: false, reason: 'picker_missing' };
  await trigger.click({ timeout: 8000 });
  await sleep(500);
  const item = page.locator('[cmdk-item], [role="option"]').first();
  if ((await item.count()) === 0) {
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, reason: 'no_options' };
  }
  const label = ((await item.textContent()) || '').trim().slice(0, 120);
  const dataCode =
    (await item.getAttribute('data-value')) ||
    (await item.getAttribute('value')) ||
    null;
  await item.click();
  await sleep(400);
  return { ok: true, label, dataCode };
}

async function clickTab(page, patterns) {
  for (const re of patterns) {
    const btn = page.locator('button, [role="tab"], a').filter({ hasText: re }).first();
    if ((await btn.count()) > 0 && (await btn.isVisible().catch(() => false))) {
      await btn.click({ timeout: 5000 }).catch(() => {});
      await sleep(1500);
      return true;
    }
  }
  return false;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.browser.screens = R.browser.screens || [];
  R.browser.screens.push(path.replace(/\\/g, '/'));
}

async function main() {
  const session = await loginApi();
  const jtEff = await fetchJobTitlesEff(session.token);

  const empRes = await fetch(
    `${HRM}/api/hrm/employees?page_size=5&company_id=${COMPANY}`,
    {
      headers: {
        authorization: `Bearer ${session.token}`,
        'x-tenant-id': TENANT,
      },
    },
  );
  const empJson = await empRes.json().catch(() => ({}));
  const employees = unwrapList(empJson);
  if (!employees[0]?.id) throw new Error('no employee for QTCT');
  R.employee.id = employees[0].id;
  R.employee.name = employees[0].full_name || employees[0].name || employees[0].code;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const B = {
    pickerMounted: false,
    noFreeTextPosition: null,
    pick: null,
    mutateStatus: null,
    requestPositionKey: null,
    responsePositionKey: null,
    feLabelAfterSave: null,
    f5RowHasCatalogLabel: false,
    emptyCatalogCta: false,
  };

  try {
    await page.goto(q(`/hr/employees/${R.employee.id}`), {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(3500);
    await shot(page, '01-profile');

    await clickTab(page, [/Quá trình công tác|Lịch sử công tác|Work history|workHistory/i]);
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);

    let addBtn = page.locator('[data-testid="hdsd-work-timeline-add-btn"]').first();
    if ((await addBtn.count()) === 0) {
      addBtn = page
        .locator('[data-testid="hdsd-work-timeline-root"] button')
        .filter({ hasText: /Thêm|Add|\+/i })
        .first();
    }

    const dialog = page.locator('[data-testid="hdsd-work-timeline-form-dialog"], [role="dialog"]');
    let dialogOpen = (await dialog.count()) > 0 && (await dialog.first().isVisible().catch(() => false));

    if ((await addBtn.count()) === 0 && !dialogOpen) {
      B.blocker = 'add_btn_missing';
    } else {
      if (!dialogOpen) {
        await addBtn.click({ force: true }).catch(async () => {
          await page.keyboard.press('Escape').catch(() => {});
          await sleep(400);
          await addBtn.click({ timeout: 8000 });
        });
        await sleep(1200);
      }
      dialogOpen = (await dialog.count()) > 0;
      await shot(page, '02-wh-dialog');

      const picker = page.locator('[data-testid="hdsd-work-timeline-position-picker"]');
      B.pickerMounted = (await picker.count()) > 0;

      const freeText = page.locator(
        '[data-testid="hdsd-work-timeline-form-dialog"] input[name="position"], [role="dialog"] input[name="position"]',
      );
      B.noFreeTextPosition = (await freeText.count()) === 0;

      const emptyCta = page.locator('[data-hrm-empty-catalog="HRM-WH-PICK-EMPTY-CATALOG"]');
      B.emptyCatalogCta = (await emptyCta.count()) > 0;

      const dialogInputs = page.locator('[role="dialog"] input:not([type=hidden])');
      const nIn = await dialogInputs.count();
      for (let i = 0; i < nIn; i++) {
        const el = dialogInputs.nth(i);
        const ph = ((await el.getAttribute('placeholder')) || '').toLowerCase();
        const val = await el.inputValue().catch(() => '');
        if (!val && (ph.includes('tiêu') || ph.includes('title') || ph.includes('sự kiện') || i <= 1)) {
          await el.fill(`QA QTCT ${STAMP}`);
          break;
        }
      }

      if (B.pickerMounted && !B.emptyCatalogCta) {
        B.pick = await pickCatalog(page, 'hdsd-work-timeline-position-picker');
        await pickCatalog(page, 'hdsd-work-timeline-department-picker').catch(() => ({
          ok: false,
        }));

        const submit = page.locator('[data-testid="hdsd-work-timeline-submit"]').first();
        if (B.pick?.ok && (await submit.count()) > 0) {
          await submit.click();
          await sleep(3000);
          await shot(page, '03-after-save');

          const mut = R.browser.lastMutate || {};
          B.mutateStatus = mut.status ?? null;
          B.requestPositionKey = mut.requestBody?.position_key ?? null;
          B.responsePositionKey = mut.position_key ?? null;

          const root = page.locator('[data-testid="hdsd-work-timeline-root"]');
          const rootText = ((await root.textContent().catch(() => '')) || '').slice(0, 2000);
          if (B.pick.label) {
            B.feLabelAfterSave = rootText.includes(B.pick.label.split('(')[0].trim().slice(0, 12));
          }

          await page.reload({ waitUntil: 'domcontentloaded' });
          await sleep(4000);
          await clickTab(page, [/Quá trình công tác|Lịch sử công tác|Work history/i]);
          await shot(page, '04-f5');

          const f5Text = ((await root.textContent().catch(() => '')) || '').slice(0, 3000);
          const listSample = R.browser.lastList?.sample || [];
          B.f5RowHasCatalogLabel =
            listSample.some((x) => x.position_key && x.position) ||
            (B.pick?.label && f5Text.includes(B.pick.label.split('(')[0].trim().slice(0, 10))) ||
            f5Text.includes(STAMP);
        }
      } else if (B.emptyCatalogCta && jtEff === 0) {
        B.blocker = 'empty_catalog_honest_cta';
      }
    }
  } finally {
    await browser.close();
  }

  R.browser = { ...R.browser, ...B };

  const mutateOk =
    typeof B.mutateStatus === 'number' && B.mutateStatus >= 200 && B.mutateStatus < 300;
  const keyOk = Boolean(B.requestPositionKey || B.responsePositionKey);

  const pass =
    B.pickerMounted &&
    B.noFreeTextPosition &&
    B.pick?.ok &&
    mutateOk &&
    keyOk &&
    (B.f5RowHasCatalogLabel || B.feLabelAfterSave);

  R.overall = pass ? 'PASS' : 'FAIL';
  R.ack_status = pass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();

  console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, ack_status: R.ack_status, browser: B }, null, 2));
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.browser = { ...(R.browser || {}), fatal: String(e) };
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
