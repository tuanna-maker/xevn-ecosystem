# Evidence — `PO-UC-TC-W4-BA-AT12-L1-CTA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-BA-AT12-L1-CTA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | governance |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **U65** | honored — triage only · no seed · no invent Leave L2 PASS |
| **trigger** | QA E2 R2 AT-12 L1 BLOCKED · `approveBtnCount=0` under `ceo@xe.vn` Nghỉ phép |
| **prior** | [`po-uc-tc-w4-qa-e2-hrm-at-r2.md`](po-uc-tc-w4-qa-e2-hrm-at-r2.md) §AT-12 · by-uc [`HRM-AT-12.md`](../professional/by-uc/HRM-AT-12.md) |
| **uat_done** | **false** |

---

## 1. Mission

Triage only (no code): who must see **Duyệt** for Leave L1 (HRM-AT-12); classify residual `R-W4-AT12-L1` as **EXPECTED_NO_CTA** vs **FE_BUG** vs **SPEC_GAP**; copy-ready next dispatch. **Cấm** invent Leave L2 PASS · weaken AT-07 PASS.

---

## 2. Spec read (process truth)

| Source | L1 approve actor | Notes |
|--------|------------------|-------|
| `docs/qa/professional/UC-FR-H03_LEAVE.md` | **QL trực tiếp (`manager_id`)** · HRBP fallback · (TO-BE) L2 Giám đốc | CAP-LV-05 = Phê duyệt L1 by QL; actors line explicit |
| `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` §0 / LV-01 | Approver = **QL trực tiếp** `uat.nv0001@xe.vn` (manager hat) | Channel: Mobile «Cần duyệt» / web Inbox · **not** Group CEO as L1 HP |
| WF catalog (cited in matrix) | `hrm_leave_approval` step `manager_approval` · `resolver_type: direct_manager` · `fallback_role_code: hrbp` | Group CEO ≠ default L1 resolver |
| `docs/hrm/SRS_MOBILE.md` UC-HRM-MOB-08 / BRD_MOBILE | **Quản lý trực tiếp** phê duyệt nghỉ | Aligns web L1 |
| `docs/qa/professional/by-uc/HRM-AT-12.md` | Actors **QL L1** · (L2 SPEC_GAP) | TC APPR-HP persona = QL/approver; CEO only in scope AU / ACT-HP-002 CT slice |
| Leave L2 | **SPEC_GAP** AS-IS 1 bước | Unchanged — **cấm invent PASS** |

**Group CEO (`ceo@xe.vn`):** scope ladder = rollup view (`company_id=main`) — may **see** pending counts / list. SRS does **not** assign Group CEO as canonical L1 Duyệt actor on Nghỉ phép. Member CEO = L2 candidate when ladder exists (SPEC_GAP). HRBP = WF fallback, not primary HP path.

---

## 3. Runtime evidence re-read (R2)

| Observation | Source | Implication |
|-------------|--------|-------------|
| Leave GET 200 · `pendingLeaveCount=32` | R2 JSON / evidence §AT-12 | API pending exists (not invented) |
| FE stats **Chờ duyệt: 32** · tab label **Chờ duyệt (32)** | screen `12-leave-pending.png` | Product knows pending |
| Active tab still **Lịch nghỉ** (calendar) | same screen | No row-level **Duyệt** on calendar overview |
| Harness click `^Chờ duyệt$` | `scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r2.mjs` | **Fails** when label is `Chờ duyệt (32)` → never opens approval tab |
| `approveBtnCount=0` | R2 | Measured on **wrong surface** (calendar), not proof RBAC hide |
| LeaveTab wires Duyệt when `status === 'pending'` on list + approval tabs | `LeaveTab.tsx` (read-only triage) | Product CTA exists — **not** “missing wire for ceo@” |
| AT-07 Eye→Duyệt | R2 | **PASS kept** — out of scope of this triage |

---

## 4. Verdict

| Dimension | Result |
|-----------|--------|
| **Primary (dispatch tree)** | **EXPECTED_NO_CTA** for claiming AT-12 L1 HP under persona **`ceo@xe.vn` Group CEO** on Nghỉ phép as the **canonical L1 approver** — SRS/UC require **QL trực tiếp** (`manager_id` / Inbox assignee / HRBP fallback only). |
| **Not FE_BUG** | Do **not** dispatch `dev-fe` to “wire Duyệt for ceo@”. Duyệt already on **Danh sách yêu cầu** / **Chờ duyệt** for pending rows; R2 CTA=0 = harness stayed on **Lịch nghỉ**. |
| **Not SPEC_GAP (L1 actor)** | SRS/UC-FR-H03 **not silent** on L1 actor. |
| **Leave L2** | Remains **SPEC_GAP HOLD** — no AC invent · no L2 PASS. |

**Operational sub-note (for QA, not a third product verdict):** R2 BLOCKED was a **false negative path** (tab regex + wrong persona). Retest must open **Chờ duyệt (n)** or pending rows on **Danh sách yêu cầu**, with **QL / manager** (or Inbox hat) after U65 FE-created leave under that manager.

---

## 5. AC delta proposal (HOLD — do not invent L2)

Add / clarify in by-uc / matrix (governance only; no L2 ladder):

| AC-ID | Proposal | Pass/Fail |
|-------|----------|-----------|
| **AC-AT12-L1-PERSONA-01** | L1 HP persona = **QL trực tiếp** (employee.`manager_id` / WF `direct_manager`) or Inbox assignee; **not** Group CEO rollup as primary HP | FAIL if only `ceo@` Nghỉ phép used to claim L1 PASS |
| **AC-AT12-L1-SURFACE-01** | Duyệt CTA asserted on tab **Chờ duyệt** (badge ok) **or** pending row on **Danh sách yêu cầu** / detail — **not** on **Lịch nghỉ** overview alone | FAIL if CTA counted only on calendar |
| **AC-AT12-L1-U65-01** | Pending nguồn từ FE create (NV/manager chain) — zero-seed | FAIL if seed/API-only precond |
| **AC-AT12-L2-HOLD-01** | L2 ladder = SPEC_GAP until BR-LEAVE-LADDER-* + WF 2 bước | **Cấm** PASS |

---

## 6. Claims / non-claims

| Claim | Status |
|-------|--------|
| AT-12 L1 PASS | **No** |
| Leave L2 PASS | **No** — SPEC_GAP |
| AT-07 PASS weakened | **No** |
| FE must wire Duyệt for Group CEO | **No** |
| UAT DONE / uat_done | **false** |

---

## 7. Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-BA-AT12-L1-CTA-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-ba-at12-l1-cta-01.md
next_owner: pm
verdict: EXPECTED_NO_CTA (wrong persona for L1 HP) · not FE_BUG · L2 SPEC_GAP HOLD
```

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R3-AT12-L1
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
ack_status_target: PASS_TO_PM

BA triage CLOSED: docs/qa/evidence/po-uc-tc-w4-ba-at12-l1-cta-01.md
verdict: EXPECTED_NO_CTA for Group CEO as L1 HP persona — SRS L1 = QL trực tiếp (manager_id / Inbox assignee / HRBP fallback). NOT FE_BUG (do not Task dev-fe wire Duyệt for ceo@). Leave L2 = SPEC_GAP HOLD — cấm invent PASS. AT-07 PASS stays closed.

entry_criteria:
- L0 qc:dev-stack + qc:fe-be-health PASS
- U65 zero-seed; U76 hdsd_align
- Persona L1: QL trực tiếp (e.g. uat.nv0001@xe.vn manager hat) OR Inbox assignee for hrm_leave — NOT ceo@xe.vn as sole L1 actor
- Precond: FE-created pending leave under that manager (NV submit → manager sees pending). Cấm seed inbox/leave.

exit_criteria:
- Open Chấm công → Nghỉ phép → tab «Chờ duyệt» (badge count OK) OR «Danh sách yêu cầu» pending row
- Assert Duyệt / data-testid hdsd-leave-list-approve* visible > 0
- Click Duyệt → POST …/leave-requests/:id/approve 2xx · FE status Đã duyệt · F5 còn
- L2 ladder: record SPEC_GAP only — không PASS
- Update by-uc HRM-AT-12 execution note; evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r3-at12.md
- Harness: match tab «Chờ duyệt» with optional (n) — do not require exact /^Chờ duyệt$/

cấm: invent Leave L2 PASS · seed · claim UAT DONE · reopen AT-07 · Task dev-fe for ceo@ Duyệt wire
```
