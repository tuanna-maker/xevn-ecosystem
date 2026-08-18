# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01` |
| **lane** | execution · **dev-be** |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-9 seat #11) |
| **uc_ids** | `UC-BP-REC-07` |
| **Date** | 2026-08-09 |
| **change_mode** | **ADD** · preserve_default · code_memory_required |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 · BA O1–O12 · SA Option A |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-07** Diễn biến **#1–#2** · BR-BP-LC-01 / BR-BP-ONB-01 · AC-HTP-05 handoff |
| **tech_spec / API** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md` §5.1 F-REC-HIRE-01 · §7 mint · §8 U19 |
| **db_design** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md` §4 M01–M14 · §5.1 reverse · §5.2 accept-audit |
| **api_design** | F-REC-HIRE-01 physical `POST /api/hrm/recruitment/applications/:applicationId/accept-offer` · paper `/rec/*` alias only |
| **ba** | O1–O12 · AC-REC-07-* · VAL-REC-HIRE-01..24 |
| **sponsor_confirm** | API-01 CONFIRMED unlock Dev-BE |

**spec says / code does**

| Spec | Impl |
|------|------|
| ADD accept-offer create+prefill | `RecruitmentService.acceptOfferApplication` · INSERT `employees` status `pending_docs` |
| Soft stamp Lane A + pool mirror + reverse `candidate_id` | UPDATE `recruitment_candidates.employee_id` · `employees.candidate_id` · mirror `candidates.employee_id` |
| Optional accept-audit | `offer_accepted_at` / `_by` / `accepted_application_id` / `offer_id` — first-only preserve |
| Idempotent 2xx | Re-accept → mode `idempotent` · no second emp · HTTP 200 `HRM-REC-HIRE-200` |
| APP-02 hired-outcome ONLY after success | Accept **never** `UPDATE … SET status` · `history_id=null` |
| RETAIN HIRE-400/409 · PAY-403 | `assertHireEmployeeLinkOrThrow` after stamp · PAY body → 403 before DDL/mutate |
| Mint HIRE-* | `rec-hire.constants.ts` · controller 201/200 |
| U19 | Same `resolveHrmListScope` + `assertResourceInHrmScope` as get candidate |
| ensureSchema DATA-01 | `employees.candidate_id` + IX · Lane A audit cols + IX · **no** hard FK · **no** `rec_hire*` table |
| DENY Nest `/rec` dual | Controller `@Controller('recruitment')` only |

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/rec-hire.constants.ts` | **ADD** mint + PAY + pending_docs |
| `apps/api/hrm-api/src/recruitment/dto/accept-offer.dto.ts` | **ADD** body DTO |
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | **ADD** ensureSchema §5 · acceptOffer* · gates · stamp |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | **ADD** POST applications/:id/accept-offer · thin candidates alias |
| `apps/api/hrm-api/src/employees/employees.service.ts` | **ADD** `candidate_id` ensureSchema (cold DB parity) |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-07-cluster-be-01.spec.ts` | **ADD** jest 11 |

---

## 3. Verification

```text
pnpm --filter hrm-api exec jest src/recruitment/po-hrm-mvp-gd1-rec-07-cluster-be-01.spec.ts --no-coverage
→ Test Suites: 1 passed · Tests: 11 passed

Regression:
be-hrm-g-db-01-hire-link-01 + rec-05 + rec-06
→ Test Suites: 3 passed · Tests: 35 passed
```

### Jest coverage map

| Case | Expect |
|------|--------|
| ensureSchema reverse + audit | PASS · DENY hard FK / rec_hire table |
| CREATE happy | mode=created · pending_docs · prefill · no stage UPDATE |
| Idempotent | same employee_id · preserve offer_accepted_at |
| DUP conflict | HRM-REC-HIRE-DUP |
| Not offer-ready | HRM-REC-HIRE-OFFER-INVALID |
| Cancelled | HRM-REC-HIRE-CANCELLED |
| Prefill fail | HRM-REC-HIRE-PREFILL-FAIL |
| PAY body | HRM-REC-PAY-403 · 0 queries |
| Cross-CT YCTD | HRM-REC-HIRE-409 |
| Thin alias no neo | OFFER-INVALID |

---

## 4. DENY / must_keep

| Class | Status |
|-------|--------|
| Nest `/rec` dual SoT | **DENY** |
| Second hire / `rec_offer` table | **DENY** |
| Hard FK hire | **DENY** |
| PAY invent | **DENY** (403) |
| Silent stage on accept | **DENY** (APP-02 RETAIN) |
| Mail template `offer` = hire | **DENY** · stamp `REC06QC1-MSL4CU2G` |
| Seed / honesty flip / reopen J-06 | **DENY** |
| HIRE-400/409 · HTP-05 · UV-YCTD · REC-05/06/06a/04 | **RETAIN** |

---

## 5. Residual for QA

1. Browser U65 **J-HRM-REC-07-01..04** — accept → transitions hired-outcome → HTP hire-readiness · Network path `/recruitment/` · zero-seed.
2. L1 live route smoke when stack up (optional): POST accept-offer mint codes.
3. FE-01 parallel bind — not this seat.

---

## completion_report

- **Closed:** Physical Nest F-REC-HIRE-01 — `POST /api/hrm/recruitment/applications/:id/accept-offer` (create+prefill · soft stamp · reverse `employees.candidate_id` · optional accept-audit · idempotent 2xx · PAY-403 · mint `HRM-REC-HIRE-*` · U19 · ensureSchema DATA-01) · thin candidates alias · APP-02 hired-outcome **not** written on accept · jest **11/11** + regression hire/05/06 **35/35**.
- **Residual:** QA U65 J-HRM-REC-07-* · FE-01 bind · QC GWC C-SLICE.
- **Honesty:** `recruitment_uat_ready=false` · C-SLICE.

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-be-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: BE-01 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-be-01.md · FE-01 if READY
entry_criteria: L0 stack; browser-only U65; honesty false; C-SLICE
MISSION: L1 mint codes accept-offer + L2.5 J-HRM-REC-07-01..04 — FE Chấp nhận offer → POST /recruitment/applications/:id/accept-offer → transitions hired-outcome → hire-readiness; F5 soft link; PAY-403; mail≠hire; DENY Nest /rec · seed · reopen J-06.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-01.md · PASS_TO_PM
cấm: seed · API-only PASS · Nest /rec · claim module UAT · honesty flip
```
