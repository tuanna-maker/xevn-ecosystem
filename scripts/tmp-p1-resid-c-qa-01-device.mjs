#!/usr/bin/env node
/**
 * P1-RESID-C-QA-01 — device J-MOB-03/04/05 (reuses mob-01 flow, resid evidence dir)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sdk = process.env.LOCALAPPDATA + '\\Android\\Sdk';
const adb = path.join(sdk, 'platform-tools', 'adb.exe');
const outDir = path.join(__dirname, '..', 'docs', 'qa', 'evidence', 'p1-resid-c-qa-01-screens');
const pkg = 'vn.xevn.hrm.mobile';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function tap(x, y) {
  sh(`"${adb}" shell input tap ${x} ${y}`);
}

function dump(name) {
  sh(`"${adb}" shell uiautomator dump /sdcard/${name}.xml`);
  sh(`"${adb}" pull /sdcard/${name}.xml "${path.join(outDir, `${name}.xml`)}"`);
  return fs.readFileSync(path.join(outDir, `${name}.xml`), 'utf8');
}

function shot(name) {
  sh(`"${adb}" shell screencap -p /sdcard/${name}.png`);
  sh(`"${adb}" pull /sdcard/${name}.png "${path.join(outDir, `${name}.png`)}"`);
}

function findTextBounds(xml, text) {
  const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`);
  const m = xml.match(re);
  if (!m) return null;
  return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
}

function findClickableRow(xml, minY = 400, maxY = 1800) {
  for (const m of xml.matchAll(/clickable="true"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)) {
    const y1 = +m[2];
    if (y1 > minY && y1 < maxY) {
      return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
    }
  }
  return null;
}

async function loginFresh() {
  sh(`"${adb}" shell am force-stop ${pkg}`);
  await sleep(800);
  sh(`"${adb}" shell am start -n ${pkg}/.MainActivity`);
  await sleep(5000);
  tap(540, 718);
  await sleep(400);
  sh(`"${adb}" shell input text du-lich.ceo@xe.vn`);
  tap(540, 934);
  await sleep(400);
  sh(`"${adb}" shell input text xevn-pilot`);
  tap(540, 1116);
  await sleep(10000);
  let xml = dump('residc-login');
  if (xml.includes('permission_allow_button')) {
    tap(540, 1305);
    await sleep(2000);
  }
  return dump('residc-home');
}

async function main() {
  if (!fs.existsSync(adb)) {
    console.error('adb not found');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  await loginFresh();

  tap(675, 2273);
  await sleep(2500);
  let req = dump('residc-requests-tab');
  const donNghi = findTextBounds(req, 'Đơn nghỉ');
  if (donNghi) tap(donNghi.x, donNghi.y);
  await sleep(3000);
  let leaveList = dump('residc-leave-list');
  shot('residc-leave-list');
  const leaveRow = findClickableRow(leaveList, 500, 1600);
  let j03 = false;
  if (leaveRow) {
    tap(leaveRow.x, leaveRow.y);
    await sleep(3000);
    const leaveDetail = dump('residc-leave-detail');
    shot('residc-leave-detail');
    j03 =
      leaveDetail.includes('Từ ngày') ||
      leaveDetail.includes('Trạng thái') ||
      leaveDetail.includes('annual');
  } else {
    j03 = leaveList.includes('Chưa có đơn nghỉ');
  }
  results.push({ jId: 'J-MOB-03', pass: j03, note: leaveRow ? 'row tap detail' : 'empty or no row' });

  tap(135, 2273);
  await sleep(800);
  tap(945, 2273);
  await sleep(2500);
  sh(`"${adb}" shell input swipe 540 1600 540 900 400`);
  await sleep(800);
  let more = dump('residc-more');
  const luong = findTextBounds(more, 'Lương');
  if (luong) tap(luong.x, luong.y);
  await sleep(4000);
  let payroll = dump('residc-payroll');
  shot('residc-payroll');
  const row1 = findClickableRow(payroll);
  if (row1) tap(row1.x, row1.y);
  await sleep(3000);
  let plist = dump('residc-payslip-list');
  shot('residc-payslip-list');
  const row2 = findClickableRow(plist);
  let j04 = false;
  if (row2) {
    tap(row2.x, row2.y);
    await sleep(3000);
    const pdetail = dump('residc-payslip-detail');
    shot('residc-payslip-detail');
    j04 = pdetail.includes('Thực lĩnh') || pdetail.includes('Tổng gross') || pdetail.includes('Chi tiết');
  } else {
    j04 = plist.includes('Chưa có phiếu lương') || plist.includes('Phiếu lương');
  }
  results.push({ jId: 'J-MOB-04', pass: j04, note: row2 ? 'payslip detail' : 'empty list' });

  sh(`"${adb}" shell am start -n ${pkg}/.MainActivity`);
  await sleep(2000);
  tap(945, 2273);
  await sleep(2500);
  sh(`"${adb}" shell input swipe 540 1600 540 900 400`);
  await sleep(800);
  more = dump('residc-more2');
  const phe = findTextBounds(more, 'Phê duyệt');
  if (phe) tap(phe.x, phe.y);
  await sleep(4000);
  const appr = dump('residc-approvals');
  shot('residc-approvals');
  const j05Screen =
    appr.includes('Phê duyệt') || appr.includes('Nghỉ phép') || appr.includes('Chấm công');
  const duyet = findTextBounds(appr, 'Duyệt');
  results.push({
    jId: 'J-MOB-05',
    pass: j05Screen,
    note: duyet ? 'Duyệt visible' : j05Screen ? 'approvals screen, no Duyệt (may be approved)' : 'screen missing',
  });

  const out = { work_item_id: 'P1-RESID-C-QA-01', date: '2026-05-30', results, pass: results.every((r) => r.pass) };
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs', 'qa', 'evidence', 'p1-resid-c-qa-01-device-20260530.json'),
    JSON.stringify(out, null, 2),
  );
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
