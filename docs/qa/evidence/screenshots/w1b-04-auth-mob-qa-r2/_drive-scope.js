const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERIAL = 'emulator-5554';
const OUT = path.resolve('docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r2');
const TMP = path.join(process.env.TEMP || '/tmp', 'w1b04-ui.xml');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' });
}

function dump() {
  sh(`adb -s ${SERIAL} shell uiautomator dump /sdcard/w1b04-ui.xml`);
  sh(`adb -s ${SERIAL} pull /sdcard/w1b04-ui.xml "${TMP}"`);
  return fs.readFileSync(TMP, 'utf8');
}

function save(name) {
  sh(`adb -s ${SERIAL} shell screencap -p /sdcard/${name}.png`);
  const local = path.join(OUT, `${name}.png`);
  sh(`adb -s ${SERIAL} pull /sdcard/${name}.png "${local}"`);
  const st = fs.statSync(local);
  console.log(`${name} bytes=${st.size} ts=${new Date().toISOString()}`);
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter(Boolean).join(' | ');
}

function tapText(xml, label) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`);
  const m = xml.match(re);
  if (!m) {
    console.log('MISS', label);
    return false;
  }
  const cx = Math.floor((+m[1] + +m[3]) / 2);
  const cy = Math.floor((+m[2] + +m[4]) / 2);
  sh(`adb -s ${SERIAL} shell input tap ${cx} ${cy}`);
  console.log('TAP', label, cx, cy);
  return true;
}

function sleep(ms) {
  const sec = Math.max(1, Math.ceil(ms / 1000));
  sh(`powershell -Command Start-Sleep -Seconds ${sec}`);
}

// Profile tab
sh(`adb -s ${SERIAL} shell input tap 860 2220`);
sleep(2000);
let xml = dump();
console.log('P:', texts(xml));
tapText(xml, 'Cài đặt');
sleep(2000);
save('33-settings');
xml = dump();
console.log('S:', texts(xml));

if (!tapText(xml, 'Phạm vi')) {
  const m = xml.match(/text="([^"]*Phạm vi[^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (m) {
    const cx = Math.floor((+m[2] + +m[4]) / 2);
    const cy = Math.floor((+m[3] + +m[5]) / 2);
    sh(`adb -s ${SERIAL} shell input tap ${cx} ${cy}`);
    console.log('TAP contains', m[1], cx, cy);
  } else {
    const rows = [...xml.matchAll(/text="([^"]+)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)];
    console.log(
      'ROWS',
      rows
        .slice(0, 25)
        .map((r) => `${r[1]}@${r[2]},${r[3]}`)
        .join(' ; '),
    );
  }
}
sleep(2000);
save('34-scope');
xml = dump();
console.log('SCOPE:', texts(xml));

// If scope loaded, capture Đang dùng labels and try select membership if multiple
const hasDangDung = /Đang dùng/.test(xml);
console.log('HAS_DANG_DUNG', hasDangDung);
if (hasDangDung) {
  save('35-scope-dang-dung');
}

// Try tap a non-active membership row title if present (company labels)
const companyCandidates = [...xml.matchAll(/text="(Tập đoàn[^"]*|Công ty[^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)];
console.log(
  'COMPANY_ROWS',
  companyCandidates.map((r) => r[1]).join(' | '),
);
if (companyCandidates.length > 1) {
  const target = companyCandidates[companyCandidates.length - 1];
  const cx = Math.floor((+target[2] + +target[4]) / 2);
  const cy = Math.floor((+target[3] + +target[5]) / 2);
  sh(`adb -s ${SERIAL} shell input tap ${cx} ${cy}`);
  console.log('TAP membership', target[1], cx, cy);
  sleep(3000);
  save('36-select-membership');
  xml = dump();
  console.log('AFTER_SELECT:', texts(xml));
}

console.log('TS', new Date().toISOString());
