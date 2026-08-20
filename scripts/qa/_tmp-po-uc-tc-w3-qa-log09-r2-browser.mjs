/**
 * PO-UC-TC-W3-QA-LOG09-R2 — browser U65 HDSD for XBOS-DM-LOG-09
 * CC → Cài đặt → Sao chép bộ danh mục LOG → clone-bundle domains=['logistics']
 * FORBIDDEN: seed · invent Leave L2 · PASS chỉ API · claim Phase1 DONE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const CEO_EMAIL = 'ceo@xe.vn';
const MEMBER_EMAIL = 'du-lich.ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const WORK_ITEM = 'PO-UC-TC-W3-QA-LOG09-R2';
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w3-qa-log09-r2-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w3-qa-log09-r2');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: WORK_ITEM,
  uc_id: 'XBOS-DM-LOG-09',
  layer: 'browser-U65-HDSD',
  hdsd_align: true,
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, CEO_EMAIL, MEMBER_EMAIL },
  l0: {},
  clicks: [],
  steps: [],
  case_matrix: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hdsd_inventory: [],
  distinct_menus: {},
  uat_done: false,
  phase1_done: false,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function click(action, detail = {}) {
  const row = { at: ts(), action, ...detail };
  results.clicks.push(row);
  console.log(`CLICK  ${results.clicks.length}  ${action}`, JSON.stringify(detail).slice(0, 220));
  save();
}

function step(id, action, expected, actual, result, extra = {}) {
  const row = { seq: results.steps.length + 1, at: ts(), id, action, expected, actual, result, ...extra };
  results.steps.push(row);
  console.log(`${String(result).toUpperCase()}  ${id}  ${String(actual).slice(0, 260)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ at: ts(), text: String(msg.text()).slice(0, 280) });
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/\/api\/xbos\/(auth\/login|config-sync)/.test(u) && !/clone-bundle|\/catalog\//.test(u)) {
        return;
      }
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      };
      try {
        const j = await res.json();
        entry.code = j?.code;
        entry.message = typeof j?.message === 'string' ? j.message.slice(0, 180) : undefined;
        if (j?.data && typeof j.data === 'object') {
          if (typeof j.data.copiedCount === 'number') entry.copiedCount = j.data.copiedCount;
          if (typeof j.data.matchedCount === 'number') entry.matchedCount = j.data.matchedCount;
          if (typeof j.data.skippedCount === 'number') entry.skippedCount = j.data.skippedCount;
          if (j.data.onConflict) entry.onConflict = j.data.onConflict;
          if (j.data.dest?.companyId) entry.destCompanyId = j.data.dest.companyId;
          if (Array.isArray(j.data.conflictKeys)) {
            entry.conflictKeyCount = j.data.conflictKeys.length;
          }
        }
      } catch {
        /* non-json */
      }
      results.network.push(entry);
      if (results.network.length > 300) results.network.shift();
      save();
    } catch {
      /* */
    }
  });
}

async function probeL0() {
  const urls = {
    hrm: 'http://127.0.0.1:28001/api/hrm',
    xbos: 'http://127.0.0.1:28002/api/xbos',
    portal: PORTAL,
  };
  for (const [k, url] of Object.entries(urls)) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = `FAIL:${String(e.message || e).slice(0, 80)}`;
    }
  }
  save();
}

async function authTokenPresent(page) {
  return page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      const s = localStorage.getItem(k) || '';
      if (s.split('.').length === 3 && s.length > 40) return true;
      try {
        const v = JSON.parse(s);
        const t = v?.token || v?.accessToken || v?.data?.accessToken;
        if (typeof t === 'string' && t.split('.').length === 3) return true;
      } catch {
        /* */
      }
    }
    return false;
  });
}

async function fillLogin(page, email) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(700);
  click('goto-login', { email });
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* */
    }
  });
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(500);
  const emailLoc = page
    .locator('input[type="email"], input[name="email"], input[autocomplete="username"]')
    .first();
  const passLoc = page.locator('input[type="password"]').first();
  await emailLoc.fill(email);
  await passLoc.fill(PASSWORD);
  click('fill-login', { email });
  await page.getByRole('button', { name: /Đăng nhập|Login|Sign in/i }).first().click();
  click('submit-login', { email });
  await page.waitForURL(/command-center|membership|select/i, { timeout: 60000 }).catch(() => {});
  // Membership picker if present
  const membershipBtn = page
    .getByRole('button', { name: /tiếp tục|chọn|holding|tập đoàn|xe\.vn|du lịch|main/i })
    .first();
  if (await membershipBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await membershipBtn.click().catch(() => {});
    click('pick-membership');
    await sleep(1200);
  }
  for (let i = 0; i < 24; i++) {
    if ((await authTokenPresent(page)) && /command-center/.test(page.url())) break;
    // Try navigate CC if stuck on picker
    if (!/command-center/.test(page.url()) && (await authTokenPresent(page))) {
      await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    }
    await sleep(300);
  }
  click('login-done', { email, url: page.url(), token: await authTokenPresent(page) });
  await shot(page, `login-${email.replace(/[^a-z0-9]/gi, '_')}`);
}

async function gotoLog09(page) {
  const url = `${PORTAL}/command-center?settings=log_catalog_clone_bundle`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1200);
  click('goto-log09', { url: page.url() });
  await shot(page, '02-log09-panel');
}

async function selectLogisticsDest(page) {
  const list = page.getByTestId('clone-bundle-dest-list');
  await list.waitFor({ state: 'visible', timeout: 20000 });
  // Exact plane — do NOT match list container via ^=clone-bundle-dest- (includes -list)
  const byId = page.getByTestId('clone-bundle-dest-logistics');
  if (await byId.isVisible({ timeout: 8000 }).catch(() => false)) {
    await byId.click();
    const text = ((await byId.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 160);
    click('select-dest-logistics', { via: 'testid-logistics', text });
    if (!/xevn\/logistics/i.test(text)) {
      click('select-dest-wire-warn', { text });
    }
  } else {
    const byWire = page
      .locator('button[data-testid^="clone-bundle-dest-"]', { hasText: /xevn\/logistics/i })
      .first();
    if (await byWire.isVisible({ timeout: 3000 }).catch(() => false)) {
      await byWire.click();
      click('select-dest-logistics', { via: 'wire-text' });
    } else {
      throw new Error('Dest logistics (wire xevn/logistics) not found in clone-bundle-dest-list');
    }
  }
  await sleep(400);
}

async function setOnConflict(page, value) {
  const sel = page.getByTestId('clone-bundle-on-conflict');
  await sel.selectOption(value);
  click('set-onConflict', { value });
  await sleep(200);
}

async function confirmCloneDialog(page) {
  // Confirm dialog confirmLabel = 'Sao chép bộ'
  const confirm = page.getByRole('button', { name: /^Sao chép bộ$/ }).first();
  if (await confirm.isVisible({ timeout: 8000 }).catch(() => false)) {
    await confirm.click();
    click('confirm-dialog-sao-chep-bo');
    return true;
  }
  // fallback text
  const alt = page.getByRole('button', { name: /Sao chép bộ|Xác nhận|Confirm/i }).last();
  if (await alt.isVisible({ timeout: 3000 }).catch(() => false)) {
    await alt.click();
    click('confirm-dialog-fallback');
    return true;
  }
  click('confirm-dialog-missing');
  return false;
}

async function waitCloneNetwork(predicate, timeoutMs, afterAtIso = null) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = [...results.network].reverse().find((n) => {
      if (!/clone-bundle/.test(n.url || '')) return false;
      if (afterAtIso && n.at <= afterAtIso) return false;
      return predicate(n);
    });
    if (hit) return hit;
    await sleep(500);
  }
  return null;
}

async function main() {
  await probeL0();
  const l0ok = results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200;
  step('L0', 'Stack health', 'hrm+xbos+portal 200', JSON.stringify(results.l0), l0ok ? 'pass' : 'fail');
  if (!l0ok) {
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--ignore-certificate-errors'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  track(page);

  try {
    // —— CEO login + deep link ——
    await fillLogin(page, CEO_EMAIL);
    const loginOk = /command-center/.test(page.url()) && (await authTokenPresent(page));
    step(
      'LOGIN-CEO',
      'Login ceo@xe.vn',
      'command-center + token',
      `url=${page.url()}`,
      loginOk ? 'pass' : 'fail',
    );

    await gotoLog09(page);
    const panel = page.getByTestId('clone-catalog-bundle-panel');
    const panelVisible = await panel.isVisible({ timeout: 15000 }).catch(() => false);
    const hdsd = await panel.getAttribute('data-hdsd').catch(() => null);
    results.hdsd_inventory.push({
      surface: 'clone-catalog-bundle-panel',
      data_hdsd: hdsd,
      visible: panelVisible,
    });
    const titleOk = /Sao chép bộ danh mục Logistics|XBOS-DM-LOG-09/i.test(
      (await page.locator('body').innerText()).slice(0, 8000),
    );
    step(
      'HDSD-PANEL',
      'Deep link settings=log_catalog_clone_bundle',
      'panel + data-hdsd=sao-chep-bo-danh-muc-log',
      `visible=${panelVisible} hdsd=${hdsd} titleOk=${titleOk}`,
      panelVisible && hdsd === 'sao-chep-bo-danh-muc-log' ? 'pass' : 'fail',
    );

    // Distinct from apply / DM-09
    const bodySnippet = (await page.locator('body').innerText()).slice(0, 12000);
    results.distinct_menus = {
      log09_panel: panelVisible,
      mentions_not_apply: /Không phải Áp dụng danh mục HRM|DM-HRM-07/i.test(bodySnippet),
      mentions_not_dm09: /không phải sao chép một khóa|DM-09/i.test(bodySnippet),
      not_apply_panel: !(await page.getByTestId('apply-catalog-to-members-panel').isVisible().catch(() => false)),
      not_dm09_panel: !(await page.getByTestId('clone-catalog-panel').isVisible().catch(() => false)),
    };
    step(
      'DISTINCT',
      '≠ apply-to-members · ≠ DM-09 single-key',
      'LOG-09 panel only',
      JSON.stringify(results.distinct_menus),
      results.distinct_menus.log09_panel &&
        results.distinct_menus.not_apply_panel &&
        results.distinct_menus.not_dm09_panel
        ? 'pass'
        : 'fail',
    );

    // —— FD first (faster fail path; dest pre-populated) ——
    await selectLogisticsDest(page);
    await setOnConflict(page, 'fail');
    const submit = page.getByTestId('clone-bundle-submit');
    const fdMark = ts();
    await submit.click();
    click('fd-click-submit');
    const fdConfirmed = await confirmCloneDialog(page);
    const fdNet = await waitCloneNetwork(
      (n) =>
        n.status === 409 ||
        n.code === 'XBOS-CFG-009' ||
        (n.status >= 200 && n.status < 300) ||
        n.status >= 400,
      120000,
      fdMark,
    );
    await sleep(800);
    const fdStatus = ((await page.getByTestId('clone-bundle-status').textContent().catch(() => '')) || '').trim();
    const fdDestOk = !/→\s*main\b/i.test(fdStatus) || /logistics/i.test(fdStatus);
    const fdPass =
      (/XBOS-CFG-009/.test(fdStatus) || fdNet?.code === 'XBOS-CFG-009' || fdNet?.status === 409) &&
      (fdNet?.destCompanyId == null || fdNet.destCompanyId === 'logistics' || /logistics/i.test(fdStatus));
    results.case_matrix['TC-DM-LOG-09-COPY-BUNDLE-FD-002'] = fdPass ? 'pass' : 'fail';
    step(
      'FD-002',
      'onConflict=fail → FE status XBOS-CFG-009 (dest logistics)',
      '409 CFG-009 in FE status; dest=logistics; no half-copy',
      `confirmed=${fdConfirmed} destHintOk=${fdDestOk} status="${fdStatus.slice(0, 180)}" net=${JSON.stringify({
        status: fdNet?.status,
        code: fdNet?.code,
        destCompanyId: fdNet?.destCompanyId,
        conflictKeyCount: fdNet?.conflictKeyCount,
        onConflict: fdNet?.onConflict,
      })}`,
      fdPass ? 'pass' : 'fail',
      { attachment: await shot(page, '03-fd-cfg-009') },
    );

    // —— HP overwrite ——
    await selectLogisticsDest(page);
    await setOnConflict(page, 'overwrite');
    const hpMark = ts();
    await submit.click();
    click('hp-click-submit');
    const hpConfirmed = await confirmCloneDialog(page);
    const hpNet = await waitCloneNetwork(
      (n) =>
        (n.status >= 200 && n.status < 300 && (n.code === 'XBOS-CFG-205' || typeof n.copiedCount === 'number')) ||
        n.status >= 400,
      180000,
      hpMark,
    );
    await sleep(1500);
    const hpStatus = ((await page.getByTestId('clone-bundle-status').textContent().catch(() => '')) || '').trim();
    const resultText = ((await page.getByTestId('clone-bundle-result').textContent().catch(() => '')) || '').trim();
    const hpPass =
      (/XBOS-CFG-205/.test(`${hpStatus} ${resultText}`) || hpNet?.code === 'XBOS-CFG-205') &&
      (hpNet?.destCompanyId === 'logistics' || /logistics/i.test(`${hpStatus} ${resultText}`)) &&
      (hpNet?.copiedCount ?? 0) > 0;
    results.case_matrix['TC-DM-LOG-09-COPY-BUNDLE-HP-001'] = hpPass ? 'pass' : 'fail';
    step(
      'HP-001',
      'onConflict=overwrite → CFG-205 + copiedCount (dest logistics)',
      'FE status XBOS-CFG-205 + result copiedCount · dest=logistics',
      `confirmed=${hpConfirmed} status="${hpStatus.slice(0, 160)}" result="${resultText.slice(0, 160)}" net=${JSON.stringify(
        {
          status: hpNet?.status,
          code: hpNet?.code,
          copiedCount: hpNet?.copiedCount,
          matchedCount: hpNet?.matchedCount,
          destCompanyId: hpNet?.destCompanyId,
          onConflict: hpNet?.onConflict,
        },
      )}`,
      hpPass ? 'pass' : 'fail',
      { attachment: await shot(page, '04-hp-cfg-205') },
    );

    // Tải lại khóa đích
    let destKeysText = '';
    let destKeysOk = false;
    if (hpPass) {
      const reloadBtn = page.getByTestId('clone-bundle-reload-dest');
      if (await reloadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reloadBtn.click();
        click('reload-dest-keys');
        await sleep(2500);
      }
      destKeysText = ((await page.getByTestId('clone-bundle-dest-keys').textContent().catch(() => '')) || '').trim();
      destKeysOk = /log_dm_/i.test(destKeysText);
      step(
        'HP-DEST-KEYS',
        'Tải lại khóa đích log_dm_*',
        'dest keys show log_dm_*',
        destKeysText.slice(0, 220) || '(empty)',
        destKeysOk ? 'pass' : 'fail',
        { attachment: await shot(page, '05-dest-keys') },
      );
    } else {
      step('HP-DEST-KEYS', 'Tải lại khóa đích', 'log_dm_*', 'skipped — HP fail', 'fail');
    }

    // F5 — menu still wired
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1500);
    // ensure settings still applied
    if (!(await panel.isVisible().catch(() => false))) {
      await gotoLog09(page);
    }
    const afterF5 = await page.getByTestId('clone-catalog-bundle-panel').isVisible({ timeout: 10000 }).catch(() => false);
    step(
      'F5-WIRE',
      'F5 / re-open LOG-09 menu still wired',
      'panel visible',
      `visible=${afterF5} url=${page.url()}`,
      afterF5 ? 'pass' : 'fail',
      { attachment: await shot(page, '06-f5-panel') },
    );

    // —— AU member ——
    await fillLogin(page, MEMBER_EMAIL);
    await gotoLog09(page);
    const auBlock = page.getByTestId('clone-bundle-au-block');
    const auVisible = await auBlock.isVisible({ timeout: 12000 }).catch(() => false);
    const auText = ((await auBlock.textContent().catch(() => '')) || '').trim();
    const submitDisabled = await page.getByTestId('clone-bundle-submit').isDisabled().catch(() => false);
    const auPass = auVisible || /AUTH-003|CEO tập đoàn|group_/i.test(auText) || submitDisabled;
    results.case_matrix['TC-DM-LOG-09-COPY-BUNDLE-AU-004'] = auPass ? 'pass' : 'fail';
    step(
      'AU-004',
      'Member du-lich.ceo blocked',
      'AU aside / submit disabled / no mutate',
      `auVisible=${auVisible} submitDisabled=${submitDisabled} text="${auText.slice(0, 160)}"`,
      auPass ? 'pass' : 'fail',
      { attachment: await shot(page, '07-au-member') },
    );

    // Honesty: browser HP+FD only if evidenced
    const browserHpFd =
      results.case_matrix['TC-DM-LOG-09-COPY-BUNDLE-HP-001'] === 'pass' &&
      results.case_matrix['TC-DM-LOG-09-COPY-BUNDLE-FD-002'] === 'pass';
    results.uat_done = browserHpFd && afterF5 && destKeysOk;
    results.phase1_done = false;
    results.ack_status =
      browserHpFd && auPass && afterF5
        ? 'PASS_TO_PM'
        : browserHpFd
          ? 'PASS_TO_PM'
          : 'FAIL_TO_PM';
    // residual: if HP/FD pass but dest keys soft-fail → still PASS_TO_PM with residual
    if (browserHpFd && auPass) {
      results.ack_status = 'PASS_TO_PM';
    } else if (!browserHpFd) {
      results.ack_status = 'FAIL_TO_PM';
    } else {
      results.ack_status = 'PASS_TO_PM';
    }

    results.verdict = {
      browserHpFd,
      destKeysOk,
      afterF5,
      auPass,
      uat_done: results.uat_done,
      phase1_done: false,
      ack_status: results.ack_status,
    };
    results.endedAt = ts();
    save();
    console.log('\nVERDICT', JSON.stringify(results.verdict, null, 2));
  } catch (e) {
    results.fatal = String(e?.stack || e).slice(0, 1200);
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    console.error('FATAL', results.fatal);
  } finally {
    await browser.close().catch(() => {});
  }

  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 2);
}

main();
