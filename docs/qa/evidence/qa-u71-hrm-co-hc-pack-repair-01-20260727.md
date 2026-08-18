# QA-U71-HRM-CO-HC-PACK-REPAIR-01 — Layer B evidence pack repair

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-U71-HRM-CO-HC-PACK-REPAIR-01` |
| **Date** | 2026-07-27 |
| **Role** | qa |
| **lane** | execution · **process repair only** · U65 zero-seed |
| **Trigger** | QC `QC-U71-HRM-CO-HC-DESIGN-GATE-01` = **NO-GO (process)** · condition **C-U71-HC-PACK-01** |
| **Prior QC** | `docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-20260727.md` |
| **Source / patched QA MD** | `docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md` |
| **Product retest** | **Not required** — docs Layer B amend only; product claims unchanged |
| **Seed** | **none** |
| **Dev reopen headcount** | **No** |
| **Phase1 / PROD / :8088** | **NOT claimed** · **HOLD_DEPLOY** stands |
| **ack_status** | **READY_FOR_QC** |

---

## 1. Root cause (process)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
→ FAIL (1/8): crud_or_matrix
```

QA MD had `| **PASS**` AC rows and `J-HRM-CO-01`, but lacked literal `L2.5` / `journey` + matrix wording required by `scripts/verify-qc-evidence-pack.mjs` for the `crud_or_matrix` check.

Rule: `.cursor/rules/qc-evidence-pack-gate.mdc` — verify FAIL ⇒ return to QA, not Dev.

---

## 2. Patch applied (Layer B fields)

Patched **same file** `qa-u71-hrm-co-hc-regression-01-20260727.md`:

| Layer B field | Added / updated |
|---------------|-----------------|
| `work_item_id` + pack repair id | header table |
| `ack_status` | **READY_FOR_QC** |
| Portal URL / `PORTAL_DEV_URL` | header |
| **UF / J-* ids** | **UF-HRM-CO-HC** · **J-HRM-CO-01** · UF-HRM-CO-IND |
| `## 5. L2.5 journey matrix` | table with `| **PASS**` rows |
| Read-only module matrix | Company headcount display **PASS** |
| `## Residual` | kept (singular heading for verifier) |
| `## Classification` | PROCESS closed · PRODUCT none-fail · ENV UV noise |
| `## Command table` | pnpm/node + verify exit **0** |
| Browser evidence pointers | company / f5 / dashboard PNG + runtime JSON |

**Not changed:** AC-CO-EMP-01..06 product verdicts · Network 1109 / Plane B slug keys · industry honest `-` · seed:none · HOLD_DEPLOY language.

---

## 3. Verify re-run (exit 0)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS |
| portal_url | PASS |
| journey_l25 | PASS |
| crud_or_matrix | PASS (was FAIL) |
| residual_section | PASS |
| timestamp | PASS |

---

## 4. Condition status (for QC)

| ID | Status after repair |
|----|---------------------|
| **C-U71-HC-PACK-01** | **Ready to CLOSE** on QC re-gate (pack 8/8) |
| **C-U71-HC-HOLD-01** | Stands (PM) |
| **C-U71-HC-IND-EMPTY** | Stands — industry `-` OK |
| **C-U71-HC-NO-DEV** | Stands — no Dev reopen |

---

## 5. Handoff

### completion_report

**Closed:** Process pack gap that caused QC NO-GO — added L2.5 journey matrix + read-only module matrix + Classification + Command table to `qa-u71-hrm-co-hc-regression-01-20260727.md`. `verify:qc:evidence-pack` **exit 0 (8/8)**. No seed. No product retest. No Dev reopen. No Phase1/PROD claim.

**Residual:** Same product P3 MST cosmetic + industry empty (non-blocking) as prior QA/QC notes.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-U71-HRM-CO-HC-DESIGN-GATE-01
from_role: pm
to_role: qc
lane: governance · re-gate after pack repair
entry_criteria:
  - Prior NO-GO (process): docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-20260727.md · C-U71-HC-PACK-01
  - Pack repair DONE: docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md
  - Patched QA MD: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md · ack READY_FOR_QC
  - pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md → exit 0 (8/8)
  - U65 · HOLD_DEPLOY · local only · product claims unchanged
exit_criteria:
  1) Confirm pack 8/8; close C-U71-HC-PACK-01
  2) Issue GO WITH CONDITIONS or GO for U71 F.1 + UF-HRM-CO-HC local slice
  3) Keep HOLD_DEPLOY · NOT Phase1/PROD/:8088; residual P3 listed only
evidence_path: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
cấm: seed · Dev reopen headcount · Phase1/PROD/:8088 claim
```

### ack_status

**READY_FOR_QC**

### evidence_path

`docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md`

### pm_dispatch_hint

`QC-U71-HRM-CO-HC-DESIGN-GATE-01` re-gate — Layer B **8/8**; close **C-U71-HC-PACK-01**
