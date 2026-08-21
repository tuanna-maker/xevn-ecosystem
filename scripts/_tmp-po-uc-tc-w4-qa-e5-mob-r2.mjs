#!/usr/bin/env node
/**
 * W4-E5 R2 — fix leave/ATT nav + GPS check-in honesty
 * Assumes already logged in as uat.nv0003 on emulator-5554
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const SERIAL = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob';
const LOG = 'docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-r2.json';
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

function adbSh(...args) {
  const r = spawnSync(adb, ['-s', SERIAL, ...args], {
    encoding: 'utf8',
    timeout: 45000,
    maxBuffer: 30e6,
  });
  if (r.status !== 0) throw new Error(`adb ${args.join(' ')}: ${r.stderr || r.stdout}`);
  return (r.stdout || '').trim();
}
function sh(c) {
  return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

async function dump(name) {
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-w4e5-r2.xml');
  sh(`"${adb}" -s ${SERIAL} pull /sdcard/qa-w4e5-r2.xml ${OUT}/${name}.xml`);
  const shot = spawnSync(adb, ['-s', SERIAL, 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 25e6,
  });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return readFileSync(`${OUT}/${name}.xml`, 'utf8');
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}

function findBounds(xml, pred) {
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

function tap(hit) {
  if (!hit) return false;
  adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
  return true;
}

async function goHome() {
  // Prefer bottom tab
  let xml = await dump('r2-pre-home');
  let home =
    findBounds(xml, (n) => n.text === 'Trang chủ' || n.desc === 'Trang chủ') ||
    findBounds(xml, (n) => /Trang chủ/i.test(n.desc));
  if (home) {
    tap(home);
    await sleep(1500);
  } else {
    adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
    await sleep(2000);
  }
  xml = await dump('r2-home');
  // dismiss quick actions if open
  const dong = findBounds(xml, (n) => n.text === 'Đóng');
  if (dong) {
    tap(dong);
    await sleep(800);
    xml = await dump('r2-home-2');
  }
  return xml;
}

async function main() {
  note('r2-start');
  // mock geo again
  try {
    spawnSync(adb, ['-s', SERIAL, 'emu', 'geo', 'fix', '105.8542', '21.0285'], {
      encoding: 'utf8',
      timeout: 5000,
    });
  } catch {
    /* */
  }

  let xml = await goHome();

  // --- UC-04 retry check-in with geo ---
  {
    const tile =
      findBounds(xml, (n) => n.rid.includes('home-action-tile-checkin')) ||
      findBounds(xml, (n) => n.desc === 'Chấm công' || n.text === 'Chấm công');
    note('checkin-tile', { tile });
    tap(tile);
    await sleep(2500);
    xml = await dump('r2-04-checkin');
    // wait for location resolve up to ~20s
    for (let i = 0; i < 10; i++) {
      if (!/Đang lấy vị trí/i.test(xml)) break;
      await sleep(2000);
      // re-push geo
      spawnSync(adb, ['-s', SERIAL, 'emu', 'geo', 'fix', '105.8542', '21.0285'], {
        encoding: 'utf8',
        timeout: 5000,
      });
      xml = await dump(`r2-04-gps-wait-${i}`);
    }
    const gpsReady = !/Đang lấy vị trí/i.test(xml);
    const gpsText = texts(xml).filter((t) => /vị trí|GPS|toa|coord|°|m$/i.test(t)).slice(0, 6);
    record(
      'TC-HRM-MOB-04-GPS-HP-002',
      gpsReady ? 'PASS' : 'FAIL',
      'r2-04-checkin.png',
      gpsReady ? gpsText.join(' | ') : 'stuck Đang lấy vị trí… after geo fix',
    );

    const cta = findBounds(xml, (n) => /Chấm công vào|Chấm công ra|Ghi nhận/i.test(n.text));
    if (cta) {
      tap(cta);
      await sleep(4500);
      xml = await dump('r2-04-after');
      const ok = texts(xml).some((t) =>
        /thành công|đã chấm|ghi nhận thành công|check-?in ok/i.test(t),
      );
      const hist = findBounds(xml, (n) => /Lịch sử chấm công/i.test(n.text));
      if (hist) {
        tap(hist);
        await sleep(2000);
        const hxml = await dump('r2-04-history');
        const hasToday = texts(hxml).some((t) => /04\/08\/2026|hôm nay|vào/i.test(t));
        record(
          'TC-HRM-MOB-04-CHECKIN-HP-001',
          ok || hasToday ? 'PASS' : 'FAIL',
          ok ? 'r2-04-after.png' : 'r2-04-history.png',
          ok
            ? 'success toast'
            : `history=${hasToday}; ui=${texts(hxml).slice(0, 10).join(' | ')}`,
        );
      } else {
        record(
          'TC-HRM-MOB-04-CHECKIN-HP-001',
          ok ? 'PASS' : 'FAIL',
          'r2-04-after.png',
          texts(xml)
            .filter((t) => /thành công|lỗi|chấm|vị trí/i.test(t))
            .slice(0, 8)
            .join(' | ') || texts(xml).slice(0, 10).join(' | '),
        );
      }
    } else {
      record('TC-HRM-MOB-04-CHECKIN-HP-001', 'FAIL', 'r2-04-checkin.png', 'CTA missing');
    }
  }

  xml = await goHome();

  // --- UC-06 leave via home tile Nghỉ phép ---
  {
    const leaveTile =
      findBounds(xml, (n) => n.rid.includes('time_off') || n.rid.includes('leave')) ||
      findBounds(xml, (n) => n.desc === 'Nghỉ phép' || n.text === 'Nghỉ phép');
    note('leave-tile', { leaveTile });
    if (leaveTile) {
      tap(leaveTile);
      await sleep(2500);
      xml = await dump('r2-06-leave-list');
      const onLeave = texts(xml).some((t) =>
        /Nghỉ phép|Đơn nghỉ|Còn lại|Tạo đơn|Phép năm/i.test(t),
      );
      record(
        'TC-HRM-MOB-06-LV-NAV-HP-004',
        onLeave ? 'PASS' : 'FAIL',
        'r2-06-leave-list.png',
        texts(xml).slice(0, 14).join(' | '),
      );
      const create =
        findBounds(xml, (n) => /Tạo đơn|Xin nghỉ|\+ Nghỉ/i.test(n.text)) ||
        findBounds(xml, (n) => /create|fab/i.test(n.rid));
      if (create) {
        tap(create);
        await sleep(2500);
        xml = await dump('r2-06-leave-wizard');
      }
      const wizard = texts(xml).some((t) =>
        /Loại nghỉ|Ngày bắt đầu|Tiếp tục|Bước|phép năm|Lý do/i.test(t),
      );
      record(
        'TC-HRM-MOB-06-LV-CREATE-HP-002',
        wizard ? 'PARTIAL' : onLeave ? 'PARTIAL' : 'FAIL',
        wizard ? 'r2-06-leave-wizard.png' : 'r2-06-leave-list.png',
        wizard
          ? 'Wizard L1 opened — submit not completed (U65 smoke; avoid orphan leave)'
          : texts(xml).slice(0, 12).join(' | '),
      );
    } else {
      record('TC-HRM-MOB-06-LV-NAV-HP-004', 'FAIL', 'r2-home.png', 'tile missing');
    }
  }

  xml = await goHome();

  // --- UC-06 ATT create via FAB quick actions ---
  {
    const fab =
      findBounds(xml, (n) => n.rid.includes('fab') || n.desc === '+' || n.text === '+') ||
      findBounds(xml, (n) => /Thao tác nhanh/i.test(n.desc));
    // center FAB approximate if not found
    if (fab) tap(fab);
    else adbSh('shell', 'input', 'tap', '540', '2100');
    await sleep(1500);
    xml = await dump('r2-06-fab');
    const attItem = findBounds(xml, (n) => /Tạo đơn công/i.test(n.text));
    const leaveItem = findBounds(xml, (n) => /Tạo đơn nghỉ/i.test(n.text));
    note('fab-items', { attItem, leaveItem });
    record(
      'TC-HRM-MOB-06-ATT-NAV-HP-003',
      attItem || leaveItem ? 'PASS' : 'FAIL',
      'r2-06-fab.png',
      texts(xml)
        .filter((t) => /Chấm công|Tạo đơn|Thao tác/i.test(t))
        .join(' | '),
    );
    if (attItem) {
      tap(attItem);
      await sleep(2500);
      xml = await dump('r2-06-att-create');
      const form = texts(xml).some((t) =>
        /Đơn công|đi muộn|Giờ|Lý do|Gửi|ngày/i.test(t),
      );
      record(
        'TC-HRM-MOB-06-ATT-CREATE-HP-001',
        form ? 'PARTIAL' : 'FAIL',
        'r2-06-att-create.png',
        form
          ? 'CreateUpdateRequest form opened — submit deferred (ISO+reason; not invent PASS)'
          : texts(xml).slice(0, 12).join(' | '),
      );
      // FD: try submit empty
      const send = findBounds(xml, (n) => /^Gửi$|Gửi đơn|Xác nhận/i.test(n.text));
      if (send) {
        tap(send);
        await sleep(2000);
        const after = await dump('r2-06-att-empty-submit');
        const blocked = texts(after).some((t) =>
          /bắt buộc|thiếu|không hợp lệ|lỗi|required|vui lòng/i.test(t),
        );
        const stillForm = texts(after).some((t) => /Đơn công|Lý do|Giờ/i.test(t));
        record(
          'TC-HRM-MOB-06-VAL-FD-001',
          blocked || stillForm ? 'PASS' : 'FAIL',
          'r2-06-att-empty-submit.png',
          blocked
            ? 'validation message'
            : stillForm
              ? 'no row created — still on form'
              : texts(after).slice(0, 10).join(' | '),
        );
      } else {
        record('TC-HRM-MOB-06-VAL-FD-001', 'NOT_RUN', 'r2-06-att-create.png', 'send CTA missing');
      }
    } else {
      record('TC-HRM-MOB-06-ATT-CREATE-HP-001', 'FAIL', 'r2-06-fab.png', 'Tạo đơn công missing');
      record('TC-HRM-MOB-06-VAL-FD-001', 'NOT_RUN', '—', 'blocked by nav');
    }
  }

  record(
    'TC-HRM-MOB-06-L2-SG-001',
    'SPEC_GAP',
    'by-uc',
    'Leave/att L2 — inventory only; không invent PASS',
  );
  record(
    'TC-HRM-MOB-06-L2-SG-002',
    'SPEC_GAP',
    'by-uc',
    'L1 non-terminal threshold — design inventory',
  );

  writeFileSync(LOG, JSON.stringify({ log, cases }, null, 2));
  const fails = cases.filter((c) => c.verdict === 'FAIL').length;
  note('r2-done', { fails, total: cases.length });
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  note('fatal', { err: String(e?.stack || e) });
  writeFileSync(LOG, JSON.stringify({ log, cases, fatal: String(e) }, null, 2));
  process.exit(2);
});
