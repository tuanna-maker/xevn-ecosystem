# Evidence — PO-HRM-REC-UV-YCTD-CMP-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-CMP-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **change_mode** | ADD · preserve_default · CODE-MEMORY APPEND |
| **date** | 2026-08-06 |
| **program** | `W-ALL-PARALLEL-01` |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-PLAN-01` |
| **u65** | zero-seed · no seed helpers |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · REC-03 OUT |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` v0.11 · **FR-UC-BP-REC-06b** Diễn biến **#1–#6** + Thành công · **AC-REC-CMP-01..05** |
| **tech_spec** | `docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md` §3 · **F-REC-CMP-01..02** |
| **db_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` — soft FK `requisition_id` · eval neo `application_id` · no dual FK · no CASCADE |
| **api_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` §7 · empty 200[] · `HRM-REC-CMP-MAX-N` · `HRM-REC-CMP-YCTD-MIX` · FORBIDDEN `job_postings` |
| **qa_plan** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md` §5.2 UF-REC-CMP-01..06 · **J-HRM-REC-CMP-01** |

---

## Closed scope

| AC / UF | FE behavior |
|---------|-------------|
| **AC-REC-CMP-01** / UF-01 | Picker label **YCTD / yêu cầu tuyển** — `listJobRequisitions({ receivable: true })` — **no** `job_postings` / `job_posting_id` |
| **AC-REC-CMP-02** / UF-02 | 0 YCTD → `hdsd-rec-compare-yctd-empty` + CTA copy (create/approve YCTD) |
| **AC-REC-CMP-03** / UF-03 | Chọn YCTD + 0 UV → `hdsd-rec-compare-uv-empty` «chưa có ứng viên trên yêu cầu này» |
| **AC-REC-CMP-04** / UF-04 | FE disable at N=4 + toast; Network `GET …/compare` surfaces **`HRM-REC-CMP-MAX-N`** |
| **AC-REC-CMP-05** / UF-05 | `eval_status: none` → badge **«Chưa đánh giá»** (`hdsd-rec-compare-uv-not-eval`); matrix from BE A1 when available |
| **UF-06 MIX** | Single-YCTD picker blocks mix UX; API **`HRM-REC-CMP-YCTD-MIX`** mapped in `apiError` |
| **J-HRM-REC-CMP-01** | Open path: Evaluations → `hdsd-rec-compare-open-btn` → dialog |

### Files touched (CMP lane — coordinated with FE-01)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/CandidateComparisonDialog.tsx` | Rewrite YCTD SoT + CMP-01/02 wire + empty/max-N/eval + testids |
| `apps/web/hrm/src/lib/candidateCompareUi.ts` (+ `.test.ts`) | Pure max-N / eval / normalize / radar |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `listRecruitmentApplicationsByYctd` · `getRecruitmentCompareMatrix` · receivable list normalize `data\|items` |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-REC-CMP-MAX-N` · `HRM-REC-CMP-YCTD-MIX` |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ test) | `recCompare*` ADD (keep FE-01 `candidateForm*` / EMP ids) |
| `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` | YCTD labels · empty · mix |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Open button testid only + CODE-MEMORY APPEND |
| `CandidateComparisonDialog.source.test.ts` | Source gate SoT |

**must_keep respected:** UV form / CandidatesTab owned by FE-01 — **not** overwritten.

---

## HDSD testids (QA harness)

| id | Purpose |
|----|---------|
| `hdsd-rec-compare-open-btn` | Open So sánh |
| `hdsd-rec-compare-dialog` | Dialog root |
| `hdsd-rec-compare-yctd-picker` | YCTD Select |
| `hdsd-rec-compare-yctd-empty` | 0 YCTD |
| `hdsd-rec-compare-uv-empty` | 0 UV on YCTD |
| `hdsd-rec-compare-uv-row` | Candidate row |
| `hdsd-rec-compare-uv-not-eval` | «Chưa đánh giá» |
| `hdsd-rec-compare-selected-count` | Selected N/4 |
| `hdsd-rec-compare-max-n-hint` | At max-N hint |
| `hdsd-rec-compare-matrix` | Matrix pane |

---

## Unit evidence

```text
pnpm exec vitest run \
  src/lib/candidateCompareUi.test.ts \
  src/lib/hdsdMutateTestIds.test.ts \
  src/components/recruitment/CandidateComparisonDialog.source.test.ts \
  src/lib/apiError.recruitment-interview.test.ts
→ Test Files 4 passed · Tests 11 passed
```

---

## Residual / depends

| ID | Note | Owner |
|----|------|-------|
| R-CMP-BE | Compare endpoints must land (`GET …/applications?requisition_id=` · `GET …/compare`) — FE wires contract; empty/error surfaces ready | **dev-be** `PO-HRM-REC-UV-YCTD-BE-01` |
| R-CMP-QA | Browser U65 execute UF-REC-CMP-01..06 + J-HRM-REC-CMP-01 — **no seed** | **qa** |
| DENIED | `recruitment_uat_ready` · seed · job_postings SoT · remaster claim | — |

---

## completion_report

Closed CMP-FE ADD: YCTD-only compare picker (no job_postings SoT); empty 0 YCTD / 0 UV; max-N=4 FE gate + BE error surface; «chưa đánh giá»; MIX error map; HDSD testids; CODE-MEMORY APPEND. Vitest 9/9 PASS. Did not touch UV create form (FE-01). Honesty flags false. READY_FOR_QA for browser J-HRM-REC-CMP-01 after BE compare endpoints available.

## next_owner

**qa** (after BE READY if compare routes not live yet — PM may sequence QA-02)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-UV-YCTD-QA-02
role: qa
lane: execution
u65: browser-only · zero-seed
entry: CMP-FE READY_FOR_QA @ docs/qa/evidence/po-hrm-rec-uv-yctd-cmp-fe-01.md
  + BE compare routes live (PO-HRM-REC-UV-YCTD-BE-01 READY preferred)
read: QA plan §5.2 UF-REC-CMP-01..06 · J-HRM-REC-CMP-01
persona: ceo@xe.vn / Xevn@2026
click: Tuyển dụng → Đánh giá → So sánh (hdsd-rec-compare-open-btn)
assert: YCTD picker only · empty paths · max-N · chưa đánh giá · no job_postings Network SoT
DENIED: seed · recruitment_uat_ready
evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-02.md
```

## ack_status

**READY_FOR_QA**
