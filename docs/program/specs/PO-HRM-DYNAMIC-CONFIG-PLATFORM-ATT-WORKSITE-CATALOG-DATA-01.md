# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01 — Physical DOC-DELTA · LIVE `attendance_work_sites` deepen

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DATA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01` Option **B** **CONFIRMED** · `ATT-WORKSITE-CATALOG-BA-01` **CONFIRMED** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · ba-data |
| **priority** | P1 |
| **change_mode** | **EXPAND / CONFIRM** physical policy on Nest **LIVE** table · **NO** second table · **NO CODE** `apps/**` · **no migrate execute** · **no seed** |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED EXPAND** — soft-retire + list-active filter + GEO soft-ref DOC-DELTA · **supports** in-flight **BE-01** (does **not** block / re-dispatch / reopen) |
| **prior** | SI-INSURER-CATALOG-QC-02 GWC FE SEAL · R-PLT-SI-INR-03 CLOSED · ATT-LEAVE GWC **RETAIN** |
| **ref_sa** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) L-ATT-WS-01..10 · Option B |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md) BR-PLT-ATT-WS-* · VAL-ATT-WS-CNS-* |
| **ref_att_data** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md) §3 LIVE note — **RETAIN** · ADD-only deepen pointer |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) **§4.4c** |
| **ref_adr** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D3** · [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L6 soft-delete |
| **Honesty** | `attendance_uat_ready=false` · printable/personnel **false** · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · DENY module ATT UAT / Phase1 |
| **must_keep** | Nest `attendance_work_sites` LIVE · `HRM-ATT-GEO-001` · ATT leave `att_leave_type` · ATT-LEAVE GWC · SI type/insurer L1 · CTR · enrollment · EMPTY-DATE CLOSED · `work_shifts` ops · soft-delete class · scope TEXT slug U19 |
| **BE gate** | **ATT-WORKSITE-CATALOG-BE-01 already DISPATCHED (deepen)** — this seat **DATA CONFIRMED supports BE** · **cấm** invent/re-dispatch second BE · **cấm** reopen BE scope |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED EXPAND** |

---

## 1. Verdict — **CONFIRMED EXPAND** (HOLD class = NO second table)

| Decision | Stamp |
|----------|--------|
| Physical table | **LIVE RETAIN** `public.attendance_work_sites` — **FORBIDDEN** ADD second sites / mega-EAV / fold into `att_leave_type` |
| Change class | **EXPAND DOC-DELTA** retire + list-filter + index **notes** + consumer soft-ref — **not** new physicalize |
| Product retire SoT | **`active=false`** (BR-PLT-04 · L-ATT-WS-05 · VAL-ATT-WS-CNS-04) |
| Hard DELETE | **Residual only** (`?hard=true` / explicit admin when no refs) — **FORBIDDEN** as sole product retire path |
| `archived_at` | **NOT required GĐ1** — `active` boolean sufficient · optional GĐ1.5 **HOLD** (no column invent this seat) |
| List default | Filter **`active = TRUE`** unless `include_inactive=true` (VAL-ATT-WS-CNS-03b · F-ATT-CAT-WS-01) |
| Geofence consumer | Soft membership lat/lon ∈ active radii → **`HRM-ATT-GEO-001`** **RETAIN** — **no** hard FK punch→site GĐ1 |
| `HRM-ATT-SITE-UNKNOWN` | **HOLD GĐ1.5** — no in-scope `work_site_id` consumer surface (BA BR-PLT-ATT-WS-10) |
| `site_code` | **HOLD GĐ1.5** — identity GĐ1 = UUID `id` + coords (L-ATT-WS-03) |
| Dev this seat | **NO** `apps/**` · **NO** migrate execute · **NO** seed |
| BE-01 | **In-flight deepen** — DATA **supports** soft-retire + list filter · **does not** block / reopen / invent duplicate BE |
| Closes | Physical ambiguity for AC-PLT-ATT-WORKSITE-01* deepen · peer ATT-DATA §3 **RETAIN** |

**Align with BA HOLD wording:** BA stamped «ba-data HOLD — no EXPAND» meaning **no second table / no `site_code` DDL**. This seat is the **allowed EXPAND class**: policy DOC-DELTA on **LIVE** columns only (soft-retire · list filter · index note) — **HOLD class = NO second table** remains **true**.

---

## 2. AS-IS physical (LIVE — no wipe)

| Cột | Kiểu | Null | Default | Ý nghĩa (CONFIRM) |
|-----|------|------|---------|-------------------|
| `id` | uuid | NO | | PK · admin / soft identity GĐ1 |
| `company_id` | text | NO | | Scope slug (`resolveHrmListScope` · U19) |
| `name` | text | NO | | Display label (`ICatalogRow.label_vi`) |
| `address` | text | YES | | Optional |
| `latitude` | double precision | NO | | Geofence center |
| `longitude` | double precision | NO | | |
| `radius_meters` | integer | NO | 200 | Radius meters |
| `active` | boolean | NO | true | **Retire SoT** = `false` · geofence/list default hide |
| `created_at` | timestamptz | NO | | Audit |

| Constraint / index (AS-IS + deepen note) | Rule |
|------------------------------------------|------|
| **PK** | `id` |
| **Scope** | All list/get/mutate/assert filter `company_id` via same scope resolver (**U19**) |
| **IX note (recommend)** | `(company_id)` existing/ensure · **ADD note:** partial or composite **`(company_id, active)`** recommended for list + geofence active set — **optional BE ensure** · **not** blocking new table |
| **FORBIDDEN** | Closed enum of site names · UUID `company_id` regression · second geofence table |

> Source of truth for DDL shape: Nest `ensureWorkSitesSchema` + client DB_DESIGN §4.4c. This seat **documents** deepen policy — **does not** execute migrate.

---

## 3. Soft-retire vs hard DELETE (product SoT)

| Path | Physical | When | Outcome |
|------|----------|------|---------|
| **Product retire** | `UPDATE … SET active = FALSE` | Admin DELETE default / PATCH `active=false` | Row **retained**; list default + geofence **ignore**; punch history / coords history remain (**BR-PLT-04**) |
| **Hard DELETE** | `DELETE FROM …` | Explicit residual only (`hard=true` **and** no protected refs / admin warrant) | **NOT** sole SoT retire; orphan risk if used casually |
| **Idempotent soft** | Already `active=false` | Re-retire | No-op / return retired row — OK |
| **`archived_at`** | — | GĐ1 | **OUT** — do **not** invent column this wave |

**VAL map**

| ID | Condition | Expected |
|----|-----------|----------|
| **VAL-ATT-WS-RET-01** | Product DELETE / retire | Persist `active=false` · **no** row vanish from DB |
| **VAL-ATT-WS-RET-02** | After soft-retire · punch at old coords · gps on · other active sites may still match | Retired site **not** in `active=TRUE` set (CNS-04) |
| **VAL-ATT-WS-RET-03** | Hard DELETE without warrant as only retire UX | **FAIL** product SoT — residual only |
| **VAL-ATT-WS-RET-04** | Soft-retire then `include_inactive=true` list | Retired row visible for admin audit |

---

## 4. List default active filter (columns / indexes)

| Cap | Physical filter | Query |
|-----|-----------------|-------|
| **F-ATT-CAT-WS-01** list (picker / Settings default) | `active = TRUE` (+ scope) | omit `include_inactive` |
| Admin audit | no active filter (or `active IN (true,false)`) | `include_inactive=true` |
| Geofence assert set | `active = TRUE` (+ scope) | consumer punch path — **same predicate class** as list default |
| Active count empty | `COUNT(*) WHERE active=TRUE` = 0 | Skip geofence (ADR D3) · **FORBIDDEN** `ensureDefaultWorkSite` / seed |

**Index note (DOC only)**

```text
-- Recommended (BE ensure optional — not a new catalog table):
-- CREATE INDEX IF NOT EXISTS ix_att_work_sites_company_active
--   ON public.attendance_work_sites (company_id, active);
```

List/geofence queries filter on `(company_id scope, active)` — composite IX reduces seq-scan on dense tenants. **Absence of IX ≠ schema gap blocking AC**; **absence of active filter on list = BE deepen gap** (BA CNS-03b) — addressed by in-flight BE-01.

---

## 5. Consumer soft-ref · GEO-001 · SITE-UNKNOWN HOLD

```text
  attendance_records / check-in body
        │  lat/lon (GPS method)
        ▼
  assertWithinWorkSite → SELECT … FROM attendance_work_sites
        WHERE scope AND active = TRUE
        │
        ├─ empty set ──► skip assert (ADR D3) · no seed
        ├─ coords OOS all radii ──► HRM-ATT-GEO-001 (RETAIN)
        └─ inside ≥1 radius ──► PASS
  work_site_id on consumer body ──► HOLD (no UF) · SITE-UNKNOWN not invent
  gps_locations JSON / Settings MD ──► REF only · NOT enforcement SoT
```

| Rule | Detail |
|------|--------|
| Soft-ref | Punch **does not** require FK `work_site_id` → sites GĐ1; membership = **coordinate** ∈ active radii |
| **GEO-001** | **RETAIN** taxonomy · consumer invent OOS when enforce on |
| **SITE-UNKNOWN** | **HOLD** until BA surfaces bind id — **≠** admin `HRM-ATT-SITE-404` |
| **SITE-VAL** | Admin invalid radius/coords — retain |
| History | Soft-retire **must not** rewrite historical punch rows |

---

## 6. `ICatalogRow` map (RETAIN + deepen)

| Logical | Physical |
|---------|----------|
| `code` | GĐ1 = `id` string · optional future `site_code` **HOLD** |
| `label_vi` | `name` |
| `status` | derived from `active` (`true`→active · `false`→retired) |
| `scope_company_id` | `company_id` |
| `meta` | lat/lon/radius/address |
| `catalog_kind` | `attendance_work_site` (adapter constant) |

---

## 7. Explicit OUT / FORBIDDEN

| OUT | Why |
|-----|-----|
| **Second table** / `hrm_att_catalog_rows` mega-EAV | HOLD class · ADR Q-PLT-03 |
| **Fold into `att_leave_type`** | Different SoT · ATT-LEAVE GWC **SEAL RETAIN** |
| **`ensureDefaultWorkSite` / seed default site** | U65 · ADR D3 · AC-PLT-ATT-WORKSITE-01c |
| **Flip `attendance_uat_ready`** / invent module ATT UAT / Phase1 DONE | Honesty · `C-SLICE-≠-MODULE` |
| **Settings / `gps_locations` sole SoT** | Option A REJECT · ADR D3 |
| **`site_code` / `archived_at` DDL this seat** | GĐ1.5 HOLD — not required for soft-retire |
| **Invent `SITE-UNKNOWN` assert without UF** | BA HOLD |
| **Reopen SI-INSURER / SI type / CTR / enrollment / EMPTY-DATE / ATT-LEAVE seals** | Peer seals RETAIN |
| **Re-dispatch / invent duplicate BE-01** | Already DISPATCHED deepen |
| **Wipe ATT leave / SI DB sections** | ADD-only DOC-DELTA |

---

## 8. Validation matrix (data / integrity)

| ID | Condition | Rule | Expected |
|----|-----------|------|----------|
| **VAL-ATT-WS-CAT-01** | Admin CREATE N+1 | Open name/coords · persist `active=true` | Row LIVE · F5 list |
| **VAL-ATT-WS-CAT-02** | List default | `active=TRUE` only | Inactive hidden (CNS-03b) |
| **VAL-ATT-WS-CAT-03** | `include_inactive=true` | Show retired | Audit OK |
| **VAL-ATT-WS-CAT-04** | Product retire | `active=false` persist | Geofence set excludes (CNS-04) |
| **VAL-ATT-WS-CAT-05** | Hard DELETE as only retire | — | **FAIL** product SoT |
| **VAL-ATT-WS-CNS-01** | OOS coords · active>0 · gps on | Soft-ref assert | **4xx** `HRM-ATT-GEO-001` |
| **VAL-ATT-WS-CNS-02** | Invent `work_site_id` | — | **HOLD** — no assert invent |
| **VAL-ATT-WS-CNS-03** | List scope ≠ assert scope | U19 | FAIL scope_parity |
| **VAL-ATT-WS-CNS-05** | GPS method missing lat/lon · enforce | FAIL closed | **FORBIDDEN** silent 201 PASS |
| **VAL-ATT-WS-SCP-01** | get-by-id OOS | Same scope as list | 404/409 class · not empty mask |
| **VAL-ATT-WS-OUT-01** | Seed / ensureDefault for empty | U65 | **FAIL** |
| **VAL-ATT-WS-OUT-02** | Fold sites into leave table | — | **FORBIDDEN** |

---

## 9. Traceability

| Requirement | DB | API | FE | Test |
|-------------|-----|-----|----|------|
| AC-PLT-ATT-WORKSITE-01 | §4.4c LIVE active set | assert GEO | GPS clock lat/lon | U65 browser |
| AC-PLT-ATT-WORKSITE-01b | active radii | GEO-001 | invent OOS | 4xx |
| AC-PLT-ATT-WORKSITE-01c | COUNT active=0 | skip assert | VI/CTA | no seed |
| AC-PLT-ATT-WORKSITE-01d | INSERT open | F-ATT-CAT-WS-02 | Settings GPS | 201+F5 |
| AC-PLT-ATT-WORKSITE-01H | honesty flags | — | — | evidence stamp |
| AC-PLT-ATT-04 | §4.4c | F-ATT-CAT-WS-* | CFG GPS | RETAIN |
| BR-PLT-04 / CNS-04 | `active=false` | soft DELETE | retire UX | soft path |
| BR-PLT-ATT-WS-06 / CNS-03b | `active` filter | list default | picker | active-only |
| L-ATT-WS-07 GEO | soft-ref | GEO-001 | — | jest retain |
| J-HRM-ATT-WS-CAT-* | §4.4c | WS-* | Settings+punch | QA after BE READY |

**scope_parity (U19):** list `GET work-sites` · get-by-id · mutate · geofence `assertWithinWorkSite` — **same** `company_id` / `resolveHrmListScope` semantics. Flag defect if list returns id but detail 404 under group CEO `main`.

---

## 10. DOC-DELTA targets (ADD-only)

| Artifact | Action |
|----------|--------|
| DB_DESIGN **§4.4c** | **EXPAND** soft-retire sole product path · list `active` default · IX `(company_id, active)` note · GEO soft-ref · SITE-UNKNOWN HOLD · FORBIDDEN second table / fold leave / ensureDefault / seed |
| ATT-DATA-01 §3 | **ADD pointer** to this WORKSITE-DATA pack — **no wipe** leave ADD |
| This file | SoT physical deepen for AC-PLT-ATT-WORKSITE-01* |
| Client SRS | Optional ba-docs later — **not** this seat |

---

## 11. Honesty / seals / non-claims

| Flag / seal | Rule |
|-------------|------|
| `attendance_uat_ready` | **false** — DENIED flip |
| printable / personnel / payroll e2e | **false** — unchanged |
| ATT-LEAVE-CATALOG GWC | **SEAL RETAIN** |
| SI type L1 · SI insurer L1 · CTR · enrollment · EMPTY-DATE CLOSED | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Work-sites DATA deepen ≠ module ATT UAT |
| BE-01 | Support only — **no** second DISPATCH invent |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED EXPAND** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-data-01.md` |
| **next_owner** | **pm** — **await** `ATT-WORKSITE-CATALOG-BE-01` **READY_FOR_QA** → **qa** (do **not** re-dispatch BE) |
| **completion_report** | See evidence § completion_report |
| **BE** | In-flight deepen **supported** by this DATA CONFIRMED — soft-retire + list active filter + GEO retain + SITE-UNKNOWN HOLD |
