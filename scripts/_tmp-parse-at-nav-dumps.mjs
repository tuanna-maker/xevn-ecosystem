import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dir = 'docs/qa/evidence/screens/r-spine-at-nav-01-qa';
for (const f of readdirSync(dir).filter((x) => x.endsWith('.xml')).sort()) {
  const xml = readFileSync(path.join(dir, f), 'utf8');
  const texts = [...xml.matchAll(/text="([^"]+)"/g)].map((m) => m[1]);
  const interesting = texts.filter((t) =>
    /muộn|Đi|Đơn|Cài|Hồ sơ|Thao|công|Settings|Việc|late|stat|Nguyễn/i.test(t),
  );
  const hasLate = xml.includes('Đi muộn') || xml.includes('attendance-stat-late');
  const hasSettings = xml.includes('Cài đặt') || xml.includes('Đơn công');
  console.log(
    JSON.stringify({
      f,
      n: texts.length,
      hasLate,
      hasSettings,
      interesting: interesting.slice(0, 30),
    }),
  );
}
