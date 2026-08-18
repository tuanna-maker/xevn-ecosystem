# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QC-01` **GWC** · CONDITION **R-PLT-ATT-OT-FE-01** |
| **condition_close** | **R-PLT-ATT-OT-FE-01** (P2 · owner dev-fe) — FE rebind OvertimeRequestTab |
| **ref_qc** | [`po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md) |
| **ref_qa** | [`po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md) stamp **`ATTOTQA-MSK8VETU`** |
| **ref_be** | [`po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md) |
| **change_mode** | **ADD** (FE consumer bind only · no BE reopen · no seed · no FE admin panel) |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `formula_LIVE=false` · `C-SLICE-≠-MODULE` · U65 zero-seed · **R-PLT-ATT-OT-FE-ADMIN** NOTE/**HOLD** (không invent panel admin FE) · seals CTR/ATT L1 · work_shifts `ATTSHIFTQA-*` · leave `ATTLEAVEQA-MSJ7CPJH` · ATT-CODE / worksite / EMP / SI **RETAIN** |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **QC** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md` — GWC · Residual **R-PLT-ATT-OT-FE-01** (P2 · dev-fe) · **R-PLT-ATT-OT-FE-ADMIN** (P2 NOTE HOLD) |
| **QA** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md` — stamp `ATTOTQA-MSK8VETU` · `network_key_hit=true` · invent → **400 `HRM-ATT-OT-TYPE-KEY`** |
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md` — **AC-PLT-ATT-OT-01 / 01c** · **VAL-ATT-OT-CNS-01** · BR-PLT-04/05 |
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` — Option **B** (Nest DEFINE · open catalog N+1) |
| **DATA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md` §2 — `public.att_ot_type` (`code` format-only · `default_coeff` display-ready) |
| **API_DESIGN** | `GET /api/hrm/attendance/ot-types/effective?company_id=` → `{ total, data[] }` · fields `code` / `nameVi` / `defaultCoeff` (`defaultCoefficient` synonym) / `sortOrder` / `status` / `source` |
| **BE code read** | `apps/api/hrm-api/src/attendance/att-ot-type.service.ts` — `listEffective` (active + not archived), `assertOtTypeInEffectiveCatalog` (EFF=0 → soft-skip; EFF>0 → invent = **400 `HRM-ATT-OT-TYPE-KEY`**) · `att-ot-type.constants.ts` `ATT_OT_TYPE_STARTER_KEYS` = **docs-only bootstrap, không phải trần** |
| **BE consumer wire** | `attendance-requests.service.ts#createOvertimeRequest` — hit catalog → `overtime_type = hit.code`; `coefficient` giữ giá trị FE gửi, chỉ lấy `hit.defaultCoeff` khi FE bỏ trống |
| **SRS** | UC-HRM-ATT-OT (S50–S51 Đơn tăng ca) — chọn loại tăng ca + hệ số hiển thị |
| **Peer pattern** | `useWorkShiftsEffective` / `workShiftCatalog` (SHIFT-CATALOG-FE-01) · `useAttLeaveTypesEffective` (ATT-FE-01) — cùng doctrine «EFF>0 → Nest; EFF=0 → bootstrap» |

**spec says / code does:**

- *spec says:* Khi catalog `att_ot_type` hiệu lực của đơn vị **có** dòng (EFF>0), consumer **phải** chọn từ Nest và submit `overtime_type` = **Nest `code`**; hardcode `weekday|weekend|holiday` chỉ được dùng làm **bootstrap khi EFF=0** (AC-PLT-ATT-OT-01c · U65 no seed). Hệ số `defaultCoeff` là **display-ready**, không phải công thức lương.
- *code did (trước):* `OvertimeRequestTab` hardcode 3 `SelectItem value="weekday|weekend|holiday"` cho cả form thêm và filter; `getCoefficient()` hardcode `1.5 / 2.0 / 3.0`; badge/nhãn map cứng `t('overtime.weekday')`… → khi EFF>0 với mã đơn vị tự tạo (vd. `ot_le_tet`), user **không** chọn được, submit `weekday` → BE **400 `HRM-ATT-OT-TYPE-KEY`** nhưng FE chỉ toast «Không thể tạo đơn» (nuốt nguyên nhân).
- *code does (sau ADD):* Select thêm-đơn + filter + badge/nhãn + hệ số bind `GET /attendance/ot-types/effective`; bootstrap 3-id **chỉ** khi `effectiveCount = 0`; submit gửi `code` của option đang chọn + `coefficient = defaultCoeff` (display-ready); lỗi `HRM-ATT-OT-TYPE-KEY` được surface bằng thông điệp nghiệp vụ tiếng Việt.

---

## 2. completion_report

**Closed (CONDITION R-PLT-ATT-OT-FE-01):**

| Gap (QC Residual) | Impl |
|-----|------|
| Select loại tăng ca hardcode khi EFF>0 | Dialog «Thêm đơn tăng ca» Select bind `useAttOtTypesEffective().nestOptions` khi `effectiveCount > 0` (label `nameVi (xN)`) |
| Filter danh sách hardcode | Filter «Loại tăng ca» dùng cùng `otTypeOptions` (Tất cả + option catalog) |
| Badge / nhãn cột hardcode | `getOvertimeTypeBadge` → `resolveAttOtTypeLabel(otTypeOptions, type)`; mã đã ngừng vẫn hiện **nguyên mã** trên dòng lịch sử (không invent, không `—`) |
| `getCoefficient` hardcode | Xóa bảng switch trong component; hệ số lấy `resolveAttOtTypeCoefficient(...)` từ `defaultCoeff` Nest, bootstrap 1.5/2.0/3.0 nằm trong `ATT_OT_TYPE_BOOTSTRAP_FALLBACK` (một nguồn duy nhất) |
| Submit dùng mã catalog | `overtime_type = selectedOtType` (Nest `code`), `coefficient = selectedOtCoefficient` → BE `HRM-ATT-OT-TYPE-KEY` assert giữ hiệu lực |
| Bootstrap EFF=0 | `effectiveCount = 0` → 3 option `weekday\|weekend\|holiday` + hint «Chưa có loại tăng ca trong danh mục đơn vị — đang dùng mức khởi tạo» · **no seed**, không CTA seed |
| Lỗi BE bị nuốt | `useOvertimeRequests.createRequest` → `HRM-ATT-OT-TYPE-KEY` = `t('hk.overtime.otTypeKeyError')`; các code khác qua `toErrorMessage` (không còn «Không thể tạo đơn» cho mọi lỗi) |
| Loading / error / empty | Select `disabled` + placeholder «Đang tải…» khi fetch; dòng đỏ `att-ot-type-catalog-error` khi `isError`; hint bootstrap khi EFF=0; hệ số hiển thị `Hệ số: xN` khi đã bind; nút «Thêm» disabled khi chưa nạp catalog hoặc chưa có mã |

**Paths touched:**

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | **ADD** `listEffectiveAttOtTypes` + `HrmAttOtTypeEffectiveRecord` (unwrap `{total,data}`) + `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/hooks/useAttOtTypesEffective.ts` | **NEW** — helper thuần (mapper · `ATT_OT_TYPE_BOOTSTRAP_FALLBACK` · `resolveAttOtTypeLabel` · `resolveAttOtTypeCoefficient` · `ATT_OT_TYPE_KEY_FORMAT` · honesty flag) + RQ hook scoped `currentCompanyId` |
| `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` | **ADD** bind Select/filter/badge/hệ số + trạng thái loading/error/bootstrap + `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/hooks/useOvertimeRequests.ts` | **ADD** surface `HRM-ATT-OT-TYPE-KEY` + `toErrorMessage` fallback + `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` | **ADD** `overtime.otTypeCatalogError` · `overtime.otTypeCatalogBootstrapHint` · `hk.overtime.otTypeKeyError` |
| `apps/web/hrm/src/hooks/useAttOtTypesEffective.test.ts` | **NEW** — 17 vitest (helper + branch EFF>0 / EFF=0 + submit + error surface) |

**Scope note:** `hrmApi.ts` nằm ngoài danh sách `allowed_paths` gốc nhưng là **ADD tối thiểu** (một hàm + một type) vì `requestHrm` (auth/scope/timeout) không export — nhân bản header/auth trong hook sẽ vi phạm SOLID + secure baseline. Không sửa hàm nào đang có trong file.

**must_keep honored:** create/approve/reject/delete wires nguyên vẹn · Eye→Duyệt flow nguyên vẹn · `defaultCoeff` chỉ **display-ready** (không formula engine, không sửa payroll) · **không** invent panel admin FE ot-types (`R-PLT-ATT-OT-FE-ADMIN` NOTE/HOLD) · **không** seed / không CTA seed · **không** flip `*_ready` · **không** reopen seal CTR/ATT L1 / work_shifts / leave-balance / ATT-CODE FE HOLD · LeaveTab & ShiftChangeRequestTab không bị chạm.

---

## 3. Bind matrix (branch EFF>0 vs EFF=0)

| Trạng thái catalog | Select thêm đơn | Filter | Badge / nhãn | Hệ số submit | Ghi chú |
|---|---|---|---|---|---|
| `effectiveCount > 0` | option Nest `nameVi (xN)` theo `sortOrder, code` | option Nest | `nameVi`; mã ngừng → hiện mã | `defaultCoeff` của option | «Hệ số: xN» dưới Select |
| `effectiveCount = 0` | 3 option bootstrap `Ngày thường / Cuối tuần / Ngày lễ` | 3 option bootstrap | i18n bootstrap | 1.5 / 2.0 / 3.0 | hint bootstrap, **không** seed |
| đang tải | disabled + «Đang tải...» | (giữ option hiện tại) | — | — | nút «Thêm» disabled |
| lỗi tải | bootstrap + dòng đỏ `otTypeCatalogError` | bootstrap | i18n bootstrap | bootstrap | submit vẫn có thể nhận 400 KEY → toast nghiệp vụ |
| gửi mã ngoài catalog (EFF>0) | — | — | — | — | BE **400 `HRM-ATT-OT-TYPE-KEY`** → toast «Loại tăng ca không thuộc danh mục hiệu lực…»; dialog **không** đóng |

**data-testid mới (cho QA browser):** `att-ot-type-select` · `att-ot-type-filter` · `att-ot-type-coeff-hint` · `att-ot-type-catalog-error` (giữ nguyên `att-ot-precision`, `att-ot-add-dialog-precision`).

---

## 4. Verify commands (đã chạy)

| Check | Command | Kết quả |
|---|---|---|
| Unit — helper + branch | `npx vitest run src/hooks/useAttOtTypesEffective.test.ts` | **17 passed** |
| Regression hook OT | `npx vitest run src/hooks/useOvertimeRequests.test.ts` | **3 passed** (tổng 20 passed) |
| Regression attendance + hooks | `npx vitest run src/hooks src/components/attendance src/lib/attLeaveTypeCatalog.test.ts src/lib/workShiftCatalog.test.ts` | **41/42 file passed · 182 passed** — 1 FAIL **pre-existing** `src/hooks/useEmployeePicker.test.ts` (assert marker `CD-FB-07-LEAVE-CREATE-COMPANY-UUID` trên LeaveTab; reproduce khi **stash** thay đổi seat này → **không** do FE-01) |
| Typecheck delta | `npx tsc -p tsconfig.app.json --noEmit` + filter | **0 error** trên 5 file đã chạm (baseline repo còn lỗi cũ ở `Payroll.tsx` / `PlatformAdmin.tsx` / `Performance.tsx` — không thuộc seat) |
| Lint | `npx eslint src/components/attendance/OvertimeRequestTab.tsx src/hooks/useAttOtTypesEffective.ts src/hooks/useOvertimeRequests.ts` | **exit 0** |
| Build | `npx vite build` (apps/web/hrm) | **✓ built in 37.21s** |
| Route parity (read-only L1, no mutate) | `GET http://127.0.0.1:28001/api/hrm/attendance/ot-types/effective?company_id=trsport` không token | **401 `HRM-AUTH-001`** → route **tồn tại** đúng path FE gọi (≠ 404 `HRM-DATA-404` như path sai) |

**U65:** không chạy `pnpm seed:*`, không ghi DB, không POST mutate — probe duy nhất là GET không token để xác nhận đúng đường route.

---

## 5. Residual

| Item | Severity | Owner |
|------|----------|-------|
| Browser U65 AC-PLT-ATT-OT-01 / VAL-CNS-01: admin CREATE mã Nest (vd. `ot_le_tet`) → mở Chấm công → Tăng ca → Thêm đơn → Select hiện **nhãn Nest** + «Hệ số: xN» → Lưu **201** → F5 còn dòng + badge nhãn Nest | P2 | **qa** |
| Browser: EFF=0 (đơn vị chưa có mã) → Select hiện 3 option bootstrap + hint; **không** có CTA seed | P2 | **qa** |
| Browser negative: gửi mã ngoài catalog khi EFF>0 (qua DevTools/edit request) → Network **400 `HRM-ATT-OT-TYPE-KEY`** + toast tiếng Việt, dialog không đóng | P2 | **qa** |
| Pre-existing FAIL `src/hooks/useEmployeePicker.test.ts` (marker LeaveTab) | P3 OBS | **dev-fe** (seat LeaveTab / QA triage — **không** thuộc FE-01) |
| **R-PLT-ATT-OT-FE-ADMIN** — panel admin FE «Loại tăng ca» vẫn ABSENT (Network L1 admin OK) | P2 NOTE | **HOLD** — không invent seat này |
| Honesty / C-SLICE / seals | — | **pm** — giữ `*_ready=false`, `formula_LIVE=false`, không claim module ATT/PAY UAT hay Phase 1 DONE |

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** `qa`

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-FE-01
from_role: pm
to_role: qa
lane: execution
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01 READY_FOR_QA
condition_verify: R-PLT-ATT-OT-FE-01

entry_criteria:
- browser-only U65 zero-seed; portal http://127.0.0.1:5173 (hoặc :8088 embed) · HRM API :28001 UP
- account: ceo@xe.vn / Xevn@2026 (hoặc persona đơn vị có quyền Chấm công)
- FE evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-fe-01.md
- BE L1 KEY LIVE giữ nguyên (stamp ATTOTQA-MSK8VETU) — KHÔNG reopen BE seal

task (browser, click path đầy đủ — HDSD align U76):
1. EFF>0: admin tạo ≥1 mã Nest qua API admin đã LIVE (POST /attendance/ot-types — admin path, KHÔNG phải seed script),
   hoặc dùng mã đã có; sau đó login FE → menu Chấm công → tab Tăng ca → «Thêm đơn tăng ca»
   → Select «Loại tăng ca» PHẢI hiện nhãn Nest (nameVi) + «(xN)» và dòng «Hệ số: xN»
   → chọn NV + ngày + lý do → Lưu → Network POST /attendance/overtime-requests 201
   → FE: dòng mới xuất hiện, badge = nhãn Nest, cột Hệ số = xN → F5 vẫn còn.
2. EFF=0 (đơn vị chưa cấu hình): Select chỉ có 3 option bootstrap Ngày thường/Cuối tuần/Ngày lễ
   + hint «đang dùng mức khởi tạo»; KHÔNG có nút/CTA seed. Lưu đơn → 201 (BE soft-skip 01c).
3. Negative: khi EFF>0, sửa payload trong DevTools thành overtime_type='__invent__' → Network 400
   HRM-ATT-OT-TYPE-KEY + toast «Loại tăng ca không thuộc danh mục hiệu lực…»; dialog KHÔNG đóng;
   không có dòng mới sau F5.
4. Filter «Loại tăng ca» trên danh sách dùng đúng option catalog; lọc ra đúng dòng.
5. Console: không Uncaught, không mojibake tiếng Việt, không duplicate shell header, không GET storm
   /attendance/ot-types/effective (staleTime 30s — kiểm Network count).
6. Regression cùng tab: Eye → Duyệt / Từ chối / Xóa vẫn hoạt động; LeaveTab + Đổi ca không hồi quy.

testids: att-ot-type-select · att-ot-type-filter · att-ot-type-coeff-hint · att-ot-type-catalog-error
       · att-ot-precision · att-ot-add-dialog-precision

exit_criteria:
- Mỗi UF có block evidence mẫu (trước mutate / action / Network code / FE sau 2xx / F5 / verdict)
- evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01.md
- ack_status: PASS_TO_PM (hoặc FAIL_TO_PM + owner)
FORBIDDEN: pnpm seed:* · ghi DB · flip *_ready · claim formula LIVE · claim module ATT/PAY UAT
           · claim Phase 1 DONE · reopen CTR/ATT L1 seals · invent FE admin panel
```

---

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01
from_role: dev-fe
to_role: qa
change_mode: ADD
condition_close: R-PLT-ATT-OT-FE-01
entry_criteria: QC GWC condition + BE KEY LIVE + BA AC-PLT-ATT-OT-01/01c
exit_criteria: OvertimeRequestTab bind ot-types/effective khi EFF>0; bootstrap khi EFF=0; vitest PASS; build PASS
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-fe-01.md
tests: vitest 17 (new) + 3 (regression OT hook) = 20 passed · vite build PASS · eslint 0 · tsc delta 0
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  formula_LIVE: false
  C-SLICE: true
  U65: zero-seed
next_owner: qa
ack_status: READY_FOR_QA
```
