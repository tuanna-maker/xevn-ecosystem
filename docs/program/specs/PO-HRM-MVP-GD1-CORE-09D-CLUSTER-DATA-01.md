# PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE open TPL catalog + junction (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-16 seat **#18**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD / RETAIN** LIVE `public.hrm_contract_templates` + `public.hrm_contract_template_clauses` · **NO ADD** schema · **NO** mega-EAV · **NO** second TPL store · **NO** Nest `/core` table · **NO** wipe open catalog · **NO** reinstate `CHK code IN (8)` · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — physical open-catalog + matrix + junction columns **already LIVE** · TPL matrix/bind column gap **NOT proven** → **NOT unlock** |
| **uc_ids** | `UC-BP-CORE-09d` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-15 CORE-09c **SEALED** stamp **`CORE09CQC1-MSLBXMUT`** · must_keep Wave-14 **`CORE09BQC1-MSLB05DZ`** |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md) · ba-data **HOLD default** · O1–O12 · AC-CORE-09D-* · VAL-CORE-TPL-* · **BR-CTR-TPL-DYN-01..04** · **CORR-01** · **DYNAMIC-LOCK** |
| **ref_core09c_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — VER/PDF snapshot · **≠ printable UAT** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral · **≠ printable DONE** |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — clause body SoT + snapshot freeze |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link · **≠ pillar DONE** |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 · Nest `/core` DENY |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_corr** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **ref_paper_db** | [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) §3.4a templates · junction · [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.4a · lineage DATA-02 **RETAIN** |
| **ref_paper_api** | **F-CORE-CTR-TPL-01** · **F-CORE-CTR-TPL-02** (+ `PUT …/clauses`) · **F-CORE-CTR-CFG-01** **RETAIN cite** · must_keep **F-CORE-CTR-VER-01/02** · **F-CORE-CTR-PDF-01** · **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** ephemeral · **F-CORE-CTR-CL-01..04** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09d** · Diễn biến **#1–#11** · **AC-CTR-XEVN-01..11** · **AC-PLT-CTR-TPL-01..07+H** · **BR-CTR-TPL-DYN-01..04** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-09c VER/PDF = printable UAT · **DENY** invent printable DONE · **DENY** claim closed-8 TPL DONE |
| **OBS disposition** | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → **IN-SCOPE** · **RETAIN** junction `hrm_contract_template_clauses` as bind SoT · **DENY** seed · **DENY** invent closed-8 as fix · **DENY** claim OBS close = printable DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Open TPL catalog SoT | **ONE** LIVE Nest spine on **`/api/hrm/contracts-insurance/contract-templates*`** + table **`public.hrm_contract_templates`** — **RETAIN** · **DENY** Nest `/core` TPL table/controller SoT |
| Junction bind SoT | **`public.hrm_contract_template_clauses`** — **RETAIN** for OBS `clause_ids` bind · prefer over empty `layout_json.clause_ids` alone |
| Schema action this seat | **HOLD** — **no ADD** TPL schema · **no** mega-EAV · **no** second TPL store · **no** wipe open catalog · **no** reinstate `CHK code IN (8)` · **no** invent Nest `/core` physical |
| Tables / cols RETAIN LIVE | `hrm_contract_templates` (open `code` · `pack_code` · matrix/duration/`title_print_vi`/`matrix_family` · `status`) · `hrm_contract_template_clauses` (`template_id`·`clause_id`·`sort_order`) |
| Open catalog / CORR | Starter 8 `XEVN_*` = **examples only** · UQ `(company_id, lower(code))` WHERE not archived · **FORBIDDEN** closed enum ceiling |
| TPL matrix/bind column gap | **Conditional UNLOCK ONLY** if BA/QA proves missing physical column for matrix/bind — **this seat: gap NOT proven** → **NOT unlock** |
| Nest path | Physical **`GET/POST/PATCH …/contract-templates*`** · **`PUT …/:id/clauses`** · **`POST …/:id/activate`** · paper `/api/hrm/core/…` = **alias only** |
| CORE-09c / 09b / 09a / 08 / 02 / 01 | **must_keep** VER/PDF · PACK+PREV ephemeral · clause body SoT · RD dual + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE09CQC1-MSLBXMUT`** · **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-09C/09B/09A/08/02/01 **PASS RETAIN** |
| OBS | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** disposition = **RETAIN junction SoT** + FE/API fidelity residual — **DENY** seed |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 · **NO** claim CORE-09c=printable · **NO** claim closed-8 DONE · **NO** flip `contracts_printable_ready` |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_contract_template` / §3.4a | **`public.hrm_contract_templates`** | **RETAIN** ONE open-catalog SoT |
| Open catalog identity | `code` UQ per company (active/non-archived) | **RETAIN** · **≠** `CHK IN (8)` |
| Matrix / print defaults | `pack_code` · `default_term_type` · `default_duration_days` · `default_duration_months` · `title_print_vi` · `matrix_family` | **RETAIN** LIVE EXPAND |
| Lifecycle | `status` `draft`\|`active`\|`retired` · `version` · `archived_at` | **RETAIN** soft-retire |
| Layout / merge chrome | `layout_json` · `keyword_map` | **RETAIN** · **≠** clause-bind SoT alone |
| Clause attach | **`hrm_contract_template_clauses`** (`template_id`·`clause_id`·`sort_order`) | **RETAIN** OBS bind SoT |
| Lineage / publish | `origin` · `origin_company_id` · `origin_publish_version` · `lineage_code` | **RETAIN** DATA-02 · PUB/PULL ≠ body/catalog wipe |
| Second TPL table / mega-EAV | — | **DENY ADD** |
| Closed `CHK code IN (8)` | — | **DENY reinstate** (DYNAMIC-LOCK DROP already LIVE) |
| `/api/hrm/core/…/templates` | `/contracts-insurance/contract-templates*` | **Alias only** — API seat |
| Nest `/core` TPL table | — | **DENY invent** |
| VER/PDF = printable DONE | CORE-09c seal | **DENY claim** |

```text
  hrm_contract_templates (LIVE — RETAIN ONE open TPL SoT · HOLD no ADD)
        RETAIN: id · company_id · code · name_vi · pack_code ·
                layout_json · keyword_map ·
                status (draft|active|retired) · version · archived_at · audit ·
                default_term_type · default_duration_days · default_duration_months ·
                title_print_vi · matrix_family ·
                origin · origin_company_id · origin_publish_version · lineage_code
        UQ:     (company_id, lower(code)) WHERE archived_at IS NULL
        CHK:    status · term_type · duration_months ∈ {12,24,NULL} ·
                matrix_family ∈ {XEVN_MATRIX,LEGACY,NULL} ·
                pack_code ∈ {GENERAL,IT_OFFICE,DRIVER,LOGISTICS}
        IX:     (company_id, status) · (company_id, matrix_family) · XEVN_% code helper
        DENY:   CHK code IN (8) · second TPL store · Nest /core table · mega-EAV · wipe catalog
                │
                │ F-CORE-CTR-TPL-02 PUT …/clauses  (OBS bind)
                ▼
  hrm_contract_template_clauses (LIVE — RETAIN junction SoT)
        RETAIN: id · template_id · clause_id · company_id · sort_order · created_at
        UQ:     (template_id, clause_id)
        IX:     (template_id, sort_order)
        DENY:   seed junction for U65 · invent closed-8 as OBS “fix” ·
                bind-only empty layout_json without junction when library has active clauses
                │
                │ consume must_keep
                ▼
  CORE-09a hrm_contract_clauses.body_vi (body SoT)
  CORE-09b PREV ephemeral + pack_rules (DENY PREV→INSERT VER)
  CORE-09c print_versions + PDF-from-snapshot (≠ printable UAT)
  CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public
        SEALED must_keep · Nest /core DENY

  FORBIDDEN GĐ1 this seat:
        ADD schema / mega-EAV / second TPL store / Nest @Controller('core') TPL table
        Wipe LIVE open catalog · reinstate CHK code IN (8)
        Unlock schema without BA/QA proven TPL matrix/bind column gap
        Claim CORE-09c=printable · closed-8 DONE · contracts_printable_ready · reopen sealed J-*
```

**Label lock:** «Catalog mẫu HĐ mở + bind điều khoản» = LIVE open `hrm_contract_templates` + junction `hrm_contract_template_clauses` — **not** closed-8 enum · **not** printable module UAT · **not** VER/PDF reopen · **not** PREV→INSERT.  
**Spine lock:** Physical TPL on `/contracts-insurance/contract-templates*` — **DENY** Nest `/core` dual.  
**CORR lock:** Starter 8 = examples — **DENY** reinstate `CHK code IN (8)`.  
**OBS lock:** Empty IT/DRIVER clause_ids → **RETAIN junction SoT** + fidelity residual — **DENY** seed.  
**Gap lock:** Schema UNLOCK only with BA/QA proof of missing TPL matrix/bind column — **default HOLD**.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE (`contract-legal-print.service.ts` ensureSchema) | Gap (Wave-16 DATA) |
|--------|-------------------------------------------------------------|---------------------|
| **`public.hrm_contract_templates`** | CREATE: `id · company_id · code · name_vi · pack_code · layout_json · keyword_map · status CHK(draft\|active\|retired) · version · archived_at · audit` · UQ `(company_id, lower(code)) WHERE archived_at IS NULL` · IX `(company_id, status)` · **ADD** `default_term_type · default_duration_days · default_duration_months · title_print_vi · matrix_family` · lineage cols · **DROP** `chk_hrm_ctr_tpl_xevn_code` (closed-8) · CHK term/duration/matrix_family/pack_allowed | **HOLD RETAIN** — **no ADD** |
| **`public.hrm_contract_template_clauses`** | CREATE: `id · template_id · clause_id · company_id · sort_order · created_at` · UQ `(template_id, clause_id)` · IX `(template_id, sort_order)` | **HOLD RETAIN** — OBS bind SoT |
| Open catalog behavior | `listTemplates` / `createTemplate` / `updateTemplate` / `activate` — CREATE 9+ accepted · `CODE-INVALID` format-only · `matrix=xevn` filters **`matrix_family`** (not `code IN 8`) · soft warn starters ≠ block | **RETAIN** (API cite) |
| Clause bind | `replaceTemplateClauses` → rewrite junction rows · DTO `clause_ids[]` | **RETAIN** + fidelity residual |
| Starter 8 | constants helpers `XEVN_*` — examples · **≠** ceiling | **RETAIN CORR** |
| CORE-09a clauses | body SoT consumed via junction / pack attach | **must_keep** |
| CORE-09b PREV | Ephemeral DTO consumes active TPL + junction | **must_keep** |
| CORE-09c VER/PDF | Freezes `template_code` on issued · **≠** printable UAT | **must_keep** |
| Paper `/core/…` | **ABSENT** as Nest SoT | Alias only |
| Second TPL store / mega-EAV / Nest `/core` TPL | **ABSENT** | **HOLD** — **NOT unlock** / **DENY invent** |
| Source | `listTemplates` · `createTemplate` · `updateTemplate` · `replaceTemplateClauses` · `@Controller('contracts-insurance')` | sa API RETAIN cite → FE Settings/picker + clause bind |

**FORBIDDEN invent this seat:** Nest `/core` TPL SoT · second TPL store · mega-EAV · wipe open catalog · reinstate `CHK code IN (8)` · claim CORE-09c=printable · claim closed-8 DONE · invent printable DONE · flip `contracts_printable_ready` · reopen J-HRM-CORE-09C/09B/09A/08/02/01 · seed · honesty flip · `apps/**`.

---

## 4. Physical columns — LIVE cite (normative RETAIN)

### 4.1 `public.hrm_contract_templates` (ONE open catalog SoT)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| `id` | uuid PK | NO | Template id | F-CORE-CTR-TPL-01/02 · U19 |
| `company_id` | text | NO | Legal entity / scope | U19 · scope_parity |
| **`code`** | text | NO | Open catalog identity (UQ active) · starter `XEVN_*` **may** appear · **≠** closed-8 | O2/O3 · AC-CTR-XEVN-01/11 · CORR-01 |
| **`name_vi`** | text | NO | Settings / picker label VI | O11 |
| **`pack_code`** | text | NO | Default pack neo (`GENERAL`/`IT_OFFICE`/`DRIVER`/`LOGISTICS`) | O4 · PACK-MISMATCH · DYN-04 |
| **`layout_json`** | jsonb | NO | Section chrome — **≠** authoritative clause bind alone | PREV sections |
| **`keyword_map`** | jsonb | NO | `{{token}}` → source/ring | merge |
| **`status`** | text CHK | NO | `draft` \| `active` \| `retired` | O2 picker = active · soft-retire |
| **`version`** | int | NO | Template version | activate bump / freeze peer |
| **`archived_at`** | timestamptz | YES | Soft-delete | BR-PLT-04 · TPL-05 |
| audit | created_at/updated_at/by | | Audit | — |
| **`default_term_type`** | text CHK | YES | `probation` \| `definite` \| `indefinite` | O4 · AC-CTR-XEVN-04/06 |
| **`default_duration_days`** | int | YES | Probation / short-term defaults | O4 |
| **`default_duration_months`** | int CHK | YES | `12` \| `24` \| NULL | O4 · AC-CTR-XEVN-05 |
| **`title_print_vi`** | text | YES | Print title default (required when activating `XEVN_MATRIX`) | O4 · O11 |
| **`matrix_family`** | text CHK | YES | `XEVN_MATRIX` \| `LEGACY` \| NULL · `matrix=xevn` filter | O2 · CORR · **≠** code IN 8 |
| lineage* | origin · origin_company_id · origin_publish_version · lineage_code | | DATA-02 RETAIN | PUB/PULL ≠ wipe |

**Constraints / indexes (LIVE):**

| Object | Definition | Maps |
|--------|------------|------|
| **UQ** | `(company_id, lower(code)) WHERE archived_at IS NULL` | O3 UQ · KEY class when invent attach |
| **CHK status** | `draft` \| `active` \| `retired` | lifecycle |
| **CHK term** | `default_term_type` NULL or ∈ probation/definite/indefinite | O4 |
| **CHK duration** | `default_duration_months` NULL or ∈ {12,24} | O4 |
| **CHK matrix_family** | NULL or ∈ {`XEVN_MATRIX`,`LEGACY`} | O2 filter |
| **CHK pack** | `pack_code` ∈ GENERAL/IT_OFFICE/DRIVER/LOGISTICS | DYN-04 |
| **DROP** | `chk_hrm_ctr_tpl_xevn_code` (closed-8) · prefix pack gate | **CORR/DYNAMIC-LOCK must_keep** |
| **IX** | `(company_id, status)` · `(company_id, matrix_family)` · helper `XEVN_%` | list / matrix |

**Invariant CORE-TPL-ONE:** Authoritative open catalog SoT = **`hrm_contract_templates` only** — second TPL table / Nest `/core` = **FAIL O1**.

**Invariant CORE-TPL-OPEN:** `CHK code IN (8)` / API·FE reject 9th as «not in starter 8» = **FAIL O2/O3**.

**Invariant CORE-TPL-MATRIX:** `matrix=xevn` **MUST** filter `matrix_family` — filter as `code IN (8)` = **FAIL O2**.

**Invariant CORE-TPL-CODE:** `HRM-CTR-TPL-CODE-INVALID` for «not in starter 8» (not format) = **FAIL O3**.

### 4.2 `public.hrm_contract_template_clauses` (OBS bind SoT)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| `id` | uuid PK | NO | Junction row | PUT clauses |
| **`template_id`** | uuid | NO | Soft FK → templates.id | O5 · VAL-CORE-TPL-10 |
| **`clause_id`** | uuid | NO | Soft FK → `hrm_contract_clauses.id` (CORE-09a) | O5 · CL-404 |
| `company_id` | text | NO | Scope | U19 |
| **`sort_order`** | int | NO | Preview / snapshot order | O5 · PREV consume |
| `created_at` | timestamptz | NO | Audit | — |

**Constraints / indexes (LIVE):**

| Object | Definition | Maps |
|--------|------------|------|
| **UQ** | `(template_id, clause_id)` | no duplicate bind |
| **IX** | `(template_id, sort_order)` | ordered PREV clauses |

**Invariant CORE-TPL-OBS-JUNCTION:** When library has **active** clauses, Settings bind path **MUST** write junction so IT_OFFICE vs DRIVER preview `clauses[]` are **non-empty and distinct** — empty both after bind = **FAIL O5** · AC-CORE-09D-07.  
**Invariant CORE-TPL-OBS-NO-SEED:** Seed / DB fake junction to pass U65 = **FAIL** U65 · EX-CORE-09D-09.  
**Invariant CORE-TPL-OBS-≠-PRINTABLE:** Closing OBS ≠ flip `contracts_printable_ready` ≠ claim CORE-09c printable = **FAIL O9/O10**.

### 4.3 Consume peers (must_keep — no reopen rewrite)

| Peer | Physical | Role for 09d |
|------|----------|--------------|
| **CORE-09c** | `hrm_contract_print_versions` + PDF | Freeze `template_code` · **≠ printable UAT** · stamp **`CORE09CQC1-MSLBXMUT`** |
| **CORE-09b** | pack_rules + ephemeral PREV | Consume TPL+junction · **≠** PREV→INSERT · stamp **`CORE09BQC1-MSLB05DZ`** |
| **CORE-09a** | `hrm_contract_clauses.body_vi` | Clause body SoT for bind/PREV · stamp **`CORE09AQC1-MSLA4LX9`** |
| **CORE-08** | rewards/discipline + payroll_link | **≠** TPL SoT · stamp **`CORE08QC1-MSL9BFFE`** |
| **CORE-02** | packages/eins · AuthZ/CB-403 | Comp mask on PREV/VER · stamp **`CORE02QC1-MSL80DU6`** |
| **CORE-01** | public employees strip | Nest `/core` DENY · stamp **`CORE01QC1-MSL6WMS7`** |

### 4.4 Conditional UNLOCK gate (default = NOT)

| Condition | Unlock schema? | This seat |
|-----------|----------------|-----------|
| BA/QA proves missing physical column needed for open catalog / matrix / junction bind (named field + AC fail) | **YES** — narrow ADD only | **NOT proven** |
| FE UX / wire / display-ready / OBS bind fidelity residual only | **NO** — sa API RETAIN + Dev-FE | Default path |
| Desire for mega-EAV / second TPL / Nest `/core` / wipe / reinstate closed-8 | **NO** — **DENY** | Absolute |

**Verdict:** TPL matrix/bind column gap **NOT proven** → **HOLD / NOT unlock**.

BA/SA §1.1 ba-data disposition + SA §8 ladder: tables LIVE (`hrm_contract_templates` + `hrm_contract_template_clauses` + XEVN matrix cols) — **no ADD** this seat.

---

## 5. Validation matrix (physical)

| VAL-ID | Condition | Rule | Expected |
|--------|-----------|------|----------|
| **VAL-CORE-TPL-DATA-01** | Open catalog SoT | Read/write only `hrm_contract_templates` | Dual Nest `/core` / second store = **FAIL** |
| **VAL-CORE-TPL-DATA-02** | Code UQ | Active code unique per company | Duplicate → KEY/UQ class |
| **VAL-CORE-TPL-DATA-03** | No closed-8 CHK | Constraint `chk_hrm_ctr_tpl_xevn_code` **ABSENT** | Reinstate = **FAIL O2** |
| **VAL-CORE-TPL-DATA-04** | Matrix cols LIVE | `pack_code` · duration · `title_print_vi` · `matrix_family` · `default_term_type` present | Invent EAV without unlock = **FAIL** |
| **VAL-CORE-TPL-DATA-05** | `matrix=xevn` | Filter `matrix_family` | Filter `code IN 8` = **FAIL** |
| **VAL-CORE-TPL-DATA-06** | Create 9+ | INSERT custom code allowed by schema | Schema reject 9th = **FAIL O3** |
| **VAL-CORE-TPL-DATA-07** | Junction SoT | `PUT …/clauses` writes `hrm_contract_template_clauses` | Bind only empty layout without junction = **FAIL VAL-10** |
| **VAL-CORE-TPL-DATA-08** | OBS bind | IT↔DRIVER junctions distinct when library active | Both empty after bind = **FAIL O5** |
| **VAL-CORE-TPL-DATA-09** | Soft-retire | `archived_at` / `status=retired` · hide from default picker | Hard DELETE history = **FAIL** |
| **VAL-CORE-TPL-DATA-10** | Scope U19 | list=get=create=put-clauses same family | Cross-CT = **FAIL** |
| **VAL-CORE-TPL-DATA-11** | Nest `/core` | Zero TPL physical SoT | Dual invent = **FAIL O1** |
| **VAL-CORE-TPL-DATA-12** | Peer seals | CORE-09c/09b/09a/08/02/01 RETAIN | Reopen rewrite = **FAIL** |
| **VAL-CORE-TPL-DATA-13** | Honesty | printable/closed-8 DONE claims forbidden | Flip / claim = **FAIL O9/O10** |
| **VAL-CORE-TPL-DATA-14** | No seed | FE-only OBS bind | Seed junction = **FAIL U65** |

---

## 6. Traceability (requirement → DB → API → FE → test)

| SRS / BR | DB | API (paper) | FE / J-* | Test expect |
|----------|----|-------------|----------|-------------|
| FR-09d #1 · AC-CTR-XEVN-01 · O1/O2 | `hrm_contract_templates` open list | **F-CORE-CTR-TPL-01** | **J-HRM-CORE-09D-01** · **J-HRM-CTR-04** | GET 200 · not locked to 8 |
| FR-09d #8 · AC-CTR-XEVN-11 · O3/O6 | INSERT template row | **F-CORE-CTR-TPL-02** | **J-HRM-CORE-09D-02** · **J-HRM-CTR-07** | POST 201 · F5 · picker |
| O4 matrix | `pack_code` · duration · `title_print_vi` · `matrix_family` · term | TPL-01/02 | J-09D-01 / CTR-04..06 | OFFICE≠DRIVER · 12≠24 · INDEF |
| O5 OBS | `hrm_contract_template_clauses` | **PUT …/clauses** (TPL-02 bind) | **J-HRM-CORE-09D-03** | IT↔DRIVER clauses non-empty+distinct |
| O7 registry | `employee_contracts` nullable template | CTR registry | **J-HRM-CORE-09D-04** | CRUD F5 without TPL |
| O8/O9 must_keep 09c | print_versions freeze `template_code` | VER/PDF RETAIN | J-09D-04 / sealed J-09C | ≠ printable UAT claim |
| O8 must_keep 09b | ephemeral PREV | PREV-01 | sealed J-09B | `ver_insert=0` |
| O8 must_keep 09a | `hrm_contract_clauses` | CL-01..04 | sealed J-09A | body SoT |
| O1 Nest deny | no `/core` TPL table | physical contracts-insurance | Network | Nest `/core` 0 |
| CORR-01 / DYNAMIC-LOCK | no CHK IN(8) | CODE-INVALID format-only | J-09D-02 | CREATE 9+ PASS |

**scope_parity:** template list **=** get-by-id **=** create/activate **=** put-clauses **=** picker/PREV consume — same contracts-insurance / `resolveHrmListScope` family as pack-resolve + preview + print-versions (U19).

---

## 7. Error / integrity mapping (RETAIN — no invent rewrite)

| Physical fail | HTTP / code | Data outcome |
|---------------|-------------|--------------|
| Bad slug/format code | 400 `HRM-CTR-TPL-CODE-INVALID` | **no** INSERT · **≠** «not in 8» |
| Invent attach when EFF>0 | 4xx `HRM-CTR-TPL-KEY` | **≠** 404 · **≠** TPL-NONE |
| 0 active templates | 4xx `HRM-CTR-TPL-NONE` | empty picker / CTA · **no** fake PREV |
| Pack ∉ configured | 4xx `HRM-CTR-TPL-PACK-MISMATCH` | **no** bad pack row |
| Template not in scope | 404 `HRM-CTR-TPL-404` | **no** leak |
| clause_id missing / out of scope | 404 `HRM-CTR-CL-404` | junction not written for bad id |
| Scope mismatch | 409 `HRM-SCOPE-409` | **no** cross-CT |
| Success create | 201 `HRM-CTR-TPL-201` | open catalog row |
| Success list/get/patch/put-clauses | 200 `HRM-CTR-TPL-200` | display-ready + `clause_ids[]` |
| Soft archive / retire | — | hidden from default picker · history OK |

---

## 8. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| ADD schema / mega-EAV / second TPL store | HOLD default · gap not proven |
| Wipe LIVE open `hrm_contract_templates` | must_keep AS-IS SoT |
| Reinstate `CHK code IN (8)` / closed enum / reject 9th | CORR-01 · DYNAMIC-LOCK · O2/O3 |
| Nest `/core` TPL table or `@Controller('core')` SoT | O1 dual-SoT FAIL |
| Claim CORE-09c VER/PDF = printable UAT | O9/O10 · stamp `CORE09CQC1-MSLBXMUT` |
| Invent printable DONE / claim closed-8 TPL DONE | O2/O10 |
| Flip `contracts_printable_ready` / recruitment / jd / module UAT | honesty lock |
| Reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 without regression | seals |
| Seed junction / templates for U65 | U65 · OBS disposition |
| `apps/**` / honesty flip | docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`CORE09CQC1-MSLBXMUT`** | VER/PDF · Nest `/core` 0 · **≠ printable UAT** |
| **`CORE09BQC1-MSLB05DZ`** | PACK+PREV ephemeral · printable false · OBS **IN-SCOPE here** |
| **`CORE09AQC1-MSLA4LX9`** | CL library body SoT + snapshot freeze |
| **`CORE08QC1-MSL9BFFE`** | RD dual + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages/eins · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE TPL | `GET/POST/PATCH …/contract-templates*` · `PUT …/clauses` · activate · open catalog cols §4.1–§4.2 |
| CORR-01 / DYNAMIC-LOCK | starter examples · CODE-INVALID format-only · no closed-8 CHK |
| Soft-delete · U19 scope_parity · registry CRUD nullable template | doctrine |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip from this DATA seat |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ printable ready |
| Claim CORE-09c VER/PDF = printable | **DENIED** |
| Claim closed-8 TPL DONE | **DENIED** |
| Invent printable DONE | **DENIED** |

**OBS disposition:** `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → **RETAIN** `hrm_contract_template_clauses` as bind SoT · close via AC-CORE-09D-07 / J-09D-03 after FE fidelity · **DENY** seed · **≠** printable DONE.

---

## 9. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev reinstates closed-8 CHK / reject 9th | VAL-CORE-TPL-DATA-03/06 · CORR lock · O2/O3 FAIL |
| Dual Nest `/core` TPL path | O1 FAIL · Network Nest `/core` 0 |
| OBS “fixed” by seed | VAL-14 · U65 · EX-09 |
| Bind only in `layout_json` without junction | VAL-07 · prefer junction SoT |
| Schema unlock without gap proof | §4.4 HOLD default |
| Claim CORE-09c printable / closed-8 DONE from DATA | §8 LOCKED false |
| Reopen VER/PDF or PREV→INSERT as TPL work | must_keep stamps CORE09C/CORE09B |

---

## 10. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01`** | **sa** | **HOLD/RETAIN cite** **F-CORE-CTR-TPL-01** · **F-CORE-CTR-TPL-02** (+ `PUT …/clauses` · activate) · **F-CORE-CTR-CFG-01** on physical `/contracts-insurance/*` · F.1 mục đích + bước SRS · DTO↔DB cols from DATA-01 · **DENY** Nest `/core` dual · **DENY** invent endpoints/schema · must_keep VER/PDF · PREV ephemeral · CL · unlock Dev-FE Settings/picker + clause bind fidelity **only after** API RETAIN — **not** Dev invent |
| Dev-BE | **HOLD** | Unless API residual wire gap proven after API-01 |
| Dev-FE | After API RETAIN | Settings 9+ · picker open catalog · OBS junction bind U65 residual only |
| QA / QC | After FE | J-HRM-CORE-09D-01..04 · J-HRM-CTR-04/07 · C-SLICE · honesty false |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Physical DATA **CONFIRMED HOLD** for UC-BP-CORE-09d: **RETAIN** LIVE `public.hrm_contract_templates` (cite open `code` · `pack_code` · `default_term_type` · `default_duration_days`/`default_duration_months` · `title_print_vi` · `matrix_family` · `status` draft/active/retired · `layout_json`/`keyword_map` · soft `archived_at` · lineage · **no** `CHK code IN (8)`) + **`public.hrm_contract_template_clauses`** (`template_id`·`clause_id`·`sort_order` junction SoT for OBS); **NO ADD** schema / mega-EAV / second TPL store / Nest `/core` table / wipe open catalog / reinstate closed-8; conditional UNLOCK **NOT** (TPL matrix/bind column gap not proven); **must_keep** CORE-09c VER/PDF (**≠ printable UAT**) · CORE-09b PACK+PREV ephemeral · CORE-09a CL+snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · CORR-01/DYNAMIC-LOCK; OBS **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** disposition **RETAIN junction** (no seed); **DENY** closed enum · claim CORE-09c=printable · invent printable DONE · claim closed-8 TPL DONE · `contracts_printable_ready` · reopen J-HRM-CORE-09C/09B/09A/08/02/01 · seed · honesty · apps/**; unlock **sa API-01** RETAIN cite F-CORE-CTR-TPL-01/02 (+ CFG-01) — **not** Dev invent. |
| **next_owner** | **sa** |
| **next_dispatch_prompt** | see §12 |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-data-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09d
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · peer CORE09CQC1-MSLBXMUT · must_keep CORE09BQC1-MSLB05DZ
spec_ref: F-CORE-CTR-TPL-01 · F-CORE-CTR-TPL-02 (+ PUT …/clauses · activate) · F-CORE-CTR-CFG-01 RETAIN cite · must_keep F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 · F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · physical /contracts-insurance/* · paper /core alias only · CORR-01/DYNAMIC-LOCK · OBS junction RETAIN

MISSION — API F.1 lock (docs-only · HOLD/RETAIN):
1) RETAIN cite LIVE GET/POST/PATCH …/contract-templates* + GET …/:id + POST …/activate + PUT …/:id/clauses — F.1 mỗi fn: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-09d Diễn biến #) · DTO↔DB cols from DATA-01 · lỗi HRM-CTR-TPL-* (CODE-INVALID format-only · KEY · NONE · PACK-MISMATCH · 404) · CL-404
2) LOCK: open catalog · Settings 9+ · matrix=xevn=matrix_family only · junction clause_ids bind SoT · U19 scope_parity list=get=create=put-clauses · CORR starter≠ceiling
3) DENY Nest /core dual TPL SoT · DENY invent new endpoints/schema · DENY reinstate closed-8 · DENY claim CORE-09c VER/PDF = printable UAT · DENY invent printable DONE · DENY claim closed-8 TPL DONE
4) RETAIN must_keep CORE-09c/09b/09a/08/02/01 seals · OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY disposition via PUT clauses (no seed)
5) Honesty: contracts_printable_ready=false · C-SLICE · no apps/** · no seed
6) Unlock next: Dev-FE Settings/picker + clause bind fidelity residual ONLY — Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md · PASS_TO_PM
```

---

*End DATA-01 · Wave-16 CORE-09d · ba-data HOLD · 2026-08-09*
