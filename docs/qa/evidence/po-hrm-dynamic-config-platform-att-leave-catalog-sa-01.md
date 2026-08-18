# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — Option/F.1 narrow **AC-PLT-ATT-LEAVE-01** (consumer picker when Nest `att_leave_type` ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01` DOC-DELTA **ACCEPT** · U88 |
| **ref_peer_emp** | EMP DOC/ET open catalog |
| **ref_peer_dec** | DEC decision-types |
| **ref_peer_pay** | PAY Nest salary_components Option B · AC-PLT-PAY-01 |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** — Option **B** LOCKED |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD Option/F.1 · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · no UF invent |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · DENY leave WAIVE / sign / J-HRM-06c reopen · DENY reopen EMP·DEC·PAY·EXT·CTR·LIST-TOTALS · DENY module ATT UAT |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **Leave WAIVE / LV-02 / WAIVE_L2 / J-HRM-06c / sheet-sign** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **`payroll_e2e_ready`** | **`false`** | retained |
| **ATT-QC-01 L1 · ATT-QC-02 browser** | **SEAL RETAIN** | AC-PLT-ATT-01..02 retained |
| **EMP · DEC · PAY · EXT · CTR · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase1** | **DENIED** | Slice Option ≠ module GO |
| **Seed** | **DENIED** (U65) | |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| ATT vertical F.1 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` F-ATT-CAT-LVT/EFF · AC-PLT-ATT-01..03 |
| ATT DATA / BE / FE / QA / QC | DATA-01 · BE-01 · FE-01 · QA-02 stamp `ATTPLATQA2-MSIVNE4A` · QC-01/02 GWC SEAL |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` BR-PLT-02/04/05/06 · ATT §2.3 |
| SRS leave | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-04/04b/05/05b/06/07/08/09** |
| DB | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `att_leave_type` |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B ATT row · `ADR-HRM-ATTENDANCE-CFG-PERSIST` D1–D4 |
| Peer PAY | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md` Option B AC-PLT-PAY-01 |
| Peer EMP / DEC | EMP-VERTICAL · DEC-VERTICAL consumer assert when catalog >0 |
| Nest AS-IS | `AttLeaveTypeService` · `HRM-LEAVE-TYPE-UNKNOWN` · LeaveTab `useAttLeaveTypesEffective` |
| Parent U88 | PAY-CATALOG-DOCS-01 ACCEPT → this ATT leave catalog SA |

**Prior note:** ATT-VERTICAL unlocked physical + F.1 → already shipped + QC. This seat owns **AC-PLT-ATT-LEAVE-01 consumer Option** (peer PAY-CATALOG-SA-01) — does **not** reopen ATT API F.1 / seals.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) | Option A/B/C · trade-off · **B LOCKED** · L-ATT-LEAVE-01..10 · AC/VAL matrix · ba-data HOLD · ba-process UNLOCK · BE HOLD |

**Không đụng:** `apps/**` · seed · flip `attendance_uat_ready` · reopen WAIVE/sign/J-06c · reopen EMP/DEC/PAY seals.

---

## 3. Option summary

| Option | Verdict |
|--------|---------|
| **A** Settings MD `leave_types` = sole picker SoT | **REJECT** — dual orphan / PAY O4 class |
| **B** Nest `att_leave_type` via F-ATT-CAT-LVT/EFF = code SoT; consumer picker when ≠ empty; admin CREATE open N+1; invent → `HRM-LEAVE-TYPE-UNKNOWN` | **LOCKED / CONFIRMED** |
| **C** Invent attendance_uat / WAIVE reopen / mega table | **REJECT** |

**Weighted score:** A 66 · **B 111** · C 24.

---

## 4. Architecture locks (machine-readable)

| Lock | Rule |
|------|------|
| **L-ATT-LEAVE-01** | Admin CREATE open ≠ consumer free-text ban |
| **L-ATT-LEAVE-02** | Code SoT = Nest F-ATT-CAT-LVT/EFF — not Settings MD alone |
| **L-ATT-LEAVE-03** | Group REF merge-read; ATT wins |
| **L-ATT-LEAVE-04** | Empty catalog → no fake UF density |
| **L-ATT-LEAVE-07** | Invent → `HRM-LEAVE-TYPE-UNKNOWN` |
| **L-ATT-LEAVE-09** | Seals + WAIVE/sign/J-06c retain |
| **L-ATT-LEAVE-10** | Honesty false · `C-SLICE-≠-MODULE` |

| Gate | Status |
|------|--------|
| ba-data physicalize | **HOLD** (already physical) |
| ba-process AC pack | **UNLOCK** |
| BE consumer deepen | **HOLD** until BA |
| FE picker rebind | Only if BA flags MD sole bind |
| ATT UAT / WAIVE reopen | **DENIED** this seat |

---

## 5. Quality gates (SA)

| Check | Result |
|-------|--------|
| Option A/B/C + reject invent UAT/WAIVE | **PASS** |
| Cite F-ATT-CAT / FR-UC-BP-ATT-04..09 / AC-PLT-ATT-* | **PASS** |
| Peer EMP · DEC · PAY Option B | **PASS** |
| ba-data HOLD · ba-process unlock · BE HOLD | **PASS** |
| No apps/** · no seed · honesty false | **PASS** |
| Seals retain · WAIVE/sign/J-06c retain | **PASS** |
| Admin vs consumer split (L-ATT-LEAVE-01) | **PASS** |
| Peer work-sites RETAIN · work_shifts OPS LOCK | **PASS** |

---

## 6. completion_report

**Closed:** Docs-only Option/F.1 for **AC-PLT-ATT-LEAVE-01** **CONFIRMED** — Option **B** LOCKED: Nest `att_leave_type` via **F-ATT-CAT-LVT-01 / F-ATT-CAT-EFF-01** is authoritative leave-type catalog; when effective ≠ empty, consumers must pick catalog key (**BR-PLT-02** · invent → **`HRM-LEAVE-TYPE-UNKNOWN`**); Settings MD `leave_types` alone **REJECT** as picker SoT; invent `attendance_uat_ready` / leave WAIVE·sign·J-HRM-06c reopen / mega-EAV **REJECT**; admin CREATE N+1 remains open (**BR-PLT-05** · ATT-QC-02 retain); ba-data **HOLD**; ba-process **UNLOCK**; BE consumer-deepen **HOLD** until BA; honesty `attendance_uat_ready=false`; ATT-QC + EMP·DEC·PAY·EXT·CTR·LIST-TOTALS + WAIVE seals **retained**; no `apps/**`.

**Residual:** ba-process AC surface matrix (leave create invent browser · balance/hold if gap) → then BE/FE only for BA-listed gaps → QA U65 — **not** ATT module UAT / WAIVE reopen.

---

## 7. next_owner / next_dispatch_prompt

**next_owner:** `ba-process`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01 CONFIRMED Option B
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD

## task
AC pack **AC-PLT-ATT-LEAVE-01 / 01b / 01c / 01d / 01H** + VAL-ATT-CNS-01..03 per SA:
docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md §7
- Nest F-ATT-CAT-LVT/EFF = leave-type SoT; admin CREATE open N+1 RETAIN (ATT-QC-02)
- Consumer picker when effective ≠ empty; invent → HRM-LEAVE-TYPE-UNKNOWN
- Enumerate UF surfaces: Nghỉ phép create · FR-UC-BP-ATT-05b balance panel · FR-UC-BP-ATT-09 hold · FR-UC-BP-ATT-07 sick class
- Cross-ref AC-PLT-ATT-01..03 (retain 01/02; align 03=01b) · peer AC-PLT-PAY-01
- Cite SRS FR-UC-BP-ATT-04..09 · ATT-VERTICAL · seals ATT-QC
- ba-data HOLD unless physical EXPAND proven; BE HOLD until this BA CONFIRMED
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-ba-01.md
- Spec: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md

## must_keep / honesty / cấm
attendance_uat_ready=false · ATT WAIVE / sign / J-HRM-06c RETAIN · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS RETAIN · no apps/** · no seed · C-SLICE-≠-MODULE · DENY module ATT UAT · DENY Settings MD sole picker SoT

## exit
PASS_TO_PM · CONFIRMED · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

---

## 8. Handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | §6 above |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | §7 copy-ready |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-sa-01.md` |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **ba-data** | **HOLD** |
| **BE** | **HOLD** until BA |
