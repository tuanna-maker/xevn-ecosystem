# TECHSPEC — XBOS apply-to-members allow-list expand (E-XBOS-CTRL-SPEC)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-ERP-XBOS-CTRL-SPEC-01` |
| **cohort** | `E-XBOS-CTRL-SPEC` · alias `XBOS-POLICY-SPEC` |
| **change_mode** | ADD · preserve_default |
| **lane** | governance SPEC only — **NO** `apps/**` · **NO** Dev unlock |
| **Date** | 2026-07-28 |
| **ref_srs** | `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` (**SRS SoT** · §16.7 pointer) · `DANH_MUC` **XBOS-DM-HRM-07** · FR-HRM-SC-* |
| **ref_parent_ts** | `docs/xbos/TECHSPEC.md` §14.11 **G-BM-REC-01** · `docs/hrm/TECHSPEC.md` §18.1 ownership |
| **ref_db** | `docs/xbos/DB_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| **ref_api** | `docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` |
| **prior_gap** | `docs/qa/evidence/sa-xbos-hrm-control-gap-01-20260728.md` (PARTIAL · G1 allow-list) |
| **OpenAPI AS-IS** | `docs/api/openapi/xbos-api.yaml` → `configSyncApplyCatalogToMembers` · allow-list **3 keys** |

> **Status:** **SPEC READY for sponsor chốt** · BA SRS landed · **Dev HOLD** (E-XBOS-CTRL-G1 / G2 chưa mở).  
> **must_keep:** L0 `config_catalog*` SoT · HRM Settings pull pair · UF-XBOS-09/15 · U65 · Plane B slug/`holding` partition · BM `business-master/positions` ≠ HRM picker SoT.

---

## 1. Problem & architecture facts

### 1.1 AS-IS (fact)

| Item | Value |
|------|--------|
| Endpoint | `POST /api/xbos/config-sync/catalog/{catalogKey}/apply-to-members` |
| Success code | `XBOS-CFG-204` |
| Reject key | `XBOS-CFG-005` (400) |
| Runtime allow-list | **`job_titles`**, **`recruitment_channels`**, **`job_grades`** only |
| Semantics | Copy source `(tenantId, companyId)` L0 snapshot → member partitions via **reuse `publishCatalog`** (version/checksum/audit identical) |
| HRM P0 Settings keys | `job_titles` · `departments` · `leave_types` (+ E1-B ≥10 buckets) |
| Gap | Only **`job_titles`** overlaps allow-list ∩ P0 Settings — **departments / leave_types cannot fan-out** |

> Correction vs Cohort 5 summary text: AS-IS is **not** `{job_titles, leave_types, departments}` — those two P0 keys are **missing** today.

### 1.2 Target control spine (unchanged shape)

```text
Holding L0 publish
  → POST …/apply-to-members  (expanded allow-list)
  → Member L0 partitions upserted
  → HRM POST catalog-sync/pull|sync-from-xbos  → L1 synced_catalogs
  → optional L2a extension WF
  → GET settings-catalogs → effectiveItems
  → Consumer picker persist catalog code (*_key)
```

**Non-goals this SPEC:** invent new push URL; rename L0 tables; claim full DANH_MUC 72 STT; Dev Nest change; HRM consumer bind (E1-A already separate).

---

## 2. Decision — Option C phased allow-list (aligned BA P0/P1)

| Option | Summary | Verdict |
|--------|---------|---------|
| **A** — Expand to all 72 STT in one Dev wave | High ACL/scope/blast | **Reject** |
| **B** — New `catalog_apply_policies` table + engine | Over-design; no product need for G1 | **Reject for G1** (P2 optional) |
| **C** — Keep constant allow-list; expand **P0 then P1** (BA); no DDL | Minimal blast; SRS-aligned | **Accept** |

### 2.1 Phase registry (normative — BA SoT)

| Phase | Keys (canonical apply path) | Alias accept (path) | Status |
|-------|----------------------------|---------------------|--------|
| **AS-IS** | `job_titles`, `recruitment_channels`, `job_grades` | `positions`/`employee_positions` → `job_titles`; `candidate_sources` → `recruitment_channels`; `grades` → `job_grades` | **Live** |
| **P0** *(min G1 after chốt)* | AS-IS ∪ **`departments`**, **`leave_types`** | `department_catalog`/`org_departments` → `departments` | **SPEC = BA §2.1** |
| **P1** *(sponsor unlock P1 — may ship same G1 wave or G1b)* | P0 ∪ `contract_types`, `employment_types`, `pay_types`, `shifts`, **`decision_types`** | `employment_type` → `employment_types`; `component_types`/`pay_natures` → `pay_types`; **`hr_decision_types` → `decision_types`** (BA canonical) | **SPEC = BA §2.2** |
| **P2 HOLD** | `salary_components`, `insurers`, `insurance_types`, `kpi_library`, remaining DANH_MUC code catalogs | — | BA §2.3 |

**P0 Dev constant (minimum after sponsor chốt):**

```text
APPLY_TO_MEMBERS_CATALOG_ALLOWLIST_P0 = [
  'job_titles', 'recruitment_channels', 'job_grades',
  'departments', 'leave_types',
]
```

**P1 Dev constant (when BR-HRM-XBOS-CTRL-05 unlocks P1):**

```text
APPLY_TO_MEMBERS_CATALOG_ALLOWLIST_P1 = P0 ∪ [
  'contract_types', 'employment_types', 'pay_types', 'shifts', 'decision_types',
]
```

### 2.2 Alias / DEC reconcile (BA + E1-B)

| Rule ID | Rule |
|---------|------|
| **BR-HRM-XBOS-CTRL-01..05** | As BA delta (P0 must; P1 gated; CFG-005 outside phase) |
| **BR-HRM-XBOS-CTRL-ALIAS-02** | Apply path canonical **`decision_types`**; allow path alias `hr_decision_types` → normalize to **`decision_types`** for allow-list check |
| **SA-DEC-WRITE-01** *(tech)* | Fan-out **writes the key of the source L0 header** (if holding items live under `hr_decision_types`, copy that key to members — **do not** force-rename DDL). If source is only under `decision_types`, write `decision_types`. **Cấm** dual-write both keys in one apply. |
| **SA-DEC-WRITE-02** | HRM consume remains E1-B dual-read / storageKey prefer live — must_keep |
| **BR-HRM-XBOS-CTRL-BM-01** | `business-master/positions` ≠ L0 `job_titles` SoT |

---

## 3. HRM consume pattern (normative)

| Step | Owner API | Contract |
|------|-----------|----------|
| 1 Publish holding | XBOS `POST …/publish` | L0 header+items; `assignedTo` ∋ `hrm` preferred |
| 2 Fan-out | XBOS `POST …/apply-to-members` | Tier B keys; targets Plane B slugs / cross-tenant |
| 3 Pull | HRM `POST …/catalog-sync/pull/:key` or `sync-from-xbos` | L1 `synced_catalogs`; alias family merge (E1-B) |
| 4 Extension | HRM + XBOS catalog-governance | L2a overlay — must_keep |
| 5 Consume | HRM settings-catalogs + forms | Persist `*_key` / code — E1-A/E2 already separate |

**AC (architecture — BA formalizes SRS):**

| AC | Expect |
|----|--------|
| **AC-XBOS-CTRL-01..08** | As BA delta (P0 departments/leave_types; CFG-005 outside phase; U65/U72) — SA does not re-number |

---

## 4. Scope / security / NFR

| Concern | Lock |
|---------|------|
| Partition plane | Plane B TEXT slug / `holding` — same as `DB_DESIGN_XBOS_CATALOG_GOV` §9 |
| Auth | Bearer JWT and/or internal key — unchanged |
| Write scope | `resolveScopeContext` JWT∩body; mismatch **409** |
| Group read | `main` → `holding` |
| Idempotency | Re-apply = upsert via publish semantics (checksum may bump version) |
| Observability | Existing publish/audit path; no new metrics contract required for G1 |
| RLS | No new tables → no RLS sign-off this WI |

---

## 5. Impacted systems

| System | Impact G1 |
|--------|-----------|
| **xbos-api** `ConfigSyncService` | Expand constant + alias normalize (execution G1) |
| **OpenAPI** `ApplyCatalogToMembersBody` description | Update allow-list text |
| **XBOS FE** apply wizard | Surface Tier B keys (G1 FE residual if ABSENT) |
| **hrm-api** | **No new endpoint** — pull already pull-all / by key; G2 only if pull rejects new keys |
| **HRM Settings FE** | Already E1-B buckets — consume after L1 filled |

---

## 6. Rollout / gates

```text
SA-ERP-XBOS-CTRL-SPEC-01 (this)  → PASS_TO_PM
  → BA-ERP-XBOS-CTRL-SRS-01 (BR/AC formal)  [PENDING_SYNTH]
  → Sponsor chốt E-XBOS-CTRL-SPEC
  → E-XBOS-CTRL-G1 (dev-be XBOS allow-list + OpenAPI + jest)
  → E-XBOS-CTRL-G2 (dev-be/fe HRM only if pull/assert gap)
  → QA browser U65: publish → apply departments/leave_types → HRM sync → Settings
  → QC GWC (HOLD_DEPLOY unless program unlock)
```

**Cấm claim Dev unlock from this WI.**

---

## 7. Validation evidence plan

| Layer | Evidence |
|-------|----------|
| Spec | This file + DB/API pair + control-gap prior |
| Dev G1 | jest allow-list + alias; OpenAPI description |
| QA | Browser FE chain on `departments` + `leave_types` (+ one DEC apply) |
| QC | No GO on SPEC alone |

---

## 8. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-SPONSOR** | Chốt E-XBOS-CTRL-SPEC (P0 min; P1 same wave or G1b) | Sponsor / PM |
| **R-FE** | Apply-to-members UI coverage P0 (+P1) | G1 FE after chốt |
| **R-P2** | salary_components / insurers / kpi / DANH_MUC breadth | Later cohort |
| **R-BM-FORK** | BM positions vs L0 job_titles | Keep must_keep |
| **R-SHIFTS** | Catalog `shifts` ≠ Attendance `work_shifts` TX | P1 catalog fan-out OK; dual-write TX HOLD |

---

## 9. DOC-DELTA pointer

| Parent | Delta |
|--------|-------|
| `docs/xbos/TECHSPEC.md` §14.11 G-BM-REC-01 | See this expand TechSpec — allow-list Tier B |
| `docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md` §8 F.1-lite | Superseded for apply by full F.1 in API_DESIGN expand |
| `docs/tech-spec/*` | Pointers only |
