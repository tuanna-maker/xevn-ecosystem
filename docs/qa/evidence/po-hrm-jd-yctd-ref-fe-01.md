# Evidence — PO-HRM-JD-YCTD-REF-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-FE-01` |
| **role** | dev-fe |
| **lane** | execution |
| **change_mode** | ADD |
| **date** | 2026-08-06 |
| **journey** | `J-HRM-JD-YCTD-01` (browser execute = QA next) |
| **honesty** | **DENIED:** `jd_dynamic_done` · remaster · JobPostingsTab as JD SoT · seed helpers · UV invent |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` v0.10 · **FR-UC-BP-REC-02** / **02b** Diễn biến **1a–1d** · Thành công FE |
| **tech_spec** | `docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` · **F-YCTD-JD-01..05** |
| **db_design** | `PO-HRM-JD-YCTD-REF-DB-01.md` · ONE soft FK `job_template_id` · alias `job_description_id` |
| **api_design** | `PO-HRM-JD-YCTD-REF-API-01.md` **CONFIRMED** · bindable list · preview=yctd · STATUS/REQUIRED/NOT-FOUND · display jd_code/title |
| **qa_plan** | `docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md` §7 FE unlock |
| **sponsor_confirm** | Cascade QA-PLAN-01 PASS + DB/API CONFIRMED · PM unlock FE-01 |

---

## What changed (narrow)

| Area | Change |
|------|--------|
| **Picker SoT** | Create YCTD opens with `GET …/job-templates?bindable=true`; client `filterBindableJobTemplates` defense |
| **Empty 0 Hiệu lực** | Empty state + CTA «Mở Thư viện JD»; submit disabled when `libraryEmpty` |
| **Preview** | `getJobDescriptionTemplateYctdPreview` → UI `data-testid="yctd-jd-preview"` (title + short); local compose fallback if endpoint not ready; STATUS/NOT-FOUND clears selection |
| **Errors** | `apiError` friendly map `HRM-JD-YCTD-STATUS` / `REQUIRED` / `NOT-FOUND`; create form `setError` + toast |
| **List/detail F5** | Column/detail «JD gắn» via `resolveRequisitionJdDisplay` (`jd_code` · `jd_title` + soft FK fallback) |
| **must_keep** | Soft FK `job_template_id` wire · HDSD labels/testids · no dual-write UI |

**FORBIDDEN stamped:** no JobPostingsTab import as JD source · no seed helpers · no remaster / `jd_dynamic_done` claim.

---

## Files touched

| Path | Notes |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | `bindable` query · `HrmYctdJdPreview` · `getJobDescriptionTemplateYctdPreview` · requisition `jd_code`/`jd_title` |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | bindable filter · local preview · jd display · empty CTA copy |
| `apps/web/hrm/src/lib/apiError.ts` | HRM-JD-YCTD-* VI messages |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | picker/preview/errors/list+detail · CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | FE-01 unit + contract asserts |

---

## Verify

```text
pnpm exec vitest run src/lib/jobRequisitionUi.test.ts
→ 41 passed (apps/web/hrm)
```

Maps UF-YCTD-JD-01a..d + J-HRM-JD-YCTD-01 click path for QA browser (U65) — **not** executed this seat.

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-YCTD-JD-BE | BE-01 bindable/status/display-ready must land for full Network contract | **dev-be** parallel |
| R-YCTD-JD-QA | Browser U65 execute UF + J-HRM-JD-YCTD-01 · zero-seed | **qa** |

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | FE ADD complete: YCTD create picker bindable-only; preview title/short; empty CTA; STATUS/REQUIRED surface; list/detail jd ref after 2xx+F5 path wired. Vitest 41 PASS. No JobPostingsTab SoT. No remaster/`jd_dynamic_done`. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-jd-yctd-ref-fe-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-YCTD-REF-QA-01
role: qa
lane: execution
entry_criteria: FE-01 READY_FOR_QA + BE-01 READY_FOR_QA (or BE bindable/status live)
U65 zero-seed · browser-only · persona ceo@xe.vn / Xevn@2026
journey: J-HRM-JD-YCTD-01
UF: UF-YCTD-JD-01a..d · 01-F5 · 05 · 06
AC: AC-YCTD-JD-01..06
read_first:
  docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md
  docs/qa/evidence/po-hrm-jd-yctd-ref-fe-01.md
  docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md
exit_criteria: browser evidence FE sau 2xx + F5 jd_code/title; STATUS/REQUIRED visible when forced; picker from job-templates bindable only; PASS_TO_PM or FAIL residual
cấm: seed · API-only PASS · claim jd_dynamic_done
evidence_path: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md
```
