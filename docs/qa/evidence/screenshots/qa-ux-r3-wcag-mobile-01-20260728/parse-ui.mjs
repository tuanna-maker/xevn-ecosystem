import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:\\xevn-ecosystem\\docs\\qa\\evidence\\screenshots\\qa-ux-r3-wcag-mobile-01-20260728';

function extract(xml) {
  const nodes = [];
  const re = /<node([^>]+)>/g;
  let m;
  while ((m = re.exec(xml))) {
    const a = m[1];
    const g = (k) => {
      const mm = a.match(new RegExp(`${k}="([^"]*)"`));
      return mm ? mm[1] : '';
    };
    const b = g('bounds');
    const bm = b.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (!bm) continue;
    nodes.push({
      text: g('text'),
      desc: g('content-desc'),
      id: g('resource-id'),
      clickable: g('clickable'),
      x1: +bm[1],
      y1: +bm[2],
      x2: +bm[3],
      y2: +bm[4],
      w: +bm[3] - +bm[1],
      h: +bm[4] - +bm[2],
    });
  }
  return nodes;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.xml'));
for (const f of files.sort()) {
  const nodes = extract(fs.readFileSync(path.join(dir, f), 'utf8'));
  const interesting = nodes.filter(
    (n) =>
      n.id ||
      /Chấm|Đóng|Hồ sơ|Thông|Công|Tài|Trang|Thông báo|notify|fab|check-in|profile|Đi làm|avatar|bell|search|Cá nhân|Tab|Lưu|Đăng|action/i.test(
        `${n.text}${n.desc}${n.id}`,
      ),
  );
  console.log(`\n==== ${f} (${nodes.length} nodes, ${interesting.length} interesting)`);
  for (const n of interesting.slice(0, 80)) {
    console.log(
      JSON.stringify({
        id: n.id,
        text: n.text,
        desc: n.desc,
        click: n.clickable,
        w: n.w,
        h: n.h,
        y1: n.y1,
        y2: n.y2,
      }),
    );
  }
}
