# Evidence — PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-14 seat #16) |
| **uc_ids** | `UC-BP-CORE-09b` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `CORE09AQC1-MSLA4LX9` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | DOC-DELTA HOLD/RETAIN · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no ADD schema / mega-EAV / second preview-persist / Nest `/core` table; RETAIN LIVE pack_rules + templates + clauses + contracts | **PASS** — DATA §1 HOLD · §4 RETAIN |
| Cite physical columns already LIVE for pack-resolve + ephemeral preview (no VER invent as 09b) | **PASS** — §3 Nest cite · §4.1–§4.5 |
| Conditional UNLOCK ONLY if BA/QA proves preview field column gap — default = NOT unlock | **PASS** — §4.6 HOLD · gap NOT proven |
| RETAIN CORE-09a clause body SoT + snapshot · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY | **PASS** — §1/§8 |
| DENY invent 09c VER/PDF · 09d TPL as CORE-09b DONE · claim CORE-09a=printable · contracts_printable_ready · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/** | **PASS** — §8 DENY |
| Unlock next: sa API-01 HOLD/RETAIN cite F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 — not Dev invent | **PASS** — §10 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | HOLD default · O1 path · O2 pack MVP · O3 ephemeral · O4 cb_masked · O5 can_issue · O6 pack switch · O7 registry · O8 peers OUT · O9 must_keep · O10 honesty · AC-CORE-09B-* · VAL-CORE-PREV-* |
| SA-01 | Option A LOCKED · LIVE pack-resolve + POST preview · paper `/core` alias · REJECT B/C |
| AS-IS Nest (read-only) | `contract-legal-print.service.ts` ensureSchema: pack_rules · templates · clauses · template_clauses · print_versions · employee_contracts expand (pack/DRIVER) · no Nest `/core` pack/preview SoT |
| Paper DB | LEGAL-PRINT-DATA-01 §3.1–3.4 · DATA-02 lineage RETAIN |
| Paper API | F-CORE-CTR-PACK-01 · PREV-01 RETAIN · CL-01..04 must_keep · VER/PDF/TPL OUT invent |
| CORE-09a/08/02/01 DATA | must_keep · ≠ printable · ≠ pillar · Nest `/core` DENY |

---

## 3. Physical decisions (summary)

1. **HOLD / RETAIN:** LIVE pack_rules + templates + clauses + contracts — **no ADD** schema / mega-EAV / second preview persist / Nest `/core` table.
2. **LIVE cols cited:** pack_rules (match_type/value · pack_code · priority) · templates (pack_code · layout_json · keyword_map) · clauses (CORE-09a body/apply_to_packs/mandatory) · employee_contracts pack/DRIVER expand · ephemeral PREV DTO only.
3. **Unlock:** preview field column gap **NOT proven** → **NOT unlock**.
4. **Path:** physical `/contracts-insurance/contracts*` pack-resolve+preview · `/core` alias only.
5. **must_keep:** CORE-09a/08/02/01 · Nest `/core` DENY · honesty false · C-SLICE.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| CORE / personnel / CTR UAT | **false** |
| Claim CORE-09a = printable DONE | **DENIED** |
| Claim CORE-08 = pillar DONE | **DENIED** |
| C-SLICE | GWC later ≠ module UAT ≠ printable ready |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED RETAIN · then FE preview fidelity residual only |

### next_dispatch_prompt

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

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED HOLD**: RETAIN LIVE pack_rules + templates + clauses + contracts · ephemeral PREV (no VER invent) · schema ADD NOT unlocked · must_keep CORE-09a/08/02/01 · Nest `/core` DENY · honesty false · unlock sa API RETAIN cite PACK+PREV. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md` · `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-data-01.md` |