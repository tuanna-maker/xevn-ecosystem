#!/usr/bin/env node
/**
 * R7 retry — clipboard paste into login-dev-base-url (avoid adb input text truncating ://)
 * Keep panel open until blur/endEditing, then collapse + production login.
 */
import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const EMAIL = 'uat.nv0001@xe.vn';
const PASSWORD = 'xevn-uat-2026';
const LOCAL_BASE = 'http://10.0.2.2:28001';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl';
const JSON_OUT = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl-retry.json';
mkdirSync(OUT, { recursive: true });

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 40e6, timeout: 120000 });
  if (r.status !== 0 && !a.includes('logcat')) {
    throw new Error(String(r.stderr || r.stdout).slice(0, 800));
  }
  return (r.stdout || '').trim();
}
async function dump(name) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r7r.xml');
  await sleep(500);
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-r7r.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
  const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 25e6,
  });
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
  // Reanimated toast dismiss (X)
  const x = find(
    xml,
    (n) =>
      n.boundsY !== undefined ||
      (n.className.includes('ImageView') && n.y > 2100) ||
      false,
  );
  const toastClose = find(xml, (n) => /Reduced motion/i.test(n.desc) || /Reduced motion/i.test(n.text));
  if (toastClose) {
    // tap right-side X of toast strip
    adbSh('shell', 'input', 'tap', '996', '2209');
    await sleep(600);
  }
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

const R = { steps: [], LOCAL_BASE, EMAIL };
const note = (m, x = {}) => {
  R.steps.push({ t: new Date().toISOString(), m, ...x });
  console.log(JSON.stringify({ m, ...x }));
};

adbSh('reverse', 'tcp:28001', 'tcp:28001');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.POST_NOTIFICATIONS');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_FINE_LOCATION');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_COARSE_LOCATION');
adbSh('shell', 'pm', 'clear', PKG);
await sleep(1000);
adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
await sleep(10000);

let xml = await dump('retry-cold');
await dismiss(xml);
xml = await dump('retry-cold2');

tap(
  find(xml, (n) => n.rid.includes('login-dev-toggle')) ||
    find(xml, (n) => /Đăng nhập dev/i.test(n.text)),
);
await sleep(1200);
xml = await dump('retry-dev');
await dismiss(xml);

// Scroll URL into mid-screen
adbSh('shell', 'input', 'swipe', '540', '1900', '540', '700', '350');
await sleep(800);
xml = await dump('retry-scrolled');
await dismiss(xml);
xml = await dump('retry-scrolled2');

let urlNode = findLoginFieldBounds(xml, 'login-dev-base-url');
if (!urlNode) {
  adbSh('shell', 'input', 'swipe', '540', '2000', '540', '600', '350');
  await sleep(800);
  xml = await dump('retry-scrolled3');
  urlNode = findLoginFieldBounds(xml, 'login-dev-base-url');
}
if (!urlNode) throw new Error('login-dev-base-url missing');
note('url_node', { x: urlNode.x, y: urlNode.y, text: urlNode.text });

// Clipboard paste (reliable for ://)
fillAdbTextField(adbSh, urlNode, LOCAL_BASE, { useClipboard: true });
await sleep(700);
// Explicit endEditing: tap email field (still visible above) while panel open
const emailForBlur = findLoginFieldBounds(xml, 'login-email');
if (emailForBlur) tap(emailForBlur);
else adbSh('shell', 'input', 'keyevent', '61'); // TAB
await sleep(800);
xml = await dump('retry-base-filled');
const urlAfter = findLoginFieldBounds(xml, 'login-dev-base-url');
R.base_url_field_text = urlAfter?.text || '';
R.base_ui_local =
  (R.base_url_field_text.includes('10.0.2.2') && R.base_url_field_text.includes('28001')) ||
  R.base_url_field_text === LOCAL_BASE;
note('base_filled', { text: R.base_url_field_text, ok: R.base_ui_local });

// Second attempt: if still pilot, long-press select-all style clear via clipboard again after focus
if (!R.base_ui_local) {
  note('retry_clipboard_2');
  urlNode = findLoginFieldBounds(xml, 'login-dev-base-url');
  fillAdbTextField(adbSh, urlNode, LOCAL_BASE, { useClipboard: true });
  await sleep(500);
  // Tap label "URL máy chủ" to blur
  const label = find(xml, (n) => n.text === 'URL máy chủ');
  if (label) tap(label);
  else adbSh('shell', 'input', 'keyevent', '66');
  await sleep(800);
  xml = await dump('retry-base-filled-2');
  R.base_url_field_text = findLoginFieldBounds(xml, 'login-dev-base-url')?.text || '';
  R.base_ui_local =
    R.base_url_field_text.includes('10.0.2.2') && R.base_url_field_text.includes('28001');
  note('base_filled_2', { text: R.base_url_field_text, ok: R.base_ui_local });
}

collapseDevLoginPanelIfOpen(adbSh, xml);
await sleep(800);
xml = await dump('retry-collapsed');

await fillProductionLoginFields(adbSh, xml, {
  email: EMAIL,
  password: PASSWORD,
  onAfterCollapse: async () => dump('retry-after-collapse'),
});
await sleep(600);
xml = await dump('retry-login-filled');
R.email_text = findLoginFieldBounds(xml, 'login-email')?.text || '';
R.email_ok = loginEmailLooksFilled(xml, EMAIL);
note('login_filled', { email: R.email_text, ok: R.email_ok });

const btn =
  find(xml, (n) => n.rid.includes('login-submit')) ||
  find(xml, (n) => /^Đăng nhập$/i.test(n.text));
adbSh('logcat', '-c');
tap(btn);
await sleep(14000);
xml = await dump('retry-post-login');
for (let i = 0; i < 6; i++) {
  if (await dismiss(xml)) {
    xml = await dump(`retry-perm-${i}`);
    continue;
  }
  if (homeReached(xml)) break;
  await sleep(1500);
  xml = await dump(`retry-wait-${i}`);
}
const logcat = adbSh('logcat', '-d', '-t', '500');
writeFileSync(`${OUT}/retry-login-logcat.txt`, logcat);
const hosts = [...logcat.matchAll(/https?:\/\/[^\s/'"]+/gi)].map((m) => m[0]);
const hrm = logcat.split(/\r?\n/).filter((l) => /\[HRM-MOB\]/i.test(l));
R.login_home = homeReached(xml);
R.hosts = [...new Set(hosts)];
R.host_local = R.hosts.some((h) => h.includes('10.0.2.2:28001'));
R.pilot_leak = R.hosts.some((h) => h.includes('14.225.217.232') || /:3001\b/.test(h));
R.hrm_sample = hrm.slice(0, 15);
R.ack =
  R.login_home && R.host_local && !R.pilot_leak
    ? 'PASS_TO_PM'
    : R.login_home && !R.host_local
      ? 'FAIL_TO_PM'
      : 'FAIL_TO_PM';

writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
note('done', {
  ack: R.ack,
  base_ui_local: R.base_ui_local,
  host_local: R.host_local,
  pilot_leak: R.pilot_leak,
  login_home: R.login_home,
  hosts: R.hosts,
});
process.exit(R.ack === 'PASS_TO_PM' ? 0 : 1);
