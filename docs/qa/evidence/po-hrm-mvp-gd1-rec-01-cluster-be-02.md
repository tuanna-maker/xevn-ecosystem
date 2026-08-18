# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · dev-be |
| **Date** | 2026-08-09 |
| **parent_defect** | `R-REC-HC-PUT-LOCKED-WIPE` (P0) — QA-01 `FAIL_TO_PM` stamp `RECQA-MSKSFV8Z` |
| **change_mode** | **FIX (narrow)** · `preserve_default: true` · `code_memory_mode: APPEND` |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed · no honesty flip |

---

## spec_read_ack

| Artifact | Path · sections | Stamp |
|----------|-----------------|-------|
| **qa (entry)** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-01.md` — P0 repro §*P0 defect* + Residual | READ |
| **be-01 baseline** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md` — jest 50 must_keep surface | READ |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` §5 F-REC-HC-01 bước (7) `HRM-HC-CELL-LOCKED` · §8 `HRM-HC-*` · §9 scope_parity U19 | CONFIRMED |
| **ba** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` AC-REC-HC-01-EX-04 · BR-REC-01-LOCK · **O3** `allow_override` drift | CONFIRMED |
| **data** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` §6 `months_data` cell projection | CONFIRMED |
| **code AS-IS** | `recruitment-catalog.service.ts` `replacePlanDepartments` (DELETE trước assert) | READ |

---

## Root cause (spec says / code does)

| | |
|--|--|
| **spec says** | F-REC-HC-01 bước (7): ô `need_hire_approved` bị sửa số lượng/trạng thái mà không `allow_override` ⇒ **409 `HRM-HC-CELL-LOCKED`**, dữ liệu định biên **không đổi** (AC-REC-HC-01-EX-04). |
| **code does (AS-IS)** | `replacePlanDepartments` chạy `DELETE FROM public.recruitment_plan_departments` (cascade positions) **ngay dòng đầu**, sau đó mới normalize + `assertCellUnlockedForMutate` trong vòng lặp position ⇒ khi throw 409, lưới đã bị xóa, chỉ còn dept shell / **0 positions**; ô `need_hire_approved` mất ⇒ spawn hết nguồn. `UPDATE recruitment_plans` header cũng đã commit trước đó. |
| **fix** | Tách **validate-then-write**: mọi assert (dual SoT, catalog key, VAL 12 tháng, cell lock) chạy trên bộ nhớ **trước**; ghi (`DELETE` + re-`INSERT`) chỉ xảy ra sau khi validate xong và nằm trong **một transaction** cùng `UPDATE` header. |

---

## Implementation

| Symbol | Role |
|--------|------|
| `buildPlanDepartmentWritePlan(companyId, departments, opts)` | **NEW private** — normalize O1 + `assertNoLegacyDualSotWriters` + `assertPlanCatalogKeys` + `normalizeMonthsData(requireTwelve)` + `assertCellUnlockedForMutate` + reuse `cell_id` từ `existingByNaturalKey`. **Không** query ghi; trả `PlanDepartmentWrite[]` (id/name/key/sort_order + cells). |
| `writePlanDepartments(query, planId, companyId, writePlan)` | **NEW private** — `DELETE` + re-`INSERT` dept/pos, nhận `HrmDbQueryFn` để chạy trong transaction. |
| `replacePlanDepartments` | **REMOVED** (private, không spec nào tham chiếu) — thay bằng cặp build/write ở trên. |
| `createRecruitmentPlan` | Validate lưới **trước**, rồi `db.withTransaction`: `INSERT recruitment_plans` + `writePlanDepartments` ⇒ reject không để lại plan header mồ côi. |
| `upsertRecruitmentPlan` | Validate lưới **trước** (409 phát sinh ở đây), rồi `db.withTransaction`: `UPDATE recruitment_plans` + `writePlanDepartments` ⇒ 409 để lưới **và** header nguyên vẹn. |

`allow_override=true` (BA O3) vẫn đi qua `assertCellUnlockedForMutate(..., allowOverride)` → bỏ qua lock → ghi bình thường.

### Files changed

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | FIX validate-then-write + transaction; `@CODE-MEMORY-CHANGE 2026-08-09 …BE-02` APPEND; import `type HrmDbQueryFn` |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-01-cluster-be-02.spec.ts` | **NEW** regression (5 tests, in-memory grid store) |

---

## Jest — cluster suite (old 50 + new 5)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-01-cluster-be-01|po-hrm-mvp-gd1-rec-01-cluster-be-02|recruitment-plan-headcount|recruitment.controller.spec|recruitment-catalog.service.spec|recruitment-workflow.bridge.spec" --no-coverage

Test Suites: 6 passed, 6 total
Tests:       55 passed, 55 total
```

### Regression cases (BE-02 spec)

| Case | Assertion |
|------|-----------|
| **approved + PUT no override** | `409 HRM-HC-CELL-LOCKED` **AND** không có `DELETE FROM public.recruitment_plan_departments`, không có `UPDATE public.recruitment_plans`, `withTransaction` **không** được gọi; store còn 1 dept / 1 position; `getById` trả `cell_id` cũ · `need_hire=2` · `lifecycle_status=need_hire_approved`; `spawnRecruitmentPlanRequests` vẫn `created=1` (cell eligible) |
| **allow_override=true** (O3) | ghi thành công trong 1 transaction; cell `headcount_need_hire=7` |
| **draft plan (cell open)** | replace bình thường: `withTransaction` 1 lần, có `DELETE`, cell = 4 |
| **VAL reject `require_twelve`** | `HRM-HC-VAL-400`; `withTransaction` không gọi; lưới cũ nguyên vẹn (cell = 2) |
| **create với ô lỗi** | `HRM-HC-VAL-400` **trước** `INSERT INTO public.recruitment_plans` (không plan mồ côi) |

## Module suite (full `src/recruitment`)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="src/recruitment" --no-coverage
Test Suites: 1 failed, 19 passed, 20 total
Tests:       2 failed, 165 passed, 167 total
```

Fail duy nhất: `p1-phase1-be-crud-rd-parity.spec.ts` → **`AttendanceService.getRecordById`** (2 tests, `HRM-ATT-404` / `employee_id IN` workforce scope). **Pre-existing, ngoài diff BE-02** — spec import `AttendanceService` + `RecruitmentService`, **không** import `RecruitmentCatalogService`; BE-02 chỉ sửa `recruitment-catalog.service.ts`. Ghi residual dưới.

## Build + lint

```text
pnpm --filter hrm-api run build   → nest build + verify-dist  BUILD_EXIT=0
ReadLints (2 files changed)       → No linter errors
```

## Ops — dist không stale (đóng residual QA-01 P2)

```text
kill node dist/main (PID 5904) → start node --enable-source-maps dist/main (apps/api/hrm-api)
GET http://127.0.0.1:28001/api/hrm/employees?company_id=main → 401 (process sống, auth guard)
RouterExplorer: recruitment-plans {GET, POST} · :planId {GET, PUT, DELETE} · :planId/status {PATCH}
                :planId/spawn-requests {POST} · :planId/submit-workflow {POST}
```

`:28001` đang chạy **dist mới** — QA-02 không cần rebuild trước L1.

---

## must_keep verified

| Item | Status |
|------|--------|
| BE-01 green (jest 50) | 🟢 50 cũ vẫn pass trong 55 |
| `allow_override` path (BA O3) | 🟢 test riêng |
| Spawn idempotency (BR-BP-HC-04) | 🟢 BE-01 HC-S3/S4 pass + spawn sau 409 vẫn eligible |
| U19 scope parity list=get=spawn | 🟢 BE-01 spec pass (không đụng resolver) |
| XBOS `submit-workflow` · YCTD/JD · UF-HRM-12 | 🟢 không đụng path |
| Soft-delete · REC-03 OUT | 🟢 không đụng |
| DENY invent `/rec/headcount-plans` · dual `rec_headcount_*` · seed · honesty flip | 🟢 không thêm route/table; không chạy seed |

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| `R-ATT-CRUD-RD-PARITY-SPEC` | P2 | dev-be (attendance lane) | `p1-phase1-be-crud-rd-parity.spec.ts` 2 fail `AttendanceService.getRecordById` — pre-existing, **không** thuộc REC-01 cluster; cần seat riêng |
| `R-REC-HC-OVERRIDE-CELLID` | P2 | ba-process / dev-be | Khi `allow_override` và payload **không** gửi `cell_id`, cell_id được mint mới (hành vi BE-01 giữ nguyên) ⇒ YCTD `headcount_cell_id` cũ trở thành mồ côi. Cần AC O3 rõ: FE luôn gửi `cell_id`, hay BE phải giữ theo natural key |
| Honesty | — | qc | `recruitment_uat_ready` vẫn **false**; C-SLICE-≠-MODULE |
| O3 qty_drift FE | P2 | dev-fe | Giữ nguyên từ QA-01 (NOTE_BLOCKED) |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-02.md` |
| **completion_report** | Đóng P0 `R-REC-HC-PUT-LOCKED-WIPE`: `replacePlanDepartments` tách thành `buildPlanDepartmentWritePlan` (validate, no write) + `writePlanDepartments` (ghi trong `withTransaction`); create/upsert validate trước rồi ghi header + lưới trong một transaction ⇒ 409 `HRM-HC-CELL-LOCKED` để lưới, ô `need_hire_approved` và spawn eligible nguyên vẹn. `allow_override` (O3) giữ nguyên. Cluster jest **55/55** (50 cũ + 5 regression), build exit 0, lint sạch, `:28001` restart dist mới. Residual: 2 fail attendance pre-existing ngoài diff; cell_id mint khi override thiếu `cell_id` (P2 cần AC). Honesty `recruitment_uat_ready=false`. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: BE-02 READY_FOR_QA (fix R-REC-HC-PUT-LOCKED-WIPE)
entry_criteria: L0 stack PASS; hrm-api :28001 đã chạy dist mới (BE-02 restart, routes GET/PUT/spawn mapped); U65 zero-seed; browser-only cho UF
READ: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-02.md · po-hrm-mvp-gd1-rec-01-cluster-qa-01.md (repro cũ) · API-01 §5 F-REC-HC-01 bước (7) · BA-01 AC-REC-HC-01-EX-04
MISSION (retest P0 + spawn residual):
1) L1 retest locked PUT — tạo plan từ FE (U65, không seed) → PUT need_hire → PATCH approved → PUT bump need_hire KHÔNG allow_override:
   - expect 409 HRM-HC-CELL-LOCKED
   - GET …/recruitment-plans/:planId?company_id=main NGAY SAU 409: departments.length và positions.length KHÔNG đổi; cell cùng cell_id · headcount_need_hire cũ · lifecycle_status=need_hire_approved
   - POST …/:planId/spawn-requests sau 409 → vẫn created:1 (hoặc skipped_duplicate nếu đã spawn) — KHÔNG được rỗng vì mất cell
2) allow_override=true → 200 và số lượng mới ghi được (BA O3)
3) U65 browser J-HRM-REC-HC-01 + 01b: Lưu + F5 lưới còn nguyên; sau khi bị chặn (toast/banner 409) lưới trên UI KHÔNG trắng/0 vị trí; Sinh YCTD vẫn chạy
4) Regression must_keep: U19 list↔get-by-id (main + member slug), submit-workflow, YCTD list→detail (J-HRM-05)
cấm: pnpm seed:* · ghi DB trực tiếp · flip recruitment_uat_ready · claim module REC UAT (C-SLICE-≠-MODULE)
exit: PASS_TO_PM hoặc FAIL_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-02.md · cập nhật hàng R-REC-HC-PUT-LOCKED-WIPE
```
