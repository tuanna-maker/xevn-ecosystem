# PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE clause library + snapshot (Option A · O5)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-13 seat **#15**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD / RETAIN** LIVE `public.hrm_contract_clauses` + `hrm_contract_print_versions.clauses_snapshot_json` · **NO ADD** mega clause-version EAV · **NO** second body SoT · **NO CODE** `apps/**` · **no migrate run** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — physical O5 · SA Option A · BA O1–O12 · prior-body admin history **NOT unlocked** (snapshot sufficiency **not disproven**) |
| **uc_ids** | `UC-BP-CORE-09a` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-12 CORE-08 **SEALED** stamp **`CORE08QC1-MSL9BFFE`** |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md) · **O5 HOLD** · O1–O12 · AC-CORE-09A-* · VAL-CORE-CL-* · **BR-CTR-CL-01..04** |
| **ref_core08_data** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md) — dual RD + payroll_link · **≠ pillar DONE** · note **≠** FR-08 DONE |
| **ref_core02_data** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md) — packages/eins · AuthZ/CB-403 · Nest `/core` DENY |
| **ref_core01_data** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-DATA-01.md) — public strip · Nest `/core` DENY |
| **ref_paper_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§3.4b** `hrm_contract_clauses` · **§3.4c** `hrm_contract_print_versions.clauses_snapshot_json` · lineage DATA-02 **RETAIN** · peer [`PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) / [`DATA-02`](./PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md) |
| **ref_paper_api** | **F-CORE-CTR-CL-01..04** **RETAIN cite** · **F-CORE-CTR-PUB/PULL** RETAIN · physical `/contracts-insurance/contract-clauses*` · paper `/core/…/clauses` = **alias only** · peers F-CORE-CTR-PREV/VER/PDF/TPL **OUT invent** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09a** · **BR-CTR-CL-01..04** · AC-CTR-CL-01..03 · AC-PLT-CTR-CL-01..06 |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-08 = CORE pillar DONE · **DENY** claim note-CRUD = FR-08 DONE |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| Clause body SoT | **ONE** LIVE **`public.hrm_contract_clauses.body_vi`** — **RETAIN** · **DENY** second body table / Settings/XBOS store / Nest `/core` clause table |
| Schema action this seat | **HOLD** — **no ADD** mega clause-version EAV · **no ADD** prior-body history table · **no** invent Nest `/core` physical |
| Columns | **RETAIN LIVE** (cite §3) — code · title_vi · body_vi · clause_group · apply_to_packs · sort_order · mandatory · status · version · archived_at · lineage (+ effective_from · audit) |
| Issued history | **`hrm_contract_print_versions.clauses_snapshot_json`** = immutable issued body history — **must_keep RETAIN** · **sufficient default** for prior-body read |
| Prior-body admin history | **Conditional UNLOCK only** if BA/QA proves snapshot insufficient for admin audit — **this seat: gap NOT proven** → **NOT unlock** · **HOLD** |
| Nest path | Physical **`/api/hrm/contracts-insurance/contract-clauses*`** · paper `/api/hrm/core/…/clauses` = **alias only** |
| Publish/pull | **`hrm_contract_library_publishes*`** + pull audits + lineage cols — **RETAIN** · **≠** second body SoT |
| CORE-08 / 02 / 01 | **must_keep** RD dual + payroll_link · packages/eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · public strip · Nest `/core` DENY · stamps **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · J-HRM-CORE-08/02/01 **PASS RETAIN** |
| Peers 09b/09c/09d | Pack preview / print PDF / template catalog engines — **OUT invent** as this WI DONE |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-CORE-08/02/01 · **NO** claim CORE-08=pillar DONE · **NO** note=FR-08 DONE · **NO** flip `contracts_printable_ready` |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| `hrm_contract_clause` / §3.4b | **`public.hrm_contract_clauses`** | **RETAIN** ONE SoT |
| `code` · `title_vi` · `body_vi` | same columns | **RETAIN** · body SoT |
| `clause_group` · `apply_to_packs` · `sort_order` · `mandatory` | same | **RETAIN** |
| `status` · `version` | same · CHK draft\|active\|retired | **RETAIN** · activate bump |
| Soft retire | `status='retired'` + `archived_at` | **RETAIN** |
| Lineage / publish | `origin` · `origin_company_id` · `origin_publish_version` · `lineage_code` | **RETAIN** DATA-02 |
| Issued prior body | **`hrm_contract_print_versions.clauses_snapshot_json`** | **RETAIN freeze** · default history SoT |
| Mega EAV / clause_version rows | — | **DENY ADD** this seat |
| Prior-body admin history table | — | **HOLD** · unlock only if snapshot insufficient proven |
| Settings / XBOS catalog body | — | **DENY** body SoT |
| `/api/hrm/core/…/clauses` | `/contracts-insurance/contract-clauses*` | **Alias only** — API seat |
| Nest `/core` clause table | — | **DENY invent** |

```text
  hrm_contract_clauses (LIVE — RETAIN ONE body SoT · HOLD no ADD)
        RETAIN: id · company_id · code · title_vi · body_vi ·
                clause_group · apply_to_packs[] · sort_order · mandatory ·
                status (draft|active|retired) · version · effective_from ·
                archived_at · created_at/updated_at · created_by/updated_by ·
                origin · origin_company_id · origin_publish_version · lineage_code
        DENY:   mega clause-version EAV · second body table · Nest /core table
                Settings/XBOS authoritative body store
                │
                │ resolve / soft-block when issued
                ▼
  hrm_contract_print_versions (LIVE — must_keep snapshot freeze)
        RETAIN: clauses_snapshot_json (jsonb array · immutable when issued)
                merged_fields_json · status draft_preview|issued|superseded
        DENY:   mutate issued snapshot · treat snapshot mutate as library SoT

  hrm_contract_library_publishes + pull_audits (LIVE — RETAIN)
        Group→member lineage · ≠ second body SoT

  CORE-08 employee_rewards|discipline + payroll_link (SEALED must_keep)
  CORE-02 packages|eins · AuthZ/CB-403 (SEALED must_keep)
  CORE-01 employees public strip (SEALED must_keep)

  FORBIDDEN GĐ1 this seat:
        CREATE hrm_contract_clause_versions / EAV prior-body as default SoT
        Nest @Controller('core') clause table/controller SoT
        Settings/XBOS body_vi writer as SoT
        Invent 09b/09c/09d engines as CORE-09a DONE
```

**Label lock:** «Thư viện điều khoản HĐ» = LIVE `hrm_contract_clauses` body-as-data — **not** print engine · **not** mega-EAV history.  
**Spine lock:** Physical mutate on `/contracts-insurance/contract-clauses*` — **DENY** Nest `/core` dual.  
**History lock:** Issued prior body = **`clauses_snapshot_json`** — default **HOLD** on admin prior-body table.  
**Settings lock:** UX only — **≠** body SoT.

---

## 3. AS-IS baseline (Nest facts — read-only cite)

| Object | AS-IS LIVE (Nest ensureSchema) | Gap (Wave-13 O5) |
|--------|--------------------------------|------------------|
| **`public.hrm_contract_clauses`** | `id · company_id · code · title_vi · body_vi · clause_group · apply_to_packs TEXT[] · sort_order · mandatory · status CHK(draft\|active\|retired) · version · effective_from · archived_at · created_at/updated_at · created_by/updated_by` + lineage `origin · origin_company_id · origin_publish_version · lineage_code` | **HOLD RETAIN** — **no ADD** |
| UQ / IX | `uq_hrm_contract_clauses_company_code_active` (company_id, lower(code)) WHERE active + not archived · `ix_…_company_group` · lineage IX | **RETAIN** |
| **`public.hrm_contract_print_versions`** | `… · clauses_snapshot_json JSONB NOT NULL DEFAULT '[]' · merged_fields_json · status draft_preview\|issued\|superseded · …` | **RETAIN freeze** · issued history SoT |
| Draft update | `updateClause` in-place on `body_vi` when not issued | **RETAIN** (API cite) |
| Issued soft-block | `clauseHasIssuedSnapshot` → CONFLICT → activate bump | **RETAIN** |
| Soft retire | `status='retired'` + `archived_at` | **RETAIN** |
| Publish/pull | LIVE publishes + pull audits + lineage | **RETAIN** · ≠ new body SoT |
| Paper `/core/…/clauses` | **ABSENT** as Nest SoT | Alias only |
| Mega EAV / prior-body admin table | **ABSENT** | **HOLD** — **NOT unlock** (snapshot sufficient default) |
| Nest `/core` clause table | **ABSENT** | **DENY invent** |
| Source | `contract-legal-print.service.ts` ensureSchema + CRUD · `@Controller('contracts-insurance')` | sa API RETAIN cite → FE residual only |

**FORBIDDEN invent this seat:** Nest `/core` clause SoT · Settings/XBOS body SoT · mega clause-version EAV · second `body_vi` table · unlock prior-body admin history without BA/QA proof · invent 09b/09c/09d as DONE · claim CORE-08=pillar DONE · claim note=FR-08 DONE · flip `contracts_printable_ready` · reopen J-CORE-08/02/01 · seed · honesty flip · `apps/**`.

---

## 4. Physical columns — LIVE cite (normative RETAIN)

### 4.1 `public.hrm_contract_clauses` (ONE body SoT)

| Cột | Kiểu (LIVE) | Null | Ý nghĩa | Maps |
|-----|-------------|------|---------|------|
| `id` | uuid PK | NO | Clause id | F-CORE-CTR-CL-* |
| `company_id` | text | NO | Legal entity / scope | U19 |
| **`code`** | text | NO | Stable code per CT | O2 · BR · UQ active |
| **`title_vi`** | text | NO | VI title | O2 |
| **`body_vi`** | text | NO | **Body SoT** · `{{field}}` | O2/O4 · BR-CTR-CL-03 |
| **`clause_group`** | text | NO | Group | O2 |
| **`apply_to_packs`** | text[] | NO | Packs / `*` | O2 |
| **`sort_order`** | int | NO | Order in group | O2 |
| **`mandatory`** | boolean | NO | Pack-attach gate (consumer peer) | O2 · 09b/c OUT invent |
| **`status`** | text CHK | NO | `draft` \| `active` \| `retired` | O3/O6 |
| **`version`** | int | NO | Bump on activate when issued | O3 · BR-CTR-CL-01 |
| `effective_from` | date | YES | Optional | RETAIN |
| **`archived_at`** | timestamptz | YES | Soft-delete | O6 |
| `created_at` / `updated_at` | timestamptz | NO | Audit | RETAIN |
| `created_by` / `updated_by` | text | YES | Audit | RETAIN |
| **`origin`** | text | NO | `member`\|`group`\|`member_override` | DATA-02 lineage |
| **`origin_company_id`** | text | YES | Holding when pulled | lineage |
| **`origin_publish_version`** | int | YES | Publish N | lineage |
| **`lineage_code`** | text | YES | Stable lineage | lineage |

**Invariant CORE-CL-ONE-BODY:** Authoritative library body = **`hrm_contract_clauses.body_vi` only** — Settings/XBOS/Nest `/core` second writer = **FAIL O1/O5**.

**Invariant CORE-CL-NO-EAV:** **DENY** ADD `hrm_contract_clause_versions` / EAV attribute rows as GĐ1 default SoT this seat.

**Invariant CORE-CL-STATUS:** `status ∉ {draft,active,retired}` → FAIL CHK / VAL.

**Invariant CORE-CL-UQ-ACTIVE:** Active non-archived `(company_id, lower(code))` unique — conflict soft-block / activate path (API).

### 4.2 Issued snapshot — `public.hrm_contract_print_versions`

| Cột | Kiểu | Null | Ý nghĩa | Maps |
|-----|------|------|---------|------|
| **`clauses_snapshot_json`** | jsonb | NO | Issued clause array freeze (code · title · body · … at issue) | O3/O7 · AC-PLT-CTR-CL-03 · BR-CTR-CL-01 |
| `merged_fields_json` | jsonb | NO | Field merge freeze | peer print |
| `status` | text | NO | `draft_preview` \| `issued` \| `superseded` | freeze when issued |
| `contract_id` · `company_id` · `version_no` | … | NO | Print version identity | soft FK |

**Invariant CORE-CL-SNAPSHOT-FREEZE:** After `status=issued`, **DENY** mutate `clauses_snapshot_json` from library edit / activate bump — library vN+1 **must not** rewrite issued snapshot.

**Invariant CORE-CL-HISTORY-DEFAULT:** Admin/read of **prior issued body** = reopen print version snapshot — **sufficient** unless BA/QA evidence proves otherwise.

### 4.3 Conditional prior-body admin history — **HOLD (default NOT unlock)**

| Gate | Rule |
|------|------|
| Default | **HOLD** — **do not** ADD prior-body admin history table / mega version EAV |
| Unlock condition | BA **and** QA evidence that **`clauses_snapshot_json` is insufficient** for a required admin audit journey (explicit AC gap) |
| This seat | Gap **NOT proven** (BA O5) → **NOT unlock** |
| If later unlocked | Separate work_item · ADD-only · must_keep snapshot freeze · **DENY** replace snapshot as issued SoT |

**Invariant CORE-CL-HISTORY-HOLD:** Claiming prior-body EAV **required** without BA/QA proof = **FAIL O5**.

---

## 5. Validation & error expectations (data plane)

| VAL-ID | Condition | Expected | Fail |
|--------|-----------|----------|------|
| **VAL-CORE-CL-DATA-01** | Body SoT write | Persist only on `hrm_contract_clauses.body_vi` | Settings/XBOS second writer |
| **VAL-CORE-CL-DATA-02** | Required fields | Empty code/title/body → **400** `HRM-CTR-CL-REQUIRED` | Silent 2xx |
| **VAL-CORE-CL-DATA-03** | Issued overwrite attempt | Soft-block / **`HRM-CTR-CL-CODE-CONFLICT`** → activate bump | Silent body overwrite |
| **VAL-CORE-CL-DATA-04** | Snapshot after bump | Issued `clauses_snapshot_json` unchanged | Snapshot mutated |
| **VAL-CORE-CL-DATA-05** | Soft retire | `retired` + optional `archived_at` · snapshots readable | Hard-delete referenced |
| **VAL-CORE-CL-DATA-06** | Scope U19 | list=get=update=activate=retire same company scope family | Cross-CT leak |
| **VAL-CORE-CL-DATA-07** | Nest `/core` | Zero physical clause table/controller SoT | Dual invent |
| **VAL-CORE-CL-DATA-08** | Mega-EAV | No ADD this seat | EAV invent without unlock |
| **VAL-CORE-CL-DATA-09** | CORE-08 must_keep | RD+payroll_link smoke PASS | RD regression |
| **VAL-CORE-CL-DATA-10** | Honesty | printable/recruitment/jd/CORE UAT false · ≠ CORE-08=DONE · ≠ note=FR-08 | Flip / false DONE |

### Error taxonomy (RETAIN — no invent rewrite)

| Code | HTTP | Data meaning |
|------|------|--------------|
| `HRM-CTR-CL-200/201` | 2xx | Persist OK |
| `HRM-CTR-CL-REQUIRED` | 400 | Missing code/title/body |
| `HRM-CTR-CL-CODE-CONFLICT` | 4xx | Issued soft-block / active code conflict |
| `HRM-CTR-CL-404` | 404 | Missing / out of scope |
| `HRM-SCOPE-409` | 409 | Scope mismatch |
| Sealed RD/CB/AuthZ codes | — | **DENY** rewrite |

---

## 6. Scope parity (U19)

| Surface | Same resolver family |
|---------|----------------------|
| List clauses | `GET …/contract-clauses` |
| Get-by-id | `GET …/contract-clauses/:id` |
| Update / activate / retire | same contracts-insurance scope |
| Snapshot read | print-versions under same company/contract scope |

**Flag `scope_parity`:** list returns id but get/update 404 under group CEO `main` = **P0** — API/QA assert (not this DATA invent).

**J-* (DRAFT from BA):** `J-HRM-CORE-09A-01..04` — Settings create+activate · draft F5 · issued bump + snapshot freeze · retire + Nest `/core` 0 + seals.

---

## 7. Traceability (requirement → physical → API → FE → test)

| BR / AC | Physical | API (cite) | FE / J-* | Test expect |
|---------|----------|------------|----------|-------------|
| BR-CTR-CL-01 · AC-PLT-CTR-CL-02/03 | `body_vi` + `version` + `clauses_snapshot_json` | F-CORE-CTR-CL-02/03 | J-09A-03 | CONFLICT → bump · snapshot freeze |
| BR-CTR-CL-03 · AC-PLT-CTR-CL-05 | library row **or** snapshot | resolve consumers | J-09A-03 note | No FE hardcode long legal SoT |
| BR-CTR-CL-04 | — | peer 09d | OUT | No fake template DONE |
| AC-CTR-CL-01 · AC-PLT-CTR-CL-01/04 | LIVE cols §4.1 | F-CORE-CTR-CL-01/02/03 | J-09A-01/02 | Create · draft F5 · activate |
| AC-CTR-CL-03 · AC-PLT-CTR-CL-06 | `retired` / `archived_at` | F-CORE-CTR-CL-04 | J-09A-04 | Soft retire · snapshot OK |
| O5 HOLD | No EAV ADD | — | — | DATA HOLD stamp |
| O9 must_keep | CORE-08/02/01 tables | sealed APIs | J-09A-04 smoke | ≠ pillar DONE · ≠ note=FR-08 |
| O10 honesty | — | — | evidence footer | printable false · C-SLICE |

---

## 8. must_keep & DENY

| Item | Rule |
|------|------|
| LIVE clause spine | `hrm_contract_clauses` + activate soft-block + soft retire + lineage |
| Snapshot freeze | `clauses_snapshot_json` immutable when issued |
| Publish/pull | RETAIN · ≠ second body SoT |
| CORE-08 | rewards* + discipline* + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE · note **≠** FR-08 DONE |
| CORE-02 | packages/eins · AuthZ-403 · CB-403 · stamp **`CORE02QC1-MSL80DU6`** |
| CORE-01 | public strip · stamp **`CORE01QC1-MSL6WMS7`** |
| Nest `/core` | **DENY** clause SoT |
| Settings/XBOS | **DENY** body SoT |
| Mega-EAV / prior-body admin | **HOLD** · default **NOT unlock** |
| 09b/09c/09d | **OUT invent** as this WI DONE |
| Honesty | printable / recruitment / jd / CORE UAT **false** · C-SLICE |
| Seed / apps/** | **DENY** |
| Reopen sealed J-CORE-08/02/01 | **DENY** without regression |

---

## 9. Data risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` clause table | O1/O5 DENY · API RETAIN physical path only |
| Mega-EAV “for audit” without proof | HOLD gate §4.3 · require BA/QA evidence |
| Settings catalog becomes body SoT | CORE-CL-SETTINGS · VAL-DATA-01 |
| Snapshot rewrite on bump | CORE-CL-SNAPSHOT-FREEZE · AC-PLT-CTR-CL-03 |
| Claim CORE-08 / note / printable DONE | O9/O10 · honesty footer |
| Pull 09b/c/d into this WI | O8 OUT · peer seats |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **next_owner** | **sa** — API-01 **HOLD/RETAIN cite** **F-CORE-CTR-CL-01..04** (physical path + draft/issued/snapshot/retire) · unlock Dev-FE Settings residual **only after** API cite RETAIN (or if FE residual alone proven) |
| **Dev** | **HOLD** — **no** invent schema · **no** Nest `/core` · Settings fidelity residual only after contracts |
| **ba-data residual** | Prior-body admin history remains **HOLD** until BA/QA proves snapshot insufficient |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-data-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09a
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · peer CORE08QC1-MSL9BFFE
spec_ref: F-CORE-CTR-CL-01..04 RETAIN · F-CORE-CTR-PUB/PULL RETAIN · physical /contracts-insurance/contract-clauses* · paper /core alias only · BR-CTR-CL-01..04 · snapshot freeze

MISSION — API F.1 RETAIN cite (docs-only · HOLD invent):
1) RETAIN cite F-CORE-CTR-CL-01..04 on LIVE /api/hrm/contracts-insurance/contract-clauses* (list/create-update/activate/retire) — DENY Nest /core dual clause SoT
2) Cite draft in-place vs issued CONFLICT→activate bump · clauses_snapshot_json immutable · {{field}} · soft retire · display-ready labels
3) RETAIN publish/pull — not new body SoT · OUT invent F-CORE-CTR-PREV/VER/PDF/TPL as this WI DONE
4) RETAIN CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest /core DENY · snapshot freeze
5) DENY Settings/XBOS body SoT · mega-EAV · claim CORE-08=pillar DONE · note=FR-08 DONE · contracts_printable_ready · reopen J-CORE-08/02/01 · seed · honesty flip · apps/**
6) Unlock next: Dev-FE Settings UX residual ONLY after API CONFIRMED RETAIN — not Dev invent schema/API

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md · PASS_TO_PM · next Dev-FE residual or QA prep
```

---

## 11. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O5 **CONFIRMED HOLD** for UC-BP-CORE-09a: **RETAIN** LIVE `hrm_contract_clauses` (code · title_vi · body_vi · clause_group · apply_to_packs · sort_order · mandatory · status · version · archived_at · lineage) + **`clauses_snapshot_json` freeze** · **no ADD** mega-EAV / second body SoT · prior-body admin history **NOT unlocked** (snapshot sufficient default) · must_keep CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · DENY Settings/XBOS body SoT · 09b/09c/09d invent · claim CORE-08=pillar DONE · note=FR-08 DONE · `contracts_printable_ready` · reopen sealed J-CORE-08/02/01 · seed · honesty flip · apps/** · C-SLICE. Unlock **sa API-01 RETAIN cite F-CORE-CTR-CL-01..04** — not Dev invent. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | API F.1 RETAIN cite · FE Settings fidelity residual after API · prior-body history remains HOLD · journeys DRAFT until QA |
