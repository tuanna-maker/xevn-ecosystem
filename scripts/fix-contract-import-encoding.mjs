#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../apps/web/hrm/src/components/contract/ContractImportDialog.tsx',
);

const REPLACEMENTS = [
  ['MĂ£ há»£p Ä‘á»“ng', 'Mã hợp đồng'],
  ['TĂªn nhĂ¢n viĂªn', 'Tên nhân viên'],
  ['PhĂ²ng ban', 'Phòng ban'],
  ['Loáº¡i há»£p Ä‘á»“ng', 'Loại hợp đồng'],
  ['NgĂ\xa0y hiá»‡u lá»±c (DD/MM/YYYY)', 'Ngày hiệu lực (DD/MM/YYYY)'],
  ['NgĂ\xa0y háº¿t háº¡n (DD/MM/YYYY)', 'Ngày hết hạn (DD/MM/YYYY)'],
  ['Tráº¡ng thĂ¡i (active/pending/expired)', 'Trạng thái (active/pending/expired)'],
  ['Ghi chĂº', 'Ghi chú'],
  ['NgÆ°á»i táº¡o', 'Người tạo'],
  ['NgĂ\xa0y hiá»‡u lá»±c khĂ´ng há»£p lá»‡', 'Ngày hiệu lực không hợp lệ'],
  ['NgĂ\xa0y hiá»‡u lá»±c khĂ´ng hợp lệ', 'Ngày hiệu lực không hợp lệ'],
  ['NgĂ\xa0y háº¿t háº¡n khĂ´ng há»£p lá»‡', 'Ngày hết hạn không hợp lệ'],
  ['NgĂ\xa0y háº¿t háº¡n khĂ´ng hợp lệ', 'Ngày hết hạn không hợp lệ'],
  ['Tráº¡ng thĂ¡i khĂ´ng há»£p lá»‡, máº·c Ä‘á»‹nh lĂ\xa0', 'Trạng thái không hợp lệ, mặc định là'],
  ['Tráº¡ng thĂ¡i khĂ´ng hợp lệ, mặc định là', 'Trạng thái không hợp lệ, mặc định là'],
  ['â€¢ CĂ¡c cá»™t báº¯t buá»™c:', '• Các cột bắt buộc:'],
  ['â€¢ Loáº¡i HÄ:', '• Loại HĐ:'],
  ['â€¢ Äá»‹nh dáº¡ng ngĂ\xa0y:', '• Định dạng ngày:'],
  ['â€¢ Tráº¡ng thĂ¡i:', '• Trạng thái:'],
  ['Há»£p Ä‘á»“ng 1 nÄƒm, 3 nÄƒm, 6 thĂ¡ng, há»c viá»‡c, thá»­ viá»‡c', 'Hợp đồng 1 năm, 3 năm, 6 tháng, học việc, thử việc'],
  ['DĂ²ng', 'Dòng'],
  ['Tráº¡ng thĂ¡i', 'Trạng thái'],
  ['MĂ£ HÄ', 'Mã HĐ'],
  ['NhĂ¢n viĂªn', 'Nhân viên'],
  ['Loáº¡i HÄ', 'Loại HĐ'],
  ['NgĂ\xa0y hiá»‡u lá»±c', 'Ngày hiệu lực'],
  ['Lá»—i/Cáº£nh bĂ¡o', 'Lỗi/Cảnh báo'],
  ['Import hoĂ\xa0n táº¥t!', 'Import hoàn tất!'],
  ['ThĂ\xa0nh cĂ´ng', 'Thành công'],
  ['CĂ³ cảnh báo', 'Có cảnh báo'],
  ['khĂ´ng hợp lệ', 'không hợp lệ'],
];

let content = fs.readFileSync(file, 'utf8');
if (content.startsWith('   import')) content = content.replace(/^   import/, 'import');
let count = 0;
for (const [from, to] of REPLACEMENTS) {
  const parts = content.split(from);
  if (parts.length > 1) {
    count += parts.length - 1;
    content = parts.join(to);
  }
}
fs.writeFileSync(file, content, 'utf8');
console.log(`ContractImportDialog: ${count} replacements`);
