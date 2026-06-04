import fs from 'fs';
const h = fs.readFileSync(
  'c:/Users/ADMIN/Downloads/Telegram Desktop/TSCAir_BRD_TASMOS_v2.1 (2).html',
  'utf8',
);
const i = h.indexOf('<div class="doc-page cover">');
const end = h.indexOf('<div class="doc-page"', i + 10);
console.log(h.slice(i, end > i ? end : i + 2500));
