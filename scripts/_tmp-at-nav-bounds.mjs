import { readFileSync } from 'node:fs';

const files = [
  'docs/qa/evidence/screens/r-spine-at-nav-01-qa/p1-home.xml',
  'docs/qa/evidence/screens/r-spine-at-nav-01-qa/fab-pre.xml',
  'docs/qa/evidence/screens/r-spine-at-nav-01-qa/p2-after-late.xml',
  'docs/qa/evidence/screens/r-spine-at-nav-01-qa/home.xml',
];
for (const f of files) {
  let xml;
  try {
    xml = readFileSync(f, 'utf8');
  } catch {
    console.log('missing', f);
    continue;
  }
  console.log('==', f);
  for (const re of [
    /text="Đi muộn"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g,
    /content-desc="Đi muộn[^"]*"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g,
    /content-desc="[^"]*check-in-fab[^"]*"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g,
    /text="Tạo đơn công"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g,
    /resource-id="[^"]*check-in-fab"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g,
  ]) {
    const src = re.source.slice(0, 40);
    for (const m of xml.matchAll(re)) {
      console.log(src, m[1], m[2], m[3], m[4]);
    }
  }
}
