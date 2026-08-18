# D-HDSD-MUTATE-BE-03 — job-templates scope parity triage (QA R11)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-01 (ICT) |
| **Role** | dev-be |
| **work_item_id** | `D-HDSD-MUTATE-BE-03` |
| **Program** | `P-HDSD-ECOSYSTEM-03` · BF-03 |
| **Entry** | `qa-hdsd-mutate-ret-03-hrm-r11-20260801.md` — jdEnsure count=1 but YCTD create dialog `effectiveTemplates=[]` |
| **Policy** | U65 zero-seed · no BE mutation in triage |

---

## 1. Spec says vs code does

| Layer | Spec (SRS / ADR / API) | Code (hrm-api) | Match |
|-------|------------------------|----------------|-------|
| **List JD** | Group CEO `?company_id=main` → rollup `GROUP_MEMBER_SLUGS` (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §3.1) | `listJobDescriptionTemplates` → `resolveHrmListScope` + `pushCompanyIdFilter` → `company_id = ANY($n)` | **YES** |
| **Create JD** | Persist `main` → `holding` partition (TEXT tables) | `createJobDescriptionTemplate` → `resolveHrmPersistCompanyIdText` | **YES** |
| **Get-by-id / update / delete** | Same scope as list | `resolveHrmListScope` + `assertResourceInHrmScope` on peek | **YES** |
| **Response shape** | `{ total, data: rows[] }` in envelope `data` | Controller `ok(data)` · FE `res.data` (inner array) | **YES** |

**Implementation refs**

- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` — `listJobDescriptionTemplates` L1609–1646
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` — `GET job-templates` L434–448
- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — `resolveHrmListScope` · `resolveHrmPersistCompanyIdText`

---

## 2. QA evidence cross-check

| Artifact | GET `/api/hrm/recruitment/job-templates?company_id=main` | jd-library UI |
|----------|----------------------------------------------------------|---------------|
| `qa-hdsd-bf-01-canvas-01-20260801.md` | **200 · 1 row** | (YCTD blocked at form-ready — FE) |
| `qa-hdsd-mutate-ret-03-hrm-r11-20260801.md` | **200** · storm=1 during create dialog | tbody **count=1** (`jdEnsure`) |
| R11 root cause class | QA labels **dev-fe** — hook/parent state desync | Same row source = same GET endpoint |

**Conclusion:** When jd-library tbody shows a row, the list API **does** return data for `company_id=main` under group CEO JWT. R11 failure (`effectiveTemplates=[]` in create dialog) is **not** explained by BE returning `[]` while library tab shows rows — it is **FE state propagation** across three `useJobTemplates` instances (page / JobTemplatesTab / JobRequisitionsTab internal).

---

## 3. BE change in this WI

| Change | Rationale |
|--------|-----------|
| **ADD** `d-hdsd-mutate-be-03.spec.ts` (2 tests) | Regression guard: main list finds `holding` rows; create from `main` persists `holding` |
| **APPEND** `@CODE-MEMORY-CHANGE` on `recruitment-catalog.service.ts` | Traceability D-HDSD-MUTATE-BE-03 |
| **No SQL / resolver change** | Existing parity matches ADR; changing list filter would widen scope without defect proof |

---

## 4. Verification

```text
pnpm exec jest src/recruitment/d-hdsd-mutate-be-03.spec.ts --no-cache
→ PASS 2/2
```

Live probe deferred — hrm-api `:28001` down in dev-be session; prior QA L0 fe-be 8/8 + canvas evidence sufficient for triage.

---

## 5. Residual (not BE)

| ID | Owner | Action |
|----|-------|--------|
| R-QA-YCTD-TEMPLATES-EMPTY-R11 | **dev-fe** `D-HDSD-MUTATE-FE-14` | Unify template source: page refetch → parent prop → `handleOpenCreate` / `setDialogHydratedTemplates` before `isRequisitionCreateFormReady` |

---

## completion_report

**Closed:** BE triage for jd-library ↔ job-templates scope parity — spec matches code; jest regression added; **no BE bug fix required** for R11 symptom class.

**Open:** TC-HDSD-07-02-01 remains blocked on FE template hydration (FE-14).

## next_owner

**dev-fe** (`D-HDSD-MUTATE-FE-14`)

## next_dispatch_prompt

```
work_item_id: D-HDSD-MUTATE-FE-14
from_role: dev-be | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-be-03-20260801.md PASS_TO_PM — BE list/create scope parity confirmed; QA R11 jd-library row + GET 200 but JobRequisitionsTab effectiveTemplates=[] (3× useJobTemplates desync)
exit_criteria: TC-HDSD-07-02-01 hdsd-requisition-form-ready ≤22s → POST requisition 2xx + F5; preserve TC-HDSD-06-02-01 🟢 + TC-HDSD-08-02-01 🟢; evidence docs/qa/evidence/d-hdsd-mutate-fe-14-20260801.md READY_FOR_QA
read_first: d-hdsd-mutate-be-03-20260801.md, JobRequisitionsTab handleOpenCreate, Recruitment.tsx recruitmentJobTemplates, useJobTemplates refetch return type
spec_ref: UF-HRM-07 · UC-HRM-RC-07 · FR-HRM-RC-JD-01
allowed_paths: apps/web/hrm/src/pages/Recruitment.tsx, apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx, apps/web/hrm/src/hooks/useJobTemplates.ts, apps/web/hrm/src/lib/jobRequisitionUi.ts
change_mode: FIX
must_keep: TC-06 contract 🟢 · job-templates storm ≤1 · TC-08 leave 🟢
ack_status: READY_FOR_QA
pm_dispatch_hint: QA-HDSD-MUTATE-RET-03-HRM-R12 after READY; no BE re-dispatch unless live GET body proves [] with holding row in DB
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-be-03-20260801.md`

## ack_status

**PASS_TO_PM**
