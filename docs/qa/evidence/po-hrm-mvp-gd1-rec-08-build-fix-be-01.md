# PO-HRM-MVP-GD1-REC-08-BUILD-FIX-BE-01 — `nest build` TS2724 + scope token alias

- **lane:** execution · dev-be
- **program:** PO-HRM-MVP-GD1-CONTINUOUS (U89)
- **change_mode:** FIX (narrow) · `preserve_default: true` · `code_memory_mode: APPEND`
- **priority:** P1 build integrity
- **date:** 2026-08-09
- **ack_status:** `READY_FOR_QA`
- **honesty:** `recruitment_uat_ready=false` · `C-SLICE-≠-MODULE` — build/test integrity only, **không** flip UF/UAT flag nào.

---

## 1. spec_read_ack

| Artifact | § đã đọc |
|---|---|
| `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-qa-01.md` | § residual OBS — dòng «Nest `nest build` typecheck» P2 |
| `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-bod-chain-qa-02.md` | § OBS build — «orthogonal TS2724 … blocks clean rebuild» |
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | §187 `export type HrmListScopeContext` |
| `apps/api/hrm-api/src/common/hrm-list-scope-context.ts` | toàn file — chỉ export `toHrmListScopeContext` |
| `apps/api/hrm-api/src/common/scope-context.ts` | §306–328 `SCOPE_CONTEXT_MISMATCH` |
| `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md` | §4.2 · §8 bảng mã lỗi · F-REC-DASH-01/02 |
| `apps/api/hrm-api/src/recruitment/recruitment-dashboard.service.ts` · `.constants.ts` · `recruitment.controller.ts` | REC-08 BE-01 |

---

## 2. Reproduce (trước fix)

```text
> hrm-api@0.0.1 build
> nest build

src/recruitment/recruitment-dashboard.service.ts:31:15 - error TS2724:
  '"../common/hrm-list-scope-context"' has no exported member named 'HrmListScopeContext'.
  Did you mean 'toHrmListScopeContext'?

31 import type { HrmListScopeContext } from '../common/hrm-list-scope-context';
                 ~~~~~~~~~~~~~~~~~~~
Found 1 error(s).
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  hrm-api@0.0.1 build: `nest build`
Exit status 1
```

**Root cause:** `common/hrm-list-scope-context.ts` chỉ **import** type rồi export **hàm** `toHrmListScopeContext`; type `HrmListScopeContext` được khai báo & export ở `common/hrm-list-scope.ts` (§187). REC-08 nhập type từ module hàm → TS2724. Toàn bộ service peer (`recruitment.service.ts`, `attendance.service.ts`, `payroll.service.ts`, …) đều nhập type từ `../common/hrm-list-scope` — REC-08 là ngoại lệ duy nhất.

---

## 3. Thay đổi (narrow)

| # | File | Thay đổi | Loại |
|---|---|---|---|
| 1 | `src/recruitment/recruitment-dashboard.service.ts` | Gộp import: `import { type HrmListScopeContext, resolveHrmListScope } from '../common/hrm-list-scope';` — đúng nơi khai báo type, cùng convention peer. **Không** `any`, **không** cast, **không** re-export mới. + `@CODE-MEMORY-CHANGE` APPEND | product (import-only) |
| 2 | `src/recruitment/recruitment-dashboard.constants.ts` | JSDoc trên `HRM_SCOPE_409` — tài liệu hóa 2 lớp 409 (quyết định §4) | comment-only |
| 3 | `src/recruitment/po-hrm-rec-iv-one-active-be-02.spec.ts` | Thêm provider stub `RecruitmentDashboardService` vào `Test.createTestingModule` — REC-08 đã thêm dep vào ctor `RecruitmentController` nhưng spec chưa cập nhật → Nest DI FAIL | test-only (do REC-08) |
| 4 | `src/recruitment/p1-phase1-be-crud-rd-parity.spec.ts` | `new AttendanceService(db, fanout, attendanceConfigStub)` — ctor đã có `AttendanceConfigService` (wave geofence) nhưng spec dựng thiếu arg → `ensureWorkSitesSchema` undefined | test-only (drift ngoài wave) |
| 5 | `src/recruitment/be-hrm-g-rc-01.spec.ts` | Fixture create YCTD thêm `job_template_id` + mock `job_description_templates` — spec legacy có trước khi `BR-YCTD-JD-REF-01` khóa JD soft FK bắt buộc | test-only (drift ngoài wave) |

**Không chạm:** DTO field names FE bind · scope resolver U19 · REC-01 cell REUSE/spawn UQ · REC-02 tokens/BOD/reject · TARGET-MONTH · formulas · SQL · migration · seed.

---

## 4. Quyết định P3 — `SCOPE_CONTEXT_MISMATCH` vs `HRM-SCOPE-409`

**Chọn: GIỮ NGUYÊN runtime `SCOPE_CONTEXT_MISMATCH` + tài liệu hóa alias** (không đổi token).

Điều tra cho thấy đây **không phải** alias trùng mà là **hai lớp 409 khác nhau**:

| Lớp | Token | Emitter | Khi nào |
|---|---|---|---|
| Nền tảng (resolver) | `SCOPE_CONTEXT_MISMATCH` | `common/scope-context.ts` §307/§322 qua `resolveHrmListScope` | `company_id` / `tenantId` hint ≠ claim JWT |
| Tài nguyên (row) | `HRM-SCOPE-409` | `assertResourceInHrmScope({ mismatchCode })` — `jd-dynamic.service.ts`, `rec-pipeline-stage.service.ts`, `att-*` | hàng **đã đọc** lệch scope đã resolve |

Dashboard REC-08 là read-model **GET-only, không có get-by-id theo row**, nên chỉ đi qua lớp resolver ⇒ runtime luôn là `SCOPE_CONTEXT_MISMATCH`. API-01 §4.2 viết «scope reuse `HRM-SCOPE-409` … **RETAIN family** … 403 pattern of list plans» — đó là **nhãn họ lỗi** mô tả pattern kế thừa, không phải literal của dashboard.

**Lý do không đổi token:** `SCOPE_CONTEXT_MISMATCH` là hợp đồng nền tảng đã seal ngoài phạm vi REC-08 —
`common/scope-context.spec.ts` (8 assertion), ma trận QA mọi module (`C-W2QC-01` D05/D07/D12 matcher fail-closed strict `code === 'SCOPE_CONTEXT_MISMATCH'`), bản đồ lỗi VI của FE, và evidence QC đã đóng. Đổi ⇒ vỡ consumer đã seal — vi phạm `must_keep` / preserve.

**Hành động thay thế:** ghi rõ alias trong JSDoc `HRM_SCOPE_409` (`recruitment-dashboard.constants.ts`) để seat sau không mở lại. Hằng số giữ nguyên cho traceability API-01 §8; dashboard không tự ném token này.

**Đề xuất cho BA/SA (không tự sửa):** cập nhật API-01 §8 ghi chú «runtime literal = `SCOPE_CONTEXT_MISMATCH`; `HRM-SCOPE-409` = family label / row-level» → đóng hẳn `R-REC-08-SCOPE-TOKEN-ALIAS`.

Probe xác nhận (sau restart clean dist):

```text
GET /api/hrm/recruitment/dashboard?year=2026&company_id=xe-du-lich   (JWT ceo@xe.vn tenantId=xevn companyId=main group_ceo)
STATUS=409
{"success":false,"code":"SCOPE_CONTEXT_MISMATCH","message":"companyId mismatches token scope",
 "details":{"field":"companyId","token":"main","request":"xe-du-lich"}}
```

---

## 5. Verify

### 5.1 Build — **exit 0**

```text
> hrm-api@0.0.1 build C:\...\apps\api\hrm-api
> nest build

> hrm-api@0.0.1 postbuild C:\...\apps\api\hrm-api
> node ./scripts/verify-dist.mjs

(exit 0)
```

Không còn TS2724. `postbuild verify-dist.mjs` PASS ⇒ dist là **build thật**, không phải content-seal.

### 5.2 Jest — recruitment + scope

```text
pnpm --filter hrm-api exec jest --testPathPatterns "recruitment|rec-pipeline|scope-context|hrm-list-scope|be-hrm-g-rc"

Test Suites: 32 passed, 32 total
Tests:       299 passed, 299 total
```

Bao gồm: `po-hrm-mvp-gd1-rec-01-cluster-be-01/02` · `rec-02-cluster-be-01` · `rec-08-cluster-be-01` · `rec-hc-override-cellid-be-01` · `recruitment.controller.spec` · `recruitment.service.spec` · `rec-pipeline-stage.*` · `jd-dynamic.scope-parity` · `po-hrm-jd-yctd-ref-be-01` · `common/scope-context.spec` · `common/hrm-list-scope.spec`.

Trước fix: `2 failed, 4 tests failed` (+ `be-hrm-g-rc-01` 1 failed).

### 5.3 Jest — toàn hrm-api

```text
pnpm --filter hrm-api exec jest
Test Suites: 10 failed, 151 passed, 161 total
Tests:       39 failed, 1504 passed, 1543 total
```

**10 suite FAIL đều PRE-EXISTING, ngoài wave này, không suite nào chạm recruitment/dashboard** — xem §6.

### 5.4 Runtime — restart :28001 trên dist sạch

| Bước | Kết quả |
|---|---|
| Kill PID cũ (29504, `node --enable-source-maps dist/main`) | OK |
| `pnpm --filter hrm-api build` (lần 2, sau mọi thay đổi) | exit 0 |
| Start lại `node --enable-source-maps dist/main` (cwd `apps/api/hrm-api`) | PID **15676** LISTEN `:28001` |
| `GET http://127.0.0.1:28001/api/hrm` | **200** |

```text
GET /api/hrm/recruitment/dashboard?year=2026&include=yctd&company_id=main
STATUS=200
{"success":true,"code":"HRM-REC-DASH-200","message":"Recruitment dashboard loaded",
 "data":{"period":{"year":2026,...},
  "scope":{"company_ids":["holding","trsport","logistics","finance","services"],"rollup":true},
  "planned_need":45,"filled_count":0,"in_pipeline_count":13,"open_yctd_count":22,
  "gap_count":45,"completion_pct":0,"enough_people_status":"in_progress",
  "enough_people_eta":"2026-08","funnel":{"cv":13,"screening":0,"interview":0,"offer":0,"onboard":0}, ...}}

GET /api/hrm/recruitment/dashboard/yctd?year=2026&page=1&page_size=5
STATUS=200  code=HRM-REC-DASH-200 "Recruitment dashboard YCTD drill loaded"
```

Khớp QA-01 (`planned=45 · filled=0 · pipeline=13 · gap=45 · pct=0 · status=in_progress · eta=2026-08 · funnel 5 keys`) ⇒ **không regression** DTO/số liệu.

---

## 6. Residual / OBS (pre-existing, KHÔNG do wave này)

Toàn bộ nằm ngoài `apps/api/hrm-api/src/recruitment/**`, do ctor/export drift của các wave khác; đề nghị PM mở work_item riêng.

| # | Suite | Triệu chứng | Ưu tiên đề xuất |
|---|---|---|---|
| OBS-1 | `auth/uat-mobile-auth-ensure.spec.ts` · `auth/uat-mobile-pilot-data-ensure.spec.ts` | `parseUatMobileSeq / buildUatEnsureSpec / employeeIdForSeq is not a function` — export bị đổi/xóa | P2 |
| OBS-2 | `settings-catalogs/p1-web-acceptance-extension-items.spec.ts` · `be-hrm-settings-md-pos-seed-01.spec.ts` | `this.settingsCatalogs.getEffectiveItemsForKey is not a function`; `position_key` DTO assertion | P2 |
| OBS-3 | `attendance/attendance-sheet-scope-parity.spec.ts` · `attendance/be-hrm-c-conv-as-01.spec.ts` | ctor drift lớp attendance (cùng class với fix #4) | P2 |
| OBS-4 | `be-erp-e1a-pos-key-01.spec.ts` · `be-erp-e2-01.spec.ts` | ERP legacy | P3 |
| OBS-5 | `common/p1-phase1-be-mob-jmob-04-05.spec.ts` · `common/p1-ex-https-hrm-probe-l2.spec.ts` | probe/mobile legacy | P3 |

**Không** tự sửa (DENY broaden). Riêng #4/#5 trong §3 được sửa vì nằm trong thư mục `recruitment/` và chặn exit criteria «recruitment jest green».

---

## 7. must_keep — xác nhận giữ nguyên

| must_keep | Bằng chứng |
|---|---|
| REC-01 cell REUSE + spawn UQ | `po-hrm-mvp-gd1-rec-01-cluster-be-01/02.spec.ts` PASS |
| REC-02 tokens / BOD / reject | `po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts` PASS · dashboard drill vẫn thấy YCTD `QA BOD AC02b05 REC02BODQA2-MSKX3U8H` |
| TARGET-MONTH | `recruitment-plan-headcount.spec.ts` PASS · `by_month` + `eta=2026-08` giữ nguyên |
| REC-08 DTO field names (FE bind) | Response §5.4 giữ đủ `planned_need · filled_count · in_pipeline_count · open_yctd_count · gap_count · completion_pct · enough_people_status/eta/eta_label · funnel · funnel_labels · by_month · by_org_unit · by_yctd · empty_guide · scope` |
| U19 scope parity | `common/scope-context.spec` + `hrm-list-scope.spec` + `jd-dynamic.scope-parity.spec` PASS · 409 probe §4 |
| U65 zero-seed | Không chạy seed nào; dữ liệu dashboard là data sẵn có trên `:28001` |
| honesty flags | Không đổi |

---

## 8. Rollback

Chỉ 5 file source, không migration / không schema / không data. Revert = hoàn nguyên 5 file + `pnpm --filter hrm-api build` + restart `:28001`. Rủi ro ~0.

---

## 9. Handoff

- `completion_report`: TS2724 CLOSED — `nest build` exit 0 (`verify-dist` PASS). Recruitment jest **32/32 suites · 299/299 tests** green (đã sửa 3 spec drift chặn suite). `:28001` restart trên **dist sạch** (PID 15676), `GET /recruitment/dashboard` + `/dashboard/yctd` **200 HRM-REC-DASH-200`** khớp số liệu QA-01. P3 token alias: **giữ** `SCOPE_CONTEXT_MISMATCH` (hợp đồng nền tảng đã seal) + tài liệu hóa 2 lớp trong `recruitment-dashboard.constants.ts`; đề xuất BA/SA cập nhật API-01 §8 để đóng hẳn. Residual: 10 suite FAIL pre-existing ngoài recruitment (§6).
- `next_owner`: `qa`
- `evidence_path`: `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-build-fix-be-01.md`
- `ack_status`: `READY_FOR_QA`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-BUILD-FIX-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
priority: P1 — smoke only (build integrity retest, no new UF)
depends_on: PO-HRM-MVP-GD1-REC-08-BUILD-FIX-BE-01 (READY_FOR_QA)

entry_criteria:
- hrm-api :28001 LIVE trên dist BUILD THẬT (PID mới, không content-seal)
- docs/qa/evidence/po-hrm-mvp-gd1-rec-08-build-fix-be-01.md đã đọc

MISSION (smoke — KHÔNG mở UF mới, KHÔNG flip honesty):
1) Build integrity: chạy `pnpm --filter hrm-api build` → dán exit code. Yêu cầu exit 0, không TS2724.
   Ghi rõ trong evidence: seat này KHÔNG còn content-seal dist.
2) Jest: `pnpm --filter hrm-api exec jest --testPathPatterns "recruitment|rec-pipeline|scope-context|hrm-list-scope|be-hrm-g-rc"`
   → yêu cầu 32/32 suites · 299/299 tests PASS. Dán summary.
3) FE smoke (U65 — browser, không seed): login ceo@xe.vn / Xevn@2026 →
   HRM → Tuyển dụng → Dashboard «bao giờ đủ người» → lọc kỳ 2026 → F5.
   AC: Network GET /api/hrm/recruitment/dashboard 200 HRM-REC-DASH-200;
   KH=45 · TT filled=0 · pipeline=13 · gap=45 · %=0 · status=in_progress · ETA 08/2026 · funnel đủ 5 key;
   drill 1 YCTD → detail mở, không 404/409; không banner đỏ, không GET storm.
4) Regression seals (click path, không API-only):
   - REC-01: mở Định biên → cell REUSE + spawn UQ hiển thị đúng
   - REC-02: 1 YCTD out_of_plan → BOD chain hiển thị token/reject reason như QA-02
   Chỉ xác nhận KHÔNG đổi so với evidence QA trước; nếu lệch → FAIL_TO_PM.
5) Xác nhận token 409: gọi dashboard với company_id ngoài scope → 409 code SCOPE_CONTEXT_MISMATCH
   (ĐÚNG theo quyết định BE §4 — KHÔNG coi là defect; ghi vào evidence là ACCEPTED alias).

must_keep: REC-01 cell REUSE + spawn UQ · REC-02 tokens/BOD/reject · TARGET-MONTH · REC-08 DTO field names · U19 parity
DENY: seed · honesty flip (recruitment_uat_ready giữ false) · mở UF mới · claim module REC UAT-ready

exit_criteria:
- evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-build-fix-qa-01.md
- build exit 0 + jest summary dán nguyên văn
- mỗi bước FE có click path + Network status + screenshot
- ack_status: PASS_TO_PM (hoặc FAIL_TO_PM kèm work_item_id đề xuất)
- next_owner: pm
- next_dispatch_prompt copy-ready
- Append bus block
```
