import { writeFileSync } from 'node:fs';

const urls = [
  'http://14.225.217.232:8088/hr/src/lib/labelMaps.ts',
  'http://127.0.0.1:5173/src/lib/labelMaps.ts',
  'http://127.0.0.1:5173/hr/src/lib/labelMaps.ts',
];

const out = [];
for (const u of urls) {
  try {
    const r = await fetch(u);
    const t = await r.text();
    out.push({
      url: u,
      status: r.status,
      len: t.length,
      head: t.slice(0, 200).replace(/\n/g, ' | '),
      resolveFail: (t.match(/Failed to resolve import "[^"]+"/g) || []).slice(0, 5),
      isHtml: /<!DOCTYPE|<html/i.test(t),
    });
  } catch (e) {
    out.push({ url: u, error: String(e).slice(0, 200) });
  }
}
writeFileSync('docs/qa/evidence/_tmp-labelmaps-fetch.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
