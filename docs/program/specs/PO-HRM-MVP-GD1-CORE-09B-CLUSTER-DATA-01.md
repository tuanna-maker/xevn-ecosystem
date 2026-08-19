# PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE pack_rules + templates + clauses + contracts (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-14 seat **#16**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD / RETAIN** LIVE `public.hrm_contract_pack_rules` + `hrm_contract_templates` + `hrm_contract_clauses` + `employee_contracts` (+ keyword/template_clauses) · **NO ADD** schema · **NO** mega-EAV · **NO** second preview-persist store · **NO** Nest `/core` table · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — physical pack-resolve + ephemeral preview columns **already LIVE** · preview field column gap **NOT proven** → **NOT unlock** |
| **uc_ids** | `UC-BP-CORE-09b` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-13 CORE-09a **SEALED** stamp **`CORE09AQC1-MSLA4LX9`** · peer QA `CORE09AQA-MSLA1C9L` |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md) · ba-data **HOLD default** · O1–O12 · AC-CORE-09B-* · VAL-CORE-PREV-* · **BR-CTR-CL-02/04** · **BR-CORE-PREV-*** |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — clause body SoT + `clauses_snapshot_json` freeze · **≠ printable DONE** |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link · **≠ pillar DONE** |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 · Nest `/core` DENY |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) §3.1–3.4 · [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.4a–c · lineage DATA-02 **RETAIN** |
| **ref_paper_api** | **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** **RETAIN cite** · must_keep **F-CORE-CTR-CL-01..04** · peers **F-CORE-CTR-VER/PDF/TPL** **OUT invent** as this WI DONE |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09b** · Diễn biến **#1–#5** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · AC-CTR-PRINT-01..03 · 06..08 |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-09a = printable DONE · **DENY** claim CORE-08 = CORE pillar DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Pack + preview SoT | **ONE** LIVE Nest spine on **`/api/hrm/contracts-insurance/contracts*`** — **RETAIN** · **DENY** Nest `/core` pack/preview table/controller SoT |
| Schema action this seat | **HOLD** — **no ADD** pack/preview schema · **no** mega-EAV · **no** second ephemeral-preview persist store · **no** invent VER as 09b |
| Tables RETAIN LIVE | `hrm_contract_pack_rules` · `hrm_contract_templates` (+ `keyword_map` · `layout_json`) · `hrm_contract_clauses` (CORE-09a must_keep) · `hrm_contract_template_clauses` · `employee_contracts` (+ pack/DRIVER expand cols) |
| Ephemeral preview | Response-only merge — **MUST NOT** INSERT `hrm_contract_print_versions` issued row (peer **09c**) |
| Print versions table | **RETAIN LIVE** for peer 09c — **DENY** treat as 09b preview persist SoT · **DENY** invent VER engine as CORE-09b DONE |
| Preview field column gap | **Conditional UNLOCK ONLY** if BA/QA proves missing physical column for preview display — **this seat: gap NOT proven** → **NOT unlock** |
| Nest path | Physical **`GET …/pack-resolve`** + **`POST …/contracts/:id/preview`** · paper `/api/hrm/core/…` = **alias only** |
| CORE-09a / 08 / 02 / 01 | **must_keep** clause body SoT + snapshot freeze · RD dual + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-09A/08/02/01 **PASS RETAIN** |
| Peers 09c / 09d | VER/PDF persist · TPL catalog invent DONE — **OUT invent** as this WI DONE |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-HRM-CORE-09A/08/02/01 · **NO** claim CORE-09a=printable · **NO** claim CORE-08=pillar · **NO** flip `contracts_printable_ready` |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_contract_pack_rule` | **`public.hrm_contract_pack_rules`** | **RETAIN** ONE SoT |
| Pack suggest | Read rules + employee job_family → `suggested_pack` / `allowed_packs[]` | **RETAIN** (API cite) |
| `hrm_contract_template` | **`public.hrm_contract_templates`** | **RETAIN** · open catalog ≠ 09d invent DONE |
| Merge tokens | `keyword_map` jsonb + registry cols | **RETAIN** |
| Clause attach | `apply_to_packs` + optional `hrm_contract_template_clauses` | **RETAIN** · body from CORE-09a |
| `hrm_contract` | **`public.employee_contracts`** | **RETAIN** registry SoT (UF-HRM-02) |
| Pack/DRIVER overlay | `pack_code` · `template_id` · `template_code` · `term_type` · `job_description_text` · probation · `license_class` · `driver_license_*` · `vehicle_plate` · `route_or_region` | **RETAIN LIVE** expand |
| Preview persist | — | **DENY** second store · ephemeral DTO only |
| Issued print | `hrm_contract_print_versions` | **RETAIN** peer 09c · **OUT invent** as 09b DONE |
| `/api/hrm/core/…/preview` | `/contracts-insurance/contracts*` | **Alias only** — API seat |
| Nest `/core` pack/preview table | — | **DENY invent** |
| Mega-EAV preview fields | — | **DENY ADD** |

```text
  hrm_contract_pack_rules (LIVE — RETAIN · HOLD no ADD)
        RETAIN: id · company_id · match_type (job_family|fallback) · match_value ·
                pack_code · priority · status · archived_at · audit · lineage*
        DENY:   second pack-rule SoT · dual-write rec_jd_pack_rule · Nest /core table
                │
                ▼ resolvePackForEmployee
  GET …/contracts/pack-resolve → suggested_pack · allowed_packs[] · reason

  hrm_contract_templates (LIVE — RETAIN)
        RETAIN: code · name_vi · pack_code · layout_json · keyword_map · status · version · archived_at · lineage*
        DENY:   invent open TPL catalog DONE as CORE-09b (peer 09d)

  hrm_contract_clauses (LIVE — CORE-09a SEALED must_keep)
        RETAIN: body_vi SoT · apply_to_packs · mandatory · status · version · snapshot freeze path
        DENY:   reopen rewrite · FE hardcode body · Nest /core clause table

  hrm_contract_template_clauses (LIVE — RETAIN attach)
        template_id · clause_id · sort_order

  employee_contracts (LIVE — registry must_keep + print overlay cols)
        RETAIN: registry spine + pack_code/template_*/term/job_description/probation/DRIVER cols
        DENY:   salary SoT on registry · dual registry table

  Preview (F-CORE-CTR-PREV-01) — EPHEMERAL
        Merge in memory → DTO sections/clauses/merged_fields/missing_*/can_issue/cb_masked
        DENY: INSERT issued hrm_contract_print_versions as 09b SoT (peer 09c)

  hrm_contract_print_versions (LIVE — peer 09c must_keep freeze)
        RETAIN for issue/PDF · DENY claim as 09b preview DONE · DENY invent VER as 09b

  CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public
        SEALED must_keep · Nest /core DENY

  FORBIDDEN GĐ1 this seat:
        ADD mega-EAV / second preview persist store / Nest @Controller('core') pack-prev table
        Invent 09c VER/PDF · 09d TPL as CORE-09b DONE
        Unlock schema without BA/QA proven column gap
        Claim CORE-09a=printable · CORE-08=pillar · contracts_printable_ready · reopen sealed J-*
```

**Label lock:** «Chọn gói nghề + xem trước HĐLĐ» = LIVE pack_rules resolve + ephemeral PREV merge — **not** print/PDF persist · **not** open TPL invent · **not** clause-library rewrite.  
**Spine lock:** Physical pack-resolve + preview on `/contracts-insurance/contracts*` — **DENY** Nest `/core` dual.  
**Ephemeral lock:** Preview **MUST NOT** INSERT issued print-version.  
**Gap lock:** Schema UNLOCK only with BA/QA proof of missing preview display column — **default HOLD**.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE (`contract-legal-print.service.ts` ensureSchema) | Gap (Wave-14 DATA) |
|--------|-------------------------------------------------------------|---------------------|
| **`public.hrm_contract_pack_rules`** | `id · company_id · match_type CHK(job_family\|fallback) · match_value · pack_code · priority · status CHK(active\|retired) · archived_at · created_at/updated_at` + lineage cols (DATA-02) · IX `(company_id, match_type, priority)` | **HOLD RETAIN** — **no ADD** |
| **`public.hrm_contract_templates`** | `id · company_id · code · name_vi · pack_code · layout_json · keyword_map · status CHK(draft\|active\|retired) · version · archived_at · audit` + lineage · UQ active code | **HOLD RETAIN** · 09d invent OUT |
| **`public.hrm_contract_clauses`** | CORE-09a SEALED cols (body_vi · apply_to_packs · mandatory · …) | **must_keep RETAIN** — **no reopen rewrite** |
| **`public.hrm_contract_template_clauses`** | `template_id · clause_id · company_id · sort_order` | **RETAIN** |
| **`public.employee_contracts` expand** | `pack_code · template_id · template_code · term_type · job_description_text · probation_days/end · license_class · driver_license_number · driver_license_issued_on · driver_license_issued_place · vehicle_plate · route_or_region · work_location* · signed_at · archived_at` | **HOLD RETAIN** — sufficient for Đ.21/DRIVER preview merge |
| **`public.hrm_contract_print_versions`** | LIVE (merged_fields_json · clauses_snapshot_json · status draft_preview\|issued\|superseded · …) | **RETAIN peer 09c** · **DENY** 09b persist SoT |
| Pack enum | CHK `GENERAL`\|`IT_OFFICE`\|`DRIVER`\|`LOGISTICS` | MVP AC = first 3 · LOGISTICS optional |
| Paper `/core/…` | **ABSENT** as Nest SoT | Alias only |
| Second preview persist / mega-EAV | **ABSENT** | **HOLD** — **NOT unlock** |
| Nest `/core` pack/preview table | **ABSENT** | **DENY invent** |
| Source | `resolvePackForEmployee` · `previewContract` · `mandatoryGate` · `cb_masked` · `@Controller('contracts-insurance')` | sa API RETAIN cite → FE residual |

**FORBIDDEN invent this seat:** Nest `/core` pack/preview SoT · second preview persist store · mega-EAV · VER invent as 09b · TPL invent DONE as 09b · claim CORE-09a=printable · claim CORE-08=pillar · flip `contracts_printable_ready` · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · `apps/**`.

---

## 4. Physical columns — LIVE cite (normative RETAIN)

### 4.1 `public.hrm_contract_pack_rules` (pack-resolve SoT)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| `id` | uuid PK | NO | Rule id | F-CORE-CTR-PACK-01 |
| `company_id` | text | NO | Legal entity / scope | U19 |
| **`match_type`** | text CHK | NO | `job_family` \| `fallback` | O2 |
| **`match_value`** | text | YES | Family tag; NULL when fallback | O2 |
| **`pack_code`** | text | NO | Target pack | O2 · PACK-INVALID |
| **`priority`** | int | NO | Lower wins | O2 |
| **`status`** | text CHK | NO | `active` \| `retired` | soft |
| **`archived_at`** | timestamptz | YES | Soft-delete | soft |
| audit / lineage* | … | | DATA-02 RETAIN | publish/pull ≠ new SoT |

**Invariant CORE-PREV-PACK-RULES-ONE:** Authoritative pack suggest rules = **`hrm_contract_pack_rules` only** — dual-write JD pack table / Nest `/core` = **FAIL O1**.

### 4.2 `public.hrm_contract_templates` (merge template)

| Cột | Kiểu | Null | Ý nghĩa | Maps |
|-----|------|------|---------|------|
| **`code`** · **`name_vi`** | text | NO | Template identity / VI label | O11 |
| **`pack_code`** | text | NO | Default pack | O2/O6 · TPL-PACK-MISMATCH |
| **`layout_json`** | jsonb | NO | Section chrome | PREV sections |
| **`keyword_map`** | jsonb | NO | `{{token}}` → source/ring | merge |
| **`status`** · **`version`** | text/int | NO | Only `active` + not archived for merge | TPL-NONE |
| **`archived_at`** | timestamptz | YES | Soft | |

**Invariant CORE-PREV-TPL-ACTIVE:** Preview merge uses `status='active' AND archived_at IS NULL` — 0 rows → **`HRM-CTR-TPL-NONE`** (O5) — **≠** invent 09d catalog DONE.

### 4.3 `public.hrm_contract_clauses` (+ template_clauses) — consume CORE-09a

| Cột / link | Role for 09b | Maps |
|------------|--------------|------|
| **`body_vi`** · **`title_vi`** · **`code`** | Preview clause text (no FE hardcode) | O9 · BR-CTR-CL-03 · AC-CORE-09B-08 |
| **`apply_to_packs`** · **`mandatory`** · **`sort_order`** · **`clause_group`** | Pack switch + mandatory gate | O5/O6 |
| `hrm_contract_template_clauses` | Optional attach order | RETAIN |
| **`clauses_snapshot_json`** (print_versions) | Issued freeze only — **not** ephemeral preview write | CORE-09a / peer 09c |

**Invariant CORE-PREV-CONSUME-09A:** Clause bodies from LIVE library (or later issued snapshot on 09c) — FE long legal SoT = **FAIL**.

### 4.4 `public.employee_contracts` — registry + preview field sources

| Cột (LIVE expand) | Ý nghĩa | Maps |
|-------------------|---------|------|
| Registry spine (`contract_code` · `contract_type` · `start_date`/`end_date` · `status` · position/dept/signer · `compensation_package_id` …) | UF-HRM-02 must_keep | O7 · AC-CTR-PRINT-08 |
| **`pack_code`** · **`template_id`** · **`template_code`** | Last/selected pack·template denorm | O2/O6 |
| **`term_type`** · **`job_description_text`** · probation_* | Đ.21 term/job | PREV merge |
| **`work_location`** · **`work_location_scope`** | Đ.21 location | PREV |
| **`license_class`** · **`driver_license_number`** · **`driver_license_issued_on`** · **`driver_license_issued_place`** · **`vehicle_plate`** · **`route_or_region`** | DRIVER pack fields | O6 · DRIVER-REQUIRED |
| C&B | Soft link packages — mask via ACL (`cb_masked`) | O4 · CORE-02 |

**Invariant CORE-PREV-REGISTRY:** Preview is **ADD overlay** — registry create/edit/F5 **must** remain PASS (O7).

### 4.5 Ephemeral preview — **no persist columns invent**

| Surface | Physical | Rule |
|---------|----------|------|
| Preview response | In-memory DTO: `pack_code` · `sections[]` · `merged_fields` · `clauses[]` · `missing_fields[]` · `missing_clauses[]` · `can_issue` · `cb_masked` | **RETAIN** API contract — **not** a new table |
| Issued print | `hrm_contract_print_versions` | Peer **09c only** — preview **MUST NOT** INSERT issued |

**Invariant CORE-PREV-EPHEMERAL:** Preview call → **0** new issued print-version row = **PASS O3** · insert = **FAIL O3/O8**.

### 4.6 Conditional schema UNLOCK — **HOLD (default NOT unlock)**

| Gate | Rule |
|------|------|
| Default | **HOLD** — **do not** ADD columns/tables for pack/preview |
| Unlock condition | BA **and** QA evidence that a **required** FR-09b / AC-CTR-PRINT preview display field has **no** LIVE physical column (explicit AC gap) |
| This seat | Gap **NOT proven** (BA ba-data HOLD · LIVE expand + templates/clauses/rules sufficient) → **NOT unlock** |
| If later unlocked | Separate work_item · ADD-only · must_keep ephemeral preview · **DENY** invent VER persist as unlock pretext |

**Invariant CORE-PREV-DATA-HOLD:** Claiming ADD schema **required** for CORE-09b without BA/QA column-gap proof = **FAIL**.

---

## 5. Validation & error expectations (data plane)

| VAL-ID | Condition | Expected | Fail |
|--------|-----------|----------|------|
| **VAL-CORE-PREV-DATA-01** | Pack rules SoT | Read/write only `hrm_contract_pack_rules` | Dual JD pack SoT / Nest `/core` table |
| **VAL-CORE-PREV-DATA-02** | Pack enum | `GENERAL`\|`IT_OFFICE`\|`DRIVER` (+ optional LOGISTICS) | Unknown → `HRM-CTR-PACK-INVALID` |
| **VAL-CORE-PREV-DATA-03** | Template for merge | Active non-archived template for pack | 0 → `HRM-CTR-TPL-NONE` |
| **VAL-CORE-PREV-DATA-04** | Pack↔template | Template `pack_code` match request | `HRM-CTR-TPL-PACK-MISMATCH` |
| **VAL-CORE-PREV-DATA-05** | Clause consume | Bodies from `hrm_contract_clauses` / attach | FE hardcode / second body store |
| **VAL-CORE-PREV-DATA-06** | DRIVER fields | LIVE license/plate cols when required | Invent EAV without unlock |
| **VAL-CORE-PREV-DATA-07** | Ephemeral | Preview → no issued VER INSERT | Persist as 09b |
| **VAL-CORE-PREV-DATA-08** | Registry | Overlay cols nullable; CRUD F5 OK | Break UF-HRM-02 |
| **VAL-CORE-PREV-DATA-09** | Scope U19 | pack-resolve = contract get = preview same family | Cross-CT |
| **VAL-CORE-PREV-DATA-10** | Nest `/core` | Zero pack/preview physical SoT | Dual invent |
| **VAL-CORE-PREV-DATA-11** | Schema HOLD | No ADD this seat | Unlock without gap proof |
| **VAL-CORE-PREV-DATA-12** | Honesty / peers | printable false · ≠09a printable · ≠08 pillar · 09c/09d OUT | Flip / invent DONE |

### Error taxonomy (RETAIN — no invent rewrite)

| Code | HTTP | Data meaning |
|------|------|--------------|
| `HRM-CTR-PACK-200` | 200 | Pack resolve OK |
| `HRM-CTR-PREV-200` | 200 | Ephemeral preview OK (may `can_issue=false`) |
| `HRM-CTR-TPL-NONE` | 4xx | 0 active template |
| `HRM-CTR-PACK-INVALID` | 400 | Bad / OOS pack |
| `HRM-CTR-TPL-PACK-MISMATCH` | 4xx | Template ≠ pack |
| `HRM-CTR-DRIVER-REQUIRED` | 400 | Missing DRIVER cols/values |
| `HRM-CTR-TERM-INVALID` | 400 | Bad term |
| `HRM-SCOPE-409` / `HRM-CTR-UNIT-SCOPE` | 409 | Scope |
| Sealed `HRM-CTR-CL-*` / `HRM-CORE-RD-*` / `HRM-CORE-CB-*` | — | **DENY** rewrite |

---

## 6. Scope parity (U19)

| Surface | Same resolver family |
|---------|----------------------|
| Pack resolve | `GET …/contracts/pack-resolve?employee_id=` |
| Contract get | `GET …/contracts/:id` |
| Preview | `POST …/contracts/:id/preview` |
| Registry list/mutate | `/contracts-insurance/contracts*` |

**Flag `scope_parity`:** pack-resolve / list returns id but get/preview 404 under group CEO `main` = **P0** — API/QA assert (not this DATA invent).

**J-* (DRAFT from BA):** `J-HRM-CORE-09B-01..04` — open+pack suggest · preview text · pack switch + C&B mask · mandatory + Nest `/core` 0 + seals.

---

## 7. Traceability (requirement → physical → API → FE → test)

| BR / AC | Physical | API (cite) | FE / J-* | Test expect |
|---------|----------|------------|----------|-------------|
| O1 · BR-CORE-PREV-PATH | contracts-insurance tables | F-CORE-CTR-PACK-01 · PREV-01 | J-09B-01/02 | No Nest `/core` dual |
| O2 · AC-CORE-09B-01 | `hrm_contract_pack_rules` | PACK-01 | J-09B-01 | suggested + allowed VI |
| O3 · AC-CORE-09B-02 · AC-CTR-PRINT-02 | templates + clauses + registry cols · **no VER write** | PREV-01 | J-09B-02 | Ephemeral · text layout |
| O4 · AC-CTR-PRINT-07 | packages soft + mask (no salary SoT on registry) | PREV-01 · CORE-02 | J-09B-03 | `cb_masked` |
| O5 · AC-CTR-PRINT-01/06 | mandatory clauses + Đ.21 cols | PREV-01 | J-09B-04 | `can_issue=false` + lists / TPL-NONE |
| O6 · AC-CTR-PRINT-03 | `apply_to_packs` + DRIVER cols | PREV-01 | J-09B-03 | IT↔DRIVER diff |
| O7 · AC-CTR-PRINT-08 | `employee_contracts` registry | CTR-01 | J-09B-04 | F5 CRUD PASS |
| O8 peers OUT | print_versions / TPL invent | VER/PDF/TPL | — | OUT invent DONE |
| O9 must_keep | CORE-09a/08/02/01 tables | sealed APIs | J-09B-04 smoke | ≠ printable · ≠ pillar |
| O10 honesty | — | — | evidence footer | printable false · C-SLICE |
| DATA HOLD | No ADD | — | — | Gap NOT proven |

---

## 8. must_keep & DENY

| Item | Rule |
|------|------|
| LIVE pack + preview spine | `hrm_contract_pack_rules` · templates · clauses · contracts · template_clauses |
| Ephemeral preview | **no** issued VER INSERT as 09b |
| CORE-09a | body SoT + snapshot freeze · stamp **`CORE09AQC1-MSLA4LX9`** · **≠** printable DONE · J-HRM-CORE-09A-01..04 RETAIN |
| CORE-08 | rewards* + discipline* + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE |
| CORE-02 | packages/eins · AuthZ-403 · CB-403 · stamp **`CORE02QC1-MSL80DU6`** |
| CORE-01 | public strip · stamp **`CORE01QC1-MSL6WMS7`** |
| Nest `/core` | **DENY** pack/preview SoT |
| Schema ADD / mega-EAV / second preview store | **HOLD** · default **NOT unlock** |
| 09c VER/PDF · 09d TPL | **OUT invent** as this WI DONE |
| Honesty | printable / recruitment / jd / CORE UAT **false** · C-SLICE |
| Seed / apps/** | **DENY** |
| Reopen sealed J-HRM-CORE-09A/08/02/01 | **DENY** without regression |

---

## 9. Data risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` pack/preview table | O1 DENY · API RETAIN physical path only |
| Preview writes issued VER «for convenience» | O3/O8 ephemeral lock · peer 09c |
| ADD EAV for DRIVER/Đ.21 without gap proof | §4.6 HOLD · LIVE cols already present |
| Claim CORE-09a GWC = printable | O9/O10 · honesty footer |
| Fold 09c/09d into 09b DONE | O8 OUT · peer seats |
| Break registry CRUD | O7 must_keep · AC-CTR-PRINT-08 |
| Dual-write JD pack rules as contract SoT | VAL-DATA-01 · ≠ `rec_jd_pack_rule` |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **next_owner** | **sa** — API-01 **HOLD/RETAIN cite** **F-CORE-CTR-PACK-01** + **F-CORE-CTR-PREV-01** (physical pack-resolve + ephemeral preview · Nest `/core` DENY) · unlock Dev-FE preview fidelity **only after** API cite RETAIN (or if FE residual alone proven) |
| **Dev** | **HOLD** — **no** invent schema · **no** Nest `/core` · **no** VER/PDF invent as 09b · FE residual only after contracts |
| **ba-data residual** | Schema ADD remains **HOLD** until BA/QA proves preview field column gap |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-data-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · peer CORE09AQC1-MSLA4LX9
spec_ref: F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 RETAIN · must_keep F-CORE-CTR-CL-01..04 · physical /contracts-insurance/contracts* pack-resolve+preview · paper /core alias only · ephemeral no VER INSERT · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08

MISSION — API F.1 HOLD/RETAIN cite (docs-only · HOLD invent):
1) RETAIN cite F-CORE-CTR-PACK-01 on LIVE GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id= — DENY Nest /core dual pack SoT
2) RETAIN cite F-CORE-CTR-PREV-01 on LIVE POST /api/hrm/contracts-insurance/contracts/:id/preview — ephemeral merge · sections/clauses/merged_fields/missing_*/can_issue/cb_masked — DENY INSERT issued print-version as 09b
3) Cite pack MVP GENERAL/IT_OFFICE/DRIVER · TPL-NONE · PACK-INVALID · TPL-PACK-MISMATCH · DRIVER-REQUIRED · display-ready VI · U19 scope_parity pack-resolve=get=preview
4) RETAIN CORE-09a CL body+snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY · registry CRUD must_keep
5) DENY invent 09c VER/PDF · 09d TPL as CORE-09b DONE · claim CORE-09a=printable · contracts_printable_ready · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/**
6) Unlock next: Dev-FE preview fidelity residual ONLY after API CONFIRMED RETAIN — not Dev invent schema/API/VER

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md · PASS_TO_PM · next Dev-FE residual or QA prep
```

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | ba-data **CONFIRMED HOLD** for UC-BP-CORE-09b: **RETAIN** LIVE `hrm_contract_pack_rules` + `hrm_contract_templates` (`keyword_map`/`layout_json`) + CORE-09a `hrm_contract_clauses` + `employee_contracts` pack/DRIVER expand cols · cite pack-resolve + **ephemeral** preview (no VER invent as 09b) · **no ADD** schema / mega-EAV / second preview-persist / Nest `/core` table · conditional UNLOCK **NOT** (preview column gap **not** proven) · must_keep CORE-09a body+snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · DENY invent 09c VER/PDF · 09d TPL as DONE · claim CORE-09a=printable · `contracts_printable_ready` · reopen sealed J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/** · C-SLICE. Unlock **sa API-01 HOLD/RETAIN cite F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01** — not Dev invent. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | API F.1 RETAIN cite · FE preview fidelity residual after API · schema ADD remains HOLD · journeys DRAFT until QA |