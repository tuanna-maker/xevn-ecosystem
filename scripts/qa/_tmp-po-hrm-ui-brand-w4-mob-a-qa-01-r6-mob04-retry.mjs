#!/usr/bin/env node
/** R6 MOB-04 retry on live session — wait GPS coords + capture logcat POST */
import { execSync, spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { findNodeBounds } from '../../apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login';
const JSON_OUT = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-mob04-retry.json';
mkdirSync(OUT, { recursive: true });

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 40e6, timeout: 120000 });
  return { status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

async function dump(name) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-r6m04.xml');
  await sleep(500);
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-r6m04.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
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

async function dismiss(xml) {
  const a = find(
    xml,
    (n) =>
      n.rid.includes('permission_allow') ||
      /Allow|Cho phép|While using|Chỉ khi dùng/i.test(n.text),
  );
  if (a) {
    tap(a);
    await sleep(1200);
    return true;
  }
  return false;
}

const R = { t: new Date().toISOString(), steps: [] };
const note = (m, x = {}) => {
  R.steps.push({ t: new Date().toISOString(), m, ...x });
  console.log(JSON.stringify({ m, ...x }));
};

// geo + location
adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
adbSh('shell', 'settings', 'put', 'secure', 'location_mode', '3');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_FINE_LOCATION');
adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_COARSE_LOCATION');

let xml = await dump('mob04-retry-start');
for (let i = 0; i < 3; i++) {
  if (!(await dismiss(xml))) break;
  xml = await dump(`mob04-retry-perm-${i}`);
}

// If not on check-in, navigate via FAB
if (!has(xml, 'check-in-submit') && !texts(xml).some((t) => /Chấm công vào/i.test(t))) {
  // back to home if needed
  if (texts(xml).some((t) => /^Chấm công$/i.test(t)) && has(xml, 'check-in-channel-gps')) {
    note('already_checkin');
  } else {
    // press back a few times then FAB
    for (let i = 0; i < 3; i++) {
      adbSh('shell', 'input', 'keyevent', '4');
      await sleep(800);
    }
    xml = await dump('mob04-retry-home');
    const fab =
      find(xml, (n) => n.desc === 'Thao tác nhanh' || /Thao tác nhanh/i.test(n.text)) ||
      find(xml, (n) => n.rid.includes('check-in-fab'));
    tap(fab);
    await sleep(2000);
    xml = await dump('mob04-retry-fab');
    tap(
      find(xml, (n) => n.rid.includes('fab-action-check-in') || n.text === 'Chấm công') ||
        find(xml, (n) => /Chấm công/i.test(n.text)),
    );
    await sleep(4000);
    xml = await dump('mob04-retry-checkin');
  }
}

for (let i = 0; i < 4; i++) {
  if (!(await dismiss(xml))) break;
  xml = await dump(`mob04-retry-checkin-perm-${i}`);
}

tap(find(xml, (n) => n.rid.includes('check-in-channel-gps') || /Vị trí GPS/i.test(n.text)));
await sleep(1000);

// wait for coords or location ready label
let coords = false;
for (let i = 0; i < 20; i++) {
  adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
  xml = await dump(`mob04-retry-gps-wait-${i}`);
  coords =
    has(xml, 'check-in-location-coords') ||
    texts(xml).some((t) => /\d+\.\d{3,}.*,\s*-?\d+\.\d{3,}/.test(t)) ||
    texts(xml).some((t) => /sẵn sàng|đã lấy|tọa độ/i.test(t) && !/đang lấy|loading/i.test(t));
  const loading = texts(xml).some((t) => /Đang lấy|loading|Đang tải/i.test(t));
  note('gps_wait', { i, coords, loading });
  if (coords) break;
  // tap location refresh area if present
  const refresh = find(xml, (n) => /Làm mới|Thử lại|Vị trí thiết bị/i.test(n.text));
  if (refresh && i === 5) tap(refresh);
  await sleep(2000);
}
R.coords_ready = coords;

// Start continuous logcat capture
adbSh('logcat', '-c');
const logPath = `${OUT}/mob04-retry-logcat-stream.txt`;
writeFileSync(logPath, '', 'utf8');
const lc = spawn(adb, ['-s', S, 'logcat', '-v', 'time', 'ReactNativeJS:V', '*:S'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
lc.stdout.on('data', (d) => appendFileSync(logPath, d.toString('utf8')));
lc.stderr.on('data', (d) => appendFileSync(logPath, d.toString('utf8')));
await sleep(800);

xml = await dump('mob04-retry-pre-submit');
const sub =
  find(xml, (n) => n.rid.includes('check-in-submit')) ||
  find(xml, (n) => /Chấm công vào/i.test(n.text));
R.submit_found = Boolean(sub);
if (sub) {
  // check enabled
  const chunk = xml.split('<node ').find((c) => c.includes('check-in-submit')) || '';
  R.submit_enabled = !/enabled="false"/.test(chunk);
  tap(sub);
  note('submit_tapped');
  await sleep(20000);
  xml = await dump('mob04-retry-after-submit');
  // dismiss success alert if any
  const ok = find(xml, (n) => n.text === 'OK' || n.text === 'Đóng');
  if (ok) {
    tap(ok);
    await sleep(1000);
    xml = await dump('mob04-retry-alert-dismissed');
  }
}

await sleep(2000);
lc.kill('SIGTERM');
await sleep(500);

const log = readFileSync(logPath, 'utf8');
writeFileSync(`${OUT}/mob04-retry-logcat.txt`, log);
const postLines = log.split('\n').filter((l) => /HRM-MOB|attendance\/records/i.test(l));
R.post_lines = postLines.slice(0, 40);
R.logcat_post_ok =
  /\[HRM-MOB\]\s*attendance\/records\s*POST\s*ok=true/i.test(log) && /http=(201|200|204)/i.test(log);
R.logcat_post_any = /attendance\/records\s*POST|POST .*attendance\/records/i.test(log);
R.ui_success = texts(xml).some((t) => /Thành công|HRM-ATT/i.test(t)) || /Thành công|HRM-ATT/i.test(log);
R.ack = R.logcat_post_ok ? 'PASS' : R.logcat_post_any ? 'PARTIAL' : 'FAIL';

writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
console.log(JSON.stringify({ ack: R.ack, coords: R.coords_ready, logcat_post_ok: R.logcat_post_ok, lines: R.post_lines }, null, 2));
process.exit(R.logcat_post_ok ? 0 : 1);
