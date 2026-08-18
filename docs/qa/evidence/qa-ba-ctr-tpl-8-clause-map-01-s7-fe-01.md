# QA Evidence — BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01 (FE Clause Override Editor)
**date:** 2026-08-18
**qa_agent:** qa lane (Claude Code agent)
**ack_status:** FAIL_TO_PM

## Môi trường
- HRM FE port: 8080 (Vite dev server, process PID 2480)
- HRM BE port: 28001 (Node.js dist/main, process PID 28616)
- Persona: ceo@xe.vn / Xevn@2026 (HRM-AUTH-200 confirmed via curl)

## TC matrix
| TC | Mô tả | Kết quả | Ghi chú |
|----|-------|---------|---------|
| TC-S7-FE-01 | Component render | PASS | `[data-testid="clause-override-editor"]` xuất hiện 6 lần trên canvas |
| TC-S7-FE-02 | GET clause load | FAIL | BE trả 400 — UUID clause_id từ catalog cũ không pass `assertClauseIdFormat` |
| TC-S7-FE-03 | PUT upsert + persist | BLOCKED | Editor ở error state do TC-S7-FE-02 fail — không có textarea/save button |
| TC-S7-FE-04 | warnings badge ft_* | BLOCKED | Editor ở error state — không thấy badge |
| TC-S7-FE-05 | Source dropdown | BLOCKED | Editor ở error state — không thấy select |

## Evidence log

### Bước 1 — Verify server status
```
netstat -ano | grep LISTEN:
  TCP 0.0.0.0:8080  -> PID 2480 (node vite --port 8080)
  TCP 0.0.0.0:28001 -> PID 28616 (node apps/api/hrm-api/dist/main)
```

### Bước 2 — Verify BE endpoints (curl thực tế)
```
GET /api/hrm/contract-templates/bound-codes
x-internal-api-key: xevn-dev-internal-key
→ HTTP 200
{"bound_codes":["XEVN_FT_12M_OFFICE","XEVN_FT_24M_OFFICE","XEVN_INDEF_OFFICE",
"XEVN_FT_12M_DRIVER","XEVN_FT_24M_DRIVER","XEVN_INDEF_DRIVER"],"bind_count":6,
"dropped_codes":["XEVN_PROBATION_OFFICE","XEVN_PROBATION_DRIVER"]}
```
→ PASS: 6 bound codes đúng spec, 2 dropped codes đúng spec.

```
GET /api/hrm/contract-templates/XEVN_FT_12M_OFFICE/clauses
x-tenant-id: test-tenant
→ HTTP 200
{"items":[],"warnings":["insurance_salary_vnd is required by law (BLLĐ 2019 Đ.168)..."]}
```
→ PASS: list endpoint hoạt động, warnings cho ft_* template.

```
GET /api/hrm/contract-templates/INVALID_CODE/clauses
→ HTTP 400 {"code":"HRM-VAL-001","message":"template_code 'INVALID_CODE' is not a bound..."}
```
→ PASS: validation đúng spec.

```
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/83a6bb35-8db1-4e7a-b934-d364d9c681f2
x-tenant-id: xevn
→ HTTP 400
{"code":"HRM-VAL-001","message":"clause_id '83a6bb35-8db1-4e7a-b934-d364d9c681f2' must be a canonical clause id starting with 'CTR-CLAUSE-'"}
```
→ **FAIL: BUG-1** — `assertClauseIdFormat` chỉ chấp nhận `CTR-CLAUSE-*`, nhưng FE gửi UUID từ catalog cũ.

```
PUT /api/hrm/contract-templates/XEVN_FT_12M_OFFICE/clauses/CTR-CLAUSE-001
x-tenant-id: test-tenant
→ HTTP 500
{"code":"HRM-SYS-001","message":"duplicate key value violates unique constraint \"template_clause_override_pkey\""}
```
→ **NOTE: BUG-2** — PK = `TCO-{template_code}-{clause_id}` không bao gồm `tenant_id`. Nếu tenant khác đã insert cùng (template+clause), tenant mới bị 500 PK conflict. (Đã verify: tenant `xevn-test-new` + DRIVER template thành công vì chưa có PK conflict.)

### Bước 3 — Login FE browser
- URL: http://localhost:8080/hr/
- Login form: ceo@xe.vn / Xevn@2026
- Kết quả: Đăng nhập thành công, redirect về dashboard
- Network request: POST /api/hrm/auth/mobile/login → 200 HRM-AUTH-200

### Bước 4 — TC-S7-FE-01: Component render trong Step 2
- Navigate: /hr/contracts → click "Thêm hợp đồng"
- Step 1: Chọn mẫu `XEVN_FT_12M_DRIVER`, chọn NV `Nguyen Van A — NV001`
- Điền: Ngày ký = 18/08/2026, Hình thức = Toàn thời gian, Tỉ lệ = 100%
- Network: POST /api/hrm/contracts-insurance/contracts → 200 (draft tạo thành công)
- Click "Tiếp" → Step 2 activated (aria-selected="true" on tab "2. Điều khoản & xem trước")
- JS check: `document.querySelectorAll('[data-testid="clause-override-editor"]').length` = **6**
- **TC-S7-FE-01: PASS** — Editor xuất hiện trong DOM, đúng vị trí canvas

```
// DOM evidence: ctr-create-clause-canvas có 6 editors
[data-testid="ctr-create-clause-dnd-ready"] → present
[data-testid="ctr-create-clause-palette"] → present
[data-testid="ctr-create-clause-canvas"] → present
[data-testid="clause-override-editor"] × 6 → present (data-template-code="XEVN_FT_12M_DRIVER")
```

### Bước 5 — TC-S7-FE-02: GET clause load
Network requests captured khi Step 2 render:
```
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/83a6bb35-8db1-4e7a-b934-d364d9c681f2 → 400
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/447639b4-c8e0-4385-8f48-1d67869c0724 → 400
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/1b3eb3d8-daef-4fd7-b735-6d11b05341a6 → 400
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/8504c842-1231-4b35-b31a-b5edc419058b → 400
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/3b5462c3-d6c2-4493-85f4-f81471521df2 → 400
GET /api/hrm/contract-templates/XEVN_FT_12M_DRIVER/clauses/23718fa2-aa98-46ed-a8f4-90d74ba86a6d → 400
```
Root cause: `assertClauseIdFormat` ở BE yêu cầu `CTR-CLAUSE-*` prefix. FE gửi UUID từ catalog cũ (`contracts-insurance/contract-clauses`).

Editor DOM state (JavaScript verify):
```javascript
// All 6 editors:
{ clauseId: "83a6bb35-...", state: "error_or_loading", text: "Dữ liệu gửi lên chưa hợp lệ.Thu lai" }
// không có [data-testid="clause-override-text"], [data-testid="clause-override-source"],
//          [data-testid="clause-override-save"]
```

**TC-S7-FE-02: FAIL**
- Expected: GET trả 200 (có override) hoặc 404 (chưa có) → editor ở `ready` state
- Actual: GET trả 400 HRM-VAL-001 → editor ở `error` state

### TC-S7-FE-03, FE-04, FE-05: BLOCKED
Vì TC-S7-FE-02 FAIL → tất cả editors ở error state → textarea / select / save không xuất hiện → không thể test TC-03/04/05.

## Bugs tìm được

### BUG-1 (BLOCKER): Clause ID format mismatch FE↔BE
- File BE: `apps/api/hrm-api/src/contract-templates/contract-templates.service.ts`
- Hàm: `assertClauseIdFormat(clauseId)`
- Hiện tại: chỉ chấp nhận `clauseId.startsWith('CTR-CLAUSE-')`
- File FE: `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`
- Line 387, 495: `<ContractClauseOverrideEditor templateCode={templateCode} clauseId={cl.id} />`
- `cl.id` là UUID từ catalog cũ `contracts-insurance/contract-clauses`, không phải `CTR-CLAUSE-*`
- Fix options (cần PM quyết định):
  A. BE relaxes validation: accept UUID hoặc bất kỳ format
  B. FE mapping: map UUID → canonical CTR-CLAUSE-* ID trong Step2
  C. Clause catalog migration: gán canonical ID cho mỗi clause trong DB

### BUG-2 (MEDIUM): PK không tenant-scoped → 500 khi multi-tenant
- File: `apps/api/hrm-api/src/contract-templates/contract-templates.service.ts`
- `id = TCO-{templateCode}-{clauseId}` (không gồm tenant_id)
- Khi 2 tenant khác nhau upsert cùng (template_code, clause_id), tenant thứ 2 gặp 500 PK conflict
- ON CONFLICT clause chỉ xử lý UNIQUE `(tenant_id, template_code, clause_id)`, không xử lý được PK conflict
- Fix: đổi id format thành `TCO-{tenantId}-{templateCode}-{clauseId}` hoặc dùng UUID v4

## Hold items
- TV tab hide: DEFERRED — ContractCreateWizardDialog.tsx Cursor-held (đã ghi trong CODE-MEMORY)
- BUG-1 cần dev-be + dev-fe phối hợp: quyết định canonical ID scheme trước khi fix

