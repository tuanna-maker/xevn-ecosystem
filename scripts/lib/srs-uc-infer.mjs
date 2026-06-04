/** Shared UC name → verb inference for SRS generators. */
export function inferVerb(name) {
  const n = name.toLowerCase();
  if (/^xem |danh sách|tổng quan|tra cứu/.test(n)) return 'read';
  if (/tạo |khởi tạo|ghi nhận|đăng ký/.test(n)) return 'create';
  if (/cập nhật|sửa |chỉnh sửa/.test(n)) return 'update';
  if (/xóa |gỡ /.test(n)) return 'delete';
  if (/phê duyệt|duyệt |từ chối/.test(n)) return 'approve';
  if (/đồng bộ|sync/.test(n)) return 'sync';
  if (/cấu hình|thiết lập|định nghĩa|gán |phát hành/.test(n)) return 'config';
  return 'action';
}
