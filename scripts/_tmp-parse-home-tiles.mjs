import { readFileSync } from 'node:fs';
const x = readFileSync('docs/qa/evidence/screens/r-spine-mgr-hier-01-qa/home-uat.nv0001.xml', 'utf8');
const tiles = [...x.matchAll(/resource-id="(home-action-tile-[^"]+)"/g)].map((m) => m[1]);
const texts = [...x.matchAll(/text="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((t) => t.length > 1 && t.length < 50)
  .slice(0, 80);
console.log(JSON.stringify({ tiles, texts }, null, 2));
