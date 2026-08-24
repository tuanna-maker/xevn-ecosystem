#!/usr/bin/env node
/**
 * Resolve leftover merge conflict markers (prefer "Stashed changes") and fix Vietnamese mojibake.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  'apps/web/hrm/src/components/contract/ContractImportDialog.tsx',
  'apps/web/hrm/src/components/insurance/InsuranceImportDialog.tsx',
  'apps/web/hrm/src/pages/Attendance.tsx',
  'apps/web/hrm/src/components/company/CompanyMembersManagement.tsx',
  'apps/web/hrm/src/components/employee/EmployeeResume.tsx',
];

function resolveMergeConflicts(content) {
  return content.replace(
    /<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/g,
    (_, _upstream, stashed) => stashed,
  );
}

/** Order: longer strings first. */
const REPLACEMENTS = [
  ['NgĂ\xa0y hiá»‡u lá»±c (DD/MM/YYYY)', 'Ngày hiệu lực (DD/MM/YYYY)'],
  ['NgĂ y hiá»‡u lá»±c (DD/MM/YYYY)', 'Ngày hiệu lực (DD/MM/YYYY)'],
  ['NgĂ\xa0y háº¿t háº¡n (DD/MM/YYYY)', 'Ngày hết hạn (DD/MM/YYYY)'],
  ['NgĂ y háº¿t háº¡n (DD/MM/YYYY)', 'Ngày hết hạn (DD/MM/YYYY)'],
  ['Tráº¡ng thĂ¡i (active/pending/expired)', 'Trạng thái (active/pending/expired)'],
  ['Tráº¡ng thĂ¡i (active/inactive)', 'Trạng thái (active/inactive)'],
  ['Má»©c lÆ°Æ¡ng Ä‘Ă³ng BH', 'Mức lương đóng BH'],
  ['MĂ£ há»£p Ä‘á»“ng', 'Mã hợp đồng'],
  ['Loáº¡i há»£p Ä‘á»“ng', 'Loại hợp đồng'],
  ['Há»£p Ä‘á»“ng thá»­ viá»‡c', 'Hợp đồng thử việc'],
  ['Há»£p Ä‘á»“ng há»c viá»‡c', 'Hợp đồng học việc'],
  ['Há»£p Ä‘á»“ng 6 thĂ¡ng', 'Hợp đồng 6 tháng'],
  ['Há»£p Ä‘á»“ng 3 nÄƒm', 'Hợp đồng 3 năm'],
  ['Há»£p Ä‘á»“ng 1 nÄƒm', 'Hợp đồng 1 năm'],
  ['MĂ£ nhĂ¢n viĂªn', 'Mã nhân viên'],
  ['TĂªn nhĂ¢n viĂªn', 'Tên nhân viên'],
  ['TĂªn trÆ°á»Ÿng phĂ²ng', 'Tên trưởng phòng'],
  ['Email trÆ°á»Ÿng phĂ²ng', 'Email trưởng phòng'],
  ['TĂªn phĂ²ng ban cha', 'Tên phòng ban cha'],
  ['TĂªn phĂ²ng ban', 'Tên phòng ban'],
  ['MĂ£ phĂ²ng ban', 'Mã phòng ban'],
  ['PhĂ²ng Ká»¹ thuáº­t', 'Phòng Kỹ thuật'],
  ['PhĂ²ng NhĂ¢n sá»±', 'Phòng Nhân sự'],
  ['PhĂ²ng ban', 'Phòng ban'],
  ['ÄĂ£ táº£i file máº«u thĂ\xa0nh cĂ´ng', 'Đã tải file mẫu thành công'],
  ['ÄĂ£ táº£i file máº«u thĂ nh cĂ´ng', 'Đã tải file mẫu thành công'],
  ['NgĂ\xa0y hiá»‡u lá»±c khĂ´ng há»£p lá»‡', 'Ngày hiệu lực không hợp lệ'],
  ['NgĂ y hiá»‡u lá»±c khĂ´ng há»£p lá»‡', 'Ngày hiệu lực không hợp lệ'],
  ['NgĂ\xa0y hiá»‡u lá»±c khĂ´ng hợp lệ', 'Ngày hiệu lực không hợp lệ'],
  ['NgĂ\xa0y háº¿t háº¡n khĂ´ng há»£p lá»‡', 'Ngày hết hạn không hợp lệ'],
  ['NgĂ y háº¿t háº¡n khĂ´ng hợp lệ', 'Ngày hết hạn không hợp lệ'],
  ['NgĂ\xa0y háº¿t háº¡n khĂ´ng hợp lệ', 'Ngày hết hạn không hợp lệ'],
  ['Tráº¡ng thĂ¡i khĂ´ng há»£p lá»‡, máº·c Ä‘á»‹nh lĂ\xa0', 'Trạng thái không hợp lệ, mặc định là'],
  ['Tráº¡ng thĂ¡i khĂ´ng hợp lệ, máº·c Ä‘á»‹nh lĂ', 'Trạng thái không hợp lệ, mặc định là'],
  ['Tráº¡ng thĂ¡i khĂ´ng hợp lệ, mặc định là', 'Trạng thái không hợp lệ, mặc định là'],
  ['Má»©c lÆ°Æ¡ng khĂ´ng hợp lệ', 'Mức lương không hợp lệ'],
  ['ChÆ°a cĂ³ sá»‘ báº£o hiá»ƒm nĂ\xa0o Ä‘Æ°á»£c nháº­p', 'Chưa có số bảo hiểm nào được nhập'],
  ['ChÆ°a cĂ³ sá»‘ bảo hiểm nĂ o Ä‘Æ°á»£c nháº­p', 'Chưa có số bảo hiểm nào được nhập'],
  ['CĂ¡c cá»™t báº¯t buá»™c:', 'Các cột bắt buộc:'],
  ['Loáº¡i HÄ:', 'Loại HĐ:'],
  ['Loáº¡i HÄ', 'Loại HĐ'],
  ['MĂ£ HÄ', 'Mã HĐ'],
  ['NhĂ¢n viĂªn', 'Nhân viên'],
  ['NgĂ\xa0y hiá»‡u lá»±c', 'Ngày hiệu lực'],
  ['Lá»—i/Cáº£nh bĂ¡o', 'Lỗi/Cảnh báo'],
  ['DĂ²ng', 'Dòng'],
  ['Tráº¡ng thĂ¡i', 'Trạng thái'],
  ['Import hoĂ\xa0n táº¥t!', 'Import hoàn tất!'],
  ['Import hoĂ n táº¥t!', 'Import hoàn tất!'],
  ['ThĂ\xa0nh cĂ´ng', 'Thành công'],
  ['ThĂ nh cĂ´ng', 'Thành công'],
  ['CĂ³ cảnh báo', 'Có cảnh báo'],
  ['Ghi chĂº', 'Ghi chú'],
  ['NgÆ°á»i táº¡o', 'Người tạo'],
  ['Äá»‹nh dáº¡ng ngĂ\xa0y:', 'Định dạng ngày:'],
  ['Äá»‹nh dáº¡ng ngĂ y:', 'Định dạng ngày:'],
  ['3 nÄƒm, 6 thĂ¡ng', '3 năm, 6 tháng'],
  ['há»c viá»‡c, thá»­ viá»‡c', 'học việc, thử việc'],
  ['â€¢', '•'],
  ['Cáº£nh bĂ¡o', 'Cảnh báo'],
  ['nhĂ¢n viĂªn khĂ´ng cĂ³ email sáº½ bá»‹ bá» qua', 'nhân viên không có email sẽ bị bỏ qua'],
  ['KhĂ´ng cĂ³ nhĂ¢n viĂªn nĂ\xa0o cĂ³ email Ä‘á»ƒ má»i', 'Không có nhân viên nào có email để mời'],
  ['THỰC LÃNH', 'THỰC LĨNH'],
];

let total = 0;
for (const rel of FILES) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    console.log(`skip missing ${rel}`);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  const beforeConflicts = content;
  content = resolveMergeConflicts(content);
  if (content !== beforeConflicts) {
    console.log(`${rel}: resolved merge conflicts`);
  }
  if (content.startsWith('   import')) {
    content = content.replace(/^   import/, 'import');
  }
  let count = 0;
  for (const [from, to] of REPLACEMENTS) {
    const parts = content.split(from);
    if (parts.length > 1) {
      count += parts.length - 1;
      content = parts.join(to);
    }
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log(`${rel}: ${count} encoding replacements`);
  total += count;
}
console.log(`Total encoding replacements: ${total}`);
