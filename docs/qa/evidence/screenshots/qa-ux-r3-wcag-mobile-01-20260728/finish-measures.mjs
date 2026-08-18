import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const dev = 'emulator-5554';
const dir = 'C:\\xevn-ecosystem\\docs\\qa\\evidence\\screenshots\\qa-ux-r3-wcag-mobile-01-20260728';
const density = 420;
const minPx = Math.ceil((44 * density) / 160);

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

async function dump(name) {
  for (let i = 0; i < 5; i++) {
    try {
      sh(`"${adb}" -s ${dev} shell uiautomator dump /sdcard/${name}.xml`);
      await sleep(300);
      sh(`"${adb}" -s ${dev} pull /sdcard/${name}.xml "${path.join(dir, name + '.xml')}"`);
      sh(`"${adb}" -s ${dev} shell screencap -p /sdcard/${name}.png`);
      sh(`"${adb}" -s ${dev} pull /sdcard/${name}.png "${path.join(dir, name + '.png')}"`);
      return fs.readFileSync(path.join(dir, `${name}.xml`), 'utf8');
    } catch {
      await sleep(800);
    }
  }
  throw new Error(`dump failed ${name}`);
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
  sh(
    `"${adb}" -s ${dev} shell input tap ${Math.floor((n.x1 + n.x2) / 2)} ${Math.floor((n.y1 + n.y2) / 2)}`,
  );
  return true;
}

function sizeOk(n) {
  return Boolean(n && n.w >= minPx - 1 && n.h >= minPx - 1);
}

async function main() {
  // dismiss leftover permission if any
  let xml = await dump('g03-checkin');
  let nodes = extract(xml);
  const deny = find(nodes, (n) => n.id.includes('permission_deny') || n.text.includes('Don’t allow') || n.text.includes("Don't allow"));
  const allow = find(nodes, (n) => n.id.includes('permission_allow_foreground'));
  if (deny || allow) {
    tap(deny || allow);
    await sleep(1500);
    xml = await dump('g03-checkin');
    nodes = extract(xml);
  }

  const submit = find(nodes, (n) => n.id === 'check-in-submit');
  const footer = find(nodes, (n) => n.id === 'check-in-sticky-footer');
  const history = find(nodes, (n) => n.id === 'check-in-history');
  const nav = find(nodes, (n) => n.id === 'android:id/navigationBarBackground');
  const safe = find(nodes, (n) => n.id === 'tab-bar-safe-zone');
  const tab = find(nodes, (n) => n.clickable && n.desc.includes('Trang chủ'));
  const tabTop = tab ? tab.y1 : safe ? safe.y1 - Math.ceil((49 * density) / 160) : 2148;

  const checkIn = {
    submit,
    footer,
    history,
    nav,
    safe,
    tabTop,
    submitClearsTab: submit ? submit.y2 <= tabTop : false,
    historyClearsTab: history ? history.y2 <= tabTop : false,
    submitTouchOk: sizeOk(submit),
    gapSubmitToTab: submit ? tabTop - submit.y2 : null,
  };
  fs.writeFileSync(path.join(dir, 'checkin-final.json'), JSON.stringify(checkIn, null, 2));
  console.log('CHECKIN', JSON.stringify(checkIn, null, 2));

  // Profile tab
  const profile = find(nodes, (n) => n.clickable && n.desc.includes('Hồ sơ'));
  if (!tap(profile)) sh(`"${adb}" -s ${dev} shell input tap 945 2210`);
  await sleep(2500);
  xml = await dump('g04-profile');
  nodes = extract(xml);

  function seg(label) {
    const t = find(nodes, (n) => n.text === label);
    if (!t) return null;
    const parents = nodes
      .filter((n) => n.clickable && n.x1 <= t.x1 && n.y1 <= t.y1 && n.x2 >= t.x2 && n.y2 >= t.y2)
      .sort((a, b) => a.w * a.h - b.w * b.h);
    return parents[0] || t;
  }

  let hits = {
    info: seg('Thông tin'),
    work: seg('Công việc'),
    docs: seg('Tài liệu'),
  };

  // if not on profile yet, retry
  if (!hits.info) {
    sh(`"${adb}" -s ${dev} shell input tap 945 2210`);
    await sleep(2000);
    xml = await dump('g04-profile-retry');
    nodes = extract(xml);
    hits = { info: seg('Thông tin'), work: seg('Công việc'), docs: seg('Tài liệu') };
  }

  let save = find(nodes, (n) => n.id === 'profile-ess-save');
  for (let i = 0; i < 12 && !save; i++) {
    sh(`"${adb}" -s ${dev} shell input swipe 540 1900 540 700 350`);
    await sleep(700);
    xml = await dump(`g04-scroll-${i}`);
    nodes = extract(xml);
    save = find(nodes, (n) => n.id === 'profile-ess-save');
    // re-read segments from first dump if needed
  }
  if (save) await dump('g04-save');

  const nav2 = find(nodes, (n) => n.id === 'android:id/navigationBarBackground');
  const safe2 = find(nodes, (n) => n.id === 'tab-bar-safe-zone');
  const tab2 = find(nodes, (n) => n.clickable && n.desc.includes('Trang chủ'));
  const tabTop2 = tab2 ? tab2.y1 : safe2 ? safe2.y1 - Math.ceil((49 * density) / 160) : tabTop;

  const profileReport = {
    hits,
    segmentsTouchOk: Object.values(hits).every(sizeOk),
    save,
    saveClearsTab: save ? save.y2 <= tabTop2 : false,
    saveTouchOk: sizeOk(save),
    tabTop2,
    gapSaveToTab: save ? tabTop2 - save.y2 : null,
    interesting: nodes
      .filter((n) => n.id || /Thông|Công|Tài|profile|Lưu|Hồ sơ/i.test(`${n.text}${n.desc}${n.id}`))
      .slice(0, 40)
      .map((n) => ({ id: n.id, text: n.text, desc: n.desc, w: n.w, h: n.h, y1: n.y1, y2: n.y2, click: n.clickable })),
  };
  fs.writeFileSync(path.join(dir, 'profile-final.json'), JSON.stringify(profileReport, null, 2));
  console.log('PROFILE', JSON.stringify(profileReport, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
