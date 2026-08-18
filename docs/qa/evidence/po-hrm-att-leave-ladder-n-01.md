# Evidence — PO-HRM-ATT-LEAVE-LADDER-N-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-LADDER-N-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-06 |
| **ack_status** | **PASS_TO_PM** |
| **decision** | **WAIVE_L2_PHASE1** (recommended · awaiting PM bus stamp) |
| **spec_path** | `docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md` |
| **cấm** | `apps/**` · invent production `N` · claim `attendance_uat_ready` · 🟢 LV-02 |

---

## 0. Mission ack

| Requested | Delivered |
|-----------|-----------|
| A Option matrix (1) N=X · (2) WAIVE · (3) other WF | §1 below + full matrix in spec |
| B Recommended + rationale + residual | **(2) WAIVE** · §2 |
| C Copy-ready ba-docs DOCS-01 for CHOSEN | §3 (WAIVE text merge) |
| D No attendance_uat_ready claim | Explicit false |

---

## 1. Read ack (ordered)

| # | Artifact | Outcome |
|---|----------|---------|
| 1 | `PO-HRM-E2E-LINK-ATT-SPEC-01.md` §4.1 §5 P0-1 | Ladder EXPAND needs N **or** WAIVE; P0-1 = ba-docs after chốt |
| 2 | `po-e2e-ba-case-matrix-01.md` GAP-LEAVE-LADDER-01 | No day cut in SRS/WF/HDSD; LV-02 🟡 SPEC_GAP; cấm invent N |
| 3 | `workflow-catalog.constants.ts` leave def | **1 step** `manager_approval` / `direct_manager` only |
| 4 | `leave-workflow.bridge.ts` | Spawn `hrm_leave_approval`; no total_days branch |
| 5 | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-09 | Single QL duyệt + hold quỹ — no L2 day ladder |
| 6 | Prior `po-e2e-leave-ladder-sa-01` … `qc-docs-01` | Option A configurable; ASSUMPTION T_L1=3; Dev HOLD; Q-LEAVE-LADDER-01 OPEN |
| 7 | HDSD CH06 / leave inventory | No «Số ngày → người duyệt» table |
| 8 | Bus sponsor CONFIRM T_L1 | **Not found** |

---

## 2. Option matrix (summary)

| Option | Eligible? | Verdict |
|--------|-----------|---------|
| **(1) N=X from evidence** | **No** — X missing; ASSUMPTION 3 ≠ evidence lock | **REJECT invent** |
| **(2) WAIVE L2 Phase-1** | **Yes** — matches AS-IS WF + ATT-09 | **RECOMMENDED** |
| **(3a) WF other ladder** | No second step / no day condition in catalog | N/A (= supports 2) |
| **(3b) Always L1+L2** | Design-only prior Option C | Not chosen |
| **(3c) Configurable T_L1 Option A** | Design pack exists; runtime HOLD | **PRESERVE backlog** — not Phase-1 N lock |

### Recommended

**WAIVE_L2_PHASE1** — Phase-1 AC = 1-step `direct_manager`; LV-02 / numeric BR-LEAVE-LADDER-01 **WAIVED_P1**; production `N`/`T_L1` **NOT_LOCKED**; Option A docs **preserved** for reopen.

### Residual (top)

- R1 honesty «hai cấp» misread as LIVE  
- R2 Dev hardcode N=3  
- R3 false ATT UAT from sheet+ L1  
- R4 SoT path hygiene for prior NEW pack  
- R5 sponsor later wants L2 → reopen path  

---

## 3. Copy-ready next_dispatch (CHOSEN = WAIVE)

```text
work_item_id: PO-HRM-ATT-LEAVE-LADDER-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P0
ack_target: PASS_TO_PM
change_mode: ADD / DOC-DELTA only · no wipe FR ATT/H03 · no_prompt_echo: true
CHOSEN: WAIVE_L2_PHASE1 (SA PO-HRM-ATT-LEAVE-LADDER-N-01 — PM stamp confirm-on-bus trước hoặc cùng wave)

ENTRY:
- Read: docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md
- Read: docs/program/specs/PO-HRM-E2E-LINK-ATT-SPEC-01.md §4.1 §5 P0-1
- Read: docs/qa/evidence/po-e2e-ba-case-matrix-01.md GAP-LEAVE-LADDER-01
- Read: docs/qa/evidence/po-e2e-leave-ladder-sa-01.md (Option A PRESERVE backlog)
- PM bus CONFIRM WAIVE_L2_PHASE1 (hoặc attach stamp trong packet)

MISSION (docs only — NO apps/**):
1) Merge WAIVE text vào SoT sống (Enterprise SRS / team SRS / ATT linkage):
   - Phase-1 phê duyệt đơn nghỉ = một cấp QL trực tiếp (khớp WF hrm_leave_approval 1 bước).
   - BR-LEAVE-LADDER-01 numeric cut + LV-02 = WAIVED Phase-1; intent «hai cấp» deferred GĐ1.5.
   - CẤM ghi production N / T_L1=3 vào BR body.
2) HDSD delta honesty (BR-LEAVE-LADDER-HDSD-01 Phase-1): «GĐ1 = QL trực tiếp»; không bảng ngày→cấp đến khi reopen.
3) Pointer giữ Option A configurable (`leave_l1_max_days` + WF L2 skipWhen) = backlog — không wipe prior evidence.
4) Update ATT SPEC §4.1 / matrix rows: LV-02 WAIVED_P1; ATT-SB-01 / ATT-SS-01 honesty under WAIVE.
5) Explicit: attendance_uat_ready=false; không claim ladder LIVE / Phase-1 leave L2 DONE.

EXIT:
- evidence: docs/qa/evidence/po-hrm-att-leave-ladder-docs-01.md
- ack_status: PASS_TO_PM
- completion_report + next_dispatch_prompt (sau WAIVE docs: PM → qa spine LV-01 honesty / hoặc funnel-sign seats — CẤM PO-HRM-ATT-LEAVE-LADDER-WF-01 Dev trừ reopen)

CẤM: invent N · seed · apps/** · wipe FR-UC-BP-ATT-09 · claim attendance_uat_ready
```

---

## 4. PM stamp request (same session)

```text
## 2026-08-06 | pm -> all | CONFIRM PO-HRM-ATT-LEAVE-LADDER-N-01
- decision: WAIVE_L2_PHASE1
- N / T_L1 production: NOT_LOCKED
- next: ba-docs PO-HRM-ATT-LEAVE-LADDER-DOCS-01
- honesty: attendance_uat_ready=false
- ref: docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md · docs/qa/evidence/po-hrm-att-leave-ladder-n-01.md
```

---

## 5. Explicit non-claims

- NOT production `N` / `T_L1` locked  
- NOT ASSUMPTION `T_L1=3` promoted  
- NOT WF 2-step implemented  
- NOT LV-02 🟢  
- NOT `attendance_uat_ready`  
- NOT Phase-1 Attendance CLOSED  
- NOT unlock `PO-HRM-ATT-LEAVE-LADDER-WF-01` Dev  

---

## Completion contract

### completion_report

- **Closed:** SA decision package for ATT leave day-ladder N — Option (1) ineligible (no evidence X); **recommend (2) WAIVE_L2_PHASE1**; (3c) Option A preserved backlog; ba-docs DOCS-01 copy-ready; evidence + spec written; no `apps/**`.
- **Open:** PM bus CONFIRM stamp; ba-docs merge WAIVE; residual ATT funnel/sign; ladder Dev remains HOLD until reopen.

### next_owner

`pm` → stamp CONFIRM → `ba-docs` `PO-HRM-ATT-LEAVE-LADDER-DOCS-01`

### next_dispatch_prompt

See §3 (full packet).

### evidence_path

`docs/qa/evidence/po-hrm-att-leave-ladder-n-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Stamp `WAIVE_L2_PHASE1` on bus same session → Task **ba-docs** `PO-HRM-ATT-LEAVE-LADDER-DOCS-01`. **Do not** dispatch ladder Dev-WF. **Do not** invent N=3.
)
