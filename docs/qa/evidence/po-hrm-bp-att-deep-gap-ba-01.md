# PO-HRM-BP-ATT-DEEP-GAP-BA-01 — Evidence (ba-process DOC-DELTA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-DEEP-GAP-BA-01` |
| **from_role** | pm |
| **to_role** | ba-process |
| **lane** | governance |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **matrix** | `docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md` **v1.1.1** |
| **qa_source** | `docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md` |
| **runtime_log** | `docs/qa/professional/menu-fidelity/ATT_DEEP_QA_RUNTIME_LOG.md` |
| **inventory** | `docs/qa/professional/menu-fidelity/ATT_SURFACE_INVENTORY_DEEP.md` |
| **Date** | 2026-08-05 |
| **uat_done** | `false` (ATT) |
| **Attendance CLOSED** | **false** |
| **READY_FOR_TECHSPEC** | **false** (verdict remains **NOT_READY**) |

## Entry criteria met

- [x] Deep QA evidence `PASS_TO_PM` (late PM intake after aborted turn)
- [x] Runtime log present
- [x] Inventory deep S01–S90 SoT
- [x] Matrix v1.1 baseline (delta only — no full rewrite)
- [x] SYNTHESIS A1–A6 referenced

## Exit deliverables

### 1. Matrix DOC-DELTA 1.1.1

| Change | Location |
|--------|----------|
| Deep ATT browser **AWAIT → CLOSED** citing `po-hrm-bp-att-deep-qa-01.md` | Header · §1 #1 · §6 intro · §6.1 · §9 · §12 |
| A1–A6 gap rows (`PRODUCT_STUB` / `SPEC_GAP` / `PRODUCT_MISSING` + matrix # + inv_id) | **§5.1** |
| Residual 18 MISSING vs browser RO | **§6.3** |
| UC expand sketches S15 / S74 / S43 (propose-only) | **§10.1** |
| Verdict stays **NOT_READY** — no `READY_FOR_TECHSPEC` | §1 · §13 |

### 2. A1–A6 delta summary (stamp)

| A# | gap_class | matrix # | inv_id (key) |
|----|-----------|----------|--------------|
| A1 | **PRODUCT_STUB** | #16 LIVE · #17–18 STUB · #42 STUB | S35–S41 · S81 · S48 |
| A2 | **SPEC_GAP** | #11–14 LIVE · #15 OBS · #30 PARTIAL | S23–S34 · S62–S63 |
| A3 | **PRODUCT_STUB** (CFG) + **SRS_THIN** (types/balance) | #19/#28 LIVE · #41 STUB | S80 · **S43** |
| A4 | **SRS_THIN** | leave LIVE · BH cross CORE | S42 · CORE-10 |
| A5 | **PRODUCT_STUB** + **PRODUCT_MISSING** | #17 STUB · holiday absent | S40 · ATT-03b |
| A6 | **SPEC_GAP** (QR) · **UNMAPPED_PRODUCT** (S15/S74) · GĐ2 Face | #7/#10 LIVE · #8 PARTIAL · #9 GĐ2 | **S15–S16** · **S74–S75** |

### 3. UC expands proposed (not added to SRS)

| proposed_uc_id | inv | Scope sketch |
|----------------|-----|--------------|
| **UC-BP-ATT-03e** | S15–S16 | Thẻ QR NV + dialog · GET 2xx + F5 |
| **UC-BP-ATT-03d** | S74–S75 | GPS work-sites under App rules · mutate AC |
| **UC-BP-ATT-05b** | S43 | Quỹ phép panel · balance/hold/chuyển kỳ |

### 4. must_keep / cấm verified

| Lock | Status |
|------|--------|
| U65 zero-seed | OK — no seed in this seat |
| D7 HOLD | OK — still open blocker §1 #6 |
| Face #9 GĐ2 | OK — MEETING_ONLY_GĐ2 |
| PAY meeting complete wording | OK — no unfinished-PAY |
| Attendance CLOSED | **not claimed** |
| `uat_done` true | **not claimed** |
| apps/** | **not touched** |
| Invent Q-* answers | **not done** |
| Wipe SRS | **not done** |

## Residuals (for PM / W3)

| ID | Note | Owner |
|----|------|-------|
| R-18-MISSING-WBS | 18 inv still need Excel/fidelity stamp | ba-docs `WBS-FROM-GAP` |
| R-SRS-THIN-ATT | A3–A5 FR Lịch / Diễn biến | ba-docs when PM opens |
| R-Q-OPEN | Q-PAY-FORMULA · Q-LEAVE-* · Q-REC-HEADCOUNT | PM → khách |
| R-NESTED-DIALOG-RO | S15/S25/S28/S74 dialogs not RO-opened | qa P2 optional |
| R-NOT-READY-W3 | TechSpec expand blocked until W3 exit criteria | pm / synth |

## Artifacts updated

- `docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md` → **v1.1.1**
- This evidence file

---

### completion_report

Closed **PO-HRM-BP-ATT-DEEP-GAP-BA-01**: DOC-DELTA matrix **1.1.1** — Deep ATT browser stamp **CLOSED** from `po-hrm-bp-att-deep-qa-01.md`; §5.1 A1–A6 gap_class with matrix # + inv_id; §6.3 residual MISSING; §10.1 propose-only UC expands for **S15 (03e)**, **S74 (03d)**, **S43 (05b)**. Verdict remains **NOT_READY** (no READY_FOR_TECHSPEC). **uat_done false** · **Attendance not CLOSED**. No apps/** · no SRS wipe · no Q-* invent.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-SYNTH-01
from_role: pm
to_role: sa (or ba-docs if WBS-FROM-GAP-01 still OPEN — run that first)
lane: governance
priority: P0

entry_criteria:
  - UC_MEETING_PRODUCT_GAP_MATRIX.md v1.1.1 DOC-DELTA CLOSED browser
  - evidence docs/qa/evidence/po-hrm-bp-att-deep-gap-ba-01.md PASS_TO_PM
  - if WBS-FROM-GAP-01 open: complete 18 MISSING stamp before synth READY_FOR_TECHSPEC check

exit_criteria:
  - Synthesize A1–A6 + §6.3 residuals into W3 backlog / WBS rows
  - Keep NOT_READY until: 18 MISSING WBS · SRS_THIN MVP policy · Q-* packet · D7
  - Do NOT flip READY_FOR_TECHSPEC without exit criteria in matrix §1
  - Do NOT claim Attendance CLOSED / uat_done true
  - PAY: meeting-complete wording only; no unfinished-PAY; no redo PAY-API

must_keep: U65 · D7 · Face #9 GĐ2 · matrix 1.1.1 browser CLOSED stamp
cấm: wipe SRS · invent Q-* · seed · apps/** mutate for this governance seat
evidence_path: docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md (or wbs-from-gap evidence if that seat first)
```

### evidence_path

`docs/qa/evidence/po-hrm-bp-att-deep-gap-ba-01.md`

### ack_status

**PASS_TO_PM**
