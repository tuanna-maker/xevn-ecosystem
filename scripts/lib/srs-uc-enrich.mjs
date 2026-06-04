/**
 * Enriched per-UC SRS blocks (12 sections, ISO 29148-oriented).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { inferVerb } from './srs-uc-infer.mjs';
import { sequenceDiagramFor } from './srs-sequence-diagram.mjs';
import { resolveApiHint, errorPrefixForCode } from './srs-api-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OVERRIDES_DIR = path.join(ROOT, 'docs/srs-overrides');

export function reqIdFor(uc) {
  const mod = moduleCodeFor(uc);
  return `REQ-SRS-${mod}-${String(uc.stt).padStart(3, '0')}`;
}

export function moduleCodeFor(uc) {
  const { code } = uc;
  if (/^UC-ECO|^UC-CC/.test(code)) return 'M00';
  if (/^UC-RACI|^UC-XBOS-WF/.test(code)) return 'M04';
  if (/^XBOS-DM-HRM|^UC-XBOS-CAT/.test(code)) return 'M02';
  if (/^XBOS-DM-LOG/.test(code)) return 'M03';
  if (/^UC-HRM-MOB|^HRM-MOB/.test(code)) return 'M06';
  if (/^LG-MB-/.test(code)) return 'M08';
  if (/^LG-/.test(code)) return 'M07';
  if (/^UC-HRM|^HRM-/.test(code)) return 'M05';
  return 'M01';
}

function actorsFor(uc) {
  const ch = uc.channel.toLowerCase();
  if (ch.includes('mobile') && uc.layer.includes('Logistic')) {
    return { primary: 'Lái xe / nhân viên hiện trường', secondary: 'Điều phối viên (thông báo)' };
  }
  if (ch.includes('mobile')) {
    return { primary: 'Nhân viên', secondary: 'Quản lý trực tiếp (phê duyệt)' };
  }
  if (/catalog|danh mục|XBOS governance/i.test(uc.name + uc.group)) {
    return { primary: 'Quản trị tập đoàn (XBOS)', secondary: 'Quản trị HR tenant (HRM)' };
  }
  if (ch.includes('web portal') || ch.includes('xbos')) {
    return { primary: 'Quản trị hệ thống / Ban điều hành', secondary: 'Phân hệ HRM/Logistic (consumer)' };
  }
  return { primary: 'Người dùng nội bộ có quyền tương ứng', secondary: 'Hệ thống XBOS (danh mục/workflow)' };
}

function inputFields(uc, api) {
  const rows = [
    ['`Authorization`', 'string', 'Có', 'Bearer JWT hợp lệ'],
    ['`x-tenant-id`', 'string', 'Có*', 'UUID tenant — UC-ECO-SCOPE-02'],
    ['`x-company-id`', 'string', 'Có*', 'UUID công ty khi nghiệp vụ yêu cầu'],
    ['`x-request-id`', 'string', 'Không', 'UUID trace — khuyến nghị'],
  ];
  const v = inferVerb(uc.name);
  if (v === 'create' || v === 'update' || v === 'approve') {
    rows.push(['`body`', 'object', 'Có', `DTO theo ${api.method} ${api.path}`]);
  }
  if (v === 'read') {
    rows.push(['`page`', 'number', 'Không', 'Phân trang — mặc định page=1']);
    rows.push(['`pageSize`', 'number', 'Không', 'Giới hạn bản ghi/trang']);
    rows.push(['`filters`', 'object', 'Không', 'Lọc trạng thái, ngày, mã']);
  }
  if (/phê duyệt|duyệt|từ chối/.test(uc.name)) {
    rows.push(['`decision`', 'enum', 'Có', '`approve` | `reject`']);
    rows.push(['`comment`', 'string', 'Không', 'Bắt buộc khi từ chối (policy)']);
  }
  if (/chấm công|check-in|điểm danh/i.test(uc.name)) {
    rows.push(['`recordedAt`', 'datetime', 'Có', 'Thời điểm ghi nhận']);
    rows.push(['`geo`', 'object', 'Không', 'Tọa độ GPS nếu bật']);
  }
  if (/danh mục|catalog/i.test(uc.name)) {
    rows.push(['`catalogKey`', 'string', 'Có*', 'Khóa danh mục XBOS']);
    rows.push(['`version`', 'string', 'Không', 'Phiên bản phát hành cần pull']);
  }
  return rows;
}

function outputSection(uc, api) {
  const p = errorPrefixForCode(uc.code);
  const planned = api.planned
    ? '\n\n*Ghi chú:* API Logistic (giai đoạn 2) — hành vi và mã lỗi áp dụng khi phân hệ được triển khai.'
    : '';
  return `- **Thành công:** HTTP 200/201, envelope \`{ success: true, data, code? }\` với payload nghiệp vụ «${uc.name}».
- **Side effect:** Ghi OLTP phân hệ; audit (\`userId\`, \`tenantId\`, \`x-request-id\`).
- **Thông báo:** Fan-out in-app / push khi UC thuộc nhóm đơn từ (nghỉ phép, chỉnh sửa chấm công, dịch vụ).
- **Tích hợp XBOS:** Khi liên quan danh mục/workflow — cập nhật phiên workflow hoặc snapshot catalog.${planned}`;
}

function exceptionSection(uc) {
  const lines = [
    '- **Timeout upstream:** Gọi XBOS/HRM liên phân hệ quá SLA → retry có backoff (tối đa 2 lần) → 502.',
    '- **Mất kết nối client:** Mobile ghi hàng đợi offline (UC-HRM-MOB-14) — không mất payload đã validate.',
  ];
  if (/mobile/i.test(uc.channel)) {
    lines.push('- **Token hết hạn:** Refresh token (UC-HRM-MOB-01) — thất bại → đăng nhập lại.');
  }
  if (/workflow|phê duyệt/i.test(uc.name)) {
    lines.push('- **Phiên workflow đã đóng:** Không cho approve thêm → 409 CONFLICT.');
  }
  return lines.join('\n');
}

function mainFlowEnriched(uc, api) {
  const scope =
    'Gửi `Authorization`, `x-tenant-id`, `x-company-id` (theo UC-ECO-SCOPE-02 và BR-ECO-SCOPE-02).';
  const apiLine = api.planned
    ? `Gọi \`${api.method} ${api.path}\` (giai đoạn 2).`
    : `Gọi \`${api.method} ${api.path}\`.`;

  const steps = [
    `Người dùng (${actorsFor(uc).primary}) khởi tạo thao tác «${uc.name}» trên kênh ${uc.channel}.`,
    'Client validate trường bắt buộc phía UI (form/DTO).',
    scope,
    apiLine,
    'Service kiểm tra RBAC + phạm vi tenant/company.',
    'Validate DTO và quy tắc nghiệp vụ (BR liên quan).',
    'Ghi/đọc DB trong transaction; phát event nếu cấu hình.',
    'Trả envelope thành công hoặc mã lỗi chuẩn.',
  ];
  return steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

function altFlowsEnriched(uc) {
  const p = errorPrefixForCode(uc.code);
  return `- **[A1] Thiếu tenant/company** → HTTP 400 \`SCOPE_TENANT_REQUIRED\` hoặc \`${p}-ERR-SCOPE-INVALID\`.
- **[A2] Không đủ quyền RBAC** → HTTP 403 \`${p}-ERR-FORBIDDEN\`.
- **[A3] Dữ liệu không hợp lệ** → HTTP 400 \`${p}-ERR-VALIDATION\` + \`details[]\`.
- **[A4] Xung đột trạng thái / trùng nghiệp vụ** → HTTP 409 \`${p}-ERR-CONFLICT\`.
- **[A5] Lỗi tích hợp XBOS** → HTTP 502 \`${p}-ERR-UPSTREAM\`.`;
}

function businessRulesEnriched(uc) {
  const rules = [
    ['BR-ECO-SCOPE-02', 'Mọi đọc/ghi', 'Lọc theo tenant và company được phép'],
  ];
  if (/danh mục|catalog|đồng bộ/i.test(uc.name)) {
    rules.push(['BR-CAT-01', 'Danh mục gốc', 'Chỉ XBOS phát hành khung chuẩn']);
    rules.push(['BR-CAT-02', 'Mở rộng tenant', 'Lô chờ duyệt tập đoàn qua workflow']);
  }
  if (/workflow|phê duyệt|duyệt/i.test(uc.name)) {
    rules.push(['BR-WF-01', 'Phê duyệt', 'XBOS điều phối phiên; hộp thư Cổng Web']);
  }
  if (/mobile/i.test(uc.channel)) {
    rules.push(['BR-MOB-01', 'Bảo mật', 'Không lưu mật khẩu plaintext trên thiết bị']);
  }
  if (/nghỉ phép|leave/i.test(uc.name)) {
    rules.push(['BR-HRM-LEAVE-01', 'Đơn nghỉ', 'Quản lý duyệt; thông báo hai chiều NV–QL']);
  }
  const body = rules.map(([id, cond, act]) => `| **${id}** | ${cond} | ${act} |`).join('\n');
  return `| ID | Điều kiện | Hành động |\n|---|---|---|\n${body}`;
}

function errorTableEnriched(uc) {
  const p = errorPrefixForCode(uc.code);
  return `| Code | HTTP | Message (VI) | Khi nào |
|---|---|---|---|
| \`${p}-ERR-VALIDATION\` | 400 | Dữ liệu không hợp lệ | Thiếu/sai trường DTO |
| \`${p}-ERR-FORBIDDEN\` | 403 | Không đủ quyền | RBAC/scope |
| \`${p}-ERR-CONFLICT\` | 409 | Xung đột nghiệp vụ | Trạng thái không cho phép |
| \`${p}-ERR-SCOPE-INVALID\` | 400 | Phạm vi không hợp lệ | Sai tenant/company |
| \`${p}-ERR-UPSTREAM\` | 502 | Lỗi hệ thống nền | XBOS/dependency timeout |
| \`SCOPE_TENANT_REQUIRED\` | 400 | Thiếu tenant | Header/claim thiếu |
| \`${p}-ERR-INTERNAL\` | 500 | Lỗi hệ thống | Lỗi không mong đợi |`;
}

function acceptanceEnriched(uc, reqId) {
  return `- Thực hiện được luồng chính và nhánh A1–A5 với mã HTTP/logic khớp bảng mã lỗi.
- Dữ liệu chỉ trong phạm vi tenant/company của người dùng (trừ UC-ECO-SCOPE-01 khi môi trường cho phép).
- Audit ghi đủ \`userId\`, \`tenantId\`, \`x-request-id\` cho thao tác ghi.
- UI/API trả thông báo tiếng Việt, không lộ stack trace.

**Kiểm chứng:** Kiểm thử chức năng · Demo vận hành trên kênh ${uc.channel} · Đối chiếu BRD — XeVN Ecosystem OS.`;
}

/** Load optional file override: docs/srs-overrides/{Mxx}/{CODE}.md */
export function loadFileOverride(uc) {
  const mod = moduleCodeFor(uc);
  const p = path.join(OVERRIDES_DIR, mod, `${uc.code}.md`);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8').trim();
}

export function buildEnrichedUcMarkdown(uc, inlineOverride = null) {
  if (inlineOverride) {
    return inlineOverride.includes('#### STT')
      ? inlineOverride
      : `#### STT ${uc.stt} — ${uc.code}: ${uc.name}\n\n${inlineOverride}\n\n---\n`;
  }
  const fileOv = loadFileOverride(uc);
  if (fileOv) {
    return fileOv.includes('#### STT')
      ? `${fileOv}\n\n---\n`
      : `#### STT ${uc.stt} — ${uc.code}: ${uc.name}\n\n${fileOv}\n\n---\n`;
  }

  const api = resolveApiHint(uc.code);
  const reqId = reqIdFor(uc);
  const act = actorsFor(uc);
  const inRows = inputFields(uc, api);
  const inTable = `| Field | Type | Required | Validation rule |
|---|---|---|---|
${inRows.map((r) => `| ${r.join(' | ')} |`).join('\n')}

*Có* = bắt buộc theo phạm vi đăng nhập.`;

  return `#### STT ${uc.stt} — ${uc.code}: ${uc.name}

**Metadata (Thông tin chung):**

| Trường | Giá trị |
|---|---|
| STT | ${uc.stt} |
| REQ-ID | ${reqId} |
| ID | ${uc.code} |
| Module | ${moduleForLabel(uc)} |
| Phân hệ / Lớp | ${uc.layer} |
| Nhóm nghiệp vụ | ${uc.group} |
| Mức ưu tiên | ${priorityFor(uc)} |
| Trigger | ${triggerFor(uc)} |
| Tần suất | ${uc.channel.includes('Mobile') ? 'Theo ca / theo chuyến' : 'Hàng ngày'} |
| Phase | ${phaseFor(uc)} |
| Kênh | ${uc.channel} |
| API chính | \`${api.method} ${api.path}\` |

**Tác nhân chính:** ${act.primary}  
**Bên liên quan:** ${act.secondary}  

**Điều kiện tiên quyết:**
- Người dùng đã xác thực (trừ UC-ECO-SCOPE-01 theo môi trường).
- Token/session hợp lệ; membership khớp tenant (+ company khi bắt buộc).
- Catalog/workflow đã phát hành nếu UC phụ thuộc danh mục XBOS.

**Điều kiện sau khi thành công:**
- Trạng thái nghiệp vụ phản ánh đúng kết quả (đọc/ghi/duyệt).
- Audit event: user, tenant, timestamp, \`x-request-id\`.
- Client nhận \`{ success: true, data, code? }\`.

**Dữ liệu đầu vào và quy tắc kiểm tra:**

${inTable}

**Dữ liệu đầu ra:**

${outputSection(uc, api)}

**Luồng chính:**

${mainFlowEnriched(uc, api)}

**Luồng thay thế / ngoại lệ:**
${altFlowsEnriched(uc)}

**Ngoại lệ (hệ thống):**
${exceptionSection(uc)}

**Quy tắc nghiệp vụ:**

${businessRulesEnriched(uc)}

**Mã lỗi:**

${errorTableEnriched(uc)}

**Sơ đồ tuần tự:**

${sequenceDiagramFor(uc)}

**Tiêu chí nghiệm thu:**
${acceptanceEnriched(uc, reqId)}

---
`;
}

function moduleForLabel(uc) {
  const m = moduleCodeFor(uc);
  const labels = {
    M00: 'M00 — PHẠM VI & COMMAND CENTER',
    M01: 'M01 — XBOS NỀN TẢNG',
    M02: 'M02 — XBOS DANH MỤC HRM',
    M03: 'M03 — XBOS DANH MỤC LOGISTIC',
    M04: 'M04 — XBOS RACI & WORKFLOW',
    M05: 'M05 — HRM WEB & API',
    M06: 'M06 — HRM MOBILE',
    M07: 'M07 — LOGISTIC WEB',
    M08: 'M08 — LOGISTIC MOBILE',
  };
  return labels[m] || 'M01 — XBOS NỀN TẢNG';
}

function priorityFor(uc) {
  const n = uc.name.toLowerCase();
  const c = uc.code;
  if (/SCOPE|login|đăng nhập|auth|phát hành|workflow|phê duyệt.*danh mục|đồng bộ.*xbos/i.test(n + c)) {
    return 'Cao';
  }
  if (/xem|danh sách|tổng quan|báo cáo/i.test(n)) return 'Trung bình';
  return 'Trung bình';
}

function triggerFor(uc) {
  if (uc.channel.includes('Mobile')) return 'Người dùng thao tác trên ứng dụng di động';
  if (uc.channel.includes('API')) return 'Client gọi API có xác thực và phạm vi tenant';
  return 'Người dùng thao tác trên Cổng Web hoặc màn hình nhúng';
}

function phaseFor(uc) {
  if (/^LG-MB-|^LG-(QU|CH|TR|OP)/.test(uc.code)) return 'Phase 2';
  if (/^LG-/.test(uc.code) && !/^XBOS/.test(uc.code)) return 'Phase 2';
  return 'Phase 1';
}
