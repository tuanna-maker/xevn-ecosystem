# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-11 seat **#13**) |
| **uc_ids** | `UC-BP-CORE-02` |
| **Date** | 2026-08-09 |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA Option A · peer seal **`CORE01QC1-MSL6WMS7`** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md` |
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED** |
| **change_mode** | DOC-DELTA F.1 · **NO** `apps/**` · **no seed** · **no honesty flip** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| UPGRADE F-CORE-EMP-02 on `/api/hrm/contracts-insurance/compensation-packages*` (+ revise/history/active) | **PASS** §5.1 |
| AuthZ C&B + access audit · mint `HRM-CORE-CB-AUTHZ-403` | **PASS** §1 · §5.1 · §7 |
| ADD `bank_account` / `bank_name` / `tax_id` (+ `bank_branch?`) on create/revise DTO | **PASS** §4.1 · §5.1 |
| History snapshot MUST include bank/MST | **PASS** §1 CORE-CB-HISTORY · §4.2 |
| Paper `/core/…/compensation` = alias only | **PASS** §3 |
| Thin `/employees/:id/compensation*` MUST same packages SoT | **PASS** §1 · §5.5 |
| RETAIN F-CORE-SI enrollment + `hrm_insurance_rate_period` append | **PASS** §5.2–§5.3 |
| Harden PATCH contribution vs `…/actions` `change_rate` (fail-closed prefer) | **PASS** §1 CORE-SI-PATCH-FAILCLOSED · §5.2 |
| Mint/RETAIN OVERLAP-409 · VAL-400 · RETAIN `HRM-CORE-CB-403` | **PASS** §7 (`HRM-COMP-409-OVERLAP` RETAIN + optional alias) |
| RETAIN F-CORE-EMP-01 / F-CORE-DEP-01 · U19 · display-ready | **PASS** §5.4 · §6 · §8 |
| DENY Nest `/core` dual · second SoT · CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty · apps/** · Dev until CONFIRMED | **PASS** §1/§10 · unlock §11 after CONFIRMED |
| ba-data already CONFIRMED (no re-invent) | **PASS** §9 |
| F.1 Mục đích · Nghiệp vụ · bước SRS #1–#4 | **PASS** §5.1–§5.3 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| DATA-01 | §4 bank/MST header ADD · §5 SI period RETAIN · public strip · DV/VAL · unlock ladder API |
| BA-01 | O1–O12 · AC-CORE-CB-01/02 · AC-CORE-02-* · AuthZ · bank/MST · J-HRM-CORE-02-01..04 DRAFT |
| SA-01 | Option A LOCKED · packages + employee-insurances physical · paper `/core` alias · REJECT B/C |
| SRS | FR-UC-BP-CORE-02 Diễn biến #1–#4 · BR-BP-SEC-02 · AC-CORE-CB-01/02 |
| Paper API | F-CORE-EMP-02 · F-CORE-SI-* · F-CORE-SI-RATE · `/core/…/compensation` = alias |
| AS-IS Nest (read-only) | `@Controller('contracts-insurance')` packages LIVE · DTO **no** bank/tax · snapshot lines+effective only · `HRM-COMP-409-OVERLAP` LIVE · AuthZ C&B membership **gap** · `@Controller('employee-insurances')` LIVE · actions append LIVE · PATCH may denorm contrib without period · Nest `/core` C&B **ABSENT** · CORE-01 public SEALED |
| Peer style | CORE-01 CLUSTER-API-01 F.1 physical prefer |

---

## 3. Decisions summary

| Topic | Decision |
|-------|----------|
| Path | Physical packages* + employee-insurances* · paper `/core/…/compensation` alias only |
| C&B SoT | ONE LIVE packages\|lines\|history — UPGRADE AuthZ + bank/MST + snapshot |
| Bank/MST | Header DTO ADD — DENY public CF SoT |
| Overlap | RETAIN `HRM-COMP-409-OVERLAP` · optional alias `HRM-CORE-CB-OVERLAP-409` |
| SI rate | RETAIN period append · PATCH contrib fail-closed prefer → actions |
| Public | RETAIN `HRM-CORE-CB-403` · AC-CORE-CB-02 F5 · ≠ C&B DONE |
| Unlock | **dev-be** + **dev-fe** after this CONFIRMED |

---

## 4. Deliverables inventory

| Artifact | Path |
|----------|------|
| API F.1 DOC | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md` |
| This evidence | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-api-01.md` |

---

## 5. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| CORE / personnel module UAT | **false** |
| C-SLICE | GWC CORE-01 ≠ module UAT ≠ Phase1 DONE · this API ≠ module CORE UAT |
| CORE-01 public = C&B DONE | **DENY** |
| Nest `/core` dual compensation | **DENY** |
| Second packages / deps / period SoT | **DENY** |
| Seed / honesty flip / apps/** this seat | **DENY** |
| Reopen sealed J-HRM-CORE-01-* | **DENY** without regression |

---

## 6. Completion handoff

| Field | Value |
|-------|--------|
| **completion_report** | F.1 Option A CONFIRMED — UPGRADE F-CORE-EMP-02 packages* (AuthZ+bank/MST+snapshot) · RETAIN SI+RATE · PATCH fail-closed · unlock Dev-BE/FE · residual QA J-HRM-CORE-02-01..04 · QC GWC C-SLICE |
| **next_owner** | **pm** → **dev-be** + **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-api-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md` |

### next_dispatch_prompt (BE — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: API-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md · DATA-01 · BA-01 O1–O12 · SA Option A · peer CORE01QC1-MSL6WMS7
entry_criteria: F.1 CONFIRMED; honesty false; C-SLICE; U65; cấm Nest /core dual · second compensation/deps/period SoT · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip
MISSION: Implement physical Nest /api/hrm/contracts-insurance/compensation-packages* — UPGRADE F-CORE-EMP-02: ensureSchema ADD bank_account/bank_name/tax_id (+bank_branch?) on packages header; Create/Revise DTO+persist; history snapshot MUST include bank/MST; revise copy-forward; ADD C&B AuthZ → 403 HRM-CORE-CB-AUTHZ-403 + access audit; RETAIN HRM-COMP-409-OVERLAP (+ optional alias HRM-CORE-CB-OVERLAP-409); mint HRM-CORE-CB-VAL-400 as needed; RETAIN HRM-CORE-CB-403 on public; harden PATCH /employee-insurances/:id contribution delta → 400 fail-closed prefer redirect to …/actions change_rate; RETAIN period append F-CORE-SI-RATE; display-ready amounts/dates; U19 list=get=revise=SI; jest. Parallel FE-01. Optional thin /employees/:id/compensation* MUST same packages service.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-be-01.md · READY_FOR_QA
cấm: Nest /core dual · second packages/deps/period · public CF bank/MST SoT · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip · silent SI history wipe · CORE-02b/PAY invent
```

### next_dispatch_prompt (FE — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: API-01 CONFIRMED · BE-01 in parallel OK for UI bind stubs
MISSION: Bind vòng mật C&B → GET/POST/revise /api/hrm/contracts-insurance/compensation-packages* (+ history/active); bank/MST on C&B form only; SI → /employee-insurances* + actions change_rate; after save → public CORE-01 F5 still clean (AC-CORE-CB-02); toast AuthZ-403 / CB-403 / OVERLAP / VAL; amounts vi-VN · dates dd/MM/yyyy; DENY Nest /core SoT · same-form public+salary · FE invent payslip SoT · claim CORE-01=C&B DONE · seed · honesty.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-fe-01.md · READY_FOR_QA
```
