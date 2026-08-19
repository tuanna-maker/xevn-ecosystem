# BA AC/BR — EMP custom-field open catalog Option A · Settings extension SoT ≠ Nest field-def / EXT reopen

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01` **CONFIRMED** Option **A** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **from_role** | ba-process |
| **lane** | governance |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — AC pack implementation-ready · ba-data **HOLD** · BE consumer invent-KEY **UNLOCK only if GAP** after this BA · FE bind/assert per gaps · personnel / module EMP UAT / reopen EXT **DENIED** |
| **change_mode** | **ADD** (deepen SA §7 · **EXPAND cite** sealed **AC-PLT-EMP-TOK-04*** · **no** wipe EXT / DOC/ET / ATT / SI / CTR / enrollment) |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md) Option **A** · L-EMP-CF-01..13 · F.1 · §7 draft |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-emp-custom-field-sa-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-sa-01.md) |
| **ref_ext_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md) **AC-PLT-EMP-TOK-04/04b/04c** **CONFIRMED** — **RETAIN / cite smoke only** |
| **ref_ext_qc** | [`po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md) GWC stamp **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — **cấm reopen** |
| **ref_platform_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-01/02/04/05** · EMP §2.1 · CORE-02b · Q-PLT-05 |
| **ref_api** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) **F-PLT-TOK-01..03** · SettingsCatalogs extension-items · **F-EMP-TOK-03** |
| **ref_peer_pattern** | PAY / ATT / SI admin open ≠ consumer invent — **pattern cite**; EMP SoT = Settings extension (≠ PAY Nest SC) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · MergeToken EMP EXT **SEAL RETAIN** · ATT worksite GWC · ATT-LEAVE · SI · CTR · enrollment · DOC/ET **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · DENY module EMP UAT |
| **Cấm** | `apps/**` · seed · Nest `emp_custom_field` / mega-EAV · flip personnel · reopen MergeToken EXT / ATT / SI / CTR · invent module EMP UAT · Phase1 DONE · ba-data EXPAND · register on employee value save |

---

## 0. Process objective & actors

### Objective

Khóa **AC/BR đo được** cho Option **A** (SA LOCKED):

1. **Definition SoT** = Nest-served Settings **`hrm_catalog_extension_items`** trên **allow-list** EMP field catalogs (**L-EMP-CF-01/02**) — **FORBIDDEN** MD overview alone · **FORBIDDEN** Nest field-def table GĐ1.
2. **Admin CREATE open N+1** (**BR-PLT-05** · **AC-PLT-EMP-CUSTOM-01**) — append/upsert active extension-item (slug) — **≠** consumer invent ban.
3. **BR-PLT-01 register** = same-TX **F-EMP-TOK-03** → `custom.emp.<code>` `origin=extension_field` trên **`hrm_merge_tokens`** (**AC-PLT-EMP-CUSTOM-01b**) — **EXPAND cite** sealed **AC-PLT-EMP-TOK-04*** · **RETAIN smoke** · **FORBIDDEN** reopen EXT suite / second register path.
4. **Consumers** khi **EFF active defs > 0** — extension codes trong `custom_fields` **phải** ∈ EFF (**BR-PLT-02**); invent → **`HRM-EMP-CUSTOM-FIELD-KEY`** (**AC-PLT-EMP-CUSTOM-01c**).
5. **Empty EFF** → soft empty + CTA Settings · invent assert **skip** · **no seed** (**AC-PLT-EMP-CUSTOM-01d** · **L-EMP-CF-06**).
6. **Soft-retire** definition → hide picker + soft-retire matching token · history values may retain retired keys (**BR-PLT-04** · **AC-PLT-EMP-CUSTOM-01e**).
7. **Value ≠ definition** — employee `custom_fields` value mutate **FORBIDDEN** as register trigger (**EXT-04c RETAIN** · **L-EMP-CF-07**).
8. **DENY** Nest field-def · mega-EAV · personnel flip · reopen EXT/ATT/SI/CTR · module EMP UAT · seed · Phase1.

### Actors

| Actor | Role |
|-------|------|
| HCNS / Settings admin | CREATE / retire extension-item trên allow-list EMP field catalogs |
| HCNS NS (HR) | Employee form bind / write extension codes → `custom_fields` |
| ESS (narrow) | Self-PATCH only allowed ESS keys — **must_keep** ESS phone/gender; **cấm** widen full HR catalog |
| System (BE) | F-EMP-TOK-03 register · F-EMP-CF-CNS invent KEY when EFF>0 · soft-retire token |
| QA | U65 browser AC-PLT-EMP-CUSTOM-01* · cite EXT retain smoke |
| QC | Narrow seal · honesty false · **DENIED** personnel / module EMP UAT / reopen EXT |
| PM | Unlock BE CNS **only if GAP**; ba-data **HOLD** |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-PLT-EMP-CUSTOM-01 / 01b / 01c / 01d / 01e / 01H · VAL-EMP-CF-CNS-* · BR-PLT-EMP-CF-* · surface matrix | Impl `apps/**` / migration / seed |
| Enumerate admin Settings extension + consumer employee bind/invent | Claim module EMP UAT / flip `hrm_personnel_uat_ready` |
| Cite **AC-PLT-EMP-TOK-04*** SEALED (**retain smoke** for 01b) | Reopen MergeToken EMP EXT GWC / R-EMP-TOK-EXT |
| ba-data **HOLD** (extension + merge_tokens LIVE) | Nest `emp_custom_field` · mega-EAV · DOC/ET fold · position / C&B |
| Align CORE-02b / BR-PLT-01/02/04/05 | Wipe EXT AC-04 · ATT worksite/leave · SI · CTR · enrollment seals |

---

## 1. As-is vs to-be

| | AS-IS (evidence) | TO-BE (Option A · this pack) |
|---|------------------|------------------------------|
| Field-def SoT | Settings `hrm_catalog_extension_items` on EMP allow-list catalogs LIVE | Named **AC-PLT-EMP-CUSTOM-01*** — SoT = extension-items (**L-EMP-CF-01**) |
| BR-PLT-01 register | **F-EMP-TOK-03** LIVE · EXT QC **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` CLOSED** | **01b** = **RETAIN smoke** cite AC-04 — **cấm** reopen EXT suite |
| Consumer invent KEY | Not sealed as AC-PLT-EMP-CUSTOM-* | **01c** when EFF>0 → **`HRM-EMP-CUSTOM-FIELD-KEY`** |
| Empty EFF | Soft empty class peer catalogs | **01d** skip invent + CTA · **no seed** |
| Soft-retire | EXT-04-RETIRE sealed for token | **01e** field + token soft-retire · history OK |
| Nest field-def | **ABSENT** | **FORBIDDEN** invent GĐ1 |
| DOC/ET Nest + `emp.doc.*` / `emp.et.*` | **SEALED orthogonal** | **OUT** · **SEAL RETAIN** |
| Honesty | Slice deepen risk misread module GO | personnel / e2e / printable **false** · **`C-SLICE-≠-MODULE`** |

---

## 2. Platform locks (reuse)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-01** | Custom field definition saved **active** on allow-list | Auto-register merge token via **F-EMP-TOK-03** | `custom.emp.<code>` · `origin=extension_field` · F5 list (**AC-PLT-CTR-05** class · **AC-04 RETAIN**) |
| **BR-PLT-02** | EFF active defs **>0** | Consumer SoT = picker/FK ∈ EFF codes | Invent unknown extension code → **`HRM-EMP-CUSTOM-FIELD-KEY`** |
| **BR-PLT-04** | Retire definition | Soft-delete item + matching token | Picker hide; history / issued intact |
| **BR-PLT-05** | Admin CREATE | Open N+1 slug · VAL format only | **FORBIDDEN** closed enum / reject N+1 |
| **L-EMP-CF-01** | Definition SoT | `hrm_catalog_extension_items` allow-list | MD-alone / Nest field-def **REJECT** |
| **L-EMP-CF-03** | Admin vs consumer | Split AC/VAL | Mis-apply invent ban lên admin = **FAIL process** |
| **L-EMP-CF-04** | Register path | F-EMP-TOK-03 only | **FORBIDDEN** second token table / alternate register |
| **L-EMP-CF-06** | EFF count =0 | Skip invent + CTA | **FORBIDDEN** seed |
| **L-EMP-CF-07** | Value mutate | **≠** register | EXT-04c **RETAIN** |
| **L-EMP-CF-09..13** | Seals / honesty / scope / OUT | RETAIN / false / U19 / DOC-ET-position OUT | See §8 |

---

## 3. EMP custom-field-specific business rules

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-PLT-EMP-CF-01** | Surface = **catalog admin** (`POST/PUT` extension-items on allow-list) | Cho phép field code N+1 (slug hợp lệ, active) | **2xx** · list + F5 còn — **không** «closed list only» |
| **BR-PLT-EMP-CF-02** | Same admin save **active** allow-list | Same-TX **F-EMP-TOK-03** | Token `custom.emp.<code>` · `origin=extension_field` · `domain=EMP` · `ring=custom` (**cite AC-04**) |
| **BR-PLT-EMP-CF-03** | Surface ∈ **consumer set** (§4) **và** EFF active defs **>0** | Keys that are **extension defs** (not core/builtin columns) **must** ∈ EFF | Unknown → **4xx** **`HRM-EMP-CUSTOM-FIELD-KEY`** · không persist invent |
| **BR-PLT-EMP-CF-04** | EFF active defs **=0** | Soft empty + CTA Settings; invent assert **skip**; admin vẫn CREATE | Seed/script density = **FAIL U65** |
| **BR-PLT-EMP-CF-05** | Retire extension-item allow-list | Soft-retire item + matching `custom.emp.*` | Hidden from picker; history values may retain retired keys |
| **BR-PLT-EMP-CF-06** | Settings MD overview alone (no extension CRUD) | **REJECT** as SoT | Must use extension-items physical |
| **BR-PLT-EMP-CF-07** | Employee value PATCH alone | **FORBIDDEN** register | Token unchanged (**EXT-04c RETAIN**) |
| **BR-PLT-EMP-CF-08** | Non-allow-list catalog extension save | **No** `custom.emp.*` from this path | **EXT-04b RETAIN** |
| **BR-PLT-EMP-CF-09** | ESS self-PATCH | Invent class only on **allowed ESS keys**; do not widen to full HR catalog | KEY or retain ESS 403 class |
| **BR-PLT-EMP-CF-10** | ba-data | `hrm_catalog_extension_items` + `hrm_merge_tokens` LIVE | **HOLD** — **FORBIDDEN** second field-def table |
| **BR-PLT-EMP-CF-11** | DOC/ET / position / C&B | Orthogonal / OUT | **FORBIDDEN** fold into this catalog |
| **BR-PLT-EMP-CF-12** | Scope | List ↔ get-by-id ↔ mutate ↔ invent assert | Same `resolveHrmListScope` (**U19**) |

**Align (no conflict):**

| Peer / vertical | This pack |
|-----------------|-----------|
| **AC-PLT-EMP-TOK-04 / 04b / 04c / 04-RETIRE** | **SEAL RETAIN** — **01b** = retain smoke cite; **cấm** reopen EXT suite |
| **AC-PLT-EMP-TOK-04c** | Value ≠ register — **must_keep** under **01** / CNS |
| DOC/ET Nest + `emp.doc.*` / `emp.et.*` | Orthogonal SEAL — **OUT** |
| PAY / ATT / SI admin≠consumer | Pattern cite — EMP SoT = Settings extension (≠ Nest SC) |

**Error code lock (deterministic):**

| Code | Use | Not |
|------|-----|-----|
| **`HRM-EMP-CUSTOM-FIELD-KEY`** | Consumer invent unknown **extension** code when EFF>0 | Soft empty · seed · admin CREATE |
| Format / VAL admin | Invalid slug on admin CREATE | Consumer invent synonym |
| Scope mismatch | company ≠ token scope | Invent KEY synonym |
| ESS 403 class | ESS key outside ESS allow | Synonym of CUSTOM-FIELD-KEY unless same invent class proven |

**SUPERSEDED / FORBIDDEN:** Option B Nest `emp_custom_field` · Option C dual writers / mega-EAV · invent personnel UAT · reopen EXT GWC · claim module EMP UAT · seed · register on value save · MD-alone SoT.

---

## 4. Allow-list + consumer surface inventory

### 4.1 Allow-list (producer SoT — EXT-SA §5.1 · L-EMP-CF-02)

| Allow-list `catalog_key` | Alias accepted |
|--------------------------|----------------|
| `hrm_employee_basic_fields` | `employee_basic_fields` |
| `hrm_employee_personal_fields` | `employee_personal_fields` |
| `hrm_employee_work_fields` | `employee_work_fields` |
| `hrm_employee_finance_fields` | `employee_finance_fields` |

**OUT (no `custom.emp.*` register · EXT-04b RETAIN):** `leave_types`, allowance, `job_titles`, DOC/ET catalogs, JD field catalogs, any key ∉ table.

**Normalize:** extension `code` → lower-case slug; must pass token key format as suffix of `custom.emp.<code>`.

**Default core column codes** in DEFAULT_* sets — **do not** auto-register as `custom.emp.*` · **do not** treat as invent KEY targets (builtin ≠ extension def).

### 4.2 Surfaces (authoritative)

> **Admin ≠ consumer.** Invent KEY / EFF picker áp **consumer rows** — **không** áp lên admin CREATE N+1.

| Surf ID | Surface (product) | Route / UI anchor (AS-IS) | Field SoT | Mutate / bind path | Class |
|---------|-------------------|--------------------------|-----------|-------------------|-------|
| **S-EMP-CF-ADM-01** | Settings EMP field catalog **admin** | Settings → trường nhân sự allow-list · extension-items CRUD | code/label open N+1 | **F-EMP-CF-01/02** · same-TX **F-EMP-TOK-03** | **ADMIN** |
| **S-EMP-CF-CNS-01** | Employee HR create/update (primary) | Employees form · `custom_fields` extension keys | code ∈ EFF when EFF>0 | Employees API · **F-EMP-CF-CNS-01** | **CONSUMER** |
| **S-EMP-CF-CNS-02** | ESS self-PATCH (narrow) | ESS profile allowed keys only | ESS allow ∩ extension | **F-EMP-CF-CNS-02** | **CONSUMER narrow** |
| **S-EMP-CF-TOK-01** | Merge-tokens list / resolve | Settings merge-tokens · `GET …/merge-tokens?domain=EMP` | `custom.emp.*` | **F-PLT-TOK** read | **RETAIN smoke** (AC-04) |
| **S-EMP-CF-REF-01** | Settings MD overview alone | Catalog MD stub without extension CRUD | — | — | **REJECT SoT** |
| **S-EMP-CF-OUT-01** | DOC/ET catalogs · `emp.doc.*` / `emp.et.*` | EMP DOC/ET Nest | — | — | **OUT** · **SEAL RETAIN** |
| **S-EMP-CF-OUT-02** | Position / C&B / leave / ATT / SI / CTR | Peer packs | — | — | **OUT** · **SEAL RETAIN** |

---

## 5. Use-case catalog (process)

| UC ID | Name | Happy | Alternate | Exception |
|-------|------|-------|-----------|-----------|
| **UC-PLT-EMP-CF-01** | Admin — CREATE field N+1 | Settings allow-list → Append extension-item → Lưu **2xx** → list có field → **F5** còn | Sửa label | Format invalid · scope 409 · «closed enum» sai áp |
| **UC-PLT-EMP-CF-01b** | Register token (RETAIN) | Same save → F5 merge-tokens có `custom.emp.<code>` `origin=extension_field` | Cite AC-04 path | Token missing · reopen EXT suite as new suite |
| **UC-PLT-EMP-CF-01c** | Consumer invent KEY | EFF>0 → Lưu NV với extension code ∉ EFF → **4xx** KEY | ESS narrow same class | 2xx invent · seed |
| **UC-PLT-EMP-CF-01d** | Empty EFF | EFF=0 → soft empty + CTA; invent skip; admin vẫn CREATE | — | Seed density |
| **UC-PLT-EMP-CF-01e** | Soft-retire | Retire item → picker hide + token retired; history OK | Reactivate if product allows | Hard-delete · wipe issued |
| **UC-PLT-EMP-CF-04c** | Value ≠ register | PATCH `custom_fields` value alone → **no** new token | — | Token appears → **FAIL** (EXT-04c) |

```mermaid
sequenceDiagram
  autonumber
  actor Admin as HCNS_Settings
  actor HR as HCNS_NS
  participant Ext as Settings_extension_items
  participant Tok as F_EMP_TOK_03
  participant Reg as hrm_merge_tokens
  participant Emp as Employees_API

  Admin->>Ext: CREATE field code N+1 (allow-list)
  alt Ceiling / closed-enum sai áp admin
    Ext-->>Admin: FAIL — vi phạm BR-PLT-05 / L-EMP-CF-03
  else 2xx active
    Ext->>Tok: same TX register
    Tok->>Reg: UPSERT custom.emp.code origin=extension_field
    Ext-->>Admin: 2xx + F5 field + token (01 / 01b RETAIN)
  end
  HR->>Emp: Luu NV custom_fields
  alt EFF active = 0
    Emp-->>HR: Skip invent assert; CTA Settings; cấm seed
  else EFF > 0 and invent unknown extension code
    Emp-->>HR: 4xx HRM-EMP-CUSTOM-FIELD-KEY
  else code ∈ EFF
    Emp-->>HR: 2xx; F5 values; token register unchanged
  end
  Note over Reg: EXT AC-04 SEAL RETAIN — no wipe / no reopen suite
```

---

## 6. Acceptance criteria (measurable · U65) — **CONFIRMED**

> Browser-only khi surface FE tồn tại · zero-seed · FE sau 2xx/4xx quan sát được + **F5** · probe/API **không** 🟢 UF.  
> Honesty flags **giữ false**.  
> **Không** wipe / reopen MergeToken EMP EXT GWC · ATT worksite/leave · SI · CTR · enrollment · DOC/ET.

### 6.1 Core AC pack

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-EMP-CUSTOM-01** | **S-EMP-CF-ADM-01** | Allow-list catalog: admin **CREATE** field **#N+1** (code + label vi-VN, active) → Network **2xx** extension-items → FE list/schema bind có field → **F5** còn — **không** reject «closed enum only» · **không** MD-alone SoT | Áp invent ban lên admin · ceiling starter · Nest field-def UI · seed |
| **AC-PLT-EMP-CUSTOM-01b** | **S-EMP-CF-TOK-01** (+ same save as 01) | Same definition save → F5 / `GET …/merge-tokens?domain=EMP` contains `custom.emp.<code>` · `origin=extension_field` · active · **cite AC-PLT-EMP-TOK-04** — may be **RETAIN smoke** (spot check) · **FORBIDDEN** reopen full EXT suite as this seat | Token missing · wrong origin · dual register path · claim new EXT wave |
| **AC-PLT-EMP-CUSTOM-01c** | **S-EMP-CF-CNS-01** (primary) · spot **CNS-02** | EFF active defs **>0** (from admin — **không** seed): consumer Lưu với unknown **extension** code → FE chặn và/hoặc Network **4xx** **`HRM-EMP-CUSTOM-FIELD-KEY`** → **không** persist invent sau F5 | 2xx invent · silent accept · rename KEY wipe · claim EXT-04c synonym |
| **AC-PLT-EMP-CUSTOM-01d** | Empty EFF | EFF **=0**: soft empty + CTA Settings; invent assert **skip**; **ADM-01** vẫn CREATE; **không** seed | Seed/script density · fake default fields |
| **AC-PLT-EMP-CUSTOM-01e** | Retire **ADM-01** → picker/token | Soft-retire field → hidden from consumer picker · matching `custom.emp.*` retired/hidden active · history values with retired keys **OK** (no hard wipe) | Hard-delete-only · wipe issued snapshot · reopen EXT-RETIRE as new product residual |
| **AC-PLT-EMP-CUSTOM-01H** | Honesty / seals | Evidence: `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · printable **false** · MergeToken EMP EXT / **`R-EMP-TOK-EXT`** **SEAL RETAIN** · ATT worksite GWC · ATT-LEAVE · SI · CTR · enrollment · DOC/ET **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed · DENY module EMP UAT / Phase1 | Flip ready · reopen EXT/ATT/SI/CTR · claim module EMP UAT · Nest field-def · mega-EAV |

### 6.2 Retain peer AC (cite — không reopen)

| ID | Surface | Đạt khi | Không đạt khi |
|----|---------|---------|----------------|
| **AC-PLT-EMP-TOK-04** | Admin → token | Allow-list extension → `custom.emp.*` `origin=extension_field` | **RETAIN** — stamp **`EMPTOKEXTQA-MSJ57PE1`** · smoke only under **01b** |
| **AC-PLT-EMP-TOK-04b** | Non-allow-list | No `custom.emp.*` | **RETAIN** — VAL-EMP-CF-CNS-04 cite |
| **AC-PLT-EMP-TOK-04c** | Value PATCH alone | No token | **RETAIN** — VAL-EMP-CF-CNS-05 cite |
| **AC-PLT-EMP-TOK-04-RETIRE** | Retire → hide token | Soft retire path | **RETAIN** — aligned **01e** |

### 6.3 Consumer VAL (BE/QA measurable) — **VAL-EMP-CF-CNS-***

| ID | Surface | Input | Expect | AC / BR | BA gap stamp |
|----|---------|-------|--------|---------|--------------|
| **VAL-EMP-CF-CNS-01** | Employee **CNS-01** invent | Unknown extension code when EFF>0 | **4xx** `HRM-EMP-CUSTOM-FIELD-KEY` | 01c · BR-PLT-EMP-CF-03 | **BE GAP if missing** — unlock CNS deepen only if QA/probe FAIL after BA |
| **VAL-EMP-CF-CNS-02** | Empty EFF | EFF=0 · invent attempt | Assert **skip** · CTA · no seed | 01d · BR-PLT-EMP-CF-04 | **RETAIN** empty-catalog class; FE CTA **GAP verify** |
| **VAL-EMP-CF-CNS-03** | Soft-retire | Retire then consumer picker / invent against retired code | Hidden from picker; invent of retired as unknown when EFF set excludes it → KEY | 01e · BR-PLT-04 | **RETAIN** EXT retire + deepen if picker still shows retired |
| **VAL-EMP-CF-CNS-04** | Non-allow-list | Extension save on OUT catalog | **No** new `custom.emp.*` | EXT-04b · BR-PLT-EMP-CF-08 | **RETAIN** — **cấm** reopen EXT suite |
| **VAL-EMP-CF-CNS-05** | Value ≠ definition | Employee `custom_fields` PATCH alone | **No** new token | EXT-04c · BR-PLT-EMP-CF-07 | **RETAIN** |
| **VAL-EMP-CF-CNS-06** | Scope parity | List defs scope ≠ invent assert scope | jest **FAIL** scope_parity · 409/4xx deterministic | L-EMP-CF-11 · U19 | **RETAIN** SettingsCatalogs / employees scope specs; deepen if FAIL |
| **VAL-EMP-CF-CNS-07** | ESS narrow | ESS invent outside ESS allow / unknown extension | KEY or ESS 403 — **cấm** widen full catalog | BR-PLT-EMP-CF-09 | **FE/BE GAP** only if ESS surface writes extension keys without gate |
| **VAL-EMP-CF-ADM-01** | Admin **ADM-01** | CREATE N+1 open slug | **2xx** + F5 field visible | 01 · BR-PLT-05 | **RETAIN** SettingsCatalogs CREATE — deepen if closed-enum regress |
| **VAL-EMP-CF-ADM-02** | Admin → token | Same save | Token `custom.emp.*` origin=`extension_field` | 01b · BR-PLT-01 | **RETAIN smoke** F-EMP-TOK-03 / AC-04 |

### 6.4 must_keep / regression pointers (không AC mới)

| Pointer | Pass | Fail |
|---------|------|------|
| **MK-EMP-TOK-EXT-01** | AC-PLT-EMP-TOK-04* GWC · stamp `EMPTOKEXTQA-MSJ57PE1` · `R-EMP-TOK-EXT` CLOSED retained | Reopen EXT suite / wipe F-EMP-TOK-03 |
| **MK-EMP-TOK-DOCET-01** | MERGE-TOKEN-EMP DOC/ET · stamp `EMPTOKQA-MSJ290VB` retained | Absorb DOC/ET into custom-field seat |
| **MK-ATT-WS-01** | ATT worksite GWC retained | Reopen ATT worksite |
| **MK-ATT-LEAVE-01** | ATT-LEAVE GWC retained | Reopen leave pack |
| **MK-SI-CTR-01** | SI type/insurer · CTR · enrollment seals retain | Reopen peers |
| **MK-NO-NEST-CF-01** | No Nest `emp_custom_field` / mega-EAV | Invent physical field-def |
| **MK-VALUE-NE-DEF-01** | Value mutate ≠ register | Token on PATCH values |

### 6.5 Journey / UF map (QA + ba-docs)

| ID | Maps | Notes |
|----|------|-------|
| **Proposed `J-HRM-EMP-CF-CAT-01`** | Admin CREATE N+1 → F5 field (**01**) | ba-docs ADD journey after CONFIRM / QA |
| **Proposed `J-HRM-EMP-CF-CAT-02`** | Same save → token smoke cite AC-04 (**01b**) | Retain EXT — spot only |
| **Proposed `J-HRM-EMP-CF-CAT-03`** | EFF>0 invent → KEY (**01c**) | |
| **Proposed `J-HRM-EMP-CF-CAT-04`** | EFF=0 skip + CTA (**01d**) | U65 no seed |
| **Proposed `J-HRM-EMP-CF-CAT-05`** | Soft-retire field+token (**01e**) | |
| Reuse | EXT AC-04 click path | **SEAL RETAIN** — do not invent parallel suite |
| Cross-nav U19 | Settings field list → employee form bind → F5 | AC list mutate kèm F5 |

**Persona:** Group CEO `ceo@xe.vn` (rollup `main`) + member HCNS khi test scope 409 — AC ghi rõ scope expect.

---

## 7. Error taxonomy (deterministic)

| Code | When | HTTP | FE |
|------|------|------|-----|
| **`HRM-EMP-CUSTOM-FIELD-KEY`** | Consumer invent unknown extension code when EFF>0 | **4xx** | Banner VI — không toast success |
| Admin format VAL | Invalid slug / duplicate active code | 4xx | Admin form |
| Scope mismatch | Mutate/assert company ≠ token scope | 409 class | Honest empty/banner |
| ESS deny class | ESS key outside ESS allow | 403/4xx retain | **cấm** widen catalog |

**Cấm:** 2xx invent when EFF>0; 500 trên invent; seed để pass UF; nhầm EXT-04c (no token) với CUSTOM-FIELD-KEY (invent value).

---

## 8. Honesty / non-claims / seals / OUT

| Flag / seal | Rule |
|-------------|------|
| `hrm_personnel_uat_ready` | **false** — **DENIED** flip |
| `employees_e2e_linkage_ready` | **false** — **DENIED** flip |
| `contracts_printable_ready` | **false** — unchanged |
| MergeToken EMP EXT GWC · `R-EMP-TOK-EXT` | **SEAL RETAIN** — **DENIED** reopen |
| ATT worksite GWC · ATT-LEAVE · SI · CTR · enrollment | **SEAL RETAIN** |
| DOC/ET Nest + MergeToken EMP DOC/ET | **SEAL RETAIN** · **OUT** fold |
| Module EMP UAT / Phase1 | **DENIED** — slice AC ≠ module GO |
| Nest `emp_custom_field` / mega-EAV / dual token table | **DENIED** |
| Seed extension / tokens for UF | **DENIED** (U65) |
| Register on employee value save | **DENIED** |
| Position / C&B as this catalog | **DENIED** |
| ba-data | **HOLD** — **no EXPAND** |
| `C-SLICE-≠-MODULE` | Custom-field AC pack ≠ module EMP UAT |

---

## 9. DOC-DELTA flag (optional ba-docs)

| Flag | Need? | Note |
|------|-------|------|
| Client SRS CORE-02b admin vs consumer invent KEY | **OPTIONAL** | ADD-only «SoT = Settings extension-items; invent → HRM-EMP-CUSTOM-FIELD-KEY; empty = skip no seed» **if** sponsor ambiguity |
| Journey rows J-HRM-EMP-CF-CAT-* | **OPTIONAL** after QA stamp | Map §6.5 · update `PILOT_BUSINESS_FLOW_BA_TRACE` |
| ba-data EXPAND | **NO** | Physical LIVE · no Nest field-def |

---

## 10. Handoff expectations

### Gates after this BA

| Gate | Status |
|------|--------|
| ba-data | **HOLD** — **FORBIDDEN** Nest `emp_custom_field` EXPAND |
| BE | **HOLD → UNLOCK narrow** `F-EMP-CF-CNS-*` **only if GAP** proven (admin CREATE + F-EMP-TOK-03 **must_keep** sealed — **cấm** reopen EXT BE) |
| FE | After BA — admin surface open N+1 + consumer bind to EFF; CTA empty; **cấm** invent Nest field-def UI |
| QA | U65 AC-PLT-EMP-CUSTOM-01* · **01b retain smoke** cite EXT · VAL-EMP-CF-CNS-* |
| QC | Narrow seal · honesty false · **DENIED** personnel / module EMP UAT / reopen EXT |

### SA / Dev / QA expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **SA** | Option A LOCKED retained | No reopen Option B Nest field-def |
| **Dev-BE** | CNS invent KEY deepen **iff** VAL-EMP-CF-CNS-01 FAIL / missing | Jest + no EXT wipe |
| **Dev-FE** | Admin CREATE + consumer picker/bind + empty CTA | U65 click path |
| **QA** | Browser matrix §6 · zero-seed · cite EXT retain | Evidence stamp |
| **QC** | Narrow GWC · C-SLICE | No personnel flip |

### Residual / open questions

| ID | Item | Owner | Resolution |
|----|------|-------|------------|
| **R-EMP-CF-CNS-01** | Does Employees create/update already assert extension codes ∈ EFF? | QA/probe after BA → PM | If **PASS** → BE CNS **no unlock**; if **FAIL** → unlock **dev-be** F-EMP-CF-CNS-01 only |
| **R-EMP-CF-FE-01** | Empty EFF CTA + picker bind on employee form | FE after BA | Verify / deepen |
| **R-EMP-CF-ESS-01** | ESS writes extension keys? | FE/BE only if surface exists | Narrow gate — **cấm** widen |

**Unresolved product questions:** none blocking CONFIRMED — Option A + EXT seal sufficient.

---

## 11. Completion

| Field | Value |
|-------|--------|
| **completion_report** | **CONFIRMED** AC pack **AC-PLT-EMP-CUSTOM-01 / 01b / 01c / 01d / 01e / 01H** + **VAL-EMP-CF-CNS-01..07** + ADM VAL · Option **A** Settings extension-items = open field-def SoT; admin CREATE open N+1; **01b** token `custom.emp.*` = **RETAIN smoke** cite sealed **AC-PLT-EMP-TOK-04*** (`EMPTOKEXTQA-MSJ57PE1`) — **no reopen EXT**; invent → **`HRM-EMP-CUSTOM-FIELD-KEY`**; empty skip+CTA no seed; soft-retire field+token; OUT Nest field-def / mega-EAV / personnel flip / reopen EXT·ATT·SI·CTR / module EMP UAT / seed; ba-data **HOLD**; BE CNS unlock **only if GAP**. |
| **next_owner** | `pm` → probe/gap then **`dev-be`** (CNS only if GAP) **or** **`dev-fe`** (bind/CTA) → **`qa`** |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-ba-01.md` |
