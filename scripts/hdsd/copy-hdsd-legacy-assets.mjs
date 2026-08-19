#!/usr/bin/env node
/** Copy legacy capture filenames when manifest ids were renamed mid-wave. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetRelativePath } from './hdsd-figure-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '../../docs/client-delivery/hdsd/assets');

const copies = [
  { from: 'xbos/xbos-4-3.png', to: assetRelativePath('xbos', 'XBOS.4.3a') },
];

for (const { from, to } of copies) {
  const src = path.join(ASSETS, from);
  const dest = path.join(ASSETS, to);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied ${from} → ${to}`);
  }
}
