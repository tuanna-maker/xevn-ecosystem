/**
 * PO-UC-TC-W1-S1-XBOS-CORE — generate UC TC files STT 1–40
 * Run: node docs/qa/professional/by-uc/_gen/w1-s1-generate.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..');
const SQUAD = path.join(OUT, '_squad');
const WI = 'PO-UC-TC-W1-S1-XBOS-CORE';
const AUTHOR = `ba-process · ${WI}`;
const SRS_OLD = '`BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có';
const SRS_NEW_XBOS = '`SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete)';
const SRS_NEW_NA = 'N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC';
const TS = '`docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01';

const P = {
  CEO: 'ceo@xe.vn (group CEO)',
  MEM: 'du-lich.ceo@xe.vn (member CEO)',
  ADM: 'TENANT_ADMIN / SUPER_ADMIN',
  API: 'service/admin JWT',
  EMP: 'EMPLOYEE (NV thường)',
  MGR: 'Manager có quyền inbox WF',
  REQ: 'Employee / requester',
};

function C(id, cap, fn, type, pri, persona, pre, steps, exp, layer, trace) {
  return { id, cap, fn, type, pri, persona, pre, steps, exp, layer, trace };
}

function fnTable(fns, cases) {
  const byFn = Object.fromEntries(fns.map((f) => [f.id, { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, Σ: 0 }]));
  for (const c of cases) {
    if (!byFn[c.fn]) byFn[c.fn] = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, Σ: 0 };
    byFn[c.fn][c.type]++;
    byFn[c.fn].Σ++;
  }
  let rows = '';
  const tot = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, Σ: 0 };
  for (const f of fns) {
    const s = byFn[f.id];
    for (const k of Object.keys(tot)) tot[k] += s[k];
    rows += `| ${f.id} | ${s.HP} | ${s.FD} | ${s.BD} | ${s.AU} | ${s.UX} | ${s.Σ} |\n`;
  }
  rows += `| **Tổng** | ${tot.HP} | ${tot.FD} | ${tot.BD} | ${tot.AU} | ${tot.UX} | **${tot.Σ}** |\n`;
  return { rows, total: tot.Σ };
}

function render(uc) {
  const { rows, total } = fnTable(uc.fns, uc.cases);
  const caps = uc.caps.map((c) => `| ${c.id} | ${c.name} | ${c.purpose} | ${c.actor} |`).join('\n');
  const fns = uc.fns.map((f) => `| ${f.cap} | ${f.id} | ${f.name} | ${f.ui} | ${f.mutate ? 'Y' : 'N'} |`).join('\n');
  const tcs = uc.cases
    .map(
      (c) =>
        `| ${c.id} | ${c.cap} | ${c.fn} | ${c.type} | ${c.pri} | ${c.persona} | ${c.pre} | ${c.steps} | ${c.exp} | ${c.layer} | ${c.trace} |`,
    )
    .join('\n');
  const mutateFns = uc.fns.filter((f) => f.mutate);
  const mutateOk =
    mutateFns.length === 0 ||
    mutateFns.every(
      (f) => uc.cases.some((c) => c.fn === f.id && c.type === 'HP') && uc.cases.some((c) => c.fn === f.id && c.type === 'FD'),
    );
  const capsOk = uc.caps.every((c) => uc.fns.some((f) => f.cap === c.id));

  return `# UC — \`${uc.id}\` · ${uc.name}

| Meta | Value |
|------|--------|
| **uc_id** | \`${uc.id}\` |
| **stt_phase1** | ${uc.stt} |
| **mod** | M01 |
| **name_vi** | ${uc.name} |
| **actors** | ${uc.actors} |
| **surfaces** | ${uc.surfaces} |
| **srs_old** | ${SRS_OLD} · STT ${uc.stt} |
| **srs_new** | ${uc.srs_new} |
| **tech_spec** | ${TS} |
| **api_contract** | ${uc.api} |
| **author** | ${AUTHOR} |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | \`${uc.code}\` |
| **code_note** | ${uc.code_note} |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. \`uat_done: false\`.

---

## 1. Mục tiêu UC (1 đoạn)

${uc.goal}

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
${caps}

**Đếm nghiệp vụ:** ${uc.caps.length}

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
${fns}

**Đếm chức năng:** ${uc.fns.length}

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
${rows}

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
${tcs}

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | ${capsOk ? 'Yes' : 'No'} | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | ${mutateFns.length === 0 ? 'N/A (read-only)' : mutateOk ? 'Yes' : 'Partial'} | — |
| Auth/scope nếu đa CT | ${uc.cases.some((c) => c.type === 'AU') ? 'Yes' : 'Optional'} | ${uc.cases.some((c) => c.type === 'AU') ? 'Yes' : '—'} | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ${uc.code_note} | \`apps/api/xbos-api/src/**\` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | \`apps/web\` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** \`${uc.code}\` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
uc_id: ${uc.id}
cases_designed: ${total}
code_readiness: ${uc.code}
\`\`\`
`;
}

function mdDomain(stt, id, nameVi, domainKey) {
  const tag = id.replace(/UC-/, '');
  return {
    id,
    stt,
    name: nameVi,
    actors: 'Group admin · Master data steward',
    surfaces: 'web-portal / xbos-cc / api',
    srs_new: SRS_NEW_NA + ' · TECHSPEC M01-Master',
    api: `GET/PUT/DELETE \`/api/xbos/business-master/${domainKey}/items*\` · domain whitelist`,
    code: 'LIKELY_IMPL',
    code_note: `BE \`business-master.controller.ts\` domain \`${domainKey}\`; FE Settings/master theo TECHSPEC.`,
    goal: `Quản lý master «${nameVi}» (list/upsert/xóa mềm) theo domain business-master, đúng scope pháp nhân.`,
    caps: [
      { id: 'CAP-MD-01', name: 'Xem danh sách', purpose: 'Liệt kê items domain', actor: 'Admin' },
      { id: 'CAP-MD-02', name: 'Thêm/sửa', purpose: 'Upsert item', actor: 'Admin' },
      { id: 'CAP-MD-03', name: 'Ngừng/xóa mềm', purpose: 'Không hard-delete sai', actor: 'Admin' },
      { id: 'CAP-MD-04', name: 'Phạm vi công ty', purpose: 'Không lộ/ghi ngoài scope', actor: 'Hệ thống' },
    ],
    fns: [
      { cap: 'CAP-MD-01', id: 'FN-MD-LIST', name: 'List items', ui: `GET …/${domainKey}/items`, mutate: false },
      { cap: 'CAP-MD-02', id: 'FN-MD-UPSERT', name: 'Create/Update item', ui: 'PUT item / form Lưu', mutate: true },
      { cap: 'CAP-MD-03', id: 'FN-MD-DELETE', name: 'Soft delete / deactivate', ui: 'DELETE item', mutate: true },
      { cap: 'CAP-MD-04', id: 'FN-MD-SCOPE', name: 'Scope check', ui: 'company_id + JWT', mutate: false },
    ],
    cases: [
      C(`TC-${tag}-LIST-HP-001`, 'CAP-MD-01', 'FN-MD-LIST', 'HP', 'P0', P.CEO, 'đã login', '1. Mở màn master tương ứng · 2. Xem lưới', '200 · lưới hiển thị · không banner ERROR', 'UI/API', `${id} · business-master`),
      C(`TC-${tag}-LIST-UX-001`, 'CAP-MD-01', 'FN-MD-LIST', 'UX', 'P0', P.CEO, 'domain trống', '1. Mở list', 'empty hợp lệ · không storm reload', 'UI', 'U65'),
      C(`TC-${tag}-UPSERT-HP-001`, 'CAP-MD-02', 'FN-MD-UPSERT', 'HP', 'P0', P.CEO, 'form', '1. Thêm item mã/tên hợp lệ · Lưu', '2xx · row mới · F5 còn', 'UI/API', 'mutate FE'),
      C(`TC-${tag}-UPSERT-FD-001`, 'CAP-MD-02', 'FN-MD-UPSERT', 'FD', 'P0', P.CEO, 'form', '1. Lưu thiếu mã', '4xx · không tạo row', 'UI/API', 'validate'),
      C(`TC-${tag}-UPSERT-FD-002`, 'CAP-MD-02', 'FN-MD-UPSERT', 'FD', 'P0', P.CEO, 'đã có mã', '1. Tạo trùng mã', '4xx conflict/business', 'API', 'unique'),
      C(`TC-${tag}-UPSERT-HP-002`, 'CAP-MD-02', 'FN-MD-UPSERT', 'HP', 'P1', P.CEO, 'item tồn tại', '1. Sửa tên · Lưu', '2xx · F5 tên mới', 'UI/API', 'update'),
      C(`TC-${tag}-DEL-HP-001`, 'CAP-MD-03', 'FN-MD-DELETE', 'HP', 'P0', P.CEO, 'item không bị khóa', '1. Ngừng/xóa mềm', '2xx · không còn active · F5', 'UI/API', 'soft-delete'),
      C(`TC-${tag}-DEL-FD-001`, 'CAP-MD-03', 'FN-MD-DELETE', 'FD', 'P1', P.CEO, 'item đang được tham chiếu', '1. Xóa', '4xx/blocked rõ', 'API', 'FK guard'),
      C(`TC-${tag}-SCOPE-AU-001`, 'CAP-MD-04', 'FN-MD-SCOPE', 'AU', 'P0', P.MEM, 'member', '1. List/ghi domain holding', '403/409 hoặc chỉ data CT mình', 'API', 'scope'),
      C(`TC-${tag}-UPSERT-BD-001`, 'CAP-MD-02', 'FN-MD-UPSERT', 'BD', 'P1', P.CEO, '—', '1. Tên dài biên / ký tự đặc biệt', 'validate rõ', 'UI', 'BD'),
      C(`TC-${tag}-UPSERT-AU-001`, 'CAP-MD-02', 'FN-MD-UPSERT', 'AU', 'P0', P.EMP, 'NV', '1. PUT item', '403', 'API', 'RBAC'),
      C(`TC-${tag}-LIST-HP-002`, 'CAP-MD-01', 'FN-MD-LIST', 'HP', 'P1', P.CEO, 'nhiều trang', '1. Đổi page size', 'phân trang đúng', 'UI', 'UX'),
    ],
  };
}

const ucs = [];

ucs.push({
  id: 'UC-XBOS-01',
  stt: 1,
  name: 'Kiểm tra trạng thái dịch vụ',
  actors: 'Ops · DevOps · Portal proxy',
  surfaces: 'api',
  srs_new: SRS_NEW_XBOS + ' · NFR sẵn sàng dịch vụ',
  api: 'GET `/api/xbos` → `XBOS-HEALTH-200` · `app.controller.ts`',
  code: 'LIKELY_IMPL',
  code_note: 'BE: `apps/api/xbos-api/src/app.controller.ts` getHello trả ok + XBOS-HEALTH-200.',
  goal: 'Xác nhận dịch vụ XBOS API sẵn sàng phục vụ (health) trước mọi luồng nghiệp vụ portal/proxy.',
  caps: [
    { id: 'CAP-H-01', name: 'Kiểm tra sống dịch vụ', purpose: 'API phản hồi 2xx đúng mã', actor: 'Ops' },
    { id: 'CAP-H-02', name: 'Phân biệt lỗi hạ tầng', purpose: 'Down vs lỗi nghiệp vụ', actor: 'Ops' },
  ],
  fns: [
    { cap: 'CAP-H-01', id: 'FN-HEALTH-GET', name: 'GET health root', ui: 'GET /api/xbos', mutate: false },
    { cap: 'CAP-H-02', id: 'FN-HEALTH-PROXY', name: 'Portal proxy tới XBOS', ui: 'Vite/nginx proxy', mutate: false },
  ],
  cases: [
    C('TC-XBOS-01-HEALTH-HP-001', 'CAP-H-01', 'FN-HEALTH-GET', 'HP', 'P0', P.API, 'xbos-api đang chạy', '1. GET /api/xbos', '200 · mã XBOS-HEALTH-200 · status ok', 'API', 'matrix UC-XBOS-01'),
    C('TC-XBOS-01-HEALTH-UX-001', 'CAP-H-01', 'FN-HEALTH-GET', 'UX', 'P0', P.API, 'service dừng', '1. GET /api/xbos', 'ECONNREFUSED / 502 — không giả 200', 'API', 'qc:dev-stack'),
    C('TC-XBOS-01-HEALTH-AU-001', 'CAP-H-01', 'FN-HEALTH-GET', 'AU', 'P1', P.API, 'không JWT', '1. GET /api/xbos không auth', '200 nếu public health AS-IS hoặc 401 nếu đổi policy — ghi thực tế', 'API', 'SRS_VN NFR'),
    C('TC-XBOS-01-PROXY-HP-001', 'CAP-H-02', 'FN-HEALTH-PROXY', 'HP', 'P0', P.CEO, 'portal + API up', '1. Mở portal · DevTools /api/xbos', '2xx qua proxy · không banner Sync ERROR', 'UI/API', 'L0'),
    C('TC-XBOS-01-PROXY-FD-001', 'CAP-H-02', 'FN-HEALTH-PROXY', 'FD', 'P0', P.CEO, 'API down', '1. Reload màn dùng XBOS', 'UI báo lỗi kết nối rõ · không data giả', 'UI', 'U65'),
  ],
});

ucs.push({
  id: 'UC-XBOS-02',
  stt: 2,
  name: 'Khởi tạo hoặc cập nhật danh mục dùng chung',
  actors: 'Group admin · Config sync',
  surfaces: 'api / xbos-cc',
  srs_new: SRS_NEW_XBOS + ' · kế thừa catalog',
  api: 'POST publish / apply-to-members · `config-sync.controller.ts`',
  code: 'LIKELY_IMPL',
  code_note: 'BE config-sync publish/apply; FE CC Hạ tầng danh mục.',
  goal: 'Khởi tạo hoặc cập nhật bản ghi danh mục dùng chung đúng khóa catalog và phân hệ đích.',
  caps: [
    { id: 'CAP-CAT-01', name: 'Upsert danh mục', purpose: 'Tạo/cập nhật giá trị catalog', actor: 'Admin' },
    { id: 'CAP-CAT-02', name: 'Bảo vệ platform-owned', purpose: 'Không xóa cứng giá trị nền tảng', actor: 'Hệ thống' },
    { id: 'CAP-CAT-03', name: 'Phạm vi tenant', purpose: 'Ghi đúng tenant/company', actor: 'Admin' },
  ],
  fns: [
    { cap: 'CAP-CAT-01', id: 'FN-CAT-UPSERT', name: 'Khởi tạo/cập nhật catalog', ui: 'API / CC Lưu', mutate: true },
    { cap: 'CAP-CAT-01', id: 'FN-CAT-VALIDATE', name: 'Validate payload', ui: 'API 4xx', mutate: true },
    { cap: 'CAP-CAT-02', id: 'FN-CAT-PLATFORM-GUARD', name: 'Chặn hard-delete platform', ui: 'API reject', mutate: true },
    { cap: 'CAP-CAT-03', id: 'FN-CAT-SCOPE', name: 'Scope tenant/company', ui: 'JWT headers', mutate: false },
  ],
  cases: [
    C('TC-XBOS-02-UPSERT-HP-001', 'CAP-CAT-01', 'FN-CAT-UPSERT', 'HP', 'P0', P.CEO, 'đã login group', '1. Mở Hạ tầng / danh mục · 2. Sửa 1 giá trị · 3. Lưu', '2xx · FE cập nhật · F5 còn', 'UI/API', 'UC-XBOS-02'),
    C('TC-XBOS-02-UPSERT-HP-002', 'CAP-CAT-01', 'FN-CAT-UPSERT', 'HP', 'P1', P.API, 'JWT admin', '1. API upsert hợp lệ', '201/200 · body có key', 'API', 'config-sync'),
    C('TC-XBOS-02-UPSERT-FD-001', 'CAP-CAT-01', 'FN-CAT-VALIDATE', 'FD', 'P0', P.CEO, 'form mở', '1. Lưu thiếu mã bắt buộc', '4xx · toast lỗi · không ghi', 'UI/API', 'validate'),
    C('TC-XBOS-02-UPSERT-FD-002', 'CAP-CAT-01', 'FN-CAT-VALIDATE', 'FD', 'P0', P.API, '—', '1. catalogKey lạ', '4xx deterministic', 'API', 'BR'),
    C('TC-XBOS-02-UPSERT-BD-001', 'CAP-CAT-01', 'FN-CAT-VALIDATE', 'BD', 'P1', P.CEO, '—', '1. mã độ dài 0 / max', '0 → lỗi; max → OK hoặc lỗi rõ', 'UI', 'BD'),
    C('TC-XBOS-02-GUARD-FD-001', 'CAP-CAT-02', 'FN-CAT-PLATFORM-GUARD', 'FD', 'P0', P.ADM, 'item platform-owned', '1. Thử xóa cứng', 'reject · soft-only · SRS_VN §2', 'API', 'platform'),
    C('TC-XBOS-02-SCOPE-AU-001', 'CAP-CAT-03', 'FN-CAT-SCOPE', 'AU', 'P0', P.MEM, 'member JWT', '1. Upsert catalog tập đoàn ngoài quyền', '403/409 · không ghi holding', 'API', 'scope'),
    C('TC-XBOS-02-UPSERT-UX-001', 'CAP-CAT-01', 'FN-CAT-UPSERT', 'UX', 'P1', P.CEO, 'list trống hợp lệ', '1. Mở màn danh mục', 'empty hợp lệ · không storm', 'UI', 'U65'),
    C('TC-XBOS-02-UPSERT-FD-003', 'CAP-CAT-01', 'FN-CAT-UPSERT', 'FD', 'P1', P.CEO, 'API 500', '1. Lưu khi lỗi server', 'banner lỗi · không toast success giả', 'UI', 'reliability'),
    C('TC-XBOS-02-UPSERT-AU-001', 'CAP-CAT-03', 'FN-CAT-UPSERT', 'AU', 'P0', P.EMP, 'NV thường', '1. Gọi upsert', '403', 'API', 'RBAC'),
  ],
});

ucs.push({
  id: 'UC-XBOS-03',
  stt: 3,
  name: 'Lấy danh mục theo tên danh mục và phân hệ đích',
  actors: 'Consumer API (HRM/XBOS FE)',
  surfaces: 'api',
  srs_new: SRS_NEW_XBOS,
  api: 'GET `/api/xbos/config-sync/catalog/:catalogKey`',
  code: 'LIKELY_IMPL',
  code_note: '`config-sync.controller.ts` GET catalog/:catalogKey.',
  goal: 'Consumer lấy đúng payload danh mục theo catalogKey và phân hệ đích đã gán.',
  caps: [
    { id: 'CAP-GET-01', name: 'Đọc theo khóa', purpose: 'Trả đúng catalog', actor: 'API client' },
    { id: 'CAP-GET-02', name: 'Lọc phân hệ', purpose: 'Chỉ dữ liệu gán module đích', actor: 'API client' },
  ],
  fns: [
    { cap: 'CAP-GET-01', id: 'FN-CAT-GET', name: 'GET catalog by key', ui: 'GET catalog/:key', mutate: false },
    { cap: 'CAP-GET-02', id: 'FN-CAT-GET-TARGET', name: 'GET kèm target module', ui: 'query target', mutate: false },
  ],
  cases: [
    C('TC-XBOS-03-GET-HP-001', 'CAP-GET-01', 'FN-CAT-GET', 'HP', 'P0', P.API, 'catalog đã publish', '1. GET catalogKey hợp lệ', '200 · items khớp key', 'API', 'UC-XBOS-03'),
    C('TC-XBOS-03-GET-FD-001', 'CAP-GET-01', 'FN-CAT-GET', 'FD', 'P0', P.API, '—', '1. GET key không tồn tại', '404/4xx rõ mã', 'API', ''),
    C('TC-XBOS-03-GET-AU-001', 'CAP-GET-01', 'FN-CAT-GET', 'AU', 'P0', P.MEM, 'member', '1. GET catalog ngoài scope', '403/409 hoặc empty theo policy', 'API', 'scope'),
    C('TC-XBOS-03-TGT-HP-001', 'CAP-GET-02', 'FN-CAT-GET-TARGET', 'HP', 'P0', P.API, 'đã gán HRM', '1. GET kèm target=hrm', 'chỉ items thuộc gán HRM', 'API', 'TECHSPEC'),
    C('TC-XBOS-03-TGT-FD-001', 'CAP-GET-02', 'FN-CAT-GET-TARGET', 'FD', 'P1', P.API, '—', '1. target không hỗ trợ', '4xx', 'API', ''),
    C('TC-XBOS-03-GET-UX-001', 'CAP-GET-01', 'FN-CAT-GET', 'UX', 'P1', P.API, 'catalog rỗng', '1. GET key hợp lệ empty', '200 + [] · không 500', 'API', 'empty OK'),
  ],
});

ucs.push({
  id: 'UC-XBOS-04',
  stt: 4,
  name: 'Liệt kê danh mục theo phân hệ đích',
  actors: 'Admin · Consumer',
  surfaces: 'api / xbos-cc',
  srs_new: SRS_NEW_XBOS,
  api: 'GET `/api/xbos/config-sync/catalogs`',
  code: 'LIKELY_IMPL',
  code_note: 'GET catalogs trong config-sync.controller.ts.',
  goal: 'Liệt kê các danh mục đã gán cho một phân hệ đích để vận hành/đồng bộ.',
  caps: [{ id: 'CAP-LIST-01', name: 'Liệt kê theo đích', purpose: 'Thấy đủ catalog của module', actor: 'Admin' }],
  fns: [{ cap: 'CAP-LIST-01', id: 'FN-CAT-LIST', name: 'List catalogs by target', ui: 'GET catalogs', mutate: false }],
  cases: [
    C('TC-XBOS-04-LIST-HP-001', 'CAP-LIST-01', 'FN-CAT-LIST', 'HP', 'P0', P.CEO, 'đã có gán', '1. Mở tổng quan danh mục theo phân hệ / GET', 'danh sách ≥0 · không ERROR banner', 'UI/API', 'UC-XBOS-04'),
    C('TC-XBOS-04-LIST-FD-001', 'CAP-LIST-01', 'FN-CAT-LIST', 'FD', 'P1', P.API, '—', '1. target thiếu/sai', '4xx', 'API', ''),
    C('TC-XBOS-04-LIST-AU-001', 'CAP-LIST-01', 'FN-CAT-LIST', 'AU', 'P0', P.MEM, 'member', '1. List holding-only', 'không lộ catalog ngoài quyền', 'API', 'RBAC'),
    C('TC-XBOS-04-LIST-UX-001', 'CAP-LIST-01', 'FN-CAT-LIST', 'UX', 'P0', P.CEO, 'chưa gán', '1. Mở list', 'empty hợp lệ', 'UI', 'U65'),
    C('TC-XBOS-04-LIST-HP-002', 'CAP-LIST-01', 'FN-CAT-LIST', 'HP', 'P1', P.API, 'nhiều module', '1. Đổi filter target hrm vs xbos', 'kết quả khác nhau đúng gán', 'API', ''),
  ],
});

ucs.push({
  id: 'UC-XBOS-05',
  stt: 5,
  name: 'Phát hành phiên bản hợp đồng dữ liệu',
  actors: 'Group admin catalog governance',
  surfaces: 'api / xbos-cc',
  srs_new: SRS_NEW_XBOS + ' · sự kiện CATALOG_UPDATED',
  api: 'POST catalog publish · config-sync + catalog-governance',
  code: 'LIKELY_IMPL',
  code_note: 'POST publish trên config-sync + catalog-governance.controller.ts.',
  goal: 'Phát hành phiên bản hợp đồng dữ liệu danh mục để consumer kéo bản ổn định.',
  caps: [
    { id: 'CAP-PUB-01', name: 'Phát hành phiên bản', purpose: 'Đóng băng + tăng version', actor: 'Admin' },
    { id: 'CAP-PUB-02', name: 'Thông báo consumer', purpose: 'Sự kiện sau publish', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-PUB-01', id: 'FN-CAT-PUBLISH', name: 'Publish version', ui: 'Nút Phát hành / POST', mutate: true },
    { cap: 'CAP-PUB-01', id: 'FN-CAT-PUBLISH-VAL', name: 'Validate trước publish', ui: 'API', mutate: true },
    { cap: 'CAP-PUB-02', id: 'FN-CAT-PUBLISH-EVT', name: 'Emit CATALOG_UPDATED', ui: 'event bus', mutate: true },
  ],
  cases: [
    C('TC-XBOS-05-PUB-HP-001', 'CAP-PUB-01', 'FN-CAT-PUBLISH', 'HP', 'P0', P.CEO, 'có thay đổi draft', '1. Phát hành phiên bản', '2xx · version tăng · FE hiện version · F5', 'UI/API', 'UC-XBOS-05'),
    C('TC-XBOS-05-PUB-FD-001', 'CAP-PUB-01', 'FN-CAT-PUBLISH-VAL', 'FD', 'P0', P.CEO, 'draft invalid', '1. Publish thiếu field', '4xx · không tăng version', 'API', 'validate'),
    C('TC-XBOS-05-PUB-FD-002', 'CAP-PUB-01', 'FN-CAT-PUBLISH', 'FD', 'P0', P.CEO, 'không đổi', '1. Publish lại y chang', 'idempotent OK hoặc 4xx business — AS-IS', 'API', 'idempotency'),
    C('TC-XBOS-05-PUB-AU-001', 'CAP-PUB-01', 'FN-CAT-PUBLISH', 'AU', 'P0', P.MEM, 'member', '1. Publish catalog tập đoàn', '403/409', 'API', 'scope'),
    C('TC-XBOS-05-PUB-AU-002', 'CAP-PUB-01', 'FN-CAT-PUBLISH', 'AU', 'P0', P.EMP, 'NV', '1. POST publish', '403', 'API', 'RBAC'),
    C('TC-XBOS-05-EVT-HP-001', 'CAP-PUB-02', 'FN-CAT-PUBLISH-EVT', 'HP', 'P1', P.API, 'sau publish OK', '1. Quan sát outbox/event', 'CATALOG_UPDATED hoặc tương đương', 'API', 'SRS_VN §7'),
    C('TC-XBOS-05-EVT-FD-001', 'CAP-PUB-02', 'FN-CAT-PUBLISH-EVT', 'FD', 'P2', P.API, 'broker down', '1. Publish khi event fail', 'DB OK + retry/DLQ', 'API', 'NFR'),
    C('TC-XBOS-05-PUB-UX-001', 'CAP-PUB-01', 'FN-CAT-PUBLISH', 'UX', 'P1', P.CEO, 'đang publish', '1. Double-click Phát hành', 'không 2 version lệch · UI locked', 'UI', 'UX'),
    C('TC-XBOS-05-PUB-BD-001', 'CAP-PUB-01', 'FN-CAT-PUBLISH-VAL', 'BD', 'P2', P.API, 'nhiều lần', '1. Publish liên tiếp', 'version tăng đơn điệu', 'API', 'BD'),
  ],
});

ucs.push({
  id: 'UC-XBOS-06',
  stt: 6,
  name: 'Truy vấn nhật ký kiểm toán',
  actors: 'Auditor · Admin',
  surfaces: 'api',
  srs_new: SRS_NEW_XBOS + ' · audit append-only',
  api: 'GET platform audit events · `platform-audit.controller.ts`',
  code: 'LIKELY_IMPL',
  code_note: '`platform-audit.controller.ts` GET events.',
  goal: 'Truy vấn nhật ký kiểm toán append-only theo bộ lọc thời gian/đối tượng.',
  caps: [
    { id: 'CAP-AUD-01', name: 'Tra cứu audit', purpose: 'Xem sự kiện đã ghi', actor: 'Auditor' },
    { id: 'CAP-AUD-02', name: 'Bảo vệ truy cập', purpose: 'Chỉ role được phép', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-AUD-01', id: 'FN-AUD-LIST', name: 'List audit events', ui: 'GET events', mutate: false },
    { cap: 'CAP-AUD-02', id: 'FN-AUD-AUTH', name: 'Auth audit query', ui: 'JWT', mutate: false },
  ],
  cases: [
    C('TC-XBOS-06-LIST-HP-001', 'CAP-AUD-01', 'FN-AUD-LIST', 'HP', 'P0', P.ADM, 'đã có sự kiện', '1. GET events from/to', '200 · sort thời gian', 'API', 'SRS_VN audit'),
    C('TC-XBOS-06-LIST-FD-001', 'CAP-AUD-01', 'FN-AUD-LIST', 'FD', 'P1', P.ADM, '—', '1. from > to', '4xx', 'API', 'validate'),
    C('TC-XBOS-06-LIST-BD-001', 'CAP-AUD-01', 'FN-AUD-LIST', 'BD', 'P1', P.ADM, '—', '1. Khoảng rất rộng', 'paginate/limit · không timeout vô hạn', 'API', 'NFR'),
    C('TC-XBOS-06-AUTH-AU-001', 'CAP-AUD-02', 'FN-AUD-AUTH', 'AU', 'P0', P.EMP, 'NV', '1. GET events', '403', 'API', 'RBAC'),
    C('TC-XBOS-06-LIST-UX-001', 'CAP-AUD-01', 'FN-AUD-LIST', 'UX', 'P1', P.ADM, 'không sự kiện', '1. GET khoảng trống', '200 + []', 'API', 'empty'),
    C('TC-XBOS-06-LIST-HP-002', 'CAP-AUD-01', 'FN-AUD-LIST', 'HP', 'P1', P.ADM, 'sau mutate FE', '1. Mutate hợp lệ từ FE · 2. Query audit', 'có event append-only', 'API', 'U65 chuỗi FE'),
  ],
});

ucs.push({
  id: 'UC-XBOS-07',
  stt: 7,
  name: 'Tiếp nhận cảnh báo từ phân hệ vệ tinh',
  actors: 'Satellite service · XBOS alerts',
  surfaces: 'api',
  srs_new: SRS_NEW_NA,
  api: 'POST `/api/xbos/alerts/violation-ingest` · `alerts.controller.ts`',
  code: 'LIKELY_IMPL',
  code_note: '`alerts.controller.ts` violation-ingest.',
  goal: 'Tiếp nhận cảnh báo/vi phạm từ phân hệ vệ tinh vào XBOS để hiển thị điều hành.',
  caps: [
    { id: 'CAP-AL-01', name: 'Ingest cảnh báo', purpose: 'Nhận payload vệ tinh', actor: 'Satellite' },
    { id: 'CAP-AL-02', name: 'Xác thực nguồn', purpose: 'Chỉ nguồn ủy quyền', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-AL-01', id: 'FN-AL-INGEST', name: 'POST violation-ingest', ui: 'API', mutate: true },
    { cap: 'CAP-AL-02', id: 'FN-AL-AUTH', name: 'Internal auth ingest', ui: 'header internal', mutate: false },
  ],
  cases: [
    C('TC-XBOS-07-ING-HP-001', 'CAP-AL-01', 'FN-AL-INGEST', 'HP', 'P0', P.API, 'internal auth OK', '1. POST payload hợp lệ', '2xx · lưu/queue alert', 'API', 'UC-XBOS-07'),
    C('TC-XBOS-07-ING-FD-001', 'CAP-AL-01', 'FN-AL-INGEST', 'FD', 'P0', P.API, '—', '1. Thiếu field bắt buộc', '4xx', 'API', 'validate'),
    C('TC-XBOS-07-ING-FD-002', 'CAP-AL-01', 'FN-AL-INGEST', 'FD', 'P1', P.API, '—', '1. enum severity sai', '4xx', 'API', ''),
    C('TC-XBOS-07-AUTH-AU-001', 'CAP-AL-02', 'FN-AL-AUTH', 'AU', 'P0', 'anonymous', 'không internal key', '1. POST public', '401/403', 'API', 'internal-auth'),
    C('TC-XBOS-07-ING-BD-001', 'CAP-AL-01', 'FN-AL-INGEST', 'BD', 'P2', P.API, '—', '1. message cực dài', 'cắt/reject · không 500', 'API', 'BD'),
    C('TC-XBOS-07-ING-UX-001', 'CAP-AL-01', 'FN-AL-INGEST', 'UX', 'P1', P.CEO, 'sau ingest', '1. Mở CC cảnh báo (nếu wire)', 'thấy alert hoặc SPEC_GAP FE ghi rõ', 'UI', 'CC alerts'),
  ],
});

ucs.push({
  id: 'UC-XBOS-SYNC-01',
  stt: 8,
  name: 'Bootstrap hệ sinh thái XEVN (danh mục nền)',
  actors: 'DevOps · Platform admin',
  surfaces: 'api',
  srs_new: SRS_NEW_NA + ' · TECHSPEC bootstrap env',
  api: 'POST `/api/xbos/config-sync/bootstrap-xevn`',
  code: 'LIKELY_IMPL',
  code_note: '`config-sync.controller.ts` bootstrap-xevn — **không** dùng làm evidence UAT U65.',
  goal: 'Bootstrap danh mục nền khi môi trường trống (ops) — tách khỏi nghiệm thu FE.',
  caps: [
    { id: 'CAP-BOOT-01', name: 'Bootstrap danh mục nền', purpose: 'Tạo nền tảng catalog', actor: 'DevOps' },
    { id: 'CAP-BOOT-02', name: 'Idempotent / an toàn', purpose: 'Chạy lại không phá dữ liệu sống', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-BOOT-01', id: 'FN-BOOT-RUN', name: 'POST bootstrap-xevn', ui: 'API ops', mutate: true },
    { cap: 'CAP-BOOT-02', id: 'FN-BOOT-GUARD', name: 'Auth + idempotent', ui: 'API', mutate: true },
  ],
  cases: [
    C('TC-XBOS-SYNC-01-BOOT-HP-001', 'CAP-BOOT-01', 'FN-BOOT-RUN', 'HP', 'P0', P.API, 'env trống/dev được phép', '1. POST bootstrap-xevn auth ops', '2xx · catalogs nền tồn tại', 'API', '**không** U65 evidence'),
    C('TC-XBOS-SYNC-01-BOOT-FD-001', 'CAP-BOOT-01', 'FN-BOOT-RUN', 'FD', 'P0', P.API, 'thiếu env MASTER_TENANT', '1. Bootstrap', 'lỗi cấu hình rõ', 'API', 'TECHSPEC bootstrap'),
    C('TC-XBOS-SYNC-01-BOOT-AU-001', 'CAP-BOOT-02', 'FN-BOOT-GUARD', 'AU', 'P0', P.EMP, 'NV', '1. POST bootstrap', '403', 'API', 'RBAC'),
    C('TC-XBOS-SYNC-01-BOOT-HP-002', 'CAP-BOOT-02', 'FN-BOOT-GUARD', 'HP', 'P1', P.API, 'đã bootstrap', '1. Chạy lại', 'idempotent · không nhân bản phá', 'API', 'idempotent'),
    C('TC-XBOS-SYNC-01-BOOT-FD-002', 'CAP-BOOT-02', 'FN-BOOT-GUARD', 'FD', 'P0', P.API, 'prod lock', '1. Bootstrap khi cấm', 'reject / guard', 'API', 'ops'),
    C('TC-XBOS-SYNC-01-BOOT-UX-001', 'CAP-BOOT-01', 'FN-BOOT-RUN', 'UX', 'P2', P.CEO, 'sau bootstrap (dev)', '1. Mở CC danh mục nền', 'thấy data — không dùng làm UF PASS', 'UI', 'U65 lock'),
    C('TC-XBOS-SYNC-01-BOOT-BD-001', 'CAP-BOOT-01', 'FN-BOOT-RUN', 'BD', 'P2', P.API, 'partial fail', '1. Lỗi giữa chừng', 'rollback/resume rõ', 'API', 'reliability'),
    C('TC-XBOS-SYNC-01-BOOT-AU-002', 'CAP-BOOT-02', 'FN-BOOT-GUARD', 'AU', 'P1', P.MEM, 'member', '1. Bootstrap holding', '403/409', 'API', 'scope'),
  ],
});

ucs.push({
  id: 'UC-XBOS-MET-01',
  stt: 9,
  name: 'Xem chỉ số vận hành dịch vụ API',
  actors: 'SRE · Ops',
  surfaces: 'api',
  srs_new: SRS_NEW_NA + ' · NFR observability',
  api: 'GET `/api/xbos/metrics` · `?format=prometheus`',
  code: 'LIKELY_IMPL',
  code_note: '`app.controller.ts` getMetrics + renderPrometheusMetrics.',
  goal: 'Đọc chỉ số runtime/Prometheus của xbos-api cho giám sát vận hành.',
  caps: [
    { id: 'CAP-MET-01', name: 'Snapshot metrics JSON', purpose: 'Xem uptime/memory', actor: 'Ops' },
    { id: 'CAP-MET-02', name: 'Prometheus scrape', purpose: 'Export text/plain', actor: 'Prometheus' },
  ],
  fns: [
    { cap: 'CAP-MET-01', id: 'FN-MET-JSON', name: 'GET metrics JSON', ui: 'GET /metrics', mutate: false },
    { cap: 'CAP-MET-02', id: 'FN-MET-PROM', name: 'GET prometheus', ui: '?format=prometheus', mutate: false },
  ],
  cases: [
    C('TC-XBOS-MET-01-JSON-HP-001', 'CAP-MET-01', 'FN-MET-JSON', 'HP', 'P0', P.API, 'API up', '1. GET /api/xbos/metrics', '200 · XBOS-METRICS-200 · có uptime', 'API', 'UC-XBOS-MET-01'),
    C('TC-XBOS-MET-01-PROM-HP-001', 'CAP-MET-02', 'FN-MET-PROM', 'HP', 'P0', P.API, 'API up', '1. GET ?format=prometheus', 'text/plain · có metric platform (vd. http_requests_total)', 'API', 'NFR'),
    C('TC-XBOS-MET-01-PROM-FD-001', 'CAP-MET-02', 'FN-MET-PROM', 'FD', 'P1', P.API, 'API down', '1. scrape', 'fail scrape', 'API', ''),
    C('TC-XBOS-MET-01-JSON-UX-001', 'CAP-MET-01', 'FN-MET-JSON', 'UX', 'P2', P.API, '—', '1. Accept text/plain không format', 'hành vi AS-IS document', 'API', ''),
    C('TC-XBOS-MET-01-JSON-AU-001', 'CAP-MET-01', 'FN-MET-JSON', 'AU', 'P2', P.EMP, 'metrics policy', '1. GET không auth', 'ghi nhận public vs protect AS-IS', 'API', 'security'),
  ],
});

ucs.push({
  id: 'UC-XBOS-08',
  stt: 10,
  name: 'Thêm / sửa / xóa dữ liệu master theo lĩnh vực',
  actors: 'Admin master data',
  surfaces: 'web-portal / api',
  srs_new: SRS_NEW_NA,
  api: 'GET domains · CRUD `/api/xbos/business-master/:domain/items`',
  code: 'LIKELY_IMPL',
  code_note: 'business-master.controller.ts GET domains + items CRUD.',
  goal: 'CRUD master theo domain whitelist (lĩnh vực), không domain tự do ngoài danh sách.',
  caps: [
    { id: 'CAP-BM-01', name: 'Chọn lĩnh vực', purpose: 'List domains hợp lệ', actor: 'Admin' },
    { id: 'CAP-BM-02', name: 'CRUD theo domain', purpose: 'Thêm/sửa/xóa item', actor: 'Admin' },
    { id: 'CAP-BM-03', name: 'Chặn domain lạ', purpose: 'Whitelist', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-BM-01', id: 'FN-BM-DOMAINS', name: 'List domains', ui: 'GET domains', mutate: false },
    { cap: 'CAP-BM-02', id: 'FN-BM-UPSERT', name: 'Upsert item', ui: 'PUT item', mutate: true },
    { cap: 'CAP-BM-02', id: 'FN-BM-DELETE', name: 'Delete item', ui: 'DELETE', mutate: true },
    { cap: 'CAP-BM-03', id: 'FN-BM-DOMAIN-GUARD', name: 'Reject unknown domain', ui: 'API', mutate: true },
  ],
  cases: [
    C('TC-XBOS-08-DOM-HP-001', 'CAP-BM-01', 'FN-BM-DOMAINS', 'HP', 'P0', P.CEO, 'login', '1. GET domains / mở Settings master', 'danh sách domain whitelist', 'API/UI', 'UC-XBOS-08'),
    C('TC-XBOS-08-UPS-HP-001', 'CAP-BM-02', 'FN-BM-UPSERT', 'HP', 'P0', P.CEO, 'chọn 1 domain', '1. Thêm item · Lưu', '2xx · F5', 'UI/API', ''),
    C('TC-XBOS-08-UPS-FD-001', 'CAP-BM-02', 'FN-BM-UPSERT', 'FD', 'P0', P.CEO, '—', '1. Payload thiếu', '4xx', 'API', ''),
    C('TC-XBOS-08-DEL-HP-001', 'CAP-BM-02', 'FN-BM-DELETE', 'HP', 'P0', P.CEO, 'item tồn tại', '1. Xóa mềm', '2xx', 'API', ''),
    C('TC-XBOS-08-DEL-FD-001', 'CAP-BM-02', 'FN-BM-DELETE', 'FD', 'P1', P.CEO, 'itemId sai', '1. DELETE', '404', 'API', ''),
    C('TC-XBOS-08-GRD-FD-001', 'CAP-BM-03', 'FN-BM-DOMAIN-GUARD', 'FD', 'P0', P.API, '—', '1. PUT domain=evil', '4xx whitelist', 'API', 'security'),
    C('TC-XBOS-08-UPS-AU-001', 'CAP-BM-02', 'FN-BM-UPSERT', 'AU', 'P0', P.MEM, 'member', '1. Ghi domain tập đoàn', '403/409', 'API', 'scope'),
    C('TC-XBOS-08-DOM-UX-001', 'CAP-BM-01', 'FN-BM-DOMAINS', 'UX', 'P1', P.CEO, '—', '1. Mở UI domain trống items', 'empty OK', 'UI', ''),
    C('TC-XBOS-08-UPS-BD-001', 'CAP-BM-02', 'FN-BM-UPSERT', 'BD', 'P1', P.CEO, '—', '1. code biên độ dài', 'validate', 'UI', ''),
    C('TC-XBOS-08-UPS-HP-002', 'CAP-BM-02', 'FN-BM-UPSERT', 'HP', 'P1', P.CEO, 'item có', '1. Sửa · Lưu', 'F5 còn', 'UI', ''),
    C('TC-XBOS-08-UPS-AU-002', 'CAP-BM-02', 'FN-BM-UPSERT', 'AU', 'P0', P.EMP, 'NV', '1. PUT', '403', 'API', 'RBAC'),
    C('TC-XBOS-08-DOM-HP-002', 'CAP-BM-01', 'FN-BM-DOMAINS', 'HP', 'P2', P.API, '—', '1. Đổi domain liên tiếp', 'isolation data đúng domain', 'API', ''),
  ],
});

ucs.push({
  id: 'UC-XBOS-KPI-01',
  stt: 11,
  name: 'Tính KPI đơn lẻ trên máy chủ',
  actors: 'KPI engine · Admin điều hành',
  surfaces: 'api / xbos-cc',
  srs_new: SRS_NEW_NA + ' · TECHSPEC kpi-engine',
  api: 'POST `/api/xbos/kpi-engine/evaluate`',
  code: 'LIKELY_IMPL',
  code_note: 'kpi-engine.controller.ts POST evaluate.',
  goal: 'Tính một chỉ số KPI trên máy chủ theo tham số kỳ/phạm vi và trả kết quả xác định.',
  caps: [
    { id: 'CAP-KPI-01', name: 'Evaluate đơn', purpose: 'Tính 1 metric', actor: 'Admin' },
    { id: 'CAP-KPI-02', name: 'Scope KPI', purpose: 'Đúng company/tenant', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-KPI-01', id: 'FN-KPI-EVAL', name: 'POST evaluate', ui: 'API / CC trigger', mutate: true },
    { cap: 'CAP-KPI-02', id: 'FN-KPI-SCOPE', name: 'Scope on evaluate', ui: 'companyId', mutate: false },
  ],
  cases: [
    C('TC-XBOS-KPI-01-EVAL-HP-001', 'CAP-KPI-01', 'FN-KPI-EVAL', 'HP', 'P0', P.CEO, 'metric tồn tại', '1. POST evaluate hợp lệ', '2xx · value số · mã KPI', 'API', 'UC-XBOS-KPI-01'),
    C('TC-XBOS-KPI-01-EVAL-FD-001', 'CAP-KPI-01', 'FN-KPI-EVAL', 'FD', 'P0', P.CEO, '—', '1. Thiếu metricKey/kỳ', '4xx', 'API', ''),
    C('TC-XBOS-KPI-01-EVAL-FD-002', 'CAP-KPI-01', 'FN-KPI-EVAL', 'FD', 'P0', P.CEO, 'metric lạ', '1. evaluate', '4xx not found', 'API', ''),
    C('TC-XBOS-KPI-01-SCOPE-AU-001', 'CAP-KPI-02', 'FN-KPI-SCOPE', 'AU', 'P0', P.MEM, 'member', '1. evaluate company khác', '409 scope mismatch', 'API', 'companyId token'),
    C('TC-XBOS-KPI-01-EVAL-BD-001', 'CAP-KPI-01', 'FN-KPI-EVAL', 'BD', 'P1', P.CEO, '—', '1. from=to biên', 'OK hoặc 4xx rõ', 'API', 'BD'),
    C('TC-XBOS-KPI-01-EVAL-UX-001', 'CAP-KPI-01', 'FN-KPI-EVAL', 'UX', 'P1', P.CEO, 'UI có nút tính', '1. Bấm tính', 'loading → kết quả', 'UI', 'UX'),
    C('TC-XBOS-KPI-01-EVAL-AU-001', 'CAP-KPI-01', 'FN-KPI-EVAL', 'AU', 'P1', P.EMP, 'NV', '1. POST', '403', 'API', 'RBAC'),
  ],
});

ucs.push({
  id: 'UC-XBOS-KPI-02',
  stt: 12,
  name: 'Tính KPI theo lô trên máy chủ',
  actors: 'KPI engine',
  surfaces: 'api',
  srs_new: SRS_NEW_NA,
  api: 'POST `/api/xbos/kpi-engine/evaluate-batch`',
  code: 'LIKELY_IMPL',
  code_note: 'POST evaluate-batch.',
  goal: 'Tính nhiều KPI trong một lần gọi lô, trả kết quả từng phần tử.',
  caps: [{ id: 'CAP-KB-01', name: 'Evaluate batch', purpose: 'Tính nhiều metric', actor: 'Admin' }],
  fns: [{ cap: 'CAP-KB-01', id: 'FN-KPI-BATCH', name: 'POST evaluate-batch', ui: 'API', mutate: true }],
  cases: [
    C('TC-XBOS-KPI-02-BAT-HP-001', 'CAP-KB-01', 'FN-KPI-BATCH', 'HP', 'P0', P.CEO, '≥2 metrics', '1. POST batch hợp lệ', '2xx · đủ phần tử kết quả', 'API', 'UC-XBOS-KPI-02'),
    C('TC-XBOS-KPI-02-BAT-FD-001', 'CAP-KB-01', 'FN-KPI-BATCH', 'FD', 'P0', P.CEO, '—', '1. batch rỗng', '4xx', 'API', ''),
    C('TC-XBOS-KPI-02-BAT-FD-002', 'CAP-KB-01', 'FN-KPI-BATCH', 'FD', 'P0', P.CEO, '1 metric sai trong lô', '1. batch hỗn hợp', 'partial error rõ / fail-all — AS-IS', 'API', 'error semantics'),
    C('TC-XBOS-KPI-02-BAT-AU-001', 'CAP-KB-01', 'FN-KPI-BATCH', 'AU', 'P0', P.MEM, 'member', '1. batch company lệch', '409', 'API', 'scope'),
    C('TC-XBOS-KPI-02-BAT-BD-001', 'CAP-KB-01', 'FN-KPI-BATCH', 'BD', 'P1', P.CEO, '—', '1. batch rất lớn', 'limit/4xx · không 500 OOM', 'API', 'perf'),
    C('TC-XBOS-KPI-02-BAT-UX-001', 'CAP-KB-01', 'FN-KPI-BATCH', 'UX', 'P2', P.CEO, 'UI', '1. Chạy batch từ CC', 'progress/kết quả', 'UI', ''),
    C('TC-XBOS-KPI-02-BAT-HP-002', 'CAP-KB-01', 'FN-KPI-BATCH', 'HP', 'P1', P.API, 'size=1', '1. batch 1 phần tử', 'tương đương evaluate đơn', 'API', ''),
  ],
});

ucs.push({
  id: 'UC-XBOS-KPI-03',
  stt: 13,
  name: 'Tổng hợp KPI đa cấp (rollup)',
  actors: 'Group CEO · KPI engine',
  surfaces: 'api / xbos-cc',
  srs_new: SRS_NEW_NA + ' · FR-XBOS-KPI-03 TECHSPEC',
  api: 'GET `/api/xbos/kpi-engine/rollup` → `XBOS-KPI-202`',
  code: 'LIKELY_IMPL',
  code_note: 'GET rollup · TECHSPEC §14.17 OpenAPI kpiEngineRollup.',
  goal: 'Tổng hợp KPI đa cấp (rollup) theo cây tổ chức/pháp nhân cho cockpit điều hành.',
  caps: [
    { id: 'CAP-KR-01', name: 'Rollup đa cấp', purpose: 'Xem tổng hợp', actor: 'Group CEO' },
    { id: 'CAP-KR-02', name: 'Scope rollup', purpose: 'main vs member', actor: 'Hệ thống' },
  ],
  fns: [
    { cap: 'CAP-KR-01', id: 'FN-KPI-ROLLUP', name: 'GET rollup', ui: 'GET rollup / CC', mutate: false },
    { cap: 'CAP-KR-02', id: 'FN-KPI-ROLLUP-SCOPE', name: 'Scope rollup', ui: 'companyId', mutate: false },
  ],
  cases: [
    C('TC-XBOS-KPI-03-ROL-HP-001', 'CAP-KR-01', 'FN-KPI-ROLLUP', 'HP', 'P0', P.CEO, 'main scope', '1. GET rollup / mở cockpit', '200 XBOS-KPI-202 · có nodes', 'API/UI', 'UC-XBOS-KPI-03'),
    C('TC-XBOS-KPI-03-ROL-FD-001', 'CAP-KR-01', 'FN-KPI-ROLLUP', 'FD', 'P1', P.CEO, '—', '1. thiếu from/to', '4xx', 'API', ''),
    C('TC-XBOS-KPI-03-ROL-AU-001', 'CAP-KR-02', 'FN-KPI-ROLLUP-SCOPE', 'AU', 'P0', P.MEM, 'member', '1. rollup toàn tập đoàn', '403/409 hoặc chỉ CT mình theo ADR', 'API', 'scope ladder'),
    C('TC-XBOS-KPI-03-ROL-UX-001', 'CAP-KR-01', 'FN-KPI-ROLLUP', 'UX', 'P0', P.CEO, 'không data kỳ', '1. Mở rollup', 'empty hợp lệ · không ERROR', 'UI', 'U65'),
    C('TC-XBOS-KPI-03-ROL-HP-002', 'CAP-KR-01', 'FN-KPI-ROLLUP', 'HP', 'P1', P.CEO, 'có con', '1. Mở node cha → con', 'cross-nav số liệu khớp', 'UI', 'J-*'),
    C('TC-XBOS-KPI-03-ROL-BD-001', 'CAP-KR-01', 'FN-KPI-ROLLUP', 'BD', 'P2', P.CEO, '—', '1. kỳ 1 ngày vs 1 năm', 'không crash', 'API', 'NFR'),
  ],
});

ucs.push({
  id: 'UC-XBOS-KPI-04',
  stt: 14,
  name: 'Phát cảnh báo KPI lên cổng điều hành',
  actors: 'KPI engine · Portal CC',
  surfaces: 'api / xbos-cc',
  srs_new: SRS_NEW_NA,
  api: 'GET/POST `/api/xbos/kpi-engine/portal-alerts`',
  code: 'LIKELY_IMPL',
  code_note: 'portal-alerts GET/POST trên kpi-engine.controller.ts.',
  goal: 'Phát và đọc cảnh báo KPI trên cổng điều hành khi vượt ngưỡng.',
  caps: [
    { id: 'CAP-KA-01', name: 'Tạo cảnh báo KPI', purpose: 'POST alert', actor: 'Engine/Admin' },
    { id: 'CAP-KA-02', name: 'Xem cảnh báo cổng', purpose: 'CC đọc alerts', actor: 'CEO' },
  ],
  fns: [
    { cap: 'CAP-KA-01', id: 'FN-KPI-ALERT-POST', name: 'POST portal-alerts', ui: 'API', mutate: true },
    { cap: 'CAP-KA-02', id: 'FN-KPI-ALERT-GET', name: 'GET portal-alerts', ui: 'CC thanh cảnh báo', mutate: false },
  ],
  cases: [
    C('TC-XBOS-KPI-04-POST-HP-001', 'CAP-KA-01', 'FN-KPI-ALERT-POST', 'HP', 'P0', P.API, 'ngưỡng vượt', '1. POST alert hợp lệ', '2xx · lưu alert', 'API', 'UC-XBOS-KPI-04'),
    C('TC-XBOS-KPI-04-POST-FD-001', 'CAP-KA-01', 'FN-KPI-ALERT-POST', 'FD', 'P0', P.API, '—', '1. thiếu metric/threshold', '4xx', 'API', ''),
    C('TC-XBOS-KPI-04-GET-HP-001', 'CAP-KA-02', 'FN-KPI-ALERT-GET', 'HP', 'P0', P.CEO, 'đã có alert', '1. Mở CC / GET alerts', 'thấy cảnh báo · không 409', 'UI/API', 'CC'),
    C('TC-XBOS-KPI-04-GET-UX-001', 'CAP-KA-02', 'FN-KPI-ALERT-GET', 'UX', 'P0', P.CEO, 'không alert', '1. GET', '[] empty OK', 'UI/API', ''),
    C('TC-XBOS-KPI-04-POST-AU-001', 'CAP-KA-01', 'FN-KPI-ALERT-POST', 'AU', 'P0', P.EMP, 'NV', '1. POST', '403', 'API', ''),
    C('TC-XBOS-KPI-04-GET-AU-001', 'CAP-KA-02', 'FN-KPI-ALERT-GET', 'AU', 'P0', P.MEM, 'member', '1. GET alerts holding', 'scope đúng', 'API', 'scope'),
    C('TC-XBOS-KPI-04-POST-BD-001', 'CAP-KA-01', 'FN-KPI-ALERT-POST', 'BD', 'P2', P.API, '—', '1. threshold = 0', 'hành vi rõ', 'API', 'BD'),
  ],
});

for (const row of [
  [15, 'UC-XBOS-MD-01', 'Quản lý chức danh (master)', 'job_titles'],
  [16, 'UC-XBOS-MD-02', 'Quản lý nhà cung cấp (master)', 'suppliers'],
  [17, 'UC-XBOS-MD-03', 'Quản lý loại chi phí (master)', 'cost_types'],
  [18, 'UC-XBOS-MD-04', 'Quản lý chỉ số KPI (master)', 'kpi_metrics'],
  [19, 'UC-XBOS-MD-05', 'Quản lý khách hàng (master)', 'customers'],
  [20, 'UC-XBOS-MD-06', 'Quản lý đối tác (master)', 'partners'],
  [21, 'UC-XBOS-MD-07', 'Quản lý loại xe / tài sản (master)', 'asset_types'],
]) {
  ucs.push(mdDomain(...row));
}

// Continue in part 2 file import — append remaining via second module
import { restUcs } from './w1-s1-rest.mjs';
ucs.push(...restUcs);

fs.mkdirSync(SQUAD, { recursive: true });
const manifestRows = [];
let sum = 0;
for (const uc of ucs) {
  if (uc.stt < 1 || uc.stt > 40) throw new Error(`stt out of range ${uc.id}`);
  const md = render(uc);
  const { total } = fnTable(uc.fns, uc.cases);
  const file = path.join(OUT, `${uc.id}.md`);
  fs.writeFileSync(file, md, 'utf8');
  sum += total;
  const notes = uc.code_note.slice(0, 80).replace(/\|/g, '/');
  manifestRows.push(`| ${uc.stt} | \`${uc.id}\` | ${total} | ${uc.code} | ${notes} |`);
  console.log(`wrote ${uc.id} cases=${total}`);
}

if (ucs.length !== 40) throw new Error(`expected 40 UCs, got ${ucs.length}`);

const manifest = `# Manifest — W1-S1-XBOS-CORE

| Meta | Value |
|------|--------|
| **squad_id** | W1-S1-XBOS-CORE |
| **work_item_id** | \`${WI}\` |
| **STT** | 1–40 |
| **author** | ba-process |
| **design_status** | DESIGNED |
| **ack_status** | READY_FOR_SYNTH |
| **execution** | not started · uat_done: false |
| **generated** | 2026-08-04 |

## Coverage

| stt | uc_id | cases_designed | code_readiness | notes |
|----:|-------|---------------:|----------------|-------|
${manifestRows.join('\n')}

| | **Σ cases_designed** | **${sum}** | | |

## Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
work_item_id: ${WI}
uc_count: 40
cases_designed_total: ${sum}
next_owner: pm
\`\`\`
`;

fs.writeFileSync(path.join(SQUAD, 'W1-S1-XBOS-CORE_MANIFEST.md'), manifest, 'utf8');
console.log(`MANIFEST total cases=${sum} files=${ucs.length}`);
