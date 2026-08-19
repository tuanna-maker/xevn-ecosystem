# PM seal — Contract workspace G4 C-SLICEs (NV-first)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01` |
| **date** | 2026-08-11 |
| **edit_qc_stamp** | `CTRWSG4EDQC1-MSO2JT9QC1` · [QC narrow edit deeplink](be15fd8c-1e8f-45c5-9807-5a19fe7318ca) |
| **create_qc_stamp** | `CTRG4NVFRQC1-MSO3QNLZQC1` · [QC narrow CREATE NV-first](e2826eda-7603-4efb-a251-9996abdff7e5) |
| **profile_qc_stamp** | `CTRG4PRQC1-MSO684W1QC1` · [QC narrow profile REC](9187ec8f-9ae8-427a-85a3-d24ea70613a1) |
| **profile_url_qa_stamp** | `CTRG4URL-MSO7HQ08` · [QA profile URL retest 02](93ae7eea-2171-4b9c-91f7-bea3e3371f11) |
| **profile_url_qc_stamp** | `CTRG4URLQC1-MSO7HQ08QC1` · [QC profile URL GWC](0a46a851-b571-4465-b126-729ce2ce9b06) |
| **hire_qc_stamp** | `CTRG4HIREQC1-MSO89GMTQC1` · [QC REC hire GWC](2c38c434-726d-45f3-8917-c64722bba026) |
| **banner_qc_stamp** | `CTRG4BR08QC1-MSO6CG6XQC1` · [QC BR-CTR-CREATE-08 banner](cca62e45-eacb-4d0a-82d6-df3dc5ff8fca) |

## GWC — promoted (narrow C-SLICE, U65 browser)

| Area | Rows / defect | Verdict |
|------|----------------|---------|
| Compile embed | P0 wizard JSDoc | **CLOSED** · embed mounts |
| View layout bind | WS-G4-09..11 | **PASS** · GET `clause_layout`, `can_issue` gate |
| Edit deep-link | WS-G4-03-EDIT | **PASS** · `DEF-CTR-G4-EDIT-DEEPLINK-P1` **CLOSED** |
| NV-first CREATE | WS-G4-02/04/06/07 | **PASS** (WS-G4-07 **PASS** `CTRG4G07QC1`) |
| BR-CTR-CREATE-08 banner | DEF banner NV101 | **GWC CLOSED** · positive path · `CTRG4BR08QC1` · negative `candidate_id` PASS_WITH_HOLD |
| DOM nesting | DEF-CTR-G4-DOM-NESTING-P2 | **CLOSED** GWC `CTRWSG4DOMQC1` |
| Journeys | J-HRM-CTR-CREATE-01/02 | **PASS** |
| Start date | DEF-CTR-G4-CREATE-START-DATE-400 | **CLOSED** |
| Subject REC | DEF-CTR-G4-SUBJECT-REC-400 | **CLOSED** |
| Profile launcher | WS-G4-12 / J-HRM-CTR-PROFILE-01 | **PASS strict** · QC `CTRG4URLQC1-MSO7HQ08QC1` · QA `CTRG4URL-MSO7HQ08` · prior REC GWC `CTRG4PRQC1` (URL hold superseded) |
| REC hire chain | WS-G4-13/14 · J-HRM-CTR-HIRE-01 | **GWC** · WS-G4-13 **PASS** · WS-G4-14 **PASS_WITH_HOLD** · QC `CTRG4HIREQC1-MSO89GMTQC1` · `DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE` **CLOSED** |

Evidence index:
- `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md`
- `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.md`
- `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-br-ctr-create-08-banner-01.md`
- `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-profile-url-02.md`
- `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md`
- `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md`
- `docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-rec-hire-01.md`

## Carry (dispatched 2026-08-11 — sponsor không cần chốt thêm)

| ID | Sev | Owner | WI | Status |
|----|-----|-------|-----|--------|
| WS-G4-07 full confirm | — | qa→qc | `…-WS-G4-07-*` | **GWC** `CTRG4G07QC1` · **PASS** |
| BR-CTR-CREATE-08 FE banner | P2 | dev-fe→qa→qc | `…-BANNER-*` | **GWC** `CTRG4BR08QC1` · positive CLOSED · negative PASS_WITH_HOLD |
| WS-G4-13/14 REC hire | P0 | — | `…-REC-HIRE-QC-01` | **GWC** `CTRG4HIREQC1-MSO89GMTQC1` · WS-G4-13 PASS · WS-G4-14 PASS_WITH_HOLD |
| DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES | P2 | dev-fe (defer) | — | **OPEN carry** · nav active indicator |
| DEF-CTR-G4-PROFILE-URL-P2 | P2 | dev-fe→qa→qc | `…-PROFILE-URL-*` | **GWC CLOSED** · `CTRG4URLQC1-MSO7HQ08QC1` |
| DEF-CTR-G4-PROFILE-URL-F5-P3 | P3 | dev-fe (defer) | — | **OPEN carry** · F5 drops workspace params |
| DEF-CTR-G4-DOM-NESTING-P2 | P2 | — | `…-DOM-NESTING-*` | **CLOSED** GWC `CTRWSG4DOMQC1` |

## Retain

`contracts_printable_ready=false` · prior pay-types / settings consumer seals · G3 unified `ContractWorkspaceDialog` shell.

## Denied

UF-HRM-10 full · CTR module UAT · `contracts_printable_ready=true` flip · full G4 matrix GO (C-SLICE ≠ module).

## Program note

Contract workspace wave **partial UAT-ready** on promoted rows; Settings clause SoT (WS-G4-15..17) and printable PDF spine remain **PLANNED/HOLD**.
