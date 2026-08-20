#!/usr/bin/env node
/**
 * R-SPINE-AT-NAV-01-QA — device retest AT-01 HDSD entries → CreateUpdateRequest
 * U65 zero-seed · nav-only PASS (optional submit)
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/r-spine-at-nav-01-qa';
const LOG = 'docs/qa/evidence/r-spine-at-nav-01-qa-_device-log.json';
mkdirSync(OUT, { recursive: true });

const log = [];
const note = (msg, extra = {}) => {
  const row = { t: new Date().toISOString(), msg, ...extra };
  log.push(row);
  console.log(JSON.stringify(row));
};
const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

async function dump(n, attempts = 6) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = spawnSync(
        adb,
        ['-s', 'emulator-5554', 'shell', 'uiautomator', 'dump', '/sdcard/qa-at-nav.xml'],
        { encoding: 'utf8', timeout: 20000 },
      );
      if (r.status !== 0) throw new Error(`dump status ${r.status} ${r.stderr || ''}`);
      sh(`"${adb}" -s emulator-5554 pull /sdcard/qa-at-nav.xml ${OUT}/${n}.xml`);
      const shot = spawnSync(adb, ['-s', 'emulator-5554', 'exec-out', 'screencap', '-p'], {
        encoding: 'buffer',
        maxBuffer: 25e6,
      });
      if (shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
      return readFileSync(`${OUT}/${n}.xml`, 'utf8');
    } catch (e) {
      lastErr = e;
      await sleep(1200);
    }
  }
  throw lastErr;
}

function findByTestId(xml, testId) {
  const e = testId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(
      `resource-id="[^"]*${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    ),
    new RegExp(
      `content-desc="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    ),
    new RegExp(`${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
  ];
  for (const re of patterns) {
    const m = xml.match(re);
    if (m) {
      return {
        x: Math.floor((+m[1] + +m[3]) / 2),
        y: Math.floor((+m[2] + +m[4]) / 2),
        via: 'testid',
        testId,
      };
    }
  }
  return null;
}

function tapText(xml, t, doTap = true) {
  const e = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let m = xml.match(
    new RegExp(`text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
  );
  if (!m) {
    m = xml.match(
      new RegExp(
        `content-desc="[^"]*${e}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
      ),
    );
  }
  if (!m) return null;
  const hit = {
    x: Math.floor((+m[1] + +m[3]) / 2),
    y: Math.floor((+m[2] + +m[4]) / 2),
    t,
  };
  if (doTap) sh(`"${adb}" -s emulator-5554 shell input tap ${hit.x} ${hit.y}`);
  return hit;
}

function tapHit(hit) {
  if (!hit) return false;
  sh(`"${adb}" -s emulator-5554 shell input tap ${hit.x} ${hit.y}`);
  return true;
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
}

function isCreateForm(xml) {
  return (
    xml.includes('Đơn công') &&
    (xml.includes('Loại điều chỉnh') || xml.includes('Lý do') || xml.includes('Gửi đơn'))
  );
}

function isAppForeground(xml) {
  return xml.includes(PKG) || xml.includes('Trang chủ') || xml.includes('XeVN') || xml.includes('Hồ sơ');
}

function isLauncher(xml) {
  return xml.includes('nexuslauncher') || xml.includes('com.android.launcher');
}

function hasLeaveFab(xml) {
  return xml.includes('Tạo đơn nghỉ');
}

function hasUpdateFab(xml) {
  return xml.includes('Tạo đơn công');
}

async function ensureApp() {
  let xml = await dump('ensure-pre');
  if (isAppForeground(xml) && !isLauncher(xml)) return xml;
  note('relaunch app');
  sh(
    `"${adb}" -s emulator-5554 shell am start -n ${PKG}/.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER`,
  );
  await sleep(2500);
  xml = await dump('ensure-launch');
  if (isLauncher(xml) || !isAppForeground(xml)) {
    // deep login again
    const login = spawnSync(
      process.execPath,
      [
        'scripts/_tmp-po-spine-login.mjs',
        '--email',
        'uat.nv0001@xe.vn',
        '--password',
        'xevn-uat-2026',
      ],
      { encoding: 'utf8' },
    );
    note('re-login', { status: login.status, out: (login.stdout || '').slice(0, 300) });
    if (login.status !== 0) throw new Error('re-login failed');
    await sleep(1500);
    xml = await dump('ensure-relogin');
  }
  return xml;
}

async function goHomeTab() {
  await ensureApp();
  let xml = await dump('home-pre');
  const hit = tapText(xml, 'Trang chủ') || findByTestId(xml, 'tab-home');
  if (hit && !hit.t) tapHit(hit);
  await sleep(1200);
  xml = await dump('home');
  // dismiss open sheet if any
  if (xml.includes('Thao tác nhanh')) {
    tapText(xml, 'Đóng');
    await sleep(800);
    xml = await dump('home-dismiss-sheet');
  }
  return xml;
}

async function leaveFormToHome() {
  let xml = await dump('leave-form-pre');
  if (isCreateForm(xml)) {
    // prefer header back / tab home — avoid double BACK exiting app
    const home = tapText(xml, 'Trang chủ');
    if (!home) {
      sh(`"${adb}" -s emulator-5554 shell input keyevent 4`);
      await sleep(900);
    } else {
      await sleep(900);
    }
  }
  xml = await goHomeTab();
  return xml;
}

async function openFabSheet() {
  let xml = await dump('fab-pre');
  let hit = findByTestId(xml, 'check-in-fab') || tapText(xml, 'Thao tác nhanh', false);
  if (hit) tapHit(hit);
  else sh(`"${adb}" -s emulator-5554 shell input tap 980 2100`);
  await sleep(1500);
  xml = await dump('fab-sheet');
  note('fab-sheet', {
    leave: hasLeaveFab(xml),
    update: hasUpdateFab(xml),
    texts: texts(xml).slice(0, 40),
  });
  return xml;
}

async function pathFab() {
  note('PATH1 start FAB → Tạo đơn công');
  let xml = await goHomeTab();
  xml = await openFabSheet();
  const leaveOk = hasLeaveFab(xml);
  const updateVisible = hasUpdateFab(xml);
  let hit =
    findByTestId(xml, 'fab-action-create-update-request') ||
    tapText(xml, 'Tạo đơn công', false);
  if (!hit) {
    note('PATH1 FAIL no Tạo đơn công in sheet');
    return { pass: false, leaveOk, updateVisible, form: false };
  }
  tapHit(hit);
  await sleep(2000);
  xml = await dump('p1-create-form');
  const form = isCreateForm(xml);
  note('PATH1 result', { leaveOk, updateVisible, form, texts: texts(xml).slice(0, 30) });
  await leaveFormToHome();
  return { pass: leaveOk && updateVisible && form, leaveOk, updateVisible, form };
}

async function pathHubLate() {
  note('PATH2 start hub Đi muộn');
  let xml = await goHomeTab();
  for (let i = 0; i < 5; i++) {
    // prefer a11y label from Pressable
    let hit =
      findByTestId(xml, 'attendance-stat-late') ||
      tapText(xml, 'Đi muộn, tạo đơn công', false) ||
      tapText(xml, 'Đi muộn', false);
    if (hit) {
      tapHit(hit);
      await sleep(2000);
      xml = await dump('p2-after-late');
      const form = isCreateForm(xml);
      note('PATH2 result', { form, texts: texts(xml).slice(0, 30) });
      await leaveFormToHome();
      return { pass: form, form };
    }
    // stats often mid-page — swipe up a bit (content up = finger down→up)
    sh(`"${adb}" -s emulator-5554 shell input swipe 540 1400 540 900 300`);
    await sleep(700);
    xml = await dump(`p2-scroll-${i}`);
    note('p2 scroll', { hasLate: xml.includes('Đi muộn'), texts: texts(xml).slice(0, 20) });
  }
  note('PATH2 FAIL no Đi muộn');
  return { pass: false, form: false };
}

async function pathSettings() {
  note('PATH3 start Settings Đơn công');
  let xml = await goHomeTab();
  let hit = tapText(xml, 'Hồ sơ', false) || findByTestId(xml, 'tab-profile');
  if (!hit) {
    note('PATH3 FAIL no Hồ sơ tab');
    return { pass: false, form: false };
  }
  tapHit(hit);
  await sleep(1500);
  xml = await dump('p3-profile');
  hit = tapText(xml, 'Cài đặt', false);
  if (!hit) {
    // scroll profile for settings entry
    for (let i = 0; i < 3 && !hit; i++) {
      sh(`"${adb}" -s emulator-5554 shell input swipe 540 1700 540 800 300`);
      await sleep(600);
      xml = await dump(`p3-profile-scroll-${i}`);
      hit = tapText(xml, 'Cài đặt', false);
    }
  }
  if (!hit) {
    note('PATH3 FAIL no Cài đặt', { texts: texts(xml).slice(0, 40) });
    return { pass: false, form: false };
  }
  tapHit(hit);
  await sleep(1500);
  xml = await dump('p3-settings');
  for (let i = 0; i < 5; i++) {
    hit =
      findByTestId(xml, 'settings-create-update-request') ||
      tapText(xml, 'Đơn công', false);
    if (hit) {
      tapHit(hit);
      await sleep(2000);
      xml = await dump('p3-create-form');
      const form = isCreateForm(xml);
      note('PATH3 result', { form, texts: texts(xml).slice(0, 30) });
      await leaveFormToHome();
      return { pass: form, form };
    }
    sh(`"${adb}" -s emulator-5554 shell input swipe 540 1800 540 900 300`);
    await sleep(600);
    xml = await dump(`p3-scroll-${i}`);
    note('settings scroll', { texts: texts(xml).slice(0, 40) });
  }
  note('PATH3 FAIL no Đơn công');
  return { pass: false, form: false };
}

// --- login ---
const login = spawnSync(
  process.execPath,
  [
    'scripts/_tmp-po-spine-login.mjs',
    '--email',
    'uat.nv0001@xe.vn',
    '--password',
    'xevn-uat-2026',
  ],
  { encoding: 'utf8' },
);
console.log(login.stdout);
if (login.status !== 0) {
  note('login FAIL', { status: login.status, stderr: (login.stderr || '').slice(0, 500) });
  writeFileSync(LOG, JSON.stringify({ pass: false, log }, null, 2));
  process.exit(2);
}
await sleep(1500);

const p1 = await pathFab();
const p2 = await pathHubLate();
const p3 = await pathSettings();

const summary = {
  work_item_id: 'R-SPINE-AT-NAV-01-QA',
  pass: Boolean(p1.pass && p2.pass && p3.pass),
  paths: { fab: p1, hub_late: p2, settings: p3 },
  log,
  out: OUT,
};
writeFileSync(LOG, JSON.stringify(summary, null, 2));
console.log(
  JSON.stringify({
    t: new Date().toISOString(),
    msg: 'SUMMARY',
    pass: summary.pass,
    paths: summary.paths,
  }),
);
process.exit(summary.pass ? 0 : 1);
