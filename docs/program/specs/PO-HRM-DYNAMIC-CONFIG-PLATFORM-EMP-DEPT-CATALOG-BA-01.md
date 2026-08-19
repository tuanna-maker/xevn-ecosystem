# BA AC/BR — EMP department open catalog Option A · Settings/XBOS `departments` SoT ≠ Nest `emp_department` / Nest org-tree sole invent / EMP-STATUS Option B

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01` **CONFIRMED** Option **A** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** · BE consumer invent-KEY / empty CTA **UNLOCK only if GAP** after this BA · FE WH/employee/dept pickers bind per gaps · personnel / module EMP UAT / Nest `emp_department` / Nest `emp_position` / reopen EMP-POSITION·STATUS·CUSTOM·EXT **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **EXPAND** platform **AC-PLT-EMP-DEPT-01*** · close **R-EMP-POS-DEPT-01** · **no** wipe EMP-POSITION L1 / EMP-STATUS L1 / EMP-CUSTOM / MergeToken EXT / DOC/ET / ATT / SI / CTR / enrollment) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md) Option **A** · L-EMP-DEPT-01..15 · F.1 · §7 draft |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-dept-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 **Chức danh / phòng ban** · **AC-PLT-EMP-01** (dept companion) · **BR-PLT-02/04/05/06** |
| **ref_peer_emp_position** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md) Option **A** admin open ≠ consumer invent — **cite pattern** (Settings/XBOS LIVE deepen · same class) · stamp **`EMPPOSQA2-MSK3CDH1`** **RETAIN** |
| **ref_peer_emp_custom** | EMP-CUSTOM Option **A** Settings LIVE — **cite pattern** · stamp **`EMPCFQA-MSK14LUH`** **RETAIN** |
| **ref_peer_emp_status** | EMP-STATUS Option **B** Nest DEFINE BA — **cite ≠ copy** (Nest absent + hardcode class) · stamp **`EMPSTQA-MSK20G7H`** **RETAIN** · **FORBIDDEN** invent EMP-STATUS FE |
| **ref_peer_ext** | MergeToken EMP EXT **`EMPTOKEXTQA-MSJ57PE1`** · **RETAIN** · **≠** dept SoT |
| **ref_peer_vertical** | EMP VERTICAL **L-EMP-CAT-05** — `departments` / `job_titles` = XBOS REF · **FORBIDDEN** Nest `emp_department` · **FORBIDDEN** Nest `emp_position` |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-POSITION L1 · EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT · SI · CTR **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · DENY module EMP UAT |
| **Cấm** | `apps/**` · seed · Nest `emp_department` / Nest org-tree sole invent SoT / Nest `emp_position` / mega-EAV · fold into position/custom/status · flip personnel · reopen EMP-POSITION / EMP-STATUS / EMP-CUSTOM / EXT / DOC-ET / ATT / SI / CTR · invent EMP-STATUS FE · invent module EMP UAT · Phase1 DONE |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **A** (SA LOCKED) — đóng companion residual **R-EMP-POS-DEPT-01**:

1. **Definition SoT** = Settings-catalogs **effectiveItems** storageKey **`departments`** (aliases `department_catalog` / `org_departments`) = XBOS khung + HRM tenant extension theo ADR (**L-EMP-DEPT-01/02** · **BR-PLT-06**) — **FORBIDDEN** Nest `emp_department` · **FORBIDDEN** Nest `public.departments` org-tree alone as invent SoT · **FORBIDDEN** free-text SoT when EFF>0 (**BR-PLT-02**).
2. **Admin CREATE / sync open N+1** (**BR-PLT-05** · **AC-PLT-EMP-DEPT-01d**) — append/upsert active `departments` row (slug) via Settings and/or XBOS publish/pull — **≠** consumer invent ban.
3. **Consumers** khi **EFF active count > 0** — `department_key` **phải** ∈ EFF; invent → platform **`HRM-EMP-DEPT-KEY`** (**AC-PLT-EMP-DEPT-01b**); WH **may retain alias** **`HRM-WH-DEPT-KEY`** as **same error class** (BA maps ≡ / EXPAND — **FORBIDDEN** dual conflicting semantics).
4. **Empty EFF** → soft empty + CTA Settings · invent assert **empty-catalog** class (**`HRM-EMP-DEPT-EMPTY-CATALOG`** platform · WH may **retain peer** **`HRM-WH-PICK-EMPTY-CATALOG`** as same empty class when catalog empty path is shared — BA maps ≡) · free-text SoT **FORBIDDEN** · **no seed** (**AC-PLT-EMP-DEPT-01c** · **L-EMP-DEPT-05**).
5. **Soft-retire** / inactive → hide from picker · history WH/CTR/DEC may keep retired keys (**BR-PLT-04** · **AC-PLT-EMP-DEPT-01e**).
6. **Primary consumer AC** (**AC-PLT-EMP-DEPT-01**) — WH create/update (and employee/CTR/DEC/REC/PERF binds): department = catalog picker ∈ EFF; reject free-text SoT (platform BA-01 §2.1 phòng ban).
7. **Honesty / seals** (**AC-PLT-EMP-DEPT-01H**) — personnel/e2e/printable **false** · RETAIN EMP-POSITION / EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR · **C-SLICE-≠-MODULE** · **DENY** invent EMP-STATUS FE · Nest `emp_department` / Nest org-tree sole invent · Nest `emp_position` · fold position/custom/status · mega-EAV · seed · module EMP UAT.
8. **Org-tree boundary** — Nest `public.departments` hierarchy ops **retain surface** if product needs · **OUT** redesign UX this seat · **FORBIDDEN** as sole `department_key` invent SoT (**L-EMP-DEPT-15**).

### Actors

| Actor | Role |
|-------|------|
| HCNS / Settings + XBOS catalog admin | CREATE / sync / retire `departments` N+1 (group khung + tenant extension) |
| HCNS NS (HR) | WH create/update · employee dept bind · CTR/DEC dept bind |
| REC / PERF (narrow) | JD/plan / PERF `department_key` ∈ same SoT when surface writes key |
| System (BE) | `assertCodeInEffectiveCatalog` / WH·CTR·DEC·REC·PERF asserts · invent KEY / empty-catalog class |
| QA | U65 browser **AC-PLT-EMP-DEPT-01*** · VAL-EMP-DEPT-CNS-* · zero-seed |
| QC | Narrow seal · honesty false · **DENIED** personnel / module EMP UAT / Nest emp_department / reopen seals |
| PM | Unlock BE CNS **only if GAP**; ba-data **HOLD**; **cấm** reopen EMP-POSITION L1 |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H** · VAL-EMP-DEPT-CNS-* · BR-PLT-EMP-DEPT-* · surface matrix | Impl `apps/**` / migration / seed |
| Enumerate Settings/XBOS `departments` admin + WH/EMP/CTR/DEC/REC/PERF consumers | Claim module EMP UAT / flip `hrm_personnel_uat_ready` |
| Cite EMP-POSITION Option A admin≠consumer (**closest peer**) · EMP-CUSTOM A · EMP-STATUS B (**cite ≠ copy**) | Copy Nest EMP-STATUS BA · invent Nest `emp_department` / Nest `emp_position` |
| ba-data **HOLD** (Settings/XBOS physical LIVE) | Nest `emp_department` EXPAND · promote org-tree sole invent · fold into EMP-POSITION Nest / EMP-CUSTOM / EMP-STATUS |
| Align BR-PLT-02/04/05/06 · close **R-EMP-POS-DEPT-01** AC | Nest org-tree hierarchy UX redesign · invent EMP-STATUS FE HOLD · reopen EMP-POSITION L1 |

---

## 1. As-is vs to-be

| | AS-IS (evidence) | TO-BE (Option A · this pack) |
|---|------------------|------------------------------|
| Dept SoT | Settings `departments` (+ XBOS sync / extension) **LIVE** · Nest `emp_department` catalog **ABSENT** (intentional L-EMP-CAT-05) | Named **AC-PLT-EMP-DEPT-01*** — SoT = Settings/XBOS EFF (**L-EMP-DEPT-01**) |
| Nest org-tree | `public.departments` hierarchy CRUD **exists** | **Retain hierarchy surface** · **≠** invent KEY SoT (**L-EMP-DEPT-15**) |
| WH invent | `assertWhDepartmentKey` → **`HRM-WH-DEPT-KEY`** LIVE | **01b** — platform KEY **`HRM-EMP-DEPT-KEY` ≡ WH-DEPT-KEY** |
| Empty EFF | Position path has **`HRM-WH-PICK-EMPTY-CATALOG`**; dept empty CTA/KEY deepen residual | **01c** — empty-catalog class + CTA · no seed · free-text FORBIDDEN |
| CTR / DEC / REC / PERF | `department_key` assert ∈ `departments` (retain) | Same SoT · **RETAIN** existing asserts · deepen if GAP |
| EMP-POSITION L1 Option A · EMP-STATUS · EMP-CUSTOM · EXT | Orthogonal LIVE | **SEAL RETAIN** · **OUT** fold / reopen |
| Honesty | Slice deepen risk misread module GO | personnel / e2e / printable **false** · **`C-SLICE-≠-MODULE`** |

**Peer class (cite ≠ copy):**

| Peer | Class | This seat |
|------|-------|-----------|
| **EMP-POSITION Option A** | Settings/XBOS `job_titles` producer **LIVE** → deepen A · admin open ≠ consumer invent | **Closest peer** — cite AC/VAL split · stamp **`EMPPOSQA2-MSK3CDH1`** RETAIN |
| **EMP-CUSTOM Option A** | Settings producer **LIVE** → deepen A | Cite admin≠consumer pattern · stamp **`EMPCFQA-MSK14LUH`** RETAIN |
| **EMP-STATUS Option B** | Nest **absent** + hardcode/CHECK → Nest DEFINE | **Cite admin≠consumer only** — **FORBIDDEN** copy Nest DEFINE BA · stamp **`EMPSTQA-MSK20G7H`** RETAIN |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | EFF active `departments` **>0** | Consumer SoT = picker/FK ∈ EFF | Invent unknown → **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) |
| **BR-PLT-04** | Retire / inactive config | Soft-delete / active=false | Picker hide; history WH/CTR/DEC intact |
| **BR-PLT-05** | Admin CREATE / sync | Open N+1 slug · VAL format only | **FORBIDDEN** closed enum / reject N+1 |
| **BR-PLT-06** | Group vs tenant | XBOS SoT khung + tenant extend | **FORBIDDEN** HRM-only dual master replacing XBOS |
| **L-EMP-DEPT-01** | Dept SoT | Settings/XBOS `departments` EFF | Nest `emp_department` **REJECT** · org-tree sole invent **REJECT** |
| **L-EMP-DEPT-03** | Admin vs consumer | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-EMP-DEPT-05** | EFF count =0 | Empty-catalog class + CTA · no free-text · no seed | Seed = **FAIL U65** |
| **L-EMP-DEPT-06** | EMP-POSITION L1 | Option A seal **RETAIN** | **FORBIDDEN** reopen · **FORBIDDEN** invent Nest `emp_position` |
| **L-EMP-DEPT-07..15** | Orthogonal / seals / honesty / soft-delete / scope / display / mega-EAV / EMP-STATUS FE / org-tree | RETAIN / false / U19 / FORBIDDEN | See §8 |

---

## 3. EMP department-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-EMP-DEPT-01** | Surface = **catalog admin** (Settings items `departments` and/or XBOS sync upsert) | Cho phép department code N+1 (slug hợp lệ, active) | **2xx** · list + F5 còn — **không** «closed list only» |
| **BR-PLT-EMP-DEPT-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | `department_key` **must** ∈ EFF | Unknown → **4xx** **`HRM-EMP-DEPT-KEY`** (WH alias **`HRM-WH-DEPT-KEY`** ≡) · không persist invent |
| **BR-PLT-EMP-DEPT-03** | EFF active **=0** | Soft empty + CTA Settings; invent → **`HRM-EMP-DEPT-EMPTY-CATALOG`** (or peer **`HRM-WH-PICK-EMPTY-CATALOG`** ≡ empty class); free-text SoT **FORBIDDEN**; admin vẫn CREATE | Seed/script density = **FAIL U65** |
| **BR-PLT-EMP-DEPT-04** | Soft-retire / inactive `departments` row | Hide from consumer picker | History rows may retain retired keys (**BR-PLT-04**) |
| **BR-PLT-EMP-DEPT-05** | Free-text department name alone without catalog key when EFF>0 | **FORBIDDEN** as SoT | Same invent/required class as missing/unknown key |
| **BR-PLT-EMP-DEPT-06** | Nest `emp_department` / `emp_org_unit` as GĐ1 SoT | **REJECT** | Violates EMP VERTICAL L-EMP-CAT-05 · L-EMP-DEPT-01 |
| **BR-PLT-EMP-DEPT-07** | Nest `public.departments` org-tree **alone** as invent KEY SoT / dual writer vs Settings EFF | **REJECT** | Hierarchy surface **≠** catalog invent SoT (**L-EMP-DEPT-15**) |
| **BR-PLT-EMP-DEPT-08** | Fold dept into Nest `emp_position` / EMP-CUSTOM / EMP-STATUS / DOC/ET / mega-EAV | **FORBIDDEN** | Orthogonal seals **RETAIN** |
| **BR-PLT-EMP-DEPT-09** | Settings MD overview alone *as substitute when Nest needed* | **N/A reject class** — Nest catalog **not** needed here | Intentional XBOS REF Option A (**L-EMP-DEPT-01**) — **≠** SI/ATT Nest-needed MD-alone reject |
| **BR-PLT-EMP-DEPT-10** | ba-data | Settings/XBOS `departments` LIVE | **HOLD** — **FORBIDDEN** Nest ADD |
| **BR-PLT-EMP-DEPT-11** | Scope | List ↔ get-by-id ↔ mutate ↔ invent assert | Same `resolveHrmListScope` (**U19**) |
| **BR-PLT-EMP-DEPT-12** | Display-ready | Prefer catalog `*_label` from EFF | FE **cấm** invent join when BE provides (OS 28) |
| **BR-PLT-EMP-DEPT-13** | EMP-POSITION L1 Option A | **SEAL RETAIN** · stamp **`EMPPOSQA2-MSK3CDH1`** | **FORBIDDEN** reopen / invent Nest `emp_position` |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| EMP VERTICAL **L-EMP-CAT-05** | Dept = XBOS REF — **must_keep** · Nest dept catalog **FORBIDDEN** · Nest position **FORBIDDEN** |
| EMP-POSITION Option A BA | Admin≠consumer **cite** — same Settings LIVE deepen class · stamp **`EMPPOSQA2-MSK3CDH1`** RETAIN |
| EMP-CUSTOM Option A | Admin≠consumer **cite** — SoT class = Settings LIVE deepen |
| EMP-STATUS Option B Nest L1 | **SEAL RETAIN** — **cite ≠ copy** · **FORBIDDEN** invent EMP-STATUS FE |
| MergeToken EXT · DOC/ET · ATT · SI · CTR | **SEAL RETAIN** · **OUT** fold |
| WH jest `HRM-WH-DEPT-KEY` | **RETAIN** — ≡ platform KEY class |

**Error code lock (deterministic):**

| Code | Use | Not |
|------|-----|-----|
| **`HRM-EMP-DEPT-KEY`** | Platform consumer invent unknown `department_key` when EFF>0 | Soft empty · seed · admin CREATE |
| **`HRM-WH-DEPT-KEY`** | WH surface alias — **≡ same class** as EMP-DEPT-KEY (BA maps) | Soft empty synonym · admin CREATE |
| **`HRM-EMP-DEPT-EMPTY-CATALOG`** | Platform EFF=0 invent / free-text attempt | Invent-when-EFF>0 synonym |
| **`HRM-WH-PICK-EMPTY-CATALOG`** | WH peer empty class — **≡ same empty class** when shared empty path (BA maps) | Invent-when-EFF>0 synonym |
| Format / VAL admin | Invalid slug on admin CREATE | Consumer invent synonym |
| Scope mismatch | company ≠ token scope | Invent KEY synonym |

**SUPERSEDED / FORBIDDEN:** Option B Nest `emp_department` / Nest org-tree sole invent · Option C dual writers / mega-EAV / fold position·custom·status · invent personnel UAT · reopen EMP-POSITION/STATUS/CUSTOM/EXT · claim module EMP UAT · seed · free-text SoT when EFF>0 · invent EMP-STATUS FE · invent Nest `emp_position`.

---

## 4. Producer + consumer surface inventory

### 4.1 Producer SoT

| Producer | storageKey / path | Notes |
|----------|-------------------|-------|
| Settings-catalogs items | **`departments`** | Aliases accepted: `department_catalog` · `org_departments` · family **`org_depts`** |
| XBOS catalog sync | Group publish/pull khung | **BR-PLT-06** SoT khung — HRM = consumer + tenant extension |
| Tenant extension | ADR-allowed N+1 on same key | Collision: tenant wins per ADR (SA F-EMP-CAT-DEPT-EFF-01) |

**FORBIDDEN producer:** Nest `emp_department` / `emp_org_unit` domain catalog table as GĐ1 SoT · Nest `public.departments` org-tree alone as invent KEY SoT.

### 4.2 Surfaces (authoritative)

> **Admin ≠ consumer.** Invent KEY / EFF picker áp **consumer rows** — **không** áp lên admin CREATE/sync N+1.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | Class |
|---------|-------------------|--------------------------|-----------|-------------------|-------|
| **S-EMP-DEPT-ADM-01** | Settings / XBOS **admin** `departments` | Settings danh mục phòng ban · XBOS sync | code/label open N+1 | **F-EMP-CAT-DEPT-01/02** · EFF-01 | **ADMIN** |
| **S-EMP-DEPT-CNS-01** | Work history create/update (**primary**) | Employee WH · `department_key` | ∈ EFF when EFF>0 | WH API · **F-EMP-DEPT-CNS-01** | **CONSUMER** |
| **S-EMP-DEPT-CNS-02** | Employee / profile dept bind (if any) | Employees form · `department_key` | ∈ EFF when EFF>0 | Employees API · **F-EMP-DEPT-CNS-02** | **CONSUMER** |
| **S-EMP-DEPT-CNS-03** | CTR / DEC `department_key` | Contract / decision forms | ∈ EFF when EFF>0 | CTR/DEC API · **F-EMP-DEPT-CNS-03** **RETAIN** | **CONSUMER** |
| **S-EMP-DEPT-CNS-04** | REC JD/plan / PERF (when writes key) | REC / PERF bind | ∈ EFF when EFF>0 | REC/PERF path deepen if GAP | **CONSUMER narrow** |
| **S-EMP-DEPT-REF-01** | Settings MD overview alone | Catalog stub without items CRUD / sync | — | — | **Not sole SoT** when CRUD/sync exists — Option A uses items+EFF |
| **S-EMP-DEPT-OUT-01** | Nest `emp_department` UI/API | — | — | — | **OUT** · **FORBIDDEN** |
| **S-EMP-DEPT-OUT-02** | Nest `public.departments` org-tree as sole invent SoT | Org-tree CRUD | — | Hierarchy ops may remain | **OUT as invent SoT** · **FORBIDDEN** dual master |
| **S-EMP-DEPT-OUT-03** | EMP-POSITION / EMP-STATUS / EMP-CUSTOM / DOC/ET / EXT | Peer packs | — | — | **OUT** · **SEAL RETAIN** |

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-EMP-DEPT-01** | Consumer WH — picker SoT | EFF>0 → WH create chọn `department_key` ∈ EFF → Lưu **2xx** → F5 còn · **không** free-text SoT | Update WH same key rules · spot EMP/CTR | Free-text alone · invent key · missing key |
| **UC-PLT-EMP-DEPT-01b** | Consumer invent KEY | EFF>0 → Lưu WH/EMP/CTR với key ∉ EFF → **4xx** EMP-DEPT-KEY (≡ WH-DEPT-KEY) | Spot REC/PERF | 2xx invent · seed |
| **UC-PLT-EMP-DEPT-01c** | Empty EFF | EFF=0 → CTA Settings · empty-catalog class · free-text **FORBIDDEN** · no seed · admin vẫn CREATE | — | Seed density · silent free-text accept |
| **UC-PLT-EMP-DEPT-01d** | Admin — CREATE/sync N+1 | Settings/XBOS → Append/sync `departments` → Lưu/sync **2xx** → list có row → **F5** → consumer picker thấy | Sửa label | Format invalid · scope 409 · «closed enum» sai áp |
| **UC-PLT-EMP-DEPT-01e** | Soft-retire | Retire/inactive → picker hide; history WH/CTR OK | Reactivate if product allows | Hard-delete · wipe history keys |
| **UC-PLT-EMP-DEPT-01H** | Honesty / seals | Evidence flags false · seals retain · Nest DENY · org-tree sole invent DENY · no EMP-STATUS FE invent | — | Flip ready · reopen seals · module EMP UAT claim |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings_XBOS
  actor HR as HCNS_NS
  participant Cat as F_EMP_CAT_DEPT
  participant Eff as F_EMP_CAT_DEPT_EFF
  participant WH as WorkHistory_API

  Admin->>Cat: CREATE_or_sync departments N+1
  alt Ceiling / closed-enum sai áp admin
    Cat-->>Admin: FAIL — vi phạm BR-PLT-05 / L-EMP-DEPT-03
  else 2xx active
    Cat-->>Admin: 2xx + F5 list (01d)
  end
  HR->>Eff: GET effective departments
  Eff-->>HR: picker rows
  HR->>WH: Luu WH department
  alt EFF active = 0
    WH-->>HR: 4xx HRM-EMP-DEPT-EMPTY-CATALOG; CTA Settings; cấm seed / free-text
    Note over WH: peer HRM-WH-PICK-EMPTY-CATALOG same empty class
  else EFF > 0 and invent unknown department_key
    WH-->>HR: 4xx HRM-EMP-DEPT-KEY
    Note over WH: alias HRM-WH-DEPT-KEY same class
  else key ∈ EFF
    WH-->>HR: 2xx; F5 WH row
  end
  Note over Cat: EMP-POSITION STATUS CUSTOM EXT DOC/ET RETAIN
  Note over WH: Nest emp_department FORBIDDEN · org-tree sole invent FORBIDDEN
```

---

## 6. Acceptance criteria (measurable · U65) — **CONFIRMED**

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe / reopen EMP-POSITION L1 · EMP-STATUS L1 · EMP-CUSTOM · MergeToken EMP EXT · DOC/ET · ATT · SI · CTR · enrollment.  
> **Không** invent EMP-STATUS FE HOLD · Nest `emp_department` · Nest org-tree sole invent · Nest `emp_position`.

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-EMP-DEPT-01** | **S-EMP-DEPT-CNS-01** (primary) · spot **CNS-02/03** | EFF>0 (from admin/sync — **không** seed): WH create department = **catalog picker** ∈ EFF `departments` → Network **2xx** → FE list có row → **F5** còn — **reject** free-text department alone as SoT (**BR-PLT-02** · BA-01 §2.1 phòng ban) | Free-text SoT accepted · invent key 2xx · FE hardcode list · seed · org-tree alone as SoT |
| **AC-PLT-EMP-DEPT-01b** | **CNS-01** primary · spot **CNS-02/03/04** | EFF>0: consumer Lưu với unknown `department_key` → FE chặn và/hoặc Network **4xx** **`HRM-EMP-DEPT-KEY`** (WH may show **`HRM-WH-DEPT-KEY`** — **≡ same class**) → **không** persist invent sau F5 | 2xx invent · silent accept · rename KEY wipe · treat WH-DEPT as different business class |
| **AC-PLT-EMP-DEPT-01c** | Empty EFF | EFF **=0**: soft empty + **CTA Settings**; invent/free-text → **`HRM-EMP-DEPT-EMPTY-CATALOG`** (or peer **`HRM-WH-PICK-EMPTY-CATALOG`** ≡); **ADM-01** vẫn CREATE/sync; **không** seed | Seed/script density · free-text fallback SoT · invent-as-accept |
| **AC-PLT-EMP-DEPT-01d** | **S-EMP-DEPT-ADM-01** | Admin **CREATE/sync** `departments` **#N+1** (code + label vi-VN, active) → Network **2xx** → FE list có row → **F5** còn → consumer picker (**01**) includes row — **không** reject «closed enum only» · **BR-PLT-05/06** | Áp invent ban lên admin · ceiling starter · Nest dept UI · seed |
| **AC-PLT-EMP-DEPT-01e** | Retire **ADM-01** → picker | Soft-retire / inactive → hidden from consumer picker · history WH/CTR/DEC with retired keys **OK** (no hard wipe) | Hard-delete-only · wipe history · picker still lists retired as selectable SoT |
| **AC-PLT-EMP-DEPT-01H** | Honesty / seals | Evidence: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · EMP-POSITION L1 **`EMPPOSQA2-MSK3CDH1`** · EMP-STATUS L1 **`EMPSTQA-MSK20G7H`** · EMP-CUSTOM **`EMPCFQA-MSK14LUH`** · EXT **`EMPTOKEXTQA-MSJ57PE1`** · DOC/ET · ATT · SI · CTR **SEAL RETAIN** · Nest `emp_department` **DENIED** · Nest org-tree sole invent **DENIED** · Nest `emp_position` **DENIED** · fold position/custom/status **DENIED** · invent EMP-STATUS FE **DENIED** · personnel flip **DENIED** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module EMP UAT / Phase1 | Flip ready · reopen seals · Nest invent · claim module EMP UAT · invent EMP-STATUS FE |

### 6.2 Retain peer AC (cite — không reopen)

| ID / stamp | Surface | Đạt khi | Không đạt khi |
|------------|---------|---------|----------------|
| EMP-POSITION L1 **`EMPPOSQA2-MSK3CDH1`** | Settings/XBOS `job_titles` | **RETAIN** — spot only if regression risk | Reopen EMP-POSITION suite / invent Nest `emp_position` |
| EMP-STATUS L1 **`EMPSTQA-MSK20G7H`** | Nest ST/STR | **RETAIN** — spot only if regression risk | Reopen EMP-STATUS suite / invent FE HOLD |
| EMP-CUSTOM **`EMPCFQA-MSK14LUH`** | Settings extension field-def | **RETAIN** — **≠** dept SoT | Fold dept into custom |
| MergeToken EXT **`EMPTOKEXTQA-MSJ57PE1`** | `custom.emp.*` | **RETAIN** | Reopen EXT / register on dept save |
| DOC/ET · ATT · SI · CTR | Peer packs | **SEAL RETAIN** | Reopen peers |

### 6.3 Consumer VAL (BE/QA measurable) — **VAL-EMP-DEPT-CNS-***

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-EMP-DEPT-CNS-01** | WH **CNS-01** invent | Unknown `department_key` when EFF>0 | **4xx** `HRM-EMP-DEPT-KEY` **or** `HRM-WH-DEPT-KEY` (≡) | 01b · BR-PLT-EMP-DEPT-02 | **BE GAP if missing / wrong class** — unlock CNS deepen only if QA/probe FAIL after BA · AS-IS WH-DEPT-KEY **LIVE** → expect **PASS retain** unless regress |
| **VAL-EMP-DEPT-CNS-02** | Empty EFF | EFF=0 · invent / free-text attempt | **`HRM-EMP-DEPT-EMPTY-CATALOG`** (or peer **`HRM-WH-PICK-EMPTY-CATALOG`** ≡) · CTA · no seed · free-text FORBIDDEN | 01c · BR-PLT-EMP-DEPT-03 | **FE CTA / empty-code deepen if GAP**; BE unlock only if FAIL |
| **VAL-EMP-DEPT-CNS-03** | EMP **CNS-02** invent | Unknown `department_key` when EFF>0 | **4xx** invent KEY class (`HRM-EMP-DEPT-KEY` or existing catalog assert code — BA maps ≡) | 01b · F-EMP-DEPT-CNS-02 | **BE GAP if missing** — deepen only if FAIL |
| **VAL-EMP-DEPT-CNS-04** | Soft-retire | Retire then consumer picker / invent retired code | Hidden from picker; invent of retired as unknown when EFF excludes it → KEY class | 01e · BR-PLT-04 | Deepen if picker still shows retired selectable |
| **VAL-EMP-DEPT-CNS-05** | CTR/DEC/REC/PERF spot | Unknown `department_key` when EFF>0 | Invent KEY class · **RETAIN** existing asserts | 01b · F-EMP-DEPT-CNS-03 | **RETAIN** — deepen if FAIL |
| **VAL-EMP-DEPT-CNS-06** | Scope parity | List EFF scope ≠ invent assert scope | jest **FAIL** scope_parity · 409/4xx deterministic | L-EMP-DEPT-11 · U19 | **RETAIN** deepen if FAIL |
| **VAL-EMP-DEPT-CNS-07** | Free-text alone | WH free-text department without key when EFF>0 | Reject (required/invent class) | 01 · BR-PLT-EMP-DEPT-05 | **FE/BE GAP** if UI still allows free-text SoT |
| **VAL-EMP-DEPT-ADM-01** | Admin **ADM-01** | CREATE/sync N+1 open slug | **2xx** + F5 row visible in picker | 01d · BR-PLT-05/06 | **RETAIN** Settings/XBOS path — deepen if closed-enum regress |
| **VAL-SET-MD-01 / FR-HRM-SC-DEPT-01** | Catalog pointer | Dept ∈ `departments` EFF | Retain platform catalog AC | L-EMP-DEPT-01 | **RETAIN** |
| **VAL-EMP-DEPT-ORG-01** | Nest org-tree | Org-tree CRUD alone used as invent KEY SoT | **FAIL process** if treated as sole invent SoT | 01H · BR-PLT-EMP-DEPT-07 | Spot negative — **FORBIDDEN** dual master |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-EMP-POS-01** | EMP-POSITION L1 GWC · stamp `EMPPOSQA2-MSK3CDH1` retained · Nest `emp_position` DENY | Reopen position suite / invent Nest position |
| **MK-EMP-STATUS-01** | EMP-STATUS L1 GWC · stamp `EMPSTQA-MSK20G7H` retained · FE HOLD not invented | Reopen status suite / invent FE |
| **MK-EMP-CUSTOM-01** | EMP-CUSTOM CNS · stamp `EMPCFQA-MSK14LUH` retained | Fold dept into custom |
| **MK-EMP-TOK-EXT-01** | EXT GWC · stamp `EMPTOKEXTQA-MSJ57PE1` retained | Reopen EXT / wipe F-EMP-TOK-03 |
| **MK-EMP-DOCET-01** | DOC/ET Nest + tokens retained | Absorb DOC/ET into dept seat |
| **MK-ATT-SI-CTR-01** | ATT · SI · CTR seals retain | Reopen peers |
| **MK-NO-NEST-DEPT-01** | No Nest `emp_department` / dual master vs XBOS / org-tree sole invent | Invent Nest physical / dual writer |
| **MK-WH-DEPT-01** | WH-DEPT-KEY class retain ≡ EMP-DEPT-KEY | Dual conflicting error semantics |
| **MK-VERTICAL-DEPT-01** | EMP VERTICAL L-EMP-CAT-05 XBOS REF retained | Reopen as Nest Option B |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-EMP-DEPT-CAT-01`** | WH create picker ∈ EFF (**01**) · reject free-text | ba-docs ADD after CONFIRM / QA |
| **Proposed `J-HRM-EMP-DEPT-CAT-02`** | EFF>0 invent → KEY (**01b**) | WH ≡ EMP-DEPT-KEY |
| **Proposed `J-HRM-EMP-DEPT-CAT-03`** | EFF=0 empty + CTA (**01c**) | U65 no seed |
| **Proposed `J-HRM-EMP-DEPT-CAT-04`** | Admin CREATE/sync N+1 → picker (**01d**) | BR-PLT-05/06 |
| **Proposed `J-HRM-EMP-DEPT-CAT-05`** | Soft-retire hide · history OK (**01e**) | |
| Cross-nav U19 | Settings/`departments` list → WH/employee form bind → F5 | AC list mutate kèm F5 |
| EMP-POSITION journeys | Peer sealed | **RETAIN** — **cấm** reopen |

**Persona:** Group CEO `ceo@xe.vn` (rollup `main`) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-EMP-DEPT-KEY`** | Consumer invent unknown `department_key` when EFF>0 | **4xx** | Banner VI — không toast success |
| **`HRM-WH-DEPT-KEY`** | WH alias same invent class | **4xx** | Same UX class as EMP-DEPT-KEY |
| **`HRM-EMP-DEPT-EMPTY-CATALOG`** | EFF=0 invent / free-text attempt (platform) | **4xx** | CTA Settings · **cấm** seed |
| **`HRM-WH-PICK-EMPTY-CATALOG`** | WH peer empty class (≡ empty) | **4xx** | Same empty UX class |
| Admin format VAL | Invalid slug / duplicate active code | 4xx | Admin form |
| Scope mismatch | Mutate/assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx invent when EFF>0; 500 trên invent; seed để pass UF; free-text SoT when EFF>0; dual semantics WH-DEPT ≠ EMP-DEPT-KEY; invent EMP-STATUS FE; Nest emp_department dual master; org-tree sole invent SoT.

---

## 8. Honesty / non-claims / seals / OUT

| Flag / seal | Rule |
|-------------|------|
| `hrm_personnel_uat_ready` | **false** — **DENIED** flip |
| `employees_e2e_linkage_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — unchanged |
| EMP-POSITION L1 · stamp `EMPPOSQA2-MSK3CDH1` | **SEAL RETAIN** — **DENIED** reopen · **DENIED** invent Nest `emp_position` |
| EMP-STATUS L1 · stamp `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — **DENIED** reopen · **DENIED** invent FE HOLD |
| EMP-CUSTOM · stamp `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — **DENIED** fold dept into custom |
| MergeToken EMP EXT · stamp `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — **DENIED** reopen |
| DOC/ET · ATT · SI · CTR · enrollment | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Nest `emp_department` / Nest org-tree sole invent / Nest `emp_position` / mega-EAV / dual master vs XBOS | **DENIED** |
| Fold into EMP-POSITION Nest / EMP-STATUS / custom / DOC/ET | **DENIED** |
| Seed `departments` for UF | **DENIED** (U65) |
| Nest org-tree hierarchy UX redesign | **OUT** follow-on note only |
| ba-data | **HOLD** — **no Nest EXPAND** |
| `C-SLICE-≠-MODULE` | Dept AC pack ≠ module EMP UAT |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS dept picker / empty CTA | **OPTIONAL** | ADD-only «SoT = Settings/XBOS departments; invent → HRM-EMP-DEPT-KEY; empty = CTA no seed» **if** sponsor ambiguity |
| Journey rows J-HRM-EMP-DEPT-CAT-* | **OPTIONAL** after QA stamp | Map §6.5 · update `PILOT_BUSINESS_FLOW_BA_TRACE` |
| ba-data EXPAND Nest | **NO** | Physical LIVE Settings/XBOS · Nest FORBIDDEN |
| Org-tree hierarchy UX | **FOLLOW-ON** | Separate WI if product needs — **cấm** dual invent SoT |

---

## 10. Handoff expectations

### Gates after this BA

| Gate | Status |
|------|--------|
| ba-data | **HOLD** — **FORBIDDEN** Nest `emp_department` EXPAND |
| BE | **HOLD → UNLOCK narrow** `F-EMP-DEPT-CNS-*` / KEY alias unify / empty-catalog deepen **only if GAP** proven (WH-DEPT-KEY + CTR/DEC/REC asserts **must_keep** LIVE — **cấm** Nest table · **cấm** reopen EMP-POSITION/STATUS BE) |
| FE | After BA — WH/employee/dept pickers bind EFF `departments`; empty CTA; **FORBIDDEN** free-text SoT when EFF>0 · **FORBIDDEN** invent EMP-STATUS FE |
| QA | U65 **AC-PLT-EMP-DEPT-01*** · VAL-EMP-DEPT-CNS-* · retain EMP-POSITION/STATUS/CUSTOM/EXT |
| QC | Narrow seal · honesty false · **DENIED** personnel / module EMP UAT / Nest / reopen seals |

### SA / Dev / QA expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **SA** | Option A LOCKED retained | No reopen Option B Nest `emp_department` / org-tree sole invent |
| **Dev-BE** | CNS invent KEY / empty deepen **iff** VAL-EMP-DEPT-CNS-* FAIL / missing | Jest + no Nest + no EMP-POSITION/STATUS wipe |
| **Dev-FE** | WH/employee picker bind + empty CTA · reject free-text | U65 click path |
| **QA** | Browser matrix §6 · zero-seed · retain seals | Evidence stamp |
| **QC** | Narrow GWC · C-SLICE | No personnel flip |

### Residual / open questions

| ID | Item | Owner | Resolution |
|----|------|-------|------------|
| **R-EMP-DEPT-CNS-01** | WH invent already `HRM-WH-DEPT-KEY` LIVE — need platform alias string `HRM-EMP-DEPT-KEY`? | QA/probe → PM | If ≡ class documented **PASS retain**; unlock BE only if QA requires unified code string or assert missing |
| **R-EMP-DEPT-EMPTY-01** | Empty EFF dept path — platform `HRM-EMP-DEPT-EMPTY-CATALOG` vs peer WH EMPTY | QA/probe | Map ≡ empty class; unlock BE only if empty invent still accepts / no CTA |
| **R-EMP-DEPT-FE-01** | WH/employee free-text dept SoT on FE? | FE after BA / QA | If **FAIL** → unlock **dev-fe** picker bind only |
| **R-EMP-DEPT-ORG-01** | Org-tree hierarchy UX redesign | PM follow-on | **OUT** this pack — retain surface · **cấm** sole invent SoT |

**Unresolved product questions:** none blocking **CONFIRMED** — SA Option A + platform BA-01 + LIVE producer/asserts + peer EMP-POSITION BA sufficient.

**AS-IS gap posture (BA stamp — not UF verdict):** BE WH/CTR/DEC/REC catalog asserts appear **LIVE** → default next = **QA plan / L1 probe** (not automatic Nest BE unlock). Unlock **dev-be** only on VAL FAIL. Unlock **dev-fe** if free-text dept SoT still on UI.

---

## 11. Completion

| Field | Value |
|-------|--------|
| **completion_report** | **CONFIRMED** AC pack **AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e / 01H** + **VAL-EMP-DEPT-CNS-01..07** + ADM/ORG VAL · Option **A** Settings/XBOS **`departments`** effective = open department SoT; admin CREATE/sync open N+1 (**01d**); consumer invent → **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) when EFF>0 (**01b**); empty → CTA + **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ peer WH EMPTY) · no seed · free-text FORBIDDEN (**01c**); soft-retire hide · history OK (**01e**); consumer picker SoT (**01**); honesty **01H** · DENY Nest `emp_department` · Nest org-tree sole invent · Nest `emp_position` · fold position/custom/status · reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · personnel flip · invent EMP-STATUS FE · module EMP UAT / seed / Phase1; ba-data **HOLD**; BE CNS unlock **only if GAP**; peer EMP-POSITION A **cite** · EMP-STATUS B **cite ≠ copy**; closes **R-EMP-POS-DEPT-01** AC. |
| **next_owner** | `pm` → **`qa`** (U65 AC + VAL probe plan) **or** **`dev-be`** / **`dev-fe`** **only if GAP** |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-ba-01.md` |
