# PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01 — API F.1 · Nghỉ ốm RETAIN classify + VAL + leave TXN · GAP fund-order + day-branch (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-35 seat **#40**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-CAT-LVT/EFF** · **F-ATT-LEAVE-02** submit · **F-ATT-LEAVE-01** preview (ATT-08) · **F-ATT-LEAVE-BAL** panel (ATT-05b) · **GAP** **F-ATT-SICK-POLICY-ORDER** (`GET/PUT …/sick-leave-fund-order`) · **GAP** **F-ATT-SICK-DAY-BRANCH** (allocator side-effect) mapped DATA **§6.1** · **§6.2** · physical **`/api/hrm/attendance/*`** · paper `/att/*` + `/core/*` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** invent `att_leave_hold` · **DENY** merge `compensatory`/`carry_over`/sick display→`annual` · **DENY** reopen **J-HRM-ATT-06-*** · **must_keep** **`ATT06QC1-MSM84GWC1`** · **`ATT06QA1-MSM84RYS`** · **`ATT05BQC1-MSM5SDQC1`** · **`ATT05QC1-MSM52GWC1`** · **`ATT09QC1-MSLUTL9D`** · **`ATT04BQC1-MSM3S8QC1`** · **`ATT04QC1-MSM22G4W`** · **`ATT03DQC1-MSM1CR19`** · **`ATT10QC1-MSLWGUYH`** · **`ATT11QC1-MSLXTH9P`** · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP MAP** — LIVE RETAIN paths **PRESENT** · fund-order + day-branch API **ABSENT** (DATA §6.1/§6.2 stamped closable · not LIVE until migrate) · **unlock dev-be BE-01** (HOLD lifted by this stamp) · **dev-fe FE-01 HOLD** (sick picker flags + attach UX narrow) · **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06/05b/05/04/04b DONE** · **≠ ATT UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-ATT-07` · `FR-UC-BP-ATT-07` · **BR-BP-LV-04** · **DV-16** · peer **BR-LEAVE-ATT-01** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O20 **CONFIRMED** · SA-01 Option **A LOCKED** · [`PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md) §6.1 fund-order · §6.2 day-branch · peer ATT-09 hold · ATT-05b panel · ATT-08 preview · **R-ATT-07-POLICY-ORDER** · **R-ATT-07-DAY-BRANCH** · **R-ATT-07-OVER-BH/ANNUAL-FIRST/SHEET-CODE/AGG/DV16/FE-PICKER** · **R-ATT-01-ASSIGN open** |
| **ref_data** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md` §6.1 `att_sick_leave_fund_order` · §6.2 `att_sick_leave_day_branch` |
| **ref_ba** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md` — AC-ATT-07-* · **J-HRM-ATT-07-01..07** DRAFT · **J-HRM-ATT-06-04** regression |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-07-CLUSTER-SA-01.md` §5 F.1 sketch |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-07** · Diễn biến **#1 · #2** · Luồng chính **1–4** · **BR-BP-LV-04** · đặc biệt «vượt ngày BH» · «còn phép năm» |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — leave-types* · leave-requests · preview-deduction · leave-balance/panel · program delta **F-ATT-SICK-*** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `att_leave_type` flags · §4.4b **`pending_days`** · **DENY** physical `att_leave_hold` |
| **ref_code_cite** | `att-leave-type.service.ts` — flags on CRUD/EFF · `leave-requests.service.ts` — `resolveIsSickLeaveType` · `assertSickAttachmentIfRequired` → **`HRM-LEAVE-VAL-ATT`** · `lockPendingLeaveBalance` → **`pending_days`** · `leave-balance.service.ts` — **`MVP_LEAVE_BALANCE_TYPES`** (no sick bucket) · grep **`sick_leave_fund` / `sick_leave_day` / `sick-leave-fund-order` route = 0** — **read-only 2026-08-10** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** sick picker / VAL-ATT alone = FR-07 DONE · **DENY** ATT-07 / ATT-06/05b/05/04/04b / ATT UAT DONE · **DENY reopen J-HRM-ATT-06-*** |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (migration §6.1/§6.2 + policy routes + allocator hook) · **dev-fe FE-01 HOLD** (picker/attach narrow) · **qa** U65 **J-HRM-ATT-07-*** + **J-HRM-ATT-06-04** after READY_FOR_QA |

---

## 1. Verdict — RETAIN LIVE sick spine + documented GAP policy/allocator

| Decision | Stamp |
|----------|--------|
| Catalog flags BH/CTY on leave type | **RETAIN** — `GET/POST/PATCH …/leave-types*` · EFF exposes `insuranceRegimeFlag` · `companyTopupFlag` (**O1**) |
| Sick classify runtime | **RETAIN** — `resolveIsSickLeaveType` on submit path (**O2**) |
| Attach VAL ≥3 ngày | **RETAIN** — **`HRM-LEAVE-VAL-ATT`** · **≠** FR-07 DONE alone (**O3**) |
| Submit sick + hold | **RETAIN** — **`POST …/leave-requests`** · **`pending_days`** when tracked row (**ATT09QC1**) · **DENY** `att_leave_hold` (**O4**) |
| Preview days | **RETAIN cite** — **`POST …/preview-deduction`** (ATT-08) (**O5**) |
| Panel MVP | **RETAIN** — 5 buckets · **sick ∉ panel** · **DENY** merge sick→`annual` (**O6**) |
| Fund order CRUD | **GAP** — **F-ATT-SICK-POLICY-ORDER** → DATA §6.1 · route **ABSENT** until migrate (**O7**) |
| Per-day branch allocator | **GAP** — **F-ATT-SICK-DAY-BRANCH** → DATA §6.2 · writer **ABSENT** (**O8–O11**) |
| ATT-10 AGG | **RETAIN cite** + **HOLD footer** **R-ATT-07-AGG** when allocator LIVE (**O12**) |
| ATT-11 close | **RETAIN cite** · **≠** branch allocator trigger (**O13**) |
| ATT-06 compensatory peer | **must_keep** **`ATT06QC1`** · **DENY merge compensatory→annual** · **DENY reopen J-06** (**O15**) |

```text
  ATT-06 (ATT06QC1) · ATT-05b (ATT05BQC1) · ATT-05 (ATT05QC1) · ATT-04/04b · ATT-09 · ATT-08 · ATT-03d — must_keep
  ATT-10 (ATT10QC1) AGG · ATT-11 (ATT11QC1) close — context gates · ≠ branch SoT
  Nest /core DENY · honesty false · PAY OUT · C-SLICE · DENY reopen J-HRM-ATT-06-*
       │
       ▼
  FR-UC-BP-ATT-07 (RETAIN cite + GAP policy/branch)
       │
       ├─ RETAIN LIVE
       │    F-ATT-CAT-LVT/EFF + admin flags (BH/CTY)
       │    F-ATT-LEAVE-02 sick submit + VAL-ATT + pending_days (if tracked)
       │    F-ATT-LEAVE-01 preview-deduction (peer ATT-08)
       │    F-ATT-LEAVE-BAL panel (5 buckets — no sick pool)
       │
       ├─ GAP (post-migrate · dev-be BE-01)
       │    F-ATT-SICK-POLICY-ORDER GET/PUT sick-leave-fund-order (DATA §6.1)
       │    F-ATT-SICK-DAY-BRANCH allocator on submit/approve sick path (DATA §6.2)
       │    F-ATT-SICK-SHEET-CODE optional sheet_day_code on branch rows (HOLD writer)
       │
       └─ DENY / HOLD
            att_leave_hold table
            merge compensatory/sick/carry→annual
            sheet close as sole branch trigger
            Nest /core sick policy SoT
            VAL-ATT / picker alone = FR-07 DONE
```

**Invariant ATT-07-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` as sick/leave SoT = **FAIL** (**AC-ATT-07-PATH**).

**Invariant ATT-07-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL** (**ATT09QC1-MSLUTL9D** · **AC-ATT-07-MK-ATT09**).

**Invariant ATT-07-≠-VAL-DONE:** Sick picker + attach VAL alone = FR-07 / ATT-07 DONE = **FAIL** (**AC-ATT-07-≠-VAL-DONE**).

**Invariant ATT-07-≠-MERGE:** Fold `compensatory` into `annual` · merge sick display into `annual` panel · merge `carry_over` into `annual` = **FAIL** (**ATT06QC1** · **ATT05QC1** · **AC-ATT-07-≠-MERGE-SICK-ANNUAL**).

**Invariant ATT-07-≠-REOPEN-J06:** Reopen or demote sealed **J-HRM-ATT-06-01..07** without bus regression stamp = **FAIL** (**AC-ATT-07-≠-REOPEN-J06**).

**Invariant ATT-07-FUND-HOLD-LABEL:** Evidence claiming fund-order/day-branch DONE when engine absent = **FAIL** — footer **HOLD** mandatory on **J-HRM-ATT-07-05**.

**Invariant ATT-07-U19:** EFF list scope **=** submit assert scope **=** policy GET/PUT `company_id` **=** day-branch rows `company_id` for same tenant.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06 / FR-06 DONE** (`ATT06QC1-MSM84GWC1`) · **≠ ATT-05b DONE** (`ATT05BQC1-MSM5SDQC1`) · **≠ ATT-05 DONE** (`ATT05QC1-MSM52GWC1`) · **≠ ATT-04/04b DONE** (`ATT04QC1` · `ATT04BQC1`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-09 `pending_days` · ATT-03d · ATT-10/11 context · **R-ATT-07-AGG/CORE10** HOLD · **DENY `att_leave_hold`** · **DENY merge** compensatory/sick/carry→annual · **DENY reopen J-HRM-ATT-06-*** · no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Controller** | Nest `@Controller('attendance')` → **`/api/hrm/attendance`** |
| **ATT-07 RETAIN** | `…/leave-types*` · `…/leave-types/effective` · `…/leave-requests` (**POST**) · `…/leave-requests/preview-deduction` · `…/leave-balance/panel` · peer `…/leave-requests/:id/approve\|reject\|cancel` |
| **ATT-07 GAP (target post-migrate)** | `…/sick-leave-fund-order` (**GET/PUT**) — **ABSENT** controller 2026-08-10 |
| **ATT-07 GAP (no standalone route GĐ1)** | **F-ATT-SICK-DAY-BRANCH** — normative hook inside sick **`POST …/leave-requests`** (post-VAL) and/or **`POST …/leave-requests/:id/approve`** when allocator LIVE |
| **ATT-07 peer context (must_keep cite)** | `…/attendance-sheets/:id/aggregate` (**F-ATT-SHEET-01**) · `…/attendance-sheets/:id/close` (**F-ATT-SHEET-02**) |
| **LOGICAL (paper)** | `/api/hrm/att/…` · `/api/hrm/core/…` — **alias only** |
| **OUT** | PAY CORE-10 invent DONE · invent `att_leave_hold` CRUD |

| Paper / logical | Physical | DB (DATA-07) |
|-----------------|----------|--------------|
| Sick type EFF | `GET …/leave-types/effective` | `att_leave_type` flags **RETAIN** |
| Admin flags BH/CTY | `GET/POST/PATCH …/leave-types*` | `insurance_regime_flag` · `company_topup_flag` **RETAIN** |
| Submit sick | `POST …/leave-requests` | `leave_requests` + attach **RETAIN** |
| Paper `held` / `att_leave_hold` | submit hold | **`pending_days`** **RETAIN** · **DENY** table |
| Fund order policy | `…/sick-leave-fund-order` | `att_sick_leave_fund_order` **ADD §6.1 NOT LIVE** |
| Per-day branch | allocator hook | `att_sick_leave_day_branch` **ADD §6.2 NOT LIVE** |
| Panel (no sick bucket) | `GET …/leave-balance/panel` | 5 MVP keys only **RETAIN** |
| Sheet close | `POST …/close` | **≠** allocator writer **DENY** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-07 verdict |
|---------|------------|----------------|
| `insurance_regime_flag` · `company_topup_flag` | `att-leave-type.service` / EFF DTO | **RETAIN** **AC-ATT-07-CAT-FLAGS** |
| `resolveIsSickLeaveType` | `leave-requests.service` | **RETAIN** **AC-ATT-07-SICK-CLASSIFY** |
| `HRM-LEAVE-VAL-ATT` | `assertSickAttachmentIfRequired` | **RETAIN** **AC-ATT-07-VAL-ATT** |
| `POST leave-requests` + hold | `lockPendingLeaveBalance` → `pending_days` | **RETAIN** **AC-ATT-07-SUBMIT-HOLD** |
| `preview-deduction` | ATT-08 peer | **RETAIN** **AC-ATT-07-MK-ATT08** |
| Panel 5 buckets no sick | `MVP_LEAVE_BALANCE_TYPES` | **RETAIN** **AC-ATT-07-PANEL-NO-SICK** |
| `compensatory` separate | panel + balances | **must_keep ATT06QC1** |
| `sick-leave-fund-order` route | grep **0** | **GAP** §4.8 |
| `att_sick_leave_day_branch` | grep **0** | **GAP** §4.9 |
| `att_leave_hold` table | grep CREATE **0** | **DENY invent** |
| Nest `@Controller('core')` sick SoT | **ABSENT** | **DENY** |

---

## 4. F.1 — endpoints (normative)

> Peer **ATT-04** (LVT) · **ATT-05b** (panel) · **ATT-08** (preview) · **ATT-09** (hold) remain **must_keep**. This section deepens **ATT-07** GAP functions and re-cites touched RETAIN surfaces.

### 4.1 F-ATT-CAT-LVT-EFF — GET loại phép hiệu lực (picker ốm) (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-types/effective`** |
| **Paper alias** | F-ATT-CAT-LVT EFF · peer ATT-04 / PLT catalog |
| **Mục đích** | NV/HCNS đọc danh mục loại phép hiệu lực khi tạo đơn — picker **ốm** phải chọn từ EFF, không free-text làm SoT. |
| **Nghiệp vụ xử lý** | Filter EFF theo `company_id` + ngày hiệu lực · expose per type: `code` · `category` · **`insuranceRegimeFlag`** · **`companyTopupFlag`** · sick metadata (`metadata_json` / label VI) · scope resolver U19 same family as submit · **cấm** return types outside company scope that submit would reject. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — Đầu vào «Loại đơn nghỉ ốm» · Luồng chính **1** · quy tắc «loại ốm phải thuộc danh mục» · **AC-ATT-07-CAT-FLAGS** · **AC-ATT-07-SICK-CLASSIFY** · **J-HRM-ATT-07-01** |
| **Request → DB** | Read `att_leave_type` (+ EFF rules) — `insurance_regime_flag` · `company_topup_flag` · `category` · `metadata_json` |
| **Response (display-ready)** | `items[]`: `{ id, code, name, category, insuranceRegimeFlag, companyTopupFlag, isSick?, metadata? }` |
| **Lỗi** | `HRM-SCOPE-409` · empty EFF = valid empty list (not 500) |

### 4.2 F-ATT-CAT-LVT-ADMIN — CRUD cờ BH/CTY trên loại (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET/POST/PATCH /api/hrm/attendance/leave-types`** (and by-id variants per controller) |
| **Paper alias** | F-ATT-CAT-LVT admin |
| **Mục đích** | HCNS cấu hình loại phép — gắn cờ **chế độ BH** và **hỗ trợ CTY** trên loại ốm (tiên quyết SRS trước allocator). |
| **Nghiệp vụ xử lý** | CRUD `att_leave_type` · persist `insurance_regime_flag` · `company_topup_flag` · validate **DV-16** at admin: reject config where both flags true on same type without documented exception rule → **409** `HRM-ATT-SICK-DV16-CONFIG` · soft-retire types · **≠** fund-order CRUD (§4.8). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — Tiên quyết «Chính sách nhánh BH / hỗ trợ CTY» · **BR-BP-LV-04** · **DV-16** · **AC-ATT-07-CAT-FLAGS** |
| **Request → DB** | `att_leave_type.insurance_regime_flag` ← `insuranceRegimeFlag` · `company_topup_flag` ← `companyTopupFlag` |
| **Lỗi** | Scope · unknown type · **DV-16** config **409** |

### 4.3 F-ATT-LEAVE-01 — POST preview ngày trừ (**RETAIN cite · peer ATT-08**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests/preview-deduction`** |
| **Paper alias** | F-ATT-LEAVE-01 |
| **Mục đích** | NV xem trước số ngày công/phép bị trừ trước khi gửi đơn ốm — đồng bộ holiday engine. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-08 seal — engine `total_days` / `deductible_units` · **≠** substitute for day-branch allocator (§4.9) · preview **does not** write §6.2 rows. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — peer input trước Diễn biến **#1** · **AC-ATT-07-MK-ATT08** |
| **Request → DB** | Read-only calendar/holiday · no §6.2 write |
| **Lỗi** | Peer ATT-08 family (`HRM-LEAVE-*`) |

### 4.4 F-ATT-LEAVE-02 — POST nộp đơn nghỉ ốm (**RETAIN** · GAP allocator hook)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests`** |
| **Paper alias** | F-ATT-LEAVE-02 · peer F-ATT-LEAVE-03 approve/reject |
| **Mục đích** | NV nộp đơn **ốm** — validate catalog · chứng từ · overlap · giữ chỗ quỹ tracked (nếu có) · (GAP) khởi tạo phân nhánh ngày khi engine LIVE. |
| **Nghiệp vụ xử lý (AS-IS RETAIN)** | (1) `leave_type` ∈ **F-ATT-CAT-LVT-EFF** else **`HRM-LEAVE-TYPE-UNKNOWN`** · (2) **`resolveIsSickLeaveType`** — sick path · (3) **`assertSickAttachmentIfRequired`** — ốm ≥ **3** ngày thiếu attach → **`HRM-LEAVE-VAL-ATT`** (**≠** UNKNOWN) · (4) overlap assert · (5) when tracked `leave_type` row exists (e.g. `annual` if order consumes annual first): **`lockPendingLeaveBalance`** → **`pending_days +=`** — paper `held`/`att_leave_hold` = **alias only** · sick thường **no** sick balance row → skip balance gate · **cấm** invent `att_leave_hold` table · **cấm** merge sick into `annual` panel key. **GAP extension (same endpoint — F-ATT-SICK-DAY-BRANCH §4.9):** after successful insert + when §6.1 active policy exists: run allocator for each calendar day in span → insert **`att_sick_leave_day_branch`** rows (`ledger_status=allocated`) · enforce **one branch per day** · optional `pending_days` on **`annual`** row only when `branch_code=annual` · **≠** invent sick balance bucket on panel · **FAIL** QC if header-only `insurance_branch` without per-day rows when multi-day mixed branches required. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — Diễn biến **#1** «Nộp đơn ốm · Đủ chứng từ nếu bắt buộc · Hold theo nhánh» · Luồng chính **1** · **BR-LEAVE-ATT-01** · **AC-ATT-07-VAL-ATT** · **AC-ATT-07-SUBMIT-HOLD** · **J-HRM-ATT-07-02/03/04** |
| **Request → DB (RETAIN)** | `leave_requests` (`leave_type`, `attachment_url`, dates, `total_days`, …) · `employee_leave_balances.pending_days` on tracked type if applicable |
| **Request → DB (GAP)** | `att_sick_leave_day_branch` §6.2 — one row per `calendar_date` in leave span |
| **Response (target when GAP LIVE)** | `{ id, status: 'pending', …, dayBranches?: [{ calendarDate, branchCode, deductUnits, sheetDayCode? }] }` |
| **Lỗi** | `HRM-LEAVE-TYPE-UNKNOWN` · `HRM-LEAVE-VAL-ATT` · insufficient balance (tracked) · overlap · scope **409** · **DV-16** duplicate branch same day **409** `HRM-ATT-SICK-DV16-DAY` when allocator LIVE |

### 4.5 F-ATT-LEAVE-BAL-PANEL — GET panel khi nộp đơn (**RETAIN · peer ATT-05b**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance/panel`** |
| **Paper alias** | F-ATT-LEAVE-BAL panel · **ATT05BQC1** |
| **Mục đích** | Hiển thị quỹ khi mở form nghỉ phép — MVP **5 buckets** (`annual` · `seniority` · `compensatory` · `carry_over` · `advance`) — **không** invent «quỹ ốm BH» trên panel. |
| **Nghiệp vụ xử lý** | Assemble MVP keys only · `available_days = entitled − used − pending` per row · **`compensatory`** và **`carry_over`** **tách** khỏi `annual` (**must_keep ATT06QC1** · **ATT05QC1**) · **cấm** fold sick leave into `annual` display · sick BH/CTY branches live in §6.2 when engine LIVE, not panel bucket. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — peer «Còn phép năm» optional in fund order · **AC-ATT-07-PANEL-NO-SICK** · **AC-ATT-07-≠-MERGE-SICK-ANNUAL** · **J-HRM-ATT-07-06** |
| **Request → DB** | `employee_leave_balances` for MVP types only |
| **Lỗi** | Scope · safe empty buckets |

### 4.6 F-ATT-LEAVE-03 — approve/reject sick leave (**RETAIN cite · GAP reconcile branch**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests/:id/approve`** · **`…/reject`** · **`…/cancel`** |
| **Paper alias** | F-ATT-LEAVE-03 |
| **Mục đích** | QL duyệt/từ chối đơn ốm — chuyển hold → used hoặc hoàn **100%** `pending_days` (peer ATT-09). |
| **Nghiệp vụ xử lý** | **RETAIN:** `settleApprovedLeaveBalance` / `releasePendingLeaveBalance` on tracked row · **GAP:** on approve, if §6.2 rows were draft/deferred at submit, **finalize** `ledger_status=allocated` or run allocator idempotently · on reject/cancel: void §6.2 rows (`ledger_status=void`) · release pending · **≠** trigger allocator from sheet close only. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — hậu điều kiện hold nhánh · peer **BR-BP-LV-06** · **AC-ATT-07-SUBMIT-HOLD** |
| **Request → DB** | `leave_requests.status` · `pending_days` / `used_days` · §6.2 `ledger_status` |
| **Lỗi** | Peer ATT-09 · invalid transition |

### 4.7 F-ATT-SICK-POLICY-ORDER — GET/PUT thứ tự trừ quỹ ốm tenant (**GAP · NOT LIVE**)

| | |
|--|--|
| **METHOD / path** | **TARGET (post-migrate):** **`GET /api/hrm/attendance/sick-leave-fund-order`** · **`PUT /api/hrm/attendance/sick-leave-fund-order`** — **ABSENT** controller 2026-08-10 |
| **Paper alias** | **F-ATT-SICK-POLICY-ORDER** · physical name locked at migration PR |
| **Mục đích** | HCNS xem/cấu hình **thứ tự trừ quỹ** khi xử lý nghỉ ốm theo tenant — chuỗi có thể gồm `annual` · `insurance` · `company` · `unpaid` (SRS «cấu hình được» · không khóa cứng). |
| **Nghiệp vụ xử lý** | Scope: `company_id` slug same resolver as `att_leave_type` list (**U19**) · **GET:** return active row per company (partial UQ DATA §6.1) or program default `{ fundSequence: ['insurance','company','unpaid'], annualFirstEnabled: false, … }` when no row — **must label default** in QA until PUT persists · **PUT:** upsert active `att_sick_leave_fund_order` · validate `fundSequence`: each token ∈ `{annual,insurance,company,unpaid}` · length ≥ 1 · **no duplicate** elements → else **409** `HRM-ATT-SICK-FUND-ORDER-INVALID` · when `insuranceDayCap` set then `overInsuranceAction` required ∈ `{company_topup,unpaid}` · `annualFirstEnabled` mirrors SRS «còn phép năm — trừ phép trước» when `annual` appears first in sequence (**O10**) · soft-retire via `status`/`archived_at` · **cấm** hardcode order only in FE without persisted row when HCNS AC requires CRUD · **FAIL** claim LIVE without migration + route + jest. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — Đầu vào «Thứ tự trừ quỹ · CRUD tenant» · Tiên quyết trước Diễn biến **#2** · Luồng chính **2** · đặc biệt «Còn phép năm» · **BR-BP-LV-04** · **AC-ATT-07-FUND-ORDER** · **AC-ATT-07-ANNUAL-FIRST** · **J-HRM-ATT-07-05** (HOLD until LIVE) |
| **Request → DB (PUT body ↔ §6.1)** | `fundSequence` ← `fund_sequence` TEXT[]/JSONB · `annualFirstEnabled` ← `annual_first_enabled` · `insuranceDayCap` ← `insurance_day_cap` · `overInsuranceAction` ← `over_insurance_action` (`company_topup` \| `unpaid`) · `effectiveFrom` ← `effective_from` · `status` |
| **Response (display-ready)** | `{ companyId, fundSequence: string[], annualFirstEnabled, insuranceDayCap?, overInsuranceAction?, status, effectiveFrom?, updatedAt, policyId? }` |
| **Lỗi** | `HRM-SCOPE-409` · `HRM-ATT-SICK-FUND-ORDER-INVALID` (dup token · unknown token · cap without action) · duplicate active policy per company **409** |

### 4.8 F-ATT-SICK-DAY-BRANCH — phân nhánh từng ngày (**GAP · NOT LIVE writer**)

| | |
|--|--|
| **METHOD / path** | **No standalone public route GĐ1** — normative hook inside **`POST …/leave-requests`** (§4.4) and/or **`POST …/leave-requests/:id/approve`** (§4.6) · optional future read: `GET …/leave-requests/:id/sick-day-branches` (*not required this wave*) |
| **Paper alias** | **F-ATT-SICK-DAY-BRANCH** |
| **Mục đích** | Thực thi **BR-BP-LV-04**: mỗi **ngày calendar** trong đơn ốm gắn **đúng một nhánh** (`annual` \| `insurance` \| `company_topup` \| `unpaid`) theo thứ tự §6.1 và cờ loại phép — cấm BH + CTY 100% cùng ngày không rule (**DV-16**). |
| **Nghiệp vụ xử lý** | Preconditions: (P1) sick leave request after VAL-ATT pass · (P2) active §6.1 policy row (or documented default with QA HOLD label) · (P3) leave type flags from catalog (`insurance_regime_flag` · `company_topup_flag`) · (P4) expand leave span to calendar days (respect ATT-08 unit/holiday alignment for day count) · (P5) **≠** invoked from **F-ATT-SHEET-02** close alone (**AC-ATT-07-≠-CLOSE-TRIGGER**). **Allocator algorithm (normative GĐ1):** For each `calendar_date` in order: walk `fundSequence` from §6.1 · consume capacity per branch — e.g. `insurance` days up to `insuranceDayCap` then **`overInsuranceAction`** → `company_topup` or `unpaid` (**AC-ATT-07-OVER-BH**) · when `annual` in sequence and `annualFirstEnabled`/position first, deduct from **`annual`** balance via `pending_days` on **annual** row only (**AC-ATT-07-ANNUAL-FIRST**) · emit exactly **one** `branch_code` per date · insert/update **`att_sick_leave_day_branch`** with `deduct_units` per **Q-LEAVE-UNIT** on type · set optional `sheet_day_code` for **R-ATT-07-SHEET-CODE** (HOLD writer to attendance meta) · snapshot `allocator_version` = policy id/hash · **UQ** `(leave_request_id, calendar_date) WHERE ledger_status='allocated'` — duplicate → **409** `HRM-ATT-SICK-DV16-DAY` · **cấm** two active rows same date with both `insurance` and `company_topup` at full units. **Balance interaction:** `branch_code=annual` may drive `pending_days` on annual row; **BH/CTY/unpaid branches do not** create sick bucket on panel (**AC-ATT-07-PANEL-NO-SICK**). **Reject/cancel:** void all allocated rows for request. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — Diễn biến **#2** «Áp thứ tự quỹ · Cấu hình tenant · Công/lương đúng nhánh» · Luồng chính **2–3** · đặc biệt «Vượt ngày BH» · **BR-BP-LV-04** · **DV-16** · **AC-ATT-07-DAY-BRANCH** · **AC-ATT-07-OVER-BH** · **AC-ATT-07-SHEET-CODE** (footer) · **J-HRM-ATT-07-05** |
| **Request → DB (§6.2)** | `company_id` · `leave_request_id` · `employee_id` · `calendar_date` · `branch_code` (`annual`\|`insurance`\|`company_topup`\|`unpaid`) · `deduct_units` · `sheet_day_code?` · `allocator_version?` · `ledger_status` · `void_reason?` |
| **Response (embedded in §4.4/§4.6 when LIVE)** | `dayBranches[]` as above |
| **Lỗi** | Missing policy when strict mode **409** `HRM-ATT-SICK-POLICY-MISSING` · **DV-16** **409** · void on reject — not error |

### 4.9 F-ATT-SICK-SHEET-CODE — mã ngày công theo nhánh (**HOLD · writer**)

| | |
|--|--|
| **METHOD / path** | **No new public route GĐ1** — write via §6.2 `sheet_day_code` + peer sync to `attendance_records` / line meta when engine LIVE |
| **Paper alias** | F-ATT-SICK-SHEET-CODE |
| **Mục đích** | Luồng chính **4** — bảng công nhận **đúng mã ngày** theo nhánh đã phân bổ. |
| **Nghiệp vụ xử lý** | **HOLD** until allocator LIVE · map `branch_code` → day status/label on records · coordinate **R-ATT-07-AGG** ATT-10 paid/unpaid funnel — non-blocking this API stamp. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — Luồng chính **4** · **AC-ATT-07-SHEET-CODE** |
| **Request → DB** | `att_sick_leave_day_branch.sheet_day_code` · optional extend `attendance_records` meta |

### 4.10 F-ATT-SHEET-01 — Aggregate bảng công (**RETAIN context · R-ATT-07-AGG footer**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/attendance-sheets/:id/aggregate`** (cite ATT-10) |
| **Paper alias** | F-ATT-SHEET-01 |
| **Mục đích** | Phễu paid/unpaid leave hours — today sick → **paid** unless `unpaid` key; when §6.2 LIVE funnel should reflect **branch_code** per day. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-10 · **HOLD footer** **R-ATT-07-AGG** until allocator writes branch-aware codes. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — hậu điều kiện công/lương khớp · **AC-ATT-07-AGG-FOOTER** |
| **Lỗi** | Peer ATT-10 |

### 4.11 F-ATT-SHEET-02 — Close bảng công (**RETAIN context · DENY branch trigger**)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/attendance-sheets/:id/close`** (cite ATT-11) |
| **Paper alias** | F-ATT-SHEET-02 |
| **Mục đích** | Chốt bảng công trước PAY — **không** là trigger phân nhánh ốm. |
| **Nghiệp vụ xử lý** | **RETAIN cite** ATT-11 · **cấm** implement §4.8 allocator chỉ trên close · **FAIL** QC if close alone allocates sick branches. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-07** — **AC-ATT-07-≠-CLOSE-TRIGGER** · **O13** |
| **Lỗi** | Peer ATT-11 |

### 4.12 DENY list (process + API)

| Deny | Rationale |
|------|-----------|
| Physical `att_leave_hold` CRUD | **ATT09QC1** — `pending_days` only |
| Nest `/core` sick policy/branch SoT | Path lock · **AC-ATT-07-PATH** |
| Merge `compensatory` / `carry_over` / sick into `annual` | **ATT06QC1** · **ATT05QC1** · **AC-ATT-07-≠-MERGE-SICK-ANNUAL** |
| Sick panel bucket on MVP panel | **AC-ATT-07-PANEL-NO-SICK** |
| VAL-ATT / picker alone = FR-07 DONE | **AC-ATT-07-≠-VAL-DONE** |
| Branch allocator **only** on sheet close | SRS Diễn biến **#2** submit/approve path |
| Reopen **J-HRM-ATT-06-*** without regression bus | **ATT06QC1** · **AC-ATT-07-≠-REOPEN-J06** |
| Wipe ATT-04/05b/09 peer paths | **must_keep** seals |
| Invent CORE-10 DONE in slice | **R-ATT-07-CORE10** PAY OUT |

---

## 5. GAP / HOLD / RETAIN matrix (dev unlock)

| ID | API surface | Disposition | Owner | Entry |
|----|-------------|-------------|-------|-------|
| **R-ATT-07-FE-PICKER** | §4.1 flags on LeaveTab | **GAP FE partial** (EFF may LIVE) | **dev-fe FE-01** | **J-HRM-ATT-07-01** |
| **R-ATT-07-POLICY-ORDER** | §4.7 | **GAP NOT LIVE** | **dev-be BE-01** | Migrate §6.1 + GET/PUT |
| **R-ATT-07-DAY-BRANCH** | §4.4/§4.8 | **GAP NOT LIVE** | **dev-be BE-01** | Allocator + §6.2 |
| **R-ATT-07-OVER-BH/ANNUAL-FIRST** | §4.7–4.8 | **GAP logic** | **dev-be** + **qa** | **J-HRM-ATT-07-05** |
| **R-ATT-07-SHEET-CODE** | §4.9 | **HOLD writer** | **dev-be** when engine LIVE | Footer |
| **R-ATT-07-AGG** | §4.10 | **HOLD footer** | **dev-be** when engine LIVE | ATT-10 |
| **R-ATT-07-CORE10** | CORE peer read | **HOLD** PAY OUT | — | **AC-ATT-07-CORE10-HOLD** |
| **RETAIN spine** | §4.1–4.6 | **PRESENT** | **qa** regression | VAL · submit · panel · **J-HRM-ATT-06-04** |

**Default execution lane:** **dev-be BE-01** after this API stamp + program migrate waiver for §6.1+§6.2 · **dev-fe FE-01** parallel for picker/attach · **qa** U65 **J-HRM-ATT-07-01..06** + **J-HRM-ATT-06-04** when balance paths touched.

---

## 6. Scope parity (U19)

| Surface | Resolver | Parity rule |
|---------|----------|-------------|
| `GET …/leave-types/effective` | Company + EFF | List ⊆ submit assert for sick types |
| `GET/PUT …/sick-leave-fund-order` | Company slug | Same as leave-types admin scope |
| `POST …/leave-requests` | Employee + company | **FAIL** if EFF scope ≠ submit scope |
| `GET …/leave-requests/:id` | Same as list filter | Deep link **J-HRM-ATT-07-*** |
| Day branch rows | `leave_requests.company_id` | **FAIL** if allocator writes wrong tenant |
| Panel vs by-type | Same employee | **FAIL** if panel 2xx but annual by-type 404 under group CEO `main` |

---

## 7. Traceability (SRS → API → DB → Test)

| SRS Diễn biến | API | DB | Test hook |
|---------------|-----|-----|-----------|
| Đầu vào loại ốm | **F-ATT-CAT-LVT-EFF** §4.1 RETAIN | `att_leave_type` flags | **J-HRM-ATT-07-01** |
| **#1** Nộp + chứng từ + hold | **F-ATT-LEAVE-02** §4.4 RETAIN (+ §4.8 GAP) | `leave_requests` · `pending_days` · §6.2 | **J-HRM-ATT-07-02/03/04** |
| Tiên quyết thứ tự quỹ | **F-ATT-SICK-POLICY-ORDER** §4.7 GAP | §6.1 | **J-HRM-ATT-07-05** HOLD |
| **#2** Áp thứ tự / nhánh ngày | **F-ATT-SICK-DAY-BRANCH** §4.8 GAP | §6.2 | **J-HRM-ATT-07-05** HOLD |
| Luồng **4** mã ngày | §4.9 HOLD | `sheet_day_code` | Footer |
| Peer compensatory | **F-ATT-LEAVE-BAL** §4.5 RETAIN | `compensatory` row | **J-HRM-ATT-06-04** |
| **BR-BP-LV-04** | §4.7 + §4.8 | §6.1 + §6.2 | **AC-ATT-07-DAY-BRANCH** |

---

## 8. completion_report

| | |
|--|--|
| **Closed** | F.1 **CONFIRMED RETAIN + GAP MAP** for UC-BP-ATT-07: deepened **F-ATT-SICK-POLICY-ORDER** (`GET/PUT …/sick-leave-fund-order` → DATA **§6.1**) · **F-ATT-SICK-DAY-BRANCH** (submit/approve hook → DATA **§6.2** · SRS Diễn biến **#2**) · **RETAIN cite** **F-ATT-CAT-LVT/EFF** + admin flags · **F-ATT-LEAVE-02** + VAL-ATT + `pending_days` · **F-ATT-LEAVE-01** preview · **F-ATT-LEAVE-BAL** panel (no sick bucket) · **F-ATT-LEAVE-03** peer · context **F-ATT-SHEET-01/02** (close **≠** allocator) · invariants DENY `att_leave_hold` · Nest `/core` · merge buckets · reopen **J-HRM-ATT-06-*** · must_keep **`ATT06QC1`** + full peer QC chain · docs-only · **≠ ATT-07 / ATT UAT DONE** |
| **Residual (open)** | **dev-be BE-01** migration §6.1/§6.2 + routes + allocator · **dev-fe FE-01** picker/attach · **qa** J-HRM-ATT-07-* U65 + **J-HRM-ATT-06-04** · **qc** GWC C-SLICE · **R-ATT-07-AGG/SHEET-CODE/CORE10** footers |
| **next_owner** | **dev-be** (BE-01 primary) · **pm** orchestration |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md` |

### 8.1 next_dispatch_prompt (copy-ready — dev-be BE-01)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01
role: dev-be
program: PO_HRM_MVP_GD1_CONTINUOUS (U89 Wave-35 seat #40)
lane: execution · UC-BP-ATT-07 · sa API-01 PASS_TO_PM stamped · DATA-01 §6.1/§6.2 closable
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md (F.1 §4.7 F-ATT-SICK-POLICY-ORDER · §4.8 F-ATT-SICK-DAY-BRANCH · RETAIN §4.1–4.6)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-DATA-01.md §6.1 att_sick_leave_fund_order · §6.2 att_sick_leave_day_branch
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-BA-01.md (AC-ATT-07-* · J-HRM-ATT-07-* · J-HRM-ATT-06-04 regression)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-07 Diễn biến #1–#2 · BR-BP-LV-04 · DV-16
  - apps/api/hrm-api/src/attendance/leave-requests.service.ts (resolveIsSickLeaveType · assertSickAttachmentIfRequired · lockPendingLeaveBalance — RETAIN must_keep)
  - apps/api/hrm-api/src/attendance/att-leave-type.service.ts (flags EFF/admin)
entry_criteria: sa API-01 stamped PASS_TO_PM · program migrate waiver for DATA §6.1+§6.2 · must_keep ATT09QC1 pending_days · ATT06QC1 compensatory separate · DENY reopen J-HRM-ATT-06-*
exit_criteria:
  - Prisma/SQL migration: att_sick_leave_fund_order + att_sick_leave_day_branch per DATA-01 §6
  - Controller: GET/PUT /api/hrm/attendance/sick-leave-fund-order per API-01 §4.7
  - Sick submit/approve path: allocator writes §6.2 one branch per calendar day per API-01 §4.8 (≠ sheet close only)
  - RETAIN HRM-LEAVE-VAL-ATT · pending_days hold · DENY att_leave_hold · DENY merge compensatory/sick/carry→annual
  - jest: fund order dup token · DV-16 duplicate day · over-BH cap · annual-first order · scope parity policy vs leave-types
  - spec_read_ack filled · @CODE-MEMORY APPEND · ack_status READY_FOR_QA
cấm: seed UAT evidence · invent att_leave_hold · allocator trigger only on sheet close · honesty flip · wipe peer seals · reopen J-HRM-ATT-06-* without regression · Nest /core SoT
```

### 8.2 next_dispatch_prompt (copy-ready — pm orchestration hint)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-07-CLUSTER-PM-01
role: pm
lane: governance
entry_criteria: API-01 PASS_TO_PM @ docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md · must_keep ATT06QC1 through ATT-11 seals
exit_criteria:
  - Dispatch dev-be BE-01 PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01 (primary) · dev-fe FE-01 HOLD parallel for R-ATT-07-FE-PICKER
  - Update PO_HRM_MVP_GD1_CONTINUOUS.md seat #40 API stamped
  - No attendance_uat_ready flip · C-SLICE honesty · DENY reopen J-HRM-ATT-06-*
cấm: claim ATT-07 or ATT module UAT DONE from API pack alone · honesty flip
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-07 / FR-07 DONE** · **≠ ATT-06 DONE** (`ATT06QC1-MSM84GWC1`) · **≠ ATT-05b/05/04/04b DONE** · **≠ ATT UAT** · must_keep **ATT09QC1** · **DENY** merge buckets · **DENY** VAL-ATT/picker alone DONE · **DENY reopen J-HRM-ATT-06-*** · no seed · no apps/**
