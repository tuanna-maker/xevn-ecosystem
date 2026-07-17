# P1-HRM-PROCESSES-FE-01 — Processes read-only (no fake CRUD toast)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-PROCESSES-FE-01` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **parent_evidence** | `docs/qa/evidence/p1-hrm-menu-processes-20260717.md` (GWC / PASS_TO_PM) |
| **spec_ref** | XBOS-DM-HRM-14 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 `processes` — *Workflow ref only (XBOS); UI read-only OK* |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · browser FE only for QA |

---

## Problem (closed)

Processes menu exposed Add / Edit / Delete UI while `useProcesses` mutations were empty stubs that still fired `toast.success` — list stayed empty. Radix view dialog also lacked `DialogDescription` (`aria-describedby` warning).

---

## Spec decision

Confirmed **read-only** (no BA CRUD expand before finish). Did **not** wire fake Nest CRUD. Removed mutation façade entirely.

---

## Fix

| Area | Change |
|------|--------|
| `apps/web/hrm/src/hooks/useProcesses.ts` | Query-only; removed `useMutation` + success toasts; exported `PROCESSES_READ_ONLY` + `PROCESSES_MUTATION_UNSUPPORTED_VI` |
| `apps/web/hrm/src/pages/Processes.tsx` | Removed Add/Edit/Delete + add/edit dialog + upload stub; empty state shows honest «chưa hỗ trợ» copy; view dialog keeps `DialogTitle` + `DialogDescription` (`processes-view-desc`) |
| `hooks/useProcesses.test.ts` | Asserts no toast/mutation in executable code; unsupported copy |
| `pages/Processes.readOnly.test.ts` | Asserts no stub actions; DialogTitle/Description present |

---

## Verification (dev-fe)

```bash
cd apps/web/hrm
pnpm exec vitest run src/hooks/useProcesses.test.ts src/pages/Processes.readOnly.test.ts
```

| Check | Result |
|-------|--------|
| vitest (4 tests) | **4/4 PASS** |
| Lint touched files | clean |

---

## QA retest (U65 browser)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → **Quy trình** (`/command-center/hrm/processes` or `/hr/processes`) | No **Thêm quy trình / Thêm quy định / Thêm mới** buttons |
| Empty state | «Chưa có quy trình nào» + notice containing **chưa hỗ trợ** / XBOS-DM-HRM-14 |
| Click path | No Edit/Delete; no success toast on any action |
| Console | No DialogContent missing DialogTitle / missing Description warning on view (if rows exist later) |
| F5 | Same read-only behavior |

**Residual:** List remains empty until catalog/API list contract exists — out of scope (read-only ref). CRUD only if BA expands XBOS-DM-HRM-14 + Nest contract.

---

## Handoff

```text
work_item_id: P1-HRM-PROCESSES-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/p1-hrm-processes-fe-01-20260717.md
completion_report: Processes made read-only per XBOS-DM-HRM-14 — removed Add/Edit/Delete stubs and fake success toasts; empty state shows chưa hỗ trợ; view DialogTitle+DialogDescription fixed; vitest 4/4 PASS.
next_owner: qa
next_dispatch_prompt: QA retest P1-HRM-PROCESSES-FE-01 on :8088 — ceo@xe.vn → Quy trình (U65 zero-seed). Assert no Thêm/Sửa/Xóa; empty state has chưa hỗ trợ / XBOS-DM-HRM-14; no fake success toast; no Radix DialogTitle/Description console warning. Update docs/qa/evidence/p1-hrm-processes-fe-01-20260717.md with browser verdict. spec_ref XBOS-DM-HRM-14.
```
