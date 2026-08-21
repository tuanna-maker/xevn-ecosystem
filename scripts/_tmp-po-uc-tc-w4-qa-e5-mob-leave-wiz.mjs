#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const OUT = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob';
mkdirSync(OUT, { recursive: true });

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
const texts = (xml) => [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
function find(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b || !pred({ text, desc, rid })) continue;
    return {
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
      text,
      desc,
      rid,
    };
  }
  return null;
}
const tap = (h) => h && adbSh('shell', 'input', 'tap', String(h.x), String(h.y));

async function main() {
  // dismiss OK if present
  let xml = await dump('lv-0');
  let ok = find(xml, (n) => n.text === 'OK');
  if (ok) {
    tap(ok);
    await sleep(800);
  }
  const home = find(xml, (n) => n.text === 'Trang chủ' || n.desc.includes('Trang chủ'));
  if (home) {
    tap(home);
    await sleep(1200);
  }
  xml = await dump('lv-home');
  ok = find(xml, (n) => n.text === 'OK');
  if (ok) {
    tap(ok);
    await sleep(800);
    xml = await dump('lv-home2');
  }

  const leave = find(
    xml,
    (n) => n.desc === 'Nghỉ phép' || n.rid.includes('time_off') || n.text === 'Nghỉ phép',
  );
  console.log('leave', leave);
  tap(leave);
  await sleep(2500);
  xml = await dump('r3-06-leave-final');
  const create =
    find(xml, (n) => /Đăng ký nghỉ|Tạo đơn|Xin nghỉ/i.test(n.text)) ||
    find(xml, (n) => /create/i.test(n.rid));
  console.log('create', create);
  if (create) {
    tap(create);
    await sleep(2500);
  }
  xml = await dump('r3-06-wizard');
  const wizard = texts(xml).some((t) => /Loại|Ngày|Tiếp|Bước|Lý do|phép|Nghỉ/i.test(t));
  const out = {
    wizard,
    sample: texts(xml).slice(0, 20),
    verdict: wizard ? 'PARTIAL' : 'FAIL',
  };
  writeFileSync('docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-leave.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out));
  process.exit(wizard ? 0 : 1);
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
