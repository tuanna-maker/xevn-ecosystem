# Phase 1 â€” Product Completion TODO (PMP task matrix)

**Program:** `P1-PRODUCT-COMPLETE` Â· **Plan:** [`PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md`](./PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md)  
**PM owner:** Composer Â· **Updated:** 2026-06-07 (post W6-PM-01)  
**Legend:** `[ ]` open Â· `[~]` in progress Â· `[x]` done Â· `[â€”]` waived

---

## Summary pulse

| Metric | Value |
|--------|-------|
| Total work packages | **42** |
| Done | **38** |
| In progress | **2** |
| Queued | **2** |
| % complete | **~90%** |
| W5 QC | **GO WITH CONDITIONS** â€” `pcomp-w5-qc-01-20260607.md` |
| W6 sponsor UAT | **Pending** â€” `PCOMP-W6-SP-01` |

---

## W0 â€” Source audit & baseline

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W0-PM-01 | Publish PMP plan + TODO + team org | PM | â€” | [x] | this file |
| PCOMP-W0-QA-01 | Full grep mock matrix `apps/web` | QA | PM-01 | [x] | `docs/qa/evidence/pcomp-w0-mock-matrix-20260607.md` |
| PCOMP-W0-BA-D-01 | Execution delta BR (no SRS rewrite) | BA-D | PM-01 | [x] | `docs/program/governance/pcomp-w0-ba-d-01-20260607.md` |
| PCOMP-W0-SA-01 | P0 scope/API closure backlog | SA | PM-01 | [x] | `docs/program/governance/pcomp-w0-sa-01-20260607.md` |
| PCOMP-W0-DO-01 | Script `verify:product:completion` scaffold | DevOps | QA-01 | [x] | `scripts/verify-product-completion.mjs` |

---

## W1 â€” HRM embed zero-mock (P0)

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W1-FE-01 | Attendance.tsx charts â†’ API/empty (M-HRM-01) | Dev-FE | W0-QA | [x] | `pcomp-w1-fe-01-20260607.md` |
| PCOMP-W1-FE-02 | Payroll + profile mocks â†’ API/empty (M-HRM-02..11) | Dev-FE | W0-QA | [x] | `pcomp-w1-qa-02-20260607.md` |
| PCOMP-W1-QA-02 | L2 Payroll/profile post FE-02 | QA | FE-02 | [x] | `pcomp-w1-qa-02-20260607.md` |
| PCOMP-W1-QC-01 | Narrow GO W1 mock-free embed | QC | QA-01 | [x] | `pcomp-w1-qc-01-20260607.md` |
| PCOMP-W2-FE-01 | HrmWorkspacePanel remove HRM_MOCK | Dev-FE | W1 | [x] | `pcomp-w2-fe-01-20260719.md` (closes `20260607` residual) |
| PCOMP-W3-QA-03 | P0-4 batch scope live | QA | BE-05 | [x] | `pcomp-w3-qa-03-20260607.md` |

---

## W2 â€” Portal legacy panel

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W2-FE-01 | HrmWorkspacePanel remove HRM_MOCK display path (M-CC-01/02) | Dev-FE | W1-QA | [x] | `pcomp-w2-fe-01-20260607.md` Â· QA-01 |
| PCOMP-W2-BE-01 | Dept system templates API or 501 empty (M-CC-03) | Dev-BE | W0-SA | [~] | live API rows QA-02; BE-01 optional hardening |
| PCOMP-W2-FE-02 | Infrastructure + mockCompanies cleanup (M-CC-04/05) | Dev-FE | W2-BE-01 | [x] | `pcomp-w2-fe-02-20260607.md` Â· QC-02 |
| PCOMP-W2-FE-03 | KPI rail strict default off mock (M-CC-06) | Dev-FE | W2-FE-01 | [x] | `pcomp-w2-fe-02-20260607.md` Â· QC-02 |
| PCOMP-W2-QA-01 | HrmWorkspacePanel M-CC-01/02 retest | QA | FE-01 | [x] | `pcomp-w2-qa-01-20260607.md` |
| PCOMP-W2-QA-02 | Portal strict mock M-CC-03..06 retest | QA | FE-02/03 | [x] | `pcomp-w2-qa-02-20260607.md` |
| PCOMP-W2-QC-02 | Partial W2 gate M-CC-03..06 GWC | QC | QA-02 | [x] | `pcomp-w2-qc-02-20260607.md` |
| PCOMP-W2-FE-04 | GlobalFilter + CC page mock branches (M-CC-11/12) | Dev-FE | QC-02 | [x] | `pcomp-w2-fe-04-20260607.md` Â· QA-03 |
| PCOMP-W2-QA-03 | M-CC-11/12 strict retest | QA | FE-04 | [x] | `pcomp-w2-qa-03-20260607.md` |
| PCOMP-W2-QC-03 | Partial W2 gate M-CC-11/12 | QC | QA-03 | [x] | `pcomp-w2-qc-03-20260607.md` Â· M-CC-11/12 CLOSED |
| PCOMP-W2-FE-05 | M-CC-13 mock grep bundle | Dev-FE | QC-03 | [x] | `pcomp-w2-fe-05-20260607.md` Â· M-CC-13 CLOSED |
| PCOMP-W2-QA-04 | M-CC-13 strict retest | QA | FE-05 | [x] | `pcomp-w2-qa-04-20260607.md` Â· M-CC-13 CLOSED |
| PCOMP-W2-QC-04 | Partial W2 gate M-CC-13 | QC | QA-04 | [x] | `pcomp-w2-qc-04-20260607.md` Â· W2 9/13 GWC |
| PCOMP-W2-FE-06 | M-CC-07..10 HR/settings/KPI strict | Dev-FE | QC-05 | [x] | `pcomp-w2-fe-06-20260607.md` Â· QA-05 PASS |
| PCOMP-W2-QA-05 | M-CC-07..10 retest promote 13/13 | QA | QC-05 | [x] | `pcomp-w2-qa-05-20260607.md` PASS_TO_PM |
| PCOMP-W2-QC-05 | W2 P1 cluster gate 13/13 | QC | PM | [x] | `pcomp-w2-qc-05-20260607.md` Â· W2 13/13 P1 GWC |
| PCOMP-W2-FE-07 | M-CC-14/15 Customers/Partners/VehicleTypes | Dev-FE | QC-05 | [x] | `pcomp-w2-fe-07-20260607.md` READY_FOR_QA |
| PCOMP-W2-QA-06 | M-CC-14/15 retest | QA | QC-06 | [x] | `pcomp-w2-qa-06-20260607.md` PASS Â· W2 15/15 |
| PCOMP-W2-QC-06 | W2 full wave gate 15/15 | QC | PM | [x] | `pcomp-w2-qc-06-20260607.md` Â· W2 15/15 GO |

---

## W3 â€” BE integrity & journeys (partial)

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W3-BE-01 | operating-units API | Dev-BE | U39 | [x] | `p1-prod-int-be-04-20260607.md` |
| PCOMP-W3-BE-02 | Scope slug filter 409 fix | Dev-BE | U39 | [x] | `p1-prod-int-be-03-20260607.md` |
| PCOMP-W3-BE-03 | Contracts SQL 500 fix | Dev-BE | incident | [x] | `p1-hrm-inc-api-500-be-20260607.md` |
| PCOMP-W3-FE-01 | G-INT-02 chart labels live API | Dev-FE | QA-04 | [x] | `pcomp-w3-fe-01-20260607.md` Â· QA-04 PASS |
| PCOMP-W3-BE-04 | company_slug_map bridge G-INT-03 | Dev-BE | W0-BA-D | [x] | `pcomp-w3-be-04-20260607.md` |
| PCOMP-W3-BE-05 | SA P0-4 settings batch GET scope | Dev-BE | W0-SA | [x] | `pcomp-w3-be-05-20260607.md` |
| PCOMP-W3-QA-01 | J-HRM-INT + operating-units G-INT-03 | QA | BE-04 | [x] | `pcomp-w3-qa-01-20260607.md` |
| PCOMP-W3-QC-01 | W3 integrity G-INT-02 + Plane B | QC | QA-04 | [x] | `pcomp-w3-qc-01-20260607.md` GWC |
| PCOMP-W3-QA-02 | Persona ceo vs du-lich matrix | QA | BE-02 | [x] | `p1-prod-int-qa-04-20260607.md` |

---

## W4 â€” Mobile

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W4-MOB-01 | Scope screen + API parity | Dev-Mobile | W3-QA-02 | [x] | `pcomp-w4-mob-01-20260607.md` |
| PCOMP-W4-QA-01 | ScopeScreen U39 API parity | QA | MOB-01 | [x] | `pcomp-w4-qa-01-20260607.md` API PASS |
| PCOMP-W4-QA-DEV-01 | J-MOB-01..05 emulator smoke | QA-Device | W2 QC-06 | [x] | `pcomp-w4-qa-device-20260607.md` PASS |
| PCOMP-W4-QC-01 | Mobile L2.5 gate J-MOB | QC | QA-DEV-01 | [x] | `pcomp-w4-qc-01-20260607.md` GWC |
| PCOMP-W4-MOB-UX-01 | UX Wave 1 foundation | Dev-Mobile | FE-SPEC-01 | [x] | `pcomp-w4-mob-ux-01-20260607.md` |
| PCOMP-W4-QA-MUX-01 | AC-MUX-01..05 retest | QA-Device | MOB-UX-01 | [x] | `pcomp-w4-qa-mux-01-20260607.md` GWC |
| PCOMP-W4-MOB-UX-02 | Leave iOS redesign | Dev-Mobile | QA-MUX-01 | [x] | `pcomp-w4-mob-ux-02-20260607.md` READY_FOR_QA |
| PCOMP-W4-QA-MUX-02 | UX-02 leave retest J-MOB-03/04 | QA-Device | MOB-UX-02 | [x] | `pcomp-w4-qa-mux-02-20260607.md` PASS Â· AC-MUX-04 full |
| PCOMP-W4-QC-MUX-02 | UX-02 leave slice gate | QC | QA-MUX-02 | [x] | `pcomp-w4-qc-mux-02-20260607.md` GWC Â· Sá»­a/Há»§y P2 |
| PCOMP-W4-FE-DS-01 | Webâ†”mobile typography Â§10 | Dev-FE | MOB-DS-01 | [x] | `pcomp-w4-fe-ds-01-20260607.md` Â· G-DS-01..08 |
| PCOMP-W4-MOB-UX-03 | DS tokens global apply | Dev-Mobile | FE-DS-01 | [x] | `pcomp-w4-mob-ux-03-20260607.md` READY_FOR_QA |
| PCOMP-W4-QA-MUX-03 | DS AC-DS-01..10 retest | QA-Device | MOB-UX-03 | [x] | `pcomp-w4-qa-mux-03-20260607.md` PASS 13/13 |
| PCOMP-W4-QC-MUX-03 | DS slice gate | QC | QA-MUX-03 | [x] | `pcomp-w4-qc-mux-03-20260607.md` GO AC-DS-01..10 |
| PCOMP-W4-MOB-UX-02b | Home hub Personio widgets | Dev-Mobile | QC-MUX-03 | [x] | `pcomp-w4-mob-ux-02b-20260607.md` READY_FOR_QA |
| PCOMP-W4-QA-MUX-02b | Home hub device retest | QA-Device | MOB-UX-02b | [x] | `pcomp-w4-qa-mux-02b-20260607.md` PASS 9/9 |
| PCOMP-W4-QC-MUX-02b | Home hub slice gate | QC | QA-MUX-02b | [x] | `pcomp-w4-qc-mux-02b-20260607.md` **GO** Â§3.2 |
| PCOMP-W4-MOB-UX-SAFE-01 | Safe area tab bar U47 | Dev-Mobile | U47 user | [x] | `pcomp-w4-mob-ux-safe-01-20260607.md` READY_FOR_QA |
| PCOMP-W4-QA-MUX-03b | Manager inbox device QA | QA-Device | MOB-UX-03b | [x] | GWC â€” UI PASS; write 409 header |
| PCOMP-W4-MOB-HEADER-03b | Approve write UUID header | Dev-Mobile | QA-MUX-03b | [x] | `pcomp-w4-mob-header-03b-20260607.md` READY_FOR_QA |
| PCOMP-W4-BA-HUB-01 | Smart Hub AC delta | BA-Process | U48 | [x] | `MOBILE_HOME_HUB_AC_DELTA.md` |
| PCOMP-W4-MOB-UX-04a | Smart Hub Home v2 | Dev-Mobile | BA-HUB-01 | [x] | READY_FOR_QA |
| PCOMP-W4-BE-HUB-04a | Home summary API | Dev-BE | BA-HUB-01 | [x] | READY_FOR_QA |
| PCOMP-W4-QA-PERSONA-01 | Persona E2E | QA-Device | U47 | [x] | PARTIAL â€” gaps |
| PCOMP-W4-MOB-LEAVE-META-01 | Leave create metadata | Dev-Mobile | QA-PERSONA-01 | [x] | READY_FOR_QA |
| PCOMP-W4-PROFILE-AVATAR-01-BE | avatar_url schema + PATCH | Dev-BE | U50 | [x] | READY_FOR_QA |
| PCOMP-W4-PROFILE-AVATAR-01-FE | Web self-service avatar | Dev-FE | BE avatar | [x] | READY_FOR_QA |
| PCOMP-W4-PROFILE-AVATAR-01-MOB | Mobile avatar upload | Dev-Mobile | BE avatar | [x] | READY_FOR_QA |
| PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY | J-AVT-01 web display nip.io | QA | DO-AVT-WEB-03 | [x] | `pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md` **PASS** |
| PCOMP-W4-QC-AVT-DISPLAY-R4 | J-AVT-01 web L3 gate | QC | QA-DISPLAY-R4 | [x] | `pcomp-w4-qc-avatar-display-r4-20260607.md` **GO (scoped)** |

---

## W7 â€” Mobile gap closure (U51)

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W7-BA-SRS-01 | SRS+TechSpec W7 pack (04b..directory) | BA | U51 | [x] | MOBILE_W7_SRS_DELTA.md + DATA_CONTRACTS |
| PCOMP-W7-SA-SKIM-01 | Scope parity skim | SA | BA-SRS | [x] | pcomp-w7-sa-skim-01-20260607.md |
| PCOMP-W7-BE-04b-01 | Home celebrations + whos_out API | Dev-BE | SA | [x] | pcomp-w7-be-04b-01-r2-20260607.md |
| PCOMP-W7-MOB-UX-04b | Celebrations + Who's out UI | Dev-Mobile | BE-04b | [x] | pcomp-w7-mob-ux-04b-20260607.md |
| PCOMP-W7-QA-04b-01 | J-MOB-08/09 API retest | QA | BE+MOB 04b | [x] | pcomp-w7-qa-04b-01-r2-20260607.md PASS |
| PCOMP-W7-QC-04b-01 | W7-1 hub API slice gate | QC | QA-04b | [x] | pcomp-w7-qc-04b-01-20260607.md **GWC** |
| PCOMP-W7-QA-HUB-04b | J-MOB-08/09 device UI (C-W7QC-DEVICE-01) | QA-Device | QC-04b | [x] | empty device PASS 20260728 |
| PCOMP-W7-MOB-LEAVE-DOC | Leave medical upload | Dev-Mobile | BA-SRS | [x] | W7-3 · DOC-02 device PASS 20260728 |
| PCOMP-W7-MOB-LEAVE-BAL | Leave balance widget | Dev-BE+Mobile | BA-SRS | [x] | W7-4 · BAL-02 device PASS 20260728 |
| PCOMP-W7-MOB-DIRECTORY | Employee directory | Dev-Mobile | BA-SRS | [x] | W7-5 · QA 20260728 PASS |
| PCOMP-W7-MOB-PROFILE-FULL | MOB-12 full profile | Dev-Mobile | BA-SRS | [x] | W7-6 · device QA 20260728 PASS |

---

## W5 â€” Verification & QC

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W5-DO-01 | `verify:product:completion` exit 0 | DevOps | W1â€“W4 | [x] | `pcomp-w5-do-01-20260607.md` |
| PCOMP-W5-QA-01 | Full RBAC + journey regression | QA | W5-DO-01 | [x] | `pcomp-w5-qa-01-20260607.md` |
| PCOMP-W5-QC-01 | Product completion GO/GWC | QC | W5-QA-01 | [x] | `pcomp-w5-qc-01-20260607.md` GWC |
| PCOMP-W5-TM-01 | Architecture sign-off residual | TM | W5-QC-01 | [x] | `pcomp-w5-tm-01-20260607.md` scope_parity PASS |

---

## W6 â€” Sponsor UAT

| ID | Task | Owner | Dep | Status | Evidence |
|----|------|-------|-----|--------|----------|
| PCOMP-W6-PM-01 | PROJECT_STATUS_REPORT + USER_SERVICE_STATUS | PM | W5-QC-01 | [x] | `pcomp-w6-pm-01-20260607.md` |
| PCOMP-W6-SP-01 | Sponsor UAT sign-off | Sponsor | W6-PM-01 | [ ] | |

---

## Integrity program carry-over (U39 â€” linked)

| ID | Task | Status |
|----|------|--------|
| U39-W1-SA | ADR delta multi-company | [x] |
| U39-W1-BA-P | SRS Â§15 UC scope | [x] |
| U39-W1-BA-D | BR-DQ-01 cardinality | [x] |
| U39-W2-FE | Operating unit filter + mock sweep partial | [x] |
| U39-W3-QC | Integrity gate R2/R3 | [~] |

---

## PM dispatch queue (next â€” auto, U42 zero-stop)

1. ~~**QC** `PCOMP-W2-QC-06`~~ â€” **DONE** W2 15/15 GO (`pcomp-w2-qc-06-20260607.md`)
2. **QA-Device** â€” J-MOB-01..05 emulator smoke (residual after W4 API PASS)
3. **Sponsor** `PCOMP-W6-SP-01` â€” localhost UAT sign-off (post W6-PM-01 sync)
4. **Program** â€” close W5-QC-01 GWC residuals (G-INT-05/06/08 browser, nip.io)

**Milestone exit:** W6 sponsor UAT-PASS + residual GWC closed + legacy PROD lane â€” **not** claim Phase 1 DONE at ~90%.




