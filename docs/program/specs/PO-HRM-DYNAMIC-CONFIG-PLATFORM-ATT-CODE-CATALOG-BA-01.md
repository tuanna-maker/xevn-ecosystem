# BA AC/BR — ATT attendance-code (ký hiệu công) catalog Option B · Nest SoT ≠ Settings MD / fold leave·worksite·shifts · counting sealed GĐ1

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **UNLOCK** (parallel `…-ATT-CODE-CATALOG-DATA-01` · Nest **absent**) · BE **HOLD** until BA **+** DATA · FE hardcode sole SoT **GAP** (rebind Nest EFF · reconcile `early_leave`/`on_leave`) · closed DTO `@IsIn(['pending','present','absent','leave'])` **DROP residual after DATA** · `attendance_uat_ready` / `payroll_e2e_ready` / reopen leave·worksite·sign·EMP·SI·CTR / aggregate rewrite **DENIED** |
| **change_mode** | **ADD** (deepen SA §5–§7 · **no** wipe platform BA-01 · ATT leave/worksite · EMP dept/pos/status/custom/token-ext · SI/CTR · PAY/LIST-TOTALS) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) L-ATT-CODE-01..14 · F.1 · §7 draft |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.3 ATT «Attendance codes / work sites» · **BR-PLT-02/04/05/06** · §2.6 closed-enum clarify |
| **ref_peer_emp_status** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01.md) Option **B** DEFINE Nest — **closest structural peer** (cite ≠ copy) · semantics-stay-code **L-EMP-ST-07** ↔ **L-ATT-CODE-07** |
| **ref_peer_att_leave** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) Option **B** — **cite ≠ copy** · leave **sub-type** ≠ day-code · **SEAL RETAIN** |
| **ref_peer_att_worksite** | ATT-WORKSITE Option **B** Nest geofence — **cite** · **OUT fold** · **SEAL RETAIN** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-01/02/10/11** (record status · timesheet line aggregation) |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4 `attendance_records.status` · att_timesheet_line — **no** attendance-code catalog today |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT leave/worksite/sign/**J-HRM-06c** **SEAL RETAIN** · EMP **`EMPDEPTQA-MSK3VVXX`** · **`EMPPOSQA2-MSK3CDH1`** · **`EMPSTQA-MSK20G7H`** · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1`** · SI/CTR · PAY/LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module ATT UAT |
| **Cấm** | `apps/**` · seed · Settings MD sole SoT · mega-EAV · fold into leave/worksite/`work_shifts` · rewrite `att-timesheet-line-aggregate` / LIST-TOTALS · flip attendance/payroll ready · reopen seals · invent module ATT UAT · Phase1 · BE before BA+DATA |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Code SoT** = Nest **`public.att_attendance_code`** via **F-ATT-CAT-CODE-*** / **F-ATT-CAT-CODE-EFF-01** — future Settings `attendance_codes` = **group REF merge-read only** (**BR-PLT-06** · **L-ATT-CODE-02/03**).
2. **Catalog admin** = **open CREATE N+1** slug + typed flags (`counts_as`, `day_weight`, `is_paid`, `is_present`, `symbol`, …) (**BR-PLT-05** · **AC-PLT-ATT-CODE-01d**).
3. **Consumers** khi EFF active **>0** = picker/FK only từ **GET …/attendance-codes/effective** (**BR-PLT-02** · **AC-PLT-ATT-CODE-01**); invent day-code/`status` → **`HRM-ATT-CODE-KEY`** (alias `HRM-ATT-CODE-UNKNOWN`) (**01b**).
4. Empty EFF → soft empty + CTA Settings · invent assert **skip** · **no seed** · FE/BE hardcode label map = **bootstrap fallback only** when EFF=0 (**AC-PLT-ATT-CODE-01c** · **L-ATT-CODE-06**).
5. Soft-retire code → hide picker · history `attendance_records` OK (**01e** · **BR-PLT-04**).
6. Display: symbol/`status_label` from catalog when EFF>0; reconcile FE `early_leave`/`on_leave` divergence (**01f** · **L-ATT-CODE-13**).
7. **DROP** closed DTO `@IsIn(['pending','present','absent','leave'])` as product ceiling — **ba-data/BE residual after DATA** (slug format CHK OK) (**L-ATT-CODE-04**).
8. **L-ATT-CODE-07:** timesheet aggregate / payroll LIST-TOTALS counting = **sealed code GĐ1** — catalog typed flags = **physical metadata only**; **FORBIDDEN** aggregate rewrite this seat (GĐ2 wiring residual).
9. **L-ATT-CODE-08:** ≠ leave-type · ≠ `work_shifts` · ≠ work-sites · **FORBIDDEN** fold mega-EAV.
10. **DENY** Settings-MD-alone · mega-EAV · fold · attendance/payroll flip · reopen seals · module ATT UAT · Phase1 (**01H**).

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings — tab **Ký hiệu công / Attendance codes** (Nest admin) | CRUD Nest `att_attendance_code` (mở N+1) · retire soft · typed flags |
| HCNS — **Chấm công → bảng ghi công** | Chọn `status`/day-code ∈ EFF · tạo/sửa bản ghi |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective union (Nest wins vs Settings REF) · soft-delete hide · KEY codes · display-ready symbol/label |
| SA / ba-data / Dev-BE / Dev-FE / QA | F.1 · physical ADD · drop closed IsIn · assert + picker rebind · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-ATT-CODE-01 / 01b / 01c / 01d / 01e / 01f / 01H** · **VAL-ATT-CODE-CNS-*** · BR-PLT-ATT-CODE-* · surface matrix + UF/J-* pointers | Impl `apps/**` / migration / seed |
| Enumerate consumers: attendance-record create/update `status` · display symbol/label · Settings Nest admin CRUD | Claim module ATT UAT · flip `attendance_uat_ready` / `payroll_e2e_ready` |
| Orthogonality cite leave · worksite · `work_shifts` · EMP seals · SI/CTR | Fold day-code into `att_leave_type` / work-sites / shifts · reopen seals |
| Counting semantics **stay code** GĐ1 (**L-ATT-CODE-07**) — flags physical only | Rewrite `att-timesheet-line-aggregate` / LIST-TOTALS this seat |
| ba-data **UNLOCK** pointer (Nest absent · closed IsIn DROP residual) | Sheet close/sign / leave WAIVE / J-HRM-06c reopen |
| Align BA-01 GĐ1 «Open catalog codes» · SA Option B | Wipe ATT leave/worksite GWC · EMP stamps |

**Numbering note (peer align):** SA §7 draft IDs preserved; peer SI/ATT/EMP-STATUS convention: **01**=consumer picker · **01b**=invent KEY · **01c**=empty EFF · **01d**=admin CREATE N+1 · **01e**=soft-retire · **01f**=display · **01H**=honesty.

---

## 1. As-is vs to-be

| | AS-IS (SA evidence) | TO-BE (Option B · this pack) |
|---|---------------------|------------------------------|
| Day-code SoT | Closed DTO `@IsIn(['pending','present','absent','leave'])` + FE hardcode label/badge/`Select` (divergent `early_leave`/`on_leave`); **no** Nest table; **no** catalog assert on `createRecord` | Nest **`att_attendance_code`** via **F-ATT-CAT-CODE/EFF**; Settings REF merge-read only |
| Admin create | N/A (enum ceiling) | **F-ATT-CAT-CODE-02** open N+1 (**01d**) |
| Consumer | Attendance record `status`; invent not sealed KEY | Assert ∈ Nest EFF when >0 → **`HRM-ATT-CODE-KEY`** |
| Aggregate | Hardcoded `present`→standard · `leave`→paid/unpaid via `isUnpaidLeaveTypeKey` | **RETAIN sealed code** GĐ1; typed flags physical for **GĐ2** only |
| Leave / worksite / shifts | Separate Nest/ops SoTs LIVE sealed | **SEPARATE SEAL RETAIN** — **FORBIDDEN** fold / reopen |
| Honesty | Risk flip attendance/payroll / invent module ATT UAT | Flags **false** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest/EFF code active **>0** | Consumer SoT = picker/FK `status`/day-code ∈ effective | Invent → **4xx** `HRM-ATT-CODE-KEY` |
| **BR-PLT-04** | Retire / `archived_at` / `active=false` | Soft-delete | Picker default ẩn; past `attendance_records.status` còn (**history**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on F-ATT-CAT-CODE-02 |
| **BR-PLT-06** | Dual SoT | Nest tenant writer = SoT; Settings `attendance_codes` = REF merge-read; Nest wins collision | **FORBIDDEN** dual master write / MD sole SoT |
| **L-ATT-CODE-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-CODE-02** | Code SoT | Nest `att_attendance_code` | Settings MD alone / FE/DTO closed enum sole when EFF>0 **REJECT** |
| **L-ATT-CODE-03** | Settings REF | Merge-read only | **FORBIDDEN** sole SoT |
| **L-ATT-CODE-04** | Admin open | CREATE N+1 | **FORBIDDEN** restore `@IsIn(4)` as product ceiling |
| **L-ATT-CODE-05** | Consumer invent | Membership ∈ EFF | Format-only **không** bypass |
| **L-ATT-CODE-06** | Active count =0 | Soft empty + CTA · invent skip | **FORBIDDEN** seed / hardcode-as-SoT claim when EFF later >0 |
| **L-ATT-CODE-07** | Counting / LIST-TOTALS | Sealed code GĐ1 | **FORBIDDEN** rewrite aggregate this seat · flags = physical GĐ2 only |
| **L-ATT-CODE-08** | Orthogonal | ≠ leave · ≠ shifts · ≠ work-sites · ≠ emp status | **FORBIDDEN** fold / dual master |
| **L-ATT-CODE-09..14** | Seals / honesty / soft-delete / scope / display / mega-EAV | OUT / RETAIN / false / U19 / display-ready / DENY | See §8 |

---

## 3. ATT attendance-code business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-CODE-01** | Surface = **catalog admin** (`POST/PUT` F-ATT-CAT-CODE-02) | Cho phép `code` mới hợp lệ slug (N+1) + typed flags | **2xx/201** · list + F5 còn — **không** «must pick existing only» |
| **BR-PLT-ATT-CODE-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | Body/field `status` (day-code) **phải** ∈ effective active | Ngoài set → **`HRM-ATT-CODE-KEY`** — format-only **không** bypass |
| **BR-PLT-ATT-CODE-03** | EFF active **=0** trên consumer | Soft empty picker + VI/CTA «Cài đặt → Ký hiệu công»; invent assert **skip**; admin vẫn CREATE | Seed/fake rows / FE hardcode-as-SoT claim = **FAIL U65** |
| **BR-PLT-ATT-CODE-04** | Settings MD / REF `attendance_codes` | Merge-read into EFF only | **FORBIDDEN** sole SoT cho consumer picker khi Nest live |
| **BR-PLT-ATT-CODE-05** | Retire code còn history | Soft-delete; consumer **không** chọn retired trên create mới | History record cũ vẫn đọc được key + symbol/label safe fallback |
| **BR-PLT-ATT-CODE-06** | Display list/get | Prefer catalog `symbol` + `name_vi` → `status_label` when known | FE **cấm** invent join label khi BE provides (**L-ATT-CODE-13**) · hardcode map **chỉ** EFF=0 bootstrap |
| **BR-PLT-ATT-CODE-07** | FE AS-IS keys `early_leave` / `on_leave` | Must map to catalog codes **or** be retired from Select when EFF>0 | Divergent hardcode keys BE rejects = **FAIL** AC-PLT-ATT-CODE-01f |
| **BR-PLT-ATT-CODE-08** | Closed DTO `@IsIn(4)` ceiling | ba-data/BE **EXPAND** drop closed enum as product ceiling | **FORBIDDEN** reintroduce as product ceiling after DATA |
| **BR-PLT-ATT-CODE-09** | `att-timesheet-line-aggregate` / payroll LIST-TOTALS | Counting semantics **RETAIN sealed code** GĐ1 | **FORBIDDEN** claim this seat rewires counting · GĐ2 flag wiring = residual |
| **BR-PLT-ATT-CODE-10** | Typed flags on catalog row | Persist `counts_as` / `day_weight` / `is_paid` / `is_present` physical | Flags **not** free-JSON SoT; **not** consumed by aggregate until GĐ2 |
| **BR-PLT-ATT-CODE-11** | Day-code `leave` + leave sub-type | Day-code set ≠ leave sub-type set; `leave` day-code may *reference* `leave_type_key` via existing funnel | **FORBIDDEN** fold attendance-code into `att_leave_type` |
| **BR-PLT-ATT-CODE-12** | `work_shifts` / `attendance_work_sites` | Orthogonal SoTs | **FORBIDDEN** fold / treat as day-code duplicate |
| **BR-PLT-ATT-CODE-13** | ba-data | Nest **absent** | **UNLOCK ADD** `att_attendance_code` — **FORBIDDEN** mega-EAV / second ATT mega table |
| **BR-PLT-ATT-CODE-14** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| **AC-PLT-ATT-LEAVE-01*** | **SEAL RETAIN** — leave sub-type SoT · **≠** day-code · **cấm reopen** |
| **AC-PLT-ATT-WORKSITE-01*** | **SEAL RETAIN** — geofence · **≠** day-code · **cấm reopen** |
| **AC-PLT-EMP-STATUS-01*** | Named peer pattern (DEFINE Nest + semantics stay code) — **cite ≠ copy** · **RETAIN** |
| EMP dept/pos/custom/token-ext stamps | **SEAL RETAIN** — **cấm reopen** |
| SI type/insurer · CTR | **SEAL RETAIN** |
| BA-01 §2.6 | Closed **counting semantics** OK in code; **allowed day-code list + symbol/label** = **open catalog** |

**SUPERSEDED / FORBIDDEN:** Option A Settings-MD-only picker SoT · Option C hybrid/mega-EAV/fold/aggregate-rewrite/UAT invent · invent `attendance_uat_ready=true` / `payroll_e2e_ready=true` · reopen leave/worksite/sign/J-06c/EMP/SI/CTR · claim module ATT UAT · hard-delete code còn history · restore `@IsIn(4)` ceiling · FE hardcode sole SoT when Nest EFF>0.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi EFF ≠ empty» / invent KEY áp **consumer rows** — **không** áp lên F-ATT-CAT-CODE-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class | SRS |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|-----|
| **S-ATT-CODE-ADM-01** | Nest attendance-code **admin** | Settings → **Ký hiệu công** (Nest panel — **ADD** after DATA/BE) | `code` open N+1 + typed flags | **F-ATT-CAT-CODE-02** | **ADMIN** | Catalog (BR-PLT-05) |
| **S-ATT-CODE-CNS-01** | **Bảng ghi công** — create/update record `status` (primary) | Chấm công → bản ghi / sheet grid (`AttendanceRecordsTable` AS-IS hardcode Select) | `status` (day-code) | POST/PATCH attendance records · assert ∈ EFF (**F-ATT-CODE-CNS-01**) | **CONSUMER** (primary) | **FR-UC-BP-ATT-01/02** |
| **S-ATT-CODE-CNS-02** | List/get **display** symbol / `status_label` | Records table badge/label | label/symbol from catalog | **F-ATT-CODE-CNS-02** | **CONSUMER display** | Display-ready |
| **S-ATT-CODE-REF-01** | Settings MD / group REF `attendance_codes` (future) | Settings Master Data | REF items | Merge-read into EFF only | **REF only** — **not** picker SoT | BR-PLT-06 |
| **S-ATT-CODE-OUT-01** | Leave-type Nest / Nghỉ phép create | LeaveTab · `att_leave_type` | `leave_type` | F-ATT-CAT-LVT/EFF | **OUT** · **SEAL RETAIN** ATT-LEAVE |
| **S-ATT-CODE-OUT-02** | Work-sites Nest / geofence | ATT CFG work-sites | `work_site_id` | F-ATT-CAT-WS-* | **OUT** · **SEAL RETAIN** |
| **S-ATT-CODE-OUT-03** | `work_shifts` ops | ATT CFG shifts | — | ADR D1 ops lock | **OUT** · **OPS LOCK** |
| **S-ATT-CODE-OUT-04** | Sheet close / sign / leave WAIVE / **J-HRM-06c** | Attendance sheet · inbox | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-CODE-OUT-05** | Timesheet aggregate / payroll LIST-TOTALS counting | `att-timesheet-line-aggregate` | present/leave counting | sealed code | **OUT rewrite** · **GĐ2 flag wiring residual** (**L-ATT-CODE-07**) |
| **S-ATT-CODE-OUT-06** | EMP dept/pos/status/custom/token-ext · SI · CTR | Peer packs | — | — | **OUT** · **SEAL RETAIN** |

**Pointer:** Load-only **UF-HRM-05** / **J-HRM-06** — **RETAIN**; mutate depth = proposed **J-HRM-ATT-CODE-CAT-*** — **cấm** claim attendance UAT from load-only.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-CODE-01** | Admin — CREATE Nest code N+1 | Settings Ký hiệu công → mã mới (vd. `CT`/`WFH`/`1_2`) + flags → Lưu **201** → list có row → **F5** còn → consumer picker thấy mã | Sửa label / symbol / flags / sort | Format invalid · UQ · scope 409 · «must pick only» sai áp |
| **UC-PLT-ATT-CODE-02** | Consumer — pick EFF day-code | EFF ≥1 → bảng ghi công → **picker** Network GET `…/attendance-codes/effective` → chọn mã → Lưu **2xx** → F5 · symbol/label đúng | Filter retired hidden | Free-text SoT · MD-only SoT · invent → **4xx** `HRM-ATT-CODE-KEY` · FE hardcode sole when EFF>0 · divergent `early_leave`/`on_leave` not in catalog |
| **UC-PLT-ATT-CODE-03** | Empty EFF | Active=0 → soft empty + CTA admin; invent skip; admin vẫn CREATE; bootstrap hardcode map **chỉ** EFF=0 | Optional REF sync CTA | Seed fake density / hardcode-as-SoT claim when Nest EFF>0 |
| **UC-PLT-ATT-CODE-04** | Soft-retire | Retire code → picker ẩn; record history vẫn đọc key | Reactivate if product allows | Hard-delete · wipe history |
| **UC-PLT-ATT-CODE-05** | Display reconcile | EFF>0 → badge/label từ catalog; Select options = EFF rows | EFF=0 bootstrap map | FE invent join · keep BE-rejected keys as sole options |
| **UC-PLT-ATT-CODE-06** | Scope parity | List EFF scope X = assert consumer scope X | Member 409 OOS | Drift list vs assert |
| **UC-PLT-ATT-CODE-07** | Counting non-claim | Aggregate/LIST-TOTALS behavior unchanged this seat | — | Any PR claiming GĐ1 aggregate rewrite = **FAIL process** |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings
  actor HR as HCNS_Cham_cong
  participant Nest as F_ATT_CAT_CODE
  participant Eff as F_ATT_CAT_CODE_EFF
  participant Rec as Attendance_Records_API

  Admin->>Nest: POST F-ATT-CAT-CODE-02 code N+1 (open + typed flags)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-ATT-CODE-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  HR->>Eff: GET attendance-codes/effective
  alt Active count = 0
    Eff-->>HR: Soft empty + CTA; invent skip; cấm seed
  else Active count > 0
    HR->>Rec: Luu ban ghi status
    alt status invent / OOS
      Rec-->>HR: 4xx HRM-ATT-CODE-KEY
    else OK
      Rec-->>HR: 2xx; F5 status + symbol/label ∈ catalog
    end
  end
  Note over Rec: leave / work-sites / sign / J-06c / aggregate RETAIN
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed ATT leave/worksite/sign/J-06c · EMP stamps · SI/CTR · PAY/LIST-TOTALS.  
> **BE HOLD** until DATA CONFIRMED — AC dưới đây = **gate cho unlock** execution (không claim LIVE trước Nest).

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-CODE-01** | **S-ATT-CODE-CNS-01** (primary) | EFF code active **≥1** (từ admin — **không** seed): mở **Chấm công → bảng ghi công** → UI = **picker** nguồn **Network GET** `/api/hrm/attendance/attendance-codes/effective` (path per F.1) → chọn mã Nest/EFF → Lưu **2xx** → list hiện đúng `status` + symbol/label → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings MD · FE hardcode sole SoT khi EFF>0 · 2xx với mã không ∈ EFF · chỉ API PASS |
| **AC-PLT-ATT-CODE-01b** | **S-ATT-CODE-CNS-01** invent | EFF **≥1**: cố ý nhập/POST `status` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-ATT-CODE-KEY`** (alias `HRM-ATT-CODE-UNKNOWN`) → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · nhầm KEY với `HRM-LEAVE-TYPE-UNKNOWN` / EMP KEY |
| **AC-PLT-ATT-CODE-01c** | Consumers khi EFF **=0** | Soft empty picker + VI/CTA Settings **Ký hiệu công**; invent assert **skip**; **không** fake starter chỉ để pass UF; admin **S-ATT-CODE-ADM-01** vẫn CREATE được; bootstrap label map **chỉ** khi EFF=0 — **cấm** claim hardcode / closed `@IsIn(4)` = SoT | Seed/script density · fake rows · hardcode-as-SoT khi Nest EFF later live · MD-only «green» khi Nest/EFF=0 |
| **AC-PLT-ATT-CODE-01d** | **S-ATT-CODE-ADM-01** | Catalog admin CREATE mã **#N+1** (slug hợp lệ, vd. `CT`/`WFH`/`half_day`) + typed flags → Network **2xx/201** `F-ATT-CAT-CODE-02` → list có row → **F5** còn → consumer picker thấy mã — **không** reject «must pick existing only» · **không** restore closed enum ceiling | Áp invent ban lên admin · ceiling starter 4 mã · reject N+1 |
| **AC-PLT-ATT-CODE-01e** | Soft-retire | Soft-retire code → default picker **ẩn** mã · history record vẫn đọc key / safe label · create mới **không** chọn retired | Hard-delete · wipe history · picker vẫn show retired as default |
| **AC-PLT-ATT-CODE-01f** | Display / FE reconcile | EFF>0: Select/badge/`status_label` từ catalog EFF; **không** giữ `early_leave`/`on_leave` (hoặc bất kỳ key BE-rejected) làm sole hardcode SoT; EFF=0 bootstrap map OK | Divergent hardcode sole SoT · invent FE join label khi BE provides |
| **AC-PLT-ATT-CODE-01H** | Honesty / seals | Evidence ghi rõ: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT leave/worksite/sign/**J-HRM-06c** **SEAL RETAIN** · EMP **`EMPDEPTQA-MSK3VVXX`** · **`EMPPOSQA2-MSK3CDH1`** · **`EMPSTQA-MSK20G7H`** · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1`** · SI/CTR · PAY/LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** module ATT UAT · **DENY** fold leave/worksite/shifts · **DENY** Settings MD sole SoT · **DENY** mega-EAV · **DENY** aggregate rewrite · closed IsIn drop = DATA/BE residual (not BA flip) | Flip ready · reopen seals · invent ATT UAT · claim Phase1 · fold · rewrite aggregate |

### 6.2 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-CODE-CNS-01** | Record **S-ATT-CODE-CNS-01** | `status` OOS khi EFF >0 | **4xx** `HRM-ATT-CODE-KEY` | AC-PLT-ATT-CODE-01b · BR-PLT-ATT-CODE-02 | **MIGRATE** after DATA+BE — replace closed IsIn / no-assert |
| **VAL-ATT-CODE-CNS-02** | Admin **S-ATT-CODE-ADM-01** | CREATE code N+1 open | **2xx/201** · F5 · picker sees code | AC-PLT-ATT-CODE-01d · BR-PLT-05 | Admin ≠ consumer invent ban |
| **VAL-ATT-CODE-CNS-03** | Scope | List EFF scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-ATT-CODE-12 · U19 | After Nest: list↔assert same resolver |
| **VAL-ATT-CODE-CNS-04** | Soft-retire | Create với mã retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · AC-PLT-ATT-CODE-01e · BR-PLT-ATT-CODE-05 | After Nest soft-delete |
| **VAL-ATT-CODE-CNS-05** | Empty EFF | EFF=0 · invent unknown status | Assert **skip** · soft empty + CTA · **no seed** | AC-PLT-ATT-CODE-01c · L-ATT-CODE-06 | Bootstrap map OK only EFF=0 |
| **VAL-ATT-CODE-CNS-06** | Settings-only / FE hardcode SoT | FE bind MD hoặc hardcode **without** Nest EFF when EFF >0 | **FAIL** AC-PLT-ATT-CODE-01 / 01f | L-ATT-CODE-02 · BR-PLT-ATT-CODE-04/07 | **GAP FE** rebind EFF · reconcile divergence |
| **VAL-ATT-CODE-CNS-07** | Closed DTO IsIn residual | Persist open slug (e.g. `CT`/`WFH`) after DATA | **No** DTO `@IsIn(4)` reject as product ceiling | BR-PLT-ATT-CODE-08 · L-ATT-CODE-04 | **ba-data/BE DROP** closed enum ceiling — residual until DATA+BE |
| **VAL-ATT-CODE-CNS-08** | Display | List/get when status ∈ catalog | `symbol` + `status_label` from catalog (or safe fallback) | BR-PLT-ATT-CODE-06 · L-ATT-CODE-13 | BE display-ready · FE không invent join |
| **VAL-ATT-CODE-CNS-09** | KEY taxonomy | Invent day-code vs invent leave-type / EMP KEY | Day-code → **`HRM-ATT-CODE-KEY`**; leave keep `HRM-LEAVE-TYPE-UNKNOWN` — **không** lẫn | L-ATT-CODE-08 | Regression orthogonal KEY |
| **VAL-ATT-CODE-CNS-10** | Aggregate non-claim | Diff this seat includes aggregate rewrite | **FAIL process** / QA residual | L-ATT-CODE-07 · BR-PLT-ATT-CODE-09 | GĐ2 only — typed flags physical OK |

### 6.3 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-ATT-LEAVE-01** | ATT leave AC/GWC **SEAL RETAIN** · `att_leave_type` untouched as day-code SoT | Fold day-code into leave-type / reopen leave suite |
| **MK-ATT-WS-01** | ATT work-sites GWC **SEAL RETAIN** | Fold into work-sites / reopen |
| **MK-ATT-SHIFT-01** | `work_shifts` ops lock — not folded | Treat shifts as attendance-code duplicate |
| **MK-ATT-WAIVE-01** | Leave WAIVE / sheet-sign / **J-HRM-06c** **SEAL RETAIN** | Reopen without warrant |
| **MK-ATT-AGG-01** | `att-timesheet-line-aggregate` + LIST-TOTALS counting **RETAIN sealed code** GĐ1 | Rewrite aggregate this seat / claim payroll ready |
| **MK-EMP-SEAL-01** | EMP **`EMPDEPTQA-MSK3VVXX`** · **`EMPPOSQA2-MSK3CDH1`** · **`EMPSTQA-MSK20G7H`** · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1`** **SEAL RETAIN** | Reopen EMP seals |
| **MK-SI-CTR-01** | SI type/insurer · CTR seals **RETAIN** | Reopen peer seals |
| **MK-HONESTY-01** | attendance / payroll **false** | Flip flags |
| **MK-COUNT-GRAPH-01** | Counting semantics may remain code | Claim this seat = payroll aggregate rewrite |

### 6.4 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-ATT-CODE-CAT-01`** | Admin CREATE code N+1 → F5 → record picker thấy mã (**01d** → **01**) | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-ATT-CODE-CAT-02`** | Invent day-code trên bản ghi → 4xx `HRM-ATT-CODE-KEY` (**01b**) | U65 browser |
| **Proposed `J-HRM-ATT-CODE-CAT-03`** | EFF=0 soft empty + CTA · admin still CREATE (**01c**) | zero-seed |
| **Proposed `J-HRM-ATT-CODE-CAT-04`** | Soft-retire → picker ẩn · history OK (**01e**) | |
| **Proposed `J-HRM-ATT-CODE-CAT-05`** | Display reconcile · no divergent hardcode sole SoT (**01f**) | |
| Reuse | **UF-HRM-05** · **J-HRM-06** / **J-HRM-06b** / **J-HRM-06c** | Load / sheet / sign — **RETAIN**; **cấm** reopen / claim UAT |
| Cross-nav U19 | Record list→detail · F5 · status label | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-ATT-CODE-KEY`** (alias **`HRM-ATT-CODE-UNKNOWN`**) | Consumer invent / OOS `status`/day-code khi EFF active >0 | **4xx** | Banner/field VI — không toast success · không persist |
| `HRM-PLT-CAT-CODE-INVALID` | Admin format only | 4xx | Admin form |
| `HRM-PLT-CAT-CODE-CONFLICT` | Admin UQ `(company_id, lower(code))` active | 4xx | Admin form |
| Peer `HRM-LEAVE-TYPE-UNKNOWN` | Leave invent (orthogonal) | 4xx | **MUST NOT** synonym day-code invent |
| Peer EMP invent KEYs | Orthogonal | 4xx | **MUST NOT** synonym |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan day-code; 500 trên invent; FE format-pass bỏ qua membership; nhầm ATT-CODE-KEY với LEAVE-TYPE-UNKNOWN; restore `@IsIn(4)` as product reject for open slug after DATA; claim aggregate rewrite PASS.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| ATT leave / work-sites / sign / **J-HRM-06c** | **SEAL RETAIN** — **DENIED** reopen |
| Module ATT UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| EMP stamps listed in meta | **SEAL RETAIN** — **DENIED** reopen |
| SI / CTR / PAY / LIST-TOTALS | **SEAL RETAIN** — **DENIED** reopen / aggregate rewrite |
| Settings MD sole SoT | **DENIED** |
| Mega-EAV / dual writers / fold leave·worksite·shifts | **DENIED** |
| Seed | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | Attendance-code catalog AC pack ≠ module ATT UAT |
| ba-data | **UNLOCK** parallel DATA-01 — ADD `att_attendance_code` + **DROP closed IsIn** residual note |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest SoT wording | **OPTIONAL** | ADD-only: «danh mục ký hiệu công chuẩn = Nest `att_attendance_code`; Settings ≠ sole SoT; ≠ loại phép» — **không** wipe leave/worksite FR |
| Journey rows J-HRM-ATT-CODE-CAT-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.4 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data EXPAND | **YES** parallel | Nest absent · closed DTO IsIn DROP residual |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA **CONFIRMED** · ensure parallel **DATA-01** completes · **HOLD BE** until DATA CONFIRMED · then unlock BE→FE→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.att_attendance_code` ICatalogRow (typed flags, UQ `(company_id, lower(code))` active, soft-delete) + EXPAND note dropping closed `@IsIn` DTO ceiling · **FORBIDDEN** mega-EAV / fold into `att_leave_type` · **no seed** | CONFIRMED DATA |
| **dev-be** | After BA+DATA: Nest ensureSchema + F-ATT-CAT-CODE + EFF · F-ATT-CODE-CNS KEY · drop closed IsIn · display symbol/`status_label` · jest VAL-ATT-CODE-CNS-* · **FORBIDDEN** aggregate rewrite | READY_FOR_QA |
| **dev-fe** | After BE: rebind `AttendanceRecordsTable` Select to Nest EFF; **REJECT** MD-alone / hardcode sole when EFF>0; reconcile `early_leave`/`on_leave`; empty soft+CTA | READY_FOR_QA |
| **qa** | U65 AC-PLT-ATT-CODE-01/01b/01c/01d/01e/01f/01H · VAL CNS · zero-seed · no attendance/payroll flip · seals untouched · no aggregate rewrite claim | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain · **C-SLICE-≠-MODULE** | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After Nest LIVE if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | FE `AttendanceRecordsTable` hardcode map + divergent keys | Allowed **only** EFF=0 bootstrap; **must** rebind Nest EFF when EFF>0 (**VAL-ATT-CODE-CNS-06** · **01f**) |
| R2 | BE closed `@IsIn(4)` vs richer FE keys | **Mandatory DROP** via DATA+BE (**VAL-ATT-CODE-CNS-07**) — residual until DATA |
| R3 | Aggregate still hardcodes `present`/`leave` | **L-ATT-CODE-07** intentional GĐ1 — flags physical for GĐ2; **no** sponsor decision needed for AC pack |
| R4 | Day-code `leave` vs leave-type sub-type | Orthogonal (**BR-PLT-ATT-CODE-11**) — existing `leave_type_key` funnel RETAIN |
| R5 | Confusion with work-sites / shifts | **L-ATT-CODE-08** · OUT surfaces §4 |
| Q1 | Exact Nest admin tab label VI | Dev-FE product copy — process: «Ký hiệu công» / «Mã chấm công» |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **UNLOCK** (parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01`) |
| **BE** | **HOLD** until BA **+** DATA CONFIRMED |
| **next_owner** | **pm** → seal BA · await/seal **ba-data** CONFIRMED → then **dev-be** (F-ATT-CAT-CODE + CNS KEY · drop closed IsIn · **no** aggregate rewrite) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-ba-01.md` |
