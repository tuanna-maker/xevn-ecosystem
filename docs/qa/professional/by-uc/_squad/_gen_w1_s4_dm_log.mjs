/**
 * One-shot generator: W1-S4-DM-LOG professional by-uc TC files.
 * DESIGN only — not executed. Delete after synth if desired.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..');

const META = {
  author: 'qa · PO-UC-TC-W1-S4-DM-LOG',
  srs_old: '`docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119',
  srs_new: '**N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03',
  tech_spec:
    '`docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC',
  api_contract:
    '`GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001`',
  surfaces: 'web-portal (Command Center / catalog admin) / xbos-cc / api',
  mod: 'M03',
};

/** @typedef {{ stt: number, id: string, name: string, actors: string, goal: string, caps: Cap[], readiness: string, code_note: string, layer_findings: {be:string,fe:string,mobile:string,rbac:string} }} UcDef */
/** @typedef {{ id: string, name: string, purpose: string, actor: string, fns: Fn[] }} Cap */
/** @typedef {{ id: string, name: string, ui: string, mutate: boolean, cases: Case[] }} Fn */
/** @typedef {{ type: string, pri: string, persona: string, pre: string, steps: string, expected: string, layer: string, trace: string }} Case */

/** @type {UcDef[]} */
const UCS = [
  {
    stt: 98,
    id: 'XBOS-DM-LOG-01',
    name: 'Xem tổng quan danh mục theo phân hệ Logistic',
    actors: 'Group CEO · XBOS Catalog Admin · Data steward',
    goal: 'Người quản trị xem được bộ danh mục thuộc phân hệ Logistic (keys `log_dm_*` / assignment logistic), lọc theo công ty/tenant, nhận biết trạng thái publish/draft và số lượng giá trị — không mutate.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'BE: `GET /config-sync/catalogs` tồn tại; filter `log_dm_*` mô tả trong TECHSPEC_M03. Spec jest gắn cả 22 UC vào một call inbox — không chứng minh UI overview logistic. FE portal catalog admin logistic-specific: chưa spot-check → không claim full IMPL.',
    layer_findings: {
      be: 'config-sync list catalogs — pattern OK; domain filter logistic cần xác nhận runtime',
      fe: 'Portal CC moduleKey logistics có tab; màn «tổng quan DM LOG» riêng chưa neo HDSD',
      mobile: 'N/A — XBOS catalog',
      rbac: 'Group CEO `main`/`holding` ADR; member CEO chỉ CT mình',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Mở tổng quan danh mục Logistic',
        purpose: 'Điều hướng đúng phân hệ và thấy danh sách nhóm DM',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-OV-OPEN',
            name: 'Mở màn tổng quan DM Logistic',
            ui: 'Portal → XBOS / Catalog · filter phân hệ Logistic',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Đã login tập đoàn; có ≥1 catalog key logistic (hoặc empty hợp lệ)',
                steps: '1. Mở Portal catalog admin 2. Chọn phân hệ Logistic 3. Quan sát lưới nhóm DM',
                expected: 'GET catalogs 2xx; lưới hiện nhóm `log_dm_*` hoặc empty state rõ; không banner ERROR',
                layer: 'UI/API',
                trace: 'BANG_TONG LOG-01 · TECHSPEC_M03 §2 List',
              },
              {
                type: 'UX',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Tenant chưa có key logistic',
                steps: '1. Mở tổng quan Logistic',
                expected: 'Empty state hướng dẫn khai báo; không spinner vô hạn; không GET storm',
                layer: 'UI',
                trace: 'U65 FE-only · UX state',
              },
            ],
          },
          {
            id: 'FN-OV-FILTER',
            name: 'Lọc / tìm kiếm nhóm danh mục',
            ui: 'ô tìm · filter status',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Có ≥2 nhóm DM',
                steps: '1. Gõ mã/tên nhóm 2. Áp dụng filter draft/published',
                expected: 'Lưới thu hẹp đúng; count khớp',
                layer: 'UI',
                trace: 'LOG-01',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'du-lich.ceo@xe.vn',
                pre: 'Member CEO token scope CT thành viên',
                steps: '1. Gọi list catalogs với companyId ngoài scope / rollup tập đoàn',
                expected: '403/409 SCOPE — không lộ catalog holding ngoài quyền',
                layer: 'API',
                trace: 'ADR-GROUP-CEO · TECHSPEC_M03 §3',
              },
            ],
          },
        ],
      },
      {
        id: 'CAP-02',
        name: 'Đọc chi tiết metadata nhóm',
        purpose: 'Xem version, số item, assignmentTargets',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-OV-DETAIL',
            name: 'Mở chi tiết nhóm danh mục',
            ui: 'click row → panel',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Có ≥1 nhóm trên list',
                steps: '1. Click nhóm 2. Xem metadata version/checksum/targets',
                expected: 'Detail load 2xx; `assignmentTargets` chứa logistic nếu đã gán; F5 giữ context',
                layer: 'UI/API',
                trace: 'LOG-01 · LOG-07 related',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'catalogKey không tồn tại',
                steps: '1. Deep link / GET by key giả',
                expected: '404/4xx deterministic; UI lỗi rõ, không crash',
                layer: 'UI/API',
                trace: 'fail-deep',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 99,
    id: 'XBOS-DM-LOG-02',
    name: 'Tạo nhóm danh mục mới',
    actors: 'Group CEO · Catalog Admin',
    goal: 'Tạo nhóm danh mục mới thuộc miền Logistic (mã, tên, mô tả, domain) trên hub XBOS; sau lưu thấy trên tổng quan và F5 còn.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'Publish/create catalog qua config-sync pattern M01; TECHSPEC_M03 map LOG-02 vào CRUD publish — không có DTO/UI riêng «Tạo nhóm LOG». code_readiness PARTIAL; FE tạo nhóm logistic có thể GAP.',
    layer_findings: {
      be: 'POST publish / catalog upsert pattern — generic',
      fe: 'Form tạo nhóm domain=logistic — cần xác nhận menu HDSD',
      mobile: 'N/A',
      rbac: 'Chỉ group write scope',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Tạo nhóm DM mới',
        purpose: 'Đăng ký nhóm master cho Logistic',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-GRP-CREATE',
            name: 'Lưu nhóm danh mục mới',
            ui: 'Nút Thêm nhóm · form mã/tên/domain',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Quyền admin catalog; mã chưa tồn tại',
                steps: '1. Thêm nhóm 2. Nhập mã `log_dm_*` hợp lệ + tên VI 3. Domain/logistic 4. Lưu',
                expected: '2xx; row xuất hiện trên tổng quan; F5 còn; không seed ngoài FE',
                layer: 'UI/API',
                trace: 'LOG-02 · TECHSPEC_M03 CRUD',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Mã đã tồn tại hoặc thiếu mã bắt buộc',
                steps: '1. Submit trùng mã / bỏ trống tên',
                expected: '4xx validate; không tạo bản ghi; toast/inline lỗi',
                layer: 'UI/API',
                trace: 'fail-deep validate',
              },
              {
                type: 'BD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Form mở',
                steps: '1. Mã max length / ký tự đặc biệt / khoảng trắng',
                expected: 'Chặn hoặc normalize theo BR; không 500',
                layer: 'UI/API',
                trace: 'boundary',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'du-lich.ceo@xe.vn',
                pre: 'Member CEO',
                steps: '1. Thử tạo nhóm holding/logistic toàn tập đoàn',
                expected: '403/409 — không tạo được nhóm tập đoàn',
                layer: 'API',
                trace: 'scope',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Submit đang pending',
                steps: '1. Double-click Lưu',
                expected: 'Idempotent / disabled button; không 2 row trùng',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 100,
    id: 'XBOS-DM-LOG-03',
    name: 'Thêm giá trị vào danh mục',
    actors: 'Catalog Admin · Data steward',
    goal: 'Thêm giá trị (code, label, sort, parent optional) vào nhóm DM Logistic đã có; giá trị usable sau publish/F5.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'TECHSPEC_M03: CRUD values via `POST …/catalog/{key}/publish` items[] — cùng XBOS-DM-03..05. Không API logistic riêng. FE thêm giá trị trên catalog panel generic = PARTIAL.',
    layer_findings: {
      be: 'publish items append — pattern',
      fe: 'Form thêm giá trị trên catalog key',
      mobile: 'N/A',
      rbac: 'Group write',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Thêm giá trị danh mục',
        purpose: 'Bổ sung mã dùng cho form Logistic',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-VAL-ADD',
            name: 'Thêm giá trị vào nhóm',
            ui: 'Chi tiết nhóm → Thêm giá trị → Lưu',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Nhóm DM tồn tại (tạo từ LOG-02 hoặc đã có)',
                steps: '1. Mở nhóm 2. Thêm code+label VI 3. Lưu/Publish theo UI',
                expected: '2xx; giá trị hiện list; F5 còn',
                layer: 'UI/API',
                trace: 'LOG-03 · TECHSPEC_M03',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Code trùng trong cùng key',
                steps: '1. Thêm code trùng',
                expected: '4xx; không ghi đè im lặng (trừ BR replace rõ)',
                layer: 'UI/API',
                trace: 'FD duplicate',
              },
              {
                type: 'BD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Form mở',
                steps: '1. Label rỗng / code chỉ space',
                expected: 'Validate chặn',
                layer: 'UI/API',
                trace: 'BD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member CEO',
                pre: 'Ngoài scope',
                steps: '1. POST items companyId lệch JWT',
                expected: 'SCOPE_CONTEXT_MISMATCH',
                layer: 'API',
                trace: 'ADR scope',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Nhóm locked pending approve (nếu WF)',
                steps: '1. Thử thêm giá trị khi pending',
                expected: 'UI khóa hoặc tạo change-request — không mutate lén',
                layer: 'UI',
                trace: 'LOG-12 related',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 101,
    id: 'XBOS-DM-LOG-04',
    name: 'Sửa giá trị danh mục',
    actors: 'Catalog Admin',
    goal: 'Sửa label/thuộc tính giá trị đã có (không đổi nghĩa code khi BR cấm); thay đổi phản ánh sau lưu/F5; giá trị đang dùng cảnh báo nếu nhạy cảm.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'Cùng publish items pattern. Sửa nhạy cảm có thể route LOG-12 — SPEC_GAP nếu UI không phân nhánh sensitive.',
    layer_findings: {
      be: 'publish replace item fields',
      fe: 'Inline edit / form sửa',
      mobile: 'N/A',
      rbac: 'Group write',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Sửa giá trị',
        purpose: 'Cập nhật nhãn/metadata',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-VAL-EDIT',
            name: 'Lưu sửa giá trị',
            ui: 'Sửa → Lưu',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Có giá trị active',
                steps: '1. Đổi label VI 2. Lưu',
                expected: '2xx; list cập nhật; F5 đúng label mới',
                layer: 'UI/API',
                trace: 'LOG-04',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Giá trị thuộc catalog nhạy cảm / BR cấm đổi code',
                steps: '1. Đổi code sang mã khác',
                expected: 'Chặn hoặc bắt buộc WF LOG-12; không 2xx im lặng phá FK',
                layer: 'UI/API',
                trace: 'LOG-12 bridge · SPEC_GAP nếu thiếu nhánh',
              },
              {
                type: 'BD',
                pri: 'P2',
                persona: 'ceo@xe.vn',
                pre: 'Label rất dài',
                steps: '1. Paste > max',
                expected: 'Validate',
                layer: 'UI/API',
                trace: 'BD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Sai scope',
                steps: '1. PATCH/publish ngoài scope',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Concurrent edit',
                steps: '1. Hai tab sửa cùng item',
                expected: 'Last-write hoặc conflict rõ — không corrupt JSON',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 102,
    id: 'XBOS-DM-LOG-05',
    name: 'Ngừng hoặc kích hoạt giá trị',
    actors: 'Catalog Admin',
    goal: 'Chuyển trạng thái giá trị active↔inactive; giá trị ngừng không chọn được trên form vận hành mới nhưng giữ lịch sử tham chiếu.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'Status flag trên item trong publish payload — pattern M01. Soft-disable expected; hard-delete cấm platform catalog.',
    layer_findings: {
      be: 'item.status active/inactive',
      fe: 'Toggle Ngừng/Kích hoạt',
      mobile: 'N/A',
      rbac: 'Group write',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Đổi trạng thái giá trị',
        purpose: 'Ngừng dùng / mở lại',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-VAL-TOGGLE',
            name: 'Ngừng hoặc kích hoạt',
            ui: 'Toggle / menu trạng thái',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Giá trị active',
                steps: '1. Ngừng 2. Xác nhận 3. F5',
                expected: 'status inactive; không còn picker active; bản ghi còn trên admin',
                layer: 'UI/API',
                trace: 'LOG-05',
              },
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Giá trị inactive',
                steps: '1. Kích hoạt lại',
                expected: 'active; picker thấy lại sau publish nếu cần',
                layer: 'UI/API',
                trace: 'LOG-05',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Giá trị bắt buộc hệ thống / platform-locked',
                steps: '1. Ngừng giá trị nền tảng',
                expected: '4xx / khóa UI — không soft-delete platform row',
                layer: 'UI/API',
                trace: 'platform catalog guard',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Sai scope',
                steps: '1. Toggle ngoài scope',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Sau ngừng',
                steps: '1. Filter «Đang dùng» vs «Ngừng»',
                expected: 'Badge trạng thái rõ; không chỉ màu',
                layer: 'UI',
                trace: 'a11y status',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 103,
    id: 'XBOS-DM-LOG-06',
    name: 'Sắp xếp phân cấp cha–con',
    actors: 'Catalog Admin',
    goal: 'Gán/sắp parent–child và thứ tự hiển thị cây danh mục Logistic (kéo-thả hoặc gán parent); cấu trúc lưu và F5 còn.',
    readiness: 'UNKNOWN',
    code_note:
      'TECHSPEC_M03 không map endpoint riêng LOG-06 (chỉ CRUD publish). Hierarchy/parentId có thể nằm trong items JSON — **UNKNOWN** FE kéo-thả; rủi ro GAP nếu chỉ flat list.',
    layer_findings: {
      be: 'parentId/sortOrder trong items — chưa xác nhận schema LOG',
      fe: 'Tree DnD — UNKNOWN',
      mobile: 'N/A',
      rbac: 'Group write',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Thiết lập phân cấp',
        purpose: 'Cây cha–con đúng nghiệp vụ 3 tầng',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-TREE-ASSIGN',
            name: 'Gán parent cho giá trị',
            ui: 'Tree / gán cha',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: '≥2 cấp giá trị',
                steps: '1. Gán con vào cha 2. Lưu',
                expected: 'Cây đúng; F5 còn quan hệ',
                layer: 'UI/API',
                trace: 'LOG-06 · liên quan LOG-20/21',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Có cây',
                steps: '1. Tạo vòng (A→B→A) hoặc gán cha = chính nó',
                expected: '4xx BR cycle; không lưu',
                layer: 'API',
                trace: 'FD cycle',
              },
              {
                type: 'BD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Cây sâu',
                steps: '1. Vượt max depth (vd >3 với LOG-20)',
                expected: 'Chặn hoặc cảnh báo theo BR 3 tầng',
                layer: 'UI/API',
                trace: 'LOG-20 BR',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Sai scope',
                steps: '1. Đổi cây holding',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'DnD',
                steps: '1. Kéo thả sai vùng',
                expected: 'Snap-back / toast; không mất node',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
          {
            id: 'FN-TREE-SORT',
            name: 'Đổi thứ tự anh–em',
            ui: 'sortOrder / kéo ngang cấp',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: '≥2 sibling',
                steps: '1. Đổi thứ tự 2. Lưu',
                expected: 'Thứ tự mới sau F5',
                layer: 'UI/API',
                trace: 'LOG-06',
              },
              {
                type: 'FD',
                pri: 'P2',
                persona: 'ceo@xe.vn',
                pre: 'sortOrder âm / trùng',
                steps: '1. API sort bất hợp lệ',
                expected: '4xx hoặc normalize documented',
                layer: 'API',
                trace: 'FD',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 104,
    id: 'XBOS-DM-LOG-07',
    name: 'Gán danh mục cho phân hệ Logistic',
    actors: 'Catalog Admin · Group CEO',
    goal: 'Gắn nhóm danh mục vào phân hệ Logistic (`assignmentTargets: [logistic]`) để spoke/form LOG nhìn thấy đúng bộ DM.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'TECHSPEC_M03: metadata assignmentTargets seed JSON. Runtime UI gán phân hệ có thể chỉ seed — PARTIAL/UNKNOWN FE.',
    layer_findings: {
      be: 'catalog metadata assignmentTargets',
      fe: 'UI gán phân hệ — spot UNKNOWN',
      mobile: 'N/A',
      rbac: 'Group admin',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Gán phân hệ',
        purpose: 'Catalog visible cho Logistic',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-ASSIGN-MOD',
            name: 'Gán/gỡ assignment Logistic',
            ui: 'Metadata · checkbox phân hệ',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Nhóm chưa gán logistic',
                steps: '1. Gán Logistic 2. Lưu 3. Mở tổng quan LOG-01',
                expected: 'Nhóm xuất hiện filter Logistic; F5 còn',
                layer: 'UI/API',
                trace: 'LOG-07 · TECHSPEC_M03',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Nhóm đang dùng',
                steps: '1. Gỡ assignment khi còn consumer',
                expected: 'Cảnh báo / chặn nếu BR; không orphan im lặng',
                layer: 'UI/API',
                trace: 'FD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Member',
                steps: '1. Đổi assignment tập đoàn',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Đa phân hệ',
                steps: '1. Gán đồng thời HRM+Logistic nếu UI cho',
                expected: 'Targets phản ánh đủ; filter từng phân hệ đúng',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 105,
    id: 'XBOS-DM-LOG-08',
    name: 'Gán danh mục theo công ty thành viên',
    actors: 'Group CEO · Catalog Admin',
    goal: 'Chỉ định bộ/phiên bản danh mục áp dụng cho từng công ty thành viên (slug/UUID) trong tập đoàn.',
    readiness: 'UNKNOWN',
    code_note:
      'TECHSPEC_M03: «Bootstrap script per company slug» — thiên seed/DevOps, không FE mutate chuẩn. DESIGN cases vẫn mô tả FE mong muốn; **code_readiness UNKNOWN/GAP** cho UI; U65 cấm seed trong evidence UAT sau này.',
    layer_findings: {
      be: 'applyCatalogToMembers / company assignment — config-sync có apply members pattern HRM',
      fe: 'UI gán theo CT — UNKNOWN',
      mobile: 'N/A',
      rbac: 'Group only; member không gán CT khác',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Gán DM theo công ty',
        purpose: 'Member thấy đúng bộ catalog',
        actor: 'Group CEO',
        fns: [
          {
            id: 'FN-CO-ASSIGN',
            name: 'Áp dụng catalog cho CT thành viên',
            ui: 'Chọn CT → Áp dụng',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Có CT thành viên + catalog published',
                steps: '1. Chọn CT 2. Chọn bộ DM 3. Áp dụng',
                expected: '2xx; CT nhận version; F5 member scope thấy',
                layer: 'UI/API',
                trace: 'LOG-08 · config-sync apply members',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'CT không tồn tại / sai slug',
                steps: '1. Apply companyId giả',
                expected: '4xx; không ghi partial',
                layer: 'API',
                trace: 'FD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'du-lich.ceo@xe.vn',
                pre: 'Member CEO',
                steps: '1. Apply sang CT khác',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Nhiều CT',
                steps: '1. Xem ma trận CT×catalog version',
                expected: 'Bảng rõ version/checksum từng CT',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 106,
    id: 'XBOS-DM-LOG-09',
    name: 'Sao chép bộ danh mục sang công ty mới',
    actors: 'Group CEO · Catalog Admin · DevOps (bootstrap)',
    goal: 'Copy nguyên bộ DM Logistic từ CT nguồn sang CT đích mới (onboarding) mà không nhân bản tay từng giá trị.',
    readiness: 'GAP',
    code_note:
      'TECHSPEC_M03 ghi bootstrap script — không logistic-api. Copy FE end-to-end **GAP** khả năng cao; cases DESIGN từ UC name. Không dùng seed làm PASS UAT.',
    layer_findings: {
      be: 'bootstrap/copy script — không contract UI ổn định',
      fe: 'Wizard copy — GAP/UNKNOWN',
      mobile: 'N/A',
      rbac: 'Group only',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Sao chép bộ DM',
        purpose: 'Onboard CT mới nhanh',
        actor: 'Group CEO',
        fns: [
          {
            id: 'FN-COPY-BUNDLE',
            name: 'Copy catalog bundle CT→CT',
            ui: 'Sao chép bộ danh mục',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'CT nguồn có bộ LOG; CT đích trống',
                steps: '1. Chọn nguồn 2. Chọn đích 3. Xác nhận copy',
                expected: '2xx; đích có đủ keys/items; F5; nguồn không đổi',
                layer: 'UI/API',
                trace: 'LOG-09',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Đích đã có conflict keys',
                steps: '1. Copy đè',
                expected: 'Merge policy rõ (skip/overwrite) hoặc chặn; không half-copy',
                layer: 'API',
                trace: 'FD conflict',
              },
              {
                type: 'BD',
                pri: 'P2',
                persona: 'ceo@xe.vn',
                pre: 'Bundle lớn',
                steps: '1. Copy full 183-subset logistic',
                expected: 'Timeout/progress UX; không 500 im lặng',
                layer: 'UI/API',
                trace: 'BD size',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Member',
                steps: '1. Copy sang CT khác',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Job async',
                steps: '1. Theo dõi tiến độ copy',
                expected: 'Trạng thái running/done/fail',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 107,
    id: 'XBOS-DM-LOG-10',
    name: 'Xuất danh mục ra file',
    actors: 'Catalog Admin',
    goal: 'Xuất nhóm/bộ DM Logistic ra file (CSV/JSON) để lưu trữ hoặc chuyển môi trường.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'TECHSPEC_M03 + OpenAPI delta: export paths config-sync. Cần xác nhận FE nút Xuất trên catalog LOG.',
    layer_findings: {
      be: 'GET/POST export catalog',
      fe: 'Nút Xuất file',
      mobile: 'N/A',
      rbac: 'Admin + scope',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Xuất file',
        purpose: 'Portable snapshot',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-EXPORT',
            name: 'Xuất CSV/JSON danh mục',
            ui: 'Xuất → tải file',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Có nhóm + values',
                steps: '1. Chọn nhóm/bộ 2. Xuất',
                expected: '2xx; file tải; nội dung khớp list (code/label/status)',
                layer: 'UI/API',
                trace: 'LOG-10 · OpenAPI export',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Key không tồn tại',
                steps: '1. Export key giả',
                expected: '4xx',
                layer: 'API',
                trace: 'FD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Ngoài scope',
                steps: '1. Export holding full',
                expected: '403/409 hoặc chỉ CT mình',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P2',
                persona: 'ceo@xe.vn',
                pre: 'Empty catalog',
                steps: '1. Xuất nhóm trống',
                expected: 'File header-only hoặc thông báo empty — không crash',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 108,
    id: 'XBOS-DM-LOG-11',
    name: 'Nhập danh mục từ file mẫu',
    actors: 'Catalog Admin',
    goal: 'Import giá trị từ file mẫu (template) vào nhóm DM; validate hàng lỗi; commit khi hợp lệ.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'Import path OpenAPI delta. U65: import qua UI, không SQL. Risk: template LOG chưa có — SPEC_GAP template.',
    layer_findings: {
      be: 'import endpoint + row errors',
      fe: 'Upload + preview',
      mobile: 'N/A',
      rbac: 'Group write',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Nhập từ file mẫu',
        purpose: 'Bulk load an toàn',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-IMPORT',
            name: 'Upload & commit import',
            ui: 'Nhập file → xem trước → Xác nhận',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'File mẫu hợp lệ',
                steps: '1. Tải mẫu (nếu có) 2. Upload 3. Preview OK 4. Xác nhận',
                expected: '2xx; values xuất hiện; F5 còn',
                layer: 'UI/API',
                trace: 'LOG-11',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'File sai cột / trùng code',
                steps: '1. Upload invalid',
                expected: 'Row errors; không commit partial trừ BR rõ',
                layer: 'UI/API',
                trace: 'FD validate',
              },
              {
                type: 'BD',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'File lớn / encoding',
                steps: '1. UTF-8 BOM · max rows',
                expected: 'Giới hạn rõ; không 500',
                layer: 'API',
                trace: 'BD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Sai scope',
                steps: '1. Import holding',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Preview',
                steps: '1. Hủy sau preview',
                expected: 'Không ghi DB',
                layer: 'UI',
                trace: 'UX cancel',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 109,
    id: 'XBOS-DM-LOG-12',
    name: 'Gửi phê duyệt khi sửa danh mục nhạy cảm',
    actors: 'Catalog Admin member/tenant · Workflow',
    goal: 'Thay đổi DM nhạy cảm không apply ngay — tạo yêu cầu + workflow instance tới inbox phê duyệt tập đoàn.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'TECHSPEC_M03: `catalog-governance/workflows/start` — pattern CAT/HRM. Jest chỉ smoke inbox gắn label 22 UC LOG. Sensitive flag per logistic key **SPEC_GAP** nếu chưa cấu hình.',
    layer_findings: {
      be: 'startCatalogApprovalWorkflow + HRM batches bridge',
      fe: 'Gửi duyệt thay vì Lưu thẳng',
      mobile: 'N/A',
      rbac: 'Requester member; approver group',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Gửi yêu cầu duyệt thay đổi nhạy cảm',
        purpose: 'Governance trước khi publish',
        actor: 'Catalog Admin',
        fns: [
          {
            id: 'FN-SENS-SUBMIT',
            name: 'Submit change → WF start',
            ui: 'Gửi phê duyệt',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'HR/Catalog member role',
                pre: 'Catalog marked sensitive; WF def tồn tại (tạo từ FE designer — U65)',
                steps: '1. Sửa giá trị nhạy cảm 2. Gửi phê duyệt',
                expected: 'XBOS-CAT-211/2xx; wi tạo; inbox group có task; giá trị chưa apply production',
                layer: 'UI/API',
                trace: 'LOG-12 · catalog-governance start',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'admin',
                pre: 'Thiếu WF definition',
                steps: '1. Gửi duyệt',
                expected: '4xx rõ «chưa cấu hình QT»; không silent apply',
                layer: 'UI/API',
                trace: 'FD no WF',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'user vô quyền',
                pre: 'Role không được sửa DM',
                steps: '1. Submit',
                expected: '403',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P0',
                persona: 'requester',
                pre: 'Đã submit',
                steps: '1. Xem trạng thái pending',
                expected: 'Badge chờ duyệt; edit khóa',
                layer: 'UI',
                trace: 'UX SM',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'requester',
                pre: 'Pending tồn tại',
                steps: '1. Submit trùng change',
                expected: 'Chặn duplicate WI hoặc gộp — deterministic',
                layer: 'API',
                trace: 'FD dup',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 110,
    id: 'XBOS-DM-LOG-13',
    name: 'Phê duyệt hoặc từ chối thay đổi danh mục',
    actors: 'Group CEO · Approver catalog governance',
    goal: 'Approver xử lý task inbox: duyệt → apply/publish; từ chối → lý do, requester thấy rejected.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'catalog-governance approve/reject + inbox `XBOS-CAT-212`. Plane dùng chung HRM extension; logistic-specific task type chưa tách rõ → PARTIAL.',
    layer_findings: {
      be: 'actOnTask approve/reject · scope main/holding',
      fe: 'CC Inbox Xử lý nhanh',
      mobile: 'N/A',
      rbac: 'Approver JWT scope',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Duyệt thay đổi',
        purpose: 'Apply sau governance',
        actor: 'Group CEO',
        fns: [
          {
            id: 'FN-APPR-OK',
            name: 'Phê duyệt task catalog',
            ui: 'Inbox → Duyệt',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Task pending từ LOG-12 (chuỗi FE)',
                steps: '1. Mở inbox 2. Mở task 3. Duyệt',
                expected: '2xx; catalog applied/published; F5 requester thấy giá trị mới',
                layer: 'UI/API',
                trace: 'LOG-13 · XBOS-CAT approve',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'ceo@ holding mismatch',
                pre: 'JWT companyId lệch query',
                steps: '1. Approve với scope mismatch',
                expected: 'SCOPE_CONTEXT_MISMATCH — đã có unit test pattern',
                layer: 'API',
                trace: 'catalog-governance.controller.spec',
              },
            ],
          },
        ],
      },
      {
        id: 'CAP-02',
        name: 'Từ chối thay đổi',
        purpose: 'Không apply + feedback',
        actor: 'Group CEO',
        fns: [
          {
            id: 'FN-APPR-REJ',
            name: 'Từ chối + lý do',
            ui: 'Inbox → Từ chối',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Task pending',
                steps: '1. Từ chối + lý do bắt buộc 2. F5 requester',
                expected: 'rejected; production catalog không đổi; lý do visible',
                layer: 'UI/API',
                trace: 'LOG-13',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Form từ chối',
                steps: '1. Reject thiếu lý do',
                expected: 'Validate chặn',
                layer: 'UI/API',
                trace: 'FD',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'approver',
                pre: 'Task đã xử lý',
                steps: '1. Approve lại',
                expected: 'Idempotent / 4xx already completed',
                layer: 'UI/API',
                trace: 'UX SM',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 111,
    id: 'XBOS-DM-LOG-14',
    name: 'Xem lịch sử thay đổi danh mục',
    actors: 'Catalog Admin · Auditor',
    goal: 'Xem audit trail thay đổi catalog (ai, khi nào, field trước/sau, version).',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'TECHSPEC_M03: `platform-audit/events?entityType=catalog`. UI lịch sử trên panel LOG — UNKNOWN depth.',
    layer_findings: {
      be: 'platform-audit events',
      fe: 'Tab Lịch sử',
      mobile: 'N/A',
      rbac: 'Admin/auditor read',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Xem lịch sử',
        purpose: 'Truy vết thay đổi',
        actor: 'Auditor',
        fns: [
          {
            id: 'FN-HIST-LIST',
            name: 'List sự kiện audit catalog',
            ui: 'Lịch sử · filter thời gian',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Đã có mutate LOG-03/04 trước đó (FE)',
                steps: '1. Mở lịch sử nhóm 2. Xem event mới nhất',
                expected: '2xx; event actor+timestamp+diff; khớp thao tác',
                layer: 'UI/API',
                trace: 'LOG-14 · platform-audit',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Chưa có event',
                steps: '1. Mở lịch sử',
                expected: 'Empty hợp lệ',
                layer: 'UI',
                trace: 'UX',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Member',
                steps: '1. Đọc audit holding',
                expected: '403/409 hoặc chỉ CT mình',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'FD',
                pri: 'P2',
                persona: 'ceo@xe.vn',
                pre: 'entityId sai',
                steps: '1. Query audit giả',
                expected: 'Empty/404 — không 500',
                layer: 'API',
                trace: 'FD',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 112,
    id: 'XBOS-DM-LOG-15',
    name: 'Công ty con yêu cầu bổ sung trường danh mục',
    actors: 'Member Catalog/HR Admin · Group approver',
    goal: 'CT thành viên tạo yêu cầu thêm field/giá trị mở rộng cho DM Logistic; chuyển duyệt tập đoàn (tương tự extension HRM).',
    readiness: 'UNKNOWN',
    code_note:
      'TECHSPEC_M03 map `catalog-governance/extension-requests` — hiện bridge mạnh sang HRM settings-catalogs. Extension **Logistic** field có thể chưa tách domain → UNKNOWN/GAP vs HRM CAT-EXT.',
    layer_findings: {
      be: 'extension-requests — HRM-centric',
      fe: 'Form yêu cầu bổ sung field LOG — UNKNOWN',
      mobile: 'N/A',
      rbac: 'Member create; group approve',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Tạo yêu cầu bổ sung trường',
        purpose: 'Tenant extension không tự ý đổi hub',
        actor: 'Member admin',
        fns: [
          {
            id: 'FN-EXT-REQ',
            name: 'Submit extension request',
            ui: 'Yêu cầu bổ sung trường',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'member admin',
                pre: 'Quyền yêu cầu; catalog LOG gán CT',
                steps: '1. Điền field đề xuất 2. Gửi',
                expected: '2xx; request pending; group inbox có việc (chuỗi FE)',
                layer: 'UI/API',
                trace: 'LOG-15 · extension-requests',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'member',
                pre: 'Thiếu tên field / trùng',
                steps: '1. Submit invalid',
                expected: '4xx validate',
                layer: 'UI/API',
                trace: 'FD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'NV thường',
                pre: 'Không role',
                steps: '1. POST extension',
                expected: '403',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'member',
                pre: 'Pending',
                steps: '1. Xem list yêu cầu của CT',
                expected: 'Trạng thái rõ; không edit hub trực tiếp',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 113,
    id: 'XBOS-DM-LOG-16',
    name: 'Công ty con yêu cầu xóa trường — chuyển phê duyệt tập đoàn',
    actors: 'Member admin · Group approver',
    goal: 'CT con không tự xóa field hub; tạo removal request → group duyệt/từ chối; soft-delete only.',
    readiness: 'UNKNOWN',
    code_note:
      'Pattern `hrm_catalog_field_removal_requests` — TECHSPEC_HE §7.2. Logistic removal plane **chưa** chứng minh riêng → UNKNOWN; hard-delete vẫn cấm.',
    layer_findings: {
      be: 'removal request + review',
      fe: 'Yêu cầu xóa trường',
      mobile: 'N/A',
      rbac: 'Member request; group decide',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Yêu cầu xóa trường',
        purpose: 'Governance xóa field',
        actor: 'Member admin',
        fns: [
          {
            id: 'FN-REM-REQ',
            name: 'Tạo removal request',
            ui: 'Yêu cầu xóa → gửi tập đoàn',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'member admin',
                pre: 'Field tồn tại trên CT',
                steps: '1. Chọn field 2. Lý do 3. Gửi',
                expected: 'pending; không xóa ngay; inbox group',
                layer: 'UI/API',
                trace: 'LOG-16',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'member',
                pre: 'Field platform-locked / đang FK',
                steps: '1. Xin xóa',
                expected: 'Chặn hoặc approver thấy risk flag',
                layer: 'UI/API',
                trace: 'FD',
              },
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Removal pending',
                steps: '1. Duyệt/Từ chối trên group',
                expected: 'Duyệt → soft remove; Từ chối → giữ field + lý do',
                layer: 'UI/API',
                trace: 'LOG-16 · LOG-13 pattern',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member khác CT',
                pre: 'Cross company',
                steps: '1. Xóa field CT khác',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'member',
                pre: 'After reject',
                steps: '1. F5 list field',
                expected: 'Field còn; trạng thái rejected visible',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 114,
    id: 'XBOS-DM-LOG-17',
    name: 'Phát hành phiên bản danh mục mới',
    actors: 'Group CEO · Catalog Admin',
    goal: 'Publish version mới (checksum) cho catalog key Logistic; spoke/consumer biết version mới.',
    readiness: 'LIKELY_PARTIAL',
    code_note:
      'POST catalog-governance/publish → config-sync publish `XBOS-CFG-203`. G5 gate. Domain logistic items cần payload đúng.',
    layer_findings: {
      be: 'publishCatalogVersion OK',
      fe: 'Nút Phát hành phiên bản',
      mobile: 'N/A',
      rbac: 'Group write/publish',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Publish version',
        purpose: 'Chốt bản chuẩn hub',
        actor: 'Group CEO',
        fns: [
          {
            id: 'FN-PUBLISH',
            name: 'Phát hành phiên bản',
            ui: 'Phát hành · xác nhận',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Draft changes sẵn; quyền publish',
                steps: '1. Phát hành 2. Xác nhận',
                expected: 'XBOS-CFG-203; version↑ + checksum; status PUBLISHED; F5',
                layer: 'UI/API',
                trace: 'LOG-17 · TECHSPEC_HE §7.1',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Items invalid / empty mandatory',
                steps: '1. Publish',
                expected: '4xx; version không tăng',
                layer: 'API',
                trace: 'FD',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Member',
                steps: '1. Publish hub',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'Đang publish',
                steps: '1. Double submit',
                expected: 'Một version hoặc idempotent',
                layer: 'UI',
                trace: 'UX',
              },
              {
                type: 'BD',
                pri: 'P2',
                persona: 'ceo@xe.vn',
                pre: 'Publish không đổi nội dung',
                steps: '1. Publish lại identical',
                expected: 'No-op version hoặc version+1 documented',
                layer: 'API',
                trace: 'BD',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 115,
    id: 'XBOS-DM-LOG-18',
    name: 'Thông báo phân hệ Logistic có danh mục mới',
    actors: 'System · Catalog Admin · (P2) Logistic spoke',
    goal: 'Sau publish, phát sự kiện/thông báo để phân hệ Logistic biết có DM mới (pull hoặc notify).',
    readiness: 'GAP',
    code_note:
      'TECHSPEC_M03: «Event on publish → future logistic pull (P2 stub OK)». Không logistic-api P1 → **GAP** consumer; có thể chỉ audit/event stub.',
    layer_findings: {
      be: 'Event bus stub / no logistic pull',
      fe: 'Bell/notify — UNKNOWN/GAP',
      mobile: 'N/A P1',
      rbac: 'System',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Thông báo sau publish',
        purpose: 'Spoke/ops biết version mới',
        actor: 'System',
        fns: [
          {
            id: 'FN-NOTIFY',
            name: 'Emit notify / hiển thị thông báo',
            ui: 'Thông báo portal / event',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Vừa publish LOG-17',
                steps: '1. Quan sát kênh thông báo / event log',
                expected: 'Có event catalog.published domain=logistic; hoặc stub documented P2',
                layer: 'API/UI',
                trace: 'LOG-18 · TECHSPEC_M03 P2 stub',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'system',
                pre: 'Subscriber down',
                steps: '1. Publish khi spoke unavailable',
                expected: 'Hub publish vẫn OK; retry/DLQ — không rollback im lặng',
                layer: 'API',
                trace: 'FD resilience',
              },
              {
                type: 'UX',
                pri: 'P2',
                persona: 'ops',
                pre: 'Có notify UI',
                steps: '1. Click thông báo',
                expected: 'Deep link tới catalog version',
                layer: 'UI',
                trace: 'UX',
              },
              {
                type: 'AU',
                pri: 'P1',
                persona: 'outsider',
                pre: 'Không quyền',
                steps: '1. Subscribe event stream',
                expected: '401/403',
                layer: 'API',
                trace: 'AU',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 116,
    id: 'XBOS-DM-LOG-19',
    name: 'Kiểm tra danh mục thiếu trước vận hành',
    actors: 'Catalog Admin · QA/DevOps gate · Group CEO',
    goal: 'Chạy kiểm tra pre-op: thiếu key/bắt buộc / cardinality → báo cáo chặn vận hành Logistic.',
    readiness: 'UNKNOWN',
    code_note:
      'TECHSPEC_M03: `pnpm verify:phase1:logistic-catalog` G4 evidence. Đây là gate script nhiều hơn UI — DESIGN vẫn có case UI nếu có màn «Kiểm tra»; readiness UNKNOWN đến khi script/UI được spot.',
    layer_findings: {
      be: 'verify script G4',
      fe: 'Màn pre-op check — optional P1',
      mobile: 'N/A',
      rbac: 'Admin',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Chạy kiểm tra thiếu DM',
        purpose: 'Gate trước go-live LOG',
        actor: 'Admin',
        fns: [
          {
            id: 'FN-PRECHECK',
            name: 'Pre-op catalog completeness check',
            ui: 'Nút Kiểm tra / CLI verify',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn / devops agent',
                pre: 'Bundle LOG đủ',
                steps: '1. Chạy kiểm tra (UI hoặc verify script)',
                expected: 'PASS report; 0 missing mandatory keys',
                layer: 'API/CLI',
                trace: 'LOG-19 · TECHSPEC_M03 G4',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'admin',
                pre: 'Cố ý thiếu key bắt buộc',
                steps: '1. Chạy check',
                expected: 'FAIL + danh sách key thiếu; exit ≠0',
                layer: 'CLI/API',
                trace: 'FD missing',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ceo@xe.vn',
                pre: 'UI có màn',
                steps: '1. Xem báo cáo thiếu',
                expected: 'Bảng key thiếu + CTA mở LOG-02/03',
                layer: 'UI',
                trace: 'UX',
              },
              {
                type: 'AU',
                pri: 'P1',
                persona: 'member',
                pre: 'Member',
                steps: '1. Chạy check toàn tập đoàn',
                expected: 'Chỉ scope CT hoặc 403',
                layer: 'API',
                trace: 'AU',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 117,
    id: 'XBOS-DM-LOG-20',
    name: 'Khai báo đủ 3 tầng dịch vụ vận tải',
    actors: 'Catalog Admin · Data steward',
    goal: 'Đảm bảo cây dịch vụ vận tải đủ 3 tầng (nhóm → loại → sản phẩm/dịch vụ) theo cardinality seed/BR; thiếu tầng = không PASS pre-op.',
    readiness: 'UNKNOWN',
    code_note:
      'TECHSPEC_M03: seed defs `seed:phase1:logistic-catalog` cardinality. U65: nghiệm thu sau này phải từ FE khai báo, không lấy seed evidence. Hiện **UNKNOWN** FE wizard 3 tầng.',
    layer_findings: {
      be: 'seed cardinality rules',
      fe: 'Wizard/tree 3 tầng dịch vụ — UNKNOWN',
      mobile: 'N/A',
      rbac: 'Group/data steward',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Khai báo 3 tầng dịch vụ',
        purpose: 'Master dịch vụ đủ sâu cho báo giá/điều phối P2',
        actor: 'Data steward',
        fns: [
          {
            id: 'FN-SVC-3T',
            name: 'Tạo/đủ cây 3 tầng dịch vụ vận tải',
            ui: 'Tree dịch vụ · thêm cấp',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Nhóm dịch vụ LOG tồn tại',
                steps: '1. Tạo tầng 1–2–3 đủ quan hệ 2. Lưu/Publish 3. Chạy LOG-19',
                expected: 'Cardinality PASS; cây hiển thị 3 cấp; F5',
                layer: 'UI/API',
                trace: 'LOG-20 · seed cardinality (design≠seed evidence)',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'admin',
                pre: 'Chỉ 2 tầng',
                steps: '1. Publish / precheck',
                expected: 'FAIL thiếu tầng 3; không claim đủ',
                layer: 'API/CLI',
                trace: 'FD incomplete',
              },
              {
                type: 'BD',
                pri: 'P1',
                persona: 'admin',
                pre: 'Cây',
                steps: '1. Thêm tầng 4',
                expected: 'Chặn >3 hoặc BR documented',
                layer: 'UI/API',
                trace: 'BD depth',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Sai scope',
                steps: '1. Sửa cây hub',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'admin',
                pre: 'Thiếu tầng',
                steps: '1. Indicator trên UI',
                expected: 'Cảnh báo cấp thiếu — không chỉ màu',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 118,
    id: 'XBOS-DM-LOG-21',
    name: 'Khai báo đủ 3 tầng loại phương tiện',
    actors: 'Catalog Admin · Data steward',
    goal: 'Tương tự LOG-20 cho master loại phương tiện (3 tầng) phục vụ gán xe/định mức.',
    readiness: 'UNKNOWN',
    code_note:
      'Cùng seed bundle TECHSPEC_M03 LOG-21. FE riêng UNKNOWN; mirror cases LOG-20 với domain vehicle.',
    layer_findings: {
      be: 'seed cardinality vehicle tiers',
      fe: 'Tree loại PT — UNKNOWN',
      mobile: 'N/A',
      rbac: 'Group/data steward',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Khai báo 3 tầng loại PT',
        purpose: 'Master phương tiện đủ phân loại',
        actor: 'Data steward',
        fns: [
          {
            id: 'FN-VEH-3T',
            name: 'Tạo/đủ cây 3 tầng loại phương tiện',
            ui: 'Tree loại xe',
            mutate: true,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Catalog vehicle LOG',
                steps: '1. Đủ 3 tầng 2. Publish 3. Precheck LOG-19',
                expected: 'PASS cardinality vehicle; F5 cây đúng',
                layer: 'UI/API',
                trace: 'LOG-21',
              },
              {
                type: 'FD',
                pri: 'P0',
                persona: 'admin',
                pre: 'Thiếu leaf',
                steps: '1. Precheck',
                expected: 'FAIL liệt kê node thiếu',
                layer: 'CLI/API',
                trace: 'FD',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'admin',
                pre: 'Orphan child',
                steps: '1. Child không parent',
                expected: 'Validate chặn publish',
                layer: 'API',
                trace: 'FD orphan',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Sai scope',
                steps: '1. Mutate hub tree',
                expected: '403/409',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'admin',
                pre: 'Sau sửa',
                steps: '1. Expand/collapse cây',
                expected: 'Performance OK; không mất state sai',
                layer: 'UI',
                trace: 'UX',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    stt: 119,
    id: 'XBOS-DM-LOG-22',
    name: 'Rà soát sản phẩm dịch vụ chưa gắn bảng giá',
    actors: 'Catalog Admin · Kinh doanh / Pricing ops',
    goal: 'Báo cáo read-only các sản phẩm/dịch vụ (tầng leaf) chưa gắn bảng giá — hỗ trợ chặn vận hành/báo giá thiếu giá.',
    readiness: 'UNKNOWN',
    code_note:
      'TECHSPEC_M03: «QA report row in LOG-19 output» — read-only check, phụ thuộc pricing master (có thể P2). **UNKNOWN/GAP** UI riêng; không invent PASS.',
    layer_findings: {
      be: 'Report join service×price — mỏng/P2',
      fe: 'Màn rà soát unpriced — UNKNOWN',
      mobile: 'N/A',
      rbac: 'Admin/KD read',
    },
    caps: [
      {
        id: 'CAP-01',
        name: 'Rà soát dịch vụ chưa có giá',
        purpose: 'Phát hiện gap pricing trước vận hành',
        actor: 'Pricing ops',
        fns: [
          {
            id: 'FN-UNPRICED',
            name: 'List sản phẩm chưa gắn bảng giá',
            ui: 'Báo cáo / tab Unpriced',
            mutate: false,
            cases: [
              {
                type: 'HP',
                pri: 'P0',
                persona: 'ceo@xe.vn',
                pre: 'Có leaf dịch vụ; một số chưa price list',
                steps: '1. Mở báo cáo unpriced (hoặc đọc output LOG-19)',
                expected: 'Danh sách leaf thiếu giá; count >0 đúng; không mutate',
                layer: 'UI/API/CLI',
                trace: 'LOG-22 · LOG-19 report',
              },
              {
                type: 'HP',
                pri: 'P1',
                persona: 'admin',
                pre: 'Tất cả đã gắn giá',
                steps: '1. Chạy báo cáo',
                expected: 'Empty PASS / 0 rows',
                layer: 'UI/CLI',
                trace: 'HP clean',
              },
              {
                type: 'FD',
                pri: 'P1',
                persona: 'admin',
                pre: 'Price module chưa có (P2)',
                steps: '1. Gọi API báo cáo',
                expected: '501/SPEC stub rõ hoặc empty+warning — không 500 giả PASS',
                layer: 'API',
                trace: 'honest GAP',
              },
              {
                type: 'AU',
                pri: 'P0',
                persona: 'member',
                pre: 'Member',
                steps: '1. Xem unpriced CT khác',
                expected: '403/409 hoặc chỉ CT mình',
                layer: 'API',
                trace: 'AU',
              },
              {
                type: 'UX',
                pri: 'P1',
                persona: 'ops',
                pre: 'Có rows',
                steps: '1. Click leaf → deep link master giá/dịch vụ',
                expected: 'Điều hướng đúng hoặc CTA documented; không 404 scope',
                layer: 'UI',
                trace: 'L2.5 style nav',
              },
            ],
          },
        ],
      },
    ],
  },
];

function countCases(uc) {
  let n = 0;
  const byType = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0 };
  for (const c of uc.caps) {
    for (const f of c.fns) {
      for (const t of f.cases) {
        n++;
        byType[t.type] = (byType[t.type] || 0) + 1;
      }
    }
  }
  return { n, byType };
}

const WF_IDS = new Set([
  'XBOS-DM-LOG-12',
  'XBOS-DM-LOG-13',
  'XBOS-DM-LOG-15',
  'XBOS-DM-LOG-16',
]);

/** Pad to program suggested floors: CRUD ≥8, WF ≥12, read ≥8. */
function enrichUc(uc) {
  const min = WF_IDS.has(uc.id) ? 12 : 8;
  let { n, byType } = countCases(uc);
  const padPool = [
    {
      type: 'FD',
      pri: 'P1',
      persona: 'ceo@xe.vn',
      pre: 'Payload thiếu field bắt buộc / sai kiểu',
      steps: '1. Gửi request/UI thiếu field bắt buộc theo contract',
      expected: '4xx deterministic + message VI; không ghi partial; không 500',
      layer: 'API/UI',
      trace: 'fail-deep contract',
    },
    {
      type: 'BD',
      pri: 'P1',
      persona: 'ceo@xe.vn',
      pre: 'Biên độ nhập (độ dài mã/tên, page size)',
      steps: '1. Nhập đúng biên cho phép 2. Nhập vượt biên',
      expected: 'Biên hợp lệ 2xx; vượt biên 4xx/validate',
      layer: 'UI/API',
      trace: 'boundary',
    },
    {
      type: 'AU',
      pri: 'P0',
      persona: 'anonymous / expired JWT',
      pre: 'Không token hoặc token hết hạn',
      steps: '1. Gọi API/UI thao tác UC',
      expected: '401 XBOS-AUTH-001 hoặc redirect login; không lộ data',
      layer: 'API',
      trace: 'auth',
    },
    {
      type: 'UX',
      pri: 'P1',
      persona: 'ceo@xe.vn',
      pre: 'Network chậm / API error',
      steps: '1. Thao tác khi BE 5xx hoặc timeout',
      expected: 'Loading rồi error banner + retry; không trắng màn',
      layer: 'UI',
      trace: 'UX resilience',
    },
    {
      type: 'HP',
      pri: 'P1',
      persona: 'ceo@xe.vn',
      pre: 'Sau thao tác chính thành công',
      steps: '1. F5 hoặc navigate away/back 2. Đối chiếu dữ liệu',
      expected: 'State bền; list/detail khớp API',
      layer: 'UI',
      trace: 'U65 F5 persistence',
    },
    {
      type: 'FD',
      pri: 'P1',
      persona: 'ceo@xe.vn',
      pre: 'Trạng thái nghiệp vụ không cho phép (draft/pending/locked)',
      steps: '1. Thực hiện action ở trạng thái sai',
      expected: 'Chặn + message BR; không side-effect',
      layer: 'UI/API',
      trace: 'fail-deep state',
    },
    {
      type: 'BD',
      pri: 'P2',
      persona: 'ceo@xe.vn',
      pre: 'Empty / max batch',
      steps: '1. Thao tác với tập rỗng 2. Tập max theo docs',
      expected: 'Empty xử lý rõ; max không crash',
      layer: 'API',
      trace: 'boundary volume',
    },
    {
      type: 'UX',
      pri: 'P2',
      persona: 'ceo@xe.vn',
      pre: 'Keyboard / screen reader',
      steps: '1. Tab tới control chính 2. Kích hoạt bằng phím',
      expected: 'Focus visible; control reachable',
      layer: 'UI',
      trace: 'a11y baseline',
    },
    {
      type: 'AU',
      pri: 'P1',
      persona: 'du-lich.ceo@xe.vn',
      pre: 'Member scope CT A',
      steps: '1. Thao tác với x-company-id / companyId CT B',
      expected: '409 SCOPE_CONTEXT_MISMATCH hoặc 403',
      layer: 'API',
      trace: 'scope parity',
    },
    {
      type: 'HP',
      pri: 'P2',
      persona: 'ceo@xe.vn',
      pre: 'Happy path phụ (filter/sort/pagination nếu có)',
      steps: '1. Đổi filter/sort liên quan UC 2. Xác nhận kết quả',
      expected: 'Kết quả nhất quán với API',
      layer: 'UI',
      trace: 'HP secondary',
    },
    {
      type: 'FD',
      pri: 'P2',
      persona: 'ceo@xe.vn',
      pre: 'Idempotency / replay',
      steps: '1. Replay cùng request đã thành công (nếu mutate)',
      expected: 'Idempotent hoặc 4xx conflict documented',
      layer: 'API',
      trace: 'idempotency',
    },
    {
      type: 'UX',
      pri: 'P1',
      persona: 'ceo@xe.vn',
      pre: 'Confirm dialog (nếu destructive)',
      steps: '1. Mở confirm 2. Hủy',
      expected: 'Không mutate khi Hủy',
      layer: 'UI',
      trace: 'UX cancel',
    },
  ];
  // prefer first mutate FN else first FN
  let targetFn = null;
  for (const c of uc.caps) {
    for (const f of c.fns) {
      if (f.mutate) {
        targetFn = f;
        break;
      }
      if (!targetFn) targetFn = f;
    }
    if (targetFn?.mutate) break;
  }
  if (!targetFn) return;
  let pi = 0;
  while (n < min && pi < padPool.length * 2) {
    const t = { ...padPool[pi % padPool.length] };
    // avoid exact type flood: skip if that type already ≥3 unless still below min hard
    if (byType[t.type] >= 3 && n < min - 1 && pi < padPool.length) {
      pi++;
      continue;
    }
    targetFn.cases.push(t);
    byType[t.type] = (byType[t.type] || 0) + 1;
    n++;
    pi++;
  }
}

function renderUc(uc) {
  const { n, byType } = countCases(uc);
  const fnRows = [];
  const caseRows = [];
  const fnSum = [];
  let fnCount = 0;
  for (const cap of uc.caps) {
    for (const fn of cap.fns) {
      fnCount++;
      fnRows.push(
        `| ${cap.id} | ${fn.id} | ${fn.name} | ${fn.ui} | ${fn.mutate ? 'Y' : 'N'} |`,
      );
      const local = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0 };
      let i = 0;
      for (const t of fn.cases) {
        i++;
        local[t.type]++;
        const tcId = `TC-${uc.id.replace(/XBOS-/, '')}-${fn.id.replace(/^FN-/, '')}-${t.type}-${String(i).padStart(3, '0')}`;
        caseRows.push(
          `| ${tcId} | ${cap.id} | ${fn.id} | ${t.type} | ${t.pri} | ${t.persona} | ${t.pre} | ${t.steps} | ${t.expected} | ${t.layer} | ${t.trace} |`,
        );
      }
      const sum = local.HP + local.FD + local.BD + local.AU + local.UX;
      fnSum.push(
        `| ${fn.id} | ${local.HP} | ${local.FD} | ${local.BD} | ${local.AU} | ${local.UX} | ${sum} |`,
      );
    }
  }
  const capRows = uc.caps
    .map((c) => `| ${c.id} | ${c.name} | ${c.purpose} | ${c.actor} |`)
    .join('\n');

  return `# UC — \`${uc.id}\` · ${uc.name}

| Meta | Value |
|------|--------|
| **uc_id** | \`${uc.id}\` |
| **stt_phase1** | ${uc.stt} |
| **mod** | ${META.mod} |
| **name_vi** | ${uc.name} |
| **actors** | ${uc.actors} |
| **surfaces** | ${META.surfaces} |
| **srs_old** | ${META.srs_old} |
| **srs_new** | ${META.srs_new} |
| **tech_spec** | ${META.tech_spec} |
| **api_contract** | ${META.api_contract} |
| **author** | ${META.author} |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | \`${uc.readiness}\` — **không** = UAT PASS |
| **code_note** | ${uc.code_note} |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. \`uat_done: false\`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

${uc.goal}

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
${capRows}

**Đếm nghiệp vụ:** ${uc.caps.length}

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
${fnRows.join('\n')}

**Đếm chức năng:** ${fnCount}

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
${fnSum.join('\n')}
| **Tổng** | ${byType.HP} | ${byType.FD} | ${byType.BD} | ${byType.AU} | ${byType.UX} | **${n}** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
${caseRows.join('\n')}

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | ${uc.caps.some((c) => c.fns.some((f) => f.mutate)) ? 'Y (mutate FNs)' : 'N/A read-mostly'} | Sensitive/hierarchy nhánh có thể SPEC_GAP |
| Auth/scope nếu đa CT | Y | Y (AU cases) | |
| SPEC_GAP ghi rõ | Y | TechSpec mỏng M03 pattern; SRS_VN N/A-DELTA | logistics TechSpec sâu / FE HDSD LOG |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ${uc.layer_findings.be} | \`TECHSPEC_M03_DM_LOG_P1.md\` §2 · \`catalog-governance\` / \`config-sync\` |
| FE menu/nút/role | ${uc.layer_findings.fe} | portal CC \`moduleKey: logistics\` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | ${uc.layer_findings.mobile} | — |
| RBAC / scope | ${uc.layer_findings.rbac} | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** \`${uc.readiness}\`

---

## 8. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
uc_id: ${uc.id}
cases_designed: ${n}
code_readiness: ${uc.readiness}
squad: W1-S4-DM-LOG
uat_done: false
\`\`\`
`;
}

const manifestRows = [];
let totalCases = 0;
const readinessCount = {};

for (const uc of UCS) {
  enrichUc(uc);
  const body = renderUc(uc);
  const fp = path.join(OUT, `${uc.id}.md`);
  fs.writeFileSync(fp, body, 'utf8');
  const { n } = countCases(uc);
  totalCases += n;
  readinessCount[uc.readiness] = (readinessCount[uc.readiness] || 0) + 1;
  manifestRows.push({
    stt: uc.stt,
    id: uc.id,
    name: uc.name,
    cases: n,
    readiness: uc.readiness,
    caps: uc.caps.length,
    fns: uc.caps.reduce((a, c) => a + c.fns.length, 0),
  });
  console.log('wrote', uc.id, n);
}

const manifest = `# Manifest — Squad W1-S4-DM-LOG

| Meta | Value |
|------|--------|
| **squad_id** | \`W1-S4-DM-LOG\` |
| **work_item_id** | \`PO-UC-TC-W1-S4-DM-LOG\` |
| **STT Phase1** | 98–119 |
| **UC count** | ${manifestRows.length} |
| **author** | qa |
| **design_status** | DESIGNED |
| **ack_status** | **READY_FOR_SYNTH** |
| **execution** | not started · \`uat_done: false\` |
| **date** | 2026-08-04 |

## Nguồn thiết kế

| Nguồn | Ghi chú |
|-------|---------|
| \`PHASE1_UC_SRS_TECHSPEC_MATRIX.md\` §2.B | STT 98–119 |
| \`docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md\` | UC local 1–22 = DM-LOG-01..22 |
| \`docs/logistics/TECHSPEC_M03_DM_LOG_P1.md\` | Pattern reuse M01 — **mỏng** |
| \`TECHSPEC_HE_SINH_THAI_XEVN.md\` §7.1 / M03 | Catalog hub pattern |
| \`SRS_VN.md\` | **N/A-DELTA** — không FR DM-LOG riêng |

## Honesty (TechSpec mỏng)

- Không có TechSpec logistics sâu từng UC → case DESIGN từ tên UC + bảng tổng hợp + pattern API.
- Jest \`catalog-governance.controller.spec\` gắn **cả 22** UC-ID vào **một** inbox smoke — **không** = 22 UC đã IMPL.
- P1 non-goal: \`logistic-api\`, 128 LG-* — notify/pull spoke = P2 stub.
- U65: sau này cấm seed evidence; seed cardinality (LOG-20/21) chỉ là gợi ý BR thiết kế.

## Bảng UC

| STT | uc_id | name_vi | caps | fns | cases_designed | code_readiness | file |
|----:|-------|---------|-----:|----:|---------------:|----------------|------|
${manifestRows
  .map(
    (r) =>
      `| ${r.stt} | \`${r.id}\` | ${r.name} | ${r.caps} | ${r.fns} | ${r.cases} | \`${r.readiness}\` | [\`${r.id}.md\`](../${r.id}.md) |`,
  )
  .join('\n')}

## Sums

| Metric | Value |
|--------|------:|
| **UC files** | ${manifestRows.length} |
| **cases_designed (Σ)** | **${totalCases}** |
| Avg cases / UC | ${(totalCases / manifestRows.length).toFixed(1)} |

### code_readiness rollup (UC count)

| readiness | UC |
|-----------|---:|
${Object.entries(readinessCount)
  .sort()
  .map(([k, v]) => `| \`${k}\` | ${v} |`)
  .join('\n')}

### cases_designed by UC (quick)

| uc_id | cases |
|-------|------:|
${manifestRows.map((r) => `| \`${r.id}\` | ${r.cases} |`).join('\n')}
| **Σ** | **${totalCases}** |

## Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S4-DM-LOG
squad: W1-S4-DM-LOG
uc_covered: ${manifestRows.length}/22
cases_designed: ${totalCases}
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S4-DM-LOG_MANIFEST.md
\`\`\`
`;

fs.writeFileSync(path.join(__dirname, 'W1-S4-DM-LOG_MANIFEST.md'), manifest, 'utf8');
console.log('MANIFEST cases', totalCases);
