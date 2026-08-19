# BA AC/BR — EMP position open catalog Option A · Settings/XBOS `job_titles` SoT ≠ Nest `emp_position` / EMP-STATUS Option B

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01` **CONFIRMED** Option **A** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** · BE consumer invent-KEY / empty CTA **UNLOCK only if GAP** after this BA · FE WH picker bind per gaps · personnel / module EMP UAT / Nest `emp_position` / reopen EMP-STATUS·CUSTOM·EXT **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **EXPAND** platform **AC-PLT-EMP-01*** · **no** wipe EMP-STATUS L1 / EMP-CUSTOM / MergeToken EXT / DOC/ET / ATT / SI / CTR / enrollment) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md) Option **A** · L-EMP-POS-01..14 · F.1 · §7 draft |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-position-catalog-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-sa-01.md) |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 **Chức danh / phòng ban** · **AC-PLT-EMP-01** · **BR-PLT-02/04/05/06** |
| **ref_peer_emp_custom** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md) Option **A** admin open ≠ consumer invent — **cite pattern** (Settings LIVE deepen) · stamp **`EMPCFQA-MSK14LUH`** **RETAIN** |
| **ref_peer_emp_status** | EMP-STATUS Option **B** Nest DEFINE BA — **cite ≠ copy** (Nest absent + hardcode class) · stamp **`EMPSTQA-MSK20G7H`** **RETAIN** · **FORBIDDEN** invent EMP-STATUS FE |
| **ref_peer_ext** | MergeToken EMP EXT **`EMPTOKEXTQA-MSJ57PE1`** · **RETAIN** · **≠** position SoT |
| **ref_peer_vertical** | EMP VERTICAL **L-EMP-CAT-05** — position = XBOS REF · **FORBIDDEN** Nest `emp_position` dual master |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · EMP-STATUS L1 · EMP-CUSTOM · EXT · DOC/ET · ATT · SI · CTR **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · DENY module EMP UAT |
| **Cấm** | `apps/**` · seed · Nest `emp_position` / mega-EAV · fold into custom/status · flip personnel · reopen EMP-STATUS / EMP-CUSTOM / EXT / DOC-ET / ATT / SI / CTR · invent EMP-STATUS FE · invent module EMP UAT · Phase1 DONE · primary dept AC this seat |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **A** (SA LOCKED):

1. **Definition SoT** = Settings-catalogs **effectiveItems** storageKey **`job_titles`** (aliases `positions` / `employee_positions`) = XBOS khung + HRM tenant extension theo ADR (**L-EMP-POS-01/02** · **BR-PLT-06**) — **FORBIDDEN** Nest `emp_position` · **FORBIDDEN** free-text SoT when EFF>0 (**BR-PLT-02**).
2. **Admin CREATE / sync open N+1** (**BR-PLT-05** · **AC-PLT-EMP-01d**) — append/upsert active `job_titles` row (slug) via Settings and/or XBOS publish/pull — **≠** consumer invent ban.
3. **Consumers** khi **EFF active count > 0** — `position_key` / `job_title_key` **phải** ∈ EFF; invent → platform **`HRM-EMP-POSITION-KEY`** (**AC-PLT-EMP-01b**); WH **may retain alias** **`HRM-WH-PICK-REQUIRED`** as **same error class** (BA maps ≡ / EXPAND — **FORBIDDEN** dual conflicting semantics).
4. **Empty EFF** → soft empty + CTA Settings · invent assert **empty-catalog** class **`HRM-WH-PICK-EMPTY-CATALOG`** · free-text SoT **FORBIDDEN** · **no seed** (**AC-PLT-EMP-01c** · **L-EMP-POS-05**).
5. **Soft-retire** / inactive → hide from picker · history WH/CTR/DEC may keep retired keys (**BR-PLT-04** · **AC-PLT-EMP-01e**).
6. **Primary consumer AC** (**AC-PLT-EMP-01**) — WH create: position = catalog picker ∈ EFF; reject free-text SoT (platform BA-01 retain wording · close WH **F** residual as bind deepen).
7. **Honesty / seals** (**AC-PLT-EMP-01H**) — personnel/e2e/printable **false** · RETAIN EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR · **C-SLICE-≠-MODULE** · **DENY** invent EMP-STATUS FE · Nest `emp_position` · fold custom/status · mega-EAV · seed · module EMP UAT.
8. **Dept companion** (`departments` / `department_key`) = **same Option A architecture** · **OUT** primary AC this seat → follow-on `…-EMP-DEPT-CATALOG-*` (**L-EMP-POS-06**).

### Actors

| Actor | Role |
|-------|------|
| HCNS / Settings + XBOS catalog admin | CREATE / sync / retire `job_titles` N+1 (group khung + tenant extension) |
| HCNS NS (HR) | WH create/update · employee job title · CTR/DEC position bind |
| REC (narrow) | JD position bind ∈ same SoT when surface writes `position_key` |
| System (BE) | `assertCodeInEffectiveCatalog` / WH·EMP·CTR·DEC asserts · invent KEY / empty-catalog class |
| QA | U65 browser **AC-PLT-EMP-01*** · VAL-EMP-POS-CNS-* · zero-seed |
| QC | Narrow seal · honesty false · **DENIED** personnel / module EMP UAT / Nest `emp_position` / reopen seals |
| PM | Unlock BE CNS **only if GAP**; ba-data **HOLD**; dept follow-on WI later |

### Scope

| In (this seat) | Out |
|----------------|-----|
| **AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H** · VAL-EMP-POS-CNS-* · BR-PLT-EMP-POS-* · surface matrix | Impl `apps/**` / migration / seed |
| Enumerate Settings/XBOS `job_titles` admin + WH/EMP/CTR/DEC consumers | Claim module EMP UAT / flip `hrm_personnel_uat_ready` |
| Cite EMP-CUSTOM Option A admin≠consumer (**pattern**) · EMP-STATUS B (**cite ≠ copy**) | Copy Nest EMP-STATUS BA · invent Nest `emp_position` |
| ba-data **HOLD** (Settings/XBOS physical LIVE) | Nest `emp_position` EXPAND · fold into EMP-CUSTOM / EMP-STATUS |
| Align BR-PLT-02/04/05/06 · close WH free-text **F** as AC bind | Primary **dept** AC pack · reopen EMP-STATUS FE HOLD |

---

## 1. As-is vs to-be

| | AS-IS (evidence) | TO-BE (Option A · this pack) |
|---|------------------|------------------------------|
| Position SoT | Settings `job_titles` (+ XBOS sync / extension) **LIVE** · Nest `emp_position` **ABSENT** (intentional) | Named **AC-PLT-EMP-01*** — SoT = Settings/XBOS EFF (**L-EMP-POS-01**) |
| WH invent / empty | `assertWhPositionKey` → **`HRM-WH-PICK-REQUIRED`** / **`HRM-WH-PICK-EMPTY-CATALOG`** LIVE | **01b/01c** — platform KEY **`HRM-EMP-POSITION-KEY` ≡ WH-PICK-REQUIRED**; empty class retain |
| EMP job title | `assertJobTitleKeyInCatalog` ∈ `job_titles` LIVE | Same SoT · invent KEY class under **01b** |
| CTR / DEC / REC | position asserts ∈ `job_titles` (retain) | Same SoT · **RETAIN** existing codes · deepen if GAP |
| WH free-text **F** (BA-01 stamp) | Residual FE/bind vs picker AC | **01** closes F as consumer picker SoT — not Nest DEFINE |
| EMP-STATUS Nest L1 · EMP-CUSTOM A · EXT | Orthogonal LIVE | **SEAL RETAIN** · **OUT** fold |
| Dept | Same Settings class LIVE | Option A architecture locked · **OUT** AC pack follow-on |
| Honesty | Slice deepen risk misread module GO | personnel / e2e / printable **false** · **`C-SLICE-≠-MODULE`** |

**Peer class (cite ≠ copy):**

| Peer | Class | This seat |
|------|-------|-----------|
| **EMP-CUSTOM Option A** | Settings producer **LIVE** → deepen A · admin open ≠ consumer invent | **Closest peer** — cite AC/VAL split |
| **EMP-STATUS Option B** | Nest **absent** + hardcode/CHECK → Nest DEFINE | **Cite admin≠consumer only** — **FORBIDDEN** copy Nest DEFINE BA |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-02** | EFF active `job_titles` **>0** | Consumer SoT = picker/FK ∈ EFF | Invent unknown → **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**) |
| **BR-PLT-04** | Retire / inactive config | Soft-delete / active=false | Picker hide; history WH/CTR/DEC intact |
| **BR-PLT-05** | Admin CREATE / sync | Open N+1 slug · VAL format only | **FORBIDDEN** closed enum / reject N+1 |
| **BR-PLT-06** | Group vs tenant | XBOS SoT khung + tenant extend | **FORBIDDEN** HRM-only dual master replacing XBOS |
| **L-EMP-POS-01** | Position SoT | Settings/XBOS `job_titles` EFF | Nest `emp_position` **REJECT** |
| **L-EMP-POS-03** | Admin vs consumer | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-EMP-POS-05** | EFF count =0 | Empty-catalog class + CTA · no free-text · no seed | Seed = **FAIL U65** |
| **L-EMP-POS-06** | Dept | Same Option A · OUT this pack | Follow-on WI |
| **L-EMP-POS-07..14** | Orthogonal / seals / honesty / soft-delete / scope / display / mega-EAV / EMP-STATUS FE | RETAIN / false / U19 / FORBIDDEN | See §8 |

---

## 3. EMP position-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-EMP-POS-01** | Surface = **catalog admin** (Settings items `job_titles` and/or XBOS sync upsert) | Cho phép position code N+1 (slug hợp lệ, active) | **2xx** · list + F5 còn — **không** «closed list only» |
| **BR-PLT-EMP-POS-02** | Surface ∈ **consumer set** (§4) **và** EFF active **>0** | `position_key` / `job_title_key` **must** ∈ EFF | Unknown → **4xx** **`HRM-EMP-POSITION-KEY`** (WH alias **`HRM-WH-PICK-REQUIRED`** ≡) · không persist invent |
| **BR-PLT-EMP-POS-03** | EFF active **=0** | Soft empty + CTA Settings; invent → **`HRM-WH-PICK-EMPTY-CATALOG`** class (or equivalent empty block); free-text SoT **FORBIDDEN**; admin vẫn CREATE | Seed/script density = **FAIL U65** |
| **BR-PLT-EMP-POS-04** | Soft-retire / inactive `job_titles` row | Hide from consumer picker | History rows may retain retired keys (**BR-PLT-04**) |
| **BR-PLT-EMP-POS-05** | Free-text `position` alone without catalog key when EFF>0 | **FORBIDDEN** as SoT | Same invent/required class as missing/unknown key |
| **BR-PLT-EMP-POS-06** | Nest `emp_position` / `emp_job_title` as GĐ1 SoT | **REJECT** | Violates EMP VERTICAL L-EMP-CAT-05 · L-EMP-POS-01 |
| **BR-PLT-EMP-POS-07** | Fold position into EMP-CUSTOM extension / EMP-STATUS / DOC/ET / mega-EAV | **FORBIDDEN** | Orthogonal seals **RETAIN** |
| **BR-PLT-EMP-POS-08** | Settings MD overview alone *as substitute when Nest needed* | **N/A reject class** — Nest **not** needed here | Intentional XBOS REF Option A (**L-EMP-POS-01**) — **≠** SI/ATT Nest-needed MD-alone reject |
| **BR-PLT-EMP-POS-09** | ba-data | Settings/XBOS `job_titles` LIVE | **HOLD** — **FORBIDDEN** Nest ADD |
| **BR-PLT-EMP-POS-10** | Scope | List ↔ get-by-id ↔ mutate ↔ invent assert | Same `resolveHrmListScope` (**U19**) |
| **BR-PLT-EMP-POS-11** | Display-ready | Prefer catalog `*_label` from EFF | FE **cấm** invent join when BE provides (OS 28) |
| **BR-PLT-EMP-POS-12** | Dept companion | Same architecture | **OUT** primary AC → follow-on |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| EMP VERTICAL **L-EMP-CAT-05** | Position = XBOS REF — **must_keep** · Nest position **FORBIDDEN** |
| EMP-CUSTOM Option A | Admin≠consumer **cite** — SoT class = Settings LIVE deepen |
| EMP-STATUS Option B Nest L1 | **SEAL RETAIN** — **cite ≠ copy** · **FORBIDDEN** invent EMP-STATUS FE |
| MergeToken EXT · DOC/ET · ATT · SI · CTR | **SEAL RETAIN** · **OUT** fold |
| WH jest `HRM-WH-PICK-REQUIRED` / empty | **RETAIN** — ≡ platform KEY class |

**Error code lock (deterministic):**

| Code | Use | Not |
|------|-----|-----|
| **`HRM-EMP-POSITION-KEY`** | Platform consumer invent unknown `position_key` / `job_title_key` when EFF>0 | Soft empty · seed · admin CREATE |
| **`HRM-WH-PICK-REQUIRED`** | WH surface alias — **≡ same class** as POSITION-KEY (BA maps) | Soft empty synonym · admin CREATE |
| **`HRM-WH-PICK-EMPTY-CATALOG`** | EFF=0 invent / free-text attempt | Invent-when-EFF>0 synonym |
| Format / VAL admin | Invalid slug on admin CREATE | Consumer invent synonym |
| Scope mismatch | company ≠ token scope | Invent KEY synonym |

**SUPERSEDED / FORBIDDEN:** Option B Nest `emp_position` · Option C dual writers / mega-EAV / fold custom·status · invent personnel UAT · reopen EMP-STATUS/CUSTOM/EXT · claim module EMP UAT · seed · free-text SoT when EFF>0 · invent EMP-STATUS FE · primary dept AC this seat.

---

## 4. Producer + consumer surface inventory

### 4.1 Producer SoT

| Producer | storageKey / path | Notes |
|----------|-------------------|-------|
| Settings-catalogs items | **`job_titles`** | Aliases accepted: `positions` · `employee_positions` |
| XBOS catalog sync | Group publish/pull khung | **BR-PLT-06** SoT khung — HRM = consumer + tenant extension |
| Tenant extension | ADR-allowed N+1 on same key | Collision: tenant wins per ADR (SA F-EMP-CAT-POS-EFF-01) |

**FORBIDDEN producer:** Nest `emp_position` / `emp_job_title` domain table as GĐ1 SoT.

### 4.2 Surfaces (authoritative)

> **Admin ≠ consumer.** Invent KEY / EFF picker áp **consumer rows** — **không** áp lên admin CREATE/sync N+1.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | Class |
|---------|-------------------|--------------------------|-----------|-------------------|-------|
| **S-EMP-POS-ADM-01** | Settings / XBOS **admin** `job_titles` | Settings danh mục chức danh · XBOS sync | code/label open N+1 | **F-EMP-CAT-POS-01/02** · EFF-01 | **ADMIN** |
| **S-EMP-POS-CNS-01** | Work history create/update (**primary**) | Employee WH · `position_key` | ∈ EFF when EFF>0 | WH API · **F-EMP-POS-CNS-01** | **CONSUMER** |
| **S-EMP-POS-CNS-02** | Employee create/update job title | Employees form · `job_title_key` | ∈ EFF when EFF>0 | Employees API · **F-EMP-POS-CNS-02** | **CONSUMER** |
| **S-EMP-POS-CNS-03** | CTR / DEC position / signer | Contract / decision forms | ∈ EFF when EFF>0 | CTR/DEC API · **F-EMP-POS-CNS-03** **RETAIN** | **CONSUMER** |
| **S-EMP-POS-CNS-04** | REC JD position (when writes key) | JD bind | ∈ EFF when EFF>0 | REC path deepen if GAP | **CONSUMER narrow** |
| **S-EMP-POS-REF-01** | Settings MD overview alone | Catalog stub without items CRUD / sync | — | — | **Not sole SoT** when CRUD/sync exists — Option A uses items+EFF |
| **S-EMP-POS-OUT-01** | Nest `emp_position` UI/API | — | — | — | **OUT** · **FORBIDDEN** |
| **S-EMP-POS-OUT-02** | EMP-STATUS / EMP-CUSTOM / DOC/ET / EXT | Peer packs | — | — | **OUT** · **SEAL RETAIN** |
| **S-EMP-POS-OUT-03** | Dept catalog primary AC | `departments` | — | — | **OUT** follow-on (Option A arch only) |

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-EMP-POS-01** | Consumer WH — picker SoT | EFF>0 → WH create chọn `position_key` ∈ EFF → Lưu **2xx** → F5 còn · **không** free-text SoT | Update WH same key rules | Free-text alone · invent key · missing key |
| **UC-PLT-EMP-POS-01b** | Consumer invent KEY | EFF>0 → Lưu WH/EMP/CTR với key ∉ EFF → **4xx** POSITION-KEY (≡ WH-PICK-REQUIRED) | Spot EMP/CTR | 2xx invent · seed |
| **UC-PLT-EMP-POS-01c** | Empty EFF | EFF=0 → CTA Settings · empty-catalog class · free-text **FORBIDDEN** · no seed · admin vẫn CREATE | — | Seed density · silent free-text accept |
| **UC-PLT-EMP-POS-01d** | Admin — CREATE/sync N+1 | Settings/XBOS → Append/sync `job_titles` → Lưu/sync **2xx** → list có row → **F5** → consumer picker thấy | Sửa label | Format invalid · scope 409 · «closed enum» sai áp |
| **UC-PLT-EMP-POS-01e** | Soft-retire | Retire/inactive → picker hide; history WH/CTR OK | Reactivate if product allows | Hard-delete · wipe history keys |
| **UC-PLT-EMP-POS-01H** | Honesty / seals | Evidence flags false · seals retain · Nest DENY · no EMP-STATUS FE invent | — | Flip ready · reopen seals · module EMP UAT claim |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings_XBOS
  actor HR as HCNS_NS
  participant Cat as F_EMP_CAT_POS
  participant Eff as F_EMP_CAT_POS_EFF
  participant WH as WorkHistory_API

  Admin->>Cat: CREATE_or_sync job_titles N+1
  alt Ceiling / closed-enum sai áp admin
    Cat-->>Admin: FAIL — vi phạm BR-PLT-05 / L-EMP-POS-03
  else 2xx active
    Cat-->>Admin: 2xx + F5 list (01d)
  end
  HR->>Eff: GET effective job_titles
  Eff-->>HR: picker rows
  HR->>WH: Luu WH position
  alt EFF active = 0
    WH-->>HR: 4xx HRM-WH-PICK-EMPTY-CATALOG; CTA Settings; cấm seed / free-text
  else EFF > 0 and invent unknown position_key
    WH-->>HR: 4xx HRM-EMP-POSITION-KEY
    Note over WH: alias HRM-WH-PICK-REQUIRED same class
  else key ∈ EFF
    WH-->>HR: 2xx; F5 WH row
  end
  Note over Cat: EMP-STATUS CUSTOM EXT DOC/ET RETAIN
  Note over WH: Nest emp_position FORBIDDEN
```

---

## 6. Acceptance criteria (measurable · U65) — **CONFIRMED**

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe / reopen EMP-STATUS L1 · EMP-CUSTOM · MergeToken EMP EXT · DOC/ET · ATT · SI · CTR · enrollment.  
> **Không** invent EMP-STATUS FE HOLD · Nest `emp_position` · primary dept AC.

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-EMP-01** | **S-EMP-POS-CNS-01** (primary) · spot **CNS-02** | EFF>0 (from admin/sync — **không** seed): WH create position = **catalog picker** ∈ EFF `job_titles` → Network **2xx** → FE list có row → **F5** còn — **reject** free-text `position` alone as SoT (**BR-PLT-02** · close WH **F**) | Free-text SoT accepted · invent key 2xx · FE hardcode list · seed |
| **AC-PLT-EMP-01b** | **CNS-01** primary · spot **CNS-02/03** | EFF>0: consumer Lưu với unknown `position_key` / `job_title_key` → FE chặn và/hoặc Network **4xx** **`HRM-EMP-POSITION-KEY`** (WH may show **`HRM-WH-PICK-REQUIRED`** — **≡ same class**) → **không** persist invent sau F5 | 2xx invent · silent accept · rename KEY wipe · treat WH-PICK as different business class |
| **AC-PLT-EMP-01c** | Empty EFF | EFF **=0**: soft empty + **CTA Settings**; invent/free-text → **`HRM-WH-PICK-EMPTY-CATALOG`** (or equivalent empty block); **ADM-01** vẫn CREATE/sync; **không** seed | Seed/script density · free-text fallback SoT · invent-as-accept |
| **AC-PLT-EMP-01d** | **S-EMP-POS-ADM-01** | Admin **CREATE/sync** `job_titles` **#N+1** (code + label vi-VN, active) → Network **2xx** → FE list có row → **F5** còn → consumer picker (**01**) includes row — **không** reject «closed enum only» · **BR-PLT-05/06** | Áp invent ban lên admin · ceiling starter · Nest position UI · seed |
| **AC-PLT-EMP-01e** | Retire **ADM-01** → picker | Soft-retire / inactive → hidden from consumer picker · history WH/CTR/DEC with retired keys **OK** (no hard wipe) | Hard-delete-only · wipe history · picker still lists retired as selectable SoT |
| **AC-PLT-EMP-01H** | Honesty / seals | Evidence: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · EMP-STATUS L1 **`EMPSTQA-MSK20G7H`** · EMP-CUSTOM **`EMPCFQA-MSK14LUH`** · EXT **`EMPTOKEXTQA-MSJ57PE1`** · DOC/ET · ATT · SI · CTR **SEAL RETAIN** · Nest `emp_position` **DENIED** · fold custom/status **DENIED** · invent EMP-STATUS FE **DENIED** · personnel flip **DENIED** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module EMP UAT / Phase1 | Flip ready · reopen seals · Nest invent · claim module EMP UAT · invent EMP-STATUS FE |

### 6.2 Retain peer AC (cite — không reopen)

| ID / stamp | Surface | Đạt khi | Không đạt khi |
|------------|---------|---------|----------------|
| EMP-STATUS L1 **`EMPSTQA-MSK20G7H`** | Nest ST/STR | **RETAIN** — spot only if regression risk | Reopen EMP-STATUS suite / invent FE HOLD |
| EMP-CUSTOM **`EMPCFQA-MSK14LUH`** | Settings extension field-def | **RETAIN** — **≠** position SoT | Fold position into custom |
| MergeToken EXT **`EMPTOKEXTQA-MSJ57PE1`** | `custom.emp.*` | **RETAIN** | Reopen EXT / register on position save |
| DOC/ET · ATT · SI · CTR | Peer packs | **SEAL RETAIN** | Reopen peers |

### 6.3 Consumer VAL (BE/QA measurable) — **VAL-EMP-POS-CNS-***

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-EMP-POS-CNS-01** | WH **CNS-01** invent | Unknown `position_key` when EFF>0 | **4xx** `HRM-EMP-POSITION-KEY` **or** `HRM-WH-PICK-REQUIRED` (≡) | 01b · BR-PLT-EMP-POS-02 | **BE GAP if missing / wrong class** — unlock CNS deepen only if QA/probe FAIL after BA · AS-IS WH-PICK-REQUIRED **LIVE** → expect **PASS retain** unless regress |
| **VAL-EMP-POS-CNS-02** | Empty EFF | EFF=0 · invent / free-text attempt | **`HRM-WH-PICK-EMPTY-CATALOG`** · CTA · no seed · free-text FORBIDDEN | 01c · BR-PLT-EMP-POS-03 | **RETAIN** empty class LIVE; FE CTA **GAP verify** |
| **VAL-EMP-POS-CNS-03** | EMP **CNS-02** invent | Unknown `job_title_key` when EFF>0 | **4xx** invent KEY class (`HRM-EMP-POSITION-KEY` or existing catalog assert code — BA maps ≡) | 01b · F-EMP-POS-CNS-02 | **BE GAP if missing** — deepen only if FAIL |
| **VAL-EMP-POS-CNS-04** | Soft-retire | Retire then consumer picker / invent retired code | Hidden from picker; invent of retired as unknown when EFF excludes it → KEY class | 01e · BR-PLT-04 | Deepen if picker still shows retired selectable |
| **VAL-EMP-POS-CNS-05** | CTR/DEC spot | Unknown `position_key` / `signer_position_key` when EFF>0 | Invent KEY class · **RETAIN** existing asserts | 01b · F-EMP-POS-CNS-03 | **RETAIN** — deepen if FAIL |
| **VAL-EMP-POS-CNS-06** | Scope parity | List EFF scope ≠ invent assert scope | jest **FAIL** scope_parity · 409/4xx deterministic | L-EMP-POS-11 · U19 | **RETAIN** deepen if FAIL |
| **VAL-EMP-POS-CNS-07** | Free-text alone | WH free-text `position` without key when EFF>0 | Reject (required/invent class) — closes **F** | 01 · BR-PLT-EMP-POS-05 | **FE/BE GAP** if UI still allows free-text SoT |
| **VAL-EMP-POS-ADM-01** | Admin **ADM-01** | CREATE/sync N+1 open slug | **2xx** + F5 row visible in picker | 01d · BR-PLT-05/06 | **RETAIN** Settings/XBOS path — deepen if closed-enum regress |
| **VAL-SET-MD-01 / FR-HRM-SC-POS-01** | Catalog pointer | Position ∈ `job_titles` EFF | Retain platform catalog AC | L-EMP-POS-01 | **RETAIN** |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-EMP-STATUS-01** | EMP-STATUS L1 GWC · stamp `EMPSTQA-MSK20G7H` retained · FE HOLD not invented | Reopen status suite / invent FE |
| **MK-EMP-CUSTOM-01** | EMP-CUSTOM CNS · stamp `EMPCFQA-MSK14LUH` retained | Fold position into custom |
| **MK-EMP-TOK-EXT-01** | EXT GWC · stamp `EMPTOKEXTQA-MSJ57PE1` retained | Reopen EXT / wipe F-EMP-TOK-03 |
| **MK-EMP-DOCET-01** | DOC/ET Nest + tokens retained | Absorb DOC/ET into position seat |
| **MK-ATT-SI-CTR-01** | ATT · SI · CTR seals retain | Reopen peers |
| **MK-NO-NEST-POS-01** | No Nest `emp_position` / dual master vs XBOS | Invent Nest physical |
| **MK-WH-PICK-01** | WH-PICK-REQUIRED / EMPTY-CATALOG class retain ≡ POSITION-KEY | Dual conflicting error semantics |
| **MK-VERTICAL-POS-01** | EMP VERTICAL L-EMP-CAT-05 XBOS REF retained | Reopen as Nest Option B |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-EMP-POS-CAT-01`** | WH create picker ∈ EFF (**01**) · close free-text F | ba-docs ADD after CONFIRM / QA |
| **Proposed `J-HRM-EMP-POS-CAT-02`** | EFF>0 invent → KEY (**01b**) | WH ≡ POSITION-KEY |
| **Proposed `J-HRM-EMP-POS-CAT-03`** | EFF=0 empty + CTA (**01c**) | U65 no seed |
| **Proposed `J-HRM-EMP-POS-CAT-04`** | Admin CREATE/sync N+1 → picker (**01d**) | BR-PLT-05/06 |
| **Proposed `J-HRM-EMP-POS-CAT-05`** | Soft-retire hide · history OK (**01e**) | |
| **Proposed `J-HRM-EMP-DEPT-CAT-*`** | Dept companion | **OUT** follow-on WI |
| Cross-nav U19 | Settings/`job_titles` list → WH/employee form bind → F5 | AC list mutate kèm F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup `main`) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-EMP-POSITION-KEY`** | Consumer invent unknown position/job_title key when EFF>0 | **4xx** | Banner VI — không toast success |
| **`HRM-WH-PICK-REQUIRED`** | WH alias same invent/required class | **4xx** | Same UX class as POSITION-KEY |
| **`HRM-WH-PICK-EMPTY-CATALOG`** | EFF=0 invent / free-text attempt | **4xx** | CTA Settings · **cấm** seed |
| Admin format VAL | Invalid slug / duplicate active code | 4xx | Admin form |
| Scope mismatch | Mutate/assert company ≠ token scope | 409 class | Honest empty/banner |

**Cấm:** 2xx invent when EFF>0; 500 trên invent; seed để pass UF; free-text SoT when EFF>0; dual semantics WH-PICK ≠ POSITION-KEY; invent EMP-STATUS FE.

---

## 8. Honesty / non-claims / seals / OUT

| Flag / seal | Rule |
|-------------|------|
| `hrm_personnel_uat_ready` | **false** — **DENIED** flip |
| `employees_e2e_linkage_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — unchanged |
| EMP-STATUS L1 · stamp `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — **DENIED** reopen · **DENIED** invent FE HOLD |
| EMP-CUSTOM · stamp `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — **DENIED** fold position into custom |
| MergeToken EMP EXT · stamp `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — **DENIED** reopen |
| DOC/ET · ATT · SI · CTR · enrollment | **SEAL RETAIN** |
| Module EMP UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Nest `emp_position` / mega-EAV / dual master vs XBOS | **DENIED** |
| Fold into EMP-STATUS / custom / DOC/ET | **DENIED** |
| Seed `job_titles` for UF | **DENIED** (U65) |
| Primary dept AC this seat | **OUT** → follow-on (Option A arch locked) |
| ba-data | **HOLD** — **no Nest EXPAND** |
| `C-SLICE-≠-MODULE` | Position AC pack ≠ module EMP UAT |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS position picker / empty CTA | **OPTIONAL** | ADD-only «SoT = Settings/XBOS job_titles; invent → HRM-EMP-POSITION-KEY; empty = CTA no seed» **if** sponsor ambiguity |
| Journey rows J-HRM-EMP-POS-CAT-* | **OPTIONAL** after QA stamp | Map §6.5 · update `PILOT_BUSINESS_FLOW_BA_TRACE` |
| Dept companion pack | **FOLLOW-ON** | Separate WI · same Option A |
| ba-data EXPAND Nest | **NO** | Physical LIVE Settings/XBOS · Nest FORBIDDEN |

---

## 10. Handoff expectations

### Gates after this BA

| Gate | Status |
|------|--------|
| ba-data | **HOLD** — **FORBIDDEN** Nest `emp_position` EXPAND |
| BE | **HOLD → UNLOCK narrow** `F-EMP-POS-CNS-*` / KEY alias unify **only if GAP** proven (WH-PICK + EMP asserts **must_keep** LIVE — **cấm** Nest table · **cấm** reopen EMP-STATUS BE) |
| FE | After BA — WH/employee pickers bind EFF `job_titles`; empty CTA; **FORBIDDEN** free-text SoT when EFF>0 · **FORBIDDEN** invent EMP-STATUS FE |
| QA | U65 **AC-PLT-EMP-01*** · VAL-EMP-POS-CNS-* · retain EMP-STATUS/CUSTOM/EXT |
| QC | Narrow seal · honesty false · **DENIED** personnel / module EMP UAT / Nest / reopen seals |
| Dept | Follow-on WI only — architecture Option A locked · **no** Nest `emp_department` here |

### SA / Dev / QA expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **SA** | Option A LOCKED retained | No reopen Option B Nest `emp_position` |
| **Dev-BE** | CNS invent KEY / empty deepen **iff** VAL-EMP-POS-CNS-* FAIL / missing | Jest + no Nest + no EMP-STATUS wipe |
| **Dev-FE** | WH/employee picker bind + empty CTA · close free-text F | U65 click path |
| **QA** | Browser matrix §6 · zero-seed · retain seals | Evidence stamp |
| **QC** | Narrow GWC · C-SLICE | No personnel flip |

### Residual / open questions

| ID | Item | Owner | Resolution |
|----|------|-------|------------|
| **R-EMP-POS-CNS-01** | WH invent already `HRM-WH-PICK-REQUIRED` LIVE — need platform alias string `HRM-EMP-POSITION-KEY`? | QA/probe → PM | If ≡ class documented **PASS retain**; unlock BE only if QA requires unified code string or assert missing |
| **R-EMP-POS-FE-01** | WH still free-text SoT on FE (BA-01 **F**)? | FE after BA / QA | If **FAIL** → unlock **dev-fe** picker bind only |
| **R-EMP-POS-EMP-01** | Employees `job_title_key` invent KEY string vs existing catalog assert | QA/probe | Deepen only if FAIL |
| **R-EMP-POS-DEPT-01** | Dept AC pack | PM follow-on | Separate WI · same Option A · **OUT** this seat |

**Unresolved product questions:** none blocking **CONFIRMED** — SA Option A + platform BA-01 + LIVE producer/asserts sufficient.

**AS-IS gap posture (BA stamp — not UF verdict):** BE WH/EMP catalog asserts appear **LIVE** → default next = **QA plan / L1 probe** (not automatic Nest BE unlock). Unlock **dev-be** only on VAL FAIL. Unlock **dev-fe** if WH free-text **F** still on UI.

---

## 11. Completion

| Field | Value |
|-------|--------|
| **completion_report** | **CONFIRMED** AC pack **AC-PLT-EMP-01 / 01b / 01c / 01d / 01e / 01H** + **VAL-EMP-POS-CNS-01..07** + ADM VAL · Option **A** Settings/XBOS **`job_titles`** effective = open position SoT; admin CREATE/sync open N+1 (**01d**); consumer invent → **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**) when EFF>0 (**01b**); empty → CTA + **`HRM-WH-PICK-EMPTY-CATALOG`** · no seed · free-text FORBIDDEN (**01c**); soft-retire hide · history OK (**01e**); WH picker closes free-text **F** (**01**); honesty **01H** · DENY Nest `emp_position` · fold custom/status · reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · personnel flip · invent EMP-STATUS FE · module EMP UAT / seed / Phase1; dept **OUT** follow-on (Option A arch only); ba-data **HOLD**; BE CNS unlock **only if GAP**; peer EMP-CUSTOM A **cite** · EMP-STATUS B **cite ≠ copy**. |
| **next_owner** | `pm` → **`qa`** (U65 AC + VAL probe plan) **or** **`dev-be`** / **`dev-fe`** **only if GAP** · dept follow-on WI later |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-ba-01.md` |
