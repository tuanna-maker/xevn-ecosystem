#!/usr/bin/env node
/**
 * Fix mojibake UTF-8 in HRM import dialog components (Windows-1252 misread as UTF-8).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  'apps/web/hrm/src/components/contract/ContractImportDialog.tsx',
  'apps/web/hrm/src/components/insurance/InsuranceImportDialog.tsx',
  'apps/web/hrm/src/components/company/DepartmentImportDialog.tsx',
];

/** Order: longer strings first to avoid partial replacements. */
const REPLACEMENTS = [
  ['NgĂ\xa0y hiá»‡u lá»±c (DD/MM/YYYY)', 'Ngày hiệu lực (DD/MM/YYYY)'],
  ['NgĂ\xa0y háº¿t háº¡n (DD/MM/YYYY)', 'Ngày hết hạn (DD/MM/YYYY)'],
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
  ['Nguyá»…n VÄƒn A', 'Nguyễn Văn A'],
  ['Tráº§n Thá»‹ B', 'Trần Thị B'],
  ['Tráº§n VÄƒn B', 'Trần Văn B'],
  ['LĂª VÄƒn C', 'Lê Văn C'],
  ['NhĂ³m Frontend', 'Nhóm Frontend'],
  ['PhĂ¡t triá»ƒn giao diá»‡n', 'Phát triển giao diện'],
  ['PhĂ¡t triá»ƒn vĂ\xa0 váº­n hĂ\xa0nh há»‡ thá»‘ng', 'Phát triển và vận hành hệ thống'],
  ['Quáº£n lĂ½ nhĂ¢n sá»± vĂ\xa0 tuyá»ƒn dá»¥ng', 'Quản lý nhân sự và tuyển dụng'],
  ['Máº«u nháº­p há»£p Ä‘á»“ng', 'Mẫu nhập hợp đồng'],
  ['Máº«u nháº­p báº£o hiá»ƒm', 'Mẫu nhập bảo hiểm'],
  ['Máº«u nháº­p phĂ²ng ban', 'Mẫu nhập phòng ban'],
  ['Import há»£p Ä‘á»“ng tá»« Excel', 'Import hợp đồng từ Excel'],
  ['Import báº£o hiá»ƒm tá»« Excel', 'Import bảo hiểm từ Excel'],
  ['ÄĂ£ táº£i file máº«u thĂ\xa0nh cĂ´ng', 'Đã tải file mẫu thành công'],
  ['Táº£i file máº«u (.xlsx)', 'Tải file mẫu (.xlsx)'],
  ['Táº£i file máº«u', 'Tải file mẫu'],
  ['Táº£i file Excel máº«u Ä‘á»ƒ biáº¿t Ä‘á»‹nh dáº¡ng dá»¯ liá»‡u cáº§n nháº­p', 'Tải file Excel mẫu để biết định dạng dữ liệu cần nhập'],
  ['KĂ©o tháº£ file hoáº·c click Ä‘á»ƒ chá»n', 'Kéo thả file hoặc click để chọn'],
  ['Há»— trá»£: .xlsx, .xls, .csv (tá»‘i Ä‘a 5MB)', 'Hỗ trợ: .xlsx, .xls, .csv (tối đa 5MB)'],
  ['HÆ°á»›ng dáº«n:', 'Hướng dẫn:'],
  ['Loáº¡i HÄ:', 'Loại HĐ:'],
  ['Loáº¡i HÄ', 'Loại HĐ'],
  ['MĂ£ HÄ', 'Mã HĐ'],
  ['NhĂ¢n viĂªn', 'Nhân viên'],
  ['NgĂ\xa0y hiá»‡u lá»±c', 'Ngày hiệu lực'],
  ['Lá»—i/Cáº£nh bĂ¡o', 'Lỗi/Cảnh báo'],
  ['Tá»•ng sá»‘ dĂ²ng:', 'Tổng số dòng:'],
  ['há»£p lá»‡', 'hợp lệ'],
  ['cáº£nh bĂ¡o', 'cảnh báo'],
  ['lá»—i', 'lỗi'],
  ['Há»£p lá»‡', 'Hợp lệ'],
  ['Cáº£nh bĂ¡o', 'Cảnh báo'],
  ['Lá»—i', 'Lỗi'],
  ['DĂ²ng', 'Dòng'],
  ['Tráº¡ng thĂ¡i', 'Trạng thái'],
  ['Chá»n file khĂ¡c', 'Chọn file khác'],
  ['Há»§y', 'Hủy'],
  ['Äang import dá»¯ liá»‡u...', 'Đang import dữ liệu...'],
  ['Tiáº¿n Ä‘á»™', 'Tiến độ'],
  ['Import hoĂ\xa0n táº¥t!', 'Import hoàn tất!'],
  ['ThĂ\xa0nh cĂ´ng', 'Thành công'],
  ['CĂ³ cáº£nh bĂ¡o', 'Có cảnh báo'],
  ['Tháº¥t báº¡i', 'Thất bại'],
  ['ÄĂ³ng', 'Đóng'],
  ['Vui lĂ²ng chá»n file Excel (.xlsx, .xls) hoáº·c CSV', 'Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV'],
  ['File khĂ´ng cĂ³ dá»¯ liá»‡u', 'File không có dữ liệu'],
  ['Lá»—i Ä‘á»c file. Vui lĂ²ng kiá»ƒm tra Ä‘á»‹nh dáº¡ng file', 'Lỗi đọc file. Vui lòng kiểm tra định dạng file'],
  ['khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng', 'không được để trống'],
  ['Ä‘Ă£ tá»“n táº¡i trong há»‡ thá»‘ng', 'đã tồn tại trong hệ thống'],
  ['bá»‹ trĂ¹ng trong file import', 'bị trùng trong file import'],
  ['khĂ´ng náº±m trong danh sĂ¡ch chuáº©n', 'không nằm trong danh sách chuẩn'],
  ['khĂ´ng há»£p lá»‡', 'không hợp lệ'],
  ['máº·c Ä‘á»‹nh lĂ\xa0', 'mặc định là'],
  ['Äá»‹nh dáº¡ng ngĂ\xa0y:', 'Định dạng ngày:'],
  ['CĂ¡c cá»™t báº¯t buá»™c:', 'Các cột bắt buộc:'],
  ['há»c viá»‡c, thá»­ viá»‡c', 'học việc, thử việc'],
  ['Sá»‘ BHXH', 'Số BHXH'],
  ['Sá»‘ BHYT', 'Số BHYT'],
  ['Sá»‘ BHTN', 'Số BHTN'],
  ['MĂ£ NV', 'Mã NV'],
  ['TĂªn NV', 'Tên NV'],
  ['Ä‘Ă£ cĂ³ báº£o hiá»ƒm trong há»‡ thá»‘ng', 'đã có bảo hiểm trong hệ thống'],
  ['ChÆ°a cĂ³ sá»‘ báº£o hiá»ƒm nĂ\xa0o Ä‘Æ°á»£c nháº­p', 'Chưa có số bảo hiểm nào được nhập'],
  ['Nháº­p Ă­t nháº¥t má»™t sá»‘ báº£o hiá»ƒm (BHXH, BHYT hoáº·c BHTN)', 'Nhập ít nhất một số bảo hiểm (BHXH, BHYT hoặc BHTN)'],
  ['báº£o hiá»ƒm', 'bảo hiểm'],
  ['MĂ´ táº£', 'Mô tả'],
  ['â€¢', '•'],
  ['Ghi chĂº', 'Ghi chú'],
  ['NgÆ°á»i táº¡o', 'Người tạo'],
];

let total = 0;
for (const rel of FILES) {
  const file = path.join(root, rel);
  let content = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [from, to] of REPLACEMENTS) {
    const parts = content.split(from);
    if (parts.length > 1) {
      count += parts.length - 1;
      content = parts.join(to);
    }
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log(`${rel}: ${count} replacements`);
  total += count;
}
console.log(`Total: ${total} replacements`);
