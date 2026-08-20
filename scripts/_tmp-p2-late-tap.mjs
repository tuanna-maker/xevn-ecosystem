import { spawnSync, execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/r-spine-at-nav-01-qa';
const sh = (c) => execSync(c, { encoding: 'utf8' }).trim();

async function dump(n) {
  spawnSync(adb, ['-s', 'emulator-5554', 'shell', 'uiautomator', 'dump', '/sdcard/qa-at-nav.xml'], {
    encoding: 'utf8',
  });
  sh(`"${adb}" -s emulator-5554 pull /sdcard/qa-at-nav.xml ${OUT}/${n}.xml`);
  const shot = spawnSync(adb, ['-s', 'emulator-5554', 'exec-out', 'screencap', '-p'], {
    encoding: 'buffer',
    maxBuffer: 25e6,
  });
  if (shot.stdout?.length) writeFileSync(`${OUT}/${n}.png`, shot.stdout);
  return readFileSync(`${OUT}/${n}.xml`, 'utf8');
}

function bounds(xml, re) {
  const m = xml.match(re);
  return m ? { x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] } : null;
}

function tap(x, y) {
  sh(`"${adb}" -s emulator-5554 shell input tap ${x} ${y}`);
}

let xml = await dump('p2b-0');
for (let i = 0; i < 3; i++) {
  sh(`"${adb}" -s emulator-5554 shell input swipe 540 800 540 1800 250`);
  await sleep(400);
}
for (let i = 0; i < 8; i++) {
  xml = await dump(`p2b-seek-${i}`);
  const late = bounds(
    xml,
    /resource-id="attendance-stat-late"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
  );
  const fab = bounds(
    xml,
    /resource-id="[^"]*check-in-fab"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
  );
  const loading = xml.includes('attendance-stat-late-skeleton');
  console.log(JSON.stringify({ i, late, fab, loading }));
  if (late && fab && late.y2 < fab.y1 - 8 && !loading) {
    const x = Math.floor((late.x1 + late.x2) / 2);
    const y = Math.floor((late.y1 + late.y2) / 2);
    console.log('TAP', x, y);
    await sleep(1500);
    tap(x, y);
    await sleep(2500);
    xml = await dump('p2b-after');
    console.log(
      JSON.stringify({
        form: xml.includes('Loại điều chỉnh'),
        texts: [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).slice(0, 25),
      }),
    );
    process.exit(xml.includes('Loại điều chỉnh') ? 0 : 1);
  }
  sh(`"${adb}" -s emulator-5554 shell input swipe 540 1500 540 1100 280`);
  await sleep(600);
}
console.log('FAIL seek');
process.exit(1);
