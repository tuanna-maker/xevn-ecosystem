/**
 * Generate per-UC SRS blocks (12 sections; override > file > enriched template).
 */
import { inferVerb } from './srs-uc-infer.mjs';
import { sequenceDiagramFor } from './srs-sequence-diagram.mjs';
import { buildEnrichedUcMarkdown, loadFileOverride } from './srs-uc-enrich.mjs';
import { resolveApiHint } from './srs-api-map.mjs';

const OVERRIDES = buildOverrides();

/** UC đã có đặc tả override (pilot); còn lại dùng template generic. */
export const OVERRIDE_CODES = new Set([
  'UC-ECO-SCOPE-01',
  'UC-ECO-SCOPE-02',
  'XBOS-DM-HRM-02',
  'XBOS-DM-HRM-09',
  'XBOS-DM-HRM-10',
  'HRM-SC-03',
  'XBOS-DM-HRM-05',
  'UC-XBOS-13',
  'UC-HRM-MOB-01',
  'UC-HRM-MOB-02',
  'UC-HRM-MOB-04',
  'UC-HRM-MOB-06',
  'UC-HRM-MOB-08',
]);

export function parseUcRowsFromCatalog(md) {
  const lines = md.split(/\r?\n/);
  const i0 = lines.findIndex((l) => l.includes('## 4. Bảng use case gom toàn hệ'));
  const rows = [];
  for (let i = i0 + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') && rows.length) break;
    const m = line.match(/^\| (\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
    if (m) {
      rows.push({
        stt: m[1].trim(),
        code: m[2].trim(),
        name: m[3].trim(),
        layer: m[4].trim(),
        group: m[5].trim(),
        channel: m[6].trim(),
      });
    }
  }
  return rows;
}

function moduleFor(uc) {
  const { code, layer, group } = uc;
  if (/^UC-ECO|^UC-CC/.test(code)) return 'M00 — PHẠM VI & COMMAND CENTER';
  if (/^UC-RACI/.test(code)) return 'M04 — XBOS RACI & WORKFLOW';
  if (/^XBOS-DM-HRM|^UC-XBOS-CAT/.test(code)) return 'M02 — XBOS DANH MỤC HRM';
  if (/^XBOS-DM-LOG/.test(code)) return 'M03 — XBOS DANH MỤC LOGISTIC';
  if (/^UC-XBOS|^UC-HRM-CC/.test(code)) return 'M01 — XBOS NỀN TẢNG';
  if (/^UC-HRM-MOB|^HRM-MOB/.test(code)) return 'M06 — HRM MOBILE';
  if (/^LG-MB-/.test(code)) return 'M08 — LOGISTIC MOBILE';
  if (/^LG-/.test(code)) return 'M07 — LOGISTIC WEB';
  if (/^UC-HRM|^HRM-/.test(code)) return 'M05 — HRM WEB & API';
  return 'M01 — XBOS NỀN TẢNG';
}

function phaseFor(uc) {
  if (/^LG-MB-|^LG-(QU|CH|TR|OP|MB)/.test(uc.code)) return 'Phase 2';
  if (/^LG-/.test(uc.code) && !/^XBOS/.test(uc.code)) return 'Phase 2';
  return 'Phase 1';
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

function actorsFor(uc) {
  const ch = uc.channel.toLowerCase();
  if (ch.includes('mobile') && uc.layer.includes('Logistic')) {
    return 'Lái xe / Nhân viên hiện trường';
  }
  if (ch.includes('mobile')) return 'Nhân viên';
  if (ch.includes('web portal') || ch.includes('xbos')) return 'Quản trị hệ thống / Quản trị tập đoàn';
  if (ch.includes('api')) return 'Phân hệ nghiệp vụ (HRM/Logistic) hoặc Cổng Web';
  return 'Người dùng nội bộ có quyền tương ứng';
}

function triggerFor(uc) {
  if (uc.channel.includes('Mobile')) return 'Người dùng thao tác trên ứng dụng di động';
  if (uc.channel.includes('API')) return 'Client gọi API có xác thực và phạm vi tenant';
  return 'Người dùng thao tác trên Cổng Web hoặc màn hình nhúng';
}

function mainFlowSteps(uc) {
  const v = inferVerb(uc.name);
  const scope = 'Gửi request kèm `Authorization`, `x-tenant-id`, `x-company-id` (khi bắt buộc)';
  const maps = {
    read: [
      `Người dùng mở chức năng «${uc.name}» trên ${uc.channel}.`,
      scope + '.',
      `Client gọi API đọc dữ liệu theo phạm vi tenant.`,
      'Hệ thống kiểm tra quyền và lọc theo UC-ECO-SCOPE-02.',
      'Trả danh sách/chi tiết; hiển thị trạng thái rỗng có thông điệo nếu không có dữ liệu.',
    ],
    create: [
      `Người dùng nhập biểu mẫu «${uc.name}».`,
      'Client validate trường bắt buộc phía UI.',
      scope + '.',
      'Gọi API tạo mới; server validate DTO và quy tắc nghiệp vụ.',
      'Ghi DB; phát sự kiện thông báo/workflow nếu cấu hình.',
      'Trả mã thành công và định danh bản ghi mới.',
    ],
    update: [
      `Người dùng chọn bản ghi và thực hiện «${uc.name}».`,
      scope + '.',
      'Gọi API cập nhật; kiểm tra trạng thái cho phép sửa.',
      'Lưu thay đổi; ghi audit.',
      'Trả kết quả cập nhật cho client.',
    ],
    approve: [
      `Người có quyền duyệt mở «${uc.name}».`,
      'Hệ thống liệt kê bản ghi trạng thái chờ duyệt trong phạm vi.',
      'Người duyệt chọn Đồng ý hoặc Từ chối (có lý do nếu bắt buộc).',
      'XBOS điều phối workflow (nếu gắn quy trình); cập nhật trạng thái nghiệp vụ.',
      'Thông báo người gửi qua hộp thư / realtime.',
    ],
    sync: [
      'Quản trị phân hệ kích hoạt đồng bộ danh mục từ XBOS.',
      'HRM/Logistic gọi API XBOS lấy phiên bản danh mục đã phát hành.',
      'Lưu snapshot + checksum tại tenant.',
      'UI đọc từ bản sao cục bộ; không sửa trực tiếp khung chuẩn tập đoàn.',
    ],
    config: [
      `Quản trị XBOS/HRM thao tác «${uc.name}».`,
      'Nhập/cập nhật cấu hình trên màn hình quản trị.',
      'Validate cấu trúc danh mục hoặc định nghĩa workflow.',
      'Lưu bản nháp hoặc phát hành phiên bản (nếu áp dụng).',
      'Ghi audit; sẵn sàng cho đồng bộ xuống phân hệ.',
    ],
    action: [
      `Người dùng thực hiện «${uc.name}» (${uc.group}).`,
      scope + '.',
      'Hệ thống xử lý theo quy tắc phân hệ ' + uc.layer + '.',
      'Trả kết quả thành công hoặc mã lỗi chuẩn.',
    ],
  };
  return (maps[v] || maps.action).map((s, i) => `${i + 1}. ${s}`).join('\n');
}

function altFlows(uc) {
  const prefix = uc.code.split('-')[0];
  const p = prefix === 'LG' ? 'LG' : prefix === 'HRM' || uc.code.includes('HRM') ? 'HRM' : 'XBOS';
  return `- **[A1] Thiếu phạm vi tenant/company** → HTTP 400, mã \`${p}-ERR-SCOPE-INVALID\`.
- **[A2] Không đủ quyền** → HTTP 403, mã \`${p}-ERR-FORBIDDEN\`.
- **[A3] Dữ liệu không hợp lệ** → HTTP 400, mã \`${p}-ERR-VALIDATION\` kèm chi tiết trường.
- **[A4] Xung đột trạng thái / trùng nghiệp vụ** → HTTP 409, mã \`${p}-ERR-CONFLICT\`.
- **[A5] Lỗi tích hợp XBOS** (khi gọi liên phân hệ) → HTTP 502, mã \`${p}-ERR-UPSTREAM\`.`;
}

function businessRules(uc) {
  const rules = [
    ['BR-ECO-SCOPE-02', 'Mọi đọc/ghi nghiệp vụ phải lọc theo tenant và company được phép.'],
  ];
  if (/danh mục|catalog|đồng bộ/i.test(uc.name)) {
    rules.push(['BR-CAT-01', 'Danh mục gốc do XBOS phát hành; phân hệ không tự định nghĩa khung chuẩn.']);
    rules.push(['BR-CAT-02', 'Mở rộng danh mục tại tenant phải qua lô chờ duyệt tập đoàn.']);
  }
  if (/workflow|phê duyệt|duyệt/i.test(uc.name)) {
    rules.push(['BR-WF-01', 'Quy trình do XBOS điều phối; hộp thư tập trung trên Cổng Web.']);
  }
  if (/mobile/i.test(uc.channel.toLowerCase())) {
    rules.push(['BR-MOB-01', 'Mobile là consumer API HRM; không lưu mật khẩu dạng rõ.']);
  }
  const body = rules
    .map(([id, r]) => `| **${id}** | ${r} |`)
    .join('\n');
  return `| ID | Quy tắc |\n|---|---|\n${body}`;
}

function errorTable(uc) {
  const p = uc.code.startsWith('LG-')
    ? 'LG'
    : uc.code.includes('HRM')
      ? 'HRM'
      : 'XBOS';
  return `| Code | HTTP | Message (VI) | Khi nào |
|---|---|---|---|
| \`${p}-ERR-VALIDATION\` | 400 | Dữ liệu không hợp lệ | Thiếu/sai trường |
| \`${p}-ERR-FORBIDDEN\` | 403 | Không đủ quyền | RBAC/scope |
| \`${p}-ERR-CONFLICT\` | 409 | Xung đột nghiệp vụ | Trạng thái không cho phép |
| \`${p}-ERR-SCOPE-INVALID\` | 400 | Phạm vi tenant không hợp lệ | Sai tenant/company |
| \`${p}-ERR-UPSTREAM\` | 502 | Lỗi tích hợp hệ thống nền | XBOS/API ngoài lỗi |
| \`${p}-ERR-INTERNAL\` | 500 | Lỗi hệ thống | Lỗi không mong đợi |`;
}

function inputTable(uc) {
  const v = inferVerb(uc.name);
  const rows = [
    ['`tenantId`', 'string', 'Có*', 'Bắt buộc khi UC-ECO-SCOPE-02; UUID/slug tenant'],
    ['`companyId`', 'string', 'Có*', 'Bắt buộc theo nghiệp vụ HRM/Logistic'],
  ];
  if (v === 'create' || v === 'update') {
    rows.push(['`payload`', 'object', 'Có', 'Theo DTO API phân hệ; schema validate server']);
  }
  if (v === 'read') {
    rows.push(['`page` / `pageSize`', 'number', 'Không', 'Phân trang khi danh sách']);
    rows.push(['`filters`', 'object', 'Không', 'Lọc theo trạng thái, ngày, mã']);
  }
  if (/phê duyệt|duyệt/.test(uc.name)) {
    rows.push(['`decision`', 'enum', 'Có', '`approve` | `reject`']);
    rows.push(['`comment`', 'string', 'Không', 'Bắt buộc khi từ chối (nếu policy bật)']);
  }
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return `| Field | Type | Required | Validation rule |
|---|---|---|---|
${body}

*Có* = bắt buộc theo chế độ phạm vi đã đăng nhập.`;
}

function acceptance(uc) {
  return `- Thực hiện được luồng chính và các nhánh ngoại lệ đã mô tả
- Mã phản hồi HTTP và mã logic khớp bảng mã lỗi của use case
- Dữ liệu truy cập/ghi trong phạm vi tenant và company được phép
- Thao tác ghi có nhật ký kiểm toán (người dùng, thời điểm, \`x-request-id\`)`;
}

function ucHeading(uc, title) {
  const name = title ?? uc.name;
  return `#### STT ${uc.stt} — ${uc.code}: ${name}`;
}

function applySttToOverrideBlock(block, uc) {
  if (new RegExp(`#### STT ${uc.stt} —`).test(block)) return block;
  let out = block.replace(
    new RegExp(`^#### ${uc.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:.*$`, 'm'),
    ucHeading(uc),
  );
  if (!out.includes('| STT |')) {
    out = out.replace(/\| ID \|/, `| STT | ${uc.stt} |\n| ID |`);
  }
  return out;
}

export function renderUcSpec(uc) {
  const fileOv = loadFileOverride(uc);
  if (fileOv) return buildEnrichedUcMarkdown(uc, fileOv);
  if (OVERRIDES[uc.code]) return applySttToOverrideBlock(OVERRIDES[uc.code], uc);
  return buildEnrichedUcMarkdown(uc);
}

export function buildUcSpecsMarkdown(rows) {
  const sorted = [...rows].sort((a, b) => Number(a.stt) - Number(b.stt));
  let out = `## 5. CHI TIẾT USE CASE

`;
  let lastMod = '';
  for (const uc of sorted) {
    const mod = moduleFor(uc);
    if (mod !== lastMod) {
      out += `\n### ${mod}\n\n`;
      lastMod = mod;
    }
    const block = renderUcSpec(uc).trimEnd();
    out += `${block}\n\n`;
  }
  return out;
}

function buildOverrides() {
  const o = {};
  o['UC-ECO-SCOPE-01'] = fullOverride({
    code: 'UC-ECO-SCOPE-01',
    title: 'Truy cập nghiệp vụ khi chưa có định danh người dùng đủ điều kiện',
    module: 'M00 — PHẠM VI & COMMAND CENTER',
    priority: 'Cao',
    phase: 'Phase 1',
    channel: 'API / Web',
    actors: 'Quản trị hệ thống (môi trường dev/staging được phép)',
    pre: [
      'Môi trường triển khai bật chế độ cho phép UC-ECO-SCOPE-01',
      'Không có JWT hợp lệ hoặc thiếu claim tenant',
    ],
    post: ['Truy vấn trả dữ liệu đa tenant theo policy admin', 'Audit ghi nhận chế độ system admin'],
    main: `1. Client gọi API không mang tenant cụ thể.
2. Gateway xác định chế độ UC-ECO-SCOPE-01 hợp lệ.
3. Service áp dụng filter admin (không ép một tenant).
4. Trả dữ liệu theo quyền system admin.`,
    alt: `- **[A1]** Production tắt chế độ này → 401/403
- **[A2]** Có token tenant → chuyển UC-ECO-SCOPE-02`,
    br: '| **BR-ECO-SCOPE-01** | Chỉ bật trên môi trường được kiểm soát |',
    err: scopeErrors('ECO'),
    ac: '- Không truy cập dữ liệu tenant khi chế độ bị tắt\n- Audit ghi nhận chế độ truy cập quản trị',
  });
  o['UC-ECO-SCOPE-02'] = fullOverride({
    code: 'UC-ECO-SCOPE-02',
    title: 'Truy cập nghiệp vụ khi đã đăng nhập theo một tenant',
    module: 'M00 — PHẠM VI & COMMAND CENTER',
    priority: 'Cao',
    phase: 'Phase 1',
    channel: 'API / Web / Mobile',
    actors: 'Mọi người dùng đã đăng nhập',
    pre: ['JWT hợp lệ', 'Membership có tenantId (+ companyId nếu cần)'],
    post: ['Chỉ dữ liệu trong tenant được phép'],
    main: `1. Client gửi Authorization + header phạm vi.
2. Service resolve tenant từ token/header.
3. Mọi query SQL/Prisma áp filter tenant.
4. Trả kết quả; từ chối nếu vượt phạm vi.`,
    alt: `- **[A1]** Thiếu tenant → 400 SCOPE_TENANT_REQUIRED
- **[A2]** Truy cập tenant khác → 403`,
    br: '| **BR-ECO-SCOPE-02** | Cô lập dữ liệu giữa các công ty con |',
    err: scopeErrors('ECO'),
    ac: '- Hai tenant khác nhau không thấy dữ liệu chéo phạm vi\n- Header và token phải khớp membership',
  });

  catalogUcOverrides(o);
  mobileUcOverrides(o);
  return o;
}

function fullOverride({
  code,
  title,
  module,
  priority,
  phase,
  channel,
  actors,
  pre,
  post,
  main,
  alt,
  br,
  err,
  ac,
  mermaid,
  stt = '',
  api,
}) {
  const apiHint = api || resolveApiHint(code);
  const reqId = stt ? `REQ-SRS-${module.split('—')[0].trim().replace('M', 'M')}-${String(stt).padStart(3, '0')}` : `REQ-SRS-${code}`;
  const reqIdFixed = stt
    ? `REQ-SRS-${module.match(/M\d{2}/)?.[0] || 'M01'}-${String(stt).padStart(3, '0')}`
    : reqId;
  return `#### ${code}: ${title}

**Metadata (Thông tin chung):**

| Trường | Giá trị |
|---|---|
| STT | ${stt || '—'} |
| REQ-ID | ${reqIdFixed} |
| ID | ${code} |
| Module | ${module} |
| Mức ưu tiên | ${priority} |
| Phase | ${phase} |
| Kênh | ${channel} |
| API chính | \`${apiHint.method} ${apiHint.path}\` |

**Tác nhân chính:** ${actors}  
**Bên liên quan:** —  

**Điều kiện tiên quyết:**
${pre.map((p) => `- ${p}`).join('\n')}

**Điều kiện sau khi thành công:**
${post.map((p) => `- ${p}`).join('\n')}

**Dữ liệu đầu vào và quy tắc kiểm tra:**

| Field | Type | Required | Validation rule |
|---|---|---|---|
| \`Authorization\` | string | Có | Bearer JWT |
| \`x-tenant-id\` | string | Có* | UUID tenant (UC-ECO-SCOPE-02) |
| \`x-company-id\` | string | Có* | UUID công ty khi nghiệp vụ yêu cầu |
| \`body\` | object | Có* | DTO theo \`${apiHint.method} ${apiHint.path}\` |

**Dữ liệu đầu ra:**

- **Thành công:** HTTP 200/201, envelope \`{ success: true, data }\`.
- **Side effect:** Ghi OLTP + audit (\`userId\`, \`tenantId\`, \`x-request-id\`).

**Luồng chính:**

${main}

**Luồng thay thế / ngoại lệ:**
${alt}

**Ngoại lệ (hệ thống):**
- **Timeout upstream:** Retry tối đa 2 lần → 502.
- **Token hết hạn:** 401 — đăng nhập lại.

**Quy tắc nghiệp vụ:**

${br}

**Mã lỗi:**

${err}

**Sơ đồ tuần tự:**

${mermaid || sequenceDiagramFor({ code, name: title, layer: module, channel, group: '' })}

**Tiêu chí nghiệm thu:**
${ac}

**Kiểm chứng:** Kiểm thử chức năng · Demo vận hành (${channel}) · Đối chiếu BRD — XeVN Ecosystem OS.

---

`;
}

function scopeErrors(p) {
  return `| Code | HTTP | Message (VI) | Khi nào |
|---|---|---|---|
| \`SCOPE_TENANT_REQUIRED\` | 400 | Thiếu tenant | Thiếu header/claim |
| \`${p}-ERR-FORBIDDEN\` | 403 | Ngoài phạm vi | Tenant khác |
| \`${p}-ERR-VALIDATION\` | 400 | Dữ liệu không hợp lệ | DTO |
| \`${p}-ERR-CONFLICT\` | 409 | Xung đột trạng thái | Trạng thái không cho phép |
| \`${p}-ERR-UPSTREAM\` | 502 | Lỗi hệ thống nền | Dependency |
| \`${p}-ERR-INTERNAL\` | 500 | Lỗi hệ thống | Lỗi không mong đợi |`;
}

function catalogUcOverrides(o) {
  for (const [code, title, main, alt] of [
    [
      'XBOS-DM-HRM-02',
      'Cấu hình 6 nhóm trường hồ sơ nhân viên',
      `1. Mở Quản trị danh mục HRM trên XBOS.
2. Chỉnh 6 nhóm trường (nhân thân, hợp đồng, …).
3. Validate schema JSON.
4. Lưu bản nháp.`,
      '- **[A1]** Schema không hợp lệ → 400',
    ],
    [
      'XBOS-DM-HRM-09',
      'Phát hành phiên bản danh mục mới',
      `1. Chọn catalog đã cấu hình.
2. Bấm Phát hành → tạo version + checksum.
3. Ghi audit; đánh dấu active.
4. Cho phép HRM pull (UC tiếp theo).`,
      '- **[A1]** Chưa đủ trường bắt buộc → 400',
    ],
    [
      'XBOS-DM-HRM-10',
      'Đồng bộ danh mục xuống HRM',
      `1. HRM gọi GET config-sync/catalog/:key.
2. XBOS trả payload theo tenant/company.
3. HRM lưu snapshot + checksum.
4. UI settings đọc bản sao.`,
      '- **[A1]** XBOS timeout → HRM-SYNC-001 502',
    ],
    [
      'HRM-SC-03',
      'Bổ sung giá trị danh mục mở rộng',
      `1. HR tenant mở catalog thiếu mã.
2. POST extension-items (không immediate).
3. Tạo batch pending.
4. Gọi XBOS start workflow.`,
      '- **[A1]** Ghi immediate=true (dev only) → lưu thẳng',
    ],
    [
      'XBOS-DM-HRM-05',
      'Phê duyệt hoặc từ chối mở rộng danh mục',
      `1. Lãnh đạo mở hộp thư workflow catalog.
2. Xem lô HRM-SC batch.
3. Approve → merge; Reject → thông báo HR.`,
      '- **[A1]** Batch đã xử lý → 409',
    ],
    [
      'UC-XBOS-13',
      'Định nghĩa quy trình (workflow)',
      `1. Tạo definition: steps, hats, assignees.
2. Lưu graph JSON.
3. Gán businessType (catalog, leave, …).
4. Kích hoạt cho tenant.`,
      '- **[A1]** Trùng stepKey → 400',
    ],
  ]) {
    o[code] = fullOverride({
      code,
      title,
      module: code.startsWith('HRM') ? 'M05 — HRM WEB & API' : 'M02 — XBOS DANH MỤC HRM',
      priority: 'Cao',
      phase: 'Phase 1',
      channel: code.startsWith('HRM') ? 'API / Web' : 'XBOS / Web Portal',
      actors: code.startsWith('HRM') ? 'Quản trị HR công ty con' : 'Quản trị XBOS tập đoàn',
      pre: ['Đã đăng nhập đúng phạm vi', 'Catalog/workflow tồn tại hoặc đang tạo mới'],
      post: ['Trạng thái danh mục/workflow nhất quán trên toàn hệ'],
      main,
      alt,
      br: '| **BR-CAT-01** | Danh mục gốc XBOS |\n| **BR-WF-01** | Workflow tập trung |',
      err: scopeErrors(code.startsWith('HRM') ? 'HRM' : 'XBOS'),
      ac: '- Danh mục đồng bộ đúng phiên bản phát hành trên XBOS\n- Lô mở rộng danh mục xử lý qua hộp thư workflow',
      mermaid: sequenceDiagramFor({
        code,
        name: title,
        channel: code.startsWith('HRM') ? 'API / Web' : 'XBOS / Web Portal',
        layer: code.startsWith('HRM') ? 'HRM' : 'HRM',
        group: 'Quản trị danh mục',
      }),
    });
  }
}

function mobileUcOverrides(o) {
  const specs = [
    [
      'UC-HRM-MOB-01',
      'Đăng nhập và thiết lập phiên an toàn',
      `1. Nhập email/mật khẩu trên app.
2. POST /api/hrm/auth/mobile/login.
3. Nhận access + refresh token.
4. Lưu SecureStore; không log plaintext.`,
      '- **[A1]** Sai credential → 401\n- **[A2]** Thiếu membership → màn hình liên hệ admin',
    ],
    [
      'UC-HRM-MOB-02',
      'Chọn và xác nhận phạm vi công ty',
      `1. Hiển thị danh sách company từ token.
2. Nếu một company → chọn ngầm.
3. POST select-membership.
4. Gắn header mọi request sau.`,
      '- **[A1]** Company ngoài scope → 403',
    ],
    [
      'UC-HRM-MOB-04',
      'Ghi nhận chấm công / điểm danh',
      `1. NV bấm Check-in.
2. POST /api/hrm/attendance/records + GPS (nếu bật).
3. Server validate trùng ca.
4. Trả bản ghi chấm công.`,
      '- **[A1]** Offline → HRM-MOB-ERR-OFFLINE\n- **[A2]** Trùng ca → 409',
    ],
    [
      'UC-HRM-MOB-06',
      'Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép',
      `1. Chọn loại đơn.
2. Nhập ngày, lý do, file đính kèm (nếu có).
3. POST leave-requests hoặc update-requests.
4. Fanout thông báo quản lý.`,
      '- **[A1]** Thiếu trường → 400 VALIDATION',
    ],
    [
      'UC-HRM-MOB-08',
      'Phê duyệt hoặc từ chối đơn chờ',
      `1. QL mở danh sách pending.
2. POST approve/reject kèm reviewer_name.
3. Cập nhật trạng thái + workflow XBOS (nếu có).
4. Push/socket tới NV.`,
      '- **[A1]** Không quyền QL → 403',
    ],
  ];
  for (const [code, title, main, alt] of specs) {
    o[code] = fullOverride({
      code,
      title,
      module: 'M06 — HRM MOBILE',
      priority: 'Cao',
      phase: 'Phase 1',
      channel: 'Mobile',
      actors: 'Nhân viên / Quản lý',
      pre: ['Đã UC-HRM-MOB-01/02', 'Có kết nối mạng (ghi)'],
      post: ['Trạng thái đồng bộ server', 'Audit trên HRM API'],
      main,
      alt,
      br: '| **BR-MOB-01** | Không lưu mật khẩu rõ |\n| **BR-ECO-SCOPE-02** | Đúng tenant |',
      err: `| \`HRM-ERR-VALIDATION\` | 400 | Dữ liệu không hợp lệ | DTO |
| \`HRM-ERR-FORBIDDEN\` | 403 | Không đủ quyền | RBAC |
| \`HRM-ERR-CONFLICT\` | 409 | Xung đột nghiệp vụ | Trạng thái |
| \`HRM-MOB-ERR-NETWORK\` | — | Không kết nối server | Client |
| \`HRM-MOB-ERR-OFFLINE\` | — | Offline khi ghi | Client |
| \`HRM-ERR-INTERNAL\` | 500 | Lỗi hệ thống | Server |`,
      ac: '- Phiên đăng nhập và phạm vi công ty khớp membership\n- Thông báo lỗi hiển thị đúng mã và nội dung tiếng Việt',
    });
  }
}
