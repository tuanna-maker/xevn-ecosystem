#!/usr/bin/env node
import fs from 'node:fs';

const xmlPath = process.argv[2];
const pattern = process.argv[3];
const x = fs.readFileSync(xmlPath, 'utf8');
console.log(new RegExp(pattern).test(x) ? 'YES' : 'NO');
