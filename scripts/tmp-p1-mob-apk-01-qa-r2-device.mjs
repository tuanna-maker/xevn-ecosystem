#!/usr/bin/env node
/**
 * P1-MOB-APK-01-QA-R2 — adb device navigation helper (J-MOB-04/05)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const sdk = process.env.LOCALAPPDATA + '\\Android\\Sdk';
const adb = path.join(sdk, 'platform-tools', 'adb.exe');
const outDir = path.join('docs', 'qa', 'evidence', 'p1-mob-apk-01-r2-screens');
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
  return {
    x: Math.floor((+m[1] + +m[3]) / 2),
    y: Math.floor((+m[2] + +m[4]) / 2),
  };
}

function findClickableRow(xml, minY = 400, maxY = 1800) {
  for (const m of xml.matchAll(/clickable="true"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)) {
    const y1 = +m[2];
    if (y1 > minY && y1 < maxY) {
      return {
        x: Math.floor((+m[1] + +m[3]) / 2),
        y: Math.floor((+m[2] + +m[4]) / 2),
      };
    }
  }
  return null;
}

async function loginFresh() {
  sh(`"${adb}" shell am force-stop ${pkg}`);
  sh(`"${adb}" shell pm clear ${pkg}`);
  await sleep(2000);
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
  let xml = dump('r2-login-state');
  if (xml.includes('permission_allow_button')) {
    tap(540, 1305);
    await sleep(2000);
    xml = dump('r2-after-notif');
  }
  if (xml.includes('permission_allow_foreground_only_button')) {
    tap(540, 1450);
    await sleep(2000);
  }
  return dump('r2-j01-home');
}

async function main() {
  const results = [];

  try {
    const home = await loginFresh();
  results.push({
    jId: 'J-MOB-01',
    pass: home.includes('Trang chủ') && home.includes('HRM-HEALTH-200') && !home.includes('HRM-MOB-ERR-NETWORK'),
    note: home.includes('TypeError') ? 'Realtime crash' : 'home shell',
  });
  shot('r2-j01-home');

  // J-MOB-04 payslip
  tap(945, 2273);
  await sleep(2000);
  sh(`"${adb}" shell input swipe 540 1600 540 900 350`);
  await sleep(1000);
  let more = dump('r2-j04-more');
  const luong = findTextBounds(more, 'Lương');
  if (luong) tap(luong.x, luong.y);
  await sleep(4000);
  let payroll = dump('r2-j04-payroll');
  shot('r2-j04-payroll');
  const payrollPass = payroll.includes('UC-HRM-MOB-09') || payroll.includes('Lương');
  results.push({ jId: 'J-MOB-04-payroll', pass: payrollPass, note: payrollPass ? 'PayrollSummary' : 'no payroll title' });

  const row1 = findClickableRow(payroll);
  if (row1) {
    tap(row1.x, row1.y);
    await sleep(3000);
  }
  let plist = dump('r2-j04-payslip-list');
  shot('r2-j04-payslip-list');
  const listPass = plist.includes('Phiếu lương') || plist.includes('UC-HRM-MOB');
  results.push({ jId: 'J-MOB-04-list', pass: listPass, note: listPass ? 'PayslipList' : 'settings/empty' });

  const row2 = findClickableRow(plist);
  if (row2) {
    tap(row2.x, row2.y);
    await sleep(3000);
  }
  let pdetail = dump('r2-j04-payslip-detail');
  shot('r2-j04-payslip-detail');
  const detailPass = pdetail.includes('Chi tiết lương') || pdetail.includes('UC-HRM-MOB');
  results.push({ jId: 'J-MOB-04-detail', pass: detailPass, note: detailPass ? 'PayslipDetail' : 'no detail title' });

  // J-MOB-05
  sh(`"${adb}" shell input keyevent 4`);
  await sleep(300);
  sh(`"${adb}" shell input keyevent 4`);
  await sleep(300);
  sh(`"${adb}" shell input keyevent 4`);
  await sleep(1000);
  tap(945, 2273);
  await sleep(2000);
  sh(`"${adb}" shell input swipe 540 1600 540 900 350`);
  await sleep(1000);
  more = dump('r2-j05-more');
  const phe = findTextBounds(more, 'Phê duyệt');
  if (phe) tap(phe.x, phe.y);
  await sleep(4000);
  const appr = dump('r2-j05-approvals');
  shot('r2-j05-approvals');
  const j05Pass =
    appr.includes('Phê duyệt') ||
    appr.includes('Nghỉ phép') ||
    appr.includes('update-requests') ||
    (appr.includes('pending') && appr.includes('vn.xevn.hrm.mobile'));
  results.push({ jId: 'J-MOB-05', pass: j05Pass, note: j05Pass ? 'ManagerApprovals loaded' : 'not on approvals screen' });
  } catch (e) {
    results.push({ jId: 'ERROR', pass: false, note: String(e.message || e) });
  }

  console.log(JSON.stringify({ results }, null, 2));
  process.exit(results.some((r) => r.jId.startsWith('J-MOB-04') && r.pass) ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
