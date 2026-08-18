const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERIAL = 'emulator-5554';
const OUT = path.resolve('docs/qa/evidence/screenshots/w1b-04-auth-mob-qa-r3');
const TMP = path.join(process.env.TEMP || '/tmp', 'w1b04-r3-ui.xml');

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function sleep(ms) {
  const sec = Math.max(1, Math.ceil(ms / 1000));
  sh(`powershell -Command Start-Sleep -Seconds ${sec}`);
}

function dump() {
  sh(`adb -s ${SERIAL} shell uiautomator dump /sdcard/w1b04-r3-ui.xml`);
  sh(`adb -s ${SERIAL} pull /sdcard/w1b04-r3-ui.xml "${TMP}"`);
  return fs.readFileSync(TMP, 'utf8');
}

function save(name) {
  sh(`adb -s ${SERIAL} shell screencap -p /sdcard/${name}.png`);
  const local = path.join(OUT, `${name}.png`);
  sh(`adb -s ${SERIAL} pull /sdcard/${name}.png "${local}"`);
  const st = fs.statSync(local);
  console.log(`SHOT ${name} bytes=${st.size} ts=${new Date().toISOString()}`);
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
}

function logTexts(tag, xml) {
  console.log(tag, texts(xml).join(' | '));
}

function boundsById(xml, id) {
  const re = new RegExp(
    `resource-id="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
  );
  const m = xml.match(re);
  if (!m) return null;
  return {
    cx: Math.floor((+m[1] + +m[3]) / 2),
    cy: Math.floor((+m[2] + +m[4]) / 2),
    x1: +m[1],
    y1: +m[2],
    x2: +m[3],
    y2: +m[4],
  };
}

function boundsByText(xml, label) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`);
  const m = xml.match(re);
  if (!m) {
    // attribute order can put bounds before text
    const re2 = new RegExp(`bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"[^>]*text="${esc}"`);
    const m2 = xml.match(re2);
    if (!m2) return null;
    return {
      cx: Math.floor((+m2[1] + +m2[3]) / 2),
      cy: Math.floor((+m2[2] + +m2[4]) / 2),
    };
  }
  return {
    cx: Math.floor((+m[1] + +m[3]) / 2),
    cy: Math.floor((+m[2] + +m[4]) / 2),
  };
}

function tap(cx, cy, note) {
  sh(`adb -s ${SERIAL} shell input tap ${cx} ${cy}`);
  console.log('TAP', note || '', cx, cy);
}

function tapText(xml, label) {
  const b = boundsByText(xml, label);
  if (!b) {
    console.log('MISS', label);
    return false;
  }
  tap(b.cx, b.cy, label);
  return true;
}

function clearField(b) {
  tap(b.cx, b.cy, 'focus');
  sleep(400);
  // select-all + delete
  sh(`adb -s ${SERIAL} shell input keyevent 123`); // move end
  sleep(200);
  for (let i = 0; i < 40; i++) sh(`adb -s ${SERIAL} shell input keyevent 67`); // DEL
}

function typeAscii(text) {
  // adb input text: escape spaces as %s; @ as \@ in some shells — use ADB keyboard approach
  const escaped = text.replace(/ /g, '%s').replace(/&/g, '\\&');
  sh(`adb -s ${SERIAL} shell input text "${escaped}"`);
}

function setFieldById(xml, id, value, note) {
  let b = boundsById(xml, id);
  if (!b) {
    // fallback resource-id may appear without package prefix matching — try contains
    const re = new RegExp(
      `resource-id="[^"]*${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
    );
    const m = xml.match(re);
    if (!m) throw new Error(`field missing: ${id}`);
    b = {
      cx: Math.floor((+m[1] + +m[3]) / 2),
      cy: Math.floor((+m[2] + +m[4]) / 2),
    };
  }
  clearField(b);
  sleep(300);
  typeAscii(value);
  console.log('TYPE', note || id, value);
  sleep(500);
}

function setUrlField(xml, url) {
  // URL field has no resource-id; find EditText after "URL máy chủ"
  const idx = xml.indexOf('text="URL máy chủ"');
  if (idx < 0) throw new Error('URL label missing');
  const slice = xml.slice(idx);
  const m = slice.match(/class="android.widget.EditText"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/)
    || slice.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"[^>]*class="android.widget.EditText"/);
  if (!m) throw new Error('URL EditText missing');
  const b = {
    cx: Math.floor((+m[1] + +m[3]) / 2),
    cy: Math.floor((+m[2] + +m[4]) / 2),
  };
  clearField(b);
  sleep(300);
  // 10.0.2.2:28001 — dots ok in adb input text
  typeAscii(url);
  console.log('TYPE url', url);
  sleep(500);
}

function dismissAlertIfAny(xml) {
  if (tapText(xml, 'OK') || tapText(xml, 'Ok') || tapText(xml, 'Đóng')) {
    sleep(1000);
    return true;
  }
  return false;
}

function scrollDown() {
  sh(`adb -s ${SERIAL} shell input swipe 540 1800 540 900 400`);
}

console.log('START', new Date().toISOString());
fs.mkdirSync(OUT, { recursive: true });

// --- prep URL ---
let xml = dump();
logTexts('LOGIN0', xml);
save('01-login-ready');
setUrlField(xml, 'http://10.0.2.2:28001');
sleep(800);
xml = dump();
save('02-url-set');
logTexts('URL', xml);

// --- Case A fail ---
xml = dump();
setFieldById(xml, 'login-email', 'bad.user@xe.vn', 'caseA email');
xml = dump();
setFieldById(xml, 'login-password', 'wrong-password-999', 'caseA pass');
xml = dump();
save('10-case-a-filled');
{
  const b = boundsById(xml, 'login-submit') || boundsByText(xml, 'Đăng nhập');
  if (!b) throw new Error('submit missing');
  tap(b.cx, b.cy, 'submit Case A');
}
sleep(3500);
xml = dump();
save('11-case-a-fail');
logTexts('CASE_A', xml);
const caseAOk =
  /HRM-AUTH-401|mật khẩu không đúng|Email hoặc mật khẩu/i.test(texts(xml).join(' '));
console.log('CASE_A_PASS', caseAOk);
dismissAlertIfAny(xml);
sleep(1000);

// --- Case B happy ---
xml = dump();
setFieldById(xml, 'login-email', 'uat.nv0001@xe.vn', 'caseB email');
xml = dump();
setFieldById(xml, 'login-password', 'xevn-uat-2026', 'caseB pass');
xml = dump();
save('20-case-b-filled');
{
  const b = boundsById(xml, 'login-submit') || boundsByText(xml, 'Đăng nhập');
  if (!b) throw new Error('submit missing');
  tap(b.cx, b.cy, 'submit Case B');
}
sleep(5000);
xml = dump();
save('21-case-b-home');
logTexts('HOME', xml);

// --- Profile → Settings → Scope ---
tap(860, 2220, 'tab Hồ sơ');
sleep(2500);
xml = dump();
save('30-profile');
logTexts('PROFILE', xml);
if (!tapText(xml, 'Cài đặt')) {
  // try contains
  const m = xml.match(/text="([^"]*Cài đặt[^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (m) tap(Math.floor((+m[2] + +m[4]) / 2), Math.floor((+m[3] + +m[5]) / 2), m[1]);
}
sleep(2500);
xml = dump();
save('31-settings');
logTexts('SETTINGS', xml);

// scroll to find Phạm vi công ty
for (let i = 0; i < 4; i++) {
  if (/Phạm vi/.test(xml)) break;
  scrollDown();
  sleep(1000);
  xml = dump();
}
save('32-settings-scrolled');
if (!tapText(xml, 'Phạm vi công ty')) {
  const m = xml.match(/text="([^"]*Phạm vi[^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (m) {
    tap(Math.floor((+m[2] + +m[4]) / 2), Math.floor((+m[3] + +m[5]) / 2), m[1]);
  } else {
    console.log('MISS Phạm vi — rows', texts(xml).slice(0, 40).join(' ; '));
  }
}
sleep(3000);
xml = dump();
save('40-scope');
const scopeTexts = texts(xml);
logTexts('SCOPE', xml);
fs.writeFileSync(path.join(OUT, '40-scope-labels.txt'), scopeTexts.join('\n'), 'utf8');

const joined = scopeTexts.join('\n');
const ac2 = {
  company: /Công ty/.test(joined) && /Tập đoàn X\.E/.test(joined),
  tenantLabel: /Pháp nhân/.test(joined) && /Tập đoàn XeVN/.test(joined),
  role: /Vai trò/.test(joined) && /Nhân viên/.test(joined),
  jobTitle: /Chức danh/.test(joined),
  staleTenantColon: /Tenant:\s*xevn/i.test(joined) || /Tenant:xevn/i.test(joined),
  staleHoldingPrimary: /Query company_id:\s*holding/i.test(joined),
};
console.log('AC2', JSON.stringify(ac2, null, 2));
console.log('END', new Date().toISOString());
