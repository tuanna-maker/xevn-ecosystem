# BA AC/BR — OT compensation_type open catalog Option B · Nest `att_ot_comp_type` DEFINE ≠ Settings sole · ≠ fold `att_ot_type` · formula LIVE HOLD

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · peer ba-data **DATA-01 UNLOCK** (parallel — do not wait this seat) · BE **HOLD** until BA **+** DATA CONFIRMED · payroll formula LIVE **HOLD** · `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready` / reopen OT-TYPE·CTR·ATT L1 / invent FE LVRULE 01g / Face / mega-EAV / Settings-sole / flip ready / fold into `att_ot_type` **DENIED** |
| **change_mode** | **ADD** (deepen SA §5–§8 stubs · **OWN** OT compensation residual · **orthogonal** to sealed OT-TYPE · **no** wipe OT-TYPE KEY · CTR KEY/clause · ATT leave-balance/CODE/WS/SHIFT/leave L1 · FE LVRULE 01g HOLD · EMP/SI/PAY/DEC) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md) L-ATT-OTC-01..16 · F-ATT-CAT-OTC-* · §7 stubs |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.3 ATT GĐ1 deepen · **BR-PLT-02/04/05/06** · Face/device **OUT** |
| **ref_peer_ot_type** | [`OT-TYPE-CATALOG-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md) · Nest `att_ot_type` LIVE KEY **`HRM-ATT-OT-TYPE-KEY`** — **cite ≠ copy** · **FORBIDDEN** fold compensation into OT type · **FORBIDDEN** reopen OT-TYPE L1 |
| **ref_peer_leave_balance** | Nest-ABSENT DEFINE Option B AC pattern — **cite ≠ copy** |
| **ref_peer_pay_engine** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE — **cite** · **FORBIDDEN** claim compensation catalog = payroll formula LIVE |
| **ref_peer_ctr** | CTR-TEMPLATE KEY LIVE · CTR-CLAUSE `body_vi` — **SEAL RETAIN** · **cấm reopen** |
| **ref_adr** | ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B · ADR-HRM-ATTENDANCE-CFG-PERSIST **D4** stub REF |
| **ref_srs** | FR-UC-BP-ATT / UC-HRM-ATT-OT · Đơn từ→Tăng ca LIVE TXN · compensation picker source SPEC_GAP → this pack |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · OT-TYPE KEY **SEAL RETAIN** · CTR KEY/clause **SEAL RETAIN** · ATT leave-balance / FE LVRULE 01g **HOLD RETAIN** (**DENY invent FE**) · ATT-CODE / WS / SHIFT / leave L1 **SEAL RETAIN** · EMP/SI/PAY/DEC/MergeToken **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module ATT/PAY UAT · **DENY** formula LIVE · **DENY** fold into `att_ot_type` |
| **Cấm** | `apps/**` · seed · Settings sole SoT · mega-EAV · fold into `att_ot_type`/day-code/leave/worksite/shifts · reopen OT-TYPE/CTR/ATT L1 · invent FE HOLDs · Face/device · rewrite aggregate · flip ready · claim formula LIVE · BE before BA+DATA · auto leave-funnel LIVE from compensatory_leave |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED) — Nest OT **compensation_type** open catalog **DEFINE** (AS-IS Nest **ABSENT** + FE closed-2 hardcode):

1. **Catalog SoT** = Nest **`public.att_ot_comp_type`** (ba-data may stamp synonym `att_overtime_comp_type` — **one** table) via **F-ATT-CAT-OTC-01** list/EFF · **F-ATT-CAT-OTC-02** mutate (**L-ATT-OTC-02**).
2. **Admin** = **open CREATE N+1** (`code` slug + `name_vi`) — starter `salary` / `compensatory_leave` = **bootstrap ≠ ceiling** (**BR-PLT-05** · **AC-PLT-ATT-COMP-01d**).
3. **Consumers** khi **EFF/active count >0** = picker/FK only (**BR-PLT-02** · **AC-PLT-ATT-COMP-01**); invent `compensation_type` ∉ scoped catalog → **`HRM-ATT-OT-COMP-KEY`** (**01b**).
4. Empty EFF → soft empty + CTA admin CREATE · invent assert **skip** · **no seed** · FE hardcode **`salary` \| `compensatory_leave`** OK **only** when EFF=0 (**01c** · U65 · **L-ATT-OTC-06**) — AS-IS slug is **`compensatory_leave`** (i18n TimeOff) — **NOT** `time_off` / `time-off`.
5. Soft-retire → default picker ẩn · historical `overtime_requests` refs OK (**01e** · **BR-PLT-04**).
6. Display-ready: list/EFF expose `code`/`name_vi` — FE **cấm** invent labels when BE provides; detail **cấm** binary-map any non-salary → TimeOff when Nest label exists (**01f** · **L-ATT-OTC-12**) — **≠** payroll formula LIVE.
7. Settings/XBOS compensation MD = **REF merge-read only** (**BR-PLT-06** · **L-ATT-OTC-03**) — **FORBIDDEN** sole SoT / dual-write.
8. **Orthogonal OWN** vs sealed **`att_ot_type`** (OT type = when/class; compensation = how settled) · day-code · leave · worksite · shifts — **FORBIDDEN** fold / reopen L1 (**L-ATT-OTC-08**).
9. **DENY** Face · mega-EAV · seed · flip ready · invent FE LVRULE · reopen OT-TYPE/CTR/ATT · claim formula LIVE · auto leave-funnel · module ATT/PAY UAT · Phase1 (**01H** · **`C-SLICE-≠-MODULE`**).

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings / ATT CFG — **Hình thức bồi thường OT / OT compensation type** (Nest admin — **ADD** after DATA/BE) | CRUD Nest `att_ot_comp_type` open N+1 · soft-retire |
| HCNS / NV / QL — tab **Đơn từ → Tăng ca** (`OvertimeRequestTab`) | Create + detail: khi EFF>0 pick ∈ Nest; invent → KEY |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | EFF resolve · soft-delete hide · `HRM-ATT-OT-COMP-KEY` · display-ready labels |
| SA / ba-data / Dev-BE / Dev-FE / QA | F.1 · physical ADD · CRUD/EFF/KEY · rebind Select · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-ATT-COMP-01 / 01b / 01c / 01d / 01e / 01f / 01H** · **VAL-ATT-COMP-CNS-*** · BR-PLT-ATT-COMP-* · surface matrix + UF/J-* | Impl `apps/**` / migration / seed |
| Enumerate: OT compensation admin · OvertimeRequestTab create/detail · BE `createOvertimeRequest` · optional mobile OT if in-scope | Claim module ATT/PAY UAT · flip ready · claim formula LIVE |
| Cross-ref OT-TYPE as **orthogonal SEAL RETAIN** · CTR/ATT L1/FE HOLD **RETAIN** | Fold into `att_ot_type` · reopen OT-TYPE L1 · Face · mega-EAV · leave-funnel LIVE |
| ba-data **UNLOCK** pointer (Nest ABSENT) | Second mega catalog · dual-write Settings |

**Numbering note:** SA §7 stub IDs preserved — **01**=bind Nest when EFF>0 · **01b**=invent KEY · **01c**=empty · **01d**=admin N+1 · **01e**=soft-retire · **01f**=display-ready / formula HOLD · **01H**=honesty.

---

## 1. As-is vs to-be

| | AS-IS (SA evidence · FE grep 2026-08-08) | TO-BE (Option B · this pack) |
|---|---------------------|------------------------------|
| Nest OT comp-type table | **ABSENT** — no `att_ot_comp_type` / compensation catalog CRUD | Nest **DEFINE** open catalog F-ATT-CAT-OTC-* |
| FE consumer | `OvertimeRequestTab` closed **`salary` \| `compensatory_leave`** (i18n `overtime.compensationTimeOff` — **not** slug `time_off`) | EFF>0 → Nest compensation picker; hardcode **only** EFF=0 bootstrap |
| FE detail | Binary: `compensation_type === 'salary' ? Salary : TimeOff` — invent label for any non-salary | Display Nest `name_vi` when EFF>0 · **cấm** binary invent |
| TXN | `overtime_requests.compensation_type` TEXT DEFAULT `'salary'` · DTO free `@IsString()` · INSERT trim/default · **no** invent KEY | EFF>0 → assert ∈ catalog → **`HRM-ATT-OT-COMP-KEY`** |
| Nest `att_ot_type` | **LIVE** KEY `HRM-ATT-OT-TYPE-KEY` on `overtime_type` only | **OUT reopen** · compensation **orthogonal OWN** · **FORBIDDEN** fold |
| Settings | No LIVE OT compensation MD producer | **REF only** — **≠** sole SoT |
| Payroll formula | Peer HOLD | **HOLD** — catalog ≠ formula LIVE |
| Honesty | Risk flip / reopen / fold / invent FE | Flags **false** · seals **RETAIN** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | EFF/active compensation types **>0** | Consumer SoT = picker/FK ∈ Nest catalog | Invent → **4xx** `HRM-ATT-OT-COMP-KEY` |
| **BR-PLT-04** | Retire / inactive / `archived_at` | Soft-delete | Default picker ẩn; TXN history còn |
| **BR-PLT-05** | Admin CREATE compensation type | Open N+1 `code`/name | **FORBIDDEN** closed salary\|compensatory_leave ceiling as product SoT |
| **BR-PLT-06** | Dual SoT | Nest = SoT; Settings = REF merge-read only | **FORBIDDEN** dual-write / Settings sole |
| **L-ATT-OTC-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-OTC-02..16** | SA LOCKED | Cite SA §5 | See SA — BA does not reopen |

---

## 3. OT compensation-type business rules (OWN)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-COMP-01** | Surface = **catalog admin** (`POST/PATCH` F-ATT-CAT-OTC-02) | Cho phép type row N+1 open slug + label | **2xx/201** · list + F5 còn — **không** «must pick existing only» |
| **BR-PLT-ATT-COMP-02** | Surface ∈ **consumer set** (§4) **và** EFF/active **>0** | Body `compensation_type` **phải** ∈ scoped Nest EFF | Ngoài set → **`HRM-ATT-OT-COMP-KEY`** — format-only **không** bypass |
| **BR-PLT-ATT-COMP-03** | EFF/active **=0** | Soft empty CTA admin CREATE · invent assert **skip**; FE hardcode two OK **only** as bootstrap; admin vẫn CREATE | Seed/fake density = **FAIL U65** |
| **BR-PLT-ATT-COMP-04** | Settings MD / XBOS compensation codes | REF merge-read only | **FORBIDDEN** sole SoT / dual-write |
| **BR-PLT-ATT-COMP-05** | Soft-retire type còn TXN history | Soft-delete; default picker **không** chọn retired; `include_inactive` admin OK | Hard-delete orphans = **FAIL** |
| **BR-PLT-ATT-COMP-06** | Display | EFF list exposes `code`/`name_vi`; detail/list dùng Nest label khi EFF>0 | FE invent binary TimeOff when Nest label exists = **FAIL**; claim formula LIVE = **FAIL process** |
| **BR-PLT-ATT-COMP-07** | Orthogonal | Compensation ≠ `att_ot_type` ≠ `work_shifts` ≠ day-code ≠ leave ≠ worksite | Fold / reopen OT-TYPE·SHIFT·CODE·leave·WS L1 = **FAIL** |
| **BR-PLT-ATT-COMP-08** | Payroll formula / LIST-TOTALS / aggregate | Cite peer HOLD / sealed GĐ1 | **FORBIDDEN** claim formula LIVE / rewrite aggregate from this AC |
| **BR-PLT-ATT-COMP-09** | ba-data | Nest OT compensation catalog **ABSENT** | **UNLOCK ADD** `att_ot_comp_type` · **FORBIDDEN** mega-EAV / fold into `att_ot_type` |
| **BR-PLT-ATT-COMP-10** | Scope | list ↔ get-by-id ↔ EFF ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **BR-PLT-ATT-COMP-11** | Wire invent stamp | One wire code **`HRM-ATT-OT-COMP-KEY`** | Alias OBS only — **không** dual runtime codes; **≠** `HRM-ATT-OT-TYPE-KEY` / SHIFT/LEAVE/CTR KEY |
| **BR-PLT-ATT-COMP-12** | OT-TYPE / CTR / ATT L1 / FE LVRULE HOLD | SEAL / HOLD RETAIN | **FORBIDDEN** reopen / invent FE as mandatory |
| **BR-PLT-ATT-COMP-13** | AS-IS FE slug accuracy | Bootstrap codes = `salary` + `compensatory_leave` | **FORBIDDEN** invent slug `time_off` as AS-IS SoT; i18n TimeOff = label only |
| **BR-PLT-ATT-COMP-14** | Compensatory leave vs leave-type | Code may **later cite** leave-type for accrual funnel | **OUT** this seat — **no** leave L1 reopen · **no** auto-funnel LIVE claim |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| **OT-TYPE** KEY LIVE / BA-01 | **Orthogonal SEAL RETAIN** — compensation OWN · **cấm** fold / reopen |
| ATT-CODE / leave / worksite / SHIFT L1 | **SEAL RETAIN** — **≠** fold |
| ATT leave-balance / FE LVRULE 01g HOLD | **HOLD RETAIN** — **DENY invent FE** |
| CTR template KEY / clause | **SEAL RETAIN** |
| PAY catalog ≠ formula LIVE | Named peer — **cite** formula HOLD |
| leave-balance / EMP-STATUS / OT-TYPE Nest DEFINE | Class peer — **cite ≠ copy** |

**SUPERSEDED / FORBIDDEN:** Option A Settings-sole · Option C RETAIN free-TEXT-as-SoT / hybrid/mega-EAV/fold into ot_type/reopen/invent FE/flip/formula/seed · invent ready flags · unlock BE before DATA · treat hardcode two as product ceiling when EFF>0 · treat `time_off` as AS-IS slug.

---

## 4. Consumer / admin surface inventory (authoritative)

> **Admin ≠ consumer.** AC invent KEY / picker-when-EFF áp **consumer rows** — **không** áp lên F-ATT-CAT-OTC-02 admin CREATE.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class | SRS |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|-----|
| **S-ATT-COMP-ADM-01** | Nest OT compensation **admin** CRUD | Settings / ATT CFG → **Hình thức bồi thường OT** (Nest panel — **ADD** after DATA/BE) | open N+1 `code`/`name_vi` | **F-ATT-CAT-OTC-02** | **ADMIN** | UC-HRM-ATT-OT / FR-UC-BP-ATT |
| **S-ATT-COMP-ADM-02** | OT compensation list / EFF preview | Same admin · GET list + effective | display-ready | **F-ATT-CAT-OTC-01** | **ADMIN-READ** | — |
| **S-ATT-COMP-CNS-01** | **Đơn từ → Tăng ca — Tạo yêu cầu** (compensation picker) | Chấm công → Đơn từ → Tăng ca (`OvertimeRequestTab`) create Select | `compensation_type` ∈ EFF when >0 | POST `…/overtime-requests` · invent → **HRM-ATT-OT-COMP-KEY** | **CONSUMER** (primary TXN) | UC-HRM-ATT-OT |
| **S-ATT-COMP-CNS-02** | **Tăng ca — detail / badge compensation label** | Same tab detail panel | Label from catalog when EFF>0 (kill binary invent) | Display-ready | **CONSUMER-READ** | **01f** |
| **S-ATT-COMP-CNS-03** | BE **createOvertimeRequest** | Nest attendance-requests | Same KEY when EFF>0 | Assert membership | **CONSUMER** (API) | — |
| **S-ATT-COMP-CNS-04** | Mobile OT create (nếu in-scope product) | Mobile attendance OT | Same KEY when EFF>0 | Same assert | **CONSUMER** (optional) | — |
| **S-ATT-COMP-REF-01** | Settings MD compensation (if any) | Settings Master Data | REF labels | Merge-read only | **REF** — **≠** SoT | L-ATT-OTC-03 |
| **S-ATT-COMP-OUT-01** | OT type admin / `att_ot_type` / OT-TYPE KEY seats | OT-TYPE pack | — | — | **OUT** · **SEAL RETAIN** · **cấm fold/reopen** |
| **S-ATT-COMP-OUT-02** | Work shifts / Ca / ShiftChange | ATT-SHIFT pack | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-COMP-OUT-03** | ATT-CODE / leave / worksite L1 | Peer catalogs | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-COMP-OUT-04** | ATT leave-balance / FE LVRULE 01g | Named HOLD | — | — | **OUT invent FE** — **HOLD RETAIN** |
| **S-ATT-COMP-OUT-05** | CTR template / clause KEY | Peer seals | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-COMP-OUT-06** | Payroll calculate / formula engine | PAY | — | — | **OUT** formula LIVE |
| **S-ATT-COMP-OUT-07** | Face / device / punch hardware | Mobile punch | — | — | **OUT** |
| **S-ATT-COMP-OUT-08** | Timesheet aggregate / LIST-TOTALS | `att-timesheet-line-aggregate` | — | sealed code | **OUT rewrite** |
| **S-ATT-COMP-OUT-09** | Auto leave-funnel from compensatory_leave | Leave accrual | — | — | **OUT** funnel LIVE · no leave L1 reopen |
| **S-ATT-COMP-OUT-10** | EMP / SI / PAY / DEC / MergeToken | Peer packs | — | — | **OUT** · **SEAL RETAIN** |

**Pointer:** Load-only attendance journeys (**UF-HRM-05** / **J-HRM-06**) — **RETAIN**; mutate depth = proposed **J-HRM-ATT-COMP-*** — **cấm** claim attendance UAT from load-only or catalog slice.

**AS-IS FE cite (mandatory accuracy):** `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` — SelectItem values **`salary`** / **`compensatory_leave`**; detail binary `=== 'salary' ? Salary : TimeOff`. **FORBIDDEN** document AS-IS as `time_off`.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-COMP-01** | Admin — CREATE compensation type N+1 | Settings/ATT CFG OT compensation → mã mới (vd. `banked_hours` / `mixed_pay_leave`) + name → Lưu **201** → list có row → **F5** còn → consumer picker thấy | Sửa name / soft-retire | Format/UQ/scope 409 · «must pick only» sai áp admin · Settings-sole write |
| **UC-PLT-ATT-COMP-02** | Consumer — pick Nest compensation | EFF≥1 → Tăng ca create → **picker** Network GET `…/ot-comp-types` (/effective) → chọn → Lưu **2xx** → F5 detail label ∈ catalog | Detail/badge from EFF | Free invent hardcode succeed · Settings sole · invent → **4xx** `HRM-ATT-OT-COMP-KEY` |
| **UC-PLT-ATT-COMP-03** | Empty EFF | Active=0 → soft empty + CTA · invent skip · hardcode `salary`\|`compensatory_leave` bootstrap **chỉ** EFF=0 · admin vẫn CREATE · **no seed** | Optional REF CTA | Seed fake density · hardcode-as-SoT when EFF>0 |
| **UC-PLT-ATT-COMP-04** | Soft-retire | Retire → picker ẩn · historical OT rows OK · admin `include_inactive` | Reactivate if product allows | Hard-delete · wipe history |
| **UC-PLT-ATT-COMP-05** | Display-ready / formula non-claim | Detail/list Nest `name_vi` when EFF>0 · **no** binary invent · **no** payroll formula LIVE claim | — | Binary TimeOff invent · claim formula LIVE / flip `payroll_e2e_ready` = **FAIL process** |
| **UC-PLT-ATT-COMP-06** | Scope parity | List/EFF scope X = assert consumer scope X | Member 409 OOS | Drift list vs assert |
| **UC-PLT-ATT-COMP-07** | Orthogonal non-fold | Compensation independent of `att_ot_type`/shifts/code/leave | — | Fold / reopen OT-TYPE L1 = **FAIL** |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings_OT_Comp
  actor Emp as NV_QL_Overtime_Form
  participant Nest as F_ATT_CAT_OTC
  participant Eff as F_ATT_CAT_OTC_EFF
  participant Txn as overtime_requests

  Admin->>Nest: POST F-ATT-CAT-OTC-02 type N+1 (open code)
  alt Ceiling / invent-ban sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-ATT-OTC-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Emp->>Eff: GET ot-comp-types/effective
  alt Active count = 0
    Eff-->>Emp: Soft empty CTA; invent skip; hardcode salary|compensatory_leave OK; cấm seed
  else Active count > 0
    Emp->>Txn: POST overtime-requests compensation_type
    alt compensation_type invent / OOS
      Txn-->>Emp: 4xx HRM-ATT-OT-COMP-KEY
    else OK
      Txn-->>Emp: 2xx; F5 label ∈ catalog name_vi
    end
  end
  Note over Txn: att_ot_type / CTR / FE LVRULE / formula HOLD OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe OT-TYPE KEY · CTR KEY/clause · ATT leave-balance · FE LVRULE 01g HOLD · ATT-CODE/WS/SHIFT/leave L1.  
> **BE HOLD** until DATA CONFIRMED — AC dưới đây = **gate cho unlock** execution (không claim LIVE trước Nest).

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-COMP-01** | **S-ATT-COMP-CNS-01** (primary) | EFF compensation active **≥1** (từ admin — **không** seed): mở **Chấm công → Đơn từ → Tăng ca** → create UI compensation = **picker** nguồn **Network GET** `/api/hrm/attendance/ot-comp-types` (+ `/effective` per F.1) → chọn Nest → Lưu **2xx** → list/detail đúng `compensation_type` + `name_vi` → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings · FE hardcode salary\|compensatory_leave **sole** SoT khi EFF>0 · 2xx với type không ∈ EFF · chỉ API PASS |
| **AC-PLT-ATT-COMP-01b** | **S-ATT-COMP-CNS-01** / **S-ATT-COMP-CNS-03** invent | EFF **≥1**: cố ý nhập/POST `compensation_type` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-ATT-OT-COMP-KEY`** → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · nhầm KEY với `HRM-ATT-OT-TYPE-KEY` / `HRM-ATT-SHIFT-KEY` / `HRM-ATT-LVRULE-KEY` / `HRM-LEAVE-TYPE-UNKNOWN` / CTR KEY |
| **AC-PLT-ATT-COMP-01c** | Consumers khi EFF **=0** | Soft empty picker + VI/CTA admin **Hình thức bồi thường OT**; invent assert **skip**; **không** fake starter chỉ để pass UF; admin **S-ATT-COMP-ADM-01** vẫn CREATE được; hardcode **`salary` \| `compensatory_leave`** **chỉ** khi EFF=0 — **cấm** claim hardcode = SoT khi Nest EFF later >0 · **cấm** invent AS-IS slug `time_off` | Seed/script density · fake rows · hardcode-as-SoT khi Nest EFF>0 · Settings-only «green» khi Nest EFF=0 |
| **AC-PLT-ATT-COMP-01d** | **S-ATT-COMP-ADM-01** | Catalog admin CREATE type **#N+1** (slug hợp lệ, vd. `banked_hours`) + name → Network **2xx/201** `F-ATT-CAT-OTC-02` → list có row → **F5** còn → consumer picker thấy — **không** reject «must pick existing only» · **không** restore closed salary\|compensatory_leave ceiling | Áp invent ban lên admin · ceiling starter 2 · reject N+1 · Settings dual-write as SoT |
| **AC-PLT-ATT-COMP-01e** | Soft-retire | Soft-retire type → default picker **ẩn** · history OT request vẫn đọc key / safe label · create mới **không** chọn retired | Hard-delete · wipe history · picker vẫn show retired as default |
| **AC-PLT-ATT-COMP-01f** | Display-ready · formula HOLD | EFF>0: Select/detail từ catalog `name_vi`; **cấm** binary `non-salary → TimeOff` invent khi Nest label exists; evidence **không** claim payroll formula LIVE / **không** flip `payroll_e2e_ready` | Claim formula LIVE · binary invent · treat catalog as payroll engine GO |
| **AC-PLT-ATT-COMP-01H** | Honesty / seals | Evidence ghi rõ: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · OT-TYPE KEY **SEAL RETAIN** (**DENY fold/reopen**) · CTR KEY/clause **SEAL RETAIN** · ATT leave-balance / FE LVRULE 01g **HOLD RETAIN** (**DENY invent FE**) · ATT-CODE/WS/SHIFT/leave L1 **SEAL RETAIN** · EMP/SI/PAY/DEC **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** module ATT/PAY UAT · **DENY** Settings sole · **DENY** mega-EAV · **DENY** Face · **DENY** formula LIVE · **DENY** leave-funnel LIVE | Flip ready · reopen seals · fold into ot_type · invent FE HOLD · claim Phase1 · formula GO |

### 6.2 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-COMP-CNS-01** | Create **S-ATT-COMP-CNS-01**/03 | `compensation_type` OOS khi EFF >0 | **4xx** `HRM-ATT-OT-COMP-KEY` | AC-PLT-ATT-COMP-01b · BR-PLT-ATT-COMP-02 | **MIGRATE** after DATA+BE — replace free `@IsString()` / no-assert |
| **VAL-ATT-COMP-CNS-02** | Admin **S-ATT-COMP-ADM-01** | CREATE type N+1 open | **2xx/201** · F5 · picker sees type | AC-PLT-ATT-COMP-01d · BR-PLT-05 | Admin ≠ consumer invent ban |
| **VAL-ATT-COMP-CNS-03** | Scope | List EFF scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-ATT-OTC-11 · U19 | After Nest: list↔assert same resolver |
| **VAL-ATT-COMP-CNS-04** | Soft-retire | Create với type retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · AC-PLT-ATT-COMP-01e | After Nest soft-delete |
| **VAL-ATT-COMP-CNS-05** | Empty EFF | EFF=0 · invent unknown type | Assert **skip** · soft empty + CTA · **no seed** · hardcode `salary`\|`compensatory_leave` OK | AC-PLT-ATT-COMP-01c · L-ATT-OTC-06 | Bootstrap two OK only EFF=0 · cite AS-IS slug |
| **VAL-ATT-COMP-CNS-06** | Settings-only / FE hardcode SoT | FE bind Settings hoặc hardcode **without** Nest EFF when EFF >0 | **FAIL** AC-PLT-ATT-COMP-01 / 01f | L-ATT-OTC-02/03 · BR-PLT-ATT-COMP-04 | **GAP FE** rebind EFF · kill closed-2 sole |
| **VAL-ATT-COMP-CNS-07** | Display-ready | List/get/detail when type ∈ catalog | `name_vi` from catalog (or safe fallback) · **no** binary invent | BR-PLT-ATT-COMP-06 · L-ATT-OTC-12 | BE display-ready · FE không invent join |
| **VAL-ATT-COMP-CNS-08** | KEY taxonomy | Invent compensation vs invent OT-TYPE/SHIFT/LEAVE/LVRULE/CTR | Comp → **`HRM-ATT-OT-COMP-KEY`** only — **không** lẫn **`HRM-ATT-OT-TYPE-KEY`** | BR-PLT-ATT-COMP-11 · L-ATT-OTC-16 | Regression orthogonal KEY |
| **VAL-ATT-COMP-CNS-09** | Formula non-claim | Diff/evidence claims formula LIVE / flip payroll_e2e | **FAIL process** / QA residual | BR-PLT-ATT-COMP-08 · AC-PLT-ATT-COMP-01f/01H | Catalog ≠ formula |
| **VAL-ATT-COMP-CNS-10** | Orthogonal non-fold | Diff reopens OT-TYPE invent KEY / folds compensation into `att_ot_type` | **FAIL process** | BR-PLT-ATT-COMP-07 · L-ATT-OTC-08 | OT-TYPE orthogonal SEAL |

### 6.3 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-OT-TYPE-KEY-01** | OT-TYPE KEY LIVE · `att_ot_type` **SEAL RETAIN** · orthogonal | Fold compensation into ot_type / reopen OT-TYPE L1 |
| **MK-CTR-KEY-01** | CTR-TEMPLATE KEY LIVE · CTR-CLAUSE `body_vi` **SEAL RETAIN** | Reopen CTR invent KEY seats |
| **MK-ATT-LVRULE-01** | ATT leave-balance / FE LVRULE 01g **HOLD RETAIN** | Invent FE LVRULE as mandatory |
| **MK-ATT-CODE-01** | ATT-CODE L1 **SEAL RETAIN** | Fold compensation into day-code / reopen |
| **MK-ATT-WS-01** | ATT worksite **SEAL RETAIN** | Fold / reopen |
| **MK-ATT-SHIFT-01** | ATT-SHIFT L1 **SEAL RETAIN** | Fold / reopen |
| **MK-ATT-LEAVE-01** | Leave-type L1 **SEAL RETAIN** | Fold / reopen / auto-funnel LIVE |
| **MK-ATT-AGG-01** | Aggregate / LIST-TOTALS **SEAL RETAIN** | Rewrite aggregate / claim payroll ready |
| **MK-HONESTY-01** | attendance / payroll / printable **false** | Flip flags |
| **MK-FORMULA-01** | Formula LIVE **HOLD** | Claim compensation catalog = formula LIVE |
| **MK-FE-SLUG-01** | AS-IS bootstrap = `salary` + `compensatory_leave` | Document/invent AS-IS as `time_off` |

### 6.4 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `UF-HRM-ATT-COMP-01`** | Tăng ca create bind Nest compensation when EFF>0 (**01**) | U65 browser · post-mutation FE + F5 |
| **Proposed `UF-HRM-ATT-COMP-01b`** | Invent `compensation_type` → 4xx `HRM-ATT-OT-COMP-KEY` (**01b**) | Network KEY proof |
| **Proposed `UF-HRM-ATT-COMP-01c`** | EFF=0 soft empty + CTA · admin still CREATE (**01c**) | zero-seed · NOTE_BLOCKED OK without wipe · hardcode two only EFF=0 |
| **Proposed `UF-HRM-ATT-COMP-01d`** | Admin CREATE N+1 → F5 → consumer picker (**01d**→**01**) | |
| **Proposed `UF-HRM-ATT-COMP-01e`** | Soft-retire → picker ẩn · history OK (**01e**) | |
| **Proposed `UF-HRM-ATT-COMP-01f`** | Detail Nest `name_vi` · no binary invent (**01f**) | formula HOLD |
| **Proposed `J-HRM-ATT-COMP-01`** | Admin CREATE → list→create picker cross-nav (**01d**→**01**) · U19 | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-ATT-COMP-02`** | Invent KEY on create (**01b**) | |
| **Proposed `J-HRM-ATT-COMP-03`** | Empty EFF CTA path (**01c**) | |
| **Proposed `J-HRM-ATT-COMP-04`** | Soft-retire + history (**01e**) | |
| Reuse | **UF-HRM-05** · **J-HRM-06** / **J-HRM-06b** / **J-HRM-06c** | Load / sheet / sign — **RETAIN**; **cấm** reopen / claim UAT |
| Peer OT-TYPE journeys | **UF-HRM-ATT-OT-*** / **J-HRM-ATT-OT-*** | **SEAL RETAIN** — compensation **orthogonal** · **cấm** reopen as «fix compensation» |
| Cross-nav U19 | OT list→detail · F5 · compensation label | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup `main`) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

**BA_TRACE:** promote `J-HRM-ATT-COMP-*` into `PILOT_BUSINESS_FLOW_BA_TRACE.md` **OPTIONAL** after Nest consumer LIVE + QA stamp — **không** claim journey PASS from this docs seat.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-ATT-OT-COMP-KEY`** | Consumer invent / OOS `compensation_type` khi EFF active >0 | **4xx** (400) | Banner/field VI — không toast success · không persist |
| **`HRM-ATT-OTC-404`** | OOS get-by-id catalog | 404 | Honest empty/banner |
| **`HRM-ATT-OTC-409`** | Scope mismatch mutate/assert | 409 | Honest empty/banner |
| **`HRM-ATT-OTC-VAL`** | Admin format (empty code/name) | 4xx | Admin form |
| Peer **`HRM-ATT-OT-TYPE-KEY`** | OT type invent (orthogonal) | 4xx | **MUST NOT** synonym compensation invent |
| Peer `HRM-ATT-SHIFT-KEY` / `HRM-ATT-LVRULE-KEY` / `HRM-LEAVE-TYPE-UNKNOWN` / CTR KEY | Orthogonal | 4xx | **MUST NOT** synonym |

**Taxonomy rule (peer CTR / OT-TYPE KEY):** 404 / CODE-INVALID / VAL / **`HRM-ATT-OT-TYPE-KEY`** **≠** invent **COMP** KEY. Invent path must stamp **`HRM-ATT-OT-COMP-KEY`** only.

**Cấm:** 2xx + orphan compensation_type when EFF>0; 500 trên invent; FE format-pass bỏ qua membership; nhầm COMP KEY với OT-TYPE/SHIFT/LEAVE/LVRULE/CTR; claim hardcode two = SoT when EFF>0; claim formula LIVE; invent AS-IS slug `time_off`.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — **DENIED** flip |
| OT-TYPE KEY / `att_ot_type` | **SEAL RETAIN** — **DENIED** reopen · **DENIED** fold |
| CTR KEY / clause | **SEAL RETAIN** — **DENIED** reopen |
| ATT leave-balance / FE LVRULE 01g | **HOLD RETAIN** — **DENIED** invent FE |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** — **DENIED** reopen |
| Module ATT/PAY UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Settings sole SoT | **DENIED** |
| Mega-EAV / dual writers / fold ot_type·shifts·code·leave·worksite | **DENIED** |
| Face / device LIVE | **DENIED** |
| Seed | **DENIED** (U65) |
| Formula LIVE / compensation catalog as engine GO | **DENIED** |
| Auto leave-funnel LIVE | **DENIED** |
| `C-SLICE-≠-MODULE` | OT compensation catalog AC pack ≠ module ATT/PAY UAT |
| ba-data | **UNLOCK** parallel DATA-01 — ADD `att_ot_comp_type` |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest SoT wording | **OPTIONAL** | ADD-only: «danh mục hình thức bồi thường OT = Nest `att_ot_comp_type`; Settings ≠ sole SoT; ≠ loại tăng ca `att_ot_type`» — **không** wipe OT-TYPE/SHIFT/CTR FR |
| Journey rows J-HRM-ATT-COMP-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.4 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data EXPAND | **YES** parallel | Nest absent DEFINE |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA **CONFIRMED** · ensure parallel **DATA-01** completes · **HOLD BE** until DATA CONFIRMED · then unlock BE→FE→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.att_ot_comp_type` (or stamped synonym) · UQ `(company_id, lower(code))` · soft-delete · scope · F-ATT-CAT-OTC map · **FORBIDDEN** mega-EAV / fold into `att_ot_type` · **no seed** · bootstrap codes document `salary`/`compensatory_leave` | CONFIRMED DATA |
| **dev-be** | **After BA+DATA:** Nest ensureSchema + F-ATT-CAT-OTC-01/02 + EFF · invent KEY on **createOvertimeRequest** · display-ready · jest VAL-ATT-COMP-CNS-* · **FORBIDDEN** formula LIVE / reopen OT-TYPE / invent FE LVRULE / fold | READY_FOR_QA |
| **dev-fe** | After BE: rebind `OvertimeRequestTab` compensation Select/detail to Nest EFF when count>0; hardcode **`salary` \| `compensatory_leave`** **only** EFF=0; kill binary invent when Nest label; empty soft+CTA; **FORBIDDEN** invent FE LVRULE 01g · invent slug `time_off` as SoT | READY_FOR_QA |
| **qa** | U65 AC-PLT-ATT-COMP-01/01b/01c/01d/01e/01f/01H · VAL CNS · zero-seed · no attendance/payroll/printable flip · seals untouched · no formula claim · KEY ≠ OT-TYPE | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain · **C-SLICE-≠-MODULE** | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After Nest LIVE if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | FE `OvertimeRequestTab` closed-2 `salary`\|`compensatory_leave` + binary detail | Allowed **only** EFF=0 bootstrap; **must** rebind Nest EFF when EFF>0 (**VAL-ATT-COMP-CNS-06** · **01** · **01f**) |
| R2 | BE free `@IsString()` compensation_type + default salary | **Mandatory** KEY assert via DATA+BE (**VAL-ATT-COMP-CNS-01**) — residual until DATA |
| R3 | Confusion with sealed `att_ot_type` / OT-TYPE KEY | **L-ATT-OTC-08** · KEY taxonomy **COMP ≠ TYPE** · OUT surfaces §4 |
| R4 | Catalog misread as payroll formula | **01f** · **01H** · **VAL-ATT-COMP-CNS-09** — HOLD forever this seat alone |
| R5 | Settings treated as SoT | **L-ATT-OTC-03** · Option A REJECT |
| R6 | Mis-document AS-IS as `time_off` | **BR-PLT-ATT-COMP-13** · **MK-FE-SLUG-01** — cite FE SelectItem values |
| R7 | Compensatory leave → leave-type funnel | **BR-PLT-ATT-COMP-14** · OUT funnel LIVE · no leave L1 reopen |
| Q1 | Exact Nest admin tab label VI | Dev-FE product copy — process: «Hình thức bồi thường OT» / «Danh mục OT compensation» |
| Q2 | Mobile OT create in-scope? | Optional **S-ATT-COMP-CNS-04** — same KEY rules if surface exists; else OUT |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **UNLOCK** (parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01` — do not wait) |
| **BE** | **HOLD** until BA **+** DATA CONFIRMED |
| **next_owner** | **pm** → seal BA · await/seal **ba-data** CONFIRMED → then **dev-be** (F-ATT-CAT-OTC + CNS KEY · **no** formula LIVE · **no** reopen OT-TYPE/CTR · **no** invent FE LVRULE · **no** fold) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-ba-01.md` |