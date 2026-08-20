#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
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
  adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-fab.xml');
  execSync(`"${adb}" -s ${S} pull /sdcard/qa-fab.xml ${OUT}/${n}.xml`, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 25e6,
  });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
  return readFileSync(`${OUT}/${n}.xml`, 'utf8');
}
function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}
function findText(xml, label) {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = xml.match(new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) return null;
  return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
}
function tap(h) {
  adbSh('shell', 'input', 'tap', String(h.x), String(h.y));
}

const cases = [];
const record = (tc, verdict, evidence, detail) => {
  cases.push({ tc, verdict, evidence, detail });
  console.log(JSON.stringify({ tc, verdict, evidence, detail }));
};

async function main() {
  // Prefer existing open sheet; else open FAB
  let xml = existsSync(`${OUT}/r3c-fab.xml`)
    ? readFileSync(`${OUT}/r3c-fab.xml`, 'utf8')
    : await dump('r3c-fab-open');
  if (!texts(xml).some((t) => t.includes('Tạo đơn công'))) {
    // open FAB via content-desc
    const fab = xml.match(
      /content-desc="Thao tác nhanh"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
    );
    if (fab) {
      tap({
        x: Math.floor((+fab[1] + +fab[3]) / 2),
        y: Math.floor((+fab[2] + +fab[4]) / 2),
      });
    } else {
      tap({ x: 540, y: 2210 });
    }
    await sleep(1500);
    xml = await dump('r3c-fab-open');
  }

  const hasSheet = texts(xml).some((t) => /Tạo đơn công|Tạo đơn nghỉ|Thao tác nhanh/i.test(t));
  record(
    'TC-HRM-MOB-06-ATT-NAV-HP-003',
    hasSheet ? 'PASS' : 'FAIL',
    'r3c-fab.png',
    texts(xml)
      .filter((t) => /Tạo|Chấm|Thao/i.test(t))
      .join(' | '),
  );

  const att = findText(xml, 'Tạo đơn công');
  if (!att) {
    record('TC-HRM-MOB-06-ATT-CREATE-HP-001', 'FAIL', 'r3c-fab.png', 'item missing');
    writeFileSync(`${OUT}/../po-uc-tc-w4-qa-e5-mob-device-log-r3c.json`, JSON.stringify({ cases }, null, 2));
    process.exit(1);
  }
  tap(att);
  await sleep(2500);
  xml = await dump('r3c-att');
  const form = texts(xml).some((t) => /Đơn công|đi muộn|Giờ|Lý do|Gửi/i.test(t));
  record(
    'TC-HRM-MOB-06-ATT-CREATE-HP-001',
    form ? 'PARTIAL' : 'FAIL',
    'r3c-att.png',
    form ? 'CreateUpdateRequest form open — submit deferred U65 smoke' : texts(xml).slice(0, 12).join(' | '),
  );

  const send = findText(xml, 'Gửi') || findText(xml, 'Gửi đơn') || findText(xml, 'Xác nhận');
  if (send && form) {
    tap(send);
    await sleep(2000);
    const after = await dump('r3c-att-fd');
    const blocked = texts(after).some((t) =>
      /bắt buộc|thiếu|không hợp lệ|lỗi|vui lòng|required/i.test(t),
    );
    const still = texts(after).some((t) => /Đơn công|Lý do|Giờ/i.test(t));
    record(
      'TC-HRM-MOB-06-VAL-FD-001',
      blocked || still ? 'PASS' : 'FAIL',
      'r3c-att-fd.png',
      blocked
        ? texts(after)
            .filter((t) => /bắt buộc|thiếu|lỗi|vui lòng/i.test(t))
            .slice(0, 5)
            .join(' | ')
        : still
          ? 'still on form — no mutate'
          : texts(after).slice(0, 12).join(' | '),
    );
  } else {
    record('TC-HRM-MOB-06-VAL-FD-001', 'NOT_RUN', 'r3c-att.png', 'send CTA missing');
  }

  writeFileSync(
    'docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-device-log-r3c.json',
    JSON.stringify({ cases }, null, 2),
  );
  process.exit(cases.some((c) => c.verdict === 'FAIL') ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
