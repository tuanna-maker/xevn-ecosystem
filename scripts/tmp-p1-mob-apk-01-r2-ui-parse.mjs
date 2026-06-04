#!/usr/bin/env node
import fs from 'node:fs';

const xmlPath = process.argv[2];
const label = process.argv[3];
if (!xmlPath || !label) {
  console.error('usage: node tmp-p1-mob-apk-01-r2-ui-parse.mjs <xml> <label>');
  process.exit(1);
}
const x = fs.readFileSync(xmlPath, 'utf8');
const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp(
  `(?:text="${esc}"|content-desc="${esc}")[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`,
);
let m = x.match(re);
if (!m) {
  m = x.match(
    new RegExp(`(?:text|content-desc)="[^"]*${esc}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
  );
}
if (!m) {
  console.log('NONE');
  process.exit(0);
}
const cx = Math.round((Number(m[1]) + Number(m[3])) / 2);
const cy = Math.round((Number(m[2]) + Number(m[4])) / 2);
console.log(`${cx} ${cy}`);
