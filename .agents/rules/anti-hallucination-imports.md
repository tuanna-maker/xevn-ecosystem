---
name: Anti-Hallucination & Import Verification
description: Quy tắc bắt buộc kiểm tra chéo (Cross-check) trước khi import thư viện hoặc utility để chống lỗi 500 do sai đường dẫn.
---

# Quy tắc Chống Ảo giác Import (Anti-Hallucination Imports)

Để tuyệt đối không lặp lại tình trạng sập Vite do import sai đường dẫn hoặc thư viện không tồn tại, Agent phải tuân thủ:

## 1. Không bao giờ "Đoán Mò" (No Guessing)
- Tuyệt đối không tự giả định dự án có cài đặt một thư viện bên thứ 3 nào đó (ví dụ: `swr`, `axios`, `lodash`) nếu chưa dùng lệnh kiểm tra `package.json` hoặc chưa thấy nó được dùng ở file khác.
- Tuyệt đối không tự bịa ra đường dẫn utility (ví dụ `@/lib/errorMatcher`, `@/utils/format`) dựa trên thói quen.

## 2. Bắt buộc sao chép Pattern có sẵn (Cross-check Pattern)
Khi tạo mới một Custom Hook, Component, hoặc Service, **BẮT BUỘC** phải dùng công cụ `grep_search` hoặc `view_file` để mở một file tương tự có sẵn trong cùng thư mục và sao chép chính xác các dòng `import`.

**Đặc thù bắt buộc của dự án XeVN Ecosystem:**
- Fetching Data: BẮT BUỘC dùng `@tanstack/react-query` (`useQuery`, `useMutation`), **TUYỆT ĐỐI KHÔNG** dùng `swr`.
- Gọi API HTTP: BẮT BUỘC dùng hàm `requestHrm` được export từ `import { requestHrm } from '@/integrations/hrmApi';`, TUYỆT ĐỐI KHÔNG tự bịa ra biến `hrmHttp` hoặc gọi axios trực tiếp. Tốt nhất là khai báo hàm ở trong `hrmApi.ts` và import hàm đó vào hook.
- Xử lý lỗi API: BẮT BUỘC dùng `import { toErrorMessage } from '@/lib/apiError';`.
- Hiển thị thông báo: BẮT BUỘC dùng `import { toast } from 'sonner';`.
