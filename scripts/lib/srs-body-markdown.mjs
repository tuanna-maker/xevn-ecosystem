/**
 * SRS body markdown — aligned with docs/standards/BRD_SRS_WRITING_STANDARDS.md §3 (8 chapters).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { embedImagePlaceholders } from './doc-markdown-prep.mjs';
import { reqIdFor } from './srs-uc-enrich.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function statRowHtml(rows) {
  const body = rows
    .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
    .join('\n');
  return `<table class="stat-row">\n<thead><tr><th>Chỉ tiêu</th><th>Giá trị</th></tr></thead>\n<tbody>\n${body}\n</tbody>\n</table>\n`;
}

export function flowBoxHtml(steps) {
  const items = steps.map((text) => `<li>${text}</li>`).join('\n');
  return `<ol class="srs-steps">\n${items}\n</ol>\n`;
}

export function twoColHtml(leftTitle, leftMd, rightTitle, rightMd) {
  return `<div class="two-col">
<div class="col-box"><h4>${leftTitle}</h4>\n\n${leftMd}\n</div>
<div class="col-box"><h4>${rightTitle}</h4>\n\n${rightMd}\n</div>
</div>\n`;
}

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
    .replace(/^### 2\.1[^\n]*\n/m, '#### Bốn tầng kiến trúc\n\n')
    .replace(/^### 2\.2[^\n]*\n/m, '#### Vai trò và tích hợp giữa các thành phần\n\n');
}

function loadApiHints() {
  const p = path.join(ROOT, 'docs/srs-overrides/_api-hints.json');
  if (!fs.existsSync(p)) return [];
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return (data.routes || []).map((r) => ({
    method: r.method,
    path: r.path.replace(/\/api([^/])/g, '/api/$1').replace(/\/api\/\//g, '/api/'),
    file: r.file,
  }));
}

function apiTableMarkdown(routes, filterFn, limit = 40) {
  const filtered = routes.filter(filterFn).slice(0, limit);
  if (!filtered.length) return '| Method | Path | Ghi chú |\n|--------|------|--------|\n| — | — | Chưa quét controller |';
  return (
    '| Method | Path | Ghi chú |\n|--------|------|--------|\n' +
    filtered.map((r) => `| ${r.method} | \`${r.path}\` | ${path.basename(r.file || '')} |`).join('\n')
  );
}

export function buildChapter1Architecture(brd) {
  let arch = sliceBetween(brd, /^## 2\. Kiến trúc tổng thể/, /^## 3\./);
  let integration = sliceBetween(brd, /^## 11\. Luồng tích hợp/, /^## 12\./);
  arch = embedImagePlaceholders(arch);
  integration = embedImagePlaceholders(integration);

  return `## 1. KIẾN TRÚC HỆ THỐNG

${statRowHtml([
  ['Use case có mã (toàn hệ)', '**373**'],
  ['Danh mục cấu hình XBOS', '**183**'],
  ['Phân hệ nghiệp vụ', '**4** — Portal, XBOS, HRM, Logistic'],
  ['Kênh triển khai', '**3** — Cổng Web, API, Mobile'],
])}

### 1.1 Kiến trúc N tầng

Hệ sinh thái XeVN OS tổ chức theo **bốn tầng** — từ giao diện người dùng đến lưu trữ tập trung. Bảng dưới là đặc tả phần mềm (SRS); hình minh họa và chi tiết vai trò từng thành phần kế thừa BRD.

| Tầng | Thành phần | Vai trò | Công nghệ / giao thức |
|------|------------|---------|------------------------|
| Trình bày | Cổng Web tập đoàn, ứng dụng HRM Mobile | Giao diện điều hành, nhập liệu, phê duyệt | React · Vite; React Native / Expo |
| Nghiệp vụ | API & UI HRM, Logistic (giai đoạn 2) | Giao dịch hàng ngày: nhân sự, vận chuyển | NestJS REST · PostgreSQL |
| Nền tảng | XBOS — danh mục, workflow, tổ chức | Chuẩn hóa, phát hành catalog, điều phối duyệt | NestJS · workflow engine |
| Dữ liệu | PostgreSQL (OLTP) | Lưu trữ tập trung, phân tách tenant/company | Prisma · migration có kiểm soát |

${flattenBrdArchSlice(arch)}

### 1.2 Mô hình tích hợp (Hub-and-Spoke)

Hệ sinh thái dùng mô hình **Hub-and-Spoke**: XBOS là hub danh mục và workflow; HRM/Logistic là spoke nghiệp vụ; Cổng Web là điểm vào điều hành.

${integration.replace(/^## 11\./, '')}

### 1.3 Stack công nghệ chính

${twoColHtml(
  'Backend',
  `| Thành phần | Công nghệ |
|------------|-----------|
| API HRM | NestJS · PostgreSQL |
| API XBOS | NestJS · PostgreSQL |
| Auth | JWT access + refresh |
| Workflow | XBOS workflow engine |`,
  'Frontend & Mobile',
  `| Thành phần | Công nghệ |
|------------|-----------|
| Cổng Web | React · Vite |
| HRM Mobile | React Native / Expo |
| Realtime | Socket.IO (inbox) |`,
)}

### 1.4 Cấu trúc monorepo

| Thư mục | Nội dung | Port mặc định (dev) |
|---------|----------|---------------------|
| \`apps/api/hrm-api\` | API Nhân sự | **28001** |
| \`apps/api/xbos-api\` | API nền tảng XBOS | **28002** |
| \`apps/web/web-portal\` | Cổng Web Command Center | **5175** (proxy API) |
| \`apps/mobile/hrm-mobile\` | Ứng dụng nhân viên | — |

### 1.5 Luồng danh mục XBOS → HRM (tóm tắt kiến trúc)

| Bước | Tác nhân | Kết quả |
|------|----------|---------|
| 1 | XBOS | Phát hành catalog (\`version\`, \`checksum\`) |
| 2 | HRM | Pull snapshot theo tenant |
| 3 | HR tenant | Gửi extension batch |
| 4 | XBOS Workflow | Approve / reject merge |

\`\`\`mermaid
sequenceDiagram
  participant X as XBOS
  participant H as HRM API
  participant W as Workflow
  X->>H: Published catalog
  H->>H: Local snapshot
  H->>W: Extension approval
  W-->>H: Merge or reject
\`\`\`

---`;
}

export function buildChapter2Auth(eco) {
  const scope01 = sliceBetween(eco, /^## 3\. UC-ECO-SCOPE-01/, /^## 4\./);
  const scope02 = sliceBetween(eco, /^## 4\. UC-ECO-SCOPE-02/, /^## 5\./);
  const errMatrix = sliceBetween(eco, /^## 5\. Ma trận mã lỗi/, /^## 6\./);

  return `## 2. XÁC THỰC, PHÂN QUYỀN & PHẠM VI

### 2.1 Luồng đăng nhập — Cổng Web (XBOS)

${flowBoxHtml([
  'Người dùng mở Cổng Web Command Center.',
  'POST đăng nhập XBOS — nhận JWT access + refresh.',
  'Chọn tenant / membership từ danh sách được phép.',
  'Mọi request nghiệp vụ kèm <code>Authorization</code>, <code>x-tenant-id</code>, <code>x-company-id</code>.',
  'Gateway kiểm tra RBAC trước khi chuyển tới HRM/XBOS API.',
])}

### 2.2 Luồng đăng nhập — HRM Mobile

${flowBoxHtml([
  'Nhân viên nhập email/mật khẩu trên app.',
  'POST <code>/api/hrm/auth/mobile/login</code> — UC-HRM-MOB-01.',
  'Chọn company: POST <code>select-membership</code> — UC-HRM-MOB-02.',
  'Lưu token SecureStore; không lưu mật khẩu plaintext.',
])}

### 2.3 Luồng refresh token

${flowBoxHtml([
  'Client phát hiện 401 hoặc access token sắp hết hạn.',
  'POST refresh với refresh token hợp lệ.',
  'Nhận cặp token mới (rotate refresh).',
  'Thất bại → buộc đăng nhập lại.',
])}

### 2.4 Phân vùng dữ liệu runtime (UC-ECO-SCOPE)

${scope01.replace(/^## 3\./, '#### 2.4.1').replace(/^###/g, '#####')}

${scope02.replace(/^## 4\./, '#### 2.4.2').replace(/^###/g, '#####')}

### 2.5 Ma trận tình huống → hành vi → mã lỗi

${errMatrix.replace(/^## 5\./, '')}

### 2.6 Header chuẩn toàn hệ

| Header / Claim | Bắt buộc | Mô tả |
|----------------|----------|--------|
| \`Authorization\` | Có* | Bearer JWT (trừ UC-ECO-SCOPE-01 theo môi trường) |
| \`x-tenant-id\` | Có* | UUID tenant — UC-ECO-SCOPE-02 |
| \`x-company-id\` | Có* | UUID công ty khi nghiệp vụ HRM/Logistic yêu cầu |
| \`x-request-id\` | Không | UUID trace end-to-end |
| \`Idempotency-Key\` | Không | POST ghi — replay offline mobile |

<div class="callout">Mọi use case tại <strong>Chương 5</strong> kế thừa BR-ECO-SCOPE-02 trừ khi ghi rõ ngoại lệ UC-ECO-SCOPE-01.</div>

---`;
}

export function buildChapter3Catalog(apiRoutes) {
  return `## 3. ĐẶC TẢ PHÂN HỆ A — CATALOG & MASTER DATA

### 3.1 Luồng phát hành danh mục (flow-box)

${flowBoxHtml([
  'Quản trị XBOS cấu hình 6 nhóm trường hồ sơ (XBOS-DM-HRM-02).',
  'Validate schema JSON — lưu bản nháp.',
  'Phát hành phiên bản: POST publish — tạo <code>version</code> + <code>checksum</code> (XBOS-DM-HRM-09).',
  'HRM pull: POST/GET sync — lưu snapshot (XBOS-DM-HRM-10, HRM-SC-02).',
  'HR tenant bổ sung giá trị: batch <code>pending</code> (HRM-SC-03).',
  'Lãnh đạo duyệt qua workflow inbox (UC-XBOS-CAT-*).',
])}

### 3.2 API endpoint — XBOS Catalog & Governance

${apiTableMarkdown(
  apiRoutes,
  (r) => /catalog|governance|settings-catalog|workflow/i.test(r.path) && /xbos/i.test(r.path),
  35,
)}

### 3.3 Trường dữ liệu chính & quy tắc

| Khái niệm | Quy tắc |
|-----------|---------|
| \`catalogKey\` | Khóa danh mục duy nhất trong phân hệ |
| \`version\` | Tăng khi publish; không sửa sau publish |
| \`checksum\` | So sánh pull — trùng thì <code>not_modified</code> |
| Extension batch | Trạng thái <code>pending</code> → workflow → <code>merged</code> / <code>rejected</code> |

### 3.4 Luồng change control (deprecation / xóa trường)

| Quy tắc | Mã BR | Hành vi |
|---------|-------|---------|
| Không xóa trực tiếp khung chuẩn | BR-CAT-01 | Yêu cầu removal qua workflow |
| Mở rộng tenant | BR-CAT-02 | Lô chờ duyệt tập đoàn |
| Deprecation | BR-CAT-03 | Đánh dấu deprecated trước khi gỡ |

---`;
}

export function buildChapter4Hrm(hrm, apiRoutes) {
  const ucList = sliceBetween(hrm, /^## 2\. Danh Sách Use Case/, /^## 3\./);
  const seq = sliceBetween(hrm, /^## 3\. Luồng Nghiệp Vụ/, /^## 4\./);

  return `## 4. ĐẶC TẢ PHÂN HỆ B — HRM / NGHIỆP VỤ CHÍNH

### 4.1 Vòng đời đơn từ (bảng bước → actor → API → trạng thái)

| Đơn | Bước | Actor | API / sự kiện | Trạng thái |
|-----|------|-------|---------------|------------|
| Nghỉ phép | Tạo | Nhân viên | POST \`/api/hrm/attendance/leave-requests\` | SUBMITTED |
| Nghỉ phép | Duyệt | Quản lý | POST \`.../approve\` | APPROVED |
| Nghỉ phép | Từ chối | Quản lý | POST \`.../reject\` + comment | REJECTED |
| Chỉnh sửa chấm công | Tạo | Nhân viên | POST \`/api/hrm/attendance/update-requests\` | PENDING |
| Chỉnh sửa chấm công | Duyệt | Quản lý | PATCH / approve | APPROVED |
| Dịch vụ HR | Tạo → duyệt | NV / QL | \`/api/hrm/operations/service-requests\` | Theo workflow |

### 4.2 Pipeline thông báo (bất biến)

${flowBoxHtml([
  'Sau ghi DB thành công → fanout sự kiện (<code>leave_request.*</code>, <code>attendance_update_request.*</code>).',
  'Ghi <code>hrm_inbox_notifications</code> theo company + recipient.',
  'Socket.IO broadcast tới client đang online.',
  'Push token (UC-HRM-MOB) — FCM khi cấu hình.',
  'Webhook outbound (nếu tenant bật).',
])}

### 4.3 Luồng tổng quát HRM

${seq}

### 4.4 Danh sách endpoint theo nhóm (rút gọn từ triển khai)

#### 4.4.1 Admin & health

${apiTableMarkdown(apiRoutes, (r) => /\/api\/hrm(\/|$)/.test(r.path) && /admin|metrics|^GET \/api\/hrm$/i.test(r.method + ' ' + r.path), 12)}

#### 4.4.2 Chấm công & đơn từ

${apiTableMarkdown(apiRoutes, (r) => /attendance/i.test(r.path), 20)}

#### 4.4.3 Nhân viên, lương, tuyển dụng

${apiTableMarkdown(
  apiRoutes,
  (r) => /employees|payroll|recruitment|operations|notifications|settings-catalog/i.test(r.path),
  25,
)}

### 4.5 Use case chuẩn HRM (tham chiếu Chương 5)

${ucList.replace(/docs\//g, '')}

---`;
}

export function buildChapter6Portal() {
  return `## 6. PORTAL & TÍCH HỢP LIÊN PHÂN HỆ

### 6.1 Hợp đồng nhúng iframe (Command Center ↔ HRM)

| Thành phần | Hành vi bắt buộc |
|------------|-------------------|
| Host (Portal) | Truyền <code>tenantId</code>, <code>companyId</code>, <code>module</code>, <code>route</code> qua postMessage |
| iframe HRM | Không chia sẻ cookie cross-origin; dùng token riêng phạm vi |
| Dialog / modal | BR-ECO-UX-01: backdrop phủ full viewport Cổng Web |
| UC tham chiếu | UC-HRM-20 .. UC-HRM-27 (Chi tiết tại Chương 5) |

### 6.2 Catalog extension rules

| Điều kiện | Hành động | Kết quả |
|-----------|-----------|---------|
| Giá trị thiếu trong khung chuẩn | POST extension-items | Batch pending |
| Lãnh đạo approve | Workflow complete approve | Merge vào snapshot |
| Reject có comment | Workflow reject | Thông báo HR |

### 6.3 Workflow engine API (XBOS)

| Method | Path | Mô tả |
|--------|------|--------|
| POST | \`/api/xbos/workflow/sessions\` | Khởi tạo phiên |
| POST | \`/api/xbos/workflow/sessions/:id/steps/:stepId/complete\` | Approve / reject bước |
| GET | Inbox Cổng Web | Danh sách phiên chờ duyệt |

<div class="callout-warn">Logistic Phase 2 dùng cùng workflow engine cho đơn/chuyến khi triển khai — API contract tham chiếu UC Logistic tại Chương 5.</div>

---`;
}

export function buildChapter7Errors() {
  return `## 7. MÃ LỖI CHUẨN & VALIDATION

### 7.1 Cấu trúc mã lỗi

Định dạng: \`{PREFIX}-ERR-{NHOM}\` hoặc mã ngắn \`SCOPE_TENANT_REQUIRED\`.

| PREFIX | Phân hệ |
|--------|---------|
| ECO | Phạm vi toàn hệ |
| XBOS | Nền tảng, catalog, workflow |
| HRM | HRM Web / API / Mobile |
| LG | Logistic (Phase 2) |

### 7.2 Bảng mã lỗi theo nhóm

#### Auth & phạm vi

| Code | HTTP | Message (VI) |
|------|------|--------------|
| SCOPE_TENANT_REQUIRED | 400 | Thiếu tenant |
| SCOPE_COMPANY_REQUIRED | 400 | Thiếu company |
| *-ERR-FORBIDDEN | 403 | Không đủ quyền |
| *-ERR-VALIDATION | 400 | Dữ liệu không hợp lệ |

#### Catalog & đồng bộ

| Code | HTTP | Message (VI) |
|------|------|--------------|
| HRM-ERR-UPSTREAM | 502 | Lỗi XBOS khi pull |
| HRM-SYNC-001 | 502 | Đồng bộ danh mục thất bại |
| XBOS-ERR-CONFLICT | 409 | Phiên bản catalog xung đột |

#### Nghiệp vụ HRM

| Code | HTTP | Message (VI) |
|------|------|--------------|
| HRM-ERR-CONFLICT | 409 | Trạng thái đơn không cho phép |
| HRM-ERR-ADMIN-NOT-FOUND | 404 | Không tìm thấy quản trị |
| HRM-MOB-ERR-OFFLINE | — | Client — hàng đợi offline |

### 7.3 Quy tắc validation chung

- UUID \`tenantId\`, \`companyId\` khi header/claim yêu cầu.
- Enum \`decision\`: \`approve\` | \`reject\`; \`comment\` bắt buộc khi reject (policy).
- Pagination: \`page\` ≥ 1, \`pageSize\` ≤ giới hạn cấu hình (mặc định 50).

### 7.4 State machine (logical)

${twoColHtml(
  'HRM — Đơn nghỉ / chỉnh sửa',
  `**Nghỉ phép:** DRAFT → SUBMITTED → APPROVED | REJECTED

**Chỉnh sửa chấm công:** DRAFT → PENDING → APPROVED | REJECTED`,
  'XBOS — Catalog & workflow',
  `**Catalog:** DRAFT → PUBLISHED → SUPERSEDED

**Workflow:** OPEN → IN_PROGRESS → COMPLETED | REJECTED`,
)}

Chi tiết mã lỗi từng UC: **Chương 5** và **Phụ lục B**.

---`;
}

export function buildChapter8Nfr() {
  return `## 8. NFR CHI TIẾT & TRIỂN KHAI

### 8.1 Mục tiêu hiệu năng (đo được)

| KPI | Mục tiêu | Điều kiện đo |
|-----|----------|--------------|
| API P95 đọc | ≤ **800 ms** | Staging, 100 req/phút, đã seed tenant |
| API P95 ghi | ≤ **1200 ms** | POST đơn nghỉ / chấm công |
| Uptime API | ≥ **99,5%** / tháng | Synthetic probe + health |
| Thời gian render TOC HTML | ≤ **5 s** | File SRS đầy đủ trên Chrome |

### 8.2 Bảo mật kỹ thuật

| Kiểm soát | Yêu cầu |
|-----------|---------|
| Mật khẩu | bcrypt; không log plaintext |
| JWT | Access ≤ 15 phút; refresh rotate |
| CORS | Whitelist origin Cổng Web / Mobile |
| Rate limit | Gateway — chống brute force login |
| Audit log | 100% thao tác ghi: userId, tenantId, requestId |

### 8.3 Biến môi trường chuẩn

| Biến | Phân hệ | Mô tả |
|------|---------|--------|
| \`HRM_BE_PORT\` | HRM API | Port host (mặc định 28001) |
| \`XBOS_BE_PORT\` | XBOS API | Port host (mặc định 28002) |
| \`DATABASE_URL\` | BE | PostgreSQL connection |
| \`JWT_SECRET\` | Auth | Ký token — không commit repo |

### 8.4 Chuẩn seed & khởi tạo

- Seed **idempotent**: chạy lại không nhân đôi tenant/user.
- Tenant master \`xevn\` dùng bootstrap; không xóa tenant khác khi seed (UC-ECO-MASTER-02).
- Catalog pilot: seed workflow + danh mục HRM trước UAT.

---`;
}

export function buildAppendices(ucRows) {
  const appendixB = ucRows
    .map((r) => `| ${r.stt} | BR-ECO-SCOPE-02 | ${reqIdFor(r)} | ${r.code} | Test · Demo · Inspection |`)
    .join('\n');

  const apiIndex = new Map();
  for (const r of ucRows) {
    const key = r.code.startsWith('LG-')
      ? 'Logistic API'
      : r.code.includes('HRM')
        ? 'HRM API'
        : 'XBOS API';
    if (!apiIndex.has(key)) apiIndex.set(key, []);
    apiIndex.get(key).push(r.code);
  }

  const appendixC = [...apiIndex.entries()]
    .map(([k, codes]) => `### ${k}\n\n${codes.join(', ')}`)
    .join('\n\n');

  const appendixA = ucRows
    .map((r) => {
      const mod = r.code.startsWith('LG-MB')
        ? 'M08'
        : r.code.startsWith('LG-')
          ? 'M07'
          : r.code.includes('HRM-MOB')
            ? 'M06'
            : r.code.includes('HRM') || r.code.startsWith('HRM-')
              ? 'M05'
              : r.code.includes('XBOS-DM-HRM') || r.code.includes('XBOS-CAT')
                ? 'M02'
                : r.code.includes('XBOS-DM-LOG')
                  ? 'M03'
                  : r.code.match(/^UC-ECO|^UC-CC/)
                    ? 'M00'
                    : r.code.match(/^UC-RACI|^UC-XBOS-WF/)
                      ? 'M04'
                      : 'M01';
      const phase = /^LG-/.test(r.code) ? 'Phase 2' : 'Phase 1';
      return `| ${r.stt} | ${r.code} | ${r.name} | ${mod} | ${phase} |`;
    })
    .join('\n');

  return `
## Phụ lục A — Ma trận tra cứu use case

| STT | Mã | Tên | Module SRS | Phase |
|-----|-----|-----|------------|-------|
${appendixA}

---

## Phụ lục B — Traceability BR → REQ-SRS → UC → Test

| STT | BR (tham chiếu) | REQ-SRS | UC | Bằng chứng nghiệm thu |
|-----|-----------------|---------|-----|------------------------|
${appendixB}

---

## Phụ lục C — Chỉ mục API theo phân hệ

${appendixC}

---
`;
}

export function buildDocInfoBlock() {
  return `## 0. THÔNG TIN TÀI LIỆU

| Mục | Giá trị |
|-----|---------|
| Mã tài liệu | UNICOM/SRS-XEVN-OS-001 |
| Phiên bản | 1.3 |
| Ngày hiệu lực | Tháng 5/2026 |
| Loại | Software Requirements Specification (SRS) |
| Phạm vi | Hệ sinh thái XeVN — XBOS, HRM, Logistic, Cổng Web |

**Mục đích:** Đặc tả yêu cầu phần mềm cho toàn hệ sinh thái — chức năng, hành vi hệ thống, giao diện lập trình (API), dữ liệu, ràng buộc phi chức năng và tiêu chí nghiệm thu — làm cơ sở thiết kế chi tiết, phát triển, kiểm thử và nghiệm thu.

**Cấu trúc:** 8 chương (Kiến trúc → Xác thực & phạm vi → Catalog → HRM → Chi tiết 373 use case → Portal & tích hợp → Mã lỗi → NFR) và phụ lục tra cứu.

**Thay đổi phiên bản 1.3:** Bổ sung nội dung mục 1.1 Kiến trúc N tầng; chuẩn hóa danh sách bước (đăng nhập, luồng nghiệp vụ); đồng bộ đặc tả phạm vi UC-ECO-SCOPE vào chương 2.

**Tài liệu tham chiếu (theo tên):**
- BRD — XeVN Ecosystem OS
- SRS — Định danh và phạm vi toàn hệ
- SRS — Phân hệ HRM
- SRS — Ứng dụng HRM Mobile

---`;
}
