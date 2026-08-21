#!/usr/bin/env node
/** Finish MOB-04 from live nv0010 home — GPS submit + logcat stream */
import { execSync, spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { findNodeBounds } from '../../apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login';
const JSON_OUT = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-mob04-finish.json';
mkdirSync(OUT, { recursive: true });

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 40e6, timeout: 120000 });
  return (r.stdout || '').trim();
}
async function dump(name) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-fin.xml');
  await sleep(500);
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-fin.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
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

const R = { steps: [] };
const note = (m, x = {}) => {
  R.steps.push({ m, ...x });
  console.log(JSON.stringify({ m, ...x }));
};

adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
let xml = await dump('mob04-fin-home');

// Prefer home quick action Chấm công if present
const homeCheckin =
  find(xml, (n) => n.text === 'Chấm công' && !n.rid.includes('tab')) ||
  find(xml, (n) => /Chấm công/i.test(n.text) && n.y < 900);
if (homeCheckin) {
  tap(homeCheckin);
  await sleep(3500);
  xml = await dump('mob04-fin-checkin-direct');
} else {
  tap(find(xml, (n) => n.desc === 'Thao tác nhanh' || /Thao tác nhanh/i.test(n.text)));
  await sleep(2000);
  xml = await dump('mob04-fin-fab');
  tap(find(xml, (n) => n.rid.includes('fab-action-check-in') || n.text === 'Chấm công'));
  await sleep(3500);
  xml = await dump('mob04-fin-checkin');
}

for (let i = 0; i < 3; i++) {
  const allow = find(xml, (n) => /Allow|Cho phép|While using/i.test(n.text) || n.rid.includes('permission_allow'));
  if (!allow) break;
  tap(allow);
  await sleep(1000);
  xml = await dump(`mob04-fin-perm-${i}`);
}

tap(find(xml, (n) => n.rid.includes('check-in-channel-gps') || /Vị trí GPS/i.test(n.text)));
await sleep(1200);
adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
await sleep(2500);
xml = await dump('mob04-fin-gps');

const logPath = `${OUT}/mob04-fin-logcat-stream.txt`;
writeFileSync(logPath, '', 'utf8');
adbSh('logcat', '-c');
const lc = spawn(adb, ['-s', S, 'logcat', '-v', 'time', 'ReactNativeJS:V', '*:S'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
lc.stdout.on('data', (d) => appendFileSync(logPath, d.toString('utf8')));
await sleep(500);

const sub =
  find(xml, (n) => n.rid.includes('check-in-submit')) ||
  find(xml, (n) => /Chấm công vào/i.test(n.text));
R.submit_found = Boolean(sub);
note('pre_submit', { found: R.submit_found, hasSubmitId: has(xml, 'check-in-submit') });
if (sub) {
  tap(sub);
  note('submit_tapped');
  await sleep(20000);
  xml = await dump('mob04-fin-after-submit');
  R.alert = texts(xml).filter((t) => /HRM-|Thành công|Lỗi|duplicate|ATT|OK/i.test(t));
  const ok = find(xml, (n) => n.text === 'OK');
  if (ok) {
    tap(ok);
    await sleep(800);
    xml = await dump('mob04-fin-alert-ok');
  }
}

await sleep(1500);
lc.kill('SIGTERM');
await sleep(400);
const log = readFileSync(logPath, 'utf8');
writeFileSync(`${OUT}/mob04-fin-logcat.txt`, log);
R.post_lines = log.split('\n').filter((l) => /HRM-MOB|attendance\/records/i.test(l)).slice(0, 40);
R.logcat_post_ok =
  /\[HRM-MOB\]\s*attendance\/records\s*POST\s*ok=true/i.test(log) && /http=(201|200|204)/i.test(log);
R.logcat_post_any = /attendance\/records POST|POST .*attendance\/records/i.test(log);
R.post_result_line = (R.post_lines.find((l) => /attendance\/records POST/i.test(l)) || '').slice(0, 400);
R.base_url_in_post = (R.post_lines.find((l) => /POST .*attendance\/records/i.test(l)) || '').slice(0, 400);
R.ack = R.logcat_post_ok ? 'PASS' : 'FAIL';
writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
console.log(JSON.stringify({ ack: R.ack, logcat_post_ok: R.logcat_post_ok, post_result_line: R.post_result_line, alert: R.alert, lines: R.post_lines.slice(0, 12) }, null, 2));
process.exit(R.logcat_post_ok ? 0 : 1);
