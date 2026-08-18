# QA-XBOS-U72-FIELD-DISPLAY-PACK-01 — Layer B evidence pack repair

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-U72-FIELD-DISPLAY-PACK-01` |
| **Date** | 2026-07-27 |
| **Role** | qa |
| **lane** | execution · **process repair only** · U65 zero-seed |
| **Trigger** | QC `QC-XBOS-U72-FIELD-DISPLAY-01` = **NO-GO (process)** · condition **C-XBOS-U72-PACK-01** |
| **Prior QC** | `docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md` |
| **Source / patched QA MD** | `docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md` |
| **Product retest** | **Not required** for pack wording — product AC-F-XBOS-01..11 **PASS** kept; F-09/F-10 **CLOSED** |
| **Seed** | **none** |
| **Dev reopen PASS items** | **No** |
| **Phase1 / PROD / :8088** | **NOT claimed** · **HOLD_DEPLOY** stands |
| **Wire holding** | `companyId=holding` **allowed** (display plane) |
| **ack_status** | **READY_FOR_QC** |

---

## 1. Root cause (process)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
→ FAIL: QC evidence pack incomplete (3/8 checks)
  - command_table: Include command table with exit codes …
  - journey_l25: List at least one J-* journey id … with PASS/FAIL
  - residual_section: Add ## Residual section (items + owner) or explicit "No residual"
```

QA R2 MD had AC matrix with `| **PASS**` and §4 «Defects / residuals», but verify requires (1) command table with exit codes, (2) explicit `J-*` + L2.5/journey tokens, (3) heading `## Residual`.

Rule: `.cursor/rules/qc-evidence-pack-gate.mdc` — verify FAIL ⇒ return to QA, not Dev.

---

## 2. Patch applied (Layer B fields)

Patched **same file** `qa-xbos-u72-field-display-01-r2-20260727.md`:

| Layer B field | Added / updated |
|---------------|-----------------|
| `work_item_id` + pack repair id | header table |
| `ack_status` | **READY_FOR_QC** |
| Portal URL / `PORTAL_DEV_URL` | header |
| **HOLD_DEPLOY** · seed:none · NOT Phase1/PROD/:8088 | header + Classification |
| `## 4. L2.5 journey matrix` | **J-XBOS-05** … F-09 `| **PASS**` · **J-XBOS-08** … F-10 `| **PASS**` |
| Read-only module matrix | Org/KPI/policy · infra · Apply Catalog · AC-H |
| `## Residual` | F-09/F-10 **CLOSED** + P2 soft IDs + owner |
| `## Classification` | PROCESS closed · PRODUCT PASS · wire OK · P2 soft |
| `## Command table` | node runner + verify exit **0** |

**Not changed:** AC-F-XBOS-01..11 remain **PASS**; F-09/F-10 remain **CLOSED**; wire `companyId=holding` **allowed**; soft P2 residuals retained as condition OK; seed:none; HOLD_DEPLOY.

---

## 3. Verify re-run (exit 0)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS (was FAIL) |
| portal_url | PASS |
| journey_l25 | PASS (was FAIL) |
| crud_or_matrix | PASS |
| residual_section | PASS (was FAIL) |
| timestamp | PASS |

---

## 4. Condition status (for QC)

| ID | Status after repair |
|----|---------------------|
| **C-XBOS-U72-PACK-01** | **Ready to CLOSE** on QC re-gate (pack 8/8) |
| **C-XBOS-U72-HOLD-01** | Stands (PM) — HOLD_DEPLOY · NOT Phase1/PROD/:8088 |
| **C-XBOS-U72-P2** | Stands — EN dataType · job_titles paren · CC toast = P2 soft **condition OK** |
| **C-XBOS-U72-NO-DEV** | Stands — **no** Dev reopen for PASS AC rows |
| **C-XBOS-U72-WIRE-OK** | Stands — Network `companyId=holding` **allowed** |
| Product AC-F-XBOS-01..11 | **PASS** retained — expect **GWC** (not full GO without P2 conditions) |

---

## 5. Handoff

### completion_report

**Closed:** Process pack gap that caused QC NO-GO — added `## Command table` (runner exit **0**), `## L2.5 journey matrix` (**J-XBOS-05** F-09 `| **PASS**` · **J-XBOS-08** F-10 `| **PASS**`), `## Residual` (P2 soft + F-09/F-10 **CLOSED**) to `qa-xbos-u72-field-display-01-r2-20260727.md`. `verify:qc:evidence-pack` **exit 0 (8/8)**. No seed. No product retest for pack wording. No Dev reopen of PASS AC. No Phase1/PROD claim. Product PASS + wire holding allowed kept for QC GWC.

**Residual:** P2 soft only — R-U72-F09-DATATYPE-EN · R-U72-APPLY-JOB-TITLES-PAREN · R-U72-CC-TOAST-HOLDING (owners defer **dev-fe**; condition OK).

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-XBOS-U72-FIELD-DISPLAY-01
from_role: pm
to_role: qc
lane: governance · re-gate after pack repair · expect GWC
entry_criteria:
  - Prior NO-GO (process): docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md · C-XBOS-U72-PACK-01
  - Pack repair DONE: docs/qa/evidence/qa-xbos-u72-field-display-pack-01-20260727.md
  - Patched QA MD: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md · ack READY_FOR_QC
  - pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md → exit 0 (8/8)
  - Product: AC-F-XBOS-01..11 PASS · F-09/F-10 CLOSED · wire companyId=holding allowed
  - U65 · HOLD_DEPLOY · local only · seed:none
exit_criteria:
  1) Confirm pack 8/8; close C-XBOS-U72-PACK-01
  2) Product: expect GO WITH CONDITIONS — C-XBOS-U72-P2 (EN dataType · job_titles paren · CC toast soft)
  3) Keep HOLD_DEPLOY · NOT Phase1/PROD/:8088; C-XBOS-U72-WIRE-OK; no Dev reopen PASS
evidence_path: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
cấm: seed · Dev reopen PASS · Phase1/PROD/:8088 claim
```

### evidence_path

`docs/qa/evidence/qa-xbos-u72-field-display-pack-01-20260727.md`

### ack_status

**READY_FOR_QC**

### pm_dispatch_hint

`QC-XBOS-U72-FIELD-DISPLAY-01` re-gate — close **C-XBOS-U72-PACK-01** · expect **GWC** + **C-XBOS-U72-P2** · HOLD_DEPLOY
