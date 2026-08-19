# ADR: Plane A ↔ Plane B bridge — 4 member LE + synthetic holding ↔ 5 OU slugs

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727 |
| **work_item_id** | `SA-G-INT-03-PLANE-A-BRIDGE-01` |
| **Status** | **Accepted** |
| **Date** | 2026-07-27 |
| **Decision owner** | SA |
| **Closes** | G-INT-03 Plane A residual (cardinality / interim name-order) — governance lock |
| **Related** | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` · `ADR-HRM-RBAC-SCOPE-LADDER.md` §4 · BR-INT-05 · TECHSPEC §19 · `DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6 |
| **Evidence** | `docs/qa/evidence/sa-g-int-03-plane-a-bridge-01-20260727.md` · `ba-dual-plane-audit-02-20260727.md` |
| **must_keep** | CO-HC / Company NV GWC CLOSED · OP/MD dual-plane GWC · U65 no seed |

---

## 1. Context

XeVN HRM workforce partitions use **five** operating TEXT slugs (`holding`, `trsport`, `logistics`, `finance`, `services`). XBOS legal / ĐVTV surfaces expose **four member legal entities** plus a **holding** presentation row that is often a **synthetic** UI id (`xbos-group-holding-root`) or holding partition — not a fifth member LE UUID equal to Plane B′ pilot UUIDs.

BA dual-plane audit (`BA-DUAL-PLANE-AUDIT-02`) flagged **G-INT-03 / BR-INT-05** as P1: interim **name-order** bridge risks PROD drift if LE list order or display names change. TECHSPEC §19 already tabulated a 5-row bridge labeled “interim”.

This ADR **locks** the SoT so Dev/QA stop treating 4≠5 as an open design defect, without reopening Company headcount GWC and without conflating Plane A LE UUID with Plane B′ `HRM_COMPANY_UUID_BY_SLUG`.

---

## 2. Problem statement

| Symptom | Cause | Impact if unlocked |
|---------|--------|-------------------|
| “4 LE vs 5 slug” looks like data bug | Cardinality is **by design**: 4 member LE + 1 synthetic/holding operating bucket | Wrong BE “fix” inventing 5th LE or dropping a slug |
| Name-order map feels fragile | Registry historically paired seed order ↔ slug order | Reorder `group-member-units` → wrong headcount bind |
| Teams join LE UUID to OP/MD UUID columns | Plane A ≠ Plane B′ | Empty lists / silent 0 — already guarded `HRM-PLANE-409` on OP/MD |

**Non-problem:** Company headcount AC-CO-EMP-* (GWC CLOSED). **Non-problem this ADR:** deprecating Plane B′ UUID DDL (separate P2 migrate).

---

## 3. Options evaluated

### Option A — Keep & lock map (synthetic 5th + code-keyed SoT) — **RECOMMENDED**

| Dimension | Assessment |
|-----------|------------|
| Scope | Governance + registry SoT; no org redesign |
| Complexity | Low |
| Risk | Low if resolve by **LE `code` / stable key**, not array index |
| Cost / timeline | Immediate (this ADR) |
| Ops | Holding remains synthetic/root; 4 member LE bind via explicit code→slug |

**Pros:** Matches live UAT (Visun→`logistics`…); preserves five-slug workforce; no seed/migration; no CO-HC reopen.  
**Cons:** Slug names (`logistics` for Visun) remain historical operating labels — not industry semantics.  
**Failure modes:** Display-name-only match drifts → mitigate with **code-keyed** table (§4). FE/BE must not invent 6th LE.

### Option B — Expand Plane A to five real LE UUIDs (1:1 with slugs)

| Dimension | Assessment |
|-----------|------------|
| Scope | XBOS org-foundation + seed + shareholders + CC |
| Complexity | High |
| Risk | Medium–high (legal/MST/shareholder data) |
| Cost / timeline | Sponsor org decision + BE/FE wave |
| Ops | True 1:1 UUID↔slug |

**Pros:** Cleaner mental model for PROD auditors.  
**Cons:** Over-builds vs current holding model (`companyId=holding` under tenant `xevn`); conflicts synthetic-root shareholders path; reopens org seed.  
**Reject now** unless sponsor explicitly redesigns legal org.

### Option C — Deprecate Plane B′ (`HRM_COMPANY_UUID_BY_SLUG`) now

| Dimension | Assessment |
|-----------|------------|
| Scope | OP/MD/mobile UUID columns → TEXT slug |
| Complexity | High (migrate + dual-write) |
| Risk | High regression on OP/MD GWC |
| Cost / timeline | Deferred P2 (`G-OP-PLANE-01` / `G-MD-PLANE-01`) |

**Pros:** Removes A/B′ confusion long-term.  
**Cons:** Orthogonal to G-INT-03 **cardinality**; must not block bridge lock; OP/MD already fail-closed on LE UUID.  
**Reject for this WI** — keep B′ as pilot ladder; never treat as Plane A.

---

## 4. Decision

**Accept Option A.**

### 4.1 Cardinality SoT (normative)

```text
Plane A (XBOS legal / ĐVTV list):
  • 1 × holding presentation (synthetic `xbos-group-holding-root`
      OR LE/partition keyed company_id=holding under tenant xevn)
  • 4 × member legal entities (subsidiaries)

Plane B (HRM operating slugs — workforce COUNT SoT):
  • exactly 5: holding | trsport | logistics | finance | services

Bridge BR-INT-05:
  • 5 display rows ↔ 5 slugs (holding + 4 members)
  • NOT “4 LE UUID = 5 slug” without synthetic/holding row
  • LE UUID NEVER = HRM_COMPANY_UUID_BY_SLUG values (Plane B′)
```

### 4.2 Locked code → slug map (supersedes “interim name-order”)

Resolve by **LE / org `code`** (or equivalent stable seed key). Display name is label only. Ordinal position in API arrays is **non-normative**.

| Plane A `code` (org-seed) | Display name (VI) | Plane B `operating_slug` | Plane B′ UUID (map only) |
|---------------------------|-------------------|--------------------------|---------------------------|
| `XEVN-HOLDING` (+ synthetic root) | Tập đoàn XeVN | `holding` | `10000000-0000-4000-8000-000000000001` |
| `XE_TMDV` | Công ty Cổ phần Thương mại và Dịch vụ X.E | `trsport` | `…0002` |
| `VISUN` | Công ty TNHH Du lịch Visun | `logistics` | `…0003` |
| `XE_DU_LICH` | Công ty TNHH Du lịch X.E Việt Nam | `finance` | `…0004` |
| `XE_VIETNAM` | Công ty TNHH X.E Việt Nam | `services` | `…0005` |

**Source files:** `apps/api/xbos-api/data/org-seed-member-companies.json` · `hrm-operating-unit-registry` · `HRM_COMPANY_UUID_BY_SLUG` in `hrm-list-scope.ts`.

### 4.3 Invariants

1. Headcount / `employees.company_id` = Plane **B** slug only (TECHSPEC §19 · CO-HC must_keep).
2. Profile / shareholders / documents = Plane **A** LE id (or synthetic holding root where product already uses it).
3. OP/MD/mobile UUID columns = Plane **B′** only; LE UUID → `HRM-PLANE-409`.
4. JWT `main` ≠ slug; group rollup = five slugs (`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE`).
5. **Cấm** invent 6th LE or drop a slug from COUNT to “fix” 4≠5.
6. Unmapped LE → headcount «—» / fail-visible — never fake `0` from LE UUID filter.

### 4.4 What “interim name-order” becomes

| Before | After (this ADR) |
|--------|------------------|
| TECHSPEC “interim name-order; SA may refine” | **Normative code→slug table §4.2** |
| G-INT-03 Plane A OPEN / block PROD on cardinality | **CLOSED for design** — PROD still needs env/deploy gates elsewhere |
| BA-D-01 §3.3 Khối* TBD links | Superseded by EMP-COL LE display names + this ADR codes |

---

## 5. Impacted systems

| System | Impact |
|--------|--------|
| HRM Company / Employees labels | Keep registry; prefer code key if BE hardens later |
| XBOS `group-member-units` | 4 members + holding presentation — expected |
| OP/MD/mobile | Unchanged; B′ ≠ A |
| Charts G-INT-02 | Labels via Plane B display_name / LE names — separate P2 |

---

## 6. Rollout / checkpoints

| Checkpoint | Owner | Exit |
|------------|-------|------|
| ADR Accepted + evidence PASS_TO_PM | sa | This file + evidence |
| DATA_LINKAGE §6.2 #3 → CLOSED (design) | pm / sa | Pointer to ADR |
| Optional PROD harden (P2) | dev-be | Persist `legal_entity_code` on `company_slug_map` — **not** required to close this WI |
| Option B / C | sponsor | Only on explicit org or migrate request |

---

## 7. Validation / acceptance

| Check | PASS |
|-------|------|
| Documented 4 member LE + holding ↔ 5 slugs | Yes §4.1 |
| Code-keyed map replaces interim ordinal | Yes §4.2 |
| Option A recommended with A/B/C trade-offs | Yes §3 |
| No apps/** / seed / CO-HC reopen | Yes |
| B′ not treated as Plane A | Yes §4.3.3 |

---

## 8. Backlog (BE)

| work_item_id | Priority | When |
|--------------|----------|------|
| *(none immediate)* | — | Option A = governance lock only |
| `D-HRM-BRIDGE-LE-CODE-MAP-01` | **P2** optional | Before PROD if FE/BE still match by display name / list index only — ADD `legal_entity_code` (or equivalent) on bridge resolve; jest reorder-safe; **cấm** reopen CO-HC |

**Do not** dispatch Option B expand-LE or Option C B′-migrate from this ADR.
