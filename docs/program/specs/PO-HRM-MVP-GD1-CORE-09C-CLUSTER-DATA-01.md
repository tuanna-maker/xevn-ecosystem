# PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE print_versions + denorm (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-15 seat **#17**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD / RETAIN** LIVE `public.hrm_contract_print_versions` + denorm pack/template on `employee_contracts` · **NO ADD** schema · **NO** mega-EAV · **NO** second VER store · **NO** Nest `/core` table · **NO** wipe print_versions · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — physical issued VER snapshot columns **already LIVE** · VER/PDF field column gap **NOT proven** → **NOT unlock** |
| **uc_ids** | `UC-BP-CORE-09c` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-14 CORE-09b **SEALED** stamp **`CORE09BQC1-MSLB05DZ`** · peer QA `CORE09BQA-MSLAWKV6` |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md) · ba-data **HOLD default** · O1–O12 · AC-CORE-09C-* · VAL-CORE-VER-* · **BR-CTR-CL-01/02/04** · **BR-CORE-VER-*** |
| **ref_core09b_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — PACK+PREV ephemeral · **≠ printable DONE** |
| **ref_core09a_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — clause body SoT + `clauses_snapshot_json` freeze |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link · **≠ pillar DONE** |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 · Nest `/core` DENY |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) **§3.3** print_versions · §2.1/§3.4 expand · [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.4c · lineage DATA-02 **RETAIN** |
| **ref_paper_api** | **F-CORE-CTR-VER-01** · **F-CORE-CTR-VER-02** · **F-CORE-CTR-PDF-01** **RETAIN cite** · must_keep **F-CORE-CTR-PACK-01** + **F-CORE-CTR-PREV-01** ephemeral · must_keep **F-CORE-CTR-CL-01..04** · peers **F-CORE-CTR-TPL** **OUT invent DONE** as 09d |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09c** · Diễn biến **#1–#5** · **BR-CTR-CL-01** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · AC-CTR-PRINT-01/04/05/06/08 |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-09b = printable DONE · **DENY** invent 09d TPL as this WI DONE |
| **Carry OBS** | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → peer **UC-BP-CORE-09d** (idle-ok this seat — **not** invent TPL DONE here) |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Issued VER + PDF SoT | **ONE** LIVE Nest spine on **`/api/hrm/contracts-insurance/*`** + table **`public.hrm_contract_print_versions`** — **RETAIN** · **DENY** Nest `/core` VER/PDF table/controller SoT |
| Schema action this seat | **HOLD** — **no ADD** VER/PDF schema · **no** mega-EAV · **no** second VER store · **no** wipe LIVE print_versions · **no** invent Nest `/core` physical |
| Tables / cols RETAIN LIVE | `hrm_contract_print_versions` (snapshot + status issued/superseded) · denorm `pack_code`/`template_*` on `employee_contracts` |
| Snapshot freeze | **`merged_fields_json`** + **`clauses_snapshot_json`** (+ **`compensation_snapshot_json`** when ACL) immutable when `status=issued` — PDF **from snapshot only** |
| PREV / PACK | CORE-09b **must_keep ephemeral** — **DENY** reopen rewrite PREV→INSERT VER as schema SoT |
| VER/PDF field column gap | **Conditional UNLOCK ONLY** if BA/QA proves missing physical column for issued snapshot / PDF — **this seat: gap NOT proven** → **NOT unlock** |
| Nest path | Physical **`POST/GET …/print-versions*`** + **`GET …/print-versions/:versionId/pdf`** · paper `/api/hrm/core/…` = **alias only** |
| CORE-09b / 09a / 08 / 02 / 01 | **must_keep** PACK+PREV ephemeral · clause body SoT + snapshot · RD dual + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-09B/09A/08/02/01 **PASS RETAIN** |
| Peer 09d | TPL catalog invent DONE + OBS clause-empty — **OUT invent** as this WI DONE · carry **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-HRM-CORE-09B/09A/08/02/01 · **NO** claim CORE-09b=printable · **NO** flip `contracts_printable_ready` |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_contract_print_version` / §3.4c | **`public.hrm_contract_print_versions`** | **RETAIN** ONE SoT |
| Issued snapshot | `merged_fields_json` · `clauses_snapshot_json` · `compensation_snapshot_json` | **RETAIN freeze** |
| Version identity | `version_no` · `pack_code` · `template_id` · `template_code` · `template_version` | **RETAIN** |
| Lifecycle | `status` `draft_preview`\|`issued`\|`superseded` · `issued_at`/`issued_by` | **RETAIN** · FR-09c issue = `issued` + amend → `superseded` |
| PDF artifact | `pdf_artifact_ref` | **RETAIN** optional storage key — render SoT = snapshot JSON |
| Soft-delete | `archived_at` | **RETAIN** |
| Registry denorm | `employee_contracts.pack_code` · `template_id` · `template_code` | **RETAIN** after issue |
| Preview persist | — | **DENY** as VER store · CORE-09b ephemeral only |
| Second VER table / mega-EAV | — | **DENY ADD** |
| `/api/hrm/core/…/print-versions` | `/contracts-insurance/…/print-versions*` | **Alias only** — API seat |
| Nest `/core` VER table | — | **DENY invent** |
| Open TPL catalog DONE | Peer **09d** | **OUT invent DONE** |

```text
  employee_contracts (LIVE — registry must_keep + denorm after issue)
        RETAIN denorm: pack_code · template_id · template_code (+ DRIVER expand from CORE-09b)
        DENY:   salary SoT · dual registry · wipe expand cols
                │
                │ F-CORE-CTR-VER-01 (can_issue) → INSERT issued
                ▼
  hrm_contract_print_versions (LIVE — RETAIN ONE VER SoT · HOLD no ADD)
        RETAIN: id · contract_id · company_id · version_no · pack_code ·
                template_id · template_code · template_version ·
                merged_fields_json · clauses_snapshot_json · compensation_snapshot_json ·
                status (draft_preview|issued|superseded) · issued_at · issued_by ·
                pdf_artifact_ref · archived_at · created_at/updated_at
        UQ:     (contract_id, version_no)
        IX:     (company_id, contract_id) · (company_id, template_code) WHERE template_code NOT NULL
        DENY:   second VER store · wipe table · Nest /core table · mega-EAV snapshot
                mutate issued snapshot body · PDF from live-library re-merge
                │
                │ F-CORE-CTR-PDF-01
                ▼
  PDF render from issued snapshot only (pdfkit) · optional pdf_artifact_ref

  CORE-09b PACK+PREV ephemeral (SEALED must_keep — DENY PREV→INSERT VER rewrite)
  CORE-09a hrm_contract_clauses body SoT + clauses_snapshot_json freeze (must_keep)
  CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public
        SEALED must_keep · Nest /core DENY

  FORBIDDEN GĐ1 this seat:
        ADD schema / mega-EAV / second VER store / Nest @Controller('core') VER table
        Wipe LIVE print_versions · invent 09d TPL as CORE-09c DONE
        Unlock schema without BA/QA proven VER/PDF column gap
        Claim CORE-09b=printable · contracts_printable_ready · reopen sealed J-*
```

**Label lock:** «Lưu phiên bản + In/PDF HĐLĐ» = LIVE print_versions issued snapshot + PDF-from-snapshot — **not** ephemeral PREV · **not** open TPL invent · **not** clause-library rewrite.  
**Spine lock:** Physical VER/PDF on `/contracts-insurance/*` — **DENY** Nest `/core` dual.  
**Freeze lock:** Issued snapshots **immutable** — amend = new `version_no` + prior `superseded`.  
**Gap lock:** Schema UNLOCK only with BA/QA proof of missing VER/PDF column — **default HOLD**.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE (`contract-legal-print.service.ts` ensureSchema) | Gap (Wave-15 DATA) |
|--------|-------------------------------------------------------------|---------------------|
| **`public.hrm_contract_print_versions`** | CREATE: `id · contract_id · company_id · version_no · pack_code · template_id · template_version · merged_fields_json · clauses_snapshot_json · compensation_snapshot_json · status CHK(draft_preview\|issued\|superseded) · issued_at · issued_by · pdf_artifact_ref · archived_at · created_at/updated_at` · UQ `(contract_id, version_no)` · IX `(company_id, contract_id)` · **ADD** `template_code` + IX `(company_id, template_code)` | **HOLD RETAIN** — **no ADD** |
| Issue path | `createPrintVersion`: re-run `previewContract` · `!can_issue` → block · supersede prior `issued` · INSERT `status=issued` freeze snapshots · denorm pack/template on contract · `HRM-CTR-VER-201` | **RETAIN** (API cite) |
| List/get | `listPrintVersions` / `getPrintVersionById` · `archived_at IS NULL` · same company scope family | **RETAIN** |
| PDF | `renderPrintVersionPdf` from issued snapshot (`merged_fields_json` + `clauses_snapshot_json`) · optional `pdf_artifact_ref` · block non-issued | **RETAIN** |
| **`public.employee_contracts` denorm** | expand LIVE: `pack_code · template_id · template_code` (+ DRIVER/term cols from CORE-09b) | **HOLD RETAIN** |
| CORE-09b PREV | Ephemeral DTO — **MUST NOT** be VER persist SoT | **must_keep** |
| CORE-09a clauses | body SoT + consume into `clauses_snapshot_json` at issue | **must_keep** |
| Paper `/core/…` | **ABSENT** as Nest SoT | Alias only |
| Second VER store / mega-EAV | **ABSENT** | **HOLD** — **NOT unlock** |
| Nest `/core` VER/PDF table | **ABSENT** | **DENY invent** |
| Source | `createPrintVersion` · `listPrintVersions` · `getPrintVersionById` · `renderPrintVersionPdf` · `@Controller('contracts-insurance')` | sa API RETAIN cite → FE save/PDF fidelity |

**FORBIDDEN invent this seat:** Nest `/core` VER/PDF SoT · second VER store · mega-EAV · wipe print_versions · invent 09d TPL DONE · claim CORE-09b=printable · flip `contracts_printable_ready` · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip · `apps/**`.

---

## 4. Physical columns — LIVE cite (normative RETAIN)

### 4.1 `public.hrm_contract_print_versions` (ONE issued VER SoT)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| `id` | uuid PK | NO | Version id | F-CORE-CTR-VER-02 · PDF-01 |
| `contract_id` | uuid | NO | Soft FK → `employee_contracts.id` | VER-01 · U19 |
| `company_id` | text | NO | Legal entity / scope | U19 · scope_parity |
| **`version_no`** | int | NO | Monotonic per contract · amend = +1 | O4 · O6 · AC-CTR-PRINT-04 |
| **`pack_code`** | text | NO | Frozen pack at issue | O6 · PACK-INVALID |
| **`template_id`** | uuid | YES | Soft FK template | VER display |
| **`template_code`** | text | YES | ADD-IF-NOT-EXISTS LIVE · display/matrix | O11 · IX |
| **`template_version`** | int | YES | Frozen template version | VER |
| **`merged_fields_json`** | jsonb | NO | Đ.21 / merge fields after ACL at issue | O3 · PDF-01 · AC-CTR-PRINT-05 |
| **`clauses_snapshot_json`** | jsonb | NO | Ordered `{code, title_vi, body_vi, …}` freeze | O3 · BR-CTR-CL-01 · CORE-09a |
| **`compensation_snapshot_json`** | jsonb | YES | Historical C&B print only when ACL — **≠** live PAY | O3 · CORE-02 mask |
| **`status`** | text CHK | NO | `draft_preview` \| **`issued`** \| **`superseded`** | O4 · VERSION-NOT-ISSUED |
| **`issued_at`** · **`issued_by`** | timestamptz / text | YES | Issue audit | O6 display |
| **`pdf_artifact_ref`** | text | YES | Optional storage key after render | PDF-01 |
| **`archived_at`** | timestamptz | YES | Soft-delete | soft |
| `created_at` / `updated_at` | timestamptz | NO | Audit | — |

**Constraints / indexes (LIVE):**

| Object | Definition | Maps |
|--------|------------|------|
| **UQ** | `(contract_id, version_no)` | O4 no silent overwrite identity |
| **CHK** | `status IN ('draft_preview','issued','superseded')` | lifecycle |
| **IX** | `(company_id, contract_id)` | list scope |
| **IX** | `(company_id, template_code) WHERE template_code IS NOT NULL` | matrix / display |

**Invariant CORE-VER-ONE:** Authoritative issued print SoT = **`hrm_contract_print_versions` only** — second VER table / Nest `/core` = **FAIL O1**.

**Invariant CORE-VER-FREEZE:** When `status=issued`, mutate snapshot JSON body = **FAIL O3** · BR-CTR-CL-01.

**Invariant CORE-VER-AMEND:** Second successful issue → new `version_no` · prior `issued` → `superseded` — silent overwrite prior snapshot = **FAIL O4**.

**Invariant CORE-VER-PDF-SNAPSHOT:** PDF render from live library re-merge (not issued snapshot) = **FAIL O3** · AC-CTR-PRINT-05.

**Invariant CORE-VER-≠-PREV:** CORE-09b `POST …/preview` **MUST NOT** be redefined as persist-issued SoT = **FAIL O5**.

### 4.2 `public.employee_contracts` — denorm pack/template (RETAIN)

| Cột (LIVE expand) | Ý nghĩa | Maps |
|-------------------|---------|------|
| **`pack_code`** | Last issued / selected pack denorm | O6 · F5 registry overlay |
| **`template_id`** · **`template_code`** | Last template denorm | O6 · O11 |
| Registry spine + DRIVER/term expand | UF-HRM-02 must_keep (CORE-09b) | O7 · AC-CTR-PRINT-08 |
| C&B | Soft `compensation_package_id` — print history on VER `compensation_snapshot_json` only | BR-CD-F5-01 · CORE-02 |

**Invariant CORE-VER-DENORM:** Issue may UPDATE denorm pack/template on registry — **DENY** dual registry table · **DENY** salary SoT on registry.

### 4.3 Consume peers (must_keep — no reopen rewrite)

| Peer | Physical | Role for 09c |
|------|----------|--------------|
| **CORE-09b** | `hrm_contract_pack_rules` · templates · ephemeral PREV | Gate `can_issue` · pack resolve — **≠** printable DONE |
| **CORE-09a** | `hrm_contract_clauses.body_vi` | Source for freeze into `clauses_snapshot_json` |
| **CORE-08** | rewards/discipline + payroll_link | **≠** VER SoT |
| **CORE-02** | packages/eins · AuthZ/CB-403 | Comp snap ACL · mask |
| **CORE-01** | public employees strip | Nest `/core` DENY |

### 4.4 Conditional UNLOCK gate (default = NOT)

| Condition | Unlock schema? | This seat |
|-----------|----------------|-----------|
| BA/QA proves missing physical column needed for issued VER snapshot / PDF fidelity (named field + AC fail) | **YES** — narrow ADD only | **NOT proven** |
| FE UX / wire / display-ready residual only | **NO** — sa API RETAIN + Dev-FE | Default path |
| Desire for mega-EAV / second VER / Nest `/core` / wipe | **NO** — **DENY** | Absolute |

**Verdict:** VER/PDF field column gap **NOT proven** → **HOLD / NOT unlock**.

---

## 5. Validation matrix (physical)

| VAL-ID | Condition | Rule | Expected |
|--------|-----------|------|----------|
| **VAL-CORE-VER-01** | Issue when `can_issue=true` | INSERT row `status=issued` + freeze three JSON cols (+ comp when ACL) | Row exists · F5 list shows `version_no`+`pack_code` |
| **VAL-CORE-VER-02** | Issue when `can_issue=false` / missing mandatory | **DENY** INSERT issued | **no** new issued row · ISSUE-BLOCKED family |
| **VAL-CORE-VER-03** | Amend after issued | New `version_no` · prior → `superseded` | Prior snapshot body unchanged |
| **VAL-CORE-VER-04** | PDF for `status=issued` | Render from `merged_fields_json` + `clauses_snapshot_json` | `%PDF` · match snapshot · ≠ live remerge |
| **VAL-CORE-VER-05** | PDF when not issued | Block | `HRM-CTR-VERSION-NOT-ISSUED` |
| **VAL-CORE-VER-06** | Soft-delete | `archived_at` set · list excludes | No hard DELETE doctrine violate |
| **VAL-CORE-VER-07** | Scope | list/get/create/PDF same `resolveHrmListScope` family as contract get | No cross-CT leak · U19 |
| **VAL-CORE-VER-08** | PREV call | Ephemeral only | `ver_insert_posts=0` on preview path |
| **VAL-CORE-VER-09** | Nest `/core` VER table/controller SoT | Forbidden | **FAIL O1** |
| **VAL-CORE-VER-10** | Second VER store / wipe LIVE | Forbidden | Schema/process **FAIL** |
| **VAL-CORE-VER-11** | Invent 09d TPL as 09c DONE | Forbidden | **FAIL O8** |
| **VAL-CORE-VER-12** | Claim CORE-09b=printable / flip printable flag | Forbidden | **FAIL O9/O10** |

---

## 6. Traceability (requirement → DB → API → FE → test)

| SRS / BR | DB | API (paper) | FE / J-* | Test expect |
|----------|----|-------------|----------|-------------|
| FR-09c #1 · AC-CTR-PRINT-04/06 | INSERT `hrm_contract_print_versions` issued | **F-CORE-CTR-VER-01** | **J-HRM-CORE-09C-01** DRAFT | POST 201 · list shows pack+version |
| FR-09c #3–#4 · AC-CTR-PRINT-04 | same row F5 | **F-CORE-CTR-VER-02** | **J-HRM-CORE-09C-01** | GET 200 · F5 còn |
| FR-09c #2 · AC-CTR-PRINT-05 · BR-CTR-CL-01 | snapshot JSON | **F-CORE-CTR-PDF-01** | **J-HRM-CORE-09C-02** | PDF 200 `%PDF` match snapshot |
| FR-09c #5 · BR-CTR-CL-01 | new version + supersede | VER-01 | **J-HRM-CORE-09C-04** | prior superseded |
| BR-CTR-CL-02/04 · AC-CTR-PRINT-01/06 | **no** issued row | VER-01 gate | **J-HRM-CORE-09C-03** | ISSUE-BLOCKED / TPL-NONE |
| O5 PREV must_keep | **no** PREV persist | F-CORE-CTR-PREV-01 | **J-HRM-CORE-09C-04** regress | preview `ver_insert=0` |
| O7 registry | `employee_contracts` CRUD | CTR-01 | UF-HRM-02 | F5 CRUD PASS |
| O1 Nest deny | no `/core` table | physical contracts-insurance | Network assert | Nest `/core` 0 |
| Peer OBS | — | F-CORE-CTR-TPL peer 09d | — | carry `R-QA-CORE-09B-CLAUSE-FP-EMPTY` |

**scope_parity:** contract get-by-id **=** VER create/list/get **=** PDF — same contracts-insurance / `resolveHrmListScope` family as pack-resolve + preview (U19).

---

## 7. Error / integrity mapping (RETAIN — no invent rewrite)

| Physical fail | HTTP / code | Data outcome |
|---------------|-------------|--------------|
| Missing mandatory / `!can_issue` | 400 `HRM-CTR-ISSUE-BLOCKED` (+ DRIVER/TERM/TPL-NONE) | **no** issued INSERT |
| Scope mismatch | 409 `HRM-SCOPE-409` / `HRM-CTR-UNIT-SCOPE` | **no** row / 404 get |
| PDF non-issued | 4xx `HRM-CTR-VERSION-NOT-ISSUED` | no PDF blob |
| Pack/template mismatch | 4xx `HRM-CTR-PACK-INVALID` / `TPL-PACK-MISMATCH` | block issue |
| Success issue | 201 `HRM-CTR-VER-201` | issued row + denorm |
| Success list/get | 200 `HRM-CTR-VER-200` | display-ready |
| Soft archive | — | `archived_at` set · excluded from default list |

---

## 8. DENY / must_keep / honesty

### DENY (this seat)

| Item | Why |
|------|-----|
| ADD schema / mega-EAV / second VER store | HOLD default · gap not proven |
| Wipe LIVE `hrm_contract_print_versions` | must_keep AS-IS SoT |
| Nest `/core` VER/PDF table or `@Controller('core')` SoT | O1 dual-SoT FAIL |
| Reopen rewrite CORE-09b PREV→INSERT VER | O5 must_keep stamp `CORE09BQC1-MSLB05DZ` |
| Invent 09d TPL catalog as CORE-09c DONE | O8 · peer only |
| Claim CORE-09b = printable DONE | O9/O10 |
| Flip `contracts_printable_ready` / recruitment / jd / module UAT | honesty lock |
| Reopen sealed J-HRM-CORE-09B/09A/08/02/01 without regression | seals |
| Seed / `apps/**` / honesty flip | U65 · docs-only |

### must_keep RETAIN

| Stamp / surface | Retain |
|-----------------|--------|
| **`CORE09BQC1-MSLB05DZ`** | PACK+PREV ephemeral · Nest `/core` 0 · printable false |
| **`CORE09AQC1-MSLA4LX9`** | CL library + snapshot freeze |
| **`CORE08QC1-MSL9BFFE`** | RD dual + payroll_link |
| **`CORE02QC1-MSL80DU6`** | packages/eins · AuthZ/CB-403 |
| **`CORE01QC1-MSL6WMS7`** | public strip · Nest `/core` DENY |
| LIVE VER/PDF | `POST/GET …/print-versions*` · `GET …/pdf` · table cols §4.1 |
| Soft-delete · U19 scope_parity · registry CRUD | doctrine |

### Honesty (LOCKED false)

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| **`contracts_printable_ready`** | **false** · **DENY** flip from this DATA seat |
| personnel / CORE / CTR module UAT | **false** |
| **C-SLICE-≠-MODULE** | GWC later ≠ module UAT ≠ printable ready |
| Claim CORE-09b = printable | **DENIED** |
| Invent 09d TPL DONE here | **DENIED** |

**Carry OBS:** `R-QA-CORE-09B-CLAUSE-FP-EMPTY` → **UC-BP-CORE-09d** (not invent TPL DONE here).

---

## 9. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| FE invent PDF by re-merging live library | AC-CTR-PRINT-05 · VAL-CORE-VER-04 · PDF-01 snapshot-only |
| Dual Nest `/core` path appears | O1 FAIL · Network assert Nest `/core` 0 |
| PREV rewritten to persist issued | O5 · VAL-CORE-VER-08 · stamp CORE09B |
| Schema unlock without gap proof | §4.4 HOLD default |
| OBS clause-empty treated as 09c DONE | Carry → 09d only |
| Honesty / printable flip from DATA | §8 LOCKED false |

---

## 10. Unlock next (governance)

| Next | Role | What |
|------|------|------|
| **`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01`** | **sa** | **HOLD/RETAIN cite** **F-CORE-CTR-VER-01** · **F-CORE-CTR-VER-02** · **F-CORE-CTR-PDF-01** on physical `/contracts-insurance/*` · F.1 mục đích + bước SRS · **DENY** Nest `/core` dual · **DENY** invent endpoints · must_keep PREV ephemeral · unlock Dev-FE save/PDF fidelity **only after** API RETAIN — **not** Dev invent schema/API |
| Dev-BE | **HOLD** | Unless API residual wire gap proven after API-01 |
| Dev-FE | After API RETAIN | Save VER + PDF U65 fidelity residual only |
| Peer 09d | Later | TPL + OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` |

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Physical DATA **CONFIRMED HOLD** for UC-BP-CORE-09c: **RETAIN** LIVE `public.hrm_contract_print_versions` (cite `merged_fields_json` · `clauses_snapshot_json` · `compensation_snapshot_json` · `version_no` · `pack_code` · `template_*` · `status` issued/superseded · `pdf_artifact_ref` · soft `archived_at`) + denorm pack/template on `employee_contracts`; **NO ADD** schema / mega-EAV / second VER store / Nest `/core` table / wipe; conditional UNLOCK **NOT** (VER/PDF column gap not proven); **must_keep** CORE-09b PACK+PREV ephemeral · CORE-09a CL+snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY; **DENY** invent 09d TPL as DONE · claim CORE-09b=printable · `contracts_printable_ready` · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty · apps/**; carry OBS → 09d; unlock **sa API-01** RETAIN cite F-CORE-CTR-VER-01/02 + PDF-01 — **not** Dev invent. |
| **next_owner** | **sa** |
| **next_dispatch_prompt** | see §12 |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-data-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · peer CORE09BQC1-MSLB05DZ
spec_ref: F-CORE-CTR-VER-01 · F-CORE-CTR-VER-02 · F-CORE-CTR-PDF-01 RETAIN cite · must_keep F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · physical /contracts-insurance/* · paper /core alias only

MISSION — API F.1 lock (docs-only · HOLD/RETAIN):
1) RETAIN cite LIVE POST/GET …/contracts/:id/print-versions* + GET …/print-versions/:versionId/pdf — F.1 mỗi fn: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-09c Diễn biến #) · DTO↔DB cols from DATA-01 · lỗi HRM-CTR-VER/ISSUE/PDF*
2) LOCK: server re-preview + can_issue gate · snapshot freeze · amend supersede · PDF-from-snapshot only · U19 scope_parity list=get=create=pdf
3) DENY Nest /core dual VER/PDF SoT · DENY invent new endpoints/schema · DENY rewrite PREV→INSERT VER · DENY invent 09d TPL as this WI DONE
4) RETAIN must_keep CORE-09b/09a/08/02/01 seals · carry R-QA-CORE-09B-CLAUSE-FP-EMPTY → 09d
5) Honesty: contracts_printable_ready=false · C-SLICE · DENY claim CORE-09b=printable · no apps/** · no seed
6) Unlock next: Dev-FE save VER + PDF U65 fidelity residual ONLY — Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md · PASS_TO_PM
```

---

*End DATA-01 · Wave-15 CORE-09c · ba-data HOLD · 2026-08-09*