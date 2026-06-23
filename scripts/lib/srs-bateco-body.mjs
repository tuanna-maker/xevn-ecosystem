/**
 * SRS body — cấu trúc 6 chương theo mẫu Bateco E-Office (02_Tai_lieu_nghiep_vu).
 */
import { embedImagePlaceholders } from './doc-markdown-prep.mjs';
import { buildFunctionalRequirementsChapter } from './srs-fr-spec.mjs';

function sliceBetween(md, startRe, endRe) {
  const startFlags = startRe.flags.includes('m') ? startRe.flags : `${startRe.flags}m`;
  const endFlags = endRe.flags.includes('m') ? endRe.flags : `${endRe.flags}m`;
  const start = md.search(new RegExp(startRe.source, startFlags));
  if (start < 0) return '';
  const rest = md.slice(start);
  const end = rest.search(new RegExp(endRe.source, endFlags));
  return end > 0 ? rest.slice(0, end).trim() : rest.trim();
}

function flattenBrdArchSlice(arch) {
  return arch
    .replace(/^## 2\.[^\n]*\n*/m, '')
    .replace(/^### 2\.1[^\n]*\n/m, '')
    .replace(/^### 2\.2[^\n]*\n/m, '');
}

export function buildChapter1Intro() {
  return `## 1. Giới thiệu tài liệu

### 1.1 Mục đích

Tài liệu này mô tả yêu cầu chức năng, yêu cầu phi chức năng và các ràng buộc nghiệp vụ của **XeVN Ecosystem OS** (Cổng Web, XBOS, HRM, Logistic). Dùng làm căn cứ thiết kế chi tiết, lập trình, kiểm thử và nghiệm thu. Mỗi yêu cầu có mã \`FR-{Mã UC}\` và có thể đối chiếu với BRD — XeVN Ecosystem OS.

Người đọc chính: lập trình viên, kiểm thử, vận hành hệ thống, quản lý dự án và đại diện kỹ thuật phía khách hàng.

### 1.2 Phạm vi hệ thống

**XeVN Ecosystem OS** là hệ sinh thái quản trị tập đoàn: nền tảng XBOS (danh mục, workflow, tổ chức), phân hệ HRM (nhân sự, chấm công, lương), Logistic (kinh doanh → vận hành chuyến — giai đoạn 2), Cổng Web điều hành và ứng dụng HRM Mobile.

**Trong phạm vi:**

| Nhóm chức năng | Mô tả |
|----------------|-------|
| Phạm vi & Command Center | Đăng nhập, tenant, trung tâm điều hành, RACI |
| XBOS nền tảng | Danh mục, workflow, đồng bộ, governance |
| HRM Web/API | Nhân sự, chấm công, đơn từ, lương, tuyển dụng |
| HRM Mobile | Đăng nhập, chấm công, đơn từ, phiếu lương |
| Logistic | Chuỗi báo giá → chuyến (giai đoạn 2) |
| Tích hợp | JWT, header phạm vi, đồng bộ catalog XBOS → phân hệ |

**Ngoài phạm vi:** Hệ thống kế toán tổng hợp độc lập; cổng công khai không xác thực; chi tiết triển khai hạ tầng (thuộc tài liệu vận hành riêng).

**Phạm vi go-live Giai đoạn 1 (UAT):** **245** tình huống sử dụng — Cổng Web Command Center, nhúng HRM, HRM Mobile và nền XBOS kèm khai danh mục Logistic (chưa vận hành đơn/chuyến). SRS liệt kê **373** FR (bao gồm Giai đoạn 2); khi nghiệm thu Giai đoạn 1 chỉ đối chiếu mã thuộc ma trận Phase 1.

### 1.3 Định nghĩa và viết tắt

| Thuật ngữ | Giải thích |
|-----------|-----------|
| UC | Use case — tình huống sử dụng có mã trong BRD |
| FR | Functional Requirement — yêu cầu chức năng trong SRS (\`FR-{Mã UC}\`) |
| XBOS | Lớp nền tảng: danh mục chuẩn, workflow, tổ chức tập đoàn |
| Tenant / Company | Đơn vị pháp nhân và công ty con trong phạm vi dữ liệu |
| Catalog | Bộ danh mục đã phát hành (version, checksum) từ XBOS |
| Workflow | Quy trình phê duyệt do XBOS điều phối |
| JWT | JSON Web Token — xác thực API |
| NFR | Non-Functional Requirement — yêu cầu phi chức năng |
| MOD | Module — nhóm FR trong chương 3 (M00–M08) |

### 1.4 Các tài liệu liên quan

| # | Tài liệu | Phiên bản |
|---|---------|----------|
| 1 | BRD — XeVN Ecosystem OS | 1.1 |
| 2 | Mô tả hệ sinh thái XeVN | Cập nhật |
| 3 | SRS — Định danh và phạm vi toàn hệ | Theo phân hệ |
| 4 | Bảng tổng hợp use case hệ sinh thái XeVN | 373 UC |
| 5 | Hướng dẫn sử dụng và chạy thử (Pilot) | 1.3 |

### 1.5 Trạng thái triển khai Giai đoạn 1 (UAT)

| Hạng mục | Giá trị |
|----------|---------|
| Môi trường chạy thử | https://14-225-217-232.nip.io |
| Điểm chạm trong phạm vi | Command Center · nhúng HRM · HRM Mobile |
| Ma trận Giai đoạn 1 | **245** UC (catalog đóng) |
| Kiểm thử tích hợp API | PASS trên pilot |
| Production portal.xe.vn | **Chưa mở** |

**Giới hạn cần ghi nhận khi nghiệm thu:**

| Mã | Giới hạn |
|----|----------|
| L-01 | Tên miền production chưa cutover |
| L-02 | Đồng bộ mã nguồn (git parity) pilot ↔ nhánh phát hành — đang rà soát |
| L-03 | Tiêu chí T5 (mật độ menu HRM benchmark) **hoãn** — không chặn UAT slice |
| L-04 | FR Giai đoạn 2 (Logistic nghiệp vụ) có trong SRS nhưng **chưa** go-live |

---`;
}

export function buildChapter2Overview(brd) {
  let arch = sliceBetween(brd, /^## 2\. Kiến trúc tổng thể/, /^## 3\./);
  arch = embedImagePlaceholders(arch);
  const archBody = flattenBrdArchSlice(arch);

  return `## 2. Mô tả tổng quan hệ thống

### 2.1 Bối cảnh

Tập đoàn XeVN vận hành nhiều phân hệ nghiệp vụ trên một nền tảng chung. **XBOS** chuẩn hóa danh mục và quy trình; **HRM** và **Logistic** xử lý giao dịch hàng ngày; **Cổng Web** là điểm vào điều hành. Mô hình **Hub-and-Spoke**: XBOS là hub; phân hệ là spoke; dữ liệu OLTP tập trung PostgreSQL, phân tách theo tenant/company.

${archBody ? `\n${archBody}\n` : ''}

### 2.2 Đối tượng người dùng

| Actor | Chức năng chính |
|-------|----------------|
| **Ban điều hành / Quản trị tập đoàn** | Command Center, governance danh mục, phê duyệt mở rộng catalog |
| **Quản trị HR / IT tenant** | Cấu hình HRM, đồng bộ danh mục, quản lý nhân sự |
| **Quản lý trực tiếp** | Duyệt đơn nghỉ, chỉnh sửa chấm công, hộp thư |
| **Nhân viên** | Hồ sơ cá nhân, chấm công, đơn từ (web/mobile) |
| **Kinh doanh / Điều phối Logistic** | Báo giá, đơn, chuyến (giai đoạn 2) |
| **Lái xe** | App nhận chuyến, POD, sự cố (giai đoạn 2) |

### 2.3 Vòng đời nghiệp vụ chính

**Đơn nghỉ / chỉnh sửa chấm công (HRM):** DRAFT → SUBMITTED/PENDING → APPROVED | REJECTED (có thể gắn workflow XBOS).

**Danh mục XBOS:** DRAFT → PUBLISHED → HRM pull snapshot; extension batch \`pending\` → duyệt → merge.

**Chuyến Logistic (giai đoạn 2):** BOOKED → gán xe/lái xe → vận hành → hoàn thành → doanh thu/lương %.

\`\`\`mermaid
stateDiagram-v2
    [*] --> draft : Tạo đơn
    draft --> submitted : Trình / gửi
    submitted --> approved : Duyệt
    submitted --> rejected : Từ chối
    rejected --> draft : Chỉnh sửa lại
    approved --> [*]
\`\`\`

### 2.4 Ràng buộc hệ thống

| Ràng buộc | Mô tả |
|----------|-------|
| Phạm vi dữ liệu | Đã đăng nhập: chỉ tenant/company được gán (BR-ECO-SCOPE-02) |
| Danh mục | Công ty con không tự sửa khung chuẩn; mở rộng qua phê duyệt XBOS |
| Workflow | Một định nghĩa quy trình — nhiều nghiệp vụ (nghỉ, catalog, logistic) |
| Mobile HRM | Consumer API HRM; token SecureStore; không lưu mật khẩu plaintext |
| Logistic | Giai đoạn 2 — API và app theo contract khi triển khai |

---`;
}

export function buildChapter4Nfr() {
  return `## 4. Yêu cầu phi chức năng

### 4.1 NFR-SEC — Bảo mật

| Mã | Yêu cầu | Mức |
|----|---------|-----|
| NFR-SEC-001 | Giao tiếp client–server qua HTTPS (TLS 1.2+) | Cao |
| NFR-SEC-002 | JWT access + refresh; rotate refresh token | Cao |
| NFR-SEC-003 | Mật khẩu bcrypt; không log plaintext | Cao |
| NFR-SEC-004 | RBAC tại API; header \`x-tenant-id\`, \`x-company-id\` | Cao |
| NFR-SEC-005 | Audit 100% thao tác ghi: userId, tenantId, requestId | Cao |
| NFR-SEC-006 | CORS whitelist Cổng Web / Mobile | Cao |
| NFR-SEC-007 | Rate limit đăng nhập / API nhạy cảm | Cao |

### 4.2 NFR-PERF — Hiệu năng

| Mã | Yêu cầu | Ngưỡng |
|----|---------|--------|
| NFR-PERF-001 | API đọc thông thường | P95 ≤ **800 ms** (staging, 100 req/phút) |
| NFR-PERF-002 | API ghi (đơn từ, chấm công) | P95 ≤ **1200 ms** |
| NFR-PERF-003 | Người dùng đồng thời | ≥ **200** CCU mỗi API phân hệ |
| NFR-PERF-004 | Đồng bộ catalog lớn | Hoàn tất ≤ **30 s** hoặc báo tiến trình |

### 4.3 NFR-AVAIL — Khả dụng

| Mã | Yêu cầu |
|----|---------|
| NFR-AVAIL-001 | Uptime API ≥ **99,5%** / tháng (không tính bảo trì có lịch) |
| NFR-AVAIL-002 | Sao lưu PostgreSQL hàng ngày; giữ ≥ 30 ngày |
| NFR-AVAIL-003 | Health check \`/health\` trên mỗi API phân hệ |

### 4.4 NFR-COMPAT — Tương thích

| Mã | Yêu cầu |
|----|---------|
| NFR-COMPAT-001 | Cổng Web: Chrome, Edge, Firefox bản mới; responsive |
| NFR-COMPAT-002 | HRM Mobile: iOS ≥ 15, Android ≥ 10 (Expo/React Native) |
| NFR-COMPAT-003 | Tiếng Việt đầy đủ dấu trên UI |

### 4.5 NFR-DATA — Toàn vẹn dữ liệu

| Mã | Yêu cầu |
|----|---------|
| NFR-DATA-001 | Giao dịch ghi quan trọng trong transaction |
| NFR-DATA-002 | Migration Prisma có version; không sửa tay production |
| NFR-DATA-003 | Seed idempotent — chạy lại không nhân đôi tenant/user |

---`;
}

export function buildChapter5External() {
  return `## 5. Yêu cầu giao diện ngoài

### 5.1 Cổng Web Command Center

Cổng Web (React/Vite) gọi **XBOS API** và **HRM API** qua proxy; phiên JWT và header phạm vi trên mọi request nghiệp vụ.

| Thành phần | Yêu cầu |
|-----------|---------|
| Đăng nhập XBOS | POST login → JWT; chọn tenant/membership |
| Nhúng phân hệ | iframe/modal full viewport (BR-ECO-UX-01) |
| Hộp thư duyệt | Đọc task workflow; approve/reject |

### 5.2 HRM API & Mobile

| Thành phần | Yêu cầu |
|-----------|---------|
| HRM API | REST \`/api/hrm/*\`; NestJS; PostgreSQL |
| Mobile auth | \`/api/hrm/auth/mobile/login\`, \`select-membership\` |
| Push (tùy cấu hình) | FCM qua token đăng ký thiết bị |

### 5.3 XBOS API

| Thành phần | Yêu cầu |
|-----------|---------|
| Catalog governance | Publish, extension approval, checksum |
| Workflow engine | Khởi chạy phiên; callback trạng thái phân hệ |
| Đồng bộ | HRM/Logistic pull catalog đã publish |

### 5.4 Logistic API (giai đoạn 2)

API Logistic và app lái xe triển khai theo phase 2; contract REST tương tự HRM (JWT, phạm vi tenant). Chi tiết FR thuộc MOD-M07, MOD-M08.

---`;
}

export function buildChapter6Constraints() {
  return `## 6. Ràng buộc nghiệp vụ tổng quát

| # | Ràng buộc | Phạm vi |
|---|----------|---------|
| BR-ECO-01 | Phạm vi chưa đăng nhập chỉ khi môi trường cho phép (UC-ECO-SCOPE-01) | Toàn hệ |
| BR-ECO-02 | Đã đăng nhập: chỉ dữ liệu tenant/company được gán | Toàn hệ |
| BR-CAT-01 | Danh mục gốc do XBOS phát hành | XBOS, HRM, Logistic |
| BR-CAT-02 | Mở rộng danh mục tenant qua phê duyệt tập đoàn | HRM settings |
| BR-WF-01 | Workflow tập trung trên XBOS; hộp thư Cổng Web | Phê duyệt |
| BR-MOB-01 | Mobile không lưu mật khẩu plaintext | HRM Mobile |
| BR-HRM-01 | Đơn nghỉ/chỉnh sửa chấm công có luồng duyệt | HRM |
| BR-LOG-01 | Logistic không tự định nghĩa danh mục gốc | Giai đoạn 2 |

---

*Tài liệu được duy trì bởi UNICOM Technology Solutions Co., Ltd. Mọi thay đổi phải được ghi lịch sử phiên bản và phê duyệt.*

---`;
}

export function buildBatecoSrsMarkdown({ brd, ucRows }) {
  return `# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## XeVN Ecosystem OS — Hệ sinh thái đa phân hệ

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mã tài liệu** | UNICOM/SRS-XEVN-OS-001 |
| **Phiên bản** | 2.2 |
| **Ngày hiệu lực** | Tháng 6/2026 |
| **Trạng thái** | Bản nghiệm thử Giai đoạn 1 (UAT) |
| **Dựa trên** | BRD — XeVN Ecosystem OS |
| **Tác giả** | UNICOM Technology Solutions Co., Ltd |

${buildChapter1Intro()}

${buildChapter2Overview(brd)}

${buildFunctionalRequirementsChapter(ucRows)}

${buildChapter4Nfr()}

${buildChapter5External()}

${buildChapter6Constraints()}
`;
}
