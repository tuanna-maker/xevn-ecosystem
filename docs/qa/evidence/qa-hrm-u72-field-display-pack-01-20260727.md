# QA-HRM-U72-FIELD-DISPLAY-PACK-01 — Layer B evidence pack repair

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-U72-FIELD-DISPLAY-PACK-01` |
| **Date** | 2026-07-27 |
| **Role** | qa |
| **lane** | execution · **process repair only** · U65 zero-seed |
| **Trigger** | QC `QC-HRM-U72-FIELD-DISPLAY-01` = **NO-GO (process)** · condition **C-U72-PACK-01** |
| **Prior QC** | `docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md` |
| **Source / patched QA MD** | `docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md` |
| **Product retest** | **Not required** for pack wording — product AC matrix **kept** (includes post-QC spot2 **AC-FD-U02 FAIL**) |
| **Seed** | **none** |
| **Dev reopen PASS items** | **No** |
| **Phase1 / PROD / :8088** | **NOT claimed** · **HOLD_DEPLOY** stands |
| **ack_status** | **READY_FOR_QC** |

---

## 1. Root cause (process)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
→ FAIL: QC evidence pack incomplete (2/8 checks)
  - journey_l25: List at least one J-* journey id … with PASS/FAIL
  - crud_or_matrix: CRUD matrix, read-only module table, or L2.5 journey matrix with PASS rows
```

QA MD had AC rows with `| **PASS**` but lacked literal `L2.5` / `journey` / `J-*` / `read-only` module matrix wording required by `scripts/verify-qc-evidence-pack.mjs`.

Rule: `.cursor/rules/qc-evidence-pack-gate.mdc` — verify FAIL ⇒ return to QA, not Dev.

---

## 2. Patch applied (Layer B fields)

Patched **same file** `qa-hrm-u72-field-display-01-20260727.md`:

| Layer B field | Added / updated |
|---------------|-----------------|
| `work_item_id` + pack repair id | header table |
| `ack_status` | **READY_FOR_QC** |
| Portal URL / `PORTAL_DEV_URL` | header |
| **HOLD_DEPLOY** · seed:none · NOT Phase1/PROD/:8088 | header + Classification |
| `## 5. L2.5 journey matrix` | **J-HRM-CO-01** `| **PASS**` · optional **J-HRM-01** cross-nav `| **PASS**` |
| Read-only module matrix | Company / contracts / profile / leave / … |
| `## Residual` | U02 P0 + LeaveTab P2 soft + P3 |
| `## Classification` | PROCESS closed · PRODUCT U02 FAIL · ENV UV noise |
| `## Command table` | pnpm/node + verify exit **0** |

**Not changed to fake PASS:** AC-FD-U02 / AC-U72-GLOBAL remain **FAIL** (`LEGAL_SPECIALIST` · `_tmp-qa-hrm-u72-spot2-runtime.json` `hasJobKey=true`). AC-CO-IND-02 · other AC-FD PASS rows · LeaveTab P2 soft residual · seed:none · HOLD_DEPLOY language kept.

**Note vs prior QC provisional PASS:** QC NO-GO audited an earlier PASS draft; subsequent spot2 recheck **FAIL** U02 is retained honestly — pack 8/8 ≠ product GO.

---

## 3. Verify re-run (exit 0)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS |
| portal_url | PASS |
| journey_l25 | PASS (was FAIL) |
| crud_or_matrix | PASS (was FAIL) |
| residual_section | PASS |
| timestamp | PASS |

---

## 4. Condition status (for QC)

| ID | Status after repair |
|----|---------------------|
| **C-U72-PACK-01** | **Ready to CLOSE** on QC re-gate (pack 8/8) |
| **C-U72-HOLD-01** | Stands (PM) |
| **C-U72-LEAVE-P2** | Stands — LeaveTab P2 soft condition OK |
| **C-U72-NO-DEV** | Stands for **PASS** AC rows — **exception:** P0 U02 requires **D-HRM-U72-LABEL-FE-02** (not “reopen PASS”) |
| Product GLOBAL | **FAIL** retained — QC must not treat pack repair as GO |

---

## 5. Handoff

### completion_report

**Closed:** Process pack gap that caused QC NO-GO — added `## L2.5 journey matrix` (**J-HRM-CO-01** `| **PASS**`) + read-only module matrix + Residual/Classification/Command table to `qa-hrm-u72-field-display-01-20260727.md`. `verify:qc:evidence-pack` **exit 0 (8/8)**. No seed. No product retest for pack wording. No Dev reopen of PASS AC maps. No Phase1/PROD claim. Product **AC-FD-U02 FAIL** kept visible for QC.

**Residual:** P0 U02 `LEGAL_SPECIALIST`; P2 LeaveTab fallback; P3 positive gender N/D.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-U72-FIELD-DISPLAY-01
from_role: pm
to_role: qc
lane: governance · re-gate after pack repair
entry_criteria:
  - Prior NO-GO (process): docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md · C-U72-PACK-01
  - Pack repair DONE: docs/qa/evidence/qa-hrm-u72-field-display-pack-01-20260727.md
  - Patched QA MD: docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md · ack READY_FOR_QC
  - pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md → exit 0 (8/8)
  - Product overall FAIL retained (AC-FD-U02 / GLOBAL) — do not GO as if PASS draft
  - U65 · HOLD_DEPLOY · local only
exit_criteria:
  1) Confirm pack 8/8; close C-U72-PACK-01
  2) Product: NO-GO (product) on U02 — next PM → D-HRM-U72-LABEL-FE-02
  3) Keep HOLD_DEPLOY · NOT Phase1/PROD/:8088; C-U72-LEAVE-P2 OK
evidence_path: docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
cấm: seed · Dev reopen PASS maps · Phase1/PROD/:8088 · treat 8/8 as product GO
```

### ack_status

**READY_FOR_QC**

### evidence_path

`docs/qa/evidence/qa-hrm-u72-field-display-pack-01-20260727.md`  
(patched claims: `docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md`)
