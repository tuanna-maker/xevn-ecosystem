/**
 * Settings → scroll → tap settings-scope-link / Phạm vi công ty → assert Scope labels.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const adb = path.join(
  process.env.LOCALAPPDATA || '',
  'Android',
  'Sdk',
  'platform-tools',
  'adb.exe',
);
const S = process.env.ANDROID_SERIAL || 'emulator-5554';
const TMP = process.env.TEMP || '/tmp';

function sh(args) {
  return execSync(`"${adb}" -s ${S} ${args}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024,
  });
}
function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin */
  }
}
function dump(name) {
  const local = path.join(TMP, name);
  sh('shell uiautomator dump /sdcard/uidump.xml');
  sh(`pull /sdcard/uidump.xml "${local}"`);
  return fs.readFileSync(local, 'utf8');
}
function nodes(xml) {
  return xml
    .split('<node ')
    .slice(1)
    .map((chunk) => {
      const t = ((chunk.match(/text="([^"]*)"/) || [])[1] || '').replace(/&#10;/g, '\n');
      const d = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
      const r = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
      const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
      if (!b) return null;
      return {
        text: t,
        desc: d,
        rid: r,
        clickable: /clickable="true"/.test(chunk),
        x: Math.floor((+b[1] + +b[3]) / 2),
        y: Math.floor((+b[2] + +b[4]) / 2),
        y1: +b[2],
        y2: +b[4],
      };
    })
    .filter(Boolean);
}
function tap(n) {
  sh(`shell input tap ${n.x} ${n.y}`);
}

// dismiss overlays
sh('shell input keyevent 4');
sleep(600);
sh('shell input keyevent 4');
sleep(600);

let xml = dump('w1b04-scroll-0.xml');
// reopen settings if lost
if (!nodes(xml).some((n) => n.text === 'Đăng xuất' || /SecureStore/.test(n.text))) {
  const profile = nodes(xml).find((n) => n.text === 'Hồ sơ' || n.desc === 'Hồ sơ');
  if (profile) {
    tap(profile);
    sleep(1500);
    xml = dump('w1b04-scroll-profile.xml');
  }
  const settings = nodes(xml).find((n) => n.text === 'Cài đặt' || n.desc === 'Cài đặt');
  if (settings) {
    tap(settings);
    sleep(1500);
    xml = dump('w1b04-scroll-settings.xml');
  }
}

// Scroll settings content up so "Điều hướng nhanh" rows clear the bottom tab (~2200+)
for (let i = 0; i < 4; i++) {
  sh('shell input swipe 540 1600 540 700 350');
  sleep(700);
}
xml = dump('w1b04-scroll-after.xml');

const clickables = nodes(xml).filter((n) => n.clickable);
console.log(
  'clickables',
  clickables.map((n) => ({
    t: n.text.slice(0, 48),
    d: n.desc.slice(0, 48),
    r: n.rid,
    y: n.y,
  })),
);

const scopeLink =
  nodes(xml).find((n) => n.rid.includes('settings-scope-link')) ||
  nodes(xml).find((n) => n.desc === 'settings-scope-link') ||
  nodes(xml).find(
    (n) =>
      n.clickable &&
      (n.desc === 'Phạm vi công ty' || n.text === 'Phạm vi công ty') &&
      n.y < 2100,
  ) ||
  nodes(xml).find((n) => n.clickable && /Phạm vi công ty/.test(n.desc + n.text) && n.y < 2100);

if (!scopeLink) {
  // last resort: tap text node parent area slightly above bottom tab
  const textNode = nodes(xml).find((n) => n.text === 'Phạm vi công ty');
  console.log('fallback textNode', textNode);
  if (!textNode) {
    console.error('scope link not found after scroll');
    process.exit(2);
  }
  sh(`shell input tap ${textNode.x} ${Math.min(textNode.y, 2000)}`);
} else {
  console.log('tapping scopeLink', scopeLink);
  tap(scopeLink);
}
sleep(3000);
xml = dump('w1b04-scope-after-scroll.xml');
const texts = nodes(xml)
  .map((n) => n.text)
  .filter(Boolean);
fs.writeFileSync(path.join(TMP, 'w1b04-scope-assert.txt'), texts.join('\n'), 'utf8');
const joined = texts.join('\n');
const result = {
  sample: texts.filter((t) =>
    /Công ty|Pháp|Vai|Chức|Tenant|Đang|holding|xevn|Phạm|Query|Header/i.test(t),
  ),
  has_dang_dung: /Đang dùng/.test(joined),
  has_phap_nhan: /Pháp nhân/.test(joined),
  has_vai_tro: /Vai trò/.test(joined),
  has_chuc_danh: /Chức danh/.test(joined),
  has_cong_ty_line: /Công ty:/.test(joined),
  stale_Tenant_colon: /Tenant:\s*xevn/i.test(joined),
  pass:
    /Đang dùng/.test(joined) &&
    /Pháp nhân/.test(joined) &&
    /Vai trò/.test(joined) &&
    /Chức danh/.test(joined) &&
    /Công ty:/.test(joined) &&
    !/Tenant:\s*xevn/i.test(joined),
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.pass ? 0 : 1);
