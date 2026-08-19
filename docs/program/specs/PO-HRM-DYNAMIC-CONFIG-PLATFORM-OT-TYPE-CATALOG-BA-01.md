# BA AC/BR — OT type open catalog Option B · Nest `att_ot_type` DEFINE ≠ Settings/D4 sole · ≠ work_shifts · formula LIVE HOLD

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · peer ba-data **DATA-01 UNLOCK** (parallel — do not wait this seat) · BE **HOLD** until BA **+** DATA CONFIRMED · payroll formula LIVE **HOLD** · `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready` / reopen CTR·ATT L1 / invent FE LVRULE 01g / Face / mega-EAV / Settings-sole / flip ready **DENIED** |
| **change_mode** | **ADD** (deepen SA §5–§8 stubs · **OWN** OT type residual **S-ATT-SHIFT-CITE-01** reverse · **no** wipe CTR KEY/clause · ATT leave-balance/CODE/WS/SHIFT L1 · FE LVRULE 01g HOLD · EMP/SI/PAY/DEC) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md) L-ATT-OT-01..15 · F-ATT-CAT-OT-* · §7 stubs |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.3 ATT GĐ1 deepen · **BR-PLT-02/04/05/06** · Face/device **OUT** |
| **ref_peer_att_shift** | [`ATT-SHIFT-CATALOG-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md) **S-ATT-SHIFT-CITE-01** OT type **CITE OUT** of work_shifts — **OWN here** · **cite ≠ copy** · **FORBIDDEN** reopen SHIFT L1 |
| **ref_peer_leave_balance** | Nest-ABSENT DEFINE Option B AC pattern — **cite ≠ copy** |
| **ref_peer_pay_engine** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE — **cite** · **FORBIDDEN** claim `default_coefficient` = payroll formula LIVE |
| **ref_peer_ctr** | CTR-TEMPLATE KEY LIVE · CTR-CLAUSE `body_vi` — **SEAL RETAIN** · **cấm reopen** |
| **ref_adr** | ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B · ADR-HRM-ATTENDANCE-CFG-PERSIST **D4** stub REF |
| **ref_data_class** | `HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` §2.5 OT type **REF** · SPEC_GAP · MISSING_CFG_UI |
| **ref_srs** | FR-UC-BP-ATT / UC-HRM-ATT-OT · Đơn từ→Tăng ca LIVE TXN · OT type picker SPEC_GAP → this pack |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · CTR KEY/clause **SEAL RETAIN** · ATT leave-balance / FE LVRULE 01g **HOLD RETAIN** (**DENY invent FE**) · ATT-CODE / WS / SHIFT / leave L1 **SEAL RETAIN** · EMP/SI/PAY/DEC/MergeToken **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module ATT/PAY UAT · **DENY** formula LIVE |
| **Cấm** | `apps/**` · seed · Settings/D4 sole SoT · mega-EAV · fold into `work_shifts`/day-code/leave/worksite · reopen CTR/ATT L1 · invent FE HOLDs · Face/device · rewrite aggregate · flip ready · claim formula LIVE · BE before BA+DATA |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED) — Nest OT-type open catalog **DEFINE** (AS-IS Nest **ABSENT** + FE closed-3 hardcode):

1. **Catalog SoT** = Nest **`public.att_ot_type`** (ba-data may stamp synonym `att_overtime_type` — **one** table) via **F-ATT-CAT-OT-01** list/EFF · **F-ATT-CAT-OT-02** mutate (**L-ATT-OT-02**).
2. **Admin** = **open CREATE N+1** (`code` slug + `name_vi` + **`default_coefficient`** ≥0) — starter `weekday`/`weekend`/`holiday` = **bootstrap ≠ ceiling** (**BR-PLT-05** · **AC-PLT-ATT-OT-01d**).
3. **Consumers** khi **EFF/active count >0** = picker/FK only (**BR-PLT-02** · **AC-PLT-ATT-OT-01**); invent `overtime_type` ∉ scoped catalog → **`HRM-ATT-OT-TYPE-KEY`** (**01b**).
4. Empty EFF → soft empty + CTA admin CREATE · invent assert **skip** · **no seed** · FE hardcode three OK **only** when EFF=0 (**01c** · U65 · **L-ATT-OT-06**).
5. Soft-retire → default picker ẩn · historical `overtime_requests` refs OK (**01e** · **BR-PLT-04**).
6. Display-ready: list/EFF expose `code`/`name_vi`/`default_coefficient` — FE **cấm** invent labels when BE provides; FE may prefill coeff from catalog · TXN override OK (**01f** · **L-ATT-OT-12**) — **≠** payroll formula LIVE.
7. Settings/XBOS OT codes / ADR **D4** sidebar «Tăng ca» stub = **REF merge-read only** (**BR-PLT-06** · **L-ATT-OT-03**) — **FORBIDDEN** sole SoT / dual-write.
8. **Orthogonal OWN** vs `work_shifts` (ATT-SHIFT CITE OUT) · day-code · leave · worksite — **FORBIDDEN** fold / reopen L1 (**L-ATT-OT-08**).
9. **DENY** Face · mega-EAV · seed · flip ready · invent FE LVRULE · reopen CTR/ATT · claim formula LIVE · module ATT/PAY UAT · Phase1 (**01H** · **`C-SLICE-≠-MODULE`**).

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings / ATT CFG — **Loại tăng ca / OT type** (Nest admin — **ADD** after DATA/BE) | CRUD Nest `att_ot_type` open N+1 · soft-retire · default_coefficient |
| HCNS / NV / QL — tab **Đơn từ → Tăng ca** (`OvertimeRequestTab`) | Filter + create + badge: khi EFF>0 pick ∈ Nest; invent → KEY |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | EFF resolve · soft-delete hide · `HRM-ATT-OT-TYPE-KEY` · display-ready labels/coeff |
| SA / ba-data / Dev-BE / Dev-FE / QA | F.1 · physical ADD · CRUD/EFF/KEY · rebind Select · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-ATT-OT-01 / 01b / 01c / 01d / 01e / 01f / 01H** · **VAL-ATT-OT-CNS-*** · BR-PLT-ATT-OT-* · surface matrix + UF/J-* | Impl `apps/**` / migration / seed |
| Enumerate: OT type admin · OvertimeRequestTab list/create/badge · optional mobile OT if in-scope | Claim module ATT/PAY UAT · flip ready · claim formula LIVE |
| Cross-ref ATT-SHIFT **S-ATT-SHIFT-CITE-01** as **OWN reverse** · CTR/ATT L1/FE HOLD **RETAIN** | Reopen work_shifts / CTR KEY / invent FE LVRULE · Face · mega-EAV |
| ba-data **UNLOCK** pointer (Nest ABSENT) | Second mega catalog · fold into shifts/code/leave |

**Numbering note:** SA §7 stub IDs preserved — **01**=bind Nest when EFF>0 · **01b**=invent KEY · **01c**=empty · **01d**=admin N+1 · **01e**=soft-retire · **01f**=coeff display-ready / formula HOLD · **01H**=honesty.

---

## 1. As-is vs to-be

| | AS-IS (SA evidence) | TO-BE (Option B · this pack) |
|---|---------------------|------------------------------|
| Nest OT type table | **ABSENT** — no `att_ot_type` / OT catalog CRUD | Nest **DEFINE** open catalog F-ATT-CAT-OT-* |
| FE consumer | `OvertimeRequestTab` closed **weekday\|weekend\|holiday** + `getCoefficient` 1.5/2.0/3.0 | EFF>0 → Nest picker + display-ready coeff; hardcode **only** EFF=0 bootstrap |
| TXN | `overtime_requests.overtime_type` TEXT free `@IsString()` · no invent KEY | EFF>0 → assert ∈ catalog → **`HRM-ATT-OT-TYPE-KEY`** |
| Settings / D4 | Sidebar «Tăng ca» stub · DATA_CLASS MISSING_CFG_UI | **REF only** — **≠** sole SoT |
| work_shifts | LIVE ADR D1 · ATT-SHIFT L1 sealed · OT **CITE OUT** | **OUT reopen** · OT type **orthogonal OWN** |
| Payroll formula | Peer HOLD | **HOLD** — `default_coefficient` ≠ formula LIVE |
| Honesty | Risk flip / reopen / invent FE | Flags **false** · seals **RETAIN** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | EFF/active OT types **>0** | Consumer SoT = picker/FK ∈ Nest catalog | Invent → **4xx** `HRM-ATT-OT-TYPE-KEY` |
| **BR-PLT-04** | Retire / inactive / `archived_at` | Soft-delete | Default picker ẩn; TXN history còn |
| **BR-PLT-05** | Admin CREATE OT type | Open N+1 `code`/name/default_coefficient | **FORBIDDEN** closed weekday/weekend/holiday ceiling as product SoT |
| **BR-PLT-06** | Dual SoT | Nest = SoT; Settings/D4 stub = REF merge-read only | **FORBIDDEN** dual-write / Settings sole |
| **L-ATT-OT-01** | Admin path vs consumer path | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-ATT-OT-02..15** | SA LOCKED | Cite SA §5 | See SA — BA does not reopen |

---

## 3. OT type business rules (OWN)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-ATT-OT-01** | Surface = **catalog admin** (`POST/PATCH` F-ATT-CAT-OT-02) | Cho phép type row N+1 open slug + label + default_coefficient | **2xx/201** · list + F5 còn — **không** «must pick existing only» |
| **BR-PLT-ATT-OT-02** | Surface ∈ **consumer set** (§4) **và** EFF/active **>0** | Body `overtime_type` **phải** ∈ scoped Nest EFF | Ngoài set → **`HRM-ATT-OT-TYPE-KEY`** — format-only **không** bypass |
| **BR-PLT-ATT-OT-03** | EFF/active **=0** | Soft empty CTA admin CREATE · invent assert **skip**; FE hardcode three OK **only** as bootstrap; admin vẫn CREATE | Seed/fake density = **FAIL U65** |
| **BR-PLT-ATT-OT-04** | Settings MD / D4 sidebar stub / XBOS OT codes | REF merge-read only | **FORBIDDEN** sole SoT / dual-write |
| **BR-PLT-ATT-OT-05** | Soft-retire type còn TXN history | Soft-delete; default picker **không** chọn retired; `include_inactive` admin OK | Hard-delete orphans = **FAIL** |
| **BR-PLT-ATT-OT-06** | Display / coeff | EFF list exposes `code`/`name_vi`/`default_coefficient`; FE prefill coeff OK · TXN override OK | FE invent label when BE provides = **FAIL**; claim formula LIVE = **FAIL process** |
| **BR-PLT-ATT-OT-07** | Orthogonal | OT type ≠ `work_shifts` ≠ day-code ≠ leave ≠ worksite | Fold / reopen SHIFT·CODE·leave·WS L1 = **FAIL** |
| **BR-PLT-ATT-OT-08** | Payroll formula / LIST-TOTALS / aggregate | Cite peer HOLD / sealed GĐ1 | **FORBIDDEN** claim formula LIVE / rewrite aggregate from this AC |
| **BR-PLT-ATT-OT-09** | ba-data | Nest OT catalog **ABSENT** | **UNLOCK ADD** `att_ot_type` · **FORBIDDEN** mega-EAV / fold into `work_shifts` |
| **BR-PLT-ATT-OT-10** | Scope | list ↔ get-by-id ↔ EFF ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |
| **BR-PLT-ATT-OT-11** | Wire invent stamp | One wire code **`HRM-ATT-OT-TYPE-KEY`** | Alias OBS only — **không** dual runtime codes; **≠** SHIFT/LEAVE/CTR/LVRULE KEY |
| **BR-PLT-ATT-OT-12** | CTR / ATT L1 / FE LVRULE HOLD | SEAL / HOLD RETAIN | **FORBIDDEN** reopen / invent FE as mandatory |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| **S-ATT-SHIFT-CITE-01** | **OWN reverse** — OT type catalog here · **cấm** reopen SHIFT L1 |
| ATT-CODE / leave / worksite L1 | **SEAL RETAIN** — **≠** fold |
| ATT leave-balance / FE LVRULE 01g HOLD | **HOLD RETAIN** — **DENY invent FE** |
| CTR template KEY / clause | **SEAL RETAIN** |
| PAY catalog ≠ formula LIVE | Named peer — **cite** formula HOLD |
| leave-balance / EMP-STATUS Nest DEFINE | Class peer — **cite ≠ copy** |

**SUPERSEDED / FORBIDDEN:** Option A Settings-sole · Option C hybrid/mega-EAV/fold/reopen/invent FE/flip/formula/seed · invent ready flags · unlock BE before DATA · treat hardcode three as product ceiling when EFF>0.

---

## 4. Consumer / admin surface inventory (authoritative)

> **Admin ≠ consumer.** AC invent KEY / picker-when-EFF áp **consumer rows** — **không** áp lên F-ATT-CAT-OT-02 admin CREATE.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class | SRS |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|-----|
| **S-ATT-OT-ADM-01** | Nest OT type **admin** CRUD | Settings / ATT CFG → **Loại tăng ca** (Nest panel — **ADD** after DATA/BE); D4 stub replaced by Nest admin when LIVE | open N+1 `code`/`name_vi`/`default_coefficient` | **F-ATT-CAT-OT-02** | **ADMIN** | UC-HRM-ATT-OT / FR-UC-BP-ATT |
| **S-ATT-OT-ADM-02** | OT type list / EFF preview | Same admin · GET list + effective | display-ready | **F-ATT-CAT-OT-01** | **ADMIN-READ** | — |
| **S-ATT-OT-CNS-01** | **Đơn từ → Tăng ca — Tạo yêu cầu** | Chấm công → Đơn từ → Tăng ca (`OvertimeRequestTab`) create Select | `overtime_type` ∈ EFF when >0 | POST `…/overtime-requests` · invent → **HRM-ATT-OT-TYPE-KEY** | **CONSUMER** (primary TXN) | UC-HRM-ATT-OT |
| **S-ATT-OT-CNS-02** | **Tăng ca — list filter** | Same tab filter by type | Filter options ⊆ EFF when >0 (bootstrap 3 only EFF=0) | GET list client filter | **CONSUMER-READ** | — |
| **S-ATT-OT-CNS-03** | **Tăng ca — badge / detail label** | List/detail badge type label | Label from catalog when EFF>0 | Display-ready | **CONSUMER-READ** | — |
| **S-ATT-OT-CNS-04** | **Coeff prefill on create** | Create dialog coefficient | Prefill from `default_coefficient` · TXN override OK | FE bind EFF · **≠** formula LIVE | **CONSUMER** (display) | **01f** |
| **S-ATT-OT-CNS-05** | Mobile OT create (nếu in-scope product) | Mobile attendance OT | Same KEY when EFF>0 | Same assert | **CONSUMER** (optional) | — |
| **S-ATT-OT-REF-01** | Settings MD / D4 «Tăng ca» stub | Settings Master Data / ATT sidebar stub | REF labels | Merge-read only | **REF** — **≠** SoT | L-ATT-OT-03 |
| **S-ATT-OT-OUT-01** | Work shifts / Ca / ShiftChange | ATT-SHIFT pack | — | — | **OUT** · **SEAL RETAIN** · **cấm reopen** |
| **S-ATT-OT-OUT-02** | ATT-CODE / leave / worksite L1 | Peer catalogs | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-OT-OUT-03** | ATT leave-balance / FE LVRULE 01g | Named HOLD | — | — | **OUT invent FE** — **HOLD RETAIN** |
| **S-ATT-OT-OUT-04** | CTR template / clause KEY | Peer seals | — | — | **OUT** · **SEAL RETAIN** |
| **S-ATT-OT-OUT-05** | Payroll calculate / formula engine | PAY | — | — | **OUT** formula LIVE |
| **S-ATT-OT-OUT-06** | Face / device / punch hardware | Mobile punch | — | — | **OUT** |
| **S-ATT-OT-OUT-07** | Timesheet aggregate / LIST-TOTALS | `att-timesheet-line-aggregate` | — | sealed code | **OUT rewrite** |
| **S-ATT-OT-OUT-08** | EMP / SI / PAY / DEC / MergeToken | Peer packs | — | — | **OUT** · **SEAL RETAIN** |

**Pointer:** Load-only attendance journeys (**UF-HRM-05** / **J-HRM-06**) — **RETAIN**; mutate depth = proposed **J-HRM-ATT-OT-*** — **cấm** claim attendance UAT from load-only or catalog slice.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-ATT-OT-01** | Admin — CREATE OT type N+1 | Settings/ATT CFG OT type → mã mới (vd. `comp_time`/`night`) + name + default_coefficient → Lưu **201** → list có row → **F5** còn → consumer picker thấy | Sửa name/coeff / soft-retire | Format/UQ/scope 409 · «must pick only» sai áp admin · Settings-sole write |
| **UC-PLT-ATT-OT-02** | Consumer — pick Nest type | EFF≥1 → Tăng ca create → **picker** Network GET `…/ot-types` (/effective) → chọn → Lưu **2xx** → F5 badge/label ∈ catalog | Filter/badge from EFF | Free invent hardcode succeed · Settings sole · invent → **4xx** `HRM-ATT-OT-TYPE-KEY` |
| **UC-PLT-ATT-OT-03** | Empty EFF | Active=0 → soft empty + CTA · invent skip · hardcode three bootstrap **chỉ** EFF=0 · admin vẫn CREATE · **no seed** | Optional REF CTA | Seed fake density · hardcode-as-SoT when EFF>0 |
| **UC-PLT-ATT-OT-04** | Soft-retire | Retire → picker ẩn · historical OT rows OK · admin `include_inactive` | Reactivate if product allows | Hard-delete · wipe history |
| **UC-PLT-ATT-OT-05** | Coeff display / formula non-claim | Prefill from `default_coefficient` · override OK · **no** payroll formula LIVE claim | — | Any claim formula LIVE / flip `payroll_e2e_ready` = **FAIL process** |
| **UC-PLT-ATT-OT-06** | Scope parity | List/EFF scope X = assert consumer scope X | Member 409 OOS | Drift list vs assert |
| **UC-PLT-ATT-OT-07** | Orthogonal non-fold | OT type independent of work_shifts/code/leave | — | Fold / reopen SHIFT L1 = **FAIL** |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings_OT_Type
  actor Emp as NV_QL_Overtime_Form
  participant Nest as F_ATT_CAT_OT
  participant Eff as F_ATT_CAT_OT_EFF
  participant Txn as overtime_requests

  Admin->>Nest: POST F-ATT-CAT-OT-02 type N+1 (open code + coeff)
  alt Ceiling / invent-ban sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-ATT-OT-01
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Emp->>Eff: GET ot-types/effective
  alt Active count = 0
    Eff-->>Emp: Soft empty CTA; invent skip; hardcode bootstrap OK; cấm seed
  else Active count > 0
    Emp->>Txn: POST overtime-requests overtime_type
    alt overtime_type invent / OOS
      Txn-->>Emp: 4xx HRM-ATT-OT-TYPE-KEY
    else OK
      Txn-->>Emp: 2xx; F5 type + label ∈ catalog
    end
  end
  Note over Txn: work_shifts / CTR / FE LVRULE / formula HOLD OUT
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe CTR KEY/clause · ATT leave-balance · FE LVRULE 01g HOLD · ATT-CODE/WS/SHIFT/leave L1.  
> **BE HOLD** until DATA CONFIRMED — AC dưới đây = **gate cho unlock** execution (không claim LIVE trước Nest).

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-ATT-OT-01** | **S-ATT-OT-CNS-01** (primary) | EFF OT type active **≥1** (từ admin — **không** seed): mở **Chấm công → Đơn từ → Tăng ca** → create UI = **picker** nguồn **Network GET** `/api/hrm/attendance/ot-types` (+ `/effective` per F.1) → chọn type Nest → Lưu **2xx** → list/badge đúng `overtime_type` + `name_vi` → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings/D4 stub · FE hardcode weekday\|weekend\|holiday **sole** SoT khi EFF>0 · 2xx với type không ∈ EFF · chỉ API PASS |
| **AC-PLT-ATT-OT-01b** | **S-ATT-OT-CNS-01** invent | EFF **≥1**: cố ý nhập/POST `overtime_type` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-ATT-OT-TYPE-KEY`** → **không** persist sau F5 | 2xx invent · silent accept · format-only bypass · nhầm KEY với `HRM-ATT-SHIFT-KEY` / `HRM-ATT-LVRULE-KEY` / `HRM-LEAVE-TYPE-UNKNOWN` / CTR KEY |
| **AC-PLT-ATT-OT-01c** | Consumers khi EFF **=0** | Soft empty picker + VI/CTA admin **Loại tăng ca**; invent assert **skip**; **không** fake starter chỉ để pass UF; admin **S-ATT-OT-ADM-01** vẫn CREATE được; hardcode three **chỉ** khi EFF=0 — **cấm** claim hardcode = SoT khi Nest EFF later >0 | Seed/script density · fake rows · hardcode-as-SoT khi Nest EFF>0 · Settings-only «green» khi Nest EFF=0 |
| **AC-PLT-ATT-OT-01d** | **S-ATT-OT-ADM-01** | Catalog admin CREATE type **#N+1** (slug hợp lệ, vd. `comp_time`/`night`) + name + default_coefficient → Network **2xx/201** `F-ATT-CAT-OT-02` → list có row → **F5** còn → consumer picker thấy — **không** reject «must pick existing only» · **không** restore closed weekday/weekend/holiday ceiling | Áp invent ban lên admin · ceiling starter 3 · reject N+1 · Settings dual-write as SoT |
| **AC-PLT-ATT-OT-01e** | Soft-retire | Soft-retire type → default picker **ẩn** · history OT request vẫn đọc key / safe label · create mới **không** chọn retired | Hard-delete · wipe history · picker vẫn show retired as default |
| **AC-PLT-ATT-OT-01f** | Coeff / display-ready · formula HOLD | EFF>0: Select/badge từ catalog; coefficient prefill từ `default_coefficient` optional · TXN override OK; evidence **không** claim payroll formula LIVE / **không** flip `payroll_e2e_ready` | Claim formula LIVE · invent FE join label when BE provides · treat coeff map as payroll engine GO |
| **AC-PLT-ATT-OT-01H** | Honesty / seals | Evidence ghi rõ: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · CTR KEY/clause **SEAL RETAIN** · ATT leave-balance / FE LVRULE 01g **HOLD RETAIN** (**DENY invent FE**) · ATT-CODE/WS/SHIFT/leave L1 **SEAL RETAIN** · EMP/SI/PAY/DEC **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** module ATT/PAY UAT · **DENY** fold into work_shifts · **DENY** Settings/D4 sole · **DENY** mega-EAV · **DENY** Face · **DENY** formula LIVE | Flip ready · reopen seals · invent FE HOLD · claim Phase1 · fold · formula GO |

### 6.2 Consumer VAL (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-ATT-OT-CNS-01** | Create **S-ATT-OT-CNS-01** | `overtime_type` OOS khi EFF >0 | **4xx** `HRM-ATT-OT-TYPE-KEY` | AC-PLT-ATT-OT-01b · BR-PLT-ATT-OT-02 | **MIGRATE** after DATA+BE — replace free `@IsString()` / no-assert |
| **VAL-ATT-OT-CNS-02** | Admin **S-ATT-OT-ADM-01** | CREATE type N+1 open | **2xx/201** · F5 · picker sees type | AC-PLT-ATT-OT-01d · BR-PLT-05 | Admin ≠ consumer invent ban |
| **VAL-ATT-OT-CNS-03** | Scope | List EFF scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-ATT-OT-11 · U19 | After Nest: list↔assert same resolver |
| **VAL-ATT-OT-CNS-04** | Soft-retire | Create với type retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · AC-PLT-ATT-OT-01e | After Nest soft-delete |
| **VAL-ATT-OT-CNS-05** | Empty EFF | EFF=0 · invent unknown type | Assert **skip** · soft empty + CTA · **no seed** · hardcode bootstrap OK | AC-PLT-ATT-OT-01c · L-ATT-OT-06 | Bootstrap three OK only EFF=0 |
| **VAL-ATT-OT-CNS-06** | Settings-only / FE hardcode SoT | FE bind D4 stub hoặc hardcode **without** Nest EFF when EFF >0 | **FAIL** AC-PLT-ATT-OT-01 / 01f | L-ATT-OT-02/03 · BR-PLT-ATT-OT-04 | **GAP FE** rebind EFF · kill closed-3 sole |
| **VAL-ATT-OT-CNS-07** | Display-ready | List/get when type ∈ catalog | `name_vi` + `default_coefficient` from catalog (or safe fallback) | BR-PLT-ATT-OT-06 · L-ATT-OT-12 | BE display-ready · FE không invent join |
| **VAL-ATT-OT-CNS-08** | KEY taxonomy | Invent OT type vs invent SHIFT/LEAVE/LVRULE/CTR | OT → **`HRM-ATT-OT-TYPE-KEY`** only — **không** lẫn | BR-PLT-ATT-OT-11 · L-ATT-OT-08 | Regression orthogonal KEY |
| **VAL-ATT-OT-CNS-09** | Formula non-claim | Diff/evidence claims formula LIVE / flip payroll_e2e | **FAIL process** / QA residual | BR-PLT-ATT-OT-08 · AC-PLT-ATT-OT-01f/01H | Coeff ≠ formula |
| **VAL-ATT-OT-CNS-10** | Orthogonal non-fold | Diff reopens work_shifts invent KEY / folds OT into shifts | **FAIL process** | BR-PLT-ATT-OT-07 · L-ATT-OT-08 | SHIFT CITE OUT reverse OWN |

### 6.3 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-CTR-KEY-01** | CTR-TEMPLATE KEY LIVE · CTR-CLAUSE `body_vi` **SEAL RETAIN** | Reopen CTR invent KEY seats |
| **MK-ATT-LVRULE-01** | ATT leave-balance / FE LVRULE 01g **HOLD RETAIN** | Invent FE LVRULE as mandatory |
| **MK-ATT-CODE-01** | ATT-CODE L1 **SEAL RETAIN** | Fold OT into day-code / reopen |
| **MK-ATT-WS-01** | ATT worksite **SEAL RETAIN** | Fold / reopen |
| **MK-ATT-SHIFT-01** | ATT-SHIFT L1 **SEAL RETAIN** · OT orthogonal | Reopen SHIFT invent KEY / treat OT as shift consumer field |
| **MK-ATT-LEAVE-01** | Leave-type L1 **SEAL RETAIN** | Fold / reopen |
| **MK-ATT-AGG-01** | Aggregate / LIST-TOTALS **SEAL RETAIN** | Rewrite aggregate / claim payroll ready |
| **MK-HONESTY-01** | attendance / payroll / printable **false** | Flip flags |
| **MK-FORMULA-01** | Formula LIVE **HOLD** | Claim default_coefficient = formula LIVE |

### 6.4 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `UF-HRM-ATT-OT-01`** | Tăng ca create bind Nest type when EFF>0 (**01**) | U65 browser · post-mutation FE + F5 |
| **Proposed `UF-HRM-ATT-OT-01b`** | Invent `overtime_type` → 4xx `HRM-ATT-OT-TYPE-KEY` (**01b**) | Network KEY proof |
| **Proposed `UF-HRM-ATT-OT-01c`** | EFF=0 soft empty + CTA · admin still CREATE (**01c**) | zero-seed · NOTE_BLOCKED OK without wipe |
| **Proposed `UF-HRM-ATT-OT-01d`** | Admin CREATE N+1 → F5 → consumer picker (**01d**→**01**) | |
| **Proposed `UF-HRM-ATT-OT-01e`** | Soft-retire → picker ẩn · history OK (**01e**) | |
| **Proposed `J-HRM-ATT-OT-01`** | Admin CREATE → list→create picker cross-nav (**01d**→**01**) · U19 | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-ATT-OT-02`** | Invent KEY on create (**01b**) | |
| **Proposed `J-HRM-ATT-OT-03`** | Empty EFF CTA path (**01c**) | |
| **Proposed `J-HRM-ATT-OT-04`** | Soft-retire + history (**01e**) | |
| Reuse | **UF-HRM-05** · **J-HRM-06** / **J-HRM-06b** / **J-HRM-06c** | Load / sheet / sign — **RETAIN**; **cấm** reopen / claim UAT |
| Cross-nav U19 | OT list→detail · F5 · type label | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup `main`) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

**BA_TRACE:** promote `J-HRM-ATT-OT-*` into `PILOT_BUSINESS_FLOW_BA_TRACE.md` **OPTIONAL** after Nest consumer LIVE + QA stamp — **không** claim journey PASS from this docs seat.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-ATT-OT-TYPE-KEY`** | Consumer invent / OOS `overtime_type` khi EFF active >0 | **4xx** (400) | Banner/field VI — không toast success · không persist |
| **`HRM-ATT-OT-404`** | OOS get-by-id catalog | 404 | Honest empty/banner |
| **`HRM-ATT-OT-409`** | Scope mismatch mutate/assert | 409 | Honest empty/banner |
| **`HRM-ATT-OT-VAL`** | Admin format (empty code/name, bad coeff) | 4xx | Admin form |
| Peer `HRM-ATT-SHIFT-KEY` | Shift invent (orthogonal) | 4xx | **MUST NOT** synonym OT invent |
| Peer `HRM-ATT-LVRULE-KEY` / `HRM-LEAVE-TYPE-UNKNOWN` / CTR KEY | Orthogonal | 4xx | **MUST NOT** synonym |

**Taxonomy rule (peer CTR KEY):** 404 / CODE-INVALID / VAL **≠** invent KEY. Invent path must stamp **`HRM-ATT-OT-TYPE-KEY`** only.

**Cấm:** 2xx + orphan overtime_type when EFF>0; 500 trên invent; FE format-pass bỏ qua membership; nhầm OT KEY với SHIFT/LEAVE/LVRULE/CTR; claim hardcode three = SoT when EFF>0; claim formula LIVE.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — **DENIED** flip |
| `payroll_e2e_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — **DENIED** flip |
| CTR KEY / clause | **SEAL RETAIN** — **DENIED** reopen |
| ATT leave-balance / FE LVRULE 01g | **HOLD RETAIN** — **DENIED** invent FE |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** — **DENIED** reopen |
| Module ATT/PAY UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Settings/D4 sole SoT | **DENIED** |
| Mega-EAV / dual writers / fold shifts·code·leave·worksite | **DENIED** |
| Face / device LIVE | **DENIED** |
| Seed | **DENIED** (U65) |
| Formula LIVE / default_coefficient as engine GO | **DENIED** |
| `C-SLICE-≠-MODULE` | OT type catalog AC pack ≠ module ATT/PAY UAT |
| ba-data | **UNLOCK** parallel DATA-01 — ADD `att_ot_type` |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest SoT wording | **OPTIONAL** | ADD-only: «danh mục loại tăng ca = Nest `att_ot_type`; Settings/D4 ≠ sole SoT; ≠ ca làm việc» — **không** wipe SHIFT/CTR FR |
| Journey rows J-HRM-ATT-OT-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.4 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data EXPAND | **YES** parallel | Nest absent DEFINE |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA **CONFIRMED** · ensure parallel **DATA-01** completes · **HOLD BE** until DATA CONFIRMED · then unlock BE→FE→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.att_ot_type` (or stamped synonym) · UQ `(company_id, lower(code))` · soft-delete · `default_coefficient` · scope · F-ATT-CAT-OT map · **FORBIDDEN** mega-EAV / fold into `work_shifts` · **no seed** | CONFIRMED DATA |
| **dev-be** | **After BA+DATA:** Nest ensureSchema + F-ATT-CAT-OT-01/02 + EFF · invent KEY on OT create · display-ready · jest VAL-ATT-OT-CNS-* · **FORBIDDEN** formula LIVE / reopen SHIFT / invent FE LVRULE | READY_FOR_QA |
| **dev-fe** | After BE: rebind `OvertimeRequestTab` Select/filter/badge to Nest EFF when count>0; hardcode three **only** EFF=0; empty soft+CTA; **FORBIDDEN** invent FE LVRULE 01g | READY_FOR_QA |
| **qa** | U65 AC-PLT-ATT-OT-01/01b/01c/01d/01e/01f/01H · VAL CNS · zero-seed · no attendance/payroll/printable flip · seals untouched · no formula claim | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain · **C-SLICE-≠-MODULE** | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After Nest LIVE if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | FE `OvertimeRequestTab` closed-3 + `getCoefficient` | Allowed **only** EFF=0 bootstrap; **must** rebind Nest EFF when EFF>0 (**VAL-ATT-OT-CNS-06** · **01**) |
| R2 | BE free `@IsString()` overtime_type | **Mandatory** KEY assert via DATA+BE (**VAL-ATT-OT-CNS-01**) — residual until DATA |
| R3 | Confusion with work_shifts / ATT-SHIFT | **L-ATT-OT-08** · OWN reverse of **S-ATT-SHIFT-CITE-01** · OUT surfaces §4 |
| R4 | `default_coefficient` misread as payroll formula | **01f** · **01H** · **VAL-ATT-OT-CNS-09** — HOLD forever this seat alone |
| R5 | D4 stub treated as SoT | **L-ATT-OT-03** · Option A REJECT |
| Q1 | Exact Nest admin tab label VI | Dev-FE product copy — process: «Loại tăng ca» / «Danh mục OT type» |
| Q2 | Mobile OT create in-scope? | Optional **S-ATT-OT-CNS-05** — same KEY rules if surface exists; else OUT |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **UNLOCK** (parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01` — do not wait) |
| **BE** | **HOLD** until BA **+** DATA CONFIRMED |
| **next_owner** | **pm** → seal BA · await/seal **ba-data** CONFIRMED → then **dev-be** (F-ATT-CAT-OT + CNS KEY · **no** formula LIVE · **no** reopen SHIFT/CTR · **no** invent FE LVRULE) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-ba-01.md` |
