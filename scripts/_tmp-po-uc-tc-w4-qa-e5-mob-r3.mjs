#!/usr/bin/env node
/** W4-E5 R3 — dismiss HRM-ATT-201 OK then leave/ATT FAB paths */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const OUT = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob';
mkdirSync(OUT, { recursive: true });
const cases = [];
const log = [];
const note = (msg, extra = {}) => {
  const row = { t: new Date().toISOString(), msg, ...extra };
  log.push(row);
  console.log(JSON.stringify(row));
};
const record = (tc, verdict, evidence, detail = '') => {
  cases.push({ tc, verdict, evidence, detail });
  note('case', { tc, verdict, evidence, detail });
};
const adbSh = (...a) => {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', timeout: 45000, maxBuffer: 30e6 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return (r.stdout || '').trim();
};
async function dump(n) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-w4e5-r3.xml');
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-w4e5-r3.xml ${OUT}/${n}.xml`, {
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
    if (!b) continue;
    if (!pred({ text, desc, rid })) continue;
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
const tap = (h) => {
  if (!h) return false;
  adbSh('shell', 'input', 'tap', String(h.x), String(h.y));
  return true;
};

async function main() {
  let xml = await dump('r3-0');
  let ok = find(xml, (n) => n.text === 'OK' || n.text === 'Ok');
  if (ok) {
    tap(ok);
    await sleep(1000);
    xml = await dump('r3-after-ok');
  }
  let home = find(xml, (n) => n.text === 'Trang chủ' || n.desc === 'Trang chủ');
  if (home) {
    tap(home);
    await sleep(1200);
    xml = await dump('r3-home');
  }
  note('home-sample', { t: texts(xml).slice(0, 20) });

  let leave = find(
    xml,
    (n) =>
      n.desc === 'Nghỉ phép' ||
      n.text === 'Nghỉ phép' ||
      n.rid.includes('time_off') ||
      n.rid.includes('leave'),
  );
  note('leave', { leave });
  if (leave) {
    tap(leave);
    await sleep(2500);
    xml = await dump('r3-06-leave');
  }
  const onLeave = texts(xml).some((t) => /Nghỉ phép|Đơn nghỉ|Còn lại|Tạo đơn|Phép/i.test(t));
  record(
    'TC-HRM-MOB-06-LV-NAV-HP-004',
    onLeave ? 'PASS' : 'FAIL',
    'r3-06-leave.png',
    texts(xml).slice(0, 14).join(' | '),
  );

  const create = find(xml, (n) => /Tạo đơn|Xin nghỉ/i.test(n.text));
  if (create) {
    tap(create);
    await sleep(2500);
    xml = await dump('r3-06-wizard');
  }
  const wizard = texts(xml).some((t) => /Loại|Ngày|Tiếp|Bước|Lý do|phép/i.test(t));
  record(
    'TC-HRM-MOB-06-LV-CREATE-HP-002',
    wizard ? 'PARTIAL' : onLeave ? 'PARTIAL' : 'FAIL',
    wizard ? 'r3-06-wizard.png' : 'r3-06-leave.png',
    wizard ? 'Wizard L1 open — submit deferred U65 smoke' : 'no wizard',
  );

  adbSh('shell', 'input', 'keyevent', '4');
  await sleep(800);
  adbSh('shell', 'input', 'keyevent', '4');
  await sleep(1000);
  xml = await dump('r3-home2');
  home = find(xml, (n) => n.text === 'Trang chủ' || n.desc === 'Trang chủ');
  if (home) {
    tap(home);
    await sleep(1000);
    xml = await dump('r3-home3');
  }
  ok = find(xml, (n) => n.text === 'OK');
  if (ok) {
    tap(ok);
    await sleep(800);
    xml = await dump('r3-home4');
  }

  adbSh('shell', 'input', 'tap', '540', '2100');
  await sleep(1500);
  xml = await dump('r3-fab');
  const att = find(xml, (n) => /Tạo đơn công/i.test(n.text));
  const lv = find(xml, (n) => /Tạo đơn nghỉ/i.test(n.text));
  note('fab', { att, lv, t: texts(xml).filter((t) => /Tạo|Chấm|Thao/i.test(t)) });
  record(
    'TC-HRM-MOB-06-ATT-NAV-HP-003',
    att || lv ? 'PASS' : 'FAIL',
    'r3-fab.png',
    texts(xml)
      .filter((t) => /Tạo|Chấm|Thao/i.test(t))
      .join(' | '),
  );
  if (att) {
    tap(att);
    await sleep(2500);
    xml = await dump('r3-att-create');
  }
  const form = texts(xml).some((t) => /Đơn công|đi muộn|Giờ|Lý do|Gửi/i.test(t));
  record(
    'TC-HRM-MOB-06-ATT-CREATE-HP-001',
    form ? 'PARTIAL' : 'FAIL',
    form ? 'r3-att-create.png' : 'r3-fab.png',
    form ? 'form open — submit deferred' : 'missing form',
  );
  if (form) {
    const send = find(xml, (n) => /^Gửi$|Gửi đơn/i.test(n.text));
    if (send) {
      tap(send);
      await sleep(2000);
      const after = await dump('r3-att-fd');
      const blocked = texts(after).some((t) =>
        /bắt buộc|thiếu|không hợp lệ|lỗi|vui lòng/i.test(t),
      );
      const still = texts(after).some((t) => /Đơn công|Lý do/i.test(t));
      record(
        'TC-HRM-MOB-06-VAL-FD-001',
        blocked || still ? 'PASS' : 'FAIL',
        'r3-att-fd.png',
        blocked ? 'validation' : 'still on form',
      );
    } else {
      record('TC-HRM-MOB-06-VAL-FD-001', 'NOT_RUN', 'r3-att-create.png', 'no send');
    }
  }

  record('TC-HRM-MOB-06-L2-SG-001', 'SPEC_GAP', 'by-uc', 'L2 inventory — no invent PASS');
  record('TC-HRM-MOB-06-L2-SG-002', 'SPEC_GAP', 'by-uc', 'L1 non-terminal inventory');
  writeFileSync(
    'docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-r3.json',
    JSON.stringify({ log, cases }, null, 2),
  );
  note('done', { fails: cases.filter((c) => c.verdict === 'FAIL').length });
  process.exit(cases.some((c) => c.verdict === 'FAIL') ? 1 : 0);
}

main().catch((e) => {
  note('fatal', { err: String(e?.stack || e) });
  writeFileSync(
    'docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-r3.json',
    JSON.stringify({ log, cases, fatal: String(e) }, null, 2),
  );
  process.exit(2);
});
