# Team đang làm — pulse PM

**Cập nhật:** 2026-08-11T14:30 · **PM lane ACTIVE — rolling queue until all SRS UCs done** (per sponsor directive 2026-08-11)

## Lane duy nhất (execution)

| Lane | Owner | Việc |
|------|--------|------|
| **Cursor Task** | dev-be · dev-fe · qa | Reclaim wave: `docs/program/dispatch/CURSOR-RECLAIM-CLAUDE-UC-WAVE-01.md` |
| **PM (Claude)** | **ACTIVE** | Dispatch → monitor → QC gates → re-dispatch per OS rules |

### Wave 1 (dispatched)

| work_item_id | Role | Trạng thái |
|--------------|------|------------|
| `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` | dev-fe | **DONE** · QA `COHCQA1-MSNFXBJS` |
| `QA-HRM-CO-01-HEADCOUNT-01` | qa | **PASS** |
| `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` | dev-be | **DONE** · QA `ATTLVTSOTQA-MSNG88NH` |
| `QA-HRM-SETTINGS-ATT-LVT-SOT-01` | qa | **PASS** |
| `PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01` | dev-fe | **DONE** · QA `ATTLVTSOTFEQA-MSNGJ8T2` |
| `QA-HRM-SETTINGS-ATT-LVT-SOT-FE-01` | qa | **PASS** |
| `QC-HRM-SETTINGS-ATT-LVT-SOT-GWC-01` | qc | **GWC** `ATTLVTSOTQC1-MSNGQC01` · seal `PM-HRM-SC-01-ATT-LVT-SEAL-01.md` |
| `GOV-HRM-SETTINGS-POST-ATT-SA-01` | sa | **DONE** · `GOV-HRM-SETTINGS-POST-ATT-SA-01.md` |
| `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` | dev-fe | **DONE** · QA `SETFID02W3-MSNHB5VD` |
| `PO-HRM-SETTINGS-FIDELITY-QA-02` | qa | **PASS** |
| `QC-PO-HRM-SETTINGS-W3-MUTATE-GATE-01` | qc | **GWC** `SETW3MUTQC1-MSNHB5QC1` · seal `PM-PO-HRM-SETTINGS-W3-MUTATE-SEAL-01.md` |
| `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` | ba-process | **DONE** · delta §6–§8 |
| `PO-HRM-JD-IA-LIST-DETAIL-FE-01` | dev-fe | **DONE** · QA `JDSETMUT-MSNHWI0A` |
| `PO-HRM-SETTINGS-JD-MUTATE-QA-01` | qa | **PASS** |
| `QC-PO-HRM-SETTINGS-JD-MUTATE-01` | qc | **GWC** `JDSETMUTQC1-MSNHWI0QC1` · seal `PM-PO-HRM-SETTINGS-JD-MUTATE-SEAL-01.md` |
| `QA-PO-HRM-SETTINGS-W3-BROWSER-01` | qa | **PASS** `SETW3SWP-MSNHWVTO` |
| `QC-PO-HRM-SETTINGS-W3-SWEEP-GATE-01` | qc | **GWC** `SETW3SWPQC1-MSNHWVTOQC1` · seal `PM-PO-HRM-SETTINGS-W3-SWEEP-SEAL-01.md` |
| `QA-HRM-SETTINGS-DEPT-CONSUMER-REG-01` | qa | **PASS** `DEPTCONREG1-MSNI8GJZ` · seal `PM-HRM-SETTINGS-DEPT-CONSUMER-SEAL-01.md` |
| `BA-HRM-REC-CHANNELS-CONSUMER-01` | ba-data | **PASS** · `BA-HRM-REC-CHANNELS-CONSUMER-01.md` |
| `PO-HRM-REC-CHANNELS-CONSUMER-FE-01` | dev-fe | **DONE** |
| `PO-HRM-REC-YCTD-*` / WF / BOD | dev-fe/be | **DONE** (QA prechain) |
| `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` | qa | **PASS** #5 `RECCHQA-MSNKIJ5R` |
| `PO-HRM-REC-CHANNELS-CONSUMER-QC-01` | qc | **GWC** `RECCHQC1-MSNKIJ5QC1` · seal `PM-HRM-REC-CHANNELS-CONSUMER-SEAL-01.md` |
| `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-01` | ba-process | **PASS** · P0 `job_titles` → QTCT `AC-SET-CONSUMER-JT-WH-01` |
| `D-BE-HRM-WH-POSITION-KEY-01` | dev-be | **READY_FOR_QA** · jest 22 · `po-hrm-settings-consumer-jt-wh-be-01.md` |
| `D-FE-HRM-WH-POSITION-PICKER-01` | dev-fe | **READY_FOR_QA** · `po-hrm-settings-consumer-jt-wh-fe-01.md` |
| `QA-PO-HRM-WH-POSITION-PICKER-01` | qa | **FAIL** `WHPOS1-MSNL05LB` — POST 400 HRM-WH-PICK-REQUIRED vs GET items |
| `D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01` | dev-be | **READY_FOR_QA** · main→holding catalog parity · `po-hrm-settings-consumer-jt-wh-be-02.md` |
| `QA-PO-HRM-WH-POSITION-PICKER-02` | qa | **PASS** `WHPOS1-MSNL78LF` · `qa-po-hrm-settings-consumer-jt-wh-02.md` |
| `QC-PO-HRM-SETTINGS-CONSUMER-JT-WH-01` | qc | **GWC** `WHPOSQC1-MSNL78QC1` · seal `PM-PO-HRM-SETTINGS-CONSUMER-JT-WH-SEAL-01.md` |
| `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-02` | ba-data | **PASS** · `employment_types` **AC-SET-CONSUMER-ET-CTR-01** |
| `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-01` | dev-fe | **READY_FOR_QA** · vitest 14 · `po-hrm-employment-types-consumer-ctr-fe-01.md` |
| `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01` | qa | **FAIL** — picker 15/15 OK; mutate POST+F5 chưa capture |
| `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-02` | qa | **FAIL** `ETCTRQA1-MSNMP1F3` — parity OK; mutate 400 REC-400 / edit WA |
| `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02-HARNESS-01` | dev-fe | **READY_FOR_QA** · edit hydrate · `po-hrm-employment-types-consumer-ctr-fe-02.md` |
| `D-BE-HRM-CTR-WORK-ARRANGEMENT-EMP-EFF-01` | dev-be | **READY_FOR_QA** · jest 4/4 · `po-hrm-employment-types-consumer-ctr-be-01.md` |
| `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-03` | qa | **FAIL** `ETCTRQA1-MSNNCC2O` — PATCH 400 `HRM-CON-TYPE-KEY` label vs code |
| `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03-CONTRACT-TYPE-HYDRATE-01` | dev-fe | **READY_FOR_QA** · probe exit 0 · `po-hrm-employment-types-consumer-ctr-fe-03.md` |
| `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-04` | qa | **PASS** `ETCTRQA1-MSNNRUZQ` · AC-SET-CONSUMER-ET-CTR-01 |
| `QC-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-NARROW-01` | qc | **GWC** `ETCTRQC1-MSNNRUQC1` · seal `PM-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-SEAL-01.md` |
| `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-03` | ba-data | **PASS** · `leave_types` **AC-SET-CONSUMER-LV-ATT-01** |
| `PO-HRM-LEAVE-TYPES-CONSUMER-ATT-FE-01` | dev-fe | **READY_FOR_QA** · VAL-LV-ATT-FE-01 · `po-hrm-leave-types-consumer-att-fe-01.md` |
| `QA-HRM-LEAVE-TYPES-CONSUMER-ATT-01` | qa | **PASS** narrow `ATTLVTCON1-MSNO8B9F` · `qa-hrm-leave-types-consumer-att-01.md` |
| `QC-HRM-LEAVE-TYPES-CONSUMER-ATT-GWC-01` | qc | **GWC** `ATTLVTCONQC1-MSNO8BQC1` · seal `PM-HRM-LEAVE-TYPES-CONSUMER-ATT-SEAL-01.md` |
| `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-04` | ba-process | **PASS** · **AC-SET-CONSUMER-JG-REC-01** (`job_grades` YCTD) |
| `D-FE-HRM-REC-JOB-GRADE-CONSUMER-01` | dev-fe | **READY_FOR_QA** · vitest 4/4 · `po-hrm-job-grades-consumer-rec-fe-01.md` |
| `D-BE-HRM-REC-JOB-GRADE-ASSERT-01` | dev-be | **READY_FOR_QA** · jest 3/3 · `po-hrm-job-grades-consumer-rec-be-01.md` |
| `QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01` | qa | **PASS** `JGRECQA-MSNP1AX8` · AC-SET-CONSUMER-JG-REC-01 |
| `QC-PO-HRM-JOB-GRADES-CONSUMER-REC-01` | qc | **GWC** `JGRECQC1-MSNP1AXQC1` · seal `PM-HRM-JOB-GRADES-CONSUMER-REC-SEAL-01.md` |
| `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-05` | ba-process | **PASS** · **AC-SET-CONSUMER-PT-PAY-01** (`pay_types` Payroll) |
| `D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01` | dev-fe | **READY_FOR_QA** · vitest 57/57 · `po-hrm-pay-types-consumer-pay-fe-01.md` |
| `QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01` | qa | **PASS** `PTPAYQA-MSNPHTEC` · AC-SET-CONSUMER-PT-PAY-01 narrow |
| `QC-PO-HRM-PAY-TYPES-CONSUMER-PAY-01` | qc | **GWC** `PTPAYQC1-MSNPHTECQC1` · seal `PM-HRM-PAY-TYPES-CONSUMER-PAY-SEAL-01.md` |
| `PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-03` | pm | **SEALED** §16.7 PT-PAY CREATE leg · matrix BR-01 still OPEN |
| **PO-HRM-CTR-WORKSPACE-WAVE-G1** | ba-process | **PASS** · `PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md` · `UI-CTR-WORKSPACE.md` |
| **PO-HRM-CTR-WORKSPACE-WAVE-G2** | sa | **PASS** · `ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md` · slice G3 |
| **PO-HRM-CTR-WORKSPACE-WAVE-G3** | dev-fe | **PROMOTED** (G4 C-SLICEs) · unified workspace shell |
| **PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B** | qa | **FAIL_TO_PM** · P0 compile `ContractCreateWizardDialog.tsx` L15-19 · `qa-po-hrm-ctr-workspace-g4-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-COMPILE-P0-FE-01** | dev-fe | **READY_FOR_QA** · vitest 15/15 · Vite 200 · `g4-compile-fix-fe-01.md` |
| **PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B-RETEST-01** | qa | **FAIL_TO_PM** · compile OK · 09–11 PASS · CREATE 400 + edit deeplink FAIL · `g4-retest-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01** | dev-be | **READY_FOR_QA** · start_date optional + default today · jest 47 · `be-create-start-date-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-RETEST-01** | qa | **FAIL_TO_PM** · start_date **CLOSED** · new P0 `HRM-CTR-SUBJECT-REC-400` · `g4-create-start-date-retest-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01** | dev-be | **READY_FOR_QA** · REC trace gate removed · jest 13/13 · `be-subject-rec-nv-first-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QA-01** | qa | **PASS_TO_PM** · WS-G4-02/06/07 + CREATE journeys PASS · `g4-subject-rec-nv-first-retest-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-QC-01** | qc | **GWC** · `CTRG4NVFRQC1-MSO3QNLZQC1` · CREATE slice sealed |
| **PO-HRM-CTR-WORKSPACE-G4-NV-FIRST-PM-SEAL-01** | pm | **SEALED** · carry **DISPATCHED** same session |
| **PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01** | dev-fe | **READY_FOR_QA** · banner «Mở tuyển dụng» · vitest 16/16 · `fe-br-ctr-create-08-banner-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QA-01** | qa | **PASS_TO_PM** · NV101 banner + Tiếp 201 · `g4-br-ctr-create-08-banner-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-QC-01** | qc | **GWC** · `CTRG4BR08QC1-MSO6CG6XQC1` · positive CLOSED · negative PASS_WITH_HOLD |
| **PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QA-01** | qa | **PASS_TO_PM** · **DEF CLOSED** · `g4-dom-nesting-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QC-01** | qc | **GWC** · `CTRWSG4DOMQC1-MSO6AR3QC1` |
| **PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QA-01** | qa | **PASS_TO_PM** · WS-G4-07 PASS · `CTRG4G07-MSO6B4UU` |
| **PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QC-01** | qc | **GWC** · `CTRG4G07QC1-MSO6B4UUQC1` · WS-G4-07 PASS |
| **PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QA-01** | qa | **PASS_TO_PM** · WS-G4-12 PASS_WITH_HOLD · 13/14 BLOCKED U65 · `g4-profile-rec-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-PROFILE-REC-QC-01** | qc | **GWC** · `CTRG4PRQC1-MSO684W1QC1` · J-HRM-CTR-PROFILE-01 promoted |
| **PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02** | dev-fe | **DONE** · JSDoc fix · embed 200 |
| **PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02** | qa | **PASS_TO_PM** · WS-G4-12 strict · `CTRG4URL-MSO7HQ08` |
| **PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QC-02** | qc | **GWC** · `CTRG4URLQC1-MSO7HQ08QC1` · WS-G4-12 strict sealed |
| **PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02** | dev-fe | **DONE** · commit `5ccb26e` |
| **PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02** | qa | **PASS_TO_PM** · WS-G4-13 PASS · `CTRG4HIRE-RT2-MSO89GMT` |
| **PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-QC-01** | qc | **GWC** · `CTRG4HIREQC1-MSO89GMTQC1` · WS-G4-13 PASS · hire chain sealed |
| **PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01** | pm | **OPEN** · pack P.CNTT 67 files · 6 mô hình lương |
| **PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01** | ba-process | **PASS_TO_PM** · 63 fragments · 30 PDF OCR · catalog SoT |
| **PO-HRM-PAY-CNTT-BA-DATA-FRAGMENT-MAP-02** | ba-data | **PASS_TO_PM** · column→fragment_id · 18 GAP-FRG · `XLSX-COLUMN-MAP.md` |
| **PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02** | sa | **PASS_TO_PM** · ADR-HRM-PAY-FRAGMENT-BIND-01 · DB §8.7 · GAP-FRG disposition |
| **PO-HRM-PAY-CNTT-API-FRAGMENT-MAP-02** | sa | **PASS_TO_PM** · §12 EXPAND · FRG-404/412/409 · DB §8.8 |
| **PO-HRM-PAY-CNTT-BE-02** | dev-be | **IN_PROGRESS** · ensureSchema §8.7–8.8 · fragment validation |
| **PO-HRM-AMIS-PARITY-PAY-DEPTH-01** | ba-process + sa | **PASS_TO_PM** · BR/AC DOC template columns + SRC + input packs locked |
| **PO-HRM-AMIS-PARITY-PAY-TPL-DATA-01** | ba-data | **DISPATCHED** · physicalize pay_sheet_template + override FK per SA Option B |
| **PO-HRM-PAY-CNTT-BA-PROCESS-01** | ba-process | **PASS_TO_PM** · 49ô · 12 UC STP · 8 F-STP P0 · `po-hrm-pay-cntt-ba-process-01.md` |
| **PO-HRM-PAY-CNTT-BA-DATA-01** | ba-data | **PASS_TO_PM** · 4 DONE probed · GAP-CNTT-01..14 · spec + evidence |
| **PO-HRM-PAY-CNTT-SA-01** | sa | **PASS_TO_PM** · L1–L6 · 2 ADR · formula eval HOLD |
| **PO-HRM-PAY-CNTT-LINKAGE-QA-01** | qa | **PASS_TO_PM** · menu inventory · `po-hrm-pay-cntt-linkage-qa-01.md` |
| **PO-HRM-PAY-CNTT-API-01** | sa | **PASS_TO_PM** · F-PAY-POLICY-PACK + INPUT-PROFILE + SETUP-RESOLVE · DB §8 |
| **PO-HRM-PAY-CNTT-BE-01** | dev-be | **QA PASS R2** · L0–L1 · stamp `CNTTBER2QA-MSO8HVER` |
| **D-PAY-CNTT-BE-COMPILE-01** | dev-be | **DONE** · BridgeAdvanceToPeriodDto restored |
| **QA-PO-HRM-PAY-CNTT-BE-01-R2** | qa | **PASS_TO_PM** · 27/27 · live ACs PASS · browser NOT_PROMOTED |
| **QC-PO-HRM-PAY-CNTT-BE-01** | qc | **GWC** · `CNTTBEQC1-MSO8HVERQC1` · BE L1 sealed · carry `R-CNTT-FE` |
| **PO-HRM-PAY-CNTT-FE-STP-01** | dev-fe | **IN_PROGRESS** · closes `R-CNTT-FE` · Thiết lập hub L1–L6 |
| **PO-HRM-UIUX-PIPELINE-PLAYBOOK-01** | pm | **PUBLISHED** · `PM_PO_DELIVERY_PIPELINE_UIUX.md` + OS `UI_SCREEN_SPEC.md` |
| **PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-FE-01** | dev-fe | **READY_FOR_QA** · parent URL merge · vitest 18/18 · `fe-edit-deeplink-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QA-01** | qa | **PASS_TO_PM** · WS-G4-03-EDIT CLOSED · `g4-edit-deeplink-retest-01.md` |
| **PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QC-01** | qc | **GWC** · `CTRWSG4EDQC1-MSO2JT9QC1` · edit slice sealed · `contracts_printable_ready=false` |
| **PO-HRM-CTR-WORKSPACE-SA-01** | sa | **PASS** · `PO-HRM-CTR-WORKSPACE-SA-01.md` · ADR §14 · API §13 |
| **PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01** | dev-be | **READY_FOR_QA** · jest 33/33 · GET `clause_layout[]` |
| **PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01** | dev-fe | **READY_FOR_QA** · vitest 13/13 · GET `clause_layout` view bind |
| **PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01** | qa | **FAIL_TO_PM** · cùng P0 wizard syntax · BE GET layout API PASS · `qa-ws-g4-layout-01.md` |
| **PO-HRM-CTR-UIUX-SPEC-PACK-G5** | ba-process | **PASS** · `UI-HRM-CTR-SPEC-INDEX.md` + pack A–G · trace G5 |
| `QA-HRM-SETTINGS-CONSUMER-PAY-STALE-01` | qa | **PASS** `QACONPAYST1-MSNG1JPS` |
| `QC-HRM-SETTINGS-CONSUMER-PAY-STALE-GWC-01` | qc | **GWC** `QACONPAYSTQC1-MSNG1JQC1` · board `PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-01.md` |

SoT reclaim: `CURSOR-RECLAIM-CLAUDE-UC-WAVE-01.md` · backlog `PHASE1_UC_CLOSURE_BACKLOG.md`

## L0

`pnpm run qc:fe-be-health` — chạy trước QA browser

## Stack

`:5173` · `:28001` · `:28002` · U65 zero seed
