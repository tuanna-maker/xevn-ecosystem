# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9) |
| **uc_ids** | `UC-BP-REC-07` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `REC06QC1-MSL4CU2G` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| Physical UV→EMP field map (O4) | **PASS** — §4 matrix M01–M14 onto LIVE `employees` + `custom_fields` |
| Soft `employee_id` stamp Lane A + pool mirror (O7) | **PASS** — RETAIN Lane A/B soft cols · mirror when `pool_candidate_id` |
| Reverse `employees.candidate_id` | **PASS** — **ADD** if ABSENT (§5.1) — hire-employee-link already queries |
| Optional accept-audit cols | **PASS** — EXPAND Lane A `offer_accepted_at` / `_by` / `accepted_application_id` / soft `offer_id` · **DENY** second hire table |
| ONE soft hire link · DENY hard FK | **PASS** §1/§5/§11 · G-DB-02 |
| DENY second hire SoT · PAY columns · Nest `/rec` dual | **PASS** §1/§11 |
| Unlock SA API F.1 next (not Dev) | **PASS** §12 |
| Cite BA O4/O7 · SA Option A · peer REC-06 seal | **PASS** |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O4 prefill · O7 soft stamp · §1.1 logical map · VAL-REC-HIRE-* · AC-REC-07-* · primary `applications/:id/accept-offer` |
| SA-01 | Option A LOCKED · ADD create+prefill+soft-link+APP-02 · paper `/rec` alias · F-REC-HIRE-01 residual · REJECT B/C |
| AS-IS Nest (read-only) | `recruitment.service.ts` Lane A `employee_id` · bridge Lane B `employee_id` · `hire-employee-link.ts` reverse `candidate_id` · `employees.service.ts` CREATE cols (email NOT NULL · custom_fields phone) — **no** ensureSchema `candidate_id` yet |
| Stage / UV | REC-05 history SEALED · UV-YCTD ONE `requisition_id` RETAIN |
| Paper DB | §2.4 employee_id soft · §3.1 candidate_id · pending_docs lifecycle |
| Peer seal | `REC06QC1-MSL4CU2G` · mail ≠ hire |
| Style peer | `PO-HRM-MVP-GD1-REC-06-CLUSTER-DATA-01.md` |

---

## 3. Physical decisions summary

| Topic | Decision |
|-------|----------|
| Prefill SoT | LIVE `public.employees` — name/email/company required; phone→`custom_fields.phone_number`; dept→`custom_fields.department_key`; position→`job_title_key`; start→`hired_at` |
| Status | Default **`pending_docs`** — DENY auto-active on accept |
| Hire link | ONE soft: Lane A (+ Lane B mirror) + reverse `employees.candidate_id` |
| Accept audit | Optional EXPAND on Lane A — not second SoT |
| Hard FK / PAY / Nest dual | **DENIED** |
| Stage | APP-02 sole hired-outcome writer RETAIN |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| DATA DOC-DELTA | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-data-01.md` |
| Bus | `docs/program/AGENT_MESSAGE_BUS.md` append |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** RETAIN HOLD |
| Module REC UAT / Phase1 DONE | **DENIED** |
| Seed / migrate run / apps/** | **NONE this seat** |
| Nest `/rec` dual SoT | **DENIED** |
| Second hire SoT / hard FK | **DENIED** |
| PAY columns invent | **DENIED** |
| REC-06 mail = hire | **DENIED** |
| Reopen sealed J-HRM-REC-06-01..04 | **DENIED** |
| C-SLICE | **YES** |

---

## completion_report

- **Closed:** Physical DOC-DELTA CONFIRMED for UC-BP-REC-07 O4/O7 — UV→EMP map; ONE soft hire stamp Lane A + pool mirror; ADD reverse `employees.candidate_id`; optional Lane A accept-audit; DENY hard FK / second hire SoT / PAY / Nest dual / mail=hire / seed / honesty / apps/**.
- **Residual:** **sa** API F.1 F-REC-HIRE-01 ADD residual + mint `HRM-REC-HIRE-*` expand; APP-02 / HTP-05 / HIRE-400/409 RETAIN; paper `/rec` alias only.
- **next_owner:** **sa**
- **ack_status:** **PASS_TO_PM**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: DATA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-data-01.md · BA-01 O1–O12 · SA-01 Option A LOCKED · peer REC06QC1-MSL4CU2G

MISSION: API_DESIGN F.1 residual on physical Nest /api/hrm/recruitment/* ONLY — ADD F-REC-HIRE-01 POST /applications/:id/accept-offer (create+prefill from DATA-01 §4 map · soft stamp Lane A + pool mirror · reverse employees.candidate_id · optional accept-audit write); idempotent 2xx; call F-REC-APP-02 hired-outcome ONLY after success; RETAIN HTP-05 · HIRE-400/409 · PAY-403 · STAGE-UNKNOWN; mint HRM-REC-HIRE-* expand (OFFER-INVALID · CANCELLED · DUP · PREFILL-FAIL); display-ready DTO employee_id + prefilled fields + pending_docs; U19 list=get=accept=employee=hire-readiness; paper /rec/…/accept-offer = alias only.
Cite: DATA-01 §4–§10 · BA AC-REC-07-* · VAL-REC-HIRE-* · BR-BP-LC-01 · O1–O12 · REC-06/05/06a/04 must_keep.
DENY: Nest /rec dual SoT · second hire SoT · hard FK · PAY invent · claim REC-06 mail=hire · seed · honesty flip · reopen sealed J-06 · apps/** · Dev before API CONFIRMED.
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-api-01.md · PASS_TO_PM · next_dispatch_prompt Dev-BE/FE after API CONFIRMED · append bus
```
