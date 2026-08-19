# BA AC/BR — EMP employment status / reason catalog Option B · Nest SoT ≠ Settings MD / fold ET·custom

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01` **CONFIRMED** Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **UNLOCK** (parallel `…-EMP-STATUS-CATALOG-DATA-01` · Nest **absent**) · BE **HOLD** until BA **+** DATA · FE/mobile hardcode sole SoT **GAP** (rebind Nest EFF) · closed `chk_employees_status` **DROP residual after DATA** · personnel / module EMP UAT / reopen EMP-CUSTOM·EXT **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **no** wipe platform BA-01 · EMP-CUSTOM CNS L1 · MergeToken EXT · DOC/ET · ATT/SI/CTR/enrollment) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md) L-EMP-ST-01..14 · F.1 · §7 draft |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 Employment status / reason · **BR-PLT-02/04/05/06** · §2.6 closed product enum clarification |
| **ref_peer_emp_custom** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md) Option **A** — **pattern cite ≠ copy** · CNS L1 **SEAL RETAIN** |
| **ref_peer_emp_doc_et** | EMP DOC/ET Nest Option **B** · **AC-PLT-EMP-02/04*** — **orthogonal** (`employment_type` ≠ `employment_status`) · **SEAL RETAIN** |
| **ref_peer_att_si** | ATT leave/worksite · SI type/insurer Option **B** admin open ≠ consumer invent |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-CUSTOM CNS L1 · MergeToken EXT · DOC/ET · ATT/SI/CTR/enrollment **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · **DENY** module EMP UAT |
| **Cấm** | `apps/**` · seed · Settings MD sole SoT · mega-EAV · fold into ET/custom/DOC · flip personnel · reopen EMP-CUSTOM/EXT/ATT/SI/CTR · invent module EMP UAT · Phase1 DONE · BE before BA+DATA |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **B** (SA LOCKED):

1. **Status SoT** = Nest **`public.emp_employment_status`** via **F-EMP-CAT-ST-*** / **F-EMP-CAT-ST-EFF-01** — Settings `employee_statuses` / `employment_statuses` = **group REF merge-read only** (**BR-PLT-06** · **L-EMP-ST-01/03**).
2. **Reason SoT (companion)** = Nest **`public.emp_status_reason`** via **F-EMP-CAT-STR-*** / **EFF** — when status `requires_reason=true` **or** reason EFF>0 on that transition (**L-EMP-ST-02**).
3. **Catalog admin** = **open CREATE N+1** status + reason (**BR-PLT-05** · **AC-PLT-EMP-STATUS-01d** · reason companion admin).
4. **Consumers** khi Nest/EFF status active **>0** = picker/FK only từ **GET …/employment-statuses/effective** (**BR-PLT-02** · **AC-PLT-EMP-STATUS-01**); invent → **`HRM-EMP-STATUS-KEY`** (**01b**).
5. Reason invent khi required / reason EFF>0 → **`HRM-EMP-STATUS-REASON-KEY`** (**VAL-EMP-STR-CNS-*** · companion).
6. Empty EFF → soft empty + CTA Settings · invent assert **skip** · **no seed** · FE hardcode fallback **chỉ** khi EFF=0 bootstrap (**AC-PLT-EMP-STATUS-01c** · **L-EMP-ST-06**).
7. Soft-retire status/reason → hide picker · history employee keys OK (**01** soft-retire path · **BR-PLT-04**).
8. **Drop** closed `chk_employees_status CHECK (status IN ('active','inactive'))` as product ceiling — **ba-data residual** (slug format CHK OK) (**L-EMP-ST-04**).
9. **DENY** Settings-MD-alone · mega-EAV · fold into ET/custom · personnel flip · reopen EMP-CUSTOM/EXT/ATT/SI/CTR · module EMP UAT · Phase1.
10. Transition **graph** (illegal reverse) may remain **code** — **FORBIDDEN** claim this seat rewrites full SM (**L-EMP-ST-07**).

### Actors

| Actor | Role |
|-------|------|
| HCNS Settings — tab **Trạng thái NV / Status** (Nest admin) | CRUD Nest `emp_employment_status` (mở N+1) · retire soft · typed flags |
| HCNS Settings — **Lý do trạng thái / Status reasons** | CRUD Nest `emp_status_reason` (mở N+1) · optional `applies_to_status_keys` |
| HCNS NS (HR) | Employee create/update — chọn `status` ∈ EFF · reason khi required |
| ESS (narrow) | Self-view/status display — **must_keep** ESS scope; **cấm** widen admin catalog |
| Group CEO | Scope rollup `main` / member — cùng resolve list↔assert (**U19**) |
| System | Effective union (Nest wins vs Settings REF) · soft-delete hide · KEY codes · `status_label` display-ready |
| SA / ba-data / Dev-BE / Dev-FE / Dev-Mobile / QA | F.1 · physical ADD · drop CHECK · assert + picker rebind · U65 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-EMP-STATUS-01 / 01b / 01c / 01d / 01H** · **VAL-EMP-ST-CNS-*** · **VAL-EMP-STR-CNS-*** (reason companion) · BR-PLT-EMP-ST-* · surface matrix + UF/J-* pointers | Impl `apps/**` / migration / seed |
| Enumerate consumers: employee create/update `status` (+ reason when required) · display `status_label` | Claim module EMP UAT · flip personnel/e2e/printable |
| Orthogonality cite DOC/ET · EMP-CUSTOM · MergeToken EXT | Fold status into `emp_employment_type` / custom-field / DOC · reopen seals |
| ba-data **UNLOCK** pointer (Nest absent · CHECK DROP residual) | Rewrite full status-machine product as this seat alone |
| Align BA-01 GĐ1 «hardcode list remains» · SA Option B | Wipe EMP-CUSTOM CNS L1 · EXT · ATT/SI/CTR |

**Numbering note (peer align):** SA §7 draft mapped **01**=admin CREATE; this pack uses **peer SI/ATT convention**: **01**=consumer picker · **01b**=invent KEY · **01c**=empty EFF · **01d**=admin CREATE N+1 · **01H**=honesty — SA intent preserved; IDs measurable for QA.

---

## 1. As-is vs to-be

| | AS-IS (SA evidence) | TO-BE (Option B · this pack) |
|---|---------------------|------------------------------|
| Status code SoT | Settings key lookup `employee_statuses`/`employment_statuses` + **FE hardcode** `active\|probation\|inactive` when empty; BE/mobile hardcode label maps; **no** Nest table | Nest **`emp_employment_status`** via **F-EMP-CAT-ST/EFF**; Settings = **REF merge-read only** |
| Reason SoT | Free-text / absent dedicated picker | Nest **`emp_status_reason`** companion when required / EFF>0 |
| Admin create | Settings MD (orphan) · not named Nest admin AC | **F-EMP-CAT-ST-02** / **F-EMP-CAT-STR-02** open N+1 (**01d**) |
| Consumer | Employee form status; invent not sealed KEY | Assert ∈ Nest EFF when >0 → **`HRM-EMP-STATUS-KEY`** / reason **`HRM-EMP-STATUS-REASON-KEY`** |
| DB | `chk_employees_status CHECK IN ('active','inactive')` closed ceiling | **DROP** enum ceiling after DATA (**EXPAND**) — keep text column |
| EMP-CUSTOM / EXT / DOC/ET | LIVE sealed orthogonal | **SEPARATE SEAL RETAIN** — **FORBIDDEN** fold / reopen |
| Honesty | Risk flip personnel / invent module EMP UAT | Flags **false** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | Nest/EFF status active **>0** | Consumer SoT = picker/FK `status` ∈ effective | Free-text invent → **4xx** `HRM-EMP-STATUS-KEY` |
| **BR-PLT-04** | Retire / `archived_at` | Soft-delete | Picker default ẩn; past employee keys còn (**history**) |
| **BR-PLT-05** | Admin CREATE | Open slug N+1 · format/UQ only | **FORBIDDEN** ceiling / «must pick existing only» on F-EMP-CAT-ST-02 / STR-02 |
| **BR-PLT-06** | Dual SoT | Nest tenant writer = SoT; Settings/XBOS partitions = REF merge-read; Nest wins collision | **FORBIDDEN** dual master write / MD sole SoT |
| **L-EMP-ST-01** | Status SoT | Nest `emp_employment_status` | Settings MD alone / FE hardcode sole when EFF>0 **REJECT** |
| **L-EMP-ST-02** | Reason SoT | Nest `emp_status_reason` when required / EFF>0 | Free-text SoT in that class **REJECT** |
| **L-EMP-ST-04** | Admin open | CREATE N+1 | **FORBIDDEN** restore `CHECK IN (active, inactive)` ceiling |
| **L-EMP-ST-05** | Consumer invent | Membership ∈ EFF | Format-only **không** bypass |
| **L-EMP-ST-06** | Active count =0 | Soft empty + CTA · invent skip | **FORBIDDEN** seed / hardcode-as-SoT claim |
| **L-EMP-ST-07** | Transition graph | Illegal reverse may stay **code** | **FORBIDDEN** claim full SM rewrite this seat |
| **L-EMP-ST-08..14** | Orthogonal / seals / honesty / soft-delete / scope / display / mega-EAV | OUT / RETAIN / false / U19 / display-ready / DENY | See §8 |

---

## 3. EMP status/reason business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-EMP-ST-01** | Surface = **catalog admin** (`POST/PUT` F-EMP-CAT-ST-02) | Cho phép `status_key` mới hợp lệ slug (N+1) + typed flags | **2xx/201** · list + F5 còn — **không** «must pick existing only» |
| **BR-PLT-EMP-ST-02** | Surface ∈ **consumer set** (§4) **và** EFF status active **>0** | Body/field `status` **phải** ∈ effective active | Ngoài set → **`HRM-EMP-STATUS-KEY`** — format-only **không** bypass |
| **BR-PLT-EMP-ST-03** | EFF status active **=0** trên consumer | Soft empty picker + VI/CTA «Cài đặt → Trạng thái NV»; invent assert **skip**; admin vẫn CREATE | Seed/fake rows / FE hardcode-as-SoT claim = **FAIL U65** |
| **BR-PLT-EMP-ST-04** | Settings MD / REF `employee_statuses`/`employment_statuses` | Merge-read into EFF only | **FORBIDDEN** sole SoT cho consumer picker khi Nest live |
| **BR-PLT-EMP-ST-05** | Status `requires_reason=true` **hoặc** reason EFF>0 trên transition in-scope | Reason field **phải** ∈ reason EFF | Invent → **`HRM-EMP-STATUS-REASON-KEY`** |
| **BR-PLT-EMP-ST-06** | Reason EFF=0 **và** status không `requires_reason` | Reason optional / skip invent | **cấm** force invent when reason catalog empty |
| **BR-PLT-EMP-ST-07** | Admin reason CREATE (`F-EMP-CAT-STR-02`) | Open `reason_key` N+1 | **2xx** · F5 · picker (when applicable) thấy mã |
| **BR-PLT-EMP-ST-08** | Retire status/reason còn history | Soft-delete; consumer **không** chọn retired trên create mới | History employee cũ vẫn đọc được key + `status_label` safe fallback |
| **BR-PLT-EMP-ST-09** | Display list/get | Prefer catalog `name_vi` → `status_label` when known | FE **cấm** invent join label khi BE provides (**L-EMP-ST-13**) · hardcode map **chỉ** EFF=0 bootstrap |
| **BR-PLT-EMP-ST-10** | Closed DB CHECK ceiling | ba-data **EXPAND** drop `chk_employees_status` enum IN | **FORBIDDEN** reintroduce as product ceiling after DATA |
| **BR-PLT-EMP-ST-11** | `emp_employment_type` / EMP-CUSTOM / DOC | Orthogonal catalogs | **FORBIDDEN** fold status into ET / custom-field / DOC |
| **BR-PLT-EMP-ST-12** | Transition legality (illegal reverse) | May remain **code** guards | **OUT** rewrite full SM — codes open ≠ graph rewrite |
| **BR-PLT-EMP-ST-13** | ba-data | Nest **absent** | **UNLOCK ADD** `emp_employment_status` + `emp_status_reason` — **FORBIDDEN** mega-EAV / second table fold |
| **BR-PLT-EMP-ST-14** | Scope | list ↔ get-by-id ↔ consumer assert | Same `resolveHrmListScope` (**U19**) |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| **AC-PLT-EMP-CUSTOM-01*** CNS L1 | **SEAL RETAIN** — Option A Settings extension · **≠** status SoT · **cấm reopen** |
| MergeToken EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — **cấm reopen** |
| **AC-PLT-EMP-02/04*** DOC/ET | **SEAL RETAIN** · `employment_type` ≠ `employment_status` |
| **AC-PLT-ATT-*** / **AC-PLT-SI-*** | Named peer pattern (admin open ≠ consumer Nest SoT) — **RETAIN** · **cấm reopen** |
| **AC-PLT-EMP-01** position/dept | XBOS REF — **must_keep** · **OUT** this pack |
| BA-01 §2.6 | Closed **transition graph** OK in code; **allowed status/reason code list** = **open catalog** |

**SUPERSEDED / FORBIDDEN:** Option A Settings-MD-only picker SoT · Option C hybrid/mega-EAV/fold/UAT invent · invent `hrm_personnel_uat_ready=true` / e2e/printable · reopen EMP-CUSTOM/EXT/DOC-ET/ATT/SI/CTR · claim module EMP UAT · hard-delete status còn history · restore CHECK IN ceiling · FE hardcode sole SoT when Nest EFF>0.

---

## 4. Consumer surface inventory (authoritative)

> **Admin ≠ consumer.** Mọi AC «picker khi EFF ≠ empty» / invent KEY áp **consumer rows** — **không** áp lên F-EMP-CAT-ST-02 / STR-02.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS → TO-BE) | Field SoT | Mutate / bind path | Class |
|---------|-------------------|----------------------------------|-----------|-------------------|-------|
| **S-EMP-ST-ADM-01** | Nest employment **status** admin | Settings → **Trạng thái NV** (Nest panel — **ADD** after DATA/BE) | `status_key` open N+1 + flags | **F-EMP-CAT-ST-02** | **ADMIN** |
| **S-EMP-ST-ADM-02** | Nest **status reason** admin | Settings → **Lý do trạng thái** | `reason_key` open N+1 | **F-EMP-CAT-STR-02** | **ADMIN** (companion) |
| **S-EMP-ST-CNS-01** | **Employee** create/update — status (primary) | HRM → Nhân sự → form NV (`EmployeeFormDialog` AS-IS Settings+hardcode) | `status` | POST/PATCH employees · assert ∈ EFF | **CONSUMER** (primary) |
| **S-EMP-ST-CNS-02** | Employee status **reason** (when required / reason EFF>0) | Same form / status-change dialog | reason key | **F-EMP-ST-CNS-02** | **CONSUMER** (companion) |
| **S-EMP-ST-CNS-03** | List/get **display** `status_label` | Employees list/detail / mobile profile | label from catalog | **F-EMP-ST-CNS-03** | **CONSUMER display** |
| **S-EMP-ST-REF-01** | Settings MD / group REF partitions | `employee_statuses` / `employment_statuses` | REF items | Merge-read into EFF only | **REF only** — **not** picker SoT |
| **S-EMP-ST-OUT-01** | EMP **employment_type** Nest | Form NV / YCTD ET picker | `employment_type` | F-EMP-CAT-ET/EFF | **OUT** · **SEAL RETAIN** DOC/ET |
| **S-EMP-ST-OUT-02** | EMP-CUSTOM extension-items + MergeToken EXT | Settings fields / `custom_fields` | extension codes | F-EMP-CF / F-EMP-TOK-03 | **OUT** · **SEAL RETAIN** |
| **S-EMP-ST-OUT-03** | DOC types Nest | Checklist hồ sơ | `document_type_key` | F-EMP-CAT-DOC | **OUT** · **SEAL RETAIN** |
| **S-EMP-ST-OUT-04** | ATT leave/worksite · SI · CTR · enrollment | Peer packs | — | — | **OUT** · **SEAL RETAIN** |
| **S-EMP-ST-OUT-05** | Position / dept XBOS | AC-PLT-EMP-01 | — | settings REF | **OUT** · **must_keep** |
| **S-EMP-ST-OUT-06** | Full status-machine rewrite (illegal reverse product) | Lifecycle guards | — | code residual OK | **OUT** this pack (**L-EMP-ST-07**) |

**Pointer:** Load-only personnel host journeys — **RETAIN**; mutate depth = proposed **J-HRM-EMP-ST-CAT-*** — **cấm** claim personnel UAT from load-only.

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-EMP-ST-01** | Admin — CREATE Nest status N+1 | Settings Trạng thái NV → mã mới hợp lệ → Lưu **201** → list có row → **F5** còn → consumer picker thấy mã | Sửa label / flags / sort | Format invalid · UQ · scope 409 · «must pick only» sai áp |
| **UC-PLT-EMP-ST-01b** | Admin — CREATE reason N+1 | Settings Lý do → mã mới → **201** → F5 | `applies_to_status_keys` filter | Format · UQ |
| **UC-PLT-EMP-ST-02** | Consumer — employee pick EFF status | EFF ≥1 → form NV → **picker** Network GET `…/employment-statuses/effective` → chọn mã → Lưu **2xx** → F5 · `status_label` đúng | Filter retired hidden | Free-text SoT · MD-only SoT · invent → **4xx** `HRM-EMP-STATUS-KEY` · FE hardcode sole when EFF>0 |
| **UC-PLT-EMP-ST-03** | Consumer — reason when required | Status requires_reason / reason EFF>0 → pick reason ∈ EFF → **2xx** | Omit when not required + reason EFF=0 | Invent reason → **`HRM-EMP-STATUS-REASON-KEY`** |
| **UC-PLT-EMP-ST-04** | Empty EFF | Active=0 → soft empty + CTA admin; invent skip; admin vẫn CREATE; bootstrap hardcode map **chỉ** EFF=0 | Optional REF sync CTA | Seed fake density / hardcode-as-SoT claim when Nest EFF>0 |
| **UC-PLT-EMP-ST-05** | Soft-retire | Retire status → picker ẩn; employee history vẫn đọc key | Reactivate if product allows | Hard-delete · wipe history |
| **UC-PLT-EMP-ST-06** | Scope parity | List EFF scope X = assert consumer scope X | Member 409 OOS | Drift list vs assert |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings
  actor HR as HCNS_NS
  participant Nest as F_EMP_CAT_ST
  participant Eff as F_EMP_CAT_ST_EFF
  participant Reason as F_EMP_CAT_STR
  participant Emp as Employees_API

  Admin->>Nest: POST F-EMP-CAT-ST-02 status_key N+1 (open)
  alt Ceiling / must-pick-only sai áp admin
    Nest-->>Admin: FAIL — vi phạm BR-PLT-05 / L-EMP-ST-04
  else 201
    Nest-->>Admin: Row active; F5 còn
  end
  Admin->>Reason: POST F-EMP-CAT-STR-02 reason_key N+1 (optional companion)
  Reason-->>Admin: 201; F5 còn
  HR->>Eff: GET employment-statuses/effective
  alt Active count = 0
    Eff-->>HR: Soft empty + CTA; invent skip; cấm seed
  else Active count > 0
    HR->>Emp: Luu NV status
    alt status invent / OOS
      Emp-->>HR: 4xx HRM-EMP-STATUS-KEY
    else OK and reason required / reason EFF>0
      alt reason invent
        Emp-->>HR: 4xx HRM-EMP-STATUS-REASON-KEY
      else OK
        Emp-->>HR: 2xx; F5 status + label ∈ catalog
      end
    end
  end
  Note over Emp: EMP-CUSTOM EXT DOC/ET ATT/SI/CTR RETAIN · personnel flip DENIED
```

---

## 6. Acceptance criteria (measurable · U65)

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe sealed EMP-CUSTOM CNS L1 / MergeToken EXT / DOC/ET / ATT / SI / CTR / enrollment.  
> **BE HOLD** until DATA CONFIRMED — AC dưới đây = **gate cho unlock** execution (không claim LIVE trước Nest).

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-EMP-STATUS-01** | **S-EMP-ST-CNS-01** (primary) | EFF status active **≥1** (từ admin — **không** seed): mở form NV → UI = **picker** nguồn **Network GET** `/api/hrm/employees/employment-statuses/effective` (path per F.1) → chọn mã Nest/EFF → Lưu **2xx** → list/detail hiện đúng status + `status_label` → **F5** còn ∈ catalog | Free-text Input là SoT · picker chỉ Settings MD · FE hardcode sole SoT khi EFF>0 · 2xx với mã không ∈ EFF · chỉ API PASS |
| **AC-PLT-EMP-STATUS-01b** | **S-EMP-ST-CNS-01** invent (+ companion **S-EMP-ST-CNS-02** khi in-scope) | EFF status **≥1**: cố ý nhập/POST `status` **không** ∈ effective → FE chặn và/hoặc Network **4xx** **`HRM-EMP-STATUS-KEY`** → **không** persist sau F5. Khi reason required / reason EFF>0: invent reason → **4xx** **`HRM-EMP-STATUS-REASON-KEY`** | 2xx invent · silent accept · format-only bypass · nhầm KEY với CUSTOM-FIELD / ET KEY · reason free-text SoT khi required |
| **AC-PLT-EMP-STATUS-01c** | Consumers khi EFF status **=0** | Soft empty picker + VI/CTA Settings **Trạng thái NV**; invent assert **skip**; **không** fake starter chỉ để pass UF; admin **S-EMP-ST-ADM-01** vẫn CREATE được; bootstrap label map **chỉ** khi EFF=0 — **cấm** claim hardcode = SoT | Seed/script density · fake rows · hardcode-as-SoT khi Nest EFF later live · MD-only «green» khi Nest/EFF=0 |
| **AC-PLT-EMP-STATUS-01d** | **S-EMP-ST-ADM-01** (+ companion **S-EMP-ST-ADM-02**) | Catalog admin CREATE status mã **#N+1** (slug hợp lệ) → Network **2xx/201** `F-EMP-CAT-ST-02` → list có row → **F5** còn → consumer picker thấy mã — **không** reject «must pick existing only». Reason admin CREATE N+1 tương tự `F-EMP-CAT-STR-02` | Áp invent ban lên admin · ceiling starter · closed enum CHK IN · reject N+1 |
| **AC-PLT-EMP-STATUS-01H** | Honesty / seals | Evidence ghi rõ: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-CUSTOM CNS L1 **SEAL RETAIN** · MergeToken EXT **`EMPTOKEXTQA-MSJ57PE1` SEAL RETAIN** · DOC/ET · ATT · SI · CTR · enrollment **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · **DENY** module EMP UAT · **DENY** fold into ET/custom · **DENY** Settings MD sole SoT · **DENY** mega-EAV · closed CHECK drop = DATA residual (not BA flip) | Flip ready · reopen EMP-CUSTOM/EXT/ATT/SI · invent personnel UAT · claim module EMP UAT / Phase1 · fold status into ET/custom |

### 6.2 Soft-retire deepen (same pack · measurable)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-EMP-STATUS-RETIRE** | **S-EMP-ST-ADM-01** → consumers | Soft-retire status → default picker **ẩn** mã · employee history vẫn đọc key / safe label · create mới **không** chọn retired | Hard-delete · wipe history · picker vẫn show retired as default |

### 6.3 Consumer VAL — status (BE/QA measurable)

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-EMP-ST-CNS-01** | Employee **S-EMP-ST-CNS-01** | `status` OOS khi EFF >0 | **4xx** `HRM-EMP-STATUS-KEY` | AC-PLT-EMP-STATUS-01b · BR-PLT-EMP-ST-02 | **MIGRATE** after DATA+BE — replace hardcode/MD-only assert |
| **VAL-EMP-ST-CNS-02** | Settings-only / FE hardcode SoT | FE bind MD hoặc hardcode **without** Nest EFF when EFF >0 | **FAIL** AC-PLT-EMP-STATUS-01 | L-EMP-ST-01 · BR-PLT-EMP-ST-04 | **GAP FE** rebind EFF · **FORBIDDEN** hardcode sole SoT |
| **VAL-EMP-ST-CNS-03** | Empty EFF | EFF=0 · invent unknown status | Assert **skip** · soft empty + CTA · **no seed** | AC-PLT-EMP-STATUS-01c · L-EMP-ST-06 | Bootstrap map OK only EFF=0 |
| **VAL-EMP-ST-CNS-04** | Scope | List EFF scope ≠ assert consumer scope | jest **FAIL** scope_parity · runtime 409/4xx deterministic | L-EMP-ST-12 · U19 | After Nest: list↔assert same resolver |
| **VAL-EMP-ST-CNS-05** | Retire | Create với mã retired (default picker) | Reject / not in default picker; history còn | BR-PLT-04 · BR-PLT-EMP-ST-08 | After Nest soft-delete |
| **VAL-EMP-ST-CNS-06** | Closed CHECK residual | Persist open slug (e.g. `probation`) after DATA | **No** DB CHECK reject enum ceiling | BR-PLT-EMP-ST-10 · L-EMP-ST-04 | **ba-data DROP** `chk_employees_status` IN — residual until DATA CONFIRMED |
| **VAL-EMP-ST-CNS-07** | Display | List/get when status ∈ catalog | `status_label` from catalog (or safe fallback) | BR-PLT-EMP-ST-09 · L-EMP-ST-13 | BE display-ready · FE không invent join |
| **VAL-EMP-ST-CNS-08** | KEY taxonomy | Invent status vs invent ET / custom-field | Status → **`HRM-EMP-STATUS-KEY`**; ET / custom keep peer keys — **không** lẫn | L-EMP-ST-08 | Regression orthogonal KEY |

### 6.4 Reason companion VAL

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-EMP-STR-CNS-01** | **S-EMP-ST-CNS-02** | invent reason khi `requires_reason` **or** reason EFF>0 | **4xx** `HRM-EMP-STATUS-REASON-KEY` | AC-PLT-EMP-STATUS-01b companion · BR-PLT-EMP-ST-05 | After DATA+BE |
| **VAL-EMP-STR-CNS-02** | Reason not required + reason EFF=0 | omit reason | **2xx** OK (skip invent) | BR-PLT-EMP-ST-06 | **cấm** force invent |
| **VAL-EMP-STR-CNS-03** | Admin reason CREATE | N+1 `reason_key` | **2xx** · F5 · picker (when applicable) | AC-PLT-EMP-STATUS-01d companion · BR-PLT-EMP-ST-07 | Admin ≠ consumer invent ban |
| **VAL-EMP-STR-CNS-04** | Retire reason | Create với retired reason | Reject / not in default picker; history OK | BR-PLT-04 | Soft-delete |

### 6.5 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-EMP-CF-CNS-01** | EMP-CUSTOM CNS L1 GWC **SEAL RETAIN** · `HRM-EMP-CUSTOM-FIELD-KEY` untouched | Reopen custom-field suite / fold status into extension-items |
| **MK-EMP-EXT-01** | MergeToken EXT **`EMPTOKEXTQA-MSJ57PE1` SEAL RETAIN** · F-EMP-TOK-03 | Reopen EXT / second register path |
| **MK-EMP-DOC-ET-01** | DOC/ET Nest **AC-PLT-EMP-02/04*** **SEAL RETAIN** · ET ≠ status | Fold status into `emp_employment_type` |
| **MK-EMP-POS-01** | **AC-PLT-EMP-01** position/dept XBOS REF | Invent `emp_position` dual master |
| **MK-ATT-SI-CTR-01** | ATT / SI / CTR / enrollment seals **RETAIN** | Reopen peer seals |
| **MK-HONESTY-01** | personnel / e2e / printable **false** | Flip flags |
| **MK-SM-GRAPH-01** | Illegal reverse guards may remain code | Claim this seat = full SM rewrite |

### 6.6 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-EMP-ST-CAT-01`** | Admin CREATE status N+1 → F5 → employee picker thấy mã (**01d** → **01**) | ba-docs ADD after Nest LIVE |
| **Proposed `J-HRM-EMP-ST-CAT-02`** | Invent status trên NV → 4xx `HRM-EMP-STATUS-KEY` (**01b**) | U65 browser |
| **Proposed `J-HRM-EMP-ST-CAT-03`** | EFF=0 soft empty + CTA · admin still CREATE (**01c**) | zero-seed |
| **Proposed `J-HRM-EMP-ST-CAT-04`** | Reason invent → `HRM-EMP-STATUS-REASON-KEY` when required | Companion |
| **Proposed `J-HRM-EMP-ST-CAT-05`** | Soft-retire → picker ẩn · history OK | RETIRE |
| Reuse | Personnel load hosts (UF/J-* load-only) | **RETAIN**; **cấm** UAT flip |
| Cross-nav U19 | Employee list→detail · F5 · status label | AC mỗi list mutate kèm deep link/F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-EMP-STATUS-KEY`** | Consumer invent / OOS `status` khi EFF status active >0 | **4xx** | Banner/field VI — không toast success · không persist |
| **`HRM-EMP-STATUS-REASON-KEY`** | Consumer invent / OOS reason khi required / reason EFF>0 | **4xx** | Same class — **≠** STATUS-KEY |
| `HRM-PLT-CAT-CODE-INVALID` | Admin format only (status/reason) | 4xx | Admin form |
| `HRM-PLT-CAT-CODE-CONFLICT` | Admin UQ | 4xx | Admin form |
| Peer `HRM-EMP-CUSTOM-FIELD-KEY` / ET invent | Orthogonal | 4xx | **MUST NOT** synonym status invent |
| Scope mismatch | Consumer assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx + orphan status; 500 trên invent; FE format-pass bỏ qua membership; nhầm STATUS-KEY với REASON-KEY / CUSTOM-FIELD-KEY; restore CHECK IN as product reject for open slug after DATA.

---

## 8. Honesty / non-claims / seals

| Flag / seal | Rule |
|-------------|------|
| `hrm_personnel_uat_ready` | **false** — **DENIED** flip |
| `employees_e2e_linkage_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — **DENIED** flip |
| EMP-CUSTOM CNS L1 | **SEAL RETAIN** — **DENIED** reopen / fold |
| MergeToken EMP EXT | **SEAL RETAIN** — **DENIED** reopen |
| EMP DOC/ET Nest | **SEAL RETAIN** — **DENIED** fold status into ET/DOC |
| ATT / SI / CTR / enrollment | **SEAL RETAIN** — **DENIED** reopen |
| Module EMP UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Settings MD sole SoT | **DENIED** |
| Mega-EAV / dual writers | **DENIED** |
| Seed | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | EMP status catalog AC pack ≠ module EMP UAT |
| ba-data | **UNLOCK** parallel DATA-01 — ADD 2 tables + **DROP CHECK** residual |
| BE | **HOLD** until BA **+** DATA CONFIRMED |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS Nest SoT wording | **OPTIONAL** | ADD-only: «danh mục trạng thái / lý do NV chuẩn = Nest; Settings ≠ sole SoT» — **không** wipe DOC/ET / custom-field FR |
| Journey rows J-HRM-EMP-ST-CAT-* | **OPTIONAL** after Nest LIVE + QA stamp | Map §6.6 · update `PILOT_BUSINESS_FLOW_BA_TRACE.md` |
| ba-data EXPAND | **YES** parallel | Nest absent · CHECK DROP |

---

## 10. Handoff expectations

| Role | Expect | Done when |
|------|--------|-----------|
| **pm** | Seal BA **CONFIRMED** · ensure parallel **DATA-01** completes · **HOLD BE** until DATA CONFIRMED · then unlock BE→FE/Mobile→QA | Bus DISPATCHED |
| **ba-data** | **UNLOCK** ADD-plan `public.emp_employment_status` + `public.emp_status_reason` ICatalogRow peer EMP DOC/ET / SI — soft-delete · dual SoT REF · **DROP** `chk_employees_status` enum ceiling · **FORBIDDEN** mega-EAV / fold into ET | CONFIRMED DATA |
| **dev-be** | After BA+DATA: Nest ensureSchema + F-EMP-CAT-ST/STR + EFF · F-EMP-ST-CNS KEY · display `status_label` · jest VAL-EMP-ST-CNS-* / VAL-EMP-STR-CNS-* | READY_FOR_QA |
| **dev-fe** | After BE: rebind employee status picker to Nest EFF; **REJECT** MD-alone / hardcode sole when EFF>0; empty soft+CTA | READY_FOR_QA |
| **dev-mobile** | After BE: rebind profile status label map to catalog / display-ready; hardcode map only EFF=0 bootstrap | READY_FOR_QA |
| **qa** | U65 AC-PLT-EMP-STATUS-01/01b/01c/01d/01H · VAL CNS · zero-seed · no personnel flip · seals untouched | PASS_TO_PM / FAIL |
| **qc** | Slice GWC only · honesty false · seals retain | GWC ≠ module GO |
| **ba-docs** | Optional DOC-DELTA / journey §9 | After Nest LIVE if flagged |

---

## 11. Open risks / clarifications

| # | Item | Disposition |
|---|------|-------------|
| R1 | FE `EmployeeFormDialog` hardcode fallback when Settings empty | Allowed **only** EFF=0 bootstrap; **must** rebind Nest EFF when EFF>0 (**VAL-EMP-ST-CNS-02**) |
| R2 | BE/mobile hardcode label maps | **MIGRATE** to catalog/`status_label` when EFF>0 (**VAL-EMP-ST-CNS-07**) |
| R3 | Closed CHECK vs richer FE keys | **Mandatory DROP** via ba-data (**VAL-EMP-ST-CNS-06**) — residual until DATA |
| R4 | Reason field UX placement | Product: status-change dialog or form field when `requires_reason` — process locked by VAL-EMP-STR-* |
| R5 | Confusion status vs employment_type | **VAL-EMP-ST-CNS-08** · L-EMP-ST-08 orthogonal |
| R6 | Transition graph residual | **L-EMP-ST-07** — codes open; illegal reverse may stay code — **no** sponsor decision needed for AC pack |
| Q1 | Exact Nest admin tab label VI | Dev-FE product copy — process: «Trạng thái NV» / «Lý do trạng thái» |

**Unresolved needing sponsor:** none for Option B AC — architecture LOCKED by SA.

---

## 12. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **UNLOCK** (parallel `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-DATA-01` already DISPATCHED) |
| **BE** | **HOLD** until BA **+** DATA CONFIRMED |
| **next_owner** | **pm** → seal BA · await/seal **ba-data** CONFIRMED → then **dev-be** (F-EMP-CAT-ST/STR + CNS KEY) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-ba-01.md` |
