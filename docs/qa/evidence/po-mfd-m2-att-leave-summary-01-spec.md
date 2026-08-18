# Evidence — PO-MFD-M2-ATT-LEAVE-SUMMARY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-LEAVE-SUMMARY-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 (matrix #25–26 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — leave-summary / compensatory-summary = same `LeaveTab` + leave-requests list honesty; no distinct Nest aggregate RPT; keep LIVE wire; do **not** hide menus; do **not** invent Phase-1 FR |
| **sponsor_confirm** | **None invented** — no claim period-fund RPT LIVE / compensatory payroll aggregate LIVE / Attendance CLOSED |
| **dev_coding** | **Not opened** (FR_NEEDED Phase-1 rejected · menu-hide C rejected as primary) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true |
| **must_keep** | **LEAVE-WF-01 GWC** (#19/#28 LIVE create→QL duyệt→F5) · WIRE-BALANCE leave-balance GWC (orthogonal) · REQUESTS/OT/CLOCK/RECORDS/REPORTS/SETTINGS-EMP/WEEKLY/OVERVIEW GWC · EXPORT/CFG-COLUMNS/DEVICE/AUTO/QR ACCEPTED_AS_IS · **#27 leave-plan GĐ2-HOLD** · **Face #9 GĐ2-HOLD** · **not** Attendance CLOSED · `uat_done: false` |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#19** | Đơn từ→Nghỉ phép · `LeaveTab` · HRM-AT-10..13 · `GET/POST leave-requests` · approve/reject · **LIVE** WF `LEAVE-WF-01` 201→203+F5 QL · **must_keep GWC** |
| Fidelity matrix **#25** | Đơn từ→Tổng hợp nghỉ · `leave-summary` → `LeaveTab` · Actions «Tab/filter tổng hợp» · Spec/TechSpec **SPEC_GAP** · API «leave-requests aggregate» · Class **RPT** · Runtime **LIVE** · UC **UNMAPPED** · Owner ba · **P2** |
| Fidelity matrix **#26** | Đơn từ→Tổng hợp nghỉ bù · `compensatory-summary` → `LeaveTab` · Spec/TechSpec/API **SPEC_GAP** · Runtime **LIVE** · UC **UNMAPPED** · Owner ba · **P2** |
| Fidelity matrix **#27** | Kế hoạch nghỉ · `leave-plan` → `LeaveTab` · Mindmap **GĐ2** · priority **GĐ2-HOLD** (sibling — **not** reopened; not this WI close target) |
| Fidelity matrix **#28** | Tab Nghỉ phép · same LeaveTab · LIVE WF confirm · **must_keep** |
| Fidelity matrix **#15** (sibling OBS) | Tổng hợp công · same GET records · LIVE wire + OBS `SUMMARY-SAME-AS-RECORDS` — leave-summary is documented **sibling** in WEEKLY QA/QC |
| M2 backlog **P2-3** | This WI — aggregate / menu hide decision · not ATT CLOSED |
| ENTERPRISE_API_MAP **ATT-C4** | **UI without API:** `leave-summary`, `compensatory-summary`, `leave-plan` → reuse `LeaveTab` — **no distinct aggregate APIs** (PARTIAL product semantics). Recommend BUILD read models **or** GĐ2-HOLD — Phase-1 honesty path = accept reuse (not invent RPT). |
| RUNTIME_LOG | `req-leave-summary` LIVE leave-requests aggregate UI · `req-comp-summary` LIVE LeaveTab mount · `req-leave-plan` LIVE wire + GĐ2-HOLD priority kept |
| LEAVE-WF QC | `po-mfd-m2-att-leave-wf-01-qc.md` **GWC** — surfaces 19/28 create 201 → QL approve 203 → F5 · **must_keep** · not invent reopen |
| WIRE-BALANCE QC | `po-mfd-m2-att-wire-balance-qc-01.md` **GWC** — `GET leave-balance` on create dialog · **orthogonal** to #25/#26 RPT aggregate · do not overload as leave-summary FR |
| WEEKLY QC | `OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS` OPEN OBS P2 → ba-process / leave-summary sibling — this seat closes that sibling class for #25–26 |
| `docs/hrm/SRS.md` | FR-HRM-AT-10..13 = leave **TXN** create/list/approve/reject — **no** FR Diễn biến «Tổng hợp nghỉ theo kỳ» / «Tổng hợp nghỉ bù» RPT. Grep tổng hợp nghỉ / compensatory = **0**. **No overwrite** this seat. |
| TECHSPEC | Leave APIs = leave-requests + leave-balance + WF bridge — **no** Nest `…/leave-summary` / compensatory aggregate contract |
| FE `Attendance.tsx` (read-only) | Menu ids `leave-summary` · `compensatory-summary` · `leave-plan`; render: *«leave-request, leave-summary, compensatory-summary, leave-plan all use LeaveTab with real data»* → same `<LeaveTab />` |

## As-is vs to-be (Phase-1 / M2 #25–26)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| #19 / #28 Leave TXN + WF | LIVE LEAVE-WF GWC | **must_keep** — do not reopen |
| Menu #25 / #26 visible | Yes under Đơn từ | **Accepted** — remain visible (not hide) |
| Surface render | Same `LeaveTab` as Nghỉ phép | **Accepted AS-IS** LIVE wire |
| Distinct aggregate API | None (ENTERPRISE_API_MAP) | **Honesty OK** — not required Phase-1 |
| Product «quỹ đã dùng theo kỳ» RPT | Label implies RPT; UI = leave list | **PARTIAL product semantics ACCEPTED** — same class as #15 same-as-records |
| Compensatory payroll linkage | SPEC_GAP · no API | **Not invented LIVE** |
| leave-balance on create | WIRE-BALANCE GWC | **Orthogonal must_keep** — ≠ leave-summary menu FR |
| #27 leave-plan | GĐ2-HOLD | **must_keep HOLD** — out of close target |
| Dedicated FR Phase-1 | Missing SRS/HDSD | **Not invented** — FR_NEEDED rejected |
| True period rollup / compensatory RPT | Absent | **DEFERRED_GĐ2_CANDIDATE** |

## Decision (authoritative)

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#25–26** / M2 **P2-3** without opening Dev, without menu hide, and without Phase-1 UC/SRS overwrite:

1. **LEAVE-WF GWC already proves** the operable leave product on #19/#28 (`LeaveTab` + leave-requests). Menus #25/#26 mount the **same** component — LIVE wire is correct; inventing a second Nest RPT API without FR = over-build.
2. ENTERPRISE_API_MAP explicitly classifies these menus as **UI without distinct API** (PARTIAL product semantics) — parallel to WEEKLY **#15 SUMMARY-SAME-AS-RECORDS** OBS (attendance summary = records). Leave-summary sibling closes the same honesty class.
3. **SRS has HRM-AT-10..13 only** for leave TXN — **no** Diễn biến for period-fund aggregate or compensatory summary RPT. Inventing **FR_NEEDED** Phase-1 without sponsor = process defect (parallel EXPORT / CFG-COLUMNS / QR / AUTO-CHECKOUT).
4. **Reject menu hide (C primary):** hiding would contradict RUNTIME LIVE LeaveTab mount + LEAVE-WF must_keep and would punish an operable TXN surface for a label/RPT depth gap. True RPT depth stays **GĐ2 candidate** under A — not Face-class HOLD on the whole menu.
5. **#27 leave-plan** remains **GĐ2-HOLD** (mindmap) — do not fold #25/#26 into that HOLD; do not reopen #27.
6. leave-balance wire GWC stays **orthogonal** — AC for balance on create dialog ≠ dedicated «Tổng hợp nghỉ» aggregate menu.

### B) FR_NEEDED Phase-1 UC delta — **REJECTED**

Would invent sponsor-grade RPT FR (period-fund used, compensatory payroll rollup, Nest aggregate endpoints) without SRS/HDSD Diễn biến and without sponsor confirm. Violates «no invent sponsor confirm» + ADD-only on `docs/hrm/SRS.md` (do not overwrite). Inactive GĐ2 candidates kept below only.

### C) GĐ2 / hide menu honesty as primary — **REJECTED**

- Primary C (hide #25/#26 or stamp whole seat GĐ2-HOLD) would contradict LIVE LeaveTab + LEAVE-WF GWC and over-apply #27 mindmap HOLD.
- Depth gaps (dedicated leave-summary read model, compensatory RPT, payroll period columns) stay **DEFERRED_GĐ2_CANDIDATE** under A — sponsor may later choose hide **or** BUILD; not forced now.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-LEAVE-SUM-01** | Menu Đơn từ→Tổng hợp nghỉ (#25) opens without blank crash and renders `LeaveTab` | Leave list/tabs visible | Uncaught / white screen |
| **AC-ATT-LEAVE-SUM-02** | Menu Đơn từ→Tổng hợp nghỉ bù (#26) opens and renders same `LeaveTab` | Same Leave shell | Distinct fake aggregate grid without API |
| **AC-ATT-LEAVE-SUM-03** | Phase-1 **does not** require Nest `…/leave-summary*` / compensatory aggregate API | Align ENTERPRISE_API_MAP UI-without-API | FAIL seat only because dedicated RPT API missing |
| **AC-ATT-LEAVE-SUM-04** | Product stamp may keep **LIVE wire** with **ACCEPTED_AS_IS** honesty that aggregate = leave-requests list (same-as-leave-list) | Honest LIVE wire + OBS product | Stamp dedicated period-fund RPT **LIVE** without aggregate API + browser proof |
| **AC-ATT-LEAVE-SUM-05** | LEAVE-WF #19/#28 GWC **not** reopened by this WI | No invent leave-WF FAIL | Re-run LEAVE-WF as invent FAIL for summary label |
| **AC-ATT-LEAVE-SUM-06** | WIRE-BALANCE leave-balance GWC remains orthogonal must_keep | Balance on create OK | Claim leave-summary menu = leave-balance RPT DONE |
| **AC-ATT-LEAVE-SUM-07** | #27 leave-plan remains **GĐ2-HOLD**; Face #9 remains **GĐ2-HOLD** | Holds untouched | Invent #27/#9 LIVE or reopen HOLD |
| **AC-ATT-LEAVE-SUM-08** | U65: no seed / no API-only green for invent RPT LIVE | Browser FE if RPT LIVE claimed later | `pnpm seed:*` or invent aggregate rows |
| **AC-ATT-LEAVE-SUM-09** | No new Phase-1 FR overwrite of `docs/hrm/SRS.md` for leave-summary / compensatory RPT | Close without SRS wipe | Overwrite SRS or invent sponsor confirm |
| **AC-ATT-LEAVE-SUM-10** | Attendance menu **not** CLOSED / `uat_done` stays false from this seat | Governance close only | Claim ATT CLOSED / Phase1 DONE |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P2-3** / matrix #25–26 governance | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-LEAVE-SUM-01..10 · no Dev · no menu hide |
| Matrix #25 / #26 runtime | Keep **LIVE wire** + ACCEPTED product same-as-LeaveTab | Optional QA label honesty spot — not required to close P2-3 |
| `OBS-MFD-M2-ATT-SUMMARY-SAME-AS-RECORDS` leave sibling | **CLOSED** for #25–26 class under this evidence | #15 attendance summary OBS may remain separate if still open on WEEKLY |
| LEAVE-WF #19/#28 | **must_keep GWC LIVE** | Do not reopen |
| WIRE-BALANCE | **must_keep GWC** | Orthogonal |
| #27 leave-plan | **must_keep GĐ2-HOLD** | Out of this close |
| Face #9 | **must_keep GĐ2-HOLD** | — |
| Dedicated leave-summary / compensatory Nest RPT | **DEFERRED_GĐ2_CANDIDATE** (or sponsor FR) | Not Dev from this seat |
| Attendance CLOSED / uat_done | **Forbidden** | — |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens. Shape only for backlog readiness. **Do not overwrite** `docs/hrm/SRS.md` in this seat.

### Candidate FR (draft IDs — inactive)

| Candidate | Intent |
|-----------|--------|
| **FR-ATT-LEAVE-SUM-RPT-01** | Read model «Tổng hợp nghỉ theo kỳ»: quỹ hưởng / đã dùng / chờ duyệt theo NV·loại·kỳ (may compose leave-balance + approved leave-requests); scoped; empty honesty; F5 |
| **FR-ATT-LEAVE-COMP-SUM-01** | Tổng hợp nghỉ bù / OT-to-leave linkage for payroll — distinct from annual leave list |
| **FR-ATT-LEAVE-SUM-HIDE-01** | Alternate honesty: hide or badge GĐ2 on #25/#26 until RPT API exists (only if sponsor prefers hide over LeaveTab reuse) |

### ADD-only Diễn biến pointer

| Pointer | Note |
|---------|------|
| Host | ADD under new FR — **preserve** HRM-AT-10..13 + LEAVE-WF AC |
| Happy | HRBP opens Tổng hợp nghỉ → bảng quỹ theo kỳ khớp SoT balance/approved days |
| Fail sâu | Sai scope company · kỳ không có dữ liệu → empty deterministic · không invent số quỹ |
| ba-docs | Only after sponsor opens — ADD 7 mục + ratio; **no** wipe existing FR |

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Verdict A + AC + GĐ2 candidates; no apps/** |
| pm | Intake PASS_TO_PM; stamp matrix/backlog P2-3 CLOSED ACCEPTED; **do not** dispatch Dev for aggregate RPT / menu hide without sponsor FR |
| qa/qc | Keep #25/#26 LIVE wire honesty; do **not** NO-GO LEAVE-WF for missing dedicated summary API; FAIL only false dedicated-RPT LIVE claim |
| ba-docs / sa / dev | **Idle** until sponsor opens FR-ATT-LEAVE-SUM-* |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-LEAVE-SUM-PAY-01 | Sponsor / ba-process | Does payroll GĐ1 require dedicated leave-period RPT, or LeaveTab + leave-balance on create enough? |
| Q-ATT-LEAVE-SUM-HIDE-01 | Sponsor | Prefer keep LeaveTab reuse vs hide/badge GĐ2 on #25/#26 until RPT API? |

No answer required to close this P2-3 residual for Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No overwrite `docs/hrm/SRS.md`
- No invent dedicated leave-summary / compensatory RPT LIVE
- No reopen LEAVE-WF / WIRE-BALANCE / REQUESTS GWC without new FAIL
- No reopen Face #9 or #27 leave-plan HOLD as LIVE
- No seed to fabricate aggregate rows
- No force menu hide as Phase-1 DoD

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| Matrix **#25** | **LIVE wire · ACCEPTED_AS_IS_P1** (same-as-LeaveTab / leave-requests list) — not dedicated RPT LIVE |
| Matrix **#26** | **LIVE wire · ACCEPTED_AS_IS_P1** (same LeaveTab) — not compensatory RPT LIVE |
| M2 backlog **P2-3** | **CLOSED** governance · not ATT CLOSED |
| Matrix **#19 / #28** | **must_keep LIVE** LEAVE-WF GWC |
| Matrix **#27** | **must_keep GĐ2-HOLD** |
| Face **#9** | **must_keep GĐ2-HOLD** |
| Attendance menu / `uat_done` | **unchanged** (not CLOSED / false) |

## completion_report

**Closed:** Governance decision for Attendance Đơn từ→Tổng hợp nghỉ / Tổng hợp nghỉ bù (matrix **#25–26** / M2 **P2-3**). Verdict **A) ACCEPTED_AS_IS_P1**: Phase-1 accepts menus that reuse `LeaveTab` + leave-requests (LIVE wire; no distinct Nest aggregate API; PARTIAL product RPT semantics honesty — sibling of #15 SUMMARY-SAME-AS-RECORDS). Measurable **AC-ATT-LEAVE-SUM-01..10**. Candidates FR-ATT-LEAVE-SUM-RPT/COMP/HIDE inactive (GĐ2). **No Dev opened. No menu hide.** LEAVE-WF GWC + Face HOLD + #27 GĐ2-HOLD must_keep. **Not** Attendance CLOSED / `uat_done`.

**Open:** Non-blocking Q-ATT-LEAVE-SUM-PAY-01 / Q-ATT-LEAVE-SUM-HIDE-01; sponsor FR for true period/compensatory RPT — not required for this close.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-LEAVE-SUMMARY-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-leave-summary-01-spec.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-LEAVE-SUMMARY-01 / matrix #25–26 / M2 P2-3 as ACCEPTED_AS_IS_P1 (LeaveTab reuse honesty; LIVE wire; no dedicated Nest leave-summary / compensatory aggregate; no menu hide).
2) Stamp matrix #25–26 LIVE wire ACCEPTED_AS_IS_P1; M2 backlog P2-3 CLOSED governance; must_keep LEAVE-WF #19/#28 GWC · WIRE-BALANCE GWC · #27 GĐ2-HOLD · Face #9 GĐ2-HOLD.
3) Do NOT dispatch Dev (dev-fe/dev-be) for leave-summary RPT API / compensatory aggregate / menu hide without sponsor opening FR-ATT-LEAVE-SUM-*.
4) Do NOT invent Attendance CLOSED / uat_done=true / dedicated RPT LIVE.
5) Continue remaining P2 (OVERVIEW-CHARTS if still open · RBAC-SETTINGS · SYSTEM · OPENAPI) — leave-summary seat closed.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-leave-summary-01-spec.md`

## ack_status

**PASS_TO_PM**
