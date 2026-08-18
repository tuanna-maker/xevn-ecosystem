# Evidence — D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `D-PAY-CNTT-FE-POLICY-PACK-RESTORE-01` |
| **alias closed** | `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-FIX-01` (không mở FIX-01 trùng) |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **from_role** | `dev-fe` · lane execution |
| **to_role** | `qa` (retest R2 `QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01`) |
| **date** | 2026-08-12 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** (restore sau peer overwrite — không thêm scope mới) |
| **seed** | none (U65 zero-seed) |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · CHUNG-only · **≠** RIÊNG/STP-02/05/06 |
| **QA FAIL đang đóng** | `PAYPPQA-MSPX1M4T` — `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` |

---

## Bối cảnh (P0 process — peer overwrite)

Bản FE `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` (READY_FOR_QA, 20 vitest PASS) bị **ghi đè dở dang** trên
`PolicyPackSetupScreen.tsx`. Bản đè làm QA browser FAIL toàn bộ AC mutate. WI này **khôi phục hành vi bản gốc**
theo SoT hành vi:

- `PolicyPackSetupScreen.test.ts` (8 case, **không sửa test** — UI được nắn về đúng test)
- `payPolicyPackForm.ts` + `.test.ts` (7 case — **không đụng**, contract `kpiThreshold: string`, `statusLabelVi` là hàm)
- `usePolicyPackApi.ts` (**không đụng** — archive/403/company_id giữ nguyên)
- Evidence gốc `docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md`

File `PolicyPackSetupScreen.tsx` **chưa từng được commit** (untracked) → không có bản git để `checkout`;
khôi phục bằng cách dựng lại UI khớp 100% test SoT + AC evidence gốc.

---

## spec_read_ack

1. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md` — UC-BP-PAY-STP-01 · AC-01-01..05 · 03-01 · 04-01 · GLOBAL-01
2. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md` §2.1 — `pay_policy_pack`
3. `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` §3 two-pane · §4.1–4.3 field map
4. `docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md` — defect pack PAYPPQA-MSPX1M4T
5. Primitives SoT: `packages/ui/src/components/ViDateInput.tsx` (`onValueChange` ISO) · `apps/web/hrm/src/components/ui/ViMoneyInput.tsx` (`onValueChange` number)

## solid_convention_ack

- SRP giữ nguyên 3 lớp: `payPolicyPackForm.ts` (validate/build) · `usePolicyPackApi.ts` (HTTP) · `PolicyPackSetupScreen.tsx` (bind UI)
- FE/BE separation: `rateParams` chỉ pass-through number — **không** eval formula, không merge fragment
- Display-ready: `statusLabelVi()` FE-derive · ngày qua `ViDateField`/`formatHrmDateVi` (ISO trên wire)

---

## Files

| Path | Action |
|------|--------|
| `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx` | **FIX (restore)** — 1 file duy nhất chạm code |
| `docs/qa/evidence/d-pay-cntt-fe-policy-pack-restore-01.md` | ADD (file này) |

**Không chạm:** `apps/api/**` · `payPolicyPackForm.ts` · `usePolicyPackApi.ts` · `PolicyPackSetupScreen.test.ts` ·
`PayrollSetupHub.tsx` · `ContractCreate*` · seed scripts.

---

## Diff so với bản Claude ghi đè (từng defect QA)

| # | QA defect | Bản đè (hỏng) | Bản restore (hiện tại) |
|---|-----------|---------------|------------------------|
| 1 | `DEF-PAY-STP-CREATE-FORM-MISSING` **P0** | Pane phải `{editingId ? <form/> : empty}`; `startCreate()` set `editingId=null` → bấm «+ Thêm gói» ra dashed empty, **không POST được** | Pane phải **luôn render form**; `isEditing = editingId !== null` chỉ đổi tiêu đề + nút. Mặc định = form **Tạo**; «+ Thêm gói» reset về form tạo |
| 2 | `DEF-PAY-STP-DATE-ONCHANGE` **P0** | `<ViDateField onChange={…} allowEmpty />` — sai prop (contract là `onValueChange`), `allowEmpty` không tồn tại → DOM warning | `onValueChange={(value) => update('effectiveFrom'|'effectiveTo', value)}`; bỏ `allowEmpty`, thay bằng hint text «Để trống nếu áp dụng vô thời hạn.» |
| 3 | `DEF-PAY-STP-BCC-ONCHANGE` **P0** | `<ViMoneyInput onChange={…}>` — rest-spread đè handler nội bộ → mất nhóm nghìn + không bind number | `onValueChange={(value) => update('bccStd', value)}` → hiển thị `5.000.000`, submit `bcc_std: 5000000` (number thuần) |
| 4 | `DEF-PAY-STP-BCC-TESTID-MISSING` **P1** | thiếu | `data-testid="pay-params-bcc-std"` trên `ViMoneyInput` |
| 5 | `DEF-PAY-STP-KPI-TYPE` **P0** | `<Input type="number">` + `Number(e.target.value)` ghi **number/null** vào form → `validatePolicyPackForm` gọi `.trim()` trên number → vỡ submit path | `<Input inputMode="numeric">` giữ **string**; validate qua `parseKpiThresholdInput` (chặn nhóm nghìn); 150 → viền đỏ + `MSG_KPI_RANGE` ngay dưới ô |
| 6 | `DEF-PAY-STP-STATUS-LABEL` **P1** | `statusLabelVi[s]` (dùng hàm như record) → option trống | `POLICY_PACK_STATUS_LABEL_VI[s]` cho option; `statusLabelVi(item.status)` cho dòng danh sách |
| 7 | testid dòng | `data-testid="pay-policy-pack-row"` hardcode | `pay-policy-pack-row-${item.code}` (vd. `pay-policy-pack-row-POL_CHUNG_2A`) |
| 8 | `pay-policy-pack-save` | chỉ có trên `<form>` edit | trên **nút submit**, có ở **cả** mode tạo và sửa |
| 9 | empty copy | «Chưa có gói chính sách CHUNG.» | «Chưa có gói — tạo từ nút Thêm gói.» (khớp test SoT) |
| 10 | `DEF-PAY-STP-VITEST-STALE` **P1** | 7/20 FAIL với UI đè | **20/20 PASS**, test **không bị sửa** |
| — | state thừa | `selectedId` song song `editingId` (dễ lệch) | bỏ `selectedId` — `editingId` là SoT chọn dòng |
| — | import chết | `formatHrmDateVi` import nhưng không dùng | dùng cho dòng danh sách: `{trạng thái} · từ {dd/MM/yyyy}` |
| — | trùng message | KPI hiện 2 lần (inline + cuối form) → `getByText` ambiguous | inline dưới ô; message cuối form ẩn khi lỗi là KPI |

---

## Hành vi sau restore (AC map)

| AC | Hành vi |
|----|---------|
| AC-PAY-STP-01-01 | Form tạo hiện mặc định → «Lưu gói chính sách» → POST `pay-policy-packs` `{company_id, code, nameVi, scope:'CHUNG', effectiveFrom, status, rateParams?}` |
| AC-PAY-STP-01-02 | Click dòng → form «Cập nhật gói chính sách CHUNG» prefill KPI/BCC → «Cập nhật» → PATCH `rateParams` |
| AC-PAY-STP-01-03 | «Ngưng áp dụng» (`pay-policy-pack-archive`) → POST `…/:id/archive` — **giữ nguyên**, QA đã PASS 201 |
| AC-PAY-STP-01-04 | 409 `HRM-PAY-POL-409-CODE` → message VI, form giữ dữ liệu |
| AC-PAY-STP-01-05 | `effectiveTo < effectiveFrom` → «Hiệu lực đến phải sau hiệu lực từ» · **không** gửi request |
| AC-PAY-STP-03-01 | KPI 0–100 · `pay-params-kpi-threshold` · 150 → viền đỏ + message VI · không nhóm nghìn |
| AC-PAY-STP-04-01 | BCC `pay-params-bcc-std` · gõ `5000000` → hiện `5.000.000` · body number thuần |
| BR-PAY-STP-01 | HTTP 403 → banner «Không có quyền thao tác scope này — liên hệ C&B tập đoàn» (`pay-policy-pack-scope-banner`) |
| GLOBAL-01 | `pay-policy-pack-list` + `pay-policy-pack-scope-chung`; hub `/hr/payroll/setup` không đổi |

---

## vitest (thật — chạy lại sau restore)

```bash
cd apps/web/hrm && pnpm exec vitest run \
  src/lib/payPolicyPackForm.test.ts \
  src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts \
  src/components/payroll/setup/PayrollSetupHub.test.ts \
  --no-coverage --reporter=basic
```

```
 ✓ src/lib/payPolicyPackForm.test.ts (7 tests) 4ms
 ✓ src/components/payroll/setup/PayrollSetupHub.test.ts (5 tests) 120ms
 ✓ src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts (8 tests) 226ms

 Test Files  3 passed (3)
      Tests  20 passed (20)
```

**Typecheck slice:** `pnpm exec tsc --noEmit -p tsconfig.app.json` → **0 error** trên `policy-pack/**` và
`payPolicyPackForm` (245 error tồn tại sẵn ở module khác của `apps/web/hrm`, ngoài scope WI này — không do restore).

### Lưu ý môi trường (cho QA/Dev chạy lại)

Chạy vitest **từ đường dẫn canonical NFD** (`C:\Users\ADMIN\OneDrive\Tài liệu\…\apps\web\hrm`).
Chạy qua junction ASCII `C:\xevn-ecosystem\…` làm Vite resolve **hai instance React** →
`TypeError: Cannot read properties of null (reading 'useState')` cho **mọi** test render (kể cả test không liên quan).
Đây là artefact đường dẫn, **không** phải lỗi sản phẩm.

---

## Residual (không claim)

| ID | Note | Owner |
|----|------|-------|
| R-PAY-STP-BROWSER | Retest browser U65 R2 (portal `:5173` embed + standalone `:8080`) — AC-01-01/02/05 · 03-01 · 04-01 | **qa** |
| R-PAY-STP-RIENG | Tab RIÊNG + BP filter + geo/VP (STP-02/05/06) | FE follow-up |
| formula HOLD | FE không eval công thức | — |
| `payroll_e2e_ready=false` | Không claim UAT kỳ lương / UF-HRM-10 | — |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2
role: qa
lane: execution
read_first:
  - docs/qa/evidence/d-pay-cntt-fe-policy-pack-restore-01.md
  - docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md
entry_criteria: dev-fe READY_FOR_QA restore (vitest 20 PASS); QA FAIL cũ PAYPPQA-MSPX1M4T; BE GWC CNTTBEQC1-MSO8HVERQC1; U65 zero-seed; browser-only
exit_criteria:
- Login ceo@xe.vn → /hr/payroll/setup → nav «Gói chính sách» (portal embed :5173 + standalone :8080)
- AC-PAY-STP-01-01: «+ Thêm gói» mở FORM TẠO → nhập mã/tên/hiệu lực từ → «Lưu gói chính sách» → POST 2xx → dòng mới trong list → F5 còn
- AC-PAY-STP-01-02: click dòng → sửa KPI + BCC → «Cập nhật» → PATCH 2xx → F5 còn
- AC-PAY-STP-01-03: «Ngưng áp dụng» → POST archive 2xx → dòng ẩn khỏi list mặc định (regression — đã PASS lần 1)
- AC-PAY-STP-01-05: hiệu lực đến < hiệu lực từ → message «Hiệu lực đến phải sau hiệu lực từ» · Network KHÔNG có request
- AC-PAY-STP-03-01: KPI 150 → viền đỏ + «KPI threshold phải từ 0 đến 100» · không gửi
- AC-PAY-STP-04-01: BCC gõ 5000000 → hiển thị 5.000.000 → body rateParams.bcc_std = 5000000 (number)
- testid live: pay-policy-pack-list · pay-policy-pack-save (cả create+edit) · pay-policy-pack-archive · pay-params-kpi-threshold · pay-params-bcc-std · pay-policy-pack-row-{code}
- evidence: docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2.md
cấm: seed; PASS chỉ probe/API; claim RIÊNG hoặc STP-02/05/06; flip payroll_e2e_ready
must_keep: pay-stp-hub-root + honesty banner; archive POST path; CHUNG-only
```

---

## completion_report

**Closed:** Khôi phục toàn bộ hành vi POLICY-PACK-01 sau peer overwrite — form tạo hoạt động trở lại,
`onValueChange` đúng contract cho date/money, testid BCC + row theo code, KPI string 0–100 với cảnh báo VI,
date-order block FE, status label VI. Vitest 20/20 PASS (test SoT không bị sửa); typecheck slice sạch.
Đóng luôn alias `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-FIX-01`.

**Open:** Retest browser U65 R2 (QA); RIÊNG/STP-02/05/06 chưa mở; formula HOLD; `payroll_e2e_ready=false`.
