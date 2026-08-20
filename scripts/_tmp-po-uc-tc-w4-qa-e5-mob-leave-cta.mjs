#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const OUT = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob';

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', timeout: 45000, maxBuffer: 30e6 });
  if (r.status !== 0) throw new Error(String(r.stderr || r.stdout));
  return (r.stdout || '').trim();
}
async function dump(n) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-lv.xml');
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-lv.xml ${OUT}/${n}.xml`, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 25e6,
  });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
  return readFileSync(`${OUT}/${n}.xml`, 'utf8');
}

const xml0 = await dump('leave-cta-0');
const m = xml0.match(/text="Đăng ký nghỉ"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
if (!m) {
  console.log(JSON.stringify({ err: 'CTA missing', sample: [...xml0.matchAll(/text="([^"]+)"/g)].map((x) => x[1]).slice(0, 20) }));
  process.exit(1);
}
const hit = { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
await sleep(3000);
const xml = await dump('r3-06-wizard-final');
const sample = [...xml.matchAll(/text="([^"]+)"/g)].map((x) => x[1]).slice(0, 30);
const isLeaveWizard = sample.some((t) =>
  /Loại nghỉ|Ngày bắt đầu|Ngày kết thúc|Tiếp tục|Bước|Chọn loại|phép năm|Nửa ngày/i.test(t),
);
const out = { hit, isLeaveWizard, sample };
writeFileSync('docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-leave.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out));
process.exit(isLeaveWizard ? 0 : 1);
