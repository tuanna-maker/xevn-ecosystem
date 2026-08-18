# SA-ERP-E1B-DESIGN-REVIEW-01 — Design review & Dev unlock

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-ERP-E1B-DESIGN-REVIEW-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance G1 E1-B — **NO** `apps/**` · **NO** migration · **NO** seed |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **DESIGN READY — UNLOCK Dev FE + Dev BE** |
| **program** | `FIDELITY_PROGRAM_DISPATCH.md` Cohort 2 E1-B · `SETTINGS-UI-EXPAND` |

---

## 1. read_first ack

| # | Artifact | Result |
|---|----------|--------|
| 1 | `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` | ADD FR-HRM-SC-SET-UI-01 · ≥10 buckets · BR-ALIAS · HOLD shifts |
| 2 | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` | L0/L1/L2a reuse · key registry · VAL-E1B-DEC-* · no DDL |
| 3 | `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md` | F.1 A′–G′ · `resolveCatalogFamily` · sync = behavior gap not new URL |
| 4 | `docs/qa/evidence/ba-erp-e1b-db-api-01-20260728.md` | ba-data PASS_TO_PM; residual → SA |
| 5 | `FIDELITY_PROGRAM_DISPATCH.md` Cohort E1-B | DoD: ≥10 tabs · DEC alias · sync E2E · U72 |

---

## 2. Architecture facts (from designs + prior spot)

| Fact | Implication |
|------|-------------|
| Physical plane = existing `synced_catalogs` + `hrm_catalog_extension_*` + XBOS `config_catalog*` | **No new tables / no DDL** for E1-B |
| Live DEC L1 key = **`hr_decision_types`** (items > 0); FE `decision_types` can MISS | Alias family + **storageKey prefer live key** |
| `POST …/sync-from-xbos` already pull-all | **No invent sync URL** |
| Settings UI still 4 buckets | FE expand registry ≥10 |
| `work_shifts` = Attendance TX table; `shifts` = catalog dictionary | Dual-write **out of E1-B** |

---

## 3. SA decisions (normative)

### 3.1 DEC `storageKey` — **CONFIRM** prefer `hr_decision_types`

| Rule | SA lock |
|------|---------|
| **Family** | `dec_types` = `{ hr_decision_types, decision_types }` always dual-read / merge / assert |
| **FR name** | Logical/FR canonical may remain `decision_types` (FR-HRM-SC-DEC-01) for docs |
| **Write / extension `storageKey`** | **Prefer `hr_decision_types`** when L1 (or remote XBOS) already has that key; else first non-empty L1 alias; else default write target **`hr_decision_types`** (align live XBOS SoT — do **not** invent rename DDL) |
| **DDL / rename** | **FORBIDDEN** this wave — no ALTER, no migrate live key → FR-only name |
| **FE** | `decisionTypes.keys` **MUST** include both; `writeKey` = BE/FE resolve storage (prefer `hr_decision_types`) |
| **BE** | `resolveCatalogFamily` + pull try-list; GET items merge family; assert `assertCodeInEffectiveCatalog(family=dec_types)` |

**Reconcile BA SRS §1.1 vs DB_DESIGN §3.1:** BA lists UI canonical as `hr_decision_types`; DB lists FR canonical as `decision_types`. **SA:** both correct on different axes — FR id vs **storageKey**. Runtime write/storage = **`hr_decision_types` prefer**.

### 3.2 No DDL if reuse L0/L1/L2a — **CONFIRM**

| Check | Verdict |
|-------|---------|
| New physical tables for E1-B dictionaries? | **No** |
| Migration apply this wave? | **Forbidden** |
| Ownership L0 XBOS → L1 sync → L2a extension → effectiveItems | **must_keep** |

### 3.3 `shifts` vs `work_shifts` — **P1 HOLD** (does **not** block E1-B)

| Store | Role | E1-B |
|-------|------|------|
| Catalog **`shifts`** | XBOS/Settings dictionary (code + label + optional meta) | **IN SCOPE** — Settings bucket + pull + CRUD extension |
| Table **`work_shifts`** | Company Attendance TX schedule | **OUT** — no dual-write |

**Residual work_item (governance later):** `SA-P1-SHIFTS-SOT-01` / ADR — bind Attendance TX codes to catalog `shifts`.  
**E1-B DoD:** AC-SC-SHIFT-01/02/03 only (bucket + sync + empty honest). **Does not block** Dev FE/BE unlock.

### 3.4 Alias union (close BA ↔ DB drift — Dev must implement union)

| Family | Canonical storage | Aliases (union — all accepted on read) |
|--------|-------------------|----------------------------------------|
| DEC | prefer `hr_decision_types` | `decision_types` |
| pay_nature | `pay_types` | `component_types`, `pay_natures`, `salary_component_types` |
| rec_channel | `recruitment_channels` | `candidate_sources`, `channels` |
| emp_class | `employment_types` | `employment_type` (codes: snake `full_time` …) |
| grade | `job_grades` | `grades` |
| pay_comp (optional #11) | `salary_components` | `payroll_components` |

### 3.5 Sync — **CONFIRM** no new endpoint

Behavior gap only: alias-aware pull/get/items/assert + FE ≥10 buckets. Reuse `POST …/sync-from-xbos` + `POST …/catalog-sync/pull/{key}`.

---

## 4. Exit criteria matrix

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Confirm DEC storageKey prefer `hr_decision_types` + no DDL if reuse L0/L1/L2a; shifts vs work_shifts P1 HOLD | **PASS** (§3.1–3.3) |
| 2 | Sign-off → Dev FE MD panel + BE alias keys | **PASS** (§5) |
| 3 | Evidence this file | **PASS** |
| 4 | PASS_TO_PM; next D-FE + D-BE | **PASS** |
| 5 | No apps/** · migration · seed | **PASS** (docs only) |

---

## 5. Sign-off → Dev unlock

| WI | Role | Scope |
|----|------|-------|
| **D-FE-ERP-E1B-MD-PANEL-01** | `dev-fe` | `MasterDataSettingsPanel` ≥10 buckets; DEC keys both; writeKey resolve; U72 VI; CRUD+search; no hardcode SoT |
| **D-BE-ERP-E1B-ALIAS-KEYS-01** | `dev-be` | `resolveCatalogFamily`; family merge GET/assert; pull alias try-list; expand master allow-list; jest DEC via either key |

**must_keep:** POS / LEAVE / 4 existing buckets · L0→L1→L2a merge · EmployeeForm JT/dept · LeaveTab · Decisions picker pattern (upgrade alias only) · no consumer FREE_TEXT rewrite (E1-A).

**forbidden:** migration rename · seed U65 · invent L0 in HRM · new sync URL · dual-write `work_shifts` · Phase1/PROD claim.

---

## 6. Options considered (DEC storage)

| Option | Summary | Verdict |
|--------|---------|---------|
| **A** Prefer write `hr_decision_types` + dual-read | Matches live XBOS; zero DDL | **SELECT** |
| B Migrate/rename L1 → `decision_types` only | Needs XBOS governance + data move | Reject this wave |
| C Write only FR `decision_types` while L1 live elsewhere | Keeps FE MISS / split SoT | Reject |

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| FE/BE alias lists diverge (BA `channels` vs DB `candidate_sources`) | §3.4 union locked |
| Attendance team assumes Settings `shifts` = TX | HOLD note + residual SA-P1-SHIFTS |
| Empty new buckets after sync | Honest empty + XBOS L0 publish (not HRM invent / not seed) |
| Assert still single-key DEC | BE WI must family-merge before READY_FOR_QA |

---

## 8. Validation / acceptance plan (for QA after Dev)

| Check | Pass |
|-------|------|
| AC-SET-UI-01..10 / AC-SC-DEC-ALIAS-* | Browser U65 — no seed |
| DEC: live only `hr_decision_types` → Settings + Decisions see items | No hardcode fallback when items > 0 |
| Sync F′ then GET items for ≥1 new bucket | 2xx + data or honest empty |
| Scope parity overview vs items | Same company partition |
| Regression 4 keep buckets | POS/LEAVE/JT/DEPT still CRUD |

---

## 9. Handoff packet

```yaml
work_item_id: SA-ERP-E1B-DESIGN-REVIEW-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
entry_criteria: BA SRS + DB/API E1-B designs complete; SA review storageKey + shifts HOLD
exit_criteria: SA CONFIRM + Dev unlock prompts; evidence path
evidence_path: docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md
completion_report: |
  Closed: SA design review E1-B Settings expand.
  CONFIRMED: DEC storageKey prefer hr_decision_types; dual-read {hr_decision_types, decision_types};
  no DDL — reuse L0/L1/L2a; no new sync URL; shifts catalog in-scope, work_shifts dual-write P1 HOLD.
  Alias union locked for pay_types / recruitment_channels drift.
  Sign-off UNLOCK D-FE-ERP-E1B-MD-PANEL-01 + D-BE-ERP-E1B-ALIAS-KEYS-01.
  Residual: SA-P1-SHIFTS-SOT-01 (later); E1-A consumers; XBOS L0 publish empty families.
next_owner: pm
next_dispatch_prompt: |
  Parallel dispatch (same turn):

  ### D-FE-ERP-E1B-MD-PANEL-01
  work_item_id: D-FE-ERP-E1B-MD-PANEL-01
  from_role: pm
  to_role: dev-fe
  lane: execution E1-B
  read_first:
    - docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md §3–§5
    - docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md §3
    - docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md §10
    - docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md AC-SET-UI-*
    - MasterDataSettingsPanel + catalogSearchPicker
  entry_criteria: SA DESIGN READY; U65 zero-seed
  exit_criteria: ≥10 MD buckets; decisionTypes.keys includes hr_decision_types AND decision_types; writeKey DEC prefer hr_decision_types; U72 VI labels; CRUD+search per ADD bucket; no hardcode SoT when items>0; CODE-MEMORY APPEND; unit/smoke; READY_FOR_QA
  evidence_path: docs/qa/evidence/d-fe-erp-e1b-md-panel-01-20260728.md
  cấm: seed; E1-A consumer FREE_TEXT rewrite; dual-write work_shifts

  ### D-BE-ERP-E1B-ALIAS-KEYS-01
  work_item_id: D-BE-ERP-E1B-ALIAS-KEYS-01
  from_role: pm
  to_role: dev-be
  lane: execution E1-B
  read_first:
    - docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md §3
    - docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md §0–§7
    - docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md §3.2
    - hrm-settings-master-keys + settings-catalogs.service
  entry_criteria: SA DESIGN READY; no migration
  exit_criteria: resolveCatalogFamily; GET overview/items/assert DEC family merge; pull/{key} alias try-list; expand master allow-list E1-B keys §3.1; jest covers hr_decision_types via decision_types; CODE-MEMORY APPEND; READY_FOR_QA
  evidence_path: docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md
  cấm: migration rename; invent L0 in HRM; seed; new sync URL
```

---

## 10. Completion contract

- **completion_report:** E1-B Settings design **SIGNED OFF**. DEC storageKey prefer `hr_decision_types`; no DDL; shifts/`work_shifts` P1 HOLD; Dev FE+BE unlocked.
- **next_owner:** `pm` (dispatch parallel FE+BE)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/sa-erp-e1b-design-review-01-20260728.md`
