# QC Gate Decision — QC-XBOS-U72-FIELD-DISPLAY-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-XBOS-U72-FIELD-DISPLAY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` (re-dispatch **qa** for pack repair) |
| **execution_date** | `2026-07-27` |
| **decision** | **NO-GO (process)** |
| **slice** | XBOS U72 field display / label — **local** `:5173` / `:5176` only |
| **qa_handoff** | `docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md` (claims **PASS** / `PASS_TO_PM`; F-09+F-10 CLOSED; 01..11 PASS) |
| **dev_entry** | `dev-fe-xbos-label-02-20260727.md` · `dev-fe-xbos-u72-f10-holding-path-01-20260727.md` |
| **spec** | `docs/xbos/SRS_FIELD_DISPLAY.md` AC-F-XBOS-01..11 · AC-F-XBOS-09/10 · BR-XBOS-COPY-01 |
| **rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` · U65 zero-seed |
| **persona** | `ceo@xe.vn` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · QA runtime `seed: false` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** · local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen** | **No** — process pack gap only; no Dev reopen for QA PASS AC rows |

---

## 1. Scope audited

**In scope (this gate):**
- AC-F-XBOS-01..11 with focus F-09 (Thuộc khối) + F-10 (Apply Catalog holding path) vs QA R2 evidence
- Evidence pack gate (`verify:qc:evidence-pack`) before any GO/GWC
- Wire `companyId=holding` allowed in Network (not a product FAIL)
- Soft P2: EN dataType · `job_titles` paren · CC toast `(holding)` — **do not block** future GWC
- Locks: U65 zero-seed · HOLD_DEPLOY · no Phase1/PROD/:8088 claim

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` · matrix Dev8088 promote · Dev reopen for PASS label surfaces

---

## 2. Evidence pack gate (blocking)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
→ FAIL: QC evidence pack incomplete (3/8 checks)
  - command_table: Include command table with exit codes (pnpm, adb, or node; PASS/FAIL or exit 0/1)
  - journey_l25: List at least one J-* journey id from PROGRAM_JOURNEY_MAP.md with PASS/FAIL
  - residual_section: Add ## Residual section (items + owner) or explicit "No residual"
```

| Check | Result |
|-------|--------|
| Pack integrity | **FAIL 5/8** — missing `command_table` + `journey_l25` + `residual_section` |
| Root cause | QA R2 MD has AC matrix with `\| **PASS**` and §4 Defects/residuals, but verify requires (1) command table with exit codes, (2) explicit `J-*` + PASS/FAIL, (3) heading `## Residual` (not only «Defects / residuals») |
| QA MD readable | Yes |
| Runtime JSON | Present · `_tmp-qa-xbos-u72-field-display-01-r2-runtime.json` · `overall: PASS` · `seed: false` · F-09/F-10 probes PASS · `networkWire.companyIdHoldingSeen: true` |
| Screenshots on disk | **14** PNGs under `docs/qa/evidence/screenshots/qa-xbos-u72-field-display-01-r2/` |

**Rule:** `.cursor/rules/qc-evidence-pack-gate.mdc` — verify FAIL ⇒ **NO-GO (process)** → return to **QA**, not Dev. QC **must not** issue GO/GWC.

---

## 3. Browser / screenshot audit (provisional — not promoted)

Runtime + MD + spot screenshots **corroborate** QA product claims. Listed for repair context only — **not** a GO.

| AC | QA claim | QC corroboration | Provisional |
|----|----------|------------------|-------------|
| **AC-F-XBOS-09** | Thuộc khối VI; wire `value=general` kept | Runtime: select/readonly display `Khối Thông tin chung`; `valueAttr=general`; `displayLeak=[]`; `badOptions=[]`; PNG `f09-infra-custom-fields.png` shows VI block nav | Would PASS |
| **AC-F-XBOS-10** | `Nguồn tập đoàn: tập đoàn`; no `\bholding\b` in panel; F5 clean | PNG `f10-apply-catalog.png`: source line `tập đoàn · version 7 · 4 mục`; runtime `holdingHits.lines=[]` · `hasXevnHoldingPath=false` · F5 OK | Would PASS |
| **Wire `companyId=holding`** | Allowed | Runtime `catalogBodies` include `…/config-sync/catalog/job_titles?…&companyId=holding` · `companyIdHoldingSeen=true` — **OK wire** | Would PASS (not FAIL) |
| **AC-F-XBOS-01..08, 11** | Spot PASS | Runtime fids all PASS + screenshots present | Would PASS |
| **AC-H-01/03/04/08/12** | Spot PASS | Runtime hids PASS; H-04 soft N/A OK | Would PASS |
| **U65 seed** | none | Runtime `seed: false`; QA MD seed none; UI note «không dùng seed» on Apply panel | Would PASS |

### Soft residual (pre-accepted for future GWC — not blocker of this NO-GO)

| ID | Severity | Note |
|----|----------|------|
| **R-U72-F09-DATATYPE-EN** | P2 | dataType options / meta still EN (`Text`/`Number`/`Date` / `text`·`date` in field list) — out of F-09 scope; **condition OK** |
| **R-U72-APPLY-JOB-TITLES-PAREN** | P2 | Dropdown `Chức danh (job_titles)` visible on Apply panel PNG — out of AC-F-XBOS-10; **condition OK** |
| **R-U72-CC-TOAST-HOLDING** | P2 | Optional CC toast `(holding)` outside Apply `allowed_paths` — not observed on Apply surface; **condition OK** |

### Classification

| Signal | Class | Action |
|--------|-------|--------|
| Pack missing `command_table` + `journey_l25` + `residual_section` | **PROCESS** | **NO-GO** → QA Layer B amend then re-gate QC |
| AC-F-XBOS-01..11 / F-09+F-10 browser claims | PRODUCT | Provisional closed — **no Dev reopen** |
| Soft P2 EN / job_titles paren / toast | PRODUCT P2 soft | Condition OK on future GWC — not Dev reopen now |
| Wire `companyId=holding` in Network | PRODUCT OK | Spec: display plane only; do not fail |

---

## 4. L2.5 journey coverage (U19)

| J-* | In-scope this gate? | Status under this decision |
|-----|---------------------|----------------------------|
| **J-XBOS-05** | Yes (infra custom fields / F-09 click path) | QA exercised CC infra wizard — **not cited as J-*** in pack → **not QC-promoted** until pack 8/8 |
| **J-XBOS-08** | Yes (catalog apply / F-10) | Apply Catalog surface exercised — **not cited as J-*** → not promoted |
| **J-CC-01** | Optional (login → CC) | Session path used — not cited |
| Other XBOS/CC J-* | No | Out of slice |

**NO-GO (process)** until QA adds explicit L2.5 / J-* matrix with `| **PASS**` rows (recommended: **J-XBOS-05** + **J-XBOS-08**; optional **J-CC-01**), plus command table + `## Residual`.

---

## 5. Conditions / locks (stand)

| ID | Statement | Owner |
|----|-----------|-------|
| **C-XBOS-U72-PACK-01** | Pack repair required before any GO/GWC on this work_item | **qa** |
| **C-XBOS-U72-HOLD-01** | **HOLD_DEPLOY** stands · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-XBOS-U72-P2** | EN dataType · job_titles paren · CC toast = **P2 condition OK** (no Dev reopen for PASS items) | **pm** / optional later **dev-fe** |
| **C-XBOS-U72-NO-DEV** | **No** Dev reopen for QA PASS AC rows unless pack re-gate finds product FAIL | **pm** |
| **C-XBOS-U72-WIRE-OK** | Network `companyId=holding` is **allowed** — not a product FAIL | **qa** / **qc** |

---

## 6. Decision

### **NO-GO (process)**

- Fail-closed: `verify:qc:evidence-pack` **5/8** (missing command table + journey + `## Residual`).
- Product/browser substance **looks** PASS for AC-F-XBOS-01..11 (F-09+F-10 CLOSED) — **cannot promote**.
- Soft P2 residuals **acknowledged OK** for future GWC — do **not** justify Dev reopen now.
- Wire `companyId=holding` **allowed**.
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088**.
- **No seed**. **No Dev reopen** for PASS label items.

---

## 7. Handoff

### completion_report

- **Closed:** QC audit of XBOS U72 field-display slice gate; pack verify executed (FAIL 3 checks); SRS AC-F-XBOS-09/10 + Dev FE handoffs cross-checked; screenshots/runtime spot-checked (F-09 VI bind · F-10 `tập đoàn` · wire holding OK); U65 no-seed + HOLD_DEPLOY + soft P2 note recorded.
- **Open / blocking:** QA evidence pack missing command table + `J-*`/L2.5 + `## Residual` → **NO-GO (process)**.
- **Residual (non-blocking product):** R-U72-F09-DATATYPE-EN; R-U72-APPLY-JOB-TITLES-PAREN; R-U72-CC-TOAST-HOLDING (all P2 soft).

### next_owner

`qa` (then `qc` re-gate same work_item)

### next_dispatch_prompt

```text
work_item_id: QA-XBOS-U72-FIELD-DISPLAY-PACK-01
from_role: pm
to_role: qa
lane: execution · U65 zero-seed · pack repair only (no product retest required unless pack edit breaks claims)
entry_criteria:
  - QC NO-GO (process): docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md
  - Source claims: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
exit_criteria:
  1) Patch QA R2 MD Layer B:
     - Add command table with runner (e.g. node scripts/qa/qa-xbos-u72-field-display-01-r2.mjs) + exit 0 / PASS
     - Add "## L2.5 journey matrix" with at least | J-XBOS-05 | infra custom fields / F-09 | **PASS** | and | J-XBOS-08 | Apply Catalog / F-10 | **PASS** | (tokens L2.5 / journey)
     - Rename/add "## Residual" (items + owner) listing P2 soft IDs; keep F-09/F-10 CLOSED
  2) Keep AC-F-XBOS-01..11 PASS · wire companyId=holding allowed · seed:none · HOLD_DEPLOY language
  3) Do NOT seed; do NOT reopen Dev for PASS items; do NOT claim Phase1/PROD/:8088
  4) Re-run: pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md → exit 0 (8/8)
  5) ack_status READY_FOR_QC → PM Task QC-XBOS-U72-FIELD-DISPLAY-01 re-gate (expect GWC local + C-XBOS-U72-P2)
evidence_path: docs/qa/evidence/qa-xbos-u72-field-display-01-r2-20260727.md
cấm: seed · Dev reopen for PASS AC · Phase1/PROD/:8088 claim
```

### evidence_path

`docs/qa/evidence/qc-xbos-u72-field-display-01-20260727.md`

### ack_status

**PASS_TO_PM**
