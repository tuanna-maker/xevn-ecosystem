#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
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

async function dismiss(xml) {
  const ok = find(xml, (n) => n.text === 'OK' || n.text === 'Đóng');
  if (ok) {
    tap(ok);
    await sleep(800);
    return true;
  }
  return false;
}

async function main() {
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(600);
  adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
  await sleep(2500);
  let xml = await dump('lv2-0');
  await dismiss(xml);
  xml = await dump('lv2-1');
  // ensure session still alive — if login screen, abort
  if (texts(xml).some((t) => t === 'Đăng nhập') && find(xml, (n) => n.rid.includes('login-email'))) {
    console.log(JSON.stringify({ fatal: 'logged out' }));
    process.exit(2);
  }
  const home = find(xml, (n) => n.text === 'Trang chủ' || n.desc.includes('Trang chủ'));
  tap(home);
  await sleep(1200);
  xml = await dump('lv2-home');
  await dismiss(xml);
  xml = await dump('lv2-home2');

  const leave = find(
    xml,
    (n) => n.rid.includes('time_off') || n.desc === 'Nghỉ phép' || n.text === 'Nghỉ phép',
  );
  console.log('leave', leave);
  if (!leave) {
    // FAB → Tạo đơn nghỉ
    const fab = find(xml, (n) => n.desc === 'Thao tác nhanh');
    tap(fab || { x: 540, y: 2210 });
    await sleep(1500);
    xml = await dump('lv2-fab');
    const item = find(xml, (n) => /Tạo đơn nghỉ/i.test(n.text));
    console.log('fab leave', item);
    tap(item);
    await sleep(2500);
    xml = await dump('r3-06-wizard');
  } else {
    tap(leave);
    await sleep(2500);
    xml = await dump('r3-06-leave-final');
    const create = find(xml, (n) => /Đăng ký nghỉ|Tạo đơn/i.test(n.text));
    console.log('create', create);
    tap(create);
    await sleep(2500);
    xml = await dump('r3-06-wizard');
  }

  const sample = texts(xml).slice(0, 25);
  const isAttForm = sample.some((t) => /Đơn công|adjust_check/i.test(t));
  const isLeave =
    !isAttForm &&
    sample.some((t) => /Loại nghỉ|phép năm|Ngày bắt đầu|Nghỉ phép|wizard|Bước|Tiếp/i.test(t));
  const out = {
    isAttForm,
    isLeave,
    sample,
    verdict: isLeave ? 'PARTIAL' : isAttForm ? 'FAIL_WRONG_FORM' : 'FAIL',
  };
  writeFileSync(
    'docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-leave.json',
    JSON.stringify(out, null, 2),
  );
  console.log(JSON.stringify(out));
  process.exit(isLeave ? 0 : 1);
}
main().catch((e) => {
  console.error(e);
  process.exit(2);
});
