# Evidence — PO-HRM-JD-DYNAMIC-SPEC-01

**Role:** ba-process · **lane:** governance  
**Date:** 2026-08-06  
**ack_status:** PASS_TO_PM

## completion_report

### Closed
- ADD-only delta SRS/FR draft: `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md`
- UC: UC-BP-REC-00a / 00b / 00c (neo FR-UC-BP-REC-00 — không wipe)
- BR: BR-BP-JD-DYN-01..08 (+ spine BR-BP-JD-01)
- AC FE: AC-JD-DYN-01..16 (2xx UI · F5 · empty/error)
- sequenceDiagram Mermaid VI có dấu — cấu hình → kéo → lưu → view → YCTD
- Out-of-scope: invent brand màu; career site public; REC-03; OCR; PAY formula DnD
- Journey stamp BA trace §23: J-HRM-JD-01..03
- Handoff fields ba-data + sa trong spec §13–14
- **Cấm** `apps/**` — không đụng code

### Residual / open
- Q1: palette trong dialog Thêm vs màn mẫu tách — mặc định trong dialog
- Q2: nguồn select options (catalog nào) — ba-data + sa
- A2: layout global vs per-JD — sa chốt
- ba-docs merge vào `SRS_HRM_ENTERPRISE.md` **sau** sponsor confirm (không merge trong wave này)
- Dev HOLD đến DATA + ARCH READY

## next_owner
sa (song song ba-data) — synth sau cả hai PASS

## Files
| Path | Role |
|------|------|
| `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` | SoT delta process |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` §23 | J-* ADD |
| `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` | Slice sponsor |

## Verify
- [x] no_prompt_echo trong nội dung nghiệp vụ khách-grade
- [x] ADD-only · REC-00 spine cited
- [x] TopCV = quality bar only
- [x] no apps/**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-JD-DYNAMIC-ARCH-01
lane: governance · sa
parallel_ok: ba-data PO-HRM-JD-DYNAMIC-DATA-01
read_first:
  - docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md
  - docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md § FR-UC-BP-REC-00
  - docs/qa/evidence/po-hrm-jd-dynamic-spec-01.md
entry_criteria: ba-process PASS_TO_PM SPEC-01
exit_criteria:
  - ADR/TechSpec outline: jd field catalog + layout + job-template compatibility
  - API boundary Settings vs Recruitment; scope parity list↔get
  - display-ready / cấm FE aggregate write DTO
  - chốt A2 layout global vs per-JD; ghi Q1/Q2 disposition
  - must_keep REC-00 YCTD · BR-BP-JD-DYN-06 token-only · U65
  - no apps/** code
evidence_path: docs/qa/evidence/po-hrm-jd-dynamic-arch-01.md
ack_status: PASS_TO_PM
next_owner after both DATA+ARCH: ba-docs merge delta OR PM sponsor confirm gate
```
