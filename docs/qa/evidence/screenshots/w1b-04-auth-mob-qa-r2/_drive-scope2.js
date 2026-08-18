const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERIAL = 'emulator-5554';
const OUT = path.resolve('docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r2');
const TMP = path.join(process.env.TEMP || '/tmp', 'w1b04-ui.xml');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' });
}
function sleep(ms) {
  sh(`powershell -Command Start-Sleep -Seconds ${Math.max(1, Math.ceil(ms / 1000))}`);
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
  console.log(`${name} bytes=${fs.statSync(local).size} ts=${new Date().toISOString()}`);
}
function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter(Boolean).join(' | ');
}
function tapText(xml, label) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`);
  const all = [...xml.matchAll(new RegExp(re.source, 'g'))];
  if (!all.length) {
    console.log('MISS', label);
    return false;
  }
  const m = all[all.length - 1];
  const cx = Math.floor((+m[1] + +m[3]) / 2);
  const cy = Math.floor((+m[2] + +m[4]) / 2);
  sh(`adb -s ${SERIAL} shell input tap ${cx} ${cy}`);
  console.log('TAP', label, cx, cy);
  return true;
}

// Scroll settings to reveal quick nav
sh(`adb -s ${SERIAL} shell input swipe 540 1800 540 700 300`);
sleep(1000);
let xml = dump();
console.log('SET_SCROLL:', texts(xml));
save('37-settings-scrolled');

if (!tapText(xml, 'Phạm vi công ty')) {
  tapText(xml, 'Phạm vi đang dùng');
}
sleep(2500);
save('38-scope-full');
xml = dump();
console.log('SCOPE:', texts(xml));

const checks = {
  dang_dung: /Đang dùng/.test(xml),
  tap_doan_xe: /Tập đoàn X\.E/.test(xml),
  tap_doan_xevn: /Tập đoàn XeVN/.test(xml),
  nhan_vien: /Nhân viên/.test(xml),
  holding_slug: /\bholding\b/.test(xml),
  tenant_id_raw: /\bxevn\b/.test(xml) && /Đang dùng/.test(xml),
};
console.log('CHECKS', JSON.stringify(checks, null, 2));

// Membership list rows
const rows = [...xml.matchAll(/text="([^"]+)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)].map((r) => r[1]);
console.log('ALL_TEXTS', rows.join(' || '));

// If Lưu button visible for select, capture
if (/Lưu|Đang dùng|Chọn/.test(xml)) {
  save('39-scope-labels-closeup');
}

console.log('TS', new Date().toISOString());
