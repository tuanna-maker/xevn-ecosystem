/**
 * One-shot generator: W1-S3-XBOS-CAT-TAIL UC TC files + manifest.
 * Run: node docs/qa/professional/by-uc/_squad/_gen_w1_s3.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const author = 'qa · PO-UC-TC-W1-S3-XBOS-CAT';
const uatNote =
  '> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.';

const P = {
  ceo: 'ceo@xe.vn (Group CEO / main→holding)',
  member: 'du-lich.ceo@xe.vn (CEO thành viên)',
  gov: 'Người duyệt catalog gov (Group)',
};

function tcRows(rows) {
  return rows
    .map(
      (r) =>
        `| ${r.id} | ${r.cap} | ${r.fn} | ${r.type} | ${r.pri} | ${r.persona} | ${r.pre} | ${r.steps} | ${r.exp} | ${r.layer} | ${r.trace} |`,
    )
    .join('\n');
}

function sumTable(fnRows) {
  const totals = { hp: 0, fd: 0, bd: 0, au: 0, ux: 0, sum: 0 };
  const lines = fnRows.map(([fn, hp, fd, bd, au, ux]) => {
    const s = hp + fd + bd + au + ux;
    totals.hp += hp;
    totals.fd += fd;
    totals.bd += bd;
    totals.au += au;
    totals.ux += ux;
    totals.sum += s;
    return `| ${fn} | ${hp} | ${fd} | ${bd} | ${au} | ${ux} | ${s} |`;
  });
  lines.push(
    `| **Tổng** | ${totals.hp} | ${totals.fd} | ${totals.bd} | ${totals.au} | ${totals.ux} | **${totals.sum}** |`,
  );
  return { table: lines.join('\n'), total: totals.sum };
}

function caseRow(id, cap, fn, type, pri, persona, pre, steps, exp, layer, trace) {
  return { id, cap, fn, type, pri, persona, pre, steps, exp, layer, trace };
}

function render(uc) {
  const { table: countTable, total } = sumTable(uc.fnCounts);
  const caseTotal = uc.cases.length;
  // Prefer actual case rows as SoT count; fnCounts must match design intent
  const designed = caseTotal;
  const body = `# UC — \`${uc.id}\` · ${uc.name_vi}

| Meta | Value |
|------|--------|
| **uc_id** | \`${uc.id}\` |
| **stt_phase1** | ${uc.stt} |
| **mod** | ${uc.mod} |
| **name_vi** | ${uc.name_vi} |
| **actors** | ${uc.actors} |
| **surfaces** | ${uc.surfaces} |
| **srs_old** | ${uc.srs_old} |
| **srs_new** | ${uc.srs_new} |
| **tech_spec** | ${uc.tech_spec} |
| **api_contract** | ${uc.api} |
| **author** | ${author} |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | ${uc.code_readiness} |
| **code_note** | ${uc.code_note} |

${uatNote}

---

## 1. Mục tiêu UC (1 đoạn)

${uc.goal}

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
${uc.caps.map((c) => `| ${c.id} | ${c.name} | ${c.purpose} | ${c.actor} |`).join('\n')}

**Đếm nghiệp vụ:** ${uc.caps.length}

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
${uc.fns.map((f) => `| ${f.cap} | ${f.id} | ${f.name} | ${f.ui} | ${f.mutate} |`).join('\n')}

**Đếm chức năng:** ${uc.fns.length}

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
${countTable}

> **cases_designed (SoT §5 rows):** **${designed}** (fn Σ thiết kế = ${total}; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
${tcRows(uc.cases)}

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | ${uc.mutate_ok ?? 'Y'} | ${uc.mutate_gap ?? ''} |
| Auth/scope nếu đa CT | Y | Y | |
| SPEC_GAP ghi rõ | Y | ${uc.spec_gap ?? '—'} | |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ${uc.be} | ${uc.be_ev} |
| FE menu/nút/role | ${uc.fe} | ${uc.fe_ev} |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | ${uc.rbac} | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** ${uc.code_readiness}

---

## 8. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
uc_id: ${uc.id}
cases_designed: ${designed}
code_readiness: ${uc.code_readiness}
uat_done: false
\`\`\`
`;
  return { designed, body };
}

function dmBase(stt, id, name, goalExtra, mutateFns, readiness, codeNote, be, fe, api, cases) {
  const caps = [
    {
      id: 'CAP-01',
      name: 'Chuẩn bị ngữ cảnh danh mục',
      purpose: 'Mở đúng phân hệ / nhóm trước thao tác',
      actor: 'Quản trị danh mục XBOS',
    },
    {
      id: 'CAP-02',
      name: name,
      purpose: goalExtra,
      actor: 'Quản trị danh mục XBOS · (gov nếu nhạy cảm)',
    },
    {
      id: 'CAP-03',
      name: 'Xác nhận sau thao tác',
      purpose: 'FE sau 2xx + F5 / consumer thấy đúng',
      actor: 'Quản trị · phân hệ đích',
    },
  ];
  const fns = [
    {
      cap: 'CAP-01',
      id: 'FN-OPEN',
      name: 'Mở màn quản trị danh mục / settings liên quan',
      ui: 'CC settings / catalog admin',
      mutate: 'N',
    },
    ...mutateFns,
    {
      cap: 'CAP-03',
      id: 'FN-VERIFY',
      name: 'Xác nhận list/detail sau mutate hoặc export',
      ui: 'FE list + F5 / file',
      mutate: 'N',
    },
  ];
  const fnCounts = [
    ['FN-OPEN', 1, 0, 0, 1, 1],
    ...mutateFns.map((f) =>
      f.mutate === 'Y'
        ? [f.id, 1, 1, f.bd || 0, 1, f.ux || 0]
        : [f.id, 1, f.fd || 0, 0, 1, 1],
    ),
    ['FN-VERIFY', 1, 0, 0, 0, 1],
  ];
  return {
    stt,
    id,
    name_vi: name,
    mod: 'M01',
    actors: 'Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request)',
    surfaces: 'xbos-cc / web-portal / api',
    srs_old: `\`BANG_TONG_HOP_USECASE_XEVN.md\` STT ${stt} · \`docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md\` · PHASE1 matrix row ${stt}`,
    srs_new:
      '`docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18',
    tech_spec:
      '`docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog',
    api,
    code_readiness: readiness,
    code_note: codeNote,
    goal: `Người quản trị danh mục thực hiện «${name}» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). ${goalExtra}`,
    caps,
    fns,
    fnCounts,
    cases,
    be,
    be_ev: 'apps/api/xbos-api · catalog-governance / business-master / config-sync',
    fe,
    fe_ev: 'apps/web CommandCenter · CatalogGovernancePanel · settings catalogs',
    rbac: 'JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope',
    mutate_ok: 'Y',
  };
}

const ucs = [];

ucs.push(
  dmBase(
    81,
    'XBOS-DM-05',
    'Ngừng hoặc kích hoạt giá trị',
    'Đổi trạng thái active/inactive của giá trị danh mục không hard-delete.',
    [
      {
        cap: 'CAP-02',
        id: 'FN-TOGGLE-INACTIVE',
        name: 'Ngừng hiệu lực giá trị',
        ui: 'Toggle Hiệu lực · PUT/PATCH item',
        mutate: 'Y',
        ux: 1,
      },
      {
        cap: 'CAP-02',
        id: 'FN-TOGGLE-ACTIVE',
        name: 'Kích hoạt lại giá trị',
        ui: 'Toggle · PUT/PATCH item',
        mutate: 'Y',
      },
    ],
    'LIKELY_PARTIAL',
    'CC catalogs có checkbox active (UF-XBOS-14); generic DM admin shell có thể partial.',
    'PUT items active flag · soft-disable; cấm hard-delete platform rows',
    'CC document/measure/pricing cột Hiệu lực; HRM settings-catalogs tùy domain',
    'GET/PUT `/api/xbos/business-master/.../items*` · `XBOS-MASTER-200/201`',
    [
      caseRow('TC-DM05-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Đã login CC', '1. Mở settings catalog 2. Quan sát cột hiệu lực', 'List 2xx; thấy active', 'UI', 'PHASE1 #81 · UF-XBOS-14'),
      caseRow('TC-DM05-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Login member CEO', '1. Mở holding catalog', '403/blocked hoặc chỉ scope CT', 'UI/API', 'ADR holding'),
      caseRow('TC-DM05-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Catalog empty', '1. Mở tab trống', 'Empty + CTA — không 500', 'UI', 'U65'),
      caseRow('TC-DM05-INACT-HP-001', 'CAP-02', 'FN-TOGGLE-INACTIVE', 'HP', 'P0', P.ceo, '≥1 dòng active tạo từ FE', '1. Bỏ Hiệu lực 2. Autosave/Lưu', '2xx; F5 inactive', 'UI/API', 'XBOS-MASTER-201'),
      caseRow('TC-DM05-INACT-FD-001', 'CAP-02', 'FN-TOGGLE-INACTIVE', 'FD', 'P0', P.ceo, 'Giá trị in-use (BR)', '1. Inactive khi BR chặn', '4xx; F5 không đổi', 'UI/API', 'BR in-use'),
      caseRow('TC-DM05-INACT-AU-001', 'CAP-02', 'FN-TOGGLE-INACTIVE', 'AU', 'P0', P.member, 'Ngoài scope', '1. PATCH active=false holding', '403/409', 'API', 'scope_parity'),
      caseRow('TC-DM05-INACT-UX-001', 'CAP-02', 'FN-TOGGLE-INACTIVE', 'UX', 'P1', P.ceo, 'Sau inactive', '1. Filter ngừng', 'UI đúng trạng thái', 'UI', 'UX'),
      caseRow('TC-DM05-ACT-HP-001', 'CAP-02', 'FN-TOGGLE-ACTIVE', 'HP', 'P0', P.ceo, 'Dòng inactive FE', '1. Bật lại', '2xx; F5 active', 'UI/API', 'XBOS-MASTER-201'),
      caseRow('TC-DM05-ACT-FD-001', 'CAP-02', 'FN-TOGGLE-ACTIVE', 'FD', 'P0', P.ceo, 'Conflict mã', '1. Activate khi validate fail', '4xx', 'UI/API', 'validate'),
      caseRow('TC-DM05-ACT-AU-001', 'CAP-02', 'FN-TOGGLE-ACTIVE', 'AU', 'P0', P.member, 'Sai companyId', '1. Activate API', '403/409', 'API', 'AU'),
      caseRow('TC-DM05-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Đã toggle', '1. F5', 'Đúng trạng thái', 'UI', 'AC'),
      caseRow('TC-DM05-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'API chậm', '1. Quan sát', 'Loading; không ghost submit', 'UI', 'UX'),
    ],
  ),
);

ucs.push(
  dmBase(
    82,
    'XBOS-DM-06',
    'Sắp xếp phân cấp cha–con',
    'Gán/đổi parent và thứ tự hiển thị cây danh mục.',
    [
      { cap: 'CAP-02', id: 'FN-SET-PARENT', name: 'Gán giá trị cha', ui: 'Picker parent', mutate: 'Y', bd: 1 },
      { cap: 'CAP-02', id: 'FN-REORDER', name: 'Đổi thứ tự anh–em', ui: 'sort_order / drag', mutate: 'Y', ux: 1 },
    ],
    'LIKELY_PARTIAL',
    'Hierarchy domain-dependent; CC flat catalogs có thể không có cha–con.',
    'PATCH parent_id / sort_order khi API hỗ trợ',
    'Tree UI nếu có — không bịa drag trên màn flat',
    'Pattern catalog items parentId · OpenAPI xbos-api M01',
    [
      caseRow('TC-DM06-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login', '1. Mở danh mục hierarchy', 'Thấy cây/cột cha', 'UI', '#82'),
      caseRow('TC-DM06-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Mở', 'Scope hạn chế', 'UI/API', 'ADR'),
      caseRow('TC-DM06-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Empty', '1. Mở', 'Empty OK', 'UI', 'U65'),
      caseRow('TC-DM06-PAR-HP-001', 'CAP-02', 'FN-SET-PARENT', 'HP', 'P0', P.ceo, '≥2 giá trị FE', '1. Gán con dưới cha 2. Lưu', '2xx; F5 đúng parent', 'UI/API', 'DM-06'),
      caseRow('TC-DM06-PAR-FD-001', 'CAP-02', 'FN-SET-PARENT', 'FD', 'P0', P.ceo, 'Có node', '1. Gán parent=self / cycle', '4xx; cây không vỡ', 'UI/API', 'BR hierarchy'),
      caseRow('TC-DM06-PAR-BD-001', 'CAP-02', 'FN-SET-PARENT', 'BD', 'P1', P.ceo, 'Root', '1. Clear parent', '2xx root', 'UI/API', 'BD'),
      caseRow('TC-DM06-PAR-AU-001', 'CAP-02', 'FN-SET-PARENT', 'AU', 'P0', P.member, 'Sai CT', '1. Đổi parent ngoài scope', '403/409', 'API', 'AU'),
      caseRow('TC-DM06-ORD-HP-001', 'CAP-02', 'FN-REORDER', 'HP', 'P0', P.ceo, '≥2 siblings', '1. Đổi sort 2. Lưu', 'F5 thứ tự mới', 'UI/API', 'sort_order'),
      caseRow('TC-DM06-ORD-FD-001', 'CAP-02', 'FN-REORDER', 'FD', 'P0', P.ceo, 'Version khóa', '1. Reorder', '4xx hoặc disabled', 'UI/API', 'version lock'),
      caseRow('TC-DM06-ORD-AU-001', 'CAP-02', 'FN-REORDER', 'AU', 'P0', P.member, 'Member', '1. Reorder master', '403/409', 'API', 'AU'),
      caseRow('TC-DM06-ORD-UX-001', 'CAP-02', 'FN-REORDER', 'UX', 'P2', P.ceo, 'Dragging', '1. Preview', 'UI ổn định', 'UI', 'UX'),
      caseRow('TC-DM06-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Đã sắp', '1. F5', 'Cây ổn định', 'UI', 'AC'),
    ],
  ),
);

ucs.push(
  dmBase(
    83,
    'XBOS-DM-07',
    'Gán danh mục cho phân hệ đích',
    'Chọn phân hệ (HRM/XBOS/LOG…) được phép tiêu thụ bộ danh mục.',
    [{ cap: 'CAP-02', id: 'FN-ASSIGN-MOD', name: 'Gán/bỏ gán module đích', ui: 'Multi-select module', mutate: 'Y', ux: 1 }],
    'LIKELY_PARTIAL',
    'assignedTo/domain trên publish & business-master; UI có thể gói trong publish.',
    'publish/assign domain · assignedTo',
    'Settings / publish dialog module chips',
    '`POST …/catalog-governance/publish` · `XBOS-CFG-203`',
    [
      caseRow('TC-DM07-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login', '1. Mở gán phân hệ', 'UI module targets', 'UI', '#83'),
      caseRow('TC-DM07-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Mở', '403 hoặc chỉ CT', 'UI', 'AU'),
      caseRow('TC-DM07-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Chưa gán', '1. Mở', 'Empty assignment rõ', 'UI', 'UX'),
      caseRow('TC-DM07-ASN-HP-001', 'CAP-02', 'FN-ASSIGN-MOD', 'HP', 'P0', P.ceo, 'Catalog draft FE', '1. Gán HRM 2. Lưu', '2xx; F5 còn gán', 'UI/API', 'XBOS-CFG-203'),
      caseRow('TC-DM07-ASN-FD-001', 'CAP-02', 'FN-ASSIGN-MOD', 'FD', 'P0', P.ceo, 'Module lạ', '1. Gán code invalid', '4xx', 'API', 'FD'),
      caseRow('TC-DM07-ASN-AU-001', 'CAP-02', 'FN-ASSIGN-MOD', 'AU', 'P0', P.member, 'Member', '1. Gán master', '403/409', 'API', 'AU'),
      caseRow('TC-DM07-ASN-UX-001', 'CAP-02', 'FN-ASSIGN-MOD', 'UX', 'P1', P.ceo, 'Sau gán', '1. Chip module', 'Chip đúng', 'UI', 'UX'),
      caseRow('TC-DM07-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Đã gán', '1. Consumer module', 'Thấy catalog được phép', 'UI/API', 'pull'),
      caseRow('TC-DM07-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Clear all', '1. Bỏ hết module', 'Cảnh báo/empty', 'UI', 'UX'),
      caseRow('TC-DM07-ASN-FD-002', 'CAP-02', 'FN-ASSIGN-MOD', 'FD', 'P1', P.ceo, 'Published locked', '1. Đổi assign khi khóa', '4xx hoặc confirm flow', 'UI/API', 'BR'),
      caseRow('TC-DM07-OPEN-HP-002', 'CAP-01', 'FN-OPEN', 'HP', 'P1', P.ceo, 'Multi-domain', '1. Đổi domain catalog', 'Assign context đúng domain', 'UI', 'HP'),
    ],
  ),
);

ucs.push(
  dmBase(
    84,
    'XBOS-DM-08',
    'Gán danh mục theo công ty',
    'Phạm vi áp dụng danh mục theo pháp nhân (holding / member slug).',
    [{ cap: 'CAP-02', id: 'FN-ASSIGN-CO', name: 'Gán/bỏ gán công ty', ui: 'Company chips', mutate: 'Y', ux: 1 }],
    'LIKELY_IMPL',
    'Group HR / extension chọn công ty áp dụng; business-master partition by company.',
    'companyId scope · extension apply companies',
    'company_group_hr · extension dialog chips',
    'HRM settings-catalogs · XBOS business-master · `HRM-SET-*` / `XBOS-MASTER-*`',
    [
      caseRow('TC-DM08-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login main', '1. Mở gán theo CT', 'Danh sách pháp nhân', 'UI', '#84 · UF-15'),
      caseRow('TC-DM08-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Mở', 'Không gán hộ holding vượt quyền', 'UI/API', 'AU'),
      caseRow('TC-DM08-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Chưa chọn', '1. Mở', 'Hint chọn CT', 'UI', 'UX'),
      caseRow('TC-DM08-ACO-HP-001', 'CAP-02', 'FN-ASSIGN-CO', 'HP', 'P0', P.ceo, 'Catalog FE', '1. Chọn CO-DL 2. Lưu', '2xx; F5 đúng tập CT', 'UI/API', 'J-XBOS-02'),
      caseRow('TC-DM08-ACO-FD-001', 'CAP-02', 'FN-ASSIGN-CO', 'FD', 'P0', P.ceo, 'UUID giả', '1. Gán companyId không tồn tại', '4xx', 'API', 'FD'),
      caseRow('TC-DM08-ACO-AU-001', 'CAP-02', 'FN-ASSIGN-CO', 'AU', 'P0', P.member, 'Member CEO', '1. Gán CT khác', '403/409', 'API', 'scope'),
      caseRow('TC-DM08-ACO-UX-001', 'CAP-02', 'FN-ASSIGN-CO', 'UX', 'P1', P.ceo, 'Exclude chip', '1. Bỏ Visun nếu UI có', 'Chip cập nhật', 'UI', 'Primary CAT-DL neo'),
      caseRow('TC-DM08-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Đã gán', '1. Đổi OU CT được/không gán', 'Thấy/không thấy đúng BR', 'UI', 'scope parity'),
      caseRow('TC-DM08-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Loading companies', '1. Mở picker', 'Loading rồi list', 'UI', 'UX'),
      caseRow('TC-DM08-ACO-HP-002', 'CAP-02', 'FN-ASSIGN-CO', 'HP', 'P1', P.ceo, 'Multi CT', '1. Gán ≥2 CT', 'F5 đủ tập', 'UI/API', 'HP'),
      caseRow('TC-DM08-ACO-FD-002', 'CAP-02', 'FN-ASSIGN-CO', 'FD', 'P1', P.ceo, 'Empty set khi BR bắt buộc', '1. Clear hết CT', '4xx hoặc warning', 'UI/API', 'FD'),
      caseRow('TC-DM08-OPEN-AU-002', 'CAP-01', 'FN-OPEN', 'AU', 'P0', 'anonymous', 'No token', '1. GET companies', '401', 'API', 'AU'),
    ],
  ),
);

ucs.push(
  dmBase(
    85,
    'XBOS-DM-09',
    'Sao chép bộ danh mục',
    'Nhân bản bộ giá trị sang nhóm/CT/domain đích.',
    [{ cap: 'CAP-02', id: 'FN-COPY', name: 'Sao chép bộ danh mục', ui: 'Action Sao chép · POST clone', mutate: 'Y', bd: 1, ux: 1 }],
    'GAP',
    'Chưa xác nhận endpoint clone chuyên biệt — SPEC_GAP có thể; không invent PASS.',
    'Clone API nếu có — else SPEC_GAP',
    'Nút Sao chép nếu HDSD có',
    'TBD clone · fallback import/export',
    [
      caseRow('TC-DM09-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login', '1. Mở nguồn', 'Thấy Sao chép hoặc ghi GAP UI', 'UI', '#85'),
      caseRow('TC-DM09-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Copy master', '403/ẩn nút', 'UI/API', 'AU'),
      caseRow('TC-DM09-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Empty source', '1. Copy rỗng', 'Chặn', 'UI', 'UX'),
      caseRow('TC-DM09-CPY-HP-001', 'CAP-02', 'FN-COPY', 'HP', 'P0', P.ceo, 'Source có rows FE', '1. Copy sang đích', '2xx; F5 bản sao — BLOCKED nếu GAP API', 'UI/API', 'DM-09'),
      caseRow('TC-DM09-CPY-FD-001', 'CAP-02', 'FN-COPY', 'FD', 'P0', P.ceo, 'Dest trùng mã', '1. Copy đè', '4xx/conflict', 'API', 'FD'),
      caseRow('TC-DM09-CPY-BD-001', 'CAP-02', 'FN-COPY', 'BD', 'P1', P.ceo, '1 row', '1. Copy', 'OK biên nhỏ', 'API', 'BD'),
      caseRow('TC-DM09-CPY-AU-001', 'CAP-02', 'FN-COPY', 'AU', 'P0', P.member, 'Sai CT đích', '1. Copy', '403/409', 'API', 'AU'),
      caseRow('TC-DM09-CPY-UX-001', 'CAP-02', 'FN-COPY', 'UX', 'P1', P.ceo, 'Progress', '1. Copy bộ lớn', 'Progress; chống double-click', 'UI', 'UX'),
      caseRow('TC-DM09-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Đã copy', '1. Sửa source', 'Dest độc lập', 'UI', 'AC'),
      caseRow('TC-DM09-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'GAP API', '1. Quan sát', 'Ghi SPEC_GAP — không PASS giả', '—', 'SPEC_GAP'),
    ],
  ),
);
ucs[ucs.length - 1].spec_gap = 'Có thể thiếu clone API — code_readiness GAP';
ucs[ucs.length - 1].mutate_gap = 'Execute: BLOCKED nếu thiếu UI/API';

ucs.push(
  dmBase(
    86,
    'XBOS-DM-10',
    'Xuất danh mục',
    'Export file (CSV/XLSX/JSON) bộ danh mục đang chọn.',
    [{ cap: 'CAP-02', id: 'FN-EXPORT', name: 'Xuất file danh mục', ui: 'Nút Xuất · GET export', mutate: 'N', fd: 1 }],
    'LIKELY_PARTIAL',
    'Matrix: Có endpoint; map controller khi execute.',
    'GET export stream',
    'Nút Xuất trên màn catalog',
    'Export endpoint (matrix Có) · auth required',
    [
      caseRow('TC-DM10-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login', '1. Mở catalog', 'Thấy Xuất', 'UI', '#86'),
      caseRow('TC-DM10-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Export holding full', '403 hoặc scope CT', 'API', 'AU'),
      caseRow('TC-DM10-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Empty', '1. Export rỗng', 'Header-only hoặc chặn + message', 'UI', 'UX'),
      caseRow('TC-DM10-EXP-HP-001', 'CAP-02', 'FN-EXPORT', 'HP', 'P0', P.ceo, 'Có data FE', '1. Bấm Xuất', '200 file khớp list', 'UI/API', 'export'),
      caseRow('TC-DM10-EXP-FD-001', 'CAP-02', 'FN-EXPORT', 'FD', 'P0', P.ceo, 'format sai', '1. format=exe', '4xx', 'API', 'FD'),
      caseRow('TC-DM10-EXP-AU-001', 'CAP-02', 'FN-EXPORT', 'AU', 'P0', 'anonymous', 'Không token', '1. GET export', '401 XBOS-AUTH-001', 'API', 'AU'),
      caseRow('TC-DM10-EXP-UX-001', 'CAP-02', 'FN-EXPORT', 'UX', 'P1', P.ceo, 'Downloading', '1. Xuất', 'Busy state', 'UI', 'UX'),
      caseRow('TC-DM10-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'File tải', '1. Mở file', 'UTF-8; đủ cột', '—', 'AC'),
      caseRow('TC-DM10-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Lỗi mạng', '1. Fail download', 'Toast lỗi', 'UI', 'UX'),
      caseRow('TC-DM10-EXP-HP-002', 'CAP-02', 'FN-EXPORT', 'HP', 'P1', P.ceo, 'Filter active', '1. Export filtered', 'File chỉ subset', 'UI/API', 'HP'),
    ],
  ),
);

ucs.push(
  dmBase(
    87,
    'XBOS-DM-11',
    'Nhập danh mục từ file',
    'Import file tạo/cập nhật giá trị với validate hàng.',
    [
      { cap: 'CAP-02', id: 'FN-IMPORT', name: 'Upload & nhập file', ui: 'Upload · POST import', mutate: 'Y', bd: 1, ux: 1 },
      { cap: 'CAP-02', id: 'FN-IMPORT-PREVIEW', name: 'Xem trước / báo lỗi dòng', ui: 'Preview grid', mutate: 'N' },
    ],
    'LIKELY_PARTIAL',
    'Matrix endpoint Có; FE wizard xác nhận khi execute.',
    'POST import multipart',
    'Nhập từ file dialog',
    'Import endpoint · row validation errors',
    [
      caseRow('TC-DM11-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login', '1. Mở Nhập', 'Dialog upload', 'UI', '#87'),
      caseRow('TC-DM11-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Import master', '403/ẩn', 'UI/API', 'AU'),
      caseRow('TC-DM11-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, '—', '1. Mở', 'Hướng dẫn mẫu file', 'UI', 'UX'),
      caseRow('TC-DM11-IMP-HP-001', 'CAP-02', 'FN-IMPORT', 'HP', 'P0', P.ceo, 'File hợp lệ tự tạo', '1. Upload 2. Xác nhận', '2xx; F5 rows', 'UI/API', 'U65 file tự tạo'),
      caseRow('TC-DM11-IMP-FD-001', 'CAP-02', 'FN-IMPORT', 'FD', 'P0', P.ceo, 'Thiếu cột bắt buộc', '1. Upload', '4xx/preview errors; không nửa vời', 'UI/API', 'FD'),
      caseRow('TC-DM11-IMP-BD-001', 'CAP-02', 'FN-IMPORT', 'BD', 'P1', P.ceo, '0 data rows', '1. Chỉ header', 'Chặn hoặc no-op rõ', 'UI/API', 'BD'),
      caseRow('TC-DM11-IMP-AU-001', 'CAP-02', 'FN-IMPORT', 'AU', 'P0', P.member, 'Sai CT', '1. Import holding', '403/409', 'API', 'AU'),
      caseRow('TC-DM11-IMP-UX-001', 'CAP-02', 'FN-IMPORT', 'UX', 'P1', P.ceo, 'Large file', '1. Upload', 'Progress; cancel an toàn', 'UI', 'UX'),
      caseRow('TC-DM11-PRV-HP-001', 'CAP-02', 'FN-IMPORT-PREVIEW', 'HP', 'P0', P.ceo, 'File mixed', '1. Preview', 'Highlight dòng lỗi', 'UI', 'preview'),
      caseRow('TC-DM11-PRV-UX-001', 'CAP-02', 'FN-IMPORT-PREVIEW', 'UX', 'P2', P.ceo, 'Binary', '1. Upload', 'Message parse fail', 'UI', 'UX'),
      caseRow('TC-DM11-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Import OK', '1. F5', 'Đủ rows mới', 'UI', 'AC'),
      caseRow('TC-DM11-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Partial BR', '1. Quan sát', 'All-or-nothing theo spec', 'UI', 'BR'),
      caseRow('TC-DM11-IMP-FD-002', 'CAP-02', 'FN-IMPORT', 'FD', 'P0', P.ceo, 'Duplicate codes', '1. Import trùng', '4xx/merge BR rõ', 'API', 'FD'),
      caseRow('TC-DM11-OPEN-AU-002', 'CAP-01', 'FN-OPEN', 'AU', 'P0', 'anonymous', '—', '1. POST import', '401', 'API', 'AU'),
    ],
  ),
);

ucs.push(
  dmBase(
    88,
    'XBOS-DM-12',
    'Gửi phê duyệt thay đổi nhạy cảm',
    'Đưa thay đổi danh mục vào hàng chờ duyệt tập đoàn/WF.',
    [{ cap: 'CAP-02', id: 'FN-SUBMIT', name: 'Gửi yêu cầu phê duyệt', ui: 'Gửi duyệt · POST workflows/start', mutate: 'Y', ux: 1 }],
    'LIKELY_IMPL',
    'Mapped catalog-governance workflows/start + HRM extension apply spawn.',
    'WF start / change request',
    'Nút Gửi phê duyệt',
    '`POST …/catalog-governance/workflows/start` → **XBOS-CAT-211**',
    [
      caseRow('TC-DM12-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login', '1. Tạo thay đổi nhạy cảm từ FE', 'Change set sẵn', 'UI', '#88'),
      caseRow('TC-DM12-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Thay đổi vượt quyền', 'Chặn', 'UI/API', 'AU'),
      caseRow('TC-DM12-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, '—', '1. Mở', 'Hint cần duyệt', 'UI', 'UX'),
      caseRow('TC-DM12-SUB-HP-001', 'CAP-02', 'FN-SUBMIT', 'HP', 'P0', P.ceo, 'Change set FE hợp lệ', '1. Gửi duyệt', '211/2xx; task từ FE; F5 pending', 'UI/API', 'XBOS-CAT-211 · U65'),
      caseRow('TC-DM12-SUB-FD-001', 'CAP-02', 'FN-SUBMIT', 'FD', 'P0', P.ceo, 'Thiếu payload', '1. Gửi', '4xx; không spawn', 'UI/API', 'FD'),
      caseRow('TC-DM12-SUB-AU-001', 'CAP-02', 'FN-SUBMIT', 'AU', 'P0', P.member, 'Sai scope', '1. Start WF', '403/409', 'API', 'AU'),
      caseRow('TC-DM12-SUB-UX-001', 'CAP-02', 'FN-SUBMIT', 'UX', 'P1', P.ceo, 'Sau gửi', '1. UI', 'Pending/locked', 'UI', 'UX'),
      caseRow('TC-DM12-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.gov, 'Task tạo FE', '1. Mở inbox catalog', 'Thấy task', 'UI', 'CAT-03'),
      caseRow('TC-DM12-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Trước submit', '1. Inbox', 'Empty OK — không seed', 'UI', 'U65'),
      caseRow('TC-DM12-SUB-FD-002', 'CAP-02', 'FN-SUBMIT', 'FD', 'P0', P.ceo, 'Batch đã started', '1. Start lại', '4xx idempotent/BR', 'API', 'FD'),
      caseRow('TC-DM12-SUB-AU-002', 'CAP-02', 'FN-SUBMIT', 'AU', 'P0', 'anonymous', '—', '1. POST start', '401', 'API', 'AU'),
      caseRow('TC-DM12-OPEN-HP-002', 'CAP-01', 'FN-OPEN', 'HP', 'P1', P.ceo, 'HDSD path', '1. Theo menu SRS', 'Đúng màn', 'UI', 'U76'),
      caseRow('TC-DM12-VER-HP-002', 'CAP-03', 'FN-VERIFY', 'HP', 'P1', P.ceo, 'Sau start', '1. F5 change set', 'Trạng thái chờ duyệt', 'UI', 'AC'),
      caseRow('TC-DM12-SUB-UX-002', 'CAP-02', 'FN-SUBMIT', 'UX', 'P2', P.ceo, 'Double click', '1. Click 2 lần nhanh', 'Một instance', 'UI', 'UX'),
    ],
  ),
);

ucs.push(
  dmBase(
    89,
    'XBOS-DM-13',
    'Phê duyệt hoặc từ chối',
    'Approver quyết định thay đổi nhạy cảm / extension.',
    [
      { cap: 'CAP-02', id: 'FN-APPROVE', name: 'Phê duyệt', ui: 'POST tasks/:id/approve', mutate: 'Y', ux: 1 },
      { cap: 'CAP-02', id: 'FN-REJECT', name: 'Từ chối + lý do', ui: 'POST reject', mutate: 'Y', bd: 1 },
    ],
    'LIKELY_IMPL',
    'approve XBOS-CAT-201 / reject XBOS-CAT-202; FE confirm dialogs.',
    'POST approve/reject',
    'POP-CAT-APPROVE / REJECT · Inbox',
    '`POST …/tasks/:taskId/approve` → **XBOS-CAT-201** · reject → **XBOS-CAT-202**',
    [
      caseRow('TC-DM13-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.gov, 'Task từ FE chain', '1. Mở task', 'Detail actionable', 'UI', '#89 · UF-09'),
      caseRow('TC-DM13-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Không assignee', '1. Mở task', '403/không thấy', 'UI/API', 'AU'),
      caseRow('TC-DM13-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.gov, 'Empty inbox', '1. Mở', 'Empty U65 — không seed', 'UI', 'U65'),
      caseRow('TC-DM13-AP-HP-001', 'CAP-02', 'FN-APPROVE', 'HP', 'P0', P.gov, 'Pending FE', '1. Phê duyệt confirm', '201; F5 approved', 'UI/API', 'XBOS-CAT-201'),
      caseRow('TC-DM13-AP-FD-001', 'CAP-02', 'FN-APPROVE', 'FD', 'P0', P.gov, 'Task terminal', '1. Approve lại', '4xx', 'API', 'FD'),
      caseRow('TC-DM13-AP-AU-001', 'CAP-02', 'FN-APPROVE', 'AU', 'P0', P.member, 'Member duyệt hộ', '1. Approve', '403/409', 'API', 'AU'),
      caseRow('TC-DM13-AP-UX-001', 'CAP-02', 'FN-APPROVE', 'UX', 'P1', P.gov, 'Dialog', '1. Cancel', 'Không gọi API', 'UI', 'UX'),
      caseRow('TC-DM13-RJ-HP-001', 'CAP-02', 'FN-REJECT', 'HP', 'P0', P.gov, 'Pending khác FE', '1. Từ chối + lý do đủ', '202; F5 rejected', 'UI/API', 'XBOS-CAT-202'),
      caseRow('TC-DM13-RJ-FD-001', 'CAP-02', 'FN-REJECT', 'FD', 'P0', P.gov, 'Pending', '1. Lý do <10 ký tự (contract)', '4xx; vẫn pending', 'UI/API', 'API_CONTRACT'),
      caseRow('TC-DM13-RJ-BD-001', 'CAP-02', 'FN-REJECT', 'BD', 'P1', P.gov, '—', '1. Lý do đúng 10 ký tự', 'Pass biên', 'API', 'BD'),
      caseRow('TC-DM13-RJ-AU-001', 'CAP-02', 'FN-REJECT', 'AU', 'P0', 'anonymous', '—', '1. POST reject', '401', 'API', 'AU'),
      caseRow('TC-DM13-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Sau approve', '1. Consumer HRM', 'Item áp dụng', 'UI/API', 'UF-15'),
      caseRow('TC-DM13-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.gov, 'Sau reject', '1. Requester xem', 'Thấy lý do', 'UI', 'UX'),
      caseRow('TC-DM13-AP-HP-002', 'CAP-02', 'FN-APPROVE', 'HP', 'P1', P.gov, 'Multi-item batch', '1. Approve', 'Mọi item theo BR', 'UI/API', 'HP'),
      caseRow('TC-DM13-RJ-FD-002', 'CAP-02', 'FN-REJECT', 'FD', 'P1', P.gov, 'Thiếu review_note khi bắt buộc', '1. Reject trống', '4xx', 'API', 'FD'),
      caseRow('TC-DM13-OPEN-HP-002', 'CAP-01', 'FN-OPEN', 'HP', 'P1', P.gov, 'HDSD', '1. Đúng menu Phê duyệt danh mục', 'Đúng panel', 'UI', 'U76'),
    ],
  ),
);

ucs.push(
  dmBase(
    90,
    'XBOS-DM-14',
    'Xem lịch sử thay đổi',
    'Audit trail thay đổi giá trị/phiên bản danh mục.',
    [{ cap: 'CAP-02', id: 'FN-HISTORY', name: 'Xem lịch sử', ui: 'Tab Lịch sử · GET audit', mutate: 'N', fd: 1 }],
    'LIKELY_PARTIAL',
    'Matrix endpoint Có; UI history panel xác nhận khi execute.',
    'GET history/audit',
    'Lịch sử trên detail catalog',
    'History/audit endpoint · timestamps vi-VN',
    [
      caseRow('TC-DM14-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Đã có thay đổi FE', '1. Mở lịch sử', 'List 2xx', 'UI/API', '#90'),
      caseRow('TC-DM14-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. History CT khác', '403/empty scope', 'API', 'AU'),
      caseRow('TC-DM14-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Chưa đổi', '1. Mở', 'Empty OK', 'UI', 'UX'),
      caseRow('TC-DM14-HIS-HP-001', 'CAP-02', 'FN-HISTORY', 'HP', 'P0', P.ceo, 'Sau mutate FE', '1. Xem event mới', 'Actor/time đúng; dd/MM/yyyy HH:mm', 'UI', 'vi-VN'),
      caseRow('TC-DM14-HIS-FD-001', 'CAP-02', 'FN-HISTORY', 'FD', 'P0', P.ceo, 'id giả', '1. GET history', '404', 'API', 'FD'),
      caseRow('TC-DM14-HIS-AU-001', 'CAP-02', 'FN-HISTORY', 'AU', 'P0', 'anonymous', '—', '1. GET', '401', 'API', 'AU'),
      caseRow('TC-DM14-HIS-UX-001', 'CAP-02', 'FN-HISTORY', 'UX', 'P1', P.ceo, 'Nhiều trang', '1. Page', 'Pagination ổn', 'UI', 'UX'),
      caseRow('TC-DM14-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, '—', '1. Đối chiếu mutate', 'Khớp sequence', 'UI', 'AC'),
      caseRow('TC-DM14-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, '500', '1. Fail load', 'Banner', 'UI', 'UX'),
      caseRow('TC-DM14-HIS-HP-002', 'CAP-02', 'FN-HISTORY', 'HP', 'P1', P.ceo, 'Publish event', '1. Sau DM-17', 'Thấy event publish', 'UI', 'trace'),
    ],
  ),
);

ucs.push(
  dmBase(
    91,
    'XBOS-DM-15',
    'Yêu cầu bổ sung trường (công ty con)',
    'CT thành viên đề nghị thêm field/extension vào catalog tập đoàn.',
    [{ cap: 'CAP-02', id: 'FN-REQ-ADD', name: 'Tạo yêu cầu bổ sung trường', ui: 'Xác nhận áp dụng', mutate: 'Y', ux: 1 }],
    'LIKELY_IMPL',
    'HRM extension + gov spawn HRM-SET-209 — Primary CAT-EXT paths.',
    'POST extension / settings apply',
    'company_group_hr → Xác nhận áp dụng',
    '`/api/hrm/settings-catalogs` · extension-requests · `HRM-SET-209` · `XBOS-CAT-200`',
    [
      caseRow('TC-DM15-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Login + OU member', '1. Mở company_group_hr', 'Form cấu hình', 'UI', '#91 · UF-15'),
      caseRow('TC-DM15-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Mở CT khác', 'Chặn', 'UI/API', 'AU'),
      caseRow('TC-DM15-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, '—', '1. Dialog field', 'Tabs khối', 'UI', 'UX'),
      caseRow('TC-DM15-ADD-HP-001', 'CAP-02', 'FN-REQ-ADD', 'HP', 'P0', P.ceo, 'Thêm field FE', '1. Xác nhận áp dụng', '209/2xx; pending gov; F5', 'UI/API', 'HRM-SET-209 · U65'),
      caseRow('TC-DM15-ADD-FD-001', 'CAP-02', 'FN-REQ-ADD', 'FD', 'P0', P.ceo, 'Thiếu mã/label', '1. Submit', '4xx; không spawn', 'UI/API', 'FD'),
      caseRow('TC-DM15-ADD-AU-001', 'CAP-02', 'FN-REQ-ADD', 'AU', 'P0', P.member, 'Sai x-company-id', '1. Submit', '403/409', 'API', 'AU'),
      caseRow('TC-DM15-ADD-UX-001', 'CAP-02', 'FN-REQ-ADD', 'UX', 'P1', P.ceo, 'Confirm', '1. Cancel', 'Không gọi API', 'UI', 'UX'),
      caseRow('TC-DM15-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.gov, 'Sau request FE', '1. extension-requests / panel', 'Thấy chờ', 'UI/API', 'XBOS-CAT-200'),
      caseRow('TC-DM15-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Trước request', '1. Gov list', 'Empty OK', 'UI', 'U65'),
      caseRow('TC-DM15-ADD-HP-002', 'CAP-02', 'FN-REQ-ADD', 'HP', 'P1', P.ceo, 'Multi field', '1. Apply batch', 'Đủ items trong request', 'UI/API', 'HP'),
      caseRow('TC-DM15-ADD-FD-002', 'CAP-02', 'FN-REQ-ADD', 'FD', 'P0', P.ceo, 'Trùng mã field', '1. Submit', '4xx BR', 'API', 'FD'),
      caseRow('TC-DM15-OPEN-HP-002', 'CAP-01', 'FN-OPEN', 'HP', 'P1', P.ceo, 'HDSD', '1. Đúng menu', 'U76 align', 'UI', 'U76'),
      caseRow('TC-DM15-VER-HP-002', 'CAP-03', 'FN-VERIFY', 'HP', 'P1', P.ceo, 'Sau 209', '1. F5 dialog', 'Submitted state', 'UI', 'AC'),
      caseRow('TC-DM15-ADD-AU-002', 'CAP-02', 'FN-REQ-ADD', 'AU', 'P0', 'anonymous', '—', '1. POST', '401', 'API', 'AU'),
    ],
  ),
);

ucs.push(
  dmBase(
    92,
    'XBOS-DM-16',
    'Yêu cầu xóa trường — phê duyệt tập đoàn',
    'Đề nghị gỡ field; hiệu lực sau duyệt tập đoàn (không hard-delete platform).',
    [
      { cap: 'CAP-02', id: 'FN-REQ-DEL', name: 'Gửi yêu cầu xóa/ngừng trường', ui: 'Remove → submit gov', mutate: 'Y', ux: 1 },
      { cap: 'CAP-02', id: 'FN-GOV-DEL', name: 'Tập đoàn duyệt/từ chối xóa', ui: 'Approve/reject', mutate: 'Y' },
    ],
    'LIKELY_PARTIAL',
    'Soft-delete/inactive qua gov; cấm hard-delete platform — SRS_VN.',
    'Extension delete + approve',
    'UI gỡ field + gov panel',
    'extension-requests · approve/reject · soft-delete only',
    [
      caseRow('TC-DM16-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Field tồn tại FE', '1. Mở cấu hình', 'Thấy field', 'UI', '#92'),
      caseRow('TC-DM16-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Platform field', '1. Thử xóa cứng', 'Chặn / chỉ request', 'UI/API', 'SRS soft-delete'),
      caseRow('TC-DM16-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, '—', '1. Hover xóa', 'Confirm destructive', 'UI', 'UX'),
      caseRow('TC-DM16-DEL-HP-001', 'CAP-02', 'FN-REQ-DEL', 'HP', 'P0', P.ceo, 'Field tenant FE', '1. Gửi yêu cầu xóa', '2xx pending; consumer chưa mất', 'UI/API', 'DM-16'),
      caseRow('TC-DM16-DEL-FD-001', 'CAP-02', 'FN-REQ-DEL', 'FD', 'P0', P.ceo, 'Platform lock', '1. Request', '4xx BR', 'API', 'FD'),
      caseRow('TC-DM16-DEL-AU-001', 'CAP-02', 'FN-REQ-DEL', 'AU', 'P0', P.member, 'Sai CT', '1. Request', '403/409', 'API', 'AU'),
      caseRow('TC-DM16-DEL-UX-001', 'CAP-02', 'FN-REQ-DEL', 'UX', 'P1', P.ceo, 'Pending', '1. UI', 'Badge chờ duyệt', 'UI', 'UX'),
      caseRow('TC-DM16-GOV-HP-001', 'CAP-02', 'FN-GOV-DEL', 'HP', 'P0', P.gov, 'Task FE', '1. Phê duyệt xóa', '201; soft inactive; F5', 'UI/API', 'XBOS-CAT-201'),
      caseRow('TC-DM16-GOV-FD-001', 'CAP-02', 'FN-GOV-DEL', 'FD', 'P0', P.gov, 'Reject path', '1. Từ chối', '202; field giữ', 'UI/API', 'XBOS-CAT-202'),
      caseRow('TC-DM16-GOV-AU-001', 'CAP-02', 'FN-GOV-DEL', 'AU', 'P0', P.member, 'Member approve', '1. Approve', '403', 'API', 'AU'),
      caseRow('TC-DM16-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Sau approve', '1. Consumer', 'Field không dùng; không vỡ FK', 'UI', 'AC'),
      caseRow('TC-DM16-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, '—', '1. History', 'Event ngừng', 'UI', 'DM-14'),
      caseRow('TC-DM16-DEL-FD-002', 'CAP-02', 'FN-REQ-DEL', 'FD', 'P1', P.ceo, 'Field đang pending khác', '1. Request trùng', '4xx', 'API', 'FD'),
      caseRow('TC-DM16-GOV-HP-002', 'CAP-02', 'FN-GOV-DEL', 'HP', 'P1', P.gov, 'Approve confirm', '1. Cancel rồi approve', 'Chỉ 1 lần API khi confirm', 'UI', 'UX/HP'),
    ],
  ),
);

ucs.push(
  dmBase(
    93,
    'XBOS-DM-17',
    'Phát hành phiên bản danh mục',
    'Publish version để phân hệ pull cấu hình mới.',
    [{ cap: 'CAP-02', id: 'FN-PUBLISH', name: 'Phát hành phiên bản', ui: 'POST catalog-governance/publish', mutate: 'Y', ux: 1 }],
    'LIKELY_IMPL',
    'POST catalog-governance/publish → config-sync XBOS-CFG-203.',
    'publishCatalog',
    'Nút Phát hành / publish dialog',
    '`POST /api/xbos/catalog-governance/publish` → **XBOS-CFG-203**',
    [
      caseRow('TC-DM17-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Draft items FE', '1. Mở publish', 'Form version/name', 'UI', '#93 · §8.1'),
      caseRow('TC-DM17-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'Member', '1. Publish holding', '403/409', 'API', 'AU'),
      caseRow('TC-DM17-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, '—', '1. Mở', 'Hint version', 'UI', 'UX'),
      caseRow('TC-DM17-PUB-HP-001', 'CAP-02', 'FN-PUBLISH', 'HP', 'P0', P.ceo, 'Items hợp lệ FE', '1. Publish', '203; version↑; F5', 'UI/API', 'XBOS-CFG-203'),
      caseRow('TC-DM17-PUB-FD-001', 'CAP-02', 'FN-PUBLISH', 'FD', 'P0', P.ceo, 'Thiếu name/items', '1. Publish', '4xx', 'API', 'FD'),
      caseRow('TC-DM17-PUB-AU-001', 'CAP-02', 'FN-PUBLISH', 'AU', 'P0', P.member, 'Sai company', '1. Publish', '403/409', 'API', 'AU'),
      caseRow('TC-DM17-PUB-UX-001', 'CAP-02', 'FN-PUBLISH', 'UX', 'P1', P.ceo, 'After', '1. Banner', 'Version hiển thị', 'UI', 'UX'),
      caseRow('TC-DM17-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Published', '1. Pull HRM/module', 'Version mới', 'UI/API', '§8.2'),
      caseRow('TC-DM17-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Publish fail', '1. 500', 'Error; draft giữ', 'UI', 'UX'),
      caseRow('TC-DM17-PUB-FD-002', 'CAP-02', 'FN-PUBLISH', 'FD', 'P0', P.ceo, 'Empty items', '1. Publish', '4xx', 'API', 'FD'),
      caseRow('TC-DM17-PUB-HP-002', 'CAP-02', 'FN-PUBLISH', 'HP', 'P1', P.ceo, 'catalogKey job_titles', '1. Publish', '203 đúng key', 'API', 'HP'),
      caseRow('TC-DM17-OPEN-AU-002', 'CAP-01', 'FN-OPEN', 'AU', 'P0', 'anonymous', '—', '1. POST publish', '401', 'API', 'AU'),
      caseRow('TC-DM17-VER-HP-002', 'CAP-03', 'FN-VERIFY', 'HP', 'P1', P.ceo, 'Sau publish', '1. History', 'Event phát hành', 'UI', 'DM-14'),
      caseRow('TC-DM17-PUB-UX-002', 'CAP-02', 'FN-PUBLISH', 'UX', 'P2', P.ceo, 'Double publish', '1. Click 2 lần', 'Idempotent/BR rõ', 'UI/API', 'UX'),
    ],
  ),
);

ucs.push(
  dmBase(
    94,
    'XBOS-DM-18',
    'Thông báo phân hệ có danh mục mới',
    'Phân hệ đích nhận tín hiệu/notification sau publish.',
    [{ cap: 'CAP-02', id: 'FN-NOTIFY', name: 'Phát/nhận thông báo catalog mới', ui: 'Event/banner pull', mutate: 'Y', ux: 1 }],
    'LIKELY_PARTIAL',
    'TECHSPEC_HE queue lan truyền catalog; FE notice có thể là pull badge.',
    'Outbox/event notify · pull hint',
    'Banner/menu notice sau publish',
    'Catalog sync notify / pull · BullMQ (TECH_SPEC_VN)',
    [
      caseRow('TC-DM18-OPEN-HP-001', 'CAP-01', 'FN-OPEN', 'HP', 'P0', P.ceo, 'Đã publish FE', '1. Mở phân hệ đích', 'Tín hiệu version mới hoặc list mới', 'UI', '#94'),
      caseRow('TC-DM18-OPEN-AU-001', 'CAP-01', 'FN-OPEN', 'AU', 'P0', P.member, 'CT không assign', '1. Notice', 'Không nhận nhầm', 'UI/API', 'AU'),
      caseRow('TC-DM18-OPEN-UX-001', 'CAP-01', 'FN-OPEN', 'UX', 'P1', P.ceo, 'Chưa publish', '1. Mở', 'Không false-positive', 'UI', 'UX'),
      caseRow('TC-DM18-NTF-HP-001', 'CAP-02', 'FN-NOTIFY', 'HP', 'P0', P.ceo, 'Publish OK', '1. Quan sát notify/pull', 'Consumer cập nhật', 'UI/API', 'DM-18'),
      caseRow('TC-DM18-NTF-FD-001', 'CAP-02', 'FN-NOTIFY', 'FD', 'P0', P.ceo, 'Sync fail', '1. Error path', 'Retry/banner lỗi', 'API', 'FD'),
      caseRow('TC-DM18-NTF-AU-001', 'CAP-02', 'FN-NOTIFY', 'AU', 'P0', P.member, 'Cross-tenant', '1. Event CT khác', 'Không leak', 'API', 'AU'),
      caseRow('TC-DM18-NTF-UX-001', 'CAP-02', 'FN-NOTIFY', 'UX', 'P1', P.ceo, 'Badge', '1. Click notice', 'Deep link đúng màn', 'UI', 'UX'),
      caseRow('TC-DM18-VER-HP-001', 'CAP-03', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Sau sync', '1. So version', 'Khớp published', 'UI/API', 'AC'),
      caseRow('TC-DM18-VER-UX-001', 'CAP-03', 'FN-VERIFY', 'UX', 'P2', P.ceo, 'Dismiss', '1. Đóng banner', 'Không hiện lại sai', 'UI', 'UX'),
      caseRow('TC-DM18-NTF-HP-002', 'CAP-02', 'FN-NOTIFY', 'HP', 'P1', P.ceo, 'Multi module assign', '1. Publish', 'Chỉ module được gán nhận', 'UI/API', 'DM-07 neo'),
      caseRow('TC-DM18-OPEN-FD-001', 'CAP-01', 'FN-OPEN', 'FD', 'P1', P.ceo, 'API notify down', '1. Mở', 'Degraded rõ — không silent mock', 'UI', 'FD'),
    ],
  ),
);

// ECO
function eco(stt, id, name, mod, goal, readiness, note, api, cases, caps, fns, fnCounts, be, fe, surfaces = 'web-portal / api') {
  return {
    stt,
    id,
    name_vi: name,
    mod,
    actors: 'Platform admin · Group CEO · (tenant onboard)',
    surfaces,
    srs_old: `\`BANG_TONG_HOP_USECASE_XEVN.md\` STT ${stt} · PHASE1 matrix`,
    srs_new: '`SRS_VN.md` tenant/catalog inherit · TECHSPEC_HE §8',
    tech_spec: '`TECHSPEC_HE_SINH_THAI_XEVN.md` §8 · business-master UC-ECO-MASTER-01 note',
    api,
    code_readiness: readiness,
    code_note: note,
    goal,
    caps,
    fns,
    fnCounts,
    cases,
    be,
    be_ev: 'apps/api/xbos-api/src/business-master/business-master.controller.ts',
    fe,
    fe_ev: 'apps/web Command Center / portal data hooks',
    rbac: 'tenant_id + company scope trên mọi master read/write',
  };
}

ucs.push(
  eco(
    95,
    'UC-ECO-MASTER-01',
    'Quản lý master data theo tenant và công ty',
    'M00',
    'Đọc/ghi master data (domain catalogs) đúng tenant và pháp nhân; không lẫn partition.',
    'LIKELY_PARTIAL',
    'Controller ghi UC-ECO-MASTER-01 minimal read path; matrix API P2 một phần — PARTIAL honest.',
    'GET/PUT `/api/xbos/business-master/{domain}/items*` · `XBOS-MASTER-200/201`',
    [
      caseRow('TC-ECO-M01-LIST-HP-001', 'CAP-01', 'FN-LIST', 'HP', 'P0', P.ceo, 'Login main', '1. GET command_center_catalogs items', '200 + scope holding', 'API/UI', 'UC-ECO-MASTER-01'),
      caseRow('TC-ECO-M01-LIST-AU-001', 'CAP-01', 'FN-LIST', 'AU', 'P0', P.member, 'Member', '1. GET holding-only', '403/409 hoặc filter CT', 'API', 'AU'),
      caseRow('TC-ECO-M01-LIST-UX-001', 'CAP-01', 'FN-LIST', 'UX', 'P1', P.ceo, 'Empty', '1. List', 'Empty OK', 'UI', 'U65'),
      caseRow('TC-ECO-M01-PUT-HP-001', 'CAP-02', 'FN-UPSERT', 'HP', 'P0', P.ceo, 'Row FE', '1. PUT items', '201/200; F5', 'UI/API', 'XBOS-MASTER-201'),
      caseRow('TC-ECO-M01-PUT-FD-001', 'CAP-02', 'FN-UPSERT', 'FD', 'P0', P.ceo, 'Invalid payload', '1. PUT', '4xx', 'API', 'FD'),
      caseRow('TC-ECO-M01-PUT-AU-001', 'CAP-02', 'FN-UPSERT', 'AU', 'P0', P.member, 'Wrong companyId', '1. PUT', '403/409', 'API', 'AU'),
      caseRow('TC-ECO-M01-PUT-UX-001', 'CAP-02', 'FN-UPSERT', 'UX', 'P1', P.ceo, 'Autosave', '1. Debounce', 'Banner đúng', 'UI', 'UF-14'),
      caseRow('TC-ECO-M01-TEN-HP-001', 'CAP-03', 'FN-TENANT-ISO', 'HP', 'P0', P.ceo, '2 tenants nếu có', '1. Đổi tenant context', 'Không leak rows', 'API', 'tenant_id'),
      caseRow('TC-ECO-M01-TEN-FD-001', 'CAP-03', 'FN-TENANT-ISO', 'FD', 'P0', P.ceo, 'Sai tenant header', '1. GET', '4xx/empty', 'API', 'FD'),
      caseRow('TC-ECO-M01-TEN-AU-001', 'CAP-03', 'FN-TENANT-ISO', 'AU', 'P0', 'token tenant A', 'Query tenant B', '1. GET', '403', 'API', 'AU'),
      caseRow('TC-ECO-M01-VER-HP-001', 'CAP-04', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Sau PUT', '1. F5', 'Persist', 'UI', 'AC'),
      caseRow('TC-ECO-M01-VER-UX-001', 'CAP-04', 'FN-VERIFY', 'UX', 'P2', P.ceo, '500', '1. Fail', 'Banner', 'UI', 'UX'),
    ],
    [
      { id: 'CAP-01', name: 'Đọc master theo scope', purpose: 'List đúng tenant/CT', actor: 'Admin' },
      { id: 'CAP-02', name: 'Ghi master', purpose: 'Upsert items', actor: 'Admin' },
      { id: 'CAP-03', name: 'Cô lập tenant', purpose: 'Không cross-tenant', actor: 'Hệ thống' },
      { id: 'CAP-04', name: 'Xác nhận FE', purpose: 'F5 persist', actor: 'Admin' },
    ],
    [
      { cap: 'CAP-01', id: 'FN-LIST', name: 'List master items', ui: 'GET items', mutate: 'N' },
      { cap: 'CAP-02', id: 'FN-UPSERT', name: 'Upsert master items', ui: 'PUT items', mutate: 'Y' },
      { cap: 'CAP-03', id: 'FN-TENANT-ISO', name: 'Kiểm tra cô lập tenant', ui: 'API scope', mutate: 'N' },
      { cap: 'CAP-04', id: 'FN-VERIFY', name: 'F5 verify', ui: 'UI', mutate: 'N' },
    ],
    [
      ['FN-LIST', 1, 0, 0, 1, 1],
      ['FN-UPSERT', 1, 1, 0, 1, 1],
      ['FN-TENANT-ISO', 1, 1, 0, 1, 0],
      ['FN-VERIFY', 1, 0, 0, 0, 1],
    ],
    'business-master domains incl. command_center_catalogs',
    'CC settings catalogs autosave',
  ),
);

ucs.push(
  eco(
    96,
    'UC-ECO-MASTER-02',
    'Mở rộng tenant mới với tenant master',
    'M00',
    'Onboard tenant mới kế thừa catalog master; không xóa platform-owned values.',
    'LIKELY_PARTIAL',
    'Matrix: Có endpoint; SRS_VN inherit catalog — map onboard API khi execute.',
    'Tenant provision / catalog inherit (TECHSPEC_HE §8)',
    [
      caseRow('TC-ECO-M02-PROV-HP-001', 'CAP-01', 'FN-PROVISION', 'HP', 'P0', P.ceo, 'Quyền platform', '1. Khởi tạo tenant mới đúng HDSD', '2xx created', 'API/UI', '#96'),
      caseRow('TC-ECO-M02-PROV-FD-001', 'CAP-01', 'FN-PROVISION', 'FD', 'P0', P.ceo, 'Thiếu mã tenant', '1. Submit', '4xx', 'API', 'FD'),
      caseRow('TC-ECO-M02-PROV-AU-001', 'CAP-01', 'FN-PROVISION', 'AU', 'P0', P.member, 'Member', '1. Provision', '403', 'API', 'AU'),
      caseRow('TC-ECO-M02-INH-HP-001', 'CAP-02', 'FN-INHERIT', 'HP', 'P0', P.ceo, 'Tenant mới', '1. Inherit master', 'Baseline platform rows', 'API', 'SRS inherit'),
      caseRow('TC-ECO-M02-INH-FD-001', 'CAP-02', 'FN-INHERIT', 'FD', 'P0', P.ceo, 'Conflict re-inherit', '1. Chạy lại sai', '4xx hoặc idempotent documented', 'API', 'FD'),
      caseRow('TC-ECO-M02-INH-AU-001', 'CAP-02', 'FN-INHERIT', 'AU', 'P0', P.member, '—', '1. Inherit hộ tenant khác', '403', 'API', 'AU'),
      caseRow('TC-ECO-M02-PRO-HP-001', 'CAP-03', 'FN-PROTECT', 'HP', 'P0', P.ceo, 'Platform row', '1. Thử hard-delete', 'Chặn; soft only', 'API', 'SRS_VN'),
      caseRow('TC-ECO-M02-PRO-FD-001', 'CAP-03', 'FN-PROTECT', 'FD', 'P0', P.ceo, '—', '1. DELETE platform', '4xx', 'API', 'FD'),
      caseRow('TC-ECO-M02-PRO-AU-001', 'CAP-03', 'FN-PROTECT', 'AU', 'P0', 'anonymous', '—', '1. API', '401', 'API', 'AU'),
      caseRow('TC-ECO-M02-VER-HP-001', 'CAP-04', 'FN-VERIFY', 'HP', 'P0', P.ceo, 'Sau onboard', '1. List catalog tenant mới', 'Có data kế thừa', 'UI/API', 'AC'),
      caseRow('TC-ECO-M02-VER-UX-001', 'CAP-04', 'FN-VERIFY', 'UX', 'P1', P.ceo, '—', '1. Wizard', 'Steps + error recovery', 'UI', 'UX'),
      caseRow('TC-ECO-M02-VER-AU-001', 'CAP-04', 'FN-VERIFY', 'AU', 'P0', P.member, 'Không membership', '1. Login list', '403/empty', 'UI/API', 'AU'),
    ],
    [
      { id: 'CAP-01', name: 'Provision tenant', purpose: 'Tạo tenant', actor: 'Platform admin' },
      { id: 'CAP-02', name: 'Inherit master', purpose: 'Kế thừa catalog', actor: 'Hệ thống' },
      { id: 'CAP-03', name: 'Bảo vệ platform rows', purpose: 'Không hard-delete', actor: 'Hệ thống' },
      { id: 'CAP-04', name: 'Xác nhận', purpose: 'Tenant dùng được master', actor: 'Admin' },
    ],
    [
      { cap: 'CAP-01', id: 'FN-PROVISION', name: 'Tạo tenant', ui: 'API/UI onboard', mutate: 'Y' },
      { cap: 'CAP-02', id: 'FN-INHERIT', name: 'Inherit catalog', ui: 'API', mutate: 'Y' },
      { cap: 'CAP-03', id: 'FN-PROTECT', name: 'Chặn hard-delete platform', ui: 'API', mutate: 'Y' },
      { cap: 'CAP-04', id: 'FN-VERIFY', name: 'Verify tenant catalog', ui: 'UI/API', mutate: 'N' },
    ],
    [
      ['FN-PROVISION', 1, 1, 0, 1, 0],
      ['FN-INHERIT', 1, 1, 0, 1, 0],
      ['FN-PROTECT', 1, 1, 0, 1, 0],
      ['FN-VERIFY', 1, 0, 0, 1, 1],
    ],
    'Tenant master expand endpoints',
    'Portal onboard nếu có — else API-first',
  ),
);

ucs.push(
  eco(
    97,
    'UC-ECO-FE-01',
    'Thay thế dữ liệu giả lập trên Web Portal bằng API thật',
    'M00',
    'Portal không phụ thuộc mock cứng cho master/catalog khi API sẵn; empty/error đúng sự thật.',
    'LIKELY_PARTIAL',
    'Matrix API P2 một phần; nhiều màn đã wire Nest — PARTIAL; cấm mock PASS khi API down.',
    'Portal → Vite proxy → xbos/hrm APIs',
    [
      caseRow('TC-ECO-FE-WIRE-HP-001', 'CAP-01', 'FN-WIRE', 'HP', 'P0', P.ceo, 'APIs up', '1. Mở CC catalogs', 'Network GET API thật 2xx', 'UI', '#97 · UF-14'),
      caseRow('TC-ECO-FE-WIRE-FD-001', 'CAP-01', 'FN-WIRE', 'FD', 'P0', P.ceo, 'Stop xbos-api', '1. Mở màn', 'Banner lỗi — không fake rows', 'UI', 'qc:fe-be-health'),
      caseRow('TC-ECO-FE-WIRE-AU-001', 'CAP-01', 'FN-WIRE', 'AU', 'P0', P.member, 'Member', '1. Mở rollup', '403/409 — không mock full group', 'UI', 'AU'),
      caseRow('TC-ECO-FE-MUT-HP-001', 'CAP-02', 'FN-MUTATE-API', 'HP', 'P0', P.ceo, 'API up', '1. Sửa + Lưu FE', 'PUT 2xx; F5 còn', 'UI/API', 'U65'),
      caseRow('TC-ECO-FE-MUT-FD-001', 'CAP-02', 'FN-MUTATE-API', 'FD', 'P0', P.ceo, 'Validation', '1. Submit invalid', '4xx FE hiện lỗi', 'UI', 'FD'),
      caseRow('TC-ECO-FE-MUT-AU-001', 'CAP-02', 'FN-MUTATE-API', 'AU', 'P0', P.member, '—', '1. Mutate ngoài scope', '403/409', 'UI/API', 'AU'),
      caseRow('TC-ECO-FE-MOCK-HP-001', 'CAP-03', 'FN-NO-MOCK', 'HP', 'P0', P.ceo, 'Devtools', '1. Inspect source', 'Không mock business rows path đã wire', 'UI', 'AC'),
      caseRow('TC-ECO-FE-MOCK-FD-001', 'CAP-03', 'FN-NO-MOCK', 'FD', 'P0', P.ceo, 'Fallback mock', '1. Nếu còn', 'Phải banner mock — không im lặng', 'UI', 'observe'),
      caseRow('TC-ECO-FE-MOCK-UX-001', 'CAP-03', 'FN-NO-MOCK', 'UX', 'P1', P.ceo, 'Empty API', '1. List 0', 'Empty thật — không Test 123', 'UI', 'U65'),
      caseRow('TC-ECO-FE-VER-HP-001', 'CAP-04', 'FN-VERIFY', 'HP', 'P0', P.ceo, '—', '1. qc:fe-be-health + F5', 'Consistent', 'UI', 'gate'),
    ],
    [
      { id: 'CAP-01', name: 'Wire đọc API', purpose: 'List từ Nest', actor: 'FE' },
      { id: 'CAP-02', name: 'Wire ghi API', purpose: 'Mutate qua API', actor: 'FE' },
      { id: 'CAP-03', name: 'Loại bỏ mock im lặng', purpose: 'Không fake data', actor: 'FE' },
      { id: 'CAP-04', name: 'Health verify', purpose: 'Stack sống', actor: 'QA/DevOps' },
    ],
    [
      { cap: 'CAP-01', id: 'FN-WIRE', name: 'Bind GET API', ui: 'React Query/fetch', mutate: 'N' },
      { cap: 'CAP-02', id: 'FN-MUTATE-API', name: 'Bind mutate API', ui: 'PUT/POST', mutate: 'Y' },
      { cap: 'CAP-03', id: 'FN-NO-MOCK', name: 'Không mock production path', ui: 'FE', mutate: 'N' },
      { cap: 'CAP-04', id: 'FN-VERIFY', name: 'Health + F5', ui: 'UI', mutate: 'N' },
    ],
    [
      ['FN-WIRE', 1, 1, 0, 1, 0],
      ['FN-MUTATE-API', 1, 1, 0, 1, 0],
      ['FN-NO-MOCK', 1, 1, 0, 0, 1],
      ['FN-VERIFY', 1, 0, 0, 0, 0],
    ],
    'APIs must be up — 500 proxy ≠ FE bug',
    'CommandCenterPage + catalog APIs',
    'web-portal',
  ),
);

function cat(stt, id, name, goal, readiness, note, block, cases) {
  return {
    stt,
    id,
    name_vi: name,
    mod: 'M02',
    actors: 'Group CEO / catalog approver · Member requester (HR/CEO CT)',
    surfaces: 'xbos-cc / web-portal / api',
    srs_old: `\`BANG_TONG_HOP_USECASE_XEVN.md\` STT ${stt} · \`docs/xbos/USECASE_TONG_THE_XBOS.md\` · FR-XBOS-CAT-*`,
    srs_new: '`SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05',
    tech_spec: '`TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance',
    api: block.api,
    code_readiness: readiness,
    code_note: note,
    goal,
    caps: block.caps,
    fns: block.fns,
    fnCounts: block.fnCounts,
    cases,
    be: block.be,
    be_ev: 'apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts',
    fe: block.fe,
    fe_ev: 'CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi',
    rbac: 'Group read main→holding; write scope match; member start với memberCompanyId',
  };
}

ucs.push(
  cat(
    367,
    'UC-XBOS-CAT-01',
    'Xem yêu cầu mở rộng danh mục HRM đang chờ',
    'Approver/Group xem danh sách extension requests pending trước khi start/duyệt.',
    'LIKELY_IMPL',
    'GET extension-requests → XBOS-CAT-200; panel gov list.',
    {
      api: '`GET /api/xbos/catalog-governance/extension-requests` → **XBOS-CAT-200**',
      be: 'listPendingExtensionRequests',
      fe: 'hrm_catalog_governance / pending list',
      caps: [
        { id: 'CAP-01', name: 'Mở danh sách chờ', purpose: 'Thấy pending extensions', actor: P.gov },
        { id: 'CAP-02', name: 'Lọc/phạm vi', purpose: 'Đúng tenant', actor: P.gov },
        { id: 'CAP-03', name: 'Empty/error', purpose: 'U65 empty OK', actor: P.gov },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-LIST-EXT', name: 'List pending extension requests', ui: 'GET extension-requests', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-SCOPE', name: 'Scope tenant filter', ui: 'query tenantId', mutate: 'N' },
        { cap: 'CAP-03', id: 'FN-EMPTY', name: 'Empty & error states', ui: 'UI', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-LIST-EXT', 2, 1, 0, 2, 1],
        ['FN-SCOPE', 1, 1, 0, 1, 0],
        ['FN-EMPTY', 1, 1, 0, 0, 1],
      ],
    },
    [
      caseRow('TC-CAT01-LIST-HP-001', 'CAP-01', 'FN-LIST-EXT', 'HP', 'P0', P.gov, 'Request từ FE (UF-15)', '1. Mở panel / GET list', '200 XBOS-CAT-200; thấy batch', 'UI/API', 'UC-XBOS-CAT-01'),
      caseRow('TC-CAT01-LIST-HP-002', 'CAP-01', 'FN-LIST-EXT', 'HP', 'P0', P.gov, 'Request pending', '1. Click row', 'Highlight two-pane', 'UI', 'two-pane'),
      caseRow('TC-CAT01-LIST-FD-001', 'CAP-01', 'FN-LIST-EXT', 'FD', 'P0', P.gov, 'API down', '1. Mở', 'Banner — không mock', 'UI', 'FD'),
      caseRow('TC-CAT01-LIST-AU-001', 'CAP-01', 'FN-LIST-EXT', 'AU', 'P0', 'anonymous', '—', '1. GET', '401 XBOS-AUTH-001', 'API', 'AU'),
      caseRow('TC-CAT01-LIST-AU-002', 'CAP-01', 'FN-LIST-EXT', 'AU', 'P0', P.member, 'Member CEO', '1. List', 'Không thấy request CT khác', 'UI/API', 'AU'),
      caseRow('TC-CAT01-LIST-UX-001', 'CAP-01', 'FN-LIST-EXT', 'UX', 'P1', P.gov, 'Loading', '1. Mở', 'Loading rồi list', 'UI', 'UX'),
      caseRow('TC-CAT01-SCP-HP-001', 'CAP-02', 'FN-SCOPE', 'HP', 'P0', P.gov, 'Multi request', '1. Filter tenant', 'Đúng tập', 'API', 'scope'),
      caseRow('TC-CAT01-SCP-FD-001', 'CAP-02', 'FN-SCOPE', 'FD', 'P0', P.gov, 'tenantId rác', '1. GET', '4xx hoặc empty deterministic', 'API', 'FD'),
      caseRow('TC-CAT01-SCP-AU-001', 'CAP-02', 'FN-SCOPE', 'AU', 'P0', P.member, 'Member', '1. List all-tenant', 'Chỉ phạm vi cho phép', 'API', 'AU'),
      caseRow('TC-CAT01-EMP-HP-001', 'CAP-03', 'FN-EMPTY', 'HP', 'P0', P.gov, 'Chưa có request FE', '1. Mở', 'Empty — không seed', 'UI', 'U65'),
      caseRow('TC-CAT01-EMP-FD-001', 'CAP-03', 'FN-EMPTY', 'FD', 'P1', P.gov, '403 role', '1. Wrong role', 'Message quyền', 'UI', 'FD'),
      caseRow('TC-CAT01-EMP-UX-001', 'CAP-03', 'FN-EMPTY', 'UX', 'P1', P.gov, '—', '1. Hint HDSD', 'Copy tạo từ company_group_hr', 'UI', 'U76'),
    ],
  ),
);

ucs.push(
  cat(
    368,
    'UC-XBOS-CAT-02',
    'Khởi chạy quy trình phê duyệt danh mục',
    'Từ extension/batch đã có (tạo từ FE), start WF phê duyệt catalog.',
    'LIKELY_IMPL',
    'POST workflows/start → XBOS-CAT-211; TECHSPEC FR-XBOS-CAT-02 ALIGNED.',
    {
      api: '`POST /api/xbos/catalog-governance/workflows/start` → **XBOS-CAT-211**',
      be: 'startCatalogApprovalWorkflow',
      fe: 'Start từ gov panel / after apply',
      caps: [
        { id: 'CAP-01', name: 'Chọn batch chờ', purpose: 'Precond FE extension', actor: 'Requester/Gov' },
        { id: 'CAP-02', name: 'Start WF', purpose: 'Spawn instance+task', actor: 'System/User' },
        { id: 'CAP-03', name: 'Xác nhận inbox', purpose: 'Task xuất hiện', actor: P.gov },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-SELECT', name: 'Chọn batchId', ui: 'UI select', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-START', name: 'Start catalog approval WF', ui: 'POST workflows/start', mutate: 'Y' },
        { cap: 'CAP-03', id: 'FN-ASSERT-TASK', name: 'Assert task inbox', ui: 'GET inbox', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-SELECT', 1, 0, 0, 1, 1],
        ['FN-START', 1, 2, 0, 1, 1],
        ['FN-ASSERT-TASK', 1, 0, 0, 1, 1],
      ],
    },
    [
      caseRow('TC-CAT02-SEL-HP-001', 'CAP-01', 'FN-SELECT', 'HP', 'P0', P.ceo, 'Extension FE xong', '1. Chọn batch', 'UI sẵn Start', 'UI', 'UF-15'),
      caseRow('TC-CAT02-SEL-AU-001', 'CAP-01', 'FN-SELECT', 'AU', 'P0', P.member, 'Batch CT khác', '1. Chọn', 'Không cho', 'UI/API', 'AU'),
      caseRow('TC-CAT02-SEL-UX-001', 'CAP-01', 'FN-SELECT', 'UX', 'P1', P.ceo, 'Không batch', '1. Mở', 'Empty + hint FE create', 'UI', 'U65'),
      caseRow('TC-CAT02-ST-HP-001', 'CAP-02', 'FN-START', 'HP', 'P0', P.ceo, 'batchId hợp lệ FE', '1. Start WF', '211; instance+task; F5', 'UI/API', 'XBOS-CAT-211'),
      caseRow('TC-CAT02-ST-FD-001', 'CAP-02', 'FN-START', 'FD', 'P0', P.ceo, 'batchId giả', '1. Start', '4xx', 'API', 'FD'),
      caseRow('TC-CAT02-ST-FD-002', 'CAP-02', 'FN-START', 'FD', 'P0', P.ceo, 'Đã started', '1. Start lại', '4xx/BR idempotent', 'API', 'FD'),
      caseRow('TC-CAT02-ST-AU-001', 'CAP-02', 'FN-START', 'AU', 'P0', P.member, 'Sai memberCompanyId', '1. Start', '403/409', 'API', 'AU'),
      caseRow('TC-CAT02-ST-UX-001', 'CAP-02', 'FN-START', 'UX', 'P1', P.ceo, 'After start', '1. UI', 'Pending state; disable Start', 'UI', 'UX'),
      caseRow('TC-CAT02-AS-HP-001', 'CAP-03', 'FN-ASSERT-TASK', 'HP', 'P0', P.gov, 'Sau start FE', '1. GET inbox', '212; thấy task', 'UI/API', 'XBOS-CAT-212'),
      caseRow('TC-CAT02-AS-AU-001', 'CAP-03', 'FN-ASSERT-TASK', 'AU', 'P0', P.member, 'Member inbox', '1. List', 'Không thấy task CT khác', 'API', 'AU'),
      caseRow('TC-CAT02-AS-UX-001', 'CAP-03', 'FN-ASSERT-TASK', 'UX', 'P1', P.gov, 'Trước start', '1. Inbox', 'Empty OK', 'UI', 'U65'),
      caseRow('TC-CAT02-ST-HP-002', 'CAP-02', 'FN-START', 'HP', 'P1', P.ceo, 'HDSD', '1. Đúng nút khởi chạy', 'U76 align', 'UI', 'U76'),
      caseRow('TC-CAT02-SEL-HP-002', 'CAP-01', 'FN-SELECT', 'HP', 'P1', P.ceo, 'Multi batch', '1. Chọn đúng batch', 'Payload batchId khớp', 'UI/API', 'HP'),
      caseRow('TC-CAT02-ST-AU-002', 'CAP-02', 'FN-START', 'AU', 'P0', 'anonymous', '—', '1. POST start', '401', 'API', 'AU'),
    ],
  ),
);

ucs.push(
  cat(
    369,
    'UC-XBOS-CAT-03',
    'Xem hộp thư duyệt danh mục',
    'Approver xem inbox các task phê duyệt danh mục đang chờ.',
    'LIKELY_IMPL',
    'GET inbox → XBOS-CAT-212; FE CatalogGovernancePanel / CC inbox.',
    {
      api: '`GET /api/xbos/catalog-governance/inbox` → **XBOS-CAT-212**',
      be: 'listApprovalInbox',
      fe: 'SCR-CAT-GOV / inbox rail',
      caps: [
        { id: 'CAP-01', name: 'Mở inbox catalog', purpose: 'List tasks', actor: P.gov },
        { id: 'CAP-02', name: 'Phạm vi assignee', purpose: 'Chỉ task được gán', actor: P.gov },
        { id: 'CAP-03', name: 'Empty/loading', purpose: 'U65', actor: P.gov },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-INBOX', name: 'List catalog approval inbox', ui: 'GET inbox', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-ASSIGNEE', name: 'Filter assigneeUserId', ui: 'query/header', mutate: 'N' },
        { cap: 'CAP-03', id: 'FN-STATE', name: 'Empty/loading/error', ui: 'UI', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-INBOX', 2, 1, 0, 1, 1],
        ['FN-ASSIGNEE', 1, 0, 0, 1, 0],
        ['FN-STATE', 1, 1, 0, 0, 1],
      ],
    },
    [
      caseRow('TC-CAT03-INB-HP-001', 'CAP-01', 'FN-INBOX', 'HP', 'P0', P.gov, 'Task từ FE start', '1. Mở inbox catalog', '212; thấy thẻ', 'UI/API', 'UC-XBOS-CAT-03'),
      caseRow('TC-CAT03-INB-HP-002', 'CAP-01', 'FN-INBOX', 'HP', 'P0', P.gov, 'Có task', '1. Đọc title/priority', 'display-ready; vi-VN due', 'UI', 'BE-INBOX'),
      caseRow('TC-CAT03-INB-FD-001', 'CAP-01', 'FN-INBOX', 'FD', 'P0', P.gov, 'API 500', '1. Mở', 'Banner lỗi', 'UI', 'FD'),
      caseRow('TC-CAT03-INB-AU-001', 'CAP-01', 'FN-INBOX', 'AU', 'P0', 'anonymous', '—', '1. GET', '401', 'API', 'AU'),
      caseRow('TC-CAT03-INB-UX-001', 'CAP-01', 'FN-INBOX', 'UX', 'P1', P.gov, 'Loading', '1. Mở', 'Loading state', 'UI', 'UX'),
      caseRow('TC-CAT03-ASG-HP-001', 'CAP-02', 'FN-ASSIGNEE', 'HP', 'P0', P.gov, 'Multi assignee', '1. Filter user', 'Đúng tasks', 'API', 'assignee'),
      caseRow('TC-CAT03-ASG-AU-001', 'CAP-02', 'FN-ASSIGNEE', 'AU', 'P0', P.member, 'Member', '1. Inbox group', 'Không thấy task holding nếu không quyền', 'UI/API', 'AU'),
      caseRow('TC-CAT03-ST-HP-001', 'CAP-03', 'FN-STATE', 'HP', 'P0', P.gov, 'Chưa có task FE', '1. Mở', 'Empty U65', 'UI', 'U65'),
      caseRow('TC-CAT03-ST-FD-001', 'CAP-03', 'FN-STATE', 'FD', 'P1', P.gov, 'non-master blocked UI', '1. Mở từ member shell', 'Blocked message nếu BR', 'UI', 'XBOS-INBOX-CAT'),
      caseRow('TC-CAT03-ST-UX-001', 'CAP-03', 'FN-STATE', 'UX', 'P1', P.gov, '—', '1. Hint HDSD', 'U76 copy', 'UI', 'U76'),
      caseRow('TC-CAT03-INB-HP-003', 'CAP-01', 'FN-INBOX', 'HP', 'P1', P.gov, 'Deep link settings', '1. ?settings=hrm_catalog_governance', 'Đúng panel', 'UI', 'route'),
      caseRow('TC-CAT03-ASG-HP-002', 'CAP-02', 'FN-ASSIGNEE', 'HP', 'P1', P.gov, 'Header x-user-id', '1. GET', 'Default assignee hợp lệ', 'API', 'HP'),
    ],
  ),
);

ucs.push(
  cat(
    370,
    'UC-XBOS-CAT-04',
    'Xem chi tiết phiên duyệt danh mục',
    'Mở chi tiết instance/task để xem items và trạng thái trước khi duyệt.',
    'LIKELY_IMPL',
    'GET instances/:instanceId → XBOS-CAT-213.',
    {
      api: '`GET /api/xbos/catalog-governance/instances/:instanceId` → **XBOS-CAT-213**',
      be: 'getApprovalDetail',
      fe: 'Detail pane / drawer',
      caps: [
        { id: 'CAP-01', name: 'Mở chi tiết instance', purpose: 'Xem payload duyệt', actor: P.gov },
        { id: 'CAP-02', name: 'Scope/id validity', purpose: '404/403 đúng', actor: 'Hệ thống' },
        { id: 'CAP-03', name: 'UI states', purpose: 'loading/fail', actor: P.gov },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-DETAIL', name: 'GET approval detail', ui: 'GET instances/:id', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-ID-GUARD', name: 'Validate instanceId/scope', ui: 'API', mutate: 'N' },
        { cap: 'CAP-03', id: 'FN-DETAIL-UX', name: 'Loading/error detail', ui: 'UI', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-DETAIL', 2, 0, 0, 1, 1],
        ['FN-ID-GUARD', 0, 2, 0, 1, 0],
        ['FN-DETAIL-UX', 1, 1, 0, 0, 1],
      ],
    },
    [
      caseRow('TC-CAT04-DET-HP-001', 'CAP-01', 'FN-DETAIL', 'HP', 'P0', P.gov, 'Instance từ FE', '1. Mở chi tiết', '213; thấy items/status', 'UI/API', 'UC-XBOS-CAT-04'),
      caseRow('TC-CAT04-DET-HP-002', 'CAP-01', 'FN-DETAIL', 'HP', 'P0', P.gov, 'Có items', '1. Đọc field đề nghị', 'Đủ mã/label/CT', 'UI', 'HP'),
      caseRow('TC-CAT04-DET-AU-001', 'CAP-01', 'FN-DETAIL', 'AU', 'P0', P.member, 'Instance holding', '1. GET', '403/404 scope', 'API', 'AU'),
      caseRow('TC-CAT04-DET-UX-001', 'CAP-01', 'FN-DETAIL', 'UX', 'P1', P.gov, 'Loading', '1. Mở', 'Loading rồi content', 'UI', 'UX'),
      caseRow('TC-CAT04-ID-FD-001', 'CAP-02', 'FN-ID-GUARD', 'FD', 'P0', P.gov, 'id giả', '1. GET', '404', 'API', 'FD'),
      caseRow('TC-CAT04-ID-FD-002', 'CAP-02', 'FN-ID-GUARD', 'FD', 'P0', P.gov, 'id malformed', '1. GET', '400/404', 'API', 'FD'),
      caseRow('TC-CAT04-ID-AU-001', 'CAP-02', 'FN-ID-GUARD', 'AU', 'P0', 'anonymous', '—', '1. GET', '401', 'API', 'AU'),
      caseRow('TC-CAT04-UX-HP-001', 'CAP-03', 'FN-DETAIL-UX', 'HP', 'P0', P.gov, 'OK detail', '1. Quan sát actions', 'Nút Duyệt/Từ chối đúng state', 'UI', 'SM'),
      caseRow('TC-CAT04-UX-FD-001', 'CAP-03', 'FN-DETAIL-UX', 'FD', 'P0', P.gov, 'GET fail', '1. Mở', 'Fail state + retry', 'UI', 'FD'),
      caseRow('TC-CAT04-UX-UX-001', 'CAP-03', 'FN-DETAIL-UX', 'UX', 'P1', P.gov, 'Terminal instance', '1. Mở approved', 'Actions locked', 'UI', 'UX'),
      caseRow('TC-CAT04-DET-HP-003', 'CAP-01', 'FN-DETAIL', 'HP', 'P1', P.gov, 'Deep link instanceId', '1. Open URL', 'Đúng detail — L2.5', 'UI', 'J-XBOS-02'),
      caseRow('TC-CAT04-DET-AU-002', 'CAP-01', 'FN-DETAIL', 'AU', 'P0', P.member, 'Wrong company query', '1. GET', '403/409', 'API', 'AU'),
    ],
  ),
);

ucs.push(
  cat(
    371,
    'UC-XBOS-CAT-05',
    'Phê duyệt bước duyệt danh mục',
    'Approver phê duyệt bước → extension áp dụng; FE sau 2xx + F5.',
    'LIKELY_IMPL',
    'POST tasks/:taskId/approve → XBOS-CAT-201; FR-XBOS-CAT-05 ALIGNED.',
    {
      api: '`POST /api/xbos/catalog-governance/tasks/:taskId/approve` → **XBOS-CAT-201**',
      be: 'actOnTask approve',
      fe: 'POP-CAT-APPROVE · Phê duyệt',
      caps: [
        { id: 'CAP-01', name: 'Mở task actionable', purpose: 'Precond FE chain', actor: P.gov },
        { id: 'CAP-02', name: 'Phê duyệt', purpose: 'Approve step', actor: P.gov },
        { id: 'CAP-03', name: 'Hậu duyệt', purpose: 'Consumer + inbox', actor: 'HRM/XBOS' },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-OPEN-TASK', name: 'Mở task pending', ui: 'Inbox/detail', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-APPROVE', name: 'Approve catalog task', ui: 'POST approve', mutate: 'Y' },
        { cap: 'CAP-03', id: 'FN-POST', name: 'Verify apply + outbox', ui: 'FE F5 / consumer', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-OPEN-TASK', 1, 0, 0, 1, 1],
        ['FN-APPROVE', 2, 2, 0, 1, 1],
        ['FN-POST', 2, 0, 0, 1, 1],
      ],
    },
    [
      caseRow('TC-CAT05-OP-HP-001', 'CAP-01', 'FN-OPEN-TASK', 'HP', 'P0', P.gov, 'Task FE start', '1. Mở task', 'Actionable Duyệt', 'UI', 'UF-09'),
      caseRow('TC-CAT05-OP-AU-001', 'CAP-01', 'FN-OPEN-TASK', 'AU', 'P0', P.member, 'Không assignee', '1. Mở', 'Ẩn/403', 'UI/API', 'AU'),
      caseRow('TC-CAT05-OP-UX-001', 'CAP-01', 'FN-OPEN-TASK', 'UX', 'P1', P.gov, 'Empty', '1. Inbox', 'Empty — không seed', 'UI', 'U65'),
      caseRow('TC-CAT05-AP-HP-001', 'CAP-02', 'FN-APPROVE', 'HP', 'P0', P.gov, 'Pending', '1. Confirm Phê duyệt', '201; F5 outbox', 'UI/API', 'XBOS-CAT-201'),
      caseRow('TC-CAT05-AP-HP-002', 'CAP-02', 'FN-APPROVE', 'HP', 'P0', P.gov, 'Có review_note', '1. Approve + note', '201; note lưu', 'UI/API', 'HP'),
      caseRow('TC-CAT05-AP-FD-001', 'CAP-02', 'FN-APPROVE', 'FD', 'P0', P.gov, 'Đã approved', '1. Approve lại', '4xx', 'API', 'FD'),
      caseRow('TC-CAT05-AP-FD-002', 'CAP-02', 'FN-APPROVE', 'FD', 'P0', P.gov, 'taskId giả', '1. Approve', '404', 'API', 'FD'),
      caseRow('TC-CAT05-AP-AU-001', 'CAP-02', 'FN-APPROVE', 'AU', 'P0', P.member, 'Member approve', '1. POST', '403/409', 'API', 'AU'),
      caseRow('TC-CAT05-AP-UX-001', 'CAP-02', 'FN-APPROVE', 'UX', 'P1', P.gov, 'Dialog', '1. Cancel', 'Không API', 'UI', 'UX'),
      caseRow('TC-CAT05-POST-HP-001', 'CAP-03', 'FN-POST', 'HP', 'P0', P.ceo, 'Sau 201', '1. HRM settings consumer', 'Field/item áp dụng', 'UI/API', 'UF-15'),
      caseRow('TC-CAT05-POST-HP-002', 'CAP-03', 'FN-POST', 'HP', 'P0', P.gov, 'Sau 201', '1. Inbox F5', 'Task không còn pending', 'UI', 'AC'),
      caseRow('TC-CAT05-POST-AU-001', 'CAP-03', 'FN-POST', 'AU', 'P0', P.member, 'CT không gán', '1. Consumer', 'Không thấy item', 'UI', 'DM-08'),
      caseRow('TC-CAT05-POST-UX-001', 'CAP-03', 'FN-POST', 'UX', 'P1', P.gov, 'Success toast', '1. Quan sát', 'Toast + dialog đóng', 'UI', 'UX'),
      caseRow('TC-CAT05-AP-AU-002', 'CAP-02', 'FN-APPROVE', 'AU', 'P0', 'anonymous', '—', '1. POST', '401', 'API', 'AU'),
      caseRow('TC-CAT05-OP-HP-002', 'CAP-01', 'FN-OPEN-TASK', 'HP', 'P1', P.gov, 'HDSD', '1. Đúng nút Phê duyệt', 'U76', 'UI', 'U76'),
      caseRow('TC-CAT05-AP-HP-003', 'CAP-02', 'FN-APPROVE', 'HP', 'P1', P.gov, 'main→holding', '1. Approve với JWT main', '201 scope ADR', 'API', 'ADR C2'),
    ],
  ),
);

ucs.push(
  cat(
    372,
    'UC-XBOS-CAT-06',
    'Từ chối bước duyệt danh mục',
    'Approver từ chối kèm lý do; request không áp dụng; requester thấy trạng thái.',
    'LIKELY_IMPL',
    'POST tasks/:taskId/reject → XBOS-CAT-202; lý do theo API_CONTRACT.',
    {
      api: '`POST /api/xbos/catalog-governance/tasks/:taskId/reject` → **XBOS-CAT-202**',
      be: 'actOnTask reject',
      fe: 'POP-CAT-REJECT',
      caps: [
        { id: 'CAP-01', name: 'Mở task', purpose: 'Pending rejectable', actor: P.gov },
        { id: 'CAP-02', name: 'Từ chối', purpose: 'Reject + note', actor: P.gov },
        { id: 'CAP-03', name: 'Hậu từ chối', purpose: 'Không apply', actor: 'Requester' },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-OPEN-TASK', name: 'Mở task pending', ui: 'Inbox', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-REJECT', name: 'Reject catalog task', ui: 'POST reject', mutate: 'Y' },
        { cap: 'CAP-03', id: 'FN-POST', name: 'Verify not applied', ui: 'FE F5', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-OPEN-TASK', 1, 0, 0, 1, 1],
        ['FN-REJECT', 1, 2, 1, 1, 1],
        ['FN-POST', 1, 0, 0, 1, 1],
      ],
    },
    [
      caseRow('TC-CAT06-OP-HP-001', 'CAP-01', 'FN-OPEN-TASK', 'HP', 'P0', P.gov, 'Task FE', '1. Mở', 'Nút Từ chối', 'UI', 'UF-09'),
      caseRow('TC-CAT06-OP-AU-001', 'CAP-01', 'FN-OPEN-TASK', 'AU', 'P0', P.member, '—', '1. Mở', '403/ẩn', 'UI/API', 'AU'),
      caseRow('TC-CAT06-OP-UX-001', 'CAP-01', 'FN-OPEN-TASK', 'UX', 'P1', P.gov, 'Empty', '1. Inbox', 'Empty U65', 'UI', 'U65'),
      caseRow('TC-CAT06-RJ-HP-001', 'CAP-02', 'FN-REJECT', 'HP', 'P0', P.gov, 'Pending', '1. Từ chối + lý do ≥10', '202; F5 rejected', 'UI/API', 'XBOS-CAT-202'),
      caseRow('TC-CAT06-RJ-FD-001', 'CAP-02', 'FN-REJECT', 'FD', 'P0', P.gov, 'Pending', '1. Lý do ngắn', '4xx; vẫn pending', 'UI/API', 'API_CONTRACT'),
      caseRow('TC-CAT06-RJ-FD-002', 'CAP-02', 'FN-REJECT', 'FD', 'P0', P.gov, 'Terminal', '1. Reject lại', '4xx', 'API', 'FD'),
      caseRow('TC-CAT06-RJ-BD-001', 'CAP-02', 'FN-REJECT', 'BD', 'P1', P.gov, '—', '1. Lý do đúng 10 ký tự', '202', 'API', 'BD'),
      caseRow('TC-CAT06-RJ-AU-001', 'CAP-02', 'FN-REJECT', 'AU', 'P0', P.member, 'Member', '1. POST reject', '403/409', 'API', 'AU'),
      caseRow('TC-CAT06-RJ-UX-001', 'CAP-02', 'FN-REJECT', 'UX', 'P1', P.gov, 'Dialog destructive', '1. Cancel', 'Không API', 'UI', 'UX'),
      caseRow('TC-CAT06-POST-HP-001', 'CAP-03', 'FN-POST', 'HP', 'P0', P.ceo, 'Sau reject', '1. Consumer', 'Item không áp dụng', 'UI/API', 'AC'),
      caseRow('TC-CAT06-POST-AU-001', 'CAP-03', 'FN-POST', 'AU', 'P0', P.member, 'Requester', '1. Xem trạng thái', 'Thấy rejected + lý do trong scope', 'UI', 'AU'),
      caseRow('TC-CAT06-POST-UX-001', 'CAP-03', 'FN-POST', 'UX', 'P1', P.gov, 'Inbox', '1. F5', 'Task khỏi pending', 'UI', 'UX'),
      caseRow('TC-CAT06-RJ-AU-002', 'CAP-02', 'FN-REJECT', 'AU', 'P0', 'anonymous', '—', '1. POST', '401', 'API', 'AU'),
      caseRow('TC-CAT06-RJ-HP-002', 'CAP-02', 'FN-REJECT', 'HP', 'P1', P.gov, 'HDSD', '1. Đúng nút Từ chối', 'U76', 'UI', 'U76'),
    ],
  ),
);

ucs.push(
  cat(
    373,
    'UC-XBOS-CAT-07',
    'Khởi tạo quy trình duyệt danh mục mẫu (theo công ty)',
    'Đảm bảo WF definition mẫu catalog approval tồn tại theo công ty (vd. X.E Du lịch) trước khi chạy duyệt.',
    'LIKELY_PARTIAL',
    'POST workflows/seed-xe-du-lich-catalog → XBOS-CAT-210 tồn tại — **U65: không dùng seed làm evidence UAT**; case design kiểm soát quyền + FE preset tương đương.',
    {
      api: '`POST …/catalog-governance/workflows/seed-xe-du-lich-catalog` → **XBOS-CAT-210** (ops) · FE WF designer preset tương đương',
      be: 'ensureXeDuLichCatalogWorkflow',
      fe: 'WF designer tạo/preset wf_hrm_catalog_extension_* từ UI',
      caps: [
        { id: 'CAP-01', name: 'Chuẩn bị WF định nghĩa', purpose: 'Có def theo CT', actor: 'Admin/Gov' },
        { id: 'CAP-02', name: 'Khởi tạo mẫu', purpose: 'Ensure workflow def', actor: 'Admin' },
        { id: 'CAP-03', name: 'Sẵn sàng start', purpose: 'CAT-02 chạy được', actor: 'System' },
      ],
      fns: [
        { cap: 'CAP-01', id: 'FN-CHECK-DEF', name: 'Kiểm tra WF def tồn tại', ui: 'GET workflow defs', mutate: 'N' },
        { cap: 'CAP-02', id: 'FN-ENSURE', name: 'Tạo/ensure WF mẫu từ FE (ưu tiên) hoặc ops endpoint', ui: 'FE designer / seed endpoint', mutate: 'Y' },
        { cap: 'CAP-03', id: 'FN-READY', name: 'Verify có thể start CAT-02', ui: 'UI/API', mutate: 'N' },
      ],
      fnCounts: [
        ['FN-CHECK-DEF', 1, 0, 0, 1, 1],
        ['FN-ENSURE', 1, 1, 0, 1, 1],
        ['FN-READY', 1, 0, 0, 1, 1],
      ],
    },
    [
      caseRow('TC-CAT07-CHK-HP-001', 'CAP-01', 'FN-CHECK-DEF', 'HP', 'P0', P.ceo, 'Login', '1. Mở WF list / API defs', 'Thấy hoặc thiếu rõ ràng', 'UI/API', 'UC-XBOS-CAT-07'),
      caseRow('TC-CAT07-CHK-AU-001', 'CAP-01', 'FN-CHECK-DEF', 'AU', 'P0', P.member, 'Member', '1. List holding defs', 'Scope hạn chế', 'API', 'AU'),
      caseRow('TC-CAT07-CHK-UX-001', 'CAP-01', 'FN-CHECK-DEF', 'UX', 'P1', P.ceo, 'Empty defs', '1. Mở', 'Empty + CTA tạo', 'UI', 'U65'),
      caseRow('TC-CAT07-ENS-HP-001', 'CAP-02', 'FN-ENSURE', 'HP', 'P0', P.ceo, 'Thiếu def', '1. Tạo WF từ FE designer (preset catalog) theo HDSD', '201/2xx; def tồn tại; F5 — **không** dùng seed làm UAT evidence', 'UI/API', 'U65 · Primary CAT-DL neo'),
      caseRow('TC-CAT07-ENS-FD-001', 'CAP-02', 'FN-ENSURE', 'FD', 'P0', P.ceo, 'Payload invalid', '1. Lưu def thiếu bước', '4xx', 'UI/API', 'FD'),
      caseRow('TC-CAT07-ENS-AU-001', 'CAP-02', 'FN-ENSURE', 'AU', 'P0', P.member, 'Member seed/holding', '1. POST seed-xe-du-lich', '403/409 nếu không quyền', 'API', 'AU'),
      caseRow('TC-CAT07-ENS-UX-001', 'CAP-02', 'FN-ENSURE', 'UX', 'P1', P.ceo, 'After create', '1. List WF', 'Def hiển thị tên CT', 'UI', 'UX'),
      caseRow('TC-CAT07-RDY-HP-001', 'CAP-03', 'FN-READY', 'HP', 'P0', P.ceo, 'Def sẵn + extension FE', '1. Start CAT-02', '211 OK', 'UI/API', 'CAT-02 chain'),
      caseRow('TC-CAT07-RDY-AU-001', 'CAP-03', 'FN-READY', 'AU', 'P0', P.member, 'Def CT khác', '1. Start', '403/409', 'API', 'AU'),
      caseRow('TC-CAT07-RDY-UX-001', 'CAP-03', 'FN-READY', 'UX', 'P1', P.ceo, 'Def inactive', '1. Start', 'Message def không active', 'UI', 'UX'),
      caseRow('TC-CAT07-ENS-HP-002', 'CAP-02', 'FN-ENSURE', 'HP', 'P1', P.ceo, 'Idempotent', '1. Ensure lần 2', '200/210 không nhân bản lỗi', 'API', 'XBOS-CAT-210 ops-only note'),
      caseRow('TC-CAT07-CHK-HP-002', 'CAP-01', 'FN-CHECK-DEF', 'HP', 'P1', P.ceo, 'Theo công ty DL', '1. Filter company', 'Đúng def xe_du_lich', 'UI/API', 'company-scoped'),
      caseRow('TC-CAT07-ENS-AU-002', 'CAP-02', 'FN-ENSURE', 'AU', 'P0', 'anonymous', '—', '1. POST', '401', 'API', 'AU'),
      caseRow('TC-CAT07-RDY-HP-002', 'CAP-03', 'FN-READY', 'HP', 'P1', P.ceo, 'HDSD', '1. Menu WF → tạo mẫu', 'U76 path', 'UI', 'U76'),
    ],
  ),
);
ucs[ucs.length - 1].spec_gap = 'Seed endpoint là ops — UAT chỉ chấp nhận tạo def từ FE';

// Write files
fs.mkdirSync(path.join(root, '_squad'), { recursive: true });
const manifestRows = [];
let sum = 0;
for (const uc of ucs) {
  const { designed, body } = render(uc);
  const fileName = `${uc.id}.md`;
  fs.writeFileSync(path.join(root, fileName), body, 'utf8');
  manifestRows.push({ id: uc.id, stt: uc.stt, designed, readiness: uc.code_readiness, name: uc.name_vi });
  sum += designed;
  console.log('wrote', fileName, designed);
}

const byReadiness = {};
for (const r of manifestRows) {
  byReadiness[r.readiness] = (byReadiness[r.readiness] || 0) + 1;
}

const manifest = `# Manifest — Squad W1-S3-XBOS-CAT-TAIL

| Meta | Value |
|------|--------|
| **squad_id** | \`W1-S3-XBOS-CAT-TAIL\` |
| **work_item_id** | \`PO-UC-TC-W1-S3-XBOS-CAT\` |
| **from_role** | qa |
| **ack_status** | **READY_FOR_SYNTH** |
| **date** | 2026-08-04 |
| **scope STT** | 81–97 · 367–373 |
| **uc_count** | ${manifestRows.length} |
| **cases_designed_sum** | **${sum}** |
| **uat_done** | false (design only · U65) |
| **locks** | U65 zero-seed · HP+FD+AU trên catalog/extension/publish · srs_old+srs_new mapped |

## Inventory

| STT | uc_id | name_vi | cases_designed | code_readiness | file |
|----:|-------|---------|---------------:|----------------|------|
${manifestRows.map((r) => `| ${r.stt} | \`${r.id}\` | ${r.name} | ${r.designed} | ${r.readiness} | \`${r.id}.md\` |`).join('\n')}

## Case sum

| Metric | Value |
|--------|------:|
| UC files | ${manifestRows.length} |
| **Σ cases_designed** | **${sum}** |
| Avg cases / UC | ${(sum / manifestRows.length).toFixed(1)} |

## code_readiness rollup

| Verdict | UC count |
|---------|---------:|
${Object.entries(byReadiness)
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}

## Notes for Synth

- Neo depth packs (không đè): \`docs/qa/testcases/xbos/XBOS-CATALOG-CC.md\` · \`XBOS-INBOX-CAT.md\` · \`XBOS-CATALOG-MEMBER-MATRIX.md\`
- API runtime cite: \`catalog-governance.controller.ts\` (\`XBOS-CAT-200..213\`, \`XBOS-CFG-203\`, \`XBOS-CAT-210\`)
- \`XBOS-DM-09\` = **GAP** (clone API chưa neo) — giữ TC, không claim IMPL
- \`UC-XBOS-CAT-07\` seed endpoint = ops only; UAT path = FE WF designer
- Design ≠ UAT DONE

## Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S3-XBOS-CAT
uc_count: ${manifestRows.length}
cases_designed_sum: ${sum}
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S3-XBOS-CAT-TAIL_MANIFEST.md
\`\`\`
`;

fs.writeFileSync(path.join(root, '_squad', 'W1-S3-XBOS-CAT-TAIL_MANIFEST.md'), manifest, 'utf8');
console.log('MANIFEST cases_designed_sum=', sum, 'ucs=', manifestRows.length);
