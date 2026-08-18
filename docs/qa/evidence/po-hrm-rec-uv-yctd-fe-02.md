# Evidence — PO-HRM-REC-UV-YCTD-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-FE-02` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **change_mode** | FIX · `preserve_default: true` · `code_memory_mode: APPEND` |
| **date** | 2026-08-06 |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-01` FAIL (`R-UV-YCTD-LANE-A-LIST-GAP`) |
| **u65** | zero-seed · **DENIED** `recruitment_uat_ready` · **DENIED** dual-write `public.candidates` · **DENIED** `job_postings` SoT |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **v0.11** · **FR-UC-BP-REC-05a** Thành công · **AC-REC-UV-02** (F5 list/detail vẫn thấy YCTD + vị trí derived) |
| **tech_spec** | `docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md` §2.5 **F-REC-UV-YCTD-05** |
| **db_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` — ONE physical `requisition_id` · BE create spine-only (no dual-write pool) |
| **api_design** | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` — GET list/get display-ready · POST create Lane A |
| **qa_fail** | `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01.md` §3 · UF-05 / UF-05-F5 / J-HRM-REC-UV-01 |

**spec says / code does:**

| Spec | FE (FE-02) |
|------|------------|
| AC-02 after POST + F5 show YCTD+position | Union spine-only rows into Candidates list SoT |
| BE must_keep no dual-write pool | FE does **not** invent POST to candidates-pool |
| FE-01 form gates | Untouched — YCTD SELECT + derived position + context prefill |

---

## Root cause closed

| ID | Fix |
|----|-----|
| **R-UV-YCTD-LANE-A-LIST-GAP** | `fetchCandidates`: pool enrich → **`unionSpineOnlyCandidatesIntoList`** so Lane A POST (spine-only) appears with `hdsd-candidate-list-yctd` / `hdsd-candidate-list-position` after save + F5 |

---

## Files touched (FE only)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/candidateUvYctdUi.ts` | `projectSpineCandidateToListRow` · `unionSpineOnlyCandidatesIntoList` · CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/candidateUvYctdUi.test.ts` | +4 union/dedupe cases |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | Wire union; spine stage display-only; hide pool-only edit/delete/pipeline for `list_lane=spine` |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.source.test.ts` | Assert union wire |
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.source.test.ts` | Assert tab still has union + FE-01 gates |

**FORBIDDEN kept:** `apps/api/**` · seed · dual-write · module UAT claim · regress FE-01 form.

---

## must_keep (FE-01 preserved)

- YCTD SELECT required on create
- Position read-only derived from YCTD
- Context `?requisition_id=` prefill
- Flat POST (no nested invent)
- HDSD list testids
- Pool mutate paths for pool rows
- No `job_postings` SoT · no `recruitment_uat_ready`

---

## Vitest

```text
pnpm exec vitest run src/lib/candidateUvYctdUi.test.ts \
  src/components/recruitment/CandidatesTab.source.test.ts \
  src/components/recruitment/CandidateFormDialog.source.test.ts
→ 3 files · 18 tests PASS
```

---

## UF map (QA retest — browser U65)

| Case | Expect after FE-02 |
|------|--------------------|
| **UF-REC-UV-05** | After POST 201 → list row shows YCTD + position cells (testids) |
| **UF-REC-UV-05-F5** | F5 / re-nav → same cells retained (**AC-REC-UV-02**) |
| **J-HRM-REC-UV-01** | Steps 8–10 list/F5 PASS |
| UF-01..04 / 06..08 | Regression — form gates unchanged |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-UV-YCTD-SPINE-POOL-MUTATE | Spine-only rows: stage/edit/delete/pipeline intentionally disabled (no dual-write pool) | product backlog / later spine mutate |
| R-UV-YCTD-QA-RETEST | Browser U65 retest QA-01 | **qa** |

**Honesty:** `recruitment_uat_ready=false` · `jd_dynamic_done=false` · no seed · no module UAT claim.

---

## Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | FIX R-UV-YCTD-LANE-A-LIST-GAP: Candidates list SoT = pool (YCTD merge) **∪** spine-only Lane A rows. After POST `/candidates` + F5, YCTD/position cells populate from BE display-ready. FE-01 form gates preserved. No dual-write. No apps/api. Vitest union/merge PASS. NOT recruitment_uat_ready. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-rec-uv-yctd-fe-02.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-REC-UV-YCTD-FE-02 READY_FOR_QA
u65: zero-seed · browser-only · cấm recruitment_uat_ready · cấm seed

entry_criteria:
- docs/qa/evidence/po-hrm-rec-uv-yctd-fe-02.md READY_FOR_QA
- BE-01 create + display-ready GET remain PASS

task:
- Retest UF-REC-UV-05: after Lane A POST 201, list cells hdsd-candidate-list-yctd + hdsd-candidate-list-position show YCTD + position
- Retest UF-REC-UV-05-F5 + AC-REC-UV-02: F5 retains YCTD+position
- Retest J-HRM-REC-UV-01 steps 8–10
- Regression smoke UF-01/03/04/06/07 (form gates unchanged)
- Process gate: no Uncaught / mojibake / DnD storm

exit_criteria:
- PASS_TO_PM or FAIL_TO_PM with evidence update on po-hrm-rec-uv-yctd-qa-01.md
- honesty: recruitment_uat_ready=false
```
