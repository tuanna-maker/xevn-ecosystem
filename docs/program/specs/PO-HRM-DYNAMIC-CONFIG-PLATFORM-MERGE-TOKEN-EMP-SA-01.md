# PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01 — Option/F.1 · MergeToken hook `custom.emp` (EMP after DOC/ET GWC)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02` |
| **Program** | `PO_HRM_CONTINUOUS_W8_20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** F-EMP-TOK-* · **EXPAND** F-PLT-TOK-02 hook intent + origin `emp_catalog` · **EXPAND** resolve bag EMP catalog labels · **DOC-DELTA** client API pointer · **NO CODE** `apps/**` · **no seed** · **no wipe** EMP-QC-01/02 · DOC/ET · ATT/REC/DEC · CTR · LIST-TOTALS |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** EMP MergeToken auto-register hook (peer **F-PLT-TOK** + **F-ALLOW-CAT** BR-PLT-01 class) · closes **L-EMP-CAT-11** / **R-PLT-EMP-04** |
| **prior_qc** | [`po-hrm-dynamic-config-platform-emp-qc-02.md`](../../qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md) browser GWC stamp **`EMPPLATQA2-MSJ0OAL9`** · L1 SEAL **`EMPPLATQA-MSIZXHIM`** retained |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · **L3 MergeToken SoT** · §7 Employees/NS · §8.1 Roll «EMP token hook» · V3 «Add employee custom field → token list» |
| **ref_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) **F-PLT-TOK-01..03** · BR-PLT-01 register shape `custom.emp.<code>` · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md) `hrm_merge_tokens` · §5.2 resolve · [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md) §1.1C `IMergeToken` |
| **ref_emp** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) **L-EMP-CAT-11** residual · F-EMP-CAT-DOC/ET sealed · **AC-PLT-EMP-01** position XBOS REF |
| **ref_peer** | [`PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md`](./PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md) §5 MergeToken `allowance_catalog` · F-ALLOW-CAT register-on-save |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-01** · **BR-PLT-03/04/05** · **AC-PLT-CTR-05** class |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · PAY/ATT/REC ready **false** · module EMP UAT / Phase1 **DENIED** · **`C-SLICE-≠-MODULE`** |
| **must_keep** | position/dept XBOS REF · contracts/SI · soft-delete · EMP-QC-01 L1 + EMP-QC-02 browser seals · ATT/REC/DEC spines · LIST-TOTALS/CTR · print-spine keyword_map fallback · F-PLT-TOK paths · `contracts_printable_ready=false` |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Decision context

| | |
|--|--|
| **Decision title** | EMP MergeToken hook after DOC/ET Catalog GWC — auto-register `custom.emp.*` + catalog label tokens |
| **Requestor** | pm · U88 residual from EMP-QC-02 |
| **Decision owner** | sa |
| **Problem** | Platform **F-PLT-TOK** + `hrm_merge_tokens` shipped; EMP **DOC/ET** catalogs L1+browser **SEALED**; ADR §8.1 / L-EMP-CAT-11 / R-PLT-EMP-04 still open — **no** deterministic register path binding EMP extension fields + DOC/ET effective catalogs into MergeToken SoT for HĐ preview field list (**BR-PLT-01** · ADR V3). |
| **Constraints** | ADD-only · no `apps/**` this seat · **cấm** reopen EMP-QC-01/02 · **cấm** invent personnel UAT · **cấm** mega-EAV second token table · print empty-registry → keyword_map fallback must_keep · U65 |
| **Failure if unresolved** | Clause author cannot see EMP custom/catalog tokens after Settings Lưu; ADR V3 / BR-PLT-01 remain paper-only; W8 MergeToken residual stalls. |

---

## 1. Options (evaluate)

### Option A — Manual F-PLT-TOK only (no EMP hook)

| | |
|--|--|
| **Description** | Keep F-PLT-TOK-01..03 admin CRUD; EMP Settings / DOC/ET save **do not** side-effect register. Document BR-PLT-01 EMP as backlog. |
| **Benefits** | Zero BE touch; seals untouched. |
| **Costs** | ADR V3 / BR-PLT-01 unmet; UX ≠ MISA; residual never closes. |
| **Risks** | Product gap forever; FE invents fake token list. |

### Option B — Auto-register hook on EMP writers (peer Allowance) — **RECOMMEND**

| | |
|--|--|
| **Description** | Same physical `hrm_merge_tokens` + **F-PLT-TOK-02** upsert. On EMP extension-field save **and** DOC/ET catalog create/upsert/retire: side-effect register/refresh/retire tokens. **EXPAND** origin CHK `emp_catalog`. Resolve bag ADD label bindings from effective DOC/ET. No new EMP catalog tables. |
| **Benefits** | Closes L-EMP-CAT-11 / R-PLT-EMP-04; peer F-ALLOW-CAT proven pattern; registry-wins §5.2 intact; DOC/ET seals consume only as **register triggers**. |
| **Costs** | Narrow DATA origin EXPAND + BE wire in EMP catalog services + optional FE picker smoke. |
| **Risks** | Over-register noise → mitigate: only `status=active` rows; retire sync; format CHK only (**BR-PLT-05**). |

### Option C — EMP-owned token table / dual registry

| | |
|--|--|
| **Description** | New `emp_merge_tokens` or mega EAV parallel to platform registry. |
| **Benefits** | None for GĐ1. |
| **Costs** | Dual SoT; PREV/VER rewrite. |
| **Risks** | Violates ADR Q-PLT-03 / L3 single MergeToken SoT — **REJECT**. |

---

## 2. Trade-off matrix

| Criteria | Weight | A Manual | **B Hook** | C Dual table |
|----------|-------:|---------:|-----------:|-------------:|
| Business value (BR-PLT-01 / ADR V3) | 5 | 1 | **5** | 2 |
| Time to deliver | 4 | 5 | **3** | 1 |
| Complexity | 4 | 5 | **3** | 1 |
| Reliability (single SoT) | 5 | 3 | **5** | 1 |
| Maintainability (peer Allowance) | 4 | 2 | **5** | 1 |
| Security / scope_parity | 3 | 4 | **4** | 2 |
| Honesty / seal safety | 5 | 5 | **5** | 2 |
| **Weighted** | | 76 | **108** | 36 |

---

## 3. Decision

| | |
|--|--|
| **Selected** | **Option B** |
| **Why** | Matches ADR L3 + F-PLT-TOK register shape + Allowance §5 peer; closes EMP residual without new physical catalog or dual registry; preserves sealed DOC/ET as triggers only. |
| **Assumptions** | `hrm_merge_tokens` + F-PLT-TOK BE already live; EMP DOC/ET Nest writers exist (EMP-BE-01 sealed L1); extension-field Settings path may stage after DOC/ET hook if AS-IS extension producer incomplete — DOC/ET hook = GĐ1 minimum. |
| **Rejected** | **A** — leaves BR-PLT-01 paper. **C** — ADR forbidden dual SoT. |

---

## 4. Locks (EMP-TOK)

| Lock | Rule |
|------|------|
| **L-EMP-TOK-01 Single SoT** | All EMP tokens live in **`hrm_merge_tokens`** — **FORBIDDEN** second EMP token table |
| **L-EMP-TOK-02 Open keys** | `token_key` format CHK only — **FORBIDDEN** closed enum of EMP tokens (**BR-PLT-05**) |
| **L-EMP-TOK-03 Register families** | (1) Extension → `custom.emp.<code>` · `origin=extension_field` · (2) DOC → `emp.doc.<document_type_key>` · `origin=emp_catalog` · (3) ET → `emp.et.<employment_type_key>` · `origin=emp_catalog` |
| **L-EMP-TOK-04 Trigger** | Active create/upsert → upsert token `status=active`; retire DOC/ET/extension → retire token (**BR-PLT-04**); issued print snapshots **immutable** (**BR-PLT-03**) |
| **L-EMP-TOK-05 Resolve order** | DATA §5.2: issued → registry → keyword_map → builtin → missing — **must_keep** empty-registry CTR fallback |
| **L-EMP-TOK-06 Position OUT** | **FORBIDDEN** invent tokens for XBOS `job_titles` / `departments` as EMP catalog register (**AC-PLT-EMP-01**) |
| **L-EMP-TOK-07 Seals** | **FORBIDDEN** reopen EMP-QC-01/02 · wipe DOC/ET · ATT/REC/DEC · CTR · LIST-TOTALS |
| **L-EMP-TOK-08 Honesty** | No personnel / e2e / PAY/ATT/REC ready flip · no Phase1 · `C-SLICE-≠-MODULE` |
| **L-EMP-TOK-09 Scope** | Token list/mutate/register = same `resolveHrmListScope` as F-PLT-TOK (**U19**) |
| **L-EMP-TOK-10 Paths** | Prefer reuse **F-PLT-TOK-***; ADD thin EMP list helper optional (peer F-ALLOW-CAT-05) |

---

## 5. Register matrix (BR-PLT-01 class — peer Allowance §5)

On **successful** EMP writer save (`status=active`, `archived_at IS NULL`):

| Trigger | `token_key` | `source_path` | `ring` | `domain` | `origin` | `label_vi` | `extension_field_ref` |
|---------|-------------|---------------|--------|----------|----------|------------|------------------------|
| EMP extension field (Settings) | `custom.emp.<code>` | `custom.emp.<code>` | `custom` | `EMP` | `extension_field` | field label vi-VN | extension item id/code |
| `emp_document_type` create/upsert | `emp.doc.<document_type_key>` | `emp.document_types.<key>` | `public` | `EMP` | `emp_catalog` | `name_vi` | optional `document_type_id` |
| `emp_employment_type` create/upsert | `emp.et.<employment_type_key>` | `emp.employment_types.<key>` | `public` | `EMP` | `emp_catalog` | `name_vi` | optional `employment_type_id` |

| Rule | Detail |
|------|--------|
| **Normalize** | Keys lower-case; ET hyphen→underscore before token suffix (peer F-EMP-CAT-ET) |
| **UQ** | `(company_id, lower(token_key)) WHERE archived_at IS NULL` — conflict → refresh same row (TOK-02 upsert) |
| **Retire** | DOC/ET/extension retire → token `status=retired` + `archived_at` — pickers hide; issued HĐ unchanged |
| **Coexistence** | Registry wins keyword_map same key (**VAL-PLT-TOK-01**) |
| **FORBIDDEN** | Hard-delete token · seed tokens for UF · register position/dept XBOS REF |

**Builtin must_keep (not closed ceiling):** `employee.full_name` etc. remain `MERGE_TOKEN_BUILTIN_DEFAULTS` — **not** replaced by this hook.

---

## 6. Physical DATA pointer (ba-data unlock — narrow)

> **Unlock:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01` — **EXPAND only** (no new EMP catalog table).  
> Platform DATA-01 already owns `hrm_merge_tokens`. Allowance peer already EXPAND origin `allowance_catalog`.

### 6.1 EXPAND `chk_hrm_merge_tok_origin`

| AS-IS (platform + allowance) | TO-BE ADD |
|------------------------------|-----------|
| `builtin` \| `keyword_map` \| `extension_field` \| `import` \| `allowance_catalog` | **+ `emp_catalog`** |

### 6.2 DOC note (register matrix)

Append DATA §3.4 / §7 register events: EMP DOC/ET + extension → matrix §5 this SA.

### 6.3 Explicitly **not** this DATA seat

| Item | Owner |
|------|-------|
| New `emp_*` catalog tables | **SEALED** EMP-DATA-01 — **cấm** reopen |
| Print PDF redesign / printable flag | CTR must_keep · **false** |
| QSĐ / DEC MergeToken | DEC L-DEC-CAT-11 GĐ2 OUT |
| Position tokens | XBOS REF — **OUT** |

**dev-be HOLD** until DATA-01 EXPAND CONFIRMED (or same-session BE if PM merges EXPAND into BE ensureSchema with DATA ack — preferred cascade = DATA then BE).

---

## 7. API_DESIGN F.1 — F-EMP-TOK-* (ADD · peer F-PLT-TOK / F-ALLOW-CAT)

### 7.1 F-EMP-TOK-01 — Register / refresh on EMP DOC upsert (side-effect)

| | |
|--|--|
| **METHOD / path** | *(no new public path required)* — side-effect inside **F-EMP-CAT-DOC-02** create/upsert/retire **same TX** · may call shared `MergeTokensService.upsert` (**F-PLT-TOK-02**) |
| **Mục đích** | Sau HR Lưu loại giấy tờ EMP hiệu lực, token `emp.doc.<key>` xuất hiện trong danh sách trộn HĐ/Settings (**BR-PLT-01** · **AC-PLT-EMP-TOK-01**) — F5 list có token. |
| **Nghiệp vụ xử lý** | (1) After DOC row persist active: upsert token per §5 matrix. (2) On retire: retire matching token. (3) Scope = DOC `company_id`. (4) Format fail → **do not** invent token; surface DOC error first. (5) Token upsert failure → **rollback TX** (peer Allowance). (6) **FORBIDDEN** hard-delete. |
| **Tham chiếu** | **BR-PLT-01** · **AC-PLT-CTR-05** class · EMP-QC-02 DOC seal · F-PLT-TOK-02 · Allowance §5 |
| **DTO↔DB** | Via F-PLT-TOK-02 map → `hrm_merge_tokens` |
| **Lỗi** | Same TOK + DOC taxonomy; scope 403/409 |
| **scope_parity** | Token company_id = DOC company_id |

---

### 7.2 F-EMP-TOK-02 — Register / refresh on EMP ET upsert (side-effect)

| | |
|--|--|
| **METHOD / path** | Side-effect inside **F-EMP-CAT-ET-02** create/upsert/retire **same TX** |
| **Mục đích** | Sau Lưu loại hình thuê, token `emp.et.<key>` có trên merge list (**AC-PLT-EMP-TOK-02**). |
| **Nghiệp vụ** | Mirror F-EMP-TOK-01 with ET matrix row; normalize `full-time`→`full_time` before suffix. |
| **Tham chiếu** | **BR-PLT-01** · AC-PLT-EMP-04 sealed consumer · F-PLT-TOK-02 |
| **scope_parity** | Same as ET writer |

---

### 7.3 F-EMP-TOK-03 — Register on EMP extension field save (side-effect)

| | |
|--|--|
| **METHOD / path** | Side-effect on Settings EMP extension-item save active → **F-PLT-TOK-02** upsert `custom.emp.<code>` · `origin=extension_field` |
| **Mục đích** | ADR V3 — thêm trường NS tùy chỉnh → token list refresh (**BR-PLT-01** classic shape from API-01). |
| **Nghiệp vụ** | (1) Validate code slug. (2) Upsert token matrix extension row. (3) Retire field → retire token. (4) If AS-IS extension producer not ready GĐ1 → **HOLD** this function behind feature flag / residual **R-EMP-TOK-EXT** — **DOC/ET hooks remain GĐ1 mandatory**. |
| **Tham chiếu** | API-01 BR-PLT-01 shape · ADR §7 EMP · L-EMP-CAT-11 |
| **Lỗi** | `HRM-PLT-CAT-CODE-INVALID` format-only |

---

### 7.4 F-EMP-TOK-04 — List EMP-domain tokens (optional thin · peer F-ALLOW-CAT-05)

| | |
|--|--|
| **METHOD / path** | **Prefer** `GET /api/hrm/merge-tokens?company_id=&domain=EMP` (**F-PLT-TOK-01**) · **optional ADD** `GET /api/hrm/employees/merge-tokens?company_id=` as alias filter `domain=EMP` + origins `extension_field|emp_catalog` |
| **Mục đích** | Admin HCNS kiểm tra token EMP trước phát hành HĐ (**AC-PLT-EMP-TOK-03**). |
| **Nghiệp vụ** | Delegate F-PLT-TOK-01 filters; empty `[]` = **200** honest (U65). |
| **Tham chiếu** | **AC-PLT-CTR-05** · F-ALLOW-CAT-05 |
| **scope_parity** | List = get-by-id F-PLT-TOK |

---

### 7.5 F-EMP-TOK-05 — Resolve bag EXPAND (EMP catalog labels)

| | |
|--|--|
| **METHOD / path** | **EXPAND** shared resolver used by **F-PLT-TOK-03** / CTR PREV — **no** new write |
| **Mục đích** | Preview/print bag có nhãn loại hình thuê / loại giấy tờ từ **effective** EMP catalogs — không hardcode CCCD/FULL_TIME. |
| **Nghiệp vụ** | (1) When resolving `emp.et.<key>` / `emp.doc.<key>`: value = `name_vi` from effective catalog (active or retired-for-history). (2) ADD bag aliases: `employee.employment_type_label` ← ET effective name for employee denorm key; optional `checklist.<key>.label`. (3) Missing catalog → soft warn / empty (default) — **not** invent label. (4) Registry wins keyword_map. (5) ring `cb` mask unchanged. |
| **Tham chiếu** | DATA §5.2 · F-PLT-TOK-03 · EMP effective F-EMP-CAT-EFF-* · NO-HARDCODE peer EMP-QC-02 |
| **FORBIDDEN** | FE computes label from closed enum |

---

## 8. Acceptance criteria (QA later — U65)

| ID | PASS when |
|----|-----------|
| **AC-PLT-EMP-TOK-01** | Settings DOC create open key → 2xx → F5 → `GET merge-tokens?domain=EMP` contains `emp.doc.<key>` · `origin=emp_catalog` · `status=active` |
| **AC-PLT-EMP-TOK-02** | ET create/normalize → token `emp.et.<key>` active; retire ET → token retired · picker hide; issued snapshot unchanged if any |
| **AC-PLT-EMP-TOK-03** | Resolve-preview / PREV shows `name_vi` for registered EMP catalog token when employee/context bound; unknown format → `HRM-PLT-CAT-CODE-INVALID` only |
| **AC-PLT-EMP-TOK-04** | Extension path (when live): save custom field → `custom.emp.<code>` · `origin=extension_field` on list F5 |
| **AC-PLT-EMP-TOK-05** | must_keep: position XBOS REF unchanged · contracts/SI load · soft-delete · EMP-QC seals not reopened · empty keyword_map fallback CTR still works |
| **Honesty** | Evidence keeps `hrm_personnel_uat_ready=false` · no module EMP UAT / Phase1 claim |

---

## 9. Client DOC-DELTA (ba-docs — ADD-only)

| Artifact | Delta |
|----------|-------|
| `API_DESIGN_HRM_ENTERPRISE.md` | APPEND F-EMP-TOK-01..05 pointer · cite F-PLT-TOK · **no wipe** F-CORE-EMP / F-PLT-TOK |
| `DB_DESIGN_HRM_ENTERPRISE.md` | Footer: origin CHK + `emp_catalog` · register matrix pointer |
| SRS | Optional CORE note: custom/catalog → merge list — **no** prompt-echo |

---

## 10. Rollout / unlock

```text
SA-01 (this) CONFIRMED
  → ba-data MERGE-TOKEN-EMP-DATA-01 (EXPAND origin emp_catalog + DOC matrix)
  → dev-be MERGE-TOKEN-EMP-BE-01 (side-effect DOC/ET + optional extension + resolver bag)
  → ba-docs DOC-DELTA (parallel OK)
  → QA L1 then browser U65 AC-PLT-EMP-TOK-* (zero-seed)
  → QC narrow GWC — DENY personnel UAT flip
```

| Wave | Owner | Exit |
|------|-------|------|
| **DATA** | ba-data | Origin CHK + matrix DOC CONFIRMED |
| **BE** | dev-be | Side-effect + jest VAL + scope_parity · READY_FOR_QA |
| **FE** | dev-fe | Only if Settings needs EMP token panel smoke — else reuse MergeTokenSettingsPanel |
| **QA/QC** | qa → qc | AC-PLT-EMP-TOK · honesty false |

**Rollback:** Disable side-effect flag; tokens additive soft-retired; CTR print still keyword_map fallback.

---

## 11. Residuals

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **R-EMP-TOK-EXT** | P2 | dev-be / fe | Extension-field producer wire if AS-IS incomplete — **not** blocking DOC/ET hook GĐ1 |
| **R-EMP-TOK-DOCS** | P3 | ba-docs | Client DOC-DELTA |
| **C-SLICE-≠-MODULE** | — | pm | Keep ready flags **false** |
| DEC Merge print | GĐ2 | — | OUT (DEC L-DEC-CAT-11) |

**Closed by this seat:** **L-EMP-CAT-11** · **R-PLT-EMP-04** (architecture CONFIRMED — execution pending DATA/BE).

---

## 12. Honesty locks

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| Module EMP UAT / Phase1 | **DENIED** |
| EMP-QC-01 / EMP-QC-02 | **SEAL RETAIN** — **cấm reopen** |

---

## 13. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | CONFIRMED Option **B** EMP MergeToken hook F.1: F-EMP-TOK-01..05 peer F-PLT-TOK + Allowance register-on-save; families `custom.emp.*` / `emp.doc.*` / `emp.et.*`; EXPAND origin `emp_catalog`; resolve bag labels from effective DOC/ET; unlock ba-data narrow EXPAND then BE; must_keep seals/XBOS position/contracts/SI/LIST-TOTALS/CTR; honesty false; no apps/**. |
| **next_owner** | **pm** → **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
