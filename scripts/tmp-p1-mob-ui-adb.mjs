#!/usr/bin/env node
/** Parse uiautomator bounds for label text */
import fs from 'fs';
const p = process.argv[2];
const x = fs.readFileSync(p, 'utf8');
for (const m of x.matchAll(/text="([^"]*)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g)) {
  const [, t, x1, y1, x2, y2] = m;
  if (!t) continue;
  const cx = Math.floor((+x1 + +x2) / 2);
  const cy = Math.floor((+y1 + +y2) / 2);
  if (/Trang|Chấm|Đơn|Thêm|Đăng nhập|dev|Phê|Phiếu|Nghỉ/i.test(t) || t.length < 25) {
    console.log(JSON.stringify({ t, cx, cy, bounds: m[0].slice(-40) }));
  }
}
