# P1-HRM-MENU-QA-RECRUITMENT-FIX — Dev-FE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-RECRUITMENT-FIX` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **parent_fail** | `docs/qa/evidence/p1-hrm-menu-recruitment-20260717.md` |
| **spec_ref** | P-CC-06 · J-HRM-05 · UF-HRM-12 · UC-HRM-22 |
| **ack_status** | **READY_FOR_QA** |

---

## Defects addressed

| ID | Fix summary | Files |
|----|-------------|-------|
| **D-HRM-REC-EVAL-STORM-429** | Root cause: `useCandidateEvaluations` recreated `fetchEvaluations` every render (`h` fn in deps) → infinite `GET /candidate-evaluations`. Fixed with React Query + `enabled` only on Evaluations tab; in-flight dedupe on `listCandidateEvaluations`; `isAbortLikeError` suppresses user toasts for abort/cancel. | `useCandidateEvaluations.ts`, `Recruitment.tsx`, `hrmApi.ts`, `apiError.ts` |
| **D-HRM-REC-PERM-GATE** | `PermissionGate` now mirrors `PermissionRoute`: portal embed bypasses empty HRM permission stub so Group CEO sees **Thêm yêu cầu** / **Sửa**. | `PermissionGate.tsx` |
| **D-HRM-REC-HC-UI-ZERO** | Đề xuất list uses `useHrmOperatingUnitFilter().listCompanyId` (rollup `main`) + React Query; `normalizeHeadcountProposalRows` parses `{ total, data }` envelope. | `HeadcountProposalTab.tsx` |
| **D-HRM-REC-MUTATE-UI** | Create flow uses `effectiveCompanyId`; refetch via query invalidation after POST; no longer blocked by eval storm / wrong company scope. | `HeadcountProposalTab.tsx` |

---

## Root-cause notes

### Evaluations storm (P0)

- `Recruitment.tsx` mounted `useCandidateEvaluations()` on every tab.
- Hook `useCallback` depended on inline `h()` translator → new callback each render → `useEffect` refetch loop → tens of parallel `GET …/candidate-evaluations` → **429** + AbortError toasts.

### Permission gate (P1)

- `usePermissions` returns `[]` (stub). `PermissionGate` only bypassed when `portalMode && !user`; portal CEO **has** user → buttons hidden.

### Headcount UI 0 vs API 8 (P1)

- List fetch used `currentCompanyId` without operating-unit rollup id; response rows not normalized defensively.

---

## Automated tests

```text
cd apps/web/hrm
pnpm test src/hooks/useCandidateEvaluations.test.ts src/lib/apiError.abort.test.ts
# exit 0 — 4 tests passed
```

---

## QA retest matrix (U65 · :8088)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · rollup «Tất cả đơn vị»

| Step | UF/J | PASS when |
|------|------|-----------|
| Login → Tuyển dụng | L0 | No ERROR banner; no `54321` |
| Dashboard + Ứng viên tabs | L2 | Network: **no** `candidate-evaluations` storm while off Evaluations tab |
| Yêu cầu tuyển dụng | J-HRM-05 | **Thêm yêu cầu** + row **Sửa** visible; create/edit → 2xx → F5 |
| Đề xuất | UF-HRM-12 | Stats cards + table rows match `GET headcount-proposals` total (was 8) |
| Tạo đề xuất | UF-HRM-12 mutate | Dialog → Lưu → POST 2xx → row in list → **F5** persists |
| Evaluations tab only | — | Single coalesced `GET candidate-evaluations`; no AbortError toast |
| Console | — | No «signal is aborted» / «Too many requests» on recruitment menu sweep |

**URL:** `http://14.225.217.232:8088/command-center/hrm/recruitment`

---

## Residual

- **D-HRM-REC-REQ-LATENCY** (~3.1s requisitions list) — BE/NFR wave; not in FE fix scope.
- Deploy FE bundle to `:8088` required before QA browser retest.

---

## Handoff

### completion_report

Closed FE fixes for P0 evaluations storm, portal PermissionGate, headcount list binding, and create refetch path. Unit tests pass locally. Deploy + QA U65 retest required on pilot.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-MENU-QA-RECRUITMENT
from_role: dev-fe | to_role: qa
entry_criteria: docs/qa/evidence/p1-hrm-menu-recruitment-fix-20260717.md READY_FOR_QA; FE deployed to :8088
exit_criteria: U65 browser retest on http://14.225.217.232:8088/command-center/hrm/recruitment — no eval storm; Thêm/Sửa visible; Đề xuất list matches API; Tạo đề xuất POST 2xx + F5; ack PASS_TO_PM or FAIL_TO_PM with evidence
UF/J: UF-HRM-12, J-HRM-05, P-CC-06
cấm: pnpm seed:*
evidence_path: docs/qa/evidence/p1-hrm-menu-recruitment-20260717.md (update verdict)
```

### evidence_path

`docs/qa/evidence/p1-hrm-menu-recruitment-fix-20260717.md`
