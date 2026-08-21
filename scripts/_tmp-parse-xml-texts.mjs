import { readFileSync } from 'node:fs';
const file = process.argv[2];
const x = readFileSync(file, 'utf8');
const texts = [...x.matchAll(/text="([^"]+)"/g)].map((m) => m[1]).filter((t) => t.length > 0);
const ids = [...x.matchAll(/resource-id="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
const descs = [...x.matchAll(/content-desc="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
console.log(JSON.stringify({ bytes: x.length, texts: texts.slice(0, 100), ids: ids.slice(0, 50), descs: descs.slice(0, 40) }, null, 2));
