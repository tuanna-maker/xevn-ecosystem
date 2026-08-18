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

async function dump(name) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      sh(`"${adb}" -s ${dev} shell uiautomator dump /sdcard/${name}.xml`);
      sh(`"${adb}" -s ${dev} pull /sdcard/${name}.xml "${path.join(dir, name + '.xml')}"`);
      sh(`"${adb}" -s ${dev} shell screencap -p /sdcard/${name}.png`);
      sh(`"${adb}" -s ${dev} pull /sdcard/${name}.png "${path.join(dir, name + '.png')}"`);
      return fs.readFileSync(path.join(dir, `${name}.xml`), 'utf8');
    } catch {
      await sleep(1000);
    }
  }
  throw new Error(`dump failed: ${name}`);
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
    const bm = g('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!bm) continue;
    nodes.push({
      id: g('resource-id'),
      text: g('text'),
      desc: g('content-desc'),
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
  return Boolean(n && n.w >= minPx - 1 && n.h >= minPx - 1); // tolerate 1px density rounding
}

async function main() {
  // close any modal
  sh(`"${adb}" -s ${dev} shell input keyevent 4`);
  await sleep(500);
  sh(`"${adb}" -s ${dev} shell am start -n ${PKG}/.MainActivity`);
  await sleep(1500);

  let xml = await dump('f01-home');
  let nodes = extract(xml);
  let dong = find(nodes, (n) => n.desc === 'Đóng');
  if (dong) {
    tap(dong);
    await sleep(1000);
    xml = await dump('f01-home-closed');
    nodes = extract(xml);
  }

  // reopen FAB briefly to capture check-in row + close
  const fab = find(nodes, (n) => n.id === 'check-in-fab');
  if (tap(fab)) {
    await sleep(1200);
    xml = await dump('f02-fab-sheet');
    nodes = extract(xml);
    const sheet = find(nodes, (n) => n.id === 'fab-primary-action-sheet');
    const rowCheckIn = find(nodes, (n) => n.id === 'fab-action-check-in');
    const rowLeave = find(nodes, (n) => n.id === 'fab-action-create-leave');
    const rowAppr = find(nodes, (n) => n.id === 'fab-action-manager-approvals');
    dong = find(nodes, (n) => n.desc === 'Đóng');
    const nav = find(nodes, (n) => n.id === 'android:id/navigationBarBackground');
    const safe = find(nodes, (n) => n.id === 'tab-bar-safe-zone');
    // From home dump earlier tab content top ~2148; prefer safe.y1 - 49dp content
    const tabContentTop = safe ? safe.y1 - Math.ceil((49 * density) / 160) : 2148;
    fs.writeFileSync(
      path.join(dir, 'fab-measures.json'),
      JSON.stringify(
        {
          sheet,
          rowCheckIn,
          rowLeave,
          rowAppr,
          dong,
          nav,
          safe,
          tabContentTop,
          sheetClearsTab: sheet ? sheet.y2 <= tabContentTop + 20 : false,
          rows: [rowCheckIn, rowLeave, rowAppr, dong].filter(Boolean).map((n) => ({
            id: n.id || n.desc,
            w: n.w,
            h: n.h,
            ok: sizeOk(n),
            y2: n.y2,
          })),
        },
        null,
        2,
      ),
    );
    if (dong) tap(dong);
    else sh(`"${adb}" -s ${dev} shell input keyevent 4`);
    await sleep(1000);
    xml = await dump('f01-home2');
    nodes = extract(xml);
  }

  const checkTile = find(nodes, (n) => n.id === 'home-action-tile-checkin');
  if (!tap(checkTile)) throw new Error('checkin tile missing');
  await sleep(2500);
  xml = await dump('f03-checkin');
  nodes = extract(xml);

  // if still on home, try FAB check-in row
  if (!find(nodes, (n) => n.id === 'check-in-submit')) {
    const fab2 = find(nodes, (n) => n.id === 'check-in-fab');
    if (tap(fab2)) {
      await sleep(1000);
      xml = await dump('f02b-fab');
      nodes = extract(xml);
      const row = find(nodes, (n) => n.id === 'fab-action-check-in');
      tap(row);
      await sleep(2500);
      xml = await dump('f03-checkin');
      nodes = extract(xml);
    }
  }

  const submit = find(nodes, (n) => n.id === 'check-in-submit');
  const footer = find(nodes, (n) => n.id === 'check-in-sticky-footer');
  const nav = find(nodes, (n) => n.id === 'android:id/navigationBarBackground');
  const safe = find(nodes, (n) => n.id === 'tab-bar-safe-zone');
  const tabHome = find(nodes, (n) => n.clickable && n.desc.includes('Trang chủ'));
  const tabTop = safe ? safe.y1 - Math.ceil((49 * density) / 160) : tabHome ? tabHome.y1 : 2148;

  const checkInReport = {
    submit,
    footer,
    nav,
    safe,
    tabTop,
    submitClearsTab: submit ? submit.y2 <= tabTop + 8 : false,
    submitClearsNav: submit && nav ? submit.y2 <= nav.y1 : false,
    submitTouchOk: sizeOk(submit),
    interesting: nodes
      .filter((n) => n.id || /Chấm|check|Lịch|Hồ sơ/i.test(`${n.text}${n.desc}${n.id}`))
      .slice(0, 40),
  };
  fs.writeFileSync(path.join(dir, 'checkin-measures.json'), JSON.stringify(checkInReport, null, 2));
  console.log('CHECKIN', JSON.stringify(checkInReport, null, 2));

  // Profile
  let profile = find(nodes, (n) => n.clickable && n.desc.includes('Hồ sơ'));
  if (!profile) {
    xml = await dump('f03-tabs');
    nodes = extract(xml);
    profile = find(nodes, (n) => n.clickable && n.desc.includes('Hồ sơ'));
  }
  if (!tap(profile)) {
    sh(`"${adb}" -s ${dev} shell input tap 945 2210`);
  }
  await sleep(2500);
  xml = await dump('f04-profile');
  nodes = extract(xml);

  function seg(label) {
    const t = find(nodes, (n) => n.text === label);
    if (!t) return null;
    const parents = nodes
      .filter((n) => n.clickable && n.x1 <= t.x1 && n.y1 <= t.y1 && n.x2 >= t.x2 && n.y2 >= t.y2)
      .sort((a, b) => a.w * a.h - b.w * b.h);
    return parents[0] || t;
  }

  const hits = {
    info: seg('Thông tin'),
    work: seg('Công việc'),
    docs: seg('Tài liệu'),
  };

  let save = find(nodes, (n) => n.id === 'profile-ess-save');
  for (let i = 0; i < 12 && !save; i++) {
    sh(`"${adb}" -s ${dev} shell input swipe 540 1900 540 700 350`);
    await sleep(800);
    xml = await dump(`f04-scroll-${i}`);
    nodes = extract(xml);
    save = find(nodes, (n) => n.id === 'profile-ess-save');
  }
  if (save) await dump('f04-save');

  const nav2 = find(nodes, (n) => n.id === 'android:id/navigationBarBackground');
  const safe2 = find(nodes, (n) => n.id === 'tab-bar-safe-zone');
  const tabTop2 = safe2 ? safe2.y1 - Math.ceil((49 * density) / 160) : tabTop;

  const profileReport = {
    hits,
    segmentsTouchOk: Object.values(hits).every(sizeOk),
    save,
    saveClearsTab: save ? save.y2 <= tabTop2 + 8 : false,
    saveClearsNav: save && nav2 ? save.y2 <= nav2.y1 : false,
    saveTouchOk: sizeOk(save),
    tabTop2,
    interesting: nodes
      .filter((n) => n.id || /Thông|Công|Tài|profile|Lưu|Hồ sơ/i.test(`${n.text}${n.desc}${n.id}`))
      .slice(0, 50),
  };
  fs.writeFileSync(path.join(dir, 'profile-measures.json'), JSON.stringify(profileReport, null, 2));
  console.log('PROFILE', JSON.stringify(profileReport, null, 2));

  // Home measures from f01
  const homeXml = fs.readFileSync(path.join(dir, 'f01-home.xml'), 'utf8');
  const homeNodes = extract(homeXml);
  const avatar = find(homeNodes, (n) => n.id === 'home-top-bar-avatar');
  const notify = find(homeNodes, (n) => n.desc === 'Thông báo');
  const homeReport = {
    density,
    minPx,
    avatar,
    notify,
    avatarOk: sizeOk(avatar),
    notifyOk: sizeOk(notify),
    statusBarClear: avatar ? avatar.y1 >= 60 : false,
  };
  fs.writeFileSync(path.join(dir, 'home-measures.json'), JSON.stringify(homeReport, null, 2));
  console.log('HOME', JSON.stringify(homeReport, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
