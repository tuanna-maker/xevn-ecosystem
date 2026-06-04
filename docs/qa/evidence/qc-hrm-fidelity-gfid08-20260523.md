# QC Gate — G-FID-08 HRM Fidelity Overlay

**work_item_id:** `P1-S1-QC-FID-08`  
**gate:** `G-FID-08`  
**program:** `HRM-FULL-FIDELITY-01`  
**from_role:** qc  
**to_role:** pm, technical-manager  
**date:** 2026-05-23 (local)  
**upstream:** `HRM-FIDELITY-QA-RETEST-2` (`PASS_TO_PM`)

---

## 1. Verdict

| Scope | Decision |
|-------|----------|
| **HRM fidelity overlay** (dev/local UAT slice) | **GO WITH CONDITIONS** |
| Phase 1 program complete | **NOT IN SCOPE** — remains NOT DONE |
| Production release | **NO-GO** (unchanged) |

**ack_status:** `PASS_TO_PM`

---

## 2. Gate checklist (G-FID-01..07)

| Gate | Owner | Evidence | QC audit |
|------|-------|----------|----------|
| G-FID-01 | BA-P | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | **CLOSED** — bus `HRM-FIDELITY-BA-P` PASS_TO_PM |
| G-FID-02 | BA-D | `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` | **CLOSED** — bus `HRM-FIDELITY-BA-D` PASS_TO_PM |
| G-FID-03 | SA | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` (Accepted) | **CLOSED** — ADR + BE-SCOPE Option A implemented |
| G-FID-04 | Dev-BE | `hrm-fidelity-be-20260523.md`, `hrm-fidelity-be-scope-20260523.md` | **CLOSED** — seed + `hrm-list-scope` roll-up; 114/114 unit tests cited |
| G-FID-05 | DevOps | `docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md` | **CLOSED** — runbook + stack hooks |
| G-FID-06 | Dev-FE | `hrm-fidelity-fe-20260523.md` | **CLOSED** — LinkedDataEmptyNotice + scope bars; vitest 36/36 |
| G-FID-07 | QA | `hrm-fidelity-qa-scope-20260523.md` | **CLOSED (scoped)** — see §3 |

**G-FID-08 rule:** Program text requires G-FID-01..07 closed before unconditional GO. G-FID-07 is closed for **group CEO pilot slice** only; full 3-persona matrix from `HRM_FULL_FIDELITY_PROGRAM.md` §5 is **not** closed → overlay **GO WITH CONDITIONS**, not unconditional GO.

---

## 3. QA evidence audit (`hrm-fidelity-qa-scope-20260523.md`)

| Check | QA claim | QC reproduction / audit |
|-------|----------|-------------------------|
| `verify:hrm:menu-density` | 7/7 PASS | **CONFIRMED** — QC run 2026-05-23: employees 1170, contracts ratio 0.939, insurance 1037/1104, attendance 2819, payroll 53, recruitment 21/33, leave 18 |
| Persona `ceo@xe.vn` | contracts 1036, employees 1100 | **ACCEPTED** — matches QA log; aligns with BE-SCOPE roll-up |
| L2 `test:pilot:flows` | 11/11 | **ACCEPTED** — consistent with S0/S1 L2 history; not re-run this gate (QA artifact sufficient) |
| L2 `test:hrm-embed:audit` | 8/8 | **ACCEPTED** — per QA evidence cross-ref |
| Member CEO | low counts, out of scope | **NOTED** — must remain out of overlay GO claims |
| FID-D-06 HRBP | OPEN | **BLOCKING for HRBP UAT only** — not blocking group-CEO overlay |
| FID-D-07 expiring | OPEN, total=0 | **CONDITION** — non-blocking HTTP; UX/seed follow-up |

---

## 4. `PROJECT_STATUS_REPORT.md` honesty audit (PSR-2026-05-24-01)

| Claim in PSR | QC assessment |
|--------------|---------------|
| Program NOT DONE (~8%, 111 UC planned) | **ACCURATE** — aligns with `PHASE1_GATE_REPORT.md` |
| Production RED | **ACCURATE** |
| HRM Fidelity G-FID-07 ✅ group CEO | **ACCURATE** — matches QA PASS |
| Member CEO/HRBP open | **ACCURATE** — matches residual defects |
| UAT slice CC+HRM conditional | **ACCURATE** — does not over-claim prod |

**Finding:** PSR does **not** imply Phase 1 or Production GO. Suitable for sponsor communication alongside this QC packet.

---

## 5. Mandatory conditions (overlay GO)

| ID | Condition | Owner | Trigger if violated |
|----|-----------|-------|---------------------|
| C-FID-01 | **Scope cap:** UAT claims only for `ceo@xe.vn` + JWT/query `main` on Command Center HRM embed (P-CC-01..08) | PM / QA | Downgrade overlay to NO-GO if member CEO marketed as ready |
| C-FID-02 | **Member CEO:** `du-lich.ceo@xe.vn` contracts/attendance density — dispatch seed S3+ | Dev-BE | NO-GO for member-unit UAT until persona probe PASS |
| C-FID-03 | **HRBP mobile:** FID-D-06 matrix + scope proxy — no HRBP UAT signoff | QA + Dev-Mobile | Block HRBP demo |
| C-FID-04 | **Insurance expiring:** FID-D-07 — seed or exempt rule documented before expiry-menu UX signoff | Dev-BE / BA | Track as cosmetic; not L2 blocker |
| C-FID-05 | **No conflation:** Overlay GO ≠ Phase 1 QC GO (`P1-S5-QC-01`) | PM / QC | Escalate if user told "dự án xong" |
| C-FID-06 | **Stack discipline:** UAT requires `qc:dev-stack` + fidelity seed runbook | DevOps / QA | FAIL L0 → hold UAT demo |

---

## 6. Residual risk statement

- **Medium:** Persona matrix incomplete (1/3 personas fully verified) — acceptable only with explicit scope cap (C-FID-01).
- **Low:** `insurance-expiring` zero rows — HTTP 200, empty list acceptable for embed load; not a scope-409 class defect.
- **Low:** PMP WBS §1.4.5 still shows FAIL persona — PM should sync to RETEST-2 PASS to avoid dispatch confusion.

---

## 7. Handoff

- **PM:** Mark overlay `HRM-FULL-FIDELITY-01` → **GO WITH CONDITIONS**; continue S1 BE-02..05, member seed backlog; update `PHASE1_PMP_PROJECT_PLAN.md` §1.4.6.
- **TM:** No architecture blocker; monitor scope-ladder drift on new list APIs.
- **QC downgrade trigger:** Reopened FID-D-03..05 on group CEO, or density &lt;7/7 after seed change.

## References

- QA: `docs/qa/evidence/hrm-fidelity-qa-scope-20260523.md`
- Program: `docs/program/HRM_FULL_FIDELITY_PROGRAM.md`
- PSR: `docs/program/PROJECT_STATUS_REPORT.md`
- User status: `docs/program/USER_SERVICE_STATUS.md`
