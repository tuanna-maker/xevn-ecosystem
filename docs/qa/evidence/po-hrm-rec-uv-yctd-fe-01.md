# Evidence — PO-HRM-REC-UV-YCTD-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **change_mode** | ADD · `preserve_default: true` · `code_memory_mode: APPEND` |
| **date** | 2026-08-06 |
| **program** | `W-ALL-PARALLEL-01` |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-PLAN-01` |
| **peers** | BE-01 · CMP-FE-01 (parallel — this seat does **not** own compare UI) |
| **u65** | zero-seed · **DENIED** `recruitment_uat_ready` · **DENIED** free-text position SoT · **DENIED** `job_postings` UV SoT |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **v0.11** · **FR-UC-BP-REC-05a** Diễn biến **#1–#6** + Thành công · **AC-REC-UV-01..04** |
| **tech_spec** | `docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md` §2 **F-REC-UV-YCTD-01..05** · position contract `source:'yctd'` |
| **db_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` **CONFIRMED** — ONE physical `requisition_id` · position derived · no dual FK |
| **api_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` **CONFIRMED** — REQUIRED/STATUS/NOT-FOUND/MISMATCH · receivable `200 []` · no silent Lane B |
| **qa_plan** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md` · UF-REC-UV-01..08 · **J-HRM-REC-UV-01** |

**spec says / code does:**

| Spec | FE |
|------|-----|
| #1 YCTD required on form | SELECT `requisition_id` required on create; zod + disable Lưu |
| #2 empty receivable | Empty CTA + `onOpenYctdTab` · Lưu disabled |
| #3–#4 position derived | Read-only input from YCTD; **removed** free-text `position` SoT control |
| #5–#6 Lưu | Flat POST `requisition_id` + optional matching `position_key` — **no** nested invent |
| AC-02 F5 | List/detail columns YCTD + position from BE display-ready (spine merge) |
| AC-04 context | `?requisition_id=` / `recruitment_request_id=` prefill + auto-open create |

---

## Files touched (FE only)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/candidateUvYctdUi.ts` | NEW — receivable filter, derive position, create payload, merge display, URL parse |
| `apps/web/hrm/src/lib/candidateUvYctdUi.test.ts` | NEW — 8 unit cases |
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx` | YCTD SELECT + derived position + empty CTA + CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.source.test.ts` | NEW — wire asserts |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | merge YCTD · list cols · context URL · testids |
| `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` | YCTD + derived position display |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `receivable` query · display-ready types · create `position_key` |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-REC-UV-YCTD-*` · `POSITION-MISMATCH` VI |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ test) | `candidateCreateBtn` / `candidateForm*` / list hooks |

**FORBIDDEN kept:** `apps/api/**` · compare UI · seed · JobPostings as UV SoT · module UAT claim.

---

## Testids (QA harness)

| id | Purpose |
|----|---------|
| `hdsd-candidate-create-btn` | Thêm ứng viên |
| `hdsd-candidate-form-dialog` | Form shell |
| `hdsd-candidate-form-yctd` | YCTD SELECT |
| `hdsd-candidate-form-position` | Position derived (read-only) |
| `hdsd-candidate-form-empty-yctd` | Empty receivable CTA |
| `hdsd-candidate-form-open-yctd-cta` | Mở YCTD tab |
| `hdsd-candidate-form-submit` | Lưu |
| `hdsd-candidate-list-yctd` | List/detail YCTD cell |
| `hdsd-candidate-list-position` | List/detail position cell |

---

## Vitest

```text
pnpm exec vitest run src/lib/candidateUvYctdUi.test.ts \
  src/lib/hdsdMutateTestIds.test.ts \
  src/components/recruitment/CandidateFormDialog.source.test.ts
→ 3 files · 12 tests PASS
```

---

## UF map (for QA browser U65 — not executed this seat)

| UF | FE ready |
|----|----------|
| UF-REC-UV-01 | Form + YCTD SELECT + GET receivable |
| UF-REC-UV-02 | Empty CTA · submit disabled |
| UF-REC-UV-03 | Position read-only derived |
| UF-REC-UV-04 | Client REQUIRED + BE error surface |
| UF-REC-UV-05 / F5 | List YCTD+position after 2xx (needs BE display-ready) |
| UF-REC-UV-06 | No free-text SoT control |
| UF-REC-UV-07 | `?tab=candidates&requisition_id=` prefill |
| UF-REC-UV-08 | Picker source = requisitions receivable only |
| **J-HRM-REC-UV-01** | Click path mapped — browser execute = QA-01 |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-UV-YCTD-BE-DISPLAY | List/get must expose `requisition_id` + `position_key`/`position_name`/`yctd_title` for F5 AC-02 | **dev-be** BE-01 |
| R-UV-YCTD-BE-RECEIVABLE | `GET …/requisitions?receivable=true` filter | **dev-be** BE-01 (FE also filters client-side) |
| R-UV-YCTD-CMP-FE | Compare UI out of this seat | **dev-fe** CMP-FE-01 |
| R-UV-YCTD-QA-EXEC | Browser U65 | **qa** after BE+FE READY |

**Honesty:** `recruitment_uat_ready=false` · `jd_dynamic_done=false` · no seed · no module UAT claim.

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | FE ADD complete for Thêm UV gắn YCTD: required SELECT, position derived read-only (no free-text SoT), empty CTA, context `?requisition_id=` prefill, list/detail display-ready merge, flat create payload, error codes VI, HDSD testids, CODE-MEMORY APPEND, vitest **12/12 PASS**. Compare UI not touched. No apps/api. No seed. No UAT claim. |
| **next_owner** | **qa** (after BE-01 READY_FOR_QA) — or **pm** if BE still in-flight |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-rec-uv-yctd-fe-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-QA-01
role: qa
lane: execution
entry_criteria:
  - PO-HRM-REC-UV-YCTD-FE-01 READY_FOR_QA (this evidence)
  - PO-HRM-REC-UV-YCTD-BE-01 READY_FOR_QA (receivable + REQUIRED + display-ready)
  - L0 stack up; U65 zero-seed; persona ceo@xe.vn / Xevn@2026
exit_criteria:
  - Browser UF-REC-UV-01..08 + J-HRM-REC-UV-01
  - AC-REC-UV-01..04: YCTD required · F5 retain YCTD+position · no free-text SoT · context prefill
  - FE sau 2xx + F5; Network codes HRM-REC-UV-* when forced
  - DENIED: seed · recruitment_uat_ready · job_postings SoT
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md
```
