# Evidence — PO-E2E-SPINE-01-FE-REC-MOUNT

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-FE-REC-MOUNT` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **priority** | P0 |
| **change_mode** | FIX · preserve · CODE-MEMORY APPEND |
| **U65** | zero-seed — no `pnpm seed:*` |
| **ack_status** | **READY_FOR_QA** |
| **blocks** | R-PO-SPINE01-REC-MOUNT → HP-02 / UF-HRM-12 · J-REC-WF-02 |

## spec_read_ack

- QA fail: `docs/qa/evidence/po-e2e-spine-01-qa-w1.md` · residual **R-PO-SPINE01-REC-MOUNT**
- Page: `apps/web/hrm/src/pages/Recruitment.tsx` import `@/components/recruitment/JobTemplatesTab`
- SRS: `docs/hrm/SRS.md` §14 UC-HRM-30 / UC-HRM-RC-07 (Thư viện JD)
- Restore source: git stash commit `43c479a` (UTF-8 binary extract — not PowerShell `>` UTF-16)

## Root cause

```
Failed to resolve import "@/components/recruitment/JobTemplatesTab"
  from "src/pages/Recruitment.tsx"
```

→ Vite **500** → Lazy/Suspense whitescreen `/hr/recruitment` → hire-to-pay SP2 blocked.

## Fix (restore chain)

| Path | Source | Notes |
|------|--------|-------|
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` | `43c479a` | primary P0 |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | `43c479a` | shared state for jd-library + requisitions |
| `apps/web/hrm/src/lib/jobTemplatesPositionCode.test.ts` | `43c479a` | static SoT lock |
| `apps/web/hrm/src/components/recruitment/HireEmployeeLinkDialog.tsx` | `43c479a` | transitive eager import |
| `apps/web/hrm/src/components/recruitment/CandidatePipelineFunnel.tsx` | `43c479a` | transitive eager import |
| `apps/web/hrm/src/lib/recruitmentHireLink.ts` (+ `.test.ts`) | `43c479a` | next Vite miss after JT restore |

CODE-MEMORY APPEND on `JobTemplatesTab.tsx`, `useJobTemplates.ts`, `Recruitment.tsx` (work_item `PO-E2E-SPINE-01-FE-REC-MOUNT`).

**must_keep untouched:** leave / AUTH / EMP / CAT CLOSED lanes; no payroll blank fix (P1 out of WI).

## Verify

| Probe | Result |
|-------|--------|
| `GET :8080/hr/src/pages/Recruitment.tsx` | **200** |
| `GET :5173/hr/src/pages/Recruitment.tsx` | **200** |
| `GET :8080/hr/src/components/recruitment/JobTemplatesTab.tsx` | **200** `text/javascript` |
| `GET :5173/hr/src/components/recruitment/JobTemplatesTab.tsx` | **200** |
| `GET :8080/hr/recruitment` (HTML shell) | **200** |
| `GET :5173/hr/recruitment` (HTML shell) | **200** |
| vitest `jobTemplatesPositionCode` + `recruitmentHireLink` | **8/8 PASS** |
| Seed | none |

## Residual (not this WI)

| ID | Sev | Note |
|----|-----|------|
| R-PO-SPINE01-PAYROLL-BLANK | P1 | CC payroll pane blank — out of scope unless trivial (not touched) |
| R-PO-XBOS-DIST-MAIN | P2 | devops xbos dist race |

## Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
next_dispatch: PO-E2E-SPINE-01-QA-W2
evidence_path: docs/qa/evidence/po-e2e-spine-01-fe-rec-mount.md
```
