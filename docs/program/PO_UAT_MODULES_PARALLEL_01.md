# PO — UAT song song 4 module HRM

| Meta | Value |
|------|--------|
| **Program** | `PO-UAT-MODULES-PARALLEL-01` |
| **Opened** | 2026-08-07 |
| **Sponsor** | Chạy song song UAT: HĐ in · chấm công · NS · tuyển dụng |
| **Honesty** | Module flags remain **false** until QC GO per module · Phase1 **DENIED** this wave |
| **U65** | zero-seed · browser FE-only |

## Waves
| ID | Module | Owner | Status |
|----|--------|-------|--------|
| `PO-UAT-CTR-01` | Hợp đồng in | qa→qc | **GWC CLOSED** · `contracts_printable_ready=false` |
| `PO-UAT-ATT-01` | Chấm công | qa→qc | **GWC CLOSED** · `attendance_uat_ready=false` |
| `PO-UAT-EMP-01` | Nhân sự | qa→qc | **GWC CLOSED** · `hrm_personnel_uat_ready=false` |
| `PO-UAT-REC-01` | Tuyển dụng | qa→qc | **GWC CLOSED** · `recruitment_uat_ready=false` |
| `PO-UAT-PHASE1-PREP-01` | Phase1 / prep prod | qc | **CLOSED NO-GO Phase1 (PREP-ONLY)** · evidence `docs/qa/evidence/po-uat-phase1-prep-01.md` · all `*_ready=false` |

## Program status
**UAT parallel wave CLOSED** as PREP-ONLY — 4× pack-slice GWC · **not** module UAT-READY · Phase1 / PROD **DENIED**. Residual active: X.E 8 `template_code` (`XEVN-TPL-API-01` → BE/FE).

## Exit (per module)
QA PASS_TO_PM → QC narrow GO/GWC → PM may set module `*_uat_ready` only if QC GO **and** sponsor AC pack complete — default keep false until QC says GO without blocking conditions on core UF.
