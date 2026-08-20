import { readFileSync } from 'node:fs';

const file = process.argv[2] || 'docs/qa/evidence/screens/r-spine-at-nav-01-qa/r2-seek-1.xml';
const xml = readFileSync(file, 'utf8');
const nodes = [...xml.matchAll(/<node [^>]+>/g)].map((m) => m[0]);
for (const n of nodes) {
  if (/Đi muộn|attendance-stat|check-in-fab|Đi làm|Vắng/.test(n)) {
    const text = (n.match(/text="([^"]*)"/) || [])[1];
    const desc = (n.match(/content-desc="([^"]*)"/) || [])[1];
    const rid = (n.match(/resource-id="([^"]*)"/) || [])[1];
    const bounds = (n.match(/bounds="([^"]*)"/) || [])[1];
    const click = (n.match(/clickable="([^"]*)"/) || [])[1];
    console.log(JSON.stringify({ text, desc, rid, bounds, click }));
  }
}
console.log('has Thao tác nhanh', xml.includes('Thao tác nhanh'));
console.log('has Loại điều chỉnh', xml.includes('Loại điều chỉnh'));
