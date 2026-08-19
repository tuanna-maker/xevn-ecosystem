# PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01 — API F.1 · Ứng phép RETAIN + GAP cap/advanced/branch · HOLD offset engine (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — Wave-33 seat **#36**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-CAT-LVT** (`allows_advance`) · **F-ATT-LEAVE-BAL panel** (`advance`/`unpaid`) · **F-ATT-LEAVE-02/03** reject gate · **GAP wire** **F-ATT-LVRULE cap** · **F-ATT-LEAVE-BAL advanced** · **F-ATT-LEAVE-02/03** over-balance branch · **HOLD** **F-ATT-LEAVE-04** offset · physical **`/api/hrm/attendance/*`** · paper `/att/*` + `/core/*` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** invent `att_leave_hold` · **must_keep** ATT-04 spine (**`ATT04QC1-MSM22G4W`**) · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED RETAIN + GAP MAP** — LIVE RETAIN paths **PRESENT** · closable BE **REQUIRED** for DATA-01 §4.1–4.2 ADD + formula/branch wire · unlock **dev-be BE-01** (migration) + **dev-fe FE-01** (branch/cap UX) · **≠ ATT-04b / FR-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** · **C-SLICE** |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · **BR-BP-LV-07** |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · peer ATT-04 API [`PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md) · DATA-04B [`PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md) · ATT-09 **`ATT09QC1-MSLUTL9D`** · ATT-04 QC **`ATT04QC1-MSM22G4W`** · ATT-03d **`ATT03DQC1-MSM1CR19`** · **R-ATT-04-FY** · **R-ATT-04-ENGINE HOLD** · **R-ATT-01-ASSIGN open** |
| **ref_data** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md` §4 ADD stamp · §5 RETAIN prove |
| **ref_ba** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md` — AC-ATT-04B-* · **J-HRM-ATT-04B-01..06** DRAFT |
| **ref_sa** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-SA-01.md` §5 F.1 outline |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04b** · Diễn biến **#1 · #2** · **BR-BP-LV-07** |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` — `allows_advance` · balance `advanced` (paper) · **F-ATT-LEAVE-02/03** · panel · **F-ATT-LVRULE** cap · **F-ATT-LEAVE-04 HOLD** · **F-PAY-ADV-BRIDGE-01 OUT** |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 · §4.4b — paper `held` → **`pending_days`** · **DENY** physical `att_leave_hold` |
| **ref_code_cite** | `att-leave-type.service.ts` (`allows_advance`) · `leave-balance.service.ts` (panel `advance` · `available` omit `advanced`) · `leave-requests.service.ts` (`assertSufficientLeaveBalance` → **`HRM_LEAVE_VAL_BALANCE`**) · `att-leave-accrual-policy.service.ts` (`allow_negative` · **no** cap cols LIVE) · `attendance.controller.ts` routes — **read-only 2026-08-10** |
| **Honesty** | **`attendance_uat_ready=false`** · **`contracts_printable_ready=false` RETAIN** · **C-SLICE** · **DENY** claim `allows_advance` + panel = FR-04b DONE · **DENY** ATT-04b / ATT-04 / ATT UAT DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN + GAP MAP** |
| **unlock_lane** | **dev-be BE-01** (migration ADD + wire) · **dev-fe FE-01** (over-balance + cap admin) · **qa** after READY_FOR_QA |

---

## 1. Verdict — RETAIN LIVE + documented GAP (BE unlock for ADD)

| Decision | Stamp |
|----------|--------|
| Catalog `allows_advance` | **RETAIN** — **PATCH/POST …/leave-types*** field `allowsAdvance` → `att_leave_type.allows_advance` (**F-ATT-CAT-LVT** · peer ATT-04 §4.2) · **≠** FR-04b DONE alone |
| Panel `advance` / `unpaid` | **RETAIN** — **`GET …/leave-balance/panel`** MVP bucket `advance` + label map `unpaid` (**F-ATT-LEAVE-BAL panel**) |
| Balance reject (ứng OFF / over available) | **RETAIN** — **`POST …/leave-requests`** → `assertSufficientLeaveBalance` · **400** **`HRM_LEAVE_VAL_BALANCE`** when `total_days > available` |
| Hold on submit | **RETAIN must_keep ATT-09** — `lockPendingLeaveBalance` → **`pending_days`** · paper `held` / `att_leave_hold` = **alias only** · **DENY** second table |
| Policy `allow_negative` | **RETAIN cite** — LVRULE CRUD · works with advance semantics · **≠** advance cap SoT |
| Available formula AS-IS | **RETAIN** until migrate — `entitled − used − pending` (**no** `advanced_days`) |
| `advanced_days` wire | **GAP → dev-be** after DATA §4.1 migrate — update GET balance + panel + `assertSufficientLeaveBalance` |
| Advance cap CRUD | **GAP → dev-be** after DATA §4.2 — `advance_max_days` · `advance_cap_percent` on **leave-accrual-policies*** DTO |
| Over-balance branch (ứng ON) | **GAP** — Diễn biến **#1** «đề xuất ứng / không lương» — **dev-fe** UX + **dev-be** submit branch (after cap wire) |
| Offset on grant | **HOLD** — **F-ATT-LEAVE-04** · **R-ATT-04-ENGINE** · **no** LIVE route |
| PAY advance bridge | **OUT** — **F-PAY-ADV-BRIDGE-01** · **DENY** LIVE in ATT slice |
| ATT-04 spine | **must_keep** LVT/LVRULE/grant/panel — **DENY wipe** in 04b waves |
| Nest `/core` | **DENY** dual SoT |

```text
  ATT-04 SEALED (ATT04QC1) — LVT/LVRULE/grant RETAIN · ≠ ATT-04 DONE
  ATT-09 pending_days (ATT09QC1) · ATT-03d GPS · honesty false · PAY OUT
       │
       ▼
  FR-UC-BP-ATT-04b (RETAIN cite + GAP wire)
       │
       ├─ RETAIN LIVE
       │    F-ATT-CAT-LVT allows_advance
       │    F-ATT-LEAVE-BAL panel advance/unpaid
       │    F-ATT-LEAVE-02/03 assert → HRM_LEAVE_VAL_BALANCE
       │    pending_days hold (peer ATT-09)
       │
       ├─ GAP (unlock dev-be after migrate + dev-fe)
       │    advanced_days in available + DTO
       │    advance_max_days / advance_cap_percent on policy
       │    over-balance propose branch (ứng ON)
       │
       └─ HOLD / OUT
            F-ATT-LEAVE-04 offset grant (ENGINE)
            F-PAY-ADV-BRIDGE (PAY OUT)
            att_leave_hold table (DENY)
```

**Invariant ATT-04B-PATH:** Network **MUST** hit physical `/api/hrm/attendance/*` — Nest `/api/hrm/core/**` as leave SoT = **FAIL**.

**Invariant ATT-04B-HOLD-DUAL:** Invent physical `att_leave_hold` = **FAIL** (**ATT09QC1-MSLUTL9D**).

**Invariant ATT-04B-≠-FLAG-DONE:** `allows_advance` + panel `advance` alone = FR-04b DONE = **FAIL**.

**Invariant ATT-04B-≠-REJECT-ONLY:** Hard reject-only = full Diễn biến **#1** DONE = **FAIL** until over-balance branch wired.

**Invariant ATT-04B-MK-ATT04:** Wipe/demote ATT-04 leave-types/policies/grant in 04b wave = **FAIL**.

**Invariant ATT-04B-OFFSET:** Claim **F-ATT-LEAVE-04** offset-on-grant LIVE = slice DONE = **FAIL**.

**Invariant ATT-04B-U19:** Same `resolveHrmListScope` / employee scope family for LVT · LVRULE · balance · leave-requests as peer ATT-04 API-01.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `contracts_printable_ready=false` · **C-SLICE**  
> **≠ ATT-04b / FR-04b DONE** · **≠ ATT-04 DONE** (`ATT04QC1-MSM22G4W`) · **≠ ATT UAT** · printable false · PAY OUT · must_keep ATT-04 LVT/LVRULE/grant · ATT-09 `pending_days` · ATT-03d · **DENY** `att_leave_hold` · **HOLD** offset ENGINE · **GAP** advanced/cap/branch until BE+FE wire · no seed · no apps/** this seat

---

## 2. Path & alias lock

| Plane | Path |
|-------|------|
| **Controller** | Nest `@Controller('attendance')` → **`/api/hrm/attendance`** |
| **04b RETAIN** | `…/leave-types*` · `…/leave-balance` · `…/leave-balance/panel` · `…/leave-requests` |
| **04b GAP (post-migrate)** | `…/leave-accrual-policies*` (cap fields on existing CRUD) · balance DTO `advanced_days` |
| **Peer RETAIN (must_keep)** | `…/leave-accrual-policies*` (base LVRULE) · `…/leave-balance/tracked-entitlement` — cite ATT-04 API-01 · **DENY wipe** |
| **LOGICAL (paper)** | `/api/hrm/att/…` · `/api/hrm/core/…` — **alias only** |
| **HOLD** | `POST …/leave-balances/accrue` (**F-ATT-LEAVE-04**) |
| **OUT** | PAY module advance bridge |

| Paper / logical | Physical | DB (DATA-04B) |
|-----------------|----------|---------------|
| `allows_advance` | `…/leave-types*` DTO `allowsAdvance` | `att_leave_type.allows_advance` **RETAIN** |
| Panel `advance` / `unpaid` | `GET …/leave-balance/panel` | ledger + labels **RETAIN** |
| Paper `held` / `att_leave_hold` | submit hold | **`pending_days`** **RETAIN** · **DENY** table |
| Paper `advanced` | `GET …/leave-balance` (+ panel) | **`advanced_days` ADD** §4.1 **GAP** |
| Trần ứng | `POST/PATCH …/leave-accrual-policies` | **`advance_max_days` · `advance_cap_percent` ADD** §4.2 **GAP** |
| Submit balance gate | `POST …/leave-requests` | assert + pending lock **RETAIN** + branch **GAP** |
| F-ATT-LEAVE-04 offset | — | **HOLD** ENGINE |
| F-PAY-ADV-BRIDGE | — | **OUT** |

---

## 3. AS-IS LIVE prove (read-only cite)

| Surface | LIVE prove | API-04B verdict |
|---------|------------|-----------------|
| `allows_advance` on types | `att-leave-type.service.ts` `ensureSchema` + PATCH/POST | **RETAIN** **AC-ATT-04B-CAT-ADV** |
| Panel bucket `advance` | `leave-balance.service.ts` `MVP_PANEL_KEYS` incl. `'advance'` · labels `unpaid` | **RETAIN** **AC-ATT-04B-PANEL** |
| `GET leave-balance/panel` | `attendance.controller.ts` `@Get('leave-balance/panel')` | **RETAIN** |
| `available_days` derive | `leave-balance.service.ts` `entitled - used - pending` | **RETAIN** AS-IS · **GAP** post-`advanced_days` |
| `assertSufficientLeaveBalance` | `leave-requests.service.ts` same formula · **400** `HRM_LEAVE_VAL_BALANCE` | **RETAIN** **AC-ATT-04B-GATE-REJECT** |
| `lockPendingLeaveBalance` | `leave-requests.service.ts` → `pending_days` | **RETAIN** **AC-ATT-04B-MK-ATT09** |
| Over-balance branch | no propose advance/unpaid on submit | **GAP** **R-ATT-04B-OVER-BAL** |
| `advanced_days` column | absent on `employee_leave_balances` CREATE | **GAP** **R-ATT-04B-ADVANCED-WIRE** |
| Cap cols on policy | absent on `att_leave_accrual_policy` CREATE | **GAP** **R-ATT-04B-CAP-CRUD** |
| `allow_negative` on policy | `att-leave-accrual-policy.service.ts` LIVE | **RETAIN cite** |
| `att_leave_hold` table | grep CREATE **0** | **DENY invent** |
| F-ATT-LEAVE-04 accrue route | **ABSENT** | **HOLD** |
| Nest `@Controller('core')` leave | **ABSENT** | **DENY** |

---

## 4. F.1 — endpoints (normative)

> Peer ATT-04 API-01 §4.1–4.11 remain **must_keep** for LVT/LVRULE/grant base. This section **deepens 04b deltas** and **re-cites** surfaces 04b touches.

### 4.1 F-ATT-CAT-LVT — `allows_advance` on loại phép (**RETAIN** · 04b focus)

| | |
|--|--|
| **METHOD / path** | **`GET/POST/PATCH/PUT …/leave-types*`** · **`GET …/leave-types/effective`** (peer ATT-04 API-01 §4.1–4.3) |
| **Paper alias** | F-ATT-CAT-LVT · `/att/leave-types*` — **alias only** |
| **Mục đích** | Tiên quyết FR-04b: HCNS bật/tắt **Cho phép ứng phép** trên loại tracked; consumer EFF picker thấy flag khi bind đơn. |
| **Nghiệp vụ xử lý** | Scope parity list=get=mutate · persist `allows_advance` BOOLEAN · `category` may include `advance` when business rules apply · soft-retire type unchanged from ATT-04 · **cấm** claim flag alone closes FR-04b · response includes **`allowsAdvance`** display-ready. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** — tiên quyết loại ứng · **BR-BP-LV-07** · Diễn biến **#1** (bối cảnh loại) |
| **Request → DB** | `att_leave_type.allows_advance` ← DTO `allowsAdvance` (**RETAIN**) |
| **Response** | `{ …, allowsAdvance, category, … }` |
| **Lỗi** | `HRM-SCOPE-409` · `HRM-PLT-CAT-CODE-*` · validation 400 |

### 4.2 F-ATT-LEAVE-BAL-PANEL — bucket ứng / nhãn không lương (**RETAIN**)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance/panel`** (register **before** exact `leave-balance` — path order lock) |
| **Paper alias** | F-ATT-LEAVE-BAL panel · peer **FR-UC-BP-ATT-05b** |
| **Mục đích** | NV/HCNS đọc quỹ khi mở form đơn — hiển thị bucket **Ứng phép** (`advance`) và map nhãn **Không lương** (`unpaid`) read-only. |
| **Nghiệp vụ xử lý** | Aggregate MVP panel keys incl. **`advance`** · enrich labels from EFF/`name_vi` · derive per-row `available_days` AS-IS **`entitled − used − pending`** (**post-migrate:** subtract **`advanced_days`** per §4.6) · self/HR scope · wire **`HRM-LEAVE-BAL-PANEL-200`**. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** · peer panel cite · **AC-ATT-04B-PANEL** |
| **Request → DB** | Read `employee_leave_balances` + EFF join (**RETAIN**) |
| **Lỗi** | Scope only |

### 4.3 F-ATT-LEAVE-BAL-01 — GET số dư (**RETAIN** + **GAP** `advanced_days`)

| | |
|--|--|
| **METHOD / path** | **`GET /api/hrm/attendance/leave-balance`** |
| **Paper alias** | paper `/att/leave-balance` |
| **Mục đích** | Đọc số dư theo NV · loại · `balance_year` — consumer và admin đối chiếu trước/sau nộp đơn. |
| **Nghiệp vụ xử lý** | **RETAIN:** read ledger · `available_days = max(0, entitled − used − pending)` · expose `pending_days` as paper **held**. **GAP (post DATA §4.1):** read **`advanced_days`** · `available_days = max(0, entitled − used − pending − advanced_days)` · panel/submit **must** use same formula (**R-ATT-04B-ADVANCED-WIRE**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** · **AC-ATT-04B-ADVANCED-WIRE** (conditional) · peer FR-05b |
| **Request → DB** | `employee_leave_balances` — cols per DATA-04B §4.1 |
| **Response (target post-wire)** | `{ entitled_days, used_days, pending_days, advanced_days, available_days, … }` |
| **Lỗi** | Scope · safe empty |

### 4.4 F-ATT-LEAVE-02 — POST nộp đơn nghỉ (**RETAIN** gate + **GAP** branch)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-requests`** |
| **Paper alias** | F-ATT-LEAVE-02 · peer ATT-09 hold path |
| **Mục đích** | NV nộp đơn tracked — kiểm tra quỹ, khóa `pending_days` khi có ledger, spawn workflow khi cấu hình. |
| **Nghiệp vụ xử lý** | Validate dates/overlap · resolve EFF type · **RETAIN path A (ứng OFF / over available):** `assertSufficientLeaveBalance` — if balance tracked and `total_days > available` → **400** **`HRM_LEAVE_VAL_BALANCE`** with `{ available_days, requested_days, leave_type, balance_year, source }` · **no** silent success (**AC-ATT-04B-GATE-REJECT** · **BR-BP-LV-07-OFF**). **RETAIN:** on success call `lockPendingLeaveBalance` → increment **`pending_days`** (**ATT09QC1** · **≠** `att_leave_hold`). **GAP path B (ứng ON · trong trần — after cap wire):** when type `allows_advance=true` and effective policy cap allows, accept body branch e.g. `balance_resolution: 'advance' | 'unpaid'` (exact DTO **dev-be** stamps from this F.1) — update **`advanced_days`** or route unpaid type per **BR-BP-LV-07-UNPAID** · **FAIL** if reject-only claimed as Diễn biến **#1** DONE. **DENY** PAY ledger as SoT. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** · Diễn biến **#1** (nộp vượt số dư — reject + propose) · **BR-BP-LV-07** · peer **BR-BP-LV-06** hold |
| **Request → DB** | Insert `leave_requests` · UPDATE `employee_leave_balances.pending_days` (+ **`advanced_days`** when GAP wired) |
| **Lỗi** | **`HRM_LEAVE_VAL_BALANCE`** · **`HRM_LEAVE_VAL_OVERLAP`** · **`HRM-LEAVE-TYPE-UNKNOWN`** · scope **409** · cap exceed **400** (post-ADD — code TBD **`HRM_LEAVE_VAL_ADVANCE_CAP`** recommended) |

### 4.5 F-ATT-LEAVE-03 — Duyệt / từ chối / hủy đơn (**RETAIN cite** · peer ATT-09)

| | |
|--|--|
| **METHOD / path** | **`POST …/leave-requests/:requestId/approve`** · **`…/reject`** · **`…/cancel`** |
| **Paper alias** | F-ATT-LEAVE-03 |
| **Mục đích** | Workflow duyệt đơn — release/settle `pending_days` theo ATT-09; **04b does not replace** this spine. |
| **Nghiệp vụ xử lý** | **must_keep** ATT-09 semantics · **DENY** `att_leave_hold` parallel writer · advance/unpaid settlement on approve **HOLD** partial until **advanced_days** wire + ENGINE offset **HOLD**. |
| **Tham chiếu bước SRS** | Peer FR-ATT-09 · **AC-ATT-04B-MK-ATT09** footer |
| **Request → DB** | `leave_requests` status · `employee_leave_balances.pending_days` / `used_days` |
| **Lỗi** | Sealed ATT-09 family |

### 4.6 F-ATT-LVRULE-CAP — Trần ứng trên policy (**GAP** · extend LVRULE CRUD)

| | |
|--|--|
| **METHOD / path** | **`POST /api/hrm/attendance/leave-accrual-policies`** · **`PATCH …/leave-accrual-policies/{policyId}`** · list/get/effective **unchanged** base (peer ATT-04 API-01 §4.4–4.7) |
| **Paper alias** | F-ATT-LVRULE cap extension · **≠** `max_balance_days` substitute |
| **Mục đích** | HCNS CRUD **trần ứng** (% quỹ / số ngày tối đa) gắn policy version — SRS input table FR-04b. |
| **Nghiệp vụ xử lý** | **GAP:** after migrate DATA §4.2 — accept nullable **`advanceMaxDays`** · **`advanceCapPercent`** (0–100) on DTO · validate XOR: when advance feature enabled for policy, at least one cap field set · persist `advance_max_days` · `advance_cap_percent` · **RETAIN** existing `allow_negative` semantics · scope parity · **cấm** Settings MD sole cap · **cấm** hardcode % in FE as SoT. Submit path uses effective policy at `as_of` for cap check (**BR-BP-LV-07-CAP**). |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** · SRS input trần ứng · **AC-ATT-04B-CAP-HOLD** → LIVE when wired |
| **Request → DB** | `att_leave_accrual_policy.advance_max_days` · `advance_cap_percent` (**ADD**) |
| **Lỗi** | `HRM-VAL-400` range · type OOS · scope |

### 4.7 F-ATT-LEAVE-BAL-ADVANCED — Ghi/đọc cumulative ứng (**GAP**)

| | |
|--|--|
| **METHOD / path** | **No new route required** — extend **`GET …/leave-balance`** · **`GET …/panel`** · **`POST …/leave-requests`** writer on branch `advance` |
| **Paper alias** | DB paper column `advanced` → **`advanced_days`** |
| **Mục đích** | Phản ánh số ngày đã ứng trên ledger để tính **khả dụng** và đối soát HR. |
| **Nghiệp vụ xử lý** | **GAP:** migrate column · backfill `0` · on approved advance branch increment **`advanced_days`** (deterministic with submit/approve — **dev-be** spec test) · **FAIL** dual `att_leave_hold` · **FAIL** wire without migration stamp. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** · **R-ATT-04B-ADVANCED-WIRE** · footer on J-02/J-03 |
| **Request → DB** | `employee_leave_balances.advanced_days` |
| **Lỗi** | N/A until LIVE |

### 4.8 F-ATT-LEAVE-04 — Bù trừ khi cấp quỹ (**HOLD** — outline only)

| | |
|--|--|
| **METHOD / path** | Paper job `POST /api/hrm/att/leave-balances/accrue` — **NO LIVE Nest route** |
| **Paper alias** | F-ATT-LEAVE-04 |
| **Mục đích** | Diễn biến **#2** — khi cấp quỹ mới, bù trừ phần đã ứng / không lương theo policy. |
| **Nghiệp vụ xử lý** | **HOLD** with **R-ATT-04-ENGINE** · **DENY** claim offset LIVE = ATT-04b slice DONE · **DENY** run in U65 as 04b exit evidence. |
| **Tham chiếu bước SRS** | **FR-UC-BP-ATT-04b** · Diễn biến **#2** · **AC-ATT-04B-OFFSET-HOLD** |
| **Request → DB** | *(none LIVE)* — future: adjust `entitled_days` / `advanced_days` on grant job |
| **Lỗi** | N/A until engine wave |

### 4.9 F-PAY-ADV-BRIDGE-01 (**OUT**)

| | |
|--|--|
| **METHOD / path** | PAY module — **OUT** GĐ1 continuous ATT slice |
| **Mục đích** | Bridge ứng phép sang payroll — **not** ATT-04b exit criteria. |
| **Nghiệp vụ xử lý** | **DENY invent DONE** in ATT QC evidence (**AC-ATT-04B-PAY-OUT**). |
| **Tham chiếu bước SRS** | OUT of FR-04b GĐ1 slice |
| **Lỗi** | N/A |

### 4.10 Peer must_keep (cite only — **DENY mutate** in 04b wave)

| Surface | Cite |
|---------|------|
| **PUT tracked-entitlement** | ATT-04 API-01 §4.11 · ATT-09 seal — grant path **unchanged** by 04b except ENGINE **HOLD** offset |
| **leave-accrual-policies** base CRUD | ATT-04 API-01 §4.4–4.8 — **extend only** §4.6 cap cols |
| **leave-types** base | ATT-04 API-01 §4.1–4.3 — **extend only** `allows_advance` semantics for 04b AC |

---

## 5. Residual wire & owners

| Residual ID | Layer | Disposition | Owner | Unlock |
|-------------|-------|-------------|-------|--------|
| **R-ATT-04B-GATE-REJECT** | BE | **RETAIN** — no change unless formula update | — | **Live** |
| **R-ATT-04B-PANEL** | BE+FE | **RETAIN** labels · post-wire formula | **dev-be** + **dev-fe** | Panel consistency after §4.1 |
| **R-ATT-04B-ADVANCED-WIRE** | BE | Migration §4.1 + DTO + assert/panel | **dev-be BE-01** | **REQUIRED** |
| **R-ATT-04B-CAP-CRUD** | BE+FE | Migration §4.2 + policy DTO + admin UI | **dev-be BE-01** + **dev-fe FE-01** | **REQUIRED** |
| **R-ATT-04B-OVER-BAL** | FE+BE | Dialog + submit branch | **dev-fe FE-01** + **dev-be BE-01** | After cap LIVE |
| **R-ATT-04B-UNPAID-TYPE** | FE | Unpaid type pick · EFF consumer | **dev-fe FE-01** | With J-04 |
| **R-ATT-04B-OFFSET** | — | **HOLD** ENGINE | engine program | **Not** 04b slice |
| **R-ATT-04B-DEDUCT-MODE** | — | **HOLD** | ENGINE | **Not** 04b slice |
| **R-ATT-04B-SPL-APPROVE** | — | **GAP deferred** after cap | ba-process if needed | Later |
| **R-ATT-04B-≠DONE** | QC | Footer honesty | **qc** | Always |

**Closable BE for 04b GAP:** **YES** — DATA-01 stamped ADD §4.1–4.2 → **dev-be BE-01 REQUIRED** (not HOLD invent).

**Closable FE:** **REQUIRED** for J-04/J-05 — **dev-fe FE-01** parallel after BE migration or stub contract from this doc.

---

## 6. Traceability (SRS → API → test)

| SRS (FR-04b) | API | Journey | QA expect |
|--------------|-----|---------|-----------|
| Tiên quyết loại ứng | F-ATT-CAT-LVT `allowsAdvance` | **J-HRM-ATT-04B-01** | U65 · 2xx · F5 · ≠ flag=DONE |
| Panel peer 05b | GET panel | **J-HRM-ATT-04B-02** | bucket `advance` · label `unpaid` |
| **#1** reject (ứng OFF) | POST leave-requests | **J-HRM-ATT-04B-03** | **400** `HRM_LEAVE_VAL_BALANCE` |
| **#1** propose ứng/unpaid | POST branch GAP | **J-HRM-ATT-04B-04** | **conditional** when cap+FE wired |
| Input trần ứng | F-ATT-LVRULE cap | **J-HRM-ATT-04B-05** | **conditional** post-migrate |
| **#2** offset | F-ATT-LEAVE-04 **HOLD** | **J-HRM-ATT-04B-06** | footer · FAIL if LIVE claimed |
| `advanced` in available | GET balance/panel | footer J-02/J-03 | post-BE wire |
| Hold | ATT-09 path | MK-ATT09 | `pending_days` · DENY hold table |
| Seals | — | J-06 | ≠ ATT-04b/ATT-04/ATT UAT |

---

## 7. must_keep / FORBIDDEN

| Lock | Rule |
|------|------|
| **ATT04QC1-MSM22G4W** | RETAIN LVT/LVRULE/grant · **DENY wipe** |
| **ATT09QC1-MSLUTL9D** | **`pending_days`** · **DENY** `att_leave_hold` |
| **ATT03DQC1-MSM1CR19** | GPS · **DENY wipe** work-sites |
| Full ATT/CORE/PLT peer stamps | per BA-01 · printable **false** on CORE-09 |
| **R-ATT-04-FY** · **R-ATT-04-ENGINE** | footer HOLD |

**FORBIDDEN this program slice:** Nest `@Controller('core')` leave SoT · physical **`att_leave_hold`** · **F-PAY-ADV-BRIDGE LIVE** · **F-ATT-LEAVE-04 offset LIVE** = slice DONE · wipe ATT-04 paths · claim `allows_advance`+panel = FR-04b DONE · ATT-04b/ATT-04/ATT UAT flip · seed · honesty flip · use `max_balance_days` as advance cap substitute · metadata_json sole cap without typed cols.

---

## 8. Gap list & owners

| # | Gap | Severity | Owner | Verdict |
|---|-----|----------|-------|---------|
| G1 | `advanced_days` col + formula | P0 closable | **dev-be BE-01** | DATA §4.1 migrate + wire §4.3/4.4/4.7 |
| G2 | Policy cap cols + validation | P0 closable | **dev-be BE-01** | DATA §4.2 · §4.6 |
| G3 | Over-balance branch UX/API | P1 | **dev-fe FE-01** + **dev-be** | After G2 min cap known |
| G4 | Offset on grant | HOLD | ENGINE program | **Not** 04b BE |
| G5 | PAY bridge | OUT | PAY | **DENY** in ATT evidence |
| G6 | Scope parity regression | P0 if FAIL | **dev-be** | `hrm-list-scope` + persona probes |

**Summary:** **RETAIN CONFIRMED** for LIVE 04b spine cite · **unlock dev-be BE-01** (migration+wire) · **dev-fe FE-01** (branch+cap UI) · **≠ ATT-04b DONE**.

---

## 9. completion_report

**Closed:** SA API F.1 **CONFIRMED RETAIN + GAP MAP** for `UC-BP-ATT-04b` / `FR-UC-BP-ATT-04b` — physical cite under **`/api/hrm/attendance/*`** with **Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS** per §4; **RETAIN** `allows_advance` · panel `advance`/`unpaid` · **`HRM_LEAVE_VAL_BALANCE`** · **`pending_days`** (ATT-09); **GAP** `advanced_days` · policy cap fields · over-balance branch; **HOLD** F-ATT-LEAVE-04; **OUT** PAY bridge; **DENY** `att_leave_hold` · Nest `/core`; must_keep **ATT04QC1** + **ATT09QC1** + **ATT03DQC1**; apps/** untouched; explicit **≠ ATT-04b / ATT-04 / ATT UAT** · **C-SLICE**.

**Residual open:** dev-be migration+wire · dev-fe J-04/J-05 · QA U65 **J-HRM-ATT-04B-*** · QC GWC · ENGINE offset wave.

**next_owner:** **dev-be** `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01` (+ **dev-fe** `…-FE-01` parallel after contract freeze).

**ack_status:** **PASS_TO_PM CONFIRMED RETAIN + GAP MAP**

**evidence_path:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md`

---

## 10. next_dispatch_prompt (copy-ready)

### 10.1 dev-be BE-01

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01
role: dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #36)
entry_criteria: API-01 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md · DATA-01 CONFIRMED HOLD with ADD stamp §4.1 advanced_days · §4.2 advance_max_days/advance_cap_percent · BA O1–O12 · SA Option A · must_keep ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1-MSM1CR19 · no seed U65
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md (§4.3–4.7 GAP wire · RETAIN assert)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-DATA-01.md (§4 ADD · validation §7)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md (AC-ATT-04B-* · J-03 mandatory)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md (must_keep LVT/LVRULE — DENY wipe)
  - apps/api/hrm-api/src/attendance/leave-balance.service.ts · leave-requests.service.ts · att-leave-accrual-policy.service.ts · att-leave-type.service.ts
spec_read_ack: FR-UC-BP-ATT-04b Diễn biến #1/#2 · API-01 §4 · DATA-01 §4
change_mode: ADD
allowed_paths: apps/api/hrm-api/src/attendance/leave-balance.service.ts · leave-requests.service.ts · att-leave-accrual-policy.service.ts · dto/*leave* · attendance.controller.ts (only if DTO wire) · prisma/migration or ensureSchema paths as project convention
forbidden_paths: invent att_leave_hold table · Nest /core controller · wipe allows_advance on types · demote ATT-04 grant/tracked-entitlement · PAY bridge · F-ATT-LEAVE-04 offset job LIVE
exit_criteria:
  - Migration ADD: employee_leave_balances.advanced_days default 0 · att_leave_accrual_policy.advance_max_days · advance_cap_percent nullable
  - Wire: available = entitled - used - pending - advanced_days on GET balance/panel + assertSufficientLeaveBalance
  - Wire: policy CRUD accepts cap fields with validation (BR-BP-LV-07-CAP)
  - Optional thin: submit branch DTO for advance/unpaid (coordinate dev-fe) — document OpenAPI delta
  - Tests: leave-requests balance reject regression · advanced formula unit · scope parity if touched
  - ack_status READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-be-01.md
  - explicit ≠ ATT-04b DONE · ≠ ATT UAT · C-SLICE
cấm: seed · att_leave_hold · offset grant job · honesty flip · wipe ATT-04 paths
```

### 10.2 dev-fe FE-01

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
role: dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-33 seat #36)
entry_criteria: API-01 CONFIRMED · RETAIN paths LIVE (allows_advance on Settings loại phép · panel · reject J-03) · BE-01 READY_FOR_QA or frozen OpenAPI for cap/advanced (parallel allowed on RETAIN-only J-01..03)
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01.md (J-HRM-ATT-04B-01..06)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-02.md (if prior FE slice exists)
exit_criteria:
  - J-01: toggle allows_advance ATT-04 path · F5 · Network /api/hrm/attendance/leave-types* 2xx
  - J-02: panel advance/unpaid labels · embed form
  - J-03: ứng OFF over available → 400 HRM_LEAVE_VAL_BALANCE · FE error UX · U65
  - J-04 (conditional): over-balance dialog ứng vs không lương when BE branch+cap LIVE
  - J-05 (conditional): policy cap admin fields when BE cap LIVE
  - Nest /core 0 · no seed · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-fe-01.md
  - ack_status READY_FOR_QA
  - explicit ≠ ATT-04b DONE · C-SLICE
cấm: seed · claim reject-only = FR-04b DONE · invent PAY bridge · Settings MD sole cap
```

---

*End API-04B-01 · CONFIRMED RETAIN + GAP MAP · unlock dev-be BE-01 + dev-fe FE-01 · ≠ ATT-04b DONE · 2026-08-10*
