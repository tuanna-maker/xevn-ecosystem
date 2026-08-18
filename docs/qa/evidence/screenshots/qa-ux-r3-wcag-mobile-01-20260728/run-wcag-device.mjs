/**
 * QA-UX-R3-WCAG-MOBILE-01 — device measure 4 screens (emulator).
 * Assumes already logged in (qa-mobile-login-intent).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const dev = 'emulator-5554';
const dir = 'C:\\xevn-ecosystem\\docs\\qa\\evidence\\screenshots\\qa-ux-r3-wcag-mobile-01-20260728';
const PKG = 'vn.xevn.hrm.mobile';
const density = 420;
const minPx = Math.ceil((44 * density) / 160);

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function dump(name) {
  sh(`"${adb}" -s ${dev} shell uiautomator dump /sdcard/${name}.xml`);
  sh(`"${adb}" -s ${dev} pull /sdcard/${name}.xml "${path.join(dir, name + '.xml')}"`);
  // screencap via shell redirect on device then pull (PowerShell redirect corrupts PNG)
  sh(`"${adb}" -s ${dev} shell screencap -p /sdcard/${name}.png`);
  sh(`"${adb}" -s ${dev} pull /sdcard/${name}.png "${path.join(dir, name + '.png')}"`);
  return fs.readFileSync(path.join(dir, `${name}.xml`), 'utf8');
}

function extract(xml) {
  const nodes = [];
  const re = /<node([^>]+)>/g;
  let m;
  while ((m = re.exec(xml))) {
    const a = m[1];
    const g = (k) => {
      const mm = a.match(new RegExp(`${k}="([^"]*)"`));
      return mm ? mm[1] : '';
    };
    const b = g('bounds');
    const bm = b.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!bm) continue;
    nodes.push({
      text: g('text'),
      desc: g('content-desc'),
      id: g('resource-id'),
      clickable: g('clickable') === 'true',
      x1: +bm[1],
      y1: +bm[2],
      x2: +bm[3],
      y2: +bm[4],
      w: +bm[3] - +bm[1],
      h: +bm[4] - +bm[2],
    });
  }
  return nodes;
}

function find(nodes, pred) {
  return nodes.find(pred) || null;
}

function tap(n) {
  if (!n) return false;
  const x = Math.floor((n.x1 + n.x2) / 2);
  const y = Math.floor((n.y1 + n.y2) / 2);
  sh(`"${adb}" -s ${dev} shell input tap ${x} ${y}`);
  return true;
}

function sizeOk(n) {
  return n && n.w >= minPx && n.h >= minPx;
}

async function main() {
  // ensure app foreground
  sh(`"${adb}" -s ${dev} shell am start -n ${PKG}/.MainActivity`);
  await sleep(1500);

  const report = { density, minPx, screens: {} };

  // HOME
  let xml = dump('d01-home');
  let nodes = extract(xml);
  const avatar = find(nodes, (n) => n.id === 'home-top-bar-avatar');
  const notify = find(nodes, (n) => n.desc.includes('Thông báo') || n.desc.toLowerCase().includes('notification'));
  const search = find(nodes, (n) => n.desc.includes('Tìm kiếm'));
  const fab = find(nodes, (n) => n.id === 'check-in-fab');
  const navBar = find(nodes, (n) => n.id === 'android:id/navigationBarBackground');
  const tabBarCandidates = nodes.filter(
    (n) => n.clickable && n.y1 > 2000 && (n.desc || n.text) && n.w > 80 && n.h > 40,
  );
  report.screens.home = {
    avatar,
    notify,
    search,
    fab,
    navBar,
    tabBarCandidates: tabBarCandidates.slice(0, 8),
    avatarPass: sizeOk(avatar) && avatar.y1 > 40,
    notifyPass: sizeOk(notify),
    statusBarClear: avatar ? avatar.y1 >= 60 : false,
  };

  // FAB sheet
  if (!tap(fab)) throw new Error('FAB not found');
  await sleep(1200);
  xml = dump('d02-fab-sheet');
  nodes = extract(xml);
  const sheet = find(nodes, (n) => n.id === 'fab-primary-action-sheet');
  const rowCheckIn = find(nodes, (n) => n.id === 'fab-action-check-in');
  const rowLeave = find(nodes, (n) => n.id === 'fab-action-create-leave');
  const rowAppr = find(nodes, (n) => n.id === 'fab-action-manager-approvals');
  const dong = find(nodes, (n) => n.desc === 'Đóng' || n.text === 'Đóng');
  const sheetClearsNav = sheet && navBar ? sheet.y2 <= navBar.y1 - 8 : sheet && sheet.y2 <= 2330;
  // tab chrome ~49dp above nav; require sheet above tab top ≈ nav.y1 - 49*density/160
  const tabTopY = navBar ? navBar.y1 - Math.ceil((49 * density) / 160) : 2200;
  report.screens.fabSheet = {
    sheet,
    rowCheckIn,
    rowLeave,
    rowAppr,
    dong,
    tabTopY,
    sheetClearsTab: sheet ? sheet.y2 <= tabTopY : false,
    sheetClearsNav,
    rowsTouchOk: [rowCheckIn, rowLeave, rowAppr, dong].filter(Boolean).every(sizeOk),
    measures: [rowCheckIn, rowLeave, rowAppr, dong].filter(Boolean).map((n) => ({
      id: n.id || n.desc || n.text,
      w: n.w,
      h: n.h,
      y2: n.y2,
    })),
  };

  // Navigate CheckIn via FAB row
  if (!tap(rowCheckIn)) {
    // try text
    const byText = find(nodes, (n) => /Chấm công/i.test(n.text + n.desc));
    tap(byText);
  }
  await sleep(2000);
  xml = dump('d03-checkin');
  nodes = extract(xml);
  const submit = find(nodes, (n) => n.id === 'check-in-submit');
  const footer = find(nodes, (n) => n.id === 'check-in-sticky-footer');
  const navBar2 = find(nodes, (n) => n.id === 'android:id/navigationBarBackground') || navBar;
  const tabTopY2 = navBar2 ? navBar2.y1 - Math.ceil((49 * density) / 160) : tabTopY;
  report.screens.checkIn = {
    submit,
    footer,
    tabTopY: tabTopY2,
    submitClearsTab: submit ? submit.y2 <= tabTopY2 : false,
    submitClearsNav: submit && navBar2 ? submit.y2 <= navBar2.y1 : false,
    submitTouchOk: sizeOk(submit),
    interesting: nodes
      .filter((n) => n.id || /Chấm|check-in|Lịch sử/i.test(n.text + n.desc + n.id))
      .slice(0, 30)
      .map((n) => ({ id: n.id, text: n.text, desc: n.desc, w: n.w, h: n.h, y1: n.y1, y2: n.y2 })),
  };

  // Profile tab — find bottom tab by desc/text
  const profileTab =
    find(nodes, (n) => n.clickable && /Hồ sơ|Cá nhân|Profile/i.test(n.desc + n.text)) ||
    find(extract(dump('d03b-for-tabs')), (n) => n.clickable && /Hồ sơ|Cá nhân|Profile/i.test(n.desc + n.text));
  // also try common last tab position
  if (profileTab) tap(profileTab);
  else {
    // tap approximate profile tab (rightmost of 5 tabs) — screen 1080, tabs above nav
    sh(`"${adb}" -s ${dev} shell input tap 972 2260`);
  }
  await sleep(2000);
  xml = dump('d04-profile');
  nodes = extract(xml);
  const segInfo = find(nodes, (n) => n.text === 'Thông tin' || n.desc === 'Thông tin');
  const segWork = find(nodes, (n) => n.text === 'Công việc' || n.desc === 'Công việc');
  const segDocs = find(nodes, (n) => n.text === 'Tài liệu' || n.desc === 'Tài liệu');
  // segments may be parent Pressable — measure clickable parents containing these texts
  function segmentHit(label) {
    const labelNode = find(nodes, (n) => n.text === label);
    if (!labelNode) return null;
    // find clickable ancestor-like: clickable node containing label bounds
    const parents = nodes.filter(
      (n) =>
        n.clickable &&
        n.x1 <= labelNode.x1 &&
        n.y1 <= labelNode.y1 &&
        n.x2 >= labelNode.x2 &&
        n.y2 >= labelNode.y2,
    );
    // smallest area parent
    parents.sort((a, b) => a.w * a.h - b.w * b.h);
    return parents[0] || labelNode;
  }
  const hits = {
    info: segmentHit('Thông tin'),
    work: segmentHit('Công việc'),
    docs: segmentHit('Tài liệu'),
  };

  let save = find(nodes, (n) => n.id === 'profile-ess-save');
  for (let i = 0; i < 10 && !save; i++) {
    sh(`"${adb}" -s ${dev} shell input swipe 540 1900 540 700 350`);
    await sleep(700);
    xml = dump(`d04-profile-scroll-${i}`);
    nodes = extract(xml);
    save = find(nodes, (n) => n.id === 'profile-ess-save');
  }
  if (save) dump('d04-profile-save');
  const navBar3 = find(nodes, (n) => n.id === 'android:id/navigationBarBackground') || navBar2;
  const tabTopY3 = navBar3 ? navBar3.y1 - Math.ceil((49 * density) / 160) : tabTopY2;
  report.screens.profile = {
    hits,
    segLabels: { segInfo, segWork, segDocs },
    segmentsTouchOk: Object.values(hits).every(sizeOk),
    save,
    saveClearsTab: save ? save.y2 <= tabTopY3 : false,
    saveClearsNav: save && navBar3 ? save.y2 <= navBar3.y1 : false,
    saveTouchOk: sizeOk(save),
    tabTopY: tabTopY3,
    interesting: nodes
      .filter((n) => n.id || /Thông|Công|Tài|profile|Lưu|Hồ sơ/i.test(n.text + n.desc + n.id))
      .slice(0, 40)
      .map((n) => ({ id: n.id, text: n.text, desc: n.desc, click: n.clickable, w: n.w, h: n.h, y1: n.y1, y2: n.y2 })),
  };

  fs.writeFileSync(path.join(dir, 'device-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
