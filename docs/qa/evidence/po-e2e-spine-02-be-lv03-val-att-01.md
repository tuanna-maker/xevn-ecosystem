# PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01 — Catalog ốm VAL-ATT (LVT_02)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P0 |
| **entry** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` — LV-03 FAIL (POST 201 on `LVT_02` ≥3d no attach) |
| **spec_ref** | SRS `FR-UC-H03` · `BR-LEAVE-ATT-01` · API_CONTRACT_NEW §4.2 · `HRM-LEAVE-VAL-ATT` |
| **U65** | honored — no seed |
| **must_keep** | leave mount GWC · classic `sick` VAL-ATT · leave-workflow bridge · HOLD L2 ladder Dev |

---

## Root cause

`assertSickAttachmentIfRequired` early-returned unless `leave_type.toLowerCase() === 'sick'`. FE/catalog send **`LVT_02`** (picker Ốm) → rule skipped → **201**.

## Fix (FIX · CODE-MEMORY APPEND)

| Change | Detail |
|--------|--------|
| `isSickLeaveTypeCode` | Recognizes `sick` / `sick_leave` / **`LVT_02`** (+ label-as-code) |
| `isSickLeaveLabel` | VI «Ốm» / «Nghỉ ốm» (diacritic-normalized) |
| `catalogLeaveTypeIndicatesSick` | Catalog item via code · label · `metadata.is_sick` / `category` |
| `resolveIsSickLeaveType` | Code-first; else effective `leave_types` item classify |
| `assertSickAttachmentIfRequired` | Takes `isSick` boolean → `HRM-LEAVE-VAL-ATT` when ≥3d and no `attachment_url` |
| `leaveTypeLabelVi` | `lvt_02` → `Ốm` (display-ready) |
| CODE-MEMORY | APPEND `PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01` |

**Files:** `apps/api/hrm-api/src/attendance/leave-requests.service.ts` · `.spec.ts`

**Not in scope:** L2 ladder Dev (HOLD) · FE attach UI (LV-04) · invent day ladder N.

---

## Jest evidence

```bash
pnpm --filter hrm-api exec jest --testPathPatterns=leave-requests.service.spec --no-coverage
# 2026-08-03 RE-DISPATCH re-verify: Test Suites: 1 passed · Tests: 33 passed · EXIT 0
```

| Case | Expected | Result |
|------|----------|--------|
| Classic `sick` ≥3 no attach | `HRM-LEAVE-VAL-ATT` | ✅ |
| Catalog `LVT_02` ≥3 (5d) no attach | `HRM-LEAVE-VAL-ATT` · no INSERT | ✅ |
| `LVT_02` &lt;3 (2d) no attach | create OK · label `Ốm` | ✅ |
| Catalog `LVT_99` label Ốm + `metadata.is_sick` ≥3 | `HRM-LEAVE-VAL-ATT` | ✅ |
| Helpers: LVT_02 / Ốm / is_sick · LVT_01 not sick | true/false | ✅ |
| Prior G-AT10 / display / balance / lazy-pull | regression | ✅ |

---

## QA retest (copy-ready)

**work_item_id:** `PO-E2E-SPINE-02-WEB-QA-W1-R1`  
**Focus:** LV-03 — ốm catalog `LVT_02` · `total_days≥3` · `attachment_url=null` → POST **4xx** `HRM-LEAVE-VAL-ATT` (not 201 / not only OVERLAP).  
**Persona:** `ceo@xe.vn` · `company_id=main` · U65 zero-seed · browser FE path.  
**must_keep:** leave mount GWC.  
**Parallel residual:** LV-04 attach FE still BLOCKED until `R-SPINE-LV04-ATTACH-FE-01`.  
**cấm:** seed · invent L2 ladder · claim UAT DONE.

---

## completion_report

**Closed:** BR-LEAVE-ATT-01 enforced for catalog ốm (`LVT_02` + label + metadata flag); classic sick preserved; &lt;3 days OK; CODE-MEMORY APPEND; jest leave-requests **33/33**; orphan W1-B-01 reject `it` moved into describe (TS1128 hygiene).

**Residual:** LV-04 FE attach UI; web approve UX; LV-02 ladder SPEC_GAP (BA); manager hierarchy (mob) — out of this WI.

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/po-e2e-spine-02-be-lv03-val-att-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-02-WEB-QA-W1-R1
role: qa
priority: P0
mission: Retest LV-03 after BE VAL-ATT catalog fix — LVT_02 ≥3d no attach must POST 4xx HRM-LEAVE-VAL-ATT (not 201). Browser FE · ceo@xe.vn · company_id=main · U65 no seed · must_keep leave mount GWC. Cite entry docs/qa/evidence/po-e2e-spine-02-be-lv03-val-att-01.md + prior po-e2e-spine-02-web-qa-w1.md. Evidence docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md. LV-04 still BLOCKED without FE attach unless R-SPINE-LV04-ATTACH-FE-01 landed. cấm seed · invent L2 ladder · UAT DONE claim.
```
