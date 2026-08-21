#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN — C-LOGIN-ADB close attempt (U65 zero-seed)
 * PASS J-MOB-01 only on FE adb login — qa-login = FAIL for C-LOGIN-ADB close
 * SoT APK SHA256: E51C977C8672C9D4ECACC6E25727B2AE1FEA2D682E8525BD7141DEDC4F2C09C5
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  collapseDevLoginPanelIfOpen,
  devPanelExpanded,
  fillProductionLoginFields,
  findLoginFieldBounds,
} from '../../apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const PKG = 'vn.xevn.hrm.mobile';
const SERIAL = process.env.ADB_SERIAL || 'emulator-5554';
const EMAIL = process.env.QA_EMAIL || 'uat.nv0001@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'xevn-uat-2026';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r5-login';
const LOG_JSON = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r5-login-device.json';
const APK_SHA =
  process.env.APK_SHA256 ||
  'E51C977C8672C9D4ECACC6E25727B2AE1FEA2D682E8525BD7141DEDC4F2C09C5';

mkdirSync(OUT, { recursive: true });

const log = [];
const cases = [];
const note = (msg, extra = {}) => {
  const row = { t: new Date().toISOString(), msg, ...extra };
  log.push(row);
  console.log(JSON.stringify(row));
};
const record = (id, verdict, evidence, detail = '') => {
  cases.push({ id, verdict, evidence, detail });
  note('case', { id, verdict, evidence, detail });
};

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function adbSh(...args) {
  const r = spawnSync(adb, ['-s', SERIAL, ...args], {
    encoding: 'utf8',
    timeout: 90000,
    maxBuffer: 30e6,
  });
  if (r.status !== 0) throw new Error(`adb ${args.join(' ')} => ${r.status} ${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

async function dump(name) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-w4r5.xml');
  sh(`"${adb}" -s ${SERIAL} pull /sdcard/qa-w4r5.xml ${OUT}/${name}.xml`);
  const shot = spawnSync(adb, ['-s', SERIAL, 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 25e6,
  });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return readFileSync(`${OUT}/${name}.xml`, 'utf8');
}

function hasTestId(xml, id) {
  return xml.includes(`resource-id="${id}"`) || xml.includes(`resource-id="${PKG}:id/${id}"`);
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}

function homeReached(xml) {
  return texts(xml).some((t) => /Trang chủ|Chào buổi|Việc cần làm|Đồng nghiệp|Xin chào|Đi làm/i.test(t));
}

function findBounds(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = { text, desc, rid };
    if (!pred(node)) continue;
    return {
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
      text,
      desc,
      rid,
    };
  }
  return null;
}

function tap(hit) {
  if (!hit) return false;
  adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
  return true;
}

async function main() {
  note('start', {
    work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5-LOGIN',
    serial: SERIAL,
    EMAIL,
    apk_sha: APK_SHA,
  });

  adbSh('shell', 'pm', 'clear', PKG);
  await sleep(900);
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(500);
  adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
  await sleep(10000);

  let xml = await dump('cold-start');
  const emailFocused =
    /login-email/.test(xml) &&
    (xml.match(/login-email[^>]*focused="true"/) || xml.includes('login-email') && /focused="true"/.test(xml.slice(xml.indexOf('login-email'), xml.indexOf('login-email') + 800)));
  const devCollapsed = !devPanelExpanded(xml) && !hasTestId(xml, 'login-dev-base-url');
  record(
    'C-LOGIN-ADB-cold-dev-collapsed',
    devCollapsed ? 'PASS' : 'FAIL',
    'cold-start.png',
    `devExpanded=${devPanelExpanded(xml)} login-dev-base-url=${hasTestId(xml, 'login-dev-base-url')}`,
  );
  record(
    'C-LOGIN-ADB-login-email-present',
    hasTestId(xml, 'login-email') ? 'PASS' : 'FAIL',
    'cold-start.png',
    `login-email focused hint=${Boolean(emailFocused)}`,
  );

  if (devPanelExpanded(xml)) {
    collapseDevLoginPanelIfOpen(adbSh, xml);
    await sleep(800);
    xml = await dump('after-dev-collapse');
  }

  await fillProductionLoginFields(adbSh, xml, {
    email: EMAIL,
    password: PASSWORD,
    onAfterCollapse: async () => dump('login-after-collapse'),
  });
  await sleep(500);
  xml = await dump('login-filled');

  const emailNode = findLoginFieldBounds(xml, 'login-email');
  const placeholder =
    !emailNode ||
    emailNode.text === 'name@company.com' ||
    (emailNode.text && emailNode.text.includes('name@company.com'));
  record(
    'C-LOGIN-ADB-email-not-placeholder',
    placeholder ? 'FAIL' : 'PASS',
    'login-filled.png',
    `emailFieldText=${emailNode?.text ?? 'missing'}`,
  );

  if (placeholder) {
    record('J-MOB-01-login-home', 'FAIL', 'login-filled.png', 'placeholder after adb fill');
    record('C-LOGIN-ADB-close', 'OPEN', 'policy', 'FE adb fill did not bind email');
  } else {
    const btn =
      findBounds(xml, (n) => n.rid.includes('login-submit')) ||
      findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text));
    if (!btn) {
      record('J-MOB-01-login-submit', 'FAIL', 'login-filled.png', 'submit missing');
    } else {
      tap(btn);
      await sleep(12000);
      xml = await dump('post-login');
      const home = homeReached(xml);
      record(
        'J-MOB-01-login-home',
        home ? 'PASS' : 'FAIL',
        'post-login.png',
        'FE production login path only (no qa-login)',
      );
      record(
        'C-LOGIN-ADB-close',
        home ? 'PASS' : 'OPEN',
        'post-login.png',
        home ? 'FE adb login reached home' : 'submit did not reach home',
      );
    }
  }

  if (homeReached(xml)) {
    const fab =
      findBounds(xml, (n) => /Thao tác nhanh/i.test(n.desc)) ||
      findBounds(xml, (n) => /Thao tác nhanh/i.test(n.text));
    if (fab) {
      tap(fab);
      await sleep(2000);
      xml = await dump('jmob02-fab');
      const sheetOk =
        hasTestId(xml, 'fab-primary-action-sheet') || texts(xml).some((t) => /Thao tác nhanh/i.test(t));
      record('J-MOB-02-FAB-sheet', sheetOk ? 'PASS' : 'PARTIAL', 'jmob02-fab.png', `sheet=${sheetOk}`);
    } else {
      record('J-MOB-02-FAB-sheet', 'SKIP', 'post-login.png', 'optional smoke — FAB not found');
    }
  }

  record('face_live_claim', 'PASS', 'policy', 'face_live=false');
  record('remaster_done_claim', 'PASS', 'policy', 'remaster_program_done=false');
  record('qa-login-sole-path', 'PASS', 'policy', 'qa-login not used for PASS');

  const fails = cases.filter((c) => c.verdict === 'FAIL').length;
  const cLoginClose = cases.find((c) => c.id === 'C-LOGIN-ADB-close');
  let ack = fails > 0 ? 'FAIL_TO_PM' : cLoginClose?.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';

  const summary = { log, cases, ack, face_live: false, remaster_program_done: false, seed: false, apk_sha: APK_SHA };
  writeFileSync(LOG_JSON, JSON.stringify(summary, null, 2));
  note('done', { ack, fails });
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  note('fatal', { err: String(e.stack || e) });
  writeFileSync(LOG_JSON, JSON.stringify({ log, cases, fatal: String(e) }, null, 2));
  process.exit(1);
});
