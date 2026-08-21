import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1';

function dump(n) {
  execSync(`"${adb}" shell uiautomator dump /sdcard/qa-lv.xml`);
  execSync(`"${adb}" pull /sdcard/qa-lv.xml ${OUT}/${n}.xml`);
  return readFileSync(`${OUT}/${n}.xml`, 'utf8');
}

function tapText(xml, t) {
  const e = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`text="${e}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`);
  const m = xml.match(re);
  if (!m) return null;
  const x = Math.floor((+m[1] + +m[3]) / 2);
  const y = Math.floor((+m[2] + +m[4]) / 2);
  execSync(`"${adb}" shell input tap ${x} ${y}`);
  return { x, y, t };
}

let xml = dump('75-confirm');
const texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
console.log(JSON.stringify({ hasGuiDon: xml.includes('Gửi đơn'), texts: texts.slice(-20) }, null, 2));
const hit = tapText(xml, 'Gửi đơn');
console.log('tap', hit);
if (!hit) {
  // fallback: right-side button in modal region
  execSync(`"${adb}" shell input tap 780 1400`);
  console.log('fallback tap 780,1400');
}
await sleep(3500);
xml = dump('76-post-confirm');
const markers = ['Đã gửi', 'thành công', 'Thành công', 'Chờ duyệt', 'Lỗi', 'OK', 'Đóng', 'HRM-'].filter((t) =>
  xml.includes(t),
);
console.log(JSON.stringify({ markers, texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(-25) }, null, 2));
tapText(xml, 'OK') || tapText(xml, 'Đóng');
const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 25e6 });
if (shot.stdout?.length) writeFileSync(`${OUT}/76-post-confirm.png`, shot.stdout);
process.exit(markers.length ? 0 : 2);
