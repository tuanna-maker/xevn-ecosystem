# PO-HRM-BP-UC-GAP-W3-SYNTH-01 — Evidence (SA W3 synth)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-UC-GAP-W3-SYNTH-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance |
| **priority** | P0 |
| **program** | `PO-HRM-BP-UC-GAP-01` · Wave **W3** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-05 |
| **program_verdict** | **NOT_READY** |
| **ready_for_techspec** | **false** |
| **uat_done** | `false` |
| **Attendance CLOSED** | **false** |
| **Employees CLOSED** | **false** |
| **customer_signed (D7)** | **false** |
| **no_prompt_echo** | true (no customer-facing invent) |

---

## Entry criteria

| Prerequisite | Status | Evidence |
|--------------|--------|----------|
| `PO-HRM-BP-ATT-DEEP-GAP-BA-01` | **CLOSED** | `po-hrm-bp-att-deep-gap-ba-01.md` · matrix **v1.1.1** → rolled to **1.1.2** |
| `PO-HRM-BP-WBS-FROM-GAP-01` | **CLOSED** | `po-hrm-bp-wbs-from-gap-01.md` · UC_CHOT **v1.1** · 45 UC · 02b **18 MISSING** |
| WBS residual «wait ATT-DEEP-GAP-BA» | **STALE** | ATT-DEEP-GAP-BA already PASS — ignored for W3 gate |
| Deep ATT browser | **CLOSED** | `po-hrm-bp-att-deep-qa-01.md` |
| Inventory deep | **CLOSED (code)** | `ATT_SURFACE_INVENTORY_DEEP.md` S01–S90 |
| SYNTHESIS / SRS / Inventory | Read | `SYNTHESIS_MASTER_HRM_ENTERPRISE.md` · SRS **v0.7** · UC_INVENTORY **0.3.3** |

---

## Program exit §4 (honest)

| Criterion | Result |
|-----------|--------|
| ATT deep inventory ≥ code surface (0 miss) | **PASS** |
| Gap matrix covers D1–D8 + R/C/A/P | **PASS** (matrix v1.1.2) |
| WBS Excel rows → UC ids | **PASS** (UC_CHOT v1.1) |
| SRS: mỗi luồng họp có UC hoặc GĐ2/OUT rõ | **FAIL** (SRS_THIN Lịch + propose-only 03d/03e/05b) |
| Explicit READY \| NOT_READY + gap list | **PASS** → **NOT_READY** |

Program file updated: `docs/program/HRM_BP_MEETING_UC_GAP_PROGRAM.md` §4 + W3 status block.

---

## Verdict

### **NOT_READY** — không mở W4 TechSpec depth / không Dev `apps/**`

Machine-readable blockers (SoT also in matrix §1.1):

```yaml
program_verdict: NOT_READY
ready_for_techspec: false
blockers:
  - { id: D7, status: OPEN, class: PAPER_UNSIGNED }
  - { id: Q-PAY-FORMULA, status: OPEN, class: Q_OPEN, note: authoring_engine_flag_only }
  - { id: Q-REC-HEADCOUNT, status: OPEN, class: Q_OPEN }
  - { id: Q-LEAVE-ACCRUAL, status: OPEN, class: Q_OPEN }
  - { id: Q-LEAVE-UNIT, status: OPEN, class: Q_OPEN }
  - { id: Q-SI-SUSPEND, status: OPEN, class: Q_OPEN }
  - { id: Q-ASSET-MODULE, status: OPEN, class: Q_OPEN }
  - { id: Q-XBOT-PROFILE, status: OPEN, class: Q_OPEN }
  - { id: ATT-18-MISSING, status: PARTIAL, class: MISSING_NESTED_RO, wbs_02b: stamped, fidelity_rows: still_MISSING }
  - { id: SRS_THIN, status: OPEN, approx_uc: 29 }
  - { id: PRODUCT_STUB_ATT_SETTINGS, status: OPEN }
  - { id: PRODUCT_MISSING, status: OPEN, items: [ATT-03b, CORE-04_OCR, PAY-04_split_UI] }
  - { id: PROPOSE_ONLY_UC, status: OPEN, uc: [UC-BP-ATT-03d, UC-BP-ATT-03e, UC-BP-ATT-05b] }
  - { id: REC_PAY_FIDELITY_U65, status: OPEN }
```

### Top blockers (sponsor-facing order)

1. **D7** — giấy chưa ký; pause code/demo đến paper chốt.
2. **Q-*** packet mở — tối thiểu Q-PAY-FORMULA (authoring/engine) · Q-LEAVE-ACCRUAL · Q-LEAVE-UNIT · Q-REC-HEADCOUNT · Q-SI-SUSPEND (+ Q-ASSET / Q-XBOT).
3. **SRS_THIN** — ~29 UC «Lịch» (A3–A5 loại phép / quỹ / holiday) chưa Diễn biến chốt.
4. **Propose-only** UC-BP-ATT-**03d / 03e / 05b** — chưa ADD SRS (GPS sites · QR card · quỹ phép).
5. **18 MISSING** — Excel 02b **đã stamp**; fidelity # + nested RO vẫn residual (PARTIAL).
6. **PRODUCT_STUB / PRODUCT_MISSING** — ATT settings/roster stub · holiday absent · PAY featureInDev honesty.

### must_keep verified

| Lock | OK |
|------|----|
| D7 pause code until paper | yes |
| Ban unfinished-PAY meeting wording | yes |
| Q-PAY-FORMULA = authoring/engine only | yes |
| uat_done false · Attendance CLOSED false · Employees CLOSED false | yes |
| no apps/** · no PAY API re-depth | yes |
| no invent Q-* · no claim customer signed · no wipe SRS | yes |

---

## Artifacts touched

| Path | Change |
|------|--------|
| `docs/program/HRM_BP_MEETING_UC_GAP_PROGRAM.md` | §4 checkboxes PASS/FAIL + W3 status 2026-08-05 |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md` | **v1.1.2** DOC-DELTA · §1.1 YAML · §9 reorder · §13 log |
| This evidence | W3 synth |

---

## Unlock criteria (before any W4)

```text
1) D7 paper signed (customer) — HARD gate for TechSpec depth AND Dev apps/**
2) Q-min packet answered (no invent): Q-PAY-FORMULA + Q-LEAVE-ACCRUAL + Q-LEAVE-UNIT + Q-REC-HEADCOUNT
3) SRS_THIN MVP policy: expand FR OR explicit GĐ2/OUT/waiver on meeting spine
4) Customer IN/OUT on UC_CHOT sheet 02b (18) + decide ADD propose UC-03d/03e/05b
5) Only then: W4 TechSpec/API/DB depth papers — STILL no apps/** until D7
```

---

### completion_report

Closed **PO-HRM-BP-UC-GAP-W3-SYNTH-01**: synthesized ATT deep gap BA (**CLOSED**) + WBS UC_CHOT v1.1 (**CLOSED**; prior «wait ATT-DEEP» residual **STALE**). Program §4: 4/5 PASS, **SRS completeness FAIL**. Matrix **v1.1.2** DOC-DELTA with §1.1 machine gap list. **program_verdict = NOT_READY** — blockers D7 · Q-* · SRS_THIN · propose-only 03d/03e/05b · 18-MISSING PARTIAL · PRODUCT_STUB/MISSING. **Không** READY_FOR_TECHSPEC · **không** claim Attendance/Employees CLOSED · **uat_done false**. No apps/** · no PAY API re-depth · no Q-* invent · no SRS wipe.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-PAPER-PACKET-01
from_role: pm
to_role: ba-docs (+ pm sponsor workshop)
lane: governance
priority: P0
program: PO-HRM-BP-UC-GAP-01

CONTEXT: W3 synth PASS_TO_PM — verdict NOT_READY (evidence po-hrm-bp-uc-gap-w3-synth-01.md).
W4 TechSpec depth = HOLD. D7 unsigned. Do NOT dispatch Dev apps/**. Do NOT reopen PAY API depth.

entry_criteria:
  - docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md PASS_TO_PM
  - UC_MEETING_PRODUCT_GAP_MATRIX.md v1.1.2 §1.1 blockers
  - WBS_HRM_ENTERPRISE_UC_CHOT.xlsx v1.1 (01 + 02b + 03 G-*)
  - SRS_HRM_ENTERPRISE.md v0.7 · UC_INVENTORY 0.3.3

exit_criteria (paper unblock — NOT code):
  1) Sponsor decision packet (1–2 trang nội bộ hoặc sheet ký):
     - D7: xác nhận giấy / tạm dừng code (ký hoặc lịch họp ký)
     - Q-min: Q-PAY-FORMULA (authoring/engine only) · Q-LEAVE-ACCRUAL · Q-LEAVE-UNIT · Q-REC-HEADCOUNT · Q-SI-SUSPEND
     - Sheet 02b 18 MISSING: từng dòng IN / OUT / GĐ2
     - Propose UC-BP-ATT-03d / 03e / 05b: ADD SRS sau ký khung OR defer GĐ2
     - SRS_THIN MVP: list UC «Lịch» spine → expand OR waiver/GĐ2
  2) Ban «họp lương chưa xong»; PAY meeting = complete; Q-PAY-FORMULA ≠ unfinished meeting
  3) Evidence docs/qa/evidence/po-hrm-bp-uc-gap-w3-paper-packet-01.md
  4) Sau packet + D7 signed ONLY → PM may open W4 TechSpec depth (docs only) — still NO apps/**

cấm: invent Q-* answers · claim READY_FOR_TECHSPEC · claim customer signed without file · wipe SRS · apps/** · seed · Attendance/Employees CLOSED · uat_done true

must_keep: D7 pause · Face #9 GĐ2 · matrix 1.1.2 · UC_CHOT v1.1 · U65 zero-seed
```

### evidence_path

`docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md`

### ack_status

**PASS_TO_PM**
