/**
 * SRS functional requirements — Bateco E-Office style (FR per UC catalog row).
 * Sections: metadata table, Dữ liệu đầu vào (when needed), Luồng chính, Quy tắc nghiệp vụ,
 * Trường hợp đặc biệt, Sơ đồ tương tác + Diễn biến (tier full only).
 */
import { inferVerb } from './srs-uc-infer.mjs';
import { sequenceDiagramFor } from './srs-sequence-diagram.mjs';
import { resolveApiHint } from './srs-api-map.mjs';
import { loadFileOverride } from './srs-uc-enrich.mjs';

/** Các mục bắt buộc cho mọi FR (đồng nhất 373/373). */
export const FR_REQUIRED_SECTIONS = [
  'meta_table',
  'input',
  'main_flow',
  'business_rules',
  'special_cases',
  'sequence',
  'dien_bien',
];

export const MODULE_SECTIONS = [
  {
    mod: 'M00 — PHẠM VI & COMMAND CENTER',
    num: '3.1',
    code: 'MOD-M00',
    title: 'Phạm vi dữ liệu & Trung tâm điều hành',
    intro:
      'Quy định hành vi phân vùng tenant/company toàn hệ và các chức năng điều hành trên Cổng Web (tổ chức, RACI, hộp thư duyệt).',
  },
  {
    mod: 'M01 — XBOS NỀN TẢNG',
    num: '3.2',
    code: 'MOD-M01',
    title: 'Nền tảng XBOS',
    intro:
      'Quản trị hệ thống, đồng bộ danh mục, workflow, tài sản và các dịch vụ nền dùng chung bởi HRM/Logistic.',
  },
  {
    mod: 'M02 — XBOS DANH MỤC HRM',
    num: '3.3',
    code: 'MOD-M02',
    title: 'Danh mục & governance HRM trên XBOS',
    intro:
      'Chuẩn hóa khung hồ sơ nhân sự, phát hành catalog, đồng bộ xuống HRM và phê duyệt mở rộng danh mục tại tenant.',
  },
  {
    mod: 'M03 — XBOS DANH MỤC LOGISTIC',
    num: '3.4',
    code: 'MOD-M03',
    title: 'Danh mục Logistic trên XBOS',
    intro:
      'Định nghĩa danh mục và quy trình vận hành Logistic (giai đoạn 2) — nguồn chuẩn cho phân hệ Logistic.',
  },
  {
    mod: 'M04 — XBOS RACI & WORKFLOW',
    num: '3.5',
    code: 'MOD-M04',
    title: 'RACI & Workflow',
    intro: 'Ma trận RACI, định nghĩa quy trình phê duyệt và vận hành hộp thư tập trung.',
  },
  {
    mod: 'M05 — HRM WEB & API',
    num: '3.6',
    code: 'MOD-M05',
    title: 'Nhân sự — Web & API',
    intro:
      'Vòng đời nhân viên, chấm công, đơn từ, lương, tuyển dụng và các dịch vụ HR trên web/API.',
  },
  {
    mod: 'M06 — HRM MOBILE',
    num: '3.7',
    code: 'MOD-M06',
    title: 'Nhân sự — Ứng dụng di động',
    intro: 'Ứng dụng nhân viên: đăng nhập, chấm công, đơn từ, phiếu lương, thông báo.',
  },
  {
    mod: 'M07 — LOGISTIC WEB',
    num: '3.8',
    code: 'MOD-M07',
    title: 'Logistic — Web (giai đoạn 2)',
    intro: 'Kinh doanh, điều phối, vận đơn và vận hành chuyến trên Logistic Web.',
  },
  {
    mod: 'M08 — LOGISTIC MOBILE',
    num: '3.9',
    code: 'MOD-M08',
    title: 'Logistic — Ứng dụng lái xe (giai đoạn 2)',
    intro: 'App lái xe: nhận chuyến, các bước trả hàng, chứng từ và sự cố.',
  },
];

export function moduleFor(uc) {
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

function priorityFor(uc) {
  const n = uc.name.toLowerCase();
  const c = uc.code;
  if (/SCOPE|login|đăng nhập|auth|phát hành|workflow|phê duyệt.*danh mục|đồng bộ.*xbos|chấm công|check-in|nghỉ phép/i.test(n + c)) {
    return 'Cao';
  }
  if (/xem|danh sách|tổng quan|báo cáo/i.test(n)) return 'Trung bình';
  return 'Trung bình';
}

function actorFor(uc) {
  const ch = uc.channel.toLowerCase();
  if (ch.includes('mobile') && uc.layer.includes('Logistic')) return 'Lái xe / nhân viên hiện trường';
  if (ch.includes('mobile')) return 'Nhân viên';
  if (ch.includes('web portal') || ch.includes('xbos')) return 'Quản trị hệ thống / Ban điều hành';
  if (ch.includes('api')) return 'Phân hệ nghiệp vụ hoặc Cổng Web (tích hợp API)';
  return 'Người dùng nội bộ có quyền tương ứng';
}

function preconditions(uc) {
  const lines = ['Đã xác thực (trừ FR-UC-ECO-SCOPE-01 khi môi trường cho phép).'];
  if (!/SCOPE-01/.test(uc.code)) {
    lines.push('Token/session hợp lệ; phạm vi tenant (+ company khi bắt buộc).');
  }
  if (/danh mục|catalog|đồng bộ/i.test(uc.name)) {
    lines.push('Catalog XBOS đã phát hành (nếu UC phụ thuộc danh mục).');
  }
  if (/workflow|phê duyệt|duyệt/i.test(uc.name)) {
    lines.push('Quy trình XBOS đã cấu hình và kích hoạt cho loại nghiệp vụ.');
  }
  return lines.join(' ');
}

function postconditions(uc, v) {
  if (v === 'read') return 'Dữ liệu trả về đúng phạm vi; thông báo rõ khi danh sách rỗng.';
  if (v === 'create') return 'Bản ghi mới được tạo; audit ghi nhận thao tác.';
  if (v === 'update') return 'Thay đổi được lưu; audit ghi nhận.';
  if (v === 'delete') return 'Trạng thái vô hiệu hoặc xóa mềm theo policy; audit ghi nhận.';
  if (v === 'approve') return 'Trạng thái nghiệp vụ cập nhật; thông báo người liên quan.';
  if (v === 'sync') return 'Snapshot danh mục tại HRM/Logistic khớp phiên bản XBOS.';
  if (v === 'config') return 'Cấu hình lưu thành công; sẵn sàng cho vận hành.';
  return 'Kết quả nghiệp vụ phản ánh đúng thao tác «' + uc.name + '».';
}

function mainFlowSteps(uc, api) {
  const v = inferVerb(uc.name);
  const ch = uc.channel;
  const apiHint = api.planned
    ? `(API giai đoạn 2: \`${api.method} ${api.path}\`)`
    : `(\`${api.method} ${api.path}\`)`;

  const maps = {
    read: [
      `Người dùng mở chức năng «${uc.name}» trên ${ch}.`,
      'Hệ thống kiểm tra quyền và phạm vi tenant/company.',
      `Truy vấn dữ liệu ${apiHint}.`,
      'Trả kết quả; hiển thị hoặc thông báo khi không có dữ liệu.',
    ],
    create: [
      `Người dùng nhập thông tin và gửi «${uc.name}».`,
      'Client kiểm tra trường bắt buộc.',
      `Gọi API tạo mới ${apiHint}.`,
      'Server validate DTO và quy tắc nghiệp vụ; ghi DB.',
      'Trả kết quả thành công cho client.',
    ],
    update: [
      `Người dùng chọn bản ghi và thực hiện «${uc.name}».`,
      `Gọi API cập nhật ${apiHint}.`,
      'Kiểm tra trạng thái cho phép sửa; lưu và ghi audit.',
      'Trả kết quả cập nhật.',
    ],
    delete: [
      `Người dùng yêu cầu «${uc.name}».`,
      'Hệ thống kiểm tra không vi phạm ràng buộc dữ liệu liên quan.',
      `Thực hiện xóa mềm hoặc vô hiệu ${apiHint}.`,
      'Ghi audit.',
    ],
    approve: [
      `Người có quyền mở «${uc.name}».`,
      'Xem chi tiết yêu cầu trong phạm vi được phép.',
      'Chọn Đồng ý hoặc Từ chối (có lý do nếu bắt buộc).',
      `Cập nhật qua API ${apiHint}; đồng bộ workflow XBOS nếu có.`,
      'Thông báo người gửi.',
    ],
    sync: [
      'Quản trị hoặc dịch vụ kích hoạt đồng bộ danh mục từ XBOS.',
      'So sánh phiên bản/checksum với bản sao local.',
      `Pull và lưu snapshot ${apiHint}.`,
      'UI đọc từ bản sao; không sửa khung chuẩn tập đoàn.',
    ],
    config: [
      `Quản trị thao tác «${uc.name}» trên màn hình cấu hình.`,
      'Nhập/cập nhật tham số; validate schema.',
      `Lưu ${apiHint}.`,
      'Ghi audit; áp dụng cho tenant khi publish (nếu có).',
    ],
    action: [
      `Người dùng thực hiện «${uc.name}» (${uc.group}).`,
      'Kiểm tra quyền và phạm vi.',
      `Xử lý qua ${apiHint}.`,
      'Trả kết quả hoặc lỗi nghiệp vụ có thể kiểm thử.',
    ],
  };
  return (maps[v] || maps.action).map((s, i) => `${i + 1}. ${s}`).join('\n');
}

function inputFieldsTable(uc, api) {
  const v = inferVerb(uc.name);
  const rows = [
    ['Authorization', 'string', 'Có*', 'Bearer JWT (ngoại lệ FR-UC-ECO-SCOPE-01 theo môi trường)'],
    ['x-tenant-id', 'UUID/string', 'Có*', 'Phạm vi tenant — UC-ECO-SCOPE-02'],
    ['x-company-id', 'UUID/string', 'Có*', 'UUID công ty khi nghiệp vụ yêu cầu'],
    ['x-request-id', 'UUID', 'Không', 'Trace end-to-end — khuyến nghị'],
  ];

  if (v === 'read') {
    rows.push(['page', 'number', 'Không', 'Mặc định 1; ≥ 1']);
    rows.push(['pageSize', 'number', 'Không', '≤ 50']);
    rows.push(['filters', 'object', 'Không', 'Lọc trạng thái, ngày, mã — theo màn hình']);
  } else {
    rows.push(['body / payload', 'object', 'Có*', `DTO \`${api.method} ${api.path}\``]);
  }

  if (/phê duyệt|duyệt|từ chối/i.test(uc.name)) {
    rows.push(['decision', 'enum', 'Có', '`approve` | `reject`']);
    rows.push(['comment', 'string', 'Không', 'Bắt buộc khi từ chối (policy)']);
  }
  if (/chấm công|check-in|điểm danh/i.test(uc.name)) {
    rows.push(['recordedAt', 'datetime', 'Có', 'Thời điểm ghi nhận']);
    rows.push(['geo', 'object', 'Không', 'Tọa độ GPS nếu bật policy']);
  }
  if (/danh mục|catalog|đồng bộ/i.test(uc.name)) {
    rows.push(['catalogKey', 'string', 'Có*', 'Khóa danh mục XBOS']);
    rows.push(['version / checksum', 'string', 'Không', 'So sánh khi pull']);
  }

  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return `| Trường | Kiểu | Bắt buộc | Ràng buộc |\n|--------|------|----------|-----------|\n${body}`;
}

function businessRulesBullets(uc) {
  const rules = [
    'Mọi đọc/ghi tuân thủ **BR-ECO-SCOPE-02** (phạm vi tenant/company).',
    'Mọi thao tác ghi phải ghi audit: userId, tenantId, timestamp, x-request-id.',
  ];
  if (/danh mục|catalog|đồng bộ/i.test(uc.name)) {
    rules.push('Danh mục gốc do XBOS phát hành; tenant không tự sửa khung chuẩn.');
    rules.push('Mở rộng danh mục tại tenant qua lô chờ duyệt tập đoàn.');
  }
  if (/workflow|phê duyệt|duyệt/i.test(uc.name)) {
    rules.push('Quy trình do XBOS điều phối; xử lý trên hộp thư Cổng Web.');
  }
  if (/mobile/i.test(uc.channel.toLowerCase())) {
    rules.push('Không lưu mật khẩu dạng rõ trên thiết bị.');
  }
  if (/nghỉ phép|leave/i.test(uc.name)) {
    rules.push('Đơn nghỉ sau khi duyệt mới có hiệu lực chấm công/lương.');
  }
  if (/^LG-/.test(uc.code)) {
    rules.push('Logistic giai đoạn 2 — danh mục đọc từ XBOS đã đồng bộ.');
  }
  return rules.map((r) => `- ${r}`).join('\n');
}

function specialCasesBullets(uc) {
  const p = uc.code.startsWith('LG-') ? 'LG' : uc.code.includes('HRM') ? 'HRM' : 'XBOS';
  return `- Thiếu phạm vi tenant/company → HTTP 400, mã \`SCOPE_TENANT_REQUIRED\` hoặc \`${p}-ERR-SCOPE-INVALID\`.
- Không đủ quyền → HTTP 403, \`${p}-ERR-FORBIDDEN\`.
- Dữ liệu không hợp lệ → HTTP 400, \`${p}-ERR-VALIDATION\`.
- Xung đột trạng thái → HTTP 409, \`${p}-ERR-CONFLICT\`.
- Lỗi tích hợp XBOS/dependency → HTTP 502, \`${p}-ERR-UPSTREAM\`.`;
}

function dienBienTable(uc, api) {
  const v = inferVerb(uc.name);
  const apiHint = `Gợi ý kỹ thuật: \`${api.method} ${api.path}\``;
  const p = uc.code.startsWith('LG-') ? 'LG' : uc.code.includes('HRM') ? 'HRM' : 'XBOS';
  const rows = [
    `| 1 | Người dùng khởi tạo «${uc.name}» — gửi yêu cầu vào hệ thống | ${apiHint} | Tiếp tục: yêu cầu được tiếp nhận |`,
    `| 2 | Hệ thống kiểm tra xác thực (JWT) và phân quyền (RBAC) | Token hợp lệ; đúng vai trò | Từ chối: 401 Unauthorized hoặc 403 ${p}-ERR-FORBIDDEN |`,
    `| 3 | Hệ thống kiểm tra phạm vi tenant/company | UC-ECO-SCOPE-02 | Từ chối: 400 SCOPE_TENANT_REQUIRED hoặc ${p}-ERR-SCOPE-INVALID |`,
    `| 4 | Hệ thống validate dữ liệu đầu vào | Schema DTO và quy tắc nghiệp vụ | Từ chối: 400 ${p}-ERR-VALIDATION |`,
    `| 5 | Hệ thống xử lý nghiệp vụ (${v}) | Lọc/transaction theo tenant | Tiếp tục hoặc 409 ${p}-ERR-CONFLICT |`,
    `| 6 | Hệ thống ghi CSDL / gọi XBOS (nếu có) | Transaction + audit | Tiếp tục; lỗi upstream → 502 ${p}-ERR-UPSTREAM |`,
    `| 7 | Trả kết quả cho client | Envelope \`{ success, data }\` | Thành công: 200/201; thất bại theo mã trên |`,
  ];
  return `| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |\n|---|---------|--------|--------|\n${rows.join('\n')}`;
}

/** Bộ mục đầy đủ — dùng cho mọi FR (373/373). */
export function buildFrSections(uc, api) {
  const v = inferVerb(uc.name);
  const mermaid = sequenceDiagramFor(uc);
  return {
    meta: `| Thuộc tính | Mô tả |\n|-----------|-------|\n| **Actor** | ${actorFor(uc)} |\n| **Ưu tiên** | ${priorityFor(uc)} |\n| **Điều kiện tiên quyết** | ${preconditions(uc)} |\n| **Điều kiện hậu** | ${postconditions(uc, v)} |`,
    input: inputFieldsTable(uc, api),
    main: mainFlowSteps(uc, api),
    rules: businessRulesBullets(uc),
    special: specialCasesBullets(uc),
    sequence: mermaid,
    dienbien: dienBienTable(uc, api),
  };
}

function formatFrBlock(uc, title, sections) {
  const name = title || uc.name;
  return `#### FR-${uc.code} — ${name}

${sections.meta}

**Dữ liệu đầu vào:**

${sections.input}

**Luồng chính:**
${sections.main}

**Quy tắc nghiệp vụ:**
${sections.rules}

**Trường hợp đặc biệt:**
${sections.special}

**Sơ đồ tương tác:**

${sections.sequence}

**Diễn biến nghiệp vụ (theo sơ đồ):**

${sections.dienbien}

---

`;
}

function parseOverrideInputTable(raw) {
  const block = raw.match(/\*\*Dữ liệu đầu vào[^*]*\*\*\s*\n+([\s\S]*?)(?=\n\*\*Dữ liệu đầu ra|\n\*\*Luồng|\n\*\*Quy tắc|$)/)?.[1]?.trim();
  if (!block?.includes('|')) return null;
  const rows = block.split('\n').filter((l) => l.startsWith('|') && !l.includes('---'));
  if (rows.length < 2) return null;
  const header = '| Trường | Kiểu | Bắt buộc | Ràng buộc |\n|--------|------|----------|-----------|';
  const body = rows
    .slice(rows[0].includes('Field') || rows[0].includes('Trường') ? 1 : 0)
    .map((r) => {
      const c = r.split('|').map((x) => x.trim()).filter(Boolean);
      if (c.length >= 4) return `| ${c[0]} | ${c[1]} | ${c[2]} | ${c[3]} |`;
      return null;
    })
    .filter(Boolean);
  return body.length ? `${header}\n${body.join('\n')}` : null;
}

function parseOverrideRules(raw) {
  const br = raw.match(/\*\*Quy tắc nghiệp vụ:\*\*\s*\n+([\s\S]*?)(?=\n\*\*Mã lỗi|\n\*\*Sơ đồ|$)/)?.[1]?.trim();
  if (!br) return null;
  if (br.includes('| **BR-')) {
    return br
      .split('\n')
      .filter((l) => l.includes('**BR-'))
      .map((l) => {
        const m = l.match(/\|\s*\*\*(BR-[^*]+)\*\*\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
        return m ? `- **${m[1]}:** ${m[3].trim()}` : null;
      })
      .filter(Boolean)
      .join('\n');
  }
  return br.startsWith('-') ? br : `- ${br}`;
}

function parseOverrideSpecial(raw) {
  const alt = raw.match(/\*\*Luồng thay thế[^*]*\*\*\s*\n+([\s\S]*?)(?=\n\*\*Ngoại lệ|\n\*\*Quy tắc|\n\*\*Mã lỗi|$)/)?.[1]?.trim();
  if (alt) return alt;
  const err = raw.match(/\*\*Mã lỗi:\*\*\s*\n+([\s\S]*?)(?=\n\*\*Sơ đồ|$)/)?.[1]?.trim();
  if (err?.includes('|')) {
    return err
      .split('\n')
      .filter((l) => l.includes('ERR') || l.includes('SCOPE'))
      .slice(0, 6)
      .map((l) => {
        const c = l.split('|').map((x) => x.trim()).filter(Boolean);
        return c[0] ? `- ${c[0]}: ${c[3] || c[2] || 'xem bảng mã lỗi'}` : null;
      })
      .filter(Boolean)
      .join('\n');
  }
  return null;
}

function convertOverrideToFr(uc, raw, api, defaults) {
  const title =
    raw.match(/^####\s+(?:STT\s+\d+\s+—\s+)?[^—]+—\s*(.+)$/m)?.[1]?.trim() || uc.name;
  const v = inferVerb(uc.name);
  const pre = raw.match(/\*\*Điều kiện tiên quyết:\*\*\s*\n+([\s\S]*?)(?=\n\*\*|$)/)?.[1]?.trim();
  const post = raw.match(/\*\*Điều kiện sau khi thành công:\*\*\s*\n+([\s\S]*?)(?=\n\*\*|$)/)?.[1]?.trim();
  const actor = raw.match(/\*\*Tác nhân chính:\*\*\s*(.+)/)?.[1]?.trim() || actorFor(uc);
  const pri = raw.match(/\|\s*Mức ưu tiên\s*\|\s*([^|]+)/)?.[1]?.trim() || priorityFor(uc);
  const main = raw.match(/\*\*Luồng chính:\*\*\s*\n+([\s\S]*?)(?=\n\*\*|$)/)?.[1]?.trim();
  const mermaid = raw.match(/```mermaid[\s\S]*?```/)?.[0] || defaults.sequence;

  const sections = {
    meta: `| Thuộc tính | Mô tả |\n|-----------|-------|\n| **Actor** | ${actor} |\n| **Ưu tiên** | ${pri} |\n| **Điều kiện tiên quyết** | ${pre ? pre.replace(/\n- /g, '; ') : preconditions(uc)} |\n| **Điều kiện hậu** | ${post ? post.replace(/\n- /g, '; ') : postconditions(uc, v)} |`,
    input: parseOverrideInputTable(raw) || defaults.input,
    main: main || defaults.main,
    rules: parseOverrideRules(raw) || defaults.rules,
    special: parseOverrideSpecial(raw) || defaults.special,
    sequence: mermaid,
    dienbien: defaults.dienbien,
  };

  return formatFrBlock(uc, title, sections);
}

export function renderFrBlock(uc) {
  const api = resolveApiHint(uc.code);
  const defaults = buildFrSections(uc, api);
  const override = loadFileOverride(uc);
  if (override) return convertOverrideToFr(uc, override, api, defaults);
  return formatFrBlock(uc, uc.name, defaults);
}

/** Kiểm tra FR có đủ 7 mục bắt buộc. */
export function auditFrBlock(block) {
  const checks = {
    meta_table: /\| \*\*Actor\*\*[\s\S]*\| \*\*Ưu tiên\*\*[\s\S]*\| \*\*Điều kiện tiên quyết\*\*[\s\S]*\| \*\*Điều kiện hậu\*\*/,
    input: /\*\*Dữ liệu đầu vào:\*\*\s*\n+\| Trường \|/,
    main_flow: /\*\*Luồng chính:\*\*\s*\n+1\./,
    business_rules: /\*\*Quy tắc nghiệp vụ:\*\*\s*\n+- /,
    special_cases: /\*\*Trường hợp đặc biệt:\*\*\s*\n+- /,
    sequence: /\*\*Sơ đồ tương tác:\*\*\s*\n+```mermaid/,
    dien_bien: /\*\*Diễn biến nghiệp vụ \(theo sơ đồ\):\*\*\s*\n+\| # \|/,
  };
  const fails = [];
  for (const [id, re] of Object.entries(checks)) {
    if (!re.test(block)) fails.push(id);
  }
  return fails;
}

export function buildFunctionalRequirementsChapter(ucRows) {
  const sorted = [...ucRows].sort((a, b) => Number(a.stt) - Number(b.stt));
  const byMod = new Map();
  for (const uc of sorted) {
    const mod = moduleFor(uc);
    if (!byMod.has(mod)) byMod.set(mod, []);
    byMod.get(mod).push(uc);
  }

  let out = `## 3. Yêu cầu chức năng

> **Quy ước mã yêu cầu:** Mỗi use case trong BRD tương ứng một FR \`FR-{Mã UC}\` (373 yêu cầu).  
> **Mức ưu tiên:** Cao · Trung bình · Thấp  
> **Cách đọc bảng “Diễn biến nghiệp vụ”:** mỗi FR có đủ 7 mục (metadata, đầu vào, luồng chính, quy tắc, trường hợp đặc biệt, sơ đồ, diễn biến). Gợi ý API chỉ tham khảo khi triển khai.

`;

  for (const sec of MODULE_SECTIONS) {
    const list = byMod.get(sec.mod) || [];
    if (!list.length) continue;
    out += `### ${sec.num} ${sec.code} — ${sec.title}\n\n${sec.intro}\n\n`;
    for (const uc of list) {
      out += renderFrBlock(uc);
    }
  }

  return out;
}
