#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-DEPT-VAL-RET-01 — focused U65 browser retest
 * TC-CC-P0-03-DEPT-ADD-FD-001 (empty mã/tên → not 2xx / prefer XBOS-VAL-014)
 * + HP ADD regression (valid → 201 XBOS-ORG-201 + F5 sticky)
 * U65: no seed. No full E1.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-dept-val-ret.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-dept-val-ret');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = `W4DEPT-${Date.now().toString(36).slice(-5).toUpperCase()}`;

const network = [];
const click_log = [];
const steps = {};
const tcs = {};

function log(msg, extra = {}) {
  click_log.push({ at: ts(), msg, ...extra });
  console.error(`[DEPT-RET ${click_log.length}] ${msg}`, extra.note || '');
}
function record(id, verdict, summary) {
  steps[id] = { verdict, summary, at: ts() };
  console.log(`${verdict} ${id} — ${summary.slice(0, 400)}`);
}

async function shot(page, name) {
  await page.screenshot({ path: join(SCREEN, `${name}.png`), fullPage: false }).catch(() => {});
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/xbos\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      if (/\/auth\/login|\/org-units/.test(u)) {
        try {
          const j = await res.json();
          entry.code = j?.code;
          entry.message = String(j?.message || '').slice(0, 200);
        } catch {
          /* */
        }
      }
      network.push(entry);
    } catch {
      /* */
    }
  });
}

async function clearAuth(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
}

async function fillLogin(page, email, password) {
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill('');
  await emailInput.fill(email);
  await passInput.fill('');
  await passInput.fill(password);
}

async function main() {
  // L0 probe
  const l0 = {};
  for (const [k, url] of [
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      l0[k] = r.status;
    } catch (e) {
      l0[k] = `ERR:${e?.cause?.code || e.message}`;
    }
  }
  console.log('L0', JSON.stringify(l0));
  if (l0.xbos !== 200 && typeof l0.xbos === 'string') {
    writeFileSync(
      OUT,
      JSON.stringify({ work_item_id: 'PO-UC-TC-W4-QA-DEPT-VAL-RET-01', l0, blocked: true }, null, 2),
    );
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  try {
    await clearAuth(page);
    await fillLogin(page, EMAIL, PASSWORD);
    const beforeLogin = network.length;
    await page.locator('button[type="submit"]').filter({ hasText: /Đăng nhập/i }).click();
    log('LOGIN_CEO');
    await sleep(3000);
    const loginNet = network.slice(beforeLogin).filter((n) => /\/auth\/login/.test(n.url));
    const onCc = /command-center/i.test(page.url());
    record(
      'LOGIN',
      loginNet.some((n) => n.status < 300) && onCc ? 'PASS' : 'FAIL',
      `login=${loginNet.map((n) => `${n.status}:${n.code}`).join(',')} url=${page.url()}`,
    );
    await shot(page, '01-cc');

    // HDSD: Command Center → Phòng/Ban
    await page.goto(`${PORTAL}/command-center?settings=tenant_departments`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    await shot(page, '02-dept-open');
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    const treeUi = /Phòng\/Ban|Thêm dòng phòng ban|Thêm phòng ban/i.test(body);
    tcs['TC-CC-P0-03-DEPT-TREE-HP-001'] = treeUi ? 'PASS' : 'FAIL';
    record('DEPT-TREE', tcs['TC-CC-P0-03-DEPT-TREE-HP-001'], `ui=${treeUi}`);

    // FD: empty mã/tên → Lưu — expect NOT 2xx; prefer 400 XBOS-VAL-014
    await page.locator('button').filter({ hasText: /\+?\s*Thêm dòng phòng ban/i }).first().click();
    log('DEPT_ADD_BLANK');
    await sleep(700);
    // ensure blank (no invent)
    const codeInputs = page.locator('input[aria-label="Mã phòng ban"]');
    const nameInputs = page.locator('input[aria-label="Tên phòng ban"]');
    let last = (await codeInputs.count()) - 1;
    if (last >= 0) {
      await codeInputs.nth(last).fill('');
      await nameInputs.nth(last).fill('');
      const c0 = await codeInputs.nth(last).inputValue();
      const n0 = await nameInputs.nth(last).inputValue();
      log('DEPT_BLANK_STATE', { note: `code="${c0}" name="${n0}"` });
    }
    const beforeFd = network.length;
    await page.locator('button[title="Lưu dòng"]').last().click();
    log('DEPT_FD_SAVE');
    await sleep(2000);
    await shot(page, '03-dept-fd');
    const fdPosts = network
      .slice(beforeFd)
      .filter((n) => /org-units/.test(n.url) && (n.method === 'POST' || n.method === 'PUT'));
    const fd2xx = fdPosts.filter((n) => n.status >= 200 && n.status < 300);
    const fdVal014 = fdPosts.some((n) => n.status === 400 && n.code === 'XBOS-VAL-014');
    const fd4xx = fdPosts.some((n) => n.status >= 400 && n.status < 500);
    const noNet = fdPosts.length === 0; // FE client block also acceptable if no invent
    const fdPass = (fdVal014 || (fd4xx && fd2xx.length === 0) || (noNet && fd2xx.length === 0)) && fd2xx.length === 0;
    tcs['TC-CC-P0-03-DEPT-ADD-FD-001'] = fdPass ? 'PASS' : 'FAIL';
    record(
      'DEPT-ADD-FD',
      tcs['TC-CC-P0-03-DEPT-ADD-FD-001'],
      `posts=${fdPosts.map((p) => `${p.method}:${p.status}:${p.code}`).join('|') || 'none'} val014=${fdVal014} no2xx=${fd2xx.length === 0}`,
    );

    // HP: valid mã/tên → 201 XBOS-ORG-201 + F5
    const code = `QA-DEPT-${stamp}`;
    const name = `QA Dept ${stamp}`;
    await page.locator('button').filter({ hasText: /\+?\s*Thêm dòng phòng ban/i }).first().click();
    await sleep(600);
    last = (await codeInputs.count()) - 1;
    await codeInputs.nth(last).fill(code);
    await nameInputs.nth(last).fill(name);
    const filledCode = await codeInputs.nth(last).inputValue();
    const filledName = await nameInputs.nth(last).inputValue();
    log('DEPT_FILL', { note: `${filledCode}/${filledName}` });
    const beforeHp = network.length;
    await page.locator('button[title="Lưu dòng"]').nth(last).click();
    log('DEPT_HP_SAVE');
    await sleep(2500);
    await shot(page, '04-dept-hp');
    const hpPosts = network
      .slice(beforeHp)
      .filter((n) => /org-units/.test(n.url) && (n.method === 'POST' || n.method === 'PUT'));
    const hpPost = hpPosts.pop();
    const hpOk =
      hpPost &&
      hpPost.status >= 200 &&
      hpPost.status < 300 &&
      (hpPost.code === 'XBOS-ORG-201' || hpPost.status === 201 || hpPost.status === 200);

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1500);
    await page.goto(`${PORTAL}/command-center?settings=tenant_departments`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    const after = await page.locator('body').innerText();
    const f5Ok = after.includes(code);
    await shot(page, '05-dept-f5');
    tcs['TC-CC-P0-03-DEPT-ADD-HP-001'] =
      hpOk && filledCode === code && f5Ok ? 'PASS' : hpOk ? 'PARTIAL' : 'FAIL';
    record(
      'DEPT-ADD-HP',
      tcs['TC-CC-P0-03-DEPT-ADD-HP-001'],
      `post=${hpPost?.status} code=${hpPost?.code} msg=${(hpPost?.message || '').slice(0, 80)} filled=${filledCode} f5=${f5Ok}`,
    );

    // cleanup best-effort (delete created row) — not scored
    if (f5Ok) {
      try {
        const count = await codeInputs.count();
        let idx = -1;
        for (let i = 0; i < count; i++) {
          if ((await codeInputs.nth(i).inputValue()) === code) {
            idx = i;
            break;
          }
        }
        if (idx >= 0) {
          page.once('dialog', (d) => d.accept().catch(() => {}));
          await page.locator('button[title="Xóa dòng"]').nth(idx).click();
          await sleep(800);
          const confirm = page
            .locator('[role="alertdialog"] button, button')
            .filter({ hasText: /Xóa|Đồng ý|Confirm|Xác nhận/i })
            .first();
          if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) await confirm.click();
          await sleep(1000);
          log('DEPT_CLEANUP');
        }
      } catch {
        /* */
      }
    }

    const fail = Object.values(tcs).some((v) => v === 'FAIL');
    const partial = Object.values(tcs).some((v) => v === 'PARTIAL');
    const overall = fail ? 'FAIL' : partial ? 'PARTIAL' : 'PASS';

    const result = {
      work_item_id: 'PO-UC-TC-W4-QA-DEPT-VAL-RET-01',
      at: ts(),
      portal: PORTAL,
      xbos: XBOS,
      l0,
      stamp,
      overall,
      tcs,
      steps,
      click_log,
      network_org: network.filter((n) => /org-units|\/auth\/login/.test(n.url)),
      hdsd_align: {
        menu: 'Command Center → settings=tenant_departments (Phòng/Ban)',
        buttons: ['Thêm dòng phòng ban', 'Lưu dòng'],
        inventory: ['TC-CC-P0-03-DEPT-ADD-FD-001', 'TC-CC-P0-03-DEPT-ADD-HP-001'],
      },
      u65_zero_seed: true,
      fd_detail: {
        posts: fdPosts,
        prefer_val014: fdVal014,
        no_2xx: fd2xx.length === 0,
      },
      hp_detail: {
        code,
        name,
        post: hpPost || null,
        f5: f5Ok,
      },
    };
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log('OVERALL', overall);
    console.log('OUT', OUT);
    await browser.close();
    process.exit(fail ? 1 : 0);
  } catch (e) {
    writeFileSync(
      OUT,
      JSON.stringify(
        {
          work_item_id: 'PO-UC-TC-W4-QA-DEPT-VAL-RET-01',
          error: String(e?.stack || e),
          network: network.slice(-40),
          click_log,
          tcs,
        },
        null,
        2,
      ),
    );
    await browser.close().catch(() => {});
    console.error(e);
    process.exit(3);
  }
}

main();
