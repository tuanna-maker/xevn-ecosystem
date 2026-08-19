# BA AC/BR — ATT leave balance / accrual **rule schema** Option B · Nest `att_leave_accrual_policy` ≠ Settings sole · ≠ reopen leave-type L1 · engine LIVE HOLD

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · peer ba-data **DATA-01 CONFIRMED** (parallel) · BE **UNLOCK** for PM dispatch (BA+DATA both CONFIRMED) · F-ATT-LEAVE-04 accrue engine LIVE **HOLD** · `attendance_uat_ready` / `payroll_e2e_ready` / reopen ATT-LEAVE·CODE·WS·SHIFT L1 / invent FE HOLDs / Face / aggregate / mega-EAV / Settings-sole / flip ready **DENIED** |
| **change_mode** | **ADD** (deepen SA §5–§10 · **OWN** accrual/balance **rule** residual previously **OUT** of ATT-LEAVE BA **BR-PLT-ATT-LEAVE-08** · **no** wipe leave-type L1 · ATT-CODE/WS/SHIFT · EMP/SI/CTR/PAY · aggregate GĐ1) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) L-ATT-LVRULE-01..10 · F-ATT-LVRULE-* · §10 stubs |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 **Leave types / balance rules** · Catalog + Schema · GĐ1 deepen · **BR-PLT-02/04/05/06** |
| **ref_peer_att_leave** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md) Option **B** type catalog — **SEAL RETAIN** · **cite ≠ copy** · type invent **`HRM-LEAVE-TYPE-UNKNOWN`** · **BR-PLT-ATT-LEAVE-08** residual **OWNED here** |
| **ref_peer_pay_engine** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE — **cite** engine HOLD |
| **ref_peer_nest_absent** | EMP-STATUS / SI-INS Option **B** DEFINE Nest — **cite ≠ copy** (class: Nest ABSENT → physicalize) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-04/04b/05/05b/06/09** · Q-LEAVE-ACCRUAL / UNIT direction |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4b **`att_leave_accrual_policy`** → balance → hold |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-ATT-LEAVE-04 accrue outline · leave-types F-ATT-CAT-* RETAIN |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT leave-type L1 **SEAL RETAIN** · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · ATT-WS · ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** · FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) **RETAIN do not invent** · leave WAIVE/sign/**J-HRM-06c** · EMP/SI/CTR/PAY · aggregate GĐ1 / LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module ATT UAT · **DENY** accrue engine LIVE claim |
| **Cấm** | `apps/**` · seed · Settings/`attendance_rules` sole rule SoT · mega-EAV · reopen ATT-LEAVE/CODE/WS/SHIFT L1 invent KEY · invent FE HOLDs · Face/device · aggregate rewrite · flip attendance/payroll ready · claim F-ATT-LEAVE-04 LIVE · BE before BA+DATA · second leave-type / second mega ledger table |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED) — **Schema/CFG** deepen (**không** reopen leave-type catalog L1):

1. **Rule SoT** = Nest **`public.att_leave_accrual_policy`** versioned / effective-dated · soft FK **`leave_type_key` → sealed EFF `att_leave_type`** via **F-ATT-LVRULE-01..04** (**L-ATT-LVRULE-02/03** · DB §4.4b).
2. **Rule admin** = **open CREATE N+1** versioned policy rows bound to EFF type (**BR-PLT-05** · **AC-PLT-ATT-LEAVE-BAL-01d**) — **≠** consumer invent ban.
3. **Consumers** khi active policy cho type **>0** = picker/FK / published params only (**BR-PLT-02** · **AC-PLT-ATT-LEAVE-BAL-01**); invent `policy_id` / ad-hoc accrual mode|days → **`HRM-ATT-LVRULE-KEY`** (**01b**).
4. **Type invent** trên leave TXN vẫn **`HRM-LEAVE-TYPE-UNKNOWN`** — **RETAIN** ATT-LEAVE L1 (**01f** · **≠** LVRULE-KEY · **FORBIDDEN** reopen L1 invent pack).
5. Empty active policy → empty CTA / soft skip grant engine · **no seed** · admin vẫn CREATE (**01c** · U65).
6. Soft-retire policy → default resolve ẩn · ledger/history OK (**01e** · **BR-PLT-04**).
7. Panel/ledger **RETAIN**; khi catalog/policy EFF>0 panel types ⊆ EFF / policy-bound — **kill** closed MVP-five hardcode as sole SoT (**01g**).
8. **F-ATT-LEAVE-04** accrue job / component formula = **OUT LIVE** this wave (**L-ATT-LVRULE-08**) — schema + CRUD + resolve + KEY assert may ship without engine GO.
9. Settings MD `leave_types` = **REF type merge only**; `attendance_rules` = punch/GPS/standard — **FORBIDDEN** sole rule SoT (**Option A REJECT**).
10. **DENY** Face · aggregate rewrite · mega-EAV · Settings-sole · flip ready · reopen seals · invent FE HOLDs · module ATT UAT · Phase1 (**01H** · **`C-SLICE-≠-MODULE`**).

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings / ATT CFG — **Quy tắc quỹ / Accrual policy** (Nest admin — **ADD** after DATA/BE) | CRUD Nest `att_leave_accrual_policy` (mở N+1 versioned) · soft-retire · bind `leave_type_key` ∈ EFF |
| HCNS / NV / QL — tab **Nghỉ phép** | Chọn loại phép ∈ EFF (type RETAIN) · panel quỹ · hold; grant/adjust / policy-bound params khi policy active>0 |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Resolve effective policy · soft-delete hide · `HRM-ATT-LVRULE-KEY` · `HRM-LEAVE-TYPE-UNKNOWN` RETAIN · display-ready labels from EFF type |
| SA / ba-data / Dev-BE / Dev-FE / QA | F.1 · physical ADD · CRUD/resolve/KEY · admin/consumer surfaces · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-ATT-LEAVE-BAL-01 / 01b / 01c / 01d / 01e / 01f / 01g / 01H** · **VAL-ATT-LVRULE-CNS-*** · BR-PLT-ATT-LVRULE-* · surface matrix + UF/J-* | Impl `apps/**` / migration / seed |
| Enumerate: Settings/ATT policy admin · leave create/hold · panel · grant/adjust if in-scope | Claim module ATT UAT · flip `attendance_uat_ready` / `payroll_e2e_ready` · claim accrue engine LIVE |
| Cross-ref **AC-PLT-ATT-LEAVE-01*** as **RETAIN** (type) vs this pack (rules) · OWN **BR-PLT-ATT-LEAVE-08** residual | Reopen ATT-LEAVE/CODE/WS/SHIFT L1 invent KEY · invent FE HOLDs |
| ba-data **UNLOCK** pointer (Nest policy ABSENT · optional ledger EXPAND) | Second `att_leave_type` · mega-EAV · Face · aggregate rewrite |
| Align BA-01 §2.1 Catalog+Schema · SA Option B · PAY engine HOLD cite | Wipe leave-type L1 GWC · WAIVE/sign/J-06c |

**Numbering note (peer align):** SA §10 stub IDs preserved; **01**=bind/resolve when policy active · **01b**=invent LVRULE-KEY · **01c**=empty policy · **01d**=admin CREATE N+1 · **01e**=soft-retire · **01f**=type invent RETAIN · **01g**=panel types · **01H**=honesty.

---

## 1. As-is vs to-be

| | AS-IS (SA evidence) | TO-BE (Option B · this pack) |
|---|---------------------|------------------------------|
| Type catalog | Nest `att_leave_type` L1 **SEALED** + F-ATT-CAT-EFF | **SEAL RETAIN** — type SoT · **not** rewritten |
| Accrual rule schema | Nest `att_leave_accrual_policy` **ABSENT**; residual OUT of leave-type BA | Nest versioned policy = **rule SoT** · F-ATT-LVRULE-* |
| Ledger | `employee_leave_balances` entitled/used/pending LIVE | **RETAIN**; optional EXPAND `carried_in`/`advanced` via ba-data if gap |
| Panel | GET leave-balance/panel · `MVP_LEAVE_BALANCE_TYPES` hardcode 5 | Panel types ⊆ EFF/policy-bound when catalog>0 (**01g**) |
| Attendance rules | `attendance_rules` punch/GPS/standard LIVE | **≠** accrual SoT — **OUT** as sole |
| Settings leave_types | Group REF merge into EFF | **REF type only** — **≠** rule SoT |
| Accrue job | F-ATT-LEAVE-04 outline · Q-LEAVE-ACCRUAL partial | **HOLD LIVE** — schema may ship without evaluator GO |
| Honesty | Risk flip attendance/payroll / reopen L1 / invent FE HOLD | Flags **false** · seals/FE HOLDs **RETAIN** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Active policy for type **>0** | Consumer SoT = picker/FK / published policy params | Invent → **4xx** `HRM-ATT-LVRULE-KEY` |
| **BR-PLT-04** | Retire / `status=retired` / `archived_at` | Soft-delete | Default resolve ẩn; ledger/history còn |
| **BR-PLT-05** | Admin CREATE policy | Open N+1 versioned · soft FK type ∈ EFF · format/UQ/window only | **FORBIDDEN** ceiling / treat admin as invent KEY |
| **BR-PLT-06** | Dual SoT | Nest policy = rule SoT; Settings `leave_types` = type REF merge only | **FORBIDDEN** dual master write / MD / `attendance_rules` sole rule SoT |
| **L-ATT-LVRULE-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-LVRULE-02** | Rule SoT | Nest `att_leave_accrual_policy` | Settings / company-settings KV / `attendance_rules` sole **REJECT** |
| **L-ATT-LVRULE-03** | Bound to type | `leave_type_key` ∈ EFF (or retired-allowed history) | Orphan type on admin write → **4xx** · **FORBIDDEN** invent type via policy |
| **L-ATT-LVRULE-04** | Version / effective | Non-overlapping window **or** single active + retired history | Soft-retire · **FORBIDDEN** hard-delete when ledger/history refs |
| **L-ATT-LVRULE-05** | Consumer invent rule | Membership ∈ published policy | Format-only **không** bypass → **`HRM-ATT-LVRULE-KEY`** |
| **L-ATT-LVRULE-06** | Type invent | Leave TXN `leave_type` | **`HRM-LEAVE-TYPE-UNKNOWN`** RETAIN · **≠** reopen L1 |
| **L-ATT-LVRULE-07** | Active policy =0 | Soft empty CTA · invent skip · admin CREATE OK | **FORBIDDEN** seed |
| **L-ATT-LVRULE-08** | Accrue engine | Outline HOLD | **FORBIDDEN** claim LIVE / UAT GO from this AC |
| **L-ATT-LVRULE-09** | Scope | list ↔ get-by-id ↔ resolve ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **L-ATT-LVRULE-10** | Seals / honesty | OUT / RETAIN / false | See §8 |

---

## 3. ATT leave-balance / accrual-rule business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-LVRULE-01** | Surface = **rule admin** (`POST/PUT` F-ATT-LVRULE-02/03) | Cho phép policy row N+1 versioned · `leave_type_key` ∈ EFF · open fields trong A3 set (`accrual_mode`, `annual_days`, `unit`, carry expire, flags) | **2xx/201** · list + F5 còn — **không** «must pick existing policy only» |
| **BR-PLT-ATT-LVRULE-02** | Surface ∈ **consumer set** (§4) **và** active policy count for type **>0** | Body `policy_id` / accrual mode|days / grant params **phải** ∈ published EFF policy for that type | Ngoài set → **`HRM-ATT-LVRULE-KEY`** — format-only **không** bypass |
| **BR-PLT-ATT-LVRULE-03** | Active policy count **=0** for type | Soft empty CTA Settings/ATT CFG policy · soft skip grant engine · invent assert **skip**; admin vẫn CREATE | Seed/fake density = **FAIL U65** |
| **BR-PLT-ATT-LVRULE-04** | Settings MD / `attendance_rules` / company-settings KV | Type REF merge only · punch/GPS ops | **FORBIDDEN** sole rule SoT |
| **BR-PLT-ATT-LVRULE-05** | Leave TXN `leave_type` invent | Assert ∈ EFF leave types (**RETAIN** ATT-LEAVE) | **`HRM-LEAVE-TYPE-UNKNOWN`** — **≠** LVRULE-KEY · **FORBIDDEN** reopen L1 invent AC |
| **BR-PLT-ATT-LVRULE-06** | **FR-UC-BP-ATT-05b** panel quỹ | Panel **đọc** ledger; types khi catalog>0 ⊆ EFF / policy-bound; **không** closed MVP-five sole SoT | Free-text type SoT panel · MVP hardcode sole when EFF open = **FAIL** (**01g**) |
| **BR-PLT-ATT-LVRULE-07** | **FR-UC-BP-ATT-09** hold khi nộp | Hold sau assert type ∈ EFF; policy gates (nếu active) trước invent rule params | Invent type → **UNKNOWN** trước hold; invent rule params → **LVRULE-KEY** |
| **BR-PLT-ATT-LVRULE-08** | Soft-retire policy còn ledger/history | Soft-delete; resolve default **không** chọn retired; `include_inactive` admin OK | Hard-delete orphans = **FAIL** |
| **BR-PLT-ATT-LVRULE-09** | F-ATT-LEAVE-04 accrue / component formula | Outline only this wave | **FORBIDDEN** claim engine LIVE / attendance UAT from schema AC |
| **BR-PLT-ATT-LVRULE-10** | Admin orphan `leave_type_key` | Reject 4xx (class membership — ba-data locks exact code) | **FORBIDDEN** invent type via policy seat |
| **BR-PLT-ATT-LVRULE-11** | ba-data | Nest policy **ABSENT** | **UNLOCK ADD** `att_leave_accrual_policy` · optional EXPAND ledger cols · **FORBIDDEN** second leave-type / mega-EAV / wipe ledger |
| **BR-PLT-ATT-LVRULE-12** | Scope | list ↔ resolve ↔ consumer assert | Same resolver (**U19**) |
| **BR-PLT-ATT-LVRULE-13** | Wire invent stamp | One wire code **`HRM-ATT-LVRULE-KEY`** | Alias `HRM-ATT-LEAVE-BAL-RULE-KEY` = OBS only — **không** dual runtime codes |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| **AC-PLT-ATT-LEAVE-01 / 01b / 01c / 01d / 01H** | **SEAL RETAIN** — type SoT · invent **`HRM-LEAVE-TYPE-UNKNOWN`** · **cấm reopen** L1 |
| **BR-PLT-ATT-LEAVE-08** (prior OUT) | **OWNED** — accrual **policy admin + rule invent** = this pack |
| **AC-PLT-ATT-LEAVE-05b / 09** (panel/hold) | **RETAIN** type picker bind · **deepen** panel types (**01g**) + optional rule gates |
| ATT-CODE **`ATTCODEQA-MSK4T1A5`** · ATT-WS · ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** | **SEAL RETAIN** — **≠** fold · **cấm reopen** L1 |
| FE HOLDs ATT-CODE FE · ATT-SHIFT CNS-02 | **RETAIN as named Conditions** — **cấm invent** as mandatory from this seat |
| PAY catalog ≠ formula LIVE | Named peer — **cite** engine HOLD |
| EMP-STATUS / SI-INS Nest DEFINE | Class peer — **cite ≠ copy** |

**SUPERSEDED / FORBIDDEN:** Option A Settings-sole · Option C hybrid/mega-EAV/reopen L1/invent FE HOLD/flip ready/aggregate rewrite/engine LIVE as this AC · invent `attendance_uat_ready=true` / `payroll_e2e_ready=true` · reopen ATT-LEAVE/CODE/WS/SHIFT L1 · claim module ATT UAT · hard-delete policy còn history · second leave-type table.

---

## 4. Consumer / admin surface inventory (authoritative)

> **Admin ≠ consumer.** AC invent KEY / picker-when-active áp **consumer rows** — **không** áp lên F-ATT-LVRULE-02 admin CREATE.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class | SRS |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|-----|
| **S-ATT-LVRULE-ADM-01** | Nest accrual **policy admin** CRUD | Settings / ATT CFG → **Quy tắc quỹ phép / Accrual policy** (Nest panel — **ADD** after DATA/BE) | policy open N+1 · `leave_type_key` ∈ EFF · version/effective | **F-ATT-LVRULE-02/03** | **ADMIN** | **FR-UC-BP-ATT-04** |
| **S-ATT-LVRULE-ADM-02** | Policy list / resolve preview | Same admin · GET list + effective | display-ready + type label | **F-ATT-LVRULE-01/04** | **ADMIN-READ** | FR-UC-BP-ATT-04 |
| **S-ATT-LVRULE-CNS-01** | **Nghỉ phép — Tạo yêu cầu** (type + optional policy gates) | Chấm công → **Nghỉ phép** (`LeaveTab`) create | `leave_type` ∈ EFF (**RETAIN**); policy params nếu gated | POST leave-requests · type UNKNOWN RETAIN · rule KEY if invent params | **CONSUMER** (primary TXN) | FR-UC-BP-ATT-04b/05/09 |
| **S-ATT-LVRULE-CNS-02** | **Panel quỹ phép** | Same create dialog (`leave-balance-panel` / by-type) | Bind type from picker · ledger read · types ⊆ EFF/policy-bound when >0 | GET leave-balance / panel (**RETAIN** + **01g**) | **CONSUMER-READ** | **FR-UC-BP-ATT-05b** |
| **S-ATT-LVRULE-CNS-03** | **Hold quỹ** khi Gửi | Same create submit | Hold after type assert (+ policy gate if active) | Create TXN hold (**FR-UC-BP-ATT-09**) | **CONSUMER** (same TXN) | **FR-UC-BP-ATT-09** |
| **S-ATT-LVRULE-CNS-04** | **Grant / adjust / manual entitle** (nếu UF in-scope) | ATT CFG / leave balance admin grant (when product surface exists) | `policy_id` / mode|days ∈ published when policy>0 | Grant/adjust mutate · **F-ATT-LVRULE-CNS-01** | **CONSUMER** (mutate) | FR-UC-BP-ATT-04/06 |
| **S-ATT-LVRULE-CNS-05** | Accrue job bind (API/job only) | `POST …/leave-balances/accrue` | Bind published policy → ledger.entitled | **F-ATT-LEAVE-04** | **ENGINE HOLD** — outline only · **OUT LIVE GO** | FR-UC-BP-ATT-04 |
| **S-ATT-LVRULE-REF-01** | Settings MD `leave_types` | Settings Master Data | REF type items | Merge-read into EFF type only | **REF type** — **≠** rule SoT | BR-PLT-06 |
| **S-ATT-LVRULE-REF-02** | `attendance_rules` | ATT CFG punch/GPS/standard days | OPS | — | **OPS ≠ accrual SoT** | — |
| **S-ATT-LVRULE-OUT-01** | Leave-type Nest admin | Settings **Loại phép ATT** | `leave_type_key` | F-ATT-CAT-LVT-* | **OUT** · **SEAL RETAIN** ATT-LEAVE L1 |
| **S-ATT-LVRULE-OUT-02** | ATT-CODE / WS / SHIFT L1 | Day-code · work-sites · shifts | — | — | **OUT** · **SEAL RETAIN** · **cấm reopen** |
| **S-ATT-LVRULE-OUT-03** | Sheet close / sign / leave WAIVE / **J-HRM-06c** | Attendance sheet · inbox | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-LVRULE-OUT-04** | Face / device / punch hardware | Mobile punch | — | — | **OUT** |
| **S-ATT-LVRULE-OUT-05** | Timesheet aggregate / LIST-TOTALS | `att-timesheet-line-aggregate` | — | sealed code | **OUT rewrite** · **SEAL RETAIN** |
| **S-ATT-LVRULE-OUT-06** | FE HOLDs ATT-CODE FE · ATT-SHIFT CNS-02 | Named Conditions | — | — | **OUT invent** — **RETAIN HOLD** |
| **S-ATT-LVRULE-OUT-07** | EMP / SI / CTR / PAY seals | Peer packs | — | — | **OUT** · **SEAL RETAIN** |

**Pointer:** Load-only **UF-HRM-05** / **J-HRM-06** / leave WAIVE **J-HRM-06c** — **RETAIN**; mutate depth = proposed **J-HRM-ATT-LVRULE-*** — **cấm** claim attendance UAT from load-only or schema slice.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-LVRULE-01** | Admin — CREATE policy N+1 | Settings/ATT CFG policy → chọn `leave_type_key` ∈ EFF → điền mode/days/unit/version → Lưu **201** → list có row → **F5** còn → resolve effective thấy row | Sửa annual_days / effective window / soft-retire | Orphan type 4xx · window conflict · scope 409 · «must pick only» sai áp admin · Settings-sole write |
| **UC-PLT-ATT-LVRULE-02** | Consumer — bind published policy | Policy active≥1 for type → leave/grant path dùng published params / `policy_id` ∈ EFF → **2xx** · F5 | Resolve as-of date | Invent params/`policy_id` → **4xx** `HRM-ATT-LVRULE-KEY` |
| **UC-PLT-ATT-LVRULE-03** | Type invent RETAIN | Leave create invent `leave_type` → **4xx** `HRM-LEAVE-TYPE-UNKNOWN` | — | Conflate with LVRULE-KEY · reopen L1 invent pack |
| **UC-PLT-ATT-LVRULE-04** | Empty policy | Active=0 for type → empty CTA · soft skip engine · admin vẫn CREATE · **no seed** | Optional CTA to type catalog if type empty | Seed fake policy density |
| **UC-PLT-ATT-LVRULE-05** | Soft-retire | Retire → resolve default ẩn · ledger history OK · admin `include_inactive` | Reactivate if product allows | Hard-delete · wipe history |
| **UC-PLT-ATT-LVRULE-06** | Panel types | Catalog/policy EFF>0 → panel types ⊆ EFF/policy-bound · **không** MVP-five sole | EFF=0 bootstrap OK | Closed MVP hardcode sole SoT while EFF open |
| **UC-PLT-ATT-LVRULE-07** | Hold + policy gate | Submit hợp lệ → hold; invent type/rule blocked trước hold | Reject/cancel release **RETAIN** WAIVE seals | Hold với orphan type/rule |
| **UC-PLT-ATT-LVRULE-08** | Engine non-claim | Schema/CRUD/KEY ship without accrue LIVE | Outline F-ATT-LEAVE-04 cite | Any claim engine LIVE / UAT flip = **FAIL process** |
| **UC-PLT-ATT-LVRULE-09** | Scope parity | List/resolve scope X = assert consumer scope X | Member 409 OOS | Drift list vs resolve vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings_Policy
  actor Emp as NV_QL_Leave_Form
  participant Type as att_leave_type_EFF
  participant Pol as F_ATT_LVRULE
  participant Led as employee_leave_balances
  participant Cons as Leave_create_panel_hold

  Note over Type: SEAL RETAIN leave-type L1
  Admin->>Type: leave_type_key ∈ EFF (soft FK)
  Admin->>Pol: POST F-ATT-LVRULE-02 policy N+1 versioned
  alt Orphan type / window conflict / invent-ban sai áp admin
    Pol-->>Admin: 4xx / FAIL process
  else 201
    Pol-->>Admin: Row active; F5 còn
  end
  Emp->>Type: GET leave-types/effective (type picker RETAIN)
  Emp->>Pol: GET leave-accrual-policies/effective (when gated)
  alt Policy active = 0
    Pol-->>Emp: Soft empty CTA; invent skip; cấm seed
  else Policy active > 0
    Emp->>Cons: Submit leave / grant params
    alt leave_type invent
      Cons-->>Emp: 4xx HRM-LEAVE-TYPE-UNKNOWN (RETAIN)
    else policy_id / ad-hoc mode|days invent
      Cons-->>Emp: 4xx HRM-ATT-LVRULE-KEY
    else OK
      Cons->>Led: hold / read panel
      Cons-->>Emp: 2xx; F5; panel types ⊆ EFF
    end
  end
  Note over Cons: F-ATT-LEAVE-04 engine LIVE HOLD · WAIVE/sign/CODE/WS/SHIFT RETAIN
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed ATT-LEAVE L1 · ATT-CODE/WS/SHIFT · FE HOLDs · WAIVE/sign/J-06c · EMP/SI/CTR/PAY · aggregate.  
> **BE HOLD** until DATA CONFIRMED — AC = **gate unlock** execution (không claim Nest policy LIVE trước DATA+BE).  
> **Engine LIVE HOLD** — PASS schema AC **không** yêu cầu accrue job GO.

### 6.1 Core AC pack (SA §10 CONFIRMED)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-LEAVE-BAL-01** | **S-ATT-LVRULE-ADM-01/02** + resolve · consumer bind when policy≥1 | Active policy **≥1** for type (từ admin — **không** seed): admin/CFG + **Network** Nest **F-ATT-LVRULE-01/04** display-ready · consumer bind published params · **F5** row còn | Settings/`attendance_rules` sole SoT · free-text rule SoT · chỉ API PASS · MD density as rule SoT |
| **AC-PLT-ATT-LEAVE-BAL-01b** | **S-ATT-LVRULE-CNS-01/04** invent | Policy active **>0**: invent unknown `policy_id` / ad-hoc accrual mode\|days ngoài published row → FE chặn và/hoặc Network **4xx** **`HRM-ATT-LVRULE-KEY`** → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · nhầm KEY với `HRM-LEAVE-TYPE-UNKNOWN` |
| **AC-PLT-ATT-LEAVE-BAL-01c** | Consumers khi policy active **=0** for type | Soft empty CTA Settings/ATT CFG policy · soft skip grant engine · invent assert **skip** · **không** fake starter chỉ để pass UF · admin **S-ATT-LVRULE-ADM-01** vẫn CREATE | Seed/script density · fake policy rows · MD-only «green» |
| **AC-PLT-ATT-LEAVE-BAL-01d** | **S-ATT-LVRULE-ADM-01** | Admin CREATE policy **#N+1** versioned · `leave_type_key` ∈ EFF → Network **2xx/201** `F-ATT-LVRULE-02` → list có row → **F5** còn → resolve/consumer thấy — **không** reject «must pick existing only» · orphan type **4xx** | Áp invent ban lên admin · reject N+1 · accept orphan type without 4xx |
| **AC-PLT-ATT-LEAVE-BAL-01e** | Soft-retire | Soft-retire → default resolve **ẩn** · ledger/history OK · create/grant mới **không** chọn retired (default) · admin `include_inactive` OK | Hard-delete · wipe history · picker/resolve vẫn show retired as default sole |
| **AC-PLT-ATT-LEAVE-BAL-01f** | Type invent RETAIN | Leave TXN invent `leave_type` khi EFF type>0 → **4xx** **`HRM-LEAVE-TYPE-UNKNOWN`** · ATT-LEAVE L1 seals **RETAIN** · **không** reopen invent KEY seats · **không** synonym LVRULE-KEY | Reopen L1 invent pack · conflate UNKNOWN với LVRULE-KEY · wipe ATT-LEAVE AC |
| **AC-PLT-ATT-LEAVE-BAL-01g** | **S-ATT-LVRULE-CNS-02** panel | Catalog/policy EFF>0: panel type source ⊆ EFF leave types / policy-bound · **không** closed `MVP_LEAVE_BALANCE_TYPES` five-code sole SoT · ledger read **RETAIN** · F5 | MVP-five hardcode sole while EFF open · free-text type SoT panel · seed demo số |
| **AC-PLT-ATT-LEAVE-BAL-01H** | Honesty / seals | Evidence ghi rõ: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **no** engine LIVE claim · ATT leave-type L1 **SEAL RETAIN** · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · ATT-WS · ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** · FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) **RETAIN do not invent** · WAIVE/sign/**J-HRM-06c** · EMP/SI/CTR/PAY · aggregate GĐ1 **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** Face · mega-EAV · Settings-sole · fold into day-code/worksite/shift · module ATT UAT · Phase1 | Flip ready · reopen seals · invent FE HOLD · claim engine LIVE · claim module ATT UAT · Face · aggregate rewrite |

### 6.2 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-LVRULE-CNS-01** | Leave/grant mutate **S-ATT-LVRULE-CNS-01/04** | Invent rule params / unknown `policy_id` khi policy active>0 | **4xx** `HRM-ATT-LVRULE-KEY` | AC-PLT-ATT-LEAVE-BAL-01b · BR-PLT-ATT-LVRULE-02 | **MIGRATE** after DATA+BE |
| **VAL-ATT-LVRULE-CNS-02** | Admin vs consumer split | Admin CREATE N+1 **2xx**; same invent body on consumer **4xx** | Admin 2xx · consumer 4xx — **not** collapsed | AC-PLT-ATT-LEAVE-BAL-01d/01b · L-ATT-LVRULE-01 | Admin ≠ invent ban |
| **VAL-ATT-LVRULE-CNS-03** | Scope | List/resolve scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-ATT-LVRULE-09 · U19 | After Nest: list↔resolve↔assert same resolver |
| **VAL-ATT-LVRULE-CNS-04** | Soft-retire | Resolve/default pick retired | Reject / not in default; history/ledger còn | AC-PLT-ATT-LEAVE-BAL-01e · BR-PLT-04 | After Nest soft-delete |
| **VAL-ATT-LVRULE-CNS-05** | Empty policy | Policy=0 · invent unknown policy_id | Assert **skip** · soft empty + CTA · **no seed** | AC-PLT-ATT-LEAVE-BAL-01c · L-ATT-LVRULE-07 | U65 |
| **VAL-ATT-LVRULE-CNS-06** | Settings/`attendance_rules` sole SoT | FE/BE treat MD or attendance_rules as rule SoT when Nest policy exists | **FAIL** AC-PLT-ATT-LEAVE-BAL-01 | L-ATT-LVRULE-02 · BR-PLT-ATT-LVRULE-04 | Option A REJECT |
| **VAL-ATT-LVRULE-CNS-07** | Type invent orthogonal | Invent `leave_type` on leave TXN | **4xx** `HRM-LEAVE-TYPE-UNKNOWN` — **≠** LVRULE-KEY | AC-PLT-ATT-LEAVE-BAL-01f · AC-PLT-ATT-LEAVE-01b RETAIN | **RETAIN** leave-type assert · **cấm reopen** L1 |
| **VAL-ATT-LVRULE-CNS-08** | Panel types | EFF type/policy >0 · panel still MVP-five sole | **FAIL** AC-PLT-ATT-LEAVE-BAL-01g | BR-PLT-ATT-LVRULE-06 | FE/BE panel source deepen |
| **VAL-ATT-LVRULE-CNS-09** | Admin orphan type | POST policy `leave_type_key` ∉ EFF | **4xx** (class membership) | BR-PLT-ATT-LVRULE-10 · L-ATT-LVRULE-03 | ba-data locks exact code |
| **VAL-ATT-LVRULE-CNS-10** | Engine non-claim | Diff/evidence claims F-ATT-LEAVE-04 LIVE GO / UAT flip | **FAIL process** | L-ATT-LVRULE-08 · AC-PLT-ATT-LEAVE-BAL-01H | Outline only |
| **VAL-ATT-LVRULE-CNS-11** | Display-ready | List/get policy | Labels from EFF leave type join · no raw-key-only when name provided | AC-PLT-ATT-LEAVE-BAL-01 · display-ready | BE display-ready · FE không invent join |

### 6.3 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-ATT-LEAVE-L1-01** | ATT-LEAVE AC/GWC · `att_leave_type` invent **`HRM-LEAVE-TYPE-UNKNOWN`** **SEAL RETAIN** | Reopen L1 invent KEY seats / wipe AC-PLT-ATT-LEAVE-01* |
| **MK-ATT-CODE-01** | ATT-CODE **`ATTCODEQA-MSK4T1A5`** **SEAL RETAIN** · FE HOLD **RETAIN** | Reopen L1 · invent FE ATT-CODE HOLD |
| **MK-ATT-WS-01** | ATT work-sites **SEAL RETAIN** | Reopen / fold |
| **MK-ATT-SHIFT-01** | ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** L1 **SEAL RETAIN** · CNS-02 FE Condition **RETAIN** | Reopen L1 · invent FE SHIFT HOLD |
| **MK-ATT-WAIVE-01** | Leave WAIVE / sheet-sign / **J-HRM-06c** **SEAL RETAIN** | Reopen without warrant |
| **MK-ATT-AGG-01** | `att-timesheet-line-aggregate` + LIST-TOTALS **SEAL RETAIN** | Rewrite aggregate this seat |
| **MK-ATT-LEDGER-01** | `employee_leave_balances` + GET leave-balance/panel path **RETAIN** | Wipe ledger / dual mega balance table |
| **MK-EMP-SI-CTR-PAY-01** | EMP/SI/CTR/PAY seals **RETAIN** | Reopen peer seals |
| **MK-HONESTY-01** | attendance / payroll **false** · engine LIVE **HOLD** | Flip flags · claim engine GO |
| **MK-FE-HOLD-01** | ATT-CODE FE · ATT-SHIFT CNS-02 named HOLDs **RETAIN** | Invent as mandatory Tasks from this seat |

### 6.4 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-ATT-LVRULE-01`** | Admin CREATE policy N+1 bound EFF type → F5 → resolve sees row (**01d** → **01**) | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-ATT-LVRULE-02`** | Invent policy params / `policy_id` → 4xx `HRM-ATT-LVRULE-KEY` (**01b**) | U65 browser · grant or gated leave path |
| **Proposed `J-HRM-ATT-LVRULE-03`** | Policy=0 empty CTA · admin still CREATE · no seed (**01c**) | zero-seed |
| **Proposed `J-HRM-ATT-LVRULE-04`** | Soft-retire → resolve ẩn · ledger OK (**01e**) | |
| **Proposed `J-HRM-ATT-LVRULE-05`** | Leave invent type → **`HRM-LEAVE-TYPE-UNKNOWN`** RETAIN (**01f**) · orthogonal KEY | Cite ATT-LEAVE · **cấm reopen** L1 |
| **Proposed `J-HRM-ATT-LVRULE-06`** | Panel types ⊆ EFF/policy-bound · kill MVP-five sole (**01g**) · hold spot | Deepen FR-UC-BP-ATT-05b/09 |
| Reuse | **UF-HRM-05** · **J-HRM-06** / **J-HRM-06b** / **J-HRM-06c** · ATT-LEAVE proposed **J-HRM-ATT-LEAVE-CAT-*** | Load / sheet / sign / type catalog — **RETAIN**; **cấm** reopen / claim UAT |
| Cross-nav U19 | Policy list→detail · leave list→detail · F5 | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

**UF inventory (product labels — QA click path):**

| UF pointer | Click path (VI) | AC |
|------------|-----------------|-----|
| UF-ATT-LVRULE-ADM | Login → Settings/Cấu hình ATT → **Quy tắc quỹ phép** → Thêm → Lưu → F5 | 01d / 01 / 01e |
| UF-ATT-LVRULE-EMPTY | Same admin empty list + CTA · **no seed** | 01c |
| UF-ATT-LEAVE-CREATE | Chấm công → **Nghỉ phép** → Tạo → chọn loại ∈ EFF → panel → Gửi | 01f / 01g · type RETAIN |
| UF-ATT-LVRULE-INVENT | Grant/adjust hoặc gated body invent `policy_id`/mode | 01b |
| UF-ATT-LEAVE-PANEL | Open create → `leave-balance-panel` / by-type | 01g · cite prior ATT-03d-05b |

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-ATT-LVRULE-KEY`** | Consumer invent / OOS `policy_id` / ad-hoc accrual mode\|days khi policy active>0 | **4xx** | Banner/field VI — không toast success · không persist |
| **`HRM-LEAVE-TYPE-UNKNOWN`** | Consumer invent / OOS `leave_type` khi EFF type>0 | **4xx** | **RETAIN** · **MUST NOT** synonym LVRULE-KEY |
| Admin type orphan / window conflict | Policy admin `leave_type_key` ∉ EFF · overlapping version window | **4xx** | Admin form — ba-data/BE exact code |
| `HRM-PLT-CAT-CODE-INVALID` / CONFLICT class | Admin format / UQ if applied to policy slug | 4xx | Admin form |
| Scope mismatch | List/resolve/assert company ≠ token scope | 409 class | Honest empty/banner |
| Engine outline | Accrue job not LIVE | N/A this AC | **FORBIDDEN** claim GO |

**Cấm:** 2xx + orphan policy params; 500 trên invent; FE format-pass bỏ qua membership; nhầm LVRULE-KEY với LEAVE-TYPE-UNKNOWN / ATT-CODE-KEY / EMP KEYs; Settings-sole green; claim engine LIVE PASS.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| Accrue engine LIVE (F-ATT-LEAVE-04) | **HOLD / OUT** — schema ≠ engine GO |
| ATT leave-type L1 | **SEAL RETAIN** — **DENIED** reopen invent KEY |
| ATT-CODE **`ATTCODEQA-MSK4T1A5`** | **SEAL RETAIN** — **DENIED** reopen · FE HOLD **RETAIN** |
| ATT-WS / ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** | **SEAL RETAIN** — **DENIED** reopen · CNS-02 **RETAIN** |
| Leave WAIVE / sign / **J-HRM-06c** | **SEAL RETAIN** — **DENIED** reopen |
| Module ATT UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Face / device | **DENIED** |
| Aggregate / LIST-TOTALS rewrite | **DENIED** · **SEAL RETAIN** |
| Settings-sole / `attendance_rules` sole rule | **DENIED** (Option A REJECT) |
| Mega-EAV / dual writers / fold CODE·WS·SHIFT | **DENIED** |
| Invent FE HOLDs | **DENIED** |
| Seed | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | Leave-balance **rule schema** AC ≠ module ATT UAT |
| ba-data | **UNLOCK** parallel DATA-01 — ADD `att_leave_accrual_policy` (+ optional ledger EXPAND) |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. Column / validation matrix (ba-data handoff — process lock)

> Physical types/UQ/exact CHK = **ba-data** OWNER. BA locks **semantic** mandatory set + FAIL classes. Cite HOLD if DATA blocks BE.

| Field (semantic) | Admin CREATE | Consumer invent | Soft-retire | Notes |
|------------------|--------------|-----------------|-------------|-------|
| `company_id` | Scope required | Scope parity | — | U19 |
| `leave_type_key` | **Must** ∈ EFF active (or retired-allowed history on update) | N/A (type has own KEY) | History OK | Orphan → 4xx · **≠** invent type |
| `accrual_mode` | Open ∈ locked A3 set (ba-data enumerates; Q-LEAVE-ACCRUAL may stay partial) | Must match published row when policy>0 | — | Invent mode → LVRULE-KEY |
| `annual_days` / qty | Numeric ≥0 per BA/DATA | Must match published when gated | — | Ad-hoc days invent → LVRULE-KEY |
| `unit` | day\|hour (Q-LEAVE-UNIT) | ∈ published | — | |
| `allow_negative` / carry flags | Boolean · align type `allows_advance` / `allows_carry_over` when product requires | ∈ published | — | |
| `carry_over_expire_rule` | Text/rule key open per DATA | ∈ published | — | |
| `effective_from` / `effective_to` **or** `version`+`status` | Required versioning SM | Resolve as-of | Retire sets status | Overlap conflict → 4xx |
| `status` | active default | — | retired soft | **FORBIDDEN** hard-delete with refs |
| `policy_id` (consumer) | N/A | ∈ active published when count>0 | — | Unknown → **LVRULE-KEY** |
| Ledger `entitled/used/pending` | RETAIN | Read/hold TXN RETAIN | — | Optional EXPAND `carried_in`/`advanced` |
| Engine accrue evaluator | **OUT LIVE** | **OUT LIVE** | — | HOLD |

**DATA HOLD note for BE:** If DATA-01 not yet CONFIRMED → **cite HOLD** — **do not** unlock BE; this BA pack alone **≠** BE entry.

---

## 10. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest rule schema wording | **OPTIONAL** | ADD-only: «quy tắc quỹ/accrual versioned = Nest `att_leave_accrual_policy`; Settings/`attendance_rules` ≠ sole; ≠ reopen loại phép» — **không** wipe leave-type FR |
| Journey rows J-HRM-ATT-LVRULE-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.4 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data ADD | **YES** parallel | Nest policy ABSENT · optional ledger EXPAND |

---

## 11. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA **CONFIRMED** · ensure parallel **DATA-01** CONFIRMED · **HOLD BE** until **both** · then unlock BE→FE→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.att_leave_accrual_policy` (version/effective · soft FK `leave_type_key` · soft-retire · IX) + optional EXPAND ledger · **FORBIDDEN** second leave-type / mega-EAV / wipe · **no seed** | CONFIRMED DATA |
| **dev-be** | **HOLD** until BA+DATA: Nest ensureSchema + F-ATT-LVRULE-01..04 · F-ATT-LVRULE-CNS KEY · type UNKNOWN RETAIN · panel type source deepen · jest VAL-ATT-LVRULE-CNS-* · **FORBIDDEN** engine LIVE invent · aggregate rewrite · reopen L1 | READY_FOR_QA |
| **dev-fe** | After BE: Settings/ATT policy admin UI · consumer bind · empty CTA · panel types ⊆ EFF · **FORBIDDEN** invent FE HOLDs ATT-CODE/SHIFT | READY_FOR_QA |
| **qa** | U65 AC-PLT-ATT-LEAVE-BAL-01..01H · VAL CNS · zero-seed · no attendance/payroll flip · seals/FE HOLDs untouched · no engine LIVE claim | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain · **C-SLICE-≠-MODULE** | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §10 | After Nest LIVE if flagged |

---

## 12. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | Exact VI label for policy admin tab | Dev-FE product copy — process: «Quy tắc quỹ phép» / «Chính sách tích lũy phép» |
| R2 | Which consumer surfaces gate on policy vs type-only today | **CNS-01/03** type RETAIN always; **CNS-04** grant/adjust = primary LVRULE invent surface; leave create policy gate = **EXPAND when product body exposes params** |
| R3 | Q-LEAVE-ACCRUAL component formula partial | Schema keys lock without evaluator LIVE (**L-ATT-LVRULE-08**) — no sponsor block for AC pack |
| R4 | MVP panel five hardcode | **01g** mandatory kill as sole SoT when EFF open — FE/BE deepen after Nest |
| R5 | Confusion with leave-type L1 reopen | **01f** + **MK-ATT-LEAVE-L1-01** — rules pack ≠ type invent pack |
| R6 | DATA parallel not finished | **HOLD BE** — cite DATA block; do not wait in this BA seat |
| Q1 | Exact admin orphan-type error code string | ba-data/BE — class membership locked; wire invent consumer stamp = **`HRM-ATT-LVRULE-KEY`** only |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 13. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | Peer **CONFIRMED** (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01`) |
| **BE** | **UNLOCK** — PM may dispatch after BA **+** DATA both CONFIRMED |
| **next_owner** | **pm** → **dev-be** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-ba-01.md` |
