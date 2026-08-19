# PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01 — Physical DB · HOLD RETAIN LIVE three-layer (MergeToken · Catalog · FormSchema) (Option A · ba-data HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-24 seat **#26**) |
| **lane** | governance · ba-data |
| **change_mode** | **HOLD** (default) — **no** invent/change LIVE `public.hrm_merge_tokens` ONE SoT MergeToken · **HOLD RETAIN** `settings-catalogs` / `hrm_catalog_extension_items` / domain Nest catalogs — **≠ PLT-01 DONE alone** · **DENY wipe** · **HOLD RETAIN** FormSchema instances (`rec_jd_*` · EMP-CF · CTR) — **DENY** mega-EAV / Nest `emp_custom_field` invent · **NO** Nest `/core` table dual · **NO** wipe CORE-10/09/07 · **NO** wipe soft≠CORE-06 DONE · **NO** wipe CORE-05/03/02b/09d..01 · **NO** invent PAY / ATT / printable / Word DONE · **NO CODE** `apps/**` · **no migrate invent** · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED HOLD** — three-layer spine **already LIVE** · typed-col / second-registry gap **NOT proven** → **NOT unlock** schema · unlock **sa API-01** RETAIN cite **F-PLT-TOK-01/02/03** — residual wire **ONLY if** closable gap proven · **PAY/ATT OUT invent DONE** |
| **uc_ids** | `UC-BP-PLT-01` · `FR-UC-BP-PLT-01` |
| **depends_on** | BA-01 O1–O12 **CONFIRMED** · [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md) · SA-01 Option **A LOCKED** · **R-PLT-01-L1-CAT** HOLD · **R-PLT-01-L2-SCHEMA** HOLD · **R-PLT-01-L3-TOK** HOLD · **R-PLT-01-FREEZE** / **R-PLT-01-RETIRE** cite · **R-PLT-01-≠-DONE** · **R-PLT-01-≠-CAT-DONE** · **R-PLT-01-≠-TOK-UAT** · **R-PLT-01-≠-CORE10-DONE** · **R-PLT-01-PAY-ATT-OUT** · **R-PLT-01-HONESTY** · **R-PLT-01-PRINTABLE** false RETAIN · QC **`CORE10QC1-MSLP0EJB`** · catalog/CRUD/LIVE≠CORE-10 DONE · **`CORE09QC1-MSLNBA89`** printable false · ≠ CORE-09 DONE · **`CORE07QC1-KZJTSHNT`** GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠DONE **`CORE06QC1-MSLID363`** · peers CORE-05/03/02b/09d..01 · EMP DOC/ET · TOK · EMP-CF · SI/ATT/PAY/DEC/REC/CTR catalog peers **RETAIN cite** |
| **ref_sa** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md) |
| **ref_ba** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md) · O1–O12 · AC-PLT-01-* · R-PLT-01-* |
| **ref_platform_api** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md) — F-PLT-TOK-01..03 F.1 (cite RETAIN) |
| **ref_core10_data** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-DATA-01.md) — SI enrollment HOLD · catalog≠DONE · stamp `CORE10QC1-MSLP0EJB` |
| **ref_core09_data** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-DATA-01.md) — registry + keyword + merge cite · printable **false** · ≠ CORE-09 DONE |
| **ref_core07_data** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-DATA-01.md) — activate HOLD · GATE aggregate · Nest `/core` DENY |
| **ref_core06_data** | [`PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-06-CLUSTER-DATA-01.md) — soft≠DONE |
| **ref_core02b_data** | [`PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md) — EMP-CF extension HOLD · DENY mega-EAV |
| **ref_core03_data** | [`PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md) — DOC/ET + TOK side-effect cite |
| **ref_paper_db** | MergeToken ↔ LIVE `hrm_merge_tokens` · Catalog ↔ settings-catalogs + `hrm_catalog_extension_items` + domain Nest · FormSchema ↔ `rec_jd_*` / EMP-CF / CTR clause·layout |
| **ref_paper_api** | **F-PLT-TOK-01** · **F-PLT-TOK-02** · **F-PLT-TOK-03** · peers **F-EMP-TOK-*** · **F-EMP-CF-*** · **F-EMP-CAT-*** · **F-SI-CAT-*** · **F-ATT-CAT-*** · **F-PLT-PAY-COMP-*** · **F-REC-CAT-*** · **F-CORE-CTR-TPL/PREV/VER** · Nest `@Controller('core')` **ABSENT** · paper `/core` alias only |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PLT-01** · Diễn biến **#1–#5 + Thành công** · **BR-PLT-01..06** · AC-PLT-* principle |
| **ref_adr** | ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option **B** · Catalog + FormSchema + MergeToken · Nest physical prefer · paper `/core` alias only · U19 · soft-delete · open catalog BR-PLT-05 · **DENY** mega-EAV |
| **ref_code_cite** | `merge-tokens.service` `ensureMergeTokensSchema` · `hrm_merge_tokens` · list DTO `tokenKey`/`labelVi`/`ring`/`domain`/`status` · `settings-catalogs.controller` · `catalog-sync.controller` · EMP-CF extension-items · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · ATT/PAY/EMP/REC/CTR/**PLT** module UAT **false** · **C-SLICE** · U65 · **DENY** claim peer catalog alone = PLT-01 DONE · **DENY** claim merge LIVE alone = platform UAT · **DENY** claim catalog/CRUD/LIVE = CORE-10 DONE · **DENY** claim CORE-10/09/07 DONE · **DENY** invent PAY/ATT/printable/Word DONE · honesty flip |
| **ack_status** | **PASS_TO_PM CONFIRMED HOLD** |

---

## 1. Verdict — **CONFIRMED HOLD**

| Decision | Stamp |
|----------|--------|
| MergeToken SoT | **ONE HOLD RETAIN** Nest **`public.hrm_merge_tokens`** on **`/api/hrm/merge-tokens*`** — **DENY** second registry · **DENY** Nest `/core` merge dual · **DENY wipe** |
| Catalog L1 | **HOLD RETAIN** **`settings-catalogs`** / **`hrm_catalog_extension_items`** / **domain Nest catalogs** — **≠ PLT-01 DONE alone** · **DENY wipe** |
| FormSchema L2 | **HOLD RETAIN** instances **`rec_jd_*`** · EMP-CF allow-list · CTR clause/layout — **DENY** mega-EAV / Nest **`emp_custom_field`** invent |
| Display-ready DTO | Cite **`tokenKey` · `labelVi` · `status` · `ring` · `domain` · `archivedAt`** (+ catalog `code`/`label`/`status` peer) — wire/derive HOLD schema |
| **R-PLT-01-L3-TOK** | **HOLD** fidelity — LIVE PRESENT · U65 residual |
| **R-PLT-01-L1-CAT** | **HOLD** — peer cite · ≠ PLT DONE |
| **R-PLT-01-L2-SCHEMA** | **HOLD** — instances RETAIN · DENY mega-EAV |
| **R-PLT-01-FREEZE** / **RETIRE** | **HOLD cite** — CORE-09 VER freeze ≠ printable DONE · soft-retire ≠ hard-delete |
| **R-PLT-01-≠-DONE** / CAT / TOK-UAT / CORE10 | **INFO honesty locks** |
| **R-PLT-01-PAY-ATT-OUT** | **OUT invent PAY/ATT DONE** |
| **R-PLT-01-PRINTABLE** | printable **false RETAIN** (`CORE09QC1-MSLNBA89`) |
| Nest path | Physical `/merge-tokens*` + settings-catalogs/domain Nest · Nest `@Controller('core')` **ABSENT** · paper `/core` **alias only** |
| CORE-10 | **must_keep** · stamp **`CORE10QC1-MSLP0EJB`** · catalog/CRUD/LIVE ≠ CORE-10 DONE · **≠** claim CORE-10 DONE |
| CORE-09 printable | **must_keep** · stamp **`CORE09QC1-MSLNBA89`** · printable **false** · ≠ CORE-09 DONE |
| CORE-07 GATE/ACT | **must_keep** · stamp **`CORE07QC1-KZJTSHNT`** · GATE **409** · ACT-**400** · Nest DENY · checklist≠DONE · free PATCH≠DONE · **≠** CORE-07 DONE |
| CORE-06 soft≠DONE | **must_keep** · **`CORE06QC1-MSLID363`** |
| CORE-05 / 03 / 02b / 09d..01 | **must_keep** · **DENY reopen** sealed J-* |
| PAY / ATT | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim peer catalog / merge LIVE / catalog-CRUD = PLT or CORE-10 DONE |

---

## 2. Logical ↔ physical alias map

| Paper (logical) | Physical Option A | Action |
|-----------------|-------------------|--------|
| MergeToken registry | **`public.hrm_merge_tokens`** | **HOLD RETAIN** ONE SoT |
| F-PLT-TOK-01 `/core/…/merge*` | **`GET /api/hrm/merge-tokens*`** | Physical prefer · paper **alias only** |
| F-PLT-TOK-02 upsert/retire | **`POST/PUT/PATCH /merge-tokens*`** · retire | **HOLD RETAIN** |
| F-PLT-TOK-03 resolve-preview | **`POST /merge-tokens/resolve-preview`** | **HOLD RETAIN** · ≠ VER freeze |
| Catalog admin spine | **`/settings-catalogs*`** · `catalog-sync` · domain Nest | **HOLD RETAIN cite** · **≠** PLT DONE |
| EMP-CF extension | **`hrm_catalog_extension_items`** | **HOLD cite** CORE-02b · DENY mega-EAV |
| FormSchema JD / CTR | **`rec_jd_*`** · CTR clause/layout | **HOLD RETAIN** · `jd_dynamic_done=false` |
| Nest `/core` platform table | — | **DENY invent** |
| Freeze BR-PLT-03 | CORE-09 VER `merged_fields` | **HOLD cite peer** · ≠ printable DONE |
| Soft-retire BR-PLT-04 | `archived_at` / status inactive | **HOLD RETAIN** · DENY hard-delete |
| PAY / ATT catalogs | Domain Nest peers | **OUT invent DONE** · trace-only |
| CORE-10 SI | `/employee-insurances*` | **must_keep** · **≠** CORE-10 DONE |
| CORE-07 activate | `POST /employees/:id/activate` | **must_keep** · **≠** CORE-07 DONE |

```text
  public.hrm_merge_tokens (LIVE — HOLD RETAIN MergeToken SoT · ONE)
        RETAIN: id · company_id · token_key · source_path · ring · domain ·
                label_vi · status · origin · extension_field_ref · meta_json ·
                version · archived_at · audit
        ring CHK ∈ public|company|contract|cb|clause|custom
        domain CHK ∈ CTR|EMP|REC|ATT|PAY|SET|CAT
        DENY:   wipe registry · second MergeToken SoT · Nest /core dual ·
                claim merge LIVE alone = platform / PLT UAT DONE
                │
                │ Physical API (HOLD RETAIN — F-PLT-TOK-01..03)
                ▼
  /api/hrm/merge-tokens*  (+ resolve-preview · retire)
                │
                │ Catalog L1 (HOLD cite — ≠ PLT-01 DONE alone)
                ▼
  settings-catalogs · hrm_catalog_extension_items · domain Nest
  (DOC/ET · SI · ATT · PAY · DEC · REC · CTR TPL…) — DENY wipe
                │
                │ FormSchema L2 (HOLD — DENY mega-EAV)
                ▼
  rec_jd_* · EMP-CF allow-list groups · CTR clause/canvas
  DENY Nest emp_custom_field · DENY mega-EAV table invent

  Display-ready DTO (cite · HOLD schema):
        tokenKey · labelVi · status · ring · domain · archivedAt
        (+ catalog peer: code · label · status)

  CORE-10 CORE10QC1-MSLP0EJB · CORE-09 printable false · CORE-07 GATE 409 ·
  ACT-400 · Nest /core DENY · soft≠CORE-06 DONE · CORE-05/03/02b/09d..01
        SEALED must_keep

  FORBIDDEN GĐ1 this seat:
        Invent/change LIVE hrm_merge_tokens SoT
        Wipe settings-catalogs / extension-items / domain Nest catalogs
        Mega-EAV / Nest emp_custom_field invent
        Nest /core platform dual · invent PAY/ATT/printable/Word DONE
        Claim peer catalog = PLT DONE · merge LIVE = platform UAT ·
        catalog/CRUD/LIVE = CORE-10 DONE · claim CORE-10/09/07 DONE
        Honesty flip · reopen sealed J-* · seed · apps/**
```

**Label lock:** Board «Nền tảng cấu hình động (danh mục · schema · trường trộn)» GĐ1 = **LIVE three-layer RETAIN** — **not** Nest `/core` dual · **not** any single peer catalog = FR-PLT DONE · **not** merge LIVE alone = platform UAT.  
**Spine lock:** Physical `/merge-tokens*` + settings-catalogs/domain Nest — **DENY** Nest `/core` second platform SoT.  
**Gap lock:** Schema UNLOCK only with BA/QA proven missing physical column/registry — **default HOLD**.  
**Honesty lock:** printable false · peer catalog ≠ PLT DONE · merge ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · CORE-10/09/07 ≠ DONE · PAY/ATT OUT · C-SLICE.

---

## 3. AS-IS baseline (Nest facts — read-only cite · 2026-08-09)

| Object | AS-IS LIVE | Gap (Wave-24 DATA) |
|--------|------------|---------------------|
| **`public.hrm_merge_tokens`** | `ensureMergeTokensSchema` — token_key · ring · domain · label_vi · status · origin · extension_field_ref · archived_at soft · CHKs open | **HOLD RETAIN** — **no** invent/change |
| **`GET /merge-tokens`** | Maps `tokenKey` · `sourcePath` · `ring` · `domain` · `labelVi` · `status` · default active + `archived_at IS NULL` | **HOLD RETAIN** F-PLT-TOK-01 |
| **Upsert / retire** | POST/PATCH + retire soft | **HOLD RETAIN** F-PLT-TOK-02 |
| **`resolve-preview`** | Registry > keyword_map · no VER write | **HOLD RETAIN** F-PLT-TOK-03 · printable false |
| **`settings-catalogs` / extension-items** | EMP-CF four allow-list + sync | **HOLD cite** · **≠** PLT DONE |
| **Domain Nest catalogs** | DOC/ET · SI · ATT · PAY · DEC · REC · CTR TPL | **HOLD cite peer** · **≠** PLT DONE · **≠** CORE-10 DONE |
| **FormSchema instances** | `rec_jd_*` · EMP-CF · CTR | **HOLD** · DENY mega-EAV · `jd_dynamic_done=false` |
| Paper `/core` | Nest `@Controller('core')` **ABSENT** | **DENY invent** dual |
| CORE-10 / 09 / 07 / 06 / 05 / 03 / 02b / 09d..01 | SEALED stamps | **must_keep** · **DENY wipe** |
| PAY / ATT deepen | Peers QUEUED | **OUT invent DONE** |

**FORBIDDEN invent this seat:** change LIVE merge registry · wipe catalogs · mega-EAV / Nest `emp_custom_field` · Nest `/core` dual · invent PAY/ATT/printable/Word DONE · claim peer catalog/merge/CRUD = FR-PLT or CORE-10 DONE · seed · honesty flip · apps/** · reopen sealed CORE-10..01.

---

## 4. HOLD dispositions (normative)

### 4.1 MergeToken `hrm_merge_tokens` — **HOLD RETAIN** (mission §1)

| Physical | Rule |
|----------|------|
| `public.hrm_merge_tokens` | **HOLD** — no invent/change SoT · ONE MergeToken spine |
| Second registry / Nest `/core` merge table | **FORBIDDEN** |
| Soft archive `archived_at` · status retired | **RETAIN** soft-delete · pickers hide · history OK (**BR-PLT-04**) |
| Merge LIVE alone | **RETAIN path** · **≠ platform / PLT UAT DONE** (**R-PLT-01-≠-TOK-UAT**) |

### 4.2 Catalog L1 — **HOLD RETAIN cite** (mission §2)

| Peer | Rule |
|------|------|
| `settings-catalogs` · `hrm_catalog_extension_items` · domain Nest | **HOLD RETAIN** |
| Claim any peer catalog seal = PLT-01 / FR-PLT DONE | **FORBIDDEN** (**R-PLT-01-≠-CAT-DONE**) |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | **FORBIDDEN** (**R-PLT-01-≠-CORE10-DONE**) |
| Wipe catalogs | **FORBIDDEN** |

### 4.3 FormSchema L2 — **HOLD RETAIN** (mission §3)

| Field | Ruling |
|-------|--------|
| **Scope** | **R-PLT-01-L2-SCHEMA** · AC-PLT-REC / EMP-CUSTOM cite · Diễn biến #2 |
| **Physical** | LIVE `rec_jd_*` · EMP-CF extension groups · CTR clause/layout |
| **Mega-EAV / Nest `emp_custom_field`** | **FORBIDDEN** |
| **jd_dynamic_done** | **false RETAIN** — schema AC journeys **without** flip |
| **ba-data** | **HOLD** — **no** invent shared mega FormSchema table |

### 4.4 Display-ready DTO — cite HOLD schema (mission §4)

| DTO field (camelCase) | DB / derive | Rule |
|-----------------------|-------------|------|
| `tokenKey` | `token_key` | display + wire · no braces in API |
| `labelVi` | `label_vi` | **display-ready** — **DENY** raw key as sole UI label (**AC-PLT-01-DISP**) |
| `status` | `status` | draft\|active\|retired (open) |
| `ring` | `ring` | CHK open set |
| `domain` | `domain` | CHK open set |
| `archivedAt` | `archived_at` | soft-retire · null = active list default |
| Catalog peer | `code` · `label` · `status` | cite settings / domain Nest — ≠ PLT DONE |

**Residual wire:** sa API may stamp envelope fidelity (`labelVi` always present · date/locale on catalog peers) **ONLY if** closable gap proven — **HOLD** schema invent.

### 4.5 CORE-10/09/07 · Nest `/core` · soft≠CORE-06 — **RETAIN** (mission §5)

| Stamp | Rule |
|-------|------|
| **`CORE10QC1-MSLP0EJB`** | **must_keep** · catalog/CRUD/LIVE ≠ CORE-10 DONE · **≠** claim CORE-10 DONE |
| **`CORE09QC1-MSLNBA89`** | printable **false RETAIN** · ≠ CORE-09 DONE · freeze cite OK |
| **`CORE07QC1-KZJTSHNT`** | GATE **409** · ACT-**400** · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **`CORE06QC1-MSLID363`** RETAIN |
| Nest `@Controller('core')` | **ABSENT** · paper alias only · **DENY** invent |

### 4.6 DENY inventory (mission §6)

| DENY | Why |
|------|-----|
| Wipe CORE-10/09/07/06/05/03/02b/09d..01 | must_keep seals |
| Invent PAY/ATT/printable/Word DONE | OUT invent · printable false |
| Claim peer catalog = PLT DONE | R-PLT-01-≠-CAT-DONE |
| Claim merge LIVE = platform UAT | R-PLT-01-≠-TOK-UAT |
| Claim catalog/CRUD/LIVE = CORE-10 DONE | R-PLT-01-≠-CORE10-DONE |
| Claim CORE-10/09/07 DONE | O7 honesty |
| Honesty flip / reopen sealed J-* | C-SLICE · preserve |
| Seed / `apps/**` / Nest `/core` dual / mega-EAV | U65 · Option A |

---

## 5. Validation matrix (data integrity — HOLD)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| VAL-PLT-DATA-01 | Upsert merge token | ONE SoT `hrm_merge_tokens` · UQ active `(company_id, lower(token_key))` | 2xx · F5 list shows `labelVi`+`tokenKey` |
| VAL-PLT-DATA-02 | Token format invalid | Format CHK only | `HRM-PLT-CAT-CODE-INVALID` — **DENY** closed enum N+1 |
| VAL-PLT-DATA-03 | Token key conflict | Other active row | `HRM-PLT-CAT-CODE-CONFLICT` |
| VAL-PLT-DATA-04 | Retire / soft archive | `archived_at` and/or status retired | Picker hide · history OK · **DENY** hard-delete |
| VAL-PLT-DATA-05 | Resolve-preview | Registry > keyword_map | 200 · warnings soft · **no** VER write · printable false |
| VAL-PLT-DATA-06 | Unknown token (strict) | Optional | `HRM-PLT-TOKEN-UNKNOWN` / warnings — empty registry soft OK U65 |
| VAL-PLT-DATA-07 | Dual `#x#` sample | GĐ1 | `HRM-PLT-SCHEMA-INVALID` |
| VAL-PLT-DATA-08 | Scope mismatch | U19 list=get=mutate | `HRM-SCOPE-409` / 404 |
| VAL-PLT-DATA-09 | Catalog EFF>0 | Consumer KEY required | No free-text SoT invent |
| VAL-PLT-DATA-10 | Nest `/core` dual | `@Controller('core')` as SoT | **FAIL** O4 |
| VAL-PLT-DATA-11 | Mega-EAV invent | Nest `emp_custom_field` / mega table | **FAIL** O2 |
| VAL-PLT-DATA-12 | Claim peer catalog = PLT DONE | Evidence footer | **FAIL** honesty |
| VAL-PLT-DATA-13 | Claim merge = platform UAT | Evidence footer | **FAIL** honesty |
| VAL-PLT-DATA-14 | Claim catalog/CRUD/LIVE = CORE-10 DONE | Evidence footer | **FAIL** honesty |

---

## 6. Lifecycle (MergeToken — soft only)

| From → To | Legal? | Notes |
|-----------|--------|-------|
| (new) → draft/active | YES | Upsert F-PLT-TOK-02 |
| active → retired (+ archived_at) | YES | Soft-retire BR-PLT-04 |
| retired → active (restore) | YES if product allows | Prefer un-archive · bump version |
| Any → hard DELETE | **NO** | Soft≠hard · history/freeze peers |

Invalid transition → deterministic 4xx (not silent wipe).

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| `GET /merge-tokens` list | `resolveHrmListScope` + company expand | Same as get-by-id |
| `GET /merge-tokens/:id` | **Same** scope | List id → detail 404 under `main` = **scope_parity FAIL** |
| Mutate / retire | Mutate assert same scope | Group CEO rollup OK · member exact |
| Settings-catalogs / domain Nest | Existing peer resolvers | **Cite** — ≠ invent PLT dual |

---

## 8. Traceability (requirement → physical → API → FE → test)

| BR/AC | Physical | API | FE / J-* | Evidence expect |
|-------|----------|-----|----------|-----------------|
| BR-PLT-01 · AC-PLT-01-TOK-REG | `hrm_merge_tokens` | F-PLT-TOK-02 | **J-HRM-PLT-01-05** DRAFT | Lưu DOC/ET/CF → F5 token |
| BR-PLT-01 · AC-PLT-01-TOK-LIST | same | F-PLT-TOK-01 | **J-HRM-PLT-01-04** DRAFT | `labelVi`+`tokenKey` · Nest `/core` 0 |
| BR-PLT-01 · AC-PLT-01-TOK-PREV | resolve only | F-PLT-TOK-03 | cite CTR-05 | Registry wins · printable false |
| BR-PLT-02/05 · AC-PLT-01-CAT | settings + domain Nest | F-EMP-CAT / F-SI-CAT / … | **J-HRM-PLT-01-01..02** DRAFT | Admin N+1 · ≠ PLT DONE |
| BR-PLT · AC-PLT-01-SCHEMA | `rec_jd_*` / EMP-CF / CTR | peers | **J-HRM-PLT-01-03** DRAFT | DENY mega-EAV · jd false |
| BR-PLT-03 · AC-PLT-01-FREEZE | CORE-09 VER | F-CORE-CTR-VER cite | — | ≠ printable DONE |
| BR-PLT-04 · AC-PLT-01-RETIRE | archived_at | F-PLT-TOK-02 retire | — | Soft only |
| O7/O9 · AC-PLT-01-MK-* / H | seals | — | footer | CORE-10/09/07 ≠ DONE · C-SLICE |
| O8 · AC-PLT-01-PAY-ATT-OUT | — | cite only | — | OUT invent DONE |

---

## 9. Data quality risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` dual | O4 FAIL · this HOLD + API alias-only |
| Mega-EAV / `emp_custom_field` | O2 DENY · CORE-02b HOLD cite |
| False claim catalog = PLT DONE | ≠-CAT-DONE footer every evidence |
| False claim merge = platform UAT | ≠-TOK-UAT footer |
| False claim CORE-10 DONE via catalog | ≠-CORE10-DONE · stamp `CORE10QC1-MSLP0EJB` |
| Printable flip via freeze cite | printable false RETAIN `CORE09QC1-MSLNBA89` |
| Early PAY/ATT DONE | OUT invent · QUEUED seats |
| Seed to fill empty catalog | U65 · empty = soft-allow CTA |

---

## 10. Unlock next — **sa API-01** (mission §7)

| Unlock | Rule |
|--------|------|
| **Owner** | **sa** · `PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01` |
| **Mode** | **RETAIN cite** **F-PLT-TOK-01** + **F-PLT-TOK-02** + **F-PLT-TOK-03** |
| **Paper** | `/api/hrm/core/…/merge*` / catalog/schema = **alias only** |
| **Residual wire** | **ONLY if** closable gap proven (e.g. display-ready envelope always includes `labelVi` · `archivedAt` on admin list · fidelity codes) — **not** Dev invent greenfield |
| **OUT** | Invent PAY/ATT DONE · invent printable/Word DONE · claim peer catalog = PLT DONE · claim merge = platform UAT · claim catalog/CRUD/LIVE = CORE-10 DONE |
| **must_keep** | CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 printable false · CORE-07 GATE/ACT-400/Nest DENY · soft≠CORE-06 · 05/03/02b/09d..01 · Nest `/core` DENY · FormSchema instances RETAIN · DENY mega-EAV |
| **Dev** | **HOLD** invent until API seat + closable gap stamped |

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | PLT-01 DATA **CONFIRMED HOLD** — LIVE `hrm_merge_tokens` ONE SoT + settings-catalogs / extension-items / domain Nest catalogs RETAIN (≠ PLT DONE · DENY wipe) + FormSchema instances RETAIN (DENY mega-EAV) · display-ready DTO `tokenKey`·`labelVi`·`status`·`ring`·`domain`·`archivedAt` cited · CORE-10/09/07 RETAIN · Nest `/core` DENY · soft≠CORE-06 · PAY/ATT OUT · unlock sa API RETAIN cite F-PLT-TOK-01/02/03 |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md` |

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01
role: sa
lane: governance
entry_criteria:
  - BA O1–O12 CONFIRMED: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-BA-01.md
  - DATA HOLD CONFIRMED: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-DATA-01.md
  - SA Option A LOCKED: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-SA-01.md
  - must_keep CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest /core DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE
  - NO apps/** · NO migration invent · NO seed · U65
mission:
  Produce API_DESIGN F.1 RETAIN cite for F-PLT-TOK-01 (list/get) · F-PLT-TOK-02 (upsert/retire) · F-PLT-TOK-03 (resolve-preview)
  Physical prefer /api/hrm/merge-tokens* — paper /core alias only — Nest @Controller('core') DENY
  Cite display-ready: tokenKey · labelVi · status · ring · domain · archivedAt
  RETAIN cite peers: settings-catalogs / domain Nest catalogs / FormSchema instances — ≠ PLT-01 DONE alone · DENY mega-EAV
  Residual wire ONLY if closable gap proven (HOLD schema default) — DENY invent PAY/ATT/printable/Word DONE
  Explicit ≠DONE: peer catalog ≠ PLT DONE · merge LIVE ≠ platform UAT · catalog/CRUD/LIVE ≠ CORE-10 DONE · ≠ CORE-10/09/07 DONE
  must_keep CORE-10 · CORE-09 printable false · CORE-07 GATE/ACT · soft≠CORE-06 · peers CORE-05/03/02b/09d..01
  DENY wipe sealed peers · invent PAY/ATT/printable/Word DONE · honesty flip · reopen sealed J-* · seed · apps/**
exit_criteria:
  - API_DESIGN path written · F-PLT-TOK-01/02/03 RETAIN cite · PASS_TO_PM · Dev HOLD until closable gap stamped
evidence_path: docs/program/specs/PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md
ack_status target: PASS_TO_PM
```

---

*ba-data · Wave-24 · UC-BP-PLT-01 · 2026-08-09 · HOLD default · no apps/** · no seed*
