/**
 * Markdown prep for client BRD/SRS HTML: diagrams, doc titles, cleanup.
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { applyBrdVietnameseProse } from './brd-vietnamese-prose.mjs';

const DOC_TITLE_RULES = [
  [/docs\/client-delivery\/00_Mo_ta[^\s`]*/gi, 'Mô tả hệ sinh thái XeVN'],
  [/docs\/client-delivery\/01_BRD[^\s`]*/gi, 'BRD — XeVN Ecosystem OS'],
  [/docs\/client-delivery\/02_SRS[^\s`]*/gi, 'SRS — XeVN Ecosystem OS'],
  [/MO_TA_HE_SINH_THAI_XEVN\.md/gi, 'Mô tả hệ sinh thái XeVN'],
  [/BANG_TONG_HOP_USECASE_XEVN\.md/gi, 'Bảng tổng hợp tình huống sử dụng hệ sinh thái XeVN'],
  [/BRD_TONG_HOP_HE_SINH_THAI_XEVN\.md/gi, 'BRD Tổng hợp — Hệ sinh thái XeVN OS'],
  [/docs\/ecosystem\/SRS\.md/gi, 'SRS — Định danh và phạm vi toàn hệ'],
  [/docs\/hrm\/SRS\.md/gi, 'SRS — Phân hệ HRM'],
  [/docs\/hrm\/SRS_MOBILE\.md/gi, 'SRS — Ứng dụng HRM Mobile'],
  [/docs\/hrm\/TECHSPEC_MOBILE\.md/gi, 'TechSpec — HRM Mobile'],
  [/BRD quy tắc phạm vi dữ liệu toàn hệ/gi, 'BRD — Quy tắc định danh và phạm vi dữ liệu toàn hệ'],
  [/HTML gửi khách:\s*`[^`]+`/gi, ''],
  [/BRD & SRS Writing Standards/gi, ''],
  [/Chuẩn viết BRD\s*&\s*SRS/gi, ''],
  [/ISO\/IEC\/IEEE\s*29148[^\n]*/gi, ''],
  [/Chuẩn 8 chương[^\n]*/gi, ''],
  [/\(BRD\s*&\s*SRS[^)]*\)/gi, ''],
];

const IMAGE_ALIASES = {
  'assets/kien-truc-bon-tang-xevn.png': 'four-layer',
  'assets/kien-truc-vai-tro-luong-xevn.png': 'integration-flow',
  'assets/lo-trinh-hai-giai-doan-xevn.png': 'phase-roadmap',
  'assets/chuoi-gia-tri-logistic-xevn.png': 'logistic-value-chain',
};

const IMAGE_CAPTIONS = {
  'four-layer': 'Hình 1. Kiến trúc bốn tầng — XeVN Ecosystem OS',
  'integration-flow': 'Hình 2. Vai trò các thành phần và luồng tích hợp',
  'phase-roadmap': 'Hình 3. Phân chia phạm vi theo hai giai đoạn',
  'logistic-value-chain': 'Hình 4. Chuỗi giá trị Logistic',
};

export function loadDiagramBundle(assetsDir) {
  const bundle = {};
  for (const [rel, key] of Object.entries(IMAGE_ALIASES)) {
    const full = path.join(assetsDir, path.basename(rel));
    if (!existsSync(full)) {
      throw new Error(`Missing diagram asset: ${full}`);
    }
    bundle[key] = {
      dataUrl: `data:image/png;base64,${readFileSync(full).toString('base64')}`,
      caption: IMAGE_CAPTIONS[key],
    };
  }
  return bundle;
}

/** Loại bỏ meta triển khai / kết quả đạt được — chỉ giữ nội dung chuyên môn gửi khách. */
export function stripClientDeliveryMeta(md) {
  let out = md;
  out = out.replace(/\(bản mô tả[^)]*pilot[^)]*\)/gi, '');
  out = out.replace(/\*\*Quy mô đã chuẩn hóa:\*\*[^\n]*\n?/g, '');
  out = out.replace(/đặc tả đầy đủ\s*\d*\s*use case[^.\n]*/gi, '');
  out = out.replace(/template\s+Unicom/gi, '');
  out = out.replace(/—\s*template[^\n]*/gi, '');
  out = out.replace(/Danh sách đầy đủ\s*373\s*/gi, 'Danh sách ');
  out = out.replace(/Ma trận tra cứu nhanh\s*\(\d+\s*UC\)/gi, 'Ma trận tra cứu use case');
  out = out.replace(/CHI TIẾT USE CASE THEO MODULE\s*\(\d+\s*UC\)/gi, 'CHI TIẾT USE CASE THEO MODULE');
  out = out.replace(/Chi tiết\s*\d+\s*UC theo module/gi, 'Chi tiết use case theo module');
  out = out.replace(/Đủ\s*373\s*chức năng có mô tả/g, 'Danh mục use case có mô tả');
  out = out.replace(/UAT pilot/gi, 'UAT');
  out = out.replace(/\(các UC pilot[^)]*\)/gi, '');
  out = out.replace(/\|\s*Phạm vi\s*\|\s*\*\*\d+\s*use case\*\*[^|]*\|/gi, '| Phạm vi | Hệ sinh thái XeVN — use case theo phân hệ |');
  out = out.replace(/\*\*Changelog v\d+[^*]*\*\*/gi, '');
  out = out.replace(/\*\*Mục lục logic:\*\*[^\n]*\n?/gi, '');
  out = out.replace(/\| Chuẩn cấu trúc \|[^\n]*\n/gi, '');
  out = out.replace(/\(373 USE CASE[^)]*\)/gi, '');
  out = out.replace(/—\s*M00–M08/gi, '');
  out = out.replace(/stat-row\s*\/\s*flow-box[^\n]*/gi, '');
  out = out.replace(/\*\*Kiểm chứng \(Verify\):\*\*/gi, '**Kiểm chứng:**');
  out = out.replace(/trace\s*`REQ-SRS-[^`]+`\s*trong ma trận Phụ lục B[;·]?\s*/gi, '');
  out = out.replace(/contract\s+Phase\s*2/gi, 'giai đoạn 2');
  out = out.replace(/API dự kiến/gi, 'API');
  out = out.replace(/Ghi chú triển khai/gi, 'Ghi chú');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

export function sanitizeDocMarkdown(md) {
  let out = stripClientDeliveryMeta(md);
  out = out.replace(/\*\([^)]*traceability[^)]*\)\*/gi, '');
  out = out.replace(/\(tham chiếu [Tt]raceability\)/g, '');
  out = out.replace(/\*Nguồn:\s*`[^`]+`[^*]*\*/g, '');
  out = out.replace(/\*Nguồn chi tiết:[^*]+\*/g, '');
  out = out.replace(/\*Nguồn:[^*]+\*/g, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  for (const [re, title] of DOC_TITLE_RULES) {
    out = out.replace(re, title);
  }
  out = out.replace(/`([^`]+\.md)`/g, (_, name) => {
    const base = name.replace(/^.*\//, '').replace(/\.md$/i, '');
    return base.replace(/_/g, ' ');
  });
  out = out.replace(/\[`([^`]+)`\]\([^)]+\)/g, '$1');
  return out.trim();
}

export function embedImagePlaceholders(md) {
  let out = md;
  for (const [rel, key] of Object.entries(IMAGE_ALIASES)) {
    const re = new RegExp(
      `!\\[[^\\]]*\\]\\(${rel.replace(/\./g, '\\.')}\\)`,
      'g',
    );
    out = out.replace(re, `[[IMG:${key}]]`);
  }
  return out;
}

/** SRS: no-op enrich (Bateco 6-chapter body). */
export function enrichSrsMarkdown(body) {
  const fr = (body.match(/^#### FR-/gm) || []).length;
  if (fr !== 373) {
    console.warn(`SRS: expected 373 FR blocks, got ${fr}`);
  }
  return body;
}

export function enrichBrdMarkdown(body) {
  const stakeholders = `
### Các nhóm người dùng chính

| Vai trò | Mô tả công việc trên hệ thống |
|---------|--------------------------------|
| Ban điều hành / Chủ đầu tư | Xem bảng điều hành, phê duyệt chiến lược, giám sát chỉ số tập đoàn |
| Quản trị hệ thống / IT | Thiết lập đơn vị vận hành, tài khoản, tích hợp, vận hành hạ tầng |
| Quản trị XBOS | Chuẩn hóa danh mục, quy trình phê duyệt, phân công trách nhiệm, phát hành cấu hình |
| Nhân sự / HR | Hồ sơ nhân viên, chấm công, lương, tuyển dụng, phê duyệt đơn |
| Nhân viên | Ứng dụng di động: chấm công, đơn nghỉ, phiếu lương, thông báo |
| Kinh doanh / Điều phối Logistic | Báo giá, đơn hàng, chuyến, cam kết dịch vụ (Giai đoạn 2) |
| Lái xe / Hiện trường | Ứng dụng lái xe: nhận chuyến, chứng từ giao nhận, sự cố (Giai đoạn 2) |
`;

  let out = body.replace(
    /(\*\*Lộ trình triển khai:\*\*[^\n]+\n)\n(---\n\n## 2\.)/,
    `$1\n${stakeholders}\n$2`,
  );

  out = out.replace(
    /^### 7\.3 Luồng nghiệp vụ — Thiết lập công ty/m,
    '### LUỒNG 1 — Thiết lập công ty trên Trung tâm điều hành',
  );
  out = out.replace(
    /^### 7\.4 Luồng nghiệp vụ — Phê duyệt quy trình/m,
    '### LUỒNG 2 — Phê duyệt quy trình trên XBOS',
  );
  out = out.replace(
    /^### 8\.3 Luồng nghiệp vụ — Đơn nghỉ/m,
    '### LUỒNG 3 — Đơn nghỉ phép và phê duyệt (HRM)',
  );
  out = out.replace(
    /^### 8\.4 Luồng — Đồng bộ danh mục/m,
    '### LUỒNG 4 — Đồng bộ danh mục HRM từ XBOS',
  );
  out = out.replace(
    /^### 9\.3 Luồng nghiệp vụ — Từ báo giá đến chuyến/m,
    '### LUỒNG 5 — Từ báo giá đến chuyến (Logistic — Giai đoạn 2)',
  ); /* giữ tương thích tiêu đề cũ nếu còn sót */

  const flowsIntro = `
## 6.5 Sơ đồ luồng nghiệp vụ cốt lõi

Các sơ đồ sequence và flowchart mô tả hành vi chính. LUỒNG 6–9 (mục 7.2.1) mô tả vai trò XBOS trong quản trị danh mục, đồng bộ HRM, mở rộng có phê duyệt và cấu hình quy trình.

`;

  if (!out.includes('## 6.5 Sơ đồ luồng')) {
    out = out.replace(/(\n## 7\. Phân hệ XBOS)/, `${flowsIntro}$1`);
  }

  if (!out.includes('LUỒNG 6 — Khai báo danh mục')) {
    console.warn('BRD source missing LUỒNG 6–9; rebuild from updated BRD_TONG_HOP_HE_SINH_THAI_XEVN.md');
  }

  out = out.replace(
    /\| Nguồn \| `BANG_TONG_HOP_USECASE_XEVN\.md` \|/g,
    '| Nguồn | Bảng tổng hợp tình huống sử dụng hệ sinh thái XeVN |',
  );

  return applyBrdVietnameseProse(out);
}
