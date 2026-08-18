# PO-HRM-BP-UC-GAP-W3-PAPER-PACKET-01 — Evidence (ba-docs)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-UC-GAP-W3-PAPER-PACKET-01` |
| **from_role** | pm |
| **to_role** | ba-docs |
| **lane** | governance |
| **priority** | P0 |
| **program** | `PO-HRM-BP-UC-GAP-01` · post-W3 |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-05 |
| **no_prompt_echo** | true (sponsor packet: tiếng Việt đơn giản; không invent Q-* answers) |

---

## Entry criteria (read)

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-bp-uc-gap-w3-synth-01.md` | YES — blockers YAML · unlock criteria |
| `UC_MEETING_PRODUCT_GAP_MATRIX.md` v1.1.2 §1 / §1.1 | YES |
| `SPONSOR_CHOT_FILL_SHEET.md` | YES — primary fill (MERGE/upgrade, no parallel sheet) |
| `MASTER_DATA_CONFIG_CLASSIFICATION.md` §4 | YES — MD-S* already on fill sheet |
| `SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` | Link only in packet + README |
| `DECISION_PACKET_Q_PAY_FORMULA.md` | Checklist item |
| `WBS_UC_CHOT_README.md` + 02b 18 MISSING | YES — decision table S03…S75 |
| `HRM_BP_MEETING_UC_GAP_PROGRAM.md` §4 | YES — NOT_READY posture |

---

## Artifacts delivered

| Path | Change |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/W3_PAPER_PACKET_SPONSOR.md` | **CREATE** — workshop index (1-page purpose · checklist · blocker→cell map · 18+PROP decisions · Lịch expand/waiver · unlock criteria) |
| `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_CHOT_FILL_SHEET.md` | **UPGRADE ADD** — header → W3 packet · note after Q-ATT-MISSING · **§7** PROP-03d/03e/05b · PM-HOLIDAY/OCR/SPLIT · ATT-STUB · **§8** LICH-* · confirm + handoff wording |
| `docs/client-delivery/hrm-enterprise-blueprint/README_SPONSOR_REVIEW.md` | **UPDATE** — W3_PAPER_PACKET as workshop entry #0; WBS 1.1; unlock pointer |

---

## must_keep verified

| Lock | OK |
|------|----|
| D7 HOLD code until paper | yes |
| Q-PAY-FORMULA = authoring/engine only | yes |
| PAY meeting complete (no unfinished-PAY wording) | yes |
| matrix NOT_READY until answers | yes — packet §6 does not claim READY |
| No invent Q-* answers | yes |
| No wipe FR / no apps/** | yes |
| No second competing fill sheet | yes — merge into CHOT_FILL + index |
| Attendance CLOSED / Employees CLOSED / uat_done | **not claimed** |

---

## Residual for sponsor (open — paper)

1. **D7** unsigned — fill sheet §0.  
2. **Q-min** unanswered: Q-PAY-FORMULA · Q-LEAVE-ACCRUAL · Q-LEAVE-UNIT · Q-REC-HEADCOUNT (+ Q-SI-SUSPEND recommended).  
3. **Excel 02b / packet §4.1** — 18 lines need IN MVP giấy / GĐ2 / OUT / DEFER.  
4. **PROP-03d · 03e · 05b** — fill sheet §7.1.  
5. **LICH-ATT** (minimum) — fill sheet §8 or packet §5.1.  
6. Optional: UI open questions · MD-S* · PM-* · ATT-STUB.

**program_verdict remains NOT_READY** until residuals closed + D7 signed. **Do not** claim READY_FOR_TECHSPEC from this wave.

---

### completion_report

Closed **PO-HRM-BP-UC-GAP-W3-PAPER-PACKET-01**: one sponsor-facing workshop index `W3_PAPER_PACKET_SPONSOR.md` merges existing fill sheets (no parallel questionnaire). Upgraded `SPONSOR_CHOT_FILL_SHEET.md` with ADD-only §7/§8 cells mapping W3 blockers (PROP · PM-* · ATT-STUB · LICH). Pointed `README_SPONSOR_REVIEW.md` entry to W3 packet. Unlock criteria documented without claiming READY_FOR_TECHSPEC. Banned unfinished-PAY wording; D7 HOLD preserved; no apps/**; no invent Q-*.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-UC-GAP-W3-SPONSOR-WORKSHOP-01
from_role: pm
to_role: pm (sponsor workshop) → ba-process after answers
lane: governance
priority: P0
program: PO-HRM-BP-UC-GAP-01

CONTEXT: Paper packet READY. Matrix still NOT_READY. D7 unsigned.

entry_criteria:
  - docs/client-delivery/hrm-enterprise-blueprint/W3_PAPER_PACKET_SPONSOR.md
  - SPONSOR_CHOT_FILL_SHEET.md (§0–§1 P0 + §7 + §8)
  - WBS_HRM_ENTERPRISE_UC_CHOT.xlsx sheet 02b
  - DECISION_PACKET_Q_PAY_FORMULA.md

exit_criteria (sponsor workshop OR async fill):
  1) D7-1/D7-2 answered (+ schedule if unsigned)
  2) Q-min: Q-PAY-FORMULA · Q-LEAVE-ACCRUAL · Q-LEAVE-UNIT · Q-REC-HEADCOUNT
  3) 18 MISSING rows IN/GĐ2/OUT/DEFER (packet §4.1 or Excel 02b)
  4) PROP-03d/03e/05b decided
  5) LICH-ATT policy EXPAND|GĐ2|OUT|WAIVER
  6) Evidence path for answers → then DISPATCH ba-process:
     work_item_id: PO-HRM-BP-UC-GAP-W3-MATRIX-APPLY-01
     to_role: ba-process
     exit: update UC_MEETING_PRODUCT_GAP_MATRIX Q-* + 02b decisions; keep NOT_READY until D7 signed; no invent; no READY_FOR_TECHSPEC until unlock §6

cấm: apps/** · invent Q-* · claim customer signed without file · wipe SRS · unfinished-PAY wording · Attendance/Employees CLOSED

OR if answers already returned in same session → skip workshop Task; DISPATCH ba-process MATRIX-APPLY immediately.
```

### evidence_path

`docs/qa/evidence/po-hrm-bp-uc-gap-w3-paper-packet-01.md`

### ack_status

**PASS_TO_PM**
