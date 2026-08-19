# Evidence: Audit MD Panel W3 Buckets

**Date**: 2026-08-18
**Role**: Antigravity (QA Engineer)

## Bối cảnh
Thực hiện code audit file `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx` để kiểm tra logic giới hạn hiển thị "Chỉ đọc REF" và các nút Open Standalone Tab cho các bucket W3.

## Phân tích Code

- **Khai báo `isW3StandaloneBucket`**:
  ```typescript
  const isW3StandaloneBucket =
    bucket === 'employmentTypes' ||
    bucket === 'decisionTypes' ||
    bucket === 'insuranceTypes' ||
    bucket === 'insurers';
  ```
- **Khai báo `extensionMutateDisabled`**:
  ```typescript
  const extensionMutateDisabled = leaveTypesRefReadOnly || isW3StandaloneBucket;
  ```
- File `mdBucketRegistry.ts` định nghĩa tổng cộng 14 bucket. 
- Component `MasterDataBucketPanel` chỉ apply logic vô hiệu hóa (disable) tính năng CRUD và hiển thị CTA chuyển hướng (Standalone Tabs) đối với chính xác 4 buckets được chỉ định (như trên), hoặc `leaveTypes` khi có `leaveTypesRefReadOnly`.
- Form tạo mới (`openCreate`, `onSave`) cũng như nút `Ngưng` (`onDeactivate`) đều bị ẩn đối với các bucket bị khóa bởi `extensionMutateDisabled`.

## Đánh giá
**Kết quả**: NO_BUG
Logic trong `MasterDataSettingsPanel.tsx` đã được giới hạn chính xác cho 4 bucket W3 đúng như thiết kế gốc. Component không lỡ apply logic sai cho toàn bộ 14 buckets.
