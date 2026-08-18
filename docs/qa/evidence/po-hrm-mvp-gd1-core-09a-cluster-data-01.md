# Evidence — PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-13 seat #15) |
| **uc_ids** | `UC-BP-CORE-09a` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `CORE08QC1-MSL9BFFE` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | DOC-DELTA HOLD/RETAIN · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no ADD mega clause-version EAV / second body SoT; RETAIN LIVE `hrm_contract_clauses` + print snapshot cols | **PASS** — DATA §1 HOLD · §4.1/§4.2 RETAIN |
| Cite physical columns already LIVE (code title_vi body_vi clause_group apply_to_packs sort_order mandatory status version archived_at lineage) — DENY invent Nest `/core` table | **PASS** — §3 Nest cite · §4.1 matrix · DENY Nest `/core` |
| Conditional UNLOCK prior-body admin history ONLY if BA/QA proves snapshot insufficient — default = NOT unlock | **PASS** — §4.3 HOLD · gap NOT proven |
| RETAIN CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · snapshot freeze | **PASS** — §1/§8 |
| DENY Settings/XBOS body SoT · 09b/09c/09d invent · claim CORE-08=pillar DONE · note=FR-08 DONE · contracts_printable_ready · reopen J-CORE-08/02/01 · seed · honesty flip · apps/** | **PASS** — §8 DENY |
| Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-CL-01..04 (or FE residual) — not Dev invent | **PASS** — §10 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O5 HOLD · O1 path · O2 matrix · O3 draft/issued · O4 `{{field}}` · O6 retire · O7 resolve · O8 peers OUT · O9 must_keep · O10 honesty · AC-CORE-09A-* · VAL-CORE-CL-* · BR-CTR-CL-01..04 |
| SA-01 | Option A LOCKED · Nest `hrm_contract_clauses` body SoT · draft in-place · activate bump · snapshot freeze · paper `/core` alias · REJECT B/C |
| AS-IS Nest (read-only) | `contract-legal-print.service.ts` ensureSchema `hrm_contract_clauses` + lineage ALTER · `hrm_contract_print_versions.clauses_snapshot_json` · activate/retire · no Nest `/core` clause SoT |
| Paper DB | §3.4b clauses · §3.4c print_versions snapshot · DATA-02 lineage RETAIN |
| Paper API | F-CORE-CTR-CL-01..04 · PUB/PULL RETAIN · PREV/VER/PDF/TPL OUT invent |
| CORE-08/02/01 DATA | must_keep · ≠ pillar DONE · note ≠ FR-08 · Nest `/core` DENY |

---

## 3. Physical decisions (summary)

1. **HOLD / RETAIN:** ONE LIVE `public.hrm_contract_clauses` as body SoT — **no ADD** mega-EAV / second body table / Nest `/core` clause table.
2. **LIVE cols cited:** code · title_vi · body_vi · clause_group · apply_to_packs · sort_order · mandatory · status · version · archived_at · lineage (+ effective_from · audit).
3. **Issued history default:** `clauses_snapshot_json` immutable — **sufficient**; prior-body admin history **NOT unlocked**.
4. **Path:** physical `/contracts-insurance/contract-clauses*` · `/core/…/clauses` alias only · Settings ≠ body SoT.
5. **must_keep:** CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · honesty false · C-SLICE.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| CORE / personnel / CTR UAT | **false** |
| Claim CORE-08 = pillar DONE | **DENIED** |
| Claim note-CRUD = FR-08 DONE | **DENIED** |
| C-SLICE | GWC later ≠ module UAT ≠ printable ready |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED RETAIN · then FE Settings residual only |

### next_dispatch_prompt

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

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED HOLD**: RETAIN LIVE `hrm_contract_clauses` + `clauses_snapshot_json` · no mega-EAV · prior-body history NOT unlocked · must_keep CORE-08/02/01 · Nest `/core` DENY · honesty false · unlock sa API RETAIN cite. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-data-01.md` |
