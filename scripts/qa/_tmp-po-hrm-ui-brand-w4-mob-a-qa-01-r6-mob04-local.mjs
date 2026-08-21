#!/usr/bin/env node
/**
 * R6 MOB-04 local API close attempt:
 * FE adb login as uat.nv0010 (no today check-in) + base URL http://10.0.2.2:28001
 * Capture logcat [HRM-MOB] attendance/records POST ok=true http=201
 * Does NOT use qa-login. U65 zero-seed (no seed scripts).
 */
import { execSync, spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  collapseDevLoginPanelIfOpen,
  fillAdbTextField,
  fillProductionLoginFields,
  findLoginFieldBounds,
  findNodeBounds,
  loginEmailLooksFilled,
} from '../../apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const EMAIL = process.env.QA_EMAIL_MOB04 || 'uat.nv0010@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'xevn-uat-2026';
const LOCAL_BASE = 'http://10.0.2.2:28001';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login';
const JSON_OUT = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-mob04-local.json';
mkdirSync(OUT, { recursive: true });

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 40e6, timeout: 120000 });
  if (r.status !== 0 && !a.includes('logcat')) {
    throw new Error(String(r.stderr || r.stdout).slice(0, 500));
  }
  return (r.stdout || '').trim();
}

async function dump(name) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r6loc.xml');
  await sleep(500);
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-r6loc.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
  const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 25e6 });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return readFileSync(`${OUT}/${name}.xml`, 'utf8');
}

function find(xml, pred) {
  return findNodeBounds(xml, pred);
}
function tap(h) {
  if (h) adbSh('shell', 'input', 'tap', String(h.x), String(h.y));
}
function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]);
}
function has(xml, id) {
  return xml.includes(`resource-id="${id}"`) || xml.includes(`content-desc="${id}"`);
}
function homeReached(xml) {
  return (
    has(xml, 'home-top-bar-brand-accent') ||
    texts(xml).some((t) => /Trang chủ|Chào buổi|Việc cần làm|Xin chào|Đi làm/i.test(t))
  );
}
async function dismiss(xml) {
  const a = find(
    xml,
    (n) =>
      n.rid.includes('permission_allow') ||
      n.text === 'OK' ||
      /Allow|Cho phép|While using|Chỉ khi dùng/i.test(n.text),
  );
  if (a) {
    tap(a);
    await sleep(1000);
    return true;
  }
  return false;
}

const R = { email: EMAIL, local_base: LOCAL_BASE, steps: [] };
const note = (m, x = {}) => {
  R.steps.push({ t: new Date().toISOString(), m, ...x });
  console.log(JSON.stringify({ m, ...x }));
};

adbSh('reverse', 'tcp:28001', 'tcp:28001');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.POST_NOTIFICATIONS');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_FINE_LOCATION');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_COARSE_LOCATION');
adbSh('shell', 'settings', 'put', 'secure', 'location_mode', '3');
adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
adbSh('shell', 'pm', 'clear', PKG);
await sleep(1000);
adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
await sleep(10000);

let xml = await dump('mob04-local-cold');
// Expand dev panel
tap(
  find(xml, (n) => n.rid.includes('login-dev-toggle')) ||
    find(xml, (n) => /Đăng nhập dev/i.test(n.text)),
);
await sleep(1200);
xml = await dump('mob04-local-dev');

// Scroll down so login-dev-base-url is interactable
adbSh('shell', 'input', 'swipe', '540', '1800', '540', '900', '300');
await sleep(800);
xml = await dump('mob04-local-dev-scrolled');

let urlNode = findLoginFieldBounds(xml, 'login-dev-base-url');
if (!urlNode) {
  // swipe again
  adbSh('shell', 'input', 'swipe', '540', '1900', '540', '800', '300');
  await sleep(800);
  xml = await dump('mob04-local-dev-scrolled2');
  urlNode = findLoginFieldBounds(xml, 'login-dev-base-url');
}
if (!urlNode) throw new Error('login-dev-base-url not found');
fillAdbTextField(adbSh, urlNode, LOCAL_BASE);
await sleep(800);
// Blur / end editing so controlled FormField may sync — tap label area
adbSh('shell', 'input', 'keyevent', '66'); // enter
await sleep(400);
xml = await dump('mob04-local-base-filled');
const urlAfter = findLoginFieldBounds(xml, 'login-dev-base-url');
R.base_url_field_text = urlAfter?.text || '';
R.email_field_not_url = !((findLoginFieldBounds(xml, 'login-email')?.text || '').includes('10.0.2.2'));
note('base_filled', { text: R.base_url_field_text, emailOk: R.email_field_not_url });

collapseDevLoginPanelIfOpen(adbSh, xml);
await sleep(800);
xml = await dump('mob04-local-collapsed');

await fillProductionLoginFields(adbSh, xml, {
  email: EMAIL,
  password: PASSWORD,
  onAfterCollapse: async () => dump('mob04-local-after-collapse'),
});
await sleep(600);
xml = await dump('mob04-local-login-filled');
R.email_text = findLoginFieldBounds(xml, 'login-email')?.text || '';
R.email_ok = loginEmailLooksFilled(xml, EMAIL) && R.email_text.includes(EMAIL.split('@')[0]);
note('login_filled', { email: R.email_text, ok: R.email_ok });
if (!R.email_ok) {
  writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
  process.exit(1);
}

const logPath = `${OUT}/mob04-local-logcat-stream.txt`;
writeFileSync(logPath, '', 'utf8');
adbSh('logcat', '-c');
const lc = spawn(adb, ['-s', S, 'logcat', '-v', 'time', 'ReactNativeJS:V', '*:S'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
lc.stdout.on('data', (d) => appendFileSync(logPath, d.toString('utf8')));
lc.stderr.on('data', (d) => appendFileSync(logPath, d.toString('utf8')));

const btn =
  find(xml, (n) => n.rid.includes('login-submit')) || find(xml, (n) => /^Đăng nhập$/i.test(n.text));
tap(btn);
await sleep(14000);
xml = await dump('mob04-local-post-login');
for (let i = 0; i < 8; i++) {
  if (await dismiss(xml)) {
    xml = await dump(`mob04-local-perm-${i}`);
    continue;
  }
  if (homeReached(xml)) break;
  await sleep(1500);
  xml = await dump(`mob04-local-wait-${i}`);
}
R.home = homeReached(xml);
const loginLog = readFileSync(logPath, 'utf8');
R.login_used_local = /10\.0\.2\.2:28001/.test(loginLog);
R.login_used_pilot = /14\.225\.217\.232:3001/.test(loginLog);
note('post_login', { home: R.home, local: R.login_used_local, pilot: R.login_used_pilot });

if (!R.home) {
  lc.kill('SIGTERM');
  writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
  process.exit(1);
}

// Navigate check-in
if (texts(xml).some((t) => /^Đóng$/i.test(t))) {
  tap(find(xml, (n) => n.text === 'Đóng'));
  await sleep(800);
  xml = await dump('mob04-local-home');
}
tap(
  find(xml, (n) => n.desc === 'Thao tác nhanh' || /Thao tác nhanh/i.test(n.text)) ||
    find(xml, (n) => n.rid.includes('check-in-fab')),
);
await sleep(2000);
xml = await dump('mob04-local-fab');
tap(
  find(xml, (n) => n.rid.includes('fab-action-check-in') || n.text === 'Chấm công'),
);
await sleep(4000);
xml = await dump('mob04-local-checkin');
for (let i = 0; i < 4; i++) {
  if (!(await dismiss(xml))) break;
  xml = await dump(`mob04-local-checkin-perm-${i}`);
}
tap(find(xml, (n) => n.rid.includes('check-in-channel-gps') || /Vị trí GPS/i.test(n.text)));
await sleep(1500);
adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
await sleep(2000);
xml = await dump('mob04-local-gps');

const sub =
  find(xml, (n) => n.rid.includes('check-in-submit')) ||
  find(xml, (n) => /Chấm công vào/i.test(n.text));
R.submit_found = Boolean(sub);
if (sub) {
  // truncate stream marker
  appendFileSync(logPath, '\n# --- SUBMIT ---\n', 'utf8');
  tap(sub);
  note('submit_tapped');
  await sleep(18000);
  xml = await dump('mob04-local-after-submit');
  // capture alert text
  R.alert_texts = texts(xml).filter((t) => /HRM-|Thành công|Lỗi|duplicate|ATT/i.test(t));
  const ok = find(xml, (n) => n.text === 'OK' || n.text === 'Đóng');
  if (ok) {
    tap(ok);
    await sleep(800);
    xml = await dump('mob04-local-alert-dismiss');
  }
}

await sleep(1500);
lc.kill('SIGTERM');
await sleep(400);
const log = readFileSync(logPath, 'utf8');
writeFileSync(`${OUT}/mob04-local-logcat.txt`, log);
R.post_lines = log.split('\n').filter((l) => /HRM-MOB|attendance\/records/i.test(l)).slice(0, 50);
R.logcat_post_ok =
  /\[HRM-MOB\]\s*attendance\/records\s*POST\s*ok=true/i.test(log) && /http=(201|200|204)/i.test(log);
R.logcat_post_line = (R.post_lines.find((l) => /attendance\/records POST/i.test(l)) || '').slice(0, 300);
R.ui_success = /Thành công|HRM-ATT-201/i.test(log + texts(xml).join('\n'));
R.ack = R.logcat_post_ok ? 'PASS' : 'FAIL';

writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
console.log(
  JSON.stringify(
    {
      ack: R.ack,
      home: R.home,
      login_local: R.login_used_local,
      logcat_post_ok: R.logcat_post_ok,
      post_line: R.logcat_post_line,
      alert: R.alert_texts,
    },
    null,
    2,
  ),
);
process.exit(R.logcat_post_ok ? 0 : 1);
