# Evidence — D-PAY-STP-SEARCH-ARIA-P2-01 (dev-fe · FIX a11y hẹp)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-PAY-STP-SEARCH-ARIA-P2-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-12 |
| **lane** | execution — FIX narrow a11y (không đụng nghiệp vụ) |
| **parent** | `QC-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` · stamp `PAYPPQC1-MSPXZL1GQC1` |
| **defect** | `DEF-PAY-STP-SEARCH-ARIA-P2` (P2 a11y · OPEN → **READY_FOR_QA**) |
| **change_mode** | **FIX** (a11y only) · preserve-by-default |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/d-pay-stp-search-aria-p2-01.md` |
| **U65** | zero-seed · không chạy `pnpm seed:*` · không ghi DB |

---

## 1. Vấn đề (QC (b) — residual P2)

Ô tìm kiếm danh sách gói có `aria-label="Tìm mã hoặc tên gói"`. Cụm **«tên gói»** nằm trong nhãn này
nên matcher **substring** của Playwright/Testing Library (`getByLabel('Tên gói')`) khớp **hai** điều
khiển: ô tìm kiếm và ô nhập của form (`<Label htmlFor="nameVi">Tên gói (VI)</Label>`).

Hậu quả: harness QA từng gõ tên gói vào ô tìm kiếm (R2 early FAIL — QC xếp loại PROCESS), và trình
đọc màn hình dễ nhầm hai điều khiển cùng ngữ cảnh.

## 2. Thay đổi (đúng scope)

| File | Thay đổi |
|------|----------|
| `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx` | `aria-label` ô tìm kiếm: «Tìm mã hoặc tên gói» → **«Tìm kiếm trong danh sách gói»**; APPEND `@CODE-MEMORY-CHANGE` (tiếng Việt) |
| `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts` | **ADD** 1 case khóa nhãn (không sửa 8 case AC cũ); APPEND `@CODE-MEMORY-CHANGE` |

Nhãn mới **không chứa** cụm «Tên gói» hay «Mã gói» → matcher substring chỉ còn khớp ô của form.

Trích code sau fix:

```tsx
// PolicyPackSetupScreen.tsx — ô tìm kiếm (pane danh sách)
<Input
  className="h-10 w-48"
  placeholder="Tìm mã/tên…"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  aria-label="Tìm kiếm trong danh sách gói"
/>
```

Case regression mới (`PolicyPackSetupScreen.test.ts`):

```ts
expect(screen.getAllByLabelText(/Tên gói/i)).toHaveLength(1);
expect(screen.getAllByLabelText(/Mã gói/i)).toHaveLength(1);
expect(screen.getByLabelText('Tên gói (VI)')).toBe(document.querySelector('#nameVi'));
expect(screen.getByLabelText('Tìm kiếm trong danh sách gói')).toBeTruthy();
```

**Không** đổi: `placeholder`, luồng Lưu/Cập nhật/Ngưng áp dụng, bind form, validate KPI/ngày,
testid registry, honesty banner, scope CHUNG, API call.

## 3. Command table (đã chạy)

| Command | Result |
|---------|--------|
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts src/lib/payPolicyPackForm.test.ts` | exit **0** · **16/16 PASS** (9 screen incl. case a11y mới + 7 form helper) |
| `ReadLints` 2 file đã sửa | **0 lỗi** |
| `rg "Tìm mã hoặc tên gói"` trong `apps/web/hrm/src` | **0 hit** code (chỉ còn trong nhật ký CODE-MEMORY) |

Trước fix, case mới **FAIL** đúng như mô tả defect (`getAllByLabelText(/Tên gói/i)` = 2 phần tử) —
đây là bằng chứng chống tái diễn.

## 4. Exit criteria

| Tiêu chí | Trạng thái |
|----------|-----------|
| vitest `PolicyPackSetupScreen` (+ `payPolicyPackForm`) PASS | ✅ 16/16 |
| `getByLabel('Tên gói (VI)')` **unique** | ✅ case khóa trong vitest |
| Không collide substring «Tên gói» / «Mã gói» | ✅ |
| `@CODE-MEMORY-CHANGE` APPEND tiếng Việt (không xóa block gốc) | ✅ 2 file |
| Evidence | ✅ file này |

## 5. must_keep (giữ nguyên — không mở lại)

| Lock | Trạng thái |
|------|-----------|
| `PAYPPQC1-MSPXZL1GQC1` (QC GWC slice CHUNG) | **RETAIN** |
| `CNTTBEQC1-MSO8HVERQC1` (BE CNTT API) | **RETAIN** · không đụng `apps/api/**` |
| `payroll_e2e_ready=false` | **RETAIN** (không flip) |
| CHUNG-only · không mở RIÊNG / STP-02 / 05 / 06 | **RETAIN** |
| Formula evaluator HOLD | **RETAIN** |
| U65 zero-seed | **RETAIN** |
| testid registry (`pay-policy-pack-*`, `pay-params-*`) | **RETAIN** |

## 6. Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| `DEF-PAY-STP-SEARCH-ARIA-P2` | P2 | **FIXED — chờ QA spot** | qa |
| Leftover FE rows `qar2porxwdp4` / `qar2staxwdp4` | P3 | CARRY (WI cleanup riêng) | qa |
| RIÊNG / STP-02/05/06 · formula HOLD · journey map register | INFO/PROCESS | CARRY ngoài slice | pm → ba/sa |

Không phát sinh residual P0/P1.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **completion_report** | Đổi `aria-label` ô tìm kiếm gói chính sách sang «Tìm kiếm trong danh sách gói» để hết trùng substring với Label form «Tên gói (VI)»; thêm 1 case vitest khóa tính duy nhất của nhãn; APPEND `@CODE-MEMORY-CHANGE` tiếng Việt ở component + test. vitest 16/16 PASS, lint sạch. Không đụng mutate/archive/bind/honesty/`apps/api/**`; không seed; giữ nguyên `payroll_e2e_ready=false`, CHUNG-only và các stamp `PAYPPQC1-MSPXZL1GQC1` / `CNTTBEQC1-MSO8HVERQC1`. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-PAY-STP-SEARCH-ARIA-P2-01
role: qa
lane: execution
parent: D-PAY-STP-SEARCH-ARIA-P2-01
read_first:
  - docs/qa/evidence/d-pay-stp-search-aria-p2-01.md
  - docs/qa/evidence/qc-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md   # DEF-PAY-STP-SEARCH-ARIA-P2
entry_criteria: dev-fe READY_FOR_QA; vitest 16/16 PASS; U65 browser-only, zero-seed
scope: Spot a11y + regression hẹp trên «Gói chính sách» CHUNG
  1) getByLabel('Tên gói (VI)') / getByLabel('Mã gói') resolve đúng ô form (không trúng ô tìm kiếm)
  2) ô tìm kiếm truy cập bằng nhãn «Tìm kiếm trong danh sách gói»; lọc mã/tên vẫn hoạt động
  3) regression AC-PAY-STP-01-01 (create) + 01-02 (edit KPI/BCC) + 01-03 (archive) từ FE, F5 còn dữ liệu
  4) console 0 Uncaught · không mojibake · honesty banner payroll_e2e_ready=false còn nguyên
url: http://127.0.0.1:5173/hr/payroll/setup?portal=1&section=policy-pack  (+ standalone :8080 · hrm-api :28001)
persona: ceo@xe.vn · company_id=main · tenantId=xevn
exit_criteria: verdict per UF block (Trước mutate / Action / Network 2xx / FE sau 2xx / F5); DEF-PAY-STP-SEARCH-ARIA-P2 → CLOSED hoặc FAIL có click path
forbidden: seed · ghi DB · flip payroll_e2e_ready · mở RIÊNG/STP-02/05/06
evidence_path: docs/qa/evidence/qa-pay-stp-search-aria-p2-01.md
ack_status target: PASS_TO_PM
```
