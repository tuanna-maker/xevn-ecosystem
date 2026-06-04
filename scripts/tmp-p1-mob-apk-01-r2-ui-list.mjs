#!/usr/bin/env node
import fs from 'node:fs';
const x = fs.readFileSync(process.argv[2], 'utf8');
const texts = [...x.matchAll(/text="([^"]{2,80})"/g)].map((m) => m[1]);
console.log([...new Set(texts)].join('\n'));
