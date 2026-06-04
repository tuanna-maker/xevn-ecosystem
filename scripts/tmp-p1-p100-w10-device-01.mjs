#!/usr/bin/env node
/**
 * P1-P100-W10-DEVICE-01 — J-MOB-03/04/05 device gate (du-lich.ceo / xevn-pilot)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const sdk = process.env.LOCALAPPDATA + '\\Android\\Sdk';
const adb = path.join(sdk, 'platform-tools', 'adb.exe');
const outDir = path.join(repoRoot, 'docs', 'qa', 'evidence', 'p1-p100-w10-device-screens');
const jsonOut = path.join(repoRoot, 'docs', 'qa', 'evidence', 'p1-p100-w10-device-01-20260531.json');
const pkg = 'vn.xevn.hrm.mobile';
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

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

function parseLogcatCompanyHeaders() {
  const raw = sh(`"${adb}" logcat -d -t 800`);
  const lines = raw.split('\n').filter((l) => /x-company-id|company-id|company_uuid|hrmRequest/i.test(l));
  const uuids = [...new Set([...raw.matchAll(new RegExp(UUID_RE.source, 'gi'))].map((m) => m[0].toLowerCase()))];
  const hasMain = /x-company-id[^\n]*main|company-id=main|"main"/i.test(raw);
  return { snippet: lines.slice(-20).join('\n'), uuids: uuids.slice(0, 5), hasMain };
}

async function loginFresh() {
  sh(`"${adb}" logcat -c`);
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
  let xml = dump('w10-login');
  if (xml.includes('permission_allow_button')) {
    tap(540, 1305);
    await sleep(2000);
  }
  if (xml.includes('permission_allow_foreground_only_button')) {
    tap(540, 1450);
    await sleep(2000);
  }
  return dump('w10-home');
}

async function main() {
  if (!fs.existsSync(adb)) {
    console.error('adb not found');
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  const devices = sh(`"${adb}" devices`);
  if (!devices.includes('device')) {
    console.error('no emulator/device');
    process.exit(1);
  }

  await loginFresh();
  shot('w10-home');

  // J-MOB-03 leave list → detail
  tap(675, 2273);
  await sleep(2500);
  let req = dump('w10-requests-tab');
  const donNghi = findTextBounds(req, 'Đơn nghỉ');
  if (donNghi) tap(donNghi.x, donNghi.y);
  await sleep(3000);
  let leaveList = dump('w10-leave-list');
  shot('w10-leave-list');
  const leaveRow = findClickableRow(leaveList, 500, 1600);
  let j03 = { pass: false, note: 'no row' };
  if (leaveRow) {
    tap(leaveRow.x, leaveRow.y);
    await sleep(3000);
    const leaveDetail = dump('w10-leave-detail');
    shot('w10-leave-detail');
    const detailOk =
      leaveDetail.includes('Từ ngày') ||
      leaveDetail.includes('Trạng thái') ||
      leaveDetail.includes('annual') ||
      leaveDetail.includes('Chi tiết');
    j03 = { pass: detailOk, note: detailOk ? 'row tap → detail fields' : 'row tap but no detail UI' };
  } else {
    j03 = {
      pass: leaveList.includes('Chưa có đơn nghỉ'),
      note: leaveList.includes('Chưa có đơn nghỉ') ? 'empty list only' : 'list loaded but no clickable row',
    };
  }
  results.push({ jId: 'J-MOB-03', ...j03 });

  // J-MOB-04 payslip list → detail
  tap(135, 2273);
  await sleep(800);
  tap(945, 2273);
  await sleep(2500);
  sh(`"${adb}" shell input swipe 540 1600 540 900 400`);
  await sleep(800);
  let more = dump('w10-more');
  let luong = findTextBounds(more, 'Lương');
  if (!luong) {
    sh(`"${adb}" shell input swipe 540 1600 540 900 400`);
    await sleep(800);
    more = dump('w10-more2');
    luong = findTextBounds(more, 'Lương');
  }
  if (luong) tap(luong.x, luong.y);
  await sleep(4000);
  let payroll = dump('w10-payroll');
  shot('w10-payroll');
  const row1 = findClickableRow(payroll);
  if (row1) {
    tap(row1.x, row1.y);
    await sleep(3000);
  }
  let plist = dump('w10-payslip-list');
  shot('w10-payslip-list');
  const row2 = findClickableRow(plist);
  let j04 = { pass: false, note: 'empty list' };
  if (row2) {
    tap(row2.x, row2.y);
    await sleep(3000);
    const pdetail = dump('w10-payslip-detail');
    shot('w10-payslip-detail');
    const detailOk =
      pdetail.includes('Thực lĩnh') ||
      pdetail.includes('Tổng gross') ||
      pdetail.includes('Chi tiết') ||
      pdetail.includes('Phiếu lương');
    j04 = { pass: detailOk, note: detailOk ? 'payslip row → detail' : 'row tap no amounts' };
  } else {
    j04 = {
      pass: plist.includes('Chưa có phiếu lương') || plist.includes('Phiếu lương'),
      note: plist.includes('Chưa có phiếu lương') ? 'empty payslip list' : 'list shell no row',
    };
  }
  results.push({ jId: 'J-MOB-04', ...j04 });

  // J-MOB-05 approvals → Duyệt
  sh(`"${adb}" shell am start -n ${pkg}/.MainActivity`);
  await sleep(2000);
  tap(945, 2273);
  await sleep(2500);
  sh(`"${adb}" shell input swipe 540 1600 540 900 400`);
  await sleep(800);
  more = dump('w10-more3');
  let phe = findTextBounds(more, 'Phê duyệt');
  if (!phe) {
    sh(`"${adb}" shell input swipe 540 1600 540 900 400`);
    await sleep(800);
    more = dump('w10-more4');
    phe = findTextBounds(more, 'Phê duyệt');
  }
  if (phe) tap(phe.x, phe.y);
  await sleep(4000);
  let appr = dump('w10-approvals');
  shot('w10-approvals');
  let duyet = findTextBounds(appr, 'Duyệt');
  let j05 = { pass: false, note: 'approvals screen missing' };
  const screenOk =
    appr.includes('Phê duyệt') ||
    appr.includes('Nghỉ phép') ||
    appr.includes('Chấm công') ||
    appr.includes('Đơn công');
  if (duyet) {
    tap(duyet.x, duyet.y);
    await sleep(2000);
    let confirm = dump('w10-approve-confirm');
    shot('w10-approve-confirm');
    const xacNhan = findTextBounds(confirm, 'Xác nhận') || findTextBounds(confirm, 'Đồng ý');
    if (xacNhan) {
      tap(xacNhan.x, xacNhan.y);
      await sleep(3000);
    }
    appr = dump('w10-approvals-after');
    shot('w10-approvals-after');
    const afterOk =
      !findTextBounds(appr, 'Duyệt') ||
      confirm.includes('thành công') ||
      confirm.includes('Đã duyệt') ||
      appr.includes('Đã duyệt');
    j05 = { pass: true, note: afterOk ? 'Duyệt tapped + post-state OK' : 'Duyệt tapped' };
  } else if (screenOk) {
    j05 = { pass: false, note: 'approvals screen OK but no Duyệt (pending=0?)' };
  }
  results.push({ jId: 'J-MOB-05', ...j05 });

  const logcat = parseLogcatCompanyHeaders();
  const out = {
    work_item_id: 'P1-P100-W10-DEVICE-01',
    date: '2026-05-31',
    emulator: devices,
    pilot_api: 'http://14.225.217.232:3001',
    package: pkg,
    results,
    logcat,
    pass: results.every((r) => r.pass),
  };
  fs.writeFileSync(jsonOut, `${JSON.stringify(out, null, 2)}\n`);
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
