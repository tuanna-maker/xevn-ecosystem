# BA AC/BR — ATT work_shifts catalog Option B deepen · Nest SoT ≠ Settings/`shifts` · admin open N+1 ≠ consumer invent

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01` **CONFIRMED** Option **B** LOCKED |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** (no EXPAND proved) · BE deepen **HOLD→UNLOCK** after this BA · FE ShiftChange rebind after BE · ATT-CODE L1 / leave / worksite / EMP / SI / CTR / aggregate **SEAL RETAIN** · invent FE ATT-CODE HOLD **DENIED** · ATT UAT / ready flip **DENIED** |
| **change_mode** | **ADD** (deepen SA §5–§7 · **no** wipe platform BA-01 · ATT-CODE · ATT leave/worksite · EMP seals · SI/CTR · aggregate GĐ1) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md) L-ATT-SHIFT-01..14 · F.1 · §7 AC draft |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-shift-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-sa-01.md) |
| **ref_peer_att_worksite** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md) Option **B** LIVE deepen — **closest structural peer** (**cite ≠ copy**) |
| **ref_peer_att_leave** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) admin≠consumer — **cite ≠ copy** · **SEAL RETAIN** |
| **ref_peer_att_code** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md) **L-ATT-CODE-08** `work_shifts` OUT — **cite ≠ copy DEFINE** · **FORBIDDEN** reopen L1 · **FORBIDDEN** invent FE HOLD |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · ATT §2.3 · DATA_CLASS CFG «Ca làm việc (instance)» |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) FR-UC-BP-ATT / FR-HRM-SC-SHIFT-01 · UC-HRM-ATT-SHIFT-CHANGE · Ca list |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) `work_shifts` ops SoT · ≠ att_leave_type · ≠ attendance_work_sites · ≠ att_attendance_code |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D1** · [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · Q-PLT-03 mega-EAV DENY |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · ATT leave **`ATTLEAVEQA-MSJ7CPJH`** · ATT worksite **`ATTWSQA-MSJC3IN9`** · EMP DEPT/POS/ST/CF/EXT · SI/CTR · aggregate / LIST-TOTALS **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** (do not invent FE) · **`C-SLICE-≠-MODULE`** · U65 · DENY module ATT UAT |
| **Cấm** | `apps/**` · seed · Settings/`shifts` sole SoT · dual-write · mega-EAV · fold into code/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · flip ready · rewrite aggregate · Phase1 · ba-data second shifts table |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED · ADR **D1** LIVE deepen):

1. **Shift SoT** = Nest **`public.work_shifts`** via **F-ATT-CAT-SHIFT-01/02** — Settings/XBOS **`shifts`** = **group REF merge-read only** (**BR-PLT-06** · **L-ATT-SHIFT-02/03** · ADR D1).
2. **Catalog admin** = **open CREATE N+1** (`code` + name + times + coefficient) (**BR-PLT-05** · **AC-PLT-ATT-SHIFT-01d**).
3. **Consumers** khi **active shift count > 0** = picker/FK only từ Nest list/EFF (**BR-PLT-02** · **AC-PLT-ATT-SHIFT-01**); invent `shift_id`/`code` → **`HRM-ATT-SHIFT-KEY`** (**01b**).
4. Empty active → soft empty + CTA admin CREATE · invent assert **skip** · **no seed** · FE hardcode five-shift list = **bootstrap fallback only** when active=0 (**AC-PLT-ATT-SHIFT-01c** · **L-ATT-SHIFT-06**).
5. Soft-retire prefer **`status='inactive'`** → hide default list/picker · history refs OK (**01e** · **BR-PLT-04**).
6. **Mandatory residual:** `ShiftChangeRequestTab` closed hardcode `morning|afternoon|night|office|flexible` must rebind Nest when active>0 (**S-ATT-SHIFT-CNS-01**).
7. **DENY** fold ATT-CODE/leave/worksite · reopen seals · invent FE ATT-CODE HOLD · flip ready · mega-EAV · rewrite aggregate · Settings sole SoT (**01H**).
8. **ba-data HOLD** — physical LIVE + `status` column already present · **no** `archived_at` EXPAND proved · unique `(company_id, lower(code))` = **GĐ1.5 HOLD** (app VAL enough GĐ1).

### Actors

| Actor | Role |
|-------|------|
| HCNS — Attendance **tab Ca** (catalog admin) | CRUD Nest `work_shifts` (mở N+1) · retire soft `status=inactive` |
| HCNS / QL — **Đơn từ → Đổi ca** | Chọn ca hiện tại / ca đề nghị ∈ Nest active khi count>0 |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Active filter · soft-delete hide · `HRM-ATT-SHIFT-KEY` · empty skip · Settings REF only |
| SA / Dev-BE / Dev-FE / QA | F.1 deepen · invent KEY · ShiftChange rebind · U65 browser |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-ATT-SHIFT-01 / 01b / 01c / 01d / 01e / 01H** · **VAL-ATT-SHIFT-CNS-*** · BR-PLT-ATT-SHIFT-* · surface matrix + UF/J-* | Impl `apps/**` / migration / seed |
| Enumerate: Ca CRUD admin · ShiftChange consumer (hardcode residual **mandatory**) · OT/assignment **cite only if bind** | Claim module ATT UAT · flip `attendance_uat_ready` / `payroll_e2e_ready` |
| Orthogonality cite ATT-CODE · leave · worksite · EMP · SI/CTR · aggregate | Fold / reopen seals · invent FE ATT-CODE HOLD |
| ba-data **HOLD** (LIVE · no EXPAND proved) | Roster «Lịch ca» / one-way REF sync (L-ATT-SHIFT-14) · payroll formula invent |
| Align SA Option B · peer WORKSITE deepen | Wipe ATT-CODE L1 · leave/WS GWC · EMP stamps |

**Numbering (peer align):** **01**=consumer picker · **01b**=invent KEY · **01c**=empty active · **01d**=admin CREATE N+1 · **01e**=soft-retire · **01H**=honesty.

---

## 1. As-is vs to-be

| | AS-IS (SA + code evidence) | TO-BE (Option B · this pack) |
|---|----------------------------|------------------------------|
| Shift SoT | Nest `public.work_shifts` LIVE · FE `useWorkShifts` Ca tab Nest-bound · ADR D1 | SoT = Nest **F-ATT-CAT-SHIFT-***; Settings/`shifts` REF only — **REJECT** sole |
| Admin create | POST open N+1 `code`/name/times/coeff | **Retain** open N+1 (**01d**) — **≠** consumer invent ban |
| Consumer ShiftChange | Hardcoded 5 ids `morning|afternoon|night|office|flexible` — **not** Nest list | When active>0 bind Nest `code`/`id` + display-ready; invent → **`HRM-ATT-SHIFT-KEY`** |
| OT request | `OvertimeRequestTab` — **no** work_shift bind (weekday/weekend/holiday type only) | **OUT invent** this pack — payroll coeff **cite only** on assigned shift row |
| Soft-delete | Column `status` LIVE · **DELETE = hard** `DELETE FROM` | Prefer PATCH `status='inactive'` (**01e**); hard DELETE residual when no refs |
| List filter | Returns **all** rows (no default active) | Default exclude inactive unless `include_inactive=true` |
| Invent KEY | Absent on shift-change create | **GAP** → **`HRM-ATT-SHIFT-KEY`** when active>0 |
| ba-data | Table + `status` LIVE · no `archived_at` · no UNIQUE index on code | **HOLD** — soft path uses `status`; unique code **GĐ1.5 HOLD** |
| Honesty | Slice deepen risk misread module GO | Flags **false** · **`C-SLICE-≠-MODULE`** · seals RETAIN |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest active shifts **>0** | Consumer SoT = picker/FK `shift_id`/`code` ∈ scoped Nest | Invent → **4xx** `HRM-ATT-SHIFT-KEY` |
| **BR-PLT-04** | Retire shift | Soft `status='inactive'` prefer | List/picker default ẩn; history refs OK |
| **BR-PLT-05** | Admin CREATE | Open N+1 `code`/name/times/coeff · VAL only | **FORBIDDEN** closed morning/afternoon ceiling on F-ATT-CAT-SHIFT-02 |
| **BR-PLT-06** | Dual SoT risk | Settings/XBOS `shifts` = REF merge-read only; Nest tenant wins | **FORBIDDEN** dual-write / MD sole SoT (ADR D1) |
| **L-ATT-SHIFT-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-SHIFT-02** | Shift SoT | Nest `work_shifts` | Settings/`shifts` alone / FE hardcode sole when active>0 **REJECT** |
| **L-ATT-SHIFT-03** | Settings REF | Merge-read only | **FORBIDDEN** dual-write |
| **L-ATT-SHIFT-04** | Admin open | CREATE N+1 | **FORBIDDEN** closed enum ceiling as product SoT |
| **L-ATT-SHIFT-05** | Consumer invent | Membership ∈ Nest active | Format-only / hardcode id **không** bypass when active>0 |
| **L-ATT-SHIFT-06** | Active count =0 | Soft empty + CTA · invent skip · hardcode OK **only** when empty | **FORBIDDEN** seed / ensureDefault |
| **L-ATT-SHIFT-07** | Soft-delete | Prefer `status='inactive'` | **FORBIDDEN** hard-delete as sole product retire when refs exist |
| **L-ATT-SHIFT-08** | Orthogonal | ≠ day-code · ≠ leave · ≠ work-sites · ≠ EMP status | **FORBIDDEN** fold / dual master · **FORBIDDEN** reopen ATT-CODE L1 |
| **L-ATT-SHIFT-09..14** | Seals / honesty / scope / display / mega-EAV / roster OUT | RETAIN / false / U19 / display-ready / DENY / deferred | See §8 |

---

## 3. ATT work_shifts-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-SHIFT-01** | Surface = **catalog admin** (`POST/PATCH` F-ATT-CAT-SHIFT-02) | Cho phép ca mới (code/name/times/coeff hợp lệ) | **2xx/201** · list + F5 còn — **không** «must pick existing only» |
| **BR-PLT-ATT-SHIFT-02** | Surface ∈ **consumer set** (§4) **và** active shifts **>0** | Body `current_shift`/`requested_shift`/`shift_id`/`code` **phải** ∈ scoped Nest active catalog | Invent → **`HRM-ATT-SHIFT-KEY`**; hardcode five-id **không** bypass |
| **BR-PLT-ATT-SHIFT-03** | Active shifts **=0** | Soft empty + CTA admin CREATE; invent assert **skip**; hardcode five-shift OK **bootstrap only** | Seed/ensureDefault để pass UF = **FAIL U65** |
| **BR-PLT-ATT-SHIFT-04** | Settings MD / XBOS `shifts` | REF merge-read only — **không** ops SoT | Bind Nest work_shifts only for SoT (ADR D1) |
| **BR-PLT-ATT-SHIFT-05** | Retire | PATCH `status='inactive'` → ẩn list/picker default | Hard DELETE chỉ khi no refs + admin explicit — **không** SoT retire path |
| **BR-PLT-ATT-SHIFT-06** | List F-ATT-CAT-SHIFT-01 | Default `status='active'` filter; `include_inactive=true` cho admin audit | Inactive lộ mặc định vào consumer picker = **FAIL** |
| **BR-PLT-ATT-SHIFT-07** | Identity GĐ1 | Consumer bind = Nest `code` (string SoT on shift-change AS-IS) và/hoặc UUID `id` | Display-ready `name`/times from Nest row — FE **cấm** invent label when BE provides |
| **BR-PLT-ATT-SHIFT-08** | Alias invent codes | Primary = **`HRM-ATT-SHIFT-KEY`**; alias `HRM-ATT-SHIFT-UNKNOWN` OK if documented same class | **≠** leave KEY · **≠** ATT-CODE KEY · **≠** GEO-001 · get-by-id OOS retain **`HRM-WS-404`** / scope **`HRM-WS-409`** |
| **BR-PLT-ATT-SHIFT-09** | OT / payroll coeff | OT create **no** shift bind AS-IS | **OUT** invent KEY assert on OT this pack; coeff on assigned shift = **cite only** — **FORBIDDEN** formula invent |
| **BR-PLT-ATT-SHIFT-10** | Assignment / roster «Lịch ca» | Deferred ADR D1 | **OUT** invent this seat (L-ATT-SHIFT-14) unless split work_item |
| **BR-PLT-ATT-SHIFT-11** | ba-data | `public.work_shifts` + `status` already LIVE | **HOLD** — **FORBIDDEN** second table · **FORBIDDEN** fold into att_attendance_code / leave / worksite · **no** `archived_at` EXPAND |
| **BR-PLT-ATT-SHIFT-12** | Unique code | App VAL uniqueness GĐ1 | DB UNIQUE `(company_id, lower(code))` = **GĐ1.5 HOLD** — **not** ba-data UNLOCK this seat |

**Align (no conflict):**

| Vertical / peer | This pack |
|-----------------|-----------|
| **AC-PLT-ATT-WORKSITE-01*** | Closest deepen peer — **≠** same SoT; WS GWC **OUT reopen** |
| **AC-PLT-ATT-LEAVE-01*** | Named peer pattern — leave **OUT reopen** |
| **AC-PLT-ATT-CODE-01*** / **L-ATT-CODE-08** | Orthogonal OWN seat — **FORBIDDEN** reopen L1 · **FORBIDDEN** invent FE HOLD |
| ADR **D1** | Nest wins · Settings REF — **RETAIN** |

**Error code lock (deterministic):**

| Code | Use | Not |
|------|-----|-----|
| **`HRM-ATT-SHIFT-KEY`** | Consumer invent `shift_id`/`code` ∉ Nest active when count>0 | Soft empty / seed / admin VAL |
| **`HRM-ATT-SHIFT-UNKNOWN`** | Alias of KEY (same class) if BE stamps | Synonym of leave/code KEY |
| **`HRM-WS-VAL`** | Admin empty code/name · bad times | Consumer invent |
| **`HRM-WS-404`** | Admin get/mutate OOS / not found (**U19**) | Synonym of invent KEY |
| **`HRM-WS-409`** | Scope mismatch | Invent KEY |

**SUPERSEDED / FORBIDDEN:** Option A Settings/`shifts`-only SoT · invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · claim module ATT UAT · seed default shifts · fold into code/leave/worksite · mega-EAV · rewrite aggregate · Phase1.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** AC invent/picker áp **consumer rows** — **không** áp lên F-ATT-CAT-SHIFT-02 admin CREATE.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | Class | SRS / J |
|---------|-------------------|--------------------------|-----------|-------------------|-------|---------|
| **S-ATT-SHIFT-ADM-01** | Nest work_shifts **admin** create/edit/retire | Attendance → tab **Ca** (`useWorkShifts` · `/api/hrm/attendance/work-shifts*`) | `code`/name/times/coeff open N+1 · `id` UUID · `status` | **F-ATT-CAT-SHIFT-02** | **ADMIN** | FR-HRM-SC-SHIFT-01 · ADR D1 |
| **S-ATT-SHIFT-CNS-01** | **Đổi ca** create/edit | Attendance → Đơn từ → **Đổi ca** (`ShiftChangeRequestTab` · `useShiftChangeRequests`) | `current_shift` / `requested_shift` string | POST/PATCH shift-change · **must** ∈ Nest when active>0 | **CONSUMER** (**primary** · hardcode residual **H**) | UC-HRM-ATT-SHIFT-CHANGE |
| **S-ATT-SHIFT-REF-01** | Settings MD / XBOS `shifts` | MasterDataSettingsPanel bucket `shifts` | REF only | **FORBIDDEN** dual-write / sole SoT | **REF** | ADR D1 · BR-PLT-06 |
| **S-ATT-SHIFT-CITE-01** | OT request | `OvertimeRequestTab` — type weekday/weekend/holiday | **no** work_shift field AS-IS | — | **CITE OUT** — no invent KEY this pack | UC-HRM-ATT-OT |
| **S-ATT-SHIFT-CITE-02** | Payroll coeff on assigned shift | Payroll read shift row | coefficient on Nest row | **cite only** | **CITE** — **FORBIDDEN** formula invent | PAY seals RETAIN |
| **S-ATT-SHIFT-OUT-01** | Attendance codes / leave / work-sites / sheet sign / J-HRM-06c | ATT-CODE · LeaveTab · GPS · sheets | — | — | **OUT** · **SEAL RETAIN** | peer packs |
| **S-ATT-SHIFT-OUT-02** | Roster «Lịch ca» / one-way REF sync | — | — | — | **OUT deferred** | L-ATT-SHIFT-14 |
| **S-ATT-SHIFT-HOLD-01** | Assignment mutate bind `shift_id` | No in-scope UF binds today beyond ShiftChange strings | — | — | **GĐ1.5 HOLD** until surface | — |

**Pointer:** Hardcode five-shift list on CNS-01 = **FAIL** when Nest active>0 · **OK bootstrap only** when active=0 (01c).

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-SHIFT-01** | Admin — CREATE Nest shift N+1 | Ca tab → ca mới (code/name/times/coeff) → Lưu **201** → list có row → **F5** còn → ShiftChange picker thấy ca mới | PATCH label/times · retire `status=inactive` | VAL empty code · scope 409 · «closed morning/afternoon only» sai áp |
| **UC-PLT-ATT-SHIFT-02** | Consumer — ShiftChange pick Nest | active≥1 → Đổi ca → chọn Nest `code`/`id` → **2xx** → F5 request còn Nest SoT | — | Hardcode invent id succeed · Settings sole |
| **UC-PLT-ATT-SHIFT-03** | Invent unknown shift | active≥1 → submit `current_shift`/`requested_shift` ∉ Nest | — | **4xx** `HRM-ATT-SHIFT-KEY` · không persist |
| **UC-PLT-ATT-SHIFT-04** | Empty active | active=0 → soft empty + CTA; invent skip; hardcode bootstrap OK; admin vẫn CREATE | — | ensureDefault/seed |
| **UC-PLT-ATT-SHIFT-05** | Soft-retire | PATCH status=inactive → picker ẩn; history shift-change refs còn đọc được | include_inactive admin view | Hard-delete-only retire with refs |
| **UC-PLT-ATT-SHIFT-06** | Scope parity | List shifts scope X = consumer assert scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS Ca catalog admin
  actor Emp as QL/NV Đổi ca
  participant Nest as Nest work_shifts
  participant MD as Settings/XBOS shifts REF
  participant SC as ShiftChange create

  Note over MD: REF merge-read only — cấm dual-write / sole SoT
  Admin->>Nest: POST F-ATT-CAT-SHIFT-02 shift N+1 (open)
  alt Ceiling closed morning/afternoon sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-ATT-SHIFT-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Emp->>SC: POST current_shift / requested_shift
  alt Active count = 0
    SC-->>Emp: Skip invent assert; CTA admin; hardcode bootstrap only; cấm seed
  else Active >0
    alt code/id ∉ Nest scoped catalog
      SC-->>Emp: 4xx HRM-ATT-SHIFT-KEY
    else ∈ Nest active
      SC-->>Emp: 2xx; F5 Nest still SoT
    end
  end
  Note over SC: ATT-CODE / leave / worksite / aggregate / UAT OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe ATT-CODE L1 · leave/WS · EMP · SI/CTR · aggregate · invent FE ATT-CODE HOLD.

### 6.1 Core AC pack (SA §7)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-SHIFT-01** | **S-ATT-SHIFT-CNS-01** | Nest active **≥1** (từ admin — **không** seed): Đổi ca → picker **Nest** (không còn closed 5-id sole) → Network **2xx** → FE sau 2xx · **F5** Nest vẫn SoT | Settings/`shifts` sole SoT · free invent hardcode id 2xx · chỉ API PASS |
| **AC-PLT-ATT-SHIFT-01b** | **S-ATT-SHIFT-CNS-01** invent | active **≥1**: cố ý `current_shift`/`requested_shift`/`code` **∉** Nest scoped → FE chặn và/hoặc Network **4xx** **`HRM-ATT-SHIFT-KEY`** → **không** persist sau F5 | 2xx invent · wrong KEY taxonomy (leave/code/EMP/GEO) |
| **AC-PLT-ATT-SHIFT-01c** | Empty active | active **=0**: empty list soft · CTA admin · invent skip · hardcode bootstrap **only**; **S-ATT-SHIFT-ADM-01** vẫn CREATE; **không** ensureDefault/seed | Seed/script density · silent invent claim PASS when later active>0 |
| **AC-PLT-ATT-SHIFT-01d** | **S-ATT-SHIFT-ADM-01** | Catalog admin CREATE shift **#N+1** open `code` → Network **2xx/201** F-ATT-CAT-SHIFT-02 → list có row → **F5** còn → consumer picker dùng ca mới — **không** reject «closed morning/afternoon only» | Áp invent ban lên admin · Settings dual-write |
| **AC-PLT-ATT-SHIFT-01e** | Soft-retire | PATCH `status='inactive'` → default list/picker **ẩn** · history shift-change vẫn đọc được (không orphan crash) | Hard-delete only product retire with refs · inactive still in picker default |
| **AC-PLT-ATT-SHIFT-01H** | Honesty / seals | Evidence: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · leave **`ATTLEAVEQA-MSJ7CPJH`** · worksite **`ATTWSQA-MSJC3IN9`** · EMP DEPT/POS/ST/CF/EXT · SI/CTR · aggregate/LIST-TOTALS **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** (no invent FE) · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module ATT UAT / Phase1 | Flip ready · reopen seals · fold · invent FE HOLD · claim module ATT UAT |

### 6.2 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-SHIFT-CNS-01** | ShiftChange **CNS-01** | `current_shift`/`requested_shift` ∉ Nest when active>0 | **4xx** `HRM-ATT-SHIFT-KEY` · no persist | 01b · BR-PLT-ATT-SHIFT-02 | **BE GAP** — invent KEY assert absent AS-IS |
| **VAL-ATT-SHIFT-CNS-02** | ShiftChange picker | active>0 | Options = Nest active list (display-ready name/times) — **not** closed 5-id sole | 01 · L-ATT-SHIFT-02 | **FE GAP** — `ShiftChangeRequestTab` hardcode residual **H** |
| **VAL-ATT-SHIFT-CNS-03** | Scope | List shifts scope ≠ consumer assert scope | jest **FAIL** scope_parity · 409/4xx deterministic | L-ATT-SHIFT-11 · U19 | **RETAIN** list↔mutate specs; deepen if FAIL |
| **VAL-ATT-SHIFT-CNS-03b** | List default | GET list without include_inactive | Default **active only** (inactive hidden from picker set) | BR-PLT-ATT-SHIFT-06 · F-ATT-CAT-SHIFT-01 | **BE GAP** — AS-IS returns all rows |
| **VAL-ATT-SHIFT-CNS-04** | Retire | PATCH `status=inactive` rồi open ShiftChange picker | Retired shift **không** trong default picker; soft path OK | 01e · BR-PLT-04 · BR-PLT-ATT-SHIFT-05 | **BE GAP** prefer soft over hard DELETE as product retire |
| **VAL-ATT-SHIFT-CNS-05** | Empty active | active=0 · ShiftChange open | Invent skip · CTA · hardcode bootstrap OK · **no seed** | 01c · L-ATT-SHIFT-06 | **RETAIN** empty honesty; **FORBIDDEN** ensureDefault |
| **VAL-ATT-SHIFT-CNS-06** | Settings REF | MD `shifts` mutate alone as ops SoT | **REJECT** as PASS evidence for 01/01d | L-ATT-SHIFT-03 · ADR D1 | **RETAIN** MD dual-write DENY |
| **VAL-ATT-SHIFT-ADM-*** | Admin **ADM-01** | Create N+1 / VAL / WS-404 OOS | Per F-ATT-CAT-SHIFT-02 | 01d | **RETAIN** + soft-retire deepen |

### 6.3 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-ATT-CODE-01** | ATT-CODE L1 **`ATTCODEQA-MSK4T1A5`** retained · R-PLT-ATT-CODE-FE-01 HOLD | Reopen L1 / invent FE HOLD |
| **MK-ATT-LEAVE-01** | ATT leave GWC retained | Reopen/wipe leave pack |
| **MK-ATT-WS-01** | ATT worksite GWC retained | Reopen/wipe worksite pack |
| **MK-EMP-SI-CTR-01** | EMP DEPT/POS/ST/CF/EXT · SI · CTR seals retain | Reopen peers |
| **MK-AGG-01** | `att-timesheet-line-aggregate` / LIST-TOTALS sealed GĐ1 | Rewrite aggregate |
| **MK-ADR-D1-01** | Nest work_shifts wins · Settings REF | Settings sole / dual-write |
| **MK-OT-CITE-01** | OT no false invent KEY claim | Treat OT as mandatory shift consumer without field |

### 6.4 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-ATT-SHIFT-CAT-01`** | Admin CREATE N+1 → F5 → ShiftChange pick Nest (**01d** → **01**) | ba-docs ADD journey after CONFIRM / QA |
| **Proposed `J-HRM-ATT-SHIFT-CAT-02`** | Invent unknown shift code → 4xx KEY (**01b**) | |
| **Proposed `J-HRM-ATT-SHIFT-CAT-03`** | active=0 skip invent + admin still CREATE (**01c**) | U65 no seed |
| **Proposed `J-HRM-ATT-SHIFT-CAT-04`** | Soft-retire status=inactive → picker hides (**01e** / CNS-04) | |
| Reuse | ATT leave / worksite / ATT-CODE journeys | **OUT** · **SEAL RETAIN** — **cấm** reopen / claim UAT |
| Cross-nav U19 | Ca list → edit → F5 · ShiftChange after admin create | AC list mutate kèm F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-ATT-SHIFT-KEY`** | Consumer invent shift when active>0 | **4xx** | Banner VI — không toast success |
| **`HRM-ATT-SHIFT-UNKNOWN`** | Alias KEY (same class) | 4xx | Same as KEY |
| **`HRM-WS-VAL`** | Admin validation (empty code/name, bad times) | 4xx | Admin form |
| **`HRM-WS-404`** | Admin get/mutate not found / OOS | 404 class | Honest empty/banner |
| **`HRM-WS-409`** | Scope mismatch | 409 class | Honest empty/banner |

**Cấm:** 2xx + invent when active>0; 500 trên invent; nhầm KEY với leave/code/GEO; claim Settings MD mutate as ops PASS.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** — **DENIED** reopen L1 |
| R-PLT-ATT-CODE-FE-01 | **HOLD** — **DENIED** invent FE ATT-CODE as mandatory |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** |
| ATT worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** |
| EMP DEPT/POS/ST/CF/EXT · SI · CTR | **SEAL RETAIN** |
| Aggregate / LIST-TOTALS GĐ1 | **SEAL RETAIN** — **FORBIDDEN** rewrite |
| Module ATT UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| `C-SLICE-≠-MODULE` | work_shifts AC pack ≠ module ATT UAT |
| Seed / ensureDefaultWorkShift | **DENIED** (U65 · L-ATT-SHIFT-06) |
| ba-data | **HOLD** — **no EXPAND** (`archived_at` not required; unique code GĐ1.5 HOLD) |
| Fold into ATT-CODE / leave / worksite | **FORBIDDEN** |
| Mega-EAV / second Nest shifts table | **FORBIDDEN** |

---

## 9. ba-data EXPAND proof (this seat)

| Question | Verdict |
|----------|---------|
| New physical table? | **NO** — `work_shifts` LIVE |
| Need `archived_at` column? | **NO** — `status TEXT` already LIVE (`active`/`inactive`) covers BR-PLT-04 soft-retire |
| Need UNIQUE index `(company_id, lower(code))` GĐ1? | **NO this seat** — app VAL uniqueness sufficient; stamp **GĐ1.5 HOLD** if QA proves collisions |
| Fold / mega-EAV physical? | **FORBIDDEN** |
| **ba-data unlock?** | **HOLD** — EXPAND **not proved** |

---

## 10. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS admin≠consumer · Nest SoT · Settings REF | **OPTIONAL** | FR-HRM-SC-SHIFT-01 / ADR D1 already; ADD-only wording if sponsor ambiguity |
| Journey rows J-HRM-ATT-SHIFT-CAT-* | **OPTIONAL** after QA stamp | Map §6.4 · update `PILOT_BUSINESS_FLOW_BA_TRACE` |
| ba-data EXPAND | **NO** | Physical LIVE · no second table |

---

## 11. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA CONFIRMED · unlock **dev-be** deepen (soft-retire · list active filter · invent KEY) then FE ShiftChange rebind · QA browser | Bus DISPATCHED |
| **ba-data** | **HOLD** | No Task unless EXPAND reopen (unique code GĐ1.5) |
| **dev-be** | After BA: soft-retire prefer `status=inactive` · list default active · invent **`HRM-ATT-SHIFT-KEY`** on ShiftChange create · optional EFF · **cấm** ensureDefault · **cấm** Settings dual-write · **cấm** reopen ATT-CODE | READY_FOR_QA |
| **dev-fe** | Rebind `ShiftChangeRequestTab` → Nest list when active>0; hardcode only when empty; display-ready Nest labels | READY_FOR_QA |
| **qa** | U65 AC-PLT-ATT-SHIFT-01/01b/01c/01d/01e/01H · zero-seed · no UAT flip · seals untouched · no invent FE ATT-CODE | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §10 | After PM if flagged |

---

## 12. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | Hard DELETE still on API | Product retire path = soft; hard DELETE residual guarded — BE deepen |
| R2 | List returns inactive | BE GAP CNS-03b |
| R3 | ShiftChange hardcode 5-id | FE GAP CNS-02 — **mandatory** residual SA-cited |
| R4 | Invent KEY absent | BE GAP CNS-01 |
| R5 | OT no shift bind | Documented OUT — do not invent KEY on OT |
| R6 | Unique code DB | GĐ1.5 HOLD — not ba-data UNLOCK |
| Q1 | Exact live KEY string | BE emits `HRM-ATT-SHIFT-KEY` — document in QA evidence |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 13. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** (no EXPAND proved) |
| **BE** | **UNLOCK** deepen after this BA — soft-retire · list active filter · invent KEY · optional EFF |
| **FE** | ShiftChange Nest rebind after BE (or parallel if API contract stable) — **FORBIDDEN** invent ATT-CODE FE |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-ba-01.md` |
