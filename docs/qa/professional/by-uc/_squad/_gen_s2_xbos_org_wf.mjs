/**
 * PO-UC-TC-W1-S2-XBOS-ORG-WF — generate DESIGNED UC TC packs (STT 41–80).
 * Design-only; does not claim UAT. Run: node docs/qa/professional/by-uc/_squad/_gen_s2_xbos_org_wf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..');
const SQUAD = 'W1-S2-XBOS-ORG-WF';
const WI = 'PO-UC-TC-W1-S2-XBOS-ORG-WF';

/** @typedef {{ id: string, name: string, type: string, pri: string, persona: string, pre: string, steps: string, exp: string, layer: string, trace: string }} TC */
/** @typedef {{ id: string, name: string, ui: string, mutate: boolean }} FN */
/** @typedef {{ id: string, name: string, purpose: string, actor: string, fns: FN[] }} Cap */

function tc(prefix, fn, type, n, fields) {
  const id = `TC-${prefix}-${fn}-${type}-${String(n).padStart(3, '0')}`;
  return { id, fn, type, ...fields };
}

function countByFn(cases) {
  const map = new Map();
  for (const c of cases) {
    if (!map.has(c.fn)) map.set(c.fn, { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0 });
    map.get(c.fn)[c.type] += 1;
  }
  return map;
}

function renderFile(uc) {
  const counts = countByFn(uc.cases);
  const fnRows = [];
  let tot = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, S: 0 };
  for (const cap of uc.caps) {
    for (const fn of cap.fns) {
      const c = counts.get(fn.id) || { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0 };
      const s = c.HP + c.FD + c.BD + c.AU + c.UX;
      tot.HP += c.HP; tot.FD += c.FD; tot.BD += c.BD; tot.AU += c.AU; tot.UX += c.UX; tot.S += s;
      fnRows.push(`| ${fn.id} | ${c.HP} | ${c.FD} | ${c.BD} | ${c.AU} | ${c.UX} | ${s} |`);
    }
  }
  fnRows.push(`| **Tổng** | ${tot.HP} | ${tot.FD} | ${tot.BD} | ${tot.AU} | ${tot.UX} | **${tot.S}** |`);

  const capTable = uc.caps
    .map((c) => `| ${c.id} | ${c.name} | ${c.purpose} | ${c.actor} |`)
    .join('\n');
  const fnTable = uc.caps
    .flatMap((cap) =>
      cap.fns.map(
        (fn) =>
          `| ${cap.id} | ${fn.id} | ${fn.name} | ${fn.ui} | ${fn.mutate ? 'Y' : 'N'} |`,
      ),
    )
    .join('\n');

  const caseRows = uc.cases
    .map(
      (c) =>
        `| ${c.id} | ${c.cap || ''} | ${c.fn} | ${c.type} | ${c.pri} | ${c.persona} | ${c.pre} | ${c.steps} | ${c.exp} | ${c.layer} | ${c.trace} |`,
    )
    .join('\n');

  const mutateFns = uc.caps.flatMap((c) => c.fns).filter((f) => f.mutate);
  const mutateOk = mutateFns.every((f) => {
    const c = counts.get(f.id) || { HP: 0, FD: 0 };
    return c.HP >= 1 && c.FD >= 1;
  });

  return `# UC — \`${uc.id}\` · ${uc.name_vi}

| Meta | Value |
|------|--------|
| **uc_id** | \`${uc.id}\` |
| **stt_phase1** | ${uc.stt} |
| **mod** | ${uc.mod} |
| **name_vi** | ${uc.name_vi} |
| **actors** | ${uc.actors} |
| **surfaces** | ${uc.surfaces} |
| **srs_old** | \`docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md\` STT ${uc.stt} · \`PHASE1_UC_SRS_TECHSPEC_MATRIX.md\` #${uc.stt} · ${uc.srs_old_extra || 'matrix SRS Có'} |
| **srs_new** | ${uc.srs_new} |
| **tech_spec** | ${uc.tech_spec} |
| **api_contract** | ${uc.api} |
| **author** | ba-process · ${WI} |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | \`${uc.code_readiness}\` |
| **code_note** | ${uc.code_note} |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. \`uat_done: false\`. Squad **${SQUAD}**.

---

## 1. Mục tiêu UC (1 đoạn)

${uc.goal}

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
${capTable}

**Đếm nghiệp vụ:** ${uc.caps.length}

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
${fnTable}

**Đếm chức năng:** ${uc.caps.reduce((n, c) => n + c.fns.length, 0)}

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
${fnRows.join('\n')}

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
${caseRows}

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | ${uc.caps.length} | ${uc.caps.every((c) => c.fns.length >= 1) ? 'YES' : 'NO'} | ${uc.gaps?.cap || '—'} |
| Mọi FN mutate ≥1 HP + ≥1 FD | ${mutateFns.length} | ${mutateOk ? 'YES' : 'PARTIAL'} | ${uc.gaps?.mutate || '—'} |
| Auth/scope nếu đa CT | required | ${uc.cases.some((c) => c.type === 'AU') ? 'YES' : 'N/A-read'} | ${uc.gaps?.au || '—'} |
| SPEC_GAP ghi rõ | — | ${uc.spec_gap || 'none recorded'} | ${uc.gaps?.spec || '—'} |
| Self-approve FD (WF) | ${uc.wf ? 'YES' : 'N/A'} | ${uc.cases.some((c) => /SELF|self|tự duyệt/i.test(c.id + c.steps + c.exp)) ? 'YES' : uc.wf ? 'CHECK' : 'N/A'} | ${uc.gaps?.self || '—'} |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ${uc.fe_be.be} | ${uc.fe_be.be_ev} |
| FE menu/nút/role | ${uc.fe_be.fe} | ${uc.fe_be.fe_ev} |
| Mobile (nếu có) | ${uc.fe_be.mobile || 'N/A — web/portal UC'} | — |
| RBAC / scope | ${uc.fe_be.rbac} | ${uc.fe_be.rbac_ev} |

**Verdict code_readiness:** \`${uc.code_readiness}\` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
uc_id: ${uc.id}
cases_designed: ${tot.S}
code_readiness: ${uc.code_readiness}
work_item_id: ${WI}
squad: ${SQUAD}
uat_done: false
\`\`\`
`;
}

const P = {
  ceo: 'ceo@xe.vn / Group CEO',
  mem: 'du-lich.ceo@xe.vn / Member CEO',
  hrbp: 'HRBP holding (membership main)',
  anon: '(chưa đăng nhập)',
};

function baseFeBe(apiPath, uf) {
  return {
    be: `Controller/service tồn tại cho ${apiPath}; response code theo OpenAPI/runtime.`,
    be_ev: `apps/api/xbos-api/src/** · API_CONTRACT_VN.md`,
    fe: `Portal CC / Settings — UF ${uf || 'xem matrix'}; menu HDSD Command Center.`,
    fe_ev: `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web`,
    rbac: `JWT scope main vs member slug; 403/409 khi lệch scope.`,
    rbac_ev: `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context`,
  };
}

/** Build UC definitions */
const UCS = [];

function add(uc) {
  const seq = new Map(); // fn|type -> n
  const short = uc.id.replace(/^UC-/, '').replace(/^XBOS-/, 'DM-');
  for (const c of uc.cases) {
    if (!c.cap) {
      for (const cap of uc.caps) {
        if (cap.fns.some((f) => f.id === c.fn)) {
          c.cap = cap.id;
          break;
        }
      }
    }
    const key = `${c.fn}|${c.type}`;
    const n = (seq.get(key) || 0) + 1;
    seq.set(key, n);
    const fnShort = String(c.fn).replace(/^FN-/, '');
    c.id = `TC-${short}-${fnShort}-${c.type}-${String(n).padStart(3, '0')}`;
  }
  UCS.push(uc);
}

// ——— 41 AST-01 ———
add({
  id: 'UC-XBOS-AST-01', stt: 41, mod: 'M01', name_vi: 'Đăng ký tài sản',
  actors: 'Operations / Asset owner · Group CEO (scope)',
  surfaces: 'api / web-portal',
  srs_new: '`SRS_VN.md` — N/A-DELTA (asset registry AS-IS TECHSPEC_HE); map WF 2-level N/A trừ khi gắn AR',
  tech_spec: '`TECHSPEC_HE` §4–9 · assets module',
  api: 'POST/GET `/api/xbos/assets` · codes `ASSET-REG-201` / `ASSET-REG-200` · `ASSET-MOD-409` module mismatch',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'AssetsController create/list tồn tại; FE portal surface có thể mỏng so với API — verify menu trước UAT.',
  goal: 'Đăng ký tài sản mới thuộc đúng tenant/company và module owner (vehicle/it/…), validate bắt buộc, chống ghi sai scope.',
  srs_old_extra: 'UF liên quan AR/AST',
  caps: [
    { id: 'CAP-AST-REG', name: 'Đăng ký tài sản', purpose: 'Tạo bản ghi tài sản hợp lệ', actor: 'Ops',
      fns: [
        { id: 'FN-AST-CREATE', name: 'Tạo tài sản', ui: 'POST /assets', mutate: true },
        { id: 'FN-AST-LIST', name: 'Liệt kê tài sản scope', ui: 'GET /assets', mutate: false },
        { id: 'FN-AST-GET', name: 'Xem chi tiết theo id', ui: 'GET /assets/:id', mutate: false },
      ]},
    { id: 'CAP-AST-CTRL', name: 'Kiểm soát module & scope', purpose: 'Fail-closed module/JWT', actor: 'Hệ thống',
      fns: [
        { id: 'FN-AST-MOD', name: 'Kiểm tra x-module-code vs token', ui: 'header guard', mutate: true },
        { id: 'FN-AST-SCOPE', name: 'Chặn company ngoài JWT', ui: 'scope-context', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-AST-CREATE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'JWT hợp lệ + module claim operations', steps: '1. POST body assetCode/Name/Type + company trong scope 2. Quan sát FE/list nếu có', exp: '201 `ASSET-REG-201` · row xuất hiện · F5 còn', layer: 'API/UI', trace: 'UC-XBOS-AST-01 · assets.controller' },
    { fn: 'FN-AST-CREATE', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'JWT OK', steps: '1. POST thiếu assetCode hoặc assetType', exp: '4xx validation · không tạo bản ghi', layer: 'API', trace: 'CreateAssetDto' },
    { fn: 'FN-AST-CREATE', type: 'BD', pri: 'P1', persona: P.ceo, pre: 'JWT OK', steps: '1. assetCode độ dài biên / ký tự đặc biệt theo DTO', exp: 'accept hoặc 4xx deterministic', layer: 'API', trace: 'DTO' },
    { fn: 'FN-AST-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'Có ≥0 asset trong CT', steps: '1. GET /assets đúng scope', exp: '200 `ASSET-REG-200` · items[]', layer: 'API', trace: 'list' },
    { fn: 'FN-AST-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'CT chưa có asset', steps: '1. GET list', exp: '200 empty hợp lệ · UI empty state (không ERROR banner)', layer: 'UI/API', trace: 'empty' },
    { fn: 'FN-AST-GET', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'Biết assetId trong scope', steps: '1. GET /assets/:id', exp: '200 · đúng mã', layer: 'API', trace: 'getById' },
    { fn: 'FN-AST-GET', type: 'AU', pri: 'P0', persona: P.mem, pre: 'asset thuộc CT khác', steps: '1. GET bằng JWT member', exp: '403/404 scope · không lộ dữ liệu', layer: 'API', trace: 'scope parity' },
    { fn: 'FN-AST-MOD', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'token module ≠ header', steps: '1. POST với x-module-code lệch claim', exp: '`ASSET-MOD-409`', layer: 'API', trace: 'resolveAuthoritativeModule' },
    { fn: 'FN-AST-MOD', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'module khớp', steps: '1. POST header = claim', exp: '201', layer: 'API', trace: 'module ok' },
    { fn: 'FN-AST-SCOPE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'JWT member', steps: '1. POST companyId holding/main', exp: '403/409 companyId mismatches token scope', layer: 'API', trace: 'UF-XBOS-11 pattern' },
    { fn: 'FN-AST-SCOPE', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'thiếu token', steps: '1. POST không Authorization', exp: '401 `XBOS-AUTH-001` hoặc tương đương', layer: 'API', trace: 'auth' },
  ],
  fe_be: baseFeBe('/api/xbos/assets', 'AST'),
  gaps: { spec: 'SRS_VN chưa FR asset chi tiết — N/A-DELTA' },
});

// ——— 42 AST-02 ———
add({
  id: 'UC-XBOS-AST-02', stt: 42, mod: 'M01', name_vi: 'Theo dõi vòng đời tài sản',
  actors: 'Operations · Group CEO',
  surfaces: 'api / web-portal',
  srs_new: 'N/A-DELTA (lifecycle AS-IS)',
  tech_spec: 'TECHSPEC_HE §4–9 · PATCH assets',
  api: 'GET/PATCH `/api/xbos/assets/:assetId` · `ASSET-REG-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'PATCH updateAsset + status transition trong AssetsService; FE lifecycle UI cần xác nhận menu.',
  goal: 'Cập nhật trạng thái/vòng đời tài sản (active/idle/disposed…) đúng scope và quan sát được sau F5.',
  caps: [
    { id: 'CAP-AST-LC', name: 'Cập nhật vòng đời', purpose: 'PATCH status/fields', actor: 'Ops',
      fns: [
        { id: 'FN-AST-PATCH', name: 'Cập nhật tài sản', ui: 'PATCH /assets/:id', mutate: true },
        { id: 'FN-AST-VIEW-LC', name: 'Xem trạng thái sau cập nhật', ui: 'GET detail', mutate: false },
      ]},
    { id: 'CAP-AST-LC-CTRL', name: 'Chặn chuyển trạng thái sai', purpose: 'FD + scope', actor: 'Hệ thống',
      fns: [
        { id: 'FN-AST-BAD-ST', name: 'Status không hợp lệ', ui: 'PATCH', mutate: true },
        { id: 'FN-AST-LC-SCOPE', name: 'Scope member', ui: 'PATCH', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-AST-PATCH', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'Asset đã tạo từ FE/API trong scope', steps: '1. PATCH status=active + tên 2. F5 detail', exp: '200 `ASSET-REG-200` · status sticky', layer: 'API/UI', trace: 'AST-02' },
    { fn: 'FN-AST-PATCH', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'asset tồn tại', steps: '1. PATCH body rỗng / field cấm', exp: '4xx · không đổi version ảo', layer: 'API', trace: 'UpdateAssetDto' },
    { fn: 'FN-AST-VIEW-LC', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'sau PATCH HP', steps: '1. GET by id', exp: '200 khớp PATCH', layer: 'API', trace: 'get' },
    { fn: 'FN-AST-VIEW-LC', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'id không tồn tại', steps: '1. GET fake id', exp: '404 honest', layer: 'API', trace: '404' },
    { fn: 'FN-AST-BAD-ST', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'asset active', steps: '1. PATCH status=not_a_status', exp: '4xx validation', layer: 'API', trace: 'enum' },
    { fn: 'FN-AST-BAD-ST', type: 'BD', pri: 'P1', persona: P.ceo, pre: 'asset', steps: '1. PATCH status biên hợp lệ cuối enum', exp: '200 hoặc 4xx deterministic', layer: 'API', trace: 'BD' },
    { fn: 'FN-AST-LC-SCOPE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'asset CT khác', steps: '1. PATCH', exp: '403/409/404', layer: 'API', trace: 'scope' },
    { fn: 'FN-AST-LC-SCOPE', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'module lệch', steps: '1. PATCH x-module-code sai', exp: '`ASSET-MOD-409`', layer: 'API', trace: 'module' },
  ],
  fe_be: baseFeBe('PATCH /api/xbos/assets/:id', 'AST-02'),
});

// ——— 43 AUTH-01 ———
add({
  id: 'UC-XBOS-AUTH-01', stt: 43, mod: 'M01', name_vi: 'Đăng nhập cổng Web Portal',
  actors: 'Mọi user portal',
  surfaces: 'web-portal / api',
  srs_new: '`SRS_VN.md` § auth/JWT (tóm tắt) · map portal login',
  tech_spec: 'TECHSPEC_HE §4–9 · auth',
  api: 'POST `/api/xbos/auth/login` · `XBOS-AUTH-200` · lockout policy AS-IS',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'AuthController.login + portal login form; UF-XBOS-01 🟢 design reference — không claim re-UAT.',
  goal: 'Người dùng đăng nhập bằng email/password hợp lệ, nhận JWT/session và vào Command Center đúng persona.',
  caps: [
    { id: 'CAP-AUTH-IN', name: 'Đăng nhập', purpose: 'Cấp phiên', actor: 'User',
      fns: [
        { id: 'FN-LOGIN', name: 'Submit login', ui: 'POST /auth/login', mutate: true },
        { id: 'FN-LOGIN-NAV', name: 'Điều hướng sau login', ui: 'portal router', mutate: false },
      ]},
    { id: 'CAP-AUTH-FAIL', name: 'Từ chối đăng nhập sai', purpose: 'FD/AU', actor: 'Hệ thống',
      fns: [
        { id: 'FN-LOGIN-BAD', name: 'Sai mật khẩu / email', ui: 'POST login', mutate: true },
        { id: 'FN-LOGIN-LOCK', name: 'Lockout sau nhiều lần sai', ui: 'POST login', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-LOGIN', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'Chưa login · account pilot sống', steps: '1. Mở portal 2. Nhập ceo@xe.vn / Xevn@2026 3. Đăng nhập', exp: '200 `XBOS-AUTH-200` · token · vào CC · không banner lỗi', layer: 'UI/API', trace: 'UF-XBOS-01 · AUTH-01' },
    { fn: 'FN-LOGIN', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form trống', steps: '1. Submit thiếu email/password', exp: 'FE validate · không gọi hoặc 4xx', layer: 'UI', trace: 'PortalLoginDto' },
    { fn: 'FN-LOGIN-NAV', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login HP vừa xong', steps: '1. Quan sát landing CC', exp: 'widgets VI · không raw keys', layer: 'UI', trace: 'UF-XBOS-01' },
    { fn: 'FN-LOGIN-NAV', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'API chậm', steps: '1. Login', exp: 'loading rồi sẵn sàng · không trắng vĩnh viễn', layer: 'UI', trace: 'UX' },
    { fn: 'FN-LOGIN-BAD', type: 'FD', pri: 'P0', persona: 'attacker@xe.vn', pre: 'account tồn tại hoặc không', steps: '1. Sai password', exp: '401 · message không lộ enumeration quá mức', layer: 'API', trace: 'login fail' },
    { fn: 'FN-LOGIN-BAD', type: 'AU', pri: 'P1', persona: P.anon, pre: '—', steps: '1. Gọi API protected không token', exp: '401', layer: 'API', trace: 'guard' },
    { fn: 'FN-LOGIN-LOCK', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'policy 5 fail', steps: '1. Sai password ×5+', exp: 'lockout / cooldown deterministic (CLAUDE.md 30m)', layer: 'API', trace: 'lockout' },
    { fn: 'FN-LOGIN-LOCK', type: 'BD', pri: 'P2', persona: P.ceo, pre: '4 fails', steps: '1. Lần 5', exp: 'vẫn theo policy biên', layer: 'API', trace: 'BD lock' },
  ],
  fe_be: baseFeBe('POST /auth/login', 'UF-XBOS-01'),
});

// ——— 44 AUTH-02 ———
add({
  id: 'UC-XBOS-AUTH-02', stt: 44, mod: 'M01', name_vi: 'Xem thông tin phiên đăng nhập',
  actors: 'User đã login',
  surfaces: 'web-portal / api',
  srs_new: 'N/A-DELTA · session /me',
  tech_spec: 'TECHSPEC_HE · GET auth/me',
  api: 'GET `/api/xbos/auth/me` · `XBOS-AUTH-200` / `XBOS-AUTH-401`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'AuthController.me đọc JWT sub/email.',
  goal: 'Hiển thị thông tin phiên (user, memberships, role) khớp JWT đang dùng.',
  caps: [
    { id: 'CAP-SESS', name: 'Đọc phiên', purpose: 'me()', actor: 'User',
      fns: [
        { id: 'FN-ME', name: 'GET me', ui: 'GET /auth/me', mutate: false },
        { id: 'FN-ME-UI', name: 'Hiển thị identity trên shell', ui: 'portal header', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-ME', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'đã login', steps: '1. GET /auth/me', exp: '200 · email/role khớp', layer: 'API', trace: 'AUTH-02' },
    { fn: 'FN-ME', type: 'AU', pri: 'P0', persona: P.anon, pre: 'không token', steps: '1. GET /me', exp: '401 `XBOS-AUTH-401`', layer: 'API', trace: '401' },
    { fn: 'FN-ME', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'token hết hạn / giả', steps: '1. GET /me', exp: '401', layer: 'API', trace: 'JWT' },
    { fn: 'FN-ME-UI', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login OK', steps: '1. Mở portal shell', exp: 'hiển thị tên/email đúng', layer: 'UI', trace: 'shell' },
    { fn: 'FN-ME-UI', type: 'UX', pri: 'P1', persona: P.ceo, pre: '/me chậm', steps: '1. Reload shell', exp: 'skeleton/loading · không crash', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('GET /auth/me', 'AUTH-02'),
});

// ——— 45–47 TENANT ———
add({
  id: 'UC-XBOS-TENANT-01', stt: 45, mod: 'M01', name_vi: 'Liệt kê tenant / công ty người dùng được truy cập',
  actors: 'User đã login',
  surfaces: 'api / web-portal',
  srs_new: 'N/A-DELTA · tenant-scope',
  tech_spec: 'TECHSPEC_HE · tenant-scope',
  api: 'GET `/api/xbos/tenant-scope/accessible` · `XBOS-TENANT-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'TenantScopeController.accessible.',
  goal: 'Trả danh sách tenant/company user được phép truy cập theo membership.',
  caps: [
    { id: 'CAP-T-ACC', name: 'Accessible tenants', purpose: 'List scope', actor: 'User',
      fns: [
        { id: 'FN-T-LIST', name: 'GET accessible', ui: 'GET tenant-scope/accessible', mutate: false },
        { id: 'FN-T-PICK', name: 'Chọn membership (nếu UI)', ui: 'POST auth/select-membership', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-T-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. GET accessible', exp: '200 · items chứa holding', layer: 'API', trace: 'TENANT-01' },
    { fn: 'FN-T-LIST', type: 'AU', pri: 'P0', persona: P.mem, pre: 'login member', steps: '1. GET accessible', exp: '200 · chỉ CT được gán · không full group trừ policy', layer: 'API', trace: 'RBAC ladder' },
    { fn: 'FN-T-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'user mới 0 membership', steps: '1. GET', exp: '200 empty · UI hướng dẫn', layer: 'UI/API', trace: 'empty' },
    { fn: 'FN-T-PICK', type: 'HP', pri: 'P1', persona: P.ceo, pre: '≥2 membership', steps: '1. select-membership tenantId', exp: '201 `XBOS-AUTH-201`', layer: 'API', trace: 'select-membership' },
    { fn: 'FN-T-PICK', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. select tenant không thuộc user', exp: '4xx/403', layer: 'API', trace: 'FD' },
    { fn: 'FN-T-PICK', type: 'AU', pri: 'P0', persona: P.anon, pre: '—', steps: '1. select không token', exp: '401', layer: 'API', trace: 'AU' },
  ],
  fe_be: baseFeBe('GET /tenant-scope/accessible', 'TENANT-01'),
});

add({
  id: 'UC-XBOS-TENANT-02', stt: 46, mod: 'M01', name_vi: 'Xem tổng quan tổ chức tập đoàn theo quyền',
  actors: 'Group CEO · Member (negative)',
  surfaces: 'api / web-portal',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE · group-org-overview',
  api: 'GET `/api/xbos/tenant-scope/group-org-overview` · `XBOS-TENANT-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'groupOrgOverview; member expect thu hẹp / 403 tùy service.',
  goal: 'Group CEO xem overview tổ chức tập đoàn; member không vượt quyền.',
  caps: [
    { id: 'CAP-T-OV', name: 'Overview tập đoàn', purpose: 'Đọc tree/summary', actor: 'Group CEO',
      fns: [
        { id: 'FN-T-OV', name: 'GET group-org-overview', ui: 'API/CC', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-T-OV', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login main', steps: '1. GET overview', exp: '200 · có holding + members summary', layer: 'API/UI', trace: 'TENANT-02' },
    { fn: 'FN-T-OV', type: 'AU', pri: 'P0', persona: P.mem, pre: 'login member', steps: '1. GET overview', exp: '403 hoặc payload thu hẹp deterministic', layer: 'API', trace: 'UF-XBOS-11' },
    { fn: 'FN-T-OV', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'API lỗi', steps: '1. Mở overview khi BE down', exp: 'banner lỗi honest · không mock giả là data thật (P0-09 liên quan)', layer: 'UI', trace: 'error UX' },
    { fn: 'FN-T-OV', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'userId spoof header', steps: '1. x-user-id người khác khi JWT khác', exp: 'JWT thắng · không escalate', layer: 'API', trace: 'resolveUserId' },
  ],
  fe_be: baseFeBe('GET /tenant-scope/group-org-overview', 'TENANT-02'),
});

add({
  id: 'UC-XBOS-TENANT-03', stt: 47, mod: 'M01', name_vi: 'Liệt kê đơn vị thành viên trong tập đoàn',
  actors: 'Group CEO · Member',
  surfaces: 'api / web-portal',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE · group-member-units',
  api: 'GET `/api/xbos/tenant-scope/group-member-units` · `XBOS-TENANT-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'groupMemberUnits + FE list member units UF-XBOS-02.',
  goal: 'Liệt kê đơn vị thành viên; Group CEO thấy đủ; Member chỉ phạm vi được phép.',
  caps: [
    { id: 'CAP-T-MU', name: 'Member units list', purpose: 'List LE', actor: 'CEO',
      fns: [
        { id: 'FN-T-MU', name: 'GET group-member-units', ui: 'CC list', mutate: false },
        { id: 'FN-T-MU-NAV', name: 'Click → chi tiết đơn vị', ui: 'CC detail', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-T-MU', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở list đơn vị / GET API', exp: '200 · ≥1 member row · VI labels', layer: 'UI/API', trace: 'UF-XBOS-02' },
    { fn: 'FN-T-MU', type: 'AU', pri: 'P0', persona: P.mem, pre: 'login member', steps: '1. GET member-units', exp: '403 hoặc chỉ CT mình', layer: 'API', trace: 'AU' },
    { fn: 'FN-T-MU', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'empty group (edge)', steps: '1. List', exp: 'empty hợp lệ', layer: 'UI', trace: 'empty' },
    { fn: 'FN-T-MU-NAV', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'list có row', steps: '1. Click đơn vị → detail', exp: 'detail load · không 404 scope (J-* L2.5)', layer: 'UI', trace: 'J-XBOS member detail' },
    { fn: 'FN-T-MU-NAV', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'id giả trên URL', steps: '1. Deep link UUID lạ', exp: '404/403 honest', layer: 'UI/API', trace: 'deep link' },
  ],
  fe_be: baseFeBe('GET /tenant-scope/group-member-units', 'UF-XBOS-02'),
});

// ——— 48–49 ECO-SCOPE ———
add({
  id: 'UC-ECO-SCOPE-01', stt: 48, mod: 'M00', name_vi: 'Truy cập khi chưa đăng nhập (phạm vi quản trị hệ thống)',
  actors: 'Anonymous',
  surfaces: 'web-portal / api',
  srs_new: 'N/A-DELTA · public vs protected routes',
  tech_spec: 'TECHSPEC_HE §8',
  api: 'Protected routes → 401; login page public',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'Portal route guard + API auth; pattern e2e_pass trên matrix.',
  goal: 'Chưa đăng nhập chỉ vào được bề mặt public (login); mọi API/CC bị chặn.',
  caps: [
    { id: 'CAP-ECO-ANON', name: 'Anonymous access control', purpose: 'Fail-closed', actor: 'Hệ thống',
      fns: [
        { id: 'FN-ECO-PUB', name: 'Mở trang login', ui: 'GET /login', mutate: false },
        { id: 'FN-ECO-BLOCK', name: 'Chặn CC/API', ui: 'GET /command-center · API', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-ECO-PUB', type: 'HP', pri: 'P0', persona: P.anon, pre: 'clear storage', steps: '1. Mở URL portal login', exp: 'form login hiển thị', layer: 'UI', trace: 'ECO-SCOPE-01' },
    { fn: 'FN-ECO-PUB', type: 'UX', pri: 'P1', persona: P.anon, pre: '—', steps: '1. Deep link CC khi anon', exp: 'redirect login · giữ returnUrl nếu có', layer: 'UI', trace: 'guard' },
    { fn: 'FN-ECO-BLOCK', type: 'AU', pri: 'P0', persona: P.anon, pre: '—', steps: '1. GET API org/raci/wf không token', exp: '401', layer: 'API', trace: 'AU' },
    { fn: 'FN-ECO-BLOCK', type: 'FD', pri: 'P0', persona: P.anon, pre: '—', steps: '1. Thử mutate shareholder không token', exp: '401 · không ghi DB', layer: 'API', trace: 'FD' },
  ],
  fe_be: baseFeBe('route guards', 'ECO-01'),
});

add({
  id: 'UC-ECO-SCOPE-02', stt: 49, mod: 'M00', name_vi: 'Truy cập khi đã đăng nhập (một tenant)',
  actors: 'User 1-tenant / multi-membership',
  surfaces: 'web-portal / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE §8',
  api: 'JWT + X-Tenant-ID match · select-membership',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'Scope header must match JWT; membership switch.',
  goal: 'Sau login, mọi thao tác gắn đúng một tenant active; đổi membership có kiểm soát.',
  caps: [
    { id: 'CAP-ECO-IN', name: 'In-session tenant scope', purpose: '1 tenant active', actor: 'User',
      fns: [
        { id: 'FN-ECO-USE', name: 'Gọi API với tenant khớp', ui: 'headers', mutate: false },
        { id: 'FN-ECO-MIS', name: 'Header tenant lệch JWT', ui: 'headers', mutate: false },
        { id: 'FN-ECO-SW', name: 'Đổi membership', ui: 'POST select-membership', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-ECO-USE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Gọi API với X-Tenant-ID khớp', exp: '2xx theo endpoint', layer: 'API', trace: 'ECO-02' },
    { fn: 'FN-ECO-MIS', type: 'AU', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. X-Tenant-ID khác JWT', exp: '401/403 deterministic', layer: 'API', trace: 'tenant match' },
    { fn: 'FN-ECO-MIS', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'login', steps: '1. Thiếu X-Tenant-ID khi bắt buộc', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-ECO-SW', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'multi membership', steps: '1. select-membership', exp: '201 · API sau dùng scope mới', layer: 'API/UI', trace: 'AUTH-201' },
    { fn: 'FN-ECO-SW', type: 'FD', pri: 'P0', persona: P.mem, pre: 'chỉ 1 CT', steps: '1. select tenant ngoài membership', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-ECO-USE', type: 'UX', pri: 'P2', persona: P.ceo, pre: 'session sắp hết', steps: '1. Thao tác muộn', exp: 're-login hoặc refresh policy rõ', layer: 'UI', trace: 'UX session' },
  ],
  fe_be: baseFeBe('JWT+tenant', 'ECO-02'),
});

// ——— 50 CC-P0-01 Shareholders (deep) ———
add({
  id: 'UC-CC-P0-01', stt: 50, mod: 'M00', name_vi: 'Quản lý cổ đông theo pháp nhân',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA · holding/member shareholders (UF-XBOS-04/05)',
  tech_spec: 'TECHSPEC_HE §8 · legal-entity-profile shareholders',
  api: 'GET/POST/PUT/DELETE `/api/xbos/org-foundation/legal-entities/:entityId/shareholders` · `XBOS-SHR-201` (runtime)',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'legal-entity-profile.controller shareholders CRUD; UF-XBOS-05 holding 🟢 reference.',
  goal: 'Thêm/sửa/xóa cổ đông trên pháp nhân (holding hoặc member) với validate vốn/%, FE sau 2xx + F5.',
  caps: [
    { id: 'CAP-SHR-R', name: 'Xem danh sách cổ đông', purpose: 'List theo LE', actor: 'CEO',
      fns: [
        { id: 'FN-SHR-LIST', name: 'List shareholders', ui: 'GET …/shareholders', mutate: false },
      ]},
    { id: 'CAP-SHR-C', name: 'Thêm cổ đông', purpose: 'POST', actor: 'CEO',
      fns: [
        { id: 'FN-SHR-ADD', name: 'Thêm + Lưu', ui: 'POST …/shareholders', mutate: true },
      ]},
    { id: 'CAP-SHR-U', name: 'Sửa cổ đông', purpose: 'PUT', actor: 'CEO',
      fns: [
        { id: 'FN-SHR-EDIT', name: 'Sửa + Lưu', ui: 'PUT …/shareholders/:id', mutate: true },
      ]},
    { id: 'CAP-SHR-D', name: 'Xóa cổ đông', purpose: 'DELETE soft/hard theo policy', actor: 'CEO',
      fns: [
        { id: 'FN-SHR-DEL', name: 'Xóa', ui: 'DELETE …/shareholders/:id', mutate: true },
      ]},
    { id: 'CAP-SHR-CTRL', name: 'Scope & validate', purpose: 'AU/FD', actor: 'Hệ thống',
      fns: [
        { id: 'FN-SHR-SCOPE', name: 'Member ngoài CT', ui: 'mutate', mutate: true },
        { id: 'FN-SHR-VAL', name: 'Validate %/MST', ui: 'POST', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-SHR-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'mở LE holding hoặc member', steps: '1. Tab Cổ đông', exp: '200 list · VI', layer: 'UI/API', trace: 'UF-XBOS-05' },
    { fn: 'FN-SHR-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'LE mới 0 cổ đông', steps: '1. Mở tab', exp: 'empty hợp lệ', layer: 'UI', trace: 'empty' },
    { fn: 'FN-SHR-ADD', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'TẬP ĐOÀN hoặc member detail', steps: '1. + Thêm cổ đông 2. Điền tên/%/góp vốn vi-VN 3. Lưu', exp: '201 · row · F5 còn (UF-XBOS-05)', layer: 'UI/API', trace: 'UF-XBOS-05 · XBOS-SHR-201' },
    { fn: 'FN-SHR-ADD', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form mở', steps: '1. Lưu thiếu tên hoặc % âm', exp: '4xx/FE block · không row ảo', layer: 'UI/API', trace: 'FD' },
    { fn: 'FN-SHR-ADD', type: 'BD', pri: 'P1', persona: P.ceo, pre: 'form', steps: '1. % = 0 và % = 100', exp: 'deterministic theo BR vốn', layer: 'UI/API', trace: 'BD %' },
    { fn: 'FN-SHR-EDIT', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'có row từ FE', steps: '1. Sửa % 2. Lưu 3. F5', exp: '200 · sticky', layer: 'UI/API', trace: 'PUT' },
    { fn: 'FN-SHR-EDIT', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'row', steps: '1. PUT id lạ', exp: '404', layer: 'API', trace: '404' },
    { fn: 'FN-SHR-DEL', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'row test', steps: '1. Xóa + confirm', exp: '2xx · biến khỏi list · F5', layer: 'UI/API', trace: 'DELETE' },
    { fn: 'FN-SHR-DEL', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'đã xóa', steps: '1. Xóa lại', exp: '404/no-op', layer: 'API', trace: 'idempotent' },
    { fn: 'FN-SHR-SCOPE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'login member', steps: '1. POST shareholder holding', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-SHR-VAL', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. Tổng % > 100 nếu BR cấm', exp: '4xx/banner', layer: 'UI/API', trace: 'BR vốn' },
    { fn: 'FN-SHR-VAL', type: 'BD', pri: 'P2', persona: P.ceo, pre: 'form', steps: '1. Số tiền góp có grouping vi-VN', exp: 'parse đúng number API', layer: 'UI', trace: 'U72 money' },
  ],
  fe_be: baseFeBe('…/shareholders', 'UF-XBOS-04/05'),
});

// ——— 51 docs ———
add({
  id: 'UC-CC-P0-02', stt: 51, mod: 'M00', name_vi: 'Quản lý tài liệu pháp lý và tải / xem file',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE §8 · documents upload',
  api: 'POST/GET `/api/xbos/org-foundation/legal-entities/:id/documents` · upload · GET `/legal-documents/:id/file`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'documents + upload + file GET; UF-XBOS-06 reference.',
  goal: 'Thêm tài liệu pháp lý, upload file, xem file 200, F5 còn metadata.',
  caps: [
    { id: 'CAP-DOC', name: 'CRUD tài liệu', purpose: 'metadata + file', actor: 'CEO',
      fns: [
        { id: 'FN-DOC-LIST', name: 'List docs', ui: 'GET documents', mutate: false },
        { id: 'FN-DOC-ADD', name: 'Thêm + upload', ui: 'POST + upload', mutate: true },
        { id: 'FN-DOC-VIEW', name: 'Xem file', ui: 'GET …/file', mutate: false },
        { id: 'FN-DOC-DEL', name: 'Xóa doc', ui: 'DELETE', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-DOC-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'LE mở', steps: '1. Tab tài liệu', exp: '200 list', layer: 'UI/API', trace: 'P0-02' },
    { fn: 'FN-DOC-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: '0 docs', steps: '1. Mở tab', exp: 'empty', layer: 'UI', trace: 'empty' },
    { fn: 'FN-DOC-ADD', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'LE', steps: '1. + Thêm 2. upload file hợp lệ 3. Lưu', exp: '2xx · F5 còn · UF-XBOS-06', layer: 'UI/API', trace: 'UF-XBOS-06' },
    { fn: 'FN-DOC-ADD', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. upload loại file cấm / quá size', exp: '4xx · không metadata mồ côi', layer: 'API', trace: 'FD mime' },
    { fn: 'FN-DOC-VIEW', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'đã upload', steps: '1. Xem file', exp: 'GET file **200**', layer: 'UI/API', trace: 'file 200' },
    { fn: 'FN-DOC-VIEW', type: 'AU', pri: 'P0', persona: P.mem, pre: 'doc holding', steps: '1. GET file', exp: '403/404', layer: 'API', trace: 'AU' },
    { fn: 'FN-DOC-DEL', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'doc test', steps: '1. Xóa', exp: '2xx · F5 hết', layer: 'UI/API', trace: 'DEL' },
    { fn: 'FN-DOC-DEL', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'id lạ', steps: '1. DELETE', exp: '404', layer: 'API', trace: '404' },
  ],
  fe_be: baseFeBe('documents/upload', 'UF-XBOS-06'),
});

// ——— 52 dept ———
add({
  id: 'UC-CC-P0-03', stt: 52, mod: 'M00', name_vi: 'Lưu và xóa phòng ban',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA · org-units',
  tech_spec: 'TECHSPEC_HE §8 · org-units',
  api: 'POST/PUT/DELETE `/api/xbos/org-foundation/org-units` · tree GET',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'org-foundation org-units; UF-XBOS-12 🟢 reference.',
  goal: 'Thêm/sửa/xóa phòng ban (org-unit) theo pháp nhân, tree cập nhật sau F5.',
  caps: [
    { id: 'CAP-DEPT', name: 'CRUD phòng ban', purpose: 'org-units', actor: 'CEO',
      fns: [
        { id: 'FN-DEPT-TREE', name: 'Xem tree', ui: 'GET org-units/tree', mutate: false },
        { id: 'FN-DEPT-ADD', name: 'Thêm PB', ui: 'POST org-units', mutate: true },
        { id: 'FN-DEPT-EDIT', name: 'Sửa PB', ui: 'PUT', mutate: true },
        { id: 'FN-DEPT-DEL', name: 'Xóa PB', ui: 'DELETE', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-DEPT-TREE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'chọn LE', steps: '1. Mở phòng ban', exp: '200 tree', layer: 'UI/API', trace: 'UF-XBOS-12' },
    { fn: 'FN-DEPT-TREE', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'LE mới', steps: '1. Tree', exp: 'empty/root only', layer: 'UI', trace: 'empty' },
    { fn: 'FN-DEPT-ADD', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'LE', steps: '1. Thêm tên/mã 2. Lưu', exp: '201 · F5 còn', layer: 'UI/API', trace: 'UF-XBOS-12' },
    { fn: 'FN-DEPT-ADD', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. Trùng mã / thiếu tên', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-DEPT-EDIT', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'PB tồn tại', steps: '1. Sửa tên 2. Lưu 3. F5', exp: '200 sticky', layer: 'UI/API', trace: 'PUT' },
    { fn: 'FN-DEPT-EDIT', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. PUT id lạ', exp: '404', layer: 'API', trace: '404' },
    { fn: 'FN-DEPT-DEL', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'PB không con / policy cho xóa', steps: '1. Xóa', exp: '2xx · khỏi tree F5', layer: 'UI/API', trace: 'DEL' },
    { fn: 'FN-DEPT-DEL', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'PB có con', steps: '1. Xóa', exp: '4xx conflict honest', layer: 'API', trace: 'FK' },
    { fn: 'FN-DEPT-ADD', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. POST org-unit LE khác', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-DEPT-ADD', type: 'BD', pri: 'P2', persona: P.ceo, pre: 'form', steps: '1. Tên dài max', exp: 'accept/4xx deterministic', layer: 'API', trace: 'BD' },
  ],
  fe_be: baseFeBe('org-units', 'UF-XBOS-12'),
});

// ——— 53 RBAC matrix ———
add({
  id: 'UC-CC-P0-04', stt: 53, mod: 'M00', name_vi: 'Ma trận phân quyền theo vai trò',
  actors: 'Group CEO / Admin',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA · position-rbac',
  tech_spec: 'TECHSPEC_HE §8 · position-rbac',
  api: 'GET/PUT `/api/xbos/position-rbac/*` (runtime flags)',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'position-rbac.controller; UF-XBOS-13 🟢.',
  goal: 'Bật/tắt quyền theo chức danh/vai trên ma trận Settings, Lưu sticky F5.',
  caps: [
    { id: 'CAP-RBAC', name: 'Ma trận position-rbac', purpose: 'CRUD flags', actor: 'CEO',
      fns: [
        { id: 'FN-RBAC-OPEN', name: 'Mở ma trận', ui: 'GET', mutate: false },
        { id: 'FN-RBAC-SAVE', name: 'Checkbox + Lưu', ui: 'PUT', mutate: true },
      ]},
    { id: 'CAP-RBAC-CTRL', name: 'Chống escalate', purpose: 'AU', actor: 'Hệ thống',
      fns: [
        { id: 'FN-RBAC-AU', name: 'Member sửa ma trận tập đoàn', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-RBAC-OPEN', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Settings → ma trận phân quyền', exp: '200 grid', layer: 'UI/API', trace: 'UF-XBOS-13' },
    { fn: 'FN-RBAC-OPEN', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Load chậm', exp: 'loading', layer: 'UI', trace: 'UX' },
    { fn: 'FN-RBAC-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'grid mở', steps: '1. Đổi checkbox 2. Lưu 3. F5', exp: 'PUT 200 · sticky', layer: 'UI/API', trace: 'UF-XBOS-13' },
    { fn: 'FN-RBAC-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'grid', steps: '1. PUT payload thiếu role/permission key', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-RBAC-SAVE', type: 'BD', pri: 'P2', persona: P.ceo, pre: 'grid', steps: '1. Bật tất cả / tắt tất cả', exp: '200 deterministic', layer: 'UI/API', trace: 'BD' },
    { fn: 'FN-RBAC-AU', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT matrix holding', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-RBAC-AU', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Tự gán quyền vượt BR (nếu có)', exp: 'reject hoặc audit', layer: 'API', trace: 'conflict' },
  ],
  fe_be: baseFeBe('position-rbac', 'UF-XBOS-13'),
});

// ——— 54 CC catalogs ———
add({
  id: 'UC-CC-P0-05', stt: 54, mod: 'M00', name_vi: 'Danh mục văn bản / đo lường / giá (Command Center)',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA · command_center_catalogs',
  tech_spec: 'TECHSPEC_HE §8 · business-master',
  api: 'GET/PUT `/api/xbos/business-master/command_center_catalogs/items*`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'business-master domain command_center_catalogs; UF-XBOS-14.',
  goal: 'Xem và autosave danh mục CC (regulations|measurements|pricing) theo partition holding.',
  caps: [
    { id: 'CAP-CCC', name: 'Catalog CC', purpose: 'list+autosave', actor: 'CEO',
      fns: [
        { id: 'FN-CCC-LIST', name: 'List kinds', ui: 'GET items', mutate: false },
        { id: 'FN-CCC-SAVE', name: 'Autosave item', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-CCC-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login main', steps: '1. Mở catalog CC', exp: '200 holding', layer: 'UI/API', trace: 'UF-XBOS-14' },
    { fn: 'FN-CCC-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'empty kind', steps: '1. Mở', exp: 'empty/template', layer: 'UI', trace: 'empty' },
    { fn: 'FN-CCC-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'list mở', steps: '1. Sửa giá trị 2. Autosave 3. F5', exp: 'PUT 200 · version sticky', layer: 'UI/API', trace: 'UF-XBOS-14' },
    { fn: 'FN-CCC-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. PUT kind không thuộc allow-list', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-CCC-SAVE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT holding catalogs', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-CCC-SAVE', type: 'BD', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. Chuỗi rất dài', exp: '4xx/truncate policy', layer: 'API', trace: 'BD' },
  ],
  fe_be: baseFeBe('business-master/command_center_catalogs', 'UF-XBOS-14'),
});

// ——— 55 Inbox WF (deep 12–30) ———
add({
  id: 'UC-CC-P0-06', stt: 55, mod: 'M00', name_vi: 'Hộp thư — mở chi tiết tác vụ quy trình',
  actors: 'Approver · Group CEO · Submitter',
  surfaces: 'xbos-cc / api',
  srs_new: '`SRS_VN.md` — máy trạng thái WF phê duyệt **hai cấp**, chống tự phê duyệt, SLA 24h/48h (map khi UI hiện L2)',
  tech_spec: 'TECHSPEC_HE §8 · workflow-engine tasks',
  api: 'GET `/api/xbos/workflow-engine/tasks` `XBOS-WF-203` · GET `instances/:id/detail` `XBOS-WF-204` · POST `tasks/:id/complete` `XBOS-WF-200` · POST `tasks/:id/reject` `XBOS-WF-205` · alias approve path qua complete · `API_CONTRACT_VN` POST `/xbos/workflows/:id/approve|reject`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'workflow-engine complete/reject + CC inbox FE; UF-XBOS-08; BR-WF-04 self-approve unit tests.',
  goal: 'Mở hộp thư, xem chi tiết task WF sinh từ FE (không seed), duyệt/từ chối đúng assignee, chặn tự duyệt và sai scope; hỗ trợ quan sát bước L2 khi definition 2 cấp.',
  wf: true,
  spec_gap: 'SRS_VN mô tả SLA/escalate — verify UI có/không; không invent PASS escalate nếu UI chưa có',
  caps: [
    { id: 'CAP-INB-R', name: 'Mở hộp thư & chi tiết', purpose: 'Đọc task', actor: 'Approver',
      fns: [
        { id: 'FN-INB-LIST', name: 'List inbox tasks', ui: 'GET /workflow-engine/tasks', mutate: false },
        { id: 'FN-INB-DET', name: 'Mở chi tiết phiên/task', ui: 'GET instances/:id/detail', mutate: false },
      ]},
    { id: 'CAP-INB-AP', name: 'Phê duyệt bước', purpose: 'complete/approve', actor: 'Approver',
      fns: [
        { id: 'FN-INB-APPR', name: 'Duyệt / Xử lý nhanh', ui: 'POST tasks/:id/complete', mutate: true },
        { id: 'FN-INB-L2', name: 'Duyệt cấp 2 (khi WF 2-level)', ui: 'POST complete L2', mutate: true },
      ]},
    { id: 'CAP-INB-RJ', name: 'Từ chối bước', purpose: 'reject + lý do', actor: 'Approver',
      fns: [
        { id: 'FN-INB-REJ', name: 'Từ chối', ui: 'POST tasks/:id/reject', mutate: true },
      ]},
    { id: 'CAP-INB-CTRL', name: 'Self-approve & scope', purpose: 'BR-WF-04 · AU', actor: 'Hệ thống',
      fns: [
        { id: 'FN-INB-SELF', name: 'Chặn tự duyệt', ui: 'complete', mutate: true },
        { id: 'FN-INB-SCOPE', name: 'Task ngoài scope CT', ui: 'complete', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-INB-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'đã có task từ chuỗi FE (U65 — không seed)', steps: '1. CC → Hộp thư', exp: '200 `XBOS-WF-203` · thấy task stamp', layer: 'UI/API', trace: 'UF-XBOS-08' },
    { fn: 'FN-INB-LIST', type: 'UX', pri: 'P0', persona: P.ceo, pre: 'inbox trống', steps: '1. Mở Hộp thư', exp: 'empty · **BLOCKED** tạo nguồn FE — cấm seed', layer: 'UI', trace: 'U65' },
    { fn: 'FN-INB-DET', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'có task', steps: '1. Click mở chi tiết', exp: '200 `XBOS-WF-204` · steps/assignee', layer: 'UI/API', trace: 'P0-06' },
    { fn: 'FN-INB-DET', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Deep link instanceId giả', exp: '404', layer: 'API', trace: '404' },
    { fn: 'FN-INB-APPR', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'task pending gán CEO từ FE spawn', steps: '1. Duyệt/Xử lý nhanh', exp: '201/200 `XBOS-WF-200` · card biến · F5 · consumer sync', layer: 'UI/API', trace: 'UF-XBOS-08 · complete' },
    { fn: 'FN-INB-APPR', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'task already completed', steps: '1. complete lại', exp: '4xx/no-op', layer: 'API', trace: 'FD done' },
    { fn: 'FN-INB-APPR', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'sau duyệt', steps: '1. Quan sát list', exp: 'count giảm không cần hard-refresh sai', layer: 'UI', trace: 'UX' },
    { fn: 'FN-INB-L2', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'definition 2-level · L1 đã duyệt · task L2 pending (tạo từ FE)', steps: '1. Approver L2 Duyệt', exp: '`XBOS-WF-200` · instance terminal/completed · F5', layer: 'UI/API', trace: 'SRS_VN 2-level' },
    { fn: 'FN-INB-L2', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'L1 chưa xong', steps: '1. Cố complete L2 sớm', exp: '4xx / không hiện task', layer: 'API', trace: 'order' },
    { fn: 'FN-INB-L2', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'giữa L1–L2', steps: '1. Xem detail', exp: 'hiển thị cấp đang chờ', layer: 'UI', trace: 'UX L2' },
    { fn: 'FN-INB-REJ', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'task pending từ FE', steps: '1. Từ chối + lý do ≥10 ký tự', exp: '`XBOS-WF-205` · status rejected · F5', layer: 'UI/API', trace: 'reject · API_CONTRACT min 10' },
    { fn: 'FN-INB-REJ', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'task pending', steps: '1. Reject lý do <10', exp: '4xx', layer: 'API', trace: 'FD reason' },
    { fn: 'FN-INB-REJ', type: 'BD', pri: 'P1', persona: P.ceo, pre: 'task', steps: '1. Lý do đúng 10 ký tự', exp: '205/2xx accept', layer: 'API', trace: 'BD' },
    { fn: 'FN-INB-SELF', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'user vừa submit instance (cùng email assignee)', steps: '1. Cố Duyệt task mình', exp: 'chặn BR-WF-04 · không complete', layer: 'API/UI', trace: 'BR-WF-04 · resolver-registry.spec' },
    { fn: 'FN-INB-SELF', type: 'HP', pri: 'P1', persona: 'Approver khác hat', pre: 'task gán đúng hat', steps: '1. Duyệt', exp: '2xx (đối chứng self fail)', layer: 'UI/API', trace: 'multi-hat' },
    { fn: 'FN-INB-SCOPE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'task holding', steps: '1. complete bằng JWT member', exp: '403/409/404', layer: 'API', trace: 'AU scope' },
    { fn: 'FN-INB-SCOPE', type: 'AU', pri: 'P0', persona: P.ceo, pre: 'task assignee khác user', steps: '1. complete không phải assignee', exp: '403/4xx', layer: 'API', trace: 'assignee AU' },
    { fn: 'FN-INB-LIST', type: 'AU', pri: 'P1', persona: P.mem, pre: 'login member', steps: '1. List tasks', exp: 'chỉ task trong scope CT', layer: 'API', trace: 'list scope' },
  ],
  fe_be: {
    be: 'workflow-engine.controller complete/reject/listTasks/detail',
    be_ev: 'apps/api/xbos-api/src/workflow-engine/workflow-engine.controller.ts',
    fe: 'CC Hộp thư · Duyệt/Từ chối · confirm dialog nếu có',
    fe_ev: 'UF-XBOS-08 evidence',
    rbac: 'assignee + company scope + BR-WF-04',
    rbac_ev: 'resolver-registry.spec BR-WF-04',
  },
  gaps: { self: '—', spec: 'SLA escalate UI có thể SPEC_GAP — ghi khi chạy' },
});

// ——— 56 workspace overview ———
add({
  id: 'UC-CC-P0-08', stt: 56, mod: 'M00', name_vi: 'Thông tin tổng quan không gian làm việc',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE §8 · command-center',
  api: 'GET `/api/xbos/command-center/*` / cockpit widgets',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Command-center controller + FE widgets; một phần pattern API trên matrix.',
  goal: 'Hiển thị tổng quan workspace (KPI/tác vụ/cảnh báo tóm tắt) đúng scope main.',
  caps: [
    { id: 'CAP-WS', name: 'Workspace overview', purpose: 'Đọc widgets', actor: 'CEO',
      fns: [
        { id: 'FN-WS-OPEN', name: 'Mở CC home', ui: 'CC', mutate: false },
        { id: 'FN-WS-WIDGET', name: 'Load widgets', ui: 'API widgets', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-WS-OPEN', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Vào Command Center', exp: 'shell + overview', layer: 'UI', trace: 'P0-08' },
    { fn: 'FN-WS-OPEN', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Reload', exp: 'không trắng', layer: 'UI', trace: 'UX' },
    { fn: 'FN-WS-WIDGET', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Quan sát KPI/task widgets', exp: 'label VI · 2xx hoặc empty hợp lệ', layer: 'UI/API', trace: 'UF-XBOS-01/10' },
    { fn: 'FN-WS-WIDGET', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Mở rollup tập đoàn', exp: '403/409 không lộ holding rollup', layer: 'UI/API', trace: 'UF-XBOS-11' },
    { fn: 'FN-WS-WIDGET', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'BE down', steps: '1. Mở CC', exp: 'banner ERROR honest', layer: 'UI', trace: 'error' },
  ],
  fe_be: baseFeBe('command-center', 'P0-08'),
});

// ——— 57 mock policy ———
add({
  id: 'UC-CC-P0-09', stt: 57, mod: 'M00', name_vi: 'Chính sách hiển thị dữ liệu tạm khi API chưa sẵn sàng',
  actors: 'FE runtime · QA',
  surfaces: 'web-portal',
  srs_new: 'N/A-DELTA · mock vs live policy',
  tech_spec: 'TECHSPEC_HE §8',
  api: 'N/A — FE policy; API fail → không fake business rows',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Policy sản phẩm: empty/error vs mock; cần spot FE flags — design cases bắt buộc honest UI.',
  goal: 'Khi API lỗi/chưa sẵn, UI không giả dữ liệu nghiệp vụ như thật; phân biệt mock demo vs live.',
  caps: [
    { id: 'CAP-MOCK', name: 'Honest empty/error', purpose: 'Không fake UAT', actor: 'FE',
      fns: [
        { id: 'FN-MOCK-ERR', name: 'API 5xx/down', ui: 'banner', mutate: false },
        { id: 'FN-MOCK-EMPTY', name: 'API 200 empty', ui: 'empty state', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-MOCK-ERR', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'tắt hrm/xbos proxy giả lập', steps: '1. Mở màn CC phụ thuộc API', exp: 'ERROR/banner · không bảng giả', layer: 'UI', trace: 'P0-09' },
    { fn: 'FN-MOCK-ERR', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'API 409 scope', steps: '1. Mở KPI holding bằng member', exp: 'hiện 409 · không mock series', layer: 'UI', trace: '409' },
    { fn: 'FN-MOCK-EMPTY', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'API 200 []', steps: '1. Mở list', exp: 'empty hợp lệ · không spinner storm', layer: 'UI', trace: 'empty' },
    { fn: 'FN-MOCK-EMPTY', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Toggle demo flag nếu còn', exp: 'nhãn rõ «dữ liệu mẫu» hoặc tắt trên UAT', layer: 'UI', trace: 'demo label' },
    { fn: 'FN-MOCK-ERR', type: 'AU', pri: 'P2', persona: P.anon, pre: '—', steps: '1. Protected', exp: 'login redirect ≠ fake data', layer: 'UI', trace: 'AU' },
  ],
  fe_be: baseFeBe('FE policy', 'P0-09'),
});

// ——— 58 CC-01 dept per LE ———
add({
  id: 'UC-CC-01', stt: 58, mod: 'M00', name_vi: 'Cấu hình phòng ban theo từng pháp nhân',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE §8 · org-units per LE',
  api: 'GET tree + POST org-units scoped entityId',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'org-foundation.controller.spec UC-CC-01; overlap P0-03 — cases tập trung per-LE switch.',
  goal: 'Chọn pháp nhân → cấu hình phòng ban chỉ của LE đó; không lẫn tree CT khác.',
  caps: [
    { id: 'CAP-CC01', name: 'Dept per LE', purpose: 'scope LE', actor: 'CEO',
      fns: [
        { id: 'FN-CC01-SEL', name: 'Chọn pháp nhân', ui: 'CC', mutate: false },
        { id: 'FN-CC01-CFG', name: 'Cấu hình PB', ui: 'POST/PUT org-units', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-CC01-SEL', type: 'HP', pri: 'P0', persona: P.ceo, pre: '≥2 LE', steps: '1. Chọn LE A vs B', exp: 'tree đổi theo LE', layer: 'UI/API', trace: 'CC-01' },
    { fn: 'FN-CC01-SEL', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Đổi LE nhanh', exp: 'không flash data LE cũ', layer: 'UI', trace: 'UX race' },
    { fn: 'FN-CC01-CFG', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'LE A', steps: '1. Thêm PB 2. F5', exp: '201 · chỉ trên LE A', layer: 'UI/API', trace: 'CC-01' },
    { fn: 'FN-CC01-CFG', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'LE A', steps: '1. Lưu thiếu tên', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-CC01-CFG', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Cấu hình LE ngoài scope', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-CC01-CFG', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'LE A', steps: '1. POST entityId của LE B trong context A', exp: 'reject/scope fail', layer: 'API', trace: 'cross-LE' },
  ],
  fe_be: baseFeBe('org-units per LE', 'CC-01'),
});

add({
  id: 'UC-CC-03', stt: 59, mod: 'M00', name_vi: 'Chi tiết đơn vị thành viên — hồ sơ pháp nhân và liên kết',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE §8 · legal-entities GET',
  api: 'GET `/api/xbos/org-foundation/legal-entities/:entityId`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'Detail LE + tabs cổ đông/RACI/docs; UF-XBOS-02/03.',
  goal: 'Mở chi tiết đơn vị thành viên: hồ sơ pháp nhân, điều hướng tab liên quan không 404 scope.',
  caps: [
    { id: 'CAP-CC03', name: 'Member unit detail', purpose: 'Đọc LE', actor: 'CEO',
      fns: [
        { id: 'FN-CC03-OPEN', name: 'Mở detail', ui: 'GET LE', mutate: false },
        { id: 'FN-CC03-TAB', name: 'Chuyển tab hồ sơ/cổ đông/RACI', ui: 'CC tabs', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-CC03-OPEN', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'list có row', steps: '1. Click Chỉnh sửa/detail', exp: '200 · form hồ sơ', layer: 'UI/API', trace: 'UF-XBOS-02' },
    { fn: 'FN-CC03-OPEN', type: 'AU', pri: 'P0', persona: P.mem, pre: 'LE khác', steps: '1. Deep link', exp: '403/404', layer: 'API', trace: 'AU' },
    { fn: 'FN-CC03-OPEN', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. UUID lạ', exp: '404', layer: 'API', trace: '404' },
    { fn: 'FN-CC03-TAB', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'detail mở', steps: '1. Tab cổ đông → RACI', exp: 'load OK · J L2.5', layer: 'UI', trace: 'cross-nav' },
    { fn: 'FN-CC03-TAB', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Tab chậm', exp: 'loading per tab', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('legal-entities/:id', 'CC-03'),
});

add({
  id: 'UC-CC-04', stt: 60, mod: 'M00', name_vi: 'Lưu thông tin pháp nhân',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE §8 · PUT legal-entities',
  api: 'PUT/POST `/api/xbos/org-foundation/legal-entities/:entityId`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'UF-XBOS-03 PUT 200 + F5.',
  goal: 'Sửa và Lưu hồ sơ pháp nhân (tên, MST, địa chỉ, đại diện…) sticky sau F5.',
  caps: [
    { id: 'CAP-CC04', name: 'Lưu hồ sơ LE', purpose: 'PUT profile', actor: 'CEO',
      fns: [
        { id: 'FN-CC04-SAVE', name: 'Lưu thay đổi', ui: 'PUT LE', mutate: true },
        { id: 'FN-CC04-VAL', name: 'Validate MST/fields', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-CC04-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'detail member', steps: '1. Sửa địa chỉ 2. Lưu thay đổi 3. F5', exp: 'PUT 200 · sticky · UF-XBOS-03', layer: 'UI/API', trace: 'UF-XBOS-03' },
    { fn: 'FN-CC04-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. Xóa tên bắt buộc → Lưu', exp: '4xx/FE block', layer: 'UI/API', trace: 'FD' },
    { fn: 'FN-CC04-SAVE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT LE tập đoàn', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-CC04-VAL', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. MST sai định dạng', exp: '4xx', layer: 'API', trace: 'MST' },
    { fn: 'FN-CC04-VAL', type: 'BD', pri: 'P1', persona: P.ceo, pre: 'form', steps: '1. Vốn điều lệ vi-VN grouping', exp: 'parse number đúng', layer: 'UI', trace: 'money' },
    { fn: 'FN-CC04-SAVE', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'sau 200', steps: '1. Quan sát toast', exp: 'toast success · không overlay kẹt', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('PUT legal-entities', 'UF-XBOS-03'),
});

add({
  id: 'UC-XBOS-CC-05', stt: 61, mod: 'M01', name_vi: 'Thanh điều hành — KPI / tác vụ / cảnh báo',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE · command-center strip',
  api: 'GET kpi-engine / alerts / workflow tasks summary',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Widgets CC; KPI series[] empty hợp lệ; member 409 holding.',
  goal: 'Thanh điều hành hiển thị KPI/tác vụ/cảnh báo đúng persona; không 409 trên Group CEO main.',
  caps: [
    { id: 'CAP-CC05', name: 'Ops strip', purpose: 'Đọc 3 vùng', actor: 'CEO',
      fns: [
        { id: 'FN-CC05-KPI', name: 'KPI strip', ui: 'kpi-engine', mutate: false },
        { id: 'FN-CC05-TASK', name: 'Tác vụ chờ', ui: 'WF tasks', mutate: false },
        { id: 'FN-CC05-ALRT', name: 'Cảnh báo', ui: 'alerts', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-CC05-KPI', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login main', steps: '1. Quan sát widget KPI', exp: '2xx hoặc series[] · label VI', layer: 'UI/API', trace: 'UF-XBOS-10' },
    { fn: 'FN-CC05-KPI', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Rollup holding', exp: '403/409', layer: 'API', trace: 'UF-XBOS-11' },
    { fn: 'FN-CC05-TASK', type: 'HP', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Vùng Việc cần xử lý', exp: 'count ≥0 · click → inbox', layer: 'UI', trace: 'CC-05' },
    { fn: 'FN-CC05-TASK', type: 'UX', pri: 'P1', persona: P.ceo, pre: '0 task', steps: '1. Strip', exp: '0 hợp lệ', layer: 'UI', trace: 'empty' },
    { fn: 'FN-CC05-ALRT', type: 'HP', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Vùng cảnh báo', exp: '2xx/empty', layer: 'UI/API', trace: 'alerts' },
    { fn: 'FN-CC05-ALRT', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'API 500', steps: '1. Mở strip', exp: 'banner · không fake alert', layer: 'UI', trace: 'FD' },
  ],
  fe_be: baseFeBe('CC strip', 'CC-05'),
});

// ——— 62 Canvas WF deep ———
add({
  id: 'UC-XBOS-CC-06', stt: 62, mod: 'M01', name_vi: 'Canvas quy trình',
  actors: 'Group CEO / Admin QT',
  surfaces: 'xbos-cc / api',
  srs_new: '`SRS_VN.md` — WF 2-level · chống tự phê duyệt (khi spawn inbox)',
  tech_spec: 'TECHSPEC_HE · workflow-engine definitions',
  api: 'GET/POST/PUT `/api/xbos/workflow-engine/definitions` `XBOS-WF-200/201` · POST `instances` `XBOS-WF-201` · approve/reject qua tasks complete/reject',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'Canvas save → definition; có thể spawn inbox (UF-XBOS-08 path).',
  goal: 'Mở canvas, lưu/kích hoạt definition (kể cả 2 bước duyệt), F5 còn graph; validate thiếu bước; scope apply-to units.',
  wf: true,
  caps: [
    { id: 'CAP-CV-R', name: 'Mở canvas', purpose: 'Đọc definition', actor: 'Admin QT',
      fns: [
        { id: 'FN-CV-OPEN', name: 'Mở canvas QT', ui: 'GET definitions', mutate: false },
      ]},
    { id: 'CAP-CV-W', name: 'Lưu / active definition', purpose: 'Persist graph', actor: 'Admin QT',
      fns: [
        { id: 'FN-CV-SAVE', name: 'Lưu canvas', ui: 'POST/PUT definitions', mutate: true },
        { id: 'FN-CV-L2', name: 'Cấu hình 2 cấp duyệt', ui: 'PUT graph 2 steps', mutate: true },
      ]},
    { id: 'CAP-CV-SP', name: 'Spawn thử từ canvas/policy', purpose: 'instances', actor: 'Admin',
      fns: [
        { id: 'FN-CV-SPAWN', name: 'Khởi tạo instance', ui: 'POST instances', mutate: true },
      ]},
    { id: 'CAP-CV-CTRL', name: 'Validate & scope', purpose: 'FD/AU', actor: 'Hệ thống',
      fns: [
        { id: 'FN-CV-VAL', name: 'Thiếu bước/vai', ui: 'PUT', mutate: true },
        { id: 'FN-CV-SCOPE', name: 'Apply-to member sai', ui: 'PUT', mutate: true },
        { id: 'FN-CV-SELF', name: 'Sau spawn — self-approve chặn', ui: 'complete', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-CV-OPEN', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. CC → Quy trình → mở canvas', exp: '200 definitions · canvas render', layer: 'UI/API', trace: 'CC-06' },
    { fn: 'FN-CV-OPEN', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. API chậm', exp: 'loading · không trắng', layer: 'UI', trace: 'UX' },
    { fn: 'FN-CV-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'canvas mở', steps: '1. Sửa node/edge 2. Lưu 3. F5', exp: '`XBOS-WF-201` · graph sticky', layer: 'UI/API', trace: 'UF WF canvas' },
    { fn: 'FN-CV-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'canvas', steps: '1. Lưu graph rỗng / thiếu end', exp: '4xx/`XBOS-WF-400`', layer: 'API', trace: 'FD' },
    { fn: 'FN-CV-L2', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'canvas', steps: '1. Thêm bước L1+L2 approver hats 2. Lưu active', exp: '201 · 2 pending steps khi spawn', layer: 'UI/API', trace: 'SRS_VN 2-level' },
    { fn: 'FN-CV-L2', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. L2 không gán resolver', exp: 'validate fail', layer: 'API', trace: 'FD L2' },
    { fn: 'FN-CV-L2', type: 'BD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Đúng 2 bước vs 3 bước', exp: 'accept theo BR', layer: 'API', trace: 'BD' },
    { fn: 'FN-CV-SPAWN', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'definition active', steps: '1. POST instances từ FE path', exp: '`XBOS-WF-201` · inbox có task', layer: 'API/UI', trace: 'instances' },
    { fn: 'FN-CV-SPAWN', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'definition inactive', steps: '1. Spawn', exp: '4xx SPAWN-MISSING honest', layer: 'API', trace: 'FD spawn' },
    { fn: 'FN-CV-VAL', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'canvas', steps: '1. Edge reject không dashed policy UI', exp: 'FE warning hoặc save fail theo BR', layer: 'UI', trace: 'UX dashed' },
    { fn: 'FN-CV-SCOPE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT definition holding', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-CV-SCOPE', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'apply-to unit lạ', steps: '1. Lưu apply scope sai partition', exp: 'reject (workflow-apply-scope)', layer: 'API', trace: 'apply-scope' },
    { fn: 'FN-CV-SELF', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'spawn instance do chính user', steps: '1. Inbox tự duyệt', exp: 'BR-WF-04 block', layer: 'API/UI', trace: 'self-approve' },
    { fn: 'FN-CV-SELF', type: 'HP', pri: 'P1', persona: 'Approver khác', pre: 'task gán đúng', steps: '1. complete', exp: '`XBOS-WF-200`', layer: 'API', trace: 'approve ok' },
    { fn: 'FN-CV-SAVE', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'sau save', steps: '1. Quan sát', exp: 'toast · canvas không mất node', layer: 'UI', trace: 'UX' },
  ],
  fe_be: {
    be: 'workflow-engine definitions/instances/tasks',
    be_ev: 'workflow-engine.controller.ts',
    fe: 'CC Quy trình canvas dots + Bézier',
    fe_ev: 'UF canvas / WF',
    rbac: 'main vs member apply-to + BR-WF-04',
    rbac_ev: 'workflow-apply-scope.ts',
  },
});

add({
  id: 'UC-XBOS-CC-07', stt: 63, mod: 'M01', name_vi: 'Hạ tầng — danh mục nền',
  actors: 'Group CEO / Platform admin',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE · infrastructure / config-sync catalogs',
  api: 'GET/PUT infrastructure · GET config-sync/catalogs',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'infrastructure.controller + config-sync; FE Hạ tầng menu.',
  goal: 'Xem/cấu hình hạ tầng danh mục nền tập đoàn từ CC.',
  caps: [
    { id: 'CAP-CC07', name: 'Infra catalog nền', purpose: 'Đọc/sửa', actor: 'Admin',
      fns: [
        { id: 'FN-CC07-VIEW', name: 'Xem hạ tầng', ui: 'GET', mutate: false },
        { id: 'FN-CC07-SAVE', name: 'Sửa cấu hình', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-CC07-VIEW', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở Hạ tầng', exp: '200 summary', layer: 'UI/API', trace: 'CC-07' },
    { fn: 'FN-CC07-VIEW', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Empty bootstrap', exp: 'empty/CTA bootstrap', layer: 'UI', trace: 'UX' },
    { fn: 'FN-CC07-SAVE', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'form', steps: '1. Sửa 2. Lưu 3. F5', exp: '2xx sticky', layer: 'UI/API', trace: 'INF overlap' },
    { fn: 'FN-CC07-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. PUT key cấm', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-CC07-SAVE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT infra holding', exp: '403/409', layer: 'API', trace: 'AU' },
  ],
  fe_be: baseFeBe('infrastructure', 'CC-07'),
});

add({
  id: 'UC-XBOS-CC-08', stt: 64, mod: 'M01', name_vi: 'Hệ thống phòng ban mẫu',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'TECHSPEC_HE · dept_system_templates',
  api: 'GET/PUT business-master domain `dept_system_templates`',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'business-master dept_system_templates; org-foundation.spec UC-XBOS-CC-08.',
  goal: 'Quản lý mẫu phòng ban hệ thống để áp cho pháp nhân mới.',
  caps: [
    { id: 'CAP-CC08', name: 'Dept templates', purpose: 'CRUD mẫu', actor: 'CEO',
      fns: [
        { id: 'FN-CC08-LIST', name: 'List templates', ui: 'GET', mutate: false },
        { id: 'FN-CC08-SAVE', name: 'Lưu mẫu', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-CC08-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở hệ thống PB mẫu', exp: '200', layer: 'UI/API', trace: 'CC-08' },
    { fn: 'FN-CC08-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: '0 template', steps: '1. List', exp: 'empty', layer: 'UI', trace: 'empty' },
    { fn: 'FN-CC08-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. Thêm/sửa mẫu 2. Lưu 3. F5', exp: '2xx sticky', layer: 'UI/API', trace: 'CC-08' },
    { fn: 'FN-CC08-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Trùng mã mẫu', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-CC08-SAVE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Mutate template tập đoàn', exp: '403/409', layer: 'API', trace: 'AU' },
  ],
  fe_be: baseFeBe('dept_system_templates', 'CC-08'),
});

// RACI 65–70
add({
  id: 'UC-RACI-01', stt: 65, mod: 'M00', name_vi: 'Xem danh mục hoạt động RACI theo khối nghiệp vụ',
  actors: 'Group CEO / Governance',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA · raci catalog',
  tech_spec: 'DB_DESIGN_XBOS_RACI_RBAC · TECHSPEC_HE §8',
  api: 'GET `/api/xbos/raci-governance/catalog` `XBOS-RACI-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'raci-governance.controller catalog.',
  goal: 'Xem catalog hoạt động RACI theo domain/khối.',
  caps: [
    { id: 'CAP-R1', name: 'Catalog RACI', purpose: 'Đọc', actor: 'CEO',
      fns: [
        { id: 'FN-R1-CAT', name: 'GET catalog', ui: 'API/UI', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-R1-CAT', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở RACI catalog / GET', exp: '`XBOS-RACI-200` · activities', layer: 'UI/API', trace: 'RACI-01' },
    { fn: 'FN-R1-CAT', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'domain filter rỗng', steps: '1. Filter domain không có', exp: 'empty hợp lệ', layer: 'UI', trace: 'empty' },
    { fn: 'FN-R1-CAT', type: 'AU', pri: 'P0', persona: P.anon, pre: '—', steps: '1. GET không auth', exp: '401', layer: 'API', trace: 'AU' },
    { fn: 'FN-R1-CAT', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. domain invalid', exp: '4xx hoặc empty deterministic', layer: 'API', trace: 'FD' },
  ],
  fe_be: baseFeBe('raci-governance/catalog', 'RACI-01'),
});

add({
  id: 'UC-RACI-02', stt: 66, mod: 'M00', name_vi: 'Xem và chỉnh ma trận RACI tại chi tiết pháp nhân',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'raci matrix cell upsert',
  api: 'GET `/raci-governance/companies/:companyId/matrix` · PUT `…/matrix/cell` `XBOS-RACI-201`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'UF-XBOS-07 PUT cell sticky F5.',
  goal: 'Sửa ô RACI (R/A/C/I) tại chi tiết pháp nhân, lưu sticky; scope member vs holding.',
  caps: [
    { id: 'CAP-R2', name: 'Matrix edit', purpose: 'upsert cell', actor: 'CEO',
      fns: [
        { id: 'FN-R2-LOAD', name: 'Load matrix', ui: 'GET matrix', mutate: false },
        { id: 'FN-R2-SAVE', name: 'Lưu ô', ui: 'PUT cell', mutate: true },
        { id: 'FN-R2-CLR', name: 'Clear letters', ui: 'PUT raci_letters=""', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-R2-LOAD', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'mở LE member', steps: '1. Tab RACI', exp: '`XBOS-RACI-200` grid', layer: 'UI/API', trace: 'UF-XBOS-07' },
    { fn: 'FN-R2-LOAD', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Load', exp: 'merge default ⊕ company cells', layer: 'UI', trace: 'merge' },
    { fn: 'FN-R2-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'grid', steps: '1. Đổi I→R 2. Lưu 3. F5', exp: '`XBOS-RACI-201` sticky', layer: 'UI/API', trace: 'UF-XBOS-07' },
    { fn: 'FN-R2-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. PUT thiếu activity_id', exp: '4xx', layer: 'API', trace: 'DTO' },
    { fn: 'FN-R2-SAVE', type: 'BD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Letters không thuộc RACI set', exp: '4xx', layer: 'API', trace: 'BD' },
    { fn: 'FN-R2-CLR', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'ô có R', steps: '1. Clear 2. F5', exp: '201 · ô trống', layer: 'UI/API', trace: 'clear' },
    { fn: 'FN-R2-CLR', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Clear activity không tồn tại', exp: '404/4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-R2-SAVE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT matrix LE khác', exp: '403/409/`XBOS-RACI-404`', layer: 'API', trace: 'AU' },
    { fn: 'FN-R2-LOAD', type: 'AU', pri: 'P0', persona: P.mem, pre: '—', steps: '1. GET matrix holding nếu cấm', exp: '403/404', layer: 'API', trace: 'AU read' },
  ],
  fe_be: baseFeBe('raci matrix/cell', 'UF-XBOS-07'),
});

add({
  id: 'UC-RACI-03', stt: 67, mod: 'M00', name_vi: 'Xem ánh xạ chức năng phân hệ cho hoạt động',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'raci capabilities',
  api: 'GET `/api/xbos/raci-governance/capabilities` `XBOS-RACI-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'listCapabilities.',
  goal: 'Xem mapping activity → capability/module chức năng phân hệ.',
  caps: [
    { id: 'CAP-R3', name: 'Capabilities map', purpose: 'Đọc', actor: 'CEO',
      fns: [{ id: 'FN-R3-CAP', name: 'GET capabilities', ui: 'API/UI', mutate: false }]},
  ],
  cases: [
    { fn: 'FN-R3-CAP', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. GET capabilities', exp: '200', layer: 'API/UI', trace: 'RACI-03' },
    { fn: 'FN-R3-CAP', type: 'HP', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Filter activityCode', exp: 'subset đúng', layer: 'API', trace: 'filter' },
    { fn: 'FN-R3-CAP', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'code lạ', steps: '1. Filter', exp: 'empty', layer: 'UI', trace: 'empty' },
    { fn: 'FN-R3-CAP', type: 'AU', pri: 'P0', persona: P.anon, pre: '—', steps: '1. GET', exp: '401', layer: 'API', trace: 'AU' },
    { fn: 'FN-R3-CAP', type: 'FD', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. BE error', exp: 'banner', layer: 'UI', trace: 'FD' },
  ],
  fe_be: baseFeBe('raci capabilities', 'RACI-03'),
});

add({
  id: 'UC-RACI-04', stt: 68, mod: 'M00', name_vi: 'Gán cột RACI với chức danh',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'matrix org_column ↔ position',
  api: 'PUT matrix/cell + org_column_id · position catalog',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Gán cột qua org_column_id; FE picker chức danh có thể PARTIAL.',
  goal: 'Gán/hiểu cột ma trận RACI với chức danh; lưu cell phản ánh cột đúng.',
  caps: [
    { id: 'CAP-R4', name: 'Map column–position', purpose: 'Gán cột', actor: 'CEO',
      fns: [
        { id: 'FN-R4-MAP', name: 'Gán cột–chức danh', ui: 'UI+PUT', mutate: true },
        { id: 'FN-R4-VIEW', name: 'Xem cột', ui: 'GET matrix', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-R4-VIEW', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'matrix', steps: '1. Xem header cột', exp: 'cột = chức danh/org role', layer: 'UI', trace: 'RACI-04' },
    { fn: 'FN-R4-MAP', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'có position catalog', steps: '1. Gán cột 2. Lưu cell 3. F5', exp: '201 sticky', layer: 'UI/API', trace: 'RACI-04' },
    { fn: 'FN-R4-MAP', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. org_column_id không tồn tại', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-R4-MAP', type: 'AU', pri: 'P0', persona: P.mem, pre: '—', steps: '1. Gán cột LE ngoài scope', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-R4-MAP', type: 'BD', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. Một cột nhiều letters', exp: 'theo BR', layer: 'API', trace: 'BD' },
    { fn: 'FN-R4-VIEW', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'catalog position trống', steps: '1. Mở gán', exp: 'empty picker honest', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('org_column_id', 'RACI-04'),
});

add({
  id: 'UC-RACI-05', stt: 69, mod: 'M00', name_vi: 'Nhập hoặc nâng phiên bản catalog RACI',
  actors: 'Platform / Group CEO',
  surfaces: 'api / xbos-cc',
  srs_new: 'N/A-DELTA',
  tech_spec: 'raci_activity_catalog version',
  api: 'Catalog version bump — pattern import/publish (một phần API)',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'listCatalog có version; import/bump UI có thể GAP — cases ghi SPEC_GAP nếu thiếu endpoint.',
  goal: 'Nâng phiên bản / nhập catalog RACI; consumer thấy version mới.',
  spec_gap: 'Confirm dedicated import endpoint vs admin seed — không seed trong UAT',
  caps: [
    { id: 'CAP-R5', name: 'Version catalog', purpose: 'Bump/import', actor: 'Admin',
      fns: [
        { id: 'FN-R5-VER', name: 'Xem version', ui: 'GET catalog', mutate: false },
        { id: 'FN-R5-UP', name: 'Nâng/import version', ui: 'API admin', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-R5-VER', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. GET catalog', exp: '200 + version field', layer: 'API', trace: 'RACI-05' },
    { fn: 'FN-R5-UP', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'có API/UI import', steps: '1. Import/bump 2. GET lại', exp: 'version tăng · F5', layer: 'API/UI', trace: 'RACI-05' },
    { fn: 'FN-R5-UP', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Import schema sai', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-R5-UP', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Bump catalog tập đoàn', exp: '403', layer: 'API', trace: 'AU' },
    { fn: 'FN-R5-UP', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'endpoint thiếu', steps: '1. Ghi nhận SPEC_GAP', exp: 'không fake PASS', layer: 'API', trace: 'SPEC_GAP' },
    { fn: 'FN-R5-VER', type: 'UX', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. UI hiện version', exp: 'label version visible', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('raci catalog version', 'RACI-05'),
});

add({
  id: 'UC-RACI-06', stt: 70, mod: 'M00', name_vi: 'Báo cáo độ phủ số hóa theo công ty',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'coverage endpoint',
  api: 'GET `/api/xbos/raci-governance/companies/:companyId/coverage` `XBOS-RACI-200`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'getCoverage trên controller.',
  goal: 'Xem báo cáo độ phủ RACI/số hóa theo công ty (companyId path main hoặc UUID).',
  caps: [
    { id: 'CAP-R6', name: 'Coverage report', purpose: 'Đọc', actor: 'CEO',
      fns: [{ id: 'FN-R6-COV', name: 'GET coverage', ui: 'API/UI', mutate: false }]},
  ],
  cases: [
    { fn: 'FN-R6-COV', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. GET coverage company', exp: '200 metrics', layer: 'API/UI', trace: 'RACI-06' },
    { fn: 'FN-R6-COV', type: 'HP', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. path companyId=main', exp: '200 holding partition', layer: 'API', trace: 'main' },
    { fn: 'FN-R6-COV', type: 'AU', pri: 'P0', persona: P.mem, pre: '—', steps: '1. coverage LE khác', exp: '403/404', layer: 'API', trace: 'AU' },
    { fn: 'FN-R6-COV', type: 'UX', pri: 'P1', persona: P.ceo, pre: '0 cells', steps: '1. Coverage', exp: '0% / empty honest', layer: 'UI', trace: 'empty' },
    { fn: 'FN-R6-COV', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. companyId không tồn tại', exp: '`XBOS-RACI-404`', layer: 'API', trace: '404' },
  ],
  fe_be: baseFeBe('raci coverage', 'RACI-06'),
});

// DASH 71–73
add({
  id: 'UC-XBOS-DASH-01', stt: 71, mod: 'M01', name_vi: 'Cockpit tổng hợp KPI điều hành',
  actors: 'Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'kpi-engine rollup',
  api: 'GET kpi-engine rollup/cockpit endpoints',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'kpi-engine controller; series[] empty OK; UF-XBOS-10.',
  goal: 'Cockpit KPI tập đoàn load không 409 cho Group CEO; empty series hợp lệ.',
  caps: [
    { id: 'CAP-D1', name: 'Cockpit KPI', purpose: 'Đọc rollup', actor: 'CEO',
      fns: [
        { id: 'FN-D1-OPEN', name: 'Mở cockpit', ui: 'CC', mutate: false },
        { id: 'FN-D1-LOAD', name: 'Load series', ui: 'kpi-engine', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-D1-OPEN', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login main', steps: '1. Mở cockpit', exp: 'UI VI widgets', layer: 'UI', trace: 'UF-XBOS-10' },
    { fn: 'FN-D1-LOAD', type: 'HP', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. GET rollup', exp: '2xx · series có hoặc []', layer: 'API', trace: 'DASH-01' },
    { fn: 'FN-D1-LOAD', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. GET holding rollup', exp: '403/409', layer: 'API', trace: 'UF-XBOS-11' },
    { fn: 'FN-D1-LOAD', type: 'UX', pri: 'P1', persona: P.ceo, pre: '[]', steps: '1. Charts', exp: 'empty state · không crash', layer: 'UI', trace: 'empty' },
    { fn: 'FN-D1-LOAD', type: 'FD', pri: 'P1', persona: P.ceo, pre: '500', steps: '1. Mở', exp: 'banner', layer: 'UI', trace: 'FD' },
  ],
  fe_be: baseFeBe('kpi-engine', 'UF-XBOS-10'),
});

add({
  id: 'UC-XBOS-DASH-02', stt: 72, mod: 'M01', name_vi: 'Bảng KPI theo công ty',
  actors: 'Group CEO · Member CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'kpi-engine per company',
  api: 'GET kpi by companyId',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Per-company KPI table; scope parity list↔detail.',
  goal: 'Xem bảng KPI theo từng công ty trong scope.',
  caps: [
    { id: 'CAP-D2', name: 'KPI by company', purpose: 'Đọc', actor: 'CEO',
      fns: [
        { id: 'FN-D2-TBL', name: 'Bảng theo CT', ui: 'GET', mutate: false },
        { id: 'FN-D2-NAV', name: 'Click CT → detail KPI', ui: 'UI', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-D2-TBL', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở bảng KPI CT', exp: 'rows members', layer: 'UI/API', trace: 'DASH-02' },
    { fn: 'FN-D2-TBL', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Bảng', exp: 'chỉ CT mình', layer: 'API', trace: 'AU' },
    { fn: 'FN-D2-NAV', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'có row', steps: '1. Click CT', exp: 'detail load J-*', layer: 'UI', trace: 'L2.5' },
    { fn: 'FN-D2-NAV', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. companyId lạ', exp: '404/409', layer: 'API', trace: 'FD' },
    { fn: 'FN-D2-TBL', type: 'UX', pri: 'P1', persona: P.ceo, pre: '[]', steps: '1. Bảng', exp: 'empty', layer: 'UI', trace: 'empty' },
  ],
  fe_be: baseFeBe('kpi by company', 'DASH-02'),
});

add({
  id: 'UC-XBOS-DASH-03', stt: 73, mod: 'M01', name_vi: 'Chính sách KPI',
  actors: 'Group CEO / KPI admin',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'kpi policy',
  api: 'GET/PUT kpi policy endpoints (pattern)',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Policy KPI có thể mỏng vs master MD-04 — design cases bắt buộc HP+FD.',
  goal: 'Xem/sửa chính sách KPI (ngưỡng cảnh báo, áp dụng CT) trong scope.',
  caps: [
    { id: 'CAP-D3', name: 'KPI policy', purpose: 'Đọc/sửa policy', actor: 'Admin',
      fns: [
        { id: 'FN-D3-VIEW', name: 'Xem policy', ui: 'GET', mutate: false },
        { id: 'FN-D3-SAVE', name: 'Lưu policy', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-D3-VIEW', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở chính sách KPI', exp: '200/form', layer: 'UI/API', trace: 'DASH-03' },
    { fn: 'FN-D3-VIEW', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'chưa có policy', steps: '1. Mở', exp: 'empty/defaults', layer: 'UI', trace: 'empty' },
    { fn: 'FN-D3-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. Sửa ngưỡng 2. Lưu 3. F5', exp: '2xx sticky', layer: 'UI/API', trace: 'DASH-03' },
    { fn: 'FN-D3-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Ngưỡng âm / NaN', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-D3-SAVE', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Đổi policy tập đoàn', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-D3-SAVE', type: 'BD', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. Ngưỡng = 0', exp: 'accept/reject deterministic', layer: 'API', trace: 'BD' },
  ],
  fe_be: baseFeBe('kpi policy', 'DASH-03'),
});

add({
  id: 'UC-XBOS-INF-01', stt: 74, mod: 'M01', name_vi: 'Xem và sửa cấu hình hạ tầng danh mục nền',
  actors: 'Platform admin · Group CEO',
  surfaces: 'api / xbos-cc',
  srs_new: 'N/A-DELTA',
  tech_spec: 'infrastructure controller',
  api: 'GET/PUT `/api/xbos/infrastructure/*`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'infrastructure.controller tồn tại.',
  goal: 'Xem và sửa cấu hình hạ tầng danh mục nền; F5 sticky; chặn member.',
  caps: [
    { id: 'CAP-I1', name: 'Infra config', purpose: 'CRUD config', actor: 'Admin',
      fns: [
        { id: 'FN-I1-GET', name: 'Xem config', ui: 'GET', mutate: false },
        { id: 'FN-I1-PUT', name: 'Sửa config', ui: 'PUT', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-I1-GET', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. GET infra', exp: '200', layer: 'API/UI', trace: 'INF-01' },
    { fn: 'FN-I1-GET', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. UI', exp: 'loading/empty', layer: 'UI', trace: 'UX' },
    { fn: 'FN-I1-PUT', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'form', steps: '1. Sửa 2. Lưu 3. F5', exp: '2xx sticky', layer: 'UI/API', trace: 'INF-01' },
    { fn: 'FN-I1-PUT', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Key không hợp lệ', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-I1-PUT', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. PUT', exp: '403/409', layer: 'API', trace: 'AU' },
    { fn: 'FN-I1-PUT', type: 'BD', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. Payload lớn', exp: '4xx/limit', layer: 'API', trace: 'BD' },
  ],
  fe_be: baseFeBe('infrastructure', 'INF-01'),
});

add({
  id: 'UC-XBOS-INF-02', stt: 75, mod: 'M01', name_vi: 'Quản lý mẫu siêu dữ liệu theo pháp nhân',
  actors: 'Group CEO',
  surfaces: 'api / xbos-cc',
  srs_new: 'N/A-DELTA',
  tech_spec: 'metadata templates per LE',
  api: 'GET/PUT infrastructure metadata templates by entity',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Metadata template per LE — verify FE surface.',
  goal: 'CRUD mẫu siêu dữ liệu gắn pháp nhân; không lẫn LE.',
  caps: [
    { id: 'CAP-I2', name: 'Metadata templates', purpose: 'per LE', actor: 'CEO',
      fns: [
        { id: 'FN-I2-LIST', name: 'List templates LE', ui: 'GET', mutate: false },
        { id: 'FN-I2-SAVE', name: 'Lưu mẫu', ui: 'PUT/POST', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-I2-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'chọn LE', steps: '1. List', exp: '200 scoped', layer: 'API/UI', trace: 'INF-02' },
    { fn: 'FN-I2-LIST', type: 'AU', pri: 'P0', persona: P.mem, pre: '—', steps: '1. List LE khác', exp: '403/404', layer: 'API', trace: 'AU' },
    { fn: 'FN-I2-SAVE', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'LE', steps: '1. Lưu mẫu 2. F5', exp: '2xx sticky', layer: 'UI/API', trace: 'INF-02' },
    { fn: 'FN-I2-SAVE', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Schema field invalid', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-I2-SAVE', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Lưu nhầm entityId', exp: 'scope fail', layer: 'API', trace: 'cross-LE' },
    { fn: 'FN-I2-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: '0', steps: '1. List', exp: 'empty', layer: 'UI', trace: 'empty' },
  ],
  fe_be: baseFeBe('metadata templates', 'INF-02'),
});

add({
  id: 'UC-XBOS-INF-03', stt: 76, mod: 'M01', name_vi: 'Xem tóm tắt trạng thái hạ tầng danh mục',
  actors: 'Group CEO',
  surfaces: 'api / xbos-cc',
  srs_new: 'N/A-DELTA',
  tech_spec: 'infrastructure summary',
  api: 'GET infrastructure summary/status',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Summary read — pattern API.',
  goal: 'Xem tóm tắt health/status hạ tầng danh mục (publish state, sync).',
  caps: [
    { id: 'CAP-I3', name: 'Infra summary', purpose: 'Đọc status', actor: 'CEO',
      fns: [{ id: 'FN-I3-SUM', name: 'GET summary', ui: 'API/UI', mutate: false }]},
  ],
  cases: [
    { fn: 'FN-I3-SUM', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở tóm tắt hạ tầng', exp: '200 status cards', layer: 'UI/API', trace: 'INF-03' },
    { fn: 'FN-I3-SUM', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. GET holding summary', exp: '403 hoặc thu hẹp', layer: 'API', trace: 'AU' },
    { fn: 'FN-I3-SUM', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'chưa bootstrap', steps: '1. Summary', exp: 'states pending/empty honest', layer: 'UI', trace: 'UX' },
    { fn: 'FN-I3-SUM', type: 'FD', pri: 'P1', persona: P.ceo, pre: 'API down', steps: '1. Mở', exp: 'banner', layer: 'UI', trace: 'FD' },
  ],
  fe_be: baseFeBe('infra summary', 'INF-03'),
});

// DM 77–80
add({
  id: 'XBOS-DM-01', stt: 77, mod: 'M01', name_vi: 'Xem tổng quan danh mục theo phân hệ',
  actors: 'Catalog admin · Group CEO',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA · catalog overview',
  tech_spec: 'config-sync catalogs · TECHSPEC_HE',
  api: 'GET `/api/xbos/config-sync/catalogs`',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'config-sync list catalogs; FE DM overview.',
  goal: 'Xem tổng quan danh mục theo phân hệ đích (HRM/XBOS/LOG…).',
  caps: [
    { id: 'CAP-DM1', name: 'Catalog overview', purpose: 'Đọc', actor: 'Admin',
      fns: [
        { id: 'FN-DM1-OV', name: 'Overview theo module', ui: 'GET catalogs', mutate: false },
        { id: 'FN-DM1-NAV', name: 'Click nhóm → chi tiết', ui: 'UI', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-DM1-OV', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'login', steps: '1. Mở quản trị danh mục', exp: '200 overview', layer: 'UI/API', trace: 'DM-01' },
    { fn: 'FN-DM1-OV', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'module filter', steps: '1. Filter HRM', exp: 'subset', layer: 'UI', trace: 'filter' },
    { fn: 'FN-DM1-NAV', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'có nhóm', steps: '1. Click nhóm', exp: 'detail items load', layer: 'UI', trace: 'L2.5' },
    { fn: 'FN-DM1-NAV', type: 'FD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. catalogKey lạ', exp: '404', layer: 'API', trace: 'FD' },
    { fn: 'FN-DM1-OV', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Overview holding-only keys', exp: '403 hoặc ẩn', layer: 'API', trace: 'AU' },
  ],
  fe_be: baseFeBe('config-sync/catalogs', 'DM-01'),
});

add({
  id: 'XBOS-DM-02', stt: 78, mod: 'M01', name_vi: 'Tạo nhóm danh mục',
  actors: 'Catalog admin',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'catalog group create',
  api: 'POST catalog group (business-master / config-sync pattern)',
  code_readiness: 'LIKELY_PARTIAL',
  code_note: 'Tạo nhóm — một phần pattern; verify endpoint cụ thể trước UAT.',
  goal: 'Tạo nhóm danh mục mới với mã/tên hợp lệ, F5 còn.',
  caps: [
    { id: 'CAP-DM2', name: 'Create catalog group', purpose: 'POST group', actor: 'Admin',
      fns: [
        { id: 'FN-DM2-ADD', name: 'Tạo nhóm', ui: 'POST', mutate: true },
        { id: 'FN-DM2-LIST', name: 'Thấy nhóm sau tạo', ui: 'GET', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-DM2-ADD', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'overview mở', steps: '1. Tạo nhóm mã/tên 2. Lưu', exp: '2xx · F5 còn', layer: 'UI/API', trace: 'DM-02' },
    { fn: 'FN-DM2-ADD', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Trùng mã nhóm', exp: '409/4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-DM2-ADD', type: 'BD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Mã biên độ dài', exp: 'deterministic', layer: 'API', trace: 'BD' },
    { fn: 'FN-DM2-ADD', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Tạo nhóm tập đoàn', exp: '403', layer: 'API', trace: 'AU' },
    { fn: 'FN-DM2-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'sau HP create', steps: '1. Overview', exp: 'nhóm xuất hiện', layer: 'UI', trace: 'list' },
    { fn: 'FN-DM2-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Search nhóm', exp: 'filter OK', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('catalog group create', 'DM-02'),
});

add({
  id: 'XBOS-DM-03', stt: 79, mod: 'M01', name_vi: 'Thêm giá trị danh mục',
  actors: 'Catalog admin',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'catalog items create',
  api: 'POST catalog items / business-master items',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'Items create paths trên config-sync/business-master; UF catalog related.',
  goal: 'Thêm giá trị (item) vào nhóm danh mục; validate mã; F5 còn.',
  caps: [
    { id: 'CAP-DM3', name: 'Add catalog value', purpose: 'POST item', actor: 'Admin',
      fns: [
        { id: 'FN-DM3-ADD', name: 'Thêm giá trị', ui: 'POST item', mutate: true },
        { id: 'FN-DM3-LIST', name: 'List items', ui: 'GET', mutate: false },
      ]},
  ],
  cases: [
    { fn: 'FN-DM3-ADD', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'nhóm tồn tại', steps: '1. Thêm mã/label 2. Lưu 3. F5', exp: '2xx · row', layer: 'UI/API', trace: 'DM-03' },
    { fn: 'FN-DM3-ADD', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. Thiếu mã / trùng mã', exp: '4xx', layer: 'API', trace: 'FD' },
    { fn: 'FN-DM3-ADD', type: 'BD', pri: 'P1', persona: P.ceo, pre: '—', steps: '1. Label max length', exp: 'deterministic', layer: 'API', trace: 'BD' },
    { fn: 'FN-DM3-ADD', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Thêm item catalog holding cấm', exp: '403 hoặc chuyển governance approve', layer: 'API', trace: 'AU/gov' },
    { fn: 'FN-DM3-LIST', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'sau add', steps: '1. List', exp: 'thấy item · status_label nếu có', layer: 'UI/API', trace: 'list' },
    { fn: 'FN-DM3-LIST', type: 'UX', pri: 'P1', persona: P.ceo, pre: '0 items', steps: '1. List', exp: 'empty', layer: 'UI', trace: 'empty' },
  ],
  fe_be: baseFeBe('catalog items POST', 'DM-03'),
});

add({
  id: 'XBOS-DM-04', stt: 80, mod: 'M01', name_vi: 'Sửa giá trị danh mục',
  actors: 'Catalog admin',
  surfaces: 'xbos-cc / api',
  srs_new: 'N/A-DELTA',
  tech_spec: 'catalog items update',
  api: 'PUT/PATCH catalog item',
  code_readiness: 'LIKELY_IMPL',
  code_note: 'Update item; nhạy cảm có thể yêu cầu approve (DM-12) — FD ghi rõ.',
  goal: 'Sửa giá trị danh mục; F5 sticky; item nhạy cảm có thể khóa/WF.',
  caps: [
    { id: 'CAP-DM4', name: 'Edit catalog value', purpose: 'PUT item', actor: 'Admin',
      fns: [
        { id: 'FN-DM4-EDIT', name: 'Sửa giá trị', ui: 'PUT', mutate: true },
        { id: 'FN-DM4-SENS', name: 'Sửa nhạy cảm → WF', ui: 'PUT/submit', mutate: true },
      ]},
  ],
  cases: [
    { fn: 'FN-DM4-EDIT', type: 'HP', pri: 'P0', persona: P.ceo, pre: 'item từ FE', steps: '1. Sửa label 2. Lưu 3. F5', exp: '2xx sticky', layer: 'UI/API', trace: 'DM-04' },
    { fn: 'FN-DM4-EDIT', type: 'FD', pri: 'P0', persona: P.ceo, pre: '—', steps: '1. PUT id lạ', exp: '404', layer: 'API', trace: 'FD' },
    { fn: 'FN-DM4-EDIT', type: 'AU', pri: 'P0', persona: P.mem, pre: 'member', steps: '1. Sửa item holding', exp: '403', layer: 'API', trace: 'AU' },
    { fn: 'FN-DM4-SENS', type: 'HP', pri: 'P1', persona: P.ceo, pre: 'item sensitive', steps: '1. Sửa → gửi duyệt nếu bắt buộc', exp: 'spawn WF hoặc 2xx theo BR', layer: 'UI/API', trace: 'DM-12 link' },
    { fn: 'FN-DM4-SENS', type: 'FD', pri: 'P0', persona: P.ceo, pre: 'item locked WF', steps: '1. Sửa trực tiếp', exp: '4xx locked', layer: 'API', trace: 'FD lock' },
    { fn: 'FN-DM4-EDIT', type: 'BD', pri: 'P2', persona: P.ceo, pre: '—', steps: '1. Đổi mã khi đã publish', exp: 'cấm hoặc version mới', layer: 'API', trace: 'BD' },
    { fn: 'FN-DM4-EDIT', type: 'UX', pri: 'P1', persona: P.ceo, pre: 'sau save', steps: '1. UI', exp: 'toast · không overlay', layer: 'UI', trace: 'UX' },
  ],
  fe_be: baseFeBe('catalog items PUT', 'DM-04'),
  wf: true,
});

// ——— emit ———
function casesCount(uc) {
  return uc.cases.length;
}

function main() {
  const rows = [];
  let sum = 0;
  for (const uc of UCS) {
    const md = renderFile(uc);
    const fileName = `${uc.id}.md`;
    fs.writeFileSync(path.join(OUT, fileName), md, 'utf8');
    const n = casesCount(uc);
    sum += n;
    rows.push({ stt: uc.stt, uc_id: uc.id, cases_designed: n, code_readiness: uc.code_readiness, notes: uc.code_note.slice(0, 120) });
    console.log('wrote', fileName, n);
  }

  const manifest = `# Manifest — ${SQUAD}

| Meta | Value |
|------|--------|
| **work_item_id** | \`${WI}\` |
| **squad** | ${SQUAD} |
| **stt_range** | 41–80 |
| **uc_count** | ${UCS.length} |
| **cases_designed_sum** | **${sum}** |
| **design_status** | DESIGNED (not UAT) |
| **ack_status** | READY_FOR_SYNTH |
| **author** | ba-process |
| **generated** | 2026-08-04 |

## Inventory

| stt | uc_id | cases_designed | code_readiness | notes |
|----:|-------|---------------:|----------------|-------|
${rows.map((r) => `| ${r.stt} | \`${r.uc_id}\` | ${r.cases_designed} | \`${r.code_readiness}\` | ${r.notes.replace(/\|/g, '/')} |`).join('\n')}

## Sum

| Metric | Value |
|--------|------:|
| UC files | ${UCS.length} |
| **cases_designed Σ** | **${sum}** |
| LIKELY_IMPL | ${rows.filter((r) => r.code_readiness === 'LIKELY_IMPL').length} |
| LIKELY_PARTIAL | ${rows.filter((r) => r.code_readiness === 'LIKELY_PARTIAL').length} |
| GAP / UNKNOWN | ${rows.filter((r) => r.code_readiness === 'GAP' || r.code_readiness === 'UNKNOWN').length} |

## WF depth note

- \`UC-CC-P0-06\` · \`UC-XBOS-CC-06\` · liên quan approve: có **self-approve FD** + **scope AU** + cite \`POST …/tasks/:id/complete|reject\` · \`API_CONTRACT_VN\` approve/reject · \`srs_new\` map WF 2-level.
- U65: inbox empty = không seed.

## Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
work_item_id: ${WI}
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/${SQUAD}_MANIFEST.md
uat_done: false
\`\`\`
`;

  fs.writeFileSync(path.join(__dirname, `${SQUAD}_MANIFEST.md`), manifest, 'utf8');
  console.log('manifest sum', sum, 'ucs', UCS.length);
  if (UCS.length !== 40) {
    console.error('ERROR: expected 40 UCs, got', UCS.length);
    process.exit(1);
  }
}

main();
