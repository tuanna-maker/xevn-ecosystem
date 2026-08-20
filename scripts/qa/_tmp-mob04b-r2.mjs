import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r2';

function adbSh(...a) {
  spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8' });
}

async function dump(name) {
  for (let i = 0; i < 5; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-face.xml');
      await sleep(400);
      spawnSync(adb, ['-s', S, 'pull', '/sdcard/qa-face.xml', `${OUT}/${name}.xml`]);
      const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 20e6 });
      if (shot.stdout?.length) fs.writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return fs.readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch {
      await sleep(1000);
    }
  }
  throw new Error('dump fail');
}

function find(xml, ridPart) {
  const m = xml.match(new RegExp(`resource-id="${ridPart}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
  if (!m) return null;
  return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
}

adbSh('shell', 'am', 'start', '-n', 'vn.xevn.hrm.mobile/.MainActivity');
await sleep(4000);
let xml = await dump('mob04b-checkin-base');
if (!xml.includes('check-in-channel-gps')) {
  const tile = xml.match(/resource-id="home-action-tile-checkin"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (tile) {
    adbSh('shell', 'input', 'tap', String(Math.floor((+tile[1] + +tile[3]) / 2)), String(Math.floor((+tile[2] + +tile[4]) / 2)));
    await sleep(2500);
    xml = await dump('mob04b-checkin-nav');
  }
}
const face = find(xml, 'check-in-channel-face-mvp');
if (face) {
  adbSh('shell', 'input', 'tap', String(face.x), String(face.y));
  await sleep(1500);
  xml = await dump('mob04b-face-selected');
}
const out = {
  face_mvp_honesty_banner: xml.includes('face-mvp-honesty-banner'),
  check_in_submit: xml.includes('check-in-submit'),
  submit_disabled: /resource-id="check-in-submit"[^>]*enabled="false"/.test(xml.replace(/\n/g, ' ')),
};
fs.writeFileSync('docs/qa/evidence/_tmp-mob04b-r2.json', JSON.stringify(out, null, 2));
console.log(out);
