/**
 * From a signed-in session: open Settings → Phạm vi công ty and assert W1-B-04 labels.
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
  return xml.split('<node ').slice(1).map((chunk) => {
    const t = ((chunk.match(/text="([^"]*)"/) || [])[1] || '').replace(/&#10;/g, '\n');
    const d = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) return null;
    return {
      text: t,
      desc: d,
      clickable: /clickable="true"/.test(chunk),
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
    };
  }).filter(Boolean);
}

function tap(n) {
  sh(`shell input tap ${n.x} ${n.y}`);
}

function find(xml, pred) {
  return nodes(xml).find(pred) || null;
}

// Dismiss FAB sheet if open
sh('shell input keyevent 4');
sleep(800);

let xml = dump('w1b04-nav-0.xml');
console.log('top texts', nodes(xml).map((n) => n.text).filter(Boolean).slice(0, 15));

// Ensure on settings
if (!nodes(xml).some((n) => /Phạm vi công ty|Lưu vào SecureStore|Đăng xuất/.test(n.text + n.desc))) {
  const profile =
    find(xml, (n) => n.text === 'Hồ sơ' || n.desc === 'Hồ sơ') ||
    find(xml, (n) => /Hồ sơ/.test(n.text + n.desc));
  if (profile) {
    tap(profile);
    sleep(2000);
    xml = dump('w1b04-nav-profile.xml');
  }
  const settings =
    find(xml, (n) => n.text === 'Cài đặt' || n.desc === 'Cài đặt') ||
    find(xml, (n) => /Cài đặt/.test(n.text));
  if (!settings) {
    console.error('settings not found');
    process.exit(2);
  }
  tap(settings);
  sleep(2000);
  xml = dump('w1b04-nav-settings.xml');
}

const hits = nodes(xml).filter((n) => /Phạm vi/.test(n.text + n.desc));
console.log(
  'pham_vi_hits',
  hits.map((h) => ({ t: h.text, d: h.desc, c: h.clickable, x: h.x, y: h.y })),
);

const target =
  hits.find((h) => h.desc === 'Phạm vi công ty' || h.text === 'Phạm vi công ty') ||
  hits.find((h) => h.clickable && /Phạm vi công ty/.test(h.text + h.desc)) ||
  hits.find((h) => /Phạm vi công ty/.test(h.text + h.desc));

if (!target) {
  console.error('scope row not found');
  process.exit(2);
}
console.log('tapping', target);
tap(target);
sleep(3000);

xml = dump('w1b04-scope-final.xml');
const texts = nodes(xml)
  .map((n) => n.text)
  .filter(Boolean);
fs.writeFileSync(path.join(TMP, 'w1b04-scope-final-texts.txt'), texts.join('\n'), 'utf8');
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
